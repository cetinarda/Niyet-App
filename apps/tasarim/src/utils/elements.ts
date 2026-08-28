// Astrolojik element dağılımı: "Kozmik Ağırlık Yöntemi".
//
// Eşit sayım (her gezegen = 1) yerine profesyonel astrolojinin ağırlıklandırma
// mantığı kullanılır:
//   1. Temel önem ağırlığı: ışıklar (Güneş/Ay) en ağır, kişisel gezegenler orta,
//      sosyal gezegenler hafif, kuşak (trans-kişisel) gezegenleri çok hafif
//      (bütün bir nesil paylaştığı için karakteri az tanımlar).
//   2. Temel onurlanma (dignity): kişisel gövdeler yönettiği burçta (domicile)
//      ×1.5, yüceldiği burçta (exaltation) ×1.3 güç kazanır.
//   3. Stellium yoğunlaşması: bir burçta 3+ gövde toplanmışsa o gövdeler ×1.15.
//   4. Kuzey Ay Düğümü (karmik yön) hafif ağırlıkla katılır.
//
// Burç sırası ateş→toprak→hava→su döngüsüdür: element = floor(longitude/30) % 4.
import { allPositions } from './ephemeris';
import { getLang } from '../i18n';

export type ElementKey = 'ates' | 'toprak' | 'hava' | 'su';

export interface PlanetContribution {
  key: string;       // 'sun' ...
  tr: string;        // 'Güneş'
  en: string;        // 'Sun'
  glyph: string;     // '☉'
  sign: number;      // 0..11
  signTr: string;    // 'Koç'
  signEn: string;    // 'Aries'
  element: ElementKey;
  weight: number;    // nihai ağırlık (onurlanma+stellium uygulanmış)
  dignity?: 'yonetici' | 'yucelme'; // varsa rozet
}

export interface ElementDistribution {
  ates: number;   // 0..1
  toprak: number;
  hava: number;
  su: number;
  counts: { ates: number; toprak: number; hava: number; su: number }; // ham gövde sayısı
  weights: { ates: number; toprak: number; hava: number; su: number }; // ağırlık toplamı
  total: number;          // gövde sayısı
  totalWeight: number;    // ağırlık toplamı
  contributions: PlanetContribution[];
}

const ORDER: ElementKey[] = ['ates', 'toprak', 'hava', 'su'];

export const ELEMENT_META: Record<ElementKey, { tr: string; en: string; color: string; glyph: string; desc: string; descEn: string }> = {
  ates:   { tr: 'Ateş',   en: 'Fire',  color: '#E0683C', glyph: '△', desc: 'İtki, cesaret, ilham. Harekete geçiren, ısıtan, başlatan enerji.', descEn: 'Drive, courage, inspiration. The energy that moves, warms and begins.' },
  toprak: { tr: 'Toprak', en: 'Earth', color: '#6FA86F', glyph: '⊕', desc: 'Beden, güven, somutluk. İnşa eden, sabırla kök salan enerji.', descEn: 'Body, safety, substance. The energy that builds and patiently takes root.' },
  hava:   { tr: 'Hava',   en: 'Air',   color: '#D8C25C', glyph: '○', desc: 'Zihin, iletişim, ilişki. Bağ kuran, fikir taşıyan, esen enerji.', descEn: 'Mind, communication, connection. The energy that links, carries ideas and moves like a breeze.' },
  su:     { tr: 'Su',     en: 'Water', color: '#5C9AD8', glyph: '▽', desc: 'Duygu, sezgi, derinlik. Hisseden, akan, bağ kuran enerji.', descEn: 'Emotion, intuition, depth. The energy that feels, flows and bonds.' },
};

// Element açıklaması: dile göre.
export function elementDesc(k: ElementKey): string {
  return getLang() === 'en' ? ELEMENT_META[k].descEn : ELEMENT_META[k].desc;
}

// Element adı: dile göre.
export function elementName(k: ElementKey): string {
  return getLang() === 'en' ? ELEMENT_META[k].en : ELEMENT_META[k].tr;
}

