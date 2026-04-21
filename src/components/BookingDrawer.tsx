"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, Clock as ClockIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { Input } from "./ui/input";
import { BrandButton } from "./ui/brand-button";
import { formatDateLocalized } from "@/lib/utils";
import type { ScheduleWithAvailability } from "@/lib/types";

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
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "waitlisted" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [waitlistPosition, setWaitlistPosition] = useState(0);

  const isWaitlistMode = schedule.spotsLeft <= 0;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const formattedDate = formatDateLocalized(date, lang);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

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
        const data = await res.json();
        if (data.waitlisted) {
          setWaitlistPosition(data.position);
          setStatus("waitlisted");
        } else {
          setStatus("success");
        }
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
      <div className="absolute inset-0 bg-brand-deep/50 backdrop-blur-sm" onClick={onClose} />

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
              <BrandButton onClick={onClose} size="lg">
                {t.booking.bookAnother}
              </BrandButton>
            </div>
          ) : status === "waitlisted" ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-heading text-xl font-bold text-brand-deep mb-2">
                {lang === "es" ? "En lista de espera" : "You're on the Waitlist"}
              </h3>
              <p className="text-muted-foreground mb-2">
                {lang === "es"
                  ? `Posición #${waitlistPosition} para ${schedule.className} a las ${schedule.startTime}`
                  : `Position #${waitlistPosition} for ${schedule.className} at ${schedule.startTime}`}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {lang === "es"
                  ? "Si se libera una plaza, recibirás un email de confirmación automáticamente."
                  : "If a spot opens up, you'll receive a confirmation email automatically."}
              </p>
              <BrandButton onClick={onClose} size="lg">
                {lang === "es" ? "Entendido" : "Got it"}
              </BrandButton>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={`${t.booking.firstName} *`}
                required
                value={form.userName}
                onChange={(e) => setForm((f) => ({ ...f, userName: e.target.value }))}
                placeholder={t.booking.firstNamePlaceholder}
              />
              <Input
                label={`${t.booking.mobile} *`}
                type="tel"
                required
                value={form.userPhone}
                onChange={(e) => setForm((f) => ({ ...f, userPhone: e.target.value }))}
                placeholder={t.booking.mobilePlaceholder}
              />
              <Input
                label={t.booking.emailOptional}
                type="email"
                value={form.userEmail}
                onChange={(e) => setForm((f) => ({ ...f, userEmail: e.target.value }))}
                placeholder={t.booking.emailPlaceholder}
              />

              {schedule.price != null && schedule.price > 0 ? (
                <p className="text-xs text-muted-foreground bg-brand-sage/20 px-4 py-3 rounded-xl">
                  {lang === "es" ? "Precio" : "Price"}: <strong>{(schedule.price / 100).toFixed(0)}€</strong> — {t.booking.paymentNote}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground bg-brand-sage/20 px-4 py-3 rounded-xl">
                  {t.booking.paymentNote}
                </p>
              )}

              {isWaitlistMode && (
                <p className="text-xs text-amber-700 bg-amber-50 px-4 py-3 rounded-xl">
                  {lang === "es"
                    ? `Esta clase está completa. Te apuntarás a la lista de espera (${schedule.waitlistCount}/5).`
                    : `This class is full. You'll be added to the waitlist (${schedule.waitlistCount}/5).`}
                </p>
              )}

              {status === "error" && <p className="text-red-600 text-sm">{errorMsg}</p>}

              <BrandButton type="submit" size="full" disabled={status === "loading"}>
                {status === "loading"
                  ? t.booking.booking
                  : isWaitlistMode
                    ? (lang === "es" ? "Unirme a la lista de espera" : "Join Waitlist")
                    : t.booking.confirm}
              </BrandButton>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
