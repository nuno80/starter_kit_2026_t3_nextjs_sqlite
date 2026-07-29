import Link from "next/link";

import { getSession } from "~/server/better-auth/server";
import { PricingOneTime } from "~/app/_components/pricing-one-time";
import { PricingSubscriptions } from "~/app/_components/pricing-subscriptions";

export default async function PricingPage() {
  const session = await getSession();

  return (
    <main className="flex min-h-screen flex-col items-center bg-plaster px-4 py-16 text-ink">
      <div className="container flex max-w-3xl flex-col items-center gap-12">
        <div className="flex w-full items-center justify-between border-b border-line pb-4">
          <Link
            href="/"
            className="font-serif text-2xl font-bold hover:text-terracotta"
          >
            ← Nuno Starter SQlite
          </Link>
          <span className="text-sm text-ink-soft">Demo Pricing (/pricing)</span>
        </div>

        <div className="text-center">
          <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
            Acquista <span className="text-terracotta">una tantum</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-soft">
            Esempio di pagamento singolo tramite Stripe Checkout. Carta di
            test: <code className="rounded border border-line bg-plaster-deep px-2 py-1">4242 4242 4242 4242</code>
          </p>
        </div>

        <PricingOneTime isLoggedIn={!!session?.user} />

        <div className="flex w-full flex-col items-center gap-8">
          <div className="h-[1px] w-full bg-line" />
          <div className="text-center">
            <h2 className="font-serif text-3xl font-bold tracking-tight">
              Oppure <span className="text-terracotta">abbonati</span>
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-ink-soft">
              Fatturazione ricorrente gestita da Stripe. Gestisci o disdici in
              qualsiasi momento dalla tua{" "}
              <Link href="/account" className="text-terracotta underline">
                pagina account
              </Link>
              .
            </p>
          </div>
          <PricingSubscriptions isLoggedIn={!!session?.user} />
        </div>

        {!session?.user && (
          <p className="text-sm text-ink-soft">
            <Link href="/" className="text-terracotta underline">
              Accedi
            </Link>{" "}
            per procedere all&apos;acquisto.
          </p>
        )}
      </div>
    </main>
  );
}
