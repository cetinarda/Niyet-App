// Günün sözü havuzu.
// ⚠️ GÜNCEL KURAL (Eyl 2026, kullanıcı: "Yunus Emre, Aşık Veysel çok çıkıyor;
// Schopenhauer, Jung, Yunus Emre, Aşık Veysel eşit ağırlıkta olsun"): HER KAYNAK
// EŞİT ŞANSLA seçilir. Kaynak havuz (quotes.json) çok dengesizdi: 156 sözün 64'ü
// Mevlana. Eski kural her kaynağa 8 söz hakkı verip Yunus'u bilerek havuzun ~%25'ine
// çıkarıyordu; Yunus ve Aşık Veysel bu yüzden sık, Schopenhauer/Jung (5'er söz)
// seyrek geliyordu.
// Şimdi: kaynaklar gruplanır, her grup havuzda AYNI sayıda yer kaplar (en büyük
// grubun boyu kadar, küçük grupların sözleri döngüyle tekrarlanır). Rastgele seçim
// böylece önce "kimden" sorusunda eşit, sonra o kişinin sözleri arasında eşit olur.
// Tek sözlü küçük gelenekler kendi felsefe ailesine katılır, yoksa o kaynak her
// geldiğinde AYNI söz çıkardı: Dhammapada + Zen → Buddha, Zhuangzi → Laozi,
// Seneca + Marcus Aurelius → Epiktetos (Stoacılık).
// Ana uygulamadaki İçsel Harita "günün sözü" de aynı kuralı kullanır
// (src/quotes-data.js pickBalancedQuote). Birini değiştirirsen ikisini de değiştir.
//
// İçerik tonu: "din ve Allah" vaaz eden / akaid-zühd sözler yerine ŞİİRSEL ve
// HAYATA dair derviş sözleri öne çıksın (kullanıcı isteği). Aşağıdaki BLOCKLIST
// yalnızca doğrudan akide/vaaz/zühd tonundaki birkaç sözü havuzdan çıkarır;
// "Gel gel ne olursan ol", "Cennet cennet dedikleri", "Tanrı'yı insanda ara"
// gibi ŞİİRSEL/hümanist tasavvuf sözleri KORUNUR (bunlar tam da istenen ton).
const BLOCKLIST = new Set<string>([
  'q015', // "Gönlünü yıka; o Allah'ın evi olacak": doğrudan akide
  'q058', // "Dört kapı kırk makam: şeriat, tarikat...": doktrin/liste
  'q073', // "Allah bir, Muhammed hak, Ali...": kelime-i şehadet/akide
  'q078', // "Her kim Allah'ı severse halkı da sever": vaaz
  'q079', // "Allah yolunda ölmek şeref": şehadet/zühd
  'q084', // "Dünyayı seven Allah'ı unutur": zühd vaazı
  'q160', // "Kul... dergâhın kapısı açılır": akide tonu
]);

export const QUOTE_GROUP: Record<string, string> = {
  'Dhammapada': 'Buddha',
  'Zen Geleneği': 'Buddha',
  'Zhuangzi': 'Laozi',
  'Seneca': 'Epiktetos',
  'Marcus Aurelius': 'Epiktetos',
};

export function buildQuotePool(quotes: { id: string; source: string }[]): string[] {
  const clean = quotes.filter(q => !BLOCKLIST.has(q.id));
  const src = clean.length ? clean : quotes;

  const byGroup: Record<string, string[]> = {};
  for (const q of src) {
    const g = QUOTE_GROUP[q.source] || q.source;
    (byGroup[g] = byGroup[g] || []).push(q.id);
  }
  const groups = Object.values(byGroup);
  if (!groups.length) return src.map(q => q.id);
  const K = Math.max(...groups.map(g => g.length));
  const pool: string[] = [];
  for (const g of groups) for (let i = 0; i < K; i++) pool.push(g[i % g.length]);
  return pool;
}
