"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Clock, ArrowRight, Send } from "lucide-react";

interface PastTrip {
  id: string;
  title: string;
  destination: string;
  tripDate: string;
  category: string;
  amount: number;
}

interface ReviewableTrip {
  registrationId: string;
  tripTitle: string;
  tripDate: string;
}

interface Props {
  user: {
    name: string;
    email: string;
    college: string;
    joinedDate: string;
  };
  pastTrips: PastTrip[];
  reviewableTrips: ReviewableTrip[];
  reviewsLeftCount: number;
}

const tabs = ["Overview", "My Trips", "Leave a Review"];

export default function DashboardClient({ user, pastTrips, reviewableTrips, reviewsLeftCount }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [review, setReview] = useState({ registrationId: "", rating: 0, text: "" });
  const [reviewSent, setReviewSent] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError("");
    setReviewLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: review.registrationId,
          rating: review.rating,
          text: review.text,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setReviewSent(true);
    } catch {
      setReviewError("Network error. Please try again.");
    } finally {
      setReviewLoading(false);
    }
  };

  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: "#F9F7F4" }}>
      {/* Header */}
      <div style={{ background: "#0B1210" }} className="pt-20 pb-10 sm:pt-24 sm:pb-16 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 opacity-[0.04] pointer-events-none">
          <Image src="/logos/mascot-orange.png" alt="" fill sizes="256px" className="object-contain" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div
            className="rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
            style={{ background: "#FF6016", width: 72, height: 72 }}
          >
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                {user.name}
              </h1>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: "rgba(255,96,22,0.15)", color: "#FF6016", border: "1px solid rgba(255,96,22,0.25)" }}
              >
                The Explorer
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-white/40">
              {user.college && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} />
                  {user.college}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock size={13} />
                Tribe member since {user.joinedDate}
              </span>
            </div>
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="flex gap-1">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
                style={
                  i === activeTab
                    ? { background: "#FF6016", color: "#fff" }
                    : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)" }
                }
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Overview tab */}
        {activeTab === 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { num: String(pastTrips.length), label: "Trips Taken", icon: "🗺️" },
                { num: [...new Set(pastTrips.map(t => t.destination.split(",").pop()?.trim()))].length.toString(), label: "States Explored", icon: "📍" },
                { num: "0", label: "Photos Tagged", icon: "📸" },
                { num: String(reviewsLeftCount), label: "Reviews Left", icon: "⭐" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl p-5 text-center border border-gray-100">
                  <p className="text-2xl mb-1">{s.icon}</p>
                  <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>{s.num}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Welcome card — different message for returning vs new members */}
            <div className="rounded-2xl p-8 relative overflow-hidden" style={{ background: "#0B1210" }}>
              <div className="absolute right-0 top-0 w-48 h-48 opacity-[0.06]">
                <Image src="/logos/mascot-orange.png" alt="" fill sizes="192px" className="object-contain" />
              </div>
              <div className="relative">
                {pastTrips.length > 0 ? (
                  <>
                    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#FF6016" }}>
                      Welcome back, {user.name.split(" ")[0]} 🔥
                    </p>
                    <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                      You went somewhere far. The tribe missed you.
                    </h2>
                    <p className="text-white/40 text-sm mb-6" style={{ fontFamily: "Mozilla Text, system-ui, sans-serif" }}>
                      {pastTrips.length} {pastTrips.length === 1 ? "trip" : "trips"} in the books. Your history is right here — pick up where you left off, or find the next one worth showing up for.
                    </p>
                    <div className="flex gap-3 flex-wrap">
                      <button onClick={() => setActiveTab(1)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white text-sm transition-all hover:scale-105"
                        style={{ background: "#FF6016" }}>
                        See My Trips <ArrowRight size={15} />
                      </button>
                      <Link href="/trips"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:scale-105"
                        style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
                        Browse Upcoming
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#FF6016" }}>
                      Hey, {user.name.split(" ")[0]} 👋
                    </p>
                    <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                      Your first adventure starts here.
                    </h2>
                    <p className="text-white/40 text-sm mb-6" style={{ fontFamily: "Mozilla Text, system-ui, sans-serif" }}>
                      You haven&apos;t been on a trip with us yet — but your people are already out there. Browse upcoming trips and find the one that feels like you.
                    </p>
                    <Link href="/trips"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white text-sm transition-all hover:scale-105"
                      style={{ background: "#FF6016" }}>
                      Browse Trips <ArrowRight size={15} />
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-5" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                Your Profile
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Name", value: user.name },
                  { label: "Email", value: user.email },
                  { label: "College", value: user.college || "—" },
                ].map((f) => (
                  <div key={f.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-400">{f.label}</span>
                    <span className="text-sm font-medium text-gray-900">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* My Trips tab */}
        {activeTab === 1 && (
          <div className="space-y-4">
            {pastTrips.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-bold text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                    Your MysTrip Journey
                    <span className="text-gray-400 font-normal text-sm ml-2">({pastTrips.length} trips)</span>
                  </h2>
                </div>
                {pastTrips.map((trip) => (
                  <div key={trip.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                      style={{ background: "rgba(255,96,22,0.08)" }}>
                      {trip.category === "trek" ? "⛰️" : trip.category === "weekend_escape" ? "🏜️" : "🏰"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{trip.title}</p>
                      <p className="text-sm text-gray-400 mt-0.5">{trip.destination}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900">₹{trip.amount.toLocaleString("en-IN")}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(trip.tripDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Book next trip CTA */}
                <div className="rounded-2xl p-6 text-center mt-4" style={{ background: "#0B1210" }}>
                  <p className="text-white font-bold mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>Ready for the next one?</p>
                  <p className="text-white/40 text-sm mb-4">Online booking is almost here. For now, grab your spot on WhatsApp.</p>
                  <a href="https://wa.me/918822068322?text=Hey! I want to book a trip with MysTrip."
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white text-sm transition-all hover:scale-105"
                    style={{ background: "#25D366" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.107.547 4.089 1.506 5.808L.057 23.804a.5.5 0 0 0 .624.63l6.093-1.595A11.948 11.948 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.714a9.714 9.714 0 0 1-4.957-1.359l-.354-.21-3.665.96.976-3.578-.23-.371A9.714 9.714 0 0 1 2.286 12C2.286 6.656 6.656 2.286 12 2.286S21.714 6.656 21.714 12 17.344 21.714 12 21.714z"/></svg>
                    Book on WhatsApp
                  </a>
                </div>
              </>
            ) : (
              <div className="rounded-2xl p-8 text-center" style={{ background: "#0B1210" }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6"
                  style={{ background: "rgba(255,176,1,0.12)", color: "#FFB001", border: "1px solid rgba(255,176,1,0.2)" }}>
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  Bookings Opening Soon
                </div>
                <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  Online booking is almost here.
                </h2>
                <p className="text-white/40 text-sm mb-6 max-w-md mx-auto">
                  Reach out on WhatsApp to reserve your spot.
                </p>
                <a href="https://wa.me/918822068322?text=Hey! I want to book a trip with MysTrip."
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-white transition-all hover:scale-105"
                  style={{ background: "#25D366" }}>
                  Book via WhatsApp
                </a>
              </div>
            )}
          </div>
        )}

        {/* Review tab */}
        {activeTab === 2 && (
          <div className="max-w-xl">
            {reviewSent ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                <div className="text-4xl mb-4">🙌</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  Review received!
                </h2>
                <p className="text-gray-400 text-sm">
                  We review every submission before it goes live. Your voice helps shape the tribe.
                </p>
                <button
                  onClick={() => { setReviewSent(false); setReview({ registrationId: "", rating: 0, text: "" }); }}
                  className="mt-6 text-sm font-semibold px-5 py-2.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-all"
                >
                  Leave another review
                </button>
              </div>
            ) : reviewableTrips.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                <div className="text-4xl mb-4">⭐</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  No trips ready to review yet
                </h2>
                <p className="text-gray-400 text-sm">
                  Reviews open up once your booking is confirmed and the trip has actually happened —
                  checked against real bookings, no exceptions.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  Share your experience
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  Honest reviews help future tribe members pick the right adventure.
                </p>
                <form onSubmit={submitReview} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Trip</label>
                    <select
                      required
                      value={review.registrationId}
                      onChange={(e) => setReview({ ...review, registrationId: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 outline-none border border-gray-200 focus:border-orange-400 transition-colors bg-white"
                    >
                      <option value="">Select the trip...</option>
                      {reviewableTrips.map((t) => (
                        <option key={t.registrationId} value={t.registrationId}>
                          {t.tripTitle} — {new Date(t.tripDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReview({ ...review, rating: star })}
                          className="transition-transform hover:scale-110"
                        >
                          <Star size={28} fill={star <= review.rating ? "#FFB001" : "none"} stroke={star <= review.rating ? "#FFB001" : "#CBD5E1"} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Your story</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="The night in the tent, the sunrise, that one moment that made it worth everything — spill it."
                      value={review.text}
                      onChange={(e) => setReview({ ...review, text: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 outline-none border border-gray-200 focus:border-orange-400 transition-colors resize-none placeholder:text-gray-300"
                    />
                  </div>
                  {reviewError && (
                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm bg-red-50 border border-red-100 text-red-600">
                      ⚠ {reviewError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={!review.rating || reviewLoading}
                    className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: "#FF6016" }}
                  >
                    <Send size={15} />
                    {reviewLoading ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
