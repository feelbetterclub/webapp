"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface FormState {
  name: string;
  email: string;
  phonePrefix: string;
  phone: string;
  interests: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  phonePrefix: "+34",
  phone: "",
  interests: "",
};

const BENEFITS = [
  "Free outdoor training session to try us out",
  "Weekly updates on classes and events",
  "Priority access to special workshops and rituals",
  "Be part of a community that moves, breathes and grows together",
];

export default function JoinPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "alreadyMember" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/community/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phonePrefix: form.phonePrefix,
          phone: form.phone,
          source: "join-page",
          interests: form.interests || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      if (data.alreadyMember) {
        setStatus("alreadyMember");
      } else {
        setStatus("success");
        setForm(INITIAL_FORM);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "var(--fb-cream)",
    border: "1px solid var(--fb-sand)",
    color: "var(--fb-ink)",
  };

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
            Back
          </Link>
        </div>

        {/* Benefits section */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--fb-green)" }}
          >
            Community
          </p>
          <h1
            className="font-medium leading-tight mb-2"
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "clamp(36px, 5vw, 56px)",
              letterSpacing: "-0.02em",
              color: "var(--fb-ink)",
            }}
          >
            Join the Feel Better Club
          </h1>
          <p
            className="text-xl mb-6"
            style={{ fontFamily: "var(--f-script)", color: "var(--fb-green)" }}
          >
            Your outdoor wellness community in Tarifa
          </p>
          <p className="text-base mb-6" style={{ color: "var(--fb-mute)", maxWidth: 560 }}>
            We train outside, breathe together and support each other. Joining is free —
            come see what the club feels like before committing to anything.
          </p>
          <ul className="space-y-3">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <span
                  className="mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "var(--fb-green-mist)" }}
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--fb-green)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="text-sm" style={{ color: "var(--fb-ink)" }}>
                  {benefit}
                </span>
              </li>
            ))}
          </ul>
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
            {status === "success" ? (
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
                  Welcome to the club!
                </h2>
                <p style={{ color: "var(--fb-mute)" }}>
                  Check your inbox for a welcome message with the details of your free outdoor class.
                </p>
              </div>
            ) : status === "alreadyMember" ? (
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
                  You're already part of the club!
                </h2>
                <p style={{ color: "var(--fb-mute)" }}>Check your inbox.</p>
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
                      Name <span style={{ color: "var(--fb-terracotta)" }}>*</span>
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
                      style={inputStyle}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--fb-ink)" }}
                    >
                      Email <span style={{ color: "var(--fb-terracotta)" }}>*</span>
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
                      style={inputStyle}
                      placeholder="you@email.com"
                    />
                  </div>
                </div>

                {/* Phone with prefix */}
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--fb-ink)" }}
                  >
                    Phone <span style={{ color: "var(--fb-terracotta)" }}>*</span>
                  </label>
                  <div className="flex gap-3">
                    <input
                      id="phonePrefix"
                      name="phonePrefix"
                      type="text"
                      required
                      autoComplete="tel-country-code"
                      value={form.phonePrefix}
                      onChange={handleChange}
                      className="rounded-[14px] px-4 py-3 text-sm outline-none transition-colors"
                      style={{ ...inputStyle, width: 80, flexShrink: 0 }}
                      placeholder="+34"
                    />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      autoComplete="tel-national"
                      value={form.phone}
                      onChange={handleChange}
                      className="flex-1 rounded-[14px] px-4 py-3 text-sm outline-none transition-colors"
                      style={inputStyle}
                      placeholder="612 345 678"
                    />
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <label
                    htmlFor="interests"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--fb-ink)" }}
                  >
                    What interests you most about joining the club?{" "}
                    <span style={{ color: "var(--fb-mute)", fontWeight: 400 }}>(optional)</span>
                  </label>
                  <textarea
                    id="interests"
                    name="interests"
                    rows={4}
                    maxLength={500}
                    value={form.interests}
                    onChange={handleChange}
                    className="w-full rounded-[14px] px-4 py-3 text-sm outline-none transition-colors resize-none"
                    style={inputStyle}
                    placeholder="Tell us what draws you to the club..."
                  />
                  <p
                    className="text-xs mt-1 text-right"
                    style={{ color: "var(--fb-mute)" }}
                  >
                    {form.interests.length}/500
                  </p>
                </div>

                {status === "error" && errorMessage && (
                  <p className="text-sm" style={{ color: "var(--fb-terracotta)" }}>
                    {errorMessage}
                  </p>
                )}

                <p className="text-xs" style={{ color: "var(--fb-mute)" }}>
                  Once you join, we'll send you an email with the details for your free outdoor class.
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-[999px] text-sm font-semibold transition-opacity disabled:opacity-60"
                  style={{
                    background: "var(--fb-green)",
                    color: "var(--fb-paper)",
                  }}
                >
                  {submitting ? "Joining..." : "Join the Club"}
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
