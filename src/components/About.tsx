"use client";

import { CheckCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export default function About() {
  const { t } = useI18n();

  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {/* Our Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-brand-teal to-brand-dark overflow-hidden shadow-xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-8">
                  <p className="text-brand-cream/60 uppercase tracking-[0.3em] text-xs mb-4">
                    Est. 2026
                  </p>
                  <p className="font-heading text-5xl sm:text-6xl font-bold text-brand-cream mb-4">
                    Feel<br />Better
                  </p>
                  <p className="text-brand-cream/80 italic text-lg">Club</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-brand-cream rounded-2xl shadow-lg flex items-center justify-center">
              <div className="text-center">
                <p className="font-heading text-3xl font-bold text-brand-teal">+500</p>
                <p className="text-brand-dark text-xs font-medium">{t.about.stat}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-brand-teal uppercase tracking-[0.2em] text-xs font-semibold mb-3">
              {t.about.label}
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-brand-deep mb-6">
              {t.about.title}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              {t.about.story.p1}
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              {t.about.story.p2}
            </p>

            <ul className="space-y-4">
              {t.about.highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-brand-teal mt-0.5 shrink-0" />
                  <span className="text-brand-deep font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Meet the Founder & Coach */}
        <div id="founder" className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="lg:order-2 relative">
            <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-brand-cream to-brand-sage overflow-hidden shadow-xl flex items-center justify-center">
              <div className="text-center px-8">
                <p className="text-brand-teal uppercase tracking-[0.3em] text-xs mb-4">
                  Founder & Coach
                </p>
                <p className="font-heading text-6xl sm:text-7xl font-bold text-brand-deep mb-2">
                  Moni
                </p>
                <p className="text-brand-dark/70 italic">+25 years in sports</p>
              </div>
            </div>
          </div>

          <div className="lg:order-1">
            <p className="text-brand-teal uppercase tracking-[0.2em] text-xs font-semibold mb-3">
              {t.about.founder.label}
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-brand-deep mb-6">
              {t.about.founder.heading}
            </h2>
            <div className="space-y-5 text-muted-foreground leading-relaxed">
              <p>{t.about.founder.p1}</p>
              <p>{t.about.founder.p2}</p>
              <p>{t.about.founder.p3}</p>
              <p>{t.about.founder.p4}</p>
              <p>{t.about.founder.p5}</p>
              <p className="font-heading text-brand-deep italic text-lg pt-2">
                {t.about.founder.signoff}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
