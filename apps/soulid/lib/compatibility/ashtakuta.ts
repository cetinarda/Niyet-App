// Vedik Ashtakuta uyum sistemi — MVP 4-boyut (toplam 18 puan).
// Tam 8-Kuta sistemi 36 puan; Plus özelliği olarak ileride genişletilir.
// Referans: Brihat Parashara Hora Shastra, Muhurta Chintamani.
//
// Hesaplanan boyutlar:
//   - Nadi (Sağlık & soy uyumluluğu)     — 8 puan, sıfırsa kritik
//   - Bhakuta (Duygusal & maddi denge)   — 7 puan
//   - Gana (Mizaç uyumu)                 — 6 puan
//   - Yoni (Cinsel & içgüdüsel uyum)     — 4 puan
//
// Skor = (toplam / 25) * 100  — UI'da 0-100 normalize edilir.

type Nakshatra = {
  index: number;          // 0-26
  nadi: 'Vata' | 'Pitta' | 'Kapha';
  gana: 'Deva' | 'Manushya' | 'Rakshasa';
  yoni: number;           // 0-13 (14 hayvan totem)
  yoniName: string;
  yoniGender: 'M' | 'F';
};

// 27 Nakshatra için sabit lookup (BPHS standart referansı)
const NAK: Nakshatra[] = [
  { index: 0,  nadi: 'Vata',  gana: 'Deva',     yoni: 0,  yoniName: 'At',       yoniGender: 'M' }, // Ashwini
  { index: 1,  nadi: 'Pitta', gana: 'Manushya', yoni: 1,  yoniName: 'Fil',      yoniGender: 'M' }, // Bharani
  { index: 2,  nadi: 'Kapha', gana: 'Rakshasa', yoni: 2,  yoniName: 'Koyun',    yoniGender: 'F' }, // Krittika
  { index: 3,  nadi: 'Kapha', gana: 'Manushya', yoni: 3,  yoniName: 'Yılan',    yoniGender: 'M' }, // Rohini
  { index: 4,  nadi: 'Pitta', gana: 'Deva',     yoni: 3,  yoniName: 'Yılan',    yoniGender: 'F' }, // Mrigashira
  { index: 5,  nadi: 'Vata',  gana: 'Manushya', yoni: 4,  yoniName: 'Köpek',    yoniGender: 'F' }, // Ardra
  { index: 6,  nadi: 'Vata',  gana: 'Deva',     yoni: 5,  yoniName: 'Kedi',     yoniGender: 'F' }, // Punarvasu
  { index: 7,  nadi: 'Pitta', gana: 'Deva',     yoni: 2,  yoniName: 'Koyun',    yoniGender: 'M' }, // Pushya
  { index: 8,  nadi: 'Kapha', gana: 'Rakshasa', yoni: 5,  yoniName: 'Kedi',     yoniGender: 'M' }, // Ashlesha
  { index: 9,  nadi: 'Kapha', gana: 'Rakshasa', yoni: 6,  yoniName: 'Sıçan',    yoniGender: 'M' }, // Magha
  { index: 10, nadi: 'Pitta', gana: 'Manushya', yoni: 6,  yoniName: 'Sıçan',    yoniGender: 'F' }, // Purva Phalguni
  { index: 11, nadi: 'Vata',  gana: 'Manushya', yoni: 7,  yoniName: 'İnek',     yoniGender: 'F' }, // Uttara Phalguni
  { index: 12, nadi: 'Vata',  gana: 'Deva',     yoni: 8,  yoniName: 'Manda',    yoniGender: 'F' }, // Hasta
  { index: 13, nadi: 'Pitta', gana: 'Rakshasa', yoni: 9,  yoniName: 'Kaplan',   yoniGender: 'F' }, // Chitra
  { index: 14, nadi: 'Kapha', gana: 'Deva',     yoni: 7,  yoniName: 'İnek',     yoniGender: 'M' }, // Swati
  { index: 15, nadi: 'Kapha', gana: 'Rakshasa', yoni: 9,  yoniName: 'Kaplan',   yoniGender: 'M' }, // Vishakha
  { index: 16, nadi: 'Pitta', gana: 'Deva',     yoni: 10, yoniName: 'Geyik',    yoniGender: 'F' }, // Anuradha
  { index: 17, nadi: 'Vata',  gana: 'Rakshasa', yoni: 10, yoniName: 'Geyik',    yoniGender: 'M' }, // Jyeshtha
  { index: 18, nadi: 'Vata',  gana: 'Rakshasa', yoni: 4,  yoniName: 'Köpek',    yoniGender: 'M' }, // Mula
  { index: 19, nadi: 'Pitta', gana: 'Manushya', yoni: 11, yoniName: 'Maymun',   yoniGender: 'M' }, // Purva Ashadha
  { index: 20, nadi: 'Kapha', gana: 'Manushya', yoni: 8,  yoniName: 'Manda',    yoniGender: 'M' }, // Uttara Ashadha
  { index: 21, nadi: 'Kapha', gana: 'Deva',     yoni: 11, yoniName: 'Maymun',   yoniGender: 'F' }, // Shravana
  { index: 22, nadi: 'Pitta', gana: 'Rakshasa', yoni: 12, yoniName: 'Aslan',    yoniGender: 'F' }, // Dhanishta
  { index: 23, nadi: 'Vata',  gana: 'Rakshasa', yoni: 0,  yoniName: 'At',       yoniGender: 'F' }, // Shatabhisha
  { index: 24, nadi: 'Vata',  gana: 'Manushya', yoni: 12, yoniName: 'Aslan',    yoniGender: 'M' }, // Purva Bhadrapada
  { index: 25, nadi: 'Pitta', gana: 'Manushya', yoni: 1,  yoniName: 'Fil',      yoniGender: 'F' }, // Uttara Bhadrapada
  { index: 26, nadi: 'Kapha', gana: 'Deva',     yoni: 13, yoniName: 'İlküizah',  yoniGender: 'F' }, // Revati
];

