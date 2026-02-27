import type { ReactElement } from 'react';

export function InvoiceProductsTable({
  items,
  currency,
  primaryColor,
}: {
  items: Array<{ product_name: string; quantity: number; unit_price: number; total_price: number }>;
  currency: string;
  primaryColor?: string;
}): ReactElement {
  const brand = primaryColor || '#7c3aed';

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '12px', border: '1px dashed #e5e7eb', borderRadius: '8px', marginBottom: '24px' }}>
        No items in this invoice
      </div>
    );
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
      <thead>
        <tr style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
          <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '9px', fontWeight: '700', color: brand, textTransform: 'uppercase', letterSpacing: '1px', width: '45%' }}>Product</th>
          <th style={{ padding: '10px 10px', textAlign: 'center', fontSize: '9px', fontWeight: '700', color: brand, textTransform: 'uppercase', letterSpacing: '1px', width: '15%' }}>Qty</th>
          <th style={{ padding: '10px 10px', textAlign: 'right', fontSize: '9px', fontWeight: '700', color: brand, textTransform: 'uppercase', letterSpacing: '1px', width: '20%' }}>Unit Price</th>
          <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: '9px', fontWeight: '700', color: brand, textTransform: 'uppercase', letterSpacing: '1px', width: '20%' }}>Total</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={index} style={{ background: index % 2 === 0 ? '#ffffff' : '#f8f7ff' }}>
            <td style={{ padding: '11px 14px', fontSize: '11px', color: '#1f2937', fontWeight: '500', borderBottom: '1px solid #e9e7fd' }}>{item.product_name}</td>
            <td style={{ padding: '11px 10px', fontSize: '11px', color: '#6b7280', textAlign: 'center', borderBottom: '1px solid #e9e7fd' }}>{item.quantity}</td>
            <td style={{ padding: '11px 10px', fontSize: '11px', color: '#6b7280', textAlign: 'right', borderBottom: '1px solid #e9e7fd' }}>
              {currency} {item.unit_price.toFixed(2)}
            </td>
            <td style={{ padding: '11px 14px', fontSize: '11px', color: '#1f2937', fontWeight: '600', textAlign: 'right', borderBottom: '1px solid #e9e7fd' }}>
              {currency} {item.total_price.toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
