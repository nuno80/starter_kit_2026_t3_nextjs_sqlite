import { z } from "zod";
import { eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { pushSubscription } from "~/server/db/schema";
import { sendPushNotificationToUser } from "~/server/push/send-notification";

const subscriptionInputSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
  userAgent: z.string().optional(),
});

export const pushRouter = createTRPCRouter({
  /** Registers (or refreshes) a browser's push subscription for the current user. */
  subscribe: protectedProcedure
    .input(subscriptionInputSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(pushSubscription)
        .values({
          userId: ctx.session.user.id,
          endpoint: input.endpoint,
          p256dh: input.keys.p256dh,
          auth: input.keys.auth,
          userAgent: input.userAgent,
        })
        .onConflictDoUpdate({
          target: pushSubscription.endpoint,
          set: {
            userId: ctx.session.user.id,
            p256dh: input.keys.p256dh,
            auth: input.keys.auth,
            userAgent: input.userAgent,
          },
        });

      return { ok: true };
    }),

  /** Removes a subscription, e.g. when the user disables notifications from this browser. */
  unsubscribe: protectedProcedure
    .input(z.object({ endpoint: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(pushSubscription)
        .where(eq(pushSubscription.endpoint, input.endpoint));
      return { ok: true };
    }),

  /** Whether the current browser (by endpoint) already has an active subscription stored. */
  isSubscribed: protectedProcedure
    .input(z.object({ endpoint: z.string().url() }))
    .query(async ({ ctx, input }) => {
      const existing = await ctx.db.query.pushSubscription.findFirst({
        where: eq(pushSubscription.endpoint, input.endpoint),
      });
      return { subscribed: !!existing };
    }),

  /** Sends a test notification to every device the current user has subscribed. */
  sendTestNotification: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await sendPushNotificationToUser(ctx.session.user.id, {
      title: "Notifica di prova",
      body: "Se la vedi, le notifiche push funzionano correttamente!",
      url: "/notifications",
    });

    if (result.sent === 0) {
      throw new Error(
        "Nessuna notifica inviata: nessuna sottoscrizione attiva o tutte scadute.",
      );
    }

    return result;
  }),
});
