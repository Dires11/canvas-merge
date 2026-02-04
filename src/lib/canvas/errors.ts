import { z } from "zod";

const CanvasErrorSchema = z.object({
  errors: z
    .array(
      z.object({
        message: z.string().optional(),
        expired_at: z.iso.datetime().optional(),
      }),
    )
    .optional(),
});

export type CanvasError = {
  message?: string;
  expiredAt?: Date;
  raw: string;
};

export async function readCanvasError(res: Response): Promise<CanvasError> {
  const text = await res.text().catch(() => "");
  if (!text)
    return {
      raw: "No response body returned.",
    };

  try {
    const json = JSON.parse(text);
    const parsed = CanvasErrorSchema.safeParse(json);
    if (parsed.success) {
      const e = parsed.data.errors?.[0];
      return {
        message: e?.message,
        expiredAt: e?.expired_at ? new Date(e.expired_at) : undefined,
        raw: text.slice(0, 200),
      };
    }
  } catch {}

  return { raw: text.slice(0, 200) };
}
