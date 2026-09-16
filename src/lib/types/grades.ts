export type CourseGrade = {
  accountId: string;
  studentName: string;
  avatarUrl: string;
  courseId: number;
  courseName: string;
  courseCode: string;
  color?: { l: number; c: number; h: number };
  baseUrl: string;
  school: string;
  score: number | null;
  grade: string | null;
};
export type GradesData = {
  grades: CourseGrade[];
  failures: {
    accountId: string;
    studentName: string;
    expiredAt: string | null;
    message: string;
  }[];
  updatedAt: string;
};
export type GradeAssignment = {
  id: number;
  name: string;
  dueAt: string | null;
  gradedAt: string | null;
  pointsPossible: number | null;
  score: number | null;
  grade: string | null;
  status: "Excused" | "Graded" | "Missing" | "Submitted" | "Not submitted";
};
