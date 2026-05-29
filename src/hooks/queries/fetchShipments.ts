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

const SHIPMENT_COLUMNS = `
  id, user_id, quotation_id, status, location, created_at,
  delivered_at, estimated_delivery, videos_urls, images_urls,
  receiver_name, receiver_phone, receiver_address,
  quotation:quotations(id, quotation_id, product_name, image_url, shipping_country, shipping_city, shipping_method),
  user:profiles(full_name, email)
`;

export async function fetchShipments({
  companyId,
  limit = 50,
  offset = 0,
}: { companyId: string; limit?: number; offset?: number }): Promise<ShipmentRow[]> {
  const { data, error } = await supabase
    .from('shipping')
    .select(SHIPMENT_COLUMNS)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  if (!data || data.length === 0) return [];

  return (data as unknown as ShipmentRow[]).map(r => ({
    ...r,
    quotation: r.quotation ?? null,
    user: r.user ?? null,
  }));
}
