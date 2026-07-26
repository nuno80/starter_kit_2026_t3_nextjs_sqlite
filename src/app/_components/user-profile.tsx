"use client";

import { useState } from "react";
import { authClient } from "~/server/better-auth/client";

interface UserProfileProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserProfile({ user }: UserProfileProps) {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  const initials = (user.name ?? user.email ?? "U").slice(0, 2).toUpperCase();

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5 rounded-[2rem] border border-white/10 bg-zinc-950/60 p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl">
      <div className="flex w-full items-center gap-4">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-zinc-900 shadow-inner">
          {user.image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={user.image}
              alt={user.name ?? "User avatar"}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold tracking-wider text-zinc-300">
              {initials}
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-col text-left">
          <h4 className="truncate text-base font-bold text-white">
            {user.name ?? "Utente"}
          </h4>
          <span className="truncate text-xs font-medium text-zinc-400">
            {user.email}
          </span>
        </div>
      </div>

      <div className="h-[1px] w-full bg-white/10" />

      <button
        type="button"
        onClick={handleSignOut}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-950/30 px-4 py-2.5 text-sm font-medium text-red-300 transition-all duration-200 hover:border-red-500/30 hover:bg-red-950/50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
      >
        <svg
          className="h-4 w-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span>{loading ? "Uscita in corso..." : "Disconnettiti"}</span>
      </button>
    </div>
  );
}
