"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

const STATUS_LABEL: Record<string, string> = {
  active: "Attivo",
  trialing: "Periodo di prova",
  past_due: "Pagamento in ritardo",
  canceled: "Cancellato",
  incomplete: "Incompleto",
  incomplete_expired: "Scaduto",
  unpaid: "Non pagato",
  paused: "In pausa",
};

export function BillingStatus() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { data, isLoading } = api.checkout.getSubscriptionStatus.useQuery();

  const openPortal = api.checkout.createBillingPortalSession.useMutation({
    onSuccess: (res) => {
      window.location.href = res.url;
    },
    onError: (err) => setErrorMsg(err.message),
  });

  if (isLoading) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-line bg-plaster-deep p-6 text-sm text-ink-soft">
        Caricamento stato abbonamento...
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-line bg-plaster-deep p-6 shadow-sm">
      <h3 className="font-serif text-xl font-bold text-ink">Abbonamento</h3>

      {errorMsg && (
        <div className="mt-3 rounded-xl border border-red-300 bg-red-100 p-3 text-xs text-red-800">
          {errorMsg}
        </div>
      )}

      {!data?.hasSubscription ? (
        <p className="mt-3 text-sm text-ink-soft">
          Nessun abbonamento attivo al momento.
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-1 text-sm text-ink-soft">
          <p>
            Piano:{" "}
            <span className="font-semibold text-ink">{data.planKey}</span>
          </p>
          <p>
            Stato:{" "}
            <span className="font-semibold text-ink">
              {STATUS_LABEL[data.status] ?? data.status}
            </span>
          </p>
          {data.cancelAtPeriodEnd && (
            <p className="text-xs text-terracotta">
              Verrà cancellato al termine del periodo corrente.
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => openPortal.mutate()}
        disabled={openPortal.isPending}
        className="mt-6 w-full rounded-xl bg-terracotta px-5 py-3 text-sm font-semibold text-plaster transition-all duration-200 hover:bg-terracotta-d active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
      >
        {openPortal.isPending
          ? "Apertura in corso..."
          : "Gestisci abbonamento e fatturazione"}
      </button>
      <p className="mt-2 text-xs text-ink-faint">
        Ti reindirizza al Billing Portal di Stripe: carta, fatture,
        cancellazione — tutto gestito da loro.
      </p>
    </div>
  );
}
