"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DAY_NAMES } from "@/lib/days";
import type { ScheduleItem, ClassItem } from "@/lib/types";

export default function HorariosPage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    classId: 0,
    dayOfWeek: 1,
    startTime: "09:00",
    instructor: "",
  });

  async function loadData() {
    try {
      const [sRes, cRes] = await Promise.all([
        fetch("/api/admin/schedules"),
        fetch("/api/admin/classes"),
      ]);
      const sData = sRes.ok ? await sRes.json() : [];
      const cData = cRes.ok ? await cRes.json() : [];
      const scheduleList = Array.isArray(sData) ? sData : [];
      const classList = Array.isArray(cData) ? cData : [];
      setSchedules(scheduleList);
      setClasses(classList);
      if (classList.length > 0 && form.classId === 0) {
        setForm((f) => ({ ...f, classId: classList[0].id }));
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  function openForm() {
    setError("");
    if (classes.length > 0) {
      setForm((f) => ({ ...f, classId: f.classId || classes[0].id }));
    }
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.classId || !form.dayOfWeek || !form.startTime) {
      setError("Selecciona clase, día y hora");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowForm(false);
        setForm({ classId: classes[0]?.id || 0, dayOfWeek: 1, startTime: "09:00", instructor: "" });
        loadData();
      } else {
        const data = await res.json();
        setError(data.error || "Error al crear horario");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este horario?")) return;
    await fetch(`/api/admin/schedules?id=${id}`, { method: "DELETE" });
    loadData();
  }

  if (loading) return <Loading />;

  const grouped = schedules.reduce((acc, s) => {
    if (!acc[s.dayOfWeek]) acc[s.dayOfWeek] = [];
    acc[s.dayOfWeek].push(s);
    return acc;
  }, {} as Record<number, ScheduleItem[]>);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-deep">Horarios</h1>
        <button onClick={openForm} className="flex items-center gap-2 bg-brand-teal text-brand-light px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-dark transition-colors">
          <Plus className="w-4 h-4" /> Nuevo horario
        </button>
      </div>

      {classes.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
          Primero crea al menos una clase en la sección &quot;Clases&quot; antes de añadir horarios.
        </div>
      )}

      {showForm && classes.length > 0 && (
        <div className="bg-white rounded-xl border border-brand-sage/30 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold text-brand-deep">Nuevo horario</h2>
            <button onClick={() => setShowForm(false)}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Clase *"
              value={form.classId}
              onChange={(e) => setForm((f) => ({ ...f, classId: Number(e.target.value) }))}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
            <Select
              label="Día *"
              value={form.dayOfWeek}
              onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: Number(e.target.value) }))}
            >
              {DAY_NAMES.slice(1).map((d, i) => (
                <option key={i + 1} value={i + 1}>{d}</option>
              ))}
            </Select>
            <Input
              label="Hora *"
              type="time"
              value={form.startTime}
              onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
            />
            <Input
              label="Instructor"
              value={form.instructor}
              onChange={(e) => setForm((f) => ({ ...f, instructor: e.target.value }))}
              placeholder="Nombre del instructor"
            />

            {error && (
              <div className="sm:col-span-2 text-red-600 text-sm">{error}</div>
            )}

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-brand-teal text-brand-light px-6 py-2.5 rounded-xl font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50"
              >
                {saving ? "Creando..." : "Crear horario"}
              </button>
            </div>
          </form>
        </div>
      )}

      {schedules.length === 0 ? (
        <div className="bg-white rounded-xl border border-brand-sage/30 p-12 text-center text-muted-foreground">
          No hay horarios creados todavía
        </div>
      ) : (
        <div className="space-y-6">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => {
            const daySchedules = grouped[day];
            if (!daySchedules?.length) return null;

            return (
              <div key={day} className="bg-white rounded-xl border border-brand-sage/30 overflow-hidden">
                <div className="px-6 py-3 bg-brand-light/50 border-b border-brand-sage/20">
                  <h3 className="font-heading font-semibold text-brand-deep">{DAY_NAMES[day]}</h3>
                </div>
                <div className="divide-y divide-brand-sage/20">
                  {[...daySchedules]
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((s) => (
                      <div key={s.id} className="px-6 py-3 flex items-center justify-between hover:bg-brand-light/30">
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-mono text-muted-foreground w-12">{s.startTime}</span>
                          <span className="text-sm font-medium text-brand-deep">{s.className}</span>
                          {s.instructor && <span className="text-xs text-muted-foreground">· {s.instructor}</span>}
                        </div>
                        <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
