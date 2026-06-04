import { useMemo } from 'react';
import { useLanguage } from '../i18n/useLanguage';

import archetypesTR from './archetypes.json';
import archetypesEN from './archetypes_en.json';
import mythsTR from './myths.json';
import mythsEN from './myths_en.json';
import imagesTR from './images.json';
import imagesEN from './images_en.json';
import tarotTR from './tarot.json';
import tarotEN from './tarot_en.json';
import runesTR from './runes.json';
import runesEN from './runes_en.json';
import ichingTR from './iching.json';
import ichingEN from './iching_en.json';

export type Archetype = typeof archetypesTR[0];
export type Myth      = typeof mythsTR[0];
export type ImageItem = typeof imagesTR[0];
export type TarotCard = typeof tarotTR[0];
export type RuneItem  = typeof runesTR[0];
export type IChingHex = typeof ichingTR[0];

export function useData() {
  const { lang } = useLanguage();
  return useMemo(() => ({
    archetypes: (lang === 'en' ? archetypesEN : archetypesTR) as Archetype[],
    myths:      (lang === 'en' ? mythsEN      : mythsTR)      as Myth[],
    images:     (lang === 'en' ? imagesEN     : imagesTR)     as ImageItem[],
    tarot:      (lang === 'en' ? tarotEN      : tarotTR)      as TarotCard[],
    runes:      (lang === 'en' ? runesEN      : runesTR)      as RuneItem[],
    iching:     (lang === 'en' ? ichingEN     : ichingTR)     as IChingHex[],
    lang,
  }), [lang]);
}
