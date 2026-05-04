"use client";

import { useState, useEffect } from "react";
import { BookOpen, Calendar, Users, TrendingUp, MapPin, ChevronDown, ChevronUp, UserPlus, Clock, Mail, Phone, Trash2 } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { todayISO, safeArray } from "@/lib/utils";

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
  waitlistCount: number;
}

interface SessionStudent {
  id: number;
  userName: string;
  userEmail: string;
  userPhone: string | null;
  status: string;
  position?: number;
}

interface SessionDetail {
  bookings: SessionStudent[];
  waitlist: SessionStudent[];
}

export default function AdminDashboard() {
  const [newMembers, setNewMembers] = useState<{ email: string; name: string; phone: string | null; joinedAt: string; source: string }[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [classCount, setClassCount] = useState(0);
  const [thisWeekBookings, setThisWeekBookings] = useState(0);
  const [lastWeekBookings, setLastWeekBookings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [promoting, setPromoting] = useState<number | null>(null);
  const [popupEnabled, setPopupEnabled] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(s => {
      setPopupEnabled(s.popup_enabled !== "false");
    }).catch(() => {});
  }, []);

  async function togglePopup() {
    const newValue = !popupEnabled;
    setPopupEnabled(newValue);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "popup_enabled", value: String(newValue) }),
    });
  }

  useEffect(() => {
    async function loadData() {
      try {
        const today = todayISO();
        const now = new Date();

        // This week: Monday to Sunday
        const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const thisMonday = new Date(now);
        thisMonday.setDate(now.getDate() + mondayOffset);
        const thisSunday = new Date(thisMonday);
        thisSunday.setDate(thisMonday.getDate() + 6);

        // Last week
        const lastMonday = new Date(thisMonday);
        lastMonday.setDate(thisMonday.getDate() - 7);
        const lastSunday = new Date(thisMonday);
        lastSunday.setDate(thisMonday.getDate() - 1);

        // End of next week for upcoming display
        const endNextWeek = new Date(thisSunday);
        endNextWeek.setDate(thisSunday.getDate() + 7);

        const fmt = (d: Date) => d.toISOString().split("T")[0];

        const [classesRes, newMembersRes, upcomingRes, thisWeekRes, lastWeekRes] = await Promise.all([
          fetch("/api/admin/classes"),
          fetch("/api/admin/new-members"),
          fetch(`/api/admin/upcoming?from=${today}&to=${fmt(endNextWeek)}`),
          fetch(`/api/admin/upcoming?from=${fmt(thisMonday)}&to=${fmt(thisSunday)}`),
          fetch(`/api/admin/upcoming?from=${fmt(lastMonday)}&to=${fmt(lastSunday)}`),
        ]);

        const classesData = classesRes.ok ? await classesRes.json() : [];
        const newMembersData = newMembersRes.ok ? await newMembersRes.json() : [];
        const upcomingData = upcomingRes.ok ? await upcomingRes.json() : [];
        const thisWeekData: UpcomingSession[] = thisWeekRes.ok ? await thisWeekRes.json() : [];
        const lastWeekData: UpcomingSession[] = lastWeekRes.ok ? await lastWeekRes.json() : [];

        setClassCount(safeArray(classesData).length);
        setNewMembers(safeArray(newMembersData));
        setUpcomingSessions(safeArray<UpcomingSession>(upcomingData));
        setThisWeekBookings(thisWeekData.reduce((sum, s) => sum + s.bookingCount, 0));
        setLastWeekBookings(lastWeekData.reduce((sum, s) => sum + s.bookingCount, 0));
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function toggleSession(session: UpcomingSession) {
    const key = `${session.id}-${session.date}`;
    if (expandedSession === key) {
      setExpandedSession(null);
      setSessionDetail(null);
      return;
    }
    setExpandedSession(key);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/session-detail?scheduleId=${session.id}&date=${session.date}`);
      if (res.ok) setSessionDetail(await res.json());
    } catch { /* ignore */ } finally {
      setDetailLoading(false);
    }
  }

  async function promoteWaitlist(waitlistId: number, session: UpcomingSession) {
    setPromoting(waitlistId);
    try {
      const res = await fetch("/api/admin/session-detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waitlistId, scheduleId: session.id, date: session.date }),
      });
      if (res.ok) {
        // Refresh detail
        const detailRes = await fetch(`/api/admin/session-detail?scheduleId=${session.id}&date=${session.date}`);
        if (detailRes.ok) setSessionDetail(await detailRes.json());
        // Update booking count in the session list
        setUpcomingSessions((prev) =>
          prev.map((s) =>
            s.id === session.id && s.date === session.date
              ? { ...s, bookingCount: s.bookingCount + 1, waitlistCount: Math.max(0, s.waitlistCount - 1) }
              : s
          )
        );
      }
    } catch { /* ignore */ } finally {
      setPromoting(null);
    }
  }

  async function deleteBooking(bookingId: number, session: UpcomingSession) {
    if (!confirm("Remove this student from the class?")) return;
    try {
      const res = await fetch("/api/admin/session-detail", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      if (res.ok) {
        const detailRes = await fetch(`/api/admin/session-detail?scheduleId=${session.id}&date=${session.date}`);
        if (detailRes.ok) setSessionDetail(await detailRes.json());
        setUpcomingSessions((prev) =>
          prev.map((s) =>
            s.id === session.id && s.date === session.date
              ? { ...s, bookingCount: Math.max(0, s.bookingCount - 1) }
              : s
          )
        );
      }
    } catch { /* ignore */ }
  }

  if (loading) return <Loading />;

  const statCards = [
    { label: "Classes", value: classCount, icon: BookOpen, color: "bg-brand-teal/10 text-brand-teal" },
    { label: "Upcoming Sessions", value: upcomingSessions.length, icon: Calendar, color: "bg-blue-50 text-blue-600" },
    { label: "Week Bookings", value: thisWeekBookings, icon: Users, color: "bg-amber-50 text-amber-600" },
    { label: "Trend", value: `${thisWeekBookings - lastWeekBookings >= 0 ? "+" : ""}${thisWeekBookings - lastWeekBookings}`, icon: TrendingUp, color: thisWeekBookings >= lastWeekBookings ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600" },
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
                      .map((s) => {
                        const sessionKey = `${s.id}-${s.date}`;
                        const isExpanded = expandedSession === sessionKey;
                        return (
                          <div key={s.id}>
                            <button
                              type="button"
                              onClick={() => toggleSession(s)}
                              className="w-full px-6 py-3 flex flex-col items-start sm:flex-row sm:items-center sm:justify-between hover:bg-brand-light/30 cursor-pointer text-left transition-colors gap-2"
                            >
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-mono text-muted-foreground w-12">{s.startTime}</span>
                                <div>
                                  <span className="text-sm font-medium text-brand-deep">{s.className}</span>
                                  <div className="flex items-center gap-3 mt-0.5">
                                    {s.instructor && <span className="text-xs text-muted-foreground">{s.instructor}</span>}
                                    {s.location && (
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {s.location}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                {s.waitlistCount > 0 && (
                                  <span className="text-xs text-amber-600 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {s.waitlistCount} queue
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Users className="w-3 h-3" /> {s.bookingCount}/{s.maxCapacity}
                                </span>
                                <StatusBadge variant={s.bookingCount >= s.maxCapacity ? "cancelled" : s.bookingCount > 0 ? "warning" : "confirmed"}>
                                  {s.bookingCount >= s.maxCapacity ? "Full" : s.bookingCount > 0 ? `${s.bookingCount} booked` : "Open"}
                                </StatusBadge>
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="px-6 pb-4 bg-brand-light/20 border-t border-brand-sage/10">
                                {detailLoading ? (
                                  <p className="text-xs text-muted-foreground py-3">Loading...</p>
                                ) : sessionDetail ? (
                                  <div className="pt-3 space-y-4">
                                    {/* Bookings */}
                                    <div>
                                      <h4 className="text-xs font-semibold text-brand-deep uppercase tracking-wider mb-2">
                                        Students ({sessionDetail.bookings.length})
                                      </h4>
                                      {sessionDetail.bookings.length === 0 ? (
                                        <p className="text-xs text-muted-foreground">No bookings yet</p>
                                      ) : (
                                        <div className="space-y-1.5">
                                          {sessionDetail.bookings.map((b, i) => (
                                            <div key={b.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg px-3 py-2 text-sm gap-1 sm:gap-0">
                                              <div className="flex items-center gap-3">
                                                <span className="w-5 h-5 rounded-full bg-brand-teal/10 text-brand-teal text-xs flex items-center justify-center font-medium">{i + 1}</span>
                                                <span className="font-medium text-brand-deep">{b.userName}</span>
                                              </div>
                                              <div className="flex items-center gap-3 text-xs text-muted-foreground pl-8 sm:pl-0">
                                                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {b.userEmail}</span>
                                                {b.userPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {b.userPhone}</span>}
                                                <button
                                                  type="button"
                                                  onClick={() => deleteBooking(b.id, s)}
                                                  className="text-red-400 hover:text-red-600 transition-colors p-1"
                                                  title="Remove student"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    {/* Waitlist */}
                                    {sessionDetail.waitlist.length > 0 && (
                                      <div>
                                        <h4 className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">
                                          Waitlist ({sessionDetail.waitlist.length})
                                        </h4>
                                        <div className="space-y-1.5">
                                          {sessionDetail.waitlist.map((w) => (
                                            <div key={w.id} className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2 text-sm">
                                              <div className="flex items-center gap-3">
                                                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-medium">WL</span>
                                                <span className="font-medium text-brand-deep">{w.userName}</span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> {w.userEmail}</span>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() => promoteWaitlist(w.id, s)}
                                                disabled={promoting === w.id}
                                                className="flex items-center gap-1 text-xs font-medium text-brand-teal hover:text-brand-dark bg-brand-teal/10 hover:bg-brand-teal/20 px-2.5 py-1 rounded-full transition-colors disabled:opacity-50"
                                              >
                                                <UserPlus className="w-3 h-3" />
                                                {promoting === w.id ? "..." : "Accept"}
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* New Members */}
      <div className="bg-white rounded-xl border border-brand-sage/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-sage/20">
          <h2 className="font-heading text-lg font-semibold text-brand-deep">New Members</h2>
          <p className="text-xs text-muted-foreground mt-0.5">First-time students and community members in the last 7 days</p>
        </div>
        {newMembers.length === 0 ? (
          <div className="p-6"><EmptyState text="No new members this week" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-brand-light/50">
                  {["Name", "Email", "Phone", "Joined", "Source"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-sage/20">
                {newMembers.map((m) => {
                  const joined = new Date(m.joinedAt);
                  const diffMs = Date.now() - joined.getTime();
                  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                  const joinedLabel =
                    diffDays === 0 ? "Today" :
                    diffDays === 1 ? "Yesterday" :
                    `${diffDays} days ago`;

                  return (
                    <tr key={m.email} className="hover:bg-brand-light/30">
                      <td className="px-6 py-4 text-sm font-medium text-brand-deep">{m.name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{m.email}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{m.phone ?? "—"}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{joinedLabel}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          m.source === "booking"
                            ? "bg-brand-teal/10 text-brand-teal"
                            : "bg-amber-50 text-amber-600"
                        }`}>
                          {m.source === "booking" ? "Booking" : "Community"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 mt-8">
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

      {/* Settings */}
      <div className="bg-white rounded-xl border border-brand-sage/30 p-4 mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-deep">Welcome Pop-up</p>
          <p className="text-xs text-muted-foreground">Show &quot;Unlock Free Class&quot; pop-up to new visitors</p>
        </div>
        <button
          onClick={togglePopup}
          className={`relative w-12 h-6 rounded-full transition-colors ${popupEnabled ? "bg-brand-teal" : "bg-gray-300"}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${popupEnabled ? "left-[26px]" : "left-0.5"}`} />
        </button>
      </div>
    </div>
  );
}
