// Türkçe/Latin olmayan karakterleri temizler
function sanitizeTurkish(text) {
  return text
    .replace(/[\u4E00-\u9FFF]/g, "")   // CJK Çince/Japonca
    .replace(/[\u3400-\u4DBF]/g, "")   // CJK Extension A
    .replace(/[\u3040-\u30FF]/g, "")   // Japonca Hiragana & Katakana
    .replace(/[\u0600-\u06FF]/g, "")   // Arapça
    .replace(/[\u0750-\u077F]/g, "")   // Arapça Supplement
    .replace(/[\uAC00-\uD7A3]/g, "")   // Korece Hangul
    .replace(/[\u1100-\u11FF]/g, "")   // Korece Jamo
    .replace(/[\u0900-\u097F]/g, "")   // Devanagari (Hintçe)
    .replace(/[\u3000-\u303F]/g, "")   // CJK Sembolleri
    .replace(/[\u2E80-\u2EFF]/g, "")   // CJK Radikaller
    .trim();
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "API anahtarı bulunamadı (GROQ_API_KEY)" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Geçersiz istek" };
  }

  const { system, messages, max_tokens = 1000 } = body;

  // Fonksiyon seviyesinde sabit Türkçe zorlama — model ne olursa olsun geçerli
  const turkcePrefix = "Yalnızca Türkçe yaz. Cümleler akıcı, sade ve şiirsel olsun. Her kelime ayrı yazılsın. Çince, Japonca, Arapça veya başka yabancı karakter kesinlikle kullanma.\n\n";

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
        max_tokens,
        temperature: 0.2,
        messages: groqMessages,
      }),
    });
    data = await res.json();
  } catch (e) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Bağlantı hatası: " + e.message }),
    };
  }

  if (!res.ok || data.error) {
    const errMsg = data.error?.message || `HTTP ${res.status}`;
    return {
      statusCode: res.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: errMsg }),
    };
  }

  const raw = data.choices?.[0]?.message?.content || "";
  const text = sanitizeTurkish(raw);
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  };
};
