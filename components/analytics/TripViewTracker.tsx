"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export default function TripViewTracker({
  slug,
  title,
  destination,
  price,
}: {
  slug: string;
  title: string;
  destination: string;
  price: number;
}) {
  useEffect(() => {
    trackEvent("view_item", {
      currency: "INR",
      value: price,
      items: [{ item_id: slug, item_name: title, price }],
      destination,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return null;
}
