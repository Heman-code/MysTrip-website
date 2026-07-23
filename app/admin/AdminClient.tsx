"use client";

import { useState } from "react";
import { Users, Star, BarChart2, CheckCircle, Clock, XCircle, Receipt } from "lucide-react";

interface UserRow {
  id: string;
  fullName: string;
  email: string;
  college: string | null;
  role: string;
  createdAt: string;
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
  whatsappNumber: string | null;
  guardianPhone: string | null;
  collegeRegNumber: string | null;
  referralCode: string | null;
  paymentScreenshot: string | null;
  createdAt: string;
  userName: string;
  userEmail: string;
  tripTitle: string;
}

interface Props {
  stats: { totalUsers: number; totalBookings: number; pendingReviews: number; pendingRegistrations: number };
  users: UserRow[];
  pendingReviews: ReviewRow[];
  pendingRegistrations: RegistrationRow[];
}

const tabs = ["Overview", "Users", "Review Approvals", "Registrations"];

export default function AdminClient({ stats, users, pendingReviews, pendingRegistrations }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [reviews, setReviews] = useState(pendingReviews);
  const [approving, setApproving] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState(pendingRegistrations);
  const [reviewingReg, setReviewingReg] = useState<string | null>(null);
  const [zoomedScreenshot, setZoomedScreenshot] = useState<string | null>(null);

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
      setRegistrations((r) => r.filter((rg) => rg.id !== id));
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
                      <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{u.fullName}</td>
                      <td className="px-6 py-4 text-gray-500">{u.email}</td>
                      <td className="px-6 py-4 text-gray-500">{u.college || "—"}</td>
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4 text-gray-400">
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
                <div className="flex items-start justify-between gap-4">
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
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
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
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                Pending Registrations <span className="text-gray-400 font-normal text-sm ml-2">({registrations.length})</span>
              </h2>
            </div>

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
                      {rg.referralCode && <p><span className="text-gray-400">Referral:</span> {rg.referralCode}</p>}
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
          </div>
        )}
      </div>

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
