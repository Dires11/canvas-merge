"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useAppearance } from "@/components/appearance-provider";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const {
    scrollReflections,
    reducedMotion,
    setScrollReflections,
    pointerReflections,
    setPointerReflections,
  } = useAppearance();

  return (
    <section aria-labelledby="appearance-heading">
      <h2 id="appearance-heading" className="text-base font-semibold">
        Appearance
      </h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Saved automatically in this browser.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span id="theme-label" className="font-medium">
          Theme
        </span>
        <div role="group" aria-labelledby="theme-label" className="flex gap-2">
          {themes.map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              variant={theme === value ? "default" : "ghost"}
              aria-pressed={theme === value}
              onClick={() => setTheme(value)}
            >
              <Icon aria-hidden="true" />
              {label}
            </Button>
          ))}
        </div>
      </div>
      <div className="border-foreground/10 mt-5 flex items-start justify-between gap-6 border-t pt-5">
        <div>
          <label
            htmlFor="scroll-reflections"
            className="cursor-pointer font-medium"
          >
            Reflections on scroll
          </label>
          <p
            id="reflections-description"
            className="text-muted-foreground mt-1 text-sm"
          >
            Gently shift the highlights on colored glass panels as you scroll.
          </p>
          {reducedMotion && (
            <p className="text-muted-foreground mt-2 text-sm">
              Motion is paused by your device’s reduced-motion preference.
            </p>
          )}
        </div>
        <button
          id="scroll-reflections"
          type="button"
          role="switch"
          aria-checked={scrollReflections}
          aria-describedby="reflections-description"
          onClick={() => setScrollReflections(!scrollReflections)}
          className={`focus-visible:ring-ring relative mt-0.5 h-7 w-12 shrink-0 cursor-pointer rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 ${scrollReflections ? "bg-primary" : "bg-foreground/20"}`}
        >
          <span
            className={`absolute top-1 left-1 size-5 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${scrollReflections ? "translate-x-5" : "translate-x-0"}`}
          />
        </button>
      </div>
      <div className="border-foreground/10 mt-5 flex items-start justify-between gap-6 border-t pt-5">
        <div>
          <label
            htmlFor="pointer-reflections"
            className="cursor-pointer font-medium"
          >
            Pointer reflections
          </label>
          <p
            id="pointer-description"
            className="text-muted-foreground mt-1 text-sm"
          >
            Gently highlight card edges as your pointer moves over them.
          </p>
          {reducedMotion && (
            <p className="text-muted-foreground mt-2 text-sm">
              Motion is paused by your device’s reduced-motion preference.
            </p>
          )}
        </div>
        <button
          id="pointer-reflections"
          type="button"
          role="switch"
          aria-checked={pointerReflections}
          aria-describedby="pointer-description"
          onClick={() => setPointerReflections(!pointerReflections)}
          className={`focus-visible:ring-ring relative mt-0.5 h-7 w-12 shrink-0 cursor-pointer rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 ${pointerReflections ? "bg-primary" : "bg-foreground/20"}`}
        >
          <span
            className={`absolute top-1 left-1 size-5 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${pointerReflections ? "translate-x-5" : "translate-x-0"}`}
          />
        </button>
      </div>
    </section>
  );
}
