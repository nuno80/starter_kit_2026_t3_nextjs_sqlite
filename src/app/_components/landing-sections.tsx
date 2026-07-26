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

export function DxSection() {
  const { t } = useI18n();

  const metrics = [
    { title: t("dx.metric.docker.title"), desc: t("dx.metric.docker.desc"), badge: "0s" },
    { title: t("dx.metric.latency.title"), desc: t("dx.metric.latency.desc"), badge: "12ms" },
    { title: t("dx.metric.migration.title"), desc: t("dx.metric.migration.desc"), badge: "1 cmd" },
  ];

  return (
    <section id="dx" className="w-full border-b border-line bg-plaster-deep/30 px-4 py-24 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        {/* Header */}
        <div className="max-w-3xl flex flex-col gap-4">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-terracotta">
            {t("dx.label")}
          </span>
          <h2 className="font-serif text-4xl font-bold tracking-tight text-ink md:text-5xl leading-tight">
            {t("dx.title")}
          </h2>
          <p className="font-sans text-base text-ink-soft md:text-lg leading-relaxed">
            {t("dx.desc")}
          </p>
        </div>

        {/* 3-Column Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {metrics.map((m, idx) => (
            <div key={idx} className="flex flex-col justify-between rounded-2xl border border-line bg-plaster p-8 shadow-2xs gap-6 transition-colors hover:border-terracotta-l">
              <div className="flex flex-col gap-3">
                <span className="font-mono text-3xl md:text-4xl font-bold text-terracotta tracking-tight">
                  {m.badge}
                </span>
                <h3 className="font-serif text-xl font-bold text-ink">
                  {m.title}
                </h3>
                <p className="font-sans text-sm text-ink-soft leading-relaxed">
                  {m.desc}
                </p>
              </div>
              <div className="pt-4 border-t border-line/60 flex items-center justify-between font-mono text-xs text-ink-faint">
                <span>LOCAL-FIRST</span>
                <span>NUNO-SQLITE</span>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Terminal Visual Block */}
        <div className="rounded-2xl border border-line-strong bg-ink p-6 md:p-8 text-plaster font-mono text-sm shadow-md flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-line/20 pb-4 text-xs text-plaster/60">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-terracotta/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-brass/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-olive/80 inline-block" />
              <span className="ml-2 font-semibold text-plaster-warm">nuno-starter-sqlite — bash</span>
            </div>
            <span>SQLite Local File Environment</span>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-start gap-3">
              <span className="text-terracotta select-none">$</span>
              <p className="text-plaster">pnpm dev <span className="text-plaster/50"># Turbo-powered instant fast refresh</span></p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-terracotta select-none">$</span>
              <p className="text-plaster">pnpm db:push <span className="text-plaster/50"># Zero-latency local schema sync to db.sqlite</span></p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-terracotta select-none">$</span>
              <p className="text-plaster">pnpm db:studio <span className="text-plaster/50"># Visual Drizzle Studio manager</span></p>
            </div>
            <div className="mt-2 text-olive text-xs">
              ✓ Ready in 142ms — Local server listening on http://localhost:3000
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PhilSection() {
  const { t } = useI18n();

  return (
    <section id="filosofia" className="w-full border-b border-line bg-plaster px-4 py-24 md:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center gap-12">
        <span className="text-xs font-mono font-semibold uppercase tracking-widest text-terracotta">
          {t("phil.label")}
        </span>

        {/* Editorial Quote Block with subtle 1px border */}
        <blockquote className="w-full rounded-2xl border border-line bg-plaster-deep/40 p-8 md:p-14 shadow-2xs flex flex-col gap-8">
          <p className="font-serif text-2xl md:text-3xl lg:text-4xl text-ink font-normal leading-relaxed italic">
            &ldquo;{t("phil.quote")}&rdquo;
          </p>
          <footer className="flex flex-col gap-1 items-center justify-center pt-4 border-t border-line/60">
            <cite className="font-sans font-semibold text-ink text-base not-italic">
              {t("phil.author")}
            </cite>
            <span className="font-mono text-xs text-ink-faint uppercase tracking-wider">
              {t("phil.role")}
            </span>
          </footer>
        </blockquote>

        {/* Proof Scores Bar */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          {[
            { label: t("phil.score.stars"), value: "100%" },
            { label: t("phil.score.types"), value: "0" },
            { label: t("phil.score.footprint"), value: "< 1MB" },
          ].map((score, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-6 rounded-xl border border-line bg-plaster-deep/30">
              <span className="font-serif text-3xl font-bold text-terracotta">{score.value}</span>
              <span className="font-mono text-xs font-medium text-ink-soft uppercase tracking-wider mt-1">{score.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function QuickSection() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const commands = `git clone https://github.com/nuno80/starter_kit_2026_t3_nextjs_sqlite.git
cd starter_kit_2026_t3_nextjs_sqlite
pnpm install
pnpm db:push
pnpm dev`;

  const handleCopy = () => {
    void navigator.clipboard.writeText(commands);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="quickstart" className="w-full bg-plaster-deep/40 px-4 py-24 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        {/* Header */}
        <div className="max-w-3xl flex flex-col gap-4">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-terracotta">
            {t("quick.label")}
          </span>
          <h2 className="font-serif text-4xl font-bold tracking-tight text-ink md:text-5xl leading-tight">
            {t("quick.title")}
          </h2>
          <p className="font-sans text-base text-ink-soft md:text-lg leading-relaxed">
            {t("quick.desc")}
          </p>
        </div>

        {/* 2-Column Onboarding Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: CLI Commands Block (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4 rounded-2xl border border-line-strong bg-ink p-6 md:p-8 text-plaster shadow-md">
            <div className="flex items-center justify-between border-b border-line/20 pb-4">
              <span className="font-mono text-xs text-plaster-warm uppercase tracking-wider">
                Terminal — Quick Start
              </span>
              <button
                onClick={handleCopy}
                className="rounded bg-terracotta px-3 py-1.5 font-mono text-xs font-semibold text-plaster transition-colors hover:bg-terracotta-d cursor-pointer"
              >
                {copied ? t("quick.cli.copied") : t("quick.cli.copy")}
              </button>
            </div>
            <pre className="font-mono text-xs md:text-sm text-plaster/90 overflow-x-auto whitespace-pre pt-2 leading-relaxed">
              {commands}
            </pre>
          </div>

          {/* Right Column: Sticky Checklist Box & CTA (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-line bg-plaster p-8 shadow-2xs flex flex-col gap-6 lg:sticky lg:top-24">
            <h3 className="font-serif text-2xl font-bold text-ink border-b border-line pb-4">
              {t("quick.checklist.title")}
            </h3>
            
            <ul className="flex flex-col gap-4 font-sans text-sm text-ink-soft">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-olive/20 text-olive font-bold text-xs mt-0.5">✓</span>
                <span>{t("quick.checklist.step1")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-olive/20 text-olive font-bold text-xs mt-0.5">✓</span>
                <span>{t("quick.checklist.step2")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-olive/20 text-olive font-bold text-xs mt-0.5">✓</span>
                <span>{t("quick.checklist.step3")}</span>
              </li>
            </ul>

            <div className="pt-4 border-t border-line flex flex-col gap-3">
              <Link
                href="/posts"
                className="w-full text-center rounded-lg bg-terracotta px-6 py-3.5 text-sm font-semibold text-plaster shadow-md transition-all hover:bg-terracotta-d hover:shadow-lg block"
              >
                {t("quick.cta")} →
              </Link>
              <span className="font-mono text-[11px] text-center text-ink-faint">
                Test interactive CRUD queries with tRPC & Local SQLite
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
