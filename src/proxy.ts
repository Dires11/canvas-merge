// src/proxy.ts
import { auth } from "@/lib/auth/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 Proxy Function
 * Runs on Node.js only. Used for authentication checks and redirects.
 */

export default async function proxy(request: NextRequest) {
  // const { pathname } = request.nextUrl;

  // 1. Ensure dynamic context by calling headers()
  // This helps auth.getSession() retrieve the __Secure-neon-auth.session_token
  // const { data: session } = await auth.getSession();

  // console.log("SESSION:", session);
  // console.log("PATHNAME:", pathname);

  // // 2. REDIRECT AUTHENTICATED USERS: If logged in and hitting an auth page
  // if (
  //   session &&
  //   pathname.startsWith("/auth") &&
  //   !pathname.includes("sign-out")
  // ) {
  //   return NextResponse.redirect(new URL("/", request.url));
  // }

  // 3. PROTECT ROUTES: Call the standard Neon middleware for protected paths
  return auth.middleware({
    loginUrl: "/auth/sign-in",
  })(request);
}

export const config = {
  matcher: ["/account/:path*", "/manage-accounts/:path*", "/"],
};
