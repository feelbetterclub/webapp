"use client";

import { useState, useEffect } from "react";
import { BookOpen, Calendar, Users, TrendingUp } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import type { BookingItem } from "@/lib/types";

interface Stats {
  totalClasses: number;
  totalSchedules: number;
  todayBookings: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalClasses: 0,
    totalSchedules: 0,
    todayBookings: 0,
  });
  const [todayBookings, setTodayBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const today = new Date().toISOString().split("T")[0];

      const [classesRes, schedulesRes, bookingsRes] = await Promise.all([
        fetch("/api/admin/classes"),
        fetch("/api/admin/schedules"),
        fetch(`/api/bookings?date=${today}`),
      ]);

      const classesData = await classesRes.json();
      const schedulesData = await schedulesRes.json();
      const bookingsData = await bookingsRes.json();

      setStats({
        totalClasses: Array.isArray(classesData) ? classesData.length : 0,
        totalSchedules: Array.isArray(schedulesData) ? schedulesData.length : 0,
        todayBookings: Array.isArray(bookingsData) ? bookingsData.length : 0,
      });

      setTodayBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) return <Loading />;

  const statCards = [
    { label: "Clases", value: stats.totalClasses, icon: BookOpen, color: "bg-brand-teal/10 text-brand-teal" },
    { label: "Horarios", value: stats.totalSchedules, icon: Calendar, color: "bg-blue-50 text-blue-600" },
    { label: "Reservas hoy", value: stats.todayBookings, icon: Users, color: "bg-amber-50 text-amber-600" },
    { label: "Tendencia", value: `+${stats.todayBookings}`, icon: TrendingUp, color: "bg-green-50 text-green-600" },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-brand-deep mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-6 border border-brand-cream">
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

      <div className="bg-white rounded-xl border border-brand-cream overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-cream">
          <h2 className="font-heading text-lg font-semibold text-brand-deep">
            Reservas de hoy
          </h2>
        </div>
        {todayBookings.length === 0 ? (
          <div className="p-6">
            <EmptyState text="No hay reservas para hoy" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-brand-light/50">
                  {["Alumno", "Email", "Clase", "Hora", "Estado"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-cream">
                {todayBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-brand-light/30">
                    <td className="px-6 py-4 text-sm font-medium text-brand-deep">{b.userName}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{b.userEmail}</td>
                    <td className="px-6 py-4 text-sm text-brand-deep">{b.className}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{b.startTime}</td>
                    <td className="px-6 py-4">
                      <StatusBadge variant={b.status === "confirmed" ? "confirmed" : "cancelled"}>
                        {b.status === "confirmed" ? "Confirmada" : "Cancelada"}
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
