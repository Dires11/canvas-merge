# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current landing page with a premium animated deep-space hero, interactive dashboard mockup, sticky scroll story, and scroll-triggered sections.

**Architecture:** `page.tsx` remains a server component that reads auth state and passes `isSignedIn` to client components under `src/components/landing/`. All animation, interactivity, and theming happens client-side. No new dependencies needed — Framer Motion v12 is already installed.

**Tech Stack:** Next.js 16 App Router, React 19, Framer Motion 12, Tailwind CSS 4, TypeScript, `useTheme` from `src/components/theme-provider.tsx`

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `public/canvas-guide/canvas-native.png` | Create | Canvas screenshot for scroll story step 1 |
| `src/components/landing/mock-data.ts` | Create | Typed mock courses + assignments + announcements |
| `src/components/landing/dashboard-mockup.tsx` | Create | Interactive tabbed dashboard (client component) |
| `src/components/landing/hero.tsx` | Create | Full-viewport hero with orbs, particles, stars, copy, mockup |
| `src/components/landing/scroll-story.tsx` | Create | Sticky 3-step scroll story |
| `src/components/landing/feature-cards.tsx` | Create | 4 whileInView feature cards |
| `src/components/landing/how-it-works.tsx` | Create | 3 slide-in steps |
| `src/components/landing/cta-section.tsx` | Create | Centered CTA with glow |
| `src/app/page.tsx` | Modify | Wire all landing sections, remove old content |

---

## Task 1: Copy Canvas screenshot asset

**Files:**
- Create: `public/canvas-guide/canvas-native.png`

- [ ] **Step 1: Copy the image**

```bash
cp /Users/davidmanaseryan/.claude/image-cache/af4009a6-04bc-477a-93d1-ae550e9570e1/1.png public/canvas-guide/canvas-native.png
```

- [ ] **Step 2: Verify**

```bash
ls -lh public/canvas-guide/canvas-native.png
```

Expected: file exists, size ~hundreds of KB.

- [ ] **Step 3: Commit**

```bash
git add public/canvas-guide/canvas-native.png
git commit -m "feat: add Canvas native screenshot for landing page scroll story"
```

---

## Task 2: Mock data

**Files:**
- Create: `src/components/landing/mock-data.ts`

- [ ] **Step 1: Create the file**

```ts
// src/components/landing/mock-data.ts

export type MockCourse = {
  id: string
  color: string
  domain: string
  name: string
}

export type MockAssignment = {
  id: string
  courseId: string
  type: 'assignment' | 'quiz' | 'discussion'
  title: string
  dueLabel: string
  dueGroup: 'overdue' | 'today' | 'tomorrow' | 'later'
  points: number
  done?: boolean
  grade?: string
}

export type MockAnnouncement = {
  id: string
  courseId: string
  title: string
  postedAgo: string
}

export const MOCK_COURSES: MockCourse[] = [
  { id: '1', color: '#6366f1', domain: 'state.edu',  name: 'Linear Algebra' },
  { id: '2', color: '#8b5cf6', domain: 'state.edu',  name: 'Algorithms II' },
  { id: '3', color: '#06b6d4', domain: 'cc.edu',     name: 'English 101' },
  { id: '4', color: '#f59e0b', domain: 'cc.edu',     name: 'Chemistry' },
  { id: '5', color: '#ec4899', domain: 'state.edu',  name: 'Psych 200' },
  { id: '6', color: '#22c55e', domain: 'other.edu',  name: 'Art Appreciation' },
  { id: '7', color: '#f97316', domain: 'state.edu',  name: 'Physics I' },
]

export const MOCK_ASSIGNMENTS: MockAssignment[] = [
  { id: 'a1', courseId: '2', type: 'discussion', title: 'Forum Post — Greedy vs Dynamic',          dueLabel: 'Overdue · Jun 7 at 11:59 PM',      dueGroup: 'overdue',   points: 30 },
  { id: 'a2', courseId: '1', type: 'assignment', title: 'Problem Set 7 — Eigenvalues & Diag.',     dueLabel: 'Due today at 11:59 PM',             dueGroup: 'today',     points: 50 },
  { id: 'a3', courseId: '3', type: 'assignment', title: 'Reading Response — The Great Gatsby Ch.4',dueLabel: 'Due today at 11:59 PM',             dueGroup: 'today',     points: 25 },
  { id: 'a4', courseId: '4', type: 'assignment', title: 'Lab Report — Acid-Base Titration',        dueLabel: 'Due tomorrow at 9:00 AM',           dueGroup: 'tomorrow',  points: 100 },
  { id: 'a5', courseId: '6', type: 'quiz',       title: 'Being a Successful Student Online Quiz',  dueLabel: 'Due tomorrow at 11:59 PM',          dueGroup: 'tomorrow',  points: 7 },
  { id: 'a6', courseId: '5', type: 'assignment', title: 'Reflection Paper — Cognitive Biases',     dueLabel: 'Due Jun 12 at 11:59 PM',            dueGroup: 'later',     points: 40 },
]

export const MOCK_COMPLETED: MockAssignment[] = [
  { id: 'c1', courseId: '1', type: 'assignment', title: 'Problem Set 6 — Orthogonality',           dueLabel: 'Submitted Jun 5',  dueGroup: 'today', points: 50,  done: true, grade: '50/50' },
  { id: 'c2', courseId: '4', type: 'assignment', title: 'Prelab — Equilibrium Constants',          dueLabel: 'Submitted Jun 4',  dueGroup: 'today', points: 15,  done: true, grade: '14/15' },
  { id: 'c3', courseId: '3', type: 'assignment', title: 'Essay Draft — Symbolism in Literature',   dueLabel: 'Submitted Jun 3',  dueGroup: 'today', points: 75,  done: true, grade: '72/75' },
  { id: 'c4', courseId: '2', type: 'quiz',       title: 'Quiz 3 — Graph Traversal',                dueLabel: 'Submitted Jun 2',  dueGroup: 'today', points: 20,  done: true, grade: '20/20' },
]

export const MOCK_ANNOUNCEMENTS: MockAnnouncement[] = [
  { id: 'n1', courseId: '1', title: 'Midterm exam moved to June 15 — please read',                  postedAgo: '2 hours ago' },
  { id: 'n2', courseId: '4', title: 'Lab safety reminder — goggles required this Thursday',         postedAgo: '5 hours ago' },
  { id: 'n3', courseId: '6', title: 'Welcome to the course — syllabus and week 1 materials posted', postedAgo: 'yesterday' },
  { id: 'n4', courseId: '2', title: 'Office hours rescheduled — see updated Zoom link below',       postedAgo: '2 days ago' },
]

/** Hex → rgba string helper */
export function hexRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export function courseById(id: string): MockCourse {
  return MOCK_COURSES.find((c) => c.id === id) ?? MOCK_COURSES[0]
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/mock-data.ts
git commit -m "feat: add landing page mock data"
```

