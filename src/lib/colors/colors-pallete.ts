export const COURSE_PALETTE_40 = [
  // 🔴 Reds / Warm
  { l: 0.7, c: 0.2, h: 0 },
  { l: 0.76, c: 0.18, h: 15 },
  { l: 0.65, c: 0.22, h: 30 },
  { l: 0.74, c: 0.19, h: 45 },
  { l: 0.68, c: 0.21, h: 60 },

  // 🟡 Yellow / Lime
  { l: 0.8, c: 0.17, h: 75 },
  { l: 0.72, c: 0.2, h: 90 },
  { l: 0.66, c: 0.23, h: 105 },
  { l: 0.78, c: 0.18, h: 120 },
  { l: 0.7, c: 0.21, h: 135 },

  // 🟢 Greens
  { l: 0.64, c: 0.24, h: 150 },
  { l: 0.75, c: 0.18, h: 165 },
  { l: 0.68, c: 0.22, h: 180 },
  { l: 0.74, c: 0.19, h: 195 },
  { l: 0.66, c: 0.23, h: 210 },

  // 🔵 Blues
  { l: 0.72, c: 0.2, h: 225 },
  { l: 0.64, c: 0.24, h: 240 },
  { l: 0.78, c: 0.17, h: 255 },
  { l: 0.69, c: 0.22, h: 270 },
  { l: 0.75, c: 0.19, h: 285 },

  // 🟣 Purples
  { l: 0.67, c: 0.23, h: 300 },
  { l: 0.74, c: 0.18, h: 315 },
  { l: 0.65, c: 0.24, h: 330 },
  { l: 0.76, c: 0.19, h: 345 },

  // 🔴 Second pass (shifted lanes for contrast)
  { l: 0.82, c: 0.16, h: 10 },
  { l: 0.6, c: 0.25, h: 50 },
  { l: 0.84, c: 0.15, h: 95 },
  { l: 0.62, c: 0.26, h: 140 },
  { l: 0.83, c: 0.16, h: 185 },

  { l: 0.61, c: 0.25, h: 230 },
  { l: 0.82, c: 0.15, h: 275 },
  { l: 0.63, c: 0.26, h: 320 },

  // 🔥 High separation extras
  { l: 0.58, c: 0.27, h: 20 },
  { l: 0.86, c: 0.14, h: 70 },
  { l: 0.57, c: 0.28, h: 110 },
  { l: 0.85, c: 0.15, h: 160 },
  { l: 0.59, c: 0.27, h: 200 },
  { l: 0.84, c: 0.16, h: 250 },
  { l: 0.6, c: 0.26, h: 295 },
  { l: 0.83, c: 0.15, h: 340 },
];

export function getPaletteDefault(courseId: number, domainSlug: string) {
  // Simple numeric hash of the string ID
  const key = `${domainSlug}|${courseId}`;
  const hash = key
    .split("")
    .reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  // 2. The Golden Shuffle
  // Instead of (hash % 50), we use the fractional part of (hash * Phi)
  // to pick a spot in the array. This is mathematically the "most scattered"
  // way to map a number to a fixed range.
  const phi = 0.618033988749895;
  const scatter = Math.abs(hash) * phi;
  const index = Math.floor((scatter % 1) * COURSE_PALETTE_40.length);
  return COURSE_PALETTE_40[index];
}
