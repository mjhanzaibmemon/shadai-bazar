'use client';

import {
  createContext, useContext, useEffect, useState, type ReactNode, useCallback,
} from 'react';
import { translate, type Locale } from '@/lib/i18n';

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    // Load saved preference
    const saved = typeof window !== 'undefined' ? localStorage.getItem('locale') : null;
    if (saved === 'ur' || saved === 'en') setLocaleState(saved);
  }, []);

  useEffect(() => {
    // Apply dir to <html> for proper Urdu RTL rendering
    if (typeof document !== 'undefined') {
      document.documentElement.dir = locale === 'ur' ? 'rtl' : 'ltr';
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== 'undefined') localStorage.setItem('locale', l);
  }, []);

  const t = useCallback((key: string) => translate(key, locale), [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir: locale === 'ur' ? 'rtl' : 'ltr' }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
