// SAKİN'E ÖZET KÖPRÜSÜ (SoulID → Sakin "Ben" ekranındaki Ruh Profili kutusu)
// ---------------------------------------------------------------------------
// NEDEN: Kullanıcı Sakin'in "Ben" ekranında, Human Design kutusunun üstünde bir
// "Ruh Profili" özeti istedi (Sayı Ailesi · geldiği galaksi · önceki yaşam
// arketipi · geliş sebebi · en güçlü yönü) ve altında "Tam profil" düğmesi.
//
// NEDEN HOST KENDİ HESAPLAMIYOR: Sakin'de gezegen konumları yok; kaba bir
// tahmin SoulID'nin gerçek haritasıyla ÇELİŞEN değerler üretir. Aynı hata
// element dağılımında bir kez yaşandı (bkz. kök CLAUDE.md: "host kaba 4-nokta
// tahmini YANLIŞ değer üretiyordu"). Bu yüzden hesap TEK YERDE, burada yapılır;
// host yalnızca OKUR. Embed host ile aynı origin'de servis edildiği için
// localStorage doğrudan paylaşılıyor, köprüye/postMessage'a gerek yok.
//
// KİŞİSEL VERİ: Buraya yalnızca zaten Sakin'de bulunan doğum verisinden türeyen
// özet yazılır, hiçbir yere GÖNDERİLMEZ, ad/tarih/şehir tekrar yazılmaz.

import type { GalacticReport } from './types';

export const SAKIN_SUMMARY_KEY = 'sakin_soul_summary';
export const SAKIN_SUMMARY_VERSION = 1;

export type SakinSoulSummary = {
  v: number;
  updatedAt: string;
  /** Sayı Ailesi: yaşam yolu sayısının ait olduğu üçlü (bkz. NUMBER_FAMILIES) */
  numberFamily: { n: number; tr: string; en: string };
  /** Geldiği yıldız sistemi / galaksi */
  galaxy: string;
  race: string;
  emoji: string;
  /** Önceki yaşamlarda iz bıraktığı arketip */
  pastArchetype: string;
  /**
   * Geliş sebebi. ESKİDEN görevlerin ilkinin BAŞLIĞIYDI, yani "Kuzey Düğüm
   * Görevi: Pisces" gibi teknik bir önek geliyordu (kullanıcı bildirdi:
   * "kuzey ay düğümü pisces yazıyor, öneki sil, ay düğümünü belirtmene gerek
   * yok"). Artık kendi başına duran kısa bir cümle; hangi teknik veriden
   * türediğini söylemiyor.
   *
   * TİP NOTU: eski sürümlerde düz string yazılmıştı. Host iki şekli de
   * okuyor (string ise olduğu gibi, obje ise dile göre), böylece güncelleme
   * anında elinde eski özet olan kullanıcıda kutu boşalmıyor.
   */
  purpose: { tr: string; en: string };
  /** En yüksek çıkan güçlü yön */
  strength: { key: 'speed' | 'creativity' | 'charisma'; tr: string; en: string };
};

// ── SAYI AİLESİ ────────────────────────────────────────────────────────────
// Pisagor numerolojisindeki üç düzlem: 1-4-7 / 2-5-8 / 3-6-9. Usta sayılar
// (11/22/33) kendi köklerine iner (11→2, 22→4, 33→6), çünkü aile o kökün
// düzlemine aittir. Bu gruplama SoulID'de daha önce yoktu, burada tanımlandı.
const NUMBER_FAMILIES: Record<number, { tr: string; en: string }> = {
  1: { tr: 'Kurucular (1 · 4 · 7)', en: 'Founders (1 · 4 · 7)' },
  2: { tr: 'Köprüler (2 · 5 · 8)', en: 'Bridges (2 · 5 · 8)' },
  0: { tr: 'Işıklar (3 · 6 · 9)', en: 'Lights (3 · 6 · 9)' },
};

function numberFamilyOf(lifePath: number): { n: number; tr: string; en: string } {
  const root = lifePath === 11 ? 2 : lifePath === 22 ? 4 : lifePath === 33 ? 6 : lifePath;
  const fam = NUMBER_FAMILIES[root % 3] ?? NUMBER_FAMILIES[0];
  return { n: root, ...fam };
}

// ── GÜÇLÜ YÖN: hız / yaratıcılık / karizma ────────────────────────────────
// Kullanıcı "hangisi en yüksekse onu göster" dedi; SoulID'de böyle bir ölçüm
// yoktu, burada tanımlandı. Puanlar haritanın KENDİ verisinden geliyor,
// rastgelelik yok: aynı doğum verisi hep aynı sonucu verir.
//   hız         → Mars/Merkür ateş-hava burçlarında, Koç/Yay vurgusu, yol 1/5
//   yaratıcılık → Güneş/Venüs/Neptün, Boğa/Terazi/Balık vurgusu, yol 3/6
//   karizma     → Yükselen ve Güneş Aslan/Terazi/Yay'da, Jüpiter, yol 8/22
const FIRE_AIR = ['Aries', 'Leo', 'Sagittarius', 'Gemini', 'Libra', 'Aquarius'];
const ART_SIGNS = ['Taurus', 'Libra', 'Pisces', 'Cancer'];
const SHINE_SIGNS = ['Leo', 'Libra', 'Sagittarius'];

