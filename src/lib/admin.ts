import "server-only";

import { auth, clerkClient, type User } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

const ADMIN_ROLE = "admin";
const USER_PAGE_SIZE = 100;

export type AdminDirectoryUser = {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  isAdmin: boolean;
};

type AdminAuthorization =
  | { status: "unauthenticated" }
  | { status: "forbidden" }
  | { status: "authorized"; user: User };

function getPrimaryEmail(user: User) {
  return (
    user.emailAddresses.find(
      (emailAddress) => emailAddress.id === user.primaryEmailAddressId,
    )?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    "No email address"
  );
}

function hasAdminRole(user: User) {
  return user.publicMetadata.role === ADMIN_ROLE;
}

function toDirectoryUser(user: User): AdminDirectoryUser {
  const email = getPrimaryEmail(user);
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return {
    id: user.id,
    name: fullName || email,
    email,
    imageUrl: user.imageUrl,
    isAdmin: hasAdminRole(user),
  };
}

export async function getAdminAuthorization(): Promise<AdminAuthorization> {
  const { userId } = await auth();

  if (!userId) {
    return { status: "unauthenticated" };
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  if (!hasAdminRole(user)) {
    return { status: "forbidden" };
  }

  return { status: "authorized", user };
}

export async function requireAdminPage() {
  const authorization = await getAdminAuthorization();

  if (authorization.status !== "authorized") {
    notFound();
  }

  return authorization.user;
}

export async function getAdminDirectoryUsers() {
  const client = await clerkClient();
  const users: User[] = [];
  let offset = 0;
  let totalCount = 0;

  do {
    const page = await client.users.getUserList({
      limit: USER_PAGE_SIZE,
      offset,
      orderBy: "email_address",
    });

    users.push(...page.data);
    totalCount = page.totalCount;
    offset += page.data.length;

    if (page.data.length === 0) {
      break;
    }
  } while (offset < totalCount);

  return users
    .map(toDirectoryUser)
    .sort((a, b) => a.email.localeCompare(b.email));
}

export async function getAdminDirectoryUser(userId: string) {
  const client = await clerkClient();
  const page = await client.users.getUserList({
    userId: [userId],
    limit: 1,
  });
  const user = page.data.find((candidate) => candidate.id === userId);

  return user ? toDirectoryUser(user) : null;
}
