import { LRUCache } from "lru-cache";

type Entry<T> = { promise: Promise<T> } | { value: T };

// Date-range keys can vary indefinitely. Bound retained responses and remove
// expired entries even when that exact range is never requested again.
const store = new LRUCache<string, Entry<unknown>>({
  max: 128,
  ttlAutopurge: true,
});

export function invalidateDedupeWithPrefix(prefix: string) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

export async function dedupeWithTtl<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
): Promise<{ hit: "cache" | "inflight" | "miss"; data: T }> {
  const existing = store.get(key) as Entry<T> | undefined;
  if (existing) {
    if ("value" in existing) return { hit: "cache", data: existing.value };
    return { hit: "inflight", data: await existing.promise };
  }

  // A request has no TTL while running; the result's TTL starts on completion.
  const entry: Entry<T> = { promise: Promise.resolve().then(fn) };
  store.set(key, entry);
  try {
    const data = await entry.promise;
    // An invalidated or evicted request must not repopulate stale results.
    if (store.peek(key) === entry) {
      if (ttlMs > 0) store.set(key, { value: data }, { ttl: ttlMs });
      else store.delete(key);
    }
    return { hit: "miss", data };
  } catch (error) {
    if (store.peek(key) === entry) store.delete(key);
    throw error;
  }
}
