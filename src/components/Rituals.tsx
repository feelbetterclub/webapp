"use client";

import { useI18n } from "@/lib/i18n/context";

export default function Rituals() {
  const { t } = useI18n();
  const ti = t as any;

  const eyebrow = ti.rituals?.label || "Rituals";
  const title = ti.rituals?.title || "Coming soon";
  const subtitle =
    ti.rituals?.subtitle ||
    "Sauna, breathwork, ice bath and more — we're preparing something special.";

  return (
    <section id="rituals" className="py-20 bg-fb-bone">
      <div className="mx-auto max-w-2xl px-5 text-center">
        <p className="text-fb-mute uppercase tracking-[0.18em] text-xs font-semibold mb-2">
          {eyebrow}
        </p>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-fb-green mb-4">
          {title}
        </h2>
        <p className="text-fb-mute text-lg leading-relaxed">{subtitle}</p>
      </div>
    </section>
  );
}
