/**
 * SUNUCU TARAFLI ABONELİK DOĞRULAMASI (Apple + Google)
 *
 * NEDEN VAR: istemci `store.owned` ile TAHMİN yürütüyordu. Meta veri yüklenmiş
 * ama makbuz zinciri tamamlanmamışken owned=false okunuyor, ödeme yapan kullanıcı
 * free'ye düşürülüyordu (gerçek rapor: "üyeliğim olduğu halde deneme sürümü
 * açılıyor"). Bu yüzden otomatik iptal tamamen kapatıldı — ama o zaman da süresi
 * dolan abonelik sonsuza dek açık kalıyor. Tek doğru çözüm: mağazaya SUNUCUDAN
 * sormak ve kesin cevabı almak.
 *
 * ⚠️ KIRMIZI ÇİZGİ — FAIL-SAFE:
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
 * Hiçbiri tanımlı değilse fonksiyon güvenle "unknown" döner — mevcut davranış korunur.
 */

import { createSign, createPrivateKey } from "node:crypto";

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

// Netlify env değişkenleri çok satırlı PEM'i genelde "\n" kaçışlarıyla saklar.
const pem = (s) => String(s || "").replace(/\\n/g, "\n").trim();

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

const jsonFetch = async (url, opts = {}) => {
  const r = await fetch(url, { ...opts, signal: AbortSignal.timeout(12000) });
  const text = await r.text();
  let body = null;
  try { body = JSON.parse(text); } catch { /* JSON değil */ }
  return { ok: r.ok, status: r.status, body, text };
};

// ── APPLE ────────────────────────────────────────────────────────────────────
function appleToken() {
  const kid = process.env.APPLE_KEY_ID;
  const iss = process.env.APPLE_ISSUER_ID;
  const key = pem(process.env.APPLE_PRIVATE_KEY);
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

/**
 * transactionId ile TÜM satın alma geçmişini çeker (v2/history) ve hak durumunu çıkarır.
 * Prod önce denenir; Apple "bulunamadı" derse sandbox'a düşülür (TestFlight/sandbox cihazlar).
 */
async function appleEntitlement(transactionId) {
  const token = appleToken();
  if (!token || !transactionId) return { status: "unknown", reason: "apple_not_configured" };

  const hosts = [
    "https://api.storekit.itunes.apple.com",
    "https://api.storekit-sandbox.itunes.apple.com",
  ];

  for (const host of hosts) {
    let r;
    try {
      r = await jsonFetch(`${host}/inApps/v2/history/${encodeURIComponent(transactionId)}?sort=DESCENDING`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      return { status: "unknown", reason: "apple_network" };   // ağ hatası → ASLA iptal
    }
    // Bu ortamda yok → diğer ortamı dene
    if (r.status === 404 || (r.body && String(r.body.errorCode) === "4040010")) continue;
    if (r.status === 401 || r.status === 403) return { status: "unknown", reason: "apple_auth" };
    if (!r.ok) return { status: "unknown", reason: `apple_http_${r.status}` };

    const txs = (r.body?.signedTransactions || []).map(decodeJws).filter(Boolean);
    if (!txs.length) continue;

    const now = Date.now();
    // Ömür boyu: iade/iptal edilmemişse süresiz hak.
    const lifetime = txs.find(t => t.productId === LIFETIME_ID && !t.revocationDate);
    if (lifetime) return { status: "entitled", kind: "lifetime", source: host.includes("sandbox") ? "sandbox" : "production" };

    // Abonelik: en ileri tarihli expiresDate hâlâ gelecekteyse hak sürüyor.
    const subs = txs.filter(t => t.productId === YEARLY_ID && !t.revocationDate && t.expiresDate);
    if (subs.length) {
      const latest = Math.max(...subs.map(t => Number(t.expiresDate) || 0));
      if (latest > now) return { status: "entitled", kind: "subscription", expiresAt: latest };
      return { status: "not_entitled", reason: "expired", expiresAt: latest };
    }
    // Kayıt var ama tanıdığımız ürün yok → karar verme.
    return { status: "unknown", reason: "apple_no_known_product" };
  }
  return { status: "unknown", reason: "apple_tx_not_found" };
}

// ── GOOGLE ───────────────────────────────────────────────────────────────────
async function googleAccessToken() {
  const email = process.env.GOOGLE_SA_EMAIL;
  const key = pem(process.env.GOOGLE_SA_KEY);
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

  let req = {};
  try { req = JSON.parse(event.body || "{}"); } catch { /* boş bırak */ }
  const platform = req.platform === "android" ? "android" : "ios";

  // ⚠️ Buradan sonra HİÇBİR hata "not_entitled"a dönüşmemeli.
  try {
    const out = platform === "android"
      ? await googleEntitlement(req.purchaseToken, req.productId)
      : await appleEntitlement(req.transactionId);
    return { statusCode: 200, headers: { ...headers, "Cache-Control": "no-store" }, body: JSON.stringify(out) };
  } catch (e) {
    return {
      statusCode: 200,
      headers: { ...headers, "Cache-Control": "no-store" },
      body: JSON.stringify({ status: "unknown", reason: "exception" }),
    };
  }
};
