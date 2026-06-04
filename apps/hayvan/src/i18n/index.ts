import { tr } from './tr';
import { en } from './en';

export type Lang = 'tr' | 'en';
export type Translations = typeof tr;

// Cast `en` to Translations so the Record assignment is type-safe.
// Both objects share the same key structure; the literal types differ.
export const translations: Record<Lang, Translations> = {
  tr,
  en: en as unknown as Translations,
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
function getNestedValue(obj: any, path: string): string {
  const result = path.split('.').reduce((acc: any, key: string) => acc?.[key], obj);
  return typeof result === 'string' ? result : path;
}

export function t(key: TranslationKey, lang: Lang): string {
  return getNestedValue(translations[lang], key as string);
}
