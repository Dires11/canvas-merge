# Landing Page Redesign

**Date:** 2026-06-09  
**Status:** Approved — ready for implementation

---

## Overview

Replace the current Codex-generated landing page with a premium animated landing page. Deep space aesthetic with orbiting gradient orbs, floating particles, and scroll-driven animations. The hero shows a fully interactive HTML/CSS dashboard mockup (no screenshots). Light mode adapts the hero from dark space to a soft lavender gradient with the same layout.

---

## Visual Direction

### Dark mode hero
- Background: `linear-gradient(135deg, #020617, #0f172a, #1e1040, #0c1445)` — deep indigo/midnight
- 3 animated gradient orbs drifting slowly (Framer Motion `animate` + `transition repeat: Infinity`)
- Star field: CSS `radial-gradient` dots at fixed positions, subtle twinkle opacity animation
- Floating particles: small white dots rising from bottom, `y: [0, -100vh]` loop with staggered delays

### Light mode hero
- Background: `linear-gradient(135deg, #f5f3ff, #ede9fe, #ddd6fe)` — soft lavender/violet
- Same orb positions, lower opacity (`rgba(99,102,241,0.18)` vs `0.38`)
- Text color shifts: headline `#1e1b4b`, subtext `#4c4891`, badge uses indigo tints
- CTA primary button: `bg-[#1e1b4b]` (dark indigo)
- Dashboard mockup: white glass variant (light dashboard)

---

## Page Sections

### 1. Hero — full viewport
**Layout:** CSS grid `1fr 1.3fr`, aligned center, `padding: 100px 56px 60px`

**Left — copy:**
- Navbar (absolute): logo + "Sign in" ghost + "Get started" white (hidden when signed in, shows "Open dashboard")
- Badge pill: school icon + "Built for students with more than one Canvas world"
- Headline: `Every Canvas. / One view.` — second line in `#a5b4fc` (dark) / `#6366f1` (light)
- Subtext: existing copy
- CTA row: primary "Start merging →" + secondary "View dashboard"
- All elements stagger in with `initial: {opacity:0, y:18}` → `animate: {opacity:1, y:0}`, 0.1s delay increments

**Right — interactive dashboard mockup:**
- Perspective tilt: `rotateY(-10deg) rotateX(3deg)`, floating animation `y: [0, -10px]` loop
- Box shadow: `0 50px 100px rgba(0,0,0,0.65)` + indigo glow
- Matches the interactive mockup built in brainstorming (see below)
- On mobile: mockup hidden, copy goes full width

**Scroll hint:** animated chevron/dot at bottom center

---

### 2. Sticky Scroll Story
**Behaviour:** The section is `position: sticky; top: 0` while a taller scroll container passes over it. Framer Motion `useScroll` + `useTransform` maps scroll progress (0→1) to step activation (0→1→2).

**Three steps (equal height cards):**

**Step 1 — Canvas, as-is**
- Card contains: real Canvas screenshot (`/public/canvas-guide/canvas-native.png`) with `object-fit: cover; object-position: 0 35%` cropped to assignment area
- Label overlay at bottom: red dot + "canvas.instructure.com — only 1 of 3 campuses visible"
- Caption: "Canvas, as-is" / "One campus per tab. Verbose names. No cross-campus view. No filters."

**Step 2 — CanvasMerge syncs**
- Dark card with network visualization: 3 domain nodes (state.edu, cc.edu, other.edu) on left connected via SVG paths with `<animateMotion>` dots travelling to a central CanvasMerge hub
- Hub: glowing indigo circle with logo, pulsing `box-shadow` animation
- Bottom status bar: spinner + "Syncing planner items…" + bouncing dots
- Caption: "CanvasMerge syncs" / "Add each Canvas domain and token. Encryption happens automatically."

**Step 3 — One readable dashboard**
- Mini accurate dashboard mockup (static, smaller version of the hero mockup)
- Shows: sidebar with color bars, filter bar, 3 assignment cards across 2 date groups
- Caption: "One readable dashboard" / "All campuses merged. Color-coded. Clean filters. Light and dark mode."

**Connecting line** between step numbers via CSS `::before` pseudo-element with gradient `rgba(99,102,241,0.5) → rgba(6,182,212,0.5)`.

