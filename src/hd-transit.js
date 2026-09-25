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

// Tek gövdenin ekliptik boylamı. computeTransit ve computeGateExitDate AYNI
// hesabı kullansın diye ayrıldı: ikisi ayrışırsa "bugün kapı 41" derken
// "kapı 41 şu gün bitiyor" başka bir kapıyı tarayabilirdi.
function bodyLongitude(A, body, date) {
  if (body === "Sun") return A.SunPosition(date).elon;
  if (body === "Moon") return A.EclipticGeoMoon(date).lon;
  return A.Ecliptic(A.GeoVector(A.Body[body], date, true)).elon;
}

// Ay evresi. Gökyüzü Raporu başlığında kapalıyken bile görünsün diye ayrı
// fonksiyon: kullanıcı paneli açmadan da ayın nerede olduğunu görüyor.
// 8 evre, SoulID'nin kullandığı sınırlarla aynı mantık (0..360 açı / 45).
// de/es/pt/fr/ja adları i18n-data.js NOTIF_TRANS.MOON_PHASES ile BİREBİR aynı
// (App.jsx moonPhase() oradan okuyor); biri değişirse diğeri de değişsin.
// Buraya kopyalandı, import edilmedi: dev i18n dosyası bu tembel chunk'a girmesin.
const PHASE_NAMES = [
  { tr:"Yeni Ay",      en:"New Moon",        de:"Neumond",           es:"Luna nueva",       pt:"Lua nova",         fr:"Nouvelle lune",              ja:"新月" },
  { tr:"Hilal",        en:"Waxing Crescent", de:"Zunehmende Sichel", es:"Luna creciente",   pt:"Lua crescente",    fr:"Premier croissant",          ja:"三日月" },
  { tr:"İlk Dördün",   en:"First Quarter",   de:"Erstes Viertel",    es:"Cuarto creciente", pt:"Quarto crescente", fr:"Premier quartier",           ja:"上弦の月" },
  { tr:"Şişkin Ay",    en:"Waxing Gibbous",  de:"Zunehmender Mond",  es:"Gibosa creciente", pt:"Gibosa crescente", fr:"Lune gibbeuse croissante",   ja:"十三夜月" },
  { tr:"Dolunay",      en:"Full Moon",       de:"Vollmond",          es:"Luna llena",       pt:"Lua cheia",        fr:"Pleine lune",                ja:"満月" },
  { tr:"Solan Şişkin", en:"Waning Gibbous",  de:"Abnehmender Mond",  es:"Gibosa menguante", pt:"Gibosa minguante", fr:"Lune gibbeuse décroissante", ja:"十六夜月" },
  { tr:"Son Dördün",   en:"Last Quarter",    de:"Letztes Viertel",   es:"Cuarto menguante", pt:"Quarto minguante", fr:"Dernier quartier",           ja:"下弦の月" },
  { tr:"Solan Hilal",  en:"Waning Crescent", de:"Abnehmende Sichel", es:"Luna menguante",   pt:"Lua minguante",    fr:"Dernier croissant",          ja:"二十六夜月" },
];

// ── DİL SEÇİMİ ─────────────────────────────────────────────────────────────
// Sakin'in 7 dili. hd-gates.json alanları: n/t/g/s = Türkçe, nEn/tEn.. =
// İngilizce, nDe/nEs/nPt/nFr/nJa.. = diğer beşi. Bilinmeyen dil ya da boş
// alan İngilizceye düşer (eskiden tr dışındaki HER dil İngilizce görüyordu).
// "pt-BR" gibi bölge ekli kodlar ilk iki harfe indirilir.
const LANGS = ["tr", "en", "de", "es", "pt", "fr", "ja"];
function normLang(lang) {
  const l = String(lang || "").toLowerCase().slice(0, 2);
  return LANGS.includes(l) ? l : "en";
}
function gateField(info, f, lang) {
  const l = normLang(lang);
  if (l === "tr") return info[f] || info[f + "En"] || "";
  const v = info[f + l[0].toUpperCase() + l[1]];
  return v || info[f + "En"] || "";
}
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
      name: PHASE_NAMES[idx][normLang(lang)] || PHASE_NAMES[idx].en,
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
  const pick = (g) => {
    const info = GATES[String(g.gate)];
    if (!info) return null;
    return {
      gate: g.gate, line: g.line, center: info.c,
      name:   gateField(info, "n", lang),
      theme:  gateField(info, "t", lang),
      gift:   gateField(info, "g", lang),
      shadow: gateField(info, "s", lang),
    };
  };
  const out = { sun: null, moon: null, gates: [] };
  for (const body of BODIES) {
    let lon = null;
    try { lon = bodyLongitude(A, body, date); } catch { continue; }
    if (typeof lon !== "number" || Number.isNaN(lon)) continue;
    const gl = longitudeToGate(norm360(lon));
    const g = pick(gl);
    if (!g) continue;
    const row = { body, ...g };
    if (body === "Sun") out.sun = row;
    else if (body === "Moon") out.moon = row;
    out.gates.push(row);
  }
  return out.sun ? out : null;
}

