import type { ReactElement } from 'react';

export function InvoiceProductsTable({
  items,
  currency,
}: {
  items: Array<{ product_name: string; quantity: number; unit_price: number; total_price: number }>;
  currency: string;
}): ReactElement {
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
        <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">No items in this invoice</p>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-3">
      <table className="w-full" style={{ fontSize: '11px', borderCollapse: 'collapse' }}>
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700/50">
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700"
              style={{ width: '45%' }}
            >
              PRODUCT
            </th>
            <th
              className="px-3 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700"
              style={{ width: '15%' }}
            >
              QUANTITY
            </th>
            <th
              className="px-3 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700"
              style={{ width: '20%' }}
            >
              UNIT PRICE
            </th>
            <th
              className="px-3 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700"
              style={{ width: '20%' }}
            >
              TOTAL
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {items.map((item, index) => (
            <tr key={index}>
              <td className="px-4 py-3 text-xs text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800">
                {item.product_name}
              </td>
              <td className="px-3 py-3 text-xs text-center text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                {item.quantity}
              </td>
              <td className="px-3 py-3 text-xs text-right text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                {currency} {item.unit_price.toFixed(2)}
              </td>
              <td className="px-3 py-3 text-xs text-right font-medium text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800">
                {currency} {item.total_price.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}






