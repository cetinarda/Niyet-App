// SAKİN ODALAR YÖNETİM PANELİ (1.4.3, kullanıcı: "Kozmik Gemi'nin panel ve admin
// sistemini kopyala, Sakin'in ruhuna uyarla")
// ---------------------------------------------------------------------------
// Aç:  https://sakin.life/.netlify/functions/rooms-admin?token=PUSH_ADMIN_TOKEN
// Kozmik Gemi yönetimi GitHub'a JSON yazıyordu; burada Netlify Blobs (`sakin-rooms`,
// anahtar "data") kullanılır, anında yayında olur, repo değişmez. İki sekme:
//  - Buluşmalar: oda, başlık, yer, tarih-saat (İstanbul saati), rehber, bağlantı,
//    hedef dil. Geçmiş buluşmalar uygulamada kendiliğinden gizlenir.
//  - Rehberler: oda, ad, unvan, iletişim (telefon ya da adres), şehir, bağlantı.
// PUSH_ADMIN_TOKEN tanımlı değilse panel KAPALI. Uygulama rooms.mjs'ten okur.
import { getStore } from "@netlify/blobs";
import { timingSafeEqual } from "node:crypto";

const LANGS = ["tr", "en", "de", "es", "pt", "fr", "ja"];
const ROOMS = [["reiki", "Reiki Odası"], ["kundalini", "Kundalini Yoga"], ["ses", "Ses Şifası"], ["su", "Su Terapisi"],
  ["atolye", "Atölyeler"], ["yaratim", "Yaratım Alanı"], ["tantra", "Tantra"], ["beden", "Beden Egzersizleri"], ["cember", "Çember (canlı oda)"]];
const ROOM_NAME = Object.fromEntries(ROOMS);

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function tokenOk(given) {
  const want = process.env.PUSH_ADMIN_TOKEN || "";
  if (!want || !given) return false;
  const a = Buffer.from(String(given)), b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}
