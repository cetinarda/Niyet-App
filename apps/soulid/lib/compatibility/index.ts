import type { GalacticReport, PlanetName } from '../types';
import { CHANNELS, type HDCenter } from '../human-design/gates';
import {
  getCenterRelationship,
  getCenterTheme,
  getCenterTr,
  channelTheme,
  type Locale,
} from './hd-content';
import { SIGN_NAMES_TR } from '../content/astrology-content';
import { calculateAshtakuta, type AshtakutaResult } from './ashtakuta';

const CENTERS: HDCenter[] = [
  'Head', 'Ajna', 'Throat', 'G', 'Heart', 'SolarPlexus', 'Sacral', 'Spleen', 'Root',
];

const L = {
  tr: {
    bothDefinedPrefix: (theme: string) => `${theme} alanında`,
    aCondB: 'İkisi de tanımlı',
    sharedOpen: 'İkisi de açık',
    titles: {
      companionship: 'Arkadaşlık Kanalı',
      dominance: 'Hâkimiyet (Dominance)',
      electromagnetic: 'Elektromanyetik Çekim',
    },
    sentences: {
      companionship: (channel: string, theme: string) =>
        `İkiniz de ${channel} kanalına (${theme}) sahipsiniz. Bu alanda birbirinize çok benzersiniz — aynı dili konuşur, birlikte rahat edersiniz. Yan yana yürüyen iki benzer enerji.`,
      dominance: (lead: string, follow: string, channel: string, theme: string) =>
        `${lead} ${channel} kanalının tamamına sahip, ${follow} ise yalnızca bir ucuna. Bu temada (${theme}) ${lead} tonu belirler; ${follow} bu enerjiyi onun üzerinden deneyimler. Bilinçli olunca öğretici, değilse bastırıcı olabilir.`,
      electromagnetic: (a: string, b: string, channel: string, theme: string) =>
        `${a} ve ${b} ${channel} kanalının (${theme}) birer ucuna sahip — birlikteyken kanal tamamlanıyor. Bu, klasik "çekim" noktası: yan yana geldiğinizde bu alan canlanır, birbirinizi tetikler ve tamamlarsınız.`,
    },
    aspectFlavor: {
      fusion: 'enerjiler birleşir, yoğun ve birbirinden ayrılamaz bir tema',
      flowing: 'doğal akış, kolaylık ve karşılıklı destek',
      tense: 'sürtünme ve gerilim — ama doğru kullanılınca en çok büyüten bağ',
    },
    aspects: {
      conjunction: 'kavuşum',
      sextile: 'altmışlık (sextile)',
      square: 'kare (square)',
      trine: 'üçgen (trine)',
      opposition: 'karşıtlık (opposition)',
    },
    planet: {
      Sun: 'Güneş', Moon: 'Ay', Mercury: 'Merkür', Venus: 'Venüs', Mars: 'Mars',
      Jupiter: 'Jüpiter', Saturn: 'Satürn', Ascendant: 'Yükselen', NorthNode: 'Kuzey Düğüm',
      Vertex: 'Vertex',
    } as Record<string, string>,
    pairTheme: {
      sunMoon: 'kimlik ve duygusal besleme — klasik ruh eşi göstergesi',
      moonSun: 'duygusal besleme ve kimlik — karşılıklı yuva hissi',
      venusMars: 'romantik ve fiziksel çekim',
      marsVenus: 'tutku ve estetik çekim',
      sunSun: 'temel kimlik ve yaşam yönü uyumu',
      moonMoon: 'duygusal dil ve ev hissi',
      venusVenus: 'sevgi dili ve değer uyumu',
      sunAsc: 'doğal görünürlük ve ilk çekim',
      moonAsc: 'içgüdüsel yakınlık ve rahatlık',
      saturnSun: 'sorumluluk, kalıcılık ve olgunlaştıran bağ',
      nnSun: 'kaderî / büyüten karmik bağ',
      sunNn: 'ortak ruhsal yön ve kader hissi',
      vertexSun: 'kader buluşması — eşin senin kim olduğunu derinden tetikliyor',
      vertexMoon: 'kader buluşması — duygu hafızanda silinmez bir iz bırakıyor',
      vertexVenus: 'kader buluşması — sevgi ve değer üzerinden hatırlatıcı bir bağ',
    },
    numerology: {
      same: (lp: number) => `İkiniz de Yaşam Yolu ${lp}. Aynı temel dersi paylaşıyorsunuz — birbirinizi derinden anlarsınız ama aynı kör noktaları da paylaşırsınız.`,
      harmonious: (a: number, b: number) => `Yaşam Yolu ${a} ve ${b} doğal olarak akan bir kombinasyon. Farklı güçler getirirsiniz ama birbirinizi tamamlarsınız.`,
      near: (a: number, b: number) => `Yaşam Yolu ${a} ve ${b} birbirine yakın enerjiler — çoğu konuda anlaşır, bazen aynılaşmaktan sıkılırsınız.`,
      far: (a: number, b: number) => `Yaşam Yolu ${a} ve ${b} farklı ritimlerde. Çekim güçlü olabilir ama uyum için bilinçli çaba ve saygı gerekir — en çok büyüten ilişkiler bunlardır.`,
    },
    headline: {
      magnetic: (a: string, b: string) => `${a} & ${b}: Manyetik bir uyum`,
      flowing: (a: string, b: string) => `${a} & ${b}: Akan ve besleyen bir bağ`,
      balanced: (a: string, b: string) => `${a} & ${b}: Büyüten, dengeli bir karışım`,
      contrasts: (a: string, b: string) => `${a} & ${b}: Zıtların öğretici dansı`,
    },
  },
  en: {
    bothDefinedPrefix: (theme: string) => `In the area of ${theme},`,
    aCondB: 'Both defined',
    sharedOpen: 'Both open',
    titles: {
      companionship: 'Companionship Channel',
      dominance: 'Dominance',
      electromagnetic: 'Electromagnetic Attraction',
    },
    sentences: {
      companionship: (channel: string, theme: string) =>
        `You both have channel ${channel} (${theme}). You are very alike here — speak the same language, feel comfortable together. Two similar energies walking side by side.`,
      dominance: (lead: string, follow: string, channel: string, theme: string) =>
        `${lead} has the full channel ${channel}, while ${follow} only holds one end. In this theme (${theme}), ${lead} sets the tone; ${follow} experiences this energy through them. With awareness it is teaching; without, it can feel suppressive.`,
      electromagnetic: (a: string, b: string, channel: string, theme: string) =>
        `${a} and ${b} each hold one end of channel ${channel} (${theme}) — together the channel completes. This is the classic point of "attraction": when you come together this area lights up, you trigger and complete each other.`,
    },
    aspectFlavor: {
      fusion: 'energies merge — an intense, inseparable theme',
      flowing: 'natural flow, ease and mutual support',
      tense: 'friction and tension — but when used well, the most growth-driving bond',
    },
    aspects: {
      conjunction: 'conjunction',
      sextile: 'sextile',
      square: 'square',
      trine: 'trine',
      opposition: 'opposition',
    },
    planet: {
      Sun: 'Sun', Moon: 'Moon', Mercury: 'Mercury', Venus: 'Venus', Mars: 'Mars',
      Jupiter: 'Jupiter', Saturn: 'Saturn', Ascendant: 'Rising', NorthNode: 'North Node',
      Vertex: 'Vertex',
    } as Record<string, string>,
    pairTheme: {
      sunMoon: 'identity and emotional nourishment — the classic soul-mate marker',
      moonSun: 'emotional nourishment and identity — a mutual sense of home',
      venusMars: 'romantic and physical attraction',
      marsVenus: 'passion and aesthetic attraction',
      sunSun: 'core identity and life direction alignment',
      moonMoon: 'emotional language and a sense of home',
      venusVenus: 'love language and value alignment',
      sunAsc: 'natural visibility and first attraction',
      moonAsc: 'instinctive closeness and ease',
      saturnSun: 'responsibility, longevity and a maturing bond',
      nnSun: 'a fated, growth-driving karmic bond',
      sunNn: 'a shared spiritual direction and sense of fate',
      vertexSun: 'a fated encounter — they trigger something deep about who you are',
      vertexMoon: 'a fated encounter — leaving an indelible mark on your emotional memory',
      vertexVenus: 'a fated encounter — a remembering bond through love and value',
    },
    numerology: {
      same: (lp: number) => `You both share Life Path ${lp}. You carry the same core lesson — you understand each other deeply, but also share the same blind spots.`,
      harmonious: (a: number, b: number) => `Life Path ${a} and ${b} are a naturally flowing combination. You bring different strengths and complement each other.`,
      near: (a: number, b: number) => `Life Path ${a} and ${b} are close energies — you agree on most things, but can grow tired of feeling alike.`,
      far: (a: number, b: number) => `Life Path ${a} and ${b} move at different rhythms. Attraction can be strong, but harmony requires conscious effort and respect — these are the most growth-driving relationships.`,
    },
    headline: {
      magnetic: (a: string, b: string) => `${a} & ${b}: A magnetic match`,
      flowing: (a: string, b: string) => `${a} & ${b}: A flowing, nourishing bond`,
      balanced: (a: string, b: string) => `${a} & ${b}: A balanced, growth-driving blend`,
      contrasts: (a: string, b: string) => `${a} & ${b}: The teaching dance of opposites`,
    },
  },
} as const;

