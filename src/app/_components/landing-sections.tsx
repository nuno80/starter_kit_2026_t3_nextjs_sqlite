"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "~/app/_components/i18n-provider";

// Background gradients acting as abstract architectural slides for zero external image dependency
const SLIDES = [
  "from-plaster-warm via-plaster-deep to-terracotta-l/30",
  "from-plaster-deep via-terracotta-l/20 to-olive/20",
  "from-plaster via-brass/20 to-plaster-warm",
];

const BADGES = ["Zod", "tRPC", "Better-Auth", "Turbopack", "Tailwind v4"];

export function HeroSection() {
  const { t } = useI18n();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[85vh] w-full overflow-hidden border-b border-line bg-plaster flex items-center justify-center px-4 py-20 md:px-8">
      {/* Background slider with CSS crossfade and drift */}
      {SLIDES.map((bg, idx) => (
        <div
          key={bg}
          className={`absolute inset-0 bg-gradient-to-br ${bg} transition-opacity duration-1000 ease-in-out animate-drift pointer-events-none ${
            idx === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-plaster/40 backdrop-blur-[2px] pointer-events-none" />

      {/* Editorial Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
        <span className="inline-block rounded-full border border-line-strong bg-plaster/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-ink shadow-2xs">
          {t("hero.badge")}
        </span>

        <h1 className="font-serif text-5xl font-bold tracking-tight text-ink md:text-7xl lg:text-8xl">
          {t("hero.title1")} <br className="hidden sm:inline" />
          <span className="text-terracotta italic font-normal">{t("hero.title2")}</span>
        </h1>

        <p className="max-w-2xl text-lg font-sans text-ink-soft md:text-xl leading-relaxed">
          {t("hero.desc")}
        </p>

        {/* Fact Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {BADGES.map((badge) => (
            <span
              key={badge}
              className="rounded-md bg-plaster-deep/90 border border-line px-3 py-1 text-xs font-mono font-medium text-ink-soft shadow-2xs"
            >
              {badge}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
          <Link
            href="/posts"
            className="rounded-lg bg-terracotta px-8 py-3.5 text-sm font-semibold text-plaster shadow-md transition-all hover:bg-terracotta-d hover:shadow-lg"
          >
            {t("hero.cta.demo")} →
          </Link>
          <a
            href="#stack"
            className="rounded-lg border border-line-strong bg-plaster/80 px-8 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-plaster-deep hover:border-terracotta"
          >
            {t("hero.cta.stack")}
          </a>
        </div>
      </div>
    </section>
  );
}

export function StackSection() {
  const { t } = useI18n();

  return (
    <section id="stack" className="w-full border-b border-line bg-plaster px-4 py-24 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Asymmetrical Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* Left Column: Editorial Statement (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-terracotta">
              {t("stack.label")}
            </span>
            <h2 className="font-serif text-4xl font-bold tracking-tight text-ink md:text-5xl leading-tight">
              {t("stack.title")}
            </h2>
            <p className="font-sans text-base text-ink-soft md:text-lg leading-relaxed">
              {t("stack.desc")}
            </p>
          </div>

          {/* Right Column: Visual Grid of Capabilities & Explanations (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Capability Card 1: Local SQLite & Drizzle */}
            <div className="flex flex-col gap-4 rounded-2xl border border-line bg-plaster-deep/60 p-8 shadow-2xs transition-colors hover:border-terracotta-l">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-terracotta">01. DB</span>
                <span className="rounded bg-plaster px-2 py-0.5 font-mono text-[10px] text-ink-faint border border-line">
                  db.sqlite
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-ink">
                {t("stack.db.title")}
              </h3>
              <p className="font-sans text-sm text-ink-soft leading-relaxed">
                {t("stack.db.desc")}
              </p>
            </div>

            {/* Capability Card 2: End-to-End Type Safety */}
            <div className="flex flex-col gap-4 rounded-2xl border border-line bg-plaster-deep/60 p-8 shadow-2xs transition-colors hover:border-terracotta-l">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-terracotta">02. TYPES</span>
                <span className="rounded bg-plaster px-2 py-0.5 font-mono text-[10px] text-ink-faint border border-line">
                  100% TS
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-ink">
                {t("stack.types.title")}
              </h3>
              <p className="font-sans text-sm text-ink-soft leading-relaxed">
                {t("stack.types.desc")}
              </p>
            </div>

            {/* Capability Card 3: Modern Tech Stack Fact Grid */}
            <div className="sm:col-span-2 rounded-2xl border border-line bg-plaster-deep/60 p-8 shadow-2xs">
              <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-ink-faint mb-6">
                Core Capabilities Grid
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { name: "Zod", desc: "Runtime validation" },
                  { name: "tRPC", desc: "End-to-end RPC" },
                  { name: "Better-Auth", desc: "Modern auth engine" },
                  { name: "Turbopack", desc: "Rust-powered dev" },
                  { name: "Tailwind v4", desc: "CSS-first styling" },
                  { name: "Drizzle ORM", desc: "SQL-like type safety" },
                ].map((item) => (
                  <div key={item.name} className="flex flex-col gap-1 rounded-xl bg-plaster p-4 border border-line/60">
                    <span className="font-serif font-bold text-ink text-base">{item.name}</span>
                    <span className="font-sans text-xs text-ink-faint">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
