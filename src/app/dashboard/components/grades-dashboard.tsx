"use client";

import { isSupportSpace } from "@/lib/utils/course-classification";
import { useState } from "react";
import useSWR from "swr";
import {
  BookOpen,
  NotebookPen,
  TriangleAlert,
  ArrowUpRight,
  ChevronDown,
  ExternalLink,
  GraduationCap,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { GlassContainer } from "@/components/glass-container";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import type {
  CourseGrade,
  GradeAssignment,
  GradesData,
} from "@/lib/types/grades";

import type { UserCourse, CanvasDomainInfo } from "@/lib/types";
import { convertToDark, resolveCourseColor } from "@/lib/utils/colors/colors";
import { AssignmentCardFrame } from "./assignment-card-frame";
import { AccountAttentionCard } from "./account-attention-card";

function viewButtonClass(active: boolean) {
  return `h-7 rounded-md px-2.5 text-xs ${active ? "" : "border-slate-300/35 bg-white/35 shadow-[0_1px_2px_rgb(15_23_42_/_0.06)] hover:bg-white/55 dark:border-white/10 dark:bg-glass/5 dark:hover:bg-glass/15 dark:shadow-none"}`;
}

function CourseGlassEdge() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-[oklch(var(--c-light)/0.65)] dark:bg-[oklch(var(--c-dark)/0.5)]"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgb(255 255 255 / 0.12), transparent)",
      }}
    />
  );
}

function StudentAvatar({ row }: { row: CourseGrade }) {
  return (
    <Avatar className="ring-glass-border/20 size-9 ring-1">
      <AvatarImage
        src={row.avatarUrl}
        alt={`${row.studentName}'s avatar`}
        className="object-cover"
      />
      <AvatarFallback>
        {row.studentName
          .split(/\s+/)
          .filter(Boolean)
          .map((n) => n[0])
          .slice(0, 2)
          .join("")}
      </AvatarFallback>
    </Avatar>
  );
}

function courseStyle(color: UserCourse["color"]): React.CSSProperties {
  const dark = convertToDark(color);
  return {
    "--c-light": `${color.l} ${color.c} ${color.h}`,
    "--c-dark": `${dark.l} ${dark.c} ${dark.h}`,
  } as React.CSSProperties;
}

