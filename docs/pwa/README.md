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
