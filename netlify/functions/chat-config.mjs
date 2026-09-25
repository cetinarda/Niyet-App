// ÇEMBER: istemci ayarları. Realtime'a bağlanmak için Supabase adresi + anon
// anahtarı (herkese açık, RLS yüzünden tablolara erişemez) ve cihazın iki
// odadaki takma adı. Env eksikse { ok:false } döner, uygulama "kapalı" gösterir.
import { chatConfig, corsFor, json, validDeviceId, deviceHash, nickFor, elementIndex, ROOMS, MAX_LEN, SLOW_MS } from "./_chat.mjs";

export default async (req) => {
  const { ok: originOk, headers } = corsFor(req);
  if (req.method === "OPTIONS") return new Response(null, { status: originOk ? 204 : 403, headers });
  if (!originOk) return json(headers, 403, { ok: false });
  const cfg = chatConfig();
  if (!cfg.ok) return json(headers, 200, { ok: false, reason: "closed" });
  const id = new URL(req.url).searchParams.get("id") || "";
  const out = { ok: true, url: cfg.url, anon: cfg.anon, rooms: ROOMS, maxLen: MAX_LEN, slowMs: SLOW_MS };
  if (validDeviceId(id)) {
    const h = deviceHash(id);
    out.nick = { tr: nickFor(h, "tr"), global: nickFor(h, "global") };
    out.el = elementIndex(h);
  }
  return json(headers, 200, out);
};
