import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeAssignment } from "../src/lib/canvas/grades";
import { canvasFetchAll } from "../src/lib/canvas/fetch";

const assignment = { id: 1, name: "Essay", due_at: null, points_possible: 10 };
test("zero scores remain graded, missing grades remain null, excused scores are omitted", () => {
  const zero = normalizeAssignment({
    ...assignment,
    submission: { score: 0, grade: "0" },
  });
  assert.equal(zero.score, 0);
  assert.equal(zero.status, "Graded");
  assert.equal(normalizeAssignment(assignment).score, null);
  const excused = normalizeAssignment({
    ...assignment,
    submission: { score: 10, grade: "10", excused: true },
  });
  assert.equal(excused.status, "Excused");
  assert.equal(excused.score, null);
  assert.equal(excused.grade, null);
  assert.equal(
    normalizeAssignment({ ...assignment, submission: { missing: true } })
      .status,
    "Missing",
  );
});
test("pagination follows Canvas links and refuses cross-origin credential forwarding", async () => {
  const originalFetch = globalThis.fetch;
  const requests: string[] = [];
  try {
    globalThis.fetch = async (input) => {
      requests.push(String(input));
      return new Response(JSON.stringify([{ id: requests.length }]), {
        headers:
          requests.length === 1
            ? {
                link: '<https://school.example/api/v1/courses?page=2>; rel="next"',
              }
            : {},
      });
    };
    const result = await canvasFetchAll(
      "https://school.example",
      "/api/v1/courses",
      { token: "test", searchParams: { "include[]": "total_scores" } },
    );
    assert.equal(result.ok, true);
    if (result.ok) assert.deepEqual(result.data, [{ id: 1 }, { id: 2 }]);
    assert.equal(requests.length, 2);
    assert.equal(requests[1], "https://school.example/api/v1/courses?page=2");
    requests.length = 0;
    globalThis.fetch = async (input) => {
      requests.push(String(input));
      return new Response("[]", {
        headers: { link: '<https://other.example/api/v1/courses>; rel="next"' },
      });
    };
    assert.equal(
      (
        await canvasFetchAll("https://school.example", "/api/v1/courses", {
          token: "test",
        })
      ).ok,
      false,
    );
    assert.equal(requests.length, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
