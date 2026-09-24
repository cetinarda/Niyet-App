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

// ── BUGÜN'ÜN MİT KARTI: RASTGELE, GÜN BOYU SABİT (Eyl 2026) ───────────────
// Kullanıcı: "Günün kartı rastgele seçilsin ve yeni kartlar açıldığında
// değişmesin." Beş sistemden biri (arketip / mit / imge / rün / I Ching) ve o
// sistemden bir kart, gün + doğum damgasından seçilir.
// ⚠️ Mitler'in kendi çekilişine (`@mitler_daily`) BİLEREK BAKILMAZ: eski kod
// seçilen sistem Mitler'in destelerinden biriyse ONUN kartına geçiyordu, yani
// Mitler'de kart açılınca Bugün'deki kart değişiyordu (kullanıcı şikâyeti).
// Mitler kendi 3 destesini ayrıca rastgele çekmeye devam eder; iki şey
// birbirinden bağımsız. Bugün'deki karta dokununca Mitler o kartın detayına
// açılır (sakin_open_card ipucu), yani kart yine Mitler'de okunur.
// Seçim `sakin_bugun_myth`e de sabitlenir: indeks güncellense ya da doğum
// bilgisi gün içinde değişse bile o gün aynı kart kalır.
// ⚠️ TAROT BU LİSTEDE YOK: Bugün'de tarotun kendi bölümü var (78 kart), aynı
// gün iki farklı tarot kartı görünüyordu.
export const BUGUN_MYTH_KEY = "sakin_bugun_myth";
const SYSTEMS = ["archetype", "myth", "image", "rune", "iching"];

function hash32(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function pickMythOfDay(index, seed, dayKey) {
  const system = SYSTEMS[hash32(`${seed || "sakin"}|${dayKey}`) % SYSTEMS.length];
  const table = index[system];
  const keys = table ? Object.keys(table) : [];
  if (!keys.length) return null;
  // Ayrı damga: sistem ve kart aynı sayıya bağlı kalırsa dağılım daralır.
  const id = keys[hash32(`${dayKey}|${system}|${seed || ""}`) % keys.length];
  return { system, id, card: table[id] };
}

/** @returns {{system:string, id:string, card:object}|null} */
export function mythOfDayPinned(index, seed, dayKey) {
  if (!index) return null;
  const pin = readJson(BUGUN_MYTH_KEY);
  if (pin && pin.date === dayKey && pin.system && pin.id) {
    const card = index[pin.system] && index[pin.system][pin.id];
    if (card) return { system: pin.system, id: pin.id, card };
  }
  const m = pickMythOfDay(index, seed, dayKey);
  if (m) {
    try { localStorage.setItem(BUGUN_MYTH_KEY, JSON.stringify({ date: dayKey, system: m.system, id: m.id })); } catch { /* kota: sabitlenmez, damga yine aynı kartı verir */ }
  }
  return m;
}

/** Kart yoksa kullanıcıyı doğru uygulamaya yollamak için embed yolları. */
export const CARD_APP = {
  animal: "/embedded/sakinhayvan/index.html",
  plant:  "/embedded/sakinbitkiler/index.html",
  stone:  "/embedded/sakintaslar/index.html",
  myth:   "/embedded/sakinmitler/index.html",
};
