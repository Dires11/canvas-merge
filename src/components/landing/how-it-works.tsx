"use client"

import { motion, useReducedMotion } from "framer-motion"

const STEPS = [
  "Sign in once.",
  "Add each Canvas domain and token.",
  "Open a merged planner that stays readable.",
]

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function HowItWorks() {
  const reduce = useReducedMotion()

  return (
    <section
      className="px-6 py-20 sm:px-14"
      style={{ background: "#07070f", borderTop: "1px solid rgba(255,255,255,0.04)" }}
    >
      <div className="text-center">
        <div className="mb-[10px] text-[11px] font-bold uppercase tracking-[.1em] text-indigo-400">
          From setup to sorted
        </div>
        <h2 className="text-[clamp(28px,3.5vw,42px)] font-extrabold leading-[1.1] text-white">
          Your schoolwork gets one readable lane.
        </h2>
      </div>

      <div className="mx-auto mt-9 flex max-w-[500px] flex-col gap-[10px]">
        {STEPS.map((step, i) => (
          <motion.div
            key={step}
            initial={reduce ? undefined : { opacity: 0, x: -20 }}
            whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
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
