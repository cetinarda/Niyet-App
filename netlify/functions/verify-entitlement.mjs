/**
 * SUNUCU TARAFLI ABONELİK DOĞRULAMASI (Apple + Google)
 *
 * NEDEN VAR: istemci `store.owned` ile TAHMİN yürütüyordu. Meta veri yüklenmiş
 * ama makbuz zinciri tamamlanmamışken owned=false okunuyor, ödeme yapan kullanıcı
 * free'ye düşürülüyordu (gerçek rapor: "üyeliğim olduğu halde deneme sürümü
 * açılıyor"). Bu yüzden otomatik iptal tamamen kapatıldı, ama o zaman da süresi
 * dolan abonelik sonsuza dek açık kalıyor. Tek doğru çözüm: mağazaya SUNUCUDAN
 * sormak ve kesin cevabı almak.
 *
 * ⚠️ KIRMIZI ÇİZGİ: FAIL-SAFE:
 * Bu uç nokta ASLA "emin değilim"i "abone değil" diye döndürmez. Kimlik bilgisi
 * yoksa, ağ hatası varsa, mağaza cevap vermezse → status:"unknown" döner ve
 * istemci HİÇBİR ŞEY yapmaz (premium'a dokunulmaz). Yalnızca mağaza AÇIKÇA
 * "süresi doldu / iptal edildi" derse status:"not_entitled" döner.
 * Yani bu katman sadece iptal edebilir; yanlışlıkla düşürme riski yoktur.
 *
 * GEREKLİ ENV DEĞİŞKENLERİ (Netlify → Site settings → Environment variables):
 *   Apple:
 *     APPLE_KEY_ID        App Store Connect → Integrations → Keys → Key ID
 *     APPLE_ISSUER_ID     aynı sayfadaki Issuer ID
 *     APPLE_PRIVATE_KEY   indirilen .p8 dosyasının TAM içeriği
 *                         (-----BEGIN PRIVATE KEY----- ... satır sonları \n olabilir)
 *     APPLE_BUNDLE_ID     app.sakin.life
 *   Google:
 *     GOOGLE_SA_EMAIL     servis hesabı e-postası
 *     GOOGLE_SA_KEY       servis hesabı private_key alanı (PEM)
 *     ANDROID_PACKAGE     com.sakin.app
 * Hiçbiri tanımlı değilse fonksiyon güvenle "unknown" döner: mevcut davranış korunur.
 */

import { createSign, createPrivateKey } from "node:crypto";
import { connectLambda } from "@netlify/blobs";
import { secret } from "./_secrets.mjs";
import { fcmServiceAccount } from "./_push.mjs";

const ALLOWED_ORIGINS = ["https://sakin.life", "https://www.sakin.life", "capacitor://localhost", "ionic://localhost", "https://localhost", "http://localhost"];
const YEARLY_ID = "app.sakin.life.yearly";
const LIFETIME_ID = "app.sakin.life.lifetime";

const cors = (origin) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
});

const b64url = (buf) =>
  Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

// Rate limit: bu uç nokta bizim Apple/Google kimlik bilgilerimizle dış API çağırıyor;
// sınırsız istek Apple kotasına takılmaya ve fonksiyon maliyetine yol açar
// (validate-license.mjs'deki aynı desen). Aşımda 429 döner; istemci !r.ok görüp DOKUNMAZ.
const rateMap = new Map();
const RATE_WINDOW = 60_000;
const RATE_MAX = 8;
function isRateLimited(ip) {
  const now = Date.now();
  const e = rateMap.get(ip);
  if (!e || now - e.start > RATE_WINDOW) { rateMap.set(ip, { start: now, count: 1 }); return false; }
  e.count++;
  return e.count > RATE_MAX;
}
const clientIP = (event) =>
  (event.headers?.["x-nf-client-connection-ip"] || event.headers?.["client-ip"] || "unknown").toString();

