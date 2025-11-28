'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types/database';
import ProductsTable from '@/components/products/ProductsTable';
import StatCard from '@/components/common/StatCard';

export default function ProductsPage() {
  const { company } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  const fetchProducts = async () => {
    if (!company) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (filterStatus === 'published') {
        query = query.eq('is_published', true);
      } else if (filterStatus === 'draft') {
        query = query.eq('is_published', false);
      }

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [company, filterStatus, searchTerm]);

  if (!company) return null;

  const publishedCount = products.filter(p => p.is_published).length;
  const draftCount = products.filter(p => !p.is_published).length;

  // Calculate mock trend data (in a real app, this would come from historical data)
  // For demonstration, we'll use static trends
  const totalTrend = { value: 12, direction: 'up' as const };
  const publishedTrend = { value: 8, direction: 'up' as const };
  const draftTrend = { value: 2, direction: 'down' as const };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your product catalog
          </p>
        </div>
        <Link
          href={`/store/${company.slug}/products/new`}
          className="inline-flex items-center px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors shadow-sm focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Products"
          value={products.length}
          trend={totalTrend}
          variant="dark"
        />
        <StatCard
          title="Published Products"
          value={publishedCount}
          trend={publishedTrend}
          variant="light"
        />
        <StatCard
          title="Draft Products"
          value={draftCount}
          trend={draftTrend}
          variant="light"
        />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="w-full sm:w-96 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 dark:bg-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm dark:border-gray-600 dark:text-white transition-colors"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filterStatus === 'all'
                ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setFilterStatus('published')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filterStatus === 'published'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            Published
          </button>
          <button
            onClick={() => setFilterStatus('draft')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filterStatus === 'draft'
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            Drafts
          </button>
        </div>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <ProductsTable
          products={products}
          companySlug={company.slug}
          onRefresh={fetchProducts}
        />
      )}
    </div>
  );
}
