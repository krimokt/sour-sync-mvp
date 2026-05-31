import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BuilderSiteShell from '@/components/storefront/BuilderSiteShell';
import JsonLd from '@/components/seo/JsonLd';
import { articleLd, breadcrumbLd } from '@/lib/jsonld';
import { getTenantSeo, getPostBySlug } from '@/lib/seo-data';
import { tenantUrl, metaDescription, absoluteImage } from '@/lib/seo';

export const revalidate = 300;

export async function generateMetadata(
  { params }: { params: { companySlug: string; postSlug: string } },
): Promise<Metadata> {
  const t = await getTenantSeo(params.companySlug);
  if (!t) return { title: 'Article', robots: { index: false, follow: false } };
  const post = await getPostBySlug(t.id, params.postSlug);
  if (!post) return { title: 'Article Not Found', robots: { index: false, follow: false } };

  const title = post.meta_title || post.title;
  const description = post.meta_description || metaDescription(post.excerpt, `${post.title} — from ${t.name}.`);
  const url = tenantUrl(t, `/blog/${post.slug}`);
  const image = absoluteImage(post.og_image) || absoluteImage(post.cover_image) || absoluteImage(t.logo_url);

  return {
    title: { absolute: title.length > 65 ? title.slice(0, 65) : title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: t.name,
      type: 'article',
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at || undefined,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { card: 'summary_large_image', title, description, images: image ? [image] : undefined },
    robots: { index: true, follow: true },
  };
}

function formatDate(d: string | null): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function BlogPostPage(
  { params }: { params: { companySlug: string; postSlug: string } },
) {
  const t = await getTenantSeo(params.companySlug);
  if (!t) notFound();
  const post = await getPostBySlug(t.id, params.postSlug);
  if (!post) notFound();

  const url = tenantUrl(t, `/blog/${post.slug}`);
  const ldArticle = articleLd({
    headline: post.title,
    url,
    description: post.meta_description || post.excerpt || undefined,
    image: absoluteImage(post.cover_image) || absoluteImage(post.og_image),
    datePublished: post.published_at,
    dateModified: post.updated_at,
    authorName: t.name,
  });
  const ldCrumb = breadcrumbLd([
    { name: 'Home', url: tenantUrl(t, '') },
    { name: 'Blog', url: tenantUrl(t, '/blog') },
    { name: post.title, url },
  ]);

  // Render the stored plain-text content as paragraphs (newline-separated).
  const paragraphs = (post.content || '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <BuilderSiteShell companySlug={params.companySlug}>
      <JsonLd data={[ldArticle, ldCrumb]} />
      <article className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="mb-8 text-sm">
            <Link href={`/site/${params.companySlug}/blog`} className="text-cyan-600 hover:text-cyan-700 font-medium">
              ← All articles
            </Link>
          </nav>

          <header className="mb-8">
            <time className="text-sm font-medium text-gray-400">{formatDate(post.published_at)}</time>
            <h1 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
              {post.title}
            </h1>
            {post.excerpt && <p className="mt-4 text-lg text-gray-500 leading-relaxed">{post.excerpt}</p>}
          </header>

          {post.cover_image && (
            <div className="mb-10 rounded-2xl overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.cover_image} alt={post.title} className="w-full object-cover" />
            </div>
          )}

          <div className="prose prose-lg max-w-none text-gray-700">
            {paragraphs.length > 0 ? (
              paragraphs.map((p, i) => (
                <p key={i} className="mb-5 leading-relaxed">
                  {p}
                </p>
              ))
            ) : (
              <p className="text-gray-400 italic">This article has no content yet.</p>
            )}
          </div>
        </div>
      </article>
    </BuilderSiteShell>
  );
}
