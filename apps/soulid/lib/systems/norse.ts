// Norse Elder Futhark — 24 rune, doğum tarihine göre

const RUNES = [
  { name: 'Berkano', glyph: 'ᛒ', meaning: 'Huş ağacı', power: 'Doğum, büyüme, dişil koruma', from: [12, 28], to: [1, 13] },
  { name: 'Ehwaz', glyph: 'ᛖ', meaning: 'At', power: 'Ortaklık, hareket, sadakat', from: [1, 13], to: [1, 28] },
  { name: 'Mannaz', glyph: 'ᛗ', meaning: 'İnsan', power: 'Topluluk, ben-sen denkliği', from: [1, 28], to: [2, 12] },
  { name: 'Laguz', glyph: 'ᛚ', meaning: 'Su', power: 'Sezgi, akış, bilinçaltı', from: [2, 12], to: [2, 27] },
  { name: 'Inguz', glyph: 'ᛜ', meaning: 'İng/Bereket', power: 'Tohum, manifestasyon süreci', from: [2, 27], to: [3, 14] },
  { name: 'Dagaz', glyph: 'ᛞ', meaning: 'Gün', power: 'Atılım, farkındalık şafağı', from: [3, 14], to: [3, 29] },
  { name: 'Othala', glyph: 'ᛟ', meaning: 'Miras', power: 'Atalardan gelen ev, kök', from: [3, 29], to: [4, 13] },
  { name: 'Fehu', glyph: 'ᚠ', meaning: 'Sığır/Servet', power: 'Bolluk, akan zenginlik', from: [4, 13], to: [4, 28] },
  { name: 'Uruz', glyph: 'ᚢ', meaning: 'Yaban öküzü', power: 'Ham güç, vahşi sağlık', from: [4, 28], to: [5, 13] },
  { name: 'Thurisaz', glyph: 'ᚦ', meaning: 'Dev/Diken', power: 'Koruma, kararlı sınır', from: [5, 13], to: [5, 28] },
  { name: 'Ansuz', glyph: 'ᚨ', meaning: 'Odin/Ses', power: 'Kutsal söz, iletişim, ilham', from: [5, 28], to: [6, 13] },
  { name: 'Raidho', glyph: 'ᚱ', meaning: 'Yolculuk', power: 'Ritim, yolun kendisi', from: [6, 13], to: [6, 28] },
  { name: 'Kenaz', glyph: 'ᚲ', meaning: 'Meşale', power: 'İçsel ateş, açığa çıkarma', from: [6, 28], to: [7, 13] },
  { name: 'Gebo', glyph: 'ᚷ', meaning: 'Hediye', power: 'Karşılıklı bağ, kutsal değiş', from: [7, 13], to: [7, 28] },
  { name: 'Wunjo', glyph: 'ᚹ', meaning: 'Sevinç', power: 'Uyum, tatmin, neşe', from: [7, 28], to: [8, 13] },
  { name: 'Hagalaz', glyph: 'ᚺ', meaning: 'Dolu', power: 'Yıkıcı arınma, kozmik kriz', from: [8, 13], to: [8, 28] },
  { name: 'Nauthiz', glyph: 'ᚾ', meaning: 'İhtiyaç', power: 'Direnci dönüştürme, sebat', from: [8, 28], to: [9, 13] },
  { name: 'Isa', glyph: 'ᛁ', meaning: 'Buz', power: 'Statik, yansıma, durulma', from: [9, 13], to: [9, 28] },
  { name: 'Jera', glyph: 'ᛃ', meaning: 'Hasat', power: 'Döngü, doğru zaman, sabır', from: [9, 28], to: [10, 13] },
  { name: 'Eihwaz', glyph: 'ᛇ', meaning: 'Porsuk ağacı', power: 'Yaşam-ölüm ekseni, dayanıklılık', from: [10, 13], to: [10, 28] },
  { name: 'Perthro', glyph: 'ᛈ', meaning: 'Kupa/Sır', power: 'Kader, kadın bilgisi, oyun', from: [10, 28], to: [11, 13] },
  { name: 'Algiz', glyph: 'ᛉ', meaning: 'Geyik', power: 'Yüksek koruma, kutsal bağ', from: [11, 13], to: [11, 28] },
  { name: 'Sowilo', glyph: 'ᛋ', meaning: 'Güneş', power: 'Zafer, sağlık, vital ışık', from: [11, 28], to: [12, 13] },
  { name: 'Tiwaz', glyph: 'ᛏ', meaning: 'Tyr/Adalet', power: 'Onurlu savaş, hakikat', from: [12, 13], to: [12, 28] },
];

export type NorseResult = {
  rune: { name: string; glyph: string; meaning: string; power: string };
};

export function calculateNorse(birthISO: string): NorseResult {
  const date = new Date(birthISO);
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const md = month * 100 + day;

  for (const r of RUNES) {
    const from = r.from[0]! * 100 + r.from[1]!;
    const to = r.to[0]! * 100 + r.to[1]!;
    if (from > to) {
      // Wrap around year end (e.g., Berkano 12/28 → 1/13)
      if (md >= from || md < to) return { rune: r };
    } else if (md >= from && md < to) {
      return { rune: r };
    }
  }
  return { rune: RUNES[0]! };
}
