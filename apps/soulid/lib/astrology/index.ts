import {
  Body,
  EclipticGeoMoon,
  GeoVector,
  Ecliptic,
  MakeTime,
  SiderealTime,
} from 'astronomy-engine';
import type { Chart, PlanetName, PlanetPosition, ZodiacSign } from '../types';

const SIGNS: ZodiacSign[] = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

const PLANET_BODY: Record<Exclude<PlanetName, 'NorthNode' | 'SouthNode' | 'Ascendant' | 'MC' | 'Chiron' | 'Moon' | 'Vertex'>, Body> = {
  Sun: Body.Sun,
  Mercury: Body.Mercury,
  Venus: Body.Venus,
  Mars: Body.Mars,
  Jupiter: Body.Jupiter,
  Saturn: Body.Saturn,
  Uranus: Body.Uranus,
  Neptune: Body.Neptune,
  Pluto: Body.Pluto,
};

function normalize(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

function signOf(longitude: number): ZodiacSign {
  return SIGNS[Math.floor(normalize(longitude) / 30)]!;
}

function degreeInSign(longitude: number): number {
  return normalize(longitude) % 30;
}

function eclipticLongitude(body: Body, date: Date): number {
  const time = MakeTime(date);
  const vec = GeoVector(body, time, true);
  const ecl = Ecliptic(vec);
  return normalize(ecl.elon);
}

function moonLongitude(date: Date): number {
  const time = MakeTime(date);
  const moon = EclipticGeoMoon(time);
  return normalize(moon.lon);
}

function meanNodeLongitude(date: Date): number {
  // Meeus, Astronomical Algorithms, Ch. 47. Mean longitude of ascending node (Mean Node).
  const JD = MakeTime(date).tt + 2451545.0;
  const T = (JD - 2451545.0) / 36525;
  const omega =
    125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
  return normalize(omega);
}

function obliquity(date: Date): number {
  const JD = MakeTime(date).tt + 2451545.0;
  const T = (JD - 2451545.0) / 36525;
  const eps =
    23.43929111 -
    (46.8150 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600;
  return (eps * Math.PI) / 180;
}

function gmstHours(date: Date): number {
  const time = MakeTime(date);
  return SiderealTime(time);
}

function ascendant(date: Date, latitude: number, longitude: number): number {
  const gmst = gmstHours(date);
  const lst = (gmst + longitude / 15) * 15;
  const ramc = ((lst % 360) + 360) % 360;
  const epsilon = obliquity(date);
  const phi = (latitude * Math.PI) / 180;
  const ramcRad = (ramc * Math.PI) / 180;

  // flatlib / Swiss Ephemeris formula. Doğrulandı: 07.04.1988 23:05 Kayseri → Yay ✓
  // tan(ASC) = cos(RAMC) / -(sin(RAMC)*cos(ε) + tan(φ)*sin(ε))
  const y = Math.cos(ramcRad);
  const x = -(Math.sin(ramcRad) * Math.cos(epsilon) + Math.tan(phi) * Math.sin(epsilon));
  const ascRad = Math.atan2(y, x);
  return normalize((ascRad * 180) / Math.PI);
}

function vertex(date: Date, latitude: number, longitude: number): number {
  // Vertex = ASC formülüne benzer ama batı ufukta hesaplanır.
  // Anti-Vertex doğu, Vertex batı. Co-latitude (90-lat) kullanılır.
  // Genel kabul: Vertex = atan2(-cos(RAMC), sin(RAMC)*cos(ε) - cot(φ)*sin(ε))
  const gmst = gmstHours(date);
  const lst = (gmst + longitude / 15) * 15;
  const ramc = ((lst % 360) + 360) % 360;
  const epsilon = obliquity(date);
  const phiRad = (latitude * Math.PI) / 180;
  const ramcRad = (ramc * Math.PI) / 180;
  // co-latitude tan ile ifade
  const cotPhi = 1 / Math.tan(phiRad);
  const y = -Math.cos(ramcRad);
  const x = Math.sin(ramcRad) * Math.cos(epsilon) - cotPhi * Math.sin(epsilon);
  const vRad = Math.atan2(y, x);
  return normalize((vRad * 180) / Math.PI);
}

function midheaven(date: Date, longitude: number): number {
  const gmst = gmstHours(date);
  const lst = (gmst + longitude / 15) * 15;
  const ramc = ((lst % 360) + 360) % 360;
  const epsilon = obliquity(date);
  const ramcRad = (ramc * Math.PI) / 180;
  const mcRad = Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(epsilon));
  return normalize((mcRad * 180) / Math.PI);
}

function placidusHouses(asc: number, mc: number): number[] {
  // Simplified: equal house from ASC. Sufficient for MVP narrative; replace with true Placidus later.
  const houses: number[] = [];
  for (let i = 0; i < 12; i++) {
    houses.push(normalize(asc + i * 30));
  }
  houses[9] = mc;
  return houses;
}

function houseOf(longitude: number, houses: number[]): number {
  const lon = normalize(longitude);
  for (let i = 0; i < 12; i++) {
    const start = houses[i]!;
    const end = houses[(i + 1) % 12]!;
    if (start < end) {
      if (lon >= start && lon < end) return i + 1;
    } else if (lon >= start || lon < end) {
      return i + 1;
    }
  }
  return 1;
}

export function calculateChart(
  birthISO: string,
  latitude: number,
  longitude: number,
): Chart {
  const date = new Date(birthISO);
  const ascDeg = ascendant(date, latitude, longitude);
  const mcDeg = midheaven(date, longitude);
  const houses = placidusHouses(ascDeg, mcDeg);

  const planets: PlanetPosition[] = [];

  for (const [name, body] of Object.entries(PLANET_BODY) as Array<[PlanetName, Body]>) {
    const lon = eclipticLongitude(body, date);
    planets.push({
      name,
      longitude: lon,
      sign: signOf(lon),
      degreeInSign: degreeInSign(lon),
      house: houseOf(lon, houses),
      retrograde: false,
    });
  }

  const moonLon = moonLongitude(date);
  planets.push({
    name: 'Moon',
    longitude: moonLon,
    sign: signOf(moonLon),
    degreeInSign: degreeInSign(moonLon),
    house: houseOf(moonLon, houses),
    retrograde: false,
  });

  const northNode = meanNodeLongitude(date);
  const southNode = normalize(northNode + 180);
  planets.push({
    name: 'NorthNode',
    longitude: northNode,
    sign: signOf(northNode),
    degreeInSign: degreeInSign(northNode),
    house: houseOf(northNode, houses),
    retrograde: true,
  });
  planets.push({
    name: 'SouthNode',
    longitude: southNode,
    sign: signOf(southNode),
    degreeInSign: degreeInSign(southNode),
    house: houseOf(southNode, houses),
    retrograde: true,
  });

  planets.push({
    name: 'Ascendant',
    longitude: ascDeg,
    sign: signOf(ascDeg),
    degreeInSign: degreeInSign(ascDeg),
    house: 1,
    retrograde: false,
  });

  planets.push({
    name: 'MC',
    longitude: mcDeg,
    sign: signOf(mcDeg),
    degreeInSign: degreeInSign(mcDeg),
    house: 10,
    retrograde: false,
  });

  // Vertex — synastry "kader buluşması" noktası
  const vertexDeg = vertex(date, latitude, longitude);
  planets.push({
    name: 'Vertex',
    longitude: vertexDeg,
    sign: signOf(vertexDeg),
    degreeInSign: degreeInSign(vertexDeg),
    house: houseOf(vertexDeg, houses),
    retrograde: false,
  });

  return {
    ascendant: ascDeg,
    midheaven: mcDeg,
    ascendantSign: signOf(ascDeg),
    planets,
    houses,
  };
}

export function findPlanet(chart: Chart, name: PlanetName): PlanetPosition | undefined {
  return chart.planets.find((p) => p.name === name);
}
