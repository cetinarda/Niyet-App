// YAŞAM KOÇU BİLDİRİMLERİ (kullanıcı isteği, Eyl 2026: "bir yaşam koçu asistanı
// gibi olsun; kişinin haritasına göre ona ne iyi gelir algoritması kur; appi
// kullanma biçiminden datalar al; aynı yapıdaki bilgilerin gitmesini engelle;
// sonsuz ve tekrarlanmayan bir olasılık havuzu kur").
//
// NASIL ÇALIŞIR
// 1) ADAYLAR: her gün için olası mesaj KATEGORİLERİ çıkarılır ve puanlanır:
//    - kullanım (en yüksek puan): kaç gündür nefes / ses / çakra yok, Ayna hiç
//      denenmedi ya da uzun zamandır yok, mektubun açılmasına kaç gün kaldı,
//      mektup hazır, seri kaç gün. Tamamen YEREL veri, sunucuya hiçbir şey gitmez.
//    - harita: baskın elementin dengeleyici pratiği, eksik elementin daveti
//      (sakin_element_dist; yoksa Güneş burcunun elementi), günün KİŞİSEL SAYISI
//      (her gün değişir), Ay evresi.
//    - koç sorusu: veriden bağımsız, düşündüren kısa sorular (taban puan).
// 2) SEÇİM: kategori, günün ve kişinin tohumuyla AĞIRLIKLI seçilir; bir önceki
//    günün koç kategorisi bir gün dinlenir ("aynı yapı" art arda gelmez).
// 3) METİN: her kategori bir KARIŞTIRILMIŞ TORBA: havuzdaki her cümle bir kez
//    gelmeden hiçbiri tekrar etmez; torba bitince YENİ bir karışık sırayla baştan
//    (kişiye özel tohum). Yani akış sonsuz ve kısa vadede tekrarsız.
// İçerik: tr + en burada, de/es/pt/fr/ja `notif-coach-i18n.js` (aynı şekil).
// ⚠️ Metin kalıplarında sayıdan SONRA Türkçe ek YOK ("{n} gün kaldı" doğru,
// "{n}'e" yanlış): ek sayıya göre değişir, şablonla bozulur.
import { COACH_MORE } from "./notif-coach-i18n.js";

