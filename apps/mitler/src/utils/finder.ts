// ─── Mit Bulucu: dilden bağımsız puanlama ──────────────────────────────────
// Saf modül (React Native içe aktarmaz); Node doğrulaması:
// `apps/mitler/src/utils/finder.verify.ts` (çalıştırma komutu dosyanın başında).
//
// NEDEN: quiz cevapları Türkçe özellik kelimeleri (ör. "cesaret", "dönüşüm")
// taşıyor, element de Türkçe iç anahtar ("ateş", "su"). Eskiden bunlar O ANKİ
// dilin veri dosyasıyla (myths_en.json vb.) karşılaştırılıyordu; tr dışında
// ne kelimeler ne element ("fire" ≠ "ateş") eşleşiyordu, sonuç çoğu zaman
// listenin ilk kaydı oluyordu. Artık puanlama HER ZAMAN temel (tr) veri
// setine karşı yapılır, çıktı kararlı id'dir; gösterim o id'nin seçili
// dildeki kaydından yapılır. Tüm dil dosyalarında id'ler bire bir aynı.

import { calcLifePath } from './numerology';

export type ElementKey = 'hava' | 'ateş' | 'toprak' | 'su';
export type SeasonKey = 'ilkbahar' | 'yaz' | 'sonbahar' | 'kış';
export type HourKey = 'gece' | 'sabah' | 'öğlen' | 'akşam';

/** Özellik kelimeleri Türkçe İÇ ANAHTARDIR, temel (tr) veriyle eşleşir; görünen metin değildir. */
export interface TraitWeight { trait: string; value: number }
export interface QuizOptionScore { weights: TraitWeight[]; element?: ElementKey }

/**
 * Quiz puan tanımı: FINDER_QUIZ[soru][seçenek]. Sıra, ekrandaki soru/seçenek
 * metinleriyle (MitlerFinderScreen QUESTIONS) BİREBİR aynı olmalı.
 */
export const FINDER_QUIZ: QuizOptionScore[][] = [
  // 1. Doğada hangi ortam
  [
    { element: 'hava',   weights: [{ trait: 'özgürlük', value: 2 }, { trait: 'vizyon', value: 2 }, { trait: 'yüksek bakış', value: 2 }] },
    { element: 'toprak', weights: [{ trait: 'güç', value: 2 }, { trait: 'istikrar', value: 2 }, { trait: 'kök', value: 2 }] },
    { element: 'su',     weights: [{ trait: 'akış', value: 2 }, { trait: 'bilinçdışı', value: 2 }, { trait: 'dönüşüm', value: 2 }] },
    { element: 'ateş',   weights: [{ trait: 'cesaret', value: 2 }, { trait: 'tutku', value: 2 }, { trait: 'dönüşüm', value: 2 }] },
  ],
  // 2. Zor karar anı
  [
    { weights: [{ trait: 'bilgelik', value: 3 }, { trait: 'sezgi', value: 2 }, { trait: 'derinlik', value: 2 }] },
    { weights: [{ trait: 'kahraman', value: 3 }, { trait: 'cesaret', value: 2 }, { trait: 'irade', value: 2 }] },
    { weights: [{ trait: 'şefkat', value: 3 }, { trait: 'sevgi', value: 2 }, { trait: 'beslenme', value: 2 }] },
    { weights: [{ trait: 'asilik', value: 3 }, { trait: 'mizah', value: 2 }, { trait: 'kuralı kırmak', value: 2 }] },
  ],
  // 3. Seni anlatan sözcük
  [
    { weights: [{ trait: 'yaratım', value: 3 }, { trait: 'ifade', value: 2 }, { trait: 'sanat', value: 2 }] },
    { weights: [{ trait: 'bilgelik', value: 3 }, { trait: 'içgörü', value: 2 }, { trait: 'mentor', value: 2 }] },
    { weights: [{ trait: 'sevgi', value: 3 }, { trait: 'tutku', value: 3 }, { trait: 'adanma', value: 2 }] },
    { weights: [{ trait: 'başkaldırı', value: 3 }, { trait: 'özgürlük', value: 2 }, { trait: 'değişim', value: 2 }] },
  ],
  // 4. Gruptaki rol
  [
    { weights: [{ trait: 'liderlik', value: 3 }, { trait: 'sorumluluk', value: 2 }, { trait: 'vizyon', value: 2 }] },
    { weights: [{ trait: 'denge', value: 3 }, { trait: 'arabuluculuk', value: 2 }, { trait: 'uyum', value: 2 }] },
    { weights: [{ trait: 'yaratım', value: 3 }, { trait: 'ilham', value: 2 }, { trait: 'estetik', value: 2 }] },
    { weights: [{ trait: 'içgörü', value: 3 }, { trait: 'derinlik', value: 2 }, { trait: 'gözlem', value: 2 }] },
  ],
  // 5. En büyük güç
  [
    { weights: [{ trait: 'sezgi', value: 3 }, { trait: 'bilinçaltı', value: 2 }, { trait: 'derinlik', value: 2 }] },
    { weights: [{ trait: 'sabır', value: 3 }, { trait: 'dayanıklılık', value: 2 }, { trait: 'istikrar', value: 2 }] },
    { weights: [{ trait: 'zekâ', value: 3 }, { trait: 'oyun', value: 2 }, { trait: 'uyum', value: 2 }] },
    { weights: [{ trait: 'cesaret', value: 3 }, { trait: 'tutku', value: 3 }, { trait: 'irade', value: 2 }] },
  ],
  // 6. En çok konuşan yara
  [
    { weights: [{ trait: 'yetim', value: 3 }, { trait: 'kayıp', value: 2 }, { trait: 'sürgün', value: 2 }] },
    { weights: [{ trait: 'maske', value: 3 }, { trait: 'gölge', value: 2 }, { trait: 'utanç', value: 2 }] },
    { weights: [{ trait: 'kontrol', value: 3 }, { trait: 'sınır', value: 2 }, { trait: 'disiplin', value: 2 }] },
    { weights: [{ trait: 'arayış', value: 3 }, { trait: 'bilgelik', value: 2 }, { trait: 'manevi', value: 2 }] },
  ],
  // 7. Hep çağıran şey
  [
    { weights: [{ trait: 'self', value: 3 }, { trait: 'bütünlük', value: 3 }, { trait: 'merkez', value: 2 }] },
    { weights: [{ trait: 'dönüşüm', value: 3 }, { trait: 'yeniden doğuş', value: 3 }, { trait: 'ölüm-doğuş', value: 2 }] },
    { weights: [{ trait: 'yaratım', value: 3 }, { trait: 'ifade', value: 2 }, { trait: 'sanat', value: 2 }] },
    { weights: [{ trait: 'aziz', value: 3 }, { trait: 'adanma', value: 2 }, { trait: 'şifa', value: 2 }] },
  ],
];

