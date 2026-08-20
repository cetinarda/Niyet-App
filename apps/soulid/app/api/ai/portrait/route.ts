// AI Kahraman Portresi — kullanıcının fotoğrafını otantik, el-boyaması bir
// RPG karakter portresine çevirir. Görsel modeli SERVER-SIDE çağrılır; anahtar
// tarayıcıya asla sızmaz (CLAUDE.md kuralı).
//
// NOT: Claude görsel üretmez — bu route ayrı bir görsel modeli kullanır
// (OpenAI gpt-image-1, images/edits). Anahtar yoksa 503 döner ve istemci
// cihaz-üstü boyama efektine düşer (lib/portrait/stylize.ts).
//
// GİZLİLİK: Bu route çağrıldığında kullanıcının fotoğrafı üçüncü taraf görsel
// sağlayıcısına gider. İstemci bunu kullanıcıya açıkça bildirir ve dönüşüm
// yalnız kullanıcı butona bastığında çalışır (otomatik DEĞİL).

import { corsResponse, corsPreflight, rateLimit, rateKey } from '../_shared';

export const runtime = 'edge';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // güvenlik: 8MB üstü reddet

export function OPTIONS(): Response {
  return corsPreflight();
}

function dataUrlToBlob(dataUrl: string): { blob: Blob; type: string } | null {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(dataUrl);
  if (!m) return null;
  const type = m[1]!;
  const b64 = m[2]!;
  const bin = atob(b64);
  if (bin.length > MAX_IMAGE_BYTES) return null;
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { blob: new Blob([bytes], { type }), type };
}

/** Kişinin haritasından gelen arketiple kişiselleştirilmiş sahne yönergesi. */
function buildPrompt(race?: string, hdType?: string, sunSign?: string): string {
  const archetype = [race, hdType].filter(Boolean).join(' — ') || 'mystic traveler';
  return [
    'Transform this portrait photo into an authentic hand-painted fantasy RPG character portrait.',
    "Preserve the person's facial likeness, age, skin tone, hair and gender presentation so they remain clearly recognizable.",
    'Do not caricature, do not distort or beautify the facial features.',
    `Character archetype: ${archetype}.`,
    sunSign ? `Subtle symbolic motif of the ${sunSign} constellation in the background.` : '',
    'Style: rich oil-painted digital illustration, painterly visible brushwork, dramatic lantern-lit chiaroscuro,',
    'deep cosmic indigo and antique gold palette, ornate but restrained costume detail,',
    'head-and-shoulders framing, dark atmospheric background with faint starlight.',
    'No text, no lettering, no logo, no border, no frame.',
  ]
    .filter(Boolean)
    .join(' ');
}

export async function POST(request: Request): Promise<Response> {
  // Görsel üretimi pahalı — sıkı limit.
  const limit = rateLimit(rateKey(request, 'portrait'), 4);
  if (!limit.ok) {
    return corsResponse(
      { error: 'Çok hızlı deneme. Biraz bekle.', retryAfter: limit.retryAfter },
      { status: 429 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // İstemci bunu görünce cihaz-üstü boyama efektine düşer.
    return corsResponse({ error: 'AI portre yapılandırılmadı', fallback: true }, { status: 503 });
  }

  type PortraitBody = { image?: string; race?: string; hdType?: string; sunSign?: string };
  let body: PortraitBody | null = null;
  try {
    body = (await request.json()) as PortraitBody;
  } catch {
    return corsResponse({ error: 'Geçersiz istek' }, { status: 400 });
  }

  if (!body?.image) {
    return corsResponse({ error: 'Fotoğraf yok' }, { status: 400 });
  }

  const parsed = dataUrlToBlob(body.image);
  if (!parsed) {
    return corsResponse({ error: 'Geçersiz veya çok büyük görsel' }, { status: 400 });
  }

  const ext = parsed.type === 'image/png' ? 'png' : parsed.type === 'image/webp' ? 'webp' : 'jpg';
  const form = new FormData();
  form.append('model', 'gpt-image-1');
  form.append('image', parsed.blob, `portrait.${ext}`);
  form.append('prompt', buildPrompt(body.race, body.hdType, body.sunSign));
  form.append('size', '1024x1024');
  form.append('n', '1');

  try {
    const res = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('[portrait] image api error', res.status, detail.slice(0, 400));
      return corsResponse(
        { error: 'Portre üretilemedi', fallback: true },
        { status: res.status === 429 ? 429 : 502 },
      );
    }

    const data = (await res.json()) as { data?: Array<{ b64_json?: string; url?: string }> };
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) {
      return corsResponse({ error: 'Portre boş döndü', fallback: true }, { status: 502 });
    }

    return corsResponse({ dataUrl: `data:image/png;base64,${b64}` });
  } catch (e) {
    console.error('[portrait] fetch failed', e);
    return corsResponse({ error: 'Portre servisine ulaşılamadı', fallback: true }, { status: 502 });
  }
}
