export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371;
// v1 simplification — haversine distance / a fixed average speed, no live
// traffic data. Known limitation for Jaipur's old-city one-ways; see plan.
const AVG_SPEED_KMH = 20;

export function haversineDistanceKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_KM * c;
}

export function travelTimeMinutes(a: LatLng, b: LatLng): number {
  const km = haversineDistanceKm(a, b);
  return Math.round((km / AVG_SPEED_KMH) * 60);
}
