"use client";

import { useState, useEffect, useCallback } from "react";
import { Mail, Phone, ChevronDown, ChevronUp, Archive, Eye } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  preferredContact: string;
  message: string;
  status: "new" | "read" | "archived";
  createdAt: string;
}

const STATUS_VARIANT: Record<string, "confirmed" | "warning" | "cancelled"> = {
  new: "warning",
  read: "confirmed",
  archived: "cancelled",
};

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ContactRequestsPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "new" | "read" | "archived">("all");

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/contact-requests");
      if (res.ok) setMessages(await res.json());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function updateStatus(id: number, status: "new" | "read" | "archived") {
    try {
      const res = await fetch("/api/admin/contact-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status } : m))
        );
      }
    } catch {
      /* ignore */
    }
  }

  function toggleExpand(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  const filtered =
    filter === "all" ? messages : messages.filter((m) => m.status === filter);

  const counts = {
    all: messages.length,
    new: messages.filter((m) => m.status === "new").length,
    read: messages.filter((m) => m.status === "read").length,
    archived: messages.filter((m) => m.status === "archived").length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-deep">
            Contact Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {counts.new > 0
              ? `${counts.new} new message${counts.new > 1 ? "s" : ""}`
              : "No new messages"}
            {" / "}
            {counts.all} total
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "new", "read", "archived"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={[
              "px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize",
              filter === f
                ? "bg-brand-teal/10 text-brand-teal"
                : "text-muted-foreground hover:bg-brand-sage/20",
            ].join(" ")}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <EmptyState text="No contact messages found" />
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => {
            const isExpanded = expandedId === m.id;
            return (
              <div
                key={m.id}
                className="bg-white rounded-xl border border-brand-sage/30 overflow-hidden"
              >
                {/* Summary row */}
                <button
                  onClick={() => toggleExpand(m.id)}
                  className="w-full text-left px-6 py-4 flex items-center gap-4 hover:bg-brand-light/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-brand-deep truncate">
                        {m.name}
                      </span>
                      <StatusBadge variant={STATUS_VARIANT[m.status]}>
                        {m.status}
                      </StatusBadge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 flex-shrink-0" /> {m.email}
                      </span>
                      {m.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 flex-shrink-0" /> {m.phone}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {m.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(m.createdAt)}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-6 pb-5 border-t border-brand-sage/20 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Email: </span>
                        <a
                          href={`mailto:${m.email}`}
                          className="text-brand-teal underline underline-offset-2"
                        >
                          {m.email}
                        </a>
                      </div>
                      {m.phone && (
                        <div>
                          <span className="text-muted-foreground">Phone: </span>
                          <a
                            href={`tel:${m.phone}`}
                            className="text-brand-teal underline underline-offset-2"
                          >
                            {m.phone}
                          </a>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">
                          Preferred contact:{" "}
                        </span>
                        <span className="capitalize text-brand-deep">
                          {m.preferredContact}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Received: </span>
                        <span className="text-brand-deep">
                          {formatDate(m.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-brand-light/50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-brand-deep whitespace-pre-wrap">
                        {m.message}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {m.status !== "read" && (
                        <button
                          onClick={() => updateStatus(m.id, "read")}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-brand-teal/10 text-brand-teal hover:bg-brand-teal/20 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Mark as Read
                        </button>
                      )}
                      {m.status !== "archived" && (
                        <button
                          onClick={() => updateStatus(m.id, "archived")}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                          <Archive className="w-4 h-4" />
                          Archive
                        </button>
                      )}
                      {m.status === "archived" && (
                        <button
                          onClick={() => updateStatus(m.id, "new")}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                        >
                          Restore
                        </button>
                      )}
                    </div>
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
