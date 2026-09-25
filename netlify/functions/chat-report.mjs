// ÇEMBER: mesaj bildirme (Apple 1.2 / Play UGC: bildirme mekanizması ZORUNLU).
// Bir cihaz bir mesajı bir kez bildirir; HIDE_AFTER_REPORTS farklı cihaz
// bildirince mesaj gizlenir ve odadaki herkesin ekranından kalkar ("hide").
import { chatConfig, corsFor, json, rest, broadcast, deviceHash, validDeviceId, HIDE_AFTER_REPORTS, ipLimited } from "./_chat.mjs";

export default async (req, context) => {
  const { ok: originOk, headers } = corsFor(req);
  if (req.method === "OPTIONS") return new Response(null, { status: originOk ? 204 : 403, headers });
  if (!originOk) return json(headers, 403, { ok: false });
  if (req.method !== "POST") return json(headers, 405, { ok: false });
  const cfg = chatConfig();
  if (!cfg.ok) return json(headers, 200, { ok: false, reason: "closed" });
  const ip = (context && context.ip) || req.headers.get("x-nf-client-connection-ip") || "?";
  if (ipLimited(ip, 20)) return json(headers, 429, { ok: false });
  let b;
  try { b = await req.json(); } catch { return json(headers, 400, { ok: false }); }
  const mid = Number(b && b.messageId);
  if (!validDeviceId(b && b.id) || !Number.isInteger(mid) || mid <= 0) return json(headers, 400, { ok: false });
  const h = deviceHash(b.id);
  const m = await rest(cfg, `chat_messages?select=id,room,device_hash,hidden&id=eq.${mid}&limit=1`);
  const msg = m.ok && Array.isArray(m.data) ? m.data[0] : null;
  if (!msg) return json(headers, 200, { ok: false });
  if (msg.device_hash === h) return json(headers, 200, { ok: true });   // kendi mesajını bildiremez
  await rest(cfg, "chat_reports", { method: "POST", prefer: "resolution=ignore-duplicates",
    body: { message_id: mid, device_hash: h } });
  const c = await rest(cfg, `chat_reports?select=device_hash&message_id=eq.${mid}`);
  const count = c.ok && Array.isArray(c.data) ? c.data.length : 1;
  const hide = count >= HIDE_AFTER_REPORTS;
  await rest(cfg, `chat_messages?id=eq.${mid}`, { method: "PATCH", body: { reports: count, ...(hide ? { hidden: true } : {}) } });
  if (hide && !msg.hidden) await broadcast(cfg, `room:${msg.room}`, "hide", { id: mid });
  return json(headers, 200, { ok: true, hidden: hide });
};
