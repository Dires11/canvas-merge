import { auth } from "@/lib/auth/server";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import "server-only";

export async function requireUser() {
  const { data: session } = await auth.getSession();
  if (!session) {
    redirect("/auth/sign-in");
  }

  return session.user; // guaranteed non-null
}
export async function requireUserApi() {
  const { data: session } = await auth.getSession();

  if (!session) {
    throw NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 },
    );
  }
  return session.user;
}

export async function requireUserAction() {
  const { data: session } = await auth.getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user;
}
