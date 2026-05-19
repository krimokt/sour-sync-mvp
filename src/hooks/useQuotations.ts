'use client';

import useSWR, { mutate } from 'swr';
import { supabase } from '@/lib/supabase';
import { VariantGroup } from '@/types/database';

// Cache keys
export const QUOTATIONS_KEY = (companyId: string) => `quotations-${companyId}`;

const ITEMS_PER_PAGE = 10;

export interface QuotationData {
  id: string;
  quotation_id: string;
  product_name: string;
  product_url?: string;
  quantity: number;
  status: string;
  created_at: string;
  destination_country: string;
  destination_city: string;
  shipping_method: string;
  service_type: string;
  image_url?: string;
  product_images?: string[];
  variant_specs?: string;
  notes?: string;
  total_price_option1?: string;
  user_id?: string;
  variant_groups?: VariantGroup[];
}

export interface QuotationMetrics {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

interface QuotationsFilter {
  status?: 'All' | 'Pending' | 'Approved' | 'Rejected';
  searchQuery?: string;
  page?: number;
}

interface QuotationsResult {
  quotations: QuotationData[];
  metrics: QuotationMetrics;
  totalPages: number;
}

interface UseQuotationsOptions {
  companyId: string | undefined;
  filter?: QuotationsFilter;
}

// Fetcher function for quotations
const fetchQuotations = async (
  companyId: string,
  filter?: QuotationsFilter
): Promise<QuotationsResult> => {
  const page = filter?.page || 1;
  
  // Build main query
  let query = supabase
    .from('quotations')
    .select('*', { count: 'exact' })
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  // Apply status filter
  if (filter?.status && filter.status !== 'All') {
    query = query.eq('status', filter.status);
  }

  // Apply search filter
  if (filter?.searchQuery) {
    query = query.or(`product_name.ilike.%${filter.searchQuery}%,quotation_id.ilike.%${filter.searchQuery}%`);
  }

  // Apply pagination
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  query = query.range(from, to);

  const [{ data, error, count }, { data: metricsData }] = await Promise.all([
    query,
    supabase.from('quotations').select('status').eq('company_id', companyId),
  ]);

  if (error) throw error;

  const metrics: QuotationMetrics = {
    total: metricsData?.length || 0,
    approved: metricsData?.filter((q: { status?: string | null }) => q.status === 'Approved').length || 0,
    pending: metricsData?.filter((q: { status?: string | null }) => q.status === 'Pending').length || 0,
    rejected: metricsData?.filter((q: { status?: string | null }) => q.status === 'Rejected').length || 0,
  };

  return {
    quotations: data || [],
    metrics,
    totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
  };
};

// Main hook for fetching quotations with SWR
export function useQuotations({ companyId, filter }: UseQuotationsOptions) {
  const key = companyId
    ? [QUOTATIONS_KEY(companyId), filter?.status, filter?.searchQuery, filter?.page]
    : null;

  const { data, error, isLoading, isValidating, mutate: swrMutate } = useSWR(
    key,
    () => fetchQuotations(companyId!, filter),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      keepPreviousData: true,
    }
  );

  return {
    quotations: data?.quotations || [],
    metrics: data?.metrics || { total: 0, approved: 0, pending: 0, rejected: 0 },
    totalPages: data?.totalPages || 1,
    isLoading,
    isValidating,
    error,
    mutate: swrMutate,
  };
}

// Invalidate quotations cache
export function invalidateQuotationsCache(companyId: string) {
  mutate((key: unknown) => Array.isArray(key) && key[0] === QUOTATIONS_KEY(companyId));
}

