import type { LatLng } from "./geo";

interface DistanceMatrixElement {
  status: string;
  duration?: { value: number }; // seconds
}

interface DistanceMatrixResponse {
  status: string;
  rows: { elements: DistanceMatrixElement[] }[];
}

function key(a: LatLng, b: LatLng): string {
  return `${a.lat},${a.lng}|${b.lat},${b.lng}`;
}

// One batched request for the full point-to-point grid — the sequencing
// algorithm reuses these same pairwise times across every permutation it
// tries, so this is called once per itinerary build/re-plan, not once per
// permutation. Real road distance/duration (no live traffic — that's the
// pricier "Advanced" tier, not needed for a v1 accuracy fix).
export async function fetchDistanceMatrixMinutes(points: LatLng[], apiKey: string): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  if (points.length < 2) return result;

  const coords = points.map((p) => `${p.lat},${p.lng}`).join("|");
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(coords)}&destinations=${encodeURIComponent(coords)}&mode=driving&key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Distance Matrix API error ${res.status}`);
  }
  const data: DistanceMatrixResponse = await res.json();
  if (data.status !== "OK") {
    throw new Error(`Distance Matrix API status: ${data.status}`);
  }

  for (let i = 0; i < data.rows.length; i++) {
    const elements = data.rows[i].elements;
    for (let j = 0; j < elements.length; j++) {
      if (i === j) continue;
      const el = elements[j];
      if (el.status === "OK" && el.duration) {
        result.set(key(points[i], points[j]), Math.round(el.duration.value / 60));
      }
      // Missing/failed pairs (ZERO_RESULTS etc.) are simply omitted — the
      // caller falls back to the haversine estimate for just that pair.
    }
  }

  return result;
}

export function buildMatrixLookup(matrix: Map<string, number>, fallback: (a: LatLng, b: LatLng) => number) {
  return (a: LatLng, b: LatLng): number => matrix.get(key(a, b)) ?? fallback(a, b);
}
