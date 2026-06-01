'use client';

import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useScroll } from '@/components/ui/use-scroll';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useStorefrontLocale } from '@/components/storefront/LocaleProvider';
import LanguageSwitcher from '@/components/storefront/LanguageSwitcher';
import { NAV_LABEL_KEY } from '@/lib/i18n/storefront-dict';

const NAVY = '#1B3E84';
const NAVY_DARK = '#13316b';
const RED = '#E2231A';
const INK = '#0F1115';
const STEEL = '#F4F6FA';

interface Props {
  companySlug: string;
  companyName: string;
}

/**
 * Shared "Industrial Precision" sticky nav for the whitesourcing tenant.
 * Same scroll effect, mobile menu, language switcher, "Get Quote" button and
 * chat FAB extracted from WhiteSourcingHome so every page shares one nav.
 */
export default function WhiteSourcingNav({ companySlug, companyName }: Props) {
  const { t } = useStorefrontLocale();
  const scrolled = useScroll(50);
  const [mobileOpen, setMobileOpen] = useState(false);

  const base = `/site/${companySlug}`;

  const navItems = [
    { label: t(NAV_LABEL_KEY.Products), href: `${base}/products` },
    { label: t(NAV_LABEL_KEY.About), href: `${base}/about` },
    { label: t(NAV_LABEL_KEY.Certifications), href: `${base}/certifications` },
    { label: t(NAV_LABEL_KEY.Blog), href: `${base}/blog` },
    { label: t(NAV_LABEL_KEY.Contact), href: `${base}/contact` },
  ];

  const Brand = () => (
    <a href={base} className="flex items-center gap-2.5 flex-shrink-0">
      <span
        className="inline-flex items-center justify-center h-8 w-8 rounded-[3px] text-white text-sm font-bold"
        style={{ background: NAVY, fontFamily: 'var(--font-sora), sans-serif' }}
      >
        {companyName.charAt(0).toUpperCase()}
      </span>
      <span
        className="text-lg font-bold tracking-tight text-[#0F1115]"
        style={{ fontFamily: 'var(--font-sora), sans-serif' }}
      >
        {companyName}
      </span>
    </a>
  );

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
          scrolled ? 'bg-white shadow-sm border-gray-200' : 'bg-white/85 backdrop-blur-md border-gray-200/70'
        }`}
      >
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 lg:px-16 py-3.5">
          <Brand />
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[13px] font-semibold uppercase tracking-wide text-gray-600 hover:text-[#1B3E84] transition-colors whitespace-nowrap"
                style={{ letterSpacing: '0.04em' }}
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher accentHex={NAVY} />
            <a
              href={`${base}/contact`}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-[3px] text-white text-[13px] font-semibold uppercase tracking-wide whitespace-nowrap shadow-sm transition-colors"
              style={{ background: NAVY, letterSpacing: '0.04em' }}
            >
              {t('cta.getQuote')}
            </a>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2 -mr-2 text-gray-700"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <MenuToggleIcon open={mobileOpen} className="size-5" duration={300} />
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white px-5 py-4">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-3 rounded-[3px] text-sm font-semibold uppercase tracking-wide text-gray-700 hover:bg-gray-50"
                >
                  {item.label}
                </a>
              ))}
              <a
                href={`${base}/contact`}
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-flex justify-center items-center px-5 py-3 rounded-[3px] text-white text-sm font-semibold uppercase"
                style={{ background: NAVY }}
              >
                {t('cta.getQuote')}
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Chat FAB */}
      <a
        href={`${base}/contact`}
        aria-label={t('cta.getQuote')}
        className="fixed bottom-8 right-8 z-[100] flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-transform hover:scale-110"
        style={{ background: NAVY }}
      >
        <MessageCircle size={26} />
      </a>
    </>
  );
}

export { NAVY, NAVY_DARK, RED, INK, STEEL };