export interface FinderProfile {
  traits: Record<string, number>;
  elements: Record<string, number>;
}

export interface BirthProfile extends FinderProfile {
  lifePath: number;
  element: ElementKey;
  season: SeasonKey;
  hour: HourKey | '';
}

/** Puanlanabilir kayıt: temel (tr) veri setindeki arketip / mit / imge. */
export interface ScorableEntry {
  id: string;
  name: string;
  element?: string;
  keywords?: string[];
  category?: string;
  culture?: string;
}

export interface CanonicalPools<A extends ScorableEntry, M extends ScorableEntry, I extends ScorableEntry> {
  archetypes: A[];
  myths: M[];
  images: I[];
}

export interface FinderIds { archetypeId: string; mythId: string; imageId: string }

// ─── Profil kurma ─────────────────────────────────────────────────────────────

/** answers[i] = i. sorudaki seçilen seçeneğin sırası. */
export function quizProfile(answers: number[]): FinderProfile {
  const traits: Record<string, number> = {};
  const elements: Record<string, number> = {};
  answers.forEach((optIdx, qIdx) => {
    const opt = FINDER_QUIZ[qIdx]?.[optIdx];
    if (!opt) return;
    for (const { trait, value } of opt.weights) traits[trait] = (traits[trait] || 0) + value;
    if (opt.element) elements[opt.element] = (elements[opt.element] || 0) + 3;
  });
  return { traits, elements };
}

const SEASON_EL: Record<number, ElementKey> = {
  1: 'su', 2: 'su', 3: 'hava', 4: 'hava', 5: 'hava',
  6: 'ateş', 7: 'ateş', 8: 'ateş', 9: 'toprak', 10: 'toprak', 11: 'toprak', 12: 'su',
};
const SEASON_NAME: Record<ElementKey, SeasonKey> = { hava: 'ilkbahar', ateş: 'yaz', toprak: 'sonbahar', su: 'kış' };

const LIFE_PATH_TRAITS: Record<number, string[]> = {
  1:  ['liderlik', 'cesaret', 'özgürlük'],
  2:  ['denge', 'sezgi', 'arabuluculuk'],
  3:  ['yaratım', 'ifade', 'sanat'],
  4:  ['istikrar', 'disiplin', 'sabır'],
  5:  ['özgürlük', 'değişim', 'yolculuk'],
  6:  ['şefkat', 'sevgi', 'beslenme'],
  7:  ['bilgelik', 'derinlik', 'arayış'],
  8:  ['güç', 'dönüşüm', 'adanma'],
  9:  ['bilgelik', 'şefkat', 'dönüşüm'],
  11: ['sezgi', 'ilham', 'manevi'],
  22: ['vizyon', 'yaratım', 'liderlik'],
  33: ['şefkat', 'adanma', 'şifa'],
};

const DAY_TRAITS: Record<number, string[]> = {
  1: ['kahraman', 'cesaret', 'liderlik'],
  2: ['sezgi', 'derinlik', 'bilgelik'],
  3: ['dönüşüm', 'yeniden doğuş', 'değişim'],
  4: ['sevgi', 'şefkat', 'beslenme'],
};

