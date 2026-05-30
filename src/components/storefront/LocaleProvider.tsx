'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_LOCALE,
  dirFor,
  isStorefrontLocale,
  translate,
  type StorefrontLocale,
  type StorefrontStringKey,
} from '@/lib/i18n/storefront-dict';

export const STOREFRONT_LOCALE_COOKIE = 'sf_locale';

interface LocaleContextValue {
  locale: StorefrontLocale;
  dir: 'ltr' | 'rtl';
  setLocale: (l: StorefrontLocale) => void;
  t: (key: StorefrontStringKey) => string;
}

// Default value = English with a no-op setter, so components rendered
// OUTSIDE a provider (e.g. the builder editor preview) still work.
const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  dir: 'ltr',
  setLocale: () => {},
  t: (key) => translate(DEFAULT_LOCALE, key),
});

export function useStorefrontLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}

export default function LocaleProvider({
  initialLocale = DEFAULT_LOCALE,
  children,
}: {
  initialLocale?: StorefrontLocale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<StorefrontLocale>(initialLocale);

  const setLocale = useCallback((next: StorefrontLocale) => {
    setLocaleState(next);
    if (typeof document !== 'undefined') {
      // Persist for a year so the choice sticks across visits.
      document.cookie = `${STOREFRONT_LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      const root = document.documentElement;
      root.lang = next;
      root.dir = dirFor(next);
    }
  }, []);

  // On mount, adopt the persisted choice from the cookie. We start from the
  // server-rendered default (English) to avoid a hydration mismatch, then
  // switch here — this keeps ISR/static rendering intact for sub-pages.
  useEffect(() => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${STOREFRONT_LOCALE_COOKIE}=([^;]+)`));
    const saved = match?.[1];
    if (saved && isStorefrontLocale(saved) && saved !== locale) {
      setLocaleState(saved);
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep <html lang/dir> in sync with the active locale.
  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = dirFor(locale);
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      dir: dirFor(locale),
      setLocale,
      t: (key) => translate(locale, key),
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export { isStorefrontLocale };