---

## Task 3: Dashboard mockup component

**Files:**
- Create: `src/components/landing/dashboard-mockup.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/landing/dashboard-mockup.tsx
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
  const iconColor = color
  const size = 15
  const stroke = 2
  if (type === "discussion")
    return <MessageSquare width={size} height={size} stroke={iconColor} strokeWidth={stroke} fill="none" />
  if (type === "quiz")
    return <CheckSquare width={size} height={size} stroke={iconColor} strokeWidth={stroke} fill="none" />
  return <FileText width={size} height={size} stroke={iconColor} strokeWidth={stroke} fill="none" />
}

function hexToLight(hex: string) {
  // returns a lighter tint of the hex color for icon strokes
  const r = Math.min(255, parseInt(hex.slice(1,3),16) + 80)
  const g = Math.min(255, parseInt(hex.slice(3,5),16) + 80)
  const b = Math.min(255, parseInt(hex.slice(5,7),16) + 80)
  return `rgb(${r},${g},${b})`
}

export function DashboardMockup({ className = "" }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<Tab>("assignments")
  const [activeChip, setActiveChip] = useState<Chip>("all")
  const [activeCourse, setActiveCourse] = useState<string>("1")

  const filteredAssignments = MOCK_ASSIGNMENTS.filter((a) => {
    if (activeChip === "overdue") return a.dueGroup === "overdue"
    if (activeChip === "today")   return a.dueGroup === "today"
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
        boxShadow: "0 50px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.10), 0 0 80px rgba(99,102,241,0.20)",
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center gap-3 px-4 py-[11px] border-b border-white/7"
        style={{ background: "oklch(0.22 0.05 268)" }}
      >
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-[26px] h-[26px] bg-white rounded-[7px] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0f0f13" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-[13px] font-bold text-white/90">CanvasMerge</span>
        </div>

        <div
          className="flex gap-[2px] ml-auto rounded-[9px] p-[3px]"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
        >
          {(["assignments", "completed", "announcements"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="text-[11px] font-semibold px-[14px] py-[5px] rounded-[7px] capitalize cursor-pointer transition-all duration-150"
              style={{
                background: activeTab === tab ? "rgba(255,255,255,0.12)" : "transparent",
                color: activeTab === tab ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.40)",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
          DM
        </div>
      </div>

      {/* Body */}
      <div className="flex" style={{ background: "oklch(0.27 0.05 268)", height: 460 }}>
        {/* Sidebar */}
        <div
          className="w-[200px] shrink-0 flex flex-col overflow-hidden"
          style={{ background: "oklch(0.235 0.05 268)", borderRight: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="overflow-y-auto flex-1 py-3 scrollbar-hide">
            <div
              className="text-[10px] font-bold uppercase tracking-[0.07em] px-[14px] pb-[9px] mb-[6px]"
              style={{ color: "rgba(255,255,255,0.28)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              Courses · {MOCK_COURSES.length}
            </div>
            {MOCK_COURSES.map((course) => (
              <button
                key={course.id}
                onClick={() => setActiveCourse(course.id)}
                className="flex items-stretch w-full mx-0 text-left cursor-pointer transition-colors duration-150"
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
                  borderTopColor: activeCourse === course.id ? hexRgba(course.color, 0.25) : "rgba(255,255,255,0.10)",
                  borderRightColor: activeCourse === course.id ? hexRgba(course.color, 0.15) : "rgba(255,255,255,0.06)",
                  borderBottomColor: activeCourse === course.id ? hexRgba(course.color, 0.15) : "rgba(255,255,255,0.06)",
                  borderLeftColor: activeCourse === course.id ? hexRgba(course.color, 0.25) : "rgba(255,255,255,0.10)",
                  background: activeCourse === course.id ? hexRgba(course.color, 0.12) : "rgba(255,255,255,0.05)",
                }}
              >
                <div className="w-3 shrink-0" style={{ background: course.color }} />
                <div className="px-[10px] py-[7px] flex-1 min-w-0">
                  <div className="text-[9px]" style={{ color: "rgba(255,255,255,0.32)" }}>{course.domain}</div>
                  <div
                    className="text-[11px] font-semibold truncate"
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
        <div className="flex-1 min-w-0 p-3 flex flex-col gap-[10px] overflow-hidden">
          {/* Filter bar */}
          <div
            className="shrink-0 flex flex-col gap-[7px] rounded-[11px] px-[11px] py-[9px]"
            style={{
              background: "rgba(255,255,255,0.08)",
              borderStyle: "solid",
              borderTopWidth: "1.7px", borderTopColor: "rgba(255,255,255,0.15)",
              borderRightWidth: "1.4px", borderRightColor: "rgba(255,255,255,0.10)",
              borderBottomWidth: "1.2px", borderBottomColor: "rgba(255,255,255,0.10)",
              borderLeftWidth: "2px", borderLeftColor: "rgba(255,255,255,0.15)",
            }}
          >
            <div className="flex gap-[6px] items-center">
              <div
                className="flex-1 flex items-center gap-[6px] rounded-[7px] px-[10px] py-[5px] text-[11px]"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.40)" }}
              >
                <Search size={11} className="shrink-0" />
                Search assignments…
              </div>
              <div
                className="flex items-center gap-[5px] rounded-[7px] px-[10px] py-[5px] text-[11px] font-semibold cursor-pointer"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.60)" }}
              >
                <SlidersHorizontal size={11} />
                Filter
              </div>
            </div>
            <div className="flex gap-[5px] flex-wrap">
              {([
                ["all", "All"],
                ["overdue", "Overdue"],
                ["today", "Due today"],
                ["tomorrow", "This week"],
                ["no-due-date", "No due date"],
              ] as [Chip, string][]).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setActiveChip(val)}
                  className="text-[10px] font-semibold px-[10px] py-[3px] rounded-full cursor-pointer transition-all duration-150"
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
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 scrollbar-hide">

            {/* ASSIGNMENTS */}
            {activeTab === "assignments" && (
              <>
                {Object.entries(groupedAssignments).map(([group, items]) => (
                  <div key={group} className="flex flex-col gap-1">
                    <div className="text-[9px] font-bold uppercase tracking-[0.07em] px-[2px]" style={{ color: "rgba(255,255,255,0.28)" }}>
                      {DUE_GROUP_LABEL[group]}
                    </div>
                    {items.map((a) => {
                      const course = courseById(a.courseId)
                      const iconColor = hexToLight(course.color)
                      return (
                        <div
                          key={a.id}
                          className="flex items-stretch rounded-xl overflow-hidden"
                          style={{
                            background: hexRgba(course.color, 0.07),
                            borderStyle: "solid",
                            borderTopWidth: "1.7px", borderTopColor: "rgba(255,255,255,0.12)",
                            borderRightWidth: "1.4px", borderRightColor: "rgba(255,255,255,0.07)",
                            borderBottomWidth: "1.2px", borderBottomColor: "rgba(255,255,255,0.07)",
                            borderLeftWidth: "2px", borderLeftColor: "rgba(255,255,255,0.12)",
                          }}
                        >
                          <div className="w-11 shrink-0 flex items-center justify-center" style={{ background: hexRgba(course.color, 0.5), borderRight: "1px solid rgba(255,255,255,0.08)" }}>
                            <AssignmentTypeIcon type={a.type} color={iconColor} />
                          </div>
                          <div className="flex-1 min-w-0 px-[10px] py-[8px] flex flex-col">
                            <div className="text-[9px] font-bold uppercase tracking-[0.05em]" style={{ color: hexRgba(course.color, 0.85) }}>
                              {course.name}
                            </div>
                            <div className="text-[11.5px] font-bold truncate mt-[1px]" style={{ color: "rgba(255,255,255,0.88)" }}>
                              {a.title}
                            </div>
                            <div className="flex items-center gap-[3px] mt-[3px] text-[9px]" style={{ color: a.dueGroup === "overdue" ? "rgba(252,165,165,0.75)" : "rgba(255,255,255,0.28)" }}>
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                              {a.dueLabel}
                            </div>
                          </div>
                          <div className="flex flex-col items-end justify-center shrink-0 px-3 gap-1">
                            <div className="text-[9.5px] font-semibold" style={{ color: "rgba(255,255,255,0.40)" }}>{a.points} pts</div>
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ background: `linear-gradient(135deg, ${course.color}, ${course.color}cc)` }}>DM</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
                {Object.keys(groupedAssignments).length === 0 && (
                  <div className="flex items-center justify-center flex-1 text-[12px]" style={{ color: "rgba(255,255,255,0.28)" }}>
                    No assignments match this filter.
                  </div>
                )}
              </>
            )}

            {/* COMPLETED */}
            {activeTab === "completed" && (
              <div className="flex flex-col gap-1">
                <div className="text-[9px] font-bold uppercase tracking-[0.07em] px-[2px]" style={{ color: "rgba(255,255,255,0.28)" }}>
                  Completed recently
                </div>
                {MOCK_COMPLETED.map((a) => {
                  const course = courseById(a.courseId)
                  return (
                    <div
                      key={a.id}
                      className="flex items-stretch rounded-xl overflow-hidden"
                      style={{
                        opacity: 0.65,
                        background: hexRgba(course.color, 0.04),
                        borderStyle: "solid",
                        borderTopWidth: "1.7px", borderTopColor: "rgba(255,255,255,0.10)",
                        borderRightWidth: "1.4px", borderRightColor: "rgba(255,255,255,0.06)",
                        borderBottomWidth: "1.2px", borderBottomColor: "rgba(255,255,255,0.06)",
                        borderLeftWidth: "2px", borderLeftColor: "rgba(255,255,255,0.10)",
                      }}
                    >
                      <div className="w-11 shrink-0 flex items-center justify-center" style={{ background: hexRgba(course.color, 0.25), borderRight: "1px solid rgba(255,255,255,0.08)" }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={hexRgba(course.color, 0.8)} strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <div className="flex-1 min-w-0 px-[10px] py-[8px] flex flex-col">
                        <div className="text-[9px] font-bold uppercase tracking-[0.05em]" style={{ color: hexRgba(course.color, 0.6) }}>{course.name}</div>
                        <div className="text-[11.5px] font-bold truncate mt-[1px] line-through" style={{ color: "rgba(255,255,255,0.40)" }}>{a.title}</div>
                        <div className="flex items-center gap-[3px] mt-[3px] text-[9px]" style={{ color: "rgba(255,255,255,0.28)" }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                          {a.dueLabel}
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-center shrink-0 px-3 gap-1">
                        <div className="text-[9.5px] font-semibold" style={{ color: "rgba(134,239,172,0.7)" }}>{a.grade}</div>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ background: hexRgba(course.color, 0.5) }}>DM</div>
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
                      className="flex items-stretch rounded-xl overflow-hidden cursor-pointer"
                      style={{
                        background: hexRgba(course.color, 0.07),
                        borderStyle: "solid",
                        borderTopWidth: "1.7px", borderTopColor: "rgba(255,255,255,0.12)",
                        borderRightWidth: "1.4px", borderRightColor: "rgba(255,255,255,0.07)",
                        borderBottomWidth: "1.2px", borderBottomColor: "rgba(255,255,255,0.07)",
                        borderLeftWidth: "2px", borderLeftColor: "rgba(255,255,255,0.12)",
                      }}
                    >
                      <div className="w-11 shrink-0 flex items-center justify-center" style={{ background: hexRgba(course.color, 0.5), borderRight: "1px solid rgba(255,255,255,0.08)" }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                      </div>
                      <div className="flex-1 min-w-0 px-[10px] py-[8px] flex flex-col">
                        <div className="text-[9px] font-bold uppercase tracking-[0.05em]" style={{ color: hexRgba(course.color, 0.85) }}>{course.name}</div>
                        <div className="text-[11.5px] font-bold truncate mt-[1px]" style={{ color: "rgba(255,255,255,0.88)" }}>{ann.title}</div>
                        <div className="text-[9px] mt-[3px]" style={{ color: "rgba(255,255,255,0.28)" }}>{course.domain} · posted {ann.postedAgo}</div>
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
```

