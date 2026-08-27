// Çin Astrolojisi: 12 hayvan + 5 element (Wu Xing) + Yin/Yang

const ANIMALS = [
  { tr: 'Fare', en: 'Rat', glyph: '🐀', traits: 'Zekâ, hızlı kavrayış, dirayet' },
  { tr: 'Öküz', en: 'Ox', glyph: '🐂', traits: 'Sebat, sadakat, sessiz güç' },
  { tr: 'Kaplan', en: 'Tiger', glyph: '🐅', traits: 'Cesaret, isyan, koruyucu öfke' },
  { tr: 'Tavşan', en: 'Rabbit', glyph: '🐇', traits: 'Zarafet, diplomasi, sezgi' },
  { tr: 'Ejderha', en: 'Dragon', glyph: '🐉', traits: 'Karizma, vizyon, kozmik ateş' },
  { tr: 'Yılan', en: 'Snake', glyph: '🐍', traits: 'Bilgelik, sezgisel zekâ, dönüşüm' },
  { tr: 'At', en: 'Horse', glyph: '🐎', traits: 'Özgürlük, hareket, tutku' },
  { tr: 'Keçi', en: 'Goat', glyph: '🐐', traits: 'Sanat, şefkat, hayal gücü' },
  { tr: 'Maymun', en: 'Monkey', glyph: '🐒', traits: 'Yaratıcı zekâ, esneklik, oyun' },
  { tr: 'Horoz', en: 'Rooster', glyph: '🐓', traits: 'Cesaret, dürüstlük, gözlem' },
  { tr: 'Köpek', en: 'Dog', glyph: '🐕', traits: 'Sadakat, adalet, koruma' },
  { tr: 'Domuz', en: 'Pig', glyph: '🐖', traits: 'Bolluk, samimiyet, cömertlik' },
];

const ELEMENTS = [
  { tr: 'Tahta', en: 'Wood', glyph: '🌳', power: 'Büyüme, esnek güç, vizyon' },
  { tr: 'Ateş', en: 'Fire', glyph: '🔥', power: 'Tutku, sezgi, dönüştürücü ısı' },
  { tr: 'Toprak', en: 'Earth', glyph: '🪨', power: 'Stabilite, beslenme, merkez' },
  { tr: 'Metal', en: 'Metal', glyph: '⚔️', power: 'Disiplin, hassasiyet, kesinlik' },
  { tr: 'Su', en: 'Water', glyph: '💧', power: 'Bilgelik, akış, derinlik' },
];

const YIN_YANG = ['Yang', 'Yin'];

// Chinese New Year dates 1900-2099 (approximate, sufficient for app)
// Format: year -> [month, day] of CNY
const CNY_DATES: Record<number, [number, number]> = {
  1900: [1, 31], 1901: [2, 19], 1902: [2, 8], 1903: [1, 29], 1904: [2, 16],
  1905: [2, 4], 1906: [1, 25], 1907: [2, 13], 1908: [2, 2], 1909: [1, 22],
  1910: [2, 10], 1911: [1, 30], 1912: [2, 18], 1913: [2, 6], 1914: [1, 26],
  1915: [2, 14], 1916: [2, 3], 1917: [1, 23], 1918: [2, 11], 1919: [2, 1],
  1920: [2, 20], 1921: [2, 8], 1922: [1, 28], 1923: [2, 16], 1924: [2, 5],
  1925: [1, 24], 1926: [2, 13], 1927: [2, 2], 1928: [1, 23], 1929: [2, 10],
  1930: [1, 30], 1931: [2, 17], 1932: [2, 6], 1933: [1, 26], 1934: [2, 14],
  1935: [2, 4], 1936: [1, 24], 1937: [2, 11], 1938: [1, 31], 1939: [2, 19],
  1940: [2, 8], 1941: [1, 27], 1942: [2, 15], 1943: [2, 5], 1944: [1, 25],
  1945: [2, 13], 1946: [2, 2], 1947: [1, 22], 1948: [2, 10], 1949: [1, 29],
  1950: [2, 17], 1951: [2, 6], 1952: [1, 27], 1953: [2, 14], 1954: [2, 3],
  1955: [1, 24], 1956: [2, 12], 1957: [1, 31], 1958: [2, 18], 1959: [2, 8],
  1960: [1, 28], 1961: [2, 15], 1962: [2, 5], 1963: [1, 25], 1964: [2, 13],
  1965: [2, 2], 1966: [1, 21], 1967: [2, 9], 1968: [1, 30], 1969: [2, 17],
  1970: [2, 6], 1971: [1, 27], 1972: [2, 15], 1973: [2, 3], 1974: [1, 23],
  1975: [2, 11], 1976: [1, 31], 1977: [2, 18], 1978: [2, 7], 1979: [1, 28],
  1980: [2, 16], 1981: [2, 5], 1982: [1, 25], 1983: [2, 13], 1984: [2, 2],
  1985: [2, 20], 1986: [2, 9], 1987: [1, 29], 1988: [2, 17], 1989: [2, 6],
  1990: [1, 27], 1991: [2, 15], 1992: [2, 4], 1993: [1, 23], 1994: [2, 10],
  1995: [1, 31], 1996: [2, 19], 1997: [2, 7], 1998: [1, 28], 1999: [2, 16],
  2000: [2, 5], 2001: [1, 24], 2002: [2, 12], 2003: [2, 1], 2004: [1, 22],
  2005: [2, 9], 2006: [1, 29], 2007: [2, 18], 2008: [2, 7], 2009: [1, 26],
  2010: [2, 14], 2011: [2, 3], 2012: [1, 23], 2013: [2, 10], 2014: [1, 31],
  2015: [2, 19], 2016: [2, 8], 2017: [1, 28], 2018: [2, 16], 2019: [2, 5],
  2020: [1, 25], 2021: [2, 12], 2022: [2, 1], 2023: [1, 22], 2024: [2, 10],
  2025: [1, 29], 2026: [2, 17], 2027: [2, 6], 2028: [1, 26], 2029: [2, 13],
  2030: [2, 3],
};

export type ChineseResult = {
  animal: { tr: string; en: string; glyph: string; traits: string };
  element: { tr: string; en: string; glyph: string; power: string };
  yinYang: string;
  signature: string;
};

export function calculateChinese(birthISO: string): ChineseResult {
  const date = new Date(birthISO);
  let year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  // Adjust for Chinese New Year — if before CNY, use previous year
  const cny = CNY_DATES[year];
  if (cny && (month < cny[0] || (month === cny[0] && day < cny[1]))) {
    year -= 1;
  }

  // Animal: (year - 1900) % 12 → 0=Rat (1900 was Year of Rat)
  const animalIdx = ((year - 1900) % 12 + 12) % 12;
  // Element: 60-year cycle, each element pairs 2 years (yang+yin)
  // 1900 = Metal (year 7 of 60-cycle that started 1864)
  // Stem: (year - 4) % 10; 0,1=Wood; 2,3=Fire; 4,5=Earth; 6,7=Metal; 8,9=Water
  const stem = ((year - 4) % 10 + 10) % 10;
  const elementIdx = Math.floor(stem / 2);
  const yinYang = YIN_YANG[stem % 2]!;

  const animal = ANIMALS[animalIdx]!;
  const element = ELEMENTS[elementIdx]!;

  return {
    animal,
    element,
    yinYang,
    signature: `${yinYang} ${element.tr} ${animal.tr}`,
  };
}
