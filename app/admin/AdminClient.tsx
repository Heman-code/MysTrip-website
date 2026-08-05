"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Users, Star, BarChart2, CheckCircle, Clock, XCircle, Receipt, Plus, Pencil, MapPin, Check, X } from "lucide-react";
import TripForm from "./TripForm";
import PoiForm from "./PoiForm";
import AmbassadorForm from "./AmbassadorForm";
import AttributeBookingForm from "./AttributeBookingForm";
import type { EntryFees } from "@/lib/db/pois";

export interface UserRow {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  college: string | null;
  role: string;
  isAmbassador: boolean;
  createdAt: string;
}

export interface AmbassadorRow {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  referralCode: string;
  tier: string;
  instagramHandle: string | null;
  upiId: string | null;
  status: string;
  discountType: string;
  discountValue: number;
  discountMaxCap: number | null;
  commissionType: string;
  commissionValue: number;
  commissionBase: string;
  notes: string | null;
  createdAt: string;
  clicks: number;
  bookingsAttributed: number;
  revenue: number;
  payoutPending: number;
  payoutPaid: number;
  pendingPayouts: { id: string; amount: number; createdAt: string }[];
}

interface ReviewRow {
  id: string;
  rating: number;
  body: string;
  createdAt: string;
  userName: string;
  tripTitle: string;
}

interface RegistrationRow {
  id: string;
  amount: number;
  discountAmount: number;
  whatsappNumber: string | null;
  guardianPhone: string | null;
  collegeRegNumber: string | null;
  paymentScreenshot: string | null;
  createdAt: string;
  userName: string;
  userEmail: string;
  tripTitle: string;
}

export interface AdminTripRow {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  destination: string;
  state: string;
  source: string;
  category: string;
  status: string;
  difficulty: string;
  tripDate: string;
  returnDate: string;
  departureTime: string;
  returnTime: string;
  basePrice: number;
  maxSlots: number;
  minSlots: number;
  bookedSlots: number;
  shortDescription: string;
  description: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  coverImage: string;
  tag: string;
  tagColor: string;
  accentColor: string;
  registrationOpen: boolean;
}

export interface AdminSpecialEventRow {
  name: string;
  description: string;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  isMustSee: boolean;
}

export interface AdminPoiRow {
  id: string;
  citySlug: string;
  slug: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
  shortDescription: string;
  longDescription: string;
  interestTags: string[];
  photos: string[];
  coverImage: string;
  openingHours: Record<string, { open: string; close: string }[]> | null;
  avgVisitDurationMinutes: number;
  entryFees: EntryFees;
  googleRating: number | null;
  isActive: boolean;
  source: string;
  specialEvents: AdminSpecialEventRow[];
}

interface Props {
  stats: { totalUsers: number; totalBookings: number; pendingReviews: number; pendingRegistrations: number };
  users: UserRow[];
  pendingReviews: ReviewRow[];
  pendingRegistrations: RegistrationRow[];
  confirmedRegistrations: RegistrationRow[];
  trips: AdminTripRow[];
  pois: AdminPoiRow[];
  ambassadors: AmbassadorRow[];
}

const tabs = ["Overview", "Users", "Review Approvals", "Registrations", "Trips", "Jaipur POIs", "Ambassadors"];

