import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-plaster text-ink p-8">
      <div className="flex flex-col items-center max-w-2xl text-center gap-8 p-12 bg-plaster-deep rounded-2xl border border-line shadow-md">
        <h1 className="font-serif text-5xl font-bold tracking-tight text-ink">
          Plaster & <span className="text-terracotta">Terracotta</span>
        </h1>
        <p className="text-lg text-ink-soft">
          The T3 Starter Kit editorial landing page is currently under construction.
          The typography (Fraunces & Instrument Sans) and design system tokens are configured.
        </p>
        <div className="flex gap-4">
          <Link
            href="/posts"
            className="rounded-lg bg-terracotta px-6 py-3 font-medium text-plaster transition hover:bg-terracotta-d shadow-sm"
          >
            Open Demo App (/posts) →
          </Link>
        </div>
      </div>
    </main>
  );
}

