// Birinci-taraf, ANONIM kullanim olcumu (funnel / drop-off raporlamasi icin).
// ------------------------------------------------------------------------
// NE GONDERIR: rastgele bir kurulum kimligi (sakin_anon_id) + olay adlari +
// sayaclar + platform/dil/surum. Reklam kimligi/IDFA YOK.
// NE GONDERMEZ: isim, dogum tarihi/saati, sehir, e-posta, mesaj icerigi, hicbir
// kisisel veri. Yalnizca "hangi anonim kurulum hangi adima ulasti / kac nefes"
// bilgisi. Uygulamanin gizlilik durusuyla (IDFA kapali) tutarli.
// KAPATMA: kullanici `sakin_analytics_off` = "1" yazarsa (Ayarlar'daki toggle)
// hicbir sey gonderilmez. Sunucu: netlify/functions/track.mjs.
// FAIL-SAFE: her sey try/catch; ag hatasi UI'yi asla bozmaz.

const LS_ID = "sakin_anon_id";
const LS_OFF = "sakin_analytics_off";

let CTX = { platform: "web", ver: "" };
let ENDPOINT = "/.netlify/functions/track";
let QUEUE = [];
let flushTimer = null;

function uuid() {
  try { if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID(); } catch (_) {}
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getAnonId() {
  try {
    let id = localStorage.getItem(LS_ID);
    if (!id) { id = uuid(); localStorage.setItem(LS_ID, id); }
    return id;
  } catch (_) { return null; }
}

function enabled() {
  try { return localStorage.getItem(LS_OFF) !== "1"; } catch (_) { return true; }
}

function dayKey() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

export function initAnalytics(opts) {
  opts = opts || {};
  CTX.platform = opts.platform || "web";
  CTX.ver = opts.ver || "";
  if (opts.base != null) ENDPOINT = opts.base + "/.netlify/functions/track";
  if (!enabled()) return;
  getAnonId();
  try {
    window.addEventListener("pagehide", () => flush(true));
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush(true);
    });
  } catch (_) {}
}

// event: kisa olay adi ( or. "app_open", "screen", "nefes"). props: kucuk sayisal/
// string alanlar (or. { s:"nefes" } ekran adi). Kisisel veri GECIRME.
export function track(event, props) {
  if (!enabled() || !event) return;
  try {
    const item = { e: String(event), t: Date.now() };
    if (props && typeof props === "object") {
      for (const k in props) {
        const v = props[k];
        if (v == null) continue;
        item[k] = typeof v === "number" ? v : String(v).slice(0, 40);
      }
    }
    QUEUE.push(item);
    if (QUEUE.length >= 12) flush();
    else scheduleFlush();
  } catch (_) {}
}

function scheduleFlush() {
  if (flushTimer) return;
  try { flushTimer = setTimeout(() => { flushTimer = null; flush(); }, 4000); } catch (_) {}
}

function flush(useBeacon) {
  if (!QUEUE.length || !enabled()) return;
  const batch = QUEUE.splice(0, QUEUE.length);
  let lang = "tr", prem = false;
  try { lang = localStorage.getItem("sakin_lang") || "tr"; } catch (_) {}
  try { prem = localStorage.getItem("sakin_premium") === "1"; } catch (_) {}
  const payload = {
    id: getAnonId(),
    p: CTX.platform,
    v: CTX.ver,
    lang: lang,
    prem: prem,
    day: dayKey(),
    ev: batch,
  };
  try {
    const body = JSON.stringify(payload);
    // Arka plana gecerken beacon ile guvenilir gonderim (text/plain -> preflight yok).
    if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
      try {
        const blob = new Blob([body], { type: "text/plain" });
        if (navigator.sendBeacon(ENDPOINT, blob)) return;
      } catch (_) {}
    }
    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
      keepalive: true,
    }).catch(() => {});
  } catch (_) {}
}
