import assert from "node:assert/strict";
import { test } from "node:test";
import { isSupportSpace } from "../src/lib/utils/course-classification";

test("recognizes support spaces without hiding academic courses", () => {
  for (const courseName of [
    "Student Support Hub",
    "Transfer Center",
    "LAVC CAP Canvas Student Hub",
    "Arts, Media, Design CAP Student Hub",
    "student_support_hub",
  ]) {
    assert.equal(
      isSupportSpace({ courseName, courseCode: courseName }),
      true,
      courseName,
    );
  }
  for (const courseName of [
    "LING 101 - Intro To Linguistics",
    "Introduction to Biology",
    "Community Support",
    "Student Success",
    "The Center of the Universe",
    "COUNS 101: Transfer Center Practicum",
  ]) {
    assert.equal(
      isSupportSpace({ courseName, courseCode: courseName }),
      false,
      courseName,
    );
  }
  assert.equal(
    isSupportSpace({
      courseName: "Student Support Hub",
      courseCode: "COUNS 101",
    }),
    false,
  );
});