export type CenterDynamic = {
  center: HDCenter;
  centerTr: string;
  status: 'companionship' | 'a-conditions-b' | 'b-conditions-a' | 'shared-openness';
  statusLabel: string;
  meaning: string;
};

export type ChannelConnection = {
  kind: 'electromagnetic' | 'dominance-a' | 'dominance-b' | 'companionship';
  channel: string;
  theme: string;
  title: string;
  meaning: string;
};

export type AstroAspect = {
  a: string;
  b: string;
  aspect: string;
  flavor: 'flowing' | 'tense' | 'fusion';
  meaning: string;
};

export type CompatibilityResult = {
  nameA: string;
  nameB: string;
  scoreOverall: number;
  scoreHD: number;
  scoreAstro: number;
  scoreNumerology: number;
  /** Vedik Ashtakuta — "Kader" katmanı (4-boyut MVP, 0-100) */
  scoreFate: number;
  hdCenters: CenterDynamic[];
  hdConnections: ChannelConnection[];
  astroAspects: AstroAspect[];
  numerology: { aLifePath: number; bLifePath: number; harmony: string; score: number };
  ashtakuta: AshtakutaResult;
  headline: string;
};

// ---------- HUMAN DESIGN ----------

function centerDynamics(a: GalacticReport, b: GalacticReport, locale: Locale): CenterDynamic[] {
  const aDef = new Set(a.humanDesign.definedCenters as HDCenter[]);
  const bDef = new Set(b.humanDesign.definedCenters as HDCenter[]);
  const out: CenterDynamic[] = [];
  const L_ = L[locale];
  const centerTrMap = getCenterTr(locale);
  const centerThemeMap = getCenterTheme(locale);
  const centerRelMap = getCenterRelationship(locale);

  for (const center of CENTERS) {
    const aHas = aDef.has(center);
    const bHas = bDef.has(center);
    const rel = centerRelMap[center];
    const theme = centerThemeMap[center];

    if (aHas && bHas) {
      out.push({
        center,
        centerTr: centerTrMap[center],
        status: 'companionship',
        statusLabel: L_.aCondB,
        meaning: `${L_.bothDefinedPrefix(theme)} ${rel.bothDefined}`,
      });
    } else if (aHas && !bHas) {
      out.push({
        center,
        centerTr: centerTrMap[center],
        status: 'a-conditions-b',
        statusLabel: `${a.birth.fullName.split(' ')[0]} → ${b.birth.fullName.split(' ')[0]}`,
        meaning: `${L_.bothDefinedPrefix(theme)} ${a.birth.fullName.split(' ')[0]} ${rel.conditions}`,
      });
    } else if (!aHas && bHas) {
      out.push({
        center,
        centerTr: centerTrMap[center],
        status: 'b-conditions-a',
        statusLabel: `${b.birth.fullName.split(' ')[0]} → ${a.birth.fullName.split(' ')[0]}`,
        meaning: `${L_.bothDefinedPrefix(theme)} ${b.birth.fullName.split(' ')[0]} ${rel.conditions}`,
      });
    } else {
      out.push({
        center,
        centerTr: centerTrMap[center],
        status: 'shared-openness',
        statusLabel: L_.sharedOpen,
        meaning: `${L_.bothDefinedPrefix(theme)} ${rel.bothOpen}`,
      });
    }
  }
  return out;
}

