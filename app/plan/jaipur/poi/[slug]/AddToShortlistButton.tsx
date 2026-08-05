"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";

interface Props {
  poiId: string;
  itineraryId: string;
  stopId: string | null;
}

export default function AddToShortlistButton({ poiId, itineraryId, stopId: initialStopId }: Props) {
  const [stopId, setStopId] = useState(initialStopId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggle = async () => {
    setError("");
    setSaving(true);
    try {
      if (stopId) {
        const res = await fetch(`/api/itineraries/${itineraryId}/stops/${stopId}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "Couldn't remove that place.");
          return;
        }
        setStopId(null);
      } else {
        const res = await fetch(`/api/itineraries/${itineraryId}/stops`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ poiId }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Couldn't add that place.");
          return;
        }
        setStopId(data.stop.id);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <button
        onClick={toggle}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
        style={{ background: stopId ? "#10b981" : "#FF6016" }}
      >
        {stopId ? <Check size={16} /> : <Plus size={16} />}
        {stopId ? "Shortlisted" : "Add to shortlist"}
      </button>
      {error && <p className="text-xs text-red-500 mt-2">⚠ {error}</p>}
    </div>
  );
}
