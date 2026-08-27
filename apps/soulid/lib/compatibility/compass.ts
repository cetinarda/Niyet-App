// Çift için 3-kart deterministik Pusula çekimi.
// Major Arcana (22 kart) — seed = iki ismin + iki LP'nin hash'i.
// Kullanım: skor değil sembolik yorum. Apple 4.3 risk yönetimi için
// "kehanet" değil "sembolik gözlem" dilinde sunulur.

export type CompassCard = {
  num: number;
  position: 'past' | 'present' | 'future'; // sembolik konum
  positionTr: string;
  positionEn: string;
  name: string;
  nameEn: string;
  glyph: string;
  reading: { tr: string; en: string }; // ilişki bağlamında kart anlamı
};

const MAJOR_ARCANA: Omit<CompassCard, 'position' | 'positionTr' | 'positionEn'>[] = [
  { num: 0,  name: 'Joker',          nameEn: 'The Fool',          glyph: '🃏', reading: { tr: 'Bu ilişki cesur bir sıçrayış — bilinmeyene birlikte adım atıyorsunuz.', en: 'A bold leap — you step into the unknown together.' } },
  { num: 1,  name: 'Büyücü',         nameEn: 'The Magician',      glyph: '🪄', reading: { tr: 'Birlikteyken manifestasyon gücünüz katlanıyor — niyetinizi netleştirin.', en: 'Together your manifestation power doubles — clarify your intent.' } },
  { num: 2,  name: 'Yüksek Rahibe',  nameEn: 'High Priestess',    glyph: '🌙', reading: { tr: 'Söylenmeyen sezgilerle bağlısınız — sessizliğe güvenin.', en: 'You bond through unspoken intuition — trust the silence.' } },
  { num: 3,  name: 'İmparatoriçe',   nameEn: 'The Empress',       glyph: '👑', reading: { tr: 'Bereket ve yaratım enerjiniz var — birlikte bir şey büyütebilirsiniz.', en: 'You carry creative abundance — you can grow something together.' } },
  { num: 4,  name: 'İmparator',      nameEn: 'The Emperor',       glyph: '⚔️', reading: { tr: 'Yapı ve sınırlar bağınızı destekler — kurallar netleştikçe rahatlarsınız.', en: 'Structure and boundaries support you — clarity brings ease.' } },
  { num: 5,  name: 'Hierofant',      nameEn: 'The Hierophant',    glyph: '🗝️', reading: { tr: 'Geleneksel formlar (söz, ritüel) bu ilişkide önem taşıyor.', en: 'Traditional forms (vows, ritual) hold weight in this relationship.' } },
  { num: 6,  name: 'Aşıklar',        nameEn: 'The Lovers',        glyph: '💞', reading: { tr: 'Kalp seçiminiz hizada — bilinçli bir birlik göstergesi.', en: 'Your heart choice is aligned — a sign of conscious union.' } },
  { num: 7,  name: 'Savaş Arabası',  nameEn: 'The Chariot',       glyph: '🏛️', reading: { tr: 'Birlikte bir hedefe doğru irade gücüyle ilerlersiniz.', en: 'You move toward a shared goal with strong will.' } },
  { num: 8,  name: 'Güç',            nameEn: 'Strength',          glyph: '🦁', reading: { tr: 'Şefkatli güç — birbirinizin vahşi tarafını yumuşatırsınız.', en: 'Gentle strength — you soften each other\'s wild side.' } },
  { num: 9,  name: 'Münzevi',        nameEn: 'The Hermit',        glyph: '🕯️', reading: { tr: 'Yalnız zamana saygı bu bağı korur — sürekli birlikte olmak şart değil.', en: 'Respecting solitude protects this bond — constant togetherness is not required.' } },
  { num: 10, name: 'Kader Çarkı',    nameEn: 'Wheel of Fortune',  glyph: '🎡', reading: { tr: 'Bu birlikteliğin döngüsel bir kaderi var — değişim sürekli.', en: 'This bond carries a cyclical fate — change is constant.' } },
  { num: 11, name: 'Adalet',         nameEn: 'Justice',           glyph: '⚖️', reading: { tr: 'Karşılıklılık ve denge gerek — verilen-alınan dürüstçe konuşulmalı.', en: 'Reciprocity and balance needed — give-and-take must be spoken honestly.' } },
  { num: 12, name: 'Asılan Adam',    nameEn: 'Hanged Man',        glyph: '🙃', reading: { tr: 'Beklemek ve perspektif değişimi gerekecek — direnme.', en: 'Waiting and a shift of perspective is required — do not resist.' } },
  { num: 13, name: 'Ölüm',           nameEn: 'Death',             glyph: '🦋', reading: { tr: 'Bir döngü tamamlanıyor; yeni doğuşa alan açın.', en: 'A cycle is completing; make space for a new birth.' } },
  { num: 14, name: 'Ölçülülük',      nameEn: 'Temperance',        glyph: '🧪', reading: { tr: 'Simyacı uyum — farklı malzemelerden zarif bir karışım yaratırsınız.', en: 'Alchemical harmony — you brew an elegant blend from different materials.' } },
  { num: 15, name: 'Şeytan',         nameEn: 'The Devil',         glyph: '🐐', reading: { tr: 'Bağımlılık tetikleyici — hangi gölgeleri birbirinize yansıttığınızı görmek şifa.', en: 'Attachment trigger — seeing what shadows you mirror is the healing.' } },
  { num: 16, name: 'Kule',           nameEn: 'The Tower',         glyph: '🗼', reading: { tr: 'Sahte yapılar yıkılır — sarsıntı uzun vadede temiz bir temel açar.', en: 'False structures collapse — the shake clears the foundation long-term.' } },
  { num: 17, name: 'Yıldız',         nameEn: 'The Star',          glyph: '⭐', reading: { tr: 'Şifa ve umut — birbirinize derin bir vizyon hatırlatıyorsunuz.', en: 'Healing and hope — you remind each other of a deep vision.' } },
  { num: 18, name: 'Ay',             nameEn: 'The Moon',          glyph: '🌑', reading: { tr: 'İllüzyon ve derinlik — bilinçaltını birlikte yüzeye çıkarırsınız.', en: 'Illusion and depth — you bring the subconscious to the surface together.' } },
  { num: 19, name: 'Güneş',          nameEn: 'The Sun',           glyph: '☀️', reading: { tr: 'Saf neşe ve görünürlük — birlikteyken kim olduğunuz parlıyor.', en: 'Pure joy and visibility — who you are shines when together.' } },
  { num: 20, name: 'Yargı',          nameEn: 'Judgement',         glyph: '📯', reading: { tr: 'Bir çağrı duyuluyor — birlikte yeni bir bilince uyanıyorsunuz.', en: 'A call is heard — you awaken to a new consciousness together.' } },
  { num: 21, name: 'Dünya',          nameEn: 'The World',         glyph: '🌍', reading: { tr: 'Bütünleşme ve tamamlama — bu birliktelik bir devri kutluyor.', en: 'Integration and completion — this bond celebrates a cycle.' } },
];