const COACH_BASE = {
  tr: {
    el: {
      ates: {
        dom: [
          "İçindeki ateş bugün hızlı yanabilir. Hareket etmeden önce 4-6 nefesle bir dakika dur, sonra git.",
          "Enerjin yüksek; onu dağıtmak yerine tek bir işe ver. Bugün bitireceğin tek şey ne?",
          "Ateş elementi baskın olanlar için en iyi ilaç yavaşlamaktır. Akşam 5 dakika diyafram nefesi dene.",
        ],
        lack: [
          "Haritanda ateş az. Bugün küçük bir cesaret göster: ertelediğin bir mesajı gönder.",
          "İçindeki kıvılcımı büyütmek için bugün bedenini hareket ettir; 10 dakikalık yürüyüş yeter.",
        ],
      },
      toprak: {
        dom: [
          "Toprak elementin güçlü: istikrar senin armağanın. Bugün bir rutini biraz esnet, yeni bir şey dene.",
          "Sağlam duruyorsun ama katılaşma. Bugün bir frekans aç, bedenini sese bırak.",
          "Toprak baskın olanlar çok taşır. Bugün bir yükünü bırak: neyi başkasına devredebilirsin?",
        ],
        lack: [
          "Haritanda toprak az. Bugün bedenine dön: çıplak ayakla yere bas ya da 5 dakika yavaş nefes al.",
          "Kök çakran bugün desteğe açık. Çakra ekranında kök çakraya birkaç dakika ayır.",
        ],
      },
      hava: {
        dom: [
          "Zihnin hızlı, fikirlerin bol. Bugün birini seç ve küçük bir adımla somutlaştır.",
          "Hava elementi baskın olanlar çok düşünür. Düşünceyi bedene indirmek için 3 derin nefes al.",
          "Bugün söyleyeceklerini değil, hissettiklerini fark et. Bir dakika sessiz kal.",
        ],
        lack: [
          "Haritanda hava az. Bugün içindekini söze dök: Ayna'ya aklındaki soruyu sor.",
          "Bir şeyi farklı bir açıdan görmek bugün iyi gelebilir. Birine merakla bir soru sor.",
        ],
      },
      su: {
        dom: [
          "Duyguların derin akıyor. Bugün birinin duygusunu taşımadan önce kendi duygunu adlandır.",
          "Su elementi baskın olanlar için sınır bir şefkat biçimidir. Bugün nazik bir 'hayır' de.",
          "Duygularını akıtmak için bugün 528 Hz'i aç ve birkaç dakika sadece dinle.",
        ],
        lack: [
          "Haritanda su az. Bugün kendine şunu sor: şu an gerçekte ne hissediyorum?",
          "Kalbine yer aç: bugün birine içten bir teşekkür mesajı gönder.",
        ],
      },
    },
    day: {
      1: ["Bugün kişisel 1 günün: başlangıçlar günü. Uzun zamandır düşündüğün ilk adımı at.", "1 günü cesaret ister. Bugün kendi adına bir karar ver."],
      2: ["Bugün kişisel 2 günün: iş birliği ve sabır. Acele etme, birini dinle.", "2 günü yumuşaklık günü. Bugün bir ilişkine özen göster."],
      3: ["Bugün kişisel 3 günün: ifade günü. Yaz, çiz, söyle; içindekini dışarı ver.", "3 günü neşe taşır. Bugün seni güldüren bir şeye zaman ayır."],
      4: ["Bugün kişisel 4 günün: düzen günü. Yarım kalan bir işi tamamla.", "4 günü temel atar. Bugün küçük ama sağlam bir adım yeter."],
      5: ["Bugün kişisel 5 günün: değişim günü. Rutinin dışında bir şey dene.", "5 günü özgürlük ister. Bugün bir kalıbını fark et ve esnet."],
      6: ["Bugün kişisel 6 günün: sevgi ve sorumluluk. Sevdiğin birine vakit ayır.", "6 günü yuvayı besler. Bugün kendine de şefkat göster."],
      7: ["Bugün kişisel 7 günün: iç gözlem günü. Birkaç dakika sessizlik sana yol gösterir.", "7 günü derinleşmek içindir. Bugün Ayna'ya içinden gelen soruyu sor."],
      8: ["Bugün kişisel 8 günün: güç ve emek. Hak ettiğin şeyi istemekten çekinme.", "8 günü sonuç getirir. Bugün enerjini en önemli işine ver."],
      9: ["Bugün kişisel 9 günün: kapanış ve bırakış. Artık taşımadığın bir şeyi bırak.", "9 günü tamamlanma günü. Bugün bir döngüyü şükranla kapat."],
    },
    moon: [
      ["Yeni ay enerjisi: bir niyet ekmek için güzel bir zaman. Bugün tek bir niyet yaz.", "Karanlık ay dinlenmeye çağırır. Bugün kendine az şey yüklemen yeterli."],
      ["Ay büyümeye başladı. Niyetine küçük bir eylem ekle.", "Hilal bir filiz gibi: bugün başladığın şeye sabırla su ver."],
      ["İlk dördün: engel çıkarsa vazgeçme, yön değiştir.", "Ay yarıya geldi. Bugün kararlı bir adım at."],
      ["Ay dolmaya yaklaşıyor. Emek verdiğin şeyi ince ayarla.", "Dolunaya doğru enerji artar. Bugün nefesle dengede kal."],
      ["Dolunay: gördüğünü kutla, fazlasını bırak.", "Dolunayda duygular yükselir. Bugün kendine karşı yumuşak ol."],
      ["Ay küçülmeye başladı. Öğrendiğin bir şeyi biriyle paylaş.", "Şükran zamanı: bugün seni besleyen üç şeyi yaz."],
      ["Son dördün: ne işe yaramıyorsa bırakmak için güzel bir an.", "Ay azalırken yükünü de azalt. Bugün bir şeyi sadeleştir."],
      ["Ay kararmadan önceki sessizlik: içe dön, dinlen.", "Döngü kapanıyor. Bugün kendine dinlenme izni ver."],
    ],
    use: {
      breathGap: ["{n} gündür nefes pratiği yapmadın. Bir dakikalık bir nefes bugün bile fark yaratır.", "Nefesine uğramayalı {n} gün oldu. Şimdi 5 nefes almak ister misin?"],
      soundGap: ["Ses frekanslarına {n} gündür dönmedin. Bugün 3 dakikalık bir frekans iyi gelebilir.", "Kulaklığını tak, gözlerini kapat: {n} gündür beklenen bir ses molası."],
      chakraGap: ["Çakralarına {n} gündür bakmadın. Bugün birine birkaç dakika ayır.", "Bedenindeki enerji merkezleri seni bekliyor. Bugün kısa bir çakra dinlemesi yap."],
      aynaNever: ["İçsel Ayna'yı henüz hiç denemedin. Aklındaki tek bir soruyla başla.", "Bir sorun, bir merak ya da bir rüya: Ayna seni dinlemeye hazır."],
      aynaGap: ["Ayna'ya {n} gündür soru sormadın. Bugün içinden geçen bir şeyi sor.", "Son sorundan bu yana {n} gün geçti. Bugün Ayna'ya dönmek ister misin?"],
      letterSoon: ["Niyet mektubunun açılmasına {n} gün kaldı. O niyeti bugün hatırla.", "Mühürlü mektubun sabırla bekliyor: {n} gün sonra açılacak."],
      letterReady: ["Niyet mektubun açılmaya hazır. Onu bugün aç ve hediyeni al.", "21 gün doldu. Kendine yazdığın mektup seni bekliyor."],
      noLetter: ["21 gün sonraki kendine bir mektup yazmak ister misin? Bugün bir niyet mühürle.", "Bir niyet yaz, mühürle, 21 gün sonra aç. Küçük bir ritüel, büyük bir hatırlatma."],
      streak: ["Serin {n} gün oldu. Bugün de küçük bir adımla zinciri koru.", "{n} gündür kendine zaman ayırıyorsun. Bu emeği bugün de sürdür."],
    },
    ask: [
      "Bugün neye evet dedin, neye hayır demek isterdin?",
      "Şu an bedeninde en çok nerede gerginlik var? Oraya bir nefes gönder.",
      "Bugün seni en çok ne besledi?",
      "Bugün kendin için yapabileceğin en küçük iyilik ne?",
      "Bu hafta neyi bırakmak sana hafiflik verir?",
      "Bugün kime teşekkür etmek istersin?",
      "Son bir saatte kaç kez nefesini tuttun? Şimdi bir kez bırak.",
      "Bugün hangi düşünce seni en çok yordu? Onu bir kenara koy.",
      "Kendine bugün hangi sözü verebilirsin?",
      "Şu an gerçekten neye ihtiyacın var: dinlenmeye mi, harekete mi?",
      "Bugün seni ne gülümsetti?",
      "Hangi alışkanlığın sana artık hizmet etmiyor?",
      "Bugün kalbini hafifletecek bir cümle yaz.",
      "Sevdiğin birine bugün ne söylemek istersin?",
      "Bugün kendini neyle suçladın? Onu şefkatle bırak.",
      "Şu anki halini tek bir kelimeyle anlat.",
      "Bugün ertelediğin şey seni korkutuyor mu, yoksa yoruyor mu?",
      "Bu akşam kendine nasıl bir dinlenme hediye edebilirsin?",
      "Bugün neyi fark etmeden geçtin? Bir dakika etrafına bak.",
      "Yarın sabah kendine ne demek istersin?",
    ],
  },
  en: {
    el: {
      ates: {
        dom: [
          "Your inner fire may burn fast today. Pause for one minute with 4-6 breaths before you act.",
          "Your energy is high; give it to one task instead of scattering it. What's the one thing you'll finish today?",
          "For fire-dominant charts, slowing down is the best medicine. Try 5 minutes of diaphragm breathing tonight.",
        ],
        lack: [
          "Fire is low in your chart. Show a little courage today: send the message you've been putting off.",
          "To grow your inner spark, move your body today; a 10-minute walk is enough.",
        ],
      },
      toprak: {
        dom: [
          "Your earth element is strong: stability is your gift. Stretch a routine a little today and try something new.",
          "You stand firm, just don't harden. Put on a frequency today and let your body rest in sound.",
          "Earth-dominant people carry a lot. Put one load down today: what could you hand over?",
        ],
        lack: [
          "Earth is low in your chart. Come back to your body today: stand barefoot or breathe slowly for 5 minutes.",
          "Your root chakra is open to support today. Give it a few minutes on the chakra screen.",
        ],
      },
      hava: {
        dom: [
          "Your mind is quick and full of ideas. Pick one today and make it real with a small step.",
          "Air-dominant charts think a lot. Take 3 deep breaths to bring thought down into the body.",
          "Today, notice what you feel rather than what you'll say. Stay silent for a minute.",
        ],
        lack: [
          "Air is low in your chart. Put what's inside into words today: ask the Mirror the question on your mind.",
          "Seeing something from another angle may help today. Ask someone a curious question.",
        ],
      },
      su: {
        dom: [
          "Your feelings run deep. Before carrying someone else's emotion today, name your own.",
          "For water-dominant charts, a boundary is a form of compassion. Say a gentle 'no' today.",
          "Let your feelings flow: put on 528 Hz today and simply listen for a few minutes.",
        ],
        lack: [
          "Water is low in your chart. Ask yourself today: what am I truly feeling right now?",
          "Make room in your heart: send someone a sincere thank-you today.",
        ],
      },
    },
    day: {
      1: ["Today is your personal day 1: a day of beginnings. Take the first step you've been thinking about.", "Day 1 asks for courage. Make one decision for yourself today."],
      2: ["Today is your personal day 2: cooperation and patience. Don't rush; listen to someone.", "Day 2 is a gentle day. Take care of one of your relationships today."],
      3: ["Today is your personal day 3: a day of expression. Write, draw, speak; let it out.", "Day 3 carries joy. Make time for something that makes you laugh."],
      4: ["Today is your personal day 4: a day of order. Finish something left half-done.", "Day 4 lays foundations. One small but solid step is enough today."],
      5: ["Today is your personal day 5: a day of change. Try something outside your routine.", "Day 5 wants freedom. Notice one of your patterns today and loosen it."],
      6: ["Today is your personal day 6: love and responsibility. Spend time with someone you love.", "Day 6 nourishes home. Show yourself some kindness too."],
      7: ["Today is your personal day 7: a day of reflection. A few minutes of silence will guide you.", "Day 7 is for going deeper. Ask the Mirror the question that comes from within."],
      8: ["Today is your personal day 8: strength and effort. Don't hesitate to ask for what you deserve.", "Day 8 brings results. Give your energy to your most important task."],
      9: ["Today is your personal day 9: closing and letting go. Release something you no longer carry.", "Day 9 is a day of completion. Close a cycle with gratitude today."],
    },
    moon: [
      ["New moon energy: a good time to plant an intention. Write one intention today.", "The dark moon invites rest. Asking little of yourself today is enough."],
      ["The moon has begun to grow. Add one small action to your intention.", "The crescent is like a sprout: water what you started with patience."],
      ["First quarter: if an obstacle appears, don't give up, change direction.", "The moon is half full. Take a determined step today."],
      ["The moon is nearly full. Fine-tune what you've been working on.", "Energy rises toward the full moon. Stay balanced with your breath today."],
      ["Full moon: celebrate what you see, release what is too much.", "Emotions rise at the full moon. Be soft with yourself today."],
      ["The moon has begun to wane. Share something you've learned with someone.", "A time for gratitude: write down three things that nourish you."],
      ["Last quarter: a good moment to let go of what isn't working.", "As the moon wanes, lighten your load. Simplify one thing today."],
      ["The quiet before the dark moon: turn inward and rest.", "The cycle is closing. Give yourself permission to rest today."],
    ],
    use: {
      breathGap: ["You haven't done a breath practice for {n} days. Even one minute of breathing makes a difference today.", "It's been {n} days since you visited your breath. Would you like to take 5 breaths now?"],
      soundGap: ["You haven't returned to the sound frequencies for {n} days. A 3-minute frequency may help today.", "Put your headphones on and close your eyes: a sound break that's been waiting for {n} days."],
      chakraGap: ["You haven't checked in with your chakras for {n} days. Give one of them a few minutes today.", "The energy centers in your body are waiting. Do a short chakra listening today."],
      aynaNever: ["You haven't tried the Inner Mirror yet. Start with just one question on your mind.", "A problem, a curiosity or a dream: the Mirror is ready to listen."],
      aynaGap: ["You haven't asked the Mirror anything for {n} days. Ask about something on your mind today.", "It's been {n} days since your last question. Would you like to return to the Mirror today?"],
      letterSoon: ["Your intention letter opens in {n} days. Remember that intention today.", "Your sealed letter is waiting patiently: it opens in {n} days."],
      letterReady: ["Your intention letter is ready to open. Open it today and receive your gift.", "21 days have passed. The letter you wrote to yourself is waiting."],
      noLetter: ["Would you like to write a letter to yourself 21 days from now? Seal an intention today.", "Write an intention, seal it, open it in 21 days. A small ritual, a big reminder."],
      streak: ["Your streak is {n} days. Keep the chain going with one small step today.", "You've made time for yourself for {n} days. Keep that effort going today."],
    },
    ask: [
      "What did you say yes to today, and what would you have liked to say no to?",
      "Where in your body is there the most tension right now? Send a breath there.",
      "What nourished you most today?",
      "What's the smallest kindness you could do for yourself today?",
      "What would feel lighter to let go of this week?",
      "Who would you like to thank today?",
      "How many times did you hold your breath in the last hour? Let it go once now.",
      "Which thought tired you most today? Set it aside.",
      "What promise can you make to yourself today?",
      "What do you truly need right now: rest or movement?",
      "What made you smile today?",
      "Which habit no longer serves you?",
      "Write one sentence that would lighten your heart today.",
      "What would you like to say to someone you love today?",
      "What did you blame yourself for today? Let it go with kindness.",
      "Describe how you are right now in a single word.",
      "Does the thing you postponed today scare you, or tire you?",
      "What kind of rest could you gift yourself this evening?",
      "What did you pass by without noticing today? Look around for a minute.",
      "What would you like to say to yourself tomorrow morning?",
    ],
  },
};

