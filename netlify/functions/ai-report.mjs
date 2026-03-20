function sanitizeTurkish(text) {
  return text
    .replace(/[\u4E00-\u9FFF\u3400-\u4DBF]/g, "")
    .replace(/[\u3040-\u30FF\u31F0-\u31FF]/g, "")
    .replace(/[\u0600-\u06FF\u0750-\u077F]/g, "")
    .replace(/[\uAC00-\uD7FF\u1100-\u11FF]/g, "")
    .replace(/[\u0900-\u097F]/g, "")
    .replace(/[\u2E80-\u2EFF\u3000-\u303F]/g, "")
    .replace(/([a-zğüşıöçA-ZĞÜŞİÖÇ])([A-ZĞÜŞİÖÇ])/g, "$1 $2")
    .trim();
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let gunler;
  try {
    ({ gunler } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: "Geçersiz istek gövdesi" };
  }

  if (!gunler || gunler.length === 0) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "En az 1 gün verisi gerekli." }),
    };
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "API anahtarı bulunamadı (GROQ_API_KEY)" }),
    };
  }

  const gunlerText = gunler
    .map(
      (g, i) => `Gün ${i + 1} (${g.tarih}):
- Niyet: ${g.niyet || "—"}
- Kelimeler: ${g.kelimeler?.join(", ") || "—"}
- Günün çakrası: ${g.chakra || "—"}
- Nefes sayısı: ${g.nefes || 0}
- Bugün ne öğrendim: ${g.ogrendim || "—"}
- Şükür: ${g.sukur || "—"}`
    )
    .join("\n\n");

  const systemPrompt = `Sen bir Türkçe asistansın. YALNIZCA düzgün Türkçe yaz. Hiçbir Çince, Japonca, Arapça veya Latin dışı karakter kullanma. Kelimeleri birleştirme. Cümle yapısı doğru Türkçe olsun.

Sen derin bir içsel farkındalık rehberisin. Kullanıcının haftalık verilerini analiz edip Türkçe, şiirsel ve içten bir rapor yazıyorsun.

Rapor şu başlıkları içermeli:
**Haftanın Enerjisi** — Genel ruh hali ve enerji (2-3 cümle)
**Öne Çıkan Temalar** — Tekrar eden niyet kelimeleri, çakra örüntüleri
**İçsel Büyüme** — Öğrenilen şeylerden çıkarılan anlam
**Şükran Kalbi** — Şükür yazılarından bir sentez
**Gelecek Haftaya Niyet** — Kısa, ilham verici bir öneri

Samimi, nazik, biraz şiirsel bir dil kullan. Kullanıcıya "sen" diye hitap et. Maksimum 350 kelime.`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1200,
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
      return {
        statusCode: res.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: errMsg }),
      };
    }

    const rapor = sanitizeTurkish(data.choices?.[0]?.message?.content || "Rapor oluşturulamadı.");
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rapor }),
    };
  } catch (e) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Bağlantı hatası: " + e.message }),
    };
  }
};