---

### 3. Feature Cards
4 cards in a `grid-cols-4` grid, `gap-3`.  
Each: `border-radius: 14px; border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.03)`  
On scroll: `whileInView={{ opacity:1, y:0 }}` from `{opacity:0, y:24}`, staggered by 0.08s per card.

Cards (matching existing copy):
1. Link icon / cyan — Bring every Canvas account together
2. Calendar icon / green — See the work that needs you next
3. Filter icon / amber — Filter down to the moment
4. Lock icon / rose — Keep access tokens protected

---

### 4. How It Works
3 step rows, max-width 500px, centered.  
Each: glass-border card with white number box + step text.  
On scroll: slides in from `x: -20` with stagger.

---

### 5. CTA
Centered, ambient indigo radial glow behind text.  
Headline + subtext + two buttons (primary / ghost).  
Signed-in state: "Open dashboard" replaces "Start merging".

---

## Interactive Dashboard Mockup Component

File: `src/app/(landing)/components/dashboard-mockup.tsx` (client component)

**Structure:**
- Top bar: logo + tab switcher (Assignments / Completed / Announcements) + avatar
- Sidebar: 7 courses, each with 12px color bar (`w-3`) + domain (muted) + course name
- Main area: filter bar (search + Filter button + chip row) + tab panel content

**Tab panels:**
- **Assignments**: grouped by Overdue / Due today / Due tomorrow / Due in N days. Each card: icon area (50% opacity course color bg, course-colored icon) + course name (small, colored) + title (bold) + due date row + right side (pts + avatar)
- **Completed**: same card shape, 65% opacity, strike-through title, grade score shown
- **Announcements**: icon area + course name + announcement title + domain · posted time + external link icon

**Styling accuracy:**
- Background: `oklch(0.27 0.05 268)` — exact dark mode `--background` value
- Topbar: `oklch(0.22 0.05 268)`
- Glass border: asymmetric widths `1.7px/1.4px/1.2px/2px` at `rgba(255,255,255,0.15/0.10/0.10/0.15)` — matches `.glass-border` utility
- Course bars: `w-3` (12px)
- Card bg: `oklch(course_l course_c course_h / 0.07)` via inline style with CSS color-mix or hardcoded per course
- Icon area bg: `oklch(course_l course_c course_h / 0.5)`

**Light mode variant:** Uses `useTheme()` or `dark:` class variant — white background, indigo glass borders, white cards with indigo shadow.

**Interactions:** Tab clicks, chip clicks, course item selection all work client-side. No server calls.

---

## Canvas Screenshot

Copy `/Users/davidmanaseryan/.claude/image-cache/af4009a6-04bc-477a-93d1-ae550e9570e1/1.png` → `/public/canvas-guide/canvas-native.png` (already exists as a guide image directory or create it).

---

## Animation Libraries

- **Framer Motion v12** (already installed) — orb drift, particle float, hero stagger, scroll story `useScroll`, `whileInView` for sections
- No additional libraries needed

## File Structure

```
src/app/
  page.tsx                              ← server component, auth check, pass isSignedIn
  (landing)/
    components/
      hero.tsx                          ← client, animated hero section
      hero-nav.tsx                      ← nav (ghost/white btns, hides when signed in)
      dashboard-mockup.tsx              ← client, interactive dashboard
      dashboard-mockup-light.tsx        ← light variant (or single component with theme prop)
      scroll-story.tsx                  ← client, sticky scroll story
      scroll-story-step.tsx             ← individual step card
      feature-cards.tsx                 ← client, whileInView cards
      how-it-works.tsx                  ← client, whileInView steps
      cta-section.tsx                   ← client, fade-in CTA
public/
  canvas-guide/
    canvas-native.png                   ← Canvas screenshot for step 1
```

---

## Constraints

- Page is a Next.js App Router server component — animated parts are `"use client"` child components
- The existing navbar (`src/components/navbar.tsx`) is only shown on authenticated routes — the landing page has its own inline nav
- `prefers-reduced-motion`: all Framer Motion animations should respect `useReducedMotion()`
- Mobile: hero becomes single column (copy only, mockup hidden), story steps stack vertically, features grid becomes 2-col
