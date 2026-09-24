// Birinci-taraf ANONIM kullanim olcumu - toplama ucu (ingest).
// ------------------------------------------------------------------------
// Istemci (src/analytics.js) gunde birkac kez olay demeti (batch) yollar.
// Burada her ANONIM kurulum icin tek bir kayit tutulur (Netlify Blobs):
//   u/<anonId> -> { first, last, p, v, lang, prem, days[], m{}, c{} }
//     m = kilometre taslarina ILK ulasma zamani (funnel icin)
//     c = kumulatif sayaclar (nefes, ekran acilislari, oturum)
//     days = benzersiz gun anahtarlari (retention icin, son 60 ile sinirli)
// KISISEL VERI SAKLAMAZ: isim/dogum/sehir/mesaj YOK. Sadece anon id + olaylar.
// Rapor: netlify/functions/report.mjs (token korumali).
//
// ⚠️ FUNCTIONS V2 API (export default, Request/Response) — v1 (export const
// handler) DEĞİL. Kullanıcı canlıda her zaman "blobs acilamadi /
// MissingBlobsEnvironmentError" alıyordu; Netlify'ın kendi personeli forumda
// bunu doğruladı: "Only Functions API v2 automatically get that part
// configured [siteID/token]... In Functions v1, that's currently not
// possible." (answers.netlify.com/t/netlify-blobs-accessing-from-function-
// inside-sveltekit-app-requiring-explicit-token-siteid-deployid/107200)
// v1'de getStore("ad") siteID/token'ı ASLA otomatik bulamıyor, hesap/Netlify
// tarafında düzeltilecek bir şey değildi. v2'ye geçince istemci tarafında HİÇBİR
// ŞEY değişmedi: URL aynı (/.netlify/functions/track), JSON gövde şekli aynı.
import { getStore } from "@netlify/blobs";

const ALLOWED_ORIGINS = ["https://sakin.life", "https://www.sakin.life", "capacitor://localhost", "ionic://localhost", "https://localhost", "http://localhost"];

