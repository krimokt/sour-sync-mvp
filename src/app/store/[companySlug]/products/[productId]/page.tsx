'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types/database';
import ProductForm from '@/components/products/ProductForm';

export default function EditProductPage() {
  const { productId } = useParams();
  const { company } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!company || !productId) return;

      try {
        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .eq('company_id', company.id)
          .single();

        if (fetchError) throw fetchError;
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Product not found');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [company, productId]);

  if (!company) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Product Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          The product you are looking for does not exist.
        </p>
        <Link
          href={`/store/${company.slug}/products`}
          className="text-brand-500 hover:text-brand-600"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Product</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Update product details
          </p>
        </div>
      </div>

      <ProductForm product={product} companyId={company.id} companySlug={company.slug} />
    </div>
  );
}


