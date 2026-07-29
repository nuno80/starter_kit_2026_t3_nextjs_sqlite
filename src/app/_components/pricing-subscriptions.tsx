"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import type { SubscriptionPlanKey } from "~/server/stripe/catalog";

const PLANS: {
  key: SubscriptionPlanKey;
  name: string;
  description: string;
  price: string;
  cadence: string;
}[] = [
  {
    key: "monthly",
    name: "Piano Mensile",
    description: "Fatturazione ricorrente ogni mese, disdici quando vuoi.",
    price: "€9",
    cadence: "/mese",
  },
  {
    key: "yearly",
    name: "Piano Annuale",
    description: "Fatturazione ricorrente ogni anno, con sconto incluso.",
    price: "€89",
    cadence: "/anno",
  },
];

export function PricingSubscriptions({
  isLoggedIn,
}: {
  isLoggedIn: boolean;
}) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState<SubscriptionPlanKey | null>(
    null,
  );

  const createCheckout = api.checkout.createSubscriptionCheckout.useMutation({
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (err) => {
      setErrorMsg(err.message);
      setLoadingKey(null);
    },
  });

  const handleSubscribe = (key: SubscriptionPlanKey) => {
    if (!isLoggedIn) {
      setErrorMsg("Devi effettuare l'accesso prima di abbonarti.");
      return;
    }
    setErrorMsg(null);
    setLoadingKey(key);
    createCheckout.mutate({ planKey: key });
  };

  return (
    <div className="w-full">
      {errorMsg && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-100 p-3 text-xs text-red-800">
          {errorMsg}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <div
            key={plan.key}
            className="flex flex-col justify-between rounded-2xl border border-line bg-plaster-deep p-6 shadow-sm"
          >
            <div>
              <h3 className="font-serif text-xl font-bold text-ink">
                {plan.name}
              </h3>
              <p className="mt-1 text-sm text-ink-soft">{plan.description}</p>
              <p className="mt-4 font-mono text-3xl font-bold text-ink">
                {plan.price}
                <span className="ml-1 text-base font-medium text-ink-soft">
                  {plan.cadence}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleSubscribe(plan.key)}
              disabled={loadingKey === plan.key}
              className="mt-6 rounded-xl border border-ink bg-transparent px-5 py-3 text-sm font-semibold text-ink transition-all duration-200 hover:bg-ink hover:text-plaster active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {loadingKey === plan.key ? "Reindirizzamento..." : "Abbonati"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
