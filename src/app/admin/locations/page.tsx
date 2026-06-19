"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, X, MapPin, ExternalLink, ImageIcon, Upload } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { BrandButton } from "@/components/ui/brand-button";
import type { LocationItem } from "@/lib/types";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]); // strip data:...;base64,
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function LocationsPage() {
  const [locationsList, setLocationsList] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", url: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be under 2MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function resetForm() {
    setShowForm(false);
    setForm({ name: "", url: "" });
    clearImage();
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const body: Record<string, string | null> = { name: form.name, url: form.url || null };

      if (imageFile) {
        body.imageBase64 = await fileToBase64(imageFile);
        body.imageName = imageFile.name;
      }

      const res = await fetch("/api/admin/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        resetForm();
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
            <button onClick={resetForm}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name *" required value={form.name} placeholder="e.g. Bora - Tarifa"
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input label="URL (Google Maps, website...)" value={form.url} placeholder="https://maps.google.com/..."
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} />

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-brand-deep mb-1.5 block">Photo</label>
              <div className="flex items-start gap-4">
                {imagePreview ? (
                  <div className="relative w-32 h-24 rounded-lg overflow-hidden border border-brand-sage/30">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={clearImage}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-24 rounded-lg border-2 border-dashed border-brand-sage/40 flex flex-col items-center justify-center gap-1 text-brand-sage hover:border-brand-teal hover:text-brand-teal transition-colors">
                    <Upload className="w-5 h-5" />
                    <span className="text-xs">Upload</span>
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={handleImageChange} />
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG or WebP. Max 2MB.<br />
                  Used as hero banner for classes at this location.
                </p>
              </div>
            </div>

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
            <div key={loc.id} className="bg-white rounded-xl border border-brand-sage/30 overflow-hidden">
              {loc.image ? (
                <div className="h-32 bg-brand-sage/10">
                  <img src={loc.image} alt={loc.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-32 bg-brand-sage/10 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-brand-sage/40" />
                </div>
              )}
              <div className="p-4 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-brand-teal/10 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-brand-teal" />
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
