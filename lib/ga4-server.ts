import { randomUUID } from "crypto";

// Server-side conversion tracking via GA4's Measurement Protocol. Used for
// events that happen with no browser present (e.g. an admin confirming a
// registration) or that must not be lost to ad-blockers. Silently no-ops
// until GA4_MEASUREMENT_ID + GA4_API_SECRET are configured.
export async function sendServerEvent(
  clientId: string | null | undefined,
  name: string,
  params: Record<string, unknown>
) {
  const measurementId = process.env.GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;
  if (!measurementId || !apiSecret) return;

  try {
    await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: "POST",
        body: JSON.stringify({
          client_id: clientId || randomUUID(),
          events: [{ name, params }],
        }),
      }
    );
  } catch {
    // Analytics must never break the request it's attached to.
  }
}

// Reads the GA client id out of the standard `_ga` cookie (format
// `GA1.1.<clientIdPart1>.<clientIdPart2>`) so a later server-side event can
// be attributed to the same session the browser-side events belong to.
export function extractGaClientId(gaCookie: string | undefined | null): string | null {
  if (!gaCookie) return null;
  const parts = gaCookie.split(".");
  if (parts.length < 4) return null;
  return `${parts[2]}.${parts[3]}`;
}
