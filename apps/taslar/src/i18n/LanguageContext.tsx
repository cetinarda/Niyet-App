import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Lang } from './index';

export type { Lang };

const VALID_LANGS: Lang[] = ['tr', 'en', 'de', 'es', 'pt', 'fr', 'ja'];

interface LanguageContextValue {
  language: Lang;
  setLanguage: (lang: Lang) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'tr',
  setLanguage: async () => {},
});

// Host köprüsü: Sakin host'u (sakin.life) seçili dili `sakin_lang` localStorage
// anahtarına yazar (tr/en/de/es/pt/fr/ja). Aynı origin → embed senkron okur.
// Host dili kullanıcının embed-içi seçiminden ÖNCELİKLİDİR (tek dil kaynağı host).
// Çevirisi henüz olmayan dillerde i18n/localize katmanı otomatik en → tr'ye düşer.
function readHostLang(): Lang | null {
  try {
    const v = typeof localStorage !== 'undefined' ? localStorage.getItem('sakin_lang') : null;
    if (!v) return null;
    return (VALID_LANGS as string[]).includes(v) ? (v as Lang) : 'en';
  } catch {
    return null;
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Senkron başlat: host dili varsa onunla (TR yanıp sönmesi olmasın).
  const [language, setLanguageState] = useState<Lang>(() => readHostLang() ?? 'tr');

  useEffect(() => {
    const host = readHostLang();
    if (host) { setLanguageState(host); return; } // host dili öncelikli
    AsyncStorage.getItem('@sakinhayvan_language').then(v => {
      if (v && (VALID_LANGS as string[]).includes(v)) setLanguageState(v as Lang);
    });
  }, []);

  // <html lang> dile eşitlenir: Expo export index.html lang="en" gelir; CSS
  // textTransform:'uppercase' o zaman Türkçe i→I (noktasız) üretir. lang="tr"
  // ile tarayıcı i→İ yapar — tüm uppercase stiller kökten düzelir.
  useEffect(() => {
    try { if (typeof document !== 'undefined') document.documentElement.lang = language; } catch {}
  }, [language]);

  const setLanguage = useCallback(async (lang: Lang) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('@sakinhayvan_language', lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
