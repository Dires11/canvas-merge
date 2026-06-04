"use client";

import { useEffect, useRef, useState } from "react";
import type { UserCourse, UserPlanner } from "@/lib/types";
import { CourseSidebar } from "./course-sidebar";
import { AssignmentDashboardClient } from "./assignment-dashboard-client";
import { updateCourseColor } from "@/app/actions/course-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseTab } from "./course-tab";
import { useRouter } from "next/navigation";
import { GlassContainer } from "@/components/glass-container";
import type { CanvasDomainInfo } from "@/lib/types";
import { AnnouncementsDashboard } from "./announcements-dashboard";
import { cn } from "@/lib/utils";
import {
  BookMarked,
  CheckCircle2,
  ClipboardList,
  Megaphone,
} from "lucide-react";
type CourseColor = UserCourse["color"];
type MobileDashboardTab =
  | "courses"
  | "assignments"
  | "completed"
  | "announcements";

const MOBILE_TAB_LABELS: Record<MobileDashboardTab, string> = {
  courses: "Courses",
  assignments: "Assignments",
  completed: "Completed",
  announcements: "Announcements",
};

const MOBILE_TAB_ICONS = {
  courses: BookMarked,
  assignments: ClipboardList,
  completed: CheckCircle2,
  announcements: Megaphone,
} satisfies Record<MobileDashboardTab, React.ComponentType<{ className?: string }>>;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "";
}

