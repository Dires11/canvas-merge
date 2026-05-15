"use client";

import { useEffect, useRef } from "react";
import { setDetectedTimeZone } from "@/app/actions/set-detected-timezone";
import { useAuth } from "@clerk/nextjs";

export function SyncTimezone() {
  const { userId, isLoaded } = useAuth();
  const ran = useRef(false);

  useEffect(() => {
    if (!isLoaded || !userId) return;
    if (ran.current) return;
    ran.current = true;

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const key = `detected_tz:${userId}`;
    const prev = localStorage.getItem(key);
    if (prev !== tz) {
      localStorage.setItem(key, tz);
      void setDetectedTimeZone(tz);
    }
  }, [userId, isLoaded]);

  return null;
}
