// Foto-tanıma proxy (Groq vision) — taş & bitki tanıma.
// Güvenlik: origin allowlist → method → boyut → per-IP rate limit → Groq vision çağrısı.
// Not: Görü modeli GROQ_VISION_MODEL sabitinde; Groq preview modellerini emekliye
// ayırabilir — gerekirse güncel multimodal model adıyla değiştir.

const ALLOWED_ORIGINS = ["https://sakin.life", "https://www.sakin.life", "capacitor://localhost", "ionic://localhost"];
// Görü modelleri: önce daha güçlü olanı dene; model adı geçersiz/emekli ise eskiye düş (kırılmasın).
const GROQ_VISION_MODELS = [
  "meta-llama/llama-4-maverick-17b-128e-instruct",
  "meta-llama/llama-4-scout-17b-16e-instruct",
];
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
  const { image, type, lang: rawLang, candidates } = body;
  const lang = LANG_NAMES[rawLang] ? rawLang : "tr";
  const name = LANG_NAMES[lang];

  if (typeof image !== "string" || !image.startsWith("data:image/")) return json(400, ch, { error: "Invalid image" });
  if (image.length > MAX_IMAGE_BYTES * 1.4) return json(413, ch, { error: "Image too large" });
  const kind = type === "plant" ? "plant" : "stone";

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return json(500, ch, { error: "Server not configured" });

  const subject = kind === "plant"
    ? "a plant, herb or flower"
    : "a crystal, gemstone or healing stone";
  const features = kind === "plant"
    ? "leaf shape, leaf arrangement, flowers, color and growth habit"
    : "color, transparency, luster, crystal form, banding and inclusions";

  // Kapalı küme grounding: uygulamanın bildiği taş/bitki adlarını context ver (zorlama değil, ipucu).
  const list = Array.isArray(candidates)
    ? candidates.filter((c) => typeof c === "string" && c.trim()).slice(0, 300).map((c) => c.trim())
    : [];
  const listBlock = list.length
    ? `Sakin currently knows these ${kind}s (name, with English/Latin name in parentheses):\n${list.join("; ")}\n\n`
    : "";

  const prompt = `You are Sakin's gentle identification guide. Examine the photo of ${subject} closely, paying attention to ${features}.

${listBlock}Identify it ONLY if you are reasonably confident. Do NOT force or guess.
- If it clearly matches one of the ${kind}s Sakin knows, write THAT item's name on line 1, copied EXACTLY as written above (you may omit the parenthetical English part).
- If you are confident it is something NOT in that list, you may still name what you actually see.
- If you are NOT reasonably confident, or the image is blurry, too far, or not ${subject}, reply with EXACTLY this single word and nothing else: UNSURE

When you are confident, respond ENTIRELY in ${name}, using ONLY ${name} words (keep "Sakin" untranslated), in exactly three short lines:
1) <name> — confidence as a percentage.
2) Two alternatives it could be.
3) One short, warm sentence about its nature/energy, in Sakin's grounded-spiritual tone.
No medical advice.`;

  try {
    let data = null, lastStatus = 0;
    for (const model of GROQ_VISION_MODELS) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 20000);
      let res;
      try {
        res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
          body: JSON.stringify({
            model,
            max_tokens: 480,
            temperature: 0.2,
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

      if (res.ok) { data = await res.json(); break; }
      lastStatus = res.status;
      const errTxt = await res.text().catch(() => "");
      console.error("[identify] groq error", model, res.status, errTxt.slice(0, 200));
      // Model adı geçersiz/emekli (400/404) ise listedeki bir sonrakini dene; diğer hatalarda dur.
      if (res.status !== 400 && res.status !== 404) break;
    }

    if (!data) return json(502, ch, { error: "Vision service error", status: lastStatus });
    const text = data?.choices?.[0]?.message?.content?.trim() || "";
    if (!text) return json(502, ch, { error: "Empty response" });
    return json(200, ch, { text });
  } catch (e) {
    console.error("[identify] error", e?.message);
    return json(502, ch, { error: "Identification failed" });
  }
};
