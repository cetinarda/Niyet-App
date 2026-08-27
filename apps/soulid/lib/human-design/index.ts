import type { Chart, HumanDesign } from '../types';
import { CHANNELS, GATE_SEQUENCE, type HDCenter } from './gates';

const CENTERS: HDCenter[] = [
  'Head',
  'Ajna',
  'Throat',
  'G',
  'Heart',
  'SolarPlexus',
  'Sacral',
  'Spleen',
  'Root',
];

const GATE_DEGREES = 360 / 64;

export function longitudeToGate(longitude: number): { gate: number; line: number } {
  const lon = ((longitude % 360) + 360) % 360;
  const idx = Math.floor(lon / GATE_DEGREES);
  const gate = GATE_SEQUENCE[idx]!;
  const within = lon - idx * GATE_DEGREES;
  const line = Math.min(6, Math.floor((within / GATE_DEGREES) * 6) + 1);
  return { gate, line };
}

function activeCenters(activatedGates: Set<number>): Set<HDCenter> {
  const active = new Set<HDCenter>();
  for (const { gates, centers } of CHANNELS) {
    if (activatedGates.has(gates[0]) && activatedGates.has(gates[1])) {
      active.add(centers[0]);
      active.add(centers[1]);
    }
  }
  return active;
}

function definedChannels(activatedGates: Set<number>): string[] {
  const result: string[] = [];
  for (const { gates } of CHANNELS) {
    if (activatedGates.has(gates[0]) && activatedGates.has(gates[1])) {
      result.push(`${gates[0]}-${gates[1]}`);
    }
  }
  return result;
}

function determineType(active: Set<HDCenter>, activatedGates: Set<number>): HumanDesign['type'] {
  const sacralDefined = active.has('Sacral');
  const throatDefined = active.has('Throat');
  const heartDefined = active.has('Heart');
  const rootDefined = active.has('Root');
  const solarDefined = active.has('SolarPlexus');
  const motorCenters = ['Sacral', 'Heart', 'SolarPlexus', 'Root'] as HDCenter[];
  const definedMotors = motorCenters.filter((c) => active.has(c));

  if (active.size === 0) return 'Reflector';

  // Manifestor: motor connected to throat without sacral defined
  const motorToThroat =
    throatDefined && definedMotors.some((m) => m !== 'Sacral');

  if (sacralDefined && throatDefined && (heartDefined || rootDefined || solarDefined)) {
    // Likely manifesting generator if motor-throat connection in addition to sacral
    if (motorToThroat || activatedGates.has(34) && (activatedGates.has(20) || activatedGates.has(10))) {
      return 'ManifestingGenerator';
    }
    return 'Generator';
  }

  if (sacralDefined) return 'Generator';
  if (motorToThroat) return 'Manifestor';
  return 'Projector';
}

function determineAuthority(active: Set<HDCenter>, type: HumanDesign['type']): string {
  if (type === 'Reflector') return 'Ay Döngüsü Otoritesi (Lunar)';
  if (active.has('SolarPlexus')) return 'Duygusal Otorite (Solar Plexus)';
  if (active.has('Sacral')) return 'Sakral Otorite';
  if (active.has('Spleen')) return 'Splenik Otorite (Sezgi)';
  if (active.has('Heart')) return 'Ego Otoritesi';
  if (active.has('G') && active.has('Throat')) return 'Kendini Yansıtan Otorite';
  return 'Mental Yansıtıcı (Çevre)';
}

function strategyOf(type: HumanDesign['type']): string {
  switch (type) {
    case 'Manifestor':
      return 'Bilgilendir & Başlat';
    case 'Generator':
      return 'Yanıt Vermeyi Bekle';
    case 'ManifestingGenerator':
      return 'Yanıtla ve Hızla Bilgilendir';
    case 'Projector':
      return 'Davet Bekle ve Tanın';
    case 'Reflector':
      return 'Ay Döngüsünü Bekle (≈28 gün)';
  }
}

function profileLines(personalitySun: number, designSun: number): string {
  const profile = `${personalitySun}/${designSun}`;
  const map: Record<string, string> = {
    '1/3': '1/3 Araştırmacı-Şehit',
    '1/4': '1/4 Araştırmacı-Arkadaş',
    '2/4': '2/4 Münzevi-Arkadaş',
    '2/5': '2/5 Münzevi-Heretik',
    '3/5': '3/5 Şehit-Heretik',
    '3/6': '3/6 Şehit-Rol Modeli',
    '4/6': '4/6 Arkadaş-Rol Modeli',
    '4/1': '4/1 Arkadaş-Araştırmacı',
    '5/1': '5/1 Heretik-Araştırmacı',
    '5/2': '5/2 Heretik-Münzevi',
    '6/2': '6/2 Rol Modeli-Münzevi',
    '6/3': '6/3 Rol Modeli-Şehit',
  };
  return map[profile] ?? `${profile} Profil`;
}

export function calculateHumanDesign(chart: Chart, birthISO: string): HumanDesign {
  const sunPos = chart.planets.find((p) => p.name === 'Sun')!;
  const personalitySunGate = longitudeToGate(sunPos.longitude);

  // Design Sun is approximately 88 solar degrees (≈88 days) before birth.
  const designDate = new Date(new Date(birthISO).getTime() - 88 * 24 * 3600 * 1000);
  // Approximation: subtract 88° from current sun longitude (close enough for MVP)
  const designSunLongitude = ((sunPos.longitude - 88 + 360) % 360);
  const designSunGate = longitudeToGate(designSunLongitude);

  // Collect activated gates from all major bodies (personality) for type determination
  const activatedGates = new Set<number>();
  for (const planet of chart.planets) {
    if (planet.name === 'Ascendant' || planet.name === 'MC') continue;
    activatedGates.add(longitudeToGate(planet.longitude).gate);
    // Mirror with design offset for richer signal
    activatedGates.add(longitudeToGate((planet.longitude - 88 + 360) % 360).gate);
  }

  const active = activeCenters(activatedGates);
  const type = determineType(active, activatedGates);
  const authority = determineAuthority(active, type);
  const strategy = strategyOf(type);
  const profile = profileLines(personalitySunGate.line, designSunGate.line);
  const incarnationCross = `Kapı ${personalitySunGate.gate} / ${designSunGate.gate} Enkarnasyon Hattı`;

  const definedSet = Array.from(active);
  const openCenters = CENTERS.filter((c) => !active.has(c));

  return {
    type,
    strategy,
    authority,
    profile,
    incarnationCross,
    definedCenters: definedSet,
    openCenters,
    gates: Array.from(activatedGates).sort((a, b) => a - b),
    channels: definedChannels(activatedGates),
  };
}

export function allCenters(): HDCenter[] {
  return [...CENTERS];
}
