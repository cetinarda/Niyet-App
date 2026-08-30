import type { Chart, HumanDesign } from '../types';
import {
  Body,
  EclipticGeoMoon,
  GeoVector,
  Ecliptic,
  SunPosition,
  SearchSunLongitude,
} from 'astronomy-engine';
import { CHANNELS, GATE_WHEEL, WHEEL_START, GATE_TO_CENTER, type HDCenter } from './gates';

const CENTERS: HDCenter[] = [
  'Head', 'Ajna', 'Throat', 'G', 'Heart',
  'SolarPlexus', 'Sacral', 'Spleen', 'Root',
];

const GATE_SIZE = 360 / 64; // 5.625 degrees

function norm360(x: number): number {
  let r = x % 360;
  if (r < 0) r += 360;
  return r;
}

export function longitudeToGate(longitude: number): { gate: number; line: number } {
  const offset = norm360(longitude - WHEEL_START);
  const idx = Math.floor(offset / GATE_SIZE);
  const gate = GATE_WHEEL[idx % 64]!;
  const within = offset - idx * GATE_SIZE;
  const line = Math.min(6, Math.max(1, Math.floor(within / (GATE_SIZE / 6)) + 1));
  return { gate, line };
}

// ---------------------------------------------------------------------------
// Ephemeris helpers (matching Tasarim + hd-natal.js)
// ---------------------------------------------------------------------------

const jdFromDate = (d: Date): number => d.getTime() / 86400000 + 2440587.5;
const dateFromJD = (jd: number): Date => new Date((jd - 2440587.5) * 86400000);

function sunLongitude(jd: number): number {
  return norm360(SunPosition(dateFromJD(jd)).elon);
}

function nodeLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  return norm360(125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000);
}

function designJD(birthJD: number): number {
  const target = norm360(sunLongitude(birthJD) - 88);
  try {
    const found = SearchSunLongitude(target, dateFromJD(birthJD - 90), 10);
    if (found && found.date) return jdFromDate(found.date);
  } catch { /* fallback */ }
  let jd = birthJD - 88;
  for (let i = 0; i < 12; i++) {
    const diff = norm360(sunLongitude(jd) - target + 180) - 180;
    jd -= diff / 0.9856;
    if (Math.abs(diff) < 0.0001) break;
  }
  return jd;
}

const PLANET_BODIES = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'] as const;

interface Activation {
  planet: string;
  gate: number;
  line: number;
}

