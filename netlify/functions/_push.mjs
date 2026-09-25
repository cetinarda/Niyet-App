// ANLIK BİLDİRİM ORTAK YARDIMCILARI (push-register + push-admin)
// Alt çizgiyle başlayan dosya fonksiyon olarak yayınlanmaz (bkz. _groq.mjs).
//
// GEREKLİ ENV (Netlify > Environment variables, scope: Functions):
//   APNS_KEY_ID        Apple Developer > Keys > push anahtarının Key ID'si
//   APNS_TEAM_ID       Apple Developer Team ID
//   APNS_PRIVATE_KEY   indirilen .p8 dosyasının TAM içeriği
//   APNS_BUNDLE_ID     app.sakin.life (yoksa bu varsayılır)
//   FCM_SA_JSON        Firebase > Proje ayarları > Hizmet hesapları > yeni özel
//                      anahtar: indirilen JSON dosyasının TAM içeriği
//   PUSH_ADMIN_TOKEN   gönderim panelinin şifresi (uzun, tahmin edilemez)
// Biri eksikse o platforma gönderim atlanır, panel bunu açıkça yazar.
import { createHash, createSign, createPrivateKey } from "node:crypto";
import http2 from "node:http2";

export const tokenKey = (t) => "d/" + createHash("sha256").update(t).digest("hex").slice(0, 40);
// Ayarlar'da gösterilen kısa CİHAZ KODU: panelde "yalnız bana test gönder" için.
export const deviceCode = (t) => createHash("sha256").update("code:" + t).digest("hex").slice(0, 6).toUpperCase();

