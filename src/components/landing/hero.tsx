"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
  type TargetAndTransition,
  type Transition,
  type Target,
} from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { DashboardMockup } from "./dashboard-mockup";

const PARTICLES = [
  { left: "8%", size: 2, duration: 5.2, delay: 0 },
  { left: "22%", size: 1.5, duration: 6.8, delay: -1.6 },
  { left: "44%", size: 2, duration: 4.8, delay: -3.1 },
  { left: "60%", size: 1, duration: 7.2, delay: -0.9 },
  { left: "78%", size: 2, duration: 5.6, delay: -2.2 },
  { left: "34%", size: 1.5, duration: 8.3, delay: -4.4 },
  { left: "70%", size: 1, duration: 6.1, delay: -1.1 },
  { left: "52%", size: 1.5, duration: 5.9, delay: -2.7 },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function Hero({ isSignedIn }: { isSignedIn: boolean }) {
  const reduce = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  const primaryHref = isSignedIn ? "/dashboard" : "/sign-up";
  const primaryLabel = isSignedIn ? "Open dashboard" : "Start merging";

  const heroBg = isLight
    ? "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #ddd6fe 100%)"
    : "linear-gradient(135deg, #020617 0%, #0f172a 40%, #1e1040 70%, #0c1445 100%)";

  const orbOpacity = isLight ? 0.18 : 0.38;
  const headlineAccent = isLight ? "#6366f1" : "#a5b4fc";

  const fadeUp = (
    delay: number,
  ):
    | {
        initial?: Target;
        animate?: TargetAndTransition;
        transition?: Transition;
      }
    | object =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: EASE },
        };

  return (
    <section
      className="relative isolate min-h-screen overflow-hidden"
      style={{ background: heroBg }}
    >
      {/* Stars (dark mode only) */}
      {!isLight && !reduce && (
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
            animation: "twinkle 10s ease-in-out infinite alternate",
          }}
        />
      )}

      {/* Orbs */}
      {!reduce && (
        <>
          <motion.div
            className="pointer-events-none absolute rounded-full"
            style={{
              width: 640,
              height: 640,
              top: -230,
              right: -60,
              background: `radial-gradient(circle, rgba(99,102,241,${orbOpacity}) 0%, transparent 65%)`,
            }}
            animate={{ x: [0, -28, 12, 0], y: [0, 18, -14, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute rounded-full"
            style={{
              width: 440,
              height: 440,
              bottom: -150,
              left: -80,
              background: `radial-gradient(circle, rgba(139,92,246,${isLight ? 0.14 : 0.3}) 0%, transparent 65%)`,
            }}
            animate={{ x: [0, 28, 0], y: [0, -22, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute rounded-full"
            style={{
              width: 300,
              height: 300,
              top: "45%",
              left: "36%",
              background: `radial-gradient(circle, rgba(6,182,212,${isLight ? 0.08 : 0.14}) 0%, transparent 65%)`,
            }}
            animate={{ y: [0, -28, 0] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {/* Particles */}
      {!reduce &&
        PARTICLES.map((p) => (
          <motion.div
            key={p.left}
            className="pointer-events-none absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              left: p.left,
              top: "95%",
              background: isLight
                ? "rgba(79,70,229,0.7)"
                : "rgba(255,255,255,0.55)",
            }}
            animate={{ y: [0, "-100vh"], x: [0, 12] }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

      {/* Navbar */}
      {!isSignedIn && (
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-[18px] sm:px-14">
          <div
            className="flex items-center gap-[10px] text-[15px] font-bold"
            style={{ color: isLight ? "#1e1b4b" : "#fff" }}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: isLight ? "#6366f1" : "#fff" }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isLight ? "#fff" : "#0f0f13"}
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            CanvasMerge
          </div>
          <div className="flex gap-2">
            <Link
              href="/sign-in"
              className="hidden rounded-lg px-4 py-[7px] text-[13px] font-semibold transition-colors sm:block"
              style={
                isLight
                  ? {
                      background: "rgba(99,102,241,0.08)",
                      border: "1px solid rgba(99,102,241,0.18)",
                      color: "#6366f1",
                    }
                  : {
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.13)",
                      color: "rgba(255,255,255,0.80)",
                    }
              }
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg px-4 py-[7px] text-[13px] font-bold transition-colors"
              style={
                isLight
                  ? { background: "#1e1b4b", color: "#fff" }
                  : { background: "#fff", color: "#0f0f13" }
              }
            >
              Get started
            </Link>
          </div>
        </div>
      )}

      {/* Content grid */}
      <div className="relative z-10 grid items-center gap-10 px-6 pt-[100px] pb-[60px] sm:px-14 lg:grid-cols-[1fr_1.3fr]">
        {/* Left — copy */}
        <div className="flex flex-col">
          <motion.div {...fadeUp(0)}>
            <div
              className="mb-[22px] inline-flex items-center gap-2 rounded-full px-[14px] py-[5px] text-[12px] font-semibold"
              style={
                isLight
                  ? {
                      background: "rgba(99,102,241,0.08)",
                      border: "1px solid rgba(99,102,241,0.18)",
                      color: "#6366f1",
                    }
                  : {
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      color: "rgba(255,255,255,0.72)",
                    }
              }
            >
              <Sparkles
                className="size-[13px]"
                style={{ color: isLight ? "#6366f1" : "#a5b4fc" }}
              />
              Built for productive students
            </div>
          </motion.div>

          <motion.h1
            {...fadeUp(0.1)}
            className="text-[clamp(46px,5.5vw,80px)] leading-[0.95] font-black tracking-[-0.035em]"
            style={{ color: isLight ? "#1e1b4b" : "#fff" }}
          >
            Every Canvas.
            <br />
            <span style={{ color: headlineAccent }}>One view.</span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.22)}
            className="mt-[18px] max-w-[460px] text-[16px] leading-[1.65]"
            style={{ color: isLight ? "#4c4891" : "rgba(255,255,255,0.58)" }}
          >
            One calm command center for every Canvas campus, course, due date,
            and assignment competing for your attention.
          </motion.p>

          <motion.div {...fadeUp(0.34)} className="mt-[26px] flex gap-[10px]">
            <Link
              href={primaryHref}
              className="inline-flex items-center gap-[6px] rounded-[10px] px-[22px] py-3 text-[14px] font-bold transition-colors"
              style={
                isLight
                  ? { background: "#1e1b4b", color: "#fff" }
                  : { background: "#fff", color: "#0f0f13" }
              }
            >
              {primaryLabel}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            {isSignedIn && (
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-[10px] px-[22px] py-3 text-[14px] font-semibold transition-colors"
                style={
                  isLight
                    ? {
                        background: "rgba(99,102,241,0.08)",
                        border: "1px solid rgba(99,102,241,0.18)",
                        color: "#6366f1",
                      }
                    : {
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.16)",
                        color: "rgba(255,255,255,0.80)",
                      }
                }
              >
                View dashboard
              </Link>
            )}
          </motion.div>
        </div>

        {/* Right — dashboard mockup (hidden on mobile) */}
        <motion.div
          className="hidden items-center justify-center lg:flex"
          initial={reduce ? undefined : { opacity: 0, y: 18 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18, ease: EASE }}
        >
          <div style={{ width: "100%", perspective: 1200 }}>
            <motion.div
              style={{ rotateY: -10, rotateX: 3 }}
              animate={reduce ? undefined : { y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              <DashboardMockup />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      {!reduce && (
        <motion.div
          className="absolute bottom-[26px] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-[5px]"
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            className="h-1 w-1 rounded-full"
            style={{
              background: isLight
                ? "rgba(99,102,241,0.38)"
                : "rgba(255,255,255,0.38)",
            }}
          />
          <div
            className="h-7 w-px"
            style={{
              background: isLight
                ? "linear-gradient(to bottom, rgba(99,102,241,0.30), transparent)"
                : "linear-gradient(to bottom, rgba(255,255,255,0.30), transparent)",
            }}
          />
          <div
            className="h-1 w-1 rounded-full"
            style={{
              background: isLight
                ? "rgba(99,102,241,0.38)"
                : "rgba(255,255,255,0.38)",
            }}
          />
        </motion.div>
      )}

      <style>{`@keyframes twinkle{0%{opacity:.7}100%{opacity:1}}`}</style>
    </section>
  );
}
