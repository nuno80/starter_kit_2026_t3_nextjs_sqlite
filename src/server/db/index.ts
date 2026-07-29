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
      const client = globalForDb.client ?? createClient({ url: env.DATABASE_URL });
      if (env.NODE_ENV !== "production") globalForDb.client = client;
      
      // Attempt to execute pragmas asynchronously. We don't block on this.
      client.executeMultiple(`
        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;
        PRAGMA busy_timeout = 5000;
        PRAGMA synchronous = NORMAL;
      `).catch(console.error);
      
      _db = drizzle(client, { schema });
    }
    return (_db as any)[prop];
  },
});

