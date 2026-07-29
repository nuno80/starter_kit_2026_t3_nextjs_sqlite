import "server-only";
import Stripe from "stripe";

import { env } from "~/env";

/**
 * Cache the Stripe client in development to avoid re-instantiating it on every HMR update
 * (mirrors the pattern used for the Drizzle client in `~/server/db`).
 */
const globalForStripe = globalThis as unknown as {
  stripe: Stripe | undefined;
};

function createStripeClient(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to your .env file to enable Stripe payments " +
        "(see docs/stripe-setup.md).",
    );
  }

  return new Stripe(env.STRIPE_SECRET_KEY, {
    // Pin the API version so Stripe dashboard upgrades don't silently change behavior.
    apiVersion: "2025-08-27.basil",
    typescript: true,
    appInfo: {
      name: "t3-nextjs-sqlite-starter-kit",
      version: "0.1.0",
    },
  });
}

export const stripe = globalForStripe.stripe ?? createStripeClient();
if (env.NODE_ENV !== "production") globalForStripe.stripe = stripe;
