"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params.token;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
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
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
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

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0B1210" }}>
        <div className="text-center max-w-md">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(16,185,129,0.15)" }}>
            <CheckCircle2 size={24} style={{ color: "#10b981" }} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Password updated.
          </h1>
          <p className="text-white/50 mb-8 text-sm">You can log in with your new password now.</p>
          <button
            onClick={() => router.push("/auth/login")}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white transition-all hover:scale-105"
            style={{ background: "#FF6016" }}
          >
            Go to Login <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: "#0B1210" }}>
      <div className="max-w-md w-full">

        <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>
          Set a new password
        </h1>
        <p className="text-white/40 text-sm mb-8">Make it a good one — at least 8 characters.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                required
                minLength={8}
                placeholder="Make it a good one"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 pr-12 rounded-xl text-white text-sm outline-none transition-all duration-200 placeholder:text-white/20"
                style={inputStyle}
                {...focusHandlers}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Confirm Password</label>
            <input
              type={showPass ? "text" : "password"}
              required
              minLength={8}
              placeholder="Type it again"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                Updating...
              </>
            ) : (
              <>
                Reset Password <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
