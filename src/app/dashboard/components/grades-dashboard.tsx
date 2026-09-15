"use client";

import { isSupportSpace } from "@/lib/utils/course-classification";
import { useState } from "react";
import useSWR from "swr";
import {
  BookOpen,
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
import { Input } from "@/components/ui/input";
import type {
  CourseGrade,
  GradeAssignment,
  GradesData,
} from "@/lib/types/grades";

import type { UserCourse, CanvasDomainInfo } from "@/lib/types";
import { convertToDark, resolveCourseColor } from "@/lib/utils/colors/colors";
import { AccountAttentionCard } from "./account-attention-card";

function viewButtonClass(active: boolean) {
  return `h-7 rounded-md px-2.5 text-xs ${active ? "" : "border-slate-300/35 bg-white/35 shadow-[0_1px_2px_rgb(15_23_42_/_0.06)] hover:bg-white/55 dark:border-white/10 dark:bg-glass/5 dark:hover:bg-glass/15 dark:shadow-none"}`;
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
      className="rounded-2xl border border-amber-500/20 bg-amber-50/50 p-4 shadow-sm sm:p-5 dark:bg-amber-950/20"
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

function Assignments({ row }: { row: CourseGrade }) {
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
    <div className="border-border bg-background/30 border-t px-4 py-4 sm:px-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold">Assignments & grades</h4>
        <div className="flex items-center gap-2">
          <select
            aria-label="Assignment view"
            className="border-border bg-background rounded-md border px-2 py-1 text-xs"
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
        <p role="status" className="text-muted-foreground text-sm">
          Loading assignments…
        </p>
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
      <div className="divide-border divide-y">
        {visible.map((a) => (
          <div
            key={a.id}
            className="flex items-start justify-between gap-3 py-3"
          >
            <div className="min-w-0">
              <a
                href={`${row.baseUrl}/courses/${row.courseId}/assignments/${a.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:underline"
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
                · {a.status}
              </p>
            </div>
            <span className="shrink-0 text-right text-sm font-semibold tabular-nums">
              {a.status === "Excused"
                ? "Excused"
                : a.score != null
                  ? `${a.score} / ${a.pointsPossible ?? "—"}`
                  : (a.grade ?? "—")}
            </span>
          </div>
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
      className={`border-border overflow-hidden rounded-xl border ${by === "student" ? "border-l-8 border-l-[oklch(var(--c-light))] bg-[oklch(var(--c-light)/0.1)] dark:border-l-[oklch(var(--c-dark))] dark:bg-[oklch(var(--c-dark)/0.1)]" : "bg-background/40"}`}
    >
      <button
        className="hover:bg-glass/10 focus-visible:outline-primary flex w-full items-center gap-3 p-4 text-left transition focus-visible:outline-2 sm:p-5"
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
      {open && <Assignments row={row} />}
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
      <div className="glass-border bg-glass/10 flex flex-col gap-2 rounded-xl p-2 backdrop-blur-lg">
        {
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                aria-label="Search grades"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="dark:bg-input/10 h-8 rounded-md border-slate-300/40 bg-white/40 pl-8 text-sm shadow-[0_1px_3px_rgb(15_23_42_/_0.08)] dark:border-white/10 dark:shadow-none"
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
          {isLoading && (
            <GlassContainer>
              <p
                role="status"
                className="text-muted-foreground animate-pulse text-sm"
              >
                Loading course grades…
              </p>
            </GlassContainer>
          )}
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
                      ? "relative flex flex-col gap-3 overflow-hidden bg-[oklch(var(--c-light)/0.1)] pl-6 dark:bg-[oklch(var(--c-dark)/0.1)]"
                      : "space-y-3"
                  }
                >
                  {by === "course" && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 left-0 w-2 bg-[oklch(var(--c-light))] dark:bg-[oklch(var(--c-dark))]"
                    />
                  )}
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
