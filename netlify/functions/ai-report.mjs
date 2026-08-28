// Hardened Groq proxy for the weekly inner-report generation.
// Mirrors the security layers in ai-call.mjs. See that file's top comment
// for the in-memory rate-limit caveat (Netlify warm-vs-cold containers).
import { groqChat, stripThink, langConformanceOk } from "./_groq.mjs";

// ---- CORS / origin allowlist -------------------------------------------------

const ALLOWED_EXACT_ORIGINS = new Set([
  "https://sakin.life",
  "https://www.sakin.life",
  "capacitor://localhost",  // iOS Capacitor
  "ionic://localhost",
  "https://localhost",       // Android Capacitor (varsayılan androidScheme=https)
  "http://localhost",        // Android Capacitor (androidScheme=http kurulumları)
]);
const ALLOWED_ORIGIN_SUFFIXES = [".netlify.app"];

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_EXACT_ORIGINS.has(origin)) return true;
  try {
    const u = new URL(origin);
    if (u.protocol !== "https:") return false;
    return ALLOWED_ORIGIN_SUFFIXES.some((suf) => u.hostname.endsWith(suf));
  } catch {
    return false;
  }
}

function buildCorsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

// ---- Rate limit (per-IP sliding window) -------------------------------------
// Report generation is heavier than chat, so cap is tighter.
// Sliding window: 10 reports / 10 minutes per IP. timestamps[] eviction.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 10;
const rateMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const arr = rateMap.get(ip) || [];
  const fresh = arr.filter((t) => now - t < RATE_WINDOW_MS);
  if (fresh.length >= RATE_MAX) {
    rateMap.set(ip, fresh);
    return true;
  }
  fresh.push(now);
  rateMap.set(ip, fresh);
  if (rateMap.size > 5000 && Math.random() < 0.01) {
    for (const [k, v] of rateMap) {
      if (!v.length || now - v[v.length - 1] > RATE_WINDOW_MS) rateMap.delete(k);
    }
  }
  return false;
}

// Netlify'ın platform-set, SAHTELENEMEZ header'ı kullanılıyor: client-supplied
// `x-forwarded-for`'a güvenmek, isteğin kendi header'ını sahteleyerek bu rate
// limit'i (ücretli Groq çağrılarını sınırsız tekrarlamak için) bypass etmesine izin veriyordu.
function getClientIP(event) {
  return (event.headers?.["x-nf-client-connection-ip"] || event.headers?.["client-ip"] || "unknown").toString();
}

// ---- Output sanitizer (preserved) -------------------------------------------
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

// ---- Language plumbing (preserved) ------------------------------------------
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

const DAY_LABELS = {
  "tr":    { day: "Gün",  date: "tarih", intent: "Niyet",     words: "Kelimeler", chakra: "Günün çakrası",     breaths: "Nefes sayısı",  learned: "Bugün ne öğrendim",      gratitude: "Şükür" },
  "en":    { day: "Day",  date: "date",  intent: "Intention", words: "Words",     chakra: "Today's chakra",     breaths: "Breath count",  learned: "What I learned today",   gratitude: "Gratitude" },
  "de":    { day: "Tag",  date: "Datum", intent: "Absicht",   words: "Wörter",    chakra: "Chakra des Tages",   breaths: "Atemzüge",      learned: "Was ich heute gelernt habe", gratitude: "Dankbarkeit" },
  "es":    { day: "Día",  date: "fecha", intent: "Intención", words: "Palabras",  chakra: "Chakra del día",     breaths: "Respiraciones", learned: "Lo que aprendí hoy",     gratitude: "Gratitud" },
  "pt-BR": { day: "Dia",  date: "data",  intent: "Intenção",  words: "Palavras",  chakra: "Chakra do dia",      breaths: "Respirações",   learned: "O que aprendi hoje",     gratitude: "Gratidão" },
  "fr":    { day: "Jour", date: "date",  intent: "Intention", words: "Mots",      chakra: "Chakra du jour",     breaths: "Respirations",  learned: "Ce que j'ai appris aujourd'hui", gratitude: "Gratitude" },
  "ja":    { day: "日",   date: "日付",  intent: "意図",      words: "言葉",      chakra: "今日のチャクラ",     breaths: "呼吸回数",      learned: "今日学んだこと",         gratitude: "感謝" },
};

