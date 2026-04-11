"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import type { ScheduleWithAvailability } from "@/lib/types";
import { DAY_NAMES, DAY_NAMES_SHORT } from "@/lib/days";

const IDENTITY_KEY = "fbc-user";

interface StoredIdentity {
  userName: string;
  userPhone: string;
  userEmail: string;
}

function getStoredIdentity(): StoredIdentity {
  if (typeof window === "undefined") return { userName: "", userPhone: "", userEmail: "" };
  try {
    const stored = localStorage.getItem(IDENTITY_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return { userName: "", userPhone: "", userEmail: "" };
}

interface Props {
  schedule: ScheduleWithAvailability;
  date: string;
  onClose: () => void;
  onBooked: () => void;
}

export function BookingDrawer({ schedule, date, onClose, onBooked }: Props) {
  const { t, lang } = useI18n();
  const [form, setForm] = useState<StoredIdentity>(getStoredIdentity);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString(
    lang === "es" ? "es-ES" : "en-US",
    { weekday: "long", day: "numeric", month: "long" }
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    // Persist identity
    localStorage.setItem(IDENTITY_KEY, JSON.stringify(form));

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId: schedule.id,
          date,
          userName: form.userName,
          userEmail: form.userEmail || `${form.userPhone.replace(/\D/g, "")}@placeholder.fbc`,
          userPhone: form.userPhone,
        }),
      });

      if (res.ok) {
        setStatus("success");
        onBooked();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Error");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Connection error");
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-brand-deep/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        <div className="sticky top-0 bg-white rounded-t-3xl sm:rounded-t-2xl px-6 pt-4 pb-3 border-b border-brand-sage/20 flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold text-brand-deep">{schedule.className}</h3>
            <p className="text-sm text-muted-foreground">
              {formattedDate} · {schedule.startTime} · {schedule.durationMinutes} min
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-brand-sage/20 rounded-full transition-colors">
            <X className="w-5 h-5 text-brand-dark" />
          </button>
        </div>

        <div className="p-6">
          {status === "success" ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-heading text-xl font-bold text-brand-deep mb-2">{t.booking.confirmed}</h3>
              <p className="text-muted-foreground mb-2">
                {t.booking.confirmedText} {schedule.className} {t.booking.at} {schedule.startTime}
              </p>
              <p className="text-sm text-muted-foreground mb-6">{t.booking.managementNote}</p>
              <button onClick={onClose} className="bg-brand-teal text-brand-cream px-6 py-3 rounded-xl font-semibold hover:bg-brand-dark transition-colors">
                {t.booking.bookAnother}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-deep mb-1.5">
                  {t.booking.firstName} *
                </label>
                <input
                  type="text"
                  required
                  value={form.userName}
                  onChange={(e) => setForm((f) => ({ ...f, userName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-brand-sage/30 bg-brand-light/50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-colors"
                  placeholder={t.booking.firstNamePlaceholder}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-deep mb-1.5">
                  {t.booking.mobile} *
                </label>
                <input
                  type="tel"
                  required
                  value={form.userPhone}
                  onChange={(e) => setForm((f) => ({ ...f, userPhone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-brand-sage/30 bg-brand-light/50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-colors"
                  placeholder={t.booking.mobilePlaceholder}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-deep mb-1.5">
                  {t.booking.emailOptional}
                </label>
                <input
                  type="email"
                  value={form.userEmail}
                  onChange={(e) => setForm((f) => ({ ...f, userEmail: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-brand-sage/30 bg-brand-light/50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-colors"
                  placeholder={t.booking.emailPlaceholder}
                />
              </div>

              <p className="text-xs text-muted-foreground bg-brand-sage/20 px-4 py-3 rounded-xl">
                {t.booking.paymentNote}
              </p>

              {status === "error" && <p className="text-red-600 text-sm">{errorMsg}</p>}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-brand-teal text-brand-cream py-3.5 rounded-xl font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50"
              >
                {status === "loading" ? t.booking.booking : t.booking.confirm}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
