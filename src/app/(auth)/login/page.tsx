"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      if (res.error === "TOO_MANY_ATTEMPTS") {
        setError("Too many login attempts. Please wait a few minutes and try again.");
      } else if (res.error === "ACCOUNT_DISABLED") {
        setError("This account has been disabled. Contact your administrator.");
      } else {
        setError("Invalid email or password.");
      }
      return;
    }

    router.push(params.get("callbackUrl") || "/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--slate-bg)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="Opervia"
            className="w-14 h-14 mx-auto mb-3 object-contain"
          />
          <h1 className="text-lg font-semibold" style={{ color: "var(--navy-deep)" }}>
            Opervia
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--ink-muted)" }}>
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="panel p-6 space-y-4">
          {params.get("error") === "disabled" && (
            <p className="text-xs p-2" style={{ background: "#fdecea", color: "var(--danger)" }}>
              This account has been disabled. Contact your administrator.
            </p>
          )}
          {error && (
            <p className="text-xs p-2" style={{ background: "#fdecea", color: "var(--danger)" }}>
              {error}
            </p>
          )}

          <div>
            <label className="field-label" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              required
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <div className="flex items-center justify-between text-xs" style={{ color: "var(--ink-muted)" }}>
            <a href="/forgot-password" className="underline">Forgot password?</a>
            <a href="/register" className="underline">Create a client account</a>
          </div>

          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px" style={{ background: "var(--line)" }} />
            <span className="text-xs" style={{ color: "var(--ink-muted)" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "var(--line)" }} />
          </div>

          <button
            type="button"
            className="btn-secondary w-full"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            Continue with Google
          </button>
        </form>

        <p className="text-center text-xs mt-4" style={{ color: "var(--ink-muted)" }}>
          New client? <a href="/register" className="underline">Create your Client Portal account</a>.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
