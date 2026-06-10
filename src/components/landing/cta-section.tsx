"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

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
        aria-hidden="true"
      />

      <motion.h2
        initial={reduce ? undefined : { opacity: 0, y: 18 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative text-[clamp(26px,4vw,46px)] font-black text-white"
      >
        Bring every Canvas deadline into view.
      </motion.h2>

      <motion.p
        initial={reduce ? undefined : { opacity: 0, y: 18 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
        className="relative mt-[10px] text-[15px] text-white/45"
      >
        Start with one account, add the rest when you are ready.
      </motion.p>

      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 18 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
        className="relative mt-[26px] flex flex-col items-center gap-[10px] sm:flex-row sm:justify-center"
      >
        <Link
          href={primaryHref}
          className="w-full whitespace-nowrap rounded-[10px] bg-white px-[26px] py-3 text-center text-[14px] font-bold text-slate-950 hover:bg-white/90 transition-colors sm:w-auto"
        >
          {primaryLabel} →
        </Link>
        <Link
          href="/sign-in"
          className="w-full whitespace-nowrap rounded-[10px] px-[26px] py-3 text-center text-[14px] font-semibold text-white/72 hover:text-white transition-colors sm:w-auto"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)" }}
        >
          Sign in
        </Link>
      </motion.div>
    </section>
  )
}
