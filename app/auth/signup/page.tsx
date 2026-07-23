"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Eye, EyeOff, CheckCircle2 } from "lucide-react";

const TRIBE_ROLES = [
  { id: "explorer", label: "The Explorer", emoji: "🗺️", desc: "First time here. Ready to find your people." },
  { id: "adventurer", label: "The Adventurer", emoji: "⛰️", desc: "Been on a few trips. Always hungry for more." },
  { id: "trailblazer", label: "The Trailblazer", emoji: "🔥", desc: "Born with a backpack. You plan before others dream." },
];

const steps = ["You", "Your Vibe", "Almost In"];

export default function SignupPage() {
  const [step, setStep] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    college: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (step < 2) { setStep(step + 1); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          college: form.college,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); setLoading(false); return; }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (result?.error) { setError("Account created but login failed. Try logging in."); setLoading(false); return; }

      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0B1210" }}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <Image src="/logos/mascot-orange.png" alt="MysTrip" fill className="object-contain" sizes="80px" />
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(255,96,22,0.15)" }}>
            <CheckCircle2 size={24} style={{ color: "#FF6016" }} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            You&apos;re in the Tribe.
          </h1>
          <p className="text-white/50 mb-8" style={{ fontFamily: "Mozilla Text, system-ui, sans-serif" }}>
            Welcome, {form.name.split(" ")[0]}. Your people are already waiting.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white transition-all hover:scale-105"
            style={{ background: "#FF6016" }}
          >
            Enter your Dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#0B1210" }}>

      {/* Left — photo panel (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col p-12 overflow-hidden">
        <Image
          src="/trips/gallery-saan-helping-hands.jpg"
          alt="The Tribe"
          fill
          className="object-cover"
          sizes="50vw"
          priority
          style={{ zIndex: 0 }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" style={{ zIndex: 1 }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" style={{ zIndex: 1 }} />

        {/* Quote */}
        <div className="relative mt-auto" style={{ zIndex: 2 }}>
          <blockquote className="text-3xl font-bold text-white leading-snug mb-4" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            &ldquo;Some people collect things. We collect 2am conversations with people we met 3 days ago.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden relative bg-orange-500/20">
              <div className="w-full h-full flex items-center justify-center text-sm font-bold text-orange-400">K</div>
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Kabir V.</p>
              <p className="text-white/40 text-xs">Kedarkantha Trek · Jan 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-16">

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all duration-300"
                style={{
                  background: i < step ? "#FF6016" : i === step ? "rgba(255,96,22,0.2)" : "rgba(255,255,255,0.06)",
                  color: i <= step ? "#FF6016" : "rgba(255,255,255,0.3)",
                  border: i === step ? "1.5px solid #FF6016" : "1.5px solid transparent",
                }}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:inline" style={{ color: i === step ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.25)" }}>
                {s}
              </span>
              {i < steps.length - 1 && (
                <div className="w-8 h-px mx-1" style={{ background: i < step ? "#FF6016" : "rgba(255,255,255,0.1)" }} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="max-w-md w-full">

          {/* Step 0 — Basic info */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  Who are you?
                </h1>
                <p className="text-white/40 text-sm" style={{ fontFamily: "Mozilla Text, system-ui, sans-serif" }}>
                  The tribe is waiting. Let&apos;s get you in.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Aarav Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all duration-200 placeholder:text-white/20"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1.5px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#FF6016"; e.currentTarget.style.background = "rgba(255,96,22,0.06)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Email</label>
                <input
                  type="email"
                  required
                  placeholder="you@college.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all duration-200 placeholder:text-white/20"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.08)" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#FF6016"; e.currentTarget.style.background = "rgba(255,96,22,0.06)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all duration-200 placeholder:text-white/20"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.08)" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#FF6016"; e.currentTarget.style.background = "rgba(255,96,22,0.06)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder="Make it a good one"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-3.5 pr-12 rounded-xl text-white text-sm outline-none transition-all duration-200 placeholder:text-white/20"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.08)" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#FF6016"; e.currentTarget.style.background = "rgba(255,96,22,0.06)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
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

              <button
                type="submit"
                className="w-full py-4 rounded-xl font-bold text-white transition-all hover:opacity-90 hover:scale-[1.01] active:scale-95 mt-2"
                style={{ background: "#FF6016" }}
              >
                Next →
              </button>
            </div>
          )}

          {/* Step 1 — Tribe vibe */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  What&apos;s your vibe?
                </h1>
                <p className="text-white/40 text-sm">
                  Pick the one that sounds most like your group chat energy.
                </p>
              </div>

              <div className="space-y-3">
                {TRIBE_ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.id })}
                    className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200 hover:scale-[1.01]"
                    style={{
                      background: form.role === r.id ? "rgba(255,96,22,0.12)" : "rgba(255,255,255,0.04)",
                      border: form.role === r.id ? "1.5px solid #FF6016" : "1.5px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <span className="text-2xl">{r.emoji}</span>
                    <div>
                      <p className="text-sm font-bold text-white">{r.label}</p>
                      <p className="text-xs text-white/40 mt-0.5">{r.desc}</p>
                    </div>
                    <div
                      className="ml-auto w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-all"
                      style={{
                        background: form.role === r.id ? "#FF6016" : "rgba(255,255,255,0.06)",
                        border: form.role === r.id ? "none" : "1.5px solid rgba(255,255,255,0.15)",
                      }}
                    >
                      {form.role === r.id && <span className="text-white text-xs">✓</span>}
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">College / University</label>
                <input
                  type="text"
                  placeholder="Manipal University Jaipur, or wherever you're from"
                  value={form.college}
                  onChange={(e) => setForm({ ...form, college: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all duration-200 placeholder:text-white/20"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.08)" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#FF6016"; e.currentTarget.style.background = "rgba(255,96,22,0.06)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(0)} className="flex-1 py-4 rounded-xl font-semibold text-white/60 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.08)" }}>
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={!form.role}
                  className="flex-1 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "#FF6016" }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Confirm */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  You + 11 strangers<br />
                  <span style={{ color: "#FF6016" }}>= one ridiculous adventure.</span>
                </h1>
                <p className="text-white/40 text-sm mt-2">
                  This is your sign. Confirm and join the tribe.
                </p>
              </div>

              {/* Summary card */}
              <div className="rounded-2xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)" }}>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Name</span>
                  <span className="text-white font-medium">{form.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Email</span>
                  <span className="text-white font-medium">{form.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Vibe</span>
                  <span className="text-white font-medium">
                    {TRIBE_ROLES.find((r) => r.id === form.role)?.label}
                  </span>
                </div>
                {form.college && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">College</span>
                    <span className="text-white font-medium">{form.college}</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-white/30" style={{ fontFamily: "Mozilla Text, system-ui, sans-serif" }}>
                By joining, you agree to our{" "}
                <Link href="/terms" className="text-white/50 hover:text-white underline underline-offset-2">Terms</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-white/50 hover:text-white underline underline-offset-2">Privacy Policy</Link>.
                We will never spam you. We&apos;re building a tribe, not a mailing list.
              </p>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 rounded-xl font-semibold text-white/60 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.08)" }}>
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                  style={{ background: "#FF6016" }}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Getting you in...
                    </>
                  ) : (
                    <>Join the Tribe <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
              {error && (
                <p className="text-sm text-red-400 text-center pt-1">{error}</p>
              )}
            </div>
          )}
        </form>

        <p className="mt-8 text-sm text-white/30 max-w-md" style={{ fontFamily: "Mozilla Text, system-ui, sans-serif" }}>
          Already part of the tribe?{" "}
          <Link href="/auth/login" className="text-white/60 hover:text-white font-semibold transition-colors">
            Log in →
          </Link>
        </p>
      </div>
    </div>
  );
}
