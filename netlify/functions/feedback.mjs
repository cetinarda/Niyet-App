const ALLOWED_ORIGINS = ["https://sakin.life", "https://www.sakin.life"];

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
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Sakin Feedback <feedback@sakin.life>",
          to,
          subject: `[Sakin Feedback] ${category}`,
          text: feedbackText,
        }),
      });
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
