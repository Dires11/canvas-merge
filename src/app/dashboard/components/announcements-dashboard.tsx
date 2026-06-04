"use client";

import { useMemo, useState } from "react";
import {
  BookMarked,
  BrushCleaning,
  ExternalLink,
  Megaphone,
  Search,
  X,
} from "lucide-react";
import { GlassContainer } from "@/components/glass-container";
import type {
  Announcement,
  CanvasDomainInfo,
  UserCourse,
  UserPlanner,
} from "@/lib/types";
import { convertToDark } from "@/lib/utils/colors/colors";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  plannerData: UserPlanner | null;
  domains: CanvasDomainInfo[];
  courses: UserCourse[];
};

type AnnouncementWithDomain = Announcement & {
  domainLabel: string;
};

function formatPostedAt(value: string) {
  if (!value) return "Unknown";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getAnnouncements(
  plannerData: UserPlanner | null,
  domains: CanvasDomainInfo[],
) {
  const domainMap = new Map(domains.map((domain) => [domain.slug, domain.name]));
  const announcements: AnnouncementWithDomain[] = [];

  for (const [domainSlug, items] of Object.entries(plannerData?.merged ?? {})) {
    for (const announcement of items.announcements) {
      announcements.push({
        ...announcement,
        domainLabel:
          domainMap.get(domainSlug) ??
          announcement.domainName ??
          announcement.domainSlug,
      });
    }
  }

  announcements.sort((a, b) => {
    const aPostedAt = a.posted_at ? new Date(a.posted_at).getTime() : 0;
    const bPostedAt = b.posted_at ? new Date(b.posted_at).getTime() : 0;

    if (aPostedAt !== bPostedAt) return bPostedAt - aPostedAt;
    return a.title.localeCompare(b.title);
  });

  return announcements;
}

function getCourseValue(domainSlug: string, courseId: string | number) {
  return `${domainSlug}|${courseId}`;
}

export function AnnouncementsDashboard({
  plannerData,
  domains,
  courses,
}: Props) {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const announcements = useMemo(
    () => getAnnouncements(plannerData, domains),
    [plannerData, domains],
  );
  const courseMap = useMemo(
    () =>
      new Map(
        courses.map((course) => [
          getCourseValue(course.domainSlug, course.id),
          course,
        ]),
      ),
    [courses],
  );
  const availableCourses = useMemo(() => {
    const announcementCourses = new Set(
      announcements.map((announcement) =>
        getCourseValue(announcement.domainSlug, announcement.course_id),
      ),
    );

    return courses
      .filter((course) =>
        announcementCourses.has(getCourseValue(course.domainSlug, course.id)),
      )
      .sort((a, b) => a.course_code.localeCompare(b.course_code));
  }, [announcements, courses]);
  const filteredAnnouncements =
    selectedCourses.length === 0 && searchQuery.trim().length === 0
      ? announcements
      : announcements.filter((announcement) => {
          const matchesCourse =
            selectedCourses.length === 0 ||
            selectedCourses.includes(
              getCourseValue(announcement.domainSlug, announcement.course_id),
            );

          if (!matchesCourse) return false;

          const normalized = searchQuery.trim().toLowerCase();
          if (!normalized) return true;

          return [
            announcement.title,
            announcement.course_name,
            announcement.domainLabel,
            announcement.domainSlug,
            formatPostedAt(announcement.posted_at),
          ].some((value) => value.toLowerCase().includes(normalized));
        });

  function toggleCourse(courseValue: string, pressed: boolean) {
    setSelectedCourses((current) => {
      if (pressed) {
        return current.includes(courseValue) ? current : [...current, courseValue];
      }

      return current.filter((value) => value !== courseValue);
    });
  }

  if (announcements.length === 0) {
    return (
      <GlassContainer className="w-full">
        <p className="text-muted-foreground text-sm">
          No announcements found for this view.
        </p>
      </GlassContainer>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="glass-border bg-glass/10 flex flex-col gap-2 rounded-xl p-2 backdrop-blur-lg">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search announcements"
              className="h-8 rounded-md border-slate-300/40 bg-white/40 pr-8 pl-8 text-sm shadow-[0_1px_3px_rgb(15_23_42_/_0.08)] dark:border-white/10 dark:bg-input/10 dark:shadow-none"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear announcement search"
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2"
                onClick={() => setSearchQuery("")}
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <Menubar className="h-auto w-auto shrink-0 flex-nowrap gap-1 rounded-lg border-transparent bg-transparent p-0 shadow-none">
            <MenubarMenu>
              <MenubarTrigger className="size-8 justify-center rounded-md border border-slate-300/40 bg-white/40 p-0 text-sm shadow-[0_1px_3px_rgb(15_23_42_/_0.08)] hover:bg-white/60 sm:size-auto sm:h-8 sm:px-2 sm:py-0 dark:border-white/10 dark:bg-glass/5 dark:shadow-none dark:hover:bg-glass/15">
                <BookMarked className="size-4 sm:mr-2" strokeWidth={1.8} />
                <span className="hidden sm:inline">Courses</span>
              </MenubarTrigger>
              <MenubarContent className="glass-border bg-glass/10 max-h-137 w-72 overflow-y-auto backdrop-blur-lg">
                <MenubarItem onClick={() => setSelectedCourses([])}>
                  <BrushCleaning
                    strokeWidth={1.5}
                    className="text-foreground"
                  />
                  Clear All
                </MenubarItem>
                <MenubarSeparator />

                {availableCourses.map((course) => {
                  const courseValue = getCourseValue(course.domainSlug, course.id);
                  const dark = convertToDark(course.color);

                  return (
                    <MenubarCheckboxItem
                      key={courseValue}
                      checked={selectedCourses.includes(courseValue)}
                      onCheckedChange={(pressed) =>
                        toggleCourse(courseValue, pressed)
                      }
                      onSelect={(event) => event.preventDefault()}
                    >
                      <span
                        className="size-3 rounded-sm bg-[oklch(var(--c-light))] dark:bg-[oklch(var(--c-dark))]"
                        style={
                          {
                            "--c-light": `${course.color.l} ${course.color.c} ${course.color.h}`,
                            "--c-dark": `${dark.l} ${dark.c} ${dark.h}`,
                          } as React.CSSProperties
                        }
                      />
                      <span className="truncate">{course.course_code}</span>
                    </MenubarCheckboxItem>
                  );
                })}
              </MenubarContent>
            </MenubarMenu>
          </Menubar>

          {(selectedCourses.length > 0 || searchQuery.trim().length > 0) && (
            <Button
              type="button"
              size="xs"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSelectedCourses([]);
                setSearchQuery("");
              }}
            >
              Clear All
            </Button>
          )}
        </div>

        {(selectedCourses.length > 0 || searchQuery.trim().length > 0) && (
          <div className="flex flex-wrap items-center gap-2 border-t border-white/10 px-1 pt-2">
            {selectedCourses.map((courseValue) => {
              const course = courseMap.get(courseValue);

              return (
                <button
                  key={courseValue}
                  type="button"
                  className="bg-background/35 hover:bg-background/55 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs dark:bg-glass/5 dark:hover:bg-glass/15"
                  onClick={() => toggleCourse(courseValue, false)}
                >
                  {course?.course_code ?? courseValue}
                  <X className="size-3" />
                </button>
              );
            })}

            {searchQuery.trim().length > 0 && (
              <button
                type="button"
                className="bg-background/35 hover:bg-background/55 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs dark:bg-glass/5 dark:hover:bg-glass/15"
                onClick={() => setSearchQuery("")}
              >
                Search: {searchQuery.trim()}
                <X className="size-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {filteredAnnouncements.length === 0 ? (
        <GlassContainer className="w-full">
          <p className="text-muted-foreground text-sm">
            No announcements found for the selected courses.
          </p>
        </GlassContainer>
      ) : (
        <GlassContainer className="w-full">
          <div className="flex flex-col gap-2">
            {filteredAnnouncements.map((announcement) => {
              const color =
                courseMap.get(
                  getCourseValue(
                    announcement.domainSlug,
                    announcement.course_id,
                  ),
                )?.color ?? { l: 0.7, c: 0.1, h: 250 };
              const dark = convertToDark(color);

              return (
                <a
                  key={`${announcement.domainSlug}:${announcement.course_id}:${announcement.id}`}
                  href={announcement.url}
                  target="_blank"
                  rel="noreferrer"
                  className="glass-border group flex items-stretch overflow-hidden rounded-2xl bg-[oklch(var(--c-light)/0.08)] shadow-sm transition hover:bg-[oklch(var(--c-light)/0.13)] hover:shadow-md dark:bg-[oklch(var(--c-dark)/0.08)] dark:hover:bg-[oklch(var(--c-dark)/0.13)]"
                  style={
                    {
                      "--c-light": `${color.l} ${color.c} ${color.h}`,
                      "--c-dark": `${dark.l} ${dark.c} ${dark.h}`,
                    } as React.CSSProperties
                  }
                >
                  <span className="flex w-12 shrink-0 items-center justify-center bg-[oklch(var(--c-light)/0.48)] dark:bg-[oklch(var(--c-dark)/0.48)]">
                    <Megaphone className="size-5 text-foreground/80" />
                  </span>

                  <span className="flex min-w-0 flex-1 items-start gap-3 p-3">
                    <span className="min-w-0 flex-1">
                      <span className="text-muted-foreground block truncate text-xs font-semibold">
                        {announcement.course_name}
                      </span>
                      <span className="block text-base leading-snug font-semibold tracking-tight">
                        {announcement.title}
                      </span>
                      <span className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                        <span>{announcement.domainLabel}</span>
                        <span aria-hidden="true">/</span>
                        <span>
                          Posted {formatPostedAt(announcement.posted_at)}
                        </span>
                      </span>
                    </span>

                    <ExternalLink className="text-muted-foreground mt-1 size-4 shrink-0 opacity-70 transition group-hover:text-foreground group-hover:opacity-100" />
                  </span>
                </a>
              );
            })}
          </div>
        </GlassContainer>
      )}
    </div>
  );
}
