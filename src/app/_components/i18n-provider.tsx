"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "it" | "en";

interface Dictionary {
  "nav.stack": string;
  "nav.dx": string;
  "nav.phil": string;
  "nav.quick": string;
  "nav.login": string;
  "nav.demo": string;
  "hero.badge": string;
  "hero.title1": string;
  "hero.title2": string;
  "hero.desc": string;
  "hero.cta.demo": string;
  "hero.cta.stack": string;
  "stack.label": string;
  "stack.title": string;
  "stack.desc": string;
  "stack.db.title": string;
  "stack.db.desc": string;
  "stack.types.title": string;
  "stack.types.desc": string;
  "dx.label": string;
  "dx.title": string;
  "dx.desc": string;
  "dx.metric.docker.title": string;
  "dx.metric.docker.desc": string;
  "dx.metric.latency.title": string;
  "dx.metric.latency.desc": string;
  "dx.metric.migration.title": string;
  "dx.metric.migration.desc": string;
  "phil.label": string;
  "phil.quote": string;
  "phil.author": string;
  "phil.role": string;
  "phil.score.stars": string;
  "phil.score.types": string;
  "phil.score.footprint": string;
  "quick.label": string;
  "quick.title": string;
  "quick.desc": string;
  "quick.cli.copy": string;
  "quick.cli.copied": string;
  "quick.checklist.title": string;
  "quick.checklist.step1": string;
  "quick.checklist.step2": string;
  "quick.checklist.step3": string;
  "quick.cta": string;
}

