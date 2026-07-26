import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "~/server/better-auth/server";
import { db } from "~/server/db";
import { user } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/");
  }

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (dbUser?.role !== "admin" && (session.user as { role?: string }).role !== "admin") {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-plaster text-ink">
      <div className="container flex flex-col gap-8 px-4 py-16 max-w-4xl">
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
            System <span className="text-terracotta">Administration</span>
          </h1>
          <p className="text-lg text-ink-soft">
            Manage user roles and system access within the SQLite workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="p-6 rounded-lg bg-plaster-deep border border-line flex flex-col gap-2">
            <h3 className="font-serif text-xl font-bold text-ink">Users</h3>
            <p className="text-ink-soft text-sm">Manage registered users and assign dynamic roles.</p>
          </div>
          <div className="p-6 rounded-lg bg-plaster-deep border border-line flex flex-col gap-2">
            <h3 className="font-serif text-xl font-bold text-ink">Roles</h3>
            <p className="text-ink-soft text-sm">Configure system roles and permission scopes.</p>
          </div>
          <div className="p-6 rounded-lg bg-plaster-deep border border-line flex flex-col gap-2">
            <h3 className="font-serif text-xl font-bold text-ink">Security</h3>
            <p className="text-ink-soft text-sm">Review tRPC procedure guards and access logs.</p>
          </div>
        </div>

        <div className="mt-8 p-8 rounded-lg bg-plaster-deep border border-line-strong flex flex-col items-center justify-center text-center gap-4">
          <p className="font-serif text-xl text-ink">Dashboard Skeleton Active</p>
          <p className="text-ink-soft text-sm max-w-md">
            This protected workspace is only visible to sessions with the <code className="text-terracotta font-mono">admin</code> role.
          </p>
        </div>
      </div>
    </main>
  );
}
