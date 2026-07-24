// Görünür ilgi sayacı ("kaç kişi ilgileniyor") — web satış sayfasında alıcı
// niyetini ölçer ve kullanıcıya toplam sayıyı gösterir. Kişisel veri TOPLAMAZ
// (e-posta yok → bildirim vaadi de yok). Sayı, Netlify Blobs'ta first-party ve
// kalıcı tutulur (üçüncü-parti analytics yok — gizlilik politikasıyla uyumlu).
//   GET  → { count }            mevcut toplam
//   POST → { count }            +1 artırıp yeni toplamı döndürür
import { getStore } from "@netlify/blobs";

const ALLOWED_ORIGINS = ["https://sakin.life", "https://www.sakin.life", "capacitor://localhost", "ionic://localhost", "https://localhost", "http://localhost"];
const KEY = "count";

// Güvenlik notu: origin artık gerçekten reddediliyor; IP, Netlify'ın sahtelenemez
// platform header'ından (`x-nf-client-connection-ip`) okunuyor — eski
// `x-forwarded-for` istemci tarafından sahtelenip sayaç suistimalinin rate-limit'ini
// bypass edebiliyordu.
function isAllowedOrigin(origin) {
  return !!origin && ALLOWED_ORIGINS.includes(origin);
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
function getClientIP(event) {
  return (event.headers?.["x-nf-client-connection-ip"] || event.headers?.["client-ip"] || "unknown").toString();
}

function json(cors, code, obj) {
  return { statusCode: code, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify(obj) };
}

export const handler = async (event) => {
  const origin = event.headers?.origin || "";
  const originOk = isAllowedOrigin(origin);
  const cors = originOk ? getCorsHeaders(origin) : {};
  if (event.httpMethod === "OPTIONS") {
    if (!originOk) return { statusCode: 403, body: "" };
    return { statusCode: 204, headers: cors, body: "" };
  }
  if (!originOk) return json(cors, 403, { error: "Origin not allowed" });

  let store;
  try { store = getStore("sakin-waitlist"); }
  catch (e) { return json(cors, 200, { count: null }); } // Blobs yoksa UI'yı bozma

  const readCount = async () => {
    try { const raw = await store.get(KEY); const n = parseInt(raw || "0", 10); return Number.isFinite(n) ? n : 0; }
    catch { return 0; }
  };

  if (event.httpMethod === "GET") {
    return json(cors, 200, { count: await readCount() });
  }

  if (event.httpMethod === "POST") {
    const ip = getClientIP(event);
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
