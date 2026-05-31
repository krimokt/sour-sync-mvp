import React from 'react';
import type { StorefrontLocale } from '@/lib/i18n/storefront-dict';

/**
 * Small geometric flag per storefront language. Inline SVG (no deps, no CDN)
 * so it renders identically on every OS — unlike emoji flags, which Windows
 * shows as letter pairs. Rendered inside a rounded, clipped 20×14 frame.
 *
 * Language → country: en→US, zh→China, ar→Saudi Arabia, ru→Russia.
 */
function FlagSvg({ locale }: { locale: StorefrontLocale }) {
  switch (locale) {
    case 'zh':
      return (
        <svg viewBox="0 0 30 20" className="h-full w-full">
          <rect width="30" height="20" fill="#de2910" />
          <path
            fill="#ffde00"
            d="M6 3.2 7 6.1 4.6 4.3H7.4L5 6.1z"
          />
          <circle cx="11" cy="2.4" r="0.9" fill="#ffde00" />
          <circle cx="12.4" cy="4" r="0.9" fill="#ffde00" />
          <circle cx="12.4" cy="6.2" r="0.9" fill="#ffde00" />
          <circle cx="11" cy="7.8" r="0.9" fill="#ffde00" />
        </svg>
      );
    case 'ru':
      return (
        <svg viewBox="0 0 30 20" className="h-full w-full">
          <rect width="30" height="20" fill="#fff" />
          <rect y="6.67" width="30" height="6.67" fill="#0039a6" />
          <rect y="13.33" width="30" height="6.67" fill="#d52b1e" />
        </svg>
      );
    case 'ar':
      // Saudi Arabia — green field with a white band (emblem simplified).
      return (
        <svg viewBox="0 0 30 20" className="h-full w-full">
          <rect width="30" height="20" fill="#1a7a3c" />
          <rect x="5" y="8.4" width="20" height="1.5" rx="0.75" fill="#fff" />
          <rect x="6" y="11" width="13" height="1.2" rx="0.6" fill="#fff" />
        </svg>
      );
    case 'en':
    default:
      // United States — simplified stripes + canton.
      return (
        <svg viewBox="0 0 30 20" className="h-full w-full">
          <rect width="30" height="20" fill="#b22234" />
          {[1, 3, 5, 7, 9, 11].map((i) => (
            <rect key={i} y={(i * 20) / 13} width="30" height={20 / 13} fill="#fff" />
          ))}
          <rect width="13" height={(20 / 13) * 7} fill="#3c3b6e" />
          {[...Array(6)].map((_, c) =>
            [...Array(2)].map((__, r) => (
              <circle key={`${c}-${r}`} cx={1.6 + c * 2} cy={1.6 + r * 3} r="0.5" fill="#fff" />
            )),
          )}
        </svg>
      );
  }
}

export default function FlagIcon({
  locale,
  className = '',
}: {
  locale: StorefrontLocale;
  className?: string;
}) {
  return (
    <span
      className={`inline-block h-3.5 w-5 overflow-hidden rounded-[3px] ring-1 ring-black/10 align-middle ${className}`}
      aria-hidden
    >
      <FlagSvg locale={locale} />
    </span>
  );
}
