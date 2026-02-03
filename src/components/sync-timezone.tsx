"use client";

import { useEffect, useRef } from "react";
import { setDetectedTimeZone } from "@/app/actions/set-detected-timezone";
import { authClient } from "@/lib/auth/client";

export function SyncTimezone() {
  const { data: session } = authClient.useSession();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    if (!session?.user) return;
    ran.current = true;

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const key = `detected_tz:${session.user.id}`;
    const prev = localStorage.getItem(key);
    if (prev !== tz) {
      localStorage.setItem(key, tz);
      void setDetectedTimeZone(tz);
    }
  }, [session?.user?.id]);

  return null;
}
