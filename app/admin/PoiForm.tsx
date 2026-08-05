"use client";

import { useState } from "react";
import { X, Plus, Trash2, RefreshCw } from "lucide-react";
import type { AdminPoiRow, AdminSpecialEventRow } from "./AdminClient";

interface Props {
  poi: AdminPoiRow | null;
  onClose: () => void;
  onSaved: (poi: AdminPoiRow) => void;
}

const CATEGORIES = [
  { value: "fort", label: "Fort" },
  { value: "palace", label: "Palace" },
  { value: "temple", label: "Temple" },
  { value: "market", label: "Market" },
  { value: "lake", label: "Lake" },
  { value: "museum", label: "Museum" },
  { value: "garden", label: "Garden" },
  { value: "viewpoint", label: "Viewpoint" },
  { value: "food", label: "Food" },
  { value: "other", label: "Other" },
];

const DAYS = [
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
  { value: "sat", label: "Sat" },
  { value: "sun", label: "Sun" },
];

type DayHours = { open: string; close: string };
type OpeningHours = Record<string, DayHours[]>;

const EMPTY_HOURS: OpeningHours = Object.fromEntries(DAYS.map((d) => [d.value, []]));

function toLines(arr: string[] | undefined | null) {
  return (arr ?? []).join("\n");
}
function fromLines(text: string) {
  return text.split("\n").map((l) => l.trim()).filter(Boolean);
}

