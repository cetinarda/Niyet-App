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
const RATE_MAX = 12;

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
// In TR mode we strip ALL non-Latin scripts (legacy behavior).
// In other modes we only strip scripts that the target language does NOT use,
// otherwise we'd delete the entire response (e.g. Japanese kanji).
function buildSanitizer(lang) {
  // ranges → which language(s) need them
  const ranges = {
    cjkUnified: { re: /[一-鿿]/g, keepFor: ["ja"] },   // Han / Kanji
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

const VALID_ROLES = ["user", "assistant", "system"];

// Supported UI languages. Codes match src/i18n.js LANGUAGES.
const LANG_META = {
  "tr":    { name: "Turkish",              native: "Türkçe",            sample: "Türkçe karakterleri (ş ğ ı ü ö ç İ) eksiksiz kullan." },
  "en":    { name: "English",              native: "English",           sample: "Use natural, fluent English." },
  "de":    { name: "German",               native: "Deutsch",           sample: "Verwende deutsche Umlaute (ä ö ü ß) korrekt." },
  "es":    { name: "Spanish",              native: "Español",           sample: "Usa los acentos y la ñ correctamente." },
  "pt-BR": { name: "Brazilian Portuguese", native: "Português (Brasil)", sample: "Use os acentos do português brasileiro corretamente." },
  "fr":    { name: "French",               native: "Français",          sample: "Utilise les accents français (é è ê à ç) correctement." },
  "ja":    { name: "Japanese",             native: "日本語",            sample: "自然な日本語で、ひらがな・カタカナ・漢字を適切に使ってください。" },
};

function normalizeLang(raw) {
  if (typeof raw !== "string") return "tr";
  const v = raw.trim();
  if (LANG_META[v]) return v;
  // tolerate short forms
  const short = v.toLowerCase().split(/[-_]/)[0];
  const fallback = { pt: "pt-BR" }[short] || short;
  return LANG_META[fallback] ? fallback : "tr";
}

// English meta-instruction is intentional: LLMs follow English directives most reliably.
function buildLanguageDirective(lang) {
  const meta = LANG_META[lang];
  return `LANGUAGE LOCK — HIGHEST PRIORITY:
You MUST write the ENTIRE response in ${meta.name} (${meta.native}), regardless of the language of the user's input, the language of the context/system text, or any examples shown. Do NOT translate the user's input; only the OUTPUT must be in ${meta.name}.
Do not switch languages mid-response. Do not add parenthetical translations. ${meta.sample}
Do not use Chinese, Arabic, Korean, Devanagari, or any script that is not part of ${meta.name}${lang === "ja" ? "" : " (Japanese scripts only allowed when the output language is Japanese)"}.

`;
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

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "API anahtarı bulunamadı (GROQ_API_KEY)" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Geçersiz istek" }) };
  }

  const { system, messages, max_tokens, lang: rawLang } = body;
  const lang = normalizeLang(rawLang);

  if (system !== undefined && (typeof system !== "string" || system.length > 12000)) {
    return { statusCode: 400, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Geçersiz system" }) };
  }
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
    return { statusCode: 400, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Geçersiz messages" }) };
  }
  for (const m of messages) {
    if (!m || typeof m.content !== "string" || m.content.length > 16000) {
      return { statusCode: 400, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Mesaj içeriği geçersiz" }) };
    }
    if (!VALID_ROLES.includes(m.role)) {
      return { statusCode: 400, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Geçersiz rol" }) };
    }
  }

  const safeMaxTokens = Math.min(Math.max(parseInt(max_tokens) || 1800, 100), 1800);

  const langDirective = buildLanguageDirective(lang);

  const groqMessages = [];
  groqMessages.push({ role: "system", content: langDirective + (system || "") });
  for (const m of messages) groqMessages.push({ role: m.role, content: m.content });

  let res, data;
  try {
    res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: safeMaxTokens,
        temperature: 0.75,
        top_p: 0.9,
        messages: groqMessages,
      }),
    });
    data = await res.json();
  } catch (e) {
    return { statusCode: 502, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Bağlantı hatası: " + e.message }) };
  }

  if (!res.ok || data.error) {
    const errMsg = data.error?.message || `HTTP ${res.status}`;
    return { statusCode: res.status, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: errMsg }) };
  }

  const raw = data.choices?.[0]?.message?.content || "";
  const sanitize = buildSanitizer(lang);
  const text = sanitize(raw);
  return { statusCode: 200, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ text }) };
};
