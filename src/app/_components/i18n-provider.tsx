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

const dictionaries: Record<Language, () => Promise<Dictionary>> = {
  it: () => import("~/i18n/it").then((m) => m.default),
  en: () => import("~/i18n/en").then((m) => m.default),
};

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof Dictionary) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("it");
  const [dict, setDict] = useState<Dictionary | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("nuno-lang") as Language;
    const initialLang = (saved === "it" || saved === "en") ? saved : "it";
    setLangState(initialLang);
    document.documentElement.lang = initialLang;
  }, []);

  useEffect(() => {
    let mounted = true;
    void dictionaries[lang]().then((d) => {
      if (mounted) setDict(d);
    });
    return () => {
      mounted = false;
    };
  }, [lang]);

  const setLang = (next: Language) => {
    setLangState(next);
    localStorage.setItem("nuno-lang", next);
    document.documentElement.lang = next;
  };

  const t = (key: keyof Dictionary) => (dict ? (dict as unknown as Record<string, string>)[key] : "") ?? key;

  // We mount children immediately. The text will briefly be empty while the chunk loads,
  // preventing layout shift from null-rendering the entire app wrapper.
  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within an I18nProvider");
  return context;
}