let eventKeySeq = 0;
function newEventDraft(): AdminSpecialEventRow & { key: number } {
  return { key: eventKeySeq++, name: "", description: "", daysOfWeek: [], startTime: "", endTime: "", isMustSee: true };
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl text-sm text-gray-800 outline-none border border-gray-200 focus:border-orange-400 transition-colors bg-white";
const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

export default function PoiForm({ poi, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    citySlug: poi?.citySlug ?? "jaipur",
    name: poi?.name ?? "",
    category: poi?.category ?? "other",
    latitude: poi?.latitude?.toString() ?? "",
    longitude: poi?.longitude?.toString() ?? "",
    address: poi?.address ?? "",
    shortDescription: poi?.shortDescription ?? "",
    longDescription: poi?.longDescription ?? "",
    interestTags: toLines(poi?.interestTags),
    coverImage: poi?.coverImage ?? "",
    avgVisitDurationMinutes: poi?.avgVisitDurationMinutes?.toString() ?? "60",
    isActive: poi?.isActive ?? true,
  });
  const [entryFees, setEntryFees] = useState({
    adult: poi?.entryFees?.adult?.toString() ?? "",
    student: poi?.entryFees?.student?.toString() ?? "",
    child: poi?.entryFees?.child?.toString() ?? "",
    foreigner: poi?.entryFees?.foreigner?.toString() ?? "",
    foreignerStudent: poi?.entryFees?.foreignerStudent?.toString() ?? "",
  });
  const [hours, setHours] = useState<OpeningHours>(poi?.openingHours ?? EMPTY_HOURS);
  const [events, setEvents] = useState<(AdminSpecialEventRow & { key: number })[]>(
    (poi?.specialEvents ?? []).length > 0
      ? (poi!.specialEvents as AdminSpecialEventRow[]).map((e) => ({ ...e, key: eventKeySeq++ }))
      : []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState("");

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const refreshFromGoogle = async () => {
    if (!poi) return;
    setRefreshing(true);
    setRefreshError("");
    try {
      const res = await fetch(`/api/admin/pois/${poi.id}/refresh`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setRefreshError(data.error ?? "Refresh failed.");
        return;
      }
      setForm((f) => ({
        ...f,
        name: data.poi.name,
        address: data.poi.address ?? "",
        latitude: String(data.poi.latitude),
        longitude: String(data.poi.longitude),
      }));
      setHours(data.poi.openingHours ?? EMPTY_HOURS);
    } catch {
      setRefreshError("Network error.");
    } finally {
      setRefreshing(false);
    }
  };

  const setDayHours = (day: string, field: "open" | "close", value: string) => {
    setHours((h) => {
      const existing = h[day]?.[0] ?? { open: "", close: "" };
      const updated = { ...existing, [field]: value };
      const keep = updated.open || updated.close;
      return { ...h, [day]: keep ? [updated] : [] };
    });
  };

  const addEvent = () => setEvents((es) => [...es, newEventDraft()]);
  const removeEvent = (key: number) => setEvents((es) => es.filter((e) => e.key !== key));
  const updateEvent = <K extends keyof AdminSpecialEventRow>(key: number, field: K, value: AdminSpecialEventRow[K]) =>
    setEvents((es) => es.map((e) => (e.key === key ? { ...e, [field]: value } : e)));
  const toggleEventDay = (key: number, day: string) =>
    setEvents((es) =>
      es.map((e) =>
        e.key === key
          ? { ...e, daysOfWeek: e.daysOfWeek.includes(day) ? e.daysOfWeek.filter((d) => d !== day) : [...e.daysOfWeek, day] }
          : e
      )
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.latitude || !form.longitude) {
      setError("Please fill in name, latitude, and longitude.");
      return;
    }
    for (const ev of events) {
      if (!ev.name || !ev.startTime || !ev.endTime) {
        setError("Each special event needs a name, start time, and end time.");
        return;
      }
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        avgVisitDurationMinutes: Number(form.avgVisitDurationMinutes || 60),
        entryFees: {
          adult: entryFees.adult === "" ? undefined : Number(entryFees.adult),
          student: entryFees.student === "" ? undefined : Number(entryFees.student),
          child: entryFees.child === "" ? undefined : Number(entryFees.child),
          foreigner: entryFees.foreigner === "" ? undefined : Number(entryFees.foreigner),
          foreignerStudent: entryFees.foreignerStudent === "" ? undefined : Number(entryFees.foreignerStudent),
        },
        interestTags: fromLines(form.interestTags),
        openingHours: hours,
        specialEvents: events.map((ev) => ({
          name: ev.name,
          description: ev.description,
          daysOfWeek: ev.daysOfWeek,
          startTime: ev.startTime,
          endTime: ev.endTime,
          isMustSee: ev.isMustSee,
        })),
      };
      const url = poi ? `/api/admin/pois/${poi.id}` : "/api/admin/pois";
      const method = poi ? "PATCH" : "POST";
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
        id: poi?.id ?? data.poi.id,
        slug: poi?.slug ?? data.poi.slug,
        ...payload,
        photos: poi?.photos ?? [],
        googleRating: poi?.googleRating ?? null,
        source: poi?.source ?? "manual",
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
            {poi ? "Edit POI" : "Add New POI"}
          </h2>
          <div className="flex items-center gap-2">
            {poi?.source === "google_places" && (
              <button
                type="button"
                onClick={refreshFromGoogle}
                disabled={refreshing}
                title="Re-fetch name, address, coordinates, and hours from Google — leaves your curated fields untouched"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Refreshing..." : "Refresh from Google"}
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {refreshError && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-xl text-sm bg-red-50 border border-red-100 text-red-600">⚠ {refreshError}</div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Core fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Name *</label>
              <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Amer Fort" />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input className={inputClass} value={form.citySlug} onChange={(e) => set("citySlug", e.target.value)} placeholder="jaipur" />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Latitude *</label>
              <input className={inputClass} value={form.latitude} onChange={(e) => set("latitude", e.target.value)} placeholder="26.9855" />
            </div>
            <div>
              <label className={labelClass}>Longitude *</label>
              <input className={inputClass} value={form.longitude} onChange={(e) => set("longitude", e.target.value)} placeholder="75.8513" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Address</label>
              <input className={inputClass} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Devisinghpura, Amer, Jaipur" />
            </div>
            <div>
              <label className={labelClass}>Avg Visit Duration (min)</label>
              <input type="number" min="5" className={inputClass} value={form.avgVisitDurationMinutes} onChange={(e) => set("avgVisitDurationMinutes", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Cover Image URL</label>
              <input className={inputClass} value={form.coverImage} onChange={(e) => set("coverImage", e.target.value)} placeholder="/pois/amer-fort.jpg" />
            </div>
          </div>

          {/* Entry fees */}
          <div>
            <label className={labelClass}>Entry Fees (₹, leave blank if not applicable)</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {([
                { key: "adult", label: "Adult" },
                { key: "student", label: "Student" },
                { key: "child", label: "Child" },
                { key: "foreigner", label: "Foreigner" },
                { key: "foreignerStudent", label: "Foreigner Student" },
              ] as const).map((f) => (
                <div key={f.key}>
                  <label className="block text-[11px] text-gray-400 mb-1">{f.label}</label>
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    value={entryFees[f.key]}
                    onChange={(e) => setEntryFees((ef) => ({ ...ef, [f.key]: e.target.value }))}
                    placeholder="—"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className={labelClass}>Short Description (2 lines, shown on the map pin)</label>
            <textarea rows={2} maxLength={280} className={inputClass} value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} placeholder="A hilltop fort of sandstone and marble overlooking Maota Lake." />
          </div>
          <div>
            <label className={labelClass}>Full Description</label>
            <textarea rows={4} className={inputClass} value={form.longDescription} onChange={(e) => set("longDescription", e.target.value)} placeholder="The full story shown on the POI detail page" />
          </div>
          <div>
            <label className={labelClass}>Interest Tags (one per line)</label>
            <textarea rows={3} className={inputClass} value={form.interestTags} onChange={(e) => set("interestTags", e.target.value)} placeholder={"heritage\narchitecture\nsunset"} />
          </div>

          {/* Opening hours */}
          <div>
            <label className={labelClass}>Opening Hours</label>
            <div className="space-y-2 rounded-xl border border-gray-200 p-3">
              {DAYS.map((d) => (
                <div key={d.value} className="grid grid-cols-[3rem_1fr_1fr] items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">{d.label}</span>
                  <input
                    type="time"
                    className={inputClass}
                    value={hours[d.value]?.[0]?.open ?? ""}
                    onChange={(e) => setDayHours(d.value, "open", e.target.value)}
                  />
                  <input
                    type="time"
                    className={inputClass}
                    value={hours[d.value]?.[0]?.close ?? ""}
                    onChange={(e) => setDayHours(d.value, "close", e.target.value)}
                  />
                </div>
              ))}
              <p className="text-xs text-gray-400 pt-1">Leave both times blank for a day the POI is closed.</p>
            </div>
          </div>

          {/* Special events */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelClass + " mb-0"}>Special Events (fixed-time windows, e.g. an evening light show)</label>
              <button type="button" onClick={addEvent} className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700">
                <Plus size={13} /> Add Event
              </button>
            </div>
            {events.length === 0 && <p className="text-xs text-gray-400">No special events for this POI.</p>}
            <div className="space-y-3">
              {events.map((ev) => (
                <div key={ev.key} className="rounded-xl border border-gray-200 p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <input
                      className={inputClass}
                      value={ev.name}
                      onChange={(e) => updateEvent(ev.key, "name", e.target.value)}
                      placeholder="Evening Light & Sound Show"
                    />
                    <button type="button" onClick={() => removeEvent(ev.key)} className="p-2.5 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 flex-shrink-0">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="time" className={inputClass} value={ev.startTime} onChange={(e) => updateEvent(ev.key, "startTime", e.target.value)} />
                    <input type="time" className={inputClass} value={ev.endTime} onChange={(e) => updateEvent(ev.key, "endTime", e.target.value)} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => toggleEventDay(ev.key, d.value)}
                        className="px-2.5 py-1 rounded-full text-xs font-semibold transition-colors"
                        style={
                          ev.daysOfWeek.includes(d.value)
                            ? { background: "#FF6016", color: "#fff" }
                            : { background: "#f1f5f9", color: "#64748b" }
                        }
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">No days selected = every day.</p>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={ev.isMustSee} onChange={(e) => updateEvent(ev.key, "isMustSee", e.target.checked)} />
                    Must-see (algorithm prioritizes scheduling around this window)
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "#FFFBF5", border: "1px solid #FFE4CC" }}>
            <span className="text-sm font-semibold text-gray-700">{form.isActive ? "Active — visible on the map" : "Hidden"}</span>
            <button
              type="button"
              onClick={() => set("isActive", !form.isActive)}
              className="relative w-12 h-7 rounded-full transition-colors flex-shrink-0"
              style={{ background: form.isActive ? "#10b981" : "#d1d5db" }}
            >
              <span
                className="absolute top-1 w-5 h-5 rounded-full bg-white transition-transform shadow-sm"
                style={{ transform: form.isActive ? "translateX(22px)" : "translateX(4px)" }}
              />
            </button>
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
              {saving ? "Saving..." : poi ? "Save Changes" : "Create POI"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
