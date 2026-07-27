"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { authClient } from "~/lib/auth-client";
import { AuthForm } from "~/app/_components/auth-form";
import { UserProfile } from "~/app/_components/user-profile";
import { useI18n } from "~/app/_components/i18n-provider";

export function Navbar() {
  const pathname = usePathname();
  const { lang, setLang, t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  const [authOpen, setAuthOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const authRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (authRef.current && !authRef.current.contains(e.target as Node)) {
        setAuthOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/#stack", label: t("nav.stack") },
    { href: "/#dx", label: t("nav.dx") },
    { href: "/#filosofia", label: t("nav.phil") },
    { href: "/#quickstart", label: t("nav.quick") },
  ];

  const initials = session?.user
    ? (session.user.name ?? session.user.email ?? "U").slice(0, 2).toUpperCase()
    : "";

  if (!mounted) {
    return (
      <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-line bg-plaster/90 px-4 py-3 text-ink backdrop-blur-md md:px-8">
        <Link href="/" className="flex items-baseline gap-2 font-serif text-xl font-bold tracking-tight text-ink">
          <span>Nuno</span>
          <span className="font-sans text-xs font-normal tracking-widest text-ink-soft uppercase">Starter SQlite</span>
        </Link>
        <ul className="hidden items-center gap-6 text-sm font-medium text-ink-soft md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="transition-colors hover:text-terracotta">
                {link.label}
              </Link>
            </li>
          ))}
          {pathname !== "/posts" && (
            <li>
              <Link href="/posts" className="rounded-md bg-plaster-deep px-2.5 py-1 text-xs font-semibold text-ink border border-line">
                {t("nav.demo")} →
              </Link>
            </li>
          )}
          {session?.user && ((session.user as { role?: string }).role?.split(",").map(r => r.trim()).includes("admin")) && (
            <li>
              <Link href="/admin-dashboard" className="rounded-md bg-terracotta/10 px-2.5 py-1 text-xs font-semibold text-terracotta border border-terracotta/30">
                Admin ⚙️
              </Link>
            </li>
          )}
        </ul>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-line bg-plaster-deep px-3 py-1.5 text-xs font-semibold tracking-wider text-ink">
            <span className="uppercase">{lang}</span>
          </div>
          <div className="h-8 w-16 animate-pulse rounded-lg bg-plaster-deep border border-line" />
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-line bg-plaster/90 px-4 py-3 text-ink backdrop-blur-md md:px-8">
      {/* Brand */}
      <Link href="/" className="flex items-baseline gap-2 font-serif text-xl font-bold tracking-tight text-ink hover:text-terracotta">
        <span>Nuno</span>
        <span className="font-sans text-xs font-normal tracking-widest text-ink-soft uppercase">Starter SQlite</span>
      </Link>

      {/* Navigation links (01-04) - only relevant on / or smooth scroll */}
      <ul className="hidden items-center gap-6 text-sm font-medium text-ink-soft md:flex">
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="transition-colors hover:text-terracotta"
            >
              {link.label}
            </Link>
          </li>
        ))}
        {pathname !== "/posts" && (
          <li>
            <Link
              href="/posts"
              className="rounded-md bg-plaster-deep px-2.5 py-1 text-xs font-semibold text-ink border border-line transition-colors hover:border-terracotta hover:text-terracotta"
            >
              {t("nav.demo")} →
            </Link>
          </li>
        )}
        {session?.user && ((session.user as { role?: string }).role?.split(",").map(r => r.trim()).includes("admin")) && (
          <li>
            <Link
              href="/admin-dashboard"
              className="rounded-md bg-terracotta/10 px-2.5 py-1 text-xs font-semibold text-terracotta border border-terracotta/30 transition-colors hover:bg-terracotta hover:text-plaster"
            >
              Admin ⚙️
            </Link>
          </li>
        )}
      </ul>

      {/* Right controls: Lang globe & Auth Widget */}
      <div className="flex items-center gap-3">
        {/* Lang Selector */}
        <div className="relative" ref={langRef}>
          <button
            type="button"
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 rounded-full border border-line bg-plaster-deep px-3 py-1.5 text-xs font-semibold tracking-wider text-ink transition-colors hover:border-terracotta"
            aria-label="Toggle language"
            aria-expanded={langOpen}
          >
            <svg
              className="h-3.5 w-3.5 text-ink-soft"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
            <span className="uppercase">{lang}</span>
          </button>

          {langOpen && (
            <div className="absolute right-0 mt-2 w-36 rounded-xl border border-line bg-plaster p-1.5 shadow-md">
              <button
                type="button"
                onClick={() => {
                  setLang("it");
                  setLangOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                  lang === "it"
                    ? "bg-plaster-deep font-bold text-terracotta"
                    : "text-ink hover:bg-plaster-deep/50"
                }`}
              >
                <span>Italiano</span>
                <span className="text-[10px] font-bold">IT</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLang("en");
                  setLangOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                  lang === "en"
                    ? "bg-plaster-deep font-bold text-terracotta"
                    : "text-ink hover:bg-plaster-deep/50"
                }`}
              >
                <span>English</span>
                <span className="text-[10px] font-bold">EN</span>
              </button>
            </div>
          )}
        </div>

        {/* Auth Widget */}
        <div className="relative" ref={authRef}>
          {isPending ? (
            <div className="h-8 w-16 animate-pulse rounded-lg bg-plaster-deep border border-line" />
          ) : session ? (
            <>
              <button
                type="button"
                onClick={() => setAuthOpen(!authOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-plaster-deep text-xs font-bold text-terracotta shadow-sm transition-transform hover:scale-105"
                aria-label="User profile menu"
                aria-expanded={authOpen}
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? "Avatar"}
                    width={32}
                    height={32}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  initials
                )}
              </button>

              {authOpen && (
                <div className="absolute right-0 mt-2 z-50">
                  <UserProfile user={session.user} />
                </div>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setAuthOpen(!authOpen)}
                className="rounded-lg bg-terracotta px-4 py-1.5 text-xs font-semibold text-plaster shadow-sm transition-colors hover:bg-terracotta-d"
                aria-expanded={authOpen}
                data-testid="nav-login-btn"
              >
                {t("nav.login")}
              </button>

              {authOpen && (
                <div className="absolute right-0 mt-2 z-50" data-testid="auth-overlay">
                  <AuthForm />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
