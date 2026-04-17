"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n/context";

export function OnDemandForm() {
  const { t } = useI18n();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          groupSize: fd.get("groupSize"),
          preferredDate: fd.get("preferredDate"),
          notes: fd.get("notes"),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Something went wrong");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-brand-teal/5 border border-brand-teal/20 rounded-2xl p-8 text-center">
        <h3 className="font-heading text-xl font-bold text-brand-deep mb-2">
          {t.onDemand.successTitle}
        </h3>
        <p className="text-muted-foreground">{t.onDemand.successText}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-brand-sage/30 p-6 sm:p-8">
      <h3 className="font-heading text-xl font-bold text-brand-deep mb-2">
        {t.onDemand.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-6">{t.onDemand.subtitle}</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-brand-dark mb-1">
              {t.onDemand.name} *
            </label>
            <input
              name="name"
              required
              className="w-full rounded-xl border border-brand-sage/60 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-dark mb-1">
              {t.onDemand.email} *
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-brand-sage/60 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-dark mb-1">
              {t.onDemand.phone}
            </label>
            <input
              name="phone"
              type="tel"
              className="w-full rounded-xl border border-brand-sage/60 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-dark mb-1">
              {t.onDemand.groupSize}
            </label>
            <input
              name="groupSize"
              placeholder={t.onDemand.groupSizePlaceholder}
              className="w-full rounded-xl border border-brand-sage/60 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-brand-dark mb-1">
            {t.onDemand.preferredDate}
          </label>
          <input
            name="preferredDate"
            placeholder={t.onDemand.preferredDatePlaceholder}
            className="w-full rounded-xl border border-brand-sage/60 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-brand-dark mb-1">
            {t.onDemand.notes}
          </label>
          <textarea
            name="notes"
            rows={3}
            placeholder={t.onDemand.notesPlaceholder}
            className="w-full rounded-xl border border-brand-sage/60 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/40 resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-brand-teal text-brand-cream px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
        >
          {submitting ? t.onDemand.submitting : t.onDemand.submit}
        </button>
      </form>
    </div>
  );
}
