"use client";

import { useI18n } from "@/lib/i18n/context";

export default function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-brand-teal overflow-hidden">
      {/* Gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-deep/70 via-brand-teal to-brand-dark/80" />

      {/* Decorative palm frond SVG — shaded for text legibility */}
      <svg
        className="absolute -right-20 -top-10 w-[500px] h-[500px] text-brand-cream/10 pointer-events-none"
        viewBox="0 0 200 200"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M100 20 C 105 60 110 90 120 110 C 140 90 160 85 180 90 C 160 100 140 115 130 130 C 150 130 170 140 185 155 C 160 150 140 155 130 165 C 145 175 155 190 160 205 C 140 185 120 180 105 185 C 105 170 105 150 100 20 Z" />
        <path d="M100 20 C 95 60 90 90 80 110 C 60 90 40 85 20 90 C 40 100 60 115 70 130 C 50 130 30 140 15 155 C 40 150 60 155 70 165 C 55 175 45 190 40 205 C 60 185 80 180 95 185 C 95 170 95 150 100 20 Z" />
      </svg>
      <svg
        className="absolute -left-32 bottom-0 w-[400px] h-[400px] text-brand-cream/8 pointer-events-none rotate-12"
        viewBox="0 0 200 200"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M100 20 C 105 60 110 90 120 110 C 140 90 160 85 180 90 C 160 100 140 115 130 130 C 150 130 170 140 185 155 C 160 150 140 155 130 165 C 145 175 155 190 160 205 C 140 185 120 180 105 185 C 105 170 105 150 100 20 Z" />
        <path d="M100 20 C 95 60 90 90 80 110 C 60 90 40 85 20 90 C 40 100 60 115 70 130 C 50 130 30 140 15 155 C 40 150 60 155 70 165 C 55 175 45 190 40 205 C 60 185 80 180 95 185 C 95 170 95 150 100 20 Z" />
      </svg>

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="The Feel Better Club" className="w-full max-w-sm sm:max-w-md mx-auto mb-8" />

        <p className="text-brand-cream/80 uppercase tracking-[0.25em] text-xs sm:text-sm mb-6">
          {t.hero.tagline}
        </p>

        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-brand-cream mb-6 leading-tight">
          {t.hero.headline1}
          <span className="block text-brand-sage">{t.hero.headline2}</span>
        </h1>

        <p className="text-brand-cream/80 text-lg sm:text-xl max-w-2xl mx-auto mb-4 leading-relaxed">
          {t.hero.subtitle}
        </p>

        <p className="text-brand-cream/60 text-sm sm:text-base italic mb-10">
          {t.hero.comingSoon}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/#class-info"
            className="bg-brand-cream text-brand-deep px-8 py-3.5 rounded-full text-base font-semibold hover:bg-white transition-colors shadow-lg"
          >
            {t.hero.cta1}
          </a>
          <a
            href="/reservar"
            className="border-2 border-brand-cream/40 text-brand-cream px-8 py-3.5 rounded-full text-base font-semibold hover:bg-brand-cream/10 transition-colors"
          >
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
