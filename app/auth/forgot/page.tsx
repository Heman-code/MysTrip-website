"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1.5px solid rgba(255,255,255,0.08)",
  };
  const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      e.currentTarget.style.borderColor = "#FF6016";
      e.currentTarget.style.background = "rgba(255,96,22,0.06)";
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: "#0B1210" }}>
      <div className="max-w-md w-full">
        {done ? (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(255,96,22,0.15)" }}>
              <Mail size={22} style={{ color: "#FF6016" }} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Check your inbox.
            </h1>
            <p className="text-white/50 text-sm leading-relaxed mb-8">
              If an account exists for <span className="text-white/70">{email}</span>, we&apos;ve sent a link to reset your password. It expires in 1 hour.
            </p>
            <Link href="/auth/login" className="text-sm font-semibold text-white/60 hover:text-white transition-colors">
              ← Back to login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Forgot password?
            </h1>
            <p className="text-white/40 text-sm mb-8" style={{ fontFamily: "Mozilla Text, system-ui, sans-serif" }}>
              Enter your email and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Email</label>
                <input
                  type="email"
                  required
                  placeholder="you@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all duration-200 placeholder:text-white/20"
                  style={inputStyle}
                  {...focusHandlers}
                />
              </div>

              {error && (
                <div
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.2)", color: "#f87171" }}
                >
                  <span>⚠</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-white transition-all hover:opacity-90 hover:scale-[1.01] active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                style={{ background: "#FF6016" }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-sm text-white/30 text-center">
              Remembered it?{" "}
              <Link href="/auth/login" className="text-white/60 hover:text-white font-semibold transition-colors">
                Log in →
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
