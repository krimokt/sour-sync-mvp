'use client';

import React from 'react';

/**
 * "Trusted on" / partner logos belt — auto-scrolls.
 * Pure CSS marquee, no JS, no external lib.
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
  accentColor,
  title = 'Trusted across the global sourcing supply chain',
  logos = DEFAULT_LOGOS,
}: PartnerLogoCarouselProps) {
  // Double the list so the marquee loop is seamless
  const loop = [...logos, ...logos];

  return (
    <section
      id="partners"
      className="py-16 px-8 bg-white border-y border-gray-100 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        <p
          className="text-center text-xs font-bold uppercase tracking-[0.18em] mb-8"
          style={{ color: accentColor }}
        >
          {title}
        </p>

        <div className="relative">
          <div className="flex gap-12 animate-marquee whitespace-nowrap will-change-transform">
            {loop.map((logo, i) => (
              <div
                key={`${logo.name}-${i}`}
                className="flex items-center justify-center px-6 py-3 text-2xl font-semibold text-gray-400 hover:text-gray-700 transition-colors"
                style={{ minWidth: 160 }}
              >
                {logo.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo.url} alt={logo.name} className="h-8 w-auto object-contain grayscale opacity-70 hover:opacity-100 transition-opacity" />
                ) : (
                  <span>{logo.text || logo.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
      `}</style>
    </section>
  );
}
