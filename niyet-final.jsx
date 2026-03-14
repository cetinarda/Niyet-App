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

const hexToRgb = hex => {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
};

const PROGRAM_21 = [
  { gun:1,  tema:"Zemin",       emoji:"🌍", renk:"#8b6914", pastel:"#c8a96e",
    gorevler:["Sabah 5 dakika çıplak ayakla yürü","Günün niyetini yüksek sesle 3 kez söyle","Akşam 1 şeye şükret"] },
  { gun:2,  tema:"Nefes",       emoji:"🌬", renk:"#2980b9", pastel:"#85c1e9",
    gorevler:["4-1.5-3.5 ritmiyle 10 nefes döngüsü yap","Sabah kalkmadan önce 3 derin nefes al","Nefes alırken gözlerini kapat ve bedeni hisset"] },
  { gun:3,  tema:"Beden",       emoji:"🧘", renk:"#27ae60", pastel:"#82d9a3",
    gorevler:["10 dakika esneme hareketi yap","Omuz ve boyun masajı yap (kendi kendine)","Akşam 2 dakika beden taraması: baştan ayağa hisset"] },
  { gun:4,  tema:"Su",          emoji:"💧", renk:"#1a6b8a", pastel:"#6ab4cc",
    gorevler:["Günde en az 8 bardak su iç","Her yudum suyu bilinçli iç — hisset","Suya şükran hisset"] },
  { gun:5,  tema:"Doğa",        emoji:"🌿", renk:"#2d6a4f", pastel:"#74c69d",
    gorevler:["10 dakika dışarıda yürü","Bir ağaca ya da bitkiye dokun","Gökyüzüne en az 2 dakika bak"] },
  { gun:6,  tema:"Sessizlik",   emoji:"🤫", renk:"#34495e", pastel:"#85929e",
    gorevler:["Sabah 10 dakika sessizlikte otur — hiçbir şey yapma","Telefonu 1 saat kapat","Yemek yerken ekransız ye"] },
  { gun:7,  tema:"Minnet",      emoji:"🙏", renk:"#8b5a2b", pastel:"#d4a96e",
    gorevler:["3 kişiye zihinsel olarak şükret","Bugün birine iyilik yap","Akşam 5 şükür listesi yaz"] },
  { gun:8,  tema:"Kalp",        emoji:"💚", renk:"#1e8449", pastel:"#82d9a3",
    gorevler:["Ellerini kalbine koy, 1 dakika sadece hisset","Sevdiğin birine 'seni seviyorum' de","Kendine şefkatli bir şey söyle"] },
  { gun:9,  tema:"Işık",        emoji:"☀️", renk:"#d4ac0d", pastel:"#f9e79f",
    gorevler:["Sabah güneşe bak, 3 derin nefes al","Gün içinde 10 dakika güneş ışığı al","Birine ışık ver: iltifat et ya da yardım et"] },
  { gun:10, tema:"Ses",         emoji:"🎵", renk:"#1a5276", pastel:"#7fb3d3",
    gorevler:["Sevdiğin bir müziği tam konsantrasyonla dinle","Kendi sesini duy: şarkı söyle veya sesini çıkar","Doğanın seslerini 5 dakika dinle"] },
  { gun:11, tema:"Farkındalık", emoji:"✨", renk:"#7d3c98", pastel:"#c39bd3",
    gorevler:["Bugün 5 anı bilinçli yaşa: 'şu an buradasın' de","Yemek yerken her lokmayı hisset","Akşam bugünün en güzel anını yaz"] },
  { gun:12, tema:"Toprak",      emoji:"🌱", renk:"#5d4037", pastel:"#bcaaa4",
    gorevler:["Toprağa çıplak ayakla bas, 5 dakika dur","Bir bitkiyi ya da toprağı elinle hisset","Toprakla bağını güçlendir"] },
  { gun:13, tema:"Hareket",     emoji:"🌊", renk:"#0e6655", pastel:"#76d7c4",
    gorevler:["10 dakika serbest hareket et ya da dans et","Vücudunu esnet: rahatlamasını hisset","Yürüyüşe çık ve her adımı hisset"] },
  { gun:14, tema:"Yansıma",     emoji:"🪞", renk:"#2c3e50", pastel:"#85929e",
    gorevler:["Bu 2 haftayı düşün: ne değişti?","Kendin için bir şey yap (banyo, müzik, doğa)","Yarın için bir niyet belirle"] },
  { gun:15, tema:"İçgüdü",      emoji:"🔮", renk:"#6c3483", pastel:"#c39bd3",
    gorevler:["Bugün içgüdülerine güven: kalbinin sesini duy","Bir karar alırken dur, nefes al, hisset","Sezginin seni nereye götürdüğünü yaz"] },
  { gun:16, tema:"Bağlantı",    emoji:"🤝", renk:"#1a5276", pastel:"#85c1e9",
    gorevler:["Sevdiğin birine gerçekten sor: 'Nasılsın?'","Bugün birini gözlemle: ona şefkatle bak","5 dakika sessizce otur, iç bağlantına giriş yap"] },
  { gun:17, tema:"Akış",        emoji:"💫", renk:"#117a65", pastel:"#76d7c4",
    gorevler:["Bugün bir şeyi sevdiğin için yap, 'zorunluluk' değil","Bir yaratıcı etkinlik dene (çiz, yaz, pişir)","Seni durduran bir şeyi bırak"] },
  { gun:18, tema:"Sınırlar",    emoji:"🛡", renk:"#922b21", pastel:"#f1948a",
    gorevler:["'Hayır' demen gereken bir şeye 'hayır' de","Kendi alanını koru: bir yalnızlık anı yarat","Sınırların neler? 2 tanesini yaz"] },
  { gun:19, tema:"Şükür",       emoji:"🌻", renk:"#d4ac0d", pastel:"#f9e79f",
    gorevler:["10 şükür yaz: küçük şeylere odaklan","Yaşayan birine 'seni takdir ediyorum' de","Bugünün en güzel anını akşam yaz"] },
  { gun:20, tema:"Dönüşüm",     emoji:"🦋", renk:"#6c3483", pastel:"#d2b4de",
    gorevler:["İşe yaramayan 1 alışkanlığı tanımla","Bu alışkanlığın yerine 1 küçük adım koy","Dönüşüm doğal: bugün bunu hisset"] },
  { gun:21, tema:"Bütünleşme",  emoji:"🌟", renk:"#1b2631", pastel:"#aab7b8",
    gorevler:["21 günü düşün: ne öğrendin, ne hissettin?","Kendine bir mektup yaz: 6 ay sonra aç","Bunu kutla: dans et, bağır, ağla — hissettir"] },
];

