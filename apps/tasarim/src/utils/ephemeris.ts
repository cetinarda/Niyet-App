// Yüksek hassasiyetli efemerit — astronomy-engine (MIT, Don Cross).
// Sun/Moon < 0.001°, gezegenler < 0.01° tropikal ekliptik longitüd.
// HD gate (5.625°) ve line (0.94°) çözünürlüğü için fazlasıyla yeterli.

import {
  Body,
  SunPosition,
  EclipticGeoMoon,
  GeoVector,
  Ecliptic,
  SearchSunLongitude,
} from 'astronomy-engine';

function norm360(x: number): number {
  let r = x % 360;
  if (r < 0) r += 360;
  return r;
}

export function julianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

export function dateFromJD(jd: number): Date {
  return new Date((jd - 2440587.5) * 86400000);
}

export function sunLongitude(jd: number): number {
  return norm360(SunPosition(dateFromJD(jd)).elon);
}

export function moonLongitude(jd: number): number {
  return norm360(EclipticGeoMoon(dateFromJD(jd)).lon);
}

export function earthLongitude(jd: number): number {
  return norm360(sunLongitude(jd) + 180);
}

const PLANET_BODY: Record<string, Body> = {
  Mercury: Body.Mercury,
  Venus: Body.Venus,
  Mars: Body.Mars,
  Jupiter: Body.Jupiter,
  Saturn: Body.Saturn,
  Uranus: Body.Uranus,
  Neptune: Body.Neptune,
  Pluto: Body.Pluto,
};

export function planetLongitude(name: string, jd: number): number {
  const body = PLANET_BODY[name];
  if (!body) throw new Error('Bilinmeyen gezegen: ' + name);
  // GeoVector = jeocentric (Dünya merkezli) ekvatoryal vektör, aberration=true
  // ile görünen pozisyon. Ecliptic ile of-date tropikal ekliptiğe çeviriyoruz.
  const vec = GeoVector(body, dateFromJD(jd), true);
  const ecl = Ecliptic(vec);
  return norm360(ecl.elon);
}

// Lunar Düğüm — Astronomy-engine'de doğrudan yok; Meeus ortalama formülü
// (gerçek/true düğüm için ~1.5° hata olabilir, ortalama düğüm için neredeyse tam).
// HD'de gate ve line için yeterli hassasiyet.
export function nodeLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const N = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
  return norm360(N);
}

export function southNodeLongitude(jd: number): number {
  return norm360(nodeLongitude(jd) + 180);
}

// HD Design zamanı: Sun'ın Personality Sun pozisyonundan tam 88° geride
// olduğu an. SearchSunLongitude kesin çözüm verir (saniyenin altında hata).
export function designJD(birthJD: number): number {
  const sunBirth = sunLongitude(birthJD);
  const target = norm360(sunBirth - 88);
  // Yaklaşık 88.13 gün önce başla; ±5 gün arar
  const startDate = dateFromJD(birthJD - 90);
  const found = SearchSunLongitude(target, startDate, 10);
  if (!found) {
    // Fallback: iteratif çözüm
    let jd = birthJD - 88;
    for (let i = 0; i < 12; i++) {
      const cur = sunLongitude(jd);
      const diff = norm360(cur - target + 180) - 180;
      jd -= diff / 0.9856;
      if (Math.abs(diff) < 0.0001) break;
    }
    return jd;
  }
  return julianDay(found.date);
}

export interface PlanetPositions {
  sun: number;
  earth: number;
  moon: number;
  northNode: number;
  southNode: number;
  mercury: number;
  venus: number;
  mars: number;
  jupiter: number;
  saturn: number;
  uranus: number;
  neptune: number;
  pluto: number;
}

export function allPositions(jd: number): PlanetPositions {
  return {
    sun: sunLongitude(jd),
    earth: earthLongitude(jd),
    moon: moonLongitude(jd),
    northNode: nodeLongitude(jd),
    southNode: southNodeLongitude(jd),
    mercury: planetLongitude('Mercury', jd),
    venus: planetLongitude('Venus', jd),
    mars: planetLongitude('Mars', jd),
    jupiter: planetLongitude('Jupiter', jd),
    saturn: planetLongitude('Saturn', jd),
    uranus: planetLongitude('Uranus', jd),
    neptune: planetLongitude('Neptune', jd),
    pluto: planetLongitude('Pluto', jd),
  };
}
