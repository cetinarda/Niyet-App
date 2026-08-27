import type { Numerology } from '../types';

const MASTER_NUMBERS = new Set([11, 22, 33]);

const PYTHAGOREAN: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
  // Turkish helpers (approximation)
  ç: 3, ğ: 7, ı: 1, ö: 6, ş: 1, ü: 3,
};

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'ı', 'ö', 'ü', 'y']);

function sumDigits(n: number): number {
  return Math.abs(n)
    .toString()
    .split('')
    .reduce((acc, d) => acc + Number(d), 0);
}

export function reduce(n: number, keepMasters = true): number {
  let value = Math.abs(n);
  while (value > 9) {
    if (keepMasters && MASTER_NUMBERS.has(value)) return value;
    value = sumDigits(value);
  }
  return value;
}

function reduceFromDate(year: number, month: number, day: number): number {
  const total = sumDigits(year) + sumDigits(month) + sumDigits(day);
  // Check master at each step
  if (MASTER_NUMBERS.has(total)) return total;
  return reduce(total);
}

export function calculateLifePath(birthDateISO: string): number {
  const [y, m, d] = birthDateISO.split('-').map(Number);
  return reduceFromDate(y, m, d);
}

export function calculatePersonalYear(birthDateISO: string, referenceDate = new Date()): number {
  const [, m, d] = birthDateISO.split('-').map(Number);
  const currentYear = referenceDate.getFullYear();
  const sum = sumDigits(currentYear) + sumDigits(m) + sumDigits(d);
  return reduce(sum, false);
}

export function calculateBirthDay(birthDateISO: string): number {
  const [, , d] = birthDateISO.split('-').map(Number);
  return reduce(d);
}

function letterValue(ch: string): number {
  return PYTHAGOREAN[ch.toLowerCase()] ?? 0;
}

function nameValue(name: string, filter: (ch: string) => boolean): number {
  const total = name
    .toLowerCase()
    .split('')
    .filter(filter)
    .reduce((acc, ch) => acc + letterValue(ch), 0);
  return reduce(total);
}

export function calculateExpression(fullName: string): number {
  return nameValue(fullName, (ch) => /[a-zçğıöşü]/.test(ch));
}

export function calculateSoulUrge(fullName: string): number {
  return nameValue(fullName, (ch) => VOWELS.has(ch));
}

export function calculatePersonality(fullName: string): number {
  return nameValue(fullName, (ch) => /[a-zçğıöşü]/.test(ch) && !VOWELS.has(ch));
}

export function buildNumerology(birthDateISO: string, fullName: string): Numerology {
  return {
    lifePath: calculateLifePath(birthDateISO),
    expression: calculateExpression(fullName),
    soulUrge: calculateSoulUrge(fullName),
    personality: calculatePersonality(fullName),
    birthDay: calculateBirthDay(birthDateISO),
    personalYear: calculatePersonalYear(birthDateISO),
  };
}
