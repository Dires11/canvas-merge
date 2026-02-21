import { getPaletteDefault } from "./colors-pallete";

type Oklch = {
  l: number;
  c: number;
  h: number;
};
export function resolveCourseColor(
  courseId: number,
  domain: string,
  meta?: any,
): Oklch {
  if (meta) {
    return { l: meta.l, c: meta.c, h: meta.h };
  }

  // Now passes both to the palette logic
  return getPaletteDefault(courseId, domain);
}

export function convertToDark(color: Oklch): Oklch {
  return { l: color.l - 0.12, c: color.c, h: color.h };
}
