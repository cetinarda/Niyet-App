// Groq model secimi + OTOMATIK FALLBACK.
// ------------------------------------------------------------------------
// Amac: bir model Groq tarafindan emekli edilince (or. 16 Agu 2026'da
// llama-3.3-70b-versatile kapandi) uygulama COKMESIN. Kod push'suz, kendisi
// siradaki EN IYI MEVCUT modele gecsin.
//
// Nasil calisir:
//   1) Groq `/models` listesini cekip o an GERCEKTEN yayinda olan model
//      ID'lerini ogrenir (cold-start basina ~10 dk cache). Emekli model bu
//      listeden dusunce otomatik elenir.
//   2) Tercih listesi (en iyi -> yedek) ile kesisim alinir, ilk MEVCUT model
//      secilir. Yeni/daha iyi model cikinca listenin BASINA tek satir eklemek
//      yeterli (istenirse env ile push'suz da yapilir).
//   3) Env override: GROQ_TEXT_MODEL / GROQ_VISION_MODEL tanimliysa ve mevcutsa
//      once o denenir (Netlify panelinden aninda model degistirme).
//   4) Cagri sirasinda model 400/404 donerse (gecersiz/emekli) siradaki adaya
//      gecer; 429/500 gibi gecici hatalarda durur (modelleri bosa yakmaz).
//
// Yeni model eklemek: asagidaki PREF listelerinin BASINA gercek Groq ID'sini yaz.

const GROQ_BASE = "https://api.groq.com/openai/v1";

// Tercih sirasi: EN IYI once. Hepsi gercek Groq model ID'leri (Agu 2026).
const PREF = {
  text: ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.6-27b"],
  vision: ["qwen/qwen3.6-27b", "meta-llama/llama-4-maverick-17b-128e-instruct", "meta-llama/llama-4-scout-17b-16e-instruct"],
};
const ENV_OVERRIDE = { text: "GROQ_TEXT_MODEL", vision: "GROQ_VISION_MODEL" };

// Yayindaki model ID'leri (in-memory cache).
let _cache = { at: 0, ids: null };
const TTL_MS = 10 * 60 * 1000;

async function availableIds(apiKey) {
  const now = Date.now();
  if (_cache.ids && now - _cache.at < TTL_MS) return _cache.ids;
  try {
    const r = await fetch(`${GROQ_BASE}/models`, { headers: { Authorization: `Bearer ${apiKey}` } });
    if (r.ok) {
      const j = await r.json();
      const ids = new Set((j?.data || []).map((m) => m && m.id).filter(Boolean));
      if (ids.size) { _cache = { at: now, ids }; return ids; }
    }
  } catch (_) { /* ag hatasi -> statik listeye guven */ }
  return null;
}

// SON CARE MODELLERI. Groq'ta dakikalik token butcesi (TPM) MODEL BASINA
// tutuluyor, yani her ek model = yeni bir butce. Tercih listesindeki uc model
// tukendiginde yayinda olan DIGER metin modelleri de deneniyor.
// Neden gerekli: Icsel Ayna istemi ~6k token; tek cagri bir modelin dakikalik
// butcesinin buyuk kismini yiyor ve butce TUM KULLANICILAR arasinda paylasimli.
// Olculdu (canli, 27 Agu 2026): ayni istem arka arkaya gonderildiginde 3 model
// ile 3/4 cagri gecti, 4'unculer reddedildi. Model havuzu genisleyince tavan
// da yukseliyor.
// ID TAHMIN EDILMIYOR: adaylar Groq'un /models cevabindan geliyor. Metin
// uretmeyen aileler (ses, koruma, gomme, goruntu) ad uzerinden eleniyor;
// gozden kacan olursa zaten 400 doner ve siradakine gecilir.
const NON_TEXT = /whisper|tts|guard|embed|rerank|vision|moderation|safety|audio|speech/i;

