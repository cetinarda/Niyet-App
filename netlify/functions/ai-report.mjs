const ALLOWED_ORIGINS = ["https://sakin.life", "https://www.sakin.life", "capacitor://localhost", "ionic://localhost"];

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

// Strip foreign-script glyph runs that the model sometimes hallucinates.
// Keep scripts that the target language legitimately needs (e.g. kanji for JA).
function buildSanitizer(lang) {
  const ranges = {
    cjkUnified: { re: /[一-鿿]/g, keepFor: ["ja"] },
    cjkExtA:    { re: /[㐀-䶿]/g, keepFor: ["ja"] },
    hiragana:   { re: /[぀-ゟ]/g, keepFor: ["ja"] },
    katakana:   { re: /[゠-ヿ]/g, keepFor: ["ja"] },
    arabic:     { re: /[؀-ۿ]/g, keepFor: [] },
    syriac:     { re: /[ݐ-ݿ]/g, keepFor: [] },
    hangul:     { re: /[가-힯]/g, keepFor: [] },
    hangulJamo: { re: /[ᄀ-ᇿ]/g, keepFor: [] },
    devanagari: { re: /[ऀ-ॿ]/g, keepFor: [] },
    cjkSymbols: { re: /[　-〿]/g, keepFor: ["ja"] },
    kangxi:     { re: /[⺀-⻿]/g, keepFor: ["ja"] },
  };
  return (text) => {
    let out = text;
    for (const { re, keepFor } of Object.values(ranges)) {
      if (!keepFor.includes(lang)) out = out.replace(re, "");
    }
    return out.trim();
  };
}

function truncStr(val, max) {
  if (typeof val !== "string") return "";
  return val.slice(0, max);
}

const LANG_META = {
  "tr":    { name: "Turkish",              native: "Türkçe" },
  "en":    { name: "English",              native: "English" },
  "de":    { name: "German",               native: "Deutsch" },
  "es":    { name: "Spanish",              native: "Español" },
  "pt-BR": { name: "Brazilian Portuguese", native: "Português (Brasil)" },
  "fr":    { name: "French",               native: "Français" },
  "ja":    { name: "Japanese",             native: "日本語" },
};

function normalizeLang(raw) {
  if (typeof raw !== "string") return "tr";
  const v = raw.trim();
  if (LANG_META[v]) return v;
  const short = v.toLowerCase().split(/[-_]/)[0];
  const fallback = { pt: "pt-BR" }[short] || short;
  return LANG_META[fallback] ? fallback : "tr";
}

// Localized field labels for the per-day summary block.
// Keeps the structure identical across languages so prompt logic stays unified.
const DAY_LABELS = {
  "tr":    { day: "Gün",  date: "tarih", intent: "Niyet",     words: "Kelimeler", chakra: "Günün çakrası",     breaths: "Nefes sayısı",  learned: "Bugün ne öğrendim",      gratitude: "Şükür" },
  "en":    { day: "Day",  date: "date",  intent: "Intention", words: "Words",     chakra: "Today's chakra",     breaths: "Breath count",  learned: "What I learned today",   gratitude: "Gratitude" },
  "de":    { day: "Tag",  date: "Datum", intent: "Absicht",   words: "Wörter",    chakra: "Chakra des Tages",   breaths: "Atemzüge",      learned: "Was ich heute gelernt habe", gratitude: "Dankbarkeit" },
  "es":    { day: "Día",  date: "fecha", intent: "Intención", words: "Palabras",  chakra: "Chakra del día",     breaths: "Respiraciones", learned: "Lo que aprendí hoy",     gratitude: "Gratitud" },
  "pt-BR": { day: "Dia",  date: "data",  intent: "Intenção",  words: "Palavras",  chakra: "Chakra do dia",      breaths: "Respirações",   learned: "O que aprendi hoje",     gratitude: "Gratidão" },
  "fr":    { day: "Jour", date: "date",  intent: "Intention", words: "Mots",      chakra: "Chakra du jour",     breaths: "Respirations",  learned: "Ce que j'ai appris aujourd'hui", gratitude: "Gratitude" },
  "ja":    { day: "日",   date: "日付",  intent: "意図",      words: "言葉",      chakra: "今日のチャクラ",     breaths: "呼吸回数",      learned: "今日学んだこと",         gratitude: "感謝" },
};

