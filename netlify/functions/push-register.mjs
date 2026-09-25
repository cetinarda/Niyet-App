// ANLIK BİLDİRİM (push) CİHAZ KAYDI
// ---------------------------------------------------------------------------
// Uygulama, kullanıcı Ayarlar > Bildirimler'de "Sakin'den anlık mesajlar"ı
// açtığında cihazın push adresini (APNs / FCM token) buraya gönderir; kapatınca
// optin:false ile kaydı SİLER. Gönderim push-admin.mjs'den yapılır.
//
// SAKLANAN: token, platform (ios/android), dil, saat dilimi, uygulama sürümü,
// son görülme zamanı. Ad, doğum bilgisi, e-posta gibi HİÇBİR kişisel veri yok.
// Anahtar token'ın özeti (sha256), token'ın kendisi değil.
//
// Functions v2 API: Blobs'un siteID/token'ı yalnızca v2'de otomatik bulunuyor
// (bkz. track.mjs başındaki not).
import { getStore } from "@netlify/blobs";
import { tokenKey, deviceCode } from "./_push.mjs";

const ALLOWED_ORIGINS = ["https://sakin.life", "https://www.sakin.life", "capacitor://localhost", "ionic://localhost", "https://localhost", "http://localhost"];
const LANGS = ["tr", "en", "de", "es", "pt", "fr", "ja"];

const cors = (origin) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
});
const json = (headers, code, obj) => new Response(JSON.stringify(obj), { status: code, headers: { ...headers, "Content-Type": "application/json" } });

const rateMap = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const e = rateMap.get(ip);
  if (!e || now - e.start > 60_000) { rateMap.set(ip, { start: now, count: 1 }); return false; }
  e.count++;
  return e.count > 10;
}

// APNs token: 64 hex. FCM token: ~150-200 karakter, [A-Za-z0-9_:-].
function validToken(platform, t) {
  if (typeof t !== "string") return false;
  if (platform === "ios") return /^[0-9a-fA-F]{64,200}$/.test(t);
  if (platform === "android") return /^[A-Za-z0-9_:\-]{100,4096}$/.test(t);
  return false;
}

export default async (req, context) => {
  const origin = req.headers.get("origin") || "";
  const originOk = !origin || ALLOWED_ORIGINS.includes(origin);
  const headers = (originOk && origin) ? cors(origin) : {};
  if (req.method === "OPTIONS") return new Response(null, { status: originOk ? 204 : 403, headers });
  if (!originOk) return json(headers, 403, { ok: false });
  if (req.method !== "POST") return json(headers, 405, { ok: false });
  const ip = (context && context.ip) || req.headers.get("x-nf-client-connection-ip") || "unknown";
  if (isRateLimited(ip)) return json(headers, 429, { ok: false });

  let b;
  try { b = await req.json(); } catch { return json(headers, 400, { ok: false }); }
  const platform = b && (b.platform === "ios" || b.platform === "android") ? b.platform : null;
  if (!platform || !validToken(platform, b.token)) return json(headers, 400, { ok: false });

  let store;
  try { store = getStore("sakin-push"); } catch { return json(headers, 200, { ok: false, nostore: true }); }
  const key = tokenKey(b.token);
  if (b.optin === false) {
    try { await store.delete(key); } catch { /* yoksa da sorun değil */ }
    return json(headers, 200, { ok: true, removed: true });
  }
  const rec = {
    t: b.token,
    p: platform,
    l: LANGS.includes(b.lang) ? b.lang : "en",
    tz: typeof b.tz === "string" ? b.tz.slice(0, 64) : "",
    v: typeof b.v === "string" ? b.v.slice(0, 16) : "",
    ts: Date.now(),
  };
  try { await store.setJSON(key, rec); } catch { return json(headers, 200, { ok: false }); }
  return json(headers, 200, { ok: true, code: deviceCode(b.token) });
};
