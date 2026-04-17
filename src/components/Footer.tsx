"use client";

import Image from "next/image";
import { useState, useEffect, type FormEvent } from "react";
import { Star } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

interface Testimonial {
  id: number;
  author: string;
  text: string;
  classType?: string;
  rating?: number;
}

function AskUsForm() {
  const { t } = useI18n();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    const fd = new FormData(e.currentTarget);
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: fd.get("text"),
          replyEmail: fd.get("replyEmail"),
        }),
      });
      setSent(true);
    } catch {
      /* noop */
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return <p className="text-sm text-brand-cream/80">{t.footer.askUsSent}</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <textarea
        name="text"
        required
        rows={2}
        placeholder={t.footer.askUsPlaceholder}
        className="w-full rounded-xl bg-brand-cream/10 border border-brand-cream/20 px-3 py-2 text-sm text-brand-cream placeholder:text-brand-cream/40 resize-none focus:outline-none focus:ring-1 focus:ring-brand-cream/30"
      />
      <input
        name="replyEmail"
        type="email"
        placeholder={t.footer.askUsEmail}
        className="w-full rounded-xl bg-brand-cream/10 border border-brand-cream/20 px-3 py-2 text-sm text-brand-cream placeholder:text-brand-cream/40 focus:outline-none focus:ring-1 focus:ring-brand-cream/30"
      />
      <button
        type="submit"
        disabled={sending}
        className="bg-brand-cream/20 hover:bg-brand-cream/30 text-brand-cream text-sm px-4 py-1.5 rounded-full transition-colors disabled:opacity-50"
      >
        {t.footer.askUsSend}
      </button>
    </form>
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

  return (
    <footer className="bg-brand-deep text-brand-cream/80">
      {/* Testimonials band */}
      {testimonials.length > 0 && (
        <div className="border-b border-brand-cream/10 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="font-heading text-xl font-semibold text-brand-cream mb-8 text-center">
              {t.footer.testimonials}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.slice(0, 6).map((tm) => (
                <div
                  key={tm.id}
                  className="bg-brand-cream/5 border border-brand-cream/10 rounded-2xl p-6"
                >
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: tm.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-brand-cream/60 text-brand-cream/60" />
                    ))}
                  </div>
                  <p className="text-sm text-brand-cream/70 leading-relaxed mb-4">
                    &ldquo;{tm.text}&rdquo;
                  </p>
                  <p className="text-xs font-semibold text-brand-cream">
                    {tm.author}
                    {tm.classType && (
                      <span className="font-normal text-brand-cream/50"> · {tm.classType}</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4-column footer */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* 1. Ask us anything */}
          <div>
            <h4 className="font-semibold text-brand-cream mb-4">{t.footer.askUs}</h4>
            <AskUsForm />
          </div>

          {/* 2. Join our Community */}
          <div>
            <h4 className="font-semibold text-brand-cream mb-4">{t.footer.joinCommunity}</h4>
            <p className="text-sm text-brand-cream/60 mb-4 leading-relaxed">
              {t.footer.joinCommunityText}
            </p>
            <a
              href="/#class-info"
              className="inline-block bg-brand-cream/20 hover:bg-brand-cream/30 text-brand-cream text-sm px-5 py-2 rounded-full transition-colors"
            >
              {t.footer.joinCommunityBtn}
            </a>
          </div>

          {/* 3. Connect and Get Inspired */}
          <div>
            <h4 className="font-semibold text-brand-cream mb-4">{t.footer.connectTitle}</h4>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-brand-cream/10 rounded-full flex items-center justify-center hover:bg-brand-cream/20 transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
            </div>
            <p className="text-xs text-brand-cream/40 mt-3">
              Videos, photos & updates
            </p>
          </div>

          {/* 4. Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo-wide.png"
                alt="Feel Better Club"
                width={100}
                height={36}
                className="h-7 w-auto"
              />
            </div>
            <p className="text-sm leading-relaxed text-brand-cream/50">
              Outdoor Training Community<br />
              Nature · Connection · Fun<br />
              Tarifa, ES
            </p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-brand-cream/10 py-6 text-center text-sm text-brand-cream/40">
        <p>
          &copy; {new Date().getFullYear()} Feel Better Club. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
