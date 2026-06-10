"use client"

import { useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { ChevronDown } from "lucide-react"

const FAQS = [
  {
    q: "How do I find my Canvas access token?",
    a: "In Canvas, open Account (top-left avatar) → Settings → scroll to Approved Integrations → click “+ New Access Token”. Give it any name, set the expiry date, and copy the token. Paste it into CanvasMerge — that's it.",
  },
  {
    q: "Will this work with my school?",
    a: "Yes. CanvasMerge works with any institution running Canvas LMS by Instructure — universities, community colleges, dual-enrollment programs, and more. If your school has a Canvas login page, it'll work.",
  },
  {
    q: "Is my access token safe?",
    a: "Tokens are encrypted at rest and used only to fetch your assignment and course data. CanvasMerge never sees or stores your Canvas password.",
  },
  {
    q: "Can I connect more than one Canvas account?",
    a: "That's the whole point. Add as many Canvas domains as you have — each one syncs into the same unified planner, color-coded by course so nothing blurs together.",
  },
  {
    q: "Does CanvasMerge read my grades or submission content?",
    a: "No. It only reads assignment names, due dates, and course info — the minimum needed to build your planner.",
  },
]

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function HowItWorks() {
  const reduce = useReducedMotion()
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section
      className="px-6 py-20 sm:px-14"
      style={{ background: "#07070f", borderTop: "1px solid rgba(255,255,255,0.04)" }}
    >
      <div className="text-center">
        <div className="mb-[10px] text-[11px] font-bold uppercase tracking-[.1em] text-indigo-400">
          Common questions
        </div>
        <h2 className="text-[clamp(28px,3.5vw,42px)] font-extrabold leading-[1.1] text-white">
          Everything you need to know.
        </h2>
      </div>

      <div className="mx-auto mt-12 max-w-[720px]">
        {FAQS.map((faq, i) => {
          const isOpen = open === i
          return (
            <motion.div
              key={faq.q}
              initial={reduce ? undefined : { opacity: 0, y: 14 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.07, ease: EASE }}
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex w-full items-center justify-between gap-6 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span
                  className="text-[15px] font-semibold transition-colors duration-200"
                  style={{ color: isOpen ? "#a5b4fc" : "rgba(255,255,255,0.85)" }}
                >
                  {faq.q}
                </span>
                <ChevronDown
                  className="size-[15px] shrink-0 transition-all duration-300"
                  style={{
                    color: isOpen ? "#a5b4fc" : "rgba(255,255,255,0.28)",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                  aria-hidden="true"
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.26, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 text-[14px] leading-[1.75] text-white/45">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} />
      </div>
    </section>
  )
}
