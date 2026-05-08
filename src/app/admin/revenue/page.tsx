"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Users, Calendar } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";

interface RevenueSession {
  scheduleId: number;
  date: string;
  startTime: string;
  price: number | null;
  className: string;
  bookedCount: number;
  paidCount: number;
  totalCents: number;
}

interface RevenueTotals {
  totalCents: number;
  totalPaid: number;
  totalBooked: number;
}

interface RevenueData {
  sessions: RevenueSession[];
  totals: RevenueTotals;
}

type Period = "week" | "month" | "all";

function getDateRange(period: Period): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split("T")[0];

  if (period === "week") {
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    return { from: monday.toISOString().split("T")[0], to };
  }

  if (period === "month") {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: firstDay.toISOString().split("T")[0], to };
  }

  // all — last 365 days
  const yearAgo = new Date(now);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  return { from: yearAgo.toISOString().split("T")[0], to };
}

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("month");

  useEffect(() => {
    async function loadRevenue() {
      setLoading(true);
      const { from, to } = getDateRange(period);
      try {
        const r = await fetch(`/api/admin/revenue?from=${from}&to=${to}`);
        setData(await r.json());
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    }
    loadRevenue();
  }, [period]);

  if (loading) return <Loading />;
  if (!data) return <p className="text-muted-foreground p-8">Failed to load revenue data.</p>;

  const totalEur = (data.totals.totalCents / 100).toFixed(2);
  const avgPerSession = data.sessions.length > 0
    ? (data.totals.totalCents / data.sessions.length / 100).toFixed(2)
    : "0.00";

  const stats = [
    { label: "Total Revenue", value: `${totalEur} EUR`, icon: DollarSign, color: "bg-green-50 text-green-600" },
    { label: "Paid / Booked", value: `${data.totals.totalPaid} / ${data.totals.totalBooked}`, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Sessions", value: data.sessions.length, icon: Calendar, color: "bg-amber-50 text-amber-600" },
    { label: "Avg / Session", value: `${avgPerSession} EUR`, icon: TrendingUp, color: "bg-brand-teal/10 text-brand-teal" },
  ];

  const periodLabels: Record<Period, string> = {
    week: "This Week",
    month: "This Month",
    all: "All Time",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-deep">Revenue</h1>
        <div className="flex gap-1 bg-white rounded-lg border border-brand-sage/30 p-0.5">
          {(["week", "month", "all"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                period === p
                  ? "bg-brand-teal text-white"
                  : "text-muted-foreground hover:bg-brand-sage/20"
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
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

      {/* Sessions table */}
      <div className="bg-white rounded-xl border border-brand-sage/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-sage/20">
          <h2 className="font-heading text-lg font-semibold text-brand-deep">Sessions Breakdown</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{periodLabels[period]}</p>
        </div>
        {data.sessions.length === 0 ? (
          <div className="p-6"><EmptyState text="No sessions in this period" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-brand-light/50">
                  {["Date", "Time", "Class", "Price", "Booked", "Paid", "Revenue"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-sage/20">
                {data.sessions.map((s) => {
                  const dateLabel = new Date(s.date + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "short", month: "short", day: "numeric",
                  });
                  const priceEur = s.price != null ? (s.price / 100).toFixed(2) : "Free";
                  const revenueEur = (Number(s.totalCents) / 100).toFixed(2);

                  return (
                    <tr key={`${s.scheduleId}-${s.date}`} className="hover:bg-brand-light/30">
                      <td className="px-6 py-4 text-sm text-brand-deep">{dateLabel}</td>
                      <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{s.startTime}</td>
                      <td className="px-6 py-4 text-sm font-medium text-brand-deep">{s.className}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{priceEur === "Free" ? priceEur : `${priceEur} EUR`}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{Number(s.bookedCount)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={Number(s.paidCount) === Number(s.bookedCount) && Number(s.bookedCount) > 0 ? "text-green-600 font-medium" : "text-muted-foreground"}>
                          {Number(s.paidCount)}/{Number(s.bookedCount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">{revenueEur} EUR</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
