"use client";

import { useI18n, type Lang } from "@/lib/i18n/context";

const langs: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
];

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex items-center gap-1 text-sm">
      {langs.map((l, i) => (
        <span key={l.code} className="flex items-center gap-1">
          {i > 0 && <span className="text-brand-dark/30">|</span>}
          <button
            onClick={() => setLang(l.code)}
            className={`px-1 font-medium transition-colors ${
              lang === l.code
                ? "text-brand-teal"
                : "text-brand-dark/50 hover:text-brand-dark"
            }`}
          >
            {l.label}
          </button>
        </span>
      ))}
    </div>
  );
}
