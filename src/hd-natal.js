// HUMAN DESIGN NATAL ÖZETİ (tip · strateji · otorite · profil)
// ---------------------------------------------------------------------------
// NEREDE GÖRÜNÜR: "Ben" ekranında, 12. ev bölümünün üstünde. Temel düzey bir
// özet; tam bodygraph, kanallar ve kapı yorumları Tasarım uygulamasında.
//
// NEDEN HOST'TA HESAPLANIYOR (günlük kartlardaki gibi embed'den okunamaz):
// Tasarım uygulaması hesapladığı haritayı SAKLAMIYOR. `@tasarim_profiles`
// yalnızca ad/doğum tarihi/saat/şehir tutuyor; tip ve otorite her açılışta
// yeniden hesaplanıyor. Yani okunacak bir kayıt yok.
//
// TUTARLILIK: kanal tablosu ve etiketler apps/tasarim kaynağından ÜRETİLİYOR
// (scripts/build-hd-natal.mjs -> src/hd-natal.json), çark tanımı da Tasarım'la
// birebir aynı (bkz. hd-transit.js). Tip/otorite/profil kuralları
// apps/tasarim/src/utils/humanDesign.ts içindeki computeType/computeAuthority/
// computeProfile ile aynı sırayı izler. Orada bir kural değişirse burası da
// güncellenmeli, yoksa iki ekran farklı tip gösterir.
//
// SAAT DİLİMİ: dışarıdan `utcOffset` alınıyor. Host'un kendi
// `effectiveUtcOffset` fonksiyonu (Türkiye'nin tarihsel saat dilimi, tz
// database ile uyumlu) yükselen burçta zaten kullanılıyor; HD'nin ayrı bir
// zaman hesabı yapması iki ekranın ayrışmasına yol açardı.
//
// astronomy-engine DİNAMİK import: ana bundle büyümüyor, kütüphane yalnızca
// Ben ekranı açılınca iniyor (Bugün ekranı ile aynı chunk'ı paylaşır).

import DATA from "./hd-natal.json";
import { longitudeToGate } from "./hd-transit";

const norm360 = (x) => { const r = x % 360; return r < 0 ? r + 360 : r; };

let _engine = null;
async function engine() {
  if (!_engine) _engine = await import("astronomy-engine");
  return _engine;
}

const jdFromDate = (d) => d.getTime() / 86400000 + 2440587.5;
const dateFromJD = (jd) => new Date((jd - 2440587.5) * 86400000);

function sunLongitude(A, jd) { return norm360(A.SunPosition(dateFromJD(jd)).elon); }

// HD "design" anı: Güneş'in, doğumdaki konumundan tam 88° geride olduğu an
// (yaklaşık 88 gün önce). Kesin çözüm SearchSunLongitude ile; kütüphane
// bulamazsa Newton benzeri iterasyonla yaklaşılıyor (Tasarım ile aynı yedek).
function designJD(A, birthJD) {
  const target = norm360(sunLongitude(A, birthJD) - 88);
  try {
    const found = A.SearchSunLongitude(target, dateFromJD(birthJD - 90), 10);
    if (found && found.date) return jdFromDate(found.date);
  } catch (_) { /* yedek yola düş */ }
  let jd = birthJD - 88;
  for (let i = 0; i < 12; i++) {
    const diff = norm360(sunLongitude(A, jd) - target + 180) - 180;
    jd -= diff / 0.9856;
    if (Math.abs(diff) < 0.0001) break;
  }
  return jd;
}

// Lunar düğüm: astronomy-engine'de doğrudan yok. Meeus ORTALAMA düğüm formülü
// (Tasarım ile birebir aynı) — kapı/çizgi hassasiyeti için fazlasıyla yeterli.
function nodeLongitude(jd) {
  const T = (jd - 2451545.0) / 36525;
  return norm360(125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000);
}

const PLANETS = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];

// Bir andaki 13 HD aktivasyonu. Güneş ve Dünya (Güneş+180) profil için,
// hepsi birlikte hangi kapıların açık olduğu için gerekli.
function activations(A, jd) {
  const at = dateFromJD(jd);
  const out = [];
  const push = (planet, lon) => {
    if (typeof lon !== "number" || Number.isNaN(lon)) return;
    out.push({ planet, ...longitudeToGate(norm360(lon)) });
  };
  let sun = null;
  try { sun = norm360(A.SunPosition(at).elon); } catch (_) { return out; }
  push("sun", sun);
  push("earth", sun + 180);
  try { push("moon", A.EclipticGeoMoon(at).lon); } catch (_) {}
  const nn = nodeLongitude(jd);
  push("northNode", nn);
  push("southNode", nn + 180);
  for (const p of PLANETS) {
    try { push(p, A.Ecliptic(A.GeoVector(A.Body[p], at, true)).elon); } catch (_) {}
  }
  return out;
}

