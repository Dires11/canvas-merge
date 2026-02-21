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
            className="text-foreground/90 relative mb-2 rounded-lg bg-[oklch(var(--c-light)/0.7)] p-2 text-sm shadow-sm hover:bg-[oklch(var(--c-light)/0.8)] hover:shadow-md dark:bg-[oklch(var(--c-dark)/0.7)] dark:hover:bg-[oklch(var(--c-dark)/0.9)]"
            style={
              {
                "--c-light": `${course.color.l} ${course.color.c} ${course.color.h}`,
                "--c-dark": `${dark.l} ${dark.c} ${dark.h}`,
              } as React.CSSProperties
            }
          >
            <p className="w-5/6">{course.name}</p>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="absolute top-1 right-1 rounded-full bg-white/20 p-1 hover:cursor-pointer hover:bg-white/30"
                  title="Change Color"
                >
                  <Palette className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="grid w-fit grid-cols-8 gap-3"
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
