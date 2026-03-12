import { useState, useEffect, useRef } from "react";
import { makeTrans } from "./i18n";

const ARAMA_API_KEY = import.meta.env.VITE_ARAMA_API_KEY;
const RAPOR_API_KEY = import.meta.env.VITE_RAPOR_API_KEY;

const CHAKRAS_7_TR = [
  { name:"Kök",            color:"#c0392b", pastel:"#e8a09a", desc:"Bugün yere bas. Güvende hisset.",  element:"Toprak", emoji:"🟥" },
  { name:"Sakral",         color:"#e67e22", pastel:"#f0c27f", desc:"Bugün hisset. Akmana izin ver.",   element:"Su",     emoji:"🟧" },
  { name:"Güneş Pleksusu", color:"#f1c40f", pastel:"#f7e18a", desc:"Bugün güçlü ol. Işığın var.",     element:"Ateş",   emoji:"🟨" },
  { name:"Kalp",           color:"#27ae60", pastel:"#82d9a3", desc:"Bugün sevgiyle aç. Kendine de.",  element:"Hava",   emoji:"🟩" },
  { name:"Boğaz",          color:"#2980b9", pastel:"#85c1e9", desc:"Bugün hakikatini söyle.",          element:"Ses",    emoji:"🟦" },
  { name:"Üçüncü Göz",    color:"#8e44ad", pastel:"#c3a6d8", desc:"Bugün içeriye bak.",               element:"Işık",   emoji:"🟣" },
  { name:"Taç",            color:"#9b59b6", pastel:"#d9b8e8", desc:"Bugün bütünle bağlan.",            element:"Evren",  emoji:"⬜" },
];
const CHAKRAS_7_EN = [
  { name:"Root",         color:"#c0392b", pastel:"#e8a09a", desc:"Ground yourself today. Feel safe.",     element:"Earth",   emoji:"🟥" },
  { name:"Sacral",       color:"#e67e22", pastel:"#f0c27f", desc:"Feel today. Let yourself flow.",        element:"Water",   emoji:"🟧" },
  { name:"Solar Plexus", color:"#f1c40f", pastel:"#f7e18a", desc:"Be strong today. You have your light.", element:"Fire",    emoji:"🟨" },
  { name:"Heart",        color:"#27ae60", pastel:"#82d9a3", desc:"Open with love today. For yourself too.",element:"Air",    emoji:"🟩" },
  { name:"Throat",       color:"#2980b9", pastel:"#85c1e9", desc:"Speak your truth today.",               element:"Sound",   emoji:"🟦" },
  { name:"Third Eye",    color:"#8e44ad", pastel:"#c3a6d8", desc:"Look inward today.",                    element:"Light",   emoji:"🟣" },
  { name:"Crown",        color:"#9b59b6", pastel:"#d9b8e8", desc:"Connect with the whole today.",         element:"Universe",emoji:"⬜" },
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
  { id:"gok",       icon:"☁️", title:"Gökyüzüne bak",             subtitle:"Bugün gökyüzüne baktın mı?",                             duration:null,color:"rgba(80,140,200,0.7)",  borderColor:"rgba(80,140,200,0.25)",  notifBody:"Başını kaldır. Gökyüzüne bak. Sadece bak." },
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
  { id:"gok",       icon:"☁️", title:"Look at the sky",               subtitle:"Have you looked at the sky today?",                       duration:null,color:"rgba(80,140,200,0.7)",  borderColor:"rgba(80,140,200,0.25)",  notifBody:"Lift your head. Look at the sky. Just look." },
  { id:"chakra_an", icon:"💜", title:"Chakra moment",                  subtitle:"Pause for a moment in today's chakra.",                   duration:null,color:"rgba(139,90,160,0.7)", borderColor:"rgba(139,90,160,0.25)",  notifBody:"Close your eyes. Feel today's chakra. One breath is enough." },
  { id:"sosyal",    icon:"📵", title:"Social media break",             subtitle:"Do you really want to be here right now?",                duration:null,color:"rgba(200,80,80,0.7)",   borderColor:"rgba(200,80,80,0.25)",   notifBody:"Put the phone down. Just exist for a minute. The screen can wait, the moment can't." },
];
const getReminders = (lang) => lang === "en" ? REMINDERS_EN : REMINDERS_TR;
const REMINDERS = REMINDERS_TR;

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Jost:wght@200;300;400&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&display=swap');
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
  .word-chip.selected { background:rgba(184,164,216,0.1); border-color:rgba(184,164,216,0.35); color:#ddd8f0; }

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
    width:26px; height:26px; border-radius:6px; flex-shrink:0; margin-top:2px;
    border:1px solid rgba(255,255,255,0.14); background:transparent;
    cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center;
    font-size:13px;
  }
  .check-btn.checked { background:rgba(100,200,120,0.2); border-color:rgba(100,200,120,0.5); animation:checkPop 0.3s ease; }
  .notif-btn {
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
    border-radius:100px; color:#6a6d88; cursor:pointer;
    font-family:'Jost',sans-serif; font-weight:300;
    font-size:10px; letter-spacing:2px; text-transform:uppercase;
    padding:5px 13px; transition:all 0.2s; white-space:nowrap; flex-shrink:0;
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
    font-family:'Jost',sans-serif; font-size:10px; font-weight:300;
    letter-spacing:3px; text-transform:uppercase; color:#3a4058; margin-bottom:42px;
  }
  .policy-screen h2 {
    font-family:'Jost',sans-serif; font-size:11px; font-weight:400;
    letter-spacing:3px; text-transform:uppercase; color:#8a72a8;
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
    font-size:9px; letter-spacing:2.5px; text-transform:uppercase;
    padding:3px 11px; border-radius:100px; margin-bottom:11px;
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

function ReminderScreen({ onBack, onNext, lang = "tr" }) {
  const t = makeTrans(lang);
  const REMINDERS = getReminders(lang);
  const [done,    setDone]    = useState({});
  const [sent,    setSent]    = useState({});
  const [timing,  setTiming]  = useState(null);
  const [notifOk, setNotifOk] = useState(null);
  const timerRef = useRef(null);

  const completedCount = Object.values(done).filter(Boolean).length;

  const toggleDone = (id) => {
    if (timing?.id === id) { clearInterval(timerRef.current); setTiming(null); }
    setDone(p => ({ ...p, [id]: !p[id] }));
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
          setDone(p => ({ ...p, [rem.id]: true }));
          return null;
        }
        return { ...t, elapsed: next };
      });
    }, 1000);
  };

  const handleNotif = async (rem) => {
    const result = await sendNotif("Sakin · " + rem.title, rem.notifBody);
    if (result !== "sent") { setNotifOk(false); return; }
    setNotifOk(true);
    setSent(p => ({ ...p, [rem.id]: true }));
    setTimeout(() => setSent(p => ({ ...p, [rem.id]: false })), 4000);
  };

  const sendAllNotifs = async () => {
    if (!("Notification" in window)) { setNotifOk(false); return; }
    const perm = await Notification.requestPermission();
    if (perm !== "granted") { setNotifOk(false); return; }
    setNotifOk(true);
    REMINDERS.forEach((rem, i) => {
      setTimeout(() => {
        new Notification("Sakin · " + rem.title, { body: rem.notifBody });
        setSent(p => ({ ...p, [rem.id]: true }));
      }, i * 600);
    });
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  return (
    <div style={{ maxWidth:430, width:"100%", padding:"62px 20px 120px", position:"relative", zIndex:1 }}>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:8 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#5a6a7a", cursor:"pointer", fontSize:19, padding:0 }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:10, letterSpacing:5, color:"#4a5a6a" }}>{t("day_label")}</div>
          <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:21, fontWeight:300, letterSpacing:1.5 }}>{t("reminders_title")}</div>
        </div>
        <div style={{
          background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
          borderRadius:100, padding:"5px 14px", fontSize:13, color:"#8a9aaa", letterSpacing:1,
        }}>{completedCount} / {REMINDERS.length}</div>
      </div>

      <div style={{ height:2, background:"rgba(255,255,255,0.05)", borderRadius:1, marginBottom:20, overflow:"hidden" }}>
        <div style={{
          height:"100%", borderRadius:1,
          background:"linear-gradient(90deg,#8b5aa0,#4a82b4)",
          width:`${(completedCount/REMINDERS.length)*100}%`,
          transition:"width 0.5s ease",
        }} />
      </div>

      {notifOk === false && (
        <div style={{ background:"rgba(200,80,80,0.12)", border:"1px solid rgba(200,80,80,0.22)", borderRadius:12, padding:"10px 14px", marginBottom:14, fontSize:13, color:"#e8a0a0", lineHeight:1.6 }}>
          {t("notif_denied")}
        </div>
      )}
      {notifOk === true && (
        <div style={{ background:"rgba(80,180,100,0.1)", border:"1px solid rgba(80,180,100,0.22)", borderRadius:12, padding:"10px 14px", marginBottom:14, fontSize:13, color:"#82d9a3", lineHeight:1.6, animation:"fadeIn 0.4s ease" }}>
          {t("notif_sent_ok")}
        </div>
      )}

      <button className="sakin-btn" style={{ width:"100%", marginBottom:18, fontSize:12, letterSpacing:2 }} onClick={sendAllNotifs}>
        {t("send_all")}
      </button>

      <div style={{ maxHeight:"60vh", overflowY:"auto", paddingRight:2, scrollbarWidth:"none" }}>
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
              <button className={`notif-btn ${sent[rem.id]?"sent":""}`} onClick={() => handleNotif(rem)}>
                {sent[rem.id] ? t("sent_label") : t("notify_label")}
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
          <div style={{ fontSize:29, marginBottom:8 }}>🌿</div>
          <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:19, color:"#82d9a3", letterSpacing:1 }}>
            {t("all_done_msg")}
          </div>
        </div>
      )}

      <button
        className="sakin-btn-primary"
        onClick={onNext}
        style={{ width:"100%", marginTop:22, fontSize:12, letterSpacing:2 }}
      >
        {t("btn_to_evening")}
      </button>
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

  const progress  = Math.min(elapsed/TERAPI_TOTAL,1);
  const remaining = TERAPI_TOTAL-elapsed;
  const mins = String(Math.floor(remaining/60)).padStart(2,"0");
  const secs = String(remaining%60).padStart(2,"0");

  useEffect(() => {
    if (tPhase!=="active") return;
    timerRef.current = setInterval(() => {
      setElapsed(e => {
        if (e>=TERAPI_TOTAL) { clearInterval(timerRef.current); setTPhase("done"); return TERAPI_TOTAL; }
        return e+1;
      });
    },1000);
    return () => clearInterval(timerRef.current);
  },[tPhase]);

  useEffect(() => {
    if (tPhase!=="active") return;
    particleRef.current = setInterval(() => {
      setParticles(prev => {
        const p = { id:Date.now()+Math.random(), x:33+Math.random()*34, y:42+Math.random()*22, size:3+Math.random()*5, dur:2+Math.random()*3, dx:(Math.random()-0.5)*65, dy:-(38+Math.random()*65) };
        return [...prev.slice(-32),p];
      });
    },170);
    return () => clearInterval(particleRef.current);
  },[tPhase]);

  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const resetTerapi = () => { setTPhase("list"); setSelected(null); setElapsed(0); setParticles([]); setShowBackConfirm(false); clearInterval(timerRef.current); clearInterval(particleRef.current); };
  const heartAnim = tPhase==="active" ? `heartbeat ${1.15-progress*0.28}s ease-in-out infinite` : "none";
  const hex = v => Math.round(v*255).toString(16).padStart(2,"0");

  if (tPhase==="list") return (
    <div style={{ maxWidth:440, width:"100%", padding:"62px 20px 120px", position:"relative", zIndex:1 }}>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:28 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#5a6a7a", cursor:"pointer", fontSize:19, padding:0 }}>←</button>
        <div>
          <div style={{ fontSize:10, letterSpacing:5, color:"#4a5a6a" }}>{t("reiki_label")}</div>
          <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:22, fontWeight:300, letterSpacing:2 }}>{t("therapy_title")}</div>
        </div>
      </div>
      <div style={{ maxHeight:"62vh", overflowY:"auto", paddingRight:4, scrollbarWidth:"none" }}>
        {CHAKRAS_22.map((c,i) => (
          <div key={c.name} className={`chakra-card slide-in ${selected?.name===c.name?"active":""}`}
            style={{ marginBottom:8, animationDelay:`${i*0.04}s`, opacity:0 }}
            onClick={() => setSelected(c)}>
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

  if (tPhase==="intro"&&selected) return (
    <div className="fade-up" style={{ textAlign:"center",maxWidth:330,width:"100%",padding:"36px 24px 96px",position:"relative",zIndex:1,overflowY:"auto",maxHeight:"100vh" }}>
      <div style={{ marginBottom:32 }}>
        <div style={{ fontSize:10,letterSpacing:6,color:"#3a4a5a" }}>{t("reiki_chakra_label")}</div>
        <div style={{ width:38,height:1,background:`${selected.color}44`,margin:"10px auto" }} />
      </div>
      <div style={{ width:108,height:108,borderRadius:"50%",margin:"0 auto 24px", background:`radial-gradient(circle,${selected.color}cc,${selected.color}33)`, boxShadow:`0 0 40px ${selected.color}66,0 0 80px ${selected.color}22`, animation:"slowPulse 3.8s ease-in-out infinite" }} />
      <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:24,fontWeight:300,letterSpacing:1,marginBottom:6 }}>{selected.name} {t("chakra_suf")}</div>
      <div style={{ fontSize:11,letterSpacing:3,color:selected.pastel,marginBottom:24 }}>{selected.element.toUpperCase()}</div>
      <div style={{ fontSize:14,color:"#6a7a8a",lineHeight:1.9,marginBottom:40,fontStyle:"italic" }}>
        {t("intro_place_hand", selected.name)}<br />{t("intro_close_eyes")}<br />{selected.desc}
      </div>
      <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
        <button className="sakin-btn" onClick={() => setTPhase("list")}>{t("back")}</button>
        <button className="sakin-btn-primary" style={{ background:`linear-gradient(135deg,${selected.color}88,${selected.color}44)`,borderColor:`${selected.color}44` }} onClick={() => setTPhase("active")}>{t("btn_start")}</button>
      </div>
    </div>
  );

  if (tPhase==="active"&&selected) return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",position:"relative",zIndex:1,width:"100%",maxWidth:370,padding:"18px 22px 80px",overflowY:"auto",maxHeight:"100vh" }}>
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
        <button onClick={()=>setShowBackConfirm(true)} style={{ background:"none",border:"none",color:"#3a4a5a",cursor:"pointer",fontSize:19,padding:0,letterSpacing:1 }}>←</button>
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
      <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:52,fontWeight:300,letterSpacing:4,lineHeight:1,color:selected.pastel,textShadow:`0 0 ${20+progress*32}px ${selected.color}88`,marginBottom:4 }}>{mins}:{secs}</div>
      <div style={{ fontSize:10,letterSpacing:4,color:"#3a4a5a",marginBottom:24 }}>{t("pct_loaded", Math.round(progress*100))}</div>
      <div style={{ marginBottom:18,opacity:0.65+progress*0.35 }}>
        {(()=>{
          const HP = {
            "Kök":             {hy:83,lx:57,rx:91}, "Sakral":          {hy:77,lx:59,rx:89},
            "Güneş Pleksusu":  {hy:68,lx:60,rx:88}, "Kalp":            {hy:57,lx:61,rx:87},
            "Boğaz":           {hy:37,lx:68,rx:80}, "Üçüncü Göz":      {hy:17,lx:66,rx:82},
            "Taç":             {hy:10,lx:67,rx:81}, "Yeryüzü Yıldızı": {hy:116,lx:63,rx:85},
            "Ruh":             {hy:57,lx:61,rx:87}, "Kabartma":        {hy:63,lx:60,rx:88},
            "Diyafram":        {hy:73,lx:59,rx:89}, "Güneş":           {hy:57,lx:61,rx:87},
            "Paylaşım":        {hy:57,lx:61,rx:87}, "Thymus":          {hy:49,lx:62,rx:86},
            "Ses Üstü":        {hy:42,lx:66,rx:82}, "Orion":           {hy:19,lx:65,rx:83},
            "Alta Major":      {hy:22,lx:65,rx:83}, "Stellar Gateway": {hy:6, lx:67,rx:81},
            "Soul Star":       {hy:6, lx:67,rx:81}, "Causal":          {hy:19,lx:65,rx:83},
            "Lunar":           {hy:77,lx:59,rx:89}, "Zeta":            {hy:63,lx:60,rx:88},
          };
          const {hy=57,lx=61,rx=87} = HP[selected.name]||{};
          const up = hy<49;
          const my = (49+hy)/2;
          const lArm = up ? `M53 49 Q55 ${my} ${lx} ${hy}` : `M53 49 Q37 ${my} ${lx} ${hy}`;
          const rArm = up ? `M95 49 Q93 ${my} ${rx} ${hy}` : `M95 49 Q111 ${my} ${rx} ${hy}`;
          const cl=selected.pastel, cg=selected.color;
          return (
            <svg width="148" height="126" viewBox="0 0 148 126" fill="none" style={{ animation:"handFloat 3s ease-in-out infinite" }}>
              <circle cx="74" cy="20" r="13" stroke={`${cl}88`} strokeWidth="1.2" fill="none" />
              <line x1="74" y1="33" x2="74" y2="41" stroke={`${cl}66`} strokeWidth="1.2" />
              <path d="M51 41 Q74 39 97 41 L95 87 Q74 91 53 87Z" stroke={`${cl}55`} strokeWidth="1.2" fill={`${cg}0a`} />
              <path d="M65 87 Q63 105 61 121" stroke={`${cl}44`} strokeWidth="1.2" strokeLinecap="round" fill="none" />
              <path d="M83 87 Q85 105 87 121" stroke={`${cl}44`} strokeWidth="1.2" strokeLinecap="round" fill="none" />
              <path d={lArm} stroke={`${cl}88`} strokeWidth="1.4" fill="none" strokeLinecap="round" />
              <path d={rArm} stroke={`${cl}88`} strokeWidth="1.4" fill="none" strokeLinecap="round" />
              <circle cx={lx} cy={hy} r="3.2" fill={`${cg}${hex(0.3+progress*0.5)}`} stroke={`${cl}88`} strokeWidth="0.8" />
              <circle cx={rx} cy={hy} r="3.2" fill={`${cg}${hex(0.3+progress*0.5)}`} stroke={`${cl}88`} strokeWidth="0.8" />
              <circle cx="74" cy={hy} r={4+progress*8} fill={`${cg}${hex(0.06+progress*0.18)}`} stroke={`${cl}${hex(0.28+progress*0.5)}`} strokeWidth="0.8" />
              {[0,45,90,135,180,225,270,315].map((a,i)=>(
                <line key={i} x1="74" y1={hy}
                  x2={74+Math.cos(a*Math.PI/180)*(9+progress*14)} y2={hy+Math.sin(a*Math.PI/180)*(9+progress*14)}
                  stroke={`${cl}${hex((0.1+progress*0.28)*(i%2?0.5:1))}`} strokeWidth="0.8" strokeLinecap="round" />
              ))}
            </svg>
          );
        })()}
      </div>
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
    <div className="fade-up" style={{ textAlign:"center",maxWidth:310,width:"100%",padding:"36px 24px 80px",position:"relative",zIndex:1,overflowY:"auto",maxHeight:"100vh" }}>
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