// Denenecek modeller, en iyi -> yedek sirasiyla. Asla bos donmez.
export async function groqModelCandidates(apiKey, kind) {
  const pref = PREF[kind] || PREF.text;
  const override = (process.env[ENV_OVERRIDE[kind]] || "").trim();
  const wanted = override ? [override, ...pref.filter((m) => m !== override)] : pref.slice();
  const ids = await availableIds(apiKey);
  if (!ids) return wanted;                       // liste alinamadi -> hepsini dene
  const avail = wanted.filter((m) => ids.has(m));
  const primary = avail.length ? avail : wanted; // hicbiri listede yoksa yine dene (liste bayat olabilir)
  if (kind !== "text") return primary;           // gorsel modelinde rastgele yedek ise yaramaz
  const extra = [...ids].filter((m) => !primary.includes(m) && !NON_TEXT.test(m)).sort();
  return [...primary, ...extra];
}

// Siradaki modele GECILMESI gereken durumlar.
//   400/404 : model gecersiz ya da emekli.
//   413/429 : istek bu model icin fazla buyuk ya da o modelin dakikalik token
//             butcesi (TPM) dolmus. Groq'ta TPM butcesi MODEL BAZLI tutulur,
//             yani 120b dolduysa 20b'nin butcesi hala bos olabilir.
// ONCEDEN 429'da DURULUYORDU ("modelleri bosa yakma") ve bu Icsel Ayna'yi
// kiriyordu: Ayna istemi ~6,5k token, tek cagri 120b'nin dakikalik butcesini
// bitiriyor, Groq 0,2 sn'de reddediyor, kod hic yedege bakmadan 502 donuyordu.
// Olculdu (canli): 8,5k karakterlik istem gecti, ayni istem az sonra reddedildi
// -> kayan butce davranisi, kalici bir istek siniri degil.
function isModelError(status) {
  return status === 400 || status === 404 || status === 413 || status === 429;
}

// gpt-oss reasoning modeli: dar token butcesinde reasoning yaniti kirpmasin diye
// reasoning_effort:low. Diger modellerde bu parametre gonderilmez (uyumsuzluk 400 vermesin).
function extraFor(model) {
  return model.startsWith("openai/gpt-oss") ? { reasoning_effort: "low" } : {};
}

// Qwen "thinking" modu <think>...</think> sizabilir; temizle.
export function stripThink(s) {
  return typeof s === "string" ? s.replace(/<think>[\s\S]*?<\/think>/gi, "").trim() : s;
}

// Sohbet/gorsel cagrisi + otomatik model fallback.
// body: { max_tokens, temperature, top_p, messages, ... } (model DISINDA her sey).
// Doner: { ok:true, model, data } | { ok:false, status }
export async function groqChat(apiKey, kind, body, opts = {}) {
  const timeoutMs = opts.timeoutMs || 25000;
  // TOPLAM SURE TAVANI. Aday listesi artik yayindaki tum metin modellerini
  // kapsayabiliyor; hepsi tek tek 25 sn beklerse Netlify fonksiyonu kendisi
  // dusar ve kullanici hicbir sey goremez. Reddedilen model 0,2 sn'de donuyor,
  // yani normal fallback bu tavana hic yaklasmiyor; tavan yalnizca TAKILAN
  // modellerin zinciri kilitlemesini engelliyor.
  const deadline = Date.now() + (opts.totalMs || 40000);
  const candidates = await groqModelCandidates(apiKey, kind);
  let lastStatus = 0;
  for (const model of candidates) {
    if (Date.now() >= deadline) { console.error("[groq] toplam sure asildi, kalan modeller atlandi"); break; }
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), Math.min(timeoutMs, Math.max(1000, deadline - Date.now())));
    let res, data;
    try {
      res = await fetch(`${GROQ_BASE}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, ...extraFor(model), ...body }),
        signal: ctrl.signal,
      });
      data = await res.json();
    } catch (e) {
      clearTimeout(timer);
      console.error("[groq] fetch failed", model, e && e.message);
      lastStatus = 0;
      continue; // ag/timeout -> siradaki modeli dene
    }
    clearTimeout(timer);
    if (res.ok && data && !data.error) return { ok: true, model, data };
    lastStatus = res.status;
    console.error("[groq] upstream", model, res.status, (data && data.error && data.error.message) || "");
    if (isModelError(res.status)) continue;      // emekli/gecersiz/dolu -> siradaki
    return { ok: false, status: res.status };    // 500/503 -> dur (saglayici arizasi)
  }
  return { ok: false, status: lastStatus || 502 };
}
