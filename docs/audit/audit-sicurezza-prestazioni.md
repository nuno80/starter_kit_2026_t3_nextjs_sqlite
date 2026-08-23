# Audit Sicurezza & Prestazioni — Starter Kit T3 SQLite

Data: 2026-08-23 · Scope: `src/`, config, storico git, repo remoto `nuno80/starter_kit_2026_t3_nextjs_sqlite`

---

## PARTE 1 — Audit di Sicurezza

### 🔴 S1 (CRITICO) — Database con dati reali e token OAuth nella storia git di un repo PUBBLICO

**Cosa succede, in parole semplici.**
I file `db.sqlite-wal` (il "diario" del database) sono stati committati più volte
(l'ultima nel commit `8014a41`, poi rimossi dal tracking). Il repo su GitHub è
**pubblico**: chiunque può scaricare quei vecchi commit e leggerne il contenuto.
Dentro ci sono:

- email reali di utenti (`nuno.80.al@gmail.com`, `testpythonemail53@gmail.com`, …)
- **token di accesso Google OAuth** (`ya29.…`) e ID token JWT completi
- PKCE `codeVerifier` e stati OAuth
- nomi, ID utente, ruoli (incluso chi è admin)

I token OAuth sono ormai scaduti (durano ~1 ora), quindi il rischio di accesso
diretto agli account Google è basso oggi; ma le email e i dati personali restano
esposti per sempre finché la storia non viene riscritta o il repo reso privato.

**Rischio:** alto (esposizione dati personali + credenziali in storia pubblica).
**Come si mitiga:** vedi PIANO-1 (rotazione + riscrittura storia o repo privato).

---

### 🟢 Cosa è già fatto bene (nessun intervento richiesto)

| Area | Stato | Perché è sicuro |
|---|---|---|
| SQL Injection | ✅ Protetto | Tutte le query passano da Drizzle ORM, che usa parametri preparati. Nessuna query SQL costruita con stringhe concatenate. |
| XSS | ✅ Protetto | Nessun `dangerouslySetInnerHTML` in tutto il codice; React esegue l'escaping automatico di ogni valore renderizzato. |
| CSRF su tRPC | ✅ Protetto | Better-Auth valida l'header `Origin` sulle mutazioni; il client tRPC gira sulla stessa origine. |
| Webhook Stripe | ✅ Protetto | `stripe.webhooks.constructEvent` verifica la firma `stripe-signature` prima di toccare il DB; senza `STRIPE_WEBHOOK_SECRET` rifiuta tutto (500). Lo stato del pagamento è deciso **solo** dal webhook, mai dal redirect del browser (come da CONTEXT.md). |
| Prezzi/importi | ✅ Protetto | Il client invia solo chiavi (`basic`, `pro`, `monthly`, `yearly`); i Price ID reali vivono in env vars lato server (`src/server/stripe/catalog.ts`). Il client non può mai scegliere un prezzo. |
| Autorizzazione | ✅ Protetto | `protectedProcedure`/`adminProcedure` in `src/server/api/trpc.ts`; ownership dei post verificata lato server; la pagina admin ricontrolla il ruolo anche sul DB. |
| Password | ✅ Protetto | Min 12 caratteri, hash gestito da Better-Auth (scrypt), rate-limit su sign-in/sign-up/reset (5/min). |
| Verifica email | ✅ Protetto | `requireEmailVerification: true`; in produzione `RESEND_API_KEY` e `EMAIL_FROM` sono obbligatori (validati in `src/env.js`). |
| Ruoli admin | ✅ Protetto | Un admin non può declassarsi o bannarsi da solo (check in `assignRoleByEmail`, `updateUserRole`, `banUser`). |
| Segreti | ✅ Protetto | `.env` è gitignored e **non è mai stato committato** (verificato su tutta la storia). Nessun `NEXT_PUBLIC_*` contenente segreti. |
| Header HTTP | ✅ Parziale | `X-Frame-Options: DENY`, `nosniff`, HSTS, `frame-ancestors 'none'` già in `next.config.js`. |

---

### 🟡 S2 (MEDIO) — Il BAN non è immediato: fino a ~5 minuti di ritardo

**Cosa succede.** Quando un admin banna un utente, le sessioni vengono cancellate
dal DB, ma Better-Auth ha una cache del cookie (`cookieCache`, 5 minuti):
l'utente bannato può continuare a operare fino alla scadenza della cache.
È già documentato nel codice con un commento `ponytail:` — è una scelta
consapevole, ma per un ban di sicurezza 5 minuti sono troppi.

**Rischio:** medio (finestra di abuso dopo un ban).
**Mitigazione:** PIANO-2.

### 🟡 S3 (MEDIO) — `unbanUser` ingoia gli errori silenziosamente

In `src/server/api/routers/admin.ts`, il blocco `try { auth.api.unbanUser(...) }
catch (e) { /* ignore */ }` nasconde qualsiasi fallimento: se la chiamata al
plugin fallisce, l'admin riceve "success" senza saperlo. Mai silenziare errori
su un percorso di sicurezza.

**Mitigazione:** PIANO-2 (stesso PR del ban immediato, stesso file).

### 🟡 S4 (BASSO/MEDIO) — Ruoli assegnabili senza validazione sul catalogo

`assignRoleByEmail` e `updateUserRole` accettano qualsiasi stringa come ruolo
(es. `"superadmin"` o `"admin,editor"`). Non è un'escalation (solo gli admin
possono chiamarle), ma permette stati incoerenti rispetto al catalogo `role`.

