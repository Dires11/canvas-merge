export type Oklch = { l: number; c: number; h: number }; // l: 0..1, c: 0..~0.4, h: 0..360

export type BuiltInPaletteId =
  | "builtin:bright"
  | "builtin:pastel"
  | "builtin:cool"
  | "builtin:earth"
  | "builtin:dark";

export const BUILTIN_PALETTES: Record<BuiltInPaletteId, Oklch[]> = {
  "builtin:bright": [
    // 30 entries (example-ish, replace with your exact palette)
    { l: 0.7, c: 0.26, h: 25 },
    { l: 0.75, c: 0.24, h: 50 },
    { l: 0.8, c: 0.22, h: 85 },
    { l: 0.78, c: 0.24, h: 120 },
    { l: 0.72, c: 0.26, h: 145 },
    { l: 0.7, c: 0.28, h: 165 },
    { l: 0.68, c: 0.26, h: 190 },
    { l: 0.7, c: 0.24, h: 210 },
    { l: 0.72, c: 0.26, h: 235 },
    { l: 0.68, c: 0.28, h: 255 },

    { l: 0.65, c: 0.26, h: 275 },
    { l: 0.7, c: 0.28, h: 295 },
    { l: 0.75, c: 0.26, h: 315 },
    { l: 0.78, c: 0.24, h: 335 },
    { l: 0.82, c: 0.22, h: 355 },

    { l: 0.6, c: 0.3, h: 20 },
    { l: 0.62, c: 0.28, h: 60 },
    { l: 0.64, c: 0.3, h: 100 },
    { l: 0.6, c: 0.28, h: 140 },
    { l: 0.62, c: 0.3, h: 180 },

    { l: 0.58, c: 0.28, h: 220 },
    { l: 0.6, c: 0.3, h: 260 },
    { l: 0.58, c: 0.28, h: 300 },
    { l: 0.6, c: 0.3, h: 340 },

    { l: 0.85, c: 0.22, h: 30 },
    { l: 0.85, c: 0.22, h: 90 },
    { l: 0.85, c: 0.22, h: 150 },
    { l: 0.85, c: 0.22, h: 210 },
    { l: 0.85, c: 0.22, h: 270 },
    { l: 0.85, c: 0.22, h: 330 },
  ],
};
