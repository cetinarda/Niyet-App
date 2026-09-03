// BÜYÜK ŞEHİR VERİ TABANI (36 bin kayıt), Sakin host'undan gelir.
//
// NEDEN VAR: SoulID'nin kendi offline listesi (./cities.ts) 158 şehirdi ve
// birincil çözüm ağ üzerindeki Open-Meteo'ydu. Ağ boş dönünce (yavaş bağlantı,
// review ağı, uçak modu) o 158 şehrin dışındaki her doğum yeri çözülemiyordu.
// Kullanıcı bildirdi: "ruh profili, doğum yeri girilemiyor bazı şehirler yok."
// Sakin host'unda zaten 36 bin şehirlik bir tablo var ve orada sorun yaşanmıyor;
// aynı tablo buraya da alındı, yedek artık host'la aynı kapsamda.
//
// KAYNAK DOSYA: /src/cities-data.json (TEK DOĞRU KAYNAK). Buradaki
// `cities-big.json` onun kopyasıdır ve `scripts/build-capacitor.mjs` her embed
// build'inde kaynaktan YENİDEN KOPYALAR: elle senkron tutmak gerekmez, iki
// dosyanın ayrışması mümkün değil.
//
// SATIR BİÇİMİ: [ad, enlem, boylam, SAYISAL utc ofseti, ülke kodu, ascii?]
// Ofset SAYISAL (IANA saat dilimi adı DEĞİL): tüketiciler `utcOffset` alanını
// okur, `timezone` boş kalır (bkz. GeocodeResult ve report/index.ts).

export type BigCityHit = {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  /** Saatlik sayısal UTC ofseti (standart/kış saati). */
  utcOffset: number;
};

type Row = [string, number, number, number, string, string?];

let _rows: Row[] | null = null;
let _loading: Promise<void> | null = null;

/** Aramada kullanılan normalize: küçült, Türkçe İ/ı farkını erit, boşlukları kırp. */
export function normalizeBig(s: string): string {
  return (s || '')
    .toLocaleLowerCase('tr')
    .replace(/i̇/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ı/g, 'i')
    .trim();
}

/** 1.4 MB'lık tabloyu YALNIZCA gerektiğinde indirir (ayrı chunk). */
export async function ensureBigCities(): Promise<void> {
  if (_rows) return;
  if (_loading) return _loading;
  _loading = import('./cities-big.json')
    .then((mod) => {
      // JSON'un tipi TS tarafından (string|number)[][] olarak çıkarılıyor;
      // gerçek biçim sabit ([ad, lat, lon, tz, ülke, ascii?]), `unknown`
      // üzerinden daraltıyoruz.
      const raw = (mod as unknown as { default?: unknown }).default ?? (mod as unknown);
      _rows = raw as Row[];
    })
    .catch(() => {
      // Yükleme başarısızsa sessiz kal: çağıran taraf küçük listeye/ağa düşer.
      _rows = [];
      _loading = null;
    });
  return _loading;
}

/**
 * Yerel büyük tabloda arar. Önce birebir, sonra baştan eşleşme, sonra içerme.
 * `ensureBigCities()` çağrılmadıysa boş döner (senkron kullanım güvenli).
 */
export function searchBigCities(query: string, limit = 5): BigCityHit[] {
  const rows = _rows;
  if (!rows || rows.length === 0) return [];
  const q = normalizeBig(query);
  if (q.length < 2) return [];

  const exact: BigCityHit[] = [];
  const prefix: BigCityHit[] = [];
  const sub: BigCityHit[] = [];
  const toHit = (r: Row): BigCityHit => ({
    name: r[0], country: r[4], latitude: r[1], longitude: r[2], utcOffset: r[3],
  });

  for (const r of rows) {
    const n = normalizeBig(r[0]);
    const a = r[5] ? normalizeBig(r[5]) : '';
    if (n === q || a === q) { exact.push(toHit(r)); if (exact.length >= limit) break; }
    else if (prefix.length < limit && (n.startsWith(q) || (a && a.startsWith(q)))) prefix.push(toHit(r));
    else if (sub.length < limit && (n.includes(q) || (a && a.includes(q)))) sub.push(toHit(r));
  }
  return exact.concat(prefix, sub).slice(0, limit);
}
