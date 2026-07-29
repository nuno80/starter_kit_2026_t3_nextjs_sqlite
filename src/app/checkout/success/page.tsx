import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-plaster px-4 py-16 text-ink">
      <div className="flex max-w-md flex-col items-center gap-6 rounded-2xl border border-line bg-plaster-deep p-10 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
          <svg
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <h1 className="font-serif text-3xl font-bold">Pagamento ricevuto</h1>
        <p className="text-sm text-ink-soft">
          Grazie! Il pagamento è in elaborazione. Lo stato definitivo viene
          confermato dal webhook Stripe (
          <code className="rounded border border-line bg-plaster px-1.5 py-0.5">
            /api/webhooks/stripe
          </code>
          ), non da questa pagina — evita di dare accesso a contenuti a
          pagamento basandoti solo su questo redirect.
        </p>
        {session_id && (
          <p className="font-mono text-xs text-ink-faint">
            Session ID: {session_id}
          </p>
        )}
        <Link
          href="/"
          className="rounded-xl bg-terracotta px-5 py-2.5 text-sm font-semibold text-plaster transition hover:bg-terracotta-d"
        >
          Torna alla home
        </Link>
      </div>
    </main>
  );
}