const PACKAGES = [
  { id:"raporlama", emoji:"📊", baslik:"Sınırsız Raporlama", fiyat:"₺49/ay",
    fiyatYillik:"₺399/yıl", renk:"#8b5aa0",
    aciklama:"Günlük, haftalık ve aylık tüm istatistiklerine eriş. Çakra geçmişin, nefes sayın ve niyet arşivin sana açılır.",
    ozellikler:["Haftalık detaylı rapor","Aylık çakra haritası","Niyet arşivi","Nefes geçmişi"] },
  { id:"program21", emoji:"🌱", baslik:"21 Günlük Program", fiyat:"₺149",
    fiyatYillik:null, renk:"#27ae60",
    aciklama:"Her günün teması, ödevleri ve rehberli yolculuğu. 21 gün boyunca kendini yeniden keşfet.",
    ozellikler:["21 günlük günlük ödevler","Her gün farklı tema","İlerleme takibi","Tamamlama rozeti"] },
  { id:"rehber", emoji:"🔮", baslik:"Reiki Rehberi", fiyat:"₺79",
    fiyatYillik:null, renk:"#8e44ad",
    aciklama:"7 çakranın duygu & organ haritası + 24 hastalığın zihinsel nedeni. Kendi enerjinle çalış.",
    ozellikler:["7 çakra duygusal harita","24+ hastalık & zihinsel neden","Arama ile hızlı erişim"] },
  { id:"hediye", emoji:"🎁", baslik:"Hediye Kartı", fiyat:"₺199",
    fiyatYillik:null, renk:"#c0392b",
    aciklama:"Sevdiğin birine Sakin Premium'u hediye et. Ödeme sonrası bir hediye kodu oluşturulur.",
    ozellikler:["Anında hediye kodu","21 Günlük Program içerir","İstediğin kişiye gönder"] },
];

const REIKI_CHAKRALAR = [
  { isim:"Kök",            emoji:"🟥", renk:"#c0392b", pastel:"#e8a09a",
    duygular:["Güvenlik","Hayatta kalma","Zemin","Temel ihtiyaçlar","Güven"],
    beden:["Böbrekler","Omurilik","Siyatik siniri","Bacaklar","Ayaklar"],
    dengesiz:["Depresyon","Derin üzüntü","Güvensizlik","Panik","Fiziksel dengesizlik"],
    anahtar:"Güvende hisset. Yere bas." },
  { isim:"Sakral",         emoji:"🟧", renk:"#e67e22", pastel:"#f0c27f",
    duygular:["Yaratıcılık","Zevk","Cinsellik","İlişkiler","Akış"],
    beden:["Pelvis","Üreme organları","Mesane","Lenf sistemi"],
    dengesiz:["İlişki sorunları","Yaratıcılık blokajı","Cinsellik sorunları","Anksiyete"],
    anahtar:"Hisset. Akmana izin ver." },
  { isim:"Güneş Pleksusu", emoji:"🟨", renk:"#f1c40f", pastel:"#f7e18a",
    duygular:["Kişisel güç","İrade","Özgüven","Sınırlar","Kimlik"],
    beden:["Mide","Dalak","Pankreas","Karaciğer","Böbrekler","Sırt ortası"],
    dengesiz:["Suçluluk","Utanç","Korku","Yetersizlik","Hareketsizlik"],
    anahtar:"Güçlü ol. Işığın var." },
  { isim:"Kalp",           emoji:"🟩", renk:"#27ae60", pastel:"#82d9a3",
    duygular:["Sevgi","Şefkat","Kabul","Bağlantı","Affetme"],
    beden:["Kalp","Akciğerler","Dolaşım sistemi","Kan","Sırt üstü"],
    dengesiz:["Travma","Yas","Kayıp","Depresyon","İlişki sorunları","Kapanma"],
    anahtar:"Sevgiyle aç. Kendine de." },
  { isim:"Boğaz",          emoji:"🟦", renk:"#2980b9", pastel:"#85c1e9",
    duygular:["İfade","Hakikat","Yaratıcılık","Kendini gösterme","Dürüstlük"],
    beden:["Tiroit","Boğaz","Ses telleri","Akciğer üstü","Boyun"],
    dengesiz:["Söyleyememek","Yutkunmak","Guatr","Larenjit","Tiroit sorunları"],
    anahtar:"Bugün hakikatini söyle." },
  { isim:"Üçüncü Göz",    emoji:"🟣", renk:"#8e44ad", pastel:"#c3a6d8",
    duygular:["Sezgi","İç görü","Bilinç","Farkındalık","Altıncı his"],
    beden:["Gözler","Burun","Kulaklar","Hipofiz bezi","Merkezi sinir sistemi"],
    dengesiz:["Kafa karışıklığı","Hayal kuramama","Başağrısı","Odaklanamama"],
    anahtar:"Bugün içeriye bak." },
  { isim:"Taç",            emoji:"⬜", renk:"#9b59b6", pastel:"#d9b8e8",
    duygular:["Evrensel bağlantı","Meditasyon","Bilinç","Bütünlük","Anlam"],
    beden:["Beyin","Epifiz bezi","Merkezi sinir sistemi"],
    dengesiz:["İzolasyon","Ruhsal kopukluk","Anlamsızlık","Hayat amacını kaybetme"],
    anahtar:"Bugün bütünle bağlan." },
];

