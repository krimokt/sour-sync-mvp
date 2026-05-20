import { supabase } from '@/lib/supabase';

export interface ShipmentRow {
  id: string;
  user_id: string | null;
  quotation_id: string | null;
  status: string | null;
  location: string | null;
  created_at: string;
  delivered_at: string | null;
  estimated_delivery: string | null;
  videos_urls: string[] | null;
  images_urls: string[] | null;
  receiver_name?: string | null;
  receiver_phone?: string | null;
  receiver_address?: string | null;
  quotation?: {
    id: string;
    quotation_id: string;
    product_name: string;
    image_url: string;
    shipping_country: string;
    shipping_city: string;
    shipping_method: string;
  } | null;
  user?: { full_name: string; email: string } | null;
}

export async function fetchShipments(): Promise<ShipmentRow[]> {
  const { data: allShipments, error } = await supabase
    .from('shipping')
    .select('*')
    .order('created_at', { ascending: false })
    .range(0, 199);

  if (error) throw error;
  if (!allShipments || allShipments.length === 0) return [];

  type RawRow = {
    id: string; user_id: string | null; quotation_id: string | null; status: string | null;
    location: string | null; created_at: string; delivered_at: string | null;
    estimated_delivery: string | null; videos_urls: string[] | null; images_urls: string[] | null;
    receiver_name?: string | null; receiver_phone?: string | null; receiver_address?: string | null;
  };

  const rows = allShipments as unknown as RawRow[];
  const userIds = [...new Set(rows.map(r => r.user_id).filter((x): x is string => x != null))];
  const quotationIds = [...new Set(rows.map(r => r.quotation_id).filter((x): x is string => x != null))];

  const [profilesResult, quotationsResult] = await Promise.all([
    userIds.length > 0
      ? supabase.from('profiles').select('id, full_name, email').in('id', userIds)
      : Promise.resolve({ data: [] as Array<{ id: string; full_name: string; email: string }>, error: null }),
    quotationIds.length > 0
      ? supabase.from('quotations').select('id, quotation_id, product_name, image_url, shipping_country, shipping_city, shipping_method').in('id', quotationIds)
      : Promise.resolve({ data: [] as ShipmentRow['quotation'][], error: null }),
  ]);

  const usersMap: Record<string, { full_name: string; email: string }> = {};
  (profilesResult.data ?? []).forEach((u: { id: string; full_name: string; email: string }) => { usersMap[u.id] = u; });

  const quotationsMap: Record<string, ShipmentRow['quotation']> = {};
  (quotationsResult.data ?? []).forEach((q) => {
    if (q && 'id' in q) quotationsMap[(q as { id: string }).id] = q as ShipmentRow['quotation'];
  });

  return rows.map(r => ({
    ...r,
    quotation: r.quotation_id ? (quotationsMap[r.quotation_id] ?? null) : null,
    user: r.user_id ? (usersMap[r.user_id] ?? null) : null,
  }));
}
