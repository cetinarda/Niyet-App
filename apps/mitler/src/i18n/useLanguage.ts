import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DICTIONARY, Lang, TR } from './translations';

const STORAGE_KEY = '@mitler_lang';
const DEFAULT_LANG: Lang = 'tr';

let currentLang: Lang = DEFAULT_LANG;
const listeners = new Set<(lang: Lang) => void>();
let bootstrapped = false;

async function bootstrap() {
  if (bootstrapped) return;
  bootstrapped = true;
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored === 'tr' || stored === 'en') {
      currentLang = stored;
      listeners.forEach(l => l(currentLang));
    }
  } catch {
    // ignore
  }
}

function notify() {
  listeners.forEach(l => l(currentLang));
}

export async function setLanguage(lang: Lang) {
  currentLang = lang;
  notify();
  try {
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore
  }
}

export function getLanguage(): Lang {
  return currentLang;
}

export function translate(
  key: keyof typeof TR,
  vars?: Record<string, string | number>,
): string {
  const dict = DICTIONARY[currentLang] || DICTIONARY.tr;
  let value = dict[key] || (DICTIONARY.tr as any)[key] || key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return value;
}

export function useLanguage() {
  const [lang, setLang] = useState<Lang>(currentLang);

  useEffect(() => {
    bootstrap();
    const listener = (l: Lang) => setLang(l);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const t = useCallback(
    (key: keyof typeof TR, vars?: Record<string, string | number>) =>
      translate(key, vars),
    [lang],
  );

  return { lang, t, setLanguage };
}
