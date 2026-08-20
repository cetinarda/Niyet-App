import { Body, GeoVector, Ecliptic, MakeTime } from 'astronomy-engine';

const TRACKED_BODIES: Array<{ name: string; body: Body }> = [
  { name: 'Sun', body: Body.Sun },
  { name: 'Mercury', body: Body.Mercury },
  { name: 'Venus', body: Body.Venus },
  { name: 'Mars', body: Body.Mars },
  { name: 'Jupiter', body: Body.Jupiter },
  { name: 'Saturn', body: Body.Saturn },
  { name: 'Uranus', body: Body.Uranus },
  { name: 'Neptune', body: Body.Neptune },
  { name: 'Pluto', body: Body.Pluto },
];

export type TimelineSnapshot = {
  age: number;
  date: string;
  positions: Record<string, number>;
};

function normalize(d: number): number {
  let v = d % 360;
  if (v < 0) v += 360;
  return v;
}

function eclipticLongitude(body: Body, date: Date): number {
  const time = MakeTime(date);
  const vec = GeoVector(body, time, true);
  const ecl = Ecliptic(vec);
  return normalize(ecl.elon);
}

export function buildLifeTimeline(birthISO: string, snapshotsPerYear = 1): TimelineSnapshot[] {
  const birth = new Date(birthISO);
  const now = new Date();
  const totalYears = Math.max(1, (now.getTime() - birth.getTime()) / (365.25 * 86400000));
  const totalSnapshots = Math.max(2, Math.floor(totalYears * snapshotsPerYear) + 1);

  const snapshots: TimelineSnapshot[] = [];
  for (let i = 0; i < totalSnapshots; i++) {
    const t = birth.getTime() + (i / (totalSnapshots - 1)) * (now.getTime() - birth.getTime());
    const date = new Date(t);
    const positions: Record<string, number> = {};
    for (const { name, body } of TRACKED_BODIES) {
      positions[name] = eclipticLongitude(body, date);
    }
    snapshots.push({
      age: (date.getTime() - birth.getTime()) / (365.25 * 86400000),
      date: date.toISOString().slice(0, 10),
      positions,
    });
  }
  return snapshots;
}

export const PLANET_COLORS: Record<string, string> = {
  Sun: '#f5d061',
  Mercury: '#9dd9ff',
  Venus: '#ff7ad9',
  Mars: '#ff6b6b',
  Jupiter: '#f5a261',
  Saturn: '#c0a070',
  Uranus: '#7fffd4',
  Neptune: '#5b8def',
  Pluto: '#9c6bff',
};
