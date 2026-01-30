// ./lib/auth/client.ts
"use client";
import { createAuthClient } from "@neondatabase/auth/next";
// to use in react client components
export const authClient = createAuthClient();
export const { useSession } = authClient;
