"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import Image from "next/image";
import { X, MapPin, Plus, Check } from "lucide-react";
import type { PoiCardData } from "@/lib/db/pois";
import StartItineraryModal from "./StartItineraryModal";

interface ShortlistStop {
  id: string;
  poiId: string;
}

interface Props {
  pois: PoiCardData[];
  itineraryId: string;
  initialStops: ShortlistStop[];
}

const JAIPUR_CENTER = { lat: 26.9124, lng: 75.7873 };
const MAX_STOPS = 8;

const PIN_DEFAULT = "#01574A";
const PIN_SHORTLISTED = "#FF6016";

function pinIcon(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40"><path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.7 23.3 0 15 0z" fill="${color}"/><circle cx="15" cy="15" r="6" fill="white"/></svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function userLocationIcon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="#4285F4" stroke="white" stroke-width="3"/></svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

export default function JaipurMapClient({ pois, itineraryId, initialStops }: Props) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const userCircleRef = useRef<google.maps.Circle | null>(null);

  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [stops, setStops] = useState<ShortlistStop[]>(initialStops);
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);
  const [busyPoiId, setBusyPoiId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showStartModal, setShowStartModal] = useState(false);

  const shortlistedPoiIds = new Set(stops.map((s) => s.poiId));
  const selectedPoi = pois.find((p) => p.id === selectedPoiId) ?? null;

  // Init map once the script has loaded.
  useEffect(() => {
    if (!scriptLoaded || !mapDivRef.current || mapRef.current) return;
    mapRef.current = new google.maps.Map(mapDivRef.current, {
      center: JAIPUR_CENTER,
      zoom: 12,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
    });
  }, [scriptLoaded]);

  // Silently ask for the traveler's position so they can see it relative to
  // the pins — informational only, so no permission-prompt button and no
  // error banner if it's denied or unavailable.
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      () => {},
      { timeout: 8000 }
    );
  }, []);

  // Draw/update the "you are here" marker once the map and a location are both ready.
  useEffect(() => {
    if (!scriptLoaded || !mapRef.current || !userLocation) return;
    const map = mapRef.current;
    const position = { lat: userLocation.lat, lng: userLocation.lng };

    if (!userMarkerRef.current) {
      userMarkerRef.current = new google.maps.Marker({
        position,
        map,
        icon: {
          url: userLocationIcon(),
          scaledSize: new google.maps.Size(20, 20),
          anchor: new google.maps.Point(10, 10),
        } as google.maps.Icon,
        title: "Your location",
        zIndex: 999,
      });
    } else {
      userMarkerRef.current.setPosition(position);
    }

    if (!userCircleRef.current) {
      userCircleRef.current = new google.maps.Circle({
        map,
        center: position,
        radius: userLocation.accuracy,
        fillColor: "#4285F4",
        fillOpacity: 0.15,
        strokeColor: "#4285F4",
        strokeOpacity: 0.3,
        strokeWeight: 1,
      });
    } else {
      userCircleRef.current.setCenter(position);
      userCircleRef.current.setRadius(userLocation.accuracy);
    }
  }, [scriptLoaded, userLocation]);

  // Place / refresh markers whenever the map is ready or the poi list changes.
  useEffect(() => {
    if (!scriptLoaded || !mapRef.current) return;
    const map = mapRef.current;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current.clear();

    for (const poi of pois) {
      const marker = new google.maps.Marker({
        position: { lat: poi.latitude, lng: poi.longitude },
        map,
        title: poi.name,
        icon: {
          url: pinIcon(shortlistedPoiIds.has(poi.id) ? PIN_SHORTLISTED : PIN_DEFAULT),
          scaledSize: new google.maps.Size(30, 40),
        } as google.maps.Icon,
      });
      marker.addListener("click", () => setSelectedPoiId(poi.id));
      markersRef.current.set(poi.id, marker);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptLoaded, pois]);

  // Recolor markers as the shortlist changes, without rebuilding them.
  useEffect(() => {
    markersRef.current.forEach((marker, poiId) => {
      marker.setIcon({
        url: pinIcon(shortlistedPoiIds.has(poiId) ? PIN_SHORTLISTED : PIN_DEFAULT),
        scaledSize: new google.maps.Size(30, 40),
      } as google.maps.Icon);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops]);

  const addToShortlist = async (poiId: string) => {
    setError("");
    setBusyPoiId(poiId);
    try {
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
      setStops((s) => [...s, { id: data.stop.id, poiId }]);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusyPoiId(null);
    }
  };

  const removeFromShortlist = async (poiId: string) => {
    const stop = stops.find((s) => s.poiId === poiId);
    if (!stop) return;
    setError("");
    setBusyPoiId(poiId);
    try {
      const res = await fetch(`/api/itineraries/${itineraryId}/stops/${stop.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Couldn't remove that place.");
        return;
      }
      setStops((s) => s.filter((st) => st.poiId !== poiId));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusyPoiId(null);
    }
  };

  const toggleShortlist = (poiId: string) => {
    if (shortlistedPoiIds.has(poiId)) {
      removeFromShortlist(poiId);
    } else if (stops.length >= MAX_STOPS) {
      setError(`You can shortlist up to ${MAX_STOPS} places for one day.`);
    } else {
      addToShortlist(poiId);
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
            AI Trip Planner · Jaipur
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-3" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Pick the places you want to see
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Tap a pin for a quick look, then shortlist your favorites. {stops.length}/{MAX_STOPS} shortlisted.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 relative">
          <div ref={mapDivRef} className="w-full h-[420px] sm:h-[560px] rounded-2xl overflow-hidden bg-gray-100 border border-gray-100" />

          {pois.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="bg-white/90 rounded-xl px-4 py-3 text-sm text-gray-500 shadow">
                No places added yet — check back soon.
              </p>
            </div>
          )}

          {/* Selected POI preview card */}
          {selectedPoi && (
            <div className="absolute left-3 right-3 bottom-3 sm:left-4 sm:right-auto sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="relative h-32 w-full bg-gray-100">
                <Image src={selectedPoi.coverImage} alt={selectedPoi.name} fill className="object-cover" sizes="320px" />
                <button
                  onClick={() => setSelectedPoiId(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="p-4">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase tracking-wide">
                  {selectedPoi.category}
                </span>
                <h3 className="font-bold text-gray-900 mt-1.5" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  {selectedPoi.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{selectedPoi.shortDescription}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Link
                    href={`/plan/jaipur/poi/${selectedPoi.slug}`}
                    className="flex-1 text-center px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 hover:bg-gray-50 transition-all"
                  >
                    View details
                  </Link>
                  <button
                    onClick={() => toggleShortlist(selectedPoi.id)}
                    disabled={busyPoiId === selectedPoi.id}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: shortlistedPoiIds.has(selectedPoi.id) ? "#10b981" : "#FF6016" }}
                  >
                    {shortlistedPoiIds.has(selectedPoi.id) ? <Check size={13} /> : <Plus size={13} />}
                    {shortlistedPoiIds.has(selectedPoi.id) ? "Shortlisted" : "Shortlist"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Shortlist drawer */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 h-fit">
          <h2 className="font-bold text-gray-900 mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Your shortlist
          </h2>
          <p className="text-xs text-gray-400 mb-4">{stops.length}/{MAX_STOPS} places · pick 5-6 for a comfortable day</p>

          {error && (
            <div className="px-3 py-2 rounded-xl text-xs bg-red-50 border border-red-100 text-red-600 mb-3">⚠ {error}</div>
          )}

          {stops.length === 0 && (
            <p className="text-sm text-gray-400">Tap pins on the map to add places here.</p>
          )}

          <div className="space-y-2">
            {stops.map((stop) => {
              const poi = pois.find((p) => p.id === stop.poiId);
              if (!poi) return null;
              return (
                <div key={stop.id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-2.5">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image src={poi.coverImage} alt={poi.name} fill className="object-cover" sizes="48px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{poi.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin size={10} /> {poi.category}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromShortlist(poi.id)}
                    disabled={busyPoiId === poi.id}
                    className="p-1.5 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0 disabled:opacity-50"
                    aria-label={`Remove ${poi.name}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          {stops.length === 0 ? (
            <button
              disabled
              title="Shortlist at least one place first"
              className="w-full mt-5 px-4 py-3 rounded-xl text-sm font-bold text-white opacity-50 cursor-not-allowed"
              style={{ background: "#FF6016" }}
            >
              Build my itinerary
            </button>
          ) : (
            <button
              onClick={() => setShowStartModal(true)}
              className="block w-full mt-5 px-4 py-3 rounded-xl text-sm font-bold text-white text-center transition-all hover:opacity-90"
              style={{ background: "#FF6016" }}
            >
              Build my itinerary
            </button>
          )}
        </div>
      </div>

      {showStartModal && (
        <StartItineraryModal
          itineraryId={itineraryId}
          shortlistedPois={pois.filter((p) => shortlistedPoiIds.has(p.id))}
          onClose={() => setShowStartModal(false)}
        />
      )}
    </div>
  );
}
