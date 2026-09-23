// GÜNÜN KARTLARI: embed uygulamaların o gün çektiği kartları host tarafında oku.
// ---------------------------------------------------------------------------
// NEDEN KÖPRÜ YOK: embed'ler host ile AYNI ORIGIN'de servis ediliyor
// (sakin.life/embedded/...). localStorage origin bazlıdır, path bazlı DEĞİL;
// yani embed'in yazdığı anahtarlar host'un `localStorage`ında da duruyor.
// Playwright ile ölçüldü: Hayvan embed'i açılınca `@sakinhayvan_profile`,
// kart çekilince `@sakinhayvan_daily` host penceresinden okunabildi.
// Bu yüzden postMessage köprüsü, embed yeniden derlemesi ya da embed kaynağında
// değişiklik GEREKMİYOR. Salt okunur bir bağımlılık: host embed'in verisine
// dokunmaz, yalnızca okur.
//
// İÇERİK NEREDEN GELİYOR: `_daily` yalnızca ID tutar. Ad/emoji/element
// `public/daily-index/<lang>.json` içinden çözülür; o dosyayı
// `scripts/build-daily-index.mjs` uygulama kaynaklarından üretir (elle kopya yok).

const KEYS = {
  animal: "@sakinhayvan_daily",
  plant:  "@sakinbitkiler_daily",
  stone:  "@sakintaslar_daily",
  myth:   "@mitler_daily",
};

// ⚠️ HANGİ ALAN HANGİ İÇERİK: uygulamalar aynı `DailyReading` şeklini kopyalayıp
// farklı veri kümeleriyle doldurmuş, o yüzden alan adları yanıltıcı.
// Kaynaktaki `generateDailyReading(...)` çağrılarından doğrulandı:
//   hayvan  : (qIds, aIds, aIds, aIds) -> animalId = HAYVAN.
//             stoneId/nagualId DE HAYVAN ID'si, KULLANMA (yanlış kart gösterir).
//   bitkiler: (qIds, sIds, aIds, aIds) ve `import stonesData from plants.json`
//             -> stoneId = BİTKİ.
//   taslar  : aynı çağrı ama stones.json -> stoneId = TAŞ.
//   mitler  : (aIds, mIds, iIds) -> archetypeId / mythId / imageId.
const FIELD = { animal: "animalId", plant: "stoneId", stone: "stoneId" };

function readJson(key) {
  try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; }
}

/**
 * Bugün çekilmiş kartların ID'leri. Tarihi bugün OLMAYAN kayıt yok sayılır:
 * dünkü kartı "bugünün kartı" diye göstermek kullanıcıyı yanıltır.
 * @param {string} dayKey  host'un gün anahtarı (YYYY-MM-DD, yerel saat)
 */
export function readDailyIds(dayKey) {
  const out = { animal: null, plant: null, stone: null, archetype: null, myth: null, image: null };
  for (const kind of ["animal", "plant", "stone"]) {
    const d = readJson(KEYS[kind]);
    if (d && d.date === dayKey) out[kind] = d[FIELD[kind]] || null;
  }
  const m = readJson(KEYS.myth);
  if (m && m.date === dayKey) {
    out.archetype = m.archetypeId || null;
    out.myth = m.mythId || null;
    out.image = m.imageId || null;
  }
  return out;
}

// ── İçerik indeksi (dil başına bir kez indirilir) ──────────────────────────
const _cache = new Map();
export async function loadDailyIndex(lang = "tr") {
  if (_cache.has(lang)) return _cache.get(lang);
  const p = fetch(`/daily-index/${lang}.json`)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)
    // Dil dosyası yoksa/ağ düşerse Türkçeye düş; kart hiç görünmemesindense
    // adı başka dilde görünsün.
    .then((j) => j || (lang === "tr" ? null : loadDailyIndex("tr")));
  _cache.set(lang, p);
  return p;
}

// ── Mitler tarafında GÜNÜN SİSTEMİ ────────────────────────────────────────
// Kullanıcı: "hepsinden değil, o gün hangisi gelirse doğum haritasına göre
// birini otomatik seç (arketip, mit, imge, tarot, rune, iching)". Tarot sonradan
// çıkarıldı (aşağıya bak).
// Mitler uygulaması günlük çekilişte YALNIZCA 3'ünü tutuyor (archetype/myth/
// image); tarot/rune/iching'in günlük kaydı yok. Bu yüzden:
//   • Seçim doğum verisi + güne göre DETERMİNİSTİK yapılır (aynı gün aynı
//     kişide hep aynı sonuç, rastgelelik yok).
//   • Seçilen sistem uygulamanın o gün çektiklerinden biriyse ONUN ID'si
//     kullanılır, yani host'ta görünen kart uygulamadakiyle AYNI olur.
//   • Değilse (tarot/rune/iching) kart aynı damgadan türetilir.
// ⚠️ TAROT BU LİSTEDE YOK (kullanıcı isteği, Eyl 2026): Bugün ekranında
// tarotun kendi bölümü var ("Günün tarot kartı", 78 kart). Burada da tarot
// çıkınca aynı gün iki farklı tarot kartı görünebiliyordu. Mitler uygulamasının
// kütüphanesinde tarot duruyor; yalnızca GÜNÜN kartı seçiminden çıkarıldı.
const SYSTEMS = ["archetype", "myth", "image", "rune", "iching"];

function hash32(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/**
 * @param {object} index   loadDailyIndex çıktısı
 * @param {object} ids     readDailyIds çıktısı
 * @param {string} seed    doğum bilgisi (kişiye özel yapar)
 * @param {string} dayKey  gün (her gün değişmesini sağlar)
 * @returns {{system:string, id:string, card:object}|null}
 */
export function pickMythOfDay(index, ids, seed, dayKey) {
  if (!index) return null;
  const h = hash32(`${seed || "sakin"}|${dayKey}`);
  const system = SYSTEMS[h % SYSTEMS.length];
  const table = index[system];
  if (!table) return null;
  // Uygulama o gün bu sistemden kart çektiyse AYNI kartı göster.
  const drawn = ids[system];
  if (drawn && table[drawn]) return { system, id: drawn, card: table[drawn] };
  const keys = Object.keys(table);
  if (!keys.length) return null;
  // Farklı bir damga (h2) kullanılıyor: aksi halde sistem seçimi ile kart
  // seçimi aynı sayıya bağlı kalır ve dağılım daralır.
  const id = keys[hash32(`${dayKey}|${system}|${seed || ""}`) % keys.length];
  return { system, id, card: table[id] };
}

/** Kart yoksa kullanıcıyı doğru uygulamaya yollamak için embed yolları. */
export const CARD_APP = {
  animal: "/embedded/sakinhayvan/index.html",
  plant:  "/embedded/sakinbitkiler/index.html",
  stone:  "/embedded/sakintaslar/index.html",
  myth:   "/embedded/sakinmitler/index.html",
};
