I'll dig into that repo now.
Analizzato tutto il repo (`src/server`, `src/app`, config, schema). Ci sono un paio di cose serie e parecchia latenza gratuita. Ecco l'audit, Nuno.

---

# 🔴 Sicurezza — critici

### 1. `BETTER_AUTH_SECRET` opzionale fuori da production

`src/env.js` lo rende `optional()` in dev/test, e `.env.example` lo lascia vuoto (con `emptyStringAsUndefined: true` diventa `undefined`). Better Auth ripiega su un segreto di fallback: sessioni firmate con una chiave prevedibile. Se qualcuno builda con `NODE_ENV=test` o con `SKIP_ENV_VALIDATION`, va in prod così.

**`src/env.js`**

```js
BETTER_AUTH_SECRET: z.string().min(32, "Genera con: openssl rand -base64 32"),
```

### 2. Google OAuth con credenziali finte come default

```js
BETTER_AUTH_GOOGLE_CLIENT_ID: z.string().default("mock_id"),
BETTER_AUTH_GOOGLE_CLIENT_SECRET: z.string().default("mock_secret"),
```

Il provider viene registrato comunque: endpoint OAuth attivo e rotto in produzione. Togli i default e registra i provider solo se configurati.

**`src/server/better-auth/config.ts`**

```ts
const socialProviders: Record<string, unknown> = {};

if (env.BETTER_AUTH_GITHUB_CLIENT_ID && env.BETTER_AUTH_GITHUB_CLIENT_SECRET) {
  socialProviders.github = {
    clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID,
    clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
    redirectURI: `${env.BETTER_AUTH_URL}/api/auth/callback/github`,
  };
}
if (env.BETTER_AUTH_GOOGLE_CLIENT_ID && env.BETTER_AUTH_GOOGLE_CLIENT_SECRET) {
  socialProviders.google = { /* idem */ };
}
```

### 3. Autorizzazione basata sul ruolo *nella sessione* (ruolo stale)

`src/server/api/routers/post.ts` (update e delete) fa:

```ts
isAdmin((ctx.session.user as { role?: string }).role)
```

Il ruolo arriva dal token di sessione, non dal DB. Revochi l'admin a un utente → resta admin finché la sessione non scade. Stesso pattern in `navbar.tsx` (lì è solo cosmetico, ma il backend no). `adminProcedure` invece legge dal DB: incoerenza pericolosa.

### 4. Utenti bannati passano comunque

Lo schema ha `banned` / `banExpires`, ma `protectedProcedure` non li controlla mai. Il plugin admin di Better Auth blocca solo i *suoi* endpoint: tutte le tue procedure tRPC restano aperte a un utente bannato.

**Fix 3 + 4 + una query in meno — `src/server/api/trpc.ts`** (sostituisci il blocco procedure):

```ts
export const hasRole = (role: string | null | undefined, target: string) =>
  role ? role.split(",").map((r) => r.trim()).includes(target) : false;

export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(async ({ ctx, next }) => {
    if (!ctx.session?.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    const dbUser = await ctx.db.query.user.findFirst({
      where: eq(user.id, ctx.session.user.id),
      columns: { id: true, role: true, banned: true, banExpires: true },
    });

    if (!dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });

    const banActive =
      dbUser.banned && (!dbUser.banExpires || dbUser.banExpires > new Date());
    if (banActive) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Account sospeso." });
    }

    return next({
      ctx: {
        session: { ...ctx.session, user: ctx.session.user },
        dbUser,
        isAdmin: hasRole(dbUser.role, "admin"),
      },
    });
  });

// niente più query extra: adminProcedure riusa quella di sopra
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.isAdmin) throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});
```

Poi in `post.ts` sostituisci ogni `isAdmin((ctx.session.user as ...).role)` con `ctx.isAdmin` e cancella gli helper locali duplicati.

### 5. Zero rate limiting su login e registrazione

`AuthForm` chiama `signIn.email` senza alcun throttle. Credential stuffing gratis. Nessuna policy password (default 8 caratteri), nessuna verifica email.

**`src/server/better-auth/config.ts`**

```ts
export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.BETTER_AUTH_URL],
  database: drizzleAdapter(db, { provider: "sqlite" }),
  plugins: [admin()],

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    requireEmailVerification: true,
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 60,
    customRules: {
      "/sign-in/email":  { window: 300,  max: 5 },
      "/sign-up/email":  { window: 3600, max: 3 },
      "/forget-password":{ window: 3600, max: 3 },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 }, // ← anche +perf, vedi P2
  },

  advanced: {
    useSecureCookies: env.NODE_ENV === "production",
    defaultCookieAttributes: { httpOnly: true, sameSite: "lax" },
  },

  socialProviders,
});
```

