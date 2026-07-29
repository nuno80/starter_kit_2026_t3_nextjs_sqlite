import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "~/server/better-auth/server";
import { NotificationSettings } from "~/app/_components/notification-settings";

export default async function NotificationsPage() {
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
          <span className="text-sm text-ink-soft">
            Notifiche (/notifications)
          </span>
        </div>

        <h1 className="font-serif text-4xl font-bold tracking-tight">
          Notifiche push
        </h1>

        <NotificationSettings />
      </div>
    </main>
  );
}
