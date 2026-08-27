// HUMAN DESIGN GÜNLÜK TRANSİT
// ---------------------------------------------------------------------------
// NEDEN HOST'TA HESAPLANIYOR: transit "çekilmiş bir kart" değil, her an yeniden
// hesaplanan bir konum. Günlük kartlarda işe yarayan yöntem (embed'in
// localStorage'ını okumak) burada çalışmaz, çünkü Tasarım uygulaması transiti
// saklamıyor. Seçenekler tartışıldı; kullanıcı hesabın host'a taşınmasını seçti.
//
// RİSK DEĞERLENDİRMESİ (kullanıcı "1, risk yoksa" dedi):
//   • astronomy-engine MIT lisanslı ve SAF JS. Native binding yok, bu yüzden
//     hem web'de hem Capacitor WebView'da çalışır. (SoulProfile'da `sweph`in
//     native binding'i web'de patladığı için zaten bu kütüphane seçilmişti.)
//   • DİNAMİK IMPORT ile yükleniyor: ana bundle büyümüyor, kütüphane yalnızca
//     Bugün ekranı açılınca iniyor (~45 KB gzip).
//   • Tasarım embed'i AYNI kütüphaneyi ve AYNI çark tanımını kullanıyor, yani
//     host ile uygulama çelişmez; kullanıcı iki yerde aynı kapıyı görür.
//   • Hesap başarısız olursa (ağ/parse) ekran kartsız açılır, çökme yok.
//
// Çark tanımı apps/tasarim/src/utils/humanDesign.ts ile BİREBİR aynı; oradan
// alındı. Değiştirilirse iki taraf ayrışır, dokunmadan önce oraya bak.

import GATES from "./hd-gates.json";

// Gate 41 -> ekliptik 302° (Kova 2°) noktasından başlar, I-Ching Wen sırası.
const GATE_WHEEL = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60,
];
const GATE_SIZE = 360 / 64;        // 5.625°
const LINE_SIZE = GATE_SIZE / 6;   // 0.9375°
const WHEEL_START = 302;

const norm360 = (x) => { const r = x % 360; return r < 0 ? r + 360 : r; };

export function longitudeToGate(longitude) {
  const offset = norm360(longitude - WHEEL_START);
  const idx = Math.floor(offset / GATE_SIZE);
  const gate = GATE_WHEEL[idx % 64];
  const within = offset - idx * GATE_SIZE;
  const line = Math.min(6, Math.max(1, Math.floor(within / LINE_SIZE) + 1));
  return { gate, line };
}

// Günlük vurgu için yeterli gezegen kümesi. Tam harita değil: Bugün ekranı bir
// özet, tam analiz Tasarım uygulamasında. Güneş ve Ay günün "havasını" taşır,
// diğerleri o günün ikincil temalarını verir.
const BODIES = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];

let _engine = null;
async function engine() {
  if (!_engine) _engine = await import("astronomy-engine");
  return _engine;
}

// Ay evresi. Gökyüzü Raporu başlığında kapalıyken bile görünsün diye ayrı
// fonksiyon: kullanıcı paneli açmadan da ayın nerede olduğunu görüyor.
// 8 evre, SoulID'nin kullandığı sınırlarla aynı mantık (0..360 açı / 45).
const PHASE_NAMES = [
  { tr:"Yeni Ay",        en:"New Moon" },
  { tr:"Hilal",          en:"Waxing Crescent" },
  { tr:"İlk Dördün",     en:"First Quarter" },
  { tr:"Şişkin Ay",      en:"Waxing Gibbous" },
  { tr:"Dolunay",        en:"Full Moon" },
  { tr:"Solan Şişkin",   en:"Waning Gibbous" },
  { tr:"Son Dördün",     en:"Last Quarter" },
  { tr:"Solan Hilal",    en:"Waning Crescent" },
];
// Evreye göre ay diski görseli (emoji değil, tipografik daire dolgusu ile
// çizilemediği için Unicode ay sembolleri kullanıldı; her platformda var).
const PHASE_GLYPH = ["🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘"];

export async function computeMoonPhase(date = new Date(), lang = "tr") {
  let A;
  try { A = await engine(); } catch { return null; }
  try {
    // MoonPhase: Güneş-Ay ekliptik boylam farkı (0=yeni, 180=dolunay).
    const angle = A.MoonPhase(date);
    const idx = Math.round(angle / 45) % 8;
    const illum = A.Illumination(A.Body.Moon, date);
    return {
      angle,
      index: idx,
      glyph: PHASE_GLYPH[idx],
      name: lang === "tr" ? PHASE_NAMES[idx].tr : PHASE_NAMES[idx].en,
      // Aydınlanma oranı: "ne kadar dolu" bilgisi, yüzde olarak gösterilebilir.
      fraction: illum && typeof illum.phase_fraction === "number" ? illum.phase_fraction : null,
    };
  } catch { return null; }
}

/**
 * Bugünün transit kapıları.
 * @param {Date} date
 * @param {string} lang
 * @returns {Promise<{sun:object, moon:object, gates:object[]}|null>}
 */
export async function computeTransit(date = new Date(), lang = "tr") {
  let A;
  try { A = await engine(); } catch { return null; }
  const en = lang !== "tr";
  const pick = (g) => {
    const info = GATES[String(g.gate)];
    if (!info) return null;
    return {
      gate: g.gate, line: g.line, center: info.c,
      name:   en ? info.nEn : info.n,
      theme:  en ? info.tEn : info.t,
      gift:   en ? info.gEn : info.g,
      shadow: en ? info.sEn : info.s,
    };
  };
  const out = { sun: null, moon: null, gates: [] };
  for (const body of BODIES) {
    let lon = null;
    try {
      if (body === "Sun") lon = A.SunPosition(date).elon;
      else if (body === "Moon") lon = A.EclipticGeoMoon(date).lon;
      else lon = A.Ecliptic(A.GeoVector(A.Body[body], date, true)).elon;
    } catch { continue; }
    if (typeof lon !== "number" || Number.isNaN(lon)) continue;
    const g = pick(longitudeToGate(norm360(lon)));
    if (!g) continue;
    const row = { body, ...g };
    if (body === "Sun") out.sun = row;
    else if (body === "Moon") out.moon = row;
    out.gates.push(row);
  }
  return out.sun ? out : null;
}
