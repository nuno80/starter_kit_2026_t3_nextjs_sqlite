---

# ⚡ Performance

### P1. Delay artificiale di 100-500ms su OGNI chiamata tRPC

Il collo di bottiglia numero uno in sviluppo, moltiplicato per ogni query. E il `console.log` gira anche in produzione, su ogni richiesta.

**`src/server/api/trpc.ts`**

```ts
const timingMiddleware = t.middleware(async ({ next, path }) => {
  if (!t._config.isDev) return next();          // zero overhead in prod
  const start = Date.now();
  const result = await next();
  console.log(`[TRPC] ${path} ${Date.now() - start}ms`);
  return result;
});
```

(Se vuoi tenere il delay per stanare i waterfall, mettilo dietro `process.env.TRPC_ARTIFICIAL_DELAY`.)

### P2. Tre query al DB prima di eseguire qualsiasi cosa

`createTRPCContext` → `auth.api.getSession()` (session + user), poi `adminProcedure` → un'altra `findFirst` su user. Il fix del punto 4 elimina la query duplicata; `session.cookieCache` (punto 5) elimina il round-trip di `getSession` per 5 minuti. Da 3 query a ~0 sul percorso caldo.

### P3. Indici mancanti sugli `ORDER BY`

`post.getAll` ordina per `createdAt desc`, `admin.getUsers` idem, ma non esiste un indice su quelle colonne. Ci sono indici su `createdById` e `name`, cioè proprio quelli che non usi.

**`src/server/db/schema.ts`**

```ts
(t) => [
  index("created_by_idx").on(t.createdById),
  index("post_created_at_idx").on(t.createdAt),   // ← nuovo
],
// e sulla tabella user:
(t) => [index("user_created_at_idx").on(t.createdAt)],
```

### P4. SQLite senza WAL

Senza `journal_mode=WAL` ogni scrittura blocca tutte le letture e sotto concorrenza prendi `SQLITE_BUSY`. Già coperto dal fix al punto 6: WAL + `busy_timeout` + `synchronous=NORMAL` è la differenza tra un giocattolo e qualcosa che regge traffico reale.

### P5. Waterfall in `src/app/posts/page.tsx`

```ts
const hello = await api.post.hello({ text: "from tRPC" });  // round trip inutile
const session = await getSession();                          // in serie
```

Due await sequenziali, e nessun prefetch: `LatestPost` ricomincia da zero dopo l'idratazione (spinner visibile). Hai `HydrateClient` in `src/trpc/server.ts` e non lo usi mai.

```tsx
import { api, HydrateClient } from "~/trpc/server";

export default async function PostsPage() {
  const session = await getSession();
  if (session?.user) void api.post.getAll.prefetch();   // parte in parallelo

  return (
    <HydrateClient>
      {/* ...la pagina... */}
    </HydrateClient>
  );
}
```

E togli del tutto `post.hello`: è una chiamata di rete solo per stampare una stringa.

### P6. L'i18n rende client-side l'intera app

`I18nProvider` è `"use client"` e in `layout.tsx` avvolge **tutto**, quindi `landing-sections.tsx` (17,7 KB) finisce nel bundle client insieme ai dizionari IT **e** EN (9,5 KB, entrambi, sempre). In più il gate `mounted` fa renderizzare prima uno scheletro della navbar → flash + layout shift a ogni caricamento.

Fix minimo: sposta i dizionari fuori dal componente e caricali su richiesta.

```ts
// src/i18n/it.ts, src/i18n/en.ts  → un file per lingua
const loaders = {
  it: () => import("~/i18n/it").then((m) => m.default),
  en: () => import("~/i18n/en").then((m) => m.default),
};
```

Fix corretto: lingua da cookie letta lato server nel layout, dizionario passato come prop, e le sezioni della landing restano Server Components. Dimezzi il JS della home.

### P7. Doppio fetch della sessione a ogni page load

`Navbar` chiama `authClient.useSession()` → una `GET /api/auth/get-session` dal browser, mentre il server ha già la sessione in `getSession()`. Passa la sessione iniziale dal layout RSC e usala come `initialData` (o affidati al `cookieCache`), così elimini un round trip su ogni navigazione.

### P8. `await import()` dentro gli handler

`post.update` e `post.delete` fanno `await import("drizzle-orm")` e `await import("@trpc/server")` a runtime, dentro la mutation, anche 4 volte per chiamata. Sono già dipendenze statiche del file: spostali in cima.

### P9. Font senza `display: swap`

`layout.tsx` carica Fraunces e Instrument Sans senza strategia di display → blocco del rendering del testo.

```ts
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
```

### P10. `updateUserRole` non invalida la lista

In `admin-dashboard/client.tsx` la mutation `updateUserRole` fa solo `setErrorMsg(null)` in `onSuccess`, senza `refetchUsers()`. La tabella resta desincronizzata finché non ricarichi. Aggiungi `await refetchUsers()`.

---

# 🐛 Bonus: bug silenzioso nelle migration

**`drizzle.config.ts`**

```ts
tablesFilter: ["bnb_*"],
```

Le tue tabelle si chiamano `post`, `user`, `account`, `session`, `role`, `verification`. Nessuna comincia per `bnb_`, quindi `drizzle-kit generate/push` **filtra via tutto** e le migration girano a vuoto. Rimuovi la riga (o rinomina le tabelle con il prefisso, ma la prima è più sensata).

---

## Da dove partirei

1. **`BETTER_AUTH_SECRET` obbligatorio** + rate limit su `/sign-in/email` — 10 minuti, chiudono i due buchi peggiori.
2. **Refactor di `protectedProcedure`** (ruolo dal DB + ban check) — sistema privilegi stale e ban bypass in un colpo, e toglie una query.
3. **Pragma SQLite (WAL + foreign_keys)** — una riga, effetto enorme su integrità e throughput.
4. **Elimina il delay artificiale** — il tuo dev loop ringrazia subito.
5. **`tablesFilter`** — perché in questo momento le tue migration mentono.

Se vuoi, ti apro una lista in ClickUp con questi come task, uno per fix, ordinati per severità.
