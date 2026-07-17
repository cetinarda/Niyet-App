import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DICTIONARY, Lang, TR } from './translations';

const STORAGE_KEY = '@mitler_lang';
const DEFAULT_LANG: Lang = 'tr';
const VALID_LANGS: Lang[] = ['tr', 'en', 'de', 'es', 'pt', 'fr', 'ja'];

// Host köprüsü: Sakin host'u (sakin.life) seçili dili `sakin_lang` localStorage
// anahtarına yazar. Aynı origin → embed senkron okur. Host dili kullanıcının
// embed-içi seçiminden ÖNCELİKLİDİR (tek dil kaynağı host). Desteklenmeyen dil
// gelirse en'e düşülür; çevirisi olmayan içerik loader/translate ile en→tr'ye düşer.
function readHostLang(): Lang | null {
  try {
    const v = typeof localStorage !== 'undefined' ? localStorage.getItem('sakin_lang') : null;
    if (!v) return null;
    return (VALID_LANGS as string[]).includes(v) ? (v as Lang) : 'en';
  } catch {
    return null;
  }
}

// Senkron başlangıç: host dili varsa TR yanıp sönmesi olmadan onunla aç.
let currentLang: Lang = readHostLang() ?? DEFAULT_LANG;
const listeners = new Set<(lang: Lang) => void>();
let bootstrapped = false;

async function bootstrap() {
  if (bootstrapped) return;
  bootstrapped = true;
  // Host dili öncelikli — varsa onu kullan, embed-içi tercihi okuma.
  const host = readHostLang();
  if (host) {
    if (host !== currentLang) { currentLang = host; notify(); }
    return;
  }
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored && (VALID_LANGS as string[]).includes(stored)) {
      currentLang = stored as Lang;
      notify();
    }
  } catch {
    // ignore
  }
}

// <html lang> dile eşitlenir: Expo export index.html lang="en" gelir; CSS
// textTransform:'uppercase' o zaman Türkçe i→I (noktasız) üretir. lang="tr"
// ile tarayıcı i→İ yapar — tüm uppercase stiller kökten düzelir.
function syncDocLang() {
  try { if (typeof document !== 'undefined') document.documentElement.lang = currentLang; } catch {}
}
syncDocLang();

function notify() {
  syncDocLang();
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
