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

// ── BUGÜN'ÜN MİT KARTI = MİTLER'DE İLK AÇILAN KART (Eyl 2026) ─────────────
// Kullanıcı: "Mitler'e girip yeni bir kart açınca Bugün'deki kart değişiyor."
// Eski yol: Bugün, Mitler'e girilmeden önce damgadan HESAPLANMIŞ bir kart
// gösteriyordu; Mitler desteyi rastgele çekince (`@mitler_daily`) kart ona
// dönüyor, sonraki desteler açıldıkça da tekrar değişebiliyordu.
// Kullanıcı kararı: Mitler RASTGELE çekmeye devam eder (3 deste: arketip /
// mit / imge). Bugün, kullanıcının Mitler'de O GÜN İLK AÇTIĞI desteyi (o
// destenin adıyla) gösterir. İlk açılışta `sakin_bugun_myth`e sabitlenir ve
// sonra hangi deste açılırsa açılsın o gün değişmez. Mitler'de henüz kart
// açılmadıysa kart YOK: diğer rehberler gibi "kartını aç" daveti çıkar
// (hesaplanmış yedek kart gösterilmez, sonradan değişeceği için yanıltıcıydı).
// `@mitler_revealed` = { date, steps:[deste indeksleri, açılış sırasıyla] },
// Mitler HomeScreen'de yazılıyor (0 arketip, 1 mit, 2 imge). Salt okunur.
export const BUGUN_MYTH_KEY = "sakin_bugun_myth";
const DECK_SYSTEMS = ["archetype", "myth", "image"];
export function mythOfDayPinned(index, dayKey) {
  if (!index) return null;
  const pin = readJson(BUGUN_MYTH_KEY);
  if (pin && pin.date === dayKey && pin.system && pin.id) {
    const card = index[pin.system] && index[pin.system][pin.id];
    if (card) return { system: pin.system, id: pin.id, card };
  }
  const daily = readJson(KEYS.myth);
  const rev = readJson("@mitler_revealed");
  if (!daily || daily.date !== dayKey || !rev || rev.date !== dayKey || !Array.isArray(rev.steps)) return null;
  const system = DECK_SYSTEMS[rev.steps[0]];
  const id = system && daily[system + "Id"];
  const card = id && index[system] && index[system][id];
  if (!card) return null;
  try { localStorage.setItem(BUGUN_MYTH_KEY, JSON.stringify({ date: dayKey, system, id })); } catch { /* kota: sabitlenmez, yine gösterilir */ }
  return { system, id, card };
}

/** Kart yoksa kullanıcıyı doğru uygulamaya yollamak için embed yolları. */
export const CARD_APP = {
  animal: "/embedded/sakinhayvan/index.html",
  plant:  "/embedded/sakinbitkiler/index.html",
  stone:  "/embedded/sakintaslar/index.html",
  myth:   "/embedded/sakinmitler/index.html",
};
