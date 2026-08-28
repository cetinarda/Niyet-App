const ALLOWED_ORIGINS = ["https://sakin.life", "https://www.sakin.life", "capacitor://localhost", "ionic://localhost", "https://localhost", "http://localhost"];

// Güvenlik notu: origin artık gerçekten reddediliyor (sadece CORS header'ı için
// değil) ve istemci IP'si Netlify'ın SAHTELENEMEZ platform header'ından okunuyor, 
// eskiden client-supplied `x-forwarded-for` kullanılıyordu, bu da bir isteğin kendi
// header'ını sahteleyerek OWNER_IPS eşleşmesini (ve dolayısıyla web'de ücretsiz
// premium/dev modu) taklit edebilmesi demekti.
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
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
function getClientIP(event) {
  return (event.headers?.["x-nf-client-connection-ip"] || event.headers?.["client-ip"] || "").toString();
}

export const handler = async (event) => {
  const origin = event.headers?.origin || "";
  const originOk = isAllowedOrigin(origin);
  const cors = (originOk && origin) ? getCorsHeaders(origin) : {};

  if (event.httpMethod === "OPTIONS") {
    if (!originOk) return { statusCode: 403, body: "" };
    return { statusCode: 204, headers: cors, body: "" };
  }
  if (!originOk) {
    return { statusCode: 403, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Origin not allowed" }) };
  }

  const ownerIPs = (process.env.OWNER_IPS || "").split(",").map(s => s.trim()).filter(Boolean);
  const clientIP = getClientIP(event);

  return {
    statusCode: 200,
    headers: { ...cors, "Content-Type": "application/json" },
    body: JSON.stringify({ owner: ownerIPs.includes(clientIP) }),
  };
};
