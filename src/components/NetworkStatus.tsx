"use client";

import { useEffect, useState } from "react";

export function NetworkStatus() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-14 z-40 border-b border-line bg-ink px-4 py-2 text-center text-sm text-plaster"
    >
      Sei offline. Alcune funzioni potrebbero non essere disponibili.
    </div>
  );
}
