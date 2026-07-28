"use client";

import { useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { setAnalyticsUser } from "@/lib/analytics";

function AnalyticsUserBinding() {
  const { data: session, status } = useSession();
  useEffect(() => {
    if (status === "authenticated") {
      setAnalyticsUser(session.user?.id ?? null);
    } else if (status === "unauthenticated") {
      setAnalyticsUser(null);
    }
  }, [status, session]);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AnalyticsUserBinding />
      {children}
    </SessionProvider>
  );
}
