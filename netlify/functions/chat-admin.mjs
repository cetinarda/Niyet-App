// ÇEMBER MODERASYON PANELİ (Apple 1.2: bildirilen içeriğe 24 saat içinde müdahale).
// Aç: https://sakin.life/.netlify/functions/chat-admin?token=PUSH_ADMIN_TOKEN
// (anlık bildirim paneliyle AYNI şifre). Bildirilen/gizlenen mesajlar üstte;
// her satırda Gizle / Göster / Cihazı banla. Ban: cihazın son 24 saatteki tüm
// mesajları gizlenir ve bir daha yazamaz. Ban listesi altta, kaldırılabilir.
import { timingSafeEqual } from "node:crypto";
import { chatConfig, rest, broadcast, HISTORY_HOURS } from "./_chat.mjs";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function tokenOk(given) {
  const want = process.env.PUSH_ADMIN_TOKEN || "";
  if (!want || !given) return false;
  const a = Buffer.from(String(given)), b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}
const page = (body, code = 200) => new Response(`<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Sakin · Çember moderasyon</title>
<style>:root{color-scheme:dark}body{margin:0;background:#0b0918;color:#e8e2f5;font:15px/1.5 -apple-system,system-ui,Segoe UI,Roboto,sans-serif}
main{max-width:760px;margin:0 auto;padding:24px 14px 60px}h1{font-weight:300;letter-spacing:2px;font-size:21px;margin:0 0 4px}h2{font-size:12.5px;letter-spacing:2px;text-transform:uppercase;color:#b8a4d8;margin:26px 0 10px;font-weight:500}
.m{background:rgba(255,255,255,.035);border:1px solid rgba(184,164,216,.18);border-radius:12px;padding:12px 14px;margin-bottom:8px}.m.rep{border-color:rgba(255,143,143,.45)}.m.hid{opacity:.55}
.meta{font-size:12px;color:#9a90b5;margin-bottom:4px}.body{white-space:pre-wrap;overflow-wrap:anywhere}.muted{color:#9a90b5;font-size:13px}
form{display:inline}button{appearance:none;border-radius:100px;padding:6px 12px;font:inherit;font-size:12.5px;cursor:pointer;border:1px solid rgba(232,192,122,.5);background:rgba(232,192,122,.1);color:#f6dfb0;margin:6px 6px 0 0}
button.bad{border-color:rgba(255,143,143,.55);background:rgba(255,143,143,.1);color:#ffb3b3}.ok{color:#8fd9a8}</style></head><body><main>${body}</main></body></html>`,
  { status: code, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });

const btn = (token, action, id, label, cls = "") =>
  `<form method="post"><input type="hidden" name="token" value="${esc(token)}"><input type="hidden" name="action" value="${action}"><input type="hidden" name="id" value="${esc(id)}"><button class="${cls}" ${action === "ban" ? "onclick=\"return confirm('Bu cihaz banlansın mı?')\"" : ""}>${label}</button></form>`;

