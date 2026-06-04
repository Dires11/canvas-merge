import { Skeleton } from "@/components/ui/skeleton";

export default function ManageAccountsLoading() {
  return (
    <div className="min-h-screen text-black dark:text-white">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <main className="space-y-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-8 w-48 sm:h-6 sm:w-36" />
            <Skeleton className="h-9 w-full rounded-md sm:w-36" />
          </div>

          <div className="glass-border bg-glass/5 space-y-4 rounded-2xl p-3 shadow-sm backdrop-blur-lg sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-64 max-w-full" />
              </div>

              <div className="relative w-full sm:max-w-sm">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="absolute top-1/2 left-3 size-4 -translate-y-1/2 rounded-full" />
              </div>
            </div>

            <ul className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <li
                  key={i}
                  className="glass-border bg-glass/5 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-3 rounded-2xl p-3 shadow-sm sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-4 sm:p-5"
                >
                  <Skeleton className="row-span-2 size-10 shrink-0 self-center rounded-full border border-white/20 bg-white/10 dark:border-white/10 sm:row-span-1 sm:size-12" />

                  <div className="min-w-0 space-y-2">
                    <Skeleton className="h-5 w-44 max-w-full" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-56 max-w-full" />
                  </div>

                  <div className="col-start-2 flex shrink-0 items-center justify-start gap-2 sm:col-start-auto sm:justify-end">
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
