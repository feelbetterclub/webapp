"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type ContactMethod = "email" | "phone";

interface FormState {
  name: string;
  email: string;
  phone: string;
  preferredContact: ContactMethod;
  message: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  preferredContact: "email",
  message: "",
};

export default function ContactPage() {
  const { t } = useI18n();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const c = t.contact;

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong");
      }

      setSent(true);
      setForm(INITIAL_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20" style={{ background: "var(--fb-bone)" }}>
        {/* Back nav */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: "var(--fb-mute)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            {(t as any).common?.back || "Back"}
          </Link>
        </div>

        {/* Hero text */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--fb-green)" }}
          >
            {c.label}
          </p>
          <h1
            className="text-4xl sm:text-5xl font-bold leading-tight mb-4"
            style={{ color: "var(--fb-ink)" }}
          >
            {c.title}
          </h1>
          <p className="text-lg" style={{ color: "var(--fb-mute)" }}>
            {c.subtitle}
          </p>
        </section>

        {/* Form card */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div
            className="rounded-[28px] p-8 sm:p-10"
            style={{
              background: "var(--fb-paper)",
              boxShadow: "var(--fb-shadow)",
            }}
          >
            {sent ? (
              <div className="text-center py-10">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: "var(--fb-green-mist)" }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--fb-green)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ color: "var(--fb-ink)" }}
                >
                  {c.form.sent}
                </h2>
                <p style={{ color: "var(--fb-mute)" }}>{c.form.sentText}</p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-8 text-sm font-medium underline underline-offset-4"
                  style={{ color: "var(--fb-green)" }}
                >
                  {(t as any).contact?.form?.sendAnother || "Send another message"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {/* Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--fb-ink)" }}
                    >
                      {c.form.name}
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full rounded-[14px] px-4 py-3 text-sm outline-none transition-colors"
                      style={{
                        background: "var(--fb-cream)",
                        border: "1px solid var(--fb-sand)",
                        color: "var(--fb-ink)",
                      }}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--fb-ink)" }}
                    >
                      {c.form.email}
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full rounded-[14px] px-4 py-3 text-sm outline-none transition-colors"
                      style={{
                        background: "var(--fb-cream)",
                        border: "1px solid var(--fb-sand)",
                        color: "var(--fb-ink)",
                      }}
                      placeholder="you@email.com"
                    />
                  </div>
                </div>

                {/* Phone + Preferred contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--fb-ink)" }}
                    >
                      {(t as any).contact?.form?.phone || "Phone"}
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full rounded-[14px] px-4 py-3 text-sm outline-none transition-colors"
                      style={{
                        background: "var(--fb-cream)",
                        border: "1px solid var(--fb-sand)",
                        color: "var(--fb-ink)",
                      }}
                      placeholder="+34 612 345 678"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="preferredContact"
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--fb-ink)" }}
                    >
                      {(t as any).contact?.form?.preferredContact || "Preferred contact"}
                    </label>
                    <select
                      id="preferredContact"
                      name="preferredContact"
                      value={form.preferredContact}
                      onChange={handleChange}
                      className="w-full rounded-[14px] px-4 py-3 text-sm outline-none transition-colors appearance-none"
                      style={{
                        background: "var(--fb-cream)",
                        border: "1px solid var(--fb-sand)",
                        color: "var(--fb-ink)",
                      }}
                    >
                      <option value="email">{c.form.email}</option>
                      <option value="phone">{(t as any).contact?.form?.phone || "Phone"}</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--fb-ink)" }}
                  >
                    {c.form.message}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    className="w-full rounded-[14px] px-4 py-3 text-sm outline-none transition-colors resize-none"
                    style={{
                      background: "var(--fb-cream)",
                      border: "1px solid var(--fb-sand)",
                      color: "var(--fb-ink)",
                    }}
                    placeholder={c.form.messagePlaceholder}
                  />
                </div>

                {error && (
                  <p className="text-sm" style={{ color: "var(--fb-terracotta)" }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-[999px] text-sm font-semibold transition-opacity disabled:opacity-60"
                  style={{
                    background: "var(--fb-green)",
                    color: "var(--fb-paper)",
                  }}
                >
                  {submitting ? ((t as any).common?.loading || "Sending...") : c.form.submit}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