const POSITIONS = {
  past:    { tr: 'Geçmiş', en: 'Past',    long: { tr: 'Sizi bir araya getiren', en: 'What brought you together' } },
  present: { tr: 'Şimdi',  en: 'Present', long: { tr: 'Şu an birlikte deneyimlediğiniz', en: 'What you experience now' } },
  future:  { tr: 'Pusula', en: 'Compass', long: { tr: 'Birlikte gitmeniz gereken yön', en: 'The direction to move together' } },
} as const;

// xorshift hash — deterministik seed üretimi
function strSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h = (h ^ s.charCodeAt(i)) * 16777619;
    h = h >>> 0;
  }
  return h;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type CoupleCompass = {
  cards: [CompassCard, CompassCard, CompassCard];
  seedInput: string;
};

export function drawCoupleCompass(
  nameA: string,
  nameB: string,
  lifePathA: number,
  lifePathB: number,
): CoupleCompass {
  const seedInput = [nameA.trim().toLowerCase(), nameB.trim().toLowerCase(), lifePathA, lifePathB]
    .sort()
    .join('|');
  const rng = mulberry32(strSeed(seedInput));
  const positions = (['past', 'present', 'future'] as const);
  const drawn = new Set<number>();
  const cards = positions.map((pos) => {
    let idx: number;
    do {
      idx = Math.floor(rng() * MAJOR_ARCANA.length);
    } while (drawn.has(idx));
    drawn.add(idx);
    const arcana = MAJOR_ARCANA[idx]!;
    return {
      ...arcana,
      position: pos,
      positionTr: POSITIONS[pos].long.tr,
      positionEn: POSITIONS[pos].long.en,
    } as CompassCard;
  }) as [CompassCard, CompassCard, CompassCard];

  return { cards, seedInput };
}
