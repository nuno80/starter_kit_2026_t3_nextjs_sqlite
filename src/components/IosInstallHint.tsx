"use client";

import { useEffect, useState } from "react";

const DISMISSED_KEY = "pwa-ios-install-hint-dismissed";

function isIosSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua) && !("MSStream" in window);
  // Exclude other iOS browsers (Chrome/Firefox on iOS all use WebKit and report "Safari" too,
  // but they still support Add to Home Screen through the same Share sheet, so we don't
  // need to distinguish further here - any iOS browser lacking beforeinstallprompt qualifies.
  return isIos;
}

function isRunningStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    nav.standalone === true
  );
}

/**
 * iOS Safari (and other iOS browsers) never fire `beforeinstallprompt`, so <InstallButton />
 * silently does nothing there - see docs/pwa/README.md. This shows manual instructions instead
 * ("Condividi -> Aggiungi alla schermata Home"), dismissible and remembered per-browser.
 */
export function IosInstallHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isIosSafari() || isRunningStandalone()) return;
    if (window.localStorage.getItem(DISMISSED_KEY) === "1") return;
    setVisible(true);
  }, []);

  const dismiss = () => {
    window.localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[60] mx-auto flex max-w-sm items-start gap-3 rounded-2xl border border-line bg-plaster-deep p-4 text-ink shadow-lg sm:left-4 sm:right-auto">
      <div className="flex-1 text-sm">
        <p className="font-semibold">Installa questa app</p>
        <p className="mt-1 text-ink-soft">
          Tocca{" "}
          <span aria-hidden className="inline-block">
            ⬆️
          </span>{" "}
          <strong>Condividi</strong>, poi{" "}
          <strong>Aggiungi alla schermata Home</strong>.
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Chiudi"
        className="shrink-0 rounded-full p-1 text-ink-soft transition hover:bg-plaster hover:text-ink"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