const COACH = { ...COACH_BASE, ...(COACH_MORE || {}) };

// Kategorinin dokununca açacağı ekran.
const EL_TARGET = {
  ates:   { dom: { screen: "nefes" }, lack: { screen: "gun" } },
  toprak: { dom: { screen: "ses" },   lack: { screen: "chakra" } },
  hava:   { dom: { screen: "nefes" }, lack: { screen: "rehber" } },
  su:     { dom: { screen: "ses" },   lack: { screen: "rehber" } },
};
const USE_TARGET = {
  breathGap: { screen: "nefes" }, soundGap: { screen: "ses" }, chakraGap: { screen: "chakra" },
  aynaNever: { screen: "rehber" }, aynaGap: { screen: "rehber" },
  letterSoon: { screen: "harita" }, letterReady: { screen: "harita" }, noLetter: { screen: "harita" },
  streak: { screen: "mandala" },
};

// ── Deterministik rastgelelik ───────────────────────────────────────────────
function hash32(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x9e3779b9) >>> 0; s ^= s >>> 13; return (s >>> 0) / 4294967296; };
}
// KARIŞTIRILMIŞ TORBA: k. kullanım için öğe. Aynı turda tekrar YOK, her tur
// (floor(k/N)) farklı bir karışık sıra. `k` gün numarası gibi artan bir sayaç.
export function bagPick(arr, key, k) {
  const n = arr.length;
  if (!n) return null;
  const cycle = Math.floor(k / n), pos = ((k % n) + n) % n;
  const r = rng(hash32(`${key}|${cycle}`));
  const idx = arr.map((_, i) => i);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return arr[idx[pos]];
}

