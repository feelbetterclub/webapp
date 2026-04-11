"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import en, { type Translations } from "./en";
import es from "./es";

type Lang = "en" | "es";

const dictionaries: Record<Lang, Translations> = { en, es };

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextValue>({
  lang: "en",
  setLang: () => {},
  t: en,
});

const STORAGE_KEY = "fbc-lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored && dictionaries[stored]) {
      setLangState(stored);
    }
  }, []);

  function setLang(newLang: Lang) {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t: dictionaries[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export type { Lang };
