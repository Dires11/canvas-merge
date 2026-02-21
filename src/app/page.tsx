import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  return (
    <main className="text-foreground mx-auto min-h-screen max-w-7xl p-6">
      <h1 className="text-lg font-semibold">
        Welcome to CanvasMerge! This homepage is not finished yet.
      </h1>

      <p className="mt-2 text-lg font-semibold">
        Go to{" "}
        <Link href="/dashboard" className="text-primary">
          Dashboard
        </Link>{" "}
        to see your courses!
      </p>

      <p className="mt-10">
        If you are not signed in, please sign in to continue.
      </p>
      <Button className="mt-4" variant="outline">
        <Link href="/auth/sign-in">Sign In</Link>
      </Button>
    </main>
  );
}
