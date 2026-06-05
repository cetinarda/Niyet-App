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

export const LIFE_PATH_MEANINGS: Record<number, { title: string; keyword: string; desc: string }> = {
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
