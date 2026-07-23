"use client";

import { useState } from "react";
import type { ItineraryTrack } from "@/lib/data/trips";

interface Props {
  tracks: ItineraryTrack[];
  accentColor: string;
}

export default function TripDetailClient({ tracks, accentColor }: Props) {
  const [selected, setSelected] = useState(0);
  const track = tracks[selected];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-8 border border-gray-100 mb-5 sm:mb-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-5" style={{ fontFamily: "'Clash Display', sans-serif" }}>
        Choose Your Track
      </h2>

      {/* Tab buttons */}
      <div className="flex gap-2 mb-5 sm:mb-6 flex-wrap">
        {tracks.map((t, i) => (
          <button
            key={t.name}
            onClick={() => setSelected(i)}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200"
            style={
              i === selected
                ? { background: accentColor, color: "#fff" }
                : { background: "#F3F4F6", color: "#374151" }
            }
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Track detail */}
      <div className="rounded-2xl p-4 sm:p-5 border" style={{ borderColor: "#E5E7EB", background: "#FAFAFA" }}>
        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest mb-2 sm:mb-3" style={{ color: accentColor }}>
          {track.tagline}
        </p>
        <ul className="space-y-2 sm:space-y-2.5">
          {track.highlights.map((h) => (
            <li key={h} className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-gray-700">
              <span
                className="mt-0.5 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-white"
                style={{ background: accentColor }}
              >
                →
              </span>
              {h}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