const REIKI_HASTALIKLAR = [
  { ad:"Başağrısı",          emoji:"🤕", cakralar:["Üçüncü Göz","Taç","Güneş Pleksusu"],  zihinsel:"Baskı, kontrol ihtiyacı, mükemmeliyetçilik" },
  { ad:"Depresyon",          emoji:"😔", cakralar:["Kök","Sakral","Taç"],                  zihinsel:"Temel güvensizlik, bağlantı kopukluğu, anlamsızlık" },
  { ad:"Stres / Anksiyete",  emoji:"😰", cakralar:["Güneş Pleksusu","Kök","Kalp"],        zihinsel:"Geleceğe dair kontrol ihtiyacı, güvensizlik, yetmeme korkusu" },
  { ad:"Sırt Ağrısı",        emoji:"😣", cakralar:["Güneş Pleksusu","Sakral","Kök"],      zihinsel:"Desteksiz hissetmek, sorumluluk yükü, mali kaygı" },
  { ad:"Kalp Sorunları",     emoji:"❤️",  cakralar:["Kalp"],                               zihinsel:"Sevgisizlik, yas, travma, yalnızlık, affedememek" },
  { ad:"Sindirim Sorunları", emoji:"🫃", cakralar:["Güneş Pleksusu","Kök"],               zihinsel:"Endişe, korku yutmak, hazmedilemeyenler" },
  { ad:"Kan Basıncı",        emoji:"💓", cakralar:["Kalp","Boğaz"],                        zihinsel:"Bastırılmış öfke, kontrol ihtiyacı, kronik stres" },
  { ad:"Diyabet",            emoji:"🩸", cakralar:["Güneş Pleksusu"],                      zihinsel:"Hayatın tatlılığına direniş, sevgisizlik, keder" },
  { ad:"Tiroit Sorunları",   emoji:"🦋", cakralar:["Boğaz","Güneş Pleksusu"],             zihinsel:"Kendini ifade edememe, susmak zorunda kalmak, bastırılmış yaratıcılık" },
  { ad:"Cilt Sorunları",     emoji:"🌡", cakralar:["Güneş Pleksusu"],                      zihinsel:"Öfke, tahriş, dışarıya karşı savunma, sınır sorunları" },
  { ad:"Böbrek Sorunları",   emoji:"🫘", cakralar:["Kök","Güneş Pleksusu"],               zihinsel:"Derin korku, eleştiri, hayal kırıklığı, başarısızlık korkusu" },
  { ad:"Alerjiler / Astım",  emoji:"🤧", cakralar:["Kalp","Boğaz"],                        zihinsel:"Baskı altında hissetmek, söylenmek isteyip söyleyememek" },
  { ad:"Kabızlık",           emoji:"😮‍💨", cakralar:["Güneş Pleksusu","Kök"],              zihinsel:"Bırakamamak, kontrol, tutma, eski fikirlere yapışmak" },
  { ad:"Karaciğer Sorunları",emoji:"⚡", cakralar:["Güneş Pleksusu"],                     zihinsel:"Öfke, şikayetler, kronik stres, öz kınama" },
  { ad:"Uyku / Kabus",       emoji:"😴", cakralar:["Üçüncü Göz","Boğaz","Güneş Pleksusu"],zihinsel:"Bastırılmış korku, güvensizlik, kaygı" },
  { ad:"Öfke / Sinirlilik",  emoji:"😤", cakralar:["Sakral","Güneş Pleksusu"],            zihinsel:"Sınırların ihlali, güçsüzlük hissi, bastırılmış ifade" },
  { ad:"Romatizma / Artrit", emoji:"🦴", cakralar:["Kalp","Güneş Pleksusu"],              zihinsel:"Kırgınlık, kendine karşı katılık, esnek olmama" },
  { ad:"Öksürük / Nezle",    emoji:"🤒", cakralar:["Boğaz","Kalp","Güneş Pleksusu"],     zihinsel:"Söylenemeyen şeyler, içe kapanma, kendini yıpratma" },
  { ad:"Göz Sorunları",      emoji:"👁", cakralar:["Üçüncü Göz","Taç"],                   zihinsel:"Görmek istememe, geleceğe korku, gerçekten kaçma" },
  { ad:"Kulak Sorunları",    emoji:"👂", cakralar:["Üçüncü Göz","Taç"],                   zihinsel:"Duymak istememe, eleştiriye kapalılık" },
  { ad:"Menstrual Sorunlar", emoji:"🌸", cakralar:["Sakral","Üçüncü Göz","Taç"],          zihinsel:"Kadınlığı reddetmek, değersizlik hissi, cinselliğe dair korku" },
  { ad:"Kaza / Yaralanma",   emoji:"🩹", cakralar:["Güneş Pleksusu","Kök"],               zihinsel:"Öz ceza, dikkat çekme ihtiyacı, hayatta yönelim kaybı" },
  { ad:"Kanser",             emoji:"🎗", cakralar:["Tüm çakralar"],                        zihinsel:"Derin kırgınlık, acıyı içte taşımak, kendini yemek" },
  { ad:"Bağımlılık",         emoji:"🍷", cakralar:["Güneş Pleksusu","Boğaz","Kök"],       zihinsel:"Gerçeklikten kaçış, acısından kurtulma, kendini uyuşturma" },
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
  @keyframes floatUp      { 0%{opacity:0;transform:translate(0,0) scale(0.4)} 20%{opacity:1} 80%{opacity:0.5} 100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(1.3)} }
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
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  .prem-tag {
    font-size:9px; letter-spacing:2px; color:#4ade80;
    background:rgba(74,222,128,0.1); border:1px solid rgba(74,222,128,0.22);
    border-radius:100px; padding:3px 9px; display:inline-block;
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

function ReminderScreen({ onBack }) {
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

  const resetTerapi = () => { setTPhase("list"); setSelected(null); setElapsed(0); setParticles([]); clearInterval(timerRef.current); clearInterval(particleRef.current); };
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
            <div style={{ width:34,height:34,borderRadius:"50%",flexShrink:0, background:`radial-gradient(circle,${c.color}cc,${c.color}44)`, boxShadow:`0 0 10px ${c.color}55`, display:"flex",alignItems:"center",justifyContent:"center",fontSize:13 }}>{c.emoji}</div>
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
      <div style={{ width:108,height:108,borderRadius:"50%",margin:"0 auto 24px", background:`radial-gradient(circle,${selected.color}cc,${selected.color}33)`, boxShadow:`0 0 40px ${selected.color}66,0 0 80px ${selected.color}22`, animation:"heartbeat 1.4s ease-in-out infinite", display:"flex",alignItems:"center",justifyContent:"center",fontSize:40 }}>{selected.emoji}</div>
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
          animation:heartAnim, display:"flex",alignItems:"center",justifyContent:"center",fontSize:46,
        }}>{selected.emoji}</div>
        {particles.map(p => (
          <div key={p.id} className="particle" style={{ left:`${p.x}%`,top:`${p.y}%`,width:p.size,height:p.size,"--dx":`${p.dx}px`,"--dy":`${p.dy}px`,"--dur":`${p.dur}s`,background:`radial-gradient(circle,${selected.pastel},${selected.color}88)` }} />
        ))}
      </div>
      <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:50,fontWeight:300,letterSpacing:4,lineHeight:1,color:selected.pastel,textShadow:`0 0 ${20+progress*32}px ${selected.color}88`,marginBottom:4 }}>{mins}:{secs}</div>
      <div style={{ fontSize:9,letterSpacing:4,color:"#3a4a5a",marginBottom:24 }}>{Math.round(progress*100)}% YÜKLENDI</div>
      <div style={{ marginBottom:18,opacity:0.65+progress*0.35 }}>
        <svg width="148" height="126" viewBox="0 0 148 126" fill="none" style={{ animation:"handFloat 3s ease-in-out infinite" }}>
          <circle cx="74" cy="20" r="13" stroke={`${selected.pastel}88`} strokeWidth="1.2" fill="none" />
          <line x1="74" y1="33" x2="74" y2="41" stroke={`${selected.pastel}66`} strokeWidth="1.2" />
          <path d="M51 41 Q74 39 97 41 L95 87 Q74 91 53 87Z" stroke={`${selected.pastel}55`} strokeWidth="1.2" fill={`${selected.color}0a`} />
          <path d="M53 49 Q39 59 35 77 Q33 87 37 93" stroke={`${selected.pastel}44`} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M95 49 Q111 45 117 41 Q121 37 115 33" stroke={`${selected.pastel}88`} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M115 33 Q121 27 117 23 Q113 19 109 23" stroke={`${selected.pastel}88`} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M109 23 Q105 17 109 15 M113 21 Q109 15 113 13 M117 23 Q115 15 119 14" stroke={`${selected.pastel}66`} strokeWidth="1" strokeLinecap="round" fill="none" />
          <path d="M65 87 Q63 105 61 121" stroke={`${selected.pastel}44`} strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <path d="M83 87 Q85 105 87 121" stroke={`${selected.pastel}44`} strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <circle cx="74" cy="59" r={4+progress*7} fill={`${selected.color}${hex(0.07+progress*0.18)}`} stroke={`${selected.pastel}${hex(0.28+progress*0.5)}`} strokeWidth="0.8" />
          {[0,45,90,135,180,225,270,315].map((a,i) => (
            <line key={i} x1="74" y1="59"
              x2={74+Math.cos(a*Math.PI/180)*(9+progress*14)} y2={59+Math.sin(a*Math.PI/180)*(9+progress*14)}
              stroke={`${selected.pastel}${hex((0.1+progress*0.28)*(i%2?0.5:1))}`} strokeWidth="0.8" strokeLinecap="round" />
          ))}
        </svg>
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
      <div style={{ width:126,height:126,borderRadius:"50%",margin:"0 auto 26px",background:`radial-gradient(circle,${selected.color}44,${selected.color}11)`,boxShadow:`0 0 40px ${selected.color}88,0 0 80px ${selected.color}33`,animation:"doneGlow 2s ease-in-out infinite",display:"flex",alignItems:"center",justifyContent:"center",fontSize:50 }}>{selected.emoji}</div>
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

