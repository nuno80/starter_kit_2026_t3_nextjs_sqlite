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

### 4. Avvio del Server di Sviluppo

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
