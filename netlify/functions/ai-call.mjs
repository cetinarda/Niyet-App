// Hardened Groq proxy for in-app AI calls.
// Security layers (in order): origin allowlist → method check → body size cap →
// per-IP sliding window rate limit → schema validation → user-content length cap →
// server-side max_tokens clamp → upstream call with generic error sanitization.
//
// CAVEAT (in-memory rate limit): Netlify Functions are container-warm but ephemeral.
// State here survives across invocations on the same warm container only. A determined
// attacker who hits enough cold containers (or different regions) bypasses this layer.
// For production-grade protection use a shared store (Upstash Redis, Netlify Blobs).
// Documented in the security-hardening pass.

// ---- RAG: kitap bilgi havuzu (lexical retrieval — özgün, kitap-temelli sentez) -
import BOOK_CHUNKS from "./book-chunks.json";
const _RAG_STOP = new Set(["ve","ile","bir","bu","için","ama","gibi","daha","çok","her","ben","sen","biz","ya","de","da","ki","olan","the","and","that","this","with","ama","ise","ya"]);
function _ragTokens(s) {
  return String(s || "").toLowerCase().replace(/[^a-zçğıöşü0-9\s]/gi, " ").split(/\s+/).filter((w) => w.length >= 4 && !_RAG_STOP.has(w));
}
// Sorguyla en alakalı kitap pasajlarını döndür (anahtar-kelime örtüşmesi).
function retrieveBookPassages(query, k = 5) {
  const qt = [...new Set(_ragTokens(query))];
  if (!qt.length) return [];
  const scored = [];
  for (const c of BOOK_CHUNKS) {
    const ct = c.t.toLowerCase();
    let score = 0;
    for (const w of qt) if (ct.includes(w)) score++;
    if (score > 1) scored.push({ score, c });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).map((x) => x.c);
}

// ---- CORS / origin allowlist -------------------------------------------------

// Production-allowed exact origins.
const ALLOWED_EXACT_ORIGINS = new Set([
  "https://sakin.life",
  "https://www.sakin.life",
  "capacitor://localhost",  // iOS Capacitor
  "ionic://localhost",
  "https://localhost",       // Android Capacitor (varsayılan androidScheme=https)
  "http://localhost",        // Android Capacitor (androidScheme=http kurulumları)
]);
// Suffix matches (Netlify deploy previews / embed proxies).
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
  // Echo back ONLY if allowed; never auto-substitute (that would silently widen CORS).
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

// ---- Rate limit (per-IP sliding window) -------------------------------------
// Max 20 requests per 10 minutes per IP. timestamps[] eviction.
// In-memory only — see CAVEAT at top of file.

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 20;
const rateMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const arr = rateMap.get(ip) || [];
  // Evict timestamps older than the window.
  const fresh = arr.filter((t) => now - t < RATE_WINDOW_MS);
  if (fresh.length >= RATE_MAX) {
    rateMap.set(ip, fresh);
    return true;
  }
  fresh.push(now);
  rateMap.set(ip, fresh);
  // Best-effort housekeeping: occasionally purge cold IPs to bound memory.
  if (rateMap.size > 5000 && Math.random() < 0.01) {
    for (const [k, v] of rateMap) {
      if (!v.length || now - v[v.length - 1] > RATE_WINDOW_MS) rateMap.delete(k);
    }
  }
  return false;
}

// Netlify'ın platform-set, SAHTELENEMEZ header'ı kullanılıyor — client-supplied
// `x-forwarded-for`'a güvenmek, isteğin kendi header'ını sahteleyerek bu rate
// limit'i (ücretli Groq çağrılarını sınırsız tekrarlamak için) bypass etmesine izin veriyordu.
function getClientIP(event) {
  return (event.headers?.["x-nf-client-connection-ip"] || event.headers?.["client-ip"] || "unknown").toString();
}

// ---- Output sanitizer (preserved from original) -----------------------------
// Strip foreign-script glyph runs that the model sometimes hallucinates.
// Keep scripts the target language legitimately uses (e.g. kanji for JA).
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

const VALID_ROLES = ["user", "assistant", "system"];

// ---- Language plumbing (preserved) ------------------------------------------
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

// ---- Hard limits -------------------------------------------------------------
const MAX_BODY_BYTES = 64 * 1024;          // 64KB body size cap
const MAX_USER_CONTENT_CHARS = 16000;      // total chars across messages[].content. Restored to the
                                           // pre-security-rewrite per-message value (16000): these prompts
                                           // legitimately carry large static guides (Reiki/Louise Hay,
                                           // breath/section refs) inside the user turn. 4000 silently broke
                                           // all 5 ai-call screens in prod with HTTP 413 "Input too long".
const MAX_SYSTEM_CHARS = 12000;            // system prompt cap (client-supplied; trusted but bounded)
const MAX_TOKENS_CEIL = 2000;              // server-side clamp regardless of client value
const MAX_TOKENS_FLOOR = 100;
const MAX_TOKENS_DEFAULT = 1800;
const MAX_MESSAGES = 30;

