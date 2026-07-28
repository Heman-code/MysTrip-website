"use client";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

type EventParams = Record<string, unknown>;

// Pushes straight onto window.dataLayer — the same array gtag.js itself
// drains once it loads. This works even before gtag.js has finished
// loading (events just queue up), so it's safe regardless of how late the
// script tag is deferred, and doesn't depend on any particular loader
// component having already run.
function push(...args: unknown[]) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

export function trackEvent(name: string, params?: EventParams) {
  push("event", name, params ?? {});
}

// Ties all events in this browser to a stable user id once someone is
// logged in, so their journey stays connected across sessions/devices.
export function setAnalyticsUser(userId: string | null) {
  push("set", { user_id: userId ?? "" });
}

export function trackPurchase(params: {
  transaction_id: string;
  value: number;
  items: { item_id: string; item_name: string; price: number }[];
}) {
  trackEvent("purchase", { currency: "INR", ...params });
}
