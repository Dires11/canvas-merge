export type CourseFailure = {
  accountId: string;
  baseUrl: string;
  status: number;
  error: unknown;
};

export type Course = {
  id: number;
  name: string;
  course_code: string;
  term: {
    id: number;
    name: string;
    start_at: string | null;
    end_at: string | null;
  };
};

export type UserCourse = Course & {
  baseUrl: string;
  domainName: string;
  domainSlug: string;
  accountIds: string[];
  color: { l: number; c: number; h: number };
};
