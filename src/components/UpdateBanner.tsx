"use client";

import { useEffect, useState } from "react";

export function UpdateBanner() {
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const track = (sw: ServiceWorker | null) => {
      if (!sw) return;
      const onState = () => {
        if (sw.state === "installed" && navigator.serviceWorker.controller) {
          setWaiting(true);
        }
      };
      onState();
      sw.addEventListener("statechange", onState);
    };

    void navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;
      if (reg.waiting && navigator.serviceWorker.controller) setWaiting(true);
      track(reg.installing);
      reg.addEventListener("updatefound", () => track(reg.installing));
    });
  }, []);

  if (!waiting) return null;

  const handleRefresh = () => {
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => window.location.reload(),
      { once: true },
    );
    void navigator.serviceWorker.getRegistration().then((reg) => {
      reg?.waiting?.postMessage({ type: "SKIP_WAITING" });
    });
  };

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-plaster px-4 py-3 text-ink shadow-[0_-4px_24px_rgba(40,28,23,0.08)]"
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
        <p className="text-sm">È disponibile una nuova versione.</p>
        <button
          type="button"
          onClick={handleRefresh}
          className="rounded-full bg-terracotta px-4 py-2 text-sm font-medium text-plaster transition-transform hover:scale-105 active:scale-95"
        >
          Aggiorna
        </button>
      </div>
    </div>
  );
}
