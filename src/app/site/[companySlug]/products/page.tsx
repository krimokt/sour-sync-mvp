import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Search, Package2, Sparkles, ChevronRight, SlidersHorizontal } from 'lucide-react';
import ProductGrid from './ProductGrid';
import BuilderSiteShell from '@/components/storefront/BuilderSiteShell';
import { AntiMetalButton } from '@/components/ui/anti-metal-button';
import type { Metadata } from 'next';
import { getTenantSeo } from '@/lib/seo-data';
import { tenantUrl, metaDescription, absoluteImage } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbLd } from '@/lib/jsonld';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { companySlug: string } }): Promise<Metadata> {
  const t = await getTenantSeo(params.companySlug);
  if (!t) return { title: 'Products', robots: { index: false, follow: false } };
  const description = metaDescription(
    undefined,
    `Browse products from ${t.name}${t.country ? `, ${t.country.toUpperCase()}` : ''}. Wholesale supply with fast quotes.`,
  );
  const url = tenantUrl(t, '/products');
  const image = absoluteImage(t.logo_url);
  return {
    title: 'Products',
    description,
    alternates: { canonical: url },
    openGraph: { title: `Products | ${t.name}`, description, url, siteName: t.name, images: image ? [{ url: image }] : undefined },
    twitter: { card: 'summary_large_image', title: `Products | ${t.name}`, description, images: image ? [image] : undefined },
  };
}

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

  const t = await getTenantSeo(params.companySlug);
  const ldCrumb = t
    ? breadcrumbLd([
        { name: 'Home', url: tenantUrl(t, '') },
        { name: 'Products', url: tenantUrl(t, '/products') },
      ])
    : null;

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Store not found</p>
      </div>
    );
  }

  const { categories, products } = data;

  const productCount = products.length;
  const categoryCount = categories.length;
  const activeCategory = searchParams.category;
  const activeSearch = searchParams.search;

  return (
    <>
    <JsonLd data={ldCrumb} />
    <BuilderSiteShell companySlug={params.companySlug}>
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Ambient brand glow — replaces flat gray bg without the cream-default reflex */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] -z-10"
        style={{
          background:
            'radial-gradient(60% 80% at 50% -10%, rgba(59,130,246,0.10), transparent 70%), radial-gradient(40% 60% at 90% 0%, rgba(96,165,250,0.08), transparent 70%), linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.025]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Page Header — full-bleed photo with deep blue overlay */}
      <header className="relative isolate overflow-hidden text-white">
        {/* Background image */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80&auto=format&fit=crop')",
          }}
        />
        {/* Color overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(115deg, rgba(15,23,42,0.92) 0%, rgba(30,58,138,0.85) 45%, rgba(37,99,235,0.55) 100%)',
          }}
        />
        {/* Subtle grid overlay for tactile depth */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Bottom fade into page */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-24 -z-10 bg-gradient-to-b from-transparent to-white/0"
        />

        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-10 pt-16 pb-14 lg:pt-24 lg:pb-20">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium ring-1 ring-inset ring-white/25 backdrop-blur">
                <Sparkles className="w-3.5 h-3.5" />
                Live catalog
              </div>
              <h1
                className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-semibold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.25)]"
                style={{ letterSpacing: '-0.03em', textWrap: 'balance' }}
              >
                Products
              </h1>
              <p className="mt-4 text-lg text-blue-50/90 max-w-xl leading-relaxed">
                Browse the full catalog or send the specs and we&apos;ll source it from our verified factories.
              </p>
            </div>

            {/* Meta strip — glass card on photo */}
            <dl className="flex items-center gap-6 text-sm px-5 py-4 rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/20 self-start lg:self-end">
              <div>
                <dt className="text-blue-100/80">In catalog</dt>
                <dd className="mt-0.5 text-2xl font-semibold text-white tabular-nums">{productCount}</dd>
              </div>
              <div className="h-10 w-px bg-white/20" aria-hidden="true" />
              <div>
                <dt className="text-blue-100/80">Categories</dt>
                <dd className="mt-0.5 text-2xl font-semibold text-white tabular-nums">{categoryCount}</dd>
              </div>
            </dl>
          </div>

          {/* Breadcrumb / filter chips */}
          {(activeCategory || activeSearch) && (
            <div className="mt-8 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-blue-100/80">Filtered by</span>
              {activeCategory && (
                <span className="inline-flex items-center gap-2 pl-3 pr-2 py-1 rounded-full bg-white/15 ring-1 ring-white/25 text-white backdrop-blur">
                  {activeCategory}
                  <Link
                    href={`/site/${params.companySlug}/products${activeSearch ? `?search=${activeSearch}` : ''}`}
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-white/20 text-white/90"
                    aria-label="Remove category filter"
                  >
                    ×
                  </Link>
                </span>
              )}
              {activeSearch && (
                <span className="inline-flex items-center gap-2 pl-3 pr-2 py-1 rounded-full bg-white/15 ring-1 ring-white/25 text-white backdrop-blur">
                  &ldquo;{activeSearch}&rdquo;
                  <Link
                    href={`/site/${params.companySlug}/products${activeCategory ? `?category=${activeCategory}` : ''}`}
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-white/20 text-white/90"
                    aria-label="Clear search"
                  >
                    ×
                  </Link>
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 p-6 sticky top-24 space-y-7">
              {/* Search */}
              <div>
                <form action={`/site/${params.companySlug}/products`} method="GET" className="relative">
                  {activeCategory && (
                    <input type="hidden" name="category" value={activeCategory} />
                  )}
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="search"
                    defaultValue={activeSearch}
                    placeholder="Search products"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition"
                  />
                </form>
              </div>

              {/* Categories */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                  <h2 className="text-sm font-semibold text-slate-900">Categories</h2>
                </div>
                <nav className="space-y-1">
                  <Link
                    href={`/site/${params.companySlug}/products`}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      !activeCategory
                        ? 'bg-blue-600 text-white font-medium'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>All products</span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        !activeCategory ? 'text-white' : 'text-slate-400 group-hover:translate-x-0.5'
                      }`}
                    />
                  </Link>
                  {categories.map((category: string) => {
                    const isActive = activeCategory === category;
                    return (
                      <Link
                        key={category}
                        href={`/site/${params.companySlug}/products?category=${encodeURIComponent(category)}`}
                        className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white font-medium'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{category}</span>
                        <ChevronRight
                          className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:translate-x-0.5'
                          }`}
                        />
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* CTA */}
              <div className="rounded-xl p-5 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                <h3 className="text-base font-semibold leading-snug">Need something custom?</h3>
                <p className="mt-1.5 text-sm text-blue-100/90 leading-relaxed">
                  Send a spec, photo, or competitor link. We&apos;ll quote within 24 hours.
                </p>
                <Link
                  href={`/site/${params.companySlug}/quote`}
                  className="mt-4 inline-flex w-full justify-center"
                >
                  <AntiMetalButton label="Custom Quote" className="w-full max-w-[200px]" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900 tabular-nums">{productCount}</span>{' '}
                {productCount === 1 ? 'product' : 'products'}
                {activeCategory && (
                  <>
                    {' '}in <span className="font-semibold text-slate-900">{activeCategory}</span>
                  </>
                )}
              </h2>
            </div>

            {products.length === 0 ? (
              <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 p-12 lg:p-16 text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Package2 className="w-7 h-7" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">No products match</h3>
                <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto">
                  Try a different search or clear the filters. If we don&apos;t list it, we can still source it.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <Link
                    href={`/site/${params.companySlug}/products`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    Clear filters
                  </Link>
                  <Link
                    href={`/site/${params.companySlug}/quote`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
                  >
                    Request a custom quote
                  </Link>
                </div>
              </div>
            ) : (
              <ProductGrid products={products} companySlug={params.companySlug} />
            )}
          </main>
        </div>
      </div>
    </div>
    </BuilderSiteShell>
    </>
  );
}
