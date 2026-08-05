"use client";

import { useMemo, useState } from "react";
import { X, RefreshCw } from "lucide-react";
import type { AmbassadorRow, UserRow } from "./AdminClient";

interface Props {
  ambassador: AmbassadorRow | null;
  users: UserRow[];
  onClose: () => void;
  onSaved: (ambassador: AmbassadorRow) => void;
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl text-sm text-gray-800 outline-none border border-gray-200 focus:border-orange-400 transition-colors bg-white";
const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || "MYSTRIP";
}

function suggestCode(fullName: string) {
  const base = firstName(fullName).toUpperCase().replace(/[^A-Z]/g, "").slice(0, 12) || "MYSTRIP";
  const suffix = String(Math.floor(Math.random() * 900) + 100);
  return `${base}${suffix}`;
}

export default function AmbassadorForm({ ambassador, users, onClose, onSaved }: Props) {
  const isEdit = !!ambassador;
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(
    ambassador ? { id: ambassador.userId, fullName: ambassador.fullName, email: ambassador.email, phone: null, college: null, role: "user", isAmbassador: true, createdAt: "" } : null
  );
  const [form, setForm] = useState({
    referralCode: ambassador?.referralCode ?? "",
    tier: ambassador?.tier ?? "micro",
    instagramHandle: ambassador?.instagramHandle ?? "",
    upiId: ambassador?.upiId ?? "",
    discountType: ambassador?.discountType ?? "flat",
    discountValue: ambassador?.discountValue?.toString() ?? "",
    discountMaxCap: ambassador?.discountMaxCap?.toString() ?? "",
    commissionType: ambassador?.commissionType ?? "flat",
    commissionValue: ambassador?.commissionValue?.toString() ?? "",
    commissionBase: ambassador?.commissionBase ?? "post_discount",
    notes: ambassador?.notes ?? "",
  });
  const [confirmRetroactive, setConfirmRetroactive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const searchResults = useMemo(() => {
    if (isEdit || !search.trim()) return [];
    const q = search.trim().toLowerCase();
    return users
      .filter((u) => !u.isAmbassador && (u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone ?? "").includes(q)))
      .slice(0, 8);
  }, [users, search, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isEdit && !selectedUser) {
      setError("Search for and select a user first.");
      return;
    }
    if (!isEdit && !form.referralCode.trim()) {
      setError("Enter or generate a referral code.");
      return;
    }
    if (!form.discountValue || !form.commissionValue) {
      setError("Discount and commission values are required.");
      return;
    }
    // Editing an existing ambassador's terms only ever applies going
    // forward — every past booking already snapshotted its own discount and
    // commission, so there's nothing to reconcile, but the admin should
    // still consciously acknowledge that before changing live terms.
    if (isEdit && !confirmRetroactive) {
      setError("Please confirm this change only applies to future bookings.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        userId: selectedUser?.id,
        referralCode: form.referralCode.trim().toUpperCase(),
        tier: form.tier,
        instagramHandle: form.instagramHandle || null,
        upiId: form.upiId || null,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        discountMaxCap: form.discountMaxCap === "" ? null : Number(form.discountMaxCap),
        commissionType: form.commissionType,
        commissionValue: Number(form.commissionValue),
        commissionBase: form.commissionBase,
        notes: form.notes || null,
      };
      const url = isEdit ? `/api/admin/ambassadors/${ambassador!.id}` : "/api/admin/ambassadors";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      onSaved({
        id: ambassador?.id ?? data.ambassador.id,
        userId: selectedUser!.id,
        fullName: selectedUser!.fullName,
        email: selectedUser!.email,
        referralCode: payload.referralCode,
        tier: payload.tier,
        instagramHandle: payload.instagramHandle,
        upiId: payload.upiId,
        status: ambassador?.status ?? "active",
        discountType: payload.discountType,
        discountValue: payload.discountValue,
        discountMaxCap: payload.discountMaxCap,
        commissionType: payload.commissionType,
        commissionValue: payload.commissionValue,
        commissionBase: payload.commissionBase,
        notes: payload.notes,
        createdAt: ambassador?.createdAt ?? new Date().toISOString(),
        clicks: ambassador?.clicks ?? 0,
        bookingsAttributed: ambassador?.bookingsAttributed ?? 0,
        revenue: ambassador?.revenue ?? 0,
        payoutPending: ambassador?.payoutPending ?? 0,
        payoutPaid: ambassador?.payoutPaid ?? 0,
        pendingPayouts: ambassador?.pendingPayouts ?? [],
      });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="bg-white rounded-2xl w-full max-w-2xl my-4 sm:my-8">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            {isEdit ? "Edit Ambassador" : "Promote to Ambassador"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {!isEdit && (
            <div>
              <label className={labelClass}>Find a user (name, email, or phone)</label>
              {selectedUser ? (
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-orange-200 bg-orange-50">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{selectedUser.fullName}</p>
                    <p className="text-xs text-gray-500">{selectedUser.email}</p>
                  </div>
                  <button type="button" onClick={() => setSelectedUser(null)} className="text-xs font-semibold text-orange-600 hover:text-orange-700">
                    Change
                  </button>
                </div>
              ) : (
                <>
                  <input
                    className={inputClass}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search members..."
                  />
                  {searchResults.length > 0 && (
                    <div className="mt-2 rounded-xl border border-gray-200 divide-y divide-gray-100 max-h-56 overflow-y-auto">
                      {searchResults.map((u) => (
                        <button
                          type="button"
                          key={u.id}
                          onClick={() => {
                            setSelectedUser(u);
                            setForm((f) => ({ ...f, referralCode: f.referralCode || suggestCode(u.fullName) }));
                          }}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-gray-50 transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-800">{u.fullName}</p>
                          <p className="text-xs text-gray-400">{u.email}{u.phone ? ` · ${u.phone}` : ""}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  {search.trim() && searchResults.length === 0 && (
                    <p className="text-xs text-gray-400 mt-2">No matching members (already-ambassador accounts are hidden).</p>
                  )}
                </>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Referral Code *</label>
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  value={form.referralCode}
                  onChange={(e) => set("referralCode", e.target.value.toUpperCase())}
                  placeholder="ROHIT500"
                  disabled={isEdit}
                />
                {!isEdit && (
                  <button
                    type="button"
                    onClick={() => set("referralCode", suggestCode(selectedUser?.fullName ?? "MYSTRIP"))}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 hover:bg-gray-50 flex-shrink-0"
                  >
                    <RefreshCw size={13} /> Suggest
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className={labelClass}>Tier</label>
              <select className={inputClass} value={form.tier} onChange={(e) => set("tier", e.target.value)}>
                <option value="micro">Micro</option>
                <option value="mid">Mid</option>
                <option value="anchor">Anchor</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Instagram Handle</label>
              <input className={inputClass} value={form.instagramHandle} onChange={(e) => set("instagramHandle", e.target.value)} placeholder="rohit.travels" />
            </div>
            <div>
              <label className={labelClass}>UPI ID</label>
              <input className={inputClass} value={form.upiId} onChange={(e) => set("upiId", e.target.value)} placeholder="rohit@upi" />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Discount given to friends</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Type</label>
                <select className={inputClass} value={form.discountType} onChange={(e) => set("discountType", e.target.value)}>
                  <option value="flat">Flat ₹</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Value *</label>
                <input type="number" min="0" className={inputClass} value={form.discountValue} onChange={(e) => set("discountValue", e.target.value)} placeholder={form.discountType === "flat" ? "200" : "10"} />
              </div>
              {form.discountType === "percentage" && (
                <div>
                  <label className={labelClass}>Max Cap ₹</label>
                  <input type="number" min="0" className={inputClass} value={form.discountMaxCap} onChange={(e) => set("discountMaxCap", e.target.value)} placeholder="500" />
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Commission owed to the ambassador</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Type</label>
                <select className={inputClass} value={form.commissionType} onChange={(e) => set("commissionType", e.target.value)}>
                  <option value="flat">Flat ₹</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Value *</label>
                <input type="number" min="0" className={inputClass} value={form.commissionValue} onChange={(e) => set("commissionValue", e.target.value)} placeholder={form.commissionType === "flat" ? "150" : "5"} />
              </div>
              <div>
                <label className={labelClass}>Calculated on</label>
                <select className={inputClass} value={form.commissionBase} onChange={(e) => set("commissionBase", e.target.value)}>
                  <option value="post_discount">Amount customer paid</option>
                  <option value="pre_discount">Sticker price</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Admin Notes (not shown to the ambassador)</label>
            <textarea rows={2} className={inputClass} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Negotiated terms, context, etc." />
          </div>

          {isEdit && (
            <label className="flex items-start gap-2.5 p-4 rounded-xl cursor-pointer" style={{ background: "#FFFBF5", border: "1px solid #FFE4CC" }}>
              <input type="checkbox" className="mt-0.5" checked={confirmRetroactive} onChange={(e) => setConfirmRetroactive(e.target.checked)} />
              <span className="text-xs text-gray-600">
                I understand this change only applies to bookings made from now on — past bookings and payouts already made keep their original terms.
              </span>
            </label>
          )}

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm bg-red-50 border border-red-100 text-red-600">⚠ {error}</div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "#FF6016" }}
            >
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Promote"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
