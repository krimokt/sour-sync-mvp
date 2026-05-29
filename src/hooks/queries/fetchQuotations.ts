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
  // Explicit list columns — never pull the heavy JSON image fields here.
  const LIST_COLUMNS =
    'id, quotation_id, user_id, company_id, product_name, product_url, quantity, ' +
    'status, created_at, image_url, shipping_method, service_type, shipping_country, ' +
    'shipping_city, title_option1, total_price_option1, title_option2, ' +
    'total_price_option2, title_option3, total_price_option3, selected_option, ' +
    'Quotation_fees, client_label, rejection_reason, ' +
    'profiles(id, email, full_name, phone, country, role)';

  let query = supabase
    .from('quotations')
    .select(LIST_COLUMNS, { count: 'exact' })
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (status !== 'All') query = query.eq('status', status);
  if (search) query = query.or(`product_name.ilike.%${search}%,quotation_id.ilike.%${search}%`);

  const from = (page - 1) * ITEMS_PER_PAGE;
  query = query.range(from, from + ITEMS_PER_PAGE - 1);

  // Single scan of `status` column for all metrics — replaces 4 separate COUNT queries.
  const [rowsResult, statusesResult] = await Promise.all([
    query,
    supabase.from('quotations').select('status').eq('company_id', companyId),
  ]);

  if (rowsResult.error) throw rowsResult.error;

  const statuses = (statusesResult.data ?? []) as Array<{ status?: string }>;
  let approved = 0, pending = 0, rejected = 0;
  for (const s of statuses) {
    if (s.status === 'Approved') approved++;
    else if (s.status === 'Pending') pending++;
    else if (s.status === 'Rejected') rejected++;
  }
  const total = statuses.length;

  return {
    rows: (rowsResult.data ?? []) as QuotationRow[],
    total,
    totalPages: Math.ceil((rowsResult.count ?? total) / ITEMS_PER_PAGE),
    metrics: { total, approved, pending, rejected },
  };
}
