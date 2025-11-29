'use client';

import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import ProductForm from '@/components/products/ProductForm';

export default function NewProductPage() {
  const { company } = useStore();

  if (!company) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/store/${company.slug}/products`}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Product</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Create a new product for your store
          </p>
        </div>
      </div>

      {/* Form */}
      <ProductForm companyId={company.id} companySlug={company.slug} />
    </div>
  );
}




