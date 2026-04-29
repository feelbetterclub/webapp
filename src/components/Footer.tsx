"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";

interface Testimonial {
  id: number;
  author: string;
  text: string;
  classType?: string;
  rating?: number;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function Stars({ count }: { count: number }) {
  return (
    <span className="text-[var(--fb-ochre)] text-sm tracking-wide">
      {Array.from({ length: count }, (_, i) => (
        <span key={i}>★</span>
      ))}
    </span>
  );
}

export default function Footer() {
  const { t } = useI18n();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetch("/api/testimonials")
      .then(async (res) => {
        if (res.ok) setTestimonials(await res.json());
      })
      .catch(() => {});
  }, []);

  /* ── i18n with fallbacks ── */
  const ft = (t as any).footer || {};
  const tag = ft.tag || "Small step — big impact";
  const colA = ft.colA || {
    title: "Classes",
    items: ["Mobility", "Strength", "Pilates", "Fun Burn", "Full schedule"],
  };
  const colB = ft.colB || {
    title: "The Club",
    items: ["About Moni", "The Method", "Rituals (soon)", "Journal"],
  };
  const colC = ft.colC || {
    title: "Contact",
    items: ["hello@feelbetter.club", "Tarifa, Cádiz", "@feelbetter.club"],
  };
  const legal =
    ft.legal || "© 2026 The Feel Better Club · Holistic health routines";
  const rights = ft.rights || "Made in Tarifa, with wind.";

  return (
    <>
      {/* ════════ Testimonials section (separate from footer) ════════ */}
      {testimonials.length > 0 && (
        <section className="bg-[var(--fb-bone)] py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.slice(0, 6).map((tm) => (
                <div
                  key={tm.id}
                  className="bg-[var(--fb-paper)] border border-[var(--fb-green)]/[0.14] rounded-[14px] p-7"
                >
                  <div className="mb-3">
                    <Stars count={tm.rating || 5} />
                  </div>
                  <p className="text-[17px] leading-relaxed text-[var(--fb-green-deep)] mb-5">
                    &ldquo;{tm.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-[44px] h-[44px] rounded-full bg-[var(--fb-green)] text-[var(--fb-paper)] flex items-center justify-center text-sm font-semibold shrink-0">
                      {getInitials(tm.author)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--fb-green-deep)]">
                        {tm.author}
                      </p>
                      {tm.classType && (
                        <p className="text-xs text-[var(--fb-green-deep)]/60">
                          {tm.classType}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════ Footer ════════ */}
      <footer
        className="bg-[var(--fb-green-deep)] text-[var(--fb-paper)]/[0.85]"
        style={{ marginTop: 80, padding: "80px 0 32px" }}
      >
        {/* ── Top grid ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="grid gap-10"
            style={{
              gridTemplateColumns:
                "1.5fr 1fr 1fr 1fr",
            }}
          >
            {/* Responsive override via className */}
            {/* We rely on inline grid + responsive classes below */}
          </div>

          {/* Use a responsive-friendly approach */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10">
            {/* 1 — Logo column */}
            <div>
              <img
                src="/logo-v4-white.svg"
                alt="Feel Better Club"
                className="h-10 w-auto mb-4"
              />
              <p className="text-sm max-w-[28ch] text-[var(--fb-paper)]/75 leading-relaxed">
                {tag}
              </p>
            </div>

            {/* 2 — Classes */}
            <div>
              <h4 className="text-xs uppercase tracking-[0.22em] text-[var(--fb-paper)]/60 mb-4">
                {colA.title}
              </h4>
              <ul className="space-y-2">
                {colA.items.map((item: string) => (
                  <li key={item}>
                    <span className="text-sm text-[var(--fb-paper)]/[0.85] hover:text-white transition-colors cursor-default">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3 — The Club */}
            <div>
              <h4 className="text-xs uppercase tracking-[0.22em] text-[var(--fb-paper)]/60 mb-4">
                {colB.title}
              </h4>
              <ul className="space-y-2">
                {colB.items.map((item: string) => (
                  <li key={item}>
                    <span className="text-sm text-[var(--fb-paper)]/[0.85] hover:text-white transition-colors cursor-default">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 4 — Contact */}
            <div>
              <h4 className="text-xs uppercase tracking-[0.22em] text-[var(--fb-paper)]/60 mb-4">
                {colC.title}
              </h4>
              <ul className="space-y-2">
                {colC.items.map((item: string) => (
                  <li key={item}>
                    <span className="text-sm text-[var(--fb-paper)]/[0.85] hover:text-white transition-colors cursor-default">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          <span className="text-xs text-[var(--fb-paper)]/70">{legal}</span>
          <span className="text-xs text-[var(--fb-paper)]/70">{rights}</span>
        </div>
      </footer>
    </>
  );
}
