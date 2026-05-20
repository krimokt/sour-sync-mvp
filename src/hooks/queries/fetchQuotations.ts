import { supabase } from '@/lib/supabase';

export const ITEMS_PER_PAGE = 10;

export interface QuotationRow {
  id: string;
  user_id: string;
  company_id?: string;
  quotation_id?: string;
  product_name?: string;
  image_url?: string;
  product_description?: string;
  quantity?: number;
  created_at: string;
  status?: string;
  total_price_option1?: string | number;
  shipping_method?: string;
  shipping_city?: string;
  shipping_country?: string;
  Quotation_fees?: number | null;
  service_type?: string;
  title_option1?: string;
  image_option1?: string;
  price_description_option1?: string;
  delivery_time_option1?: string;
  description_option1?: string;
  total_price_option2?: string;
  title_option2?: string;
  image_option2?: string;
  price_description_option2?: string;
  delivery_time_option2?: string;
  description_option2?: string;
  title_option3?: string;
  total_price_option3?: string;
  image_option3?: string;
  price_description_option3?: string;
  delivery_time_option3?: string;
  description_option3?: string;
  selected_option?: number;
  variant_groups?: unknown;
  profiles?: {
    id?: string;
    email?: string;
    full_name?: string;
    role?: string;
    phone?: string;
    country?: string;
  };
}

export interface QuotationsResult {
  rows: QuotationRow[];
  total: number;
  totalPages: number;
  metrics: { total: number; approved: number; pending: number; rejected: number };
}

export async function fetchQuotations({
  companyId,
  page = 1,
  status = 'All',
  search = '',
}: {
  companyId: string;
  page?: number;
  status?: string;
  search?: string;
}): Promise<QuotationsResult> {
  let query = supabase
    .from('quotations')
    .select('*, profiles(id, email, full_name, phone, country, role)', { count: 'exact' })
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (status !== 'All') query = query.eq('status', status);
  if (search) query = query.or(`product_name.ilike.%${search}%,quotation_id.ilike.%${search}%`);

  const from = (page - 1) * ITEMS_PER_PAGE;
  query = query.range(from, from + ITEMS_PER_PAGE - 1);

  const [
    rowsResult,
    { count: totalCount },
    { count: approvedCount },
    { count: pendingCount },
    { count: rejectedCount },
  ] = await Promise.all([
    query,
    supabase.from('quotations').select('*', { count: 'exact', head: true }).eq('company_id', companyId),
    supabase.from('quotations').select('*', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'Approved'),
    supabase.from('quotations').select('*', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'Pending'),
    supabase.from('quotations').select('*', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'Rejected'),
  ]);

  if (rowsResult.error) throw rowsResult.error;

  const total = totalCount ?? 0;
  return {
    rows: (rowsResult.data ?? []) as QuotationRow[],
    total,
    totalPages: Math.ceil((rowsResult.count ?? total) / ITEMS_PER_PAGE),
    metrics: {
      total,
      approved: approvedCount ?? 0,
      pending: pendingCount ?? 0,
      rejected: rejectedCount ?? 0,
    },
  };
}
