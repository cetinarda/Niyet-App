// "Bugünün Gökyüzü" — bugünkü gezegen konumlarını kişinin NATAL haritasıyla
// kıyaslayan deterministik transit motoru. Her gün değişir → geri gelme sebebi.
// AI yok; klasik açı geometrisi + ev/temaları.

import { Body, EclipticGeoMoon, GeoVector, Ecliptic, MakeTime, MoonPhase, Illumination } from 'astronomy-engine';
import type { GalacticReport } from '../types';

function norm(d: number): number {
  let x = d % 360;
  if (x < 0) x += 360;
  return x;
}

const TRANSIT_BODIES = [
  { key: 'Moon', body: Body.Moon },
  { key: 'Sun', body: Body.Sun },
  { key: 'Mercury', body: Body.Mercury },
  { key: 'Venus', body: Body.Venus },
  { key: 'Mars', body: Body.Mars },
  { key: 'Jupiter', body: Body.Jupiter },
  { key: 'Saturn', body: Body.Saturn },
] as const;

type Trans = { key: string; lon: number };

function transitingLongitudes(date: Date): Trans[] {
  const time = MakeTime(date);
  return TRANSIT_BODIES.map(({ key, body }) => {
    const lon =
      key === 'Moon'
        ? norm(EclipticGeoMoon(time).lon)
        : norm(Ecliptic(GeoVector(body, time, true)).elon);
    return { key, lon };
  });
}

const ASPECTS = [
  { name: 'conj', angle: 0, orb: 6, tone: 'blend' },
  { name: 'sextile', angle: 60, orb: 4, tone: 'flow' },
  { name: 'square', angle: 90, orb: 5, tone: 'tension' },
  { name: 'trine', angle: 120, orb: 5, tone: 'flow' },
  { name: 'opposition', angle: 180, orb: 6, tone: 'tension' },
] as const;

function aspectBetween(a: number, b: number) {
  let diff = Math.abs(norm(a) - norm(b));
  if (diff > 180) diff = 360 - diff;
  for (const asp of ASPECTS) {
    if (Math.abs(diff - asp.angle) <= asp.orb) {
      return { ...asp, exactness: Math.abs(diff - asp.angle) };
    }
  }
  return null;
}

export type TransitInsight = {
  id: string;
  glyph: string;
  title: { tr: string; en: string };
  body: { tr: string; en: string };
  tone: 'flow' | 'tension' | 'blend';
};

// Transit gezegen → tema
const T_THEME: Record<string, { tr: string; en: string; glyph: string }> = {
  Moon: { tr: 'duyguların', en: 'your emotions', glyph: '🌙' },
  Sun: { tr: 'öz kimliğin', en: 'your core self', glyph: '☀️' },
  Mercury: { tr: 'zihnin ve iletişimin', en: 'your mind and words', glyph: '☿' },
  Venus: { tr: 'sevgi ve değerlerin', en: 'love and values', glyph: '♀' },
  Mars: { tr: 'enerjin ve arzun', en: 'your drive and desire', glyph: '♂' },
  Jupiter: { tr: 'şansın ve genişlemen', en: 'luck and expansion', glyph: '♃' },
  Saturn: { tr: 'disiplinin ve sınavların', en: 'discipline and lessons', glyph: '♄' },
};

// Natal hedef → yaşam alanı
const N_TARGET: Record<string, { tr: string; en: string }> = {
  Sun: { tr: 'kimliğine', en: 'your identity' },
  Moon: { tr: 'iç dünyana', en: 'your inner world' },
  Venus: { tr: 'ilişkilerine', en: 'your relationships' },
  Mars: { tr: 'hedeflerine', en: 'your goals' },
  Ascendant: { tr: 'dışa yansıttığın yüzüne', en: 'the face you show the world' },
};

// Transiting Moon'un natal evi → günün odağı
const HOUSE_FOCUS: Record<number, { tr: string; en: string }> = {
  1: { tr: 'kendine ve görünüşüne', en: 'yourself and how you appear' },
  2: { tr: 'para, değer ve güvenliğe', en: 'money, worth and security' },
  3: { tr: 'iletişim, kardeşler ve kısa yolculuklara', en: 'communication and short trips' },
  4: { tr: 'ev, aile ve köklere', en: 'home, family and roots' },
  5: { tr: 'yaratıcılık, aşk ve oyuna', en: 'creativity, romance and play' },
  6: { tr: 'iş, sağlık ve rutinlere', en: 'work, health and routines' },
  7: { tr: 'ilişkiler ve ortaklıklara', en: 'relationships and partnerships' },
  8: { tr: 'derin bağ, dönüşüm ve paylaşıma', en: 'deep bonds and transformation' },
  9: { tr: 'anlam, öğrenme ve uzak ufuklara', en: 'meaning, learning and horizons' },
  10: { tr: 'kariyer ve topluma', en: 'career and public life' },
  11: { tr: 'arkadaşlar, gruplar ve umutlara', en: 'friends, groups and hopes' },
  12: { tr: 'dinlenme, rüya ve içe dönüşe', en: 'rest, dreams and retreat' },
};

function moonHouse(moonLon: number, houses: number[]): number {
  for (let i = 0; i < 12; i++) {
    const start = norm(houses[i]!);
    const end = norm(houses[(i + 1) % 12]!);
    const inHouse = start < end ? moonLon >= start && moonLon < end : moonLon >= start || moonLon < end;
    if (inHouse) return i + 1;
  }
  return 1;
}

