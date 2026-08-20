'use client';

import { create } from 'zustand';

export type Locale = 'tr' | 'en';

const STORAGE_KEY = 'soulprofile.locale';

function detectInitial(): Locale {
  if (typeof window === 'undefined') return 'tr';
  const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (saved === 'tr' || saved === 'en') return saved;
  const nav = navigator.language?.toLowerCase() ?? 'tr';
  return nav.startsWith('tr') ? 'tr' : 'en';
}

type LocaleState = {
  locale: Locale;
  setLocale: (l: Locale) => void;
};

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: 'tr',
  setLocale: (locale) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, locale);
      document.documentElement.lang = locale;
    }
    set({ locale });
  },
}));

/** İlk yüklemede tarayıcı/localStorage'tan locale'i ayarla */
export function initLocale() {
  const l = detectInitial();
  useLocaleStore.getState().setLocale(l);
}
