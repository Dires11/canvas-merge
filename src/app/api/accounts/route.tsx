// app/api/canvas/accounts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, getUserOr401 } from "@/lib/auth-server";
import { normalizeAndValidateDomain } from "@/lib/domain";
import { getAccountInfo } from "@/lib/canvas";
import {
  createCanvasAccount,
  deleteCanvasAccount,
  getUserCanvasAccounts,
} from "@/data/canvas-account"; // returns { ok, account?, message?, status? }
import type { AccountInfo } from "@/lib/types";
// import { encryptToken } from "@/lib/crypto"; // if you encrypt here
const BodySchema = z.object({
  domain: z.string().min(1, "Institution URL is required"),
  token: z.string().min(10, "Personal access token looks too short"),
});

export async function GET() {
  const { user, response } = await getUserOr401();
  if (response) return response;

  try {
    const accounts = await getUserCanvasAccounts(user.id);
    return NextResponse.json({ accounts }, { status: 200 });
  } catch (e: any) {
    console.error("Failed to load Canvas accounts:", e);
    return NextResponse.json(
      { error: "Failed to load Canvas accounts." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // 1) Auth (don’t let userId be client-provided)
  const { user, response } = await getUserOr401();
  if (response) return response;

  // 2) Parse & validate JSON
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      { error: "Content-Type must be application/json" },
      { status: 415 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    const f = z.treeifyError(parsed.error);

    const fieldErrors = {
      domain: f.properties?.domain?.errors?.[0],
      token: f.properties?.token?.errors?.[0],
    };
    const formErrors = f.errors; // top-level/global messages

    return NextResponse.json(
      { error: "Invalid input", fieldErrors, formErrors },
      { status: 400 }
    );
  }

  const { domain, token } = parsed.data;

  try {
    const normalizedDomain = normalizeAndValidateDomain(domain);

    // 4) Live-check the token against Canvas before saving
    const test = await getAccountInfo({ domain: normalizedDomain, token });
    if (!test.ok) {
      // getAccountInfo should return { ok:false, status, details }
      return NextResponse.json(
        {
          error: "Canvas authentication failed check your domain and token",
          domain: normalizedDomain,
          status: test.status,
          details: (test as any).details?.slice(0, 200),
        },
        { status: 400 }
      );
    }
    const profileInfo: AccountInfo = await test.json();

    // 5) Encrypt the token here OR inside createCanvasAccount
    // const { tokenCipher, iv, kid } = encryptToken(token);
    // TODO

    // 6) Save
    console.log("Profile info from Canvas:", profileInfo);

    const saved = await createCanvasAccount(
      user.id,
      token, // or pass tokenCipher, iv, kid if you encrypt here
      profileInfo
    );

    if (!saved.ok) {
      return NextResponse.json(
        { error: saved.message ?? "Failed to save Canvas account" },
        { status: 400 }
      );
    }

    // 7) Return minimal, non-sensitive info
    const res = NextResponse.json(
      {
        name: profileInfo.name,
        domain: normalizedDomain,
      },
      { status: 201 }
    );
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (err: any) {
    console.error("Error in POST /api/accounts:", err);
    // Centralized catch for domain validator, fetch, prisma, etc.
    const message =
      typeof err?.message === "string" && err.message.length
        ? err.message
        : "Unexpected server error";
    // For Prisma duplicate error, make sure createCanvasAccount maps to {status:400}
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { user, response } = await getUserOr401();
  if (response) return response;
  if (!req.nextUrl.searchParams.get("id")) {
    return NextResponse.json(
      { error: "Id query parameter is required" },
      { status: 400 }
    );
  }

  const result = await deleteCanvasAccount(req.nextUrl.searchParams.get("id")!);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status || 400 }
    );
  }
  return new NextResponse(null, { status: 204 });
}
