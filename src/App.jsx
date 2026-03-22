import { useState, useEffect, useRef } from "react";
import { makeTrans } from "./i18n";

const AI_CALL_URL = "/.netlify/functions/ai-call";

const CHAKRAS_7_TR = [
  { name:"Kök",            color:"#c0392b", pastel:"#e8a09a", desc:"Bugün yere bas. Güvende hisset.",  element:"Toprak", emoji:"🟥", hz:396 },
  { name:"Sakral",         color:"#e67e22", pastel:"#f0c27f", desc:"Bugün hisset. Akmana izin ver.",   element:"Su",     emoji:"🟧", hz:417 },
  { name:"Güneş Pleksusu", color:"#f1c40f", pastel:"#f7e18a", desc:"Bugün güçlü ol. Işığın var.",     element:"Ateş",   emoji:"🟨", hz:528 },
  { name:"Kalp",           color:"#27ae60", pastel:"#82d9a3", desc:"Bugün sevgiyle aç. Kendine de.",  element:"Hava",   emoji:"🟩", hz:639 },
  { name:"Boğaz",          color:"#2980b9", pastel:"#85c1e9", desc:"Bugün hakikatini söyle.",          element:"Ses",    emoji:"🟦", hz:741 },
  { name:"Üçüncü Göz",    color:"#8e44ad", pastel:"#c3a6d8", desc:"Bugün içeriye bak.",               element:"Işık",   emoji:"🟣", hz:852 },
  { name:"Taç",            color:"#9b59b6", pastel:"#d9b8e8", desc:"Bugün bütünle bağlan.",            element:"Evren",  emoji:"⬜", hz:963 },
];
const CHAKRAS_7_EN = [
  { name:"Root",         color:"#c0392b", pastel:"#e8a09a", desc:"Ground yourself today. Feel safe.",     element:"Earth",   emoji:"🟥", hz:396 },
  { name:"Sacral",       color:"#e67e22", pastel:"#f0c27f", desc:"Feel today. Let yourself flow.",        element:"Water",   emoji:"🟧", hz:417 },
  { name:"Solar Plexus", color:"#f1c40f", pastel:"#f7e18a", desc:"Be strong today. You have your light.", element:"Fire",    emoji:"🟨", hz:528 },
  { name:"Heart",        color:"#27ae60", pastel:"#82d9a3", desc:"Open with love today. For yourself too.",element:"Air",    emoji:"🟩", hz:639 },
  { name:"Throat",       color:"#2980b9", pastel:"#85c1e9", desc:"Speak your truth today.",               element:"Sound",   emoji:"🟦", hz:741 },
  { name:"Third Eye",    color:"#8e44ad", pastel:"#c3a6d8", desc:"Look inward today.",                    element:"Light",   emoji:"🟣", hz:852 },
  { name:"Crown",        color:"#9b59b6", pastel:"#d9b8e8", desc:"Connect with the whole today.",         element:"Universe",emoji:"⬜", hz:963 },
];
const getChakras7 = (lang) => lang === "en" ? CHAKRAS_7_EN : CHAKRAS_7_TR;
const CHAKRAS_7 = CHAKRAS_7_TR;

const CHAKRAS_22_EXTRA = [
  { name:"Yeryüzü Yıldızı", color:"#5d4037", pastel:"#bcaaa4", desc:"Toprakla bağını güçlendir.",     element:"Derinlik", emoji:"🌑" },
  { name:"Ruh",              color:"#880e4f", pastel:"#f48fb1", desc:"Ruhunun sesini duy.",             element:"Sevgi",    emoji:"💗" },
  { name:"Kabartma",         color:"#bf360c", pastel:"#ffab91", desc:"İçindeki ateşi hisset.",          element:"Dönüşüm", emoji:"🔥" },
  { name:"Diyafram",         color:"#f57f17", pastel:"#ffe082", desc:"Nefes merkezinde ol.",            element:"Akış",    emoji:"🌬" },
  { name:"Güneş",            color:"#f9a825", pastel:"#fff176", desc:"Işığını dışa vur.",               element:"Parlama", emoji:"☀️" },
  { name:"Paylaşım",         color:"#558b2f", pastel:"#aed581", desc:"Verirken büyürsün.",              element:"Bereket", emoji:"🌱" },
  { name:"Thymus",           color:"#00695c", pastel:"#80cbc4", desc:"Bağışıklığın kalbidir.",          element:"Koruma",  emoji:"🛡" },
  { name:"Ses Üstü",         color:"#0277bd", pastel:"#81d4fa", desc:"Söylenmeyeni hisset.",            element:"Sessizlik",emoji:"🎵"},
  { name:"Orion",            color:"#4527a0", pastel:"#b39ddb", desc:"Evrenle uyum kur.",               element:"Kozmik",  emoji:"⭐" },
  { name:"Alta Major",       color:"#6a1b9a", pastel:"#ce93d8", desc:"Ata bilgeliğine bağlan.",         element:"Hafıza",  emoji:"🌀" },
  { name:"Stellar Gateway",  color:"#4a148c", pastel:"#e1bee7", desc:"Işık kapısını aç.",               element:"Geçiş",   emoji:"🌟" },
  { name:"Soul Star",        color:"#1a237e", pastel:"#c5cae9", desc:"Ruhunun en yüksek hali.",         element:"Sonsuz",  emoji:"✨" },
  { name:"Causal",           color:"#311b92", pastel:"#d1c4e9", desc:"Nedenle bağ kur.",                element:"Karma",   emoji:"🔮" },
  { name:"Lunar",            color:"#1b5e20", pastel:"#a5d6a7", desc:"Ay enerjisini çek.",              element:"Döngü",   emoji:"🌙" },
  { name:"Zeta",             color:"#006064", pastel:"#80deea", desc:"Frekansını yükselt.",             element:"Titreşim",emoji:"〰️"},
];
const CHAKRAS_22_EXTRA_EN = [
  { name:"Earth Star",      color:"#5d4037", pastel:"#bcaaa4", desc:"Strengthen your connection to earth.", element:"Depth",      emoji:"🌑" },
  { name:"Soul",            color:"#880e4f", pastel:"#f48fb1", desc:"Hear the voice of your soul.",         element:"Love",       emoji:"💗" },
  { name:"Causal Body",     color:"#bf360c", pastel:"#ffab91", desc:"Feel the fire within.",                element:"Transform",  emoji:"🔥" },
  { name:"Diaphragm",       color:"#f57f17", pastel:"#ffe082", desc:"Be in your breath center.",            element:"Flow",       emoji:"🌬" },
  { name:"Solar",           color:"#f9a825", pastel:"#fff176", desc:"Shine your light outward.",            element:"Radiance",   emoji:"☀️" },
  { name:"Sharing",         color:"#558b2f", pastel:"#aed581", desc:"You grow by giving.",                  element:"Abundance",  emoji:"🌱" },
  { name:"Thymus",          color:"#00695c", pastel:"#80cbc4", desc:"It is the heart of your immunity.",    element:"Protection", emoji:"🛡" },
  { name:"Ultrasound",      color:"#0277bd", pastel:"#81d4fa", desc:"Feel the unspoken.",                   element:"Silence",    emoji:"🎵" },
  { name:"Orion",           color:"#4527a0", pastel:"#b39ddb", desc:"Align with the universe.",             element:"Cosmic",     emoji:"⭐" },
  { name:"Alta Major",      color:"#6a1b9a", pastel:"#ce93d8", desc:"Connect to ancestral wisdom.",         element:"Memory",     emoji:"🌀" },
  { name:"Stellar Gateway", color:"#4a148c", pastel:"#e1bee7", desc:"Open the gate of light.",              element:"Passage",    emoji:"🌟" },
  { name:"Soul Star",       color:"#1a237e", pastel:"#c5cae9", desc:"The highest state of your soul.",      element:"Infinite",   emoji:"✨" },
  { name:"Causal",          color:"#311b92", pastel:"#d1c4e9", desc:"Connect with the reason.",             element:"Karma",      emoji:"🔮" },
  { name:"Lunar",           color:"#1b5e20", pastel:"#a5d6a7", desc:"Draw the moon's energy.",              element:"Cycle",      emoji:"🌙" },
  { name:"Zeta",            color:"#006064", pastel:"#80deea", desc:"Raise your frequency.",                element:"Vibration",  emoji:"〰️" },
];
const getChakras22 = (lang) => [
  ...getChakras7(lang),
  ...(lang === "en" ? CHAKRAS_22_EXTRA_EN : CHAKRAS_22_EXTRA),
];
const CHAKRAS_22 = [...CHAKRAS_7, ...CHAKRAS_22_EXTRA];

const MORNING_WORDS = ["huzur","akış","cesaret","sabır","berraklık","sevgi","güç","denge","özgürlük","neşe","şükür","güven"];
const TERAPI_TOTAL = 60;

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

const REMINDERS_TR = [
  { id:"ayna",      icon:"🪞", title:"Aynada kendine bak",        subtitle:"30 saniye — gözlerinin içine bak. Sadece ol.",            duration:30,  color:"rgba(180,160,220,0.7)", borderColor:"rgba(180,160,220,0.25)", notifBody:"Aynaya git. 30 saniye boyunca sadece kendine bak." },
  { id:"su",        icon:"💧", title:"Su iç",                      subtitle:"Bir bardak su iç ve hisset.",                             duration:null,color:"rgba(72,130,200,0.7)",  borderColor:"rgba(72,130,200,0.25)",  notifBody:"Bir bardak su iç. İçerken hisset — serin, temiz, hayat." },
  { id:"nefes",     icon:"🌬", title:"Nefes farkındalığı",         subtitle:"1 dakika — sadece nefesini izle.",                        duration:60,  color:"rgba(100,160,210,0.7)", borderColor:"rgba(100,160,210,0.25)", notifBody:"Dur. Bir dakika boyunca sadece nefesini izle. Buradasın." },
  { id:"beden",     icon:"🧍", title:"Beden egzersizi",            subtitle:"Omuz çevir · Boyun esnet · Gözleri dinlendir",            duration:120, color:"rgba(100,180,130,0.7)", borderColor:"rgba(100,180,130,0.25)", notifBody:"Omuzlarını çevir, boynunu esnet, gözlerini kapat. 2 dakika beden zamanı." },
  { id:"gunes",     icon:"☀️", title:"Güneşi yüzünde hisset",     subtitle:"Dışarı çık. Yüzünü güneşe dön.",                         duration:null,color:"rgba(240,180,60,0.7)",  borderColor:"rgba(240,180,60,0.25)",  notifBody:"Güneş seni bekliyor. Yüzünü kaldır, gözlerini yum, hisset." },
  { id:"agac",      icon:"🌳", title:"Ağaca sarıl",                subtitle:"Bir ağacı bul. Kollarını aç. Kalbini değdir.",            duration:30,  color:"rgba(45,120,65,0.7)",   borderColor:"rgba(45,120,65,0.25)",   notifBody:"Dışarı çık. Bir ağacı bul. Sarıl ona — o da seni tutacak." },
  { id:"toprak",    icon:"🌍", title:"Toprağa dokun",              subtitle:"Çıplak ayak ya da avucunla toprağa değdir.",              duration:30,  color:"rgba(100,70,40,0.7)",   borderColor:"rgba(100,70,40,0.25)",   notifBody:"Ayakkabını çıkar. Toprağa bas. Yerin enerjisini hisset." },
  { id:"gok",       icon:"☁️", title:"Gökyüzüne bak",             subtitle:"Başını kaldır. Gökyüzüne bak. Sadece bak.",              duration:null,color:"rgba(80,140,200,0.7)",  borderColor:"rgba(80,140,200,0.25)",  notifBody:"Başını kaldır. Gökyüzüne bak. Sadece bak." },
  { id:"chakra_an", icon:"💜", title:"Çakra anı",                  subtitle:"Bugünkü çakranda bir an dur.",                           duration:null,color:"rgba(139,90,160,0.7)", borderColor:"rgba(139,90,160,0.25)",  notifBody:"Gözlerini yum. Bugünkü çakranı hisset. Bir nefes yeter." },
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
  { id:"chakra_an", icon:"💜", title:"Chakra moment",                  subtitle:"Pause for a moment in today's chakra.",                   duration:null,color:"rgba(139,90,160,0.7)", borderColor:"rgba(139,90,160,0.25)",  notifBody:"Close your eyes. Feel today's chakra. One breath is enough." },
  { id:"sosyal",    icon:"📵", title:"Social media break",             subtitle:"Do you really want to be here right now?",                duration:null,color:"rgba(200,80,80,0.7)",   borderColor:"rgba(200,80,80,0.25)",   notifBody:"Put the phone down. Just exist for a minute. The screen can wait, the moment can't." },
];
const getReminders = (lang) => lang === "en" ? REMINDERS_EN : REMINDERS_TR;
const REMINDERS = REMINDERS_TR;

