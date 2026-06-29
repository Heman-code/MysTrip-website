"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password. Try again.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase = {
    background: "rgba(255,255,255,0.05)",
    border: "1.5px solid rgba(255,255,255,0.08)",
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#0B1210" }}>

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        <Image
          src="/trips/hero-kedarkantha-blizzard-2.jpg"
          alt="The Mountains Await"
          fill
          className="object-cover"
          sizes="50vw"
          priority
          style={{ zIndex: 0 }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent" style={{ zIndex: 1 }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" style={{ zIndex: 1 }} />

        {/* Logo */}
        <div className="relative flex items-center gap-3" style={{ zIndex: 2 }}>
          <div className="relative w-9 h-9">
            <Image src="/logos/mascot-orange.png" alt="MysTrip" fill className="object-contain" sizes="36px" />
          </div>
          <span className="text-white font-bold text-xl" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Mys<span style={{ color: "#FF6016" }}>Trip</span>
          </span>
        </div>

        {/* Stat pills */}
        <div className="relative" style={{ zIndex: 2 }}>
          <p className="text-4xl font-bold text-white leading-snug mb-6" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Your tribe<br />is out there.
          </p>
          <div className="flex flex-wrap gap-3">
            {["200+ Tribe Members", "8 States Explored", "2 National Awards"].map((s) => (
              <span
                key={s}
                className="px-4 py-2 rounded-full text-sm font-semibold text-white"
                style={{ background: "rgba(255,96,22,0.15)", border: "1px solid rgba(255,96,22,0.25)" }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-16">

        {/* Mobile logo */}
        <div className="flex items-center gap-2.5 mb-10 lg:hidden">
          <div className="relative w-8 h-8">
            <Image src="/logos/mascot-orange.png" alt="MysTrip" fill className="object-contain" sizes="32px" />
          </div>
          <span className="text-white font-bold text-xl" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Mys<span style={{ color: "#FF6016" }}>Trip</span>
          </span>
        </div>

        <div className="max-w-md w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Welcome back.
            </h1>
            <p className="text-white/40 text-sm" style={{ fontFamily: "Mozilla Text, system-ui, sans-serif" }}>
              Your next adventure is one login away.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="you@college.edu"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all duration-200 placeholder:text-white/20"
                style={inputBase}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#FF6016"; e.currentTarget.style.background = "rgba(255,96,22,0.06)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest">
                  Password
                </label>
                <Link href="/auth/forgot" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  placeholder="Your secret tribal code"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3.5 pr-12 rounded-xl text-white text-sm outline-none transition-all duration-200 placeholder:text-white/20"
                  style={inputBase}
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
              className="w-full py-4 rounded-xl font-bold text-white transition-all hover:opacity-90 hover:scale-[1.01] active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
              style={{ background: "#FF6016" }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging you in...
                </>
              ) : (
                <>
                  Login to the Tribe <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <span className="text-xs text-white/20">or</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>

          {/* Signup prompt */}
          <div
            className="flex items-center justify-between p-5 rounded-2xl"
            style={{ background: "rgba(255,96,22,0.06)", border: "1.5px solid rgba(255,96,22,0.12)" }}
          >
            <div>
              <p className="text-sm font-bold text-white">New to MysTrip?</p>
              <p className="text-xs text-white/40 mt-0.5">Join 200+ tribe members across India.</p>
            </div>
            <Link
              href="/auth/signup"
              className="text-sm font-bold px-5 py-2.5 rounded-full text-white flex-shrink-0 transition-all hover:scale-105 active:scale-95"
              style={{ background: "#FF6016" }}
            >
              Join Free →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