const b64url = (buf) => Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
// PEM'i NE ŞEKİLDE yapıştırılmış olursa olsun düzgün kur (Eyl 2026 çökmesi:
// "DECODER routines::unsupported"). Netlify'ın değer kutusu çok satırlı .p8
// içeriğinde satır sonlarını çoğu zaman BOŞLUĞA çeviriyor; Node da boşluklu tek
// satırlık PEM'i okuyamıyor. Gövde (base64) başlıklardan ayrılır, tüm boşluk /
// kaçış / tırnak atılır, 64'lük satırlarla yeniden sarılır. Başlıksız yapıştırılan
// ham base64 da kabul edilir.
function pem(s) {
  let t = String(s || "").trim().replace(/^["']|["']$/g, "").replace(/\\r|\\n/g, "\n");
  const m = t.match(/-----BEGIN ([A-Z ]+)-----([\s\S]*?)-----END \1-----/);
  const label = m ? m[1] : "PRIVATE KEY";
  const body = (m ? m[2] : t).replace(/[^A-Za-z0-9+/=]/g, "");
  if (!body) return "";
  return `-----BEGIN ${label}-----\n${body.match(/.{1,64}/g).join("\n")}\n-----END ${label}-----\n`;
}
// Anahtarı gönderimden ÖNCE bir kez dene: okunamıyorsa fonksiyon çökmesin,
// panel "anahtar okunamadı" desin.
function keyOk(k) { try { createPrivateKey(k); return true; } catch { return false; } }
function signJwt(header, payload, key, alg) {
  const h = b64url(JSON.stringify(header)), p = b64url(JSON.stringify(payload));
  const signer = createSign(alg === "ES256" ? "SHA256" : "RSA-SHA256");
  signer.update(`${h}.${p}`); signer.end();
  // ES256 JOSE ham r||s ister; Node varsayılanı DER üretir.
  const sig = signer.sign(alg === "ES256" ? { key: createPrivateKey(key), dsaEncoding: "ieee-p1363" } : createPrivateKey(key));
  return `${h}.${p}.${b64url(sig)}`;
}

export function pushConfig() {
  let fcm = null;
  try { const j = JSON.parse(process.env.FCM_SA_JSON || "null"); if (j && j.client_email && j.private_key && j.project_id) fcm = j; } catch { /* bozuk JSON */ }
  if (fcm && !keyOk(pem(fcm.private_key))) { fcm = null; }
  let apns = null, apnsError = "";
  if (process.env.APNS_KEY_ID && process.env.APNS_TEAM_ID && process.env.APNS_PRIVATE_KEY) {
    const key = pem(process.env.APNS_PRIVATE_KEY);
    if (keyOk(key)) apns = { kid: String(process.env.APNS_KEY_ID).trim(), team: String(process.env.APNS_TEAM_ID).trim(), key, topic: (process.env.APNS_BUNDLE_ID || "app.sakin.life").trim() };
    else apnsError = "APNS_PRIVATE_KEY okunamadı: .p8 dosyasının içeriği eksik ya da bozuk yapıştırılmış";
  }
  return { apns, fcm, apnsError };
}

// ── APNs (iOS) ───────────────────────────────────────────────────────────────
// Tek HTTP/2 bağlantısı üzerinden tüm cihazlar (çoklama, hızlı). Xcode'dan
// kurulan test sürümleri SANDBOX token'ı alır: üretim "BadDeviceToken" derse
// sandbox'a bir kez daha denenir. 410 Unregistered = uygulama silinmiş, kayıt temizlenir.
const APNS_HOSTS = { prod: "https://api.push.apple.com", sandbox: "https://api.sandbox.push.apple.com" };
function apnsJwt(cfg) {
  return signJwt({ alg: "ES256", kid: cfg.kid }, { iss: cfg.team, iat: Math.floor(Date.now() / 1000) }, cfg.key, "ES256");
}
function apnsSession(host) {
  const s = http2.connect(host);
  s.on("error", () => {});
  return s;
}
function apnsRequest(session, jwt, cfg, token, payload) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (r) => { if (!done) { done = true; resolve(r); } };
    try {
      const req = session.request({
        ":method": "POST", ":path": `/3/device/${token}`,
        authorization: `bearer ${jwt}`, "apns-topic": cfg.topic,
        "apns-push-type": "alert", "apns-priority": "10", "content-type": "application/json",
      });
      let status = 0, body = "";
      req.setTimeout(8000, () => { try { req.close(); } catch {} finish({ status: 0, reason: "timeout" }); });
      req.on("response", (h) => { status = h[":status"]; });
      req.on("data", (c) => { body += c; });
      req.on("end", () => { let reason = ""; try { reason = JSON.parse(body).reason || ""; } catch {} finish({ status, reason }); });
      req.on("error", (e) => finish({ status: 0, reason: String(e && e.code || e) }));
      req.end(JSON.stringify(payload));
    } catch (e) { finish({ status: 0, reason: String(e) }); }
  });
}
export async function sendApnsBatch(cfg, items, concurrency = 20) {
  const jwt = apnsJwt(cfg);
  const prod = apnsSession(APNS_HOSTS.prod);
  let sandbox = null;
  const results = [];
  let i = 0;
  const worker = async () => {
    while (i < items.length) {
      const it = items[i++];
      let r = await apnsRequest(prod, jwt, cfg, it.token, it.payload);
      // Üretim reddederse sandbox'ı dene: token Xcode test sürümünden (sandbox) ya
      // da anahtar yalnızca Sandbox için oluşturulmuş olabilir.
      const wrongEnv = (x) => (x.status === 400 && x.reason === "BadDeviceToken") || (x.status === 403 && x.reason === "BadEnvironmentKeyInToken");
      if (wrongEnv(r)) {
        const first = r;
        sandbox = sandbox || apnsSession(APNS_HOSTS.sandbox);
        r = await apnsRequest(sandbox, jwt, cfg, it.token, it.payload);
        if (r.status !== 200) r = { ...r, reason: `${first.reason} / sandbox: ${r.reason}` };
      }
      // Yalnızca iki ortam da "cihaz geçersiz" derse ya da 410 gelirse kayıt silinir;
      // anahtar/ortam uyumsuzluğunda cihaz SİLİNMEZ (sorun bizim tarafta).
      const dead = r.status === 410 || (r.status === 400 && /^BadDeviceToken \/ sandbox: BadDeviceToken$/.test(r.reason));
      results.push({ key: it.key, ok: r.status === 200, dead, why: r.status === 200 ? "" : `${r.status} ${r.reason}` });
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  try { prod.close(); } catch {}
  try { sandbox && sandbox.close(); } catch {}
  return results;
}
export function apnsPayload(title, body, screen) {
  const p = { aps: { alert: { title, body }, sound: "default" } };
  if (screen) p.screen = screen;
  return p;
}

// ── FCM HTTP v1 (Android) ────────────────────────────────────────────────────
async function fcmAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const assertion = signJwt({ alg: "RS256", typ: "JWT" }, {
    iss: sa.client_email, scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600,
  }, pem(sa.private_key), "RS256");
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }).toString(),
    signal: AbortSignal.timeout(6000),
  });
  const j = await r.json().catch(() => null);
  return r.ok && j ? j.access_token : null;
}
export async function sendFcmBatch(sa, items, concurrency = 10) {
  const at = await fcmAccessToken(sa);
  if (!at) return items.map((it) => ({ key: it.key, ok: false, dead: false, why: "fcm auth" }));
  const url = `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`;
  const results = [];
  let i = 0;
  const worker = async () => {
    while (i < items.length) {
      const it = items[i++];
      try {
        const r = await fetch(url, {
          method: "POST", headers: { Authorization: `Bearer ${at}`, "Content-Type": "application/json" },
          body: JSON.stringify({ message: { token: it.token, ...it.payload } }),
          signal: AbortSignal.timeout(8000),
        });
        const j = await r.json().catch(() => ({}));
        const code = j && j.error && (j.error.details || []).map((d) => d.errorCode).find(Boolean);
        // INVALID_ARGUMENT yük hatası da olabilir (renk, veri tipi): ölü sayılırsa tek bir
        // hatalı gönderim bütün Android kayıtlarını siler. Yalnızca 404 / UNREGISTERED.
        const dead = r.status === 404 || code === "UNREGISTERED";
        results.push({ key: it.key, ok: r.ok, dead: !r.ok && dead, why: r.ok ? "" : `${r.status} ${code || ""}` });
      } catch (e) { results.push({ key: it.key, ok: false, dead: false, why: String(e && e.name || e) }); }
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}
export function fcmPayload(title, body, screen) {
  return {
    notification: { title, body },
    data: screen ? { screen } : {},
    android: { priority: "high", notification: { color: "#b8a4d8", sound: "default" } },
  };
}
