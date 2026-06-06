import { tr } from './tr';
import { en } from './en';
import { de } from './de';
import { es } from './es';
import { pt } from './pt';
import { fr } from './fr';
import { ja } from './ja';

export type Lang = 'tr' | 'en' | 'de' | 'es' | 'pt' | 'fr' | 'ja';
export type Translations = typeof tr;

// Çevrilmiş diller eklendikçe buraya import edilip registry'ye yazılır.
// Eksik dil ya da eksik anahtar otomatik olarak en → tr'ye düşer (graceful fallback).
export const translations: Partial<Record<Lang, Translations>> = {
  tr,
  en: en as unknown as Translations,
  de: de as unknown as Translations,
  es: es as unknown as Translations,
  pt: pt as unknown as Translations,
  fr: fr as unknown as Translations,
  ja: ja as unknown as Translations,
};

// Deep nested key accessor — t('home.greeting.morning', lang)
type DeepKeys<T, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends string
    ? Prefix extends '' ? `${string & K}` : `${Prefix}.${string & K}`
    : T[K] extends Record<string, unknown>
    ? DeepKeys<T[K], Prefix extends '' ? `${string & K}` : `${Prefix}.${string & K}`>
    : never
}[keyof T];

export type TranslationKey = DeepKeys<Translations>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getRaw(obj: any, path: string): string | null {
  if (!obj) return null;
  const result = path.split('.').reduce((acc: any, key: string) => acc?.[key], obj);
  return typeof result === 'string' ? result : null;
}

// Seçili dilde anahtar yoksa İngilizce, o da yoksa Türkçe, o da yoksa anahtarın kendisi.
export function t(key: TranslationKey, lang: Lang): string {
  const k = key as string;
  return getRaw(translations[lang], k) ?? getRaw(translations.en, k) ?? getRaw(translations.tr, k) ?? k;
}
