import { useMemo } from 'react';
import { useLanguage } from '../i18n/useLanguage';

import archetypesTR from './archetypes.json';
import archetypesEN from './archetypes_en.json';
import archetypesDE from './archetypes_de.json';
import archetypesES from './archetypes_es.json';
import archetypesPT from './archetypes_pt.json';
import archetypesFR from './archetypes_fr.json';
import archetypesJA from './archetypes_ja.json';
import mythsTR from './myths.json';
import mythsEN from './myths_en.json';
import mythsDE from './myths_de.json';
import mythsES from './myths_es.json';
import mythsPT from './myths_pt.json';
import mythsFR from './myths_fr.json';
import mythsJA from './myths_ja.json';
import imagesTR from './images.json';
import imagesEN from './images_en.json';
import imagesDE from './images_de.json';
import imagesES from './images_es.json';
import imagesPT from './images_pt.json';
import imagesFR from './images_fr.json';
import imagesJA from './images_ja.json';
import tarotTR from './tarot.json';
import tarotEN from './tarot_en.json';
import tarotDE from './tarot_de.json';
import tarotES from './tarot_es.json';
import tarotPT from './tarot_pt.json';
import tarotFR from './tarot_fr.json';
import tarotJA from './tarot_ja.json';
import runesTR from './runes.json';
import runesEN from './runes_en.json';
import runesDE from './runes_de.json';
import runesES from './runes_es.json';
import runesPT from './runes_pt.json';
import runesFR from './runes_fr.json';
import runesJA from './runes_ja.json';
import ichingTR from './iching.json';
import ichingEN from './iching_en.json';
import ichingDE from './iching_de.json';
import ichingES from './iching_es.json';
import ichingPT from './iching_pt.json';
import ichingFR from './iching_fr.json';
import ichingJA from './iching_ja.json';

export type Archetype = typeof archetypesTR[0];
export type Myth      = typeof mythsTR[0];
export type ImageItem = typeof imagesTR[0];
export type TarotCard = typeof tarotTR[0];
export type RuneItem  = typeof runesTR[0];
export type IChingHex = typeof ichingTR[0];

// Per-data-type language tables. tr is the base; a language without a dedicated
// file falls back to en, then tr (handled by `pick`).
const TABLES = {
  archetypes: { tr: archetypesTR, en: archetypesEN, de: archetypesDE, es: archetypesES, pt: archetypesPT, fr: archetypesFR, ja: archetypesJA },
  myths:      { tr: mythsTR,      en: mythsEN,      de: mythsDE,      es: mythsES,      pt: mythsPT,      fr: mythsFR,      ja: mythsJA },
  images:     { tr: imagesTR,     en: imagesEN,     de: imagesDE,     es: imagesES,     pt: imagesPT,     fr: imagesFR,     ja: imagesJA },
  tarot:      { tr: tarotTR,      en: tarotEN,      de: tarotDE,      es: tarotES,      pt: tarotPT,      fr: tarotFR,      ja: tarotJA },
  runes:      { tr: runesTR,      en: runesEN,      de: runesDE,      es: runesES,      pt: runesPT,      fr: runesFR,      ja: runesJA },
  iching:     { tr: ichingTR,     en: ichingEN,     de: ichingDE,     es: ichingES,     pt: ichingPT,     fr: ichingFR,     ja: ichingJA },
} as const;

function pick<T>(table: Record<string, T[]>, lang: string): T[] {
  return (table[lang] ?? table.en ?? table.tr);
}

export function useData() {
  const { lang } = useLanguage();
  return useMemo(() => ({
    archetypes: pick<Archetype>(TABLES.archetypes as any, lang),
    myths:      pick<Myth>(TABLES.myths as any, lang),
    images:     pick<ImageItem>(TABLES.images as any, lang),
    tarot:      pick<TarotCard>(TABLES.tarot as any, lang),
    runes:      pick<RuneItem>(TABLES.runes as any, lang),
    iching:     pick<IChingHex>(TABLES.iching as any, lang),
    lang,
  }), [lang]);
}