// Generic error returned to ALL upstream/internal failures. Never leak details to client.
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
  // For disallowed origins return 403 with NO Allow-Origin header (so browser blocks too).
  const cors = originOk ? buildCorsHeaders(origin) : {};

  // ---- CORS preflight ---
  if (event.httpMethod === "OPTIONS") {
    if (!originOk) {
      return { statusCode: 403, body: "" };
    }
    return { statusCode: 204, headers: cors, body: "" };
  }

  // ---- Origin lockdown ---
  if (!originOk) {
    return { statusCode: 403, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Origin not allowed" }) };
  }

  // ---- Method check ---
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, cors, { error: "Method not allowed" });
  }

  // ---- Body size cap (before parse to avoid wasting CPU on huge payloads) ---
  const rawBody = event.body || "";
  // event.body is a string; Buffer.byteLength gives true byte size for base64/UTF-8.
  const bodyBytes = event.isBase64Encoded
    ? Math.floor(rawBody.length * 0.75)
    : Buffer.byteLength(rawBody, "utf8");
  if (bodyBytes > MAX_BODY_BYTES) {
    return jsonResponse(413, cors, { error: "Payload too large" });
  }

  // ---- Rate limit ---
  const ip = getClientIP(event);
  if (isRateLimited(ip)) {
    return jsonResponse(429, cors, { error: "Too many requests. Please slow down." });
  }

  // ---- Env / config (server-only; never reflected) ---
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("[ai-call] GROQ_API_KEY missing in environment");
    return jsonResponse(500, cors, { error: GENERIC_AI_ERROR });
  }

  // ---- Body parse ---
  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return jsonResponse(400, cors, { error: "Invalid request body" });
  }

  const { system, messages, max_tokens, lang: rawLang } = body;
  const lang = normalizeLang(rawLang);

  // ---- Schema validation ---
  if (system !== undefined && (typeof system !== "string" || system.length > MAX_SYSTEM_CHARS)) {
    return jsonResponse(400, cors, { error: "Invalid system" });
  }
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return jsonResponse(400, cors, { error: "Invalid messages" });
  }

  // ---- Total user-content length cap (cost control) ---
  // Sum the bytes of all messages[].content — this is the user-influenced surface.
  let totalUserChars = 0;
  for (const m of messages) {
    if (!m || typeof m.content !== "string") {
      return jsonResponse(400, cors, { error: "Invalid message content" });
    }
    if (!VALID_ROLES.includes(m.role)) {
      return jsonResponse(400, cors, { error: "Invalid role" });
    }
    totalUserChars += m.content.length;
  }
  if (totalUserChars > MAX_USER_CONTENT_CHARS) {
    return jsonResponse(413, cors, { error: "Input too long" });
  }

  // ---- Server-side max_tokens clamp (never trust client for cost-critical fields) ---
  const requested = parseInt(max_tokens) || MAX_TOKENS_DEFAULT;
  const safeMaxTokens = Math.min(Math.max(requested, MAX_TOKENS_FLOOR), MAX_TOKENS_CEIL);

  // ---- Build upstream payload ---
  const langDirective = buildLanguageDirective(lang);
  let systemContent = langDirective + (system || "");
  // RAG: istemci ragQuery gönderdiyse, en alakalı kitap pasajlarını sistem prompt'una harmanla.
  // Opsiyonel — ragQuery yoksa davranış AYNI (mevcut çağrılar hiç etkilenmez).
  if (typeof body.ragQuery === "string" && body.ragQuery.trim().length >= 3 && body.ragQuery.length <= 1200) {
    try {
      const passages = retrieveBookPassages(body.ragQuery, 5);
      if (passages.length) {
        const ragText = passages.map((p) => `(${p.b}) ${p.t}`).join("\n\n");
        systemContent += `\n\nİLGİLİ KİTAP BİLGELİĞİ (aşağıdaki pasajlardaki özü yorumuna DOĞAL biçimde harmanla; alıntı yapma, kitap/kaynak adı yazma, kopyalama — yalnızca ruhunu sentezle):\n${ragText}`;
      }
    } catch (_) { /* RAG başarısızsa sessiz geç — normal akış sürer */ }
  }
  const groqMessages = [
    { role: "system", content: systemContent },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  // ---- Upstream call. Any failure → generic error to client; details only to server log. ---
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
        temperature: 0.7,
        top_p: 0.9,
        messages: groqMessages,
      }),
    });
    data = await res.json();
  } catch (e) {
    // Server-side log only; never include exception message or stack in client response.
    console.error("[ai-call] upstream fetch failed:", e?.message || e);
    return jsonResponse(502, cors, { error: GENERIC_AI_ERROR });
  }

  if (!res.ok || data?.error) {
    // Log full upstream error server-side for debugging — NEVER echo to client.
    console.error("[ai-call] upstream error:", res.status, data?.error?.message || data?.error || "(no body)");
    return jsonResponse(502, cors, { error: GENERIC_AI_ERROR });
  }

  const raw = data.choices?.[0]?.message?.content || "";
  const sanitize = buildSanitizer(lang);
  const text = sanitize(raw);
  return jsonResponse(200, cors, { text });
};
