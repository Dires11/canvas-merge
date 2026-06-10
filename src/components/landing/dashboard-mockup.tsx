"use client"

import { useState } from "react"
import { FileText, CheckSquare, MessageSquare, Search, SlidersHorizontal, ExternalLink } from "lucide-react"
import {
  MOCK_COURSES,
  MOCK_ASSIGNMENTS,
  MOCK_COMPLETED,
  MOCK_ANNOUNCEMENTS,
  hexRgba,
  courseById,
  type MockAssignment,
} from "./mock-data"

type Tab = "assignments" | "completed" | "announcements"
type Chip = "all" | "overdue" | "today" | "tomorrow" | "no-due-date"

const DUE_GROUP_ORDER = ["overdue", "today", "tomorrow", "later"] as const

const DUE_GROUP_LABEL: Record<string, string> = {
  overdue: "Overdue",
  today: "Due today",
  tomorrow: "Due tomorrow",
  later: "Due in 3 days",
}

function AssignmentTypeIcon({ type, color }: { type: MockAssignment["type"]; color: string }) {
  const size = 15
  const stroke = 2
  if (type === "discussion")
    return <MessageSquare width={size} height={size} stroke={color} strokeWidth={stroke} fill="none" />
  if (type === "quiz")
    return <CheckSquare width={size} height={size} stroke={color} strokeWidth={stroke} fill="none" />
  return <FileText width={size} height={size} stroke={color} strokeWidth={stroke} fill="none" />
}

function hexToLight(hex: string) {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + 80)
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + 80)
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + 80)
  return `rgb(${r},${g},${b})`
}

