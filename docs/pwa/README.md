# PWA Starter — Next.js 15 + Turbopack + Serwist

## Installazione

```bash
npm i @serwist/turbopack @serwist/next serwist
```

## File inclusi

- `next.config.ts` — plugin Serwist per Turbopack (`@serwist/turbopack`)
- `app/manifest.ts` — Web App Manifest generato da Next.js
- `app/sw.ts` — service worker tipizzato (precache + fallback offline)
- `app/~offline/page.tsx` — pagina mostrata quando l'utente è offline
- `app/layout.tsx` — metadata PWA + rendering del bottone di installazione
- `components/InstallButton.tsx` — bottone custom per il prompt di installazione

## Icone da aggiungere in `public/`

- `icon-192.png` (192x192)
- `icon-512.png` (512x512)
- `icon-maskable-512.png` (512x512, con padding di sicurezza per Android — safe zone al 40% centrale)

## Script consigliati in package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

Con `@serwist/turbopack` non serve più il flag `--webpack`: funziona nativamente
con Turbopack sia in dev che in build. Il service worker è disabilitato in dev
di default (vedi `disable` in `next.config.ts`) per evitare di dover invalidare
la cache del browser ad ogni modifica — se vuoi testarlo in locale, cambia
temporaneamente quella riga o lancia una build di produzione (`npm run build && npm start`).

## Note importanti

- **HTTPS obbligatorio in produzione** (localhost è considerato sicuro in dev).
- **iOS Safari** non supporta `beforeinstallprompt`: l'utente deve usare
  manualmente "Aggiungi a schermata Home". Il bottone custom quindi non
  comparirà su iOS, ma i metadata `appleWebApp` in `layout.tsx` migliorano
  comunque l'esperienza una volta aggiunta.
- Dopo aver aggiunto le icone, verifica il manifest visitando
  `/manifest.webmanifest` in locale.

## Notifiche push (Web Push / VAPID)

1. Genera una coppia di chiavi VAPID:

   ```bash
   npx web-push generate-vapid-keys
   ```

2. Aggiungi in `.env`:

   ```
   VAPID_PUBLIC_KEY="..."
   VAPID_PRIVATE_KEY="..."
   VAPID_SUBJECT="mailto:tuo@dominio.it"
   NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."   # stessa public key, esposta al client
   ```

3. `pnpm db:push` per creare la tabella `push_subscription`.
4. Vai su `/notifications` da loggato, clicca "Abilita notifiche" (il browser
   chiederà il permesso), poi "Invia notifica di prova".

### Struttura del codice

| File | Ruolo |
|---|---|
| `src/server/push/client.ts` | Configura `web-push` con le chiavi VAPID (lazy, non rompe l'app se non configurato) |
| `src/server/push/send-notification.ts` | Invia la notifica a tutte le subscription di un utente, rimuove quelle scadute (404/410) |
| `src/server/api/routers/push.ts` | Router tRPC: `subscribe`, `unsubscribe`, `sendTestNotification` |
| `src/app/sw.ts` | Listener `push` (mostra la notifica) e `notificationclick` (apre/focalizza la tab) |
| `src/lib/use-push-notifications.ts` | Hook client: richiesta permesso, `pushManager.subscribe`, sincronizzazione col server |
| `src/app/notifications/page.tsx` | UI per abilitare/disabilitare e testare le notifiche |

### Note

- Il service worker è disabilitato in dev: per testare `push`/`notificationclick`
  serve una build di produzione (`pnpm build && pnpm start`) su HTTPS (o
  `localhost`, considerato sicuro).
- Il payload della notifica (title/body/url) è definito interamente da noi in
  `send-notification.ts` — non c'è alcun formato imposto da Stripe/web-push,
  quindi puoi estenderlo (es. `icon` per-notifica, `actions`) senza vincoli.
- Per inviare notifiche da altri punti dell'app (es. un webhook, un cron), importa
  `sendPushNotificationToUser` da `~/server/push/send-notification` — non serve
  passare dal router tRPC.
