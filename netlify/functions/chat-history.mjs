// ÇEMBER: odanın son 24 saati (gizlenmemiş, en fazla 80 mesaj). Cihaz özeti
// DIŞARI VERİLMEZ; yalnızca takma ad, metin, zaman ve takma ad rengi (element).
import { chatConfig, corsFor, json, rest, ROOMS, HISTORY_HOURS, elementIndex, authorTag } from "./_chat.mjs";

export default async (req) => {
  const { ok: originOk, headers } = corsFor(req);
  if (req.method === "OPTIONS") return new Response(null, { status: originOk ? 204 : 403, headers });
  if (!originOk) return json(headers, 403, { ok: false });
  const cfg = chatConfig();
  if (!cfg.ok) return json(headers, 200, { ok: false, reason: "closed" });
  const room = new URL(req.url).searchParams.get("room");
  if (!ROOMS.includes(room)) return json(headers, 400, { ok: false });
  const since = new Date(Date.now() - HISTORY_HOURS * 3600e3).toISOString();
  const r = await rest(cfg, `chat_messages?select=id,nick,body,created_at,device_hash&room=eq.${room}&hidden=is.false&created_at=gte.${encodeURIComponent(since)}&order=created_at.desc&limit=80`);
  if (!r.ok || !Array.isArray(r.data)) return json(headers, 200, { ok: false, reason: "db" });
  const msgs = r.data.reverse().map((m) => ({ id: m.id, nick: m.nick, body: m.body, t: m.created_at, el: elementIndex(m.device_hash), a: authorTag(m.device_hash) }));
  return json(headers, 200, { ok: true, msgs });
};
