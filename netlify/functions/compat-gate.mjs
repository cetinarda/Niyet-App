// İKİLİ UYUM ÜCRETSİZ HAKKI: IP BAŞINA 1 ÇİFT (1.4.3)
// ---------------------------------------------------------------------------
// Kullanıcı: "premium olmayan üyelere ikili uyum her IP için 1 kez olsun, şu an
// birden fazla yapabiliyorlar". SoulID'deki kural (1 çift ücretsiz) yalnızca
// cihazdaki kayda bakıyordu (`soulprofile.used.compat`); uygulamayı silip kurmak,
// "verilerimi sil", başka tarayıcı ya da gizli pencere onu sıfırlıyordu.
//
// Burada IP'nin TEK YÖNLÜ özeti -> ilk ücretsiz çiftin özeti saklanır (Blobs
// `sakin-compat`). Aynı çift tekrar -> izin, farklı çift -> "denied".
// SAKLANAN: IP özeti + çift özeti (istemci doğum bilgisini değil, çift kimliğinin
// kısa özetini yollar) + zaman. Ad, doğum tarihi, IP'nin kendisi YOK.
//
// FAIL-OPEN: Blobs/ağ hatası -> "unknown", istemci izin verir (yerel kural yine
// geçerli). Premium kontrolü istemcide (sakin_premium); premium bu uca hiç sormaz.
// ⚠️ Mobil operatörler çok kullanıcıya aynı IP'yi verebilir (CGNAT); o IP'deki
// başka biri hakkını kullandıysa yeni kullanıcı da premium kapısını görür. Süre
// sınırı istenirse WINDOW_DAYS'i ayarla (0 = kalıcı).
import { getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";

const WINDOW_DAYS = 0;
const ALLOWED_ORIGINS = ["https://sakin.life", "https://www.sakin.life", "capacitor://localhost", "ionic://localhost", "https://localhost", "http://localhost"];
const cors = (origin) => ({ "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Vary": "Origin" });
const json = (headers, code, obj) => new Response(JSON.stringify(obj), { status: code, headers: { ...headers, "Content-Type": "application/json", "Cache-Control": "no-store" } });
const ipKey = (ip) => createHash("sha256").update("compat-ip:" + String(ip || "?")).digest("hex").slice(0, 32);

const rateMap = new Map();
function limited(ip) {
  const now = Date.now(), e = rateMap.get(ip);
  if (!e || now - e.start > 60_000) { rateMap.set(ip, { start: now, count: 1 }); return false; }
  return ++e.count > 20;
}

export default async (req, context) => {
  const origin = req.headers.get("origin") || "";
  const okOrigin = !origin || ALLOWED_ORIGINS.includes(origin);
  const headers = okOrigin && origin ? cors(origin) : {};
  if (req.method === "OPTIONS") return new Response(null, { status: okOrigin ? 204 : 403, headers });
  if (!okOrigin) return json(headers, 403, { verdict: "unknown" });
  if (req.method !== "POST") return json(headers, 405, { verdict: "unknown" });
  const ip = (context && context.ip) || req.headers.get("x-nf-client-connection-ip") || "";
  if (!ip) return json(headers, 200, { verdict: "unknown" });
  if (limited(ip)) return json(headers, 429, { verdict: "unknown" });
  let b; try { b = await req.json(); } catch { return json(headers, 400, { verdict: "unknown" }); }
  const pair = typeof (b && b.pair) === "string" && /^[a-z0-9]{6,32}$/.test(b.pair) ? b.pair : null;
  if (!pair) return json(headers, 400, { verdict: "unknown" });
  try {
    const store = getStore("sakin-compat");
    const key = "ip/" + ipKey(ip);
    const cur = await store.get(key, { type: "json" }).catch(() => null);
    const fresh = cur && cur.p && (!WINDOW_DAYS || Date.now() - (cur.t || 0) < WINDOW_DAYS * 86400e3);
    if (fresh && cur.p !== pair) return json(headers, 200, { verdict: "denied" });
    if (!fresh) await store.setJSON(key, { p: pair, t: Date.now() });
    return json(headers, 200, { verdict: "allowed" });
  } catch (e) {
    console.warn("[compat-gate]", e && e.message);
    return json(headers, 200, { verdict: "unknown" });
  }
};
