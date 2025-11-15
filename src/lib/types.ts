export type Account = { domain: string; token: string };

export type AccountInfo = {
  id: number;
  name: string;
  avatar_url: string;
};

export type ItemBase = {
  id: number;
  course_id: number;
  course_name: string;
  title: string;
  type: string;
  url: string;
};

type SubmissionDetails = {
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

export type MergedAssignment = ItemBase & {
  due_at: string | null;
  points_possible: number;
  accounts: Array<{
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
