// Basit ilgi sayacı ("listeye gir") — web satış sayfasında alıcı niyetini ölçer.
// Kişisel veri TOPLAMAZ (e-posta yok): yalnızca anonim bir "ilgilendi" sinyali
// loglar. Sahip, sinyalleri Netlify function loglarından (WAITLIST_SIGNUP) ve/veya
// yapılandırılmışsa webhook/e-postadan sayar. Üçüncü-parti analytics KULLANMAZ
// (gizlilik politikasıyla tutarlı). feedback.mjs ile aynı sertleştirme deseni.

const ALLOWED_ORIGINS = ["https://sakin.life", "https://www.sakin.life", "capacitor://localhost", "ionic://localhost"];

function getCorsHeaders(event) {
  const origin = event.headers?.origin || "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

const rateMap = new Map();
const RATE_WINDOW = 3600_000;
const RATE_MAX = 8;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    rateMap.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count++;
  return entry.count > RATE_MAX;
}

function getClientIP(event) {
  return event.headers["x-forwarded-for"]?.split(",")[0]?.trim()
    || event.headers["client-ip"]
    || event.headers["x-real-ip"]
    || "unknown";
}

export const handler = async (event) => {
  const cors = getCorsHeaders(event);

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const ip = getClientIP(event);
  if (isRateLimited(ip)) {
    // Sessizce başarı döndür (kullanıcıya hata gösterme) ama sinyali sayma.
    return { statusCode: 200, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ success: true, throttled: true }) };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const lang = typeof body.lang === "string" ? body.lang.slice(0, 8) : "tr";
    const source = typeof body.source === "string" ? body.source.slice(0, 40) : "pricing";
    const timestamp = new Date().toISOString();

    // Sayılabilir sinyal — Netlify function loglarından WAITLIST_SIGNUP aranır.
    console.log("WAITLIST_SIGNUP", JSON.stringify({ lang, source, timestamp }));

    // İsteğe bağlı bildirim (feedback ile aynı env'ler; yoksa sessizce atlanır).
    const LOG_URL = process.env.FEEDBACK_WEBHOOK_URL;
    if (LOG_URL) {
      await fetch(LOG_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "waitlist", lang, source, timestamp }),
      }).catch(() => {});
    }
    const RESEND_KEY = process.env.RESEND_API_KEY;
    const to = process.env.FEEDBACK_EMAIL || "destek@sakin.life";
    if (RESEND_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Sakin Waitlist <feedback@sakin.life>",
          to,
          subject: "[Sakin] Yeni ilgi sinyali (listeye gir)",
          text: `Biri satış sayfasında 'listeye gir'e bastı.\nKaynak: ${source}\nDil: ${lang}\nTarih: ${timestamp}`,
        }),
      }).catch(() => {});
    }

    return { statusCode: 200, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ success: true }) };
  } catch (e) {
    console.error("Waitlist error:", e);
    return { statusCode: 500, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "server_error" }) };
  }
};
