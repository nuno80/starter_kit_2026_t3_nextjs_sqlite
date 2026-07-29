import { z } from "zod";
import { eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env";
import { stripeCustomer, subscription } from "~/server/db/schema";
import { stripe } from "~/server/stripe/client";
import { getOneTimeProduct, getSubscriptionPlan } from "~/server/stripe/catalog";

const oneTimeProductKeySchema = z.enum(["basic", "pro"]);
const subscriptionPlanKeySchema = z.enum(["monthly", "yearly"]);

/**
 * Finds or creates the Stripe Customer for the current user, and persists the mapping.
 * Reused by both one-time and subscription checkout flows.
 */
async function getOrCreateStripeCustomerId(
  ctx: { db: typeof import("~/server/db").db },
  user: { id: string; email: string; name?: string | null },
) {
  const existing = await ctx.db.query.stripeCustomer.findFirst({
    where: eq(stripeCustomer.userId, user.id),
  });
  if (existing) return existing.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name ?? undefined,
    metadata: { userId: user.id },
  });

  await ctx.db
    .insert(stripeCustomer)
    .values({ userId: user.id, stripeCustomerId: customer.id })
    .onConflictDoNothing();

  return customer.id;
}

export const checkoutRouter = createTRPCRouter({
  /**
   * Creates a Stripe Checkout Session for a one-time (non-recurring) purchase and returns
   * the URL to redirect the browser to.
   */
  createOneTimeCheckout: protectedProcedure
    .input(z.object({ productKey: oneTimeProductKeySchema }))
    .mutation(async ({ ctx, input }) => {
      const product = getOneTimeProduct(input.productKey);
      const customerId = await getOrCreateStripeCustomerId(
        ctx,
        ctx.session.user,
      );

      const baseUrl = env.BETTER_AUTH_URL;

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer: customerId,
        client_reference_id: ctx.session.user.id,
        line_items: [{ price: product.priceId, quantity: 1 }],
        metadata: {
          userId: ctx.session.user.id,
          productKey: input.productKey,
        },
        success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/checkout/cancel`,
      });

      if (!session.url) {
        throw new Error("Stripe non ha restituito un URL di checkout.");
      }

      return { url: session.url };
    }),

  /**
   * Creates a Stripe Checkout Session for a recurring subscription plan and returns the URL
   * to redirect the browser to. The actual `subscription` DB row is written by the webhook
   * (customer.subscription.created), not here — Checkout completing does not guarantee the
   * first invoice was paid.
   */
  createSubscriptionCheckout: protectedProcedure
    .input(z.object({ planKey: subscriptionPlanKeySchema }))
    .mutation(async ({ ctx, input }) => {
      const plan = getSubscriptionPlan(input.planKey);
      const customerId = await getOrCreateStripeCustomerId(
        ctx,
        ctx.session.user,
      );

      const baseUrl = env.BETTER_AUTH_URL;

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        client_reference_id: ctx.session.user.id,
        line_items: [{ price: plan.priceId, quantity: 1 }],
        // Applied to the Subscription object itself so the webhook (which receives
        // customer.subscription.* events, not checkout.session.*) can resolve the user.
        subscription_data: {
          metadata: { userId: ctx.session.user.id, planKey: input.planKey },
        },
        metadata: { userId: ctx.session.user.id, planKey: input.planKey },
        success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/checkout/cancel`,
      });

      if (!session.url) {
        throw new Error("Stripe non ha restituito un URL di checkout.");
      }

      return { url: session.url };
    }),

  /**
   * Returns the current user's most recent subscription row (if any), as last synced by the
   * webhook. Treat "active" and "trialing" as entitled; everything else as not entitled.
   */
  getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    const sub = await ctx.db.query.subscription.findFirst({
      where: eq(subscription.userId, ctx.session.user.id),
      orderBy: (subscription, { desc }) => [desc(subscription.createdAt)],
    });

    if (!sub) return { hasSubscription: false as const };

    return {
      hasSubscription: true as const,
      planKey: sub.planKey,
      status: sub.status,
      isEntitled: sub.status === "active" || sub.status === "trialing",
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    };
  }),

  /**
   * Creates a Stripe Billing Portal session so the user can update their card, view invoices,
   * or cancel their subscription without you having to build that UI yourself.
   */
  createBillingPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const existing = await ctx.db.query.stripeCustomer.findFirst({
      where: eq(stripeCustomer.userId, ctx.session.user.id),
    });

    if (!existing) {
      throw new Error(
        "Nessun cliente Stripe associato a questo account: effettua prima un acquisto.",
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: existing.stripeCustomerId,
      return_url: env.BETTER_AUTH_URL,
    });

    return { url: portalSession.url };
  }),
});
