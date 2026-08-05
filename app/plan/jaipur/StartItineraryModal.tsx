"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Navigation, Loader2 } from "lucide-react";
import type { PoiCardData } from "@/lib/db/pois";

interface Props {
  itineraryId: string;
  shortlistedPois: PoiCardData[];
  onClose: () => void;
}

type GeoStatus = "idle" | "pending" | "granted" | "denied" | "unsupported";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl text-sm text-gray-800 outline-none border border-gray-200 focus:border-orange-400 transition-colors bg-white";
const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

export default function StartItineraryModal({ itineraryId, shortlistedPois, onClose }: Props) {
  const router = useRouter();
  const [planDate, setPlanDate] = useState(todayISO());
  const [startTime, setStartTime] = useState("09:00");
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [manualNearPoiId, setManualNearPoiId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("unsupported");
      return;
    }
    setManualNearPoiId("");
    setGeoStatus("pending");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus("granted");
      },
      () => setGeoStatus("denied"),
      { timeout: 8000 }
    );
  };

  const pickNear = (poiId: string) => {
    setManualNearPoiId(poiId);
    setCoords(null);
    setGeoStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = { planDate, startTime };
      if (coords) {
        payload.startLat = coords.lat;
        payload.startLng = coords.lng;
        payload.startLabel = "Current location";
      } else if (manualNearPoiId) {
        const near = shortlistedPois.find((p) => p.id === manualNearPoiId);
        if (near) {
          payload.startLat = near.latitude;
          payload.startLng = near.longitude;
          payload.startLabel = `Near ${near.name}`;
        }
      }

      const res = await fetch(`/api/itineraries/${itineraryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Couldn't save your plan details.");
        return;
      }
      router.push(`/plan/jaipur/itinerary/${itineraryId}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Plan your day
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className={labelClass}>Which day?</label>
            <input type="date" required value={planDate} onChange={(e) => setPlanDate(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>What time do you want to start?</label>
            <input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Starting from</label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={requestLocation}
                disabled={geoStatus === "pending"}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                {geoStatus === "pending" ? <Loader2 size={13} className="animate-spin" /> : <Navigation size={13} />}
                {geoStatus === "granted" ? "Location set" : "Use my location"}
              </button>
              <span className="text-xs text-gray-400">or</span>
              <select
                value={manualNearPoiId}
                onChange={(e) => pickNear(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs border border-gray-200 bg-white flex-1 min-w-[140px]"
              >
                <option value="">I&apos;m near...</option>
                {shortlistedPois.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            {geoStatus === "denied" && (
              <p className="text-xs text-gray-400 mt-2">Location access denied — pick &quot;I&apos;m near...&quot; instead, or we&apos;ll start from central Jaipur.</p>
            )}
            {geoStatus === "unsupported" && (
              <p className="text-xs text-gray-400 mt-2">Location isn&apos;t available here — pick &quot;I&apos;m near...&quot; instead, or we&apos;ll start from central Jaipur.</p>
            )}
            {geoStatus === "idle" && !manualNearPoiId && (
              <p className="text-xs text-gray-400 mt-2">Optional — we&apos;ll start from central Jaipur if you skip this.</p>
            )}
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm bg-red-50 border border-red-100 text-red-600">⚠ {error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: "#FF6016" }}
          >
            {submitting ? "Building..." : "Build my itinerary"}
          </button>
        </form>
      </div>
    </div>
  );
}
