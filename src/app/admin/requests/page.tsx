"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, Users, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Loading } from "@/components/ui/loading";

interface ClassRequest {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  groupSize: string | null;
  preferredDate: string | null;
  notes: string | null;
  status: "pending" | "contacted" | "completed" | "cancelled";
  createdAt: string;
}

const STATUS_CONFIG = {
  pending: { label: "Pending", bg: "bg-amber-100", text: "text-amber-700" },
  contacted: { label: "Contacted", bg: "bg-blue-100", text: "text-blue-700" },
  completed: { label: "Completed", bg: "bg-green-100", text: "text-green-700" },
  cancelled: { label: "Cancelled", bg: "bg-gray-100", text: "text-gray-500" },
} as const;

const ALL_STATUSES = ["pending", "contacted", "completed", "cancelled"] as const;

export default function RequestsPage() {
  const [requests, setRequests] = useState<ClassRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());

  async function loadData() {
    try {
      const res = await fetch("/api/admin/requests");
      if (res.ok) setRequests(await res.json());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleStatusChange(id: number, status: string) {
    await fetch("/api/admin/requests", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    loadData();
  }

  function toggleNotes(id: number) {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (loading) return <Loading />;

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-deep">
            Class Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {requests.length} total requests
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                {pendingCount} pending
              </span>
            )}
          </p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-brand-sage/30 p-12 text-center text-muted-foreground">
          No class requests yet.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => {
            const cfg = STATUS_CONFIG[r.status];
            const notesExpanded = expandedNotes.has(r.id);

            return (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-brand-sage/30 p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  {/* Left: contact info */}
                  <div className="space-y-1.5 min-w-0">
                    <h3 className="font-medium text-brand-deep text-base">
                      {r.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {r.email}
                      </span>
                      {r.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {r.phone}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {r.groupSize && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          Group of {r.groupSize}
                        </span>
                      )}
                      {r.preferredDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {r.preferredDate}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: status + date */}
                  <div className="flex items-center gap-3 shrink-0">
                    <select
                      value={r.status}
                      onChange={(e) => handleStatusChange(r.id, e.target.value)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border-0 cursor-pointer appearance-none ${cfg.bg} ${cfg.text}`}
                    >
                      {ALL_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_CONFIG[s].label}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Notes (expandable) */}
                {r.notes && (
                  <div className="mt-3 pt-3 border-t border-brand-sage/15">
                    <button
                      onClick={() => toggleNotes(r.id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-brand-teal transition-colors"
                    >
                      {notesExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                      Notes
                    </button>
                    {notesExpanded && (
                      <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                        {r.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