// TAZE SEÇİM: torbadaki sıradan başlayıp YAKIN ZAMANDA GİTMİŞ cümleleri atlar
// (recent = son günlerde planlanan metinler). Hepsi yakın zamanda gittiyse null.
export function bagPickFresh(arr, key, k, recent) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    const t = bagPick(arr, key, k + i);
    if (!recent || !recent.has(t)) return t;
  }
  return null;
}

// ── Veri okuma (yalnızca yerel) ─────────────────────────────────────────────
const _ls = (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } };
function ymd(d) { const p = (x) => String(x).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; }
function daysAgo(n, from = new Date()) { return new Date(from.getFullYear(), from.getMonth(), from.getDate() - n); }
// Bir günlük sayaç anahtarının (prefix + tarih) son dolu olduğu günden bu yana
// geçen gün (bugün dahil). 60 gün içinde hiç yoksa null.
function gapDays(prefix) {
  for (let i = 0; i < 60; i++) {
    const v = parseInt(_ls(prefix + ymd(daysAgo(i))) || "0", 10);
    if (v > 0) return i;
  }
  return null;
}
const SIGN_EL = ["ates", "toprak", "hava", "su"]; // Koç, Boğa, İkizler, Yengeç... sırasıyla döner
function sunSignElement(birthDate) {
  // Tropikal burç sınırları (yaklaşık, gün hassasiyeti yeterli).
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate || "");
  if (!m) return null;
  const mo = +m[2], da = +m[3];
  const starts = [[3, 21], [4, 20], [5, 21], [6, 21], [7, 23], [8, 23], [9, 23], [10, 23], [11, 22], [12, 22], [1, 20], [2, 19]];
  let sign = 11; // Balık
  for (let i = 0; i < 12; i++) {
    const [sm, sd] = starts[i], [nm, nd] = starts[(i + 1) % 12];
    const after = mo > sm || (mo === sm && da >= sd);
    const before = mo < nm || (mo === nm && da < nd);
    if (sm < nm ? (after && before) : (after || before)) { sign = i; break; }
  }
  return SIGN_EL[sign % 4];
}
function elementProfile(birthDate) {
  let dist = null;
  try { dist = JSON.parse(_ls("sakin_element_dist") || "null"); } catch (_) {}
  const keys = ["ates", "toprak", "hava", "su"];
  if (dist && keys.some(k => (dist[k] || 0) > 0)) {
    const dom = keys.reduce((a, k) => ((dist[k] || 0) > (dist[a] || 0) ? k : a), "ates");
    const lack = keys.reduce((a, k) => ((dist[k] || 0) < (dist[a] || 0) ? k : a), "ates");
    return { dom, lack: lack !== dom ? lack : null };
  }
  const se = sunSignElement(birthDate);
  return se ? { dom: se, lack: null } : null;
}
function reduceNum(n) { while (n > 9) n = String(n).split("").reduce((a, c) => a + +c, 0); return n; }
function personalDay(birthDate, day) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate || "");
  if (!m) return null;
  const py = reduceNum(reduceNum(+m[2]) + reduceNum(+m[3]) + reduceNum(day.getFullYear()));
  const pm = reduceNum(py + day.getMonth() + 1);
  return reduceNum(pm + day.getDate());
}
function moonIndex(day) {
  const ref = Date.UTC(2000, 0, 6, 18, 14); // bilinen yeni ay
  const age = (((day.getTime() + 12 * 3600e3 - ref) / 86400000) % 29.530588 + 29.530588) % 29.530588;
  return Math.floor(((age / 29.530588) * 8) + 0.5) % 8;
}