const BREATH_MODES_CONFIG = {
  standart:    { in: 4000, hold: 1500, out: 4000,  hold2: 0,    total: 10000 },
  diyafram:    { in: 4000, hold: 0,    out: 6000,  hold2: 0,    total: 10000 },
  akciger:     { in: 5000, hold: 2000, out: 7000,  hold2: 0,    total: 14000 },
  "478":       { in: 4000, hold: 7000, out: 8000,  hold2: 0,    total: 19000 },
  kutu:        { in: 4000, hold: 4000, out: 4000,  hold2: 4000, total: 16000 },
  sakinletici: { in: 4000, hold: 2000, out: 8000,  hold2: 0,    total: 14000 },
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Jost:wght@200;300;400&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Nunito:wght@300;400&display=swap');
  * { box-sizing: border-box; }
  html, body { background: #080c14; margin: 0; padding: 0; min-height: 100%; overflow-x: hidden; }

  /* ── Animations ── */
  @keyframes twinkle     { 0%,100%{opacity:0.05} 50%{opacity:0.45} }
  @keyframes fadeUp      { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn      { from{opacity:0} to{opacity:1} }
  @keyframes glow        { 0%,100%{box-shadow:0 0 22px rgba(139,90,160,0.22)} 50%{box-shadow:0 0 46px rgba(139,90,160,0.46)} }
  @keyframes pulse       { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
  @keyframes sunrise     { from{opacity:0;transform:scale(0.9) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes ringPulse   { 0%,100%{opacity:0.07;transform:scale(1)} 50%{opacity:0.2;transform:scale(1.04)} }
  @keyframes heartbeat   { 0%,100%{transform:scale(1)} 14%{transform:scale(1.07)} 28%{transform:scale(1)} 42%{transform:scale(1.04)} }
  @keyframes slowPulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
  @keyframes floatUp     { 0%{opacity:0;transform:translate(0,0) scale(0.4)} 20%{opacity:1} 80%{opacity:0.5} 100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(1.3)} }
  @keyframes energyFill  { 0%{background-position:100% 50%} 100%{background-position:0% 50%} }
  @keyframes pillGlow    { 0%,100%{box-shadow:0 0 8px rgba(139,90,160,0.4),0 0 22px rgba(100,60,200,0.18),inset 0 0 8px rgba(139,90,160,0.12)} 50%{box-shadow:0 0 18px rgba(180,100,255,0.7),0 0 44px rgba(100,60,200,0.38),inset 0 0 14px rgba(180,100,255,0.22)} }
  @keyframes pillShimmer { 0%{transform:translateX(-100%) skewX(-20deg)} 100%{transform:translateX(250%) skewX(-20deg)} }
  @keyframes handFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
  @keyframes doneGlow    { 0%,100%{box-shadow:0 0 40px #4ade8088,0 0 80px #4ade8033} 50%{box-shadow:0 0 70px #4ade80bb,0 0 140px #4ade8055} }
  @keyframes sparkle     { 0%{transform:scale(0) rotate(0deg);opacity:1} 100%{transform:scale(1.6) rotate(180deg);opacity:0} }
  @keyframes slideIn     { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
  @keyframes checkPop    { 0%{transform:scale(0)} 70%{transform:scale(1.3)} 100%{transform:scale(1)} }
  @keyframes diamondSpin { 0%{transform:rotate(0deg) scale(1)} 50%{transform:rotate(180deg) scale(1.06)} 100%{transform:rotate(360deg) scale(1)} }
  @keyframes mandalaRotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes petalGlow { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.4)} }
  @keyframes streakFire { 0%,100%{text-shadow:0 0 8px rgba(255,140,50,0.4)} 50%{text-shadow:0 0 18px rgba(255,140,50,0.8),0 0 36px rgba(255,80,0,0.3)} }
  @keyframes badgeUnlock { 0%{transform:scale(0) rotate(-30deg);opacity:0} 60%{transform:scale(1.2) rotate(5deg);opacity:1} 100%{transform:scale(1) rotate(0deg);opacity:1} }
  @keyframes sliceGlow   { 0%,100%{opacity:0.7} 50%{opacity:1} }
  @keyframes navPulse    { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.07)} }
  @keyframes sliceUnlock { 0%{opacity:0;transform:scale(0.85)} 70%{opacity:1;transform:scale(1.03)} 100%{opacity:1;transform:scale(1)} }

  .fade-up  { animation: fadeUp  0.75s cubic-bezier(0.16,1,0.3,1) forwards; }
  .slide-in { animation: slideIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }

  /* ── Typography helpers ── */
  .label-sm {
    font-family:'Jost',sans-serif; font-size:10px; font-weight:300;
    letter-spacing:3.5px; text-transform:uppercase; color:#4a5570;
  }
  .label-md {
    font-family:'Jost',sans-serif; font-size:12px; font-weight:300;
    letter-spacing:3px; text-transform:uppercase;
  }

  /* ── Top nav ── */
  .top-nav {
    position:fixed; top:0; left:0; right:0; z-index:9999;
    display:flex; align-items:center; justify-content:flex-start; gap:0;
    padding:0 4px; height:44px;
    background:#080c14; border-bottom:1px solid rgba(255,255,255,0.07);
    overflow-x:auto; overflow-y:hidden;
    -webkit-overflow-scrolling:touch; scroll-behavior:smooth;
  }
  .top-nav::-webkit-scrollbar { display:none; }
  .top-nav-btn {
    background:transparent; border:none; cursor:pointer;
    font-family:'Jost',sans-serif; font-weight:300;
    font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#6a6d88;
    padding:0 10px; height:44px; transition:all 0.2s;
    white-space:nowrap; flex-shrink:0; position:relative;
  }
  @media (max-width:390px) {
    .top-nav-btn { font-size:10px; letter-spacing:1.5px; padding:0 7px; }
  }
  .top-nav-btn::after {
    content:''; position:absolute; bottom:0; left:50%; transform:translateX(-50%);
    width:0; height:1px; background:#b8a4d8; transition:width 0.25s;
  }
  .top-nav-btn:hover { color:#c8c0e0; }
  .top-nav-btn:hover::after { width:60%; }
  .top-nav-btn.active { color:#c8b8e8; }
  .top-nav-btn.active::after { width:60%; }

  /* ── Inputs ── */
  .sakin-input {
    background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08);
    border-radius:10px; color:#ddd8f0;
    font-family:'Cormorant Garamond',Georgia,serif; font-size:18px;
    padding:14px 16px; width:100%; resize:none; outline:none; transition:border-color 0.25s;
    line-height:1.65;
  }
  .sakin-input::placeholder { color:#3a4058; }
  .sakin-input:focus { border-color:rgba(184,164,216,0.3); background:rgba(255,255,255,0.045); }

  /* ── Buttons ── */
  .sakin-btn {
    background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);
    border-radius:100px; color:#b0aac8; cursor:pointer;
    font-family:'Jost',sans-serif; font-weight:300;
    font-size:12px; letter-spacing:2.5px; text-transform:uppercase;
    padding:11px 24px; transition:all 0.22s;
  }
  .sakin-btn:hover { background:rgba(255,255,255,0.1); color:#ddd8f0; border-color:rgba(255,255,255,0.2); }
  .sakin-btn-primary {
    background:linear-gradient(135deg,rgba(122,80,150,0.5),rgba(60,100,160,0.45));
    border:1px solid rgba(184,164,216,0.25); border-radius:100px; color:#ddd8f0; cursor:pointer;
    font-family:'Jost',sans-serif; font-weight:300;
    font-size:12px; letter-spacing:2.5px; text-transform:uppercase;
    padding:13px 38px; transition:all 0.25s;
  }
  .sakin-btn-primary:hover {
    background:linear-gradient(135deg,rgba(122,80,150,0.75),rgba(60,100,160,0.7));
    border-color:rgba(184,164,216,0.45); transform:translateY(-1px);
    box-shadow:0 6px 24px rgba(122,80,150,0.22);
  }

  /* ── Word chips ── */
  .word-chip {
    border-radius:6px; border:1px solid rgba(255,255,255,0.08); cursor:pointer;
    font-family:'Jost',sans-serif; font-weight:300;
    font-size:13px; letter-spacing:1px; padding:8px 16px; transition:all 0.2s;
    background:transparent; color:#6a6d88;
  }
  .word-chip:hover { border-color:rgba(184,164,216,0.3); color:#c0b8d8; background:rgba(184,164,216,0.05); }
  .word-chip.selected { background:rgba(184,164,216,0.18); border-color:rgba(184,164,216,0.6); color:#f0ecff; box-shadow:0 0 8px rgba(184,164,216,0.2); }

  /* ── Chakra cards ── */
  .chakra-card {
    border-radius:12px; border:1px solid rgba(255,255,255,0.05);
    padding:14px 16px; cursor:pointer; transition:all 0.2s;
    background:rgba(255,255,255,0.02); display:flex; align-items:center; gap:14px;
  }
  .chakra-card:hover { background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.12); }
  .chakra-card.active { border-color:rgba(184,164,216,0.3); background:rgba(184,164,216,0.06); }

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
    border-radius:14px; border:1px solid rgba(255,255,255,0.05);
    padding:17px 18px; background:rgba(255,255,255,0.02);
    transition:all 0.22s; margin-bottom:9px;
    display:flex; align-items:flex-start; gap:14px;
  }
  .rem-card.done { opacity:0.38; }
  .rem-card:hover { background:rgba(255,255,255,0.04); border-color:rgba(255,255,255,0.09); }
  .check-btn {
    width:36px; height:36px; border-radius:8px; flex-shrink:0; margin-top:0;
    border:1px solid rgba(255,255,255,0.14); background:transparent;
    cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center;
    font-size:15px;
  }
  .check-btn.checked { background:rgba(100,200,120,0.2); border-color:rgba(100,200,120,0.5); animation:checkPop 0.3s ease; }
  .notif-btn {
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
    border-radius:100px; color:#6a6d88; cursor:pointer;
    font-family:'Jost',sans-serif; font-weight:300;
    font-size:11px; letter-spacing:1.5px; text-transform:uppercase;
    padding:8px 14px; transition:all 0.2s; white-space:nowrap; flex-shrink:0; min-height:36px;
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
    font-family:'Jost',sans-serif; font-weight:200; font-size:27px;
    letter-spacing:5px; text-transform:uppercase; margin-bottom:6px; color:#ddd8f0;
  }
  .policy-screen .subtitle {
    font-family:'Jost',sans-serif; font-size:11px; font-weight:300;
    letter-spacing:2.5px; text-transform:uppercase; color:#4a5068; margin-bottom:42px;
  }
  .policy-screen h2 {
    font-family:'Jost',sans-serif; font-size:12px; font-weight:400;
    letter-spacing:2.5px; text-transform:uppercase; color:#8a72a8;
    margin:34px 0 12px; padding-bottom:8px;
    border-bottom:1px solid rgba(138,114,168,0.15);
  }
  .policy-screen p {
    font-family:'Cormorant Garamond',Georgia,serif; font-size:16px;
    color:#9a96b0; line-height:2; margin-bottom:12px;
  }
  .policy-screen ul { list-style:none; padding:0; margin:0 0 12px; }
  .policy-screen ul li {
    font-family:'Cormorant Garamond',Georgia,serif; font-size:16px;
    color:#9a96b0; line-height:2; padding-left:18px; position:relative;
  }
  .policy-screen ul li::before {
    content:"—"; position:absolute; left:0; font-size:12px; color:#5a4a78; top:2px;
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
    font-size:11px; letter-spacing:2px; text-transform:uppercase;
    padding:5px 12px; border-radius:100px; margin-bottom:11px;
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
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#5a6a7a", cursor:"pointer", fontSize:19, padding:"10px 12px 10px 4px", marginLeft:-4 }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:10, letterSpacing:5, color:"#4a5a6a" }}>{t("day_label")}</div>
          <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:21, fontWeight:300, letterSpacing:1.5 }}>{t("reminders_title")}</div>
        </div>
        <div style={{
          background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
          borderRadius:100, padding:"5px 14px", fontSize:13, color:"#8a9aaa", letterSpacing:1,
        }}>{completedCount} / {REMINDERS.length}</div>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#3a4a5a", cursor:"pointer", fontSize:20, lineHeight:1, padding:"8px 4px 8px 8px" }}>✕</button>
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
              <button className={`check-btn ${isDone?"checked":""}`} onClick={() => toggleDone(rem.id)}>
                {isDone ? "✓" : ""}
              </button>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3, minWidth:0 }}>
                  <span style={{ fontSize:19, flexShrink:0 }}>{rem.icon}</span>
                  <span style={{ fontSize:15, letterSpacing:0.3, color:isDone?"#6a7a8a":"#e8e0d5", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", minWidth:0 }}>{rem.title}</span>
                </div>
                <div style={{ fontSize:12, color:"#5a6a7a", lineHeight:1.5, marginBottom:rem.duration?8:0 }}>{rem.subtitle}</div>
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
                      borderRadius:100, color:isTiming?"#e8e0d5":"#5a6a7a",
                      cursor:"pointer", fontSize:11, letterSpacing:1.5,
                      padding:"4px 12px", transition:"all 0.22s",
                      fontFamily:"'Cormorant Garamond',Georgia,serif",
                    }}>
                      {isTiming ? `${mm}:${ss} ■` : `▶ ${mm}:${ss}`}
                    </button>
                  </div>
                )}
              </div>
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
          <div style={{ fontSize:29, marginBottom:8 }}>🌿</div>
          <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:19, color:"#82d9a3", letterSpacing:1 }}>
            {t("all_done_msg")}
          </div>
        </div>
      )}

    </div>
  );
}

