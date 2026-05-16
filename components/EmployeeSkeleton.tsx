export default function EmployeeSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-slate-700 flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="h-3 bg-gray-100 dark:bg-slate-600 rounded w-full" />
          <div className="h-3 bg-gray-100 dark:bg-slate-600 rounded w-1/2" />
        </div>
      </div>
      <div className="mt-3 h-5 bg-gray-100 dark:bg-slate-600 rounded-full w-1/3" />
    </div>
  )
}

export function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <EmployeeSkeleton key={i} />
      ))}
    </div>
  )
}
