'use client';

import React from 'react';
import { Mail, Phone, MapPin, Boxes } from 'lucide-react';
import { useStorefrontLocale } from '@/components/storefront/LocaleProvider';
import { NAV_LABEL_KEY } from '@/lib/i18n/storefront-dict';

const NAVY = '#1B3E84';
const INK = '#0F1115';

interface Props {
  companySlug: string;
  companyName: string;
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

/**
 * Shared "Industrial Precision" footer for the whitesourcing tenant.
 * Extracted from WhiteSourcingHome; contact details are prop-driven with
 * sensible whitesourcing defaults.
 */
export default function WhiteSourcingFooter({ companySlug, companyName, contact }: Props) {
  const { t } = useStorefrontLocale();
  const base = `/site/${companySlug}`;

  const email = contact?.email || 'info@whitesourcing.com';
  const phone = contact?.phone || '+86 370 8888 8888';
  const address = contact?.address || 'Shangqiu, Henan Province, China';

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
        className="text-lg font-bold tracking-tight text-white"
        style={{ fontFamily: 'var(--font-sora), sans-serif' }}
      >
        {companyName}
      </span>
    </a>
  );

  return (
    <footer className="pb-8 pt-16 text-gray-400" style={{ background: INK }}>
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-5 lg:px-16 pb-12 md:grid-cols-4">
        <div>
          <div className="mb-5"><Brand /></div>
          <p className="text-sm leading-relaxed">
            商丘市水力达水暖器材厂 — Precision valve systems and plumbing equipment manufactured in Shangqiu,
            Henan, China. Trusted by partners in 40+ countries.
          </p>
        </div>
        <div>
          <h4 className="mb-5 text-lg font-bold text-white" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>Contact</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <Mail size={18} className="text-gray-500 shrink-0" />
              <a href={`mailto:${email}`} className="hover:text-white">{email}</a>
            </li>
            <li className="flex items-start gap-3">
              <Phone size={18} className="text-gray-500 shrink-0" />
              <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-white">{phone}</a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-gray-500 shrink-0" />
              <span>{address}</span>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-5 text-lg font-bold text-white" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>Quick Links</h4>
          <ul className="space-y-3 text-sm">
            {navItems.map((item) => (
              <li key={item.href}><a href={item.href} className="hover:text-white transition-colors">{item.label}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-5 text-lg font-bold text-white" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>Certifications</h4>
          <div className="flex flex-wrap gap-2">
            {['ISO 9001', 'CE', 'SGS', 'RoHS', 'NSF/ANSI 61'].map((cert) => (
              <span
                key={cert}
                className="inline-block px-3 py-1 rounded-[3px] text-xs font-semibold text-white border border-white/20"
                style={{ background: 'rgba(255,255,255,0.08)', fontFamily: 'var(--font-mono), monospace' }}
              >
                {cert}
              </span>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-[3px]" style={{ background: NAVY }}>
              <Boxes size={18} className="text-white" />
            </span>
            <a href={`${base}/contact`} className="text-sm font-semibold text-white hover:underline">
              {t('cta.getQuote')}
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1280px] border-t border-white/10 px-5 lg:px-16 pt-8 text-center">
        <p className="text-xs uppercase tracking-widest text-gray-600">
          © {new Date().getFullYear()} {companyName} / 商丘市水力达水暖器材厂. {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
}
