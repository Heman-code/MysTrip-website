"use client";

import { sendGAEvent } from "@next/third-parties/google";

type EventParams = Record<string, unknown>;

// sendGAEvent silently warns (never throws) if GA hasn't loaded yet, so this
// is always safe to call even before the Measurement ID is configured.
export function trackEvent(name: string, params?: EventParams) {
  sendGAEvent("event", name, params ?? {});
}

// Ties all events in this browser to a stable user id once someone is
// logged in, so their journey stays connected across sessions/devices.
export function setAnalyticsUser(userId: string | null) {
  sendGAEvent("set", { user_id: userId ?? "" });
}

export function trackPurchase(params: {
  transaction_id: string;
  value: number;
  items: { item_id: string; item_name: string; price: number }[];
}) {
  trackEvent("purchase", { currency: "INR", ...params });
}
