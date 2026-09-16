import assert from "node:assert/strict";
import { test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import {
  dedupeWithTtl,
  invalidateDedupeWithPrefix,
} from "../src/lib/utils/dedupe";

test("deduplicates running requests and caches completed results", async () => {
  invalidateDedupeWithPrefix("");
  let resolve!: (value: number) => void;
  let calls = 0;
  const fetcher = () => {
    calls++;
    return new Promise<number>((done) => {
      resolve = done;
    });
  };
  const first = dedupeWithTtl("concurrent", 1000, fetcher);
  const second = dedupeWithTtl("concurrent", 1000, fetcher);
  await Promise.resolve();
  resolve(42);
  assert.deepEqual(await first, { hit: "miss", data: 42 });
  assert.deepEqual(await second, { hit: "inflight", data: 42 });
  assert.deepEqual(await dedupeWithTtl("concurrent", 1000, fetcher), {
    hit: "cache",
    data: 42,
  });
  assert.equal(calls, 1);
});

test("expired results are refetched and zero TTL never caches", async () => {
  invalidateDedupeWithPrefix("");
  await dedupeWithTtl("expiry", 10, async () => 1);
  await delay(30);
  assert.deepEqual(await dedupeWithTtl("expiry", 10, async () => 2), {
    hit: "miss",
    data: 2,
  });
  await dedupeWithTtl("zero", 0, async () => 1);
  assert.equal((await dedupeWithTtl("zero", 0, async () => 2)).hit, "miss");
});

test("retention is bounded and recently used entries survive eviction", async () => {
  invalidateDedupeWithPrefix("");
  for (let index = 0; index < 128; index++)
    await dedupeWithTtl(`range:${index}`, 60_000, async () => index);
  assert.equal(
    (await dedupeWithTtl("range:0", 60_000, async () => -1)).hit,
    "cache",
  );
  await dedupeWithTtl("range:128", 60_000, async () => 128);
  assert.equal(
    (await dedupeWithTtl("range:0", 60_000, async () => -1)).hit,
    "cache",
  );
  assert.equal(
    (await dedupeWithTtl("range:1", 60_000, async () => -1)).hit,
    "miss",
  );
});

test("invalidated inflight responses cannot overwrite a fresh request", async () => {
  invalidateDedupeWithPrefix("");
  let resolve!: (value: number) => void;
  const stale = dedupeWithTtl(
    "user:range",
    1000,
    () =>
      new Promise<number>((done) => {
        resolve = done;
      }),
  );
  await Promise.resolve();
  invalidateDedupeWithPrefix("user:");
  await dedupeWithTtl("user:range", 1000, async () => 2);
  resolve(1);
  await stale;
  assert.deepEqual(await dedupeWithTtl("user:range", 1000, async () => 3), {
    hit: "cache",
    data: 2,
  });
});

test("failed requests can be retried", async () => {
  invalidateDedupeWithPrefix("");
  await assert.rejects(
    dedupeWithTtl("failure", 1000, async () => {
      throw new Error("failure");
    }),
  );
  assert.deepEqual(await dedupeWithTtl("failure", 1000, async () => 2), {
    hit: "miss",
    data: 2,
  });
});
