'use client';

import { create } from 'zustand';

export type Locale = 'tr' | 'en';

const STORAGE_KEY = 'soulprofile.locale';

function detectInitial(): Locale {
  if (typeof window === 'undefined') return 'tr';
  // SAKİN KÖPRÜSÜ: embed Sakin'in içinde açıldığında host dilini izle. Aksi
  // halde SoulProfile kendi anahtarı yokken tarayıcı diline düşüyordu; Türkçe
  // uygulamada İngilizce eşleşme ekranı çıkıyordu. `sakin_lang` en yüksek
  // öncelik, sonra kullanıcının SoulID içinde yaptığı seçim, sonra tarayıcı.
  try {
    const sk = (localStorage.getItem('sakin_lang') || '').toLowerCase();
    if (sk.startsWith('tr')) return 'tr';
    if (sk.startsWith('en')) return 'en';
  } catch { /* storage kapalı: aşağıya düş */ }
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
