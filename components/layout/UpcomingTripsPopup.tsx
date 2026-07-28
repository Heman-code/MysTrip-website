"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { X, ArrowRight } from "lucide-react";
import type { TripCardData } from "@/lib/db/trips";
import { trackEvent } from "@/lib/analytics";

const SESSION_KEY = "mystrip-popup-shown-v1";
const ALLOWED_PATHS = ["/", "/trips", "/sundarone", "/about", "/blog"];

function daysAway(startDate: string) {
  const ms = new Date(startDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(ms / 86400000);
}

export default function UpcomingTripsPopup({ trips }: { trips: TripCardData[] }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trips.length === 0) return;
    if (!ALLOWED_PATHS.includes(pathname)) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const timer = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem(SESSION_KEY, "1");
      trackEvent("popup_shown", { trip_count: trips.length, path: pathname });
    }, 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    trackEvent("popup_dismissed");
    setVisible(false);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)" }}
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "popupIn 0.35s cubic-bezier(0.16,1,0.3,1)" }}
      >
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
          aria-label="Close"
        >
          <X size={16} className="text-white" />
        </button>

        <div className="px-6 pt-6 pb-4" style={{ background: "#0B1210" }}>
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest"
            style={{ background: "rgba(255,96,22,0.15)", color: "#FF6016", border: "1px solid rgba(255,96,22,0.25)" }}
          >
            Spots filling up
          </span>
          <h2
            className="text-xl font-bold text-white mt-2.5"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            Your next adventure is calling
          </h2>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            Here&apos;s what&apos;s coming up next for the tribe.
          </p>
        </div>

        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {trips.map((trip, index) => {
            const seatsLeft = Math.max(0, trip.maxSlots - trip.bookedSlots);
            const days = daysAway(trip.startDate);
            return (
              <Link
                key={trip.id}
                href={`/trips/${trip.slug}`}
                onClick={() => {
                  trackEvent("popup_trip_click", { trip_slug: trip.slug, trip_title: trip.title, position: index });
                  setVisible(false);
                }}
                className="group flex gap-3 items-center rounded-2xl border border-gray-100 p-2.5 hover:border-gray-200 hover:shadow-md transition-all"
              >
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  <Image src={trip.coverImage} alt={trip.title} fill className="object-cover" sizes="80px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900 truncate">{trip.title}</p>
                  <p className="text-xs text-gray-400 truncate">{trip.destination}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,96,22,0.1)", color: "#FF6016" }}>
                      {days <= 0 ? "Today" : `${days}d to go`}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: seatsLeft <= 5 ? "rgba(239,68,68,0.1)" : "#f1f5f9", color: seatsLeft <= 5 ? "#ef4444" : "#64748b" }}>
                      {seatsLeft > 0 ? `${seatsLeft} spots left` : "Sold out"}
                    </span>
                  </div>
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </Link>
            );
          })}
        </div>

        <div className="px-4 pb-4">
          <Link
            href="/trips"
            onClick={() => {
              trackEvent("popup_browse_all_click");
              setVisible(false);
            }}
            className="block text-center text-xs font-semibold py-2.5 rounded-xl transition-colors hover:bg-gray-50"
            style={{ color: "#64748b" }}
          >
            Browse all trips →
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes popupIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
