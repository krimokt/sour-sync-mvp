import { supabase } from '@/lib/supabase';

export interface DashboardData {
  metrics: { pendingQuotations: number; activeShipments: number; deliveredProducts: number; totalSpend: number };
  recentQuotations: Array<{
    id: string; quotation_id: string; product_name: string; image_url: string;
    quantity: number; created_at: string; status: string; total_price_option1: string;
  }>;
  recentShipments: Array<{
    id: string; status: string; location: string; created_at: string;
    estimated_delivery: string | null; quotation: { product_name: string; shipping_country: string; shipping_city: string } | null;
  }>;
}

export async function fetchDashboard({ companyId }: { companyId: string }): Promise<DashboardData> {
  const [quotRes, shipRes, activeShipRes, paymentsRes] = await Promise.all([
    supabase.from('quotations').select('id, quotation_id, product_name, image_url, quantity, created_at, status, total_price_option1')
      .eq('company_id', companyId).eq('status', 'Pending').order('created_at', { ascending: false }).limit(5),
    supabase.from('shipping').select('id, status, location, created_at, estimated_delivery, quotation_id')
      .order('created_at', { ascending: false }).limit(5),
    supabase.from('shipping').select('*', { count: 'exact', head: true }).eq('status', 'In Transit'),
    supabase.from('payments').select('total_amount').eq('status', 'Approved'),
  ]);

  // Get quotation IDs from recent shipments for enrichment
  type RawShip = { id: string; status: string; location: string | null; created_at: string; estimated_delivery: string | null; quotation_id: string | null };
  const shipRows = (shipRes.data ?? []) as unknown as RawShip[];
  const quotIds = [...new Set(shipRows.map(r => r.quotation_id).filter(Boolean))] as string[];
  const quotMap: Record<string, { product_name: string; shipping_country: string; shipping_city: string }> = {};
  if (quotIds.length > 0) {
    const { data } = await supabase.from('quotations').select('id, product_name, shipping_country, shipping_city').in('id', quotIds);
    (data ?? []).forEach((q: { id: string; product_name: string; shipping_country: string; shipping_city: string }) => { quotMap[q.id] = q; });
  }

  const totalSpend = (paymentsRes.data ?? []).reduce((sum, p) => {
    const v = (p as { total_amount: number | string }).total_amount;
    return sum + (typeof v === 'number' ? v : parseFloat(String(v)) || 0);
  }, 0);

  type RawQuot = { id: string; quotation_id: string; product_name: string; image_url: string; quantity: number; created_at: string; status: string; total_price_option1: string };

  return {
    metrics: {
      pendingQuotations: (quotRes.data?.length ?? 0),
      activeShipments: activeShipRes.count ?? 0,
      deliveredProducts: 0,
      totalSpend,
    },
    recentQuotations: (quotRes.data ?? []) as unknown as RawQuot[],
    recentShipments: shipRows.map(r => ({
      ...r,
      location: r.location ?? '',
      quotation: r.quotation_id ? (quotMap[r.quotation_id] ?? null) : null,
    })),
  };
}
