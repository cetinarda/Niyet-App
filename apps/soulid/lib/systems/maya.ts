// Maya Tzolkin: 260 günlük kutsal takvim (20 day sign × 13 tone)
// GMT korelasyonu 584283 (modern: J. Eric S. Thompson)

const DAY_SIGNS = [
  { tr: 'İmix (Su Ejderhası)', en: 'Imix', glyph: '🐊', element: 'Su', power: 'Doğuş, ana suları, yaratıcı kaos' },
  { tr: 'Ik (Rüzgâr)', en: 'Ik', glyph: '🌬️', element: 'Hava', power: 'Nefes, ruh, iletişim' },
  { tr: 'Akbal (Gece)', en: 'Akbal', glyph: '🌙', element: 'Karanlık', power: 'Rüya, mağara, içsel ışık' },
  { tr: 'Kan (Tohum)', en: 'Kan', glyph: '🌱', element: 'Toprak', power: 'Potansiyel, hedef, mısır' },
  { tr: 'Chicchan (Yılan)', en: 'Chicchan', glyph: '🐍', element: 'Ateş', power: 'Yaşam gücü, kundalini, dönüşüm' },
  { tr: 'Cimi (Dünya Geçişi)', en: 'Cimi', glyph: '🦋', element: 'Geçiş', power: 'Ölüm-doğum eşiği, atalara köprü' },
  { tr: 'Manik (Geyik)', en: 'Manik', glyph: '🦌', element: 'Şifa', power: 'Şifa eli, şamanlık' },
  { tr: 'Lamat (Yıldız/Tavşan)', en: 'Lamat', glyph: '⭐', element: 'Venüs', power: 'Bolluk, sanat, çoğalma' },
  { tr: 'Muluc (Su)', en: 'Muluc', glyph: '💧', element: 'Su', power: 'Akış, arınma, sunum' },
  { tr: 'Oc (Köpek)', en: 'Oc', glyph: '🐕', element: 'Sadakat', power: 'Aşk, yol arkadaşı, rehber' },
  { tr: 'Chuen (Maymun)', en: 'Chuen', glyph: '🐒', element: 'Sanat', power: 'Yaratıcılık, oyun, dokuma' },
  { tr: 'Eb (Ot)', en: 'Eb', glyph: '🌿', element: 'Yol', power: 'İnsanlık yolu, kader' },
  { tr: 'Ben (Kamış)', en: 'Ben', glyph: '🌾', element: 'Otorite', power: 'Köprü kuran, evrensel destek' },
  { tr: 'Ix (Jaguar)', en: 'Ix', glyph: '🐆', element: 'Büyücü', power: 'Şamansı güç, dişil bilgelik' },
  { tr: 'Men (Kartal)', en: 'Men', glyph: '🦅', element: 'Görüş', power: 'Vizyon, yüksek perspektif' },
  { tr: 'Cib (Baykuş/Akbaba)', en: 'Cib', glyph: '🦉', element: 'Bilgelik', power: 'Atalardan gelen ses' },
  { tr: 'Caban (Deprem)', en: 'Caban', glyph: '🌍', element: 'Senkronizasyon', power: 'Gaia, navigasyon, deprem' },
  { tr: 'Etznab (Ayna/Çakmaktaşı)', en: 'Etznab', glyph: '🔪', element: 'Hakikat', power: 'Sonsuz yansıma, kılıç' },
  { tr: 'Cauac (Fırtına)', en: 'Cauac', glyph: '⚡', element: 'Katalizör', power: 'Şimşekli arınma' },
  { tr: 'Ahau (Güneş/Çiçek)', en: 'Ahau', glyph: '🌞', element: 'Aydınlanma', power: 'Evrensel ateş, koşulsuz sevgi' },
];

const TONES = [
  { num: 1, tr: 'Bir · Birleşik', power: 'Niyet, yaratıcı kıvılcım' },
  { num: 2, tr: 'İki · Polar', power: 'Stabilizasyon, denge, ikilem' },
  { num: 3, tr: 'Üç · Elektrik', power: 'Aktivasyon, hizmet' },
  { num: 4, tr: 'Dört · Öz', power: 'Form, tanımlanma' },
  { num: 5, tr: 'Beş · Işıyan', power: 'Komuta, merkez' },
  { num: 6, tr: 'Altı · Ritmik', power: 'Organizasyon, denge' },
  { num: 7, tr: 'Yedi · Rezonant', power: 'Bağlanma, içe çekiliş' },
  { num: 8, tr: 'Sekiz · Galaktik', power: 'Bütünlük, model olma' },
  { num: 9, tr: 'Dokuz · Solar', power: 'Niyetin gerçekleşmesi' },
  { num: 10, tr: 'On · Gezegensel', power: 'Manifestasyon' },
  { num: 11, tr: 'On Bir · Spektral', power: 'Çözülme, bırakma' },
  { num: 12, tr: 'On İki · Kristal', power: 'İşbirliği, evrensellik' },
  { num: 13, tr: 'On Üç · Kozmik', power: 'Aşkınlık, mevcudiyet' },
];

const GMT_CORRELATION = 584283;

function julianDayFromGregorian(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const a = Math.floor(year / 100);
  const b = 2 - a + Math.floor(a / 4);
  return (
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day +
    b -
    1524.5
  );
}

export type MayaResult = {
  kin: number;
  daySign: { index: number; tr: string; en: string; glyph: string; element: string; power: string };
  tone: { num: number; tr: string; power: string };
  signature: string;
};

export function calculateMaya(birthISO: string): MayaResult {
  const date = new Date(birthISO);
  const jd = julianDayFromGregorian(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
  const daysSinceCreation = Math.floor(jd) - GMT_CORRELATION;
  const tzolkin = ((daysSinceCreation % 260) + 260) % 260;
  const daySignIdx = tzolkin % 20;
  const toneIdx = tzolkin % 13;
  const daySign = DAY_SIGNS[daySignIdx]!;
  const tone = TONES[toneIdx]!;
  return {
    kin: tzolkin + 1,
    daySign: { index: daySignIdx, ...daySign },
    tone,
    signature: `${tone.tr.split(' · ')[0]} ${daySign.tr.split(' (')[0]} · Kin ${tzolkin + 1}`,
  };
}
