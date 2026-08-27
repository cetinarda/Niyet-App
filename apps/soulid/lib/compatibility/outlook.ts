// Karne "Uyum Ufku" — bu kişinin kimlerle anlaşacağının deterministik haritası.
// Klasik astroloji geometrisi + Human Design tip dinamikleri + numeroloji
// üçlüleri. AI yok, tekrar yok — kişinin GERÇEK haritasından türetilir.
//
//  - AYNA EŞ: Yükselen'in karşısı (Descendant = 7. ev girişi, klasik "partner
//    noktası"). Saat bilinmiyorsa Güneş'in karşısı.
//  - KUTSAL BİRLEŞİM ADAYLARI: Güneş + Ay üçgenleri (aynı element — 120°,
//    en akışkan rezonans).
//  - DERS ORTAKLARI: Güneş karesi (90° — sürtünmeyle büyüten bağlar).

import type { GalacticReport, ZodiacSign } from '../types';

const ORDER: ZodiacSign[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

function shift(sign: ZodiacSign, by: number): ZodiacSign {
  const i = ORDER.indexOf(sign);
  return ORDER[(i + by + 12) % 12]!;
}

export type HDType = GalacticReport['humanDesign']['type'];

export type OutlookAlly = { type: HDType; why: { tr: string; en: string } };

export type CompatibilityOutlook = {
  /** Descendant (partner noktası) — tek burç */
  mirror: ZodiacSign;
  mirrorSource: 'ascendant' | 'sun';
  /** Güneş+Ay üçgenleri (aynı element) — 2-4 burç */
  sacred: ZodiacSign[];
  /** Güneş kareleri — 2 burç */
  lesson: ZodiacSign[];
  /** HD tipine enerji müttefikleri */
  hdAllies: OutlookAlly[];
  /** Numeroloji üçlüsü (yaşam yolu ailesi) */
  lifePathAllies: number[];
};

const HD_ALLIES: Record<HDType, OutlookAlly[]> = {
  Generator: [
    { type: 'Projector', why: { tr: 'Enerjini görür ve doğru yöne çevirir', en: 'Sees your energy and aims it right' } },
    { type: 'ManifestingGenerator', why: { tr: 'Temponu yakalayan tek tip', en: 'The only type that keeps your pace' } },
  ],
  ManifestingGenerator: [
    { type: 'Generator', why: { tr: 'Sürdürme gücün, onun derinliğiyle dengelenir', en: 'Your speed balanced by their depth' } },
    { type: 'Manifestor', why: { tr: 'Başlatma cesaretinizi ikiye katlar', en: 'Doubles your initiating courage' } },
  ],
  Manifestor: [
    { type: 'Generator', why: { tr: 'Başlattığını hayatta tutar', en: 'Keeps alive what you start' } },
    { type: 'Reflector', why: { tr: 'Etkinin aynasını dürüstçe tutar', en: 'Honestly mirrors your impact' } },
  ],
  Projector: [
    { type: 'Generator', why: { tr: 'Rehberliğine açık, tükenmeyen enerji', en: 'Open to your guidance, tireless energy' } },
    { type: 'ManifestingGenerator', why: { tr: 'Çok kanallı gücü senin görüşünle netleşir', en: 'Their multi-track power sharpens with your vision' } },
  ],
  Reflector: [
    { type: 'Generator', why: { tr: 'Sağlıklı, istikrarlı bir enerji alanı sunar', en: 'Offers a healthy, steady energy field' } },
    { type: 'Projector', why: { tr: 'Seni acele ettirmeden okur', en: 'Reads you without rushing you' } },
  ],
};

// Pythagorean üçlüler: 1-5-7 (zihin) · 2-4-8 (yapı) · 3-6-9 (yaratım)
const LP_TRIADS: number[][] = [
  [1, 5, 7],
  [2, 4, 8],
  [3, 6, 9],
];

function lifePathFamily(lp: number): number[] {
  // Master sayılar köke iner (11→2, 22→4, 33→6) ama kendisi de eklenir.
  const root = lp > 9 ? (lp === 11 ? 2 : lp === 22 ? 4 : 6) : lp;
  const triad = LP_TRIADS.find((t) => t.includes(root)) ?? [root];
  return triad.filter((n) => n !== root);
}

export function buildOutlook(report: GalacticReport): CompatibilityOutlook {
  const sun = report.chart.planets.find((p) => p.name === 'Sun')!.sign;
  const moon = report.chart.planets.find((p) => p.name === 'Moon')!.sign;
  const timeKnown = report.birth.birthTimeKnown !== false;

  const mirror = timeKnown ? shift(report.chart.ascendantSign, 6) : shift(sun, 6);

  // Üçgenler (aynı element): +4 ve +8
  const sacredSet = new Set<ZodiacSign>([
    shift(sun, 4), shift(sun, 8),
    shift(moon, 4), shift(moon, 8),
  ]);
  sacredSet.delete(sun); // kendi burcunu önermeyelim
  sacredSet.delete(mirror); // ayna ile çakışmasın — ayna zaten ayrı kart

  return {
    mirror,
    mirrorSource: timeKnown ? 'ascendant' : 'sun',
    sacred: [...sacredSet].slice(0, 4),
    lesson: [shift(sun, 3), shift(sun, 9)],
    hdAllies: HD_ALLIES[report.humanDesign.type],
    lifePathAllies: lifePathFamily(report.numerology.lifePath),
  };
}
