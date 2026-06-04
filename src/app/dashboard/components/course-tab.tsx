"use client";
import { useMemo, useState } from "react";
import type { UserCourse } from "@/lib/types";
import { GlassContainer } from "@/components/glass-container";
import { CourseList } from "./course-list";
import { BrushCleaning, School, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
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

type CourseColor = UserCourse["color"];

export function CourseTab({
  courses,
  onColorChange,
}: {
  courses: UserCourse[];
  onColorChange: (
    courseId: number,
    domain: string,
    newColor: CourseColor,
  ) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const domains = useMemo(() => {
    const map = new Map<string, string>();

    for (const course of courses) {
      map.set(course.domainSlug, course.domainName);
    }

    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [courses]);
  const filteredCourses = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesDomain =
        selectedDomains.length === 0 ||
        selectedDomains.includes(course.domainSlug);

      if (!matchesDomain) return false;
      if (!normalized) return true;

      return [
        course.name,
        course.course_code,
        course.domainName,
        course.domainSlug,
        course.term?.name ?? "",
      ].some((value) => value.toLowerCase().includes(normalized));
    });
  }, [courses, searchQuery, selectedDomains]);

  function toggleDomain(domainSlug: string, pressed: boolean) {
    setSelectedDomains((current) => {
      if (pressed) {
        return current.includes(domainSlug) ? current : [...current, domainSlug];
      }

      return current.filter((value) => value !== domainSlug);
    });
  }

  function clearAllFilters() {
    setSearchQuery("");
    setSelectedDomains([]);
  }

  const hasFilters =
    selectedDomains.length > 0 || searchQuery.trim().length > 0;

  return (
    <div className="mt-11 flex flex-col gap-3">
      <div className="glass-border bg-glass/10 flex flex-col gap-2 rounded-xl p-2 backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search courses"
              className="h-8 rounded-md border-slate-300/40 bg-white/40 pr-8 pl-8 text-sm shadow-[0_1px_3px_rgb(15_23_42_/_0.08)] dark:border-white/10 dark:bg-input/10 dark:shadow-none"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear course search"
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
                <School className="size-4 sm:mr-2" strokeWidth={1.8} />
                <span className="hidden sm:inline">Domains</span>
              </MenubarTrigger>
              <MenubarContent className="glass-border bg-glass/10 max-h-137 w-64 overflow-y-auto backdrop-blur-lg">
                <MenubarItem onClick={() => setSelectedDomains([])}>
                  <BrushCleaning
                    strokeWidth={1.5}
                    className="text-foreground"
                  />
                  Clear All
                </MenubarItem>
                <MenubarSeparator />

                {domains.map(([domainSlug, domainName]) => (
                  <MenubarCheckboxItem
                    key={domainSlug}
                    checked={selectedDomains.includes(domainSlug)}
                    onCheckedChange={(pressed) =>
                      toggleDomain(domainSlug, pressed)
                    }
                    onSelect={(event) => event.preventDefault()}
                  >
                    <School className="text-foreground" strokeWidth={1.5} />
                    {domainName}
                  </MenubarCheckboxItem>
                ))}
              </MenubarContent>
            </MenubarMenu>
          </Menubar>

          {hasFilters && (
            <Button
              type="button"
              size="xs"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={clearAllFilters}
            >
              Clear All
            </Button>
          )}
        </div>

        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 border-t border-white/10 px-1 pt-2">
            {selectedDomains.map((domainSlug) => (
              <button
                key={domainSlug}
                type="button"
                className="bg-background/35 hover:bg-background/55 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs dark:bg-glass/5 dark:hover:bg-glass/15"
                onClick={() => toggleDomain(domainSlug, false)}
              >
                {domains.find(([slug]) => slug === domainSlug)?.[1] ??
                  domainSlug}
                <X className="size-3" />
              </button>
            ))}

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

      <GlassContainer>
        {filteredCourses.length > 0 ? (
          <CourseList courses={filteredCourses} onColorChange={onColorChange} />
        ) : (
          <p className="text-muted-foreground text-sm">
            No courses found for this view.
          </p>
        )}
      </GlassContainer>
    </div>
  );
}
