/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import useSWR, { mutate } from 'swr';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types/database';

// Cache keys
export const PRODUCTS_KEY = (companyId: string) => `products-${companyId}`;

interface ProductsFilter {
  status?: 'all' | 'published' | 'draft';
  searchTerm?: string;
}

interface UseProductsOptions {
  companyId: string | undefined;
  filter?: ProductsFilter;
}

const fetchProducts = async (companyId: string, filter?: ProductsFilter): Promise<Product[]> => {
  let query = supabase
    .from('products')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (filter?.status === 'published') {
    query = query.eq('is_published', true);
  } else if (filter?.status === 'draft') {
    query = query.eq('is_published', false);
  }

  if (filter?.searchTerm) {
    query = query.ilike('name', `%${filter.searchTerm}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export function useProducts({ companyId, filter }: UseProductsOptions) {
  const key = companyId ? [PRODUCTS_KEY(companyId), filter?.status, filter?.searchTerm] : null;

  const { data, error, isLoading, isValidating, mutate: swrMutate } = useSWR(
    key,
    () => fetchProducts(companyId!, filter),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      keepPreviousData: true,
    }
  );

  return {
    products: data || [],
    isLoading,
    isValidating,
    error,
    mutate: swrMutate,
  };
}

export async function deleteProductOptimistic(companyId: string, productId: string, currentProducts: Product[]) {
  const optimisticData = currentProducts.filter((p) => p.id !== productId);

  mutate((key: unknown) => Array.isArray(key) && key[0] === PRODUCTS_KEY(companyId), optimisticData, false);

  try {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw error;
    mutate((key: unknown) => Array.isArray(key) && key[0] === PRODUCTS_KEY(companyId));
    return { success: true as const };
  } catch (error) {
    mutate((key: unknown) => Array.isArray(key) && key[0] === PRODUCTS_KEY(companyId), currentProducts, false);
    return { success: false as const, error };
  }
}

export async function togglePublishOptimistic(companyId: string, product: Product, currentProducts: Product[]) {
  const newPublishState = !product.is_published;

  const optimisticData = currentProducts.map((p) =>
    p.id === product.id ? { ...p, is_published: newPublishState } : p
  );

  mutate((key: unknown) => Array.isArray(key) && key[0] === PRODUCTS_KEY(companyId), optimisticData, false);

  try {
    const { error } = await (supabase.from('products') as any)
      .update({ is_published: newPublishState })
      .eq('id', product.id);
    if (error) throw error;
    mutate((key: unknown) => Array.isArray(key) && key[0] === PRODUCTS_KEY(companyId));
    return { success: true as const };
  } catch (error) {
    mutate((key: unknown) => Array.isArray(key) && key[0] === PRODUCTS_KEY(companyId), currentProducts, false);
    return { success: false as const, error };
  }
}

export function invalidateProductsCache(companyId: string) {
  mutate((key: unknown) => Array.isArray(key) && key[0] === PRODUCTS_KEY(companyId));
}

