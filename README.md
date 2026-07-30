# Nuno Starter SQlite (Better-Auth + Drizzle + tRPC)

Uno starter kit moderno e altamente performante basato sullo [T3 Stack](https://create.t3.gg/), configurato per la massima velocità di sviluppo, type-safety end-to-end e semplicità di avvio con database SQLite locale e autenticazione moderna.

## 🚀 Tech Stack & Configurazione

Questo starter kit è preconfigurato e pronto all'uso con le migliori tecnologie moderne:

- **Framework Web**: [Next.js 15](https://nextjs.org/) (App Router, Turbopack abilitato di default)
- **Database & ORM**: [Drizzle ORM](https://orm.drizzle.team/) + [SQLite / LibSQL](https://turso.tech/libsql) (file `db.sqlite` locale per sviluppo istantaneo senza container o setup esterni)
- **Autenticazione**: [Better-Auth](https://better-auth.com/) preconfigurato con:
  - Autenticazione con Email & Password
  - Social Login (GitHub & Google) pronti per l'uso
  - Dashboard utente integrata e form di accesso minimal
- **PWA (Progressive Web App)**: Installabile con shell offline generata da Serwist per Next.js 16 / Turbopack. Include meccanismo di aggiornamento client-side manuale.
- **API & State Management**: [tRPC 11](https://trpc.io/) + [TanStack React Query v5](https://tanstack.com/query) per type-safety perfetta tra client e server
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) per design moderno e responsive
- **Validazione & Utility**: [Zod](https://zod.dev/) per la validazione degli schemi e la gestione sicura delle variabili d'ambiente (`@t3-oss/env-nextjs`)

## ⚡ Guida Rapida / Quick Start

### 1. Installazione delle dipendenze

Il progetto è ottimizzato per **pnpm**:

```bash
pnpm install
```

### 2. Variabili d'Ambiente

Copia il file di esempio per creare il tuo `.env` locale:

```bash
cp .env.example .env
```

Puoi opzionalmente impostare `INITIAL_ADMIN_EMAIL="tua@email.com"` nel file `.env`: il primo utente che si registrerà con questa email otterrà automaticamente i privilegi di `admin` e l'accesso alla dashboard di amministrazione.

*(Nota: il database SQLite punta di default al file locale `db.sqlite`)*

### 3. Setup del Database

Genera e applica le migrazioni al tuo database SQLite locale:

```bash
pnpm db:push
```

*Opzionale:* per esplorare o modificare i dati graficamente, avvia Drizzle Studio:

```bash
pnpm db:studio
```

### 4. Primo Utente Admin & Admin Dashboard

Lo starter kit include il plugin Admin di Better-Auth per la gestione utenti su un'interfaccia protetta (`/admin-dashboard`). Essendo i ruoli salvati come testo direttamente in SQLite, per diventare il primo amministratore del sistema basta un singolo comando dal terminale:

1. Fai il login nell'applicazione dal browser per creare il tuo account utente.
2. Apri il terminale nella cartella del progetto ed esegui:
   ```bash
   sqlite3 db.sqlite "UPDATE user SET role = 'admin' WHERE email = 'la-tua@email.com';"
   ```
3. Ricarica la pagina: vedrai il pulsante **Admin ⚙️** apparire nella Navbar in alto. Da lì potrai accedere alla dashboard per gestire gli accessi o promuovere comodamente i futuri utenti dalla UI web.

#### Nota di Architettura e Trade-off (Rimozione Ruoli Custom & Multi-Ruolo)
Nel rispetto del protocollo Ponytail (minimo codice, zero over-engineering), la mutazione di eliminazione di un ruolo personalizzato (`admin.deleteRole`) implementa un fallback atomico di sicurezza anti-orfani per riassegnare il ruolo di default `"user"` solo agli utenti che possiedono esattamente come ruolo singolo il nome del ruolo in eliminazione (`UPDATE user SET role = 'user' WHERE role = ?`).
Gli account ai quali sono stati assegnati ruoli compositi multipli concatenati (es. `"editor,admin"`) richiedono la rimozione e l'aggiornamento manuale dall'interfaccia UI di gestione utente, evitando deliberatamente l'introduzione di parser di stringhe custom o di query di pulizia complesse che aumenterebbero la complessità e la fragilità di manutenzione del sistema di autenticazione.

### 5. Avvio del Server di Sviluppo

Avvia il server con il supporto a **Turbopack** per reload istantanei:

```bash
pnpm dev
```

Apri [http://localhost:3000](http://localhost:3000) nel tuo browser.

---

## 🛠️ Comandi Utili (Scripts)

| Comando | Descrizione |
| :--- | :--- |
| `pnpm dev` | Avvia il server di sviluppo con Next.js e Turbopack (`next dev --turbo`). |
| `pnpm build` | Compila l'applicazione per la produzione. |
| `pnpm check` | Esegue il linter e il type-checking TypeScript in un colpo solo. |
| `pnpm db:push` | Applica rapidamente i cambiamenti dello schema Drizzle al database locale. |
| `pnpm db:generate` | Genera i file di migrazione SQL a partire dallo schema (`src/server/db/schema.ts`). |
| `pnpm db:studio` | Apre l'interfaccia web di Drizzle Studio per esplorare il database. |
| `pnpm format:write` | Formatta il codice in tutto il progetto usando Prettier. |

## 📁 Struttura del Progetto

```text
src/
├── app/               # Rotte ed endpoint Next.js 15 App Router
│   ├── _components/   # Componenti React client/server (Bacheca post, AuthForm, UserProfile)
│   └── api/           # API Routes (tRPC e Better-Auth handler)
├── server/
│   ├── api/           # Router, procedure tRPC e logica di backend
│   ├── better-auth/   # Configurazione e istanze client/server di Better-Auth
│   └── db/            # Schema Drizzle, connessione a SQLite e migrazioni
├── trpc/              # Client tRPC e integrazione con TanStack Query per il frontend
└── styles/            # Stili globali Tailwind CSS
```
