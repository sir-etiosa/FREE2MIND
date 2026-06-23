"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Login failed.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      {/* Ambient wash */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "radial-gradient(900px 500px at 12% -8%, rgba(47,107,246,0.08), transparent 60%), radial-gradient(900px 600px at 100% 0%, rgba(124,77,232,0.07), transparent 55%)",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-nebula font-display text-xl font-bold text-white shadow-lift">
            M2
          </span>
          <div className="text-center">
            <p className="font-display text-xl font-semibold text-ink">Mind2Matter</p>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Hale &amp; Vance Law</p>
          </div>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h1 className="mb-1 font-display text-lg font-semibold text-ink">Sign in</h1>
          <p className="mb-6 text-sm text-muted">Enter your firm credentials to continue.</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="field-label">Email address</label>
              <input
                className="field"
                type="email"
                autoComplete="email"
                placeholder="you@halevance.law"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="field-label">Password</label>
              <input
                className="field"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                </svg>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary w-full py-2.5"
              disabled={busy}
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center font-mono text-[11px] text-muted">
          Mind2Matter · Practice Management · MVP
        </p>
      </div>
    </div>
  );
}
