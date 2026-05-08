export function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
      <div className="aspect-video animate-pulse bg-zinc-200 dark:bg-zinc-800" />
      <div className="px-3 py-2.5 space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  )
}