const SIGNS_TR = ['Koç', 'Boğa', 'İkizler', 'Yengeç', 'Aslan', 'Başak', 'Terazi', 'Akrep', 'Yay', 'Oğlak', 'Kova', 'Balık'];
const SIGNS_EN = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

const PLANET_TR: Record<string, { tr: string; en: string; glyph: string }> = {
  sun:       { tr: 'Güneş',   en: 'Sun',     glyph: '☉' },
  moon:      { tr: 'Ay',      en: 'Moon',    glyph: '☽' },
  mercury:   { tr: 'Merkür',  en: 'Mercury', glyph: '☿' },
  venus:     { tr: 'Venüs',   en: 'Venus',   glyph: '♀' },
  mars:      { tr: 'Mars',    en: 'Mars',    glyph: '♂' },
  jupiter:   { tr: 'Jüpiter', en: 'Jupiter', glyph: '♃' },
  saturn:    { tr: 'Satürn',  en: 'Saturn',  glyph: '♄' },
  uranus:    { tr: 'Uranüs',  en: 'Uranus',  glyph: '♅' },
  neptune:   { tr: 'Neptün',  en: 'Neptune', glyph: '♆' },
  pluto:     { tr: 'Plüton',  en: 'Pluto',   glyph: '♇' },
  northNode: { tr: 'K. Ay Düğümü', en: 'N. Node', glyph: '☊' },
};

// Temel önem ağırlıkları
const BASE: Record<string, number> = {
  sun: 3, moon: 3,
  mercury: 2, venus: 2, mars: 2,
  jupiter: 1.3, saturn: 1.3,
  uranus: 0.3, neptune: 0.3, pluto: 1.0,
  northNode: 0.9,
};

// Onurlanma: yalnızca kişisel gövdeler için (kuşak gezegenleri elementi şişirmesin)
const DIGNIFY = new Set(['sun', 'moon', 'mercury', 'venus', 'mars']);
// Yönettiği burç(lar) (modern + geleneksel)
const DOMICILE: Record<string, number[]> = {
  sun: [4], moon: [3], mercury: [2, 5], venus: [1, 6], mars: [0, 7],
};
// Yüceldiği burç
const EXALT: Record<string, number> = {
  sun: 0, moon: 1, mercury: 5, venus: 11, mars: 9,
};

function signOf(lon: number): number {
  return Math.floor((((lon % 360) + 360) % 360) / 30);
}

// ─────────────────────────────────────────────────────────────────────────────
// YORUM: element dengesini Sakin Tasarım diliyle anlatır. Baskın/destekleyici/
// düşük element sıralamasına ve baskın ikilinin bileşik enerjisine göre üretilir.

const ELEM_CORE: Record<ElementKey, string> = {
  ates:   'yaşam enerjisi, ilham, harekete geçme isteği, öncülük ve içsel tutku',
  toprak: 'pratiklik, beden, istikrar ve somut olanı sabırla inşa etme',
  hava:   'fikirler, öğrenme, iletişim ve farklı perspektifleri görme yeteneği',
  su:     'duygusal hassasiyet, sezgi, derinlik ve bağ kurma',
};

const ELEM_CORE_EN: Record<ElementKey, string> = {
  ates:   'life force, inspiration, the urge to act, initiative and inner passion',
  toprak: 'practicality, the body, stability and patiently building what is tangible',
  hava:   'ideas, learning, communication and the ability to see different perspectives',
  su:     'emotional sensitivity, intuition, depth and forming bonds',
};

// Baskın ikilinin (ilk iki element) bileşik enerji teması
const PAIR_THEME: Record<string, string> = {
  'ates+hava':   'ilham almak, keşfetmek, öğretmek, üretmek ve anlam aramak',
  'ates+toprak': 'vizyonu somut işe çevirmek, harekete geçmek ve dayanıklı üretim',
  'ates+su':     'tutku ile sezgiyi birleştirmek, ilhamla hissetmek ve yaratıcı ifade',
  'hava+toprak': 'fikirleri pratiğe dökmek, planlamak ve işleyen sistemler kurmak',
  'su+toprak':   'şefkatle inşa etmek, güven ve bakım, köklü duygusal istikrar',
  'hava+su':     'duyguyu kelimelerle anlamlandırmak, empati ve derin iletişim',
};

