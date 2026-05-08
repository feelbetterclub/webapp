"use client";

import { useI18n } from "@/lib/i18n/context";

export default function About() {
  const { t } = useI18n();

  // Our Story i18n
  const story = t.about.story;
  const storyLabel = t.about.label;
  const storyTitle = t.about.title;

  // Pillars i18n with fallbacks
  const pillars = t.pillars;

  // Moni i18n with fallbacks
  const moni = t.moni;

  // Split body into paragraphs
  const bodyParagraphs = (moni.body || "").split("\n\n").filter(Boolean);

  return (
    <>
      {/* ── Our Story ── */}
      <section id="about" className="bg-fb-paper" style={{ padding: "80px 0" }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-fb-mute uppercase tracking-[0.2em] text-xs font-semibold mb-3">
            {storyLabel}
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-fb-green mb-8">
            {storyTitle}
          </h2>
          <p className="text-fb-mute text-lg leading-relaxed mb-4">{story.p1}</p>
          <p className="text-fb-mute text-lg leading-relaxed">{story.p2}</p>
        </div>
      </section>

      {/* ── Pillars ── */}
      <section id="pillars" className="bg-fb-paper" style={{ padding: "80px 0" }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-fb-mute uppercase tracking-[0.2em] text-xs font-semibold mb-3">
            {pillars.eyebrow}
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-fb-green mb-10">
            {pillars.title}
          </h2>

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
            className="grid items-stretch"
            style={{
              gridTemplateColumns: "1fr 1.1fr",
              gap: 64,
            }}
          >
            {/* Photo */}
            <div className="rounded-[28px] overflow-hidden w-full min-h-[400px]">
              <img
                src="/meet-moni.webp"
                alt="Moni — Founder & Coach"
                className="w-full h-full object-cover"
              />
            </div>

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
              {bodyParagraphs.map((para: string, idx: number) => (
                <p key={idx} className="text-fb-mute text-lg leading-relaxed mb-4">
                  {para}
                </p>
              ))}

              {/* Signature */}
              <div className="mt-8">
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
