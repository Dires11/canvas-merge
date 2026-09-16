"use client";

import { useState } from "react";
import { Palette } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { COURSE_PALETTE_40 } from "@/lib/utils/colors/colors-palete";
import { convertToDark } from "@/lib/utils/colors/colors";
import type { UserCourse } from "@/lib/types";

export type CourseColorChange = (
  courseId: number,
  domainSlug: string,
  color: UserCourse["color"],
) => void | Promise<void>;
export function CourseColorPicker({
  course,
  onColorChange,
}: {
  course: Pick<UserCourse, "id" | "name" | "domainSlug" | "color">;
  onColorChange: CourseColorChange;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function choose(color: UserCourse["color"]) {
    setSaving(true);
    setError("");
    try {
      await onColorChange(course.id, course.domainSlug, color);
    } catch {
      setError("Could not save color. Try again.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Change color for ${course.name}`}
          title="Change course color"
          data-glass-pointer=""
          className="glass-control group relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-all duration-300 ease-out hover:bg-background/30 dark:hover:bg-glass/15 focus-visible:ring-ring focus-visible:ring-2"
        >
          <Palette className="text-foreground/70 size-4 -rotate-6 stroke-[2] transition-all duration-300 ease-out group-hover:scale-110 group-hover:text-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="settings-glass grid w-fit max-w-[calc(100vw-2rem)] grid-cols-8 gap-2 rounded-2xl p-3"
        aria-label={`Course color for ${course.name}`}
      >
        {COURSE_PALETTE_40.map((color, index) => {
          const dark = convertToDark(color);
          const selected =
            color.h === course.color.h &&
            color.c === course.color.c &&
            color.l === course.color.l;
          return (
            <button
              key={index}
              type="button"
              aria-label={`Color ${index + 1}`}
              aria-pressed={selected}
              disabled={saving}
              className={`ring-foreground/70 size-6 rounded-full bg-[oklch(var(--c-light))] hover:ring-2 focus-visible:outline-2 focus-visible:outline-offset-2 dark:bg-[oklch(var(--c-dark))] ${selected ? "ring-offset-background ring-2 ring-offset-2" : ""}`}
              style={
                {
                  "--c-light": `${color.l} ${color.c} ${color.h}`,
                  "--c-dark": `${dark.l} ${dark.c} ${dark.h}`,
                } as React.CSSProperties
              }
              onClick={() => void choose(color)}
            />
          );
        })}
        {error && (
          <p role="alert" className="text-destructive col-span-8 text-xs">
            {error}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
