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

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

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
        aria-hidden="true"
      />

      <div className="mx-auto max-w-[1080px] text-center">
        <div className="mb-[10px] text-[11px] font-bold uppercase tracking-[.1em] text-indigo-400">
          Less switching, more finishing
        </div>
        <h2 className="text-[clamp(28px,3.5vw,42px)] font-extrabold leading-[1.1] text-white">
          The parts students actually need.
        </h2>
      </div>

      <div className="mx-auto mt-10 grid max-w-[1080px] gap-[14px] sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ Icon, title, desc, iconClass }, i) => (
          <motion.article
            key={title}
            initial={reduce ? undefined : { opacity: 0, y: 24 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: i * 0.08, ease: EASE }}
            className="rounded-[14px] p-5"
            style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}
          >
            <div className={`mb-[14px] inline-flex size-10 items-center justify-center rounded-[10px] ${iconClass}`}>
              <Icon className="size-[18px]" aria-hidden="true" />
            </div>
            <h3 className="mb-[7px] text-[13px] font-bold text-white/95">{title}</h3>
            <p className="text-[11px] leading-[1.6] text-white/40">{desc}</p>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
