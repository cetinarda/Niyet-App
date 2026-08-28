// Günün sözü havuzu: iki damar bir arada.
//   1) Anadolu damarı: Mevlana, Yunus, Şems, Hacı Bektaş, Aşık Veysel, Tasavvuf
//      geleneği (tanınmayan ozanlar kullanıcı isteğiyle havuzdan çıkarıldı).
//   2) Ev metaforu damarı: Stoacılık temel, Budizm duvarlar, Taoizm pencereler,
//      Schopenhauer yatak odası, Jung bodrum (gölge), Gestalt eşik (şimdi).
//      Bu kayıtların `room` alanı hangi odaya ait olduklarını söyler.
// Kaynak-dengeli: her kaynak en fazla CAP söz katkısı verir (böylece hiçbir isim,
// özellikle Mevlana, baskın olmaz), Yunus ise havuzun ~1/4'ünü doldurur.
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

export function buildQuotePool(quotes: { id: string; source: string }[]): string[] {
  const clean = quotes.filter(q => !BLOCKLIST.has(q.id));
  const src = clean.length ? clean : quotes;

  const bySource: Record<string, string[]> = {};
  for (const q of src) (bySource[q.source] = bySource[q.source] || []).push(q.id);

  const YUNUS = 'Yunus Emre';
  const yunus = bySource[YUNUS] || [];
  const CAP = 8; // kaynak başına üst sınır → Mevlana da "diğer dervişler gibi"
  const others: string[] = [];
  for (const s of Object.keys(bySource)) {
    if (s === YUNUS) continue;
    others.push(...bySource[s].slice(0, CAP));
  }

  // Yunus'u ~%25'e getir: hâlâ en ağırlıklı tek isim ama havuzu domine etmez.
  // Kalanın yaklaşık üçte biri ev metaforu odalarından gelir.
  const yunusSlots = yunus.length ? Math.round(others.length / 3) : 0;
  const yunusPool: string[] = [];
  for (let i = 0; i < yunusSlots; i++) yunusPool.push(yunus[i % yunus.length]);

  const pool = [...yunusPool, ...others];
  return pool.length ? pool : src.map(q => q.id);
}
