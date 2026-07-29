import "server-only";
import webpush from "web-push";

import { env } from "~/env";

let configured = false;

/**
 * Configures the `web-push` library with our VAPID keys on first use. Lazy so importing this
 * module doesn't blow up the whole app when VAPID keys aren't set yet (e.g. fresh clone of the
 * starter kit before running through docs/pwa/README.md).
 */
export function getWebPush() {
  if (!configured) {
    if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY || !env.VAPID_SUBJECT) {
      throw new Error(
        "VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT are not set. Generate a key pair " +
          "with `npx web-push generate-vapid-keys` and add them to .env (see docs/pwa/README.md).",
      );
    }

    webpush.setVapidDetails(
      env.VAPID_SUBJECT,
      env.VAPID_PUBLIC_KEY,
      env.VAPID_PRIVATE_KEY,
    );
    configured = true;
  }

  return webpush;
}
