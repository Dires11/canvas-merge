// src/proxy.ts
import { auth } from "@/lib/auth/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 Proxy Function
 * Runs on Node.js only. Used for authentication checks and redirects.
 */

export default async function proxy(request: NextRequest) {
  // ✅ 1) Bypass Next.js Server Actions (critical)
  if (request.headers.has("next-action")) {
    return NextResponse.next();
  }

  // ✅ 2) Bypass Next internals (safe)
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  return auth.middleware({
    loginUrl: "/auth/sign-in",
  })(request);
}

export const config = {
  matcher: ["/account/:path*", "/manage-accounts/:path*", "/dashboard/:path*"],
};
