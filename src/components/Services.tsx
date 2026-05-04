"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

interface Discipline {
  n: string;
  title: string;
  desc: string;
  tag: string;
}

export default function Services() {
  const { t } = useI18n();
  const ti = t as any;

  const eyebrow: string = ti.methodEyebrow || "The Method";
  const title: string = ti.methodTitle || "Four disciplines, one rhythm.";
  const sub: string =
    ti.methodSub ||
    "We built the week as a complete cycle — each session feeds the next so your body progresses without burnout. Show up, follow the rhythm, and let the method do the rest.";

  const disciplines: Discipline[] = ti.disciplines || [
    {
      n: "01",
      title: ti.classInfo?.mobility?.name || "Mobility",
      desc:
        ti.classInfo?.mobility?.description ||
        "Unlock the joints, release tension, and restore range of motion through fluid, intentional sequences.",
      tag: "Mon · Wed · Fri",
    },
    {
      n: "02",
      title: ti.classInfo?.strength?.name || "Strength",
      desc:
        ti.classInfo?.strength?.description ||
        "Functional load work that builds real-world power — kettlebells, bands, bodyweight progressions.",
      tag: "Tue · Thu",
    },
    {
      n: "03",
      title: ti.classInfo?.pilates?.name || "Pilates",
      desc:
        ti.classInfo?.pilates?.description ||
        "Core, control, coordination — classic repertoire with a modern edge to sharpen your centre.",
      tag: "Mon · Wed · Sat",
    },
    {
      n: "04",
      title: ti.classInfo?.funBurn?.name || "Fun Burn",
      desc:
        ti.classInfo?.funBurn?.description ||
        "High-energy cardio fused with play — music, movement, and zero monotony.",
      tag: "Fri · Sat",
    },
  ];

  return (
    <section id="method" className="py-0">
      <style>{`
        @media (max-width: 639px) {
          .disc-card { border-right: none !important; }
        }
      `}</style>
      <div
        className="bg-fb-green rounded-[28px] mx-4 sm:mx-6 lg:mx-8"
        style={{ padding: "clamp(40px, 6vw, 72px) clamp(24px, 4vw, 56px)" }}
      >
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16">
          <div>
            <p
              className="text-fb-paper uppercase font-medium mb-4"
              style={{
                fontSize: "12px",
                letterSpacing: "0.22em",
                opacity: 0.75,
              }}
            >
              {eyebrow}
            </p>
            <h2
              className="text-fb-paper font-medium"
              style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1.1 }}
            >
              {title}
            </h2>
          </div>
          <div className="flex items-end">
            <p
              className="text-fb-paper"
              style={{ fontSize: "16px", opacity: 0.85, lineHeight: 1.6 }}
            >
              {sub}
            </p>
          </div>
        </div>

        {/* Discipline Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}
        >
          {disciplines.map((d, i) => (
            <Link
              href="/book"
              key={d.n}
              className="disc-card flex flex-col justify-between cursor-pointer transition-colors duration-300 no-underline"
              style={{
                padding: "32px 28px",
                minHeight: "340px",
                borderBottom: "1px solid rgba(255,255,255,0.2)",
                borderRight:
                  i < disciplines.length - 1
                    ? "1px solid rgba(255,255,255,0.2)"
                    : "none",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "color-mix(in oklab, var(--fb-green-deep, #1a3a2a) 70%, transparent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "transparent";
              }}
            >
              <div>
                <p
                  className="text-fb-paper font-medium"
                  style={{ fontSize: "44px", opacity: 0.55, marginBottom: "20px" }}
                >
                  {d.n}
                </p>
                <h3
                  className="text-fb-paper font-medium"
                  style={{ fontSize: "28px", marginBottom: "16px", lineHeight: 1.2 }}
                >
                  {d.title}
                </h3>
                <p
                  className="text-fb-paper"
                  style={{ fontSize: "14px", opacity: 0.85, lineHeight: 1.6 }}
                >
                  {d.desc}
                </p>
              </div>
              {d.tag && (
                <p
                  className="text-fb-paper uppercase"
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.12em",
                    opacity: 0.7,
                    marginTop: "24px",
                  }}
                >
                  {d.tag}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
