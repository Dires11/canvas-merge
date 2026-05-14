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
  timeoutMs?: number;
  retry?: { attempts?: number; baseDelayMs?: number };
};

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  attempts: number,
  baseDelayMs: number,
): Promise<Response> {
  for (let i = 0; i < attempts; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    if (init.signal) {
      init.signal.addEventListener("abort", () => controller.abort());
    }

    try {
      const res = await fetch(url, { ...init, signal: controller.signal });

      if (res.status === 429) {
        if (i < attempts - 1) {
          const retryAfter = res.headers.get("Retry-After");
          const delay = retryAfter
            ? parseInt(retryAfter) * 1000
            : baseDelayMs * 2 ** i;
          await sleep(delay);
          continue;
        }
      }

      if (res.status >= 500) {
        if (i < attempts - 1) {
          await sleep(baseDelayMs * 2 ** i);
          continue;
        }
      }

      return res;
    } catch (e: any) {
      const isTimeout = controller.signal.aborted && !init.signal?.aborted;
      const isLastAttempt = i === attempts - 1;

      if (isLastAttempt) {
        throw isTimeout
          ? Object.assign(new Error("Request timed out"), { isTimeout: true })
          : e;
      }

      await sleep(baseDelayMs * 2 ** i);
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error("Unreachable");
}

export async function canvasFetchJson<T>(
  domain: string,
  path: string,
  opts: CanvasFetchOptions,
): Promise<CanvasResult<T>> {
  const url = new URL(path, domain);

  if (opts.searchParams) {
    for (const [key, value] of Object.entries(opts.searchParams)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${opts.token}`,
    ...(opts.body ? { "Content-Type": "application/json" } : {}),
    ...(opts.headers ?? {}),
  };

  let res: Response;
  try {
    res = await fetchWithRetry(
      url.toString(),
      {
        method: opts.method ?? "GET",
        headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
        signal: opts.signal,
      },
      opts.timeoutMs ?? 10_000,
      opts.retry?.attempts ?? 3,
      opts.retry?.baseDelayMs ?? 300,
    );
  } catch (e: any) {
    const message = e?.isTimeout ? "Request timed out" : "Network error";
    return { ok: false, status: 0, error: { raw: e?.message, message } };
  }

  if (!res.ok) {
    const err = await readCanvasError(res);
    return { ok: false, status: res.status, error: err };
  }

  if (res.status === 204) {
    return { ok: true, status: res.status, data: undefined as T };
  }

  const text = await res.text().catch(() => "");
  if (!text) {
    return { ok: true, status: res.status, data: undefined as T };
  }

  try {
    return { ok: true, status: res.status, data: JSON.parse(text) as T };
  } catch {
    return {
      ok: false,
      status: res.status,
      error: { raw: text.slice(0, 200), message: "Invalid JSON response" },
    };
  }
}
