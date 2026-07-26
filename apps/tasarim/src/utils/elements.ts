// Astrolojik element dağılımı — "Kozmik Ağırlık Yöntemi".
//
// Eşit sayım (her gezegen = 1) yerine profesyonel astrolojinin ağırlıklandırma
// mantığı kullanılır:
//   1. Temel önem ağırlığı  — ışıklar (Güneş/Ay) en ağır, kişisel gezegenler orta,
//      sosyal gezegenler hafif, kuşak (trans-kişisel) gezegenleri çok hafif
//      (bütün bir nesil paylaştığı için karakteri az tanımlar).
//   2. Temel onurlanma (dignity) — kişisel gövdeler yönettiği burçta (domicile)
//      ×1.5, yüceldiği burçta (exaltation) ×1.3 güç kazanır.
//   3. Stellium yoğunlaşması — bir burçta 3+ gövde toplanmışsa o gövdeler ×1.15.
//   4. Kuzey Ay Düğümü (karmik yön) hafif ağırlıkla katılır.
//
// Burç sırası ateş→toprak→hava→su döngüsüdür: element = floor(longitude/30) % 4.
import { allPositions } from './ephemeris';

export type ElementKey = 'ates' | 'toprak' | 'hava' | 'su';

export interface PlanetContribution {
  key: string;       // 'sun' ...
  tr: string;        // 'Güneş'
  glyph: string;     // '☉'
  sign: number;      // 0..11
  signTr: string;    // 'Koç'
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

export const ELEMENT_META: Record<ElementKey, { tr: string; en: string; color: string; glyph: string; desc: string }> = {
  ates:   { tr: 'Ateş',   en: 'Fire',  color: '#E0683C', glyph: '△', desc: 'İtki, cesaret, ilham. Harekete geçiren, ısıtan, başlatan enerji.' },
  toprak: { tr: 'Toprak', en: 'Earth', color: '#6FA86F', glyph: '⊕', desc: 'Beden, güven, somutluk. İnşa eden, sabırla kök salan enerji.' },
  hava:   { tr: 'Hava',   en: 'Air',   color: '#D8C25C', glyph: '○', desc: 'Zihin, iletişim, ilişki. Bağ kuran, fikir taşıyan, esen enerji.' },
  su:     { tr: 'Su',     en: 'Water', color: '#5C9AD8', glyph: '▽', desc: 'Duygu, sezgi, derinlik. Hisseden, akan, bağ kuran enerji.' },
};

const SIGNS_TR = ['Koç', 'Boğa', 'İkizler', 'Yengeç', 'Aslan', 'Başak', 'Terazi', 'Akrep', 'Yay', 'Oğlak', 'Kova', 'Balık'];

const PLANET_TR: Record<string, { tr: string; glyph: string }> = {
  sun:       { tr: 'Güneş',   glyph: '☉' },
  moon:      { tr: 'Ay',      glyph: '☽' },
  mercury:   { tr: 'Merkür',  glyph: '☿' },
  venus:     { tr: 'Venüs',   glyph: '♀' },
  mars:      { tr: 'Mars',    glyph: '♂' },
  jupiter:   { tr: 'Jüpiter', glyph: '♃' },
  saturn:    { tr: 'Satürn',  glyph: '♄' },
  uranus:    { tr: 'Uranüs',  glyph: '♅' },
  neptune:   { tr: 'Neptün',  glyph: '♆' },
  pluto:     { tr: 'Plüton',   glyph: '♇' },
  northNode: { tr: 'K. Ay Düğümü', glyph: '☊' },
};

// Temel önem ağırlıkları
const BASE: Record<string, number> = {
  sun: 3, moon: 3,
  mercury: 2, venus: 2, mars: 2,
  jupiter: 1.3, saturn: 1.3,
  uranus: 0.3, neptune: 0.3, pluto: 1.0,
  northNode: 0.9,
};

// Onurlanma — yalnızca kişisel gövdeler için (kuşak gezegenleri elementi şişirmesin)
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
// YORUM — element dengesini Sakin Tasarım diliyle anlatır. Baskın/destekleyici/
// düşük element sıralamasına ve baskın ikilinin bileşik enerjisine göre üretilir.

const ELEM_CORE: Record<ElementKey, string> = {
  ates:   'yaşam enerjisi, ilham, harekete geçme isteği, öncülük ve içsel tutku',
  toprak: 'pratiklik, beden, istikrar ve somut olanı sabırla inşa etme',
  hava:   'fikirler, öğrenme, iletişim ve farklı perspektifleri görme yeteneği',
  su:     'duygusal hassasiyet, sezgi, derinlik ve bağ kurma',
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

// En düşük elementin gölge/eğilim notu
const SHADOW_NOTE: Record<ElementKey, string> = {
  ates:   'İçsel ateşin düşük olması, kendini başlatmakta ya da enerjiyi sürekli tutmakta zaman zaman zorluk olarak çalışabilir.',
  toprak: 'Toprağın düşük olması, hevesi ve fikri günlük yaşamda topraklamakta/sürdürmekte zorlanma olarak çalışabilir.',
  hava:   'Havanın düşük olması, içsel deneyimi dışarıya anlatmakta veya mesafe alıp objektif bakmakta zorluk olarak çalışabilir.',
  su:     'Suyun düşük olması, yoğun duygusal süreçleri zihinselleştirme veya anlamlandırma eğilimi olarak çalışabilir.',
};

export interface ElementLine { key: ElementKey; pct: number; text: string; }
export interface ElementInterpretation {
  lines: ElementLine[];      // sıralı (yüksekten düşüğe), her birinde anlam + rol cümlesi
  pairTitle: string;         // "Ateş + Hava ≈ %70"
  pairText: string;          // bileşik enerji cümlesi
  shadowText: string;        // en düşük element notu
  headline: string;          // tek satır özet
}

export function elementInterpretation(dist: ElementDistribution): ElementInterpretation {
  const ranked = (['ates', 'toprak', 'hava', 'su'] as ElementKey[])
    .map((k) => ({ k, v: dist[k] }))
    .sort((a, b) => b.v - a.v);

  const lines: ElementLine[] = ranked.map((r, i) => {
    const pct = Math.round(r.v * 100);
    let role: string;
    if (i === 0) role = 'baskın.';
    else if (i === 1) role = 'destekleyici.';
    else if (i === 2) role = 'mevcut ama temel motivasyonun değil.';
    else role = 'var, ancak karar mekanizmanın merkezinde değil.';
    return { key: r.k, pct, text: `${ELEM_CORE[r.k]} — ${role}` };
  });

  const a = ranked[0].k, b = ranked[1].k;
  const pairPct = Math.round((ranked[0].v + ranked[1].v) * 100);
  const pairKey = [a, b].sort().join('+');
  const theme = PAIR_THEME[pairKey] || 'kendine özgü bir denge';
  const pairTitle = `${ELEMENT_META[a].tr} + ${ELEMENT_META[b].tr} ≈ %${pairPct}`;
  const pairText = `Yaşam enerjin daha çok ${theme} üzerinden akıyor.`;

  const lowest = ranked[ranked.length - 1].k;
  const headline = `${ELEMENT_META[ranked[0].k].tr} baskın bir tasarımsın; ${ELEMENT_META[a].tr.toLocaleLowerCase('tr')} ve ${ELEMENT_META[b].tr.toLocaleLowerCase('tr')} birlikte enerjinin omurgasını kuruyor.`;

  return { lines, pairTitle, pairText, shadowText: SHADOW_NOTE[lowest], headline };
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

  // Stellium tespiti — burç başına gövde sayısı
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
      key: b.key, tr: meta.tr, glyph: meta.glyph,
      sign: s, signTr: SIGNS_TR[s], element: el,
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
