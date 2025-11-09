export type Account = { domain: string; token: string };

export type AccountInfo = {
  id: number;
  name: string;
  avatar_url: string;
};

export type ItemBase = {
  account: AccountInfo;
  id: string;
  course_id: number;
  domain: string;
  title: string;
  type: string;
  html_url: string;
  course: string;
};

export type Assignment = ItemBase & {
  due_at: string | null;
  points_possible: number | null;
  submissions: {
    submitted: boolean;
    excused: boolean;
    graded: boolean;
    posted_at: string | null;
    late: boolean;
    missing: boolean;
    needs_grading: boolean;
    has_feedback: boolean;
    redo_request: boolean;
  };
};

export type Announcement = ItemBase & {};

export type ItemsByType = {
  assignments: Assignment[];
  announcements: Announcement[];
  other: ItemBase[];
};
