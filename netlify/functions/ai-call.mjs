// Türkçe olmayan Unicode bloklarını temizler (Çince, Japonca, Arapça, Korece vb.)
function sanitizeTurkish(text) {
  return text
    // CJK Unified Ideographs (Çince/Japonca/Korece karakterler)
    .replace(/[\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF]/g, "")
    // Japonca Hiragana & Katakana
    .replace(/[\u3040-\u30FF\u31F0-\u31FF]/g, "")
    // Arapça & Farsça
    .replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g, "")
    // Korece Hangul
    .replace(/[\uAC00-\uD7FF\u1100-\u11FF]/g, "")
    // Devanagari (Hintçe)
    .replace(/[\u0900-\u097F]/g, "")
    // Çeşitli semboller (CJK radikaller vb.)
    .replace(/[\u2E80-\u2EFF\u2F00-\u2FDF\u3000-\u303F]/g, "")
    // Ardışık boşlukları tek boşluğa indir (kelime birleşme artefaktları)
    .replace(/([a-zğüşıöçA-ZĞÜŞİÖÇ])([A-ZĞÜŞİÖÇ])/g, "$1 $2")
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
  const turkcePrefix = "Sen bir Türkçe asistansın. YALNIZCA düzgün Türkçe yaz. Hiçbir Çince, Japonca, Arapça, Korece veya Latin dışı karakter kullanma. Kelimeleri birleştirme, her kelime ayrı yazılsın. Cümle yapısı Türkçe dil bilgisine uygun olsun.\n\n";

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
