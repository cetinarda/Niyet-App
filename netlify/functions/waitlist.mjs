// Görünür ilgi sayacı ("kaç kişi ilgileniyor"): web satış sayfasında alıcı
// niyetini ölçer ve kullanıcıya toplam sayıyı gösterir. Kişisel veri TOPLAMAZ
// (e-posta yok → bildirim vaadi de yok). Sayı, Netlify Blobs'ta first-party ve
// kalıcı tutulur (üçüncü-parti analytics yok, gizlilik politikasıyla uyumlu).
//   GET  → { count }            mevcut toplam
//   POST → { count }            +1 artırıp yeni toplamı döndürür
//
// ⚠️ FUNCTIONS V2 API — bkz. track.mjs başındaki not. getStore()'un siteID/
// token'ı otomatik bulması SADECE v2'de çalışıyor (Netlify personeli teyit
// etti), v1'de (export const handler) sessizce "blobs yok" dönüyordu.
import { getStore } from "@netlify/blobs";

const ALLOWED_ORIGINS = ["https://sakin.life", "https://www.sakin.life", "capacitor://localhost", "ionic://localhost", "https://localhost", "http://localhost"];
const KEY = "count";

// Güvenlik notu: origin artık gerçekten reddediliyor; IP, Netlify'ın sahtelenemez
// platform header'ından (`x-nf-client-connection-ip`) okunuyor: eski
// `x-forwarded-for` istemci tarafından sahtelenip sayaç suistimalinin rate-limit'ini
// bypass edebiliyordu.
// SAME-ORIGIN GET DÜZELTMESİ (canlıda 403 hatası):
// Tarayıcılar `Origin` başlığını YALNIZCA cross-origin isteklerde ve same-origin
// POST/PUT/DELETE'te gönderir; SAME-ORIGIN GET'te GÖNDERMEZ. Bu fonksiyon web'den
// (sakin.life) same-origin GET ile çağrıldığı için origin boş geliyor ve önceki
// katı kontrol kendi sitemizi 403'lüyordu ("Güneş verisi şu an alınamadı").
// Native'de sorun yoktu: Capacitor `capacitor://localhost` origin'i gönderir.
// Yeni kural: Origin VARSA beyaz listede olmak zorunda (katılık korunur). Origin
// YOKSA istek kabul edilir, çünkü tarayıcı cross-site isteğinde Origin'i her
// zaman gönderir, yani boş origin cross-site bir tarayıcı isteği OLAMAZ.
// Kötüye kullanım koruması zaten IP başına rate-limit + CDN cache ile sağlanıyor.
function isAllowedOrigin(origin) {
  if (!origin) return true;                      // same-origin GET → Origin yok
  return ALLOWED_ORIGINS.includes(origin);
}
function getCorsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// Doğrudan API suistimalini sınırla (istemci zaten cihaz başına 1 kez sayar).
const rateMap = new Map();
const RATE_WINDOW = 3600_000;
const RATE_MAX = 4;
function isRateLimited(ip) {
  const now = Date.now();
  const e = rateMap.get(ip);
  if (!e || now - e.start > RATE_WINDOW) { rateMap.set(ip, { start: now, count: 1 }); return false; }
  e.count++;
  return e.count > RATE_MAX;
}
function getClientIP(req, context) {
  return context?.ip || req.headers.get("x-nf-client-connection-ip") || "unknown";
}

function json(cors, code, obj) {
  return new Response(JSON.stringify(obj), { status: code, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

export default async (req, context) => {
  const origin = req.headers.get("origin") || "";
  const originOk = isAllowedOrigin(origin);
  const cors = (originOk && origin) ? getCorsHeaders(origin) : {};
  if (req.method === "OPTIONS") {
    if (!originOk) return new Response("", { status: 403 });
    return new Response(null, { status: 204, headers: cors });
  }
  if (!originOk) return json(cors, 403, { error: "Origin not allowed" });

  let store;
  try { store = getStore("sakin-waitlist"); }
  catch (e) { return json(cors, 200, { count: null }); } // Blobs yoksa UI'yı bozma

  const readCount = async () => {
    try { const raw = await store.get(KEY); const n = parseInt(raw || "0", 10); return Number.isFinite(n) ? n : 0; }
    catch { return 0; }
  };

  if (req.method === "GET") {
    return json(cors, 200, { count: await readCount() });
  }

  if (req.method === "POST") {
    const ip = getClientIP(req, context);
    if (isRateLimited(ip)) return json(cors, 200, { count: await readCount(), throttled: true });
    try {
      const count = (await readCount()) + 1;
      await store.set(KEY, String(count));
      console.log("WAITLIST_SIGNUP", count);
      return json(cors, 200, { count });
    } catch (e) {
      return json(cors, 200, { count: await readCount() });
    }
  }

  return json(cors, 405, { error: "Method not allowed" });
};
