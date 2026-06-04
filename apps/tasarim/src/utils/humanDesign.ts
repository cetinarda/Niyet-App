import { City, dstOffsetHours } from '../data/cities';
import { CENTERS, CenterKey, CENTER_ORDER } from '../data/centers';
import { CHANNELS, ChannelInfo, findChannel } from '../data/channels';
import { GATES } from '../data/gates';
import { TYPES, HDType } from '../data/types';
import { AUTHORITIES, AuthorityKey } from '../data/authorities';
import { PROFILES, ProfileKey, LINES, LineNumber } from '../data/profiles';
import { allPositions, designJD, julianDay, PlanetPositions } from './ephemeris';

// ---------------------------------------------------------------------------
// HD Çark sırası — Gate 41 → 2°00' Aquarius (ekliptik 302°) noktasından başlar
// ve I-Ching Wen sırasına göre 64 gate ekliptik üzerinde 5.625°lik dilimlere
// yerleşir.
// ---------------------------------------------------------------------------
export const GATE_WHEEL: number[] = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60,
];

const GATE_SIZE = 360 / 64;        // 5.625°
const LINE_SIZE = GATE_SIZE / 6;   // 0.9375°
const COLOR_SIZE = LINE_SIZE / 6;
const TONE_SIZE = COLOR_SIZE / 6;
const BASE_SIZE = TONE_SIZE / 5;

const WHEEL_START = 302; // ekliptik longitude (Aquarius 2°)

export interface GateLine {
  gate: number;
  line: LineNumber;
  color: number;
  tone: number;
  base: number;
}

function norm360(x: number): number {
  let r = x % 360;
  if (r < 0) r += 360;
  return r;
}

export function longitudeToGate(longitude: number): GateLine {
  const offset = norm360(longitude - WHEEL_START);
  const idx = Math.floor(offset / GATE_SIZE);
  const gate = GATE_WHEEL[idx % 64];
  const within = offset - idx * GATE_SIZE;
  const line = (Math.floor(within / LINE_SIZE) + 1) as LineNumber;
  const lineRem = within - (line - 1) * LINE_SIZE;
  const color = Math.floor(lineRem / COLOR_SIZE) + 1;
  const colorRem = lineRem - (color - 1) * COLOR_SIZE;
  const tone = Math.floor(colorRem / TONE_SIZE) + 1;
  const toneRem = colorRem - (tone - 1) * TONE_SIZE;
  const base = Math.floor(toneRem / BASE_SIZE) + 1;
  return { gate, line: Math.min(6, Math.max(1, line)) as LineNumber, color, tone, base };
}

// ---------------------------------------------------------------------------
// Gezegen aktivasyonları
// ---------------------------------------------------------------------------
export type PlanetName =
  | 'sun' | 'earth' | 'moon' | 'northNode' | 'southNode'
  | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn'
  | 'uranus' | 'neptune' | 'pluto';

export interface PlanetActivation {
  planet: PlanetName;
  longitude: number;
  gate: number;
  line: LineNumber;
}

const PLANET_LABELS_TR: Record<PlanetName, string> = {
  sun: 'Güneş ☉',
  earth: 'Dünya ⊕',
  moon: 'Ay ☽',
  northNode: 'Kuzey Düğüm ☊',
  southNode: 'Güney Düğüm ☋',
  mercury: 'Merkür ☿',
  venus: 'Venüs ♀',
  mars: 'Mars ♂',
  jupiter: 'Jüpiter ♃',
  saturn: 'Satürn ♄',
  uranus: 'Uranüs ♅',
  neptune: 'Neptün ♆',
  pluto: 'Plüton ♇',
};

const PLANET_ORDER: PlanetName[] = [
  'sun', 'earth', 'northNode', 'southNode', 'moon',
  'mercury', 'venus', 'mars', 'jupiter', 'saturn',
  'uranus', 'neptune', 'pluto',
];

export function planetLabel(p: PlanetName): string {
  return PLANET_LABELS_TR[p];
}

function activationsFromPositions(pos: PlanetPositions): PlanetActivation[] {
  return PLANET_ORDER.map(p => {
    const lon = pos[p];
    const gl = longitudeToGate(lon);
    return { planet: p, longitude: lon, gate: gl.gate, line: gl.line };
  });
}

// ---------------------------------------------------------------------------
// Birth → UTC JD
// ---------------------------------------------------------------------------
export function birthToJD(
  birthDate: string,        // 'YYYY-MM-DD'
  birthTime: string,        // 'HH:MM'
  city: City,
): number {
  const [y, mo, d] = birthDate.split('-').map(Number);
  const [h, mi] = birthTime.split(':').map(Number);
  // önce city.tz ile UTC'ye çevir, sonra DST düzelt
  const baseUTC = new Date(Date.UTC(y, mo - 1, d, h - city.tz, mi, 0));
  const dst = dstOffsetHours(city, baseUTC);
  const utc = new Date(baseUTC.getTime() - dst * 3600 * 1000);
  return julianDay(utc);
}

