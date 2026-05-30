'use client';

import React from 'react';

/**
 * "Trusted across" partner/marketplace logo wall.
 *
 * A static, bordered grid of wordmarks (or image logos when a `url` is
 * supplied) — reads as a credibility wall rather than a scrolling belt.
 * Pure CSS, no JS, no external lib.
 */
const DEFAULT_LOGOS = [
  { name: 'Alibaba',  text: 'Alibaba' },
  { name: 'AliExpress', text: 'AliExpress' },
  { name: '1688',     text: '1688' },
  { name: 'Made-in-China', text: 'Made-in-China' },
  { name: 'Global Sources', text: 'Global Sources' },
  { name: 'Amazon',   text: 'amazon' },
  { name: 'eBay',     text: 'eBay' },
  { name: 'Shopify',  text: 'Shopify' },
  { name: 'DHL',      text: 'DHL' },
  { name: 'FedEx',    text: 'FedEx' },
];

interface PartnerLogoCarouselProps {
  accentColor: string;
  title?: string;
  logos?: { name: string; text?: string; url?: string }[];
}

export default function PartnerLogoCarousel({
  title = 'Trusted across the global sourcing supply chain',
  logos = DEFAULT_LOGOS,
}: PartnerLogoCarouselProps) {
  return (
    <section id="partners" className="py-16 lg:py-20 px-6 lg:px-8 bg-white border-y border-slate-200">
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-sm font-medium text-slate-500 mb-10">
          {title}
        </p>

        {/* Logo wall — hairline-divided cells. Wordmarks sit in muted gray and
            sharpen to ink on hover; image logos go grayscale until hover. */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border-t border-l border-slate-200 rounded-xl overflow-hidden">
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="group flex items-center justify-center h-24 px-6 border-r border-b border-slate-200 bg-white transition-colors hover:bg-slate-50"
            >
              {logo.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logo.url}
                  alt={logo.name}
                  loading="lazy"
                  className="max-h-9 w-auto object-contain grayscale opacity-60 transition-all duration-200 group-hover:grayscale-0 group-hover:opacity-100"
                />
              ) : (
                <span className="text-xl lg:text-2xl font-semibold text-slate-400 transition-colors duration-200 group-hover:text-slate-800">
                  {logo.text || logo.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
