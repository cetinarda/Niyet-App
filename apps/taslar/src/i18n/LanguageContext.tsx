import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Lang = 'tr' | 'en';

interface LanguageContextValue {
  language: Lang;
  setLanguage: (lang: Lang) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'tr',
  setLanguage: async () => {},
});

// Host köprüsü: Sakin host'u (sakin.life) seçili dili `sakin_lang` localStorage
// anahtarına yazar (tr/en/de/es/pt/fr/ja). Embed yalnızca tr/en içerdiğinden,
// host dili tr ise tr, diğer tüm dillerde en'e düşeriz. Host dili kullanıcının
// embed-içi seçiminden ÖNCELİKLİDİR (tek dil kaynağı host olsun).
function readHostLang(): Lang | null {
  try {
    const v = typeof localStorage !== 'undefined' ? localStorage.getItem('sakin_lang') : null;
    if (!v) return null;
    return v === 'tr' ? 'tr' : 'en';
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
      if (v === 'en' || v === 'tr') setLanguageState(v as Lang);
    });
  }, []);

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
