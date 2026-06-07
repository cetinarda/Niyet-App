// Foto-tanıma proxy (Groq vision) — taş & bitki tanıma.
// Güvenlik: origin allowlist → method → boyut → per-IP rate limit → Groq vision çağrısı.
// Not: Görü modeli GROQ_VISION_MODEL sabitinde; Groq preview modellerini emekliye
// ayırabilir — gerekirse güncel multimodal model adıyla değiştir.

const ALLOWED_ORIGINS = ["https://sakin.life", "https://www.sakin.life", "capacitor://localhost", "ionic://localhost"];
const GROQ_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // ~5MB (base64 öncesi ham tahmini)

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 12;
const rateMap = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const fresh = (rateMap.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (fresh.length >= RATE_MAX) { rateMap.set(ip, fresh); return true; }
  fresh.push(now); rateMap.set(ip, fresh);
  if (rateMap.size > 3000 && Math.random() < 0.02) {
    for (const [k, v] of rateMap) if (!v.length || now - v[v.length - 1] > RATE_WINDOW_MS) rateMap.delete(k);
  }
  return false;
}

function cors(event) {
  const origin = event.headers?.origin || "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return { "Access-Control-Allow-Origin": allowed, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
}
function json(status, headers, obj) {
  return { statusCode: status, headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(obj) };
}

const LANG_NAMES = { tr: "Turkish", en: "English", de: "German", es: "Spanish", pt: "Portuguese", fr: "French", ja: "Japanese" };

export const handler = async (event) => {
  const ch = cors(event);
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: ch, body: "" };
  if (event.httpMethod !== "POST") return json(405, ch, { error: "Method not allowed" });

  const ip = (event.headers?.["x-nf-client-connection-ip"] || event.headers?.["client-ip"] || "0").toString();
  if (isRateLimited(ip)) return json(429, ch, { error: "Too many requests" });

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { return json(400, ch, { error: "Invalid body" }); }
  const { image, type, lang: rawLang } = body;
  const lang = LANG_NAMES[rawLang] ? rawLang : "tr";
  const name = LANG_NAMES[lang];

  if (typeof image !== "string" || !image.startsWith("data:image/")) return json(400, ch, { error: "Invalid image" });
  if (image.length > MAX_IMAGE_BYTES * 1.4) return json(413, ch, { error: "Image too large" });
  const kind = type === "plant" ? "plant" : "stone";

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return json(500, ch, { error: "Server not configured" });

  const subject = kind === "plant"
    ? "a plant / herb / flower"
    : "a crystal, gemstone or healing stone";
  const prompt = `You are Sakin's gentle identification guide. Look at the photo of ${subject}. Identify it.
Respond ENTIRELY in ${name}, using ONLY ${name} words (no foreign words). Keep the proper noun "Sakin" untranslated.
Format (warm, short):
1) Most likely: <name> — confidence as a percentage.
2) Two alternatives it could be.
3) One short, warm sentence about it (its nature/energy), in Sakin's spiritual-but-grounded tone.
If the image is unclear or not ${subject}, say so kindly and ask for a clearer photo. Never invent certainty — be honest about confidence. No medical advice.`;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    let res;
    try {
      res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: GROQ_VISION_MODEL,
          max_tokens: 420,
          temperature: 0.4,
          messages: [{
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: image } },
            ],
          }],
        }),
        signal: ctrl.signal,
      });
    } finally { clearTimeout(timer); }

    if (!res.ok) {
      const errTxt = await res.text().catch(() => "");
      console.error("[identify] groq error", res.status, errTxt.slice(0, 200));
      return json(502, ch, { error: "Vision service error", _debug: errTxt.slice(0, 300), _model: GROQ_VISION_MODEL, _status: res.status });
    }
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim() || "";
    if (!text) return json(502, ch, { error: "Empty response" });
    return json(200, ch, { text });
  } catch (e) {
    console.error("[identify] error", e?.message);
    return json(502, ch, { error: "Identification failed" });
  }
};
