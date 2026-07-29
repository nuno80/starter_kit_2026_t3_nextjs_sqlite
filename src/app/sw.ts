import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const manifest = (self.__SW_MANIFEST ?? []).map((entry) => {
  if (typeof entry === "string") {
    return { url: entry, revision: crypto.randomUUID() };
  }
  if (!entry.revision) {
    return { ...entry, revision: crypto.randomUUID() };
  }
  return entry;
});

const serwist = new Serwist({
  precacheEntries: manifest,
  precacheOptions: {
    fallbackToNetwork: true,
  },
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();

/**
 * Web Push support (see docs/pwa/README.md and ~/server/push).
 *
 * The push event only carries the encrypted payload the browser already decrypted for us; we
 * defined that payload's shape ourselves in ~/server/push/send-notification.ts (JSON: title,
 * body, url). `event.waitUntil` keeps the service worker alive until showNotification() resolves.
 */
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data: { title?: string; body?: string; url?: string };
  try {
    data = event.data.json();
  } catch {
    data = { title: "Notifica", body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(data.title ?? "Notifica", {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url ?? "/" },
    }),
  );
});

/** Focuses an already-open tab on the target URL if there is one, otherwise opens a new one. */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl =
    (event.notification.data as { url?: string } | undefined)?.url ?? "/";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const existing = allClients.find((c) => c.url.endsWith(targetUrl));
      if (existing) {
        await existing.focus();
      } else {
        await self.clients.openWindow(targetUrl);
      }
    })(),
  );
});

