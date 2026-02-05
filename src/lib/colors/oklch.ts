import type { Oklch } from "./built-in-palettes";

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

export function oklchToCss({ l, c, h }: Oklch) {
  // CSS oklch() uses percentages for L.
  const L = clamp(l, 0, 1) * 100;
  const C = clamp(c, 0, 0.4);
  const H = ((h % 360) + 360) % 360;
  return `oklch(${L.toFixed(2)}% ${C.toFixed(4)} ${H.toFixed(2)})`;
}

export function deriveDark(color: Oklch): Oklch {
  // Baseline transform: lower L, slightly lower C.
  // Works well for “colored chips / dots” on dark backgrounds.
  const l = clamp(color.l - 0.18, 0.42, 0.62);
  const c = clamp(color.c - 0.04, 0.08, 0.22);
  return { l, c, h: color.h };
}
