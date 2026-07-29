import { type NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

import { env } from "~/env";
import { db } from "~/server/db";
import { payment, stripeCustomer, subscription } from "~/server/db/schema";
import { stripe } from "~/server/stripe/client";

/**
 * Stripe webhook endpoint.
 *
 * This is the single source of truth for payment/subscription state: never trust the browser
 * redirect back from Checkout to decide whether a payment succeeded — always wait for (or
 * reconcile against) these events.
 *
 * Local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
 * (the CLI prints a `whsec_...` value to put in STRIPE_WEBHOOK_SECRET).
 *
 * @see docs/stripe-setup.md
 */

// Route handlers already receive the unparsed request; make sure no global body-parsing
// middleware is added later, since Stripe signature verification requires the raw payload.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not set; refusing webhook request.");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[stripe webhook] signature verification failed: ${message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      }
      case "payment_intent.payment_failed": {
        await handlePaymentIntentFailed(event.data.object);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        await handleSubscriptionUpsert(event.data.object);
        break;
      }
      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(event.data.object);
        break;
      }
      default:
        // Unhandled event types are ignored on purpose; extend this switch as needed.
        break;
    }
  } catch (err) {
    // Return 500 so Stripe retries the event instead of silently dropping it.
    console.error(`[stripe webhook] handler error for ${event.type}:`, err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
) {
  const userId = session.client_reference_id ?? session.metadata?.userId;
  if (!userId) {
    console.error(
      "[stripe webhook] checkout.session.completed without client_reference_id/userId metadata",
    );
    return;
  }

  // Keep our stripeCustomer mapping up to date regardless of payment mode.
  if (session.customer) {
    const stripeCustomerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer.id;

    await db
      .insert(stripeCustomer)
      .values({ userId, stripeCustomerId })
      .onConflictDoUpdate({
        target: stripeCustomer.userId,
        set: { stripeCustomerId },
      });
  }

  if (session.mode === "payment") {
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    await db
      .insert(payment)
      .values({
        userId,
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: paymentIntentId ?? null,
        productKey: session.metadata?.productKey ?? "unknown",
        amountTotal: session.amount_total ?? null,
        currency: session.currency ?? null,
        status: session.payment_status === "paid" ? "paid" : "pending",
      })
      .onConflictDoUpdate({
        target: payment.stripeCheckoutSessionId,
        set: {
          stripePaymentIntentId: paymentIntentId ?? null,
          status: session.payment_status === "paid" ? "paid" : "pending",
        },
      });
  }

  // For mode === "subscription", Stripe also fires customer.subscription.created right after
  // this event; we let handleSubscriptionUpsert own the subscription row to avoid duplicating
  // logic (it has access to the full Subscription object, this event only has the ID).
}

async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
) {
  await db
    .update(payment)
    .set({ status: "failed" })
    .where(eq(payment.stripePaymentIntentId, paymentIntent.id));
}

async function handleSubscriptionUpsert(sub: Stripe.Subscription) {
  const userId = sub.metadata?.userId;
  if (!userId) {
    console.error(
      "[stripe webhook] subscription event without userId metadata; " +
        "make sure Checkout Sessions set subscription_data.metadata.userId",
    );
    return;
  }

  const priceId = sub.items.data[0]?.price.id ?? "unknown";
  const currentPeriodEnd = sub.items.data[0]?.current_period_end;

  await db
    .insert(subscription)
    .values({
      userId,
      stripeCustomerId:
        typeof sub.customer === "string" ? sub.customer : sub.customer.id,
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      planKey: sub.metadata?.planKey ?? "unknown",
      status: sub.status,
      currentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000)
        : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    })
    .onConflictDoUpdate({
      target: subscription.stripeSubscriptionId,
      set: {
        stripePriceId: priceId,
        status: sub.status,
        currentPeriodEnd: currentPeriodEnd
          ? new Date(currentPeriodEnd * 1000)
          : null,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      },
    });
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  await db
    .update(subscription)
    .set({ status: "canceled" })
    .where(eq(subscription.stripeSubscriptionId, sub.id));
}
