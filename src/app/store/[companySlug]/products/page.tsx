'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Loader2, Package, Eye, FileEdit } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useProducts } from '@/hooks/useProducts';
import { useDebounce } from '@/hooks/useDebounce';
import ProductsTable from '@/components/products/ProductsTable';
import StatCard from '@/components/common/StatCard';
import { Button } from '@/components/ui/button';

export default function ProductsPage() {
  const { company } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  
  // Debounce search term to avoid API calls on every keystroke
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Use SWR hook for data fetching with caching
  const { products, isLoading, isValidating, mutate } = useProducts({
    companyId: company?.id,
    filter: {
      status: filterStatus,
      searchTerm: debouncedSearchTerm,
    },
  });

  if (!company) return null;

  const publishedCount = products.filter(p => p.is_published).length;
  const draftCount = products.filter(p => !p.is_published).length;


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Products</h1>
          <p className="dash-page-subtitle">Manage your product catalog</p>
        </div>
        <Button asChild variant="primary" size="lg">
          <Link href={`/store/${company.slug}/products/new`}>
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Products"
          value={products.length}
          variant="dark"
          icon={<Package className="w-5 h-5" />}
        />
        <StatCard
          title="Published"
          value={publishedCount}
          icon={<Eye className="w-5 h-5 text-green-500" />}
        />
        <StatCard
          title="Drafts"
          value={draftCount}
          icon={<FileEdit className="w-5 h-5 text-amber-500" />}
        />
      </div>

      {/* Filters and Search */}
      <div className="dash-card flex flex-col sm:flex-row gap-3 items-center justify-between p-3">
        <div className="w-full sm:w-80 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dash-search"
          />
          {isValidating && !isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin pointer-events-none" />
          )}
        </div>
        <div className="dash-filter-bar">
          <button
            onClick={() => setFilterStatus('all')}
            className={`dash-filter-tab ${filterStatus === 'all' ? 'dash-filter-tab-active' : ''}`}
          >
            All Products
          </button>
          <button
            onClick={() => setFilterStatus('published')}
            className={`dash-filter-tab ${filterStatus === 'published' ? 'dash-filter-tab-active' : ''}`}
          >
            Published
          </button>
          <button
            onClick={() => setFilterStatus('draft')}
            className={`dash-filter-tab ${filterStatus === 'draft' ? 'dash-filter-tab-active' : ''}`}
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
          companyId={company.id}
          onRefresh={() => mutate()}
        />
      )}
    </div>
  );
}