const USER_PROMPT_PREAMBLE = {
  "tr":    (block) => `Bu haftaki günlük verilerim:\n\n${block}\n\nLütfen haftalık içsel raporumu oluştur.`,
  "en":    (block) => `My daily entries for this week:\n\n${block}\n\nPlease generate my weekly inner report.`,
  "de":    (block) => `Meine täglichen Einträge dieser Woche:\n\n${block}\n\nBitte erstelle meinen wöchentlichen inneren Bericht.`,
  "es":    (block) => `Mis registros diarios de esta semana:\n\n${block}\n\nPor favor, genera mi informe interior semanal.`,
  "pt-BR": (block) => `Meus registros diários desta semana:\n\n${block}\n\nPor favor, gere meu relatório interno semanal.`,
  "fr":    (block) => `Mes entrées quotidiennes de cette semaine :\n\n${block}\n\nVeuillez générer mon rapport intérieur hebdomadaire.`,
  "ja":    (block) => `今週の日々の記録：\n\n${block}\n\n週間の内省レポートを作成してください。`,
};

function buildSystemPrompt(lang) {
  const meta = LANG_META[lang];
  return `LANGUAGE LOCK, HIGHEST PRIORITY:
You MUST write the ENTIRE report in ${meta.name} (${meta.native}), regardless of the language of the user's input. Do NOT switch languages mid-response. Do NOT add parenthetical translations. Do not use any script that is not part of ${meta.name}${lang === "ja" ? "" : " (no CJK, no Arabic, no Devanagari, no Hangul)"}.

STYLE:
Write in flowing, simple, slightly poetic prose. Be clear and confident. NEVER use hedging phrases like "perhaps", "maybe", "possibly", "it could be said", "one might", "probably" (or their equivalents in ${meta.name}).

ROLE:
You are a deep mirror and inner-awareness guide. Reflect the user's weekly data back to them as a heartfelt, poetic inner report. Point directly to the source of any difficulty. Show them where they can look; remind them to offer themselves love.

OPENING LINE (translate this sentence into ${meta.name} and place it at the very top of the report):
"This report is for you. It is a helper that supports the world of your thoughts. Filter it through your heart and take the part that warms you."

REQUIRED SECTIONS (translate each heading into ${meta.name}, keep the same order, use ** for bold):
**Reflection of the Week**: Overall mood and energy, direct and clear (2-3 sentences)
**Recurring Themes**: Repeating intention words, chakra patterns; point directly to the source
**Inner Growth**: Meaning drawn from what was learned
**Heart of Gratitude**: A synthesis from the gratitude entries
**Intention for the Coming Week**: A short, inspiring suggestion

VOICE:
Warm, confident, poetic. Address the user as "you" (in ${meta.name}'s natural second-person form). Maximum 500 words.

PUNCTUATION: Do NOT use an em dash (—) anywhere; connect clauses with a comma, period, or colon instead. Do not use the "not just X, but Y" construction.`;
}

// ---- Hard limits -------------------------------------------------------------
const MAX_BODY_BYTES = 64 * 1024;          // 64KB body size cap
const MAX_USER_CONTENT_CHARS = 4000;       // total user-influenced characters in `gunler`
const MAX_MAX_TOKENS = 2000;               // server-side ceiling (we set this, but enforce explicitly)
const MAX_DAYS = 7;

const GENERIC_AI_ERROR = "AI temporarily unavailable";

function jsonResponse(statusCode, corsHeaders, payload) {
  return {
    statusCode,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  };
}