const PAIR_THEME_EN: Record<string, string> = {
  'ates+hava':   'being inspired, exploring, teaching, creating and searching for meaning',
  'ates+toprak': 'turning vision into tangible work, taking action and building things that last',
  'ates+su':     'combining passion with intuition, feeling your way through inspiration and creative expression',
  'hava+toprak': 'putting ideas into practice, planning and building systems that work',
  'su+toprak':   'building with care, trust and tenderness, and deep-rooted emotional stability',
  'hava+su':     'making sense of emotion through words, empathy and deep communication',
};

// En düşük elementin gölge/eğilim notu
const SHADOW_NOTE: Record<ElementKey, string> = {
  ates:   'İçsel ateşin düşük olması, kendini başlatmakta ya da enerjiyi sürekli tutmakta zaman zaman zorluk olarak çalışabilir.',
  toprak: 'Toprağın düşük olması, hevesi ve fikri günlük yaşamda topraklamakta/sürdürmekte zorlanma olarak çalışabilir.',
  hava:   'Havanın düşük olması, içsel deneyimi dışarıya anlatmakta veya mesafe alıp objektif bakmakta zorluk olarak çalışabilir.',
  su:     'Suyun düşük olması, yoğun duygusal süreçleri zihinselleştirme veya anlamlandırma eğilimi olarak çalışabilir.',
};

const SHADOW_NOTE_EN: Record<ElementKey, string> = {
  ates:   'A low Fire can show up as occasional difficulty getting yourself started, or keeping your energy going once you have.',
  toprak: 'A low Earth can show up as difficulty grounding and sustaining your enthusiasm and ideas in daily life.',
  hava:   'A low Air can show up as difficulty putting your inner experience into words, or stepping back to look at it objectively.',
  su:     'A low Water can show up as a tendency to mentalise or rationalise intense emotional processes.',
};

// "a Fire-dominant" / "an Earth-dominant"
function article(word: string): string {
  return 'AEIOU'.includes(word.charAt(0).toUpperCase()) ? 'an' : 'a';
}

export interface ElementLine { key: ElementKey; pct: number; text: string; }
export interface ElementInterpretation {
  lines: ElementLine[];      // sıralı (yüksekten düşüğe), her birinde anlam + rol cümlesi
  pairTitle: string;         // "Ateş + Hava ≈ %70"
  pairText: string;          // bileşik enerji cümlesi
  shadowText: string;        // en düşük element notu
  headline: string;          // tek satır özet
}

