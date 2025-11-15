// app/api/canvas/weekly/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type {
  Account,
  ItemBase,
  Assignment,
  Announcement,
  ItemsByType,
} from "@/lib/types";
import { getAccountInfo } from "@/lib/canvas";

type Course = {
  id: number;
  course_code: string;
  name: string;
  term: string;
  start_at: string;
  end_at: string;
};

function isValidDomain(s: string) {
  try {
    const u = new URL(s);
    return u.protocol === "https:"; // require HTTPS
  } catch {
    return false;
  }
}

function weekBoundsUTC() {
  const now = new Date();
  const day = now.getUTCDay();
  const mondayOffset = (day + 6) % 7;
  const start = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - mondayOffset,
      8,
      0,
      0,
      0
    )
  );
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 7);
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

async function getCourses(domain: string, token: string): Promise<Course[]> {
  const url = new URL("/api/v1/courses", domain);
  url.searchParams.set("enrollment_state", "active");
  url.searchParams.set("per_page", "100");
  url.searchParams.append("include[]", "term");

  const r = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` }, // PAT
  });

  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`Canvas ${domain} ${r.status}: ${text.slice(0, 200)}`);
  }
  const courses = await r.json();
  const activeCourses = courses.filter(
    (course: any) =>
      new Date(course.term.start_at) <= new Date() &&
      new Date() <= new Date(course.term.end_at)
  );

  const normalizedCourses: Course[] = activeCourses.map((course: any) => ({
    id: course.id,
    course_code: course.course_code,
    name: course.name,
    term: course.term.name,
    start_at: course.term.start_at,
    end_at: course.term.end_at,
  }));

  return normalizedCourses;
}

async function getPlannerItems(
  domain: string,
  token: string,
  startISO: string,
  endISO: string
) {
  const url = new URL("/api/v1/planner/items", domain);
  url.searchParams.set("start_date", startISO);
  url.searchParams.set("end_date", endISO);
  url.searchParams.set("per_page", "100");

  const r = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` }, // PAT
  });

  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`Canvas ${domain} ${r.status}: ${text.slice(0, 200)}`);
  }
  return r.json();
}

function normalize(domain: string, item: any) {
  const title = item.plannable?.title ?? "Untitled";
  const due = item.plannable?.due_at ?? item.plannable?.todo_date ?? null;
  const link = new URL(item.html_url, domain);
  const course = item.context_name ?? item.course_id;
  const course_id = item.course_id;
  const points_possible = item.plannable?.points_possible ?? null;

  return {
    id: `${domain}|${item.plannable_id ?? item.id}`,
    account: item.account,
    course_id,
    domain,
    title,
    type: item.plannable_type,
    submissions: item.submissions,
    due_at: due,
    points_possible,
    html_url: link.toString(),
    course,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { accounts } = (await req.json()) as { accounts: Account[] };
    if (!Array.isArray(accounts) || accounts.length === 0) {
      return NextResponse.json(
        { error: "No accounts provided" },
        { status: 400 }
      );
    }
    const { startISO, endISO } = weekBoundsUTC();

    const results = await Promise.allSettled(
      accounts.map(async (a) => {
        if (!isValidDomain(a.domain)) throw new Error(`Bad domain ${a.domain}`);
        const courses = await getCourses(a.domain, a.token);

        let raw = await getPlannerItems(a.domain, a.token, startISO, endISO);
        raw.account = await getAccountInfo(a);
        // 🔹 Create a safe path in your project root
        const filePath = path.join(process.cwd(), "canvas_response.json");

        // 🔹 Write JSON to file (pretty-printed)
        fs.writeFileSync(filePath, JSON.stringify({ courses, raw }, null, 2));

        const items = (Array.isArray(raw) ? raw : []).map((x) =>
          normalize(a.domain, x)
        );
        return items;
      })
    );

    const items = results
      .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
      .sort((a, b) => {
        const aDue = new Date(a.due_at!).getTime();
        const bDue = new Date(b.due_at!).getTime();
        if (aDue !== bDue) return aDue - bDue;

        const aCourse = (a.course ?? a.domain ?? "").toString().toLowerCase();
        const bCourse = (b.course ?? b.domain ?? "").toString().toLowerCase();
        const courseCompare = aCourse.localeCompare(bCourse);
        if (courseCompare !== 0) return courseCompare;

        // final deterministic tie-breaker
        return a.id.localeCompare(b.id);
      });

    const assignmentTypes = new Set(["assignment", "discussion_topic", "quiz"]);
    const itemsByType: ItemsByType = {
      assignments: items.filter((it) => assignmentTypes.has(it.type)),
      announcements: items.filter((it) => it.type === "announcement"),
      other: items.filter(
        (it) => !assignmentTypes.has(it.type) && it.type !== "announcement"
      ),
    };

    return NextResponse.json({ startISO, endISO, items, itemsByType });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "error" }, { status: 500 });
  }
}
