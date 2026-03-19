export type Result =
  | { ok: true }
  | { ok: false; error: string; status?: number };

export type DataResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };
