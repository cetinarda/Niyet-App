// Birinci-taraf ANONIM kullanim olcumu - toplama ucu (ingest).
// ------------------------------------------------------------------------
// Istemci (src/analytics.js) gunde birkac kez olay demeti (batch) yollar.
// Burada her ANONIM kurulum icin tek bir kayit tutulur (Netlify Blobs):
//   u/<anonId> -> { first, last, p, v, lang, prem, days[], m{}, c{} }
//     m = kilometre taslarina ILK ulasma zamani (funnel icin)
//     c = kumulatif sayaclar (nefes, ekran acilislari, oturum)
//     days = benzersiz gun anahtarlari (retention icin, son 60 ile sinirli)
// KISISEL VERI SAKLAMAZ: isim/dogum/sehir/mesaj YOK. Sadece anon id + olaylar.
// Rapor: netlify/functions/report.mjs (token korumali).
//
// ⚠️ FUNCTIONS V2 API (export default, Request/Response) — v1 (export const
// handler) DEĞİL. Kullanıcı canlıda her zaman "blobs acilamadi /
// MissingBlobsEnvironmentError" alıyordu; Netlify'ın kendi personeli forumda
// bunu doğruladı: "Only Functions API v2 automatically get that part
// configured [siteID/token]... In Functions v1, that's currently not
// possible." (answers.netlify.com/t/netlify-blobs-accessing-from-function-
// inside-sveltekit-app-requiring-explicit-token-siteid-deployid/107200)
// v1'de getStore("ad") siteID/token'ı ASLA otomatik bulamıyor, hesap/Netlify
// tarafında düzeltilecek bir şey değildi. v2'ye geçince istemci tarafında HİÇBİR
// ŞEY değişmedi: URL aynı (/.netlify/functions/track), JSON gövde şekli aynı.
import { getStore } from "@netlify/blobs";

const ALLOWED_ORIGINS = ["https://sakin.life", "https://www.sakin.life", "capacitor://localhost", "ionic://localhost", "https://localhost", "http://localhost"];

// Ekran adi -> funnel kategorisi.
const FEATURE_SCREENS = new Set(["nefes", "ses", "chakra", "terapi", "harita", "gun", "sabah", "aksam", "rehber", "reiki", "zihinsel"]);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  return ALLOWED_ORIGINS.includes(origin);
}
function cors(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
function json(headers, code, obj) {
  return new Response(JSON.stringify(obj), { status: code, headers: { ...headers, "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

// IP basina siniri (dogrudan API suistimaline karsi). Kurulum basina gunde
// birkac demet normal; cok yuksek hiz reddedilir.
const rateMap = new Map();
const RATE_WINDOW = 60_000;
const RATE_MAX = 30;
function isRateLimited(ip) {
  const now = Date.now();
  const e = rateMap.get(ip);
  if (!e || now - e.start > RATE_WINDOW) { rateMap.set(ip, { start: now, count: 1 }); return false; }
  e.count++;
  return e.count > RATE_MAX;
}
function clientIP(req, context) {
  // v2: context.ip Netlify tarafından resmi olarak sağlanıyor; header okumaya
  // gerek yok. Yine de context yoksa (test ortamı) header'a düş.
  return context?.ip || req.headers.get("x-nf-client-connection-ip") || "unknown";
}

function safeId(id) {
  // anonId'yi guvenli anahtar karakterlerine sinirla (path injection'i onle).
  return /^[A-Za-z0-9_-]{8,64}$/.test(id) ? id : null;
}

// Bir demeti (batch) mevcut kayda birlestir. Saf fonksiyon (test edilebilir).
export function mergeBatch(rec, body, now) {
  if (!rec) rec = { first: now, last: now, p: "web", v: "", lang: "tr", prem: false, days: [], m: {}, c: {} };
  rec.last = now;
  if (body.p) rec.p = String(body.p).slice(0, 12);
  if (body.v) rec.v = String(body.v).slice(0, 16);
  if (body.lang) rec.lang = String(body.lang).slice(0, 8);
  if (typeof body.prem === "boolean") rec.prem = body.prem;

  const day = typeof body.day === "string" ? body.day.slice(0, 10) : null;
  if (day && !rec.days.includes(day)) { rec.days.push(day); if (rec.days.length > 60) rec.days = rec.days.slice(-60); }

  const setMilestone = (name, ts) => { if (!rec.m[name]) rec.m[name] = ts || now; };
  const bump = (name, by) => { rec.c[name] = (rec.c[name] || 0) + (by || 1); };

  for (const it of (body.ev || [])) {
    if (!it || typeof it.e !== "string") continue;
    const ts = typeof it.t === "number" ? it.t : now;
    const e = it.e;
    if (e === "app_open") { setMilestone("app_open", ts); bump("sessions"); }
    else if (e === "birth_view") setMilestone("birth_view", ts);
    else if (e === "profile_complete") setMilestone("profile_complete", ts);
    else if (e === "purchase") setMilestone("purchase", ts);
    else if (e === "nefes") { setMilestone("nefes_complete", ts); bump("nefes"); }
    else if (e === "screen") {
      const s = typeof it.s === "string" ? it.s : "";
      if (!s) continue;
      bump("scr_" + s);
      if (s === "giris") setMilestone("giris_view", ts);
      else if (s === "mandala") setMilestone("mandala_view", ts);
      else if (s === "fiyat") setMilestone("paywall_view", ts);
      if (FEATURE_SCREENS.has(s)) setMilestone("feature_any", ts);
    }
  }
  return rec;
}

export default async (req, context) => {
  const origin = req.headers.get("origin") || "";
  const originOk = isAllowedOrigin(origin);
  const headers = (originOk && origin) ? cors(origin) : {};
  if (req.method === "OPTIONS") {
    if (!originOk) return new Response("", { status: 403 });
    return new Response(null, { status: 204, headers });
  }
  if (!originOk) return json(headers, 403, { error: "origin" });
  if (req.method !== "POST") return json(headers, 405, { error: "method" });
  if (isRateLimited(clientIP(req, context))) return json(headers, 200, { ok: false, throttled: true });

  let body;
  try { body = await req.json(); } catch (_) { return json(headers, 200, { ok: false }); }
  const id = safeId(body.id);
  if (!id || !Array.isArray(body.ev) || !body.ev.length) return json(headers, 200, { ok: false });

  let store;
  try { store = getStore("sakin-usage"); }
  catch (_) { return json(headers, 200, { ok: false, nostore: true }); } // Blobs yoksa sessizce gec

  const key = "u/" + id;
  let rec;
  try { rec = (await store.get(key, { type: "json" })) || null; } catch (_) { rec = null; }
  rec = mergeBatch(rec, body, Date.now());

  try { await store.setJSON(key, rec); } catch (_) { return json(headers, 200, { ok: false }); }
  return json(headers, 200, { ok: true });
};
