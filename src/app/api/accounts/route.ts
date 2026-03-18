// app/api/accounts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUserApi } from "@/lib/auth-server";
import { getAccountInfo } from "@/lib/canvas";
import {
  createCanvasAccount,
  getUserCanvasAccounts,
} from "@/data/canvas-account";
import { encryptToken } from "@/lib/crypto";
import { AddSchema, DomainSchema } from "@/lib/schemas/manage-accounts";
import { generateUrlSlug } from "@/lib/generate-slug";

type ValidateResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: NextResponse };

export async function validateJson<T>(
  req: NextRequest,
  schema: z.ZodType<T>,
): Promise<ValidateResult<T>> {
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415 },
      ),
    };
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      ),
    };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error);
    console.warn("Validation failed:", flat);
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Invalid input",
          formErrors: flat.formErrors,
          fieldErrors: flat.fieldErrors,
        },
        { status: 400 },
      ),
    };
  }
  return { ok: true, data: parsed.data };
}

export async function GET() {
  const user = await requireUserApi();
  try {
    const accounts = await getUserCanvasAccounts(user.id);
    return NextResponse.json({ accounts }, { status: 200 });
  } catch (e: any) {
    console.error("Failed to load Canvas accounts:", e);
    return NextResponse.json(
      { error: "Failed to load Canvas accounts." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  // 1) Auth (don’t let userId be client-provided)
  const user = await requireUserApi();

  // 2) Validating the body.
  const result = await validateJson(req, AddSchema);

  if (!result.ok) {
    return result.response;
  }

  let { domain, token, domainName } = result.data;

  // 4) Test the connection with CANVAS API
  const testConnection = await getAccountInfo({ domain, token });
  if (!testConnection.ok) {
    console.error("Connection test failed:", testConnection);
    return NextResponse.json(
      {
        error: testConnection.error.message ?? "Failed to connect to Canvas",
        expiredAt: testConnection.error.expiredAt,
      },
      { status: testConnection.status },
    );
  }
  const profileInfo = testConnection.data;

  // 5) Ecrypt the token
  const encryptedToken = encryptToken(token);

  // 4) Get the domain slug
  const domainSlug = generateUrlSlug(domain);

  // 6) Add to the database
  const saved = await createCanvasAccount(
    user.id,
    encryptedToken,
    profileInfo,
    domainName,
    domainSlug,
  );

  if (!saved.ok) {
    return NextResponse.json(
      { error: saved.message ?? "Failed to save Canvas account" },
      { status: 400 },
    );
  }

  // 5) Return minimal, non-sensitive info
  const res = NextResponse.json(
    {
      name: profileInfo.name,
      domain: domain,
    },
    { status: 201 },
  );
  res.headers.set("Cache-Control", "no-store");
  return res;
}
