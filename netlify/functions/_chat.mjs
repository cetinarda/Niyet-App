// ÇEMBER (canlı sohbet) ORTAK YARDIMCILARI. Alt çizgili dosya fonksiyon olarak
// yayınlanmaz (bkz. _groq.mjs). Şema: supabase/cember.sql.
//
// GEREKLİ ENV (Netlify > Environment variables, scope: Functions):
//   SUPABASE_URL          https://xxxx.supabase.co
//   SUPABASE_ANON_KEY     Project Settings > API > anon public (uygulamaya verilir,
//                         yalnızca Realtime kanalına bağlanmak için; tablolara RLS
//                         yüzünden erişemez)
//   SUPABASE_SERVICE_KEY  Project Settings > API > service_role (GİZLİ, yalnızca burada)
//   GROQ_API_KEY          (zaten var) mesaj moderasyonu için
// Biri eksikse Çember "kapalı" döner, uygulama bunu nazikçe gösterir.
import { createHash } from "node:crypto";
import { groqChat } from "./_groq.mjs";

export const ROOMS = ["tr", "global"];
export const MAX_LEN = 140;
export const SLOW_MS = 15000;          // aynı cihazdan iki mesaj arası en az 15 sn
export const HISTORY_HOURS = 24;       // odada son 24 saat görünür
export const HIDE_AFTER_REPORTS = 2;   // 2 farklı cihaz bildirirse mesaj gizlenir

export function chatConfig() {
  const url = (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
  const anon = (process.env.SUPABASE_ANON_KEY || "").trim();
  const service = (process.env.SUPABASE_SERVICE_KEY || "").trim();
  return { url, anon, service, ok: !!(url && anon && service) };
}

// Supabase PostgREST (servis anahtarıyla, RLS'yi aşar).
export async function rest(cfg, path, { method = "GET", body, prefer } = {}) {
  const r = await fetch(`${cfg.url}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: cfg.service, Authorization: `Bearer ${cfg.service}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(6000),
  });
  const text = await r.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { ok: r.ok, status: r.status, data };
}

// Realtime broadcast (sunucudan kanala). İstemci PRIVATE "room:tr" kanalını dinler;
// servis anahtarı RLS'yi aştığı için yalnızca sunucu basabilir. private:true ŞART,
// yoksa mesaj public kanala gider ve private dinleyicilere ULAŞMAZ.
export async function broadcast(cfg, topic, event, payload) {
  try {
    const r = await fetch(`${cfg.url}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: { apikey: cfg.service, Authorization: `Bearer ${cfg.service}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ topic, event, payload, private: true }] }),
      signal: AbortSignal.timeout(5000),
    });
    return r.ok;
  } catch { return false; }
}

// Kurulum kimliği (analytics.js sakin_anon_id) HİÇ saklanmaz, yalnızca özeti.
export const deviceHash = (id) => createHash("sha256").update("cember:" + String(id)).digest("hex").slice(0, 32);
export const validDeviceId = (id) => typeof id === "string" && /^[A-Za-z0-9-]{8,64}$/.test(id);

// TAKMA AD SUNUCUDA üretilir (istemci seçemez: kötüye kullanım kapısı kapanır).
// Aynı cihaz her zaman aynı adı alır. Oda diline göre Türkçe ya da İngilizce.
const NICK = {
  tr: {
    el: ["Ateş", "Su", "Toprak", "Hava", "Ay", "Güneş", "Yıldız", "Rüzgâr"],
    cr: ["Turna", "Kartal", "Geyik", "Tilki", "Baykuş", "Yunus", "Kurt", "Ceylan", "Kaplumbağa", "Serçe", "Balina", "Ayı", "Kelebek", "Martı", "Vaşak", "Leylek"],
  },
  global: {
    el: ["Fire", "Water", "Earth", "Air", "Moon", "Sun", "Star", "Wind"],
    cr: ["Crane", "Eagle", "Deer", "Fox", "Owl", "Dolphin", "Wolf", "Gazelle", "Turtle", "Sparrow", "Whale", "Bear", "Butterfly", "Gull", "Lynx", "Stork"],
  },
};
export function nickFor(hash, room) {
  const n = NICK[room] || NICK.global;
  const a = parseInt(hash.slice(0, 4), 16), b = parseInt(hash.slice(4, 8), 16), c = parseInt(hash.slice(8, 12), 16);
  // Sayı 1-999 (eskiden 1-99): aynı takma adı taklit etmek artık ~10 kat zor. Asıl
  // koruma takma ad DEĞİL: kendi mesajın id ile, engelleme authorTag ile yapılır.
  return `${n.el[a % n.el.length]} · ${n.cr[b % n.cr.length]} ${1 + (c % 999)}`;
}
// Yazar etiketi: cihaz özetinden türetilen, geri çevrilemeyen ve takma addan
// BAĞIMSIZ kısa kimlik. İstemci engellemeyi bununla yapar (takma ad taklit
// edilebildiği için "birini engelle" başka birini de engelleyebiliyordu).
export const authorTag = (hash) => createHash("sha256").update("tag:" + hash).digest("hex").slice(0, 12);
// Bildirim ve moderasyon sınırı için IP özeti (IP'nin kendisi saklanmaz).
export const ipKey = (ip) => createHash("sha256").update("ip:" + String(ip || "?")).digest("hex").slice(0, 32);
// Takma adın rengi (element başına), istemci bununla boyar.
export function elementIndex(hash) { return parseInt(hash.slice(0, 4), 16) % 8; }

