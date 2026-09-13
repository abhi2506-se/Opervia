"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    country: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!acceptedTerms) {
      setError("You must accept the Terms of Service and Privacy Policy to continue.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: form.fullName,
        companyName: form.companyName || undefined,
        email: form.email,
        phone: form.phone || undefined,
        country: form.country || undefined,
        password: form.password,
        acceptedTerms: true,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong. Please try again.");
      return;
    }
    setSuccess(data.message || "Account created. Check your email to verify your address.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-10" style={{ background: "var(--slate-bg)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Opervia" className="w-14 h-14 mx-auto mb-3 object-contain" />
          <h1 className="text-lg font-semibold" style={{ color: "var(--navy-deep)" }}>
            Create your Client Portal account
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--ink-muted)" }}>
            Track projects, proposals, payments and support in one place.
          </p>
        </div>

        {success ? (
          <div className="panel p-6 text-center space-y-3">
            <p className="text-sm" style={{ color: "var(--success)" }}>{success}</p>
            <Link href="/login" className="btn-primary inline-block">Go to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="panel p-6 space-y-3">
            {error && (
              <p className="text-xs p-2" style={{ background: "#fdecea", color: "var(--danger)" }}>{error}</p>
            )}

            <div>
              <label className="field-label">Full name *</label>
              <input required className="field-input" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
            </div>
            <div>
              <label className="field-label">Email address *</label>
              <input required type="email" className="field-input" value={form.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label">Company name</label>
                <input className="field-input" value={form.companyName} onChange={(e) => update("companyName", e.target.value)} />
              </div>
              <div>
                <label className="field-label">Phone</label>
                <input className="field-input" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="field-label">Country</label>
              <input className="field-input" value={form.country} onChange={(e) => update("country", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label">Password *</label>
                <input required type="password" minLength={10} className="field-input" value={form.password} onChange={(e) => update("password", e.target.value)} autoComplete="new-password" />
              </div>
              <div>
                <label className="field-label">Confirm password *</label>
                <input required type="password" minLength={10} className="field-input" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} autoComplete="new-password" />
              </div>
            </div>
            <p className="text-[11px]" style={{ color: "var(--ink-muted)" }}>
              At least 10 characters, including a letter and a number.
            </p>

            <label className="flex items-start gap-2 text-xs pt-1" style={{ color: "var(--ink-muted)" }}>
              <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-0.5" />
              <span>
                I agree to the <a href="/terms" target="_blank" className="underline">Terms of Service</a> and{" "}
                <a href="/privacy" target="_blank" className="underline">Privacy Policy</a>.
              </span>
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        )}

        <p className="text-center text-xs mt-4" style={{ color: "var(--ink-muted)" }}>
          Already have an account? <Link href="/login" className="underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
