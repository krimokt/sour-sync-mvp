'use client';

import React from 'react';

/**
 * Shared storefront brand lockup (logo + company name) used by both the
 * homepage navbar and the sub-page navbar so they never drift apart.
 *
 * - Renders the tenant's uploaded logo when present, otherwise a tinted
 *   initial tile in the brand accent.
 * - `onDark` flips the wordmark to white for the transparent-over-hero
 *   state on the homepage; otherwise it sits in ink on white.
 */
export default function BrandMark({
  companyName,
  logoUrl,
  accentHex,
  href,
  onDark = false,
}: {
  companyName: string;
  logoUrl?: string | null;
  accentHex: string;
  href: string;
  onDark?: boolean;
}) {
  const initial = companyName.charAt(0).toUpperCase();

  return (
    <a
      href={href}
      aria-label={`${companyName} — home`}
      className="group flex items-center gap-2.5 flex-shrink-0"
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={`${companyName} logo`}
          className="h-8 w-auto max-w-[140px] object-contain"
          decoding="async"
        />
      ) : (
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold transition-shadow"
          style={{
            background: accentHex,
            boxShadow: `0 1px 0 rgba(255,255,255,0.18) inset, 0 4px 14px -4px ${accentHex}66`,
          }}
        >
          {initial}
        </span>
      )}
      <span
        className={`font-semibold text-[15px] tracking-tight transition-colors ${
          onDark ? 'text-white' : 'text-slate-900'
        }`}
      >
        {companyName}
      </span>
    </a>
  );
}
