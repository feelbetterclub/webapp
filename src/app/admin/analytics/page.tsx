"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, Heart, BookOpen } from "lucide-react";
import { Loading } from "@/components/ui/loading";

interface Analytics {
  totalBookings: number;
  thisWeekBookings: number;
  lastWeekBookings: number;
  topClasses: { name: string; bookings: number }[];
  communityMembers: number;
  occupancy: { name: string; capacity: number; booked: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (!data) return <p className="text-muted-foreground p-8">Failed to load analytics.</p>;

  const trend = data.thisWeekBookings - data.lastWeekBookings;
  const trendPct = data.lastWeekBookings > 0 ? Math.round((trend / data.lastWeekBookings) * 100) : 0;

  const stats = [
    { label: "Total Bookings", value: data.totalBookings, icon: BookOpen, color: "bg-brand-teal/10 text-brand-teal" },
    { label: "This Week", value: data.thisWeekBookings, icon: TrendingUp, color: "bg-blue-50 text-blue-600" },
    { label: "Community", value: data.communityMembers, icon: Heart, color: "bg-pink-50 text-pink-600" },
    { label: "Week Trend", value: `${trend >= 0 ? "+" : ""}${trend} (${trendPct}%)`, icon: Users, color: trend >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600" },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-brand-deep mb-6">Analytics</h1>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Classes */}
        <div className="bg-white rounded-xl border border-brand-sage/30 p-6">
          <h2 className="font-heading text-lg font-semibold text-brand-deep mb-4">Most Popular Classes</h2>
          {data.topClasses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No booking data yet.</p>
          ) : (
            <div className="space-y-3">
              {data.topClasses.map((c, i) => {
                const max = data.topClasses[0]?.bookings || 1;
                return (
                  <div key={c.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-brand-deep">{i + 1}. {c.name}</span>
                      <span className="text-muted-foreground">{c.bookings} bookings</span>
                    </div>
                    <div className="w-full bg-brand-sage/20 rounded-full h-2">
                      <div className="bg-brand-teal rounded-full h-2" style={{ width: `${(c.bookings / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Occupancy */}
        <div className="bg-white rounded-xl border border-brand-sage/30 p-6">
          <h2 className="font-heading text-lg font-semibold text-brand-deep mb-4">Occupancy Rate</h2>
          {data.occupancy.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming classes.</p>
          ) : (
            <div className="space-y-3">
              {data.occupancy.map((c) => {
                const pct = c.capacity > 0 ? Math.round((c.booked / c.capacity) * 100) : 0;
                return (
                  <div key={c.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-brand-deep">{c.name}</span>
                      <span className="text-muted-foreground">{pct}% ({c.booked}/{c.capacity})</span>
                    </div>
                    <div className="w-full bg-brand-sage/20 rounded-full h-2">
                      <div className={`rounded-full h-2 ${pct >= 80 ? "bg-red-400" : pct >= 50 ? "bg-amber-400" : "bg-brand-teal"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
