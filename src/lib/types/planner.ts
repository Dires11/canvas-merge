import type { AccountSafeInfo } from "./account";

export type Plannable =
  | "announcement"
  | "discussion_topic"
  | "quiz"
  | "wiki_page"
  | "planner_note"
  | "calendar_event"
  | "assessment_request"
  | "sub_assignment"
  | "peer_review_sub_assignment";

export type RawPlannerItem = {
  plannable_id: number;
  plannable_type: Plannable;
  plannable_date: string;
  course_id: number;
  context_name: string;
  html_url: string;
  plannable?: {
    title?: string;
    due_at?: string | null;
    points_possible?: number | null;
  };
  submissions?: {
    submitted?: boolean;
    graded?: boolean;
    late?: boolean;
    missing?: boolean;
  };
};

export type ItemBase = {
  id: number;
  course_id: number;
  course_name: string;
  title: string;
  type: Plannable;
  url: string;
  baseUrl: string;
  domainName: string;
  domainSlug: string;
};

export type SubmissionDetails = {
  submitted: boolean;
  graded: boolean;
  late: boolean;
  missing: boolean;
};

export type Assignment = ItemBase & {
  due_at: string | null;
  points_possible: number | null;
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
  points_possible: number | null;
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

export type UserPlanner = {
  merged?: MergedItemsByDomain;
  itemsByDomain: ItemsByDomain;
  accountsSafeInfo: AccountSafeInfo[];
  accountsWithErrors: string[];
};

export type FilterType = "domain" | "account" | "course";
export type Filters = Record<FilterType, string[]>;
