"use client";

import { useI18n } from "@/lib/i18n/context";

export default function About() {
  const { t } = useI18n();

  // Pillars i18n with fallbacks
  const pillars = (t as any).pillars || {
    eyebrow: "Our philosophy",
    title: "Small step. Big impact.",
    left: {
      eyebrow: "Small step",
      title: "Consistency beats intensity.",
      desc: "Thirty minutes, three times a week. That\u2019s where real change begins \u2014 not in extreme routines, but in showing up with intention, again and again.",
    },
    right: {
      eyebrow: "Big impact",
      title: "Compound, quietly.",
      desc: "The body keeps score of every good decision. Small deposits of movement, breath, and care build a reserve you\u2019ll draw from for decades.",
    },
  };

  // Moni i18n with fallbacks
  const moni = (t as any).moni || (t as any).about?.founder || {
    eyebrow: "About Moni",
    quote: "\u201CHealth isn\u2019t a finish line \u2014 it\u2019s the way you walk the path.\u201D",
    body: "Moni founded Feel Better Club in 2022 after more than 25 years dedicated to movement, coaching, and holistic wellness. Her approach blends functional training, breathwork, and mindful nutrition into a practice that fits real life \u2014 not the other way around.",
    sign: "Moni",
    role: "Founder \u00B7 Coach",
  };

  return (
    <>
      {/* ── Pillars ── */}
      <section id="pillars" className="bg-fb-paper" style={{ padding: "80px 0" }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <p className="text-fb-mute uppercase tracking-[0.2em] text-xs font-semibold mb-3">
            {pillars.eyebrow}
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-fb-green mb-10">
            {pillars.title}
          </h2>

          {/* Two-column grid */}
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            }}
          >
            {/* Left card */}
            <div
              className="bg-fb-cream rounded-[28px] flex flex-col justify-between"
              style={{ padding: "48px 40px", minHeight: 320 }}
            >
              <div>
                <p className="text-fb-mute uppercase tracking-[0.2em] text-xs font-semibold mb-2">
                  {pillars.left.eyebrow}
                </p>
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-fb-green mb-3">
                  {pillars.left.title}
                </h3>
                <p className="text-fb-mute leading-relaxed">{pillars.left.desc}</p>
              </div>
              <span
                className="text-fb-green select-none self-end"
                style={{
                  fontFamily: "var(--f-script)",
                  fontSize: 140,
                  lineHeight: 1,
                  opacity: 0.25,
                }}
              >
                30&apos;
              </span>
            </div>

            {/* Right card */}
            <div
              className="bg-fb-green text-fb-paper rounded-[28px] flex flex-col justify-between"
              style={{ padding: "48px 40px", minHeight: 320 }}
            >
              <div>
                <p
                  className="uppercase tracking-[0.2em] text-xs font-semibold mb-2"
                  style={{ opacity: 0.7 }}
                >
                  {pillars.right.eyebrow}
                </p>
                <h3 className="font-heading text-xl sm:text-2xl font-bold mb-3">
                  {pillars.right.title}
                </h3>
                <p className="leading-relaxed" style={{ opacity: 0.85 }}>
                  {pillars.right.desc}
                </p>
              </div>
              <span
                className="text-fb-paper select-none self-end"
                style={{
                  fontFamily: "var(--f-script)",
                  fontSize: 140,
                  lineHeight: 1,
                  opacity: 0.3,
                }}
              >
                365
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Moni ── */}
      <section id="moni" className="bg-fb-paper" style={{ padding: "120px 0" }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div
            className="grid items-center"
            style={{
              gridTemplateColumns: "1fr 1.1fr",
              gap: 64,
            }}
          >
            {/* Photo placeholder */}
            <div
              className="bg-fb-cream rounded-[28px] w-full"
              style={{ aspectRatio: "4 / 5" }}
            />

            {/* Text */}
            <div>
              <p className="text-fb-mute uppercase tracking-[0.2em] text-xs font-semibold mb-3">
                {moni.eyebrow}
              </p>
              <p
                className="text-fb-green mb-6"
                style={{
                  fontFamily: "var(--f-script)",
                  fontSize: "clamp(32px, 4vw, 52px)",
                  lineHeight: 1.2,
                }}
              >
                {moni.quote}
              </p>
              <p className="text-fb-mute text-lg leading-relaxed mb-8">{moni.body}</p>

              {/* Signature */}
              <div>
                <span
                  className="text-fb-green block"
                  style={{ fontFamily: "var(--f-script)", fontSize: 32 }}
                >
                  {moni.sign}
                </span>
                <span className="text-fb-mute uppercase tracking-[0.15em] text-xs">
                  {moni.role}
                </span>
              </div>
            </div>
          </div>

          {/* Responsive override for < 900px */}
          <style>{`
            @media (max-width: 899px) {
              #moni .grid {
                grid-template-columns: 1fr !important;
                gap: 32px !important;
              }
            }
          `}</style>
        </div>
      </section>
    </>
  );
}