// Ekran adi -> funnel kategorisi.
const FEATURE_SCREENS = new Set(["nefes", "ses", "chakra", "terapi", "harita", "kesfet", "ailesi", "onb_kesfet", "onb_baglan", "gun", "sabah", "aksam", "rehber", "reiki", "zihinsel"]);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  return ALLOWED_ORIGINS.includes(origin);
}
function cors(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
function json(headers, code, obj) {
  return new Response(JSON.stringify(obj), { status: code, headers: { ...headers, "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

// IP basina siniri (dogrudan API suistimaline karsi). Kurulum basina gunde
// birkac demet normal; cok yuksek hiz reddedilir.
const rateMap = new Map();
const RATE_WINDOW = 60_000;
const RATE_MAX = 30;
function isRateLimited(ip) {
  const now = Date.now();
  const e = rateMap.get(ip);
  if (!e || now - e.start > RATE_WINDOW) { rateMap.set(ip, { start: now, count: 1 }); return false; }
  e.count++;
  return e.count > RATE_MAX;
}
function clientIP(req, context) {
  // v2: context.ip Netlify tarafından resmi olarak sağlanıyor; header okumaya
  // gerek yok. Yine de context yoksa (test ortamı) header'a düş.
  return context?.ip || req.headers.get("x-nf-client-connection-ip") || "unknown";
}

function safeId(id) {
  // anonId'yi guvenli anahtar karakterlerine sinirla (path injection'i onle).
  return /^[A-Za-z0-9_-]{8,64}$/.test(id) ? id : null;
}

// ISO hafta anahtari ("2026-W36"). Kolektif nabiz (Orkestra Modu Faz 1)
// haftalik pencerelerle calisiyor; hafta anahtari SUNUCU saatinden uretiliyor
// (istemci gondermez, saat kaymasi/oynama olmaz). ISO-8601: hafta Pazartesi
// baslar, yilin ilk Persembesini iceren hafta 1. hafta.
export function isoWeek(ts) {
  const d = new Date(ts);
  const day = (d.getUTCDay() + 6) % 7;            // Pazartesi = 0
  d.setUTCDate(d.getUTCDate() - day + 3);          // bu haftanin Persembesi
  const firstThu = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((d - firstThu) / 86400000 - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7);
  return d.getUTCFullYear() + "-W" + String(week).padStart(2, "0");
}

// Bir demeti (batch) mevcut kayda birlestir. Saf fonksiyon (test edilebilir).
export function mergeBatch(rec, body, now) {
  if (!rec) rec = { first: now, last: now, p: "web", v: "", lang: "tr", prem: false, days: [], m: {}, c: {}, tr: {} };
  if (!rec.tr) rec.tr = {};   // eski kayitlarda yok olabilir (gecis alani sonradan eklendi)
  rec.last = now;
  if (body.p) rec.p = String(body.p).slice(0, 12);
  if (body.v) rec.v = String(body.v).slice(0, 16);
  if (body.lang) rec.lang = String(body.lang).slice(0, 8);
  if (typeof body.prem === "boolean") rec.prem = body.prem;

  const day = typeof body.day === "string" ? body.day.slice(0, 10) : null;
  if (day && !rec.days.includes(day)) { rec.days.push(day); if (rec.days.length > 60) rec.days = rec.days.slice(-60); }

  const setMilestone = (name, ts) => { if (!rec.m[name]) rec.m[name] = ts || now; };
  const bump = (name, by) => { rec.c[name] = (rec.c[name] || 0) + (by || 1); };

  // ── KOLEKTIF NABIZ (Orkestra Modu Faz 1) ──────────────────────────────────
  // Haftalik sayaclar kullanicinin KENDI kaydinda tutulur (rec.wc). Boylece
  // ayri bir "haftalik toplam" blob'una her demette yazmak gerekmez: o blob bir
  // yazma sicak noktasi olur, get+set atomik olmadigi icin es zamanli artislar
  // KAYBOLURDU. Burada her kullanici yalnizca kendi kaydini yazar (yaris yok);
  // haftalik toplam OKUMA aninda (pulse.mjs) kullanici listesi taranarak
  // hesaplanir; report.mjs'in kanitlanmis listeleme deseni.
  // Hafta degisince sayac otomatik sifirlanir (yalnizca ICINDE BULUNULAN
  // haftanin verisi tutulur, gecmis hafta birikmez).
  // UC METRIK (kullanici karari, yazili yorum YOK): nefes SAYISI, ses SURESI,
  // cakra SURESI. Niyet kelimesi/cakra secimi HARITASI kaldirildi (bumpMap),
  // gosterilmeyen veri toplanmaz.
  const week = isoWeek(now);
  if (!rec.wc || rec.wc.wk !== week) rec.wc = { wk: week, nefes: 0, freqSec: 0, chakraSec: 0 };

  for (const it of (body.ev || [])) {
    if (!it || typeof it.e !== "string") continue;
    const ts = typeof it.t === "number" ? it.t : now;
    const e = it.e;
    if (e === "app_open") { setMilestone("app_open", ts); bump("sessions"); }
    else if (e === "birth_view") setMilestone("birth_view", ts);
    else if (e === "profile_complete") setMilestone("profile_complete", ts);
    else if (e === "purchase") setMilestone("purchase", ts);
    // ⚠️ Bu üçü istemciden gönderiliyordu ama burada işlenmiyordu (sessizce
    // düşüyordu): tanışmayı kaç kişinin BİTİRDİĞİ ve doğum bilgisini kaç kişinin
    // KAYDETTİĞİ bilinmiyordu (kullanım raporu, Eyl 2026).
    else if (e === "onb_baglan_done") setMilestone("onb_baglan_done", ts);
    else if (e === "onb_kesfet_done") setMilestone("onb_kesfet_done", ts);
    else if (e === "birth_saved") setMilestone("birth_saved", ts);
    else if (e === "notif_open") {
      const k = ["genel", "kisisel", "tarot", "geridon", "diger"].includes(it.k) ? it.k : null;
      if (k) { bump("notif_" + k); setMilestone("notif_open", ts); }
    }
    // Deep link ile açılış (App Store etkinliği vb.): hedef ekran sayılır.
    else if (e === "deeplink_open") {
      const s = ["mandala", "bugun", "nefes", "ses", "chakra"].includes(it.s) ? it.s : null;
      if (s) bump("deeplink_" + s);
    }
    else if (e === "nefes") { setMilestone("nefes_complete", ts); bump("nefes"); rec.wc.nefes++; }
    else if (e === "freq_sec") {
      // Ses/frekans dinleme saniyesi (istemci ton durunca delta gonderir).
      const n = typeof it.n === "number" && it.n > 0 ? Math.min(it.n, 36000) : 0;
      if (n) { bump("freqSec", n); rec.wc.freqSec += n; }
    }
    else if (e === "chakra_sec") {
      // Cakra terapisi suresi (istemci seans/ekran degisince delta gonderir).
      const n = typeof it.n === "number" && it.n > 0 ? Math.min(it.n, 36000) : 0;
      if (n) { bump("chakraSec", n); rec.wc.chakraSec += n; }
    }
    else if (e === "screen") {
      const s = typeof it.s === "string" ? it.s : "";
      if (!s) continue;
      bump("scr_" + s);
      if (s === "giris") setMilestone("giris_view", ts);
      else if (s === "mandala") setMilestone("mandala_view", ts);
      else if (s === "fiyat") setMilestone("paywall_view", ts);
      if (FEATURE_SCREENS.has(s) || s.indexOf("emb_") === 0) setMilestone("feature_any", ts);
    }
    // ── EKRAN SURESI + GECIS (kullanici istegi: "ne kadar sure kaldilar,
    // nereye gectiler"). Istemci her ekran degisiminde ONCEKI ekranda kac
    // saniye kaldigini ve hangi ekrana gectigini gonderir (bkz. App.jsx
    // effectiveScreen/screenTimeRef). "to" bilinmiyorsa (sekme arka plana
    // atildi/kapandi) null gelir: sure sayilir, gecis SAYILMAZ.
    // ── SEÇİM SAYAÇLARI (Eyl 2026) ─────────────────────────────────────────
    // Yalnızca BEYAZ LİSTEDEKİ değerler sayılır: istemci serbest metin yazıp
    // rec.c'yi şişiremesin (anahtar sayısı sabit ve küçük kalır).
    else if (e === "fork_shown") bump("fork_shown");
    else if (e === "fork_pick") {
      const path = it.path === "baglan" || it.path === "kesfet" ? it.path : null;
      if (path) { bump("fork_" + path); if (it.untried == 1) bump("fork_untried_" + path); }
    }
    // Ayarlar > Bildirimler tercihi (kullanıcının SON seçimi önemli: sayaçlar
    // kişi başına "şu ayarla kaydetti" sinyali, rapor kişi sayısı olarak okur).
    else if (e === "notif_pref") {
      const c = it.c === 1 || it.c === 2 || it.c === 3 ? it.c : null;
      if (c) { rec.np = { c, off: [] }; }
      const offs = typeof it.off === "string" ? it.off.split(",") : [];
      const OK = ["kisisel", "aksam", "tarot", "hatirlatici", "ogle", "kozmik", "geridon"];
      if (rec.np) rec.np.off = offs.filter((k) => OK.includes(k));
    }
    else if (e === "bugun_gate") {
      const a = it.a === "shown" || it.a === "enter" || it.a === "skip" ? it.a : null;
      if (a) bump("bgate_" + a);
    }
    // ⚠️ Ayna "iyi geldi mi?" oyu istemciden Eyl 2026'dan beri gönderiliyordu ama
    // burada HİÇ işlenmiyordu, yani oylar kayboluyordu. Artık sayılıyor.
    else if (e === "ayna_feedback") {
      const v = it.v === "up" || it.v === "down" ? it.v : null;
      const tip = typeof it.tip === "string" && /^[a-z]{2,14}$/.test(it.tip) ? it.tip : "genel";
      if (v) { bump("ayna_" + v); bump("aynat_" + tip + "_" + v); }
    }
    else if (e === "screen_time") {
      const from = typeof it.from === "string" ? it.from.slice(0, 24) : "";
      const to = typeof it.to === "string" ? it.to.slice(0, 24) : null;
      // Ust sinir 6 saat: uyuyan/arka planda unutulmus sekme gercekci olmayan
      // dev bir sure gondermesin (ortalamayi bozar).
      const sec = typeof it.sec === "number" && it.sec > 0 ? Math.min(Math.round(it.sec), 21600) : 0;
      if (from && sec) {
        bump("t_" + from, sec);   // toplam saniye (lifetime), ortalama icin
        bump("tn_" + from, 1);    // bu ekrandan KAC KEZ cikildi (bolen)
        // SURE DAGILIMI (ortanca icin): ortalama tek bir uzun oturumla sisiyor.
        // Kovalar: <10sn, <30sn, <1dk, <3dk, <10dk, 10dk+.
        const b = sec < 10 ? 0 : sec < 30 ? 1 : sec < 60 ? 2 : sec < 180 ? 3 : sec < 600 ? 4 : 5;
        bump("h_" + from + "_" + b, 1);
        if (to) {
          const key = from + ">" + to;
          // Harita 60'tan az anahtarla sinirli: gercekci ekran sayisi (~20)
          // ile bu asilmaz, yalnizca bozuk/istismar girdisine karsi tavan.
          if (rec.tr[key] !== undefined || Object.keys(rec.tr).length < 60) {
            rec.tr[key] = (rec.tr[key] || 0) + 1;
          }
        }
      }
    }
  }
  return rec;
}

export default async (req, context) => {
  const origin = req.headers.get("origin") || "";
  const originOk = isAllowedOrigin(origin);
  const headers = (originOk && origin) ? cors(origin) : {};
  if (req.method === "OPTIONS") {
    if (!originOk) return new Response("", { status: 403 });
    return new Response(null, { status: 204, headers });
  }
  if (!originOk) return json(headers, 403, { error: "origin" });
  if (req.method !== "POST") return json(headers, 405, { error: "method" });
  if (isRateLimited(clientIP(req, context))) return json(headers, 200, { ok: false, throttled: true });

  let body;
  try { body = await req.json(); } catch (_) { return json(headers, 200, { ok: false }); }
  const id = safeId(body.id);
  if (!id || !Array.isArray(body.ev) || !body.ev.length) return json(headers, 200, { ok: false });

  let store;
  try { store = getStore("sakin-usage"); }
  catch (_) { return json(headers, 200, { ok: false, nostore: true }); } // Blobs yoksa sessizce gec

  const key = "u/" + id;
  let rec;
  try { rec = (await store.get(key, { type: "json" })) || null; } catch (_) { rec = null; }
  rec = mergeBatch(rec, body, Date.now());

  try { await store.setJSON(key, rec); } catch (_) { return json(headers, 200, { ok: false }); }
  return json(headers, 200, { ok: true });
};