function activationsAtJD(jd: number): Activation[] {
  const at = dateFromJD(jd);
  const out: Activation[] = [];
  const push = (planet: string, lon: number) => {
    if (typeof lon !== 'number' || Number.isNaN(lon)) return;
    out.push({ planet, ...longitudeToGate(norm360(lon)) });
  };
  let sun: number;
  try { sun = norm360(SunPosition(at).elon); } catch { return out; }
  push('sun', sun);
  push('earth', sun + 180);
  try { push('moon', EclipticGeoMoon(at).lon); } catch { /* skip */ }
  const nn = nodeLongitude(jd);
  push('northNode', nn);
  push('southNode', nn + 180);
  for (const p of PLANET_BODIES) {
    try {
      push(p, Ecliptic(GeoVector(Body[p], at, true)).elon);
    } catch { /* skip */ }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Graph traversal for motor-to-throat connectivity (BFS)
// ---------------------------------------------------------------------------

type ChannelInfo = (typeof CHANNELS)[number];

function buildAdjacency(channels: ChannelInfo[]): Record<string, Set<string>> {
  const adj: Record<string, Set<string>> = {};
  for (const ch of channels) {
    const [a, b] = ch.centers;
    if (!adj[a]) adj[a] = new Set();
    if (!adj[b]) adj[b] = new Set();
    adj[a].add(b);
    adj[b].add(a);
  }
  return adj;
}

function reachesMotor(adj: Record<string, Set<string>>, motors: string[]): boolean {
  if (!adj['Throat']) return false;
  const seen = new Set<string>(['Throat']);
  const stack: string[] = ['Throat'];
  while (stack.length) {
    const cur = stack.pop()!;
    if (motors.includes(cur)) return true;
    for (const n of adj[cur] || []) {
      if (!seen.has(n)) { seen.add(n); stack.push(n); }
    }
  }
  return false;
}

function computeType(defined: Set<HDCenter>, channels: ChannelInfo[]): HumanDesign['type'] {
  if (defined.size === 0) return 'Reflector';
  const adj = buildAdjacency(channels);
  if (defined.has('Sacral')) {
    return reachesMotor(adj, ['Sacral', 'Heart', 'SolarPlexus', 'Root'])
      ? 'ManifestingGenerator' : 'Generator';
  }
  if (defined.has('Throat') && reachesMotor(adj, ['Heart', 'SolarPlexus', 'Root'])) {
    return 'Manifestor';
  }
  return 'Projector';
}

function computeAuthority(defined: Set<HDCenter>, type: HumanDesign['type'], channels: ChannelInfo[]): string {
  if (type === 'Reflector') return 'Ay Dongusu Otoritesi (Lunar)';
  if (defined.has('SolarPlexus')) return 'Duygusal Otorite (Solar Plexus)';
  if (defined.has('Sacral')) return 'Sakral Otorite';
  if (defined.has('Spleen')) return 'Splenik Otorite (Sezgi)';
  if (defined.has('Heart')) return 'Ego Otoritesi';
  if (defined.has('G') && defined.has('Throat')) {
    const gThroat = channels.find(c =>
      c.centers.includes('G') && c.centers.includes('Throat')
    );
    if (gThroat) return 'Kendini Yansitan Otorite';
  }
  return 'Mental Yansitici (Cevre)';
}

function strategyOf(type: HumanDesign['type']): string {
  switch (type) {
    case 'Manifestor': return 'Bilgilendir & Baslat';
    case 'Generator': return 'Yanit Vermeyi Bekle';
    case 'ManifestingGenerator': return 'Yanitla ve Hizla Bilgilendir';
    case 'Projector': return 'Davet Bekle ve Tanin';
    case 'Reflector': return 'Ay Dongusunu Bekle';
  }
}

function profileLines(personalitySunLine: number, designSunLine: number): string {
  const profile = `${personalitySunLine}/${designSunLine}`;
  const map: Record<string, string> = {
    '1/3': '1/3 Arastirmaci-Sehit',
    '1/4': '1/4 Arastirmaci-Arkadas',
    '2/4': '2/4 Munzevi-Arkadas',
    '2/5': '2/5 Munzevi-Heretik',
    '3/5': '3/5 Sehit-Heretik',
    '3/6': '3/6 Sehit-Rol Modeli',
    '4/6': '4/6 Arkadas-Rol Modeli',
    '4/1': '4/1 Arkadas-Arastirmaci',
    '5/1': '5/1 Heretik-Arastirmaci',
    '5/2': '5/2 Heretik-Munzevi',
    '6/2': '6/2 Rol Modeli-Munzevi',
    '6/3': '6/3 Rol Modeli-Sehit',
  };
  return map[profile] ?? `${profile} Profil`;
}

export function calculateHumanDesign(chart: Chart, birthISO: string): HumanDesign {
  const birthDate = new Date(birthISO);
  const pJD = jdFromDate(birthDate);
  const dJD = designJD(pJD);

  const personality = activationsAtJD(pJD);
  const design = activationsAtJD(dJD);

  const personalityGates = new Set(personality.map(a => a.gate));
  const designGates = new Set(design.map(a => a.gate));
  const activatedGates = new Set<number>([...personalityGates, ...designGates]);

  const activeChannels = CHANNELS.filter(
    ch => activatedGates.has(ch.gates[0]) && activatedGates.has(ch.gates[1])
  );

  const defined = new Set<HDCenter>();
  for (const ch of activeChannels) {
    defined.add(ch.centers[0]);
    defined.add(ch.centers[1]);
  }

  const type = computeType(defined, activeChannels);
  const authority = computeAuthority(defined, type, activeChannels);
  const strategy = strategyOf(type);

  const pSun = personality.find(a => a.planet === 'sun');
  const dSun = design.find(a => a.planet === 'sun');
  const pEarth = personality.find(a => a.planet === 'earth');
  const dEarth = design.find(a => a.planet === 'earth');

  const profile = profileLines(pSun?.line ?? 1, dSun?.line ?? 1);

  let incarnationCross = '';
  if (pSun && pEarth && dSun && dEarth) {
    const prof = `${pSun.line}/${dSun.line}`;
    let angle = 'Sag Aci';
    if (prof === '4/1') angle = 'Yan Yana (Juxtaposition)';
    else if (['5/1', '5/2', '6/2', '6/3'].includes(prof)) angle = 'Sol Aci';
    incarnationCross = `${angle} Hac: ${pSun.gate}/${pEarth.gate} | ${dSun.gate}/${dEarth.gate}`;
  }

  const openCenters = CENTERS.filter(c => !defined.has(c));

  return {
    type,
    strategy,
    authority,
    profile,
    incarnationCross,
    definedCenters: Array.from(defined),
    openCenters,
    gates: Array.from(activatedGates).sort((a, b) => a - b),
    channels: activeChannels.map(ch => `${ch.gates[0]}-${ch.gates[1]}`),
  };
}

export function allCenters(): HDCenter[] {
  return [...CENTERS];
}
