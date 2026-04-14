"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Clock, Calendar } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULTS } from "@/lib/constants";
import { DAY_NAMES } from "@/lib/days";
import type { ClassItem, ScheduleItem } from "@/lib/types";

interface ScheduleEntry {
  dayOfWeek: number;
  startTime: string;
  instructor: string;
}

const emptyForm = {
  name: "",
  description: "",
  durationMinutes: DEFAULTS.durationMinutes,
  maxCapacity: DEFAULTS.maxCapacity,
  icon: DEFAULTS.icon,
};

export default function ClasesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [newSchedules, setNewSchedules] = useState<ScheduleEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [cRes, sRes] = await Promise.all([
        fetch("/api/admin/classes"),
        fetch("/api/admin/schedules"),
      ]);
      const cData = cRes.ok ? await cRes.json() : [];
      const sData = sRes.ok ? await sRes.json() : [];
      setClasses(Array.isArray(cData) ? cData : []);
      setSchedules(Array.isArray(sData) ? sData : []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  function openNew() {
    setForm(emptyForm);
    setEditingId(null);
    setNewSchedules([{ dayOfWeek: 1, startTime: "09:00", instructor: "" }]);
    setError("");
    setShowForm(true);
  }

  function openEdit(c: ClassItem) {
    setForm({
      name: c.name,
      description: c.description || "",
      durationMinutes: c.durationMinutes,
      maxCapacity: c.maxCapacity,
      icon: c.icon || DEFAULTS.icon,
    });
    setEditingId(c.id);
    setNewSchedules([]);
    setError("");
    setShowForm(true);
  }

  function addScheduleEntry() {
    setNewSchedules((s) => [...s, { dayOfWeek: 1, startTime: "09:00", instructor: "" }]);
  }

  function removeScheduleEntry(index: number) {
    setNewSchedules((s) => s.filter((_, i) => i !== index));
  }

  function updateScheduleEntry(index: number, field: keyof ScheduleEntry, value: string | number) {
    setNewSchedules((s) =>
      s.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { id: editingId, ...form } : form;

      const classRes = await fetch("/api/admin/classes", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!classRes.ok) {
        const data = await classRes.json();
        setError(data.error || "Error al guardar clase");
        setSaving(false);
        return;
      }

      // If creating new class with schedules, we need the class ID
      if (!editingId && newSchedules.length > 0) {
        // Reload classes to get the new ID
        const updatedRes = await fetch("/api/admin/classes");
        const updatedClasses = updatedRes.ok ? await updatedRes.json() : [];
        const newClass = Array.isArray(updatedClasses)
          ? updatedClasses.find((c: ClassItem) => c.name === form.name)
          : null;

        if (newClass) {
          // Create all schedules for this class
          await Promise.all(
            newSchedules
              .filter((s) => s.dayOfWeek && s.startTime)
              .map((s) =>
                fetch("/api/admin/schedules", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    classId: newClass.id,
                    dayOfWeek: s.dayOfWeek,
                    startTime: s.startTime,
                    instructor: s.instructor || null,
                  }),
                })
              )
          );
        }
      }

      setShowForm(false);
      setEditingId(null);
      setNewSchedules([]);
      loadData();
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar esta clase y todos sus horarios?")) return;
    // Delete schedules first, then class
    const classSchedules = schedules.filter((s) => s.classId === id);
    await Promise.all(
      classSchedules.map((s) =>
        fetch(`/api/admin/schedules?id=${s.id}`, { method: "DELETE" })
      )
    );
    await fetch(`/api/admin/classes?id=${id}`, { method: "DELETE" });
    loadData();
  }

  if (loading) return <Loading />;

  function getClassSchedules(classId: number) {
    return schedules
      .filter((s) => s.classId === classId)
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-deep">Clases</h1>
        <button onClick={openNew} className="flex items-center gap-2 bg-brand-teal text-brand-light px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-dark transition-colors">
          <Plus className="w-4 h-4" /> Nueva clase
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-brand-sage/30 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold text-brand-deep">
              {editingId ? "Editar clase" : "Nueva clase"}
            </h2>
            <button onClick={() => setShowForm(false)}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Class info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input label="Nombre *" required value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <Textarea label="Descripción" rows={2} value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <Input label="Duración (min)" type="number" min={15} max={180} value={form.durationMinutes}
                onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))} />
              <Input label="Capacidad máxima" type="number" min={1} max={100} value={form.maxCapacity}
                onChange={(e) => setForm((f) => ({ ...f, maxCapacity: Number(e.target.value) }))} />
            </div>

            {/* Schedules — only for new classes */}
            {!editingId && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-brand-deep flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Horarios
                  </h3>
                  <button type="button" onClick={addScheduleEntry}
                    className="text-xs text-brand-teal hover:text-brand-dark font-medium flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Añadir horario
                  </button>
                </div>

                {newSchedules.length === 0 ? (
                  <p className="text-sm text-muted-foreground bg-brand-sage/10 px-4 py-3 rounded-xl">
                    Puedes añadir horarios ahora o después desde la sección Horarios
                  </p>
                ) : (
                  <div className="space-y-3">
                    {newSchedules.map((entry, i) => (
                      <div key={i} className="flex items-end gap-3 bg-brand-light/50 p-3 rounded-xl">
                        <div className="flex-1">
                          <Select label="Día" value={entry.dayOfWeek}
                            onChange={(e) => updateScheduleEntry(i, "dayOfWeek", Number(e.target.value))}>
                            {DAY_NAMES.slice(1).map((d, idx) => (
                              <option key={idx + 1} value={idx + 1}>{d}</option>
                            ))}
                          </Select>
                        </div>
                        <div className="flex-1">
                          <Input label="Hora" type="time" value={entry.startTime}
                            onChange={(e) => updateScheduleEntry(i, "startTime", e.target.value)} />
                        </div>
                        <div className="flex-1">
                          <Input label="Instructor" value={entry.instructor} placeholder="Nombre"
                            onChange={(e) => updateScheduleEntry(i, "instructor", e.target.value)} />
                        </div>
                        <button type="button" onClick={() => removeScheduleEntry(i)}
                          className="p-2 text-red-400 hover:text-red-600 mb-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button type="submit" disabled={saving}
              className="bg-brand-teal text-brand-light px-6 py-2.5 rounded-xl font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50">
              {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear clase"}
            </button>
          </form>
        </div>
      )}

      {classes.length === 0 ? (
        <div className="bg-white rounded-xl border border-brand-sage/30 p-12 text-center text-muted-foreground">
          No hay clases creadas todavía
        </div>
      ) : (
        <div className="space-y-4">
          {classes.map((c) => {
            const classSchedules = getClassSchedules(c.id);
            return (
              <div key={c.id} className="bg-white rounded-xl border border-brand-sage/30 overflow-hidden">
                <div className="px-6 py-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-brand-deep">{c.name}</h3>
                    {c.description && (
                      <p className="text-sm text-muted-foreground mt-0.5">{c.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {c.durationMinutes} min
                      </span>
                      <span>{c.maxCapacity} plazas</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="text-brand-teal hover:text-brand-dark p-1">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {classSchedules.length > 0 && (
                  <div className="border-t border-brand-sage/20 px-6 py-3 bg-brand-light/30">
                    <div className="flex flex-wrap gap-2">
                      {classSchedules.map((s) => (
                        <span key={s.id} className="inline-flex items-center gap-1 text-xs bg-brand-sage/20 text-brand-dark px-2.5 py-1 rounded-full">
                          <Calendar className="w-3 h-3" />
                          {DAY_NAMES[s.dayOfWeek]} {s.startTime}
                          {s.instructor && <span className="text-muted-foreground">· {s.instructor}</span>}
                        </span>
                      ))}
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
