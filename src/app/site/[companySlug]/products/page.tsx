import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import ProductGrid from './ProductGrid';
import StoreHeader from '../components/StoreHeader';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Simple product type matching existing database schema
interface SimpleProduct {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  price: number | null;
  compare_price: number | null;
  sku: string | null;
  stock: number;
  category: string | null;
  images: string[];
  is_published: boolean;
  created_at: string;
}

async function getCompanyAndProducts(slug: string, category?: string, search?: string) {
  // Get company with settings
  const { data: company } = await supabase
    .from('companies')
    .select(`
      id, name, slug, logo_url,
      settings:website_settings (primary_color)
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (!company) return null;

  // Build products query
  let productsQuery = supabase
    .from('products')
    .select('*')
    .eq('company_id', company.id)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  // Filter by category if provided
  if (category) {
    productsQuery = productsQuery.eq('category', category);
  }

  // Search filter
  if (search) {
    productsQuery = productsQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data: products } = await productsQuery;

  // Get unique categories from products
  const { data: allProducts } = await supabase
    .from('products')
    .select('category')
    .eq('company_id', company.id)
    .eq('is_published', true);

  const categories = [...new Set(allProducts?.map(p => p.category).filter(Boolean))] as string[];

  return {
    company,
    categories,
    products: (products || []) as SimpleProduct[],
  };
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: { companySlug: string };
  searchParams: { category?: string; search?: string };
}) {
  const data = await getCompanyAndProducts(
    params.companySlug,
    searchParams.category,
    searchParams.search
  );

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Store not found</p>
      </div>
    );
  }

  const { company, categories, products } = data;
  const settings = Array.isArray(company.settings) ? company.settings[0] : company.settings;
  const themeColor = settings?.primary_color || '#3B82F6';

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader 
        companyName={company.name} 
        logoUrl={company.logo_url} 
        themeColor={themeColor} 
      />

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-2 text-gray-600">
            Browse our catalog or request a custom quote
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
              <h2 className="font-semibold text-gray-900 mb-4">Categories</h2>
              <nav className="space-y-2">
                <Link
                  href={`/site/${params.companySlug}/products`}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                    !searchParams.category
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  All Products
                </Link>
                {categories.map((category: string) => (
                  <Link
                    key={category}
                    href={`/site/${params.companySlug}/products?category=${encodeURIComponent(category)}`}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      searchParams.category === category
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </Link>
                ))}
              </nav>

              {/* Search */}
              <div className="mt-6 pt-6 border-t">
                <h2 className="font-semibold text-gray-900 mb-3">Search</h2>
                <form action={`/site/${params.companySlug}/products`} method="GET">
                  {searchParams.category && (
                    <input type="hidden" name="category" value={searchParams.category} />
                  )}
                  <input
                    type="text"
                    name="search"
                    defaultValue={searchParams.search}
                    placeholder="Search products..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </form>
              </div>

              {/* CTA */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-3">
                  Can&apos;t find what you need?
                </p>
                <Link
                  href={`/site/${params.companySlug}/quote`}
                  className="block w-full text-center px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors"
                  style={{ backgroundColor: themeColor }}
                >
                  Request Custom Quote
                </Link>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {searchParams.search && (
              <div className="mb-6">
                <p className="text-gray-600">
                  Search results for &quot;{searchParams.search}&quot;
                  <Link
                    href={`/site/${params.companySlug}/products${searchParams.category ? `?category=${searchParams.category}` : ''}`}
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    Clear
                  </Link>
                </p>
              </div>
            )}

            {products.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <p className="text-gray-500 mb-4">No products found</p>
                <Link
                  href={`/site/${params.companySlug}/quote`}
                  className="text-blue-600 hover:underline"
                >
                  Request a custom quote instead
                </Link>
              </div>
            ) : (
              <ProductGrid products={products} companySlug={params.companySlug} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