function PaymentModal({ pkg, onSuccess, onClose }) {
  const [step,     setStep]     = useState("form");
  const [cardNo,   setCardNo]   = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry,   setExpiry]   = useState("");
  const [cvv,      setCvv]      = useState("");
  const [giftCode, setGiftCode] = useState("");

  const fmt    = v => v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  const fmtExp = v => { const d=v.replace(/\D/g,"").slice(0,4); return d.length>2?d.slice(0,2)+"/"+d.slice(2):d; };
  const canPay = cardNo.replace(/\s/g,"").length===16 && cardName.length>=2 && expiry.length===5 && cvv.length===3;

  const handlePay = () => {
    setStep("loading");
    setTimeout(() => {
      const code = pkg.id==="hediye" ? "NİYET-"+Math.random().toString(36).toUpperCase().slice(2,8) : "";
      setGiftCode(code);
      setStep("success");
      onSuccess(pkg.id);
    }, 2200);
  };

  if (step==="loading") return (
    <div style={{ position:"fixed",inset:0,zIndex:200,background:"rgba(4,8,14,0.97)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:22 }}>
      <div style={{ width:56,height:56,borderRadius:"50%",border:"2px solid rgba(139,90,160,0.2)",borderTop:"2px solid #8b5aa0",animation:"spin 1s linear infinite" }} />
      <div style={{ fontSize:11,color:"#5a6a7a",letterSpacing:3 }}>İŞLEMDE</div>
    </div>
  );

  if (step==="success") return (
    <div style={{ position:"fixed",inset:0,zIndex:200,background:"rgba(4,8,14,0.97)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:20,textAlign:"center",padding:32 }}>
      <div style={{ fontSize:56 }}>✨</div>
      <div style={{ fontSize:22,fontWeight:300,letterSpacing:2 }}>Tamamlandı</div>
      <div style={{ color:"#7a8a9a",fontSize:14,lineHeight:1.8 }}><strong style={{color:"#e8e0d5"}}>{pkg.baslik}</strong><br/>aktif edildi.</div>
      {giftCode && (
        <div style={{ background:"rgba(139,90,160,0.12)",border:"1px solid rgba(139,90,160,0.28)",borderRadius:14,padding:"18px 28px",marginTop:8 }}>
          <div style={{ fontSize:9,letterSpacing:3,color:"#7a5a90",marginBottom:10 }}>HEDİYE KODUN</div>
          <div style={{ fontSize:22,letterSpacing:5,color:"#d4b8f0",fontWeight:300 }}>{giftCode}</div>
          <div style={{ fontSize:10,color:"#5a6a7a",marginTop:8,letterSpacing:1 }}>Bu kodu sevdiğin kişiye gönder</div>
        </div>
      )}
      <button className="sakin-btn-primary" style={{ marginTop:8 }} onClick={onClose}>Devam Et</button>
    </div>
  );

  return (
    <div style={{ position:"fixed",inset:0,zIndex:200,background:"rgba(4,8,14,0.97)",display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}>
      <div style={{ maxWidth:360,width:"100%",position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute",top:-10,right:-10,background:"transparent",border:"none",color:"#4a5a6a",fontSize:18,cursor:"pointer",lineHeight:1 }}>✕</button>
        <div style={{ textAlign:"center",marginBottom:28 }}>
          <div style={{ fontSize:36,marginBottom:10 }}>{pkg.emoji}</div>
          <div style={{ fontSize:18,fontWeight:300,letterSpacing:1,marginBottom:6 }}>{pkg.baslik}</div>
          <div style={{ fontSize:26,color:"#c8a96e",letterSpacing:2 }}>{pkg.fiyat}</div>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          <input className="sakin-input" placeholder="Kart Numarası" value={cardNo} onChange={e=>setCardNo(fmt(e.target.value))} style={{ letterSpacing:2,fontSize:15 }} />
          <input className="sakin-input" placeholder="Kart Üzerindeki İsim" value={cardName} onChange={e=>setCardName(e.target.value)} />
          <div style={{ display:"flex",gap:10 }}>
            <input className="sakin-input" placeholder="AA/YY" value={expiry} onChange={e=>setExpiry(fmtExp(e.target.value))} style={{ flex:1 }} />
            <input className="sakin-input" placeholder="CVV" value={cvv} onChange={e=>setCvv(e.target.value.replace(/\D/g,"").slice(0,3))} style={{ flex:1 }} />
          </div>
        </div>
        <div style={{ marginTop:8,fontSize:10,color:"#2a3a4a",letterSpacing:0.5,textAlign:"center" }}>🔒 SSL ile korunmaktadır</div>
        <button
          className="sakin-btn-primary"
          style={{ width:"100%",marginTop:18,opacity:canPay?1:0.4,cursor:canPay?"pointer":"default" }}
          onClick={canPay?handlePay:undefined}
        >
          {pkg.fiyat} ÖDE
        </button>
      </div>
    </div>
  );
}

function PremiumScreen({ onBack, onBuy, features }) {
  return (
    <div style={{ maxWidth:420,width:"100%",padding:"34px 22px 100px",position:"relative",zIndex:1 }}>
      <div style={{ textAlign:"center",marginBottom:32 }}>
        <div style={{ fontSize:9,letterSpacing:5,color:"#c8a96e",marginBottom:9 }}>✦ PREMİUM</div>
        <div style={{ fontSize:24,fontWeight:300,letterSpacing:2,marginBottom:8 }}>Daha Derine Git</div>
        <div style={{ fontSize:12,color:"#6a7a8a",lineHeight:1.7 }}>Uygulamanın tüm potansiyelini aç</div>
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
        {PACKAGES.map(pkg=>(
          <div key={pkg.id} style={{ border:`1px solid ${pkg.renk}44`,borderRadius:20,padding:"20px 20px",background:`rgba(${hexToRgb(pkg.renk)},0.05)`,position:"relative" }}>
            {features[pkg.id] && <span className="prem-tag" style={{ position:"absolute",top:14,right:16 }}>AKTİF</span>}
            <div style={{ display:"flex",alignItems:"flex-start",gap:14,marginBottom:12 }}>
              <div style={{ fontSize:30 }}>{pkg.emoji}</div>
              <div>
                <div style={{ fontSize:16,fontWeight:300,letterSpacing:1,marginBottom:3 }}>{pkg.baslik}</div>
                <div style={{ fontSize:20,color:"#c8a96e",letterSpacing:1 }}>{pkg.fiyat}</div>
                {pkg.fiyatYillik && <div style={{ fontSize:10,color:"#5a6a7a" }}>{pkg.fiyatYillik} (en uygun)</div>}
              </div>
            </div>
            <div style={{ fontSize:12,color:"#6a7a8a",lineHeight:1.7,marginBottom:12 }}>{pkg.aciklama}</div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:features[pkg.id]?0:14 }}>
              {pkg.ozellikler.map(o=>(
                <span key={o} style={{ fontSize:10,color:`${pkg.renk}dd`,background:`rgba(${hexToRgb(pkg.renk)},0.08)`,border:`1px solid ${pkg.renk}30`,borderRadius:100,padding:"3px 9px" }}>✓ {o}</span>
              ))}
            </div>
            {!features[pkg.id] && (
              <button className="sakin-btn-primary" style={{ width:"100%",fontSize:12,letterSpacing:2 }} onClick={()=>onBuy(pkg)}>Satın Al</button>
            )}
          </div>
        ))}
      </div>
      <button className="sakin-btn" style={{ width:"100%",marginTop:18 }} onClick={onBack}>← Geri</button>
    </div>
  );
}

function Program21Screen({ onBack }) {
  const [tasks, setTasks] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem("sakin_p21_tasks")||"{}"); }catch{ return {}; }
  });
  const [startDate] = useState(()=>{
    let d=localStorage.getItem("sakin_p21_start");
    if(!d){ d=new Date().toISOString(); localStorage.setItem("sakin_p21_start",d); }
    return d;
  });

  const dayNo = Math.min(21, Math.floor((Date.now()-new Date(startDate).getTime())/86400000)+1);
  const gun = PROGRAM_21[dayNo-1];
  const todayTasks = tasks[dayNo]||{};
  const allDone = gun.gorevler.every((_,i)=>todayTasks[i]);
  const completedDays = PROGRAM_21.filter((g,i)=>{
    const d=tasks[i+1]||{};
    return g.gorevler.every((_,j)=>d[j]);
  }).length;

  const toggleTask = i => {
    const updated = {...tasks,[dayNo]:{...todayTasks,[i]:!todayTasks[i]}};
    setTasks(updated);
    localStorage.setItem("sakin_p21_tasks",JSON.stringify(updated));
  };

  return (
    <div style={{ maxWidth:400,width:"100%",padding:"34px 22px 100px",position:"relative",zIndex:1 }}>
      <div style={{ textAlign:"center",marginBottom:24 }}>
        <div style={{ fontSize:9,letterSpacing:5,color:"#4a5a6a",marginBottom:9 }}>21 GÜNLÜK PROGRAM</div>
        <div style={{ background:"rgba(255,255,255,0.05)",borderRadius:100,height:5,overflow:"hidden",marginBottom:7 }}>
          <div style={{ width:`${(completedDays/21)*100}%`,height:"100%",background:"linear-gradient(90deg,#4ade80,#8b5aa0)",borderRadius:100,transition:"width 0.5s" }} />
        </div>
        <div style={{ fontSize:10,color:"#5a6a7a",letterSpacing:1 }}>{completedDays} / 21 gün tamamlandı</div>
      </div>
      <div style={{ border:`1px solid ${gun.renk}55`,borderRadius:22,padding:"22px 20px",background:`rgba(${hexToRgb(gun.renk)},0.05)`,marginBottom:18 }}>
        <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:20 }}>
          <div style={{ width:54,height:54,borderRadius:"50%",background:`radial-gradient(circle,${gun.renk}aa,${gun.pastel}44)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24 }}>{gun.emoji}</div>
          <div>
            <div style={{ fontSize:9,letterSpacing:4,color:"#4a5a6a" }}>GÜN {gun.gun}</div>
            <div style={{ fontSize:20,fontWeight:300,letterSpacing:2,color:gun.pastel }}>{gun.tema}</div>
          </div>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:13 }}>
          {gun.gorevler.map((gorev,i)=>(
            <div key={i} onClick={()=>toggleTask(i)} style={{ display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer",opacity:todayTasks[i]?0.45:1,transition:"opacity 0.3s" }}>
              <div style={{ width:22,height:22,borderRadius:"50%",flexShrink:0,marginTop:1,border:`1.5px solid ${todayTasks[i]?"#4ade80":"rgba(255,255,255,0.18)"}`,background:todayTasks[i]?"rgba(74,222,128,0.18)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,transition:"all 0.22s" }}>
                {todayTasks[i]&&"✓"}
              </div>
              <div style={{ fontSize:14,lineHeight:1.65,fontWeight:300,textDecoration:todayTasks[i]?"line-through":"none" }}>{gorev}</div>
            </div>
          ))}
        </div>
        {allDone && (
          <div style={{ marginTop:18,textAlign:"center",padding:"11px",background:"rgba(74,222,128,0.07)",border:"1px solid rgba(74,222,128,0.18)",borderRadius:11 }}>
            <div style={{ fontSize:12,color:"#4ade80",letterSpacing:1 }}>✓ Bugün tamamlandı</div>
          </div>
        )}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:20 }}>
        {PROGRAM_21.map((g,i)=>{
          const d=tasks[i+1]||{};
          const done=g.gorevler.every((_,j)=>d[j]);
          const isToday=i+1===dayNo;
          return (
            <div key={i} style={{ aspectRatio:"1",borderRadius:7,background:done?`rgba(${hexToRgb(g.renk)},0.45)`:isToday?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.03)",border:isToday?"1px solid rgba(255,255,255,0.28)":"1px solid rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:isToday?"#fff":"#4a5a6a" }}>
              {done?"✓":i+1}
            </div>
          );
        })}
      </div>
      <button className="sakin-btn" style={{ width:"100%" }} onClick={onBack}>← Geri</button>
    </div>
  );
}

function ReikiRehberiScreen({ onBack }) {
  const [tab,    setTab]    = useState("chakra");
  const [secili, setSecili] = useState(null);
  const [arama,  setArama]  = useState("");

  const filtreliHastaliklar = arama
    ? REIKI_HASTALIKLAR.filter(h=>h.ad.toLowerCase().includes(arama.toLowerCase()))
    : REIKI_HASTALIKLAR;

  return (
    <div style={{ maxWidth:420,width:"100%",padding:"34px 20px 100px",position:"relative",zIndex:1 }}>
      <div style={{ textAlign:"center",marginBottom:22 }}>
        <div style={{ fontSize:9,letterSpacing:5,color:"#c8a96e",marginBottom:8 }}>✦ REİKİ REHBERİ</div>
        <div style={{ fontSize:22,fontWeight:300,letterSpacing:2 }}>Enerji & Şifa</div>
      </div>
      <div style={{ display:"flex",gap:0,marginBottom:22,background:"rgba(255,255,255,0.04)",borderRadius:100,padding:4 }}>
        {[["chakra","💜 Çakra & Duygular"],["hastalik","🌿 Hastalık Rehberi"]].map(([id,label])=>(
          <button key={id} onClick={()=>{setTab(id);setSecili(null);setArama("");}}
            style={{ flex:1,padding:"9px 6px",borderRadius:100,border:"none",cursor:"pointer",fontSize:11,letterSpacing:0.8,fontFamily:"'Cormorant Garamond',Georgia,serif",transition:"all 0.25s",background:tab===id?"rgba(139,90,160,0.45)":"transparent",color:tab===id?"#e8e0d5":"#5a6a7a" }}>
            {label}
          </button>
        ))}
      </div>

      {tab==="chakra" && (
        <div style={{ display:"flex",flexDirection:"column",gap:9 }}>
          {REIKI_CHAKRALAR.map((c,i)=>(
            <div key={i} onClick={()=>setSecili(secili===i?null:i)}
              style={{ border:`1px solid ${c.renk}44`,borderRadius:16,padding:"15px 17px",background:`rgba(${hexToRgb(c.renk)},0.05)`,cursor:"pointer" }}>
              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                <div style={{ width:40,height:40,borderRadius:"50%",background:`radial-gradient(circle,${c.renk}99,${c.pastel}33)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0 }}>{c.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15,fontWeight:300,letterSpacing:1,color:c.pastel }}>{c.isim} Çakrası</div>
                  <div style={{ fontSize:10,color:"#4a5a6a",letterSpacing:0.8,marginTop:2 }}>{c.duygular.slice(0,3).join(" · ")}</div>
                </div>
                <div style={{ fontSize:10,color:"#3a4a5a" }}>{secili===i?"▲":"▼"}</div>
              </div>
              {secili===i && (
                <div style={{ marginTop:13,paddingTop:13,borderTop:`1px solid ${c.renk}22` }}>
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:9,letterSpacing:2.5,color:"#4a5a6a",marginBottom:6 }}>DUYGULAR & KONULAR</div>
                    <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
                      {c.duygular.map(d=>(
                        <span key={d} style={{ fontSize:11,color:c.pastel,background:`rgba(${hexToRgb(c.renk)},0.1)`,border:`1px solid ${c.renk}30`,borderRadius:100,padding:"3px 9px" }}>{d}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:9,letterSpacing:2.5,color:"#4a5a6a",marginBottom:5 }}>BEDEN / ORGANLAR</div>
                    <div style={{ fontSize:12,color:"#7a8a9a",lineHeight:1.7 }}>{c.beden.join(", ")}</div>
                  </div>
                  <div style={{ marginBottom:8 }}>
                    <div style={{ fontSize:9,letterSpacing:2.5,color:"#4a5a6a",marginBottom:6 }}>BLOKE OLUNCA</div>
                    <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
                      {c.dengesiz.map(d=>(
                        <span key={d} style={{ fontSize:11,color:"#f1948a",background:"rgba(241,148,138,0.08)",border:"1px solid rgba(241,148,138,0.2)",borderRadius:100,padding:"3px 9px" }}>{d}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize:12,fontStyle:"italic",color:"#6a7a8a",marginTop:10,lineHeight:1.6 }}>✦ {c.anahtar}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab==="hastalik" && (
        <div>
          <input className="sakin-input" placeholder="Hastalık ara..." value={arama} onChange={e=>setArama(e.target.value)} style={{ marginBottom:13 }} />
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {filtreliHastaliklar.map((h,i)=>(
              <div key={i} onClick={()=>setSecili(secili===`h${i}`?null:`h${i}`)}
                style={{ border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"13px 16px",background:"rgba(255,255,255,0.02)",cursor:"pointer" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <span style={{ fontSize:20 }}>{h.emoji}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14,fontWeight:300 }}>{h.ad}</div>
                    <div style={{ fontSize:10,color:"#4a5a6a",letterSpacing:0.5,marginTop:2 }}>{h.cakralar.join(" · ")}</div>
                  </div>
                  <div style={{ fontSize:10,color:"#3a4a5a" }}>{secili===`h${i}`?"▲":"▼"}</div>
                </div>
                {secili===`h${i}` && (
                  <div style={{ marginTop:11,paddingTop:11,borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ marginBottom:8 }}>
                      <div style={{ fontSize:9,letterSpacing:2.5,color:"#4a5a6a",marginBottom:6 }}>ÇALIŞILACAK ÇAKRALAR</div>
                      <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
                        {h.cakralar.map(c=>{
                          const chakra=REIKI_CHAKRALAR.find(r=>r.isim===c.split(" ")[0]);
                          return <span key={c} style={{ fontSize:11,background:"rgba(139,90,160,0.12)",border:"1px solid rgba(139,90,160,0.28)",borderRadius:100,padding:"3px 9px",color:"#c3a6d8" }}>{chakra?.emoji||"✦"} {c}</span>;
                        })}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize:9,letterSpacing:2.5,color:"#4a5a6a",marginBottom:5 }}>ZİHİNSEL / DUYGUSAL NEDEN</div>
                      <div style={{ fontSize:13,color:"#a0a8b0",lineHeight:1.7,fontStyle:"italic" }}>"{h.zihinsel}"</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="sakin-btn" style={{ width:"100%",marginTop:20 }} onClick={onBack}>← Geri</button>
    </div>
  );
}

export default function SakinApp() {
  const [screen,        setScreen]        = useState("giris");
  const [niyet,         setNiyet]         = useState("");
  const [selectedWords, setSelectedWords] = useState([]);
  const [breathPhase,   setBreathPhase]   = useState("inhale");
  const [breathCount,   setBreathCount]   = useState(0);
  const [chakra]                          = useState(CHAKRAS_7[Math.floor(Math.random()*7)]);
  const [aksamNote,     setAksamNote]     = useState("");
  const [sukur,         setSukur]         = useState("");
  const [time,          setTime]          = useState(new Date());
  const [orb,           setOrb]           = useState({x:50,y:50});
  const breathRef = useRef(null);
  const [premiumFeatures, setPremiumFeatures] = useState(()=>{ try{ return JSON.parse(localStorage.getItem("sakin_premium")||"{}"); }catch{ return {}; } });
  const [payModal, setPayModal] = useState(null);
  const handlePremiumSuccess = pkgId => {
    const updated = {...premiumFeatures,[pkgId]:true};
    setPremiumFeatures(updated);
    localStorage.setItem("sakin_premium",JSON.stringify(updated));
    setPayModal(null);
  };

  useEffect(() => { const t=setInterval(()=>setTime(new Date()),1000); return()=>clearInterval(t); },[]);

  useEffect(() => {
    if (screen!=="nefes") return;
    const cycle = () => {
      setBreathPhase("inhale");
      setTimeout(()=>setBreathPhase("hold"),4000);
      setTimeout(()=>setBreathPhase("exhale"),5500);
      setTimeout(()=>setBreathCount(c=>c+1),9500);
    };
    cycle();
    breathRef.current=setInterval(cycle,10000);
    return()=>clearInterval(breathRef.current);
  },[screen]);

  const hour   = time.getHours();
  const dayPct = ((hour*60+time.getMinutes())/1440)*100;
  const toggleWord = w => setSelectedWords(prev => prev.includes(w)?prev.filter(x=>x!==w):prev.length<3?[...prev,w]:prev);
  const breathLabel = {inhale:"içine al",hold:"tut",exhale:"bırak"}[breathPhase];
  const breathScale = breathPhase==="exhale" ? 1 : 1.6;
  const handleMouseMove = e => { const r=e.currentTarget.getBoundingClientRect(); setOrb({x:((e.clientX-r.left)/r.width)*100,y:((e.clientY-r.top)/r.height)*100}); };

  const ambientColor = {
    giris:"139,90,160",sabah:"220,130,50",nefes:"80,130,200",
    chakra:`${parseInt(chakra.color.slice(1,3),16)},${parseInt(chakra.color.slice(3,5),16)},${parseInt(chakra.color.slice(5,7),16)}`,
    gun:"120,90,180",terapi:"74,160,100",aksam:"60,70,140",harita:"100,80,180",premium:"139,90,160",program21:"45,120,65",rehber:"142,68,173",
  }[screen]||"139,90,160";

  const NAV = [
    {id:"sabah",icon:"🌅",label:"Sabah"},
    {id:"nefes",icon:"🫧",label:"Nefes"},
    {id:"chakra",icon:"💜",label:"Çakra"},
    {id:"gun",icon:"☀️",label:"Gün"},
    {id:"aksam",icon:"🌙",label:"Akşam"},
    {id:"harita",icon:"◎",label:"Harita"},
  ];

  return (
    <div onMouseMove={handleMouseMove} style={{ minHeight:"100vh",background:"#04080e",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cormorant Garamond',Georgia,serif",color:"#e8e0d5",overflow:"hidden",position:"relative" }}>
      <style>{GLOBAL_CSS}</style>

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
            <div style={{ width:76,height:76,borderRadius:"50%",margin:"0 auto 26px",background:"radial-gradient(circle,rgba(139,90,160,0.48),rgba(72,130,180,0.16))",border:"1px solid rgba(139,90,160,0.26)",animation:"glow 3.5s ease-in-out infinite",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28 }}>🌿</div>
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
            <div style={{ width:108,height:108,borderRadius:"50%",margin:"0 auto",background:"radial-gradient(circle,rgba(255,155,55,0.52) 0%,rgba(255,95,35,0.16) 55%,transparent 70%)",animation:"glow 4s ease-in-out infinite",display:"flex",alignItems:"center",justifyContent:"center",fontSize:42 }}>🌅</div>
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
          <div style={{ display:"flex",gap:10 }}>
            <button className="sakin-btn" style={{ flex:1 }} onClick={()=>setScreen("nefes")}>nefes al</button>
            <button className="sakin-btn-primary" style={{ flex:1 }} onClick={()=>setScreen("chakra")}>İLERLE</button>
          </div>
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
          <div style={{ fontSize:10,color:"#4a5a6a",letterSpacing:2,marginBottom:40 }}>{breathCount} nefes</div>
          <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
            <button className="sakin-btn" onClick={()=>setScreen("sabah")}>← geri</button>
            <button className="sakin-btn-primary" onClick={()=>setScreen("chakra")}>devam →</button>
          </div>
        </div>
      )}

      {/* ÇAKRA */}
      {screen==="chakra" && (
        <div style={{ textAlign:"center",padding:"34px 30px 100px",position:"relative",zIndex:1,maxWidth:360 }}>
          <div style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none",background:`radial-gradient(ellipse at 50% 42%,${chakra.pastel}1a 0%,transparent 58%)` }} />
          <div style={{ position:"relative",zIndex:1 }}>
            <div style={{ fontSize:9,letterSpacing:5,color:"#4a5a6a",marginBottom:32 }}>REİKİ · GÜNÜN ÇAKRASI</div>
            <div style={{ width:146,height:146,borderRadius:"50%",margin:"0 auto 32px",background:`radial-gradient(circle,${chakra.color}cc,${chakra.pastel}44)`,boxShadow:`0 0 52px ${chakra.color}55,0 0 105px ${chakra.color}22`,animation:"glow 3s ease-in-out infinite",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:6 }}>
              <div style={{ fontSize:40,lineHeight:1 }}>{chakra.emoji}</div>
              <div style={{ fontSize:9,letterSpacing:3,color:"rgba(255,255,255,0.62)" }}>{chakra.element}</div>
            </div>
            <div style={{ fontSize:11,letterSpacing:4,color:chakra.pastel,marginBottom:14 }}>{chakra.name.toUpperCase()} ÇAKRASI</div>
            <div style={{ fontSize:20,fontWeight:300,lineHeight:1.75,marginBottom:10,wordBreak:"break-word" }}>{chakra.desc}</div>
            <div style={{ fontSize:10,color:"#4a5a6a",marginBottom:28,letterSpacing:1 }}>Bugün bu merkezde kal.</div>
            <button className="sakin-btn" style={{ fontSize:10,letterSpacing:2,marginBottom:28 }} onClick={()=>setScreen("terapi")}>✦ 22 Çakra Terapi →</button>
            <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
              <button className="sakin-btn" onClick={()=>setScreen("nefes")}>← geri</button>
              <button className="sakin-btn-primary" onClick={()=>setScreen("gun")}>gün hatırlatıcıları →</button>
            </div>
          </div>
        </div>
      )}

      {screen==="terapi" && <TerapiScreen onBack={()=>setScreen("chakra")} />}
      {screen==="gun"    && <ReminderScreen onBack={()=>setScreen("chakra")} />}

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
          {premiumFeatures.program21 && (
            <button className="sakin-btn" style={{ width:"100%",marginBottom:10,fontSize:11,letterSpacing:2 }} onClick={()=>setScreen("program21")}>🌱 21 Günlük Programım →</button>
          )}
          {premiumFeatures.rehber && (
            <button className="sakin-btn" style={{ width:"100%",marginBottom:10,fontSize:11,letterSpacing:2 }} onClick={()=>setScreen("rehber")}>🔮 Reiki Rehberi →</button>
          )}
          {premiumFeatures.raporlama && (
            <div style={{ border:"1px solid rgba(200,169,110,0.2)",borderRadius:17,padding:"16px 18px",marginBottom:16,background:"rgba(200,169,110,0.03)" }}>
              <div style={{ fontSize:9,letterSpacing:3,color:"#c8a96e",marginBottom:12 }}>✦ DETAYLI RAPOR</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:9 }}>
                {[
                  {label:"Haftalık Nefes",value:`${breathCount * 7}`,color:"#82d9a3"},
                  {label:"Aktif Günler",value:"7 / 7",color:"#85c1e9"},
                  {label:"En Güçlü Çakra",value:chakra.name,color:chakra.pastel},
                  {label:"Toplam Niyet",value:"21+",color:"#f0c27f"},
                ].map((s,i)=>(
                  <div key={i} style={{ background:"rgba(255,255,255,0.022)",border:"1px solid rgba(255,255,255,0.055)",borderRadius:13,padding:"11px 13px" }}>
                    <div style={{ fontSize:8,letterSpacing:2,color:"#4a5a6a",marginBottom:5 }}>{s.label.toUpperCase()}</div>
                    <div style={{ fontSize:14,color:s.color,fontWeight:300 }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!premiumFeatures.raporlama && !premiumFeatures.program21 && (
            <div style={{ border:"1px solid rgba(200,169,110,0.2)",borderRadius:17,padding:"16px 20px",marginBottom:16,textAlign:"center",background:"rgba(200,169,110,0.03)" }}>
              <div style={{ fontSize:9,letterSpacing:3,color:"#c8a96e",marginBottom:7 }}>✦ PREMİUM</div>
              <div style={{ fontSize:12,color:"#6a7a8a",marginBottom:12,lineHeight:1.7 }}>Sınırsız raporlama, 21 günlük program ve hediye kartı.</div>
              <button className="sakin-btn" style={{ fontSize:10,letterSpacing:2,color:"#c8a96e",borderColor:"rgba(200,169,110,0.3)" }} onClick={()=>setScreen("premium")}>Keşfet →</button>
            </div>
          )}
          <button className="sakin-btn" style={{ width:"100%" }} onClick={()=>setScreen("giris")}>yeni güne başla</button>
        </div>
      )}

      {/* BOTTOM NAV */}
      {screen==="premium" && (
        <PremiumScreen
          onBack={()=>setScreen("harita")}
          onBuy={pkg=>setPayModal(pkg)}
          features={premiumFeatures}
        />
      )}
      {screen==="program21" && premiumFeatures.program21 && (
        <Program21Screen onBack={()=>setScreen("premium")} />
      )}
      {screen==="rehber" && premiumFeatures.rehber && (
        <ReikiRehberiScreen onBack={()=>setScreen("premium")} />
      )}

      {payModal && (
        <PaymentModal
          pkg={payModal}
          onSuccess={handlePremiumSuccess}
          onClose={()=>setPayModal(null)}
        />
      )}

      {!["giris","terapi","gun","premium","program21","rehber"].includes(screen) && (
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
