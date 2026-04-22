"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";

const STORAGE_KEY = "fb_popup_dismissed";

export function CommunityPopup() {
  const { t } = useI18n();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  /* ── i18n with fallbacks ── */
  const p = (t as any).popup || {};
  const badge = p.badge || "First class on us";
  const titleLine1 = p.titleLine1 || "Try your";
  const titleScript = p.titleScript || "first class free";
  const body =
    p.body || "Come meet us with no commitment — one outdoor session to see how you feel.";
  const cta = p.cta || "Book my free class";
  const dismiss = p.dismiss || "Maybe later";
  const foot1 = p.foot1 || "No credit card";
  const foot2 = p.foot2 || "Small groups";
  const foot3 = p.foot3 || "Outdoor sessions";

  /* ── Show after 8s if not dismissed this session ── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    const timer = setTimeout(() => {
      setVisible(true);
      // Trigger enter animation on next frame
      requestAnimationFrame(() => setAnimate(true));
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  /* ── Dismiss handler ── */
  const close = useCallback(() => {
    setAnimate(false);
    // Wait for exit animation then unmount
    setTimeout(() => setVisible(false), 350);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* noop */
    }
  }, []);

  /* ── CTA handler ── */
  const handleCta = useCallback(() => {
    close();
    router.push("/reservar");
  }, [close, router]);

  /* ── ESC key ── */
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, close]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fbc-popup-title"
      onClick={close}
      style={{
        background:
          "color-mix(in oklab, var(--fb-green-deep) 70%, transparent)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        opacity: animate ? 1 : 0,
        transition: "opacity 350ms ease",
      }}
    >
      {/* ── Card ── */}
      <div
        className="relative w-full max-w-[720px] bg-fb-paper rounded-[28px] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "grid",
          gridTemplateColumns: "1.25fr 1fr",
          transform: animate
            ? "translateY(0) scale(1)"
            : "translateY(28px) scale(0.97)",
          opacity: animate ? 1 : 0,
          transition:
            "transform 400ms cubic-bezier(.2,.8,.2,1), opacity 400ms cubic-bezier(.2,.8,.2,1)",
        }}
      >
        {/* ── Close button ── */}
        <button
          onClick={close}
          className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full text-fb-green hover:text-fb-paper hover:bg-fb-green transition-colors text-lg leading-none"
          style={{
            backgroundColor: "rgba(var(--fb-paper-rgb, 255 252 247), 0.8)",
          }}
          aria-label="Close"
        >
          ×
        </button>

        {/* ── Left column ── */}
        <div
          className="flex flex-col justify-center"
          style={{ padding: "40px 36px" }}
        >
          {/* Badge */}
          <span
            className="inline-block self-start rounded-full text-fb-green font-semibold"
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              backgroundColor: "rgba(var(--fb-green-rgb, 45 106 79), 0.1)",
              padding: "6px 10px",
            }}
          >
            {badge}
          </span>

          {/* Title */}
          <h3
            id="fbc-popup-title"
            className="font-display text-fb-ink mt-4"
            style={{
              fontSize: "clamp(30px, 4vw, 40px)",
              lineHeight: 1.05,
            }}
          >
            {titleLine1}
            <br />
            <span
              className="text-fb-green"
              style={{
                fontFamily: "var(--f-script, 'Caveat', cursive)",
                fontSize: "1.15em",
              }}
            >
              {titleScript}
            </span>
          </h3>

          {/* Body */}
          <p
            className="text-fb-mute mt-4"
            style={{ fontSize: 15, maxWidth: "40ch" }}
          >
            {body}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={handleCta}
              className="bg-fb-green text-fb-paper px-6 py-3 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              {cta}
            </button>
            <button
              onClick={close}
              className="text-fb-mute text-sm hover:underline bg-transparent border-none cursor-pointer"
            >
              {dismiss}
            </button>
          </div>

          {/* Foot checks */}
          <div
            className="flex flex-wrap gap-x-4 gap-y-1 mt-5 text-fb-mute"
            style={{ fontSize: 12 }}
          >
            <span>✓ {foot1}</span>
            <span>✓ {foot2}</span>
            <span>✓ {foot3}</span>
          </div>
        </div>

        {/* ── Right column ── */}
        <div
          className="hidden min-[640px]:flex flex-col justify-between bg-fb-green text-fb-paper relative overflow-hidden"
          style={{ padding: "40px 32px" }}
        >
          {/* Gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, color-mix(in oklab, var(--fb-terracotta) 60%, transparent) 0%, transparent 55%)",
              opacity: 0.4,
            }}
          />

          {/* Monogram */}
          <span
            className="relative z-[1]"
            style={{
              fontFamily: "var(--f-script, 'Caveat', cursive)",
              fontSize: 96,
              lineHeight: 1,
            }}
          >
            FBC
          </span>

          {/* Established */}
          <span
            className="relative z-[1]"
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.22em",
              opacity: 0.8,
            }}
          >
            Est. 2026 · Tarifa
          </span>
        </div>
      </div>

      {/* ── Responsive: single column below 640px ── */}
      <style>{`
        @media (max-width: 639px) {
          [aria-labelledby="fbc-popup-title"] > div:first-child {
            grid-template-columns: 1fr !important;
          }
          [aria-labelledby="fbc-popup-title"] > div:first-child > div:first-of-type {
            padding: 32px 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
