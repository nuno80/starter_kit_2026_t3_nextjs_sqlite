import { z } from "zod";
import { eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env";
import { stripeCustomer } from "~/server/db/schema";
import { stripe } from "~/server/stripe/client";
import { getOneTimeProduct } from "~/server/stripe/catalog";

const oneTimeProductKeySchema = z.enum(["basic", "pro"]);

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
});
