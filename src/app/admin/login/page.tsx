"use client";

import { useState, type FormEvent } from "react";
import { BrandButton } from "@/components/ui/brand-button";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        window.location.href = "/admin";
        return;
      } else {
        setError("Incorrect password");
      }
    } catch {
      setError("Connection error");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-brand-sage/30 w-full max-w-sm">
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-v4.svg" alt="Feel Better" className="h-12 mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold text-brand-deep">Coach Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">Restricted access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-brand-deep mb-1">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl border border-brand-sage/30 bg-brand-light/50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal"
              placeholder="Enter password" />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <BrandButton type="submit" size="full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </BrandButton>
        </form>
      </div>
    </div>
  );
}
