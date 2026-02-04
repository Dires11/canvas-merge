import { readCanvasError, type CanvasError } from "./errors";

export type CanvasResult<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; error: CanvasError; status: number };

type CanvasFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token: string;
  body?: unknown;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  searchParams?: Record<string, string | number | boolean | undefined>;
};

export async function canvasFetchJson<T>(
  domain: string,
  path: string,
  opts: CanvasFetchOptions,
): Promise<CanvasResult<T>> {
  const url = new URL(path, domain);

  // 👇 apply search params here
  if (opts.searchParams) {
    for (const [key, value] of Object.entries(opts.searchParams)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: opts.method ?? "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${opts.token}`,
        ...(opts.body ? { "Content-Type": "application/json" } : {}),
        ...(opts.headers ?? {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal,
    });
  } catch (e: any) {
    // network / DNS / CORS / timeout errors
    return {
      ok: false,
      status: 0,
      error: { raw: e?.message ?? "Network error", message: "Network error" },
    };
  }

  if (!res.ok) {
    const err = await readCanvasError(res);
    return { ok: false, status: res.status, error: err };
  }

  // Handle “204 No Content” etc.
  if (res.status === 204) {
    return { ok: true, status: res.status, data: undefined as T };
  }

  // Parse JSON safely (Canvas sometimes returns empty body on success)
  const text = await res.text().catch(() => "");
  if (!text) {
    return { ok: true, status: res.status, data: undefined as T };
  }

  try {
    return { ok: true, status: res.status, data: JSON.parse(text) as T };
  } catch {
    // Body wasn't JSON even though success
    return {
      ok: false,
      status: res.status,
      error: { raw: text.slice(0, 200), message: "Invalid JSON response" },
    };
  }
}
