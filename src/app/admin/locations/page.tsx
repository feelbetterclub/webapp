"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, X, MapPin, ExternalLink } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { BrandButton } from "@/components/ui/brand-button";
import type { LocationItem } from "@/lib/types";

export default function LocationsPage() {
  const [locationsList, setLocationsList] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", url: "" });

  async function loadLocations() {
    try {
      const res = await fetch("/api/admin/locations");
      const data = res.ok ? await res.json() : [];
      setLocationsList(Array.isArray(data) ? data : []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadLocations(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setShowForm(false);
        setForm({ name: "", url: "" });
        loadLocations();
      } else {
        setError(data.detail || data.error || "Error creating location");
      }
    } catch (err) {
      setError(`Connection error: ${err}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this location?")) return;
    await fetch(`/api/admin/locations?id=${id}`, { method: "DELETE" });
    loadLocations();
  }

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-deep">Locations</h1>
        <BrandButton onClick={() => { setShowForm(true); setError(""); }} size="md">
          <Plus className="w-4 h-4" /> New Location
        </BrandButton>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-brand-sage/30 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold text-brand-deep">New Location</h2>
            <button onClick={() => setShowForm(false)}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name *" required value={form.name} placeholder="e.g. Dos Mares Beach, Tarifa"
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input label="URL (Google Maps, website...)" value={form.url} placeholder="https://maps.google.com/..."
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} />

            {error && <div className="sm:col-span-2 text-red-600 text-sm">{error}</div>}

            <div className="sm:col-span-2">
              <BrandButton type="submit" size="lg" disabled={saving}>
                {saving ? "Saving..." : "Add Location"}
              </BrandButton>
            </div>
          </form>
        </div>
      )}

      {locationsList.length === 0 ? (
        <EmptyState text="No locations yet. Add your first venue or beach." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {locationsList.map((loc) => (
            <div key={loc.id} className="bg-white rounded-xl border border-brand-sage/30 p-5 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-brand-teal/10 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-brand-teal" />
                </div>
                <div>
                  <p className="font-medium text-brand-deep">{loc.name}</p>
                  {loc.url && (
                    <a href={loc.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-brand-teal hover:underline flex items-center gap-1 mt-1">
                      <ExternalLink className="w-3 h-3" /> View map
                    </a>
                  )}
                </div>
              </div>
              <button onClick={() => handleDelete(loc.id)} className="text-red-400 hover:text-red-600 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
