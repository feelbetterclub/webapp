"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BookingDrawer } from "@/components/BookingDrawer";
import { StatusBadge } from "@/components/ui/status-badge";
import { ChevronLeft, ChevronRight, Clock, Users, User, MapPin } from "lucide-react";
import { DAY_NAMES_SHORT, DAY_NAMES } from "@/lib/days";
import { useI18n } from "@/lib/i18n/context";
import { todayISO, formatDateLocalized } from "@/lib/utils";
import type { ScheduleWithAvailability } from "@/lib/types";

function getWeekDates(base: Date) {
  const day = base.getDay();
  const monday = new Date(base);
  monday.setDate(base.getDate() - (day === 0 ? 6 : day - 1));
  const dates: { date: Date; iso: string; dayOfWeek: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push({ date: d, iso: d.toISOString().split("T")[0], dayOfWeek: i + 1 });
  }
  return dates;
}

export default function ReservarPage() {
  const { t, lang } = useI18n();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [schedules, setSchedules] = useState<ScheduleWithAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerSchedule, setDrawerSchedule] = useState<ScheduleWithAvailability | null>(null);

  const today = useMemo(() => todayISO(), []);
  const weekDates = useMemo(() => {
    const base = new Date();
    base.setDate(base.getDate() + weekOffset * 7);
    return getWeekDates(base);
  }, [weekOffset]);

  const sortedSchedules = useMemo(
    () => [...schedules].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [schedules]
  );

  useEffect(() => {
    const dow = new Date().getDay();
    setSelectedDay(dow === 0 ? 7 : dow);
    setSelectedDate(today);
  }, [today]);

  const loadSchedules = useCallback(async (_dayOfWeek: number, date: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/schedules?date=${date}`);
      const data = await res.json();
      setSchedules(Array.isArray(data) ? data : []);
    } catch {
      setSchedules([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedDay && selectedDate) loadSchedules(selectedDay, selectedDate);
  }, [selectedDay, selectedDate, loadSchedules]);

  function selectDay(dayOfWeek: number, iso: string) {
    setSelectedDay(dayOfWeek);
    setSelectedDate(iso);
  }

  const formattedDate = selectedDate
    ? formatDateLocalized(selectedDate, lang, { day: "numeric", month: "long" })
    : "";

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-brand-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-10">
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-brand-deep mb-3">{t.booking.title}</h1>
            <p className="text-muted-foreground text-lg">{t.booking.subtitle}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-brand-sage/30 mb-8">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setWeekOffset((w) => w - 1)} className="p-2 hover:bg-brand-sage/30 rounded-lg transition-colors" disabled={weekOffset <= 0}>
                <ChevronLeft className="w-5 h-5 text-brand-dark" />
              </button>
              <span className="font-medium text-brand-deep">
                {weekDates[0].date.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { month: "long", year: "numeric" })}
              </span>
              <button onClick={() => setWeekOffset((w) => w + 1)} className="p-2 hover:bg-brand-sage/30 rounded-lg transition-colors" disabled={weekOffset >= 3}>
                <ChevronRight className="w-5 h-5 text-brand-dark" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((wd) => {
                const isPast = wd.iso < today;
                const isSelected = wd.dayOfWeek === selectedDay && wd.iso === selectedDate;
                return (
                  <button key={wd.iso} onClick={() => !isPast && selectDay(wd.dayOfWeek, wd.iso)} disabled={isPast}
                    className={`flex flex-col items-center py-3 px-1 rounded-xl transition-all text-sm ${
                      isPast ? "opacity-40 cursor-not-allowed" : isSelected ? "bg-brand-teal text-brand-cream shadow-md" : "hover:bg-brand-sage/30"
                    }`}>
                    <span className="text-xs font-medium mb-1">{DAY_NAMES_SHORT[wd.dayOfWeek]}</span>
                    <span className="text-lg font-bold">{wd.date.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDay && (
            <h2 className="font-heading text-xl font-semibold text-brand-deep mb-6">
              {DAY_NAMES[selectedDay]} {formattedDate}
            </h2>
          )}

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">{t.booking.loading}</div>
          ) : sortedSchedules.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-white rounded-2xl border border-brand-sage/30">
              {t.booking.noClasses}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedSchedules.map((s) => (
                <button
                  key={s.id}
                  onClick={() => s.spotsLeft > 0 && setDrawerSchedule(s)}
                  disabled={s.spotsLeft <= 0}
                  className={`w-full text-left rounded-2xl overflow-hidden border transition-all ${
                    s.spotsLeft <= 0
                      ? "border-gray-200 opacity-50 cursor-not-allowed"
                      : "border-brand-sage/30 bg-white hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                  }`}
                >
                  <div className="relative p-6 sm:p-8">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-teal rounded-l-2xl" />
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-heading text-xl sm:text-2xl font-bold text-brand-deep">{s.className}</h3>
                        {s.classDescription && <p className="text-sm text-muted-foreground mt-1 max-w-lg">{s.classDescription}</p>}
                      </div>
                      <StatusBadge variant={s.spotsLeft <= 0 ? "cancelled" : s.spotsLeft <= 3 ? "warning" : "confirmed"}>
                        {s.spotsLeft <= 0 ? t.booking.full : `${s.spotsLeft} ${t.booking.spots}`}
                      </StatusBadge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{s.startTime} · {s.durationMinutes} min</span>
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" />{s.currentBookings}/{s.maxCapacity}</span>
                      {s.instructor && <span className="flex items-center gap-1"><User className="w-4 h-4" />{s.instructor}</span>}
                      {s.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {s.locationUrl ? (
                            <a href={s.locationUrl} target="_blank" rel="noopener noreferrer" className="text-brand-teal hover:underline"
                              onClick={(e) => e.stopPropagation()}>{s.location}</a>
                          ) : s.location}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {drawerSchedule && (
        <BookingDrawer
          schedule={drawerSchedule}
          date={selectedDate}
          onClose={() => setDrawerSchedule(null)}
          onBooked={() => { if (selectedDay) loadSchedules(selectedDay, selectedDate); }}
        />
      )}
    </>
  );
}
