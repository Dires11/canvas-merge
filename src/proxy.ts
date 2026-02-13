// proxy.ts or middleware.ts
import { auth } from "@/lib/auth/server";
import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(pathname);
  // 1. Get the session directly from Neon Auth
  const { data: session } = await auth.getSession();

  // 2. REDIRECT AUTHENTICATED USERS: If logged in and hitting an auth page
  if (
    session &&
    pathname.startsWith("/auth") &&
    !pathname.includes("sign-out")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 3. PROTECT ROUTES: Use the standard Neon middleware for everything else
  // This will handle the loginUrl redirect for unauthenticated users
  return auth.middleware({
    loginUrl: "/auth/sign-in",
  })(request);
}

export const config = {
  matcher: ["/account/:path*", "/manage-accounts/:path*", "/auth/:path*", "/"],
};