// ── DENETİM ────────────────────────────────────────────────────────────────
// Bağlantı / iletişim bilgisi paylaşımı yasak (spam, dolandırıcılık, oda dışına çekme).
const LINK_RE = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|me|app|link|ly|tr|co)\b|@[a-z0-9_]{3,}|(?:\+?\d[\s-]?){9,})/i;
export const hasLink = (s) => LINK_RE.test(s);

// KRİZ İFADELERİ: mesaj odaya DÜŞMEZ, yazana özel destek mesajı döner. AI'dan önce
// yerel kontrol (AI kapalıyken de çalışsın). Bilerek geniş tutuldu.
const CRISIS_RE = /(kendimi\s*öldür|intihar|ölmek\s*istiyorum|yaşamak\s*istemiyorum|canıma\s*kıy|kendime\s*zarar|bileklerimi|kill\s*myself|suicid|want\s*to\s*die|end\s*my\s*life|self[\s-]*harm|hurt\s*myself)/i;
export const looksCrisis = (s) => CRISIS_RE.test(s);

// Kaba yerel küfür filtresi (AI yoksa/düşerse son savunma hattı).
// Yalnızca TAM KELİME eşleşir (\p{L} ile Türkçe harfler de sınır sayılır):
// "götürmek", "müzik", "sikke" gibi masum kelimeler yakalanmaz.
const PROFANITY_RE = /(?:^|[^\p{L}])(amk|aq|siktir|sikerim|sikeyim|sikik|orospu\p{L}*|piç|yarrak|yarak|götveren|ananı|fuck\p{L}*|shit|bitch|cunt|whore|nigg\p{L}*)(?=$|[^\p{L}])/iu;
export const looksProfane = (s) => PROFANITY_RE.test(s);

// AI moderasyonu: tek kelimelik karar. Hata/zaman aşımında null döner (çağıran
// yerel filtreye düşer). Sakin'in tonu: nazik, destekleyici bir oda.
export async function aiModerate(text) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  try {
    const out = await groqChat(apiKey, "text", {
      temperature: 0,
      // ⚠️ groqChat'in kalite kapısı 8 karakterden kısa cevabı ATIYOR; tek kelime
      // ("OK") her zaman reddedilir ve moderasyon sessizce devre dışı kalırdı.
      // Bu yüzden cevap "VERDICT: <KELİME>" biçiminde istenir (>= 8 karakter).
      // gpt-oss muhakeme jetonları da bu bütçeden düşüyor: 12 jetonla cevap
      // çoğu zaman boş dönüp bir sonraki modele düşüyordu (hata avı, Eyl 2026).
      max_tokens: 200,
      messages: [
        { role: "system", content:
          "You moderate a calm, supportive public chat room of a meditation app. Classify the user's message. " +
          "Answer in exactly this format: VERDICT: <WORD> where <WORD> is one of:\n" +
          "OK = acceptable (greetings, feelings, sharing, questions, gratitude, mild sadness)\n" +
          "CRISIS = the writer may harm themselves or is in acute danger\n" +
          "ABUSE = insults, harassment, hate, threats, bullying\n" +
          "SEXUAL = sexual content or solicitation\n" +
          "SPAM = ads, selling, promotion, asking to move to another app, contact details\n" +
          "Any language. When unsure between OK and something else, choose OK unless it is clearly harmful." },
        { role: "user", content: text },
      ],
    }, { timeoutMs: 6000, totalMs: 8000 });
    if (!out.ok) return null;
    const w = String(out.data?.choices?.[0]?.message?.content || "").toUpperCase().match(/\b(CRISIS|ABUSE|SEXUAL|SPAM|OK)\b/);
    return w ? w[1] : null;
  } catch { return null; }
}

export const cors = (origin) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
});
const ALLOWED_ORIGINS = ["https://sakin.life", "https://www.sakin.life", "capacitor://localhost", "ionic://localhost", "https://localhost", "http://localhost"];
export function corsFor(req) {
  const origin = req.headers.get("origin") || "";
  const ok = !origin || ALLOWED_ORIGINS.includes(origin);
  return { ok, headers: ok && origin ? cors(origin) : {} };
}
export const json = (headers, code, obj) => new Response(JSON.stringify(obj), { status: code, headers: { ...headers, "Content-Type": "application/json", "Cache-Control": "no-store" } });

// Aynı sıcak fonksiyon örneğinde IP başına kaba sınır (asıl yavaş mod veritabanında).
// `bucket` ayrı sayaçlar için (ör. "mod": moderasyon çağrısı; reddedilen mesajlar
// yavaş moda sayılmadığı için AI moderasyonu art arda tetiklenebiliyordu).
const rate = new Map();
export function ipLimited(ip, max = 30, bucket = "all") {
  const k = bucket + "|" + ip, now = Date.now(), e = rate.get(k);
  if (!e || now - e.t > 60000) { rate.set(k, { t: now, n: 1 }); return false; }
  return ++e.n > max;
}
