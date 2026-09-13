"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordInner() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get("email") || "";
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !token) {
      setError("This reset link is invalid.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token, newPassword: password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--slate-bg)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Opervia" className="w-14 h-14 mx-auto mb-3 object-contain" />
          <h1 className="text-lg font-semibold" style={{ color: "var(--navy-deep)" }}>Set a new password</h1>
        </div>

        {done ? (
          <div className="panel p-6 text-center">
            <p className="text-sm" style={{ color: "var(--success)" }}>Password updated. Redirecting to login…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="panel p-6 space-y-4">
            {error && <p className="text-xs p-2" style={{ background: "#fdecea", color: "var(--danger)" }}>{error}</p>}
            <div>
              <label className="field-label">New password</label>
              <input required type="password" minLength={10} className="field-input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            </div>
            <div>
              <label className="field-label">Confirm new password</label>
              <input required type="password" minLength={10} className="field-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
        <p className="text-center text-xs mt-4" style={{ color: "var(--ink-muted)" }}>
          <Link href="/login" className="underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}