// ── BİR TRANSİT KAPISI NE ZAMAN BİTİYOR ────────────────────────────────────
// Ayna'nın "bu geçiş ne zaman biter" sorusuna GERÇEK cevap vermesi için: bir
// gövde şu an hangi kapıdaysa, o kapıdan ÇIKIP komşu kapıya geçtiği ilk anı
// ileriye tarayarak bulur. Uydurma tarih yerine gerçek efemeris.
//
// Gövdeler çok farklı hızda ilerler (Ay ~13°/gün, Plüton ~0.003°/gün), o
// yüzden her gövde için ayrı tarama ufku ve adımı var. Kapı 5.625° geniş;
// gövde o kapıyı en fazla (kapı_genişliği / günlük_hız) günde geçer, tarama
// ufku bunun biraz üstünde tutuldu. Retrograd gövdeler kapı sınırında ileri
// geri gidebilir (birden çok giriş/çıkış); biz İLK çıkışı döndürüyoruz, yani
// "en yakın ne zaman bu temadan çıkıyorsun" sorusunu yanıtlıyor.
const SCAN = {
  Moon:    { horizonDays: 4,     stepHours: 1 },
  Sun:     { horizonDays: 10,    stepHours: 6 },
  Mercury: { horizonDays: 40,    stepHours: 6 },
  Venus:   { horizonDays: 40,    stepHours: 6 },
  Mars:    { horizonDays: 90,    stepHours: 12 },
  Jupiter: { horizonDays: 420,   stepHours: 24 },
  Saturn:  { horizonDays: 1100,  stepHours: 24 },
};

/**
 * Verilen gövdenin, verilen tarihte içinde bulunduğu transit kapısından
 * çıkacağı ilk tarihi bulur.
 * @param {string} body  "Sun" | "Moon" | "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn"
 * @param {Date} date
 * @param {string} [lang]
 * @returns {Promise<{gate:number, exitDate:Date, nextGate:number, days:number, name:string, theme:string, nextName:string, nextTheme:string}|null>}
 */
export async function computeGateExitDate(body, date = new Date(), lang = "tr") {
  let A;
  try { A = await engine(); } catch { return null; }
  const cfg = SCAN[body];
  if (!cfg) return null;
  const gateInfo = (g) => {
    const info = GATES[String(g)];
    return info ? { name: gateField(info, "n", lang), theme: gateField(info, "t", lang) } : { name: "", theme: "" };
  };
  let curLon;
  try { curLon = bodyLongitude(A, body, date); } catch { return null; }
  if (typeof curLon !== "number" || Number.isNaN(curLon)) return null;
  const startGate = longitudeToGate(norm360(curLon)).gate;

  const stepMs = cfg.stepHours * 3600 * 1000;
  const horizonMs = cfg.horizonDays * 86400 * 1000;
  let prev = date.getTime();
  for (let dt = stepMs; dt <= horizonMs; dt += stepMs) {
    const t = date.getTime() + dt;
    let lon;
    try { lon = bodyLongitude(A, body, new Date(t)); } catch { continue; }
    if (typeof lon !== "number" || Number.isNaN(lon)) continue;
    const gate = longitudeToGate(norm360(lon)).gate;
    if (gate !== startGate) {
      // Kaba adımda değişim yakalandı; ikili aramayla güne indir.
      let lo = prev, hi = t;
      for (let i = 0; i < 40 && hi - lo > 3600 * 1000; i++) {
        const mid = (lo + hi) / 2;
        let ml;
        try { ml = bodyLongitude(A, body, new Date(mid)); } catch { break; }
        const mg = longitudeToGate(norm360(ml)).gate;
        if (mg === startGate) lo = mid; else hi = mid;
      }
      const exitDate = new Date(hi);
      const cur = gateInfo(startGate), nxt = gateInfo(gate);
      return {
        gate: startGate,
        exitDate,
        nextGate: gate,
        days: (hi - date.getTime()) / 86400000,
        name: cur.name, theme: cur.theme,
        nextName: nxt.name, nextTheme: nxt.theme,
      };
    }
    prev = t;
  }
  return null;  // ufuk içinde çıkmıyor (çok yavaş gövde), null döner
}
