# PWA — Installable Shell

Target ridotto per questo Starter Kit su **Next.js 16 + Turbopack**.

Stack: `@serwist/turbopack` + `serwist` + `esbuild`. SW servito da
`/serwist/sw.js` (route handler), registrato via `SerwistProvider`.
Disabilitato in dev.

## Out of scope

Storage warning, Window Controls Overlay, Badging, Share Target, File Handling,
Launch Handler, Notifications, Background Sync, matrice cache custom da zero,
dipendenze oltre Serwist, cartella `src/lib/pwa/`.

## File chiave

| Pezzo | Ruolo |
|--------|--------|
| `next.config.js` | `withSerwist` da `@serwist/turbopack` |
| `src/app/serwist/[path]/route.ts` | build/serve SW (`createSerwistRoute`) |
| `src/app/sw.ts` | precache + `defaultCache` + NetworkOnly + fallback |
| `src/components/SerwistProvider.tsx` | register `/serwist/sw.js` (prod only) |
| `src/app/manifest.ts` + icone `public/` | installability |
| `InstallButton` / `UpdateBanner` / `NetworkStatus` | shell UI |
| `src/app/~offline/page.tsx` | offline shell |

`defaultCache` (@serwist/turbopack/worker) copre fonts, asset, HTML/RSC,
API GET `NetworkFirst`, `/api/auth/*` → `NetworkOnly`. Non riscrivere.

---

## Chunk 1 — Manifest + brand ✅

- palette ink/plaster, `id`/`scope`/`display_override`/`categories`, shortcuts
- typo SQLite fix, `viewport.themeColor`

## Chunk 2 — SW deltas ✅

- `skipWaiting: false` (update manuale)
- `NetworkOnly` su `/admin-dashboard` e `/api/trpc`
- fallback navigate → `/~offline`
- path Turbopack (`/serwist/sw.js`), non `public/sw.js`

## Chunk 3 — UI shell ✅

- `UpdateBanner` + `NetworkStatus` + theme su `InstallButton` / `~offline`

## Chunk 4 — Verify

1. `pnpm build && pnpm start` (SW off in dev)
2. Chrome: installable, offline navigate → `/~offline`, update banner
3. auth/admin non stale
4. iOS: “Aggiungi a Home” + `appleWebApp`
5. smoke: `/manifest.webmanifest`, `/~offline`, `/serwist/sw.js` → 200

---

## Done quando

Starter installabile, offline shell pubblica, update manuale,
auth/admin non stale, UI sul tema. Stop.
