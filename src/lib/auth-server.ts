import { neonAuth } from "@neondatabase/auth/next/server";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import "server-only";

export async function requireUser() {
  const { user } = await neonAuth();
  if (!user) {
    redirect("/sign-in");
  }

  return user; // guaranteed non-null
}
export async function requireUserApi() {
  const { user } = await neonAuth();

  if (!user) {
    throw NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 },
    );
  }
  return user;
}
