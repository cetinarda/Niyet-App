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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "API anahtarı bulunamadı (GEMINI_API_KEY)" }),
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

  const systemPrompt = `Sen derin bir içsel farkındalık rehberisin. Kullanıcının haftalık verilerini analiz edip Türkçe, şiirsel ve içten bir rapor yazıyorsun.

Rapor şu başlıkları içermeli:
**Haftanın Enerjisi** — Genel ruh hali ve enerji (2-3 cümle)
**Öne Çıkan Temalar** — Tekrar eden niyet kelimeleri, çakra örüntüleri
**İçsel Büyüme** — Öğrenilen şeylerden çıkarılan anlam
**Şükran Kalbi** — Şükür yazılarından bir sentez
**Gelecek Haftaya Niyet** — Kısa, ilham verici bir öneri

Samimi, nazik, biraz şiirsel bir dil kullan. Kullanıcıya "sen" diye hitap et. Maksimum 350 kelime.`;

  const geminiBody = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [
      {
        role: "user",
        parts: [{ text: `Bu haftaki günlük verilerim:\n\n${gunlerText}\n\nLütfen haftalık içsel raporumu oluştur.` }],
      },
    ],
    generationConfig: { maxOutputTokens: 1200 },
  };

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
      }
    );
    const data = await res.json();

    if (!res.ok || data.error) {
      const errMsg = data.error?.message || `HTTP ${res.status}`;
      return {
        statusCode: res.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: errMsg }),
      };
    }

    const rapor = data.candidates?.[0]?.content?.parts?.[0]?.text || "Rapor oluşturulamadı.";
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