const clip = (v, n) => String(v || "").trim().slice(0, n);
const safeLink = (v) => { const s = clip(v, 300); return /^https?:\/\//i.test(s) ? s : ""; };

const html = (body, code = 200) => new Response(`<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Sakin · Odalar yönetimi</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Jost:wght@300;400;500&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<style>
:root{color-scheme:dark}body{margin:0;background:radial-gradient(ellipse 90% 50% at 50% 0%,rgba(90,60,150,.22),transparent 70%),#07060d;color:#e8e2f5;font:15px/1.55 Inter,-apple-system,system-ui,sans-serif}
main{max-width:820px;margin:0 auto;padding:28px 16px 60px}h1{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:30px;margin:0}
.sub{font-family:Jost;letter-spacing:3px;text-transform:uppercase;font-size:11px;color:#b8a4d8;margin:2px 0 6px}.motto{font-family:'Cormorant Garamond',serif;font-style:italic;color:#c9bde0;margin:6px 0 18px}
h2{font-family:Jost;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#e8c07a;margin:26px 0 10px;font-weight:500}
.card{background:rgba(255,255,255,.035);border:1px solid rgba(184,164,216,.18);border-radius:16px;padding:16px}.muted{color:#9a90b5;font-size:13px}
label{display:block;font-family:Jost;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#b8aed0;margin:12px 0 6px}
input,select,textarea{width:100%;box-sizing:border-box;background:#150f2c;color:#f1ecf9;border:1px solid rgba(184,164,216,.3);border-radius:10px;padding:10px 12px;font:inherit}
.row{display:flex;gap:12px}.row>div{flex:1;min-width:0}@media(max-width:560px){.row{flex-direction:column;gap:0}}
button{appearance:none;border-radius:100px;padding:10px 18px;font:inherit;font-family:Jost;letter-spacing:1px;cursor:pointer;border:1px solid rgba(232,192,122,.5);background:#e8c07a;color:#1a1030;font-weight:500;margin-top:14px}
button.del{background:rgba(255,90,120,.1);color:#ff9eb3;border-color:rgba(255,90,120,.4);padding:6px 12px;margin:0}
.item{display:flex;gap:12px;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.06)}.item:last-child{border-bottom:none}
.tabs{display:flex;gap:8px;margin:10px 0 4px}.tabs a{padding:8px 14px;border-radius:100px;border:1px solid rgba(184,164,216,.25);color:#cfc7e0;text-decoration:none;font-family:Jost;font-size:13px;letter-spacing:1px}.tabs a.on{background:rgba(232,192,122,.14);border-color:rgba(232,192,122,.5);color:#f6dfb0}
.ok{color:#8fd9a8}.bad{color:#ff8f8f}
</style></head><body><main>${body}</main></body></html>`, { status: code, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });

const roomSelect = (name, withCember) => `<select name="${name}">${ROOMS.filter(([v]) => withCember || v !== "cember").map(([v, n]) => `<option value="${v}">${esc(n)}</option>`).join("")}</select>`;
const langSelect = `<select name="lang"><option value="">Tüm diller</option>${LANGS.map((l) => `<option value="${l}"${l === "tr" ? " selected" : ""}>${l}</option>`).join("")}</select>`;
const fmt = (iso) => { try { return new Date(iso).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", dateStyle: "medium", timeStyle: "short" }); } catch { return iso; } };

function panel(token, data, tab, notice = "") {
  const t = esc(token);
  const events = (data.events || []).slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  const guides = data.guides || [];
  const del = (kind, id) => `<form method="post" style="margin:0" onsubmit="return confirm('Silinsin mi?')"><input type="hidden" name="token" value="${t}"><input type="hidden" name="tab" value="${tab}"><input type="hidden" name="action" value="del${kind}"><input type="hidden" name="id" value="${esc(id)}"><button class="del">Sil</button></form>`;
  const tabs = `<div class="tabs"><a href="?token=${t}&tab=events" class="${tab === "events" ? "on" : ""}">Buluşmalar</a><a href="?token=${t}&tab=guides" class="${tab === "guides" ? "on" : ""}">Rehberler</a></div>`;
  const evPanel = `
<h2>Yeni buluşma</h2><form class="card" method="post"><input type="hidden" name="token" value="${t}"><input type="hidden" name="tab" value="events"><input type="hidden" name="action" value="addevent">
<div class="row"><div><label>Oda</label>${roomSelect("room", true)}</div><div><label>Hedef dil</label>${langSelect}</div></div>
<label>Başlık</label><input name="title" maxlength="80" required placeholder="Dolunay gong buluşması">
<div class="row"><div><label>Tarih ve saat (İstanbul)</label><input type="datetime-local" name="date" required></div><div><label>Yer</label><input name="where" maxlength="80" placeholder="İstanbul · Kuzguncuk ya da Çember · Canlı oda"></div></div>
<div class="row"><div><label>Rehber (isteğe bağlı)</label><input name="teacher" maxlength="60"></div><div><label>Bağlantı (isteğe bağlı, https://)</label><input name="link" maxlength="300" placeholder="https://..."></div></div>
<div class="muted" style="margin-top:8px">Oda "Çember" seçilirse uygulamada dokununca canlı oda açılır. Geçmiş buluşmalar uygulamada kendiliğinden gizlenir.</div>
<button>Buluşmayı ekle</button></form>
<h2>Planlanan buluşmalar</h2><div class="card">${events.map((e) => `<div class="item"><div><b>${esc(e.title)}</b><div class="muted">${esc(fmt(e.date))} · ${esc(ROOM_NAME[e.room] || e.room)}${e.where ? " · " + esc(e.where) : ""}${e.teacher ? " · " + esc(e.teacher) : ""}${e.lang ? " · " + esc(e.lang) : ""}</div></div>${del("event", e.id)}</div>`).join("") || `<div class="muted">Henüz yok.</div>`}</div>`;
  const gPanel = `
<h2>Yeni rehber</h2><form class="card" method="post"><input type="hidden" name="token" value="${t}"><input type="hidden" name="tab" value="guides"><input type="hidden" name="action" value="addguide">
<div class="row"><div><label>Oda</label>${roomSelect("room", false)}</div><div><label>Hedef dil</label>${langSelect}</div></div>
<div class="row"><div><label>Ad</label><input name="name" maxlength="60" required></div><div><label>Unvan / uzmanlık</label><input name="role" maxlength="80" placeholder="Usui Reiki Master"></div></div>
<div class="row"><div><label>İletişim (telefon)</label><input name="contact" maxlength="40" placeholder="+90 5xx xxx xx xx"></div><div><label>Şehir / semt</label><input name="city" maxlength="80"></div></div>
<label>Bağlantı (isteğe bağlı: site, Instagram, https://)</label><input name="link" maxlength="300">
<div class="muted" style="margin-top:8px">Yalnızca iznini aldığın rehberleri ekle; bilgiler uygulamada herkese görünür.</div>
<button>Rehberi ekle</button></form>
<h2>Rehberler</h2><div class="card">${guides.map((g) => `<div class="item"><div><b>${esc(g.name)}</b> <span class="muted">${esc(g.role || "")}</span><div class="muted">${esc(ROOM_NAME[g.room] || g.room)}${g.city ? " · " + esc(g.city) : ""}${g.contact ? " · " + esc(g.contact) : ""}${g.lang ? " · " + esc(g.lang) : ""}</div></div>${del("guide", g.id)}</div>`).join("") || `<div class="muted">Henüz yok.</div>`}</div>`;
  return `<h1>Sakin Odalar</h1><div class="sub">Yönetim · Orkestra</div><div class="motto">"Evren bir orkestradır. Senin sessizliğin bile bir nota."</div>${notice}${tabs}${tab === "guides" ? gPanel : evPanel}`;
}

export default async (req) => {
  if (!process.env.PUSH_ADMIN_TOKEN) return html(`<h1>Panel kapalı</h1><p class="muted">Netlify'de PUSH_ADMIN_TOKEN tanımlı değil.</p>`, 503);
  const url = new URL(req.url);
  let form = null;
  if (req.method === "POST") { try { form = await req.formData(); } catch { form = null; } }
  const token = form ? form.get("token") : url.searchParams.get("token");
  if (!tokenOk(token)) return html(`<h1>Yetkisiz</h1>`, 401);
  const tab = ((form ? form.get("tab") : url.searchParams.get("tab")) === "guides") ? "guides" : "events";

  let store;
  try { store = getStore("sakin-rooms"); } catch { return html(`<h1>Depo açılamadı</h1>`, 500); }
  let data = {};
  try { data = (await store.get("data", { type: "json" })) || {}; } catch { data = {}; }
  data.events = Array.isArray(data.events) ? data.events : [];
  data.guides = Array.isArray(data.guides) ? data.guides : [];
  if (!form) return html(panel(token, data, tab));

  const action = String(form.get("action") || "");
  const room = ROOMS.some(([v]) => v === form.get("room")) ? form.get("room") : "";
  const lang = LANGS.includes(form.get("lang")) ? form.get("lang") : "";
  let notice = "";
  if (action === "addevent") {
    const title = clip(form.get("title"), 80);
    const local = clip(form.get("date"), 20);           // "2026-10-01T21:00"
    const date = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local) ? new Date(local + ":00+03:00").toISOString() : "";
    if (!room || !title || !date) notice = `<p class="bad">Oda, başlık ve tarih gerekli.</p>`;
    else {
      data.events.push({ id: "e" + Date.now().toString(36), room, title, date, lang,
        where: clip(form.get("where"), 80), teacher: clip(form.get("teacher"), 60), link: safeLink(form.get("link")) });
      notice = `<p class="ok">Buluşma eklendi.</p>`;
    }
  } else if (action === "addguide") {
    const name = clip(form.get("name"), 60);
    if (!room || room === "cember" || !name) notice = `<p class="bad">Oda ve ad gerekli.</p>`;
    else {
      data.guides.push({ id: "g" + Date.now().toString(36), room, name, lang,
        role: clip(form.get("role"), 80), contact: clip(form.get("contact"), 40).replace(/[^\d+ ()-]/g, ""), city: clip(form.get("city"), 80), link: safeLink(form.get("link")) });
      notice = `<p class="ok">Rehber eklendi.</p>`;
    }
  } else if (action === "delevent" || action === "delguide") {
    const id = String(form.get("id") || "");
    const k = action === "delevent" ? "events" : "guides";
    data[k] = data[k].filter((x) => x.id !== id);
    notice = `<p class="ok">Silindi.</p>`;
  }
  // Çok eski buluşmaları temizle (30 günden eski).
  const cut = Date.now() - 30 * 86400e3;
  data.events = data.events.filter((e) => new Date(e.date).getTime() > cut).slice(-200);
  data.guides = data.guides.slice(-200);
  try { await store.setJSON("data", data); } catch { notice = `<p class="bad">Kaydedilemedi (Blobs).</p>`; }
  return html(panel(token, data, tab, notice));
};
