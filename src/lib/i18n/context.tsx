"use client";

import { createContext, useContext, useState, useSyncExternalStore, useCallback, type ReactNode } from "react";
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

function getStoredLang(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
  return stored && dictionaries[stored] ? stored : "en";
}

function subscribeToStorage(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const initialLang = useSyncExternalStore(subscribeToStorage, getStoredLang, () => "en" as Lang);
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
  }, []);

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
