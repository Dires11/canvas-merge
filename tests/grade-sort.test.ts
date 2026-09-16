import assert from "node:assert/strict";
import { test } from "node:test";
import {
  compareGradeScores,
  groupGradeScore,
} from "../src/lib/utils/grade-sort";
test("score ordering preserves zero and extra credit and puts unavailable last", () => {
  const scores = [null, 80, 0, 120, 60];
  assert.deepEqual(
    [...scores].sort((a, b) => compareGradeScores(a, b, "lowest")),
    [0, 60, 80, 120, null],
  );
  assert.deepEqual(
    [...scores].sort((a, b) => compareGradeScores(a, b, "highest")),
    [120, 80, 60, 0, null],
  );
});
test("groups use their lowest or highest available score", () => {
  const rows = [{ score: null }, { score: 90 }, { score: 0 }];
  assert.equal(groupGradeScore(rows, "lowest"), 0);
  assert.equal(groupGradeScore(rows, "highest"), 90);
  assert.equal(groupGradeScore([{ score: null }], "highest"), null);
  assert.equal(compareGradeScores(30, 90, "name"), 0);
});
