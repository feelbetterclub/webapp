"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Download } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import type { BookingItem } from "@/lib/types";

export default function AlumnosPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
  const [searchTerm, setSearchTerm] = useState("");

  const loadBookings = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/bookings?date=${dateFilter}`);
    const data = await res.json();
    setBookings(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [dateFilter]);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  const filtered = bookings.filter(
    (b) =>
      b.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedByClass = filtered.reduce((acc, b) => {
    const key = `${b.className} - ${b.startTime}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(b);
    return acc;
  }, {} as Record<string, BookingItem[]>);

  function exportCSV() {
    const headers = "Nombre,Email,Teléfono,Clase,Hora,Fecha,Estado\n";
    const rows = filtered
      .map((b) => `${b.userName},${b.userEmail},${b.userPhone || ""},${b.className},${b.startTime},${b.date},${b.status}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alumnos-${dateFilter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-deep">Alumnos</h1>
        <button
          onClick={exportCSV}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 bg-brand-teal text-brand-light px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, email o clase..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-cream bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
          />
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-brand-cream bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
        />
      </div>

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <EmptyState text="No hay alumnos registrados para esta fecha" />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByClass).map(([classKey, classBookings]) => (
            <div key={classKey} className="bg-white rounded-xl border border-brand-cream overflow-hidden">
              <div className="px-6 py-3 bg-brand-light/50 border-b border-brand-cream flex items-center justify-between">
                <h3 className="font-heading font-semibold text-brand-deep">{classKey}</h3>
                <span className="text-sm text-muted-foreground">
                  {classBookings.length} alumno{classBookings.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-brand-cream">
                      {["Nombre", "Email", "Teléfono", "Estado"].map((h) => (
                        <th key={h} className="text-left px-6 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-cream">
                    {classBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-brand-light/30">
                        <td className="px-6 py-3 text-sm font-medium text-brand-deep">{b.userName}</td>
                        <td className="px-6 py-3 text-sm text-muted-foreground">{b.userEmail}</td>
                        <td className="px-6 py-3 text-sm text-muted-foreground">{b.userPhone || "—"}</td>
                        <td className="px-6 py-3">
                          <StatusBadge variant={b.status === "confirmed" ? "confirmed" : "cancelled"}>
                            {b.status === "confirmed" ? "Confirmada" : "Cancelada"}
                          </StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
