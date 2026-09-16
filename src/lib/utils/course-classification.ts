/** A conservative name heuristic, not an authoritative Canvas course type. */
export function isSupportSpace(course: {
  courseName: string;
  courseCode: string;
}): boolean {
  // Keep recognizable academic course codes, even when their title mentions support.
  const academicCode = /\b[A-Z][A-Z &/-]{1,24}\s+\d{2,4}[A-Z]?\b/i;
  if (
    academicCode.test(course.courseName) ||
    academicCode.test(course.courseCode)
  )
    return false;

  const name = course.courseName
    .replace(/[_–—-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return /\b(?:student(?: support)? hub|student support cent(?:er|re)|transfer cent(?:er|re)|(?:career|counseling|counselling|tutoring|resource|success) cent(?:er|re))\b/i.test(
    name,
  );
}