**Mitigazione:** PIANO-3.

### 🟢 S5 (BASSO) — Note minori, nessuna azione obbligatoria

- **CSP minima**: la Content-Security-Policy attuale è solo `frame-ancestors 'none'`.
  Una CSP completa (`default-src 'self'` + allowlist script/style) ridurrebbe il
  danno in caso di XSS futuro. Con Next.js + inline styles/scripts richiede lavoro;
  rimandata (PIANO-3, opzionale).
- **Client Stripe "mock"**: se `STRIPE_SECRET_KEY` manca in produzione, il client
  viene creato con `sk_test_mock` e le chiamate falliscono a runtime con errore
  poco chiaro. Accettabile per uno starter kit (già loggato a console).
- **`deleteRole` e ruoli compositi**: già documentato con `ponytail:` — gli utenti
  con ruoli multipli (es. `"editor,admin"`) non vengono aggiornati. Debito noto,
  non ripianificato.

---

## PARTE 2 — Colli di Bottiglia Prestazionali

### 🟡 P1 — La landing page è `force-dynamic` ma è contenuto statico

**Cosa succede.** `src/app/page.tsx` dichiara `export const dynamic =
"force-dynamic"`: ogni visita alla home forza un render completo lato server,
anche se la pagina non legge né DB né sessione. È contenuto puro (testi + CSS).

**Impatto:** TTFB più alto e CPU sprecata su ogni richiesta alla pagina più
visitata del sito.
**Guadagno atteso:** rendendola statica (ISR/SSG), la home viene servita dalla
cache di Next/CDN: tempo di risposta da ~50–200 ms a ~1–10 ms, zero lavoro del
server. PIANO-4.

### 🟡 P2 — I PRAGMA di SQLite partono in ritardo (race condition)

**Cosa succede.** In `src/server/db/index.ts` i PRAGMA (`foreign_keys=ON`,
`journal_mode=WAL`, `busy_timeout`, `synchronous=NORMAL`) vengono eseguiti con
`executeMultiple(...)` **senza await** ("fire and forget"). Le prime query
possono partire *prima* che i PRAGMA siano applicati:

- `foreign_keys = ON` potrebbe non essere attivo sulle prime scritture → i vincoli
  di integrità referenziale non vengono rispettati (anche problema di sicurezza
  dei dati);
- senza WAL le scritture concorrenti si bloccano a vicenda.

**Impatto:** correttezza a rischio all'avvio + scritture più lente finché WAL
non è attivo.
**Guadagno atteso:** PRAGMA garantiti prima di ogni query; scritture concorrenti
fino a ~10× più veloci in WAL mode rispetto al journal di default. PIANO-4.

### 🟢 P3 — Pagina admin: doppia lettura del ruolo

`src/app/admin-dashboard/page.tsx` chiama `getSession()` e poi fa **un'altra**
query DB per rileggere il ruolo dell'utente. Il plugin admin di Better-Auth
espone già `role` sulla sessione (il codice infatti lo usa come fallback).
Una query DB in meno per ogni visita alla pagina admin. Minore, dentro PIANO-4.

### 🟢 P4 — Già ok, nessun intervento

- `post.getAll` ha già `limit: 20` e indici su `createdAt`/`createdById`. ✅
- `getUsers` ha già `limit` (max 100) e proiezione colonne. ✅
- Indici presenti su tutte le FK e colonne di ricerca. ✅
- Client DB/Stripe cachati in `globalThis` in dev (niente ricreazione a ogni HMR). ✅
- `staleTime: 30s` su TanStack Query + prefetch RSC su `/posts` (niente doppio fetch). ✅
- Service worker: `/api/trpc` e `/admin-dashboard` sono `NetworkOnly` (niente dati
  autenticati in cache). ✅
- Tutti gli `useEffect` con timer/listener hanno cleanup (nessun memory leak). ✅
- `spawnSync("git")` nella route Serwist gira solo a build, non a runtime. ✅

---

## PARTE 3 — Piani di Azione Atomici