function channelConnections(a: GalacticReport, b: GalacticReport, locale: Locale): ChannelConnection[] {
  const aGates = new Set(a.humanDesign.gates);
  const bGates = new Set(b.humanDesign.gates);
  const nameA = a.birth.fullName.split(' ')[0];
  const nameB = b.birth.fullName.split(' ')[0];
  const out: ChannelConnection[] = [];
  const L_ = L[locale];

  for (const { gates, centers } of CHANNELS) {
    const [g1, g2] = gates;
    const aHasG1 = aGates.has(g1);
    const aHasG2 = aGates.has(g2);
    const bHasG1 = bGates.has(g1);
    const bHasG2 = bGates.has(g2);
    const aFull = aHasG1 && aHasG2;
    const bFull = bHasG1 && bHasG2;
    const channel = `${g1}-${g2}`;
    const theme = channelTheme(centers[0], centers[1], locale);

    if (aFull && bFull) {
      out.push({
        kind: 'companionship',
        channel,
        theme,
        title: L_.titles.companionship,
        meaning: L_.sentences.companionship(channel, theme),
      });
    } else if (aFull && (bHasG1 || bHasG2)) {
      out.push({
        kind: 'dominance-a',
        channel,
        theme,
        title: L_.titles.dominance,
        meaning: L_.sentences.dominance(nameA, nameB, channel, theme),
      });
    } else if (bFull && (aHasG1 || aHasG2)) {
      out.push({
        kind: 'dominance-b',
        channel,
        theme,
        title: L_.titles.dominance,
        meaning: L_.sentences.dominance(nameB, nameA, channel, theme),
      });
    } else if ((aHasG1 && bHasG2) || (aHasG2 && bHasG1)) {
      out.push({
        kind: 'electromagnetic',
        channel,
        theme,
        title: L_.titles.electromagnetic,
        meaning: L_.sentences.electromagnetic(nameA, nameB, channel, theme),
      });
    }
  }
  // Elektromanyetik bağları öne al
  return out.sort((x, y) => {
    const order = { electromagnetic: 0, companionship: 1, 'dominance-a': 2, 'dominance-b': 2 };
    return order[x.kind] - order[y.kind];
  });
}

