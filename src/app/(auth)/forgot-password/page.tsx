"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--slate-bg)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Opervia" className="w-14 h-14 mx-auto mb-3 object-contain" />
          <h1 className="text-lg font-semibold" style={{ color: "var(--navy-deep)" }}>Reset your password</h1>
        </div>

        {sent ? (
          <div className="panel p-6 text-center space-y-3">
            <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
              If an account exists for <strong>{email}</strong>, a reset link has been sent.
            </p>
            <Link href="/login" className="btn-secondary inline-block">Back to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="panel p-6 space-y-4">
            <div>
              <label className="field-label">Email address</label>
              <input required type="email" className="field-input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Sending…" : "Send reset link"}
            </button>
            <p className="text-center text-xs" style={{ color: "var(--ink-muted)" }}>
              <Link href="/login" className="underline">Back to login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
