import { useState, useEffect, useRef } from "react";

const CHAKRAS_7 = [
  { name:"Kök",            color:"#c0392b", pastel:"#e8a09a", desc:"Bugün yere bas. Güvende hisset.",  element:"Toprak", emoji:"🟥" },
  { name:"Sakral",         color:"#e67e22", pastel:"#f0c27f", desc:"Bugün hisset. Akmana izin ver.",   element:"Su",     emoji:"🟧" },
  { name:"Güneş Pleksusu", color:"#f1c40f", pastel:"#f7e18a", desc:"Bugün güçlü ol. Işığın var.",     element:"Ateş",   emoji:"🟨" },
  { name:"Kalp",           color:"#27ae60", pastel:"#82d9a3", desc:"Bugün sevgiyle aç. Kendine de.",  element:"Hava",   emoji:"🟩" },
  { name:"Boğaz",          color:"#2980b9", pastel:"#85c1e9", desc:"Bugün hakikatini söyle.",          element:"Ses",    emoji:"🟦" },
  { name:"Üçüncü Göz",    color:"#8e44ad", pastel:"#c3a6d8", desc:"Bugün içeriye bak.",               element:"Işık",   emoji:"🟣" },
  { name:"Taç",            color:"#9b59b6", pastel:"#d9b8e8", desc:"Bugün bütünle bağlan.",            element:"Evren",  emoji:"⬜" },
];

