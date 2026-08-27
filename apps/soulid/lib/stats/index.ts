import type { Chart, HumanDesign, Numerology, ZodiacSign } from '../types';

export type StatKey =
  | 'Güç'
  | 'Sezgi'
  | 'Dayanıklılık'
  | 'Yaratıcılık'
  | 'Şefkat'
  | 'Hız'
  | 'Şifa'
  | 'Manifestasyon'
  | 'Bilgelik'
  | 'Karizma';

export type CharacterStats = Record<StatKey, number>;

const SIGN_GIFTS: Record<ZodiacSign, Partial<Record<StatKey, number>>> = {
  Aries: { 'Güç': 22, 'Hız': 18, 'Karizma': 8 },
  Taurus: { 'Dayanıklılık': 22, 'Manifestasyon': 15, 'Şifa': 10 },
  Gemini: { 'Hız': 22, 'Sezgi': 10, 'Karizma': 14 },
  Cancer: { 'Şefkat': 22, 'Sezgi': 18, 'Şifa': 15 },
  Leo: { 'Karizma': 25, 'Yaratıcılık': 22, 'Güç': 12 },
  Virgo: { 'Şifa': 22, 'Bilgelik': 14, 'Dayanıklılık': 12 },
  Libra: { 'Şefkat': 18, 'Yaratıcılık': 14, 'Karizma': 14 },
  Scorpio: { 'Güç': 18, 'Sezgi': 22, 'Şifa': 18 },
  Sagittarius: { 'Bilgelik': 22, 'Hız': 14, 'Karizma': 12 },
  Capricorn: { 'Dayanıklılık': 25, 'Manifestasyon': 22, 'Bilgelik': 10 },
  Aquarius: { 'Bilgelik': 18, 'Yaratıcılık': 18, 'Sezgi': 12 },
  Pisces: { 'Sezgi': 25, 'Şefkat': 22, 'Şifa': 22 },
};

const HD_GIFTS: Record<HumanDesign['type'], Partial<Record<StatKey, number>>> = {
  Manifestor: { 'Güç': 20, 'Karizma': 10, 'Hız': 8 },
  Generator: { 'Manifestasyon': 18, 'Dayanıklılık': 14, 'Yaratıcılık': 8 },
  ManifestingGenerator: { 'Manifestasyon': 15, 'Hız': 18, 'Yaratıcılık': 10 },
  Projector: { 'Bilgelik': 18, 'Sezgi': 14, 'Karizma': 10 },
  Reflector: { 'Sezgi': 22, 'Şefkat': 14, 'Bilgelik': 10 },
};

const LIFE_PATH_GIFTS: Record<number, Partial<Record<StatKey, number>>> = {
  1: { 'Güç': 12, 'Karizma': 10 },
  2: { 'Şefkat': 12, 'Sezgi': 10 },
  3: { 'Yaratıcılık': 14, 'Karizma': 8 },
  4: { 'Dayanıklılık': 14, 'Manifestasyon': 10 },
  5: { 'Hız': 14, 'Karizma': 8 },
  6: { 'Şefkat': 14, 'Şifa': 10 },
  7: { 'Bilgelik': 16, 'Sezgi': 10 },
  8: { 'Güç': 12, 'Manifestasyon': 14 },
  9: { 'Şefkat': 12, 'Bilgelik': 12 },
  11: { 'Sezgi': 18, 'Bilgelik': 12 },
  22: { 'Manifestasyon': 18, 'Dayanıklılık': 12 },
  33: { 'Şifa': 18, 'Şefkat': 16 },
};

function add(stats: CharacterStats, gifts: Partial<Record<StatKey, number>>) {
  for (const [k, v] of Object.entries(gifts)) {
    stats[k as StatKey] = (stats[k as StatKey] ?? 0) + (v ?? 0);
  }
}

export function calculateStats(
  chart: Chart,
  numerology: Numerology,
  humanDesign: HumanDesign,
): CharacterStats {
  const base: CharacterStats = {
    'Güç': 30,
    'Sezgi': 30,
    'Dayanıklılık': 30,
    'Yaratıcılık': 30,
    'Şefkat': 30,
    'Hız': 30,
    'Şifa': 30,
    'Manifestasyon': 30,
    'Bilgelik': 30,
    'Karizma': 30,
  };

  const sun = chart.planets.find((p) => p.name === 'Sun')!;
  const moon = chart.planets.find((p) => p.name === 'Moon')!;

  add(base, SIGN_GIFTS[sun.sign]);
  add(base, SIGN_GIFTS[moon.sign]);
  add(base, SIGN_GIFTS[chart.ascendantSign]);
  add(base, HD_GIFTS[humanDesign.type]);
  add(base, LIFE_PATH_GIFTS[numerology.lifePath] ?? {});

  // Cap each at 100
  for (const k of Object.keys(base) as StatKey[]) {
    base[k] = Math.min(100, Math.round(base[k]));
  }

  return base;
}

export const STAT_META: Record<StatKey, { glyph: string; color: string; desc: string }> = {
  'Güç': { glyph: '⚔', color: '#ff6b6b', desc: 'Liderlik, irade, harekete geçme cesareti' },
  'Sezgi': { glyph: '◐', color: '#9dd9ff', desc: 'İçsel rehber, sembol okuma, alttan algı' },
  'Dayanıklılık': { glyph: '⛰', color: '#c0a070', desc: 'Sebat, kök salma, uzun soluklu yapı' },
  'Yaratıcılık': { glyph: '✺', color: '#ff7ad9', desc: 'Yeni form üretme, sanat, ifade' },
  'Şefkat': { glyph: '♡', color: '#5bd9a0', desc: 'Empati, kucaklayıcı sevgi, beslenme' },
  'Hız': { glyph: '➤', color: '#f5d061', desc: 'Hızlı kavrayış, esneklik, çoklu görev' },
  'Şifa': { glyph: '✚', color: '#7fffd4', desc: 'Onarım, denge getirme, şifacı el' },
  'Manifestasyon': { glyph: '◈', color: '#f5a261', desc: 'Düşünceyi maddeye çevirme' },
  'Bilgelik': { glyph: '✦', color: '#c79dff', desc: 'Anlam üretme, büyük resmi görme' },
  'Karizma': { glyph: '☉', color: '#f5d061', desc: 'Sahnede parlama, etrafını çekme' },
};
