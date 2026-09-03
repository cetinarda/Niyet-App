// KOLEKTIF NABIZ - Orkestra Modu Faz 1 okuma ucu (public, anonim).
// ------------------------------------------------------------------------
// Uygulama "Ben" ekranindaki Orkestra karti bunu cagirir. Doner:
//   { week, activeUsers, nefes, freqMinutes, topWord, topChakra, comment }
// KISISEL VERI YOK: yalnizca toplu sayilar + onceden tanimli chip adlari
// (niyet kelimesi / cakra). Serbest metin, isim, dogum, mesaj HICBIR SEY yok.
//
// NEDEN OKUMA ANINDA HESAPLANIR: haftalik toplamlar her kullanicinin kendi
// kaydinda (u/<id>.wc) tutuluyor (track.mjs); ayri bir canli toplam blob'u
// yazma sicak noktasi olur ve es zamanli artislar kaybolurdu. Burada kullanici
// listesi taranip toplaniyor (report.mjs deseni), sonuc CACHE'leniyor ki her
// uygulama acilisinda tum blob'lar taranmasin.
//
// CACHE:
//   pulse/agg            -> { at, week, data }          (~1 saat tazelik)
//   pulse/comment/W/lang -> { text }                    (hafta+dil basina bir kez)
//
// ⚠️ FUNCTIONS V2 API (export default, Request/Response) - track.mjs/report.mjs
// ile ayni sebep: Blobs siteID/token'i yalnizca v2'de otomatik cozuluyor.
import { getStore } from "@netlify/blobs";
import { groqChat, stripThink } from "./_groq.mjs";

const ALLOWED_ORIGINS = ["https://sakin.life", "https://www.sakin.life", "capacitor://localhost", "ionic://localhost", "https://localhost", "http://localhost"];
const ALLOWED_SUFFIXES = [".netlify.app"];

