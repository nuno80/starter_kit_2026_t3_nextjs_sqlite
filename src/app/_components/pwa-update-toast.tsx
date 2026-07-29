"use client";

import { usePwaUpdateAvailable } from "~/lib/use-pwa-update-available";

/**
 * Shows a small "new version available" banner once a fresh service worker has taken over the
 * page. Only ever appears in production (the service worker is disabled in dev, see
 * next.config.js). See ~/lib/use-pwa-update-available for the detection logic.
 */
export function PwaUpdateToast() {
  const updateAvailable = usePwaUpdateAvailable();

  if (!updateAvailable) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[60] mx-auto flex max-w-sm items-center justify-between gap-3 rounded-2xl border border-line bg-plaster-deep p-4 text-ink shadow-lg sm:left-4 sm:right-auto">
      <p className="text-sm font-medium">
        È disponibile una nuova versione dell&apos;app.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="shrink-0 rounded-xl bg-terracotta px-3 py-1.5 text-xs font-semibold text-plaster transition hover:bg-terracotta-d active:scale-[0.98]"
      >
        Aggiorna
      </button>
    </div>
  );
}
