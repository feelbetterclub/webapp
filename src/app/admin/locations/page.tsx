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
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface PendingImage {
  file: File;
  preview: string;
}

export default function LocationsPage() {
  const [locationsList, setLocationsList] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", url: "" });
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [uploadingFor, setUploadingFor] = useState<number | null>(null);
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

  function handleFilesSelected(files: FileList | null, target: "form" | number) {
    if (!files) return;
    const valid: PendingImage[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_FILE_SIZE) {
        setError(`"${file.name}" exceeds 2MB limit`);
        continue;
      }
      valid.push({ file, preview: URL.createObjectURL(file) });
    }

    if (target === "form") {
      setPendingImages((prev) => [...prev, ...valid]);
    } else {
      // Upload directly to existing location
      uploadImagesToLocation(target, valid);
    }
  }

  async function uploadImagesToLocation(locationId: number, imgs: PendingImage[]) {
    setUploadingFor(locationId);
    setError("");
    try {
      const images = await Promise.all(
        imgs.map(async (img) => ({
          base64: await fileToBase64(img.file),
          fileName: img.file.name,
        }))
      );
      const res = await fetch(`/api/admin/locations/${locationId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error uploading images");
      }
      loadLocations();
    } catch (err) {
      setError(`Upload error: ${err}`);
    } finally {
      setUploadingFor(null);
      // Clean up previews
      imgs.forEach((img) => URL.revokeObjectURL(img.preview));
    }
  }

  async function handleDeleteImage(locationId: number, imageId: number) {
    if (!confirm("Delete this photo?")) return;
    await fetch(`/api/admin/locations/${locationId}/images?imageId=${imageId}`, {
      method: "DELETE",
    });
    loadLocations();
  }

  function removePendingImage(index: number) {
    setPendingImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  function resetForm() {
    setShowForm(false);
    setForm({ name: "", url: "" });
    pendingImages.forEach((img) => URL.revokeObjectURL(img.preview));
    setPendingImages([]);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const images = await Promise.all(
        pendingImages.map(async (img) => ({
          base64: await fileToBase64(img.file),
          fileName: img.file.name,
        }))
      );

      const res = await fetch("/api/admin/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, url: form.url || null, images }),
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
    if (!confirm("Delete this location and all its photos?")) return;
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
              <label className="text-sm font-medium text-brand-deep mb-1.5 block">Photos</label>
              <div className="flex flex-wrap items-start gap-3">
                {pendingImages.map((img, i) => (
                  <div key={i} className="relative w-24 h-18 rounded-lg overflow-hidden border border-brand-sage/30">
                    <img src={img.preview} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePendingImage(i)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-18 rounded-lg border-2 border-dashed border-brand-sage/40 flex flex-col items-center justify-center gap-1 text-brand-sage hover:border-brand-teal hover:text-brand-teal transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-[10px]">Add photos</span>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={(e) => { handleFilesSelected(e.target.files, "form"); e.target.value = ""; }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                JPG, PNG or WebP. Max 2MB each. First photo used as hero banner.
              </p>
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
              {/* Image gallery */}
              {loc.images && loc.images.length > 0 ? (
                <div className="relative">
                  <div className="flex gap-0.5 overflow-x-auto h-32 scrollbar-hide">
                    {loc.images.map((img) => (
                      <div key={img.id} className="relative shrink-0 h-full" style={{ width: loc.images!.length === 1 ? "100%" : "50%" }}>
                        <img src={img.url} alt={loc.name} className="w-full h-full object-cover" />
                        <button onClick={() => handleDeleteImage(loc.id, img.id)}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {loc.images.length > 1 && (
                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {loc.images.length} photos
                    </span>
                  )}
                </div>
              ) : loc.image ? (
                <div className="h-32 bg-brand-sage/10">
                  <img src={loc.image} alt={loc.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-32 bg-brand-sage/10 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-brand-sage/40" />
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between">
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

                {/* Add photos button */}
                <div className="mt-3 pt-3 border-t border-brand-sage/20">
                  <label
                    className={`text-xs text-brand-teal hover:text-brand-deep flex items-center gap-1 cursor-pointer ${uploadingFor === loc.id ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <Upload className="w-3 h-3" />
                    {uploadingFor === loc.id ? "Uploading..." : "Add photos"}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        handleFilesSelected(e.target.files, loc.id);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && !showForm && (
        <div className="mt-4 text-red-600 text-sm bg-red-50 rounded-lg p-3">{error}</div>
      )}
    </div>
  );
}
