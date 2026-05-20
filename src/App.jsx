import { useState, useEffect, useRef } from "react";
import { makeTrans } from "./i18n";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { StatusBar, Style } from "@capacitor/status-bar";
import { initStore, purchaseYearly, purchaseLifetime, restorePurchases, isSubscribed, onPurchaseUpdate, onProductsLoaded, areProductsLoaded } from "./purchases";
import { LocalNotifications } from "@capacitor/local-notifications";

const isNative = Capacitor.isNativePlatform();
const detectTablet = () => {
  const w = Math.max(window.innerWidth, window.innerHeight);
  if (w >= 768) {
    if (isNative) return true;
    if (/iPad/.test(navigator.userAgent)) return true;
    if (/Macintosh/.test(navigator.userAgent) && 'ontouchend' in document) return true;
    if (navigator.maxTouchPoints > 1 && w >= 768) return true;
  }
  return false;
};
let isTablet = detectTablet();
const haptic = (style = ImpactStyle.Light) => { if (isNative) Haptics.impact({ style }).catch(() => {}); };
if (isNative) StatusBar.setStyle({ style: Style.Dark }).catch(() => {});

const API_BASE = isNative ? "https://sakin.life" : "";
const AI_CALL_URL = API_BASE + "/.netlify/functions/ai-call";
const MAX_INPUT_LEN = 500;
const sanitizeInput = (str) => (str || "").slice(0, MAX_INPUT_LEN).replace(/[<>{}]/g, "");

const CHAKRAS_22_TR = [
  { name:"Kök",            color:"#c0392b", pastel:"#e8a09a", desc:"Bugün yere bas. Güvende hisset.",  element:"Toprak", emoji:"🟥", hz:396, level:1, konu:"Hayatta kalma ve güvenlik" },
  { name:"Sakral",         color:"#e67e22", pastel:"#f0c27f", desc:"Bugün hisset. Akmana izin ver.",   element:"Su",     emoji:"🟧", hz:417, level:1, konu:"Yaratıcılık ve duygusal denge" },
  { name:"Solar Pleksus",  color:"#f1c40f", pastel:"#f7e18a", desc:"Bugün güçlü ol. Işığın var.",     element:"Ateş",   emoji:"🟨", hz:528, level:1, konu:"İrade ve kişisel güç" },
  { name:"Kalp",           color:"#27ae60", pastel:"#82d9a3", desc:"Bugün kalbini sevgiyle aç.",       element:"Hava",   emoji:"🟩", hz:639, level:1, konu:"Sevgi ve şifa" },
  { name:"Boğaz",          color:"#2980b9", pastel:"#85c1e9", desc:"Bugün hakikatini söyle.",          element:"Ses",    emoji:"🟦", hz:741, level:1, konu:"İletişim ve ifade" },
  { name:"Üçüncü Göz",    color:"#8e44ad", pastel:"#aaaaaa", desc:"Bugün içeriye bak.",               element:"Işık",   emoji:"🟣", hz:852, level:1, konu:"Sezgi ve durugörü" },
  { name:"Taç",            color:"#9b59b6", pastel:"#d9b8e8", desc:"İlahi rehberliğe bağlan.",         element:"Evren",  emoji:"⬜", hz:963, level:1, konu:"İlahi rehberlik ve ruhsal farkındalık" },
  { name:"Ruh Yıldızı",         color:"#7e57c2", pastel:"#b39ddb", desc:"Karmik kalıplarını çöz.",           element:"Karma",     emoji:"✨", level:2, konu:"Karmik kalıpların çözüldüğü yer" },
  { name:"Yıldız Kapısı",       color:"#5c6bc0", pastel:"#9fa8da", desc:"Işık bedenine bağlan.",             element:"Işık Beden",emoji:"🌟", level:2, konu:"Işık bedenle bağlantı" },
  { name:"Güneş Çakrası",       color:"#f9a825", pastel:"#fff176", desc:"Eril enerjiyi bütünle.",            element:"Eril",      emoji:"☀️", level:2, konu:"Tanrısal eril enerjinin bütünleşmesi" },
  { name:"Ay Çakrası",          color:"#1b5e20", pastel:"#a5d6a7", desc:"Dişil enerjiyi bütünle.",           element:"Dişil",     emoji:"🌙", level:2, konu:"Tanrısal dişil enerjinin bütünleşmesi" },
  { name:"Mesih Çakrası",       color:"#fdd835", pastel:"#fff9c4", desc:"Koşulsuz sevgiyi hisset.",          element:"Birlik",    emoji:"💛", level:2, konu:"Koşulsuz sevgi ve birlik bilinci" },
  { name:"Yıldız İletişim",     color:"#0277bd", pastel:"#81d4fa", desc:"Galaktik varlıklarla bağ kur.",     element:"Galaktik",  emoji:"📡", level:2, konu:"Galaktik varlıklarla bağ kurma" },
  { name:"İlahi Plan",          color:"#4527a0", pastel:"#b39ddb", desc:"Evrensel teslimiyete aç.",          element:"Teslimiyet",emoji:"🕊️", level:2, konu:"Evrensel teslimiyet" },
  { name:"Monadik Bağlantı",    color:"#6a1b9a", pastel:"#ce93d8", desc:"Ruhun kaynağına eriş.",             element:"Monad",     emoji:"🔮", level:2, konu:"Ruhun kaynağına (Monad) erişim" },
  { name:"Yükseliş",            color:"#b0bec5", pastel:"#eceff1", desc:"İlk yükseliş adımını at.",          element:"Yükseliş",  emoji:"🪽", level:3, konu:"İlk yükseliş adımı" },
  { name:"Evrensel Işık",       color:"#cfd8dc", pastel:"#eceff1", desc:"Evrensel bilgiye eriş.",             element:"Bilgi",     emoji:"💫", level:3, konu:"Evrensel bilgiye erişim" },
  { name:"İlahi Niyet",         color:"#b0bec5", pastel:"#e0e0e0", desc:"Ruhun görevini tamamla.",            element:"Görev",     emoji:"🎯", level:3, konu:"Ruhun görevini tamamlama süreci" },
  { name:"Kozmik Enerji",       color:"#90a4ae", pastel:"#cfd8dc", desc:"Galaktik genişlemeye aç.",           element:"Kozmik",    emoji:"🌌", level:3, konu:"Galaktik genişleme" },
  { name:"Varlık",              color:"#b0bec5", pastel:"#e0e0e0", desc:"Saf varoluşu deneyimle.",            element:"Varoluş",   emoji:"🫧", level:3, konu:"Saf varoluş ve bütünleşme" },
  { name:"İlahi Yapı",          color:"#cfd8dc", pastel:"#eceff1", desc:"Evrensel yasalarla uyum.",            element:"Yasa",      emoji:"⚖️", level:3, konu:"Evrensel yasalarla uyum" },
  { name:"Kaynak",              color:"#e0e0e0", pastel:"#f5f5f5", desc:"Tanrısal kaynakla birleş.",          element:"Platin Işık",emoji:"☀️", level:3, konu:"Tanrısal kaynakla tam birleşme" },
];
const CHAKRAS_22_EN = [
  { name:"Root",            color:"#c0392b", pastel:"#e8a09a", desc:"Ground yourself. Feel safe.",          element:"Earth",      emoji:"🟥", hz:396, level:1, konu:"Survival and security" },
  { name:"Sacral",          color:"#e67e22", pastel:"#f0c27f", desc:"Feel today. Let yourself flow.",       element:"Water",      emoji:"🟧", hz:417, level:1, konu:"Creativity and emotional balance" },
  { name:"Solar Plexus",    color:"#f1c40f", pastel:"#f7e18a", desc:"Be strong today. Your light shines.", element:"Fire",       emoji:"🟨", hz:528, level:1, konu:"Willpower and personal power" },
  { name:"Heart",           color:"#27ae60", pastel:"#82d9a3", desc:"Open your heart with love.",          element:"Air",        emoji:"🟩", hz:639, level:1, konu:"Love and healing" },
  { name:"Throat",          color:"#2980b9", pastel:"#85c1e9", desc:"Speak your truth today.",              element:"Sound",      emoji:"🟦", hz:741, level:1, konu:"Communication and expression" },
  { name:"Third Eye",       color:"#8e44ad", pastel:"#aaaaaa", desc:"Look inward today.",                  element:"Light",      emoji:"🟣", hz:852, level:1, konu:"Intuition and clairvoyance" },
  { name:"Crown",           color:"#9b59b6", pastel:"#d9b8e8", desc:"Connect with divine guidance.",       element:"Universe",   emoji:"⬜", hz:963, level:1, konu:"Divine guidance and spiritual awareness" },
  { name:"Soul Star",       color:"#7e57c2", pastel:"#b39ddb", desc:"Dissolve karmic patterns.",           element:"Karma",      emoji:"✨", level:2, konu:"Where karmic patterns dissolve" },
  { name:"Stargate",        color:"#5c6bc0", pastel:"#9fa8da", desc:"Connect with your light body.",       element:"Light Body", emoji:"🌟", level:2, konu:"Light body connection" },
  { name:"Solar Chakra",    color:"#f9a825", pastel:"#fff176", desc:"Integrate masculine energy.",         element:"Masculine",  emoji:"☀️", level:2, konu:"Integration of divine masculine energy" },
  { name:"Lunar Chakra",    color:"#1b5e20", pastel:"#a5d6a7", desc:"Integrate feminine energy.",          element:"Feminine",   emoji:"🌙", level:2, konu:"Integration of divine feminine energy" },
  { name:"Christ Chakra",   color:"#fdd835", pastel:"#fff9c4", desc:"Feel unconditional love.",            element:"Unity",      emoji:"💛", level:2, konu:"Unconditional love and unity consciousness" },
  { name:"Star Comm",       color:"#0277bd", pastel:"#81d4fa", desc:"Connect with galactic beings.",      element:"Galactic",   emoji:"📡", level:2, konu:"Connection with galactic beings" },
  { name:"Divine Plan",     color:"#4527a0", pastel:"#b39ddb", desc:"Open to universal surrender.",       element:"Surrender",  emoji:"🕊️", level:2, konu:"Universal surrender" },
  { name:"Monadic Link",    color:"#6a1b9a", pastel:"#ce93d8", desc:"Access the soul's source.",           element:"Monad",      emoji:"🔮", level:2, konu:"Access to the soul's source (Monad)" },
  { name:"Ascension",       color:"#b0bec5", pastel:"#eceff1", desc:"Take the first ascension step.",     element:"Ascension",  emoji:"🪽", level:3, konu:"First step of ascension" },
  { name:"Universal Light", color:"#cfd8dc", pastel:"#eceff1", desc:"Access universal knowledge.",        element:"Knowledge",  emoji:"💫", level:3, konu:"Access to universal knowledge" },
  { name:"Divine Intent",   color:"#b0bec5", pastel:"#e0e0e0", desc:"Complete the soul's mission.",       element:"Mission",    emoji:"🎯", level:3, konu:"The soul's mission completion" },
  { name:"Cosmic Energy",   color:"#90a4ae", pastel:"#cfd8dc", desc:"Open to galactic expansion.",        element:"Cosmic",     emoji:"🌌", level:3, konu:"Galactic expansion" },
  { name:"Being",           color:"#b0bec5", pastel:"#e0e0e0", desc:"Experience pure existence.",          element:"Existence",  emoji:"🫧", level:3, konu:"Pure existence and integration" },
  { name:"Divine Structure",color:"#cfd8dc", pastel:"#eceff1", desc:"Align with universal laws.",         element:"Law",        emoji:"⚖️", level:3, konu:"Alignment with universal laws" },
  { name:"Source",          color:"#e0e0e0", pastel:"#f5f5f5", desc:"Unite with the divine source.",      element:"Platinum Light",emoji:"☀️",level:3, konu:"Complete union with the divine source" },
];
const getChakras7 = (lang) => (lang === "en" ? CHAKRAS_22_EN : CHAKRAS_22_TR).filter(c => c.level === 1);
const getChakras22 = (lang) => lang === "en" ? CHAKRAS_22_EN : CHAKRAS_22_TR;
const CHAKRAS_7 = CHAKRAS_22_TR.filter(c => c.level === 1);
const LEVEL_LABELS_TR = { 1:"Fiziksel Boyut", 2:"Ruhsal Boyut", 3:"İlahi & Kozmik Boyut" };
const LEVEL_LABELS_EN = { 1:"Physical Dimension", 2:"Spiritual Dimension", 3:"Divine & Cosmic Dimension" };
const LEVEL_RANGES_TR = { 1:"Çakra 1–7", 2:"Çakra 8–15", 3:"Çakra 16–22" };
const LEVEL_RANGES_EN = { 1:"Chakra 1–7", 2:"Chakra 8–15", 3:"Chakra 16–22" };
const TERAPI_TOTAL = 60;

const FREQ_DATA_TR = [
  { hz:174, name:"Toprak Frekansı", color:"#8B6914", pastel:"#d4b896", icon:"🌍",
    tema:"Topraklanma · Güvenlik", bird:"guguk",
    aciklama:"174 Hz bedenin en derin katmanlarına iner. Güvenlik ve topraklanma hissini destekler. Dinleyenler genelde ayaklarının yere basma hissinin güçlendiğini, omuzlardaki gerginliğin çözüldüğünü deneyimler.",
    etkiler:["Derin rahatlama","Güvenlik hissi","Topraklanma","Kas gerilimini bırakma"] },
  { hz:285, name:"Enerji Yenileyici", color:"#6B8E23", pastel:"#b8d68a", icon:"🌿",
    tema:"Yenilenme · Enerji Alanı", bird:"dove",
    aciklama:"285 Hz enerji alanını destekler ve yenilenme hissini güçlendirir. Bu frekans bedenin doğal canlılığını hatırlatır. Dinleyenler ciltte karıncalanma, ellerde sıcaklık ve genel bir tazelenme hissi tarif eder.",
    etkiler:["Yenilenme hissi","Enerji alanı desteği","Canlılık","Tazelenme hissi"] },
  { hz:396, name:"Özgürleşme", color:"#c0392b", pastel:"#e8a09a", icon:"🔓",
    tema:"Korku & Suçluluk Salınımı", bird:"guguk",
    aciklama:"396 Hz kök çakrayla rezonansa girer. Bilinçaltındaki korku, suçluluk ve hayatta kalma kaygısını çözmeye yardımcı olur. Göğüs ve karın bölgesinde gevşeme, zihinsel gürültünün azalması ve 'içsel yük hafifliyor' hissi yaşanır.",
    etkiler:["Suçluluk ve korku salınımını çözme","Kök enerji alanında rahatlama","Geçmişten gelen yükleri bırakma","Güven hissini yeniden hatırlama"] },
  { hz:417, name:"Dönüşüm", color:"#e67e22", pastel:"#f0c27f", icon:"🔄",
    tema:"Değişimi Kolaylaştırma · Travma Temizliği", bird:"bulbul",
    aciklama:"417 Hz sakral çakrayla çalışır. Travmatik deneyimlerin izlerini yumuşatır, değişime direnci çözer. Yaratıcılığın önündeki blokajları kaldırır. Dinleyenler duygusal bir 'çözülme' ve ardından hafiflik hissi tarif eder.",
    etkiler:["Negatif enerjiyi dönüştürme","Travma izlerini yumuşatma","Değişime açıklık","Yaratıcı blokajları çözme"] },
  { hz:432, name:"Evrensel Uyum", color:"#2c3e50", pastel:"#95a5b6", icon:"🎵",
    tema:"Doğanın Frekansı · Kalp Huzuru", bird:"dove",
    aciklama:"432 Hz 'evrenin frekansı' olarak bilinir. Doğadaki altın oranla uyumludur. Kalp atışını sakinleştirir, beyin dalgalarını alfa durumuna geçirir. Dinleyenler derin bir huzur, zamanın yavaşlaması ve 'eve dönüş' hissi yaşar.",
    etkiler:["Doğayla uyum","Kalp ritmi dengeleme","Alfa beyin dalgaları","Derin huzur hissi"] },
  { hz:528, name:"Sevgi Frekansı", color:"#f1c40f", pastel:"#f7e18a", icon:"💛",
    tema:"Sevgi Tonu · İç Dönüşüm", bird:"kanarya",
    aciklama:"528 Hz 'Mucize Tonu' ya da 'Sevgi Frekansı' olarak adlandırılır. Hücresel uyumu desteklediği ve Güneş pleksusu çakrasıyla rezonansa girdiği düşünülür. Dinleyenler kalp bölgesinde açılma ve derin bir sevgi dalgası hisseder.",
    etkiler:["Hücresel uyum","İç dönüşüm ve mucize","Sevgi titreşimi","Güneş pleksusu aktivasyonu"] },
  { hz:639, name:"İlişki Uyumu", color:"#27ae60", pastel:"#82d9a3", icon:"💚",
    tema:"Bağlantı · İlişki İyileştirme", bird:"dove",
    aciklama:"639 Hz kalp çakrasını besler. İlişkilerdeki kırıklıkları onarır, empatiyi güçlendirir. Hem kendine hem başkalarına karşı şefkati derinleştirir. Dinleyenler göğüs bölgesinde genişleme, yalnızlık hissinin azalması ve bağlanma sıcaklığı yaşar.",
    etkiler:["İlişkileri uyumlaştırma","Empati güçlenmesi","Kalp çakrası aktivasyonu","Bağ kurma kapasitesi"] },
  { hz:741, name:"İfade & Arınma", color:"#2980b9", pastel:"#85c1e9", icon:"🔵",
    tema:"Sezgisel İfade · Enerji Arınması", bird:"yedek",
    aciklama:"741 Hz boğaz çakrasıyla çalışır. Gerçeği söyleme cesaretini güçlendirir, enerji alanının arınmasını destekler. Problem çözme kapasitesini artırır. Dinleyenler boğaz bölgesinde açılma ve netleşen bir zihin deneyimler.",
    etkiler:["Özgün ifade gücü","Enerji arınması","Problem çözme","Zihinsel berraklık"] },
  { hz:852, name:"Sezgisel Uyanış", color:"#8e44ad", pastel:"#aaaaaa", icon:"🔮",
    tema:"Üçüncü Göz · Spiritüel Farkındalık", bird:"baykus",
    aciklama:"852 Hz üçüncü göz çakrasını uyandırır. Sezgisel kapasiteyi güçlendirir, illüzyonları çözer. Meditasyonda daha derin katmanlara ulaşmayı kolaylaştırır. Dinleyenler alın bölgesinde hafif basınç, görsel imgeler ve 'perde kalkıyor' hissi tarif eder.",
    etkiler:["Sezgi güçlenmesi","İllüzyonlardan uyanma","Derin meditasyon","Spiritüel farkındalık"] },
  { hz:963, name:"İlahi Bağlantı", color:"#9b59b6", pastel:"#d9b8e8", icon:"👑",
    tema:"Taç Çakra · Yüksek Bilinç", bird:"kartal",
    aciklama:"963 Hz taç çakrasını aktive eder. 'Tanrı frekansı' olarak da bilinir. Yüksek benlikle bağlantıyı güçlendirir, birlik bilincini deneyimlemeye davet eder. Dinleyenler baş tepesinde enerji akışı, hafiflik ve sınırsızlık hissi yaşar.",
    etkiler:["Yüksek benlikle bağlantı","Birlik bilinci","Taç çakra aktivasyonu","Spiritüel aydınlanma"] },
];

const FREQ_DATA_EN = [
  { hz:174, name:"Earth Frequency", color:"#8B6914", pastel:"#d4b896", icon:"🌍",
    tema:"Grounding · Safety", bird:"guguk",
    aciklama:"174 Hz reaches the deepest layers of the body. It promotes a sense of safety and grounding. Listeners often experience feeling their feet firmly on the earth and tension dissolving from their shoulders.",
    etkiler:["Deep relaxation","Sense of safety","Grounding","Muscle tension release"] },
  { hz:285, name:"Energy Renewal", color:"#6B8E23", pastel:"#b8d68a", icon:"🌿",
    tema:"Renewal · Energy Field", bird:"dove",
    aciklama:"285 Hz supports the energy field and promotes a sense of renewal. This frequency encourages the body's natural vitality. Listeners describe skin tingling, warmth in hands, and a general sense of refreshment.",
    etkiler:["Sense of renewal","Energy field support","Vitality","Refreshment"] },
  { hz:396, name:"Liberation", color:"#c0392b", pastel:"#e8a09a", icon:"🔓",
    tema:"Fear & Guilt Release", bird:"guguk",
    aciklama:"396 Hz resonates with the root chakra. It helps dissolve subconscious fear, guilt, and survival anxiety. Listeners experience relaxation in the chest and abdomen, reduced mental noise, and a feeling of 'inner burden lifting'.",
    etkiler:["Dissolving guilt and fear","Root energy relaxation","Releasing past burdens","Restoring trust"] },
  { hz:417, name:"Transformation", color:"#e67e22", pastel:"#f0c27f", icon:"🔄",
    tema:"Facilitating Change · Trauma Clearing", bird:"bulbul",
    aciklama:"417 Hz works with the sacral chakra. It softens traces of traumatic experiences and dissolves resistance to change. It removes creative blocks. Listeners describe an emotional 'unwinding' followed by lightness.",
    etkiler:["Transforming negative energy","Softening trauma","Openness to change","Clearing creative blocks"] },
  { hz:432, name:"Universal Harmony", color:"#2c3e50", pastel:"#95a5b6", icon:"🎵",
    tema:"Nature's Frequency · Heart Peace", bird:"dove",
    aciklama:"432 Hz is known as 'the frequency of the universe'. It's aligned with nature's golden ratio. It calms heart rate, shifts brainwaves to alpha state. Listeners experience deep peace, time slowing down, and a feeling of 'coming home'.",
    etkiler:["Harmony with nature","Heart rhythm balancing","Alpha brainwaves","Deep peace"] },
  { hz:528, name:"Love Frequency", color:"#f1c40f", pastel:"#f7e18a", icon:"💛",
    tema:"Love Tone · Inner Transformation", bird:"kanarya",
    aciklama:"528 Hz is called the 'Miracle Tone' or 'Love Frequency'. It is believed to support cellular harmony and resonates with the solar plexus chakra. Listeners feel an opening in the heart area and a deep wave of love.",
    etkiler:["Cellular harmony","Inner transformation","Love vibration","Solar plexus activation"] },
  { hz:639, name:"Relationship Harmony", color:"#27ae60", pastel:"#82d9a3", icon:"💚",
    tema:"Connection · Relationship Healing", bird:"dove",
    aciklama:"639 Hz nourishes the heart chakra. It repairs fractures in relationships and strengthens empathy. It deepens compassion for both self and others. Listeners experience expansion in the chest, less loneliness, and warmth of connection.",
    etkiler:["Harmonizing relationships","Empathy strengthening","Heart chakra activation","Connection capacity"] },
  { hz:741, name:"Expression & Cleansing", color:"#2980b9", pastel:"#85c1e9", icon:"🔵",
    tema:"Intuitive Expression · Energy Cleansing", bird:"yedek",
    aciklama:"741 Hz works with the throat chakra. It strengthens the courage to speak truth and supports energy field cleansing. It enhances problem-solving capacity. Listeners experience throat opening and a clarifying mind.",
    etkiler:["Authentic expression","Energy cleansing","Problem solving","Mental clarity"] },
  { hz:852, name:"Intuitive Awakening", color:"#8e44ad", pastel:"#aaaaaa", icon:"🔮",
    tema:"Third Eye · Spiritual Awareness", bird:"baykus",
    aciklama:"852 Hz awakens the third eye chakra. It strengthens intuitive capacity and dissolves illusions. It facilitates reaching deeper layers in meditation. Listeners describe light pressure on the forehead, visual images, and a 'veil lifting' sensation.",
    etkiler:["Intuition strengthening","Awakening from illusion","Deep meditation","Spiritual awareness"] },
  { hz:963, name:"Divine Connection", color:"#9b59b6", pastel:"#d9b8e8", icon:"👑",
    tema:"Crown Chakra · Higher Consciousness", bird:"kartal",
    aciklama:"963 Hz activates the crown chakra. Also known as the 'God frequency'. It strengthens connection with the higher self and invites unity consciousness. Listeners experience energy flow at the crown, lightness, and boundlessness.",
    etkiler:["Higher self connection","Unity consciousness","Crown chakra activation","Spiritual illumination"] },
];

const getFreqData = (lang) => lang === "en" ? FREQ_DATA_EN : FREQ_DATA_TR;

// ── Numeroloji & Astroloji yardımcıları ──────────────────────────────────────
function reduceNum(n) {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33)
    n = String(n).split("").reduce((a,d)=>a+parseInt(d),0);
  return n;
}
function lifePathNumber(dateStr) {
  const [y,m,d] = dateStr.split("-").map(Number);
  const sum = reduceNum(d) + reduceNum(m) + [...String(y)].reduce((a,c)=>a+parseInt(c),0);
  return reduceNum(sum);
}
function personalYear(dateStr) {
  const [,m,d] = dateStr.split("-").map(Number);
  const y = new Date().getFullYear();
  return reduceNum(reduceNum(d) + reduceNum(m) + [...String(y)].reduce((a,c)=>a+parseInt(c),0));
}
function zodiacSign(dateStr) {
  const [,m,d] = dateStr.split("-").map(Number);
  const s = [
    {n:"Oğlak",m:1,d:19},{n:"Kova",m:2,d:18},{n:"Balık",m:3,d:20},
    {n:"Koç",m:4,d:19},{n:"Boğa",m:5,d:20},{n:"İkizler",m:6,d:20},
    {n:"Yengeç",m:7,d:22},{n:"Aslan",m:8,d:22},{n:"Başak",m:9,d:22},
    {n:"Terazi",m:10,d:22},{n:"Akrep",m:11,d:21},{n:"Yay",m:12,d:21},
    {n:"Oğlak",m:12,d:31},
  ];
  return (s.find(x=>m<x.m||(m===x.m&&d<=x.d))||s[0]).n;
}
function biorhythm(dateStr) {
  const days = Math.floor((Date.now()-new Date(dateStr))/86400000);
  return {
    fiziksel: Math.round(Math.sin(2*Math.PI*days/23)*100),
    duygusal:  Math.round(Math.sin(2*Math.PI*days/28)*100),
    zihinsel:  Math.round(Math.sin(2*Math.PI*days/33)*100),
  };
}
function bioritmBar(val) {
  const positive = val >= 0;
  const pct = Math.abs(val);
  return { pct, positive };
}
// ─────────────────────────────────────────────────────────────────────────────
const ZODIAC_ORDER = ["Koç","Boğa","İkizler","Yengeç","Aslan","Başak","Terazi","Akrep","Yay","Oğlak","Kova","Balık"];
const EV_GEZEGEN = { "Koç":"Mars","Boğa":"Venüs","İkizler":"Merkür","Yengeç":"Ay","Aslan":"Güneş","Başak":"Merkür","Terazi":"Venüs","Akrep":"Pluto","Yay":"Jüpiter","Oğlak":"Satürn","Kova":"Uranüs","Balık":"Neptün" };
// 12. Ev burç yorumları — Tracy Marks "Gizli Benliğiniz" kitabına göre
const EV12_BURCU_ACIKLAMA = {
  "Koç":     { tema:"Bastırılmış Cesaret & Öfke", yorum:"12. evinde Koç varsa bilinçdışında cüretkar, öncü bir enerji yatar. Başlatma gücün, bağımsız iradenin ve öfkeni ifade etme cesaretinin bastırıldığı bu evde karmik dersin, kendi iradesini tanımak ve eyleme geçmekten korkmamaktır. Gizli gücün: engellerden geçme kararlılığı." },
  "Boğa":    { tema:"Bastırılmış Güvenlik & Değer", yorum:"12. evinde Boğa varsa köklenme, doğayla bağ ve maddi güvenlik ihtiyacın bilinçdışında derinleşir. Kendinle ilgili değer biçememe ya da bedeni ihmal etme bu evin gölgesidir. Karmik dersin: kendi değerini bedenselden ruhsala taşımak. Gizli gücün: sabır ve sarsılmaz kararlılık." },
  "İkizler": { tema:"Bastırılmış Merak & İletişim", yorum:"12. evinde İkizler varsa yoğun iç konuşma, yazılı anlayış ve sözsüz iletişim için derin bir kapasite taşırsın. Düşüncelerini ifade etmekte zorlanman ya da bilgiyi içinde biriktirmen bu evin gölgesidir. Karmik dersin: içteki sesi dışa taşımak. Gizli gücün: yazma ve derin düşünce." },
  "Yengeç":  { tema:"Bastırılmış Şefkat & Aile", yorum:"12. evinde Yengeç varsa duygusal güvenlik, bakım verme ve ev kavramı bilinçdışında güçlü bir yer tutar. Başkasına sığınma ihtiyacını ya da kendi çocukluk yaranı gizleme eğilimin bu evin gölgesidir. Karmik dersin: kendinle anne gibi ilgilenmek. Gizli gücün: derin empati ve sezgisel anlama." },
  "Aslan":   { tema:"Bastırılmış Yaratıcılık & İfade", yorum:"12. evinde Aslan varsa yaratıcı potansiyel ve kalpten liderlik etme gücü sessizce derinleşir. Görünmek istememe, alkış almaktan kaçma ya da kendi parlaklığından utanma bu evin gölgesidir. Karmik dersin: özgün ifadene izin vermek. Gizli gücün: ışığını içten dışa taşıma kapasitesi." },
  "Başak":   { tema:"Bastırılmış Mükemmeliyetçilik & Hizmet", yorum:"12. evinde Başak varsa analitik zihin ve hizmet etme arzusu bilinçdışında çalışır. Kendini ya da başkalarını eleştirme, kusur arama ya da bedeni aşırı kontrol etme bu evin gölgesidir. Karmik dersin: şefkatli bir öz-analiz. Gizli gücün: detaylı anlama ve şifalı hizmet." },
  "Terazi":  { tema:"Bastırılmış Denge & İlişki", yorum:"12. evinde Terazi varsa uyum kurma, adalet arama ve ilişkilerdeki denge ihtiyacı derinlerde işler. Çatışmadan kaçmak ya da başkasını mutlu etmek için kendinizden vazgeçmek bu evin gölgesidir. Karmik dersin: kendi ihtiyaçlarınla barışmak. Gizli gücün: sezgisel diplomasi." },
  "Akrep":   { tema:"Bastırılmış Dönüşüm & Derinlik", yorum:"12. evinde Akrep varsa yoğun duygular, sırlar ve psikolojik dönüşüm gücü bilinçdışında toplanır. Güvensizlik, kontrol ihtiyacı ya da kaybetme korkusu bu evin gölgesidir. Karmik dersin: derinlere inmek ve yeniden doğmak. Gizli gücün: radikal psikolojik anlayış ve şifa kapasitesi." },
  "Yay":     { tema:"Bastırılmış Özgürlük & Anlam", yorum:"12. evinde Yay varsa felsefi bilgelik, anlam arayışı ve spiritüel özgürlük sessizce büyür. İnançlarını ya da yolculuk etme arzunu bastırmak bu evin gölgesidir. Karmik dersin: kendi hakikatine güvenmek ve ilerlemek. Gizli gücün: felsefi kavrayış ve geniş perspektif." },
  "Oğlak":  { tema:"Bastırılmış Disiplin & Otorite", yorum:"12. evinde Oğlak varsa sorumluluk alma kapasitesi ve iç disiplin bilinçdışında güçlenir. Yetersizlik hissi, başaramamaktan korkma ya da otorite figürlerine duyulan gizli öfke bu evin gölgesidir. Karmik dersin: öz-otoritenle barışmak. Gizli gücün: sessiz, kararlı öz-güç." },
  "Kova":    { tema:"Bastırılmış Özgünlük & İnsanlık", yorum:"12. evinde Kova varsa özgün olmak, kolektife katkı sunmak ve devrimci fikirler bilinçdışında çalışır. Aitlik korkusu ya da farklı olmaktan utanmak bu evin gölgesidir. Karmik dersin: bireysel özgünlüğünü insanlığa armağan etmek. Gizli gücün: yenilikçi sezgi ve topluluk hissi." },
  "Balık":   { tema:"Bastırılmış Şefkat & Evrensel Bağ", yorum:"12. evinde Balık varsa sınırlar çözülür, evrensel sevgi ve spiritüel teslimiyete yönelik derin bir kapasite taşırsın. Gerçeklikten kaçma, öz-kurban ya da başkasında eriyip gitme bu evin gölgesidir. Karmik dersin: şefkat ve sınır arasındaki dengeyi bulmak. Gizli gücün: mistik bağlantı ve iyileştirici sevgi." },
};
const GEZEGEN_12EV_GUCLERI = {
  "Güneş":  "İçsel zenginliğe güven, kendinizi canlandırma ve konsantrasyon, liderlik potansiyeli",
  "Ay":     "Duygusal kendine yeterlilik, kendini besleme ve bakma becerisi, ihtiyaç duyan insanlara derin hassasiyet",
  "Merkür": "Olağanüstü açık iç iletişim kurma yeteneği, içsel gelişim için yazma ve düşünmeyi araç olarak kullanma",
  "Venüs":  "Kendine sevgi ve nezaket, yalnız olmaktan alınan haz, ideallere derin bağlılık, iç huzur",
  "Mars":   "Her şeye yeniden başlayabilme kapasitesi, ruhunu keşfetme cesareti ve kararlılığı",
  "Jüpiter":"Köklü inanç ve felsefi güç, olumlu ve iyimser yaklaşım, içsel yaşamın zenginliğiyle büyüme yeteneği",
  "Satürn": "Öz disiplin, yalnızlıkla baş edebilme, sorumluluk üstlenme ve tek başına kararlılıkla çalışma",
  "Uranüs": "Psikolojik özgürlük ve açık fikirlilik, kökleşmiş sezgiler, orijinallik ve beklenmedik durumlarla baş etme",
  "Neptün": "Sonsuz inanç ve şefkat, esin kaynağının yüksek seviyelerine uyum, ideallere adanma ve özverili sevgi",
  "Pluto":  "Derin psikolojik anlayış, boyun eğmeyen irade, gerilime dayanabilmek ve kendinizi canlandıracak müthiş güç",
};
function approxAscendant(dateStr, timeStr) {
  if (!timeStr || !dateStr) return null;
  const parts = timeStr.split(":");
  if (parts.length < 2) return null;
  const h = parseInt(parts[0]), m = parseInt(parts[1]);
  const sunSign = zodiacSign(dateStr);
  const sunIdx = ZODIAC_ORDER.indexOf(sunSign);
  if (sunIdx < 0) return null;
  // Yaklaşık: güneş doğuşunda (~6:00) Yükselen ≈ Güneş burcu; her 2 saatte +1 burç
  const ascIdx = ((sunIdx + Math.round((h + m / 60 - 6) / 2)) % 12 + 12) % 12;
  return ZODIAC_ORDER[ascIdx];
}

// Ortalama Kuzey Ay Düğümü — Meeus formülü (yaklaşık, ±1° hata)
// Düğüm 18.6 yılda bir burç döngüsü tamamlar, retrograd hareket eder.
function approxNorthNode(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const j2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
  const daysSince = (d.getTime() - j2000) / 86400000;
  let nodeDeg = 125.04452 - 0.0529538083 * daysSince;
  nodeDeg = ((nodeDeg % 360) + 360) % 360;
  return ZODIAC_ORDER[Math.floor(nodeDeg / 30)];
}

// Draconic Güneş = natal Güneş burcunu Kuzey Düğüm 0° Koç olacak şekilde döndür
function draconicSun(natalSunSign, northNodeSign) {
  if (!natalSunSign || !northNodeSign) return null;
  const sIdx = ZODIAC_ORDER.indexOf(natalSunSign);
  const nIdx = ZODIAC_ORDER.indexOf(northNodeSign);
  if (sIdx < 0 || nIdx < 0) return null;
  return ZODIAC_ORDER[((sIdx - nIdx) % 12 + 12) % 12];
}

// Draconic Güneş yorumları — Pamela Crane / Ronald Davison sistemi (1970'ler)
// Ruhun bu bedene girmeden önceki kökeni / kimliği
const DRACONIC_SUN_KISA = {
  "Koç":     "Ruhun savaşçı kökenli — cesaret, başlatma gücü ve öncülük enerjisi getirdin.",
  "Boğa":    "Ruhun bahçıvan kökenli — sabır, beden bilgeliği ve içsel huzur enerjisi getirdin.",
  "İkizler": "Ruhun haberci kökenli — merak, bilgi köprüleme ve bağlantı kurma yeteneği getirdin.",
  "Yengeç":  "Ruhun şifacı kökenli — derin şefkat, duygusal hafıza ve koruma içgüdüsü getirdin.",
  "Aslan":   "Ruhun ışık taşıyıcı kökenli — yaratıcı kıvılcım, kalp gücü ve özgün ifade getirdin.",
  "Başak":   "Ruhun zanaatkâr kökenli — hizmet, detay disiplini ve iyileştirme becerisi getirdin.",
  "Terazi":  "Ruhun arabulucu kökenli — uyum arzusu, adalet duygusu ve estetik hassasiyet getirdin.",
  "Akrep":   "Ruhun dönüştürücü kökenli — derinlik, psikolojik içgörü ve dönüşüm gücü getirdin.",
  "Yay":     "Ruhun gezgin filozof kökenli — hakikat arayışı, özgürlük ve geniş ufuk getirdin.",
  "Oğlak":   "Ruhun usta-inşacı kökenli — disiplin, hedef bilinci ve uzun vadeli kararlılık getirdin.",
  "Kova":    "Ruhun vizyoner-devrimci kökenli — bağımsız zihin, kolektif vizyon ve özgünlük getirdin.",
  "Balık":   "Ruhun mistik kökenli — evrensel sevgi, sezgisel bilgi ve teslimiyet kapasitesi getirdin.",
};
const DRACONIC_SUN_DETAY = {
  "Koç":     "Ruhsal kökeninde sen bir öncüsün. Bu bedene girmeden önce yeni alanlar açma, ilk adımı atma ve yalın iradeyle hareket etme tecrübesi taşıyordun. Eğer natal Güneşin pasif veya uyumlu bir burçtaysa hayatın boyunca 'sakin görünmeye zorlandığını' ama içinde durmayan bir savaşçı yaşadığını hissedersin. Misyonun: kendi iradenin meşru olduğunu hatırlamak, başkalarının onayını beklemeden başlamak. Gölgen: bastırılmış öfke ve aceleyle hareket. Şifan: cesaretle teslimiyeti dengelemek — kılıcı doğru anda çekmek.",
  "Boğa":    "Ruhsal kökeninde sen bir bahçıvan, bir köklendiricisin. Bu bedene girmeden önce maddeyi kutsamayı, beden bilgeliğini ve yavaş güzelliği öğrenmiştin. Natal Güneşin hızlı bir burçtaysa hayatın boyunca 'koşturmaya zorlandığını' ama ruhunun durmak, dokunmak, beslemek istediğini hissedersin. Misyonun: ruhu maddeye indirip kutsallık katmak, beden ve doğa üzerinden iyileşmek. Gölgen: aşırı tutunma ve hareketsizlik. Şifan: değer hissini dış sahipliklerden değil, kendi varlığından almak.",
  "İkizler": "Ruhsal kökeninde sen bir habercisin — köprü kuran, çeviren, yayan bir varlık. Bu bedene girmeden önce bilgiyi taşımak ve dünyaları birbirine bağlamak deneyimini biriktirmiştin. Natal Güneşin sessiz veya derin bir burçtaysa içindeki seslerin çokluğunu kimseye anlatamadığını hissedersin. Misyonun: gördüğünü, duyduğunu, sezdiğini sade dile çevirmek. Gölgen: dağınıklık ve yüzeyselliğe kaçma. Şifan: zihnini bir hizmet aracı olarak kullanmak — laf değil, ışık taşımak.",
  "Yengeç":  "Ruhsal kökeninde sen bir şifacı, bir bakıcı, bir anasın. Bu bedene girmeden önce duygusal hafızanın derinliklerinde yüzmüş, başkalarının yaralarını taşımayı öğrenmiştin. Natal Güneşin soğuk veya analitik bir burçtaysa hayatın boyunca 'sert görünmek zorunda kaldığını' ama içinde okyanus taşıdığını hissedersin. Misyonun: duygusal güvenlik alanı yaratmak, kendine ve başkalarına ana şefkati sunmak. Gölgen: aşırı korumacılık ve duygusal tutsaklık. Şifan: önce kendi iç çocuğuna anne olmak.",
  "Aslan":   "Ruhsal kökeninde sen bir ışık taşıyıcısın — kalpten yaratan, alkışlanmadan da parlayan bir varlık. Bu bedene girmeden önce sahnenin kutsallığını, yaratıcılığın tanrısal olduğunu biliyordun. Natal Güneşin alçakgönüllü bir burçtaysa hayatın boyunca 'küçülmeye, fark edilmemeye' çalıştığını ama içindeki kralın/kraliçenin huzursuzlandığını hissedersin. Misyonun: ışığını saklamadan, gösteriş yapmadan ortaya koymak. Gölgen: onaya ihtiyaç ve kibir. Şifan: parlamayı bir hizmet olarak görmek — ışığın başkasının yolunu aydınlatır.",
  "Başak":   "Ruhsal kökeninde sen bir zanaatkâr ve şifacısın — detayda kutsalı görme yeteneği taşıyordun. Bu bedene girmeden önce hizmet etmenin alçakgönüllü bir tanrısallık olduğunu öğrenmiştin. Natal Güneşin geniş ve dağınık bir burçtaysa kendini sürekli 'düzeltmek, sistematize etmek zorunda' hissedersin. Misyonun: kusurlu olanı yargılamak değil, ona itinayla bakım vermek. Gölgen: aşırı eleştiri ve mükemmellik takıntısı. Şifan: şefkatli analiz — önce kendine.",
  "Terazi":  "Ruhsal kökeninde sen bir arabulucu, bir estet, bir denge ustasısın. Bu bedene girmeden önce ilişkilerin ve uyumun kutsallığını öğrenmiştin. Natal Güneşin bağımsız ya da çatışmacı bir burçtaysa hayatın boyunca 'tek başına savaşmak zorunda kalmaktan' yorgun hissedersin. Misyonun: ortaklıklar üzerinden büyümek, adaleti ince bir sezgiyle taşımak. Gölgen: karar verememe ve onay ihtiyacı. Şifan: kendine evet demeyi öğrenmek — ancak o zaman gerçek dengeyi kurarsın.",
  "Akrep":   "Ruhsal kökeninde sen bir simyacı, bir dönüştürücüsün — yaşamın altında ölümün ve ölümün altında yeniden doğuşun olduğunu biliyordun. Bu bedene girmeden önce yoğun duyguların ve psikolojik derinliğin kutsallığını öğrenmiştin. Natal Güneşin hafif veya neşeli bir burçtaysa hayatın boyunca 'fazla derin, fazla yoğun' olarak yargılandığını hissedersin. Misyonun: kendinin ve başkalarının gölgesine korkmadan inmek, dönüştürmek. Gölgen: kontrol ve güvensizlik. Şifan: derinliğini bir şifa hediyesi olarak kullanmak.",
  "Yay":     "Ruhsal kökeninde sen bir gezgin filozof, bir hakikat avcısısın. Bu bedene girmeden önce farklı kültürlerin, inançların ve ufukların bilgisini biriktirmiştin. Natal Güneşin yerleşik veya gelenekselci bir burçtaysa hayatın boyunca 'bir yere ait olmaya zorlandığını' ama ruhunun sınırsız bir özgürlük istediğini hissedersin. Misyonun: hakikati yaşamak ve paylaşmak — kürsüden değil, yoldan. Gölgen: dogmatiklik ve sürekli kaçış. Şifan: aradığın bilgeliğin başlangıç noktasının kendi içinde olduğunu fark etmek.",
  "Oğlak":   "Ruhsal kökeninde sen bir usta-inşacı, bir bilge yaşlısın. Bu bedene girmeden önce zamanın, sorumluluğun ve maddi tezahürün disiplinini öğrenmiştin. Natal Güneşin oyunlu veya pasif bir burçtaysa hayatın boyunca 'fazla ciddi, fazla yetişkin' olduğunu hissedersin. Misyonun: kendi otoriteni dış otoritelerden bağımsız inşa etmek, kalıcı bir şey kurmak. Gölgen: katılık ve duygusal mesafe. Şifan: başarının sevgiyle dengelenmesi — inşa ettiğinin içinde yumuşaklığa yer açmak.",
  "Kova":    "Ruhsal kökeninde sen bir vizyoner, bir devrimcisin — geleceği şimdide görme yeteneği getirmiştin. Bu bedene girmeden önce kolektifin evrimine bağlanmış, kalıpların dışında düşünmeyi öğrenmiştin. Natal Güneşin geleneksel veya bağımlı bir burçtaysa hayatın boyunca 'kalıplara sıkışmaktan' boğulduğunu hissedersin. Misyonun: özgün vizyonunu insanlığa armağan etmek, eski yapıları kibarca dönüştürmek. Gölgen: kopukluk ve duygusal mesafe. Şifan: bağımsızlığı yalnızlık değil, hizmet olarak yaşamak.",
  "Balık":   "Ruhsal kökeninde sen bir mistik, bir okyanussun — sınırların ötesinden geldin. Bu bedene girmeden önce evrensel sevginin, teslimiyetin ve birleşmenin bilgisini taşıyordun. Natal Güneşin keskin veya sınırları net bir burçtaysa hayatın boyunca 'fazla yumuşak, fazla erimiş' olarak yargılandığını hissedersin. Misyonun: şefkati ve sezgiyi günlük hayata yerleştirmek — sınırını koruyarak sevmek. Gölgen: kaçış ve kendini kurban etme. Şifan: ilahi olanla bağını korurken ayaklarını yere basmak.",
};
const DRACONIC_SUN_KISA_EN = {
  "Koç":     "Your soul is of warrior origin — you brought courage, initiating force and pioneering energy.",
  "Boğa":    "Your soul is of gardener origin — you brought patience, body wisdom and inner peace.",
  "İkizler": "Your soul is of messenger origin — you brought curiosity, bridge-building and connective intelligence.",
  "Yengeç":  "Your soul is of healer origin — you brought deep compassion, emotional memory and protective instinct.",
  "Aslan":   "Your soul is of light-bearer origin — you brought creative spark, heart-power and authentic expression.",
  "Başak":   "Your soul is of craftsperson origin — you brought devotion to service, precision and healing attention.",
  "Terazi":  "Your soul is of mediator origin — you brought longing for harmony, sense of justice and aesthetic refinement.",
  "Akrep":   "Your soul is of transformer origin — you brought depth, psychological insight and alchemical power.",
  "Yay":     "Your soul is of wandering philosopher origin — you brought truth-seeking, freedom and wide horizons.",
  "Oğlak":   "Your soul is of master-builder origin — you brought discipline, focus and long-term resolve.",
  "Kova":    "Your soul is of visionary-rebel origin — you brought independent mind, collective vision and originality.",
  "Balık":   "Your soul is of mystic origin — you brought universal love, intuitive knowing and capacity for surrender.",
};

const REMINDERS_TR = [
  { id:"ayna",      icon:"🪞", title:"Aynada kendine bak",        subtitle:"30 saniye — gözlerinin içine bak. Sadece ol.",            duration:30,  color:"rgba(180,160,220,0.7)", borderColor:"rgba(180,160,220,0.25)", notifBody:"Aynaya git. 30 saniye boyunca sadece kendine bak." },
  { id:"su",        icon:"💧", title:"Su iç",                      subtitle:"Bir bardak su iç ve hisset.",                             duration:null,color:"rgba(72,130,200,0.7)",  borderColor:"rgba(72,130,200,0.25)",  notifBody:"Bir bardak su iç. İçerken hisset — serin, temiz, hayat." },
  { id:"nefes",     icon:"🌬", title:"Nefes farkındalığı",         subtitle:"1 dakika — sadece nefesini izle.",                        duration:60,  color:"rgba(100,160,210,0.7)", borderColor:"rgba(100,160,210,0.25)", notifBody:"Dur. Bir dakika boyunca sadece nefesini izle. Buradasın." },
  { id:"beden",     icon:"🧍", title:"Beden egzersizi",            subtitle:"Omuz çevir · Boyun esnet · Gözleri dinlendir",            duration:120, color:"rgba(100,180,130,0.7)", borderColor:"rgba(100,180,130,0.25)", notifBody:"Omuzlarını çevir, boynunu esnet, gözlerini kapat. 2 dakika beden zamanı." },
  { id:"gunes",     icon:"☀️", title:"Güneşi yüzünde hisset",     subtitle:"Dışarı çık. Yüzünü güneşe dön.",                         duration:null,color:"rgba(240,180,60,0.7)",  borderColor:"rgba(240,180,60,0.25)",  notifBody:"Güneş seni bekliyor. Yüzünü kaldır, gözlerini yum, hisset." },
  { id:"agac",      icon:"🌳", title:"Ağaca sarıl",                subtitle:"Bir ağacı bul. Kollarını aç. Kalbini değdir.",            duration:30,  color:"rgba(45,120,65,0.7)",   borderColor:"rgba(45,120,65,0.25)",   notifBody:"Dışarı çık. Bir ağacı bul. Sarıl ona — o da seni tutacak." },
  { id:"toprak",    icon:"🌍", title:"Toprağa dokun",              subtitle:"Çıplak ayak ya da avucunla toprağa değdir.",              duration:30,  color:"rgba(100,70,40,0.7)",   borderColor:"rgba(100,70,40,0.25)",   notifBody:"Ayakkabını çıkar. Toprağa bas. Yerin enerjisini hisset." },
  { id:"gok",       icon:"☁️", title:"Gökyüzüne bak",             subtitle:"Başını kaldır. Gökyüzüne bak. Sadece bak.",              duration:null,color:"rgba(80,140,200,0.7)",  borderColor:"rgba(80,140,200,0.25)",  notifBody:"Başını kaldır. Gökyüzüne bak. Sadece bak." },
  { id:"chakra_an", icon:"💜", title:"Çakra anı",                  subtitle:"Bugünkü çakranda bir an dur.",                           duration:null,color:"rgba(255,255,255,0.7)", borderColor:"rgba(255,255,255,0.25)",  notifBody:"Gözlerini yum. Bugünkü çakranı hisset. Bir nefes yeter." },
  { id:"sosyal",    icon:"📵", title:"Sosyal medya molası",        subtitle:"Gerçekten şimdi burada olmak istiyor musun?",             duration:null,color:"rgba(200,80,80,0.7)",   borderColor:"rgba(200,80,80,0.25)",   notifBody:"Telefonu koy. Bir dakika sadece var ol. Ekran bekler, an geçer." },
];
const REMINDERS_EN = [
  { id:"ayna",      icon:"🪞", title:"Look at yourself in the mirror", subtitle:"30 seconds — look into your eyes. Just be.",              duration:30,  color:"rgba(180,160,220,0.7)", borderColor:"rgba(180,160,220,0.25)", notifBody:"Go to the mirror. For 30 seconds, just look at yourself." },
  { id:"su",        icon:"💧", title:"Drink water",                    subtitle:"Drink a glass of water and feel it.",                      duration:null,color:"rgba(72,130,200,0.7)",  borderColor:"rgba(72,130,200,0.25)",  notifBody:"Drink a glass of water. Feel it — cool, clean, life." },
  { id:"nefes",     icon:"🌬", title:"Breath awareness",               subtitle:"1 minute — just observe your breath.",                     duration:60,  color:"rgba(100,160,210,0.7)", borderColor:"rgba(100,160,210,0.25)", notifBody:"Stop. For one minute, just observe your breath. You are here." },
  { id:"beden",     icon:"🧍", title:"Body exercise",                  subtitle:"Roll shoulders · Stretch neck · Rest eyes",               duration:120, color:"rgba(100,180,130,0.7)", borderColor:"rgba(100,180,130,0.25)", notifBody:"Roll your shoulders, stretch your neck, close your eyes. 2 minutes for your body." },
  { id:"gunes",     icon:"☀️", title:"Feel the sun on your face",      subtitle:"Go outside. Turn your face to the sun.",                  duration:null,color:"rgba(240,180,60,0.7)",  borderColor:"rgba(240,180,60,0.25)",  notifBody:"The sun is waiting for you. Lift your face, close your eyes, feel." },
  { id:"agac",      icon:"🌳", title:"Hug a tree",                     subtitle:"Find a tree. Open your arms. Touch your heart.",          duration:30,  color:"rgba(45,120,65,0.7)",   borderColor:"rgba(45,120,65,0.25)",   notifBody:"Go outside. Find a tree. Hug it — it will hold you too." },
  { id:"toprak",    icon:"🌍", title:"Touch the earth",                subtitle:"Touch the ground with bare feet or your palm.",           duration:30,  color:"rgba(100,70,40,0.7)",   borderColor:"rgba(100,70,40,0.25)",   notifBody:"Take off your shoes. Stand on the earth. Feel the energy of the ground." },
  { id:"gok",       icon:"☁️", title:"Look at the sky",               subtitle:"Lift your head. Look at the sky. Just look.",             duration:null,color:"rgba(80,140,200,0.7)",  borderColor:"rgba(80,140,200,0.25)",  notifBody:"Lift your head. Look at the sky. Just look." },
  { id:"chakra_an", icon:"💜", title:"Chakra moment",                  subtitle:"Pause for a moment in today's chakra.",                   duration:null,color:"rgba(255,255,255,0.7)", borderColor:"rgba(255,255,255,0.25)",  notifBody:"Close your eyes. Feel today's chakra. One breath is enough." },
  { id:"sosyal",    icon:"📵", title:"Social media break",             subtitle:"Do you really want to be here right now?",                duration:null,color:"rgba(200,80,80,0.7)",   borderColor:"rgba(200,80,80,0.25)",   notifBody:"Put the phone down. Just exist for a minute. The screen can wait, the moment can't." },
];
const getReminders = (lang) => lang === "en" ? REMINDERS_EN : REMINDERS_TR;

const BREATH_MODES_CONFIG = {
  standart:    { in: 4000, hold: 1500, out: 4000,  hold2: 0,    total: 10000 },
  diyafram:    { in: 4000, hold: 0,    out: 6000,  hold2: 0,    total: 10000 },
  akciger:     { in: 5000, hold: 2000, out: 7000,  hold2: 0,    total: 14000 },
  "478":       { in: 4000, hold: 7000, out: 8000,  hold2: 0,    total: 19000 },
  kutu:        { in: 4000, hold: 4000, out: 4000,  hold2: 4000, total: 16000 },
  sakinletici: { in: 4000, hold: 2000, out: 8000,  hold2: 0,    total: 14000 },
};

const PREMIUM_BREATH_MODES = ["478", "kutu", "sakinletici"];
const PREMIUM_FREQ_HZ = [528, 639, 741, 852, 963];
const PREMIUM_WORDS_TR = ["berraklik", "guc", "ozgurluk", "nese", "sukur", "guven"];
const PREMIUM_WORDS_EN = ["clarity", "strength", "freedom", "joy", "gratitude", "trust"];

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500&family=Jost:wght@200;300;400&display=swap');
  * { box-sizing: border-box; }
  html, body { background: #000000; margin: 0; padding: 0; min-height: 100%; overflow-x: hidden; -webkit-tap-highlight-color: transparent; }
  :root { --sat: env(safe-area-inset-top); --sab: env(safe-area-inset-bottom); }

  /* ── Animations ── */
  @keyframes twinkle     { 0%,100%{opacity:0.05} 50%{opacity:0.45} }
  @keyframes fadeUp      { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn      { from{opacity:0} to{opacity:1} }
  @keyframes glow        { 0%,100%{box-shadow:0 0 22px rgba(255,255,255,0.22)} 50%{box-shadow:0 0 46px rgba(255,255,255,0.46)} }
  @keyframes pulse       { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
  @keyframes sunrise     { from{opacity:0;transform:scale(0.9) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes ringPulse   { 0%,100%{opacity:0.07;transform:scale(1)} 50%{opacity:0.2;transform:scale(1.04)} }
  @keyframes heartbeat   { 0%,100%{transform:scale(1)} 14%{transform:scale(1.07)} 28%{transform:scale(1)} 42%{transform:scale(1.04)} }
  @keyframes slowPulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
  @keyframes ailesiPulse { 0%,100%{opacity:0.7;box-shadow:0 0 8px rgba(240,192,96,0.1)} 50%{opacity:1;box-shadow:0 0 18px rgba(240,192,96,0.25)} }
  @keyframes floatUp     { 0%{opacity:0;transform:translate(0,0) scale(0.4)} 20%{opacity:1} 80%{opacity:0.5} 100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(1.3)} }
  @keyframes energyFill  { 0%{background-position:100% 50%} 100%{background-position:0% 50%} }
  @keyframes pillGlow    { 0%,100%{box-shadow:0 0 8px rgba(255,255,255,0.4),0 0 22px rgba(255,255,255,0.18),inset 0 0 8px rgba(255,255,255,0.12)} 50%{box-shadow:0 0 18px rgba(255,255,255,0.7),0 0 44px rgba(255,255,255,0.38),inset 0 0 14px rgba(255,255,255,0.22)} }
  @keyframes pillShimmer { 0%{transform:translateX(-100%) skewX(-20deg)} 100%{transform:translateX(250%) skewX(-20deg)} }
  @keyframes handFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
  @keyframes doneGlow    { 0%,100%{box-shadow:0 0 40px #4ade8088,0 0 80px #4ade8033} 50%{box-shadow:0 0 70px #4ade80bb,0 0 140px #4ade8055} }
  @keyframes sparkle     { 0%{transform:scale(0) rotate(0deg);opacity:1} 100%{transform:scale(1.6) rotate(180deg);opacity:0} }
  @keyframes slideIn     { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
  @keyframes checkPop    { 0%{transform:scale(0)} 70%{transform:scale(1.3)} 100%{transform:scale(1)} }
  @keyframes diamondSpin { 0%{transform:rotate(0deg) scale(1)} 50%{transform:rotate(180deg) scale(1.06)} 100%{transform:rotate(360deg) scale(1)} }
  @keyframes portalIn    { 0%{opacity:0;transform:scale(0.92);filter:blur(8px)} 60%{filter:blur(2px)} 100%{opacity:1;transform:scale(1);filter:blur(0)} }
  @keyframes mandalaRotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes petalGlow { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.4)} }
  @keyframes streakFire { 0%,100%{text-shadow:0 0 8px rgba(255,140,50,0.4)} 50%{text-shadow:0 0 18px rgba(255,140,50,0.8),0 0 36px rgba(255,80,0,0.3)} }
  @keyframes badgeUnlock { 0%{transform:scale(0) rotate(-30deg);opacity:0} 60%{transform:scale(1.2) rotate(5deg);opacity:1} 100%{transform:scale(1) rotate(0deg);opacity:1} }
  @keyframes sliceGlow   { 0%,100%{opacity:0.7} 50%{opacity:1} }
  @keyframes neuralPulse { 0%{stroke-dashoffset:40;opacity:0} 30%{opacity:1} 70%{opacity:1} 100%{stroke-dashoffset:0;opacity:0.3} }
  @keyframes neuralDot   { 0%{r:1.5;opacity:0} 20%{opacity:0.8} 50%{r:3;opacity:1} 80%{opacity:0.6} 100%{r:2;opacity:0.2} }
  @keyframes neuralGlow  { 0%,100%{opacity:0.3} 50%{opacity:0.8} }
  @keyframes electricRise { 0%{stroke-dashoffset:200;opacity:0.3} 50%{opacity:1} 100%{stroke-dashoffset:0;opacity:0.6} }
  @keyframes nodeCharge   { 0%,100%{filter:brightness(1);transform:scale(1)} 50%{filter:brightness(1.6);transform:scale(1.15)} }
  @keyframes spineGlow    { 0%{opacity:0.2} 50%{opacity:0.7} 100%{opacity:0.2} }
  @keyframes navPulse    { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.07)} }
  @keyframes navGlow     { 0%,100%{opacity:0.85} 50%{opacity:1} }
  @keyframes navSoftPulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
  @keyframes sliceUnlock { 0%{opacity:0;transform:scale(0.85)} 70%{opacity:1;transform:scale(1.03)} 100%{opacity:1;transform:scale(1)} }
  @keyframes introFadeIn { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
  @keyframes introFadeOut { from{opacity:1} to{opacity:0} }
  @keyframes introSquareDraw { from{stroke-dashoffset:1600} to{stroke-dashoffset:0} }
  @keyframes introDotScale { 0%{transform:translate(-50%,-50%) scale(0)} 60%{transform:translate(-50%,-50%) scale(1.2)} 100%{transform:translate(-50%,-50%) scale(1)} }
  @keyframes introTextUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes introLineExpand { from{width:0} to{width:60px} }
  @keyframes introItemSlide { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

  .fade-up  { animation: fadeUp  0.75s cubic-bezier(0.16,1,0.3,1) forwards; }
  .slide-in { animation: slideIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }

  /* ── Typography helpers ── */
  .label-sm {
    font-family:'Jost',sans-serif; font-size:13px; font-weight:300;
    letter-spacing:3.5px; text-transform:uppercase; color:#777777;
  }
  .label-md {
    font-family:'Jost',sans-serif; font-size:14px; font-weight:300;
    letter-spacing:3px; text-transform:uppercase;
  }

  /* ── Top nav ── */
  .top-nav {
    position:fixed; top:0; left:0; right:0; z-index:9999;
    display:flex; align-items:center; justify-content:flex-start; gap:0;
    padding:var(--sat) 4px 0; height:calc(44px + var(--sat));
    background:#000000; border-bottom:1px solid rgba(255,255,255,0.07);
    overflow-x:auto; overflow-y:hidden;
    -webkit-overflow-scrolling:touch; scroll-behavior:smooth;
  }
  .top-nav::-webkit-scrollbar { display:none; }
  .top-nav-btn {
    background:transparent; border:none; cursor:pointer;
    font-family:'Jost',sans-serif; font-weight:300;
    font-size:13px; letter-spacing:2px; text-transform:uppercase; color:#888888;
    padding:0 10px; height:44px; transition:all 0.2s;
    white-space:nowrap; flex-shrink:0; position:relative;
  }
  @media (max-width:390px) {
    .top-nav-btn { font-size:12px; letter-spacing:1.5px; padding:0 7px; }
  }
  .top-nav-btn::after {
    content:''; position:absolute; bottom:0; left:50%; transform:translateX(-50%);
    width:0; height:1px; background:#b8a4d8; transition:width 0.25s;
  }
  .top-nav-btn:hover { color:#cccccc; }
  .top-nav-btn:hover::after { width:60%; }
  .top-nav-btn.active { color:#ffffff; }
  .top-nav-btn.active::after { width:60%; }

  /* ── Inputs ── */
  .sakin-input {
    background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08);
    border-radius:10px; color:#ffffff;
    font-family:'Inter',sans-serif; font-size:16px;
    padding:14px 16px; width:100%; resize:none; outline:none; transition:border-color 0.25s;
    line-height:1.65;
  }
  .sakin-input::placeholder { color:#6a6a88; }
  .sakin-input:focus { border-color:rgba(255,255,255,0.3); background:rgba(255,255,255,0.045); }

  /* ── Buttons ── */
  .sakin-btn {
    background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);
    border-radius:100px; color:#bbbbbb; cursor:pointer;
    font-family:'Jost',sans-serif; font-weight:300;
    font-size:13px; letter-spacing:2.5px; text-transform:uppercase;
    padding:11px 24px; transition:all 0.22s;
  }
  .sakin-btn:hover { background:rgba(255,255,255,0.1); color:#ffffff; border-color:rgba(255,255,255,0.2); }
  .sakin-btn-primary {
    background:rgba(255,255,255,0.08);
    border:1px solid rgba(255,255,255,0.2); border-radius:100px; color:#ffffff; cursor:pointer;
    font-family:'Jost',sans-serif; font-weight:300;
    font-size:13px; letter-spacing:2.5px; text-transform:uppercase;
    padding:12px 34px; transition:all 0.25s;
  }
  .sakin-btn-primary:hover {
    background:rgba(255,255,255,0.15);
    border-color:rgba(255,255,255,0.35); transform:translateY(-1px);
    box-shadow:0 6px 24px rgba(255,255,255,0.22);
  }

  /* ── Word chips ── */
  .word-chip {
    border-radius:6px; border:1px solid rgba(255,255,255,0.08); cursor:pointer;
    font-family:'Jost',sans-serif; font-weight:300;
    font-size:14px; letter-spacing:1px; padding:8px 16px; transition:all 0.2s;
    background:transparent; color:#888888;
  }
  .word-chip:hover { border-color:rgba(255,255,255,0.3); color:#c0b8d8; background:rgba(255,255,255,0.05); }
  .word-chip.selected { background:rgba(255,255,255,0.18); border-color:rgba(255,255,255,0.6); color:#f0ecff; box-shadow:0 0 8px rgba(255,255,255,0.2); }

  /* ── Chakra cards ── */
  .chakra-card {
    border-radius:12px; border:1px solid rgba(255,255,255,0.05);
    padding:14px 16px; cursor:pointer; transition:all 0.2s;
    background:rgba(255,255,255,0.02); display:flex; align-items:center; gap:14px;
  }
  .chakra-card:hover { background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.12); }
  .chakra-card.active { border-color:rgba(255,255,255,0.3); background:rgba(255,255,255,0.06); }

  /* ── Particles & rings ── */
  .particle {
    position:absolute; border-radius:50%;
    background:radial-gradient(circle,#86efac,#4ade80aa);
    pointer-events:none; animation:floatUp var(--dur) ease-out forwards;
  }
  .ring {
    position:absolute; border-radius:50%;
    border:1px solid rgba(74,222,128,0.15);
    animation:ringPulse 3s ease-in-out infinite;
  }

  /* ── Reminder cards ── */
  .rem-card {
    border-radius:18px; border:1px solid rgba(255,255,255,0.06);
    padding:18px 20px; background:rgba(255,255,255,0.04);
    transition:all 0.3s; margin-bottom:12px;
    display:flex; align-items:flex-start; gap:16px;
  }
  .rem-card.done { opacity:0.38; }
  .rem-card:hover { background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.1); }
  .check-btn {
    width:44px; height:44px; border-radius:50%; flex-shrink:0; margin-top:2px;
    border:2px solid rgba(160,120,220,0.25); background:rgba(160,120,220,0.1);
    cursor:pointer; transition:all 0.3s; display:flex; align-items:center; justify-content:center;
    font-size:16px; color:transparent;
  }
  .check-btn.checked { background:rgba(160,120,220,0.3); border-color:rgba(160,120,220,0.7); color:#b090e0; animation:checkPop 0.3s ease; }
  .notif-btn {
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
    border-radius:100px; color:#888888; cursor:pointer;
    font-family:'Jost',sans-serif; font-weight:300;
    font-size:13px; letter-spacing:1.5px; text-transform:uppercase;
    padding:10px 14px; transition:all 0.2s; white-space:nowrap; flex-shrink:0; min-height:44px;
  }
  .notif-btn:hover { background:rgba(255,255,255,0.09); color:#c0b8d8; }
  .notif-btn.sent { background:rgba(100,180,120,0.15); border-color:rgba(100,180,120,0.3); color:#7ed4a0; }

  /* ── Terapi pill ── */
  .terapi-pill {
    position:relative; overflow:hidden;
    background: linear-gradient(270deg,#7a50a0cc,#3a2ab0aa,#8b2eb0cc,#7a50a0cc);
    background-size:300% 100%;
    animation: energyFill 2.8s ease-in-out infinite, pillGlow 2.8s ease-in-out infinite;
    border:1px solid rgba(184,140,255,0.3) !important;
    color:#e0d0ff !important; letter-spacing:2.5px;
  }
  .terapi-pill::after {
    content:""; position:absolute; top:0; left:0; width:40%; height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent);
    animation:pillShimmer 2.2s ease-in-out infinite;
  }

  /* ── Policy screens ── */
  .policy-screen {
    max-width:580px; width:100%; padding:28px 24px 110px;
    position:relative; z-index:1; text-align:left;
  }
  @media (max-width:480px) {
    .policy-screen { padding:20px 18px 110px; }
    .policy-screen h1 { font-size:21px; letter-spacing:3px; }
  }
  .policy-screen h1 {
    font-family:'Jost',sans-serif; font-weight:200; font-size:24px;
    letter-spacing:5px; text-transform:uppercase; margin-bottom:6px; color:#ffffff;
  }
  .policy-screen .subtitle {
    font-family:'Jost',sans-serif; font-size:14px; font-weight:300;
    letter-spacing:2.5px; text-transform:uppercase; color:#8a90a8; margin-bottom:42px;
  }
  .policy-screen h2 {
    font-family:'Jost',sans-serif; font-size:14px; font-weight:400;
    letter-spacing:2.5px; text-transform:uppercase; color:#8a72a8;
    margin:34px 0 12px; padding-bottom:8px;
    border-bottom:1px solid rgba(138,114,168,0.15);
  }
  .policy-screen p {
    font-family:'Inter',sans-serif; font-size:15px;
    color:#bbbbbb; line-height:2; margin-bottom:12px;
  }
  .policy-screen ul { list-style:none; padding:0; margin:0 0 12px; }
  .policy-screen ul li {
    font-family:'Inter',sans-serif; font-size:15px;
    color:#bbbbbb; line-height:2; padding-left:18px; position:relative;
  }
  .policy-screen ul li::before {
    content:"—"; position:absolute; left:0; font-size:12px; color:#777777; top:2px;
  }
  .policy-screen a { color:#a890c8 !important; }
  .policy-screen .divider { border:none; border-top:1px solid rgba(255,255,255,0.05); margin:28px 0; }

  /* ── Pricing cards ── */
  .pricing-card {
    border-radius:16px; padding:22px 24px; margin-bottom:13px;
    position:relative; transition:all 0.22s;
  }
  .pricing-card:hover { transform:translateY(-2px); }
  .pricing-badge {
    display:inline-block; font-family:'Jost',sans-serif; font-weight:300;
    font-size:13px; letter-spacing:2px; text-transform:uppercase;
    padding:5px 12px; border-radius:100px; margin-bottom:11px;
  }

  @media (max-width: 480px) {
    .sakin-btn, .sakin-btn-primary { font-size:13px; padding:12px 26px; }
    .word-chip { font-size:14px; padding:9px 16px; }
    .sakin-input { font-size:16px; }
    .rem-card { padding:18px 16px; }
    .chakra-card { padding:16px 18px; }
  }
`;

async function sendNotif(title, body) {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "default") {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return "denied";
  }
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌿</text></svg>",
    });
    return "sent";
  }
  return "denied";
}

const DAILY_REMINDERS_TR = [
  "Aynaya bak ve gülümse",
  "Bir bardak su iç, bedenini hisset",
  "Üç derin nefes al, şu anı fark et",
  "Güneşi hisset, ışığı içine çek",
  "Ayaklarını yere bas, toprağı hisset",
  "Gökyüzüne bak, genişliği hatırla",
  "Ellerini kalbine koy, minnetle nefes al",
  "Bedenini esnet, omuzlarını gevşet",
  "Bugünkü niyetini hatırla",
  "Bir an dur. Sadece ol.",
];
const DAILY_REMINDERS_EN = [
  "Look in the mirror and smile",
  "Drink a glass of water, feel your body",
  "Take three deep breaths, notice this moment",
  "Feel the sunlight, draw it within",
  "Press your feet to the ground, feel the earth",
  "Look at the sky, remember the vastness",
  "Place your hands on your heart, breathe with gratitude",
  "Stretch your body, relax your shoulders",
  "Remember today's intention",
  "Pause for a moment. Just be.",
];

async function scheduleDailyReminders(lang) {
  if (!isNative) return;
  try {
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== "granted") return;
    await LocalNotifications.cancel({ notifications: Array.from({length:10},(_,i)=>({id:9000+i})) });
    const todayKey = new Date().toISOString().slice(0,10);
    const lastScheduled = localStorage.getItem("sakin_notif_scheduled");
    if (lastScheduled === todayKey) return;
    const reminders = lang === "tr" ? DAILY_REMINDERS_TR : DAILY_REMINDERS_EN;
    const shuffled = [...reminders].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, 3);
    const now = new Date();
    const hours = [9, 13, 18];
    const notifications = picked.map((body, i) => {
      const at = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours[i], Math.floor(Math.random()*30), 0);
      if (at <= now) at.setDate(at.getDate() + 1);
      return { id: 9000 + i, title: "Sakin", body, schedule: { at }, sound: null, smallIcon: "ic_stat_icon_config_sample", iconColor: "#b8a4d8" };
    });
    await LocalNotifications.schedule({ notifications });
    localStorage.setItem("sakin_notif_scheduled", todayKey);
  } catch (e) { console.warn("[Notif]", e); }
}

function ReminderScreen({ onBack, onNext, lang = "tr", onTasksDone }) {
  const t = makeTrans(lang);
  const REMINDERS = getReminders(lang);
  const _todayKey = new Date().toISOString().slice(0, 10);
  const _storageKey = "sakin_reminders_done_" + _todayKey;
  const [done,   setDone]   = useState(() => { try { return JSON.parse(localStorage.getItem(_storageKey)) || {}; } catch { return {}; } });
  const [timing, setTiming] = useState(null);
  const timerRef = useRef(null);

  const completedCount = Object.values(done).filter(Boolean).length;

  useEffect(() => { if (onTasksDone) onTasksDone(completedCount); }, [completedCount]);

  const toggleDone = (id) => {
    if (timing?.id === id) { clearInterval(timerRef.current); setTiming(null); }
    setDone(p => {
      const next = { ...p, [id]: !p[id] };
      localStorage.setItem(_storageKey, JSON.stringify(next));
      return next;
    });
  };

  const startTimer = (rem) => {
    if (!rem.duration) return;
    if (timing?.id === rem.id) { clearInterval(timerRef.current); setTiming(null); return; }
    if (timing) clearInterval(timerRef.current);
    setTiming({ id: rem.id, elapsed: 0, total: rem.duration });
    timerRef.current = setInterval(() => {
      setTiming(t => {
        if (!t) return null;
        const next = t.elapsed + 1;
        if (next >= t.total) {
          clearInterval(timerRef.current);
          setDone(p => { const n={...p,[rem.id]:true}; localStorage.setItem(_storageKey,JSON.stringify(n)); return n; });
          return null;
        }
        return { ...t, elapsed: next };
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  return (
    <div style={{ maxWidth:430, width:"100%", padding:"62px 20px 120px", position:"relative", zIndex:1 }}>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:8 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#888888", cursor:"pointer", fontSize:19, padding:"10px 12px 10px 4px", marginLeft:-4 }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, letterSpacing:5, color:"#666666" }}>{t("day_label")}</div>
          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:18, fontWeight:300, letterSpacing:1.5 }}>{t("reminders_title")}</div>
        </div>
        <div style={{
          background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
          borderRadius:100, padding:"5px 14px", fontSize:13, color:"#b0baca", letterSpacing:1,
        }}>{completedCount} / {REMINDERS.length}</div>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#777777", cursor:"pointer", fontSize:20, lineHeight:1, padding:"8px 4px 8px 8px" }}>✕</button>
      </div>

      <div style={{ height:2, background:"rgba(255,255,255,0.05)", borderRadius:1, marginBottom:20, overflow:"hidden" }}>
        <div style={{
          height:"100%", borderRadius:1,
          background:"linear-gradient(90deg,#8b5aa0,#4a82b4)",
          width:`${(completedCount/REMINDERS.length)*100}%`,
          transition:"width 0.5s ease",
        }} />
      </div>

      <div style={{ paddingRight:2, scrollbarWidth:"none" }}>
        {REMINDERS.map((rem, i) => {
          const isDone   = done[rem.id];
          const isTiming = timing?.id === rem.id;
          const elapsed  = isTiming ? timing.elapsed : 0;
          const pct      = isTiming ? elapsed / timing.total : 0;
          const remSecs  = isTiming ? timing.total - elapsed : rem.duration;
          const mm = String(Math.floor((remSecs||0)/60)).padStart(2,"0");
          const ss = String((remSecs||0)%60).padStart(2,"0");

          return (
            <div key={rem.id}
              className={`rem-card slide-in ${isDone?"done":""}`}
              style={{
                animationDelay:`${i*0.05}s`, opacity:0,
                borderColor: isTiming ? rem.borderColor : undefined,
                background: isTiming ? `linear-gradient(135deg,${rem.color}0a,transparent)` : undefined,
              }}
            >
              <div style={{ fontSize:28, flexShrink:0, width:38, textAlign:"center", display:"flex", alignItems:"center", justifyContent:"center" }}>{rem.icon}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:16, fontWeight:500, color:isDone?"#666666":"#d8d0e8", marginBottom:4 }}>{rem.title}</div>
                <div style={{ fontSize:13, fontWeight:300, color:"rgba(200,190,220,0.5)", lineHeight:1.5, marginBottom:rem.duration?8:0 }}>{rem.subtitle}</div>
                {rem.duration && !isDone && (
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4 }}>
                    <svg width="28" height="28" style={{ flexShrink:0 }}>
                      <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2" />
                      <circle cx="14" cy="14" r="11" fill="none" stroke={rem.color} strokeWidth="2"
                        strokeDasharray={`${2*Math.PI*11}`}
                        strokeDashoffset={`${2*Math.PI*11*(1-pct)}`}
                        strokeLinecap="round"
                        style={{ transform:"rotate(-90deg)", transformOrigin:"14px 14px", transition:"stroke-dashoffset 1s linear" }} />
                    </svg>
                    <button onClick={() => startTimer(rem)} style={{
                      background:"transparent",
                      border:`1px solid ${isTiming?rem.borderColor:"rgba(255,255,255,0.1)"}`,
                      borderRadius:100, color:isTiming?"#ffffff":"#888888",
                      cursor:"pointer", fontSize:13, letterSpacing:1.5,
                      padding:"4px 12px", transition:"all 0.22s",
                      fontFamily:"'Inter',sans-serif",
                    }}>
                      {isTiming ? `${mm}:${ss} ■` : `▶ ${mm}:${ss}`}
                    </button>
                  </div>
                )}
              </div>
              <button className={`check-btn ${isDone?"checked":""}`} onClick={() => toggleDone(rem.id)} style={{alignSelf:"center"}}>
                {isDone ? "✓" : ""}
              </button>
            </div>
          );
        })}
      </div>

      {completedCount === REMINDERS.length && (
        <div style={{
          textAlign:"center", marginTop:20, padding:"18px",
          background:"rgba(100,180,120,0.06)", border:"1px solid rgba(100,180,120,0.18)",
          borderRadius:18, animation:"fadeIn 0.6s ease",
        }}>
          <div style={{ fontSize:24, marginBottom:8 }}>🌿</div>
          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:16, color:"#82d9a3", letterSpacing:1 }}>
            {t("all_done_msg")}
          </div>
        </div>
      )}

      {completedCount > 0 && onNext && (
        <button className="sakin-btn-primary" style={{ width:"100%", marginTop:20 }} onClick={onNext}>
          {t("btn_reminders_next")}
        </button>
      )}

    </div>
  );
}

function HarmonySVG({ color = "#ffffff", active = false }) {
  const nodes = [
    {x:75,y:18},{x:42,y:32},{x:108,y:28},{x:25,y:55},{x:60,y:50},
    {x:95,y:48},{x:125,y:58},{x:38,y:78},{x:75,y:72},{x:110,y:76},
    {x:55,y:95},{x:90,y:92},{x:75,y:110},{x:30,y:105},{x:120,y:100},
  ];
  const links = [
    [0,1],[0,2],[1,3],[1,4],[2,5],[2,6],[3,7],[4,5],[4,8],[5,9],
    [7,10],[8,9],[8,11],[8,12],[10,12],[11,12],[7,13],[9,14],[3,13],[6,14],
    [10,13],[11,14],[0,4],[0,5],[7,8],[9,6],
  ];
  if (!active) return null;
  return (
    <svg width="150" height="126" viewBox="0 0 150 126" style={{ opacity:0.7 }}>
      {links.map(([a,b],i) => (
        <line key={`l${i}`} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke={color} strokeWidth="0.6" opacity="0.15"
          strokeDasharray="4 3"
          style={{ animation:`neuralPulse ${2.2+i*0.15}s ease-in-out infinite`, animationDelay:`${i*0.18}s` }} />
      ))}
      {links.map(([a,b],i) => {
        const mx = (nodes[a].x+nodes[b].x)/2, my = (nodes[a].y+nodes[b].y)/2;
        return (
          <circle key={`p${i}`} cx={mx} cy={my} r="1.5" fill={color}
            style={{ animation:`neuralDot ${1.8+i*0.12}s ease-in-out infinite`, animationDelay:`${0.4+i*0.2}s` }} />
        );
      })}
      {nodes.map((n,i) => (
        <g key={`n${i}`}>
          <circle cx={n.x} cy={n.y} r={i<3?4:i<7?3.5:3} fill="none" stroke={color} strokeWidth="0.8"
            opacity={0.3+i*0.04} style={{ animation:`neuralGlow ${2.5+i*0.2}s ease-in-out infinite`, animationDelay:`${i*0.15}s` }} />
          <circle cx={n.x} cy={n.y} r={i<3?1.8:1.2} fill={color} opacity={0.5}
            style={{ animation:`neuralGlow ${2+i*0.18}s ease-in-out infinite`, animationDelay:`${i*0.12}s` }} />
        </g>
      ))}
      <text x="75" y="124" textAnchor="middle" fontSize="7" letterSpacing="2" fill={color} opacity="0.3"
        fontFamily="'Jost',sans-serif">HARMONY</text>
    </svg>
  );
}

function TerapiScreen({ onBack, onNext, lang = "tr", isPremium = false, onPaywall = () => {} }) {
  const t = makeTrans(lang);
  const CHAKRAS_22 = getChakras22(lang);
  const [tPhase,   setTPhase]   = useState("list");
  const [selected, setSelected] = useState(null);
  const [chakraTab, setChakraTab] = useState("temel");
  const [elapsed,  setElapsed]  = useState(0);
  const [particles,setParticles]= useState([]);
  const timerRef    = useRef(null);
  const particleRef = useRef(null);
  const chimeCxtRef = useRef(null);

  const getChakraDuration = () => {
    const count = parseInt(localStorage.getItem("sakin_chakra_sessions") || "0");
    return Math.min(30 + count * 5, 90);
  };
  const terapiDuration = useRef(getChakraDuration());

  const progress     = Math.min(elapsed/terapiDuration.current,1);
  const displayMins  = String(Math.floor(elapsed/60)).padStart(2,"0");
  const displaySecs  = String(elapsed%60).padStart(2,"0");

  // Mobilde arka plana geçince AudioContext suspend olur; geri gelince resume et
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) {
        try { chimeCxtRef.current?.resume(); } catch(_) {}
        try { audioCtxRef.current?.resume(); } catch(_) {}
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // iOS/Android için AudioContext'i kullanıcı gesture'ında unlock et
  const unlockChimeCtx = () => {
    try {
      if (!chimeCxtRef.current) {
        chimeCxtRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (chimeCxtRef.current.state === "suspended") chimeCxtRef.current.resume();
      // Sessiz buffer çal — iOS kilidi açar
      const buf = chimeCxtRef.current.createBuffer(1,1,22050);
      const src = chimeCxtRef.current.createBufferSource();
      src.buffer = buf; src.connect(chimeCxtRef.current.destination); src.start(0);
    } catch(_) {}
  };

  // Şifalı çan / singing bowl sesi: harmoniklerle zenginleştirilmiş
  const playChime = (freq=432, vol=0.18, dur=2.8) => {
    try {
      const ctx = chimeCxtRef.current || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === "suspended") { ctx.resume(); }
      // Temel frekans + üst harmonikler (singing bowl oranları)
      [[1, vol], [2.76, vol*0.28], [5.4, vol*0.10]].forEach(([ratio, amp]) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine"; o.frequency.value = freq * ratio;
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(amp, ctx.currentTime + 0.025);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
        o.connect(g); g.connect(ctx.destination);
        o.start(); o.stop(ctx.currentTime + dur);
      });
    } catch(_) {}
  };

  // Bağlantı tamamlanma akoru: 3 çan eş zamanlı
  const playConnectedChord = () => {
    [396, 528, 660].forEach((f, i) => setTimeout(() => playChime(f, 0.16, 3.5), i*180));
  };

  useEffect(() => {
    if (tPhase!=="active" && tPhase!=="connected") return;
    if (tPhase==="active") setShowCloseEyes(false);
    const dur = terapiDuration.current;
    timerRef.current = setInterval(() => {
      setElapsed(e => {
        const next = e + 1;
        if (next === dur) setShowCloseEyes(true);
        const rem = dur - next;
        if (rem === 7) playChime(396, 0.14, 2.0);
        if (rem === 5) playChime(432, 0.16, 2.0);
        if (rem === 3) playChime(528, 0.18, 2.2);
        if (next === dur) {
          setTPhase("connected");
          const prev = parseInt(localStorage.getItem("sakin_chakra_sessions") || "0");
          localStorage.setItem("sakin_chakra_sessions", String(prev + 1));
        }
        return next;
      });
    },1000);
    return () => clearInterval(timerRef.current);
  },[tPhase]);

  useEffect(() => {
    if (tPhase!=="connected" || !selected) return;
    // Bağlantı kuruldu: harmonik akor + konuşma bildirimi
    playConnectedChord();
    if ("speechSynthesis" in window) {
      setTimeout(() => {
        const utt = new SpeechSynthesisUtterance("Connected");
        utt.lang = "en-US";
        utt.rate = 0.78;
        utt.pitch = 0.9;
        utt.volume = 0.85;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utt);
      }, 1400);
    }
  }, [tPhase]);

  useEffect(() => {
    if (tPhase!=="active" && tPhase!=="connected") return;
    particleRef.current = setInterval(() => {
      setParticles(prev => {
        const p = { id:Date.now()+Math.random(), x:33+Math.random()*34, y:42+Math.random()*22, size:3+Math.random()*5, dur:2+Math.random()*3, dx:(Math.random()-0.5)*65, dy:-(38+Math.random()*65) };
        return [...prev.slice(-32),p];
      });
    },170);
    return () => clearInterval(particleRef.current);
  },[tPhase]);

  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [showCloseEyes,  setShowCloseEyes]  = useState(false);
  const [toneOn, setToneOn] = useState(false);
  const audioCtxRef = useRef(null);
  const oscRef      = useRef(null);
  const gainRef     = useRef(null);

  const stopTone = () => {
    const ctx = audioCtxRef.current;
    if (gainRef.current && ctx) {
      gainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    }
    setTimeout(() => {
      try { oscRef.current?.stop(); } catch(_) {}
      oscRef.current = null;
      gainRef.current = null;
      try { audioCtxRef.current?.close(); } catch(_) {}
      audioCtxRef.current = null;
    }, 820);
    setToneOn(false);
  };

  const toggleTone = (hz) => {
    if (toneOn) { stopTone(); return; }
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    ctx.resume();
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 2);
    master.connect(ctx.destination);
    gainRef.current = master;
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine"; lfo.frequency.value = 0.15;
    lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain); lfoGain.connect(master.gain);
    lfo.start();
    [[1, 1, "sine"], [0.5, 0.2, "sine"], [1.498, 0.12, "sine"], [2.01, 0.06, "triangle"]].forEach(([ratio, amp, type]) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = type; o.frequency.value = hz * ratio;
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.28 * amp, ctx.currentTime + 2);
      o.connect(g); g.connect(master); o.start();
      if (ratio === 1) oscRef.current = o;
    });
    setToneOn(true);
  };

  const resetTerapi = () => { stopTone(); if ("speechSynthesis" in window) window.speechSynthesis.cancel(); setTPhase("list"); setSelected(null); setElapsed(0); setParticles([]); setShowBackConfirm(false); setShowCloseEyes(false); clearInterval(timerRef.current); clearInterval(particleRef.current); try { chimeCxtRef.current?.close(); } catch(_){} chimeCxtRef.current = null; };
  const heartAnim = tPhase==="active" ? `heartbeat ${1.15-progress*0.28}s ease-in-out infinite` : "none";
  const hex = v => Math.round(v*255).toString(16).padStart(2,"0");

  if (tPhase==="list") return (
    <div style={{ maxWidth:440, width:"100%", padding:"62px 20px 120px", position:"relative", zIndex:1 }}>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:28 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#888888", cursor:"pointer", fontSize:19, padding:"10px 12px 10px 4px", marginLeft:-4 }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, letterSpacing:5, color:"#666666" }}>{t("reiki_label")}</div>
          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:19, fontWeight:300, letterSpacing:2 }}>{t("therapy_title")}</div>
        </div>
        <button onClick={() => { resetTerapi(); onNext(); }} style={{ background:"none", border:"none", color:"#a07ae0", cursor:"pointer", fontSize:13, letterSpacing:2, padding:"8px 4px 8px 8px", fontFamily:"'Jost',sans-serif" }}>{lang==="tr"?"Devam →":"Next →"}</button>
      </div>
      {/* Tab toggle */}
      <div style={{ display:"flex", borderRadius:12, overflow:"hidden", border:"1px solid rgba(255,255,255,0.1)", marginBottom:20 }}>
        <button onClick={() => setChakraTab("temel")} style={{
          flex:1, padding:"12px 0", background: chakraTab==="temel" ? "rgba(160,122,224,0.15)" : "transparent",
          border:"none", borderRight:"1px solid rgba(255,255,255,0.1)", cursor:"pointer", textAlign:"center",
        }}>
          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:15, fontWeight: chakraTab==="temel" ? 500 : 300, color: chakraTab==="temel" ? "#d0c0f0" : "#888888", letterSpacing:1 }}>{lang==="tr"?"Temel 7":"Classic 7"}</div>
          <div style={{ fontSize:11, letterSpacing:2, color: chakraTab==="temel" ? "#a07ae0" : "#555555", textTransform:"uppercase", marginTop:2 }}>{lang==="tr"?"KLASİK ÇAKRALAR":"CLASSIC CHAKRAS"}</div>
        </button>
        <button onClick={() => setChakraTab("yuksek")} style={{
          flex:1, padding:"12px 0", background: chakraTab==="yuksek" ? "rgba(160,122,224,0.15)" : "transparent",
          border:"none", cursor:"pointer", textAlign:"center",
        }}>
          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:15, fontWeight: chakraTab==="yuksek" ? 500 : 300, color: chakraTab==="yuksek" ? "#d0c0f0" : "#888888", letterSpacing:1 }}>{lang==="tr"?"Yüksek 15":"Higher 15"}</div>
          <div style={{ fontSize:11, letterSpacing:2, color: chakraTab==="yuksek" ? "#a07ae0" : "#555555", textTransform:"uppercase", marginTop:2 }}>{lang==="tr"?"RUHSAL & KOZMİK":"SPIRITUAL & COSMIC"}</div>
        </button>
      </div>

      <div style={{ paddingRight:4, scrollbarWidth:"none", display:"flex", flexDirection:"column" }}>
        {chakraTab === "yuksek" && (
          <div style={{ textAlign:"center", marginBottom:20, padding:"18px 0" }}>
            <div style={{ position:"relative", width:80, height:80, margin:"0 auto" }}>
              <div style={{ position:"absolute", inset:-16, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,220,100,0.15), transparent 70%)", animation:"slowPulse 4s ease-in-out infinite" }} />
              <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"radial-gradient(circle at 40% 38%, rgba(255,235,180,0.25), rgba(255,200,80,0.08) 60%, transparent 80%)", border:"1px solid rgba(255,220,120,0.18)", boxShadow:"0 0 40px rgba(255,200,80,0.15), 0 0 80px rgba(255,180,60,0.06)" }} />
              <div style={{ position:"absolute", inset:"50%", transform:"translate(-50%,-50%)", width:8, height:8, borderRadius:"50%", background:"rgba(255,235,180,0.7)", boxShadow:"0 0 16px rgba(255,220,120,0.6)" }} />
            </div>
            <div style={{ fontFamily:"'Jost',sans-serif", fontSize:11, letterSpacing:4, color:"#888888", textTransform:"uppercase", marginTop:10 }}>{lang==="tr"?"Kaynak Enerjisi":"Source Energy"}</div>
          </div>
        )}
        {(chakraTab === "temel" ? [1] : [3,2]).map(level => {
          const levelChakras = CHAKRAS_22.filter(c => c.level === level);
          const levelLabel = (lang==="en" ? LEVEL_LABELS_EN : LEVEL_LABELS_TR)[level];
          const levelRange = (lang==="en" ? LEVEL_RANGES_EN : LEVEL_RANGES_TR)[level];
          const levelColors = { 3:"rgba(200,200,210,0.4)", 2:"rgba(140,100,220,0.4)", 1:"rgba(200,120,80,0.4)" };
          return (
            <div key={level}>
              <div style={{ display:"flex", alignItems:"center", gap:10, margin:"6px 0 10px" }}>
                <div style={{ flex:1, height:1, background:levelColors[level] }} />
                <div style={{ fontFamily:"'Jost',sans-serif", fontSize:11, letterSpacing:3, color:"#666666", textTransform:"uppercase", whiteSpace:"nowrap" }}>
                  {levelLabel} <span style={{ color:"#555555", letterSpacing:1 }}>({levelRange})</span>
                </div>
                <div style={{ flex:1, height:1, background:levelColors[level] }} />
              </div>
              {[...levelChakras].reverse().map((c,i) => {
                const locked = !isPremium && c.level !== 1;
                return (
                <div key={c.name} className={`chakra-card slide-in ${selected?.name===c.name?"active":""}`}
                  style={{ marginBottom:7, animationDelay:`${i*0.04}s`, opacity:locked?0.45:0 }}
                  onClick={() => { if(locked){ onPaywall(); return; } setSelected(c); setTPhase("intro"); }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", flexShrink:0, background:`radial-gradient(circle,${c.color}cc,${c.color}44)`, boxShadow:`0 0 10px ${c.color}55` }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, letterSpacing:0.5, marginBottom:1, color:level===3?"#cccccc":"#ffffff" }}>{locked && "🔒 "}{c.name}</div>
                    <div style={{ fontSize:12, color:"#777777", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.konu}</div>
                  </div>
                </div>
                );
              })}
            </div>
          );
        })}
        {chakraTab === "temel" && (
          <div style={{ textAlign:"center", marginTop:10, paddingBottom:8 }}>
            <div style={{ fontSize:12, letterSpacing:3, color:"#555555", fontFamily:"'Jost',sans-serif", textTransform:"uppercase" }}>⬇ {lang==="tr"?"Yeryüzü":"Earth"}</div>
          </div>
        )}
        {chakraTab === "yuksek" && (
          <div style={{ textAlign:"center", marginTop:10, paddingBottom:8 }}>
            <div style={{ fontSize:12, letterSpacing:3, color:"#555555", fontFamily:"'Jost',sans-serif", textTransform:"uppercase" }}>⬇ {lang==="tr"?"Yeryüzü":"Earth"}</div>
          </div>
        )}
      </div>
      {selected && (
        <div style={{ marginTop:18, background:`linear-gradient(135deg,${selected.color}18,transparent)`, border:`1px solid ${selected.color}44`, borderRadius:15, padding:"14px 18px", display:"flex",alignItems:"center",justifyContent:"space-between",gap:14 }}>
          <div>
            <div style={{ fontSize:13,letterSpacing:3,color:selected.pastel,marginBottom:3 }}>{t("selected_label")}</div>
            <div style={{ fontSize:17,fontWeight:300 }}>{selected.name}</div>
          </div>
          <button className="sakin-btn-primary"
            style={{ background:`linear-gradient(135deg,${selected.color}99,${selected.color}55)`, borderColor:`${selected.color}55`, padding:"9px 22px",fontSize:13 }}
            onClick={() => setTPhase("intro")}>{t("btn_start_therapy")}</button>
        </div>
      )}
    </div>
  );

  const positionSvg = (c, prog=0) => {
    const cl=c.pastel, cg=c.color;
    const isSpiritual = c.level && c.level > 1;

    if (isSpiritual) {
      // Eller göğüste birleşik — sağ el altta, sol el üstte
      const chy = 55; // göğüs merkezi
      return (
        <svg width="148" height="126" viewBox="0 0 148 126" fill="none" style={{ animation:"handFloat 3s ease-in-out infinite" }}>
          <circle cx="74" cy="20" r="13" stroke={`${cl}88`} strokeWidth="1.2" fill="none" />
          <line x1="74" y1="33" x2="74" y2="41" stroke={`${cl}66`} strokeWidth="1.2" />
          <path d="M51 41 Q74 39 97 41 L95 87 Q74 91 53 87Z" stroke={`${cl}55`} strokeWidth="1.2" fill={`${cg}0a`} />
          <path d="M65 87 Q63 105 61 121" stroke={`${cl}44`} strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <path d="M83 87 Q85 105 87 121" stroke={`${cl}44`} strokeWidth="1.2" strokeLinecap="round" fill="none" />
          {/* Sağ kol — altta, göğse gelen (sağ el altta) */}
          <path d="M95 49 Q88 52 78 58" stroke={`${cl}88`} strokeWidth="1.4" fill="none" strokeLinecap="round" />
          {/* Sol kol — üstte, göğse gelen */}
          <path d="M53 49 Q60 50 70 54" stroke={`${cl}88`} strokeWidth="1.4" fill="none" strokeLinecap="round" />
          {/* Sağ el (altta) */}
          <ellipse cx="76" cy="58" rx="5" ry="3" fill={`${cg}${hex(0.3+prog*0.4)}`} stroke={`${cl}66`} strokeWidth="0.7" transform="rotate(-8 76 58)" />
          {/* Sol el (üstte) */}
          <ellipse cx="72" cy="54" rx="5" ry="3" fill={`${cg}${hex(0.3+prog*0.4)}`} stroke={`${cl}66`} strokeWidth="0.7" transform="rotate(8 72 54)" />
          {/* Göğüs merkezi enerji */}
          <circle cx="74" cy={chy} r={5+prog*7} fill={`${cg}${hex(0.08+prog*0.16)}`} stroke={`${cl}${hex(0.25+prog*0.45)}`} strokeWidth="0.8" />
          {/* Taç üstü enerji halesi (ruhsal bağlantı) */}
          <circle cx="74" cy="8" r={3+prog*5} fill={`${cg}${hex(0.04+prog*0.1)}`} stroke={`${cl}${hex(0.15+prog*0.3)}`} strokeWidth="0.6" />
          {[0,60,120,180,240,300].map((a,i)=>(
            <line key={i} x1="74" y1={chy}
              x2={74+Math.cos(a*Math.PI/180)*(7+prog*10)} y2={chy+Math.sin(a*Math.PI/180)*(7+prog*10)}
              stroke={`${cl}${hex((0.08+prog*0.22)*(i%2?0.5:1))}`} strokeWidth="0.6" strokeLinecap="round" />
          ))}
        </svg>
      );
    }

    // Fiziksel boyut — eller ilgili bölgeye uzanır
    const HP = {
      "Kök":{hy:83,lx:57,rx:91},"Sakral":{hy:77,lx:59,rx:89},
      "Solar Pleksus":{hy:68,lx:60,rx:88},"Kalp":{hy:57,lx:61,rx:87},
      "Boğaz":{hy:37,lx:68,rx:80},"Üçüncü Göz":{hy:17,lx:66,rx:82},
      "Taç":{hy:10,lx:67,rx:81},
    };
    const {hy=57,lx=61,rx=87}=HP[c.name]||{};
    const up=hy<49; const my=(49+hy)/2;
    const lArm=up?`M53 49 Q55 ${my} ${lx} ${hy}`:`M53 49 Q37 ${my} ${lx} ${hy}`;
    const rArm=up?`M95 49 Q93 ${my} ${rx} ${hy}`:`M95 49 Q111 ${my} ${rx} ${hy}`;
    return (
      <svg width="148" height="126" viewBox="0 0 148 126" fill="none" style={{ animation:"handFloat 3s ease-in-out infinite" }}>
        <circle cx="74" cy="20" r="13" stroke={`${cl}88`} strokeWidth="1.2" fill="none" />
        <line x1="74" y1="33" x2="74" y2="41" stroke={`${cl}66`} strokeWidth="1.2" />
        <path d="M51 41 Q74 39 97 41 L95 87 Q74 91 53 87Z" stroke={`${cl}55`} strokeWidth="1.2" fill={`${cg}0a`} />
        <path d="M65 87 Q63 105 61 121" stroke={`${cl}44`} strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d="M83 87 Q85 105 87 121" stroke={`${cl}44`} strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d={lArm} stroke={`${cl}88`} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <path d={rArm} stroke={`${cl}88`} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <circle cx={lx} cy={hy} r="3.2" fill={`${cg}${hex(0.3+prog*0.5)}`} stroke={`${cl}88`} strokeWidth="0.8" />
        <circle cx={rx} cy={hy} r="3.2" fill={`${cg}${hex(0.3+prog*0.5)}`} stroke={`${cl}88`} strokeWidth="0.8" />
        <circle cx="74" cy={hy} r={4+prog*8} fill={`${cg}${hex(0.06+prog*0.18)}`} stroke={`${cl}${hex(0.28+prog*0.5)}`} strokeWidth="0.8" />
        {[0,45,90,135,180,225,270,315].map((a,i)=>(
          <line key={i} x1="74" y1={hy}
            x2={74+Math.cos(a*Math.PI/180)*(9+prog*14)} y2={hy+Math.sin(a*Math.PI/180)*(9+prog*14)}
            stroke={`${cl}${hex((0.1+prog*0.28)*(i%2?0.5:1))}`} strokeWidth="0.8" strokeLinecap="round" />
        ))}
      </svg>
    );
  };

  if (tPhase==="intro"&&selected) return (
    <div className="fade-up" style={{ textAlign:"center",maxWidth:330,width:"100%",padding:"36px 24px 96px",position:"relative",zIndex:1,overflowY:"auto",maxHeight:"calc(100vh - 44px)" }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:13,letterSpacing:6,color:"#777777" }}>{t("reiki_chakra_label")}</div>
        <div style={{ width:38,height:1,background:`${selected.color}44`,margin:"10px auto" }} />
      </div>
      <div style={{ width:108,height:108,borderRadius:"50%",margin:"0 auto 20px", background:`radial-gradient(circle,${selected.color}cc,${selected.color}33)`, boxShadow:`0 0 40px ${selected.color}66,0 0 80px ${selected.color}22`, animation:"slowPulse 3.8s ease-in-out infinite" }} />
      <div style={{ fontFamily:"'Inter',sans-serif",fontSize:21,fontWeight:300,letterSpacing:1,marginBottom:6 }}>{selected.name} {t("chakra_suf")}</div>
      <div style={{ fontSize:13,letterSpacing:3,color:selected.pastel,marginBottom:16 }}>{selected.element.toUpperCase()}</div>
      {/* Pozisyon göstergesi */}
      <div style={{ marginBottom:6,opacity:0.8 }}>{positionSvg(selected)}</div>
      <div style={{ fontSize:14,color:"#888888",letterSpacing:1,marginBottom:12,fontStyle:"italic" }}>
        {selected.level > 1
          ? (lang==="tr" ? "Ellerini göğsünde birleştir. Sağ el altta." : "Join your hands at your chest. Right hand below.")
          : t("intro_place_hand", selected.name)}
      </div>
      <div style={{ fontSize:13,letterSpacing:3,color:"rgba(255,255,255,0.3)",marginBottom:28 }}>{t("terapi_duration")}</div>
      <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
        <button className="sakin-btn" onClick={() => { stopTone(); setTPhase("list"); }}>{t("back")}</button>
        <button className="sakin-btn-primary" style={{ background:`linear-gradient(135deg,${selected.color}88,${selected.color}44)`,borderColor:`${selected.color}44` }} onClick={() => { unlockChimeCtx(); playChime(528, 0.22, 3.5); if ("speechSynthesis" in window) { const u = new SpeechSynthesisUtterance(""); window.speechSynthesis.speak(u); } setTPhase("active"); }}>{t("btn_start")}</button>
      </div>
    </div>
  );

  if ((tPhase==="active"||tPhase==="connected")&&selected) return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",position:"relative",zIndex:1,width:"100%",maxWidth:370,padding:"18px 22px 80px",overflowY:"auto",maxHeight:"calc(100vh - 44px)" }}>
      {showBackConfirm && (
        <div style={{ position:"fixed",inset:0,zIndex:50,background:"rgba(4,8,16,0.88)",display:"flex",alignItems:"center",justifyContent:"center",padding:"0 32px" }}>
          <div style={{ textAlign:"center",maxWidth:280 }}>
            <div style={{ fontSize:28,marginBottom:18 }}>🌿</div>
            <div style={{ fontFamily:"'Inter',sans-serif",fontSize:20,fontWeight:300,letterSpacing:1,color:"#ffffff",marginBottom:10,lineHeight:1.5 }}>
              {t("sure_title")}
            </div>
            <div style={{ fontSize:14,color:"#888888",lineHeight:1.8,marginBottom:32,fontStyle:"italic" }}>
              {t("sure_body").split("\n").map((l,i)=><span key={i}>{l}{i===0&&<br/>}</span>)}
            </div>
            <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
              <button className="sakin-btn" onClick={resetTerapi}>{t("btn_exit")}</button>
              <button className="sakin-btn-primary" style={{ background:`linear-gradient(135deg,${selected.color}88,${selected.color}44)`,borderColor:`${selected.color}44` }} onClick={()=>setShowBackConfirm(false)}>{t("btn_continue2")}</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ width:"100%",display:"flex",justifyContent:"flex-start",marginBottom:8 }}>
        <button onClick={()=>{ if(tPhase==="connected") resetTerapi(); else setShowBackConfirm(true); }} style={{ background:"none",border:"none",color:"#777777",cursor:"pointer",fontSize:19,padding:"10px 12px 10px 4px",marginLeft:-4,letterSpacing:1 }}>←</button>
      </div>
      <div style={{ fontSize:13,letterSpacing:5,color:"#777777",marginBottom:24 }}>{selected.name.toUpperCase()} · {selected.element.toUpperCase()}</div>
      <div style={{ position:"relative",width:230,height:230,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:22 }}>
        {[2.15,1.8,1.5,1.25].map((s,i) => (
          <div key={i} className="ring" style={{ width:230,height:230,transform:`scale(${s})`,animationDelay:`${i*0.55}s`,animationDuration:`${3+i*0.4}s`,borderColor:`${selected.color}${hex(0.13-i*0.025)}` }} />
        ))}
        <div style={{
          width:136,height:136,borderRadius:"50%",
          background:`radial-gradient(circle at 40% 38%,${selected.color}${hex(0.18+progress*0.22)},${selected.color}44,rgba(0,0,0,0.5))`,
          boxShadow:`0 0 ${28+progress*52}px ${selected.color}${hex(0.28+progress*0.3)}`,
          border:`1px solid ${selected.pastel}${hex(0.2+progress*0.32)}`,
          animation:`slowPulse ${3.2-progress*0.8}s ease-in-out infinite`,
        }} />
        {particles.map(p => (
          <div key={p.id} className="particle" style={{ left:`${p.x}%`,top:`${p.y}%`,width:p.size,height:p.size,"--dx":`${p.dx}px`,"--dy":`${p.dy}px`,"--dur":`${p.dur}s`,background:`radial-gradient(circle,${selected.pastel},${selected.color}88)` }} />
        ))}
      </div>
      {/* Kutucuk progress bar + yüzde — 1 dk dolunca kaybolur */}
      {progress < 1 && (
        <div className="fade-up" style={{ width:"80%",maxWidth:240,marginBottom:16 }}>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
            <span style={{ fontFamily:"'Jost',sans-serif",fontSize:12,letterSpacing:2,color:"#666666" }}>{displayMins}:{displaySecs}</span>
            <span style={{ fontFamily:"'Jost',sans-serif",fontSize:12,letterSpacing:2,color:"#888888" }}>{Math.round(progress*100)}%</span>
          </div>
          <div style={{ width:"100%",height:4,background:"rgba(255,255,255,0.08)",borderRadius:2,overflow:"hidden" }}>
            <div style={{ width:`${progress*100}%`,height:"100%",background:selected.pastel,borderRadius:2,transition:"width 1s linear",boxShadow:`0 0 8px ${selected.color}66` }} />
          </div>
        </div>
      )}
      {tPhase==="connected" && (
        <div style={{ fontSize:14,letterSpacing:4,color:selected.pastel,marginBottom:12,animation:"fadeIn 1.5s ease forwards" }}>{t("connected_label")}</div>
      )}
      {selected.hz && (
        <button onClick={() => toggleTone(selected.hz)} style={{ marginBottom:16,background:toneOn?`${selected.color}33`:"transparent",border:`1px solid ${selected.color}${toneOn?"99":"44"}`,borderRadius:20,padding:"5px 16px",color:toneOn?selected.pastel:"#666666",fontSize:13,letterSpacing:3,cursor:"pointer",transition:"all 0.3s" }}>
          {toneOn ? "⏹" : "▶"} {selected.hz} Hz
        </button>
      )}
      {toneOn && (
        <div style={{ marginBottom:12,animation:"fadeIn 1.5s ease forwards",opacity:0 }}>
          <HarmonySVG color={selected.pastel} active={true} />
        </div>
      )}
      <div style={{ marginBottom:18,opacity:0.65+progress*0.35 }}>
        {positionSvg(selected, progress)}
      </div>
      {showCloseEyes && (
        <div style={{ fontSize:14,color:selected.pastel,letterSpacing:1.5,fontStyle:"italic",marginBottom:10,animation:"fadeIn 1.2s ease forwards",opacity:0 }}>
          {t("close_eyes_hint")}
        </div>
      )}
      {/* Chakra konu bilgisi — seans sırasında belirir */}
      {progress>=0.15 && progress<0.85 && selected.konu && (
        <div style={{ fontSize:12,color:`${selected.pastel}88`,letterSpacing:1.5,textAlign:"center",marginBottom:8,fontFamily:"'Jost',sans-serif",animation:"fadeIn 2s ease forwards",opacity:0 }}>
          {lang==="tr" ? `Bu çakra ${selected.konu.toLowerCase()} ile bağlantılıdır.` : `This chakra is connected to ${selected.konu.toLowerCase()}.`}
        </div>
      )}
      <div style={{ fontFamily:"'Inter',sans-serif",fontSize:14,fontStyle:"italic",color:`${selected.pastel}${hex(0.38+progress*0.55)}`,letterSpacing:0.5,textAlign:"center",lineHeight:1.9,maxWidth:270 }}>
        {progress<0.25 && t("progress_p1")}
        {progress>=0.25&&progress<0.5  && t("progress_p2", selected.name)}
        {progress>=0.5 &&progress<0.75 && t("progress_p3")}
        {progress>=0.75&&progress<0.95 && t("progress_p4")}
        {progress>=0.95 && t("progress_p5", selected.name)}
      </div>
    </div>
  );

  if (tPhase==="done"&&selected) return (
    <div className="fade-up" style={{ textAlign:"center",maxWidth:310,width:"100%",padding:"36px 24px 80px",position:"relative",zIndex:1,overflowY:"auto",maxHeight:"calc(100vh - 44px)" }}>
      {[...Array(10)].map((_,i) => (
        <div key={i} style={{ position:"absolute",left:`${10+i*9}%`,top:`${10+(i%4)*18}%`,fontSize:14,color:selected.pastel,animation:`sparkle ${0.7+i*0.18}s ease-out forwards`,animationDelay:`${i*0.09}s` }}>✦</div>
      ))}
      <div style={{ width:126,height:126,borderRadius:"50%",margin:"0 auto 26px",background:`radial-gradient(circle,${selected.color}44,${selected.color}11)`,boxShadow:`0 0 40px ${selected.color}88,0 0 80px ${selected.color}33`,animation:"slowPulse 3.5s ease-in-out infinite" }} />
      <div style={{ fontFamily:"'Inter',sans-serif",fontSize:24,fontWeight:300,letterSpacing:2,marginBottom:8,color:selected.pastel }}>{t("done_title")}</div>
      <div style={{ fontSize:14,color:"#888888",marginBottom:36,fontStyle:"italic",lineHeight:1.8 }}>
        {t("done_body", selected.name).split("\n").map((l,i)=><span key={i}>{l}{i===0&&<br/>}</span>)}
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:10,alignItems:"center" }}>
        {onNext && <button className="sakin-btn-primary" style={{ width:"100%",maxWidth:260 }} onClick={() => { resetTerapi(); onNext(); }}>{t("btn_done_next")}</button>}
        <div style={{ display:"flex",gap:10 }}>
          <button className="sakin-btn" onClick={resetTerapi}>{t("other_chakra")}</button>
          <button className="sakin-btn" onClick={onBack}>{t("main_screen")}</button>
        </div>
      </div>
    </div>
  );

  return null;
}

const ORNEK_SORULAR_TR = [
  "Cinsel enerjimi nasıl yaratıma dönüştürebilirim?",
  "Sindirim sistemimde sorun var!",
  "Bu hafta dengesiz hissediyorum neden?",
  "Hangi çakramın enerjiye ihtiyaç duyduğunu nasıl bileceğim?",
  "Kronik yorgunluk neden hep benimle?",
];
const ORNEK_SORULAR_EN = [
  "How can I channel my sexual energy into creativity?",
  "I've been having digestive issues!",
  "Why do I feel so unbalanced this week?",
  "How do I know which chakra needs energy?",
  "Why is chronic fatigue always with me?",
];

function playFreqTone(hz, dur = 3.5) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.30, ctx.currentTime + 0.4);
    master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    master.connect(ctx.destination);
    [[1, 1, "sine"], [0.5, 0.2, "sine"], [1.498, 0.1, "sine"], [2.76, 0.22, "sine"], [5.4, 0.07, "triangle"]].forEach(([ratio, amp, type]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = hz * ratio;
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.30 * amp, ctx.currentTime + 0.4);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      o.connect(g); g.connect(master);
      o.start(); o.stop(ctx.currentTime + dur);
    });
    setTimeout(() => { try { ctx.close(); } catch(_) {} }, (dur + 0.5) * 1000);
  } catch(_) {}
}

function FreqText({ text, style, onNav }) {
  if (!text) return null;
  const parts = text.split(/(\[\[NEFES:[^\]]+\]\]|\[\[EKRAN:[^\]]+\]\]|\d+\s*Hz)/gi);
  const NEFES_IDS = {
    "Akciğer":"akciger","Sakinleştirici":"sakinletici",
    "Diyafram":"diyafram","Kutu":"kutu","4-7-8":"478","Standart":"standart"
  };
  const EKRAN_LABELS = {
    terapi:"Çakra Terapisi 💜", nefes:"Nefes 🫧",
    rehber:"Ayna 🪞", sabah:"Sabah Niyeti 🌅", aksam:"Akşam Kapanışı 🌙"
  };
  return (
    <span style={style}>
      {parts.map((part, i) => {
        const hzM = part.match(/^(\d+)\s*Hz$/i);
        if (hzM) {
          const hz = parseInt(hzM[1]);
          return (
            <span key={i} onClick={() => playFreqTone(hz)} title={`${hz} Hz — dokunarak çal`}
              style={{ color:"#c090f0", cursor:"pointer", borderBottom:"1px dotted rgba(192,144,240,0.6)", fontWeight:500, transition:"opacity 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >{part}</span>
          );
        }
        const nefesM = part.match(/^\[\[NEFES:([^\]]+)\]\]$/i);
        if (nefesM && onNav) {
          const ad = nefesM[1].trim();
          const id = NEFES_IDS[ad] || "standart";
          return (
            <span key={i} onClick={() => onNav("breath", id)} title={`${ad} nefes moduna git`}
              style={{ color:"#70b8f0", cursor:"pointer", borderBottom:"1px solid rgba(112,184,240,0.5)", fontWeight:500, padding:"1px 5px", borderRadius:4, transition:"opacity 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >{ad} nefesi →</span>
          );
        }
        const ekranM = part.match(/^\[\[EKRAN:([^\]]+)\]\]$/i);
        if (ekranM && onNav) {
          const id = ekranM[1].trim();
          const label = EKRAN_LABELS[id] || id;
          return (
            <span key={i} onClick={() => onNav("screen", id)} title={`${label} bölümüne git`}
              style={{ color:"#70f0b0", cursor:"pointer", borderBottom:"1px solid rgba(112,240,176,0.5)", fontWeight:500, padding:"1px 5px", borderRadius:4, transition:"opacity 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >{label} →</span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

function AramaPaneli({ baslik, simge, aciklama, renk, value, onChange, analiz, onAra, onSifirla, placeholder, lang = "tr", onNav }) {
  const t = makeTrans(lang);
  const [tipAcik, setTipAcik] = useState(false);
  const tipRef = useRef(null);
  const ornekler = lang === "tr" ? ORNEK_SORULAR_TR : ORNEK_SORULAR_EN;

  useEffect(() => {
    if (!tipAcik) return;
    const handler = (e) => { if (tipRef.current && !tipRef.current.contains(e.target)) setTipAcik(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [tipAcik]);

  return (
    <div style={{ marginBottom:24,background:"linear-gradient(160deg,rgba(0,0,0,0.92),rgba(0,0,0,0.88))",border:`1px solid ${renk}33`,borderRadius:20,padding:"22px 20px",backdropFilter:"blur(20px)",boxShadow:`0 0 40px ${renk}15, inset 0 1px 0 rgba(255,255,255,0.04)` }}>
      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:18 }}>
        <div style={{ width:36,height:36,borderRadius:"50%",background:`radial-gradient(circle,${renk}30,transparent)`,border:`1px solid ${renk}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0 }}>{simge}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13,letterSpacing:3,color:renk,opacity:0.9 }}>{baslik.toUpperCase()}</div>
          <div style={{ fontSize:13,color:"#666666",marginTop:2,letterSpacing:1 }}>{aciklama}</div>
        </div>
      </div>
      {analiz === "__loading__" ? (
        <div style={{ textAlign:"center",padding:"24px 0" }}>
          <div style={{ fontSize:19,marginBottom:10,animation:"pulse 2s ease-in-out infinite" }}>{simge}</div>
          <div style={{ fontSize:13,letterSpacing:4,color:renk,opacity:0.7,animation:"pulse 1.5s ease-in-out infinite" }}>{t("reading")}</div>
        </div>
      ) : analiz ? (
        <div>
          <div style={{ fontSize:13,letterSpacing:2.5,color:renk,opacity:0.8,marginBottom:12 }}>{value.toUpperCase()} {t("analysis_suf")}</div>
          <div style={{ fontSize:14,color:"#ccc0e0",lineHeight:1.9,whiteSpace:"pre-wrap",fontFamily:"'Inter',sans-serif",fontWeight:300,letterSpacing:0.3 }}><FreqText text={analiz} onNav={onNav} /></div>
          <div style={{ display:"flex",gap:8,marginTop:18,flexWrap:"wrap",alignItems:"center" }}>
            <button onClick={onSifirla}
              style={{ background:"none",border:`1px solid ${renk}30`,borderRadius:20,color:renk,opacity:0.7,cursor:"pointer",fontSize:13,letterSpacing:2.5,padding:"6px 16px" }}>
              {t("btn_new_search")}
            </button>
            <a href="/fiyatlandirma"
              style={{ display:"inline-block",padding:"6px 16px",background:`linear-gradient(135deg,${renk}22,${renk}11)`,border:`1px solid ${renk}44`,borderRadius:20,color:renk,fontSize:13,letterSpacing:2,textDecoration:"none",cursor:"pointer" }}>
              {lang==="tr" ? "Daha Fazlası → Premium" : "More → Premium"}
            </a>
          </div>
        </div>
      ) : (
        <div>
          {/* Soru satırı: etiket + ? butonu */}
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
            <span style={{ fontSize:13,letterSpacing:2,color:`${renk}bb` }}>
              {lang==="tr" ? "ne hissediyorsun, ne merak ediyorsun?" : "what do you feel or wonder about?"}
            </span>
            <div ref={tipRef} style={{ position:"relative" }}>
              <button
                onClick={()=>setTipAcik(v=>!v)}
                aria-label="Örnek sorular"
                style={{ width:44,height:44,borderRadius:"50%",background:`${renk}22`,border:`1px solid ${renk}44`,color:`${renk}cc`,fontSize:13,fontWeight:700,cursor:"pointer",lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.2s" }}
              >?</button>
              {tipAcik && (
                <div style={{ position:"absolute",top:"calc(100% + 8px)",right:0,width:262,background:"linear-gradient(160deg,rgba(0,0,0,0.98),rgba(0,0,0,0.96))",border:`1px solid ${renk}40`,borderRadius:14,padding:"14px 14px 10px",boxShadow:`0 8px 32px rgba(0,0,0,0.6),0 0 24px ${renk}18`,zIndex:99 }}>
                  <div style={{ fontSize:13,letterSpacing:2.5,color:`${renk}99`,marginBottom:10,textAlign:"center" }}>
                    {lang==="tr" ? "ÖRNEK SORULAR" : "EXAMPLE QUESTIONS"}
                  </div>
                  {ornekler.map((s,i)=>(
                    <button key={i} onClick={()=>{ onChange(s); setTipAcik(false); }}
                      style={{ display:"block",width:"100%",textAlign:"left",background:"none",border:"none",borderBottom:i<ornekler.length-1?`1px solid ${renk}18`:"none",padding:"8px 4px",color:"#b8a8d0",fontSize:14,fontFamily:"'Inter',sans-serif",cursor:"pointer",lineHeight:1.55,letterSpacing:0.2 }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <textarea
            value={value}
            onChange={e=>onChange(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter" && !e.shiftKey && value.trim()) { e.preventDefault(); onAra(); } }}
            placeholder={placeholder}
            rows={3}
            style={{ width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.03)",border:`1px solid ${renk}25`,borderRadius:12,padding:"11px 14px",color:"#d0c8e8",fontSize:15,fontFamily:"'Inter',sans-serif",outline:"none",marginBottom:12,letterSpacing:0.5,resize:"none",lineHeight:1.75 }}
          />
          <button onClick={onAra} disabled={!value.trim()}
            style={{ width:"100%",background:value.trim()?`linear-gradient(135deg,${renk}70,${renk}40)`:`linear-gradient(135deg,${renk}25,${renk}15)`,border:`1px solid ${renk}${value.trim()?"50":"20"}`,borderRadius:12,padding:"11px",cursor:value.trim()?"pointer":"default",color:value.trim()?"#ffffff":"#555555",fontSize:14,letterSpacing:2,fontFamily:"'Inter',sans-serif",transition:"all 0.2s" }}>
            {t("btn_search")}
          </button>
        </div>
      )}
    </div>
  );
}

export default function SakinApp() {
  const [lang, setLang] = useState(() => localStorage.getItem("sakin_lang") || "tr");
  const t = makeTrans(lang);
  const toggleLang = () => { const nl = lang === "tr" ? "en" : "tr"; setLang(nl); localStorage.setItem("sakin_lang", nl); };
  const [tabletMode, setTabletMode] = useState(detectTablet);
  useEffect(() => {
    const onResize = () => { const v = detectTablet(); isTablet = v; setTabletMode(v); };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => { window.removeEventListener("resize", onResize); window.removeEventListener("orientationchange", onResize); };
  }, []);
  const CHAKRAS_7 = getChakras7(lang);
  const URL_TO_SCREEN = { "/hakkinda":"hakkinda", "/fiyatlandirma":"fiyat", "/hizmet-sartlari":"sartlar", "/gizlilik":"gizlilik", "/iade-politikasi":"iade" };
  const SCREEN_TO_URL = { hakkinda:"/hakkinda", fiyat:"/fiyatlandirma", sartlar:"/hizmet-sartlari", gizlilik:"/gizlilik", iade:"/iade-politikasi" };
  const [screen,        setScreenRaw]     = useState(()=> URL_TO_SCREEN[window.location.pathname] || "giris");
  const screenHistoryRef = useRef([URL_TO_SCREEN[window.location.pathname] || "giris"]);
  const isPopRef = useRef(false);
  const setScreen = (s) => {
    setScreenRaw(s);
    if (!isPopRef.current) {
      screenHistoryRef.current.push(s);
      const url = SCREEN_TO_URL[s] || "/";
      history.pushState({ screen: s }, "", url);
    }
    isPopRef.current = false;
  };
  const [niyet,         setNiyet]         = useState(()=>localStorage.getItem("sakin_niyet_"+new Date().toISOString().slice(0,10))||"");
  const [selectedWords, setSelectedWords] = useState(()=>{ try { return JSON.parse(localStorage.getItem("sakin_words_"+new Date().toISOString().slice(0,10)))||[]; } catch { return []; } });
  const [breathPhase,   setBreathPhase]   = useState("ready");
  const [breathCount,   setBreathCount]   = useState(()=>{ try { return parseInt(localStorage.getItem("sakin_breath_"+new Date().toISOString().slice(0,10)))||0; } catch { return 0; } });
  const [breathStarted, setBreathStarted] = useState(false);
  const [breathMode,    setBreathMode]    = useState("standart");
  const [chakraIndex]                      = useState(() => new Date().toDateString().split("").reduce((a,c) => a + c.charCodeAt(0), 0) % 7);
  const chakra                             = CHAKRAS_7[chakraIndex];
  const [activeFreq,    setActiveFreq]    = useState(null);
  const [playingHz,     setPlayingHz]     = useState(null);
  const freqCtxRef = useRef(null);
  const freqOscRef = useRef(null);
  const freqOscsRef = useRef([]);
  const freqGainRef = useRef(null);
  const birdAudioRef = useRef(null);
  const BIRD_EXT = { guguk:"mp3", bulbul:"mp3", dove:"mp3", kanarya:"mp3", otlegen:"mp3", baykus:"mp3", kartal:"mp3", yedek:"mp3" };
  const stopBirdSound = () => {
    if (birdAudioRef.current) {
      birdAudioRef.current.pause();
      birdAudioRef.current.currentTime = 0;
      birdAudioRef.current = null;
    }
  };
  const playBirdSound = (birdKey, vol = 0.3) => {
    stopBirdSound();
    if (!birdKey || !BIRD_EXT[birdKey]) return;
    const audio = new Audio(`/sounds/birds/${birdKey}.${BIRD_EXT[birdKey]}`);
    audio.loop = true;
    audio.volume = vol;
    audio.play().catch(() => {});
    birdAudioRef.current = audio;
  };
  const stopFreqToneGlobal = () => {
    if (freqGainRef.current && freqCtxRef.current) {
      try { freqGainRef.current.gain.linearRampToValueAtTime(0, freqCtxRef.current.currentTime + 0.3); } catch(_) {}
    }
    setTimeout(() => {
      freqOscsRef.current.forEach(o => { try { o.stop(); } catch(_) {} });
      freqOscsRef.current = [];
      try { freqOscRef.current?.stop(); } catch(_) {}
      freqOscRef.current = null; freqGainRef.current = null;
      try { freqCtxRef.current?.close(); } catch(_) {}
      freqCtxRef.current = null;
    }, 350);
    stopBirdSound();
    setPlayingHz(null); setActiveFreq(null);
  };
  const [freqListenSec, setFreqListenSec] = useState(() => {
    try { return parseInt(localStorage.getItem("sakin_freq_sec_" + todayKey)) || 0; } catch { return 0; }
  });
  const freqTimerRef = useRef(null);
  useEffect(() => {
    if (playingHz) {
      freqTimerRef.current = setInterval(() => {
        setFreqListenSec(prev => {
          const next = prev + 1;
          localStorage.setItem("sakin_freq_sec_" + todayKey, String(next));
          return next;
        });
      }, 1000);
    } else {
      clearInterval(freqTimerRef.current);
    }
    return () => clearInterval(freqTimerRef.current);
  }, [playingHz]);
  const [aksamNote,     setAksamNote]     = useState(()=>localStorage.getItem("sakin_aksamnote_"+new Date().toISOString().slice(0,10))||"");
  const [sukur,         setSukur]         = useState(()=>localStorage.getItem("sakin_sukur_"+new Date().toISOString().slice(0,10))||"");
  const [aksamRitualChecks, setAksamRitualChecks] = useState(()=>{ try { return JSON.parse(localStorage.getItem("sakin_ritual_"+new Date().toISOString().slice(0,10)))||[false,false,false]; } catch { return [false,false,false]; } });
  const [aiRapor,       setAiRapor]       = useState("");
  const [aiLoading,     setAiLoading]     = useState(false);
  const [aiConsent, setAiConsent] = useState(() => localStorage.getItem("sakin_ai_consent") === "1");
  const [showAiConsent, setShowAiConsent] = useState(false);
  const [showAilesi, setShowAilesi] = useState(false);
  const [hakkindaTab, setHakkindaTab] = useState("yolculuk");
  const [embeddedApp, setEmbeddedApp] = useState(null); // { name, path } for fullscreen iframe overlay
  const [embedLoaded, setEmbedLoaded] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);
  const [idCardPhoto, setIdCardPhoto] = useState(null);
  const [idCardName, setIdCardName] = useState(() => localStorage.getItem("sakin_name") || "");
  const pendingAiAction = useRef(null);
  const [offlineMsg, setOfflineMsg] = useState("");
  const requireAiConsent = (action) => {
    if (!navigator.onLine) { setOfflineMsg(t("ai_offline")); setTimeout(() => setOfflineMsg(""), 3000); return; }
    if (aiConsent) { action(); return; }
    pendingAiAction.current = action;
    setShowAiConsent(true);
  };
  const acceptAiConsent = () => { haptic(ImpactStyle.Medium);
    localStorage.setItem("sakin_ai_consent", "1");
    setAiConsent(true);
    setShowAiConsent(false);
    if (pendingAiAction.current) { pendingAiAction.current(); pendingAiAction.current = null; }
  };
  const declineAiConsent = () => {
    setShowAiConsent(false);
    pendingAiAction.current = null;
  };
  const [isOwner, setIsOwner] = useState(false);
  useEffect(() => {
    fetch(API_BASE + "/.netlify/functions/check-owner").then(r=>r.json()).then(d=>{ if(d.owner) setIsOwner(true); }).catch(()=>{});
  }, []);
  const devMode = isOwner && !isNative;
  const [raporKullanildi, setRaporKullanildi] = useState(() => localStorage.getItem("sakin_rapor_used") === "1");
  const [isPremium, setIsPremium] = useState(() => localStorage.getItem("sakin_premium") === "1");
  const [purchaseLoading, setPurchaseLoading] = useState(null);
  const [purchaseError, setPurchaseError] = useState("");
  const [iapReady, setIapReady] = useState(false);
  const [productsReady, setProductsReady] = useState(false);

  useEffect(() => {
    if (!isNative) return;
    onPurchaseUpdate((purchased) => {
      if (purchased) { setIsPremium(true); haptic(ImpactStyle.Heavy); }
    });
    onProductsLoaded(() => setProductsReady(true));
    initStore().then((ok) => {
      setIapReady(ok);
      if (areProductsLoaded()) setProductsReady(true);
      if (ok) {
        const owned = isSubscribed();
        if (owned) { setIsPremium(true); }
        else { localStorage.removeItem("sakin_premium"); setIsPremium(false); }
      }
    });
  }, []);

  const handlePurchase = async (fn, id) => {
    setPurchaseLoading(id);
    setPurchaseError("");
    const r = await fn();
    setPurchaseLoading(null);
    if (r.success) { setIsPremium(true); haptic(ImpactStyle.Heavy); return; }
    if (r.cancelled || r.error === "cancelled") return;
    const errLower = (r.error || "").toLowerCase();
    if (errLower.includes("cancel") || errLower.includes("iptal")) return;
    let msg;
    if (r.error === "products_not_loaded") {
      msg = lang === "tr"
        ? "App Store ürünleri yüklenemedi. İnternet bağlantınızı kontrol edip tekrar deneyin."
        : "App Store products could not load. Check your internet connection and try again.";
    } else if (r.error === "already_owned") {
      msg = lang === "tr"
        ? "Bu ürünü zaten aldınız. 'Satın Alımları Geri Yükle' butonuna basın."
        : "You already own this product. Tap 'Restore Purchases'.";
    } else {
      msg = lang === "tr"
        ? "Satın alma tamamlanamadı. Lütfen tekrar deneyin."
        : "Purchase could not be completed. Please try again.";
    }
    setPurchaseError(msg);
  };

  const handleRestore = async () => {
    setPurchaseLoading("restore");
    setPurchaseError("");
    const r = await restorePurchases();
    setPurchaseLoading(null);
    if (r.success) { setIsPremium(true); haptic(ImpactStyle.Heavy); }
    else {
      setPurchaseError(lang === "tr"
        ? "Aktif abonelik bulunamadı."
        : "No active subscription found.");
    }
  };

  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [licenseInput, setLicenseInput] = useState("");
  const [licenseError, setLicenseError] = useState("");
  const [licenseLoading, setLicenseLoading] = useState(false);
  const validateLicense = async () => {
    const key = licenseInput.trim();
    if (!key) return;
    setLicenseLoading(true);
    setLicenseError("");
    try {
      const res = await fetch(API_BASE + "/.netlify/functions/validate-license", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ license_key: key }),
      });
      const data = await res.json();
      if (data.valid) {
        localStorage.setItem("sakin_premium", "1");
        localStorage.setItem("sakin_license_key", key);
        setIsPremium(true);
        setShowLicenseModal(false);
        setLicenseInput("");
        haptic(ImpactStyle.Heavy);
      } else {
        setLicenseError(lang === "tr" ? "Geçersiz lisans anahtarı" : "Invalid license key");
      }
    } catch {
      setLicenseError(lang === "tr" ? "Bağlantı hatası, tekrar dene" : "Connection error, try again");
    }
    setLicenseLoading(false);
  };
  const [fbOpen, setFbOpen] = useState(false);
  const [fbMsg, setFbMsg] = useState("");
  const [fbCat, setFbCat] = useState("");
  const [fbSending, setFbSending] = useState(false);
  const [fbDone, setFbDone] = useState(false);
  const sendFeedback = async () => {
    if (!fbMsg.trim() || fbSending) return;
    setFbSending(true);
    try {
      await fetch("/.netlify/functions/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: fbMsg.trim(), category: fbCat || "genel", lang, timestamp: new Date().toISOString() }),
      });
      setFbDone(true);
      setFbMsg("");
      setFbCat("");
      setTimeout(() => { setFbDone(false); setFbOpen(false); }, 2500);
    } catch { setFbDone(false); }
    setFbSending(false);
  };
  const [rehberTab, setRehberTab] = useState("reiki");
  const [chakraInput, setChakraInput] = useState("");
  const [chakraAnaliz, setChakraAnaliz] = useState("");
  const [semptomInput, setSemptomInput] = useState("");
  const [semptomAnaliz, setSemptomAnaliz] = useState("");
  const [semptomAcik, setSemptomAcik] = useState(false);
  const [reikiUsed, setReikiUsed] = useState(() => !devMode && localStorage.getItem("sakin_reiki_used") === "1");
  const [zihinselUsed, setZihinselUsed] = useState(() => !devMode && localStorage.getItem("sakin_zihinsel_used") === "1");
  // İki ayrı arama ekranı
  const [sikayet, setSikayet] = useState("");
  const [sikayetHis, setSikayetHis] = useState("");
  const [sikayetAnaliz, setSikayetAnaliz] = useState("");
  const [hastalik, setHastalik] = useState("");
  const [hastalikHis, setHastalikHis] = useState("");
  const [hastalikAnaliz, setHastalikAnaliz] = useState("");
  const [raporKopyalandi, setRaporKopyalandi] = useState(false);
  const [showOrnekler, setShowOrnekler] = useState(false);
  const [showKozmik, setShowKozmik] = useState(false);
  const [kozmikData, setKozmikData] = useState(null);
  const [kozmikLoading, setKozmikLoading] = useState(false);
  const fetchKozmik = async () => {
    if (kozmikData || kozmikLoading) return;
    setKozmikLoading(true);
    try {
      const r = await fetch(API_BASE + "/.netlify/functions/cosmic-energy");
      if (r.ok) setKozmikData(await r.json());
    } catch { /* sessiz */ }
    setKozmikLoading(false);
  };
  const [showKilavuz, setShowKilavuz] = useState(false);
  // Kişiselleştirme: kullanıcının önceki sorgu geçmişini takip et
  const [sorguGecmisi, setSorguGecmisi] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sakin_sorgu_gecmisi")||"[]"); } catch { return []; }
  });

  // ── Streak & Step Tracking ──
  const todayKey = new Date().toISOString().slice(0,10);

  // Günlük state'leri localStorage'a persist et (Safari kapatıp açınca kaybolmasın)
  useEffect(()=>{ localStorage.setItem("sakin_breath_"+todayKey, String(breathCount)); }, [breathCount, todayKey]);
  useEffect(()=>{ localStorage.setItem("sakin_aksamnote_"+todayKey, aksamNote); }, [aksamNote, todayKey]);
  useEffect(()=>{ localStorage.setItem("sakin_sukur_"+todayKey, sukur); }, [sukur, todayKey]);
  useEffect(()=>{ localStorage.setItem("sakin_ritual_"+todayKey, JSON.stringify(aksamRitualChecks)); }, [aksamRitualChecks, todayKey]);

  const [streakData, setStreakData] = useState(() => {
    try {
      const raw = localStorage.getItem("sakin_streak");
      return raw ? JSON.parse(raw) : { current: 0, best: 0, lastDate: null, badges: [] };
    } catch { return { current: 0, best: 0, lastDate: null, badges: [] }; }
  });
  const [stepsCompleted, setStepsCompleted] = useState(() => {
    try {
      const raw = localStorage.getItem("sakin_steps_" + todayKey);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });

  const markStep = (stepId) => {
    setStepsCompleted(prev => {
      const next = { ...prev, [stepId]: true };
      localStorage.setItem("sakin_steps_" + todayKey, JSON.stringify(next));
      return next;
    });
  };

  const MANDALA_STEPS = ["sabah","nefes","ses","chakra","gun","aksam","harita"];
  const completedStepCount = MANDALA_STEPS.filter(s => stepsCompleted[s]).length;
  const [gunTasksDone, setGunTasksDone] = useState(() => {
    try {
      const k = "sakin_reminders_done_" + new Date().toISOString().slice(0,10);
      const s = JSON.parse(localStorage.getItem(k)) || {};
      return Object.values(s).filter(Boolean).length;
    } catch { return 0; }
  });
  const allStepsComplete = completedStepCount === MANDALA_STEPS.length;

  // Update streak when all steps complete
  useEffect(() => {
    if (!allStepsComplete) return;
    setStreakData(prev => {
      if (prev.lastDate === todayKey) return prev;
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
      const isConsecutive = prev.lastDate === yesterday;
      const newCurrent = isConsecutive ? prev.current + 1 : 1;
      const newBest = Math.max(prev.best, newCurrent);
      const newBadges = [...prev.badges];
      [3,7,21,40].forEach(n => { if (newCurrent >= n && !newBadges.includes(n)) newBadges.push(n); });
      const next = { current: newCurrent, best: newBest, lastDate: todayKey, badges: newBadges };
      localStorage.setItem("sakin_streak", JSON.stringify(next));
      return next;
    });
  }, [allStepsComplete, todayKey]);

  useEffect(() => {
    if (isOwner && !isNative) { setIsPremium(true); setRaporKullanildi(false); setReikiUsed(false); setZihinselUsed(false); }
  }, [isOwner]);
  const [time,          setTime]          = useState(new Date());
  const [orb,           setOrb]           = useState({x:50,y:50});
  const [birthDate,      setBirthDate]      = useState(()=>localStorage.getItem("sakin_birth_date")||"");
  const [birthTime,      setBirthTime]      = useState(()=>localStorage.getItem("sakin_birth_time")||"");
  const [userName,       setUserName]       = useState(()=>localStorage.getItem("sakin_name")||"");
  const [showBirthForm,  setShowBirthForm]  = useState(false);
  const [girisPhase,     setGirisPhase]     = useState("intro"); // "intro" | "birth"
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem("sakin_intro_seen"));
  const [introPhase, setIntroPhase] = useState(0);
  const [introExiting, setIntroExiting] = useState(false);
  const [birthInput,     setBirthInput]     = useState(()=>localStorage.getItem("sakin_birth_date")||"");
  const [nameInput,      setNameInput]      = useState(()=>localStorage.getItem("sakin_name")||"");
  const [birthTimeInput, setBirthTimeInput] = useState(()=>localStorage.getItem("sakin_birth_time")||"");
  const breathRef        = useRef(null);
  const pendingBreathRef = useRef(null);
  const breathChimeRef = useRef(null);

  const playStartChime = () => {
    try {
      if (!breathChimeRef.current) {
        breathChimeRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = breathChimeRef.current;
      if (ctx.state === "suspended") ctx.resume();
      // Singing bowl çan sesi: temel frekans + harmonikler
      [[432, 0.20], [432*2.76, 0.056], [432*5.4, 0.020]].forEach(([freq, amp]) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine"; o.frequency.value = freq;
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(amp, ctx.currentTime + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.2);
        o.connect(g); g.connect(ctx.destination);
        o.start(); o.stop(ctx.currentTime + 3.2);
      });
    } catch(_) {}
  };

  // Galaktik portal açılış sesi — 3 yükselen ton + ışıltı, embed app açılırken
  const playPortalSound = () => {
    try {
      if (!breathChimeRef.current) {
        breathChimeRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = breathChimeRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const t0 = ctx.currentTime;
      // Üç yükselen sinüs notası
      [[523, 0.0, 0.6], [659, 0.12, 0.7], [880, 0.24, 0.9]].forEach(([f, delay, dur]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine"; o.frequency.setValueAtTime(f, t0 + delay);
        o.frequency.linearRampToValueAtTime(f * 1.12, t0 + delay + dur);
        g.gain.setValueAtTime(0, t0 + delay);
        g.gain.linearRampToValueAtTime(0.10, t0 + delay + 0.04);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + delay + dur);
        o.connect(g); g.connect(ctx.destination);
        o.start(t0 + delay); o.stop(t0 + delay + dur);
      });
      // Yüksek ışıltı (harmonikler)
      [1760, 2640].forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine"; o.frequency.value = f;
        const d = 0.3 + i*0.15;
        g.gain.setValueAtTime(0, t0 + 0.18 + i*0.05);
        g.gain.linearRampToValueAtTime(0.025, t0 + 0.22 + i*0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22 + d);
        o.connect(g); g.connect(ctx.destination);
        o.start(t0 + 0.18 + i*0.05); o.stop(t0 + 0.22 + d);
      });
    } catch(_) {}
  };

  const astro = birthDate ? {
    yasam:      lifePathNumber(birthDate),
    kisiselYil: personalYear(birthDate),
    burc:       zodiacSign(birthDate),
    bio:        biorhythm(birthDate),
  } : null;

  const yukselen   = birthDate && birthTime ? approxAscendant(birthDate, birthTime) : null;
  const ev12Burcu  = yukselen ? ZODIAC_ORDER[(ZODIAC_ORDER.indexOf(yukselen) - 1 + 12) % 12] : null;
  const ev12Gezegen= ev12Burcu ? EV_GEZEGEN[ev12Burcu] : null;
  const kuzeyDugum = birthDate ? approxNorthNode(birthDate) : null;
  const draconicGunes = astro && kuzeyDugum ? draconicSun(astro.burc, kuzeyDugum) : null;

  useEffect(() => { const t=setInterval(()=>setTime(new Date()),1000); return()=>clearInterval(t); },[]);
  useEffect(() => { if (isNative) SplashScreen.hide(); }, []);
  useEffect(() => { scheduleDailyReminders(lang); }, []);
  // Sakin Ailesi bridge: embed'ler kendi profil'lerini yazdığında ad/doğum bilgisini sakin_* anahtarlarına sync et
  useEffect(() => {
    if (isNative) return;
    const setIfChanged = (key, val) => {
      if (val && localStorage.getItem(key) !== val) {
        localStorage.setItem(key, val);
        if (key === "sakin_birth_date") setBirthDate(val);
        if (key === "sakin_birth_time") setBirthTime(val);
      }
    };
    const handleStorage = (e) => {
      try {
        if (!e.newValue) return;
        if (e.key === "@tura_profile" || e.key === "@mitler_profile") {
          const p = JSON.parse(e.newValue);
          if (p?.name) setIfChanged("sakin_name", String(p.name).trim());
          if (p?.birthDate) setIfChanged("sakin_birth_date", p.birthDate);
          if (typeof p?.birthHour === "number") {
            const t = String(p.birthHour).padStart(2,"0") + ":" + String(p.birthMinute || 0).padStart(2,"0");
            setIfChanged("sakin_birth_time", t);
          }
        } else if (e.key === "@tasarim_profiles") {
          const arr = JSON.parse(e.newValue);
          const p = Array.isArray(arr) ? arr[arr.length - 1] : null;
          if (p?.name) setIfChanged("sakin_name", String(p.name).trim());
          if (p?.birthDate) setIfChanged("sakin_birth_date", p.birthDate);
          if (p?.birthTime) setIfChanged("sakin_birth_time", p.birthTime);
        }
      } catch(_) {}
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);
  useEffect(() => { if (isNative && screen === "rehber") setScreen("gun"); }, [screen]);
  useEffect(() => {
    if (!showIntro) return;
    const timers = [
      setTimeout(() => { setIntroExiting(true); }, 1800),
      setTimeout(() => {
        setShowIntro(false);
        sessionStorage.setItem("sakin_intro_seen","1");
      }, 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [showIntro]);
  useEffect(() => {
    const onPop = () => {
      isPopRef.current = true;
      const hist = screenHistoryRef.current;
      if (hist.length > 1) hist.pop();
      const prev = hist[hist.length - 1] || "giris";
      setScreenRaw(prev);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (screen !== "harita") return;
    const bugun = {
      tarih: new Date().toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"}),
      _dateKey: new Date().toDateString(),
      niyet, kelimeler: selectedWords, chakra: chakra.name,
      nefes: breathCount, freqSaniye: freqListenSec, ogrendim: aksamNote, sukur
    };
    const log = JSON.parse(localStorage.getItem("sakin_log")||"[]");
    const filtered = log.filter(g=>g._dateKey!==bugun._dateKey);
    filtered.unshift(bugun);
    localStorage.setItem("sakin_log", JSON.stringify(filtered.slice(0,7)));
    setAiRapor("");
  },[screen, niyet, selectedWords, chakra.name, breathCount, freqListenSec, aksamNote, sukur]);

  const CHAKRA_KEYWORDS = [
    { idx:0, keywords:["güvensiz","korkuyorum","korku","para","maddi","güvende değil","temel","ev","aile","toprak","istikrar","aidiyetsiz","destek yok","hayatta kalamıyorum","köksüz"] },
    { idx:1, keywords:["yaratıcı","ilişki","duygu","akış","zevk","suçluluk","utanç","hissed","cinsel","sevinç","neşe","coşku","kendimi bırakamıyorum"] },
    { idx:2, keywords:["güç","kontrol","özgüven","kimlik","irade","sinir","öfke","küçüm","yetersiz","ego","cesaret","güçsüz","başaramıyorum","kendinle","kendime güvenemiyorum"] },
    { idx:3, keywords:["sevgi","sevemiyorum","sevilemiyorum","kayıp","üzüntü","acı","af","şefkat","yalnız","kalp","bağlantı","merhamet","sevilmiyorum","sevilmek"] },
    { idx:4, keywords:["ifade","söyleyemiyorum","anlatamıyorum","iletişim","ses","dürüstlük","konuşamıyorum","dinlenilmiyorum","anlaşılamıyorum","söz"] },
    { idx:5, keywords:["sezgi","karar veremiyorum","netlik","yön","hayal","anlam","amaç","kafam karışık","göremiyorum","içgüdü","belirsiz","yol bulamıyorum"] },
    { idx:6, keywords:["anlamsız","bağlantısız","spiritüel","ruh","bütünlük","evren","tanrı","amaç yok","boşluk","varoluş","neden yaşıyorum"] },
  ];
  const CHAKRA_ZIHINSEL = [
    "Sırt (alt), Böbrekler — Para ve maddi destek korkusu; eleştiri ve başarısızlık korkusu",
    "Bağırsaklar, Mide — Eski düşünceleri bırakamama; yeniliklere direnç",
    "Mide, Karaciğer — Korku, yeni fikirlere direnç; kronik öfke ve eleştiri",
    "Kalp, Sırt (üst), Akciğerler — Sevgi ve neşeyi reddetmek; duygusal destek eksikliği; üzüntü",
    "Boğaz, Kulaklar — Kendini ifade edememe, öfkeyi yutmak; duymak istemediğin şeyler",
    "Gözler, Baş Ağrısı — Geçmişi ya da geleceği görmek istememe; özeleştiri ve korku",
    "Boyun, Omuzlar — Esneklik eksikliği; aşırı sorumluluk yükü",
  ];

  function chakraEsle(input) {
    const t = (input||"").toLowerCase();
    for (const { idx, keywords } of CHAKRA_KEYWORDS) {
      if (keywords.some(k => t.includes(k))) return idx;
    }
    return 4; // default: Boğaz
  }

  // Önceki sorgulara göre kişiselleştirme bağlamı oluştur
  const kisiselProfil = () => {
    const parts = [];
    if (birthDate) parts.push(`Doğum: ${birthDate}`);
    if (birthTime) parts.push(`Saat: ${birthTime}`);
    if (astro) {
      parts.push(`Burç: ${astro.burc}`);
      parts.push(`Yaşam Yolu: ${astro.yasam}`);
      parts.push(`Kişisel Yıl: ${astro.kisiselYil}`);
      parts.push(`Biyoritm: F%${astro.bio.fiziksel} D%${astro.bio.duygusal} Z%${astro.bio.zihinsel}`);
    }
    if (yukselen) parts.push(`Yükselen: ${yukselen}`);
    if (ev12Gezegen) parts.push(`12.Ev: ${ev12Gezegen}`);
    if (niyet) parts.push(`Bugünkü niyet: ${niyet}`);
    if (selectedWords?.length) parts.push(`Niyet kelimeleri: ${selectedWords.join(", ")}`);
    if (chakra?.name) parts.push(`Seçili çakra: ${chakra.name}`);
    if (breathCount > 0) parts.push(`Nefes sayısı: ${breathCount}`);
    if (streakData?.current > 0) parts.push(`Seri: ${streakData.current} gün`);
    const seed = Date.now().toString(36) + Math.random().toString(36).slice(2,6);
    parts.push(`Oturum: ${seed}`);
    return parts.length > 0 ? `\nKişisel profil:\n${parts.join(" | ")}\nBu bilgileri yanıtına derinlemesine yansıt — her kişi için farklı, özgün ve kişiye özel yanıt üret. Aynı kalıpları tekrarlama, her yanıt benzersiz olsun.\n` : "";
  };

  function kisiselBaglamOlustur(mevcutGecmis) {
    if (!mevcutGecmis || mevcutGecmis.length === 0) return "";
    const son3 = mevcutGecmis.slice(-3);
    const konular = son3.map(s => `• ${s.tur}: "${s.konu.slice(0,60)}${s.konu.length>60?"…":""}"`).join("\n");
    const sayac = mevcutGecmis.length;
    const tonYonlendirmesi = sayac === 1
      ? "Bu kişi seninle ilk kez konuşuyor; nazik ve tanışır gibi yaklaş."
      : sayac <= 3
      ? "Bu kişi seni birkaç kez ziyaret etti; biraz daha tanıdık ve kişisel bir dil kullanabilirsin."
      : "Bu kişi seninle birden çok kez paylaştı; onu artık tanıyorsun gibi; önceki temalarla bağlantı kur, aynı kalıpları tekrarlama, format ve yaklaşımını çeşitlendir.";
    return `\nKullanıcının önceki paylaşımları:\n${konular}\n${tonYonlendirmesi}\n`;
  }

  function sorguKaydet(tur, konu) {
    setSorguGecmisi(prev => {
      const yeni = [...prev, { tur, konu, zaman: new Date().toISOString() }].slice(-10);
      localStorage.setItem("sakin_sorgu_gecmisi", JSON.stringify(yeni));
      return yeni;
    });
  }

  const generateChakraAnaliz = async () => {
    if (!chakraInput.trim()) return;
    setChakraAnaliz("__loading__");
    const idx = chakraEsle(chakraInput);
    const ch = CHAKRAS_7[idx];
    const zihinsel = CHAKRA_ZIHINSEL[idx];
    const astroText2 = astro ? `Kullanıcının doğum haritası: ${astro.burc} burcu, Yaşam Yolu Sayısı ${astro.yasam}, Kişisel Yıl ${astro.kisiselYil}${birthTime ? `, Doğum Saati ${birthTime}` : ""}${yukselen ? `, Yükselen ${yukselen}` : ""}${ev12Gezegen ? `, 12. Ev Gezegeni: ${ev12Gezegen}` : ""}.` : "";
    const kisiselBagiam = kisiselBaglamOlustur(sorguGecmisi);
    try {
      const res = await fetch(AI_CALL_URL, {
        method:"POST",
        headers:{"Content-Type":"text/plain"},
        body: JSON.stringify({
          model:"llama-3.3-70b-versatile", max_tokens:1100,
          system:`Sen derin bir ayna ve enerji rehberisin. YALNIZCA Türkçe yaz; ş, ğ, ı, ü, ö, ç, Ş, Ğ, İ, Ü, Ö, Ç gibi Türkçe karakterleri eksiksiz ve doğru kullan. Arapça, Japonca, Çince veya başka alfabe kullanma. "Sen" diye hitap et. Asla tıbbi tavsiye verme, teşhis koyma, tedavi önerme. Yanıtının sonuna mutlaka şunu ekle: "Bu içerik bilgilendirme amaçlıdır, tıbbi tavsiye değildir. Sağlık sorunlarında bir uzmana danışın."
Dil tonu: Kendinden emin, net, şiirsel ve şefkatli. Bilgiyi doğrudan ver. Şu kalıpları kesinlikle kullanma: "olası ki", "olabilir", "belki", "belki de", "acaba", "düşünülebilir", "söylenebilir", "diyebiliriz", "ihtimal", "muhtemelen". Cümleler kararlı ve içten olsun.
Kişinin sorusunun kaynağına nokta atışı işaret et. Nereye bakabileceğini ve kendine nasıl sevgi sunabileceğini hatırlat.
Yanıtının en başına şu cümleyi ekle: "Bu yanıt sana özeldir. Düşünce dünyanda sana destek olan bir yardımcıdır. Kalbinin süzgecinden geçir, seni ısıtan kısmını al."
${kisiselProfil()}${kisiselBagiam}${KITAP_BILGELIGI}`,
          messages:[{ role:"user", content:`Kullanıcı şunu yazdı: "${sanitizeInput(chakraInput)}"

İlgili çakra: ${ch.name} Çakrası (${ch.element} elementi, ${ch.hz} Hz). Açıklaması: "${ch.desc}"
Zihinsel-bedensel bağlantısı: ${zihinsel}
${astroText2}

${NEFES_REHBERI}

${UYGULAMA_BOLUMLER}

Yanıtını şu formatta ver:

**Ayna**
(Bu çakrayı, kişinin yazdığını, kaynak bilgeliğini ve doğum haritasını bir arada tut — şefkatli bir ayna gibi yansıt. Sorunun kaynağına net ve doğrudan işaret et. Kişinin nereye bakabileceğini göster, kendine sevgi sunmayı hatırlat. Şiirsel, şefkatli, detaylı — 6-7 cümle)

**Senin için**
Beslenme: (bu çakra ve duruma özel 3-4 besin veya bitki çayı — kısa, net)
Hareket: (2-3 somut egzersiz, yoga pozu veya beden pratiği)
Nefes: Uygun nefes modunu öner. Mod adını şu şekilde link olarak yaz: [[NEFES:Diyafram]] veya [[NEFES:4-7-8]] gibi. Geçerli mod adları: Akciğer, Sakinleştirici, Diyafram, Kutu, 4-7-8, Standart. Yanına kısa nedenini ekle.
Uygulama: Uygulamadan bir bölüm öner. Bölüm adını şu şekilde link olarak yaz: [[EKRAN:terapi]] veya [[EKRAN:nefes]] gibi. Geçerli ekran adları: terapi, nefes, rehber, sabah, aksam. Yanına kısa açıklama ekle.

**Reiki ile Enerji Aktarımı**
(Hangi el pozisyonu, hangi frekans, nasıl bir niyet — somut 2-3 adım. Ardından şiirsel, zarif bir kapanışla bitir: enerji akarken kalbinin sesine kulak vermeyi, hangi eski kalıbın yumuşamak istediğini hissetmeyi davet et; eğer içinde bir açılma, bir farkındalık doğarsa — Cho Ku Rei ile onu sistemine mühürlemesini, bu yeni farkındalığı kendi yaşam koduna işlemesini, bedenine ve şimdisine taşımasını hatırlat. 2-3 cümle, şiirsel. Kapanışı güçlü ve kararlı yap.)` }],
        }),
      });
      const d = await res.json();
      if (!res.ok || d.error) { setChakraAnaliz("Hata: " + (d.error || res.status)); return; }
      setChakraAnaliz(d?.text || "Analiz alınamadı.");
      sorguKaydet("çakra", chakraInput);
    } catch(e) {
      setChakraAnaliz((lang==="tr" ? "Bağlantı hatası: " : "Connection error: ") + (e?.message || String(e)));
      console.error("ChakraAnaliz error:", e);
    }
  };

  const ZIHINSEL_LISTE = [
    { organ:"Baş Ağrısı",    neden:"Kendini küçümseme, özeleştiri, korku" },
    { organ:"Boyun",          neden:"Esneklik eksikliği, inatçılık, başkalarının bakış açısını görmek istememek" },
    { organ:"Omuzlar",        neden:"Aşırı sorumluluk yükü, yaşamın yük gibi hissettirmesi" },
    { organ:"Kalp",           neden:"Sevgi ve neşeyi reddetmek, sertleşen kalp" },
    { organ:"Sırt (üst)",     neden:"Duygusal destek eksikliği, sevilmediği hissi" },
    { organ:"Sırt (alt)",     neden:"Para ve maddi destek korkusu" },
    { organ:"Mide",           neden:"Yenilikleri sindirememe, korku, yeni fikirlere direnç" },
    { organ:"Bağırsaklar",    neden:"Eski düşünceleri bırakamama, geçmişe takılma" },
    { organ:"Kabız",          neden:"Eski düşünceleri ve alışkanlıkları bırakamama, geçmişe tutunma, korku" },
    { organ:"Diz",            neden:"Ego, gurur, inat — eğilmemek" },
    { organ:"Deri",           neden:"Kimlik ve sınır kaybı, başkalarının tehdit olarak hissedilmesi" },
    { organ:"Boğaz",          neden:"Kendini ifade edememe, öfkeyi yutmak" },
    { organ:"Gözler",         neden:"Geçmişi ya da geleceği görmek istememe" },
    { organ:"Kulaklar",       neden:"Duymak istemediğin şeyler, öfke" },
    { organ:"Akciğerler",     neden:"Hayatı tam almayı reddetme, üzüntü" },
    { organ:"Karaciğer",      neden:"Kronik öfke, eleştiri, akıl yürütme" },
    { organ:"Böbrekler",      neden:"Eleştiri, hayal kırıklığı, başarısızlık korkusu" },
    { organ:"Uyku",           neden:"Hayattan uzaklaşma isteği, güvensizlik, zihnin durduramama" },
    { organ:"Tansiyon",       neden:"Uzun süreli çözümsüz duygusal sorunlar, aşırı kontrol ihtiyacı" },
    { organ:"Yorgunluk",      neden:"Direnç, sıkılmışlık, sevgisiz yaşama" },
    { organ:"Ağrı",           neden:"Suçluluk duygusu — ceza ihtiyacı" },
    { organ:"Kilo",           neden:"Korku, korunma ihtiyacı, duyguları bastırma" },
  ];
  const KITAP_BILGELIGI = `KİTAPLARDAN ÖZET BİLGELİK:
• Jung (Kırmızı Kitap): Gölge bütünleşme — dışarıda rahatsız edici bulduğun her şey içinde tanımadığın bir parçandır. Bastırılan enerji yansıma olarak geri döner. Bütünleşme = içindeki altın madeni bulmak.
• Kryon (DNA'nın 12 Tabakası): DNA bilinçle rezonans kurar; niyet, minnet ve frekans yükseltmeyle uyku halindeki potansiyel aktive olur. Sen tanrısal bir varlıksın, bunu hatırlamak için buradasın.
• Tao Te Ching: Wu wei — zorlama değil akış. En derin güç direnmeden akan sudur. Basitlik ve boşluk sonsuz potansiyel taşır. Yanıt zorlamada değil sessizlikte gizlidir.
• Yaşam Çiçeği (Drunvalo): Kutsal geometri evrenin dilidir; her çakra, her nefes, her hücre ilahi bir örüntü taşır. Merkaba ışık bedenini aktive eder.
• Bir'in Yasası (Ra Materyali): Her şey tek bir bilinçtir. Sevgi evrenin birleştirici gücüdür. Başkasına hizmet kendi evrimine katkıdır. Sen hem öğreten hem öğrenilensin.`;

  const PREMIUM_YONLENDIRME = `\n\n_(Daha derin analiz, kişisel terapi önerileri ve detaylı çakra haritası için Premium'u keşfet.)_`;

  const NEFES_REHBERI = `UYGULAMADAKI NEFES MODLARI (en uygununu öner):
• Standart (4-1.5-4): Genel denge, farkındalık, her durum için başlangıç
• Diyafram (4-0-6): Stres, mide/karın gerginliği, duygusal boşalma
• Akciğer (5-2-7): Akciğer sorunları, boğaz, derinleşme, yavaşlama
• 4-7-8: Anksiyete, uyku sorunları, panik, sinir sistemi sakinleştirme
• Kutu (4-4-4-4): Zihin odağı, öfke, stres yönetimi
• Sakinleştirici (4-2-8): Akut gerginlik, öfke, ani sinir sistemi dengesi`;

  const UYGULAMA_BOLUMLER = `UYGULAMANIN BÖLÜMLERİ (yönlendirme için):
• Çakra Terapisi (💜): İlgili çakraya özel 60 saniyelik enerji seansı
• Nefes (🫧): Beden-zihin entegrasyonu için nefes modu seçimi
• Ayna (🪞): İçsel soruları derinlemesine işlemek için
• Sabah Niyeti (🌅): Güne niyet ve enerji belirlemek için
• Akşam Kapanışı (🌙): Günü tamamlamak, şükür ve öğrenim için`;

  const REIKI_BILGI = `REİKİ KAPSAMLI REHBER (Kaynak: Reiki 1-2-3 Eğitim Notları, L.Öznur Açıkalın — Usui Işık Çemberi Ekolü)

5 TEMEL PRENSİP (Dr. Mikao Usui):
Bugün bana verilen tüm nimetler için minnettarım.
Bugün hiçbir şey için endişe etmiyorum.
Bugün hiçbir şeye kızmıyorum.
Bugün dürüstüm.
Bugün tüm varlıklara karşı nazik ve saygılıyım.

ÇAKRALAR VE ENERJİ MERKEZLERİ:
• Kök Çakra (Kırmızı, 396Hz) — güvenlik, maddi destek, hayatta kalma, topraklanma; böbrekler, omurilik, siyatik siniri. Depresyon ve korku bu çakrayı kapatır.
• Sakral Çakra (Turuncu, 417Hz) — yaratıcılık, duygular, cinsellik, ilişkiler; üreme organları, mesane, bel. Boğaz çakrasıyla koordineli çalışır.
• Solar Pleksus (Sarı, 528Hz) — kişisel güç, irade, özgüven, karmik bağ; sindirim sistemi, dalak, karaciğer, pankreas. En güçlü çakralardan biri; duygusal bedene açılan kapıdır.
• Kalp Çakra (Yeşil, 639Hz) — sevgi, şefkat, bağışlama, bağlantı; kalp, akciğerler, dolaşım sistemi.
• Boğaz Çakra (Mavi, 741Hz) — ifade, dürüstlük, iletişim; boğaz, tiroit, kulaklar. Sakral çakrasıyla koordineli çalışır.
• Üçüncü Göz (İndigo, 852Hz) — sezgi, netlik, içgüdü, görüş; alın, sinirler, göz. Kök çakrasıyla koordineli çalışır.
• Taç Çakra (Mor/Beyaz, 963Hz) — ruhsal bağlantı, bilinç, bütünlük, ilahi enerji.

HASTALIKLARA ÇAKRA & EL POZİSYONU YAKLAŞIMI:
• Baş ağrısı, göz, sinüs: Üçüncü Göz + Taç çakra, başın arkası
• Boğaz, kulak, iletişim: Boğaz Çakra (yukarı+aşağı)
• Kalp, akciğer, dolaşım: Kalp Çakra (ön + arka)
• Mide, sindirim, bağırsak, kabız: Solar Pleksus + Karın çakrası + karaciğer
• Sırt ağrısı: Solar Pleksus + Sakral + boyun arkası
• Böbrek, mesane, bel: Kök + Sakral çakra
• Depresyon: Kafa + Sakral + Kök çakra
• Anksiyete, panik, korku: Solar Pleksus + Kök çakra
• Cilt sorunları: Solar Pleksus + etkilenen bölge
• Kanser: Tüm vücut tedavisi, etkilenen bölgeye 20-30dk
• Yorgunluk, bağışıklık: Dalak + Solar Pleksus + tüm vücut

REİKİ SEMBOLLERİ:
• Cho Ku Rei (CKR): Güç sembolü — enerjiyi yoğunlaştırır, koruma ve temizleme
• Sei He Ki (SHK): Zihinsel-duygusal sembol — bilinçaltı kodlama, alışkanlıkları dönüştürme
• Hon Sha Ze Sho Nen (HSZN): Uzaktan Reiki — geçmişe/geleceğe enerji gönderme
• Dai Ko Myo (DKM): Master sembolü — ruhsal şifa, en yüksek frekans, kalp çakrasından kalbe

TEMEL ANLAYIŞ:
Hastalıklar zihinsel ve duygusal kalıpların fiziksel bedende görünmesidir. Şifa çok boyutludur: fiziksel, duygusal, zihinsel ve ruhsal boyutları birlikte kapsar. Kişi hastalığın nedenini anlayıp içselleştiremediği sürece hastalık tekrar eder. Koşulsuz sevgi her şeyin şifasıdır — kişi kendini koşulsuz sevip kabul edebildiğinde gerçek şifa başlar.`;

  const LOUISE_HAY_REHBER = `LOUISE L. HAY — DÜŞÜNCE GÜCÜYLE TEDAVİ (Kaynak: Kitap)

TEMEL FELSEFE:
Yaşamımızdaki her şey zihinsel düşünce kalıplarının sonucudur. Hastalıklar, içimizde bastırılmış olumsuz düşünce kalıplarının bedende ifade bulmasıdır. Zihinsel kalıbı değiştirince beden de değişir. Tüm şifanın temeli özsevgidir — kendini sevmek ve onaylamak her şeyi değiştirir. Geçmişi bağışlamak ise özgürleşmenin kapısıdır.

BEDEN-ZİHİN BAĞLANTISI:
• Akciğer sorunları: Yaşamdan korkmak, yaşamı dolu dolu almayı reddetmek, derin üzüntü, kendini değersiz bulmak
• Kalp sorunları: Uzun süreli çözülmemiş duygusal sorunlar, neşeyi reddetmek, sevilmediğini hissetmek, sertleşen kalp
• Sırt (alt) ağrısı: Para ve maddi destek korkusu, ekonomik endişe, eleştirilmek ve başarısızlık korkusu
• Sırt (üst) ağrısı: Duygusal destek eksikliği, sevilmediğini hissetmek, destek görememe
• Boyun sorunları: Esneksizlik, inatçılık, başka bakış açılarını görmek istememek
• Omuz ağrısı: Aşırı sorumluluk yükü, yaşamın yük gibi hissettirmesi
• Baş ağrısı: Kendini küçümseme, özeleştiri, bastırılmış öfke, kontrol ihtiyacı
• Mide sorunları: Yenilikleri sindirememe, korku, yeni fikirlere direnç
• Bağırsak/kabız: Eski düşünceleri ve kalıpları bırakamama, geçmişe takılma
• Boğaz sorunları: Kendini ifade edememe, öfkeyi yutmak, yaratıcılığı bastırmak
• Kalp çarpıntısı: Panik, güvensizlik, aşırı heyecan, aşırı kontrol çabası
• Cilt sorunları: Kimlik ve sınır kaybı, başkalarının tehdit hissettirmesi
• Göz sorunları: Geçmişi ya da geleceği görmek istememe, çevreden duyulan korku
• Kulak sorunları: Duymak istemediğin şeyler, öfke, duymayı reddetmek
• Diz sorunları: Ego, gurur, inat — eğilmemek, esneyememek
• Uyku sorunları: Korku, güvensizlik, zihnin duramaması, hayattan kaçma isteği
• Kilo sorunları: Korku, korunma ihtiyacı, duyguları bastırma, sevilmemekten korkma
• Yorgunluk: Direnç, sıkılmışlık, sevgisiz yaşama, anlam yoksunluğu
• Tansiyon (yüksek): Uzun süreli çözülmemiş duygusal sorunlar, aşırı kontrol ihtiyacı
• Alerjiler: Kendi gücünü yadsımak; kime ya da neye karşı reaksiyon veriyorsun?
• Depresyon: Bastırılmış öfke, umutsuzluk, kendini küçümseme, yaşam sevincini kaybetmek
• Anksiyete/panik: Yaşama güvenmemek, kontrol ihtiyacı, gelecek korkusu
• Anemi: Yaşam sevincinden yoksunluk, "evet ama" yaklaşımı, yetersizlik duygusu
• Karaciğer sorunları: Kronik öfke, eleştiri, kırgınlık, acı duygular
• Böbrek sorunları: Hayal kırıklığı, başarısızlık korkusu, eleştiri
• Tiroit sorunları: Kişisel iradenin engellenmesi, "benim sıram ne zaman gelecek?"

ŞİFA YAKLAŞIMI:
1. Hastalığın zihinsel nedenini fark et ve kabul et
2. Kendini ve geçmişini bağışla — suçlamak enerji çalar
3. Olumlu düşünce kalıplarıyla eski kalıpları dönüştür
4. Kendini sevmeyi öğren — bu tüm şifanın temelidir`;

  const generateSemptomAnaliz = async () => {
    if (!semptomInput.trim()) return;
    setSemptomAnaliz("__loading__");
    const zihinselListeText = ZIHINSEL_LISTE.map(z=>`${z.organ}: ${z.neden}`).join("\n");
    const astroText3 = astro ? `Kullanıcının doğum haritası: ${astro.burc} burcu, Yaşam Yolu Sayısı ${astro.yasam}, Kişisel Yıl ${astro.kisiselYil}${birthTime ? `, Doğum Saati ${birthTime}` : ""}${yukselen ? `, Yükselen ${yukselen}` : ""}${ev12Gezegen ? `, 12. Ev Gezegeni: ${ev12Gezegen}` : ""}.` : "";
    const kisiselBagiam = kisiselBaglamOlustur(sorguGecmisi);
    try {
      const res = await fetch(AI_CALL_URL, {
        method:"POST",
        headers:{"Content-Type":"text/plain"},
        body: JSON.stringify({
          model:"llama-3.3-70b-versatile", max_tokens:1200,
          system:`Sen derin bir ayna ve enerji rehberisin. YALNIZCA Türkçe yaz; ş, ğ, ı, ü, ö, ç, Ş, Ğ, İ, Ü, Ö, Ç gibi Türkçe karakterleri eksiksiz ve doğru kullan. Arapça, Japonca, Çince veya başka alfabe kullanma. "Sen" diye hitap et. Asla tıbbi tavsiye verme, teşhis koyma, tedavi önerme. Yanıtının sonuna mutlaka şunu ekle: "Bu içerik bilgilendirme amaçlıdır, tıbbi tavsiye değildir. Sağlık sorunlarında bir uzmana danışın."
Dil tonu: Kendinden emin, net, şiirsel ve şefkatli. Bilgiyi doğrudan ver. Şu kalıpları kesinlikle kullanma: "olası ki", "olabilir", "belki", "belki de", "acaba", "düşünülebilir", "söylenebilir", "diyebiliriz", "ihtimal", "muhtemelen". Cümleler kararlı ve içten olsun.
Kişinin sorusunun kaynağına nokta atışı işaret et. Nereye bakabileceğini ve kendine nasıl sevgi sunabileceğini hatırlat.
Yanıtının en başına şu cümleyi ekle: "Bu yanıt sana özeldir. Düşünce dünyanda sana destek olan bir yardımcıdır. Kalbinin süzgecinden geçir, seni ısıtan kısmını al."
${kisiselProfil()}${kisiselBagiam}${KITAP_BILGELIGI}`,
          messages:[{ role:"user", content:`Kullanıcının semptomu: "${sanitizeInput(semptomInput)}"

${REIKI_BILGI}

${LOUISE_HAY_REHBER}

Zihinsel nedenler:
${zihinselListeText}

${astroText3}

${NEFES_REHBERI}

${UYGULAMA_BOLUMLER}

Yanıtını şu formatta ver:

**Ayna**
(Semptomu, ilgili çakrayı, kaynak bilgeliğini ve doğum haritasını bir arada tut — şefkatli bir ayna gibi yansıt. Sorunun kaynağına net ve doğrudan işaret et. Kişinin nereye bakabileceğini göster, kendine sevgi sunmayı hatırlat. Şiirsel, şefkatli, detaylı — 6-7 cümle)

**Senin için**
Beslenme: (bu semptom ve duruma özel 3-4 besin veya bitki çayı — kısa, net)
Hareket: (2-3 somut egzersiz, yoga pozu veya beden pratiği)
Nefes: Uygun nefes modunu öner. Mod adını şu şekilde link olarak yaz: [[NEFES:Diyafram]] veya [[NEFES:4-7-8]] gibi. Geçerli mod adları: Akciğer, Sakinleştirici, Diyafram, Kutu, 4-7-8, Standart. Yanına kısa nedenini ekle.
Uygulama: Uygulamadan bir bölüm öner. Bölüm adını şu şekilde link olarak yaz: [[EKRAN:terapi]] veya [[EKRAN:nefes]] gibi. Geçerli ekran adları: terapi, nefes, rehber, sabah, aksam. Yanına kısa açıklama ekle.

**Reiki ile Enerji Aktarımı**
(El pozisyonu, frekans müziği, niyet — somut 2-3 adım. Ardından şiirsel, zarif bir kapanışla bitir: enerji akarken kalbinin sesine kulak vermeyi, hangi eski kalıbın yumuşamak istediğini hissetmeyi davet et; eğer içinde bir açılma, bir farkındalık doğarsa — Cho Ku Rei ile onu sistemine mühürlemesini, bu yeni farkındalığı kendi yaşam koduna işlemesini, bedenine ve şimdisine taşımasını hatırlat. 2-3 cümle, şiirsel. Kapanışı güçlü ve kararlı yap.)` }],
        }),
      });
      const d = await res.json();
      if (!res.ok || d.error) { setSemptomAnaliz("Hata: " + (d.error || res.status)); return; }
      setSemptomAnaliz(d?.text || "Analiz alınamadı.");
      sorguKaydet("semptom", semptomInput);
    } catch {
      setSemptomAnaliz("Bağlantı hatası.");
    }
  };

  const generateSikayetAnaliz = async () => {
    if (!sikayet.trim()) return;
    setSikayetAnaliz("__loading__");
    const zihinselListeText = ZIHINSEL_LISTE.map(z=>`${z.organ}: ${z.neden}`).join("\n");
    const astroTxt = astro ? `Kullanıcının doğum haritası: ${astro.burc} burcu, Yaşam Yolu ${astro.yasam}, Kişisel Yıl ${astro.kisiselYil}${birthTime ? `, Doğum Saati ${birthTime}` : ""}${yukselen ? `, Yükselen ${yukselen}` : ""}${ev12Gezegen ? `, 12. Ev Gezegeni: ${ev12Gezegen}` : ""}.` : "";
    const kisiselBagiam = kisiselBaglamOlustur(sorguGecmisi);
    try {
      const res = await fetch(AI_CALL_URL, {
        method:"POST",
        headers:{"Content-Type":"text/plain"},
        body: JSON.stringify({
          model:"llama-3.3-70b-versatile", max_tokens:1100,
          system:`Sen derin bir ayna ve enerji rehberisin. YALNIZCA Türkçe yaz; ş, ğ, ı, ü, ö, ç, Ş, Ğ, İ, Ü, Ö, Ç gibi Türkçe karakterleri eksiksiz ve doğru kullan. Arapça, Japonca, Çince veya başka alfabe kullanma. "Sen" diye hitap et. Asla tıbbi tavsiye verme, teşhis koyma, tedavi önerme. Yanıtının sonuna mutlaka şunu ekle: "Bu içerik bilgilendirme amaçlıdır, tıbbi tavsiye değildir. Sağlık sorunlarında bir uzmana danışın."
Dil tonu: Kendinden emin, net, şiirsel ve şefkatli. Bilgiyi doğrudan ver. Şu kalıpları kesinlikle kullanma: "olası ki", "olabilir", "belki", "belki de", "acaba", "düşünülebilir", "söylenebilir", "diyebiliriz", "ihtimal", "muhtemelen". Cümleler kararlı ve içten olsun.
Kişinin sorusunun kaynağına nokta atışı işaret et. Nereye bakabileceğini ve kendine nasıl sevgi sunabileceğini hatırlat.
Yanıtının en başına şu cümleyi ekle: "Bu yanıt sana özeldir. Düşünce dünyanda sana destek olan bir yardımcıdır. Kalbinin süzgecinden geçir, seni ısıtan kısmını al."
${kisiselProfil()}${kisiselBagiam}${KITAP_BILGELIGI}`,
          messages:[{ role:"user", content:`Kullanıcının sorusu/şikayeti: "${sanitizeInput(sikayet)}"${sikayetHis ? `\nHissi: "${sanitizeInput(sikayetHis)}"` : ""}

${REIKI_BILGI}

${LOUISE_HAY_REHBER}

Zihinsel nedenler:
${zihinselListeText}
${astroTxt}

${NEFES_REHBERI}

${UYGULAMA_BOLUMLER}

Yanıtını şu formatta ver:

**Ayna**
(Soruyu/şikayeti, ilgili çakrayı, kaynak bilgeliğini ve doğum haritasını bir arada tut — şefkatli bir ayna gibi yansıt. Sorunun kaynağına net ve doğrudan işaret et. Kişinin nereye bakabileceğini göster, kendine sevgi sunmayı hatırlat. Şiirsel, şefkatli, detaylı — 6-7 cümle)

**Senin için**
Beslenme: (bu konu ve duruma özel 3-4 besin veya bitki çayı — kısa, net)
Hareket: (2-3 somut egzersiz, yoga pozu veya beden pratiği)
Nefes: Uygun nefes modunu öner. Mod adını şu şekilde link olarak yaz: [[NEFES:Diyafram]] veya [[NEFES:4-7-8]] gibi. Geçerli mod adları: Akciğer, Sakinleştirici, Diyafram, Kutu, 4-7-8, Standart. Yanına kısa nedenini ekle.
Uygulama: Uygulamadan bir bölüm öner. Bölüm adını şu şekilde link olarak yaz: [[EKRAN:terapi]] veya [[EKRAN:nefes]] gibi. Geçerli ekran adları: terapi, nefes, rehber, sabah, aksam. Yanına kısa açıklama ekle.

**Reiki ile Enerji Aktarımı**
(El pozisyonu, niyet, frekans müziği — somut 2-3 adım. Ardından şiirsel, zarif bir kapanışla bitir: enerji akarken kalbinin sesine kulak vermeyi, hangi eski kalıbın yumuşamak istediğini hissetmeyi davet et; eğer içinde bir açılma, bir farkındalık doğarsa — Cho Ku Rei ile onu sistemine mühürlemesini, bu yeni farkındalığı kendi yaşam koduna işlemesini, bedenine ve şimdisine taşımasını hatırlat. 2-3 cümle, şiirsel. Kapanışı güçlü ve kararlı yap.)` }],
        }),
      });
      const d = await res.json();
      if (!res.ok || d.error) { setSikayetAnaliz("Hata: " + (d.error || res.status)); return; }
      setSikayetAnaliz(d?.text || "Analiz alınamadı.");
      sorguKaydet("şikayet", sikayet);
    } catch(e) { setSikayetAnaliz((lang==="tr" ? "Bağlantı hatası: " : "Connection error: ") + (e?.message || String(e))); console.error("SikayetAnaliz error:", e); }
  };

  const generateHastalikAnaliz = async () => {
    if (!hastalik.trim()) return;
    setHastalikAnaliz("__loading__");
    const zihinselListeText = ZIHINSEL_LISTE.map(z=>`${z.organ}: ${z.neden}`).join("\n");
    const astroTxt = astro ? `Kullanıcının doğum haritası: ${astro.burc} burcu, Yaşam Yolu ${astro.yasam}, Kişisel Yıl ${astro.kisiselYil}${birthTime ? `, Doğum Saati ${birthTime}` : ""}${yukselen ? `, Yükselen ${yukselen}` : ""}${ev12Gezegen ? `, 12. Ev Gezegeni: ${ev12Gezegen}` : ""}.` : "";
    const kisiselBagiam = kisiselBaglamOlustur(sorguGecmisi);
    try {
      const res = await fetch(AI_CALL_URL, {
        method:"POST",
        headers:{"Content-Type":"text/plain"},
        body: JSON.stringify({
          model:"llama-3.3-70b-versatile", max_tokens:1300,
          system:`Sen derin bir ayna ve enerji rehberisin. YALNIZCA Türkçe yaz; ş, ğ, ı, ü, ö, ç, Ş, Ğ, İ, Ü, Ö, Ç gibi Türkçe karakterleri eksiksiz ve doğru kullan. Arapça, Japonca, Çince veya başka alfabe kullanma. "Sen" diye hitap et. Asla tıbbi tavsiye verme, teşhis koyma, tedavi önerme. Yanıtının sonuna mutlaka şunu ekle: "Bu içerik bilgilendirme amaçlıdır, tıbbi tavsiye değildir. Sağlık sorunlarında bir uzmana danışın."
Dil tonu: Kendinden emin, net, şiirsel ve şefkatli. Bilgiyi doğrudan ver. Şu kalıpları kesinlikle kullanma: "olası ki", "olabilir", "belki", "belki de", "acaba", "düşünülebilir", "söylenebilir", "diyebiliriz", "ihtimal", "muhtemelen". Cümleler kararlı ve içten olsun.
Kişinin sorusunun kaynağına nokta atışı işaret et. Nereye bakabileceğini ve kendine nasıl sevgi sunabileceğini hatırlat.
Yanıtının en başına şu cümleyi ekle: "Bu yanıt sana özeldir. Düşünce dünyanda sana destek olan bir yardımcıdır. Kalbinin süzgecinden geçir, seni ısıtan kısmını al."
${kisiselProfil()}${kisiselBagiam}${KITAP_BILGELIGI}`,
          messages:[{ role:"user", content:`Hastalık: "${sanitizeInput(hastalik)}"${hastalikHis ? `\nNasıl hissediyorum: "${sanitizeInput(hastalikHis)}"` : ""}

${REIKI_BILGI}

${LOUISE_HAY_REHBER}

Zihinsel nedenler:
${zihinselListeText}
${astroTxt}

${NEFES_REHBERI}

${UYGULAMA_BOLUMLER}

Yanıtını şu formatta ver:

**Ayna**
(Hastalığı, ilgili çakrayı, kaynak bilgeliğini ve doğum haritasını bir arada tut — şefkatli bir ayna gibi yansıt. Sorunun kaynağına net ve doğrudan işaret et. Kişinin nereye bakabileceğini göster, kendine sevgi sunmayı hatırlat. Şiirsel, şefkatli, detaylı — 6-7 cümle)

**Senin için**
Beslenme: (bu hastalık ve duruma özel 3-4 besin veya bitki çayı — kısa, net)
Hareket: (2-3 somut egzersiz, yoga pozu veya beden pratiği)
Nefes: Uygun nefes modunu öner. Mod adını şu şekilde link olarak yaz: [[NEFES:Diyafram]] veya [[NEFES:4-7-8]] gibi. Geçerli mod adları: Akciğer, Sakinleştirici, Diyafram, Kutu, 4-7-8, Standart. Yanına kısa nedenini ekle.
Uygulama: Uygulamadan bir bölüm öner. Bölüm adını şu şekilde link olarak yaz: [[EKRAN:terapi]] veya [[EKRAN:nefes]] gibi. Geçerli ekran adları: terapi, nefes, rehber, sabah, aksam. Yanına kısa açıklama ekle.

**Reiki ile Enerji Aktarımı**
(El pozisyonu, frekans, niyet — somut 2-3 adım. Ardından şiirsel, zarif bir kapanışla bitir: enerji akarken kalbinin sesine kulak vermeyi, hangi eski kalıbın yumuşamak istediğini hissetmeyi davet et; eğer içinde bir açılma, bir farkındalık doğarsa — Cho Ku Rei ile onu sistemine mühürlemesini, bu yeni farkındalığı kendi yaşam koduna işlemesini, bedenine ve şimdisine taşımasını hatırlat. 2-3 cümle, şiirsel. Kapanışı güçlü ve kararlı yap.)` }],
        }),
      });
      const d = await res.json();
      if (!res.ok || d.error) { setHastalikAnaliz("Hata: " + (d.error || res.status)); return; }
      setHastalikAnaliz(d?.text || "Analiz alınamadı.");
      sorguKaydet("hastalık", hastalik);
    } catch(e) { setHastalikAnaliz((lang==="tr" ? "Bağlantı hatası: " : "Connection error: ") + (e?.message || String(e))); console.error("HastalikAnaliz error:", e); }
  };

  const generateRapor = async () => {
    const gunler = JSON.parse(localStorage.getItem("sakin_log")||"[]");
    if (!gunler.length) return;

    // IP bazlı kontrol
    try {
      const ipRes = await fetch("https://api.ipify.org?format=json");
      const { ip } = await ipRes.json();
      const kullanim = JSON.parse(localStorage.getItem("sakin_rapor_kullanim")||"{}");
      if ((kullanim[ip]||0) >= 1) { setRaporKullanildi(true); localStorage.setItem("sakin_rapor_used","1"); return; }
      kullanim[ip] = (kullanim[ip]||0) + 1;
      localStorage.setItem("sakin_rapor_kullanim", JSON.stringify(kullanim));
    } catch { /* ipify ulaşılamazsa devam et */ }

    setAiLoading(true); setAiRapor("");

    const GIZLI_BENLIK_REHBER = `Astrolojinin 12. Evi — Gizli Benlik Rehberi (Tracy Marks, "Gizli Benliğiniz"):
12. ev bilinçdışının evi, gizli benliğin ve karmik belleğin yurdudur. Güneş her gün bu evden geçer; taşıdığı ışıltılı ve iyileştirici enerjiyi tüm diğer evlere yayar.

TEMEL KAVRAMLAR:
• Gölge Benlik (Jung): "Dışarıdaki dünyada ne için savaşıyorsak, iç benliğimizde de bu mücadele vardır." Bastırılan enerji bilinçdışında büyür; başkalarına yansıtılarak dışarıda görülür. İnkar ettiğimiz özellikler en güçlü yansımalarımız olur.
• Ya Hep Ya Hiç Modelleri: Bastırma ne kadar derinse, patlama o kadar sert olur. Bir gün küçük ve zayıf, ertesi gün taşan enerji — 12. ev dinamiğidir. Reddedilen her enerji, bilinçsizce büyüyüp şekil değiştirir.
• Karmik Deneyimler: Tekrar eden kelimeler, niyetler ve örüntüler çözülmemiş geçmiş deneyimlerin izlerini taşır. 12. evdeki burç, geçmiş yaşamdaki Yükselen Burcu'nu gösterir.
• Hassasiyet ve Hizmet: 12. ev enerjileri aşırı güvensizlik ve bağımlılık riskini taşıdığı gibi derin empati, şifacılık ve insanlığa hizmet potansiyelini de barındırır. Başkalarının duygularını kendinizinkiymiş gibi duyumsayabilirsiniz.
• Tinsellik ve İnsanüstü Deneyimler: Bu ev kozmik birliğe ulaşmanın, tanrısal enerjiyi doğrudan deneyimlemenin evidir. Rüyalar, meditasyon, sezgiler ve müzik/şiir buranın armağanlarıdır.
• Hayalgücü ve Yaratıcı Esinlenme: 12. ev aktif rüya yaşantısına ve yaratıcı esinlenmeye açıklık sağlar. Yazarlar, şairler ve müzisyenlerin çoğunda bu evde güçlü gezegenler bulunur.
• Bütünleşme: Gölgeyle yüzleşmek karanlığı değil, içindeki altın madeni bulmaktır. Bastırılan enerjileri tanımak, onlara zaman tanımak, şefkatle kucaklamak bütünleşme yoludur. Günlük faaliyetler: rüyaları not etmek, başkalarında rahatsız edici özellikleri gözlemlemek, meditasyon.

GİZLİ GÜÇLER (gezegenin yönetici enerjisine göre):
• Güneş/Aslan: İçsel zenginliğe güven, canlandırma ve konsantrasyon, liderlik potansiyeli
• Ay/Yengeç: Duygusal kendine yeterlilik, besleme becerisi, ihtiyaç duyanlara hassasiyet
• Merkür/İkizler-Başak: Olağanüstü iç iletişim, içsel gelişim için yazma aracı
• Venüs/Boğa-Terazi: Kendine sevgi, iç huzur, ideallere bağlılık, yalnızlıktan alınan haz
• Mars/Koç: Yeniden başlayabilme kapasitesi, ruhunu keşfetme cesareti
• Jüpiter/Yay: Köklü inanç, felsefi güç, olumlu yaklaşım, büyüme yeteneği
• Satürn/Oğlak: Öz disiplin, yalnızlıkla baş etme, sorumluluk, tek başına kararlılık
• Uranüs/Kova: Psikolojik özgürlük, açık fikirlilik, kökleşmiş sezgiler, orijinallik
• Neptün/Balık: Sonsuz inanç, şefkat, esin kaynağına uyum, özverili sevgi
• Pluto/Akrep: Derin psikolojik anlayış, boyun eğmeyen irade, dönüştürücü güç

ANAHTAR SÖZCÜKLER: yalnızlık · iç gözlem · bastırılan duygular · karmik borçlar · çocukluk travmaları · bitirilmemiş işler · utanç ve suçluluk · sezgiler · hayalgücü · rüya yaşantısı · yaratıcı esinlenme · meditasyon · özverili sevgi · kriz anında ortaya çıkan içsel güç · gizli kaynaklar ve güçler`;

    // Kozmik enerji verisi (NOAA Kp index — 7 gün + 3 gün tahmin)
    let kozmikText = "";
    try {
      const kRes = await fetch(API_BASE + "/.netlify/functions/cosmic-energy");
      if (kRes.ok) {
        const k = await kRes.json();
        const dailyStr = k.past_7_days.daily.map(d => `${d.day}: Kp=${d.kp} (${d.tr})`).join("; ");
        const fcStr = k.next_3_days.forecast_max_kp !== null
          ? `Önümüzdeki 3 günde tahmini max Kp=${k.next_3_days.forecast_max_kp} (${k.interpretation.forecast_peak?.tr || "—"})`
          : "Tahmin verisi alınamadı";
        kozmikText = `\nKOZMİK ENERJİ DURUMU (NOAA Space Weather):
- Şu anki Kp index: ${k.past_7_days.current_kp} (${k.interpretation.current.tr})
- Son 7 gün ortalama: ${k.past_7_days.avg_kp}, en yüksek: ${k.past_7_days.max_kp} (${k.interpretation.week_peak.tr})
- Günlük max: ${dailyStr}
- ${fcStr}

NOT: Kp index Dünya'nın jeomanyetik aktivitesini ölçer. Yüksek değerler (5+) güneş fırtınası, sinir sistemi hassasiyeti, uyku bozukluğu, baş dönmesi, yoğun rüyalar ve duygusal dalgalanmalarla ilişkilidir. Düşük değerler (0-2) sakin, denge dönemleridir. Bu hafta yaşadıkların kozmik enerjiyle de ilişkili olabilir — raporda bu boyutu yansıt.`;
      }
    } catch { /* opsiyonel */ }

    const toplamFreqSn = gunler.reduce((t,g) => t + (g.freqSaniye||0), 0);
    const gunlerText = gunler.map((g,i)=>`Gün ${i+1} (${g.tarih}):
- Niyet: ${g.niyet||"—"}
- Kelimeler: ${g.kelimeler?.join(", ")||"—"}
- Çakra: ${g.chakra||"—"}
- Nefes: ${g.nefes||0}
- Frekans dinleme: ${g.freqSaniye ? (g.freqSaniye>=60 ? Math.floor(g.freqSaniye/60)+" dk "+g.freqSaniye%60+" sn" : g.freqSaniye+" sn") : "—"}
- Bugün ne öğrendim: ${g.ogrendim||"—"}
- Şükür: ${g.sukur||"—"}`).join("\n\n");
    const freqOzet = toplamFreqSn > 0 ? `\nBu hafta toplam frekans dinleme süresi: ${Math.floor(toplamFreqSn/60)} dakika ${toplamFreqSn%60} saniye.` : "";

    const astroText = astro ? `
Kullanıcının Doğum Profili:
- Güneş Burcu: ${astro.burc}
- Yaşam Yolu Sayısı: ${astro.yasam}
- Kişisel Yıl Sayısı: ${astro.kisiselYil}${birthTime ? `\n- Doğum Saati: ${birthTime}` : ""}
- Bu Haftaki Biyoritm → Fiziksel: %${astro.bio.fiziksel}, Duygusal: %${astro.bio.duygusal}, Zihinsel: %${astro.bio.zihinsel}${yukselen ? `
- Tahmini Yükselen Burç: ${yukselen}
- 12. Ev Burcu: ${ev12Burcu} (Yönetici Gezegen: ${ev12Gezegen})
- 12. Ev Gizli Gücü: ${GEZEGEN_12EV_GUCLERI[ev12Gezegen]||""}` : ""}

Bu bilgileri haftalık yorum yaparken dikkate al. Burç enerjisini, yaşam yolu sayısının özelliklerini ve biyoritm durumunu rapora yansıt.${yukselen ? ` 12. Ev verisini 'Gizli Benlik & Gölge' bölümünde kişiye özel sentezle: ${ev12Gezegen} enerjisiyle bağlantılı bastırılmış temalar ve bu kişinin gizli güçleri.` : ""}
` : "";

    try {
      const res = await fetch(AI_CALL_URL, {
        method:"POST",
        headers:{"Content-Type":"text/plain"},
        body: JSON.stringify({
          model:"llama-3.3-70b-versatile", max_tokens:1700,
          system:`Sen derin bir ayna ve içsel farkındalık rehberisin. Kullanıcının haftalık verilerini, doğum profilini ve 12. ev (gizli benlik) bilgeliğini sentezleyerek Türkçe, şiirsel ve içten bir rapor yazıyorsun. Net ve kendinden emin yaz. Şu kalıpları kesinlikle kullanma: "olası ki", "olabilir", "belki", "belki de", "acaba", "düşünülebilir", "söylenebilir", "muhtemelen". Sorunun kaynağına doğrudan işaret et. Nereye bakabileceğini göster; kendine sevgi sunmayı hatırlat.
Raporun en başına şu cümleyi ekle: "Bu rapor sana özeldir. Düşünce dünyanda sana destek olan bir yardımcıdır. Kalbinin süzgecinden geçir, seni ısıtan kısmını al."
${kisiselProfil()}${astroText}${kozmikText}
${GIZLI_BENLIK_REHBER}
${KITAP_BILGELIGI}

Rapor şu başlıkları içermeli:
**Haftanın Yansıması** — Genel ruh hali, enerji ve burç/sayı etkisi — net ve doğrudan yansıt (2-3 cümle)
**Öne Çıkan Temalar** — Tekrar eden kelimeler ve çakra örüntüleri — kaynağa doğrudan işaret et
**İçsel Büyüme** — Öğrenilen şeylerden çıkarılan anlam — kişinin kendi içinde gördüklerini yansıt
**Gizli Benlik & Gölge** — Bu haftanın verilerinde 12. ev perspektifinden görülen bastırılmış temalar; bütünleşme için nazik bir davet (2-3 cümle, şiirsel)
**Frekans & Ses Yolculuğu** — Haftalık frekans dinleme süresi ve bu sürenin enerji bedenine etkisi (1-2 cümle)
**Şükran Kalbi** — Şükür yazılarından bir sentez
**Sana Bir Davet** — Bu hafta kendine nasıl sevgi sunabilirsin, nereye bakabilirsin — eleştiri değil, davet (2-3 madde)
**Hatırla** — Bu hafta kendine hatırlatman gereken en önemli 2-3 şey (kısa, öz)
**Gelecek Haftaya Niyet** — Kısa, ilham verici bir öneri${astro ? "\n**Kozmik Not** — Bu haftanın biyoritmi ve sayısal/burç enerjisi hakkında kısa bir not" : ""}${kozmikText ? "\n**Kozmik Enerji Durumu** — Bu hafta jeomanyetik aktivite, güneş fırtınaları ve önümüzdeki 3 günün tahminine dair yorum. Yüksek Kp dönemleri kişinin yaşadıklarıyla nasıl rezonans ettiğini şefkatle yansıt. Önümüzdeki günlere dair hazırlık daveti (3-4 cümle, somut)" : ""}

Samimi, nazik, biraz şiirsel bir dil kullan. "Sen" diye hitap et. Maksimum 620 kelime.`,
          messages:[{role:"user",content:`Bu haftaki günlük verilerim:\n\n${gunlerText}${freqOzet}\n\nLütfen haftalık içsel raporumu oluştur.`}]
        })
      });
      const data = await res.json();
      const text = data.text;
      if (text) {
        localStorage.setItem("sakin_rapor_used", "1");
        setRaporKullanildi(true);
      }
      setAiRapor(text || data.error?.message || "Rapor oluşturulamadı.");
    } catch(e) { setAiRapor(lang==="tr" ? "Bağlantı hatası. Lütfen tekrar dene." : "Connection error. Please try again."); console.error("AiRapor error:", e); }
    finally { setAiLoading(false); }
  };

  useEffect(() => {
    setBreathStarted(false);
    setBreathPhase("ready");
    const pending = pendingBreathRef.current;
    if (pending) { setBreathMode(pending); pendingBreathRef.current = null; }
    else { setBreathMode("standart"); }
    clearInterval(breathRef.current);
    if (screen !== "ses") stopFreqToneGlobal();
  },[screen]);

  const speakBreathCue = (phase) => {
    if (!("speechSynthesis" in window)) return;
    const voiceMap = { inhale: t("breath_voice_inhale"), hold: t("breath_voice_hold"), exhale: t("breath_voice_exhale"), hold2: t("breath_voice_rest") };
    const text = voiceMap[phase];
    if (!text) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang === "tr" ? "tr-TR" : "en-US";
    utt.rate = 0.75; utt.pitch = 0.9; utt.volume = 0.7;
    window.speechSynthesis.speak(utt);
  };

  useEffect(() => {
    if (screen!=="nefes" || !breathStarted) return;
    const tm = BREATH_MODES_CONFIG[breathMode] || BREATH_MODES_CONFIG.standart;
    const toIds = [];
    const cycle = () => {
      setBreathPhase("inhale"); speakBreathCue("inhale");
      let t = tm.in;
      if (tm.hold > 0)  { toIds.push(setTimeout(()=>{ setBreathPhase("hold"); speakBreathCue("hold"); },  t)); t += tm.hold;  }
      toIds.push(setTimeout(()=>{ setBreathPhase("exhale"); speakBreathCue("exhale"); }, t)); t += tm.out;
      if (tm.hold2 > 0) { toIds.push(setTimeout(()=>{ setBreathPhase("hold2"); speakBreathCue("hold2"); }, t)); }
      toIds.push(setTimeout(()=>setBreathCount(c=>c+1), tm.total - 200));
    };
    setBreathPhase("ready");
    const startDelay = setTimeout(() => {
      cycle();
      breathRef.current = setInterval(cycle, tm.total);
    }, 600);
    return () => { clearInterval(breathRef.current); clearTimeout(startDelay); toIds.forEach(clearTimeout); if ("speechSynthesis" in window) window.speechSynthesis.cancel(); };
  },[screen, breathStarted, breathMode]);

  const hour   = time.getHours();
  const dayPct = ((hour*60+time.getMinutes())/1440)*100;
  const toggleWord = w => {
    if (!isPremium && PREMIUM_WORDS.includes(w)) { setScreen("fiyat"); return; }
    setSelectedWords(prev => prev.includes(w)?prev.filter(x=>x!==w):prev.length<3?[...prev,w]:prev);
  };
  const breathLabel = breathStarted ? ({ready:"",inhale:t("breath_inhale"),hold:t("breath_hold"),exhale:t("breath_exhale"),hold2:t("breath_rest")}[breathPhase]||"") : "";
  const breathScale = breathStarted ? (breathPhase==="exhale"||breathPhase==="hold2"||breathPhase==="ready" ? 1 : 1.6) : 1;
  const breathIsActive = breathPhase==="inhale"||breathPhase==="hold";
  const tm = BREATH_MODES_CONFIG[breathMode] || BREATH_MODES_CONFIG.standart;
  const breathInDur  = `${tm.in/1000}s`;
  const breathOutDur = `${tm.out/1000}s`;
  const handleMouseMove = e => { const r=e.currentTarget.getBoundingClientRect(); setOrb({x:((e.clientX-r.left)/r.width)*100,y:((e.clientY-r.top)/r.height)*100}); };

  const SWIPE_SCREENS = ["sabah","nefes","ses","chakra","gun","aksam"];
  const touchStartRef = useRef(null);
  const handleTouchStart = e => { touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() }; };
  const handleTouchEnd = e => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.t;
    touchStartRef.current = null;
    if (dt > 500 || Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return;
    const idx = SWIPE_SCREENS.indexOf(screen);
    if (idx === -1) return;
    if (dx < -60 && idx < SWIPE_SCREENS.length - 1) setScreen(SWIPE_SCREENS[idx + 1]);
    if (dx > 60 && idx > 0) setScreen(SWIPE_SCREENS[idx - 1]);
  };

  const ambientColor = {
    giris:"139,90,160",sabah:"220,130,50",nefes:"80,130,200",ses:"160,122,224",
    chakra:`${parseInt(chakra.color.slice(1,3),16)},${parseInt(chakra.color.slice(3,5),16)},${parseInt(chakra.color.slice(5,7),16)}`,
    gun:"120,90,180",terapi:"74,160,100",aksam:"60,70,140",harita:"100,80,180",
  }[screen]||"139,90,160";

  const NAV = [
    {id:"sabah",  icon:"🌅", label:t("nav_morning"),               color:"#f0a060"},
    {id:"nefes",  icon:"🫧", label:t("nav_breath"),                color:"#60b8e8"},
    {id:"ses",    icon:"🔊", label:t("nav_sound"),                 color:"#a07ae0"},
    {id:"chakra", icon:"💜", label:t("nav_chakra"),                color:"#c07ae0"},
    {id:"gun",    icon:"☀️", label:t("nav_day"),                   color:"#e8d060"},
    {id:"aksam",  icon:"🌙", label:t("nav_evening"),               color:"#7ab0e0"},
  ];
  const SIDEBAR_ITEMS = [
    ...(isNative ? [] : [{id:"rehber", icon:"🪞", label:lang==="tr"?"Ayna":"Mirror", color:"#a070d0"}]),
    {id:"harita", icon:"🗺️", label:lang==="tr"?"Harita":"Map",  color:"#82d9a3"},
    {id:"mandala",icon:"◎",  label:lang==="tr"?"Bağlantı":"Connection", color:"#b87adc"},
    {id:"ailesi", icon:"✦", label:lang==="tr"?"Ailesi":"Family", color:"#f0c060", glow:true},
  ];
  const MORNING_WORDS = t("morning_words");
  const PREMIUM_WORDS = lang === "tr" ? PREMIUM_WORDS_TR : PREMIUM_WORDS_EN;

  const isPolicyScreen = ["hakkinda","fiyat","sartlar","gizlilik","iade"].includes(screen);
  return (
    <div onMouseMove={handleMouseMove} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{ minHeight:"100vh",paddingTop:"calc(82px + var(--sat))",background:"#000000",display:"flex",alignItems:isPolicyScreen?"flex-start":"center",justifyContent:"center",fontFamily:"'Inter',sans-serif",color:"#ffffff",position:"relative" }}>
      <style>{GLOBAL_CSS}</style>

      {/* ÜST NAV */}
      <div className="top-nav">
        {/* Anasayfa butonu — sol */}
        <button
          onClick={()=>{ setGirisPhase("intro"); setScreen("giris"); }}
          style={{ background:"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:5,padding:"0 10px 0 6px",height:44,flexShrink:0,borderRight:"1px solid rgba(255,255,255,0.06)" }}
        >
          <svg width="12" height="12" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.5 1L1 6.5M1 6.5L6.5 12M1 6.5H12" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily:"'Jost',sans-serif",fontWeight:300,fontSize:13,letterSpacing:2,textTransform:"uppercase",color:"rgba(255,255,255,0.5)" }}>Sakin</span>
        </button>
        <button className={`top-nav-btn${screen==="hakkinda"?" active":""}`} onClick={()=>setScreen("hakkinda")}>{t("nav_about")}</button>
        <button className={`top-nav-btn${screen==="fiyat"?" active":""}`} onClick={()=>setScreen("fiyat")}>{t("nav_pricing")}</button>
        <button className={`top-nav-btn${screen==="sartlar"?" active":""}`} onClick={()=>setScreen("sartlar")}>{t("nav_terms")}</button>
        <button className={`top-nav-btn${screen==="gizlilik"?" active":""}`} onClick={()=>setScreen("gizlilik")}>{t("nav_privacy")}</button>
        <button className={`top-nav-btn${screen==="iade"?" active":""}`} onClick={()=>setScreen("iade")}>{t("nav_refund")}</button>
        <button onClick={toggleLang} style={{ marginLeft:"auto",flexShrink:0,background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:20,padding:"6px 14px",color:"#aaaaaa",fontSize:13,letterSpacing:1.5,cursor:"pointer",fontFamily:"'Jost',sans-serif",fontWeight:300,minHeight:44,minWidth:44,alignSelf:"center",marginRight:4 }}>
          {lang === "tr" ? "EN" : "TR"}
        </button>
      </div>

      {/* SAKİN AİLESİ PANELİ */}
      {showAilesi && (
        <div onClick={()=>setShowAilesi(false)} style={{ position:"fixed",inset:0,zIndex:10000,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ maxWidth:420,width:"100%",display:"flex",flexDirection:"column",gap:14 }}>
            <div style={{ textAlign:"center",marginBottom:8 }}>
              <div style={{ fontSize:11,letterSpacing:5,color:"#888",textTransform:"uppercase",marginBottom:6 }}>{lang==="tr"?"Sakin Ailesi":"Sakin Family"}</div>
              <div style={{ fontSize:22,fontWeight:300,letterSpacing:2,color:"#d0c0f0",fontFamily:"'Jost',sans-serif" }}>{lang==="tr"?"Keşfet":"Explore"}</div>
            </div>
            {[
              { name:"Sakin Hayvan", embed:"/embedded/sakinhayvan/index.html", url:"https://sakinhayvan.netlify.app/", icon:"◈", color:"#a0d8b4",
                desc: lang==="tr"
                  ? "Sözler, Taşlar, Nagual — Anadolu bilgeliği ve ruh rehberliği üzerinden günlük üç kart çekimi."
                  : "Words, Stones, Nagual — daily three-card draws through Anatolian wisdom and spirit guidance." },
              { name:"Sakin Mitler", embed:"/embedded/sakinmitler/index.html", url:"https://sakinmitler.netlify.app/", icon:"🏛️", color:"#d8b4a0",
                desc: lang==="tr"
                  ? "Jung'un izinde günlük arketip, mit ve imge okuması — her gün üç deste açılır."
                  : "Daily archetype, myth and image reading in the footsteps of Jung — three decks open each day." },
              { name:"Sakin Tasarım", embed:"/embedded/humandesign/index.html", url:"https://sakindesign.netlify.app/", icon:"⌖", color:"#b4a0d8",
                desc: lang==="tr"
                  ? "Doğum gün, saat ve şehrini girerek Human Design haritan — tip, içsel yetki, profil, merkezler ve kanallar."
                  : "Your Human Design chart from birth date, time and city — type, inner authority, profile, centers and channels." },
            ].map(app=>(
              <div key={app.name}
                style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"16px 18px",display:"flex",flexDirection:"column",gap:8,transition:"border-color 0.2s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=app.color+"66"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"}>
                <button
                  onClick={()=>{ playPortalSound(); haptic(); setEmbedLoaded(false); setEmbeddedApp({ name: app.name, path: app.embed, color: app.color }); setTimeout(()=>setShowAilesi(false), 250); }}
                  style={{ background:"none",border:"none",padding:0,cursor:"pointer",display:"flex",alignItems:"center",gap:14,textAlign:"left",color:"inherit",width:"100%" }}>
                  <div style={{ width:48,height:48,borderRadius:"50%",background:`radial-gradient(circle,${app.color}44,${app.color}11)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>{app.icon}</div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:15,fontWeight:500,color:"#ffffff",letterSpacing:1,marginBottom:4,fontFamily:"'Jost',sans-serif" }}>{app.name}</div>
                    <div style={{ fontSize:13,color:"#999",lineHeight:1.6 }}>{app.desc}</div>
                  </div>
                  <div style={{ color:"rgba(255,255,255,0.2)",fontSize:18,flexShrink:0 }}>→</div>
                </button>
              </div>
            ))}
            <button onClick={()=>setShowAilesi(false)} style={{ marginTop:8,background:"none",border:"1px solid rgba(255,255,255,0.1)",borderRadius:100,padding:"10px 0",color:"#888",fontSize:13,letterSpacing:2,cursor:"pointer",fontFamily:"'Jost',sans-serif",textTransform:"uppercase" }}>
              {lang==="tr"?"Kapat":"Close"}
            </button>
          </div>
        </div>
      )}

      {/* EMBEDDED APP — fullscreen iframe overlay with cosmic portal transition */}
      {embeddedApp && (
        <div style={{ position:"fixed",inset:0,zIndex:10001,background:"#000",display:"flex",flexDirection:"column",animation:"portalIn 0.45s ease-out" }}>
          <iframe
            src={embeddedApp.path}
            title={embeddedApp.name}
            onLoad={()=>setEmbedLoaded(true)}
            style={{ flex:1,width:"100%",height:"100%",border:"none",background:"#000",display:"block",opacity: embedLoaded ? 1 : 0,transition:"opacity 0.55s ease-out" }}
            allow="accelerometer; gyroscope; clipboard-write; encrypted-media"
          />
          {/* Kozmik portal yükleme katmanı */}
          {!embedLoaded && (
            <div style={{ position:"fixed",inset:0,zIndex:10001,pointerEvents:"none",background:`radial-gradient(ellipse 70% 50% at 50% 50%,rgba(${(embeddedApp.color||"#b4a0d8").replace('#','').match(/.{2}/g).map(h=>parseInt(h,16)).join(',')},0.18) 0%,rgba(10,6,18,0.95) 60%,#000 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:"fadeIn 0.3s ease" }}>
              {/* Yıldızlar */}
              {[[22,18],[78,30],[14,52],[88,55],[48,12],[62,72],[18,82],[82,78],[40,42],[55,28]].map(([x,y],i)=>(
                <div key={i} style={{ position:"absolute",left:`${x}%`,top:`${y}%`,width:2,height:2,borderRadius:"50%",background:"rgba(255,255,255,0.85)",boxShadow:"0 0 4px rgba(255,255,255,0.5)",animation:`twinkle ${2+i*0.3}s ease-in-out infinite`,animationDelay:`${i*0.15}s` }}/>
              ))}
              {/* Merkez dönen kare */}
              <div style={{ position:"relative",width:80,height:80,marginBottom:18 }}>
                <div style={{ position:"absolute",inset:0,transform:"rotate(45deg)",border:`1.5px solid ${embeddedApp.color||"rgba(255,255,255,0.45)"}`,borderRadius:8,animation:"diamondSpin 2.2s linear infinite" }}/>
                <div style={{ position:"absolute",inset:18,transform:"rotate(45deg)",border:`1px solid ${embeddedApp.color||"rgba(255,255,255,0.25)"}`,borderRadius:5,opacity:0.6,animation:"diamondSpin 1.6s linear infinite reverse" }}/>
                <div style={{ position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",width:8,height:8,borderRadius:"50%",background:embeddedApp.color||"#fff",boxShadow:`0 0 22px ${embeddedApp.color||"rgba(255,255,255,0.6)"},0 0 44px ${embeddedApp.color||"rgba(255,255,255,0.3)"}`,animation:"pulse 1.4s ease-in-out infinite" }}/>
              </div>
              <div style={{ fontFamily:"'Jost',sans-serif",fontSize:13,letterSpacing:5,color:embeddedApp.color||"#d0c0f0",textTransform:"uppercase",opacity:0.85 }}>
                {embeddedApp.name}
              </div>
            </div>
          )}
          <button
            onClick={()=>{ setEmbeddedApp(null); setEmbedLoaded(false); }}
            aria-label={lang==="tr"?"Geri":"Back"}
            style={{
              position:"fixed",top:"max(4px, calc(var(--sat) - 38px))",left:8,zIndex:10003,
              background:"rgba(0,0,0,0.55)",backdropFilter:"blur(16px)",
              border:"1px solid rgba(255,255,255,0.15)",
              borderRadius:"50%",width:36,height:36,padding:0,
              color:"rgba(255,255,255,0.85)",fontSize:18,cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:"0 2px 10px rgba(0,0,0,0.4)",
              transition:"opacity 0.25s",opacity:0.6
            }}
            onMouseEnter={e=>e.currentTarget.style.opacity=1}
            onMouseLeave={e=>e.currentTarget.style.opacity=0.6}
            onTouchStart={e=>e.currentTarget.style.opacity=1}>
            ←
          </button>
        </div>
      )}

      {/* AYNA & HARİTA BARI — üst navın altında */}
      <div style={{ position:"fixed",top:"calc(44px + var(--sat))",left:0,right:0,zIndex:9998,minHeight:44,background:"rgba(0,0,0,0.95)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"stretch",justifyContent:"space-between",gap:6,padding:"6px 10px" }}>
        {SIDEBAR_ITEMS.map(n=>{
          const active = n.id==="ailesi" ? showAilesi : screen===n.id;
          return (
            <button key={n.id}
              onClick={()=>{ if(n.id==="ailesi"){ setShowAilesi(!showAilesi); return; } if(n.id==="rehber") setRehberTab("reiki"); setScreen(n.id); }}
              style={{
                flex:"1 1 0", minWidth:0,
                background: active ? `${n.color}22` : n.glow ? `${n.color}11` : "transparent",
                border: active ? `1px solid ${n.color}44` : n.glow ? `1px solid ${n.color}33` : "1px solid transparent",
                borderRadius:20, cursor:"pointer", transition:"all 0.25s",
                padding:"5px 6px", display:"flex", alignItems:"center", justifyContent:"center", gap:5,
                fontFamily:"'Jost',sans-serif", fontWeight: n.glow ? 400 : 300,
                fontSize:12, letterSpacing:1.4, textTransform:"uppercase",
                color: active ? n.color : n.glow ? n.color : `${n.color}77`,
                animation: n.glow && !active ? "ailesiPulse 2.5s ease-in-out infinite" : "none",
                boxShadow: n.glow && !active ? `0 0 12px ${n.color}22` : "none",
                whiteSpace:"nowrap", overflow:"hidden",
              }}>
              <span style={{ fontSize:13, lineHeight:1, flexShrink:0 }}>{n.icon}</span>
              <span style={{ overflow:"hidden", textOverflow:"ellipsis", minWidth:0 }}>{n.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sabit derin uzay arka planı */}
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:"radial-gradient(ellipse 80% 60% at 20% 80%,rgba(60,30,90,0.12) 0%,transparent 60%),radial-gradient(ellipse 60% 50% at 80% 20%,rgba(30,50,100,0.1) 0%,transparent 55%)" }} />

      {/* Fare takipli ambient */}
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:0, background:`radial-gradient(700px at ${orb.x}% ${orb.y}%,rgba(${ambientColor},0.1) 0%,transparent 68%)`,transition:"background 1.2s ease" }} />

      {[...Array(46)].map((_,i) => {
        const sz = i%11===0?2.5:i%5===0?1.8:i%3===0?1.2:0.9;
        const op = i%11===0?0.42:i%5===0?0.32:0.22;
        return (
          <div key={i} style={{ position:"fixed",left:`${(i*37+11)%100}%`,top:`${(i*53+7)%100}%`,width:sz,height:sz,borderRadius:"50%",background:`rgba(255,255,255,${op})`,animation:`twinkle ${3+(i%6)}s ease-in-out infinite`,animationDelay:`${(i*0.41)%6}s`,pointerEvents:"none",zIndex:0 }} />
        );
      })}

      {/* INTRO ANİMASYON — dönen kare */}
      {showIntro && (
        <div style={{
          position:"fixed",inset:0,zIndex:99999,background:"#000",
          display:"flex",alignItems:"center",justifyContent:"center",
          animation: introExiting ? "introFadeOut 0.6s ease forwards" : "none",
        }}>
          <div style={{ position:"relative",width:120,height:120 }}>
            <div style={{ position:"absolute",inset:0,transform:"rotate(45deg)",border:"1px solid rgba(255,255,255,0.35)",borderRadius:12,animation:"diamondSpin 12s linear infinite" }} />
            <div style={{ position:"absolute",inset:24,transform:"rotate(45deg)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:8,animation:"diamondSpin 8s linear infinite reverse" }} />
            <div style={{ position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",width:16,height:16,borderRadius:"50%",background:"rgba(255,255,255,0.85)",boxShadow:"0 0 20px rgba(255,255,255,0.6),0 0 40px rgba(255,255,255,0.4)" }} />
          </div>
        </div>
      )}

      {/* GİRİŞ */}
      {screen==="giris" && (
        <div style={{ maxWidth:360,width:"100%",textAlign:"center",padding:"24px 24px 80px",position:"relative",zIndex:1 }}>
          {/* Dönen kare logosu */}
          <div className="fade-up" style={{ marginBottom:36,position:"relative" }}>
            <div style={{ position:"relative",width:100,height:100,margin:"0 auto" }}>
              <div style={{ position:"absolute",inset:0,transform:"rotate(45deg)",border:"1px solid rgba(255,255,255,0.35)",borderRadius:10,animation:"diamondSpin 12s linear infinite" }} />
              <div style={{ position:"absolute",inset:20,transform:"rotate(45deg)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:6,animation:"diamondSpin 8s linear infinite reverse" }} />
              <div style={{ position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",width:14,height:14,borderRadius:"50%",background:"rgba(255,255,255,0.85)",boxShadow:"0 0 20px rgba(255,255,255,0.6),0 0 40px rgba(255,255,255,0.4)" }} />
            </div>
          </div>
          <div className="fade-up" style={{ animationDelay:"0.3s",opacity:0 }}>
            <div style={{ fontFamily:"'Jost',sans-serif",fontSize:36,letterSpacing:12,fontWeight:200,marginBottom:8,color:"#ffffff" }}>Sakin</div>
          </div>
          <div className="fade-up" style={{ animationDelay:"0.5s",opacity:0 }}>
            <div style={{ fontFamily:"'Jost',sans-serif",fontSize:13,letterSpacing:5,fontWeight:300,textTransform:"uppercase",color:"#555555",marginBottom:52 }}>{t("tagline")}</div>
          </div>
          <div className="fade-up" style={{ animationDelay:"0.55s",opacity:0 }}>
            {girisPhase === "intro" ? (
              <>
                <button className="sakin-btn-primary" onClick={()=>setGirisPhase("birth")}>{t("btn_ready")}</button>
                <div style={{ marginTop:24,display:"flex",justifyContent:"center",gap:12 }}>
                  <button onClick={()=>{ setLang("tr"); localStorage.setItem("sakin_lang","tr"); }} style={{ background:lang==="tr"?"rgba(255,255,255,0.12)":"transparent",border:"1px solid rgba(255,255,255,"+(lang==="tr"?"0.3":"0.1")+")",borderRadius:20,padding:"6px 18px",color:lang==="tr"?"#fff":"#666",fontSize:13,letterSpacing:1.5,cursor:"pointer",fontFamily:"'Jost',sans-serif",fontWeight:300 }}>TR</button>
                  <button onClick={()=>{ setLang("en"); localStorage.setItem("sakin_lang","en"); }} style={{ background:lang==="en"?"rgba(255,255,255,0.12)":"transparent",border:"1px solid rgba(255,255,255,"+(lang==="en"?"0.3":"0.1")+")",borderRadius:20,padding:"6px 18px",color:lang==="en"?"#fff":"#666",fontSize:13,letterSpacing:1.5,cursor:"pointer",fontFamily:"'Jost',sans-serif",fontWeight:300 }}>EN</button>
                </div>
              </>
            ) : (
              <div style={{ textAlign:"left",maxWidth:280,margin:"0 auto",display:"flex",flexDirection:"column" }}>
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:11,letterSpacing:2,color:"#666666",marginBottom:4,textTransform:"uppercase",fontFamily:"'Jost',sans-serif" }}>{lang==="tr" ? "Doğum Tarihi" : "Date of Birth"}</div>
                  <input type="date" className="sakin-input" style={{ fontSize:14,padding:"9px 12px",width:"100%",boxSizing:"border-box" }}
                    value={birthInput} onChange={e=>setBirthInput(e.target.value)} />
                </div>
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:11,letterSpacing:2,color:"#666666",marginBottom:4,textTransform:"uppercase",fontFamily:"'Jost',sans-serif" }}>{lang==="tr" ? "Doğum Saati (isteğe bağlı)" : "Birth Time (optional)"}</div>
                  <input type="time" className="sakin-input" style={{ fontSize:14,padding:"9px 12px",width:"100%",boxSizing:"border-box" }}
                    value={birthTimeInput} onChange={e=>setBirthTimeInput(e.target.value)} />
                </div>
                <div style={{ fontSize:11,letterSpacing:1,color:"#555555",marginBottom:14,textAlign:"center",fontFamily:"'Jost',sans-serif",lineHeight:1.5 }}>
                  {lang==="tr" ? "🔒  Verileriniz sunucularda saklanmaz · Yalnızca cihazınızda tutulur" : "🔒  Your data is never stored on servers · Kept on your device only"}
                </div>
                <button className="sakin-btn-primary" style={{ width:"100%",alignSelf:"stretch",boxSizing:"border-box",padding:"11px 16px",fontSize:13,letterSpacing:1.5,whiteSpace:"nowrap" }}
                  onClick={()=>{
                    if(birthInput){ localStorage.setItem("sakin_birth_date", birthInput); setBirthDate(birthInput); markStep("birth"); }
                    if(birthTimeInput){ localStorage.setItem("sakin_birth_time", birthTimeInput); setBirthTime(birthTimeInput); }
                    if (isNative) { setScreen("sabah"); } else { setRehberTab("reiki"); setScreen("rehber"); }
                  }}>
                  {lang==="tr" ? (birthInput ? "Devam Et →" : "Atla →") : (birthInput ? "Continue →" : "Skip →")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BAĞLANTI — insan iskeleti çakra sistemi */}
      {screen==="mandala" && (() => {
        const steps = [
          {id:"sabah",  label:lang==="tr"?"Sabah":"Morning",  icon:"🌅", color:"#f0a060", glow:"255,140,60"},
          {id:"nefes",  label:lang==="tr"?"Nefes":"Breath",   icon:"🫧", color:"#60b8e8", glow:"80,160,220"},
          {id:"ses",    label:lang==="tr"?"Ses":"Sound",       icon:"🔊", color:"#a07ae0", glow:"160,122,224"},
          {id:"chakra", label:lang==="tr"?"Çakra":"Chakra",   icon:"💜", color:"#b87adc", glow:"180,100,255"},
          {id:"gun",    label:lang==="tr"?"Görevler":"Tasks",  icon:"☀️", color:"#e8d060", glow:"230,200,60"},
          {id:"aksam",  label:lang==="tr"?"Akşam":"Evening",  icon:"🌙", color:"#7ab0e0", glow:"100,150,220"},
          {id:"harita", label:lang==="tr"?"Bağlantı":"Connection",     icon:"✦",  color:"#82d9a3", glow:"80,210,140"},
        ];
        const N=steps.length;
        const BADGES=[
          {days:3, icon:"🌱",label:lang==="tr"?"3 Gün":"3 Days"},
          {days:7, icon:"🔥",label:lang==="tr"?"1 Hafta":"1 Week"},
          {days:21,icon:"⚡",label:lang==="tr"?"21 Gün":"21 Days"},
          {days:40,icon:"👑",label:lang==="tr"?"40 Gün":"40 Days"},
        ];
        const nextStep = steps.find(s => !stepsCompleted[s.id]);

        return (
          <div style={{maxWidth:400,width:"100%",padding:"54px 20px 90px",position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
            {/* Back button */}
            <button onClick={()=>{ if (screenHistoryRef.current.length > 1) { history.back(); } else { setScreen("sabah"); } }}
              style={{ position:"absolute",top:14,left:14,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"50%",width:40,height:40,cursor:"pointer",color:"#aaa",fontSize:17,display:"flex",alignItems:"center",justifyContent:"center",zIndex:10 }}>
              ←
            </button>
            {/* Title */}
            <div style={{textAlign:"center",marginBottom:8}}>
              <div className="label-sm" style={{letterSpacing:5,marginBottom:5}}>{lang==="tr"?"BUGÜNÜN BAĞLANTISI":"TODAY'S CONNECTION"}</div>
            </div>

            {/* Streak row */}
            <div style={{display:"flex",gap:18,marginBottom:18,alignItems:"center"}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:26,fontWeight:200,color:"#f0a040",lineHeight:1,animation:streakData.current>=3?"streakFire 2s ease-in-out infinite":"none"}}>{streakData.current}</div>
                <div style={{fontSize:12,letterSpacing:2.5,color:"#777777",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>{lang==="tr"?"gün serisi":"day streak"}</div>
              </div>
              <div style={{width:1,height:36,background:"rgba(255,255,255,0.07)"}}/>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:26,fontWeight:200,color:"#888888",lineHeight:1}}>{streakData.best}</div>
                <div style={{fontSize:12,letterSpacing:2.5,color:"#777777",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>{lang==="tr"?"en iyi":"best"}</div>
              </div>
              <div style={{width:1,height:36,background:"rgba(255,255,255,0.07)"}}/>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:26,fontWeight:200,color:allStepsComplete?"#82d9a3":"#aaaaaa",lineHeight:1}}>{completedStepCount}<span style={{fontSize:14,color:"#777777"}}>/{N}</span></div>
                <div style={{fontSize:12,letterSpacing:2.5,color:"#777777",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>{lang==="tr"?"adım":"steps"}</div>
              </div>
              <div style={{width:1,height:36,background:"rgba(255,255,255,0.07)"}}/>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:26,fontWeight:200,color:freqListenSec>0?"#a07ae0":"#888888",lineHeight:1}}>{freqListenSec>=60?`${Math.floor(freqListenSec/60)}m`:freqListenSec>0?`${freqListenSec}s`:"—"}</div>
                <div style={{fontSize:12,letterSpacing:2.5,color:"#777777",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>{lang==="tr"?"frekans":"freq"}</div>
              </div>
            </div>

            {/* İnsan İskeleti Çakra Bağlantı Sistemi */}
            {(() => {
              const pct = completedStepCount / N;
              const lightY = 520 - pct * 480;
              const chakraNodes = [
                {y:500, label:lang==="tr"?"Yer":"Earth",     color:"#8B6914", zone:"sub"},
                {y:430, label:steps[0].label,                color:steps[0].color, id:steps[0].id, zone:"lower"},
                {y:378, label:steps[1].label,                color:steps[1].color, id:steps[1].id, zone:"lower"},
                {y:326, label:steps[2].label,                color:steps[2].color, id:steps[2].id, zone:"mid"},
                {y:274, label:steps[3].label,                color:steps[3].color, id:steps[3].id, zone:"mid"},
                {y:222, label:steps[4].label,                color:steps[4].color, id:steps[4].id, zone:"upper"},
                {y:170, label:steps[5].label,                color:steps[5].color, id:steps[5].id, zone:"upper"},
                {y:118, label:steps[6].label,                color:steps[6].color, id:steps[6].id, zone:"upper"},
                {y:40,  label:lang==="tr"?"Gök":"Sky",       color:"#cfd8dc", zone:"supra"},
              ];
              return (
                <div style={{width:220,position:"relative"}}>
                  <svg width="220" height="540" viewBox="0 0 220 540" style={{overflow:"visible"}}>
                    <defs>
                      <linearGradient id="riseGrad" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor="rgba(255,200,60,0.6)"/>
                        <stop offset="40%" stopColor="rgba(200,120,255,0.5)"/>
                        <stop offset="100%" stopColor="rgba(180,220,255,0.4)"/>
                      </linearGradient>
                      <linearGradient id="spineGrad" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.03)"/>
                        <stop offset="50%" stopColor="rgba(255,255,255,0.08)"/>
                        <stop offset="100%" stopColor="rgba(255,255,255,0.03)"/>
                      </linearGradient>
                      <filter id="glowF"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                    </defs>

                    {/* Omurga — ana bağlantı çizgisi */}
                    <line x1="110" y1="500" x2="110" y2="40" stroke="url(#spineGrad)" strokeWidth="2" />

                    {/* Işık yükselişi — görevler tamamlandıkça yukarı çıkar */}
                    {pct > 0 && (
                      <line x1="110" y1="500" x2="110" y2={lightY}
                        stroke="url(#riseGrad)" strokeWidth="3" strokeLinecap="round"
                        filter="url(#glowF)" opacity={0.5+pct*0.5}
                        style={{transition:"y2 1s ease, opacity 0.8s"}} />
                    )}

                    {/* Elektrik akımı partikülleri — yükselen ışık üzerinde */}
                    {pct > 0 && [0,1,2].map(i => (
                      <circle key={`ep${i}`} cx="110" r="2" fill="rgba(255,255,200,0.8)"
                        style={{animation:`electricRise ${2+i*0.7}s linear infinite`,animationDelay:`${i*0.6}s`}}>
                        <animateMotion dur={`${2.5+i*0.5}s`} repeatCount="indefinite" begin={`${i*0.4}s`}>
                          <mpath href="#spinePath" />
                        </animateMotion>
                      </circle>
                    ))}
                    <path id="spinePath" d="M110,500 L110,40" fill="none" stroke="none" />

                    {/* İnsan silueti */}
                    {/* Kafa */}
                    <circle cx="110" cy="100" r="22" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" />
                    {/* Boyun */}
                    <line x1="110" y1="122" x2="110" y2="140" stroke="rgba(255,255,255,0.08)" strokeWidth="1.2" />
                    {/* Gövde */}
                    <path d="M80 140 Q110 136 140 140 L136 330 Q110 336 84 330Z" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                    {/* Kollar */}
                    <path d="M80 150 Q60 180 50 240" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none" strokeLinecap="round"/>
                    <path d="M140 150 Q160 180 170 240" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none" strokeLinecap="round"/>
                    {/* Bacaklar */}
                    <path d="M94 330 Q90 390 85 470" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none" strokeLinecap="round"/>
                    <path d="M126 330 Q130 390 135 470" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none" strokeLinecap="round"/>

                    {/* Çakra düğümleri */}
                    {chakraNodes.map((node,i) => {
                      const done = node.id ? !!stepsCompleted[node.id] : (node.zone==="sub" ? pct>0 : pct>=1);
                      const isNext = node.id && nextStep?.id===node.id;
                      const lit = node.y >= lightY;
                      const r = (node.zone==="sub"||node.zone==="supra") ? 8 : 10;
                      return (
                        <g key={i} style={{cursor:node.id?"pointer":"default"}} onClick={()=>{ if(node.id) setScreen(node.id); }}>
                          {/* Glow hale */}
                          {(done||lit) && <circle cx="110" cy={node.y} r={r+8} fill={`${node.color}18`}
                            style={{animation:`nodeCharge ${2+i*0.3}s ease-in-out infinite`,animationDelay:`${i*0.2}s`}} />}
                          {/* Düğüm */}
                          <circle cx="110" cy={node.y} r={r}
                            fill={done?`${node.color}cc`:lit?`${node.color}44`:"rgba(255,255,255,0.04)"}
                            stroke={done?`${node.color}`:lit?`${node.color}88`:"rgba(255,255,255,0.08)"}
                            strokeWidth={done?"1.5":"0.8"}
                            style={{transition:"fill 0.8s, stroke 0.8s"}} />
                          {/* İç nokta */}
                          {(done||lit) && <circle cx="110" cy={node.y} r={r*0.35} fill={`${node.color}`} opacity={done?0.9:0.4}
                            style={{animation:done?`neuralGlow ${1.5+i*0.15}s ease-in-out infinite`:"none"}} />}
                          {/* Etiket */}
                          <text x={i%2===0?"72":"148"} y={node.y+1} textAnchor={i%2===0?"end":"start"}
                            fontSize="8" letterSpacing="1.5" fill={done?node.color:lit?`${node.color}88`:"rgba(255,255,255,0.15)"}
                            fontFamily="'Jost',sans-serif" style={{textTransform:"uppercase",transition:"fill 0.6s",userSelect:"none"}}>
                            {node.label}
                          </text>
                          {/* Tamamlanma işareti */}
                          {done && <text x="110" y={node.y+1} textAnchor="middle" dominantBaseline="middle"
                            fontSize="10" fill="#ffffff" style={{userSelect:"none"}}>✓</text>}
                          {/* Yatay enerji çizgisi */}
                          {(done||lit) && <>
                            <line x1={110-r-3} y1={node.y} x2={110-r-16} y2={node.y}
                              stroke={`${node.color}${done?"66":"22"}`} strokeWidth="0.6" strokeDasharray="2 2"
                              style={{animation:`spineGlow ${2+i*0.2}s ease-in-out infinite`}} />
                            <line x1={110+r+3} y1={node.y} x2={110+r+16} y2={node.y}
                              stroke={`${node.color}${done?"66":"22"}`} strokeWidth="0.6" strokeDasharray="2 2"
                              style={{animation:`spineGlow ${2+i*0.2}s ease-in-out infinite`}} />
                          </>}
                        </g>
                      );
                    })}

                    {/* Yer simgesi */}
                    <text x="110" y="528" textAnchor="middle" fontSize="7" letterSpacing="2" fill="rgba(255,255,255,0.2)"
                      fontFamily="'Jost',sans-serif">▼ {lang==="tr"?"YERYÜZÜ":"EARTH"}</text>

                    {/* Gök simgesi */}
                    <text x="110" y="22" textAnchor="middle" fontSize="7" letterSpacing="2" fill="rgba(255,255,255,0.2)"
                      fontFamily="'Jost',sans-serif">▲ {lang==="tr"?"GÖK":"SKY"}</text>

                    {/* Tam bağlantı efekti */}
                    {allStepsComplete && <>
                      <line x1="110" y1="500" x2="110" y2="40" stroke="url(#riseGrad)" strokeWidth="4" filter="url(#glowF)" opacity="0.8"
                        strokeDasharray="6 4" style={{animation:`electricRise 1.8s linear infinite`}} />
                      <text x="110" y="270" textAnchor="middle" fontSize="9" letterSpacing="3" fill="rgba(130,217,163,0.8)"
                        fontFamily="'Jost',sans-serif">⚡ {lang==="tr"?"BAĞLANTI AKTİF":"CONNECTION ACTIVE"} ⚡</text>
                    </>}
                  </svg>
                </div>
              );
            })()}

            {/* CTA */}
            {allStepsComplete?(
              <div style={{textAlign:"center",marginTop:4,padding:"12px 20px",background:"rgba(74,222,128,0.06)",border:"1px solid rgba(74,222,128,0.16)",borderRadius:16,maxWidth:280,width:"100%"}}>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:15,color:"#82d9a3",letterSpacing:1}}>
                  🌿 {lang==="tr"?"Bugün tamamlandı":"Today complete"}
                </div>
              </div>
            ):nextStep?(
              <button className="sakin-btn-primary" style={{marginTop:4,fontSize:13,letterSpacing:2}}
                onClick={()=>setScreen(nextStep?.id || "sabah")}>
                {lang==="tr"?(completedStepCount>0?"GÜNE DEVAM ET →":"GÜNE BAŞLA →"):(completedStepCount>0?"CONTINUE →":"START THE JOURNEY →")}
              </button>
            ):null}

            {/* Badges */}
            <div style={{display:"flex",gap:8,marginTop:18,flexWrap:"wrap",justifyContent:"center"}}>
              {BADGES.map(b=>{
                const unlocked=streakData.badges.includes(b.days);
                return(
                  <div key={b.days} style={{
                    background:unlocked?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.012)",
                    border:`1px solid ${unlocked?"rgba(255,200,60,0.25)":"rgba(255,255,255,0.04)"}`,
                    borderRadius:10,padding:"7px 12px",textAlign:"center",
                    opacity:unlocked?1:0.28,transition:"all 0.3s",
                  }}>
                    <div style={{fontSize:15,marginBottom:2}}>{b.icon}</div>
                    <div style={{fontSize:13,letterSpacing:1.5,color:unlocked?"#f0c860":"#666666",fontFamily:"'Jost',sans-serif",textTransform:"uppercase"}}>{b.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Harita — adım navigasyonu */}
            <div style={{width:"100%",marginTop:28,borderTop:"1px solid rgba(255,255,255,0.05)",paddingTop:20}}>
              <div style={{fontSize:12,letterSpacing:3,color:"#777777",textAlign:"center",marginBottom:14,fontFamily:"'Jost',sans-serif",textTransform:"uppercase"}}>{lang==="tr"?"GÜNÜN BAĞLANTISI":"DAY CONNECTION"}</div>
              <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
                {steps.map(step=>{
                  const done=!!stepsCompleted[step.id];
                  const isNext=nextStep?.id===step.id;
                  return(
                    <button key={step.id}
                      onClick={()=>{ if(step.id==="sabah" && done) return; if(done||isNext) setScreen(step.id); }}
                      style={{
                        background: done?`rgba(${step.glow},0.14)`:isNext?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.02)",
                        border:`1px solid ${done?`rgba(${step.glow},0.4)`:isNext?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.04)"}`,
                        borderRadius:20,padding:"7px 13px",cursor:done||isNext?"pointer":"default",
                        display:"flex",alignItems:"center",gap:5,
                        opacity:done||isNext?1:0.3,transition:"all 0.2s",
                      }}>
                      <span style={{fontSize:14}}>{done?"✓":step.icon}</span>
                      <span style={{fontFamily:"'Jost',sans-serif",fontSize:12,letterSpacing:1.5,textTransform:"uppercase",color:done?step.color:isNext?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.2)"}}>{step.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* SABAH */}
      {screen==="sabah" && (
        <div style={{ maxWidth:390,width:"100%",padding:"62px 26px 170px",position:"relative",zIndex:1 }}>
          <div style={{ textAlign:"center",marginBottom:36,animation:"sunrise 1s ease forwards" }}>
            <div style={{ position:"relative",width:88,height:88,margin:"0 auto" }}>
              <div style={{ position:"absolute",inset:0,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,155,55,0.4) 0%,rgba(255,95,35,0.1) 55%,transparent 70%)",boxShadow:"0 0 32px rgba(255,130,45,0.3),0 0 64px rgba(255,95,35,0.12)",animation:"slowPulse 4.5s ease-in-out infinite" }} />
              <div style={{ position:"absolute",inset:-14,borderRadius:"50%",border:"1px solid rgba(255,140,50,0.08)" }} />
            </div>
            <div style={{ marginTop:16,fontFamily:"'Jost',sans-serif",fontWeight:300,fontSize:13,letterSpacing:4,textTransform:"uppercase",color:"#777777" }}>{time.toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})}</div>
          </div>
          {stepsCompleted["sabah"] ? (
            /* ── Tamamlandı: salt-okunur özet ── */
            <div>
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:13,letterSpacing:3,color:"#888888",marginBottom:10,fontFamily:"'Jost',sans-serif",textTransform:"uppercase" }}>{lang==="tr"?"Bugünün niyeti":"Today's intention"}</div>
                <div style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,140,50,0.2)",borderRadius:12,padding:"14px 16px",fontSize:14,color:"#e0d8f4",lineHeight:1.8,fontStyle:"italic" }}>
                  {niyet || "—"}
                </div>
              </div>
              <div style={{ marginBottom:28 }}>
                <div style={{ fontSize:13,letterSpacing:3,color:"#888888",marginBottom:10,fontFamily:"'Jost',sans-serif",textTransform:"uppercase" }}>{lang==="tr"?"Seçilen kelimeler":"Selected words"}</div>
                <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
                  {selectedWords.length > 0 ? selectedWords.map(w=>(
                    <span key={w} style={{ padding:"6px 16px",borderRadius:20,fontSize:13,letterSpacing:0.5,background:"rgba(255,140,50,0.12)",border:"1px solid rgba(255,140,50,0.28)",color:"#f0a060" }}>{w}</span>
                  )) : <span style={{ color:"#666666",fontSize:13 }}>—</span>}
                </div>
              </div>
              <div style={{ display:"flex",gap:8,marginBottom:20 }}>
                <button className="sakin-btn-primary" style={{ flex:1 }} onClick={()=>setScreen("nefes")}>
                  {t("btn_continue")}
                </button>
                <button onClick={()=>{ setStepsCompleted(prev=>{ const next={...prev}; delete next.sabah; localStorage.setItem("sakin_steps_"+todayKey,JSON.stringify(next)); return next; }); }}
                  style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"0 16px",color:"#888888",fontSize:13,letterSpacing:1.5,cursor:"pointer",fontFamily:"'Jost',sans-serif",whiteSpace:"nowrap" }}>
                  {lang==="tr"?"düzenle":"edit"}
                </button>
              </div>
              <div style={{ textAlign:"center",fontSize:13,letterSpacing:2,color:"#777777",fontFamily:"'Jost',sans-serif" }}>
                {lang==="tr" ? "Yarın yenilenir" : "Resets tomorrow"}
              </div>
            </div>
          ) : (
            /* ── Düzenlenebilir form ── */
            <>
              <div style={{ marginBottom:28 }}>
                <div style={{ fontFamily:"'Inter',sans-serif",fontSize:19,letterSpacing:0.5,marginBottom:14,fontWeight:300,lineHeight:1.5,color:"#cccccc" }}>{t("intention_q")}</div>
                <textarea className="sakin-input" rows={3} placeholder={t("intention_ph")} value={niyet} onChange={e=>setNiyet(e.target.value)} />
              </div>
              <div style={{ marginBottom:32 }}>
                <div className="label-sm" style={{ marginBottom:12 }}>{t("choose_words")}</div>
                <div style={{ display:"flex",flexWrap:"wrap",gap:7 }}>
                  {MORNING_WORDS.map(w=>{
                    const locked = !isPremium && PREMIUM_WORDS.includes(w);
                    return (
                      <button key={w} className={`word-chip ${selectedWords.includes(w)?"selected":""}`} onClick={()=>toggleWord(w)}
                        style={locked ? { opacity:0.45, position:"relative" } : {}}>
                        {locked && <span style={{ marginRight:5,fontSize:11 }}>🔒</span>}{w}
                      </button>
                    );
                  })}
                </div>
                {!isPremium && (
                  <button onClick={()=>setScreen("fiyat")} style={{ display:"block",margin:"12px auto 0",background:"none",border:"1px solid rgba(184,164,216,0.25)",borderRadius:20,padding:"8px 20px",color:"#b8a4d8",fontSize:12,letterSpacing:2,cursor:"pointer",fontFamily:"'Jost',sans-serif" }}>
                    {lang==="tr" ? "✦ Tüm kelimeleri aç" : "✦ Unlock all words"}
                  </button>
                )}
                {selectedWords.length>0 && <div style={{ marginTop:10,fontSize:14,color:"#b0baca",letterSpacing:1.5 }}>{selectedWords.join(" · ")}</div>}
              </div>
              {selectedWords.length < 3 || !niyet.trim() ? (
                <div style={{ textAlign:"center", fontSize:14, color:"#888888", letterSpacing:1, padding:"12px 0" }}>
                  {lang==="tr"
                    ? `${niyet.trim() ? "✓" : "○"} Niyetini yaz  ·  ${selectedWords.length}/3 kelime seç`
                    : `${niyet.trim() ? "✓" : "○"} Write your intention  ·  ${selectedWords.length}/3 words`}
                </div>
              ) : (
                <button className="sakin-btn-primary" style={{ width:"100%" }} onClick={()=>{ const dk=new Date().toISOString().slice(0,10); localStorage.setItem("sakin_niyet_"+dk,niyet); localStorage.setItem("sakin_words_"+dk,JSON.stringify(selectedWords)); markStep("sabah"); setScreen("nefes"); }}>{t("btn_continue")}</button>
              )}
            </>
          )}
        </div>
      )}

      {/* NEFES */}
      {screen==="nefes" && (
        <div style={{ textAlign:"center",padding:"62px 20px 170px",position:"relative",zIndex:1,maxWidth:420,width:"100%" }}>
          <div className="label-sm" style={{ marginBottom:32,letterSpacing:5 }}>{breathStarted ? t(`breath_mode_${breathMode}`) : t("breath_title")}</div>

          {/* ── Visualization area ── */}
          {(breathStarted && breathMode==="standart") && (
            <div style={{ position:"relative",width:205,height:205,margin:"0 auto 32px" }}>
              {[1.72,1.45,1.2].map((s,i)=>(
                <div key={i} style={{ position:"absolute",inset:0,borderRadius:"50%",border:`1px solid rgba(80,130,200,${0.1-i*0.025})`,transform:`scale(${s})` }} />
              ))}
              <div style={{ position:"absolute",inset:0,borderRadius:"50%",background:"radial-gradient(circle,rgba(80,130,200,0.62),rgba(255,255,255,0.24))",transition:breathPhase==="ready"?"none":`transform ${breathIsActive?breathInDur:breathOutDur} ease`,transform:`scale(${breathStarted?breathScale:1})`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <div style={{ fontSize:14,letterSpacing:2,color:"rgba(255,255,255,0.82)" }}>{breathLabel}</div>
              </div>
            </div>
          )}

          {breathStarted && breathMode==="diyafram" && (
            <div style={{ display:"flex",flexDirection:"column",alignItems:"center",margin:"0 auto 18px" }}>
              <div style={{ position:"relative",width:180,height:260 }}>
              <svg width="180" height="260" viewBox="0 0 180 260" style={{ overflow:"visible" }}>
                {/* Side profile body silhouette */}
                <path d="M 90 12 C 102 12 110 22 110 35 C 110 48 102 56 90 58 C 78 56 70 48 70 35 C 70 22 78 12 90 12" fill="none" stroke="rgba(80,200,180,0.25)" strokeWidth="1.2"/>
                {/* Neck */}
                <path d="M 82 58 L 82 72 M 98 58 L 98 72" stroke="rgba(80,200,180,0.2)" strokeWidth="1.2"/>
                {/* Shoulders & torso outline */}
                <path d="M 82 72 C 60 74 48 78 44 88 L 44 170 C 44 185 55 195 72 195 L 108 195 C 125 195 136 185 136 170 L 136 88 C 132 78 120 74 98 72" fill="none" stroke="rgba(80,200,180,0.2)" strokeWidth="1.2"/>
                {/* Lung area - left */}
                <path d="M 56 85 C 52 90 50 100 52 118 C 54 128 62 132 70 130 L 70 85 C 66 82 60 82 56 85" fill="rgba(80,200,180,0.06)" stroke="rgba(80,200,180,0.15)" strokeWidth="1"/>
                {/* Lung area - right */}
                <path d="M 124 85 C 128 90 130 100 128 118 C 126 128 118 132 110 130 L 110 85 C 114 82 120 82 124 85" fill="rgba(80,200,180,0.06)" stroke="rgba(80,200,180,0.15)" strokeWidth="1"/>
                {/* Diaphragm muscle line - moves down on inhale */}
                <path d={`M 48 ${breathIsActive?142:132} Q 90 ${breathIsActive?124:114} 132 ${breathIsActive?142:132}`}
                  fill="none" stroke="rgba(80,200,180,0.8)" strokeWidth="2.5" strokeLinecap="round"
                  style={{ transition:`d ${breathIsActive?breathInDur:breathOutDur} ease-in-out` }}/>
                <text x="155" y={breathIsActive?142:132} fill="rgba(80,200,180,0.5)" fontSize="9" fontFamily="'Jost',sans-serif"
                  style={{ transition:`y ${breathIsActive?breathInDur:breathOutDur} ease-in-out` }}>
                  {lang==="tr"?"diyafram":"diaphragm"}
                </text>
                {/* Belly area - expands on inhale */}
                <ellipse cx="90" cy="168"
                  fill={`rgba(80,200,180,${breathIsActive?0.25:0.05})`}
                  stroke={`rgba(80,200,180,${breathIsActive?0.6:0.2})`}
                  strokeWidth="1.5"
                  style={{
                    transformOrigin:"90px 168px",
                    transform:`scaleX(${breathIsActive?1.15:0.85}) scaleY(${breathIsActive?1.2:0.7})`,
                    transition:`all ${breathIsActive?breathInDur:breathOutDur} ease-in-out`,
                  }}
                  rx="36" ry="24"
                />
                <text x="90" y="172" textAnchor="middle" fill={`rgba(80,200,180,${breathIsActive?0.7:0.3})`} fontSize="9" fontFamily="'Jost',sans-serif"
                  style={{ transition:`fill ${breathIsActive?breathInDur:breathOutDur} ease-in-out` }}>
                  {lang==="tr"?"karın":"belly"}
                </text>
                {/* Arrow indicators */}
                <g style={{ opacity:breathIsActive?1:0.2, transition:`opacity ${breathIsActive?breathInDur:breathOutDur} ease-in-out` }}>
                  <path d="M 48 155 L 38 155 M 43 150 L 38 155 L 43 160" fill="none" stroke="rgba(80,200,180,0.5)" strokeWidth="1.2"/>
                  <path d="M 132 155 L 142 155 M 137 150 L 142 155 L 137 160" fill="none" stroke="rgba(80,200,180,0.5)" strokeWidth="1.2"/>
                </g>
                {/* Chest label */}
                <text x="90" y="108" textAnchor="middle" fill="rgba(80,200,180,0.3)" fontSize="9" fontFamily="'Jost',sans-serif">
                  {lang==="tr"?"göğüs sabit":"chest still"}
                </text>
              </svg>
              </div>
              <div style={{ fontSize:14,letterSpacing:2,color:"rgba(255,255,255,0.82)",marginTop:6 }}>{breathLabel}</div>
            </div>
          )}

          {breathStarted && breathMode==="akciger" && (
            <div style={{ display:"flex",flexDirection:"column",alignItems:"center",margin:"0 auto 32px" }}>
              <div style={{ position:"relative",width:160,height:200 }}>
              <svg width="160" height="200" viewBox="0 0 160 200">
                {/* Trachea */}
                <line x1="80" y1="10" x2="80" y2="55" stroke="rgba(100,160,220,0.4)" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M 80 55 C 80 65 58 65 55 80" fill="none" stroke="rgba(100,160,220,0.35)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M 80 55 C 80 65 102 65 105 80" fill="none" stroke="rgba(100,160,220,0.35)" strokeWidth="2" strokeLinecap="round"/>
                {/* Left lung outline */}
                <path d="M 55 80 C 24 80 14 110 16 145 C 18 168 36 178 55 172 C 68 168 76 155 76 140 L 76 80 Z" fill="none" stroke="rgba(100,160,220,0.35)" strokeWidth="1.5"/>
                {/* Right lung outline */}
                <path d="M 105 80 C 136 80 146 110 144 145 C 142 168 124 178 105 172 C 92 168 84 155 84 140 L 84 80 Z" fill="none" stroke="rgba(100,160,220,0.35)" strokeWidth="1.5"/>
                {/* Left lung fill – rises from bottom */}
                <clipPath id="left-lung-clip">
                  <path d="M 55 80 C 24 80 14 110 16 145 C 18 168 36 178 55 172 C 68 168 76 155 76 140 L 76 80 Z"/>
                </clipPath>
                <rect x="10" y={172-(breathIsActive?92:0)} width="72" height="92"
                  fill={`rgba(100,160,220,${breathIsActive?0.28:0.04})`}
                  clipPath="url(#left-lung-clip)"
                  style={{ transition:breathPhase==="ready"?"none":`y ${breathIsActive?breathInDur:breathOutDur} ease-in-out, fill ${breathIsActive?breathInDur:breathOutDur} ease-in-out` }}
                />
                {/* Right lung fill */}
                <clipPath id="right-lung-clip">
                  <path d="M 105 80 C 136 80 146 110 144 145 C 142 168 124 178 105 172 C 92 168 84 155 84 140 L 84 80 Z"/>
                </clipPath>
                <rect x="78" y={172-(breathIsActive?92:0)} width="72" height="92"
                  fill={`rgba(100,160,220,${breathIsActive?0.28:0.04})`}
                  clipPath="url(#right-lung-clip)"
                  style={{ transition:breathPhase==="ready"?"none":`y ${breathIsActive?breathInDur:breathOutDur} ease-in-out, fill ${breathIsActive?breathInDur:breathOutDur} ease-in-out` }}
                />
              </svg>
              </div>
              <div style={{ fontSize:14,letterSpacing:2,color:"rgba(255,255,255,0.82)",marginTop:6 }}>{breathLabel}</div>
            </div>
          )}

          {breathStarted && breathMode==="kutu" && (
            <div style={{ position:"relative",width:205,height:205,margin:"0 auto 32px" }}>
              {(() => {
                const c = "140,100,220";
                const s = breathScale;
                const phaseIdx = {inhale:0,hold:1,exhale:2,hold2:3}[breathPhase]||0;
                return (
                  <>
                    {[1.72,1.45,1.2].map((sc,i)=>(
                      <div key={i} style={{ position:"absolute",inset:0,borderRadius:16,border:`1px solid rgba(${c},${0.1-i*0.025})`,transform:`scale(${sc})` }} />
                    ))}
                    <div style={{ position:"absolute",inset:0,borderRadius:16,background:`linear-gradient(135deg,rgba(${c},0.45),rgba(${c},0.12))`,transition:`transform ${breathIsActive?breathInDur:breathOutDur} ease`,transform:`scale(${s})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12 }}>
                      <svg width="60" height="60" viewBox="0 0 60 60">
                        {[[5,5,55,5],[55,5,55,55],[55,55,5,55],[5,55,5,5]].map(([x1,y1,x2,y2],i)=>(
                          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i===phaseIdx?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.2)"} strokeWidth={i===phaseIdx?2.5:1.2} strokeLinecap="round"/>
                        ))}
                        {[[5,5],[55,5],[55,55],[5,55]].map(([cx,cy],i)=>(
                          <circle key={i} cx={cx} cy={cy} r={i===phaseIdx?4:2.5} fill={i===phaseIdx?`rgba(${c},1)`:"rgba(255,255,255,0.3)"}/>
                        ))}
                      </svg>
                      <div style={{ fontSize:14,letterSpacing:2,color:"rgba(255,255,255,0.82)" }}>{breathLabel}</div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {breathStarted && (breathMode==="478"||breathMode==="sakinletici") && (
            <div style={{ position:"relative",width:205,height:205,margin:"0 auto 32px" }}>
              {(() => {
                const modeColors = { "478":"80,160,220", sakinletici:"80,200,160" };
                const c = modeColors[breathMode]||"80,130,200";
                const s = breathScale;
                return (
                  <>
                    {[1.72,1.45,1.2].map((sc,i)=>(
                      <div key={i} style={{ position:"absolute",inset:0,borderRadius:"50%",border:`1px solid rgba(${c},${0.1-i*0.025})`,transform:`scale(${sc})` }} />
                    ))}
                    <div style={{ position:"absolute",inset:0,borderRadius:"50%",background:`radial-gradient(circle,rgba(${c},0.58),rgba(${c},0.14))`,transition:`transform ${breathIsActive?breathInDur:breathOutDur} ease`,transform:`scale(${s})`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                      <div style={{ fontSize:14,letterSpacing:2,color:"rgba(255,255,255,0.82)" }}>{breathLabel}</div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Timing hint when active */}
          {breathStarted && (
            <div style={{ fontFamily:"'Jost',sans-serif",fontSize:13,letterSpacing:3,color:"rgba(255,255,255,0.2)",marginBottom:4 }}>
              {breathMode==="standart"    && "4 · 1.5 · 3.5"}
              {breathMode==="diyafram"    && "4 · 6"}
              {breathMode==="akciger"     && "5 · 2 · 7"}
              {breathMode==="478"         && "4 · 7 · 8"}
              {breathMode==="kutu"        && "4 · 4 · 4 · 4"}
              {breathMode==="sakinletici" && "4 · 2 · 8"}
            </div>
          )}

          <div style={{ fontFamily:"'Inter',sans-serif",fontSize:27,letterSpacing:4,fontWeight:300,marginBottom:6,color:"#cccccc" }}>{t("youre_here")}</div>
          <div className="label-sm" style={{ marginBottom:28 }}>{breathStarted ? t("breath_count", breathCount) : ""}</div>

          {/* ── Mode selection (before start) ── */}
          {!breathStarted && (
            <div style={{ marginBottom:28 }}>
              {/* Selected mode description */}
              <div style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:"12px 16px",marginBottom:18,minHeight:42,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <div style={{ fontSize:13,fontWeight:300,color:"rgba(200,190,220,0.6)",lineHeight:1.5,textAlign:"center" }}>
                  {t(`breath_desc_${breathMode}`)}
                </div>
              </div>
              {/* Main breathing modes */}
              <div className="label-sm" style={{ marginBottom:14,letterSpacing:4 }}>{t("breath_choose")}</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16 }}>
                {[
                  { id:"standart", icon:"🫧", color:"rgba(80,130,200,0.18)", border:"rgba(80,130,200,0.35)", rhythm:"4·1.5·3.5" },
                  { id:"diyafram", icon:"🌬", color:"rgba(80,200,180,0.18)", border:"rgba(80,200,180,0.35)", rhythm:"4·6" },
                  { id:"akciger",  icon:"🫁", color:"rgba(100,160,220,0.18)",border:"rgba(100,160,220,0.35)",rhythm:"5·2·7" },
                ].map(m=>(
                  <button key={m.id} onClick={()=>{ if(breathMode===m.id){ haptic(); playStartChime(); setBreathPhase("ready"); setBreathStarted(true); } else { setBreathMode(m.id); } }} style={{ background: breathMode===m.id ? m.color.replace("0.18","0.35") : m.color, border:`1.5px solid ${breathMode===m.id ? m.border.replace("0.35","0.75") : m.border}`, borderRadius:14, padding:"10px 6px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:5, transition:"all 0.2s ease" }}>
                    <span style={{ fontSize:20 }}>{m.icon}</span>
                    <span style={{ fontFamily:"'Jost',sans-serif",fontSize:14,letterSpacing:1.5,color:breathMode===m.id?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.5)",textTransform:"uppercase",lineHeight:1.3,textAlign:"center" }}>{t(`breath_mode_${m.id}`)}</span>
                    <span style={{ fontFamily:"'Jost',sans-serif",fontSize:14,letterSpacing:1,color:"rgba(255,255,255,0.25)" }}>{m.rhythm}</span>
                  </button>
                ))}
              </div>
              {/* Calming breathing modes */}
              <div className="label-sm" style={{ marginBottom:12,letterSpacing:4,color:"rgba(255,255,255,0.7)" }}>{t("breath_calming")}</div>
              {!isPremium ? (
                <div style={{ position:"relative" }}>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,opacity:0.3,pointerEvents:"none" }}>
                    {[
                      { id:"478", icon:"✦", rhythm:"4·7·8" },
                      { id:"kutu", icon:"⬜", rhythm:"4·4·4·4" },
                      { id:"sakinletici", icon:"🌿", rhythm:"4·2·8" },
                    ].map(m=>(
                      <div key={m.id} style={{ background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"10px 6px",display:"flex",flexDirection:"column",alignItems:"center",gap:5 }}>
                        <span style={{ fontSize:18 }}>{m.icon}</span>
                        <span style={{ fontFamily:"'Jost',sans-serif",fontSize:14,letterSpacing:1.5,color:"rgba(255,255,255,0.4)",textTransform:"uppercase" }}>{t(`breath_mode_${m.id}`)}</span>
                        <span style={{ fontSize:14,color:"rgba(255,255,255,0.2)" }}>{m.rhythm}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>setScreen("fiyat")} style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.4)",borderRadius:14,border:"1px solid rgba(184,164,216,0.2)",cursor:"pointer",color:"#b8a4d8",fontSize:13,letterSpacing:2,fontFamily:"'Jost',sans-serif" }}>
                    {lang==="tr" ? "✦ Premium ile Aç" : "✦ Unlock with Premium"}
                  </button>
                </div>
              ) : (
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8 }}>
                {[
                  { id:"478",        icon:"✦",  color:"rgba(80,160,220,0.18)", border:"rgba(80,160,220,0.35)", rhythm:"4·7·8" },
                  { id:"kutu",       icon:"⬜",  color:"rgba(140,100,220,0.18)",border:"rgba(140,100,220,0.35)",rhythm:"4·4·4·4" },
                  { id:"sakinletici",icon:"🌿",  color:"rgba(80,200,160,0.18)", border:"rgba(80,200,160,0.35)", rhythm:"4·2·8" },
                ].map(m=>{
                  const locked = !isPremium && PREMIUM_BREATH_MODES.includes(m.id);
                  return (
                  <button key={m.id} onClick={()=>{ if(locked){ setScreen("fiyat"); return; } if(breathMode===m.id){ haptic(); playStartChime(); setBreathPhase("ready"); setBreathStarted(true); } else { setBreathMode(m.id); } }} style={{ background: breathMode===m.id ? m.color.replace("0.18","0.35") : m.color, border:`1.5px solid ${breathMode===m.id ? m.border.replace("0.35","0.75") : m.border}`, borderRadius:14, padding:"10px 6px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:5, transition:"all 0.2s ease", opacity:locked?0.5:1, position:"relative" }}>
                    {locked && <span style={{ position:"absolute",top:6,right:8,fontSize:11 }}>🔒</span>}
                    <span style={{ fontSize:18 }}>{m.icon}</span>
                    <span style={{ fontFamily:"'Jost',sans-serif",fontSize:14,letterSpacing:1.5,color:breathMode===m.id?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.5)",textTransform:"uppercase",lineHeight:1.3,textAlign:"center" }}>{t(`breath_mode_${m.id}`)}</span>
                    <span style={{ fontFamily:"'Jost',sans-serif",fontSize:14,letterSpacing:1,color:"rgba(255,255,255,0.25)" }}>{m.rhythm}</span>
                  </button>
                  );
                })}
              </div>
              )}
            </div>
          )}

          {/* ── Buttons ── */}
          {!breathStarted ? (
            <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
              <button className="sakin-btn" onClick={()=>setScreen("sabah")}>{t("back")}</button>
              <button className="sakin-btn-primary" onClick={()=>{ haptic(); playStartChime(); setBreathPhase("ready"); setBreathStarted(true); }}>{t("btn_start")}</button>
            </div>
          ) : (
            <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
              <button className="sakin-btn" onClick={()=>{ setBreathStarted(false); setBreathPhase("ready"); clearInterval(breathRef.current); }}>{t("breath_change")}</button>
              <button className="sakin-btn-primary" onClick={()=>{ markStep("nefes"); setScreen("ses"); }}>{t("btn_next")}</button>
            </div>
          )}
        </div>
      )}

      {/* SES DALGALARI */}
      {screen==="ses" && (() => {
        const FREQS = getFreqData(lang);
        const stopFreqTone = () => {
          if (freqGainRef.current && freqCtxRef.current) {
            freqGainRef.current.gain.linearRampToValueAtTime(0, freqCtxRef.current.currentTime + 0.8);
          }
          setTimeout(() => {
            freqOscsRef.current.forEach(o => { try { o.stop(); } catch(_) {} });
            freqOscsRef.current = [];
            try { freqOscRef.current?.stop(); } catch(_) {}
            freqOscRef.current = null; freqGainRef.current = null;
            try { freqCtxRef.current?.close(); } catch(_) {}
            freqCtxRef.current = null;
          }, 820);
          stopBirdSound();
          setPlayingHz(null);
        };
        const playFreq = (hz) => {
          if (playingHz === hz) { stopFreqTone(); return; }
          if (playingHz) stopFreqTone();
          const freqData = FREQS.find(f => f.hz === hz);
          setTimeout(() => {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            freqCtxRef.current = ctx; ctx.resume();
            const allOscs = [];
            const master = ctx.createGain();
            master.gain.setValueAtTime(0, ctx.currentTime);
            master.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 2);
            master.connect(ctx.destination); freqGainRef.current = master;
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            lfo.type = "sine"; lfo.frequency.value = 0.12;
            lfoGain.gain.value = 0.04;
            lfo.connect(lfoGain); lfoGain.connect(master.gain);
            lfo.start(); allOscs.push(lfo);
            [[1, 1, "sine"], [0.5, 0.18, "sine"], [1.498, 0.1, "sine"], [2.76, 0.22, "sine"], [5.4, 0.07, "triangle"]].forEach(([ratio, amp, type]) => {
              const o = ctx.createOscillator(); const g = ctx.createGain();
              o.type = type; o.frequency.value = hz * ratio;
              g.gain.setValueAtTime(0, ctx.currentTime);
              g.gain.linearRampToValueAtTime(0.22 * amp, ctx.currentTime + 2);
              o.connect(g); g.connect(master); o.start();
              allOscs.push(o);
              if (ratio === 1) { freqOscRef.current = o; }
            });
            freqOscsRef.current = allOscs;
            if (freqData?.bird) playBirdSound(freqData.bird, hz === 741 ? 0.5 : 0.3);
            setPlayingHz(hz);
          }, playingHz ? 850 : 0);
        };
        return (
          <div style={{ maxWidth:440,width:"100%",padding:"52px 20px 170px",position:"relative",zIndex:1 }}>
            <div style={{ textAlign:"center",marginBottom:28 }}>
              <div className="label-sm" style={{ letterSpacing:5,marginBottom:8 }}>{t("sound_subtitle").toUpperCase()}</div>
              <div style={{ fontFamily:"'Inter',sans-serif",fontSize:26,fontWeight:300,letterSpacing:2,color:"#d0c0f0",marginBottom:12 }}>{t("sound_title")}</div>
              <div style={{ fontSize:14,color:"#888888",lineHeight:1.8,maxWidth:340,margin:"0 auto" }}>{t("sound_intro")}</div>
            </div>

            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {FREQS.map((f, i) => {
                const isPlaying = playingHz === f.hz;
                const isExpanded = activeFreq === f.hz;
                const isLocked = !isPremium && PREMIUM_FREQ_HZ.includes(f.hz);
                return (
                  <div key={f.hz} className="slide-in" style={{ animationDelay:`${i*0.04}s`,opacity:0 }}>
                    <div
                      onClick={() => { if (isLocked) { setScreen("fiyat"); return; } setActiveFreq(isExpanded ? null : f.hz); playFreq(f.hz); }}
                      style={{
                        background: isLocked ? "rgba(255,255,255,0.015)" : isPlaying ? `linear-gradient(135deg,${f.color}22,${f.color}0a)` : "rgba(255,255,255,0.025)",
                        border: `1px solid ${isLocked ? "rgba(255,255,255,0.04)" : isPlaying ? f.color+"66" : "rgba(255,255,255,0.06)"}`,
                        borderRadius: isExpanded ? "15px 15px 0 0" : 15,
                        padding:"14px 18px",cursor:"pointer",
                        transition:"all 0.3s ease",
                        display:"flex",alignItems:"center",gap:14,
                        opacity: isLocked ? 0.5 : 1,
                      }}>
                      <div style={{ width:44,height:44,borderRadius:"50%",flexShrink:0,
                        background:`radial-gradient(circle,${f.color}cc,${f.color}44)`,
                        boxShadow: isPlaying ? `0 0 20px ${f.color}66` : "none",
                        display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,
                        animation: isPlaying ? "slowPulse 2s ease-in-out infinite" : "none",
                        transition:"box-shadow 0.3s",
                      }}>{f.icon}</div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:3 }}>
                          <span style={{ fontFamily:"'Jost',sans-serif",fontSize:16,fontWeight:500,color:f.pastel,letterSpacing:2 }}>{f.hz} Hz</span>
                          {isPlaying && <span style={{ fontSize:11,letterSpacing:2,color:f.color,textTransform:"uppercase",animation:"pulse 1.5s ease-in-out infinite" }}>{t("sound_playing")}</span>}
                        </div>
                        <div style={{ fontSize:14,color:"#cccccc",letterSpacing:0.5 }}>{f.name}</div>
                        <div style={{ fontSize:13,color:"#666666",letterSpacing:0.3,marginTop:2 }}>{f.tema}</div>
                        {isPlaying && (
                          <div style={{ marginTop:8,animation:"fadeIn 1s ease forwards",opacity:0 }}>
                            <HarmonySVG color={f.pastel} active={true} />
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize:20,color:isPlaying?f.color:"rgba(255,255,255,0.15)",transition:"color 0.3s",flexShrink:0 }}>
                        {isLocked ? "🔒" : isPlaying ? "⏹" : "▶"}
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{
                        background:`linear-gradient(180deg,${f.color}0a,rgba(255,255,255,0.015))`,
                        border:`1px solid ${f.color}33`,borderTop:"none",
                        borderRadius:"0 0 15px 15px",padding:"16px 18px",
                        animation:"fadeIn 0.4s ease",
                      }}>
                        <div style={{ fontSize:14,color:"#b0a0c8",lineHeight:1.85,marginBottom:14 }}>{f.aciklama}</div>
                        <div style={{ fontSize:12,letterSpacing:2.5,color:`${f.color}aa`,marginBottom:8,textTransform:"uppercase" }}>{t("sound_effects")}</div>
                        <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                          {f.etkiler.map((e,j) => (
                            <span key={j} style={{
                              background:`${f.color}15`,border:`1px solid ${f.color}33`,
                              borderRadius:20,padding:"4px 12px",fontSize:13,color:f.pastel,letterSpacing:0.3,
                            }}>{e}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop:28,display:"flex",gap:10,justifyContent:"center" }}>
              <button className="sakin-btn" onClick={()=>{ stopFreqTone(); setScreen("nefes"); }}>{t("back")}</button>
              <button className="sakin-btn-primary" onClick={()=>{ stopFreqTone(); markStep("ses"); setScreen("chakra"); }}>{t("sound_btn_next")}</button>
            </div>
          </div>
        );
      })()}

      {/* ÇAKRA */}
      {screen==="chakra" && (
        <div style={{ textAlign:"center",padding:"62px 30px 170px",position:"relative",zIndex:1,maxWidth:360 }}>
          <div style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none",background:`radial-gradient(ellipse at 50% 42%,${chakra.pastel}1a 0%,transparent 58%)` }} />
          <div style={{ position:"relative",zIndex:1 }}>
            <div className="label-sm" style={{ marginBottom:34,letterSpacing:4 }}>{t("chakra_subtitle")}</div>
            <div style={{ width:146,height:146,borderRadius:"50%",margin:"0 auto 32px",background:`radial-gradient(circle,${chakra.color}cc,${chakra.pastel}44)`,boxShadow:`0 0 52px ${chakra.color}55,0 0 105px ${chakra.color}22`,animation:"slowPulse 4s ease-in-out infinite" }} />
            <div style={{ fontFamily:"'Jost',sans-serif",fontWeight:300,fontSize:13,letterSpacing:4,textTransform:"uppercase",color:chakra.pastel,marginBottom:16,opacity:0.9 }}>{chakra.name} {t("chakra_name_suf")}</div>
            <div style={{ fontFamily:"'Inter',sans-serif",fontSize:19,fontWeight:300,lineHeight:1.8,marginBottom:10,wordBreak:"break-word",color:"#cccccc" }}>{chakra.desc}</div>
            <div className="label-sm" style={{ marginBottom:30 }}>{t("chakra_stay")}</div>
            <button className="sakin-btn terapi-pill" style={{ marginBottom:14,padding:"11px 28px" }} onClick={()=>setScreen("terapi")}>{t("btn_therapy")}</button>
            <div>
              <button className="sakin-btn-primary" style={{ padding:"10px 28px",fontSize:13 }} onClick={()=>{ markStep("chakra"); setScreen("gun"); }}>{t("btn_next")}</button>
            </div>
          </div>
        </div>
      )}

      {screen==="terapi" && <TerapiScreen onBack={()=>setScreen("chakra")} onNext={()=>{ markStep("chakra"); setScreen("gun"); }} lang={lang} isPremium={isPremium} onPaywall={()=>setScreen("fiyat")} />}
      {screen==="gun"    && <ReminderScreen onBack={()=>setScreen("chakra")} onNext={()=>{ markStep("gun"); setScreen("aksam"); }} lang={lang} onTasksDone={setGunTasksDone} />}

      {/* AKŞAM */}
      {screen==="aksam" && (
        <div style={{ maxWidth:385,width:"100%",padding:"62px 26px 170px",position:"relative",zIndex:1 }}>
          {!aksamRitualChecks.every(Boolean) ? (
            <>
              <div style={{ textAlign:"center",marginBottom:28 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{margin:"0 auto 12px",display:"block",opacity:0.7}}>
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="#b090e0" strokeWidth="1.2" fill="none"/>
                </svg>
                <div style={{ fontSize:13,letterSpacing:5,color:"rgba(200,190,220,0.5)",textTransform:"uppercase",marginBottom:16 }}>{t("evening_label")}</div>
                <div style={{ fontSize:18,fontWeight:300,color:"#d8d0e8",lineHeight:1.6,whiteSpace:"pre-line" }}>{t("evening_subtitle")}</div>
              </div>
              <div style={{ fontSize:12,letterSpacing:4,color:"rgba(200,190,220,0.4)",textAlign:"center",textTransform:"uppercase",marginBottom:20 }}>{t("evening_ritual")}</div>
              {[
                { icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="#b090e0" strokeWidth="1.2"/></svg>, title:t("evening_step1"), desc:t("evening_step1_desc") },
                { icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 21C12 21 4 14.5 4 9.5C4 6.5 6.5 4 9 4c1.5 0 2.5.8 3 1.5C12.5 4.8 13.5 4 15 4c2.5 0 5 2.5 5 5.5C20 14.5 12 21 12 21z" stroke="#b090e0" strokeWidth="1.2" fill="none"/></svg>, title:t("evening_step2"), desc:t("evening_step2_desc") },
                { icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="#b090e0" strokeWidth="1.2"/><circle cx="12" cy="12" r="3" stroke="#b090e0" strokeWidth="1" opacity="0.5"/></svg>, title:t("evening_step3"), desc:t("evening_step3_desc") },
              ].map((step, i) => (
                <div key={i} onClick={() => setAksamRitualChecks(prev => { const n=[...prev]; n[i]=!n[i]; return n; })}
                  style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:18,padding:"18px 20px",marginBottom:12,display:"flex",alignItems:"center",gap:16,cursor:"pointer",transition:"all 0.3s" }}>
                  <div style={{ flexShrink:0,width:38,textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center" }}>{step.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:16,fontWeight:500,color:"#d8d0e8",marginBottom:4 }}>{step.title}</div>
                    <div style={{ fontSize:13,fontWeight:300,color:"rgba(200,190,220,0.5)",lineHeight:1.5 }}>{step.desc}</div>
                  </div>
                  <div style={{ width:44,height:44,borderRadius:"50%",background:aksamRitualChecks[i]?"rgba(160,120,220,0.3)":"rgba(160,120,220,0.1)",border:`2px solid ${aksamRitualChecks[i]?"rgba(160,120,220,0.7)":"rgba(160,120,220,0.25)"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.3s",fontSize:16,color:aksamRitualChecks[i]?"#b090e0":"transparent" }}>✓</div>
                </div>
              ))}
              <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:18,padding:"18px 20px",marginTop:8,display:"flex",alignItems:"center",gap:16 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{flexShrink:0,opacity:0.25}}>
                  <path d="M10 8c0-2.2-1.8-4-4-4S2 5.8 2 8c0 2 1 3 2 4h4l2-2V8zM22 8c0-2.2-1.8-4-4-4s-4 1.8-4 4v2l2 2h4c1-1 2-2 2-4z" stroke="#b090e0" strokeWidth="1.2"/>
                </svg>
                <div style={{ fontSize:14,fontWeight:300,color:"rgba(200,190,220,0.45)",lineHeight:1.6,flex:1,whiteSpace:"pre-line" }}>{t("evening_quote")}</div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{flexShrink:0,opacity:0.15}}>
                  <path d="M12 21C12 21 4 14.5 4 9.5C4 6.5 6.5 4 9 4c1.5 0 2.5.8 3 1.5C12.5 4.8 13.5 4 15 4c2.5 0 5 2.5 5 5.5C20 14.5 12 21 12 21z" stroke="#b090e0" strokeWidth="1.2"/>
                </svg>
              </div>
            </>
          ) : (
            <>
              <div style={{ textAlign:"center",marginBottom:32 }}>
                <div style={{ fontSize:28,marginBottom:9 }}>🌙</div>
                <div style={{ fontSize:13,letterSpacing:5,color:"#666666" }}>{t("evening_label")}</div>
              </div>
              {niyet && <div style={{ borderLeft:"2px solid rgba(255,255,255,0.32)",paddingLeft:15,marginBottom:26,color:"#888888",fontStyle:"italic",fontSize:15,lineHeight:1.7 }}>"{niyet}"</div>}
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:13,color:"#666666",marginBottom:9,letterSpacing:1 }}>{t("learned_q")}</div>
                <textarea className="sakin-input" rows={2} placeholder="..." value={aksamNote} onChange={e=>setAksamNote(e.target.value)} />
              </div>
              <div style={{ marginBottom:26 }}>
                <div style={{ fontSize:13,color:"#666666",marginBottom:9,letterSpacing:1 }}>{t("gratitude_q")}</div>
                <textarea className="sakin-input" rows={2} placeholder="..." value={sukur} onChange={e=>setSukur(e.target.value)} />
              </div>
              <div style={{ marginBottom:32,display:"flex",gap:8,justifyContent:"center" }}>
                {["🫶","⚡","🌊","✨","🌿"].map(em=>(
                  <button key={em} style={{ fontSize:22,background:"transparent",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"50%",width:44,height:44,cursor:"pointer",transition:"all 0.2s" }}
                    onMouseEnter={ev=>ev.target.style.transform="scale(1.22)"}
                    onMouseLeave={ev=>ev.target.style.transform="scale(1)"}>{em}</button>
                ))}
              </div>
              <button className="sakin-btn-primary" style={{ width:"100%" }} onClick={()=>{ markStep("aksam"); setScreen("harita"); }}>{t("btn_see_week")}</button>
            </>
          )}
        </div>
      )}

      {/* REHBER */}
      {/* İÇSEL AYNA — Google-style merkezi arama */}
      {screen==="rehber" && !isNative && (
        <div style={{ maxWidth:520,width:"100%",padding: sikayetAnaliz ? "20px 24px 170px" : "52px 24px 170px",position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center" }}>
          {/* Arka plan ambient */}
          <div style={{ position:"fixed",inset:0,background:"radial-gradient(ellipse 70% 50% at 50% 35%,rgba(120,60,200,0.12) 0%,transparent 70%)",pointerEvents:"none",zIndex:0 }} />

          {!sikayetAnaliz && (
            <>
              {/* Logo gem */}
              <div style={{ position:"relative",width:56,height:56,margin:"0 auto 18px",zIndex:1 }}>
                <div style={{ position:"absolute",inset:0,transform:"rotate(45deg)",border:"1px solid rgba(255,255,255,0.35)",borderRadius:6,animation:"diamondSpin 12s linear infinite" }} />
                <div style={{ position:"absolute",inset:11,transform:"rotate(45deg)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:4,animation:"diamondSpin 8s linear infinite reverse" }} />
                <div style={{ position:"absolute",inset:"50%",transform:"translate(-50%,-50%)",width:10,height:10,borderRadius:"50%",background:"rgba(255,255,255,0.8)",boxShadow:"0 0 16px rgba(255,255,255,0.6),0 0 32px rgba(255,255,255,0.4)" }} />
              </div>

              {/* Başlık */}
              <div style={{ textAlign:"center",marginBottom:36,zIndex:1 }}>
                <div style={{ fontFamily:"'Inter',sans-serif",fontSize:24,fontWeight:300,letterSpacing:4,color:"#d8c8f0" }}>
                  {lang==="tr" ? "Kalbine Sor" : "Ask Your Heart"}
                </div>
              </div>
            </>
          )}

          {/* Ana arama kutusu veya sonuç */}
          <div style={{ width:"100%",zIndex:1 }}>
            {sikayetAnaliz === "__loading__" ? (
              <div style={{ textAlign:"center",padding:"48px 0" }}>
                <div style={{ fontSize:26,marginBottom:14,animation:"pulse 2s ease-in-out infinite" }}>🪞</div>
                <div style={{ fontSize:13,letterSpacing:4,color:"#a070d0",animation:"pulse 1.5s ease-in-out infinite",fontFamily:"'Jost',sans-serif" }}>
                  {lang==="tr" ? "YANIT HAZIRLANIYOR" : "READING"}
                </div>
              </div>
            ) : sikayetAnaliz ? (
              /* SONUÇ EKRANI */
              <div>
                <div style={{ fontSize:13,letterSpacing:2.5,color:"#a070d0",opacity:0.8,marginBottom:14,fontFamily:"'Jost',sans-serif" }}>
                  {sikayet.toUpperCase()} {t("analysis_suf")}
                </div>
                <div style={{ fontSize:14,color:"#ccc0e0",lineHeight:2.1,whiteSpace:"pre-wrap",fontFamily:"'Inter',sans-serif",marginBottom:24 }}>
                  <FreqText text={sikayetAnaliz} onNav={(type, val) => {
                    if (type === "breath") { pendingBreathRef.current = val; setScreen("nefes"); }
                    else if (type === "screen") { setScreen(val); }
                  }} />
                </div>
                <button onClick={()=>{ setSikayetAnaliz(""); setSikayet(""); setSikayetHis(""); }}
                  style={{ background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:24,color:"#a070d0",cursor:"pointer",fontSize:13,letterSpacing:2.5,padding:"9px 22px",fontFamily:"'Jost',sans-serif",fontWeight:300 }}>
                  {lang==="tr" ? "← Yeni arama" : "← New search"}
                </button>
              </div>
            ) : (
              /* ARAMA KUTUSU */
              <div>
                <div style={{ position:"relative",marginBottom:14 }}>
                  <textarea
                    value={sikayet}
                    onChange={e=>setSikayet(e.target.value)}
                    onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey&&sikayet.trim()){e.preventDefault();requireAiConsent(generateSikayetAnaliz);} }}
                    placeholder={lang==="tr" ? "Fiziksel, duygusal ya da ruhsal — ne merak ediyorsun?" : "Physical, emotional or spiritual — what do you wonder about?"}
                    rows={3}
                    autoFocus
                    style={{
                      width:"100%",boxSizing:"border-box",
                      background:"rgba(255,255,255,0.035)",
                      border:"1px solid rgba(255,255,255,0.3)",
                      borderRadius:18,
                      padding:"18px 60px 18px 20px",
                      color:"#d0c8e8",fontSize:15,
                      fontFamily:"'Inter',sans-serif",
                      outline:"none",resize:"none",lineHeight:1.75,
                      letterSpacing:0.5,
                      transition:"border-color 0.2s, box-shadow 0.2s",
                      boxShadow:"0 0 0 0 rgba(255,255,255,0)",
                    }}
                    onFocus={e=>{ e.target.style.borderColor="rgba(255,255,255,0.6)"; e.target.style.boxShadow="0 0 0 3px rgba(255,255,255,0.08)"; }}
                    onBlur={e=>{ e.target.style.borderColor="rgba(255,255,255,0.3)"; e.target.style.boxShadow="none"; }}
                  />
                  {/* Inline arama butonu */}
                  <button
                    onClick={()=>requireAiConsent(generateSikayetAnaliz)}
                    disabled={!sikayet.trim()}
                    style={{
                      position:"absolute",right:12,bottom:12,
                      width:44,height:44,borderRadius:"50%",
                      background:sikayet.trim()?"linear-gradient(135deg,rgba(255,255,255,0.8),rgba(255,255,255,0.6))":"rgba(255,255,255,0.05)",
                      border:"none",cursor:sikayet.trim()?"pointer":"default",
                      color:sikayet.trim()?"#fff":"#777777",fontSize:15,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      transition:"all 0.25s",
                    }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="1.5" y="1.5" width="13" height="13" rx="1.8" transform="rotate(45 8 8)"
                        stroke={sikayet.trim()?"rgba(255,255,255,0.9)":"rgba(100,90,140,0.4)"} strokeWidth="1.2"/>
                      <circle cx="8" cy="8" r="2"
                        fill={sikayet.trim()?"rgba(255,255,255,0.95)":"rgba(100,90,140,0.4)"}/>
                    </svg>
                  </button>
                </div>


                {/* Ne sorabilirim? butonu + detaylı soru kutucuğu */}
                <div style={{ marginTop:20,position:"relative" }}>
                  <button onClick={()=>setShowOrnekler(v=>!v)}
                    style={{
                      width:"100%",
                      background:"rgba(255,255,255,0.06)",
                      border:"1px solid rgba(255,255,255,0.2)",
                      borderRadius:14,padding:"12px 18px",
                      color:"#8868b0",
                      cursor:"pointer",
                      display:"flex",alignItems:"center",justifyContent:"space-between",
                      fontFamily:"'Jost',sans-serif",fontWeight:300,
                      transition:"all 0.2s",
                    }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.4)"; e.currentTarget.style.color="#b090d8"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.2)"; e.currentTarget.style.color="#8868b0"; }}>
                    <span style={{ fontSize:13,letterSpacing:2 }}>{lang==="tr" ? "NE SORABİLİRİM?" : "WHAT CAN I ASK?"}</span>
                    <span style={{ fontSize:14,transition:"transform 0.25s",display:"inline-block",transform:showOrnekler?"rotate(180deg)":"rotate(0deg)" }}>⌄</span>
                  </button>

                  {showOrnekler && (
                    <div style={{
                      marginTop:8,
                      background:"linear-gradient(160deg,rgba(0,0,0,0.97),rgba(8,4,22,0.95))",
                      border:"1px solid rgba(255,255,255,0.2)",
                      borderRadius:16,padding:"18px 16px",
                      boxShadow:"0 8px 40px rgba(0,0,0,0.6),0 0 30px rgba(255,255,255,0.08)",
                    }}>
                      {(lang==="tr" ? [
                        { cat:"🌿 Beden & Sağlık", sorular:[
                          "Kronik yorgunluk neden hep benimle?",
                          "Sindirim sorunum var, ruhsal nedeni nedir?",
                          "Baş ağrım sürekli geliyor, çakra bağlantısı var mı?",
                          "Uykusuzluk çekiyorum, enerjetik sebebi ne?",
                        ]},
                        { cat:"💜 Duygular & Zihin", sorular:[
                          "Bu hafta neden bu kadar dengesiz hissediyorum?",
                          "Sürekli endişeliyim, hangi çakram kapalı?",
                          "Öfkemi nasıl dönüştürebilirim?",
                          "Yalnızlık hissi içimde büyüyor, ne yapmalıyım?",
                        ]},
                        { cat:"⚡ Enerji & Çakra", sorular:[
                          "Hangi çakramın enerjiye ihtiyacı var?",
                          "Cinsel enerjimi yaratıma nasıl dönüştürürüm?",
                          "Aura temizliği için ne önerirsin?",
                          "Kök çakramı nasıl güçlendirebilirim?",
                        ]},
                        { cat:"🌙 Ruhsal Yolculuk", sorular:[
                          "Hayatımda neden aynı döngüler tekrar ediyor?",
                          "Misyonum nedir, nasıl anlayabilirim?",
                          "İçsel sesimi nasıl daha net duyabilirim?",
                          "Karanlık gecelerde kendimi nasıl tutabilirim?",
                        ]},
                        { cat:"🌀 Yaşam Geçişleri", sorular:[
                          "Taşınma dönemindeyim, sırt ağrım başladı — bağlantısı var mı?",
                          "İş değiştiriyorum ve içimde büyük bir kaygı var, nedeni ne olabilir?",
                          "Ayrılık sürecindeyim, bedenimde ağırlık hissediyorum.",
                          "Yeni bir başlangıç önümde, ama adım atmak zor geliyor.",
                        ]},
                      ] : [
                        { cat:"🌿 Body & Health", sorular:[
                          "Why is chronic fatigue always with me?",
                          "I have digestive issues — what's the spiritual cause?",
                          "Constant headaches — is there a chakra link?",
                          "I can't sleep — what's the energetic reason?",
                        ]},
                        { cat:"💜 Emotions & Mind", sorular:[
                          "Why do I feel so unbalanced this week?",
                          "I'm constantly anxious — which chakra is blocked?",
                          "How can I transform my anger?",
                          "Loneliness is growing inside me — what should I do?",
                        ]},
                        { cat:"⚡ Energy & Chakra", sorular:[
                          "Which of my chakras needs energy right now?",
                          "How do I channel sexual energy into creativity?",
                          "What do you recommend for aura cleansing?",
                          "How can I strengthen my root chakra?",
                        ]},
                        { cat:"🌙 Spiritual Journey", sorular:[
                          "Why do the same cycles keep repeating in my life?",
                          "What is my mission and how can I understand it?",
                          "How can I hear my inner voice more clearly?",
                          "How do I hold myself together in dark nights?",
                        ]},
                        { cat:"🌀 Life Transitions", sorular:[
                          "I'm moving homes and my back pain started — is there a connection?",
                          "I'm changing jobs and feel deep anxiety — what might be the cause?",
                          "I'm going through a separation and feel heaviness in my body.",
                          "A new beginning is ahead but taking the first step feels heavy.",
                        ]},
                      ]).map(({cat,sorular})=>(
                        <div key={cat} style={{ marginBottom:14 }}>
                          <div style={{ fontSize:14,letterSpacing:2.5,color:"rgba(255,255,255,0.6)",marginBottom:8,fontFamily:"'Jost',sans-serif" }}>{cat.toUpperCase()}</div>
                          {sorular.map(s=>(
                            <button key={s} onClick={()=>{ setSikayet(s); setShowOrnekler(false); }}
                              style={{
                                display:"block",width:"100%",textAlign:"left",
                                background:"none",border:"none",
                                borderBottom:"1px solid rgba(255,255,255,0.04)",
                                padding:"9px 4px",
                                color:"#b0a0cc",
                                fontSize:13,
                                fontFamily:"'Inter',sans-serif",
                                cursor:"pointer",lineHeight:1.55,letterSpacing:0.3,
                                transition:"color 0.15s",
                              }}
                              onMouseEnter={e=>{ e.currentTarget.style.color="#d8c8f0"; }}
                              onMouseLeave={e=>{ e.currentTarget.style.color="#b0a0cc"; }}>
                              {s}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Haftanın Kozmik Enerji Durumu */}
                <div style={{ marginTop:10,position:"relative" }}>
                  <button onClick={()=>{ const next=!showKozmik; setShowKozmik(next); if(next) fetchKozmik(); }}
                    style={{
                      width:"100%",
                      background:"rgba(184,164,216,0.06)",
                      border:"1px solid rgba(184,164,216,0.25)",
                      borderRadius:14,padding:"12px 18px",
                      color:"#a888d0",cursor:"pointer",
                      display:"flex",alignItems:"center",justifyContent:"space-between",
                      fontFamily:"'Jost',sans-serif",fontWeight:300,
                      transition:"all 0.2s",
                    }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(184,164,216,0.5)"; e.currentTarget.style.color="#c5a6e8"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(184,164,216,0.25)"; e.currentTarget.style.color="#a888d0"; }}>
                    <span style={{ fontSize:13,letterSpacing:2 }}>{lang==="tr" ? "HAFTANIN KOZMİK ENERJİSİ" : "WEEK'S COSMIC ENERGY"}</span>
                    <span style={{ fontSize:14,transition:"transform 0.25s",display:"inline-block",transform:showKozmik?"rotate(180deg)":"rotate(0deg)" }}>⌄</span>
                  </button>

                  {showKozmik && (
                    <div style={{
                      marginTop:8,
                      background:"linear-gradient(160deg,rgba(0,0,0,0.97),rgba(20,10,40,0.95))",
                      border:"1px solid rgba(184,164,216,0.25)",
                      borderRadius:16,padding:"16px 18px",
                      boxShadow:"0 8px 40px rgba(0,0,0,0.6),0 0 30px rgba(184,164,216,0.08)",
                    }}>
                      {kozmikLoading && (
                        <div style={{ textAlign:"center",color:"#888",fontSize:13,padding:"20px 0" }}>
                          {lang==="tr" ? "NOAA verileri yükleniyor..." : "Loading NOAA data..."}
                        </div>
                      )}
                      {!kozmikLoading && !kozmikData && (
                        <div style={{ textAlign:"center",color:"#888",fontSize:13,padding:"20px 0" }}>
                          {lang==="tr" ? "Veri alınamadı. İnternet bağlantını kontrol et." : "Could not fetch data."}
                        </div>
                      )}
                      {!kozmikLoading && kozmikData && (
                        <>
                          <div style={{ marginBottom:14,paddingBottom:12,borderBottom:"1px solid rgba(184,164,216,0.15)" }}>
                            <div style={{ fontSize:11,letterSpacing:3,color:"#888",textTransform:"uppercase",marginBottom:6 }}>
                              {lang==="tr" ? "Şu Anki Durum" : "Current State"}
                            </div>
                            <div style={{ fontSize:18,color:"#d0c0f0",fontFamily:"'Jost',sans-serif",letterSpacing:1 }}>
                              Kp = {kozmikData.past_7_days.current_kp} · <span style={{ color:"#a888d0",fontStyle:"italic",textTransform:"capitalize" }}>{lang==="tr" ? kozmikData.interpretation.current.tr : kozmikData.interpretation.current.en}</span>
                            </div>
                          </div>

                          <div style={{ marginBottom:14 }}>
                            <div style={{ fontSize:11,letterSpacing:3,color:"#888",textTransform:"uppercase",marginBottom:8 }}>
                              {lang==="tr" ? "Son 7 Gün" : "Past 7 Days"}
                            </div>
                            <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:4,height:80,marginBottom:6 }}>
                              {kozmikData.past_7_days.daily.map(d=>{
                                const h = Math.max(8, (d.kp/9)*70);
                                const color = d.kp<3?"#82d9a3":d.kp<5?"#d9c682":d.kp<6?"#d99a82":"#e06a6a";
                                return (
                                  <div key={d.day} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
                                    <div style={{ fontSize:10,color:"#aaa",fontFamily:"'Jost',sans-serif" }}>{d.kp}</div>
                                    <div style={{ width:"100%",height:h,background:`linear-gradient(180deg,${color}cc,${color}55)`,borderRadius:"4px 4px 0 0",border:`1px solid ${color}aa` }} />
                                    <div style={{ fontSize:9,color:"#666",letterSpacing:0.5 }}>{d.day.slice(5).replace("-","/")}</div>
                                  </div>
                                );
                              })}
                            </div>
                            <div style={{ fontSize:12,color:"#999",lineHeight:1.6 }}>
                              {lang==="tr"
                                ? `Hafta ortalaması: Kp ${kozmikData.past_7_days.avg_kp}, en yüksek: ${kozmikData.past_7_days.max_kp} (${kozmikData.interpretation.week_peak.tr})`
                                : `Week avg: Kp ${kozmikData.past_7_days.avg_kp}, peak: ${kozmikData.past_7_days.max_kp} (${kozmikData.interpretation.week_peak.en})`}
                            </div>
                          </div>

                          {kozmikData.next_3_days.forecast_max_kp !== null && (
                            <div style={{ marginBottom:14,paddingTop:12,borderTop:"1px solid rgba(184,164,216,0.15)" }}>
                              <div style={{ fontSize:11,letterSpacing:3,color:"#888",textTransform:"uppercase",marginBottom:6 }}>
                                {lang==="tr" ? "Önümüzdeki 3 Gün" : "Next 3 Days"}
                              </div>
                              <div style={{ fontSize:14,color:"#c0a0e8" }}>
                                {lang==="tr"
                                  ? `Tahmini en yüksek: Kp ${kozmikData.next_3_days.forecast_max_kp} (${kozmikData.interpretation.forecast_peak?.tr})`
                                  : `Forecast peak: Kp ${kozmikData.next_3_days.forecast_max_kp} (${kozmikData.interpretation.forecast_peak?.en})`}
                              </div>
                            </div>
                          )}

                          <div style={{ fontSize:11,color:"#777",lineHeight:1.7,paddingTop:10,borderTop:"1px solid rgba(184,164,216,0.15)" }}>
                            {lang==="tr"
                              ? "Kp index Dünya'nın jeomanyetik aktivitesini gösterir. Yüksek değerler (5+) güneş fırtınalarıyla ilişkilidir — sinir sistemi hassasiyeti, uyku bozukluğu, yoğun rüyalar görülebilir. Düşük değerler (0-2) sakin dönemlerdir."
                              : "Kp index reflects Earth's geomagnetic activity. High values (5+) signal solar storms — nervous system sensitivity, sleep disturbance, vivid dreams may occur. Low values (0-2) are calm periods."}
                          </div>
                          <div style={{ fontSize:10,color:"#555",marginTop:8,textAlign:"right" }}>
                            {lang==="tr" ? "Kaynak: " : "Source: "}NOAA Space Weather
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* HARİTA */}
      {screen==="harita" && (
        <div style={{ maxWidth:405,width:"100%",padding:"62px 26px 170px",position:"relative",zIndex:1 }}>
          <div style={{ textAlign:"center",marginBottom:40 }}>
            <div style={{ fontSize:13,letterSpacing:5,color:"#666666",marginBottom:9 }}>{t("weekly_label")}</div>
            <div style={{ fontSize:22,fontWeight:300,letterSpacing:2 }}>{t("inner_map")}</div>
          </div>
          <div style={{ position:"relative",width:186,height:186,margin:"0 auto 34px" }}>
            <svg width="186" height="186" style={{ transform:"rotate(-90deg)" }}>
              <circle cx="93" cy="93" r="74" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="9" />
              <circle cx="93" cy="93" r="74" fill="none" stroke="url(#dayGrad)" strokeWidth="9"
                strokeDasharray={`${2*Math.PI*74}`} strokeDashoffset={`${2*Math.PI*74*(1-dayPct/100)}`} strokeLinecap="round" />
              <defs>
                <linearGradient id="dayGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f1a24a" /><stop offset="50%" stopColor="#8b5aa0" /><stop offset="100%" stopColor="#2a6fb8" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column" }}>
              <div style={{ fontSize:22,fontWeight:300 }}>{Math.round(dayPct)}%</div>
              <div style={{ fontSize:14,letterSpacing:3,color:"#666666" }}>{t("day_pct")}</div>
            </div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:32 }}>
            {[
              {label:t("stat_chakra"),value:chakra.name,color:chakra.pastel},
              {label:t("stat_breath"),value:`${breathCount}`,color:"#82d9a3"},
              {label:t("stat_word"),value:selectedWords[0]||"—",color:"#f0c27f"},
              {label:t("stat_mindful"),value:`${completedStepCount}`,color:"#85c1e9"},
            ].map((s,i)=>(
              <div key={i} style={{ background:"rgba(255,255,255,0.022)",border:"1px solid rgba(255,255,255,0.055)",borderRadius:13,padding:"13px 15px" }}>
                <div style={{ fontSize:14,letterSpacing:2.5,color:"#666666",marginBottom:6 }}>{s.label.toUpperCase()}</div>
                <div style={{ fontSize:15,color:s.color,fontWeight:300 }}>{s.value}</div>
              </div>
            ))}
          </div>
          {/* ── 12. Ev Kartı ── */}
          {ev12Burcu && ev12Gezegen && EV12_BURCU_ACIKLAMA[ev12Burcu] ? (
            <div style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0.12))",border:"1px solid rgba(255,255,255,0.35)",borderRadius:17,padding:"20px 20px",marginBottom:24,position:"relative",overflow:"hidden" }}>
              <div style={{ position:"absolute",top:-20,right:-20,width:100,height:100,borderRadius:"50%",background:"radial-gradient(circle,rgba(120,80,220,0.15),transparent)",pointerEvents:"none" }} />
              <div style={{ fontSize:13,letterSpacing:3.5,color:"#9070c0",marginBottom:6,textAlign:"center" }}>
                {lang==="tr" ? "12. EV · GİZLİ BENLİK" : "12TH HOUSE · HIDDEN SELF"}
              </div>
              <div style={{ fontFamily:"'Inter',sans-serif",fontSize:15,fontWeight:300,textAlign:"center",color:"#d8c0f0",marginBottom:14,lineHeight:1.6 }}>
                {lang==="tr"
                  ? "Doğum saatine göre bu senin gizli benlik evin."
                  : "Based on your birth time, this is your hidden self house."}
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:14 }}>
                <div style={{ width:44,height:44,borderRadius:"50%",flexShrink:0,background:"radial-gradient(circle,rgba(120,80,220,0.5),rgba(60,30,120,0.2))",border:"1px solid rgba(255,255,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>
                  ♆
                </div>
                <div>
                  <div style={{ fontSize:13,letterSpacing:0.5,color:"#c8b0e8",marginBottom:2 }}>{ev12Burcu} {lang==="tr" ? "Burcu" : "Sign"}</div>
                  <div style={{ fontSize:13,color:"#7060a0",letterSpacing:1 }}>{lang==="tr" ? "Yönetici:" : "Ruler:"} {ev12Gezegen}</div>
                </div>
              </div>
              <div style={{ fontSize:13,letterSpacing:2,color:"#8060b0",marginBottom:8,fontStyle:"italic" }}>
                {EV12_BURCU_ACIKLAMA[ev12Burcu].tema}
              </div>
              <div style={{ fontSize:14,color:"#b0a0d0",lineHeight:1.85 }}>
                {EV12_BURCU_ACIKLAMA[ev12Burcu].yorum}
              </div>
              <div style={{ marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.15)" }}>
                <div style={{ fontSize:13,letterSpacing:2,color:"#7060a0",marginBottom:4 }}>{lang==="tr" ? "GİZLİ GÜCÜN" : "HIDDEN POWER"}</div>
                <div style={{ fontSize:14,color:"#c0b0e0",fontStyle:"italic" }}>{GEZEGEN_12EV_GUCLERI[ev12Gezegen]}</div>
              </div>
            </div>
          ) : (birthDate && !birthTime) || !birthDate ? (
            <div style={{ background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:17,padding:"14px 18px",marginBottom:24,textAlign:"center" }}>
              <div style={{ fontSize:13,color:"#7060a0",lineHeight:1.7,marginBottom:10 }}>
                {lang==="tr"
                  ? (birthDate ? "12. Ev analizin için doğum saatini ekle" : "Kişisel haritanı oluşturmak için doğum bilgini ekle")
                  : (birthDate ? "Add your birth time for 12th house analysis" : "Add your birth info to create your personal chart")}
              </div>
              <button onClick={()=>{ setGirisPhase("birth"); setScreen("giris"); }}
                style={{ padding:"8px 20px",borderRadius:20,border:"1px solid rgba(112,96,160,0.4)",background:"rgba(112,96,160,0.15)",color:"#b8a4d8",fontSize:13,letterSpacing:1.5,cursor:"pointer",fontFamily:"'Jost',sans-serif" }}>
                {lang==="tr" ? "Doğum Bilgisi Ekle" : "Add Birth Info"}
              </button>
            </div>
          ) : null}
          {/* ── Draconic Harita Kartı (ruh kökeni) ── */}
          {birthDate && draconicGunes ? (
            <div style={{ background:"linear-gradient(135deg,rgba(40,20,80,0.45),rgba(20,40,80,0.30))",border:"1px solid rgba(140,120,220,0.35)",borderRadius:17,padding:"20px 20px",marginBottom:24,position:"relative",overflow:"hidden" }}>
              <div style={{ position:"absolute",top:-30,left:-30,width:140,height:140,borderRadius:"50%",background:"radial-gradient(circle,rgba(100,140,220,0.18),transparent)",pointerEvents:"none" }} />
              <div style={{ position:"absolute",bottom:-30,right:-30,width:140,height:140,borderRadius:"50%",background:"radial-gradient(circle,rgba(180,120,220,0.14),transparent)",pointerEvents:"none" }} />
              <div style={{ fontSize:13,letterSpacing:3.5,color:"#a890e0",marginBottom:6,textAlign:"center" }}>
                {lang==="tr" ? "DRACONİK HARİTA · RUHUN KÖKENİ" : "DRACONIC CHART · SOUL ORIGIN"}
              </div>
              <div style={{ fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:300,textAlign:"center",color:"#b8a8d8",marginBottom:16,lineHeight:1.65,fontStyle:"italic" }}>
                {lang==="tr"
                  ? "Natal harita kim olduğunu söyler. Draconik harita ruhunun bu bedene girmeden önce ne olduğunu söyler."
                  : "Your natal chart tells who you are. The Draconic chart tells what your soul was before entering this body."}
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:14,padding:"10px 12px",background:"rgba(255,255,255,0.04)",borderRadius:12,border:"1px solid rgba(140,120,220,0.18)" }}>
                <div style={{ width:44,height:44,borderRadius:"50%",flexShrink:0,background:"radial-gradient(circle,rgba(180,140,240,0.55),rgba(80,40,140,0.25))",border:"1px solid rgba(220,200,255,0.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>
                  ☉
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13,letterSpacing:0.5,color:"#d0c0f0",marginBottom:2 }}>
                    {lang==="tr" ? "Draconik Güneşin:" : "Your Draconic Sun:"} <strong style={{ color:"#e8d8ff" }}>{draconicGunes}</strong>
                  </div>
                  <div style={{ fontSize:12,color:"#8878b8",letterSpacing:0.5 }}>
                    {lang==="tr" ? `Kuzey Düğüm yaklaşık: ${kuzeyDugum}` : `North Node approx: ${kuzeyDugum}`}
                  </div>
                </div>
              </div>
              <div style={{ fontSize:14,color:"#c8b8e8",lineHeight:1.85,marginBottom:14 }}>
                {lang==="tr" ? DRACONIC_SUN_KISA[draconicGunes] : DRACONIC_SUN_KISA_EN[draconicGunes]}
              </div>
              {isPremium ? (
                <div style={{ paddingTop:14,borderTop:"1px solid rgba(140,120,220,0.25)" }}>
                  <div style={{ fontSize:11,letterSpacing:2.5,color:"#9080c8",marginBottom:8 }}>
                    {lang==="tr" ? "DETAYLI RUHSAL OKUMA" : "DETAILED SOUL READING"}
                  </div>
                  <div style={{ fontSize:13.5,color:"#b8a8d8",lineHeight:1.9 }}>
                    {DRACONIC_SUN_DETAY[draconicGunes]}
                  </div>
                </div>
              ) : (
                <div style={{ paddingTop:14,borderTop:"1px solid rgba(140,120,220,0.25)",textAlign:"center" }}>
                  <div style={{ fontSize:12,color:"#8878b8",lineHeight:1.7,marginBottom:10,fontStyle:"italic" }}>
                    {lang==="tr"
                      ? "Draconik Güneşinin ruh misyonu, gölgesi ve şifa yolunu içeren detaylı okuma Premium'da."
                      : "The detailed reading of your Draconic Sun's soul mission, shadow and healing path is in Premium."}
                  </div>
                  <button onClick={()=>setScreen("fiyat")}
                    style={{ padding:"9px 22px",borderRadius:22,border:"1px solid rgba(184,164,216,0.4)",background:"linear-gradient(135deg,rgba(140,120,220,0.25),rgba(100,80,180,0.15))",color:"#d8c8f8",fontSize:13,letterSpacing:1.5,cursor:"pointer",fontFamily:"'Jost',sans-serif" }}>
                    {lang==="tr" ? "Detaylı Yorum · Premium" : "Detailed Reading · Premium"}
                  </button>
                </div>
              )}
              <div style={{ marginTop:14,paddingTop:10,borderTop:"1px solid rgba(140,120,220,0.15)",fontSize:10,letterSpacing:1.5,color:"#605080",textAlign:"center",fontStyle:"italic" }}>
                {lang==="tr"
                  ? "Pamela Crane & Ronald Davison sistemi (1970'ler) · yaklaşık hesap"
                  : "Pamela Crane & Ronald Davison system (1970s) · approximation"}
              </div>
            </div>
          ) : null}
          {birthDate && (
            <div style={{ textAlign:"center",marginBottom:16 }}>
              <button onClick={()=>{ setGirisPhase("birth"); setScreen("giris"); }}
                style={{ background:"none",border:"none",color:"#666",fontSize:12,letterSpacing:1.5,cursor:"pointer",fontFamily:"'Jost',sans-serif",textDecoration:"underline",textUnderlineOffset:3 }}>
                {lang==="tr" ? "Doğum bilgilerini değiştir" : "Change birth info"}
              </button>
            </div>
          )}
          <div style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.09),rgba(255,255,255,0.05))",border:"1px solid rgba(255,255,255,0.16)",borderRadius:17,padding:"16px 20px",marginBottom:24,textAlign:"center",position:"relative",opacity:0.65 }}>
            <div style={{ position:"absolute",top:10,right:12,fontSize:10,letterSpacing:2,padding:"3px 9px",borderRadius:10,background:"rgba(184,164,216,0.15)",border:"1px solid rgba(184,164,216,0.35)",color:"#c8b0e8" }}>{lang==="tr" ? "YAKINDA" : "COMING SOON"}</div>
            <div style={{ fontSize:13,letterSpacing:3.5,color:"#888888",marginBottom:7 }}>{t("orchestra_label")}</div>
            <div style={{ marginBottom:5 }}>
              {[...Array(7)].map((_,i)=>(
                <span key={i} style={{ display:"inline-block",width:8,height:8,borderRadius:"50%",background:`radial-gradient(circle,${CHAKRAS_7[i].pastel},transparent)`,margin:"0 3px",animation:`pulse ${1+i*0.2}s ease-in-out infinite`,animationDelay:`${i*0.14}s` }} />
              ))}
            </div>
            <div style={{ fontSize:14,color:"#888888" }}>{t("orchestra_text", "312")}</div>
          </div>
          {!isNative && (
          <div style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.07))",border:"1px solid rgba(255,255,255,0.22)",borderRadius:17,padding:"18px 20px",marginBottom:24 }}>
            <div style={{ fontSize:13,letterSpacing:3.5,color:"#9a6ab0",marginBottom:12,textAlign:"center" }}>{t("ai_report_label")}</div>
            {raporKullanildi && !isPremium && !aiRapor && !aiLoading ? (
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:23,marginBottom:10 }}>✨</div>
                <div style={{ fontSize:14,color:"#c8a0e0",fontWeight:300,marginBottom:8 }}>{t("free_used")}</div>
                <div style={{ fontSize:14,color:"#888888",lineHeight:1.8,marginBottom:16 }}>
                  {t("free_used_body")}<br/>
                  <strong style={{ color:"#9a7ab8" }}>{t("premium_name")}</strong>{t("premium_suffix")}
                </div>
                <button onClick={() => setScreen("fiyat")}
                  style={{ display:"inline-block",padding:"9px 22px",background:"linear-gradient(135deg,rgba(255,255,255,0.7),rgba(255,255,255,0.5))",border:"1px solid rgba(255,255,255,0.4)",borderRadius:22,color:"#cccccc",fontSize:14,letterSpacing:1,cursor:"pointer" }}>
                  {t("btn_go_premium")}
                </button>
              </div>
            ) : !aiRapor && !aiLoading ? (
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:14,color:"#888888",marginBottom:14,lineHeight:1.7 }}>{t("report_invite").split("\n").map((l,i)=><span key={i}>{l}{i===0&&<br/>}</span>)}</div>
                <button className="sakin-btn-primary"
                  style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.7),rgba(255,255,255,0.5))",borderColor:"rgba(255,255,255,0.4)",fontSize:14 }}
                  onClick={()=>requireAiConsent(generateRapor)}>{t("btn_gen_report")}</button>
              </div>
            ) : aiLoading ? (
              <div style={{ textAlign:"center",padding:"12px 0" }}>
                <div style={{ fontSize:13,letterSpacing:3,color:"#888888",animation:"pulse 1.5s ease-in-out infinite" }}>{t("generating")}</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize:13.5,color:"#c8bedd",lineHeight:1.9,whiteSpace:"pre-wrap" }}><FreqText text={aiRapor} /></div>
                <div style={{ display:"flex",gap:8,marginTop:14,flexWrap:"wrap" }}>
                  <button onClick={()=>{ navigator.clipboard.writeText(aiRapor).then(()=>{ setRaporKopyalandi(true); setTimeout(()=>setRaporKopyalandi(false),2000); }); }}
                    style={{ background:raporKopyalandi?"rgba(80,180,120,0.2)":"rgba(255,255,255,0.05)",border:`1px solid ${raporKopyalandi?"rgba(80,180,120,0.4)":"rgba(255,255,255,0.1)"}`,borderRadius:20,padding:"7px 16px",cursor:"pointer",color:raporKopyalandi?"#80e0a0":"#8a9ab0",fontSize:13,letterSpacing:2 }}>
                    {raporKopyalandi ? t("copied_label") : t("copy_label")}
                  </button>
                  {navigator.share && (
                    <button onClick={()=>navigator.share({ title:t("share_title"), text:aiRapor })}
                      style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,padding:"7px 16px",cursor:"pointer",color:"#8a9ab0",fontSize:13,letterSpacing:2 }}>
                      {t("share_label")}
                    </button>
                  )}
                  <button onClick={()=>setAiRapor("")}
                    style={{ background:"none",border:"none",color:"#666666",cursor:"pointer",fontSize:13,letterSpacing:2,marginLeft:"auto" }}>
                    {t("refresh_label")}
                  </button>
                </div>
              </div>
            )}
          </div>
          )}
          <button onClick={()=>setShowIdCard(true)}
            style={{ width:"100%",marginBottom:12,padding:"13px 16px",borderRadius:24,border:"1px solid rgba(184,164,216,0.4)",background:"linear-gradient(135deg,rgba(184,164,216,0.18),rgba(122,80,150,0.10))",color:"#d8c8f0",fontSize:13,letterSpacing:2.5,cursor:"pointer",fontFamily:"'Jost',sans-serif",textTransform:"uppercase",boxShadow:"0 0 18px rgba(184,164,216,0.12)" }}>
            ✦ {lang==="tr" ? "Galaktik Kimlik Oluştur" : "Create Galactic ID"}
          </button>
          <button className="sakin-btn" style={{ width:"100%" }} onClick={()=>{ markStep("harita"); setScreen("mandala"); }}>{t("btn_new_day")}</button>
        </div>
      )}

      {/* GALAKTİK KİMLİK KARTI */}
      {showIdCard && (() => {
        // Read embed apps' usage from same-origin localStorage (no medical claims, just factual counts)
        const animalCount = (() => { try { const a = JSON.parse(localStorage.getItem("@tura_archive") || "[]"); return Array.isArray(a) ? a.length : 0; } catch { return 0; } })();
        const mythCount = (() => { try { const a = JSON.parse(localStorage.getItem("@mitler_archive") || "[]"); return Array.isArray(a) ? a.length : 0; } catch { return 0; } })();
        const hdProfile = (() => { try { const a = JSON.parse(localStorage.getItem("@tasarim_profiles") || "[]"); return Array.isArray(a) && a.length ? a[0] : null; } catch { return null; } })();
        const displayName = (idCardName || "Yolcu").slice(0, 24);
        const burc = astro?.burc || "—";
        const yasamYolu = astro?.yasam || "—";
        const kisiselYil = astro?.kisiselYil || "—";
        const yuk = yukselen || "—";
        const ev12 = ev12Burcu || "—";
        const dra = draconicGunes || "—";
        const days = streakData?.current ?? 0;
        const best = streakData?.best ?? 0;

        const downloadCard = async () => {
          const svgEl = document.getElementById("galaktik-id-card-svg");
          if (!svgEl) return;
          const svgStr = new XMLSerializer().serializeToString(svgEl);
          const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
          const url = URL.createObjectURL(svgBlob);
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 1080; canvas.height = 1920;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "#000"; ctx.fillRect(0,0,1080,1920);
            ctx.drawImage(img, 0, 0, 1080, 1920);
            canvas.toBlob(async (blob) => {
              if (!blob) return;
              const file = new File([blob], "sakin-galaktik-kimlik.png", { type: "image/png" });
              try {
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                  await navigator.share({ files: [file], title: "Galaktik Kimlik · Sakin Life" });
                } else {
                  const dl = URL.createObjectURL(blob);
                  const a = document.createElement("a"); a.href = dl; a.download = "sakin-galaktik-kimlik.png"; a.click();
                  setTimeout(()=>URL.revokeObjectURL(dl), 1000);
                }
              } catch(_) {}
              URL.revokeObjectURL(url);
            }, "image/png");
          };
          img.src = url;
        };

        const StatRow = ({label, value, color}) => (
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 12px",background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,marginBottom:5 }}>
            <span style={{ fontSize:10,letterSpacing:2,color:"#7a7090",textTransform:"uppercase",fontFamily:"'Jost',sans-serif" }}>{label}</span>
            <span style={{ fontSize:12,color: color||"#d0c8e8",fontWeight:500,letterSpacing:0.5 }}>{value}</span>
          </div>
        );

        return (
          <div onClick={()=>setShowIdCard(false)} style={{ position:"fixed",inset:0,zIndex:10000,background:"rgba(0,0,0,0.92)",backdropFilter:"blur(20px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"calc(20px + var(--sat)) 16px calc(20px + var(--sab))",overflow:"auto" }}>
            <div onClick={e=>e.stopPropagation()} style={{ maxWidth:380,width:"100%",margin:"auto",position:"relative" }}>
              {/* Card preview */}
              <div style={{ background:"linear-gradient(160deg,#0a0612 0%,#1a1230 50%,#0a0612 100%)",border:"1px solid rgba(184,164,216,0.35)",borderRadius:22,padding:"22px 18px",boxShadow:"0 8px 40px rgba(122,80,150,0.25)",position:"relative",overflow:"hidden" }}>
                {/* Stars */}
                {[[18,26,1],[88,42,0.8],[42,18,0.6],[160,80,0.7],[300,50,0.9],[330,180,0.8],[60,200,0.5],[280,260,0.7],[40,300,0.6]].map(([x,y,o],i)=>(
                  <div key={i} style={{ position:"absolute",left:x,top:y,width:2,height:2,borderRadius:"50%",background:`rgba(255,255,255,${o})`,boxShadow:`0 0 4px rgba(255,255,255,${o*0.5})` }}/>
                ))}
                <div style={{ textAlign:"center",position:"relative" }}>
                  <div style={{ fontSize:9,letterSpacing:4.5,color:"#9080c0",fontFamily:"'Jost',sans-serif",marginBottom:4,textTransform:"uppercase" }}>✦ Sakin Life · Galaktik Kimlik ✦</div>
                  <div style={{ width:88,height:88,borderRadius:"50%",margin:"10px auto 12px",background: idCardPhoto ? `url(${idCardPhoto}) center/cover` : "radial-gradient(circle,rgba(180,140,240,0.55),rgba(80,40,140,0.25))",border:"2px solid rgba(220,200,255,0.45)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,color:"#fff",boxShadow:"0 0 22px rgba(184,164,216,0.35)" }}>
                    {!idCardPhoto && "✦"}
                  </div>
                  <input type="text" value={idCardName} onChange={e=>setIdCardName(e.target.value)} placeholder={lang==="tr"?"Adın":"Your Name"} maxLength={24}
                    style={{ width:180,textAlign:"center",background:"transparent",border:"none",borderBottom:"1px solid rgba(255,255,255,0.15)",color:"#fff",fontSize:18,fontFamily:"'Jost',sans-serif",letterSpacing:2,marginBottom:6,padding:"3px 0",outline:"none" }}/>
                  <div style={{ fontSize:10,letterSpacing:3,color:"#a890c8",marginBottom:14,textTransform:"uppercase" }}>{burc !== "—" ? burc : "—"} · {yasamYolu !== "—" ? `Yaşam Yolu ${yasamYolu}` : "—"}</div>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:8 }}>
                  <StatRow label={lang==="tr"?"Burç":"Sun"} value={burc} color="#f0c860"/>
                  <StatRow label={lang==="tr"?"Yükselen":"Asc"} value={yuk} color="#a0d8b4"/>
                  <StatRow label={lang==="tr"?"12. Ev":"12th"} value={ev12} color="#c8b0e8"/>
                  <StatRow label={lang==="tr"?"Draconik":"Draconic"} value={dra} color="#d8c8f0"/>
                  <StatRow label={lang==="tr"?"Yaşam Yolu":"Life Path"} value={yasamYolu}/>
                  <StatRow label={lang==="tr"?"Kişisel Yıl":"Personal Yr"} value={kisiselYil}/>
                </div>
                {hdProfile && (hdProfile.type || hdProfile.profile) && (
                  <div style={{ padding:"8px 12px",background:"rgba(180,160,216,0.08)",border:"1px solid rgba(180,160,216,0.18)",borderRadius:10,marginBottom:8,textAlign:"center" }}>
                    <div style={{ fontSize:9,letterSpacing:2.5,color:"#9080b8",textTransform:"uppercase",marginBottom:3 }}>Human Design</div>
                    <div style={{ fontSize:12,color:"#d0c8e8",letterSpacing:0.5 }}>{hdProfile.type || ""}{hdProfile.profile ? ` · ${hdProfile.profile}` : ""}</div>
                  </div>
                )}
                <div style={{ display:"flex",justifyContent:"space-around",padding:"10px 6px",background:"rgba(255,255,255,0.025)",borderRadius:10,marginBottom:10 }}>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:18,color:"#f0a040",fontWeight:300,lineHeight:1 }}>{days}</div>
                    <div style={{ fontSize:8,letterSpacing:2,color:"#7a7090",textTransform:"uppercase",marginTop:3 }}>{lang==="tr"?"Gün serisi":"Streak"}</div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:18,color:"#82d9a3",fontWeight:300,lineHeight:1 }}>{best}</div>
                    <div style={{ fontSize:8,letterSpacing:2,color:"#7a7090",textTransform:"uppercase",marginTop:3 }}>{lang==="tr"?"En iyi":"Best"}</div>
                  </div>
                  {animalCount > 0 && (
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:18,color:"#a0d8b4",fontWeight:300,lineHeight:1 }}>{animalCount}</div>
                      <div style={{ fontSize:8,letterSpacing:2,color:"#7a7090",textTransform:"uppercase",marginTop:3 }}>{lang==="tr"?"Hayvan":"Animal"}</div>
                    </div>
                  )}
                  {mythCount > 0 && (
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:18,color:"#d8b4a0",fontWeight:300,lineHeight:1 }}>{mythCount}</div>
                      <div style={{ fontSize:8,letterSpacing:2,color:"#7a7090",textTransform:"uppercase",marginTop:3 }}>{lang==="tr"?"Mit":"Myth"}</div>
                    </div>
                  )}
                </div>
                <div style={{ textAlign:"center",fontSize:9,letterSpacing:3,color:"#605080",fontFamily:"'Jost',sans-serif",textTransform:"uppercase" }}>sakin.life</div>
              </div>
              {/* Actions */}
              <div style={{ display:"flex",flexDirection:"column",gap:8,marginTop:14 }}>
                <label style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"10px 16px",borderRadius:22,border:"1px solid rgba(184,164,216,0.3)",background:"rgba(184,164,216,0.08)",color:"#b8a4d8",fontSize:12,letterSpacing:2,cursor:"pointer",fontFamily:"'Jost',sans-serif",textTransform:"uppercase" }}>
                  📷 {lang==="tr"?"Fotoğraf Yükle":"Upload Photo"}
                  <input type="file" accept="image/*" style={{ display:"none" }}
                    onChange={e=>{ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>setIdCardPhoto(ev.target.result); r.readAsDataURL(f); }}/>
                </label>
                <button onClick={downloadCard}
                  style={{ padding:"12px 16px",borderRadius:22,border:"1px solid rgba(184,164,216,0.5)",background:"linear-gradient(135deg,rgba(184,164,216,0.7),rgba(122,80,150,0.55))",color:"#fff",fontSize:13,letterSpacing:2,cursor:"pointer",fontFamily:"'Jost',sans-serif",textTransform:"uppercase",boxShadow:"0 4px 18px rgba(122,80,150,0.3)" }}>
                  ↓ {lang==="tr"?"İndir / Paylaş":"Download / Share"}
                </button>
                <button onClick={()=>setShowIdCard(false)}
                  style={{ padding:"9px 16px",borderRadius:22,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#888",fontSize:12,letterSpacing:2,cursor:"pointer",fontFamily:"'Jost',sans-serif",textTransform:"uppercase" }}>
                  {lang==="tr"?"Kapat":"Close"}
                </button>
              </div>
              {/* Hidden high-resolution SVG used for export */}
              <svg id="galaktik-id-card-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position:"absolute",left:-99999,top:0,pointerEvents:"none" }}>
                <defs>
                  <linearGradient id="idBg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0a0612"/>
                    <stop offset="50%" stopColor="#1a1230"/>
                    <stop offset="100%" stopColor="#0a0612"/>
                  </linearGradient>
                  <radialGradient id="idPhotoBg" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(180,140,240,0.55)"/>
                    <stop offset="100%" stopColor="rgba(80,40,140,0.25)"/>
                  </radialGradient>
                </defs>
                <rect width="1080" height="1920" fill="url(#idBg)"/>
                {[[60,80,3],[260,140,2],[140,220,1.5],[500,180,2.5],[820,140,3],[940,440,2],[180,500,1.5],[760,640,2],[120,760,1.5],[880,820,2.5],[420,900,1.5],[640,990,1.8],[280,1080,1.5],[820,1140,2],[160,1240,1.5],[560,1320,2],[940,1430,1.5],[120,1520,2],[700,1610,1.8],[400,1730,1.5]].map(([x,y,r],i)=>(
                  <circle key={i} cx={x} cy={y} r={r} fill="rgba(255,255,255,0.8)"/>
                ))}
                <text x="540" y="180" textAnchor="middle" fontFamily="'Jost',sans-serif" fontSize="34" letterSpacing="14" fill="#9080c0">✦ SAKIN LIFE · GALAKTIK KIMLIK ✦</text>
                {idCardPhoto ? (
                  <>
                    <defs>
                      <clipPath id="photoClip"><circle cx="540" cy="380" r="160"/></clipPath>
                    </defs>
                    <image href={idCardPhoto} x="380" y="220" width="320" height="320" clipPath="url(#photoClip)" preserveAspectRatio="xMidYMid slice"/>
                    <circle cx="540" cy="380" r="160" fill="none" stroke="rgba(220,200,255,0.5)" strokeWidth="4"/>
                  </>
                ) : (
                  <>
                    <circle cx="540" cy="380" r="160" fill="url(#idPhotoBg)" stroke="rgba(220,200,255,0.5)" strokeWidth="4"/>
                    <text x="540" y="410" textAnchor="middle" fontSize="120" fill="#fff">✦</text>
                  </>
                )}
                <text x="540" y="640" textAnchor="middle" fontFamily="'Jost',sans-serif" fontSize="64" fontWeight="300" letterSpacing="8" fill="#fff">{displayName.toUpperCase()}</text>
                <text x="540" y="700" textAnchor="middle" fontFamily="'Jost',sans-serif" fontSize="28" letterSpacing="6" fill="#a890c8">{burc !== "—" ? burc.toUpperCase() : ""} {yasamYolu !== "—" ? `· YAŞAM YOLU ${yasamYolu}` : ""}</text>
                {/* Stats grid */}
                {[
                  [lang==="tr"?"BURÇ":"SUN", burc, "#f0c860", 100, 820],
                  [lang==="tr"?"YÜKSELEN":"ASC", yuk, "#a0d8b4", 560, 820],
                  [lang==="tr"?"12. EV":"12TH", ev12, "#c8b0e8", 100, 940],
                  ["DRACONİK", dra, "#d8c8f0", 560, 940],
                  [lang==="tr"?"YAŞAM YOLU":"LIFE PATH", String(yasamYolu), "#d0c8e8", 100, 1060],
                  [lang==="tr"?"KIŞISEL YIL":"PERSONAL YR", String(kisiselYil), "#d0c8e8", 560, 1060],
                ].map(([label, val, color, x, y], i) => (
                  <g key={i}>
                    <rect x={x} y={y} width="420" height="92" rx="14" fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.06)"/>
                    <text x={x+22} y={y+34} fontFamily="'Jost',sans-serif" fontSize="22" letterSpacing="4" fill="#7a7090">{label}</text>
                    <text x={x+22} y={y+72} fontFamily="'Jost',sans-serif" fontSize="36" fill={color} fontWeight="500">{val}</text>
                  </g>
                ))}
                {/* Streak stats */}
                <rect x="100" y="1200" width="880" height="160" rx="14" fill="rgba(255,255,255,0.025)"/>
                <g>
                  <text x="280" y="1270" textAnchor="middle" fontFamily="'Jost',sans-serif" fontSize="64" fontWeight="300" fill="#f0a040">{days}</text>
                  <text x="280" y="1320" textAnchor="middle" fontFamily="'Jost',sans-serif" fontSize="20" letterSpacing="4" fill="#7a7090">{lang==="tr"?"GÜN SERISI":"STREAK"}</text>
                </g>
                <g>
                  <text x="540" y="1270" textAnchor="middle" fontFamily="'Jost',sans-serif" fontSize="64" fontWeight="300" fill="#82d9a3">{best}</text>
                  <text x="540" y="1320" textAnchor="middle" fontFamily="'Jost',sans-serif" fontSize="20" letterSpacing="4" fill="#7a7090">{lang==="tr"?"EN IYI":"BEST"}</text>
                </g>
                <g>
                  <text x="800" y="1270" textAnchor="middle" fontFamily="'Jost',sans-serif" fontSize="64" fontWeight="300" fill="#a0d8b4">{animalCount + mythCount}</text>
                  <text x="800" y="1320" textAnchor="middle" fontFamily="'Jost',sans-serif" fontSize="20" letterSpacing="4" fill="#7a7090">{lang==="tr"?"KART":"CARDS"}</text>
                </g>
                {hdProfile && hdProfile.type && (
                  <g>
                    <rect x="100" y="1410" width="880" height="100" rx="14" fill="rgba(180,160,216,0.08)" stroke="rgba(180,160,216,0.18)"/>
                    <text x="540" y="1450" textAnchor="middle" fontFamily="'Jost',sans-serif" fontSize="20" letterSpacing="5" fill="#9080b8">HUMAN DESIGN</text>
                    <text x="540" y="1490" textAnchor="middle" fontFamily="'Jost',sans-serif" fontSize="32" fill="#d0c8e8">{hdProfile.type}{hdProfile.profile ? ` · ${hdProfile.profile}` : ""}</text>
                  </g>
                )}
                <text x="540" y="1820" textAnchor="middle" fontFamily="'Jost',sans-serif" fontSize="30" letterSpacing="14" fill="#605080">SAKIN.LIFE</text>
              </svg>
            </div>
          </div>
        );
      })()}

      {/* SAKİN NEDİR? */}
      {screen==="hakkinda" && (
        <div className="policy-screen">

          {/* ── SEKMELER ── */}
          <div style={{ display:"flex",gap:8,marginBottom:32,justifyContent:"center" }}>
            {[
              {id:"yolculuk", label:lang==="tr"?"Yolculuk":"Journey"},
              {id:"nedir", label:lang==="tr"?"Sakin Nedir?":"What is Sakin?"},
            ].map(tab=>(
              <button key={tab.id} onClick={()=>setHakkindaTab(tab.id)}
                style={{ padding:"8px 20px",borderRadius:20,border:`1px solid ${hakkindaTab===tab.id?"rgba(184,164,216,0.5)":"rgba(255,255,255,0.1)"}`,background:hakkindaTab===tab.id?"rgba(184,164,216,0.15)":"transparent",color:hakkindaTab===tab.id?"#b8a4d8":"#888",fontSize:13,letterSpacing:1.5,cursor:"pointer",fontFamily:"'Jost',sans-serif",transition:"all 0.2s" }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── YOL HARİTASI ── */}
          {hakkindaTab==="yolculuk" && (
          <div style={{ marginBottom:48 }}>
            <div style={{ textAlign:"center",marginBottom:28 }}>
              <div style={{ fontSize:11,letterSpacing:5,color:"#888",textTransform:"uppercase",marginBottom:8 }}>{lang==="tr"?"YOLCULUĞUN HARİTASI":"YOUR JOURNEY MAP"}</div>
              <div style={{ fontSize:20,fontWeight:300,letterSpacing:2,color:"#d0c0f0",fontFamily:"'Jost',sans-serif" }}>{lang==="tr"?"Seni neler bekliyor?":"What awaits you?"}</div>
            </div>

            <div style={{ position:"relative",paddingLeft:32 }}>
              <div style={{ position:"absolute",left:12,top:0,bottom:0,width:2,background:"linear-gradient(to bottom,rgba(240,160,96,0.5),rgba(96,184,232,0.5),rgba(160,122,224,0.5),rgba(184,122,220,0.5),rgba(232,208,96,0.5),rgba(122,176,224,0.5),rgba(130,217,163,0.5))",borderRadius:2 }} />

              {[
                { icon:"🌅", color:"#f0a060", title:lang==="tr"?"Sabah Niyeti":"Morning Intention", desc:lang==="tr"?"Güne bir niyetle başla. Seni en çok ifade eden 3 kelimeyi seç — gün boyunca pusulan olsunlar.":"Start your day with an intention. Choose 3 words that express you — let them be your compass." },
                { icon:"🫧", color:"#60b8e8", title:lang==="tr"?"Nefes Egzersizi":"Breathwork", desc:lang==="tr"?"6 farklı modla bedenine dön. Standart, diyafram, akciğer, 4-7-8, kutu, sakinleştirici — hangisi sana iyi geliyorsa.":"Return to your body with 6 modes. Standard, diaphragm, lung, 4-7-8, box, calming — whichever feels right." },
                { icon:"🔊", color:"#a07ae0", title:lang==="tr"?"Ses Dalgaları":"Sound Waves", desc:lang==="tr"?"10 solfeggio frekansını kuş sesleri eşliğinde dinle. Her frekansın kendine ait bir doğa sesi var.":"Listen to 10 solfeggio frequencies with birdsong. Each frequency has its own nature sound." },
                { icon:"💜", color:"#b87adc", title:lang==="tr"?"22 Çakra Yükselişi":"22 Chakra Rise", desc:lang==="tr"?"60 saniyede enerji merkezlerinle bağlantı kur. Elini bölgende hisset, gözlerini kapat, enerjin aksın.":"Connect with your energy centers in 60 seconds. Feel your hand, close your eyes, let energy flow." },
                { icon:"☀️", color:"#e8d060", title:lang==="tr"?"Gün İçi Görevler":"Daily Tasks", desc:lang==="tr"?"Aynaya bak. Su iç. Güneşi hisset. Toprağa dokun. Bunlar görev değil — seni ana bağlayan dokunuşlar.":"Look in the mirror. Drink water. Feel the sun. Touch the earth. Not tasks — touches that ground you." },
                { icon:"🌙", color:"#7ab0e0", title:lang==="tr"?"Akşam Kapanışı":"Evening Closure", desc:lang==="tr"?"Bugün ne öğrendin? Neye şükrediyorsun? Birkaç cümle yeter. Gün kapanır, sen bütün hissedersin.":"What did you learn today? What are you grateful for? A few sentences are enough." },
                { icon:"✦", color:"#82d9a3", title:lang==="tr"?"Haftalık Rapor":"Weekly Report", desc:lang==="tr"?"AI destekli kişisel raporun: çakra örüntüleri, frekans süren, kozmik enerji — derin bir iç ayna.":"Your AI-powered personal report: chakra patterns, frequency time, cosmic energy — a deep inner mirror." },
              ].map((step,i) => (
                <div key={i} style={{ position:"relative",marginBottom:i<6?24:0,paddingBottom:i<6?4:0 }}>
                  <div style={{ position:"absolute",left:-27,top:2,width:26,height:26,borderRadius:"50%",background:`radial-gradient(circle,${step.color}44,${step.color}11)`,border:`1.5px solid ${step.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13 }}>{step.icon}</div>
                  <div style={{ fontSize:14,fontWeight:500,color:step.color,letterSpacing:1,marginBottom:4,fontFamily:"'Jost',sans-serif" }}>{step.title}</div>
                  <div style={{ fontSize:13,color:"#999",lineHeight:1.8 }}>{step.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ textAlign:"center",marginTop:28,padding:"14px 20px",background:"rgba(184,164,216,0.06)",border:"1px solid rgba(184,164,216,0.12)",borderRadius:14 }}>
              <div style={{ fontSize:13,color:"#b8a4d8",fontStyle:"italic",lineHeight:1.8 }}>
                {lang==="tr"
                  ? "Her adım bir pratik, her pratik bir iz, her iz senin haritanın bir parçası olur."
                  : "Every step a practice, every practice a trace, every trace a part of your map."}
              </div>
            </div>
          </div>
          )}

          {/* ── SAKİN NEDİR? ── */}
          {hakkindaTab==="nedir" && (
          <>
          {/* Başlık — Bağlantı metaforu */}
          <div style={{ textAlign:"center",marginBottom:36 }}>
            <div style={{ fontSize:11,letterSpacing:5,color:"#888",textTransform:"uppercase",fontFamily:"'Jost',sans-serif",marginBottom:10 }}>{lang==="tr"?"Kullan ve":"Use and"}</div>
            <h1 style={{ margin:0,fontSize:22,fontWeight:300,letterSpacing:3,color:"#d0c0f0",fontFamily:"'Jost',sans-serif" }}>{lang==="tr"?"Kendinle Bağlantı Kur":"Connect with Yourself"}</h1>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:4,marginTop:16 }}>
              {["#c084fc","#818cf8","#38bdf8","#34d399","#fbbf24","#fb923c","#f472b6"].map((c,i)=>(
                <span key={i} style={{ display:"flex",alignItems:"center",gap:4 }}>
                  <span style={{ width:10,height:10,borderRadius:"50%",background:c,display:"inline-block" }} />
                  {i<6 && <span style={{ width:16,height:1.5,background:`linear-gradient(90deg,${c},${["#818cf8","#38bdf8","#34d399","#fbbf24","#fb923c","#f472b6"][i]})`,display:"inline-block" }} />}
                </span>
              ))}
            </div>
          </div>

          {/* Tanıdık mı? */}
          <div style={{ marginBottom:28 }}>
            <div style={{ textAlign:"center",fontSize:18,marginBottom:16,color:"#999",fontFamily:"'Jost',sans-serif",letterSpacing:1 }}>{lang==="tr"?"Tanıdık mı?":"Sound familiar?"}</div>
            {[
              { emoji:"😵‍💫", text:lang==="tr"?"Sabah gözünü açtığında ilk refleksin telefona uzanmak":"Your first reflex in the morning is reaching for your phone", label:lang==="tr"?"kendinle — kesildi":"with yourself — disconnected", color:"#f472b6" },
              { emoji:"🧠", text:lang==="tr"?"Zihnin durmadan konuşuyor, sen dinliyorsun bile değil":"Your mind won't stop talking, you're not even listening", label:lang==="tr"?"bedeninle — kesildi":"with your body — disconnected", color:"#fb923c" },
              { emoji:"🌀", text:lang==="tr"?"\"Bir şeyler eksik\" hissi ama ne olduğunu bilmiyorsun":"\"Something's missing\" but you can't name it", label:lang==="tr"?"ruhunla — kesildi":"with your soul — disconnected", color:"#c084fc" },
              { emoji:"📱", text:lang==="tr"?"20 uygulama indirdin, hiçbirini 3 günden fazla kullanmadın":"Downloaded 20 apps, didn't use any past 3 days", label:lang==="tr"?"niyetinle — kesildi":"with your intention — disconnected", color:"#38bdf8" },
            ].map((item,i)=>(
              <div key={i} style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"14px 16px",marginBottom:10 }}>
                <div style={{ fontSize:14,color:"#ccc" }}>{item.emoji} {item.text}</div>
                <div style={{ fontSize:11,color:item.color,marginTop:4,letterSpacing:1 }}>{lang==="tr"?"bağlantı":"connection"}: {item.label} ✕</div>
              </div>
            ))}
          </div>

          {/* Güzel haber köprüsü */}
          <div style={{ textAlign:"center",padding:"20px 24px",background:"rgba(184,164,216,0.06)",border:"1px solid rgba(184,164,216,0.12)",borderRadius:16,marginBottom:32 }}>
            <div style={{ fontSize:11,color:"#c084fc",letterSpacing:2,fontFamily:"'Jost',sans-serif",marginBottom:6 }}>{lang==="tr"?"GÜZEL HABER":"GOOD NEWS"}</div>
            <div style={{ fontSize:14,color:"#ccc",lineHeight:1.9 }}>
              {lang==="tr"
                ? "Bu bağlantıları yeniden kurmak düşündüğün kadar zor değil. Sadece bir sistem lazım. Ve biraz niyet."
                : "Reconnecting is not as hard as you think. You just need a system. And a bit of intention."}
            </div>
          </div>

          {/* Sakin nedir tanımı */}
          <div style={{ marginBottom:28 }}>
            <div style={{ fontSize:15,color:"#ccc",lineHeight:2.2,marginBottom:16 }}>
              {lang==="tr" ? (
                <>Sakin bir <span style={{ textDecoration:"line-through",color:"#666" }}>meditasyon uygulaması</span> değil.<br/>
                Sakin bir <span style={{ textDecoration:"line-through",color:"#666" }}>terapi aracı</span> değil.<br/>
                Sakin bir <span style={{ textDecoration:"line-through",color:"#666" }}>to-do listesi</span> değil.<br/><br/>
                Sakin bir <strong style={{ color:"#c084fc" }}>farkındalık sistemi</strong>.</>
              ) : (
                <>Sakin is not a <span style={{ textDecoration:"line-through",color:"#666" }}>meditation app</span>.<br/>
                Sakin is not a <span style={{ textDecoration:"line-through",color:"#666" }}>therapy tool</span>.<br/>
                Sakin is not a <span style={{ textDecoration:"line-through",color:"#666" }}>to-do list</span>.<br/><br/>
                Sakin is an <strong style={{ color:"#c084fc" }}>awareness system</strong>.</>
              )}
            </div>
          </div>

          <p style={{ fontSize:15, lineHeight:2.1, color:"#cccccc", fontStyle:"italic", marginBottom:32, borderLeft:"2px solid rgba(184,164,216,0.3)", paddingLeft:20 }}>
            {lang==="tr"
              ? "Sakin; zihnin gürültüsünü dinginleştirmek, içsel rehberliğe alan açmak ve günlük yaşamı anlam katmanlarıyla beslemek için tasarlanmış kişisel bir farkındalık sistemidir."
              : "Sakin is a personal awareness system designed to quiet the noise of the mind, open space for inner guidance, and nourish daily life with layers of meaning."}
          </p>

          <h2>{lang==="tr" ? "Sadece Yapay Zeka Değil" : "Not Just Artificial Intelligence"}</h2>
          <p>{lang==="tr"
            ? "Sakin, büyük dil modellerinin gücünü salt teknoloji olarak kullanmaz. Arkasında titizlikle seçilmiş bir kaynak veri tabanı vardır: spiritüel psikoloji, enerji tıbbı, Jungian analiz, çakra sistemi, biyoritm bilimi ve kadim bilgelik geleneklerine ait kitaplar, dergiler ve akademik çalışmalar."
            : "Sakin doesn't use large language models as mere technology. Behind it lies a carefully curated source database: books, journals and academic works on spiritual psychology, energy medicine, Jungian analysis, the chakra system, biorhythm science and ancient wisdom traditions."}</p>
          <p>{lang==="tr"
            ? "Bu kaynaklar; yapay zekanın analiz gücüyle birleşerek sana jenerik değil, kökü olan yanıtlar sunar. Her içgörü, test edilmiş bir bilgi birikimine dayalı olarak üretilir."
            : "These sources, combined with the analytical power of AI, offer you answers with roots — not generic responses. Every insight is generated based on a tested body of knowledge."}</p>
          <p>{lang==="tr"
            ? "Admin, yapay zekanın verilen cevapları Usui Reiki ilkeleri ve kendi geliştirdiği yaklaşımlar çerçevesinde nasıl yorumlaması gerektiği konusunda Sakin'i eğitir. Sakin'i ne kadar kullanırsan, o da senin dilini, örüntülerini ve ihtiyaçlarını bu yaklaşımlar ışığında daha iyi çözmeye başlar. Yani Sakin; pek çok kaynağın sentezi olmakla birlikte, algoritması özel olarak şekillendirilmiş ve nasıl düşünmesi gerektiği yönlendirilmiş bir sistem olarak çalışır. Her günün ödevlerini düzenli yaparsan seni hızlı tanır, haftanı kolayca raporlar ve analiz eder."
            : "The admin trains Sakin on how to interpret responses through the lens of Usui Reiki principles and personally developed approaches. The more you use Sakin, the better it learns to decode your language, patterns and needs in light of these frameworks. Sakin is thus a synthesis of many sources, yet operates as a system whose algorithm is specially shaped and whose way of thinking is intentionally guided. If you complete each day's exercises regularly, it gets to know you quickly and can easily report and analyse your week."}</p>

          <h2>{lang==="tr" ? "Doğum Haritana Göre Sana Özel" : "Personalised to Your Birth Chart"}</h2>
          <p>{lang==="tr"
            ? "Sakin'in kalbinde kişiselleştirme yatar. Girdiğin doğum tarihi ve saati; burç analizini, yaşam yolu sayını, kişisel yıl enerjini ve 12. ev etkilerini hesaplar. Tüm bu veriler, sana sunulan nefes, çakra, rehber ve akşam yansımaları için birer filtre katmanı oluşturur."
            : "At the heart of Sakin lies personalisation. The birth date and time you enter calculates your zodiac analysis, life path number, personal year energy and 12th house influences. All this data forms filter layers for the breath, chakra, guide and evening reflections presented to you."}</p>
          <p>{lang==="tr"
            ? "Kadim astrolojik ve sayısal sistemler, modern psikoloji ile buluştuğunda ortaya çıkan harita; senin için, senin zamanında, senin enerjin için yazılmış bir pusula haline gelir."
            : "When ancient astrological and numerological systems meet modern psychology, the resulting map becomes a compass written for you, in your time, for your energy."}</p>

          <h2>{lang==="tr" ? "Bir Kanallık Niyeti" : "A Channel's Intention"}</h2>
          <p>{lang==="tr"
            ? "Sakin; bir uygulama olmanın ötesinde, bir kanal olma niyetiyle doğdu. İçeriği aktaran değil, senin içindekini yüzeye taşıyan bir araç. Sabah niyetinden akşam şükrüne, nefesten çakra çalışmasına uzanan yol; seni dışarıdan bilgiyle doldurmak için değil, içindeki bilgeliği hatırlatmak için tasarlandı."
            : "Sakin was born with the intention of being a channel, beyond being an app. Not a transmitter of content, but a tool that brings what is within you to the surface. The path from morning intention to evening gratitude, from breath to chakra work, is designed not to fill you with external information, but to remind you of the wisdom already within."}</p>
          <p>{lang==="tr"
            ? "Kullandığın her an bir pratik, her pratik bir iz, her iz senin haritanın bir parçası olur."
            : "Every moment you use it becomes a practice, every practice a trace, every trace a part of your map."}</p>

          {/* Sakin Ailesi */}
          <div style={{ marginTop:36,marginBottom:28 }}>
            <h2>{lang==="tr"?"Sakin Ailesi":"Sakin Family"}</h2>
            <p style={{ marginBottom:16 }}>{lang==="tr"?"Sakin'in frekansını taşıyan kardeş uygulamalar. Her biri farklı bir kapıdan aynı merkeze çeker.":"Sister apps carrying Sakin's frequency. Each pulls you to the same center from a different door."}</p>
            {[
              { name:"Sakin Hayvan", icon:"◈", color:"#a0d8b4",
                desc:lang==="tr"?"Sözler, Taşlar, Nagual — Anadolu bilgeliği ve ruh rehberliği üzerinden günlük üç kart çekimi.":"Words, Stones, Nagual — daily three-card draws through Anatolian wisdom and spirit guidance." },
              { name:"Sakin Mitler", icon:"🏛️", color:"#d8b4a0",
                desc:lang==="tr"?"Jung'un izinde günlük arketip, mit ve imge okuması — her gün üç deste açılır.":"Daily archetype, myth and image reading in the footsteps of Jung — three decks open each day." },
              { name:"Sakin Tasarım", icon:"⌖", color:"#b4a0d8",
                desc:lang==="tr"?"Doğum gün, saat ve şehrini girerek Human Design haritan — tip, içsel yetki, profil, merkezler ve kanallar.":"Your Human Design chart from birth date, time and city — type, inner authority, profile, centers and channels." },
            ].map((app,i)=>(
              <div key={i} style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:14 }}>
                <div style={{ width:42,height:42,borderRadius:"50%",background:`radial-gradient(circle,${app.color}44,${app.color}11)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>{app.icon}</div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:14,fontWeight:500,color:app.color,letterSpacing:1,marginBottom:2,fontFamily:"'Jost',sans-serif" }}>{app.name}</div>
                  <div style={{ fontSize:12,color:"#999",lineHeight:1.7 }}>{app.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tüm bağlantılar tamamlandı */}
          <div style={{ textAlign:"center",padding:"20px",background:"rgba(52,211,153,0.06)",border:"1px solid rgba(52,211,153,0.12)",borderRadius:16,marginBottom:8 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:4,marginBottom:10 }}>
              {["#c084fc","#818cf8","#38bdf8","#34d399","#fbbf24","#fb923c","#f472b6"].map((c,i)=>(
                <span key={i} style={{ display:"flex",alignItems:"center",gap:4 }}>
                  <span style={{ width:8,height:8,borderRadius:"50%",background:c,display:"inline-block",boxShadow:`0 0 6px ${c}66` }} />
                  {i<6 && <span style={{ width:12,height:1.5,background:`linear-gradient(90deg,${c},${["#818cf8","#38bdf8","#34d399","#fbbf24","#fb923c","#f472b6"][i]})`,display:"inline-block" }} />}
                </span>
              ))}
            </div>
            <div style={{ fontSize:12,color:"#34d399",letterSpacing:2,fontFamily:"'Jost',sans-serif" }}>
              {lang==="tr"?"TÜM BAĞLANTILAR TAMAMLANDI ✦":"ALL CONNECTIONS COMPLETE ✦"}
            </div>
          </div>

          <div className="divider" />

          {/* Geri Bildirim */}
          {!fbOpen ? (
            <div style={{ textAlign:"center",marginBottom:24 }}>
              <button onClick={()=>setFbOpen(true)}
                style={{ background:"linear-gradient(135deg,rgba(184,164,216,0.12),rgba(184,164,216,0.04))",border:"1px solid rgba(184,164,216,0.2)",borderRadius:16,padding:"14px 28px",cursor:"pointer",color:"#b8a4d8",fontSize:14,letterSpacing:2,fontFamily:"'Jost',sans-serif",minHeight:44 }}>
                {lang==="tr" ? "💬  Geri Bildirim Gönder" : "💬  Send Feedback"}
              </button>
            </div>
          ) : (
            <div style={{ background:"linear-gradient(145deg,rgba(184,164,216,0.08),rgba(184,164,216,0.02))",border:"1px solid rgba(184,164,216,0.15)",borderRadius:18,padding:"20px 18px",marginBottom:24 }}>
              <div style={{ fontSize:13,letterSpacing:2.5,color:"#b8a4d8",marginBottom:14,textAlign:"center",fontFamily:"'Jost',sans-serif" }}>
                {lang==="tr" ? "GERİ BİLDİRİM" : "FEEDBACK"}
              </div>
              {fbDone ? (
                <div style={{ textAlign:"center",padding:"20px 0" }}>
                  <div style={{ fontSize:28,marginBottom:8 }}>✓</div>
                  <div style={{ fontSize:14,color:"#50c878",letterSpacing:1.5 }}>
                    {lang==="tr" ? "Teşekkürler! Mesajın iletildi." : "Thank you! Your message was sent."}
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",justifyContent:"center" }}>
                    {(lang==="tr"
                      ? [["oneri","Öneri"],["hata","Hata"],["icerik","İçerik"],["genel","Genel"]]
                      : [["oneri","Suggestion"],["hata","Bug"],["icerik","Content"],["genel","General"]]
                    ).map(([k,v])=>(
                      <button key={k} onClick={()=>setFbCat(k)}
                        style={{ padding:"6px 14px",borderRadius:20,border:`1px solid ${fbCat===k?"rgba(184,164,216,0.5)":"rgba(255,255,255,0.1)"}`,background:fbCat===k?"rgba(184,164,216,0.15)":"transparent",color:fbCat===k?"#b8a4d8":"#888",fontSize:12,letterSpacing:1.5,cursor:"pointer",transition:"all 0.2s" }}>
                        {v}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={fbMsg}
                    onChange={e=>setFbMsg(e.target.value)}
                    placeholder={lang==="tr" ? "Düşüncelerinizi paylaşın..." : "Share your thoughts..."}
                    rows={3}
                    maxLength={1000}
                    style={{ width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(184,164,216,0.15)",borderRadius:12,padding:"12px 14px",color:"#d0c8e8",fontSize:15,fontFamily:"'Inter',sans-serif",outline:"none",marginBottom:12,resize:"none",lineHeight:1.7,letterSpacing:0.3 }}
                  />
                  <div style={{ display:"flex",gap:10,justifyContent:"flex-end" }}>
                    <button onClick={()=>{ setFbOpen(false); setFbMsg(""); setFbCat(""); }}
                      style={{ padding:"10px 20px",borderRadius:12,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#888",fontSize:13,cursor:"pointer",letterSpacing:1,minHeight:44 }}>
                      {lang==="tr" ? "İptal" : "Cancel"}
                    </button>
                    <button onClick={sendFeedback} disabled={!fbMsg.trim() || fbSending}
                      style={{ padding:"10px 24px",borderRadius:12,border:"none",background:fbMsg.trim()?"linear-gradient(135deg,rgba(184,164,216,0.7),rgba(122,80,150,0.6))":"rgba(255,255,255,0.05)",color:fbMsg.trim()?"#fff":"#555",fontSize:13,cursor:fbMsg.trim()?"pointer":"default",letterSpacing:1.5,fontFamily:"'Jost',sans-serif",minHeight:44,opacity:fbSending?0.6:1 }}>
                      {fbSending ? "..." : (lang==="tr" ? "Gönder →" : "Send →")}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          </>
          )}

          <p style={{ fontSize:14, color:"#777777", letterSpacing:1, textAlign:"center", lineHeight:2, marginTop:32 }}>
            {lang==="tr" ? "Sakin · Farkındalık Sistemi · 2026" : "Sakin · Awareness System · 2026"}
            <br/>
            <span style={{ fontSize:12, color:"#555555", letterSpacing:1.5 }}>Arda Çetin</span>
          </p>
        </div>
      )}

      {/* FİYATLANDIRMA */}
      {screen==="fiyat" && (
        <div className="policy-screen">
          <button onClick={()=>{ if (screenHistoryRef.current.length > 1) { history.back(); } else { setScreen("sabah"); } }}
            style={{ position:"absolute",top:14,left:14,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"50%",width:40,height:40,cursor:"pointer",color:"#aaa",fontSize:17,display:"flex",alignItems:"center",justifyContent:"center",zIndex:10 }}>
            ←
          </button>
          <h1>{t("pricing_title")}</h1>
          <div className="subtitle">{t("pricing_sub")}</div>

          <div style={{ textAlign:"center",margin:"20px 0 28px",padding:"16px 20px",background:"linear-gradient(135deg,rgba(184,164,216,0.08),rgba(184,164,216,0.03))",border:"1px solid rgba(184,164,216,0.15)",borderRadius:16 }}>
            <div style={{ fontSize:14,color:"#c8b8e0",lineHeight:2,fontStyle:"italic",letterSpacing:0.5 }}>
              {lang==="tr"
                ? "Bu fiyatlar, Sakin'le birlikte yola çıkan ilk 100 kişi için özel olarak belirlendi. Seninle bu yolculuğa başlamak bizim için çok değerli."
                : "These prices are specially set for the first 100 people who embark on this journey with Sakin. Starting this path with you means the world to us."}
            </div>
          </div>

          {isPremium ? (
            <div style={{ textAlign:"center",padding:"32px 0" }}>
              <div style={{ width:64,height:64,borderRadius:"50%",background:"rgba(80,200,120,0.15)",border:"1px solid rgba(80,200,120,0.3)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#50c878" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div style={{ fontSize:18,fontWeight:300,letterSpacing:2,color:"#50c878",marginBottom:8,fontFamily:"'Jost',sans-serif" }}>
                {lang==="tr" ? "Premium Aktif" : "Premium Active"}
              </div>
              <div style={{ fontSize:14,color:"#888",letterSpacing:1 }}>
                {lang==="tr" ? "Tüm özellikler sınırsız kullanımınıza açık." : "All features are unlocked for lifetime."}
              </div>
            </div>
          ) : isNative ? (
            <>
              <div className="pricing-card" style={{ background:"linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))",border:"1px solid rgba(255,255,255,0.3)" }}>
                <div style={{ position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#b8a4d8,#7a5096,#b8a4d8)",opacity:0.7,borderRadius:"3px 3px 0 0" }}/>
                <div className="pricing-badge" style={{ background:"rgba(184,164,216,0.15)",border:"1px solid rgba(184,164,216,0.35)",color:"#b8a4d8" }}>✦ {t("paid_app_badge")}</div>
                <div style={{ fontSize:19,fontWeight:300,letterSpacing:2,marginBottom:8,color:"#ffffff" }}>{t("paid_app_plan")}</div>
                <ul>{t("paid_app_features").map(f=>(<li key={f}>{f}</li>))}</ul>

                <button onClick={() => handlePurchase(purchaseYearly, "yearly")} disabled={!!purchaseLoading || !productsReady}
                  style={{ display:"block",width:"100%",marginTop:20,marginBottom:12,fontSize:16,letterSpacing:3,padding:"16px 0",textAlign:"center",boxSizing:"border-box",fontFamily:"'Jost',sans-serif",fontWeight:400,background:"linear-gradient(135deg,rgba(184,164,216,0.8),rgba(122,80,150,0.7))",border:"1px solid rgba(184,164,216,0.5)",borderRadius:28,color:"#fff",boxShadow:"0 4px 24px rgba(122,80,150,0.35)",cursor:(purchaseLoading || !productsReady) ? "default" : "pointer",opacity:(purchaseLoading || !productsReady) ? 0.5 : 1 }}>
                  {purchaseLoading === "yearly" ? "..." : !productsReady ? (lang==="tr" ? "Yükleniyor..." : "Loading...") : (lang==="tr" ? "Yıllık Abone Ol" : "Subscribe Yearly")}
                </button>
                <button onClick={() => handlePurchase(purchaseLifetime, "lifetime")} disabled={!!purchaseLoading || !productsReady}
                  style={{ display:"block",width:"100%",marginBottom:0,fontSize:16,letterSpacing:3,padding:"16px 0",textAlign:"center",boxSizing:"border-box",fontFamily:"'Jost',sans-serif",fontWeight:400,background:"linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.06))",border:"1px solid rgba(184,164,216,0.4)",borderRadius:28,color:"#fff",cursor:(purchaseLoading || !productsReady) ? "default" : "pointer",opacity:(purchaseLoading || !productsReady) ? 0.5 : 1 }}>
                  {purchaseLoading === "lifetime" ? "..." : !productsReady ? (lang==="tr" ? "Yükleniyor..." : "Loading...") : (lang==="tr" ? "Ömür Boyu Satın Al" : "Buy Lifetime")}
                </button>
              </div>

              {!productsReady && !purchaseError && (
                <div style={{ textAlign:"center",marginTop:16,fontSize:12,color:"#888",letterSpacing:1.5,fontFamily:"'Jost',sans-serif" }}>
                  {lang==="tr" ? "App Store ürünleri yükleniyor..." : "Loading App Store products..."}
                </div>
              )}

              {purchaseError && (
                <div style={{ textAlign:"center",marginTop:16,padding:"12px 16px",background:"rgba(255,80,80,0.1)",border:"1px solid rgba(255,80,80,0.2)",borderRadius:12,fontSize:13,color:"#ff6666",letterSpacing:0.5 }}>
                  {purchaseError}
                </div>
              )}

              <div style={{ textAlign:"center",marginTop:20,marginBottom:20 }}>
                <button onClick={handleRestore} disabled={!!purchaseLoading}
                  style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:22,padding:"10px 24px",cursor:"pointer",color:"#aaa",fontSize:14,letterSpacing:1.5,fontFamily:"'Jost',sans-serif",opacity:purchaseLoading ? 0.5 : 1 }}>
                  {purchaseLoading === "restore" ? "..." : (lang==="tr" ? "Satın Alımları Geri Yükle" : "Restore Purchases")}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="pricing-card" style={{ background:"linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))",border:"1px solid rgba(255,255,255,0.3)" }}>
                <div style={{ position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#b8a4d8,#7a5096,#b8a4d8)",opacity:0.7,borderRadius:"3px 3px 0 0" }}/>
                <div className="pricing-badge" style={{ background:"rgba(184,164,216,0.15)",border:"1px solid rgba(184,164,216,0.35)",color:"#b8a4d8" }}>✦ {t("paid_app_badge")}</div>
                <div style={{ fontSize:19,fontWeight:300,letterSpacing:2,marginBottom:8,color:"#ffffff" }}>{t("paid_app_plan")}</div>
                <div style={{ fontSize:36,color:"#ffffff",letterSpacing:1,marginBottom:4,fontWeight:200 }}>{t("paid_app_price")}</div>
                <div style={{ fontSize:13,color:"#b8a4d8",letterSpacing:1.5,marginBottom:6 }}>{t("paid_app_price_sub")}</div>
                <div style={{ display:"inline-block",background:"rgba(184,164,216,0.12)",border:"1px solid rgba(184,164,216,0.25)",borderRadius:20,padding:"5px 16px",fontSize:12,letterSpacing:2.5,color:"#c8b8e0",textTransform:"uppercase",marginBottom:18 }}>
                  {lang==="tr" ? "Ömür Boyu Lisans · İlk 100 Kişiye" : "Lifetime License · First 100 People"}
                </div>
                <ul>{t("paid_app_features").map(f=>(<li key={f}>{f}</li>))}</ul>

                <a href={t("lemon_checkout_url") + "?embed=1"} className="sakin-btn-primary lemonsqueezy-button"
                  style={{ display:"block",width:"100%",marginTop:20,marginBottom:0,fontSize:16,letterSpacing:3,padding:"16px 0",textAlign:"center",textDecoration:"none",boxSizing:"border-box",fontFamily:"'Jost',sans-serif",fontWeight:400,background:"linear-gradient(135deg,rgba(184,164,216,0.8),rgba(122,80,150,0.7))",border:"1px solid rgba(184,164,216,0.5)",borderRadius:28,color:"#fff",boxShadow:"0 4px 24px rgba(122,80,150,0.35)" }}>
                  {lang==="tr" ? "Satın Al →" : "Buy Now →"}
                </a>
              </div>

              <div style={{ textAlign:"center",marginTop:20,marginBottom:20 }}>
                <div style={{ fontSize:13,color:"#666",letterSpacing:1,marginBottom:10 }}>
                  {lang==="tr" ? "Zaten satın aldıysan:" : "Already purchased?"}
                </div>
                <button onClick={() => setShowLicenseModal(true)}
                  style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:22,padding:"10px 24px",cursor:"pointer",color:"#aaa",fontSize:14,letterSpacing:1.5,fontFamily:"'Jost',sans-serif" }}>
                  {lang==="tr" ? "Lisans Anahtarı Gir" : "Enter License Key"}
                </button>
              </div>

              <div style={{ textAlign:"center",marginTop:8,marginBottom:24,padding:"18px 20px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16 }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:10 }}>
                  <span style={{ fontSize:16 }}>🔒</span>
                  <span style={{ fontSize:13,letterSpacing:2,color:"#888",fontFamily:"'Jost',sans-serif",textTransform:"uppercase" }}>
                    {lang==="tr" ? "Güvenli Ödeme" : "Secure Payment"}
                  </span>
                </div>
                <div style={{ fontSize:13,color:"#666",lineHeight:1.8,letterSpacing:0.3 }}>
                  {lang==="tr"
                    ? "Ödemeler, uluslararası lisanslı dijital ödeme altyapısı Lemon Squeezy tarafından güvenle işlenmektedir. Kredi kartı bilgileriniz Sakin tarafından saklanmaz."
                    : "Payments are securely processed by Lemon Squeezy, a licensed international digital payment platform. Your credit card information is never stored by Sakin."}
                </div>
                <a href="https://www.lemonsqueezy.com" target="_blank" rel="noopener noreferrer"
                  style={{ display:"inline-block",marginTop:10,fontSize:12,letterSpacing:1.5,color:"#b8a4d8",textDecoration:"none",borderBottom:"1px solid rgba(184,164,216,0.3)",paddingBottom:2 }}>
                  lemonsqueezy.com →
                </a>
              </div>
            </>
          )}

          {!isPremium && (
            <div style={{ marginTop:24,padding:"18px 18px 16px",background:"linear-gradient(135deg,rgba(240,200,120,0.06),rgba(184,164,216,0.04))",border:"1px solid rgba(240,200,120,0.18)",borderRadius:16 }}>
              <div style={{ fontSize:11,letterSpacing:3,color:"#c8a868",textTransform:"uppercase",fontFamily:"'Jost',sans-serif",marginBottom:6,textAlign:"center" }}>
                ✦ {lang==="tr" ? "Bonus · Sakin Ailesi" : "Bonus · Sakin Family"}
              </div>
              <div style={{ fontSize:13,color:"#a89878",lineHeight:1.7,textAlign:"center",fontStyle:"italic",marginBottom:14 }}>
                {lang==="tr"
                  ? "Hepsi Sakin'in içinde, ek ücret yok."
                  : "All inside Sakin, no extra cost."}
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                <div style={{ fontSize:13,color:"#cccccc",lineHeight:1.6 }}>
                  <strong style={{ color:"#a0d8b4",fontWeight:500 }}>◈ Sakin Hayvan</strong> — {lang==="tr"?"günlük üç kart: Sözler, Taşlar, Nagual":"daily three cards: Words, Stones, Nagual"}
                </div>
                <div style={{ fontSize:13,color:"#cccccc",lineHeight:1.6 }}>
                  <strong style={{ color:"#d8b4a0",fontWeight:500 }}>🏛 Sakin Mitler</strong> — {lang==="tr"?"Jung izinde arketip, mit ve imge okuması":"archetype, myth and image reading in Jung's path"}
                </div>
                <div style={{ fontSize:13,color:"#cccccc",lineHeight:1.6 }}>
                  <strong style={{ color:"#b4a0d8",fontWeight:500 }}>⌖ Sakin Tasarım</strong> — {lang==="tr"?"Human Design bodygraph ve raporu":"Human Design bodygraph and report"}
                </div>
              </div>
            </div>
          )}

          <hr className="divider" />
          <p style={{ fontSize:14,color:"#666666",textAlign:"center",letterSpacing:1 }}>{t("pricing_footer")} <a href="mailto:destek@sakin.app" style={{ color:"#888888",textDecoration:"none" }}>destek@sakin.app</a></p>
        </div>
      )}

      {/* HİZMET ŞARTLARI */}
      {screen==="sartlar" && (
        <div className="policy-screen">
          <h1>{t("terms_title")}</h1>
          <div className="subtitle">{t("terms_updated")}</div>
          <h2>{t("terms_s1")}</h2><p>{t("terms_s1p")}</p>
          <h2>{t("terms_s2")}</h2><p>{t("terms_s2p")}</p>
          <h2>{t("terms_s3")}</h2><p>{t("terms_s3p")}</p>
          <ul>{t("terms_s3l").map(i=><li key={i}>{i}</li>)}</ul>
          <h2>{t("terms_s4")}</h2><p>{t("terms_s4p")}</p>
          <h2>{t("terms_s5")}</h2><p>{t("terms_s5p")}</p>
          <h2>{t("terms_s6")}</h2><p>{t("terms_s6p")}</p>
          <h2>{t("terms_s7")}</h2><p>{t("terms_s7p")}</p>
          <h2>{t("terms_s8")}</h2><p>{t("terms_s8p")}</p>
          <h2>{t("terms_s9")}</h2><p>{t("terms_s9p")} <a href="mailto:destek@sakin.app" style={{ color:"#888888",textDecoration:"none" }}>destek@sakin.app</a></p>
        </div>
      )}

      {/* GİZLİLİK POLİTİKASI */}
      {screen==="gizlilik" && (
        <div className="policy-screen">
          <h1>{t("privacy_title")}</h1>
          <div className="subtitle">{t("privacy_updated")}</div>

          <h2>{t("privacy_s1")}</h2>
          <p>{t("privacy_s1p")}</p>

          <h2>{t("privacy_s2")}</h2>
          <p>{t("privacy_s2p")}</p>
          <ul>{t("privacy_s2l").map(i=><li key={i}>{i}</li>)}</ul>

          <h2>{t("privacy_s3")}</h2>
          <p>{t("privacy_s3p")}</p>
          <ul>{t("privacy_s3l").map(i=><li key={i}>{i}</li>)}</ul>

          <h2>{t("privacy_s4")}</h2>
          <p>{t("privacy_s4p")}</p>

          <h2>{t("privacy_s5")}</h2>
          <p>{t("privacy_s5p")}</p>

          <h2>{t("privacy_s6")}</h2>
          <p>{t("privacy_s6p")}</p>

          <h2>{t("privacy_s7")}</h2>
          <p>{t("privacy_s7p")}</p>

          <h2>{t("privacy_s8")}</h2>
          <p>{t("privacy_s8p")}</p>

          <h2>{t("privacy_s9")}</h2>
          <p>{t("privacy_s9p")}</p>

          <h2>{t("privacy_s10")}</h2>
          <p>{t("privacy_s10p")} <a href="mailto:destek@sakin.app" style={{ color:"#888888",textDecoration:"none" }}>destek@sakin.app</a></p>
          <p style={{ fontSize:14,color:"#777777" }}>{t("privacy_app_name")}</p>
        </div>
      )}

      {/* İADE POLİTİKASI */}
      {screen==="iade" && (
        <div className="policy-screen">
          <h1>{t("refund_title")}</h1>
          <div className="subtitle">{t("refund_updated")}</div>

          <h2>{t("refund_s1")}</h2>
          <p>{t("refund_s1p")}</p>
          <p>{t("refund_s1p2")}</p>

          <h2>{t("refund_s2")}</h2>
          <ul>{t("refund_s2l").map(([bold,text])=><li key={bold}><strong style={{ color:"#c8c0b8" }}>{bold}:</strong> {text}</li>)}</ul>

          <h2>{t("refund_s3")}</h2>
          <ul>{t("refund_s3l").map(i=><li key={i}>{i}</li>)}</ul>

          <h2>{t("refund_s4")}</h2>
          <p>{t("refund_s4p")}</p>

          <h2>{t("refund_s5")}</h2>
          <p>{t("refund_s5p")}</p>
          <ul>{t("refund_s5l").map(i=><li key={i}>{i}</li>)}</ul>
          <p>{t("refund_s5p2")} <a href="mailto:destek@sakin.app" style={{ color:"#888888",textDecoration:"none" }}>destek@sakin.app</a></p>
          <p>{t("refund_s5p3")}</p>

          <h2>{t("refund_s6")}</h2>
          <p>{t("refund_s6p")}</p>

          <h2>{t("refund_s7")}</h2>
          <p>{t("refund_s7p")} <a href="mailto:destek@sakin.app" style={{ color:"#888888",textDecoration:"none" }}>destek@sakin.app</a></p>
        </div>
      )}

      {/* PROGRESS STRIP */}
      {["sabah","nefes","ses","chakra","gun","aksam","harita"].includes(screen) && (
        <div style={{ position:"fixed",bottom:"calc(76px + var(--sab))",left:"50%",transform:"translateX(-50%)",zIndex:9998,display:"flex",alignItems:"center",gap:6,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(16px)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:20,padding:"5px 14px" }}>
          {MANDALA_STEPS.map((s,i) => {
            const done = !!stepsCompleted[s];
            const isCurrent = screen === s || (screen === "terapi" && s === "chakra") || (screen === "gun" && s === "gun");
            const stepColors = { sabah:"#f0a060",nefes:"#60b8e8",ses:"#a07ae0",chakra:"#b87adc",gun:"#e8d060",aksam:"#7ab0e0",harita:"#82d9a3" };
            const c = stepColors[s] || "#888";
            return <div key={s} style={{ width:isCurrent?20:8,height:8,borderRadius:4,background:done?c:isCurrent?`${c}88`:"rgba(255,255,255,0.08)",transition:"all 0.3s",border:isCurrent?`1px solid ${c}66`:"none" }} />;
          })}
          <span style={{ fontFamily:"'Jost',sans-serif",fontSize:11,letterSpacing:2,color:"rgba(255,255,255,0.3)",marginLeft:4 }}>{t("step_label", completedStepCount, MANDALA_STEPS.length)}</span>
        </div>
      )}

      {/* BOTTOM NAV */}
      {!["giris","mandala","terapi","hakkinda","fiyat","sartlar","gizlilik","iade"].includes(screen) && (
        <div style={{ position:"fixed",bottom:16,left:"50%",transform:"translateX(-50%)",display:"flex",gap:2,alignItems:"center",zIndex:9999,background:"rgba(0,0,0,0.92)",backdropFilter:"blur(32px)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:100,padding:"6px 8px",maxWidth:"calc(100vw - 24px)" }}>
          {NAV.map(n=>{
            const active = screen===n.id;
            const sabahHint = n.id==="sabah" && screen==="rehber";
            return (
              <button key={n.id} onClick={()=>{ setScreen(n.id); }}
                style={{
                  background: active ? `${n.color}22` : sabahHint ? `${n.color}12` : "transparent",
                  border: active ? `1px solid ${n.color}44` : sabahHint ? `1px solid ${n.color}33` : "1px solid transparent",
                  borderRadius:22,
                  cursor: n.id==="sabah" && stepsCompleted["sabah"] ? "not-allowed" : "pointer",
                  transition:"background 0.5s ease, border 0.5s ease",
                  padding:"8px 12px",
                  display:"flex",flexDirection:"column",alignItems:"center",gap:3,
                  minWidth:48,
                  opacity: n.id==="sabah" && stepsCompleted["sabah"] ? 0.32 : 1,
                  animation: sabahHint ? "navSoftPulse 2.5s ease-in-out infinite" : "none",
                }}>
                <span style={{ fontSize:active?18:15, color: active ? n.color : sabahHint ? n.color : `${n.color}55`, transition:"color 0.5s ease", lineHeight:1 }}>{n.icon}</span>
                <span style={{ fontFamily:"'Jost',sans-serif",fontWeight:300,fontSize:11,letterSpacing:1.5,textTransform:"uppercase",color:active?n.color:sabahHint?n.color:`${n.color}44`,transition:"color 0.5s ease",lineHeight:1 }}>{n.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* FLOATING HELP BUTTON */}
      {!["giris"].includes(screen) && !showKilavuz && (
        <button
          onClick={() => setShowKilavuz(true)}
          style={{
            position:"fixed", bottom: !["terapi","hakkinda","fiyat","sartlar","gizlilik","iade"].includes(screen) ? 80 : 24,
            right:18, zIndex:10000, width:48, height:48, borderRadius:"50%",
            background:"linear-gradient(135deg,#c0392b,#e74c3c)", border:"2px solid rgba(255,255,255,0.2)",
            color:"#fff", fontSize:22, fontWeight:"bold", cursor:"pointer",
            boxShadow:"0 4px 20px rgba(192,57,43,0.5), 0 0 30px rgba(231,76,60,0.3)",
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"all 0.25s", animation:"slowPulse 3s ease-in-out infinite",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(192,57,43,0.7), 0 0 40px rgba(231,76,60,0.4)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(192,57,43,0.5), 0 0 30px rgba(231,76,60,0.3)"; }}
        >?</button>
      )}

      {/* GLOSSARY / HELP GUIDE MODAL */}
      {showKilavuz && (() => {
        const glossary = lang === "tr" ? [
          { cat: t("guide_cat_numerology"), items: [
            { term: "Yaşam Yolu Sayısı (Life Path Number)", desc: "Doğum tarihindeki tüm rakamların tek haneli bir sayıya (veya 11, 22, 33 usta sayılarına) indirgenmesiyle bulunan kişisel sayıdır. Hayat amacını, doğal yeteneklerini ve yaşam yolculuğunun temel enerjisini temsil eder.", examples: [
              { num: "1", meaning: "Lider, bağımsız, öncü. Kendi yolunu çizen, cesur ve kararlı bir enerji. Yenilik ve başlangıçların sayısı." },
              { num: "2", meaning: "Diplomat, uyumlu, hassas. İşbirliği ve denge arayan, sezgisel ve nazik bir enerji. Ortaklık ve ilişki sayısı." },
              { num: "3", meaning: "Yaratıcı, ifadeci, neşeli. Sanat, iletişim ve sosyal bağlantı enerjisi. Kendini ifade etme ve ilham sayısı." },
              { num: "4", meaning: "İnşa edici, disiplinli, güvenilir. Düzen, istikrar ve sağlam temeller enerjisi. Çalışkanlık ve dayanıklılık sayısı." },
              { num: "5", meaning: "Özgür ruh, maceracı, değişken. Özgürlük, seyahat ve deneyim enerjisi. Değişim ve esneklik sayısı." },
              { num: "6", meaning: "Bakıcı, sorumlu, uyumlu. Aile, ev ve toplum enerjisi. Sevgi, şifa ve sorumluluk sayısı." },
              { num: "7", meaning: "Araştırmacı, mistik, içe dönük. Maneviyat, analiz ve derin düşünce enerjisi. Bilgelik ve keşif sayısı." },
              { num: "8", meaning: "Güç sahibi, hırslı, başarılı. Maddi bolluk, otorite ve başarı enerjisi. Denge ve karma sayısı." },
              { num: "9", meaning: "İnsancıl, bilge, tamamlayıcı. Evrensel sevgi, şefkat ve bırakma enerjisi. Hizmet ve dönüşüm sayısı." },
              { num: "11", meaning: "Usta Sayı — Sezgisel aydınlatıcı. Yüksek farkındalık, ilham ve spiritüel öğretmenlik enerjisi." },
              { num: "22", meaning: "Usta Sayı — Usta inşacı. Büyük vizyonları gerçeğe dönüştürme gücü. Pratik idealizm enerjisi." },
              { num: "33", meaning: "Usta Sayı — Usta öğretmen. Koşulsuz sevgi, şifa ve evrensel hizmet enerjisi." },
            ]},
            { term: "Kişisel Yıl Sayısı", desc: "Doğum gününüz ve ayınız ile içinde bulunduğunuz yılın rakamlarının toplanmasıyla hesaplanır. 1-9 arasında döngüsel bir enerji haritası sunar. Her yıl farklı bir tema ve enerji getirir.", examples: [
              { num: "1. Yıl", meaning: "Yeni başlangıçlar, tohum ekme zamanı." },
              { num: "2. Yıl", meaning: "Sabır, işbirliği ve bekleme zamanı." },
              { num: "3. Yıl", meaning: "Yaratıcılık, ifade ve sosyallik zamanı." },
              { num: "4. Yıl", meaning: "Temel atma, düzen kurma zamanı." },
              { num: "5. Yıl", meaning: "Değişim, özgürlük ve macera zamanı." },
              { num: "6. Yıl", meaning: "Sorumluluk, aile ve şifa zamanı." },
              { num: "7. Yıl", meaning: "İçe dönüş, araştırma ve maneviyat zamanı." },
              { num: "8. Yıl", meaning: "Güç, başarı ve maddi bolluk zamanı." },
              { num: "9. Yıl", meaning: "Tamamlama, bırakma ve dönüşüm zamanı." },
            ]},
            { term: "İndirgeme (Reduce)", desc: "Numerolojide çok haneli sayıları tek haneye düşürme işlemidir. Tüm rakamlar toplanır, sonuç 9'dan büyükse tekrar toplanır. 11, 22 ve 33 \"Usta Sayılar\" olarak indirgenmez, özel anlamları korunur." },
          ]},
          { cat: t("guide_cat_astrology"), items: [
            { term: "Burç (Güneş Burcu)", desc: "Doğduğunuz tarihte Güneş'in bulunduğu burçtur. Temel kişiliğinizi, egonuzu ve yaşam enerjinizi temsil eder. 12 burç vardır: Koç, Boğa, İkizler, Yengeç, Aslan, Başak, Terazi, Akrep, Yay, Oğlak, Kova, Balık." },
            { term: "Yükselen Burç (Ascendant)", desc: "Doğum anında ufuk çizgisinde yükselen burçtur. Dış dünyanın sizi nasıl gördüğünü, fiziksel görünümünüzü ve ilk izleniminizi belirler. Hesaplamak için doğum saati gereklidir. Yaklaşık olarak her 2 saatte bir burç değişir." },
            { term: "12. Ev & Yönetici Gezegen", desc: "Astrolojide 12. ev bilinçaltını, gizli güçleri, spiritüel potansiyeli ve içsel dünyayı temsil eder. Her evin bir yönetici gezegeni vardır ve bu gezegen o evin temalarını nasıl deneyimlediğinizi belirler." },
            { term: "Draconik Harita", desc: "Natal harita kim olduğunu söyler, Draconik harita ruhunun bu bedene girmeden önce ne olduğunu söyler. Kuzey Ay Düğümü 0° Koç'a sabitlenerek hesaplanır ve tüm gezegenlerin ruhsal eksen sıfırlandığında nerede durduğunu gösterir. Pamela Crane ve Ronald Davison tarafından 1970'lerde sistemleştirilmiştir. Draconik Güneş ruhun gerçek kimliği, natal Güneş bu hayatta giydiği maskedir; ikisi farklı burçtaysa kişi sürekli rol yapıyor gibi hissedebilir." },
            { term: "Gezegen Güçleri", desc: "Her gezegen farklı bir yaşam alanını ve enerjiyi yönetir: Güneş (benlik), Ay (duygular), Merkür (iletişim), Venüs (sevgi), Mars (aksiyon), Jüpiter (genişleme), Satürn (disiplin), Uranüs (özgünlük), Neptün (hayal gücü), Pluto (dönüşüm)." },
          ]},
          { cat: t("guide_cat_chakra"), items: [
            { term: "Çakra Nedir?", desc: "Sanskrit dilinde \"tekerlek\" anlamına gelir. Vücuttaki enerji merkezleridir. 7 ana çakra omurga boyunca sıralanır. Her biri farklı fiziksel, duygusal ve spiritüel alanları yönetir." },
            { term: "1. Kök Çakra (Muladhara)", desc: "Konum: Omurga tabanı. Renk: Kırmızı. Element: Toprak. Temsil: Güvenlik, hayatta kalma, temel ihtiyaçlar, topraklanma. Dengede: Güvende hissedersin. Dengesiz: Korku, kaygı, maddi endişeler." },
            { term: "2. Sakral Çakra (Svadhisthana)", desc: "Konum: Göbek altı. Renk: Turuncu. Element: Su. Temsil: Yaratıcılık, duygular, cinsellik, zevk alma. Dengede: Akışta hissedersin. Dengesiz: Duygusal istikrarsızlık, yaratıcılık tıkanması." },
            { term: "3. Güneş Pleksusu Çakra (Manipura)", desc: "Konum: Mide bölgesi. Renk: Sarı. Element: Ateş. Temsil: Özgüven, irade gücü, kişisel güç. Dengede: Güçlü ve kararlı hissedersin. Dengesiz: Güçsüzlük, kontrol sorunları." },
            { term: "4. Kalp Çakra (Anahata)", desc: "Konum: Göğüs merkezi. Renk: Yeşil. Element: Hava. Temsil: Sevgi, şefkat, bağışlama, ilişkiler. Dengede: Sevgiyle açık hissedersin. Dengesiz: Kıskançlık, yalnızlık, bağlanma korkusu." },
            { term: "5. Boğaz Çakra (Vishuddha)", desc: "Konum: Boğaz. Renk: Mavi. Element: Ses. Temsil: İletişim, kendini ifade, hakikat. Dengede: Rahatça konuşursun. Dengesiz: İfade zorluğu, yalan söyleme eğilimi." },
            { term: "6. Üçüncü Göz Çakra (Ajna)", desc: "Konum: İki kaş arası. Renk: Mor/İndigo. Element: Işık. Temsil: Sezgi, içgörü, hayal gücü, bilgelik. Dengede: Sezgilerin güçlüdür. Dengesiz: Karar verememe, sezgisel tıkanıklık." },
            { term: "7. Taç Çakra (Sahasrara)", desc: "Konum: Başın tepesi. Renk: Mor/Beyaz. Element: Evren. Temsil: Evrensel bağlantı, aydınlanma, spiritüel farkındalık. Dengede: Bütünle bağlı hissedersin. Dengesiz: Kopukluk, anlamsızlık hissi." },
            { term: "22 Çakra Sistemi", desc: "7 ana çakranın ötesinde 15 ek enerji merkezi daha bulunur. Bunlar arasında Yeryüzü Yıldızı, Ruh, Thymus, Orion, Soul Star gibi daha ileri düzey enerji merkezleri yer alır. Reiki terapisinde bu genişletilmiş sistem kullanılır." },
          ]},
          { cat: t("guide_cat_biorhythm"), items: [
            { term: "Biyoritm Nedir?", desc: "Doğum tarihinden itibaren başlayan üç döngüsel biyolojik ritimdir. Her döngü sinüs dalgası şeklinde pozitif ve negatif arasında salınır. Değerler -100 ile +100 arasında değişir." },
            { term: "Fiziksel Biyoritm (23 gün)", desc: "Fiziksel enerji, güç, dayanıklılık ve koordinasyonu yansıtır. Pozitif dönemde enerjin yüksek, negatif dönemde dinlenme ihtiyacın artar. Kritik günlerde (0 geçişi) dikkatli ol." },
            { term: "Duygusal Biyoritm (28 gün)", desc: "Duygusal denge, ruh hali, yaratıcılık ve sezgiyi yansıtır. Pozitif dönemde iyimser ve empatiğin, negatif dönemde hassas ve içe dönüksün." },
            { term: "Zihinsel Biyoritm (33 gün)", desc: "Zihinsel keskinlik, konsantrasyon, hafıza ve analitik düşünme kapasitesini yansıtır. Pozitif dönemde zihnen aktif ve öğrenmeye açıksın, negatif dönemde odaklanma zorlaşır." },
          ]},
          { cat: t("guide_cat_reiki"), items: [
            { term: "Reiki Nedir?", desc: "Japonca \"evrensel yaşam enerjisi\" anlamına gelen bir farkındalık pratiğidir. Ellerin enerji merkezlerine (çakralara) yerleştirilmesiyle kişisel farkındalık ve rahatlama deneyimi sunar. Tıbbi bir tedavi veya teşhis yöntemi değildir; profesyonel sağlık hizmetinin yerine geçmez." },
            { term: "Çakra Terapisi", desc: "Sakin'deki 60 saniyelik seanslar, seçtiğiniz çakraya odaklanmanızı sağlar. Elinizi ilgili bölgeye koyarak, gözlerinizi kapatarak ve nefes alarak o enerji merkeziyle bağ kurarsınız." },
            { term: "Şifa Arayışı", desc: "AI destekli bir analiz aracıdır. Fiziksel veya duygusal bir durumu girdiğinizde, Reiki bilgeliği, Louise Hay'in zihinsel-duygusal neden haritası ve çakra teorisini birleştirerek kişiselleştirilmiş bir yorum sunar." },
            { term: "Louise Hay Yöntemi", desc: "Fiziksel rahatsızlıkların altında yatan zihinsel ve duygusal nedenleri inceleyen bir yaklaşımdır. Örneğin baş ağrısı \"kendini geçersiz sayma\", sırt ağrısı \"duygusal destek eksikliği\" ile ilişkilendirilir." },
            { term: "İçsel Ayna", desc: "Bedensel şikayetlerinizi veya duygusal durumunuzu yazarak içsel nedenlerini keşfetmenizi sağlayan AI analiz aracıdır." },
          ]},
          { cat: t("guide_cat_app"), items: [
            { term: "Sabah Niyeti", desc: "Her güne bilinçli bir niyetle başlama pratiğidir. Kısa bir cümle veya kelime ile o günün odak noktasını belirlersiniz. Niyet, bilinçaltına yön verir ve günün akışını şekillendirir." },
            { term: "3 Kelime Seçimi", desc: "Sabah rutininde sunulan 12 güç kelimesinden (huzur, akış, cesaret, sabır, berraklık, sevgi, güç, denge, özgürlük, neşe, şükür, güven) 3 tanesini seçersiniz. Bu kelimeler günün enerji yönelimini belirler." },
            { term: "Nefes Egzersizi (4-1.5-3.5)", desc: "Al (4 sn) → Tut (1.5 sn) → Ver (3.5 sn) → Dinlen ritmiyle yapılan nefes pratiğidir. Parasempatik sinir sistemini aktive ederek stresi azaltır ve odaklanmayı artırır." },
            { term: "Gün İçi Hatırlatıcılar", desc: "Gün boyunca farkındalığınızı korumanız için tasarlanmış 10 mikro pratiktir: aynaya bakmak, su içmek, nefes farkındalığı, beden egzersizi, güneşi hissetmek, ağaca sarılmak, toprağa dokunmak, gökyüzüne bakmak, çakra anı ve sosyal medya molası." },
            { term: "Akşam Kapanışı", desc: "Günü bilinçli bir şekilde kapatma ritüelidir. \"Bugün ne öğrendin?\" ve \"Şükür?\" sorularıyla günün farkındalık özetini çıkarırsınız." },
            { term: "Haftalık İç Harita", desc: "Haftanın istatistiklerini gösteren özet ekrandır: en aktif çakra, toplam nefes sayısı, niyet kelimeleri ve bilinçli an sayısı. AI raporu bu verilerden haftalık bir içgörü sentezi oluşturur." },
            { term: "Doğum Profili", desc: "Doğum tarihiniz ve saatinizden hesaplanan kişisel enerji haritanızdır: burç, yaşam yolu sayısı, kişisel yıl sayısı, yükselen burç, 12. ev analizi ve haftalık biyoritm grafiği." },
          ]},
        ] : [
          { cat: t("guide_cat_numerology"), items: [
            { term: "Life Path Number", desc: "Calculated by reducing all digits of your birth date to a single digit (or master numbers 11, 22, 33). It represents your life purpose, natural talents, and the core energy of your journey.", examples: [
              { num: "1", meaning: "Leader, independent, pioneer. Courageous and determined energy that charts its own course." },
              { num: "2", meaning: "Diplomat, harmonious, sensitive. Cooperative and intuitive energy seeking balance." },
              { num: "3", meaning: "Creative, expressive, joyful. Art, communication and social connection energy." },
              { num: "4", meaning: "Builder, disciplined, reliable. Order, stability and solid foundations energy." },
              { num: "5", meaning: "Free spirit, adventurous, changeable. Freedom, travel and experience energy." },
              { num: "6", meaning: "Caretaker, responsible, harmonious. Family, home and community energy." },
              { num: "7", meaning: "Researcher, mystic, introspective. Spirituality, analysis and deep thought energy." },
              { num: "8", meaning: "Powerful, ambitious, successful. Material abundance, authority and achievement energy." },
              { num: "9", meaning: "Humanitarian, wise, completing. Universal love, compassion and release energy." },
              { num: "11", meaning: "Master Number — Intuitive illuminator. High awareness and spiritual teaching energy." },
              { num: "22", meaning: "Master Number — Master builder. Power to turn grand visions into reality." },
              { num: "33", meaning: "Master Number — Master teacher. Unconditional love, healing and universal service." },
            ]},
            { term: "Personal Year Number", desc: "Calculated by adding your birth day and month with the current year's digits. Provides a cyclical energy map from 1-9. Each year brings a different theme and energy." },
            { term: "Reduction", desc: "The process of reducing multi-digit numbers to a single digit in numerology. All digits are added; if the result is greater than 9, they are added again. 11, 22, and 33 are \"Master Numbers\" and are not reduced." },
          ]},
          { cat: t("guide_cat_astrology"), items: [
            { term: "Zodiac Sign (Sun Sign)", desc: "The sign the Sun was in at your birth. Represents your core personality, ego, and life energy. There are 12 signs: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces." },
            { term: "Ascendant (Rising Sign)", desc: "The sign rising on the horizon at your birth moment. Determines how the world sees you, your physical appearance and first impression. Birth time is required for calculation." },
            { term: "12th House & Ruling Planet", desc: "In astrology, the 12th house represents the subconscious, hidden powers, spiritual potential and inner world. Each house has a ruling planet that determines how you experience its themes." },
            { term: "Planetary Powers", desc: "Each planet governs different life areas: Sun (self), Moon (emotions), Mercury (communication), Venus (love), Mars (action), Jupiter (expansion), Saturn (discipline), Uranus (originality), Neptune (imagination), Pluto (transformation)." },
          ]},
          { cat: t("guide_cat_chakra"), items: [
            { term: "What is a Chakra?", desc: "Means \"wheel\" in Sanskrit. Energy centers in the body. 7 main chakras align along the spine, each governing different physical, emotional and spiritual areas." },
            { term: "1. Root Chakra (Muladhara)", desc: "Location: Base of spine. Color: Red. Element: Earth. Represents: Safety, survival, basic needs, grounding." },
            { term: "2. Sacral Chakra (Svadhisthana)", desc: "Location: Below navel. Color: Orange. Element: Water. Represents: Creativity, emotions, sexuality, pleasure." },
            { term: "3. Solar Plexus Chakra (Manipura)", desc: "Location: Stomach area. Color: Yellow. Element: Fire. Represents: Confidence, willpower, personal power." },
            { term: "4. Heart Chakra (Anahata)", desc: "Location: Center of chest. Color: Green. Element: Air. Represents: Love, compassion, forgiveness, relationships." },
            { term: "5. Throat Chakra (Vishuddha)", desc: "Location: Throat. Color: Blue. Element: Sound. Represents: Communication, self-expression, truth." },
            { term: "6. Third Eye Chakra (Ajna)", desc: "Location: Between eyebrows. Color: Indigo. Element: Light. Represents: Intuition, insight, imagination, wisdom." },
            { term: "7. Crown Chakra (Sahasrara)", desc: "Location: Top of head. Color: Violet/White. Element: Universe. Represents: Universal connection, enlightenment." },
            { term: "22 Chakra System", desc: "Beyond the 7 main chakras, there are 15 additional energy centers including Earth Star, Soul, Thymus, Orion, Soul Star and more, used in extended Reiki therapy." },
          ]},
          { cat: t("guide_cat_biorhythm"), items: [
            { term: "What is Biorhythm?", desc: "Three cyclical biological rhythms starting from your birth date. Each oscillates between positive and negative as sine waves, with values ranging from -100 to +100." },
            { term: "Physical Biorhythm (23 days)", desc: "Reflects physical energy, strength, endurance and coordination. Positive periods = high energy, negative = rest needed." },
            { term: "Emotional Biorhythm (28 days)", desc: "Reflects emotional balance, mood, creativity and intuition. Positive = optimistic, negative = sensitive and introverted." },
            { term: "Mental Biorhythm (33 days)", desc: "Reflects mental sharpness, concentration, memory and analytical thinking. Positive = mentally active, negative = harder to focus." },
          ]},
          { cat: t("guide_cat_reiki"), items: [
            { term: "What is Reiki?", desc: "A Japanese energy healing method meaning \"universal life energy\". Activates the body's natural healing mechanism by placing hands on energy centers (chakras). Not medical treatment; a complementary wellness practice." },
            { term: "Chakra Therapy", desc: "60-second sessions in Sakin that help you focus on your chosen chakra by placing your hand on the area, closing your eyes and breathing." },
            { term: "Healing Search", desc: "An AI-powered analysis tool that combines Reiki wisdom, Louise Hay's mental-emotional cause mapping and chakra theory to provide personalized insights." },
            { term: "Louise Hay Method", desc: "An approach examining mental and emotional causes underlying physical ailments. For example, headaches linked to \"self-invalidation\", back pain to \"lack of emotional support\"." },
            { term: "Inner Mirror", desc: "AI analysis tool that lets you discover inner causes by writing about your physical complaints or emotional states." },
          ]},
          { cat: t("guide_cat_app"), items: [
            { term: "Morning Intention", desc: "The practice of starting each day with a conscious intention. You set the day's focus point with a short sentence or word." },
            { term: "3 Word Selection", desc: "Choose 3 power words from 12 options (peace, flow, courage, patience, clarity, love, strength, balance, freedom, joy, gratitude, trust) to set the day's energy direction." },
            { term: "Breath Exercise (4-1.5-3.5)", desc: "Inhale (4s) → Hold (1.5s) → Exhale (3.5s) → Rest rhythm. Activates the parasympathetic nervous system to reduce stress and improve focus." },
            { term: "Daily Reminders", desc: "10 micro practices throughout the day: mirror gazing, drinking water, breath awareness, body exercise, feeling the sun, hugging a tree, touching earth, looking at sky, chakra moment, social media break." },
            { term: "Evening Close", desc: "A ritual to consciously close the day. Extract your awareness summary with \"What did you learn today?\" and \"Gratitude?\" questions." },
            { term: "Weekly Inner Map", desc: "Summary screen showing the week's stats: most active chakra, total breaths, intention words and mindful moments. AI report creates a weekly insight synthesis." },
            { term: "Birth Profile", desc: "Your personal energy map calculated from your birth date and time: zodiac sign, life path number, personal year, ascendant, 12th house analysis and weekly biorhythm graph." },
          ]},
        ];

        return (
          <div style={{ position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:99999,background:"rgba(0,0,0,0.97)",backdropFilter:"blur(30px)",overflowY:"auto",animation:"fadeIn 0.3s ease" }}>
            <div style={{ maxWidth:540,margin:"0 auto",padding:"24px 20px 60px" }}>
              {/* Header */}
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
                <div>
                  <div style={{ fontFamily:"'Jost',sans-serif",fontSize:13,fontWeight:300,letterSpacing:4,color:"#777777",textTransform:"uppercase",marginBottom:4 }}>{t("guide_help_sub")}</div>
                  <div style={{ fontFamily:"'Inter',sans-serif",fontSize:22,fontWeight:300,color:"#ffffff",letterSpacing:2 }}>{t("guide_help_title")}</div>
                </div>
                <button onClick={() => setShowKilavuz(false)} style={{ background:"rgba(192,57,43,0.15)",border:"1px solid rgba(192,57,43,0.3)",borderRadius:100,padding:"8px 20px",cursor:"pointer",color:"#e8a0a0",fontFamily:"'Jost',sans-serif",fontSize:13,letterSpacing:2,textTransform:"uppercase",transition:"all 0.2s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.background="rgba(192,57,43,0.3)"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background="rgba(192,57,43,0.15)"; }}
                >{t("guide_close")}</button>
              </div>
              <div style={{ height:1,background:"linear-gradient(90deg,transparent,rgba(192,57,43,0.3),transparent)",margin:"18px 0 28px" }} />

              {/* Categories */}
              {glossary.map((cat, ci) => (
                <div key={ci} style={{ marginBottom:32 }}>
                  <div style={{ fontFamily:"'Jost',sans-serif",fontSize:13,fontWeight:300,letterSpacing:3,textTransform:"uppercase",color:"#c0392b",marginBottom:16,display:"flex",alignItems:"center",gap:10 }}>
                    <span style={{ width:18,height:1,background:"#c0392b" }} />
                    {cat.cat}
                  </div>
                  {cat.items.map((item, ii) => (
                    <div key={ii} style={{ marginBottom:18,padding:"16px 18px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,transition:"all 0.2s" }}>
                      <div style={{ fontFamily:"'Jost',sans-serif",fontSize:14,fontWeight:400,color:"#ffffff",letterSpacing:0.5,marginBottom:8 }}>{item.term}</div>
                      <div style={{ fontFamily:"'Inter',sans-serif",fontSize:14,color:"#bbbbbb",lineHeight:1.9,letterSpacing:0.3 }}>{item.desc}</div>
                      {item.examples && (
                        <div style={{ marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                          {item.examples.map((ex, ei) => (
                            <div key={ei} style={{ display:"flex",gap:10,marginBottom:8,alignItems:"flex-start" }}>
                              <span style={{ fontFamily:"'Jost',sans-serif",fontSize:13,fontWeight:400,color:"#c0392b",minWidth:28,flexShrink:0,background:"rgba(192,57,43,0.1)",borderRadius:6,padding:"2px 6px",textAlign:"center" }}>{ex.num}</span>
                              <span style={{ fontFamily:"'Inter',sans-serif",fontSize:14,color:"#666666",lineHeight:1.75 }}>{ex.meaning}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              <div style={{ textAlign:"center",padding:"20px 0" }}>
                <button onClick={() => setShowKilavuz(false)} style={{ background:"linear-gradient(135deg,rgba(192,57,43,0.4),rgba(192,57,43,0.25))",border:"1px solid rgba(192,57,43,0.35)",borderRadius:100,padding:"12px 36px",cursor:"pointer",color:"#cccccc",fontFamily:"'Jost',sans-serif",fontSize:14,letterSpacing:2.5,textTransform:"uppercase",transition:"all 0.2s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.background="linear-gradient(135deg,rgba(192,57,43,0.6),rgba(192,57,43,0.4))"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background="linear-gradient(135deg,rgba(192,57,43,0.4),rgba(192,57,43,0.25))"; }}
                >{t("guide_close")}</button>
              </div>
            </div>
          </div>
        );
      })()}

      {offlineMsg && (
        <div style={{ position:"fixed",bottom:"calc(120px + var(--sab))",left:"50%",transform:"translateX(-50%)",zIndex:99999,background:"rgba(192,57,43,0.9)",borderRadius:14,padding:"12px 24px",maxWidth:340,textAlign:"center",backdropFilter:"blur(8px)",animation:"fadeUp 0.3s ease" }}>
          <span style={{ fontFamily:"'Jost',sans-serif",fontSize:13,color:"#fff",letterSpacing:0.5 }}>{offlineMsg}</span>
        </div>
      )}

      {/* LİSANS AKTİVASYON MODALI */}
      {showLicenseModal && (
        <div style={{ position:"fixed",inset:0,zIndex:99999,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(6px)" }}
          onClick={() => setShowLicenseModal(false)}>
          <div style={{ background:"linear-gradient(145deg,#141828,#0e1220)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:20,padding:"32px 28px",maxWidth:400,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ textAlign:"center",marginBottom:20 }}>
              <div style={{ position:"relative",width:48,height:48,margin:"0 auto 12px" }}>
                <svg viewBox="0 0 48 48" width="48" height="48">
                  <rect x="8" y="8" width="32" height="32" rx="6" fill="none" stroke="rgba(184,164,216,0.5)" strokeWidth="2"/>
                  <circle cx="24" cy="24" r="4" fill="rgba(184,164,216,0.8)"/>
                </svg>
              </div>
              <h3 style={{ fontFamily:"'Jost',sans-serif",fontSize:16,fontWeight:500,color:"#ffffff",letterSpacing:1.5,margin:0 }}>
                {lang==="tr" ? "Lisans Aktivasyonu" : "License Activation"}
              </h3>
            </div>
            <p style={{ fontFamily:"'Inter',sans-serif",fontSize:14,color:"#999999",lineHeight:1.8,textAlign:"center",margin:"0 0 20px" }}>
              {lang==="tr" ? "Satın alma sonrası e-posta ile gelen lisans anahtarını gir." : "Enter the license key you received via email after purchase."}
            </p>
            <input
              type="text"
              className="sakin-input"
              placeholder={lang==="tr" ? "XXXXX-XXXXX-XXXXX-XXXXX" : "XXXXX-XXXXX-XXXXX-XXXXX"}
              value={licenseInput}
              onChange={e => setLicenseInput(e.target.value)}
              style={{ fontSize:15,padding:"12px 14px",marginBottom:8,textAlign:"center",letterSpacing:2,fontFamily:"monospace" }}
            />
            {licenseError && (
              <div style={{ fontSize:13,color:"#e06060",textAlign:"center",marginBottom:8 }}>{licenseError}</div>
            )}
            <button className="sakin-btn-primary"
              style={{ width:"100%",marginTop:12,fontSize:14,letterSpacing:2,padding:"13px 0",opacity:licenseLoading?0.6:1 }}
              disabled={licenseLoading}
              onClick={validateLicense}>
              {licenseLoading
                ? (lang==="tr" ? "Doğrulanıyor..." : "Validating...")
                : (lang==="tr" ? "Aktifleştir" : "Activate")}
            </button>
            <button onClick={() => setShowLicenseModal(false)}
              style={{ width:"100%",marginTop:8,padding:"10px 0",background:"transparent",border:"none",color:"#666",fontSize:13,letterSpacing:1.5,cursor:"pointer",fontFamily:"'Jost',sans-serif" }}>
              {lang==="tr" ? "Vazgeç" : "Cancel"}
            </button>
          </div>
        </div>
      )}

      {showAiConsent && (
        <div style={{ position:"fixed",inset:0,zIndex:99999,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(6px)" }}
          onClick={declineAiConsent}>
          <div style={{ background:"linear-gradient(145deg,#141828,#0e1220)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:20,padding:"32px 28px",maxWidth:400,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ textAlign:"center",marginBottom:20 }}>
              <span style={{ fontSize:28 }}>🔒</span>
              <h3 style={{ fontFamily:"'Jost',sans-serif",fontSize:16,fontWeight:500,color:"#ffffff",letterSpacing:1.5,margin:"12px 0 0" }}>{t("ai_consent_title")}</h3>
            </div>
            <p style={{ fontFamily:"'Inter',sans-serif",fontSize:14,color:"#999999",lineHeight:1.8,textAlign:"center",margin:"0 0 16px" }}>{t("ai_consent_body")}</p>
            <div style={{ background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:12,padding:"14px 16px",marginBottom:24 }}>
              <p style={{ fontFamily:"'Jost',sans-serif",fontSize:12,color:"#777777",lineHeight:1.7,margin:0,letterSpacing:0.3 }}>{t("ai_consent_data")}</p>
            </div>
            <div style={{ display:"flex",gap:12 }}>
              <button onClick={declineAiConsent}
                style={{ flex:1,padding:"13px 0",borderRadius:100,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#666666",fontFamily:"'Jost',sans-serif",fontSize:13,letterSpacing:1.5,cursor:"pointer",transition:"all 0.2s" }}>{t("ai_consent_decline")}</button>
              <button onClick={acceptAiConsent}
                style={{ flex:1,padding:"13px 0",borderRadius:100,border:"none",background:"linear-gradient(135deg,rgba(255,255,255,0.7),rgba(255,255,255,0.5))",color:"#ffffff",fontFamily:"'Jost',sans-serif",fontSize:13,fontWeight:500,letterSpacing:1.5,cursor:"pointer",transition:"all 0.2s",boxShadow:"0 4px 20px rgba(255,255,255,0.3)" }}>{t("ai_consent_accept")}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
