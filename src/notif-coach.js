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
// ⚠️ RAHATLAT, GÖREV VERME (kullanıcı, Eyl 2026): metin ortam ("sessiz bir yerde"),
// süre ("5 dakika ayır"), iş ("bitir", "yaz", "mesaj gönder", "yürüyüşe çık") ya da
// suçluluk ("{n} gündür yapmadın") İSTEMEZ. Okuyan işte ya da yoğun olabilir. Ya
// ferahlatan bir cümle ya da olduğu yerde tek nefeslik bir izin; özelliğe davet
// "ne zaman istersen burada" yumuşaklığında.
import { COACH_MORE } from "./notif-coach-i18n.js";

const COACH_BASE = {
  tr: {
    el: {
      ates: {
        dom: [
          "İçindeki ateş bugün hızlı yanabilir. Tek bir yavaş nefes, onu ısıtan bir ışığa çevirir.",
          "Enerjin bugün canlı. Her şeye yetişmen gerekmiyor; hız da senin, nefes de.",
          "Ateşi baskın olanlar için yavaşlamak bir armağandır. Nefesin istediğin an burada.",
        ],
        lack: [
          "Haritanda ateş az. İçindeki kıvılcım sessiz olsa da orada; küçük bir cesaret bile ona yeter.",
          "İçindeki kıvılcım küçük hareketlerle canlanır. Omuzlarını bir kez oynatmak bile ona iyi gelir.",
        ],
      },
      toprak: {
        dom: [
          "Toprak elementin güçlü: istikrar senin armağanın. Bugün biraz esneklik de sana yakışır.",
          "Sağlam duruyorsun, biraz da yumuşayabilirsin. Frekanslar, bedenini sese bırakmak istediğinde burada.",
          "Toprak baskın olanlar çok taşır. Her şeyi sen tutmak zorunda değilsin, omuzların biraz inebilir.",
        ],
        lack: [
          "Haritanda toprak az. Ayaklarının yere değdiğini fark etmek bile seni topraklar.",
          "Kök çakran bugün desteğe açık. Çakra ekranı, ne zaman istersen seni bekliyor.",
        ],
      },
      hava: {
        dom: [
          "Zihnin hızlı, fikirlerin bol. Hepsini bugün yakalaman gerekmiyor, iyi olanlar geri gelir.",
          "Hava baskın olanlar çok düşünür. Tek bir derin nefes, düşünceyi yavaşça bedene indirir.",
          "Bugün söyleyeceklerinden çok hissettiklerin önemli. Onları fark etmek için sessizliğe bile gerek yok.",
        ],
        lack: [
          "Haritanda hava az. İçindekini söze dökmek istersen Ayna seni dinlemeye hazır.",
          "Bir şeyi farklı bir açıdan görmek bugün iyi gelebilir. Merak, zihnine hafiflik getirir.",
        ],
      },
      su: {
        dom: [
          "Duyguların derin akıyor. Başkalarının duygusunu taşırken kendininkine de yer var.",
          "Su elementi baskın olanlar için sınır bir şefkat biçimidir. Nazik bir 'hayır' da sevgidir.",
          "Duyguların akmak isterse 528 Hz burada, ne zaman istersen.",
        ],
        lack: [
          "Haritanda su az. Bugün kendine şunu sor: şu an gerçekte ne hissediyorum?",
          "Haritanda su az. Kalbin yumuşadıkça duyguların da kendi yolunu bulur.",
        ],
      },
    },
    day: {
      1: ["Bugün kişisel 1 günün: başlangıçlar günü. Yeni bir şeyin tohumu sende, acele etmeden filizlenir.", "1 günü cesaret taşır. İçindeki ses bugün biraz daha net duyulabilir."],
      2: ["Bugün kişisel 2 günün: iş birliği ve sabır. Acele etmene gerek yok, her şey kendi zamanında.", "2 günü yumuşaklık günü. Bugün yumuşak kalmak, güçlü görünmekten daha kolay gelebilir."],
      3: ["Bugün kişisel 3 günün: ifade günü. İçindeki neşe kendiliğinden dışarı taşabilir.", "3 günü neşe taşır. Küçük bir gülümseme bile bugün çok şey değiştirir."],
      4: ["Bugün kişisel 4 günün: düzen günü. Her şey yavaş yavaş yerine oturuyor, zorlamana gerek yok.", "4 günü temel atar. Bugün küçük ama sağlam bir adım yeter."],
      5: ["Bugün kişisel 5 günün: değişim günü. Beklenmedik olana biraz alan bırakmak iyi gelebilir.", "5 günü özgürlük taşır. Bugün kendine biraz daha geniş bir alan tanıyabilirsin."],
      6: ["Bugün kişisel 6 günün: sevgi ve sorumluluk. Verdiğin sevgi bugün sana da dönüyor.", "6 günü yuvayı besler. Bugün kendine de şefkat göster."],
      7: ["Bugün kişisel 7 günün: iç gözlem günü. Kalabalığın ortasında bile iç sesin seninle.", "7 günü derinleşmek içindir. İçinden bir soru geçerse Ayna seni dinlemeye hazır."],
      8: ["Bugün kişisel 8 günün: güç ve emek. Hak ettiğin şeyi istemekten çekinme.", "8 günü sonuç getirir. Emeğinin karşılığı, sen henüz görmesen de yolda."],
      9: ["Bugün kişisel 9 günün: kapanış ve bırakış. Artık taşıman gerekmeyen bir şey varsa, bırakabilirsin.", "9 günü tamamlanma günü. Bir döngü şükranla, kendiliğinden kapanıyor."],
    },
    moon: [
      ["Yeni ay enerjisi: bir niyet ekmek için güzel bir zaman. Aklından geçen bir dilek bile yeter.", "Karanlık ay dinlenmeye çağırır. Bugün kendine az şey yüklemen yeterli."],
      ["Ay büyümeye başladı. Niyetin de sessizce, kendi hızında büyüyor.", "Hilal bir filiz gibi: başladığın şey sabırla, kendi zamanında büyür."],
      ["İlk dördün: bir engel çıkarsa yön değiştirmek de ilerlemektir.", "Ay yarıya geldi. Yolun yarısında soluklanmak da yolun parçası."],
      ["Ay dolmaya yaklaşıyor. Emek verdiğin şeyler olgunlaşıyor, sen de dinlenebilirsin.", "Dolunaya doğru enerji artar. Tek bir yavaş nefes seni dengede tutar."],
      ["Dolunay: gördüğünü kutla, fazlasını bırak.", "Dolunayda duygular yükselir. Bugün kendine karşı yumuşak ol."],
      ["Ay küçülmeye başladı. Öğrendiklerin sende kalıyor, yükler hafifliyor.", "Şükran zamanı: seni besleyen şeyler sandığından da yakın."],
      ["Son dördün: ne işe yaramıyorsa bırakmak için güzel bir an.", "Ay azalırken yükün de azalabilir. Bugün her şeyi taşıman gerekmiyor."],
      ["Ay kararmadan önceki sessizlik: içe dön, dinlen.", "Döngü kapanıyor. Bugün kendine dinlenme izni ver."],
    ],
    use: {
      breathGap: ["Aradan {n} gün geçti, hiç sorun değil. Tek bir nefes bile seni yeniden buraya getirir.", "Nefes ekranı {n} gündür sessiz ama hep burada. Ne zaman istersen, bir nefes uzağında."],
      soundGap: ["Frekanslar {n} gündür seni bekliyor, acelesi yok. İstediğin an bir ses seni yumuşatabilir.", "Sesler {n} gündür burada, sen neredeysen oraya eşlik etmeye hazır."],
      chakraGap: ["Çakraların {n} gündür dinleniyor. Ne zaman istersen, bir dokunuş uzağındalar.", "Bedenindeki enerji merkezleri sabırla bekliyor. Acele yok, istediğin an buradalar."],
      aynaNever: ["İçsel Ayna seni tanımak için sabırla bekliyor. Aklına bir soru gelirse, o hazır.", "Bir sorun, bir merak ya da bir rüya: Ayna seni dinlemeye hazır."],
      aynaGap: ["Ayna {n} gündür sessiz, hiç sorun değil. İçinden bir şey geçerse seni dinlemeye hazır.", "Son sorundan bu yana {n} gün geçti. Bugün Ayna'ya dönmek ister misin?"],
      letterSoon: ["Niyet mektubunun açılmasına {n} gün kaldı. O niyet sessizce seninle yürüyor.", "Mühürlü mektubun sabırla bekliyor: {n} gün sonra açılacak."],
      letterReady: ["Niyet mektubun açılmaya hazır. Ne zaman istersen, hediyen de onunla seni bekliyor.", "21 gün doldu. Kendine yazdığın mektup seni bekliyor."],
      noLetter: ["21 gün sonraki kendine bir mektup yazmak ister misin? Canın isterse Niyet Mektubu burada.", "Bir niyet, bir mühür, 21 gün sonra bir açılış. Küçük bir ritüel, istediğin zaman."],
      streak: ["Serin {n} gün oldu. Güzel bir emek; bugün ne kadar yaparsan o kadarı yeter.", "{n} gündür kendine zaman ayırıyorsun. Bunu fark etmek bile güzel."],
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
      "Bugün seni en çok hangi küçük şey rahatlattı?",
      "Kalbini hafifletecek cümle hangisi? İçinden geçirmen yeter.",
      "Sevdiğin birine bugün ne söylemek istersin?",
      "Bugün kendini neyle suçladın? Onu şefkatle bırak.",
      "Şu anki halini tek bir kelimeyle anlat.",
      "Şu an omuzların nerede? Biraz inmelerine izin verebilirsin.",
      "Bu akşam kendine nasıl bir dinlenme hediye edebilirsin?",
      "Bugün neyi fark etmeden geçtin? Tek bir bakış bile güzelliği geri getirir.",
      "Yarın sabah kendine ne demek istersin?",
    ],
  },
  en: {
    el: {
      ates: {
        dom: [
          "Your inner fire may burn fast today. One slow breath turns it into a warming light.",
          "Your energy is lively today. You don't have to keep up with everything; the pace is yours, and so is the breath.",
          "For fire-dominant charts, slowing down is a gift. Your breath is here whenever you want it.",
        ],
        lack: [
          "Fire is low in your chart. Your inner spark is quiet, but it's there; even a little courage is enough for it.",
          "Your inner spark wakes with small movements. Even rolling your shoulders once is good for it.",
        ],
      },
      toprak: {
        dom: [
          "Your earth element is strong: stability is your gift. A little softness suits you today too.",
          "You stand firm, and you can soften a little too. The frequencies are here whenever you want to rest in sound.",
          "Earth-dominant people carry a lot. You don't have to hold everything; your shoulders can drop a little.",
        ],
        lack: [
          "Earth is low in your chart. Simply noticing your feet on the ground grounds you.",
          "Your root chakra is open to support today. The chakra screen is here whenever you like.",
        ],
      },
      hava: {
        dom: [
          "Your mind is quick and full of ideas. You don't need to catch them all today; the good ones come back.",
          "Air-dominant charts think a lot. One deep breath gently brings thought down into the body.",
          "Today, what you feel matters more than what you'll say. You don't even need silence to notice it.",
        ],
        lack: [
          "Air is low in your chart. If you'd like to put what's inside into words, the Mirror is ready to listen.",
          "Seeing something from another angle may feel good today. Curiosity brings lightness to the mind.",
        ],
      },
      su: {
        dom: [
          "Your feelings run deep. While you carry others' feelings, there is room for your own too.",
          "For water-dominant charts, a boundary is a form of compassion. A gentle 'no' is love too.",
          "If your feelings want to flow, 528 Hz is here, whenever you like.",
        ],
        lack: [
          "Water is low in your chart. Ask yourself today: what am I truly feeling right now?",
          "Water is low in your chart. As your heart softens, your feelings find their own way.",
        ],
      },
    },
    day: {
      1: ["Today is your personal day 1: a day of beginnings. The seed of something new is in you; it sprouts without hurry.", "Day 1 carries courage. Your inner voice may sound a little clearer today."],
      2: ["Today is your personal day 2: cooperation and patience. No need to rush; everything comes in its own time.", "Day 2 is a gentle day. Staying soft may come easier today than looking strong."],
      3: ["Today is your personal day 3: a day of expression. The joy inside you may spill out on its own.", "Day 3 carries joy. Even a small smile changes a lot today."],
      4: ["Today is your personal day 4: a day of order. Things are settling into place; no need to force them.", "Day 4 lays foundations. One small but solid step is enough today."],
      5: ["Today is your personal day 5: a day of change. Leaving a little room for the unexpected may feel good.", "Day 5 carries freedom. You can give yourself a little more room today."],
      6: ["Today is your personal day 6: love and responsibility. The love you give comes back to you today too.", "Day 6 nourishes home. Show yourself some kindness too."],
      7: ["Today is your personal day 7: a day of reflection. Even in the middle of a crowd, your inner voice is with you.", "Day 7 is for going deeper. If a question passes through you, the Mirror is ready to listen."],
      8: ["Today is your personal day 8: strength and effort. Don't hesitate to ask for what you deserve.", "Day 8 brings results. The fruit of your effort is on its way, even if you can't see it yet."],
      9: ["Today is your personal day 9: closing and letting go. If there's something you no longer need to carry, you can set it down.", "Day 9 is a day of completion. A cycle is closing gently, on its own, with gratitude."],
    },
    moon: [
      ["New moon energy: a good time to plant an intention. Even a wish passing through your mind is enough.", "The dark moon invites rest. Asking little of yourself today is enough."],
      ["The moon has begun to grow. Your intention is growing too, quietly, at its own pace.", "The crescent is like a sprout: what you started grows with patience, in its own time."],
      ["First quarter: if an obstacle appears, changing direction is also moving forward.", "The moon is half full. Catching your breath halfway is part of the path too."],
      ["The moon is nearly full. What you've worked on is ripening; you can rest too.", "Energy rises toward the full moon. One slow breath keeps you in balance."],
      ["Full moon: celebrate what you see, release what is too much.", "Emotions rise at the full moon. Be soft with yourself today."],
      ["The moon has begun to wane. What you've learned stays with you; the loads grow lighter.", "A time for gratitude: what nourishes you is closer than you think."],
      ["Last quarter: a good moment to let go of what isn't working.", "As the moon wanes, your load can lighten too. You don't have to carry everything today."],
      ["The quiet before the dark moon: turn inward and rest.", "The cycle is closing. Give yourself permission to rest today."],
    ],
    use: {
      breathGap: ["It's been {n} days, and that's completely fine. Even one breath brings you back here.", "The breath screen has been quiet for {n} days, but it's always here. Whenever you like, one breath away."],
      soundGap: ["The frequencies have waited {n} days, no hurry. Whenever you like, a sound can soften you.", "The sounds have been here for {n} days, ready to keep you company wherever you are."],
      chakraGap: ["Your chakras have been resting for {n} days. Whenever you like, they're one touch away.", "The energy centers in your body wait patiently. No rush; they're here whenever you like."],
      aynaNever: ["The Inner Mirror is patiently waiting to meet you. If a question comes to mind, it's ready.", "A problem, a curiosity or a dream: the Mirror is ready to listen."],
      aynaGap: ["The Mirror has been quiet for {n} days, and that's fine. If something passes through you, it's ready to listen.", "It's been {n} days since your last question. Would you like to return to the Mirror today?"],
      letterSoon: ["Days until your intention letter opens: {n}. That intention is quietly walking with you.", "Your sealed letter is waiting patiently. Days left: {n}."],
      letterReady: ["Your intention letter is ready to open. Whenever you like, your gift is waiting with it.", "21 days have passed. The letter you wrote to yourself is waiting."],
      noLetter: ["Would you like to write to yourself 21 days from now? If you feel like it, the Intention Letter is here.", "An intention, a seal, an opening 21 days later. A small ritual, whenever you like."],
      streak: ["Your streak is {n} days. That's lovely care; today, whatever you do is enough.", "You've made time for yourself for {n} days. Just noticing that feels good."],
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
      "Which small thing eased you most today?",
      "Which sentence would lighten your heart? Just thinking it is enough.",
      "What would you like to say to someone you love today?",
      "What did you blame yourself for today? Let it go with kindness.",
      "Describe how you are right now in a single word.",
      "Where are your shoulders right now? You can let them drop a little.",
      "What kind of rest could you gift yourself this evening?",
      "What did you pass by without noticing today? A single glance can bring the beauty back.",
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
const CONTENT_CATS = ["ask", "moon", "day"];
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
// fill: kalıbı gönderilecek metne çevirir ("{n}" doldurulur); tazelik DOLU metne
// bakılarak ölçülür (denetim: "{n} gün" kalıpları hiç tekrar sayılmıyordu).
export function bagPickFresh(arr, key, k, recent, fill) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    const t = bagPick(arr, key, k + i);
    if (!recent || !recent.has(fill ? fill(t) : t)) return t;
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
    let arr = JSON.parse(_ls("sakin_open_hours") || "[]");
    if (!Array.isArray(arr)) arr = [];
    arr.push(new Date().getHours());
    localStorage.setItem("sakin_open_hours", JSON.stringify(arr.slice(-40)));
  } catch (_) {}
}
export function preferredHour() {
  let arr = [];
  try { arr = JSON.parse(_ls("sakin_open_hours") || "[]"); } catch (_) {}
  if (!Array.isArray(arr)) return null;
  arr = arr.filter(h => Number.isInteger(h) && h >= 0 && h < 24);
  if (arr.length < 5) return null;
  const c = {}; arr.forEach(h => { c[h] = (c[h] || 0) + 1; });
  const h = +Object.keys(c).reduce((a, k) => (c[k] > (c[a] || 0) ? k : a), Object.keys(c)[0]);
  return h;
}

// ── Günün koç mesajı ────────────────────────────────────────────────────────
// d: bugünden kaç gün sonrası (0 = bugün). Kullanım boşlukları o güne kadar
// hareketsiz kalınacağı varsayılarak ilerletilir (her açılışta yeniden kurulur).
// prevCat: bir önceki günün kategorisi (dinlenir).
export function coachMessage({ lang, birthDate, day, d, dn, usage, seed, prevCat, pdFn, recent, skipCats }) {
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
  // Doğum yoksa Bugün doğum kapısına düşer: Bağlan'a gider.
  add("moon", 1.6, (T.moon || E.moon)[moonIndex(day)], { screen: birthDate ? "bugun" : "mandala" });
  add("ask", 1.5, T.ask || E.ask, { screen: "mandala" });

  // Her aday için TAZE metin: yakın zamanda gitmiş cümleler atlanır; taze
  // metni kalmayan kategori o gün geri çekilir (neredeyse hiç seçilmez).
  for (const c of cands) {
    c.text = bagPickFresh(c.arr, `${seed}|${c.cat}`, dn, recent, (t) => String(t).replace("{n}", String(c.n != null ? c.n : "")));
    if (!c.text) { c.text = bagPick(c.arr, `${seed}|${c.cat}`, dn); c.w *= 0.08; }
  }
  // Önceki günün kategorisi dinlenir (yalnızca başka aday varsa).
  // skipCats: o gün başka bir slotta aynı TEMA zaten gittiyse (host, aynı temadan
  // günde 1 kuralı) o kategoriler elenir; hiç aday kalmazsa eleme yok sayılır.
  const skip = Array.isArray(skipCats) ? skipCats : [];
  const cands2 = skip.length && cands.some(c => !skip.includes(c.cat)) ? cands.filter(c => !skip.includes(c.cat)) : cands;
  const pool = cands2.length > 1 ? cands2.filter(c => c.cat !== prevCat) : cands2;
  const r = rng(hash32(`${seed}|koc|${dn}`));
  const total = pool.reduce((a, c) => a + c.w, 0);
  let x = r() * total, ch = pool[0];
  for (const c of pool) { x -= c.w; if (x <= 0) { ch = c; break; } }
  if (!ch) return null;
  const text = ch.text;
  if (!text) return null;
  // Soru, Ay ve günün sayısı İÇERİK mesajı (bir pratiğe götürmüyor): note:1 ile
  // dokununca uygulama metnin tamamını kartta gösterir. Diğerleri özelliğe gider.
  const extra = CONTENT_CATS.includes(ch.cat) ? { ...ch.extra, note: 1 } : ch.extra;
  return { cat: ch.cat, body: String(text).replace("{n}", String(ch.n != null ? ch.n : "")), extra };
}
