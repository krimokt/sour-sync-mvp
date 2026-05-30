import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BuilderSiteShell from '@/components/storefront/BuilderSiteShell';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbLd } from '@/lib/jsonld';
import { getTenantSeo, getPublishedPosts } from '@/lib/seo-data';
import { tenantUrl, metaDescription, absoluteImage } from '@/lib/seo';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { companySlug: string } }): Promise<Metadata> {
  const t = await getTenantSeo(params.companySlug);
  if (!t) return { title: 'Blog', robots: { index: false, follow: false } };
  const description = metaDescription(
    undefined,
    `News, guides and sourcing insights from ${t.name}.`,
  );
  const url = tenantUrl(t, '/blog');
  const image = absoluteImage(t.logo_url);
  return {
    title: 'Blog',
    description,
    alternates: { canonical: url },
    openGraph: { title: `Blog | ${t.name}`, description, url, siteName: t.name, images: image ? [{ url: image }] : undefined },
    twitter: { card: 'summary_large_image', title: `Blog | ${t.name}`, description, images: image ? [image] : undefined },
  };
}

function formatDate(d: string | null): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default async function BlogIndexPage({ params }: { params: { companySlug: string } }) {
  const t = await getTenantSeo(params.companySlug);
  if (!t) notFound();

  const posts = await getPublishedPosts(t.id);
  const ldCrumb = breadcrumbLd([
    { name: 'Home', url: tenantUrl(t, '') },
    { name: 'Blog', url: tenantUrl(t, '/blog') },
  ]);

  return (
    <BuilderSiteShell companySlug={params.companySlug}>
      <JsonLd data={ldCrumb} />
      <div className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-600">Insights</span>
            <h1 className="mt-2 text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              {t.name} Blog
            </h1>
            <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
              Sourcing guides, product knowledge and company news.
            </p>
          </header>

          {posts.length === 0 ? (
            <p className="text-center text-gray-500">No posts published yet. Check back soon.</p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2">
              {posts.map((p) => (
                <Link
                  key={p.id}
                  href={`/site/${params.companySlug}/blog/${p.slug}`}
                  className="group block rounded-2xl border border-gray-200 overflow-hidden bg-white hover:shadow-lg hover:border-gray-300 transition-all"
                >
                  <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
                    {p.cover_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.cover_image}
                        alt={p.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-cyan-50 to-blue-100" />
                    )}
                  </div>
                  <div className="p-5">
                    <time className="text-xs font-medium text-gray-400">{formatDate(p.published_at)}</time>
                    <h2 className="mt-1 text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-cyan-700 transition-colors">
                      {p.title}
                    </h2>
                    {p.excerpt && <p className="mt-2 text-sm text-gray-500 line-clamp-3">{p.excerpt}</p>}
                    <span className="mt-3 inline-block text-sm font-semibold text-cyan-600">Read more →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </BuilderSiteShell>
  );
}
