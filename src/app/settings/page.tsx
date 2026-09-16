import { redirect } from "next/navigation";

// Keep existing bookmarks working after moving settings into the navbar dialog.
export default function SettingsPage() {
  redirect("/dashboard");
}