export const handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || "";
  const originOk = isAllowedOrigin(origin);
  const cors = originOk ? buildCorsHeaders(origin) : {};

  if (event.httpMethod === "OPTIONS") {
    if (!originOk) {
      return { statusCode: 403, body: "" };
    }
    return { statusCode: 204, headers: cors, body: "" };
  }

  if (!originOk) {
    return { statusCode: 403, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Origin not allowed" }) };
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, cors, { error: "Method not allowed" });
  }

  // ---- Body size cap ---
  const rawBody = event.body || "";
  const bodyBytes = event.isBase64Encoded
    ? Math.floor(rawBody.length * 0.75)
    : Buffer.byteLength(rawBody, "utf8");
  if (bodyBytes > MAX_BODY_BYTES) {
    return jsonResponse(413, cors, { error: "Payload too large" });
  }

  const ip = getClientIP(event);
  if (isRateLimited(ip)) {
    return jsonResponse(429, cors, { error: "Too many requests. Please slow down." });
  }

  let gunler, rawLang;
  try {
    const parsed = JSON.parse(rawBody);
    gunler = parsed.gunler;
    rawLang = parsed.lang;
  } catch {
    return jsonResponse(400, cors, { error: "Invalid request body" });
  }

  if (!Array.isArray(gunler) || gunler.length === 0 || gunler.length > MAX_DAYS) {
    return jsonResponse(400, cors, { error: "1-7 days of data required." });
  }

  // ---- Per-day validation + total user-content length cap ---
  let totalUserChars = 0;
  for (const g of gunler) {
    if (!g || typeof g !== "object") {
      return jsonResponse(400, cors, { error: "Invalid day entry" });
    }
    if (g.kelimeler && (!Array.isArray(g.kelimeler) || g.kelimeler.length > 10)) {
      return jsonResponse(400, cors, { error: "Invalid words" });
    }
    // Sum every user-supplied string field; this is the cost-driving surface.
    for (const field of ["tarih", "niyet", "chakra", "ogrendim", "sukur"]) {
      const v = g[field];
      if (typeof v === "string") totalUserChars += v.length;
    }
    if (Array.isArray(g.kelimeler)) {
      for (const k of g.kelimeler) {
        if (typeof k === "string") totalUserChars += k.length;
      }
    }
  }
  if (totalUserChars > MAX_USER_CONTENT_CHARS) {
    return jsonResponse(413, cors, { error: "Input too long" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("[ai-report] GROQ_API_KEY missing in environment");
    return jsonResponse(500, cors, { error: GENERIC_AI_ERROR });
  }

  const lang = normalizeLang(rawLang);
  const L = DAY_LABELS[lang];

  const gunlerText = gunler
    .map(
      (g, i) => `${L.day} ${i + 1} (${truncStr(g.tarih, 20)}):
- ${L.intent}: ${truncStr(g.niyet, 500) || "-"}
- ${L.words}: ${(g.kelimeler || []).map(k => truncStr(String(k), 50)).join(", ") || "-"}
- ${L.chakra}: ${truncStr(g.chakra, 50) || "-"}
- ${L.breaths}: ${parseInt(g.nefes) || 0}
- ${L.learned}: ${truncStr(g.ogrendim, 500) || "-"}
- ${L.gratitude}: ${truncStr(g.sukur, 500) || "-"}`
    )
    .join("\n\n");

  const systemPrompt = buildSystemPrompt(lang);
  const userPrompt = USER_PROMPT_PREAMBLE[lang](gunlerText);

  // ---- Upstream call with automatic model fallback (see _groq.mjs). ---
  const out = await groqChat(apiKey, "text", {
    max_tokens: MAX_MAX_TOKENS,
    temperature: 0.72,
    top_p: 0.9,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  }, { validate: (text) => langConformanceOk(text, lang) });
  if (!out.ok) {
    console.error("[ai-report] upstream failed, status:", out.status);
    return jsonResponse(502, cors, { error: GENERIC_AI_ERROR });
  }

  const sanitize = buildSanitizer(lang);
  const rapor = sanitize(stripThink(out.data.choices?.[0]?.message?.content || ""));
  return jsonResponse(200, cors, { rapor });
};
