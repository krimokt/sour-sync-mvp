import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_price: number | null;
  sku: string | null;
  stock: number;
  images: string[];
  category: string | null;
  variants: { name: string; value: string; price_adjustment?: number }[];
  company_id: string;
}

interface Company {
  id: string;
  name: string;
  slug: string;
  website_settings: {
    theme_color?: string;
    show_prices?: boolean;
  } | null;
}

async function getProduct(productId: string): Promise<Product | null> {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('is_published', true)
    .single();
  return data;
}

async function getCompany(companyId: string): Promise<Company | null> {
  const { data } = await supabase
    .from('companies')
    .select('id, name, slug, website_settings')
    .eq('id', companyId)
    .single();
  return data;
}

async function getRelatedProducts(companyId: string, productId: string, category: string | null): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('id, name, description, price, compare_price, images, category, sku, stock, variants, company_id')
    .eq('company_id', companyId)
    .eq('is_published', true)
    .neq('id', productId)
    .limit(4);

  if (category) {
    query = query.eq('category', category);
  }

  const { data } = await query;
  return data || [];
}

export async function generateMetadata({ params }: { params: { companySlug: string; productId: string } }) {
  const product = await getProduct(params.productId);
  
  if (!product) {
    return { title: 'Product Not Found' };
  }

  return {
    title: product.name,
    description: product.description || `View ${product.name}`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { companySlug: string; productId: string };
}) {
  const product = await getProduct(params.productId);
  
  if (!product) {
    notFound();
  }

  const company = await getCompany(product.company_id);
  
  if (!company || company.slug !== params.companySlug) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(company.id, product.id, product.category);
  
  const themeColor = company.website_settings?.theme_color || '#3B82F6';
  const showPrices = company.website_settings?.show_prices !== false;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)
    : 0;

  return (
    <div className="py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link 
                href={`/site/${company.slug}`}
                className="text-gray-500 hover:text-gray-700"
              >
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link 
                href={`/site/${company.slug}/products`}
                className="text-gray-500 hover:text-gray-700"
              >
                Products
              </Link>
            </li>
            {product.category && (
              <>
                <li className="text-gray-400">/</li>
                <li>
                  <Link 
                    href={`/site/${company.slug}/products?category=${encodeURIComponent(product.category)}`}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {product.category}
                  </Link>
                </li>
              </>
            )}
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium truncate max-w-[200px]">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              {hasDiscount && (
                <span 
                  className="absolute top-4 left-4 px-3 py-1 text-sm font-semibold text-white rounded-full"
                  style={{ backgroundColor: themeColor }}
                >
                  -{discountPercentage}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.slice(0, 4).map((image, index) => (
                  <div
                    key={index}
                    className={`relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer ${
                      index === 0 ? 'ring-2' : ''
                    }`}
                    style={index === 0 ? { '--tw-ring-color': themeColor } as React.CSSProperties : {}}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} - Image ${index + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.category && (
              <Link
                href={`/site/${company.slug}/products?category=${encodeURIComponent(product.category)}`}
                className="inline-block text-sm font-medium mb-2 hover:opacity-80"
                style={{ color: themeColor }}
              >
                {product.category}
              </Link>
            )}
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {showPrices && (
              <div className="flex items-center gap-3 mb-6">
                <span 
                  className="text-3xl font-bold"
                  style={{ color: themeColor }}
                >
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(product.compare_price!)}
                  </span>
                )}
              </div>
            )}

            {product.description && (
              <div className="prose prose-gray max-w-none mb-8">
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-8 space-y-4">
                <h3 className="font-medium text-gray-900">Available Options</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm"
                    >
                      {variant.name}: {variant.value}
                      {variant.price_adjustment && variant.price_adjustment !== 0 && (
                        <span className="ml-1 text-gray-500">
                          ({variant.price_adjustment > 0 ? '+' : ''}{formatPrice(variant.price_adjustment)})
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-8">
              {product.stock > 0 ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-sm text-gray-600">In Stock</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span className="text-sm text-gray-600">Out of Stock</span>
                </>
              )}
              {product.sku && (
                <span className="text-sm text-gray-400 ml-4">SKU: {product.sku}</span>
              )}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="flex-1 px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: themeColor }}
              >
                Request Quote
              </button>
              <Link
                href={`/site/${company.slug}/products`}
                className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium text-center hover:bg-gray-50 transition-colors"
              >
                Continue Browsing
              </Link>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/site/${company.slug}/products/${relatedProduct.id}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {relatedProduct.images && relatedProduct.images.length > 0 ? (
                      <Image
                        src={relatedProduct.images[0]}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 line-clamp-1">
                      {relatedProduct.name}
                    </h3>
                    {showPrices && (
                      <p className="font-semibold mt-1" style={{ color: themeColor }}>
                        {formatPrice(relatedProduct.price)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

