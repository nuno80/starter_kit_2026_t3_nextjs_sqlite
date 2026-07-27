"use client";

import { useState } from "react";
import Image from "next/image";
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
    <div className="flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl border border-line bg-plaster p-6 shadow-sm">
      <div className="flex w-full items-center gap-4">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line-strong bg-plaster-deep shadow-inner">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "User avatar"}
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold tracking-wider text-ink">
              {initials}
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-col text-left">
          <h4 className="truncate text-base font-bold text-ink">
            {user.name ?? "Utente"}
          </h4>
          <span className="truncate text-xs font-medium text-ink-soft">
            {user.email}
          </span>
        </div>
      </div>

      <div className="h-[1px] w-full bg-line" />

      <button
        type="button"
        onClick={handleSignOut}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/60 px-4 py-2.5 text-sm font-medium text-red-700 transition-all duration-200 hover:border-red-300 hover:bg-red-100/80 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
      >
        <svg
          className="h-4 w-4 shrink-0 text-red-600"
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
