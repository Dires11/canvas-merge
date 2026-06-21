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

function getErrorMessage(value: unknown): string | undefined {
  if (!value) return undefined;

  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    for (const item of value) {
      const message = getErrorMessage(item);
      if (message) return message;
    }
    return undefined;
  }

  if (typeof value === "object") {
    const object = value as Record<string, unknown>;

    if (typeof object.message === "string") return object.message;

    for (const nestedValue of Object.values(object)) {
      const message = getErrorMessage(nestedValue);
      if (message) return message;
    }
  }

  return undefined;
}

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
        message: e?.message ?? getErrorMessage(json),
        expiredAt: e?.expired_at ? new Date(e.expired_at) : undefined,
        raw: text.slice(0, 200),
      };
    }

    return {
      message: getErrorMessage(json),
      raw: text.slice(0, 200),
    };
  } catch {}

  return { raw: text.slice(0, 200) };
}