export default async (req) => {
  if (!process.env.PUSH_ADMIN_TOKEN) return page(`<h1>Panel kapalı</h1><p class="muted">PUSH_ADMIN_TOKEN tanımlı değil.</p>`, 503);
  const url = new URL(req.url);
  let form = null;
  if (req.method === "POST") { try { form = await req.formData(); } catch { form = null; } }
  const token = form ? form.get("token") : url.searchParams.get("token");
  if (!tokenOk(token)) return page(`<h1>Yetkisiz</h1>`, 401);
  const cfg = chatConfig();
  if (!cfg.ok) return page(`<h1>Çember kapalı</h1><p class="muted">SUPABASE_URL, SUPABASE_ANON_KEY ve SUPABASE_SERVICE_KEY tanımlı olmalı.</p>`, 503);

  let notice = "";
  if (form) {
    const action = form.get("action"), id = String(form.get("id") || "");
    if (action === "hide" || action === "show") {
      const r = await rest(cfg, `chat_messages?id=eq.${Number(id)}&select=id,room`, { method: "PATCH", prefer: "return=representation", body: { hidden: action === "hide" } });
      const row = r.ok && Array.isArray(r.data) ? r.data[0] : null;
      if (row && action === "hide") await broadcast(cfg, `room:${row.room}`, "hide", { id: row.id });
      notice = row ? (action === "hide" ? "Mesaj gizlendi." : "Mesaj yeniden görünür.") : "İşlem başarısız.";
    } else if (action === "ban") {
      const m = await rest(cfg, `chat_messages?select=device_hash&id=eq.${Number(id)}&limit=1`);
      const h = m.ok && Array.isArray(m.data) && m.data[0] ? m.data[0].device_hash : null;
      if (h) {
        await rest(cfg, "chat_bans", { method: "POST", prefer: "resolution=ignore-duplicates", body: { device_hash: h, reason: "panel" } });
        const since = new Date(Date.now() - HISTORY_HOURS * 3600e3).toISOString();
        const hid = await rest(cfg, `chat_messages?device_hash=eq.${h}&created_at=gte.${encodeURIComponent(since)}&select=id,room`, { method: "PATCH", prefer: "return=representation", body: { hidden: true } });
        for (const row of (hid.ok && Array.isArray(hid.data) ? hid.data : [])) await broadcast(cfg, `room:${row.room}`, "hide", { id: row.id });
        notice = "Cihaz banlandı, son 24 saatteki mesajları gizlendi.";
      } else notice = "Mesaj bulunamadı.";
    } else if (action === "unban") {
      await rest(cfg, `chat_bans?device_hash=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
      notice = "Ban kaldırıldı.";
    }
  }

  const since = new Date(Date.now() - HISTORY_HOURS * 3600e3).toISOString();
  const r = await rest(cfg, `chat_messages?select=id,room,nick,body,created_at,reports,hidden&created_at=gte.${encodeURIComponent(since)}&order=created_at.desc&limit=150`);
  const msgs = r.ok && Array.isArray(r.data) ? r.data : [];
  const flagged = msgs.filter((m) => m.reports > 0 || m.hidden);
  const bans = await rest(cfg, "chat_bans?select=device_hash,reason,created_at&order=created_at.desc&limit=50");
  const fmt = (t) => new Date(t).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
  const row = (m) => `<div class="m ${m.reports > 0 ? "rep" : ""} ${m.hidden ? "hid" : ""}">
    <div class="meta">${m.room === "tr" ? "Türkçe" : "Global"} · ${esc(m.nick)} · ${esc(fmt(m.created_at))}${m.reports ? ` · <b style="color:#ffb3b3">${m.reports} bildirim</b>` : ""}${m.hidden ? " · gizli" : ""}</div>
    <div class="body">${esc(m.body)}</div>
    ${m.hidden ? btn(token, "show", m.id, "Göster") : btn(token, "hide", m.id, "Gizle")}${btn(token, "ban", m.id, "Cihazı banla", "bad")}</div>`;
  return page(`<h1>Çember · moderasyon</h1><div class="muted">Son 24 saat: ${msgs.length} mesaj · ${flagged.length} bildirilen/gizli</div>
${notice ? `<p class="ok">${esc(notice)}</p>` : ""}
<h2>Bildirilen ve gizlenen</h2>${flagged.map(row).join("") || `<p class="muted">Yok.</p>`}
<h2>Son mesajlar</h2>${msgs.filter((m) => !m.reports && !m.hidden).slice(0, 80).map(row).join("") || `<p class="muted">Henüz mesaj yok.</p>`}
<h2>Banlı cihazlar</h2>${(bans.ok && Array.isArray(bans.data) ? bans.data : []).map((x) => `<div class="m"><div class="meta">${esc(x.device_hash)} · ${esc(fmt(x.created_at))}</div>${btn(token, "unban", x.device_hash, "Banı kaldır")}</div>`).join("") || `<p class="muted">Yok.</p>`}`);
};
