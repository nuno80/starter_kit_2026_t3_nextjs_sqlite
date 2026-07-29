"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import type { OneTimeProductKey } from "~/server/stripe/catalog";

const PRODUCTS: {
  key: OneTimeProductKey;
  name: string;
  description: string;
  price: string;
}[] = [
  {
    key: "basic",
    name: "Pacchetto Base",
    description: "Acquisto singolo, accesso immediato.",
    price: "€19",
  },
  {
    key: "pro",
    name: "Pacchetto Pro",
    description: "Acquisto singolo con funzionalità avanzate.",
    price: "€49",
  },
];

export function PricingOneTime({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState<OneTimeProductKey | null>(null);

  const createCheckout = api.checkout.createOneTimeCheckout.useMutation({
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (err) => {
      setErrorMsg(err.message);
      setLoadingKey(null);
    },
  });

  const handleBuy = (key: OneTimeProductKey) => {
    if (!isLoggedIn) {
      setErrorMsg("Devi effettuare l'accesso prima di acquistare.");
      return;
    }
    setErrorMsg(null);
    setLoadingKey(key);
    createCheckout.mutate({ productKey: key });
  };

  return (
    <div className="w-full">
      {errorMsg && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-100 p-3 text-xs text-red-800">
          {errorMsg}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {PRODUCTS.map((product) => (
          <div
            key={product.key}
            className="flex flex-col justify-between rounded-2xl border border-line bg-plaster-deep p-6 shadow-sm"
          >
            <div>
              <h3 className="font-serif text-xl font-bold text-ink">
                {product.name}
              </h3>
              <p className="mt-1 text-sm text-ink-soft">
                {product.description}
              </p>
              <p className="mt-4 font-mono text-3xl font-bold text-ink">
                {product.price}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleBuy(product.key)}
              disabled={loadingKey === product.key}
              className="mt-6 rounded-xl bg-terracotta px-5 py-3 text-sm font-semibold text-plaster transition-all duration-200 hover:bg-terracotta-d active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {loadingKey === product.key ? "Reindirizzamento..." : "Acquista"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
