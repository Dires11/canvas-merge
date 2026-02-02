// proxy.ts
import { auth } from "@/lib/auth/server";
export default auth.middleware({
  loginUrl: "/auth/sign-in",
});

export const config = {
  matcher: [
    // Protected routes requiring authentication
    "/account/:path*",
    "/manage-accounts/:path*",
    "/",
  ],
};
