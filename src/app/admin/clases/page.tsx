"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Clock, Calendar, MapPin, RefreshCw, Euro, Users } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULTS } from "@/lib/constants";
import { BrandButton } from "@/components/ui/brand-button";
import { todayISO } from "@/lib/utils";
import type { ClassItem, ScheduleItem, LocationItem } from "@/lib/types";

interface Instructor { id: number; name: string; }

const emptyForm = {
  name: "",
  description: "",
  durationMinutes: DEFAULTS.durationMinutes,
  maxCapacity: DEFAULTS.maxCapacity,
  locationId: 0,
  // Session fields
  date: todayISO(),
  startTime: "09:00",
  instructorName: "",
  recurring: false,
  untilDate: "",
  indefinite: false,
  sessionPrice: "" as string | number,
  sessionMaxCapacity: "" as string | number,
  queueCapacity: DEFAULTS.queueCapacity as number,
};

export default function ClasesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [locationsList, setLocationsList] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [cRes, sRes, iRes, lRes] = await Promise.all([
        fetch("/api/admin/classes"),
        fetch("/api/admin/schedules"),
        fetch("/api/admin/instructors"),
        fetch("/api/admin/locations"),
      ]);
      setClasses(cRes.ok ? await cRes.json() : []);
      setSchedules(sRes.ok ? await sRes.json() : []);
      setInstructors(iRes.ok ? await iRes.json() : []);
      setLocationsList(lRes.ok ? await lRes.json() : []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const defaultInstructor = instructors.length > 0 ? instructors[0].name : "";

  function openNew() {
    setForm({ ...emptyForm, instructorName: defaultInstructor, date: todayISO() });
    setEditingId(null);
    setError("");
    setShowForm(true);
  }

  function openEdit(c: ClassItem) {
    const loc = locationsList.find((l) => l.name === c.location);
    setForm({
      ...emptyForm,
      name: c.name,
      description: c.description || "",
      durationMinutes: c.durationMinutes,
      maxCapacity: c.maxCapacity,
      queueCapacity: c.queueCapacity ?? DEFAULTS.queueCapacity,
      locationId: loc?.id || 0,
      instructorName: defaultInstructor,
    });
    setEditingId(c.id);
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const selectedLocation = locationsList.find((l) => l.id === form.locationId);
      const method = editingId ? "PUT" : "POST";
      const classData = {
        name: form.name,
        description: form.description,
        durationMinutes: form.durationMinutes,
        maxCapacity: form.maxCapacity,
      queueCapacity: form.queueCapacity,
        icon: DEFAULTS.icon,
        location: selectedLocation?.name || null,
        locationUrl: selectedLocation?.url || null,
      };
      const body = editingId ? { id: editingId, ...classData } : classData;

      const classRes = await fetch("/api/admin/classes", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!classRes.ok) {
        const data = await classRes.json();
        setError(data.detail || data.error || "Error saving class");
        setSaving(false);
        return;
      }

      // Create session for new classes
      if (!editingId && form.date && form.startTime) {
        const updatedRes = await fetch("/api/admin/classes");
        const updatedClasses: ClassItem[] = updatedRes.ok ? await updatedRes.json() : [];
        const newClass = updatedClasses.find((c) => c.name === form.name);

        if (newClass) {
          await fetch("/api/admin/schedules", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              classId: newClass.id,
              date: form.date,
              startTime: form.startTime,
              instructor: form.instructorName || null,
              recurring: form.recurring,
              untilDate: form.recurring && !form.indefinite ? form.untilDate : null,
              price: form.sessionPrice !== "" ? Number(form.sessionPrice) * 100 : null,
              maxCapacity: form.sessionMaxCapacity !== "" ? Number(form.sessionMaxCapacity) : null,
            }),
          });
        }
      }

      setShowForm(false);
      setEditingId(null);
      loadData();
    } catch {
      setError("Connection error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this class and all its sessions?")) return;
    const cs = schedules.filter((s) => s.classId === id);
    await Promise.all(cs.map((s) => fetch(`/api/admin/schedules?id=${s.id}`, { method: "DELETE" })));
    await fetch(`/api/admin/classes?id=${id}`, { method: "DELETE" });
    loadData();
  }

  async function handleDeleteSchedule(scheduleId: number) {
    if (!confirm("Delete this session?")) return;
    await fetch(`/api/admin/schedules?id=${scheduleId}`, { method: "DELETE" });
    loadData();
  }

  if (loading) return <Loading />;

  function getClassSchedules(classId: number) {
    const today = todayISO();
    return schedules
      .filter((s) => s.classId === classId && s.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-deep">Classes</h1>
        <BrandButton onClick={openNew} size="md">
          <Plus className="w-4 h-4" /> New Class
        </BrandButton>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-brand-sage/30 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold text-brand-deep">
              {editingId ? "Edit Class" : "New Class"}
            </h2>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Class info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input label="Name *" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <Textarea label="Description" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <Input label="Duration (min)" type="number" min={15} max={180} value={form.durationMinutes} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))} />
              <Input label="Capacity" type="number" min={1} max={100} value={form.maxCapacity} onChange={(e) => setForm((f) => ({ ...f, maxCapacity: Number(e.target.value) }))} />
              <Input label="Queue" type="number" min={0} max={50} value={form.queueCapacity} onChange={(e) => setForm((f) => ({ ...f, queueCapacity: Number(e.target.value) }))} />
              <div>
                <label className="block text-sm font-medium text-brand-deep mb-1 flex items-center gap-1">
                  <Euro className="w-3.5 h-3.5" /> Price (EUR)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.sessionPrice}
                  onChange={(e) => setForm((f) => ({ ...f, sessionPrice: e.target.value === "" ? "" : Number(e.target.value) }))}
                  placeholder="Leave empty for free / donation"
                  className="w-full px-3 py-2 rounded-lg border border-brand-sage/30 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
                />
              </div>
              {locationsList.length > 0 && (
                <Select label="Location" value={form.locationId} onChange={(e) => setForm((f) => ({ ...f, locationId: Number(e.target.value) }))}>
                  <option value={0}>No location</option>
                  {locationsList.map((loc) => (<option key={loc.id} value={loc.id}>{loc.name}</option>))}
                </Select>
              )}
            </div>

            {/* Session — only for new classes */}
            {!editingId && (
              <div className="bg-brand-light/50 p-4 rounded-xl space-y-4">
                <h3 className="text-sm font-semibold text-brand-deep flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Session
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input label="Date *" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                  <Input label="Time *" type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
                  {instructors.length > 0 ? (
                    <Select label="Instructor" value={form.instructorName} onChange={(e) => setForm((f) => ({ ...f, instructorName: e.target.value }))}>
                      {instructors.map((inst) => (<option key={inst.id} value={inst.name}>{inst.name}</option>))}
                    </Select>
                  ) : (
                    <Input label="Instructor" value={form.instructorName} placeholder="Name" onChange={(e) => setForm((f) => ({ ...f, instructorName: e.target.value }))} />
                  )}
                </div>

                {/* Recurring */}
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.recurring} onChange={(e) => setForm((f) => ({ ...f, recurring: e.target.checked }))}
                      className="w-4 h-4 rounded border-brand-sage/30 text-brand-teal focus:ring-brand-teal/30" />
                    <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-brand-deep font-medium">Repeat weekly</span>
                  </label>

                  {form.recurring && (
                    <>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="radio" name="until" checked={form.indefinite} onChange={() => setForm((f) => ({ ...f, indefinite: true, untilDate: "" }))}
                          className="w-4 h-4 text-brand-teal focus:ring-brand-teal/30" />
                        <span>Indefinitely</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="radio" name="until" checked={!form.indefinite} onChange={() => setForm((f) => ({ ...f, indefinite: false }))}
                          className="w-4 h-4 text-brand-teal focus:ring-brand-teal/30" />
                        <span>Until</span>
                      </label>
                      {!form.indefinite && (
                        <input type="date" value={form.untilDate} min={form.date}
                          onChange={(e) => setForm((f) => ({ ...f, untilDate: e.target.value }))}
                          className="px-3 py-1.5 rounded-lg border border-brand-sage/30 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30" />
                      )}
                    </>
                  )}
                </div>

                {form.recurring && (
                  <p className="text-xs text-muted-foreground">
                    {form.indefinite
                      ? `Will repeat every ${new Date(form.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" })} for ~6 months`
                      : form.untilDate
                        ? `Will repeat every ${new Date(form.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" })} until ${new Date(form.untilDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                        : "Select an end date"}
                  </p>
                )}
              </div>
            )}

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <BrandButton type="submit" size="lg" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save Changes" : "Create Class"}
            </BrandButton>
          </form>
        </div>
      )}

      {classes.length === 0 ? (
        <div className="bg-white rounded-xl border border-brand-sage/30 p-12 text-center text-muted-foreground">
          No classes yet. Create your first one.
        </div>
      ) : (
        <div className="space-y-4">
          {classes.map((c) => {
            const upcoming = getClassSchedules(c.id);
            return (
              <div key={c.id} className="bg-white rounded-xl border border-brand-sage/30 overflow-hidden">
                <div className="px-6 py-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-brand-deep">{c.name}</h3>
                    {c.description && <p className="text-sm text-muted-foreground mt-0.5">{c.description}</p>}
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {c.durationMinutes} min</span>
                      <span>{c.maxCapacity} spots + {c.queueCapacity ?? 5} queue</span>
                      {c.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {c.locationUrl ? <a href={c.locationUrl} target="_blank" rel="noopener noreferrer" className="text-brand-teal hover:underline">{c.location}</a> : c.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="text-brand-teal hover:text-brand-dark p-1"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                {upcoming.length > 0 && (
                  <div className="border-t border-brand-sage/20 px-6 py-3 bg-brand-light/30">
                    <p className="text-xs text-muted-foreground mb-2">{upcoming.length} upcoming session{upcoming.length !== 1 ? "s" : ""}</p>
                    <div className="flex flex-wrap gap-2">
                      {upcoming.slice(0, 10).map((s) => (
                        <span key={s.id} className="inline-flex items-center gap-1 text-xs bg-brand-sage/20 text-brand-dark px-2.5 py-1 rounded-full group">
                          <Calendar className="w-3 h-3" />
                          {new Date(s.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} {s.startTime}
                          {s.instructor && <span className="text-muted-foreground">· {s.instructor}</span>}
                          {s.price != null && <span className="text-brand-teal">· {(s.price / 100).toFixed(0)}€</span>}
                          {s.maxCapacity != null && <span className="text-muted-foreground">· {s.maxCapacity} spots</span>}
                          <button onClick={() => handleDeleteSchedule(s.id)} className="ml-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {upcoming.length > 10 && <span className="text-xs text-muted-foreground">+{upcoming.length - 10} more</span>}
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
