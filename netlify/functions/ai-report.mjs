import Anthropic from "@anthropic-ai/sdk";

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

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || process.env.VITE_RAPOR_API_KEY });

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1200,
      system: `Sen derin bir içsel farkındalık rehberisin. Kullanıcının haftalık verilerini analiz edip Türkçe, şiirsel ve içten bir rapor yazıyorsun.

Rapor şu başlıkları içermeli:
**Haftanın Enerjisi** — Genel ruh hali ve enerji (2-3 cümle)
**Öne Çıkan Temalar** — Tekrar eden niyet kelimeleri, çakra örüntüleri
**İçsel Büyüme** — Öğrenilen şeylerden çıkarılan anlam
**Şükran Kalbi** — Şükür yazılarından bir sentez
**Gelecek Haftaya Niyet** — Kısa, ilham verici bir öneri

Samimi, nazik, biraz şiirsel bir dil kullan. Kullanıcıya "sen" diye hitap et. Maksimum 350 kelime.`,
      messages: [
        {
          role: "user",
          content: `Bu haftaki günlük verilerim:\n\n${gunlerText}\n\nLütfen haftalık içsel raporumu oluştur.`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const rapor = textBlock?.text || "Rapor oluşturulamadı.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rapor }),
    };
  } catch (e) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Bağlantı hatası" }),
    };
  }
};
