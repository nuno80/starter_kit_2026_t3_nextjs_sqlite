"use client";

import { useState } from "react";
import { authClient } from "~/server/better-auth/client";

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = isSignUp
      ? await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: "/",
        })
      : await authClient.signIn.email({ email, password, callbackURL: "/" });

    if (res.error) {
      setError(res.error.message ?? "Errore durante l'autenticazione");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-zinc-950/60 p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl transition-all duration-300">
      <div className="mb-6 text-left">
        <h3 className="text-2xl font-bold tracking-tight text-white">
          {isSignUp ? "Crea un account" : "Bentornato"}
        </h3>
        <p className="mt-1 text-sm text-zinc-400">
          {isSignUp
            ? "Inserisci i tuoi dati per iniziare"
            : "Accedi per continuare verso la tua dashboard"}
        </p>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-950/40 p-3.5 text-xs font-medium text-red-300">
          <svg
            className="h-4 w-4 shrink-0 text-red-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {isSignUp && (
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-medium tracking-wider text-zinc-400 uppercase">
              Nome Completo
            </label>
            <input
              type="text"
              placeholder="Mario Rossi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] transition-all duration-200 focus:border-white/30 focus:bg-white/[0.06] focus:ring-2 focus:ring-white/10 focus:outline-none"
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-xs font-medium tracking-wider text-zinc-400 uppercase">
            Email
          </label>
          <input
            type="email"
            placeholder="nome@esempio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] transition-all duration-200 focus:border-white/30 focus:bg-white/[0.06] focus:ring-2 focus:ring-white/10 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-xs font-medium tracking-wider text-zinc-400 uppercase">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] transition-all duration-200 focus:border-white/30 focus:bg-white/[0.06] focus:ring-2 focus:ring-white/10 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-all duration-200 hover:bg-zinc-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg
                className="h-4 w-4 animate-spin text-zinc-950"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span>
                {isSignUp ? "Creazione in corso..." : "Accesso in corso..."}
              </span>
            </>
          ) : (
            <span>{isSignUp ? "Crea account" : "Accedi"}</span>
          )}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-[1px] flex-1 bg-white/10" />
        <span className="text-[11px] font-medium tracking-widest text-zinc-500 uppercase">
          Oppure
        </span>
        <div className="h-[1px] flex-1 bg-white/10" />
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() =>
            authClient.signIn.social({ provider: "github", callbackURL: "/" })
          }
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:border-white/20 hover:bg-zinc-900 active:scale-[0.98]"
        >
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
          <span>Continua con GitHub</span>
        </button>

        <button
          type="button"
          onClick={() =>
            authClient.signIn.social({ provider: "google", callbackURL: "/" })
          }
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.98]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continua con Google</span>
        </button>
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError("");
          }}
          className="text-xs text-zinc-400 transition-colors duration-200 hover:text-white"
        >
          {isSignUp
            ? "Hai già un account? Accedi"
            : "Non hai un account? Registrati"}
        </button>
      </div>
    </div>
  );
}
