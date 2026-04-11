"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULTS } from "@/lib/constants";
import type { ClassItem } from "@/lib/types";

const emptyForm = {
  name: "",
  description: "",
  durationMinutes: DEFAULTS.durationMinutes,
  maxCapacity: DEFAULTS.maxCapacity,
  icon: DEFAULTS.icon,
};

export default function ClasesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function loadClasses() {
    const res = await fetch("/api/admin/classes");
    const data = await res.json();
    setClasses(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { loadClasses(); }, []);

  function openNew() {
    setForm(emptyForm);
    setEditingId(null);
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
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const body = editingId ? { id: editingId, ...form } : form;

    await fetch("/api/admin/classes", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setShowForm(false);
    setEditingId(null);
    loadClasses();
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar esta clase?")) return;
    await fetch(`/api/admin/classes?id=${id}`, { method: "DELETE" });
    loadClasses();
  }

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-deep">Clases</h1>
        <button onClick={openNew} className="flex items-center gap-2 bg-brand-teal text-brand-light px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-dark transition-colors">
          <Plus className="w-4 h-4" /> Nueva clase
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-brand-cream p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold text-brand-deep">
              {editingId ? "Editar clase" : "Nueva clase"}
            </h2>
            <button onClick={() => setShowForm(false)}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Nombre *"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <Textarea
                label="Descripción"
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <Input
              label="Duración (min)"
              type="number"
              min={15}
              max={180}
              value={form.durationMinutes}
              onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
            />
            <Input
              label="Capacidad máxima"
              type="number"
              min={1}
              max={100}
              value={form.maxCapacity}
              onChange={(e) => setForm((f) => ({ ...f, maxCapacity: Number(e.target.value) }))}
            />
            <div className="sm:col-span-2">
              <button type="submit" className="bg-brand-teal text-brand-light px-6 py-2.5 rounded-xl font-semibold hover:bg-brand-dark transition-colors">
                {editingId ? "Guardar cambios" : "Crear clase"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-brand-cream overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-brand-light/50">
                {["Nombre", "Duración", "Capacidad", ""].map((h) => (
                  <th key={h} className={`${h ? "text-left" : "text-right"} px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider`}>
                    {h || "Acciones"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-cream">
              {classes.map((c) => (
                <tr key={c.id} className="hover:bg-brand-light/30">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-brand-deep">{c.name}</p>
                    {c.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{c.description}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{c.durationMinutes} min</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{c.maxCapacity} personas</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEdit(c)} className="text-brand-teal hover:text-brand-dark mr-3">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