// ---------- ASTROLOJİ SYNASTRY ----------

type AspectDef = { angle: number; orb: number; key: keyof (typeof L)['tr']['aspects']; flavor: AstroAspect['flavor'] };

const ASPECT_DEFS: AspectDef[] = [
  { angle: 0, orb: 8, key: 'conjunction', flavor: 'fusion' },
  { angle: 60, orb: 5, key: 'sextile', flavor: 'flowing' },
  { angle: 90, orb: 6, key: 'square', flavor: 'tense' },
  { angle: 120, orb: 7, key: 'trine', flavor: 'flowing' },
  { angle: 180, orb: 8, key: 'opposition', flavor: 'tense' },
];

function angleDiff(a: number, b: number): number {
  let d = Math.abs(a - b) % 360;
  if (d > 180) d = 360 - d;
  return d;
}

function findAspect(lonA: number, lonB: number): AspectDef | null {
  const d = angleDiff(lonA, lonB);
  for (const asp of ASPECT_DEFS) {
    if (Math.abs(d - asp.angle) <= asp.orb) return asp;
  }
  return null;
}

type PairKey = 'sunMoon' | 'moonSun' | 'venusMars' | 'marsVenus' | 'sunSun' | 'moonMoon' | 'venusVenus' | 'sunAsc' | 'moonAsc' | 'saturnSun' | 'nnSun' | 'sunNn' | 'vertexSun' | 'vertexMoon' | 'vertexVenus';