// ---------------------------------------------------------------------------
// Tam Human Design grafiği
// ---------------------------------------------------------------------------
export interface HumanDesignChart {
  // hesaplama girdileri
  birthDate: string;
  birthTime: string;
  cityName: string;

  personalityJD: number;
  designJD: number;

  personality: PlanetActivation[];     // bilinçli (siyah)
  design: PlanetActivation[];          // bilinçsiz (kırmızı)

  activeGates: Set<number>;
  personalityGates: Set<number>;
  designGates: Set<number>;

  activeChannels: ChannelInfo[];

  definedCenters: Set<CenterKey>;
  undefinedCenters: Set<CenterKey>;

  type: HDType;
  authority: AuthorityKey;
  profile: ProfileKey;
  definition: 'Tek (Single)' | 'Bölünmüş (Split)' | 'Üçlü Bölünmüş (Triple Split)' | 'Dörtlü Bölünmüş (Quadruple Split)' | 'Tanımsız (No Definition)';
  strategy: string;
  signature: string;
  notSelf: string;
  incarnationCross: string;
}

function computeActiveChannels(activeGates: Set<number>): ChannelInfo[] {
  const out: ChannelInfo[] = [];
  for (const ch of CHANNELS) {
    if (activeGates.has(ch.gates[0]) && activeGates.has(ch.gates[1])) {
      out.push(ch);
    }
  }
  return out;
}

function computeDefinedCenters(channels: ChannelInfo[]): Set<CenterKey> {
  const def = new Set<CenterKey>();
  for (const ch of channels) {
    def.add(ch.centers[0]);
    def.add(ch.centers[1]);
  }
  return def;
}

function computeDefinition(channels: ChannelInfo[], defined: Set<CenterKey>): HumanDesignChart['definition'] {
  if (defined.size === 0) return 'Tanımsız (No Definition)';
  // Connected components üzerinden hesapla
  const adj: Record<string, Set<string>> = {};
  for (const c of defined) adj[c] = new Set();
  for (const ch of channels) {
    const [a, b] = ch.centers;
    adj[a]?.add(b);
    adj[b]?.add(a);
  }
  const seen = new Set<CenterKey>();
  let groups = 0;
  for (const c of defined) {
    if (seen.has(c)) continue;
    groups++;
    const stack: CenterKey[] = [c];
    while (stack.length) {
      const cur = stack.pop()!;
      if (seen.has(cur)) continue;
      seen.add(cur);
      for (const n of adj[cur] || []) stack.push(n as CenterKey);
    }
  }
  if (groups === 1) return 'Tek (Single)';
  if (groups === 2) return 'Bölünmüş (Split)';
  if (groups === 3) return 'Üçlü Bölünmüş (Triple Split)';
  return 'Dörtlü Bölünmüş (Quadruple Split)';
}

function isMotorConnectedToThroat(channels: ChannelInfo[], defined: Set<CenterKey>): boolean {
  // Throat tanımlıysa ve bir motor merkezi (Sacral/Heart/SP/Root) Throat'a
  // doğrudan ya da dolaylı bağlıysa true.
  if (!defined.has('throat')) return false;
  const motors: CenterKey[] = ['sacral', 'heart', 'solarPlexus', 'root'];
  const adj: Record<string, Set<string>> = {};
  for (const c of defined) adj[c] = new Set();
  for (const ch of channels) {
    adj[ch.centers[0]]?.add(ch.centers[1]);
    adj[ch.centers[1]]?.add(ch.centers[0]);
  }
  // BFS Throat'tan
  const seen = new Set<CenterKey>(['throat']);
  const stack: CenterKey[] = ['throat'];
  while (stack.length) {
    const cur = stack.pop()!;
    if (motors.includes(cur)) return true;
    for (const n of adj[cur] || []) {
      if (!seen.has(n as CenterKey)) {
        seen.add(n as CenterKey);
        stack.push(n as CenterKey);
      }
    }
  }
  return false;
}

function computeType(defined: Set<CenterKey>, channels: ChannelInfo[]): HDType {
  if (defined.size === 0) return 'Reflektör';
  const sacralDefined = defined.has('sacral');
  const motorToThroat = isMotorConnectedToThroat(channels, defined);
  if (sacralDefined) {
    if (motorToThroat) return 'Manifesting Jeneratör';
    return 'Jeneratör';
  }
  // Sacral undefined
  if (defined.has('throat')) {
    // Throat'a Sacral DIŞINDA bir motor bağlı mı?
    const motors: CenterKey[] = ['heart', 'solarPlexus', 'root'];
    const adj: Record<string, Set<string>> = {};
    for (const c of defined) adj[c] = new Set();
    for (const ch of channels) {
      adj[ch.centers[0]]?.add(ch.centers[1]);
      adj[ch.centers[1]]?.add(ch.centers[0]);
    }
    const seen = new Set<CenterKey>(['throat']);
    const stack: CenterKey[] = ['throat'];
    while (stack.length) {
      const cur = stack.pop()!;
      if (motors.includes(cur)) return 'Manifestor';
      for (const n of adj[cur] || []) {
        if (!seen.has(n as CenterKey)) {
          seen.add(n as CenterKey);
          stack.push(n as CenterKey);
        }
      }
    }
  }
  return 'Projektör';
}