function isAllowedOrigin(origin) {
  if (!origin) return true; // native WebView bazen origin gondermez
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  try { const u = new URL(origin); return u.protocol === "https:" && ALLOWED_SUFFIXES.some((s) => u.hostname.endsWith(s)); }
  catch { return false; }
}
function cors(origin) {
  return { "Access-Control-Allow-Origin": origin || "*", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Vary": "Origin" };
}
function json(headers, code, obj) {
  return new Response(JSON.stringify(obj), { status: code, headers: { ...headers, "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

// track.mjs ile AYNI ISO hafta tanimi (oradan kopya; iki fonksiyon dosyasi
// birbirini import edemedigi icin birebir ayni matematik tutuluyor).
function isoWeek(ts) {
  const d = new Date(ts);
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day + 3);
  const firstThu = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((d - firstThu) / 86400000 - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7);
  return d.getUTCFullYear() + "-W" + String(week).padStart(2, "0");
}

const MAX_USERS = 20000;
const AGG_TTL_MS = 60 * 60 * 1000; // toplu tarama en fazla saatte bir

// Kullanici kayitlarindan icinde bulunulan haftanin toplamini cikar. Saf
// fonksiyon (test edilebilir), report.mjs/aggregate ile ayni ruh.
export function aggregatePulse(users, week) {
  let activeUsers = 0, nefes = 0, freqSec = 0;
  const words = {}, chakras = {};
  for (const u of users) {
    const wc = u && u.wc;
    if (!wc || wc.wk !== week) continue;
    activeUsers++;
    nefes += wc.nefes || 0;
    freqSec += wc.freqSec || 0;
    for (const k in (wc.words || {})) words[k] = (words[k] || 0) + wc.words[k];
    for (const k in (wc.chakras || {})) chakras[k] = (chakras[k] || 0) + wc.chakras[k];
  }
  const topOf = (m) => { let best = null, n = 0; for (const k in m) if (m[k] > n) { n = m[k]; best = k; } return best; };
  return {
    week,
    activeUsers,
    nefes,
    freqMinutes: Math.round(freqSec / 60),
    topWord: topOf(words),
    topChakra: topOf(chakras),
  };
}

async function computeAggregate(store, week) {
  const users = [];
  try {
    const { blobs } = await store.list({ prefix: "u/" });
    const keys = (blobs || []).map((b) => b.key);
    for (const k of keys) {
      if (users.length >= MAX_USERS) break;
      try { const rec = await store.get(k, { type: "json" }); if (rec) users.push(rec); } catch (_) {}
    }
  } catch (_) { /* liste patlarsa bos toplamla don */ }
  return aggregatePulse(users, week);
}

const LANG_NAME = { tr: "Turkish", en: "English", de: "German", es: "Spanish", pt: "Portuguese", fr: "French", ja: "Japanese" };
const SAMPLE = { tr: "Türkçe karakterleri (ş ğ ı ü ö ç) eksiksiz kullan.", ja: "自然な日本語で書いてください。" };

// Haftalik kolektif yorum: toplu sayilardan tek-iki cumlelik sicak bir
// gozlem. Kisisel veri yok; yalnizca "bu hafta topluluk sunu yapti" ozeti.
async function weeklyComment(apiKey, data, lang) {
  const name = LANG_NAME[lang] || "English";
  const facts = [
    `active people this week: ${data.activeUsers}`,
    `total breaths: ${data.nefes}`,
    `total sound/frequency minutes: ${data.freqMinutes}`,
    data.topWord ? `most chosen intention word: ${data.topWord}` : null,
    data.topChakra ? `most chosen chakra: ${data.topChakra}` : null,
  ].filter(Boolean).join("; ");
  const system = `You write a short, warm collective reflection for a calm/mindfulness app's community screen. Write ONLY in ${name}. ${SAMPLE[lang] || ""}
Rules: 2 sentences maximum. Speak of "the community" / "we" this week, never a single person. No medical, spiritual-certainty, or predictive claims. Do NOT invent numbers beyond the ones given. Do NOT use an em dash, en dash or horizontal bar; use a comma or period. Warm, plain, honest. No hashtags, no emojis.`;
  const user = `This week's anonymous collective totals: ${facts}. Write the reflection.`;
  const out = await groqChat(apiKey, "text", {
    max_tokens: 220, temperature: 0.7, top_p: 0.9,
    messages: [{ role: "system", content: system }, { role: "user", content: user }],
  });
  if (!out.ok) return "";
  let text = stripThink(out.data.choices?.[0]?.message?.content || "").trim();
  text = text.replace(/ [—–―] /g, ", ").replace(/[—–―]/g, "-").trim();
  return text;
}

export default async (req) => {
  const origin = req.headers.get("origin") || "";
  const originOk = isAllowedOrigin(origin);
  const headers = (originOk && origin) ? cors(origin) : {};
  if (req.method === "OPTIONS") {
    if (!originOk) return new Response("", { status: 403 });
    return new Response(null, { status: 204, headers });
  }
  if (!originOk) return json(headers, 403, { error: "origin" });
  if (req.method !== "GET") return json(headers, 405, { error: "method" });

  const url = new URL(req.url);
  const lang = (url.searchParams.get("lang") || "tr").slice(0, 5).toLowerCase().split(/[-_]/)[0];
  const now = Date.now();
  const week = isoWeek(now);

  let store;
  try { store = getStore("sakin-usage"); }
  catch (_) { return json(headers, 200, { ok: false, nostore: true }); }

  // 1) Toplu sayilar (saatlik cache)
  let data = null;
  try {
    const cached = await store.get("pulse/agg", { type: "json" });
    if (cached && cached.week === week && (now - cached.at) < AGG_TTL_MS) data = cached.data;
  } catch (_) {}
  if (!data) {
    data = await computeAggregate(store, week);
    try { await store.setJSON("pulse/agg", { at: now, week, data }); } catch (_) {}
  }

  // 2) Haftalik yorum (hafta + dil basina bir kez). Anlamli veri yoksa uretme.
  let comment = "";
  const commentKey = `pulse/comment/${week}/${lang}`;
  try {
    const c = await store.get(commentKey, { type: "json" });
    if (c && typeof c.text === "string") comment = c.text;
  } catch (_) {}
  if (!comment && data.activeUsers >= 1) {
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      try {
        comment = await weeklyComment(apiKey, data, lang);
        if (comment) { try { await store.setJSON(commentKey, { text: comment, at: now }); } catch (_) {} }
      } catch (_) { comment = ""; }
    }
  }

  return json(headers, 200, { ok: true, ...data, comment });
};
