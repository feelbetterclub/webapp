"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

export default function Contact() {
  const { t } = useI18n();

  const cta = (t as any).cta || {
    line1: "Your first class",
    scriptLine: "is on us.",
    desc: "Come once, see how it feels. If it clicks, we'll talk about what fits after.",
    button: "Claim free class",
  };
  const scheduleCta = (t as any).scheduleCta || "See full schedule →";

  return (
    <section id="contact" style={{ padding: "80px 0" }}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 1240 }}>
        <div
          className="rounded-[28px] grid items-center"
          style={{
            backgroundColor: "var(--fb-cream)",
            padding: "80px 56px",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 48,
          }}
        >
          {/* Left column */}
          <div>
            <span
              className="block mb-4 text-sm tracking-widest uppercase"
              style={{ color: "var(--fb-green)", opacity: 0.5 }}
            >
              01 / 01
            </span>

            <h2
              style={{
                fontSize: "clamp(44px, 6vw, 88px)",
                lineHeight: 0.95,
                letterSpacing: "-0.03em",
                color: "var(--fb-green)",
              }}
              className="font-medium"
            >
              {cta.line1}
              <br />
              <span style={{ fontFamily: "var(--f-script)" }}>{cta.scriptLine}</span>
            </h2>

            <p
              className="text-lg"
              style={{ marginTop: 20, color: "var(--fb-green)", opacity: 0.7, maxWidth: 420 }}
            >
              {cta.desc}
            </p>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-3 items-start">
            <Link
              href="/book"
              className="inline-flex items-center justify-center rounded-full text-base font-medium transition-colors"
              style={{
                backgroundColor: "var(--fb-green)",
                color: "var(--fb-paper)",
                padding: "16px 36px",
              }}
            >
              {cta.button} →
            </Link>

            <Link
              href="/book"
              className="inline-flex items-center justify-center rounded-full text-base font-medium transition-colors"
              style={{
                border: "1.5px solid var(--fb-green)",
                color: "var(--fb-green)",
                padding: "16px 36px",
                backgroundColor: "transparent",
              }}
            >
              {scheduleCta}
            </Link>
          </div>
        </div>
      </div>

      {/* Responsive override */}
      <style>{`
        @media (max-width: 820px) {
          #contact .rounded-\\[28px\\] {
            grid-template-columns: 1fr !important;
            padding: 40px 24px !important;
          }
        }
      `}</style>
    </section>
  );
}
