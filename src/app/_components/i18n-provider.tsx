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
}

const dictionaries: Record<Language, Dictionary> = {
  it: {
    "nav.stack": "01 / Architettura",
    "nav.dx": "02 / Dev Experience",
    "nav.phil": "03 / Filosofia",
    "nav.quick": "04 / Quick Start",
    "nav.login": "Accedi",
    "nav.demo": "Demo App",
  },
  en: {
    "nav.stack": "01 / Architecture",
    "nav.dx": "02 / Dev Experience",
    "nav.phil": "03 / Philosophy",
    "nav.quick": "04 / Quick Start",
    "nav.login": "Sign In",
    "nav.demo": "Demo App",
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

  useEffect(() => {
    const saved = localStorage.getItem("t3-lang") as Language;
    if (saved === "it" || saved === "en") setLangState(saved);
  }, []);

  const setLang = (next: Language) => {
    setLangState(next);
    localStorage.setItem("t3-lang", next);
    document.documentElement.lang = next;
  };

  const t = (key: keyof Dictionary) => dictionaries[lang][key] || key;

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
