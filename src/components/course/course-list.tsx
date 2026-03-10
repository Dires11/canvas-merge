"use client";

import type { UserCourse } from "@/lib/types";
import { Palette } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { COURSE_PALETTE_40 } from "@/lib/colors/colors-pallete";
import clsx from "clsx";
import { convertToDark } from "@/lib/colors/colors";

export function CourseList({
  courses,
  onColorChange,
}: {
  courses: UserCourse[];
  onColorChange: (courseId: number, domain: string, newColor: any) => void;
}) {
  return (
    <ul>
      {courses.map((course) => {
        const dark = convertToDark(course.color);
        return (
          <li
            key={course.id}
            className="glass-border text-foreground/90 relative mb-2 flex overflow-hidden rounded-lg bg-[oklch(var(--c-light)/0.1)] pr-5 text-sm shadow-sm dark:bg-[oklch(var(--c-dark)/0.1)]"
            style={
              {
                "--c-light": `${course.color.l} ${course.color.c} ${course.color.h}`,
                "--c-dark": `${dark.l} ${dark.c} ${dark.h}`,
              } as React.CSSProperties
            }
          >
            <div className="w-3 shrink-0 self-stretch bg-[oklch(var(--c-light))] dark:bg-[oklch(var(--c-dark))]"></div>
            <div className="min-h-28 px-2 pt-1 pb-5 md:min-h-22">
              <p className="racking-tight text-sm opacity-60">
                {course.domain.split("//")[1]}
              </p>
              <p className="text-base md:text-sm">{course.name}</p>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="bg-glass/10 hover:bg-glass/20 absolute top-1 right-1 rounded-full p-1 hover:cursor-pointer"
                  title="Change Color"
                >
                  <Palette className="size-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="bg-background grid w-fit grid-cols-8 gap-3"
                align="start"
              >
                {COURSE_PALETTE_40.map((color) => {
                  const isCurrent = color.h === course.color.h;
                  const dark = convertToDark(color);

                  return (
                    <button
                      key={color.h}
                      className={clsx(
                        "ring-foreground/90 size-5 rounded-md bg-[oklch(var(--c-light))] hover:cursor-pointer hover:ring-2 dark:bg-[oklch(var(--c-dark))]",
                        isCurrent && "ring-2",
                      )}
                      style={
                        {
                          "--c-light": `${color.l} ${color.c} ${color.h}`,
                          "--c-dark": `${dark.l} ${dark.c} ${dark.h}`,
                        } as React.CSSProperties
                      }
                      onClick={() =>
                        onColorChange(course.id, course.domain, color)
                      }
                    />
                  );
                })}
              </PopoverContent>
            </Popover>
          </li>
        );
      })}
    </ul>
  );
}
