export type GradeSort = "name" | "lowest" | "highest";

export function compareGradeScores(
  a: number | null,
  b: number | null,
  sort: GradeSort,
) {
  if (sort === "name") return 0;
  if (a == null) return b == null ? 0 : 1;
  if (b == null) return -1;
  return sort === "lowest" ? a - b : b - a;
}

export function groupGradeScore(
  rows: { score: number | null }[],
  sort: GradeSort,
) {
  const scores = rows.flatMap((row) => (row.score == null ? [] : [row.score]));
  if (!scores.length) return null;
  return sort === "highest" ? Math.max(...scores) : Math.min(...scores);
}
