"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, X, User } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";

interface Instructor {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  async function loadInstructors() {
    try {
      const res = await fetch("/api/admin/instructors");
      const data = res.ok ? await res.json() : [];
      setInstructors(Array.isArray(data) ? data : []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadInstructors(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/instructors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowForm(false);
        setForm({ name: "", email: "", phone: "" });
        loadInstructors();
      } else {
        const data = await res.json();
        setError(data.error || "Error creating instructor");
      }
    } catch {
      setError("Connection error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this instructor?")) return;
    await fetch(`/api/admin/instructors?id=${id}`, { method: "DELETE" });
    loadInstructors();
  }

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-deep">Instructors</h1>
        <button onClick={() => { setShowForm(true); setError(""); }}
          className="flex items-center gap-2 bg-brand-teal text-brand-light px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-dark transition-colors">
          <Plus className="w-4 h-4" /> New Instructor
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-brand-sage/30 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold text-brand-deep">New Instructor</h2>
            <button onClick={() => setShowForm(false)}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Name *" required value={form.name} placeholder="Full name"
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input label="Email" type="email" value={form.email} placeholder="email@example.com"
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <Input label="Phone" type="tel" value={form.phone} placeholder="+34 612 345 678"
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />

            {error && <div className="sm:col-span-3 text-red-600 text-sm">{error}</div>}

            <div className="sm:col-span-3">
              <button type="submit" disabled={saving}
                className="bg-brand-teal text-brand-light px-6 py-2.5 rounded-xl font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50">
                {saving ? "Saving..." : "Add Instructor"}
              </button>
            </div>
          </form>
        </div>
      )}

      {instructors.length === 0 ? (
        <EmptyState text="No instructors yet. Add your first one." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {instructors.map((inst) => (
            <div key={inst.id} className="bg-white rounded-xl border border-brand-sage/30 p-5 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-brand-teal/10 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-brand-teal" />
                </div>
                <div>
                  <p className="font-medium text-brand-deep">{inst.name}</p>
                  {inst.email && <p className="text-xs text-muted-foreground">{inst.email}</p>}
                  {inst.phone && <p className="text-xs text-muted-foreground">{inst.phone}</p>}
                </div>
              </div>
              <button onClick={() => handleDelete(inst.id)} className="text-red-400 hover:text-red-600 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
