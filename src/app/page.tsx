import { redirect } from "next/navigation";

export default async function Home() {
  redirect("/dashboard");
  // TODO: add a landing page
}