- [ ] **Step 2: Start dev server and verify the component renders without TypeScript errors**

```bash
npm run dev
```

Open http://localhost:3000 — the existing page should still load. TypeScript errors will appear in the terminal if any.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/mock-data.ts src/components/landing/dashboard-mockup.tsx
git commit -m "feat: add interactive dashboard mockup component"
```

---

## Task 4: Hero section

**Files:**
- Create: `src/components/landing/hero.tsx`

- [ ] **Step 1: Create the file**

```tsx
// src/components/landing/hero.tsx
"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { DashboardMockup } from "./dashboard-mockup"

const PARTICLES = [
  { left: "8%",  size: 2,   duration: 5.2, delay: 0    },
  { left: "22%", size: 1.5, duration: 6.8, delay: -1.6 },
  { left: "44%", size: 2,   duration: 4.8, delay: -3.1 },
  { left: "60%", size: 1,   duration: 7.2, delay: -0.9 },
  { left: "78%", size: 2,   duration: 5.6, delay: -2.2 },
  { left: "34%", size: 1.5, duration: 8.3, delay: -4.4 },
  { left: "70%", size: 1,   duration: 6.1, delay: -1.1 },
  { left: "52%", size: 1.5, duration: 5.9, delay: -2.7 },
]

export function Hero({ isSignedIn }: { isSignedIn: boolean }) {
  const reduce = useReducedMotion()

  const primaryHref  = isSignedIn ? "/dashboard" : "/sign-up"
  const primaryLabel = isSignedIn ? "Open dashboard" : "Start merging"

  // Stagger factory
  const fadeUp = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
        }

  return (
    <section
      className="relative isolate min-h-screen overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #020617 0%, #0f172a 40%, #1e1040 70%, #0c1445 100%)",
      }}
    >
      {/* ── Stars ── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            "radial-gradient(1.5px 1.5px at 5% 8%,  rgba(255,255,255,0.90) 0%, transparent 100%)",
            "radial-gradient(1px   1px   at 18% 6%,  rgba(255,255,255,0.65) 0%, transparent 100%)",
            "radial-gradient(1px   1px   at 38% 14%, rgba(255,255,255,0.50) 0%, transparent 100%)",
            "radial-gradient(1.5px 1.5px at 62% 4%,  rgba(255,255,255,0.80) 0%, transparent 100%)",
            "radial-gradient(1px   1px   at 75% 12%, rgba(255,255,255,0.55) 0%, transparent 100%)",
            "radial-gradient(1px   1px   at 90% 7%,  rgba(255,255,255,0.70) 0%, transparent 100%)",
            "radial-gradient(1px   1px   at 12% 38%, rgba(255,255,255,0.45) 0%, transparent 100%)",
            "radial-gradient(1px   1px   at 52% 28%, rgba(255,255,255,0.55) 0%, transparent 100%)",
            "radial-gradient(1.5px 1.5px at 95% 45%, rgba(255,255,255,0.65) 0%, transparent 100%)",
            "radial-gradient(1px   1px   at 28% 60%, rgba(255,255,255,0.40) 0%, transparent 100%)",
          ].join(", "),
          animation: reduce ? undefined : "twinkle 10s ease-in-out infinite alternate",
        }}
      />

      {/* ── Orbs ── */}
      {!reduce && (
        <>
          <motion.div
            className="pointer-events-none absolute rounded-full"
            style={{ width: 640, height: 640, top: -230, right: -60, background: "radial-gradient(circle, rgba(99,102,241,0.38) 0%, transparent 65%)" }}
            animate={{ x: [0, -28, 12, 0], y: [0, 18, -14, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute rounded-full"
            style={{ width: 440, height: 440, bottom: -150, left: -80, background: "radial-gradient(circle, rgba(139,92,246,0.30) 0%, transparent 65%)" }}
            animate={{ x: [0, 28, 0], y: [0, -22, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute rounded-full"
            style={{ width: 300, height: 300, top: "45%", left: "36%", background: "radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 65%)" }}
            animate={{ y: [0, -28, 0] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {/* ── Particles ── */}
      {!reduce && PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute rounded-full bg-white/55"
          style={{ width: p.size, height: p.size, left: p.left, top: "95%" }}
          animate={{ y: [0, "-100vh"], x: [0, 12] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}

      {/* ── Navbar ── */}
      {!isSignedIn && (
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-[18px] sm:px-14">
          <div className="flex items-center gap-[10px] text-white text-[15px] font-bold">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Sparkles className="size-[14px] text-slate-950" />
            </div>
            CanvasMerge
          </div>
          <div className="flex gap-2">
            <Link
              href="/sign-in"
              className="text-[13px] font-semibold px-4 py-[7px] rounded-lg text-white/80 transition-colors hover:text-white"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)" }}
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="text-[13px] font-bold px-4 py-[7px] rounded-lg bg-white text-slate-950 hover:bg-white/90 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      )}

      {/* ── Content grid ── */}
      <div className="relative z-10 grid items-center gap-10 px-6 pt-[100px] pb-[60px] sm:px-14 lg:grid-cols-[1fr_1.3fr]">
        {/* Left — copy */}
        <div className="flex flex-col">
          <motion.div {...fadeUp(0)}>
            <div
              className="mb-[22px] inline-flex items-center gap-2 rounded-full px-[14px] py-[5px] text-[12px] font-semibold text-white/72"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)" }}
            >
              <Sparkles className="size-[13px] text-indigo-300" />
              Built for students with more than one Canvas world
            </div>
          </motion.div>

          <motion.h1
            {...fadeUp(0.1)}
            className="text-[clamp(46px,5.5vw,80px)] font-black leading-[0.95] tracking-[-0.035em] text-white"
          >
            Every Canvas.
            <br />
            <span className="text-[#a5b4fc]">One view.</span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.22)}
            className="mt-[18px] max-w-[460px] text-[16px] leading-[1.65] text-white/58"
          >
            One calm command center for every Canvas campus, course, due date, and assignment competing for your attention.
          </motion.p>

          <motion.div {...fadeUp(0.34)} className="mt-[26px] flex gap-[10px]">
            <Link
              href={primaryHref}
              className="inline-flex items-center gap-[6px] rounded-[10px] bg-white px-[22px] py-3 text-[14px] font-bold text-slate-950 hover:bg-white/90 transition-colors"
            >
              {primaryLabel}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-[10px] px-[22px] py-3 text-[14px] font-semibold text-white/80 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)" }}
            >
              View dashboard
            </Link>
          </motion.div>
        </div>

        {/* Right — dashboard mockup (hidden on mobile) */}
        <motion.div
          className="hidden lg:flex items-center justify-center"
          initial={reduce ? undefined : { opacity: 0, y: 18 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          <div style={{ width: "100%", perspective: 1200 }}>
            <motion.div
              animate={reduce ? undefined : { y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              <DashboardMockup />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ── Scroll hint ── */}
      {!reduce && (
        <motion.div
          className="absolute bottom-[26px] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-[5px]"
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-1 h-1 rounded-full bg-white/38" />
          <div className="w-px h-7" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.30), transparent)" }} />
          <div className="w-1 h-1 rounded-full bg-white/38" />
        </motion.div>
      )}

      {/* ── Twinkle keyframe ── */}
      <style>{`@keyframes twinkle{0%{opacity:.7}100%{opacity:1}}`}</style>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/hero.tsx
git commit -m "feat: add animated hero section"
```

---

## Task 5: Scroll story section

**Files:**
- Create: `src/components/landing/scroll-story.tsx`

- [ ] **Step 1: Create the file**

```tsx
// src/components/landing/scroll-story.tsx
"use client"

import { useRef } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion"
import { hexRgba, courseById, MOCK_COURSES, MOCK_ASSIGNMENTS } from "./mock-data"

function SyncVis() {
  const DOMAINS = [
    { name: "state.edu", courses: 4, color: "#6366f1" },
    { name: "cc.edu",    courses: 3, color: "#06b6d4" },
    { name: "other.edu", courses: 2, color: "#f59e0b" },
  ]
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden p-5" style={{ background: "#0a0c16" }}>
      {/* Hub glow */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{ width: 200, height: 200, top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)", animation: "hub-glow 3s ease-in-out infinite" }}
      />

      <div className="relative z-10 flex w-full items-center gap-0">
        {/* Domain nodes */}
        <div className="flex flex-1 flex-col gap-3">
          {DOMAINS.map((d) => (
            <div
              key={d.name}
              className="flex items-center gap-2 rounded-lg px-[10px] py-[7px]"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg" style={{ background: hexRgba(d.color, 0.15) }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={d.color} strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <div>
                <div className="text-[10px] font-bold text-white/80">{d.name}</div>
                <div className="text-[9px] text-white/35">{d.courses} courses</div>
              </div>
            </div>
          ))}
        </div>

        {/* SVG lines with animated dots */}
        <div className="w-14 shrink-0">
          <svg viewBox="0 0 56 200" className="h-[200px] w-14 overflow-visible">
            <defs>
              <filter id="glow2"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              <path id="pt" d="M 0,33 C 28,33 28,100 56,100"/>
              <path id="pm" d="M 0,100 L 56,100"/>
              <path id="pb" d="M 0,167 C 28,167 28,100 56,100"/>
            </defs>
            <path d="M 0,33 C 28,33 28,100 56,100"  stroke="rgba(165,180,252,0.22)" strokeWidth="1.5" fill="none"/>
            <path d="M 0,100 L 56,100"               stroke="rgba(165,180,252,0.22)" strokeWidth="1.5" fill="none"/>
            <path d="M 0,167 C 28,167 28,100 56,100" stroke="rgba(165,180,252,0.22)" strokeWidth="1.5" fill="none"/>
            {[
              { id: "pt", begin: "0s" },
              { id: "pm", begin: "0.55s" },
              { id: "pb", begin: "1.1s" },
            ].map(({ id, begin }) => (
              <circle key={id} r="3" fill="#a5b4fc" filter="url(#glow2)" opacity="0">
                <animateMotion dur="1.6s" repeatCount="indefinite" begin={begin}>
                  <mpath href={`#${id}`}/>
                </animateMotion>
                <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.05;.15;.85;1" dur="1.6s" repeatCount="indefinite" begin={begin}/>
              </circle>
            ))}
          </svg>
        </div>

        {/* Hub */}
        <div className="flex shrink-0 flex-col items-center gap-2">
          <div
            className="flex size-14 items-center justify-center rounded-full"
            style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", boxShadow: "0 0 0 6px rgba(99,102,241,0.15), 0 0 24px rgba(99,102,241,0.40)", animation: "hub-pulse 2.5s ease-in-out infinite" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div className="text-center text-[9px] font-bold leading-[1.3] tracking-[0.05em] text-white/55">Canvas<br/>Merge</div>
        </div>
      </div>

      {/* Status bar */}
      <div
        className="absolute bottom-[14px] left-[14px] right-[14px] flex items-center gap-[7px] rounded-lg px-[10px] py-[6px]"
        style={{ background: "rgba(99,102,241,0.10)", border: "1px solid rgba(99,102,241,0.22)" }}
      >
        <div className="size-3 shrink-0 rounded-full border-2 border-indigo-700/40 border-t-indigo-400" style={{ animation: "spin .9s linear infinite" }}/>
        <span className="flex-1 text-[10px] font-semibold text-white/55">Syncing planner items…</span>
        <div className="flex gap-[3px]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="size-[5px] rounded-full bg-indigo-500/50" style={{ animation: `blink 1.2s ${i * 0.2}s ease-in-out infinite` }}/>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes hub-glow  {0%,100%{opacity:.6;transform:translate(-50%,-50%) scale(1)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.15)}}
        @keyframes hub-pulse {0%,100%{box-shadow:0 0 0 6px rgba(99,102,241,.15),0 0 24px rgba(99,102,241,.40)}50%{box-shadow:0 0 0 10px rgba(99,102,241,.08),0 0 36px rgba(99,102,241,.65)}}
        @keyframes spin      {to{transform:rotate(360deg)}}
        @keyframes blink     {0%,100%{opacity:.3;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}
      `}</style>
    </div>
  )
}

function MiniDash() {
  const miniCourses = MOCK_COURSES.slice(0, 5)
  const miniItems = MOCK_ASSIGNMENTS.filter((a) => a.dueGroup === "today" || a.dueGroup === "tomorrow").slice(0, 3)
  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ background: "oklch(0.27 0.05 268)", fontSize: 10 }}>
      {/* topbar */}
      <div className="flex items-center justify-between px-[11px] py-[7px] border-b border-white/7" style={{ background: "oklch(0.22 0.05 268)" }}>
        <div className="flex items-center gap-[5px] text-[10px] font-bold text-white/90">
          <div className="size-[18px] bg-white rounded flex items-center justify-center">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#0f0f13" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5"/></svg>
          </div>
          CanvasMerge
        </div>
        <div className="flex gap-[1px] rounded-[6px] p-[2px]" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {["Assignments","Completed"].map((t,i) => (
            <div key={t} className={`text-[9px] font-semibold rounded px-2 py-[2px]`} style={{ background: i===0?"rgba(255,255,255,0.12)":"transparent", color: i===0?"rgba(255,255,255,.9)":"rgba(255,255,255,.4)" }}>{t}</div>
          ))}
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* sidebar */}
        <div className="w-[100px] shrink-0 border-r border-white/6 py-2" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="px-2 pb-[5px] text-[7px] font-bold uppercase tracking-[.07em] border-b border-white/4 mb-1" style={{ color: "rgba(255,255,255,.25)" }}>Courses · {MOCK_COURSES.length}</div>
          {miniCourses.map((c, i) => (
            <div key={c.id} className="flex items-stretch mx-1 mb-[2px] rounded overflow-hidden" style={{ background: i===0?"rgba(99,102,241,.10)":"rgba(255,255,255,.03)", border: `1px solid ${i===0?"rgba(99,102,241,.20)":"rgba(255,255,255,.06)"}` }}>
              <div className="w-[2.5px] shrink-0" style={{ background: c.color }}/>
              <div className="px-[6px] py-[3px] min-w-0">
                <div className="text-[7px]" style={{ color: "rgba(255,255,255,.28)" }}>{c.domain}</div>
                <div className="text-[8px] font-semibold truncate" style={{ color: i===0?"#c7d2fe":"rgba(255,255,255,.72)" }}>{c.name}</div>
              </div>
            </div>
          ))}
        </div>
        {/* main */}
        <div className="flex-1 p-[7px] flex flex-col gap-1 overflow-hidden">
          <div className="flex gap-[3px]">
            <div className="flex-1 flex items-center gap-[3px] rounded px-[7px] py-[3px] text-[8px]" style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", color: "rgba(255,255,255,.28)" }}>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>Search…
            </div>
          </div>
          <div className="flex gap-[2px]">
            {["All","Overdue","Today"].map((l,i) => (
              <div key={l} className="text-[7px] font-semibold px-[6px] py-[2px] rounded-full" style={{ background: i===0?"rgba(99,102,241,.15)":"rgba(255,255,255,.04)", border: `1px solid ${i===0?"rgba(99,102,241,.30)":"rgba(255,255,255,.08)"}`, color: i===0?"#c7d2fe":"rgba(255,255,255,.32)" }}>{l}</div>
            ))}
          </div>
          {miniItems.map((a) => {
            const c = courseById(a.courseId)
            return (
              <div key={a.id} className="flex items-stretch rounded-lg overflow-hidden" style={{ background: hexRgba(c.color, 0.07), borderStyle: "solid", borderTopWidth: "1.7px", borderTopColor: "rgba(255,255,255,.10)", borderRightWidth: "1.4px", borderRightColor: "rgba(255,255,255,.06)", borderBottomWidth: "1.2px", borderBottomColor: "rgba(255,255,255,.06)", borderLeftWidth: "2px", borderLeftColor: "rgba(255,255,255,.10)" }}>
                <div className="w-6 shrink-0 flex items-center justify-center" style={{ background: hexRgba(c.color, 0.5), borderRight: "1px solid rgba(255,255,255,.08)" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div className="flex-1 min-w-0 px-[5px] py-[4px]">
                  <div className="text-[7px] font-bold uppercase" style={{ color: hexRgba(c.color, 0.8) }}>{c.name}</div>
                  <div className="text-[8px] font-bold truncate" style={{ color: "rgba(255,255,255,.82)" }}>{a.title}</div>
                  <div className="text-[7px] mt-[1px]" style={{ color: "rgba(255,255,255,.28)" }}>{a.dueLabel}</div>
                </div>
                <div className="flex flex-col items-end justify-center px-[5px] gap-[2px]">
                  <div className="text-[7px]" style={{ color: "rgba(255,255,255,.30)" }}>{a.points} pts</div>
                  <div className="size-3 rounded-full flex items-center justify-center text-[6px] font-bold text-white" style={{ background: c.color }}>D</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

type StepProps = {
  num: number
  active: boolean
  title: string
  desc: string
  children: React.ReactNode
}

function Step({ num, active, title, desc, children }: StepProps) {
  return (
    <div className="flex flex-col items-center px-4">
      <div
        className="z-10 mb-[18px] flex size-[38px] shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold transition-all duration-500"
        style={{
          background: active ? "#6366f1" : "#09090e",
          border: `1.5px solid ${active ? "#6366f1" : "rgba(99,102,241,0.40)"}`,
          color: active ? "#fff" : "rgba(165,180,252,0.7)",
          boxShadow: active ? "0 0 0 8px rgba(99,102,241,0.12)" : "none",
        }}
      >
        {num}
      </div>

      <div
        className="mb-[14px] w-full overflow-hidden rounded-xl"
        style={{
          height: 300,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
          opacity: active ? 1 : 0.5,
          transform: active ? "scale(1)" : "scale(0.97)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        {children}
      </div>

      <div className="text-center text-[13px] font-bold text-white/95 mb-[5px]" style={{ opacity: active ? 1 : 0.5, transition: "opacity 0.4s" }}>{title}</div>
      <div className="text-center text-[11px] leading-[1.55]" style={{ color: "rgba(255,255,255,0.38)", opacity: active ? 1 : 0.5, transition: "opacity 0.4s" }}>{desc}</div>
    </div>
  )
}

export function ScrollStory() {
  const containerRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const activeRaw = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], [0, 1, 2, 2])

  // Without scroll (reduced motion or SSR), default to step 0 active
  const activeStep = reduce ? 0 : undefined

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: reduce ? "auto" : "300vh", background: "#09090e", borderTop: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className={reduce ? "py-20 px-14" : "sticky top-0 flex h-screen flex-col items-center justify-center px-14 py-16 overflow-hidden"}>
        <div className="mb-12 text-center">
          <div className="text-[11px] font-bold uppercase tracking-[.1em] text-indigo-400 mb-[10px]">From chaos to clarity</div>
          <h2 className="text-[clamp(28px,3.5vw,42px)] font-extrabold text-white leading-[1.1]">Canvas is scattered. CanvasMerge isn&apos;t.</h2>
          <p className="mt-2 text-[15px] text-white/42">Three campuses, one place, zero juggling.</p>
        </div>

        <ActiveStepGrid activeRaw={reduce ? undefined : activeRaw} reduce={!!reduce} />
      </div>
    </div>
  )
}

// Separate client sub-component that reads the MotionValue
function ActiveStepGrid({ activeRaw, reduce }: { activeRaw: ReturnType<typeof useTransform> | undefined; reduce: boolean }) {
  "use client"
  const [activeStep, setActiveStep] = React.useState(0)

  React.useEffect(() => {
    if (!activeRaw) return
    const unsub = activeRaw.on("change", (v) => setActiveStep(Math.round(v)))
    return unsub
  }, [activeRaw])

  return (
    <div className="relative grid w-full max-w-[1080px] grid-cols-3">
      {/* connecting line */}
      <div
        className="pointer-events-none absolute"
        style={{ top: 19, left: "calc(16.66% + 16px)", right: "calc(16.66% + 16px)", height: 1, background: "linear-gradient(90deg, rgba(99,102,241,0.5), rgba(6,182,212,0.5))" }}
      />
      <Step num={1} active={activeStep >= 0} title="Canvas, as-is" desc="One campus per tab. Verbose names. No cross-campus view. No filters.">
        <div className="relative h-full w-full">
          <Image src="/canvas-guide/canvas-native.png" alt="Canvas native dashboard" fill className="object-cover" style={{ objectPosition: "0 35%" }} />
          <div className="absolute bottom-0 left-0 right-0 flex items-center gap-[6px] px-[10px] py-[7px]" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
            <div className="size-[6px] shrink-0 rounded-full bg-red-400"/>
            <span className="text-[10px] font-semibold text-white/65">canvas.instructure.com — only 1 of 3 campuses visible</span>
          </div>
        </div>
      </Step>

      <Step num={2} active={activeStep >= 1} title="CanvasMerge syncs" desc="Add each Canvas domain and token. Encryption happens automatically.">
        <SyncVis />
      </Step>

      <Step num={3} active={activeStep >= 2} title="One readable dashboard" desc="All campuses merged. Color-coded. Clean filters. Light and dark mode.">
        <MiniDash />
      </Step>
    </div>
  )
}
```

> **Note:** The `ActiveStepGrid` sub-component uses `React.useState` and `React.useEffect` — add `import React from "react"` at the top of the file (or use named imports: `import { useState, useEffect } from "react"`). Update the top imports to:
> ```ts
> import { useRef, useState, useEffect } from "react"
> ```
> and replace `React.useState` → `useState`, `React.useEffect` → `useEffect`, `React.useState` → `useState`.

- [ ] **Step 2: Fix the React imports**

Open `src/components/landing/scroll-story.tsx` and update the import line:

```ts
import { useRef, useState, useEffect } from "react"
```

Then replace `React.useState(0)` → `useState(0)` and `React.useEffect(` → `useEffect(` inside `ActiveStepGrid`.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/scroll-story.tsx
git commit -m "feat: add sticky scroll story section"
```

---

## Task 6: Feature cards

**Files:**
- Create: `src/components/landing/feature-cards.tsx`

- [ ] **Step 1: Create the file**

```tsx
// src/components/landing/feature-cards.tsx
"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Link2, CalendarCheck2, Filter, LockKeyhole } from "lucide-react"

const FEATURES = [
  {
    Icon: Link2,
    title: "Bring every Canvas account together",
    desc: "Connect school, dual-enrollment, and campus accounts without juggling tabs or calendars.",
    iconClass: "bg-cyan-500/12 text-cyan-300",
  },
  {
    Icon: CalendarCheck2,
    title: "See the work that needs you next",
    desc: "Assignments and due dates in one dashboard built for quick scanning across all campuses.",
    iconClass: "bg-emerald-500/12 text-emerald-300",
  },
  {
    Icon: Filter,
    title: "Filter down to the moment",
    desc: "Move between courses, campuses, and completion states when your week gets loud.",
    iconClass: "bg-amber-500/12 text-amber-300",
  },
  {
    Icon: LockKeyhole,
    title: "Keep access tokens protected",
    desc: "Canvas tokens are encrypted at rest while CanvasMerge does the retrieval work for you.",
    iconClass: "bg-rose-500/12 text-rose-300",
  },
]

export function FeatureCards() {
  const reduce = useReducedMotion()

  return (
    <section
      className="relative px-6 py-20 sm:px-14"
      style={{ background: "#0c0c16", borderTop: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.30), transparent)" }}
      />

      <div className="mx-auto max-w-[1080px] text-center">
        <div className="mb-[10px] text-[11px] font-bold uppercase tracking-[.1em] text-indigo-400">Less switching, more finishing</div>
        <h2 className="text-[clamp(28px,3.5vw,42px)] font-extrabold leading-[1.1] text-white">The parts students actually need.</h2>
      </div>

      <div className="mx-auto mt-10 grid max-w-[1080px] gap-[14px] sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ Icon, title, desc, iconClass }, i) => (
          <motion.article
            key={title}
            initial={reduce ? undefined : { opacity: 0, y: 24 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[14px] p-5"
            style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}
          >
            <div className={`mb-[14px] inline-flex size-10 items-center justify-center rounded-[10px] ${iconClass}`}>
              <Icon className="size-[18px]" aria-hidden />
            </div>
            <h3 className="mb-[7px] text-[13px] font-bold text-white/95">{title}</h3>
            <p className="text-[11px] leading-[1.6] text-white/40">{desc}</p>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/feature-cards.tsx
git commit -m "feat: add feature cards section"
```

---

## Task 7: How it works + CTA

**Files:**
- Create: `src/components/landing/how-it-works.tsx`
- Create: `src/components/landing/cta-section.tsx`

- [ ] **Step 1: Create how-it-works**

```tsx
// src/components/landing/how-it-works.tsx
"use client"

import { motion, useReducedMotion } from "framer-motion"

const STEPS = [
  "Sign in once.",
  "Add each Canvas domain and token.",
  "Open a merged planner that stays readable.",
]

export function HowItWorks() {
  const reduce = useReducedMotion()

  return (
    <section
      className="px-6 py-20 sm:px-14"
      style={{ background: "#07070f", borderTop: "1px solid rgba(255,255,255,0.04)" }}
    >
      <div className="text-center">
        <div className="mb-[10px] text-[11px] font-bold uppercase tracking-[.1em] text-indigo-400">From setup to sorted</div>
        <h2 className="text-[clamp(28px,3.5vw,42px)] font-extrabold leading-[1.1] text-white">Your schoolwork gets one readable lane.</h2>
      </div>

      <div className="mx-auto mt-9 flex max-w-[500px] flex-col gap-[10px]">
        {STEPS.map((step, i) => (
          <motion.div
            key={step}
            initial={reduce ? undefined : { opacity: 0, x: -20 }}
            whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-[14px] rounded-xl px-[18px] py-[14px]"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] bg-white text-[13px] font-extrabold text-slate-950">
              {i + 1}
            </span>
            <span className="text-[14px] font-semibold text-white/80">{step}</span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create cta-section**

```tsx
// src/components/landing/cta-section.tsx
"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"

export function CtaSection({ isSignedIn }: { isSignedIn: boolean }) {
  const reduce = useReducedMotion()
  const primaryHref  = isSignedIn ? "/dashboard" : "/sign-up"
  const primaryLabel = isSignedIn ? "Open dashboard" : "Start merging"

  return (
    <section
      className="relative overflow-hidden px-6 py-[90px] text-center sm:px-14 sm:pb-[110px]"
      style={{ background: "linear-gradient(180deg, #07070f 0%, #0c0c1e 100%)" }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ width: 500, height: 500, background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)" }}
      />

      <motion.h2
        initial={reduce ? undefined : { opacity: 0, y: 18 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative text-[clamp(26px,4vw,46px)] font-black text-white"
      >
        Bring every Canvas deadline into view.
      </motion.h2>

      <motion.p
        initial={reduce ? undefined : { opacity: 0, y: 18 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="relative mt-[10px] text-[15px] text-white/45"
      >
        Start with one account, add the rest when you are ready.
      </motion.p>

      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 18 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative mt-[26px] flex justify-center gap-[10px]"
      >
        <Link
          href={primaryHref}
          className="rounded-[10px] bg-white px-[26px] py-3 text-[14px] font-bold text-slate-950 hover:bg-white/90 transition-colors"
        >
          {primaryLabel} →
        </Link>
        <Link
          href="/sign-in"
          className="rounded-[10px] px-[26px] py-3 text-[14px] font-semibold text-white/72 hover:text-white transition-colors"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)" }}
        >
          Sign in
        </Link>
      </motion.div>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/how-it-works.tsx src/components/landing/cta-section.tsx
git commit -m "feat: add how-it-works and CTA sections"
```

---

## Task 8: Wire up page.tsx

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace the file**

```tsx
// src/app/page.tsx
import { auth } from "@clerk/nextjs/server"
import { Hero }         from "@/components/landing/hero"
import { ScrollStory }  from "@/components/landing/scroll-story"
import { FeatureCards } from "@/components/landing/feature-cards"
import { HowItWorks }   from "@/components/landing/how-it-works"
import { CtaSection }   from "@/components/landing/cta-section"

export default async function Home() {
  const { userId } = await auth()
  const isSignedIn = Boolean(userId)

  return (
    <main className="overflow-x-hidden">
      <Hero         isSignedIn={isSignedIn} />
      <ScrollStory />
      <FeatureCards />
      <HowItWorks  />
      <CtaSection   isSignedIn={isSignedIn} />
    </main>
  )
}
```

- [ ] **Step 2: Start dev server and do a full visual check**

```bash
npm run dev
```

Open http://localhost:3000 and verify:
- Hero loads with animated orbs, particles, stars, staggered text
- Dashboard mockup is visible on the right (desktop) and tab switching works
- Scroll through the page — scroll story steps activate in sequence
- Feature cards fade in as you scroll to them
- How it works steps slide in from the left
- CTA section fades up
- Sign in / Get started nav buttons are visible (when signed out)

- [ ] **Step 3: Check light mode**

Open dev tools → toggle the `dark` class off on `<html>` (or use the app's theme switcher if accessible). Verify:
- Hero background shifts to lavender gradient (`#f5f3ff → #ddd6fe`)
- Headline text becomes dark indigo (`#1e1b4b`)
- The dashboard mockup contrast remains readable

> **Note on light mode:** The hero uses a hardcoded dark background via inline `style`. To make the hero adapt to light mode, wrap the background style in a conditional based on `resolvedTheme` from `useTheme()`. In `hero.tsx`, since it is already a client component, add:
> ```ts
> import { useTheme } from "@/components/theme-provider"
> // inside Hero():
> const { resolvedTheme } = useTheme()
> const heroBg = resolvedTheme === "light"
>   ? "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #ddd6fe 100%)"
>   : "linear-gradient(135deg, #020617 0%, #0f172a 40%, #1e1040 70%, #0c1445 100%)"
> const headlineAccentColor = resolvedTheme === "light" ? "#6366f1" : "#a5b4fc"
> const orbOpacity = resolvedTheme === "light" ? 0.18 : 0.38
> ```
> Apply `heroBg` to the section's `style.background`, `headlineAccentColor` to the accent span, and adjust the orb gradient opacities accordingly. Also update the badge, subtext, and button colors for light mode using similar conditionals.

- [ ] **Step 4: Check mobile**

Resize the browser to 375px width. Verify:
- Hero is single column, mockup is hidden (`hidden lg:flex` on the right column)
- Copy is readable and not overflowing
- Scroll story steps stack vertically (update `grid-cols-3` to `grid-cols-1 sm:grid-cols-3` in `scroll-story.tsx` if they overflow)

- [ ] **Step 5: Check reduced motion**

In browser dev tools → Rendering → Emulate `prefers-reduced-motion: reduce`. Verify no animations play.

- [ ] **Step 6: Final commit**

```bash
git add src/app/page.tsx
git commit -m "feat: wire up new landing page"
```

---

## Post-implementation checklist

- [ ] No TypeScript errors in `npm run dev` output
- [ ] All imports resolve (no missing `@/components/landing/*` paths)
- [ ] `canvas-native.png` is present in `public/canvas-guide/`
- [ ] Dashboard mockup tabs (Assignments / Completed / Announcements) all switch correctly
- [ ] Scroll story: steps 1→2→3 visually highlight as you scroll
- [ ] `whileInView` animations on feature cards and how-it-works fire once on scroll
- [ ] `useReducedMotion` suppresses all Framer Motion animations
- [ ] Mobile: hero is single column, scroll story either stacks or scrolls horizontally without overflow
- [ ] Light mode hero: lavender gradient, dark indigo headline