// Netlify env değişkenleri çok satırlı PEM'i genelde "\n" kaçışlarıyla saklar.
// Netlify'a yapıştırılan anahtarın satır sonları boşluğa dönüşebiliyor (APNs anahtarında
// yaşandı): gövdeyi ayıklayıp 64'lük satırlarla yeniden sar (_push.mjs ile aynı).
function pem(s) {
  let t = String(s || "").trim().replace(/^["']|["']$/g, "").replace(/\\r|\\n/g, "\n");
  const m = t.match(/-----BEGIN ([A-Z ]+)-----([\s\S]*?)-----END \1-----/);
  const label = m ? m[1] : "PRIVATE KEY";
  const body = (m ? m[2] : t).replace(/[^A-Za-z0-9+/=]/g, "");
  if (!body) return "";
  return `-----BEGIN ${label}-----\n${body.match(/.{1,64}/g).join("\n")}\n-----END ${label}-----\n`;
}

function signJwt(header, payload, key, alg) {
  const h = b64url(JSON.stringify(header));
  const p = b64url(JSON.stringify(payload));
  const signer = createSign(alg === "ES256" ? "SHA256" : "RSA-SHA256");
  signer.update(`${h}.${p}`);
  signer.end();
  // ES256 JOSE ham r||s ister; Node varsayılanı DER üretir → ieee-p1363 şart.
  const sig = signer.sign(
    alg === "ES256"
      ? { key: createPrivateKey(key), dsaEncoding: "ieee-p1363" }
      : createPrivateKey(key)
  );
  return `${h}.${p}.${b64url(sig)}`;
}

// JWS payload'ını OKU (imza doğrulaması yapmaz). Veriyi doğrudan Apple'ın API'sinden
// TLS üzerinden aldığımız için taşıma katmanı zaten kimliklendirilmiş durumda.
function decodeJws(jws) {
  try {
    const part = String(jws).split(".")[1];
    return JSON.parse(Buffer.from(part.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
  } catch { return null; }
}

// Netlify fonksiyon varsayılan sınırı 10sn; Apple yolunda 2 host × 2 çağrı olabildiği
// için tek istek timeout'u kısa tutulur, üstüne genel bir deadline konur (handler'da).
const jsonFetch = async (url, opts = {}) => {
  const r = await fetch(url, { ...opts, signal: AbortSignal.timeout(4500) });
  const text = await r.text();
  let body = null;
  try { body = JSON.parse(text); } catch { /* JSON değil */ }
  return { ok: r.ok, status: r.status, body, text };
};

// ── APPLE ────────────────────────────────────────────────────────────────────
// APPLE_PRIVATE_KEY ortam değişkeni YERİNE secrets-admin panelinden (Blobs) de
// gelebilir: fonksiyon ortam değişkenleri toplamı 4 KB'ı geçemiyor (_secrets.mjs).
async function appleToken() {
  const kid = process.env.APPLE_KEY_ID;
  const iss = process.env.APPLE_ISSUER_ID;
  const key = pem(await secret("APPLE_PRIVATE_KEY"));
  const bid = process.env.APPLE_BUNDLE_ID || "app.sakin.life";
  if (!kid || !iss || !key) return null;
  const now = Math.floor(Date.now() / 1000);
  return signJwt(
    { alg: "ES256", kid, typ: "JWT" },
    { iss, iat: now, exp: now + 900, aud: "appstoreconnect-v1", bid },
    key,
    "ES256"
  );
}

const APPLE_HOSTS = [
  "https://api.storekit.itunes.apple.com",
  "https://api.storekit-sandbox.itunes.apple.com",
];

// Apple abonelik durum kodları (Get All Subscription Statuses):
//   1 Aktif · 2 Süresi doldu · 3 Ödeme yeniden deneniyor · 4 Ödeme EK SÜRESİ · 5 İptal/iade
// ⚠️ 4 (grace period) KRİTİK: kartı geçici olarak reddedilen kullanıcıya Apple
// 6-16 gün ek süre verir ve erişimin SÜRDÜRÜLMESİNİ ister. Bu durumda YENİ bir
// işlem oluşmaz, son işlemin expiresDate'i GEÇMİŞTE kalır. Eskiden burada
// v2/history'deki expiresDate'e bakılıyordu ve bu kullanıcılar "süresi dolmuş"
// sayılıp premium'ları iptal ediliyordu: ödeme yapan kullanıcıyı düşüren tam da
// bu yoldu. Grace period'u YALNIZCA bu uç nokta bildirir, o yüzden karar buradan verilir.
// 3 (ödeme yeniden deneniyor) BELİRSİZ kabul edilir → iptal edilmez.
const APPLE_ENTITLED = new Set([1, 4]);
const APPLE_DENIED   = new Set([2, 5]);

// Ömür boyu (tek seferlik) ürün abonelik uç noktasında görünmez, geçmişten okunur.
async function appleLifetime(host, token, transactionId) {
  try {
    const r = await jsonFetch(
      `${host}/inApps/v2/history/${encodeURIComponent(transactionId)}?sort=DESCENDING`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!r.ok) return "error";
    const txs = (r.body?.signedTransactions || []).map(decodeJws).filter(Boolean);
    return txs.some(t => t.productId === LIFETIME_ID && !t.revocationDate) ? "entitled" : "none";
  } catch { return "error"; }
}

/**
 * Hak durumunu Apple'ın ABONELİK DURUMU uç noktasından okur (grace period dahil).
 * Prod önce denenir; Apple "bulunamadı" derse sandbox'a düşülür (TestFlight/sandbox).
 */
async function appleEntitlement(transactionId, deadline) {
  const token = await appleToken();
  if (!token || !transactionId) return { status: "unknown", reason: "apple_not_configured" };

  for (const host of APPLE_HOSTS) {
    if (Date.now() > deadline) return { status: "unknown", reason: "apple_deadline" };
    let sub;
    try {
      sub = await jsonFetch(`${host}/inApps/v1/subscriptions/${encodeURIComponent(transactionId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      return { status: "unknown", reason: "apple_network" };   // ağ hatası → ASLA iptal
    }
    // Bu ortamda yok → diğer ortamı dene
    if (sub.status === 404 || (sub.body && String(sub.body.errorCode) === "4040010")) continue;
    if (sub.status === 401 || sub.status === 403) return { status: "unknown", reason: "apple_auth" };
    if (!sub.ok) return { status: "unknown", reason: `apple_http_${sub.status}` };

    const statuses = [];
    for (const group of sub.body?.data || []) {
      for (const lt of group?.lastTransactions || []) {
        const info = decodeJws(lt?.signedTransactionInfo);
        // Ürünü okuyabiliyorsak yalnızca BİZİM aboneliğimizi dikkate al.
        if (info?.productId && info.productId !== YEARLY_ID) continue;
        if (typeof lt?.status === "number") statuses.push(lt.status);
      }
    }

    if (statuses.some(s => APPLE_ENTITLED.has(s))) {
      return { status: "entitled", kind: "subscription" };
    }

    // Abonelik hakkı görünmüyor → ömür boyu ürünü olabilir, ONA bak.
    if (Date.now() <= deadline) {
      const life = await appleLifetime(host, token, transactionId);
      if (life === "entitled") return { status: "entitled", kind: "lifetime" };
      if (life === "error")    return { status: "unknown", reason: "apple_history" };
    }

    // Ancak TÜM durumlar kesin olumsuzsa (2/5) iptal edilir. 3 varsa belirsiz sayılır.
    if (statuses.length && statuses.every(s => APPLE_DENIED.has(s))) {
      return { status: "not_entitled", reason: "expired_or_revoked" };
    }
    return { status: "unknown", reason: statuses.length ? "apple_ambiguous" : "apple_no_status" };
  }
  return { status: "unknown", reason: "apple_tx_not_found" };
}

// ── GOOGLE ───────────────────────────────────────────────────────────────────
// Google: ayrı servis hesabı (GOOGLE_SA_EMAIL + GOOGLE_SA_KEY) ZORUNLU DEĞİL.
// Tanımlı değilse bildirimlerde zaten kullanılan Firebase servis hesabı
// (FCM_SA_JSON) kullanılır; o hesabın e-postasını Play Console'a davet edip
// "finansal verileri görüntüle" izni vermek yeter.
async function googleAccessToken() {
  let email = process.env.GOOGLE_SA_EMAIL;
  let key = pem(await secret("GOOGLE_SA_KEY"));
  if (!email || !key) {
    const sa = await fcmServiceAccount();
    if (sa) { email = sa.client_email; key = pem(sa.private_key); }
  }
  if (!email || !key) return null;
  const now = Math.floor(Date.now() / 1000);
  const assertion = signJwt(
    { alg: "RS256", typ: "JWT" },
    {
      iss: email,
      scope: "https://www.googleapis.com/auth/androidpublisher",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    },
    key,
    "RS256"
  );
  const r = await jsonFetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }).toString(),
  });
  return r.ok ? r.body?.access_token || null : null;
}

// Hak sayılan durumlar: aktif, ödeme sorunu nedeniyle beklemede (grace/on-hold),
// duraklatılmış ve "iptal edildi ama süresi henüz dolmadı".
const GOOGLE_ENTITLED = new Set([
  "SUBSCRIPTION_STATE_ACTIVE",
  "SUBSCRIPTION_STATE_IN_GRACE_PERIOD",
  "SUBSCRIPTION_STATE_ON_HOLD",
  "SUBSCRIPTION_STATE_PAUSED",
  "SUBSCRIPTION_STATE_CANCELED",   // süresi dolana kadar erişim sürer
]);

async function googleEntitlement(purchaseToken, productId) {
  const pkg = process.env.ANDROID_PACKAGE || "com.sakin.app";
  if (!purchaseToken) return { status: "unknown", reason: "google_no_token" };
  let token;
  try { token = await googleAccessToken(); } catch { return { status: "unknown", reason: "google_auth" }; }
  if (!token) return { status: "unknown", reason: "google_not_configured" };
  const auth = { Authorization: `Bearer ${token}` };

  // Ömür boyu (tek seferlik ürün)
  if (productId === LIFETIME_ID) {
    let r;
    try {
      r = await jsonFetch(
        `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${pkg}/purchases/products/${encodeURIComponent(LIFETIME_ID)}/tokens/${encodeURIComponent(purchaseToken)}`,
        { headers: auth }
      );
    } catch { return { status: "unknown", reason: "google_network" }; }
    if (!r.ok) return { status: "unknown", reason: `google_http_${r.status}` };
    // purchaseState: 0=satın alındı, 1=iptal, 2=beklemede
    if (r.body?.purchaseState === 0) return { status: "entitled", kind: "lifetime" };
    if (r.body?.purchaseState === 1) return { status: "not_entitled", reason: "refunded" };
    return { status: "unknown", reason: "google_pending" };
  }

  // Abonelik
  let r;
  try {
    r = await jsonFetch(
      `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${pkg}/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`,
      { headers: auth }
    );
  } catch { return { status: "unknown", reason: "google_network" }; }
  if (!r.ok) return { status: "unknown", reason: `google_http_${r.status}` };

  const state = r.body?.subscriptionState;
  const expiry = r.body?.lineItems?.[0]?.expiryTime ? Date.parse(r.body.lineItems[0].expiryTime) : null;
  if (!state) return { status: "unknown", reason: "google_no_state" };
  if (GOOGLE_ENTITLED.has(state)) {
    // CANCELED'da süre dolmuşsa artık hak yok.
    if (state === "SUBSCRIPTION_STATE_CANCELED" && expiry && expiry <= Date.now()) {
      return { status: "not_entitled", reason: "expired", expiresAt: expiry };
    }
    return { status: "entitled", kind: "subscription", expiresAt: expiry };
  }
  if (state === "SUBSCRIPTION_STATE_EXPIRED") return { status: "not_entitled", reason: "expired", expiresAt: expiry };
  return { status: "unknown", reason: `google_state_${state}` };
}

// ── HANDLER ──────────────────────────────────────────────────────────────────
export const handler = async (event) => {
  const origin = event.headers?.origin || "";
  const originOk = ALLOWED_ORIGINS.includes(origin);
  const headers = originOk ? cors(origin) : {};

  if (event.httpMethod === "OPTIONS") {
    return originOk ? { statusCode: 204, headers, body: "" } : { statusCode: 403, body: "" };
  }
  if (!originOk) return { statusCode: 403, body: JSON.stringify({ status: "unknown", reason: "origin" }) };
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ status: "unknown", reason: "method" }) };
  }

  if (isRateLimited(clientIP(event))) {
    return { statusCode: 429, headers, body: JSON.stringify({ status: "unknown", reason: "rate_limited" }) };
  }

  // v1 (Lambda) fonksiyonunda Blobs için bağlam gerekir (gizli anahtarlar orada).
  try { connectLambda(event); } catch { /* Blobs yoksa ortam değişkenleri kullanılır */ }
  let req = {};
  try { req = JSON.parse(event.body || "{}"); } catch { /* boş bırak */ }
  const platform = req.platform === "android" ? "android" : "ios";
  // Genel bütçe: platformun fonksiyonu kesmesinden önce kendimiz "unknown" dönelim.
  const deadline = Date.now() + 8000;

  // ⚠️ Buradan sonra HİÇBİR hata "not_entitled"a dönüşmemeli.
  try {
    const out = platform === "android"
      ? await googleEntitlement(req.purchaseToken, req.productId)
      : await appleEntitlement(req.transactionId, deadline);
    return { statusCode: 200, headers: { ...headers, "Cache-Control": "no-store" }, body: JSON.stringify(out) };
  } catch (e) {
    return {
      statusCode: 200,
      headers: { ...headers, "Cache-Control": "no-store" },
      body: JSON.stringify({ status: "unknown", reason: "exception" }),
    };
  }
};
