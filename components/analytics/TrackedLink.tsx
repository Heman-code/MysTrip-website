"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { trackEvent } from "@/lib/analytics";

// Thin wrapper so server components can fire a tracked click without
// needing to become client components themselves.
interface Props extends ComponentProps<typeof Link> {
  eventName: string;
  eventParams?: Record<string, unknown>;
}

export default function TrackedLink({ eventName, eventParams, onClick, ...props }: Props) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        trackEvent(eventName, eventParams);
        onClick?.(e);
      }}
    />
  );
}
