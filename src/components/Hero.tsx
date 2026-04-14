"use client";

import { useI18n } from "@/lib/i18n/context";

export default function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-brand-teal overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-deep/60 via-brand-teal to-brand-dark/80" />

      <div className="absolute top-20 left-10 w-72 h-72 bg-brand-sage/15 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-cream/8 rounded-full blur-3xl" />

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="The Feel Better Club" className="w-full max-w-sm sm:max-w-md mx-auto mb-8" />

        <p className="text-brand-cream/80 uppercase tracking-[0.25em] text-xs sm:text-sm mb-6">
          {t.hero.tagline}
        </p>

        <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold text-brand-cream mb-6 leading-tight">
          {t.hero.headline1}
          <span className="block text-brand-sage">{t.hero.headline2}</span>
        </h1>

        <p className="text-brand-cream/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          {t.hero.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/#servicios" className="bg-brand-cream text-brand-deep px-8 py-3.5 rounded-full text-base font-semibold hover:bg-white transition-colors shadow-lg">
            {t.hero.cta1}
          </a>
          <a href="/reservar" className="border-2 border-brand-cream/40 text-brand-cream px-8 py-3.5 rounded-full text-base font-semibold hover:bg-brand-cream/10 transition-colors">
            {t.hero.cta2}
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-brand-cream/40 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-brand-cream/60 rounded-full" />
        </div>
      </div>
    </section>
  );
}
