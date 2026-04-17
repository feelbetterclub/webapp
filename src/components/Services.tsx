"use client";

import { Waves, Dumbbell, Sparkles, Music } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { useI18n } from "@/lib/i18n/context";

type ClassKey = "mobility" | "strength" | "pilates" | "funBurn";

interface ClassCard {
  icon: LucideIcon;
  key: ClassKey;
}

const classes: ClassCard[] = [
  { icon: Waves, key: "mobility" },
  { icon: Dumbbell, key: "strength" },
  { icon: Sparkles, key: "pilates" },
  { icon: Music, key: "funBurn" },
];

export default function Services() {
  const { t } = useI18n();

  return (
    <section id="class-info" className="py-24 bg-brand-light">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label={t.classInfo.label}
          title={t.classInfo.title}
          description={t.classInfo.subtitle}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {classes.map((c) => (
            <div
              key={c.key}
              className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-brand-sage/30 hover:-translate-y-1 flex flex-col"
            >
              <div className="w-14 h-14 bg-brand-teal/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-teal/20 transition-colors">
                <c.icon className="w-7 h-7 text-brand-teal" />
              </div>
              <h3 className="font-heading text-2xl font-semibold text-brand-deep mb-3">
                {t.classInfo[c.key].name}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm mb-6 flex-grow">
                {t.classInfo[c.key].description}
              </p>
              <a
                href="/reservar"
                className="inline-block self-start bg-brand-teal text-brand-cream px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors"
              >
                {t.classInfo.bookButton}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