function strengthOf(report: GalacticReport): SakinSoulSummary['strength'] {
  const sign = (name: string) => report.chart.planets.find((p) => p.name === name)?.sign ?? '';
  const asc = report.chart.ascendantSign;
  const lp = report.numerology.lifePath;
  const exp = report.numerology.expression;

  let speed = 0, creativity = 0, charisma = 0;

  if (FIRE_AIR.includes(sign('Mars'))) speed += 3;
  if (FIRE_AIR.includes(sign('Mercury'))) speed += 2;
  if (asc === 'Aries' || asc === 'Sagittarius') speed += 2;
  if (lp === 1 || lp === 5) speed += 3;
  if (exp === 5) speed += 1;

  if (ART_SIGNS.includes(sign('Venus'))) creativity += 3;
  if (ART_SIGNS.includes(sign('Sun'))) creativity += 2;
  if (ART_SIGNS.includes(sign('Neptune'))) creativity += 1;
  if (lp === 3 || lp === 6 || lp === 33) creativity += 3;
  if (exp === 3) creativity += 1;

  if (SHINE_SIGNS.includes(asc)) charisma += 3;
  if (SHINE_SIGNS.includes(sign('Sun'))) charisma += 2;
  if (SHINE_SIGNS.includes(sign('Jupiter'))) charisma += 1;
  if (lp === 8 || lp === 22) charisma += 3;
  if (exp === 1 || exp === 8) charisma += 1;

  const rows: Array<{ key: SakinSoulSummary['strength']['key']; score: number; tr: string; en: string }> = [
    { key: 'speed', score: speed, tr: 'Hız', en: 'Speed' },
    { key: 'creativity', score: creativity, tr: 'Yaratıcılık', en: 'Creativity' },
    { key: 'charisma', score: charisma, tr: 'Karizma', en: 'Charisma' },
  ];
  // Beraberlikte sıra sabit (hız > yaratıcılık > karizma): sonuç deterministik
  // kalsın, aynı kullanıcıda her açılışta değişmesin.
  rows.sort((a, b) => b.score - a.score);
  const top = rows[0];
  return { key: top.key, tr: top.tr, en: top.en };
}

// ── GELİŞ SEBEBİ ──────────────────────────────────────────────────────────
// Kuzey Düğüm, ruhun BU HAYATTA öğrenmeye geldiği yönü gösterir. Kısa bir
// cümleye indirildi: kullanıcı kartta teknik terim değil, kendisine dair tek
// bir cümle görmek istiyor. Metin düğümü ADLANDIRMIYOR.
const PURPOSE_BY_NODE: Record<string, { tr: string; en: string }> = {
  Aries:       { tr: 'Kendi ayakları üstünde durmayı öğrenmek', en: 'To learn to stand on your own' },
  Taurus:      { tr: 'Köklenmek ve sadeleşmek',                 en: 'To take root and simplify' },
  Gemini:      { tr: 'Merakın peşinden gitmek',                 en: 'To follow your curiosity' },
  Cancer:      { tr: 'Duyguya alan açmak',                      en: 'To make room for feeling' },
  Leo:         { tr: 'Kendi ışığını sahiplenmek',               en: 'To own your own light' },
  Virgo:       { tr: 'Düzeni ve emeği bulmak',                  en: 'To find order and craft' },
  Libra:       { tr: 'Birlikte olmayı öğrenmek',                en: 'To learn to be with others' },
  Scorpio:     { tr: 'Derinliğe ve dönüşüme girmek',            en: 'To enter depth and change' },
  Sagittarius: { tr: 'Kendi anlamını aramak',                   en: 'To seek your own meaning' },
  Capricorn:   { tr: 'Sorumluluğu üstlenmek',                   en: 'To take responsibility' },
  Aquarius:    { tr: 'Bütüne katkı vermek',                     en: 'To give back to the whole' },
  Pisces:      { tr: 'Bırakmayı öğrenmek',                      en: 'To learn to let go' },
};

function purposeOf(report: GalacticReport): { tr: string; en: string } {
  const nn = report.chart.planets.find((p) => p.name === 'NorthNode')?.sign ?? '';
  return PURPOSE_BY_NODE[nn] ?? { tr: '', en: '' };
}

export function buildSakinSummary(report: GalacticReport): SakinSoulSummary {
  return {
    v: SAKIN_SUMMARY_VERSION,
    updatedAt: new Date().toISOString(),
    numberFamily: numberFamilyOf(report.numerology.lifePath),
    galaxy: report.origin.starSystem,
    race: report.origin.race,
    emoji: report.origin.emoji,
    pastArchetype: report.origin.archetype,
    purpose: purposeOf(report),
    strength: strengthOf(report),
  };
}

/**
 * Özeti Sakin'in okuyabileceği yere yazar. Sessizce başarısız olur: bu bir
 * yan kazanım, SoulID'nin kendi akışını asla bozmamalı (özel pencere, dolu
 * depo, izin reddi).
 */
export function writeSakinSummary(report: GalacticReport): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SAKIN_SUMMARY_KEY, JSON.stringify(buildSakinSummary(report)));
  } catch {
    /* sessiz */
  }
}
