import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "~/server/better-auth/server";
import { BillingStatus } from "~/app/_components/billing-status";

export default async function AccountPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-plaster px-4 py-16 text-ink">
      <div className="container flex max-w-2xl flex-col items-center gap-10">
        <div className="flex w-full items-center justify-between border-b border-line pb-4">
          <Link
            href="/"
            className="font-serif text-2xl font-bold hover:text-terracotta"
          >
            ← Nuno Starter SQlite
          </Link>
          <span className="text-sm text-ink-soft">Account (/account)</span>
        </div>

        <h1 className="font-serif text-4xl font-bold tracking-tight">
          Il tuo account
        </h1>

        <BillingStatus />

        <Link href="/pricing" className="text-sm text-terracotta underline">
          Vedi tutti i piani
        </Link>
      </div>
    </main>
  );
}
