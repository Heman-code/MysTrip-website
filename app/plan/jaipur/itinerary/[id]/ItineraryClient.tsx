"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { Clock, MapPin, AlertTriangle, Check, X, Navigation, Loader2, Lightbulb, Route, ExternalLink, Info } from "lucide-react";
import type { PoiCardData } from "@/lib/db/pois";
import type { EarlierStartRecommendation, StartTimeAdjustment } from "@/lib/planner/itinerary";
import { parseTime } from "@/lib/planner/sequence";

interface StopEntry {
  stopId: string;
  poiId: string;
  status: string; // "pending" | "visited" | "skipped"
  sequenceOrder: number;
  plannedArrival: string | null;
  plannedDeparture: string | null;
  poi: PoiCardData;
}

interface Props {
  itineraryId: string;
  planDate: string;
  initialStops: StopEntry[];
  initialInfeasibleNames: string[];
  initialRecommendation: EarlierStartRecommendation | null;
  initialStartTimeAdjusted: StartTimeAdjustment | null;
  initialTravelTimesSource: "live" | "estimated" | null;
  startLat: number | null;
  startLng: number | null;
}

type GeoStatus = "idle" | "pending" | "granted" | "denied" | "unsupported";

function nowTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// Real turn-by-turn, traffic-aware driving directions live in Google's own
// app — replicating that ourselves means enabling and paying for the
// Directions API for something we'd never match anyway (live traffic, voice
// nav). This builds a free multi-stop Google Maps deep link instead:
// current location (or the saved start point) -> stop 1 -> stop 2 -> ...
function buildGoogleMapsUrl(
  scheduled: StopEntry[],
  startLat: number | null,
  startLng: number | null,
  liveCoords: { lat: number; lng: number } | null
): string | null {
  if (scheduled.length === 0) return null;

  const points = scheduled.map((s) => `${s.poi.latitude},${s.poi.longitude}`);
  const destination = points[points.length - 1];
  const waypoints = points.slice(0, -1);

  const params = new URLSearchParams({ api: "1", travelmode: "driving", destination });
  const origin = liveCoords
    ? `${liveCoords.lat},${liveCoords.lng}`
    : startLat !== null && startLng !== null
      ? `${startLat},${startLng}`
      : null;
  if (origin) params.set("origin", origin); // omitted entirely -> Google Maps uses live device location when opened
  if (waypoints.length > 0) params.set("waypoints", waypoints.join("|"));

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export default function ItineraryClient({ itineraryId, planDate, initialStops, initialInfeasibleNames, initialRecommendation, initialStartTimeAdjusted, initialTravelTimesSource, startLat, startLng }: Props) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [stops, setStops] = useState<StopEntry[]>(initialStops);
  const [infeasibleNames, setInfeasibleNames] = useState<string[]>(initialInfeasibleNames);
  const [recommendation, setRecommendation] = useState<EarlierStartRecommendation | null>(initialRecommendation);
  const [recommendationDismissed, setRecommendationDismissed] = useState(false);
  const [startTimeAdjusted, setStartTimeAdjusted] = useState<StartTimeAdjustment | null>(initialStartTimeAdjusted);
  const [travelTimesSource, setTravelTimesSource] = useState<"live" | "estimated" | null>(initialTravelTimesSource);
  const [resequencing, setResequencing] = useState(false);
  const [busyStopId, setBusyStopId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [manualNearPoiId, setManualNearPoiId] = useState("");

  const pending = stops.filter((s) => s.status === "pending");
  const scheduled = pending.filter((s) => s.plannedArrival).sort((a, b) => a.sequenceOrder - b.sequenceOrder);
  const unscheduled = pending.filter((s) => !s.plannedArrival);
  const history = stops.filter((s) => s.status !== "pending");

  // Derived from the actual scheduled times (arrival[i+1] - departure[i]),
  // not a separate distance calculation — this is always consistent with
  // whatever the algorithm actually used (live Distance Matrix data when
  // available, haversine fallback otherwise), never a second, possibly
  // conflicting estimate sitting next to the real schedule.
  const legs = scheduled.slice(1).map((stop, i) => {
    const prev = scheduled[i];
    return { minutes: parseTime(stop.plannedArrival!) - parseTime(prev.plannedDeparture!) };
  });
  const totalTravelMinutes = legs.reduce((sum, l) => sum + l.minutes, 0);
  const totalVisitMinutes = scheduled.reduce((sum, s) => sum + s.poi.avgVisitDurationMinutes, 0);
  const googleMapsUrl = buildGoogleMapsUrl(scheduled, startLat, startLng, coords);

  useEffect(() => {
    if (!scriptLoaded || !mapDivRef.current || scheduled.length === 0) return;

    const map =
      mapRef.current ??
      new google.maps.Map(mapDivRef.current, {
        zoom: 13,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      });
    mapRef.current = map;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    polylineRef.current?.setMap(null);

    const bounds = new google.maps.LatLngBounds();
    scheduled.forEach(({ poi }, i) => {
      const position = { lat: poi.latitude, lng: poi.longitude };
      const marker = new google.maps.Marker({
        position,
        map,
        label: { text: String(i + 1), color: "#fff", fontWeight: "bold" },
        title: poi.name,
      });
      markersRef.current.push(marker);
      bounds.extend(position);
    });

    polylineRef.current = new google.maps.Polyline({
      path: scheduled.map(({ poi }) => ({ lat: poi.latitude, lng: poi.longitude })),
      geodesic: true,
      strokeColor: "#FF6016",
      strokeOpacity: 0.8,
      strokeWeight: 3,
      map,
    });

    map.fitBounds(bounds, 60);
  }, [scriptLoaded, scheduled]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("unsupported");
      return;
    }
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

  const locationOverride = () => {
    const currentTime = nowTime();
    if (coords) return { currentLat: coords.lat, currentLng: coords.lng, currentTime };
    if (manualNearPoiId) {
      const near = stops.find((s) => s.poiId === manualNearPoiId);
      if (near) return { currentLat: near.poi.latitude, currentLng: near.poi.longitude, currentTime };
    }
    return { currentTime };
  };

  const resequence = async (body?: Record<string, unknown>) => {
    setResequencing(true);
    setError("");
    try {
      const res = await fetch(`/api/itineraries/${itineraryId}/sequence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? locationOverride()),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't re-plan your day.");
        return;
      }
      const order: { poiId: string; arrival: string; departure: string }[] = data.order;
      const infeasibleIds: string[] = data.infeasible;

      setStops((prev) =>
        prev.map((s) => {
          if (s.status !== "pending") return s;
          const idx = order.findIndex((o) => o.poiId === s.poiId);
          if (idx >= 0) {
            return { ...s, sequenceOrder: idx, plannedArrival: order[idx].arrival, plannedDeparture: order[idx].departure };
          }
          return { ...s, plannedArrival: null, plannedDeparture: null };
        })
      );
      setInfeasibleNames(
        stops.filter((s) => s.status === "pending" && infeasibleIds.includes(s.poiId)).map((s) => s.poi.name)
      );
      setRecommendation(data.recommendation ?? null);
      setStartTimeAdjusted(data.startTimeAdjusted ?? null);
      setTravelTimesSource(data.travelTimesSource ?? null);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setResequencing(false);
    }
  };

  const applyRecommendedTime = async () => {
    if (!recommendation) return;
    setError("");
    setResequencing(true);
    try {
      const patchRes = await fetch(`/api/itineraries/${itineraryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime: recommendation.suggestedTime }),
      });
      if (!patchRes.ok) {
        const data = await patchRes.json().catch(() => ({}));
        setError(data.error ?? "Couldn't update your start time.");
        return;
      }
    } catch {
      setError("Network error. Please try again.");
      return;
    } finally {
      setResequencing(false);
    }
    await resequence({});
  };

  const markStop = async (stopId: string, status: "visited" | "skipped") => {
    setBusyStopId(stopId);
    setError("");
    try {
      const res = await fetch(`/api/itineraries/${itineraryId}/stops/${stopId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Couldn't update that stop.");
        return;
      }
      setStops((prev) => prev.map((s) => (s.stopId === stopId ? { ...s, status } : s)));
      await resequence();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusyStopId(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#F9F7F4" }}>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onReady={() => setScriptLoaded(true)}
      />

      {/* Header */}
      <div style={{ background: "#0B1210" }} className="pt-16 pb-6 sm:pt-20 sm:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <span
            className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest"
            style={{ background: "rgba(255,96,22,0.15)", color: "#FF6016", border: "1px solid rgba(255,96,22,0.25)" }}
          >
            Your Day in Jaipur
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-3" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            {new Date(`${planDate}T00:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </h1>
          <p className="text-sm text-white/50 mt-1">
            {scheduled.length} {scheduled.length === 1 ? "stop" : "stops"} left today. Mark a place visited or skip it and the rest of the day replans automatically.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 space-y-4">
          <div ref={mapDivRef} className="w-full h-[380px] sm:h-[500px] rounded-2xl overflow-hidden bg-gray-100 border border-gray-100" />

          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: "#0B1210" }}
            >
              <Navigation size={15} /> Open turn-by-turn route in Google Maps <ExternalLink size={13} />
            </a>
          )}

          {/* Re-plan-from-here controls */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Re-plan from where you are</p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={requestLocation}
                disabled={geoStatus === "pending"}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                {geoStatus === "pending" ? <Loader2 size={13} className="animate-spin" /> : <Navigation size={13} />}
                {geoStatus === "granted" ? "Location set" : "Use my location"}
              </button>
              <span className="text-xs text-gray-400">or</span>
              <select
                className="px-3 py-2 rounded-xl text-xs border border-gray-200 bg-white"
                value={manualNearPoiId}
                onChange={(e) => setManualNearPoiId(e.target.value)}
              >
                <option value="">I&apos;m near...</option>
                {stops.map((s) => (
                  <option key={s.poiId} value={s.poiId}>{s.poi.name}</option>
                ))}
              </select>
              <button
                onClick={() => resequence()}
                disabled={resequencing || pending.length === 0}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: "#FF6016" }}
              >
                {resequencing ? <Loader2 size={13} className="animate-spin" /> : null}
                Replan now
              </button>
            </div>
            {geoStatus === "denied" && (
              <p className="text-xs text-gray-400 mt-2">Location access denied — use the &quot;I&apos;m near...&quot; picker instead.</p>
            )}
            {geoStatus === "unsupported" && (
              <p className="text-xs text-gray-400 mt-2">Location isn&apos;t available on this device — use the &quot;I&apos;m near...&quot; picker instead.</p>
            )}
          </div>
        </div>

        {/* Ordered stop list */}
        <div className="space-y-4">
          {startTimeAdjusted && (
            <div className="rounded-2xl border p-4 flex gap-3" style={{ borderColor: "#E5E7EB", background: "#F9FAFB" }}>
              <Info size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600">
                It&apos;s already past {startTimeAdjusted.from} today, so we&apos;ve planned your day starting from now ({startTimeAdjusted.to}) instead.
              </p>
            </div>
          )}

          {recommendation && !recommendationDismissed && (
            <div className="rounded-2xl border p-4 flex gap-3" style={{ borderColor: "#BFDBFE", background: "#EFF6FF" }}>
              <Lightbulb size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">Consider starting earlier</p>
                <p className="text-xs text-gray-600 mt-1">{recommendation.reason}</p>
                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    onClick={applyRecommendedTime}
                    disabled={resequencing}
                    className="px-3 py-1.5 rounded-full text-[11px] font-bold text-white disabled:opacity-50"
                    style={{ background: "#2563eb" }}
                  >
                    Use {recommendation.suggestedTime} instead
                  </button>
                  <button
                    onClick={() => setRecommendationDismissed(true)}
                    className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-gray-500 hover:bg-white/60"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {scheduled.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center gap-4 text-xs flex-wrap">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Route size={13} /> {totalTravelMinutes} min travel
                </div>
                <div className="text-gray-300">·</div>
                <div className="text-gray-500">{totalVisitMinutes} min visiting</div>
                <div className="text-gray-300">·</div>
                <div className="text-gray-500">
                  {scheduled[0].plannedArrival} → {scheduled[scheduled.length - 1].plannedDeparture}
                </div>
              </div>
              {travelTimesSource && (
                <p className="text-[10px] text-gray-400 mt-1.5">
                  {travelTimesSource === "live" ? "Travel times: real road data from Google" : "Travel times: estimated (live data unavailable)"}
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm bg-red-50 border border-red-100 text-red-600">⚠ {error}</div>
          )}

          {infeasibleNames.length > 0 && (
            <div className="rounded-2xl border p-4 flex gap-3" style={{ borderColor: "#FFE4CC", background: "#FFFBF5" }}>
              <AlertTriangle size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Couldn&apos;t fit everything today</p>
                <p className="text-xs text-gray-500 mt-1">
                  {infeasibleNames.join(", ")} couldn&apos;t be scheduled — closing hours or a fixed event window didn&apos;t leave room. Remove one from your shortlist or plan it for another day.
                </p>
              </div>
            </div>
          )}
          {unscheduled.length > 0 && infeasibleNames.length === 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-4 text-xs text-gray-400">
              {unscheduled.length} shortlisted place(s) aren&apos;t scheduled yet.
            </div>
          )}

          <div className="space-y-3">
            {scheduled.map(({ stopId, poi, plannedArrival, plannedDeparture }, i) => (
              <div key={stopId}>
              <div className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: "#FF6016" }}
                >
                  {i + 1}
                </div>
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image src={poi.coverImage} alt={poi.name} fill className="object-cover" sizes="56px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{poi.name}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock size={10} /> {plannedArrival} – {plannedDeparture}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {poi.category}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => markStop(stopId, "visited")}
                      disabled={busyStopId === stopId}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-white disabled:opacity-50"
                      style={{ background: "#10b981" }}
                    >
                      <Check size={11} /> Visited
                    </button>
                    <button
                      onClick={() => markStop(stopId, "skipped")}
                      disabled={busyStopId === stopId}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <X size={11} /> Skip
                    </button>
                  </div>
                </div>
              </div>
              {i < legs.length && (
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 pl-4 py-1.5">
                  <Route size={11} />
                  {legs[i].minutes} min to next stop
                </div>
              )}
              </div>
            ))}
          </div>

          {history.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Earlier today</p>
              <div className="space-y-1.5">
                {history.map((s) => (
                  <div key={s.stopId} className="flex items-center gap-2 text-xs text-gray-500 bg-white rounded-xl border border-gray-100 px-3 py-2">
                    {s.status === "visited" ? (
                      <Check size={12} className="text-emerald-500 flex-shrink-0" />
                    ) : (
                      <X size={12} className="text-gray-300 flex-shrink-0" />
                    )}
                    <span className="truncate">{s.poi.name}</span>
                    <span className="ml-auto text-[10px] uppercase tracking-wide text-gray-300">{s.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link
            href="/plan/jaipur"
            className="block text-center px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-all"
          >
            ← Back to the map
          </Link>
        </div>
      </div>
    </div>
  );
}
