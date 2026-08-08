"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import type { TripCardData } from "@/lib/db/trips";
import { trackEvent } from "@/lib/analytics";

const SESSION_KEY = "mystrip-bar-dismissed-v1";
const HIDDEN_PREFIXES = ["/admin", "/auth", "/dashboard", "/trips/"];

function daysAway(startDate: string) {
  const ms = new Date(startDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(ms / 86400000);
}

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return !!sessionStorage.getItem(SESSION_KEY);
}

function getServerSnapshot() {
  return true; // stay hidden until hydrated, so we never flash the bar for a user who already dismissed it
}

export default function StickyTripBar({ trip }: { trip: TripCardData | null }) {
  const pathname = usePathname();
  const dismissedInStorage = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [closedThisSession, setClosedThisSession] = useState(false);
  const dismissed = dismissedInStorage || closedThisSession;
  const shownRef = useRef(false);

  const hidden =
    !trip ||
    HIDDEN_PREFIXES.some((p) => pathname.startsWith(p)) ||
    dismissed ||
    (trip ? trip.maxSlots - trip.bookedSlots <= 0 : true);

  useEffect(() => {
    if (!hidden && trip && !shownRef.current) {
      shownRef.current = true;
      trackEvent("sticky_bar_shown", { trip_slug: trip.slug });
    }
  }, [hidden, trip]);

  if (!trip || hidden) return null;

  const seatsLeft = Math.max(0, trip.maxSlots - trip.bookedSlots);
  const days = daysAway(trip.startDate);

  const close = () => {
    trackEvent("sticky_bar_dismissed", { trip_slug: trip.slug });
    sessionStorage.setItem(SESSION_KEY, "1");
    setClosedThisSession(true);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 text-white"
      style={{ background: "#0B1210", borderTop: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 flex items-center gap-2 sm:gap-4">
        <span
          className="hidden sm:inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest flex-shrink-0"
          style={{ background: "rgba(255,96,22,0.15)", color: "#FF6016", border: "1px solid rgba(255,96,22,0.25)" }}
        >
          Next up
        </span>
        <p className="flex-1 min-w-0 text-xs sm:text-sm font-semibold truncate">
          {trip.title}
          <span className="font-normal hidden sm:inline" style={{ color: "rgba(255,255,255,0.4)" }}>
            {" "}· {trip.destination}
          </span>
        </p>
        <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap flex-shrink-0" style={{ color: seatsLeft <= 5 ? "#ef4444" : "#FFB001" }}>
          {seatsLeft} spot{seatsLeft === 1 ? "" : "s"} left
        </span>
        <span className="hidden xs:inline text-[10px] sm:text-xs whitespace-nowrap flex-shrink-0" style={{ color: "rgba(255,255,255,0.4)" }}>
          · {days <= 0 ? "Today" : `${days}d left`}
        </span>
        <Link
          href={`/trips/${trip.slug}`}
          onClick={() => trackEvent("sticky_bar_click", { trip_slug: trip.slug })}
          aria-label={`Register for ${trip.title}`}
          className="flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold text-white flex-shrink-0 transition-opacity hover:opacity-90"
          style={{ background: "#FF6016" }}
        >
          <span className="hidden sm:inline" aria-hidden="true">Register</span>
          <ArrowRight size={13} />
        </Link>
        <button onClick={close} className="p-1 rounded-full hover:bg-white/10 transition-colors flex-shrink-0" aria-label="Dismiss">
          <X size={15} style={{ color: "rgba(255,255,255,0.5)" }} />
        </button>
      </div>
    </div>
  );
}
