"use client";

import { Leaf, Flame, Wind, Snowflake } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

const items = [
  { icon: Leaf, label: "Nutrition" },
  { icon: Flame, label: "Sauna" },
  { icon: Wind, label: "Breathwork" },
  { icon: Snowflake, label: "Ice Bath" },
];

export default function Rituals() {
  const { t } = useI18n();

  return (
    <section id="rituals" className="relative py-24 bg-brand-teal overflow-hidden">
      {/* Decorative palm frond */}
      <svg
        className="absolute -right-32 -bottom-20 w-[500px] h-[500px] text-brand-cream/8 pointer-events-none rotate-45"
        viewBox="0 0 200 200"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M100 20 C 105 60 110 90 120 110 C 140 90 160 85 180 90 C 160 100 140 115 130 130 C 150 130 170 140 185 155 C 160 150 140 155 130 165 C 145 175 155 190 160 205 C 140 185 120 180 105 185 C 105 170 105 150 100 20 Z" />
        <path d="M100 20 C 95 60 90 90 80 110 C 60 90 40 85 20 90 C 40 100 60 115 70 130 C 50 130 30 140 15 155 C 40 150 60 155 70 165 C 55 175 45 190 40 205 C 60 185 80 180 95 185 C 95 170 95 150 100 20 Z" />
      </svg>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-brand-cream/70 uppercase tracking-[0.2em] text-xs font-semibold mb-3">
          {t.rituals.label}
        </p>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-brand-cream mb-6">
          {t.rituals.title}
        </h2>
        <p className="text-brand-cream/80 text-lg leading-relaxed max-w-2xl mx-auto mb-12">
          {t.rituals.subtitle}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((i) => (
            <div
              key={i.label}
              className="bg-brand-cream/10 backdrop-blur-sm rounded-2xl p-6 border border-brand-cream/20"
            >
              <i.icon className="w-8 h-8 text-brand-cream mx-auto mb-3" />
              <p className="text-brand-cream font-medium">{i.label}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-brand-cream/60 italic text-sm">
          {t.rituals.comingSoon}
        </p>
      </div>
    </section>
  );
}
