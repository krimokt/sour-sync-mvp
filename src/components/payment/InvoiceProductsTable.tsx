import type { ReactElement } from 'react';

export function InvoiceProductsTable({
  items,
  currency,
}: {
  items: Array<{ product_name: string; quantity: number; unit_price: number; total_price: number }>;
  currency: string;
  primaryColor?: string;
}): ReactElement {
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '12px', border: '1px dashed #e5e7eb', borderRadius: '6px', marginBottom: '24px' }}>
        No items in this invoice
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden', marginBottom: '24px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb' }}>
            <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '9px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e5e7eb', width: '45%' }}>Item</th>
            <th style={{ padding: '10px 10px', textAlign: 'center', fontSize: '9px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e5e7eb', width: '15%' }}>Qty</th>
            <th style={{ padding: '10px 10px', textAlign: 'right', fontSize: '9px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e5e7eb', width: '20%' }}>Unit Price</th>
            <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: '9px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e5e7eb', width: '20%' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} style={{ backgroundColor: '#ffffff' }}>
              <td style={{ padding: '11px 14px', fontSize: '11px', color: '#111827', fontWeight: '500', borderBottom: index < items.length - 1 ? '1px solid #f3f4f6' : 'none' }}>{item.product_name}</td>
              <td style={{ padding: '11px 10px', fontSize: '11px', color: '#374151', textAlign: 'center', borderBottom: index < items.length - 1 ? '1px solid #f3f4f6' : 'none' }}>{item.quantity}</td>
              <td style={{ padding: '11px 10px', fontSize: '11px', color: '#374151', textAlign: 'right', borderBottom: index < items.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                {currency} {item.unit_price.toFixed(2)}
              </td>
              <td style={{ padding: '11px 14px', fontSize: '11px', color: '#111827', fontWeight: '600', textAlign: 'right', borderBottom: index < items.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                {currency} {item.total_price.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