// Kullanım özeti: planlayıcı çağrıldığı an (günde bir, uygulama açılınca).
export function usageSnapshot() {
  let arsiv = [];
  try { arsiv = JSON.parse(_ls("sakin_ayna_arsiv") || "[]"); } catch (_) {}
  const lastAyna = arsiv[0] && arsiv[0].zaman ? Math.floor((Date.now() - Date.parse(arsiv[0].zaman)) / 86400000) : null;
  let letter = null;
  try { letter = JSON.parse(_ls("sakin_niyet_letter") || "null"); } catch (_) {}
  let streak = null;
  try { streak = JSON.parse(_ls("sakin_streak") || "null"); } catch (_) {}
  return {
    breath: gapDays("sakin_breath_"), sound: gapDays("sakin_freq_sec_"), chakra: gapDays("sakin_terapi_sec_"),
    aynaCount: arsiv.length, aynaGap: lastAyna,
    letter: letter ? { opensAt: letter.opensAt, openedAt: letter.openedAt || null } : null,
    streak: streak && streak.current ? streak.current : 0,
  };
}

// Uygulamayı en sık açtığı saat (son 40 açılış): koç mesajı o saate yakın gelir.
export function recordOpenHour() {
  try {
    const arr = JSON.parse(_ls("sakin_open_hours") || "[]");
    arr.push(new Date().getHours());
    localStorage.setItem("sakin_open_hours", JSON.stringify(arr.slice(-40)));
  } catch (_) {}
}
export function preferredHour() {
  let arr = [];
  try { arr = JSON.parse(_ls("sakin_open_hours") || "[]"); } catch (_) {}
  if (arr.length < 5) return null;
  const c = {}; arr.forEach(h => { c[h] = (c[h] || 0) + 1; });
  const h = +Object.keys(c).reduce((a, k) => (c[k] > (c[a] || 0) ? k : a), Object.keys(c)[0]);
  return h;
}

