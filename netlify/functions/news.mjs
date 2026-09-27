// BİLDİRİM MERKEZİ AKIŞI (1.4.3): uygulamadaki zilin okuduğu uç.
// ---------------------------------------------------------------------------
// Kayıtlar push-admin panelinden yazılır (Blobs `sakin-news`, anahtar "feed").
// GET ?lang=tr&p=ios|android|web -> o dilde metni olan, hedef dil/platformu
// uyan son 20 kayıt: [{ id, t, title, body, screen }]. Herkese açık İÇERİK,
// istekte kişisel veri yok (yalnızca dil + platform). CORS "*": CDN önbelleği
// ilk isteyenin origin'ini herkese vermesin (cosmic-energy ile aynı ders).
import { getStore } from "@netlify/blobs";

const LANGS = ["tr", "en", "de", "es", "pt", "fr", "ja"];
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
  "Cache-Control": "public, max-age=60",
};

export default async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: { ...headers, "Access-Control-Allow-Methods": "GET, OPTIONS" } });
  const url = new URL(req.url);
  const lang = LANGS.includes(url.searchParams.get("lang")) ? url.searchParams.get("lang") : "en";
  const plat = ["ios", "android", "web"].includes(url.searchParams.get("p")) ? url.searchParams.get("p") : "web";
  let feed = [];
  try { feed = (await getStore("sakin-news").get("feed", { type: "json" })) || []; } catch { feed = []; }
  const items = [];
  for (const n of feed) {
    if (!n || !n.id) continue;
    if (n.lang && n.lang !== lang) continue;
    if (n.platform && n.platform !== plat) continue;
    const per = n.per || {};
    const body = per[lang] || (n.onlyWritten && !n.general ? "" : n.general) || "";
    if (!body) continue;
    items.push({ id: n.id, t: n.ts, title: n.title || "Sakin", body, screen: n.screen || "" });
    if (items.length >= 20) break;
  }
  return new Response(JSON.stringify({ ok: true, items }), { status: 200, headers });
};
