// KOLEKTIF NABIZ - Orkestra Modu Faz 1 okuma ucu (public, anonim).
// ------------------------------------------------------------------------
// Uygulama "Ben" ekranindaki Orkestra karti bunu cagirir. Doner:
//   { week, activeUsers, nefes, freqMinutes, chakraMinutes }
// KISISEL VERI YOK: yalnizca uc toplu sayi (nefes SAYISI, ses SURESI, cakra
// SURESI). YAZILI YORUM YOK (kullanici karari: "orkestra modunde yazi yorum
// verme, uc sayi yeterli"). Isim, dogum, mesaj, serbest metin HICBIR SEY yok.
//
// NEDEN OKUMA ANINDA HESAPLANIR: haftalik toplamlar her kullanicinin kendi
// kaydinda (u/<id>.wc) tutuluyor (track.mjs); ayri bir canli toplam blob'u
// yazma sicak noktasi olur ve es zamanli artislar kaybolurdu. Burada kullanici
// listesi taranip toplaniyor (report.mjs deseni), sonuc CACHE'leniyor ki her
// uygulama acilisinda tum blob'lar taranmasin.
//
// CACHE: pulse/agg -> { at, week, data } (~1 saat tazelik)
//
// ⚠️ FUNCTIONS V2 API (export default, Request/Response) - track.mjs/report.mjs
// ile ayni sebep: Blobs siteID/token'i yalnizca v2'de otomatik cozuluyor.
import { getStore } from "@netlify/blobs";

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
  let activeUsers = 0, nefes = 0, freqSec = 0, chakraSec = 0;
  for (const u of users) {
    const wc = u && u.wc;
    if (!wc || wc.wk !== week) continue;
    activeUsers++;
    nefes += wc.nefes || 0;
    freqSec += wc.freqSec || 0;
    chakraSec += wc.chakraSec || 0;
  }
  return {
    week,
    activeUsers,
    nefes,
    freqMinutes: Math.round(freqSec / 60),
    chakraMinutes: Math.round(chakraSec / 60),
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

  const now = Date.now();
  const week = isoWeek(now);

  let store;
  try { store = getStore("sakin-usage"); }
  catch (_) { return json(headers, 200, { ok: false, nostore: true }); }

  let data = null;
  try {
    const cached = await store.get("pulse/agg", { type: "json" });
    if (cached && cached.week === week && (now - cached.at) < AGG_TTL_MS) data = cached.data;
  } catch (_) {}
  if (!data) {
    data = await computeAggregate(store, week);
    try { await store.setJSON("pulse/agg", { at: now, week, data }); } catch (_) {}
  }

  return json(headers, 200, { ok: true, ...data });
};