export default function AdminClient({ stats, users, pendingReviews, pendingRegistrations, confirmedRegistrations, trips: initialTrips, pois: initialPois, ambassadors: initialAmbassadors }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [reviews, setReviews] = useState(pendingReviews);
  const [approving, setApproving] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState(pendingRegistrations);
  const [confirmedRegs, setConfirmedRegs] = useState(confirmedRegistrations);
  const [regView, setRegView] = useState<"pending" | "confirmed">("pending");
  const [reviewingReg, setReviewingReg] = useState<string | null>(null);
  const [zoomedScreenshot, setZoomedScreenshot] = useState<string | null>(null);
  const [trips, setTrips] = useState(initialTrips);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<AdminTripRow | null>(null);
  const [togglingTripId, setTogglingTripId] = useState<string | null>(null);
  const [editingSlotsId, setEditingSlotsId] = useState<string | null>(null);
  const [slotsDraft, setSlotsDraft] = useState("");
  const [savingSlots, setSavingSlots] = useState(false);
  const [openingPriceId, setOpeningPriceId] = useState<string | null>(null);
  const [priceDraft, setPriceDraft] = useState("");
  const [savingPrice, setSavingPrice] = useState(false);
  const [pois, setPois] = useState(initialPois);
  const [poiFormOpen, setPoiFormOpen] = useState(false);
  const [editingPoi, setEditingPoi] = useState<AdminPoiRow | null>(null);
  const [togglingPoiId, setTogglingPoiId] = useState<string | null>(null);
  const [ambassadors, setAmbassadors] = useState(initialAmbassadors);
  const [ambassadorFormOpen, setAmbassadorFormOpen] = useState(false);
  const [editingAmbassador, setEditingAmbassador] = useState<AmbassadorRow | null>(null);
  const [togglingAmbassadorId, setTogglingAmbassadorId] = useState<string | null>(null);
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);
  const [attributingFor, setAttributingFor] = useState<AmbassadorRow | null>(null);

  const startEditingSlots = (trip: AdminTripRow) => {
    setEditingSlotsId(trip.id);
    setSlotsDraft(String(trip.bookedSlots));
  };

  const saveBookedSlots = async (tripId: string) => {
    const value = Math.max(0, Math.round(Number(slotsDraft)));
    if (Number.isNaN(value)) return;
    setSavingSlots(true);
    const res = await fetch(`/api/admin/trips/${tripId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookedSlots: value }),
    });
    if (res.ok) {
      setTrips((ts) => ts.map((t) => (t.id === tripId ? { ...t, bookedSlots: value } : t)));
      setEditingSlotsId(null);
    }
    setSavingSlots(false);
  };

  const toggleRegistration = async (trip: AdminTripRow) => {
    // Opening registration is the moment the real price goes live everywhere
    // "Price revealing soon" was showing, so require confirming/setting it
    // in the same motion instead of trusting whatever basePrice happens to
    // already be on the trip.
    if (!trip.registrationOpen) {
      setOpeningPriceId(trip.id);
      setPriceDraft(trip.basePrice ? String(trip.basePrice) : "");
      return;
    }
    setTogglingTripId(trip.id);
    const res = await fetch(`/api/admin/trips/${trip.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationOpen: false }),
    });
    if (res.ok) {
      setTrips((ts) => ts.map((t) => (t.id === trip.id ? { ...t, registrationOpen: false } : t)));
    }
    setTogglingTripId(null);
  };

  const confirmOpenRegistration = async (tripId: string) => {
    const price = Number(priceDraft);
    if (!priceDraft || Number.isNaN(price) || price <= 0) return;
    setSavingPrice(true);
    const res = await fetch(`/api/admin/trips/${tripId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationOpen: true, basePrice: price }),
    });
    if (res.ok) {
      setTrips((ts) => ts.map((t) => (t.id === tripId ? { ...t, registrationOpen: true, basePrice: price } : t)));
      setOpeningPriceId(null);
    }
    setSavingPrice(false);
  };

  const handleTripSaved = (saved: AdminTripRow) => {
    setTrips((ts) => {
      const exists = ts.some((t) => t.id === saved.id);
      return exists ? ts.map((t) => (t.id === saved.id ? saved : t)) : [saved, ...ts];
    });
    setFormOpen(false);
    setEditingTrip(null);
  };

  const handlePoiSaved = (saved: AdminPoiRow) => {
    setPois((ps) => {
      const exists = ps.some((p) => p.id === saved.id);
      return exists ? ps.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...ps];
    });
    setPoiFormOpen(false);
    setEditingPoi(null);
  };

  const togglePoiActive = async (poi: AdminPoiRow) => {
    setTogglingPoiId(poi.id);
    const res = await fetch(`/api/admin/pois/${poi.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !poi.isActive }),
    });
    if (res.ok) {
      setPois((ps) => ps.map((p) => (p.id === poi.id ? { ...p, isActive: !poi.isActive } : p)));
    }
    setTogglingPoiId(null);
  };

  const handleAmbassadorSaved = (saved: AmbassadorRow) => {
    setAmbassadors((as) => {
      const exists = as.some((a) => a.id === saved.id);
      return exists ? as.map((a) => (a.id === saved.id ? saved : a)) : [saved, ...as];
    });
    setAmbassadorFormOpen(false);
    setEditingAmbassador(null);
  };

  const toggleAmbassadorStatus = async (ambassador: AmbassadorRow) => {
    const nextStatus = ambassador.status === "active" ? "paused" : "active";
    setTogglingAmbassadorId(ambassador.id);
    const res = await fetch(`/api/admin/ambassadors/${ambassador.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) {
      setAmbassadors((as) => as.map((a) => (a.id === ambassador.id ? { ...a, status: nextStatus } : a)));
    }
    setTogglingAmbassadorId(null);
  };

  const markPayoutPaid = async (ambassadorId: string, payoutId: string, amount: number) => {
    setMarkingPaidId(payoutId);
    const res = await fetch(`/api/admin/payouts/${payoutId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_paid" }),
    });
    if (res.ok) {
      setAmbassadors((as) =>
        as.map((a) =>
          a.id === ambassadorId
            ? { ...a, pendingPayouts: a.pendingPayouts.filter((p) => p.id !== payoutId), payoutPending: a.payoutPending - amount, payoutPaid: a.payoutPaid + amount }
            : a
        )
      );
    }
    setMarkingPaidId(null);
  };

  const approve = async (id: string) => {
    setApproving(id);
    await fetch(`/api/admin/approve-review/${id}`, { method: "PATCH" });
    setReviews((r) => r.filter((rv) => rv.id !== id));
    setApproving(null);
  };

  const reviewRegistration = async (id: string, action: "confirm" | "reject") => {
    setReviewingReg(id);
    const res = await fetch(`/api/admin/registrations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      setRegistrations((r) => {
        const reg = r.find((rg) => rg.id === id);
        if (action === "confirm" && reg) setConfirmedRegs((c) => [reg, ...c]);
        return r.filter((rg) => rg.id !== id);
      });
    }
    setReviewingReg(null);
  };

  return (
    <div className="min-h-screen" style={{ background: "#F9F7F4" }}>
      {/* Header */}
      <div style={{ background: "#0B1210" }} className="pt-16 pb-6 sm:pt-20 sm:pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest"
              style={{ background: "rgba(255,96,22,0.15)", color: "#FF6016", border: "1px solid rgba(255,96,22,0.25)" }}
            >
              Admin
            </span>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              MysTrip Dashboard
            </h1>
          </div>
          <div className="flex gap-1 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex-shrink-0 whitespace-nowrap"
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Overview */}
        {activeTab === 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Members", value: stats.totalUsers, icon: Users, color: "#FF6016" },
                { label: "Total Bookings", value: stats.totalBookings, icon: BarChart2, color: "#FFB001" },
                { label: "Pending Reviews", value: stats.pendingReviews, icon: Star, color: "#10b981" },
                { label: "Pending Registrations", value: stats.pendingRegistrations, icon: Receipt, color: "#6366f1" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-4">
                  <div className="rounded-xl p-3" style={{ background: `${color}18` }}>
                    <Icon size={22} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>{value}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>Quick actions</h2>
              <p className="text-sm text-gray-400 mb-5">Common tasks at a glance.</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setActiveTab(3)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-all">
                  <Receipt size={15} className="text-indigo-500" /> Registrations ({stats.pendingRegistrations})
                </button>
                <button onClick={() => setActiveTab(2)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-all">
                  <Clock size={15} className="text-orange-500" /> Review queue ({stats.pendingReviews})
                </button>
                <button onClick={() => setActiveTab(1)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-all">
                  <Users size={15} className="text-blue-500" /> View all users
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                All Members <span className="text-gray-400 font-normal text-sm ml-2">({users.length})</span>
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Name", "Email", "College", "Role", "Joined"].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{u.fullName}</td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{u.email}</td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{u.college || "—"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-bold"
                          style={
                            u.role === "admin"
                              ? { background: "rgba(255,96,22,0.1)", color: "#FF6016" }
                              : { background: "#f1f5f9", color: "#64748b" }
                          }
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400">No members yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Review Approvals */}
        {activeTab === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                Pending Reviews <span className="text-gray-400 font-normal text-sm ml-2">({reviews.length})</span>
              </h2>
            </div>

            {reviews.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <CheckCircle size={36} className="mx-auto mb-3 text-emerald-400" />
                <p className="font-semibold text-gray-700">All caught up!</p>
                <p className="text-sm text-gray-400 mt-1">No reviews waiting for approval.</p>
              </div>
            )}

            {reviews.map((rv) => (
              <div key={rv.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{rv.userName}</span>
                      <span className="text-xs text-gray-400">on</span>
                      <span className="text-sm font-medium text-gray-700">{rv.tripTitle}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} style={{ color: i < rv.rating ? "#FFB001" : "#e2e8f0", fontSize: 14 }}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{rv.body}</p>
                    <p className="text-xs text-gray-400 mt-3">
                      {new Date(rv.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <button
                    onClick={() => approve(rv.id)}
                    disabled={approving === rv.id}
                    className="self-start flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: "#10b981" }}
                  >
                    <CheckCircle size={15} />
                    {approving === rv.id ? "Approving…" : "Approve"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Registrations */}
        {activeTab === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
              <h2 className="font-bold text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                Registrations
              </h2>
              <div className="flex gap-1">
                <button
                  onClick={() => setRegView("pending")}
                  className="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200"
                  style={
                    regView === "pending"
                      ? { background: "#FF6016", color: "#fff" }
                      : { background: "#f1f5f9", color: "#64748b" }
                  }
                >
                  Pending ({registrations.length})
                </button>
                <button
                  onClick={() => setRegView("confirmed")}
                  className="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200"
                  style={
                    regView === "confirmed"
                      ? { background: "#FF6016", color: "#fff" }
                      : { background: "#f1f5f9", color: "#64748b" }
                  }
                >
                  Confirmed ({confirmedRegs.length})
                </button>
              </div>
            </div>

            {regView === "pending" && (
              <>
                {registrations.length === 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <CheckCircle size={36} className="mx-auto mb-3 text-emerald-400" />
                    <p className="font-semibold text-gray-700">All caught up!</p>
                    <p className="text-sm text-gray-400 mt-1">No registrations waiting for payment verification.</p>
                  </div>
                )}

                {registrations.map((rg) => (
                  <div key={rg.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-5">
                      {rg.paymentScreenshot && (
                        <button
                          onClick={() => setZoomedScreenshot(rg.paymentScreenshot)}
                          className="relative w-full sm:w-32 h-40 sm:h-32 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={rg.paymentScreenshot} alt="Payment screenshot" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
                        </button>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="font-semibold text-gray-900">{rg.userName}</span>
                          <span className="text-xs text-gray-400">·</span>
                          <span className="text-sm text-gray-500">{rg.userEmail}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-3">{rg.tripTitle}</p>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-3">
                          <p><span className="text-gray-400">Amount:</span> ₹{rg.amount.toLocaleString("en-IN")}</p>
                          <p><span className="text-gray-400">WhatsApp:</span> {rg.whatsappNumber || "—"}</p>
                          <p><span className="text-gray-400">Guardian:</span> {rg.guardianPhone || "—"}</p>
                          <p><span className="text-gray-400">College Reg No:</span> {rg.collegeRegNumber || "—"}</p>
                          {rg.discountAmount > 0 && (
                            <p><span className="text-gray-400">Coupon discount:</span> <span className="text-emerald-600 font-semibold">− ₹{rg.discountAmount.toLocaleString("en-IN")}</span></p>
                          )}
                        </div>

                        <p className="text-xs text-gray-400 mb-3">
                          Submitted {new Date(rg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>

                        <div className="flex gap-2">
                          <button
                            onClick={() => reviewRegistration(rg.id, "confirm")}
                            disabled={reviewingReg === rg.id}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ background: "#10b981" }}
                          >
                            <CheckCircle size={15} />
                            {reviewingReg === rg.id ? "Working…" : "Confirm"}
                          </button>
                          <button
                            onClick={() => reviewRegistration(rg.id, "reject")}
                            disabled={reviewingReg === rg.id}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ background: "#ef4444" }}
                          >
                            <XCircle size={15} />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {regView === "confirmed" && (
              <>
                {confirmedRegs.length === 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <Receipt size={36} className="mx-auto mb-3 text-gray-300" />
                    <p className="font-semibold text-gray-700">No confirmed registrations yet.</p>
                    <p className="text-sm text-gray-400 mt-1">Confirmed bookings will show up here.</p>
                  </div>
                )}

                {confirmedRegs.map((rg) => (
                  <div key={rg.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-5">
                      {rg.paymentScreenshot && (
                        <button
                          onClick={() => setZoomedScreenshot(rg.paymentScreenshot)}
                          className="relative w-full sm:w-32 h-40 sm:h-32 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={rg.paymentScreenshot} alt="Payment screenshot" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
                        </button>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="font-semibold text-gray-900">{rg.userName}</span>
                          <span className="text-xs text-gray-400">·</span>
                          <span className="text-sm text-gray-500">{rg.userEmail}</span>
                          <span
                            className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}
                          >
                            <CheckCircle size={11} /> Confirmed
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-3">{rg.tripTitle}</p>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-3">
                          <p><span className="text-gray-400">Amount:</span> ₹{rg.amount.toLocaleString("en-IN")}</p>
                          <p><span className="text-gray-400">WhatsApp:</span> {rg.whatsappNumber || "—"}</p>
                          <p><span className="text-gray-400">Guardian:</span> {rg.guardianPhone || "—"}</p>
                          <p><span className="text-gray-400">College Reg No:</span> {rg.collegeRegNumber || "—"}</p>
                          {rg.discountAmount > 0 && (
                            <p><span className="text-gray-400">Coupon discount:</span> <span className="text-emerald-600 font-semibold">− ₹{rg.discountAmount.toLocaleString("en-IN")}</span></p>
                          )}
                        </div>

                        <p className="text-xs text-gray-400">
                          Submitted {new Date(rg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Trips */}
        {activeTab === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                All Trips <span className="text-gray-400 font-normal text-sm ml-2">({trips.length})</span>
              </h2>
              <button
                onClick={() => { setEditingTrip(null); setFormOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: "#FF6016" }}
              >
                <Plus size={16} /> Add New Trip
              </button>
            </div>

            {trips.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <p className="font-semibold text-gray-700">No trips yet.</p>
                <p className="text-sm text-gray-400 mt-1">Add your first trip to get it live on the site.</p>
              </div>
            )}

            <div className="space-y-3">
              {[...trips].sort((a, b) => Number(a.status === "executed") - Number(b.status === "executed")).map((t) => (
                <div
                  key={t.id}
                  className={`rounded-2xl border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all ${
                    t.status === "executed" ? "bg-gray-50 border-gray-100 grayscale opacity-60" : "bg-white border-gray-100"
                  }`}
                >
                  <div className="relative w-full sm:w-24 h-32 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    {t.coverImage ? (
                      <Image src={t.coverImage} alt={t.title} fill className="object-cover" sizes="96px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No image</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{t.title}</span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: t.source === "sundarone" ? "#FF7800" : "#01574A" }}
                      >
                        {t.source === "sundarone" ? "Sundarone" : "MysTrip"}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1 flex-wrap">
                      <MapPin size={11} /> {t.destination}
                      <span className="mx-1">·</span>
                      {new Date(t.tripDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      <span className="mx-1">·</span>
                      ₹{t.basePrice.toLocaleString("en-IN")}
                    </p>

                    <div className="mt-1.5">
                      {editingSlotsId === t.id ? (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="number"
                            min="0"
                            autoFocus
                            value={slotsDraft}
                            onChange={(e) => setSlotsDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveBookedSlots(t.id);
                              if (e.key === "Escape") setEditingSlotsId(null);
                            }}
                            className="w-16 px-2 py-1 rounded-lg border border-orange-300 text-xs text-gray-800 outline-none focus:border-orange-500"
                          />
                          <span className="text-xs text-gray-400">/ {t.maxSlots} booked</span>
                          <button
                            type="button"
                            onClick={() => saveBookedSlots(t.id)}
                            disabled={savingSlots}
                            className="p-1 rounded-lg text-white disabled:opacity-50 flex-shrink-0"
                            style={{ background: "#10b981" }}
                            aria-label="Save seats"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSlotsId(null)}
                            className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 flex-shrink-0"
                            aria-label="Cancel"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEditingSlots(t)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          {t.bookedSlots}/{t.maxSlots} booked
                          <Pencil size={10} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                    {openingPriceId === t.id ? (
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <span className="text-xs text-gray-400">₹</span>
                        <input
                          type="number"
                          min="0"
                          autoFocus
                          placeholder="Price"
                          value={priceDraft}
                          onChange={(e) => setPriceDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") confirmOpenRegistration(t.id);
                            if (e.key === "Escape") setOpeningPriceId(null);
                          }}
                          className="w-20 px-2 py-1 rounded-lg border border-orange-300 text-xs text-gray-800 outline-none focus:border-orange-500"
                        />
                        <button
                          type="button"
                          onClick={() => confirmOpenRegistration(t.id)}
                          disabled={savingPrice}
                          className="p-1 rounded-lg text-white disabled:opacity-50 flex-shrink-0"
                          style={{ background: "#10b981" }}
                          aria-label="Confirm price and open registration"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setOpeningPriceId(null)}
                          className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 flex-shrink-0"
                          aria-label="Cancel"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-500">
                          {t.registrationOpen ? "Open" : "Closed"}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleRegistration(t)}
                          disabled={togglingTripId === t.id}
                          className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0 disabled:opacity-50"
                          style={{ background: t.registrationOpen ? "#10b981" : "#d1d5db" }}
                        >
                          <span
                            className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm"
                            style={{ transform: t.registrationOpen ? "translateX(20px)" : "translateX(4px)" }}
                          />
                        </button>
                      </label>
                    )}
                    <button
                      onClick={() => { setEditingTrip(t); setFormOpen(true); }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 hover:bg-gray-50 transition-all"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Jaipur POIs */}
        {activeTab === 5 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                Jaipur POIs <span className="text-gray-400 font-normal text-sm ml-2">({pois.length})</span>
              </h2>
              <button
                onClick={() => { setEditingPoi(null); setPoiFormOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: "#FF6016" }}
              >
                <Plus size={16} /> Add New POI
              </button>
            </div>

            {pois.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <p className="font-semibold text-gray-700">No POIs yet.</p>
                <p className="text-sm text-gray-400 mt-1">Add Jaipur&apos;s first point of interest to start building the planner catalog.</p>
              </div>
            )}

            <div className="space-y-3">
              {pois.map((p) => (
                <div
                  key={p.id}
                  className={`rounded-2xl border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all ${
                    p.isActive ? "bg-white border-gray-100" : "bg-gray-50 border-gray-100 opacity-60"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{p.name}</span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">
                        {p.category}
                      </span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: p.source === "google_places" ? "#4285F4" : "#01574A" }}
                      >
                        {p.source === "google_places" ? "Google" : "Manual"}
                      </span>
                      {p.specialEvents.length > 0 && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "rgba(255,96,22,0.1)", color: "#FF6016" }}>
                          {p.specialEvents.length} special event{p.specialEvents.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1 flex-wrap">
                      <MapPin size={11} /> {p.address || `${p.latitude}, ${p.longitude}`}
                    </p>
                    {p.shortDescription && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{p.shortDescription}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs font-semibold text-gray-500">{p.isActive ? "Active" : "Hidden"}</span>
                      <button
                        type="button"
                        onClick={() => togglePoiActive(p)}
                        disabled={togglingPoiId === p.id}
                        className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0 disabled:opacity-50"
                        style={{ background: p.isActive ? "#10b981" : "#d1d5db" }}
                      >
                        <span
                          className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm"
                          style={{ transform: p.isActive ? "translateX(20px)" : "translateX(4px)" }}
                        />
                      </button>
                    </label>
                    <button
                      onClick={() => { setEditingPoi(p); setPoiFormOpen(true); }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 hover:bg-gray-50 transition-all"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Ambassadors */}
        {activeTab === 6 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                Ambassadors <span className="text-gray-400 font-normal text-sm ml-2">({ambassadors.length})</span>
              </h2>
              <button
                onClick={() => { setEditingAmbassador(null); setAmbassadorFormOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: "#FF6016" }}
              >
                <Plus size={16} /> Promote a User
              </button>
            </div>

            {ambassadors.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <p className="font-semibold text-gray-700">No ambassadors yet.</p>
                <p className="text-sm text-gray-400 mt-1">Promote an existing member to start the referral program.</p>
              </div>
            )}

            <div className="space-y-3">
              {ambassadors.map((a) => (
                <div
                  key={a.id}
                  className={`rounded-2xl border p-4 flex flex-col gap-4 transition-all ${
                    a.status === "active" ? "bg-white border-gray-100" : "bg-gray-50 border-gray-100 opacity-60"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{a.fullName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,96,22,0.1)", color: "#FF6016" }}>
                          {a.referralCode}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">{a.tier}</span>
                      </div>
                      <p className="text-xs text-gray-400">{a.email}{a.instagramHandle ? ` · @${a.instagramHandle}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-500">{a.status === "active" ? "Active" : "Paused"}</span>
                        <button
                          type="button"
                          onClick={() => toggleAmbassadorStatus(a)}
                          disabled={togglingAmbassadorId === a.id}
                          className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0 disabled:opacity-50"
                          style={{ background: a.status === "active" ? "#10b981" : "#d1d5db" }}
                        >
                          <span
                            className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm"
                            style={{ transform: a.status === "active" ? "translateX(20px)" : "translateX(4px)" }}
                          />
                        </button>
                      </label>
                      <button
                        onClick={() => setAttributingFor(a)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 hover:bg-gray-50 transition-all"
                      >
                        Log Booking
                      </button>
                      <button
                        onClick={() => { setEditingAmbassador(a); setAmbassadorFormOpen(true); }}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 hover:bg-gray-50 transition-all"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-gray-100">
                    {[
                      { label: "Discount", value: a.discountType === "flat" ? `₹${a.discountValue}` : `${a.discountValue}%${a.discountMaxCap ? ` (max ₹${a.discountMaxCap})` : ""}` },
                      { label: "Commission", value: a.commissionType === "flat" ? `₹${a.commissionValue}` : `${a.commissionValue}%` },
                      { label: "Clicks", value: a.clicks },
                      { label: "Bookings", value: a.bookingsAttributed },
                      { label: "Revenue", value: `₹${a.revenue.toLocaleString("en-IN")}` },
                    ].map((s) => (
                      <div key={s.label}>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">{s.label}</p>
                        <p className="text-sm font-semibold text-gray-800">{s.value}</p>
                      </div>
                    ))}
                  </div>
                  {(a.payoutPending > 0 || a.payoutPaid > 0) && (
                    <div className="flex items-center gap-4 text-xs">
                      {a.payoutPending > 0 && (
                        <span className="font-semibold" style={{ color: "#FF6016" }}>₹{a.payoutPending.toLocaleString("en-IN")} owed</span>
                      )}
                      {a.payoutPaid > 0 && (
                        <span className="text-gray-400">₹{a.payoutPaid.toLocaleString("en-IN")} paid out</span>
                      )}
                    </div>
                  )}
                  {a.pendingPayouts.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {a.pendingPayouts.map((p) => (
                        <div key={p.id} className="flex items-center justify-between text-xs rounded-lg px-3 py-2" style={{ background: "#FFFBF5" }}>
                          <span className="text-gray-500">
                            ₹{p.amount.toLocaleString("en-IN")} pending · {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                          <button
                            onClick={() => markPayoutPaid(a.id, p.id, p.amount)}
                            disabled={markingPaidId === p.id}
                            className="font-bold px-2.5 py-1 rounded-full text-white disabled:opacity-50"
                            style={{ background: "#10b981" }}
                          >
                            {markingPaidId === p.id ? "…" : "Mark Paid"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trip create/edit form */}
      {formOpen && (
        <TripForm
          trip={editingTrip}
          onClose={() => { setFormOpen(false); setEditingTrip(null); }}
          onSaved={handleTripSaved}
        />
      )}

      {/* POI create/edit form */}
      {poiFormOpen && (
        <PoiForm
          poi={editingPoi}
          onClose={() => { setPoiFormOpen(false); setEditingPoi(null); }}
          onSaved={handlePoiSaved}
        />
      )}

      {/* Ambassador promote/edit form */}
      {ambassadorFormOpen && (
        <AmbassadorForm
          ambassador={editingAmbassador}
          users={users}
          onClose={() => { setAmbassadorFormOpen(false); setEditingAmbassador(null); }}
          onSaved={handleAmbassadorSaved}
        />
      )}

      {/* Manual booking-attribution entry */}
      {attributingFor && (
        <AttributeBookingForm
          ambassador={attributingFor}
          onClose={() => setAttributingFor(null)}
          onSaved={() => { setAttributingFor(null); router.refresh(); }}
        />
      )}

      {/* Screenshot zoom overlay */}
      {zoomedScreenshot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={() => setZoomedScreenshot(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoomedScreenshot} alt="Payment screenshot" className="max-w-full max-h-full rounded-xl" />
        </div>
      )}
    </div>
  );
}