export function DashboardMockup({ className = "" }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<Tab>("assignments")
  const [activeChip, setActiveChip] = useState<Chip>("all")
  const [activeCourse, setActiveCourse] = useState<string>("1")

  const filteredAssignments = MOCK_ASSIGNMENTS.filter((a) => {
    if (activeChip === "overdue") return a.dueGroup === "overdue"
    if (activeChip === "today") return a.dueGroup === "today"
    if (activeChip === "tomorrow") return a.dueGroup === "tomorrow"
    if (activeChip === "no-due-date") return false
    return true
  })

  const groupedAssignments = DUE_GROUP_ORDER.reduce<Record<string, MockAssignment[]>>((acc, group) => {
    const items = filteredAssignments.filter((a) => a.dueGroup === group)
    if (items.length) acc[group] = items
    return acc
  }, {})

  return (
    <div
      className={`overflow-hidden rounded-[14px] ${className}`}
      style={{
        fontFamily: "var(--font-geist-sans, -apple-system, BlinkMacSystemFont, 'Inter', sans-serif)",
        boxShadow:
          "0 50px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.10), 0 0 80px rgba(99,102,241,0.20)",
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-[11px]"
        style={{ background: "oklch(0.22 0.05 268)" }}
      >
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex h-[26px] w-[26px] items-center justify-center rounded-[7px] bg-white">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0f0f13" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-[13px] font-bold text-white/90">CanvasMerge</span>
        </div>

        <div
          className="ml-auto flex gap-[2px] rounded-[9px] p-[3px]"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
        >
          {(["assignments", "completed", "announcements"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="cursor-pointer rounded-[7px] px-[14px] py-[5px] text-[11px] font-semibold capitalize transition-all duration-150"
              style={{
                background: activeTab === tab ? "rgba(255,255,255,0.12)" : "transparent",
                color: activeTab === tab ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.40)",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-[10px] font-bold text-white">
          DM
        </div>
      </div>

      {/* Body */}
      <div className="flex" style={{ background: "oklch(0.27 0.05 268)", height: 460 }}>
        {/* Sidebar */}
        <div
          className="flex w-[200px] shrink-0 flex-col overflow-hidden"
          style={{ background: "oklch(0.235 0.05 268)", borderRight: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="scrollbar-hide flex-1 overflow-y-auto py-3">
            <div
              className="mb-[6px] px-[14px] pb-[9px] text-[10px] font-bold uppercase tracking-[0.07em]"
              style={{ color: "rgba(255,255,255,0.28)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              Courses · {MOCK_COURSES.length}
            </div>
            {MOCK_COURSES.map((course) => (
              <button
                key={course.id}
                onClick={() => setActiveCourse(course.id)}
                className="flex cursor-pointer items-stretch text-left transition-colors duration-150"
                style={{
                  margin: "0 8px 3px",
                  width: "calc(100% - 16px)",
                  borderRadius: 8,
                  overflow: "hidden",
                  borderStyle: "solid",
                  borderTopWidth: "1.7px",
                  borderRightWidth: "1.4px",
                  borderBottomWidth: "1.2px",
                  borderLeftWidth: "2px",
                  borderTopColor:
                    activeCourse === course.id ? hexRgba(course.color, 0.25) : "rgba(255,255,255,0.10)",
                  borderRightColor:
                    activeCourse === course.id ? hexRgba(course.color, 0.15) : "rgba(255,255,255,0.06)",
                  borderBottomColor:
                    activeCourse === course.id ? hexRgba(course.color, 0.15) : "rgba(255,255,255,0.06)",
                  borderLeftColor:
                    activeCourse === course.id ? hexRgba(course.color, 0.25) : "rgba(255,255,255,0.10)",
                  background:
                    activeCourse === course.id ? hexRgba(course.color, 0.12) : "rgba(255,255,255,0.05)",
                }}
              >
                <div className="w-3 shrink-0" style={{ background: course.color }} />
                <div className="min-w-0 flex-1 px-[10px] py-[7px]">
                  <div className="text-[9px]" style={{ color: "rgba(255,255,255,0.32)" }}>
                    {course.domain}
                  </div>
                  <div
                    className="truncate text-[11px] font-semibold"
                    style={{ color: activeCourse === course.id ? "#c7d2fe" : "rgba(255,255,255,0.78)" }}
                  >
                    {course.name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col gap-[10px] overflow-hidden p-3">
          {/* Filter bar */}
          <div
            className="flex shrink-0 flex-col gap-[7px] rounded-[11px] px-[11px] py-[9px]"
            style={{
              background: "rgba(255,255,255,0.08)",
              borderStyle: "solid",
              borderTopWidth: "1.7px",
              borderTopColor: "rgba(255,255,255,0.15)",
              borderRightWidth: "1.4px",
              borderRightColor: "rgba(255,255,255,0.10)",
              borderBottomWidth: "1.2px",
              borderBottomColor: "rgba(255,255,255,0.10)",
              borderLeftWidth: "2px",
              borderLeftColor: "rgba(255,255,255,0.15)",
            }}
          >
            <div className="flex items-center gap-[6px]">
              <div
                className="flex flex-1 items-center gap-[6px] rounded-[7px] px-[10px] py-[5px] text-[11px]"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: "rgba(255,255,255,0.40)",
                }}
              >
                <Search size={11} className="shrink-0" />
                Search assignments…
              </div>
              <div
                className="flex cursor-pointer items-center gap-[5px] rounded-[7px] px-[10px] py-[5px] text-[11px] font-semibold"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: "rgba(255,255,255,0.60)",
                }}
              >
                <SlidersHorizontal size={11} />
                Filter
              </div>
            </div>
            <div className="flex flex-wrap gap-[5px]">
              {(
                [
                  ["all", "All"],
                  ["overdue", "Overdue"],
                  ["today", "Due today"],
                  ["tomorrow", "This week"],
                  ["no-due-date", "No due date"],
                ] as [Chip, string][]
              ).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setActiveChip(val)}
                  className="cursor-pointer rounded-full px-[10px] py-[3px] text-[10px] font-semibold transition-all duration-150"
                  style={{
                    border: "1px solid",
                    borderColor: activeChip === val ? "rgba(99,102,241,0.38)" : "rgba(255,255,255,0.10)",
                    background: activeChip === val ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.04)",
                    color: activeChip === val ? "#c7d2fe" : "rgba(255,255,255,0.42)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="scrollbar-hide flex flex-1 flex-col gap-2 overflow-y-auto">
            {/* ASSIGNMENTS */}
            {activeTab === "assignments" && (
              <>
                {Object.entries(groupedAssignments).map(([group, items]) => (
                  <div key={group} className="flex flex-col gap-1">
                    <div
                      className="px-[2px] text-[9px] font-bold uppercase tracking-[0.07em]"
                      style={{ color: "rgba(255,255,255,0.28)" }}
                    >
                      {DUE_GROUP_LABEL[group]}
                    </div>
                    {items.map((a) => {
                      const course = courseById(a.courseId)
                      const iconColor = hexToLight(course.color)
                      return (
                        <div
                          key={a.id}
                          className="flex items-stretch overflow-hidden rounded-xl"
                          style={{
                            background: hexRgba(course.color, 0.07),
                            borderStyle: "solid",
                            borderTopWidth: "1.7px",
                            borderTopColor: "rgba(255,255,255,0.12)",
                            borderRightWidth: "1.4px",
                            borderRightColor: "rgba(255,255,255,0.07)",
                            borderBottomWidth: "1.2px",
                            borderBottomColor: "rgba(255,255,255,0.07)",
                            borderLeftWidth: "2px",
                            borderLeftColor: "rgba(255,255,255,0.12)",
                          }}
                        >
                          <div
                            className="flex w-11 shrink-0 items-center justify-center"
                            style={{
                              background: hexRgba(course.color, 0.5),
                              borderRight: "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            <AssignmentTypeIcon type={a.type} color={iconColor} />
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col px-[10px] py-[8px]">
                            <div
                              className="text-[9px] font-bold uppercase tracking-[0.05em]"
                              style={{ color: hexRgba(course.color, 0.85) }}
                            >
                              {course.name}
                            </div>
                            <div
                              className="mt-[1px] truncate text-[11.5px] font-bold"
                              style={{ color: "rgba(255,255,255,0.88)" }}
                            >
                              {a.title}
                            </div>
                            <div
                              className="mt-[3px] flex items-center gap-[3px] text-[9px]"
                              style={{
                                color:
                                  a.dueGroup === "overdue"
                                    ? "rgba(252,165,165,0.75)"
                                    : "rgba(255,255,255,0.28)",
                              }}
                            >
                              <svg
                                width="9"
                                height="9"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              {a.dueLabel}
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-col items-end justify-center gap-1 px-3">
                            <div className="text-[9.5px] font-semibold" style={{ color: "rgba(255,255,255,0.40)" }}>
                              {a.points} pts
                            </div>
                            <div
                              className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-white"
                              style={{
                                background: `linear-gradient(135deg, ${course.color}, ${course.color}cc)`,
                              }}
                            >
                              DM
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
                {Object.keys(groupedAssignments).length === 0 && (
                  <div
                    className="flex flex-1 items-center justify-center text-[12px]"
                    style={{ color: "rgba(255,255,255,0.28)" }}
                  >
                    No assignments match this filter.
                  </div>
                )}
              </>
            )}

            {/* COMPLETED */}
            {activeTab === "completed" && (
              <div className="flex flex-col gap-1">
                <div
                  className="px-[2px] text-[9px] font-bold uppercase tracking-[0.07em]"
                  style={{ color: "rgba(255,255,255,0.28)" }}
                >
                  Completed recently
                </div>
                {MOCK_COMPLETED.map((a) => {
                  const course = courseById(a.courseId)
                  return (
                    <div
                      key={a.id}
                      className="flex items-stretch overflow-hidden rounded-xl"
                      style={{
                        opacity: 0.65,
                        background: hexRgba(course.color, 0.04),
                        borderStyle: "solid",
                        borderTopWidth: "1.7px",
                        borderTopColor: "rgba(255,255,255,0.10)",
                        borderRightWidth: "1.4px",
                        borderRightColor: "rgba(255,255,255,0.06)",
                        borderBottomWidth: "1.2px",
                        borderBottomColor: "rgba(255,255,255,0.06)",
                        borderLeftWidth: "2px",
                        borderLeftColor: "rgba(255,255,255,0.10)",
                      }}
                    >
                      <div
                        className="flex w-11 shrink-0 items-center justify-center"
                        style={{
                          background: hexRgba(course.color, 0.25),
                          borderRight: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={hexRgba(course.color, 0.8)}
                          strokeWidth="2"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col px-[10px] py-[8px]">
                        <div
                          className="text-[9px] font-bold uppercase tracking-[0.05em]"
                          style={{ color: hexRgba(course.color, 0.6) }}
                        >
                          {course.name}
                        </div>
                        <div
                          className="mt-[1px] truncate text-[11.5px] font-bold line-through"
                          style={{ color: "rgba(255,255,255,0.40)" }}
                        >
                          {a.title}
                        </div>
                        <div
                          className="mt-[3px] flex items-center gap-[3px] text-[9px]"
                          style={{ color: "rgba(255,255,255,0.28)" }}
                        >
                          <svg
                            width="9"
                            height="9"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {a.dueLabel}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end justify-center gap-1 px-3">
                        <div className="text-[9.5px] font-semibold" style={{ color: "rgba(134,239,172,0.7)" }}>
                          {a.grade}
                        </div>
                        <div
                          className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-white"
                          style={{ background: hexRgba(course.color, 0.5) }}
                        >
                          DM
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ANNOUNCEMENTS */}
            {activeTab === "announcements" && (
              <div className="flex flex-col gap-2">
                {MOCK_ANNOUNCEMENTS.map((ann) => {
                  const course = courseById(ann.courseId)
                  const iconColor = hexToLight(course.color)
                  return (
                    <div
                      key={ann.id}
                      className="flex cursor-pointer items-stretch overflow-hidden rounded-xl"
                      style={{
                        background: hexRgba(course.color, 0.07),
                        borderStyle: "solid",
                        borderTopWidth: "1.7px",
                        borderTopColor: "rgba(255,255,255,0.12)",
                        borderRightWidth: "1.4px",
                        borderRightColor: "rgba(255,255,255,0.07)",
                        borderBottomWidth: "1.2px",
                        borderBottomColor: "rgba(255,255,255,0.07)",
                        borderLeftWidth: "2px",
                        borderLeftColor: "rgba(255,255,255,0.12)",
                      }}
                    >
                      <div
                        className="flex w-11 shrink-0 items-center justify-center"
                        style={{
                          background: hexRgba(course.color, 0.5),
                          borderRight: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={iconColor}
                          strokeWidth="2"
                        >
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col px-[10px] py-[8px]">
                        <div
                          className="text-[9px] font-bold uppercase tracking-[0.05em]"
                          style={{ color: hexRgba(course.color, 0.85) }}
                        >
                          {course.name}
                        </div>
                        <div
                          className="mt-[1px] truncate text-[11.5px] font-bold"
                          style={{ color: "rgba(255,255,255,0.88)" }}
                        >
                          {ann.title}
                        </div>
                        <div className="mt-[3px] text-[9px]" style={{ color: "rgba(255,255,255,0.28)" }}>
                          {course.domain} · posted {ann.postedAgo}
                        </div>
                      </div>
                      <div className="flex items-center px-3">
                        <ExternalLink size={13} style={{ color: "rgba(255,255,255,0.28)" }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
