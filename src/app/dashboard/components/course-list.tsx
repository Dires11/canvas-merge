"use client";

import type { UserCourse } from "@/lib/types";
import { Palette } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { COURSE_PALETTE_40 } from "@/lib/utils/colors/colors-palete";
import clsx from "clsx";
import { convertToDark } from "@/lib/utils/colors/colors";

export function CourseList({
  courses,
  onColorChange,
}: {
  courses: UserCourse[];
  onColorChange: (
    courseId: number,
    domainSlug: string,
    newColor: UserCourse["color"],
  ) => void;
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
                {course.domainName}
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
                className="bg-glass/10 glass-border grid w-fit grid-cols-8 gap-3 border-0 p-4 backdrop-blur-lg"
                align="start"
              >
                {COURSE_PALETTE_40.map((color) => {
                  const isCurrent = color.h === course.color.h;
                  const dark = convertToDark(color);

                  return (
                    <button
                      key={color.h}
                      className={clsx(
                        "ring-foreground/80 size-5 rounded-md bg-[oklch(var(--c-light))] hover:cursor-pointer hover:ring-2 dark:bg-[oklch(var(--c-dark))]",
                        isCurrent && "ring-2",
                      )}
                      style={
                        {
                          "--c-light": `${color.l} ${color.c} ${color.h}`,
                          "--c-dark": `${dark.l} ${dark.c} ${dark.h}`,
                        } as React.CSSProperties
                      }
                      onClick={() =>
                        onColorChange(course.id, course.domainSlug, color)
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