// Tanımlı merkezler arasındaki komşuluk. Tip ve otorite kuralları "motor
// merkez boğaza bağlı mı" gibi BAĞLANTI sorularına dayanıyor, tek tek
// merkezlere değil.
function adjacency(channels) {
  const adj = {};
  for (const ch of channels) {
    const [a, b] = ch.c;
    (adj[a] || (adj[a] = new Set())).add(b);
    (adj[b] || (adj[b] = new Set())).add(a);
  }
  return adj;
}

// Boğazdan başlayarak yürü: verilen motor merkezlerden birine ulaşılıyor mu?
function reachesMotor(adj, motors) {
  if (!adj.throat) return false;
  const seen = new Set(["throat"]);
  const stack = ["throat"];
  while (stack.length) {
    const cur = stack.pop();
    if (motors.includes(cur)) return true;
    for (const n of adj[cur] || []) if (!seen.has(n)) { seen.add(n); stack.push(n); }
  }
  return false;
}

function computeType(defined, adj) {
  if (defined.size === 0) return "Reflektör";
  if (defined.has("sacral")) {
    return reachesMotor(adj, ["sacral", "heart", "solarPlexus", "root"])
      ? "Manifesting Jeneratör" : "Jeneratör";
  }
  // Sakral tanımsız: boğaza sakral DIŞINDA bir motor bağlıysa Manifestor.
  if (defined.has("throat") && reachesMotor(adj, ["heart", "solarPlexus", "root"])) return "Manifestor";
  return "Projektör";
}

function computeAuthority(defined, type, channels) {
  if (type === "Reflektör") return "lunar";
  if (defined.has("solarPlexus")) return "emotional";
  if (defined.has("sacral")) return "sacral";
  if (defined.has("spleen")) return "splenic";
  if (defined.has("heart")) return "ego";
  if (defined.has("g") && channels.some((c) => c.c.includes("g") && c.c.includes("throat"))) {
    return "self-projected";
  }
  return "mental";
}

/**
 * Doğum bilgisinden temel HD özeti.
 * @param {string} birthDate  "YYYY-MM-DD"
 * @param {string} birthTime  "HH:MM"
 * @param {number} utcOffset  doğum anındaki yerel saat farkı (saat cinsinden)
 * @param {string} lang
 * @returns {Promise<object|null>}  saat/şehir yoksa ya da hesap düşerse null
 */
export async function computeNatalHD(birthDate, birthTime, utcOffset, lang = "tr") {
  // DOĞUM SAATİ ŞART: HD tipi 13 gezegenin kapılarına bakar, gün içinde Ay
  // ~13° ilerler ve birkaç kapı değiştirir. Saat olmadan üretilen tip
  // YANLIŞ olur; uydurmaktansa hiç göstermemek doğru.
  if (!birthDate || !birthTime || typeof utcOffset !== "number") return null;
  const [Y, Mo, Da] = String(birthDate).split("-").map(Number);
  const [hh, mm] = String(birthTime).split(":").map(Number);
  if (!Y || !Mo || !Da || Number.isNaN(hh) || Number.isNaN(mm)) return null;

  let A;
  try { A = await engine(); } catch { return null; }

  try {
    const utcMs = Date.UTC(Y, Mo - 1, Da, hh, mm, 0) - utcOffset * 3600 * 1000;
    const pJD = jdFromDate(new Date(utcMs));
    const dJD = designJD(A, pJD);

    const personality = activations(A, pJD);
    const design = activations(A, dJD);
    if (!personality.length || !design.length) return null;

    const active = new Set([...personality, ...design].map((a) => a.gate));
    const channels = DATA.channels.filter((c) => active.has(c.g[0]) && active.has(c.g[1]));
    const defined = new Set();
    for (const c of channels) { defined.add(c.c[0]); defined.add(c.c[1]); }

    const adj = adjacency(channels);
    const typeKey = computeType(defined, adj);
    const authKey = computeAuthority(defined, typeKey, channels);

    const pSun = personality.find((a) => a.planet === "sun");
    const dSun = design.find((a) => a.planet === "sun");
    if (!pSun || !dSun) return null;
    const profKey = `${pSun.line}/${dSun.line}`;

    const en = lang !== "tr";
    const T = DATA.types[typeKey] || null;
    const Au = DATA.authorities[authKey] || null;
    const Pr = DATA.profiles[profKey] || null;
    if (!T) return null;

    return {
      emoji: T.e,
      type: en ? T.nEn : T.n,
      strategy: en ? T.sEn : T.s,
      signature: en ? T.gEn : T.g,
      notSelf: en ? T.xEn : T.x,
      authority: Au ? (en ? Au.nEn : Au.n) : "",
      // PROFILES tablosunda 12 geçerli profil var; teorik ama nadir bir
      // kombinasyon çıkarsa ad yerine sadece "3/1" gibi sayı gösterilir.
      profile: profKey,
      profileName: Pr ? (en ? Pr.nEn : Pr.n) : "",
      definedCount: defined.size,
      channelCount: channels.length,
      sunGate: pSun.gate, sunLine: pSun.line,
    };
  } catch { return null; }
}
