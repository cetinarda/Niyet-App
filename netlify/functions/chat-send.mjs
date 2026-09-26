// ÇEMBER: mesaj gönderme. Mesaj DOĞRUDAN veritabanına yazılmaz; burada sırayla
// denetlenir: env, girdi, ban, bağlantı yasağı, kriz ifadesi, yavaş mod, yerel
// küfür filtresi, AI moderasyonu. Geçerse kaydedilir ve Realtime ile odaya basılır.
// Red nedenleri (istemci 7 dilde karşılık gösterir): closed, bad, banned, link,
// crisis, slow, abuse, spam, db.
// ⚠️ KRİZ: mesaj odaya DÜŞMEZ; istemci yazana ÖZEL destek mesajı gösterir.
import { chatConfig, corsFor, json, rest, broadcast, ROOMS, MAX_LEN, SLOW_MS, deviceHash, validDeviceId,
  nickFor, elementIndex, authorTag, hasLink, looksCrisis, looksProfane, aiModerate, ipLimited } from "./_chat.mjs";

export default async (req, context) => {
  const { ok: originOk, headers } = corsFor(req);
  if (req.method === "OPTIONS") return new Response(null, { status: originOk ? 204 : 403, headers });
  if (!originOk) return json(headers, 403, { ok: false });
  if (req.method !== "POST") return json(headers, 405, { ok: false });
  const cfg = chatConfig();
  if (!cfg.ok) return json(headers, 200, { ok: false, reason: "closed" });
  const ip = (context && context.ip) || req.headers.get("x-nf-client-connection-ip") || "?";
  if (ipLimited(ip)) return json(headers, 429, { ok: false, reason: "slow", waitMs: 30000 });

  let b;
  try { b = await req.json(); } catch { return json(headers, 400, { ok: false, reason: "bad" }); }
  const room = ROOMS.includes(b && b.room) ? b.room : null;
  const text = typeof (b && b.body) === "string" ? b.body.replace(/\s+/g, " ").trim() : "";
  if (!room || !validDeviceId(b.id) || !text || text.length > MAX_LEN) return json(headers, 400, { ok: false, reason: "bad" });
  const h = deviceHash(b.id);

  const ban = await rest(cfg, `chat_bans?select=device_hash&device_hash=eq.${h}&limit=1`);
  if (ban.ok && Array.isArray(ban.data) && ban.data.length) return json(headers, 200, { ok: false, reason: "banned" });
  if (hasLink(text)) return json(headers, 200, { ok: false, reason: "link" });
  if (looksCrisis(text)) return json(headers, 200, { ok: false, reason: "crisis" });

  const last = await rest(cfg, `chat_messages?select=created_at&device_hash=eq.${h}&order=created_at.desc&limit=1`);
  if (last.ok && Array.isArray(last.data) && last.data[0]) {
    const since = Date.now() - new Date(last.data[0].created_at).getTime();
    if (since < SLOW_MS) return json(headers, 200, { ok: false, reason: "slow", waitMs: SLOW_MS - since });
  }
  if (looksProfane(text)) return json(headers, 200, { ok: false, reason: "abuse" });
  // Moderasyon çağrısı IP başına dakikada en çok 8 (kimlik değiştirerek yavaş modu
  // atlayıp AI'ı art arda çağırmaya karşı).
  if (ipLimited(ip, 8, "mod")) return json(headers, 200, { ok: false, reason: "slow", waitMs: 30000 });
  const verdict = await aiModerate(text);            // null = AI yok/düştü: yerel filtre yeterli sayılır
  if (verdict === "CRISIS") return json(headers, 200, { ok: false, reason: "crisis" });
  if (verdict === "ABUSE" || verdict === "SEXUAL") return json(headers, 200, { ok: false, reason: "abuse" });
  if (verdict === "SPAM") return json(headers, 200, { ok: false, reason: "spam" });

  // `letter`: yazanın mühürlü Niyet Mektubu var mı (istemci söyler, yalnızca
  // takma adın yanındaki küçük sandık ikonu için). Sütun henüz eklenmemişse
  // (cember.sql sonundaki ALTER) ekleme sütunsuz tekrar denenir, sohbet durmaz.
  const letter = b.letter === true;
  const base = { room, nick: nickFor(h, room), body: text, device_hash: h };
  let ins = await rest(cfg, "chat_messages", { method: "POST", prefer: "return=representation", body: { ...base, letter } });
  if (!ins.ok && ins.status === 400) ins = await rest(cfg, "chat_messages", { method: "POST", prefer: "return=representation", body: base });
  const row = ins.ok && Array.isArray(ins.data) ? ins.data[0] : null;
  if (!row) return json(headers, 200, { ok: false, reason: "db" });
  const msg = { id: row.id, nick: row.nick, body: row.body, t: row.created_at, el: elementIndex(h), a: authorTag(h), l: row.letter === true ? 1 : 0 };
  await broadcast(cfg, `room:${room}`, "msg", msg);

  // Ara sıra eski mesajları temizle (48 saatten eski; oda zaten 24 saati gösterir).
  if (Math.random() < 0.05) {
    const old = new Date(Date.now() - 48 * 3600e3).toISOString();
    rest(cfg, `chat_messages?created_at=lt.${encodeURIComponent(old)}`, { method: "DELETE" }).catch(() => {});
  }
  return json(headers, 200, { ok: true, msg });
};
