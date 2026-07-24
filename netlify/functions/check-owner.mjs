const ALLOWED_ORIGINS = ["https://sakin.life", "https://www.sakin.life", "capacitor://localhost", "ionic://localhost", "https://localhost", "http://localhost"];

// Güvenlik notu: origin artık gerçekten reddediliyor (sadece CORS header'ı için
// değil) ve istemci IP'si Netlify'ın SAHTELENEMEZ platform header'ından okunuyor —
// eskiden client-supplied `x-forwarded-for` kullanılıyordu, bu da bir isteğin kendi
// header'ını sahteleyerek OWNER_IPS eşleşmesini (ve dolayısıyla web'de ücretsiz
// premium/dev modu) taklit edebilmesi demekti.
function isAllowedOrigin(origin) {
  return !!origin && ALLOWED_ORIGINS.includes(origin);
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
  const cors = originOk ? getCorsHeaders(origin) : {};

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
