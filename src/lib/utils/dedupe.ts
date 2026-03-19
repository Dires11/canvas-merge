// lib/dedupe.ts

type Entry<T> = {
  promise?: Promise<T>;
  value?: T;
  ts?: number;
};

const store = new Map<string, Entry<any>>();

export async function dedupeWithTtl<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
): Promise<{ hit: "cache" | "inflight" | "miss"; data: T }> {
  const now = Date.now();
  const entry = store.get(key) ?? {};
  store.set(key, entry);

  // Fresh cached value
  if (
    entry.value !== undefined &&
    entry.ts !== undefined &&
    now - entry.ts < ttlMs
  ) {
    return { hit: "cache", data: entry.value as T };
  }

  // In-flight request
  if (entry.promise) {
    const data = await entry.promise;
    return { hit: "inflight", data };
  }

  // Start new request
  entry.promise = (async () => {
    try {
      const data = await fn();
      entry.value = data;
      entry.ts = Date.now();
      return data;
    } finally {
      entry.promise = undefined;
    }
  })();

  const data = await entry.promise;
  return { hit: "miss", data };
}
