import { Body, EclipticGeoMoon, GeoVector, Ecliptic, MakeTime } from 'astronomy-engine';
import type { ZodiacSign } from '../types';

const SIGNS: ZodiacSign[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

function normalize(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

function signOf(longitude: number): ZodiacSign {
  return SIGNS[Math.floor(normalize(longitude) / 30)]!;
}

export type NowSky = {
  sunSign: ZodiacSign;
  moonSign: ZodiacSign;
  phaseGlyph: string;
  phaseTr: string;
  phaseEn: string;
};

export function nowSky(date: Date = new Date()): NowSky {
  const time = MakeTime(date);
  const sunEcl = Ecliptic(GeoVector(Body.Sun, time, true));
  const sunLon = normalize(sunEcl.elon);
  const moonLon = normalize(EclipticGeoMoon(time).lon);
  const phaseDeg = normalize(moonLon - sunLon);

  const phase = pickPhase(phaseDeg);

  return {
    sunSign: signOf(sunLon),
    moonSign: signOf(moonLon),
    phaseGlyph: phase.glyph,
    phaseTr: phase.tr,
    phaseEn: phase.en,
  };
}

function pickPhase(deg: number) {
  if (deg < 22.5)   return { glyph: '🌑', tr: 'Yeni Ay',         en: 'New Moon' };
  if (deg < 67.5)   return { glyph: '🌒', tr: 'Büyüyen Hilal',   en: 'Waxing Crescent' };
  if (deg < 112.5)  return { glyph: '🌓', tr: 'İlk Dördün',      en: 'First Quarter' };
  if (deg < 157.5)  return { glyph: '🌔', tr: 'Büyüyen Şişkin',  en: 'Waxing Gibbous' };
  if (deg < 202.5)  return { glyph: '🌕', tr: 'Dolunay',         en: 'Full Moon' };
  if (deg < 247.5)  return { glyph: '🌖', tr: 'Sönen Şişkin',    en: 'Waning Gibbous' };
  if (deg < 292.5)  return { glyph: '🌗', tr: 'Son Dördün',      en: 'Last Quarter' };
  if (deg < 337.5)  return { glyph: '🌘', tr: 'Sönen Hilal',     en: 'Waning Crescent' };
  return { glyph: '🌑', tr: 'Yeni Ay', en: 'New Moon' };
}
