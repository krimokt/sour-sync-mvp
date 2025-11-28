import React from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import Image from 'next/image';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getProducts(companyId: string, limit: number = 8) {
  const { data } = await supabase
    .from('products')
    .select('id, name, price, compare_price, images, category')
    .eq('company_id', companyId)
    .eq('is_published', true)
    .limit(limit)
    .order('created_at', { ascending: false });
  return data || [];
}

interface ProductsSectionProps {
  data: Record<string, unknown>;
  companyId: string;
  companySlug: string;
  themeColor: string;
}

export default async function ProductsSection({ data, companyId, companySlug, themeColor }: ProductsSectionProps) {
  const limit = (data.limit as number) || 8;
  const title = (data.title as string) || 'Featured Products';
  const products = await getProducts(companyId, limit);

  if (products.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            {title}
          </h2>
          <Link
            href={`/site/${companySlug}/products`}
            className="hidden sm:inline-flex items-center text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: themeColor }}
          >
            View all products
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
           {products.map((product) => (
             <Link
               key={product.id}
               href={`/site/${companySlug}/products/${product.id}`}
               className="group relative"
             >
               <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100 relative">
                  {product.images && product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-300">
                      <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
               </div>
               <div className="mt-4 flex justify-between">
                 <div>
                   <h3 className="text-sm font-medium text-gray-900">
                     <span aria-hidden="true" className="absolute inset-0" />
                     {product.name}
                   </h3>
                   <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                 </div>
                 <p className="text-sm font-bold text-gray-900" style={{ color: themeColor }}>
                   ${product.price}
                 </p>
               </div>
             </Link>
           ))}
        </div>
        
        <div className="mt-12 text-center sm:hidden">
           <Link
            href={`/site/${companySlug}/products`}
            className="inline-flex items-center px-6 py-3 rounded-lg text-white font-medium"
            style={{ backgroundColor: themeColor }}
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