const HOUR_RANGES: { min: number; max: number; traits: string[]; label: HourKey }[] = [
  { min: 0,  max: 5,  traits: ['gölge', 'bilinçaltı', 'sezgi', 'derinlik'], label: 'gece' },
  { min: 6,  max: 11, traits: ['kahraman', 'cesaret', 'irade', 'yaratım'],  label: 'sabah' },
  { min: 12, max: 17, traits: ['liderlik', 'güç', 'vizyon', 'self'],        label: 'öğlen' },
  { min: 18, max: 23, traits: ['dönüşüm', 'bilgelik', 'şefkat', 'aziz'],    label: 'akşam' },
];

export function birthProfile(day: number, month: number, year: number, hour?: number): BirthProfile {
  const traits: Record<string, number> = {};
  const elements: Record<string, number> = {};
  const element = SEASON_EL[month];
  elements[element] = 5;

  const lifePath = calcLifePath(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  for (const t of (LIFE_PATH_TRAITS[lifePath] || [])) traits[t] = (traits[t] || 0) + 3;

  const dg = Math.min(Math.ceil(day / 8), 4);
  for (const t of (DAY_TRAITS[dg] || [])) traits[t] = (traits[t] || 0) + 2;

  let hourKey: HourKey | '' = '';
  if (hour !== undefined && hour !== null && !Number.isNaN(hour)) {
    const hr = HOUR_RANGES.find(r => hour >= r.min && hour <= r.max);
    if (hr) {
      for (const t of hr.traits) traits[t] = (traits[t] || 0) + 3;
      hourKey = hr.label;
    }
  }
  return { traits, elements, lifePath, element, season: SEASON_NAME[element], hour: hourKey };
}

// ─── Puanlama (yalnızca temel tr veriye karşı) ───────────────────────────────

export function normalizeWord(s: string): string {
  return s.toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
    .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c');
}

export function scoreEntry<T extends ScorableEntry>(
  pool: T[],
  profile: FinderProfile,
): T {
  const traits = Object.entries(profile.traits).map(([k, v]) => [normalizeWord(k), v] as const);
  let best = pool[0];
  let bestScore = -1;
  for (const item of pool) {
    let score = item.element ? (profile.elements[item.element] || 0) : 0;
    const blob = normalizeWord(
      [item.name, ...(item.keywords || []), item.category || '', item.culture || ''].join(' '),
    );
    for (const [k, v] of traits) if (blob.includes(k)) score += v;
    if (score > bestScore) { bestScore = score; best = item; }
  }
  return best;
}

/** Kazanan kayıtların kararlı id'leri. `canonical` MUTLAKA temel (tr) veri olmalı. */
export function pickFinderIds<A extends ScorableEntry, M extends ScorableEntry, I extends ScorableEntry>(
  profile: FinderProfile,
  canonical: CanonicalPools<A, M, I>,
): FinderIds {
  return {
    archetypeId: scoreEntry(canonical.archetypes, profile).id,
    mythId:      scoreEntry(canonical.myths, profile).id,
    imageId:     scoreEntry(canonical.images, profile).id,
  };
}

/** id'yi gösterim dilinin kaydına çevirir; o dilde yoksa temel kayda düşer. */
export function byId<T extends { id: string }>(display: T[], canonical: T[], id: string): T {
  return display.find(x => x.id === id) ?? canonical.find(x => x.id === id) ?? canonical[0];
}

// ─── Element etiketi (sonuç kartındaki etiket, 7 dil) ───────────────────────
// tr veride element Türkçe ("ateş"), diğer dillerin dosyalarında İngilizce
// ("fire"); iki yazım da aynı etikete çözülür.
const ELEMENT_CANON: Record<string, string> = {
  ateş: 'fire', su: 'water', toprak: 'earth', hava: 'air', karanlık: 'darkness', bütün: 'whole',
  fire: 'fire', water: 'water', earth: 'earth', air: 'air', darkness: 'darkness', whole: 'whole',
};

const ELEMENT_LABEL: Record<string, Record<string, string>> = {
  tr: { fire: 'ateş', water: 'su', earth: 'toprak', air: 'hava', darkness: 'karanlık', whole: 'bütün' },
  en: { fire: 'fire', water: 'water', earth: 'earth', air: 'air', darkness: 'darkness', whole: 'whole' },
  de: { fire: 'Feuer', water: 'Wasser', earth: 'Erde', air: 'Luft', darkness: 'Dunkelheit', whole: 'Ganzheit' },
  es: { fire: 'fuego', water: 'agua', earth: 'tierra', air: 'aire', darkness: 'oscuridad', whole: 'totalidad' },
  pt: { fire: 'fogo', water: 'água', earth: 'terra', air: 'ar', darkness: 'escuridão', whole: 'totalidade' },
  fr: { fire: 'feu', water: 'eau', earth: 'terre', air: 'air', darkness: 'obscurité', whole: 'totalité' },
  ja: { fire: '火', water: '水', earth: '地', air: '風', darkness: '闇', whole: '全体' },
};

export function elementLabel(el: string | undefined, lang: string): string {
  if (!el) return '';
  const key = ELEMENT_CANON[el];
  if (!key) return el;
  return (ELEMENT_LABEL[lang] ?? ELEMENT_LABEL.en)[key];
}
