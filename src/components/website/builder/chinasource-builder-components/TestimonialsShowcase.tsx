'use client';

import React from 'react';
import { Quote, Star } from 'lucide-react';
import { useStorefrontLocale } from '@/components/storefront/LocaleProvider';
import type { TestimonialSeo } from '@/lib/seo-data';

interface TestimonialsShowcaseProps {
  items: TestimonialSeo[];
  accentHex: string;
  title?: string;
  subtitle?: string;
}

/**
 * Client testimonials — social proof in the buyer's own words.
 * Quote cards with author, role/company, optional avatar and star rating.
 * Read-only; managed from the dashboard's Testimonials tab.
 */
export default function TestimonialsShowcase({
  items,
  accentHex,
  title,
  subtitle,
}: TestimonialsShowcaseProps) {
  const { t } = useStorefrontLocale();
  if (!items || items.length === 0) return null;

  return (
    <section id="testimonials" className="py-28 px-6 lg:px-8" style={{ background: 'var(--surface-soft, #f8fafc)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-14">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">{title ?? t('section.testimonials')}</h2>
          <p className="mt-3 text-lg text-gray-500 leading-relaxed">{subtitle ?? t('section.testimonialsSub')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <figure
              key={t.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <Quote size={26} style={{ color: accentHex }} className="mb-4 flex-shrink-0" aria-hidden />

              {typeof t.rating === 'number' && t.rating > 0 && (
                <div className="flex items-center gap-0.5 mb-3" aria-label={`${t.rating} out of 5`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      className={i < t.rating! ? '' : 'text-slate-200'}
                      style={i < t.rating! ? { color: accentHex, fill: accentHex } : undefined}
                      aria-hidden
                    />
                  ))}
                </div>
              )}

              <blockquote className="text-[15px] leading-relaxed text-slate-700 flex-1">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <figcaption className="mt-6 flex items-center gap-3">
                {t.avatar_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.avatar_image}
                    alt={t.author_name}
                    loading="lazy"
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <span
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: `${accentHex}1a`, color: accentHex }}
                  >
                    {t.author_name.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{t.author_name}</div>
                  {(t.author_title || t.author_company) && (
                    <div className="text-xs text-gray-500 truncate">
                      {[t.author_title, t.author_company].filter(Boolean).join(', ')}
                    </div>
                  )}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
