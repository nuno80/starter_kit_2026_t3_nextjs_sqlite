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