const CHAKRAS_22 = [
  ...CHAKRAS_7,
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

const REMINDERS = [
  {
    id:"ayna", icon:"🪞", title:"Aynada kendine bak",
    subtitle:"30 saniye — gözlerinin içine bak. Sadece ol.",
    duration:30, color:"rgba(180,160,220,0.7)",
    borderColor:"rgba(180,160,220,0.25)",
    notifBody:"Aynaya git. 30 saniye boyunca sadece kendine bak.",
  },
  {
    id:"su", icon:"💧", title:"Su iç",
    subtitle:"Bir bardak su iç ve hisset.",
    duration:null, color:"rgba(72,130,200,0.7)",
    borderColor:"rgba(72,130,200,0.25)",
    notifBody:"Bir bardak su iç. İçerken hisset — serin, temiz, hayat.",
  },
  {
    id:"nefes", icon:"🌬", title:"Nefes farkındalığı",
    subtitle:"1 dakika — sadece nefesini izle.",
    duration:60, color:"rgba(100,160,210,0.7)",
    borderColor:"rgba(100,160,210,0.25)",
    notifBody:"Dur. Bir dakika boyunca sadece nefesini izle. Buradasın.",
  },
  {
    id:"beden", icon:"🧍", title:"Beden egzersizi",
    subtitle:"Omuz çevir · Boyun esnet · Gözleri dinlendir",
    duration:120, color:"rgba(100,180,130,0.7)",
    borderColor:"rgba(100,180,130,0.25)",
    notifBody:"Omuzlarını çevir, boynunu esnet, gözlerini kapat. 2 dakika beden zamanı.",
  },
  {
    id:"gunes", icon:"☀️", title:"Güneşi yüzünde hisset",
    subtitle:"Dışarı çık. Yüzünü güneşe dön.",
    duration:null, color:"rgba(240,180,60,0.7)",
    borderColor:"rgba(240,180,60,0.25)",
    notifBody:"Güneş seni bekliyor. Yüzünü kaldır, gözlerini yum, hisset.",
  },
  {
    id:"agac", icon:"🌳", title:"Ağaca sarıl",
    subtitle:"Bir ağacı bul. Kollarını aç. Kalbini değdir.",
    duration:30, color:"rgba(45,120,65,0.7)",
    borderColor:"rgba(45,120,65,0.25)",
    notifBody:"Dışarı çık. Bir ağacı bul. Sarıl ona — o da seni tutacak.",
  },
  {
    id:"toprak", icon:"🌍", title:"Toprağa dokun",
    subtitle:"Çıplak ayak ya da avucunla toprağa değdir.",
    duration:30, color:"rgba(100,70,40,0.7)",
    borderColor:"rgba(100,70,40,0.25)",
    notifBody:"Ayakkabını çıkar. Toprağa bas. Yerin enerjisini hisset.",
  },
  {
    id:"gok", icon:"☁️", title:"Gökyüzüne bak",
    subtitle:"Bugün gökyüzüne baktın mı?",
    duration:null, color:"rgba(80,140,200,0.7)",
    borderColor:"rgba(80,140,200,0.25)",
    notifBody:"Başını kaldır. Gökyüzüne bak. Sadece bak.",
  },
  {
    id:"chakra_an", icon:"💜", title:"Çakra anı",
    subtitle:"Bugünkü çakranda bir an dur.",
    duration:null, color:"rgba(139,90,160,0.7)",
    borderColor:"rgba(139,90,160,0.25)",
    notifBody:"Gözlerini yum. Bugünkü çakranı hisset. Bir nefes yeter.",
  },
  {
    id:"sosyal", icon:"📵", title:"Sosyal medya molası",
    subtitle:"Gerçekten şimdi burada olmak istiyor musun?",
    duration:null, color:"rgba(200,80,80,0.7)",
    borderColor:"rgba(200,80,80,0.25)",
    notifBody:"Telefonu koy. Bir dakika sadece var ol. Ekran bekler, an geçer.",
  },
];

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&display=swap');
  * { box-sizing: border-box; }
  @keyframes twinkle      { 0%,100%{opacity:0.06} 50%{opacity:0.48} }
  @keyframes fadeUp       { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn       { from{opacity:0} to{opacity:1} }
  @keyframes glow         { 0%,100%{box-shadow:0 0 22px rgba(139,90,160,0.22)} 50%{box-shadow:0 0 46px rgba(139,90,160,0.46)} }
  @keyframes pulse        { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
  @keyframes sunrise      { from{opacity:0;transform:scale(0.88) translateY(14px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes ringPulse    { 0%,100%{opacity:0.08;transform:scale(1)} 50%{opacity:0.22;transform:scale(1.04)} }
  @keyframes heartbeat    { 0%,100%{transform:scale(1)} 14%{transform:scale(1.07)} 28%{transform:scale(1)} 42%{transform:scale(1.04)} }
  @keyframes slowPulse    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.09)} }
  @keyframes floatUp      { 0%{opacity:0;transform:translate(0,0) scale(0.4)} 20%{opacity:1} 80%{opacity:0.5} 100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(1.3)} }
  @keyframes energyFill   { 0%{background-position:100% 50%} 100%{background-position:0% 50%} }
  @keyframes pillGlow     { 0%,100%{box-shadow:0 0 8px rgba(139,90,160,0.4),0 0 22px rgba(100,60,200,0.18),inset 0 0 8px rgba(139,90,160,0.12)} 50%{box-shadow:0 0 18px rgba(180,100,255,0.7),0 0 44px rgba(100,60,200,0.38),inset 0 0 14px rgba(180,100,255,0.22)} }
  @keyframes pillShimmer  { 0%{transform:translateX(-100%) skewX(-20deg)} 100%{transform:translateX(250%) skewX(-20deg)} }
  .terapi-pill {
    position:relative; overflow:hidden;
    background: linear-gradient(270deg,#8b5aa0cc,#4a3ab0aa,#9b3eb0cc,#8b5aa0cc);
    background-size:300% 100%;
    animation: energyFill 2.8s ease-in-out infinite, pillGlow 2.8s ease-in-out infinite;
    border:1px solid rgba(200,140,255,0.35) !important;
    color:#e8d8ff !important;
    letter-spacing:2px;
    font-size:11px !important;
  }
  .terapi-pill::after {
    content:"";
    position:absolute; top:0; left:0; width:40%; height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent);
    animation:pillShimmer 2.2s ease-in-out infinite;
  }
  @keyframes handFloat    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
  @keyframes doneGlow     { 0%,100%{box-shadow:0 0 40px #4ade8088,0 0 80px #4ade8033} 50%{box-shadow:0 0 70px #4ade80bb,0 0 140px #4ade8055} }
  @keyframes sparkle      { 0%{transform:scale(0) rotate(0deg);opacity:1} 100%{transform:scale(1.6) rotate(180deg);opacity:0} }
  @keyframes slideIn      { from{opacity:0;transform:translateX(28px)} to{opacity:1;transform:translateX(0)} }
  @keyframes checkPop     { 0%{transform:scale(0)} 70%{transform:scale(1.3)} 100%{transform:scale(1)} }
  .fade-up  { animation: fadeUp  0.8s ease forwards; }
  .slide-in { animation: slideIn 0.55s ease forwards; }
  .sakin-input {
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1);
    border-radius:12px; color:#e8e0d5;
    font-family:'Cormorant Garamond',Georgia,serif; font-size:16px;
    padding:13px 15px; width:100%; resize:none; outline:none; transition:border-color 0.3s;
  }
  .sakin-input:focus { border-color:rgba(255,255,255,0.26); }
  .sakin-btn {
    background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.13);
    border-radius:100px; color:#e8e0d5; cursor:pointer;
    font-family:'Cormorant Garamond',Georgia,serif;
    font-size:13px; letter-spacing:1.5px; padding:10px 22px; transition:all 0.28s;
  }
  .sakin-btn:hover { background:rgba(255,255,255,0.13); border-color:rgba(255,255,255,0.26); }
  .sakin-btn-primary {
    background:linear-gradient(135deg,rgba(139,90,160,0.55),rgba(72,130,180,0.55));
    border:1px solid rgba(139,90,160,0.36); border-radius:100px; color:#e8e0d5; cursor:pointer;
    font-family:'Cormorant Garamond',Georgia,serif;
    font-size:14px; letter-spacing:2.5px; padding:12px 36px; transition:all 0.28s;
  }
  .sakin-btn-primary:hover {
    background:linear-gradient(135deg,rgba(139,90,160,0.8),rgba(72,130,180,0.8));
    transform:translateY(-2px);
  }
  .word-chip {
    border-radius:100px; border:1px solid rgba(255,255,255,0.12); cursor:pointer;
    font-size:12px; letter-spacing:0.5px; padding:7px 15px; transition:all 0.22s;
    background:transparent; color:#a8a0a0;
    font-family:'Cormorant Garamond',Georgia,serif;
  }
  .word-chip:hover { border-color:rgba(255,255,255,0.3); color:#e8e0d5; }
  .word-chip.selected { background:rgba(255,255,255,0.09); border-color:rgba(255,255,255,0.36); color:#fff; }
  .chakra-card {
    border-radius:15px; border:1px solid rgba(255,255,255,0.06);
    padding:13px 15px; cursor:pointer; transition:all 0.22s;
    background:rgba(255,255,255,0.015); display:flex; align-items:center; gap:13px;
  }
  .chakra-card:hover { background:rgba(255,255,255,0.055); border-color:rgba(255,255,255,0.16); }
  .chakra-card.active { border-color:rgba(255,255,255,0.28); background:rgba(255,255,255,0.07); }
  .particle {
    position:absolute; border-radius:50%;
    background:radial-gradient(circle,#86efac,#4ade80aa);
    pointer-events:none; animation:floatUp var(--dur) ease-out forwards;
  }
  .ring {
    position:absolute; border-radius:50%;
    border:1px solid rgba(74,222,128,0.18);
    animation:ringPulse 3s ease-in-out infinite;
  }
  .rem-card {
    border-radius:18px; border:1px solid rgba(255,255,255,0.07);
    padding:16px 18px; background:rgba(255,255,255,0.02);
    transition:all 0.25s; margin-bottom:10px;
    display:flex; align-items:flex-start; gap:14px;
  }
  .rem-card.done { opacity:0.42; }
  .rem-card:hover { background:rgba(255,255,255,0.04); }
  .check-btn {
    width:26px; height:26px; border-radius:50%; flex-shrink:0; margin-top:2px;
    border:1.5px solid rgba(255,255,255,0.2); background:transparent;
    cursor:pointer; transition:all 0.22s; display:flex; align-items:center; justify-content:center;
    font-size:13px;
  }
  .check-btn.checked { background:rgba(100,200,120,0.3); border-color:rgba(100,200,120,0.6); animation:checkPop 0.3s ease; }
  .notif-btn {
    background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);
    border-radius:100px; color:rgba(200,200,200,0.6); cursor:pointer;
    font-family:'Cormorant Garamond',Georgia,serif;
    font-size:10px; letter-spacing:1.5px; padding:5px 13px; transition:all 0.22s;
    white-space:nowrap; flex-shrink:0;
  }
  .notif-btn:hover { background:rgba(255,255,255,0.1); color:#e8e0d5; }
  .notif-btn.sent { background:rgba(100,180,120,0.2); border-color:rgba(100,180,120,0.35); color:#82d9a3; }
  .top-nav {
    position:fixed; top:0; left:0; right:0; z-index:100;
    display:flex; align-items:center; justify-content:center; gap:4px;
    padding:10px 16px;
    background:rgba(4,8,14,0.88); backdrop-filter:blur(20px);
    border-bottom:1px solid rgba(255,255,255,0.06);
  }
  .top-nav-btn {
    background:transparent; border:none; cursor:pointer;
    font-family:'Cormorant Garamond',Georgia,serif;
    font-size:10px; letter-spacing:2px; color:rgba(200,190,220,0.45);
    padding:6px 12px; border-radius:100px; transition:all 0.25s;
    white-space:nowrap;
  }
  .top-nav-btn:hover { color:#e8e0d5; background:rgba(255,255,255,0.05); }
  .top-nav-btn.active { color:#c3a6d8; background:rgba(139,90,160,0.15); border:1px solid rgba(139,90,160,0.22); }
  .policy-screen {
    max-width:560px; width:100%; padding:88px 28px 100px;
    position:relative; z-index:1; text-align:left;
  }
  .policy-screen h1 { font-size:22px; font-weight:300; letter-spacing:4px; margin-bottom:6px; color:#e8e0d5; }
  .policy-screen .subtitle { font-size:10px; letter-spacing:3px; color:#4a5a6a; margin-bottom:36px; }
  .policy-screen h2 { font-size:12px; letter-spacing:3px; color:#7a5a90; margin:28px 0 10px; }
  .policy-screen p { font-size:13px; color:#8a9aaa; line-height:1.9; margin-bottom:10px; }
  .policy-screen ul { list-style:none; padding:0; margin:0 0 10px; }
  .policy-screen ul li { font-size:13px; color:#8a9aaa; line-height:1.9; padding-left:14px; position:relative; }
  .policy-screen ul li::before { content:"✦"; position:absolute; left:0; font-size:8px; color:#7a5a90; top:3px; }
  .policy-screen .divider { border:none; border-top:1px solid rgba(255,255,255,0.06); margin:24px 0; }
  .pricing-card {
    border-radius:18px; padding:20px 22px; margin-bottom:14px;
    position:relative; transition:all 0.25s;
  }
  .pricing-card:hover { transform:translateY(-2px); }
  .pricing-badge {
    display:inline-block; font-size:9px; letter-spacing:2px;
    padding:3px 10px; border-radius:100px; margin-bottom:10px;
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

function ReminderScreen({ onBack, onNext }) {
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
    <div style={{ maxWidth:430, width:"100%", padding:"28px 20px 100px", position:"relative", zIndex:1 }}>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:8 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#5a6a7a", cursor:"pointer", fontSize:18, padding:0 }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:9, letterSpacing:5, color:"#4a5a6a" }}>GÜN İÇİ</div>
          <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:20, fontWeight:300, letterSpacing:1.5 }}>Hatırlatıcılar</div>
        </div>
        <div style={{
          background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
          borderRadius:100, padding:"5px 14px", fontSize:12, color:"#8a9aaa", letterSpacing:1,
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
        <div style={{ background:"rgba(200,80,80,0.12)", border:"1px solid rgba(200,80,80,0.22)", borderRadius:12, padding:"10px 14px", marginBottom:14, fontSize:12, color:"#e8a0a0", lineHeight:1.6 }}>
          Bildirim izni gerekli. Tarayıcı ayarlarından izin ver.
        </div>
      )}
      {notifOk === true && (
        <div style={{ background:"rgba(80,180,100,0.1)", border:"1px solid rgba(80,180,100,0.22)", borderRadius:12, padding:"10px 14px", marginBottom:14, fontSize:12, color:"#82d9a3", lineHeight:1.6, animation:"fadeIn 0.4s ease" }}>
          ✦ Bildirim gönderildi
        </div>
      )}

      <button className="sakin-btn" style={{ width:"100%", marginBottom:18, fontSize:11, letterSpacing:2 }} onClick={sendAllNotifs}>
        📲 Tüm hatırlatıcıları telefona gönder
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
                  <span style={{ fontSize:18, flexShrink:0 }}>{rem.icon}</span>
                  <span style={{ fontSize:14, letterSpacing:0.3, color:isDone?"#6a7a8a":"#e8e0d5", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", minWidth:0 }}>{rem.title}</span>
                </div>
                <div style={{ fontSize:11, color:"#5a6a7a", lineHeight:1.5, marginBottom:rem.duration?8:0 }}>{rem.subtitle}</div>
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
                      cursor:"pointer", fontSize:10, letterSpacing:1.5,
                      padding:"4px 12px", transition:"all 0.22s",
                      fontFamily:"'Cormorant Garamond',Georgia,serif",
                    }}>
                      {isTiming ? `${mm}:${ss} ■` : `▶ ${mm}:${ss}`}
                    </button>
                  </div>
                )}
              </div>
              <button className={`notif-btn ${sent[rem.id]?"sent":""}`} onClick={() => handleNotif(rem)}>
                {sent[rem.id] ? "✓ gönderildi" : "bildir"}
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
          <div style={{ fontSize:28, marginBottom:8 }}>🌿</div>
          <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:18, color:"#82d9a3", letterSpacing:1 }}>
            Bugün kendine dokundun.
          </div>
        </div>
      )}

      <button
        className="sakin-btn-primary"
        onClick={onNext}
        style={{ width:"100%", marginTop:22, fontSize:11, letterSpacing:2 }}
      >
        akşam kapanışına geç →
      </button>
    </div>
  );
}

function TerapiScreen({ onBack }) {
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
    <div style={{ maxWidth:440, width:"100%", padding:"28px 20px 100px", position:"relative", zIndex:1 }}>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:28 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#5a6a7a", cursor:"pointer", fontSize:18, padding:0 }}>←</button>
        <div>
          <div style={{ fontSize:9, letterSpacing:5, color:"#4a5a6a" }}>REİKİ</div>
          <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:21, fontWeight:300, letterSpacing:2 }}>22 Çakra Terapi</div>
        </div>
      </div>
      <div style={{ maxHeight:"62vh", overflowY:"auto", paddingRight:4, scrollbarWidth:"none" }}>
        {CHAKRAS_22.map((c,i) => (
          <div key={c.name} className={`chakra-card slide-in ${selected?.name===c.name?"active":""}`}
            style={{ marginBottom:8, animationDelay:`${i*0.04}s`, opacity:0 }}
            onClick={() => setSelected(c)}>
            <div style={{ width:34,height:34,borderRadius:"50%",flexShrink:0, background:`radial-gradient(circle,${c.color}cc,${c.color}44)`, boxShadow:`0 0 10px ${c.color}55` }} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, letterSpacing:0.5, marginBottom:2 }}>{c.name}</div>
              <div style={{ fontSize:11, color:"#5a6a7a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.element} · {c.desc}</div>
            </div>
            {i<7 && <div style={{ fontSize:8,letterSpacing:2,color:"#4a5a6a",flexShrink:0 }}>TEMEL</div>}
          </div>
        ))}
      </div>
      {selected && (
        <div style={{ marginTop:18, background:`linear-gradient(135deg,${selected.color}18,transparent)`, border:`1px solid ${selected.color}44`, borderRadius:15, padding:"14px 18px", display:"flex",alignItems:"center",justifyContent:"space-between",gap:14 }}>
          <div>
            <div style={{ fontSize:10,letterSpacing:3,color:selected.pastel,marginBottom:3 }}>SEÇİLEN</div>
            <div style={{ fontSize:16,fontWeight:300 }}>{selected.name}</div>
          </div>
          <button className="sakin-btn-primary"
            style={{ background:`linear-gradient(135deg,${selected.color}99,${selected.color}55)`, borderColor:`${selected.color}55`, padding:"9px 22px",fontSize:12 }}
            onClick={() => setTPhase("intro")}>TERAPİYE BAŞLA</button>
        </div>
      )}
    </div>
  );

  if (tPhase==="intro"&&selected) return (
    <div className="fade-up" style={{ textAlign:"center",maxWidth:330,width:"100%",padding:"36px 24px 96px",position:"relative",zIndex:1,overflowY:"auto",maxHeight:"100vh" }}>
      <div style={{ marginBottom:32 }}>
        <div style={{ fontSize:9,letterSpacing:6,color:"#3a4a5a" }}>REİKİ · ÇAKRA TERAPİSİ</div>
        <div style={{ width:38,height:1,background:`${selected.color}44`,margin:"10px auto" }} />
      </div>
      <div style={{ width:108,height:108,borderRadius:"50%",margin:"0 auto 24px", background:`radial-gradient(circle,${selected.color}cc,${selected.color}33)`, boxShadow:`0 0 40px ${selected.color}66,0 0 80px ${selected.color}22`, animation:"slowPulse 3.8s ease-in-out infinite" }} />
      <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:24,fontWeight:300,letterSpacing:1,marginBottom:6 }}>{selected.name} Çakrası</div>
      <div style={{ fontSize:10,letterSpacing:3,color:selected.pastel,marginBottom:24 }}>{selected.element.toUpperCase()}</div>
      <div style={{ fontSize:13,color:"#6a7a8a",lineHeight:1.9,marginBottom:40,fontStyle:"italic" }}>
        Bir elini {selected.name.toLowerCase()} bölgende hisset.<br />Gözlerini yum.<br />{selected.desc}
      </div>
      <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
        <button className="sakin-btn" onClick={() => setTPhase("list")}>← geri</button>
        <button className="sakin-btn-primary" style={{ background:`linear-gradient(135deg,${selected.color}88,${selected.color}44)`,borderColor:`${selected.color}44` }} onClick={() => setTPhase("active")}>BAŞLA</button>
      </div>
    </div>
  );

  if (tPhase==="active"&&selected) return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",position:"relative",zIndex:1,width:"100%",maxWidth:370,padding:"18px 22px 80px",overflowY:"auto",maxHeight:"100vh" }}>
      {showBackConfirm && (
        <div style={{ position:"fixed",inset:0,zIndex:50,background:"rgba(4,8,16,0.88)",display:"flex",alignItems:"center",justifyContent:"center",padding:"0 32px" }}>
          <div style={{ textAlign:"center",maxWidth:280 }}>
            <div style={{ fontSize:32,marginBottom:18 }}>🌿</div>
            <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:22,fontWeight:300,letterSpacing:1,color:"#e8e0d5",marginBottom:10,lineHeight:1.5 }}>
              Emin misin?
            </div>
            <div style={{ fontSize:13,color:"#7a8a9a",lineHeight:1.8,marginBottom:32,fontStyle:"italic" }}>
              Bu an kendine hediye.<br />Biraz daha kal.
            </div>
            <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
              <button className="sakin-btn" onClick={resetTerapi}>çık</button>
              <button className="sakin-btn-primary" style={{ background:`linear-gradient(135deg,${selected.color}88,${selected.color}44)`,borderColor:`${selected.color}44` }} onClick={()=>setShowBackConfirm(false)}>devam et →</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ width:"100%",display:"flex",justifyContent:"flex-start",marginBottom:8 }}>
        <button onClick={()=>setShowBackConfirm(true)} style={{ background:"none",border:"none",color:"#3a4a5a",cursor:"pointer",fontSize:18,padding:0,letterSpacing:1 }}>←</button>
      </div>
      <div style={{ fontSize:9,letterSpacing:5,color:"#3a4a5a",marginBottom:24 }}>{selected.name.toUpperCase()} · {selected.element.toUpperCase()}</div>
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
      <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:50,fontWeight:300,letterSpacing:4,lineHeight:1,color:selected.pastel,textShadow:`0 0 ${20+progress*32}px ${selected.color}88`,marginBottom:4 }}>{mins}:{secs}</div>
      <div style={{ fontSize:9,letterSpacing:4,color:"#3a4a5a",marginBottom:24 }}>{Math.round(progress*100)}% YÜKLENDI</div>
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
      <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:15,fontStyle:"italic",color:`${selected.pastel}${hex(0.38+progress*0.55)}`,letterSpacing:0.5,textAlign:"center",lineHeight:1.9,maxWidth:270 }}>
        {progress<0.25 && "Elini hissediyorsun..."}
        {progress>=0.25&&progress<0.5  && `${selected.name} ışığı yayılıyor...`}
        {progress>=0.5 &&progress<0.75 && "Enerji akıyor, bırak gelsin..."}
        {progress>=0.75&&progress<0.95 && "Neredeyse tam. Hisset."}
        {progress>=0.95 && `${selected.name} çakran doluyor. 💫`}
      </div>
    </div>
  );

  if (tPhase==="done"&&selected) return (
    <div className="fade-up" style={{ textAlign:"center",maxWidth:310,width:"100%",padding:"36px 24px 80px",position:"relative",zIndex:1,overflowY:"auto",maxHeight:"100vh" }}>
      {[...Array(10)].map((_,i) => (
        <div key={i} style={{ position:"absolute",left:`${10+i*9}%`,top:`${10+(i%4)*18}%`,fontSize:11,color:selected.pastel,animation:`sparkle ${0.7+i*0.18}s ease-out forwards`,animationDelay:`${i*0.09}s` }}>✦</div>
      ))}
      <div style={{ width:126,height:126,borderRadius:"50%",margin:"0 auto 26px",background:`radial-gradient(circle,${selected.color}44,${selected.color}11)`,boxShadow:`0 0 40px ${selected.color}88,0 0 80px ${selected.color}33`,animation:"slowPulse 3.5s ease-in-out infinite" }} />
      <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:28,fontWeight:300,letterSpacing:2,marginBottom:8,color:selected.pastel }}>Tamamlandı.</div>
      <div style={{ fontSize:13,color:"#5a6a7a",marginBottom:36,fontStyle:"italic",lineHeight:1.8 }}>
        {selected.name} çakran aktif.<br />Bu enerjiyi gün boyu taşı.
      </div>
      <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
        <button className="sakin-btn" onClick={resetTerapi}>diğer çakra</button>
        <button className="sakin-btn" onClick={onBack}>ana ekran</button>
      </div>
    </div>
  );

  return null;
}

