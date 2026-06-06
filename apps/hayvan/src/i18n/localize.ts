import { useMemo } from 'react';
import { useSakinHayvanStore } from '../store/useStore';
import type { Lang } from './index';

import animalsData from '../data/animals.json';
import quotesData from '../data/quotes.json';
import nagualsData from '../data/naguals.json';
import stonesData from '../data/stones.json';
import philosophersData from '../data/philosophers.json';
import { getAnimalLore } from '../data/animalLore';

const EN_SUFFIX_FIELDS = [
  'name', 'element', 'symbolism', 'anatolianMeaning', 'dailyMessage', 'guidance',
  'text', 'aspect', 'origin', 'tradition', 'chakra', 'properties', 'plant',
  'howToUse', 'affirmation', 'category',
] as const;

// Dil → veri alanı suffix'i. Çevrilmiş içerik eklendikçe (ör. nameDe, originEs…)
// otomatik kullanılır; yoksa İngilizce (...En), o da yoksa Türkçe (orijinal alan).
const LANG_SUFFIX: Record<string, string> = {
  tr: '', en: 'En', de: 'De', es: 'Es', pt: 'Pt', fr: 'Fr', ja: 'Ja',
};

export function localize<T extends Record<string, any>>(item: T, lang: Lang): T {
  if (lang === 'tr' || !item) return item;
  const suffix = LANG_SUFFIX[lang] ?? 'En';
  const result: any = { ...item };
  for (const field of EN_SUFFIX_FIELDS) {
    const v = (item as any)[`${field}${suffix}`] ?? (item as any)[`${field}En`];
    if (v != null) result[field] = v; // yoksa orijinal (tr) alan kalır
  }
  return result as T;
}

export function localizeAll<T extends Record<string, any>>(items: T[], lang: Lang): T[] {
  if (lang === 'tr') return items;
  return items.map(i => localize(i, lang));
}

export function useLang(): Lang {
  const { language } = useSakinHayvanStore();
  return language ?? 'tr';
}

export function useLocalizedAnimals() {
  const lang = useLang();
  return useMemo(() => localizeAll(animalsData as any[], lang), [lang]);
}

export function useLocalizedQuotes() {
  const lang = useLang();
  return useMemo(() => localizeAll(quotesData as any[], lang), [lang]);
}

export function useLocalizedNaguals() {
  const lang = useLang();
  return useMemo(() => localizeAll(nagualsData as any[], lang), [lang]);
}

export function useLocalizedStones() {
  const lang = useLang();
  return useMemo(() => localizeAll(stonesData as any[], lang), [lang]);
}

type Bilingual = { tr: string; en: string } & { [k: string]: string | undefined };
function pickB(b: Bilingual | undefined, lang: Lang): string | undefined {
  if (!b) return undefined;
  return (b as any)[lang] ?? b.en ?? b.tr; // seçili dil → en → tr
}

export function useLocalizedLore(animalId: string) {
  const lang = useLang();
  return useMemo(() => {
    const lore: any = getAnimalLore(animalId);
    if (!lore) return null;
    return {
      jung: pickB(lore.jung, lang),
      dream: pickB(lore.dream, lang),
      shadow: pickB(lore.shadow, lang),
      whenAppears: pickB(lore.whenAppears, lang),
      traditions: lore.traditions?.map((tr: any) => ({
        culture: pickB(tr.culture, lang),
        meaning: pickB(tr.meaning, lang),
      })),
      myths: lore.myths?.map((m: any) => pickB(m, lang)),
    };
  }, [animalId, lang]);
}

export function useLocalizedPhilosophers() {
  const lang = useLang();
  return useMemo(() => {
    if (lang === 'tr') return philosophersData as Record<string, any>;
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(philosophersData)) {
      result[k] = localize(v as any, lang);
    }
    return result;
  }, [lang]);
}
