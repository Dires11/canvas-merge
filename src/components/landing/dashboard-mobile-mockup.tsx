"use client"

import {
  NotebookPen,
  CopyCheck,
  MessageSquareMore,
  ListTodo,
  BookMarked,
  ClipboardList,
  CheckCircle2,
  Megaphone,
  ChevronDown,
  Search,
} from "lucide-react"
import { GlassContainer } from "@/components/glass-container"
import { courseById, MOCK_ASSIGNMENTS, hexRgba } from "./mock-data"
import type { MockAssignment } from "./mock-data"

const ITEMS = MOCK_ASSIGNMENTS.filter(
  (a) => a.dueGroup === "today" || a.dueGroup === "tomorrow"
).slice(0, 3)

const QUICK_FILTERS = ["All", "Overdue", "Due Today", "This Week"]

const TABS = [
  { label: "Courses",    Icon: BookMarked,  active: false },
  { label: "Assignments",Icon: ClipboardList,active: true  },
  { label: "Completed",  Icon: CheckCircle2,active: false },
  { label: "Announce.",  Icon: Megaphone,   active: false },
]

function AssignmentTypeIcon({ type }: { type: MockAssignment["type"] }) {
  if (type === "discussion") return <MessageSquareMore className="size-4 opacity-80" strokeWidth={1.5} />
  if (type === "quiz")       return <CopyCheck         className="size-4 opacity-80" strokeWidth={1.5} />
  return                            <NotebookPen        className="size-4 opacity-80" strokeWidth={1.5} />
}

export function DashboardMobileMockup() {
  return (
    <div className="dark flex h-full flex-col overflow-hidden bg-background text-foreground">
      {/* Top bar — matches DashboardMockup */}
      <div
        className="flex items-center justify-between border-b border-border px-3 py-2"
        style={{ background: "oklch(0.22 0.05 268)" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-white">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0f0f13" strokeWidth="2.5" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-[13px] font-bold">CanvasMerge</span>
        </div>
        <div className="flex items-center gap-1.5">
          {(["#6366f1", "#06b6d4", "#f59e0b"] as const).map((c) => (
            <div key={c} className="size-2 rounded-full" style={{ background: c }} />
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex flex-1 flex-col gap-2 overflow-hidden p-3 pb-14">
        {/* Search + quick filters — mirrors AssignmentDashboardClient */}
        <GlassContainer className="p-2 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2 py-1">
            <Search className="size-3 shrink-0 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Search</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {QUICK_FILTERS.map((f, i) => (
              <div
                key={f}
                className="rounded-md px-2 py-0.5 text-[9px] font-medium"
                style={{
                  background: i === 0 ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.05)",
                  color:      i === 0 ? "#c7d2fe"               : "rgba(255,255,255,0.4)",
                  border: `1px solid ${i === 0 ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.1)"}`,
                }}
              >
                {f}
              </div>
            ))}
          </div>
        </GlassContainer>

        {/* Domain group — mirrors GlassContainer + Collapsible */}
        <GlassContainer className="p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold tracking-tight">state.edu</span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </div>

          <p className="text-[10px] tracking-tight text-foreground/60">Due today</p>

          <div className="flex flex-col gap-1.5">
            {ITEMS.map((a) => {
              const course = courseById(a.courseId)
              return (
                <div
                  key={a.id}
                  className="glass-border flex items-stretch overflow-hidden rounded-2xl"
                  style={{ background: hexRgba(course.color, 0.05) }}
                >
                  {/* Left icon strip */}
                  <div
                    className="flex w-9 shrink-0 items-center justify-center border-r border-white/10"
                    style={{ background: hexRgba(course.color, 0.5), color: course.color }}
                  >
                    <AssignmentTypeIcon type={a.type} />
                  </div>

                  {/* Content */}
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 py-1.5 pl-3 pr-2">
                    <p
                      className="truncate text-[10px] font-semibold"
                      style={{ color: hexRgba(course.color, 0.85) }}
                    >
                      {course.name}
                    </p>
                    <p className="truncate text-[11px] font-bold leading-tight text-card-foreground">
                      {a.title}
                    </p>
                    <p className="text-[9px] text-card-foreground/50">
                      Due: {a.dueLabel}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </GlassContainer>
      </div>

      {/* Floating bottom tab bar — mirrors GlassContainer pill in client.tsx */}
      <div className="absolute inset-x-3 bottom-2">
        <GlassContainer className="p-1.5">
          <div className="flex items-center">
            {TABS.map(({ label, Icon, active }) => (
              <div
                key={label}
                className="flex flex-1 items-center justify-center rounded-lg py-1.5"
                style={{ background: active ? "rgba(99,102,241,0.2)" : "transparent" }}
              >
                <Icon
                  className="size-4 shrink-0"
                  aria-label={label}
                  style={{ color: active ? "#a5b4fc" : "rgba(255,255,255,0.4)" }}
                />
              </div>
            ))}
          </div>
        </GlassContainer>
      </div>
    </div>
  )
}
