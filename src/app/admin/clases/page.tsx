"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Clock, Calendar, MapPin, RefreshCw } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULTS } from "@/lib/constants";
import { todayISO } from "@/lib/utils";
import type { ClassItem, ScheduleItem, LocationItem } from "@/lib/types";

interface Instructor { id: number; name: string; }
interface ScheduleEntry {
  date: string;
  startTime: string;
  instructorName: string;
  recurring: boolean;
  untilDate: string;
  indefinite: boolean;
}

const emptyForm = {
  name: "",
  description: "",
  durationMinutes: DEFAULTS.durationMinutes,
  maxCapacity: DEFAULTS.maxCapacity,
  icon: DEFAULTS.icon,
  locationId: 0,
};

function makeScheduleEntry(defaultInstructor: string): ScheduleEntry {
  return {
    date: todayISO(),
    startTime: "09:00",
    instructorName: defaultInstructor,
    recurring: false,
    untilDate: "",
    indefinite: false,
  };
}

export default function ClasesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [locationsList, setLocationsList] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [newSchedules, setNewSchedules] = useState<ScheduleEntry[]>([]);
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
    setForm(emptyForm);
    setEditingId(null);
    setNewSchedules([makeScheduleEntry(defaultInstructor)]);
    setError("");
    setShowForm(true);
  }

  function openEdit(c: ClassItem) {
    const loc = locationsList.find((l) => l.name === c.location);
    setForm({
      name: c.name,
      description: c.description || "",
      durationMinutes: c.durationMinutes,
      maxCapacity: c.maxCapacity,
      icon: c.icon || DEFAULTS.icon,
      locationId: loc?.id || 0,
    });
    setEditingId(c.id);
    setNewSchedules([]);
    setError("");
    setShowForm(true);
  }

  function addScheduleEntry() {
    setNewSchedules((s) => [...s, makeScheduleEntry(defaultInstructor)]);
  }

  function removeScheduleEntry(index: number) {
    setNewSchedules((s) => s.filter((_, i) => i !== index));
  }

  function updateScheduleEntry(index: number, updates: Partial<ScheduleEntry>) {
    setNewSchedules((s) => s.map((entry, i) => (i === index ? { ...entry, ...updates } : entry)));
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
        icon: form.icon,
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

      if (!editingId && newSchedules.length > 0) {
        const updatedRes = await fetch("/api/admin/classes");
        const updatedClasses: ClassItem[] = updatedRes.ok ? await updatedRes.json() : [];
        const newClass = updatedClasses.find((c) => c.name === form.name);

        if (newClass) {
          const schedulePromises = newSchedules
            .filter((s) => s.date && s.startTime)
            .map((s) =>
              fetch("/api/admin/schedules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  classId: newClass.id,
                  date: s.date,
                  startTime: s.startTime,
                  instructor: s.instructorName || null,
                  recurring: s.recurring,
                  untilDate: s.recurring && !s.indefinite ? s.untilDate : null,
                }),
              })
            );
          await Promise.all(schedulePromises);
        }
      }

      setShowForm(false);
      setEditingId(null);
      setNewSchedules([]);
      loadData();
    } catch {
      setError("Connection error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this class and all its schedules?")) return;
    const classSchedules = schedules.filter((s) => s.classId === id);
    await Promise.all(
      classSchedules.map((s) => fetch(`/api/admin/schedules?id=${s.id}`, { method: "DELETE" }))
    );
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
    return schedules
      .filter((s) => s.classId === classId)
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-deep">Classes</h1>
        <button onClick={openNew} className="flex items-center gap-2 bg-brand-teal text-brand-light px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-dark transition-colors">
          <Plus className="w-4 h-4" /> New Class
        </button>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input label="Name *" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <Textarea label="Description" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <Input label="Duration (min)" type="number" min={15} max={180} value={form.durationMinutes} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))} />
              <Input label="Max Capacity" type="number" min={1} max={100} value={form.maxCapacity} onChange={(e) => setForm((f) => ({ ...f, maxCapacity: Number(e.target.value) }))} />
              {locationsList.length > 0 && (
                <Select label="Location" value={form.locationId} onChange={(e) => setForm((f) => ({ ...f, locationId: Number(e.target.value) }))}>
                  <option value={0}>No location</option>
                  {locationsList.map((loc) => (<option key={loc.id} value={loc.id}>{loc.name}</option>))}
                </Select>
              )}
            </div>

            {!editingId && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-brand-deep flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Sessions
                  </h3>
                  <button type="button" onClick={addScheduleEntry} className="text-xs text-brand-teal hover:text-brand-dark font-medium flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add session
                  </button>
                </div>

                {newSchedules.length === 0 ? (
                  <p className="text-sm text-muted-foreground bg-brand-sage/10 px-4 py-3 rounded-xl">
                    Add at least one session with date and time.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {newSchedules.map((entry, i) => (
                      <div key={i} className="bg-brand-light/50 p-4 rounded-xl space-y-3">
                        <div className="flex items-end gap-3">
                          <div className="flex-1">
                            <Input label="Date *" type="date" value={entry.date} onChange={(e) => updateScheduleEntry(i, { date: e.target.value })} />
                          </div>
                          <div className="flex-1">
                            <Input label="Time *" type="time" value={entry.startTime} onChange={(e) => updateScheduleEntry(i, { startTime: e.target.value })} />
                          </div>
                          <div className="flex-1">
                            {instructors.length > 0 ? (
                              <Select label="Instructor" value={entry.instructorName} onChange={(e) => updateScheduleEntry(i, { instructorName: e.target.value })}>
                                {instructors.map((inst) => (<option key={inst.id} value={inst.name}>{inst.name}</option>))}
                              </Select>
                            ) : (
                              <Input label="Instructor" value={entry.instructorName} placeholder="Name" onChange={(e) => updateScheduleEntry(i, { instructorName: e.target.value })} />
                            )}
                          </div>
                          <button type="button" onClick={() => removeScheduleEntry(i)} className="p-2 text-red-400 hover:text-red-600 mb-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Recurring toggle */}
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={entry.recurring} onChange={(e) => updateScheduleEntry(i, { recurring: e.target.checked })}
                              className="w-4 h-4 rounded border-brand-sage/30 text-brand-teal focus:ring-brand-teal/30" />
                            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-brand-deep font-medium">Repeat weekly</span>
                          </label>

                          {entry.recurring && (
                            <div className="flex items-center gap-3 ml-4">
                              <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="radio" name={`until-${i}`} checked={entry.indefinite} onChange={() => updateScheduleEntry(i, { indefinite: true, untilDate: "" })}
                                  className="w-4 h-4 text-brand-teal focus:ring-brand-teal/30" />
                                <span>Indefinitely</span>
                              </label>
                              <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="radio" name={`until-${i}`} checked={!entry.indefinite} onChange={() => updateScheduleEntry(i, { indefinite: false })}
                                  className="w-4 h-4 text-brand-teal focus:ring-brand-teal/30" />
                                <span>Until</span>
                              </label>
                              {!entry.indefinite && (
                                <input type="date" value={entry.untilDate} onChange={(e) => updateScheduleEntry(i, { untilDate: e.target.value })}
                                  min={entry.date}
                                  className="px-3 py-1.5 rounded-lg border border-brand-sage/30 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30" />
                              )}
                            </div>
                          )}
                        </div>

                        {entry.recurring && (
                          <p className="text-xs text-muted-foreground">
                            {entry.indefinite
                              ? `Will repeat every ${new Date(entry.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" })} for ~6 months`
                              : entry.untilDate
                                ? `Will repeat every ${new Date(entry.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" })} until ${new Date(entry.untilDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                                : "Select an end date"}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button type="submit" disabled={saving} className="bg-brand-teal text-brand-light px-6 py-2.5 rounded-xl font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50">
              {saving ? "Saving..." : editingId ? "Save Changes" : "Create Class"}
            </button>
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
            const cs = getClassSchedules(c.id);
            const upcoming = cs.filter((s) => s.date >= todayISO());
            return (
              <div key={c.id} className="bg-white rounded-xl border border-brand-sage/30 overflow-hidden">
                <div className="px-6 py-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-brand-deep">{c.name}</h3>
                    {c.description && <p className="text-sm text-muted-foreground mt-0.5">{c.description}</p>}
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {c.durationMinutes} min</span>
                      <span>{c.maxCapacity} spots</span>
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