// ── Günün koç mesajı ────────────────────────────────────────────────────────
// d: bugünden kaç gün sonrası (0 = bugün). Kullanım boşlukları o güne kadar
// hareketsiz kalınacağı varsayılarak ilerletilir (her açılışta yeniden kurulur).
// prevCat: bir önceki günün kategorisi (dinlenir).
export function coachMessage({ lang, birthDate, day, d, dn, usage, seed, prevCat, pdFn, recent }) {
  const T = COACH[lang] || COACH.en;
  const E = COACH.en;
  const cands = [];
  const add = (cat, w, arr, extra, n) => { if (arr && arr.length) cands.push({ cat, w, arr, extra, n }); };
  const grow = (g) => (g == null ? null : g + d);
  const u = usage || {};
  const U = (k) => (T.use && T.use[k]) || E.use[k];
  // Kullanım: eşik aşılınca yüksek puan.
  const bg = grow(u.breath); if (bg != null && bg >= 3) add("breathGap", 4 + Math.min(bg, 10) / 3, U("breathGap"), USE_TARGET.breathGap, bg);
  const sg = grow(u.sound); if (sg != null && sg >= 4) add("soundGap", 3 + Math.min(sg, 10) / 4, U("soundGap"), USE_TARGET.soundGap, sg);
  const cg = grow(u.chakra); if (cg != null && cg >= 5) add("chakraGap", 2.5, U("chakraGap"), USE_TARGET.chakraGap, cg);
  if (birthDate) {
    if (!u.aynaCount) add("aynaNever", 3.5, U("aynaNever"), USE_TARGET.aynaNever);
    else { const ag = grow(u.aynaGap); if (ag != null && ag >= 6) add("aynaGap", 3, U("aynaGap"), USE_TARGET.aynaGap, ag); }
  }
  if (u.letter && !u.letter.openedAt) {
    const left = Math.ceil((u.letter.opensAt - day.getTime()) / 86400000);
    if (left <= 0) add("letterReady", 6, U("letterReady"), USE_TARGET.letterReady);
    else if (left <= 3) add("letterSoon", 4, U("letterSoon"), USE_TARGET.letterSoon, left);
  } else if (!u.letter) add("noLetter", 1.2, U("noLetter"), USE_TARGET.noLetter);
  const st = u.streak ? u.streak + d : 0;
  if (u.streak >= 2) add("streak", 1.8, U("streak"), USE_TARGET.streak, st);
  // Harita.
  if (birthDate) {
    const ep = elementProfile(birthDate);
    const EL = (T.el || E.el);
    if (ep && EL[ep.dom]) add("elDom", 2.6, EL[ep.dom].dom, EL_TARGET[ep.dom].dom);
    if (ep && ep.lack && EL[ep.lack]) add("elLack", 2.2, EL[ep.lack].lack, EL_TARGET[ep.lack].lack);
    // Bugün ekranıyla AYNI sayı çıksın diye host kendi fonksiyonunu verir.
    const pdn = (pdFn ? pdFn(birthDate, day) : personalDay(birthDate, day));
    const dayArr = pdn ? ((T.day || E.day)[pdn > 9 ? reduceNum(pdn) : pdn]) : null;
    if (dayArr) add("day", 2.8, dayArr, { screen: "bugun" });
  }
  add("moon", 1.6, (T.moon || E.moon)[moonIndex(day)], { screen: "bugun" });
  add("ask", 1.5, T.ask || E.ask, { screen: "mandala" });

  // Her aday için TAZE metin: yakın zamanda gitmiş cümleler atlanır; taze
  // metni kalmayan kategori o gün geri çekilir (neredeyse hiç seçilmez).
  for (const c of cands) {
    c.text = bagPickFresh(c.arr, `${seed}|${c.cat}`, dn, recent);
    if (!c.text) { c.text = bagPick(c.arr, `${seed}|${c.cat}`, dn); c.w *= 0.08; }
  }
  // Önceki günün kategorisi dinlenir (yalnızca başka aday varsa).
  const pool = cands.length > 1 ? cands.filter(c => c.cat !== prevCat) : cands;
  const r = rng(hash32(`${seed}|koc|${dn}`));
  const total = pool.reduce((a, c) => a + c.w, 0);
  let x = r() * total, ch = pool[0];
  for (const c of pool) { x -= c.w; if (x <= 0) { ch = c; break; } }
  if (!ch) return null;
  const text = ch.text;
  if (!text) return null;
  return { cat: ch.cat, body: String(text).replace("{n}", String(ch.n != null ? ch.n : "")), extra: ch.extra };
}
