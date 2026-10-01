// PONG GALİBİYET SAYACI (1.4.3, Eki 2026). Kullanıcı: "topluluktaki nick profilinde kaç kez
// pong kazandığı yazsın; 5, 15, 20, 50 rozetlerini tek takalım" (eşikler sonra 5/15/30/50 kabul).
//
// SAHTECİLİĞE KARŞI: oyun istemcide (oda sahibi yetkili) olduğu için tek tarafın "kazandım"
// demesi SAYILMAZ. İki oyuncu da maç sonunda ayrı ayrı rapor verir; galibiyet yalnızca:
//   - aynı maç (rid + maç no) için İKİ FARKLI cihazdan rapor geldiyse,
//   - skorlar birbirinin aynası ise (A.me == B.op, A.op == B.me) ve biri 7'ye ulaştıysa,
//   - iki rapor FARKLI ağdan (IP özeti) geldiyse,
//   - aynı ikili o gün en çok 3 maç saydırdıysa
// sayılır. Kayıtlar İDEMPOTENT: kazananın kaydı bir maç kimliği KÜMESİ; iki istek aynı anda
// işlese bile aynı maç iki kez sayılmaz (Blobs'ta "yalnızca yeniyse yaz" yok, v8.2).
// Saklanan: cihaz özeti (geri çevrilemez) -> kazanılan maç sayısı. Kişisel veri YOK.
// Çember mesajı (chat-send) bu sayıyı sunucuda okuyup mesaja yazar; istemci uyduramaz.
import { getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";
import { corsFor, json, deviceHash, validDeviceId, ipKey, ipLimited } from "./_chat.mjs";

const WIN = 7;
const PAIR_DAY_MAX = 3;
const MATCH_TTL_MS = 10 * 60 * 1000;
const short = (s) => createHash("sha256").update(String(s)).digest("hex").slice(0, 24);
const today = () => new Date().toISOString().slice(0, 10);

export async function pongWins(store, dh) {
  try { const w = await store.get("w/" + dh, { type: "json" }); return (w && Number.isInteger(w.n)) ? w.n : 0; } catch { return 0; }
}

export default async (req, context) => {
  const { ok: originOk, headers } = corsFor(req);
  if (req.method === "OPTIONS") return new Response(null, { status: originOk ? 204 : 403, headers });
  if (!originOk) return json(headers, 403, { ok: false });
  // "Hesabımı ve verilerimi sil": galibiyet kaydı da silinir.
  if (req.method === "DELETE") {
    let d = {}; try { d = await req.json(); } catch {}
    if (!validDeviceId(d && d.id)) return json(headers, 400, { ok: false });
    try { await getStore("sakin-pong").delete("w/" + deviceHash(d.id)); } catch {}
    return json(headers, 200, { ok: true });
  }
  if (req.method !== "POST") return json(headers, 405, { ok: false });
  const ip = (context && context.ip) || req.headers.get("x-nf-client-connection-ip") || "?";
  if (ipLimited(ip, 20, "pong")) return json(headers, 429, { ok: false });
  let b = {};
  try { b = await req.json(); } catch { return json(headers, 400, { ok: false }); }
  const { id, rid, mn, me, op } = b || {};
  if (!validDeviceId(id) || typeof rid !== "string" || !/^[a-z0-9]{4,24}$/i.test(rid)) return json(headers, 400, { ok: false });
  const okScore = (x) => Number.isInteger(x) && x >= 0 && x <= WIN;
  if (!Number.isInteger(mn) || mn < 0 || mn > 999 || !okScore(me) || !okScore(op)) return json(headers, 400, { ok: false });
  if ((me === WIN) === (op === WIN)) return json(headers, 400, { ok: false }); // tam olarak biri 7

  let store;
  try { store = getStore("sakin-pong"); } catch { return json(headers, 200, { ok: false, reason: "store" }); }
  const dh = deviceHash(id);
  const mid = `${rid}:${mn}`;
  const mine = { dh, ip: ipKey(ip), me, op, t: Date.now() };
  try { await store.setJSON(`m/${mid}/${dh}`, mine); } catch { return json(headers, 200, { ok: false, reason: "store" }); }

  // Bu maçın diğer raporu var mı?
  let other = null;
  try {
    const { blobs } = await store.list({ prefix: `m/${mid}/` });
    for (const bl of blobs || []) {
      if (bl.key === `m/${mid}/${dh}`) continue;
      const r = await store.get(bl.key, { type: "json" }).catch(() => null);
      if (r && r.dh !== dh) { other = r; break; }
    }
  } catch { /* liste hatası: yalnızca beklemede kal */ }
  if (!other) return json(headers, 200, { ok: true, counted: false, wins: await pongWins(store, dh) });

  const fresh = Math.abs(other.t - mine.t) < MATCH_TTL_MS;
  const mirror = other.me === mine.op && other.op === mine.me;
  const diffNet = other.ip !== mine.ip;
  let counted = false;
  if (fresh && mirror && diffNet) {
    const winner = mine.me === WIN ? dh : other.dh;
    const pair = short([dh, other.dh].sort().join("|"));
    const pk = `p/${today()}/${pair}`;
    let pr = null;
    try { pr = await store.get(pk, { type: "json" }); } catch {}
    const ids = Array.isArray(pr && pr.ids) ? pr.ids : [];
    if (ids.includes(mid) || ids.length < PAIR_DAY_MAX) {
      if (!ids.includes(mid)) { ids.push(mid); try { await store.setJSON(pk, { ids }); } catch {} }
      let w = null;
      try { w = await store.get("w/" + winner, { type: "json" }); } catch {}
      const wid = Array.isArray(w && w.ids) ? w.ids : [];
      if (!wid.includes(mid)) {
        const n = ((w && Number.isInteger(w.n)) ? w.n : 0) + 1;
        try { await store.setJSON("w/" + winner, { n, ids: [...wid, mid].slice(-60) }); counted = true; } catch {}
      }
    }
  }
  return json(headers, 200, { ok: true, counted, wins: await pongWins(store, dh) });
};
