import type { AccountSafeInfo } from "./account";

export type Plannable =
  | "assignment"
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
    message?: string | null;
    due_at?: string | null;
    points_possible?: number | null;
    assignment_id?: number | null;
  };
  submissions?: {
    submitted?: boolean;
    submitted_at?: string | null;
    graded?: boolean;
    late?: boolean;
    missing?: boolean;
    grade?: string | null;
    score?: number | null;
    submission_comments?: SubmissionComment[];
  };
  planner_override?: {
    id: number;
    assignment_id?: number | null;
    marked_complete: boolean;
    dismissed: boolean;
  } | null;
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

export type SubmissionComment = {
  id: number;
  author_name?: string | null;
  comment: string;
  created_at: string;
};

export type SubmissionDetails = {
  submitted: boolean;
  submittedAt: string | null;
  graded: boolean;
  late: boolean;
  missing: boolean;
  grade: string | null;
  score: number | null;
  comments: SubmissionComment[];
};

export type Assignment = ItemBase & {
  due_at: string | null;
  points_possible: number | null;
  submission: SubmissionDetails;
  plannerOverrideId: number | null;
  plannerMarkedComplete: boolean;
};
export type Announcement = ItemBase & {
  posted_at: string;
  bodyText: string | null;
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
    plannerOverrideId: number | null;
    plannerMarkedComplete: boolean;
  }>;
  accountsNotSubmitted: Array<{
    accountId: string;
    submission: SubmissionDetails;
    plannerOverrideId: number | null;
    plannerMarkedComplete: boolean;
  }>;
  accountsMissingSubmission: Array<{
    accountId: string;
    submission: SubmissionDetails;
    plannerOverrideId: number | null;
    plannerMarkedComplete: boolean;
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
