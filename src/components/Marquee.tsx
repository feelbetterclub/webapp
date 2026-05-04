"use client";

import { useI18n } from "@/lib/i18n/context";

const FALLBACK_TAGLINES = [
  "Health routines community",
  "Small step — big impact",
  "Move \u00B7 Breathe \u00B7 Feel",
  "Tarifa \u00B7 Costa de la Luz",
];

export default function Marquee() {
  const { t } = useI18n();
  const taglines: string[] =
    (t as Record<string, unknown>).marquee as string[] || FALLBACK_TAGLINES;

  // Duplicate for seamless loop
  const doubled = [...taglines, ...taglines];

  return (
    <>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <div
        className="bg-fb-green text-fb-paper overflow-hidden"
        style={{ height: "40px" }}
      >
        <div
          className="flex items-center h-full whitespace-nowrap"
          style={{
            animation: "marquee 40s linear infinite",
            width: "max-content",
          }}
        >
          {doubled.map((line, i) => (
            <span key={i} className="flex items-center">
              {i > 0 && (
                <span
                  className="inline-block rounded-full mx-5 flex-shrink-0"
                  style={{
                    width: "6px",
                    height: "6px",
                    backgroundColor: "rgba(255,255,255,0.6)",
                  }}
                />
              )}
              <span
                className="font-medium uppercase"
                style={{
                  fontSize: "13px",
                  letterSpacing: "0.22em",
                }}
              >
                {line}
              </span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