// ---------- NADI (8 puan) ----------
// Aynı nadi = 0 puan (sağlık/soy uyumsuzluğu sembolü), farklı = 8 puan.
function calcNadi(a: Nakshatra, b: Nakshatra): number {
  return a.nadi === b.nadi ? 0 : 8;
}

// ---------- BHAKUTA (7 puan) ----------
// Vedik rashi'leri arasındaki "ev mesafesi". 6/8 ve 5/9 uyumsuz.
// Nakshatra index → rashi (12 burç): her rashi 2.25 nakshatra (9/4)
function nakshatraToRashi(idx: number): number {
  return Math.floor(idx / 2.25); // 0-11
}
function calcBhakuta(a: Nakshatra, b: Nakshatra): number {
  const ra = nakshatraToRashi(a.index);
  const rb = nakshatraToRashi(b.index);
  const diff = Math.abs(ra - rb);
  const d = Math.min(diff, 12 - diff);
  // 6-8 ve 5-9 mesafeleri kötü; 1, 3, 4, 7, 11 nötr/iyi
  if (d === 6) return 0;       // 6/8 dushta — en kötü
  if (d === 5) return 0;       // 5/9 dushta
  if (d === 2 || d === 12) return 7;
  return 7;                     // varsayılan kabul
}

// ---------- GANA (6 puan) ----------
// Deva-Deva = 6, Manushya-Manushya = 6, Rakshasa-Rakshasa = 6
// Deva-Manushya = 5, Manushya-Rakshasa = 1, Deva-Rakshasa = 0
function calcGana(a: Nakshatra, b: Nakshatra): number {
  if (a.gana === b.gana) return 6;
  const pair = [a.gana, b.gana].sort().join('-');
  if (pair === 'Deva-Manushya') return 5;
  if (pair === 'Manushya-Rakshasa') return 1;
  return 0; // Deva-Rakshasa
}

// ---------- YONI (4 puan) ----------
// 14 hayvan totem. Aynı = 4. Düşman çiftleri = 0. Dost = 3. Nötr = 2.
// Tam tablo karmaşık; MVP'de basitleştirilmiş üç katman.
const YONI_FRIEND_PAIRS: Set<string> = new Set([
  // İnek-At, Köpek-Maymun, Geyik-Köpek dost gibi.
  '7-0', '4-11', '10-4',
]);
const YONI_ENEMY_PAIRS: Set<string> = new Set([
  // Yılan-Manda, Köpek-Geyik, Aslan-Fil düşman.
  '3-8', '4-10', '12-1',
]);
function calcYoni(a: Nakshatra, b: Nakshatra): number {
  if (a.yoni === b.yoni) {
    // Aynı yoni ama cinsiyet karşıt → tam puan
    return a.yoniGender !== b.yoniGender ? 4 : 3;
  }
  const key1 = `${a.yoni}-${b.yoni}`;
  const key2 = `${b.yoni}-${a.yoni}`;
  if (YONI_ENEMY_PAIRS.has(key1) || YONI_ENEMY_PAIRS.has(key2)) return 0;
  if (YONI_FRIEND_PAIRS.has(key1) || YONI_FRIEND_PAIRS.has(key2)) return 3;
  return 2;
}

