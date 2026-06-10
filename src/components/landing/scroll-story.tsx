"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion"
import { hexRgba } from "./mock-data"
import { DashboardMockup } from "./dashboard-mockup"
import { DashboardMobileMockup } from "./dashboard-mobile-mockup"

const DOMAINS = [
  { name: "state.edu", courses: 4, color: "#6366f1" },
  { name: "cc.edu",    courses: 3, color: "#06b6d4" },
  { name: "other.edu", courses: 2, color: "#f59e0b" },
]

function SyncVis() {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden p-3 sm:p-5"
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
        <div className="flex flex-1 flex-col gap-[6px] sm:gap-3">
          {DOMAINS.map((d) => (
            <div
              key={d.name}
              className="flex items-center gap-2 rounded-lg px-[7px] py-[5px] sm:px-[10px] sm:py-[7px]"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
            >
              <div
                className="flex size-7 shrink-0 items-center justify-center rounded-lg"
                style={{ background: hexRgba(d.color, 0.15) }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={d.color} strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="3"/>
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
          <svg viewBox="0 0 56 200" className="h-[120px] w-9 overflow-visible sm:h-[200px] sm:w-14" aria-hidden="true">
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
            className="flex size-10 items-center justify-center rounded-full sm:size-14"
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



type StepProps = {
  num: number
  active: boolean
  title: string
  desc: string
  children: React.ReactNode
}

const REVEAL = "opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1), filter 0.65s cubic-bezier(0.22,1,0.36,1)"

function Step({ num, active, title, desc, children }: StepProps) {
  const shown = active

  return (
    <div className="flex flex-col items-center px-3">
      {/* Step number dot */}
      <div
        className="scroll-step-dot z-10 mb-[18px] flex size-[38px] shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold"
        style={{
          background: shown ? "#6366f1" : "#09090e",
          border: `1.5px solid ${shown ? "#6366f1" : "rgba(99,102,241,0.40)"}`,
          color: shown ? "#fff" : "rgba(165,180,252,0.7)",
          boxShadow: shown ? "0 0 0 8px rgba(99,102,241,0.12)" : "none",
          transition: "all 0.5s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {num}
      </div>

      {/* Card */}
      <div
        className="scroll-step-card mb-[14px] w-full aspect-[9/16] sm:aspect-[16/10] overflow-hidden rounded-xl"
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
          opacity: shown ? 1 : 0,
          transform: shown ? "translateY(0) scale(1)" : "translateY(36px) scale(0.96)",
          filter: shown ? "blur(0px)" : "blur(4px)",
          pointerEvents: shown ? "auto" : "none",
          transition: REVEAL,
        }}
      >
        {children}
      </div>

      {/* Caption */}
      <div
        className="scroll-step-caption mb-[5px] text-center text-[13px] font-bold text-white/95"
        style={{
          opacity: shown ? 1 : 0,
          transform: shown ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.55s 0.1s cubic-bezier(0.22,1,0.36,1), transform 0.55s 0.1s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {title}
      </div>
      <div
        className="scroll-step-caption text-center text-[11px] leading-[1.55]"
        style={{
          color: "rgba(255,255,255,0.38)",
          opacity: shown ? 1 : 0,
          transform: shown ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.55s 0.15s cubic-bezier(0.22,1,0.36,1), transform 0.55s 0.15s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {desc}
      </div>
    </div>
  )
}

function StepGrid({ activeStep }: { activeStep: number }) {
  return (
    <div className="relative grid w-full max-w-[1300px] grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-0">
      {/* Faint base line */}
      <div
        className="pointer-events-none absolute hidden sm:block"
        style={{
          top: 19,
          left: "calc(16.66% + 19px)",
          right: "calc(16.66% + 19px)",
          height: 1,
          background: "rgba(99,102,241,0.18)",
        }}
        aria-hidden="true"
      />
      {/* Animated fill line */}
      <div
        className="pointer-events-none absolute hidden sm:block"
        style={{
          top: 19,
          left: "calc(16.66% + 19px)",
          right: "calc(16.66% + 19px)",
          height: 1,
          background: "linear-gradient(90deg, #6366f1, #06b6d4)",
          transformOrigin: "left center",
          transform: `scaleX(${activeStep === 0 ? 0 : activeStep === 1 ? 0.5 : 1})`,
          transition: "transform 0.7s cubic-bezier(0.22,1,0.36,1)",
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
          {/* Desktop screenshot */}
          <div className="relative hidden h-full w-full sm:block">
            <Image
              src="/canvas-guide/canvas-native.png"
              alt="Canvas native dashboard showing verbose course names and no cross-campus view"
              fill
              className="object-cover"
              style={{ objectPosition: "0% 52%" }}
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
          {/* Mobile screenshot */}
          <div className="relative block h-full w-full sm:hidden">
            <Image
              src="/canvas-guide/canvas-mobile.png"
              alt="Canvas mobile app showing one school's to-do list"
              fill
              className="object-cover"
              style={{ objectPosition: "0% 0%" }}
            />
            <div
              className="absolute bottom-0 left-0 right-0 flex items-center gap-[6px] px-[10px] py-[7px]"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
            >
              <div className="size-[6px] shrink-0 rounded-full bg-red-400" aria-hidden="true" />
              <span className="text-[10px] font-semibold text-white/65">
                Canvas app — 1 of 3 schools, no merged view
              </span>
            </div>
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
        {/* Desktop: scaled DashboardMockup */}
        <div className="relative hidden h-full w-full overflow-hidden sm:block">
          <div style={{ position: "absolute", top: 0, left: 0, width: "200%", transformOrigin: "top left", transform: "scale(0.5)" }}>
            <DashboardMockup />
          </div>
        </div>
        {/* Mobile: purpose-built mobile mockup */}
        <div className="block h-full w-full sm:hidden">
          <DashboardMobileMockup />
        </div>
      </Step>
    </div>
  )
}

export function ScrollStory() {
  const containerRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [activeStep, setActiveStep] = useState(0)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = v < 0.33 ? 0 : v < 0.66 ? 1 : 2
    setActiveStep(next)
  })

  return (
    <div
      ref={containerRef}
      className="scroll-story relative"
      style={{
        height: reduce ? "auto" : "300vh",
        background: "#09090e",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <style>{`
        @media (max-width: 639px) {
          .scroll-story { height: auto !important; }
          .scroll-story-inner { position: static !important; height: auto !important; overflow: visible !important; }
          .scroll-step-card { opacity: 1 !important; transform: translateY(0) scale(1) !important; filter: blur(0px) !important; pointer-events: auto !important; }
          .scroll-step-caption { opacity: 1 !important; transform: translateY(0) !important; }
          .scroll-step-dot { background: #6366f1 !important; border-color: #6366f1 !important; color: #fff !important; box-shadow: 0 0 0 8px rgba(99,102,241,0.12) !important; }
        }
      `}</style>
      <div
        className={
          reduce
            ? "px-6 py-20 sm:px-14"
            : "scroll-story-inner sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-4 py-12 sm:px-10"
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

        <StepGrid activeStep={reduce ? 2 : activeStep} />
      </div>
    </div>
  )
}
