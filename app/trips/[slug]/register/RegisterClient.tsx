"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Copy, Upload, ArrowRight, ShieldCheck, Tag, Sparkles, X } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface TripSummary {
  slug: string;
  title: string;
  destination: string;
  basePrice: number;
  coverImage: string;
  startDate: string;
  tagColor: string;
}

interface CouponInfo {
  code: string;
  discountPercent: number;
  maxDiscountAmount: number;
}

interface Quote {
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  qrDataUrl: string;
  coupon: { code: string; discountPercent: number } | null;
}

interface Props {
  trip: TripSummary;
  upiId: string;
  userName: string;
  userEmail: string;
  myCoupon: CouponInfo | null;
}

const MAX_SCREENSHOT_BYTES = 4 * 1024 * 1024;
const steps = ["You", "Pay", "Confirm"];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function RegisterClient({ trip, upiId, userName, userEmail, myCoupon }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState(userName);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [confirmedPaid, setConfirmedPaid] = useState(false);
  const [guardianPhone, setGuardianPhone] = useState("");
  const [collegeRegNumber, setCollegeRegNumber] = useState("");
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Coupon (applied on step 0)
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponInfo | null>(null);
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Quote + celebration (fetched entering step 1)
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const applyCoupon = async (code: string) => {
    if (!code.trim()) return;
    setCouponApplying(true);
    setCouponError("");
    try {
      const res = await fetch("/api/registrations/apply-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error ?? "Couldn't apply that code.");
        return;
      }
      setAppliedCoupon(data.coupon);
      setCouponInput("");
    } catch {
      setCouponError("Network error. Please try again.");
    } finally {
      setCouponApplying(false);
    }
  };

  const handleFile = async (file: File | undefined) => {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Payment screenshot must be an image file.");
      return;
    }
    if (file.size > MAX_SCREENSHOT_BYTES) {
      setError("Screenshot is too large. Please upload an image under 4MB.");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setScreenshotData(dataUrl);
    setScreenshotPreview(dataUrl);
  };

  const copyUpiId = async () => {
    await navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const goToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim() || !whatsappNumber.trim()) {
      setError("Please fill in your name and WhatsApp number.");
      return;
    }
    setStep(1);
    setQuoteLoading(true);
    try {
      const res = await fetch("/api/registrations/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: trip.slug, couponCode: appliedCoupon?.code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't load the payment QR. Please go back and try again.");
        return;
      }
      setQuote(data);
      if (data.discountAmount > 0) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    } catch {
      setError("Network error loading payment details.");
    } finally {
      setQuoteLoading(false);
    }
  };

  const goToDetails = () => {
    setError("");
    if (!confirmedPaid) {
      setError("Please confirm you've completed the payment to continue.");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!guardianPhone.trim() || !collegeRegNumber.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!screenshotData) {
      setError("Please upload your payment screenshot before submitting.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: trip.slug,
          fullName,
          whatsappNumber,
          guardianPhone,
          collegeRegNumber,
          couponCode: appliedCoupon?.code,
          paymentScreenshot: screenshotData,
        }),
      });
      const data = await res.json();
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

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-24" style={{ background: "#0B1210" }}>
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(16,185,129,0.15)" }}>
            <Check size={26} style={{ color: "#10b981" }} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            You&apos;re on the list.
          </h1>
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            We&apos;ll check your payment against {trip.title} and lock in your seat within 24 hours. We&apos;re genuinely excited you&apos;re coming — track the status from your dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-white text-sm transition-all hover:opacity-90"
              style={{ background: "#FF6016" }}
            >
              Go to Dashboard <ArrowRight size={15} />
            </Link>
            <Link
              href={`/trips/${trip.slug}`}
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-full font-semibold text-sm text-white/60 hover:text-white transition-colors"
              style={{ border: "1.5px solid rgba(255,255,255,0.15)" }}
            >
              Back to trip
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: "#0B1210" }}>
      {/* Celebration overlay */}
      {showCelebration && quote && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center px-4"
          style={{ background: "rgba(11,18,16,0.92)" }}
        >
          <div className="text-center">
            <div className="text-5xl mb-4" style={{ animation: "celebrationPop 0.5s ease" }}>🎉</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              You saved {formatCurrency(quote.discountAmount)}!
            </h2>
            <p className="text-white/50 text-sm">That&apos;s chai for the whole trip, on us.</p>
          </div>
          <style>{`
            @keyframes celebrationPop {
              0% { transform: scale(0.5); opacity: 0; }
              60% { transform: scale(1.15); opacity: 1; }
              100% { transform: scale(1); }
            }
          `}</style>
        </div>
      )}

      <div className="max-w-xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16">
        {step === 0 ? (
          <Link href={`/trips/${trip.slug}`} className="text-sm text-white/40 hover:text-white/70 transition-colors mb-6 inline-block">
            ← Back to trip
          </Link>
        ) : (
          <button onClick={() => { setError(""); setStep((s) => s - 1); }} className="text-sm text-white/40 hover:text-white/70 transition-colors mb-6">
            ← Back
          </button>
        )}

        {/* Trip summary */}
        <div className="flex items-center gap-4 rounded-2xl p-4 mb-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
            <Image src={trip.coverImage} alt={trip.title} fill className="object-cover" sizes="64px" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide truncate" style={{ color: trip.tagColor }}>{trip.destination}</p>
            <h2 className="text-white font-bold truncate" style={{ fontFamily: "'Clash Display', sans-serif" }}>{trip.title}</h2>
            <p className="text-white/40 text-xs mt-0.5">{formatDate(trip.startDate)}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-white/40">Amount</p>
            {appliedCoupon ? (
              <>
                <p className="text-xs text-white/30 line-through">{formatCurrency(trip.basePrice)}</p>
                <p className="text-lg font-bold" style={{ color: "#10b981" }}>
                  {formatCurrency(Math.max(trip.basePrice - Math.min(Math.round((trip.basePrice * appliedCoupon.discountPercent) / 100), appliedCoupon.maxDiscountAmount), 0))}
                </p>
              </>
            ) : (
              <p className="text-lg font-bold text-white">{formatCurrency(trip.basePrice)}</p>
            )}
          </div>
        </div>

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

        {/* Step 0 — You */}
        {step === 0 && (
          <form onSubmit={goToPayment} className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>Who&apos;s joining?</h1>
              <p className="text-white/40 text-sm">Just your name and number to start — the rest comes after payment.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5">Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl text-white text-sm outline-none transition-all placeholder:text-white/20"
                style={inputStyle}
                {...focusHandlers}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5">College Email</label>
              <p className="text-sm text-white/50 px-3.5 py-3 rounded-xl truncate" style={{ background: "rgba(255,255,255,0.03)" }}>{userEmail || "—"}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5">WhatsApp Number</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl text-white text-sm outline-none transition-all placeholder:text-white/20"
                style={inputStyle}
                {...focusHandlers}
              />
            </div>

            {/* Coupon / referral */}
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5">Got a coupon or referral code?</label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(16,185,129,0.1)", border: "1.5px solid rgba(16,185,129,0.3)" }}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Check size={16} style={{ color: "#10b981" }} className="flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{appliedCoupon.code} applied</p>
                      <p className="text-xs text-white/40">{appliedCoupon.discountPercent}% off, up to {formatCurrency(appliedCoupon.maxDiscountAmount)}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setAppliedCoupon(null)} className="flex-shrink-0 p-1.5 rounded-full hover:bg-white/10 transition-colors">
                    <X size={14} className="text-white/50" />
                  </button>
                </div>
              ) : (
                <>
                  {myCoupon && (
                    <button
                      type="button"
                      onClick={() => applyCoupon(myCoupon.code)}
                      disabled={couponApplying}
                      className="w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 mb-2.5 text-left transition-all hover:opacity-90 disabled:opacity-60"
                      style={{ background: "rgba(255,96,22,0.1)", border: "1.5px solid rgba(255,96,22,0.3)" }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Sparkles size={16} style={{ color: "#FF6016" }} className="flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white">You&apos;ve got a coupon — {myCoupon.discountPercent}% off</p>
                          <p className="text-xs text-white/40 font-mono">{myCoupon.code}</p>
                        </div>
                      </div>
                      <span className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "#FF6016", color: "#fff" }}>
                        {couponApplying ? "…" : "Apply"}
                      </span>
                    </button>
                  )}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                      <input
                        type="text"
                        placeholder="Enter a code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl text-white text-sm outline-none transition-all placeholder:text-white/20"
                        style={inputStyle}
                        {...focusHandlers}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => applyCoupon(couponInput)}
                      disabled={couponApplying || !couponInput.trim()}
                      className="px-5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40 flex-shrink-0"
                      style={{ background: "rgba(255,255,255,0.08)" }}
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-xs mt-2" style={{ color: "#f87171" }}>{couponError}</p>}
                </>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-xl font-bold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: "#FF6016" }}
            >
              Continue to Payment <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Step 1 — Pay */}
        {step === 1 && (
          <div className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {quoteLoading || !quote ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <p className="text-white/40 text-sm">Working out your total...</p>
              </div>
            ) : (
              <>
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>Pay via UPI</h1>
                  <p className="text-white/40 text-sm">Scan and pay {formatCurrency(quote.finalAmount)} — then come back and confirm below.</p>
                </div>

                {quote.discountAmount > 0 && (
                  <div className="rounded-xl px-4 py-3 space-y-1.5" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Trip price</span>
                      <span className="text-white/40 line-through">{formatCurrency(quote.originalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Coupon ({quote.coupon?.code})</span>
                      <span style={{ color: "#10b981" }}>− {formatCurrency(quote.discountAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold pt-1.5 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                      <span className="text-white">You pay</span>
                      <span className="text-white">{formatCurrency(quote.finalAmount)}</span>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-xl p-3 w-fit mx-auto">
                  <Image src={quote.qrDataUrl} alt="UPI QR code" width={220} height={220} unoptimized />
                </div>
                <p className="text-center text-white/40 text-xs">Scan with any UPI app — amount is pre-filled to {formatCurrency(quote.finalAmount)}</p>

                <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span className="flex-1 text-sm text-white font-mono truncate">{upiId}</span>
                  <button
                    type="button"
                    onClick={copyUpiId}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 transition-all"
                    style={{ background: copied ? "rgba(16,185,129,0.15)" : "rgba(255,96,22,0.12)", color: copied ? "#10b981" : "#FF6016" }}
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                <label className="flex items-start gap-3 rounded-xl px-4 py-3.5 cursor-pointer transition-all" style={{ background: confirmedPaid ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.03)", border: confirmedPaid ? "1.5px solid rgba(16,185,129,0.3)" : "1.5px solid rgba(255,255,255,0.08)" }}>
                  <input
                    type="checkbox"
                    checked={confirmedPaid}
                    onChange={(e) => setConfirmedPaid(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-orange-500 flex-shrink-0"
                  />
                  <span className="text-sm text-white/70">I&apos;ve completed the payment of {formatCurrency(quote.finalAmount)} to the UPI ID above.</span>
                </label>

                {error && (
                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                    <span>⚠</span> {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={goToDetails}
                  className="w-full py-4 rounded-xl font-bold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ background: "#FF6016" }}
                >
                  I&apos;ve Paid — Continue <ArrowRight size={16} />
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 2 — Confirm */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>Almost there</h1>
              <p className="text-white/40 text-sm">A few last details, plus your payment screenshot. You&apos;re basically already on the trip.</p>
            </div>

            {quote && quote.discountAmount > 0 && (
              <div className="flex items-center gap-2.5 rounded-xl px-4 py-3" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}>
                <Sparkles size={15} style={{ color: "#10b981" }} className="flex-shrink-0" />
                <p className="text-sm text-white/70">
                  Coupon <span className="font-bold text-white">{quote.coupon?.code}</span> saved you {formatCurrency(quote.discountAmount)}.
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5">Guardian&apos;s Number</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl text-white text-sm outline-none transition-all placeholder:text-white/20"
                style={inputStyle}
                {...focusHandlers}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5">College Registration Number</label>
              <input
                type="text"
                required
                placeholder="e.g. R2XXXXXXXXX"
                value={collegeRegNumber}
                onChange={(e) => setCollegeRegNumber(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl text-white text-sm outline-none transition-all placeholder:text-white/20"
                style={inputStyle}
                {...focusHandlers}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5">Payment Screenshot</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              {screenshotPreview ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-full h-40 rounded-xl overflow-hidden border-2"
                  style={{ borderColor: "rgba(16,185,129,0.4)" }}
                >
                  <Image src={screenshotPreview} alt="Payment screenshot preview" fill className="object-cover" unoptimized />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Tap to change</span>
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors hover:border-white/20"
                  style={{ borderColor: "rgba(255,255,255,0.15)" }}
                >
                  <Upload size={18} className="text-white/40" />
                  <span className="text-xs text-white/40">Upload screenshot (image, max 4MB)</span>
                </button>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "#FF6016" }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Locking in your seat...
                </>
              ) : (
                <>Confirm My Seat <ArrowRight size={16} /></>
              )}
            </button>

            <p className="flex items-start gap-2 text-xs text-white/30 leading-relaxed pt-1">
              <ShieldCheck size={14} className="flex-shrink-0 mt-0.5" />
              Your seat is confirmed after we manually verify the payment — usually within 24 hours.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
