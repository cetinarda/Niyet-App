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
const RATE_WINDOW = 60_000;
const RATE_MAX = 12;

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

function sanitizeTurkish(text) {
  return text
    .replace(/[一-鿿]/g, "")
    .replace(/[㐀-䶿]/g, "")
    .replace(/[぀-ヿ]/g, "")
    .replace(/[؀-ۿ]/g, "")
    .replace(/[ݐ-ݿ]/g, "")
    .replace(/[가-힣]/g, "")
    .replace(/[ᄀ-ᇿ]/g, "")
    .replace(/[ऀ-ॿ]/g, "")
    .replace(/[　-〿]/g, "")
    .replace(/[⺀-⻿]/g, "")
    .trim();
}

const VALID_ROLES = ["user", "assistant", "system"];

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
    return { statusCode: 429, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Çok fazla istek. Biraz bekle." }) };
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "API anahtarı bulunamadı (GROQ_API_KEY)" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Geçersiz istek" }) };
  }

  const { system, messages, max_tokens } = body;

  if (system !== undefined && (typeof system !== "string" || system.length > 5000)) {
    return { statusCode: 400, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Geçersiz system" }) };
  }
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
    return { statusCode: 400, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Geçersiz messages" }) };
  }
  for (const m of messages) {
    if (!m || typeof m.content !== "string" || m.content.length > 8000) {
      return { statusCode: 400, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Mesaj içeriği geçersiz" }) };
    }
    if (!VALID_ROLES.includes(m.role)) {
      return { statusCode: 400, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Geçersiz rol" }) };
    }
  }

  const safeMaxTokens = Math.min(Math.max(parseInt(max_tokens) || 1800, 100), 1800);

  const turkcePrefix = "Yalnızca Türkçe yaz. ş, ğ, ı, ü, ö, ç, Ş, Ğ, İ, Ü, Ö, Ç gibi Türkçe karakterleri eksiksiz ve doğru kullan; yerlerine baska karakter koyma. Cümleler akıcı, sade ve şiirsel olsun. Her kelime ayrı yazılsın. Çince, Japonca, Arapça veya başka yabancı karakter kesinlikle kullanma.\n\n";

  const groqMessages = [];
  if (system) groqMessages.push({ role: "system", content: turkcePrefix + system });
  else groqMessages.push({ role: "system", content: turkcePrefix });
  for (const m of messages) groqMessages.push({ role: m.role, content: m.content });

  let res, data;
  try {
    res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: safeMaxTokens,
        temperature: 0.75,
        top_p: 0.9,
        messages: groqMessages,
      }),
    });
    data = await res.json();
  } catch (e) {
    return { statusCode: 502, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Bağlantı hatası: " + e.message }) };
  }

  if (!res.ok || data.error) {
    const errMsg = data.error?.message || `HTTP ${res.status}`;
    return { statusCode: res.status, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: errMsg }) };
  }

  const raw = data.choices?.[0]?.message?.content || "";
  const text = sanitizeTurkish(raw);
  return { statusCode: 200, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ text }) };
};
