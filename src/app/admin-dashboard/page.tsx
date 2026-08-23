import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "~/server/better-auth/server";
import { db } from "~/server/db";
import { user } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { hasRole } from "~/lib/roles";
import { AdminDashboardClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/");
  }

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (!hasRole(dbUser?.role, "admin") && !hasRole((session.user as { role?: string }).role, "admin")) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-plaster text-ink">
      <div className="container flex flex-col gap-8 px-4 py-16 max-w-5xl">
        <div className="flex w-full justify-between items-center border-b border-line pb-4">
          <Link href="/" className="font-serif text-2xl font-bold hover:text-terracotta">
            ← Nuno Starter SQlite
          </Link>
          <span className="text-sm font-medium text-terracotta bg-plaster-deep px-3 py-1 rounded-full border border-line">
            Admin Dashboard (/admin-dashboard)
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Amministrazione <span className="text-terracotta">Sistema</span>
          </h1>
          <p className="text-lg text-ink-soft">
            Gestisci i ruoli utente e gli accessi al sistema all&apos;interno del workspace SQLite.
          </p>
        </div>

        <AdminDashboardClient currentUserId={session.user.id} />
      </div>
    </main>
  );
}
