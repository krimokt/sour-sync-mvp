'use client';

import { useState } from 'react';
import Link from 'next/link';
import TableThumbnail from '@/components/common/TableThumbnail';
import { Eye, EyeOff, Pencil, Trash2, Loader2, Plus } from 'lucide-react';
import { Product } from '@/types/database';
import { deleteProductOptimistic, togglePublishOptimistic } from '@/hooks/useProducts';

interface ProductsTableProps {
  products: Product[];
  companySlug: string;
  companyId?: string;
  onRefresh?: () => void;
  isReadOnly?: boolean;
}

export default function ProductsTable({ 
  products, 
  companySlug, 
  companyId,
  onRefresh, 
  isReadOnly = false 
}: ProductsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    if (!companyId) {
      // Fallback to non-optimistic delete
      onRefresh?.();
      return;
    }
    
    setDeletingId(productId);
    try {
      const result = await deleteProductOptimistic(companyId, productId, products);
      if (!result.success) {
        console.error('Error deleting product:', result.error);
        alert('Failed to delete product');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (product: Product) => {
    if (!companyId) {
      // Fallback to non-optimistic update
      onRefresh?.();
      return;
    }

    setTogglingId(product.id);
    try {
      const result = await togglePublishOptimistic(companyId, product, products);
      if (!result.success) {
        console.error('Error updating product:', result.error);
        alert('Failed to update product');
      }
    } finally {
      setTogglingId(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No products available</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {isReadOnly ? 'No products are currently available.' : 'Get started by adding your first product.'}
        </p>
        {!isReadOnly && (
          <Link
            href={`/store/${companySlug}/products/new`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#06b6d4] text-white rounded-lg hover:bg-[#0891b2] transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="dash-table-wrap">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="dash-thead">
            <tr>
              <th className="dash-th">Product</th>
              <th className="dash-th">Price</th>
              <th className="dash-th">Stock</th>
              <th className="dash-th">Category</th>
              <th className="dash-th">Status</th>
              {!isReadOnly && (
                <th className="dash-th text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[oklch(0.93_0.008_234)]">
            {products.map((product) => (
              <tr
                key={product.id}
                className={`dash-tr ${deletingId === product.id ? 'opacity-50' : ''}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <TableThumbnail src={product.images?.[0]} alt={product.name} size={48} />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </div>
                      {product.sku && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          SKU: {product.sku}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white font-medium">
                    {formatPrice(product.price)}
                  </div>
                  {product.compare_price && product.compare_price > product.price && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                      {formatPrice(product.compare_price)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.stock > 10
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : product.stock > 0
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {product.stock} in stock
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {product.category || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.is_published
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {product.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                {!isReadOnly && (
                  <td className="dash-td whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {/* Publish toggle */}
                      <button
                        onClick={() => handleTogglePublish(product)}
                        disabled={togglingId === product.id}
                        title={product.is_published ? 'Unpublish' : 'Publish'}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                          product.is_published
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                      >
                        {togglingId === product.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : product.is_published ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                        {product.is_published ? 'Published' : 'Draft'}
                      </button>

                      {/* Edit */}
                      <Link
                        href={`/store/${companySlug}/products/${product.id}`}
                        title="Edit product"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#06b6d4]/10 text-[#06b6d4] hover:bg-[#06b6d4]/20 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Link>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        title="Delete product"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                      >
                        {deletingId === product.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
