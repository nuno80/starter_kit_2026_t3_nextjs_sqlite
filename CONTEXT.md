# Domain Modeling

Il modello di dominio per questo T3 Starter Kit (SQLite + Better-Auth + Drizzle + tRPC + Next.js App Router).

## Language

**Starter Kit**:
Uno scheletro di progetto preconfigurato e type-safe end-to-end con Next.js 15, Drizzle ORM, SQLite locale e Better-Auth, ottimizzato per lo sviluppo rapido.
_Avoid_: Template, Boilerplate

**Local Database (db.sqlite)**:
Il database relazionale SQLite integrato come singolo file locale, che consente uno sviluppo immediato a zero-configurazione senza la necessità di container Docker o server remoti.
_Avoid_: DB esterno, Turso, Cloud DB

**Better-Auth**:
Il motore di autenticazione moderno e type-safe preconfigurato per gestire accesso tramite email/password e login social (GitHub, Google), integrato sia in ambito client che server.
_Avoid_: NextAuth, Auth.js, Clerk

**Admin**:
Un utente dotato di privilegi di amministrazione di sistema il cui identificativo o ruolo è esplicitamente riconosciuto dal sistema di autenticazione per gestire altri utenti e permessi.
_Avoid_: Superuser, Root, Gestore

**Admin Dashboard (`/admin-dashboard`)**:
L'interfaccia protetta accessibile ai soli amministratori per il controllo degli accessi, l'auditing degli utenti registrati e l'assegnazione dei ruoli di sistema.
_Avoid_: Control Panel, Dashboard generale, Impostazioni utente

**User Role**:
Il livello di privilegio associato a un utente all'interno del sistema di autenticazione (es. `user`, `admin`), governato da regole statiche di controllo degli accessi e salvato come testo (anche multiplo) senza tabelle relazionali dinamiche.
_Avoid_: Gruppo di sicurezza, Profilo di accesso, Ruolo dinamico nel DB

**tRPC Procedure**:
Un endpoint API type-safe esposto dal server e consumabile direttamente dal client React tramite TanStack Query, garantendo type-checking continuo dal database alla UI.
_Avoid_: API Route, REST endpoint, Controller

**Turbopack**:
Il bundler ad alte prestazioni abilitato di default nel server di sviluppo per garantire tempi di avvio istantanei e Fast Refresh ottimizzato.
_Avoid_: Webpack, Vite

**Landing Page (`/`)**:
La pagina principale pubblica in `src/app/page.tsx` progettata per presentare i vantaggi e l'architettura dello Starter Kit T3 attraverso un design editoriale ad alto impatto visivo, ospitando nativamente le funzionalità di dimostrazione del kit.
_Avoid_: Home generica, Vetrina statica, Boilerplate index

**Quick-Start Section (Sezione 04)**:
La sezione finale della Landing Page adibita a guida di avvio rapido in 60 secondi, strutturata a due colonne (ispirata al layout originale di prenotazione): a sinistra i comandi CLI essenziali (`pnpm install`, `pnpm db:push`, `pnpm dev`), a destra il box di riepilogo "sticky" che indirizza verso l'applicazione di prova.
_Avoid_: Form di prenotazione, Contatti, Footer semplice

**Demo App Page (`/posts`)**:
La pagina dedicata e separata dalla Landing Page che ospita le funzionalità di test e dimostrazione delle operazioni CRUD sul database locale SQLite tramite tRPC e Drizzle ORM.
_Avoid_: Sandbox in-page, Sandbox monolitica, Dashboard generale

**Navbar Auth Widget**:
L'integrazione del sistema di autenticazione Better-Auth direttamente all'interno della barra di navigazione globale, che permette l'accesso immediato o la visualizzazione del profilo utente da qualsiasi rotta del progetto.
_Avoid_: Auth form separato, Login solo in home

**Client-Side i18n (Lightweight Dictionary)**:
Un sistema di internazionalizzazione leggero basato su stato client o React Context con dizionari JSON locali (IT/EN), che permette di commutare istantaneamente i testi dell'interfaccia senza introdurre routing complesso (`/[locale]/`) o dipendenze esterne.
_Avoid_: next-intl, i18n routing, server-side translations

**Plaster & Terracotta Theme**:
Il design system visivo editoriale basato su toni caldi (intonaco, terracotta, ottone, verde oliva) e tipografia ad alto contrasto (Fraunces per i titoli, Instrument Sans per i testi), integrato nativamente in Tailwind CSS v4 tramite il blocco `@theme` e variabili CSS di Next.js.
_Avoid_: Dark mode tecnologico, Palette standard di Tailwind, CSS config esterne

**Stripe Checkout**:
Il sistema integrato per la gestione dei pagamenti una tantum e degli abbonamenti ricorrenti, ospitato direttamente da Stripe. Gestisce in autonomia la sicurezza (PCI compliance), metodi di pagamento multipli e l'inserimento sicuro delle carte di credito.
_Avoid_: Form custom, Stripe Elements, Componenti di pagamento a mano

**Stripe Webhooks**:
La singola e unica "fonte di verità" per la conferma dell'esito di un pagamento o dello stato di un abbonamento. Il database viene aggiornato tramite gli eventi webhook (`checkout.session.completed`, `customer.subscription.*`), mai fidandosi ciecamente del reindirizzamento del browser del cliente alla pagina di successo.
_Avoid_: Polling, Success URL state mutation, Aggiornamenti client-driven

**Billing Portal**:
L'interfaccia sicura offerta e ospitata da Stripe a cui gli utenti possono accedere per aggiornare carte di credito, visualizzare e scaricare le fatture, e cancellare l'abbonamento ricorrente, con zero codice backend addizionale da parte nostra.
_Avoid_: Form di disdetta custom, Tabella fatture locale, UI gestione carte

Il design system visivo editoriale basato su toni caldi (intonaco, terracotta, ottone, verde oliva) e tipografia ad alto contrasto (Fraunces per i titoli, Instrument Sans per i testi), integrato nativamente in Tailwind CSS v4 tramite il blocco `@theme` e variabili CSS di Next.js.
_Avoid_: Dark mode tecnologico, Palette standard di Tailwind, CSS config esterne
