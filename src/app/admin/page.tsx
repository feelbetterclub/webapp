"use client";

import { useState, useEffect } from "react";
import { BookOpen, Calendar, Users, TrendingUp, Clock, MapPin } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { todayISO, safeArray } from "@/lib/utils";
import type { BookingItem } from "@/lib/types";

interface UpcomingSession {
  id: number;
  date: string;
  startTime: string;
  instructor: string | null;
  className: string;
  location: string | null;
  locationUrl: string | null;
  bookingCount: number;
  maxCapacity: number;
}

export default function AdminDashboard() {
  const [todayBookings, setTodayBookings] = useState<BookingItem[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [classCount, setClassCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const today = todayISO();

        // Calculate end of next week (Sunday)
        const endDate = new Date();
        const daysUntilSunday = 7 - endDate.getDay() + 7; // rest of this week + next week
        endDate.setDate(endDate.getDate() + daysUntilSunday);
        const endDateISO = endDate.toISOString().split("T")[0];

        const [classesRes, bookingsRes, upcomingRes] = await Promise.all([
          fetch("/api/admin/classes"),
          fetch(`/api/bookings?date=${today}`),
          fetch(`/api/admin/upcoming?from=${today}&to=${endDateISO}`),
        ]);

        const classesData = classesRes.ok ? await classesRes.json() : [];
        const bookingsData = bookingsRes.ok ? await bookingsRes.json() : [];
        const upcomingData = upcomingRes.ok ? await upcomingRes.json() : [];

        setClassCount(safeArray(classesData).length);
        setTodayBookings(safeArray<BookingItem>(bookingsData));
        setUpcomingSessions(safeArray<UpcomingSession>(upcomingData));
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <Loading />;

  const statCards = [
    { label: "Classes", value: classCount, icon: BookOpen, color: "bg-brand-teal/10 text-brand-teal" },
    { label: "Upcoming Sessions", value: upcomingSessions.length, icon: Calendar, color: "bg-blue-50 text-blue-600" },
    { label: "Today's Bookings", value: todayBookings.length, icon: Users, color: "bg-amber-50 text-amber-600" },
    { label: "Trend", value: `+${todayBookings.length}`, icon: TrendingUp, color: "bg-green-50 text-green-600" },
  ];

  // Group upcoming by date
  const groupedUpcoming = upcomingSessions.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {} as Record<string, UpcomingSession[]>);

  const today = todayISO();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-brand-deep mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-6 border border-brand-sage/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-brand-deep">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white rounded-xl border border-brand-sage/30 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-brand-sage/20">
          <h2 className="font-heading text-lg font-semibold text-brand-deep">Upcoming Sessions</h2>
          <p className="text-xs text-muted-foreground mt-0.5">This week and next</p>
        </div>
        {upcomingSessions.length === 0 ? (
          <div className="p-6"><EmptyState text="No upcoming sessions scheduled" /></div>
        ) : (
          <div className="divide-y divide-brand-sage/10">
            {Object.entries(groupedUpcoming)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, sessions]) => {
                const isToday = date === today;
                const dateLabel = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                  weekday: "long", month: "short", day: "numeric",
                });

                return (
                  <div key={date}>
                    <div className={`px-6 py-2 ${isToday ? "bg-brand-teal/5" : "bg-brand-light/50"}`}>
                      <span className={`text-xs font-semibold uppercase tracking-wider ${isToday ? "text-brand-teal" : "text-muted-foreground"}`}>
                        {isToday ? "Today" : dateLabel}
                      </span>
                    </div>
                    {sessions
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((s) => (
                        <div key={s.id} className="px-6 py-3 flex items-center justify-between hover:bg-brand-light/30">
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-mono text-muted-foreground w-12">{s.startTime}</span>
                            <div>
                              <span className="text-sm font-medium text-brand-deep">{s.className}</span>
                              <div className="flex items-center gap-3 mt-0.5">
                                {s.instructor && <span className="text-xs text-muted-foreground">{s.instructor}</span>}
                                {s.location && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {s.locationUrl ? (
                                      <a href={s.locationUrl} target="_blank" rel="noopener noreferrer" className="text-brand-teal hover:underline">{s.location}</a>
                                    ) : s.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Users className="w-3 h-3" /> {s.bookingCount}/{s.maxCapacity}
                            </span>
                            <StatusBadge variant={s.bookingCount >= s.maxCapacity ? "cancelled" : s.bookingCount > 0 ? "warning" : "confirmed"}>
                              {s.bookingCount >= s.maxCapacity ? "Full" : s.bookingCount > 0 ? `${s.bookingCount} booked` : "Open"}
                            </StatusBadge>
                          </div>
                        </div>
                      ))}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Today's Bookings */}
      <div className="bg-white rounded-xl border border-brand-sage/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-sage/20">
          <h2 className="font-heading text-lg font-semibold text-brand-deep">Today&apos;s Bookings</h2>
        </div>
        {todayBookings.length === 0 ? (
          <div className="p-6"><EmptyState text="No bookings for today" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-brand-light/50">
                  {["Student", "Email", "Class", "Time", "Status"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-sage/20">
                {todayBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-brand-light/30">
                    <td className="px-6 py-4 text-sm font-medium text-brand-deep">{b.userName}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{b.userEmail}</td>
                    <td className="px-6 py-4 text-sm text-brand-deep">{b.className}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{b.startTime}</td>
                    <td className="px-6 py-4">
                      <StatusBadge variant={b.status === "confirmed" ? "confirmed" : "cancelled"}>
                        {b.status === "confirmed" ? "Confirmed" : "Cancelled"}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
