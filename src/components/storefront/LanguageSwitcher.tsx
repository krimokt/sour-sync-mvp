'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useStorefrontLocale } from './LocaleProvider';
import {
  STOREFRONT_LOCALES,
  LOCALE_LABELS,
  LOCALE_SHORT,
  type StorefrontLocale,
} from '@/lib/i18n/storefront-dict';

/**
 * Storefront language switcher. Flips the UI chrome language and, for
 * Arabic, the page direction (handled by LocaleProvider). `onDark` styles
 * it for the transparent-over-hero navbar state.
 */
export default function LanguageSwitcher({
  accentHex,
  onDark = false,
}: {
  accentHex: string;
  onDark?: boolean;
}) {
  const { locale, setLocale, t } = useStorefrontLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pick = (l: StorefrontLocale) => {
    setLocale(l);
    setOpen(false);
  };

  const triggerCls = onDark
    ? 'text-white/85 hover:text-white hover:bg-white/10 ring-1 ring-white/20'
    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 ring-1 ring-slate-200';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('lang.label')}
        className={`inline-flex items-center gap-1.5 h-10 px-3 rounded-full text-[13px] font-semibold transition-colors ${triggerCls}`}
      >
        <Globe size={15} />
        <span className="min-w-[1.5rem] text-center">{LOCALE_SHORT[locale]}</span>
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('lang.label')}
          className="absolute end-0 mt-2 w-44 rounded-xl bg-white shadow-lg ring-1 ring-slate-200 py-1.5 z-50"
        >
          {STOREFRONT_LOCALES.map((l) => {
            const active = l === locale;
            return (
              <li key={l}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => pick(l)}
                  className="w-full flex items-center justify-between gap-2 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span className={active ? 'font-semibold' : ''}>{LOCALE_LABELS[l]}</span>
                  {active && <Check size={15} style={{ color: accentHex }} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
