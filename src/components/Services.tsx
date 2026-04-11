"use client";

import { Sun, Wind, Heart, Leaf, Waves, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { useI18n } from "@/lib/i18n/context";

interface Service {
  icon: LucideIcon;
  key: "mobility" | "strength" | "pilates" | "breathwork" | "soundHealing" | "nutrition";
}

const services: Service[] = [
  { icon: Sun, key: "mobility" },
  { icon: Heart, key: "strength" },
  { icon: Wind, key: "breathwork" },
  { icon: Sparkles, key: "pilates" },
  { icon: Waves, key: "soundHealing" },
  { icon: Leaf, key: "nutrition" },
];

export default function Services() {
  const { t } = useI18n();

  return (
    <section id="servicios" className="py-24 bg-brand-light">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader label={t.rituals.label} title={t.rituals.title} description={t.rituals.subtitle} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s) => (
            <div key={s.key} className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-brand-sage/30 hover:-translate-y-1">
              <div className="w-14 h-14 bg-brand-teal/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-teal/20 transition-colors">
                <s.icon className="w-7 h-7 text-brand-teal" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-brand-deep mb-3">
                {t.rituals[s.key].name}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {t.rituals[s.key].description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