export default function SakinApp() {
  const [screen,        setScreen]        = useState("giris");
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
        headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
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
  const REIKI_BILGI = `Reiki Rehberi:
- 5 İlke: Bugün kızma / endişelenme / şükret / dürüst çalış / her canlıya şefkatle davran
- Çakra frekansları: Kök 396Hz (güvenlik), Sakral 417Hz (yaratıcılık), Güneş Pleksusu 528Hz (güç), Kalp 639Hz (sevgi), Boğaz 741Hz (ifade), Üçüncü Göz 852Hz (sezgi), Taç 963Hz (bilinç)
- El pozisyonları: Baş (sezgi) · Boğaz (ifade) · Kalp (sevgi) · Solar pleksus (güç-denge) · Karın (yaratıcılık-duygu) · Dizler & ayaklar (topraklama)
- Seans: Niyetle başla → eller 2-5cm üstte → pozisyon başına 3-5dk → enerji akışını hisset → şükranla kapat`;

  const generateSemptomAnaliz = async () => {
    if (!semptomInput.trim()) return;
    setSemptomAnaliz("__loading__");
    const zihinselListeText = ZIHINSEL_LISTE.map(z=>`${z.organ}: ${z.neden}`).join("\n");
    const astroText3 = astro ? `Kullanıcının doğum haritası: ${astro.burc} burcu, Yaşam Yolu Sayısı ${astro.yasam}, Kişisel Yıl ${astro.kisiselYil}.${birthTime?` Doğum saati ${birthTime}.`:""}` : "";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body: JSON.stringify({
          model:"claude-opus-4-6", max_tokens:900,
          system:`Sen derin bir holisitk sağlık rehberisin. Hastalık ve semptomlara hem Reiki hem de zihinsel-duygusal açıdan yaklaşıyorsun. Türkçe, şiirsel ve içten yaz. Kullanıcıyı "sen" diye hitap et. Asla tıbbi tavsiye verme, ruhsal-duygusal perspektifi paylaş.`,
          messages:[{ role:"user", content:`Kullanıcının semptomu: "${semptomInput}"

ZİHİNSEL NEDENLER REHBERİ:
${zihinselListeText}

${REIKI_BILGI}

${astroText3}

Bu semptomu yukarıdaki her iki rehberi birleştirerek analiz et ve şu formatta tam, benzersiz bir yanıt üret:

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
        headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body: JSON.stringify({
          model:"claude-opus-4-6", max_tokens:900,
          system:`Sen derin bir holistik enerji rehberisin. Şikayetlere duygusal-ruhsal açıdan yaklaşıyorsun. Türkçe, şiirsel ve içten yaz. "Sen" diye hitap et. Asla tıbbi tavsiye verme.`,
          messages:[{ role:"user", content:`Şikayet: "${sikayet}"${sikayetHis ? `\nNasıl hissediyorum: "${sikayetHis}"` : ""}

ZİHİNSEL NEDENLER:
${zihinselListeText}

${REIKI_BILGI}
${astroTxt}

Şu formatta yanıt ver:

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
        headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body: JSON.stringify({
          model:"claude-opus-4-6", max_tokens:900,
          system:`Sen derin bir holistik sağlık rehberisin. Hastalıklara ruhsal-enerjetik perspektiften yaklaşıyorsun. Türkçe, şiirsel ve içten yaz. "Sen" diye hitap et. Asla tıbbi tavsiye verme.`,
          messages:[{ role:"user", content:`Hastalık: "${hastalik}"${hastalikHis ? `\nNasıl hissediyorum: "${hastalikHis}"` : ""}

ZİHİNSEL NEDENLER:
${zihinselListeText}

${REIKI_BILGI}
${astroTxt}

Şu formatta yanıt ver:

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

    localStorage.setItem("sakin_rapor_used", "1");
    setRaporKullanildi(true);

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
        headers:{
          "Content-Type":"application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version":"2023-06-01",
          "anthropic-dangerous-direct-browser-access":"true"
        },
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
  const breathLabel = breathStarted ? {inhale:"içine al",hold:"tut",exhale:"bırak"}[breathPhase] : "";
  const breathScale = breathStarted ? (breathPhase==="exhale" ? 1 : 1.6) : 1;
  const handleMouseMove = e => { const r=e.currentTarget.getBoundingClientRect(); setOrb({x:((e.clientX-r.left)/r.width)*100,y:((e.clientY-r.top)/r.height)*100}); };

  const ambientColor = {
    giris:"139,90,160",sabah:"220,130,50",nefes:"80,130,200",
    chakra:`${parseInt(chakra.color.slice(1,3),16)},${parseInt(chakra.color.slice(3,5),16)},${parseInt(chakra.color.slice(5,7),16)}`,
    gun:"120,90,180",terapi:"74,160,100",aksam:"60,70,140",harita:"100,80,180",
  }[screen]||"139,90,160";

  const NAV = [
    {id:"sabah",icon:"🌅",label:"Sabah"},
    {id:"nefes",icon:"🫧",label:"Nefes"},
    {id:"chakra",icon:"💜",label:"Çakra"},
    {id:"gun",icon:"☀️",label:"Gün"},
    {id:"aksam",icon:"🌙",label:"Akşam"},
    {id:"harita",icon:"🗺️",label:"Harita"},
    {id:"rehber",icon:"📖",label:"Rehber"},
  ];

  return (
    <div onMouseMove={handleMouseMove} style={{ minHeight:"100vh",background:"#04080e",display:"flex",alignItems:["fiyat","sartlar","gizlilik","iade"].includes(screen)?"flex-start":"center",justifyContent:"center",fontFamily:"'Cormorant Garamond',Georgia,serif",color:"#e8e0d5",overflowX:"hidden",overflowY:["fiyat","sartlar","gizlilik","iade"].includes(screen)?"auto":"hidden",position:"relative" }}>
      <style>{GLOBAL_CSS}</style>

      {/* ÜST NAV */}
      <div className="top-nav">
        <button className={`top-nav-btn${screen==="fiyat"?" active":""}`} onClick={()=>setScreen("fiyat")}>FİYATLANDIRMA</button>
        <button className={`top-nav-btn${screen==="sartlar"?" active":""}`} onClick={()=>setScreen("sartlar")}>HİZMET ŞARTLARI</button>
        <button className={`top-nav-btn${screen==="gizlilik"?" active":""}`} onClick={()=>setScreen("gizlilik")}>GİZLİLİK</button>
        <button className={`top-nav-btn${screen==="iade"?" active":""}`} onClick={()=>setScreen("iade")}>İADE POLİTİKASI</button>
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
        <div style={{ maxWidth:340,textAlign:"center",padding:"48px 32px",position:"relative",zIndex:1 }}>
          <div className="fade-up">
            <div style={{ width:76,height:76,borderRadius:"50%",margin:"0 auto 26px",background:"radial-gradient(circle,rgba(139,90,160,0.48),rgba(72,130,180,0.16))",border:"1px solid rgba(139,90,160,0.26)",boxShadow:"0 0 28px rgba(139,90,160,0.38),0 0 60px rgba(139,90,160,0.14)",animation:"slowPulse 4s ease-in-out infinite" }} />
          </div>
          <div className="fade-up" style={{ animationDelay:"0.2s",opacity:0 }}>
            <div style={{ fontSize:44,letterSpacing:9,fontWeight:300,marginBottom:6 }}>Sakin</div>
          </div>
          <div className="fade-up" style={{ animationDelay:"0.38s",opacity:0 }}>
            <div style={{ fontSize:10,letterSpacing:4,color:"#5a6a7a",marginBottom:50 }}>Kendini hep hatırla</div>
          </div>
          <div className="fade-up" style={{ animationDelay:"0.6s",opacity:0 }}>
            <div style={{ color:"#7a8a9a",fontSize:14,lineHeight:2,marginBottom:46,fontStyle:"italic" }}>
              Bu uygulama sana bir şey öğretmez.<br />Sadece hatırlatır.
            </div>
            <button className="sakin-btn-primary" onClick={()=>setScreen("sabah")}>HAZİRIM</button>
          </div>
        </div>
      )}

      {/* SABAH */}
      {screen==="sabah" && (
        <div style={{ maxWidth:390,width:"100%",padding:"34px 26px 100px",position:"relative",zIndex:1 }}>
          <div style={{ textAlign:"center",marginBottom:32,animation:"sunrise 1s ease forwards" }}>
            <div style={{ width:108,height:108,borderRadius:"50%",margin:"0 auto",background:"radial-gradient(circle,rgba(255,155,55,0.52) 0%,rgba(255,95,35,0.16) 55%,transparent 70%)",boxShadow:"0 0 38px rgba(255,130,45,0.42),0 0 80px rgba(255,95,35,0.18)",animation:"slowPulse 4.5s ease-in-out infinite" }} />
            <div style={{ marginTop:12,fontSize:9,letterSpacing:5,color:"#5a6a7a" }}>{time.toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})}</div>
          </div>
          <div style={{ marginBottom:26 }}>
            <div style={{ fontSize:20,letterSpacing:1,marginBottom:14,fontWeight:300 }}>Bugünün niyeti nedir?</div>
            <textarea className="sakin-input" rows={3} placeholder="Bugün için bir niyet yaz..." value={niyet} onChange={e=>setNiyet(e.target.value)} />
          </div>
          <div style={{ marginBottom:32 }}>
            <div style={{ fontSize:9,letterSpacing:4,color:"#5a6a7a",marginBottom:12 }}>3 KELIME SEÇ</div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:7 }}>
              {MORNING_WORDS.map(w=>(
                <button key={w} className={`word-chip ${selectedWords.includes(w)?"selected":""}`} onClick={()=>toggleWord(w)}>{w}</button>
              ))}
            </div>
            {selectedWords.length>0 && <div style={{ marginTop:10,fontSize:11,color:"#8a9aaa",letterSpacing:1.5 }}>{selectedWords.join(" · ")}</div>}
          </div>
          {/* DOĞUM PROFİLİ KARTI */}
          <div style={{ background:"linear-gradient(135deg,rgba(60,40,120,0.12),rgba(100,60,160,0.06))",border:"1px solid rgba(100,70,180,0.18)",borderRadius:17,padding:"16px 20px",marginBottom:14,marginTop:10 }}>
            <div style={{ fontSize:9,letterSpacing:3.5,color:"#7a60b0",marginBottom:12,textAlign:"center" }}>DOĞUM PROFİLİ</div>
            {astro && !showBirthForm ? (
              <div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14 }}>
                  {[
                    {label:"Burç",value:astro.burc},
                    {label:"Yaşam Yolu",value:astro.yasam},
                    {label:"Kişisel Yıl",value:astro.kisiselYil},
                  ].map((s,i)=>(
                    <div key={i} style={{ background:"rgba(255,255,255,0.025)",borderRadius:10,padding:"9px 10px",textAlign:"center",border:"1px solid rgba(255,255,255,0.04)" }}>
                      <div style={{ fontSize:7,letterSpacing:2,color:"#5a4a7a",marginBottom:5 }}>{s.label.toUpperCase()}</div>
                      <div style={{ fontSize:15,color:"#c3a6d8",fontWeight:300 }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                {/* Biyoritm çubukları */}
                <div style={{ fontSize:8,letterSpacing:2,color:"#5a4a7a",marginBottom:7 }}>BİYORİTM — BU HAFTA</div>
                {[
                  {label:"Fiziksel",val:astro.bio.fiziksel,color:"#e8a09a"},
                  {label:"Duygusal",val:astro.bio.duygusal,color:"#85c1e9"},
                  {label:"Zihinsel",val:astro.bio.zihinsel,color:"#aed581"},
                ].map(({label,val,color})=>{
                  const {pct,positive}=bioritmBar(val);
                  return (
                    <div key={label} style={{ marginBottom:7 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}>
                        <span style={{ fontSize:9,color:"#6a5a8a",letterSpacing:1 }}>{label}</span>
                        <span style={{ fontSize:9,color:positive?color:"#6a5a6a" }}>{positive?"+":""}{val}%</span>
                      </div>
                      <div style={{ background:"rgba(255,255,255,0.04)",borderRadius:4,height:4,overflow:"hidden" }}>
                        <div style={{ height:"100%",width:`${pct}%`,background:positive?`${color}99`:"rgba(120,100,140,0.4)",borderRadius:4,transition:"width 0.8s ease",marginLeft:positive?"50%":`calc(50% - ${pct}%)` }} />
                      </div>
                    </div>
                  );
                })}
                {birthTime && (
                  <div style={{ fontSize:10,color:"#7a6a9a",letterSpacing:1.5,marginTop:8,marginBottom:2,textAlign:"center" }}>
                    ◷ {birthTime} doğum saati
                  </div>
                )}
                <button onClick={()=>setShowBirthForm(true)}
                  style={{ marginTop:10,background:"none",border:"none",color:"#4a3a6a",cursor:"pointer",fontSize:9,letterSpacing:2 }}>
                  tarihi değiştir
                </button>
              </div>
            ) : showBirthForm || !astro ? (
              <div>
                <div style={{ fontSize:11,color:"#5a4a7a",marginBottom:10,lineHeight:1.7,textAlign:"center" }}>
                  Doğum tarihinle kişiselleştirilmiş<br/>enerji yorumu alırsın.
                </div>
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:9,letterSpacing:2,color:"#5a4a7a",marginBottom:6 }}>DOĞUM TARİHİ</div>
                  <input type="date" className="sakin-input"
                    style={{ fontSize:12,letterSpacing:0.5 }}
                    value={birthInput}
                    onChange={e=>setBirthInput(e.target.value)} />
                </div>
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:9,letterSpacing:2,color:"#5a4a7a",marginBottom:6 }}>DOĞUM SAATİ <span style={{ color:"#3a2a5a",fontSize:8,letterSpacing:1 }}>(opsiyonel)</span></div>
                  <input type="time" className="sakin-input"
                    style={{ fontSize:12,letterSpacing:0.5 }}
                    value={birthTimeInput}
                    onChange={e=>setBirthTimeInput(e.target.value)} />
                </div>
                <div style={{ display:"flex",gap:8,justifyContent:"center" }}>
                  {astro && <button className="sakin-btn" onClick={()=>setShowBirthForm(false)}>iptal</button>}
                  <button className="sakin-btn-primary"
                    style={{ background:"linear-gradient(135deg,rgba(100,60,160,0.6),rgba(60,80,160,0.4))",borderColor:"rgba(100,70,180,0.4)",fontSize:11 }}
                    onClick={()=>{
                      if(!birthInput) return;
                      localStorage.setItem("sakin_birth_date", birthInput);
                      setBirthDate(birthInput);
                      if(birthTimeInput){ localStorage.setItem("sakin_birth_time", birthTimeInput); setBirthTime(birthTimeInput); }
                      setShowBirthForm(false);
                    }}>Kaydet</button>
                </div>
              </div>
            ) : null}
          </div>

          <button className="sakin-btn-primary" style={{ width:"100%" }} onClick={()=>setScreen("nefes")}>İLERLE</button>
        </div>
      )}

      {/* NEFES */}
      {screen==="nefes" && (
        <div style={{ textAlign:"center",padding:"34px 30px 100px",position:"relative",zIndex:1 }}>
          <div style={{ fontSize:9,letterSpacing:5,color:"#4a5a6a",marginBottom:48 }}>NEFES</div>
          <div style={{ position:"relative",width:205,height:205,margin:"0 auto 40px" }}>
            {[1.72,1.45,1.2].map((s,i)=>(
              <div key={i} style={{ position:"absolute",inset:0,borderRadius:"50%",border:`1px solid rgba(80,130,200,${0.1-i*0.025})`,transform:`scale(${s})` }} />
            ))}
            <div style={{ position:"absolute",inset:0,borderRadius:"50%",background:"radial-gradient(circle,rgba(80,130,200,0.62),rgba(139,90,160,0.24))",transition:"transform 4s ease",transform:`scale(${breathScale})`,display:"flex",alignItems:"center",justifyContent:"center" }}>
              <div style={{ fontSize:11,letterSpacing:2,color:"rgba(255,255,255,0.82)" }}>{breathLabel}</div>
            </div>
          </div>
          <div style={{ fontSize:25,letterSpacing:5,fontWeight:300,marginBottom:6 }}>Buradasın.</div>
          <div style={{ fontSize:10,color:"#4a5a6a",letterSpacing:2,marginBottom:40 }}>{breathStarted ? `${breathCount} nefes` : ""}</div>
          {!breathStarted ? (
            <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
              <button className="sakin-btn" onClick={()=>setScreen("sabah")}>← geri</button>
              <button className="sakin-btn-primary" onClick={()=>setBreathStarted(true)}>BAŞLA</button>
            </div>
          ) : (
            <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
              <button className="sakin-btn" onClick={()=>setScreen("sabah")}>← geri</button>
              <button className="sakin-btn-primary" onClick={()=>setScreen("chakra")}>devam →</button>
            </div>
          )}
        </div>
      )}

      {/* ÇAKRA */}
      {screen==="chakra" && (
        <div style={{ textAlign:"center",padding:"34px 30px 100px",position:"relative",zIndex:1,maxWidth:360 }}>
          <div style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none",background:`radial-gradient(ellipse at 50% 42%,${chakra.pastel}1a 0%,transparent 58%)` }} />
          <div style={{ position:"relative",zIndex:1 }}>
            <div style={{ fontSize:9,letterSpacing:5,color:"#4a5a6a",marginBottom:32 }}>REİKİ · GÜNÜN ÇAKRASI</div>
            <div style={{ width:146,height:146,borderRadius:"50%",margin:"0 auto 32px",background:`radial-gradient(circle,${chakra.color}cc,${chakra.pastel}44)`,boxShadow:`0 0 52px ${chakra.color}55,0 0 105px ${chakra.color}22`,animation:"slowPulse 4s ease-in-out infinite" }} />
            <div style={{ fontSize:11,letterSpacing:4,color:chakra.pastel,marginBottom:14 }}>{chakra.name.toUpperCase()} ÇAKRASI</div>
            <div style={{ fontSize:20,fontWeight:300,lineHeight:1.75,marginBottom:10,wordBreak:"break-word" }}>{chakra.desc}</div>
            <div style={{ fontSize:10,color:"#4a5a6a",marginBottom:28,letterSpacing:1 }}>Bugün bu merkezde kal.</div>
            <button className="sakin-btn terapi-pill" style={{ marginBottom:28,padding:"11px 28px" }} onClick={()=>setScreen("terapi")}>✦ 22 Çakra Terapi →</button>
            <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
              <button className="sakin-btn" onClick={()=>setScreen("nefes")}>← geri</button>
              <button className="sakin-btn-primary" onClick={()=>setScreen("gun")}>gün hatırlatıcıları →</button>
            </div>
          </div>
        </div>
      )}

      {screen==="terapi" && <TerapiScreen onBack={()=>setScreen("chakra")} />}
      {screen==="gun"    && <ReminderScreen onBack={()=>setScreen("chakra")} onNext={()=>setScreen("aksam")} />}

      {/* AKŞAM */}
      {screen==="aksam" && (
        <div style={{ maxWidth:385,width:"100%",padding:"34px 26px 100px",position:"relative",zIndex:1 }}>
          <div style={{ textAlign:"center",marginBottom:32 }}>
            <div style={{ fontSize:32,marginBottom:9 }}>🌙</div>
            <div style={{ fontSize:9,letterSpacing:5,color:"#4a5a6a" }}>AKŞAM KAPANIŞI</div>
          </div>
          {niyet && <div style={{ borderLeft:"2px solid rgba(139,90,160,0.32)",paddingLeft:15,marginBottom:26,color:"#7a8a9a",fontStyle:"italic",fontSize:14,lineHeight:1.7 }}>"{niyet}"</div>}
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:12,color:"#6a7a8a",marginBottom:9,letterSpacing:1 }}>Bugün ne öğrendin?</div>
            <textarea className="sakin-input" rows={2} placeholder="..." value={aksamNote} onChange={e=>setAksamNote(e.target.value)} />
          </div>
          <div style={{ marginBottom:26 }}>
            <div style={{ fontSize:12,color:"#6a7a8a",marginBottom:9,letterSpacing:1 }}>Şükür?</div>
            <textarea className="sakin-input" rows={2} placeholder="..." value={sukur} onChange={e=>setSukur(e.target.value)} />
          </div>
          <div style={{ marginBottom:32,display:"flex",gap:8,justifyContent:"center" }}>
            {["🫶","⚡","🌊","✨","🌿"].map(em=>(
              <button key={em} style={{ fontSize:21,background:"transparent",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"50%",width:44,height:44,cursor:"pointer",transition:"all 0.2s" }}
                onMouseEnter={ev=>ev.target.style.transform="scale(1.22)"}
                onMouseLeave={ev=>ev.target.style.transform="scale(1)"}>{em}</button>
            ))}
          </div>
          <button className="sakin-btn-primary" style={{ width:"100%" }} onClick={()=>setScreen("harita")}>HAFTAYI GÖR</button>
        </div>
      )}

      {/* REHBER */}
      {screen==="rehber" && (
        <div style={{ maxWidth:405,width:"100%",padding:"34px 26px 100px",position:"relative",zIndex:1 }}>
          {/* Gizemli arka plan efekti */}
          <div style={{ position:"fixed",inset:0,background:"radial-gradient(ellipse at 30% 20%,rgba(60,20,100,0.35) 0%,transparent 60%),radial-gradient(ellipse at 70% 80%,rgba(20,40,100,0.3) 0%,transparent 60%)",pointerEvents:"none",zIndex:0 }} />
          <div style={{ textAlign:"center",marginBottom:36,position:"relative" }}>
            <div style={{ fontSize:9,letterSpacing:6,color:"#4a3a6a",marginBottom:10 }}>✦ GİZEMLİ REHBERİ ✦</div>
            <div style={{ fontSize:22,fontWeight:300,letterSpacing:3,color:"#c8b0e8",textShadow:"0 0 40px rgba(180,120,255,0.4)" }}>Şifa Arayışı</div>
            <div style={{ fontSize:9,color:"#3a2a5a",marginTop:8,letterSpacing:2 }}>☽ bedenin mesajını oku ☽</div>
            <button onClick={toggleDevMode}
              style={{ position:"absolute",top:0,right:0,background:devMode?"rgba(255,180,0,0.15)":"rgba(255,255,255,0.04)",border:`1px solid ${devMode?"rgba(255,180,0,0.4)":"rgba(255,255,255,0.08)"}`,borderRadius:8,padding:"4px 9px",color:devMode?"#f0c040":"#4a5a6a",fontSize:9,letterSpacing:1.5,cursor:"pointer",fontFamily:"monospace" }}>
              {devMode ? "DEV ✓" : "DEV"}
            </button>
          </div>

          {/* ARAMA PANELİ 1 — ŞİKAYET */}
          {(() => {
            const AramaPaneli = ({ baslik, simge, aciklama, renk, value, onChange, his, onHisChange, analiz, onAra, onSifirla, placeholder }) => (
              <div style={{ marginBottom:24,background:"linear-gradient(160deg,rgba(10,4,30,0.92),rgba(15,8,40,0.88))",border:`1px solid ${renk}33`,borderRadius:20,padding:"22px 20px",backdropFilter:"blur(20px)",boxShadow:`0 0 40px ${renk}15, inset 0 1px 0 rgba(255,255,255,0.04)` }}>
                {/* Panel başlığı */}
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:18 }}>
                  <div style={{ width:36,height:36,borderRadius:"50%",background:`radial-gradient(circle,${renk}30,transparent)`,border:`1px solid ${renk}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>{simge}</div>
                  <div>
                    <div style={{ fontSize:10,letterSpacing:3,color:renk,opacity:0.9 }}>{baslik.toUpperCase()}</div>
                    <div style={{ fontSize:10,color:"#3a2a5a",marginTop:2,letterSpacing:1 }}>{aciklama}</div>
                  </div>
                </div>

                {analiz === "__loading__" ? (
                  <div style={{ textAlign:"center",padding:"24px 0" }}>
                    <div style={{ fontSize:18,marginBottom:10,animation:"pulse 2s ease-in-out infinite" }}>{simge}</div>
                    <div style={{ fontSize:9,letterSpacing:4,color:renk,opacity:0.7,animation:"pulse 1.5s ease-in-out infinite" }}>OKUNUM YAPILIYOR...</div>
                  </div>
                ) : analiz ? (
                  <div>
                    <div style={{ fontSize:9,letterSpacing:2.5,color:renk,opacity:0.8,marginBottom:12 }}>{value.toUpperCase()} · ANALİZ</div>
                    <div style={{ fontSize:12.5,color:"#ccc0e0",lineHeight:2,whiteSpace:"pre-wrap",fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{analiz}</div>
                    <button onClick={onSifirla}
                      style={{ background:"none",border:`1px solid ${renk}30`,borderRadius:20,color:renk,opacity:0.7,cursor:"pointer",fontSize:9,letterSpacing:2.5,marginTop:16,padding:"6px 16px" }}>
                      ✦ YENİ ARAMA
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      value={value}
                      onChange={e=>onChange(e.target.value)}
                      placeholder={placeholder}
                      style={{ width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.03)",border:`1px solid ${renk}25`,borderRadius:12,padding:"11px 14px",color:"#d0c8e8",fontSize:12.5,fontFamily:"'Cormorant Garamond',Georgia,serif",outline:"none",marginBottom:10,letterSpacing:0.5 }}
                    />
                    <textarea
                      value={his}
                      onChange={e=>onHisChange(e.target.value)}
                      placeholder="Nasıl hissediyorsun? Nerede ve ne zaman başladı?"
                      style={{ width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.025)",border:`1px solid ${renk}20`,borderRadius:12,padding:"10px 14px",color:"#b0a8d0",fontSize:11.5,fontFamily:"'Cormorant Garamond',Georgia,serif",resize:"none",height:72,lineHeight:1.75,outline:"none",marginBottom:12,letterSpacing:0.3 }}
                    />
                    <button onClick={onAra}
                      style={{ width:"100%",background:`linear-gradient(135deg,${renk}60,${renk}30)`,border:`1px solid ${renk}40`,borderRadius:12,padding:"11px",cursor:"pointer",color:"#e8d8f8",fontSize:11,letterSpacing:2,fontFamily:"'Cormorant Garamond',Georgia,serif" }}>
                      ✦ ANLAM ARA
                    </button>
                  </div>
                )}
              </div>
            );

            return (
              <>
                <AramaPaneli
                  baslik="İçsel Ayna"
                  simge="☽"
                  aciklama="bedeninin mesajını oku"
                  renk="#a070d0"
                  value={sikayet}
                  onChange={setSikayet}
                  his={sikayetHis}
                  onHisChange={setSikayetHis}
                  analiz={sikayetAnaliz}
                  onAra={generateSikayetAnaliz}
                  onSifirla={()=>{ setSikayetAnaliz(""); setSikayet(""); setSikayetHis(""); }}
                  placeholder="örn: baş ağrısı, yorgunluk, uyuyamıyorum..."
                />
              </>
            );
          })()}
        </div>
      )}

      {/* HARİTA */}
      {screen==="harita" && (
        <div style={{ maxWidth:405,width:"100%",padding:"34px 26px 100px",position:"relative",zIndex:1 }}>
          <div style={{ textAlign:"center",marginBottom:40 }}>
            <div style={{ fontSize:9,letterSpacing:5,color:"#4a5a6a",marginBottom:9 }}>HAFTALIK</div>
            <div style={{ fontSize:25,fontWeight:300,letterSpacing:2 }}>İçsel Harita</div>
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
              <div style={{ fontSize:25,fontWeight:300 }}>{Math.round(dayPct)}%</div>
              <div style={{ fontSize:8,letterSpacing:3,color:"#4a5a6a" }}>GÜN</div>
            </div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:32 }}>
            {[
              {label:"En Aktif Çakra",value:chakra.name,color:chakra.pastel},
              {label:"Nefes Sayısı",value:`${breathCount}`,color:"#82d9a3"},
              {label:"Niyet Kelimesi",value:selectedWords[0]||"—",color:"#f0c27f"},
              {label:"Bilinçli An",value:"3",color:"#85c1e9"},
            ].map((s,i)=>(
              <div key={i} style={{ background:"rgba(255,255,255,0.022)",border:"1px solid rgba(255,255,255,0.055)",borderRadius:13,padding:"13px 15px" }}>
                <div style={{ fontSize:8,letterSpacing:2.5,color:"#4a5a6a",marginBottom:6 }}>{s.label.toUpperCase()}</div>
                <div style={{ fontSize:16,color:s.color,fontWeight:300 }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div style={{ background:"linear-gradient(135deg,rgba(139,90,160,0.09),rgba(72,130,180,0.05))",border:"1px solid rgba(139,90,160,0.16)",borderRadius:17,padding:"16px 20px",marginBottom:24,textAlign:"center" }}>
            <div style={{ fontSize:9,letterSpacing:3.5,color:"#7a5a90",marginBottom:7 }}>ORKESTRA MODU</div>
            <div style={{ marginBottom:5 }}>
              {[...Array(7)].map((_,i)=>(
                <span key={i} style={{ display:"inline-block",width:8,height:8,borderRadius:"50%",background:`radial-gradient(circle,${CHAKRAS_7[i].pastel},transparent)`,margin:"0 3px",animation:`pulse ${1+i*0.2}s ease-in-out infinite`,animationDelay:`${i*0.14}s` }} />
              ))}
            </div>
            <div style={{ fontSize:11,color:"#7a8a9a" }}>Bugün <strong style={{ color:"#c8c0b8" }}>312 kişi</strong> seninle nefes aldı.</div>
          </div>
          <div style={{ background:"linear-gradient(135deg,rgba(100,60,160,0.12),rgba(60,80,140,0.07))",border:"1px solid rgba(139,90,160,0.22)",borderRadius:17,padding:"18px 20px",marginBottom:24 }}>
            <div style={{ fontSize:9,letterSpacing:3.5,color:"#9a6ab0",marginBottom:12,textAlign:"center" }}>HAFTALIK AI RAPOR</div>
            {raporKullanildi && !aiRapor && !aiLoading ? (
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:22,marginBottom:10 }}>✨</div>
                <div style={{ fontSize:13,color:"#c8a0e0",fontWeight:300,marginBottom:8 }}>Ücretsiz raporunu kullandın</div>
                <div style={{ fontSize:11,color:"#5a6a7a",lineHeight:1.8,marginBottom:16 }}>
                  Her hafta derin bir içsel rapor almak için<br/>
                  <strong style={{ color:"#9a7ab8" }}>Sakin Premium</strong>'a geç.
                </div>
                <div style={{ background:"rgba(139,90,160,0.08)",border:"1px solid rgba(139,90,160,0.2)",borderRadius:12,padding:"12px 16px",marginBottom:14 }}>
                  <div style={{ fontSize:10,letterSpacing:2,color:"#7a5a90",marginBottom:6 }}>PREMIUM</div>
                  <div style={{ fontSize:12,color:"#c0b0d0",lineHeight:1.7 }}>
                    ✦ Haftalık sınırsız AI rapor<br/>
                    ✦ Derin astroloji & numeroloji analizi<br/>
                    ✦ Kişisel büyüme takibi
                  </div>
                </div>
                <a href="mailto:destek@sakin.app?subject=Premium%20%C3%9Cyelik"
                  style={{ display:"inline-block",padding:"9px 22px",background:"linear-gradient(135deg,rgba(139,90,160,0.7),rgba(72,100,200,0.5))",border:"1px solid rgba(139,90,160,0.4)",borderRadius:22,color:"#e0d0f0",fontSize:11,letterSpacing:1,textDecoration:"none",cursor:"pointer" }}>
                  Premium'a Geç →
                </a>
              </div>
            ) : !aiRapor && !aiLoading ? (
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:11,color:"#5a6a7a",marginBottom:14,lineHeight:1.7 }}>Niyetlerin, şükranların ve öğrendiklerin<br/>AI ile haftalık rapora dönüşsün.</div>
                <button className="sakin-btn-primary"
                  style={{ background:"linear-gradient(135deg,rgba(139,90,160,0.7),rgba(72,100,200,0.5))",borderColor:"rgba(139,90,160,0.4)",fontSize:11 }}
                  onClick={generateRapor}>✦ Rapor Oluştur</button>
              </div>
            ) : aiLoading ? (
              <div style={{ textAlign:"center",padding:"12px 0" }}>
                <div style={{ fontSize:9,letterSpacing:3,color:"#7a5a90",animation:"pulse 1.5s ease-in-out infinite" }}>RAPOR HAZIRLANIYOR...</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize:12.5,color:"#c8bedd",lineHeight:1.9,whiteSpace:"pre-wrap" }}>{aiRapor}</div>
                <div style={{ display:"flex",gap:8,marginTop:14,flexWrap:"wrap" }}>
                  <button onClick={()=>{ navigator.clipboard.writeText(aiRapor).then(()=>{ setRaporKopyalandi(true); setTimeout(()=>setRaporKopyalandi(false),2000); }); }}
                    style={{ background:raporKopyalandi?"rgba(80,180,120,0.2)":"rgba(255,255,255,0.05)",border:`1px solid ${raporKopyalandi?"rgba(80,180,120,0.4)":"rgba(255,255,255,0.1)"}`,borderRadius:20,padding:"7px 16px",cursor:"pointer",color:raporKopyalandi?"#80e0a0":"#8a9ab0",fontSize:9,letterSpacing:2 }}>
                    {raporKopyalandi ? "✓ KOPYALANDI" : "KOPYALA"}
                  </button>
                  {navigator.share && (
                    <button onClick={()=>navigator.share({ title:"Haftalık İçsel Raporum", text:aiRapor })}
                      style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,padding:"7px 16px",cursor:"pointer",color:"#8a9ab0",fontSize:9,letterSpacing:2 }}>
                      PAYLAŞ
                    </button>
                  )}
                  <button onClick={()=>setAiRapor("")}
                    style={{ background:"none",border:"none",color:"#4a5a6a",cursor:"pointer",fontSize:9,letterSpacing:2,marginLeft:"auto" }}>
                    YENİLE
                  </button>
                </div>
              </div>
            )}
          </div>
          <button className="sakin-btn" style={{ width:"100%" }} onClick={()=>setScreen("giris")}>yeni güne başla</button>
        </div>
      )}

      {/* FİYATLANDIRMA */}
      {screen==="fiyat" && (
        <div className="policy-screen">
          <h1>Fiyatlandırma</h1>
          <div className="subtitle">SAKIN · ŞEFFAF FİYATLANDIRMA</div>

          {/* Ücretsiz */}
          <div className="pricing-card" style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.08)" }}>
            <div className="pricing-badge" style={{ background:"rgba(100,120,150,0.15)",border:"1px solid rgba(100,120,150,0.25)",color:"#7a9abb" }}>ÜCRETSİZ</div>
            <div style={{ fontSize:19,fontWeight:300,letterSpacing:2,marginBottom:4,color:"#e8e0d5" }}>Temel</div>
            <div style={{ fontSize:28,color:"#c8c0b8",letterSpacing:1,marginBottom:14 }}>₺0 <span style={{ fontSize:11,color:"#4a5a6a" }}>/ sonsuza kadar</span></div>
            <ul>
              {["Günlük sabah rutini","Nefes egzersizi (4-1.5-3.5 ritmi)","7 Çakra rehberi","Gün içi hatırlatıcılar (10+)","Akşam kapanış ritüeli","Haftalık iç harita","1 ücretsiz AI raporu"].map(f=>(
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>

          {/* Raporlama */}
          <div className="pricing-card" style={{ background:"rgba(139,90,160,0.06)",border:"1px solid rgba(139,90,160,0.22)" }}>
            <div className="pricing-badge" style={{ background:"rgba(139,90,160,0.18)",border:"1px solid rgba(139,90,160,0.35)",color:"#c3a6d8" }}>PRİUM</div>
            <div style={{ fontSize:19,fontWeight:300,letterSpacing:2,marginBottom:4,color:"#e8e0d5" }}>Sınırsız Raporlama 📊</div>
            <div style={{ fontSize:28,color:"#c8a96e",letterSpacing:1,marginBottom:4 }}>₺49 <span style={{ fontSize:11,color:"#4a5a6a" }}>/ ay</span></div>
            <div style={{ fontSize:11,color:"#6a7a6a",marginBottom:14 }}>veya ₺399 / yıl <span style={{ fontSize:10,color:"#4a6a4a" }}>(en uygun)</span></div>
            <ul>
              {["Haftalık sınırsız AI içsel rapor","Derin astroloji & numeroloji analizi","Aylık çakra haritası","Kişisel büyüme takibi","Nefes ve niyet arşivi"].map(f=>(
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>

          {/* 21 Günlük */}
          <div className="pricing-card" style={{ background:"rgba(45,120,65,0.06)",border:"1px solid rgba(45,120,65,0.22)" }}>
            <div className="pricing-badge" style={{ background:"rgba(45,120,65,0.18)",border:"1px solid rgba(45,120,65,0.35)",color:"#82d9a3" }}>TEK SEFERLİK</div>
            <div style={{ fontSize:19,fontWeight:300,letterSpacing:2,marginBottom:4,color:"#e8e0d5" }}>21 Günlük Program 🌱</div>
            <div style={{ fontSize:28,color:"#c8a96e",letterSpacing:1,marginBottom:14 }}>₺149</div>
            <ul>
              {["21 günlük kişisel dönüşüm programı","Her gün için özel tema ve görevler","Toprak, Nefes, Su, Doğa, Sessizlik…","Süresiz erişim"].map(f=>(
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>

          {/* Reiki */}
          <div className="pricing-card" style={{ background:"rgba(142,68,173,0.06)",border:"1px solid rgba(142,68,173,0.22)" }}>
            <div className="pricing-badge" style={{ background:"rgba(142,68,173,0.18)",border:"1px solid rgba(142,68,173,0.35)",color:"#ce93d8" }}>TEK SEFERLİK</div>
            <div style={{ fontSize:19,fontWeight:300,letterSpacing:2,marginBottom:4,color:"#e8e0d5" }}>Reiki Rehberi 🔮</div>
            <div style={{ fontSize:28,color:"#c8a96e",letterSpacing:1,marginBottom:14 }}>₺79</div>
            <ul>
              {["7 çakra için tam enerji rehberi","24+ fiziksel ve duygusal durum haritası","Semptom bazlı arama","El pozisyonları ve pratik uygulama","Süresiz erişim"].map(f=>(
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>

          {/* Hediye */}
          <div className="pricing-card" style={{ background:"rgba(192,57,43,0.06)",border:"1px solid rgba(192,57,43,0.22)" }}>
            <div className="pricing-badge" style={{ background:"rgba(192,57,43,0.18)",border:"1px solid rgba(192,57,43,0.35)",color:"#f48fb1" }}>HEDİYE</div>
            <div style={{ fontSize:19,fontWeight:300,letterSpacing:2,marginBottom:4,color:"#e8e0d5" }}>Hediye Kartı 🎁</div>
            <div style={{ fontSize:28,color:"#c8a96e",letterSpacing:1,marginBottom:14 }}>₺199</div>
            <p>Sevdiğin birine Sakin Premium deneyimini hediye et. Ödeme sonrası benzersiz bir hediye kodu oluşturulur.</p>
          </div>

          <hr className="divider" />
          <p style={{ fontSize:11,color:"#4a5a6a",textAlign:"center",letterSpacing:1 }}>Tüm ödemeler güvenli ödeme altyapısı üzerinden gerçekleştirilir. Sorularınız için: <a href="mailto:destek@sakin.app" style={{ color:"#7a5a90",textDecoration:"none" }}>destek@sakin.app</a></p>
        </div>
      )}

      {/* HİZMET ŞARTLARI */}
      {screen==="sartlar" && (
        <div className="policy-screen">
          <h1>Hizmet Şartları</h1>
          <div className="subtitle">SON GÜNCELLEME: MART 2026</div>

          <h2>1. KABUL</h2>
          <p>Sakin uygulamasını ("Uygulama") kullanarak bu Hizmet Şartlarını ("Şartlar") kabul etmiş sayılırsınız. Bu Şartları kabul etmiyorsanız Uygulamayı kullanmayınız.</p>

          <h2>2. HİZMET TANIMI</h2>
          <p>Sakin; günlük farkındalık rutinleri, nefes egzersizleri, çakra rehberi, kişisel gelişim programları ve spiritüel wellness içerikleri sunan bir mobil web uygulamasıdır. Uygulama herhangi bir tıbbi, psikolojik veya terapötik hizmet sağlamaz.</p>

          <h2>3. KULLANIM KOŞULLARI</h2>
          <p>Uygulamayı kullanırken aşağıdakileri kabul edersiniz:</p>
          <ul>
            <li>Uygulama yalnızca kişisel, ticari olmayan amaçlarla kullanılabilir</li>
            <li>Uygulama içeriği kopyalanamaz, dağıtılamaz veya tersine mühendislik uygulanamaz</li>
            <li>Sistemi kötüye kullanacak, zarar verecek veya aşırı yükleyecek eylemler yasaktır</li>
            <li>Yasal olmayan amaçlarla kullanım kesinlikle yasaktır</li>
          </ul>

          <h2>4. PREMİUM HİZMETLER</h2>
          <p>Bazı özellikler ücretli olup satın alma gerektirmektedir. Ödeme işlemleri güvenli üçüncü taraf altyapısı üzerinden gerçekleştirilir. Satın alınan dijital içerikler, aşağıda belirtilen iade politikası kapsamındadır.</p>

          <h2>5. FİKRİ MÜLKİYET</h2>
          <p>Uygulama içeriğindeki tüm metin, tasarım, grafik, animasyon ve yazılım Sakin'e aittir ve telif hakkı ile fikri mülkiyet yasalarıyla korunmaktadır. Kullanıcıya yalnızca sınırlı, devredilemez, kişisel kullanım lisansı tanınmaktadır.</p>

          <h2>6. SORUMLULUK REDDİ</h2>
          <p>Sakin bir wellness uygulamasıdır; tıbbi tavsiye, tanı veya tedavi sunmaz. Uygulama içerikleri yalnızca bilgilendirme ve kişisel farkındalık amacıyla sunulmaktadır. Herhangi bir sağlık sorununda mutlaka bir uzman hekime danışınız.</p>

          <h2>7. HİZMET DEĞİŞİKLİKLERİ</h2>
          <p>Sakin, önceden bildirim yapmaksızın hizmetin içeriğini, özelliklerini veya fiyatlandırmasını değiştirme hakkını saklı tutar. Önemli değişiklikler uygulama içinde duyurulacaktır.</p>

          <h2>8. UYGULANACAK HUKUK</h2>
          <p>Bu Şartlar Türkiye Cumhuriyeti hukuku kapsamında yorumlanır ve uygulanır. Anlaşmazlıklarda Türkiye mahkemeleri yetkilidir.</p>

          <h2>9. İLETİŞİM</h2>
          <p>Hizmet Şartlarına ilişkin sorularınız için: <a href="mailto:destek@sakin.app" style={{ color:"#7a5a90",textDecoration:"none" }}>destek@sakin.app</a></p>
        </div>
      )}

      {/* GİZLİLİK POLİTİKASI */}
      {screen==="gizlilik" && (
        <div className="policy-screen">
          <h1>Gizlilik Politikası</h1>
          <div className="subtitle">SON GÜNCELLEME: MART 2026</div>

          <h2>1. GENEL BAKIŞ</h2>
          <p>Sakin uygulaması ("Uygulama"), kullanıcıların kişisel gelişimini ve günlük farkındalık pratiklerini desteklemeyi amaçlamaktadır. Gizliliğinizi ciddiye alıyoruz.</p>

          <h2>2. TOPLANAN VERİLER</h2>
          <p>Aşağıdaki veriler yalnızca cihazınızda yerel olarak saklanır, hiçbir sunucuya iletilmez:</p>
          <ul>
            <li>Günlük niyet metni (o gün için yazdığınız hedef/niyet)</li>
            <li>Seçilen motivasyon kelimeleri (sabah seçilen 3 kelime)</li>
            <li>Akşam kapanış notları ve şükür metinleri</li>
            <li>Nefes egzersizi sayısı ve tamamlanma durumları</li>
            <li>Hatırlatıcı tamamlanma kayıtları</li>
            <li>Doğum tarihi ve saati (astroloji özellikleri için, cihazda kalır)</li>
            <li>Haftalık istatistikler (çakra, kelime ve nefes verileri)</li>
          </ul>

          <h2>3. TOPLAMADIĞIMIZ VERİLER</h2>
          <p>Uygulama şu verileri kesinlikle toplamaz:</p>
          <ul>
            <li>Kişisel kimlik bilgileri (ad, soyad, e-posta, telefon)</li>
            <li>Konum bilgisi</li>
            <li>Sağlık veya tıbbi veriler</li>
            <li>Biyometrik veriler</li>
            <li>Kamera veya mikrofon erişimi</li>
          </ul>

          <h2>4. AI RAPOR ÖZELLİĞİ</h2>
          <p>Haftalık AI raporu oluşturulurken, yalnızca o hafta için anonim ve özetlenmiş veriler (çakra seçimleri, kelimeler, nefes sayısı) Anthropic API'ye iletilir. Bu veriler kişisel kimliğinizle ilişkilendirilmez ve Anthropic'in gizlilik politikası kapsamındadır.</p>

          <h2>5. BİLDİRİMLER</h2>
          <p>Günlük hatırlatıcı bildirimleri için izin verirseniz, bildirimler yalnızca cihazınızda yerel olarak tetiklenir. Bildirim içerikleri sunucuya gönderilmez. İzninizi iOS/Android Ayarlar &gt; Sakin menüsünden istediğiniz zaman iptal edebilirsiniz.</p>

          <h2>6. ÜÇÜNCÜ TARAF HİZMETLER</h2>
          <p>Uygulama şu anda herhangi bir üçüncü taraf reklam ağı, analitik servisi veya sosyal medya entegrasyonu içermemektedir. Yalnızca AI rapor özelliği için Anthropic API kullanılmaktadır.</p>

          <h2>7. VERİ GÜVENLİĞİ</h2>
          <p>Tüm kişisel verileriniz cihazınızda yerel olarak saklanır. Uygulamayı cihazınızdan kaldırdığınızda tüm yerel veriler otomatik olarak silinir.</p>

          <h2>8. ÇOCUKLARIN GİZLİLİĞİ</h2>
          <p>Uygulama 4 yaş ve üzeri kullanıcılara yöneliktir. 13 yaşın altındaki çocuklardan bilerek herhangi bir veri toplanmamaktadır.</p>

          <h2>9. POLİTİKA DEĞİŞİKLİKLERİ</h2>
          <p>Bu gizlilik politikası zaman zaman güncellenebilir. Önemli değişiklikler uygulama güncellemesi notlarında belirtilecektir.</p>

          <h2>10. İLETİŞİM</h2>
          <p>Gizlilik politikasına ilişkin sorularınız için: <a href="mailto:destek@sakin.app" style={{ color:"#7a5a90",textDecoration:"none" }}>destek@sakin.app</a></p>
          <p style={{ fontSize:11,color:"#3a4a5a" }}>Uygulama Adı: Sakin</p>
        </div>
      )}

      {/* İADE POLİTİKASI */}
      {screen==="iade" && (
        <div className="policy-screen">
          <h1>İade Politikası</h1>
          <div className="subtitle">SON GÜNCELLEME: MART 2026</div>

          <h2>1. GENEL KURAL</h2>
          <p>Sakin'de sunulan premium içerikler dijital ürün niteliğindedir. Satın alma işleminin tamamlanmasıyla birlikte dijital içeriğe erişim hemen sağlandığından, genel kural olarak iade kabul edilmemektedir.</p>
          <p>Ancak müşteri memnuniyetini ön planda tutuyoruz. Aşağıdaki koşullar çerçevesinde iade talebinizi değerlendiririz.</p>

          <h2>2. İADE KABULEDİLEN DURUMLAR</h2>
          <ul>
            <li><strong style={{ color:"#c8c0b8" }}>Teknik arıza:</strong> Satın aldığınız özelliğe hiç erişemediyseniz ve destek ekibimiz sorunu 48 saat içinde çözemediyse</li>
            <li><strong style={{ color:"#c8c0b8" }}>Çift ödeme:</strong> Aynı ürün için hatalı şekilde iki kez ödeme yapıldıysa</li>
            <li><strong style={{ color:"#c8c0b8" }}>İlk 48 saat:</strong> Satın alma tarihinden itibaren 48 saat içinde, içeriğe hiç erişilmemişse iade değerlendirilebilir</li>
          </ul>

          <h2>3. İADE KABULEDİLMEYEN DURUMLAR</h2>
          <ul>
            <li>İçeriğe erişilmiş veya kullanılmış olması</li>
            <li>Satın almadan 48 saat geçmiş olması</li>
            <li>"Beğenmedim" veya "beklentimi karşılamadı" gerekçesi (ücretsiz deneme imkânı sunulmaktadır)</li>
            <li>Hesap askıya alınma veya Hizmet Şartlarının ihlali durumu</li>
          </ul>

          <h2>4. ABONELIK İPTALİ</h2>
          <p>Aylık veya yıllık abonelik (Sınırsız Raporlama) için: mevcut dönem sona erene kadar erişiminiz devam eder. İptal işlemi bir sonraki ödeme döneminden önce gerçekleştirilmelidir. Kısmi dönem için iade yapılmamaktadır.</p>

          <h2>5. İADE SÜRECİ</h2>
          <p>İade talebinde bulunmak için aşağıdaki bilgilerle bize ulaşın:</p>
          <ul>
            <li>Satın alma tarihi ve işlem numarası</li>
            <li>Satın alınan ürün adı</li>
            <li>İade gerekçesi</li>
          </ul>
          <p>E-posta: <a href="mailto:destek@sakin.app" style={{ color:"#7a5a90",textDecoration:"none" }}>destek@sakin.app</a></p>
          <p>Talebiniz 5 iş günü içinde yanıtlanacaktır. Onaylanan iadeler, ödeme yönteminize bağlı olarak 5–10 iş günü içinde yansıtılır.</p>

          <h2>6. YASAL HAKLAR</h2>
          <p>Bu politika, Türkiye Mesafeli Sözleşmeler Yönetmeliği ve 6502 Sayılı Tüketicinin Korunması Hakkında Kanun kapsamındaki yasal haklarınızı etkilememektedir.</p>

          <h2>7. İLETİŞİM</h2>
          <p>İade ve ödeme sorularınız için: <a href="mailto:destek@sakin.app" style={{ color:"#7a5a90",textDecoration:"none" }}>destek@sakin.app</a></p>
        </div>
      )}

      {/* BOTTOM NAV */}
      {!["giris","terapi","gun","fiyat","sartlar","gizlilik","iade"].includes(screen) && (
        <div style={{ position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",display:"flex",gap:0,alignItems:"center",zIndex:20,background:"rgba(4,8,14,0.9)",backdropFilter:"blur(28px)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:100,padding:"7px 10px" }}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setScreen(n.id)} style={{ background:"transparent",border:"none",cursor:"pointer",fontSize:screen===n.id?17:13,opacity:screen===n.id?1:0.26,transition:"all 0.32s",transform:screen===n.id?"translateY(-3px)":"none",padding:"4px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:2 }}>
              <span>{n.icon}</span>
              <span style={{ fontSize:6,letterSpacing:1.5,color:screen===n.id?"#a0b0c0":"transparent",transition:"color 0.3s" }}>{n.label.toUpperCase()}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
