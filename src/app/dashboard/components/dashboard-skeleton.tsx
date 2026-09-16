import { BookMarked, CheckCircle2, ClipboardList, Megaphone } from "lucide-react";
import { AssignmentDashboardSkeleton } from "./assignment-dashboard-skeleton";
import { GlassContainer } from "@/components/glass-container";

const tabs = [
  { label: "Courses", icon: BookMarked },
  { label: "Assignments", icon: ClipboardList },
  { label: "Completed", icon: CheckCircle2 },
  { label: "Announcements", icon: Megaphone },
];

export function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading dashboard">
      <span className="sr-only">Loading dashboard</span>
      <div aria-hidden="true" className="mx-auto min-h-screen p-4 pb-[calc(env(safe-area-inset-bottom)+6rem)] md:max-w-6xl md:px-6 md:py-4 lg:px-8">
        <GlassContainer className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-40 mx-auto max-w-xl p-1.5 md:static md:mb-4 md:max-w-none md:p-0">
          <div className="scrollbar-hide flex h-9 items-center gap-1 overflow-x-auto md:w-full md:gap-0">
            {tabs.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className={`flex h-9 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-sm md:flex-1 ${label === "Assignments" ? "bg-glass/20 text-foreground" : "text-muted-foreground"}`}
              >
                <Icon className="size-4" />
                {label}
              </div>
            ))}
          </div>
        </GlassContainer>
        <AssignmentDashboardSkeleton />
      </div>
    </div>
  );
}