> Regola: **un piano = una PR**. Non mischiare sicurezza, prestazioni e cleanup.

### PIANO-1 · 🔴 Sicurezza — Bonifica storia git + rotazione credenziali
**Priorità: immediata. Non richiede modifiche al codice.**

1. **Subito**: revocare/ruotare tutto ciò che potrebbe essere ancora valido:
   - rigenerare `BETTER_AUTH_SECRET` (invalida le sessioni esistenti → gli utenti rifanno login, è previsto);
   - nella Google Cloud Console, revocare i token OAuth dell'app / ruotare il client secret Google se il repo è stato pubblico a lungo;
   - ruotare `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` (costa zero dal dashboard Stripe).
2. **Scegliere una delle due opzioni** (vedi "Decisione richiesta" in fondo):
   - **Opzione A (consigliata, più semplice)**:. La storia resta ma non è più scaricabile da estranei.
   - **Opzione B**: riscrivere la storia con `git filter-repo --invert-paths`
     sui blob `*.sqlite*` già rimossi dal tracking, poi `git push --force`.
     Rompe i clone esistenti e richiede coordinamento.
3. Verifica: `git rev-list --all --objects | grep sqlite` deve restituire zero
   blob (opzione B) oppure repo privato (opzione A).

**File toccati:** nessuno (solo git/config). **Breaking:** solo opzione B (force-push).

---

### PIANO-2 · 🟡 Sicurezza — Ban immediato + gestione errori unban
**Priorità: alta. PR piccola, un solo file: `src/server/api/routers/admin.ts`.**

1. In `banUser`: passare `ctx.headers` a `auth.api.banUser` (o usare
   `auth.api.revokeSession` sul token dell'utente) così Better-Auth invalida la
   cache e il ban è effettivo subito, eliminando la finestra di 5 minuti.
2. In `unbanUser`: rimuovere il `catch` vuoto → loggare l'errore e propagarlo
   come `TRPCError({ code: "INTERNAL_SERVER_ERROR" })` se il plugin fallisce,
   invece di restituire `success`.
3. Test: estendere `tests/e2e.spec.ts` (pattern già esistente con DB sqlite
   temporaneo) — dopo `banUser`, una chiamata con la sessione dell'utente bannato
   deve restituire FORBIDDEN immediatamente.

**Breaking:** nessuno. **Rischio:** basso.

---

### PIANO-3 · 🟢 Sicurezza — Validazione ruoli (hardening)
**Priorità: bassa. PR piccola: `src/server/api/routers/admin.ts`.**

1. In `assignRoleByEmail` e `updateUserRole`: validare che ogni ruolo contenuto
   nella stringa (split su `,`, riusando la logica di `~/lib/roles`) esista nel
   catalogo `role` oppure sia `admin`/`user`; altrimenti `BAD_REQUEST`.
2. Test: caso e2e con ruolo inventato → errore atteso.

**Breaking:** nessuno (l'UI admin propone già solo ruoli del catalogo).

---

### PIANO-4 · 🟡 Prestazioni — Home statica + PRAGMA affidabili
**Priorità: media. PR con 2 fix indipendenti ma entrambi "performance".**

1. `src/app/page.tsx`: rimuovere `export const dynamic = "force-dynamic"`
   (la landing non legge DB/sessione → Next la rende statica a build).
   Verificare che `next build` la marchi come `○ Static`.
2. `src/server/db/index.ts`: eseguire i PRAGMA in modo affidabile prima delle
   query. Soluzione minima: il client libsql supporta `PRAGMA` nella URL —
   passare a `createClient({ url, ... })` con pragmas in init, oppure await
   dell'`executeMultiple` dentro un `initDb()` chiamato prima di esporre `db`.
   Scegliere l'approccio più piccolo che garantisce l'ordine.
3. `src/app/admin-dashboard/page.tsx`: eliminare la query DB ridondante del
   ruolo, usando `session.user.role` (plugin admin) come unica fonte.
4. Test: `pnpm build` (home statica), test e2e esistenti verdi, verifica manuale
   `sqlite3 db.sqlite "PRAGMA journal_mode"` → `wal`.

**Breaking:** nessuno. **Guadagno:** home servita da cache (TTFB ~ms),
integrità referenziale garantita dal primo avvio, 1 query DB in meno in admin.

---

## Decisione richiesta all'utente (blocca solo il PIANO-1, punto 2)

Il repo GitHub `nuno80/starter_kit_2026_t3_nextjs_sqlite` è **pubblico** e la
storia contiene i blob del database. Preferisci:

- **A)** renderlo privato (zero rischi, zero force-push), oppure
- **B)** riscrivere la storia e mantenerlo pubblico?

I piani 2–4 non dipendono da questa scelta e possono partire subito.
