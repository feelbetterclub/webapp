"use client";

import { useState, useEffect } from "react";
import { Trash2, Eye, EyeOff, Star, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { BrandButton } from "@/components/ui/brand-button";

interface Testimonial {
  id: number;
  author: string;
  text: string;
  classType: string | null;
  rating: number;
  visible: number;
  createdAt: string;
}

const CLASS_TYPES = ["Mobility Flow", "Strength Flow", "Pilates Flow", "Dance Burn"];

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(s)}
          className={readonly ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform"}
        >
          <Star
            className={`w-4 h-4 ${s <= value ? "fill-amber-400 text-amber-400" : "text-brand-sage/40"}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [classType, setClassType] = useState("");
  const [rating, setRating] = useState(5);

  async function loadData() {
    try {
      const res = await fetch("/api/admin/testimonials");
      if (res.ok) setTestimonials(await res.json());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setAuthor("");
    setText("");
    setClassType("");
    setRating(5);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!author.trim() || !text.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: author.trim(),
          text: text.trim(),
          classType: classType || undefined,
          rating,
        }),
      });
      resetForm();
      setFormOpen(false);
      loadData();
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleVisibility(t: Testimonial) {
    await fetch("/api/admin/testimonials", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: t.id, visible: !t.visible }),
    });
    loadData();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this testimonial? This cannot be undone.")) return;
    await fetch(`/api/admin/testimonials?id=${id}`, { method: "DELETE" });
    loadData();
  }

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-deep">Testimonials</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {testimonials.length} testimonial{testimonials.length !== 1 ? "s" : ""}
          </p>
        </div>
        <BrandButton onClick={() => setFormOpen(!formOpen)} size="md">
          {formOpen ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {formOpen ? "Close" : "Add New"}
        </BrandButton>
      </div>

      {/* Add new form */}
      {formOpen && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl border border-brand-sage/30 p-6 mb-6 space-y-4"
        >
          <h2 className="font-heading text-lg font-semibold text-brand-deep">New Testimonial</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="author"
              label="Author *"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Maria S."
              required
            />
            <Select
              id="classType"
              label="Class Type"
              value={classType}
              onChange={(e) => setClassType(e.target.value)}
            >
              <option value="">No specific class</option>
              {CLASS_TYPES.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </Select>
          </div>

          <Textarea
            id="text"
            label="Testimonial Text *"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What they said..."
            rows={3}
            required
          />

          <div>
            <label className="block text-sm font-medium text-brand-deep mb-1.5">Rating</label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div className="flex gap-3 pt-2">
            <BrandButton type="submit" disabled={saving || !author.trim() || !text.trim()}>
              {saving ? "Saving..." : "Add Testimonial"}
            </BrandButton>
            <BrandButton
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setFormOpen(false);
              }}
            >
              Cancel
            </BrandButton>
          </div>
        </form>
      )}

      {/* List */}
      {testimonials.length === 0 ? (
        <EmptyState text="No testimonials yet. Add the first one!" />
      ) : (
        <div className="grid gap-4">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className={`bg-white rounded-xl border border-brand-sage/30 p-5 transition-opacity ${
                !t.visible ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="font-semibold text-brand-deep">{t.author}</span>
                    {t.classType && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-brand-teal/10 text-brand-teal">
                        {t.classType}
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        t.visible
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {t.visible ? "Visible" : "Hidden"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{t.text}</p>
                  <div className="flex items-center gap-3">
                    <StarRating value={t.rating} readonly />
                    <span className="text-xs text-muted-foreground">
                      {new Date(t.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleVisibility(t)}
                    className="text-brand-teal hover:text-brand-dark p-1.5 rounded-lg hover:bg-brand-sage/10 transition-colors"
                    title={t.visible ? "Hide from site" : "Show on site"}
                  >
                    {t.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