const SYNASTRY_PAIRS: Array<{ a: PlanetName; b: PlanetName; key: PairKey }> = [
  { a: 'Sun', b: 'Moon', key: 'sunMoon' },
  { a: 'Moon', b: 'Sun', key: 'moonSun' },
  { a: 'Venus', b: 'Mars', key: 'venusMars' },
  { a: 'Mars', b: 'Venus', key: 'marsVenus' },
  { a: 'Sun', b: 'Sun', key: 'sunSun' },
  { a: 'Moon', b: 'Moon', key: 'moonMoon' },
  { a: 'Venus', b: 'Venus', key: 'venusVenus' },
  { a: 'Sun', b: 'Ascendant', key: 'sunAsc' },
  { a: 'Moon', b: 'Ascendant', key: 'moonAsc' },
  { a: 'Saturn', b: 'Sun', key: 'saturnSun' },
  { a: 'NorthNode', b: 'Sun', key: 'nnSun' },
  { a: 'Sun', b: 'NorthNode', key: 'sunNn' },
  // Vertex — synastry kader buluşması göstergeleri (Robert Hand, Astrodienst)
  { a: 'Vertex', b: 'Sun', key: 'vertexSun' },
  { a: 'Vertex', b: 'Moon', key: 'vertexMoon' },
  { a: 'Vertex', b: 'Venus', key: 'vertexVenus' },
];

// Doğum saati bilinmiyorsa saate-bağlı noktalar (Yükselen/Vertex) noon
// varsayımından türer → anlamsız. Bu noktaları synastry'den düş (buildOutlook
// ile tutarlı). Aksi halde sahte "Vertex kader buluşması"/Yükselen açıları çıkar.
const TIME_DEPENDENT_POINTS: PlanetName[] = ['Ascendant', 'Vertex'];
function planetLon(report: GalacticReport, name: PlanetName): number | null {
  if (report.birth.birthTimeKnown === false && TIME_DEPENDENT_POINTS.includes(name)) return null;
  const p = report.chart.planets.find((pl) => pl.name === name);
  return p ? p.longitude : null;
}

function astroAspects(a: GalacticReport, b: GalacticReport, locale: Locale): AstroAspect[] {
  const nameA = a.birth.fullName.split(' ')[0];
  const nameB = b.birth.fullName.split(' ')[0];
  const out: AstroAspect[] = [];
  const seen = new Set<string>();
  const L_ = L[locale];

  for (const pair of SYNASTRY_PAIRS) {
    const lonA = planetLon(a, pair.a);
    const lonB = planetLon(b, pair.b);
    if (lonA == null || lonB == null) continue;
    const asp = findAspect(lonA, lonB);
    if (!asp) continue;
    const dedup = [pair.a, pair.b].sort().join('-') + asp.key;
    if (seen.has(dedup)) continue;
    seen.add(dedup);

    out.push({
      a: `${nameA} ${L_.planet[pair.a] ?? pair.a}`,
      b: `${nameB} ${L_.planet[pair.b] ?? pair.b}`,
      aspect: L_.aspects[asp.key],
      flavor: asp.flavor,
      meaning: `${L_.pairTheme[pair.key]}. ${L_.aspectFlavor[asp.flavor]}.`,
    });
  }
  return out;
}

