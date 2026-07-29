import "server-only";
import { eq } from "drizzle-orm";
import { WebPushError } from "web-push";

import { db } from "~/server/db";
import { pushSubscription } from "~/server/db/schema";
import { getWebPush } from "~/server/push/client";

export interface PushNotificationPayload {
  title: string;
  body: string;
  /** Relative URL opened when the user clicks the notification. Defaults to "/". */
  url?: string;
}

/**
 * Sends a push notification to every subscription (browser/device) a user has registered.
 * A dead/expired subscription makes the push service respond with 404/410 - when that happens
 * we delete the row instead of retrying, since it will never succeed again.
 *
 * Returns how many sends succeeded, for basic feedback in the UI/logs.
 */
export async function sendPushNotificationToUser(
  userId: string,
  payload: PushNotificationPayload,
): Promise<{ sent: number; removedStale: number }> {
  const webpush = getWebPush();

  const subscriptions = await db.query.pushSubscription.findMany({
    where: eq(pushSubscription.userId, userId),
  });

  let sent = 0;
  let removedStale = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify({
            title: payload.title,
            body: payload.body,
            url: payload.url ?? "/",
          }),
        );
        sent += 1;
      } catch (err) {
        const isGone =
          err instanceof WebPushError &&
          (err.statusCode === 404 || err.statusCode === 410);

        if (isGone) {
          await db
            .delete(pushSubscription)
            .where(eq(pushSubscription.id, sub.id));
          removedStale += 1;
        } else {
          console.error(
            `[push] failed to notify subscription ${sub.id}:`,
            err,
          );
        }
      }
    }),
  );

  return { sent, removedStale };
}
