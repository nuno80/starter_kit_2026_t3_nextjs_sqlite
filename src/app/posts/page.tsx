import Link from "next/link";

import { LatestPost } from "~/app/_components/post";
import { AuthForm } from "~/app/_components/auth-form";
import { UserProfile } from "~/app/_components/user-profile";
import { getSession } from "~/server/better-auth/server";
import { api } from "~/trpc/server";

export default async function PostsPage() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await getSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-plaster text-ink">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <div className="flex w-full justify-between items-center border-b border-line pb-4">
          <Link href="/" className="font-serif text-2xl font-bold hover:text-terracotta">
            ← T3 Starter Home
          </Link>
          <span className="text-sm text-ink-soft">Demo App Page (/posts)</span>
        </div>

        <h1 className="font-serif text-5xl font-bold tracking-tight sm:text-6xl text-ink">
          Interactive <span className="text-terracotta">CRUD</span> Workspace
        </h1>
        <p className="text-lg text-ink-soft max-w-xl text-center">
          Test real-time CRUD operations against local <code className="bg-plaster-deep px-2 py-1 rounded border border-line">db.sqlite</code> using tRPC, Drizzle ORM, and Better-Auth.
        </p>

        <div className="flex flex-col items-center gap-2">
          <p className="text-xl text-ink-soft font-medium">
            {hello ? hello.greeting : "Loading tRPC query..."}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 mt-4 bg-plaster-deep p-6 rounded-xl border border-line shadow-sm w-full max-w-md">
            {!session ? <AuthForm /> : <UserProfile user={session.user} />}
          </div>
        </div>

        {session?.user && (
          <div className="w-full max-w-md">
            <LatestPost />
          </div>
        )}
      </div>
    </main>
  );
}
