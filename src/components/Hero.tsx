"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

export default function Hero() {
  const { t } = useI18n();

  /* ---- i18n with fallbacks ---- */
  const h = (t as any).hero ?? {};
  const h1a = h.h1a ?? h.headline1 ?? "Move like you mean it.";
  const h1b = h.h1b ?? h.headline2 ?? "Feel like you deserve it.";
  const sub =
    h.sub ??
    h.subtitle ??
    "A holistic wellness club in Tarifa blending movement, breath-work and community so you can feel extraordinary every single day.";
  const primaryCta = h.primary ?? h.cta1 ?? "Book your first class";
  const ghostCta = h.ghost ?? h.cta2 ?? "See the method";
  const badge = h.badge ?? "Next class · Friday 7:30 am";
  const stats: { n: string; l: string }[] = h.stats ?? [
    { n: "350+", l: "Members" },
    { n: "28", l: "Weekly classes" },
    { n: "4.9★", l: "Avg rating" },
  ];

  return (
    <section className="bg-fb-paper pt-14 pb-10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Two-column grid: single col mobile, 1.25fr + 1fr above 980px */}
        <div className="grid grid-cols-1 min-[980px]:grid-cols-[1.25fr_1fr] items-center gap-10 min-[980px]:gap-16">
          {/* ---- Left column ---- */}
          <div className="order-2 min-[980px]:order-1">
            <h1 className="mb-6">
              {/* Line 1 — display sans */}
              <span className="block font-sans font-medium text-fb-green text-[clamp(40px,5.5vw,80px)] leading-[1] tracking-[-0.035em]">
                {h1a}
              </span>
              {/* Line 2 — script accent */}
              <span
                className="block font-sans font-medium text-fb-green text-[clamp(40px,5.5vw,80px)] leading-[1] tracking-[-0.035em]"
              >
                {h1b}
              </span>
            </h1>

            <p className="text-fb-mute text-lg sm:text-[22px] leading-relaxed max-w-[48ch] mb-8">
              {sub}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-10">
              <Link
                href="/reservar"
                className="inline-flex items-center bg-fb-green text-fb-paper rounded-full px-6 py-3.5 text-base font-semibold transition-colors hover:opacity-90"
              >
                {primaryCta}
                <span className="ml-1.5" aria-hidden="true">
                  &rarr;
                </span>
              </Link>
              <Link
                href="/#method"
                className="inline-flex items-center border border-fb-green text-fb-green rounded-full px-6 py-3.5 text-base font-semibold transition-colors hover:bg-fb-green hover:text-fb-paper"
              >
                {ghostCta}
              </Link>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-6 border-t border-fb-green/25 pt-6">
              {stats.map((s, i) => (
                <div key={i}>
                  <p className="font-sans font-semibold text-fb-green text-[clamp(26px,3vw,38px)] leading-tight">
                    {s.n}
                  </p>
                  <p className="text-fb-mute text-xs uppercase tracking-widest mt-1">
                    {s.l}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ---- Right column ---- */}
          <div className="relative order-1 min-[980px]:order-2">
            {/* Photo placeholder */}
            <div
              className="w-full aspect-[4/3] min-[980px]:aspect-[4/5] bg-fb-green-mist rounded-[28px] flex items-center justify-center"
              data-label="photo-placeholder"
            >
              <span className="text-fb-green/40 text-sm font-medium tracking-wide uppercase select-none">
                Photo placeholder
              </span>
            </div>

            {/* Badge overlay */}
            <div className="absolute top-4 left-4 bg-fb-paper/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
              {/* Pulse dot */}
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fb-terracotta opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-fb-terracotta" />
              </span>
              <span className="text-fb-green text-sm font-medium">
                {badge}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
