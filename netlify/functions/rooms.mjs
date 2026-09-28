// SAKİN ODALAR: uygulamanın okuduğu herkese açık uç (1.4.3).
// ---------------------------------------------------------------------------
// Rehberler ve buluşmalar yönetim panelinden yazılır (rooms-admin.mjs, Blobs
// `sakin-rooms` "data"). GET ?lang=tr -> { events, guides }: yalnızca gelecek
// buluşmalar (2 saat tolerans), tarih sırasıyla; hedef dili boş ya da istenen dil
// olan kayıtlar. İstekte kişisel veri yok. CORS "*" (CDN önbelleği, cosmic dersi).
import { getStore } from "@netlify/blobs";

const LANGS = ["tr", "en", "de", "es", "pt", "fr", "ja"];
const headers = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json", "Cache-Control": "public, max-age=120" };

export default async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: { ...headers, "Access-Control-Allow-Methods": "GET, OPTIONS" } });
  const url = new URL(req.url);
  const lang = LANGS.includes(url.searchParams.get("lang")) ? url.searchParams.get("lang") : "en";
  let data = null;
  try { data = await getStore("sakin-rooms").get("data", { type: "json" }); } catch { data = null; }
  data = data || {};
  const now = Date.now() - 2 * 3600e3;
  const okLang = (x) => !x.lang || x.lang === lang;
  const events = (Array.isArray(data.events) ? data.events : [])
    .filter((e) => e && e.id && okLang(e) && new Date(e.date).getTime() >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 60)
    .map(({ id, room, title, where, date, teacher, link }) => ({ id, room, title, where, date, teacher, link }));
  const guides = (Array.isArray(data.guides) ? data.guides : [])
    .filter((g) => g && g.id && okLang(g))
    .map(({ id, room, name, role, contact, city, link }) => ({ id, room, name, role, contact, city, link }));
  return new Response(JSON.stringify({ ok: true, events, guides }), { status: 200, headers });
};
