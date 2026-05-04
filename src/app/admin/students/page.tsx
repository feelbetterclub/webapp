"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Download, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { safeArray, escapeCSVField } from "@/lib/utils";
import { BrandButton } from "@/components/ui/brand-button";
import type { StudentRecord } from "@/lib/types";

type SortKey = keyof Pick<StudentRecord, "name" | "email" | "totalClasses" | "lastClassDate" | "firstClassDate">;
type SortDir = "asc" | "desc";

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AlumnosPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("totalClasses");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/students");
      const data = res.ok ? await res.json() : [];
      setStudents(safeArray<StudentRecord>(data));
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "totalClasses" ? "desc" : "asc");
    }
  }

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const base = term
      ? students.filter(
          (s) =>
            s.name.toLowerCase().includes(term) ||
            s.email.toLowerCase().includes(term)
        )
      : students;

    return [...base].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      let cmp = 0;
      if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else {
        cmp = String(av ?? "").localeCompare(String(bv ?? ""));
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [students, searchTerm, sortKey, sortDir]);

  function exportCSV() {
    const headers = "Name,Email,Phone,Total Classes,Last Class Date,Last Class Name,Member Since,Community Member\n";
    const rows = filtered
      .map((s) =>
        [
          s.name,
          s.email,
          s.phone || "",
          String(s.totalClasses),
          s.lastClassDate,
          s.lastClassName,
          s.firstClassDate,
          s.isCommunityMember ? "Yes" : "No",
        ]
          .map(escapeCSVField)
          .join(",")
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function deleteStudent(email: string, name: string) {
    if (!confirm(`Delete all records for "${name}" (${email})? This removes bookings, waitlist entries and community membership.`)) return;
    try {
      const res = await fetch("/api/admin/students", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStudents((prev) => prev.filter((s) => s.email !== email));
      }
    } catch { /* ignore */ }
  }

  const columns: { label: string; key?: SortKey }[] = [
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Phone" },
    { label: "Total Classes", key: "totalClasses" },
    { label: "Last Class", key: "lastClassDate" },
    { label: "Last Class Name" },
    { label: "Member Since", key: "firstClassDate" },
    { label: "Community" },
    { label: "" },
  ];

  function SortIcon({ col }: { col: typeof columns[number] }) {
    if (!col.key) return null;
    if (sortKey !== col.key) return <ChevronUp className="w-3 h-3 opacity-30" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3 h-3 text-brand-teal" />
      : <ChevronDown className="w-3 h-3 text-brand-teal" />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-deep">Students</h1>
        <BrandButton onClick={exportCSV} disabled={filtered.length === 0} size="md">
          <Download className="w-4 h-4" /> Export CSV
        </BrandButton>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-sage/30 bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
          />
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <EmptyState text="No students found" />
      ) : (
        <div className="bg-white rounded-xl border border-brand-sage/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-sage/20 bg-brand-light/50">
                  {columns.map((col) => (
                    <th
                      key={col.label}
                      onClick={() => col.key && handleSort(col.key)}
                      className={[
                        "text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap",
                        col.key ? "cursor-pointer select-none hover:text-brand-deep" : "",
                      ].join(" ")}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        <SortIcon col={col} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-sage/20">
                {filtered.map((s) => (
                  <tr key={s.email} className="hover:bg-brand-light/30">
                    <td className="px-6 py-3 text-sm font-medium text-brand-deep whitespace-nowrap">{s.name}</td>
                    <td className="px-6 py-3 text-sm text-muted-foreground">{s.email}</td>
                    <td className="px-6 py-3 text-sm text-muted-foreground whitespace-nowrap">{s.phone || "—"}</td>
                    <td className="px-6 py-3 text-sm font-bold text-brand-deep text-center">{s.totalClasses}</td>
                    <td className="px-6 py-3 text-sm text-muted-foreground whitespace-nowrap">{formatDate(s.lastClassDate)}</td>
                    <td className="px-6 py-3 text-sm text-muted-foreground">{s.lastClassName}</td>
                    <td className="px-6 py-3 text-sm text-muted-foreground whitespace-nowrap">{formatDate(s.firstClassDate)}</td>
                    <td className="px-6 py-3">
                      {s.isCommunityMember && (
                        <StatusBadge variant="confirmed">Member</StatusBadge>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => deleteStudent(s.email, s.name)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        title="Delete student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