// ---------- NUMEROLOJİ ----------

function numerologyHarmony(a: number, b: number, locale: Locale): { harmony: string; score: number } {
  const L_ = L[locale];
  if (a === b) return { harmony: L_.numerology.same(a), score: 78 };
  const harmonious: Record<number, number[]> = {
    1: [5, 7, 3], 2: [4, 6, 8], 3: [1, 5, 9, 6], 4: [2, 8, 6],
    5: [1, 3, 7], 6: [2, 3, 9, 4], 7: [1, 5, 11], 8: [2, 4, 22],
    9: [3, 6, 11], 11: [2, 7, 9], 22: [4, 8], 33: [6, 9],
  };
  const aHarm = harmonious[a] ?? [];
  if (aHarm.includes(b)) return { harmony: L_.numerology.harmonious(a, b), score: 82 };
  const diff = Math.abs(a - b);
  if (diff <= 2) return { harmony: L_.numerology.near(a, b), score: 68 };
  return { harmony: L_.numerology.far(a, b), score: 58 };
}

// ---------- SKORLAMA ----------

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function compareReports(a: GalacticReport, b: GalacticReport, locale: Locale = 'tr'): CompatibilityResult {
  const hdCenters = centerDynamics(a, b, locale);
  const hdConnections = channelConnections(a, b, locale);
  const aspects = astroAspects(a, b, locale);
  const num = numerologyHarmony(a.numerology.lifePath, b.numerology.lifePath, locale);

  // HD skoru (Ders katmanı)
  const electro = hdConnections.filter((c) => c.kind === 'electromagnetic').length;
  const companion = hdConnections.filter((c) => c.kind === 'companionship').length;
  const dominance = hdConnections.filter((c) => c.kind.startsWith('dominance')).length;
  const scoreHD = clamp(50 + electro * 9 + companion * 6 - dominance * 1.5);

  // Astro skoru (Kimya katmanı)
  const flowing = aspects.filter((x) => x.flavor === 'flowing').length;
  const fusion = aspects.filter((x) => x.flavor === 'fusion').length;
  const tense = aspects.filter((x) => x.flavor === 'tense').length;
  const scoreAstro = clamp(48 + flowing * 8 + fusion * 7 + tense * 2);

  // Numeroloji (Ritim katmanı)
  const scoreNumerology = num.score;

  // Vedik Ashtakuta (Kader katmanı) — Ay nakshatra'larından
  const ashtakuta = calculateAshtakuta(
    a.systems.vedic.nakshatra.index,
    b.systems.vedic.nakshatra.index,
  );
  const scoreFate = ashtakuta.score;

  // 4 katman ortalaması (Pusula UI katmanı, skor yok)
  const scoreOverall = clamp(
    scoreAstro * 0.3 + scoreHD * 0.3 + scoreNumerology * 0.2 + scoreFate * 0.2,
  );

  const nameA = a.birth.fullName.split(' ')[0];
  const nameB = b.birth.fullName.split(' ')[0];

  const L_ = L[locale];
  let headline: string;
  if (scoreOverall >= 80) headline = L_.headline.magnetic(nameA, nameB);
  else if (scoreOverall >= 65) headline = L_.headline.flowing(nameA, nameB);
  else if (scoreOverall >= 50) headline = L_.headline.balanced(nameA, nameB);
  else headline = L_.headline.contrasts(nameA, nameB);

  return {
    nameA,
    nameB,
    scoreOverall,
    scoreHD,
    scoreAstro,
    scoreNumerology,
    scoreFate,
    ashtakuta,
    hdCenters,
    hdConnections,
    astroAspects: aspects,
    numerology: {
      aLifePath: a.numerology.lifePath,
      bLifePath: b.numerology.lifePath,
      harmony: num.harmony,
      score: num.score,
    },
    headline,
  };
}

export { SIGN_NAMES_TR };
