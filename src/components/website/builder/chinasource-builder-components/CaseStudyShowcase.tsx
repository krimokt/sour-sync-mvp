'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import type { CaseStudySeo } from '@/lib/seo-data';

interface CaseStudyShowcaseProps {
  items: CaseStudySeo[];
  accentHex: string;
  title?: string;
  subtitle?: string;
}

/**
 * Project / case-study portfolio — the strongest B2B trust device.
 * Each project is a card with a real photo, the client it was for, a
 * headline metric (e.g. "13,972 m²"), and where/when it ran. Read-only;
 * managed from the dashboard's Case Studies tab.
 */
export default function CaseStudyShowcase({
  items,
  accentHex,
  title = 'Selected projects',
  subtitle = 'A sample of work delivered for buyers around the world.',
}: CaseStudyShowcaseProps) {
  if (!items || items.length === 0) return null;

  return (
    <section id="projects" className="py-28 px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-14">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">{title}</h2>
          {subtitle && <p className="mt-3 text-lg text-gray-500 leading-relaxed">{subtitle}</p>}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((cs) => (
            <article
              key={cs.id}
              className="group flex flex-col rounded-2xl border border-slate-200 overflow-hidden bg-white transition-shadow hover:shadow-md"
            >
              <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
                {cs.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cs.cover_image}
                    alt={cs.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="w-full h-full" style={{ background: `${accentHex}10` }} />
                )}
              </div>

              <div className="flex flex-col flex-1 p-5">
                {cs.client_name && (
                  <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: accentHex }}>
                    {cs.client_name}
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2">{cs.title}</h3>
                {cs.summary && <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-3">{cs.summary}</p>}

                {/* Headline metric — the verifiable proof point */}
                {cs.metric_value && (
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold tracking-tight text-gray-900 tabular-nums">
                      {cs.metric_value}
                    </span>
                    {cs.metric_label && <span className="text-sm text-gray-500">{cs.metric_label}</span>}
                  </div>
                )}

                {/* Meta footer — scope + where/when */}
                <div className="mt-auto pt-4 flex items-center gap-4 text-xs text-gray-400">
                  {(cs.location || cs.year) && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={13} />
                      {[cs.location, cs.year].filter(Boolean).join(' · ')}
                    </span>
                  )}
                  {cs.scope && <span className="truncate">{cs.scope}</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
