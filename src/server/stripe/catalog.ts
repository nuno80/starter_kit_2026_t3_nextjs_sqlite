import { env } from "~/env";

/**
 * Demo catalog for the starter kit.
 *
 * This keeps price IDs out of the database and out of the client bundle: the client only ever
 * sends a `productKey` / `planKey` (a stable string), and the server resolves it to the actual
 * Stripe Price ID via env vars. This means:
 *   - No prices/amounts are ever trusted from the client.
 *   - You can point the same `productKey` at a different Stripe Price ID (e.g. per environment)
 *     just by changing env vars, no code or DB changes required.
 *
 * Replace/extend these with your real products once you've created them in the Stripe Dashboard
 * (Test mode first!). See docs/stripe-setup.md.
 */

export type OneTimeProductKey = "basic" | "pro";
export type SubscriptionPlanKey = "monthly" | "yearly";

export const ONE_TIME_PRODUCTS: Record<
  OneTimeProductKey,
  { name: string; description: string; priceId: string | undefined }
> = {
  basic: {
    name: "Pacchetto Base",
    description: "Acquisto singolo, accesso immediato.",
    priceId: env.STRIPE_PRICE_ONE_TIME_BASIC,
  },
  pro: {
    name: "Pacchetto Pro",
    description: "Acquisto singolo con funzionalità avanzate.",
    priceId: env.STRIPE_PRICE_ONE_TIME_PRO,
  },
};

export const SUBSCRIPTION_PLANS: Record<
  SubscriptionPlanKey,
  { name: string; description: string; priceId: string | undefined }
> = {
  monthly: {
    name: "Piano Mensile",
    description: "Fatturazione ricorrente ogni mese.",
    priceId: env.STRIPE_PRICE_SUB_MONTHLY,
  },
  yearly: {
    name: "Piano Annuale",
    description: "Fatturazione ricorrente ogni anno (sconto incluso).",
    priceId: env.STRIPE_PRICE_SUB_YEARLY,
  },
};

export function getOneTimeProduct(key: OneTimeProductKey) {
  const product = ONE_TIME_PRODUCTS[key];
  if (!product.priceId) {
    throw new Error(
      `Nessun Price ID configurato per il prodotto "${key}". Imposta la variabile d'ambiente ` +
        `corrispondente (vedi docs/stripe-setup.md).`,
    );
  }
  return { ...product, priceId: product.priceId };
}

export function getSubscriptionPlan(key: SubscriptionPlanKey) {
  const plan = SUBSCRIPTION_PLANS[key];
  if (!plan.priceId) {
    throw new Error(
      `Nessun Price ID configurato per il piano "${key}". Imposta la variabile d'ambiente ` +
        `corrispondente (vedi docs/stripe-setup.md).`,
    );
  }
  return { ...plan, priceId: plan.priceId };
}
