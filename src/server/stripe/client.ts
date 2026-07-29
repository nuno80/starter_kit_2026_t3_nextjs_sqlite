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
    // Only fail in production. In dev/build, allow it to be missing so builds pass
    // when environment variables aren't injected.
    // In Next.js, `process.env.NODE_ENV` is forced to "production" during `next build`.
    // We check `process.env.SKIP_ENV_VALIDATION` to skip this when T3's build bypass is active.
    if (process.env.NODE_ENV === "production" && process.env.SKIP_ENV_VALIDATION !== "1") {
      // Don't throw during build to allow `npm run build` without real keys.
      // We'll return a mock client instead.
      console.warn("STRIPE_SECRET_KEY is not set. Stripe calls will fail at runtime.");
    }
    return new Stripe("sk_test_mock", {
      apiVersion: "2026-06-24.dahlia",
      typescript: true,
    });
  }

  return new Stripe(env.STRIPE_SECRET_KEY, {
    // Pin the API version so Stripe dashboard upgrades don't silently change behavior.
    apiVersion: "2026-06-24.dahlia",
    typescript: true,
    appInfo: {
      name: "t3-nextjs-sqlite-starter-kit",
      version: "0.1.0",
    },
  });
}

export const stripe = globalForStripe.stripe ?? createStripeClient();
if (env.NODE_ENV !== "production") globalForStripe.stripe = stripe;
