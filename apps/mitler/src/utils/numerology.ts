const LETTER_VALUES: Record<string, number> = {
  A: 1, B: 2, C: 3, Ç: 4, D: 5, E: 6, F: 7, G: 8, Ğ: 9,
  H: 1, I: 2, İ: 3, J: 4, K: 5, L: 6, M: 7, N: 8, O: 9,
  Ö: 1, P: 2, R: 3, S: 4, Ş: 5, T: 6, U: 7, Ü: 8, V: 9,
  Y: 1, Z: 2,
};

const VOWELS = new Set(['A', 'E', 'I', 'İ', 'O', 'Ö', 'U', 'Ü']);

function reduce(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n;
  while (n > 9) {
    n = String(n).split('').reduce((s, d) => s + parseInt(d, 10), 0);
    if (n === 11 || n === 22 || n === 33) return n;
  }
  return n;
}

export function calcLifePath(birthDate: string): number {
  const digits = birthDate.replace(/-/g, '').split('').map(Number);
  return reduce(digits.reduce((a, b) => a + b, 0));
}

export function calcExpression(fullName: string): number {
  const sum = fullName.toUpperCase().replace(/\s/g, '').split('')
    .reduce((s, l) => s + (LETTER_VALUES[l] || 0), 0);
  return reduce(sum);
}

export function calcSoulUrge(fullName: string): number {
  const sum = fullName.toUpperCase().replace(/\s/g, '').split('')
    .filter(l => VOWELS.has(l))
    .reduce((s, l) => s + (LETTER_VALUES[l] || 0), 0);
  return reduce(sum);
}

export function calcPersonality(fullName: string): number {
  const sum = fullName.toUpperCase().replace(/\s/g, '').split('')
    .filter(l => !VOWELS.has(l) && LETTER_VALUES[l] !== undefined)
    .reduce((s, l) => s + (LETTER_VALUES[l] || 0), 0);
  return reduce(sum);
}

export interface NumerologyProfile {
  lifePath: number;
  expression: number;
  soulUrge: number;
  personality: number;
}

export function calcNumerology(fullName: string, birthDate: string): NumerologyProfile {
  return {
    lifePath: calcLifePath(birthDate),
    expression: calcExpression(fullName),
    soulUrge: calcSoulUrge(fullName),
    personality: calcPersonality(fullName),
  };
}

export type NumLang = 'tr' | 'en';

export interface LifePathMeaning { title: string; keyword: string; desc: string }

export const LIFE_PATH_MEANINGS: Record<number, LifePathMeaning> = {
  1: { title: 'Öncü', keyword: 'Liderlik', desc: 'Yeni yollar açmak, bağımsız düşünmek ve öncü olmak senin doğandasın. Cesaret ve irade en büyük güçlerin.' },
  2: { title: 'Arabulucu', keyword: 'Denge', desc: 'Sezgi, uyum ve işbirliği enerjisi taşırsın. İlişkilerde köprü kurma ve dinleme gücün eşsizdir.' },
  3: { title: 'Yaratıcı', keyword: 'İfade', desc: 'Yaratıcılık, neşe ve özgün ifade seni tanımlar. Sanatın, müziğin ve sözcüklerin dünyasında parlarsın.' },
  4: { title: 'Yapıcı', keyword: 'Düzen', desc: 'Çalışkanlık, güvenilirlik ve sistematik düşünce temel enerjin. Sağlam temeller inşa etmeyi seversin.' },
  5: { title: 'Özgür Ruh', keyword: 'Özgürlük', desc: 'Macera, değişim ve özgürlük senin özündedir. Her deneyimden öğrenir, hayatı dolu yaşarsın.' },
  6: { title: 'Sevgi Elçisi', keyword: 'Şefkat', desc: 'Sorumluluk, derin sevgi ve hizmet etme kaderinde var. Ailenin ve toplumunun kalbi olursun.' },
  7: { title: 'Bilge', keyword: 'Derinlik', desc: 'Manevi arayış, derin analiz ve içe dönüş yolunu aydınlatır. Sorular sormak ve cevaplar aramak ruhunun işidir.' },
  8: { title: 'Güç', keyword: 'Dönüşüm', desc: 'Maddi ve manevi güç dengesini bulmak hayat yolun. Büyük hedefler için doğdun, liderlik enerjin güçlüdür.' },
  9: { title: 'Öğretmen', keyword: 'Merhamet', desc: 'Evrensel sevgi, merhamet ve insanlığa hizmet enerjisi taşırsın. Döngülerin tamamlanması ve bırakabilme gücün var.' },
  11: { title: 'Aydınlayıcı', keyword: 'Sezgi', desc: 'Usta sayı 11: Yüksek sezgi ve manevi aydınlanma yolundaki rehbersin. İlham kaynağısın.' },
  22: { title: 'Usta Yapıcı', keyword: 'Vizyon', desc: 'Usta sayı 22: Büyük hayalleri somut gerçeğe dönüştürme gücüne sahipsin. Dünyanı değiştirirsin.' },
  33: { title: 'Usta Öğretmen', keyword: 'Evrensel Sevgi', desc: 'Usta sayı 33: Sonsuz şefkat, iyileştirme ve evrensel öğretmenlik misyonundansın.' },
};

const LIFE_PATH_EN: Record<number, LifePathMeaning> = {
  1: { title: 'Pioneer', keyword: 'Leadership', desc: 'Opening new paths, independent thinking and being a forerunner are in your nature. Courage and will are your greatest powers.' },
  2: { title: 'Mediator', keyword: 'Balance', desc: 'You carry the energy of intuition, harmony and cooperation. Your power to build bridges in relationships and to listen is unique.' },
  3: { title: 'Creator', keyword: 'Expression', desc: 'Creativity, joy and authentic expression define you. You shine in the world of art, music and words.' },
  4: { title: 'Builder', keyword: 'Order', desc: 'Diligence, reliability and systematic thinking are your basic energy. You love to build firm foundations.' },
  5: { title: 'Free Spirit', keyword: 'Freedom', desc: 'Adventure, change and freedom are your essence. You learn from every experience and live life fully.' },
  6: { title: 'Messenger of Love', keyword: 'Compassion', desc: 'Responsibility, deep love and serving are in your destiny. You become the heart of your family and your community.' },
  7: { title: 'Sage', keyword: 'Depth', desc: 'Spiritual quest, deep analysis and turning inward light up your path. To ask questions and seek answers is your soul\'s work.' },
  8: { title: 'Power', keyword: 'Transformation', desc: 'Finding the balance of material and spiritual power is your life path. You were born for big goals; your leadership energy is strong.' },
  9: { title: 'Teacher', keyword: 'Mercy', desc: 'You carry universal love, mercy and the energy of serving humanity. You have the power to complete cycles and to release.' },
  11: { title: 'Illuminator', keyword: 'Intuition', desc: 'Master number 11: a guide on the path of high intuition and spiritual enlightenment. You are a source of inspiration.' },
  22: { title: 'Master Builder', keyword: 'Vision', desc: 'Master number 22: you have the power to turn great dreams into concrete reality. You change your world.' },
  33: { title: 'Master Teacher', keyword: 'Universal Love', desc: 'Master number 33: you carry the mission of endless compassion, healing and universal teaching.' },
};

export function getLifePathMeaning(n: number, lang: NumLang = 'tr'): LifePathMeaning {
  const dict = lang === 'en' ? LIFE_PATH_EN : LIFE_PATH_MEANINGS;
  return dict[n] || dict[9];
}
