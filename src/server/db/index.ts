import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import { env } from "~/env";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  client: Client | undefined;
};

// We defer initialization until it's actually used, which prevents static collection
// from opening a SQLite connection if it doesn't really need to.
let _db: ReturnType<typeof drizzle<typeof schema>>;

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(target, prop) {
    if (!_db) {
      const rawClient = globalForDb.client ?? createClient({ url: env.DATABASE_URL });
      if (env.NODE_ENV !== "production") globalForDb.client = rawClient;

      // PRAGMA must be applied before any query (foreign_keys, WAL, ...).
      // Every client operation is gated on this promise so ordering is guaranteed
      // regardless of driver (file:, libsql:, http:).
      const ready = rawClient.executeMultiple(`
        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;
        PRAGMA busy_timeout = 5000;
        PRAGMA synchronous = NORMAL;
      `);
      const gatedOps = ["execute", "batch", "migrate", "transaction"];
      const client = new Proxy(rawClient, {
        get(t, p) {
          const v = (t as unknown as Record<PropertyKey, unknown>)[p];
          if (typeof v === "function" && gatedOps.includes(p as string)) {
            return (...args: unknown[]) => ready.then(() => (v as (...a: unknown[]) => unknown).apply(t, args));
          }
          return v;
        },
      });

      _db = drizzle(client, { schema });
    }
    return (_db as any)[prop];
  },
});
