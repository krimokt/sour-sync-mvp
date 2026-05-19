export default function QuotationsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="dash-page-header">
        <div className="space-y-2">
          <div className="h-7 w-36 rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-52 rounded-lg bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="dash-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800" />
            </div>
            <div className="h-8 w-14 rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="dash-card p-3 flex gap-3">
        <div className="h-9 w-64 rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-20 rounded-lg bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      </div>

      {/* Table skeleton */}
      <div className="dash-card overflow-hidden">
        <div className="dash-table-wrap">
          <table className="w-full">
            <thead className="dash-thead">
              <tr>
                {[28, 20, 16, 16, 12, 8].map((w, i) => (
                  <th key={i} className="dash-th">
                    <div className="h-3.5 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <tr key={i} className="dash-tr">
                  <td className="dash-td">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800" />
                      </div>
                    </div>
                  </td>
                  <td className="dash-td"><div className="h-3.5 w-16 rounded bg-gray-100 dark:bg-gray-800" /></td>
                  <td className="dash-td"><div className="h-5 w-18 rounded-full bg-gray-100 dark:bg-gray-800" /></td>
                  <td className="dash-td"><div className="h-3.5 w-14 rounded bg-gray-100 dark:bg-gray-800" /></td>
                  <td className="dash-td"><div className="h-3.5 w-20 rounded bg-gray-100 dark:bg-gray-800" /></td>
                  <td className="dash-td"><div className="h-7 w-7 rounded-lg bg-gray-100 dark:bg-gray-800" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
