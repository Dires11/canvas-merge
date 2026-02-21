// app/api/courses/route.ts
import { getUserCanvasAccounts } from "@/data/canvas-account";
import { requireUserApi } from "@/lib/auth-server";
import { NextRequest, NextResponse } from "next/server";
import { getAccountCourses } from "@/lib/canvas";
import { decryptToken } from "@/lib/crypto";

// You can replace `any` with your real CanvasCourse type.
type CanvasCourse = any;

function courseKey(domain: string, course: CanvasCourse) {
  return `${domain}:${course.id}`;
}

export async function GET(req: NextRequest) {
  const user = await requireUserApi();

  const url = new URL(req.url);
  const accountIds = url.searchParams.getAll("accountIds");
  const filteredIds = accountIds.length > 0 ? accountIds : undefined;

  const accounts = await getUserCanvasAccounts(user.id, true, filteredIds);

  if (!accounts) {
    return NextResponse.json(
      { error: "Could not load Canvas accounts." },
      { status: 500 },
    );
  }
  if (accounts.length === 0) {
    return NextResponse.json(
      { error: "No Canvas accounts found." },
      { status: 404 },
    );
  }

  // Fetch all accounts in parallel
  const results = await Promise.all(
    accounts.map((a) =>
      getAccountCourses({
        domain: a.domain,
        token: decryptToken(a.accessToken),
      }),
    ),
  );

  // Build a single deduped list
  const seen = new Map<string, CanvasCourse & { _sourceDomains?: string[] }>();

  const failures: Array<{
    accountId: string;
    domain: string;
    status: number;
    error: unknown;
  }> = [];

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const a = accounts[i];

    if (!r.ok) {
      failures.push({
        accountId: a.id,
        domain: a.domain,
        status: r.status,
        error: r.error,
      });
      continue;
    }

    for (const course of r.data) {
      const key = courseKey(a.domain, course);

      const existing = seen.get(key);
      if (!existing) {
        // Optionally annotate which domain(s) this course came from
        seen.set(key, { ...course, _sourceDomains: [a.domain] });
      } else {
        // If the same course shows up again for the same domain, just track it
        existing._sourceDomains ??= [];
        if (!existing._sourceDomains.includes(a.domain)) {
          existing._sourceDomains.push(a.domain);
        }
      }
    }
  }

  // Convert to array and sort (optional)
  const courses = Array.from(seen.values()).sort((a: any, b: any) => {
    // favor course name sorting if present
    const an = (a?.name ?? "").toString().toLowerCase();
    const bn = (b?.name ?? "").toString().toLowerCase();
    return an.localeCompare(bn);
  });

  const allFailed = courses.length === 0 && failures.length > 0;

  return NextResponse.json(
    {
      ok: !allFailed,
      courses,
      failures,
      meta: {
        accountsRequested: accounts.length,
        coursesReturned: courses.length,
        failures: failures.length,
      },
    },
    { status: allFailed ? 502 : 200 },
  );
}
