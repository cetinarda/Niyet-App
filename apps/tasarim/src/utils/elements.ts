// Astrolojik element dağılımı — natal 10 klasik gezegenin (Güneş..Pluto) burç
// elementlerine göre yüzdesi. Burç sırası ateş→toprak→hava→su döngüsüdür, yani
// element = floor(longitude / 30) % 4.
import { allPositions } from './ephemeris';

export type ElementKey = 'ates' | 'toprak' | 'hava' | 'su';

export interface ElementDistribution {
  ates: number;   // 0..1
  toprak: number;
  hava: number;
  su: number;
  counts: { ates: number; toprak: number; hava: number; su: number };
  total: number;
}

const ORDER: ElementKey[] = ['ates', 'toprak', 'hava', 'su'];

export const ELEMENT_META: Record<ElementKey, { tr: string; en: string; color: string; glyph: string }> = {
  ates:   { tr: 'Ateş',   en: 'Fire',  color: '#E0683C', glyph: '△' },
  toprak: { tr: 'Toprak', en: 'Earth', color: '#6FA86F', glyph: '⊕' },
  hava:   { tr: 'Hava',   en: 'Air',   color: '#D8C25C', glyph: '○' },
  su:     { tr: 'Su',     en: 'Water', color: '#5C9AD8', glyph: '▽' },
};

export function elementDistribution(personalityJD: number): ElementDistribution {
  const pos = allPositions(personalityJD);
  // Klasik 10 gezegen (HD'ye özel earth/node'lar element dengesini bozmasın diye hariç)
  const planets = [pos.sun, pos.moon, pos.mercury, pos.venus, pos.mars, pos.jupiter, pos.saturn, pos.uranus, pos.neptune, pos.pluto];
  const counts = { ates: 0, toprak: 0, hava: 0, su: 0 };
  planets.forEach((lon) => {
    const idx = ((Math.floor(lon / 30) % 4) + 4) % 4;
    counts[ORDER[idx]]++;
  });
  const total = planets.length;
  return {
    ates: counts.ates / total,
    toprak: counts.toprak / total,
    hava: counts.hava / total,
    su: counts.su / total,
    counts,
    total,
  };
}
