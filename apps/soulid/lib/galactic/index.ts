import type { Chart, Numerology, StarOrigin } from '../types';

type Origin = StarOrigin & { weight: (chart: Chart, num: Numerology) => number };

const ORIGINS: Origin[] = [
  {
    race: 'Pleiadyalı',
    starSystem: 'Pleiades / Ülker Takımyıldızı',
    archetype: 'Kalp şifacısı, sevgi yayıcısı',
    shortName: 'Pleiades',
    emoji: '✨',
    weight: (c, n) =>
      (c.planets.find((p) => p.name === 'Moon')?.sign === 'Cancer' ? 3 : 0) +
      (c.planets.find((p) => p.name === 'Venus')?.sign === 'Pisces' ? 2 : 0) +
      (n.lifePath === 6 ? 3 : 0) +
      (n.lifePath === 33 ? 4 : 0) +
      (n.soulUrge === 2 ? 1 : 0),
  },
  {
    race: 'Siryan',
    starSystem: 'Sirius / Akyıldız Sistemi',
    archetype: 'Bilge öğretmen, kadim sırların taşıyıcısı',
    shortName: 'Sirius',
    emoji: '☥',
    weight: (c, n) =>
      (c.ascendantSign === 'Capricorn' || c.ascendantSign === 'Scorpio' ? 3 : 0) +
      (c.planets.find((p) => p.name === 'Saturn')?.sign === 'Capricorn' ? 2 : 0) +
      (n.lifePath === 7 ? 3 : 0) +
      (n.lifePath === 22 ? 4 : 0),
  },
  {
    race: 'Arkturian',
    starSystem: 'Arcturus / Boğa Çobanı',
    archetype: 'İleri teknoloji mühendisi, geometri ustası',
    shortName: 'Arcturus',
    emoji: '⟁',
    weight: (c, n) =>
      (c.planets.find((p) => p.name === 'Mercury')?.sign === 'Virgo' ? 2 : 0) +
      (c.planets.find((p) => p.name === 'Uranus')?.sign === 'Aquarius' ? 1 : 0) +
      (n.lifePath === 8 ? 2 : 0) +
      (n.lifePath === 1 ? 1 : 0) +
      (c.ascendantSign === 'Aquarius' ? 2 : 0),
  },
  {
    race: 'Andromedan',
    starSystem: 'Andromeda Galaksisi',
    archetype: 'Özgür kâşif, sınır ötesi gezgin',
    shortName: 'Andromeda',
    emoji: '◈',
    weight: (c, n) =>
      (c.ascendantSign === 'Sagittarius' ? 3 : 0) +
      (c.planets.find((p) => p.name === 'Jupiter')?.sign === 'Sagittarius' ? 2 : 0) +
      (n.lifePath === 5 ? 3 : 0) +
      (n.lifePath === 9 ? 1 : 0),
  },
  {
    race: 'Lyran',
    starSystem: 'Lyra Takımyıldızı',
    archetype: 'Aslan ruhu, kurucu yaratıcı',
    shortName: 'Lyra',
    emoji: '☉',
    weight: (c, n) =>
      (c.planets.find((p) => p.name === 'Sun')?.sign === 'Leo' ? 4 : 0) +
      (c.ascendantSign === 'Leo' ? 2 : 0) +
      (n.lifePath === 1 ? 2 : 0) +
      (n.expression === 1 ? 1 : 0),
  },
  {
    race: 'Orion Pasaportlu',
    starSystem: 'Orion Kuşağı',
    archetype: 'Polarite ustası, gölge entegratörü',
    shortName: 'Orion',
    emoji: '✦',
    weight: (c, n) =>
      (c.planets.find((p) => p.name === 'Pluto')?.house === 1 ? 2 : 0) +
      (c.planets.find((p) => p.name === 'Mars')?.sign === 'Scorpio' ? 2 : 0) +
      (n.lifePath === 8 ? 1 : 0) +
      (c.ascendantSign === 'Scorpio' ? 3 : 0),
  },
  {
    race: 'Venüsyen',
    starSystem: 'Venüs (Yüksek Boyut)',
    archetype: 'Aşk ve estetik elçisi',
    shortName: 'Venus',
    emoji: '♀',
    weight: (c, n) =>
      (c.planets.find((p) => p.name === 'Venus')?.sign === 'Libra' ? 3 : 0) +
      (c.planets.find((p) => p.name === 'Venus')?.sign === 'Taurus' ? 3 : 0) +
      (n.soulUrge === 6 ? 2 : 0) +
      (n.lifePath === 3 ? 1 : 0),
  },
  {
    race: 'Hadarian',
    starSystem: 'Beta Centauri / Hadar',
    archetype: 'Koşulsuz sevgi taşıyıcısı, dünyaya sığmayan kalp',
    shortName: 'Hadar',
    emoji: '♡',
    weight: (c, n) =>
      (c.planets.find((p) => p.name === 'Neptune')?.house === 12 ? 2 : 0) +
      (n.lifePath === 2 ? 2 : 0) +
      (n.soulUrge === 11 ? 3 : 0),
  },
  {
    race: 'Mintakan',
    starSystem: 'Mintaka / Orion',
    archetype: 'Su ruhu, kayıp cenneti hatırlayan',
    shortName: 'Mintaka',
    emoji: '≋',
    weight: (c, n) =>
      (c.planets.find((p) => p.name === 'Moon')?.sign === 'Pisces' ? 3 : 0) +
      (c.ascendantSign === 'Pisces' ? 2 : 0) +
      (n.lifePath === 9 ? 2 : 0),
  },
  {
    race: 'Galaktik Federasyon Elçisi',
    starSystem: 'Çoklu Köken',
    archetype: 'Köprü ruh, türler arası çevirmen',
    shortName: 'Federation',
    emoji: '⚯',
    weight: (c, n) =>
      (n.lifePath === 11 ? 4 : 0) + (n.personality === 11 ? 2 : 0) + 1,
  },
];

export function deriveStarOrigin(chart: Chart, numerology: Numerology): StarOrigin {
  let best: Origin = ORIGINS[0]!;
  let bestScore = -Infinity;
  for (const o of ORIGINS) {
    const score = o.weight(chart, numerology);
    if (score > bestScore) {
      bestScore = score;
      best = o;
    }
  }
  return {
    race: best.race,
    starSystem: best.starSystem,
    archetype: best.archetype,
    shortName: best.shortName,
    emoji: best.emoji,
  };
}

export const ALL_STAR_ORIGINS = ORIGINS.map((o) => ({
  race: o.race,
  starSystem: o.starSystem,
  archetype: o.archetype,
  shortName: o.shortName,
  emoji: o.emoji,
}));
