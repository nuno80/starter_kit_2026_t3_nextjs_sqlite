"use client";

import { useEffect, useState } from "react";

/**
 * Detects when a *new* service worker has taken control of the page while the tab was open.
 *
 * Our SW is configured with `skipWaiting: true` + `clientsClaim: true` (see src/app/sw.ts), so
 * updates activate immediately instead of waiting for all tabs to close. That's convenient, but
 * it means the currently-open page can end up running against JS/data that no longer matches
 * the newly-cached assets. Reloading fixes it - this hook just tells you *when* to prompt for
 * that reload.
 *
 * Note: `controllerchange` also fires on the very first service worker activation (i.e. the
 * user's first visit, not an update). We only treat it as an "update" if a controller already
 * existed when this hook mounted.
 */
export function usePwaUpdateAvailable() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const hadControllerOnMount = !!navigator.serviceWorker.controller;

    const handleControllerChange = () => {
      if (hadControllerOnMount) {
        setUpdateAvailable(true);
      }
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );
    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
    };
  }, []);

  return updateAvailable;
}