const dictionaries: Record<Language, Dictionary> = {
  it: {
    "nav.stack": "01 / Architettura",
    "nav.dx": "02 / Dev Experience",
    "nav.phil": "03 / Filosofia",
    "nav.quick": "04 / Quick Start",
    "nav.login": "Accedi",
    "nav.demo": "Demo App",
    "hero.badge": "Artigianato Digitale & Modern Stack",
    "hero.title1": "Ingegneria T3,",
    "hero.title2": "Anima Editoriale.",
    "hero.desc": "Uno starter kit che fonde la robustezza dei tipi end-to-end con l'estetica materica di Plaster & Terracotta. Veloce, locale, senza compromessi.",
    "hero.cta.demo": "Esplora Demo App",
    "hero.cta.stack": "Architettura 01 ↓",
    "stack.label": "01 / Architettura & Tech Stack",
    "stack.title": "Frequenze locali, rigore di tipo.",
    "stack.desc": "La semplicità di un database su file accoppiata con la certezza del fully-typed end-to-end. Niente overhead di rete, niente drift dei contratti.",
    "stack.db.title": "Local SQLite & Drizzle",
    "stack.db.desc": "Un singolo file db.sqlite ad altissime prestazioni per un isolamento immediato, zero latenza di rete e migrazioni istantanee sul tuo disco.",
    "stack.types.title": "End-to-End Type Safety",
    "stack.types.desc": "Dai contratti Zod ai router tRPC e ai componenti React: un unico filo conduttore che cattura gli errori a tempo di compilazione.",
    "dx.label": "02 / Developer Experience",
    "dx.title": "Flusso di lavoro a zero attrito.",
    "dx.desc": "La vera efficienza non si misura in configurazioni complesse, ma nella rapidità d'esecuzione locale. Tutto gira istantaneamente sulla tua macchina.",
    "dx.metric.docker.title": "0s Docker Setup",
    "dx.metric.docker.desc": "Nessun container, nessun orchestration overhead. Il database vive su file nel tuo filesystem locale.",
    "dx.metric.latency.title": "12ms Latenza tRPC",
    "dx.metric.latency.desc": "Le query verso il database su file locale rispondono con tempi da memoria di sistema, azzerando i ritardi di rete.",
    "dx.metric.migration.title": "1 Comando Migration",
    "dx.metric.migration.desc": "Sincronizza e aggiorna il tuo schema istantaneamente con Drizzle Kit, senza attese o complessità esterne.",
    "phil.label": "03 / Filosofia & Vantaggi",
    "phil.quote": "Siamo tornati alla semplicità di un file locale. Niente container, niente latenze di rete esterne, niente drift tra client e server. La robustezza del T3 stack e la chiarezza dell'architettura materica liberano la mente per concentrarsi solo sulla logica dell'applicazione.",
    "phil.author": "Architettura & Team di Core Design",
    "phil.role": "T3 Starter Kit Philosophy",
    "phil.score.stars": "100% Locale",
    "phil.score.types": "Zero Drift",
    "phil.score.footprint": "Ultra-light Footprint",
    "quick.label": "04 / Quick-Start & Checklist",
    "quick.title": "Dalla clonazione alla produzione.",
    "quick.desc": "Avvia il tuo ambiente di sviluppo locale con tre semplici comandi e verifica immediatamente l'infrastruttura con la nostra Demo App.",
    "quick.cli.copy": "Copia comandi",
    "quick.cli.copied": "Copiato!",
    "quick.checklist.title": "Ambiente Locale Pronto",
    "quick.checklist.step1": "Database locale istantaneo su file (db.sqlite) configurato via Drizzle",
    "quick.checklist.step2": "Client e Server sincronizzati end-to-end con contratti di tipo tRPC e Zod",
    "quick.checklist.step3": "Autenticazione Better-Auth predisposta senza server esterni",
    "quick.cta": "Apri la Demo App",
  },
  en: {
    "nav.stack": "01 / Architecture",
    "nav.dx": "02 / Dev Experience",
    "nav.phil": "03 / Philosophy",
    "nav.quick": "04 / Quick Start",
    "nav.login": "Sign In",
    "nav.demo": "Demo App",
    "hero.badge": "Digital Craftsmanship & Modern Stack",
    "hero.title1": "T3 Engineering,",
    "hero.title2": "Editorial Soul.",
    "hero.desc": "A starter kit blending end-to-end type robustness with the tactile aesthetics of Plaster & Terracotta. Fast, local, uncompromising.",
    "hero.cta.demo": "Explore Demo App",
    "hero.cta.stack": "Architecture 01 ↓",
    "stack.label": "01 / Architecture & Tech Stack",
    "stack.title": "Local frequencies, type rigor.",
    "stack.desc": "The simplicity of a file-based database coupled with the absolute certainty of fully-typed end-to-end communication. Zero network overhead, zero contract drift.",
    "stack.db.title": "Local SQLite & Drizzle",
    "stack.db.desc": "A single ultra-high-performance db.sqlite file for immediate isolation, zero network latency, and instant schema migrations on your disk.",
    "stack.types.title": "End-to-End Type Safety",
    "stack.types.desc": "From Zod contracts to tRPC routers and React components: a continuous thread that catches errors at compile time before runtime.",
    "dx.label": "02 / Developer Experience",
    "dx.title": "Zero-friction local workflow.",
    "dx.desc": "True efficiency is not measured in complex cloud orchestration, but in immediate local execution. Everything runs instantly on your machine.",
    "dx.metric.docker.title": "0s Docker Setup",
    "dx.metric.docker.desc": "No containers, no orchestration overhead. The database lives as a file right on your local filesystem.",
    "dx.metric.latency.title": "12ms tRPC Latency",
    "dx.metric.latency.desc": "Queries against the local file database execute with near-memory speed, completely eliminating network latency.",
    "dx.metric.migration.title": "1-Command Schema",
    "dx.metric.migration.desc": "Synchronize and update your schema instantly using Drizzle Kit without waiting or external complexities.",
    "phil.label": "03 / Philosophy & Advantages",
    "phil.quote": "We have returned to the simplicity of a local file. No containers, no external network latencies, no contract drift between client and server. The robustness of the T3 stack and tactile architectural clarity free your mind to focus entirely on application logic.",
    "phil.author": "Architecture & Core Design Team",
    "phil.role": "T3 Starter Kit Philosophy",
    "phil.score.stars": "100% Local-First",
    "phil.score.types": "Zero Contract Drift",
    "phil.score.footprint": "Ultra-light Footprint",
    "quick.label": "04 / Quick-Start & Checklist",
    "quick.title": "From cloning to production.",
    "quick.desc": "Launch your local development environment with three simple commands and immediately verify your infrastructure with our Demo App.",
    "quick.cli.copy": "Copy CLI commands",
    "quick.cli.copied": "Copied!",
    "quick.checklist.title": "Local Environment Ready",
    "quick.checklist.step1": "Instant local file database (db.sqlite) configured via Drizzle ORM",
    "quick.checklist.step2": "Client and Server synchronized end-to-end with tRPC and Zod contracts",
    "quick.checklist.step3": "Better-Auth engine ready without external server dependencies",
    "quick.cta": "Open Demo App",
  },
};

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof Dictionary) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("it");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("t3-lang") as Language;
    if (saved === "it" || saved === "en") setLangState(saved);
  }, []);

  const setLang = (next: Language) => {
    setLangState(next);
    localStorage.setItem("t3-lang", next);
    document.documentElement.lang = next;
  };

  const activeLang = mounted ? lang : "it";
  const t = (key: keyof Dictionary) => (dictionaries[activeLang] as unknown as Record<string, string>)[key] ?? key;

  return (
    <I18nContext.Provider value={{ lang: activeLang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within an I18nProvider");
  return context;
}
