import { stackServerApp } from "@/stack/server";
import { NextResponse } from "next/server";

export async function requireUser() {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }
  return user;
}

export async function getUserOr401() {
  const user = await stackServerApp.getUser();
  if (user) {
    return { user, response: null as null };
  }
  const response = NextResponse.json(
    { error: "User not authenticated" },
    { status: 401 }
  );
  return { user: null, response };
}
