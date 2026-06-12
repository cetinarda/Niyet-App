// Foto-tanıma proxy — taş & bitki tanıma.
// Bitki: Pl@ntNet API (uzman botanik motoru, ücretsiz 500/gün) → güven skoruyla.
// Taş:   Groq vision (llama-4) — minerale uygun uzman ücretsiz API yok, sıkı abstain.
// Güvenlik: origin allowlist → method → boyut → per-IP rate limit → servis çağrısı.

const ALLOWED_ORIGINS = ["https://sakin.life", "https://www.sakin.life", "capacitor://localhost", "ionic://localhost"];
// Görü modelleri (taş): önce güçlü olanı dene; model adı geçersiz/emekli ise eskiye düş.
const GROQ_VISION_MODELS = [
  "meta-llama/llama-4-maverick-17b-128e-instruct",
  "meta-llama/llama-4-scout-17b-16e-instruct",
];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // ~5MB (base64 öncesi ham tahmini)

// Pl@ntNet: common-name dilini güvenli kümeyle sınırla (desteklenmeyen dil 400 döndürmesin).
// tr/ja için İngilizce common name istenir — DB eşleşmesi zaten nameEn üzerinden olduğu için daha isabetli.
const PLANTNET_LANGS = ["en", "fr", "de", "es", "pt", "it"];
const PLANT_TXT = {
  alt:  { tr:"Olabilecekler", en:"Could also be", de:"Könnte auch sein", es:"También podría ser", fr:"Pourrait aussi être", pt:"Também pode ser", ja:"他の可能性" },
  fam:  { tr:"Familya", en:"Family", de:"Familie", es:"Familia", fr:"Famille", pt:"Família", ja:"科" },
  warm: { tr:"Doğanın sakin bir parçası.", en:"A calm piece of nature.", de:"Ein ruhiges Stück Natur.", es:"Una parte serena de la naturaleza.", fr:"Un paisible morceau de nature.", pt:"Uma parte serena da natureza.", ja:"自然の静かな一部。" },
};

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
const L = (m, lang) => m[lang] || m.en;

// ── Bitki: Pl@ntNet ──────────────────────────────────────────────────────────
// Dönüş: { text } (UNSURE dahil) | { fallback:true } (altyapı hatası → LLM'e düş)
async function identifyPlant(imageDataUrl, lang) {
  const key = process.env.PLANTNET_API_KEY;
  if (!key) return { fallback: true };

  const b64 = (imageDataUrl.split(",")[1] || "");
  const buf = Buffer.from(b64, "base64");
  const blob = new Blob([buf], { type: "image/jpeg" });
  const form = new FormData();
  form.append("images", blob, "photo.jpg");
  form.append("organs", "auto");

  const pnLang = PLANTNET_LANGS.includes(lang) ? lang : "en";
  const url = `https://my-api.plantnet.org/v2/identify/all?api-key=${encodeURIComponent(key)}&nb-results=5&lang=${pnLang}&include-related-images=false&no-reject=false`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  let res;
  try {
    res = await fetch(url, { method: "POST", body: form, signal: ctrl.signal });
  } catch (e) {
    console.error("[identify] plantnet fetch", e?.message);
    return { fallback: true };
  } finally { clearTimeout(timer); }

  // 404 = tür bulunamadı / bitki değil → nazikçe "emin değilim".
  if (res.status === 404) return { text: "UNSURE" };
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    console.error("[identify] plantnet error", res.status, t.slice(0, 200));
    // 401/403 (anahtar) / 429 (kota) / 5xx → özellik kırılmasın, LLM'e düş.
    return { fallback: true };
  }

  let data; try { data = await res.json(); } catch { return { fallback: true }; }
  const results = Array.isArray(data?.results) ? data.results : [];
  const top = results[0];
  // Düşük güven → uydurmadan abstain (kullanıcı: tanıyamazsa daha net foto / özür).
  if (!top || (top.score ?? 0) < 0.10) return { text: "UNSURE" };

  const sci = top.species?.scientificNameWithoutAuthor || "";
  const commons = Array.isArray(top.species?.commonNames) ? top.species.commonNames.filter(Boolean) : [];
  const primary = commons[0] || sci;
  const pct = Math.round((top.score || 0) * 100);
  const pctStr = lang === "tr" ? `%${pct}` : `${pct}%`;
  const family = top.species?.family?.scientificNameWithoutAuthor || "";
  const alts = results.slice(1, 3)
    .map((r) => r.species?.commonNames?.[0] || r.species?.scientificNameWithoutAuthor)
    .filter(Boolean);

  // Sci adı L1'e de koy: host DB eşleşmesi (name/nameEn) substring ile çalışsın.
  const l1 = `${primary}${sci && primary !== sci ? ` (${sci})` : ""} — ${pctStr}`;
  const out = [l1];
  if (alts.length) out.push(`${L(PLANT_TXT.alt, lang)}: ${alts.join(", ")}`);
  if (family) out.push(`${L(PLANT_TXT.fam, lang)}: ${family}`);
  while (out.length < 3) out.push(L(PLANT_TXT.warm, lang));
  return { text: out.join("\n") };
}

