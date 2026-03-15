export type Account = { domain: string; token: string };

export type AccountInfo = {
  accountCanvasId: number;
  name: string;
  avatarUrl: string;
  domain: string;
};

export type AccountSafeInfo = {
  id: string;
  name: string;
  domain: string;
  avatarUrl: string;
  expiredAt: Date | null;
};

export type ItemBase = {
  id: number;
  course_id: number;
  course_name: string;
  title: string;
  type: string;
  url: string;
};

export type SubmissionDetails = {
  submitted: boolean;
  graded: boolean;
  late: boolean;
  missing: boolean;
};

export type Assignment = ItemBase & {
  due_at: string | null;
  points_possible: number;
  submission: SubmissionDetails;
};
export type Announcement = ItemBase & {
  posted_at: string;
};

export type ItemsByType = {
  account: string;
  assignments: Assignment[];
  announcements: Announcement[];
  other: ItemBase[];
};

export type ItemsByAccount = Record<string, ItemsByType>;
export type ItemsByDomain = Record<string, ItemsByAccount>;

export type MergedAssignment = ItemBase & {
  due_at: string | null;
  points_possible: number;
  accountsSubmitted: Array<{
    accountId: string;
    submission: SubmissionDetails;
  }>;
  accountsNotSubmitted: Array<{
    accountId: string;
    submission: SubmissionDetails;
  }>;
  accountsMissingSubmission: Array<{
    accountId: string;
    submission: SubmissionDetails;
  }>;
};

export type MergedOther = ItemBase & {
  accounts: Array<{
    accountId: string;
  }>;
};

export type MergedItems = {
  assignments: MergedAssignment[];
  announcements: Announcement[];
  other: MergedOther[];
};

export type MergedItemsByDomain = Record<string, MergedItems>;

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
  domain: string;
  accountIds: string[];
  color: { l: number; c: number; h: number };
};
