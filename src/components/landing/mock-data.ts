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
  { id: 'a1', courseId: '2', type: 'discussion', title: 'Forum Post — Greedy vs Dynamic',           dueLabel: 'Overdue · Jun 7 at 11:59 PM',      dueGroup: 'overdue',   points: 30 },
  { id: 'a2', courseId: '1', type: 'assignment', title: 'Problem Set 7 — Eigenvalues & Diag.',      dueLabel: 'Due today at 11:59 PM',             dueGroup: 'today',     points: 50 },
  { id: 'a3', courseId: '3', type: 'assignment', title: 'Reading Response — The Great Gatsby Ch.4', dueLabel: 'Due today at 11:59 PM',             dueGroup: 'today',     points: 25 },
  { id: 'a4', courseId: '4', type: 'assignment', title: 'Lab Report — Acid-Base Titration',         dueLabel: 'Due tomorrow at 9:00 AM',           dueGroup: 'tomorrow',  points: 100 },
  { id: 'a5', courseId: '6', type: 'quiz',       title: 'Being a Successful Student Online Quiz',   dueLabel: 'Due tomorrow at 11:59 PM',          dueGroup: 'tomorrow',  points: 7 },
  { id: 'a6', courseId: '5', type: 'assignment', title: 'Reflection Paper — Cognitive Biases',      dueLabel: 'Due Jun 12 at 11:59 PM',            dueGroup: 'later',     points: 40 },
]

export const MOCK_COMPLETED: MockAssignment[] = [
  { id: 'c1', courseId: '1', type: 'assignment', title: 'Problem Set 6 — Orthogonality',          dueLabel: 'Submitted Jun 5',  dueGroup: 'today', points: 50,  done: true, grade: '50/50' },
  { id: 'c2', courseId: '4', type: 'assignment', title: 'Prelab — Equilibrium Constants',         dueLabel: 'Submitted Jun 4',  dueGroup: 'today', points: 15,  done: true, grade: '14/15' },
  { id: 'c3', courseId: '3', type: 'assignment', title: 'Essay Draft — Symbolism in Literature',  dueLabel: 'Submitted Jun 3',  dueGroup: 'today', points: 75,  done: true, grade: '72/75' },
  { id: 'c4', courseId: '2', type: 'quiz',       title: 'Quiz 3 — Graph Traversal',               dueLabel: 'Submitted Jun 2',  dueGroup: 'today', points: 20,  done: true, grade: '20/20' },
]

export const MOCK_ANNOUNCEMENTS: MockAnnouncement[] = [
  { id: 'n1', courseId: '1', title: 'Midterm exam moved to June 15 — please read',                  postedAgo: '2 hours ago' },
  { id: 'n2', courseId: '4', title: 'Lab safety reminder — goggles required this Thursday',         postedAgo: '5 hours ago' },
  { id: 'n3', courseId: '6', title: 'Welcome to the course — syllabus and week 1 materials posted', postedAgo: 'yesterday' },
  { id: 'n4', courseId: '2', title: 'Office hours rescheduled — see updated Zoom link below',       postedAgo: '2 days ago' },
]

/** Distinct campus domains, in display order (state.edu, cc.edu, other.edu) */
export const MOCK_DOMAINS: string[] = Array.from(new Set(MOCK_COURSES.map((c) => c.domain)))

const DUE_ORDER: Record<MockAssignment["dueGroup"], number> = {
  overdue: 0,
  today: 1,
  tomorrow: 2,
  later: 3,
}

/**
 * Group a (pre-filtered) assignment list by campus domain, mirroring the real
 * dashboard's per-domain sections. Empty domains are dropped; items within a
 * domain are ordered by how soon they're due.
 */
export function groupByDomain(
  list: MockAssignment[],
): { domain: string; items: MockAssignment[] }[] {
  return MOCK_DOMAINS.map((domain) => ({
    domain,
    items: list
      .filter((a) => courseById(a.courseId).domain === domain)
      .sort((x, y) => DUE_ORDER[x.dueGroup] - DUE_ORDER[y.dueGroup]),
  })).filter((g) => g.items.length > 0)
}

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
