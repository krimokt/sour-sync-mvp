export default function ClientLoading() {
  return (
    <div className="space-y-6 animate-pulse" style={{ fontFamily: 'var(--font-jakarta, system-ui, sans-serif)' }}>
      {/* Page heading */}
      <div className="space-y-2">
        <div className="h-7 w-36 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-52 rounded-lg bg-gray-100 dark:bg-gray-800" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-3">
            <div className="h-4 w-20 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-7 w-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>

      {/* Card list / table */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-8 w-24 rounded-lg bg-gray-100 dark:bg-gray-800" />
        </div>
        {/* Rows */}
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0"
          >
            <div className="h-9 w-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="h-3.5 w-44 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-28 rounded bg-gray-100 dark:bg-gray-800" />
            </div>
            <div className="h-5 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex-shrink-0" />
            <div className="h-4 w-20 rounded bg-gray-100 dark:bg-gray-800 flex-shrink-0 hidden sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