// Localized user-facing preamble that asks for the report.
const USER_PROMPT_PREAMBLE = {
  "tr":    (block) => `Bu haftaki günlük verilerim:\n\n${block}\n\nLütfen haftalık içsel raporumu oluştur.`,
  "en":    (block) => `My daily entries for this week:\n\n${block}\n\nPlease generate my weekly inner report.`,
  "de":    (block) => `Meine täglichen Einträge dieser Woche:\n\n${block}\n\nBitte erstelle meinen wöchentlichen inneren Bericht.`,
  "es":    (block) => `Mis registros diarios de esta semana:\n\n${block}\n\nPor favor, genera mi informe interior semanal.`,
  "pt-BR": (block) => `Meus registros diários desta semana:\n\n${block}\n\nPor favor, gere meu relatório interno semanal.`,
  "fr":    (block) => `Mes entrées quotidiennes de cette semaine :\n\n${block}\n\nVeuillez générer mon rapport intérieur hebdomadaire.`,
  "ja":    (block) => `今週の日々の記録：\n\n${block}\n\n週間の内省レポートを作成してください。`,
};

// English meta-instructions — LLMs follow these most reliably.
function buildSystemPrompt(lang) {
  const meta = LANG_META[lang];
  return `LANGUAGE LOCK — HIGHEST PRIORITY:
You MUST write the ENTIRE report in ${meta.name} (${meta.native}), regardless of the language of the user's input. Do NOT switch languages mid-response. Do NOT add parenthetical translations. Do not use any script that is not part of ${meta.name}${lang === "ja" ? "" : " (no CJK, no Arabic, no Devanagari, no Hangul)"}.

STYLE:
Write in flowing, simple, slightly poetic prose. Be clear and confident. NEVER use hedging phrases like "perhaps", "maybe", "possibly", "it could be said", "one might", "probably" (or their equivalents in ${meta.name}).

ROLE:
You are a deep mirror and inner-awareness guide. Reflect the user's weekly data back to them as a heartfelt, poetic inner report. Point directly to the source of any difficulty. Show them where they can look; remind them to offer themselves love.

OPENING LINE (translate this sentence into ${meta.name} and place it at the very top of the report):
"This report is for you. It is a helper that supports the world of your thoughts. Filter it through your heart and take the part that warms you."

REQUIRED SECTIONS (translate each heading into ${meta.name}, keep the same order, use ** for bold):
**Reflection of the Week** — Overall mood and energy — direct and clear (2–3 sentences)
**Recurring Themes** — Repeating intention words, chakra patterns — point directly to the source
**Inner Growth** — Meaning drawn from what was learned
**Heart of Gratitude** — A synthesis from the gratitude entries
**Intention for the Coming Week** — A short, inspiring suggestion

VOICE:
Warm, confident, poetic. Address the user as "you" (in ${meta.name}'s natural second-person form). Maximum 500 words.`;
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

  let gunler, rawLang;
  try {
    const parsed = JSON.parse(event.body);
    gunler = parsed.gunler;
    rawLang = parsed.lang;
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

  const lang = normalizeLang(rawLang);
  const L = DAY_LABELS[lang];

  const gunlerText = gunler
    .map(
      (g, i) => `${L.day} ${i + 1} (${truncStr(g.tarih, 20)}):
- ${L.intent}: ${truncStr(g.niyet, 500) || "—"}
- ${L.words}: ${(g.kelimeler || []).map(k => truncStr(String(k), 50)).join(", ") || "—"}
- ${L.chakra}: ${truncStr(g.chakra, 50) || "—"}
- ${L.breaths}: ${parseInt(g.nefes) || 0}
- ${L.learned}: ${truncStr(g.ogrendim, 500) || "—"}
- ${L.gratitude}: ${truncStr(g.sukur, 500) || "—"}`
    )
    .join("\n\n");

  const systemPrompt = buildSystemPrompt(lang);
  const userPrompt = USER_PROMPT_PREAMBLE[lang](gunlerText);

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
          { role: "user", content: userPrompt },
        ],
      }),
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      const errMsg = data.error?.message || `HTTP ${res.status}`;
      return { statusCode: res.status, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: errMsg }) };
    }

    const sanitize = buildSanitizer(lang);
    const rapor = sanitize(data.choices?.[0]?.message?.content || "Rapor oluşturulamadı.");
    return { statusCode: 200, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ rapor }) };
  } catch (e) {
    return { statusCode: 502, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Bağlantı hatası: " + e.message }) };
  }
};
