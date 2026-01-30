import { neonAuthMiddleware } from "@neondatabase/auth/next/server";

export default neonAuthMiddleware({
  // Redirects unauthenticated users to sign-in page
  loginUrl: "/auth/sign-in",
});

export const config = {
  matcher: [
    // Protected routes requiring authentication
    // Do not run the middleware for the static resources
    "/((?!auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
