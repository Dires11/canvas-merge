"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";

import { usePointerGlass } from "@/components/use-pointer-glass";

const STORAGE_KEY = "canvas-merge-scroll-reflections";
const CHANGE_EVENT = "canvas-merge-appearance-change";
let memoryPreference = true;

function getReflections() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? memoryPreference : stored !== "off";
  } catch {
    return memoryPreference;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function setReflections(enabled: boolean) {
  memoryPreference = enabled;
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // Keep the preference for this session if browser storage is unavailable.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

const POINTER_STORAGE_KEY = "canvas-merge-pointer-reflections";
let pointerPreference = true;

function getPointerReflections() {
  try {
    const stored = localStorage.getItem(POINTER_STORAGE_KEY);
    return stored === null ? pointerPreference : stored !== "off";
  } catch {
    return pointerPreference;
  }
}

function setPointerReflections(enabled: boolean) {
  pointerPreference = enabled;
  try {
    localStorage.setItem(POINTER_STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // Fall back to the in-memory preference for this session.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribeMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

const AppearanceContext = createContext({
  scrollReflections: true,
  pointerReflections: true,
  setPointerReflections,
  reducedMotion: false,
  setScrollReflections: setReflections,
});

export function AppearanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const scrollReflections = useSyncExternalStore(
    subscribe,
    getReflections,
    () => true,
  );
  const pointerReflections = useSyncExternalStore(
    subscribe,
    getPointerReflections,
    () => true,
  );
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );

  usePointerGlass(pointerReflections && !reducedMotion);

  useEffect(() => {
    if (!scrollReflections || reducedMotion) return;
    const root = document.documentElement;
    let frame = 0;
    let lastTime = 0;
    const readTarget = () => 50 + Math.sin(window.scrollY / 450) * 22;
    let target = readTarget();
    let current = target;
    const paint = () =>
      root.style.setProperty("--glass-light-y", `${current}%`);
    const update = (time: number) => {
      // Time-based easing keeps the same soft response on 60 Hz and 120 Hz screens.
      const elapsed = lastTime ? Math.min(time - lastTime, 64) : 16;
      lastTime = time;
      current += (target - current) * (1 - Math.exp(-elapsed / 110));
      if (Math.abs(target - current) < 0.02) {
        current = target;
        frame = 0;
        lastTime = 0;
      } else {
        frame = requestAnimationFrame(update);
      }
      paint();
    };
    const onScroll = () => {
      target = readTarget();
      if (!frame) frame = requestAnimationFrame(update);
    };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      root.style.removeProperty("--glass-light-y");
    };
  }, [scrollReflections, reducedMotion]);

  return (
    <AppearanceContext.Provider
      value={{
        pointerReflections,
        setPointerReflections,
        scrollReflections,
        reducedMotion,
        setScrollReflections: setReflections,
      }}
    >
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  return useContext(AppearanceContext);
}
