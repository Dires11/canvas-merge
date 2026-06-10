"use client"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "framer-motion"
import { hexRgba, courseById, MOCK_COURSES, MOCK_ASSIGNMENTS } from "./mock-data"

const DOMAINS = [
  { name: "state.edu", courses: 4, color: "#6366f1" },
  { name: "cc.edu",    courses: 3, color: "#06b6d4" },
  { name: "other.edu", courses: 2, color: "#f59e0b" },
]

function SyncVis() {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden p-5"
      style={{ background: "#0a0c16" }}
    >
      {/* Hub glow */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 200, height: 200,
          top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          background: "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)",
          animation: "hub-glow 3s ease-in-out infinite",
        }}
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
              <div
                className="flex size-7 shrink-0 items-center justify-center rounded-lg"
                style={{ background: hexRgba(d.color, 0.15) }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={d.color} strokeWidth="2" aria-hidden="true">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
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
          <svg viewBox="0 0 56 200" className="h-[200px] w-14 overflow-visible" aria-hidden="true">
            <defs>
              <filter id="sync-glow">
                <feGaussianBlur stdDeviation="2" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <path id="sync-pt" d="M 0,33 C 28,33 28,100 56,100"/>
              <path id="sync-pm" d="M 0,100 L 56,100"/>
              <path id="sync-pb" d="M 0,167 C 28,167 28,100 56,100"/>
            </defs>
            <path d="M 0,33 C 28,33 28,100 56,100"  stroke="rgba(165,180,252,0.22)" strokeWidth="1.5" fill="none"/>
            <path d="M 0,100 L 56,100"               stroke="rgba(165,180,252,0.22)" strokeWidth="1.5" fill="none"/>
            <path d="M 0,167 C 28,167 28,100 56,100" stroke="rgba(165,180,252,0.22)" strokeWidth="1.5" fill="none"/>
            {([
              { id: "sync-pt", begin: "0s" },
              { id: "sync-pm", begin: "0.55s" },
              { id: "sync-pb", begin: "1.1s" },
            ] as const).map(({ id, begin }) => (
              <circle key={id} r="3" fill="#a5b4fc" filter="url(#sync-glow)" opacity="0">
                <animateMotion dur="1.6s" repeatCount="indefinite" begin={begin}>
                  <mpath href={`#${id}`}/>
                </animateMotion>
                <animate
                  attributeName="opacity"
                  values="0;0;1;1;0"
                  keyTimes="0;.05;.15;.85;1"
                  dur="1.6s"
                  repeatCount="indefinite"
                  begin={begin}
                />
              </circle>
            ))}
          </svg>
        </div>

        {/* Hub */}
        <div className="flex shrink-0 flex-col items-center gap-2">
          <div
            className="flex size-14 items-center justify-center rounded-full"
            style={{
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              animation: "hub-pulse 2.5s ease-in-out infinite",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="text-center text-[9px] font-bold leading-[1.3] tracking-[0.05em] text-white/55">
            Canvas<br/>Merge
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div
        className="absolute bottom-[14px] left-[14px] right-[14px] flex items-center gap-[7px] rounded-lg px-[10px] py-[6px]"
        style={{ background: "rgba(99,102,241,0.10)", border: "1px solid rgba(99,102,241,0.22)" }}
      >
        <div
          className="size-3 shrink-0 rounded-full border-2"
          style={{
            borderColor: "rgba(99,102,241,0.4)",
            borderTopColor: "#818cf8",
            animation: "sync-spin .9s linear infinite",
          }}
        />
        <span className="flex-1 text-[10px] font-semibold text-white/55">Syncing planner items…</span>
        <div className="flex gap-[3px]">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="size-[5px] rounded-full bg-indigo-500/50"
              style={{ animation: `sync-blink 1.2s ${i * 0.2}s ease-in-out infinite` }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes hub-glow  { 0%,100%{opacity:.6;transform:translate(-50%,-50%) scale(1)} 50%{opacity:1;transform:translate(-50%,-50%) scale(1.15)} }
        @keyframes hub-pulse { 0%,100%{box-shadow:0 0 0 6px rgba(99,102,241,.15),0 0 24px rgba(99,102,241,.40)} 50%{box-shadow:0 0 0 10px rgba(99,102,241,.08),0 0 36px rgba(99,102,241,.65)} }
        @keyframes sync-spin { to{transform:rotate(360deg)} }
        @keyframes sync-blink { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:1;transform:scale(1.3)} }
      `}</style>
    </div>
  )
}

function MiniDash() {
  const miniCourses = MOCK_COURSES.slice(0, 5)
  const miniItems = MOCK_ASSIGNMENTS.filter(
    (a) => a.dueGroup === "today" || a.dueGroup === "tomorrow"
  ).slice(0, 3)

  return (
    <div
      className="flex h-full flex-col overflow-hidden"
      style={{ background: "oklch(0.27 0.05 268)", fontSize: 10 }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between border-b border-white/[0.07] px-[11px] py-[7px]"
        style={{ background: "oklch(0.22 0.05 268)" }}
      >
        <div className="flex items-center gap-[5px] text-[10px] font-bold text-white/90">
          <div className="flex size-[18px] items-center justify-center rounded bg-white">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#0f0f13" strokeWidth="2.5" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5"/>
            </svg>
          </div>
          CanvasMerge
        </div>
        <div
          className="flex gap-[1px] rounded-[6px] p-[2px]"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {["Assignments", "Completed"].map((t, i) => (
            <div
              key={t}
              className="rounded px-2 py-[2px] text-[9px] font-semibold"
              style={{
                background: i === 0 ? "rgba(255,255,255,0.12)" : "transparent",
                color: i === 0 ? "rgba(255,255,255,.9)" : "rgba(255,255,255,.4)",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className="w-[100px] shrink-0 border-r border-white/[0.06] py-2"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <div
            className="mb-1 border-b border-white/[0.04] px-2 pb-[5px] text-[7px] font-bold uppercase tracking-[.07em]"
            style={{ color: "rgba(255,255,255,.25)" }}
          >
            Courses · {MOCK_COURSES.length}
          </div>
          {miniCourses.map((c, i) => (
            <div
              key={c.id}
              className="mx-1 mb-[2px] flex items-stretch overflow-hidden rounded"
              style={{
                background: i === 0 ? "rgba(99,102,241,.10)" : "rgba(255,255,255,.03)",
                border: `1px solid ${i === 0 ? "rgba(99,102,241,.20)" : "rgba(255,255,255,.06)"}`,
              }}
            >
              <div className="w-[2.5px] shrink-0" style={{ background: c.color }} />
              <div className="min-w-0 px-[6px] py-[3px]">
                <div className="text-[7px]" style={{ color: "rgba(255,255,255,.28)" }}>{c.domain}</div>
                <div
                  className="truncate text-[8px] font-semibold"
                  style={{ color: i === 0 ? "#c7d2fe" : "rgba(255,255,255,.72)" }}
                >
                  {c.name}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main */}
        <div className="flex flex-1 flex-col gap-1 overflow-hidden p-[7px]">
          <div className="flex gap-[3px]">
            <div
              className="flex flex-1 items-center gap-[3px] rounded px-[7px] py-[3px] text-[8px]"
              style={{
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.08)",
                color: "rgba(255,255,255,.28)",
              }}
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              Search…
            </div>
          </div>
          <div className="flex gap-[2px]">
            {["All", "Overdue", "Today"].map((l, i) => (
              <div
                key={l}
                className="rounded-full px-[6px] py-[2px] text-[7px] font-semibold"
                style={{
                  background: i === 0 ? "rgba(99,102,241,.15)" : "rgba(255,255,255,.04)",
                  border: `1px solid ${i === 0 ? "rgba(99,102,241,.30)" : "rgba(255,255,255,.08)"}`,
                  color: i === 0 ? "#c7d2fe" : "rgba(255,255,255,.32)",
                }}
              >
                {l}
              </div>
            ))}
          </div>

          {miniItems.map((a) => {
            const c = courseById(a.courseId)
            return (
              <div
                key={a.id}
                className="flex items-stretch overflow-hidden rounded-lg"
                style={{
                  background: hexRgba(c.color, 0.07),
                  borderStyle: "solid",
                  borderTopWidth: "1.7px", borderTopColor: "rgba(255,255,255,.10)",
                  borderRightWidth: "1.4px", borderRightColor: "rgba(255,255,255,.06)",
                  borderBottomWidth: "1.2px", borderBottomColor: "rgba(255,255,255,.06)",
                  borderLeftWidth: "2px", borderLeftColor: "rgba(255,255,255,.10)",
                }}
              >
                <div
                  className="flex w-6 shrink-0 items-center justify-center"
                  style={{ background: hexRgba(c.color, 0.5), borderRight: "1px solid rgba(255,255,255,.08)" }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth="2" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div className="min-w-0 flex-1 px-[5px] py-[4px]">
                  <div className="text-[7px] font-bold uppercase" style={{ color: hexRgba(c.color, 0.8) }}>
                    {c.name}
                  </div>
                  <div className="truncate text-[8px] font-bold" style={{ color: "rgba(255,255,255,.82)" }}>
                    {a.title}
                  </div>
                  <div className="mt-[1px] text-[7px]" style={{ color: "rgba(255,255,255,.28)" }}>
                    {a.dueLabel}
                  </div>
                </div>
                <div className="flex flex-col items-end justify-center gap-[2px] px-[5px]">
                  <div className="text-[7px]" style={{ color: "rgba(255,255,255,.30)" }}>{a.points} pts</div>
                  <div
                    className="flex size-3 items-center justify-center rounded-full text-[6px] font-bold text-white"
                    style={{ background: c.color }}
                  >
                    D
                  </div>
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

      <div
        className="mb-[5px] text-center text-[13px] font-bold text-white/95"
        style={{ opacity: active ? 1 : 0.5, transition: "opacity 0.4s" }}
      >
        {title}
      </div>
      <div
        className="text-center text-[11px] leading-[1.55]"
        style={{ color: "rgba(255,255,255,0.38)", opacity: active ? 1 : 0.5, transition: "opacity 0.4s" }}
      >
        {desc}
      </div>
    </div>
  )
}

function StepGrid({ activeStepValue, initialStep = 0 }: { activeStepValue: MotionValue<number> | undefined; initialStep?: number }) {
  const [activeStep, setActiveStep] = useState(initialStep)

  useEffect(() => {
    if (!activeStepValue) return
    const unsub = activeStepValue.on("change", (v) => setActiveStep(Math.round(v)))
    return unsub
  }, [activeStepValue])

  return (
    <div className="relative grid w-full max-w-[1080px] grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-0">
      {/* Connecting line (desktop only) */}
      <div
        className="pointer-events-none absolute hidden sm:block"
        style={{
          top: 19,
          left: "calc(16.66% + 16px)",
          right: "calc(16.66% + 16px)",
          height: 1,
          background: "linear-gradient(90deg, rgba(99,102,241,0.5), rgba(6,182,212,0.5))",
        }}
        aria-hidden="true"
      />

      <Step
        num={1}
        active={activeStep >= 0}
        title="Canvas, as-is"
        desc="One campus per tab. Verbose names. No cross-campus view. No filters."
      >
        <div className="relative h-full w-full">
          <Image
            src="/canvas-guide/canvas-native.png"
            alt="Canvas native dashboard showing verbose course names and no cross-campus view"
            fill
            className="object-cover"
            style={{ objectPosition: "0 35%" }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 flex items-center gap-[6px] px-[10px] py-[7px]"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          >
            <div className="size-[6px] shrink-0 rounded-full bg-red-400" aria-hidden="true" />
            <span className="text-[10px] font-semibold text-white/65">
              canvas.instructure.com — only 1 of 3 campuses visible
            </span>
          </div>
        </div>
      </Step>

      <Step
        num={2}
        active={activeStep >= 1}
        title="CanvasMerge syncs"
        desc="Add each Canvas domain and token. Encryption happens automatically."
      >
        <SyncVis />
      </Step>

      <Step
        num={3}
        active={activeStep >= 2}
        title="One readable dashboard"
        desc="All campuses merged. Color-coded. Clean filters. Light and dark mode."
      >
        <MiniDash />
      </Step>
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

  const activeStepValue = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], [0, 1, 2, 2])

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{
        height: reduce ? "auto" : "300vh",
        background: "#09090e",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div
        className={
          reduce
            ? "px-6 py-20 sm:px-14"
            : "sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6 py-16 sm:px-14"
        }
      >
        <div className="mb-12 text-center">
          <div className="mb-[10px] text-[11px] font-bold uppercase tracking-[.1em] text-indigo-400">
            From chaos to clarity
          </div>
          <h2 className="text-[clamp(28px,3.5vw,42px)] font-extrabold leading-[1.1] text-white">
            Canvas is scattered. CanvasMerge isn&apos;t.
          </h2>
          <p className="mt-2 text-[15px] text-white/42">
            Three campuses, one place, zero juggling.
          </p>
        </div>

        <StepGrid activeStepValue={reduce ? undefined : activeStepValue} initialStep={reduce ? 2 : 0} />
      </div>
    </div>
  )
}
