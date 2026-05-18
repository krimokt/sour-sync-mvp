export default function StoreLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Page header */}
      <div className="dash-page-header">
        <div className="space-y-2">
          <div className="h-7 w-40 rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-56 rounded-lg bg-gray-100 dark:bg-gray-800" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="dash-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800" />
            </div>
            <div className="h-8 w-16 rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="dash-card p-3 flex gap-3">
        <div className="h-9 w-64 rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="h-9 w-48 rounded-lg bg-gray-100 dark:bg-gray-800" />
      </div>

      {/* Table skeleton */}
      <div className="dash-card overflow-hidden">
        <div className="dash-table-wrap">
          <table className="w-full">
            <thead className="dash-thead">
              <tr>
                {[40, 20, 15, 15, 10].map((w, i) => (
                  <th key={i} className="dash-th">
                    <div className={`h-3.5 w-${w === 40 ? '32' : w === 20 ? '20' : '16'} rounded bg-gray-200 dark:bg-gray-700`} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <tr key={i} className="dash-tr">
                  <td className="dash-td">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-28 rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800" />
                      </div>
                    </div>
                  </td>
                  <td className="dash-td"><div className="h-3.5 w-20 rounded bg-gray-100 dark:bg-gray-800" /></td>
                  <td className="dash-td"><div className="h-5 w-16 rounded-full bg-gray-100 dark:bg-gray-800" /></td>
                  <td className="dash-td"><div className="h-3.5 w-16 rounded bg-gray-100 dark:bg-gray-800" /></td>
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
