import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-plaster px-4 py-16 text-ink">
      <div className="flex max-w-md flex-col items-center gap-6 rounded-2xl border border-line bg-plaster-deep p-10 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-plaster text-ink-soft border border-line">
          <svg
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="font-serif text-3xl font-bold">
          Checkout annullato
        </h1>
        <p className="text-sm text-ink-soft">
          Nessun addebito è stato effettuato. Puoi riprovare quando vuoi.
        </p>
        <Link
          href="/pricing"
          className="rounded-xl bg-terracotta px-5 py-2.5 text-sm font-semibold text-plaster transition hover:bg-terracotta-d"
        >
          Torna ai prezzi
        </Link>
      </div>
    </main>
  );
}