function AramaPaneli({ baslik, simge, aciklama, renk, value, onChange, analiz, onAra, onSifirla, placeholder, lang = "tr" }) {
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
          <div style={{ fontSize:13.5,color:"#ccc0e0",lineHeight:2,whiteSpace:"pre-wrap",fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{analiz}</div>
          <button onClick={onSifirla}
            style={{ background:"none",border:`1px solid ${renk}30`,borderRadius:20,color:renk,opacity:0.7,cursor:"pointer",fontSize:10,letterSpacing:2.5,marginTop:16,padding:"6px 16px" }}>
            {t("btn_new_search")}
          </button>
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
                style={{ width:22,height:22,borderRadius:"50%",background:`${renk}22`,border:`1px solid ${renk}44`,color:`${renk}cc`,fontSize:11,fontWeight:700,cursor:"pointer",lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.2s" }}
              >?</button>
              {tipAcik && (
                <div style={{ position:"absolute",top:"calc(100% + 8px)",right:0,width:262,background:"linear-gradient(160deg,rgba(18,6,42,0.98),rgba(12,4,30,0.96))",border:`1px solid ${renk}40`,borderRadius:14,padding:"14px 14px 10px",boxShadow:`0 8px 32px rgba(0,0,0,0.6),0 0 24px ${renk}18`,zIndex:99 }}>
                  <div style={{ fontSize:9,letterSpacing:3,color:`${renk}99`,marginBottom:10,textAlign:"center" }}>
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
            style={{ width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.03)",border:`1px solid ${renk}25`,borderRadius:12,padding:"11px 14px",color:"#d0c8e8",fontSize:13.5,fontFamily:"'Cormorant Garamond',Georgia,serif",outline:"none",marginBottom:12,letterSpacing:0.5,resize:"none",lineHeight:1.75 }}
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
  const [niyet,         setNiyet]         = useState("");
  const [selectedWords, setSelectedWords] = useState([]);
  const [breathPhase,   setBreathPhase]   = useState("inhale");
  const [breathCount,   setBreathCount]   = useState(0);
  const [breathStarted, setBreathStarted] = useState(false);
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
  const breathRef = useRef(null);

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

  const generateChakraAnaliz = async () => {
    if (!chakraInput.trim()) return;
    setChakraAnaliz("__loading__");
    const idx = chakraEsle(chakraInput);
    const ch = CHAKRAS_7[idx];
    const zihinsel = CHAKRA_ZIHINSEL[idx];
    const astroText2 = astro ? `Kullanıcının doğum haritası: ${astro.burc} burcu, Yaşam Yolu Sayısı ${astro.yasam}, Kişisel Yıl ${astro.kisiselYil}.` : "";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":ARAMA_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body: JSON.stringify({
          model:"claude-opus-4-6", max_tokens:600,
          system:`Sen derin bir çakra ve enerji rehberisin. Türkçe, şiirsel, içten ve kısa yaz (3-5 cümle). Kullanıcıyı "sen" diye hitap et.`,
          messages:[{ role:"user", content:`Kullanıcı şunu yazdı: "${chakraInput}"

İlgili çakra: ${ch.name} Çakrası (${ch.element} elementi). Açıklaması: "${ch.desc}"
Zihinsel-bedensel bağlantısı: ${zihinsel}
${astroText2}

Şimdi tamamen kişiselleştirilmiş bir mesaj yaz:
1. Kullanıcının hissini nazikçe doğrula
2. Bu çakra ve zihinsel köküyle bağlantısını anlat
3. Doğum haritasına göre ona özel bir öneri veya mesaj sun` }],
        }),
      });
      const d = await res.json();
      if (!res.ok || d.error) { setChakraAnaliz(`Hata: ${d.error?.message || "API bağlantı hatası."}`); return; }
      setChakraAnaliz(d?.content?.[0]?.text || "Analiz alınamadı.");
    } catch {
      setChakraAnaliz("Bağlantı hatası, tekrar dene.");
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
    const astroText3 = astro ? `Kullanıcının doğum haritası: ${astro.burc} burcu, Yaşam Yolu Sayısı ${astro.yasam}, Kişisel Yıl ${astro.kisiselYil}.${birthTime?` Doğum saati ${birthTime}.`:""}` : "";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":ARAMA_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body: JSON.stringify({
          model:"claude-opus-4-6", max_tokens:900,
          system:`Sen derin bir holisitk sağlık rehberisin. Hastalık ve semptomlara hem Reiki hem de zihinsel-duygusal açıdan yaklaşıyorsun. Türkçe, şiirsel ve içten yaz. Kullanıcıyı "sen" diye hitap et. Asla tıbbi tavsiye verme, ruhsal-duygusal perspektifi paylaş.`,
          messages:[{ role:"user", content:`Kullanıcının semptomu: "${semptomInput}"

${REIKI_BILGI}

${LOUISE_HAY_REHBER}

EK ZİHİNSEL NEDENLER:
${zihinselListeText}

${astroText3}

Bu semptomu yukarıdaki üç kaynağı (Reiki bilgisi, Louise Hay kitabı ve zihinsel nedenler listesi) sentezleyerek analiz et. Şu formatta tam, benzersiz bir yanıt üret:

**Zihinsel-Duygusal Kök**
(Bu semptomu tetikleyen en olası duygusal/zihinsel neden — 2 cümle)

**İlgili Çakra & Enerji**
(Hangi çakra, hangi frekans, bu çakranın tıkanması nasıl bu semptomu yaratır — 2 cümle)

**Reiki Yaklaşımı**
(Hangi el pozisyonu, nasıl bir niyet, hangi frekans müziği — pratik 2-3 adım)

**Sana Özel Mesaj**
(Doğum haritasına göre kişiselleştirilmiş, 2-3 cümle, şiirsel ve iyileştirici)` }],
        }),
      });
      const d = await res.json();
      if (!res.ok || d.error) { setSemptomAnaliz(`Hata: ${d.error?.message || "API bağlantı hatası."}`); return; }
      setSemptomAnaliz(d?.content?.[0]?.text || "Analiz alınamadı.");
    } catch {
      setSemptomAnaliz("Bağlantı hatası, tekrar dene.");
    }
  };

  const generateSikayetAnaliz = async () => {
    if (!sikayet.trim()) return;
    setSikayetAnaliz("__loading__");
    const zihinselListeText = ZIHINSEL_LISTE.map(z=>`${z.organ}: ${z.neden}`).join("\n");
    const astroTxt = astro ? `Kullanıcının doğum haritası: ${astro.burc} burcu, Yaşam Yolu ${astro.yasam}, Kişisel Yıl ${astro.kisiselYil}.` : "";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":ARAMA_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body: JSON.stringify({
          model:"claude-opus-4-6", max_tokens:1400,
          system:`Sen derin bir holistik enerji rehberisin. Fiziksel şikayetler, duygusal sorular, çakra merakları, ruhsal arayışlar — her tür soruyu Reiki ve Louise Hay perspektifinden şiirsel ve içten yanıtlıyorsun. Türkçe yaz. "Sen" diye hitap et. Asla tıbbi tavsiye verme.`,
          messages:[{ role:"user", content:`Kullanıcının sorusu/şikayeti: "${sikayet}"

${REIKI_BILGI}

${LOUISE_HAY_REHBER}

EK ZİHİNSEL NEDENLER:
${zihinselListeText}
${astroTxt}

Üç kaynağı (Reiki, Louise Hay ve zihinsel nedenler) sentezleyerek şu formatta yanıt ver:

**Zihinsel-Duygusal Kök**
(En olası duygusal neden — 2 cümle)

**İlgili Çakra & Enerji**
(Çakra, frekans, tıkanma ilişkisi — 2 cümle)

**Reiki Yaklaşımı**
(El pozisyonu, niyet, frekans müziği — 2-3 adım)

**Sana Özel Mesaj**
(Kişiselleştirilmiş, şiirsel, iyileştirici — 2-3 cümle)` }],
        }),
      });
      const d = await res.json();
      if (!res.ok || d.error) { setSikayetAnaliz(`Hata: ${d.error?.message || "API bağlantı hatası."}`); return; }
      setSikayetAnaliz(d?.content?.[0]?.text || "Analiz alınamadı.");
    } catch { setSikayetAnaliz("Bağlantı hatası, tekrar dene."); }
  };

  const generateHastalikAnaliz = async () => {
    if (!hastalik.trim()) return;
    setHastalikAnaliz("__loading__");
    const zihinselListeText = ZIHINSEL_LISTE.map(z=>`${z.organ}: ${z.neden}`).join("\n");
    const astroTxt = astro ? `Kullanıcının doğum haritası: ${astro.burc} burcu, Yaşam Yolu ${astro.yasam}, Kişisel Yıl ${astro.kisiselYil}.` : "";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":ARAMA_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body: JSON.stringify({
          model:"claude-opus-4-6", max_tokens:1400,
          system:`Sen derin bir holistik sağlık rehberisin. Hastalıklara ruhsal-enerjetik perspektiften yaklaşıyorsun. Türkçe, şiirsel ve içten yaz. "Sen" diye hitap et. Asla tıbbi tavsiye verme.`,
          messages:[{ role:"user", content:`Hastalık: "${hastalik}"${hastalikHis ? `\nNasıl hissediyorum: "${hastalikHis}"` : ""}

${REIKI_BILGI}

${LOUISE_HAY_REHBER}

EK ZİHİNSEL NEDENLER:
${zihinselListeText}
${astroTxt}

Reiki ve Louise Hay kitabını birlikte referans alarak şu formatta yanıt ver:

**Ruhsal Kök**
(Bu hastalığın ruhsal-duygusal mesajı — 2 cümle)

**Enerji & Çakra Dengesi**
(Hangi enerji alanı etkileniyor, hangi çakra, nasıl bir blok — 2 cümle)

**İyileşme Ritüeli**
(Reiki el pozisyonu, frekans, kristal veya doğa önerisi — 2-3 adım)

**Sana Özel Mesaj**
(Doğum haritasına göre derin, şiirsel bir mesaj — 2-3 cümle)` }],
        }),
      });
      const d = await res.json();
      if (!res.ok || d.error) { setHastalikAnaliz(`Hata: ${d.error?.message || "API bağlantı hatası."}`); return; }
      setHastalikAnaliz(d?.content?.[0]?.text || "Analiz alınamadı.");
    } catch { setHastalikAnaliz("Bağlantı hatası, tekrar dene."); }
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
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":RAPOR_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body: JSON.stringify({
          model:"claude-opus-4-6", max_tokens:1700,
          system:`Sen derin bir içsel farkındalık ve astroloji rehberisin. Kullanıcının haftalık verilerini, doğum profilini ve 12. ev (gizli benlik) bilgeliğini sentezleyerek Türkçe, şiirsel ve içten bir rapor yazıyorsun.
${astroText}
${GIZLI_BENLIK_REHBER}

Rapor şu başlıkları içermeli:
**Haftanın Enerjisi** — Genel ruh hali, enerji ve burç/sayı etkisi (2-3 cümle)
**Öne Çıkan Temalar** — Tekrar eden kelimeler ve çakra örüntüleri
**İçsel Büyüme** — Öğrenilen şeylerden çıkarılan anlam
**Gizli Benlik & Gölge** — Bu haftanın verilerinde 12. ev perspektifinden görülen bastırılmış temalar, karmik örüntüler veya gölge yansımalar; bütünleşme için bir davet (2-3 cümle, şiirsel)
**Şükran Kalbi** — Şükür yazılarından bir sentez
**Bu Hafta Dikkat** — Bu hafta özellikle nelere dikkat etmeli, hangi enerji veya durumdan uzak durmalı (2-3 madde)
**Hatırla** — Bu hafta kendine hatırlatman gereken en önemli 2-3 şey (kısa, öz)
**Gelecek Haftaya Niyet** — Kısa, ilham verici bir öneri${astro ? "\n**Kozmik Not** — Bu haftanın biyoritmi ve sayısal/burç enerjisi hakkında kısa bir not" : ""}

Samimi, nazik, biraz şiirsel bir dil kullan. "Sen" diye hitap et. Maksimum 620 kelime.`,
          messages:[{role:"user",content:`Bu haftaki günlük verilerim:\n\n${gunlerText}\n\nLütfen haftalık içsel raporumu oluştur.`}]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text;
      if (text) {
        localStorage.setItem("sakin_rapor_used", "1");
        setRaporKullanildi(true);
      }
      setAiRapor(text || data.error?.message || "Rapor oluşturulamadı.");
    } catch(e) { setAiRapor("API'ye ulaşılamadı: "+e.message); }
    finally { setAiLoading(false); }
  };

  useEffect(() => {
    setBreathStarted(false);
    setBreathPhase("inhale");
    clearInterval(breathRef.current);
  },[screen]);

  useEffect(() => {
    if (screen!=="nefes" || !breathStarted) return;
    const cycle = () => {
      setBreathPhase("inhale");
      setTimeout(()=>setBreathPhase("hold"),4000);
      setTimeout(()=>setBreathPhase("exhale"),5500);
      setTimeout(()=>setBreathCount(c=>c+1),9500);
    };
    cycle();
    breathRef.current=setInterval(cycle,10000);
    return()=>clearInterval(breathRef.current);
  },[screen, breathStarted]);

  const hour   = time.getHours();
  const dayPct = ((hour*60+time.getMinutes())/1440)*100;
  const toggleWord = w => setSelectedWords(prev => prev.includes(w)?prev.filter(x=>x!==w):prev.length<3?[...prev,w]:prev);
  const breathLabel = breathStarted ? {inhale:t("breath_inhale"),hold:t("breath_hold"),exhale:t("breath_exhale")}[breathPhase] : "";
  const breathScale = breathStarted ? (breathPhase==="exhale" ? 1 : 1.6) : 1;
  const handleMouseMove = e => { const r=e.currentTarget.getBoundingClientRect(); setOrb({x:((e.clientX-r.left)/r.width)*100,y:((e.clientY-r.top)/r.height)*100}); };

  const ambientColor = {
    giris:"139,90,160",sabah:"220,130,50",nefes:"80,130,200",
    chakra:`${parseInt(chakra.color.slice(1,3),16)},${parseInt(chakra.color.slice(3,5),16)},${parseInt(chakra.color.slice(5,7),16)}`,
    gun:"120,90,180",terapi:"74,160,100",aksam:"60,70,140",harita:"100,80,180",
  }[screen]||"139,90,160";

  const NAV = [
    {id:"rehber",icon:"📖",label:t("nav_guide")},
    {id:"sabah",icon:"🌅",label:t("nav_morning")},
    {id:"nefes",icon:"🫧",label:t("nav_breath")},
    {id:"chakra",icon:"💜",label:t("nav_chakra")},
    {id:"gun",icon:"☀️",label:t("nav_day")},
    {id:"aksam",icon:"🌙",label:t("nav_evening")},
    {id:"harita",icon:"🗺️",label:t("nav_map")},
  ];
  const MORNING_WORDS = t("morning_words");

  const isPolicyScreen = ["hakkinda","fiyat","sartlar","gizlilik","iade"].includes(screen);
  return (
    <div onMouseMove={handleMouseMove} style={{ minHeight:"100vh",paddingTop:44,background:"#080c14",display:"flex",alignItems:isPolicyScreen?"flex-start":"center",justifyContent:"center",fontFamily:"'Cormorant Garamond',Georgia,serif",color:"#ddd8f0",position:"relative" }}>
      <style>{GLOBAL_CSS}</style>

      {/* ÜST NAV */}
      <div className="top-nav">
        {/* Anasayfa butonu — sol */}
        <button
          onClick={()=>{ setScreen("sabah"); history.pushState(null,"","/"); }}
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
        <button onClick={toggleLang} style={{ marginLeft:"auto",flexShrink:0,background:"rgba(139,90,160,0.15)",border:"1px solid rgba(139,90,160,0.3)",borderRadius:20,padding:"4px 12px",color:"#c3a6d8",fontSize:10,letterSpacing:1.5,cursor:"pointer",fontFamily:"'Jost',sans-serif",fontWeight:300,height:28,alignSelf:"center",marginRight:4 }}>
          {lang === "tr" ? "EN" : "TR"}
        </button>
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
                    if(birthInput){ localStorage.setItem("sakin_birth_date", birthInput); setBirthDate(birthInput); }
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
          {/* DOĞUM PROFİLİ KARTI */}
          <div style={{ background:"linear-gradient(135deg,rgba(60,40,120,0.12),rgba(100,60,160,0.06))",border:"1px solid rgba(100,70,180,0.18)",borderRadius:17,padding:"16px 20px",marginBottom:14,marginTop:10 }}>
            <div style={{ fontSize:10,letterSpacing:3.5,color:"#7a60b0",marginBottom:12,textAlign:"center" }}>{t("birth_profile")}</div>
            {astro && !showBirthForm ? (
              <div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14 }}>
                  {[
                    {label:t("birth_sign"),value:astro.burc},
                    {label:t("birth_life_path"),value:astro.yasam},
                    {label:t("birth_personal_yr"),value:astro.kisiselYil},
                  ].map((s,i)=>(
                    <div key={i} style={{ background:"rgba(255,255,255,0.025)",borderRadius:10,padding:"9px 10px",textAlign:"center",border:"1px solid rgba(255,255,255,0.04)" }}>
                      <div style={{ fontSize:8,letterSpacing:2,color:"#5a4a7a",marginBottom:5 }}>{s.label.toUpperCase()}</div>
                      <div style={{ fontSize:16,color:"#c3a6d8",fontWeight:300 }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                {/* Biyoritm çubukları */}
                <div style={{ fontSize:9,letterSpacing:2,color:"#5a4a7a",marginBottom:7 }}>{t("bio_label")}</div>
                {[
                  {label:t("bio_physical"),val:astro.bio.fiziksel,color:"#e8a09a"},
                  {label:t("bio_emotional"),val:astro.bio.duygusal,color:"#85c1e9"},
                  {label:t("bio_mental"),val:astro.bio.zihinsel,color:"#aed581"},
                ].map(({label,val,color})=>{
                  const {pct,positive}=bioritmBar(val);
                  return (
                    <div key={label} style={{ marginBottom:7 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}>
                        <span style={{ fontSize:10,color:"#6a5a8a",letterSpacing:1 }}>{label}</span>
                        <span style={{ fontSize:10,color:positive?color:"#6a5a6a" }}>{positive?"+":""}{val}%</span>
                      </div>
                      <div style={{ background:"rgba(255,255,255,0.04)",borderRadius:4,height:4,overflow:"hidden" }}>
                        <div style={{ height:"100%",width:`${pct}%`,background:positive?`${color}99`:"rgba(120,100,140,0.4)",borderRadius:4,transition:"width 0.8s ease",marginLeft:positive?"50%":`calc(50% - ${pct}%)` }} />
                      </div>
                    </div>
                  );
                })}
                {birthTime && (
                  <div style={{ fontSize:11,color:"#7a6a9a",letterSpacing:1.5,marginTop:8,marginBottom:2,textAlign:"center" }}>
                    ◷ {birthTime} {t("birth_time_label")}
                  </div>
                )}
                <button onClick={()=>setShowBirthForm(true)}
                  style={{ marginTop:10,background:"none",border:"none",color:"#4a3a6a",cursor:"pointer",fontSize:10,letterSpacing:2 }}>
                  {t("change_date")}
                </button>
              </div>
            ) : showBirthForm || !astro ? (
              <div>
                <div style={{ fontSize:12,color:"#5a4a7a",marginBottom:10,lineHeight:1.7,textAlign:"center" }}>
                  {t("birth_desc").split("\n").map((l,i)=><span key={i}>{l}{i===0&&<br/>}</span>)}
                </div>
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:10,letterSpacing:2,color:"#5a4a7a",marginBottom:6 }}>{t("birth_date_label")}</div>
                  <input type="date" className="sakin-input"
                    style={{ fontSize:13,letterSpacing:0.5 }}
                    value={birthInput}
                    onChange={e=>setBirthInput(e.target.value)} />
                </div>
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:10,letterSpacing:2,color:"#5a4a7a",marginBottom:6 }}>{t("birth_time_input")} <span style={{ color:"#3a2a5a",fontSize:9,letterSpacing:1 }}>{t("optional")}</span></div>
                  <input type="time" className="sakin-input"
                    style={{ fontSize:13,letterSpacing:0.5 }}
                    value={birthTimeInput}
                    onChange={e=>setBirthTimeInput(e.target.value)} />
                </div>
                <div style={{ display:"flex",gap:8,justifyContent:"center" }}>
                  {astro && <button className="sakin-btn" onClick={()=>setShowBirthForm(false)}>{t("cancel")}</button>}
                  <button className="sakin-btn-primary"
                    style={{ background:"linear-gradient(135deg,rgba(100,60,160,0.6),rgba(60,80,160,0.4))",borderColor:"rgba(100,70,180,0.4)",fontSize:12 }}
                    onClick={()=>{
                      if(!birthInput) return;
                      localStorage.setItem("sakin_birth_date", birthInput);
                      setBirthDate(birthInput);
                      if(birthTimeInput){ localStorage.setItem("sakin_birth_time", birthTimeInput); setBirthTime(birthTimeInput); }
                      setShowBirthForm(false);
                    }}>{t("save")}</button>
                </div>
              </div>
            ) : null}
          </div>

          <button className="sakin-btn-primary" style={{ width:"100%" }} onClick={()=>setScreen("nefes")}>{t("btn_continue")}</button>
        </div>
      )}

      {/* NEFES */}
      {screen==="nefes" && (
        <div style={{ textAlign:"center",padding:"62px 30px 110px",position:"relative",zIndex:1 }}>
          <div className="label-sm" style={{ marginBottom:52,letterSpacing:5 }}>{t("breath_title")}</div>
          <div style={{ position:"relative",width:205,height:205,margin:"0 auto 40px" }}>
            {[1.72,1.45,1.2].map((s,i)=>(
              <div key={i} style={{ position:"absolute",inset:0,borderRadius:"50%",border:`1px solid rgba(80,130,200,${0.1-i*0.025})`,transform:`scale(${s})` }} />
            ))}
            <div style={{ position:"absolute",inset:0,borderRadius:"50%",background:"radial-gradient(circle,rgba(80,130,200,0.62),rgba(139,90,160,0.24))",transition:"transform 4s ease",transform:`scale(${breathScale})`,display:"flex",alignItems:"center",justifyContent:"center" }}>
              <div style={{ fontSize:12,letterSpacing:2,color:"rgba(255,255,255,0.82)" }}>{breathLabel}</div>
            </div>
          </div>
          <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:27,letterSpacing:4,fontWeight:300,marginBottom:8,color:"#c8c0e0" }}>{t("youre_here")}</div>
          <div className="label-sm" style={{ marginBottom:44 }}>{breathStarted ? t("breath_count", breathCount) : ""}</div>
          {!breathStarted ? (
            <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
              <button className="sakin-btn" onClick={()=>setScreen("sabah")}>{t("back")}</button>
              <button className="sakin-btn-primary" onClick={()=>setBreathStarted(true)}>{t("btn_start")}</button>
            </div>
          ) : (
            <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
              <button className="sakin-btn" onClick={()=>setScreen("sabah")}>{t("back")}</button>
              <button className="sakin-btn-primary" onClick={()=>setScreen("chakra")}>{t("btn_next")}</button>
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
            <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
              <button className="sakin-btn" onClick={()=>setScreen("nefes")}>{t("back")}</button>
              <button className="sakin-btn-primary" onClick={()=>setScreen("gun")}>{t("btn_reminders")}</button>
            </div>
          </div>
        </div>
      )}

      {screen==="terapi" && <TerapiScreen onBack={()=>setScreen("chakra")} lang={lang} />}
      {screen==="gun"    && <ReminderScreen onBack={()=>setScreen("chakra")} onNext={()=>setScreen("aksam")} lang={lang} />}

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
          <button className="sakin-btn-primary" style={{ width:"100%" }} onClick={()=>setScreen("harita")}>{t("btn_see_week")}</button>
        </div>
      )}

      {/* REHBER */}
      {screen==="rehber" && (
        <div style={{ maxWidth:405,width:"100%",padding:"62px 26px 110px",position:"relative",zIndex:1 }}>
          {/* Gizemli arka plan efekti */}
          <div style={{ position:"fixed",inset:0,background:"radial-gradient(ellipse at 30% 20%,rgba(60,20,100,0.35) 0%,transparent 60%),radial-gradient(ellipse at 70% 80%,rgba(20,40,100,0.3) 0%,transparent 60%)",pointerEvents:"none",zIndex:0 }} />
          <div style={{ textAlign:"center",marginBottom:36,position:"relative" }}>
            <div style={{ fontSize:10,letterSpacing:6,color:"#4a3a6a",marginBottom:10 }}>{t("guide_sup")}</div>
            <div style={{ fontSize:23,fontWeight:300,letterSpacing:3,color:"#c8b0e8",textShadow:"0 0 40px rgba(180,120,255,0.4)" }}>{t("guide_title")}</div>
            <div style={{ fontSize:10,color:"#3a2a5a",marginTop:8,letterSpacing:2 }}>{t("guide_sub")}</div>
            <button onClick={toggleDevMode}
              style={{ position:"absolute",top:0,right:0,background:devMode?"rgba(255,180,0,0.15)":"rgba(255,255,255,0.04)",border:`1px solid ${devMode?"rgba(255,180,0,0.4)":"rgba(255,255,255,0.08)"}`,borderRadius:8,padding:"4px 9px",color:devMode?"#f0c040":"#4a5a6a",fontSize:10,letterSpacing:1.5,cursor:"pointer",fontFamily:"monospace" }}>
              {devMode ? "DEV ✓" : "DEV"}
            </button>
          </div>

          {/* ARAMA PANELİ 1 — ŞİKAYET */}
          <AramaPaneli
            baslik={t("mirror_title")}
            simge={t("mirror_icon")}
            aciklama={t("mirror_desc")}
            renk="#a070d0"
            value={sikayet}
            onChange={setSikayet}
            analiz={sikayetAnaliz}
            onAra={generateSikayetAnaliz}
            onSifirla={()=>{ setSikayetAnaliz(""); setSikayet(""); setSikayetHis(""); }}
            placeholder={lang==="tr" ? "Fiziksel, duygusal ya da ruhsal — her şeyi sorabilirsin..." : "Physical, emotional or spiritual — ask anything..."}
            lang={lang}
          />
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
                <div style={{ fontSize:13.5,color:"#c8bedd",lineHeight:1.9,whiteSpace:"pre-wrap" }}>{aiRapor}</div>
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
          <button className="sakin-btn" style={{ width:"100%" }} onClick={()=>setScreen("giris")}>{t("btn_new_day")}</button>
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
      {!["giris","terapi","gun","hakkinda","fiyat","sartlar","gizlilik","iade"].includes(screen) && (
        <div style={{ position:"fixed",bottom:16,left:"50%",transform:"translateX(-50%)",display:"flex",gap:0,alignItems:"center",zIndex:9999,background:"rgba(8,12,20,0.94)",backdropFilter:"blur(32px)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:100,padding:"5px 6px",maxWidth:"calc(100vw - 24px)" }}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>{ if(n.id==="rehber") setRehberTab("reiki"); setScreen(n.id); }} style={{ background:"transparent",border:"none",cursor:"pointer",transition:"all 0.28s",transform:screen===n.id?"translateY(-2px)":"none",padding:"4px 7px",display:"flex",flexDirection:"column",alignItems:"center",gap:2 }}>
              <span style={{ fontSize:screen===n.id?15:11,opacity:screen===n.id?1:0.22,transition:"all 0.28s" }}>{n.icon}</span>
              <span style={{ fontFamily:"'Jost',sans-serif",fontWeight:300,fontSize:7,letterSpacing:1.5,textTransform:"uppercase",color:screen===n.id?"#b8a4d8":"transparent",transition:"color 0.28s" }}>{n.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