function TerapiScreen({ onBack, lang = "tr" }) {
  const t = makeTrans(lang);
  const CHAKRAS_22 = getChakras22(lang);
  const [tPhase,   setTPhase]   = useState("list");
  const [selected, setSelected] = useState(null);
  const [elapsed,  setElapsed]  = useState(0);
  const [particles,setParticles]= useState([]);
  const timerRef    = useRef(null);
  const particleRef = useRef(null);
  const chimeCxtRef = useRef(null);


  const progress     = Math.min(elapsed/TERAPI_TOTAL,1);
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
    timerRef.current = setInterval(() => {
      setElapsed(e => {
        const next = e + 1;
        if (next === 5) setShowCloseEyes(true);
        // Bağlantı öncesi uyarı: kalan 7, 5, 3. saniyede yükselen çan
        const rem = TERAPI_TOTAL - next;
        if (rem === 7) playChime(396, 0.14, 2.0);
        if (rem === 5) playChime(432, 0.16, 2.0);
        if (rem === 3) playChime(528, 0.18, 2.2);
        // 60. saniyede "connected" fazına geç ama timer durma
        if (next === TERAPI_TOTAL) setTPhase("connected");
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
        const msg = t("connected_voice", selected.name);
        const utt = new SpeechSynthesisUtterance(msg);
        utt.lang = lang === "tr" ? "tr-TR" : "en-US";
        utt.rate = 0.82;
        utt.pitch = 0.95;
        utt.volume = 0.88;
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
    // iOS Safari: AudioContext must be created synchronously inside user gesture
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    ctx.resume();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 1.5);
    gain.connect(ctx.destination);
    gainRef.current = gain;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = hz;
    osc.connect(gain);
    osc.start();
    oscRef.current = osc;
    setToneOn(true);
  };

  const resetTerapi = () => { stopTone(); if ("speechSynthesis" in window) window.speechSynthesis.cancel(); setTPhase("list"); setSelected(null); setElapsed(0); setParticles([]); setShowBackConfirm(false); setShowCloseEyes(false); clearInterval(timerRef.current); clearInterval(particleRef.current); try { chimeCxtRef.current?.close(); } catch(_){} chimeCxtRef.current = null; };
  const heartAnim = tPhase==="active" ? `heartbeat ${1.15-progress*0.28}s ease-in-out infinite` : "none";
  const hex = v => Math.round(v*255).toString(16).padStart(2,"0");

  if (tPhase==="list") return (
    <div style={{ maxWidth:440, width:"100%", padding:"62px 20px 120px", position:"relative", zIndex:1 }}>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:28 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#5a6a7a", cursor:"pointer", fontSize:19, padding:"10px 12px 10px 4px", marginLeft:-4 }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:10, letterSpacing:5, color:"#4a5a6a" }}>{t("reiki_label")}</div>
          <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:22, fontWeight:300, letterSpacing:2 }}>{t("therapy_title")}</div>
        </div>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#3a4a5a", cursor:"pointer", fontSize:20, lineHeight:1, padding:"8px 4px 8px 8px" }}>✕</button>
      </div>
      <div style={{ paddingRight:4, scrollbarWidth:"none" }}>
        {CHAKRAS_22.map((c,i) => (
          <div key={c.name} className={`chakra-card slide-in ${selected?.name===c.name?"active":""}`}
            style={{ marginBottom:8, animationDelay:`${i*0.04}s`, opacity:0 }}
            onClick={() => { setSelected(c); setTPhase("intro"); }}>
            <div style={{ width:34,height:34,borderRadius:"50%",flexShrink:0, background:`radial-gradient(circle,${c.color}cc,${c.color}44)`, boxShadow:`0 0 10px ${c.color}55` }} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, letterSpacing:0.5, marginBottom:2 }}>{c.name}</div>
              <div style={{ fontSize:12, color:"#5a6a7a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.element} · {c.desc}</div>
            </div>
            {i<7 && <div style={{ fontSize:9,letterSpacing:2,color:"#4a5a6a",flexShrink:0 }}>{t("core_badge")}</div>}
          </div>
        ))}
      </div>
      {selected && (
        <div style={{ marginTop:18, background:`linear-gradient(135deg,${selected.color}18,transparent)`, border:`1px solid ${selected.color}44`, borderRadius:15, padding:"14px 18px", display:"flex",alignItems:"center",justifyContent:"space-between",gap:14 }}>
          <div>
            <div style={{ fontSize:11,letterSpacing:3,color:selected.pastel,marginBottom:3 }}>{t("selected_label")}</div>
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
    const HP = {
      "Kök":{hy:83,lx:57,rx:91},"Sakral":{hy:77,lx:59,rx:89},
      "Güneş Pleksusu":{hy:68,lx:60,rx:88},"Kalp":{hy:57,lx:61,rx:87},
      "Boğaz":{hy:37,lx:68,rx:80},"Üçüncü Göz":{hy:17,lx:66,rx:82},
      "Taç":{hy:10,lx:67,rx:81},"Yeryüzü Yıldızı":{hy:116,lx:63,rx:85},
      "Ruh":{hy:57,lx:61,rx:87},"Kabartma":{hy:63,lx:60,rx:88},
      "Diyafram":{hy:73,lx:59,rx:89},"Güneş":{hy:57,lx:61,rx:87},
      "Paylaşım":{hy:57,lx:61,rx:87},"Thymus":{hy:49,lx:62,rx:86},
      "Ses Üstü":{hy:42,lx:66,rx:82},"Orion":{hy:19,lx:65,rx:83},
      "Alta Major":{hy:22,lx:65,rx:83},"Stellar Gateway":{hy:6,lx:67,rx:81},
      "Soul Star":{hy:6,lx:67,rx:81},"Causal":{hy:19,lx:65,rx:83},
      "Lunar":{hy:77,lx:59,rx:89},"Zeta":{hy:63,lx:60,rx:88},
    };
    const {hy=57,lx=61,rx=87}=HP[c.name]||{};
    const up=hy<49; const my=(49+hy)/2;
    const lArm=up?`M53 49 Q55 ${my} ${lx} ${hy}`:`M53 49 Q37 ${my} ${lx} ${hy}`;
    const rArm=up?`M95 49 Q93 ${my} ${rx} ${hy}`:`M95 49 Q111 ${my} ${rx} ${hy}`;
    const cl=c.pastel, cg=c.color;
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
        <div style={{ fontSize:10,letterSpacing:6,color:"#3a4a5a" }}>{t("reiki_chakra_label")}</div>
        <div style={{ width:38,height:1,background:`${selected.color}44`,margin:"10px auto" }} />
      </div>
      <div style={{ width:108,height:108,borderRadius:"50%",margin:"0 auto 20px", background:`radial-gradient(circle,${selected.color}cc,${selected.color}33)`, boxShadow:`0 0 40px ${selected.color}66,0 0 80px ${selected.color}22`, animation:"slowPulse 3.8s ease-in-out infinite" }} />
      <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:24,fontWeight:300,letterSpacing:1,marginBottom:6 }}>{selected.name} {t("chakra_suf")}</div>
      <div style={{ fontSize:11,letterSpacing:3,color:selected.pastel,marginBottom:16 }}>{selected.element.toUpperCase()}</div>
      {selected.hz && (
        <button onClick={() => toggleTone(selected.hz)} style={{ marginBottom:20,background:toneOn?`${selected.color}33`:"transparent",border:`1px solid ${selected.color}66`,borderRadius:20,padding:"6px 18px",color:selected.pastel,fontSize:11,letterSpacing:3,cursor:"pointer",transition:"all 0.3s" }}>
          {toneOn ? "⏹" : "▶"} {selected.hz} Hz
        </button>
      )}
      {/* Pozisyon göstergesi */}
      <div style={{ marginBottom:6,opacity:0.8 }}>{positionSvg(selected)}</div>
      <div style={{ fontSize:12,color:"#5a6a7a",letterSpacing:1,marginBottom:28,fontStyle:"italic" }}>
        {t("intro_place_hand", selected.name)}
      </div>
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
            <div style={{ fontSize:32,marginBottom:18 }}>🌿</div>
            <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:23,fontWeight:300,letterSpacing:1,color:"#e8e0d5",marginBottom:10,lineHeight:1.5 }}>
              {t("sure_title")}
            </div>
            <div style={{ fontSize:14,color:"#7a8a9a",lineHeight:1.8,marginBottom:32,fontStyle:"italic" }}>
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
        <button onClick={()=>{ if(tPhase==="connected") resetTerapi(); else setShowBackConfirm(true); }} style={{ background:"none",border:"none",color:"#3a4a5a",cursor:"pointer",fontSize:19,padding:"10px 12px 10px 4px",marginLeft:-4,letterSpacing:1 }}>←</button>
      </div>
      <div style={{ fontSize:10,letterSpacing:5,color:"#3a4a5a",marginBottom:24 }}>{selected.name.toUpperCase()} · {selected.element.toUpperCase()}</div>
      <div style={{ position:"relative",width:230,height:230,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:22 }}>
        {[2.15,1.8,1.5,1.25].map((s,i) => (
          <div key={i} className="ring" style={{ width:230,height:230,transform:`scale(${s})`,animationDelay:`${i*0.55}s`,animationDuration:`${3+i*0.4}s`,borderColor:`${selected.color}${hex(0.13-i*0.025)}` }} />
        ))}
        <svg width="230" height="230" style={{ position:"absolute",transform:"rotate(-90deg)" }}>
          <circle cx="115" cy="115" r="96" fill="none" stroke={`${selected.color}22`} strokeWidth="2" />
          <circle cx="115" cy="115" r="96" fill="none" stroke={selected.pastel} strokeWidth="2.5" strokeLinecap="round"
            strokeDasharray={`${2*Math.PI*96}`} strokeDashoffset={`${2*Math.PI*96*(1-progress)}`}
            style={{ transition:"stroke-dashoffset 1s linear" }} />
        </svg>
        <div style={{
          width:136,height:136,borderRadius:"50%",
          background:`radial-gradient(circle at 40% 38%,${selected.color}${hex(0.18+progress*0.22)},${selected.color}44,rgba(4,8,16,0.5))`,
          boxShadow:`0 0 ${28+progress*52}px ${selected.color}${hex(0.28+progress*0.3)},0 0 ${55+progress*85}px ${selected.color}${hex(0.1+progress*0.15)}`,
          border:`1px solid ${selected.pastel}${hex(0.2+progress*0.32)}`,
          animation:`slowPulse ${3.2-progress*0.8}s ease-in-out infinite`,
        }} />
        {particles.map(p => (
          <div key={p.id} className="particle" style={{ left:`${p.x}%`,top:`${p.y}%`,width:p.size,height:p.size,"--dx":`${p.dx}px`,"--dy":`${p.dy}px`,"--dur":`${p.dur}s`,background:`radial-gradient(circle,${selected.pastel},${selected.color}88)` }} />
        ))}
      </div>
      <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:52,fontWeight:300,letterSpacing:4,lineHeight:1,color:selected.pastel,textShadow:`0 0 ${20+progress*32}px ${selected.color}88`,marginBottom:4 }}>{displayMins}:{displaySecs}</div>
      {tPhase==="connected"
        ? <div style={{ fontSize:9,letterSpacing:4,color:selected.pastel,marginBottom:12,animation:"fadeIn 1.5s ease forwards" }}>{t("connected_label")}</div>
        : <div style={{ fontSize:10,letterSpacing:4,color:"#3a4a5a",marginBottom:12 }}>{t("pct_loaded", Math.round(progress*100))}</div>
      }
      {selected.hz && (
        <button onClick={() => toggleTone(selected.hz)} style={{ marginBottom:16,background:toneOn?`${selected.color}33`:"transparent",border:`1px solid ${selected.color}${toneOn?"99":"44"}`,borderRadius:20,padding:"5px 16px",color:toneOn?selected.pastel:"#4a5a6a",fontSize:10,letterSpacing:3,cursor:"pointer",transition:"all 0.3s" }}>
          {toneOn ? "⏹" : "▶"} {selected.hz} Hz
        </button>
      )}
      <div style={{ marginBottom:18,opacity:0.65+progress*0.35 }}>
        {positionSvg(selected, progress)}
      </div>
      {showCloseEyes && (
        <div style={{ fontSize:12,color:selected.pastel,letterSpacing:1.5,fontStyle:"italic",marginBottom:10,animation:"fadeIn 1.2s ease forwards",opacity:0 }}>
          {t("close_eyes_hint")}
        </div>
      )}
      <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:16,fontStyle:"italic",color:`${selected.pastel}${hex(0.38+progress*0.55)}`,letterSpacing:0.5,textAlign:"center",lineHeight:1.9,maxWidth:270 }}>
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
        <div key={i} style={{ position:"absolute",left:`${10+i*9}%`,top:`${10+(i%4)*18}%`,fontSize:12,color:selected.pastel,animation:`sparkle ${0.7+i*0.18}s ease-out forwards`,animationDelay:`${i*0.09}s` }}>✦</div>
      ))}
      <div style={{ width:126,height:126,borderRadius:"50%",margin:"0 auto 26px",background:`radial-gradient(circle,${selected.color}44,${selected.color}11)`,boxShadow:`0 0 40px ${selected.color}88,0 0 80px ${selected.color}33`,animation:"slowPulse 3.5s ease-in-out infinite" }} />
      <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:29,fontWeight:300,letterSpacing:2,marginBottom:8,color:selected.pastel }}>{t("done_title")}</div>
      <div style={{ fontSize:14,color:"#5a6a7a",marginBottom:36,fontStyle:"italic",lineHeight:1.8 }}>
        {t("done_body", selected.name).split("\n").map((l,i)=><span key={i}>{l}{i===0&&<br/>}</span>)}
      </div>
      <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
        <button className="sakin-btn" onClick={resetTerapi}>{t("other_chakra")}</button>
        <button className="sakin-btn" onClick={onBack}>{t("main_screen")}</button>
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
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    gain.connect(ctx.destination);
    [[1, 1], [2.76, 0.28], [5.4, 0.10]].forEach(([ratio, amp]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = hz * ratio;
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.18 * amp, ctx.currentTime + 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      o.connect(g); g.connect(ctx.destination);
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
    <div style={{ marginBottom:24,background:"linear-gradient(160deg,rgba(10,4,30,0.92),rgba(15,8,40,0.88))",border:`1px solid ${renk}33`,borderRadius:20,padding:"22px 20px",backdropFilter:"blur(20px)",boxShadow:`0 0 40px ${renk}15, inset 0 1px 0 rgba(255,255,255,0.04)` }}>
      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:18 }}>
        <div style={{ width:36,height:36,borderRadius:"50%",background:`radial-gradient(circle,${renk}30,transparent)`,border:`1px solid ${renk}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0 }}>{simge}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11,letterSpacing:3,color:renk,opacity:0.9 }}>{baslik.toUpperCase()}</div>
          <div style={{ fontSize:11,color:"#3a2a5a",marginTop:2,letterSpacing:1 }}>{aciklama}</div>
        </div>
      </div>
      {analiz === "__loading__" ? (
        <div style={{ textAlign:"center",padding:"24px 0" }}>
          <div style={{ fontSize:19,marginBottom:10,animation:"pulse 2s ease-in-out infinite" }}>{simge}</div>
          <div style={{ fontSize:10,letterSpacing:4,color:renk,opacity:0.7,animation:"pulse 1.5s ease-in-out infinite" }}>{t("reading")}</div>
        </div>
      ) : analiz ? (
        <div>
          <div style={{ fontSize:10,letterSpacing:2.5,color:renk,opacity:0.8,marginBottom:12 }}>{value.toUpperCase()} {t("analysis_suf")}</div>
          <div style={{ fontSize:15,color:"#ccc0e0",lineHeight:1.9,whiteSpace:"pre-wrap",fontFamily:"'Nunito','Jost',sans-serif",fontWeight:300,letterSpacing:0.3 }}><FreqText text={analiz} onNav={onNav} /></div>
          <div style={{ display:"flex",gap:8,marginTop:18,flexWrap:"wrap",alignItems:"center" }}>
            <button onClick={onSifirla}
              style={{ background:"none",border:`1px solid ${renk}30`,borderRadius:20,color:renk,opacity:0.7,cursor:"pointer",fontSize:10,letterSpacing:2.5,padding:"6px 16px" }}>
              {t("btn_new_search")}
            </button>
            <a href="/fiyatlandirma"
              style={{ display:"inline-block",padding:"6px 16px",background:`linear-gradient(135deg,${renk}22,${renk}11)`,border:`1px solid ${renk}44`,borderRadius:20,color:renk,fontSize:10,letterSpacing:2,textDecoration:"none",cursor:"pointer" }}>
              {lang==="tr" ? "Daha Fazlası → Premium" : "More → Premium"}
            </a>
          </div>
        </div>
      ) : (
        <div>
          {/* Soru satırı: etiket + ? butonu */}
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
            <span style={{ fontSize:10,letterSpacing:2,color:`${renk}bb` }}>
              {lang==="tr" ? "ne hissediyorsun, ne merak ediyorsun?" : "what do you feel or wonder about?"}
            </span>
            <div ref={tipRef} style={{ position:"relative" }}>
              <button
                onClick={()=>setTipAcik(v=>!v)}
                aria-label="Örnek sorular"
                style={{ width:36,height:36,borderRadius:"50%",background:`${renk}22`,border:`1px solid ${renk}44`,color:`${renk}cc`,fontSize:13,fontWeight:700,cursor:"pointer",lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.2s" }}
              >?</button>
              {tipAcik && (
                <div style={{ position:"absolute",top:"calc(100% + 8px)",right:0,width:262,background:"linear-gradient(160deg,rgba(18,6,42,0.98),rgba(12,4,30,0.96))",border:`1px solid ${renk}40`,borderRadius:14,padding:"14px 14px 10px",boxShadow:`0 8px 32px rgba(0,0,0,0.6),0 0 24px ${renk}18`,zIndex:99 }}>
                  <div style={{ fontSize:10,letterSpacing:2.5,color:`${renk}99`,marginBottom:10,textAlign:"center" }}>
                    {lang==="tr" ? "ÖRNEK SORULAR" : "EXAMPLE QUESTIONS"}
                  </div>
                  {ornekler.map((s,i)=>(
                    <button key={i} onClick={()=>{ onChange(s); setTipAcik(false); }}
                      style={{ display:"block",width:"100%",textAlign:"left",background:"none",border:"none",borderBottom:i<ornekler.length-1?`1px solid ${renk}18`:"none",padding:"8px 4px",color:"#b8a8d0",fontSize:12,fontFamily:"'Cormorant Garamond',Georgia,serif",cursor:"pointer",lineHeight:1.55,letterSpacing:0.2 }}>
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
            style={{ width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.03)",border:`1px solid ${renk}25`,borderRadius:12,padding:"11px 14px",color:"#d0c8e8",fontSize:16,fontFamily:"'Cormorant Garamond',Georgia,serif",outline:"none",marginBottom:12,letterSpacing:0.5,resize:"none",lineHeight:1.75 }}
          />
          <button onClick={onAra} disabled={!value.trim()}
            style={{ width:"100%",background:value.trim()?`linear-gradient(135deg,${renk}70,${renk}40)`:`linear-gradient(135deg,${renk}25,${renk}15)`,border:`1px solid ${renk}${value.trim()?"50":"20"}`,borderRadius:12,padding:"11px",cursor:value.trim()?"pointer":"default",color:value.trim()?"#e8d8f8":"#5a4a70",fontSize:12,letterSpacing:2,fontFamily:"'Cormorant Garamond',Georgia,serif",transition:"all 0.2s" }}>
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
  const CHAKRAS_7 = getChakras7(lang);
  const URL_TO_SCREEN = { "/hakkinda":"hakkinda", "/fiyatlandirma":"fiyat", "/hizmet-sartlari":"sartlar", "/gizlilik":"gizlilik", "/iade-politikasi":"iade" };
  const SCREEN_TO_URL = { fiyat:"/fiyatlandirma", sartlar:"/hizmet-sartlari", gizlilik:"/gizlilik", iade:"/iade-politikasi" };
  const [screen,        setScreen]        = useState(()=> URL_TO_SCREEN[window.location.pathname] || "giris");
  const [niyet,         setNiyet]         = useState(()=>localStorage.getItem("sakin_niyet_"+new Date().toISOString().slice(0,10))||"");
  const [selectedWords, setSelectedWords] = useState(()=>{ try { return JSON.parse(localStorage.getItem("sakin_words_"+new Date().toISOString().slice(0,10)))||[]; } catch { return []; } });
  const [breathPhase,   setBreathPhase]   = useState("inhale");
  const [breathCount,   setBreathCount]   = useState(0);
  const [breathStarted, setBreathStarted] = useState(false);
  const [breathMode,    setBreathMode]    = useState("standart");
  const [chakra]                          = useState(CHAKRAS_7[Math.floor(Math.random()*7)]);
  const [aksamNote,     setAksamNote]     = useState("");
  const [sukur,         setSukur]         = useState("");
  const [aiRapor,       setAiRapor]       = useState("");
  const [aiLoading,     setAiLoading]     = useState(false);
  const [devMode, setDevMode] = useState(() => localStorage.getItem("sakin_dev_mode") === "1");
  const [raporKullanildi, setRaporKullanildi] = useState(() => !devMode && localStorage.getItem("sakin_rapor_used") === "1");
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
  const [showKilavuz, setShowKilavuz] = useState(false);
  // Kişiselleştirme: kullanıcının önceki sorgu geçmişini takip et
  const [sorguGecmisi, setSorguGecmisi] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sakin_sorgu_gecmisi")||"[]"); } catch { return []; }
  });

  // ── Streak & Step Tracking ──
  const todayKey = new Date().toISOString().slice(0,10);
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

  const MANDALA_STEPS = ["sabah","nefes","chakra","gun","aksam","harita"];
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

  function toggleDevMode() {
    const next = !devMode;
    if (next) {
      localStorage.setItem("sakin_dev_mode", "1");
    } else {
      localStorage.removeItem("sakin_dev_mode");
    }
    setDevMode(next);
    setRaporKullanildi(false);
    setReikiUsed(next ? true : false);
    setZihinselUsed(next ? true : false);
  }
  const [time,          setTime]          = useState(new Date());
  const [orb,           setOrb]           = useState({x:50,y:50});
  const [birthDate,      setBirthDate]      = useState(()=>localStorage.getItem("sakin_birth_date")||"");
  const [birthTime,      setBirthTime]      = useState(()=>localStorage.getItem("sakin_birth_time")||"");
  const [showBirthForm,  setShowBirthForm]  = useState(false);
  const [girisPhase,     setGirisPhase]     = useState("intro"); // "intro" | "birth"
  const [birthInput,     setBirthInput]     = useState(()=>localStorage.getItem("sakin_birth_date")||"");
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

  const astro = birthDate ? {
    yasam:      lifePathNumber(birthDate),
    kisiselYil: personalYear(birthDate),
    burc:       zodiacSign(birthDate),
    bio:        biorhythm(birthDate),
  } : null;

  const yukselen   = birthDate && birthTime ? approxAscendant(birthDate, birthTime) : null;
  const ev12Burcu  = yukselen ? ZODIAC_ORDER[(ZODIAC_ORDER.indexOf(yukselen) - 1 + 12) % 12] : null;
  const ev12Gezegen= ev12Burcu ? EV_GEZEGEN[ev12Burcu] : null;

  useEffect(() => { const t=setInterval(()=>setTime(new Date()),1000); return()=>clearInterval(t); },[]);
  useEffect(() => {
    const onPop = () => setScreen(URL_TO_SCREEN[window.location.pathname] || "giris");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (screen !== "harita") return;
    const bugun = {
      tarih: new Date().toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"}),
      _dateKey: new Date().toDateString(),
      niyet, kelimeler: selectedWords, chakra: chakra.name,
      nefes: breathCount, ogrendim: aksamNote, sukur
    };
    const log = JSON.parse(localStorage.getItem("sakin_log")||"[]");
    const filtered = log.filter(g=>g._dateKey!==bugun._dateKey);
    filtered.unshift(bugun);
    localStorage.setItem("sakin_log", JSON.stringify(filtered.slice(0,7)));
    setAiRapor("");
  },[screen]);

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
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-opus-4-6", max_tokens:1100,
          system:`Sen derin bir ayna ve enerji rehberisin. YALNIZCA Türkçe yaz; ş, ğ, ı, ü, ö, ç, Ş, Ğ, İ, Ü, Ö, Ç gibi Türkçe karakterleri eksiksiz ve doğru kullan. Arapça, Japonca, Çince veya başka alfabe kullanma. "Sen" diye hitap et. Asla tıbbi tavsiye verme.
Dil tonu: Yumuşak, şiirsel, şefkatli. Kesin yargı kurma. "olası ki bu his sana bir şey söylüyor", "içinde bir yer biliyor olabilir ki", "sormaya değer olabilir", "belki de bu", "olabilir ki", "e bilir ki içinde" gibi açık kapılar bırak.
Kişinin sorusunun kaynağına nokta atışı işaret et ama kesin yargıda bulunma. Hataları ya da eksiklikleri değil, kişinin nereye bakabileceğini ve kendine nasıl sevgi sunabileceğini hatırlat.
Yanıtının en sonunda mutlaka şu kapanış cümlesini ekle: "Ama en son kendi kalbine sor ve bu söylediklerimi kendi süzgecinden geçir."
${kisiselBagiam}${KITAP_BILGELIGI}`,
          messages:[{ role:"user", content:`Kullanıcı şunu yazdı: "${chakraInput}"

İlgili çakra: ${ch.name} Çakrası (${ch.element} elementi, ${ch.hz} Hz). Açıklaması: "${ch.desc}"
Zihinsel-bedensel bağlantısı: ${zihinsel}
${astroText2}

${NEFES_REHBERI}

${UYGULAMA_BOLUMLER}

Yanıtını şu formatta ver:

**Ayna**
(Bu çakrayı, kişinin yazdığını, kaynak bilgeliğini ve doğum haritasını bir arada tut — şefkatli bir ayna gibi yansıt. Sorunun kaynağına nokta atışı işaret et ama kesin yargıda bulunma; "olası ki bu his sana bir şey söylüyor", "içinde bir yer biliyor olabilir ki", "olabilir ki" gibi yumuşak açılımlar kullan. Kişinin nereye bakabileceğini göster, kendine sevgi sunmayı hatırlat. Şiirsel, şefkatli, detaylı — 6-7 cümle)

**Senin için**
Beslenme: (bu çakra ve duruma özel 3-4 besin veya şifalı bitki — kısa, net)
Hareket: (2-3 somut egzersiz, yoga pozu veya beden pratiği)
Nefes: [[NEFES:ModAdı]] formatında yaz — ModAdı yalnızca şunlardan biri olsun: Akciğer, Sakinleştirici, Diyafram, Kutu, 4-7-8, Standart — ve kısa nedenini ekle
Uygulama: [[EKRAN:ekranId]] formatında yaz — ekranId yalnızca şunlardan biri olsun: terapi, nefes, rehber, sabah, aksam — ve kısa açıklama ekle

**Reiki ile Enerji Aktarımı**
(Hangi el pozisyonu, hangi frekans, nasıl bir niyet — somut 2-3 adım. Ardından şiirsel, zarif bir kapanışla bitir: enerji akarken kalbinin sesine kulak vermeyi, hangi eski kalıbın yumuşamak istediğini hissetmeyi davet et; eğer içinde bir açılma, bir farkındalık doğarsa — Cho Ku Rei ile onu sistemine mühürlemesini, bu yeni farkındalığı kendi yaşam koduna işlemesini, bedenine ve şimdisine taşımasını hatırlat. 2-3 cümle, şiirsel. Son cümle olarak mutlaka şunu ekle: "Ama en son kendi kalbine sor ve bu söylediklerimi kendi süzgecinden geçir.")` }],
        }),
      });
      const d = await res.json();
      if (!res.ok || d.error) { setChakraAnaliz("Hata: " + (d.error || res.status)); return; }
      setChakraAnaliz(d?.text || "Analiz alınamadı.");
      sorguKaydet("çakra", chakraInput);
    } catch {
      setChakraAnaliz("Bağlantı hatası.");
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
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-opus-4-6", max_tokens:1200,
          system:`Sen derin bir ayna ve enerji rehberisin. YALNIZCA Türkçe yaz; ş, ğ, ı, ü, ö, ç, Ş, Ğ, İ, Ü, Ö, Ç gibi Türkçe karakterleri eksiksiz ve doğru kullan. Arapça, Japonca, Çince veya başka alfabe kullanma. "Sen" diye hitap et. Asla tıbbi tavsiye verme.
Dil tonu: Yumuşak, şiirsel, şefkatli. Kesin yargı kurma. "olası ki bu his sana bir şey söylüyor", "içinde bir yer biliyor olabilir ki", "sormaya değer olabilir", "belki de bu", "olabilir ki", "e bilir ki içinde" gibi açık kapılar bırak.
Kişinin sorusunun kaynağına nokta atışı işaret et ama kesin yargıda bulunma. Hataları ya da eksiklikleri değil, kişinin nereye bakabileceğini ve kendine nasıl sevgi sunabileceğini hatırlat.
Yanıtının en sonunda mutlaka şu kapanış cümlesini ekle: "Ama en son kendi kalbine sor ve bu söylediklerimi kendi süzgecinden geçir."
${kisiselBagiam}${KITAP_BILGELIGI}`,
          messages:[{ role:"user", content:`Kullanıcının semptomu: "${semptomInput}"

${REIKI_BILGI}

${LOUISE_HAY_REHBER}

Zihinsel nedenler:
${zihinselListeText}

${astroText3}

${NEFES_REHBERI}

${UYGULAMA_BOLUMLER}

Yanıtını şu formatta ver:

**Ayna**
(Semptomu, ilgili çakrayı, kaynak bilgeliğini ve doğum haritasını bir arada tut — şefkatli bir ayna gibi yansıt. Sorunun kaynağına nokta atışı işaret et ama kesin yargıda bulunma; "olası ki bu his sana bir şey söylüyor", "içinde bir yer biliyor olabilir ki", "olabilir ki" gibi yumuşak açılımlar kullan. Kişinin nereye bakabileceğini göster, kendine sevgi sunmayı hatırlat. Şiirsel, şefkatli, detaylı — 6-7 cümle)

**Senin için**
Beslenme: (bu semptom ve duruma özel 3-4 besin veya şifalı bitki — kısa, net)
Hareket: (2-3 somut egzersiz, yoga pozu veya beden pratiği)
Nefes: [[NEFES:ModAdı]] formatında yaz — ModAdı yalnızca şunlardan biri olsun: Akciğer, Sakinleştirici, Diyafram, Kutu, 4-7-8, Standart — ve kısa nedenini ekle
Uygulama: [[EKRAN:ekranId]] formatında yaz — ekranId yalnızca şunlardan biri olsun: terapi, nefes, rehber, sabah, aksam — ve kısa açıklama ekle

**Reiki ile Enerji Aktarımı**
(El pozisyonu, frekans müziği, niyet — somut 2-3 adım. Ardından şiirsel, zarif bir kapanışla bitir: enerji akarken kalbinin sesine kulak vermeyi, hangi eski kalıbın yumuşamak istediğini hissetmeyi davet et; eğer içinde bir açılma, bir farkındalık doğarsa — Cho Ku Rei ile onu sistemine mühürlemesini, bu yeni farkındalığı kendi yaşam koduna işlemesini, bedenine ve şimdisine taşımasını hatırlat. 2-3 cümle, şiirsel. Son cümle olarak mutlaka şunu ekle: "Ama en son kendi kalbine sor ve bu söylediklerimi kendi süzgecinden geçir.")` }],
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
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-opus-4-6", max_tokens:1100,
          system:`Sen derin bir ayna ve enerji rehberisin. YALNIZCA Türkçe yaz; ş, ğ, ı, ü, ö, ç, Ş, Ğ, İ, Ü, Ö, Ç gibi Türkçe karakterleri eksiksiz ve doğru kullan. Arapça, Japonca, Çince veya başka alfabe kullanma. "Sen" diye hitap et. Asla tıbbi tavsiye verme.
Dil tonu: Yumuşak, şiirsel, şefkatli. Kesin yargı kurma. "olası ki bu his sana bir şey söylüyor", "içinde bir yer biliyor olabilir ki", "sormaya değer olabilir", "belki de bu", "olabilir ki", "e bilir ki içinde" gibi açık kapılar bırak.
Kişinin sorusunun kaynağına nokta atışı işaret et ama kesin yargıda bulunma. Hataları ya da eksiklikleri değil, kişinin nereye bakabileceğini ve kendine nasıl sevgi sunabileceğini hatırlat.
Yanıtının en sonunda mutlaka şu kapanış cümlesini ekle: "Ama en son kendi kalbine sor ve bu söylediklerimi kendi süzgecinden geçir."
${kisiselBagiam}${KITAP_BILGELIGI}`,
          messages:[{ role:"user", content:`Kullanıcının sorusu/şikayeti: "${sikayet}"${sikayetHis ? `\nHissi: "${sikayetHis}"` : ""}

${REIKI_BILGI}

${LOUISE_HAY_REHBER}

Zihinsel nedenler:
${zihinselListeText}
${astroTxt}

${NEFES_REHBERI}

${UYGULAMA_BOLUMLER}

Yanıtını şu formatta ver:

**Ayna**
(Soruyu/şikayeti, ilgili çakrayı, kaynak bilgeliğini ve doğum haritasını bir arada tut — şefkatli bir ayna gibi yansıt. Sorunun kaynağına nokta atışı işaret et ama kesin yargıda bulunma; "olası ki bu his sana bir şey söylüyor", "içinde bir yer biliyor olabilir ki", "olabilir ki" gibi yumuşak açılımlar kullan. Kişinin nereye bakabileceğini göster, kendine sevgi sunmayı hatırlat. Şiirsel, şefkatli, detaylı — 6-7 cümle)

**Senin için**
Beslenme: (bu konu ve duruma özel 3-4 besin veya şifalı bitki — kısa, net)
Hareket: (2-3 somut egzersiz, yoga pozu veya beden pratiği)
Nefes: [[NEFES:ModAdı]] formatında yaz — ModAdı yalnızca şunlardan biri olsun: Akciğer, Sakinleştirici, Diyafram, Kutu, 4-7-8, Standart — ve kısa nedenini ekle
Uygulama: [[EKRAN:ekranId]] formatında yaz — ekranId yalnızca şunlardan biri olsun: terapi, nefes, rehber, sabah, aksam — ve kısa açıklama ekle

**Reiki ile Enerji Aktarımı**
(El pozisyonu, niyet, frekans müziği — somut 2-3 adım. Ardından şiirsel, zarif bir kapanışla bitir: enerji akarken kalbinin sesine kulak vermeyi, hangi eski kalıbın yumuşamak istediğini hissetmeyi davet et; eğer içinde bir açılma, bir farkındalık doğarsa — Cho Ku Rei ile onu sistemine mühürlemesini, bu yeni farkındalığı kendi yaşam koduna işlemesini, bedenine ve şimdisine taşımasını hatırlat. 2-3 cümle, şiirsel. Son cümle olarak mutlaka şunu ekle: "Ama en son kendi kalbine sor ve bu söylediklerimi kendi süzgecinden geçir.")` }],
        }),
      });
      const d = await res.json();
      if (!res.ok || d.error) { setSikayetAnaliz("Hata: " + (d.error || res.status)); return; }
      setSikayetAnaliz(d?.text || "Analiz alınamadı.");
      sorguKaydet("şikayet", sikayet);
    } catch(e) { setSikayetAnaliz("Bağlantı hatası: " + e.message); }
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
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-opus-4-6", max_tokens:1300,
          system:`Sen derin bir ayna ve enerji rehberisin. YALNIZCA Türkçe yaz; ş, ğ, ı, ü, ö, ç, Ş, Ğ, İ, Ü, Ö, Ç gibi Türkçe karakterleri eksiksiz ve doğru kullan. Arapça, Japonca, Çince veya başka alfabe kullanma. "Sen" diye hitap et. Asla tıbbi tavsiye verme.
Dil tonu: Yumuşak, şiirsel, şefkatli. Kesin yargı kurma. "olası ki bu his sana bir şey söylüyor", "içinde bir yer biliyor olabilir ki", "sormaya değer olabilir", "belki de bu", "olabilir ki", "e bilir ki içinde" gibi açık kapılar bırak.
Kişinin sorusunun kaynağına nokta atışı işaret et ama kesin yargıda bulunma. Hataları ya da eksiklikleri değil, kişinin nereye bakabileceğini ve kendine nasıl sevgi sunabileceğini hatırlat.
Yanıtının en sonunda mutlaka şu kapanış cümlesini ekle: "Ama en son kendi kalbine sor ve bu söylediklerimi kendi süzgecinden geçir."
${kisiselBagiam}${KITAP_BILGELIGI}`,
          messages:[{ role:"user", content:`Hastalık: "${hastalik}"${hastalikHis ? `\nNasıl hissediyorum: "${hastalikHis}"` : ""}

${REIKI_BILGI}

${LOUISE_HAY_REHBER}

Zihinsel nedenler:
${zihinselListeText}
${astroTxt}

${NEFES_REHBERI}

${UYGULAMA_BOLUMLER}

Yanıtını şu formatta ver:

**Ayna**
(Hastalığı, ilgili çakrayı, kaynak bilgeliğini ve doğum haritasını bir arada tut — şefkatli bir ayna gibi yansıt. Sorunun kaynağına nokta atışı işaret et ama kesin yargıda bulunma; "olası ki bu his sana bir şey söylüyor", "içinde bir yer biliyor olabilir ki", "olabilir ki" gibi yumuşak açılımlar kullan. Kişinin nereye bakabileceğini göster, kendine sevgi sunmayı hatırlat. Şiirsel, şefkatli, detaylı — 6-7 cümle)

**Senin için**
Beslenme: (bu hastalık ve duruma özel 3-4 besin veya şifalı bitki — kısa, net)
Hareket: (2-3 somut egzersiz, yoga pozu veya beden pratiği)
Nefes: [[NEFES:ModAdı]] formatında yaz — ModAdı yalnızca şunlardan biri olsun: Akciğer, Sakinleştirici, Diyafram, Kutu, 4-7-8, Standart — ve kısa nedenini ekle
Uygulama: [[EKRAN:ekranId]] formatında yaz — ekranId yalnızca şunlardan biri olsun: terapi, nefes, rehber, sabah, aksam — ve kısa açıklama ekle

**Reiki ile Enerji Aktarımı**
(El pozisyonu, frekans, niyet — somut 2-3 adım. Ardından şiirsel, zarif bir kapanışla bitir: enerji akarken kalbinin sesine kulak vermeyi, hangi eski kalıbın yumuşamak istediğini hissetmeyi davet et; eğer içinde bir açılma, bir farkındalık doğarsa — Cho Ku Rei ile onu sistemine mühürlemesini, bu yeni farkındalığı kendi yaşam koduna işlemesini, bedenine ve şimdisine taşımasını hatırlat. 2-3 cümle, şiirsel. Son cümle olarak mutlaka şunu ekle: "Ama en son kendi kalbine sor ve bu söylediklerimi kendi süzgecinden geçir.")` }],
        }),
      });
      const d = await res.json();
      if (!res.ok || d.error) { setHastalikAnaliz("Hata: " + (d.error || res.status)); return; }
      setHastalikAnaliz(d?.text || "Analiz alınamadı.");
      sorguKaydet("hastalık", hastalik);
    } catch(e) { setHastalikAnaliz("Bağlantı hatası: " + e.message); }
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

    const gunlerText = gunler.map((g,i)=>`Gün ${i+1} (${g.tarih}):
- Niyet: ${g.niyet||"—"}
- Kelimeler: ${g.kelimeler?.join(", ")||"—"}
- Çakra: ${g.chakra||"—"}
- Nefes: ${g.nefes||0}
- Bugün ne öğrendim: ${g.ogrendim||"—"}
- Şükür: ${g.sukur||"—"}`).join("\n\n");

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
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-opus-4-6", max_tokens:1700,
          system:`Sen derin bir ayna ve içsel farkındalık rehberisin. Kullanıcının haftalık verilerini, doğum profilini ve 12. ev (gizli benlik) bilgeliğini sentezleyerek Türkçe, şiirsel ve içten bir rapor yazıyorsun. Ayna gibi yansıt — kişinin verisini geri ver, yargılama, kesin hüküm kurma. Sorunun kaynağına nokta atışı işaret et ama kapıyı açık bırak. Hataları değil, nereye bakabileceğini göster; kendine sevgi sunmayı hatırlat.
${astroText}
${GIZLI_BENLIK_REHBER}
${KITAP_BILGELIGI}

Rapor şu başlıkları içermeli:
**Haftanın Yansıması** — Genel ruh hali, enerji ve burç/sayı etkisi — ayna gibi yansıt, yargılama (2-3 cümle)
**Öne Çıkan Temalar** — Tekrar eden kelimeler ve çakra örüntüleri — kaynağa işaret et, açık kapı bırak
**İçsel Büyüme** — Öğrenilen şeylerden çıkarılan anlam — kişinin kendi içinde gördüklerini yansıt
**Gizli Benlik & Gölge** — Bu haftanın verilerinde 12. ev perspektifinden görülen bastırılmış temalar; bütünleşme için nazik bir davet (2-3 cümle, şiirsel)
**Şükran Kalbi** — Şükür yazılarından bir sentez
**Sana Bir Davet** — Bu hafta kendine nasıl sevgi sunabilirsin, nereye bakabilirsin — eleştiri değil, davet (2-3 madde)
**Hatırla** — Bu hafta kendine hatırlatman gereken en önemli 2-3 şey (kısa, öz)
**Gelecek Haftaya Niyet** — Kısa, ilham verici bir öneri${astro ? "\n**Kozmik Not** — Bu haftanın biyoritmi ve sayısal/burç enerjisi hakkında kısa bir not" : ""}

Samimi, nazik, biraz şiirsel bir dil kullan. "Sen" diye hitap et. Maksimum 620 kelime.`,
          messages:[{role:"user",content:`Bu haftaki günlük verilerim:\n\n${gunlerText}\n\nLütfen haftalık içsel raporumu oluştur.`}]
        })
      });
      const data = await res.json();
      const text = data.text;
      if (text) {
        localStorage.setItem("sakin_rapor_used", "1");
        setRaporKullanildi(true);
      }
      setAiRapor(text || data.error?.message || "Rapor oluşturulamadı.");
    } catch(e) { setAiRapor("Hata: " + e.message); }
    finally { setAiLoading(false); }
  };

  useEffect(() => {
    setBreathStarted(false);
    setBreathPhase("inhale");
    const pending = pendingBreathRef.current;
    if (pending) { setBreathMode(pending); pendingBreathRef.current = null; }
    else { setBreathMode("standart"); }
    clearInterval(breathRef.current);
  },[screen]);

  useEffect(() => {
    if (screen!=="nefes" || !breathStarted) return;
    const tm = BREATH_MODES_CONFIG[breathMode] || BREATH_MODES_CONFIG.standart;
    const toIds = [];
    const cycle = () => {
      setBreathPhase("inhale");
      let t = tm.in;
      if (tm.hold > 0)  { toIds.push(setTimeout(()=>setBreathPhase("hold"),  t)); t += tm.hold;  }
      toIds.push(setTimeout(()=>setBreathPhase("exhale"), t)); t += tm.out;
      if (tm.hold2 > 0) { toIds.push(setTimeout(()=>setBreathPhase("hold2"), t)); }
      toIds.push(setTimeout(()=>setBreathCount(c=>c+1), tm.total - 200));
    };
    cycle();
    breathRef.current = setInterval(cycle, tm.total);
    return () => { clearInterval(breathRef.current); toIds.forEach(clearTimeout); };
  },[screen, breathStarted, breathMode]);

  const hour   = time.getHours();
  const dayPct = ((hour*60+time.getMinutes())/1440)*100;
  const toggleWord = w => setSelectedWords(prev => prev.includes(w)?prev.filter(x=>x!==w):prev.length<3?[...prev,w]:prev);
  const breathLabel = breathStarted ? ({inhale:t("breath_inhale"),hold:t("breath_hold"),exhale:t("breath_exhale"),hold2:t("breath_rest")}[breathPhase]||"") : "";
  const breathScale = breathStarted ? (breathPhase==="exhale"||breathPhase==="hold2" ? 1 : 1.6) : 1;
  const breathIsActive = breathPhase==="inhale"||breathPhase==="hold";
  const tm = BREATH_MODES_CONFIG[breathMode] || BREATH_MODES_CONFIG.standart;
  const breathInDur  = `${tm.in/1000}s`;
  const breathOutDur = `${tm.out/1000}s`;
  const handleMouseMove = e => { const r=e.currentTarget.getBoundingClientRect(); setOrb({x:((e.clientX-r.left)/r.width)*100,y:((e.clientY-r.top)/r.height)*100}); };

  const ambientColor = {
    giris:"139,90,160",sabah:"220,130,50",nefes:"80,130,200",
    chakra:`${parseInt(chakra.color.slice(1,3),16)},${parseInt(chakra.color.slice(3,5),16)},${parseInt(chakra.color.slice(5,7),16)}`,
    gun:"120,90,180",terapi:"74,160,100",aksam:"60,70,140",harita:"100,80,180",
  }[screen]||"139,90,160";

  const NAV = [
    {id:"mandala",icon:"◎",  label:lang==="tr"?"Harita":"Map",    color:"#b87adc"},
    {id:"sabah",  icon:"🌅", label:t("nav_morning"),               color:"#f0a060"},
    {id:"nefes",  icon:"🫧", label:t("nav_breath"),                color:"#60b8e8"},
    {id:"chakra", icon:"💜", label:t("nav_chakra"),                color:"#c07ae0"},
    {id:"gun",    icon:"☀️", label:t("nav_day"),                   color:"#e8d060"},
    {id:"aksam",  icon:"🌙", label:t("nav_evening"),               color:"#7ab0e0"},
  ];
  const SIDEBAR_ITEMS = [
    {id:"rehber", icon:"🪞", label:lang==="tr"?"Ayna":"Mirror", color:"#a070d0"},
    {id:"harita", icon:"🗺️", label:lang==="tr"?"Harita":"Map",  color:"#82d9a3"},
  ];
  const MORNING_WORDS = t("morning_words");

  const isPolicyScreen = ["hakkinda","fiyat","sartlar","gizlilik","iade"].includes(screen);
  return (
    <div onMouseMove={handleMouseMove} style={{ minHeight:"100vh",paddingTop:82,background:"#080c14",display:"flex",alignItems:isPolicyScreen?"flex-start":"center",justifyContent:"center",fontFamily:"'Cormorant Garamond',Georgia,serif",color:"#ddd8f0",position:"relative" }}>
      <style>{GLOBAL_CSS}</style>

      {/* ÜST NAV */}
      <div className="top-nav">
        {/* Anasayfa butonu — sol */}
        <button
          onClick={()=>{ setGirisPhase("intro"); setScreen("giris"); history.pushState(null,"","/"); }}
          style={{ background:"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:5,padding:"0 10px 0 6px",height:44,flexShrink:0,borderRight:"1px solid rgba(255,255,255,0.06)" }}
        >
          <svg width="12" height="12" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.5 1L1 6.5M1 6.5L6.5 12M1 6.5H12" stroke="rgba(184,164,216,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily:"'Jost',sans-serif",fontWeight:300,fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"rgba(184,164,216,0.5)" }}>Sakin</span>
        </button>
        <button className={`top-nav-btn${screen==="hakkinda"?" active":""}`} onClick={()=>{ setScreen("hakkinda"); history.pushState(null,"","/hakkinda"); }}>{t("nav_about")}</button>
        <button className={`top-nav-btn${screen==="fiyat"?" active":""}`} onClick={()=>{ setScreen("fiyat"); history.pushState(null,"","/fiyatlandirma"); }}>{t("nav_pricing")}</button>
        <button className={`top-nav-btn${screen==="sartlar"?" active":""}`} onClick={()=>{ setScreen("sartlar"); history.pushState(null,"","/hizmet-sartlari"); }}>{t("nav_terms")}</button>
        <button className={`top-nav-btn${screen==="gizlilik"?" active":""}`} onClick={()=>{ setScreen("gizlilik"); history.pushState(null,"","/gizlilik"); }}>{t("nav_privacy")}</button>
        <button className={`top-nav-btn${screen==="iade"?" active":""}`} onClick={()=>{ setScreen("iade"); history.pushState(null,"","/iade-politikasi"); }}>{t("nav_refund")}</button>
        {/* Dil butonu — nav'ın en sağında */}
        <button onClick={toggleLang} style={{ marginLeft:"auto",flexShrink:0,background:"rgba(139,90,160,0.15)",border:"1px solid rgba(139,90,160,0.3)",borderRadius:20,padding:"6px 14px",color:"#c3a6d8",fontSize:11,letterSpacing:1.5,cursor:"pointer",fontFamily:"'Jost',sans-serif",fontWeight:300,minHeight:36,alignSelf:"center",marginRight:4 }}>
          {lang === "tr" ? "EN" : "TR"}
        </button>
      </div>

      {/* AYNA & HARİTA BARI — üst navın altında */}
      <div style={{ position:"fixed",top:44,left:0,right:0,zIndex:9998,height:38,background:"rgba(8,12,20,0.95)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",gap:4,padding:"0 8px" }}>
        {SIDEBAR_ITEMS.map(n=>{
          const active = screen===n.id;
          return (
            <button key={n.id}
              onClick={()=>{ if(n.id==="rehber") setRehberTab("reiki"); setScreen(n.id); }}
              style={{
                background: active ? `${n.color}22` : "transparent",
                border: active ? `1px solid ${n.color}44` : "1px solid transparent",
                borderRadius:20, cursor:"pointer", transition:"all 0.25s",
                padding:"4px 16px", display:"flex", alignItems:"center", gap:6,
                fontFamily:"'Jost',sans-serif", fontWeight:300,
                fontSize:11, letterSpacing:1.8, textTransform:"uppercase",
                color: active ? n.color : `${n.color}77`,
              }}>
              <span style={{ fontSize:14, lineHeight:1 }}>{n.icon}</span>
              <span>{n.label}</span>
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

      {/* GİRİŞ */}
      {screen==="giris" && (
        <div style={{ maxWidth:320,width:"100%",textAlign:"center",padding:"24px 24px 80px",position:"relative",zIndex:1 }}>
          {/* Geometrik elmas şekli */}
          <div className="fade-up" style={{ marginBottom:36 }}>
            <div style={{ position:"relative",width:72,height:72,margin:"0 auto" }}>
              <div style={{ position:"absolute",inset:0,transform:"rotate(45deg)",border:"1px solid rgba(184,164,216,0.2)",borderRadius:4,animation:"diamondSpin 12s linear infinite" }} />
              <div style={{ position:"absolute",inset:10,transform:"rotate(45deg)",border:"1px solid rgba(184,164,216,0.12)",borderRadius:3,animation:"diamondSpin 8s linear infinite reverse" }} />
              <div style={{ position:"absolute",inset:"50%",transform:"translate(-50%,-50%)",width:12,height:12,borderRadius:"50%",background:"rgba(184,164,216,0.6)",boxShadow:"0 0 18px rgba(184,164,216,0.5),0 0 36px rgba(122,80,150,0.3)" }} />
            </div>
          </div>
          <div className="fade-up" style={{ animationDelay:"0.18s",opacity:0 }}>
            <div style={{ fontFamily:"'Jost',sans-serif",fontSize:40,letterSpacing:12,fontWeight:200,marginBottom:8,color:"#ddd8f0" }}>Sakin</div>
          </div>
          <div className="fade-up" style={{ animationDelay:"0.34s",opacity:0 }}>
            <div style={{ fontFamily:"'Jost',sans-serif",fontSize:10,letterSpacing:4,fontWeight:300,textTransform:"uppercase",color:"#3a4058",marginBottom:52 }}>{t("tagline")}</div>
          </div>
          <div className="fade-up" style={{ animationDelay:"0.55s",opacity:0 }}>
            {girisPhase === "intro" ? (
              <>
                <div style={{ marginBottom:48,fontFamily:"'Cormorant Garamond',Georgia,serif",textAlign:"center" }}>
                  <div style={{ color:"#b0a8cc",fontSize:19,fontStyle:"italic",lineHeight:1.7,fontWeight:300 }}>{t("intro_text1")}</div>
                  <div style={{ color:"#d4c8f0",fontSize:22,fontStyle:"italic",lineHeight:1.7,fontWeight:400,marginTop:6,letterSpacing:0.5 }}>{t("intro_text2")}</div>
                </div>
                <button className="sakin-btn-primary" onClick={()=>setGirisPhase("birth")}>{t("btn_ready")}</button>
              </>
            ) : (
              <div style={{ textAlign:"left" }}>
                <div style={{ fontFamily:"'Jost',sans-serif",fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"#6a5a90",marginBottom:22,textAlign:"center" }}>
                  {lang==="tr" ? "Doğum Bilgilerin" : "Your Birth Info"}
                </div>
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:10,letterSpacing:2.5,color:"#5a4a78",marginBottom:6,textTransform:"uppercase",fontFamily:"'Jost',sans-serif" }}>{lang==="tr" ? "Doğum Tarihi" : "Date of Birth"}</div>
                  <input type="date" className="sakin-input" style={{ fontSize:16,padding:"12px 14px" }}
                    value={birthInput} onChange={e=>setBirthInput(e.target.value)} />
                </div>
                <div style={{ marginBottom:22 }}>
                  <div style={{ fontSize:10,letterSpacing:2.5,color:"#5a4a78",marginBottom:6,textTransform:"uppercase",fontFamily:"'Jost',sans-serif" }}>{lang==="tr" ? "Doğum Saati (isteğe bağlı)" : "Birth Time (optional)"}</div>
                  <input type="time" className="sakin-input" style={{ fontSize:16,padding:"12px 14px" }}
                    value={birthTimeInput} onChange={e=>setBirthTimeInput(e.target.value)} />
                </div>
                <div style={{ fontSize:10,letterSpacing:1.5,color:"#3a3858",marginBottom:22,textAlign:"center",fontFamily:"'Jost',sans-serif" }}>
                  {lang==="tr" ? "🔒  Verileriniz sunucularda saklanmaz · Yalnızca cihazınızda tutulur" : "🔒  Your data is never stored on servers · Kept on your device only"}
                </div>
                <button className="sakin-btn-primary" style={{ width:"100%" }}
                  onClick={()=>{
                    if(birthInput){ localStorage.setItem("sakin_birth_date", birthInput); setBirthDate(birthInput); markStep("birth"); }
                    if(birthTimeInput){ localStorage.setItem("sakin_birth_time", birthTimeInput); setBirthTime(birthTimeInput); }
                    setRehberTab("reiki"); setScreen("rehber");
                  }}>
                  {lang==="tr" ? (birthInput ? "Haritama Göre Devam Et →" : "Atla ve Devam Et →") : (birthInput ? "Continue with My Chart →" : "Skip & Continue →")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MANDALA HARİTA — pasta dilimi */}
      {screen==="mandala" && (() => {
        function slicePath(cx,cy,rIn,rOut,startDeg,endDeg,gap=3){
          const s=(startDeg+gap/2)*Math.PI/180, e=(endDeg-gap/2)*Math.PI/180;
          const la=(endDeg-startDeg-gap)>180?1:0;
          const x1=cx+rOut*Math.cos(s),y1=cy+rOut*Math.sin(s);
          const x2=cx+rOut*Math.cos(e),y2=cy+rOut*Math.sin(e);
          const x3=cx+rIn*Math.cos(e), y3=cy+rIn*Math.sin(e);
          const x4=cx+rIn*Math.cos(s), y4=cy+rIn*Math.sin(s);
          return `M${x1} ${y1} A${rOut} ${rOut} 0 ${la} 1 ${x2} ${y2} L${x3} ${y3} A${rIn} ${rIn} 0 ${la} 0 ${x4} ${y4}Z`;
        }
        const steps = [
          {id:"sabah",  label:lang==="tr"?"Sabah":"Morning",  icon:"🌅", color:"#f0a060", glow:"255,140,60"},
          {id:"nefes",  label:lang==="tr"?"Nefes":"Breath",   icon:"🫧", color:"#60b8e8", glow:"80,160,220"},
          {id:"chakra", label:lang==="tr"?"Çakra":"Chakra",   icon:"💜", color:"#b87adc", glow:"180,100,255"},
          {id:"gun",    label:lang==="tr"?"Görevler":"Tasks",  icon:"☀️", color:"#e8d060", glow:"230,200,60"},
          {id:"aksam",  label:lang==="tr"?"Akşam":"Evening",  icon:"🌙", color:"#7ab0e0", glow:"100,150,220"},
          {id:"harita", label:lang==="tr"?"Harita":"Map",     icon:"✦",  color:"#82d9a3", glow:"80,210,140"},
        ];
        const N=steps.length, sweep=360/N;
        const cx=155, cy=155, rOut=135, rIn=62;
        const BADGES=[
          {days:3, icon:"🌱",label:lang==="tr"?"3 Gün":"3 Days"},
          {days:7, icon:"🔥",label:lang==="tr"?"1 Hafta":"1 Week"},
          {days:21,icon:"⚡",label:lang==="tr"?"21 Gün":"21 Days"},
          {days:40,icon:"👑",label:lang==="tr"?"40 Gün":"40 Days"},
        ];
        const nextStep = steps.find(s => !stepsCompleted[s.id]);

        return (
          <div style={{maxWidth:400,width:"100%",padding:"54px 20px 110px",position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
            {/* Title */}
            <div style={{textAlign:"center",marginBottom:8}}>
              <div className="label-sm" style={{letterSpacing:5,marginBottom:5}}>{lang==="tr"?"BUGÜNÜN YOLCULUĞU":"TODAY'S JOURNEY"}</div>
            </div>

            {/* Streak row */}
            <div style={{display:"flex",gap:18,marginBottom:18,alignItems:"center"}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:30,fontWeight:200,color:"#f0a040",lineHeight:1,animation:streakData.current>=3?"streakFire 2s ease-in-out infinite":"none"}}>{streakData.current}</div>
                <div style={{fontSize:8,letterSpacing:2.5,color:"#5a4a7a",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>{lang==="tr"?"gün serisi":"day streak"}</div>
              </div>
              <div style={{width:1,height:36,background:"rgba(255,255,255,0.07)"}}/>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:30,fontWeight:200,color:"#5a6a7a",lineHeight:1}}>{streakData.best}</div>
                <div style={{fontSize:8,letterSpacing:2.5,color:"#3a4058",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>{lang==="tr"?"en iyi":"best"}</div>
              </div>
              <div style={{width:1,height:36,background:"rgba(255,255,255,0.07)"}}/>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:30,fontWeight:200,color:allStepsComplete?"#82d9a3":"#c3a6d8",lineHeight:1}}>{completedStepCount}<span style={{fontSize:14,color:"#3a4058"}}>/{N}</span></div>
                <div style={{fontSize:8,letterSpacing:2.5,color:"#3a4058",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>{lang==="tr"?"adım":"steps"}</div>
              </div>
            </div>

            {/* SVG Pasta Dilimi */}
            <div style={{width:310,height:310}}>
              <svg width="310" height="310" viewBox="0 0 310 310" style={{overflow:"visible"}}>
                <defs>
                  {steps.map(step=>(
                    <radialGradient key={step.id} id={`rg_${step.id}`} cx="50%" cy="50%" r="50%">
                      <stop offset="0%"   stopColor={`rgba(${step.glow},0.9)`}/>
                      <stop offset="100%" stopColor={`rgba(${step.glow},0.3)`}/>
                    </radialGradient>
                  ))}
                  <radialGradient id="rg_center" cx="50%" cy="50%" r="50%">
                    <stop offset="0%"   stopColor={allStepsComplete?"rgba(130,217,163,0.5)":"rgba(180,150,255,0.35)"}/>
                    <stop offset="100%" stopColor="rgba(8,12,20,0)"/>
                  </radialGradient>
                  <filter id="sf">
                    <feGaussianBlur stdDeviation="4" result="b"/>
                    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>

                {steps.map((step,i)=>{
                  const startDeg=-90+i*sweep, endDeg=startDeg+sweep;
                  const done=!!stepsCompleted[step.id];
                  const partial=!done && step.id==="gun" && gunTasksDone>0;
                  const midDeg=startDeg+sweep/2, midRad=midDeg*Math.PI/180;
                  const iconR=(rIn+rOut)/2;
                  const iconX=cx+iconR*Math.cos(midRad), iconY=cy+iconR*Math.sin(midRad);
                  const labelR=rOut+20;
                  const labelX=cx+labelR*Math.cos(midRad), labelY=cy+labelR*Math.sin(midRad);
                  const isNext=nextStep?.id===step.id;

                  return (
                    <g key={step.id} style={{cursor:done?"default":isNext?"pointer":"default"}}
                      onClick={()=>{ if(isNext&&!done) setScreen(step.id); }}>
                      {/* glow hale behind done/partial slice */}
                      {(done||partial)&&<path d={slicePath(cx,cy,rIn-3,rOut+6,startDeg,endDeg,3)}
                        fill={`rgba(${step.glow},${partial?0.08:0.18})`}
                        style={{animation:`sliceGlow 2.5s ease-in-out infinite`,animationDelay:`${i*0.45}s`}}/>}
                      {/* slice body */}
                      <path d={slicePath(cx,cy,rIn,rOut,startDeg,endDeg,3)}
                        fill={done?`url(#rg_${step.id})`:partial?`rgba(${step.glow},0.22)`:"rgba(255,255,255,0.026)"}
                        stroke={done?`rgba(${step.glow},0.55)`:partial?`rgba(${step.glow},0.35)`:"rgba(255,255,255,0.055)"}
                        strokeWidth="0.6"
                        style={{transition:"fill 0.7s ease, stroke 0.7s ease"}}/>
                      {/* icon */}
                      <text x={iconX} y={iconY+1} textAnchor="middle" dominantBaseline="middle"
                        fontSize={done?18:14} opacity={done?1:partial?0.6:0.18}
                        style={{transition:"opacity 0.5s,font-size 0.5s",userSelect:"none"}}>
                        {done?"✓":step.icon}
                      </text>
                      {/* label */}
                      <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle"
                        fontSize="8" letterSpacing="1.5"
                        fill={done?step.color:partial?`rgba(${step.glow},0.7)`:"rgba(70,80,100,0.6)"}
                        fontFamily="'Jost',sans-serif"
                        style={{textTransform:"uppercase",transition:"fill 0.5s",userSelect:"none"}}>
                        {step.label}
                      </text>
                    </g>
                  );
                })}

                {/* center fill */}
                <circle cx={cx} cy={cy} r={rIn-3} fill="url(#rg_center)" style={{transition:"fill 0.8s"}}/>
                <circle cx={cx} cy={cy} r={rIn-3} fill="rgba(8,12,20,0.82)"/>

                {/* center text */}
                {allStepsComplete?(
                  <>
                    <text x={cx} y={cy-8} textAnchor="middle" dominantBaseline="middle" fontSize="20" fill="#82d9a3">✓</text>
                    <text x={cx} y={cy+11} textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="#3a7a60"
                      fontFamily="'Jost',sans-serif" letterSpacing="2">{lang==="tr"?"TAMAM":"DONE"}</text>
                  </>
                ):(
                  <>
                    <text x={cx} y={cy-6} textAnchor="middle" dominantBaseline="middle"
                      fontSize="20" fontWeight="200" fill="#c3a6d8" fontFamily="'Cormorant Garamond',Georgia,serif">
                      {completedStepCount}
                    </text>
                    <text x={cx} y={cy+10} textAnchor="middle" dominantBaseline="middle"
                      fontSize="7" fill="rgba(100,90,140,0.6)" fontFamily="'Jost',sans-serif" letterSpacing="2">
                      / {N}
                    </text>
                  </>
                )}

                {/* thin outer ring */}
                <circle cx={cx} cy={cy} r={rOut+12} fill="none" stroke="rgba(184,164,216,0.05)" strokeWidth="1"/>
              </svg>
            </div>

            {/* CTA */}
            {allStepsComplete?(
              <div style={{textAlign:"center",marginTop:4,padding:"12px 20px",background:"rgba(74,222,128,0.06)",border:"1px solid rgba(74,222,128,0.16)",borderRadius:16,maxWidth:280,width:"100%"}}>
                <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:17,color:"#82d9a3",letterSpacing:1}}>
                  🌿 {lang==="tr"?"Bugün tamamlandı":"Today complete"}
                </div>
              </div>
            ):nextStep?(
              <button className="sakin-btn-primary" style={{marginTop:4,fontSize:12,letterSpacing:2}}
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
                    <div style={{fontSize:7,letterSpacing:1.5,color:unlocked?"#f0c860":"#4a5a6a",fontFamily:"'Jost',sans-serif",textTransform:"uppercase"}}>{b.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Harita — adım navigasyonu */}
            <div style={{width:"100%",marginTop:28,borderTop:"1px solid rgba(255,255,255,0.05)",paddingTop:20}}>
              <div style={{fontSize:8,letterSpacing:3,color:"#3a4a5a",textAlign:"center",marginBottom:14,fontFamily:"'Jost',sans-serif",textTransform:"uppercase"}}>{lang==="tr"?"GÜNÜN HARİTASI":"DAY MAP"}</div>
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
                      <span style={{fontSize:12}}>{done?"✓":step.icon}</span>
                      <span style={{fontFamily:"'Jost',sans-serif",fontSize:8,letterSpacing:1.5,textTransform:"uppercase",color:done?step.color:isNext?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.2)"}}>{step.label}</span>
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
        <div style={{ maxWidth:390,width:"100%",padding:"62px 26px 110px",position:"relative",zIndex:1 }}>
          <div style={{ textAlign:"center",marginBottom:36,animation:"sunrise 1s ease forwards" }}>
            <div style={{ position:"relative",width:88,height:88,margin:"0 auto" }}>
              <div style={{ position:"absolute",inset:0,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,155,55,0.4) 0%,rgba(255,95,35,0.1) 55%,transparent 70%)",boxShadow:"0 0 32px rgba(255,130,45,0.3),0 0 64px rgba(255,95,35,0.12)",animation:"slowPulse 4.5s ease-in-out infinite" }} />
              <div style={{ position:"absolute",inset:-14,borderRadius:"50%",border:"1px solid rgba(255,140,50,0.08)" }} />
            </div>
            <div style={{ marginTop:16,fontFamily:"'Jost',sans-serif",fontWeight:300,fontSize:10,letterSpacing:4,textTransform:"uppercase",color:"#3a4058" }}>{time.toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})}</div>
          </div>
          {stepsCompleted["sabah"] ? (
            /* ── Tamamlandı: salt-okunur özet ── */
            <div>
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:10,letterSpacing:3,color:"#5a6a7a",marginBottom:10,fontFamily:"'Jost',sans-serif",textTransform:"uppercase" }}>{lang==="tr"?"Bugünün niyeti":"Today's intention"}</div>
                <div style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,140,50,0.2)",borderRadius:12,padding:"14px 16px",fontSize:15,color:"#e0d8f4",lineHeight:1.8,fontStyle:"italic" }}>
                  {niyet || "—"}
                </div>
              </div>
              <div style={{ marginBottom:28 }}>
                <div style={{ fontSize:10,letterSpacing:3,color:"#5a6a7a",marginBottom:10,fontFamily:"'Jost',sans-serif",textTransform:"uppercase" }}>{lang==="tr"?"Seçilen kelimeler":"Selected words"}</div>
                <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
                  {selectedWords.length > 0 ? selectedWords.map(w=>(
                    <span key={w} style={{ padding:"6px 16px",borderRadius:20,fontSize:13,letterSpacing:0.5,background:"rgba(255,140,50,0.12)",border:"1px solid rgba(255,140,50,0.28)",color:"#f0a060" }}>{w}</span>
                  )) : <span style={{ color:"#4a5a6a",fontSize:13 }}>—</span>}
                </div>
              </div>
              <div style={{ display:"flex",gap:8,marginBottom:20 }}>
                <button className="sakin-btn-primary" style={{ flex:1 }} onClick={()=>setScreen("nefes")}>
                  {t("btn_continue")}
                </button>
                <button onClick={()=>{ setStepsCompleted(prev=>{ const next={...prev}; delete next.sabah; localStorage.setItem("sakin_steps_"+todayKey,JSON.stringify(next)); return next; }); }}
                  style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"0 16px",color:"#7a8a9a",fontSize:11,letterSpacing:1.5,cursor:"pointer",fontFamily:"'Jost',sans-serif",whiteSpace:"nowrap" }}>
                  {lang==="tr"?"düzenle":"edit"}
                </button>
              </div>
              <div style={{ textAlign:"center",fontSize:10,letterSpacing:2,color:"#3a4a5a",fontFamily:"'Jost',sans-serif" }}>
                {lang==="tr" ? "Yarın yenilenir" : "Resets tomorrow"}
              </div>
            </div>
          ) : (
            /* ── Düzenlenebilir form ── */
            <>
              <div style={{ marginBottom:28 }}>
                <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:22,letterSpacing:0.5,marginBottom:14,fontWeight:300,lineHeight:1.5,color:"#c8c0e0" }}>{t("intention_q")}</div>
                <textarea className="sakin-input" rows={3} placeholder={t("intention_ph")} value={niyet} onChange={e=>setNiyet(e.target.value)} />
              </div>
              <div style={{ marginBottom:32 }}>
                <div className="label-sm" style={{ marginBottom:12 }}>{t("choose_words")}</div>
                <div style={{ display:"flex",flexWrap:"wrap",gap:7 }}>
                  {MORNING_WORDS.map(w=>(
                    <button key={w} className={`word-chip ${selectedWords.includes(w)?"selected":""}`} onClick={()=>toggleWord(w)}>{w}</button>
                  ))}
                </div>
                {selectedWords.length>0 && <div style={{ marginTop:10,fontSize:12,color:"#8a9aaa",letterSpacing:1.5 }}>{selectedWords.join(" · ")}</div>}
              </div>
              {selectedWords.length < 3 || !niyet.trim() ? (
                <div style={{ textAlign:"center", fontSize:12, color:"#5a6a7a", letterSpacing:1, padding:"12px 0" }}>
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
        <div style={{ textAlign:"center",padding:"62px 20px 110px",position:"relative",zIndex:1,maxWidth:420,width:"100%" }}>
          <div className="label-sm" style={{ marginBottom:32,letterSpacing:5 }}>{breathStarted ? t(`breath_mode_${breathMode}`) : t("breath_title")}</div>

          {/* ── Visualization area ── */}
          {(!breathStarted || breathMode==="standart") && (
            <div style={{ position:"relative",width:205,height:205,margin:"0 auto 32px" }}>
              {[1.72,1.45,1.2].map((s,i)=>(
                <div key={i} style={{ position:"absolute",inset:0,borderRadius:"50%",border:`1px solid rgba(80,130,200,${0.1-i*0.025})`,transform:`scale(${s})` }} />
              ))}
              <div style={{ position:"absolute",inset:0,borderRadius:"50%",background:"radial-gradient(circle,rgba(80,130,200,0.62),rgba(139,90,160,0.24))",transition:`transform ${breathIsActive?breathInDur:breathOutDur} ease`,transform:`scale(${breathStarted?breathScale:1})`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <div style={{ fontSize:12,letterSpacing:2,color:"rgba(255,255,255,0.82)" }}>{breathLabel}</div>
              </div>
            </div>
          )}

          {breathStarted && breathMode==="diyafram" && (
            <div style={{ display:"flex",flexDirection:"column",alignItems:"center",margin:"0 auto 18px" }}>
              <div style={{ position:"relative",width:160,height:200 }}>
              <svg width="160" height="200" viewBox="0 0 160 200" style={{ overflow:"visible" }}>
                {/* Rib cage sides */}
                <path d="M 48 38 C 36 72 34 105 55 118 M 112 38 C 124 72 126 105 105 118" fill="none" stroke="rgba(80,200,180,0.22)" strokeWidth="1.5"/>
                {/* Collar bones */}
                <path d="M 52 34 Q 80 24 108 34" fill="none" stroke="rgba(80,200,180,0.2)" strokeWidth="1.5"/>
                {/* Sternum */}
                <line x1="80" y1="34" x2="80" y2="114" stroke="rgba(80,200,180,0.12)" strokeWidth="1.5"/>
                {/* Ribs */}
                {[0,1,2,3,4].map(i=>(
                  <g key={i}>
                    <path d={`M 80 ${48+i*13} C ${50-i*2} ${52+i*13} ${40-i*2} ${62+i*13} ${42-i*2} ${72+i*13}`} fill="none" stroke="rgba(80,200,180,0.1)" strokeWidth="1.1"/>
                    <path d={`M 80 ${48+i*13} C ${110+i*2} ${52+i*13} ${120+i*2} ${62+i*13} ${118+i*2} ${72+i*13}`} fill="none" stroke="rgba(80,200,180,0.1)" strokeWidth="1.1"/>
                  </g>
                ))}
                {/* Diaphragm arc */}
                <path d="M 38 116 Q 80 94 122 116" fill="none" stroke="rgba(80,200,180,0.7)" strokeWidth="2.5"/>
                {/* Belly fill – expands on inhale */}
                <ellipse cx="80" cy="158"
                  fill={`rgba(80,200,180,${0.06 + (breathIsActive?0.22:0)})`}
                  stroke={`rgba(80,200,180,${0.25 + (breathIsActive?0.45:0)})`}
                  strokeWidth="1.8"
                  style={{
                    transformOrigin:"80px 158px",
                    transform:`scale(${breathIsActive?1:0.62})`,
                    transition:`transform ${breathIsActive?breathInDur:breathOutDur} ease-in-out, fill ${breathIsActive?breathInDur:breathOutDur} ease-in-out, stroke ${breathIsActive?breathInDur:breathOutDur} ease-in-out`,
                    rx:38, ry:28
                  }}
                />
              </svg>
              </div>
              <div style={{ fontSize:12,letterSpacing:2,color:"rgba(255,255,255,0.82)",marginTop:6 }}>{breathLabel}</div>
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
                  style={{ transition:`y ${breathIsActive?breathInDur:breathOutDur} ease-in-out, fill ${breathIsActive?breathInDur:breathOutDur} ease-in-out` }}
                />
                {/* Right lung fill */}
                <clipPath id="right-lung-clip">
                  <path d="M 105 80 C 136 80 146 110 144 145 C 142 168 124 178 105 172 C 92 168 84 155 84 140 L 84 80 Z"/>
                </clipPath>
                <rect x="78" y={172-(breathIsActive?92:0)} width="72" height="92"
                  fill={`rgba(100,160,220,${breathIsActive?0.28:0.04})`}
                  clipPath="url(#right-lung-clip)"
                  style={{ transition:`y ${breathIsActive?breathInDur:breathOutDur} ease-in-out, fill ${breathIsActive?breathInDur:breathOutDur} ease-in-out` }}
                />
              </svg>
              </div>
              <div style={{ fontSize:12,letterSpacing:2,color:"rgba(255,255,255,0.82)",marginTop:6 }}>{breathLabel}</div>
            </div>
          )}

          {breathStarted && (breathMode==="478"||breathMode==="kutu"||breathMode==="sakinletici") && (
            <div style={{ position:"relative",width:205,height:205,margin:"0 auto 32px" }}>
              {(() => {
                const modeColors = { "478":"80,160,220", kutu:"140,100,220", sakinletici:"80,200,160" };
                const c = modeColors[breathMode]||"80,130,200";
                const s = breathScale;
                return (
                  <>
                    {[1.72,1.45,1.2].map((sc,i)=>(
                      <div key={i} style={{ position:"absolute",inset:0,borderRadius:"50%",border:`1px solid rgba(${c},${0.1-i*0.025})`,transform:`scale(${sc})` }} />
                    ))}
                    <div style={{ position:"absolute",inset:0,borderRadius:"50%",background:`radial-gradient(circle,rgba(${c},0.58),rgba(${c},0.14))`,transition:`transform ${breathIsActive?breathInDur:breathOutDur} ease`,transform:`scale(${s})`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                      <div style={{ fontSize:12,letterSpacing:2,color:"rgba(255,255,255,0.82)" }}>{breathLabel}</div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Timing hint when active */}
          {breathStarted && (
            <div style={{ fontFamily:"'Jost',sans-serif",fontSize:10,letterSpacing:3,color:"rgba(255,255,255,0.2)",marginBottom:4 }}>
              {breathMode==="standart"    && "4 · 1.5 · 3.5"}
              {breathMode==="diyafram"    && "4 · 6"}
              {breathMode==="akciger"     && "5 · 2 · 7"}
              {breathMode==="478"         && "4 · 7 · 8"}
              {breathMode==="kutu"        && "4 · 4 · 4 · 4"}
              {breathMode==="sakinletici" && "4 · 2 · 8"}
            </div>
          )}

          <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:27,letterSpacing:4,fontWeight:300,marginBottom:6,color:"#c8c0e0" }}>{t("youre_here")}</div>
          <div className="label-sm" style={{ marginBottom:28 }}>{breathStarted ? t("breath_count", breathCount) : ""}</div>

          {/* ── Mode selection (before start) ── */}
          {!breathStarted && (
            <div style={{ marginBottom:28 }}>
              {/* Main breathing modes */}
              <div className="label-sm" style={{ marginBottom:14,letterSpacing:4 }}>{t("breath_choose")}</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16 }}>
                {[
                  { id:"standart", icon:"🫧", color:"rgba(80,130,200,0.18)", border:"rgba(80,130,200,0.35)", rhythm:"4·1.5·3.5" },
                  { id:"diyafram", icon:"🌬", color:"rgba(80,200,180,0.18)", border:"rgba(80,200,180,0.35)", rhythm:"4·6" },
                  { id:"akciger",  icon:"🫁", color:"rgba(100,160,220,0.18)",border:"rgba(100,160,220,0.35)",rhythm:"5·2·7" },
                ].map(m=>(
                  <button key={m.id} onClick={()=>{ if(breathMode===m.id){ playStartChime(); setBreathStarted(true); } else { setBreathMode(m.id); } }} style={{ background: breathMode===m.id ? m.color.replace("0.18","0.35") : m.color, border:`1.5px solid ${breathMode===m.id ? m.border.replace("0.35","0.75") : m.border}`, borderRadius:14, padding:"10px 6px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:5, transition:"all 0.2s ease" }}>
                    <span style={{ fontSize:20 }}>{m.icon}</span>
                    <span style={{ fontFamily:"'Jost',sans-serif",fontSize:9,letterSpacing:1.5,color:breathMode===m.id?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.5)",textTransform:"uppercase",lineHeight:1.3,textAlign:"center" }}>{t(`breath_mode_${m.id}`)}</span>
                    <span style={{ fontFamily:"'Jost',sans-serif",fontSize:8,letterSpacing:1,color:"rgba(255,255,255,0.25)" }}>{m.rhythm}</span>
                  </button>
                ))}
              </div>
              {/* Calming breathing modes */}
              <div className="label-sm" style={{ marginBottom:12,letterSpacing:4,color:"rgba(139,90,160,0.7)" }}>{t("breath_calming")}</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8 }}>
                {[
                  { id:"478",        icon:"✦",  color:"rgba(80,160,220,0.18)", border:"rgba(80,160,220,0.35)", rhythm:"4·7·8" },
                  { id:"kutu",       icon:"⬜",  color:"rgba(140,100,220,0.18)",border:"rgba(140,100,220,0.35)",rhythm:"4·4·4·4" },
                  { id:"sakinletici",icon:"🌿",  color:"rgba(80,200,160,0.18)", border:"rgba(80,200,160,0.35)", rhythm:"4·2·8" },
                ].map(m=>(
                  <button key={m.id} onClick={()=>{ if(breathMode===m.id){ playStartChime(); setBreathStarted(true); } else { setBreathMode(m.id); } }} style={{ background: breathMode===m.id ? m.color.replace("0.18","0.35") : m.color, border:`1.5px solid ${breathMode===m.id ? m.border.replace("0.35","0.75") : m.border}`, borderRadius:14, padding:"10px 6px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:5, transition:"all 0.2s ease" }}>
                    <span style={{ fontSize:18 }}>{m.icon}</span>
                    <span style={{ fontFamily:"'Jost',sans-serif",fontSize:9,letterSpacing:1.5,color:breathMode===m.id?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.5)",textTransform:"uppercase",lineHeight:1.3,textAlign:"center" }}>{t(`breath_mode_${m.id}`)}</span>
                    <span style={{ fontFamily:"'Jost',sans-serif",fontSize:8,letterSpacing:1,color:"rgba(255,255,255,0.25)" }}>{m.rhythm}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Buttons ── */}
          {!breathStarted ? (
            <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
              <button className="sakin-btn" onClick={()=>setScreen("sabah")}>{t("back")}</button>
              <button className="sakin-btn-primary" onClick={()=>{ playStartChime(); setBreathStarted(true); }}>{t("btn_start")}</button>
            </div>
          ) : (
            <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
              <button className="sakin-btn" onClick={()=>{ setBreathStarted(false); setBreathPhase("inhale"); clearInterval(breathRef.current); }}>{t("breath_change")}</button>
              <button className="sakin-btn-primary" onClick={()=>{ markStep("nefes"); setScreen("chakra"); }}>{t("btn_next")}</button>
            </div>
          )}
        </div>
      )}

      {/* ÇAKRA */}
      {screen==="chakra" && (
        <div style={{ textAlign:"center",padding:"62px 30px 110px",position:"relative",zIndex:1,maxWidth:360 }}>
          <div style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none",background:`radial-gradient(ellipse at 50% 42%,${chakra.pastel}1a 0%,transparent 58%)` }} />
          <div style={{ position:"relative",zIndex:1 }}>
            <div className="label-sm" style={{ marginBottom:34,letterSpacing:4 }}>{t("chakra_subtitle")}</div>
            <div style={{ width:146,height:146,borderRadius:"50%",margin:"0 auto 32px",background:`radial-gradient(circle,${chakra.color}cc,${chakra.pastel}44)`,boxShadow:`0 0 52px ${chakra.color}55,0 0 105px ${chakra.color}22`,animation:"slowPulse 4s ease-in-out infinite" }} />
            <div style={{ fontFamily:"'Jost',sans-serif",fontWeight:300,fontSize:11,letterSpacing:4,textTransform:"uppercase",color:chakra.pastel,marginBottom:16,opacity:0.9 }}>{chakra.name} {t("chakra_name_suf")}</div>
            <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:22,fontWeight:300,lineHeight:1.8,marginBottom:10,wordBreak:"break-word",color:"#c8c0e0" }}>{chakra.desc}</div>
            <div className="label-sm" style={{ marginBottom:30 }}>{t("chakra_stay")}</div>
            <button className="sakin-btn terapi-pill" style={{ marginBottom:28,padding:"11px 28px" }} onClick={()=>setScreen("terapi")}>{t("btn_therapy")}</button>
          </div>
        </div>
      )}

      {screen==="terapi" && <TerapiScreen onBack={()=>setScreen("chakra")} lang={lang} />}
      {screen==="gun"    && <ReminderScreen onBack={()=>setScreen("chakra")} onNext={()=>{ markStep("gun"); setScreen("aksam"); }} lang={lang} onTasksDone={setGunTasksDone} />}

      {/* AKŞAM */}
      {screen==="aksam" && (
        <div style={{ maxWidth:385,width:"100%",padding:"62px 26px 110px",position:"relative",zIndex:1 }}>
          <div style={{ textAlign:"center",marginBottom:32 }}>
            <div style={{ fontSize:32,marginBottom:9 }}>🌙</div>
            <div style={{ fontSize:10,letterSpacing:5,color:"#4a5a6a" }}>{t("evening_label")}</div>
          </div>
          {niyet && <div style={{ borderLeft:"2px solid rgba(139,90,160,0.32)",paddingLeft:15,marginBottom:26,color:"#7a8a9a",fontStyle:"italic",fontSize:15,lineHeight:1.7 }}>"{niyet}"</div>}
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:13,color:"#6a7a8a",marginBottom:9,letterSpacing:1 }}>{t("learned_q")}</div>
            <textarea className="sakin-input" rows={2} placeholder="..." value={aksamNote} onChange={e=>setAksamNote(e.target.value)} />
          </div>
          <div style={{ marginBottom:26 }}>
            <div style={{ fontSize:13,color:"#6a7a8a",marginBottom:9,letterSpacing:1 }}>{t("gratitude_q")}</div>
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
        </div>
      )}

      {/* REHBER */}
      {/* İÇSEL AYNA — Google-style merkezi arama */}
      {screen==="rehber" && (
        <div style={{ maxWidth:520,width:"100%",padding:"52px 24px 120px",position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center" }}>
          {/* Arka plan ambient */}
          <div style={{ position:"fixed",inset:0,background:"radial-gradient(ellipse 70% 50% at 50% 35%,rgba(120,60,200,0.12) 0%,transparent 70%)",pointerEvents:"none",zIndex:0 }} />

          {/* Logo gem */}
          <div style={{ position:"relative",width:56,height:56,margin:"0 auto 18px",zIndex:1 }}>
            <div style={{ position:"absolute",inset:0,transform:"rotate(45deg)",border:"1px solid rgba(184,164,216,0.35)",borderRadius:6,animation:"diamondSpin 12s linear infinite" }} />
            <div style={{ position:"absolute",inset:11,transform:"rotate(45deg)",border:"1px solid rgba(184,164,216,0.18)",borderRadius:4,animation:"diamondSpin 8s linear infinite reverse" }} />
            <div style={{ position:"absolute",inset:"50%",transform:"translate(-50%,-50%)",width:10,height:10,borderRadius:"50%",background:"rgba(184,164,216,0.8)",boxShadow:"0 0 16px rgba(184,164,216,0.6),0 0 32px rgba(122,80,150,0.4)" }} />
          </div>

          {/* Başlık */}
          <div style={{ textAlign:"center",marginBottom:36,zIndex:1 }}>
            <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:28,fontWeight:300,letterSpacing:4,color:"#d8c8f0",marginBottom:6 }}>
              {lang==="tr" ? "Kalbine Sor" : "Ask Your Heart"}
            </div>
            <div style={{ fontFamily:"'Jost',sans-serif",fontSize:9,letterSpacing:4,color:"#4a3a6a",textTransform:"uppercase" }}>
              {lang==="tr" ? "Süzgecinden geçir ve onayla" : "Filter through your heart and confirm"}
            </div>
          </div>

          {/* Ana arama kutusu veya sonuç */}
          <div style={{ width:"100%",zIndex:1 }}>
            {sikayetAnaliz === "__loading__" ? (
              <div style={{ textAlign:"center",padding:"48px 0" }}>
                <div style={{ fontSize:26,marginBottom:14,animation:"pulse 2s ease-in-out infinite" }}>🪞</div>
                <div style={{ fontSize:10,letterSpacing:4,color:"#a070d0",animation:"pulse 1.5s ease-in-out infinite",fontFamily:"'Jost',sans-serif" }}>
                  {lang==="tr" ? "YANIT HAZIRLANIYOR" : "READING"}
                </div>
              </div>
            ) : sikayetAnaliz ? (
              /* SONUÇ EKRANI */
              <div>
                <div style={{ fontSize:10,letterSpacing:2.5,color:"#a070d0",opacity:0.8,marginBottom:14,fontFamily:"'Jost',sans-serif" }}>
                  {sikayet.toUpperCase()} {t("analysis_suf")}
                </div>
                <div style={{ fontSize:15,color:"#ccc0e0",lineHeight:2.1,whiteSpace:"pre-wrap",fontFamily:"'Cormorant Garamond',Georgia,serif",marginBottom:24 }}>
                  <FreqText text={sikayetAnaliz} onNav={(type, val) => {
                    if (type === "breath") { pendingBreathRef.current = val; setScreen("nefes"); }
                    else if (type === "screen") { setScreen(val); }
                  }} />
                </div>
                <button onClick={()=>{ setSikayetAnaliz(""); setSikayet(""); setSikayetHis(""); }}
                  style={{ background:"rgba(160,112,208,0.1)",border:"1px solid rgba(160,112,208,0.3)",borderRadius:24,color:"#a070d0",cursor:"pointer",fontSize:11,letterSpacing:2.5,padding:"9px 22px",fontFamily:"'Jost',sans-serif",fontWeight:300 }}>
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
                    onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey&&sikayet.trim()){e.preventDefault();generateSikayetAnaliz();} }}
                    placeholder={lang==="tr" ? "Fiziksel, duygusal ya da ruhsal — ne merak ediyorsun?" : "Physical, emotional or spiritual — what do you wonder about?"}
                    rows={3}
                    autoFocus
                    style={{
                      width:"100%",boxSizing:"border-box",
                      background:"rgba(255,255,255,0.035)",
                      border:"1px solid rgba(160,112,208,0.3)",
                      borderRadius:18,
                      padding:"18px 60px 18px 20px",
                      color:"#d0c8e8",fontSize:16,
                      fontFamily:"'Cormorant Garamond',Georgia,serif",
                      outline:"none",resize:"none",lineHeight:1.75,
                      letterSpacing:0.5,
                      transition:"border-color 0.2s, box-shadow 0.2s",
                      boxShadow:"0 0 0 0 rgba(160,112,208,0)",
                    }}
                    onFocus={e=>{ e.target.style.borderColor="rgba(160,112,208,0.6)"; e.target.style.boxShadow="0 0 0 3px rgba(160,112,208,0.08)"; }}
                    onBlur={e=>{ e.target.style.borderColor="rgba(160,112,208,0.3)"; e.target.style.boxShadow="none"; }}
                  />
                  {/* Inline arama butonu */}
                  <button
                    onClick={generateSikayetAnaliz}
                    disabled={!sikayet.trim()}
                    style={{
                      position:"absolute",right:12,bottom:12,
                      width:38,height:38,borderRadius:"50%",
                      background:sikayet.trim()?"linear-gradient(135deg,rgba(160,112,208,0.8),rgba(100,60,200,0.6))":"rgba(255,255,255,0.05)",
                      border:"none",cursor:sikayet.trim()?"pointer":"default",
                      color:sikayet.trim()?"#fff":"#3a4058",fontSize:16,
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
                      background:"rgba(160,112,208,0.06)",
                      border:"1px solid rgba(160,112,208,0.2)",
                      borderRadius:14,padding:"12px 18px",
                      color:"#8868b0",
                      cursor:"pointer",
                      display:"flex",alignItems:"center",justifyContent:"space-between",
                      fontFamily:"'Jost',sans-serif",fontWeight:300,
                      transition:"all 0.2s",
                    }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(160,112,208,0.4)"; e.currentTarget.style.color="#b090d8"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(160,112,208,0.2)"; e.currentTarget.style.color="#8868b0"; }}>
                    <span style={{ fontSize:11,letterSpacing:2 }}>{lang==="tr" ? "NE SORABİLİRİM?" : "WHAT CAN I ASK?"}</span>
                    <span style={{ fontSize:14,transition:"transform 0.25s",display:"inline-block",transform:showOrnekler?"rotate(180deg)":"rotate(0deg)" }}>⌄</span>
                  </button>

                  {showOrnekler && (
                    <div style={{
                      marginTop:8,
                      background:"linear-gradient(160deg,rgba(12,5,32,0.97),rgba(8,4,22,0.95))",
                      border:"1px solid rgba(160,112,208,0.2)",
                      borderRadius:16,padding:"18px 16px",
                      boxShadow:"0 8px 40px rgba(0,0,0,0.6),0 0 30px rgba(160,112,208,0.08)",
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
                          <div style={{ fontSize:9,letterSpacing:2.5,color:"rgba(160,112,208,0.6)",marginBottom:8,fontFamily:"'Jost',sans-serif" }}>{cat.toUpperCase()}</div>
                          {sorular.map(s=>(
                            <button key={s} onClick={()=>{ setSikayet(s); setShowOrnekler(false); }}
                              style={{
                                display:"block",width:"100%",textAlign:"left",
                                background:"none",border:"none",
                                borderBottom:"1px solid rgba(255,255,255,0.04)",
                                padding:"9px 4px",
                                color:"#b0a0cc",
                                fontSize:13,
                                fontFamily:"'Cormorant Garamond',Georgia,serif",
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

                {/* Dev mode */}
                <div style={{ textAlign:"center",marginTop:24 }}>
                  <button onClick={toggleDevMode}
                    style={{ background:devMode?"rgba(255,180,0,0.1)":"transparent",border:`1px solid ${devMode?"rgba(255,180,0,0.3)":"rgba(255,255,255,0.05)"}`,borderRadius:6,padding:"3px 8px",color:devMode?"#f0c040":"#3a4058",fontSize:9,letterSpacing:1.5,cursor:"pointer",fontFamily:"monospace" }}>
                    {devMode ? "DEV ✓" : "DEV"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HARİTA */}
      {screen==="harita" && (
        <div style={{ maxWidth:405,width:"100%",padding:"62px 26px 110px",position:"relative",zIndex:1 }}>
          <div style={{ textAlign:"center",marginBottom:40 }}>
            <div style={{ fontSize:10,letterSpacing:5,color:"#4a5a6a",marginBottom:9 }}>{t("weekly_label")}</div>
            <div style={{ fontSize:26,fontWeight:300,letterSpacing:2 }}>{t("inner_map")}</div>
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
              <div style={{ fontSize:26,fontWeight:300 }}>{Math.round(dayPct)}%</div>
              <div style={{ fontSize:9,letterSpacing:3,color:"#4a5a6a" }}>{t("day_pct")}</div>
            </div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:32 }}>
            {[
              {label:t("stat_chakra"),value:chakra.name,color:chakra.pastel},
              {label:t("stat_breath"),value:`${breathCount}`,color:"#82d9a3"},
              {label:t("stat_word"),value:selectedWords[0]||"—",color:"#f0c27f"},
              {label:t("stat_mindful"),value:"3",color:"#85c1e9"},
            ].map((s,i)=>(
              <div key={i} style={{ background:"rgba(255,255,255,0.022)",border:"1px solid rgba(255,255,255,0.055)",borderRadius:13,padding:"13px 15px" }}>
                <div style={{ fontSize:9,letterSpacing:2.5,color:"#4a5a6a",marginBottom:6 }}>{s.label.toUpperCase()}</div>
                <div style={{ fontSize:17,color:s.color,fontWeight:300 }}>{s.value}</div>
              </div>
            ))}
          </div>
          {/* ── 12. Ev Kartı ── */}
          {ev12Burcu && ev12Gezegen && EV12_BURCU_ACIKLAMA[ev12Burcu] ? (
            <div style={{ background:"linear-gradient(135deg,rgba(60,30,100,0.18),rgba(30,50,120,0.10))",border:"1px solid rgba(120,80,200,0.28)",borderRadius:17,padding:"18px 20px",marginBottom:24 }}>
              <div style={{ fontSize:10,letterSpacing:3.5,color:"#9070c0",marginBottom:12,textAlign:"center" }}>
                {lang==="tr" ? "12. EV · GİZLİ BENLİK" : "12TH HOUSE · HIDDEN SELF"}
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:14 }}>
                <div style={{ width:44,height:44,borderRadius:"50%",flexShrink:0,background:"radial-gradient(circle,rgba(120,80,220,0.5),rgba(60,30,120,0.2))",border:"1px solid rgba(120,80,200,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>
                  ♆
                </div>
                <div>
                  <div style={{ fontSize:13,letterSpacing:0.5,color:"#c8b0e8",marginBottom:2 }}>{ev12Burcu} {lang==="tr" ? "Burcu" : "Sign"}</div>
                  <div style={{ fontSize:11,color:"#7060a0",letterSpacing:1 }}>{lang==="tr" ? "Yönetici:" : "Ruler:"} {ev12Gezegen}</div>
                </div>
              </div>
              <div style={{ fontSize:11,letterSpacing:2,color:"#8060b0",marginBottom:8,fontStyle:"italic" }}>
                {EV12_BURCU_ACIKLAMA[ev12Burcu].tema}
              </div>
              <div style={{ fontSize:12.5,color:"#b0a0d0",lineHeight:1.85 }}>
                {EV12_BURCU_ACIKLAMA[ev12Burcu].yorum}
              </div>
              <div style={{ marginTop:12,paddingTop:12,borderTop:"1px solid rgba(120,80,200,0.15)" }}>
                <div style={{ fontSize:10,letterSpacing:2,color:"#7060a0",marginBottom:4 }}>{lang==="tr" ? "GİZLİ GÜCÜN" : "HIDDEN POWER"}</div>
                <div style={{ fontSize:12,color:"#c0b0e0",fontStyle:"italic" }}>{GEZEGEN_12EV_GUCLERI[ev12Gezegen]}</div>
              </div>
            </div>
          ) : birthDate && !birthTime ? (
            <div style={{ background:"rgba(60,30,100,0.08)",border:"1px solid rgba(120,80,200,0.15)",borderRadius:17,padding:"14px 18px",marginBottom:24,textAlign:"center" }}>
              <div style={{ fontSize:11,color:"#7060a0",lineHeight:1.7 }}>
                {lang==="tr"
                  ? "12. Ev analizin için doğum saatini ekle → Profil → Doğum Saati"
                  : "Add your birth time for 12th house analysis → Profile → Birth Time"}
              </div>
            </div>
          ) : null}
          <div style={{ background:"linear-gradient(135deg,rgba(139,90,160,0.09),rgba(72,130,180,0.05))",border:"1px solid rgba(139,90,160,0.16)",borderRadius:17,padding:"16px 20px",marginBottom:24,textAlign:"center" }}>
            <div style={{ fontSize:10,letterSpacing:3.5,color:"#7a5a90",marginBottom:7 }}>{t("orchestra_label")}</div>
            <div style={{ marginBottom:5 }}>
              {[...Array(7)].map((_,i)=>(
                <span key={i} style={{ display:"inline-block",width:8,height:8,borderRadius:"50%",background:`radial-gradient(circle,${CHAKRAS_7[i].pastel},transparent)`,margin:"0 3px",animation:`pulse ${1+i*0.2}s ease-in-out infinite`,animationDelay:`${i*0.14}s` }} />
              ))}
            </div>
            <div style={{ fontSize:12,color:"#7a8a9a" }} dangerouslySetInnerHTML={{ __html: t("orchestra_text", "312") }} />
          </div>
          <div style={{ background:"linear-gradient(135deg,rgba(100,60,160,0.12),rgba(60,80,140,0.07))",border:"1px solid rgba(139,90,160,0.22)",borderRadius:17,padding:"18px 20px",marginBottom:24 }}>
            <div style={{ fontSize:10,letterSpacing:3.5,color:"#9a6ab0",marginBottom:12,textAlign:"center" }}>{t("ai_report_label")}</div>
            {raporKullanildi && !aiRapor && !aiLoading ? (
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:23,marginBottom:10 }}>✨</div>
                <div style={{ fontSize:14,color:"#c8a0e0",fontWeight:300,marginBottom:8 }}>{t("free_used")}</div>
                <div style={{ fontSize:12,color:"#5a6a7a",lineHeight:1.8,marginBottom:16 }}>
                  {t("free_used_body")}<br/>
                  <strong style={{ color:"#9a7ab8" }}>{t("premium_name")}</strong>{t("premium_suffix")}
                </div>
                <div style={{ background:"rgba(139,90,160,0.08)",border:"1px solid rgba(139,90,160,0.2)",borderRadius:12,padding:"12px 16px",marginBottom:14 }}>
                  <div style={{ fontSize:11,letterSpacing:2,color:"#7a5a90",marginBottom:6 }}>{t("premium_label")}</div>
                  <div style={{ fontSize:13,color:"#c0b0d0",lineHeight:1.7 }}>
                    {t("premium_feat1")}<br/>
                    {t("premium_feat2")}<br/>
                    {t("premium_feat3")}
                  </div>
                </div>
                <a href="mailto:destek@sakin.app?subject=Premium%20%C3%9Cyelik"
                  style={{ display:"inline-block",padding:"9px 22px",background:"linear-gradient(135deg,rgba(139,90,160,0.7),rgba(72,100,200,0.5))",border:"1px solid rgba(139,90,160,0.4)",borderRadius:22,color:"#e0d0f0",fontSize:12,letterSpacing:1,textDecoration:"none",cursor:"pointer" }}>
                  {t("btn_go_premium")}
                </a>
              </div>
            ) : !aiRapor && !aiLoading ? (
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:12,color:"#5a6a7a",marginBottom:14,lineHeight:1.7 }}>{t("report_invite").split("\n").map((l,i)=><span key={i}>{l}{i===0&&<br/>}</span>)}</div>
                <button className="sakin-btn-primary"
                  style={{ background:"linear-gradient(135deg,rgba(139,90,160,0.7),rgba(72,100,200,0.5))",borderColor:"rgba(139,90,160,0.4)",fontSize:12 }}
                  onClick={generateRapor}>{t("btn_gen_report")}</button>
              </div>
            ) : aiLoading ? (
              <div style={{ textAlign:"center",padding:"12px 0" }}>
                <div style={{ fontSize:10,letterSpacing:3,color:"#7a5a90",animation:"pulse 1.5s ease-in-out infinite" }}>{t("generating")}</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize:13.5,color:"#c8bedd",lineHeight:1.9,whiteSpace:"pre-wrap" }}><FreqText text={aiRapor} /></div>
                <div style={{ display:"flex",gap:8,marginTop:14,flexWrap:"wrap" }}>
                  <button onClick={()=>{ navigator.clipboard.writeText(aiRapor).then(()=>{ setRaporKopyalandi(true); setTimeout(()=>setRaporKopyalandi(false),2000); }); }}
                    style={{ background:raporKopyalandi?"rgba(80,180,120,0.2)":"rgba(255,255,255,0.05)",border:`1px solid ${raporKopyalandi?"rgba(80,180,120,0.4)":"rgba(255,255,255,0.1)"}`,borderRadius:20,padding:"7px 16px",cursor:"pointer",color:raporKopyalandi?"#80e0a0":"#8a9ab0",fontSize:10,letterSpacing:2 }}>
                    {raporKopyalandi ? t("copied_label") : t("copy_label")}
                  </button>
                  {navigator.share && (
                    <button onClick={()=>navigator.share({ title:t("share_title"), text:aiRapor })}
                      style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,padding:"7px 16px",cursor:"pointer",color:"#8a9ab0",fontSize:10,letterSpacing:2 }}>
                      {t("share_label")}
                    </button>
                  )}
                  <button onClick={()=>setAiRapor("")}
                    style={{ background:"none",border:"none",color:"#4a5a6a",cursor:"pointer",fontSize:10,letterSpacing:2,marginLeft:"auto" }}>
                    {t("refresh_label")}
                  </button>
                </div>
              </div>
            )}
          </div>
          <button className="sakin-btn" style={{ width:"100%" }} onClick={()=>{ markStep("harita"); setScreen("mandala"); }}>{t("btn_new_day")}</button>
        </div>
      )}

      {/* SAKİN NEDİR? */}
      {screen==="hakkinda" && (
        <div className="policy-screen">
          {/* Dekoratif geometrik element */}
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:48 }}>
            <div style={{ position:"relative", width:40, height:40, flexShrink:0 }}>
              <div style={{ position:"absolute", inset:0, transform:"rotate(45deg)", border:"1px solid rgba(184,164,216,0.25)", borderRadius:3 }} />
              <div style={{ position:"absolute", inset:10, transform:"rotate(45deg)", border:"1px solid rgba(184,164,216,0.15)", borderRadius:2 }} />
              <div style={{ position:"absolute", inset:"50%", transform:"translate(-50%,-50%)", width:6, height:6, borderRadius:"50%", background:"rgba(184,164,216,0.5)" }} />
            </div>
            <div>
              <h1 style={{ margin:0 }}>{lang==="tr" ? "Sakin Nedir?" : "What is Sakin?"}</h1>
              <div className="subtitle" style={{ margin:0 }}>{lang==="tr" ? "Bir kanal. Bir sistem. Bir yol arkadaşı." : "A channel. A system. A companion."}</div>
            </div>
          </div>

          <p style={{ fontSize:18, lineHeight:2.1, color:"#c8c0e0", fontStyle:"italic", marginBottom:32, borderLeft:"2px solid rgba(184,164,216,0.2)", paddingLeft:20 }}>
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

          <div className="divider" />
          <p style={{ fontSize:14, color:"#4a5570", letterSpacing:1, textAlign:"center" }}>
            {lang==="tr" ? "Sakin · Farkındalık Sistemi · 2025" : "Sakin · Awareness System · 2025"}
          </p>
        </div>
      )}

      {/* FİYATLANDIRMA */}
      {screen==="fiyat" && (
        <div className="policy-screen">
          <h1>{t("pricing_title")}</h1>
          <div className="subtitle">{t("pricing_sub")}</div>

          {/* Ücretsiz */}
          <div className="pricing-card" style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.08)" }}>
            <div className="pricing-badge" style={{ background:"rgba(100,120,150,0.15)",border:"1px solid rgba(100,120,150,0.25)",color:"#7a9abb" }}>{t("free_badge")}</div>
            <div style={{ fontSize:20,fontWeight:300,letterSpacing:2,marginBottom:4,color:"#e8e0d5" }}>{t("free_plan")}</div>
            <div style={{ fontSize:29,color:"#c8c0b8",letterSpacing:1,marginBottom:14 }}>₺0 <span style={{ fontSize:12,color:"#4a5a6a" }}>{t("free_forever")}</span></div>
            <ul>{t("free_features").map(f=>(<li key={f}>{f}</li>))}</ul>
          </div>

          {/* Premium */}
          <div className="pricing-card" style={{ background:"rgba(139,90,160,0.06)",border:"1px solid rgba(139,90,160,0.3)" }}>
            <div className="pricing-badge" style={{ background:"rgba(139,90,160,0.18)",border:"1px solid rgba(139,90,160,0.4)",color:"#c3a6d8" }}>{t("premium_badge")}</div>
            <div style={{ fontSize:20,fontWeight:300,letterSpacing:2,marginBottom:4,color:"#e8e0d5" }}>{t("premium_plan")}</div>
            <div style={{ fontSize:29,color:"#c8a96e",letterSpacing:1,marginBottom:14 }}>₺99 <span style={{ fontSize:12,color:"#4a5a6a" }}>{t("one_time")}</span></div>
            <ul>{t("premium_features").map(f=>(<li key={f}>{f}</li>))}</ul>
          </div>

          {/* 21 Günlük */}
          <div className="pricing-card" style={{ background:"rgba(45,120,65,0.06)",border:"1px solid rgba(45,120,65,0.22)" }}>
            <div className="pricing-badge" style={{ background:"rgba(45,120,65,0.18)",border:"1px solid rgba(45,120,65,0.35)",color:"#82d9a3" }}>{t("program21_badge")}</div>
            <div style={{ fontSize:20,fontWeight:300,letterSpacing:2,marginBottom:4,color:"#e8e0d5" }}>{t("program21_plan")}</div>
            <div style={{ fontSize:29,color:"#c8a96e",letterSpacing:1,marginBottom:14 }}>₺149</div>
            <ul>{t("program21_features").map(f=>(<li key={f}>{f}</li>))}</ul>
          </div>

          {/* Hediye */}
          <div className="pricing-card" style={{ background:"rgba(192,57,43,0.06)",border:"1px solid rgba(192,57,43,0.22)" }}>
            <div className="pricing-badge" style={{ background:"rgba(192,57,43,0.18)",border:"1px solid rgba(192,57,43,0.35)",color:"#f48fb1" }}>{t("gift_badge")}</div>
            <div style={{ fontSize:20,fontWeight:300,letterSpacing:2,marginBottom:4,color:"#e8e0d5" }}>{t("gift_plan")}</div>
            <div style={{ fontSize:29,color:"#c8a96e",letterSpacing:1,marginBottom:14 }}>₺199</div>
            <p>{t("gift_desc")}</p>
          </div>

          <hr className="divider" />
          <p style={{ fontSize:12,color:"#4a5a6a",textAlign:"center",letterSpacing:1 }}>{t("pricing_footer")} <a href="mailto:destek@sakin.app" style={{ color:"#7a5a90",textDecoration:"none" }}>destek@sakin.app</a></p>
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
          <h2>{t("terms_s9")}</h2><p>{t("terms_s9p")} <a href="mailto:destek@sakin.app" style={{ color:"#7a5a90",textDecoration:"none" }}>destek@sakin.app</a></p>
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
          <p>{t("privacy_s10p")} <a href="mailto:destek@sakin.app" style={{ color:"#7a5a90",textDecoration:"none" }}>destek@sakin.app</a></p>
          <p style={{ fontSize:12,color:"#3a4a5a" }}>{t("privacy_app_name")}</p>
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
          <p>{t("refund_s5p2")} <a href="mailto:destek@sakin.app" style={{ color:"#7a5a90",textDecoration:"none" }}>destek@sakin.app</a></p>
          <p>{t("refund_s5p3")}</p>

          <h2>{t("refund_s6")}</h2>
          <p>{t("refund_s6p")}</p>

          <h2>{t("refund_s7")}</h2>
          <p>{t("refund_s7p")} <a href="mailto:destek@sakin.app" style={{ color:"#7a5a90",textDecoration:"none" }}>destek@sakin.app</a></p>
        </div>
      )}

      {/* BOTTOM NAV */}
      {!["giris","mandala","terapi","hakkinda","fiyat","sartlar","gizlilik","iade"].includes(screen) && (
        <div style={{ position:"fixed",bottom:16,left:"50%",transform:"translateX(-50%)",display:"flex",gap:2,alignItems:"center",zIndex:9999,background:"rgba(8,12,20,0.92)",backdropFilter:"blur(32px)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:100,padding:"6px 8px",maxWidth:"calc(100vw - 24px)" }}>
          {NAV.map(n=>{
            const active = screen===n.id;
            const pulse = n.id==="mandala" && screen==="rehber";
            return (
              <button key={n.id} onClick={()=>{ setScreen(n.id); }}
                style={{
                  background: pulse ? `${n.color}18` : active ? `${n.color}22` : "transparent",
                  border: pulse ? `1px solid ${n.color}55` : active ? `1px solid ${n.color}44` : "1px solid transparent",
                  borderRadius:22,
                  cursor: n.id==="sabah" && stepsCompleted["sabah"] ? "not-allowed" : "pointer",
                  transition:"all 0.28s",
                  padding:"8px 12px",
                  display:"flex",flexDirection:"column",alignItems:"center",gap:3,
                  minWidth:48,
                  opacity: n.id==="sabah" && stepsCompleted["sabah"] ? 0.32 : 1,
                  animation: pulse ? "navPulse 2s ease-in-out infinite" : "none",
                }}>
                <span style={{ fontSize:active?18:pulse?16:15, color: active ? n.color : pulse ? n.color : `${n.color}55`, transition:"all 0.28s", lineHeight:1 }}>{n.icon}</span>
                <span style={{ fontFamily:"'Jost',sans-serif",fontWeight:300,fontSize:8,letterSpacing:1.5,textTransform:"uppercase",color:active?n.color:pulse?n.color:`${n.color}44`,transition:"color 0.28s",lineHeight:1 }}>{n.label}</span>
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
            { term: "Reiki Nedir?", desc: "Japonca \"evrensel yaşam enerjisi\" anlamına gelen bir enerji şifa yöntemidir. Ellerin enerji merkezlerine (çakralara) yerleştirilmesiyle vücudun doğal şifa mekanizmasını aktive eder. Tıbbi bir tedavi değildir; tamamlayıcı bir wellness pratiğidir." },
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
          <div style={{ position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:99999,background:"rgba(8,12,20,0.97)",backdropFilter:"blur(30px)",overflowY:"auto",animation:"fadeIn 0.3s ease" }}>
            <div style={{ maxWidth:540,margin:"0 auto",padding:"24px 20px 60px" }}>
              {/* Header */}
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
                <div>
                  <div style={{ fontFamily:"'Jost',sans-serif",fontSize:10,fontWeight:300,letterSpacing:4,color:"#4a5570",textTransform:"uppercase",marginBottom:4 }}>{t("guide_help_sub")}</div>
                  <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:26,fontWeight:300,color:"#ddd8f0",letterSpacing:2 }}>{t("guide_help_title")}</div>
                </div>
                <button onClick={() => setShowKilavuz(false)} style={{ background:"rgba(192,57,43,0.15)",border:"1px solid rgba(192,57,43,0.3)",borderRadius:100,padding:"8px 20px",cursor:"pointer",color:"#e8a0a0",fontFamily:"'Jost',sans-serif",fontSize:11,letterSpacing:2,textTransform:"uppercase",transition:"all 0.2s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.background="rgba(192,57,43,0.3)"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background="rgba(192,57,43,0.15)"; }}
                >{t("guide_close")}</button>
              </div>
              <div style={{ height:1,background:"linear-gradient(90deg,transparent,rgba(192,57,43,0.3),transparent)",margin:"18px 0 28px" }} />

              {/* Categories */}
              {glossary.map((cat, ci) => (
                <div key={ci} style={{ marginBottom:32 }}>
                  <div style={{ fontFamily:"'Jost',sans-serif",fontSize:11,fontWeight:300,letterSpacing:3,textTransform:"uppercase",color:"#c0392b",marginBottom:16,display:"flex",alignItems:"center",gap:10 }}>
                    <span style={{ width:18,height:1,background:"#c0392b" }} />
                    {cat.cat}
                  </div>
                  {cat.items.map((item, ii) => (
                    <div key={ii} style={{ marginBottom:18,padding:"16px 18px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,transition:"all 0.2s" }}>
                      <div style={{ fontFamily:"'Jost',sans-serif",fontSize:14,fontWeight:400,color:"#ddd8f0",letterSpacing:0.5,marginBottom:8 }}>{item.term}</div>
                      <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:15,color:"#9a96b0",lineHeight:1.9,letterSpacing:0.3 }}>{item.desc}</div>
                      {item.examples && (
                        <div style={{ marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                          {item.examples.map((ex, ei) => (
                            <div key={ei} style={{ display:"flex",gap:10,marginBottom:8,alignItems:"flex-start" }}>
                              <span style={{ fontFamily:"'Jost',sans-serif",fontSize:13,fontWeight:400,color:"#c0392b",minWidth:28,flexShrink:0,background:"rgba(192,57,43,0.1)",borderRadius:6,padding:"2px 6px",textAlign:"center" }}>{ex.num}</span>
                              <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:14,color:"#8a86a0",lineHeight:1.75 }}>{ex.meaning}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              <div style={{ textAlign:"center",padding:"20px 0" }}>
                <button onClick={() => setShowKilavuz(false)} style={{ background:"linear-gradient(135deg,rgba(192,57,43,0.4),rgba(192,57,43,0.25))",border:"1px solid rgba(192,57,43,0.35)",borderRadius:100,padding:"12px 36px",cursor:"pointer",color:"#e8c0c0",fontFamily:"'Jost',sans-serif",fontSize:12,letterSpacing:2.5,textTransform:"uppercase",transition:"all 0.2s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.background="linear-gradient(135deg,rgba(192,57,43,0.6),rgba(192,57,43,0.4))"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background="linear-gradient(135deg,rgba(192,57,43,0.4),rgba(192,57,43,0.25))"; }}
                >{t("guide_close")}</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
