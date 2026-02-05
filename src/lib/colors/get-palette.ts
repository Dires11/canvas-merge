import {
  BUILTIN_PALETTES,
  type BuiltInPaletteId,
  type Oklch,
} from "./built-in-palettes";
import { deriveDark, oklchToCss } from "./oklch";

export type ThemeMode = "light" | "dark";

export function getBuiltInPaletteOklch(
  id: BuiltInPaletteId,
  mode: ThemeMode,
): Oklch[] {
  const base = BUILTIN_PALETTES[id] ?? [];
  if (mode === "dark") return base.map(deriveDark);
  return base;
}

export function getBuiltInPaletteCss(
  id: BuiltInPaletteId,
  mode: ThemeMode,
): string[] {
  return getBuiltInPaletteOklch(id, mode).map(oklchToCss);
}