function GradeNotice({
  retry,
  loading,
}: {
  retry: () => void;
  loading: boolean;
}) {
  return (
    <div
      role="alert"
      data-glass-pointer=""
      className="relative rounded-2xl border border-amber-500/20 bg-amber-50/50 p-4 shadow-sm sm:p-5 dark:bg-amber-950/20"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
          <TriangleAlert className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">Grades couldn’t be loaded</h3>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
            We couldn’t reach Canvas right now. Try again, or check the account
            connection.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={loading}
              onClick={retry}
            >
              <RefreshCw className={loading ? "animate-spin" : ""} />
              {loading ? "Retrying…" : "Try again"}
            </Button>
            <Button size="sm" variant="ghost" asChild>
              <a href="/manage-accounts">
                Manage accounts
                <ArrowUpRight />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error("Could not load data from Canvas. Please try again.");
  return response.json();
}
const scoreLabel = (row: CourseGrade) =>
  row.score == null
    ? (row.grade ?? "Not available")
    : `${Number(row.score.toFixed(2))}%${row.grade ? ` · ${row.grade}` : ""}`;
function dateLabel(value: string | null) {
  return value
    ? new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No due date";
}

function Assignments({
  row,
  color,
}: {
  row: CourseGrade;
  color: UserCourse["color"];
}) {
  const [filter, setFilter] = useState("recent");
  const { data, error, isLoading, mutate, isValidating } = useSWR<
    GradeAssignment[]
  >(
    `/api/grades/assignments?${new URLSearchParams({ accountId: row.accountId, courseId: String(row.courseId) })}`,
    fetcher,
    { revalidateOnFocus: false },
  );
  const assignments = (data ?? [])
    .filter((a) => filter !== "graded" || a.status === "Graded")
    .sort((a, b) => {
      const timestamp = (item: GradeAssignment) =>
        new Date(item.gradedAt ?? item.dueAt ?? 0).getTime();
      // Recent activity excludes future due dates from the top of the list.
      const recent = (item: GradeAssignment) =>
        timestamp(item) > Date.now() ? 0 : timestamp(item);
      return recent(b) - recent(a) || timestamp(a) - timestamp(b);
    });
  const visible = filter === "all" ? assignments : assignments.slice(0, 5);
  return (
    <div className="border-glass-border/15 bg-glass/5 border-t px-4 py-4 sm:px-5 dark:bg-transparent">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold">Assignments & grades</h4>
        <div className="flex items-center gap-2">
          <select
            aria-label="Assignment view"
            className="border-glass-border/20 bg-glass/10 rounded-md border px-2 py-1 text-xs shadow-sm backdrop-blur-lg dark:bg-white/5"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="recent">Latest activity</option>
            <option value="graded">Latest graded</option>
            <option value="all">All assignments</option>
          </select>
          <Button
            size="icon-xs"
            variant="ghost"
            aria-label="Refresh assignments"
            disabled={isValidating}
            onClick={() => void mutate()}
          >
            <RefreshCw className={isValidating ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>
      {isLoading && (
        <div
          role="status"
          aria-label="Loading assignments"
          className="flex flex-col gap-3"
        >
          <span className="sr-only">Loading assignments</span>
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              aria-hidden="true"
              className="glass-border glass-card-rim flex min-h-28 overflow-hidden rounded-2xl bg-[oklch(var(--c-light)/0.07)] shadow-sm backdrop-blur-lg dark:bg-[oklch(var(--c-dark)/0.06)] dark:backdrop-blur-sm"
            >
              <div className="liquid-glass-accent flex shrink-0 items-center px-2 md:px-5">
                <Skeleton className="bg-foreground/10 relative z-10 size-9" />
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-3 p-3">
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton
                    className={`${index === 1 ? "w-3/4" : "w-full"} bg-foreground/10 h-4 max-w-80`}
                  />
                  <Skeleton className="bg-foreground/10 h-3 w-28" />
                  <Skeleton className="bg-foreground/10 h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="bg-foreground/10 h-5 w-12 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}
      {error && (
        <p role="alert" className="text-destructive text-sm">
          Assignments could not be loaded.{" "}
          <button className="underline" onClick={() => void mutate()}>
            Try again
          </button>
        </p>
      )}
      {data && !visible.length && (
        <p className="text-muted-foreground text-sm">
          {filter === "graded"
            ? "No graded assignments yet."
            : "No assignments available."}
        </p>
      )}
      <div className="flex flex-col gap-3">
        {visible.map((a) => (
          <AssignmentCardFrame
            key={a.id}
            color={color}
            icon={NotebookPen}
            iconLabel="Assignment"
          >
            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-3 gap-y-2 py-3 pr-3">
              <div className="min-w-0 flex-1 basis-40">
                <a
                  href={`${row.baseUrl}/courses/${row.courseId}/assignments/${a.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-card-foreground text-sm font-bold hover:underline"
                >
                  {a.name}
                  <ExternalLink className="ml-1 inline size-3" />
                </a>
                <p className="text-muted-foreground mt-1 text-xs">
                  {a.gradedAt
                    ? `Graded ${dateLabel(a.gradedAt)}`
                    : a.dueAt
                      ? `Due ${dateLabel(a.dueAt)}`
                      : "No due date"}{" "}
                </p>
                <span className="bg-background/45 text-muted-foreground mt-2 inline-flex rounded-full px-2 py-0.5 text-xs">
                  {a.status}
                </span>
              </div>
              <span className="shrink-0 text-right text-sm font-semibold tabular-nums">
                {a.status === "Excused"
                  ? "Excused"
                  : a.score != null
                    ? `${a.score} / ${a.pointsPossible ?? "—"}`
                    : (a.grade ?? "—")}
              </span>
            </div>
          </AssignmentCardFrame>
        ))}
      </div>
      {data && assignments.length > visible.length && (
        <Button size="sm" variant="ghost" onClick={() => setFilter("all")}>
          View all {data.length} assignments
        </Button>
      )}
    </div>
  );
}
function GradesSkeleton() {
  return (
    <div role="status" aria-label="Loading course grades" className="space-y-4">
      <span className="sr-only">Loading course grades</span>
      {[0, 1, 2].map((group) => (
        <GlassContainer key={group} aria-hidden="true" className="space-y-3">
          <div className="flex items-start justify-between gap-4 px-1">
            <div className="flex-1 space-y-2 py-1">
              <Skeleton className="bg-foreground/10 h-5 w-3/4 motion-reduce:animate-none" />
              <Skeleton className="bg-foreground/10 h-3 w-16 motion-reduce:animate-none" />
            </div>
            <Skeleton className="bg-foreground/10 h-6 w-20 rounded-full motion-reduce:animate-none" />
          </div>
          {[0, 1].map((row) => (
            <div key={row} className="glass-border flex items-center gap-3 rounded-2xl bg-glass/5 p-4 sm:p-5">
              <Skeleton className="bg-foreground/10 size-9 shrink-0 rounded-full motion-reduce:animate-none" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="bg-foreground/10 h-4 w-2/5 motion-reduce:animate-none" />
                <Skeleton className="bg-foreground/10 h-3 w-3/5 motion-reduce:animate-none" />
              </div>
              <div className="space-y-2">
                <Skeleton className="bg-foreground/10 ml-auto h-5 w-12 motion-reduce:animate-none" />
                <Skeleton className="bg-foreground/10 h-3 w-20 motion-reduce:animate-none" />
              </div>
            </div>
          ))}
        </GlassContainer>
      ))}
    </div>
  );
}

function GradeRow({
  row,
  by,
  color,
}: {
  row: CourseGrade;
  by: "course" | "student";
  color: UserCourse["color"];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={courseStyle(color)}
      data-glass-pointer=""
      className={`glass-border relative overflow-hidden rounded-2xl shadow-sm backdrop-blur-lg ${by === "student" ? "bg-[oklch(var(--c-light)/0.07)] pl-2 dark:bg-[oklch(var(--c-dark)/0.06)] dark:backdrop-blur-sm" : "bg-glass/5 dark:bg-white/[0.015] dark:backdrop-blur-sm"}`}
    >
      {by === "student" && <CourseGlassEdge />}
      <button
        className="hover:bg-glass/[0.03] dark:hover:bg-white/[0.02] focus-visible:outline-primary flex w-full items-center gap-3 p-4 text-left transition-colors duration-200 focus-visible:outline-2 sm:p-5"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {by === "course" ? (
          <StudentAvatar row={row} />
        ) : (
          <div className="bg-glass/15 flex size-9 shrink-0 items-center justify-center rounded-full">
            <BookOpen className="size-4" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            {by === "course" ? row.studentName : row.courseName}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            {by === "course" ? "View assignments & grades" : row.courseCode}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p
            className={`${row.score == null && !row.grade ? "text-muted-foreground text-xs" : "text-lg font-semibold"} tabular-nums`}
          >
            {scoreLabel(row)}
          </p>
          <p className="text-muted-foreground text-xs">Current grade</p>
        </div>
        <ChevronDown
          className={`text-muted-foreground size-4 shrink-0 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <Assignments row={row} color={color} />}
    </div>
  );
}
export function GradesDashboard({
  courses,
  domains,
}: {
  courses: UserCourse[];
  domains: CanvasDomainInfo[];
}) {
  function colorFor(row: CourseGrade) {
    const course = courses.find(
      (c) =>
        c.id === row.courseId &&
        c.baseUrl.replace(/\/$/, "") === row.baseUrl.replace(/\/$/, ""),
    );
    const domain = domains.find((d) => d.baseUrl === row.baseUrl);
    return (
      course?.color ??
      resolveCourseColor(row.courseId, domain?.slug ?? row.baseUrl)
    );
  }
  const [by, setBy] = useState<"course" | "student">("course");
  const [search, setSearch] = useState("");
  const [showSupportSpaces, setShowSupportSpaces] = useState(false);
  const { data, error, isLoading, isValidating, mutate } = useSWR<GradesData>(
    "/api/grades",
    fetcher,
    { revalidateOnFocus: false },
  );
  const supportSpaceKeys = new Set(
    (data?.grades ?? [])
      .filter(isSupportSpace)
      .map((r) => `${r.baseUrl}|${r.courseId}`),
  );
  const rows = (data?.grades ?? []).filter(
    (r) =>
      (showSupportSpaces ||
        !supportSpaceKeys.has(`${r.baseUrl}|${r.courseId}`)) &&
      `${r.studentName} ${r.courseName} ${r.courseCode} ${r.school}`
        .toLowerCase()
        .includes(search.toLowerCase().trim()),
  );
  const groups = new Map<
    string,
    { name: string; school: string; rows: CourseGrade[] }
  >();
  for (const row of rows) {
    const key =
      by === "course" ? `${row.baseUrl}|${row.courseId}` : row.accountId;
    const group = groups.get(key) ?? {
      name: by === "course" ? row.courseName : row.studentName,
      school: row.school,
      rows: [],
    };
    group.rows.push(row);
    groups.set(key, group);
  }
  return (
    <div className="space-y-4">
      <div
        data-glass-pointer=""
        className="glass-border bg-glass/10 relative flex flex-col gap-2 rounded-xl p-2 backdrop-blur-lg"
      >
        {
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                aria-label="Search grades"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="glass-control dark:bg-input/10 h-8 rounded-md border-slate-300/40 bg-white/40 pl-8 text-sm shadow-[0_1px_3px_rgb(15_23_42_/_0.08)] dark:border-white/10 dark:shadow-none"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              aria-label="Refresh grades"
              disabled={isValidating}
              onClick={() => void mutate()}
              className="dark:bg-glass/5 dark:hover:bg-glass/15 h-8 border-slate-300/40 bg-white/40 shadow-[0_1px_3px_rgb(15_23_42_/_0.08)] hover:bg-white/60 dark:border-white/10 dark:shadow-none"
            >
              <RefreshCw className={isValidating ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        }
        <div
          className="flex flex-wrap items-center gap-1.5 px-1"
          role="group"
          aria-label="Grade view"
        >
          <Button
            size="xs"
            variant={by === "course" ? "default" : "outline"}
            className={viewButtonClass(by === "course")}
            aria-pressed={by === "course"}
            onClick={() => {
              setBy("course");
            }}
          >
            <BookOpen />
            By course
          </Button>
          <Button
            size="xs"
            variant={by === "student" ? "default" : "outline"}
            className={viewButtonClass(by === "student")}
            aria-pressed={by === "student"}
            onClick={() => {
              setBy("student");
            }}
          >
            <Users />
            By student
          </Button>
          {supportSpaceKeys.size > 0 && (
            <label
              className="text-muted-foreground ml-auto flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-xs"
              title="Include likely student hubs and support centers, identified by name"
            >
              <input
                type="checkbox"
                className="accent-primary size-3.5"
                checked={showSupportSpaces}
                onChange={(e) => setShowSupportSpaces(e.target.checked)}
              />
              Show support spaces
            </label>
          )}
        </div>
      </div>
      {
        <>
          {isLoading && <GradesSkeleton />}
          {error && (
            <GradeNotice retry={() => void mutate()} loading={isValidating} />
          )}
          {!!data?.failures.length && (
            <AccountAttentionCard
              accounts={data.failures.map((f) => ({
                id: f.accountId,
                name: f.studentName,
                expiredAt: f.expiredAt,
              }))}
            />
          )}
          {data && !rows.length && (search || !data.failures.length) && (
            <GlassContainer>
              <div className="py-8 text-center">
                <GraduationCap className="text-muted-foreground mx-auto mb-3 size-8" />
                <h3 className="font-semibold">
                  {search
                    ? "No matching grades"
                    : data.failures.length
                      ? "Grades are currently unavailable"
                      : supportSpaceKeys.size && !showSupportSpaces
                        ? "No academic courses to show"
                        : "No active student courses"}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  {search
                    ? "Try a different student, course, or school name."
                    : supportSpaceKeys.size && !showSupportSpaces
                      ? "Turn on Show support spaces to see your other Canvas enrollments."
                      : "Connect a student account or check your Canvas enrollments."}
                </p>
              </div>
            </GlassContainer>
          )}
          {Array.from(groups)
            .sort(([, a], [, b]) => a.name.localeCompare(b.name))
            .map(([key, group]) => (
              <div
                key={`${by}|${key}`}
                style={courseStyle(colorFor(group.rows[0]))}
              >
                <GlassContainer
                  className={
                    by === "course"
                      ? "relative flex flex-col gap-3 overflow-hidden bg-[oklch(var(--c-light)/0.1)] pl-6 dark:bg-[oklch(var(--c-dark)/0.04)]"
                      : "space-y-3"
                  }
                >
                  {by === "course" && <CourseGlassEdge />}
                  <div className="flex items-start justify-between gap-2 px-1">
                    <div className="flex min-w-0 items-center gap-3">
                      {by === "student" && (
                        <StudentAvatar row={group.rows[0]} />
                      )}
                      <div className="min-w-0">
                        <h3 className="font-semibold">{group.name}</h3>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {group.school}
                        </p>
                      </div>
                    </div>
                    <span className="bg-background/50 text-muted-foreground shrink-0 rounded-full px-2.5 py-1 text-xs">
                      {group.rows.length}{" "}
                      {by === "course"
                        ? group.rows.length === 1
                          ? "student"
                          : "students"
                        : group.rows.length === 1
                          ? "course"
                          : "courses"}
                    </span>
                  </div>
                  {group.rows.map((row) => (
                    <GradeRow
                      key={`${row.accountId}|${row.courseId}`}
                      row={row}
                      by={by}
                      color={colorFor(row)}
                    />
                  ))}
                </GlassContainer>
              </div>
            ))}
        </>
      }
    </div>
  );
}