function computeAuthority(defined: Set<CenterKey>, type: HDType, channels: ChannelInfo[]): AuthorityKey {
  if (type === 'Reflektör') return 'lunar';
  if (defined.has('solarPlexus')) return 'emotional';
  if (defined.has('sacral')) return 'sacral';
  if (defined.has('spleen')) return 'splenic';
  if (defined.has('heart')) return 'ego';
  if (defined.has('g')) {
    // Self-projected: G ↔ Throat doğrudan kanal
    const gThroat = channels.find(c =>
      (c.centers.includes('g') && c.centers.includes('throat'))
    );
    if (gThroat) return 'self-projected';
  }
  // Mental Projektör
  return 'mental';
}

function computeProfile(personality: PlanetActivation[], design: PlanetActivation[]): ProfileKey {
  const p = personality.find(a => a.planet === 'sun')!;
  const d = design.find(a => a.planet === 'sun')!;
  // Her zaman gerçek line/line döndür — PROFILES tablosunda olmayanlar
  // için consumer uygun fallback yapmalı.
  return `${p.line}/${d.line}` as ProfileKey;
}

function computeIncarnationCross(personality: PlanetActivation[], design: PlanetActivation[]): string {
  const pSun = personality.find(a => a.planet === 'sun')!;
  const pEarth = personality.find(a => a.planet === 'earth')!;
  const dSun = design.find(a => a.planet === 'sun')!;
  const dEarth = design.find(a => a.planet === 'earth')!;
  // Ra Uru Hu sınıflaması:
  //   Sağ Açı (Personal Destiny): 1/3, 1/4, 2/4, 2/5, 3/5, 3/6, 4/6
  //   Sol Açı (Transpersonal):    5/1, 5/2, 6/2, 6/3
  //   Yan Yana (Juxtaposition):   4/1
  const profile = `${pSun.line}/${dSun.line}`;
  let angle = 'Sağ Açı';
  if (profile === '4/1') angle = 'Yan Yana (Juxtaposition)';
  else if (['5/1', '5/2', '6/2', '6/3'].includes(profile)) angle = 'Sol Açı';
  return `${angle} Haç — ${pSun.gate}/${pEarth.gate} | ${dSun.gate}/${dEarth.gate}`;
}

export function computeChart(
  birthDate: string,
  birthTime: string,
  city: City,
): HumanDesignChart {
  const pJD = birthToJD(birthDate, birthTime, city);
  const dJD = designJD(pJD);

  const pPos = allPositions(pJD);
  const dPos = allPositions(dJD);

  const personality = activationsFromPositions(pPos);
  const design = activationsFromPositions(dPos);

  const personalityGates = new Set(personality.map(a => a.gate));
  const designGates = new Set(design.map(a => a.gate));
  const activeGates = new Set<number>([...personalityGates, ...designGates]);

  const activeChannels = computeActiveChannels(activeGates);
  const definedCenters = computeDefinedCenters(activeChannels);
  const undefinedCenters = new Set<CenterKey>(
    CENTER_ORDER.filter(c => !definedCenters.has(c))
  );

  const type = computeType(definedCenters, activeChannels);
  const authority = computeAuthority(definedCenters, type, activeChannels);
  const profile = computeProfile(personality, design);
  const definition = computeDefinition(activeChannels, definedCenters);
  const incarnationCross = computeIncarnationCross(personality, design);

  const t = TYPES[type];
  return {
    birthDate, birthTime,
    cityName: city.name,
    personalityJD: pJD,
    designJD: dJD,
    personality,
    design,
    activeGates,
    personalityGates,
    designGates,
    activeChannels,
    definedCenters,
    undefinedCenters,
    type,
    authority,
    profile,
    definition,
    strategy: t.strategy,
    signature: t.signature,
    notSelf: t.notSelf,
    incarnationCross,
  };
}

// ---------------------------------------------------------------------------
// Yardımcı erişimler (UI için)
// ---------------------------------------------------------------------------
export function getActivationsByCenter(chart: HumanDesignChart, center: CenterKey): {
  personality: PlanetActivation[];
  design: PlanetActivation[];
} {
  return {
    personality: chart.personality.filter(a => GATES[a.gate]?.center === center),
    design: chart.design.filter(a => GATES[a.gate]?.center === center),
  };
}

export function getLineInfo(line: LineNumber) {
  return LINES[line];
}

export function getProfileInfo(p: ProfileKey) {
  return PROFILES[p];
}

export function getTypeInfo(t: HDType) {
  return TYPES[t];
}

export function getAuthorityInfo(a: AuthorityKey) {
  return AUTHORITIES[a];
}

export function describeGate(n: number) {
  return GATES[n];
}