// ── Taş (ve bitki fallback): Groq vision LLM ─────────────────────────────────
async function identifyWithLLM(imageDataUrl, kind, lang, name, candidates) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { error: 502, body: { error: "Server not configured" } };

  const subject = kind === "plant" ? "a plant, herb or flower" : "a crystal, gemstone or healing stone";
  const features = kind === "plant"
    ? "leaf shape, leaf arrangement, flowers, color and growth habit"
    : "color, transparency, luster, crystal form, banding and inclusions";

  const list = Array.isArray(candidates)
    ? candidates.filter((c) => typeof c === "string" && c.trim()).slice(0, 300).map((c) => c.trim())
    : [];
  const listBlock = list.length
    ? `Sakin currently knows these ${kind}s (name, with English/Latin name in parentheses):\n${list.join("; ")}\n\n`
    : "";

  const prompt = `You are "Sakin" (a wellness app's) gentle identification guide. "Sakin" is only the app's name — never use it as the identified ${kind}'s name. Examine the photo of ${subject} closely, paying attention to ${features}.

${listBlock}Identify it ONLY if you are reasonably confident. Do NOT force or guess.
- If it clearly matches one of the ${kind}s Sakin knows, write THAT item's name on line 1, copied EXACTLY as written above (you may omit the parenthetical English part).
- If you are confident it is something NOT in that list, you may still name what you actually see.
- If you are NOT reasonably confident, the image is blurry or too far away, it is not ${subject}, or you cannot fill in all three lines below with real content, reply with EXACTLY this single word and nothing else: UNSURE

When — and only when — you are confident, respond ENTIRELY in ${name}, using ONLY ${name} words, in exactly three short non-empty lines, each with real content (never just a number, never the word "Sakin" as a name):
1) <name of the ${kind}> — confidence as a percentage.
2) Two alternatives it could be.
3) One short, warm sentence about its nature/energy, in a grounded-spiritual tone.
No medical advice.`;

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
          model, max_tokens: 480, temperature: 0.2,
          messages: [{ role: "user", content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ] }],
        }),
        signal: ctrl.signal,
      });
    } catch (e) {
      console.error("[identify] groq fetch", model, e?.message);
      lastStatus = 0; continue;
    } finally { clearTimeout(timer); }

    if (res.ok) { data = await res.json(); break; }
    lastStatus = res.status;
    const errTxt = await res.text().catch(() => "");
    console.error("[identify] groq error", model, res.status, errTxt.slice(0, 200));
    if (res.status !== 400 && res.status !== 404) break;
  }

  if (!data) return { error: 502, body: { error: "Vision service error", status: lastStatus } };
  const text = data?.choices?.[0]?.message?.content?.trim() || "";
  if (!text) return { error: 502, body: { error: "Empty response" } };
  return { text };
}

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

  try {
    // Bitki → önce Pl@ntNet (uzman). Altyapı hatasında LLM'e düş.
    if (kind === "plant") {
      const p = await identifyPlant(image, lang);
      if (p && typeof p.text === "string") return json(200, ch, { text: p.text });
      // p.fallback → aşağıdaki LLM yoluna devam
    }
    const r = await identifyWithLLM(image, kind, lang, name, candidates);
    if (r.error) return json(r.error, ch, r.body);
    return json(200, ch, { text: r.text });
  } catch (e) {
    console.error("[identify] error", e?.message);
    return json(502, ch, { error: "Identification failed" });
  }
};
