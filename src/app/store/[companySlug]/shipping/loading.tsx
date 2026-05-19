export default function ShippingLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-7 w-36 rounded-lg bg-gray-200 dark:bg-gray-700" />

      {/* 4 stat cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="dash-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800" />
            </div>
            <div className="h-8 w-16 rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-24 rounded-lg bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 overflow-hidden">
        <table className="w-full">
          <thead className="dash-thead">
            <tr>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <th key={i} className="dash-th">
                  <div className="h-3.5 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <tr key={i} className="dash-tr">
                <td className="dash-td"><div className="h-3.5 w-28 rounded bg-gray-200 dark:bg-gray-700" /></td>
                <td className="dash-td">
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800" />
                  </div>
                </td>
                <td className="dash-td"><div className="h-3.5 w-16 rounded bg-gray-100 dark:bg-gray-800" /></td>
                <td className="dash-td"><div className="h-5 w-20 rounded-full bg-gray-100 dark:bg-gray-800" /></td>
                <td className="dash-td"><div className="h-3.5 w-20 rounded bg-gray-100 dark:bg-gray-800" /></td>
                <td className="dash-td"><div className="h-3.5 w-20 rounded bg-gray-100 dark:bg-gray-800" /></td>
                <td className="dash-td">
                  <div className="flex gap-2">
                    <div className="h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-800" />
                    <div className="h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-800" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
