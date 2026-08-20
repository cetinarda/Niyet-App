// Tarot Birth Cards: Personality + Soul (Major Arcana)
// Method: Mary K. Greer formülü

const MAJOR_ARCANA = [
  { num: 0, name: 'Joker (Fool)', glyph: '🃏', power: 'Cesur sıçrayış, sınırsız potansiyel' },
  { num: 1, name: 'Büyücü (Magician)', glyph: '🪄', power: 'Manifestasyon, irade, kanal' },
  { num: 2, name: 'Yüksek Rahibe (High Priestess)', glyph: '🌙', power: 'Sezgi, gizli bilgi, içsel ses' },
  { num: 3, name: 'İmparatoriçe (Empress)', glyph: '👑', power: 'Bereket, anaerkil bolluk, sanat' },
  { num: 4, name: 'İmparator (Emperor)', glyph: '⚔️', power: 'Yapı, otorite, koruyucu baba' },
  { num: 5, name: 'Hierofant (Hierophant)', glyph: '🗝️', power: 'Geleneksel bilgelik, öğretmen' },
  { num: 6, name: 'Aşıklar (Lovers)', glyph: '💞', power: 'Kalp seçimi, kutsal birlik' },
  { num: 7, name: 'Savaş Arabası (Chariot)', glyph: '🏛️', power: 'İrade gücü, zafer, kontrol' },
  { num: 8, name: 'Güç (Strength)', glyph: '🦁', power: 'Şefkatli güç, içsel uysallaştırma' },
  { num: 9, name: 'Münzevi (Hermit)', glyph: '🕯️', power: 'İç ışık, yalnız bilgelik' },
  { num: 10, name: 'Kader Çarkı (Wheel)', glyph: '🎡', power: 'Döngüsel değişim, kader' },
  { num: 11, name: 'Adalet (Justice)', glyph: '⚖️', power: 'Denge, hakikat, neden-sonuç' },
  { num: 12, name: 'Asılan Adam (Hanged Man)', glyph: '🙃', power: 'Perspektif değişimi, teslimiyet' },
  { num: 13, name: 'Ölüm (Death)', glyph: '🦋', power: 'Dönüşüm, eski sondan yeni doğum' },
  { num: 14, name: 'Ölçülülük (Temperance)', glyph: '🧪', power: 'Sentez, simya, ölçü' },
  { num: 15, name: 'Şeytan (Devil)', glyph: '🐐', power: 'Bağımlılık görme, gölge bütünleme' },
  { num: 16, name: 'Kule (Tower)', glyph: '🗼', power: 'Sahte yapının yıkılışı, uyanış' },
  { num: 17, name: 'Yıldız (Star)', glyph: '⭐', power: 'Umut, kozmik şifa, vizyon' },
  { num: 18, name: 'Ay (Moon)', glyph: '🌑', power: 'İllüzyon, derin bilinçaltı, rüya' },
  { num: 19, name: 'Güneş (Sun)', glyph: '☀️', power: 'Saf neşe, açık görüş, vitalite' },
  { num: 20, name: 'Yargı (Judgement)', glyph: '📯', power: 'Çağrı, hatırlama, kalkış' },
  { num: 21, name: 'Dünya (World)', glyph: '🌍', power: 'Bütünleşme, tamamlama, kutlama' },
];

function sumDigits(n: number): number {
  return Math.abs(n).toString().split('').reduce((a, d) => a + Number(d), 0);
}

function reduceToMajor(n: number): number {
  // Reduce until <= 21
  let v = n;
  while (v > 21) v = sumDigits(v);
  return v;
}

export type TarotResult = {
  personality: { num: number; name: string; glyph: string; power: string };
  soul: { num: number; name: string; glyph: string; power: string };
  signature: string;
};

export function calculateTarot(birthISO: string): TarotResult {
  const [y, m, d] = birthISO.slice(0, 10).split('-').map(Number);
  const total = sumDigits(y!) + sumDigits(m!) + sumDigits(d!);
  // Personality: reduced once (typically 10-21 range)
  let personality = total;
  while (personality > 21) personality = sumDigits(personality);
  // Soul: further reduced to single digit (1-9)
  let soul = personality;
  while (soul > 9) soul = sumDigits(soul);

  const pCard = MAJOR_ARCANA[personality]!;
  const sCard = MAJOR_ARCANA[soul]!;

  return {
    personality: pCard,
    soul: sCard,
    signature: `${pCard.name} · ${sCard.name}`,
  };
}
