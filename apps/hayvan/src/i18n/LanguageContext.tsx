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

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Lang>('tr');

  useEffect(() => {
    AsyncStorage.getItem('@tura_language').then(v => {
      if (v === 'en' || v === 'tr') setLanguageState(v as Lang);
    });
  }, []);

  const setLanguage = useCallback(async (lang: Lang) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('@tura_language', lang);
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
