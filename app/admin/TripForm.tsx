"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ImageIcon, Check } from "lucide-react";
import type { AdminTripRow } from "./AdminClient";
import tripPhotos from "@/lib/data/tripPhotos.json";

interface Props {
  trip: AdminTripRow | null;
  onClose: () => void;
  onSaved: (trip: AdminTripRow) => void;
}

const CATEGORIES = [
  { value: "day_exploration", label: "Day Exploration" },
  { value: "parents_event", label: "Parents Event" },
  { value: "trek", label: "Trek" },
  { value: "weekend_escape", label: "Weekend Escape" },
  { value: "post_midterm", label: "Post-Midterm" },
  { value: "post_endterm", label: "Post-Endterm" },
];

const DIFFICULTIES = ["Easy", "Moderate", "Hard"];
const SOURCES = [
  { value: "mystrip", label: "MysTrip" },
  { value: "sundarone", label: "Sundarone Tribe" },
];
const STATUSES = ["draft", "open", "closed", "confirmed", "executed", "canceled", "postponed"];

function toLines(arr: string[] | undefined | null) {
  return (arr ?? []).join("\n");
}
function fromLines(text: string) {
  return text.split("\n").map((l) => l.trim()).filter(Boolean);
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl text-sm text-gray-800 outline-none border border-gray-200 focus:border-orange-400 transition-colors bg-white";
const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

export default function TripForm({ trip, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    title: trip?.title ?? "",
    shortTitle: trip?.shortTitle ?? "",
    destination: trip?.destination ?? "",
    state: trip?.state ?? "",
    source: trip?.source ?? "mystrip",
    category: trip?.category ?? "day_exploration",
    status: trip?.status ?? "open",
    difficulty: trip?.difficulty ?? "Easy",
    tripDate: trip?.tripDate ?? "",
    returnDate: trip?.returnDate ?? "",
    departureTime: trip?.departureTime ?? "",
    returnTime: trip?.returnTime ?? "",
    basePrice: trip?.basePrice?.toString() ?? "",
    maxSlots: trip?.maxSlots?.toString() ?? "",
    minSlots: trip?.minSlots?.toString() ?? "10",
    shortDescription: trip?.shortDescription ?? "",
    description: trip?.description ?? "",
    highlights: toLines(trip?.highlights),
    inclusions: toLines(trip?.inclusions),
    exclusions: toLines(trip?.exclusions),
    coverImage: trip?.coverImage ?? "",
    tag: trip?.tag ?? "",
    tagColor: trip?.tagColor ?? "#FF6016",
    accentColor: trip?.accentColor ?? "#FF6016",
    registrationOpen: trip?.registrationOpen ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.title || !form.destination || !form.tripDate || !form.basePrice || !form.maxSlots) {
      setError("Please fill in title, destination, date, price, and max slots.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        basePrice: Number(form.basePrice),
        maxSlots: Number(form.maxSlots),
        minSlots: Number(form.minSlots || 10),
        highlights: fromLines(form.highlights),
        inclusions: fromLines(form.inclusions),
        exclusions: fromLines(form.exclusions),
      };
      const url = trip ? `/api/admin/trips/${trip.id}` : "/api/admin/trips";
      const method = trip ? "PATCH" : "POST";
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
        id: trip?.id ?? data.trip.id,
        slug: trip?.slug ?? data.trip.slug,
        ...payload,
        bookedSlots: trip?.bookedSlots ?? 0,
      });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="bg-white rounded-2xl w-full max-w-3xl my-4 sm:my-8">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            {trip ? "Edit Trip" : "Add New Trip"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cover image */}
          <div>
            <label className={labelClass}>Cover Photo</label>
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                {form.coverImage ? (
                  <Image src={form.coverImage} alt="Cover" fill className="object-cover" sizes="128px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No image</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 cursor-pointer transition-all"
              >
                <ImageIcon size={15} />
                Choose Photo
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Picks from photos already in the repo&apos;s <code>public/trips/</code> folder. To add a new one, drop the file there and push — it shows up here after the next deploy.
            </p>
          </div>

          {/* Photo picker overlay */}
          {pickerOpen && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8"
              style={{ background: "rgba(0,0,0,0.6)" }}
              onClick={() => setPickerOpen(false)}
            >
              <div
                className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
                  <h3 className="font-bold text-gray-900">Choose a Cover Photo</h3>
                  <button onClick={() => setPickerOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                    <X size={16} />
                  </button>
                </div>
                <div className="p-4 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {(tripPhotos as string[]).map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => { set("coverImage", src); setPickerOpen(false); }}
                      className="relative aspect-video rounded-lg overflow-hidden border-2 transition-all hover:opacity-90"
                      style={{ borderColor: form.coverImage === src ? "#FF6016" : "transparent" }}
                    >
                      <Image src={src} alt="" fill className="object-cover" sizes="150px" />
                      {form.coverImage === src && (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(255,96,22,0.35)" }}>
                          <Check size={20} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Core fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Title *</label>
              <input className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Sunrise to Skyline" />
            </div>
            <div>
              <label className={labelClass}>Short Title</label>
              <input className={inputClass} value={form.shortTitle} onChange={(e) => set("shortTitle", e.target.value)} placeholder="Defaults to title" />
            </div>
            <div>
              <label className={labelClass}>Destination *</label>
              <input className={inputClass} value={form.destination} onChange={(e) => set("destination", e.target.value)} placeholder="Jaipur" />
            </div>
            <div>
              <label className={labelClass}>State</label>
              <input className={inputClass} value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="Rajasthan" />
            </div>
            <div>
              <label className={labelClass}>Difficulty</label>
              <select className={inputClass} value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)}>
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Source</label>
              <select className={inputClass} value={form.source} onChange={(e) => set("source", e.target.value)}>
                {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Start Date *</label>
              <input type="date" className={inputClass} value={form.tripDate} onChange={(e) => set("tripDate", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input type="date" className={inputClass} value={form.returnDate} onChange={(e) => set("returnDate", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Departure</label>
              <input className={inputClass} value={form.departureTime} onChange={(e) => set("departureTime", e.target.value)} placeholder="4:30 AM" />
            </div>
            <div>
              <label className={labelClass}>Returns</label>
              <input className={inputClass} value={form.returnTime} onChange={(e) => set("returnTime", e.target.value)} placeholder="9:15 PM" />
            </div>
          </div>

          {/* Price + slots */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Price (₹) *</label>
              <input type="number" min="0" className={inputClass} value={form.basePrice} onChange={(e) => set("basePrice", e.target.value)} placeholder="1499" />
            </div>
            <div>
              <label className={labelClass}>Max Slots *</label>
              <input type="number" min="1" className={inputClass} value={form.maxSlots} onChange={(e) => set("maxSlots", e.target.value)} placeholder="20" />
            </div>
            <div>
              <label className={labelClass}>Min Slots</label>
              <input type="number" min="1" className={inputClass} value={form.minSlots} onChange={(e) => set("minSlots", e.target.value)} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Short Description</label>
            <textarea rows={2} className={inputClass} value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} placeholder="One or two lines shown on trip cards" />
          </div>
          <div>
            <label className={labelClass}>Full Description</label>
            <textarea rows={4} className={inputClass} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="The full 'About this trip' story" />
          </div>

          {/* Lists */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Highlights (one per line)</label>
              <textarea rows={4} className={inputClass} value={form.highlights} onChange={(e) => set("highlights", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Included (one per line)</label>
              <textarea rows={4} className={inputClass} value={form.inclusions} onChange={(e) => set("inclusions", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Excluded (one per line)</label>
              <textarea rows={4} className={inputClass} value={form.exclusions} onChange={(e) => set("exclusions", e.target.value)} />
            </div>
          </div>

          {/* Branding */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Tag Label</label>
              <input className={inputClass} value={form.tag} onChange={(e) => set("tag", e.target.value)} placeholder="SUNDARONE TRIBE" />
            </div>
            <div>
              <label className={labelClass}>Tag Color</label>
              <input type="color" className="w-full h-[42px] rounded-xl border border-gray-200 cursor-pointer" value={form.tagColor} onChange={(e) => set("tagColor", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Accent Color</label>
              <input type="color" className="w-full h-[42px] rounded-xl border border-gray-200 cursor-pointer" value={form.accentColor} onChange={(e) => set("accentColor", e.target.value)} />
            </div>
          </div>

          {/* Status + registration toggle */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-4 rounded-xl" style={{ background: "#FFFBF5", border: "1px solid #FFE4CC" }}>
            <div className="flex items-center gap-4">
              <div>
                <label className={labelClass}>Trip Status</label>
                <select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer flex-shrink-0">
              <span className="text-sm font-semibold text-gray-700">Registrations {form.registrationOpen ? "Open" : "Closed"}</span>
              <button
                type="button"
                onClick={() => set("registrationOpen", !form.registrationOpen)}
                className="relative w-12 h-7 rounded-full transition-colors flex-shrink-0"
                style={{ background: form.registrationOpen ? "#10b981" : "#d1d5db" }}
              >
                <span
                  className="absolute top-1 w-5 h-5 rounded-full bg-white transition-transform shadow-sm"
                  style={{ transform: form.registrationOpen ? "translateX(22px)" : "translateX(4px)" }}
                />
              </button>
            </label>
          </div>

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
              {saving ? "Saving..." : trip ? "Save Changes" : "Create Trip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