export function elementInterpretation(dist: ElementDistribution): ElementInterpretation {
  const en = getLang() === 'en';
  const ranked = (['ates', 'toprak', 'hava', 'su'] as ElementKey[])
    .map((k) => ({ k, v: dist[k] }))
    .sort((a, b) => b.v - a.v);

  const lines: ElementLine[] = ranked.map((r, i) => {
    const pct = Math.round(r.v * 100);
    let role: string;
    if (en) {
      if (i === 0) role = 'dominant.';
      else if (i === 1) role = 'supporting.';
      else if (i === 2) role = 'present, but not your core motivation.';
      else role = 'present, but not at the centre of how you decide.';
    } else {
      if (i === 0) role = 'baskın.';
      else if (i === 1) role = 'destekleyici.';
      else if (i === 2) role = 'mevcut ama temel motivasyonun değil.';
      else role = 'var, ancak karar mekanizmanın merkezinde değil.';
    }
    const core = en ? ELEM_CORE_EN[r.k] : ELEM_CORE[r.k];
    return { key: r.k, pct, text: `${core}: ${role}` };
  });

  const a = ranked[0].k, b = ranked[1].k;
  const pairPct = Math.round((ranked[0].v + ranked[1].v) * 100);
  const pairKey = [a, b].sort().join('+');
  const theme = en
    ? (PAIR_THEME_EN[pairKey] || 'a balance all your own')
    : (PAIR_THEME[pairKey] || 'kendine özgü bir denge');
  const pairTitle = en
    ? `${ELEMENT_META[a].en} + ${ELEMENT_META[b].en} ≈ ${pairPct}%`
    : `${ELEMENT_META[a].tr} + ${ELEMENT_META[b].tr} ≈ %${pairPct}`;
  const pairText = en
    ? `Your life energy flows mostly through ${theme}.`
    : `Yaşam enerjin daha çok ${theme} üzerinden akıyor.`;

  const lowest = ranked[ranked.length - 1].k;
  const top = ELEMENT_META[ranked[0].k];
  const headline = en
    ? `You are ${article(top.en)} ${top.en}-dominant design; ${ELEMENT_META[a].en.toLowerCase()} and ${ELEMENT_META[b].en.toLowerCase()} together form the backbone of your energy.`
    : `${top.tr} baskın bir tasarımsın; ${ELEMENT_META[a].tr.toLocaleLowerCase('tr')} ve ${ELEMENT_META[b].tr.toLocaleLowerCase('tr')} birlikte enerjinin omurgasını kuruyor.`;

  const shadowText = en ? SHADOW_NOTE_EN[lowest] : SHADOW_NOTE[lowest];

  return { lines, pairTitle, pairText, shadowText, headline };
}

export function elementDistribution(personalityJD: number): ElementDistribution {
  const pos = allPositions(personalityJD);
  // 10 klasik gezegen + Kuzey Ay Düğümü (HD'ye özgü earth/southNode hariç)
  const bodies: { key: string; lon: number }[] = [
    { key: 'sun', lon: pos.sun },
    { key: 'moon', lon: pos.moon },
    { key: 'mercury', lon: pos.mercury },
    { key: 'venus', lon: pos.venus },
    { key: 'mars', lon: pos.mars },
    { key: 'jupiter', lon: pos.jupiter },
    { key: 'saturn', lon: pos.saturn },
    { key: 'uranus', lon: pos.uranus },
    { key: 'neptune', lon: pos.neptune },
    { key: 'pluto', lon: pos.pluto },
    { key: 'northNode', lon: pos.northNode },
  ];

  // Stellium tespiti: burç başına gövde sayısı
  const signCount: Record<number, number> = {};
  bodies.forEach((b) => { const s = signOf(b.lon); signCount[s] = (signCount[s] || 0) + 1; });

  const counts = { ates: 0, toprak: 0, hava: 0, su: 0 };
  const weights = { ates: 0, toprak: 0, hava: 0, su: 0 };
  const contributions: PlanetContribution[] = [];

  bodies.forEach((b) => {
    const s = signOf(b.lon);
    const el = ORDER[s % 4];
    let w = BASE[b.key] || 0;
    let dignity: 'yonetici' | 'yucelme' | undefined;
    if (DIGNIFY.has(b.key)) {
      if (DOMICILE[b.key] && DOMICILE[b.key].includes(s)) { w *= 1.5; dignity = 'yonetici'; }
      else if (EXALT[b.key] === s) { w *= 1.3; dignity = 'yucelme'; }
      if (signCount[s] >= 3) w *= 1.15;
    }
    counts[el]++;
    weights[el] += w;
    const meta = PLANET_TR[b.key];
    contributions.push({
      key: b.key, tr: meta.tr, en: meta.en, glyph: meta.glyph,
      sign: s, signTr: SIGNS_TR[s], signEn: SIGNS_EN[s], element: el,
      weight: Math.round(w * 100) / 100, dignity,
    });
  });

  const totalWeight = weights.ates + weights.toprak + weights.hava + weights.su || 1;
  return {
    ates: weights.ates / totalWeight,
    toprak: weights.toprak / totalWeight,
    hava: weights.hava / totalWeight,
    su: weights.su / totalWeight,
    counts,
    weights,
    total: bodies.length,
    totalWeight: Math.round(totalWeight * 100) / 100,
    contributions,
  };
}
