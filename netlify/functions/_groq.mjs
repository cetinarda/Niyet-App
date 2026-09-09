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
// AYRICA elenen: "dusunen" (reasoning/chain-of-thought) model aileleri. Bunlar
// tercih listesindeki gpt-oss'tan FARKLI olarak reasoning_effort ile
// kisitlanmiyor, kapali kapida uzun bir <think> bloguyla dusunuyor ve dar
// max_tokens butcesini o blok icinde tuketebiliyor. CANLI YAKALANDI (27 Agu
// 2026): rastgele secilen bir "extra" model kapanmamis bir <think> blogunu
// ve INGILIZCE muhakemesini oldugu gibi kullaniciya dondurdu (Turkce istendi
// halde). stripThink kapanan etiketleri temizler ama YARIM KESILENI temizleyemez
// (asagida ayrica sertlestirildi); en guvenlisi bu aileleri "son care"
// havuzuna hic almamak.
const REASONING_RISK = /think|reasoning|-r1|r1-|distill|cot-/i;

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
  const extra = [...ids].filter((m) => !primary.includes(m) && !NON_TEXT.test(m) && !REASONING_RISK.test(m)).sort();
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

// Qwen/DeepSeek "thinking" modu <think>...</think> sizabilir; temizle.
// SERTLESTIRME (canli hatadan): bir reasoning modeli max_tokens dolmadan
// </think> etiketini KAPATAMAZSA eski regex hicbir sey silmiyordu ve ham
// muhakeme metni (cogu zaman Ingilizce) oldugu gibi kullaniciya gidiyordu.
// Simdi: once kapanan bloklari sil, sonra YARIM KALAN bir <think> varsa
// ordan itibaren HER SEYI sil (kapanmamis muhakeme, gecerli bir yanit
// olamaz). Sonuc bos kalirsa cagiran taraf (asagidaki validate) bunu
// "bu model basarisiz" olarak yorumlayip siradaki adaya gecer.
export function stripThink(s) {
  if (typeof s !== "string") return s;
  let out = s.replace(/<think>[\s\S]*?<\/think>/gi, "");
  const dangling = out.indexOf("<think");
  if (dangling !== -1) out = out.slice(0, dangling);
  return out.trim();
}

// Basit kalite kapisi: reasoning sizintisi kacan bir on-isaret ya da bos
// yanit varsa bu adayi ELE (siradaki modele gecilsin). `validateExtra`
// verilirse (ornek: dil uygunlugu) ek olarak calisir. Cagiran tarafa TEK
// gercek: dogrulama basarisiz -> bu model 400/404 gibi "siradakine gec"
// muamelesi gorur, kullaniciya asla yarim/bozuk metin gitmez.
function defaultQualityOk(text) {
  if (!text || text.length < 8) return false;
  if (/<\/?think/i.test(text)) return false;   // temizleyici kacirmis olabilir, son savunma
  return true;
}

// DIL UYGUNLUGU KONTROLU (paylasilan validate yardimcisi). Canli yakalanan
// hatada model lang:"tr" istenmisken Ingilizce yanit uretmisti; upstream 200
// dedigi ve icerik bos olmadigi icin eski kod bunu gecerli sanip kullaniciya
// gonderiyordu. Her dilin kendine ozgu harfi/alfabesi varliginia bakiyor, 
// tam bir dil tespiti degil ama "tamamen yanlis dilde" durumunu ucuza yakalar.
// KISA METINLERDE ATLANIR: "Merhaba, iyi günler." gibi gercek Turkce bir
// yanit bile diyakritik icermeyebilir; yanlis pozitif riski kisa metinde
// faydadan yuksek. `en` icin kontrol YOK (Ingilizce zaten "sizinti" dili,
// "Ingilizce icerir mi" testi anlamsiz).
const CONFORMANCE_RE = {
  tr: /[çğıöşüÇĞİÖŞÜ]/,
  de: /[äöüßÄÖÜ]/,
  es: /[áéíóúñ¿¡ÁÉÍÓÚÑ]/,
  fr: /[éèêàçîôûÉÈÊÀÇÎÔÛ]/,
  pt: /[ãõáéíóúçÃÕÁÉÍÓÚÇ]/,
  ja: /[぀-ゟ゠-ヿ一-鿿]/,
};
export function langConformanceOk(text, lang) {
  const re = CONFORMANCE_RE[lang];
  if (!re) return true;
  if (!text || text.length < 150) return true;
  return re.test(text);
}

// Sohbet/gorsel cagrisi + otomatik model fallback.
// body: { max_tokens, temperature, top_p, messages, ... } (model DISINDA her sey).
// opts.validate(strippedText): true/false: ONAY vermezse bu aday ELENIR ve
// siradaki modele gecilir (ornek: dil uygunlugu kontrolu, bkz. ai-call.mjs).
// Doner: { ok:true, model, data } | { ok:false, status }
// NOT: basarili donen `data.choices[0].message.content` BURADA ZATEN
// stripThink'ten gecirilmis olarak doner (cagiran taraf yine kendi
// stripThink'ini cagirabilir, ikinci cagri no-op'tur: geriye donuk uyumlu).
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
    if (res.ok && data && !data.error) {
      // KALITE KAPISI. Canli yakalanan hata: rastgele secilen bir "son care"
      // modeli kapanmamis <think> muhakemesini (Ingilizce) oldugu gibi
      // donduruyordu, upstream 200 dedigi icin eskiden bu aynen kullaniciya
      // gidiyordu. Simdi icerik burada denetleniyor; gecmezse bu YANIT
      // ATILIR ve siradaki adaya gecilir, kullanici hicbir zaman yarim ya
      // da yanlis dilde bir metin gormez.
      const rawText = data.choices?.[0]?.message?.content || "";
      const stripped = stripThink(rawText);
      const qualityOk = defaultQualityOk(stripped) && (!opts.validate || opts.validate(stripped));
      if (qualityOk) {
        if (data.choices?.[0]?.message) data.choices[0].message.content = stripped;
        return { ok: true, model, data };
      }
      console.error("[groq] kalite kapisi reddetti", model, `(${stripped.length} kar)`);
      lastStatus = res.status;
      continue; // dusuk kaliteli/bos/yanlis dilde yanit -> siradaki modeli dene
    }
    lastStatus = res.status;
    console.error("[groq] upstream", model, res.status, (data && data.error && data.error.message) || "");
    if (isModelError(res.status)) continue;      // emekli/gecersiz/dolu -> siradaki
    return { ok: false, status: res.status };    // 500/503 -> dur (saglayici arizasi)
  }
  return { ok: false, status: lastStatus || 502 };
}