export function todayTransits(report: GalacticReport, date: Date = new Date()): TransitInsight[] {
  const trans = transitingLongitudes(date);
  const natal = report.chart.planets;
  const natalLon = (name: string) => natal.find((p) => p.name === name)?.longitude;
  // Doğum saati bilinmiyorsa Yükselen + ev sistemi noon varsayımından türer →
  // "günün odağı: N. ev" ve Yükselen açıları anlamsız olur. Bunları atla.
  const timeKnown = report.birth.birthTimeKnown !== false;

  const targets: { key: string; lon: number }[] = [
    { key: 'Sun', lon: natalLon('Sun') ?? 0 },
    { key: 'Moon', lon: natalLon('Moon') ?? 0 },
    { key: 'Venus', lon: natalLon('Venus') ?? 0 },
    { key: 'Mars', lon: natalLon('Mars') ?? 0 },
    ...(timeKnown ? [{ key: 'Ascendant', lon: report.chart.ascendant }] : []),
  ];

  const insights: TransitInsight[] = [];

  // 1) Günün ana teması — transiting Moon'un natal evi (yalnız saat biliniyorsa)
  if (timeKnown) {
    const tMoon = trans.find((t) => t.key === 'Moon')!;
    const mh = moonHouse(tMoon.lon, report.chart.houses);
    const focus = HOUSE_FOCUS[mh]!;
    insights.push({
      id: `moon-h${mh}`,
      glyph: '🌙',
      title: { tr: 'Günün Odağı', en: "Today's Focus" },
      body: {
        tr: `Bugün Ay senin ${mh}. evinde — dikkatin ${focus.tr} çekiliyor. Bu alanda küçük bir jest bugün büyük hissettirir.`,
        en: `The Moon is in your ${mh}${ord(mh)} house today — your attention turns to ${focus.en}. A small gesture here lands big.`,
      },
      tone: 'blend',
    });
  }

  // 2) En sıkı 2 açı (Moon hariç transiterlar × önemli natal noktalar)
  const found: (TransitInsight & { exact: number })[] = [];
  for (const tr of trans) {
    if (tr.key === 'Moon') continue;
    for (const tg of targets) {
      const asp = aspectBetween(tr.lon, tg.lon);
      if (!asp) continue;
      const theme = T_THEME[tr.key];
      const target = N_TARGET[tg.key];
      if (!theme || !target) continue;
      const flowTr = asp.tone === 'flow'
        ? `${target.tr} akışkan bir destek veriyor — kapıyı zorlamadan aç.`
        : asp.tone === 'tension'
        ? `${target.tr} bir gerilim taşıyor — sürtünme büyütür, kaçma.`
        : `${target.tr} dolaysız değiyor — netlik ânı.`;
      const flowEn = asp.tone === 'flow'
        ? `offers flowing support to ${target.en} — open the door without forcing.`
        : asp.tone === 'tension'
        ? `brings friction to ${target.en} — the tension grows you, don't avoid it.`
        : `touches ${target.en} directly — a moment of clarity.`;
      found.push({
        id: `${tr.key}-${asp.name}-${tg.key}`,
        glyph: theme.glyph,
        title: {
          tr: `${cap(theme.tr)} ${asp.tone === 'tension' ? 'sınanıyor' : 'destekleniyor'}`,
          en: `${cap(theme.en)} ${asp.tone === 'tension' ? 'is tested' : 'is supported'}`,
        },
        body: {
          tr: `Gökyüzünde ${theme.tr} ${flowTr}`,
          en: `In the sky, ${theme.en} ${flowEn}`,
        },
        tone: asp.tone,
        exact: asp.exactness,
      });
    }
  }
  found.sort((a, b) => a.exact - b.exact);
  // Saat bilinmiyorsa ev insight'ı yok → yerine 1 ekstra açı göster (3 toplam).
  for (const f of found.slice(0, timeKnown ? 2 : 3)) {
    const { exact, ...rest } = f;
    void exact;
    insights.push(rest);
  }

  return insights;
}

// ───────── Ay Evresi — sakin, günlük değişen kozmik hava ─────────
// Deterministik (astronomy-engine). "Bugünün Gökyüzü" başlığında gösterilir.
export type MoonPhaseInfo = {
  fraction: number; // 0..1 aydınlanan oran
  waxing: boolean; // büyüyor mu (yeni→dolunay)
  index: number; // 0..7 evre indeksi (günlük söz için)
  name: { tr: string; en: string };
};

const MOON_NAMES: { tr: string; en: string }[] = [
  { tr: 'Yeni Ay', en: 'New Moon' },
  { tr: 'Büyüyen Hilal', en: 'Waxing Crescent' },
  { tr: 'İlk Dördün', en: 'First Quarter' },
  { tr: 'Büyüyen Şişkin Ay', en: 'Waxing Gibbous' },
  { tr: 'Dolunay', en: 'Full Moon' },
  { tr: 'Küçülen Şişkin Ay', en: 'Waning Gibbous' },
  { tr: 'Son Dördün', en: 'Last Quarter' },
  { tr: 'Küçülen Hilal', en: 'Waning Crescent' },
];

export function moonPhase(date: Date = new Date()): MoonPhaseInfo {
  const angle = norm(MoonPhase(date)); // 0=yeni, 90=ilk dördün, 180=dolunay, 270=son dördün
  const fraction = Illumination(Body.Moon, MakeTime(date)).phase_fraction;
  const idx = Math.floor(((angle + 22.5) % 360) / 45); // 0..7
  return { fraction, waxing: angle < 180, index: idx, name: MOON_NAMES[idx] ?? MOON_NAMES[0]! };
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function ord(n: number): string {
  return n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
}

