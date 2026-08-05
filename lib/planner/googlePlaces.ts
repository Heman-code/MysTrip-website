// Maps Google Places API (New, v1) Place Details into our POI's
// Google-sourced fields only. Deliberately excludes photos: Places Photo
// media URLs embed the API key in the URL itself, so storing/serving one
// directly to the browser would leak a server credential. Downloading
// photos to owned storage is a separate, not-yet-decided piece of infra
// (see the plan's open risks) — until then, photos stay manually entered.

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

interface GooglePeriod {
  open: { day: number; hour: number; minute: number };
  close?: { day: number; hour: number; minute: number };
}

interface GooglePlaceDetailsResponse {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  regularOpeningHours?: { periods: GooglePeriod[] };
  rating?: number;
}

export interface MappedPlace {
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  openingHours: Record<string, { open: string; close: string }[]>;
  googleRating: number | null;
  googlePlaceId: string;
}

const FIELD_MASK = "id,displayName,formattedAddress,location,regularOpeningHours,rating";

export async function fetchPlaceDetails(placeId: string, apiKey: string): Promise<GooglePlaceDetailsResponse> {
  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Places API error ${res.status} for ${placeId}: ${body.slice(0, 300)}`);
  }
  return res.json();
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function mapOpeningHours(periods: GooglePeriod[] | undefined): Record<string, { open: string; close: string }[]> {
  const hours: Record<string, { open: string; close: string }[]> = Object.fromEntries(DAY_KEYS.map((d) => [d, []]));
  if (!periods) return hours;
  for (const period of periods) {
    if (!period.close) continue; // open 24h — skip rather than guess; admin sets it manually
    const dayKey = DAY_KEYS[period.open.day];
    hours[dayKey].push({
      open: `${pad(period.open.hour)}:${pad(period.open.minute)}`,
      close: `${pad(period.close.hour)}:${pad(period.close.minute)}`,
    });
  }
  return hours;
}

export function mapPlaceDetails(place: GooglePlaceDetailsResponse): MappedPlace {
  return {
    name: place.displayName?.text ?? "Untitled Place",
    address: place.formattedAddress ?? null,
    latitude: place.location?.latitude ?? 0,
    longitude: place.location?.longitude ?? 0,
    openingHours: mapOpeningHours(place.regularOpeningHours?.periods),
    googleRating: place.rating ?? null,
    googlePlaceId: place.id,
  };
}
