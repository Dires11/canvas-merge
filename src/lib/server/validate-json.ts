import { NextRequest } from "next/server";
import { z } from "zod";

type ValidateJsonResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: string;
      status: number;
      fieldErrors?: Record<string, string[] | undefined>;
      formErrors?: string[];
    };

export async function validateJson<T>(
  req: NextRequest,
  schema: z.ZodType<T>,
): Promise<ValidateJsonResult<T>> {
  const contentType = req.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return {
      ok: false,
      error: "Content-Type must be application/json",
      status: 415,
    };
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return {
      ok: false,
      error: "Invalid JSON body",
      status: 400,
    };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error);

    return {
      ok: false,
      error: "Invalid input",
      status: 400,
      formErrors: flat.formErrors,
      fieldErrors: flat.fieldErrors,
    };
  }

  return {
    ok: true,
    data: parsed.data,
  };
}
