import { Skeleton } from "@/components/ui/skeleton";

export default function ManageAccountsLoading() {
  return (
    <div className="min-h-screen text-black dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <main className="space-y-5">
          <div className="mb-5 flex items-center justify-between">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-9 w-36 rounded-md" />
          </div>

          <div className="glass-border rounded-2xl p-4">
            <ul className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <li
                  key={i}
                  className="glass-border bg-glass/5 flex items-center justify-between gap-4 rounded-2xl p-5 shadow-sm"
                >
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <div className="flex items-end gap-2">
                    <Skeleton className="h-7 w-16 rounded-full" />
                    <Skeleton className="h-7 w-16 rounded-full" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