### 6. Foreign key **non applicate** (SQLite le ha off di default)

Lo schema dichiara `.references(() => user.id)` su `post`, `account`, `session`, ma SQLite ignora i vincoli finché non attivi il pragma **per connessione**. Cancelli un utente → post, account e sessioni orfane restano lì. Manca anche `onDelete`.

**`src/server/db/index.ts`**

```ts
export const client =
  globalForDb.client ?? createClient({ url: env.DATABASE_URL });

if (!globalForDb.client) {
  void client.executeMultiple(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
    PRAGMA synchronous = NORMAL;
  `);
}
if (env.NODE_ENV !== "production") globalForDb.client = client;
```

**`src/server/db/schema.ts`** — aggiungi la cascata:

```ts
createdById: d.text({ length: 255 }).notNull()
  .references(() => user.id, { onDelete: "cascade" }),
```

(stesso trattamento su `account.userId` e `session.userId`)

---

# 🟠 Sicurezza — medi

### 7. Ruoli arbitrari senza whitelist

`admin.updateUserRole` e `assignRoleByEmail` accettano `z.string()` puro. Un admin può scrivere qualsiasi stringa nel campo `role`, e siccome `isAdmin` fa `split(",")`, il valore `"editor,admin"` concede l'admin senza che la UI lo mostri. Nessuna validazione contro il catalogo `role`.

**`src/server/api/routers/admin.ts`**

```ts
const RoleName = z.string().regex(/^[a-z][a-z0-9_-]{1,31}$/, "Nome ruolo non valido");

const assertRolesExist = async (ctx: Ctx, value: string) => {
  const names = value.split(",").map((r) => r.trim()).filter(Boolean);
  if (names.length === 0) throw new TRPCError({ code: "BAD_REQUEST" });

  const catalog = await ctx.db.query.role.findMany({ columns: { name: true } });
  const allowed = new Set([...catalog.map((r) => r.name), "admin", "user"]);

  for (const n of names) {
    if (!allowed.has(n)) {
      throw new TRPCError({ code: "BAD_REQUEST", message: `Ruolo sconosciuto: ${n}` });
    }
  }
  return names.join(",");
};
```

Chiamalo in entrambe le mutation prima dell'`update`. Applica `RoleName` anche a `createRole.name` (oggi accetta `min(1)`, quindi spazi, virgole e unicode arbitrario).

### 8. `getUsers` restituisce l'intera riga utente, senza limiti

```ts
return ctx.db.query.user.findMany({ orderBy: ... });
```

Espone `banReason`, `emailVerified`, tutte le email, tutto. E scarica l'intera tabella a ogni apertura della dashboard.

```ts
getUsers: adminProcedure
  .input(z.object({ limit: z.number().min(1).max(100).default(50),
                    cursor: z.number().optional() }).optional())
  .query(async ({ ctx, input }) =>
    ctx.db.query.user.findMany({
      columns: { id: true, name: true, email: true, role: true, banned: true, createdAt: true },
      orderBy: (u, { desc }) => [desc(u.createdAt)],
      limit: input?.limit ?? 50,
      offset: input?.cursor ?? 0,
    }),
  ),
```

### 9. Nessun security header

`next.config.js` è vuoto. Niente CSP, clickjacking aperto, nessun HSTS.

```js
const config = {
  turbopack: { root: import.meta.dirname },
  poweredByHeader: false,
  images: { remotePatterns: [
    { protocol: "https", hostname: "avatars.githubusercontent.com" },
    { protocol: "https", hostname: "lh3.googleusercontent.com" },
  ]},
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { key: "Content-Security-Policy", value: [
            "default-src 'self'",
            "img-src 'self' data: https:",
            "script-src 'self' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline'",
            "font-src 'self' data:",
            "connect-src 'self'",
            "frame-ancestors 'none'",
          ].join("; ") },
      ],
    }];
  },
};
```

### 10. `deleteRole` lascia utenti con ruoli fantasma

Cancelli `editor` dal catalogo, ma gli utenti con `role="editor"` restano così: la `<Select>` della dashboard mostra un valore fuori lista e il ruolo diventa non riassegnabile. Prima del delete, esegui `UPDATE user SET role='user' WHERE role=?` (o blocca il delete se ci sono utenti assegnati).

### 11. Avatar remoti con `<img>` grezzo

`navbar.tsx` e `user-profile.tsx` iniettano `user.image` (URL controllato dal provider OAuth) in un `<img>` non ottimizzato. Passa a `next/image` con i `remotePatterns` sopra: chiudi il leak di referrer e guadagni ottimizzazione.