// ---------- PUBLIC ----------

export type AshtakutaResult = {
  /** 0-100 normalize edilmiş skor */
  score: number;
  /** Ham puanlar */
  raw: { nadi: number; bhakuta: number; gana: number; yoni: number; total: number };
  /** Her boyut için kısa not (TR + EN) */
  notes: {
    nadi: { tr: string; en: string };
    bhakuta: { tr: string; en: string };
    gana: { tr: string; en: string };
    yoni: { tr: string; en: string };
    summary: { tr: string; en: string };
  };
  /** Nakshatra adları (insan tarafından okunur) */
  pair: { aNakshatra: string; bNakshatra: string };
};

const NAK_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu',
  'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta',
  'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
  'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati',
];

export function calculateAshtakuta(aNakIdx: number, bNakIdx: number): AshtakutaResult {
  const a = NAK[aNakIdx]!;
  const b = NAK[bNakIdx]!;
  const nadi = calcNadi(a, b);
  const bhakuta = calcBhakuta(a, b);
  const gana = calcGana(a, b);
  const yoni = calcYoni(a, b);
  const total = nadi + bhakuta + gana + yoni; // max 25
  const score = Math.round((total / 25) * 100);

  return {
    score,
    raw: { nadi, bhakuta, gana, yoni, total },
    notes: {
      nadi: nadi === 8
        ? { tr: 'Sağlık ve soy hattınız uyumlu — farklı nadi enerjisi besler.', en: 'Your health and lineage flows complement each other — different nadi energies nourish.' }
        : { tr: 'Aynı nadi — sağlık ve enerji benzerliği güçlü ama çeşitlilik dengelenmeli.', en: 'Same nadi — strong similarity in health and energy, but variety must be cultivated.' },
      bhakuta: bhakuta === 7
        ? { tr: 'Duygusal ve maddi ritimleriniz birbirini destekliyor.', en: 'Your emotional and material rhythms support each other.' }
        : { tr: 'Bhakuta gerilimi — günlük ritim farkları bilinçli uyum gerektirir.', en: 'Bhakuta tension — daily rhythm differences require conscious alignment.' },
      gana: gana >= 5
        ? { tr: 'Mizaç olarak aynı dili konuşuyorsunuz.', en: 'You speak the same temperament language.' }
        : gana >= 1
          ? { tr: 'Mizaçlarınız farklı — çeviri gerektiren ama büyüten bir denge.', en: 'Different temperaments — a balance that requires translation but fosters growth.' }
          : { tr: 'Mizaçsal kutuplaşma yoğun — bu polarite öğretici olabilir.', en: 'Intense temperamental polarity — this polarity can be highly instructive.' },
      yoni: yoni === 4
        ? { tr: 'İçgüdüsel ve fiziksel çekim çok güçlü.', en: 'Instinctive and physical attraction is very strong.' }
        : yoni >= 2
          ? { tr: 'Fiziksel uyum dengeli — bilinçli ifade derinleştirir.', en: 'Physical harmony is balanced — conscious expression deepens it.' }
          : { tr: 'Yoni gerilimi — fiziksel ifade için yumuşak bir köprü kurulmalı.', en: 'Yoni tension — a soft bridge must be built for physical expression.' },
      summary: {
        tr: `Vedik Ashtakuta: ${score}/100 (${total}/25 puan). Nakshatra eşi: ${NAK_NAMES[aNakIdx]} ↔ ${NAK_NAMES[bNakIdx]}.`,
        en: `Vedic Ashtakuta: ${score}/100 (${total}/25 points). Nakshatra pair: ${NAK_NAMES[aNakIdx]} ↔ ${NAK_NAMES[bNakIdx]}.`,
      },
    },
    pair: {
      aNakshatra: NAK_NAMES[aNakIdx] ?? '?',
      bNakshatra: NAK_NAMES[bNakIdx] ?? '?',
    },
  };
}
