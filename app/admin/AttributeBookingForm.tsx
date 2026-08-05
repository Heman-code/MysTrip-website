"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { AmbassadorRow } from "./AdminClient";

interface Props {
  ambassador: AmbassadorRow;
  onClose: () => void;
  onSaved: () => void;
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl text-sm text-gray-800 outline-none border border-gray-200 focus:border-orange-400 transition-colors bg-white";
const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

export default function AttributeBookingForm({ ambassador, onClose, onSaved }: Props) {
  const [mode, setMode] = useState<"registration" | "standalone">("registration");
  const [registrationId, setRegistrationId] = useState("");
  const [commissionAmount, setCommissionAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "registration" && !registrationId.trim()) {
      setError("Enter the registration ID (from the Registrations tab).");
      return;
    }
    if (mode === "standalone" && !commissionAmount.trim()) {
      setError("Enter the commission amount owed for this WhatsApp booking.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/ambassadors/${ambassador.id}/attribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: mode === "registration" ? registrationId.trim() : undefined,
          commissionAmount: commissionAmount.trim() ? Number(commissionAmount) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      onSaved();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="bg-white rounded-2xl w-full max-w-md my-4 sm:my-8">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Log a Booking for {ambassador.referralCode}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("registration")}
              className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={mode === "registration" ? { background: "#FF6016", color: "#fff" } : { background: "#f1f5f9", color: "#64748b" }}
            >
              Existing registration
            </button>
            <button
              type="button"
              onClick={() => setMode("standalone")}
              className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={mode === "standalone" ? { background: "#FF6016", color: "#fff" } : { background: "#f1f5f9", color: "#64748b" }}
            >
              WhatsApp booking (no record)
            </button>
          </div>

          {mode === "registration" ? (
            <>
              <div>
                <label className={labelClass}>Registration ID</label>
                <input className={inputClass} value={registrationId} onChange={(e) => setRegistrationId(e.target.value)} placeholder="Paste the registration's ID" />
                <p className="text-xs text-gray-400 mt-1.5">Must be a confirmed registration not already attributed to an ambassador.</p>
              </div>
              <div>
                <label className={labelClass}>Commission Override (optional)</label>
                <input type="number" min="0" className={inputClass} value={commissionAmount} onChange={(e) => setCommissionAmount(e.target.value)} placeholder="Leave blank to use this ambassador's current terms" />
              </div>
            </>
          ) : (
            <div>
              <label className={labelClass}>Commission Amount Owed *</label>
              <input type="number" min="0" className={inputClass} value={commissionAmount} onChange={(e) => setCommissionAmount(e.target.value)} placeholder="150" />
              <p className="text-xs text-gray-400 mt-1.5">For a WhatsApp-only booking with no in-app registration row — creates a standalone pending payout.</p>
            </div>
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
              {saving ? "Saving..." : "Log Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
