import { calculateChart } from '../astrology';
import { deriveStarOrigin } from '../galactic';
import { calculateHumanDesign } from '../human-design';
import { buildMissions } from '../missions';
import { generateNarrative } from '../narrative';
import { buildNumerology } from '../numerology';
import { NORTH_NODE_GUIDE, SOUTH_NODE_RELEASE } from '../content/astrology-content';
import { calculateMaya } from '../systems/maya';
import { calculateVedic } from '../systems/vedic';
import { calculateChinese } from '../systems/chinese';
import { calculateNorse } from '../systems/norse';
import { calculateTarot } from '../systems/tarot';
import type { BirthInput, GalacticReport } from '../types';

/**
 * Deterministik karne kimliği — aynı doğum verisi HER ZAMAN aynı id üretir.
 * Böylece: (1) aynı kişiyi tekrar görmek yeni karne saymaz, (2) farklı kişi
 * yeni id → ücretsiz limit kontrolü çalışır, (3) karne "sabit kalır".
 */
export function birthKey(input: BirthInput): string {
  const raw = [
    (input.fullName ?? '').trim().toLowerCase(),
    input.birthDate ?? '',
    input.birthTimeKnown === false ? 'notime' : (input.birthTime ?? '12:00'),
    (input.birthPlace ?? '').trim().toLowerCase(),
    input.latitude != null ? input.latitude.toFixed(3) : '',
    input.longitude != null ? input.longitude.toFixed(3) : '',
  ].join('|');
  let h = 5381;
  for (let i = 0; i < raw.length; i++) h = ((h << 5) + h + raw.charCodeAt(i)) >>> 0;
  return `r_${h.toString(36)}`;
}

function buildBirthISO(date: string, time: string, timezone: string): string {
  const [yyyy, mm, dd] = date.split('-').map(Number);
  const [hh, min] = (time || '12:00').split(':').map(Number);
  // We expose timezone via Intl; if unavailable fallback to UTC.
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone || 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    // Reverse lookup: compute UTC offset for the given local time/date
    const utcDate = new Date(Date.UTC(yyyy!, (mm! - 1), dd!, hh ?? 12, min ?? 0));
    const parts = formatter.formatToParts(utcDate);
    const get = (t: string) => parts.find((p) => p.type === t)?.value;
    const tzYear = Number(get('year'));
    const tzMonth = Number(get('month'));
    const tzDay = Number(get('day'));
    const tzHour = Number(get('hour'));
    const tzMin = Number(get('minute'));
    const tzAsUtc = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMin);
    const offsetMinutes = (tzAsUtc - utcDate.getTime()) / 60000;
    const real = new Date(utcDate.getTime() - offsetMinutes * 60000);
    return real.toISOString();
  } catch {
    return new Date(Date.UTC(yyyy!, (mm! - 1), dd!, hh ?? 12, min ?? 0)).toISOString();
  }
}

export async function buildGalacticReport(
  input: BirthInput,
  locale: 'tr' | 'en' = 'tr',
): Promise<GalacticReport> {
  const birthISO = buildBirthISO(input.birthDate, input.birthTime, input.timezone);
  const chart = calculateChart(birthISO, input.latitude, input.longitude);
  const numerology = buildNumerology(input.birthDate, input.fullName);
  const humanDesign = calculateHumanDesign(chart, birthISO);
  const origin = deriveStarOrigin(chart, numerology);
  const missions = buildMissions(chart, numerology, humanDesign);
  const nn = chart.planets.find((p) => p.name === 'NorthNode')!;
  const sn = chart.planets.find((p) => p.name === 'SouthNode')!;
  const moonTropical = chart.planets.find((p) => p.name === 'Moon')!.longitude;

  const systems = {
    maya: calculateMaya(birthISO),
    vedic: calculateVedic(moonTropical, birthISO),
    chinese: calculateChinese(birthISO),
    norse: calculateNorse(birthISO),
    tarot: calculateTarot(input.birthDate),
  };

  const partial = {
    id: birthKey(input),
    createdAt: new Date().toISOString(),
    birth: input,
    chart,
    numerology,
    humanDesign,
    origin,
    systems,
    missions,
    northNodeMessage: NORTH_NODE_GUIDE[nn.sign],
    southNodeMessage: SOUTH_NODE_RELEASE[sn.sign],
  };

  const { narrative, summary, sections } = await generateNarrative(partial, locale);

  return { ...partial, narrative, summary, sections };
}