export function DashboardClient({
  initialCourses,
  plannerData,
  completedPlannerData,
  domainsData,
}: {
  initialCourses: UserCourse[];
  plannerData: UserPlanner | null;
  completedPlannerData: UserPlanner | null;
  domainsData: CanvasDomainInfo[];
}) {
  const [courses, setCourses] = useState<UserCourse[]>(initialCourses);
  const [mobileTabsCompact, setMobileTabsCompact] = useState(false);
  const [mobileTab, setMobileTab] =
    useState<MobileDashboardTab>("assignments");
  const mobileTabsListRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    function updateCompactState() {
      const currentY = window.scrollY;
      const delta = currentY - lastY;

      if (currentY < 24 || delta < -8) {
        setMobileTabsCompact(false);
      } else if (delta > 8 && currentY > 80) {
        setMobileTabsCompact(true);
      }

      lastY = currentY;
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(updateCompactState);
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleColorChange = async (
    courseId: number,
    domainSlug: string,
    newColor: CourseColor,
  ) => {
    const prevCourses = courses;

    // optimistic UI
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId && c.domainSlug === domainSlug
          ? { ...c, color: newColor }
          : c,
      ),
    );

    // persist
    try {
      await updateCourseColor(courseId, domainSlug, newColor);
    } catch (error: unknown) {
      if (getErrorMessage(error).includes("UNAUTHORIZED")) {
        router.push("/auth/sign-in");
        return;
      }

      console.error("Failed to update course color:", error);
      setCourses(prevCourses); // rollback
    }
  };

  const mobileTabClassName = cn(
    "min-w-max shrink-0 border-0 transition-all duration-300 ease-out",
    mobileTabsCompact ? "h-8 px-3 text-xs" : "h-9 px-4 text-sm",
  );
  const MobileActiveTabIcon = MOBILE_TAB_ICONS[mobileTab];

  function centerMobileTab(value: MobileDashboardTab) {
    const list = mobileTabsListRef.current;
    const tab = list?.querySelector<HTMLElement>(
      `[data-value="${value}"][role="tab"]`,
    );

    if (!list || !tab) return;

    list.scrollTo({
      left: tab.offsetLeft - list.clientWidth / 2 + tab.clientWidth / 2,
      behavior: "smooth",
    });
  }

  return (
    <>
      {/* Mobile: Tabs */}
      <div className="p-4 pb-[calc(env(safe-area-inset-bottom)+6rem)] md:hidden">
        <Tabs
          value={mobileTab}
          onValueChange={(value) => {
            const nextTab = value as MobileDashboardTab;
            setMobileTab(nextTab);
            setMobileTabsCompact(false);
            window.requestAnimationFrame(() => centerMobileTab(nextTab));
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="w-full"
        >
          <TabsContent value="courses" className="min-w-0">
            <CourseTab courses={courses} onColorChange={handleColorChange} />
          </TabsContent>
          <TabsContent value="assignments" className="min-w-0">
            <AssignmentDashboardClient
              initialData={plannerData}
              courses={courses}
              domains={domainsData}
            />
          </TabsContent>
          <TabsContent value="completed" className="min-w-0">
            <AssignmentDashboardClient
              initialData={completedPlannerData}
              courses={courses}
              domains={domainsData}
              mode="completed"
            />
          </TabsContent>
          <TabsContent value="announcements" className="min-w-0">
            <AnnouncementsDashboard
              plannerData={plannerData}
              domains={domainsData}
              courses={courses}
            />
          </TabsContent>
          <div
            className={cn(
              "fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-40 px-4 transition-all duration-300 ease-out",
              mobileTabsCompact
                ? "translate-y-3 scale-100 opacity-95"
                : "translate-y-0 scale-100 opacity-100",
            )}
          >
            <GlassContainer
              className={cn(
                "mx-auto transition-all duration-300 ease-out",
                mobileTabsCompact
                  ? "flex size-7.5 items-center justify-center rounded-full bg-glass/25 p-0 shadow-[0_8px_28px_rgb(15_23_42_/_0.18)] backdrop-blur-lg dark:shadow-[0_8px_28px_rgb(0_0_0_/_0.24)]"
                  : "w-full max-w-xl p-1.5",
              )}
            >
              <TabsList
                ref={mobileTabsListRef}
                className={cn(
                  "scrollbar-hide flex overflow-x-auto overflow-y-hidden bg-transparent p-0 transition-all duration-300 ease-out",
                  mobileTabsCompact ? "h-8" : "h-9",
                  mobileTabsCompact
                    ? "w-fit justify-center"
                    : "w-full justify-start gap-1",
                )}
              >
                {mobileTabsCompact ? (
                  <button
                    type="button"
                    className="flex size-7.5 min-w-0 shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0 text-foreground shadow-none transition-all duration-300 ease-out hover:cursor-pointer"
                    aria-label={MOBILE_TAB_LABELS[mobileTab]}
                    onClick={(event) => {
                      event.stopPropagation();
                      setMobileTabsCompact(false);
                    }}
                  >
                    <MobileActiveTabIcon className="size-4" />
                  </button>
                ) : (
                  <>
                    <TabsTrigger
                      value="courses"
                      data-value="courses"
                      className={cn("rounded-lg", mobileTabClassName)}
                    >
                      <BookMarked className="size-4" />
                      Courses
                    </TabsTrigger>
                    <TabsTrigger
                      value="assignments"
                      data-value="assignments"
                      className={mobileTabClassName}
                    >
                      <ClipboardList className="size-4" />
                      Assignments
                    </TabsTrigger>
                    <TabsTrigger
                      value="completed"
                      data-value="completed"
                      className={mobileTabClassName}
                    >
                      <CheckCircle2 className="size-4" />
                      Completed
                    </TabsTrigger>
                    <TabsTrigger
                      value="announcements"
                      data-value="announcements"
                      className={mobileTabClassName}
                    >
                      <Megaphone className="size-4" />
                      Announcements
                    </TabsTrigger>
                  </>
                )}
              </TabsList>
            </GlassContainer>
          </div>
        </Tabs>
      </div>

      {/* Desktop: Sidebar + Assignment Tabs */}
      <div className="hidden min-h-screen grid-cols-[320px_minmax(0,1fr)] gap-4 p-4 md:grid">
        <CourseSidebar courses={courses} onColorChange={handleColorChange} />
        <main className="min-w-0">
          <div className="mx-auto w-full max-w-4xl">
            <Tabs defaultValue="assignments" className="w-full">
              <GlassContainer className="mb-4 w-full p-0">
                <TabsList className="w-full bg-inherit">
                  <TabsTrigger value="assignments" className="flex-1 border-0">
                    <ClipboardList className="size-4" />
                    Assignments
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="flex-1 border-0">
                    <CheckCircle2 className="size-4" />
                    Completed
                  </TabsTrigger>
                  <TabsTrigger
                    value="announcements"
                    className="flex-1 border-0"
                  >
                    <Megaphone className="size-4" />
                    Announcements
                  </TabsTrigger>
                </TabsList>
              </GlassContainer>
              <TabsContent value="assignments" className="min-w-0">
                <AssignmentDashboardClient
                  initialData={plannerData}
                  courses={courses}
                  domains={domainsData}
                />
              </TabsContent>
              <TabsContent value="completed" className="min-w-0">
                <AssignmentDashboardClient
                  initialData={completedPlannerData}
                  courses={courses}
                  domains={domainsData}
                  mode="completed"
                />
              </TabsContent>
              <TabsContent value="announcements" className="min-w-0">
                <AnnouncementsDashboard
                  plannerData={plannerData}
                  domains={domainsData}
                  courses={courses}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </>
  );
}
