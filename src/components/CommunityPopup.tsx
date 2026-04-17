"use client";

import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

const STORAGE_KEY = "fbc_popup_dismissed_v1";

export function CommunityPopup() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Delay to avoid interrupting the first paint; first-visit only.
    const seen = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* noop */
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phonePrefix: String(fd.get("phonePrefix") || ""),
      phone: String(fd.get("phone") || ""),
      source: "popup",
    };
    try {
      const res = await fetch("/api/community/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong");
        return;
      }
      setSubmitted(true);
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* noop */
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-deep/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fbc-popup-title"
    >
      <div className="relative w-full max-w-md bg-brand-light rounded-3xl shadow-2xl overflow-hidden">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-brand-dark/60 hover:text-brand-dark z-10"
          aria-label="Close"
        >
          <X size={22} />
        </button>

        {submitted ? (
          <div className="p-8 sm:p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-brand-teal/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#0d5e42" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 id="fbc-popup-title" className="font-heading text-2xl font-bold text-brand-deep mb-3">
              {t.popup.successTitle}
            </h2>
            <p className="text-muted-foreground">{t.popup.successText}</p>
            <button
              onClick={dismiss}
              className="mt-6 bg-brand-teal text-brand-cream px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors"
            >
              {t.popup.close}
            </button>
          </div>
        ) : (
          <>
            <div className="bg-brand-teal p-6 sm:p-8 text-center">
              <p className="text-brand-cream/80 uppercase tracking-[0.2em] text-xs mb-2">
                #FEELBETTERCLUB
              </p>
              <h2 id="fbc-popup-title" className="font-heading text-2xl sm:text-3xl font-bold text-brand-cream">
                {t.popup.title}
              </h2>
              <p className="text-brand-cream/80 text-sm mt-3">{t.popup.subtitle}</p>
            </div>

            <form onSubmit={onSubmit} className="p-6 sm:p-8 space-y-4">
              <div>
                <label className="block text-xs font-medium text-brand-dark mb-1" htmlFor="popup-name">
                  {t.popup.name} *
                </label>
                <input
                  id="popup-name"
                  name="name"
                  type="text"
                  required
                  className="w-full rounded-xl border border-brand-sage/60 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-dark mb-1" htmlFor="popup-email">
                  {t.popup.email} *
                </label>
                <input
                  id="popup-email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-xl border border-brand-sage/60 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
                />
              </div>

              <div className="flex gap-3">
                <div className="w-24">
                  <label className="block text-xs font-medium text-brand-dark mb-1" htmlFor="popup-prefix">
                    {t.popup.prefix} *
                  </label>
                  <input
                    id="popup-prefix"
                    name="phonePrefix"
                    type="text"
                    required
                    placeholder="+34"
                    pattern="\+?[0-9]{1,4}"
                    className="w-full rounded-xl border border-brand-sage/60 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-brand-dark mb-1" htmlFor="popup-phone">
                    {t.popup.phone} *
                  </label>
                  <input
                    id="popup-phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="612 345 678"
                    className="w-full rounded-xl border border-brand-sage/60 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-700">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-teal text-brand-cream py-3 rounded-full font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
              >
                {submitting ? t.popup.submitting : t.popup.cta}
              </button>

              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                {t.popup.disclaimer}
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
