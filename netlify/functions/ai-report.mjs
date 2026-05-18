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

function truncStr(val, max) {
  if (typeof val !== "string") return "";
  return val.slice(0, max);
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
    return { statusCode: 429, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Çok fazla istek. Biraz bekle." }) };
  }

  let gunler;
  try {
    ({ gunler } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Geçersiz istek gövdesi" }) };
  }

  if (!Array.isArray(gunler) || gunler.length === 0 || gunler.length > 7) {
    return { statusCode: 400, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "1-7 gün verisi gerekli." }) };
  }

  for (const g of gunler) {
    if (!g || typeof g !== "object") {
      return { statusCode: 400, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Geçersiz gün verisi" }) };
    }
    if (g.kelimeler && (!Array.isArray(g.kelimeler) || g.kelimeler.length > 10)) {
      return { statusCode: 400, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Geçersiz kelimeler" }) };
    }
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "API anahtarı bulunamadı (GROQ_API_KEY)" }) };
  }

  const gunlerText = gunler
    .map(
      (g, i) => `Gün ${i + 1} (${truncStr(g.tarih, 20)}):
- Niyet: ${truncStr(g.niyet, 500) || "—"}
- Kelimeler: ${(g.kelimeler || []).map(k => truncStr(String(k), 50)).join(", ") || "—"}
- Günün çakrası: ${truncStr(g.chakra, 50) || "—"}
- Nefes sayısı: ${parseInt(g.nefes) || 0}
- Bugün ne öğrendim: ${truncStr(g.ogrendim, 500) || "—"}
- Şükür: ${truncStr(g.sukur, 500) || "—"}`
    )
    .join("\n\n");

  const systemPrompt = `Yalnızca Türkçe yaz. Cümleler akıcı, sade ve şiirsel olsun. Çince, Japonca, Arapça veya yabancı karakter kullanma. Net ve kendinden emin yaz. Şu kalıpları kesinlikle kullanma: "olası ki", "olabilir", "belki", "belki de", "acaba", "düşünülebilir", "söylenebilir", "muhtemelen".

Sen derin bir ayna ve içsel farkındalık rehberisin. Kullanıcının haftalık verilerini Türkçe, şiirsel ve içten bir rapor olarak yansıtıyorsun. Sorunun kaynağına doğrudan işaret et. Nereye bakabileceğini göster; kendine sevgi sunmayı hatırlat.

Raporun en başına şu cümleyi ekle: "Bu rapor sana özeldir. Düşünce dünyanda sana destek olan bir yardımcıdır. Kalbinin süzgecinden geçir, seni ısıtan kısmını al."

Rapor şu başlıkları içermeli:
**Haftanın Yansıması** — Genel ruh hali ve enerji — net ve doğrudan yansıt (2-3 cümle)
**Öne Çıkan Temalar** — Tekrar eden niyet kelimeleri, çakra örüntüleri — kaynağa doğrudan işaret et
**İçsel Büyüme** — Öğrenilen şeylerden çıkarılan anlam
**Şükran Kalbi** — Şükür yazılarından bir sentez
**Gelecek Haftaya Niyet** — Kısa, ilham verici bir öneri

Samimi, kendinden emin, şiirsel bir dil kullan. Kullanıcıya "sen" diye hitap et. Maksimum 500 kelime.`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 2000,
        temperature: 0.2,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Bu haftaki günlük verilerim:\n\n${gunlerText}\n\nLütfen haftalık içsel raporumu oluştur.` },
        ],
      }),
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      const errMsg = data.error?.message || `HTTP ${res.status}`;
      return { statusCode: res.status, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: errMsg }) };
    }

    const rapor = sanitizeTurkish(data.choices?.[0]?.message?.content || "Rapor oluşturulamadı.");
    return { statusCode: 200, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ rapor }) };
  } catch (e) {
    return { statusCode: 502, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Bağlantı hatası: " + e.message }) };
  }
};
