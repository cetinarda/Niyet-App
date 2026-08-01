const ALLOWED_ORIGINS = ["https://sakin.life", "https://www.sakin.life", "capacitor://localhost", "ionic://localhost", "https://localhost", "http://localhost"];

// Güvenlik notu: origin artık gerçekten reddediliyor; IP, Netlify'ın sahtelenemez
// platform header'ından (`x-nf-client-connection-ip`) okunuyor — eski
// `x-forwarded-for` istemci tarafından serbestçe sahtelenip rate-limit'i (ve bu
// fonksiyon üzerinden e-posta gönderimini) bypass edebiliyordu.
function isAllowedOrigin(origin) {
  return !!origin && ALLOWED_ORIGINS.includes(origin);
}
function getCorsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

const rateMap = new Map();
const RATE_WINDOW = 3600_000;
const RATE_MAX = 5;

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
  return (event.headers?.["x-nf-client-connection-ip"] || event.headers?.["client-ip"] || "unknown").toString();
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

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const ip = getClientIP(event);
  if (isRateLimited(ip)) {
    return { statusCode: 429, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Çok fazla geri bildirim. Bir saat sonra tekrar dene." }) };
  }

  try {
    const body = JSON.parse(event.body);
    const message = typeof body.message === "string" ? body.message.trim().slice(0, 5000) : "";
    const category = typeof body.category === "string" ? body.category.trim().slice(0, 50) : "genel";
    const lang = typeof body.lang === "string" && ["tr", "en"].includes(body.lang) ? body.lang : "tr";
    const timestamp = typeof body.timestamp === "string" ? body.timestamp.slice(0, 30) : new Date().toISOString();

    if (!message) {
      return { statusCode: 400, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "empty" }) };
    }

    const to = process.env.FEEDBACK_EMAIL || "destek@sakin.life";
    const RESEND_KEY = process.env.RESEND_API_KEY;

    const feedbackText = `
Yeni Geri Bildirim / New Feedback
─────────────────────────────────
Kategori: ${category}
Dil: ${lang}
Tarih: ${timestamp}
─────────────────────────────────
${message}
─────────────────────────────────`.trim();

    if (RESEND_KEY) {
      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Sakin Feedback <feedback@sakin.life>",
            to,
            subject: `[Sakin Feedback] ${category}`,
            text: feedbackText,
          }),
        });
        if (!emailRes.ok) console.warn("[feedback] Resend API error:", emailRes.status);
      } catch (e) {
        console.warn("[feedback] Resend fetch failed:", e.message);
      }
    }

    const LOG_URL = process.env.FEEDBACK_WEBHOOK_URL;
    if (LOG_URL) {
      await fetch(LOG_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, category, lang, timestamp }),
      }).catch(() => {});
    }

    console.log("FEEDBACK:", feedbackText);

    return { statusCode: 200, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ success: true }) };
  } catch (e) {
    console.error("Feedback error:", e);
    return { statusCode: 500, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "server_error" }) };
  }
};
