import { useState, useEffect, useRef, memo } from "react";
import { createPortal } from "react-dom";
import { makeTrans, LANGUAGES } from "./i18n";
import { CHAKRA_TRANS, FREQ_TRANS, ASTRO_TRANS, NOTIF_TRANS } from "./i18n-data";
import { getGlossary } from "./glossary";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { StatusBar, Style } from "@capacitor/status-bar";
import { initStore, purchaseYearly, purchaseLifetime, restorePurchases, onPurchaseUpdate, onProductsLoaded, areProductsLoaded, getProductInfo, LIFETIME_PRODUCT_ID } from "./purchases";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Share } from "@capacitor/share";
import { App as CapacitorApp } from "@capacitor/app";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import { Filesystem, Directory } from "@capacitor/filesystem";
// Büyük dünya şehri veritabanı — dinamik import() ile yalnızca SmartCityInput
// kullanıldığında ayrı bir chunk olarak yüklenir. Ana bundle'ı şişirmez.
// Veri kaynağı: GeoNames (CC BY 4.0). Bkz. scripts/build-cities.mjs.
import { ensureCitiesLoaded, lookupCityBig, findCityMatches, isCitiesLoaded } from "./cityDb";
import { showNowPlaying, clearNowPlaying, onRemoteCommand } from "./nowplaying";

const isNative = Capacitor.isNativePlatform();

// ── GÜN ANAHTARI (YEREL TARİH) ──────────────────────────────────────────────
// KÖK SEBEP (kullanıcı: "tünel sıfırlandı ama nefes 11'den devam etti"):
// Tüm günlük anahtarlar `sakinDayKey()` ile üretiliyordu.
// toISOString() **UTC** verir. Türkiye UTC+3 olduğu için uygulamanın "günü"
// gece yarısında değil **saat 03:00'te** dönüyordu. Gece 00:00–03:00 arasında
// yapılan her şey bir ÖNCEKİ güne yazılıyor, 03:00'te de kullanıcı hiçbir şey
// yapmadan gün değişip bağlantı sıfırlanıyordu.
// Çözüm: gün anahtarı artık YEREL tarihten üretilir (gece yarısı = gün dönümü).
function sakinDayKey(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// TEK SEFERLİK TAŞIMA: UTC anahtarından yerel anahtara. Güncellemenin geldiği an
// kullanıcı gece 00:00–03:00 aralığındaysa o günün verisi UTC anahtarında (dünün
// tarihinde) duruyor olabilir; yerel anahtar boşsa oradan kopyalanır ki kullanıcı
// o akşamki ilerlemesini kaybetmesin. Yalnızca bir kez çalışır.
if (typeof localStorage !== "undefined") {
  try {
    if (!localStorage.getItem("sakin_daykey_local_v1")) {
      const utcKey = new Date().toISOString().slice(0, 10);
      const locKey = sakinDayKey();
      if (utcKey !== locKey) {
        for (const pre of ["sakin_niyet_", "sakin_words_", "sakin_breath_", "sakin_freq_sec_",
                           "sakin_aksamnote_", "sakin_sukur_", "sakin_ritual_", "sakin_steps_",
                           "sakin_terapi_sec_", "sakin_reminders_done_"]) {
          const from = localStorage.getItem(pre + utcKey);
          if (from !== null && localStorage.getItem(pre + locKey) === null) {
            localStorage.setItem(pre + locKey, from);
          }
        }
      }
      localStorage.setItem("sakin_daykey_local_v1", "1");
    }
  } catch (_) {}
}

// Platform'u kök öğeye yaz (ios / android / web) → platforma özel CSS izole
// edilebilir. Android'e özel düzeltmeler (edge-to-edge safe-area) yalnızca
// data-platform="android" altında geçerli; iOS ve web bundan HİÇ etkilenmez.
if (typeof document !== "undefined") {
  try { document.documentElement.setAttribute("data-platform", Capacitor.getPlatform()); } catch (_) {}
}

// ── ZOOM TAMAMEN KAPALI ─────────────────────────────────────────────────────
// viewport maximum-scale tek başına yetmedi (iOS 1.3.0'da hâlâ zoom'a takılıp
// geri dönemiyordu). Üç zoom kaynağının üçünü de kökten kes:
//  1) pinch  → WebKit'in gesturestart/change/end olayları iptal
//  2) double-tap → dblclick iptal + CSS touch-action: manipulation
//  3) input odak zoom'u → 16px altı font'lu input kalmasın (CSS, embed'lere de inject)
// Kayıtlar document seviyesinde ve pasif değil — WKWebView bunlara saygı duyar.
function installZoomGuard(doc) {
  try {
    const stop = (ev) => { try { ev.preventDefault(); } catch (_) {} };
    ["gesturestart", "gesturechange", "gestureend"].forEach((n) =>
      doc.addEventListener(n, stop, { passive: false }));
    doc.addEventListener("dblclick", stop, { passive: false });
  } catch (_) {}
}
if (typeof document !== "undefined") installZoomGuard(document);

// ZOOM SIFIRLAYICI — asıl suçlu bulundu: iOS paylaşım menüsü (share sheet)
// kapanınca WKWebView sayfayı büyütülmüş scale'de bırakabiliyor ve kullanıcı
// geri döndüremiyor. Viewport meta'yı farklı bir içerikle yazıp geri koymak
// WebKit'i scale'i 1'e çekmeye zorlar (bilinen güvenilir reset tekniği).
// `doc` parametresi: hem host'un kendi document'ı hem bir embed iframe'inin
// contentDocument'ı için kullanılabilsin diye genelleştirildi (bkz. aşağı).
function resetViewportZoom(doc) {
  doc = doc || (typeof document !== "undefined" ? document : null);
  if (!doc) return;
  try {
    const vp = doc.querySelector('meta[name="viewport"]');
    if (!vp) return;
    const orig = vp.getAttribute("content") || "width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover, user-scalable=no";
    // Değişiklik algılansın diye minimum-scale eklenmiş farklı bir string yaz…
    vp.setAttribute("content", "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, viewport-fit=cover, user-scalable=no");
    // …sonra orijinale dön (görsel yan etki yok; scale 1'e oturur).
    setTimeout(() => { try { vp.setAttribute("content", orig); } catch (_) {} }, 120);
  } catch (_) {}
}
// Watchdog: sayfa HERHANGİ bir sebeple 1'in üstüne zoom'lanırsa (share sheet,
// odak zoom'u, sistem tuhaflığı) kendiliğinden geri çek. `win`/`doc` verilmezse
// host'un kendi window/document'ı kullanılır — embed iframe'leri için de
// çağrılabilir (bkz. onLoad injection'ları), çünkü paylaşım kartları embed'lerin
// KENDİ iframe'i içinde navigator.share() çağırıyor — host'un watchdog'u oraya
// erişemez, her iframe kendi watchdog'unu almalı. Uygulamada meşru zoom
// senaryosu yok — scale her zaman 1 olmalı.
function installZoomResetWatchdog(win, doc) {
  win = win || (typeof window !== "undefined" ? window : null);
  doc = doc || (typeof document !== "undefined" ? document : null);
  if (!win || !win.visualViewport) return;
  try {
    let timer = null;
    win.visualViewport.addEventListener("resize", () => {
      try {
        if (win.visualViewport.scale > 1.02) {
          clearTimeout(timer);
          timer = setTimeout(() => resetViewportZoom(doc), 250);
        }
      } catch (_) {}
    });
  } catch (_) {}
}
installZoomResetWatchdog();

// Üretilen kart görselini paylaş/indir — platforma göre en güvenilir yol.
// ANDROID: WebView `navigator.share(files)` ve blob `<a download>` çalışmaz →
// Capacitor Filesystem'e yazıp Share eklentisiyle paylaşırız. iOS + web: mevcut
// çalışan yol (WKWebView/tarayıcı navigator.share; olmazsa indir). iOS'a dokunmuyoruz.
async function shareImageBlob(blob, filename) {
  try {
    const isAndroid = (() => { try { return Capacitor.getPlatform() === "android"; } catch (_) { return false; } })();
    if (isAndroid) {
      try {
        const base64 = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onloadend = () => resolve(String(r.result).split(",")[1] || "");
          r.onerror = reject;
          r.readAsDataURL(blob);
        });
        await Filesystem.writeFile({ path: filename, data: base64, directory: Directory.Cache });
        const { uri } = await Filesystem.getUri({ path: filename, directory: Directory.Cache });
        await Share.share({ url: uri });
        return;
      } catch (_) { /* eklenti başarısızsa aşağıdaki web yoluna düş */ }
    }
    // iOS + web: dosya paylaşımı (WKWebView destekler); olmazsa indir.
    try {
      const file = new File([blob], filename, { type: blob.type || "image/jpeg" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] });
        return;
      }
    } catch (e) {
      // Kullanıcı paylaşım sayfasını "Vazgeç" ile kapattıysa (AbortError) HİÇBİR ŞEY
      // yapma — aşağıdaki indirme fallback'ine düşmek yanlış: kullanıcı açıkça "hayır"
      // demişken sessizce blob: URL indirme denemesi (<a download> click) tetiklemek,
      // WKWebView'de paylaşım sayfası kapanışının hemen ardından İKİNCİ bir native
      // geçiş/navigasyon denemesi demek — "paylaştan dönünce zoom takılması" hatasının
      // muhtemel bir bileşeniydi.
      if (e && e.name === "AbortError") return;
    }
    // navigator.share GERÇEKTEN başarısız oldu (iptal değil). Native'de (iOS dahil)
    // <a download> blob: URL denemesi yerine Capacitor Filesystem+Share kullan —
    // WKWebView'de blob: navigasyonu WKDownloadDelegate'siz UIApplication.open()
    // + iptal döngüsüne giriyor (araştırmayla doğrulandı), bu da paylaşım sayfası
    // kapanışıyla aynı ana denk gelen ikinci bir native geçiş = zoom riski.
    if (isNative) {
      try {
        const base64 = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onloadend = () => resolve(String(r.result).split(",")[1] || "");
          r.onerror = reject;
          r.readAsDataURL(blob);
        });
        await Filesystem.writeFile({ path: filename, data: base64, directory: Directory.Cache });
        const { uri } = await Filesystem.getUri({ path: filename, directory: Directory.Cache });
        await Share.share({ url: uri });
        return;
      } catch (_) { /* eklenti de başarısızsa sessizce vazgeç — DOM blob indirmesine düşme */ }
      return;
    }
    // Yalnızca gerçek web (native değil): DOM blob indirme fallback'i güvenli.
    try {
      const dl = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = dl; a.download = filename; a.click();
      setTimeout(() => URL.revokeObjectURL(dl), 3000);
    } catch (_) {}
  } finally {
    // Share sheet kapanınca WKWebView zoom'lu kalabiliyor — her paylaşım
    // sonunda scale'i garantiye al (menü kapanma animasyonu bitince).
    setTimeout(resetViewportZoom, 600);
    setTimeout(resetViewportZoom, 1600); // geç kapanan sheet için ikinci tur
  }
}

// Sesli talimat (nefes fazları, "Connected" vb.) — platforma göre en güvenilir yol.
// ANDROID: WebView'ın Web Speech Synthesis API desteği güvenilmez (çoğu cihazda
// speechSynthesis.speak() sessizce hiçbir şey yapmaz, getVoices() boş döner) →
// native TextToSpeech eklentisi kullanılır. iOS + web: mevcut çalışan
// speechSynthesis yolu AYNEN korunur (kullanıcı bunun çalıştığını doğruladı).
function speakText(text, { lang = "en-US", rate = 1, pitch = 1, volume = 1 } = {}) {
  if (!text) return;
  try {
    if (isNative && Capacitor.getPlatform() === "android") {
      TextToSpeech.stop().catch(() => {});
      TextToSpeech.speak({ text, lang, rate, pitch, volume, category: "ambient" }).catch(() => {});
      return;
    }
  } catch (_) {}
  try {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang; utt.rate = rate; utt.pitch = pitch; utt.volume = volume;
    window.speechSynthesis.speak(utt);
  } catch (_) {}
}
function cancelSpeech() {
  try {
    if (isNative && Capacitor.getPlatform() === "android") { TextToSpeech.stop().catch(() => {}); return; }
  } catch (_) {}
  try { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); } catch (_) {}
}

// ── Audio context kayıt defteri ───────────────────────────────────────────────
// iOS Safari uygulama bir süre arka planda kalınca TÜM AudioContext'leri
// "suspended"/"interrupted" yapar; geri dönüşte hepsini resume etmezsek geçiş
// efektleri ve frekans tonları susar. Oluşturulan her context'i burada toplayıp
// görünürlük/gesture'da topluca resume ederiz. __makeAudioCtx fonksiyon-bildirimi
// olduğu için hoist edilir (aşağıdaki tüm kullanımlardan önce hazır).
const __sakinAudioCtxs = new Set();
function __makeAudioCtx() {
  const Ctor = window.AudioContext || window.webkitAudioContext;
  const c = new Ctor();
  try { __sakinAudioCtxs.add(c); } catch (_) {}
  return c;
}
function __resumeAllAudio() {
  __sakinAudioCtxs.forEach((c) => {
    try { if (c && c.state === "suspended") c.resume(); } catch (_) {}
  });
}
// NATIVE KÖPRÜ: iOS tarafı (SakinViewController) kullanıcı SES TUŞUNA bastığında
// bunu çağırır (kullanıcı: "ses kapalıysa ses yükseltme tuşuna basınca da ses
// açılsın; el refleks olarak ses tuşuna gidiyor"). AVAudioSession kesintiye
// uğradığında (başka uygulama ses çaldı, sessiz anahtarı, çağrı) AudioContext
// "suspended"/"interrupted" kalıp ses çıkmıyordu; ses tuşu artık onu diriltir.
try { if (typeof window !== "undefined") window.__sakinResumeAudio = __resumeAllAudio; } catch (_) {}

// Bu sabit her App Store release'inde elle bumplanır (build script gerek YOK).
// Server'daki latest-ios-version.json bundan büyük ise app içinde güncelleme banner'ı çıkar.
//
// ⚠️ public/latest-ios-version.json BU SABİTLE BİRLİKTE BUMPLANMAZ. O dosya
// "App Store'da CANLI olan sürüm"ü bildirir. İkisi aynı anda yükseltilirse,
// mağazada henüz olmayan bir sürüm için TÜM kullanıcılara sahte güncelleme
// bildirimi gider (1.3.4'te bu hata yaşandı). Doğru sıra:
//   1) burada + pbxproj + build.gradle bump  → gönder
//   2) App Store'da YAYINLANDIKTAN SONRA     → latest-ios-version.json bump
const APP_VERSION = "1.3.4";
const APP_STORE_URL = "https://apps.apple.com/app/id6765619382";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.sakin.app";
// Uygulama içi güncelleme banner'ı iOS + Android'in İKİSİNDE de tetiklenir
// (isNative = Capacitor.isNativePlatform(), ikisinde de true). Sabit
// APP_STORE_URL kullanmak Android kullanıcısını Apple'a gönderirdi — platforma
// göre doğru mağazayı seç.
const STORE_URL = (() => { try { return Capacitor.getPlatform() === "android" ? PLAY_STORE_URL : APP_STORE_URL; } catch (_) { return APP_STORE_URL; } })();

// AI system prompt'larındaki dil kuralı — seçili dile göre. Hardcoded "YALNIZCA
// Türkçe yaz" talimatı EN/DE/... seçiliyken bile modeli Türkçe yazmaya zorluyordu
// (backend dil kilidini eziyordu). Bu helper dili dinamik yapar.
const AI_LANG_NAMES = { en:"English", tr:"Turkish", de:"German (Deutsch)", es:"Spanish (Español)", pt:"Brazilian Portuguese (Português)", fr:"French (Français)", ja:"Japanese (日本語)" };
// AI prompt'ları dile göre TAMAMEN ayrı. Daha önce Türkçe gövde + sadece tek satır
// "respond in English" emri vardı — model gövdedeki Türkçe + Türkçe alıntı cümleleri
// kopyalayıp Türkçe cevap veriyordu. Çözüm: lang === "tr" değilse, prompt'u tamamen
// İngilizce yaz (çıktı dilini hedef dile yönlendiren ultra-net emirle).
// onsoz=false → "Bu yanıt sana özeldir…" cümlesini ekleme talimatı ÇIKARILIR.
// Görev akışı bunu kullanır: görev bir sohbet yanıtı değil, tek bir deneyimdir;
// o önsöz kartın başında gereksiz yer kaplıyordu (kullanıcı: "çıkart, gerek yok").
function buildMirrorSystemPrompt(lang, onsoz = true) {
  if (lang === "tr") {
    return `Sen derin bir ayna ve enerji rehberisin. YALNIZCA Türkçe yaz; ş, ğ, ı, ü, ö, ç, Ş, Ğ, İ, Ü, Ö, Ç gibi Türkçe karakterleri eksiksiz ve doğru kullan. Arapça, Japonca, Çince veya başka alfabe kullanma. YABANCI KELİME YASAK: İngilizce dahil hiçbir yabancı dilden tek kelime bile kullanma — sadece Türkçe sözcükler. "Sen" diye hitap et. Asla tıbbi tavsiye verme, teşhis koyma, tedavi önerme. Yanıtının sonuna mutlaka şunu ekle: "Bu içerik bilgilendirme amaçlıdır, tıbbi tavsiye değildir. Sağlık sorunlarında bir uzmana danışın."
Dil tonu: Kendinden emin, net, şiirsel ve şefkatli. Bilgiyi doğrudan ver. Şu kalıpları kesinlikle kullanma: "olası ki", "olabilir", "belki", "belki de", "acaba", "düşünülebilir", "söylenebilir", "diyebiliriz", "ihtimal", "muhtemelen". Cümleler kararlı ve içten olsun.
ÖZGÜNLÜK (çok önemli): Her yanıt biricik olsun. Kalıp cümlelerden, klişelerden, hazır açılışlardan KAÇIN — "Sevgili ruh", "Değerli yolcu" gibi şablon hitaplar kullanma. Kişinin SOMUT verisine (gerçek sorusu, kelimeleri, doğum bilgisi, o anki durumu) doğrudan atıf yap; genel-geçer, herkese uyan laflar etme. Açılışı, yapıyı, ritmi ve imgeleri her seferinde değiştir; aynı cümleleri asla tekrarlama. Bu kişiye ve bu ana özel yaz.
Kişinin sorusunun kaynağına nokta atışı işaret et. Nereye bakabileceğini ve kendine nasıl sevgi sunabileceğini hatırlat.
${onsoz ? `Yanıtının en başına şu cümleyi ekle: "Bu yanıt sana özeldir. Düşünce dünyanda sana destek olan bir yardımcıdır. Kalbinin süzgecinden geçir, seni ısıtan kısmını al."` : ""}`;
  }
  const name = AI_LANG_NAMES[lang] || "English";
  return `You are a deep mirror and energy guide. CRITICAL LANGUAGE RULE: WRITE YOUR ENTIRE RESPONSE ONLY IN ${name}. Every single sentence — including disclaimers, opening lines, and any quoted phrases — MUST be in ${name}. Do NOT write a single word in Turkish. This overrides any Turkish text that appears in this prompt or in the user's question. Use ONLY ${name} words and letters; insert no words from English or any other language. Address the reader using the equivalent of informal "you" in ${name}. Never give medical advice, never diagnose, never prescribe treatment. At the very END of your response, add this exact sentence translated naturally into ${name}: "This content is for informational purposes only, not medical advice. Consult a professional for health issues."
Tone: confident, clear, poetic, compassionate. Deliver insight directly. Avoid hedging language ("maybe", "possibly", "perhaps", "it could be that", "one might say"). Sentences should be firm and warm.
ORIGINALITY (very important): Make every response one of a kind. Avoid stock phrases, clichés, and canned openings — never use template salutations like "Dear soul" or "Beloved traveler". Refer directly to the person's SPECIFIC data (their actual question, their words, birth details, current situation); do not speak in generic, one-size-fits-all terms. Vary your opening, structure, rhythm and imagery every time; never repeat the same sentences. Write for this person, this moment.
Pinpoint the source of the person's question. Remind them where to look inward and how to offer themselves love.
At the very BEGINNING of your response, add this sentence translated naturally into ${name}: "This answer is just for you. It is a helper supporting you in your inner world. Filter it through your heart and keep what warms you."`;
}
// Haftalık rapor (generateRapor) için dil-farkındalıklı sistem prompt'u.
// Mirror prompt'una analoji: lang === "tr" Türkçe kalıbı, diğerleri tamamen İngilizce
// kalıba dönüşür ve modeli hedef dile kilitler (LANGUAGE LOCK backend'de prepend edilir,
// burası gövdedeki Türkçe sızıntısını engeller).
function buildReportSystemPrompt(lang) {
  if (lang === "tr") {
    return `Sen derin bir ayna ve içsel farkındalık rehberisin. Kullanıcının haftalık verilerini, doğum profilini ve 12. ev (gizli benlik) bilgeliğini sentezleyerek Türkçe, şiirsel ve içten bir rapor yazıyorsun. YABANCI KELİME YASAK: İngilizce dahil hiçbir yabancı dilden tek kelime bile kullanma — sadece Türkçe sözcükler. Net ve kendinden emin yaz. Şu kalıpları kesinlikle kullanma: "olası ki", "olabilir", "belki", "belki de", "acaba", "düşünülebilir", "söylenebilir", "muhtemelen". Sorunun kaynağına doğrudan işaret et. Nereye bakabileceğini göster; kendine sevgi sunmayı hatırlat.
ÖZGÜNLÜK (çok önemli): Bu rapor biricik olsun. Kalıp cümlelerden, klişelerden, şablon açılışlardan KAÇIN. Kişinin SOMUT verisine (o haftaki niyetleri, kelimeleri, doğum profili, sayısal/burç enerjisi) doğrudan dayan; herkese uyan genel laflar etme. Yapıyı, açılışı ve imgeleri her raporda değiştir; aynı cümleleri tekrarlama.
Raporun en başına şu cümleyi ekle: "Bu rapor sana özeldir. Düşünce dünyanda sana destek olan bir yardımcıdır. Kalbinin süzgecinden geçir, seni ısıtan kısmını al."`;
  }
  const name = AI_LANG_NAMES[lang] || "English";
  return `You are a deep mirror and inner-awareness guide. CRITICAL LANGUAGE RULE: WRITE YOUR ENTIRE REPORT ONLY IN ${name}. Every section heading, every sentence — including quoted phrases — MUST be in ${name}. Do NOT write a single word in Turkish. This overrides any Turkish text that appears in this prompt or in the user's data. Use ONLY ${name} words and letters; insert no words from English or any other language. You are synthesizing the user's weekly data, birth profile, and 12th house (hidden self) wisdom into a poetic, heartfelt report in ${name}. Write clearly and with confidence. Avoid hedging language ("maybe", "possibly", "perhaps", "it could be that", "one might say"). Point directly at the source of the question. Show where to look inward; remind them to offer themselves love.
ORIGINALITY (very important): Make this report one of a kind. Avoid stock phrases, clichés, and template openings. Ground it in the person's SPECIFIC data (this week's intentions, their words, birth profile, numerology/zodiac energy); do not use generic one-size-fits-all language. Vary the structure, opening and imagery in every report; never repeat the same sentences.
At the very BEGINNING of the report, add this sentence translated naturally into ${name}: "This report is just for you. It is a helper supporting you in your inner world. Filter it through your heart and keep what warms you."`;
}
function compareVer(a, b) {
  const pa = String(a||"").split(".").map(n => parseInt(n)||0);
  const pb = String(b||"").split(".").map(n => parseInt(n)||0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0, y = pb[i] || 0;
    if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
}
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
// Chakra verisi sadece TR ve EN'de mevcut; diğer diller (DE/ES/PT/FR/JA) için EN fallback
// 7-dil çakra: TR/EN tam dizi; de/es/pt/fr/ja EN dizisi + çeviri merge (i18n-data).
const _CHAKRA_LANGS = ["de","es","pt","fr","ja"];
const localizeChakras = (lang) => {
  if (lang === "tr") return CHAKRAS_22_TR;
  if (lang === "en" || !_CHAKRA_LANGS.includes(lang)) return CHAKRAS_22_EN;
  return CHAKRAS_22_EN.map((c, i) => {
    const tr = CHAKRA_TRANS[i] || {};
    return { ...c,
      name: tr.name?.[lang] || c.name,
      desc: tr.desc?.[lang] || c.desc,
      konu: tr.konu?.[lang] || c.konu,
      element: tr.element?.[lang] || c.element };
  });
};
const getChakras7 = (lang) => localizeChakras(lang).filter(c => c.level === 1);
const getChakras22 = (lang) => localizeChakras(lang);
const CHAKRAS_7 = CHAKRAS_22_TR.filter(c => c.level === 1);
const LEVEL_LABELS_TR = { 1:"Fiziksel Boyut", 2:"Ruhsal Boyut", 3:"İlahi & Kozmik Boyut" };
const LEVEL_LABELS_EN = { 1:"Physical Dimension", 2:"Spiritual Dimension", 3:"Divine & Cosmic Dimension" };
const LEVEL_RANGES_TR = { 1:"Çakra 1–7", 2:"Çakra 8–15", 3:"Çakra 16–22" };
const LEVEL_RANGES_EN = { 1:"Chakra 1–7", 2:"Chakra 8–15", 3:"Chakra 16–22" };

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

// ── i18n yardımcıları (DE/ES/PT/FR/JA için) ──────────────────────────────
// Suffix mapping: tr→Tr, en→En, de→De, es→Es, pt-BR→Pt, fr→Fr, ja→Ja
const LANG_SUFFIX = { tr:"Tr", en:"En", de:"De", es:"Es", pt:"Pt", fr:"Fr", ja:"Ja" };
// Yedek tablo (obj-of-langs): obj.de / obj.es / obj["pt-BR"] / obj.fr / obj.ja
const LANG_KEY = { tr:"tr", en:"en", de:"de", es:"es", pt:"pt", fr:"fr", ja:"ja" };
// labelTr/labelEn/labelDe/... gibi alanlardan dile göre okuyan helper.
// Fallback: EN -> TR (her zaman bir şey döner).
function pickLabel(item, lang, base = "label") {
  if (!item) return "";
  const sfx = LANG_SUFFIX[lang] || "En";
  return item[base + sfx] || item[base + "En"] || item[base + "Tr"] || "";
}
// {tr, en, de, es, pt, fr, ja} şeklindeki objeden dile göre okur.
function pickLang(obj, lang) {
  if (!obj) return "";
  const key = LANG_KEY[lang] || "en";
  return obj[key] || obj.en || obj.tr || "";
}

// Element etiketleri + AI hata mesajları — 7 dil (önceden isEn/sabit-TR yüzünden
// de/es/pt/fr/ja Türkçe görüyordu; dil denetimi düzeltmesi).
const ELEM_I18N = {
  ates:   { tr:"Ateş",   en:"Fire",  de:"Feuer",  es:"Fuego",  pt:"Fogo",  fr:"Feu",   ja:"火" },
  toprak: { tr:"Toprak", en:"Earth", de:"Erde",   es:"Tierra", pt:"Terra", fr:"Terre", ja:"地" },
  hava:   { tr:"Hava",   en:"Air",   de:"Luft",   es:"Aire",   pt:"Ar",    fr:"Air",   ja:"風" },
  su:     { tr:"Su",     en:"Water", de:"Wasser", es:"Agua",   pt:"Água",  fr:"Eau",   ja:"水" },
  title:  { tr:"Element Dağılımı", en:"Element Balance", de:"Elementverteilung", es:"Equilibrio Elemental", pt:"Equilíbrio Elemental", fr:"Équilibre Élémentaire", ja:"エレメントバランス" },
  hint:   { tr:"Element dağılımın Sakin Tasarım'dan gelir. Bir kez aç, haritan oluşsun — sonra burada belirir.", en:"Your element balance comes from Sakin Design. Open it once to form your chart — then it appears here.", de:"Deine Elementverteilung stammt aus Sakin Design. Öffne es einmal, damit dein Diagramm entsteht — dann erscheint sie hier.", es:"Tu equilibrio elemental proviene de Sakin Diseño. Ábrelo una vez para formar tu carta — luego aparece aquí.", pt:"O teu equilíbrio elemental vem do Sakin Design. Abre-o uma vez para formar o teu mapa — depois aparece aqui.", fr:"Ton équilibre élémentaire vient de Sakin Design. Ouvre-le une fois pour former ta carte — il apparaît ensuite ici.", ja:"エレメントバランスは Sakin Design から得られます。一度開いてチャートを作ると、ここに表示されます。" },
};
// Burç → element. Doğum haritası noktalarından (güneş, yükselen, 12. ev, draconic güneş)
// element dağılımını host'ta hesaplar — Sakin Tasarım'a yönlendirmeye gerek kalmaz.
const SIGN_ELEMENT = {
  "Koç":"ates","Aslan":"ates","Yay":"ates",
  "Boğa":"toprak","Başak":"toprak","Oğlak":"toprak",
  "İkizler":"hava","Terazi":"hava","Kova":"hava",
  "Yengeç":"su","Akrep":"su","Balık":"su",
};
function elementDistFromSigns(signs) {
  const c = { ates:0, toprak:0, hava:0, su:0 };
  let n = 0;
  for (const s of (signs || [])) { const e = SIGN_ELEMENT[s]; if (e) { c[e]++; n++; } }
  if (!n) return null;
  return { ates:c.ates/n, toprak:c.toprak/n, hava:c.hava/n, su:c.su/n };
}
// "Sakin nedir?" pop-up'ı + ikili yol menüsü metinleri (Sprint 1 — basitleştirme).
const NEDIR_I18N = {
  title:   { tr:"Sakin nedir?", en:"What is Sakin?", de:"Was ist Sakin?", es:"¿Qué es Sakin?", pt:"O que é o Sakin?", fr:"C'est quoi, Sakin ?", ja:"Sakinとは？" },
  vaat:    { tr:"İçindeki sesi net duyabilmen için kendinle bağlantını kolaylaştırır.", en:"It eases your connection with yourself, so you can hear the voice within clearly.", de:"Es erleichtert die Verbindung zu dir selbst, damit du deine innere Stimme klar hören kannst.", es:"Facilita tu conexión contigo mismo para que oigas con claridad tu voz interior.", pt:"Facilita a tua ligação contigo mesmo para ouvires com clareza a tua voz interior.", fr:"Il facilite ta connexion avec toi-même pour que tu entendes clairement ta voix intérieure.", ja:"内なる声をはっきりと聞けるよう、自分自身とのつながりをやさしく整えます。" },
  bodyKesfet: { tr:"Burcun, hayvanın, taşın ve Tasarımın. Tasarım, doğum anındaki enerji haritanı ve karar alma biçimini gösterir.", en:"Your sign, your animal, your stone and your Design. Your Design shows your energy map at birth and how you make decisions.", de:"Dein Zeichen, dein Tier, dein Stein und dein Design. Dein Design zeigt deine Energiekarte bei der Geburt und wie du Entscheidungen triffst.", es:"Tu signo, tu animal, tu piedra y tu Diseño. Tu Diseño muestra tu mapa de energía al nacer y cómo tomas decisiones.", pt:"O teu signo, o teu animal, a tua pedra e o teu Design. O teu Design mostra o teu mapa de energia ao nascer e como tomas decisões.", fr:"Ton signe, ton animal, ta pierre et ton Design. Ton Design montre ta carte d'énergie à la naissance et comment tu prends tes décisions.", ja:"星座、動物、石、そしてあなたのデザイン。デザインは誕生の瞬間のエネルギー地図と、あなたの決め方を映します。" },
  bodyBaglan: { tr:"Günün küçük pratiği: niyet, nefes, ses ve minik görevler. Tikledikçe zincirin büyür, zihnin yavaşlar.", en:"Your small daily practice: intention, breath, sound and tiny tasks. Tick them — your streak grows, your mind slows.", de:"Deine kleine tägliche Praxis: Absicht, Atem, Klang und Mini-Aufgaben. Häkchen für Häkchen wächst deine Serie, dein Geist wird ruhiger.", es:"Tu pequeña práctica diaria: intención, respiración, sonido y mini tareas. Al marcarlas, tu racha crece y tu mente se calma.", pt:"A tua pequena prática diária: intenção, respiração, som e mini tarefas. A cada marca, a tua sequência cresce e a mente acalma.", fr:"Ta petite pratique quotidienne : intention, souffle, son et mini-tâches. Coche-les — ta série grandit, ton esprit ralentit.", ja:"毎日の小さな習慣：意図、呼吸、音、小さなタスク。チェックするたび続きが育ち、心が静まります。" },
  cta:     { tr:"Yolunu seç", en:"Choose your path", de:"Wähle deinen Weg", es:"Elige tu camino", pt:"Escolhe o teu caminho", fr:"Choisis ton chemin", ja:"道を選ぶ" },
  off:     { tr:"Bir daha gösterme", en:"Don't show again", de:"Nicht mehr anzeigen", es:"No mostrar de nuevo", pt:"Não mostrar novamente", fr:"Ne plus afficher", ja:"今後表示しない" },
  yolTitle:{ tr:"Hangi yoldan gidelim?", en:"Which path shall we take?", de:"Welchen Weg nehmen wir?", es:"¿Qué camino tomamos?", pt:"Que caminho seguimos?", fr:"Quel chemin prenons-nous ?", ja:"どちらの道にする？" },
  kesfetT: { tr:"Keşfet", en:"Explore", de:"Entdecken", es:"Explora", pt:"Explora", fr:"Explorer", ja:"見つける" },
  kesfetD: { tr:"Burcun, tasarımın, hayvanın, taşın — sana dair işaretler.", en:"Your sign, your design, your animal, your stone — the signs about you.", de:"Dein Zeichen, dein Design, dein Tier, dein Stein — Zeichen über dich.", es:"Tu signo, tu diseño, tu animal, tu piedra — señales sobre ti.", pt:"O teu signo, o teu design, o teu animal, a tua pedra — sinais sobre ti.", fr:"Ton signe, ton design, ton animal, ta pierre — des signes qui te concernent.", ja:"星座、デザイン、動物、石——あなたにまつわるしるし。" },
  baglanT: { tr:"Bağlan", en:"Connect", de:"Verbinden", es:"Conecta", pt:"Liga-te", fr:"Se relier", ja:"つながる" },
  baglanD: { tr:"Niyet, nefes, ses — günün küçük sakinlik pratiği.", en:"Intention, breath, sound — your small daily practice of calm.", de:"Absicht, Atem, Klang — deine kleine tägliche Ruhepraxis.", es:"Intención, respiración, sonido — tu pequeña práctica diaria de calma.", pt:"Intenção, respiração, som — a tua pequena prática diária de calma.", fr:"Intention, souffle, son — ta petite pratique quotidienne de calme.", ja:"意図、呼吸、音——毎日の小さな穏やかさの習慣。" },
  yolSkip: { tr:"Şimdilik geç", en:"Skip for now", de:"Später", es:"Ahora no", pt:"Agora não", fr:"Plus tard", ja:"あとで" },
};
// Doğum bilgisi kaydı sonrası anında karşılık kartı (Sprint 2 — aha anı).
const REVEAL_I18N = {
  title:  { tr:"İşte ilk işaretlerin", en:"Here are your first signs", de:"Hier sind deine ersten Zeichen", es:"Aquí están tus primeras señales", pt:"Aqui estão os teus primeiros sinais", fr:"Voici tes premiers signes", ja:"最初のしるしが届きました" },
  sun:    { tr:"Burcun", en:"Your sun sign", de:"Dein Sternzeichen", es:"Tu signo", pt:"O teu signo", fr:"Ton signe", ja:"星座" },
  asc:    { tr:"Yükselenin", en:"Your rising", de:"Dein Aszendent", es:"Tu ascendente", pt:"O teu ascendente", fr:"Ton ascendant", ja:"アセンダント" },
  path:   { tr:"Yaşam Yolun", en:"Your life path", de:"Dein Lebensweg", es:"Tu camino de vida", pt:"O teu caminho de vida", fr:"Ton chemin de vie", ja:"ライフパス" },
  tasarim:{ tr:"Tasarımını keşfet ✦", en:"Explore your design ✦", de:"Entdecke dein Design ✦", es:"Explora tu diseño ✦", pt:"Explora o teu design ✦", fr:"Explore ton design ✦", ja:"あなたのデザインを見る ✦" },
  gune:   { tr:"Güne başla ◎", en:"Start your day ◎", de:"Beginne den Tag ◎", es:"Empieza el día ◎", pt:"Começa o dia ◎", fr:"Commence la journée ◎", ja:"一日を始める ◎" },
};
const AI_ERR_I18N = {
  noAnalysis: { tr:"Analiz alınamadı.", en:"Analysis unavailable.", de:"Analyse nicht verfügbar.", es:"Análisis no disponible.", pt:"Análise indisponível.", fr:"Analyse indisponible.", ja:"分析を取得できませんでした。" },
  connError:  { tr:"Bağlantı hatası.",  en:"Connection error.",     de:"Verbindungsfehler.",      es:"Error de conexión.",     pt:"Erro de conexão.",      fr:"Erreur de connexion.",    ja:"接続エラー。" },
  noReport:   { tr:"Rapor oluşturulamadı.", en:"Report could not be generated.", de:"Bericht konnte nicht erstellt werden.", es:"No se pudo generar el informe.", pt:"Não foi possível gerar o relatório.", fr:"Le rapport n'a pas pu être généré.", ja:"レポートを生成できませんでした。" },
};
// Yüzde formatı — TR "%50", diğer diller "50%"
function pctFmt(pct, lang) { return lang === "tr" ? `%${pct}` : `${pct}%`; }
// Gezegen astrolojik glifleri (Gökyüzü Raporu gezegen dizilişi satırı)
const PLANET_GLYPH = { Sun:"☉", Moon:"☽", Mercury:"☿", Venus:"♀", Mars:"♂", Jupiter:"♃", Saturn:"♄", Uranus:"♅", Neptune:"♆", Pluto:"♇" };
// Haftalık anahtar — haftalık rapor cache'i için (1 hafta boyunca aynı rapor).
function currentWeekKey(d = new Date()) {
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - onejan) / 86400000 + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

// Genel dizi yerelleştirme (string VEYA obje dizisi): TR/EN tam dizi, de/es/pt/fr/ja
// için EN dizisi + çeviri merge. transByLang = { de:[...], es:[...], ... }.
function _localizeArr(enArr, trArr, transByLang, lang) {
  if (lang === "tr") return trArr;
  if (lang === "en" || !transByLang || !transByLang[lang]) return enArr;
  const t = transByLang[lang];
  return enArr.map((item, i) => {
    if (t[i] == null) return item;
    if (typeof item === "string") return typeof t[i] === "string" ? t[i] : item;
    if (item && typeof item === "object" && t[i] && typeof t[i] === "object") return { ...item, ...t[i] };
    return item;
  });
}

// İçsel Ayna örnek-soru havuzu: TR/EN dizileri (kategori objeleri) verilir; de/es/pt/fr/ja
// için EN kategori yapısı korunur (cat etiketi zaten t() ile çevrili), sorular çevrilir.
// NOTIF_TRANS.SAMPLE_QUESTIONS düz 20 soru (5 kategori × 4) sırasıyla.
function _locSampleQ(lang, trArr, enArr) {
  if (lang === "tr") return trArr;
  const sq = NOTIF_TRANS && NOTIF_TRANS.SAMPLE_QUESTIONS && NOTIF_TRANS.SAMPLE_QUESTIONS[lang];
  if (lang === "en" || !sq) return enArr;
  return enArr.map((c, ci) => ({ ...c, sorular: c.sorular.map((q, qi) => sq[ci*4+qi] || q) }));
}

// Frekans isimlerinin diğer dillerde karşılığı (Now Playing widget için).
// EN sürümündeki ad temel kabul edildi.
const FREQ_NAME_I18N = {
  174: { tr:"Toprak Frekansı",    en:"Earth Frequency",       de:"Erdfrequenz",            es:"Frecuencia Terrestre",     pt:"Frequência da Terra",     fr:"Fréquence de la Terre",  ja:"地球の周波数" },
  285: { tr:"Enerji Yenileyici",  en:"Energy Renewal",        de:"Energieerneuerung",      es:"Renovación Energética",    pt:"Renovação Energética",    fr:"Renouveau Énergétique",  ja:"エネルギーの再生" },
  396: { tr:"Özgürleşme",         en:"Liberation",            de:"Befreiung",              es:"Liberación",               pt:"Libertação",              fr:"Libération",             ja:"解放" },
  417: { tr:"Dönüşüm",            en:"Transformation",        de:"Verwandlung",            es:"Transformación",           pt:"Transformação",           fr:"Transformation",         ja:"変容" },
  432: { tr:"Evrensel Uyum",      en:"Universal Harmony",     de:"Universelle Harmonie",   es:"Armonía Universal",        pt:"Harmonia Universal",      fr:"Harmonie Universelle",   ja:"宇宙の調和" },
  528: { tr:"Sevgi Frekansı",     en:"Love Frequency",        de:"Liebesfrequenz",         es:"Frecuencia del Amor",      pt:"Frequência do Amor",      fr:"Fréquence de l'Amour",   ja:"愛の周波数" },
  639: { tr:"İlişki Uyumu",       en:"Relationship Harmony",  de:"Beziehungsharmonie",     es:"Armonía Relacional",       pt:"Harmonia Relacional",     fr:"Harmonie Relationnelle", ja:"つながりの調和" },
  741: { tr:"İfade & Arınma",     en:"Expression & Cleansing",de:"Ausdruck & Reinigung",   es:"Expresión y Purificación", pt:"Expressão e Purificação", fr:"Expression & Purification", ja:"表現と浄化" },
  852: { tr:"Sezgisel Uyanış",    en:"Intuitive Awakening",   de:"Intuitives Erwachen",    es:"Despertar Intuitivo",      pt:"Despertar Intuitivo",     fr:"Éveil Intuitif",         ja:"直感の目覚め" },
  963: { tr:"İlahi Bağlantı",     en:"Divine Connection",     de:"Göttliche Verbindung",   es:"Conexión Divina",          pt:"Conexão Divina",          fr:"Connexion Divine",       ja:"神聖なつながり" },
};
const getFreqName = (hz, lang) => {
  const row = FREQ_NAME_I18N[hz];
  if (!row) return "";
  return pickLang(row, lang);
};
// 7-dil frekans: TR/EN tam dizi; de/es/pt/fr/ja EN + çeviri merge (hz ile eşleşir).
const _FREQ_TRANS_BY_HZ = Object.fromEntries((FREQ_TRANS || []).map(t => [t.hz, t]));
const _FREQ_LANGS = ["de","es","pt","fr","ja"];
const getFreqData = (lang) => {
  if (lang === "tr") return FREQ_DATA_TR;
  if (lang === "en" || !_FREQ_LANGS.includes(lang)) return FREQ_DATA_EN;
  return FREQ_DATA_EN.map(f => {
    const t = _FREQ_TRANS_BY_HZ[f.hz];
    if (!t) return f;
    return { ...f,
      tema: t.tema?.[lang] || f.tema,
      aciklama: t.aciklama?.[lang] || f.aciklama,
      etkiler: t.etkiler?.[lang] || f.etkiler };
  });
};

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
// Yaşam yolu sayılarının kısa anlamı (TR + EN). Usta sayılar 11/22/33 dahil.
const LIFE_PATH_DESC = {
  tr: {
    1:"Lider, öncü. Kendi yolunu açar, başlatır, bağımsızca yön belirler.",
    2:"Diplomat, sezgili. İlişkilerde köprü kurar, denge ve barış arar.",
    3:"Yaratıcı ifade. Söz, sanat ve neşeyle dünyaya dokunur.",
    4:"İnşa edici. Sabırla, disiplinle sağlam temeller atar.",
    5:"Özgür ruh. Değişim, hareket, çeşitlilik onun nefesidir.",
    6:"Şefkat ve sorumluluk. Aile ve toplulukta hizmet eder.",
    7:"Bilge arayışçı. İçe döner, derinleşir; mistik ve analitik.",
    8:"Güç ve denge. Maddi ve manevi dünyada ustalık ister.",
    9:"İnsani hizmet. Geniş şefkat, evrensel bakış, tamamlanma.",
    11:"Sezgi ustası. İlhamı kanalize eden ışık taşıyıcı.",
    22:"Ana mimar. Büyük vizyonu somut gerçeğe dönüştüren.",
    33:"Şefkat öğretmeni. Bilgeliği sevgiyle paylaşan.",
  },
  en: {
    1:"Leader, pioneer. Opens new paths, sets direction independently.",
    2:"Diplomat, intuitive. Bridge-builder, seeker of balance and peace.",
    3:"Creative voice. Touches the world through expression, art, joy.",
    4:"Builder. Lays solid foundations with patience and discipline.",
    5:"Free spirit. Change, movement, variety — that's the breath.",
    6:"Love & responsibility. Serves family and community.",
    7:"Wise seeker. Turns inward; mystical and analytical at once.",
    8:"Power & balance. Mastery across material and spiritual worlds.",
    9:"Humanitarian. Wide compassion, universal view, completion.",
    11:"Master of intuition. A lightbearer channeling inspiration.",
    22:"Master builder. Turns grand vision into tangible reality.",
    33:"Master of compassion. Shares wisdom through love.",
  },
};
const PERSONAL_YEAR_DESC = {
  tr: {
    1:"Yeni döngünün başlangıcı. Tohum ek, yön belirle.",
    2:"İşbirliği yılı. Sabır, denge, ilişkilerde derinlik.",
    3:"Yaratım ve ifade. Sosyallik, neşe, projelerin akışı.",
    4:"İnşa yılı. Disiplin, somut emek, sağlam temel.",
    5:"Değişim yılı. Hareket, yeni alanlar, esneklik.",
    6:"Sorumluluk yılı. Ev, aile, şifa, hizmet.",
    7:"İçe dönüş yılı. Çalışma, bilgelik, sessizlik.",
    8:"Hasat yılı. Güç, başarı, maddi ve ruhsal denge.",
    9:"Tamamlanma yılı. Bırak, affet, yeni döngüye yer aç.",
  },
  en: {
    1:"A new cycle begins. Plant seeds, set direction.",
    2:"Year of cooperation. Patience, balance, deeper bonds.",
    3:"Creation & expression. Social, joyful, projects flow.",
    4:"Year of building. Discipline, real work, solid ground.",
    5:"Year of change. Movement, new ground, flexibility.",
    6:"Year of responsibility. Home, family, healing, service.",
    7:"Year of inward turn. Study, wisdom, quiet.",
    8:"Year of harvest. Power, success, material & spiritual balance.",
    9:"Year of completion. Release, forgive, make space for the next cycle.",
  },
};

// Ay evresi — referans yeni ay: 2000-01-06 18:14 UTC. Sinodik ay = 29.5305888531 gün.
// Saf matematik; API gerekmez, çevrimdışı çalışır.
function moonPhase(date = new Date()) {
  const REF_NEW = Date.UTC(2000, 0, 6, 18, 14);
  const SYNODIC = 29.5305888531;
  const days = (date.getTime() - REF_NEW) / 86400000;
  const age = ((days % SYNODIC) + SYNODIC) % SYNODIC; // 0..29.53
  const frac = age / SYNODIC;                          // 0=yeni, 0.5=dolunay
  const phases = [
    { key:"new",     emoji:"🌑", tr:"Yeni Ay",      en:"New Moon"        },
    { key:"wax_c",   emoji:"🌒", tr:"İlk Hilal",    en:"Waxing Crescent" },
    { key:"first_q", emoji:"🌓", tr:"İlk Dördün",   en:"First Quarter"   },
    { key:"wax_g",   emoji:"🌔", tr:"Şişkin Ay",    en:"Waxing Gibbous"  },
    { key:"full",    emoji:"🌕", tr:"Dolunay",      en:"Full Moon"       },
    { key:"wan_g",   emoji:"🌖", tr:"Azalan Şişkin",en:"Waning Gibbous"  },
    { key:"last_q",  emoji:"🌗", tr:"Son Dördün",   en:"Last Quarter"    },
    { key:"wan_c",   emoji:"🌘", tr:"Son Hilal",    en:"Waning Crescent" },
  ];
  // 8 bölge: 0..3.69 yeni, 3.69..7.38 hilal, ... her biri ~3.69 gün
  const idx = Math.floor(((age + SYNODIC/16) % SYNODIC) / (SYNODIC/8)) % 8;
  let cur = phases[idx];
  // 5-dil faz adı (de/es/pt/fr/ja) — i18n-data'dan, faz sırasıyla eşleşir.
  const _mp = NOTIF_TRANS && NOTIF_TRANS.MOON_PHASES;
  if (_mp) cur = { ...cur, de:_mp.de?.[idx]||cur.en, es:_mp.es?.[idx]||cur.en, pt:_mp.pt?.[idx]||cur.en, fr:_mp.fr?.[idx]||cur.en, ja:_mp.ja?.[idx]||cur.en };
  const fullAge = SYNODIC / 2;
  const daysToFull = age <= fullAge ? (fullAge - age) : (SYNODIC + fullAge - age);
  const daysToNew  = SYNODIC - age;
  const illumination = Math.round((1 - Math.cos(2 * Math.PI * frac)) / 2 * 100); // % aydınlanma
  return {
    ...cur,
    age: Math.round(age * 10) / 10,
    illumination,
    daysToFull: Math.round(daysToFull * 10) / 10,
    daysToNew:  Math.round(daysToNew  * 10) / 10,
  };
}

function biorhythm(dateStr) {
  const days = Math.floor((Date.now()-new Date(dateStr))/86400000);
  return {
    fiziksel: Math.round(Math.sin(2*Math.PI*days/23)*100),
    duygusal:  Math.round(Math.sin(2*Math.PI*days/28)*100),
    zihinsel:  Math.round(Math.sin(2*Math.PI*days/33)*100),
  };
}
// ─────────────────────────────────────────────────────────────────────────────
const ZODIAC_ORDER = ["Koç","Boğa","İkizler","Yengeç","Aslan","Başak","Terazi","Akrep","Yay","Oğlak","Kova","Balık"];
const EV_GEZEGEN = { "Koç":"Mars","Boğa":"Venüs","İkizler":"Merkür","Yengeç":"Ay","Aslan":"Güneş","Başak":"Merkür","Terazi":"Venüs","Akrep":"Pluto","Yay":"Jüpiter","Oğlak":"Satürn","Kova":"Uranüs","Balık":"Neptün" };
// TR → EN display maps for zodiac & planet names (UI surfacing only — internal keys stay TR)
const ZODIAC_EN = { "Koç":"Aries","Boğa":"Taurus","İkizler":"Gemini","Yengeç":"Cancer","Aslan":"Leo","Başak":"Virgo","Terazi":"Libra","Akrep":"Scorpio","Yay":"Sagittarius","Oğlak":"Capricorn","Kova":"Aquarius","Balık":"Pisces" };
const PLANET_EN = { "Güneş":"Sun","Ay":"Moon","Merkür":"Mercury","Venüs":"Venus","Mars":"Mars","Jüpiter":"Jupiter","Satürn":"Saturn","Uranüs":"Uranus","Neptün":"Neptune","Pluto":"Pluto" };
const zodiacDisplay = (sign, lang) => (lang === "tr" || !sign || sign === "—") ? sign : (ZODIAC_EN[sign] || sign);
const planetDisplay = (planet, lang) => (lang === "tr" || !planet) ? planet : (PLANET_EN[planet] || planet);
// 12. Ev burç yorumları — Tracy Marks "Gizli Benliğiniz" kitabına göre
const EV12_BURCU_ACIKLAMA = {
  tr: {
    "Koç":     { tema:"Bastırılmış Cesaret & Öfke", yorum:"12. evinde Koç varsa bilinçdışında cüretkar, öncü bir enerji yatar. Başlatma gücün, bağımsız iradenin ve öfkeni ifade etme cesaretinin bastırıldığı bu evde karmik dersin, kendi iradesini tanımak ve eyleme geçmekten korkmamaktır. Gizli gücün: engellerden geçme kararlılığı." },
    "Boğa":    { tema:"Bastırılmış Güvenlik & Değer", yorum:"12. evinde Boğa varsa köklenme, doğayla bağ ve maddi güvenlik ihtiyacın bilinçdışında derinleşir. Kendinle ilgili değer biçememe ya da bedeni ihmal etme bu evin gölgesidir. Karmik dersin: kendi değerini bedenselden ruhsala taşımak. Gizli gücün: sabır ve sarsılmaz kararlılık." },
    "İkizler": { tema:"Bastırılmış Merak & İletişim", yorum:"12. evinde İkizler varsa yoğun iç konuşma, yazılı anlayış ve sözsüz iletişim için derin bir kapasite taşırsın. Düşüncelerini ifade etmekte zorlanman ya da bilgiyi içinde biriktirmen bu evin gölgesidir. Karmik dersin: içteki sesi dışa taşımak. Gizli gücün: yazma ve derin düşünce." },
    "Yengeç":  { tema:"Bastırılmış Şefkat & Aile", yorum:"12. evinde Yengeç varsa duygusal güvenlik, bakım verme ve ev kavramı bilinçdışında güçlü bir yer tutar. Başkasına sığınma ihtiyacını ya da kendi çocukluk yaranı gizleme eğilimin bu evin gölgesidir. Karmik dersin: kendinle anne gibi ilgilenmek. Gizli gücün: derin empati ve sezgisel anlama." },
    "Aslan":   { tema:"Bastırılmış Yaratıcılık & İfade", yorum:"12. evinde Aslan varsa yaratıcı potansiyel ve kalpten liderlik etme gücü sessizce derinleşir. Görünmek istememe, alkış almaktan kaçma ya da kendi parlaklığından utanma bu evin gölgesidir. Karmik dersin: özgün ifadene izin vermek. Gizli gücün: ışığını içten dışa taşıma kapasitesi." },
    "Başak":   { tema:"Bastırılmış Mükemmeliyetçilik & Hizmet", yorum:"12. evinde Başak varsa analitik zihin ve hizmet etme arzusu bilinçdışında çalışır. Kendini ya da başkalarını eleştirme, kusur arama ya da bedeni aşırı kontrol etme bu evin gölgesidir. Karmik dersin: şefkatli bir öz-analiz. Gizli gücün: detaylı anlama ve şifalı hizmet." },
    "Terazi":  { tema:"Bastırılmış Denge & İlişki", yorum:"12. evinde Terazi varsa uyum kurma, adalet arama ve ilişkilerdeki denge ihtiyacı derinlerde işler. Çatışmadan kaçmak ya da başkasını mutlu etmek için kendinden vazgeçmek bu evin gölgesidir. Karmik dersin: kendi ihtiyaçlarınla barışmak. Gizli gücün: sezgisel diplomasi." },
    "Akrep":   { tema:"Bastırılmış Dönüşüm & Derinlik", yorum:"12. evinde Akrep varsa yoğun duygular, sırlar ve psikolojik dönüşüm gücü bilinçdışında toplanır. Güvensizlik, kontrol ihtiyacı ya da kaybetme korkusu bu evin gölgesidir. Karmik dersin: derinlere inmek ve yeniden doğmak. Gizli gücün: radikal psikolojik anlayış ve şifa kapasitesi." },
    "Yay":     { tema:"Bastırılmış Özgürlük & Anlam", yorum:"12. evinde Yay varsa felsefi bilgelik, anlam arayışı ve spiritüel özgürlük sessizce büyür. İnançlarını ya da yolculuk etme arzunu bastırmak bu evin gölgesidir. Karmik dersin: kendi hakikatine güvenmek ve ilerlemek. Gizli gücün: felsefi kavrayış ve geniş perspektif." },
    "Oğlak":  { tema:"Bastırılmış Disiplin & Otorite", yorum:"12. evinde Oğlak varsa sorumluluk alma kapasitesi ve iç disiplin bilinçdışında güçlenir. Yetersizlik hissi, başaramamaktan korkma ya da otorite figürlerine duyulan gizli öfke bu evin gölgesidir. Karmik dersin: öz-otoritenle barışmak. Gizli gücün: sessiz, kararlı öz-güç." },
    "Kova":    { tema:"Bastırılmış Özgünlük & İnsanlık", yorum:"12. evinde Kova varsa özgün olmak, kolektife katkı sunmak ve devrimci fikirler bilinçdışında çalışır. Aitlik korkusu ya da farklı olmaktan utanmak bu evin gölgesidir. Karmik dersin: bireysel özgünlüğünü insanlığa armağan etmek. Gizli gücün: yenilikçi sezgi ve topluluk hissi." },
    "Balık":   { tema:"Bastırılmış Şefkat & Evrensel Bağ", yorum:"12. evinde Balık varsa sınırlar çözülür, evrensel sevgi ve spiritüel teslimiyete yönelik derin bir kapasite taşırsın. Gerçeklikten kaçma, öz-kurban ya da başkasında eriyip gitme bu evin gölgesidir. Karmik dersin: şefkat ve sınır arasındaki dengeyi bulmak. Gizli gücün: mistik bağlantı ve iyileştirici sevgi." },
  },
  en: {
    "Koç":     { tema:"Suppressed Courage & Anger", yorum:"With Aries in your 12th, a daring, pioneering energy rests in your unconscious. Your power to begin, your independent will and the courage to express anger are held back here. Your karmic lesson: recognise your own will and stop fearing action. Your hidden strength: the resolve to push through obstacles." },
    "Boğa":    { tema:"Suppressed Security & Worth", yorum:"With Taurus in your 12th, your need for rooting, contact with nature and material safety deepens unconsciously. Difficulty valuing yourself or neglecting the body is this house's shadow. Your karmic lesson: carry your worth from the bodily into the soulful. Your hidden strength: patience and unshakeable resolve." },
    "İkizler": { tema:"Suppressed Curiosity & Communication", yorum:"With Gemini in your 12th, you hold a deep capacity for inner dialogue, written understanding and wordless communication. Struggling to express your thoughts or hoarding knowledge inside is this house's shadow. Your karmic lesson: carry the inner voice outward. Your hidden strength: writing and deep reflection." },
    "Yengeç":  { tema:"Suppressed Tenderness & Family", yorum:"With Cancer in your 12th, emotional security, caretaking and the idea of home hold strong space in your unconscious. The tendency to hide your need to lean on someone — or to hide your childhood wound — is this house's shadow. Your karmic lesson: mother yourself. Your hidden strength: deep empathy and intuitive understanding." },
    "Aslan":   { tema:"Suppressed Creativity & Expression", yorum:"With Leo in your 12th, creative potential and heart-led leadership quietly deepen. Not wanting to be seen, avoiding applause or feeling shame about your own brilliance is this house's shadow. Your karmic lesson: allow your authentic expression. Your hidden strength: the capacity to carry your light from within to without." },
    "Başak":   { tema:"Suppressed Perfectionism & Service", yorum:"With Virgo in your 12th, an analytical mind and the desire to serve work in your unconscious. Criticising yourself or others, hunting for flaws, or over-controlling the body is this house's shadow. Your karmic lesson: a compassionate self-analysis. Your hidden strength: precise understanding and healing service." },
    "Terazi":  { tema:"Suppressed Balance & Relationship", yorum:"With Libra in your 12th, the longing for harmony, the search for justice and the need for balance in relationships work in the depths. Avoiding conflict or giving up yourself to make another happy is this house's shadow. Your karmic lesson: make peace with your own needs. Your hidden strength: intuitive diplomacy." },
    "Akrep":   { tema:"Suppressed Transformation & Depth", yorum:"With Scorpio in your 12th, intense emotions, secrets and the power of psychological transformation gather in your unconscious. Insecurity, the need to control or fear of loss is this house's shadow. Your karmic lesson: go deep and be reborn. Your hidden strength: radical psychological insight and the capacity to heal." },
    "Yay":     { tema:"Suppressed Freedom & Meaning", yorum:"With Sagittarius in your 12th, philosophical wisdom, the search for meaning and spiritual freedom grow quietly. Suppressing your beliefs or your urge to travel is this house's shadow. Your karmic lesson: trust your own truth and move forward. Your hidden strength: philosophical insight and wide perspective." },
    "Oğlak":  { tema:"Suppressed Discipline & Authority", yorum:"With Capricorn in your 12th, your capacity for responsibility and inner discipline strengthen unconsciously. A feeling of inadequacy, fear of failing or hidden anger toward authority is this house's shadow. Your karmic lesson: make peace with your own authority. Your hidden strength: quiet, steady self-power." },
    "Kova":    { tema:"Suppressed Originality & Humanity", yorum:"With Aquarius in your 12th, being original, contributing to the collective and revolutionary ideas work in your unconscious. Fear of not belonging, or shame about being different, is this house's shadow. Your karmic lesson: gift your individual originality to humanity. Your hidden strength: innovative intuition and a sense of community." },
    "Balık":   { tema:"Suppressed Compassion & Universal Bond", yorum:"With Pisces in your 12th, boundaries dissolve and you carry a deep capacity for universal love and spiritual surrender. Escaping reality, self-sacrifice or losing yourself in another is this house's shadow. Your karmic lesson: find the balance between compassion and boundary. Your hidden strength: mystical connection and healing love." },
  },
};
const GEZEGEN_12EV_GUCLERI = {
  tr: {
    "Güneş":  "İçsel zenginliğe güven, kendini canlandırma ve konsantrasyon, liderlik potansiyeli",
    "Ay":     "Duygusal kendine yeterlilik, kendini besleme ve bakma becerisi, ihtiyaç duyan insanlara derin hassasiyet",
    "Merkür": "Olağanüstü açık iç iletişim kurma yeteneği, içsel gelişim için yazma ve düşünmeyi araç olarak kullanma",
    "Venüs":  "Kendine sevgi ve nezaket, yalnız olmaktan alınan haz, ideallere derin bağlılık, iç huzur",
    "Mars":   "Her şeye yeniden başlayabilme kapasitesi, ruhunu keşfetme cesareti ve kararlılığı",
    "Jüpiter":"Köklü inanç ve felsefi güç, olumlu ve iyimser yaklaşım, içsel yaşamın zenginliğiyle büyüme yeteneği",
    "Satürn": "Öz disiplin, yalnızlıkla baş edebilme, sorumluluk üstlenme ve tek başına kararlılıkla çalışma",
    "Uranüs": "Psikolojik özgürlük ve açık fikirlilik, kökleşmiş sezgiler, orijinallik ve beklenmedik durumlarla baş etme",
    "Neptün": "Sonsuz inanç ve şefkat, esin kaynağının yüksek seviyelerine uyum, ideallere adanma ve özverili sevgi",
    "Pluto":  "Derin psikolojik anlayış, boyun eğmeyen irade, gerilime dayanabilmek ve kendini canlandıracak müthiş güç",
  },
  en: {
    "Güneş":  "Trust in inner richness, self-renewal and concentration, leadership potential",
    "Ay":     "Emotional self-sufficiency, the skill of nourishing yourself, deep sensitivity to those in need",
    "Merkür": "An extraordinary ability for clear inner communication, using writing and reflection as tools for inner growth",
    "Venüs":  "Self-love and gentleness, joy in solitude, deep devotion to ideals, inner peace",
    "Mars":   "The capacity to begin everything again, the courage and resolve to explore your own soul",
    "Jüpiter":"Rooted faith and philosophical strength, an optimistic outlook, the ability to grow through the richness of inner life",
    "Satürn": "Self-discipline, the ability to face solitude, taking responsibility and working alone with resolve",
    "Uranüs": "Psychological freedom and open-mindedness, ingrained intuitions, originality and the ability to meet the unexpected",
    "Neptün": "Endless faith and compassion, attunement to high levels of inspiration, devotion to ideals and selfless love",
    "Pluto":  "Deep psychological insight, an unyielding will, capacity to bear tension and tremendous strength to renew yourself",
  },
};
// approxAscendant kaldırıldı — preciseAscendant tamamen ikame etti, çağrılmıyordu.

// Doğum şehri → koordinat + saat dilimi. Türkiye 81 il + büyük dünya şehirleri.
// [enlem, boylam, UTC offset]. Türkiye için offset 3 (DST geçmişi yaklaşık).
const CITY_DB = {
  "adana":[37.00,35.32,3],"adıyaman":[37.76,38.28,3],"afyonkarahisar":[38.76,30.54,3],"ağrı":[39.72,43.05,3],
  "amasya":[40.65,35.83,3],"ankara":[39.93,32.86,3],"antalya":[36.90,30.69,3],"artvin":[41.18,41.82,3],
  "aydın":[37.85,27.84,3],"balıkesir":[39.65,27.88,3],"bilecik":[40.14,29.98,3],"bingöl":[39.06,40.50,3],
  "bitlis":[38.40,42.11,3],"bolu":[40.74,31.61,3],"burdur":[37.72,30.29,3],"bursa":[40.19,29.06,3],
  "çanakkale":[40.16,26.41,3],"çankırı":[40.60,33.62,3],"çorum":[40.55,34.95,3],"denizli":[37.78,29.09,3],
  "diyarbakır":[37.91,40.24,3],"edirne":[41.68,26.56,3],"elazığ":[38.68,39.22,3],"erzincan":[39.75,39.50,3],
  "erzurum":[39.90,41.27,3],"eskişehir":[39.78,30.52,3],"gaziantep":[37.07,37.38,3],"giresun":[40.91,38.39,3],
  "gümüşhane":[40.46,39.48,3],"hakkari":[37.58,43.74,3],"hatay":[36.20,36.16,3],"isparta":[37.76,30.55,3],
  "mersin":[36.81,34.64,3],"istanbul":[41.01,28.98,3],"izmir":[38.42,27.14,3],"kars":[40.60,43.10,3],
  "kastamonu":[41.39,33.78,3],"kayseri":[38.73,35.48,3],"kırklareli":[41.74,27.22,3],"kırşehir":[39.15,34.16,3],
  "kocaeli":[40.77,29.92,3],"konya":[37.87,32.48,3],"kütahya":[39.42,29.98,3],"malatya":[38.35,38.31,3],
  "manisa":[38.61,27.43,3],"kahramanmaraş":[37.58,36.93,3],"mardin":[37.31,40.74,3],"muğla":[37.22,28.36,3],
  "muş":[38.73,41.49,3],"nevşehir":[38.62,34.71,3],"niğde":[37.97,34.68,3],"ordu":[40.98,37.88,3],
  "rize":[41.02,40.52,3],"sakarya":[40.69,30.43,3],"adapazarı":[40.78,30.40,3],"samsun":[41.29,36.33,3],"siirt":[37.93,41.95,3],
  "sinop":[42.03,35.15,3],"sivas":[39.75,37.02,3],"tekirdağ":[40.98,27.51,3],"tokat":[40.31,36.55,3],
  "trabzon":[41.00,39.72,3],"tunceli":[39.11,39.55,3],"şanlıurfa":[37.17,38.79,3],"uşak":[38.68,29.41,3],
  "van":[38.49,43.41,3],"yozgat":[39.82,34.81,3],"zonguldak":[41.45,31.79,3],"aksaray":[38.37,34.03,3],
  "bayburt":[40.26,40.23,3],"karaman":[37.18,33.22,3],"kırıkkale":[39.85,33.52,3],"batman":[37.88,41.13,3],
  "şırnak":[37.52,42.46,3],"bartın":[41.64,32.34,3],"ardahan":[41.11,42.70,3],"iğdır":[39.92,44.04,3],
  "yalova":[40.65,29.27,3],"karabük":[41.20,32.62,3],"kilis":[36.72,37.12,3],"osmaniye":[37.07,36.25,3],
  "düzce":[40.84,31.16,3],"develi":[38.39,35.49,3],
  "london":[51.51,-0.13,0],"londra":[51.51,-0.13,0],"paris":[48.86,2.35,1],"berlin":[52.52,13.40,1],
  "madrid":[40.42,-3.70,1],"rome":[41.90,12.50,1],"roma":[41.90,12.50,1],"amsterdam":[52.37,4.90,1],
  "moscow":[55.76,37.62,3],"moskova":[55.76,37.62,3],"dubai":[25.20,55.27,4],"new york":[40.71,-74.01,-5],
  "los angeles":[34.05,-118.24,-8],"chicago":[41.88,-87.63,-6],"toronto":[43.65,-79.38,-5],
  "tokyo":[35.68,139.69,9],"beijing":[39.90,116.41,8],"sydney":[-33.87,151.21,10],
  "tehran":[35.69,51.39,3.5],"tahran":[35.69,51.39,3.5],"baku":[40.41,49.87,4],"bakü":[40.41,49.87,4],
  "lefkoşa":[35.19,33.36,3],"nicosia":[35.19,33.36,3],
};
const CITY_NAMES = Object.keys(CITY_DB);
function normalizeCity(s){ return (s||"").toLowerCase().trim().replace(/i̇/g,"i").replace(/İ/g,"i"); }
// lookupCity: önce küçük yerleşik DB, sonra büyük GeoNames DB (yüklenmişse),
// son çare olarak substring eşleşmesi. preciseAscendant senkron çağırır;
// büyük DB yüklenmediyse yine de yerleşik 81 il + büyük dünya şehirleri çalışır.
function lookupCity(input){
  if (!input) return null;
  const q = normalizeCity(input);
  if (CITY_DB[q]) return CITY_DB[q];
  const big = lookupCityBig(q);
  if (big) return big;
  const hit = CITY_NAMES.find(n => q.includes(n) || n.includes(q));
  return hit ? CITY_DB[hit] : null;
}

// Gerçek yükselen burç — yıldız zamanı + küresel astronomi (doğum şehri gerekir)
// Türkiye'nin tarihsel UTC offset'i. CITY_DB tüm TR illerini +3 saklar; ancak
// Türkiye 8 Eylül 2016'ya kadar standart UTC+2 idi (kışın), yazları DST ile +3.
// Doğum tarihine göre doğru offset'i döndürür — yükselen/ev hesabı için kritik:
// sınıra yakın doğumlarda 1 saatlik hata yükselen burcu 1 burç kaydırabiliyordu.
// (lat/lon kutusu Türkiye'yi izole eder; Moskova/Tahran/Kıbrıs/dünya şehirleri etkilenmez.)
function effectiveUtcOffset(lat, lon, tz, Y, Mo, Da) {
  const isTurkey = tz === 3 && lat >= 35.5 && lat <= 42.5 && lon >= 25 && lon <= 45;
  if (!isTurkey) return tz;
  const ymd = Y*10000 + Mo*100 + Da;
  if (ymd >= 20160908) return 3; // kalıcı +3 dönemi (8 Eylül 2016'dan beri)
  // 2016 öncesi: kış +2, yaz (DST) +3 — yaklaşık son-Pazar Mart → son-Pazar Ekim
  const lastSun = (yr, mo) => { const d = new Date(Date.UTC(yr, mo, 0)); return d.getUTCDate() - d.getUTCDay(); };
  const dstStart = Y*10000 + 300 + lastSun(Y, 3);
  const dstEnd   = Y*10000 + 1000 + lastSun(Y, 10);
  return (ymd >= dstStart && ymd < dstEnd) ? 3 : 2;
}

function preciseAscendant(dateStr, timeStr, cityInput) {
  if (!dateStr || !timeStr) return null;
  const loc = lookupCity(cityInput);
  if (!loc) return null;
  const [lat, lon, tz] = loc;
  const [hh, mm] = timeStr.split(":").map(Number);
  if (isNaN(hh) || isNaN(mm)) return null;
  let [Y, Mo, Da] = dateStr.split("-").map(Number);
  if (!Y || !Mo || !Da) return null;
  const D2R = Math.PI/180, R2D = 180/Math.PI;
  const ut = hh + mm/60 - effectiveUtcOffset(lat, lon, tz, Y, Mo, Da);
  let y = Y, m = Mo, d = Da + ut/24;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y/100), B = 2 - A + Math.floor(A/4);
  const JD = Math.floor(365.25*(y+4716)) + Math.floor(30.6001*(m+1)) + d + B - 1524.5;
  const Tj = (JD - 2451545.0)/36525;
  let GMST = 280.46061837 + 360.98564736629*(JD - 2451545.0) + 0.000387933*Tj*Tj - (Tj*Tj*Tj)/38710000;
  GMST = ((GMST % 360) + 360) % 360;
  const ramc = (((GMST + lon) % 360 + 360) % 360) * D2R;
  const eps = 23.4393 * D2R;
  let asc = Math.atan2(Math.cos(ramc), -(Math.sin(ramc)*Math.cos(eps) + Math.tan(lat*D2R)*Math.sin(eps)));
  let deg = ((asc*R2D) % 360 + 360) % 360;
  return ZODIAC_ORDER[Math.floor(deg/30)];
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
  tr: {
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
  },
  en: {
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
  },
};
const DRACONIC_SUN_DETAY = {
  tr: {
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
  },
  en: {
    "Koç":     "At your soul's origin you are a pioneer. Before entering this body you carried the experience of opening new ground, taking the first step and moving by pure will. If your natal Sun is in a passive or harmonious sign you may feel pressed your whole life to 'appear calm' while a restless warrior lives inside you. Your mission: remember that your own will is valid and begin without waiting for anyone's approval. Your shadow: suppressed anger and impulsive action. Your healing: balancing courage with surrender — drawing the sword only at the right moment.",
    "Boğa":    "At your soul's origin you are a gardener, a rooter. Before entering this body you learned to bless matter, hold body wisdom and the beauty of slowness. If your natal Sun is in a fast sign you may feel pressed your whole life to 'keep running' while your soul wants to stop, touch and nourish. Your mission: bring spirit into matter and infuse the sacred; heal through body and nature. Your shadow: over-clinging and inertia. Your healing: drawing your sense of worth from your own being rather than outer possessions.",
    "İkizler": "At your soul's origin you are a messenger — a bridge-builder, translator and transmitter. Before entering this body you gathered the experience of carrying knowledge and connecting worlds. If your natal Sun is in a quiet or deep sign you may feel that you cannot tell anyone how many voices live inside you. Your mission: translate what you see, hear and sense into plain language. Your shadow: scatter and slipping into the superficial. Your healing: using your mind as an instrument of service — carrying light, not chatter.",
    "Yengeç":  "At your soul's origin you are a healer, a caretaker, a mother. Before entering this body you swam in the depths of emotional memory and learned to carry others' wounds. If your natal Sun is in a cold or analytical sign you may feel pressed your whole life to 'appear tough' while you carry an ocean inside. Your mission: create emotional safety, offer maternal compassion to yourself and others. Your shadow: over-protection and emotional captivity. Your healing: mothering your own inner child first.",
    "Aslan":   "At your soul's origin you are a light-bearer — a being who creates from the heart and shines without applause. Before entering this body you knew the sacredness of the stage and that creativity is divine. If your natal Sun is in a humble sign you may have spent your life 'trying to shrink, to go unseen' while the king/queen inside grew restless. Your mission: bring your light forward without hiding and without spectacle. Your shadow: need for approval and pride. Your healing: seeing your shining as service — your light lights another's path.",
    "Başak":   "At your soul's origin you are a craftsperson and a healer — you carried the ability to see the sacred in the detail. Before entering this body you learned that service is a humble form of divinity. If your natal Sun is in a wide and scattered sign you may feel constantly 'forced to fix and systematise' yourself. Your mission: not to judge what is flawed but to tend it with care. Your shadow: harsh critique and obsession with perfection. Your healing: compassionate analysis — toward yourself first.",
    "Terazi":  "At your soul's origin you are a mediator, an aesthete, a master of balance. Before entering this body you learned the sacredness of relationship and harmony. If your natal Sun is in an independent or combative sign you may feel exhausted by 'having to fight alone'. Your mission: grow through partnerships and carry justice with a delicate intuition. Your shadow: indecision and need for approval. Your healing: learning to say yes to yourself — only then do you find true balance.",
    "Akrep":   "At your soul's origin you are an alchemist, a transformer — you knew that beneath life lies death and beneath death lies rebirth. Before entering this body you learned the sacredness of intense feeling and psychological depth. If your natal Sun is in a light or cheerful sign you may have felt judged your whole life as 'too deep, too intense'. Your mission: descend without fear into your own and others' shadow and transform it. Your shadow: control and insecurity. Your healing: using your depth as a gift of healing.",
    "Yay":     "At your soul's origin you are a wandering philosopher, a truth-hunter. Before entering this body you gathered the knowledge of different cultures, beliefs and horizons. If your natal Sun is in a settled or traditional sign you may feel pressed your whole life to 'belong somewhere' while your soul longs for boundless freedom. Your mission: live the truth and share it — not from a pulpit, but from the road. Your shadow: dogmatism and constant escape. Your healing: noticing that the starting point of the wisdom you seek is inside you.",
    "Oğlak":   "At your soul's origin you are a master-builder, a wise elder. Before entering this body you learned the discipline of time, responsibility and material manifestation. If your natal Sun is in a playful or passive sign you may feel 'too serious, too adult' your whole life. Your mission: build your own authority independent of outer ones and create something lasting. Your shadow: rigidity and emotional distance. Your healing: balancing achievement with love — making room for softness inside what you build.",
    "Kova":    "At your soul's origin you are a visionary, a revolutionary — you brought the ability to see the future in the present. Before entering this body you tied yourself to the evolution of the collective and learned to think outside patterns. If your natal Sun is in a traditional or dependent sign you may feel suffocated your whole life by 'being stuck in the mould'. Your mission: gift your original vision to humanity and gently transform old structures. Your shadow: disconnection and emotional distance. Your healing: living independence as service, not as loneliness.",
    "Balık":   "At your soul's origin you are a mystic, an ocean — you came from beyond boundaries. Before entering this body you carried the knowledge of universal love, surrender and union. If your natal Sun is in a sharp or sharply bounded sign you may have felt judged your whole life as 'too soft, too dissolved'. Your mission: bring compassion and intuition into daily life — loving while keeping your boundary. Your shadow: escape and self-sacrifice. Your healing: keeping your bond with the divine while standing firmly on the ground.",
  },
};

// Astroloji/numeroloji 5-dil çevirileri mevcut {tr,en} nesnelerine merge (de/es/pt/fr/ja).
// Tüketiciler zaten X[lang] || X.en okuyor; bu satırlar de/es/pt/fr/ja anahtarlarını ekler.
[
  ["LIFE_PATH_DESC", LIFE_PATH_DESC],
  ["PERSONAL_YEAR_DESC", PERSONAL_YEAR_DESC],
  ["EV12_BURCU_ACIKLAMA", EV12_BURCU_ACIKLAMA],
  ["GEZEGEN_12EV_GUCLERI", GEZEGEN_12EV_GUCLERI],
  ["DRACONIC_SUN_KISA", DRACONIC_SUN_KISA],
  ["DRACONIC_SUN_DETAY", DRACONIC_SUN_DETAY],
].forEach(([k, obj]) => { if (ASTRO_TRANS && ASTRO_TRANS[k]) Object.assign(obj, ASTRO_TRANS[k]); });

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
const getReminders = (lang) => _localizeArr(REMINDERS_EN, REMINDERS_TR, NOTIF_TRANS.REMINDERS, lang);

function AppStoreBadge({ lang = "tr", size = "md" }) {
  const isLg = size === "lg";
  return (
    <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer"
      style={{
        display:"inline-flex",alignItems:"center",gap: isLg?12:9,
        padding: isLg?"12px 24px":"8px 16px",
        background:"#000",border:"1.5px solid rgba(255,255,255,0.85)",
        borderRadius: isLg?14:10,color:"#fff",textDecoration:"none",
        transition:"all 0.25s",cursor:"pointer",
        boxShadow:"0 0 0 rgba(255,255,255,0)"
      }}
      onMouseEnter={e => { e.currentTarget.style.background="#0a0a0a"; e.currentTarget.style.boxShadow="0 0 28px rgba(255,255,255,0.18)"; e.currentTarget.style.transform="translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.background="#000"; e.currentTarget.style.boxShadow="0 0 0 rgba(255,255,255,0)"; e.currentTarget.style.transform="translateY(0)"; }}>
      <svg width={isLg?26:22} height={isLg?30:26} viewBox="0 0 24 28" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="2" width="16" height="24" rx="3" />
        <line x1="10" y1="22" x2="14" y2="22" />
        <path d="M12 7v8" />
        <path d="M9 12l3 3 3-3" />
      </svg>
      <div style={{ display:"flex",flexDirection:"column",lineHeight:1,alignItems:"flex-start",fontFamily:"-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}>
        <span style={{ fontSize: isLg?11:9.5,opacity:0.85,letterSpacing:0.3 }}>{lang==="tr" ? "App Store'dan" : "Download on the"}</span>
        <span style={{ fontSize: isLg?18:14,fontWeight:600,letterSpacing:0.4,marginTop:3 }}>{lang==="tr" ? "İndir" : "App Store"}</span>
      </div>
    </a>
  );
}

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
const PREMIUM_WORDS_TR = ["berraklık", "güç", "özgürlük", "neşe", "şükür", "güven"];

// Duygu durumları — kullanıcı seçer, frekanslar karışır (procedural; tıbbi iddia yok)
const MIND_MOODS = [
  { id:"endiseli",  icon:"🌊", labelTr:"Endişeli",     labelEn:"Anxious",            labelDe:"Ängstlich",       labelEs:"Ansioso",            labelPt:"Ansioso",            labelFr:"Anxieux",            labelJa:"不安",         frequencies:[96, 144, 216],  colors:["#4a8aa0","#7ab0c4"] },
  { id:"uzgun",     icon:"🌧", labelTr:"Üzgün",        labelEn:"Sad",                labelDe:"Traurig",         labelEs:"Triste",             labelPt:"Triste",             labelFr:"Triste",             labelJa:"悲しい",       frequencies:[174, 261, 349], colors:["#5a4878","#7868a8"] },
  { id:"ofkeli",    icon:"🔥", labelTr:"Öfkeli",       labelEn:"Angry",              labelDe:"Wütend",          labelEs:"Enfadado",           labelPt:"Com raiva",          labelFr:"En colère",          labelJa:"怒り",         frequencies:[90, 135, 180],  colors:["#8a4040","#b07070"] },
  { id:"uykusuz",   icon:"🌙", labelTr:"Uykusuz",      labelEn:"Sleepless",          labelDe:"Schlaflos",       labelEs:"Insomne",            labelPt:"Sem sono",           labelFr:"Insomniaque",        labelJa:"眠れない",     frequencies:[48, 72, 96],    colors:["#283848","#485870"] },
  { id:"dagiNik",   icon:"🌪", labelTr:"Dağınık",      labelEn:"Scattered",          labelDe:"Zerstreut",       labelEs:"Disperso",           labelPt:"Disperso",           labelFr:"Éparpillé",          labelJa:"散漫",         frequencies:[256, 384, 512], colors:["#5a8aa0","#80b0c8"] },
  { id:"yalniz",    icon:"🌒", labelTr:"Yalnız",       labelEn:"Lonely",             labelDe:"Einsam",          labelEs:"Solo",               labelPt:"Solitário",          labelFr:"Seul",               labelJa:"孤独",         frequencies:[220, 330, 440], colors:["#705a98","#9078b8"] },
  { id:"tukenmis",  icon:"🍂", labelTr:"Tükenmiş",     labelEn:"Burnt out",          labelDe:"Ausgebrannt",     labelEs:"Agotado",            labelPt:"Esgotado",           labelFr:"Épuisé",             labelJa:"燃え尽き",     frequencies:[64, 96, 192],   colors:["#705a40","#a08868"] },
  { id:"sikisik",   icon:"⛓",  labelTr:"Sıkışmış",     labelEn:"Stuck",              labelDe:"Festgefahren",    labelEs:"Atascado",           labelPt:"Travado",            labelFr:"Bloqué",             labelJa:"行き詰まり",   frequencies:[110, 220, 330], colors:["#587858","#80a080"] },
  { id:"belirsiz",  icon:"🌫", labelTr:"Belirsizlikte",labelEn:"Uncertain",          labelDe:"Unsicher",        labelEs:"Incierto",           labelPt:"Incerto",            labelFr:"Incertain",          labelJa:"不確か",       frequencies:[128, 192, 256], colors:["#606078","#8888a0"] },
  { id:"kirik",     icon:"💔", labelTr:"Kalbi kırık",  labelEn:"Heartbroken",        labelDe:"Herzschmerz",     labelEs:"Corazón roto",       labelPt:"Coração partido",    labelFr:"Cœur brisé",         labelJa:"心が痛い",     frequencies:[174, 220, 261], colors:["#883858","#b06080"] },
  { id:"donuk",     icon:"❄",  labelTr:"Donuk",        labelEn:"Numb",               labelDe:"Taub",            labelEs:"Insensible",         labelPt:"Entorpecido",        labelFr:"Engourdi",           labelJa:"麻痺",         frequencies:[55, 82, 110],   colors:["#405878","#608098"] },
  { id:"asiri",     icon:"🧠", labelTr:"Aşırı düşünen",labelEn:"Overthinking",       labelDe:"Grübelnd",        labelEs:"Pensando demás",     labelPt:"Pensando demais",    labelFr:"Trop pensif",        labelJa:"考えすぎ",     frequencies:[256, 320, 384], colors:["#9070b0","#b090d0"] },
  { id:"sukran",    icon:"✨", labelTr:"Şükran arıyor",labelEn:"Seeking gratitude",  labelDe:"Sucht Dankbarkeit",labelEs:"Buscando gratitud", labelPt:"Buscando gratidão",  labelFr:"Cherche la gratitude", labelJa:"感謝を求めて", frequencies:[256, 384, 528],colors:["#a08838","#c8a868"] },
  { id:"yeni",      icon:"🌱", labelTr:"Yenilik istiyor",labelEn:"Wants newness",    labelDe:"Sehnt sich nach Neuem", labelEs:"Quiere novedad", labelPt:"Quer novidade",      labelFr:"Veut du neuf",       labelJa:"新しさ求む",   frequencies:[174, 261, 432],colors:["#588858","#80b080"] },
  { id:"donusum",   icon:"🦋", labelTr:"Dönüşmek istiyor",labelEn:"Wants transformation",labelDe:"Will sich wandeln",labelEs:"Quiere transformarse",labelPt:"Quer transformação",labelFr:"Veut se transformer",labelJa:"変わりたい",   frequencies:[111, 222, 444],colors:["#7a4898","#a070c0"] },
  { id:"akış",      icon:"💧", labelTr:"Akmak istiyor",labelEn:"Wants to flow",      labelDe:"Will fließen",    labelEs:"Quiere fluir",       labelPt:"Quer fluir",         labelFr:"Veut couler",        labelJa:"流れたい",     frequencies:[145, 217, 290], colors:["#3a8aa0","#60b0c0"] },
  { id:"kendine",   icon:"🌸", labelTr:"Kendine dönmek",labelEn:"Return to self",    labelDe:"Zu sich finden",  labelEs:"Volver a sí",        labelPt:"Voltar a si",        labelFr:"Revenir à soi",      labelJa:"自分に還る",   frequencies:[174, 285, 432],colors:["#a08068","#c8a888"] },
  { id:"enerji",    icon:"☀️", labelTr:"Enerji istiyor",labelEn:"Wants energy",      labelDe:"Will Energie",    labelEs:"Quiere energía",     labelPt:"Quer energia",       labelFr:"Veut de l'énergie",  labelJa:"活力を求めて", frequencies:[396, 528, 741], colors:["#e8a850","#f0c860"] },
];
const PREMIUM_WORDS_EN = ["clarity", "strength", "freedom", "joy", "gratitude", "trust"];

// Doğa sesleri — kullanıcı seçer, drone'a katman olarak eklenir (procedural)
const NATURE_SOUNDS = [
  { id:"rain",    icon:"🌧", labelTr:"Yağmur",        labelEn:"Rain",    labelDe:"Regen",   labelEs:"Lluvia",  labelPt:"Chuva",   labelFr:"Pluie",   labelJa:"雨" },
  { id:"thunder", icon:"⛈", labelTr:"Gök gürültüsü", labelEn:"Thunder", labelDe:"Donner",  labelEs:"Trueno",  labelPt:"Trovão",  labelFr:"Tonnerre",labelJa:"雷" },
  { id:"wind",    icon:"🍃", labelTr:"Rüzgar",        labelEn:"Wind",    labelDe:"Wind",    labelEs:"Viento",  labelPt:"Vento",   labelFr:"Vent",    labelJa:"風" },
];

// Zihni Boşalt — kaleidoskop modları (procedural; tıbbi iddia yok)
const MIND_MODES = [
  { id:"sukunet",   labelTr:"Sükûnet",   labelEn:"Stillness",     labelDe:"Stille",        labelEs:"Quietud",       labelPt:"Quietude",       labelFr:"Calme",        labelJa:"静けさ",
                    subTr:"Yavaşla, gevşe",     subEn:"Slow down, soften",      subDe:"Verlangsame, lass los",     subEs:"Reduce, suaviza",          subPt:"Desacelere, amoleça",       subFr:"Ralentis, adoucis",     subJa:"ゆっくり、和らげる",
                    colors:["#3a8a6a","#5ab488","#a0d8b4","#76c49a","#4a9a78"], frequencies:[110, 165, 220],       lfo:0.06, glow:"rgba(120,210,160,0.18)" },
  { id:"berraklik", labelTr:"Berraklık", labelEn:"Clarity",       labelDe:"Klarheit",      labelEs:"Claridad",      labelPt:"Clareza",        labelFr:"Clarté",       labelJa:"明晰",
                    subTr:"Zihni billurla",     subEn:"Crystallise the mind",   subDe:"Den Geist klären",          subEs:"Cristaliza la mente",      subPt:"Cristalize a mente",        subFr:"Cristallise l'esprit",  subJa:"心を澄ます",
                    colors:["#b88040","#e8a850","#f0c860","#d09060","#c88840"], frequencies:[174, 261, 392],       lfo:0.18, glow:"rgba(232,168,80,0.18)" },
  { id:"teslimiyet",labelTr:"Teslimiyet",labelEn:"Surrender",     labelDe:"Hingabe",       labelEs:"Entrega",       labelPt:"Entrega",        labelFr:"Lâcher-prise", labelJa:"委ねる",
                    subTr:"Yumuşakça çözül",    subEn:"Dissolve gently",        subDe:"Sanft loslassen",           subEs:"Disuélvete con suavidad",  subPt:"Dissolva com suavidade",    subFr:"Dissous-toi doucement", subJa:"そっと溶ける",
                    colors:["#3a2858","#5a4080","#8068b0","#4a3870","#382650"], frequencies:[64, 96, 128],         lfo:0.04, glow:"rgba(120,80,180,0.18)" },
  { id:"genislik",  labelTr:"Genişlik",  labelEn:"Spaciousness",  labelDe:"Weite",         labelEs:"Amplitud",      labelPt:"Amplidão",       labelFr:"Espace",       labelJa:"広がり",
                    subTr:"Geniş bak",          subEn:"See wide",               subDe:"Schau weit",                subEs:"Mira con amplitud",        subPt:"Olhe com amplidão",         subFr:"Regarde large",         subJa:"広く見つめる",
                    colors:["#4080a0","#60a8c8","#80c0e0","#a0d8e8","#5090b0"], frequencies:[196, 294, 392, 588],  lfo:0.10, glow:"rgba(120,180,220,0.18)" },
];

// İki hex rengi yumuşakça karıştır (kaleidoskop renk geçişi için).
function _mixHex(a, b, k) {
  const p = (h) => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  const [r1,g1,b1] = p(a), [r2,g2,b2] = p(b);
  const m = (x,y) => Math.round(x + (y - x) * k);
  return `rgb(${m(r1,r2)},${m(g1,g2)},${m(b1,b2)})`;
}

// Procedural noise + doğa sesi yardımcıları
function makeNoiseBuffer(ctx, durationSec, type) {
  const length = Math.floor(ctx.sampleRate * durationSec);
  const buf = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buf.getChannelData(0);
  if (type === "pink") {
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for (let i = 0; i < length; i++) {
      const w = Math.random()*2-1;
      b0 = 0.99886*b0 + w*0.0555179;
      b1 = 0.99332*b1 + w*0.0750759;
      b2 = 0.96900*b2 + w*0.1538520;
      b3 = 0.86650*b3 + w*0.3104856;
      b4 = 0.55000*b4 + w*0.5329522;
      b5 = -0.7616*b5 - w*0.0168980;
      data[i] = (b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11;
      b6 = w*0.115926;
    }
  } else if (type === "brown") {
    let last = 0;
    for (let i = 0; i < length; i++) {
      const w = Math.random()*2-1;
      last = (last + 0.02*w) / 1.02;
      data[i] = last * 3.5;
    }
  } else {
    for (let i = 0; i < length; i++) data[i] = Math.random()*2-1;
  }
  return buf;
}

function startRain(ctx, masterGain) {
  const src = ctx.createBufferSource();
  src.buffer = makeNoiseBuffer(ctx, 4, "pink");
  src.loop = true;
  const hpf = ctx.createBiquadFilter(); hpf.type = "highpass"; hpf.frequency.value = 500;
  const lpf = ctx.createBiquadFilter(); lpf.type = "lowpass";  lpf.frequency.value = 5500;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, ctx.currentTime);
  g.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 2.5);
  src.connect(hpf); hpf.connect(lpf); lpf.connect(g); g.connect(masterGain);
  src.start();
  return { sources:[src], oscillators:[], gain:g, timeouts:[] };
}

function startWind(ctx, masterGain) {
  const src = ctx.createBufferSource();
  src.buffer = makeNoiseBuffer(ctx, 4, "pink");
  src.loop = true;
  const bpf = ctx.createBiquadFilter(); bpf.type = "bandpass"; bpf.frequency.value = 700; bpf.Q.value = 0.6;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, ctx.currentTime);
  g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 3.5);
  const lfo = ctx.createOscillator(); lfo.type = "sine"; lfo.frequency.value = 0.08;
  const lfoGain = ctx.createGain(); lfoGain.gain.value = 450;
  lfo.connect(lfoGain); lfoGain.connect(bpf.frequency);
  const lfo2 = ctx.createOscillator(); lfo2.type = "sine"; lfo2.frequency.value = 0.12;
  const lfo2Gain = ctx.createGain(); lfo2Gain.gain.value = 0.05;
  lfo2.connect(lfo2Gain); lfo2Gain.connect(g.gain);
  src.connect(bpf); bpf.connect(g); g.connect(masterGain);
  src.start(); lfo.start(); lfo2.start();
  return { sources:[src], oscillators:[lfo, lfo2], gain:g, timeouts:[] };
}

function startThunder(ctx, masterGain) {
  const timeouts = [];
  let active = true;
  const fire = () => {
    if (!active || ctx.state === "closed") return;
    const dur = 3 + Math.random() * 2.5;
    const src = ctx.createBufferSource();
    src.buffer = makeNoiseBuffer(ctx, dur, "brown");
    const lpf = ctx.createBiquadFilter(); lpf.type = "lowpass"; lpf.frequency.value = 130;
    const lpf2 = ctx.createBiquadFilter(); lpf2.type = "lowpass"; lpf2.frequency.value = 200;
    const g = ctx.createGain();
    const t0 = ctx.currentTime;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.55, t0 + 0.35);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(lpf); lpf.connect(lpf2); lpf2.connect(g); g.connect(masterGain);
    try { src.start(t0); src.stop(t0 + dur + 0.1); } catch(_) {}
    const next = 18000 + Math.random() * 28000;
    timeouts.push(setTimeout(fire, next));
  };
  timeouts.push(setTimeout(fire, 4000 + Math.random() * 8000));
  return {
    sources:[], oscillators:[], gain:null, timeouts,
    stopActive: () => { active = false; }
  };
}

// Zihni Boşalt — fullscreen kaleidoskop + procedural drone müzik
// React.memo: üst App bileşeni saat tick'i gibi sık aralıklarla re-render oluyor;
// memo olmadan bu, canvas/audio effect'i tetiklemese bile ağır JSX subtree'sini
// gereksiz reconcile ediyordu — periyodik görsel duraksama şikayetinin olası
// kaynağı. Prop'lar (mode/nature/lang/onClose/isPremium/onPremium) değişmeden
// yeniden render olmaz artık.
const KaleidoscopeView = memo(function KaleidoscopeView({ mode, nature = [], lang, onClose, isPremium = false, onPremium = () => {} }) {
  const t = makeTrans(lang);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const rafRef = useRef(null);
  const [timeUp, setTimeUp] = useState(false);

  // Non-premium: 30 sn sonra paywall aç + sesi yumuşakça kıs
  useEffect(() => {
    if (isPremium) return;
    const id = setTimeout(() => {
      setTimeUp(true);
      try {
        const a = audioRef.current;
        if (a && a.aCtx && a.masterGain) {
          a.masterGain.gain.cancelScheduledValues(a.aCtx.currentTime);
          a.masterGain.gain.linearRampToValueAtTime(0.02, a.aCtx.currentTime + 1.2);
        }
        if (a && a.aCtx && a.natureMaster) {
          a.natureMaster.gain.cancelScheduledValues(a.aCtx.currentTime);
          a.natureMaster.gain.linearRampToValueAtTime(0.05, a.aCtx.currentTime + 1.2);
        }
      } catch(_) {}
    }, 60000);
    return () => clearTimeout(id);
  }, [isPremium, mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const setSize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setSize();
    window.addEventListener("resize", setSize);

    // Web Audio drone — procedural sine wave katmanları
    let aCtx, masterGain, natureMaster, oscillators = [], natureNodes = [];
    try {
      aCtx = __makeAudioCtx();
      if (aCtx.state === "suspended") aCtx.resume();
      masterGain = aCtx.createGain();
      masterGain.gain.setValueAtTime(0, aCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.18, aCtx.currentTime + 2.5);
      masterGain.connect(aCtx.destination);
      mode.frequencies.forEach((f, i) => {
        const o = aCtx.createOscillator(), g = aCtx.createGain();
        o.type = "sine"; o.frequency.value = f;
        const base = 0.32 / mode.frequencies.length;
        g.gain.value = base;
        const lfo = aCtx.createOscillator(), lfoGain = aCtx.createGain();
        lfo.type = "sine"; lfo.frequency.value = mode.lfo + i*0.02;
        lfoGain.gain.value = base * 0.45;
        lfo.connect(lfoGain); lfoGain.connect(g.gain);
        o.connect(g); g.connect(masterGain);
        o.start(); lfo.start();
        oscillators.push(o, lfo);
      });
      // Doğa sesleri — drone'un yanına ayrı master ile bağla
      if (nature && nature.length > 0) {
        natureMaster = aCtx.createGain();
        natureMaster.gain.setValueAtTime(0, aCtx.currentTime);
        natureMaster.gain.linearRampToValueAtTime(1, aCtx.currentTime + 1.5);
        natureMaster.connect(aCtx.destination);
        nature.forEach(kind => {
          if (kind === "rain")    natureNodes.push(startRain(aCtx, natureMaster));
          if (kind === "wind")    natureNodes.push(startWind(aCtx, natureMaster));
          if (kind === "thunder") natureNodes.push(startThunder(aCtx, natureMaster));
        });
      }
    } catch(_) {}
    audioRef.current = { aCtx, masterGain, natureMaster, oscillators, natureNodes };

    // Particle init
    const particles = [];
    for (let i = 0; i < 36; i++) {
      particles.push({
        a: (i / 36) * Math.PI * 2,
        rPct: 0.10 + Math.random() * 0.42,
        speed: (Math.random() * 0.0006 + 0.00025) * (Math.random() < 0.5 ? 1 : -1),
        size: 4 + Math.random() * 9,
        colorIdx: Math.floor(Math.random() * mode.colors.length),
        wobble: Math.random() * Math.PI * 2,
        wobbleAmp: 12 + Math.random() * 22,
      });
    }

    // t artık KARE değil GERÇEK ZAMAN tabanlı. Eskiden her karede sabit 0.012
    // ekleniyordu; 120Hz ProMotion ekranda animasyon iki kat hızlı akıyordu.
    // 60fps'teki eski hıza denk gelmesi için saniyede 0.72 (= 0.012 x 60) artar.
    let t = 0, _last = performance.now();
    const draw = () => {
      const _now = performance.now();
      // Sekme arka plandayken oluşan büyük sıçramayı kırp (0.05 sn tavan).
      t += Math.min((_now - _last) / 1000, 0.05) * 0.72;
      _last = _now;
      const w = window.innerWidth, h = window.innerHeight;
      const cx = w / 2, cy = h / 2;
      const sides = 8;
      const maxR = Math.min(w, h) * 0.55;

      ctx.fillStyle = "rgba(0,0,0,0.045)";
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.04);

      for (let s = 0; s < sides; s++) {
        ctx.save();
        ctx.rotate((Math.PI * 2 / sides) * s);
        if (s % 2) ctx.scale(1, -1);
        particles.forEach((p, i) => {
          p.a += p.speed;
          const r = p.rPct * maxR + Math.sin(t * 0.7 + p.wobble) * p.wobbleAmp;
          const x = Math.cos(p.a) * r;
          const y = Math.sin(p.a) * r;
          const sz = p.size + Math.sin(t * 1.6 + i * 0.25) * 3;
          // KÖK SEBEP (kullanıcı: "loop yapıyor ama geçiş smooth değil"):
          // renk indeksi Math.floor ile BASAMAKLI seçiliyordu → 36 parçacık
          // aynı anda sert bir sıçramayla renk atlıyordu. Artık iki komşu renk
          // arasında kesirli oranla karıştırılıyor; geçiş sürekli.
          const _cf = t * 0.25 + p.colorIdx;
          const _i0 = Math.floor(_cf) % mode.colors.length;
          const _i1 = (_i0 + 1) % mode.colors.length;
          const color = _mixHex(mode.colors[_i0], mode.colors[_i1], _cf - Math.floor(_cf));
          ctx.globalAlpha = 0.42;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, sz, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }
      ctx.restore();
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", setSize);
      cancelAnimationFrame(rafRef.current);
      if (audioRef.current) {
        const { aCtx, oscillators, masterGain, natureMaster, natureNodes } = audioRef.current;
        try {
          masterGain.gain.cancelScheduledValues(aCtx.currentTime);
          masterGain.gain.linearRampToValueAtTime(0, aCtx.currentTime + 0.6);
        } catch(_) {}
        try {
          if (natureMaster) {
            natureMaster.gain.cancelScheduledValues(aCtx.currentTime);
            natureMaster.gain.linearRampToValueAtTime(0, aCtx.currentTime + 0.6);
          }
        } catch(_) {}
        (natureNodes||[]).forEach(n => {
          (n.timeouts||[]).forEach(id => clearTimeout(id));
          if (typeof n.stopActive === "function") n.stopActive();
        });
        setTimeout(() => {
          oscillators.forEach(o => { try { o.stop(); } catch(_){} });
          (natureNodes||[]).forEach(n => {
            (n.sources||[]).forEach(s => { try { s.stop(); } catch(_){} });
            (n.oscillators||[]).forEach(o => { try { o.stop(); } catch(_){} });
          });
          try { aCtx.close(); } catch(_) {}
        }, 700);
      }
    };
  }, [mode, nature]);

  return (
    <div style={{ position:"fixed",inset:0,zIndex:10010,background:"#000",animation:"fadeIn 0.7s ease" }}>
      <canvas ref={canvasRef} style={{ width:"100%",height:"100%",display:"block" }} />
      <div style={{ position:"fixed",bottom:"calc(40px + var(--sab))",left:0,right:0,textAlign:"center",pointerEvents:"none",animation:"fadeUp 1.4s ease-out 0.6s both" }}>
        <div style={{ fontSize:11,letterSpacing:6,color:"rgba(255,255,255,0.55)",textTransform:"uppercase",fontFamily:"'Jost',sans-serif",marginBottom:8 }}>
          {pickLabel(mode, lang)}
        </div>
        <div style={{ fontSize:10,letterSpacing:3,color:"rgba(255,255,255,0.28)",textTransform:"uppercase",fontFamily:"'Jost',sans-serif" }}>
          {t("kaleido_hint")}
        </div>
      </div>
      <button onClick={onClose} aria-label={t("common_close")}
        style={{
          position:"fixed",top:"calc(10px + var(--sat))",right:10,zIndex:10011,
          background:"rgba(0,0,0,0.55)",backdropFilter:"blur(16px)",
          border:"1px solid rgba(255,255,255,0.15)",
          borderRadius:"50%",width:36,height:36,padding:0,
          color:"rgba(255,255,255,0.8)",fontSize:16,cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",
          opacity:0.55,transition:"opacity 0.3s",
        }}
        onMouseEnter={e=>e.currentTarget.style.opacity=1}
        onMouseLeave={e=>e.currentTarget.style.opacity=0.55}
        onTouchStart={e=>e.currentTarget.style.opacity=1}>
        ✕
      </button>
      {/* 30 sn paywall — kaleidoskop arkada akmaya devam eder, üstünde yumuşak overlay */}
      {timeUp && (
        <div style={{ position:"fixed",inset:0,zIndex:10012,background:"rgba(0,0,0,0.78)",backdropFilter:"blur(18px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"calc(20px + var(--sat)) 20px calc(20px + var(--sab))",animation:"fadeIn 0.7s ease",overflowY:"auto" }}>
          <div style={{ maxWidth:340,width:"100%",textAlign:"center" }}>
            <div style={{ fontSize:30,marginBottom:14,letterSpacing:6 }}>✦</div>
            <div style={{ fontSize:15,letterSpacing:3,color:"rgba(255,255,255,0.92)",fontFamily:"'Jost',sans-serif",textTransform:"uppercase",marginBottom:10,fontWeight:300 }}>
              {t("premium_one_more_breath")}
            </div>
            <div style={{ fontSize:13,color:"rgba(255,255,255,0.55)",lineHeight:1.85,marginBottom:14 }}>
              {t("premium_kaleido_30s_full")}
            </div>
            {/* Abonelik özeti + 3.1.2(c) gerekli bilgiler */}
            <div style={{ fontSize:11.5,color:"rgba(255,255,255,0.55)",lineHeight:1.6,marginBottom:14,padding:"10px 12px",background:"rgba(255,255,255,0.04)",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)" }}>
              {t("premium_subscription_summary")}
            </div>
            <button onClick={onPremium}
              style={{ display:"block",width:"100%",padding:"12px 18px",borderRadius:24,border:"1px solid rgba(220,200,255,0.5)",background:"linear-gradient(135deg,rgba(184,164,216,0.85),rgba(122,80,150,0.7))",color:"#fff",fontSize:13,letterSpacing:2.5,cursor:"pointer",fontFamily:"'Jost',sans-serif",textTransform:"uppercase",marginBottom:10,boxShadow:"0 4px 22px rgba(122,80,150,0.4)" }}>
              {t("premium_unlock_breath")}
            </button>
            <button onClick={onClose}
              style={{ display:"block",width:"100%",padding:"10px 18px",borderRadius:24,border:"1px solid rgba(255,255,255,0.12)",background:"transparent",color:"rgba(255,255,255,0.55)",fontSize:12,letterSpacing:2,cursor:"pointer",fontFamily:"'Jost',sans-serif",textTransform:"uppercase",marginBottom:12 }}>
              {t("common_close")}
            </button>
            {/* GERÇEK functional URL linkleri — Safari'de açılır */}
            <div style={{ display:"flex",justifyContent:"center",gap:18,flexWrap:"wrap" }}>
              <a href="https://sakin.life/terms/" target="_blank" rel="noopener noreferrer"
                style={{ color:"rgba(184,164,216,0.85)",fontSize:11.5,textDecoration:"underline",textUnderlineOffset:2,fontFamily:"'Inter',sans-serif",padding:"6px 4px" }}>
                {t("premium_eula")}
              </a>
              <a href="https://sakin.life/privacy/" target="_blank" rel="noopener noreferrer"
                style={{ color:"rgba(184,164,216,0.85)",fontSize:11.5,textDecoration:"underline",textUnderlineOffset:2,fontFamily:"'Inter',sans-serif",padding:"6px 4px" }}>
                {t("premium_privacy")}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// Matrix kod yağmuru — fixed arka plan canvas'ı (yalnız matrix modda mount edilir).
function MatrixRain() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    const FS = 16;
    const GL = "0123456789∴✦◇△◯ｱｶｻﾀﾅﾊﾏﾔﾗ零一二三サキン";
    let raf, W, H, cols, drops, last = 0;
    const resize = () => {
      W = cv.width = window.innerWidth; H = cv.height = window.innerHeight;
      cols = Math.ceil(W / FS);
      drops = Array.from({ length: cols }, () => Math.random() * -H);
    };
    resize();
    window.addEventListener("resize", resize);
    const frame = (ts) => {
      raf = requestAnimationFrame(frame);
      if (ts - last < 55) return; last = ts; // ~18fps — hafif
      ctx.fillStyle = "rgba(0,6,0,0.16)"; ctx.fillRect(0, 0, W, H);
      ctx.font = FS + "px 'Courier New', monospace";
      for (let i = 0; i < cols; i++) {
        const ch = GL[(Math.random() * GL.length) | 0];
        const x = i * FS, y = drops[i];
        ctx.fillStyle = Math.random() > 0.976 ? "#9ad9ad" : "#0e9c3c";
        ctx.fillText(ch, x, y);
        drops[i] = (y > H && Math.random() > 0.972) ? 0 : y + FS;
      }
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="sakin-matrix-rain" aria-hidden="true" />;
}

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500&family=Jost:wght@200;300;400&display=swap');
  * { box-sizing: border-box; }
  /* color: eski iOS/WKWebView sürümlerinde color-scheme:dark ipucu geç/tutarsız
     uygulanabiliyor — ilk boyama UA varsayılanı (siyah) metinle başlayıp CSS tam
     yüklenince beyaza "kayıyordu". Taban rengi burada sabitlenince ilk boyamadan
     itibaren doğru — hiçbir platformda görsel değişiklik yaratmaz (zaten her yerde
     beyaza yakın renkler kullanılıyordu). */
  /* ÜST BAR / SCROLL YAPISI = 1.3.1 (kullanıcı: "üst bar boşluğu için 1.3.1'e dönelim").
     1.3.1'de body NORMAL scroll ediyordu (position:fixed / 100dvh / iç-scroll YOK) ve
     üstte boşluk oluşmuyordu. Sonradan eklediğim scroll "iyileştirmeleri" (100dvh, body
     position:fixed + iç kök scroll) boşluğu açtı/kötüleştirdi — hepsi geri alındı.
     color:#fff korunur (ayrı bir metin-flash düzeltmesiydi). */
  /* KAYDIRMA KATMANI ile SABİT KATMAN ayrıldı (kullanıcı: "bounce alt barda
     çalışıyor ama üst bar aşağıda kalıyor").
     SORUN: body'nin KENDİSİ kayınca iOS rubber-band'i esnerken position:fixed üst
     barı da beraberinde aşağı sürüklüyordu (alt bar geri dönüyor, üst bar takılı
     kalıyordu).
     ÇÖZÜM: body hiç kaymaz (fixed, overflow:hidden) → fixed barlar viewport'a
     çakılı, asla sürüklenmez. Gerçek kaydırma ve ELASTİK ESNEME iç kapsayıcıda
     (.sakin-app-root) olur: -webkit-overflow-scrolling:touch iOS'ta iç kapsayıcıya
     da rubber-band verir; overscroll-behavior BİLEREK ayarlanmaz ki esneme yaşasın.
     (Native tarafta da dış webview bounce'u kapatıldı — bkz. SakinViewController.) */
  html, body { background: #000000; color: #ffffff; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  html, body { position: fixed; inset: 0; width: 100%; height: 100%; overflow: hidden; }
  .sakin-app-root { height: 100vh; height: 100dvh; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; }
  /* Dikey ortalama AUTO MARGIN ile (align-items:center DEĞİL): içerik sığıyorsa
     ortalanır, sığmıyorsa yukarıdan başlar ve üst kısım ASLA kesilmez. Bu, flexbox'ın
     "center + overflow → üst erişilemez" tuzağının standart çözümüdür.
     position:fixed çocuklar akış dışı olduğu için bu kuraldan etkilenmez. */
  .sakin-app-root > * { margin-top: auto; margin-bottom: auto; }
  :root { --sat: env(safe-area-inset-top); --sab: env(safe-area-inset-bottom); --android-sab: 0px; --nav-gap: 16px; }
  /* Android edge-to-edge alt sistem çubuğu boşluğu — SADECE Android. iOS/web'de
     0px kalır (WKWebView contentInset zaten hallediyor; web'de gerek yok).
     --nav-gap her platformda 16px: sıfır-bitişik deneme kullanıcıya dar geldi,
     eski ferah görünüme dönüldü (bar sistem çubuğunun 16px üstünde durur). */
  :root[data-platform="android"] { --android-sab: env(safe-area-inset-bottom); }
  /* ZOOM KAPALI: double-tap zoom'u öldürür (pinch, JS gesture guard'da). */
  html, body { touch-action: manipulation; }

  /* ── MATRIX MODU — CRT terminal hissi, göz yormayan kısık yeşil ── */
  .matrix-mode { background: transparent !important; }
  .matrix-mode, .matrix-mode * {
    font-family: 'Courier New', ui-monospace, monospace !important;
    letter-spacing: 0.2px;
  }
  .sakin-matrix-rain {
    position: fixed; inset: 0; width: 100vw; height: 100vh;
    z-index: 0; pointer-events: none; opacity: 0.44;
  }
  /* 1) Karart — parlak alanların ışığını kıs (multiply, hafif) */
  .sakin-matrix-dim {
    position: fixed; inset: 0; z-index: 99988; pointer-events: none;
    background: rgba(0,9,3,0.24); mix-blend-mode: multiply;
  }
  /* 2) Yeşile boya — orta ton (color) */
  .sakin-matrix-tint {
    position: fixed; inset: 0; z-index: 99990; pointer-events: none;
    background: #079a37; mix-blend-mode: color;
  }
  /* 3) CRT tarama çizgileri — hafif film ekranı dokusu */
  .sakin-matrix-scan {
    position: fixed; inset: 0; z-index: 99992; pointer-events: none;
    background: repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.10) 3px);
    opacity: 0.85;
  }
  /* 4) Vinyet — kenarları hafif karart (cam/CRT içinden) */
  .sakin-matrix-vignette {
    position: fixed; inset: 0; z-index: 99993; pointer-events: none;
    background: radial-gradient(125% 95% at 50% 42%, rgba(0,0,0,0) 34%, rgba(0,8,2,0.38) 80%, rgba(0,6,2,0.60) 100%);
  }

  /* ── AÇIK TEMA — koyu arayüzü krem/mor/bakır tona çevirir (referans tasarım) ── */
  .sakin-light-invert {
    position: fixed; inset: 0; z-index: 99990; pointer-events: none;
    -webkit-backdrop-filter: invert(0.96) hue-rotate(180deg) sepia(0.22) saturate(1.15) contrast(1.04);
    backdrop-filter: invert(0.96) hue-rotate(180deg) sepia(0.22) saturate(1.15) contrast(1.04);
  }
  .sakin-light-veil {
    position: fixed; inset: 0; z-index: 99991; pointer-events: none;
    background: #f4ddc9; mix-blend-mode: multiply; opacity: 0.45;
  }

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
  @keyframes panicPulse { 0%,100%{opacity:0.78;box-shadow:0 0 10px rgba(224,110,110,0.25)} 50%{opacity:1;box-shadow:0 0 22px rgba(224,110,110,0.55)} }
  @keyframes askPulse { 0%,100%{ box-shadow:0 0 12px rgba(184,148,224,0.45), inset 0 0 8px rgba(255,255,255,0.15); transform:scale(1); } 50%{ box-shadow:0 0 28px rgba(184,148,224,0.85), 0 0 44px rgba(184,148,224,0.35), inset 0 0 14px rgba(255,255,255,0.30); transform:scale(1.06); } }
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
  @keyframes portalIn    { 0%{opacity:0;transform:scale(0.6) rotate(-8deg);filter:blur(18px) brightness(0.4)} 30%{opacity:0.75;transform:scale(0.88) rotate(-3deg);filter:blur(10px) brightness(0.8)} 65%{opacity:1;transform:scale(1.02) rotate(0deg);filter:blur(3px) brightness(1.1)} 100%{opacity:1;transform:scale(1);filter:blur(0) brightness(1)} }
  @keyframes portalRingPulse { 0%{transform:translate(-50%,-50%) scale(0.4);opacity:0.85} 100%{transform:translate(-50%,-50%) scale(3.2);opacity:0} }
  @keyframes portalTunnel    { 0%{transform:translate(-50%,-50%) scale(0.4) rotate(0deg);opacity:0.9} 50%{opacity:0.5} 100%{transform:translate(-50%,-50%) scale(2.4) rotate(180deg);opacity:0} }
  @keyframes mirrorReveal {
    0%   { opacity:0; filter:blur(24px) brightness(0.3); transform:scale(1.06); }
    100% { opacity:1; filter:blur(0) brightness(1); transform:scale(1); }
  }
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
  /* BAĞLANTI AKTİF ışık tüneli (kullanıcı: "tüm renkler bir tünele dönüşsün,
     içinden enerji geçen ışık tüneli; yukarıdan aşağı beyaz-sarı-mor ışık
     yeryüzüne bağlansın"). Tüm ekran: aşağı akan beyaz/sarı/mor ışık bantları +
     radyal maske ile tünel-ağzı derinliği + üstten gelip alta (yeryüzüne) inen
     akış. allStepsComplete olunca mandala ekranının ARKASINDA (zIndex:0) belirir. */
  @keyframes sakinTunnelFlow { from { background-position: 0 0; } to { background-position: 0 160px; } }
  /* Çakra sütunundaki ışık huzmesinin KESİNTİSİZ aşağı akışı (SVG rect üzerinde).
     Yukarıdan girip yeryüzüne doğru süzülür; tek tek parçacık değil, sürekli akış. */
  /* Huzme, gradyanın TEKRAR PERİYODU kadar (280px) kayar ve başa döner. Gradyan
     spreadMethod="repeat" olduğu için bir periyot sonra desen birebir aynı yere
     oturur → sıçrama/kesinti görünmez, akış sonsuz ve kesintisizdir.
     (Eski hâli ±505px kayıyordu; huzme tünelin dışına, ekranın altına taşıyordu.) */
  @keyframes sakinTunnelDown { 0% { transform: translateY(0); } 100% { transform: translateY(280px); } }
  /* BAĞLANTI AKTİF — ayna ikonu tünel renklerinde yavaşça döner (kullanıcı:
     "bağlantı sağlanınca ayna ikonu her yerde sürekli renk değiştirsin, slow sakin
     bir renk değişimi; bağlantının aktif olduğunu sembolik hissettirir"). */
  @keyframes sakinMirrorCycle {
    0%   { color:#fff6d8; filter: drop-shadow(0 0 6px rgba(255,246,216,0.75)); }
    25%  { color:#f0d660; filter: drop-shadow(0 0 8px rgba(240,214,96,0.80)); }
    50%  { color:#8a4fd0; filter: drop-shadow(0 0 9px rgba(120,60,190,0.85)); }
    75%  { color:#ff6a6a; filter: drop-shadow(0 0 8px rgba(255,90,90,0.75)); }
    100% { color:#fff6d8; filter: drop-shadow(0 0 6px rgba(255,246,216,0.75)); }
  }
  .sakin-mirror-live { animation: sakinMirrorCycle 4.5s ease-in-out infinite; }
  @keyframes sakinTunnelBreath { 0%,100% { opacity:0.55; } 50% { opacity:0.9; } }
  .sakin-tunnel-wrap { position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden; animation: sakinTunnelBreath 4s ease-in-out infinite; }
  .sakin-tunnel-bands {
    position:absolute; inset:-12%;
    background: repeating-linear-gradient(180deg,
      rgba(255,255,255,0.10) 0px,
      rgba(240,214,96,0.13) 42px,
      rgba(184,120,255,0.13) 84px,
      rgba(255,255,255,0.10) 126px,
      rgba(240,214,96,0.13) 160px);
    background-size: 100% 160px;
    animation: sakinTunnelFlow 2.4s linear infinite;
    -webkit-mask: radial-gradient(ellipse 62% 92% at 50% 42%, #000 26%, rgba(0,0,0,0.35) 58%, transparent 78%);
    mask: radial-gradient(ellipse 62% 92% at 50% 42%, #000 26%, rgba(0,0,0,0.35) 58%, transparent 78%);
  }
  /* Alt merkezde "yeryüzüne bağlanan" parlak taban ışığı */
  .sakin-tunnel-ground {
    position:absolute; left:50%; bottom:-6%; transform:translateX(-50%);
    width:70%; height:38%;
    background: radial-gradient(ellipse 100% 100% at 50% 100%, rgba(255,240,190,0.34), rgba(200,150,255,0.16) 45%, transparent 72%);
    filter: blur(6px);
  }
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
    font-family:'Jost',sans-serif; font-weight:500;
    font-size:13.5px; letter-spacing:2px; text-transform:uppercase; color:#aaaaaa;
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
    padding:16px; cursor:pointer; transition:all 0.2s;
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
    padding:18px; background:rgba(255,255,255,0.04);
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
    .rem-card { padding:16px; }
    .chakra-card { padding:16px; }
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
  "Çeneni gevşet, dilini damağından indir",
  "Telefonu bırak, bir dakika sadece var ol",
  "Pencereyi aç, temiz havayı içine çek",
  "Omuzlarını kulaklarından uzaklaştır",
  "Gözlerini kapat, üçe kadar nefes say",
  "İçinden bile olsa bir 'teşekkür ederim' de",
  "Yürürken adımlarını hisset, acele etme",
  "Bugün seni güldüren tek şeyi hatırla",
  "Karnından nefes al, göğsünden değil",
  "Bir bitkiye bak, yapraklarını izle",
  "Kendine nazik bir cümle kur",
  "Sırtını dikleştir, başını hafifçe yukarı al",
  "Elini kalbine koy, atışını dinle",
  "Bir kokuyu fark et — kahve, toprak, yağmur",
  "Şu an neredeysen, oraya tümüyle gel",
  "Kasıtlı olarak yavaşla, bir hareketi ağırdan al",
  "Bugünü bir kelimeyle adlandır, sahiplen",
  "Avuçlarını birbirine sürt, sıcaklığı yüzüne koy",
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
  "Relax your jaw, drop your tongue from the roof",
  "Put the phone down, just exist for a minute",
  "Open the window, draw in the fresh air",
  "Move your shoulders away from your ears",
  "Close your eyes, count three breaths",
  "Say a 'thank you' — even if only inside",
  "Feel your steps as you walk, don't rush",
  "Recall the one thing that made you smile today",
  "Breathe from your belly, not your chest",
  "Look at a plant, watch its leaves",
  "Form one kind sentence toward yourself",
  "Straighten your back, lift your head slightly",
  "Place your hand on your heart, listen to it beat",
  "Notice a scent — coffee, earth, rain",
  "Wherever you are, arrive there fully",
  "Slow down on purpose, take one motion gently",
  "Name today in a single word, own it",
  "Rub your palms together, place the warmth on your face",
];
// Sabah pingleri — her gün 7:30, havuz boyunca döner (varyasyon)
const MORNING_PINGS_TR = [
  "Günaydın. Bugün nasıl hissetmek istersin?",
  "Günaydın. İlk nefesini derinden al.",
  "Yeni bir gün. Niyetini tek cümlede söyle.",
  "Günaydın. Bugün kendine ne diliyorsun?",
  "Gözlerini aç, güne üç nefesle başla.",
  "Günaydın. Acele yok — güne sakin gir.",
  "Bugün senin. Küçük bir iyilikle başla.",
];
const MORNING_PINGS_EN = [
  "Good morning. How do you want to feel today?",
  "Good morning. Take your first breath deeply.",
  "A new day. Say your intention in one sentence.",
  "Good morning. What do you wish for yourself today?",
  "Open your eyes, start the day with three breaths.",
  "Good morning. No rush — enter the day calmly.",
  "Today is yours. Begin with a small kindness.",
];
// Program özelliği davetleri — her gün 21:00, günde 1 tane, havuz boyunca döner
// Yeni bildirim havuzları (kullanıcı isteği): nefes hatırlatması ve Keşfet/Tasarım
// daveti. Tıklanınca doğrudan ilgili ekrana/embed'e gider (extra.screen / extra.embed).
const NOTIF_NEFES = {
  "tr": [
    "Bir dakikan var mı? Üç derin nefes, sadece bu.",
    "Omuzların düştü mü? Nefesine dön.",
    "Nefes al. Ver. Buradasın."
  ],
  "en": [
    "Got a minute? Three deep breaths, that's all.",
    "Shoulders dropped? Come back to your breath.",
    "Breathe in. Out. You are here."
  ],
  "de": [
    "Hast du eine Minute? Drei tiefe Atemzüge, mehr nicht.",
    "Schultern gesunken? Kehr zu deinem Atem zurück.",
    "Einatmen. Ausatmen. Du bist hier."
  ],
  "pt": [
    "Tens um minuto? Três respirações profundas, só isso.",
    "Ombros caídos? Volta à tua respiração.",
    "Inspira. Expira. Estás aqui."
  ],
  "es": [
    "¿Tienes un minuto? Tres respiraciones profundas, nada más.",
    "¿Hombros caídos? Vuelve a tu respiración.",
    "Inhala. Exhala. Estás aquí."
  ],
  "fr": [
    "Tu as une minute ? Trois respirations profondes, c'est tout.",
    "Épaules tombées ? Reviens à ton souffle.",
    "Inspire. Expire. Tu es là."
  ],
  "ja": [
    "1分ありますか？深呼吸を三度、それだけ。",
    "肩が落ちていませんか？呼吸に戻って。",
    "吸って。吐いて。あなたはここにいる。"
  ]
};
const NOTIF_KESFET = {
  "tr": [
    "Tasarımını keşfet — bugünün enerjisi sana ne söylüyor?",
    "Burcun, taşın, hayvanın; bugün seni ne bekliyor?",
    "Sakin Ailesi'nde bugün yeni bir işaret var."
  ],
  "en": [
    "Explore your design — what is today's energy telling you?",
    "Your sign, your stone, your animal; what awaits you today?",
    "There's a new sign in the Sakin Family today."
  ],
  "de": [
    "Entdecke dein Design — was sagt dir die Energie von heute?",
    "Dein Zeichen, dein Stein, dein Tier; was erwartet dich heute?",
    "Heute gibt es ein neues Zeichen in der Sakin-Familie."
  ],
  "pt": [
    "Explora o teu design — o que te diz a energia de hoje?",
    "O teu signo, a tua pedra, o teu animal; o que te espera hoje?",
    "Há um novo sinal na Família Sakin hoje."
  ],
  "es": [
    "Explora tu diseño — ¿qué te dice la energía de hoy?",
    "Tu signo, tu piedra, tu animal; ¿qué te espera hoy?",
    "Hoy hay una nueva señal en la Familia Sakin."
  ],
  "fr": [
    "Explore ton design — que te dit l'énergie du jour ?",
    "Ton signe, ta pierre, ton animal ; qu'est-ce qui t'attend aujourd'hui ?",
    "Il y a un nouveau signe dans la Famille Sakin aujourd'hui."
  ],
  "ja": [
    "あなたのデザインを見て——今日のエネルギーは何を告げている？",
    "星座、石、動物。今日は何が待っている？",
    "今日、サキン・ファミリーに新しいしるしがあります。"
  ]
};
const FEATURE_PROMOS_TR = [
  "Ses frekanslarıyla 1 dakikada sakinleşmek ister misin?",
  "Nefes al, ver... şimdi Sakin Nefesi denemenin tam sırası.",
  "432 Hz çalsın, kalp atışın yavaşlasın — frekanslara göz at.",
  "Bugünkü çakranı biliyor musun? Çakra ekranında bir an dur.",
  "Aynaya 30 saniye bak — Ayna alıştırmasını dene.",
  "Kozmik hava bugün nasıl? Galaktik ekrana göz at.",
  "Totem hayvanın ne diyor? Sakin Hayvan'ı keşfet.",
  "Bir mit, bir sembol — bugünün Sakin Mitleri seni bekliyor.",
  "Haftalık içsel raporun hazır olabilir — bir bak.",
  "528 Hz, 'Sevgi Frekansı' — bir dakika dinle, hisset.",
  "Bir bardak su, üç nefes, bir niyet — Sakin'le küçük bir mola.",
  "396 Hz kök çakranı topraklar — gözlerini kapat, dinle.",
];
const FEATURE_PROMOS_EN = [
  "Want to calm down in 1 minute with sound frequencies?",
  "Breathe in, out... it's the perfect time to try Calm Breath.",
  "Let 432 Hz play, let your heartbeat slow — explore the frequencies.",
  "Do you know today's chakra? Pause for a moment in the Chakra screen.",
  "Look in the mirror for 30 seconds — try the Mirror exercise.",
  "How's the cosmic weather today? Check the Galactic screen.",
  "What does your totem animal say? Discover Calm Animal.",
  "A myth, a symbol — today's Calm Myths await you.",
  "Your weekly inner report might be ready — take a look.",
  "528 Hz, the 'Love Frequency' — listen for a minute, feel it.",
  "A glass of water, three breaths, one intention — a small break with Sakin.",
  "396 Hz grounds your root chakra — close your eyes, listen.",
];

// Bir takvim günü için deterministik gün numarası. Mesaj seçimi bu sayıya göre
// havuz boyunca eşit aralıklı döndüğü için, aynı gün her zaman aynı mesajı verir
// (yeniden schedule'da sabit) ve günler arası tekrar havuz uzunluğu kadar gecikir.
function dayNumber(dateObj) {
  const midnight = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  return Math.floor(midnight.getTime() / 86400000);
}

async function scheduleDailyReminders(lang) {
  if (!isNative) return;
  try {
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== "granted") {
      console.warn("[Notif] permission not granted:", perm.display);
      return;
    }
    const todayKey = sakinDayKey();
    // Damga = tarih + dil. Aynı gün dili değiştirirsen (TR↔EN) damga değişir,
    // yeniden planlanır; aşağıdaki cancel eski dildeki kuyruğu temizler.
    const stamp = todayKey + "_" + lang;
    const lastScheduled = localStorage.getItem("sakin_notif_scheduled");
    // Aynı gün + aynı dil zaten planlandıysa hiçbir şeye dokunma
    if (lastScheduled === stamp) return;
    // Mevcut tüm slotları temizle: hatırlatmalar 9000-9020, sabah 9050-9056,
    // özellik 9070-9076 + eski sabah ping'leri 9100/9101 (9000-9099 hepsini kapsar)
    await LocalNotifications.cancel({ notifications: [...Array.from({length:100},(_,i)=>({id:9000+i})), {id:9100}, {id:9101}] });
    const isTr = lang === "tr";
    const reminders = _localizeArr(DAILY_REMINDERS_EN, DAILY_REMINDERS_TR, NOTIF_TRANS.DAILY_REMINDERS, lang);
    const mornings  = _localizeArr(MORNING_PINGS_EN, MORNING_PINGS_TR, NOTIF_TRANS.MORNING_PINGS, lang);
    const promos    = _localizeArr(FEATURE_PROMOS_EN, FEATURE_PROMOS_TR, NOTIF_TRANS.FEATURE_PROMOS, lang);
    const now = new Date();
    const notifications = [];
    const icon = { smallIcon: "ic_stat_icon_config_sample", iconColor: "#b8a4d8" };
    const pick = (arr, dn) => arr[((dn % arr.length) + arr.length) % arr.length];
    // 7 günlük forward schedule. GÜNDE 2 BİLDİRİM (kullanıcı sınırı, aşılmaz):
    //   08:00 → sabah pingi (sabah ekranı)
    //   18:00 → akşam bildirimi, tek birleşik havuz (özellik daveti + günlük söz +
    //           nefes + Keşfet/Tasarım). Her öğe kendi hedefini taşır; tıklanınca
    //           doğrudan o ekran/embed açılır.
    // SABAH ve AKŞAM eskisi gibi korunur; kaldırılan slot 13:00 oldu (3 → 2).
    // Mesajlar dayNumber'a göre deterministik (aynı gün → aynı mesaj).
    for (let d = 0; d < 7; d++) {
      const dn = dayNumber(new Date(now.getFullYear(), now.getMonth(), now.getDate() + d));
      // 08:00 — sabah pingi (tıklanınca → sabah ekranı)
      const mAt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, 8, 0, 0);
      if (mAt > now) notifications.push({ id: 9050 + d, title: "Sakin", body: pick(mornings, dn), schedule: { at: mAt }, extra: { screen: "sabah" }, ...icon });
      // 18:00 — AKŞAM bildirimi (günün 2. ve son bildirimi). Kullanıcı: "günlük
      // toplam 2, ikiyi geçmesin — sadece havuza ekle" + "sabah ve akşam eskisi
      // gibi devam etsin". Bu yüzden nefes ve Keşfet/Tasarım metinleri AYRI SLOT
      // açmaz; akşam havuzuna karışır ve gün numarasına göre sırayla döner.
      // Her öğe kendi hedefini taşır → tıklanınca doğrudan o ekran/embed açılır.
      const nefesArr  = NOTIF_NEFES[lang]  || NOTIF_NEFES.en;
      const kesfetArr = NOTIF_KESFET[lang] || NOTIF_KESFET.en;
      const eveningPool = [
        ...promos.map(b     => ({ body: b, extra: { screen: "mandala" } })),
        ...reminders.map(b  => ({ body: b, extra: { screen: "gun" } })),
        ...nefesArr.map(b   => ({ body: b, extra: { screen: "nefes" } })),
        ...kesfetArr.map(b  => ({ body: b, extra: { embed: "tasarim" } })),
      ];
      const evening = pick(eveningPool, dn);
      // Saat 21:00 → 18:00 (kullanıcı tercihi). 1.3.1'de kodda 21:00'di; kullanıcı
      // akşamüstünü tercih etti.
      const pAt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, 18, 0, 0);
      if (pAt > now) notifications.push({ id: 9070 + d, title: "Sakin", body: evening.body, schedule: { at: pAt }, extra: evening.extra, ...icon });
    }
    if (notifications.length > 0) await LocalNotifications.schedule({ notifications });
    localStorage.setItem("sakin_notif_scheduled", stamp);
    // Diagnostik: gerçekten kuyrukta kaç bildirim var?
    try {
      const pending = await LocalNotifications.getPending();
      console.log("[Notif] scheduled, pending count:", pending?.notifications?.length);
    } catch(_) {}
  } catch (e) { console.warn("[Notif] error:", e); }
}

// ── EKRANI AÇIK TUT (Screen Wake Lock) ─────────────────────────────────────
// Kullanıcı: "nefes aldığım sayfa hiç bir yere dokunmadığımda kararıyor; gözümü
// kapatıp nefese odaklanmışken telefona tekrar dokunmam gerekiyor."
// Standart Screen Wake Lock API kullanılıyor — YENİ NATIVE EKLENTİ YOK
// (iOS 16.4+ WKWebView ve Android WebView destekler; desteklemeyen sürümde
// sessizce devre dışı kalır, hiçbir şey bozulmaz).
// Kilit yalnızca `active` iken tutulur; ekran/oturum bitince BIRAKILIR ki pil
// boşuna tükenmesin. Sistem kilidi kendi kaldırırsa (arka plana alma, telefonun
// kilitlenmesi) sekmeye dönüldüğünde yeniden alınır.
function useScreenWakeLock(active) {
  useEffect(() => {
    if (!active) return;
    let lock = null, cancelled = false;
    const acquire = async () => {
      try {
        if (!("wakeLock" in navigator)) return;
        const l = await navigator.wakeLock.request("screen");
        if (cancelled) { try { l.release(); } catch(_) {} return; }
        lock = l;
        try { l.addEventListener("release", () => { lock = null; }); } catch(_) {}
      } catch (_) { /* izin yok / desteklenmiyor → sessiz geç */ }
    };
    const onVisible = () => { if (!cancelled && document.visibilityState === "visible" && !lock) acquire(); };
    acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      try { lock && lock.release(); } catch(_) {}
      lock = null;
    };
  }, [active]);
}

// ── BİLDİRİM AKSİYONU: SOĞUK AÇILIŞ TAMPONU ────────────────────────────────
// KÖK SEBEP (kullanıcı: "bildirimler ilgili bölüme gitmiyor, güne başla ekranında
// takılıyor"): dinleyici bir useEffect içinde, yani React mount'undan SONRA
// kuruluyordu. Uygulama KAPALIYKEN bildirime dokunulduğunda (soğuk açılış) native
// taraf aksiyonu, JS bundle'ı ayrışıp React bağlanmadan ÖNCE yayınlıyor →
// olay hiç yakalanmıyor, uygulama varsayılan "giris" ekranında açılıyor.
// Çözüm: dinleyiciyi MODÜL YÜKLENİRKEN kur (React'ten önce çalışır) ve aksiyonu
// tamponla; bileşen bağlanınca tamponu boşalt.
let __pendingNotifAction = null;
let __notifActionHandler = null;
if (isNative) {
  try {
    LocalNotifications.addListener("localNotificationActionPerformed", (a) => {
      if (__notifActionHandler) __notifActionHandler(a);
      else __pendingNotifAction = a;   // React henüz hazır değil → beklet
    });
  } catch (_) {}
}

// Görevden ilgili uygulama aracına köprü (Sprint 2): id → screen. Fiziksel-dünya
// görevlerinin (su, ağaç, güneş...) köprüsü yok — sadece uygulamada yapılabilenler.
const REMINDER_GO = { nefes: "nefes", chakra_an: "chakra" };
const REMINDER_GO_TXT = { tr:"Uygulamada aç", en:"Open in app", de:"In der App öffnen", es:"Abrir en la app", pt:"Abrir na app", fr:"Ouvrir dans l'app", ja:"アプリで開く" };

function ReminderScreen({ onBack, onNext, lang = "tr", onTasksDone, onGo }) {
  const t = makeTrans(lang);
  const REMINDERS = getReminders(lang);
  const _todayKey = sakinDayKey();
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
    <div style={{ maxWidth:430, width:"100%", padding:"62px 20px 190px", position:"relative", zIndex:1 }}>
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

          return (
            <div key={rem.id}
              className={`rem-card slide-in ${isDone?"done":""}`}
              style={{
                animationDelay:`${i*0.05}s`, opacity:0,
              }}
            >
              <div style={{ fontSize:28, flexShrink:0, width:38, textAlign:"center", display:"flex", alignItems:"center", justifyContent:"center" }}>{rem.icon}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:16, fontWeight:500, color:isDone?"#666666":"#d8d0e8", marginBottom:4 }}>{rem.title}</div>
                <div style={{ fontSize:13, fontWeight:300, color:"rgba(200,190,220,0.5)", lineHeight:1.5, marginBottom:rem.duration?8:0 }}>{rem.subtitle}</div>
                {onGo && REMINDER_GO[rem.id] && !isDone && (
                  <button onClick={()=>onGo(REMINDER_GO[rem.id])} style={{
                    marginTop:6, background:"transparent", border:`1px solid ${rem.borderColor}`,
                    borderRadius:100, color:rem.color, cursor:"pointer", fontSize:12,
                    letterSpacing:1, padding:"4px 12px", fontFamily:"'Jost',sans-serif",
                  }}>
                    ↗ {REMINDER_GO_TXT[lang] || REMINDER_GO_TXT.en}
                  </button>
                )}
                {/* Geri sayım süreleri kaldırıldı (kullanıcı isteği) — görev artık
                    yalnızca sağdaki ✓ ile işaretlenir; sabit bir süre beklemeye gerek yok. */}
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

  // Seans süresi kullanıldıkça uzar: 30 sn'den başlar, her tamamlanan seansta +5 sn.
  // TAVAN 90 → 120 sn (kullanıcı: "tek seansta 120 saniye olabilir"). Bağlantının
  // çakra şartı 120 sn TOPLAM olduğundan, tavan 90'da kalsaydı tek seansta asla
  // ulaşılamazdı; artık tek uzun seansla da, birkaç kısa seansla da tamamlanabilir.
  const getChakraDuration = () => {
    const count = parseInt(localStorage.getItem("sakin_chakra_sessions") || "0");
    return Math.min(30 + count * 5, 120);
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

  // TerapiScreen unmount olunca (kullanıcı başka ekrana geçince) çalan tone'u durdur —
  // yoksa ses orphan AudioContext'te kalır, kullanıcı geri dönünce kapatma UI'sı yok.
  useEffect(() => {
    return () => {
      // TÜM osilatörleri durdur (LFO + harmonikler) — yoksa LFO/harmonikler
      // arka planda çalmaya devam eder (alçalıp yükselen ses).
      try { (oscsRef.current || []).forEach(o => { try { o.stop(); } catch(_) {} }); } catch(_) {}
      try { gainRef.current?.disconnect(); } catch(_) {}
      oscsRef.current = [];
      gainRef.current = null;
    };
  }, []);

  // iOS/Android için AudioContext'i kullanıcı gesture'ında unlock et
  const unlockChimeCtx = () => {
    try {
      if (!chimeCxtRef.current) {
        chimeCxtRef.current = __makeAudioCtx();
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
      const ctx = chimeCxtRef.current || __makeAudioCtx();
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
    [396, 528, 660].forEach((f, i) => setTimeout(() => playChime(f, 0.11, 3.5), i*180));
  };

  useEffect(() => {
    if (tPhase!=="active" && tPhase!=="connected") return;
    if (tPhase==="active") setShowCloseEyes(false);
    const dur = terapiDuration.current;
    timerRef.current = setInterval(() => {
      // Günlük toplam çakra terapi süresi — "bağlantı" için 2 dk şartında kullanılır.
      // (Seans bitmese de geçen her saniye sayılır; kullanıcı birden çok kısa seans
      // yapsa da toplam süre birikir.)
      try {
        const _k = "sakin_terapi_sec_" + sakinDayKey();
        localStorage.setItem(_k, String((parseInt(localStorage.getItem(_k)) || 0) + 1));
      } catch(_) {}
      setElapsed(e => {
        const next = e + 1;
        if (next === dur) setShowCloseEyes(true);
        const rem = dur - next;
        if (rem === 7) playChime(396, 0.10, 2.0);
        if (rem === 5) playChime(432, 0.11, 2.0);
        if (rem === 3) playChime(528, 0.12, 2.2);
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
    setTimeout(() => { speakText("Connected", { lang: "en-US", rate: 0.78, pitch: 0.9, volume: 0.55 }); }, 1400);
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
  const oscsRef     = useRef([]);   // TÜM osilatörler: LFO + 4 harmonik (hepsi durdurulmalı)
  const gainRef     = useRef(null);

  const stopTone = () => {
    // ctx'i close etmiyoruz — iOS WKWebView yeniden açmaya izin vermez.
    const ctx = audioCtxRef.current;
    if (gainRef.current && ctx) {
      try { gainRef.current.gain.cancelScheduledValues(ctx.currentTime); } catch(_) {}
      try { gainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8); } catch(_) {}
    }
    setTimeout(() => {
      // LFO + tüm harmonikleri durdur — yoksa LFO master.gain'i modüle edip
      // ses tam susmaz (alçalıp yükselir) ve harmonikler çalmaya devam eder.
      (oscsRef.current || []).forEach(o => { try { o.stop(); } catch(_) {} });
      oscsRef.current = [];
      try { gainRef.current?.disconnect(); } catch(_) {}
      gainRef.current = null;
      // audioCtxRef'i close etmiyoruz; toggleTone tekrar açtığında reuse edilecek.
    }, 820);
    setToneOn(false);
  };

  const toggleTone = (hz) => {
    if (toneOn) { stopTone(); return; }
    // ctx'i gesture handler'ın İLK satırında oluştur/resume et — iOS WKWebView için kritik.
    if (!audioCtxRef.current) {
      try { audioCtxRef.current = __makeAudioCtx(); } catch(_) {}
    }
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === "suspended") { try { ctx.resume(); } catch(_) {} }
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    // Çakra terapisi tonu %25 kısıldı (kullanıcı: "çakra bölümünde ses frekansı çok
    // yüksek, %25 azalt"). 0.28 → 0.21. Tek noktadan (master) kısmak tüm harmonikleri
    // orantılı düşürür, tonun tınısı bozulmaz.
    master.gain.linearRampToValueAtTime(0.21, ctx.currentTime + 2);
    master.connect(ctx.destination);
    gainRef.current = master;
    const oscs = [];
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine"; lfo.frequency.value = 0.15;
    lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain); lfoGain.connect(master.gain);
    lfo.start();
    oscs.push(lfo); // LFO da durdurulacaklar listesinde
    [[1, 1, "sine"], [0.5, 0.2, "sine"], [1.498, 0.12, "sine"], [2.01, 0.06, "triangle"]].forEach(([ratio, amp, type]) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = type; o.frequency.value = hz * ratio;
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.28 * amp, ctx.currentTime + 2);
      o.connect(g); g.connect(master); o.start();
      oscs.push(o); // her harmonik durdurulacaklar listesinde
    });
    oscsRef.current = oscs;
    setToneOn(true);
  };

  const resetTerapi = () => { stopTone(); cancelSpeech(); setTPhase("list"); setSelected(null); setElapsed(0); setParticles([]); setShowBackConfirm(false); setShowCloseEyes(false); clearInterval(timerRef.current); clearInterval(particleRef.current); /* chimeCxtRef'i close etmiyoruz — iOS WKWebView yeniden açmaya izin vermez, terapiye dönünce sessiz kalır. */ };
  // SIRADAKİ ÇAKRAYA GEÇ (kullanıcı: "bir çakradan diğerine geçerken ekran
  // kaydırma iyi olur, geri dönüp sıradakini seçmek yerine"). Listeye dönmeden
  // aynı sekmedeki (temel/yüksek) bir sonraki çakranın hazırlık ekranını açar;
  // sonda başa sarar. Seans durumu (ses, sayaç, parçacıklar) temizlenir.
  const NEXT_CHAKRA_TXT = { tr:"Sıradaki çakra →", en:"Next chakra →", de:"Nächstes Chakra →",
    es:"Siguiente chakra →", pt:"Próximo chakra →", fr:"Chakra suivant →", ja:"次のチャクラ →" };
  const goNextChakra = () => {
    const list = CHAKRAS_22.filter(c => chakraTab === "temel" ? c.level === 1 : c.level > 1);
    const i = list.findIndex(c => c.name === selected?.name);
    if (i === -1 || list.length < 2) { resetTerapi(); return; }
    const next = list[(i + 1) % list.length];
    stopTone(); cancelSpeech();
    clearInterval(timerRef.current); clearInterval(particleRef.current);
    setElapsed(0); setParticles([]); setShowBackConfirm(false); setShowCloseEyes(false);
    setSelected(next);
    setTPhase("intro");
  };
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
        <button onClick={() => { resetTerapi(); onNext(); }} style={{ background:"none", border:"none", color:"#a07ae0", cursor:"pointer", fontSize:13, letterSpacing:2, padding:"8px 4px 8px 8px", fontFamily:"'Jost',sans-serif" }}>{t("common_next")}</button>
      </div>
      {/* Tab toggle */}
      <div style={{ display:"flex", borderRadius:12, overflow:"hidden", border:"1px solid rgba(255,255,255,0.1)", marginBottom:20 }}>
        <button onClick={() => setChakraTab("temel")} style={{
          flex:1, padding:"12px 0", background: chakraTab==="temel" ? "rgba(160,122,224,0.15)" : "transparent",
          border:"none", borderRight:"1px solid rgba(255,255,255,0.1)", cursor:"pointer", textAlign:"center",
        }}>
          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:15, fontWeight: chakraTab==="temel" ? 500 : 300, color: chakraTab==="temel" ? "#d0c0f0" : "#888888", letterSpacing:1 }}>{t("chakra_classic7")}</div>
          <div style={{ fontSize:11, letterSpacing:2, color: chakraTab==="temel" ? "#a07ae0" : "#555555", textTransform:"uppercase", marginTop:2 }}>{t("chakra_classic7_sub")}</div>
        </button>
        <button onClick={() => setChakraTab("yuksek")} style={{
          flex:1, padding:"12px 0", background: chakraTab==="yuksek" ? "rgba(160,122,224,0.15)" : "transparent",
          border:"none", cursor:"pointer", textAlign:"center",
        }}>
          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:15, fontWeight: chakraTab==="yuksek" ? 500 : 300, color: chakraTab==="yuksek" ? "#d0c0f0" : "#888888", letterSpacing:1 }}>{t("chakra_higher15")}</div>
          <div style={{ fontSize:11, letterSpacing:2, color: chakraTab==="yuksek" ? "#a07ae0" : "#555555", textTransform:"uppercase", marginTop:2 }}>{t("chakra_higher15_sub")}</div>
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
            <div style={{ fontFamily:"'Jost',sans-serif", fontSize:11, letterSpacing:4, color:"#888888", textTransform:"uppercase", marginTop:10 }}>{t("chakra_source_energy")}</div>
          </div>
        )}
        {(chakraTab === "temel" ? [1] : [3,2]).map(level => {
          const levelChakras = CHAKRAS_22.filter(c => c.level === level);
          // TR sadece TR'de; DE/ES/PT/FR/JA için EN fallback
          const levelLabel = (lang==="tr" ? LEVEL_LABELS_TR : LEVEL_LABELS_EN)[level];
          const levelRange = (lang==="tr" ? LEVEL_RANGES_TR : LEVEL_RANGES_EN)[level];
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
            <div style={{ fontSize:12, letterSpacing:3, color:"#555555", fontFamily:"'Jost',sans-serif", textTransform:"uppercase" }}>⬇ {t("chakra_earth")}</div>
          </div>
        )}
        {chakraTab === "yuksek" && (
          <div style={{ textAlign:"center", marginTop:10, paddingBottom:8 }}>
            <div style={{ fontSize:12, letterSpacing:3, color:"#555555", fontFamily:"'Jost',sans-serif", textTransform:"uppercase" }}>⬇ {t("chakra_earth")}</div>
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

    // Fiziksel boyut — eller ilgili bölgeye uzanır.
    // KÖK SEBEP DÜZELTMESİ (kullanıcı: "'ellerini taç çakrana koy' diyor ama
    // çöp adamın elleri göğsünde"): bu harita TÜRKÇE ADLARLA anahtarlanmıştı.
    // Çakra adları dile göre değiştiği için (Kök→Root, Taç→Crown …) İngilizce
    // ve diğer dillerde arama BAŞARISIZ oluyor, her çakrada varsayılan
    // {hy:57} yani KALP/GÖĞÜS pozisyonu çiziliyordu. Artık dilden bağımsız
    // olan solfeggio frekansı (hz) anahtar — 7 klasik çakrada benzersiz.
    const HP = {
      396:{hy:83,lx:57,rx:91},  // Kök / Root
      417:{hy:77,lx:59,rx:89},  // Sakral / Sacral
      528:{hy:68,lx:60,rx:88},  // Solar Pleksus / Solar Plexus
      639:{hy:57,lx:61,rx:87},  // Kalp / Heart
      741:{hy:37,lx:68,rx:80},  // Boğaz / Throat
      852:{hy:17,lx:66,rx:82},  // Üçüncü Göz / Third Eye
      963:{hy:10,lx:67,rx:81},  // Taç / Crown
    };
    const {hy=57,lx=61,rx=87}=HP[c.hz]||{};
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
      <div style={{ fontSize:13,letterSpacing:3,color:selected.pastel,marginBottom:16 }}>{selected.element.toLocaleUpperCase(lang)}</div>
      {/* Pozisyon göstergesi */}
      <div style={{ marginBottom:6,opacity:0.8 }}>{positionSvg(selected)}</div>
      <div style={{ fontSize:14,color:"#888888",letterSpacing:1,marginBottom:12,fontStyle:"italic" }}>
        {selected.level > 1
          ? t("chakra_join_hands")
          : t("intro_place_hand", selected.name)}
      </div>
      <div style={{ fontSize:13,letterSpacing:3,color:"rgba(255,255,255,0.3)",marginBottom:28 }}>{t("terapi_duration")}</div>
      <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
        <button className="sakin-btn" onClick={() => { stopTone(); setTPhase("list"); }}>{t("back")}</button>
        <button className="sakin-btn-primary" style={{ background:`linear-gradient(135deg,${selected.color}88,${selected.color}44)`,borderColor:`${selected.color}44` }} onClick={() => { unlockChimeCtx(); playChime(528, 0.15, 3.5); if ("speechSynthesis" in window) { const u = new SpeechSynthesisUtterance(""); window.speechSynthesis.speak(u); } setTPhase("active"); }}>{t("btn_start")}</button>
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
      <div style={{ fontSize:13,letterSpacing:5,color:"#777777",marginBottom:24 }}>{selected.name.toLocaleUpperCase(lang)} · {selected.element.toLocaleUpperCase(lang)}</div>
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
          {t("chakra_connected").replace("{topic}", selected.konu.toLowerCase())}
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
        <button className="sakin-btn" style={{ width:"100%",maxWidth:260 }} onClick={goNextChakra}>
          {pickLang(NEXT_CHAKRA_TXT, lang)}
        </button>
        <div style={{ display:"flex",gap:10 }}>
          <button className="sakin-btn" onClick={resetTerapi}>{t("other_chakra")}</button>
          <button className="sakin-btn" onClick={onBack}>{t("main_screen")}</button>
        </div>
      </div>
    </div>
  );

  return null;
}

// Module-level AudioContext singleton — iOS WKWebView her yeni ctx'i gesture context'i
// kaybedebileceği için reuse ediyoruz. Kullanıcı ilk gesture'ında ctx oluşur, sonra
// her ses çalmada aynı ctx'i kullanırız; close ASLA çağırmayız.
let __freqToneCtx = null;
function playFreqTone(hz, dur = 3.5) {
  try {
    if (!__freqToneCtx) {
      __freqToneCtx = __makeAudioCtx();
    }
    const ctx = __freqToneCtx;
    if (ctx.state === "suspended") { try { ctx.resume(); } catch(_) {} }
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
  } catch(_) {}
}

// ── YOGA POZ SÖZLÜĞÜ + ÇİZGİ FİGÜRLERİ ─────────────────────────────────────
// Kullanıcı: "içsel ayna önerilerde verdiğimiz yoga pozlarının altı çizili olsa
// ve pozları kapanabilir bir pop-up'ta açsa, hareketleri ikon şeklinde ekran
// değişmeden görmüş olur."
// AI çıktısı poz adlarını TIRNAK İÇİNDE yazıyor (ör. Yoga "Kobra" pozu). FreqText
// tırnaklı terimleri yakalar; sözlükte varsa altı çizili + tıklanabilir yapar.
// Figürler uygulamanın mevcut çizgi dilinde (nefes diyaframı, çakra el pozisyonu
// da aynı tarzda) — yan profil, tek renk, ince kontur.
const YOGA_POSES = {
  // ── YOGA POZLARI — ÇİZGİ FİGÜR ────────────────────────────────────────────
  // Kullanıcı: "pop-up'lar çok kötü, anlaşılmıyor; yüklediğim ikondaki gibi net
  // olsun" + eksik pozlar (çocuk, aşağı bakan köpek, bacaklar duvarda).
  // ÖNCEKİ SORUN: her poz TEK bir path'e sıkıştırılmıştı, gövde/kol/bacak
  // ayrımı yoktu → figür okunmuyordu. Artık her poz ayrı parçalardan kuruluyor
  // (gövde, kollar, bacaklar) ve hepsi ortak bir zemin çizgisine oturuyor;
  // referans görseldeki gibi yandan profil, sürekli akan çizgiler.
  // viewBox 0 0 128 112 · zemin y=94 · duvar gerekiyorsa wall:true
  dag: {
    ad:{tr:"Dağ",en:"Mountain"},
    aciklama:{tr:"Ayaklar bitişik, omurga uzun, omuzlar gevşek, kollar yanda. Yere kök sal.",
              en:"Feet together, spine long, shoulders soft, arms at your sides. Root down."},
    head:[64,20,8],
    paths:["M64 28 L64 62","M64 34 L50 64","M64 34 L78 64","M64 62 L57 94","M64 62 L71 94"],
  },
  agac: {
    ad:{tr:"Ağaç",en:"Tree"},
    aciklama:{tr:"Bir ayağın üstünde dur, diğer ayağını iç bacağına yasla, elleri başının üstünde birleştir.",
              en:"Stand on one foot, rest the other on your inner thigh, join your hands overhead."},
    head:[64,24,8],
    paths:["M64 32 L64 66","M64 40 L55 8","M64 40 L73 8",
           "M64 66 L64 94","M64 68 L42 79","M42 79 L61 62"],
  },
  savasci: {
    ad:{tr:"Savaşçı",en:"Warrior"},
    aciklama:{tr:"Bacakları geniş aç, ön dizi bük, kolları yere paralel uzat. Bakışın ön ele.",
              en:"Step your feet wide, bend the front knee, extend your arms parallel to the floor. Gaze past the front hand."},
    head:[64,22,8],
    paths:["M64 30 L64 58","M64 38 L16 42","M64 38 L112 42",
           "M64 58 L98 74 L102 94","M64 58 L26 94"],
  },
  kobra: {
    ad:{tr:"Kobra",en:"Cobra"},
    aciklama:{tr:"Yüzükoyun yat, avuçlarını omuz altına al, göğsü nazikçe yukarı aç. Kalçalar yerde kalsın.",
              en:"Lie face down, palms under your shoulders, gently lift the chest. Keep your hips on the floor."},
    head:[26,28,8],
    paths:["M33 36 C 44 54 62 72 84 83","M40 45 L45 92","M84 83 L118 90","M84 86 L118 94"],
  },
  cocuk: {
    ad:{tr:"Çocuk",en:"Child's Pose"},
    aciklama:{tr:"Dizlerinin üstüne otur, alnını yere bırak, kollarını öne uzat. Nefesini sırtında hisset.",
              en:"Sit back on your heels, rest your forehead down, stretch your arms forward. Feel the breath in your back."},
    head:[30,80,7],
    paths:["M38 77 C 58 70 80 64 95 55","M95 55 L100 81","M100 81 L78 91","M42 83 L12 91"],
  },
  asagi_kopek: {
    ad:{tr:"Aşağı Bakan Köpek",en:"Downward-Facing Dog"},
    aciklama:{tr:"Eller ve ayaklar yerde, kalçanı yukarı it, gövdeni ters V yap. Topukları yere doğru indir.",
              en:"Hands and feet down, lift your hips high into an inverted V. Reach your heels toward the floor."},
    head:[38,58,7],
    paths:["M64 22 L20 90","M64 22 L112 90","M45 54 L34 45"],
  },
  duvar_bacak: {
    ad:{tr:"Bacaklar Duvarda",en:"Legs Up the Wall"},
    aciklama:{tr:"Sırtüstü uzan, kalçanı duvara yaklaştır, bacaklarını duvara yasla. Kollar yanda, gözler kapalı.",
              en:"Lie on your back, bring your hips near the wall, rest your legs up the wall. Arms at your sides, eyes closed."},
    head:[22,84,7],
    wall:true,
    paths:["M30 88 L96 89","M96 89 C 104 78 106 52 105 18","M40 90 L62 92"],
  },
  kopru: {
    ad:{tr:"Köprü",en:"Bridge"},
    aciklama:{tr:"Sırtüstü yat, dizlerini bük, kalçanı yavaşça yukarı kaldır. Omuzlar yerde kalsın.",
              en:"Lie on your back, bend your knees, slowly lift your hips. Keep your shoulders grounded."},
    head:[20,86,7],
    paths:["M30 90 C 46 89 64 74 76 54","M76 54 L98 68","M98 68 L101 93","M34 92 L62 94"],
  },
  kelebek: {
    ad:{tr:"Kelebek",en:"Butterfly"},
    aciklama:{tr:"Otur, ayak tabanlarını birleştir, dizleri yana bırak. Omurgayı uzat, öne yumuşakça eğil.",
              en:"Sit, bring the soles of your feet together, let the knees fall open. Lengthen the spine and fold gently."},
    head:[64,30,8],
    paths:["M64 38 L64 66","M64 66 L34 89 L64 79 L94 89 Z","M64 46 L40 85","M64 46 L88 85"],
  },
  kedi_inek: {
    ad:{tr:"Kedi-İnek",en:"Cat-Cow"},
    aciklama:{tr:"Eller ve dizler üstünde dur. Nefes alırken sırtı çukurlaştır, verirken yuvarla.",
              en:"Come onto hands and knees. Inhale and arch the back, exhale and round it."},
    head:[26,56,7],
    paths:["M34 53 C 54 39 78 41 96 54","M34 57 L28 92","M96 54 L102 92","M96 54 L78 70"],
  },
  savasana: {
    ad:{tr:"Şavasana",en:"Savasana"},
    aciklama:{tr:"Sırtüstü uzan, kollar yanda avuçlar yukarı, bacaklar gevşek. Hiçbir şey yapma.",
              en:"Lie on your back, arms at your sides with palms up, legs relaxed. Do nothing at all."},
    head:[22,84,7],
    paths:["M30 88 L104 88","M104 88 L118 81","M104 89 L118 94","M46 89 L60 94"],
  },
};
// Geçerli dili oku (FreqText'e prop eklemeden). Host dili localStorage'da.
const _curLang = () => { try { return localStorage.getItem("sakin_lang") || "tr"; } catch { return "tr"; } };
// AI çıktısındaki serbest yazımı sözlük anahtarına indir (büyük/küçük, ekler).
const _yogaKey = (raw) => {
  const raw0 = String(raw || "").toLocaleLowerCase("tr").replace(/[^a-zçğıöşü]/g, "");
  if (!raw0) return null;
  // "Child's Pose", "Kobra pozu", "Tree Pose" gibi ekleri at → çekirdek ada in.
  // ÖNEMLİ: önce HAM ad denenir. Yoksa Sanskritçe adlar ("Savasana", "Balasana",
  // "Adho Mukha Svanasana") "asana" eki soyulunca tanınmaz hale geliyordu.
  const stripped = raw0.replace(/(pose|poses|pozu|pozlari|pozları|poz|duruşu|durusu|asana|asanasi|asanası)$/, "");
  const k = raw0;
  const map = {
    kobra:"kobra", cobra:"kobra", bhujangasana:"kobra",
    çocuk:"cocuk", cocuk:"cocuk", child:"cocuk", childs:"cocuk", balasana:"cocuk",
    ağaç:"agac", agac:"agac", tree:"agac", vrksasana:"agac",
    savaşçı:"savasci", savasci:"savasci", warrior:"savasci", virabhadrasana:"savasci",
    köprü:"kopru", kopru:"kopru", bridge:"kopru", setubandha:"kopru",
    dağ:"dag", dag:"dag", mountain:"dag", tadasana:"dag",
    // Yeni pozlar (kullanıcı istedi): aşağı bakan köpek, bacaklar duvarda
    aşağıbakanköpek:"asagi_kopek", asagibakankopek:"asagi_kopek",
    downwardfacingdog:"asagi_kopek", downwarddog:"asagi_kopek", downdog:"asagi_kopek",
    köpek:"asagi_kopek", kopek:"asagi_kopek", adhomukhasvanasana:"asagi_kopek",
    bacaklarduvarda:"duvar_bacak", duvardabacak:"duvar_bacak",
    legsupthewall:"duvar_bacak", legsupwall:"duvar_bacak", viparitakarani:"duvar_bacak",
    kelebek:"kelebek", butterfly:"kelebek", baddhakonasana:"kelebek",
    kediinek:"kedi_inek", kedi:"kedi_inek", catcow:"kedi_inek", cat:"kedi_inek", cow:"kedi_inek",
    şavasana:"savasana", savasana:"savasana", corpse:"savasana", ceset:"savasana",
  };
  return map[k] || (stripped ? map[stripped] : null) || null;
};

// ── İÇSEL AYNA HİKÂYE KARTI (1080x1920) ────────────────────────────────────
// Kullanıcı: "içsel rehberi Instagram story'de paylaşabilsin, kartlardaki gibi
// bir paylaş menüsü ekle." Galaktik kimlik kartıyla AYNI teknik: saf canvas 2D
// (SVG-to-Image iOS WKWebView'da font render etmiyor).
// Metin uzun olabildiği için sarmalanır ve kart yüksekliğine SIĞMIYORSA
// kırpılıp "…" konur — taşan yazı basmaktansa kısaltmak daha temiz.
function buildMirrorStoryCard(baslik, govde, altYazi) {
  const W = 1080, H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0a0612");
  bg.addColorStop(0.5, "#1a1230");
  bg.addColorStop(1, "#0a0612");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Yıldızlar — galaktik kimlik kartıyla aynı sabit desen (rastgelelik yok,
  // aynı içerik her seferinde aynı kartı üretsin).
  const stars = [[60,80,3],[260,140,2],[140,220,1.5],[500,180,2.5],[820,140,3],[940,440,2],
    [180,500,1.5],[760,640,2],[120,760,1.5],[880,820,2.5],[420,900,1.5],[640,990,1.8],
    [280,1080,1.5],[820,1140,2],[160,1240,1.5],[560,1320,2],[940,1430,1.5],[120,1520,2],
    [700,1610,1.8],[400,1730,1.5]];
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  for (const [x, y, r] of stars) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }

  // Ay simgesi
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(200,170,240,0.9)";
  ctx.font = "300 96px -apple-system, 'Jost', sans-serif";
  ctx.fillText("☽", W / 2, 300);

  // Üst başlık
  ctx.fillStyle = "#9080c0";
  ctx.font = "300 34px -apple-system, 'Jost', sans-serif";
  ctx.fillText(String(baslik || "").toLocaleUpperCase("tr"), W / 2, 400);

  // Ayraç
  const line = ctx.createLinearGradient(240, 0, 840, 0);
  line.addColorStop(0, "rgba(160,112,208,0)");
  line.addColorStop(0.5, "rgba(160,112,208,0.65)");
  line.addColorStop(1, "rgba(160,112,208,0)");
  ctx.fillStyle = line;
  ctx.fillRect(240, 440, 600, 2);

  // Gövde — sarmalanmış metin
  ctx.fillStyle = "#d8cce8";
  ctx.font = "300 40px -apple-system, 'Inter', sans-serif";
  const maxW = 820, lh = 68, top = 540, bottom = 1620;
  const maxLines = Math.floor((bottom - top) / lh);
  // Markdown kalın işaretlerini ve yönlendirme jetonlarını karttan temizle
  const clean = String(govde || "")
    .replace(/\*\*/g, "")
    // Yönlendirme jetonları okunur etikete çevrilir. EKRAN jetonu ham ekran
    // kimliği taşıyor ("terapi"), kartta bunun yerine görünen ad yazılmalı.
    .replace(/\[\[EKRAN:([^\]]+)\]\]/g, (_m, id) => ({
      terapi:"Çakra Terapisi", nefes:"Nefes", rehber:"Ayna",
      sabah:"Sabah Niyeti", aksam:"Akşam Kapanışı", ses:"Ses Dalgaları",
    }[String(id).trim()] || id))
    .replace(/\[\[NEFES:([^\]]+)\]\]/g, "$1 nefesi")
    .replace(/[ \t]+/g, " ")
    .trim();
  const lines = [];
  for (const para of clean.split("\n")) {
    if (!para.trim()) { if (lines.length) lines.push(""); continue; }
    let cur = "";
    for (const w of para.split(" ")) {
      const test = cur ? cur + " " + w : w;
      if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
      else cur = test;
    }
    if (cur) lines.push(cur);
  }
  const shown = lines.slice(0, maxLines);
  if (lines.length > maxLines && shown.length) shown[shown.length - 1] = shown[shown.length - 1].replace(/[.,;:]?$/, "…");
  shown.forEach((l, i) => ctx.fillText(l, W / 2, top + i * lh));

  // Alt imza
  ctx.fillStyle = "rgba(160,112,208,0.85)";
  ctx.font = "300 34px -apple-system, 'Jost', sans-serif";
  ctx.fillText(altYazi || "SAKIN", W / 2, 1760);
  ctx.fillStyle = "rgba(255,255,255,0.32)";
  ctx.font = "300 28px -apple-system, 'Jost', sans-serif";
  ctx.fillText("sakin.life", W / 2, 1818);

  return canvas;
}

// ── METİNDEKİ SÖZLÜK TERİMLERİ ─────────────────────────────────────────────
// Kullanıcı: "draconic vb özel kelimelere tıklanabilir bir info ekranı aç."
// AI metninde geçen bu terimler altı çizili ve tıklanabilir olur; dokununca
// sözlük o terimde filtreli açılır. SEÇİCİ tutuldu: "çakra", "nefes" gibi çok
// sık geçen kelimeler DIŞARIDA — yoksa metnin yarısı link olur, okunmaz.
// Sıra ÖNEMLİ: uzun terimler önce denenmeli ("kuzey düğüm" < "düğüm" olmasın).
const GLOSSARY_HINTS = [
  "draconik harita", "draconic chart", "draconik", "draconic",
  "solfeggio", "galaktik kimlik", "galactic identity",
  "element dağılımı", "element balance",
  "kuzey düğüm", "güney düğüm", "north node", "south node",
  "yükselen burç", "ascendant", "yaşam yolu sayısı", "life path",
  "kişisel yıl", "personal year", "biyoritim", "biorhythm",
  "gökyüzü raporu", "sky report", "ay evresi", "moon phase",
  "retrograde", "retro", "gün serisi", "day streak",
  "reiki", "louise hay", "12. ev", "12th house",
];
// Regex için kaçış + uzundan kısaya sırala
const _GLOSSARY_RE = new RegExp(
  "(" + GLOSSARY_HINTS.slice().sort((a, b) => b.length - a.length)
    .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")", "gi");

function FreqText({ text, style, onNav }) {
  const [pose, setPose] = useState(null);   // açık poz pop-up'ı
  if (!text) return null;
  // MARKDOWN KALIN: model çıktısı "**Senin için**" gibi işaretler içeriyordu ve
  // bunlar ekrana YILDIZLARLA basılıyordu (kullanıcı görselinde görüldü). Artık
  // ayrıştırılıp gerçekten kalın olarak çiziliyor, yıldızlar gösterilmiyor.
  // Tırnaklı terimler de ayrıştırılır: sözlükte olan yoga pozları tıklanabilir olur.
  const parts = text.split(new RegExp(
    "(\\*\\*[^*\\n]+\\*\\*|\"[^\"\\n]{2,28}\"|\\[\\[NEFES:[^\\]]+\\]\\]|\\[\\[EKRAN:[^\\]]+\\]\\]|\\d+\\s*Hz|"
    + _GLOSSARY_RE.source.slice(1, -1) + ")", "gi"));
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
        const qM = part.match(/^"([^"\n]{2,28})"$/);
        if (qM) {
          const key = _yogaKey(qM[1]);
          if (!key) return <span key={i}>{part}</span>;   // sözlükte yok → düz metin
          const pz = YOGA_POSES[key];
          return (
            <span key={i} onClick={() => setPose(key)}
              onMouseEnter={() => setPose(key)}
              title={pickLang(pz.ad, _curLang())}
              style={{ color:"#8fd6b4", cursor:"pointer", borderBottom:"1px dashed rgba(143,214,180,0.6)", fontWeight:500 }}
            >{qM[1]} ⌾</span>
          );
        }
        const boldM = part.match(/^\*\*([^*\n]+)\*\*$/);
        if (boldM) return <strong key={i} style={{ fontWeight:600, color:"#e6dcf5" }}>{boldM[1]}</strong>;
        // Sözlük terimi mi? (tam eşleşme; Hz/yoga/ekran jetonlarından sonra bakılır)
        if (part && onNav && GLOSSARY_HINTS.some(w => w.toLocaleLowerCase("tr") === part.toLocaleLowerCase("tr"))) {
          return (
            <span key={i} onClick={() => onNav("glossary", part)} title={part}
              style={{ color:"#e2b877", cursor:"pointer", borderBottom:"1px dotted rgba(226,184,119,0.55)" }}
            >{part}</span>
          );
        }
        const hzM = part.match(/^(\d+)\s*Hz$/i);
        if (hzM) {
          const hz = parseInt(hzM[1]);
          return (
            /* Kullanıcı: "frekanslara tıklanınca ilgili ses frekansları bölümüne
               gitsin, kısa ses iptal." Eskiden yerinde 2 sn'lik bir ton çalıyordu;
               artık Ses ekranına gidip o frekansı açıyor. onNav yoksa (ör. haftalık
               rapor bağlamı) hiçbir şey yapmaz — yanlışlıkla ses çalmaz. */
            <span key={i} onClick={() => onNav && onNav("freq", hz)} title={`${hz} Hz`}
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
      {/* POZ POP-UP'I — ekran değişmeden, üstte açılır. Dışına tıkla/× ile kapanır.
          Masaüstünde poz adının üstüne gelmek de açar (onMouseEnter). */}
      {pose && YOGA_POSES[pose] && (() => {
        const pz = YOGA_POSES[pose], lg = _curLang();
        return (
          <span onClick={()=>setPose(null)} style={{ position:"fixed",inset:0,zIndex:100020,background:"rgba(0,0,0,0.72)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:22 }}>
            {/* Pop-up küçültüldü (kullanıcı: "çok büyüktü"): genişlik 320→250,
                figür 210→132, iç boşluk ve yazı ölçüleri orantılı düştü. */}
            <span onClick={e=>e.stopPropagation()} style={{ display:"block",maxWidth:250,width:"100%",background:"linear-gradient(160deg,rgba(24,32,30,0.98),rgba(14,20,19,0.98))",border:"1px solid rgba(143,214,180,0.3)",borderRadius:16,padding:"14px 16px 12px",textAlign:"center",boxShadow:"0 14px 40px rgba(0,0,0,0.6)" }}>
              <span onClick={()=>setPose(null)} style={{ position:"absolute" }} />
              <span style={{ display:"block",fontSize:9.5,letterSpacing:3.5,color:"#6f9e88",textTransform:"uppercase",marginBottom:6,fontFamily:"'Jost',sans-serif" }}>YOGA</span>
              <svg viewBox="0 0 128 112" width="132" height="116" fill="none" style={{ display:"block",margin:"0 auto 8px" }} aria-hidden="true">
                {/* Zemin — figürün nereye yaslandığını gösterir, pozu okunur kılar */}
                <path d="M6 94 L122 94" stroke="rgba(143,214,180,0.28)" strokeWidth="1.4" strokeLinecap="round" />
                {/* Duvar — yalnızca "bacaklar duvarda" pozunda */}
                {pz.wall && <path d="M112 12 L112 94" stroke="rgba(143,214,180,0.28)" strokeWidth="1.4" strokeLinecap="round" />}
                {(pz.paths || []).map((d, k) => (
                  <path key={k} d={d} stroke="rgba(143,214,180,0.9)" strokeWidth="2.4"
                    strokeLinecap="round" strokeLinejoin="round" />
                ))}
                <circle cx={pz.head[0]} cy={pz.head[1]} r={pz.head[2]}
                  stroke="rgba(143,214,180,0.9)" strokeWidth="2.4" fill="rgba(10,20,16,0.9)" />
              </svg>
              <span style={{ display:"block",fontSize:14.5,fontWeight:300,letterSpacing:0.8,color:"#dff0e8",marginBottom:6,fontFamily:"'Jost',sans-serif" }}>{pickLang(pz.ad, lg)}</span>
              <span style={{ display:"block",fontSize:11.5,color:"#a8c4b8",lineHeight:1.65,marginBottom:10 }}>{pickLang(pz.aciklama, lg)}</span>
              <button onClick={()=>setPose(null)} style={{ background:"rgba(143,214,180,0.14)",border:"1px solid rgba(143,214,180,0.35)",borderRadius:18,color:"#bfe6d2",fontSize:11,letterSpacing:1.8,padding:"6px 18px",cursor:"pointer",fontFamily:"'Jost',sans-serif" }}>
                {lg === "tr" ? "KAPAT" : "CLOSE"}
              </button>
            </span>
          </span>
        );
      })()}
    </span>
  );
}

// Mobil klavye dostu doğum tarihi — GG / AA / YYYY ayrı sayısal alanlar, otomatik geçişli
function SmartDateInput({ value, onChange, lang }) {
  const t = makeTrans(lang);
  const valid = value && /^\d{4}-\d{2}-\d{2}$/.test(value);
  const [d, setD] = useState(valid ? value.slice(8,10) : "");
  const [m, setM] = useState(valid ? value.slice(5,7) : "");
  const [y, setY] = useState(valid ? value.slice(0,4) : "");
  const dRef = useRef(null), mRef = useRef(null), yRef = useRef(null);
  const emit = (dd, mm, yy) => {
    const di = parseInt(dd,10), mi = parseInt(mm,10), yi = parseInt(yy,10);
    if (dd && mm && yy.length===4 && di>=1 && di<=31 && mi>=1 && mi<=12 && yi>=1900 && yi<=2100)
      onChange(`${yy}-${String(mi).padStart(2,"0")}-${String(di).padStart(2,"0")}`);
    else onChange("");
  };
  // boş alanda backspace → önceki alana dön
  const backTo = (cur, ref) => e => { if (e.key==="Backspace" && cur==="") { e.preventDefault(); ref.current?.focus(); } };
  const cell = { fontSize:16,padding:"11px 8px",textAlign:"center",MozAppearance:"textfield" };
  return (
    <div style={{ display:"flex",alignItems:"center",gap:6 }}>
      <input ref={dRef} className="sakin-input" inputMode="numeric" pattern="[0-9]*" autoComplete="off"
        placeholder={t("date_ph_day")} value={d} maxLength={2} style={{ ...cell,width:52 }}
        onChange={e=>{ const v=e.target.value.replace(/\D/g,"").slice(0,2); setD(v); emit(v,m,y); if(v.length===2) mRef.current?.focus(); }} />
      <span style={{ color:"#555",fontSize:16 }}>/</span>
      <input ref={mRef} className="sakin-input" inputMode="numeric" pattern="[0-9]*" autoComplete="off"
        placeholder={t("date_ph_month")} value={m} maxLength={2} style={{ ...cell,width:52 }}
        onKeyDown={backTo(m, dRef)}
        onChange={e=>{ const v=e.target.value.replace(/\D/g,"").slice(0,2); setM(v); emit(d,v,y); if(v.length===2) yRef.current?.focus(); }} />
      <span style={{ color:"#555",fontSize:16 }}>/</span>
      <input ref={yRef} className="sakin-input" inputMode="numeric" pattern="[0-9]*" autoComplete="off"
        placeholder={t("date_ph_year")} value={y} maxLength={4} style={{ ...cell,flex:1,minWidth:0 }}
        onKeyDown={backTo(y, mRef)}
        onChange={e=>{ const v=e.target.value.replace(/\D/g,"").slice(0,4); setY(v); emit(d,m,v); }} />
    </div>
  );
}

// Mobil klavye dostu doğum saati — SS : DD ayrı sayısal alanlar, otomatik geçişli
function SmartTimeInput({ value, onChange, lang }) {
  const t = makeTrans(lang);
  const valid = value && /^\d{1,2}:\d{2}$/.test(value);
  const [h, setH] = useState(valid ? value.split(":")[0] : "");
  const [mn, setMn] = useState(valid ? value.split(":")[1] : "");
  const hRef = useRef(null), mnRef = useRef(null);
  const emit = (hh, mm) => {
    const hi = parseInt(hh,10), mi = parseInt(mm,10);
    if (hh && mm.length===2 && hi>=0 && hi<=23 && mi>=0 && mi<=59)
      onChange(`${String(hi).padStart(2,"0")}:${mm}`);
    else onChange("");
  };
  const cell = { fontSize:16,padding:"11px 8px",textAlign:"center",MozAppearance:"textfield" };
  return (
    <div style={{ display:"flex",alignItems:"center",gap:6 }}>
      <input ref={hRef} className="sakin-input" inputMode="numeric" pattern="[0-9]*" autoComplete="off"
        placeholder={t("time_ph_hour")} value={h} maxLength={2} style={{ ...cell,width:64 }}
        onChange={e=>{ const v=e.target.value.replace(/\D/g,"").slice(0,2); setH(v); emit(v,mn); if(v.length===2) mnRef.current?.focus(); }} />
      <span style={{ color:"#555",fontSize:16 }}>:</span>
      <input ref={mnRef} className="sakin-input" inputMode="numeric" pattern="[0-9]*" autoComplete="off"
        placeholder={t("time_ph_min")} value={mn} maxLength={2} style={{ ...cell,width:64 }}
        onKeyDown={e=>{ if(e.key==="Backspace" && mn==="") { e.preventDefault(); hRef.current?.focus(); } }}
        onChange={e=>{ const v=e.target.value.replace(/\D/g,"").slice(0,2); setMn(v); emit(h,v); }} />
    </div>
  );
}

// Doğum şehri — <datalist> iOS WKWebView'da dropdown göstermediği için özel öneri listesi.
// Yazınca il/şehir önerileri açılır, dokunarak seçilir; tanınan şehirde ✓ gösterilir.
// Büyük dünya şehri DB'si (~36k satır) dinamik import() ile odaklanma anında yüklenir.
function SmartCityInput({ value, onChange, lang }) {
  const t = makeTrans(lang);
  const [focused, setFocused] = useState(false);
  // bigReady state, büyük DB yüklendiğinde yeniden render tetikler.
  const [bigReady, setBigReady] = useState(isCitiesLoaded());
  useEffect(() => {
    if (bigReady) return;
    let alive = true;
    ensureCitiesLoaded().then(() => { if (alive) setBigReady(isCitiesLoaded()); });
    return () => { alive = false; };
  }, [bigReady]);
  const q = normalizeCity(value);
  const cap = s => s.split(" ").map(w => (w ? w.charAt(0).toLocaleUpperCase("tr") + w.slice(1) : w)).join(" ");
  // Eşleşmeler: önce yerleşik küçük DB (hızlı, hatasız), sonra büyük DB'den ek öneriler.
  let matches = [];
  if (q.length >= 1) {
    const small = CITY_NAMES.filter(n => n.startsWith(q))
      .concat(CITY_NAMES.filter(n => !n.startsWith(q) && n.includes(q)));
    const big = bigReady ? findCityMatches(q, 12) : [];
    const seen = new Set();
    for (const n of [...small, ...big]) {
      if (!seen.has(n)) { seen.add(n); matches.push(n); }
      if (matches.length >= 8) break;
    }
  }
  const recognized = !!value && (!!CITY_DB[q] || (bigReady && !!lookupCityBig(q)));
  const showList = focused && matches.length > 0 && !(matches.length === 1 && recognized);
  return (
    <div style={{ position:"relative" }}>
      <input type="text" className="sakin-input"
        autoComplete="off" autoCorrect="off" autoCapitalize="words" spellCheck={false}
        placeholder={t("city_ph")}
        style={{ fontSize:14,padding:"10px 34px 10px 12px",width:"100%",boxSizing:"border-box" }}
        value={value}
        onChange={e=>onChange(e.target.value)}
        onFocus={()=>setFocused(true)}
        onBlur={()=>setTimeout(()=>setFocused(false), 160)} />
      {recognized && (
        <span style={{ position:"absolute",right:12,top:"22px",transform:"translateY(-50%)",color:"#7ec699",fontSize:15,pointerEvents:"none" }}>✓</span>
      )}
      {showList && (
        <div style={{ position:"absolute",top:"calc(100% + 4px)",left:0,right:0,zIndex:30,
          background:"rgba(15,10,25,0.98)",backdropFilter:"blur(20px)",
          border:"1px solid rgba(184,164,216,0.25)",borderRadius:12,overflow:"hidden",
          boxShadow:"0 12px 32px rgba(0,0,0,0.6)",maxHeight:228,overflowY:"auto" }}>
          {matches.map(n => {
            const label = cap(n);
            return (
              <button key={n} type="button"
                onPointerDown={e=>{ e.preventDefault(); onChange(label); setFocused(false); }}
                style={{ display:"block",width:"100%",textAlign:"left",background:"transparent",
                  border:"none",borderBottom:"1px solid rgba(255,255,255,0.05)",
                  padding:"11px 14px",color:"#d8c8f0",fontSize:14,cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>
                {label}
              </button>
            );
          })}
        </div>
      )}
      {!recognized && value && value.trim().length >= 2 && matches.length === 0 && (
        <div style={{ fontSize:11,color:"#9a8aae",marginTop:5,fontFamily:"'Jost',sans-serif",letterSpacing:0.5,lineHeight:1.4 }}>
          {t("city_not_in_list")}
        </div>
      )}
    </div>
  );
}

// LangPicker — giris-screen ile aynı tasarım, tüm dil değiştirme yüzeylerinde paylaşılır
function LangPicker({ lang, setLang, compact = false }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const cur = LANGUAGES.find(l => l.code === lang)?.label || lang.toUpperCase();
  // Dropdown'u position:fixed olarak aç. Yatayda buton merkezine hizala +
  // viewport kenarlarından clamp et (dar telefonlarda taşmasın). Dikeyde
  // aşağıda yer varsa aşağı, yoksa yukarı aç. maxHeight ekrana göre dinamik
  // — 7 dil + safe-area + alt çıkıntı olan ekranlarda da hepsi görünür.
  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const vw = window.innerWidth, vh = window.innerHeight;
      const W = 112;                       // dropdown tahmini genişlik
      const H = LANGUAGES.length * 38 + 18; // dropdown tahmini yükseklik
      const PAD = 10;
      // Yatay: buton merkezine hizala, kenarlardan clamp
      const left = Math.max(PAD, Math.min(vw - W - PAD, r.left + r.width/2 - W/2));
      // Dikey: aşağı/yukarı tercih
      const below = vh - r.bottom - PAD;
      const above = r.top - PAD;
      const openDown = below >= H || below >= above;
      const maxH = Math.max(140, openDown ? below : above);
      const top = openDown ? r.bottom + 6 : Math.max(PAD, r.top - 6 - Math.min(H, maxH));
      setPos({ top, left, maxHeight: maxH, width: W });
    }
    setOpen(o => !o);
  };
  return (
    <div style={{ position:"relative" }}>
      <button ref={btnRef} onClick={toggle}
        style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.18)", borderRadius:20, padding: compact ? "5px 11px" : "6px 14px", color:"#ddd", fontSize:13, letterSpacing:1.5, cursor:"pointer", fontFamily:"'Jost',sans-serif", fontWeight:400, minWidth: compact ? 56 : 64, minHeight:44, display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6 }}>
        <span>{cur}</span>
        <span style={{ fontSize:9, opacity:0.7, transform: open ? "rotate(180deg)" : "none", transition:"transform 0.2s" }}>▾</span>
      </button>
      {open && pos && createPortal(
        <>
          <div onClick={()=>setOpen(false)} style={{ position:"fixed", inset:0, zIndex:100000 }} />
          <div style={{ position:"fixed", top:pos.top, left:pos.left, width:pos.width, zIndex:100001, background:"rgba(15,10,25,0.97)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.14)", borderRadius:14, padding:6, display:"flex", flexDirection:"column", gap:2, boxShadow:"0 12px 32px rgba(0,0,0,0.6)", maxHeight:pos.maxHeight, overflowY:"auto" }}>
            {LANGUAGES.map(l => (
              <button key={l.code}
                onClick={()=>{ setLang(l.code); localStorage.setItem("sakin_lang", l.code); setOpen(false); }}
                style={{ background: lang===l.code ? "rgba(184,164,216,0.18)" : "transparent", border:"none", borderRadius:8, padding:"9px 16px", color: lang===l.code ? "#fff" : "#aaa", fontSize:13, letterSpacing:1.5, cursor:"pointer", fontFamily:"'Jost',sans-serif", fontWeight:400, textAlign:"center", whiteSpace:"nowrap" }}>
                {l.label}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}


// Yolculuk haritası — 10 adım (hakkinda > yolculuk sekmesi). Host dilinde gösterilir.
// 7 Ayna Geçidi · 9 Bağlantı · 10 Sakin Ailesi sonradan eklenen adımlardır.
const JOURNEY_STEPS = [
  { icon:"🌅", color:"#f0a060",
    title:{tr:"1 · Sabah Niyeti",en:"1 · Morning Intention",de:"1 · Morgenabsicht",es:"1 · Intención matutina",pt:"1 · Intenção da manhã",fr:"1 · Intention du matin",ja:"1 · 朝の意図"},
    desc:{tr:"Güne bir niyetle başla. Seçtiğin 3 kelime ve cümlen — günün enerjisini sen belirlersin.",en:"Start the day with an intention. Three words and a sentence — you set the day's energy.",de:"Beginne den Tag mit einer Absicht. Drei Wörter und ein Satz — du bestimmst die Energie des Tages.",es:"Comienza el día con una intención. Tres palabras y una frase: tú defines la energía del día.",pt:"Comece o dia com uma intenção. Três palavras e uma frase — você define a energia do dia.",fr:"Commence la journée avec une intention. Trois mots et une phrase — c'est toi qui fixes l'énergie du jour.",ja:"一日を意図とともに始めよう。3つの言葉と一文——その日のエネルギーはあなたが決める。"} },
  { icon:"🫧", color:"#60b8e8",
    title:{tr:"2 · Nefes",en:"2 · Breath",de:"2 · Atem",es:"2 · Respiración",pt:"2 · Respiração",fr:"2 · Respiration",ja:"2 · 呼吸"},
    desc:{tr:"Bedene dön. Birkaç nefesle zihni yavaşlat, ritmini bul.",en:"Return to the body. Slow the mind with a few breaths, find your rhythm.",de:"Kehre zum Körper zurück. Verlangsame den Geist mit ein paar Atemzügen, finde deinen Rhythmus.",es:"Vuelve al cuerpo. Calma la mente con unas respiraciones, encuentra tu ritmo.",pt:"Volte ao corpo. Acalme a mente com algumas respirações, encontre o seu ritmo.",fr:"Reviens au corps. Ralentis l'esprit en quelques respirations, trouve ton rythme.",ja:"体に戻ろう。数回の呼吸で心を緩め、自分のリズムを見つける。"} },
  { icon:"🔊", color:"#a07ae0",
    title:{tr:"3 · Ses Frekansları",en:"3 · Sound Frequencies",de:"3 · Klangfrequenzen",es:"3 · Frecuencias de sonido",pt:"3 · Frequências sonoras",fr:"3 · Fréquences sonores",ja:"3 · 音の周波数"},
    desc:{tr:"Solfeggio frekanslarıyla kendini akort et. Kuş sesleri eşliğinde içsel diyapazon yeniden hizalanır.",en:"Tune yourself with solfeggio frequencies. With birdsong, your inner pitch realigns.",de:"Stimme dich mit Solfeggio-Frequenzen. Mit Vogelgesang richtet sich deine innere Tonlage neu aus.",es:"Afínate con frecuencias solfeggio. Con el canto de los pájaros, tu tono interior se realinea.",pt:"Afine-se com frequências solfeggio. Com o canto dos pássaros, o seu tom interior se realinha.",fr:"Accorde-toi aux fréquences solfeggio. Avec le chant des oiseaux, ton diapason intérieur se réaligne.",ja:"ソルフェジオ周波数で自分を調律する。鳥のさえずりとともに、内なる音程が整い直す。"} },
  { icon:"💜", color:"#b87adc",
    title:{tr:"4 · Çakra Şifası",en:"4 · Chakra Healing",de:"4 · Chakra-Heilung",es:"4 · Sanación de chakras",pt:"4 · Cura dos chakras",fr:"4 · Guérison des chakras",ja:"4 · チャクラの癒し"},
    desc:{tr:"Niyetinle enerjiyi yönlendir. Elini bölgeye değdir, gözlerini yum — çakralarına şifa akar.",en:"Direct energy with intention. Place your hand, close your eyes — healing flows into your chakras.",de:"Lenke Energie mit Absicht. Lege die Hand auf, schließe die Augen — Heilung fließt in deine Chakren.",es:"Dirige la energía con intención. Pon la mano, cierra los ojos: la sanación fluye a tus chakras.",pt:"Direcione a energia com intenção. Ponha a mão, feche os olhos — a cura flui para os seus chakras.",fr:"Dirige l'énergie avec intention. Pose la main, ferme les yeux — la guérison coule vers tes chakras.",ja:"意図でエネルギーを導く。手を当て、目を閉じる——癒しがチャクラへと流れ込む。"} },
  { icon:"☀️", color:"#e8d060",
    title:{tr:"5 · Gün Hatırlatmaları",en:"5 · Daily Reminders",de:"5 · Tägliche Erinnerungen",es:"5 · Recordatorios diarios",pt:"5 · Lembretes do dia",fr:"5 · Rappels du jour",ja:"5 · 日中のリマインダー"},
    desc:{tr:"Su iç. Güneşi hisset. Toprağa dokun. Küçük dokunuşlar seni ana bağlar — anda kalırsın.",en:"Drink water. Feel the sun. Touch the earth. Small touches return you to the present.",de:"Trink Wasser. Spüre die Sonne. Berühre die Erde. Kleine Berührungen holen dich in den Augenblick.",es:"Bebe agua. Siente el sol. Toca la tierra. Pequeños gestos te devuelven al presente.",pt:"Beba água. Sinta o sol. Toque a terra. Pequenos gestos trazem você de volta ao presente.",fr:"Bois de l'eau. Sens le soleil. Touche la terre. De petits gestes te ramènent à l'instant.",ja:"水を飲む。陽を感じる。大地に触れる。小さな仕草があなたを「今」に戻す。"} },
  { icon:"🌙", color:"#7ab0e0",
    title:{tr:"6 · Akşam Kapanışı",en:"6 · Evening Closure",de:"6 · Abendabschluss",es:"6 · Cierre nocturno",pt:"6 · Encerramento da noite",fr:"6 · Clôture du soir",ja:"6 · 夜の締めくくり"},
    desc:{tr:"Z raporunu al, zihninin geçici belleğini temizle ve yeni güne hazır ol.",en:"Get your Z-report, clear your mind's working memory and prepare for a new day.",de:"Hol dir deinen Z-Bericht, leere den Arbeitsspeicher deines Geistes und mach dich bereit für einen neuen Tag.",es:"Recibe tu informe Z, vacía la memoria de trabajo de tu mente y prepárate para un nuevo día.",pt:"Receba o seu relatório Z, limpe a memória de trabalho da mente e prepare-se para um novo dia.",fr:"Reçois ton rapport Z, vide la mémoire vive de ton esprit et prépare-toi à un nouveau jour.",ja:"Zレポートを受け取り、心の作業記憶を空にして、新しい一日に備えよう。"} },
  { icon:"☽", color:"#c8b0e8",
    title:{tr:"7 · Ayna Geçidi",en:"7 · Mirror Portal",de:"7 · Spiegel-Portal",es:"7 · Portal del espejo",pt:"7 · Portal do espelho",fr:"7 · Portail du miroir",ja:"7 · 鏡の門"},
    desc:{tr:"Sağ kenardaki gizemli geçidi bul. İçeri gir, içsel aynana sorular sor — bedenin de bir mesaj taşır.",en:"Find the mysterious portal at the right edge. Step in, ask your inner mirror — your body carries a message too.",de:"Finde das geheimnisvolle Portal am rechten Rand. Tritt ein, frage deinen inneren Spiegel — auch dein Körper trägt eine Botschaft.",es:"Encuentra el portal misterioso del borde derecho. Entra, pregunta a tu espejo interior: tu cuerpo también lleva un mensaje.",pt:"Encontre o portal misterioso na borda direita. Entre, pergunte ao seu espelho interior — o seu corpo também traz uma mensagem.",fr:"Trouve le portail mystérieux au bord droit. Entre, interroge ton miroir intérieur — ton corps porte aussi un message.",ja:"右端の神秘の門を見つけよう。中へ入り、内なる鏡に問いかける——体もまたメッセージを運んでいる。"} },
  { icon:"✦", color:"#82d9a3",
    title:{tr:"8 · Haftalık Rapor",en:"8 · Weekly Report",de:"8 · Wochenbericht",es:"8 · Informe semanal",pt:"8 · Relatório semanal",fr:"8 · Rapport hebdomadaire",ja:"8 · 週間レポート"},
    desc:{tr:"AI destekli haftalık iç haritan: çakra örüntüleri, niyet kelimeleri, biyoritim. Kendinle bağını derinleştir.",en:"Your AI-powered weekly inner map: chakra patterns, intention words, biorhythm. Deepen the bond with yourself.",de:"Deine KI-gestützte wöchentliche innere Karte: Chakra-Muster, Absichtswörter, Biorhythmus. Vertiefe die Bindung zu dir selbst.",es:"Tu mapa interior semanal con IA: patrones de chakras, palabras de intención, biorritmo. Profundiza el vínculo contigo mismo.",pt:"Seu mapa interior semanal com IA: padrões de chakra, palavras de intenção, biorritmo. Aprofunde o vínculo consigo mesmo.",fr:"Ta carte intérieure hebdomadaire assistée par IA : motifs des chakras, mots d'intention, biorythme. Approfondis le lien avec toi-même.",ja:"AIによる週間の内なる地図：チャクラのパターン、意図の言葉、バイオリズム。自分とのつながりを深めよう。"} },
  { icon:"◎", color:"#b87adc",
    title:{tr:"9 · Bağlantı",en:"9 · Connection",de:"9 · Verbindung",es:"9 · Conexión",pt:"9 · Conexão",fr:"9 · Connexion",ja:"9 · つながり"},
    desc:{tr:"Sakin'i kullandıkça gün içinde kaynak enerjisiyle bağlantını güçlendirirsin — her dokunuş seni özüne yaklaştırır.",en:"As you use Sakin through the day, you strengthen your connection to source energy — each touch draws you closer to your essence.",de:"Während du Sakin im Laufe des Tages nutzt, stärkst du deine Verbindung zur Quellenergie — jede Berührung bringt dich deinem Wesen näher.",es:"A medida que usas Sakin durante el día, fortaleces tu conexión con la energía fuente: cada gesto te acerca a tu esencia.",pt:"À medida que usa o Sakin ao longo do dia, fortalece a conexão com a energia fonte — cada toque o aproxima da sua essência.",fr:"À mesure que tu utilises Sakin au fil du jour, tu renforces ta connexion à l'énergie source — chaque contact te rapproche de ton essence.",ja:"一日を通してSakinを使うほど、源のエネルギーとのつながりが強まる——一つひとつの触れ合いが、あなたを本質へと近づける。"} },
  { icon:"✧", color:"#f0c060",
    title:{tr:"10 · Sakin Ailesi",en:"10 · Sakin Family",de:"10 · Sakin-Familie",es:"10 · Familia Sakin",pt:"10 · Família Sakin",fr:"10 · Famille Sakin",ja:"10 · Sakinファミリー"},
    desc:{tr:"Rüyanda ya da gerçekte sana ısrarla görünen rehber hayvan, bitki ve kristallerin sana ne söylediğini; yaşam planında hangi arketip senaryosunun içinde olduğunu; ve tasarımının sırlarını keşfet.",en:"Discover what the guide animals, plants and crystals that keep appearing to you — in dreams or waking life — are telling you; which archetypal scenario you're living in your life plan; and the secrets of your design.",de:"Entdecke, was dir die Tier-, Pflanzen- und Kristallführer sagen, die dir immer wieder erscheinen — im Traum oder im Wachen; in welchem archetypischen Szenario deines Lebensplans du dich befindest; und die Geheimnisse deines Designs.",es:"Descubre qué te dicen los animales, plantas y cristales guía que aparecen una y otra vez —en sueños o despierto—; en qué escenario arquetípico vives dentro de tu plan de vida; y los secretos de tu diseño.",pt:"Descubra o que dizem os animais, plantas e cristais guia que insistem em aparecer — em sonho ou na vida desperta; em qual cenário arquetípico você vive no seu plano de vida; e os segredos do seu design.",fr:"Découvre ce que te disent les animaux, plantes et cristaux guides qui ne cessent de t'apparaître — en rêve ou éveillé ; dans quel scénario archétypal de ton plan de vie tu te trouves ; et les secrets de ton design.",ja:"夢でも現実でも繰り返し現れる導きの動物・植物・クリスタルが何を告げているのか、人生の計画の中でどの元型のシナリオを生きているのか、そしてあなたのデザインの秘密を発見しよう。"} },
];

export default function SakinApp() {
  const [lang, setLang] = useState(() => { const v = localStorage.getItem("sakin_lang") || "en"; return v === "pt-BR" ? "pt" : v; });
  const [langOpen, setLangOpen] = useState(false);
  // ── MATRIX MODU (deneysel) — efekt katmanı: yeşil tint + kod yağmuru + monospace.
  // Tüm UI'yı tek tek elden geçirmeden uygular. Sakin Ailesi paneli + embed app'ler
  // kapsam DIŞI (aşağıda overlay onlarda gizlenir).
  // Matrix modu ARŞİVDE — ◐ toggle artık AÇIK TEMAYI değiştiriyor (kullanıcı kararı).
  // Kod (MatrixRain + CSS) durur; istenirse 1.3.0'da 3-yönlü toggle ile geri gelir.
  const [matrixMode] = useState(false);
  // AÇIK TEMA (Sprint 2) — ◐ ile koyu ⇄ açık. backdrop-filter invert+hue-rotate:
  // koyu arayüzü krem/açık tona çevirir, renk tonları korunur (referans: krem+mor+bakır).
  const [lightMode, setLightMode] = useState(() => {
    try { localStorage.removeItem("sakin_matrix"); return localStorage.getItem("sakin_theme") === "light"; } catch { return false; }
  });
  const toggleTheme = () => setLightMode(v => { const n = !v; try { localStorage.setItem("sakin_theme", n ? "light" : "dark"); } catch {} return n; });
  const t = makeTrans(lang);
  // <html lang> aktif dile eşitlenir — index.html'de sabit lang="tr" kalınca CSS
  // text-transform:uppercase İngilizce metinde Türkçe İ üretiyordu ("TAKE İT WİTH YOU").
  useEffect(() => { try { document.documentElement.lang = lang; } catch (_) {} }, [lang]);

  // ── iOS Safari ses kurtarma ─────────────────────────────────────────────────
  // Uygulama arka plandan dönünce / kullanıcı tekrar dokununca TÜM kayıtlı
  // AudioContext'leri resume et. iOS resume'u çoğu zaman bir user-gesture içinde
  // kabul ettiği için pointerdown'ı da dinleriz (capture, pasif). Aksi halde uzun
  // seans sonrası geçiş efektleri + frekans tonları sessiz kalıyor.
  useEffect(() => {
    const onVisible = () => { if (!document.hidden) __resumeAllAudio(); };
    const onGesture = () => { __resumeAllAudio(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onVisible);       // iOS BFCache dönüşü
    window.addEventListener("focus", onVisible);
    window.addEventListener("pointerdown", onGesture, { capture: true, passive: true });
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onVisible);
      window.removeEventListener("focus", onVisible);
      window.removeEventListener("pointerdown", onGesture, { capture: true });
    };
  }, []);
  const [tabletMode, setTabletMode] = useState(detectTablet);
  useEffect(() => {
    const onResize = () => { const v = detectTablet(); isTablet = v; setTabletMode(v); };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => { window.removeEventListener("resize", onResize); window.removeEventListener("orientationchange", onResize); };
  }, []);
  // Kayıtlı doğum şehri varsa büyük şehir DB'sini eager yükle ki
  // preciseAscendant (Köln, Marsilya gibi yerleşik küçük DB'de olmayan şehirler için)
  // yeniden hesaplanabilsin. Yükleme tamamlanınca _citiesTick state'i artar ve yeniden render olur.
  const [_citiesTick, _setCitiesTick] = useState(0);
  useEffect(() => {
    const saved = localStorage.getItem("sakin_birth_city");
    if (!saved) return;
    let alive = true;
    ensureCitiesLoaded().then(() => { if (alive) _setCitiesTick(t => t + 1); });
    return () => { alive = false; };
  }, []);
  const CHAKRAS_7 = getChakras7(lang);
  const URL_TO_SCREEN = { "/hakkinda":"hakkinda", "/fiyatlandirma":"fiyat", "/hizmet-sartlari":"sartlar", "/gizlilik":"gizlilik", "/iade-politikasi":"iade" };
  const SCREEN_TO_URL = { hakkinda:"/hakkinda", fiyat:"/fiyatlandirma", sartlar:"/hizmet-sartlari", gizlilik:"/gizlilik", iade:"/iade-politikasi" };
  const [screen,        setScreenRaw]     = useState(()=> URL_TO_SCREEN[window.location.pathname] || "giris");
  const screenHistoryRef = useRef([URL_TO_SCREEN[window.location.pathname] || "giris"]);
  const isPopRef = useRef(false);
  // ── TEK GERİ MANTIĞI ───────────────────────────────────────────────────────
  // Kullanıcı: "geri tuşu her zaman geldiğin yere dönsün; örn. Ayna → Çakra →
  // geri = Ayna. Tüm program için bu mantığı uygula, web sitesi gibi olsun."
  // KÖK SEBEP: geri butonları SABİT hedefe gidiyordu (terapi → hep "chakra",
  // gün → hep "sabah"). Ekran geçişleri zaten history'ye pushlanıyor; artık
  // geri butonu geçmişte BİR ÖNCEKİ ekrana döner. Geçmiş yoksa (uygulamaya
  // doğrudan o ekrandan girilmişse) fallback kullanılır.
  const goBack = (fallback = "sabah") => {
    if (screenHistoryRef.current.length > 1) { history.back(); return; }
    setScreen(fallback);
  };
  const setScreen = (s) => {
    setScreenRaw(s);
    if (!isPopRef.current) {
      screenHistoryRef.current.push(s);
      const url = SCREEN_TO_URL[s] || "/";
      history.pushState({ screen: s }, "", url);
    }
    isPopRef.current = false;
  };
  const [niyet,         setNiyet]         = useState(()=>localStorage.getItem("sakin_niyet_"+sakinDayKey())||"");
  const [selectedWords, setSelectedWords] = useState(()=>{ try { return JSON.parse(localStorage.getItem("sakin_words_"+sakinDayKey()))||[]; } catch { return []; } });
  const [breathPhase,   setBreathPhase]   = useState("ready");
  const [breathCount,   setBreathCount]   = useState(()=>{ try { return parseInt(localStorage.getItem("sakin_breath_"+sakinDayKey()))||0; } catch { return 0; } });
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
  // Sessizlik keepalive — iOS WKWebView Web Audio'yu (oscillator) arka planda askıya alır.
  // Çalan bir HTMLAudioElement varsa AVAudioSession.playback rotası açık kalır,
  // bu da Web Audio'nun arka planda çalmaya devam etmesini sağlar.
  // Dosya: public/silence.wav (3 sn, 8kHz mono PCM ~47KB, ses dosyasında gerçek sıfır örnekler).
  const silenceAudioRef = useRef(null);
  const lastFreqHzRef = useRef(null);
  const lastFreqLabelRef = useRef("");
  const startSilenceKeepAlive = () => {
    try {
      // Tercih: DOM'daki <audio> elementi (preload önceden tamamlanmış olur);
      // değilse on-the-fly Audio() ile yedek.
      const dom = (typeof document !== "undefined") && document.getElementById("sakin-silence-loop");
      if (dom) {
        const p = dom.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
        silenceAudioRef.current = dom;
        return;
      }
      if (!silenceAudioRef.current) {
        const a = new Audio("/silence.wav");
        a.loop = true;
        a.volume = 0.05; // iOS bazen <0.02'i "sessiz" sayıp AVAudioSession'ı bırakır; 0.05 güvenli
        a.preload = "auto";
        silenceAudioRef.current = a;
      }
      const p = silenceAudioRef.current.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch (_) {}
  };
  const stopSilenceKeepAlive = () => {
    try {
      if (silenceAudioRef.current) {
        silenceAudioRef.current.pause();
        silenceAudioRef.current.currentTime = 0;
      }
    } catch (_) {}
  };
  // ── Ses watchdog (iOS + web): "bir süre sonra ses kapanıyor" düzeltmesi ──
  // Uzun seansta iOS WKWebView/Safari AudioContext'i sistem kesintisiyle (başka ses,
  // güç tasarrufu, kısa interrupt) askıya alabiliyor VE silence.wav keepalive loop'u
  // durabiliyor — visibilitychange tetiklenmediği için resume listener'ları yetmiyor,
  // ses geri gelmiyor. Tone çalarken (playingHz set) her 2.5sn:
  //   1) askıdaki TÜM AudioContext'leri resume et,
  //   2) durmuş silence keepalive'ı yeniden başlat (AVAudioSession rotası açık kalsın),
  //   3) durmuş kuş sesini yeniden başlat.
  // SADECE çalarken aktif (playingHz null olunca interval temizlenir) → kullanıcının
  // durdurduğu sesi geri açmaz. AppDelegate/AVAudioSession'a DOKUNMAZ — saf web katmanı.
  useEffect(() => {
    if (!playingHz) return;
    const id = setInterval(() => {
      try {
        __resumeAllAudio();
        const s = silenceAudioRef.current;
        if (s && s.paused) { const p = s.play(); if (p && p.catch) p.catch(() => {}); }
        const b = birdAudioRef.current;
        if (b && b.paused) { const p = b.play(); if (p && p.catch) p.catch(() => {}); }
      } catch (_) {}
    }, 2500);
    return () => clearInterval(id);
  }, [playingHz]);
  const BIRD_EXT = { guguk:"mp3", bulbul:"mp3", dove:"mp3", kanarya:"mp3", otlegen:"mp3", baykus:"mp3", kartal:"mp3", yedek:"mp3" };
  // Kuş sesi geçişleri YUMUŞAK (kullanıcı: "looplar arası sert geçiş var, kuş sesi
  // aniden kesiliyor"). Eskiden pause() ile anında kesiliyor, tam sesle başlıyordu.
  // Artık çıkışta ~550ms fade-out, girişte ~900ms fade-in uygulanıyor.
  const birdFadeRef = useRef(null);
  const birdLoopRef = useRef(null);   // gapless loop zamanlayıcısı
  const birdPairRef = useRef([]);     // çapraz geçiş için ikinci ses elemanı
  const stopBirdSound = () => {
    const a = birdAudioRef.current;
    birdAudioRef.current = null;
    if (birdFadeRef.current) { clearInterval(birdFadeRef.current); birdFadeRef.current = null; }
    if (birdLoopRef.current) { clearInterval(birdLoopRef.current); birdLoopRef.current = null; }
    // Çapraz geçişte kullanılan diğer eleman(lar) da yumuşakça sussun
    const others = birdPairRef.current.filter(x => x && x !== a);
    birdPairRef.current = [];
    const fadeOut = (el) => {
      if (!el) return;
      const start = el.volume, steps = 22, dt = 25;
      let i = 0;
      const iv = setInterval(() => {
        i++;
        try { el.volume = Math.max(0, start * (1 - i / steps)); } catch(_) {}
        if (i >= steps) { clearInterval(iv); try { el.pause(); el.currentTime = 0; } catch(_) {} }
      }, dt);
    };
    fadeOut(a);
    others.forEach(fadeOut);
  };
  // Kuş sesi ARKA PLAN eşlikçisidir — asıl olan solfeggio frekansı (kullanıcı:
  // "kuş seslerini biraz daha kıs, çok baskın; önemli olan solfeggio frekansları").
  // Varsayılan ses 0.22 → 0.10 (yaklaşık yarısı) → 0.06.
  // CIZIRTI ARA ÇÖZÜMÜ: kaynak dosyalar 22 kHz / 64 kbps mono MP3; kuş cıvıltısı
  // geniş bantlı olduğu için bu bitrate'te bandın İÇİNE gömülü kodlama artefaktı
  // üretiyor. Ölçüldü: 9 kHz üstü enerji zaten -65..-70 dB, yani yüksek frekans
  // tıslaması DEĞİL — filtreyle temizlenemiyor (denoise denendi, telafi kazancı
  // artefaktı geri yükseltti). Kalıcı çözüm kayıtları yüksek kalitede yeniden
  // temin etmek; o gelene kadar seviye düşürülerek artefakt maskeleniyor.
  // KUŞ BAŞINA KISMA (kullanıcı: "cızırtı belirgin ses dosyasının sesini alçalt").
  // Dosyalar 22 kHz / 64 kbps MP3; bazılarında gürültü tabanı sinyale çok yakın,
  // yüksek çalınca kodlama artefaktı ("cızırtı") duyuluyor. Ölçülen ortalama/tepe
  // seviyeye göre en sorunlular kısılıyor — SES DOSYALARINA DOKUNULMADI, yalnızca
  // çalma seviyesi düştü. Kalıcı çözüm daha yüksek kaliteli kayıt (ayrı iş).
  //   yedek   : ort -43.2 / tepe -22.0 dB — ölçümdeki en gürültülü dosya
  //   otlegen : ort -55.9 / tepe -24.0 dB
  //   guguk   : ort -41.3 / tepe -22.3 dB
  //   kartal  : ort -39.2 / tepe  -7.7 dB
  const BIRD_TRIM = { yedek: 0.55, otlegen: 0.6, guguk: 0.7, kartal: 0.85 };
  const playBirdSound = (birdKey, vol = 0.06) => {
    stopBirdSound();
    if (!birdKey || !BIRD_EXT[birdKey]) return;
    vol = vol * (BIRD_TRIM[birdKey] ?? 1);
    const src = `/sounds/birds/${birdKey}.${BIRD_EXT[birdKey]}`;
    // GAPLESS LOOP: audio.loop=true kullanılırsa dosya başa sararken duyulur bir
    // "tık"/kopukluk oluyordu (kullanıcı: "kuş sesleri aniden kesiliyor, tık sesi
    // var; örn. toprak frekansı"). Çözüm: İKİ ses elemanı arasında çapraz geçiş —
    // biri bitmeden ~1.2 sn önce diğeri sessizden başlar, ilki söner. Dikiş duyulmaz.
    const XF = 1.2;                          // çapraz geçiş süresi (sn)
    const mk = () => { const el = new Audio(src); el.loop = false; el.volume = 0; el.preload = "auto"; return el; };
    const a1 = mk();
    birdAudioRef.current = a1;
    birdPairRef.current = [a1];
    a1.play().catch(() => {});
    // Giriş fade-in (~900ms)
    if (birdFadeRef.current) { clearInterval(birdFadeRef.current); birdFadeRef.current = null; }
    const steps = 30, dt = 30;
    let i = 0;
    birdFadeRef.current = setInterval(() => {
      i++;
      if (birdAudioRef.current !== a1) { clearInterval(birdFadeRef.current); birdFadeRef.current = null; return; }
      try { a1.volume = Math.min(vol, vol * (i / steps)); } catch(_) {}
      if (i >= steps) { clearInterval(birdFadeRef.current); birdFadeRef.current = null; }
    }, dt);
    // Çapraz geçişli döngü: aktif elemanın bitimine XF kalınca yenisini başlat.
    let active = a1, swapping = false;
    if (birdLoopRef.current) { clearInterval(birdLoopRef.current); }
    birdLoopRef.current = setInterval(() => {
      if (!birdAudioRef.current) { clearInterval(birdLoopRef.current); birdLoopRef.current = null; return; }
      const d = active.duration;
      if (!isFinite(d) || d <= 0 || swapping) return;
      if (active.currentTime < d - XF) return;
      swapping = true;
      const next = mk();
      birdPairRef.current = [active, next];
      next.play().catch(() => {});
      const st = 24, sdt = (XF * 1000) / st;
      let k = 0;
      const prev = active;
      const xf = setInterval(() => {
        k++;
        const r = Math.min(1, k / st);
        try { next.volume = vol * r; } catch(_) {}
        try { prev.volume = vol * (1 - r); } catch(_) {}
        if (r >= 1) {
          clearInterval(xf);
          try { prev.pause(); prev.currentTime = 0; } catch(_) {}
          active = next;
          birdAudioRef.current = next;      // keepalive/duraklama kontrolleri yenisini görsün
          birdPairRef.current = [next];
          swapping = false;
        }
      }, sdt);
    }, 200);
  };
  const stopFreqToneGlobal = () => {
    if (freqGainRef.current && freqCtxRef.current) {
      try { freqGainRef.current.gain.linearRampToValueAtTime(0, freqCtxRef.current.currentTime + 0.3); } catch(_) {}
    }
    const _gain = freqGainRef.current;
    setTimeout(() => {
      freqOscsRef.current.forEach(o => { try { o.stop(); } catch(_) {} try { o.disconnect(); } catch(_) {} });
      freqOscsRef.current = [];
      try { freqOscRef.current?.stop(); } catch(_) {}
      try { _gain?.disconnect(); } catch(_) {} // LFO artığı takılı kalmasın
      freqOscRef.current = null; freqGainRef.current = null;
      // freqCtxRef'i close etmiyoruz — iOS WKWebView yeniden açmaya izin vermez.
    }, 350);
    stopBirdSound();
    stopSilenceKeepAlive();
    clearNowPlaying();
    setPlayingHz(null); setActiveFreq(null);
  };
  const [freqListenSec, setFreqListenSec] = useState(() => {
    // BUG DÜZELTMESİ: burada `todayKey` kullanılıyordu ama o değişken bu satırdan
    // ~500 satır SONRA tanımlı → initializer render sırasında çalıştığı için TDZ
    // ReferenceError atıyor, try/catch bunu yutup HER ZAMAN 0 döndürüyordu. Yani
    // kayıtlı dinleme süresi hiç geri yüklenmiyordu (ekrandan çıkıp dönünce sıfırlanır,
    // ve "1 dk ses" bağlantı şartı asla sağlanamazdı). Tarih inline hesaplanıyor.
    try { return parseInt(localStorage.getItem("sakin_freq_sec_" + sakinDayKey())) || 0; } catch { return 0; }
  });
  const freqTimerRef = useRef(null);
  useEffect(() => {
    if (playingHz) {
      freqTimerRef.current = setInterval(() => {
        setFreqListenSec(prev => {
          const next = prev + 1;
          // Gün anahtarı ANLIK hesaplanır: dinleme gece yarısını geçerse sayaç
          // eski güne değil, doğru güne yazılır (todayKey closure'ı bayat kalırdı).
          localStorage.setItem("sakin_freq_sec_" + sakinDayKey(), String(next));
          return next;
        });
      }, 1000);
    } else {
      clearInterval(freqTimerRef.current);
    }
    return () => clearInterval(freqTimerRef.current);
  }, [playingHz]);
  const [aksamNote,     setAksamNote]     = useState(()=>localStorage.getItem("sakin_aksamnote_"+sakinDayKey())||"");
  const [sukur,         setSukur]         = useState(()=>localStorage.getItem("sakin_sukur_"+sakinDayKey())||"");
  const [aksamRitualChecks, setAksamRitualChecks] = useState(()=>{ try { return JSON.parse(localStorage.getItem("sakin_ritual_"+sakinDayKey()))||[false,false,false]; } catch { return [false,false,false]; } });
  const [aiRapor,       setAiRapor]       = useState(() => { try { return localStorage.getItem("sakin_rapor_week") === currentWeekKey() ? (localStorage.getItem("sakin_rapor_text") || "") : ""; } catch { return ""; } });
  const [aiLoading,     setAiLoading]     = useState(false);
  const [aiConsent, setAiConsent] = useState(() => localStorage.getItem("sakin_ai_consent") === "1");
  const [showAiConsent, setShowAiConsent] = useState(false);
  const [showAilesi, setShowAilesi] = useState(false);
  // KEŞFET AÇIKKEN ARKA PLAN KİLİTLİ (kullanıcı: "keşfet ilk açıldığında eskiden
  // kalan bir pencere arka planda scroll oluyor").
  // KÖK SEBEP: Keşfet paneli position:fixed olsa da DOM'da .sakin-app-root'un
  // İÇİNDE duruyor. Panelde kaydırma yapınca, iç kart sınırına geldiğinde scroll
  // zincirlenip arkadaki ekranı (sabah/gün/...) oynatıyordu; üstelik panel
  // açıldığında arka plan bıraktığı yerde (ör. scrollTop 157) donmuş duruyordu —
  // yarı saydam katmanın ardından "eski pencere kayıyor" görüntüsü buradan geliyor.
  // Panel açıkken kök kapsayıcının kaydırması kapatılır, kapanınca geri verilir.
  useEffect(() => {
    const root = document.querySelector(".sakin-app-root");
    if (!root) return;
    if (showAilesi) root.style.overflowY = "hidden";
    else root.style.overflowY = "";
    return () => { root.style.overflowY = ""; };
  }, [showAilesi]);
  // İlk açılış (giriş ekranı) dışında Harita/Bağlan/Keşfet üst bar'da tek tek
  // durmak yerine sağdaki ☰ menüsüne toplanır (kullanıcı isteği) — üst bar sade
  // kalır. İlk açılışta (screen==="giris") eskisi gibi 3 ayrı buton görünür.
  const [showTopMenu, setShowTopMenu] = useState(false);
  // Bildirim tıklaması → ilgili ekrana yönlendir (Sprint 2). schedule'daki extra.screen
  // okunur; yoksa eski davranış (sadece uygulama açılır). iOS-only — webde no-op.
  useEffect(() => {
    if (!isNative) return;
    // AÇILIŞ KATMANLARINI KAPAT: bildirimden gelen kullanıcı hedefe DOĞRUDAN
    // düşmeli. Bunlar kapatılmazsa splash/HAZIRIM/"yol seçimi" pop-up'ı üstte
    // kalıyor ve kullanıcı "güne başla" ekranında takılı görüyor.
    const clearEntryLayers = () => {
      try { setShowIntro(false); sessionStorage.setItem("sakin_intro_seen","1"); } catch(_){}
      try { setShowNedir(false); } catch(_){}
      try { setGirisPhase("birth"); } catch(_){}
    };
    const handler = (a) => {
      const x = a?.notification?.extra || {};
      // extra.embed → doğrudan ilgili aile uygulamasını aç (ör. "tasarim").
      // NOT: aşağıdaki harita burada YEREL tanımlı — postMessage köprüsündeki
      // EMBED_BY_KEY başka bir useEffect kapsamında olduğu için buradan erişilemez.
      const EMBEDS = {
        hayvan:  { name: t("ailesi_hayvan_name"),  embed: "/embedded/sakinhayvan/index.html", color: "#a0d8b4" },
        mitler:  { name: t("ailesi_mitler_name"),  embed: "/embedded/sakinmitler/index.html", color: "#d8b4a0" },
        tasarim: { name: t("ailesi_tasarim_name"), embed: "/embedded/humandesign/index.html", color: "#b4a0d8" },
        taslar:  { name: t("ailesi_taslar_name"),  embed: "/embedded/sakintaslar/index.html", color: "#a0d8d8" },
        bitkiler:{ name: t("ailesi_bitkiler_name"),embed: "/embedded/sakinbitkiler/index.html", color: "#7BA05B" },
      };
      clearEntryLayers();
      if (x.embed) {
        const target = EMBEDS[x.embed];
        if (target && handleOpenEmbedRef.current) {
          try { setShowAilesi(false); } catch(_){}
          setEmbedLoaded(false);
          handleOpenEmbedRef.current(target);
          return;
        }
        // Embed bulunamazsa en azından Keşfet panelini aç
        try { setShowAilesi(true); } catch(_){}
        return;
      }
      if (x.screen) { try { setShowAilesi(false); } catch(_){} setScreen(x.screen); }
    };
    __notifActionHandler = handler;
    // Soğuk açılışta modül seviyesinde tamponlanan aksiyonu şimdi işle. Splash
    // (showIntro) 2.4 sn sürüyor; hedefe geçişi onun bitişine yakın uygula ki
    // splash'in kendi zamanlayıcısı üstüne yazmasın.
    if (__pendingNotifAction) {
      const pending = __pendingNotifAction;
      __pendingNotifAction = null;
      setTimeout(() => handler(pending), 60);
    }
    return () => { __notifActionHandler = null; };
  }, []);
  const [showFotoTani, setShowFotoTani] = useState(false);
  const [fotoTaniType, setFotoTaniType] = useState("stone"); // embed'den gelir: stone | plant
  const [fotoTaniResult, setFotoTaniResult] = useState("");
  const [fotoTaniLoading, setFotoTaniLoading] = useState(false);
  const [ailesiEditBirth, setAilesiEditBirth] = useState(false);
  const [hakkindaTab, setHakkindaTab] = useState("yolculuk");
  // App Store Guideline 5.1.1(v) — account deletion. Modal + helper state.
  // NOT: src/purchases.js'e DOKUNULMAZ. Apple'ın silme şartı KULLANICI verileri içindir;
  // abonelik iptali kullanıcının App Store ayarlarından kendi yaptığı ayrı bir işlemdir
  // (UI'da bunu hatırlatıyoruz). Burada localStorage temizlenir + React state sıfırlanır.
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteToast, setDeleteToast] = useState("");
  const [embeddedApp, setEmbeddedApp] = useState(null); // { name, path } for fullscreen iframe overlay
  const [embedQuotaExceeded, setEmbedQuotaExceeded] = useState(false); // Hayvan/Mitler kotası dolduysa frost+CTA
  // Sakin Mitler özel: bundle her mount'ta Math.random ile "günün 4 miti"ni yeniden seçtiği için
  // kapat/aç döngüsünde mitler değişiyordu. Çözüm: iframe'i overlay container'da sürekli DOM'da
  // tut, sadece display:none ile gizle. Gün değişimi olunca key değişir → yeniden mount → yeni mitler.
  // mitlerSession bir kez set olunca uygulama kapatılana kadar kalır (sticky).
  const [mitlerSession, setMitlerSession] = useState(null); // null | { day: "YYYY-MM-DD" }
  const mitlerIframeRef = useRef(null);
  const mitlerLoadedOnceRef = useRef(false);
  // Aile uygulaması açılışında kullanılır: 3 ücretsiz açılış sonrası frost. HD bunun dışında (kendi detay blur'u var).
  const AILESI_FREE_OPENS = 3;
  const handleOpenEmbed = (app) => {
    playPortalSound(); haptic();
    // Mitler sticky davranışı: aynı gün + iframe daha önce yüklü → embedLoaded'ı direkt true
    // tut (kapatma sırasında false'a çekildi; sticky iframe RAM'de hâlâ olduğu için onLoad
    // bir daha tetiklenmez). Yeni gün veya ilk açılış → loading layer normal akış.
    const isMitlerEmbed = (app.embed || "").indexOf("sakinmitler") !== -1;
    const today = sakinDayKey();
    const isMitlerStickyHit = isMitlerEmbed && mitlerLoadedOnceRef.current && mitlerSession && mitlerSession.day === today;
    if (isMitlerStickyHit) {
      setEmbedLoaded(true);
    } else {
      setEmbedLoaded(false);
    }
    const m = (app.embed || "").match(/\/embedded\/([^/]+)/);
    const appKey = m ? m[1] : "unknown";
    const isHD = appKey === "humandesign";
    let exceeded = false;
    if (!isPremium && !isHD) {
      // GÜNLÜK kota: anahtara tarih eklenir → her gün 3 ücretsiz açılış sıfırdan başlar.
      const todayKey = sakinDayKey();
      const storageKey = "sakin_ailesi_opens_" + appKey + "_" + todayKey;
      const prev = parseInt(localStorage.getItem(storageKey) || "0", 10) || 0;
      const next = prev + 1;
      try { localStorage.setItem(storageKey, String(next)); } catch(_) {}
      exceeded = next > AILESI_FREE_OPENS;
    }
    setEmbedQuotaExceeded(exceeded);
    // Hayvan (Tura) preemptive bridge: bundle AsyncStorage init'i iframe load'tan
    // önce çalışabildiği için, @tura_profile'ı iframe oluşmadan ÖNCE same-origin
    // localStorage'a yazıyoruz. Bundle init ettiğinde değer hazır.
    if (app.embed && app.embed.indexOf("sakinhayvan") !== -1) {
      try {
        if (userName || birthDate || birthCity) {
          const hm = (birthTime || "").split(":");
          const bh = parseInt(hm[0], 10);
          const bm = parseInt(hm[1], 10);
          const turaProfile = {
            name: userName || undefined,
            birthDate: birthDate || undefined,
            birthHour: (!isNaN(bh) && bh >= 0 && bh <= 23) ? bh : undefined,
            birthMinute: (!isNaN(bm) && bm >= 0 && bm <= 59) ? bm : undefined,
            birthCity: birthCity || undefined,
          };
          localStorage.setItem("@tura_profile", JSON.stringify(turaProfile));
        }
      } catch(_) {}
    }
    // Sakin Mitler: sticky iframe. Gün karşılaştır — gün aynıysa aynı session devam,
    // gün değiştiyse key değişir → iframe re-mount → yeni günün mitleri seçilir.
    // Bu kontrol SADECE açılış anında yapılır (kullanıcı mitler açıkken gece yarısı
    // geçerse iframe değişmesin — UX).
    if (isMitlerEmbed) {
      if (!mitlerSession || mitlerSession.day !== today) {
        // Yeni gün (veya ilk açılış) → iframe yeniden mount edilecek → loading göstermek için
        // mitlerLoadedOnceRef'i sıfırla; embedLoaded yukarıda false'a çekildi, onLoad true yapacak.
        mitlerLoadedOnceRef.current = false;
        setMitlerSession({ day: today });
      }
      // Aksi (aynı gün, sticky iframe RAM'de): handleOpenEmbed başında setEmbedLoaded(false) zaten
      // SKIP edildi (isMitlerAlreadyLoaded), embedLoaded true kaldı → loading flash yok.
    }
    setEmbeddedApp({ name: app.name, path: app.embed, color: app.color });
    setTimeout(()=>setShowAilesi(false), 250);
  };
  // Embed'lerin kardeş uygulamaya in-app geçişi için güncel referans (bayat closure önlemi)
  const handleOpenEmbedRef = useRef(null);
  handleOpenEmbedRef.current = handleOpenEmbed;
  // ESC tuşuyla embed'den çıkış — web kullanıcıları için bir fallback (back button bulunamazsa)
  useEffect(() => {
    if (!embeddedApp) return;
    const onKey = (e) => { if (e.key === "Escape") { setEmbeddedApp(null); setEmbedLoaded(false); setEmbedQuotaExceeded(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [embeddedApp]);

  // Embed unmount cleanup — disconnect MutationObserver(s) that the iframe onLoad
  // installed into the embed document. Without this, every open→close cycle leaks
  // a runaway observer that keeps querySelectorAll'ing the dead iframe's body,
  // accumulating until iOS OOM-kills the process (observed: ~9 min, iPhone 17).
  useEffect(() => {
    if (embeddedApp) return; // cleanup only fires on the transition from set→null
    // Walk any leftover iframes in the document and shut down their observers.
    try {
      const iframes = document.querySelectorAll("iframe");
      iframes.forEach(f => {
        if (f._sakinObserver) {
          try { f._sakinObserver.disconnect(); } catch(_) {}
          f._sakinObserver = null;
        }
      });
    } catch(_) {}
  }, [embeddedApp]);
  // Embed iframe'lerinden gelen mesajları dinle (postMessage köprüsü).
  // Same-origin only: embed'ler bizimle aynı origin'de — keyfi origin'i yoksay.
  useEffect(() => {
    const EMBED_BY_KEY = {
      hayvan:  { name: t("ailesi_hayvan_name"),  embed: "/embedded/sakinhayvan/index.html", color: "#a0d8b4" },
      mitler:  { name: t("ailesi_mitler_name"),  embed: "/embedded/sakinmitler/index.html", color: "#d8b4a0" },
      tasarim: { name: t("ailesi_tasarim_name"), embed: "/embedded/humandesign/index.html", color: "#b4a0d8" },
      taslar:  { name: t("ailesi_taslar_name"),  embed: "/embedded/sakintaslar/index.html", color: "#a0d8d8" },
      bitkiler:{ name: t("ailesi_bitkiler_name"),embed: "/embedded/sakinbitkiler/index.html", color: "#7BA05B" },
    };
    const onMsg = (e) => {
      if (e.origin !== window.location.origin) return;
      const type = e?.data?.type;
      if (type === "sakin-premium-cta") {
        setEmbeddedApp(null); setEmbedLoaded(false);
        setScreen("fiyat");
      } else if (type === "sakin-open-embed") {
        // Bir embed, kardeş aile uygulamasını in-app açmak istiyor (eski netlify
        // linki yerine). Hedefi host'un kendi embed akışıyla aç.
        const target = EMBED_BY_KEY[e?.data?.app];
        if (target && handleOpenEmbedRef.current) {
          setEmbedLoaded(false);
          handleOpenEmbedRef.current(target);
        }
      } else if (type === "sakin-close-embed") {
        // Embed içinden "sakin.life" ana merkeze dön — embed'i kapat, Ailesi panelini aç.
        setEmbeddedApp(null); setEmbedLoaded(false); setEmbedQuotaExceeded(false);
        setShowAilesi(true);
      } else if (type === "sakin-foto-tani") {
        // Embed (Taşlar/Bitkiler Bul) "fotoğraftan tanı" istedi → host modalını aç (kamera web tarafında).
        setFotoTaniType(e?.data?.kind === "plant" ? "plant" : "stone");
        setFotoTaniResult("");
        setShowFotoTani(true);
      } else if (type === "sakin-share-card") {
        // Embed (Android WebView) kart görselini paylaşmak istiyor — iframe içinde
        // navigator.share/indirme çalışmaz. Host, dataURL'i blob'a çevirip Capacitor
        // Share ile paylaşır (shareImageBlob native yolu Android'de devreye girer).
        (async () => {
          try {
            const { dataUrl, fileName } = e.data || {};
            if (dataUrl) {
              const blob = await (await fetch(dataUrl)).blob();
              await shareImageBlob(blob, fileName || "sakin-kart.png");
            }
          } catch(_) {}
        })();
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [t]);
  const [embedLoaded, setEmbedLoaded] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);
  // Kimlik kartı açılış zamanı — mobil "tap-through" (açılış dokunuşunun backdrop'a
  // ulaşıp modalı hemen kapatması) engellemek için. Açılıştan ~450ms sonrasına kadar
  // backdrop kapatma yok sayılır. "Galaktik kimlik açılınca hemen atıyor" bug'ı.
  const idCardOpenTs = useRef(0);
  useEffect(() => { if (showIdCard) idCardOpenTs.current = Date.now(); }, [showIdCard]);
  // Kart nereden açıldı? Keşfet (Ailesi) panelinden açıldıysa kapatınca oraya geri
  // dönmeli — eskiden kapat deyince kullanıcı ana ekrana düşüyordu (kullanıcı isteği).
  const idCardFromAilesi = useRef(false);
  const closeIdCard = () => {
    setShowIdCard(false);
    if (idCardFromAilesi.current) { idCardFromAilesi.current = false; setShowAilesi(true); }
  };
  const [showMindClear, setShowMindClear] = useState(false);
  const [activeMindMode, setActiveMindMode] = useState(null);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [selectedNature, setSelectedNature] = useState([]);
  const [idCardPhoto, setIdCardPhoto] = useState(null);
  const [idCardName, setIdCardName] = useState(() => localStorage.getItem("sakin_name") || "");
  // Kart açıldığında adı doğum bilgilerine girilen isimle senkronla — idCardName
  // yalnızca uygulama İLK açıldığında localStorage'dan okunuyordu; kullanıcı Ailesi
  // panelinden adını SONRADAN girdiyse/değiştirdiyse kart bunu hiç görmüyordu.
  useEffect(() => {
    if (showIdCard && userName && !idCardName) setIdCardName(userName);
  }, [showIdCard]);
  const pendingAiAction = useRef(null);
  const [offlineMsg, setOfflineMsg] = useState("");
  // Günlük AI çağrı limiti (maliyet tavanı) — client-side soft cap; ai-call.mjs'te
  // ayrıca per-IP 20/10dk server limiti var. Premium daha yüksek hak.
  const _aiDailyOk = () => {
    try {
      const lim = isPremium ? 40 : 10;
      const today = sakinDayKey();
      const d = JSON.parse(localStorage.getItem("sakin_ai_daily") || "{}");
      if (d.day !== today) { d.day = today; d.n = 0; }
      if (d.n >= lim) return false;
      d.n++; localStorage.setItem("sakin_ai_daily", JSON.stringify(d));
      return true;
    } catch { return true; }
  };
  const _aiLimitMsg = () => pickLang({ tr:"Bugünlük AI hakkın doldu. Yarın yine buradayım. 🌙", en:"You've reached today's AI limit. I'll be here again tomorrow. 🌙", de:"Dein KI-Limit für heute ist erreicht. Morgen bin ich wieder da. 🌙", es:"Has alcanzado el límite de IA de hoy. Mañana estaré aquí de nuevo. 🌙", pt:"Atingiste o limite de IA de hoje. Amanhã estarei aqui de novo. 🌙", fr:"Tu as atteint la limite IA du jour. Je serai là demain. 🌙", ja:"今日のAIの上限に達しました。また明日会いましょう。🌙" }, lang);
  const requireAiConsent = (action) => {
    if (!navigator.onLine) { setOfflineMsg(t("ai_offline")); setTimeout(() => setOfflineMsg(""), 3000); return; }
    if (!_aiDailyOk()) { setOfflineMsg(_aiLimitMsg()); setTimeout(() => setOfflineMsg(""), 4000); return; }
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
  // Foto-tanıma (Groq vision) — taş/bitki. Premium-gated + günlük AI limiti. Görsel
  // canvas ile ~1024px'e küçültülüp jpeg base64 olarak gönderilir (küçük payload).
  const identifyPhoto = async (file, type) => {
    if (!file) return;
    if (!isPremium) { setShowFotoTani(false); setScreen("fiyat"); return; }
    if (!_aiDailyOk()) { setFotoTaniResult(_aiLimitMsg()); return; }
    setFotoTaniLoading(true); setFotoTaniResult("");
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const max = 1024; let w = img.width, h = img.height;
          if (w > max || h > max) { const s = max / Math.max(w, h); w = Math.round(w * s); h = Math.round(h * s); }
          const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
          cv.getContext("2d").drawImage(img, 0, 0, w, h);
          resolve(cv.toDataURL("image/jpeg", 0.82));
        };
        img.onerror = reject; img.src = URL.createObjectURL(file);
      });
      const r = await fetch(API_BASE + "/.netlify/functions/identify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, type, lang }),
      });
      const d = await r.json();
      setFotoTaniResult(d.text || pickLang({ tr:"Tanıyamadım — daha net bir fotoğraf dener misin?", en:"I couldn't identify it — try a clearer photo?", de:"Ich konnte es nicht erkennen — versuch ein klareres Foto?", es:"No pude identificarlo — ¿pruebas una foto más clara?", pt:"Não consegui identificar — tentas uma foto mais nítida?", fr:"Je n'ai pas pu l'identifier — un cliché plus net ?", ja:"見分けられませんでした——もっと鮮明な写真で試してみて。" }, lang));
    } catch { setFotoTaniResult(t("err_connection_full")); }
    setFotoTaniLoading(false);
  };
  const [isOwner, setIsOwner] = useState(false);
  useEffect(() => {
    fetch(API_BASE + "/.netlify/functions/check-owner").then(r=>r.json()).then(d=>{ if(d.owner) setIsOwner(true); }).catch(()=>{});
  }, []);
  const devMode = isOwner && !isNative;
  const [raporKullanildi, setRaporKullanildi] = useState(() => localStorage.getItem("sakin_rapor_used") === "1");
  const [raporMesaj, setRaporMesaj] = useState(""); // veri yok / haftalık limit → şefkatli bilgilendirme
  const [isPremium, setIsPremium] = useState(() => {
    // İyimser başlat: önceki kullanıcı-eylemiyle (Subscribe/Buy/Restore) yazılan yerel
    // bayrağa güven → premium uygulama kapanıp açılınca KORUNUR (her açılışta Restore'a
    // gerek kalmaz). Bu bayrak store.owned değil; sadece kullanıcının bizzat satın aldığını
    // gösterir. Abonelik gerçekten bittiyse aşağıdaki recheck (ürünler yüklenince) iptal eder.
    return localStorage.getItem("sakin_premium") === "1";
  });
  const [purchaseLoading, setPurchaseLoading] = useState(null);
  const [purchaseError, setPurchaseError] = useState("");
  const [iapReady, setIapReady] = useState(false);
  const [productsReady, setProductsReady] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null); // { version, notes_tr, notes_en } — daha yeni sürüm varsa
  const [updateDismissed, setUpdateDismissed] = useState(() => localStorage.getItem("sakin_update_dismissed_v") || "");

  // App açılınca latest-ios-version.json'u kontrol et — daha yeni varsa banner göster
  useEffect(() => {
    if (!isNative) return;
    fetch("https://sakin.life/latest-ios-version.json", { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data || !data.version) return;
        if (compareVer(APP_VERSION, data.version) < 0) {
          setUpdateInfo({ version: data.version, notes_tr: data.release_notes_tr || "", notes_en: data.release_notes_en || "" });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isNative) return;
    onPurchaseUpdate((purchased) => {
      if (purchased) {
        try { localStorage.setItem("sakin_premium", "1"); } catch(_){} // kalıcı: relaunch'ta korunsun
        setIsPremium(true);
        setPurchaseLoading(null);
        setPurchaseError("");
        haptic(ImpactStyle.Heavy);
      }
    });
    onProductsLoaded(() => setProductsReady(true));
    initStore().then((ok) => {
      setIapReady(ok);
      if (areProductsLoaded()) setProductsReady(true);
      // NOTE: We do NOT call isSubscribed() here. store.owned reflects Apple's
      // cached transaction history for the Apple ID — including stale sandbox
      // subs, family-shared, refunded-but-cached. Auto-granting from that would
      // hand Premium to anyone whose Apple ID has any historical receipt.
      // Premium is only granted via:
      //   1) handlePurchase → user-initiated Subscribe/Buy → verified callback
      //   2) handleRestore  → user-initiated "Restore Purchases" button
    });
  }, []);

  // Foreground recheck — REVOKE-ONLY. store.owned stale/replayed receipt'lerden
  // FALSE pozitif verebilir (992ab50 fix'i bunu yasakladı). Bu yüzden burada SADECE
  // revoke yaparız: owned=false → premium iptal et. owned=true → DOKUNMA, çünkü
  // yeni premium yalnızca .verified callback'i ile (userInitiatedAction=true iken) verilir.
  // Bu Apple 2.1 expired-sub testini geçer, ama cached receipt'lerden bedavaya
  // premium grant'ini engeller.
  useEffect(() => {
    if (!isNative) return;
    const recheck = () => {
      if (document.visibilityState !== "visible") return;
      if (!areProductsLoaded()) return; // mağaza/owned hazır değilken iptal etme (açılış yarışı)
      try {
        const owned = isSubscribed();
        if (!owned) setIsPremium(false); // sadece iptal et, asla grant verme
      } catch(_) {}
    };
    document.addEventListener("visibilitychange", recheck);
    return () => document.removeEventListener("visibilitychange", recheck);
  }, []);

  const handlePurchase = async (fn, id) => {
    setPurchaseLoading(id);
    setPurchaseError("");
    const r = await fn();
    // r.orderPlaced: Apple ödeme sayfası açıldı, asıl premium grant'i verified
    // callback'inde gelecek (onPurchaseUpdate → setIsPremium(true)). Burada YAPMA.
    if (r.orderPlaced) {
      // Ödeme sayfasında bekle. Callback gelene kadar loading state'i koruyalım.
      // 60 sn içinde verified gelmezse loading'i kaldır (kullanıcı sayfada takılmış olabilir).
      setTimeout(() => { setPurchaseLoading(prev => prev === id ? null : prev); }, 60000);
      return;
    }
    setPurchaseLoading(null);
    if (r.cancelled || r.error === "cancelled") return;
    const errLower = (r.error || "").toLowerCase();
    if (errLower.includes("cancel") || errLower.includes("iptal")) return;
    let msg;
    if (r.error === "products_not_loaded") {
      msg = t("err_products_not_loaded");
    } else if (r.error === "already_owned") {
      // Bu ürüne zaten sahipsin → Restore gerektirmeden premium ver (reinstall sonrası
      // "Satın Al"a basınca premium döner). Store sahipliği onayladığı için güvenli.
      try { localStorage.setItem("sakin_premium", "1"); } catch(_){}
      setIsPremium(true); haptic(ImpactStyle.Heavy);
      return;
    } else {
      msg = t("err_purchase_generic");
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
      setPurchaseError(t("err_no_subscription"));
    }
  };

  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [licenseInput, setLicenseInput] = useState("");
  const [licenseError, setLicenseError] = useState("");
  // Web satış sayfası görünür ilgi sayacı — kaç kişi ilgilendiğini gösterir (kişisel
  // veri yok, first-party Netlify Blobs sayacı). Cihaz başına bir kez artırılır.
  const [waitlistJoined, setWaitlistJoined] = useState(() => { try { return localStorage.getItem("sakin_waitlist_joined") === "1"; } catch { return false; } });
  const [waitlistCount, setWaitlistCount] = useState(null);
  useEffect(() => {
    if (isNative) return; // web-only sayaç
    let alive = true;
    fetch("/.netlify/functions/waitlist").then(r => r.json()).then(d => { if (alive && typeof d.count === "number") setWaitlistCount(d.count); }).catch(() => {});
    return () => { alive = false; };
  }, []);
  const joinWaitlist = () => {
    if (waitlistJoined) return;
    setWaitlistJoined(true);
    try { localStorage.setItem("sakin_waitlist_joined", "1"); } catch (_) {}
    setWaitlistCount(c => (typeof c === "number" ? c + 1 : c)); // iyimser artış
    fetch("/.netlify/functions/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lang }) })
      .then(r => r.json()).then(d => { if (typeof d.count === "number") setWaitlistCount(d.count); }).catch(() => {});
  };
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
        setLicenseError(t("err_invalid_license"));
      }
    } catch {
      setLicenseError(t("err_connection_retry"));
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
  const [mirrorPortalActive, setMirrorPortalActive] = useState(false);
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
  // Haftalık Sakin Rapor da gökyüzü raporu gibi kapalı başlar, tıklanınca açılır.
  const [showRapor, setShowRapor] = useState(false);
  // Görev paneli de kapalı başlar (kullanıcı: "her seferinde buton açık olmasın").
  const [showGorev, setShowGorev] = useState(false);
  // 12. Ev ve Draconik Harita kartları da kapalı başlar (kullanıcı isteği) —
  // haritadaki dört panel de artık aynı davranışta: başlık butonu + açılır gövde.
  const [show12Ev, setShow12Ev] = useState(false);
  const [showDraconic, setShowDraconic] = useState(false);
  const [kozmikData, setKozmikData] = useState(null);
  const [kozmikLoading, setKozmikLoading] = useState(false);
  const fetchKozmik = async () => {
    if (kozmikData || kozmikLoading) return;
    setKozmikLoading(true);
    try {
      const r = await fetch(API_BASE + "/.netlify/functions/cosmic-energy?lang=" + encodeURIComponent(lang));
      if (r.ok) setKozmikData(await r.json());
    } catch { /* sessiz */ }
    setKozmikLoading(false);
  };
  const [showKilavuz, setShowKilavuz] = useState(false);
  // Sözlük araması (kullanıcı: "soru işaretine tıklar, tüm terimler gözükür ama
  // en üstte ara kutucuğu vardır" — Sakin Tasarım'daki arama ekranı gibi).
  const [kilavuzQ, setKilavuzQ] = useState("");
  // Kişiselleştirme: kullanıcının önceki sorgu geçmişini takip et
  const [sorguGecmisi, setSorguGecmisi] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sakin_sorgu_gecmisi")||"[]"); } catch { return []; }
  });

  // ── Streak & Step Tracking ──
  // todayKey artık STATE. Eskiden her render'da `new Date()`'ten hesaplanıyordu;
  // saniyede bir tikleyen saat (setTime) yüzünden gün dönümünde ANINDA değişiyordu.
  // O anda aşağıdaki persist efektleri ESKİ günün bellekteki değerlerini (nefes 11,
  // akşam notu, şükür, ritüel) YENİ günün anahtarına yazıyordu → veri yeni güne
  // sızıyordu. stepsCompleted ise sadece markStep içinde yazıldığı için sızmıyordu.
  // Sonuç tam olarak kullanıcının gördüğü tablo: tünel sıfır, nefes 11'den devam.
  const [todayKey, setTodayKey] = useState(() => sakinDayKey());
  useEffect(() => {
    const check = () => setTodayKey(prev => { const k = sakinDayKey(); return prev === k ? prev : k; });
    const id = setInterval(check, 30000);
    document.addEventListener("visibilitychange", check);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", check); };
  }, []);

  // GÜN DÖNÜMÜ: bellekteki günlük state yeni güne taşınmaz, yeni günün deposundan
  // (yani boştan) yeniden kurulur. hydratedDayRef, state'in HANGİ güne ait olduğunu
  // tutar; eşleşmediği sürece persist efektleri yazmaz → sızıntı imkânsız.
  const hydratedDayRef = useRef(todayKey);
  const dayInSync = hydratedDayRef.current === todayKey;
  useEffect(() => {
    if (dayInSync) return;
    const num = (k) => { try { return parseInt(localStorage.getItem(k + todayKey)) || 0; } catch { return 0; } };
    const str = (k) => { try { return localStorage.getItem(k + todayKey) || ""; } catch { return ""; } };
    const obj = (k, f) => { try { return JSON.parse(localStorage.getItem(k + todayKey)) || f; } catch { return f; } };
    setNiyet(str("sakin_niyet_"));
    setSelectedWords(obj("sakin_words_", []));
    setBreathCount(num("sakin_breath_"));
    setBreathStarted(false);
    setBreathPhase("ready");
    setFreqListenSec(num("sakin_freq_sec_"));
    setAksamNote(str("sakin_aksamnote_"));
    setSukur(str("sakin_sukur_"));
    setAksamRitualChecks(obj("sakin_ritual_", [false, false, false]));
    setStepsCompleted(obj("sakin_steps_", {}));
    setGunTasksDone(Object.values(obj("sakin_reminders_done_", {})).filter(Boolean).length);
    hydratedDayRef.current = todayKey;
  }, [dayInSync, todayKey]);

  // Günlük state'leri localStorage'a persist et (Safari kapatıp açınca kaybolmasın)
  useEffect(()=>{ if (!dayInSync) return; localStorage.setItem("sakin_breath_"+todayKey, String(breathCount)); }, [breathCount, todayKey, dayInSync]);
  useEffect(()=>{ if (!dayInSync) return; localStorage.setItem("sakin_aksamnote_"+todayKey, aksamNote); }, [aksamNote, todayKey, dayInSync]);
  useEffect(()=>{ if (!dayInSync) return; localStorage.setItem("sakin_sukur_"+todayKey, sukur); }, [sukur, todayKey, dayInSync]);
  useEffect(()=>{ if (!dayInSync) return; localStorage.setItem("sakin_ritual_"+todayKey, JSON.stringify(aksamRitualChecks)); }, [aksamRitualChecks, todayKey, dayInSync]);

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

  // ── BAĞLANTI ŞARTLARI (kullanıcı kararı) ────────────────────────────────────
  // Eskiden (1.3.x öncesi) süre şartları vardı, sonradan kaybolmuş — geri getirildi:
  //   nefes  : en az 10 nefes
  //   ses    : en az 1 dk (60 sn) solfeggio dinleme
  //   chakra : en az 2 dk (120 sn) çakra terapisi
  //   gun    : gün görevlerinden en az 3'ü
  //   sabah  : 3 kelime + niyet (buton zaten bunu şart koşuyor)
  //   aksam  : akşam kapanışı (buton)
  //   harita : haftalık haritayı görüp yeni güne geçmek (buton)
  // NAVİGASYON serbesttir — şart sağlanmasa da kullanıcı ileri gidebilir; sadece
  // ADIM İŞARETLENMEZ (dolayısıyla bağlantı aktifleşmez).
  // chakra: 120 sn TOPLAM (kullanıcı: "120 saniye geçerli; tek seansta 120 saniye
  // olabilir ya da 3 seansta — nasıl yapmak isterse kullanıcı"). Sayaç gün boyunca
  // BİRİKİR, yani tek uzun seans da birkaç kısa seans da olur. Tek seansın 120 sn'ye
  // ulaşabilmesi için terapi seans tavanı 90 → 120 sn yükseltildi (getChakraDuration).
  const STEP_MIN = { nefes: 10, ses: 60, chakra: 120, gun: 3 };
  const readTerapiSec = () => { try { return parseInt(localStorage.getItem("sakin_terapi_sec_" + todayKey)) || 0; } catch { return 0; } };
  // gunTasksDone state'i bu satırdan SONRA tanımlı (TDZ) — doğrudan localStorage'dan oku.
  const readGunTasks = () => {
    try { return Object.values(JSON.parse(localStorage.getItem("sakin_reminders_done_" + todayKey)) || {}).filter(Boolean).length; }
    catch { return 0; }
  };
  const stepRequirementMet = (stepId) => {
    if (stepId === "nefes")  return breathCount     >= STEP_MIN.nefes;
    if (stepId === "ses")    return freqListenSec   >= STEP_MIN.ses;
    if (stepId === "chakra") return readTerapiSec() >= STEP_MIN.chakra;
    if (stepId === "gun")    return readGunTasks()  >= STEP_MIN.gun;
    return true; // sabah/aksam/harita: ekranın kendi butonu zaten şartı taşıyor
  };
  const markStep = (stepId) => {
    if (!stepRequirementMet(stepId)) return; // şart sağlanmadı → adım işaretlenmez
    setStepsCompleted(prev => {
      if (prev[stepId]) return prev;         // zaten işaretli → gereksiz yazma yok
      const next = { ...prev, [stepId]: true };
      localStorage.setItem("sakin_steps_" + todayKey, JSON.stringify(next));
      return next;
    });
  };
  // AYNA adımı: ekrana GİRMEK yeterli (kullanıcı: "tıklaması yeterli olsun, soru
  // sormasına gerek yok"). Diğer adımlardan farklı olarak süre/eylem şartı yok.
  useEffect(() => {
    if (screen === "rehber") markStep("rehber");
  }, [screen]);

  // ── ŞART DOLUNCA ANINDA İŞARETLE ────────────────────────────────────────────
  // KÖK SEBEP (kullanıcı: "60 saniye dinledim ama buton açılmadı / 120 sn çakra
  // yaptım 120/120 ama ışık yanmadı"): adım YALNIZCA o ekranın "İleri/Sonraki"
  // butonuna basılınca işaretleniyordu. Şart dolsa bile kullanıcı kaydırarak veya
  // alt menüden çıkarsa adım hiç işaretlenmiyordu. Artık eşik geçildiği ANDA
  // işaretlenir (bu, daha önce geri aldığım "ziyaret edince işaretle" hatasından
  // FARKLI: burada gerçekten şart tamamlanmış oluyor).
  useEffect(() => { if (breathCount   >= STEP_MIN.nefes) markStep("nefes"); }, [breathCount]);
  useEffect(() => { if (freqListenSec >= STEP_MIN.ses)   markStep("ses");   }, [freqListenSec]);
  // (gün görevleri efekti gunTasksDone tanımından SONRA — TDZ'den kaçınmak için)
  // Çakra terapi süresi localStorage'da tutuluyor (TerapiScreen ayrı bileşen) —
  // terapi ekranındayken saniyede bir bakıp eşiği geçince işaretle.
  useEffect(() => {
    if (screen !== "terapi") return;
    const id = setInterval(() => {
      if (readTerapiSec() >= STEP_MIN.chakra) markStep("chakra");
    }, 1000);
    return () => clearInterval(id);
  }, [screen]);

  // BAĞLANTI = 7 adım (kullanıcı kararı: "mantık kurmak için 7 adıma düşürelim").
  // mandala(Bağlan) ve ailesi(Keşfet) ADIM DEĞİL — onlar hedef/genel bakış ekranları
  // ve markStep hiç çağrılmadığı için bağlantı asla aktifleşemiyordu (kullanıcı:
  // "ses terapisini yaptım ama bağlantı sağlanmıyor"). KÖK SEBEP buydu.
  // BAĞLANTI = 7 ADIM: alt bardaki 6 sekme (sabah·gün·nefes·ses·çakra·akşam) + AYNA.
  // (Kullanıcı önce "harita'yı çıkar, 6 yeterli" dedi, sonra "vazgeçtim 7 aşama kalsın
  // ama harita yerine ayna ekranına tıklamasını ekle; tıklaması yeterli, soru sormasına
  // gerek yok" dedi.) Ayna = "rehber" ekranı; şart yok, ekrana girmek adımı tamamlar.
  const MANDALA_STEPS = ["sabah","gun","nefes","ses","chakra","aksam","rehber"];
  const completedStepCount = MANDALA_STEPS.filter(s => stepsCompleted[s]).length;
  // ADIM SAYACI (kullanıcı: "0 Güne başla, 1 sabah, 2 gün… ilerledikçe artsın; şu an
  // hep 0"). Sayaç artık TAMAMLAMA değil, bulunulan ekranın NAVİGASYON sırasını
  // gösterir: giriş=0, sabah=1, gün=2, …, keşfet=9. Böylece kullanıcı ilerledikçe
  // doğal artar (DEVAM ET'e basmasa, kaydırsa bile). stepsCompleted yalnızca ekran
  // İÇERİĞİ (sabah kelimeleri seçili vs.) için kullanılmaya devam eder — karışmaz.
  // Alt sayaç 9 EKRANI gösterir (giriş=0, sabah=1 … keşfet=9) — bağlantının 7 adımından
  // AYRI bir şeydir (sayaç = "neredeyim", bağlantı = "bugün ne tamamlandı").
  // Alt sayaç artık kaydırma zinciriyle BİREBİR aynı: giriş=0, sabah=1 … harita=7.
  // bağlan ve keşfet zincirden çıkarıldığı için sayaçtan da çıkarıldı.
  const NAV_STEPS = ["sabah","gun","nefes","ses","chakra","aksam","harita"];
  const currentStepIndex = Math.max(0, NAV_STEPS.indexOf(screen) + 1);
  const STEP_NAMES = [
    (t("gune") || "").replace(/[◎✦→\s]+$/, "").trim() || "Sakin",
    t("nav_morning"), t("nav_day"), t("nav_breath"), t("nav_sound"),
    t("nav_chakra"), t("nav_evening"), t("nav_map"),
  ];
  // NOT (geri alınan hatalı düzeltme): Adımlar SADECE gerçekten tamamlanınca
  // (ekranın "DEVAM ET/İLERİ" butonuna basınca) markStep ile işaretlenir. Bir
  // önceki sürümde "ziyaret edilen her ekranı otomatik işaretle" denemesi vardı;
  // bu, ekranları sadece kaydırıp geçmeyi "tamamlandı" sayıyordu (sabah kelimeleri
  // seçili, bağlan tamamlandı görünüyor, sayaç 9/9'a fırlıyordu) — kaldırıldı.
  // "İlerledikçe artsın": kullanıcı her adımı bitirip ilerledikçe sayaç doğal artar.
  const [gunTasksDone, setGunTasksDone] = useState(() => {
    try {
      const k = "sakin_reminders_done_" + sakinDayKey();
      const s = JSON.parse(localStorage.getItem(k)) || {};
      return Object.values(s).filter(Boolean).length;
    } catch { return 0; }
  });
  // Gün görevleri eşiği dolunca adımı anında işaretle (bkz. yukarıdaki "şart dolunca
  // anında işaretle" bloğu; burada olmasının sebebi gunTasksDone'ın TDZ sırası).
  useEffect(() => { if (gunTasksDone >= STEP_MIN.gun) markStep("gun"); }, [gunTasksDone]);
  const allStepsComplete = completedStepCount === MANDALA_STEPS.length;

  // ── GÜNÜN SAATİNE GÖRE GİRİŞ EKRANI ─────────────────────────────────────────
  // Kullanıcı: "appe akşam girdim bağlanmak istedim ama 'bugünü nasıl geçirmek
  // istersin' diye sorup sabahtan başlatıyor... direkt akşama alsın ve bana bir
  // şey yaptırsın isterdim."
  // Eskiden "Devam Et →" her koşulda "sabah" ekranına gidiyordu. Artık saate ve
  // tamamlanan adımlara bakılır; kullanıcı her zaman YAPACAK bir şeyin üstüne düşer.
  //   04:00-11:59 → sabah niyeti (yapılmadıysa)
  //   12:00-17:59 → ilk eksik adım (gün akışına devam)
  //   18:00-03:59 → akşam kapanışı (yapılmadıysa)
  // Hepsi tamamsa bağlantı ekranı (mandala) açılır — tünel/seri orada görünür.
  // İlk eksik adım; belirtilen adımlar hesaba katılmaz.
  const nextIncompleteScreen = (exclude = []) =>
    MANDALA_STEPS.find(id => !exclude.includes(id) && !stepsCompleted[id]) || null;
  // Hepsi tamamsa pratiğe dön: ses -> çakra -> nefes sırayla döner (kullanıcı:
  // "sırayla ses-çakra-nefes arasında dönsün"). Sıra localStorage'da tutulur.
  const ROTATE_PRACTICE = ["ses", "chakra", "nefes"];
  const rotatePractice = () => {
    let i = 0;
    try { i = (parseInt(localStorage.getItem("sakin_rotate_idx")) || 0) % ROTATE_PRACTICE.length; } catch(_) {}
    try { localStorage.setItem("sakin_rotate_idx", String(i + 1)); } catch(_) {}
    return ROTATE_PRACTICE[i];
  };
  // Saat pencereleri (kullanıcı kararı):
  //   00:00-11:59 → sabah niyeti (yapılmadıysa)
  //   12:00-21:59 → SABAH ARTIK AÇILMAZ ("12:00'den sonra sabah tekrar açılmasın");
  //                 akşam da erken açılmaz → kaldığı yer, yoksa pratik döngüsü
  //   22:00-23:59 → akşam kapanışı ("akşam kapanışı 22:00-00:00 arası olsun")
  const timeAwareEntryScreen = () => {
    const h = new Date().getHours();
    if (h >= 22)  return !stepsCompleted["aksam"] ? "aksam" : (nextIncompleteScreen(["sabah"]) || rotatePractice());
    if (h < 12)   return !stepsCompleted["sabah"] ? "sabah" : (nextIncompleteScreen(["aksam"]) || rotatePractice());
    return nextIncompleteScreen(["sabah", "aksam"]) || rotatePractice();
  };

  // ── SEVİYE SİSTEMİ (kullanıcı: "7 gün düzenli kullanırsa sonraki seviyeye geçer
  //    x2 olur; 21 gün devam ederse tekrar bir sonraki seviyeye geçer x2 olur").
  //    Seviye 1: 0-6 gün (x1) · Seviye 2: 7-20 gün (x2) · Seviye 3: 21+ gün (x4).
  //    Çarpan her seviyede ikiye katlanır (x1 → x2 → x4).
  const streakLevel = streakData.current >= 21 ? 3 : streakData.current >= 7 ? 2 : 1;
  const streakMultiplier = streakLevel === 3 ? 4 : streakLevel === 2 ? 2 : 1;
  const nextLevelAt = streakLevel === 1 ? 7 : streakLevel === 2 ? 21 : null;

  // Update streak when all steps complete
  // dayInSync ŞARTI ŞART: gün dönümünde todayKey değişip stepsCompleted henüz yeni
  // günün deposundan kurulmadan bu efekt tetiklenirse, allStepsComplete hâlâ DÜNÜN
  // true değeridir → kullanıcı hiçbir şey yapmadan seri +1 artıyordu (ölçüldü:
  // gün dönümünde 1 → 2). Bellekteki state yeni güne ait olana kadar bekle.
  useEffect(() => {
    if (!allStepsComplete || !dayInSync) return;
    setStreakData(prev => {
      if (prev.lastDate === todayKey) return prev;
      const yesterday = sakinDayKey(new Date(Date.now() - 86400000));
      const isConsecutive = prev.lastDate === yesterday;
      const newCurrent = isConsecutive ? prev.current + 1 : 1;
      const newBest = Math.max(prev.best, newCurrent);
      const newBadges = [...prev.badges];
      [3,7,21,40].forEach(n => { if (newCurrent >= n && !newBadges.includes(n)) newBadges.push(n); });
      const next = { current: newCurrent, best: newBest, lastDate: todayKey, badges: newBadges };
      localStorage.setItem("sakin_streak", JSON.stringify(next));
      return next;
    });
  }, [allStepsComplete, todayKey, dayInSync]);

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
  // "SAKİN NEDİR?" / YOL SEÇİMİ overlay'i — açılışta ASLA çıkmaz (mount=false).
  // Yalnızca kullanıcı dilini seçip HAZIRIM'a basınca çıkar (~satır 5800) ve yalnızca
  // İLK 5 AÇILIŞTA (sakin_nedir_count 0→5). girisPhase her yüklemede "intro"ya döndüğü
  // + giriş varsayılan ekran olduğu için her açılış = bir HAZIRIM = bir sayım.
  // "bir daha gösterme" (sakin_nedir_off) 5'ten önce de kalıcı kapatır. iOS + web.
  // NOT (regresyon dersi): mount'ta true döndürmek (dönen kullanıcıya otomatik açılış)
  // pop-up'ı HAZIRIM'dan ÖNCE, giriş landing'inin üstünde gösteriyordu — geri alındı.
  const [showNedir, setShowNedir] = useState(false);
  const [showKimlikReveal, setShowKimlikReveal] = useState(false); // doğum kaydı sonrası anında karşılık kartı
  const [birthInput,     setBirthInput]     = useState(()=>localStorage.getItem("sakin_birth_date")||"");
  const [nameInput,      setNameInput]      = useState(()=>localStorage.getItem("sakin_name")||"");
  const [birthTimeInput, setBirthTimeInput] = useState(()=>localStorage.getItem("sakin_birth_time")||"");
  const [birthCity,      setBirthCity]      = useState(()=>localStorage.getItem("sakin_birth_city")||"");
  const [birthCityInput, setBirthCityInput] = useState(()=>localStorage.getItem("sakin_birth_city")||"");
  const [cityWarn,       setCityWarn]       = useState(false);
  const [dateWarn,       setDateWarn]       = useState(false);
  const breathRef        = useRef(null);
  const pendingBreathRef = useRef(null);
  // Ayna metnindeki "528 Hz" gibi bir frekansa tıklanınca Ses ekranı o frekansla açılır.
  const pendingFreqRef = useRef(null);
  // Ayna'dan gelen frekansı Ses ekranı açılınca uygula: kartı aç + tonu başlat.
  // Ekran gerçekten "ses" olduğunda çalışır; ref tek kullanımlıktır.
  useEffect(() => {
    if (screen !== "ses") return;
    const hz = pendingFreqRef.current;
    if (!hz) return;
    pendingFreqRef.current = null;
    const id = setTimeout(() => { try { setActiveFreq(hz); } catch (_) {} }, 250);
    return () => clearTimeout(id);
  }, [screen]);
  const panicAutoStartRef = useRef(false); // panik butonu: nefesi doğrudan başlat (premium istisnası)
  const breathChimeRef = useRef(null);

  // App Store Guideline 5.1.1(v) — Account / Data deletion.
  // - Tüm sakin_* localStorage anahtarlarını siler (eski/yeni tüm cihaz-yerel veriler).
  // - sakin_intro_seen (sessionStorage) dahil — kullanıcı temiz intro görsün.
  // - React state'i sıfırlar: ad, doğum bilgisi, niyet/sözcükler, nefes/ses/şükür/ritüel/
  //   sukur/aksamnote, çakra inputları, sorgu geçmişi, streak, steps, freq dinleme,
  //   AI consent, premium UI flag, rapor flag, reiki/zihinsel kullanım flag'leri.
  // - Kullanıcıyı giris/intro ekranına döndürür ve kısa bir onay tost'u gösterir.
  // - DİKKAT: src/purchases.js'e DOKUNULMAZ. Apple'ın silme şartı USER DATA içindir;
  //   abonelik iptali kullanıcının App Store ayarlarından kendi yaptığı ayrı bir işlemdir.
  //   Premium UI flag'i (setIsPremium(false)) sadece görsel reset; restore ile geri gelir.
  const deleteAccountData = () => {
    try { haptic(ImpactStyle.Heavy); } catch(_) {}
    // 1) localStorage: sakin_ ile başlayan tüm anahtarları topla ve sil (iterasyon
    //    sırasında silmek index kaymasına yol açar — önce topla, sonra sil).
    try {
      const toRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("sakin_")) toRemove.push(k);
      }
      toRemove.forEach(k => { try { localStorage.removeItem(k); } catch(_) {} });
    } catch(_) {}
    // 2) sessionStorage: intro flag'i kaldır ki kullanıcı temiz başlasın.
    try { sessionStorage.removeItem("sakin_intro_seen"); } catch(_) {}
    // 3) React state reset — localStorage temizliğinden sonra mount değerleri stale
    //    olabilir; setter'larla zorla sıfırla.
    setUserName(""); setNameInput(""); setIdCardName("");
    setBirthDate(""); setBirthInput("");
    setBirthTime(""); setBirthTimeInput("");
    setBirthCity(""); setBirthCityInput("");
    setNiyet(""); setSelectedWords([]);
    setBreathCount(0); setBreathStarted(false); setBreathMode("standart"); setBreathPhase("ready");
    setAksamNote(""); setSukur(""); setAksamRitualChecks([false,false,false]);
    setFreqListenSec(0);
    setSorguGecmisi([]);
    setStreakData({ current: 0, best: 0, lastDate: null, badges: [] });
    setStepsCompleted({});
    setChakraInput(""); setChakraAnaliz("");
    setSemptomInput(""); setSemptomAnaliz("");
    setSikayet(""); setSikayetHis(""); setSikayetAnaliz("");
    setHastalik(""); setHastalikHis(""); setHastalikAnaliz("");
    setAiRapor("");
    setAiConsent(false);
    setRaporKullanildi(false);
    setReikiUsed(false); setZihinselUsed(false);
    setIsPremium(false); // sadece UI flag — Apple subscription'a dokunulmadı (yukarı bak)
    // 4) UI: tüm modal/panel kapat, kullanıcıyı temiz giris/intro'ya götür.
    setShowDeleteConfirm(false);
    setShowAilesi(false);
    setAilesiEditBirth(false);
    setEmbeddedApp(null); setEmbedLoaded(false); setEmbedQuotaExceeded(false);
    setGirisPhase("intro");
    setScreen("giris");
    // 5) Kısa onay tost'u — 2.5sn sonra otomatik kapan.
    setDeleteToast(t("delete_done_toast"));
    setTimeout(() => setDeleteToast(""), 2500);
  };

  const playStartChime = () => {
    try {
      if (!breathChimeRef.current) {
        breathChimeRef.current = __makeAudioCtx();
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

  // Yıldız geçidi açılış sesi — uzun, dalgalı, derin
  const playPortalSound = () => {
    try {
      if (!breathChimeRef.current) {
        breathChimeRef.current = __makeAudioCtx();
      }
      const ctx = breathChimeRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const t0 = ctx.currentTime;
      // Yavaş yükselen drone — yıldız geçidi açılışı (3 notalı çekirdek)
      [[392, 0.0, 1.6, 0.08], [523, 0.25, 1.7, 0.09], [784, 0.55, 1.6, 0.08]].forEach(([f, delay, dur, amp]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine"; o.frequency.setValueAtTime(f, t0 + delay);
        o.frequency.linearRampToValueAtTime(f * 1.08, t0 + delay + dur);
        g.gain.setValueAtTime(0, t0 + delay);
        g.gain.linearRampToValueAtTime(amp, t0 + delay + 0.25);
        g.gain.linearRampToValueAtTime(amp * 0.7, t0 + delay + dur * 0.6);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + delay + dur);
        o.connect(g); g.connect(ctx.destination);
        o.start(t0 + delay); o.stop(t0 + delay + dur);
      });
      // Yumuşak nefes/whoosh — alt frekans dalga
      [[110, 0.0, 2.0, 0.05, "triangle"], [165, 0.4, 1.6, 0.04, "triangle"]].forEach(([f, delay, dur, amp, type]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type; o.frequency.setValueAtTime(f, t0 + delay);
        o.frequency.linearRampToValueAtTime(f * 1.5, t0 + delay + dur);
        g.gain.setValueAtTime(0, t0 + delay);
        g.gain.linearRampToValueAtTime(amp, t0 + delay + 0.3);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + delay + dur);
        o.connect(g); g.connect(ctx.destination);
        o.start(t0 + delay); o.stop(t0 + delay + dur);
      });
      // Yüksek ışıltı (kıvılcımlar)
      [1568, 2093, 2637].forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine"; o.frequency.value = f;
        const d = 0.5 + i*0.2, dl = 0.6 + i*0.18;
        g.gain.setValueAtTime(0, t0 + dl);
        g.gain.linearRampToValueAtTime(0.02, t0 + dl + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dl + d);
        o.connect(g); g.connect(ctx.destination);
        o.start(t0 + dl); o.stop(t0 + dl + d);
      });
    } catch(_) {}
  };

  const astro = birthDate ? {
    yasam:      lifePathNumber(birthDate),
    kisiselYil: personalYear(birthDate),
    burc:       zodiacSign(birthDate),
    bio:        biorhythm(birthDate),
  } : null;

  // Doğum şehri varsa gerçek yükselen (yıldız zamanı + koordinat); yoksa kaba tahmin
  const yukselen   = birthDate && birthTime
    ? preciseAscendant(birthDate, birthTime, birthCity)
    : null;
  const ev12Burcu  = yukselen ? ZODIAC_ORDER[(ZODIAC_ORDER.indexOf(yukselen) - 1 + 12) % 12] : null;
  const ev12Gezegen= ev12Burcu ? EV_GEZEGEN[ev12Burcu] : null;
  const kuzeyDugum = birthDate ? approxNorthNode(birthDate) : null;
  const draconicGunes = astro && kuzeyDugum ? draconicSun(astro.burc, kuzeyDugum) : null;

  useEffect(() => { const t=setInterval(()=>setTime(new Date()),1000); return()=>clearInterval(t); },[]);
  useEffect(() => { if (isNative) SplashScreen.hide(); }, []);
  // lang bağımlılığı: dil değişince bildirimler yeni dilde yeniden planlanır
  useEffect(() => { scheduleDailyReminders(lang); }, [lang]);
  // Kilit ekranı / Control Center / Dynamic Island uzaktan kumanda olayları.
  // Native Swift plugin (SakinNowPlaying.swift) play/pause/stop'a basıldığında
  // window.dispatchEvent ile bildirir; biz Web Audio durdurma yoluna aktarırız.
  useEffect(() => {
    if (!isNative) return;
    const off = onRemoteCommand({
      onPause:  () => { stopFreqToneGlobal(); },
      onStop:   () => { stopFreqToneGlobal(); },
      onToggle: () => { stopFreqToneGlobal(); },
      // Play (resume): aynı Hz'i yeniden başlat. AVAudioSession aktif olduğu için
      // arka plandan resume edebiliriz; setPlayingHz state akışını korumak için
      // sade bir custom event dispatch ediyoruz — ses ekranı zaten açıksa kullanıcı
      // butona basacak. Lock-screen Play'i şu an "stop"a eşitliyoruz çünkü Web Audio
      // arka planda yeniden createOscillator'ı tutarlı şekilde yapamıyor.
      onPlay:   () => { /* no-op; arka planda yeni oscillator yaratmak iOS WKWebView'da güvenilmez */ },
    });
    return off;
  }, []);
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
  // Galaktik kimlik kartındaki "element dağılımı" — KÖK SEBEP: bu veri sadece
  // Sakin Tasarım (Human Design) embed'i AÇILIP kendi grafiğini hesapladığında
  // same-origin localStorage'a yazılıyor (apps/tasarim HomeScreen useEffect'i).
  // Kullanıcı doğum bilgisini girdikten sonra kartı önce açarsa (Tasarım'ı hiç
  // ziyaret etmeden) bölüm boş kalıyor; Tasarım'a girip döndüğünde "geç" ortaya
  // çıkıyor gibi görünüyor — kullanıcıyı yanıltan asıl neden bu gecikme.
  // Çözüm: doğum bilgisi tamamlanır tamamlanmaz Tasarım'ı GÖRÜNMEZ bir iframe'de
  // arka planda bir kez açıp kendi hesaplamasını yapmasına izin ver, veriyi
  // localStorage'a erkenden yazsın. Kart ilk açıldığında veri artık hazır olur.
  const hdPreloadDone = useRef(false);
  const [hdPreloadSrc, setHdPreloadSrc] = useState(null);
  useEffect(() => {
    if (hdPreloadDone.current) return;
    if (!birthDate || !birthTime || !birthCity) return;
    if (localStorage.getItem("sakin_element_dist")) { hdPreloadDone.current = true; return; }
    hdPreloadDone.current = true;
    setHdPreloadSrc("/embedded/humandesign/index.html?bg=1");
    // Tasarım'ın AsyncStorage okuma + grafik hesaplama + HomeScreen yazma
    // zincirini tamamlaması için birkaç saniye arka planda tutup sonra kaldır.
    const timer = setTimeout(() => setHdPreloadSrc(null), 6000);
    return () => clearTimeout(timer);
  }, [birthDate, birthTime, birthCity]);
  // rehber screen is now enabled on iOS via the mirror portal
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

  // ANDROID DONANIM GERİ TUŞU: @capacitor/app'in varsayılan davranışı, geri
  // gidecek WebView geçmişi yoksa uygulamadan doğrudan çıkmak. Modaller (Ailesi,
  // kimlik kartı, zihni boşalt, embed vb.) plain useState ile açılıyor — history'ye
  // pushlanmıyor — o yüzden "üstte açık bir modal varken geri tuşuna basınca
  // uygulama kapanıyor" şikayeti oluyordu. Öncelik sırası: en üstteki modalı kapat
  // → yoksa ekran geçmişinde geri git → o da yoksa (kök ekran) uygulamadan çık.
  useEffect(() => {
    if (!isNative || Capacitor.getPlatform() !== "android") return;
    const sub = CapacitorApp.addListener("backButton", () => {
      if (embeddedApp) { setEmbeddedApp(null); setEmbedLoaded(false); setEmbedQuotaExceeded(false); return; }
      if (activeMindMode) { setActiveMindMode(null); setShowMindClear(false); setSelectedNature([]); return; }
      if (showMindClear) { setShowMindClear(false); setSelectedMoods([]); setSelectedNature([]); return; }
      if (showIdCard) { closeIdCard(); return; } // Keşfet'ten açıldıysa oraya döner
      if (showFotoTani) { setShowFotoTani(false); return; }
      if (showLicenseModal) { setShowLicenseModal(false); return; }
      if (showAiConsent) { setShowAiConsent(false); return; }
      if (showDeleteConfirm) { setShowDeleteConfirm(false); return; }
      // showBackConfirm SakinApp scope'unda değil — TerapiScreen'e özel kendi
      // state'i, o ekranın kendi geri tuşu/onay akışı ayrı yönetiliyor, buraya dahil edilmez.
      if (showKilavuz) { setShowKilavuz(false); return; }
      if (showOrnekler) { setShowOrnekler(false); return; }
      if (showKozmik) { setShowKozmik(false); return; }
      if (showKimlikReveal) { setShowKimlikReveal(false); return; }
      if (showNedir) { setShowNedir(false); return; }
      if (showAilesi) { setShowAilesi(false); return; }
      if (screenHistoryRef.current.length > 1) { history.back(); return; }
      CapacitorApp.exitApp();
    });
    return () => { sub.then(s => s.remove()).catch(() => {}); };
  }, [embeddedApp, activeMindMode, showMindClear, showIdCard, showFotoTani, showLicenseModal, showAiConsent, showDeleteConfirm, showKilavuz, showOrnekler, showKozmik, showKimlikReveal, showNedir, showAilesi]);

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
    // Rapor haftalık sabit — veride değişiklik olsa da bu haftanın cache'li raporunu KORU/yeniden yükle.
    try { if (localStorage.getItem("sakin_rapor_week") === currentWeekKey()) { const _c = localStorage.getItem("sakin_rapor_text"); if (_c) setAiRapor(_c); } } catch {}
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
  // ── GÖREV İSTE (İçsel Ayna) ────────────────────────────────────────────────
  // Kullanıcı: "ilahi kanaldan bir hatırlatma, bir görev verilir. Doğum
  // verilerine göre öğrenmeye/aşmaya çalıştığı şeyle ilgili bir deneyim
  // önerilir. Çok boyutlu düşün, oyun gibi: karakterini geliştiren bir oyuncu."
  //
  // OYUN MANTIĞI: her görev bir "deneyim". Tamamlanan görevler sayılır ve
  // kullanıcının yolculuk seviyesiyle birlikte derinleşir. Görev İSTEMEK
  // ucuz değil: ilkinden sonra YENİ görev için TÜNELİN AÇIK olması gerekir
  // (günün 7 adımı tamamlanıp yer-gök arasındaki ışık başlamış olmalı).
  // Böylece görev bir ödül olur, sonsuz yenilenebilen bir buton değil.
  const [gorev, setGorev] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sakin_gorev") || "null"); } catch { return null; }
  });
  const [gorevLoading, setGorevLoading] = useState(false);
  const gorevSayisi = (() => { try { return parseInt(localStorage.getItem("sakin_gorev_n")) || 0; } catch { return 0; } })();
  // KAPI: ilk görev serbest. Sonraki görev için TÜNEL AÇIK olmalı (günün 7 adımı
  // tamamlanıp yer-gök ışığı başlamış). Tünel bugün bir kez kullanılınca yarına
  // kadar kapanır — yoksa aynı gün sınırsız görev alınırdı.
  // Böylece kullanıcının iki yolu olur: BUGÜN bağlantıyı tamamla, ya da YARIN.
  const gorevBugunAlindi = !!gorev && gorev.gun === todayKey;
  const gorevTunelBugunKullanildi = !!gorev && gorev.tunelGunu === todayKey;
  const gorevIstenebilir = !gorevLoading &&
    (gorevSayisi === 0 || (allStepsComplete && !gorevTunelBugunKullanildi));

  const GOREV_TXT = {
    btn:      {tr:"GÖREV İSTE",en:"REQUEST A MISSION",de:"AUFGABE ANFORDERN",es:"PEDIR MISIÓN",pt:"PEDIR MISSÃO",fr:"DEMANDER UNE MISSION",ja:"任務を受け取る"},
    connecting:{tr:"Yüksek benlik ile bağlantı kuruluyor…",en:"Connecting with your higher self…",de:"Verbindung zum höheren Selbst…",es:"Conectando con tu yo superior…",pt:"A ligar ao teu eu superior…",fr:"Connexion au moi supérieur…",ja:"ハイヤーセルフと接続中…"},
    // Kullanıcı: "yeni görev isteyebilmek için ne yapması gerektiği bilgisi yok."
    // İKİ YOL da açıkça yazılır: bugün Bağlan'daki 7 adımı tamamla, ya da yarın.
    locked:   {tr:"Yeni görev için iki yol var: Bağlan bölümündeki günün 7 adımını tamamla — ışık yerden göğe açılınca kanal yeniden kurulur. Ya da yarın yeni bir görev iste.",en:"Two ways to a new mission: complete the seven steps of the day in Connect — when the light opens from earth to sky, the channel reopens. Or ask again tomorrow.",de:"Zwei Wege zu einer neuen Aufgabe: Vollende die sieben Schritte des Tages unter Verbinden — öffnet sich das Licht von der Erde zum Himmel, öffnet sich der Kanal. Oder frag morgen erneut.",es:"Dos caminos hacia una nueva misión: completa los siete pasos del día en Conectar — cuando la luz se abre de la tierra al cielo, el canal se reabre. O pide otra mañana.",pt:"Dois caminhos para uma nova missão: completa os sete passos do dia em Ligar — quando a luz se abre da terra ao céu, o canal reabre. Ou pede outra amanhã.",fr:"Deux chemins vers une nouvelle mission : termine les sept étapes du jour dans Connexion — quand la lumière s'ouvre de la terre au ciel, le canal rouvre. Ou redemande demain.",ja:"新しい任務への道は二つ。「つながる」で今日の七つの歩みを終えると、光が地から天へ開き通路が戻ります。または明日また求めてください。"},
    // Tünel bugün zaten kullanıldı → tek kalan yol yarın.
    today:    {tr:"Bugünkü kanal kullanıldı. Yarın yeniden açılır.",en:"Today's channel has been used. It reopens tomorrow.",de:"Der heutige Kanal wurde genutzt. Morgen öffnet er sich wieder.",es:"El canal de hoy ya se usó. Se reabre mañana.",pt:"O canal de hoje foi usado. Reabre amanhã.",fr:"Le canal du jour a été utilisé. Il rouvrira demain.",ja:"今日の通路は使われました。明日また開きます。"},
    label:    {tr:"GÖREV",en:"MISSION",de:"AUFGABE",es:"MISIÓN",pt:"MISSÃO",fr:"MISSION",ja:"任務"},
    done:     {tr:"TAMAMLADIM",en:"COMPLETED",de:"ERLEDIGT",es:"COMPLETADA",pt:"CONCLUÍDA",fr:"TERMINÉE",ja:"完了"},
    count:    {tr:"deneyim",en:"experiences",de:"Erfahrungen",es:"experiencias",pt:"experiências",fr:"expériences",ja:"の経験"},
  };

  // ── GÖREV ÇIKTISINI TEMİZLE VE DOĞRULA ────────────────────────────────────
  // Modelden gelen metin üç şekilde bozulabiliyordu (kullanıcı görselinde
  // üçü de görüldü):
  //   1) Ayna önsözü ("Bu yanıt sana özeldir…") göreve de ekleniyordu.
  //   2) "Görev Başlığı:" etiketi düz metne yazılıyordu (ben başlık İSTEMİŞTİM,
  //      model bunu etiket sandı).
  //   3) Model tekrar döngüsüne giriyordu ("tutututututu…") ve Türkçe metne
  //      İngilizce kelime yapıştırıyordu ("experiencesini", "datasındaki").
  // Bozuk çıktı KABUL EDİLMEZ: null döner, sayaç artmaz, kapı harcanmaz —
  // kullanıcı tekrar deneyebilir.
  const GOREV_YABANCI = /\b(data|thing|experience|feeling|energy|balance|focus|journey|growth|freedom|mind|body|shadow)[a-zçğıöşü]*/i;
  const temizleGorev = (ham) => {
    let t = String(ham || "").trim();
    if (!t) return null;
    // Ayna önsözü (modelin yine de eklediği durumlar için emniyet kemeri)
    t = t.replace(/^\s*"?Bu yanıt sana özeldir\.[^\n]*\n?/i, "").trim();
    t = t.replace(/^\s*"?This (?:answer|response) is (?:for|yours)[^\n]*\n?/i, "").trim();
    // "Görev Başlığı:" / "Mission Title:" etiketleri
    t = t.replace(/^\s*(?:Görev\s*Başlığı|Mission\s*Title)\s*:\s*/gim, "");
    // Markdown kalıntısı
    t = t.replace(/\*\*/g, "").trim();
    if (t.length < 40) return null;
    // TEKRAR DÖNGÜSÜ: 2-6 harflik bir parça arka arkaya 6+ kez tekrarlıyorsa bozuk
    if (/([a-zçğıöşüA-ZÇĞİÖŞÜ]{2,6}?)\1{5,}/.test(t)) return null;
    // Türkçe metinde İngilizce kelime sızıntısı
    if (lang === "tr" && GOREV_YABANCI.test(t)) return null;
    return t;
  };

  const gorevIste = async () => {
    if (!gorevIstenebilir) return;
    if (!_aiDailyOk()) { setGorev({ gun: todayKey, metin: _aiLimitMsg(), n: gorevSayisi }); return; }
    setGorevLoading(true);
    try {
      const seviye = streakData?.current >= 21 ? 3 : streakData?.current >= 7 ? 2 : 1;
      const res = await fetch(AI_CALL_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", max_tokens: 420, lang,
          // DİL: prompt gövdesi TAMAMEN seçili dilde olmalı. Kod tabanında zaten
          // belgeli tuzak (bkz. buildMirrorSystemPrompt üstündeki not): Türkçe
          // gövdeye tek satır "write in English" eklemek YETMİYOR, model gövdedeki
          // Türkçeyi kopyalayıp karışık metin üretiyor. Bu yüzden tr / diğer
          // dillerde iki AYRI gövde var ve kullanıcı mesajı da dile uyuyor.
          system: `${buildMirrorSystemPrompt(lang, false)}

${lang === "tr" ? `Şimdi bir GÖREV VERİYORSUN. Bu, kullanıcının ruhsal yolculuğunda karakterini
geliştiren tek bir deneyimdir — bir oyunda verilen görev gibi somut, yapılabilir
ve o kişiye özel. Kuralları:
- SADECE BİR görev ver. Liste yapma.
- Görev BUGÜN yapılabilir olmalı; 5-30 dakika sürsün. Para gerektirmesin.
- Kişinin doğum verilerinden okunan ÖĞRENME ALANIYLA ilgili olsun (12. ev,
  yaşam yolu, yükselen, karmik kalıp). Bu bağlantıyı bir cümleyle açıkla.
- Fiziksel dünyada bir EYLEM içersin (yazmak, konuşmak, yürümek, susmak,
  birine ulaşmak, bir şeyi bırakmak gibi) — sadece düşünmek yeterli değil.
- Tıbbi, finansal, hukuki tavsiye verme. Tehlikeli ya da başkasına zarar
  verebilecek bir şey isteme.
- Biçim: önce 3-6 kelimelik bir GÖREV BAŞLIĞI, sonra boş satır, sonra 2-4
  cümlelik anlatım, sonra boş satır, son satırda "Neden sen:" ile başlayan
  tek cümlelik kişisel gerekçe.
- Yıldız, madde imi, markdown KULLANMA. Sade düz metin yaz.
- Tek kelime bile başka dilde yazma; tamamı Türkçe olsun.` : `You are now GIVING A MISSION: a single lived experience that develops the
user's character on their inner journey — concrete, doable and personal, like
a quest in a game. Rules:
- Give exactly ONE mission. No lists.
- It must be doable TODAY, take 5-30 minutes, and cost nothing.
- Tie it to the LEARNING EDGE read from their birth data (12th house, life
  path, ascendant, karmic pattern). Name that link in one sentence.
- It must involve an ACTION in the physical world (writing, speaking, walking,
  staying silent, reaching out, letting something go) — thinking is not enough.
- No medical, financial or legal advice. Nothing dangerous or harmful to others.
- Format: a 3-6 word MISSION TITLE, blank line, 2-4 sentences of description,
  blank line, a final single sentence starting with "Why you:".
- Do NOT use asterisks, bullets or markdown. Plain text only.
- Write entirely in ${AI_LANG_NAMES[lang] || "English"}; do not mix in any other language.`}
${kisiselProfil()}`,
          messages: [{ role: "user", content: lang === "tr"
            ? `Yolculuk seviyem: ${seviye}. Bugüne kadar aldığım görev sayısı: ${gorevSayisi}. Bana bugün için bir görev ver.`
            : `My journey level: ${seviye}. Missions received so far: ${gorevSayisi}. Give me a mission for today.` }],
        }),
      });
      const j = await res.json();
      const metin = temizleGorev(j?.text || j?.content);
      if (!metin) throw new Error("bozuk");   // sayaç artmaz, kapı harcanmaz
      // tunelGunu: bu görev TÜNEL AÇIKKEN alındıysa o günü işaretle; aynı gün
      // ikinci kez tünelden görev alınamasın.
      const yeni = { gun: todayKey, metin, n: gorevSayisi + 1,
                     tunelGunu: allStepsComplete ? todayKey : (gorev?.tunelGunu || null) };
      setGorev(yeni);
      try {
        localStorage.setItem("sakin_gorev", JSON.stringify(yeni));
        localStorage.setItem("sakin_gorev_n", String(gorevSayisi + 1));
      } catch (_) {}
    } catch (_) {
      // Hata metni i18n'de ayrı bir anahtar gerektirmesin — 7 dilde inline.
      setGorev({ gun: todayKey, metin: pickLang({
        tr:"Kanal şu an açılmadı. Biraz sonra tekrar dene.",
        en:"The channel did not open just now. Try again in a little while.",
        de:"Der Kanal hat sich gerade nicht geöffnet. Versuch es gleich noch einmal.",
        es:"El canal no se abrió ahora. Inténtalo de nuevo en un rato.",
        pt:"O canal não abriu agora. Tenta novamente daqui a pouco.",
        fr:"Le canal ne s'est pas ouvert. Réessaie dans un moment.",
        ja:"いま通路は開きませんでした。少ししてからもう一度。" }, lang), n: gorevSayisi });
    }
    setGorevLoading(false);
  };

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
          model:"llama-3.3-70b-versatile", max_tokens:1100, lang,
          system:`${buildMirrorSystemPrompt(lang)}
${kisiselProfil()}${kisiselBagiam}${KITAP_BILGELIGI}`,
          ragQuery: chakraInput,
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
      setChakraAnaliz(d?.text || pickLang(AI_ERR_I18N.noAnalysis, lang));
      sorguKaydet("çakra", chakraInput);
    } catch(e) {
      setChakraAnaliz(t("err_connection_prefix") + (e?.message || String(e)));
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
    { organ:"Uyku",           neden:"Hayattan uzaklaşma isteği, güvensizlik, zihni durduramama" },
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
          model:"llama-3.3-70b-versatile", max_tokens:1200, lang,
          system:`${buildMirrorSystemPrompt(lang)}
${kisiselProfil()}${kisiselBagiam}${KITAP_BILGELIGI}`,
          ragQuery: semptomInput,
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
      setSemptomAnaliz(d?.text || pickLang(AI_ERR_I18N.noAnalysis, lang));
      sorguKaydet("semptom", semptomInput);
    } catch {
      setSemptomAnaliz(pickLang(AI_ERR_I18N.connError, lang));
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
          model:"llama-3.3-70b-versatile", max_tokens:1100, lang,
          system:`${buildMirrorSystemPrompt(lang)}
${kisiselProfil()}${kisiselBagiam}${KITAP_BILGELIGI}`,
          ragQuery: sikayet,
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
      setSikayetAnaliz(d?.text || pickLang(AI_ERR_I18N.noAnalysis, lang));
      sorguKaydet("şikayet", sikayet);
    } catch(e) { setSikayetAnaliz(t("err_connection_prefix") + (e?.message || String(e))); console.error("SikayetAnaliz error:", e); }
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
          model:"llama-3.3-70b-versatile", max_tokens:1300, lang,
          system:`${buildMirrorSystemPrompt(lang)}
${kisiselProfil()}${kisiselBagiam}${KITAP_BILGELIGI}`,
          ragQuery: hastalik,
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
      setHastalikAnaliz(d?.text || pickLang(AI_ERR_I18N.noAnalysis, lang));
      sorguKaydet("hastalık", hastalik);
    } catch(e) { setHastalikAnaliz(t("err_connection_prefix") + (e?.message || String(e))); console.error("HastalikAnaliz error:", e); }
  };

  const generateRapor = async () => {
    const gunler = JSON.parse(localStorage.getItem("sakin_log")||"[]");
    // Yeterli iz yoksa sessizce çıkma — kullanıcıyı şefkatle bilgilendir (en az 2 gün).
    if (gunler.length < 2) { setRaporMesaj(t("report_need_data")); return; }
    setRaporMesaj("");

    const _wk = currentWeekKey();
    // Bu haftanın raporu zaten üretildiyse → AYNISINI göster (1 hafta sabit, yeniden üretme/çağrı yapma)
    try {
      if (localStorage.getItem("sakin_rapor_week") === _wk) {
        const cached = localStorage.getItem("sakin_rapor_text");
        if (cached) { setAiRapor(cached); return; }
      }
    } catch {}

    // IP bazlı kontrol — HAFTALIK (yeni hafta = yeni rapor hakkı)
    try {
      const ipRes = await fetch("https://api.ipify.org?format=json");
      const { ip } = await ipRes.json();
      const kullanim = JSON.parse(localStorage.getItem("sakin_rapor_kullanim")||"{}");
      const _ipwk = ip + "_" + _wk;
      if ((kullanim[_ipwk]||0) >= 1) {
        // Bu hafta zaten üretildi → mesaj gösterme, AYNI raporu geri yükle.
        const cached = (() => { try { return localStorage.getItem("sakin_rapor_text"); } catch { return null; } })();
        if (cached) { setAiRapor(cached); return; }
        // Cache yoksa engelleme — üretime devam et (kullanıcı raporsuz kalmasın).
      }
      kullanim[_ipwk] = 1;
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
      const kRes = await fetch(API_BASE + "/.netlify/functions/cosmic-energy?lang=" + encodeURIComponent(lang));
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
- 12. Ev Gizli Gücü: ${GEZEGEN_12EV_GUCLERI.tr[ev12Gezegen]||""}` : ""}

Bu bilgileri haftalık yorum yaparken dikkate al. Burç enerjisini, yaşam yolu sayısının özelliklerini ve biyoritm durumunu rapora yansıt.${yukselen ? ` 12. Ev verisini 'Gizli Benlik & Gölge' bölümünde kişiye özel sentezle: ${ev12Gezegen} enerjisiyle bağlantılı bastırılmış temalar ve bu kişinin gizli güçleri.` : ""}
` : "";

    try {
      const res = await fetch(AI_CALL_URL, {
        method:"POST",
        headers:{"Content-Type":"text/plain"},
        body: JSON.stringify({
          model:"llama-3.3-70b-versatile", max_tokens:1700, lang,
          system:`${buildReportSystemPrompt(lang)}
${kisiselProfil()}${astroText}${kozmikText}
${GIZLI_BENLIK_REHBER}
${KITAP_BILGELIGI}

${lang === "tr"
  ? `Rapor şu başlıkları içermeli:
**Haftanın Yansıması** — Genel ruh hali, enerji ve burç/sayı etkisi — net ve doğrudan yansıt (2-3 cümle)
**Öne Çıkan Temalar** — Tekrar eden kelimeler ve çakra örüntüleri — kaynağa doğrudan işaret et
**İçsel Büyüme** — Öğrenilen şeylerden çıkarılan anlam — kişinin kendi içinde gördüklerini yansıt
**Gizli Benlik & Gölge** — Bu haftanın verilerinde 12. ev perspektifinden görülen bastırılmış temalar; bütünleşme için nazik bir davet (2-3 cümle, şiirsel)
**Frekans & Ses Yolculuğu** — Haftalık frekans dinleme süresi ve bu sürenin enerji bedenine etkisi (1-2 cümle)
**Şükran Kalbi** — Şükür yazılarından bir sentez
**Sana Bir Davet** — Bu hafta kendine nasıl sevgi sunabilirsin, nereye bakabilirsin — eleştiri değil, davet (2-3 madde)
**Hatırla** — Bu hafta kendine hatırlatman gereken en önemli 2-3 şey (kısa, öz)
**Gelecek Haftaya Niyet** — Kısa, ilham verici bir öneri${astro ? "\n**Kozmik Not** — Bu haftanın biyoritmi ve sayısal/burç enerjisi hakkında kısa bir not" : ""}${kozmikText ? "\n**Kozmik Enerji Durumu** — Bu hafta jeomanyetik aktivite, güneş fırtınaları ve önümüzdeki 3 günün tahminine dair yorum. Yüksek Kp dönemleri kişinin yaşadıklarıyla nasıl rezonans ettiğini şefkatle yansıt. Önümüzdeki günlere dair hazırlık daveti (3-4 cümle, somut)" : ""}

Samimi, nazik, biraz şiirsel bir dil kullan. "Sen" diye hitap et. Maksimum 620 kelime.`
  : `The report MUST include the following sections (translate each section heading naturally into ${AI_LANG_NAMES[lang] || "English"}; keep the **bold** markdown around each heading):
**Reflection of the Week** — Overall mood, energy and zodiac/number influence — clear and direct (2-3 sentences)
**Recurring Themes** — Repeating words and chakra patterns — point directly at the source
**Inner Growth** — Meaning extracted from what was learned — reflect what the person saw inside themselves
**Hidden Self & Shadow** — Suppressed themes seen through the 12th-house lens in this week's data; a gentle invitation toward integration (2-3 poetic sentences)
**Frequency & Sound Journey** — Weekly frequency-listening duration and its effect on the energy body (1-2 sentences)
**Heart of Gratitude** — A synthesis of the gratitude entries
**An Invitation** — How can you offer yourself love this week, where can you look — invitation, not criticism (2-3 bullets)
**Remember** — The 2-3 most important things to remind yourself this week (short, concise)
**Intention for Next Week** — A short, inspiring suggestion${astro ? "\n**Cosmic Note** — A short note on this week's biorhythm and numerological/zodiac energy" : ""}${kozmikText ? "\n**Cosmic Energy State** — Commentary on this week's geomagnetic activity, solar storms, and the 3-day forecast. Reflect with compassion how high-Kp periods resonate with what the person lived. An invitation to prepare for the coming days (3-4 concrete sentences)" : ""}

Use warm, gentle, slightly poetic language. Address the reader with the informal "you" equivalent in ${AI_LANG_NAMES[lang] || "English"}. Maximum 620 words.`}`,
          ragQuery: (gunlerText || "").slice(0, 500),
          messages:[{role:"user",content:`Bu haftaki günlük verilerim:\n\n${gunlerText}${freqOzet}\n\nLütfen haftalık içsel raporumu oluştur.`}]
        })
      });
      const data = await res.json();
      const text = data.text;
      if (text) {
        localStorage.setItem("sakin_rapor_used", "1");
        setRaporKullanildi(true);
      }
      const _final = text || data.error?.message || pickLang(AI_ERR_I18N.noReport, lang);
      setAiRapor(_final);
      // Haftalık cache — 1 hafta boyunca aynı rapor; kapatıp tekrar açınca geri yüklenir.
      if (text) { try { localStorage.setItem("sakin_rapor_text", text); localStorage.setItem("sakin_rapor_week", _wk); } catch {} }
    } catch(e) { setAiRapor(t("err_connection_full")); console.error("AiRapor error:", e); }
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
    // PANİK BUTONU: en uygun sakinleştirici tekniği (4-7-8) doğrudan başlat —
    // premium kilidi olsa bile (panik istisnası), kullanıcıya sormadan.
    if (screen === "nefes" && panicAutoStartRef.current) {
      panicAutoStartRef.current = false;
      try { playStartChime(); } catch(_) {}
      setBreathPhase("ready");
      setBreathStarted(true);
    }
  },[screen]);

  // ── NEFES İŞARETİ: KONUŞMA YERİNE YUMUŞAK TON ─────────────────────────────
  // Kullanıcı: "inhale/hold/exhale ses çok robotik, sakin huzurlu bir ses daha
  // iyi olur" → "konuşmayı kaldırıp yumuşak ton deneyelim".
  // Cihazın TTS motoru kullanıldığı için ses her telefonda farklı ve sentetik
  // duyuluyordu. Artık konuşma YOK: nefes al = yumuşakça YÜKSELEN, nefes ver =
  // ALÇALAN sine tonu. Faz adı zaten ekranda yazdığı için bilgi kaybı olmuyor.
  // Tutuş/dinlenme fazları SESSİZ — en sakin seçenek.
  // Sine dalga + uzun attack/release: tık ve sertlik olmaz.
  const breathToneCtxRef = useRef(null);
  const playBreathTone = (phase) => {
    if (phase !== "inhale" && phase !== "exhale") return;   // hold/hold2 sessiz
    try {
      if (!breathToneCtxRef.current) breathToneCtxRef.current = __makeAudioCtx();
      const ctx = breathToneCtxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") { try { ctx.resume(); } catch (_) {} }
      const t0 = ctx.currentTime;
      const [f0, f1] = phase === "inhale" ? [196, 294] : [294, 196];  // sol3 ↔ re4
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(f0, t0);
      o.frequency.linearRampToValueAtTime(f1, t0 + 0.95);   // nefesin kendisi gibi kayan perde
      // Yumuşak giriş/çıkış — 0'dan başlayıp 0'a inince tık sesi olmaz.
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.085, t0 + 0.30);
      g.gain.linearRampToValueAtTime(0.060, t0 + 0.80);
      g.gain.exponentialRampToValueAtTime(0.0005, t0 + 1.35);
      o.connect(g); g.connect(ctx.destination);
      o.start(t0); o.stop(t0 + 1.4);
    } catch (_) {}
  };

  useEffect(() => {
    if (screen!=="nefes" || !breathStarted) return;
    const tm = BREATH_MODES_CONFIG[breathMode] || BREATH_MODES_CONFIG.standart;
    const toIds = [];
    const cycle = () => {
      setBreathPhase("inhale"); playBreathTone("inhale");
      let t = tm.in;
      if (tm.hold > 0)  { toIds.push(setTimeout(()=>{ setBreathPhase("hold"); playBreathTone("hold"); },  t)); t += tm.hold;  }
      toIds.push(setTimeout(()=>{ setBreathPhase("exhale"); playBreathTone("exhale"); }, t)); t += tm.out;
      if (tm.hold2 > 0) { toIds.push(setTimeout(()=>{ setBreathPhase("hold2"); playBreathTone("hold2"); }, t)); }
      toIds.push(setTimeout(()=>setBreathCount(c=>c+1), tm.total - 200));
    };
    setBreathPhase("ready");
    const startDelay = setTimeout(() => {
      cycle();
      breathRef.current = setInterval(cycle, tm.total);
    }, 600);
    return () => { clearInterval(breathRef.current); clearTimeout(startDelay); toIds.forEach(clearTimeout); cancelSpeech(); };
  },[screen, breathStarted, breathMode]);
  // Nefes seansı sürerken ekran kararmasın (kullanıcı gözü kapalı, dokunamıyor).
  useScreenWakeLock(screen === "nefes" && breathStarted);

  // ── GÜN GÖREVLERİ: UYGULAMA İÇİNDE YAPILANI OTOMATİK İŞARETLE ──────────────
  // Kullanıcı: "Nefes farkındalığını uygulamada açınca 1 dk sonra bu kutunun
  // otomatik checked olmasını ve gün listeme dönebilmeyi istedim... bu mantığı
  // app içine yönlendirdiğimiz diğer maddelere de uygula."
  // "Uygulamada aç" ile yönlendirilen görevler (REMINDER_GO) artık kullanıcı
  // işi GERÇEKTEN yapınca kendiliğinden tamamlanır; geri dönünce kutu dolu olur.
  // ReminderScreen her mount'ta localStorage'dan okuduğu için ekstra köprü gerekmez.
  const markReminderDone = (id) => {
    try {
      const k = "sakin_reminders_done_" + todayKey;
      const cur = JSON.parse(localStorage.getItem(k) || "{}");
      if (cur[id]) return;                       // zaten işaretli → gereksiz yazma yok
      cur[id] = true;
      localStorage.setItem(k, JSON.stringify(cur));
      setGunTasksDone(Object.values(cur).filter(Boolean).length);
    } catch (_) {}
  };
  // "Nefes farkındalığı" = 1 dakika. Nefes ekranında seans sürerken sayılır;
  // ekrandan çıkılıp dönülürse sayaç kaldığı yerden devam eder (ref'te tutulur).
  const reminderBreathSecRef = useRef(0);
  useEffect(() => {
    if (screen !== "nefes" || !breathStarted) return;
    const id = setInterval(() => {
      reminderBreathSecRef.current += 1;
      if (reminderBreathSecRef.current >= 60) markReminderDone("nefes");
    }, 1000);
    return () => clearInterval(id);
  }, [screen, breathStarted, todayKey]);
  // "Çakra anı" görevinin süre şartı yok (duration:null) — çakra terapisinde
  // bir an durmak yeterli. Terapi ekranında 30 sn geçirmek bunu karşılar.
  useEffect(() => {
    if (screen !== "terapi") return;
    const id = setInterval(() => {
      if (readTerapiSec() >= 30) markReminderDone("chakra_an");
    }, 1000);
    return () => clearInterval(id);
  }, [screen, todayKey]);

  // Nefes ekranı bir overlay ile kapandığında (Sakin Ailesi/embed, kimlik kartı,
  // zihni boşalt, ayna geçidi) nefesi TAMAMEN durdur: "nefes al/ver" sesi ve sayaç
  // arka planda sürmesin. Panik akışından girip başka menüye geçince de geçerli.
  useEffect(() => {
    const occluded = embeddedApp || showIdCard || showMindClear || activeMindMode || mirrorPortalActive;
    if (occluded && breathStarted) {
      setBreathStarted(false);
      setBreathPhase("ready");
      clearInterval(breathRef.current);
      cancelSpeech();
    }
  }, [embeddedApp, showIdCard, showMindClear, activeMindMode, mirrorPortalActive, breathStarted]);

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

  // Kullanıcı isteği: sağ/sol kaydırma sırası TAM OLARAK üst nav + sidebar sırasını
  // izlemeli — sabah→gün→nefes→ses→çakra→akşam→bağlan→harita→keşfet. Bağlan(mandala)
  // artık akşamdan HEMEN sonra (harita'dan önce) — kullanıcı: "akşamdan sonra bağlan
  // gelecek". "keşfet" bir `screen` değil, `showAilesi` modalı — zincirin son adımı
  // olarak ayrıca ele alınır (harita'dan ileri kaydırınca açılır).
  // KAYDIRMA ZİNCİRİ: sabah → … → akşam → İÇSEL HARİTA (son).
  // "bağlan" ÇIKARILDI (kullanıcı: "bağlan 1. ve 7. adımda geliyor, tekrara
  // düşüyor; kaydırmadan ve 7'den çıkart, içsel harita ile bitsin — isteyen
  // hamburgerden ulaşır"). Keşfet de zincirin sonundan kaldırıldı; böylece
  // kaydırma net bir başlangıç ve bitiş gösteriyor.
  const SWIPE_SCREENS = ["sabah","gun","nefes","ses","chakra","aksam","harita"];
  const touchStartRef = useRef(null);
  const handleTouchStart = e => { touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() }; };
  const handleTouchEnd = e => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.t;
    touchStartRef.current = null;
    if (dt > 500 || Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return;
    if (showAilesi) {
      // Keşfet zincirin son halkası — sağa kaydırma (geri) "harita"ya döner.
      if (dx > 60) { setShowAilesi(false); setScreen("harita"); }
      return;
    }
    const idx = SWIPE_SCREENS.indexOf(screen);
    if (idx === -1) return;
    if (dx < -60) {
      if (idx < SWIPE_SCREENS.length - 1) setScreen(SWIPE_SCREENS[idx + 1]);
      // "harita" zincirin SONU — ileri kaydırma bir şey açmaz (eskiden Keşfet açılırdı).
    }
    if (dx > 60 && idx > 0) setScreen(SWIPE_SCREENS[idx - 1]);
  };

  const ambientColor = {
    giris:"139,90,160",sabah:"220,130,50",nefes:"80,130,200",ses:"160,122,224",
    chakra:`${parseInt(chakra.color.slice(1,3),16)},${parseInt(chakra.color.slice(3,5),16)},${parseInt(chakra.color.slice(5,7),16)}`,
    gun:"120,90,180",terapi:"74,160,100",aksam:"60,70,140",harita:"100,80,180",rehber:"120,60,180",
  }[screen]||"139,90,160";

  const NAV = [
    {id:"sabah",  icon:"🌅", label:t("nav_morning"),               color:"#f0a060"},
    {id:"gun",    icon:"☀️", label:t("nav_day"),                   color:"#e8d060"},
    {id:"nefes",  icon:"🫧", label:t("nav_breath"),                color:"#60b8e8"},
    {id:"ses",    icon:"🔊", label:t("nav_sound"),                 color:"#a07ae0"},
    {id:"chakra", icon:"💜", label:t("nav_chakra"),                color:"#c07ae0"},
    {id:"aksam",  icon:"🌙", label:t("nav_evening"),               color:"#7ab0e0"},
  ];
  const SIDEBAR_ITEMS = [
    // Giriş: sadece ev ikonu (yazı yok) — üst barda kompakt buton
    {id:"giris",  icon:"⌂", label:"", color:"#c0a8e0", iconOnly:true},
    // Ayna (rehber) — ÜST NAV'A KOYMUYORUZ (ne iOS ne web). Her iki platformda
    // da sağ kenardaki floating ☽ gizli geçit ile açılır (App.jsx ~3951).
    // Bu satır web'de üst panelde "🪞 Ayna" yazı linki gösteriyordu — KALDIRILDI.
    {id:"mandala",icon:"◎",  label:pickLang(NEDIR_I18N.baglanT, lang), color:"#b87adc"},
    {id:"harita", icon:"🗺️", label:t("nav_map"),  color:"#82d9a3"},
    {id:"ailesi", icon:"✦", label:pickLang(NEDIR_I18N.kesfetT, lang), color:"#f0c060", glow:true},
  ];
  // Ayna (gizli geçit) açılışı — hem üst bardaki orta buton hem eski floating ☽
  // aynı davranışı kullansın diye tek fonksiyona çıkarıldı.
  const openMirror = () => {
    haptic();
    try {
      const ctx = __makeAudioCtx();
      const now = ctx.currentTime;
      [528, 792].forEach((freq, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine"; o.frequency.value = freq;
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.06 - i*0.025, now + 0.08);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
        o.connect(g).connect(ctx.destination);
        o.start(now); o.stop(now + 1.15);
      });
      setTimeout(() => { try { ctx.close(); } catch(_) {} }, 1300);
    } catch(_) {}
    // KEŞFET/EMBED AÇIKKEN AYNA ÇALIŞMIYORDU (kullanıcı bildirdi).
    // KÖK SEBEP: bu iki katman position:fixed + inset:0 ve üst bardan DAHA ALTTA
    // ama ekranı tamamen kaplıyor. setScreen("rehber") arkada çalışıyor, ekran
    // gerçekten değişiyor — ama üstteki panel kapanmadığı için kullanıcı hiçbir
    // şey olmamış gibi görüyor. Ayna açılmadan önce kapatılmaları gerekir.
    try { setShowAilesi(false); } catch(_) {}
    try { if (embeddedApp) { setEmbeddedApp(null); setEmbedLoaded(false); setEmbedQuotaExceeded(false); } } catch(_) {}
    setMirrorPortalActive(true);
    setTimeout(()=>{ setRehberTab("reiki"); setScreen("rehber"); setMirrorPortalActive(false); }, 1050);
  };

  const MORNING_WORDS = t("morning_words");
  const PREMIUM_WORDS = _localizeArr(PREMIUM_WORDS_EN, PREMIUM_WORDS_TR, NOTIF_TRANS.PREMIUM_WORDS, lang);

  const isPolicyScreen = ["hakkinda","fiyat","sartlar","gizlilik","iade"].includes(screen);
  // iOS'ta ana feature ekranlarında top-nav gizli; policy/giriş ekranlarında görünür.
  // Erişim: Ailesi panelinin altında policy linkleri her yerden 1 tıkla
  // iOS: topNav SADECE policy ekranlarında. Girişte topNav'ı GİZLE — yoksa
  // topNav (top:0) + Ayna/Harita barı (top:44+sat) üst üste binip sıkışık
  // görünüyordu (#6). Policy linklerine Ailesi panelinden erişiliyor zaten.
  // Web'de topNav her zaman görünür (üst marka/dil/policy çubuğu).
  const topNavVisible = !isNative || isPolicyScreen;
  // ÜST KESİLME DÜZELTMESİ (kullanıcı: "en üst kısımlar kesiliyor; bağlan'da geri
  // oku görünmüyor, harita/ses/gün üst kısma ulaşılamıyor").
  // Klasik flexbox tuzağı: align-items:center ile içerik kapsayıcıdan UZUN olduğunda
  // üst taraf kaydırılamaz alana taşar ("safe center" bu tarayıcıda tutmadı).
  // KESİN ÇÖZÜM: hizalama flex-start; dikey ortalama ise çocuklara verilen
  // margin-top/bottom:auto ile yapılır (CSS'te .sakin-app-root > *). Auto margin
  // taşma durumunda üstü ASLA kesmez — sığıyorsa ortalar, sığmıyorsa yukarıdan
  // başlar. position:fixed çocuklar akış dışı olduğu için etkilenmez.
  return (
    <div className={"sakin-app-root" + (matrixMode ? " matrix-mode" : "")} onMouseMove={handleMouseMove} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{ paddingTop: topNavVisible ? "calc(94px + var(--sat))" : "calc(50px + var(--sat))",background:"#000000",display:"flex",alignItems:"flex-start",justifyContent:"center",fontFamily:"'Inter',sans-serif",color:"#ffffff",position:"relative" }}>
      <style>{GLOBAL_CSS}</style>
      {/* MATRIX MODU katmanları — TÜM ekranları kapsar (Sakin paneli + embed app'ler dâhil) */}
      {matrixMode && (
        <>
          <MatrixRain />
          <div className="sakin-matrix-dim" aria-hidden="true" />
          <div className="sakin-matrix-tint" aria-hidden="true" />
          <div className="sakin-matrix-scan" aria-hidden="true" />
          <div className="sakin-matrix-vignette" aria-hidden="true" />
        </>
      )}
      {/* AÇIK TEMA katmanları — tüm ekranları krem/açık tona çevirir */}
      {lightMode && (
        <>
          <div className="sakin-light-invert" aria-hidden="true" />
          <div className="sakin-light-veil" aria-hidden="true" />
        </>
      )}
      {/* iOS WKWebView'in AVAudioSession rotasını açık tutan sessiz loop ses. Frekans
          çaldığında play(), durdurduğunda pause(). DOM elementi olarak preload edilir;
          böylece play() ilk kullanıcı jestinde anında çalışır. */}
      {isNative && (
        <audio id="sakin-silence-loop" src="/silence.wav" loop preload="auto"
               style={{ display:"none" }} />
      )}

      {/* ÜST NAV — iOS feature ekranlarında gizli (Ailesi'nde mini link var) */}
      {topNavVisible && (
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
        <div style={{ marginLeft:"auto", flexShrink:0, alignSelf:"center", marginRight:4 }}>
          <LangPicker lang={lang} setLang={setLang} compact />
        </div>
      </div>
      )}

      {/* SAKİN AİLESİ PANELİ */}
      {showFotoTani && (
        <div onClick={()=>setShowFotoTani(false)} style={{ position:"fixed",inset:0,zIndex:10006,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ maxWidth:380,width:"100%",background:"linear-gradient(160deg,rgba(28,24,40,0.98),rgba(16,14,26,0.98))",border:"1px solid rgba(160,216,216,0.22)",borderRadius:20,padding:"26px 22px",maxHeight:"85vh",overflowY:"auto" }}>
            <div style={{ textAlign:"center",fontSize:34,marginBottom:6 }}>📷</div>
            <div style={{ textAlign:"center",fontSize:17,color:"#e8dcff",fontFamily:"'Jost',sans-serif",letterSpacing:1,marginBottom:6 }}>{pickLang({tr:"Fotoğraftan Tanı",en:"Identify by Photo",de:"Per Foto erkennen",es:"Identificar por foto",pt:"Identificar por foto",fr:"Identifier par photo",ja:"写真で見分ける"}, lang)}</div>
            <div style={{ textAlign:"center",fontSize:12.5,color:"#9a8fb5",marginBottom:18,lineHeight:1.6 }}>{pickLang({tr:"Net, yakın bir fotoğraf en iyi sonucu verir.",en:"A clear, close photo gives the best result.",de:"Ein klares, nahes Foto liefert das beste Ergebnis.",es:"Una foto clara y cercana da el mejor resultado.",pt:"Uma foto nítida e próxima dá o melhor resultado.",fr:"Une photo nette et rapprochée donne le meilleur résultat.",ja:"鮮明で近い写真が最良の結果に。"}, lang)}</div>
            {fotoTaniLoading ? (
              <div style={{ textAlign:"center",padding:"22px 0",color:"#888",letterSpacing:3,animation:"pulse 1.5s ease-in-out infinite" }}>{t("generating")}</div>
            ) : fotoTaniResult ? (
              <>
                <div style={{ fontSize:14,color:"#d8cce8",lineHeight:1.95,whiteSpace:"pre-wrap",marginBottom:16,padding:"14px 16px",background:"rgba(255,255,255,0.03)",borderRadius:12,border:"1px solid rgba(255,255,255,0.07)" }}>{fotoTaniResult}</div>
                <button onClick={()=>setFotoTaniResult("")} style={{ display:"block",width:"100%",padding:"12px 0",background:"rgba(160,216,216,0.14)",border:"1px solid rgba(160,216,216,0.3)",borderRadius:24,color:"#cfeaea",fontSize:13,letterSpacing:1.5,cursor:"pointer",fontFamily:"'Jost',sans-serif" }}>{pickLang({tr:"Yeni fotoğraf",en:"New photo",de:"Neues Foto",es:"Nueva foto",pt:"Nova foto",fr:"Nouvelle photo",ja:"新しい写真"}, lang)}</button>
              </>
            ) : (
              <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                {[["stone","💎",{tr:"Taş fotoğrafı",en:"Stone photo",de:"Steinfoto",es:"Foto de piedra",pt:"Foto de pedra",fr:"Photo de pierre",ja:"石の写真"}],["plant","🌿",{tr:"Bitki fotoğrafı",en:"Plant photo",de:"Pflanzenfoto",es:"Foto de planta",pt:"Foto de planta",fr:"Photo de plante",ja:"植物の写真"}]].filter(([ty])=>ty===fotoTaniType).map(([ty,ic,lbl])=>(
                  <label key={ty} style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"14px 0",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:14,color:"#e0d8f0",fontSize:14.5,letterSpacing:1,cursor:"pointer",fontFamily:"'Jost',sans-serif" }}>
                    <span style={{ fontSize:20 }}>{ic}</span>{pickLang(lbl, lang)}
                    <input type="file" accept="image/*" capture="environment" style={{ display:"none" }} onChange={e=>identifyPhoto(e.target.files && e.target.files[0], ty)} />
                  </label>
                ))}
              </div>
            )}
            <button onClick={()=>setShowFotoTani(false)} style={{ display:"block",margin:"16px auto 0",background:"none",border:"none",color:"#777",fontSize:12.5,letterSpacing:2,cursor:"pointer",fontFamily:"'Jost',sans-serif",textTransform:"uppercase" }}>{pickLang({tr:"Kapat",en:"Close",de:"Schließen",es:"Cerrar",pt:"Fechar",fr:"Fermer",ja:"閉じる"}, lang)}</button>
          </div>
        </div>
      )}
      {showAilesi && (
        // paddingTop: nav barı Keşfet açıkken üstte tıklanabilir kalsın diye modalın
        // ÜSTÜNE çıkarıldı (yukarıya bkz.) — modal içeriği o bar'ın altından başlasın
        // diye üst container'la aynı boşluk formülü kullanılıyor.
        // +26px NEFES PAYI: formül tam olarak bar'ın yüksekliği kadardı, yani
        // "SAKİN AİLESİ" yazısı bar'a 6px kalıyordu (ölçüldü: barBottom 88, titleTop
        // 94). Kullanıcı: "sakin ailesi yazısı ile üst bar çok bitişik".
        <div onClick={()=>setShowAilesi(false)} style={{ position:"fixed",inset:0,zIndex:10000,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(12px)",display:"flex",alignItems:"flex-start",justifyContent:"center",padding: (topNavVisible ? "calc(120px + var(--sat))" : "calc(76px + var(--sat))") + " 20px calc(20px + var(--android-sab)) 20px" }}>
          {/* overscrollBehaviorY:contain → kart sonuna gelince kaydırma arkadaki
              .sakin-app-root'a ZİNCİRLENMEZ (arka plan oynamaz). */}
          <div onClick={e=>e.stopPropagation()} style={{ maxWidth:420,width:"100%",maxHeight:"100%",overflowY:"auto",overscrollBehaviorY:"contain",WebkitOverflowScrolling:"touch",display:"flex",flexDirection:"column",gap:14 }}>
            <div style={{ textAlign:"center",marginBottom:8 }}>
              <div style={{ fontSize:11,letterSpacing:5,color:"#888",textTransform:"uppercase",marginBottom:6 }}>{t("ailesi_title")}</div>
              <div style={{ fontSize:22,fontWeight:300,letterSpacing:2,color:"#d0c0f0",fontFamily:"'Jost',sans-serif" }}>{t("ailesi_explore")}</div>
            </div>

            {/* SENİN BİLGİLERİN — ad/soyad input + Sakin girişten gelen doğum bilgisi özeti (kapalı) */}
            <div style={{ background:"rgba(184,164,216,0.04)",border:"1px solid rgba(184,164,216,0.15)",borderRadius:14,padding:"14px 16px",display:"flex",flexDirection:"column",gap:10 }}>
              <div style={{ fontSize:10,letterSpacing:3,color:"#9080b0",textTransform:"uppercase",fontFamily:"'Jost',sans-serif" }}>{t("ailesi_your_info")}</div>
              <input type="text"
                value={userName}
                onChange={e=>{
                  const v = e.target.value;
                  setUserName(v); setNameInput(v);
                  try { localStorage.setItem("sakin_name", v); } catch(_){}
                }}
                placeholder={t("ailesi_name_ph")}
                autoComplete="off" autoCorrect="off" autoCapitalize="words" spellCheck={false}
                style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"10px 12px",color:"#fff",fontSize:14,fontFamily:"'Inter',sans-serif",outline:"none",width:"100%",boxSizing:"border-box" }} />

              {birthDate ? (
                <>
                  <div style={{ fontSize:12,color:"#b0a8c8",lineHeight:1.7,letterSpacing:0.3 }}>
                    {birthDate}{birthTime ? ` · ${birthTime}` : ""}{birthCity ? ` · ${birthCity}` : ""}
                  </div>
                  {!ailesiEditBirth && (
                    <button onClick={()=>setAilesiEditBirth(true)}
                      style={{ alignSelf:"flex-start",background:"none",border:"1px dashed rgba(184,164,216,0.3)",borderRadius:100,padding:"6px 14px",color:"#9080b0",fontSize:11,letterSpacing:1.5,cursor:"pointer",fontFamily:"'Jost',sans-serif",textTransform:"uppercase" }}>
                      {t("ailesi_edit_birth")}
                    </button>
                  )}
                </>
              ) : (
                /* Sakin girişinde hiç doğum bilgisi girilmediyse hemen formu aç */
                <div style={{ fontSize:12,color:"#888",fontStyle:"italic" }}>
                  {t("ailesi_no_birth")}
                </div>
              )}

              {(ailesiEditBirth || !birthDate) && (
                <div style={{ display:"flex",flexDirection:"column",gap:8,paddingTop:6,borderTop:"1px solid rgba(184,164,216,0.12)" }}>
                  <div>
                    <div style={{ fontSize:10,letterSpacing:2,color:"#888",marginBottom:3,textTransform:"uppercase",fontFamily:"'Jost',sans-serif" }}>{t("birth_dob_label")}</div>
                    <SmartDateInput value={birthInput} onChange={(v)=>{ setBirthInput(v); setDateWarn(false); }} lang={lang} />
                    {dateWarn && <div style={{ fontSize:11,color:"#e89090",marginTop:5,fontFamily:"'Jost',sans-serif",letterSpacing:0.3,lineHeight:1.4 }}>{t("birth_date_required")}</div>}
                  </div>
                  <div>
                    <div style={{ fontSize:10,letterSpacing:2,color:"#888",marginBottom:3,textTransform:"uppercase",fontFamily:"'Jost',sans-serif" }}>{t("birth_time_label2")}</div>
                    <SmartTimeInput value={birthTimeInput} onChange={setBirthTimeInput} lang={lang} />
                  </div>
                  <div>
                    <div style={{ fontSize:10,letterSpacing:2,color:"#888",marginBottom:3,textTransform:"uppercase",fontFamily:"'Jost',sans-serif" }}>{t("birth_city_label")}</div>
                    <SmartCityInput value={birthCityInput} onChange={(v)=>{ setBirthCityInput(v); setCityWarn(false); }} lang={lang} />
                    {cityWarn && <div style={{ fontSize:11,color:"#e89090",marginTop:5,fontFamily:"'Jost',sans-serif",letterSpacing:0.3,lineHeight:1.4 }}>{t("city_not_in_list")}</div>}
                  </div>
                  <div style={{ display:"flex",gap:8,marginTop:4 }}>
                    <button onClick={()=>{
                        // Doğum tarihi/saati HER ZAMAN kaydedilsin (kaybolmasın). Şehir
                        // tanınmıyorsa: yanlış yükselen üretmemek için o şehri kaydetme +
                        // uyarı göster + formu açık tut (kullanıcı düzeltebilsin). Save artık
                        // hiçbir durumda "hiçbir şey yapmadan" takılmaz.
                        if(!birthInput){ setDateWarn(true); setAilesiEditBirth(true); return; } // geçerli tarih şart — sessiz başarısızlık yok
                        setDateWarn(false);
                        localStorage.setItem("sakin_birth_date", birthInput); setBirthDate(birthInput); markStep("birth");
                        if(birthTimeInput){ localStorage.setItem("sakin_birth_time", birthTimeInput); setBirthTime(birthTimeInput); }
                        if(birthCityInput && !lookupCity(birthCityInput)){ setCityWarn(true); setAilesiEditBirth(true); return; }
                        setCityWarn(false);
                        if(birthCityInput){ localStorage.setItem("sakin_birth_city", birthCityInput); setBirthCity(birthCityInput); }
                        setAilesiEditBirth(false);
                      }}
                      style={{ flex:1,background:"linear-gradient(135deg,rgba(184,164,216,0.35),rgba(122,80,150,0.3))",border:"1px solid rgba(184,164,216,0.5)",borderRadius:100,padding:"9px 14px",color:"#fff",fontSize:12,letterSpacing:1.5,cursor:"pointer",fontFamily:"'Jost',sans-serif",textTransform:"uppercase" }}>
                      {t("common_save")}
                    </button>
                    {birthDate && (
                      <button onClick={()=>{ setBirthInput(birthDate); setBirthTimeInput(birthTime); setBirthCityInput(birthCity); setAilesiEditBirth(false); }}
                        style={{ background:"none",border:"1px solid rgba(255,255,255,0.15)",borderRadius:100,padding:"9px 14px",color:"#888",fontSize:12,letterSpacing:1.5,cursor:"pointer",fontFamily:"'Jost',sans-serif",textTransform:"uppercase" }}>
                        {t("common_cancel")}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Mini profil: doğumdan türeyen kimlik çipleri + Galaktik Kimlik kapısı (Sprint 2) */}
              {birthDate && astro?.burc && (
                <div style={{ marginTop:12,paddingTop:12,borderTop:"1px solid rgba(184,164,216,0.12)" }}>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:10 }}>
                    <span style={{ padding:"5px 12px",background:"rgba(240,192,96,0.08)",border:"1px solid rgba(240,192,96,0.25)",borderRadius:100,fontSize:11,color:"#e8cc90",fontFamily:"'Jost',sans-serif",letterSpacing:0.5 }}>
                      {pickLang(REVEAL_I18N.sun, lang)}: {zodiacDisplay(astro.burc, lang)}
                    </span>
                    {yukselen && (
                      <span style={{ padding:"5px 12px",background:"rgba(184,164,216,0.08)",border:"1px solid rgba(184,164,216,0.25)",borderRadius:100,fontSize:11,color:"#cbbce4",fontFamily:"'Jost',sans-serif",letterSpacing:0.5 }}>
                        {pickLang(REVEAL_I18N.asc, lang)}: {zodiacDisplay(yukselen, lang)}
                      </span>
                    )}
                    {astro?.yasam && (
                      <span style={{ padding:"5px 12px",background:"rgba(122,176,224,0.08)",border:"1px solid rgba(122,176,224,0.25)",borderRadius:100,fontSize:11,color:"#9cc0e4",fontFamily:"'Jost',sans-serif",letterSpacing:0.5 }}>
                        {pickLang(REVEAL_I18N.path, lang)}: {astro.yasam}
                      </span>
                    )}
                  </div>
                  <button onClick={()=>{ idCardFromAilesi.current = true; setShowAilesi(false); setShowIdCard(true); }}
                    style={{ width:"100%",background:"rgba(184,164,216,0.08)",border:"1px solid rgba(184,164,216,0.3)",borderRadius:100,padding:"9px 14px",color:"#c8b4e8",fontSize:12,letterSpacing:1.5,cursor:"pointer",fontFamily:"'Jost',sans-serif",textTransform:"uppercase" }}>
                    {t("map_create_galactic_id")}
                  </button>
                </div>
              )}
            </div>
            {[
              { name:t("ailesi_hayvan_name"), embed:"/embedded/sakinhayvan/index.html", url:"https://sakinhayvan.netlify.app/", icon:"◈", color:"#a0d8b4",
                desc: t("ailesi_hayvan_desc") },
              { name:t("ailesi_mitler_name"), embed:"/embedded/sakinmitler/index.html", url:"https://sakinmitler.netlify.app/", icon:"🏛️", color:"#d8b4a0",
                desc: t("ailesi_mitler_desc") },
              { name:t("ailesi_tasarim_name"), embed:"/embedded/humandesign/index.html", url:"https://sakindesign.netlify.app/", icon:"⌖", color:"#b4a0d8",
                desc: t("ailesi_tasarim_desc") },
              { name:t("ailesi_taslar_name"), embed:"/embedded/sakintaslar/index.html", url:"", icon:"💎", color:"#a0d8d8",
                desc: t("ailesi_taslar_desc") },
              { name:t("ailesi_bitkiler_name"), embed:"/embedded/sakinbitkiler/index.html", url:"", icon:"🌿", color:"#7BA05B",
                desc: t("ailesi_bitkiler_desc") },
            ].map(app=>(
              <div key={app.name}
                style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"16px 18px",display:"flex",flexDirection:"column",gap:8,transition:"border-color 0.2s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=app.color+"66"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"}>
                <button
                  onClick={()=>handleOpenEmbed(app)}
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
            {/* Policy mini-linkler — top-nav iOS feature ekranlarında gizli, buradan erişim */}
            <div style={{ display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"4px 14px",marginTop:14,paddingTop:14,borderTop:"1px solid rgba(255,255,255,0.06)" }}>
              {[
                ["hakkinda", t("ailesi_policy_about")],
                ["fiyat",    t("ailesi_policy_pricing")],
                ["sartlar",  t("ailesi_policy_terms")],
                ["gizlilik", t("ailesi_policy_privacy")],
                ["iade",     t("ailesi_policy_refund")],
              ].map(([sc,lbl])=>(
                <button key={sc} onClick={()=>{ setShowAilesi(false); setScreen(sc); }}
                  style={{ background:"none",border:"none",padding:"4px 2px",color:"#777",fontSize:11,letterSpacing:1.5,cursor:"pointer",fontFamily:"'Jost',sans-serif",textTransform:"uppercase" }}>
                  {lbl}
                </button>
              ))}
            </div>
            {/* App Store Guideline 5.1.1(v) — Hesap/veri silme. Politika linkleriyle aynı
                muted dil, hafifçe daha düşük opaklıkta. Promote etmiyoruz; erişilebilir. */}
            <div style={{ display:"flex",justifyContent:"center",marginTop:2 }}>
              <button onClick={()=>setShowDeleteConfirm(true)}
                style={{ background:"none",border:"none",padding:"4px 2px",color:"#666",fontSize:10,letterSpacing:1.5,cursor:"pointer",fontFamily:"'Jost',sans-serif",textTransform:"uppercase" }}>
                {t("delete_account_link")}
              </button>
            </div>
            <button onClick={()=>setShowAilesi(false)} style={{ marginTop:6,background:"none",border:"1px solid rgba(255,255,255,0.1)",borderRadius:100,padding:"10px 0",color:"#888",fontSize:13,letterSpacing:2,cursor:"pointer",fontFamily:"'Jost',sans-serif",textTransform:"uppercase" }}>
              {t("common_close")}
            </button>
          </div>
        </div>
      )}

      {/* HESAP / VERİ SİLME ONAY MODALI — App Store Guideline 5.1.1(v).
          Ailesi paneli üstünde (zIndex daha yüksek). "Sil" destruktif kırmızı,
          "Vazgeç" default. Onayla → deleteAccountData() çağrılır. */}
      {showDeleteConfirm && (
        <div onClick={()=>setShowDeleteConfirm(false)}
          style={{ position:"fixed",inset:0,zIndex:10010,background:"rgba(0,0,0,0.88)",backdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
          <div onClick={e=>e.stopPropagation()}
            style={{ maxWidth:380,width:"100%",background:"#15101c",border:"1px solid rgba(232,80,80,0.25)",borderRadius:18,padding:"24px 22px",display:"flex",flexDirection:"column",gap:16 }}>
            <div style={{ fontSize:11,letterSpacing:4,color:"#e85050",textTransform:"uppercase",fontFamily:"'Jost',sans-serif",textAlign:"center" }}>
              {t("delete_confirm_title")}
            </div>
            <div style={{ fontSize:14,lineHeight:1.65,color:"#d0c4d8",fontFamily:"'Inter',sans-serif",textAlign:"left" }}>
              {t("delete_confirm_body")}
            </div>
            <div style={{ fontSize:11,lineHeight:1.55,color:"#888",fontFamily:"'Inter',sans-serif",fontStyle:"italic" }}>
              {t("delete_confirm_subscription_note")}
            </div>
            <div style={{ display:"flex",gap:10,marginTop:4 }}>
              <button onClick={()=>setShowDeleteConfirm(false)}
                style={{ flex:1,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:100,padding:"12px 14px",color:"#d0c4d8",fontSize:13,letterSpacing:1.5,cursor:"pointer",fontFamily:"'Jost',sans-serif",textTransform:"uppercase" }}>
                {t("delete_confirm_cancel")}
              </button>
              <button onClick={deleteAccountData}
                style={{ flex:1,background:"linear-gradient(135deg,#a83030,#7a1818)",border:"1px solid rgba(232,80,80,0.6)",borderRadius:100,padding:"12px 14px",color:"#fff",fontSize:13,letterSpacing:1.5,cursor:"pointer",fontFamily:"'Jost',sans-serif",textTransform:"uppercase",fontWeight:500 }}>
                {t("delete_confirm_delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SİLME ONAY TOST'U — 2.5sn sonra otomatik kapanır */}
      {deleteToast && (
        <div style={{ position:"fixed",left:"50%",bottom:80,transform:"translateX(-50%)",zIndex:10020,background:"rgba(20,16,28,0.95)",border:"1px solid rgba(184,164,216,0.3)",borderRadius:100,padding:"12px 22px",color:"#d0c0f0",fontSize:13,letterSpacing:1.5,fontFamily:"'Jost',sans-serif",backdropFilter:"blur(10px)",boxShadow:"0 6px 24px rgba(0,0,0,0.5)" }}>
          {deleteToast}
        </div>
      )}

      {/* AYNA BUTONU (floating) — KALDIRILDI (kullanıcı: "bağlan ile haritadan ayna
          butonunu çıkart"). Günlük akış ekranlarında ayna zaten üst barın ORTASINDA
          duruyor; harita/mandala(bağlan) ekranlarında artık ayna gösterilmiyor. */}
      {false && (
        <button
          onClick={openMirror}
          aria-label={t("mirror_aria")}
          title={t("mirror_aria")}
          style={ isNative ? {
            // iOS: sağ üst köşe, tam görünür küçük hilal
            position:"fixed", top:"calc(env(safe-area-inset-top, 0px) + 64px)", right:14,
            zIndex:9997, width:36, height:36, borderRadius:"50%",
            border:"1px solid rgba(184,164,216,0.35)",
            background:"radial-gradient(circle at 35% 35%, rgba(160,112,208,0.45) 0%, rgba(60,30,90,0.75) 60%, rgba(20,10,35,0.9) 100%)",
            backdropFilter:"blur(10px)",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"rgba(232,218,250,0.9)", fontSize:15, lineHeight:1,
            boxShadow:"0 0 16px rgba(160,120,220,0.30), inset 0 0 10px rgba(184,164,216,0.22)",
            padding:0, cursor:"pointer",
          } : {
            // Web: iOS gibi sağ ÜST köşede tam görünür küçük hilal. 'Ailesi' (✦)
            // üst-nav butonuyla çakışmasın diye biraz daha aşağıda.
            position:"fixed", top:"calc(env(safe-area-inset-top, 0px) + 124px)", right:14,
            zIndex:9997, width:36, height:36, borderRadius:"50%",
            border:"1px solid rgba(184,164,216,0.35)",
            background:"radial-gradient(circle at 35% 35%, rgba(160,112,208,0.45) 0%, rgba(60,30,90,0.75) 60%, rgba(20,10,35,0.9) 100%)",
            backdropFilter:"blur(10px)",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"rgba(232,218,250,0.9)", fontSize:15, lineHeight:1,
            boxShadow:"0 0 16px rgba(160,120,220,0.30), inset 0 0 10px rgba(184,164,216,0.22)",
            padding:0, cursor:"pointer",
          }}
        >
          <span className={allStepsComplete ? "sakin-mirror-live" : undefined} style={{ display:"block", lineHeight:1, transform:"translateY(-0.5px)", filter: allStepsComplete ? undefined : "drop-shadow(0 0 4px rgba(232,218,250,0.55))" }}>☽</span>
        </button>
      )}

      {/* PANİK BUTONU — yalnızca GİRİŞ ekranında sağ alt köşe (kullanıcı isteğiyle
          diğer ekranlarda gizli). Tıklayınca en uygun sakinleştirici nefesi (4-7-8)
          DOĞRUDAN başlatır; teknik premium olsa bile panik istisnası ile çalışır. */}
      {screen === "giris" && !embeddedApp && !mirrorPortalActive && (
        <button
          onClick={()=>{
            try { haptic(); } catch(_) {}
            pendingBreathRef.current = "478";       // panik için en uygun: 4-7-8
            panicAutoStartRef.current = true;       // doğrudan başlat (premium istisnası)
            // Not: 'Sakin'i tanı' tanıtım popup'ı zaten otomatik açılmıyor. Burada eskiden
            // İKİ tanımsız referans kaldı (sakinIntroCheckedRef, sonra setShowSakinIntro) →
            // ReferenceError ile panik butonu nefesi hiç başlatamıyordu. İkisi de kaldırıldı.
            setScreen("nefes");
          }}
          aria-label={t("panic_aria")}
          title={t("panic_aria")}
          style={{
            position:"fixed",
            // Sağ alt köşe — giriş ekranında alt bar/yardım butonu yok, çakışma olmaz.
            // 24px ekranın en altına çok yakındı (kullanıcı isteği) — ~1cm (≈38px) yukarı çekildi.
            bottom:"calc(62px + var(--android-sab))",
            right:14, zIndex:9997,
            display:"flex", alignItems:"center", gap:7,
            padding:"8px 14px", borderRadius:100,
            border:"1px solid rgba(224,120,120,0.5)",
            background:"linear-gradient(135deg, rgba(224,110,110,0.42) 0%, rgba(120,40,40,0.72) 100%)",
            backdropFilter:"blur(10px)",
            color:"rgba(255,235,235,0.95)", fontSize:11.5, letterSpacing:1.5, lineHeight:1,
            fontFamily:"'Jost',sans-serif", textTransform:"uppercase", fontWeight:500,
            animation:"panicPulse 2.5s ease-in-out infinite",
            cursor:"pointer", whiteSpace:"nowrap",
          }}
        >
          <span>{t("panic_button")}</span>
        </button>
      )}

      {/* AYNA GEÇİDİ — Sakin Ailesi girişiyle aynı stargate portal geçişi */}
      {mirrorPortalActive && (() => {
        const rgb = "160,112,208"; // ayna moru #a070d0
        return (
          <div style={{ position:"fixed",inset:0,zIndex:10001,background:"radial-gradient(circle at 50% 50%, #0a0612 0%, #000 75%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:28,animation:"portalIn 1.2s cubic-bezier(0.25,0.1,0.25,1)",pointerEvents:"none" }}>
            <div style={{ position:"relative",width:120,height:120 }}>
              {[0,1,2].map(i=>(
                <div key={`mring${i}`} style={{ position:"absolute",left:"50%",top:"50%",width:120,height:120,marginLeft:-60,marginTop:-60,borderRadius:"50%",border:`1.5px solid rgba(${rgb},0.5)`,boxShadow:`0 0 24px rgba(${rgb},0.3),inset 0 0 24px rgba(${rgb},0.2)`,animation:`portalRingPulse 2.6s cubic-bezier(0.4,0,0.2,1) infinite`,animationDelay:`${i*0.5}s` }}/>
              ))}
              {/* dönen elmas */}
              <div style={{ position:"absolute",left:"50%",top:"50%",width:120,height:120,marginLeft:-60,marginTop:-60 }}>
                <div style={{ position:"absolute",inset:0,transform:"rotate(45deg)",border:"1.5px solid #a070d0",borderRadius:10,animation:"diamondSpin 4.2s linear infinite",boxShadow:`0 0 22px rgba(${rgb},0.4)` }}/>
                <div style={{ position:"absolute",inset:24,transform:"rotate(45deg)",border:"1px solid #a070d0",borderRadius:6,opacity:0.7,animation:"diamondSpin 3s linear infinite reverse" }}/>
                <div style={{ position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",width:12,height:12,borderRadius:"50%",background:"#fff",boxShadow:`0 0 28px rgba(${rgb},0.7),0 0 56px rgba(${rgb},0.4)`,animation:"pulse 2s ease-in-out infinite" }}/>
              </div>
            </div>
            <div style={{ fontFamily:"'Jost',sans-serif",fontSize:13,letterSpacing:6,color:"#d0c0f0",textTransform:"uppercase",opacity:0.9,animation:"fadeUp 1.2s ease-out 0.3s both" }}>
              {t("mirror_label")}
            </div>
          </div>
        );
      })()}

      {/* EMBEDDED APP — fullscreen iframe overlay with stargate portal transition */}
      {(embeddedApp || mitlerSession) && (
        // mitlerSession sticky: embeddedApp null olsa bile container DOM'da kalır (display:none) →
        // mitler iframe yeniden mount olmaz → "günün 4 miti" sabit kalır. Sadece üst bar/loading/quota
        // UI'ı `embeddedApp` varsa anlam ifade ettiği için ya gizleniyor ya da koşulla render ediliyor.
        <div style={{ position:"fixed",inset:0,zIndex:10001,background:"#000",display: embeddedApp ? "flex" : "none",flexDirection:"column",paddingBottom:"var(--android-sab, 0px)",animation: embeddedApp ? "portalIn 1.4s cubic-bezier(0.25,0.1,0.25,1)" : "none" }}>
          {/* ÜST BAR — status bar'ı kaplar (tam ekran kesik fix), embed içeriğini
              kapatmaz (iframe bar'ın ALTINDA başlar). Sol: ← Aile, orta: SAKİN {APP}. */}
          {embeddedApp && <div style={{
            flexShrink:0, paddingTop:"var(--sat, 0px)",
            height:"calc(var(--sat, 0px) + 44px)", boxSizing:"border-box",
            background:"linear-gradient(180deg, rgba(10,6,20,0.98) 0%, rgba(10,6,20,0.92) 100%)",
            borderBottom:"1px solid rgba(184,164,216,0.18)",
            display:"flex", alignItems:"center", position:"relative",
          }}>
            <button
              onClick={()=>{ try { haptic(); } catch(_) {} setEmbeddedApp(null); setEmbedLoaded(false); setEmbedQuotaExceeded(false); setShowAilesi(true); }}
              onMouseDown={e=>e.currentTarget.style.transform="scale(0.92)"}
              onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
              onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
              title={"Sakin " + t("nav_family")}
              aria-label={"Sakin " + t("nav_family")}
              style={{
                marginLeft:8, padding:"7px 13px 7px 10px", borderRadius:100,
                background:"rgba(184,164,216,0.12)", border:"1px solid rgba(184,164,216,0.4)",
                color:"#e8dcff", fontSize:11, letterSpacing:1.2, lineHeight:1,
                cursor:"pointer", display:"flex", alignItems:"center", gap:5,
                fontFamily:"'Jost',sans-serif", transition:"transform 0.15s ease", flexShrink:0,
              }}>
              <span style={{ fontSize:15 }}>←</span>
              {t("nav_family")}
            </button>
            {/* Orta başlık: SAKİN {APP} */}
            <div style={{
              position:"absolute", left:"50%", top:"var(--sat, 0px)", transform:"translateX(-50%)",
              height:44, display:"flex", alignItems:"center", pointerEvents:"none",
              fontFamily:"'Jost',sans-serif", fontSize:12, letterSpacing:3,
              color: embeddedApp.color || "#d0c0f0", textTransform:"uppercase", whiteSpace:"nowrap",
            }}>
              {embeddedApp.name}
            </div>
          </div>}
          {/* Shared onLoad handler — hem standart iframe hem de sticky mitler iframe için.
              Closure her render'da yeniden oluştuğundan state'ler (lang, birth*, isPremium, userName)
              güncel kalır. embeddedApp null olduğunda mitler kapalı demektir — handler ne path
              ne color okumaya çalışmaz (üst seviye guard yok, ama mitler için isMitlerEmbed=true). */}
          {embeddedApp && !((embeddedApp.path||"").indexOf("sakinmitler") !== -1) && <iframe
            src={embeddedApp.path}
            title={embeddedApp.name}
            onLoad={(e)=>{
              setTimeout(()=>setEmbedLoaded(true), 1100);
              // Embed'lere ortak CSS override inject — form taşmalarını engelle
              try {
                const doc = e.target.contentDocument;
                if (!doc) return;
                const style = doc.createElement("style");
                style.id = "sakin-embed-fixes";
                style.textContent = `
                  /* Embed'in üst safe-area boşluğunu AGRESİF sıfırla — host iframe ekranın
                     tepesinden başlıyor; embed kendi safe-area-inset-top kullanırsa siyah
                     bant kalıyor. Status bar host tarafında görünür. */
                  html, body {
                    overscroll-behavior-y: none !important;
                    padding-top: 0 !important;
                    margin-top: 0 !important;
                  }
                  #root, [class*="root"], [class*="App"], [class*="Container"], [class*="container"] {
                    padding-top: 0 !important;
                    margin-top: 0 !important;
                  }
                  /* RN/Expo SafeAreaView genelde inline padding-top:env(safe-area-inset-top)
                     verir → bu da kesik üst boşluğa sebep. Hepsini ezelim. */
                  [style*="padding-top: env(safe-area-inset-top"],
                  [style*="paddingTop: env(safe-area-inset-top"],
                  [style*="padding-top:env(safe-area-inset-top"],
                  [style*="paddingTop:env(safe-area-inset-top"] {
                    padding-top: 0 !important;
                  }
                  /* Sticky/fixed header'lar (varsa) safe-area kullanmasın */
                  [style*="position: sticky"][style*="top:"],
                  [style*="position: fixed"][style*="top:"] {
                    top: 0 !important;
                  }
                  /* Embed başlık satırı bizim sol üstteki dairesel geri butonumuzla
                     çakışmasın — sola 64px boşluk (FAMILY butonu için). */
                  body > div:first-child > div:first-child,
                  header,
                  [role="banner"],
                  [class*="Header"],
                  [class*="header"],
                  [class*="TopBar"],
                  [class*="topbar"] {
                    padding-left: 64px !important;
                  }
                  /* Form input'larının ekran dışına taşmasını engelle */
                  input, textarea, select {
                    max-width: 100% !important;
                    min-width: 0 !important;
                    box-sizing: border-box !important;
                  }
                  /* RN/Expo TextInput container'ları (genelde flex grid) */
                  [class*="TextInput"], [data-class~="r-input"] {
                    min-width: 0 !important;
                    flex-shrink: 1 !important;
                  }
                  /* Tipik flex-row grid'ler — date picker satırı vb */
                  [style*="flex-direction: row"], [style*="flexDirection: row"], [style*="flexDirection:row"] {
                    flex-wrap: wrap !important;
                    min-width: 0 !important;
                  }
                  [style*="flex-direction: row"] > *, [style*="flexDirection: row"] > *, [style*="flexDirection:row"] > * {
                    min-width: 0 !important;
                    flex-shrink: 1 !important;
                  }
                  /* Genel container — yatay scroll engelle */
                  body, #root, [class*="root"] {
                    max-width: 100vw !important;
                    overflow-x: hidden !important;
                  }
                  /* Form satırlarında padding/gap düşür */
                  [style*="grid"] { max-width: 100% !important; }
                  /* ZOOM KAPALI: iOS 16px altı font'lu input'a odaklanınca sayfayı
                     zoom'lar ve geri dönemez (Taşlar arama kutusu vb). Embed input'ları
                     en az 16px olsun + double-tap zoom'u kapat. */
                  input, textarea, select { font-size: 16px !important; }
                  html, body { touch-action: manipulation; }
                `;
                doc.head.appendChild(style);
                installZoomGuard(doc); // pinch/double-tap embed içinde de kapalı
                // Embed kartı KENDİ iframe'inde navigator.share() çağırıyor — host'un
                // zoom watchdog'u bu iframe'e erişemez, kendi başına kurulmalı. Kök
                // sebep: paylaşım kartı sonrası zoom takılması host'ta düzeltilmişti
                // ama embed'lerde (taşlar/bitkiler/hayvan/mitler) hâlâ oluyordu.
                try { installZoomResetWatchdog(e.target.contentWindow, doc); } catch (_) {}

                // Embed'lere bilgi köprüsü — ÜÇ KANAL:
                // (1) postMessage — embed dinliyorsa anında yakalar
                // (2) embed localStorage'ı — same-origin, doğrudan yazıyoruz; embed
                //     ilk açılışta okuyup onboarding'i atlayabilir
                // (3) global window değişkeni — embed JS'inin doğrudan eriştiği değer
                // Hangi anahtarı kullandığını bilmediğimiz için yaygın varyantları yazıyoruz.
                const sendBridge = () => {
                  try {
                    const target = e.target.contentWindow;
                    if (!target) return;
                    const payload = {
                      type: "sakin-bridge",
                      lang,
                      birth: {
                        date: birthDate || "",
                        time: birthTime || "",
                        city: birthCity || "",
                      },
                      name: userName || "",
                      premium: !!isPremium,
                    };
                    // Hedef her zaman same-origin embed iframe'i ("*" yerine — savunma katmanı,
                    // embed src'leri hep same-origin /embedded/... olsa da veri sızıntısına kapı kapatır).
                    target.postMessage(payload, window.location.origin);
                    // localStorage: yaygın anahtarları aynı veriyle doldur
                    try {
                      const ls = target.localStorage;
                      if (ls) {
                        const set = (k, v) => { try { if (v) ls.setItem(k, v); } catch(_) {} };
                        // Sakin host anahtarları (host ile aynı schema)
                        set("sakin_birth_date", birthDate || "");
                        set("sakin_birth_time", birthTime || "");
                        set("sakin_birth_city", birthCity || "");
                        set("sakin_name", userName || "");
                        set("sakin_lang", lang || "tr");
                        // GERÇEK KOORDİNAT (humandesign için): host şehri 36k DB'de çözüp
                        // lat/lon/tz'yi geçirir; embed kendi 118-şehir listesine bakmadan
                        // gerçek koordinatla HD grafiği hesaplar. Varsayılan değil — kullanıcının
                        // girdiği şehrin gerçek koordinatı.
                        try {
                          const loc = lookupCity(birthCity);
                          if (loc && loc.length >= 3) {
                            set("sakin_birth_lat", String(loc[0]));
                            set("sakin_birth_lon", String(loc[1]));
                            set("sakin_birth_tz",  String(loc[2]));
                          }
                        } catch(_) {}
                        set("sakin_premium", isPremium ? "1" : "0");
                        // Embed varyantları — yaygın isim adetleri
                        set("birth_date", birthDate || ""); set("birthDate", birthDate || "");
                        set("birth_time", birthTime || ""); set("birthTime", birthTime || "");
                        set("birth_city", birthCity || ""); set("birthCity", birthCity || "");
                        set("user_name", userName || ""); set("userName", userName || "");
                        set("language", lang || "tr"); set("locale", lang || "tr");
                        // Sakin Hayvan (Tura store) — kendi AsyncStorage key'i @tura_profile.
                        // Bundle host'tan okuma fonksiyonu içeriyor (b()) ama UI'a bağlamamış;
                        // doğrudan profile key'ini set ediyoruz ki onboarding atlansın.
                        try {
                          if (userName || birthDate || birthCity) {
                            const hm = (birthTime || "").split(":");
                            const bh = parseInt(hm[0], 10);
                            const bm = parseInt(hm[1], 10);
                            const turaProfile = {
                              name: userName || undefined,
                              birthDate: birthDate || undefined,
                              birthHour: (!isNaN(bh) && bh >= 0 && bh <= 23) ? bh : undefined,
                              birthMinute: (!isNaN(bm) && bm >= 0 && bm <= 59) ? bm : undefined,
                              birthCity: birthCity || undefined,
                            };
                            ls.setItem("@tura_profile", JSON.stringify(turaProfile));
                          }
                        } catch(_) {}
                        // Onboarding/profil "tamamlandı" bayrakları
                        set("onboarding_completed", "true");
                        set("onboardingCompleted", "true");
                        set("hasCompletedOnboarding", "true");
                        set("birth_info_collected", "true");
                        set("profile_completed", "true");
                      }
                    } catch(_) {}
                    // Global window pencere bayrağı (bazı embed'ler buraya bakar)
                    try {
                      target.__SAKIN_BRIDGE__ = payload;
                    } catch(_) {}
                  } catch(_) {}
                };
                sendBridge();
                setTimeout(sendBridge, 600);
                setTimeout(sendBridge, 1500);
                setTimeout(sendBridge, 3500);

                // Embed onboarding atlama: bridge gönderildi, embed hâlâ doğum bilgisi
                // formu gösteriyorsa otomatik "devam" et. Önce input[type=date|time]
                // ata div'lerini gizle, sonra yakın "Continue/Devam/Save" butonuna click.
                let onboardingSkipAttempts = 0;
                const trySkipOnboarding = () => {
                  if (onboardingSkipAttempts > 4) return;
                  onboardingSkipAttempts++;
                  try {
                    const dateInputs = doc.querySelectorAll('input[type="date"], input[type="time"], input[type="datetime-local"], input[type="text"]');
                    const dateInputArr = Array.from(dateInputs).filter(inp => {
                      // Doğum tarihi içeren input'ları belirle: type=date/time, veya
                      // placeholder/name/id "birth"/"doğum"/"dob" içeren text input
                      if (["date","time","datetime-local"].includes(inp.type)) return true;
                      const meta = (inp.name + " " + inp.id + " " + (inp.placeholder||"") + " " + (inp.getAttribute("aria-label")||"")).toLowerCase();
                      return /(birth|doğum|dob|geburt|nacim|naissance|生年)/.test(meta);
                    });
                    if (dateInputArr.length === 0) return; // birth form yok, çık

                    // Input'ları host'un birth bilgisiyle doldur + change event tetikle
                    const fillInput = (inp, value) => {
                      try {
                        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
                        if (setter) setter.call(inp, value); else inp.value = value;
                        inp.dispatchEvent(new Event("input", { bubbles: true }));
                        inp.dispatchEvent(new Event("change", { bubbles: true }));
                      } catch(_) {}
                    };
                    dateInputArr.forEach(inp => {
                      const meta = (inp.name + " " + inp.id + " " + (inp.placeholder||"") + " " + (inp.getAttribute("aria-label")||"") + " " + inp.type).toLowerCase();
                      if (inp.type === "time" || /time|saat|hour|stunde|hora|heure|時間/.test(meta)) {
                        fillInput(inp, birthTime || "12:00");
                      } else if (/city|şehir|stadt|ciudad|cidade|ville|都市/.test(meta)) {
                        fillInput(inp, birthCity || "");
                      } else if (/name|isim|ad\b|nombre|nome|nom|名前/.test(meta)) {
                        fillInput(inp, userName || "");
                      } else {
                        // Doğum tarihi (veya bilinmeyen) — date format
                        fillInput(inp, birthDate || "");
                      }
                    });

                    // Sonra "ilerle/devam" butonuna programatik click
                    const SKIP_LABELS = new Set([
                      "continue","devam","devam et","next","ileri","skip","atla",
                      "save","kaydet","start","başla","submit","tamam","ok","→",
                      "weiter","überspringen","speichern",
                      "continuar","saltar","guardar",
                      "continuer","passer","enregistrer",
                      "次へ","スキップ","保存"
                    ]);
                    const buttons = doc.querySelectorAll('button, [role="button"], a, input[type="submit"]');
                    for (let i = 0; i < buttons.length; i++) {
                      const b = buttons[i];
                      const txt = (b.textContent || b.value || "").trim().toLowerCase();
                      if (SKIP_LABELS.has(txt) || /(continue|devam|skip|atla|save|kaydet|submit|ileri|next)/.test(txt)) {
                        try { b.click(); } catch(_) {}
                        break;
                      }
                    }
                  } catch(_) {}
                };
                setTimeout(trySkipOnboarding, 2500);
                setTimeout(trySkipOnboarding, 5000);
                setTimeout(trySkipOnboarding, 8000);
                setTimeout(trySkipOnboarding, 12000);

                // Embed'lerdeki gereksiz menüleri gizle: "Profil" tab + dil seçici.
                // Sakin Ailesi'nde isim/doğum/dil zaten alındı; embed kendi formunu sunmamalı.
                const LANG_CODES = new Set(["tr","en","de","es","pt","fr","ja","ar","ru","it","nl"]);
                const LANG_NAMES = new Set([
                  "dil","language","sprache","idioma","langue","言語",
                  "türkçe","english","deutsch","español","português","français","日本語"
                ]);
                const SETTINGS_NAMES = new Set(["ayarlar","settings","einstellungen","ajustes","configurações","paramètres","設定"]);
                // Embed'e özel ek gizleme listesi:
                //   Hayvan: policy + HD + tam-ad dil seçenekleri
                //   Mitler: HD + tam-ad dil seçenekleri (policy KALIR)
                //   Tasarım: ek gizleme yok (kendi app'i, her şey kendi)
                const path = embeddedApp.path || "";
                const isHayvanEmbed = path.indexOf("sakinhayvan") !== -1;
                const isMitlerEmbed = path.indexOf("sakinmitler") !== -1;
                const POLICY_HIDE = new Set([
                  "sakin nedir","sakin nedir?","nedir","nedir?","what is sakin","what is sakin?",
                  "fiyatlandırma","fiyatlar","fiyat","pricing","prices","premium fiyat",
                  "hakkında","about","about us",
                  "şartlar","kullanım şartları","terms","terms of service",
                  "gizlilik","gizlilik politikası","privacy","privacy policy",
                  "iade","iade politikası","refund","refund policy",
                ]);
                const HD_HIDE = new Set([
                  "human design","sakin tasarım","tasarım","hd","sakin design","tasarim",
                  "sakin tasarim","insan tasarımı","insan tasarimi",
                ]);
                // ⚠️ MITLER hesap-silme butonu gizleme (#20). Apple 5.1.1(v) hesap silme
                // gerektiriyor; embed'in kendi butonunu gizliyoruz ama host (Sakin) hâlâ
                // hesap silme sağlamalı, yoksa red riski. Şu an Sakin'de hesap silme YOK
                // — TODO: Apple submission'dan önce host'a "Hesabımı sil" eklemek lazım,
                // yoksa bu embed'in butonu hayat kurtarıcıydı. Kullanıcı kendi kararı.
                const ACCOUNT_DELETE_HIDE = new Set([
                  "profilimi ve verilerimi sil","hesabımı sil","verilerimi sil","profilimi sil",
                  "delete my profile and data","delete my account","delete account","delete data",
                  "delete profile","delete profile and data","verilerimi temizle",
                ]);
                const FULL_LANG_HIDE = new Set([
                  "türkçe","english","türkçe / english","tr · türkçe","en · english",
                  "türkçe/english","tr/en","change language","dili değiştir",
                ]);
                const hideRedundantMenus = () => {
                  try {
                    const all = doc.querySelectorAll("a, button, [role='tab'], [role='button'], [role='link'], li, div[onclick], [class*='lang'], [class*='Lang']");
                    for (let i = 0; i < all.length; i++) {
                      const el = all[i];
                      if (el.dataset && el.dataset.sakinHidden === "1") continue;
                      const txt = (el.textContent || "").trim().toLowerCase();
                      const len = txt.length;
                      const isShortLangCode = (len === 2 || len === 3) && LANG_CODES.has(txt);
                      const isLangPicker = LANG_NAMES.has(txt);
                      const isSettings = SETTINGS_NAMES.has(txt);
                      const isFullLang = FULL_LANG_HIDE.has(txt);
                      const isHD = (isHayvanEmbed || isMitlerEmbed) && HD_HIDE.has(txt);
                      const isPolicy = isHayvanEmbed && POLICY_HIDE.has(txt);
                      // #20 hesap-silme butonu KALSIN (kullanıcı kararı, Apple 5.1.1(v) için iyi).
                      // ACCOUNT_DELETE_HIDE listesi tanımlı ama uygulanmıyor.
                      if (isShortLangCode || isLangPicker || isSettings || isFullLang || isHD || isPolicy) {
                        el.style.display = "none";
                        el.dataset.sakinHidden = "1";
                      }
                    }
                  } catch(_) {}
                };
                hideRedundantMenus();
                // RN/Expo geç render edebilir; ek geçişler
                setTimeout(hideRedundantMenus, 600);
                setTimeout(hideRedundantMenus, 1500);
                setTimeout(hideRedundantMenus, 3500);
                setTimeout(hideRedundantMenus, 6000);

                // SAKİN TASARIM (Human Design) — sadece bu uygulamaya özel premium gating:
                // Bodygraph, profil özeti ve başlıklar görünür kalır; uzun açıklama
                // paragrafları (140+ karakter, yaprak elementler) buzlanır, dipte CTA bar
                // postMessage ile host'a "fiyat ekranına git" sinyali gönderir.
                if (!isPremium && (embeddedApp.path||"").indexOf("humandesign") !== -1) {
                  const blurStyle = doc.createElement("style");
                  blurStyle.id = "sakin-premium-gate";
                  blurStyle.textContent = `
                    .sakin-blur-paragraph {
                      filter: blur(5.5px) saturate(0.65) brightness(0.92);
                      user-select: none !important;
                      -webkit-user-select: none !important;
                      pointer-events: none !important;
                      transition: filter 0.3s ease;
                    }
                    .sakin-premium-cta-bar {
                      /* Embed'in KENDİ alt menü/tab bar'ının ÜSTÜNde dursun, onu kapatmasın.
                         (Kullanıcı: "kilidi aç butonunu menülerin üstüne koy".) Alt tab bar
                         ~64px + safe-area; CTA'yı onun üstüne yerleştir. */
                      position: fixed; bottom: calc(76px + env(safe-area-inset-bottom, 0px));
                      left: 14px; right: 14px;
                      background: linear-gradient(135deg, rgba(184,164,216,0.94), rgba(122,80,150,0.92));
                      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
                      border: 1px solid rgba(255,255,255,0.22);
                      border-radius: 16px; padding: 13px 18px;
                      color: #fff; font-family: 'Jost', sans-serif;
                      font-size: 12.5px; letter-spacing: 1.8px; text-transform: uppercase;
                      text-align: center; cursor: pointer; z-index: 99999;
                      box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 24px rgba(184,164,216,0.4);
                      display: flex; align-items: center; justify-content: center; gap: 8px;
                      animation: sakinCtaPulse 2.4s ease-in-out infinite;
                    }
                    @keyframes sakinCtaPulse {
                      0%,100% { box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 24px rgba(184,164,216,0.4); }
                      50%     { box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 40px rgba(184,164,216,0.65); }
                    }
                  `;
                  doc.head.appendChild(blurStyle);

                  // Throttle: querySelectorAll over RN/Expo subtree is expensive; cap at 5/s.
                  let lastApply = 0;
                  const applyBlur = () => {
                    const now = Date.now();
                    if (now - lastApply < 200) return;
                    lastApply = now;
                    try {
                      const all = doc.querySelectorAll("div, p, span");
                      for (let i=0; i<all.length; i++) {
                        const el = all[i];
                        if (el.classList && el.classList.contains("sakin-blur-paragraph")) continue;
                        if (el.children && el.children.length > 0) continue; // sadece yaprak
                        const txt = (el.textContent || "").trim();
                        if (txt.length >= 140) {
                          el.classList.add("sakin-blur-paragraph");
                        }
                      }
                    } catch(_) {}
                  };

                  // CTA bar — tek bir kez ekle
                  const ensureCta = () => {
                    if (doc.getElementById("sakin-cta-bar")) return;
                    const cta = doc.createElement("button");
                    cta.id = "sakin-cta-bar";
                    cta.className = "sakin-premium-cta-bar";
                    cta.textContent = t("mirror_premium_cta");
                    cta.addEventListener("click", () => {
                      try { window.parent.postMessage({ type: "sakin-premium-cta" }, window.location.origin); } catch(_) {}
                    });
                    doc.body.appendChild(cta);
                  };

                  // İlk uygulama + dinamik içerik için MutationObserver — stored on
                  // iframe element so the unmount effect can disconnect it.
                  applyBlur(); ensureCta();
                  try {
                    const mo = new MutationObserver(() => { applyBlur(); ensureCta(); });
                    mo.observe(doc.body, { childList: true, subtree: true });
                    e.target._sakinObserver = mo;
                  } catch(_) {}
                }
              } catch(err) { /* cross-origin or already injected — sessiz geç */ }
            }}
            style={{ flex:"1 1 auto",minHeight:0,width:"100%",border:"none",background:"#000",display:"block",opacity: embedLoaded ? 1 : 0,transition:"opacity 1.2s ease-out" }}
            allow="accelerometer; gyroscope; clipboard-write; encrypted-media"
          />}
          {/* STICKY SAKİN MİTLER IFRAME — overlay container'da sürekli mount kalır; ekran/kapatma
              sırasında sadece display:none ile gizlenir. Bu sayede Expo bundle her açılışta yeniden
              Math.random ile "günün 4 mitini" SEÇMEZ; aynı mitler kalır. Key=mitlerSession.day
              olduğundan gün değişince iframe re-mount → yeni mitler. onLoad handler'ı yukarıdaki
              standart iframe ile birebir aynı kodu çalıştırır (closure güncel state'leri alır). */}
          {mitlerSession && <iframe
            key={mitlerSession.day}
            ref={mitlerIframeRef}
            src="/embedded/sakinmitler/index.html"
            title={t("ailesi_mitler_name") || "Sakin Mitler"}
            onLoad={(e)=>{
              mitlerLoadedOnceRef.current = true;
              setTimeout(()=>setEmbedLoaded(true), 1100);
              // Embed'lere ortak CSS override inject — form taşmalarını engelle
              try {
                const doc = e.target.contentDocument;
                if (!doc) return;
                const style = doc.createElement("style");
                style.id = "sakin-embed-fixes";
                style.textContent = `
                  html, body {
                    overscroll-behavior-y: none !important;
                    padding-top: 0 !important;
                    margin-top: 0 !important;
                  }
                  #root, [class*="root"], [class*="App"], [class*="Container"], [class*="container"] {
                    padding-top: 0 !important;
                    margin-top: 0 !important;
                  }
                  [style*="padding-top: env(safe-area-inset-top"],
                  [style*="paddingTop: env(safe-area-inset-top"],
                  [style*="padding-top:env(safe-area-inset-top"],
                  [style*="paddingTop:env(safe-area-inset-top"] {
                    padding-top: 0 !important;
                  }
                  [style*="position: sticky"][style*="top:"],
                  [style*="position: fixed"][style*="top:"] {
                    top: 0 !important;
                  }
                  body > div:first-child > div:first-child,
                  header,
                  [role="banner"],
                  [class*="Header"],
                  [class*="header"],
                  [class*="TopBar"],
                  [class*="topbar"] {
                    padding-left: 64px !important;
                  }
                  input, textarea, select {
                    max-width: 100% !important;
                    min-width: 0 !important;
                    box-sizing: border-box !important;
                  }
                  [class*="TextInput"], [data-class~="r-input"] {
                    min-width: 0 !important;
                    flex-shrink: 1 !important;
                  }
                  [style*="flex-direction: row"], [style*="flexDirection: row"], [style*="flexDirection:row"] {
                    flex-wrap: wrap !important;
                    min-width: 0 !important;
                  }
                  [style*="flex-direction: row"] > *, [style*="flexDirection: row"] > *, [style*="flexDirection:row"] > * {
                    min-width: 0 !important;
                    flex-shrink: 1 !important;
                  }
                  body, #root, [class*="root"] {
                    max-width: 100vw !important;
                    overflow-x: hidden !important;
                  }
                  [style*="grid"] { max-width: 100% !important; }
                  /* ZOOM KAPALI: 16px altı input odak zoom'unu tetikler (mitler arama
                     kutusu 13px) — sticky mitler iframe'i de aynı aşıyı alsın. */
                  input, textarea, select { font-size: 16px !important; }
                  html, body { touch-action: manipulation; }
                `;
                doc.head.appendChild(style);
                installZoomGuard(doc); // pinch/double-tap embed içinde de kapalı
                // Embed kartı KENDİ iframe'inde navigator.share() çağırıyor — host'un
                // zoom watchdog'u bu iframe'e erişemez, kendi başına kurulmalı. Kök
                // sebep: paylaşım kartı sonrası zoom takılması host'ta düzeltilmişti
                // ama embed'lerde (taşlar/bitkiler/hayvan/mitler) hâlâ oluyordu.
                try { installZoomResetWatchdog(e.target.contentWindow, doc); } catch (_) {}

                // Bilgi köprüsü (postMessage + same-origin localStorage + window flag)
                const sendBridge = () => {
                  try {
                    const target = e.target.contentWindow;
                    if (!target) return;
                    const payload = {
                      type: "sakin-bridge",
                      lang,
                      birth: { date: birthDate || "", time: birthTime || "", city: birthCity || "" },
                      name: userName || "",
                      premium: !!isPremium,
                    };
                    // Hedef her zaman same-origin embed iframe'i ("*" yerine — savunma katmanı,
                    // embed src'leri hep same-origin /embedded/... olsa da veri sızıntısına kapı kapatır).
                    target.postMessage(payload, window.location.origin);
                    try {
                      const ls = target.localStorage;
                      if (ls) {
                        const set = (k, v) => { try { if (v) ls.setItem(k, v); } catch(_) {} };
                        set("sakin_birth_date", birthDate || "");
                        set("sakin_birth_time", birthTime || "");
                        set("sakin_birth_city", birthCity || "");
                        set("sakin_name", userName || "");
                        set("sakin_lang", lang || "tr");
                        try {
                          const loc = lookupCity(birthCity);
                          if (loc && loc.length >= 3) {
                            set("sakin_birth_lat", String(loc[0]));
                            set("sakin_birth_lon", String(loc[1]));
                            set("sakin_birth_tz",  String(loc[2]));
                          }
                        } catch(_) {}
                        set("sakin_premium", isPremium ? "1" : "0");
                        set("birth_date", birthDate || ""); set("birthDate", birthDate || "");
                        set("birth_time", birthTime || ""); set("birthTime", birthTime || "");
                        set("birth_city", birthCity || ""); set("birthCity", birthCity || "");
                        set("user_name", userName || ""); set("userName", userName || "");
                        set("language", lang || "tr"); set("locale", lang || "tr");
                        set("onboarding_completed", "true");
                        set("onboardingCompleted", "true");
                        set("hasCompletedOnboarding", "true");
                        set("birth_info_collected", "true");
                        set("profile_completed", "true");
                      }
                    } catch(_) {}
                    try { target.__SAKIN_BRIDGE__ = payload; } catch(_) {}
                  } catch(_) {}
                };
                sendBridge();
                setTimeout(sendBridge, 600);
                setTimeout(sendBridge, 1500);
                setTimeout(sendBridge, 3500);

                // Embed onboarding atlama (mitler de aynı kalıp formu kullanır)
                let onboardingSkipAttempts = 0;
                const trySkipOnboarding = () => {
                  if (onboardingSkipAttempts > 4) return;
                  onboardingSkipAttempts++;
                  try {
                    const dateInputs = doc.querySelectorAll('input[type="date"], input[type="time"], input[type="datetime-local"], input[type="text"]');
                    const dateInputArr = Array.from(dateInputs).filter(inp => {
                      if (["date","time","datetime-local"].includes(inp.type)) return true;
                      const meta = (inp.name + " " + inp.id + " " + (inp.placeholder||"") + " " + (inp.getAttribute("aria-label")||"")).toLowerCase();
                      return /(birth|doğum|dob|geburt|nacim|naissance|生年)/.test(meta);
                    });
                    if (dateInputArr.length === 0) return;
                    const fillInput = (inp, value) => {
                      try {
                        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
                        if (setter) setter.call(inp, value); else inp.value = value;
                        inp.dispatchEvent(new Event("input", { bubbles: true }));
                        inp.dispatchEvent(new Event("change", { bubbles: true }));
                      } catch(_) {}
                    };
                    dateInputArr.forEach(inp => {
                      const meta = (inp.name + " " + inp.id + " " + (inp.placeholder||"") + " " + (inp.getAttribute("aria-label")||"") + " " + inp.type).toLowerCase();
                      if (inp.type === "time" || /time|saat|hour|stunde|hora|heure|時間/.test(meta)) {
                        fillInput(inp, birthTime || "12:00");
                      } else if (/city|şehir|stadt|ciudad|cidade|ville|都市/.test(meta)) {
                        fillInput(inp, birthCity || "");
                      } else if (/name|isim|ad\b|nombre|nome|nom|名前/.test(meta)) {
                        fillInput(inp, userName || "");
                      } else {
                        fillInput(inp, birthDate || "");
                      }
                    });
                    const SKIP_LABELS = new Set([
                      "continue","devam","devam et","next","ileri","skip","atla",
                      "save","kaydet","start","başla","submit","tamam","ok","→",
                      "weiter","überspringen","speichern",
                      "continuar","saltar","guardar",
                      "continuer","passer","enregistrer",
                      "次へ","スキップ","保存"
                    ]);
                    const buttons = doc.querySelectorAll('button, [role="button"], a, input[type="submit"]');
                    for (let i = 0; i < buttons.length; i++) {
                      const b = buttons[i];
                      const txt = (b.textContent || b.value || "").trim().toLowerCase();
                      if (SKIP_LABELS.has(txt) || /(continue|devam|skip|atla|save|kaydet|submit|ileri|next)/.test(txt)) {
                        try { b.click(); } catch(_) {}
                        break;
                      }
                    }
                  } catch(_) {}
                };
                setTimeout(trySkipOnboarding, 2500);
                setTimeout(trySkipOnboarding, 5000);
                setTimeout(trySkipOnboarding, 8000);
                setTimeout(trySkipOnboarding, 12000);

                // Mitler için: HD + tam-ad dil seçenekleri gizle (policy KALIR)
                const LANG_CODES = new Set(["tr","en","de","es","pt","fr","ja","ar","ru","it","nl"]);
                const LANG_NAMES = new Set([
                  "dil","language","sprache","idioma","langue","言語",
                  "türkçe","english","deutsch","español","português","français","日本語"
                ]);
                const SETTINGS_NAMES = new Set(["ayarlar","settings","einstellungen","ajustes","configurações","paramètres","設定"]);
                const HD_HIDE = new Set([
                  "human design","sakin tasarım","tasarım","hd","sakin design","tasarim",
                  "sakin tasarim","insan tasarımı","insan tasarimi",
                ]);
                const FULL_LANG_HIDE = new Set([
                  "türkçe","english","türkçe / english","tr · türkçe","en · english",
                  "türkçe/english","tr/en","change language","dili değiştir",
                ]);
                const hideRedundantMenus = () => {
                  try {
                    const all = doc.querySelectorAll("a, button, [role='tab'], [role='button'], [role='link'], li, div[onclick], [class*='lang'], [class*='Lang']");
                    for (let i = 0; i < all.length; i++) {
                      const el = all[i];
                      if (el.dataset && el.dataset.sakinHidden === "1") continue;
                      const txt = (el.textContent || "").trim().toLowerCase();
                      const len = txt.length;
                      const isShortLangCode = (len === 2 || len === 3) && LANG_CODES.has(txt);
                      const isLangPicker = LANG_NAMES.has(txt);
                      const isSettings = SETTINGS_NAMES.has(txt);
                      const isFullLang = FULL_LANG_HIDE.has(txt);
                      const isHD = HD_HIDE.has(txt);
                      if (isShortLangCode || isLangPicker || isSettings || isFullLang || isHD) {
                        el.style.display = "none";
                        el.dataset.sakinHidden = "1";
                      }
                    }
                  } catch(_) {}
                };
                hideRedundantMenus();
                setTimeout(hideRedundantMenus, 600);
                setTimeout(hideRedundantMenus, 1500);
                setTimeout(hideRedundantMenus, 3500);
                setTimeout(hideRedundantMenus, 6000);
              } catch(err) { /* cross-origin or already injected — sessiz geç */ }
            }}
            style={{ flex:"1 1 auto",minHeight:0,width:"100%",border:"none",background:"#000",display: (embeddedApp && (embeddedApp.path||"").indexOf("sakinmitler") !== -1) ? "block" : "none",opacity: embedLoaded ? 1 : 0,transition:"opacity 1.2s ease-out" }}
            allow="accelerometer; gyroscope; clipboard-write; encrypted-media"
          />}
          {/* Yıldız geçidi yükleme katmanı — sadece bir embed açıkken */}
          {embeddedApp && !embedLoaded && (() => {
            const colorHex = (embeddedApp.color || "#b4a0d8").replace('#','');
            const rgb = colorHex.match(/.{2}/g).map(h => parseInt(h, 16)).join(',');
            return (
              <div style={{ position:"fixed",inset:0,zIndex:10001,pointerEvents:"none",background:`radial-gradient(ellipse 80% 60% at 50% 50%,rgba(${rgb},0.22) 0%,rgba(20,10,40,0.92) 50%,#000 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:"fadeIn 0.5s ease",transition:"opacity 0.8s ease-out",opacity: embedLoaded ? 0 : 1 }}>
                {/* Twinkle yıldızlar */}
                {[[12,14],[24,28],[78,22],[88,40],[6,46],[94,58],[16,72],[82,76],[34,8],[68,12],[44,90],[58,84],[28,52],[72,52]].map(([x,y],i)=>(
                  <div key={i} style={{ position:"absolute",left:`${x}%`,top:`${y}%`,width:2,height:2,borderRadius:"50%",background:"rgba(255,255,255,0.9)",boxShadow:"0 0 4px rgba(255,255,255,0.6)",animation:`twinkle ${2.5+i*0.25}s ease-in-out infinite`,animationDelay:`${i*0.12}s` }}/>
                ))}
                {/* Yayılan halkalar — yıldız geçidi çekirdeği */}
                {[0, 0.5, 1.0, 1.5].map((delay,i)=>(
                  <div key={`ring${i}`} style={{ position:"absolute",left:"50%",top:"50%",width:120,height:120,marginLeft:-60,marginTop:-60,borderRadius:"50%",border:`1.5px solid rgba(${rgb},0.5)`,boxShadow:`0 0 24px rgba(${rgb},0.3),inset 0 0 24px rgba(${rgb},0.2)`,animation:`portalRingPulse 2.6s cubic-bezier(0.4,0,0.2,1) infinite`,animationDelay:`${delay}s` }}/>
                ))}
                {/* Dönen tünel halkası */}
                <div style={{ position:"absolute",left:"50%",top:"50%",width:200,height:200,marginLeft:-100,marginTop:-100,borderRadius:"50%",border:`2px dashed rgba(${rgb},0.4)`,animation:"portalTunnel 3.2s linear infinite" }}/>
                {/* Merkez dönen elmas + ışık */}
                <div style={{ position:"relative",width:100,height:100,marginBottom:24 }}>
                  <div style={{ position:"absolute",inset:0,transform:"rotate(45deg)",border:`1.5px solid ${embeddedApp.color || "rgba(255,255,255,0.5)"}`,borderRadius:10,animation:"diamondSpin 4.2s linear infinite",boxShadow:`0 0 22px rgba(${rgb},0.4)` }}/>
                  <div style={{ position:"absolute",inset:24,transform:"rotate(45deg)",border:`1px solid ${embeddedApp.color || "rgba(255,255,255,0.3)"}`,borderRadius:6,opacity:0.7,animation:"diamondSpin 3s linear infinite reverse" }}/>
                  <div style={{ position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",width:12,height:12,borderRadius:"50%",background:embeddedApp.color || "#fff",boxShadow:`0 0 28px ${embeddedApp.color || "rgba(255,255,255,0.7)"},0 0 56px ${embeddedApp.color || "rgba(255,255,255,0.4)"}`,animation:"pulse 2s ease-in-out infinite" }}/>
                </div>
                <div style={{ fontFamily:"'Jost',sans-serif",fontSize:13,letterSpacing:6,color:embeddedApp.color || "#d0c0f0",textTransform:"uppercase",opacity:0.9,animation:"fadeUp 1.2s ease-out 0.3s both" }}>
                  {embeddedApp.name}
                </div>
              </div>
            );
          })()}
          {/* Hayvan/Mitler kotası dolduysa frost gate: iframe yüklendikten sonra üstüne biner */}
          {embeddedApp && embedQuotaExceeded && embedLoaded && (() => {
            const rgb = (embeddedApp.color || "#b4a0d8").replace('#','').match(/.{2}/g).map(h=>parseInt(h,16)).join(',');
            return (
              <div style={{ position:"fixed", inset:0, zIndex:10002, backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)",
                background:`radial-gradient(ellipse 80% 60% at 50% 40%, rgba(${rgb},0.22) 0%, rgba(15,8,30,0.88) 70%, rgba(0,0,0,0.95) 100%)`,
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                padding:"40px 28px", gap:18, animation:"fadeIn 0.5s ease" }}>
                <div style={{ fontSize:38, lineHeight:1, opacity:0.85, filter:`drop-shadow(0 0 18px rgba(${rgb},0.5))` }}>✦</div>
                <div style={{ fontSize:11, letterSpacing:5, color:`rgba(${rgb},0.85)`, textTransform:"uppercase", fontFamily:"'Jost',sans-serif" }}>
                  {t("ailesi_title")}
                </div>
                <div style={{ fontSize:22, color:"#fff", fontFamily:"'Jost',sans-serif", fontWeight:300, textAlign:"center", maxWidth:320, lineHeight:1.4, letterSpacing:1 }}>
                  {t("ailesi_premium_needed_title")}
                </div>
                <div style={{ fontSize:13, color:"#b8a8d0", lineHeight:1.7, textAlign:"center", maxWidth:300, fontFamily:"'Inter',sans-serif" }}>
                  {t("ailesi_premium_quota").replace("{name}", embeddedApp.name).replace("{free}", String(AILESI_FREE_OPENS))}
                </div>
                <button onClick={()=>{ setEmbeddedApp(null); setEmbedLoaded(false); setEmbedQuotaExceeded(false); setScreen("fiyat"); }}
                  style={{ marginTop:8, background:"linear-gradient(135deg, rgba(184,164,216,0.95), rgba(122,80,150,0.92))",
                    border:"1px solid rgba(255,255,255,0.22)", borderRadius:100, padding:"14px 34px",
                    color:"#fff", fontSize:13, letterSpacing:2.5, cursor:"pointer",
                    fontFamily:"'Jost',sans-serif", textTransform:"uppercase",
                    boxShadow:`0 8px 28px rgba(0,0,0,0.55), 0 0 28px rgba(${rgb},0.5)` }}>
                  {t("ailesi_get_premium")}
                </button>
                <button onClick={()=>{ setEmbeddedApp(null); setEmbedLoaded(false); setEmbedQuotaExceeded(false); }}
                  style={{ background:"none", border:"1px solid rgba(255,255,255,0.18)", borderRadius:100, padding:"9px 22px",
                    color:"#888", fontSize:11, letterSpacing:1.8, cursor:"pointer",
                    fontFamily:"'Jost',sans-serif", textTransform:"uppercase" }}>
                  {t("common_not_now")}
                </button>
                {/* Sakin menüleri — free kullanıcı kotası dolunca embed'den çıkıp Sakin'in
                    ana bölümlerine 1 tıkla geçebilsin (yoksa ana sayfaya dönüp soğuyor). */}
                <div style={{ display:"flex", gap:8, marginTop:18, flexWrap:"wrap", justifyContent:"center" }}>
                  {SIDEBAR_ITEMS.filter(n=>!n.iconOnly).map(n=>(
                    <button key={n.id}
                      onClick={()=>{ setEmbeddedApp(null); setEmbedLoaded(false); setEmbedQuotaExceeded(false);
                        if(n.id==="ailesi"){ setShowAilesi(true); return; } setScreen(n.id); }}
                      style={{ background:`${n.color}18`, border:`1px solid ${n.color}44`, borderRadius:100,
                        padding:"8px 16px", color:n.color, fontSize:11, letterSpacing:1.5, cursor:"pointer",
                        fontFamily:"'Jost',sans-serif", display:"flex", alignItems:"center", gap:5 }}>
                      <span style={{ fontSize:13 }}>{n.icon}</span>{n.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
          {/* Çıkış butonu artık üst bar'da (yukarıda). Eski absolute buton kaldırıldı. */}
        </div>
      )}

      {/* Görünmez ön-yükleme iframe'i — galaktik kimlik kartındaki element dağılımını
          kullanıcı Tasarım'ı hiç açmadan da hazır etmek için arka planda bir kez Sakin
          Tasarım'ı yükler (bkz. hdPreloadSrc effect'i yukarıda). Tasarım kendi same-origin
          localStorage'ından (sakin_birth_* / sakin_name) doğrudan okuyup grafiğini hesaplar
          — köprü mesajına ihtiyaç yok. ÖNEMLİ: embeddedApp/mitlerSession'a bağlı bloğun
          İÇİNDE değil, DIŞINDA olmalı — yoksa kullanıcı bir embed açana kadar hiç render
          edilmez ve ön-yükleme hiç çalışmaz. */}
      {hdPreloadSrc && <iframe
        src={hdPreloadSrc}
        title="hd-preload"
        aria-hidden="true"
        tabIndex={-1}
        style={{ position:"fixed", left:-9999, top:0, width:390, height:844, opacity:0, pointerEvents:"none" }}
      />}

      {/* AYNA & HARİTA BARI — sabit. iOS feature ekranlarında en üstte (safe area dahil); web/policy/giriş'te topNav'ın altında. */}
      <div style={{ position:"fixed",top: topNavVisible ? "calc(44px + var(--sat))" : 0,left:0,right:0,
          // Keşfet (Ailesi) tam ekran modal olarak zIndex:10000'de açılıyor — bu bar
          // normalde 9998'de kalıp modalın ALTINDA kaybolur, kullanıcı diğer sekmelere
          // (Harita/Bağlan) geçemez, "Kapat"ı bulmak zorunda kalırdı. Keşfet açıkken
          // bar'ı modalın ÜSTÜNE çıkarıyoruz (SADECE bu durumda — diğer modallerle
          // (id kartı, foto tanı, zihni boşalt) çakışmasın diye koşullu).
          zIndex: showAilesi ? 10001 : 9998,
          // GİRİŞ (HAZIRIM) ekranında üst nav barı GİZLİ (kullanıcı: "açılışta üstteki
          // tüm menüleri kaldır, eski hali öyleydi"). HAZIRIM'a basıp sabaha geçince görünür.
          minHeight:topNavVisible ? 44 : "calc(44px + var(--sat))",background:"rgba(0,0,0,0.95)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.06)",display: screen === "giris" ? "none" : "flex",alignItems:"stretch",justifyContent:"space-between",gap:6,padding:topNavVisible ? "6px 10px" : "calc(6px + var(--sat)) 10px 6px 10px" }}>
        {(() => {
          const handleNavClick = (n) => {
            if(n.id==="ailesi"){ setShowAilesi(!showAilesi); setShowTopMenu(false); return; }
            // Keşfet açıkken başka bir sekmeye geçiliyorsa Keşfet'i kapat — yoksa
            // modal ekranın üstünde açık kalır, geçilen sekme görünmez.
            if(showAilesi) setShowAilesi(false);
            if(n.id==="rehber") setRehberTab("reiki");
            if(n.id==="giris") setGirisPhase("intro");
            setScreen(n.id);
            setShowTopMenu(false);
          };
          const renderBtn = (n) => {
            // AKTİF = SADECE İÇİNDE OLUNAN MENÜ (kullanıcı: "keşfet ekranındayken
            // bağlan butonu da yanıyor; hangi menüdeysek sadece o yansın").
            // KÖK SEBEP: Keşfet bir `screen` değil, `showAilesi` overlay'i — açıkken
            // altta `screen` hâlâ "mandala" olduğu için BAĞLAN da yanıyordu.
            const active = n.id==="ailesi" ? showAilesi : (!showAilesi && screen===n.id);
            return (
              <button key={n.id}
                onClick={()=>handleNavClick(n)}
                aria-label={n.iconOnly ? t("nav_home") : undefined}
                style={{
                  flex: n.iconOnly ? "0 0 auto" : "1 1 0", minWidth:0,
                  width: n.iconOnly ? 48 : undefined,
                  // Ana sayfa (⌂) her zaman çerçeveli + biraz daha büyük — kullanıcı isteği
                  // ("çok küçük, büyüt/çerçeve ekle").
                  background: active ? `${n.color}22` : n.glow ? `${n.color}11` : n.iconOnly ? "rgba(255,255,255,0.05)" : "transparent",
                  border: active ? `1px solid ${n.color}44` : n.glow ? `1px solid ${n.color}33` : n.iconOnly ? "1px solid rgba(255,255,255,0.16)" : "1px solid transparent",
                  borderRadius:20, cursor:"pointer", transition:"all 0.25s",
                  padding: n.iconOnly ? "7px 0" : "5px 6px", display:"flex", alignItems:"center", justifyContent:"center", gap:5,
                  fontFamily:"'Jost',sans-serif", fontWeight: n.glow ? 500 : 500,
                  fontSize:12.5, letterSpacing:1.2,
                  color: active ? n.color : n.glow ? n.color : `${n.color}88`,
                  animation: n.glow && !active ? "ailesiPulse 2.5s ease-in-out infinite" : "none",
                  boxShadow: n.glow && !active ? `0 0 12px ${n.color}22` : "none",
                  whiteSpace:"nowrap", overflow:"hidden",
                }}>
                {n.iconOnly ? (
                  // Ana sayfa ikonu: ⌂ glyph çoğu fontta kutu içinde optik ortalı DEĞİL
                  // (baseline üstünde durur). Inline SVG ev ikonu ile kutunun tam ortasına
                  // hizalanır (kullanıcı: "kutucuğun içinde hizalı değil, dikkatlice düzelt").
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" style={{ display:"block", flexShrink:0 }} aria-hidden="true">
                    <path d="M3.5 11.3 12 4.2l8.5 7.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.6 9.7v9.2a.9.9 0 0 0 .9.9h11a.9.9 0 0 0 .9-.9V9.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span style={{ fontSize:14, lineHeight:1, flexShrink:0 }}>{n.icon}</span>
                )}
                {!n.iconOnly && <span style={{ overflow:"hidden", textOverflow:"ellipsis", minWidth:0 }}>{(n.label||"").toLocaleUpperCase(t("locale_code"))}</span>}
              </button>
            );
          };
          // Üçlü menü (BAĞLAN·HARİTA·KEŞFET) artık YALNIZCA giriş ekranında üstte
          // ayrı ayrı görünür. Diğer tüm yüzeylerde sade hamburger düzeni geçerli:
          // ⌂ (sol) · ☽ Ayna (orta) · ☰ (sağ).
          // Kullanıcı sırasıyla: "bağlan ekranında en üstteki menüleri kaldır" →
          // sonra "harita ve keşfet ekranlarında da üst barı kaldır, bağlandaki gibi".
          const showAllTop = screen === "giris";
          if (showAllTop) return SIDEBAR_ITEMS.map(renderBtn);
          // Günlük akış ekranları: ⌂ (sol) · ☽ Ayna (ORTA) · ☰ (SAĞ). Web açık/koyu
          // tema butonu ☰ menüsünün EN ALTINDA (kullanıcı isteği).
          const homeItem = SIDEBAR_ITEMS.find(n => n.id === "giris");
          const menuItems = SIDEBAR_ITEMS.filter(n => n.id !== "giris");
          return (
            <>
              {homeItem && renderBtn(homeItem)}
              {/* ORTA: Ayna (gizli geçit) — eskiden sağ kenarda floating ☽ idi. */}
              <button onClick={openMirror} aria-label={t("mirror_aria")} title={t("mirror_aria")}
                style={{
                  flex:"0 0 auto", width:44, minHeight:38, padding:"6px 0",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  borderRadius:20, cursor:"pointer", transition:"all 0.25s",
                  border:"1px solid rgba(184,164,216,0.35)",
                  background:"radial-gradient(circle at 35% 35%, rgba(160,112,208,0.4) 0%, rgba(60,30,90,0.6) 60%, rgba(20,10,35,0.5) 100%)",
                  color:"rgba(232,218,250,0.92)",
                  boxShadow:"0 0 12px rgba(160,120,220,0.25), inset 0 0 8px rgba(184,164,216,0.18)",
                }}>
                <span className={allStepsComplete ? "sakin-mirror-live" : undefined} style={{ fontSize:17, lineHeight:1, filter: allStepsComplete ? undefined : "drop-shadow(0 0 4px rgba(232,218,250,0.55))" }}>☽</span>
              </button>
              <div style={{ position:"relative", flex:"0 0 auto" }}>
                <button onClick={()=>setShowTopMenu(v=>!v)} aria-label={t("nav_menu")}
                  style={{
                    width:48, minHeight:38, padding:"7px 0", display:"flex", alignItems:"center", justifyContent:"center",
                    borderRadius:20, cursor:"pointer", transition:"all 0.25s",
                    background: showTopMenu ? "rgba(184,164,216,0.18)" : "rgba(255,255,255,0.05)",
                    border: showTopMenu ? "1px solid rgba(184,164,216,0.45)" : "1px solid rgba(255,255,255,0.16)",
                    color:"rgba(228,218,245,0.9)",
                  }}>
                  {/* ☰ glyph kutuda optik ortalı değildi → SVG hamburger ile tam ortalı. */}
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" style={{ display:"block", flexShrink:0 }} aria-hidden="true">
                    <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
                {/* Menü + dışına-tıkla katmanı createPortal ile document.body'ye taşınır.
                    KÖK SEBEP: üst bar div'inde backdrop-filter var; bu, içindeki
                    position:fixed katmanı üst bar alanına HAPSEDER → "dışına tıkla kapat"
                    tüm ekranı kaplamaz, sadece üç-çizgiye basınca kapanırdı (kullanıcı:
                    "pop-up dışındaki her yere tıklandığında kapansın"). Portal ile katman
                    gerçekten tüm ekranı kaplar. */}
                {showTopMenu && createPortal(
                  <>
                  <div onClick={()=>setShowTopMenu(false)} style={{ position:"fixed", inset:0, zIndex:10010 }} />
                  <div onClick={e=>e.stopPropagation()}
                    style={{ position:"fixed", top: topNavVisible ? "calc(96px + var(--sat))" : "calc(52px + var(--sat))", right:10, minWidth:180, zIndex:10011,
                      background:"rgba(12,8,20,0.98)", backdropFilter:"blur(20px)",
                      border:"1px solid rgba(255,255,255,0.12)", borderRadius:14,
                      boxShadow:"0 8px 32px rgba(0,0,0,0.6)", padding:6,
                      display:"flex", flexDirection:"column", gap:2 }}>
                    {menuItems.map(n => {
                      // Aktif = sadece içinde olunan menü (renderBtn ile aynı kural).
                      const active = n.id==="ailesi" ? showAilesi : (!showAilesi && screen===n.id);
                      return (
                        <button key={n.id} onClick={()=>handleNavClick(n)}
                          style={{ display:"flex", alignItems:"center", gap:9, padding:"10px 12px",
                            background: active ? `${n.color}22` : "transparent", border:"none", borderRadius:10,
                            cursor:"pointer", fontFamily:"'Jost',sans-serif", fontSize:12.5, letterSpacing:1.2,
                            color: active ? n.color : n.color, textAlign:"left", width:"100%" }}>
                          <span style={{ fontSize:15, lineHeight:1 }}>{n.icon}</span>
                          <span>{(n.label||"").toLocaleUpperCase(t("locale_code"))}</span>
                        </button>
                      );
                    })}
                    {/* Açık/koyu tema — menünün EN ALTINDA. Artık mobilde de (iOS/Android) var. */}
                    {(<>
                      <div style={{ height:1, background:"rgba(255,255,255,0.08)", margin:"4px 6px" }} />
                      <button onClick={()=>{ toggleTheme(); setShowTopMenu(false); }}
                        style={{ display:"flex", alignItems:"center", gap:9, padding:"10px 12px",
                          background: lightMode ? "rgba(240,200,140,0.16)" : "transparent", border:"none", borderRadius:10,
                          cursor:"pointer", fontFamily:"'Jost',sans-serif", fontSize:12.5, letterSpacing:1.2,
                          color: lightMode ? "#e8b478" : "rgba(210,200,230,0.85)", textAlign:"left", width:"100%" }}>
                        <span style={{ fontSize:15, lineHeight:1 }}>◐</span>
                        <span>{(lightMode ? t("theme_light") : t("theme_dark")).toLocaleUpperCase(t("locale_code"))}</span>
                      </button>
                    </>)}
                  </div>
                  </>,
                  document.body
                )}
              </div>
            </>
          );
        })()}
        {/* Tema butonu artık SADECE ☰ menüsünün içinde (kullanıcı: "tema değişikliği
            sadece üç çizginin içinde olsun, diğer yerlerden kaldır"). 3'ü-üstte
            moddaki (harita/mandala/keşfet) ayrı ◐ butonu kaldırıldı. */}
      </div>

      {/* APP GÜNCELLE banner — daha yeni iOS sürümü yayında, kullanıcı dismiss etmediyse */}
      {isNative && updateInfo && updateDismissed !== updateInfo.version && (
        <div style={{
          position:"fixed", top:"calc(44px + var(--sat) + 8px)", left:10, right:10, zIndex:10005,
          background:"linear-gradient(135deg,rgba(184,164,216,0.92),rgba(122,80,150,0.88))",
          backdropFilter:"blur(18px)",
          border:"1px solid rgba(220,200,255,0.3)", borderRadius:14,
          padding:"10px 12px 10px 14px",
          display:"flex", alignItems:"center", gap:10,
          boxShadow:"0 6px 24px rgba(0,0,0,0.45)",
          fontFamily:"'Inter',sans-serif",
          animation:"fadeUp 0.5s ease-out",
        }}>
          <div style={{ fontSize:18, lineHeight:1 }}>✦</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:500, color:"#fff", letterSpacing:0.3, marginBottom:2 }}>
              {`${t("update_new_version")} · ${updateInfo.version}`}
            </div>
            <div style={{ fontSize:11.5, color:"rgba(255,255,255,0.82)", lineHeight:1.4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {(lang==="tr" ? updateInfo.notes_tr : updateInfo.notes_en) || t("update_default_notes")}
            </div>
          </div>
          <a href={STORE_URL} target="_blank" rel="noopener noreferrer"
            style={{ background:"rgba(255,255,255,0.22)", border:"1px solid rgba(255,255,255,0.4)", borderRadius:18, padding:"7px 14px", color:"#fff", fontSize:12, letterSpacing:1, fontFamily:"'Jost',sans-serif", textDecoration:"none", whiteSpace:"nowrap" }}>
            {t("update_button")}
          </a>
          <button onClick={()=>{ setUpdateDismissed(updateInfo.version); localStorage.setItem("sakin_update_dismissed_v", updateInfo.version); }}
            aria-label="Dismiss"
            style={{ background:"transparent", border:"none", color:"rgba(255,255,255,0.7)", fontSize:18, cursor:"pointer", padding:"0 4px", lineHeight:1 }}>
            ✕
          </button>
        </div>
      )}

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
            <div style={{ position:"absolute",inset:0,transform:"rotate(45deg)",border:"1px solid rgba(200,180,235,0.55)",borderRadius:12,animation:"diamondSpin 12s linear infinite",boxShadow:"0 0 16px rgba(184,164,216,0.35),inset 0 0 12px rgba(184,164,216,0.10)" }} />
            <div style={{ position:"absolute",inset:24,transform:"rotate(45deg)",border:"1px solid rgba(184,164,216,0.32)",borderRadius:8,animation:"diamondSpin 8s linear infinite reverse",boxShadow:"0 0 12px rgba(160,140,200,0.24)" }} />
            <div style={{ position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",width:16,height:16,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,255,255,0.95),rgba(220,205,240,0.8))",boxShadow:"0 0 22px rgba(220,200,240,0.7),0 0 44px rgba(184,164,216,0.5)" }} />
          </div>
        </div>
      )}

      {/* "SAKİN NEDİR?" / YOL SEÇİMİ — TEK overlay. HAZIRIM sonrası, İLK 5 AÇILIŞTA
          (veya "bir daha gösterme"ye kadar). iOS + web. Kartlar DOĞRUDAN tıklanır:
          ✦→Ailesi, ◎→mandala. Küçük "Sakin nedir?" butonu nedir sekmesine gider. */}
      {showNedir && !showIntro && (
        <div onClick={()=>setShowNedir(false)} style={{ position:"fixed",inset:0,zIndex:99998,background:"rgba(0,0,0,0.87)",backdropFilter:"blur(13px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}>
          <div onClick={e=>e.stopPropagation()} style={{ maxWidth:400,width:"100%",background:"linear-gradient(160deg,rgba(30,22,45,0.98),rgba(18,12,28,0.98))",border:"1px solid rgba(184,164,216,0.25)",borderRadius:20,padding:"28px 24px",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.6)",animation:"fadeUp 0.5s ease-out",position:"relative" }}>
            {/* Sağ üst kapat (X) — açılış (HAZIRIM) ekranına döner. */}
            <button onClick={()=>{ setShowNedir(false); setGirisPhase("intro"); }}
              aria-label={t("common_close")}
              style={{ position:"absolute",top:10,right:10,width:34,height:34,borderRadius:"50%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.14)",color:"#c0b4d8",fontSize:17,lineHeight:1,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
            <div style={{ fontSize:24,marginBottom:8 }}>✦</div>
            <div style={{ fontSize:18,fontWeight:300,letterSpacing:1,color:"#efe8ff",marginBottom:18,fontFamily:"'Jost',sans-serif",lineHeight:1.4 }}>{pickLang(NEDIR_I18N.yolTitle, lang)}</div>
            {/* Bağlan ve Keşfet AYNI renkte (mor) — kullanıcı isteği; ayrım "Sakin nedir" sarısıyla vurgulanıyor. */}
            <button onClick={()=>{ setShowNedir(false); setScreen("mandala"); }}
              style={{ display:"block",width:"100%",textAlign:"left",padding:"14px 16px",background:"linear-gradient(160deg,rgba(40,30,60,0.5),rgba(20,15,32,0.55))",border:"1px solid rgba(184,122,220,0.4)",borderRadius:16,marginBottom:10,cursor:"pointer",boxShadow:"0 0 16px rgba(184,122,220,0.1)" }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}>
                <span style={{ fontSize:14,letterSpacing:2,color:"#b87adc",fontFamily:"'Jost',sans-serif" }}>◎ {pickLang(NEDIR_I18N.baglanT, lang).toLocaleUpperCase(t("locale_code"))}</span>
                <span style={{ color:"rgba(184,122,220,0.6)",fontSize:16 }}>→</span>
              </div>
              <div style={{ fontSize:12.5,color:"#b0a4c8",lineHeight:1.6,fontFamily:"'Inter',sans-serif" }}>{pickLang(NEDIR_I18N.bodyBaglan, lang)}</div>
            </button>
            <button onClick={()=>{ setShowNedir(false); setShowAilesi(true); }}
              style={{ display:"block",width:"100%",textAlign:"left",padding:"14px 16px",background:"linear-gradient(160deg,rgba(40,30,60,0.5),rgba(20,15,32,0.55))",border:"1px solid rgba(184,122,220,0.4)",borderRadius:16,marginBottom:14,cursor:"pointer",boxShadow:"0 0 16px rgba(184,122,220,0.1)" }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}>
                <span style={{ fontSize:14,letterSpacing:2,color:"#b87adc",fontFamily:"'Jost',sans-serif" }}>✦ {pickLang(NEDIR_I18N.kesfetT, lang).toLocaleUpperCase(t("locale_code"))}</span>
                <span style={{ color:"rgba(184,122,220,0.6)",fontSize:16 }}>→</span>
              </div>
              <div style={{ fontSize:12.5,color:"#b0a4c8",lineHeight:1.6,fontFamily:"'Inter',sans-serif" }}>{pickLang(NEDIR_I18N.bodyKesfet, lang)}</div>
            </button>
            {/* "Sakin nedir" — dikkat çekici sarı (eskiden Keşfet bu renkteydi). */}
            {/* Pop-up'taki "Sakin nedir?" → doğrudan YOLCULUK sekmesi açılır (kullanıcı
                isteği); bağlantı açıklaması artık o sekmenin en üstünde. */}
            <button onClick={()=>{ setShowNedir(false); setHakkindaTab("yolculuk"); setScreen("hakkinda"); }}
              style={{ background:"linear-gradient(135deg,rgba(240,192,96,0.16),rgba(200,150,60,0.10))",border:"1px solid rgba(240,192,96,0.5)",borderRadius:20,padding:"9px 22px",color:"#f0c060",fontSize:12,letterSpacing:1.5,cursor:"pointer",fontFamily:"'Jost',sans-serif",marginBottom:12,boxShadow:"0 0 16px rgba(240,192,96,0.14)" }}>
              {pickLang(NEDIR_I18N.title, lang)}
            </button>
            <div>
              <button onClick={()=>{ setShowNedir(false); try{ localStorage.setItem("sakin_nedir_off","1"); }catch(_){} }}
                style={{ background:"none",border:"none",color:"#9080b0",fontSize:12.5,letterSpacing:1,cursor:"pointer",fontFamily:"'Jost',sans-serif",padding:"4px 14px" }}>
                {pickLang(NEDIR_I18N.off, lang)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KİMLİK ÖNİZLEME — doğum kaydından hemen sonra anında karşılık (aha anı) */}
      {showKimlikReveal && (
        <div onClick={()=>{ setShowKimlikReveal(false); setScreen("sabah"); }} style={{ position:"fixed",inset:0,zIndex:99998,background:"rgba(0,0,0,0.88)",backdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}>
          <div onClick={e=>e.stopPropagation()} style={{ maxWidth:400,width:"100%",background:"linear-gradient(160deg,rgba(30,22,45,0.98),rgba(18,12,28,0.98))",border:"1px solid rgba(184,164,216,0.28)",borderRadius:20,padding:"30px 26px",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.6)",animation:"fadeUp 0.5s ease-out" }}>
            <div style={{ fontSize:26,marginBottom:10 }}>✦</div>
            <div style={{ fontSize:18,fontWeight:300,letterSpacing:1,color:"#efe8ff",marginBottom:20,fontFamily:"'Jost',sans-serif" }}>{pickLang(REVEAL_I18N.title, lang)}</div>
            <div style={{ display:"flex",flexWrap:"wrap",justifyContent:"center",gap:8,marginBottom:24 }}>
              {astro?.burc && (
                <div style={{ padding:"10px 16px",background:"rgba(240,192,96,0.08)",border:"1px solid rgba(240,192,96,0.3)",borderRadius:14 }}>
                  <div style={{ fontSize:9,letterSpacing:2,color:"#b09660",textTransform:"uppercase",fontFamily:"'Jost',sans-serif",marginBottom:3 }}>{pickLang(REVEAL_I18N.sun, lang)}</div>
                  <div style={{ fontSize:15,color:"#f0d8a0",fontFamily:"'Jost',sans-serif",letterSpacing:0.5 }}>{zodiacDisplay(astro.burc, lang)}</div>
                </div>
              )}
              {yukselen && (
                <div style={{ padding:"10px 16px",background:"rgba(184,164,216,0.08)",border:"1px solid rgba(184,164,216,0.3)",borderRadius:14 }}>
                  <div style={{ fontSize:9,letterSpacing:2,color:"#9080b8",textTransform:"uppercase",fontFamily:"'Jost',sans-serif",marginBottom:3 }}>{pickLang(REVEAL_I18N.asc, lang)}</div>
                  <div style={{ fontSize:15,color:"#d8c8f0",fontFamily:"'Jost',sans-serif",letterSpacing:0.5 }}>{zodiacDisplay(yukselen, lang)}</div>
                </div>
              )}
              {astro?.yasam && (
                <div style={{ padding:"10px 16px",background:"rgba(122,176,224,0.08)",border:"1px solid rgba(122,176,224,0.3)",borderRadius:14 }}>
                  <div style={{ fontSize:9,letterSpacing:2,color:"#7090b0",textTransform:"uppercase",fontFamily:"'Jost',sans-serif",marginBottom:3 }}>{pickLang(REVEAL_I18N.path, lang)}</div>
                  <div style={{ fontSize:15,color:"#a8ccf0",fontFamily:"'Jost',sans-serif",letterSpacing:0.5 }}>{astro.yasam}</div>
                </div>
              )}
            </div>
            <button onClick={()=>{ setShowKimlikReveal(false); handleOpenEmbed({ name:t("ailesi_tasarim_name"), embed:"/embedded/humandesign/index.html", color:"#b4a0d8" }); }}
              style={{ display:"block",width:"100%",marginBottom:10,padding:"13px 0",fontSize:14,letterSpacing:1.5,fontFamily:"'Jost',sans-serif",background:"linear-gradient(135deg,rgba(184,164,216,0.8),rgba(122,80,150,0.7))",border:"1px solid rgba(184,164,216,0.5)",borderRadius:24,color:"#fff",cursor:"pointer",boxShadow:"0 4px 18px rgba(122,80,150,0.35)" }}>
              {pickLang(REVEAL_I18N.tasarim, lang)}
            </button>
            <button onClick={()=>{ setShowKimlikReveal(false); setScreen("sabah"); }}
              style={{ display:"block",width:"100%",padding:"11px 0",fontSize:13,letterSpacing:1.5,fontFamily:"'Jost',sans-serif",background:"transparent",border:"1px solid rgba(255,255,255,0.14)",borderRadius:24,color:"#b0a4c8",cursor:"pointer" }}>
              {pickLang(REVEAL_I18N.gune, lang)}
            </button>
          </div>
        </div>
      )}

      {/* GİRİŞ */}
      {screen==="giris" && (
        <div style={{ maxWidth:360,width:"100%",textAlign:"center",padding:"24px 24px 80px",position:"relative",zIndex:1 }}>
          {/* Dönen kare logosu — zarif mor parıltı */}
          <div className="fade-up" style={{ marginBottom:36,position:"relative" }}>
            <div style={{ position:"relative",width:100,height:100,margin:"0 auto" }}>
              <div style={{ position:"absolute",inset:0,transform:"rotate(45deg)",border:"1px solid rgba(200,180,235,0.55)",borderRadius:10,animation:"diamondSpin 12s linear infinite",boxShadow:"0 0 14px rgba(184,164,216,0.32),inset 0 0 10px rgba(184,164,216,0.10)" }} />
              <div style={{ position:"absolute",inset:20,transform:"rotate(45deg)",border:"1px solid rgba(184,164,216,0.32)",borderRadius:6,animation:"diamondSpin 8s linear infinite reverse",boxShadow:"0 0 10px rgba(160,140,200,0.22)" }} />
              <div style={{ position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",width:14,height:14,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,255,255,0.95),rgba(220,205,240,0.8))",boxShadow:"0 0 20px rgba(220,200,240,0.65),0 0 40px rgba(184,164,216,0.45)" }} />
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
                <button className="sakin-btn-primary" onClick={()=>{ setGirisPhase("birth"); try { if(localStorage.getItem("sakin_nedir_off")!=="1"){ setShowNedir(true); } } catch(_) {} }}>{t("btn_ready")}</button>
                <div style={{ marginTop:24,display:"flex",justifyContent:"center",gap:12 }}>
                  <LangPicker lang={lang} setLang={setLang} />
                </div>
                {!isNative && (
                  <div style={{ marginTop:42,display:"flex",flexDirection:"column",alignItems:"center",gap:14 }}>
                    <div style={{ fontSize:11,letterSpacing:4,color:"#666",textTransform:"uppercase",fontFamily:"'Jost',sans-serif" }}>
                      {lang==="tr" ? "Telefonunda yanında taşı" : "Take it with you"}
                    </div>
                    <AppStoreBadge lang={lang} size="lg" />
                  </div>
                )}
              </>
            ) : (birthDate && !showBirthForm) ? (
              /* Doğum bilgisi zaten girilmiş → özet kart + "değiştir" */
              <div style={{ textAlign:"center",maxWidth:300,margin:"0 auto",display:"flex",flexDirection:"column",gap:14 }}>
                <div style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"18px 18px",display:"flex",flexDirection:"column",gap:8 }}>
                  <div style={{ fontSize:11,letterSpacing:2,color:"#888",textTransform:"uppercase",fontFamily:"'Jost',sans-serif" }}>{t("birth_your_info")}</div>
                  <div style={{ fontSize:14,color:"#d8c8f0",letterSpacing:1,fontFamily:"'Inter',sans-serif",lineHeight:1.8 }}>
                    {birthDate}{birthTime ? ` · ${birthTime}` : ""}
                    {birthCity ? <><br/>{birthCity}</> : null}
                  </div>
                </div>
                <button onClick={()=>setShowBirthForm(true)}
                  style={{ background:"none",border:"1px solid rgba(255,255,255,0.18)",borderRadius:100,padding:"10px 22px",color:"#bbb",fontSize:12,letterSpacing:1.8,cursor:"pointer",fontFamily:"'Jost',sans-serif",fontWeight:400,textTransform:"uppercase" }}>
                  {t("birth_edit_info")}
                </button>
                <button className="sakin-btn-primary" style={{ width:"100%",alignSelf:"stretch",boxSizing:"border-box",padding:"11px 16px",fontSize:13,letterSpacing:1.5,whiteSpace:"nowrap" }}
                  onClick={()=>{ setScreen(timeAwareEntryScreen()); }}>
                  {t("common_continue")}
                </button>
              </div>
            ) : (
              <div style={{ textAlign:"left",maxWidth:280,margin:"0 auto",display:"flex",flexDirection:"column" }}>
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:11,letterSpacing:2,color:"#666666",marginBottom:4,textTransform:"uppercase",fontFamily:"'Jost',sans-serif" }}>{t("birth_dob_label")}</div>
                  <SmartDateInput value={birthInput} onChange={(v)=>{ setBirthInput(v); setDateWarn(false); }} lang={lang} />
                  {dateWarn && <div style={{ fontSize:11,color:"#e89090",marginTop:5,fontFamily:"'Jost',sans-serif",letterSpacing:0.3,lineHeight:1.4 }}>{t("birth_date_required")}</div>}
                </div>
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:11,letterSpacing:2,color:"#666666",marginBottom:4,textTransform:"uppercase",fontFamily:"'Jost',sans-serif" }}>{t("birth_time_optional")}</div>
                  <SmartTimeInput value={birthTimeInput} onChange={setBirthTimeInput} lang={lang} />
                </div>
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:11,letterSpacing:2,color:"#666666",marginBottom:4,textTransform:"uppercase",fontFamily:"'Jost',sans-serif" }}>{t("birth_city_ascendant")}</div>
                  <SmartCityInput value={birthCityInput} onChange={(v)=>{ setBirthCityInput(v); setCityWarn(false); }} lang={lang} />
                  {cityWarn && <div style={{ fontSize:11,color:"#e89090",marginTop:5,fontFamily:"'Jost',sans-serif",letterSpacing:0.3,lineHeight:1.4 }}>{t("city_not_in_list")}</div>}
                </div>
                <div style={{ fontSize:11,letterSpacing:1,color:"#555555",marginBottom:14,textAlign:"center",fontFamily:"'Jost',sans-serif",lineHeight:1.5 }}>
                  {t("birth_data_safe")}
                </div>
                <button className="sakin-btn-primary" style={{ width:"100%",alignSelf:"stretch",boxSizing:"border-box",padding:"11px 16px",fontSize:13,letterSpacing:1.5,whiteSpace:"nowrap" }}
                  onClick={()=>{
                    // Onboarding atlanabilir: hiçbir şey girilmediyse geç. Ama bir şey
                    // girilip tarih geçersizse sessiz geçme — uyar.
                    if((birthTimeInput || birthCityInput) && !birthInput){ setDateWarn(true); return; }
                    setDateWarn(false);
                    if(birthInput){ localStorage.setItem("sakin_birth_date", birthInput); setBirthDate(birthInput); markStep("birth"); }
                    if(birthTimeInput){ localStorage.setItem("sakin_birth_time", birthTimeInput); setBirthTime(birthTimeInput); }
                    if(birthCityInput && !lookupCity(birthCityInput)){ setCityWarn(true); return; }
                    setCityWarn(false);
                    if(birthCityInput){ localStorage.setItem("sakin_birth_city", birthCityInput); setBirthCity(birthCityInput); }
                    setShowBirthForm(false);
                    // Aha anı: doğum bilgisi girildiyse önce anında karşılık kartı (burç/yükselen +
                    // Tasarım köprüsü); hiçbir şey girilmediyse eskisi gibi doğrudan sabaha.
                    if(birthInput){ setShowKimlikReveal(true); } else { setScreen("sabah"); }
                  }}>
                  {(birthInput||birthTimeInput||birthCityInput) ? t("birth_save_arrow") : t("birth_skip_arrow")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BAĞLANTI — insan iskeleti çakra sistemi */}
      {screen==="mandala" && (() => {
        const steps = [
          {id:"sabah",  label:t("bnav_morning"),  icon:"🌅", color:"#f0a060", glow:"255,140,60"},
          {id:"nefes",  label:t("bnav_breath"),   icon:"🫧", color:"#60b8e8", glow:"80,160,220"},
          {id:"ses",    label:t("bnav_sound"),    icon:"🔊", color:"#a07ae0", glow:"160,122,224"},
          {id:"chakra", label:t("bnav_chakra"),   icon:"💜", color:"#b87adc", glow:"180,100,255"},
          {id:"gun",    label:t("bnav_day"),      icon:"☀️", color:"#e8d060", glow:"230,200,60"},
          {id:"aksam",  label:t("bnav_evening"),  icon:"🌙", color:"#7ab0e0", glow:"100,150,220"},
          {id:"harita", label:t("bnav_connection"), icon:"✦",  color:"#82d9a3", glow:"80,210,140"},
        ];
        // "x/N ADIM" sayacı BAĞLANTI adım sayısını (6) göstermeli — `steps` dizisi
        // omurga görselinde harita düğümünü de çizdiği için 7 elemanlı, onu kullanma.
        const N=MANDALA_STEPS.length;
        // 40 gün kaldırıldı (kullanıcı isteği). Kalan 3-7-21 rozetleri, "Sakin nedir →
        // Yolculuk" bölümündeki 3 SEVİYE ikonlarıyla AYNI: 🌱 (L1) · 🔥 (7g → L2) ·
        // 👑 (21g → L3). Böylece rozet ile seviye görsel olarak eşleşir.
        const BADGES=[
          {days:3, icon:"🌱",label:t("bnav_3day")},
          {days:7, icon:"🔥",label:t("bnav_1week")},
          {days:21,icon:"👑",label:t("bnav_21day")},
        ];
        const nextStep = steps.find(s => !stepsCompleted[s.id]);

        return (
          <>
          {/* BAĞLANTI AKTİF — tam ekran ışık tüneli (tüm 9 adım tamamlanınca). */}
          {allStepsComplete && (
            <div className="sakin-tunnel-wrap" aria-hidden="true">
              <div className="sakin-tunnel-bands" />
              <div className="sakin-tunnel-ground" />
            </div>
          )}
          {/* Alt boşluk 90 → 150px: "Güne devam et" butonu alttaki adım göstergesi
              (progress strip, bottom:76px) altında kalıyordu (kullanıcı raporu). */}
          <div style={{maxWidth:400,width:"100%",padding:"54px 20px 150px",position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
            {/* Back button */}
            <button onClick={()=>goBack("sabah")}
              style={{ position:"absolute",top:14,left:14,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"50%",width:40,height:40,cursor:"pointer",color:"#ddd",fontSize:18,fontWeight:700,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center",paddingRight:2,zIndex:10 }}>
              ←
            </button>
            {/* Title */}
            <div style={{textAlign:"center",marginBottom:8}}>
              <div className="label-sm" style={{letterSpacing:5,marginBottom:5}}>{t("mandala_today_label")}</div>
            </div>

            {/* Streak row */}
            <div style={{display:"flex",gap:18,marginBottom:18,alignItems:"center"}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:26,fontWeight:200,color:"#f0a040",lineHeight:1,animation:streakData.current>=3?"streakFire 2s ease-in-out infinite":"none"}}>{streakData.current}</div>
                <div style={{fontSize:12,letterSpacing:2.5,color:"#777777",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>{t("mandala_streak")}</div>
              </div>
              <div style={{width:1,height:36,background:"rgba(255,255,255,0.07)"}}/>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:26,fontWeight:200,color:"#888888",lineHeight:1}}>{streakData.best}</div>
                <div style={{fontSize:12,letterSpacing:2.5,color:"#777777",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>{t("mandala_best")}</div>
              </div>
              <div style={{width:1,height:36,background:"rgba(255,255,255,0.07)"}}/>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:26,fontWeight:200,color:allStepsComplete?"#82d9a3":"#aaaaaa",lineHeight:1}}>{completedStepCount}<span style={{fontSize:14,color:"#777777"}}>/{N}</span></div>
                <div style={{fontSize:12,letterSpacing:2.5,color:"#777777",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>{t("mandala_steps")}</div>
              </div>
              <div style={{width:1,height:36,background:"rgba(255,255,255,0.07)"}}/>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:26,fontWeight:200,color:freqListenSec>0?"#a07ae0":"#888888",lineHeight:1}}>{freqListenSec>=60?`${Math.floor(freqListenSec/60)}m`:freqListenSec>0?`${freqListenSec}s`:"—"}</div>
                <div style={{fontSize:12,letterSpacing:2.5,color:"#777777",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>{t("mandala_freq")}</div>
              </div>
            </div>

            {/* İnsan İskeleti Çakra Bağlantı Sistemi */}
            {(() => {
              const pct = completedStepCount / N;
              const lightY = 520 - pct * 480;
              const chakraNodes = [
                {y:500, label:t("mandala_earth_lower"),     color:"#8B6914", zone:"sub"},
                {y:430, label:steps[0].label,                color:steps[0].color, id:steps[0].id, zone:"lower"},
                {y:378, label:steps[1].label,                color:steps[1].color, id:steps[1].id, zone:"lower"},
                {y:326, label:steps[2].label,                color:steps[2].color, id:steps[2].id, zone:"mid"},
                {y:274, label:steps[3].label,                color:steps[3].color, id:steps[3].id, zone:"mid"},
                {y:222, label:steps[4].label,                color:steps[4].color, id:steps[4].id, zone:"upper"},
                {y:170, label:steps[5].label,                color:steps[5].color, id:steps[5].id, zone:"upper"},
                {y:118, label:steps[6].label,                color:steps[6].color, id:steps[6].id, zone:"upper"},
                {y:40,  label:t("mandala_sky_lower"),       color:"#cfd8dc", zone:"supra"},
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
                      {/* IŞIK TÜNELİ (tam bağlantı) — gövde: kenarları parlak, ortası
                          saydam bir koridor hissi; akış: yukarıdan aşağı süzülen huzme. */}
                      <linearGradient id="tunnelBody" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%"   stopColor="rgba(255,240,190,0.30)"/>
                        <stop offset="28%"  stopColor="rgba(110,55,180,0.16)"/>
                        <stop offset="50%"  stopColor="rgba(255,255,255,0.04)"/>
                        <stop offset="72%"  stopColor="rgba(110,55,180,0.16)"/>
                        <stop offset="100%" stopColor="rgba(255,240,190,0.30)"/>
                      </linearGradient>
                      {/* Akış gradyanı: userSpaceOnUse + spreadMethod="repeat" →
                          280 birimlik desen dikey olarak sonsuz tekrar eder. İki uç da
                          saydam beyaz (aynı renk) olduğu için tekrar dikişi görünmez;
                          huzme kesik kesik değil, sürekli akar. */}
                      <linearGradient id="tunnelFlow" gradientUnits="userSpaceOnUse"
                        x1="0" y1="0" x2="0" y2="280" spreadMethod="repeat">
                        <stop offset="0%"   stopColor="rgba(255,255,255,0.00)"/>
                        <stop offset="18%"  stopColor="rgba(255,255,255,0.55)"/>
                        <stop offset="34%"  stopColor="rgba(240,214,96,0.45)"/>
                        <stop offset="52%"  stopColor="rgba(96,40,168,0.62)"/>
                        <stop offset="70%"  stopColor="rgba(255,255,255,0.28)"/>
                        <stop offset="100%" stopColor="rgba(255,255,255,0.00)"/>
                      </linearGradient>
                      {/* Tünelin iç boşluğu — huzme BUNUN DIŞINA taşamaz. Böylece ışık
                          gökten girer, YER hizasında tünelin içinde biter (kullanıcı:
                          "ekranın en altına gidiyor, onu yerde bitir"). */}
                      <clipPath id="tunnelClip">
                        <rect x="88" y="24" width="44" height="504" rx="22" />
                      </clipPath>
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
                      <circle key={`ep${i}`} cx="110" r="2" fill="rgba(255,70,70,0.95)"
                        style={{animation:`electricRise ${2+i*0.7}s linear infinite`,animationDelay:`${i*0.6}s`}}>
                        <animateMotion dur={`${2.5+i*0.5}s`} repeatCount="indefinite" begin={`${i*0.4}s`}>
                          <mpath href="#spinePath" />
                        </animateMotion>
                      </circle>
                    ))}
                    <path id="spinePath" d="M110,500 L110,40" fill="none" stroke="none" />

                    {/* İnsan silueti */}
                    {/* Kafa */}
                    {/* İNSAN SİLUETİ — opaklıklar 0.06-0.10 arasındaydı, telefonda (özellikle
                        düşük parlaklıkta) neredeyse görünmüyordu. Kullanıcı: "bu ekran
                        telefonda bazen zor görülüyor, biraz daha belirgin yap, abartma."
                        Yaklaşık iki katına çıkarıldı; hâlâ arka plan öğesi, çakra
                        düğümlerinin ve ışık tünelinin önüne geçmiyor. */}
                    <circle cx="110" cy="100" r="22" fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth="1.4" />
                    {/* Boyun */}
                    <line x1="110" y1="122" x2="110" y2="140" stroke="rgba(255,255,255,0.08)" strokeWidth="1.2" />
                    {/* Gövde */}
                    <path d="M80 140 Q110 136 140 140 L136 330 Q110 336 84 330Z" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1.2" />
                    {/* Kollar */}
                    <path d="M80 150 Q60 180 50 240" stroke="rgba(255,255,255,0.14)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                    <path d="M140 150 Q160 180 170 240" stroke="rgba(255,255,255,0.14)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                    {/* Bacaklar */}
                    <path d="M94 330 Q90 390 85 470" stroke="rgba(255,255,255,0.14)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                    <path d="M126 330 Q130 390 135 470" stroke="rgba(255,255,255,0.14)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>

                    {/* Çakra düğümleri */}
                    {chakraNodes.map((node,i) => {
                      const done = node.id ? !!stepsCompleted[node.id] : (node.zone==="sub" ? pct>0 : pct>=1);
                      const isNext = node.id && nextStep?.id===node.id;
                      const lit = node.y >= lightY;
                      const r = (node.zone==="sub"||node.zone==="supra") ? 8 : 10;
                      return (
                        <g key={i} style={{cursor:node.id?"pointer":"default"}} onClick={()=>{ if(node.id) setScreen(node.id); }}>
                          {/* Glow hale — KALDIRILDI (kullanıcı: "yuvarlak dans eden
                              halkaları kaldır, çakraların etrafındaki daireler").
                              Bu, her çakranın çevresinde büyüyüp küçülen (nodeCharge)
                              nabız halesiydi. Düğümlerin kendi rengi/parlaklığı yeterli. */}
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
                      fontFamily="'Jost',sans-serif">▼ {t("mandala_earth_upper")}</text>

                    {/* Gök simgesi */}
                    <text x="110" y="22" textAnchor="middle" fontSize="7" letterSpacing="2" fill="rgba(255,255,255,0.2)"
                      fontFamily="'Jost',sans-serif">▲ {t("mandala_sky_upper")}</text>

                    {/* TAM BAĞLANTI — ÇAKRA SÜTUNU IŞIK TÜNELİNE DÖNÜŞÜR
                        (kullanıcı: "tüm bağlantılar tamamlanınca onay tikleri yani
                        çakralar bir tünele dönüşsün ve ordan ışık geçsin, yukarıdan
                        aşağı doğru bir animasyon").
                        Katmanlar: (1) tünel gövdesi — çakraları saran dikey koridor,
                        (2) içinden YUKARIDAN AŞAĞI akan ışık huzmesi, (3) aşağı inen
                        parlak parçacıklar. "BAĞLANTI AKTİF" yazısı buradan KALDIRILDI
                        (altta kalıyordu) — artık aşağıdaki kutuda gösteriliyor. */}
                    {allStepsComplete && <>
                      {/* (1) Tünel gövdesi: çakra hattını saran koridor */}
                      <rect x="86" y="22" width="48" height="508" rx="24"
                        fill="url(#tunnelBody)" stroke="rgba(255,240,190,0.28)" strokeWidth="1" />
                      {/* (2) Kesintisiz ışık akışı — huzme sürekli aşağı kayar
                          (gradyanın kendisi hareket eder, tek tek parçacık yok).
                          NOT: Çakraların etrafında aşağı süzülen "dans eden halkalar"
                          KALDIRILDI (kullanıcı isteği) — akış artık sadece bu düz,
                          sakin huzmeden ibaret. */}
                      <g clipPath="url(#tunnelClip)">
                        {/* Dikdörtgen tünelden bir periyot (280) DAHA UZUN: kayarken
                            üstte boşluk kalmaz. Kırpma sayesinde sadece tünelin içi
                            görünür — huzme GÖK'ten girer, YER'de tünelin içinde biter. */}
                        <rect x="88" y="-256" width="44" height="800"
                          fill="url(#tunnelFlow)" style={{ animation:"sakinTunnelDown 2.2s linear infinite" }} />
                      </g>
                      {/* (4) Tünel ağzı parlaması — üstte giriş, altta yeryüzü çıkışı */}
                      <ellipse cx="110" cy="22" rx="22" ry="6" fill="rgba(255,250,225,0.5)" filter="url(#glowF)"/>
                      <ellipse cx="110" cy="528" rx="22" ry="6" fill="rgba(255,225,170,0.45)" filter="url(#glowF)"/>
                    </>}
                  </svg>
                </div>
              );
            })()}

            {/* BAĞLANTI ŞARTLARI — kullanıcı neyin eksik olduğunu görsün (yoksa
                "yaptım ama bağlantı olmuyor" karışıklığı olur). Sağlananlar ✓, eksikler
                mevcut/hedef sayısıyla gösterilir. */}
            {!allStepsComplete && (() => {
              const reqs = [
                { id:"sabah",  label:t("bnav_morning"),  cur:stepsCompleted["sabah"]?1:0, need:1, unit:"" },
                { id:"gun",    label:t("bnav_day"),      cur:readGunTasks(),   need:STEP_MIN.gun,   unit:"" },
                { id:"nefes",  label:t("bnav_breath"),   cur:breathCount,      need:STEP_MIN.nefes, unit:"" },
                { id:"ses",    label:t("bnav_sound"),    cur:freqListenSec,    need:STEP_MIN.ses,   unit:"sn" },
                { id:"chakra", label:t("bnav_chakra"),   cur:readTerapiSec(),  need:STEP_MIN.chakra,unit:"sn" },
                { id:"aksam",  label:t("bnav_evening"),  cur:stepsCompleted["aksam"]?1:0, need:1, unit:"" },
                // AYNA — 7. adım (harita yerine). Tıklamak/ekrana girmek yeterli.
                { id:"rehber", label:t("mirror_label"),   cur:stepsCompleted["rehber"]?1:0,need:1, unit:"" },
              ];
              return (
                <div style={{marginTop:6,marginBottom:2,padding:"10px 14px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,maxWidth:320,width:"100%"}}>
                  {/* Başlık "ADIM" → "Günün Bağlantısı"; kutucuklar artık TIKLANABİLİR
                      (ilgili ekrana götürür). Alttaki tekrar eden adım navigasyonu
                      kaldırıldı — aynı 7 adım iki kez görünüyordu (kullanıcı raporu). */}
                  <div style={{fontSize:10,letterSpacing:2.5,color:"#777",textTransform:"uppercase",fontFamily:"'Jost',sans-serif",textAlign:"center",marginBottom:8}}>{t("conn_today_title")}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center"}}>
                    {reqs.map(r => {
                      const ok = !!stepsCompleted[r.id];
                      return (
                        <button key={r.id} onClick={()=>setScreen(r.id)}
                          style={{fontSize:11,letterSpacing:0.5,fontFamily:"'Jost',sans-serif",
                          padding:"5px 10px",borderRadius:100,cursor:"pointer",
                          background: ok?"rgba(130,217,163,0.12)":"rgba(255,255,255,0.03)",
                          border:`1px solid ${ok?"rgba(130,217,163,0.35)":"rgba(255,255,255,0.08)"}`,
                          color: ok?"#82d9a3":"#8a8a95"}}>
                          {/* need>1 olanlarda ilerleme (12/120sn gibi) anlamlı; need===1
                              olanlarda "0/1" gereksiz gürültüydü — kaldırıldı (kullanıcı isteği). */}
                          {ok ? "✓ " : r.need > 1 ? `${Math.min(r.cur,r.need)}/${r.need}${r.unit} ` : ""}{r.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Rozetler — "Günün Bağlantısı" ile "Güne devam et" ARASINDA (kullanıcı isteği).
                AKTİF KADEME yanar: kullanıcı hangi dilimdeyse (3 / 7 / 21) o rozet ışıklı,
                geçilenler sönük-dolu, henüz ulaşılmayanlar soluk. */}
            {/* Küçük ve zarif "hap" (pill) rozetler — uygulamanın sade diline uygun:
                ikon + sade sayı yan yana, tek satır, ince çerçeve. (kullanıcı:
                "kutucuklar daha küçük daha zarif appin diline uygun olsun 3-7-21") */}
            <div style={{display:"flex",gap:7,marginTop:12,marginBottom:16,flexWrap:"wrap",justifyContent:"center"}}>
              {BADGES.map(b=>{
                const cur = streakData.current || 0;
                const reached = cur >= b.days;                     // bu kademeye ulaşıldı
                // Aktif kademe = ulaşılanların EN BÜYÜĞÜ
                const activeTier = BADGES.filter(x=>cur>=x.days).map(x=>x.days).pop() ?? null;
                const isActive = activeTier !== null && b.days === activeTier;
                return(
                  <div key={b.days} style={{
                    display:"flex",alignItems:"center",gap:5,
                    background:isActive?"rgba(255,200,60,0.10)":"transparent",
                    border:`1px solid ${isActive?"rgba(255,200,60,0.45)":reached?"rgba(255,200,60,0.16)":"rgba(255,255,255,0.06)"}`,
                    borderRadius:100,padding:"4px 11px",
                    opacity:isActive?1:reached?0.7:0.3,transition:"all 0.35s",
                    boxShadow:isActive?"0 0 12px rgba(255,200,60,0.20)":"none",
                  }}>
                    <span style={{fontSize:11,lineHeight:1,filter:isActive?"drop-shadow(0 0 4px rgba(255,200,60,0.5))":"none"}}>{b.icon}</span>
                    <span style={{fontSize:10.5,letterSpacing:1.2,color:isActive?"#ffd97a":reached?"#c8a860":"#5f5f68",fontFamily:"'Jost',sans-serif"}}>{b.days}</span>
                  </div>
                );
              })}
            </div>

            {/* CTA — "Bugün tamamlandı" yerine BAĞLANTI AKTİF (kullanıcı isteği);
                yaprak yerine elektrik ikonu. Bu yazı eskiden SVG'nin içindeydi ve
                altta kalıyordu, oradan kaldırılıp buraya alındı. */}
            {allStepsComplete?(
              <div style={{textAlign:"center",marginTop:4,padding:"12px 20px",background:"rgba(255,220,120,0.07)",border:"1px solid rgba(255,220,120,0.25)",borderRadius:16,maxWidth:280,width:"100%",boxShadow:"0 0 18px rgba(255,210,110,0.14)"}}>
                <div style={{fontFamily:"'Jost',sans-serif",fontSize:14,color:"#ffd97a",letterSpacing:2.5,textTransform:"uppercase"}}>
                  ⚡ {t("mandala_connection_active")}
                </div>
                <div style={{fontFamily:"'Jost',sans-serif",fontSize:11.5,letterSpacing:1.5,color:"#c8b878",marginTop:6}}>
                  ✦ {t("mandala_streak")} {streakData.current} · L{streakLevel} · x{streakMultiplier}
                  {nextLevelAt ? ` · →${nextLevelAt}` : ""}
                </div>
                {/* Bağlantı tamamlandıktan sonra uygulamayı kapatıp dönünce kullanıcı
                    bu ekranda kalıyordu ve ilerleyecek buton yoktu (kullanıcı isteği:
                    "oraya güne devam et butonu ekle, bir şeyin altında kalmasın"). */}
                <button className="sakin-btn-primary" style={{marginTop:12,fontSize:13,letterSpacing:2,width:"100%"}}
                  onClick={()=>setScreen("sabah")}>
                  {t("mandala_continue_today")}
                </button>
              </div>
            ):nextStep?(
              <button className="sakin-btn-primary" style={{marginTop:4,fontSize:13,letterSpacing:2}}
                onClick={()=>setScreen(nextStep?.id || "sabah")}>
                {completedStepCount>0 ? t("mandala_continue_today") : t("mandala_start_today")}
              </button>
            ):null}


            {/* NOT: Buradaki "GÜN — adım navigasyonu" bölümü KALDIRILDI. Yukarıdaki
                "Günün Bağlantısı" bölümü aynı 7 adımı zaten gösteriyordu (kullanıcı:
                "bağlanda 2 kez görsel tekrar var, en alttakini kaldır") ve o bölümün
                kutucukları artık tıklanabilir. */}
          </div>
          </>
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
            <div style={{ marginTop:16,fontFamily:"'Jost',sans-serif",fontWeight:300,fontSize:13,letterSpacing:4,textTransform:"uppercase",color:"#777777" }}>{time.toLocaleTimeString(t("locale_code"),{hour:"2-digit",minute:"2-digit"})}</div>
          </div>
          {stepsCompleted["sabah"] ? (
            /* ── Tamamlandı: salt-okunur özet ── */
            <div>
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:13,letterSpacing:3,color:"#888888",marginBottom:10,fontFamily:"'Jost',sans-serif",textTransform:"uppercase" }}>{t("common_today_intent")}</div>
                <div style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,140,50,0.2)",borderRadius:12,padding:"14px 16px",fontSize:14,color:"#e0d8f4",lineHeight:1.8,fontStyle:"italic" }}>
                  {niyet || "—"}
                </div>
              </div>
              <div style={{ marginBottom:28 }}>
                <div style={{ fontSize:13,letterSpacing:3,color:"#888888",marginBottom:10,fontFamily:"'Jost',sans-serif",textTransform:"uppercase" }}>{t("common_selected_words")}</div>
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
                  {t("common_edit")}
                </button>
              </div>
              <div style={{ textAlign:"center",fontSize:13,letterSpacing:2,color:"#777777",fontFamily:"'Jost',sans-serif" }}>
                {t("common_resets_tomorrow")}
              </div>
            </div>
          ) : (
            /* ── Düzenlenebilir form ── */
            <>
              <div style={{ marginBottom:28 }}>
                <div style={{ fontFamily:"'Inter',sans-serif",fontSize:19,letterSpacing:0.5,marginBottom:14,fontWeight:300,lineHeight:1.5,color:"#cccccc" }}>{t("intention_q")}</div>
                <textarea className="sakin-input" rows={3} autoComplete="off" autoCorrect="off" placeholder={t("intention_ph")} value={niyet} onChange={e=>setNiyet(e.target.value)} />
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
                    {t("premium_unlock_words")}
                  </button>
                )}
                {selectedWords.length>0 && <div style={{ marginTop:10,fontSize:14,color:"#b0baca",letterSpacing:1.5 }}>{selectedWords.join(" · ")}</div>}
              </div>
              {selectedWords.length < 3 || !niyet.trim() ? (
                <div style={{ textAlign:"center", fontSize:14, color:"#888888", letterSpacing:1, padding:"12px 0" }}>
                  {`${niyet.trim() ? "✓" : "○"} ${t("premium_unlock_word_hint").replace("{n}", String(selectedWords.length))}`}
                </div>
              ) : (
                <button className="sakin-btn-primary" style={{ width:"100%" }} onClick={()=>{ const dk=sakinDayKey(); localStorage.setItem("sakin_niyet_"+dk,niyet); localStorage.setItem("sakin_words_"+dk,JSON.stringify(selectedWords)); markStep("sabah"); setScreen("gun"); }}>{t("btn_continue")}</button>
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
              {/* Diyagram %30 büyütüldü (kullanıcı: "buradaki mod biraz büyüyebilir").
                  viewBox sabit → tüm koordinatlar ve etiketler birlikte ölçeklenir,
                  tek tek koordinat düzeltmesi gerekmez. */}
              <div style={{ position:"relative",width:234,height:338 }}>
              <svg width="234" height="338" viewBox="0 0 180 260" style={{ overflow:"visible" }}>
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
                  {t("sabah_diyafram")}
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
                  {t("sabah_belly")}
                </text>
                {/* Arrow indicators */}
                <g style={{ opacity:breathIsActive?1:0.2, transition:`opacity ${breathIsActive?breathInDur:breathOutDur} ease-in-out` }}>
                  <path d="M 48 155 L 38 155 M 43 150 L 38 155 L 43 160" fill="none" stroke="rgba(80,200,180,0.5)" strokeWidth="1.2"/>
                  <path d="M 132 155 L 142 155 M 137 150 L 142 155 L 137 160" fill="none" stroke="rgba(80,200,180,0.5)" strokeWidth="1.2"/>
                </g>
                {/* Chest label */}
                <text x="90" y="108" textAnchor="middle" fill="rgba(80,200,180,0.3)" fontSize="9" fontFamily="'Jost',sans-serif">
                  {t("sabah_chest_still")}
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

          {/* Modun NE YAPTIĞI seans sırasında da yazsın. Bu açıklama şimdiye kadar
              yalnızca başlamadan önce görünüyordu; kullanıcı seansın içindeyken
              "tam olarak anlatmıyor derdini" dedi. Metin zaten 7 dilde mevcut
              (breath_desc_*) — yeni metin yazılmadı, var olan yeniden kullanıldı. */}
          {breathStarted && (
            <div style={{ maxWidth:300,margin:"0 auto 14px",fontSize:12.5,fontWeight:300,color:"rgba(200,190,220,0.5)",lineHeight:1.55,textAlign:"center",fontFamily:"'Inter',sans-serif" }}>
              {t(`breath_desc_${breathMode}`)}
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
                    {t("premium_unlock_breath")}
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
              {/* Geri = geldiğin yer (kullanıcı: "aynadan gidilen bölümlere geri
                  tıklanınca aynaya dönsün"). Eskiden sabit "sabah"a gidiyordu. */}
              <button className="sakin-btn" onClick={()=>goBack("sabah")}>{t("back")}</button>
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
          // ctx'i ASLA close etme — iOS WKWebView gesture context'i kaybedince yeni ctx açılamaz.
          // Sadece osc'leri durdur ve gain'i sıfırla; ctx singleton olarak yeniden kullanılır.
          if (freqGainRef.current && freqCtxRef.current) {
            try { freqGainRef.current.gain.linearRampToValueAtTime(0, freqCtxRef.current.currentTime + 0.8); } catch(_) {}
          }
          const _gain = freqGainRef.current;
          setTimeout(() => {
            // Tüm osilatörleri durdur VE disconnect et — yoksa LFO master.gain'i modüle
            // etmeye devam edip "kısılan-artan takılı ses dalgası" bırakıyordu.
            freqOscsRef.current.forEach(o => { try { o.stop(); } catch(_) {} try { o.disconnect(); } catch(_) {} });
            freqOscsRef.current = [];
            try { freqOscRef.current?.stop(); } catch(_) {}
            try { _gain?.disconnect(); } catch(_) {}
            freqOscRef.current = null; freqGainRef.current = null;
          }, 820);
          stopBirdSound();
          stopSilenceKeepAlive();
          clearNowPlaying();
          setPlayingHz(null);
        };
        const playFreq = (hz) => {
          if (playingHz === hz) { stopFreqTone(); return; }
          if (playingHz) stopFreqTone();
          const freqData = FREQS.find(f => f.hz === hz);
          // Now Playing meta + arka plan keepalive — Web Audio'nun arka planda devamı için.
          // Frekans adını 7 dilden uygun olanı seç (TR/EN dışında DE/ES/PT/FR/JA da var)
          const freqName = getFreqName(hz, lang) || freqData?.name || "";
          const label = freqName ? `${hz} Hz · ${freqName}` : `${hz} Hz`;
          lastFreqHzRef.current = hz;
          lastFreqLabelRef.current = label;
          startSilenceKeepAlive();
          showNowPlaying({ title: label, artist: "Sakin" });
          // KRİTİK: AudioContext'i gesture handler'ın İLK satırında oluştur ve resume et.
          // setTimeout içinde oluşturulursa iOS gesture context'ini kaybeder ve ses çıkmaz.
          // Sağlam: kapalı/kullanılamaz context'i YENİDEN oluştur; suspended/interrupted'ı
          // resume et. (Telefon sessizken/AVAudioSession kesintisinden sonra context
          // suspended kalıp ses çıkmıyordu; unmute sonrası dokunuşta artık toparlanır.)
          if (!freqCtxRef.current || freqCtxRef.current.state === "closed") {
            try { freqCtxRef.current = __makeAudioCtx(); } catch(_) {}
          }
          if (freqCtxRef.current && freqCtxRef.current.state !== "running") {
            try { freqCtxRef.current.resume(); } catch(_) {}
          }
          setTimeout(() => {
            const ctx = freqCtxRef.current;
            if (!ctx) return;
            const allOscs = [];
            const master = ctx.createGain();
            master.gain.setValueAtTime(0, ctx.currentTime);
            master.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 2);
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
              g.gain.linearRampToValueAtTime(0.16 * amp, ctx.currentTime + 2);
              o.connect(g); g.connect(master); o.start();
              allOscs.push(o);
              if (ratio === 1) { freqOscRef.current = o; }
            });
            freqOscsRef.current = allOscs;
            // Kuş sesi arka planda kalsın, solfeggio tonu öne çıksın (kullanıcı isteği):
            // 0.38/0.22 → 0.16/0.10. (741 Hz kuşu diğerlerinden kısık kaydedildiği için
            // oransal olarak biraz yüksek tutuluyor.)
            // 741 Hz eskiden 0.10 ile çalıyordu; o frekansın kuşu "yedek" ve
            // ölçümde en gürültülü dosya — yani en cızırtılısı en yüksek sesle
            // çalıyordu. Artık hepsi 0.06 temel seviyede, üstüne BIRD_TRIM.
            if (freqData?.bird) playBirdSound(freqData.bird, 0.06);
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
              {/* Zihni Boşalt — kaleidoskop + drone müzik ilk sırada */}
              <div className="slide-in" style={{ animationDelay:"0s",opacity:0 }}>
                <div
                  onClick={() => setShowMindClear(true)}
                  style={{
                    background: "linear-gradient(135deg,rgba(120,200,180,0.14),rgba(60,100,140,0.08))",
                    border: "1px solid rgba(120,200,180,0.32)",
                    borderRadius: 15,
                    padding: "14px 18px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    boxShadow: "0 0 22px rgba(120,200,180,0.10)",
                  }}>
                  <div style={{ width:44,height:44,borderRadius:"50%",flexShrink:0,
                    background:"radial-gradient(circle,rgba(160,220,200,0.6),rgba(80,140,120,0.25))",
                    boxShadow:"0 0 18px rgba(120,200,180,0.35)",
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:"#fff" }}>
                    ◎
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:15,fontWeight:500,color:"#d8efe4",letterSpacing:1,marginBottom:3,fontFamily:"'Jost',sans-serif" }}>
                      {t("mind_empty")}
                    </div>
                    <div style={{ fontSize:12,color:"#88b0a0",lineHeight:1.5,letterSpacing:0.3 }}>
                      {t("mind_rest")}
                    </div>
                  </div>
                  <div style={{ color:"rgba(160,220,200,0.5)",fontSize:18,flexShrink:0 }}>→</div>
                </div>
              </div>
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
              {/* Geri = geldiğin yer; eskiden sabit "nefes"e gidiyordu. Ton önce durur. */}
              <button className="sakin-btn" onClick={()=>{ stopFreqTone(); goBack("nefes"); }}>{t("back")}</button>
              <button className="sakin-btn-primary" onClick={()=>{ stopFreqTone(); markStep("ses"); setScreen("chakra"); }}>{t("sound_btn_next")}</button>
            </div>
          </div>
        );
      })()}

      {/* ÇAKRA */}
      {screen==="chakra" && (
        <div style={{ textAlign:"center",padding:"62px 30px 170px",position:"relative",zIndex:1,maxWidth:360 }}>
          {/* Çakra arka plan halesi + ÜST GEÇİŞ YUMUŞATMA (kullanıcı: "üst bar ile alt
              kısım arası geçiş çok keskin, alt kısım açık renk olunca kötü görünüyor").
              Üste siyahtan şeffafa inen bir degrade eklendi; üst bar ile içerik arasında
              yumuşak bir kaynaşma olur, açık tonlu çakralarda keskin çizgi kalmaz. */}
          <div style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none",background:`radial-gradient(ellipse at 50% 42%,${chakra.pastel}1a 0%,transparent 58%)` }} />
          <div style={{ position:"fixed",top:0,left:0,right:0,height:"calc(210px + var(--sat))",zIndex:0,pointerEvents:"none",
            background:"linear-gradient(180deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.72) 32%, rgba(0,0,0,0.34) 64%, rgba(0,0,0,0) 100%)" }} />
          <div style={{ position:"relative",zIndex:1 }}>
            <div className="label-sm" style={{ marginBottom:34,letterSpacing:4 }}>{t("chakra_subtitle")}</div>
            <div style={{ width:146,height:146,borderRadius:"50%",margin:"0 auto 32px",background:`radial-gradient(circle,${chakra.color}cc,${chakra.pastel}44)`,boxShadow:`0 0 52px ${chakra.color}55,0 0 105px ${chakra.color}22`,animation:"slowPulse 4s ease-in-out infinite" }} />
            <div style={{ fontFamily:"'Jost',sans-serif",fontWeight:300,fontSize:13,letterSpacing:4,textTransform:"uppercase",color:chakra.pastel,marginBottom:16,opacity:0.9 }}>{chakra.name} {t("chakra_name_suf")}</div>
            <div style={{ fontFamily:"'Inter',sans-serif",fontSize:19,fontWeight:300,lineHeight:1.8,marginBottom:10,wordBreak:"break-word",color:"#cccccc" }}>{chakra.desc}</div>
            <div className="label-sm" style={{ marginBottom:30 }}>{t("chakra_stay")}</div>
            <button className="sakin-btn terapi-pill" style={{ marginBottom:14,padding:"11px 28px" }} onClick={()=>setScreen("terapi")}>{t("btn_therapy")}</button>
            <div>
              <button className="sakin-btn-primary" style={{ padding:"10px 28px",fontSize:13 }} onClick={()=>{ markStep("chakra"); setScreen("aksam"); }}>{t("btn_next")}</button>
            </div>
          </div>
        </div>
      )}

      {screen==="terapi" && <TerapiScreen onBack={()=>goBack("chakra")} onNext={()=>{ markStep("chakra"); setScreen("aksam"); }} lang={lang} isPremium={isPremium} onPaywall={()=>setScreen("fiyat")} />}
      {screen==="gun"    && <ReminderScreen onBack={()=>goBack("sabah")} onNext={()=>{ markStep("gun"); setScreen("nefes"); }} lang={lang} onTasksDone={setGunTasksDone} onGo={(s)=>setScreen(s)} />}

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
                <textarea className="sakin-input" rows={2} autoComplete="off" autoCorrect="off" placeholder="..." value={aksamNote} onChange={e=>setAksamNote(e.target.value)} />
              </div>
              <div style={{ marginBottom:26 }}>
                <div style={{ fontSize:13,color:"#666666",marginBottom:9,letterSpacing:1 }}>{t("gratitude_q")}</div>
                <textarea className="sakin-input" rows={2} autoComplete="off" autoCorrect="off" placeholder="..." value={sukur} onChange={e=>setSukur(e.target.value)} />
              </div>
              {/* (Gereksiz dekoratif emoji sırası kaldırıldı — kullanıcı geri bildirimi) */}
              <div style={{ marginBottom:6 }} />
              {/* Akşam kapanışı sonrası artık HARİTA değil AYNA'ya yönlendirir
                  (kullanıcı: "haftama bak yerine 'aynaya bak' yazsın ve içsel ayna
                  ekranına yönlendir"). openMirror portal geçişini de oynatır. */}
              <button className="sakin-btn-primary" style={{ width:"100%" }} onClick={()=>{ markStep("aksam"); openMirror(); }}>{t("btn_see_week")}</button>
            </>
          )}
        </div>
      )}

      {/* REHBER */}
      {/* İÇSEL AYNA — Google-style merkezi arama */}
      {screen==="rehber" && (
        <div style={{ maxWidth:520,width:"100%",padding: sikayetAnaliz ? "20px 24px 170px" : "52px 24px 170px",position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",animation:isNative?"mirrorReveal 1.1s cubic-bezier(0.25,0.1,0.25,1)":"none" }}>
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
                  {t("mirror_ask_heart")}
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
                  {t("mirror_reading")}
                </div>
              </div>
            ) : sikayetAnaliz ? (
              /* SONUÇ EKRANI */
              <div>
                <div style={{ fontSize:13,letterSpacing:2.5,color:"#a070d0",opacity:0.8,marginBottom:14,fontFamily:"'Jost',sans-serif" }}>
                  {sikayet.toLocaleUpperCase(lang)} {t("analysis_suf")}
                </div>
                <div style={{ fontSize:14,color:"#ccc0e0",lineHeight:2.1,whiteSpace:"pre-wrap",fontFamily:"'Inter',sans-serif",marginBottom:24 }}>
                  <FreqText text={sikayetAnaliz} onNav={(type, val) => {
                    if (type === "glossary") { setKilavuzQ(val); setShowKilavuz(true); }
                    else if (type === "freq")   { pendingFreqRef.current = val; setScreen("ses"); }
                    else if (type === "breath") { pendingBreathRef.current = val; setScreen("nefes"); }
                    else if (type === "screen") { setScreen(val); }
                  }} />
                </div>
                {/* PAYLAŞ — Instagram hikâyesi ölçüsünde (1080x1920) kart üretir.
                    Kullanıcı: "içsel rehberi story'de paylaşabilsin, kartlardaki
                    gibi bir paylaş menüsü ekle." shareImageBlob native/web farkını
                    kendi hallediyor (Android WebView'da blob indirme çalışmıyor). */}
                <div style={{ display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap" }}>
                  <button onClick={async ()=>{
                      try {
                        const cv = buildMirrorStoryCard(
                          `${sikayet} ${t("analysis_suf")}`, sikayetAnaliz,
                          pickLang({tr:"İÇSEL AYNA",en:"INNER MIRROR",de:"INNERER SPIEGEL",es:"ESPEJO INTERIOR",pt:"ESPELHO INTERIOR",fr:"MIROIR INTÉRIEUR",ja:"内なる鏡"}, lang));
                        const blob = await new Promise(r => cv.toBlob(r, "image/png"));
                        if (blob) await shareImageBlob(blob, "sakin-ayna.png");
                      } catch (_) {}
                    }}
                    style={{ background:"rgba(160,112,208,0.18)",border:"1px solid rgba(160,112,208,0.45)",borderRadius:24,color:"#c8a8f0",cursor:"pointer",fontSize:13,letterSpacing:2.5,padding:"9px 22px",fontFamily:"'Jost',sans-serif",fontWeight:300 }}>
                    {pickLang({tr:"PAYLAŞ",en:"SHARE",de:"TEILEN",es:"COMPARTIR",pt:"PARTILHAR",fr:"PARTAGER",ja:"シェア"}, lang)}
                  </button>
                  <button onClick={()=>{ setSikayetAnaliz(""); setSikayet(""); setSikayetHis(""); }}
                    style={{ background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:24,color:"#a070d0",cursor:"pointer",fontSize:13,letterSpacing:2.5,padding:"9px 22px",fontFamily:"'Jost',sans-serif",fontWeight:300 }}>
                    {t("mirror_new_search")}
                  </button>
                </div>
              </div>
            ) : (
              /* ARAMA KUTUSU */
              <div>

                <div style={{ position:"relative",marginBottom:14 }}>
                  <textarea
                    value={sikayet}
                    onChange={e=>setSikayet(e.target.value)}
                    onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey&&sikayet.trim()){e.preventDefault();requireAiConsent(generateSikayetAnaliz);} }}
                    placeholder={t("mirror_input_ph")}
                    rows={3}
                    autoComplete="off" autoCorrect="off"
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
                  {/* Inline arama butonu — boşken sabit/sönük; yazınca parlar + pulse
                      ("yazını bitirince buraya bas" hissi, Sakin Ailesi butonu gibi) */}
                  <button
                    onClick={()=>requireAiConsent(generateSikayetAnaliz)}
                    disabled={!sikayet.trim()}
                    style={{
                      position:"absolute",right:12,bottom:12,
                      width:44,height:44,borderRadius:"50%",
                      background: sikayet.trim()
                        ? "radial-gradient(circle at 35% 35%, rgba(200,168,240,0.75) 0%, rgba(150,104,200,0.85) 60%, rgba(90,50,130,0.92) 100%)"
                        : "rgba(255,255,255,0.05)",
                      border: sikayet.trim()
                        ? "1px solid rgba(220,200,255,0.6)"
                        : "1px solid rgba(255,255,255,0.12)",
                      cursor: sikayet.trim() ? "pointer" : "default",
                      color: sikayet.trim() ? "rgba(245,235,255,0.98)" : "#777777",
                      fontSize:15,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      transition:"all 0.3s",
                      boxShadow: sikayet.trim()
                        ? "0 0 18px rgba(184,148,224,0.6), inset 0 0 10px rgba(255,255,255,0.2)"
                        : "none",
                      animation: sikayet.trim() ? "askPulse 1.8s ease-in-out infinite" : "none",
                    }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="1.5" y="1.5" width="13" height="13" rx="1.8" transform="rotate(45 8 8)"
                        stroke={sikayet.trim()?"rgba(255,255,255,0.95)":"rgba(100,90,140,0.4)"} strokeWidth="1.2"/>
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
                    <span style={{ fontSize:13,letterSpacing:2 }}>{t("mirror_what_to_ask")}</span>
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
                      {(_locSampleQ(lang, [
                        { cat:t("ask_cat_body"), sorular:[
                          "Kronik yorgunluk neden hep benimle?",
                          "Sindirim sorunum var, ruhsal nedeni nedir?",
                          "Baş ağrım sürekli geliyor, çakra bağlantısı var mı?",
                          "Uykusuzluk çekiyorum, enerjetik sebebi ne?",
                        ]},
                        { cat:t("ask_cat_emotions"), sorular:[
                          "Bu hafta neden bu kadar dengesiz hissediyorum?",
                          "Sürekli endişeliyim, hangi çakram kapalı?",
                          "Öfkemi nasıl dönüştürebilirim?",
                          "Yalnızlık hissi içimde büyüyor, ne yapmalıyım?",
                        ]},
                        { cat:t("ask_cat_chakra"), sorular:[
                          "Hangi çakramın enerjiye ihtiyacı var?",
                          "Cinsel enerjimi yaratıma nasıl dönüştürürüm?",
                          "Aura temizliği için ne önerirsin?",
                          "Kök çakramı nasıl güçlendirebilirim?",
                        ]},
                        { cat:t("ask_cat_spiritual"), sorular:[
                          "Hayatımda neden aynı döngüler tekrar ediyor?",
                          "Misyonum nedir, nasıl anlayabilirim?",
                          "İçsel sesimi nasıl daha net duyabilirim?",
                          "Karanlık gecelerde kendimi nasıl tutabilirim?",
                        ]},
                        { cat:t("ask_cat_transitions"), sorular:[
                          "Taşınma dönemindeyim, sırt ağrım başladı — bağlantısı var mı?",
                          "İş değiştiriyorum ve içimde büyük bir kaygı var, nedeni ne olabilir?",
                          "Ayrılık sürecindeyim, bedenimde ağırlık hissediyorum.",
                          "Yeni bir başlangıç önümde, ama adım atmak zor geliyor.",
                        ]},
                      ], [
                        { cat:t("ask_cat_body"), sorular:[
                          "Why is chronic fatigue always with me?",
                          "I have digestive issues — what's the spiritual cause?",
                          "Constant headaches — is there a chakra link?",
                          "I can't sleep — what's the energetic reason?",
                        ]},
                        { cat:t("ask_cat_emotions"), sorular:[
                          "Why do I feel so unbalanced this week?",
                          "I'm constantly anxious — which chakra is blocked?",
                          "How can I transform my anger?",
                          "Loneliness is growing inside me — what should I do?",
                        ]},
                        { cat:t("ask_cat_chakra"), sorular:[
                          "Which of my chakras needs energy right now?",
                          "How do I channel sexual energy into creativity?",
                          "What do you recommend for aura cleansing?",
                          "How can I strengthen my root chakra?",
                        ]},
                        { cat:t("ask_cat_spiritual"), sorular:[
                          "Why do the same cycles keep repeating in my life?",
                          "What is my mission and how can I understand it?",
                          "How can I hear my inner voice more clearly?",
                          "How do I hold myself together in dark nights?",
                        ]},
                        { cat:t("ask_cat_transitions"), sorular:[
                          "I'm moving homes and my back pain started — is there a connection?",
                          "I'm changing jobs and feel deep anxiety — what might be the cause?",
                          "I'm going through a separation and feel heaviness in my body.",
                          "A new beginning is ahead but taking the first step feels heavy.",
                        ]},
                      ])).map(({cat,sorular})=>(
                        <div key={cat} style={{ marginBottom:14 }}>
                          <div style={{ fontSize:14,letterSpacing:2.5,color:"rgba(255,255,255,0.6)",marginBottom:8,fontFamily:"'Jost',sans-serif" }}>{cat.toLocaleUpperCase(lang)}</div>
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

                  {/* GÖREV İSTE — "Ne sorabilirim?"in ALTINA alındı (kullanıcı
                      isteği). Önce arama kutusunun üstündeydi; soru sorma akışı
                      bölünüyordu. Artık ayna önce soruyu, sonra görevi sunuyor. */}
                  {/* ── GÖREV İSTE ─────────────────────────────────────────────
                      İlahi kanaldan tek bir deneyim/görev. İlk görev serbest;
                      sonrakiler için TÜNEL AÇIK olmalı (günün 7 adımı bitmiş,
                      yer-gök ışığı başlamış). Günde bir görev — değeri korunsun. */}
                  {/* Panel artık KAPALI başlıyor ve tıklanınca açılıyor
                      (kullanıcı: "her seferinde buton açık olmasın").
                      Üstünde marginTop:12 var — "Ne sorabilirim?" butonuna
                      bitişik duruyordu. Gökyüzü/haftalık rapor ile aynı desen. */}
                  <div style={{ marginTop:12,marginBottom:20,position:"relative" }}>
                    <button onClick={()=>setShowGorev(v=>!v)}
                      style={{
                        width:"100%",
                        background:"rgba(160,112,208,0.06)",
                        border:"1px solid rgba(160,112,208,0.25)",
                        borderRadius:14,padding:"12px 18px",
                        color:"#a070d0",cursor:"pointer",
                        display:"flex",alignItems:"center",justifyContent:"space-between",
                        fontFamily:"'Jost',sans-serif",fontWeight:300,
                        transition:"all 0.2s",
                      }}
                      onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(160,112,208,0.5)"; e.currentTarget.style.color="#c8a8f0"; }}
                      onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(160,112,208,0.25)"; e.currentTarget.style.color="#a070d0"; }}>
                      <span style={{ fontSize:13,letterSpacing:2 }}>✧ {pickLang(GOREV_TXT.label, lang)}</span>
                      <span style={{ fontSize:14,transition:"transform 0.25s",display:"inline-block",transform:showGorev?"rotate(180deg)":"rotate(0deg)" }}>⌄</span>
                    </button>

                    {/* overflow:hidden + minWidth:0 — kullanıcı: "yazılar hala taşıyor".
                        pre-wrap yalnızca BOŞLUKLARDA satır kırar; AI'ın ürettiği
                        BOŞLUKSUZ uzun bir dizi (ör. daha önce görülen "tutututu…"
                        tekrar bozukluğu, ya da normal metinde tireleme bekleyen
                        uzun birleşik kelime) hiç kırılmadan kapsayıcıyı yatay
                        taşırıyordu. Bu, temizleGorev() reddetse bile CSS
                        seviyesinde bağımsız bir güvenlik katmanı. */}
                    {showGorev && (
                    <div style={{ marginTop:8,padding:"14px 16px",background:"rgba(160,112,208,0.06)",border:"1px solid rgba(160,112,208,0.22)",borderRadius:16,overflow:"hidden",minWidth:0 }}>
                    {gorevLoading ? (
                      <div style={{ textAlign:"center",padding:"10px 0" }}>
                        <div style={{ fontSize:26,marginBottom:8,animation:"slowPulse 1.8s ease-in-out infinite" }}>✧</div>
                        <div style={{ fontSize:13,color:"#c8a8f0",letterSpacing:1.5,fontFamily:"'Jost',sans-serif",animation:"pulse 1.6s ease-in-out infinite" }}>
                          {pickLang(GOREV_TXT.connecting, lang)}
                        </div>
                      </div>
                    ) : gorevBugunAlindi && gorev?.metin ? (
                      <div>
                        <div style={{ display:"flex",alignItems:"center",justifyContent:"flex-end",marginBottom:8 }}>
                          {/* "✧ GÖREV" etiketi panel BAŞLIĞINDA zaten var —
                              kartın içinde tekrar yazmaya gerek yok (kullanıcı:
                              "iki kere görev yazmasına gerek yok"). Sayaç kaldı. */}
                          <span style={{ fontSize:11,letterSpacing:1,color:"#7a6a95",fontFamily:"'Jost',sans-serif" }}>{gorev.n} {pickLang(GOREV_TXT.count, lang)}</span>
                        </div>
                        <div style={{ fontSize:13.5,color:"#d8cce8",lineHeight:1.9,whiteSpace:"pre-wrap",overflowWrap:"anywhere",wordBreak:"break-word",textAlign:"left",fontFamily:"'Inter',sans-serif" }}>{gorev.metin}</div>
                        {/* Bugünün görevi alınmış olsa BİLE kapı yeni göreve izin
                            veriyorsa (ilk görev tünel kapalıyken alındı, sonra
                            kullanıcı 7 adımı tamamladı) butonu göster. Aksi halde
                            neden kapalı olduğunu anlatan metni yaz. */}
                        {gorevIstenebilir ? (
                          <button onClick={gorevIste}
                            style={{ display:"block",margin:"12px auto 0",background:"linear-gradient(135deg,rgba(160,112,208,0.30),rgba(160,112,208,0.16))",border:"1px solid rgba(160,112,208,0.5)",borderRadius:24,color:"#d8bcff",cursor:"pointer",fontSize:12.5,letterSpacing:2,padding:"9px 22px",fontFamily:"'Jost',sans-serif",fontWeight:300 }}>
                            ✧ {pickLang(GOREV_TXT.btn, lang)}
                          </button>
                        ) : (
                          <div style={{ fontSize:11.5,color:"#7a6a95",marginTop:10,lineHeight:1.6 }}>
                            {pickLang(gorevTunelBugunKullanildi ? GOREV_TXT.today : GOREV_TXT.locked, lang)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ textAlign:"center" }}>
                        <button onClick={gorevIste} disabled={!gorevIstenebilir}
                          style={{ background: gorevIstenebilir ? "linear-gradient(135deg,rgba(160,112,208,0.30),rgba(160,112,208,0.16))" : "rgba(255,255,255,0.05)",
                            border:`1px solid ${gorevIstenebilir ? "rgba(160,112,208,0.5)" : "rgba(255,255,255,0.12)"}`,
                            borderRadius:24,color: gorevIstenebilir ? "#d8bcff" : "#6a6a7a",
                            cursor: gorevIstenebilir ? "pointer" : "not-allowed",
                            fontSize:13,letterSpacing:2.5,padding:"10px 26px",fontFamily:"'Jost',sans-serif",fontWeight:300 }}>
                          ✧ {pickLang(GOREV_TXT.btn, lang)}
                        </button>
                        {!gorevIstenebilir && (
                          <div style={{ fontSize:11.5,color:"#7a6a95",marginTop:10,lineHeight:1.65 }}>
                            {pickLang(gorevBugunAlindi ? GOREV_TXT.today : GOREV_TXT.locked, lang)}
                          </div>
                        )}
                        {gorevSayisi > 0 && (
                          <div style={{ fontSize:11,color:"#5f5578",marginTop:8,letterSpacing:1,fontFamily:"'Jost',sans-serif" }}>
                            {gorevSayisi} {pickLang(GOREV_TXT.count, lang)}
                          </div>
                        )}
                      </div>
                    )}
                    </div>
                    )}
                  </div>
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
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:24 }}>
            {[
              {label:t("stat_chakra"),value:chakra.name,color:chakra.pastel},
              {label:t("stat_breath"),value:`${breathCount}`,color:"#82d9a3"},
              {label:t("stat_word"),value:selectedWords[0]||"—",color:"#f0c27f"},
              {label:t("stat_mindful"),value:`${completedStepCount}`,color:"#85c1e9"},
            ].map((s,i)=>(
              <div key={i} style={{ background:"rgba(255,255,255,0.022)",border:"1px solid rgba(255,255,255,0.055)",borderRadius:13,padding:"13px 15px" }}>
                <div style={{ fontSize:14,letterSpacing:2.5,color:"#666666",marginBottom:6 }}>{s.label.toLocaleUpperCase(lang)}</div>
                <div style={{ fontSize:15,color:s.color,fontWeight:300 }}>{s.value}</div>
              </div>
            ))}
          </div>
          {/* GÖKYÜZÜ RAPORU — İçsel Ayna'dan BURAYA taşındı (kullanıcı:
              "gökyüzü raporunu harita kısmında haftalık raporun üstüne koy").
              Kolektif gökyüzü ile kişisel haftalık rapor yan yana daha anlamlı;
              Ayna ekranı da sadeleşiyor. Panel açılınca fetchKozmik() çağrılır,
              veri 6 saat CDN'de önbelleklenir. */}
          {/* Haftanın Kozmik Enerji Durumu */}
          {/* Boşluk dengesi (kullanıcı: "altındakiyle bitişik, eşit boşluklar
              olsun"): üstünde 42px (grid 32 + marginTop 10), altında 0 vardı.
              Artık haritanın bölüm ritmi olan 24px hem üstte hem altta. */}
          <div style={{ marginBottom:24,position:"relative" }}>
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
              <span style={{ fontSize:13,letterSpacing:2 }}>{t("mirror_cosmic_week")}</span>
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
                {(() => {
                  const moon = moonPhase();
                  return (
                  <>
                    {/* AY EVRESİ — saf matematik, NOAA olmadan da görünür */}
                    <div style={{ marginBottom:14,paddingBottom:12,borderBottom:"1px solid rgba(184,164,216,0.15)",display:"flex",alignItems:"center",gap:14 }}>
                      <div style={{ fontSize:38,lineHeight:1,filter:"drop-shadow(0 0 8px rgba(220,210,255,0.35))" }}>{moon.emoji}</div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:11,letterSpacing:3,color:"#888",textTransform:"uppercase",marginBottom:4 }}>{t("mirror_moon_phase")}</div>
                        <div style={{ fontSize:15,color:"#d0c0f0",fontFamily:"'Jost',sans-serif",letterSpacing:1 }}>{pickLang(moon, lang)} · {moon.illumination}%</div>
                        <div style={{ fontSize:11,color:"#888",marginTop:3 }}>
                          {(() => {
                            const fullLabel = moon.daysToFull < 0.5 ? t("mirror_moon_today") : moon.daysToFull < 1.5 ? t("mirror_moon_tomorrow") : t("mirror_moon_in_days").replace("{n}", String(Math.round(moon.daysToFull)));
                            const newLabel = `${Math.round(moon.daysToNew)} ${t("mirror_moon_days")}`;
                            return `${t("mirror_moon_full_label")}: ${fullLabel} · ${t("mirror_moon_new_label")}: ${newLabel}`;
                          })()}
                        </div>
                      </div>
                    </div>
                  </>
                  );
                })()}
                {kozmikLoading && (
                  <div style={{ textAlign:"center",color:"#888",fontSize:12,padding:"10px 0" }}>
                    {t("mirror_noaa_loading")}
                  </div>
                )}
                {!kozmikLoading && !kozmikData && (
                  <div style={{ textAlign:"center",color:"#888",fontSize:12,padding:"10px 0",lineHeight:1.6 }}>
                    {t("mirror_noaa_unavail")}
                  </div>
                )}
                {!kozmikLoading && kozmikData && (() => {
                  const moon = kozmikData.moon;
                  const f = kozmikData.solar_flares_24h;
                  const w = kozmikData.solar_wind;
                  return (
                  <>
                    {/* Ay evresi — görsel başlık */}
                    <div style={{ textAlign:"center",marginBottom:18,paddingBottom:16,borderBottom:"1px solid rgba(184,164,216,0.15)" }}>
                      <div style={{ fontSize:46,marginBottom:6,lineHeight:1 }}>{moon?.emoji || "🌌"}</div>
                      {moon && (
                        <div style={{ fontSize:13,letterSpacing:2,color:"#a888d0",fontFamily:"'Jost',sans-serif" }}>
                          {pickLang(moon.label, lang)} · %{moon.illumination}
                        </div>
                      )}
                    </div>

                    {/* KOLEKTİF GEÇİŞ NOTU — raporun ALT BAŞLIĞI (kullanıcı isteği:
                        "hangi geçişte olduğumuzu yaz ... şu an retrodayız gibi").
                        Kişiye özel DEĞİL, herkes için aynı gökyüzü. Sunucuda
                        gerçek efemerisle hesaplanır (retro gezegenler + en dar
                        orb'lu açı); veri yoksa satır hiç çıkmaz. */}
                    {kozmikData.transit && pickLang(kozmikData.transit, lang) && (
                      <div style={{ fontSize:12.5,lineHeight:1.85,color:"#a894c8",marginBottom:14,paddingBottom:12,borderBottom:"1px solid rgba(184,164,216,0.12)",fontStyle:"italic" }}>
                        ✦ {pickLang(kozmikData.transit, lang)}
                      </div>
                    )}

                    {/* ÖZGÜN AI GÖKYÜZÜ RAPORU (yoksa template fallback) */}
                    {(kozmikData.aiReport || kozmikData.report) && (
                      <div style={{ fontSize:15,lineHeight:2.1,color:"#d8cce8",marginBottom:12 }}>
                        {kozmikData.aiReport || pickLang(kozmikData.report, lang)}
                      </div>
                    )}

                    {/* Gezegen-burç dizilişi kaldırıldı — kullanıcı için anlamı yok,
                        kolektif enerji yorumuna odaklanıldı (sadece NOAA veri satırı kalır). */}

                    {/* Küçük veri satırı — NOAA + hesaplama (meraklı için) */}
                    <div style={{ fontSize:11,color:"#888",lineHeight:1.9,paddingTop:12,borderTop:"1px solid rgba(184,164,216,0.15)",display:"flex",flexWrap:"wrap",gap:"4px 14px" }}>
                      <span>🧲 Kp {kozmikData.past_7_days.current_kp}</span>
                      <span>☀️ {f && f.count>0 ? f.max_class : "—"}</span>
                      {w && w.speed!=null && <span>💨 {w.speed} km/s</span>}
                      {moon && <span>{moon.emoji} {moon.illumination}%</span>}
                      {kozmikData.meteor?.active && <span>☄️ {kozmikData.meteor.name}</span>}
                    </div>
                    <div style={{ fontSize:10,color:"#555",marginTop:8,textAlign:"right" }}>
                      {t("mirror_source_label")}NOAA Space Weather · {t("mirror_moon_calc")}
                    </div>
                  </>
                  );
                })()}
              </div>
            )}
          </div>
          {/* HAFTALIK SAKİN RAPOR — gökyüzü raporu gibi AÇILIR-KAPANIR
              (kullanıcı: "buton olsun, açık olmasın, tıklanınca açılsın").
              Kapalı başlar; harita ekranı açılır açılmaz uzun bir AI metniyle
              karşılamaz, kullanıcı isterse açar. İki rapor da aynı davranışta. */}
          <div style={{ marginBottom:24,position:"relative" }}>
            <button onClick={()=>setShowRapor(v=>!v)}
              style={{
                width:"100%",
                background:"rgba(154,106,176,0.06)",
                border:"1px solid rgba(154,106,176,0.25)",
                borderRadius:14,padding:"12px 18px",
                color:"#9a6ab0",cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"space-between",
                fontFamily:"'Jost',sans-serif",fontWeight:300,
                transition:"all 0.2s",
              }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(154,106,176,0.5)"; e.currentTarget.style.color="#c08ad8"; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(154,106,176,0.25)"; e.currentTarget.style.color="#9a6ab0"; }}>
              <span style={{ fontSize:13,letterSpacing:2 }}>{t("ai_report_label").toLocaleUpperCase(lang)}</span>
              <span style={{ fontSize:14,transition:"transform 0.25s",display:"inline-block",transform:showRapor?"rotate(180deg)":"rotate(0deg)" }}>⌄</span>
            </button>

            {showRapor && (
            <div style={{ marginTop:8,background:"linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.07))",border:"1px solid rgba(255,255,255,0.22)",borderRadius:17,padding:"18px 20px" }}>
            {!isPremium && !aiRapor && !aiLoading ? (
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:23,marginBottom:10 }}>✨</div>
                <div style={{ fontSize:14,color:"#c8a0e0",fontWeight:300,marginBottom:10,letterSpacing:0.5 }}>
                  {t("map_weekly_ready")}
                </div>
                <div style={{ fontSize:13.5,color:"#a89cb8",lineHeight:1.85,marginBottom:8,textAlign:"left" }}>
                  {t("map_weekly_desc")}
                </div>
                <div style={{ fontSize:12.5,color:"#8878a8",lineHeight:1.75,marginBottom:16,padding:"10px 12px",background:"rgba(184,164,216,0.06)",borderRadius:10,border:"1px solid rgba(184,164,216,0.15)" }}>
                  {t("map_weekly_themes")}
                </div>
                <div style={{ fontSize:11.5,color:"#7868a0",marginBottom:14,fontStyle:"italic",letterSpacing:0.3 }}>
                  {t("map_weekly_premium_note")}
                </div>
                <button onClick={() => setScreen("fiyat")}
                  style={{ display:"inline-block",padding:"11px 28px",background:"linear-gradient(135deg,rgba(184,164,216,0.85),rgba(122,80,150,0.7))",border:"1px solid rgba(220,200,255,0.5)",borderRadius:22,color:"#fff",fontSize:13,letterSpacing:2,cursor:"pointer",fontFamily:"'Jost',sans-serif",textTransform:"uppercase",boxShadow:"0 4px 18px rgba(122,80,150,0.3)" }}>
                  {t("premium_unlock_card")}
                </button>
              </div>
            ) : !aiRapor && !aiLoading ? (
              <div style={{ textAlign:"center" }}>
                {raporMesaj ? (
                  <div style={{ fontSize:13.5,color:"#c8b8e0",lineHeight:1.95,padding:"14px 16px",background:"rgba(184,164,216,0.07)",border:"1px solid rgba(184,164,216,0.18)",borderRadius:14,letterSpacing:0.3 }}>
                    {raporMesaj}
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize:14,color:"#888888",marginBottom:14,lineHeight:1.7 }}>{t("report_invite").split("\n").map((l,i)=><span key={i}>{l}{i===0&&<br/>}</span>)}</div>
                    <button className="sakin-btn-primary"
                      style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.7),rgba(255,255,255,0.5))",borderColor:"rgba(255,255,255,0.4)",fontSize:14 }}
                      onClick={()=>requireAiConsent(generateRapor)}>{t("btn_gen_report")}</button>
                  </>
                )}
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
                  {(navigator.share || Capacitor.getPlatform() === "android") && (
                    <button onClick={async ()=>{ try {
                        // Android WebView'da navigator.share yok → Capacitor Share.
                        if (Capacitor.getPlatform() === "android") await Share.share({ title:t("share_title"), text:aiRapor });
                        else if (navigator.share) await navigator.share({ title:t("share_title"), text:aiRapor });
                      } catch(_){} }}
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
          </div>
          {/* ── 12. Ev Kartı ── */}
          {ev12Burcu && ev12Gezegen && (EV12_BURCU_ACIKLAMA[lang]?.[ev12Burcu] || EV12_BURCU_ACIKLAMA.tr[ev12Burcu]) ? (
          <div style={{ marginBottom:20,position:"relative" }}>
            <button onClick={()=>setShow12Ev(v=>!v)}
              style={{
                width:"100%",background:"rgba(144,112,192,0.08)",
                border:"1px solid rgba(144,112,192,0.28)",
                borderRadius:14,padding:"12px 18px",cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"space-between",
                fontFamily:"'Jost',sans-serif",fontWeight:300,color:"#a890e0",transition:"all 0.2s",
              }}>
              <span style={{ fontSize:13,letterSpacing:2 }}>{t("map_12h_title")}</span>
              <span style={{ fontSize:14,transition:"transform 0.25s",display:"inline-block",transform:show12Ev?"rotate(180deg)":"rotate(0deg)" }}>⌄</span>
            </button>
            {show12Ev && (
            <div style={{ marginTop:8 }}>
            <div style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0.12))",border:"1px solid rgba(255,255,255,0.35)",borderRadius:17,padding:"20px 20px",marginBottom:24,position:"relative",overflow:"hidden" }}>
              <div style={{ position:"absolute",top:-20,right:-20,width:100,height:100,borderRadius:"50%",background:"radial-gradient(circle,rgba(120,80,220,0.15),transparent)",pointerEvents:"none" }} />
              <div style={{ fontSize:13,letterSpacing:3.5,color:"#9070c0",marginBottom:6,textAlign:"center" }}>
                {t("map_12h_title")}
              </div>
              <div style={{ fontFamily:"'Inter',sans-serif",fontSize:15,fontWeight:300,textAlign:"center",color:"#d8c0f0",marginBottom:14,lineHeight:1.6 }}>
                {t("map_12h_desc")}
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:14 }}>
                <div style={{ width:44,height:44,borderRadius:"50%",flexShrink:0,background:"radial-gradient(circle,rgba(120,80,220,0.5),rgba(60,30,120,0.2))",border:"1px solid rgba(255,255,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>
                  ♆
                </div>
                <div>
                  <div style={{ fontSize:13,letterSpacing:0.5,color:"#c8b0e8",marginBottom:2 }}>{zodiacDisplay(ev12Burcu, lang)} {t("map_sign_suf")}</div>
                  <div style={{ fontSize:13,color:"#7060a0",letterSpacing:1 }}>{t("map_ruler")} {planetDisplay(ev12Gezegen, lang)}</div>
                </div>
              </div>
              <div style={{ fontSize:13,letterSpacing:2,color:"#8060b0",marginBottom:8,fontStyle:"italic" }}>
                {(EV12_BURCU_ACIKLAMA[lang]?.[ev12Burcu] || EV12_BURCU_ACIKLAMA.tr[ev12Burcu]).tema}
              </div>
              <div style={{ fontSize:14,color:"#b0a0d0",lineHeight:1.85 }}>
                {(EV12_BURCU_ACIKLAMA[lang]?.[ev12Burcu] || EV12_BURCU_ACIKLAMA.tr[ev12Burcu]).yorum}
              </div>
              <div style={{ marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.15)" }}>
                <div style={{ fontSize:13,letterSpacing:2,color:"#7060a0",marginBottom:4 }}>{t("map_hidden_power")}</div>
                <div style={{ fontSize:14,color:"#c0b0e0",fontStyle:"italic" }}>{GEZEGEN_12EV_GUCLERI[lang]?.[ev12Gezegen] || GEZEGEN_12EV_GUCLERI.tr[ev12Gezegen]}</div>
              </div>
            </div>
          ) : (birthDate && !birthTime) || !birthDate ? (
            <div style={{ background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:17,padding:"14px 18px",marginBottom:24,textAlign:"center" }}>
              <div style={{ fontSize:13,color:"#7060a0",lineHeight:1.7,marginBottom:10 }}>
                {birthDate ? t("map_12h_need_time") : t("map_12h_need_birth")}
              </div>
              <button onClick={()=>{ setGirisPhase("birth"); setScreen("giris"); }}
                style={{ padding:"8px 20px",borderRadius:20,border:"1px solid rgba(112,96,160,0.4)",background:"rgba(112,96,160,0.15)",color:"#b8a4d8",fontSize:13,letterSpacing:1.5,cursor:"pointer",fontFamily:"'Jost',sans-serif" }}>
                {t("add_birth_info")}
              </button>
            </div>
            </div>
            )}
          </div>
          ) : null}
          {/* ── Draconic Harita Kartı (ruh kökeni) ── */}
          {birthDate && draconicGunes ? (
          <div style={{ marginBottom:20,position:"relative" }}>
            <button onClick={()=>setShowDraconic(v=>!v)}
              style={{
                width:"100%",background:"rgba(140,120,220,0.08)",
                border:"1px solid rgba(140,120,220,0.28)",
                borderRadius:14,padding:"12px 18px",cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"space-between",
                fontFamily:"'Jost',sans-serif",fontWeight:300,color:"#a890e0",transition:"all 0.2s",
              }}>
              <span style={{ fontSize:13,letterSpacing:2 }}>{t("map_draconic_title")}</span>
              <span style={{ fontSize:14,transition:"transform 0.25s",display:"inline-block",transform:showDraconic?"rotate(180deg)":"rotate(0deg)" }}>⌄</span>
            </button>
            {showDraconic && (
            <div style={{ marginTop:8 }}>
            <div style={{ background:"linear-gradient(135deg,rgba(40,20,80,0.45),rgba(20,40,80,0.30))",border:"1px solid rgba(140,120,220,0.35)",borderRadius:17,padding:"20px 20px",marginBottom:24,position:"relative",overflow:"hidden" }}>
              <div style={{ position:"absolute",top:-30,left:-30,width:140,height:140,borderRadius:"50%",background:"radial-gradient(circle,rgba(100,140,220,0.18),transparent)",pointerEvents:"none" }} />
              <div style={{ position:"absolute",bottom:-30,right:-30,width:140,height:140,borderRadius:"50%",background:"radial-gradient(circle,rgba(180,120,220,0.14),transparent)",pointerEvents:"none" }} />
              <div style={{ fontSize:13,letterSpacing:3.5,color:"#a890e0",marginBottom:6,textAlign:"center" }}>
                {t("map_draconic_title")}
              </div>
              <div style={{ fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:300,textAlign:"center",color:"#b8a8d8",marginBottom:16,lineHeight:1.65,fontStyle:"italic" }}>
                {t("map_draconic_desc")}
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:14,padding:"10px 12px",background:"rgba(255,255,255,0.04)",borderRadius:12,border:"1px solid rgba(140,120,220,0.18)" }}>
                <div style={{ width:44,height:44,borderRadius:"50%",flexShrink:0,background:"radial-gradient(circle,rgba(180,140,240,0.55),rgba(80,40,140,0.25))",border:"1px solid rgba(220,200,255,0.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>
                  ☉
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13,letterSpacing:0.5,color:"#d0c0f0",marginBottom:2 }}>
                    {t("map_draconic_sun")} <strong style={{ color:"#e8d8ff" }}>{zodiacDisplay(draconicGunes, lang)}</strong>
                  </div>
                  <div style={{ fontSize:12,color:"#8878b8",letterSpacing:0.5 }}>
                    {t("map_north_node").replace("{sign}", zodiacDisplay(kuzeyDugum, lang) || kuzeyDugum || "")}
                  </div>
                </div>
              </div>
              <div style={{ fontSize:14,color:"#c8b8e8",lineHeight:1.85,marginBottom:14 }}>
                {DRACONIC_SUN_KISA[lang]?.[draconicGunes] || DRACONIC_SUN_KISA.tr[draconicGunes]}
              </div>
              {isPremium ? (
                <div style={{ paddingTop:14,borderTop:"1px solid rgba(140,120,220,0.25)" }}>
                  <div style={{ fontSize:11,letterSpacing:2.5,color:"#9080c8",marginBottom:8 }}>
                    {t("map_detailed_soul")}
                  </div>
                  <div style={{ fontSize:13.5,color:"#b8a8d8",lineHeight:1.9 }}>
                    {DRACONIC_SUN_DETAY[lang]?.[draconicGunes] || DRACONIC_SUN_DETAY.tr[draconicGunes]}
                  </div>
                </div>
              ) : (
                <div style={{ paddingTop:14,borderTop:"1px solid rgba(140,120,220,0.25)",textAlign:"center" }}>
                  <div style={{ fontSize:12,color:"#8878b8",lineHeight:1.7,marginBottom:10,fontStyle:"italic" }}>
                    {t("map_premium_draconic_desc")}
                  </div>
                  <button onClick={()=>setScreen("fiyat")}
                    style={{ padding:"9px 22px",borderRadius:22,border:"1px solid rgba(184,164,216,0.4)",background:"linear-gradient(135deg,rgba(140,120,220,0.25),rgba(100,80,180,0.15))",color:"#d8c8f8",fontSize:13,letterSpacing:1.5,cursor:"pointer",fontFamily:"'Jost',sans-serif" }}>
                    {t("map_detailed_premium")}
                  </button>
                </div>
              )}
              <div style={{ marginTop:14,paddingTop:10,borderTop:"1px solid rgba(140,120,220,0.15)",fontSize:10,letterSpacing:1.5,color:"#605080",textAlign:"center",fontStyle:"italic" }}>
                {t("map_draconic_credit")}
              </div>
            </div>
            </div>
            )}
          </div>
          ) : null}
          {birthDate && (
            <div style={{ textAlign:"center",marginBottom:16 }}>
              <button onClick={()=>{ setGirisPhase("birth"); setScreen("giris"); }}
                style={{ background:"none",border:"none",color:"#666",fontSize:12,letterSpacing:1.5,cursor:"pointer",fontFamily:"'Jost',sans-serif",textDecoration:"underline",textUnderlineOffset:3 }}>
                {t("birth_change_lower")}
              </button>
            </div>
          )}
          <div style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.09),rgba(255,255,255,0.05))",border:"1px solid rgba(255,255,255,0.16)",borderRadius:17,padding:"40px 20px 16px",marginBottom:24,textAlign:"center",position:"relative",opacity:0.65 }}>
            {/* COMING SOON badge — üstte ortalı, kendi satırında; uzun dillerde (EN) label'a binmez */}
            <div style={{ position:"absolute",top:10,left:"50%",transform:"translateX(-50%)",whiteSpace:"nowrap",fontSize:9,letterSpacing:1.5,padding:"3px 10px",borderRadius:10,background:"rgba(184,164,216,0.15)",border:"1px solid rgba(184,164,216,0.35)",color:"#c8b0e8" }}>{t("map_coming_soon")}</div>
            <div style={{ fontSize:13,letterSpacing:3.5,color:"#888888",marginBottom:7 }}>{t("orchestra_label")}</div>
            <div style={{ marginBottom:5 }}>
              {[...Array(7)].map((_,i)=>(
                <span key={i} style={{ display:"inline-block",width:8,height:8,borderRadius:"50%",background:`radial-gradient(circle,${CHAKRAS_7[i].pastel},transparent)`,margin:"0 3px",animation:`pulse ${1+i*0.2}s ease-in-out infinite`,animationDelay:`${i*0.14}s` }} />
              ))}
            </div>
            <div style={{ fontSize:14,color:"#888888" }}>{t("orchestra_text", "312")}</div>
          </div>
          <button onClick={()=>{ idCardFromAilesi.current = false; setShowIdCard(true); }}
            style={{ width:"100%",marginBottom:12,padding:"13px 16px",borderRadius:24,border:"1px solid rgba(184,164,216,0.4)",background:"linear-gradient(135deg,rgba(184,164,216,0.18),rgba(122,80,150,0.10))",color:"#d8c8f0",fontSize:13,letterSpacing:2.5,cursor:"pointer",fontFamily:"'Jost',sans-serif",textTransform:"uppercase",boxShadow:"0 0 18px rgba(184,164,216,0.12)" }}>
            {t("map_create_galactic_id")}
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
        const displayName = (idCardName || t("gid_default_name")).slice(0, 24);
        const burc = zodiacDisplay(astro?.burc, lang) || "—";
        const yasamYolu = astro?.yasam || "—";
        const kisiselYil = astro?.kisiselYil || "—";
        const needCity = !!(birthDate && birthTime && !yukselen);
        const yuk = zodiacDisplay(yukselen, lang) || (needCity ? t("gid_need_city") : "—");
        const ev12 = zodiacDisplay(ev12Burcu, lang) || (needCity ? t("gid_need_city") : "—");
        const dra = zodiacDisplay(draconicGunes, lang) || "—";
        const days = streakData?.current ?? 0;
        const best = streakData?.best ?? 0;

        const downloadCard = async () => {
          // SVG-to-Image iOS WKWebView'da text/font'ları render etmiyor — saf canvas 2D ile çiz
          const canvas = document.createElement("canvas");
          canvas.width = 1080; canvas.height = 1920;
          const ctx = canvas.getContext("2d");

          // 1. Arka plan gradient
          const bg = ctx.createLinearGradient(0, 0, 0, 1920);
          bg.addColorStop(0, "#0a0612");
          bg.addColorStop(0.5, "#1a1230");
          bg.addColorStop(1, "#0a0612");
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, 1080, 1920);

          // 2. Yıldızlar
          const stars = [[60,80,3],[260,140,2],[140,220,1.5],[500,180,2.5],[820,140,3],[940,440,2],[180,500,1.5],[760,640,2],[120,760,1.5],[880,820,2.5],[420,900,1.5],[640,990,1.8],[280,1080,1.5],[820,1140,2],[160,1240,1.5],[560,1320,2],[940,1430,1.5],[120,1520,2],[700,1610,1.8],[400,1730,1.5]];
          ctx.fillStyle = "rgba(255,255,255,0.8)";
          stars.forEach(([x,y,r]) => {
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
          });

          // 3. Header
          ctx.fillStyle = "#9080c0";
          ctx.font = "300 30px -apple-system, 'Jost', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(t("gid_header"), 540, 180);

          // 4. Fotoğraf (varsa) veya placeholder
          if (idCardPhoto) {
            await new Promise((resolve) => {
              const img = new Image();
              img.onload = () => {
                ctx.save();
                ctx.beginPath();
                ctx.arc(540, 380, 160, 0, Math.PI * 2);
                ctx.clip();
                const r = Math.max(320 / img.width, 320 / img.height);
                const w = img.width * r, h = img.height * r;
                ctx.drawImage(img, 540 - w/2, 380 - h/2, w, h);
                ctx.restore();
                resolve();
              };
              img.onerror = resolve;
              img.src = idCardPhoto;
            });
          } else {
            // Placeholder radial gradient
            const rg = ctx.createRadialGradient(540, 380, 0, 540, 380, 160);
            rg.addColorStop(0, "rgba(180,140,240,0.55)");
            rg.addColorStop(1, "rgba(80,40,140,0.25)");
            ctx.fillStyle = rg;
            ctx.beginPath();
            ctx.arc(540, 380, 160, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.font = "120px -apple-system, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("✦", 540, 420);
          }
          // Foto çerçevesi
          ctx.beginPath();
          ctx.arc(540, 380, 160, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(220,200,255,0.5)";
          ctx.lineWidth = 4;
          ctx.stroke();

          // 5. Ad
          ctx.fillStyle = "#fff";
          ctx.font = "300 56px -apple-system, 'Jost', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(displayName.toLocaleUpperCase(lang), 540, 640);

          // 6. Burç · Yaşam Yolu
          ctx.fillStyle = "#a890c8";
          ctx.font = "300 26px -apple-system, 'Jost', sans-serif";
          const subtitle = `${burc !== "—" ? burc.toLocaleUpperCase(lang) : ""}${yasamYolu !== "—" ? ` · ${t("gid_life_path")} ${yasamYolu}` : ""}`;
          if (subtitle.trim()) ctx.fillText(subtitle, 540, 700);

          // 7. Stat boxes (2x3 grid)
          const stats = [
            [t("gid_sun"),          burc,                  "#f0c860", 100, 820],
            [t("gid_asc"),          yuk,                   "#a0d8b4", 560, 820],
            [t("gid_12th"),         ev12,                  "#c8b0e8", 100, 940],
            [t("gid_draconic"),     dra,                   "#d8c8f0", 560, 940],
            [t("gid_life_path_card"), String(yasamYolu),   "#d0c8e8", 100, 1060],
            [t("gid_personal_year_card"), String(kisiselYil), "#d0c8e8", 560, 1060],
          ];
          stats.forEach(([label, val, color, x, y]) => {
            // box
            ctx.fillStyle = "rgba(255,255,255,0.025)";
            roundRect(ctx, x, y, 420, 92, 14);
            ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.06)";
            ctx.lineWidth = 1;
            roundRect(ctx, x, y, 420, 92, 14);
            ctx.stroke();
            // label
            ctx.fillStyle = "#7a7090";
            ctx.font = "300 20px -apple-system, 'Jost', sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(label, x + 22, y + 36);
            // value
            ctx.fillStyle = color;
            ctx.font = "500 32px -apple-system, 'Jost', sans-serif";
            ctx.fillText(val, x + 22, y + 76);
          });

          // 8. Element dağılımı — yüzdeler (galaktik kartta KOMPAKT 2x2 grid; pasta
          // sadece HD embed'inde). Veri: Sakin Tasarım embed'inin yazdığı localStorage.
          // Eski gün-serisi/en-iyi/kart istatistikleri kaldırıldı; yer buraya açıldı.
          let yAfterElements = 1170;
          try {
            let ed = JSON.parse(localStorage.getItem("sakin_element_dist") || "null");
            const edSum = ed ? ((ed.ates||0)+(ed.toprak||0)+(ed.hava||0)+(ed.su||0)) : 0;
            // SADECE Sakin Tasarım'ın tam-harita (11 gezegen ağırlıklı) verisi kullanılır.
            // Host'ta gezegen konumları yok → kaba 4-nokta tahmini YANLIŞ değer üretiyordu
            // (Tasarım'la uyuşmuyordu). Doğru veri yoksa element bölümü gizlenir.
            if (!ed || edSum <= 0.5) ed = null;
            if (ed) {
              const isEn = lang === "en";
              ctx.fillStyle = "#7a7090";
              ctx.font = "300 22px -apple-system, 'Jost', sans-serif";
              ctx.textAlign = "center";
              ctx.fillText(pickLang(ELEM_I18N.title, lang).toLocaleUpperCase(lang), 540, 1250);
              const items = [
                ["ates","#E0683C","△", pickLang(ELEM_I18N.ates, lang)],
                ["toprak","#6FA86F","⊕", pickLang(ELEM_I18N.toprak, lang)],
                ["hava","#D8C25C","○", pickLang(ELEM_I18N.hava, lang)],
                ["su","#5C9AD8","▽", pickLang(ELEM_I18N.su, lang)],
              ];
              items.forEach(([k,color,glyph,name], i) => {
                const col = i % 2, row = Math.floor(i / 2);
                const x = 100 + col * 460, y = 1290 + row * 100;
                ctx.fillStyle = "rgba(255,255,255,0.025)";
                roundRect(ctx, x, y, 420, 84, 14); ctx.fill();
                ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1;
                roundRect(ctx, x, y, 420, 84, 14); ctx.stroke();
                ctx.fillStyle = color; ctx.textAlign = "left";
                ctx.font = "400 30px -apple-system, 'Jost', sans-serif";
                ctx.fillText(glyph, x + 26, y + 54);
                ctx.fillStyle = "#cfc8e0";
                ctx.font = "300 28px -apple-system, 'Jost', sans-serif";
                ctx.fillText(name, x + 66, y + 53);
                const pct = Math.round((ed[k]||0)*100);
                ctx.fillStyle = color; ctx.textAlign = "right";
                ctx.font = "500 34px -apple-system, 'Jost', sans-serif";
                ctx.fillText(pctFmt(pct, lang), x + 394, y + 54);
              });
              yAfterElements = 1490;
            }
          } catch(_) {}

          // 9. HD bölümü (varsa) — element dağılımının altına
          if (hdProfile && hdProfile.type) {
            const hy = yAfterElements + 20;
            ctx.fillStyle = "rgba(180,160,216,0.08)";
            roundRect(ctx, 100, hy, 880, 100, 14);
            ctx.fill();
            ctx.strokeStyle = "rgba(180,160,216,0.18)";
            ctx.lineWidth = 1;
            roundRect(ctx, 100, hy, 880, 100, 14);
            ctx.stroke();
            ctx.fillStyle = "#9080b8";
            ctx.font = "300 20px -apple-system, 'Jost', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("HUMAN DESIGN", 540, hy + 40);
            ctx.fillStyle = "#d0c8e8";
            ctx.font = "300 30px -apple-system, 'Jost', sans-serif";
            ctx.fillText(hdProfile.type + (hdProfile.profile ? ` · ${hdProfile.profile}` : ""), 540, hy + 80);
          }

          // 9.5. Yaşam Yolu + Kişisel Yıl açıklamaları — önizlemedeki bilgiler artık
          // indirilen fotoğrafta da görünür (kullanıcı isteği). Kalan dikey alana göre
          // satır sayısı uyarlanır; taşarsa son satır kısaltılır.
          {
            const lpDesc = (LIFE_PATH_DESC[lang] || {})[yasamYolu];
            const pyDesc = (PERSONAL_YEAR_DESC[lang] || {})[kisiselYil];
            const blocks = [];
            if (lpDesc) blocks.push([`${t("gid_life_path")} ${yasamYolu}`, lpDesc]);
            if (pyDesc) blocks.push([`${t("gid_personal_year_full")} ${kisiselYil}`, pyDesc]);
            if (blocks.length) {
              let infoY = (hdProfile && hdProfile.type) ? (yAfterElements + 140) : (yAfterElements + 40);
              const linesPer = Math.max(2, Math.min(4, Math.floor(((1850 - infoY) / blocks.length - 34) / 32)));
              const wrapLines = (text, maxW, maxLines) => {
                ctx.font = "300 24px -apple-system, 'Jost', sans-serif";
                const words = String(text).split(/\s+/); const out = []; let cur = "";
                for (const w of words) {
                  const test = cur ? cur + " " + w : w;
                  if (ctx.measureText(test).width > maxW && cur) { out.push(cur); cur = w; } else cur = test;
                }
                if (cur) out.push(cur);
                if (out.length > maxLines) {
                  const kept = out.slice(0, maxLines);
                  let last = kept[maxLines - 1];
                  while (last.length && ctx.measureText(last + "…").width > maxW) last = last.replace(/\s*\S$/, "");
                  kept[maxLines - 1] = last + "…";
                  return kept;
                }
                return out;
              };
              blocks.forEach(([label, desc]) => {
                ctx.textAlign = "left";
                ctx.fillStyle = "#9080b8";
                ctx.font = "600 22px -apple-system, 'Jost', sans-serif";
                ctx.fillText(label, 100, infoY);
                infoY += 34;
                ctx.fillStyle = "#bcb4cf";
                ctx.font = "300 24px -apple-system, 'Jost', sans-serif";
                wrapLines(desc, 880, linesPer).forEach((ln) => { ctx.fillText(ln, 100, infoY); infoY += 32; });
                infoY += 16;
              });
            }
          }

          // 10. Footer
          ctx.fillStyle = "#605080";
          ctx.font = "300 28px -apple-system, 'Jost', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("SAKİN.LIFE", 540, 1880);

          // Export → share sheet (Save to Files, paylaş vs.)
          canvas.toBlob(async (blob) => {
            if (!blob) return;
            // Android WebView'da navigator.share/blob-download çalışmaz → shareImageBlob
            // native Capacitor Share'e düşer. iOS/web davranışı değişmez.
            await shareImageBlob(blob, "sakin-galaktik-kimlik.jpg");
          }, "image/jpeg", 0.92);
        };

        // Rounded rect helper
        function roundRect(ctx, x, y, w, h, r) {
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + w - r, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + r);
          ctx.lineTo(x + w, y + h - r);
          ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
          ctx.lineTo(x + r, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - r);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.closePath();
        }

        const StatRow = ({label, value, color}) => (
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 12px",background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,marginBottom:5 }}>
            <span style={{ fontSize:10,letterSpacing:2,color:"#7a7090",textTransform:"uppercase",fontFamily:"'Jost',sans-serif" }}>{label}</span>
            <span style={{ fontSize:12,color: color||"#d0c8e8",fontWeight:500,letterSpacing:0.5 }}>{value}</span>
          </div>
        );

        return (
          <div onClick={()=>{ if (Date.now() - idCardOpenTs.current < 450) return; closeIdCard(); }} style={{ position:"fixed",inset:0,zIndex:10000,background:"rgba(0,0,0,0.92)",backdropFilter:"blur(20px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"calc(20px + var(--sat)) 16px calc(20px + var(--sab))",overflow:"auto" }}>
            <div onClick={e=>e.stopPropagation()} style={{ maxWidth:380,width:"100%",margin:"auto",position:"relative" }}>
              {/* Card preview */}
              <div style={{ background:"linear-gradient(160deg,#0a0612 0%,#1a1230 50%,#0a0612 100%)",border:"1px solid rgba(184,164,216,0.35)",borderRadius:22,padding:"22px 18px",boxShadow:"0 8px 40px rgba(122,80,150,0.25)",position:"relative",overflow:"hidden" }}>
                {/* Stars */}
                {[[18,26,1],[88,42,0.8],[42,18,0.6],[160,80,0.7],[300,50,0.9],[330,180,0.8],[60,200,0.5],[280,260,0.7],[40,300,0.6]].map(([x,y,o],i)=>(
                  <div key={i} style={{ position:"absolute",left:x,top:y,width:2,height:2,borderRadius:"50%",background:`rgba(255,255,255,${o})`,boxShadow:`0 0 4px rgba(255,255,255,${o*0.5})` }}/>
                ))}
                <div style={{ textAlign:"center",position:"relative" }}>
                  <div style={{ fontSize:9,letterSpacing:4.5,color:"#9080c0",fontFamily:"'Jost',sans-serif",marginBottom:4,textTransform:"uppercase" }}>{t("gid_header_short")}</div>
                  <div style={{ position:"relative",width:88,height:88,margin:"10px auto 12px" }}>
                    {/* Fotoğraf yoksa DAİRENİN TAMAMI tıklanabilir "fotoğraf ekle" hedefi —
                        yıldız (✦) yerine büyük, belirgin bir kamera ikonu + kesikli çerçeve
                        koyup dokunulabilir olduğunu netleştiriyoruz. Fotoğraf varsa dairenin
                        kendisi artık fotoğrafı gösterir, değiştirmek için köşede küçük rozet kalır. */}
                    {idCardPhoto ? (
                      <div style={{ width:88,height:88,borderRadius:"50%",background:`url(${idCardPhoto}) center/cover`,border:"2px solid rgba(220,200,255,0.45)",boxShadow:"0 0 22px rgba(184,164,216,0.35)" }} />
                    ) : (
                      <label
                        aria-label={t("gid_upload_photo")}
                        title={t("gid_upload_photo")}
                        style={{ width:88,height:88,borderRadius:"50%",background:"radial-gradient(circle,rgba(180,140,240,0.55),rgba(80,40,140,0.25))",border:"2px dashed rgba(220,200,255,0.6)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 0 22px rgba(184,164,216,0.35)" }}>
                        <span style={{ fontSize:30,lineHeight:1 }}>📷</span>
                        <input type="file" accept="image/*" style={{ display:"none" }}
                          onChange={e=>{ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>setIdCardPhoto(ev.target.result); r.readAsDataURL(f); }}/>
                      </label>
                    )}
                    {idCardPhoto && (
                      <label
                        aria-label={t("gid_upload_photo")}
                        title={t("gid_upload_photo")}
                        style={{ position:"absolute",bottom:-2,right:-2,width:30,height:30,borderRadius:"50%",background:"rgba(30,20,45,0.95)",border:"1.5px solid rgba(220,200,255,0.5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,0.4)" }}>
                        📷
                        <input type="file" accept="image/*" style={{ display:"none" }}
                          onChange={e=>{ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>setIdCardPhoto(ev.target.result); r.readAsDataURL(f); }}/>
                      </label>
                    )}
                  </div>
                  {!idCardPhoto && (
                    <div style={{ fontSize:9,letterSpacing:1.5,color:"#a890c8",marginTop:-6,marginBottom:6,textTransform:"uppercase" }}>{t("gid_upload_photo")}</div>
                  )}
                  <input type="text" value={idCardName} onChange={e=>setIdCardName(e.target.value)} placeholder={t("gid_your_name_ph")} maxLength={24}
                    style={{ width:180,textAlign:"center",background:"transparent",border:"none",borderBottom:"1px solid rgba(255,255,255,0.15)",color:"#fff",fontSize:18,fontFamily:"'Jost',sans-serif",letterSpacing:2,marginBottom:6,padding:"3px 0",outline:"none" }}/>
                  <div style={{ fontSize:10,letterSpacing:3,color:"#a890c8",marginBottom:14,textTransform:"uppercase" }}>{burc !== "—" ? burc : "—"} · {yasamYolu !== "—" ? `${t("gid_life_path_lower")} ${yasamYolu}` : "—"}</div>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:8 }}>
                  <StatRow label={t("gid_sun_lower")} value={burc} color="#f0c860"/>
                  <StatRow label={t("gid_asc_lower")} value={yuk} color="#a0d8b4"/>
                  <StatRow label={t("gid_12th_lower")} value={ev12} color="#c8b0e8"/>
                  <StatRow label={t("gid_draconic_lower")} value={dra} color="#d8c8f0"/>
                  <StatRow label={t("gid_yaşam_yolu_lower")} value={yasamYolu}/>
                  <StatRow label={t("gid_personal_yr_lower")} value={kisiselYil}/>
                </div>
                {hdProfile && (hdProfile.type || hdProfile.profile) && (
                  <div style={{ padding:"8px 12px",background:"rgba(180,160,216,0.08)",border:"1px solid rgba(180,160,216,0.18)",borderRadius:10,marginBottom:8,textAlign:"center" }}>
                    <div style={{ fontSize:9,letterSpacing:2.5,color:"#9080b8",textTransform:"uppercase",marginBottom:3 }}>Human Design</div>
                    <div style={{ fontSize:12,color:"#d0c8e8",letterSpacing:0.5 }}>{hdProfile.type || ""}{hdProfile.profile ? ` · ${hdProfile.profile}` : ""}</div>
                  </div>
                )}
                {/* Element dağılımı — gün serisi/en-iyi/hayvan-mit yerine (Kozmik Ağırlık).
                    Veri: Sakin Tasarım embed'inin yazdığı localStorage. Yoksa gizle. */}
                {(() => {
                  let ed = null;
                  try { ed = JSON.parse(localStorage.getItem("sakin_element_dist") || "null"); } catch(_) {}
                  const sum = ed ? ((ed.ates||0)+(ed.toprak||0)+(ed.hava||0)+(ed.su||0)) : 0;
                  // SADECE Sakin Tasarım'ın tam-harita verisi (11 gezegen ağırlıklı).
                  // Host kaba 4-nokta tahmini Tasarım'la uyuşmuyordu (yanlış). Doğru veri
                  // yoksa sessizce gizle — Tasarım açılınca same-origin localStorage'a yazılır.
                  if (!ed || sum <= 0.5) return null;
                  const isEn = lang === "en";
                  const items = [
                    ["ates","#E0683C","△", pickLang(ELEM_I18N.ates, lang)],
                    ["toprak","#6FA86F","⊕", pickLang(ELEM_I18N.toprak, lang)],
                    ["hava","#D8C25C","○", pickLang(ELEM_I18N.hava, lang)],
                    ["su","#5C9AD8","▽", pickLang(ELEM_I18N.su, lang)],
                  ];
                  return (
                    <div style={{ padding:"9px 12px",background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,marginBottom:10 }}>
                      <div style={{ fontSize:8,letterSpacing:2.5,color:"#7a7090",textTransform:"uppercase",marginBottom:8,textAlign:"center" }}>{pickLang(ELEM_I18N.title, lang)}</div>
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }}>
                        {items.map(([k,color,glyph,name]) => (
                          <div key={k} style={{ display:"flex",alignItems:"center",gap:7 }}>
                            <span style={{ fontSize:13,color }}>{glyph}</span>
                            <span style={{ fontSize:11,color:"#cfc8e0",flex:1 }}>{name}</span>
                            <span style={{ fontSize:13,color,fontWeight:600 }}>{pctFmt(Math.round((ed[k]||0)*100), lang)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                {/* Yaşam Yolu + Kişisel Yıl kısa anlamı */}
                {(() => {
                  const lp = LIFE_PATH_DESC[lang]?.[yasamYolu];
                  const py = PERSONAL_YEAR_DESC[lang]?.[kisiselYil];
                  if (!lp && !py) return null;
                  return (
                    <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:10 }}>
                      {lp && (
                        <div style={{ padding:"9px 12px",background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10 }}>
                          <div style={{ fontSize:9,letterSpacing:2.5,color:"#9080b8",textTransform:"uppercase",marginBottom:4,fontFamily:"'Jost',sans-serif" }}>{t("gid_life_path_lower")} {yasamYolu}</div>
                          <div style={{ fontSize:11,color:"#c8c0d8",lineHeight:1.55,fontFamily:"'Inter',sans-serif" }}>{lp}</div>
                        </div>
                      )}
                      {py && (
                        <div style={{ padding:"9px 12px",background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10 }}>
                          <div style={{ fontSize:9,letterSpacing:2.5,color:"#9080b8",textTransform:"uppercase",marginBottom:4,fontFamily:"'Jost',sans-serif" }}>{t("gid_personal_year_full")} {kisiselYil}</div>
                          <div style={{ fontSize:11,color:"#c8c0d8",lineHeight:1.55,fontFamily:"'Inter',sans-serif" }}>{py}</div>
                        </div>
                      )}
                    </div>
                  );
                })()}
                <div style={{ textAlign:"center",fontSize:9,letterSpacing:3,color:"#605080",fontFamily:"'Jost',sans-serif",textTransform:"uppercase" }}>sakin.life</div>
              </div>
              {/* Actions */}
              <div style={{ display:"flex",flexDirection:"column",gap:8,marginTop:14 }}>
                <button onClick={downloadCard}
                  style={{ padding:"12px 16px",borderRadius:22,border:"1px solid rgba(184,164,216,0.5)",background:"linear-gradient(135deg,rgba(184,164,216,0.7),rgba(122,80,150,0.55))",color:"#fff",fontSize:13,letterSpacing:2,cursor:"pointer",fontFamily:"'Jost',sans-serif",textTransform:"uppercase",boxShadow:"0 4px 18px rgba(122,80,150,0.3)" }}>
                  {t("gid_download_share")}
                </button>
                <a href="https://instagram.com/sakin.app" target="_blank" rel="noopener noreferrer"
                  style={{ textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"10px 16px",borderRadius:22,border:"1px solid rgba(220,140,200,0.3)",background:"linear-gradient(135deg,rgba(240,100,160,0.10),rgba(140,80,200,0.10))",color:"#e0a0c8",fontSize:12,letterSpacing:2,fontFamily:"'Jost',sans-serif",textTransform:"uppercase" }}>
                  <span style={{ fontSize:14 }}>◐</span> @sakin.app
                </a>
                <button onClick={()=>{ closeIdCard(); }}
                  style={{ padding:"9px 16px",borderRadius:22,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#888",fontSize:12,letterSpacing:2,cursor:"pointer",fontFamily:"'Jost',sans-serif",textTransform:"uppercase" }}>
                  {/* "Kaydet" ayrı bir buton değil — isim/foto zaten anlık kaydediliyor (React
                      state), kapat bunu bozmaz. Bunu netleştirmek için etiket "✓ Kapat" oldu
                      (kullanıcı 'kaydet'e basıp kapanmasını bekliyor olabilir şikayeti). */}
                  ✓ {t("common_close")}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ZİHNİ BOŞALT — mod seçim menüsü */}
      {showMindClear && !activeMindMode && (
        <div onClick={()=>setShowMindClear(false)} style={{ position:"fixed",inset:0,zIndex:10000,background:"rgba(0,0,0,0.92)",backdropFilter:"blur(20px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"calc(20px + var(--sat)) 16px calc(20px + var(--sab))",overflow:"auto" }}>
          <div onClick={e=>e.stopPropagation()} style={{ maxWidth:480,width:"100%",display:"flex",flexDirection:"column",gap:14 }}>
            <div style={{ textAlign:"center",marginBottom:6 }}>
              <div style={{ fontSize:11,letterSpacing:5,color:"#888",textTransform:"uppercase",marginBottom:6 }}>{t("mind_title")}</div>
              <div style={{ fontSize:18,fontWeight:300,letterSpacing:2,color:"#c0e0d0",fontFamily:"'Jost',sans-serif",marginBottom:6 }}>{t("mind_subtitle")}</div>
              <div style={{ fontSize:12,color:"#666",lineHeight:1.7 }}>{t("mind_subdesc")}</div>
            </div>

            {/* Doğa sesleri — opsiyonel katman, drone'un altına serilir */}
            <div style={{ display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap" }}>
              {NATURE_SOUNDS.map(n => {
                const sel = selectedNature.includes(n.id);
                return (
                  <button key={n.id}
                    onClick={()=>setSelectedNature(prev => sel ? prev.filter(x=>x!==n.id) : [...prev, n.id])}
                    style={{
                      background: sel ? "linear-gradient(135deg,rgba(160,200,240,0.22),rgba(80,120,180,0.12))" : "rgba(255,255,255,0.025)",
                      border: `1px solid ${sel ? "rgba(160,200,240,0.55)" : "rgba(255,255,255,0.08)"}`,
                      borderRadius: 100, padding: "7px 13px",
                      cursor:"pointer", display:"inline-flex", alignItems:"center", gap:6,
                      color: sel ? "#e0e8f0" : "rgba(255,255,255,0.55)",
                      fontSize: 11.5, letterSpacing: 0.5, fontFamily: "'Jost',sans-serif",
                      transition: "all 0.2s",
                      boxShadow: sel ? "0 0 14px rgba(160,200,240,0.22)" : "none",
                    }}>
                    <span style={{ fontSize:13,lineHeight:1 }}>{n.icon}</span>
                    <span>{pickLabel(n, lang)}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
              {MIND_MODES.map(m => (
                <button key={m.id} onClick={()=>setActiveMindMode(m)}
                  style={{
                    background: `linear-gradient(140deg,${m.colors[0]}55,${m.colors[1]}1a)`,
                    border: `1px solid ${m.colors[1]}55`,
                    borderRadius: 16, padding: "20px 14px",
                    cursor:"pointer", textAlign:"center", minHeight:110,
                    display:"flex", flexDirection:"column", justifyContent:"center", gap:7,
                    transition:"all 0.3s",
                    boxShadow:`0 0 20px ${m.glow}`,
                  }}
                  onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 0 32px ${m.glow.replace('0.18','0.32')}`; }}
                  onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=`0 0 20px ${m.glow}`; }}>
                  <div style={{ fontSize:15,color:"#fff",letterSpacing:2,fontFamily:"'Jost',sans-serif",textTransform:"uppercase",fontWeight:500 }}>{pickLabel(m, lang)}</div>
                  <div style={{ fontSize:11.5,color:"rgba(255,255,255,0.62)",lineHeight:1.5,letterSpacing:0.4 }}>{pickLabel(m, lang, "sub")}</div>
                </button>
              ))}
            </div>

            {/* Duygu durumuna göre karışım — kullanıcı kendi karışımını yapar */}
            <div style={{ marginTop:14,paddingTop:14,borderTop:"1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ textAlign:"center",marginBottom:10 }}>
                <div style={{ fontSize:11,letterSpacing:4,color:"#888",textTransform:"uppercase",fontFamily:"'Jost',sans-serif",marginBottom:4 }}>{t("mind_or_custom")}</div>
                <div style={{ fontSize:11,color:"#666",lineHeight:1.6 }}>{t("mind_pick_3")}</div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6 }}>
                {MIND_MOODS.map(mood => {
                  const sel = selectedMoods.includes(mood.id);
                  const full = selectedMoods.length >= 3 && !sel;
                  return (
                    <button key={mood.id}
                      disabled={full}
                      onClick={()=>{
                        setSelectedMoods(prev => sel ? prev.filter(x=>x!==mood.id) : (prev.length < 3 ? [...prev, mood.id] : prev));
                      }}
                      style={{
                        background: sel ? `linear-gradient(140deg,${mood.colors[0]}66,${mood.colors[1]}22)` : "rgba(255,255,255,0.025)",
                        border: `1px solid ${sel ? mood.colors[1]+"99" : "rgba(255,255,255,0.07)"}`,
                        borderRadius: 12, padding: "8px 4px",
                        cursor: full ? "not-allowed" : "pointer",
                        opacity: full ? 0.3 : 1,
                        transition: "all 0.2s",
                        display:"flex", flexDirection:"column", alignItems:"center", gap:3,
                        boxShadow: sel ? `0 0 14px ${mood.colors[1]}44` : "none",
                      }}>
                      <span style={{ fontSize:16,lineHeight:1 }}>{mood.icon}</span>
                      <span style={{ fontSize:9.5,color: sel ? "#fff" : "rgba(255,255,255,0.55)",letterSpacing:0.4,lineHeight:1.2,fontFamily:"'Jost',sans-serif" }}>
                        {pickLabel(mood, lang)}
                      </span>
                    </button>
                  );
                })}
              </div>
              {selectedMoods.length > 0 && (
                <button onClick={()=>{
                  const picks = MIND_MOODS.filter(m => selectedMoods.includes(m.id));
                  // Frekansları birleştir + tekrarsızlaştır
                  const freqs = Array.from(new Set(picks.flatMap(p => p.frequencies))).slice(0, 6);
                  // Renkleri harmanla
                  const colors = Array.from(new Set(picks.flatMap(p => p.colors)));
                  const labels = picks.map(p => pickLabel(p, lang));
                  const customMode = {
                    id: "kendi",
                    labelTr: picks.map(p=>p.labelTr).join(" · "),
                    labelEn: picks.map(p=>p.labelEn).join(" · "),
                    labelDe: picks.map(p=>p.labelDe).join(" · "),
                    labelEs: picks.map(p=>p.labelEs).join(" · "),
                    labelPt: picks.map(p=>p.labelPt).join(" · "),
                    labelFr: picks.map(p=>p.labelFr).join(" · "),
                    labelJa: picks.map(p=>p.labelJa).join(" · "),
                    colors,
                    frequencies: freqs,
                    lfo: 0.08 + picks.length * 0.04,
                    glow: `rgba(${picks[0].colors[1].slice(1).match(/.{2}/g).map(h=>parseInt(h,16)).join(',')},0.18)`,
                  };
                  setActiveMindMode(customMode);
                  setSelectedMoods([]);
                }}
                  style={{
                    marginTop:12, width:"100%",
                    padding:"12px 16px", borderRadius:24,
                    border: "1px solid rgba(200,220,255,0.4)",
                    background: "linear-gradient(135deg,rgba(160,200,240,0.25),rgba(80,120,180,0.15))",
                    color:"#e0e8f0", fontSize:13, letterSpacing:2,
                    cursor:"pointer", fontFamily:"'Jost',sans-serif", textTransform:"uppercase",
                    boxShadow:"0 0 22px rgba(160,200,240,0.18)",
                  }}>
                  ◎ {t("mind_start_mix").replace("{n}", String(selectedMoods.length))}
                </button>
              )}
            </div>

            <button onClick={()=>{ setShowMindClear(false); setSelectedMoods([]); setSelectedNature([]); }} style={{ marginTop:8,background:"none",border:"1px solid rgba(255,255,255,0.1)",borderRadius:100,padding:"10px 0",color:"#888",fontSize:13,letterSpacing:2,cursor:"pointer",fontFamily:"'Jost',sans-serif",textTransform:"uppercase" }}>
              {t("common_close")}
            </button>
          </div>
        </div>
      )}
      {activeMindMode && (
        <KaleidoscopeView mode={activeMindMode} nature={selectedNature} lang={lang} isPremium={isPremium} onPremium={()=>{ setActiveMindMode(null); setShowMindClear(false); setSelectedNature([]); setScreen("fiyat"); }} onClose={()=>{ setActiveMindMode(null); setShowMindClear(false); setSelectedNature([]); }} />
      )}

      {/* SAKİN NEDİR? */}
      {screen==="hakkinda" && (
        <div className="policy-screen">

          {/* ── SEKMELER ── */}
          <div style={{ display:"flex",gap:8,marginBottom:32,justifyContent:"center" }}>
            {[
              {id:"yolculuk", label:t("about_tab_journey")},
              {id:"nedir", label:t("about_tab_what")},
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
            {/* BAĞLANTI NASIL KURULUR — 7 adım + 3 seviye (kullanıcı: "bu bağlantı
                şartlarını yolculuk sekmesine yedir; kısa bir üst açıklama yap,
                adımları yaz 7 + 3'ü açıkla"). */}
            <div style={{ marginBottom:30,paddingBottom:26,borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ textAlign:"center",marginBottom:12 }}>
                <div style={{ fontSize:15,fontWeight:400,letterSpacing:1.5,color:"#82d9a3",fontFamily:"'Jost',sans-serif",marginBottom:8 }}>
                  ⚡ {t("conn_how_title")}
                </div>
                <div style={{ fontSize:13,color:"#9a94a8",lineHeight:1.8,fontFamily:"'Inter',sans-serif" }}>
                  {t("conn_how_intro")}
                </div>
              </div>

              <div style={{ fontSize:11,letterSpacing:3,color:"#777",textTransform:"uppercase",fontFamily:"'Jost',sans-serif",margin:"20px 0 10px" }}>
                {t("conn_steps_title")}
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
                {[
                  ["sabah", "#f0a060", t("conn_s_sabah")],
                  ["gun",    "#e8d060", t("conn_s_gun")],
                  ["nefes",  "#60b8e8", t("conn_s_nefes")],
                  ["ses",    "#a07ae0", t("conn_s_ses")],
                  ["chakra", "#b87adc", t("conn_s_chakra")],
                  ["aksam",  "#7ab0e0", t("conn_s_aksam")],
                  // 7. adım artık AYNA (harita değil) — id "rehber", ayna moru.
                  ["rehber", "#a070d0", t("conn_s_harita")],
                ].map(([id, color, label], i) => {
                  const done = !!stepsCompleted[id];
                  return (
                    <div key={id} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 12px",
                      background: done ? `${color}12` : "rgba(255,255,255,0.02)",
                      border:`1px solid ${done ? `${color}38` : "rgba(255,255,255,0.05)"}`, borderRadius:12 }}>
                      <span style={{ width:20,height:20,flexShrink:0,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                        background: done ? `${color}28` : "rgba(255,255,255,0.04)", color: done ? color : "#666",
                        fontSize:10.5,fontFamily:"'Jost',sans-serif" }}>{done ? "✓" : i+1}</span>
                      <span style={{ fontSize:12.5,color: done ? "#cfc8dd" : "#9a94a8",lineHeight:1.55,fontFamily:"'Inter',sans-serif" }}>{label}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ fontSize:11,letterSpacing:3,color:"#777",textTransform:"uppercase",fontFamily:"'Jost',sans-serif",margin:"22px 0 10px" }}>
                {t("conn_levels_title")}
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
                {[[1,t("conn_lv1")],[2,t("conn_lv2")],[3,t("conn_lv3")]].map(([lv, label]) => {
                  const active = streakLevel === lv;
                  return (
                    <div key={lv} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 12px",
                      background: active ? "rgba(240,200,96,0.10)" : "rgba(255,255,255,0.02)",
                      border:`1px solid ${active ? "rgba(240,200,96,0.35)" : "rgba(255,255,255,0.05)"}`, borderRadius:12 }}>
                      <span style={{ fontSize:13,flexShrink:0 }}>{lv===1?"🌱":lv===2?"🔥":"👑"}</span>
                      <span style={{ fontSize:12.5,color: active ? "#f0c860" : "#9a94a8",lineHeight:1.55,fontFamily:"'Inter',sans-serif" }}>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ textAlign:"center",marginBottom:28 }}>
              <div style={{ fontSize:11,letterSpacing:5,color:"#888",textTransform:"uppercase",marginBottom:8 }}>{t("about_journey_map")}</div>
              <div style={{ fontSize:20,fontWeight:300,letterSpacing:2,color:"#d0c0f0",fontFamily:"'Jost',sans-serif" }}>{t("about_journey_awaits")}</div>
            </div>

            <div style={{ position:"relative",paddingLeft:32 }}>
              <div style={{ position:"absolute",left:12,top:0,bottom:0,width:2,background:"linear-gradient(to bottom,rgba(240,160,96,0.5),rgba(96,184,232,0.5),rgba(160,122,224,0.5),rgba(184,122,220,0.5),rgba(232,208,96,0.5),rgba(122,176,224,0.5),rgba(130,217,163,0.5))",borderRadius:2 }} />

              {JOURNEY_STEPS.map((step,i,arr) => (
                <div key={i} style={{ position:"relative",marginBottom:i<arr.length-1?24:0,paddingBottom:i<arr.length-1?4:0 }}>
                  {/* İkon dikey çizginin TAM ORTASINDA olmalı. Kapsayıcı paddingLeft:32,
                      çizgi left:12 + width:2 → çizgi ekseni x=13. Adım div'i x=32'den
                      başladığı için daire ekseni left:-27'de x=18'e düşüyordu (5px sağa
                      kaçık — kullanıcı: "ikonlar hizalı değil"). left:-32 → eksen x=13.
                      top:-4 ile daire, başlık satırının dikey ortasına oturur. */}
                  <div style={{ position:"absolute",left:-32,top:-4,width:26,height:26,borderRadius:"50%",background:`radial-gradient(circle,${step.color}44,${step.color}11)`,border:`1.5px solid ${step.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,lineHeight:1 }}>{step.icon}</div>
                  <div style={{ fontSize:14,fontWeight:500,color:step.color,letterSpacing:1,marginBottom:4,fontFamily:"'Jost',sans-serif" }}>{step.title[lang] || step.title.en || step.title.tr}</div>
                  <div style={{ fontSize:13,color:"#999",lineHeight:1.8 }}>{step.desc[lang] || step.desc.en || step.desc.tr}</div>
                </div>
              ))}
            </div>

            <div style={{ textAlign:"center",marginTop:28,padding:"14px 20px",background:"rgba(184,164,216,0.06)",border:"1px solid rgba(184,164,216,0.12)",borderRadius:14 }}>
              <div style={{ fontSize:13,color:"#b8a4d8",fontStyle:"italic",lineHeight:1.8 }}>
                {t("about_journey_outro")}
              </div>
            </div>

          </div>
          )}

          {/* ── SAKİN NEDİR? ── */}
          {hakkindaTab==="nedir" && (
          <>
          {/* Başlık + iki yol — pop-up ile aynı dil (basitleştirilmiş yapı) */}
          <div style={{ textAlign:"center",marginBottom:14 }}>
            <div style={{ fontSize:11,letterSpacing:5,color:"#888",textTransform:"uppercase",fontFamily:"'Jost',sans-serif",marginBottom:10 }}>{pickLang(NEDIR_I18N.title, lang)}</div>
            <h1 style={{ margin:0,fontSize:21,fontWeight:300,letterSpacing:2,color:"#d0c0f0",fontFamily:"'Jost',sans-serif",lineHeight:1.45 }}>{pickLang(NEDIR_I18N.vaat, lang)}</h1>
          </div>
          <button onClick={()=>setScreen("mandala")}
            style={{ display:"block",width:"100%",textAlign:"left",padding:"15px 17px",background:"linear-gradient(160deg,rgba(40,30,60,0.5),rgba(20,15,32,0.55))",border:"1px solid rgba(184,122,220,0.35)",borderRadius:16,marginBottom:10,cursor:"pointer" }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}>
              <span style={{ fontSize:14,letterSpacing:2,color:"#b87adc",fontFamily:"'Jost',sans-serif" }}>◎ {pickLang(NEDIR_I18N.baglanT, lang).toLocaleUpperCase(t("locale_code"))}</span>
              <span style={{ color:"rgba(184,122,220,0.6)",fontSize:16 }}>→</span>
            </div>
            <div style={{ fontSize:13,color:"#b0a4c8",lineHeight:1.65,fontFamily:"'Inter',sans-serif" }}>{pickLang(NEDIR_I18N.bodyBaglan, lang)}</div>
          </button>
          <button onClick={()=>setShowAilesi(true)}
            style={{ display:"block",width:"100%",textAlign:"left",padding:"15px 17px",background:"linear-gradient(160deg,rgba(60,45,30,0.5),rgba(30,22,14,0.55))",border:"1px solid rgba(240,192,96,0.35)",borderRadius:16,marginBottom:32,cursor:"pointer" }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}>
              <span style={{ fontSize:14,letterSpacing:2,color:"#f0c060",fontFamily:"'Jost',sans-serif" }}>✦ {pickLang(NEDIR_I18N.kesfetT, lang).toLocaleUpperCase(t("locale_code"))}</span>
              <span style={{ color:"rgba(240,192,96,0.6)",fontSize:16 }}>→</span>
            </div>
            <div style={{ fontSize:13,color:"#c8b89a",lineHeight:1.65,fontFamily:"'Inter',sans-serif" }}>{pickLang(NEDIR_I18N.bodyKesfet, lang)}</div>
          </button>

          {/* Tanıdık mı? */}
          <div style={{ marginBottom:28 }}>
            <div style={{ textAlign:"center",fontSize:18,marginBottom:16,color:"#999",fontFamily:"'Jost',sans-serif",letterSpacing:1 }}>{t("about_familiar")}</div>
            {[
              { emoji:"😵‍💫", text:t("about_card1_text"), label:t("about_card1_label"), color:"#f472b6" },
              { emoji:"🧠", text:t("about_card2_text"), label:t("about_card2_label"), color:"#fb923c" },
              { emoji:"🌀", text:t("about_card3_text"), label:t("about_card3_label"), color:"#c084fc" },
              { emoji:"📱", text:t("about_card4_text"), label:t("about_card4_label"), color:"#38bdf8" },
            ].map((item,i)=>(
              <div key={i} style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"14px 16px",marginBottom:10 }}>
                <div style={{ fontSize:14,color:"#ccc" }}>{item.emoji} {item.text}</div>
                <div style={{ fontSize:11,color:item.color,marginTop:4,letterSpacing:1 }}>{t("about_card_conn_prefix")}: {item.label} ✕</div>
              </div>
            ))}
          </div>

          {/* Güzel haber köprüsü */}
          <div style={{ textAlign:"center",padding:"20px 24px",background:"rgba(184,164,216,0.06)",border:"1px solid rgba(184,164,216,0.12)",borderRadius:16,marginBottom:32 }}>
            <div style={{ fontSize:11,color:"#c084fc",letterSpacing:2,fontFamily:"'Jost',sans-serif",marginBottom:6 }}>{t("about_good_news_label")}</div>
            <div style={{ fontSize:14,color:"#ccc",lineHeight:1.9 }}>
              {t("about_good_news_text")}
            </div>
          </div>

          {/* Sakin nedir tanımı */}
          <div style={{ marginBottom:28 }}>
            <div style={{ fontSize:15,color:"#ccc",lineHeight:2.2,marginBottom:16 }}>
              {t("about_sakin_not_meditation")} <span style={{ textDecoration:"line-through",color:"#666" }}>{t("about_sakin_meditation")}</span>{lang==="tr"?" değil":""}.<br/>
              {t("about_sakin_not_therapy")} <span style={{ textDecoration:"line-through",color:"#666" }}>{t("about_sakin_therapy")}</span>{lang==="tr"?" değil":""}.<br/>
              {t("about_sakin_not_todo")} <span style={{ textDecoration:"line-through",color:"#666" }}>{t("about_sakin_todo")}</span>{lang==="tr"?" değil":""}.<br/><br/>
              {t("about_sakin_is")} <strong style={{ color:"#c084fc" }}>{t("about_sakin_awareness_system")}</strong>.
            </div>
          </div>

          <p style={{ fontSize:15, lineHeight:2.1, color:"#cccccc", fontStyle:"italic", marginBottom:32, borderLeft:"2px solid rgba(184,164,216,0.3)", paddingLeft:20 }}>
            {t("about_intro_quote")}
          </p>

          <h2>{t("about_not_just_ai")}</h2>
          <p>{t("about_p1")}</p>
          <p>{t("about_p2")}</p>
          <p>{t("about_p3")}</p>

          <h2>{t("about_birth_title")}</h2>
          <p>{t("about_birth_p1")}</p>
          <p>{t("about_birth_p2")}</p>

          <h2>{t("about_channel_title")}</h2>
          <p>{t("about_channel_p1")}</p>
          <p>{t("about_channel_p2")}</p>

          {/* Sakin Ailesi */}
          <div style={{ marginTop:36,marginBottom:28 }}>
            <h2>{t("about_family_section")}</h2>
            <p style={{ marginBottom:16 }}>{t("about_family_desc")}</p>
            {[
              { name:t("ailesi_hayvan_name"), icon:"◈", color:"#a0d8b4",
                desc:t("ailesi_hayvan_desc") },
              { name:t("ailesi_mitler_name"), icon:"🏛️", color:"#d8b4a0",
                desc:t("ailesi_mitler_desc") },
              { name:t("ailesi_tasarim_name"), icon:"⌖", color:"#b4a0d8",
                desc:t("ailesi_tasarim_desc") },
              { name:t("ailesi_taslar_name"), icon:"💎", color:"#a0d8d8",
                desc:t("ailesi_taslar_desc") },
              { name:t("ailesi_bitkiler_name"), icon:"🌿", color:"#7BA05B",
                desc:t("ailesi_bitkiler_desc") },
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
              {t("about_all_complete")}
            </div>
          </div>

          <div className="divider" />

          {/* Geri Bildirim */}
          {!fbOpen ? (
            <div style={{ textAlign:"center",marginBottom:24 }}>
              <button onClick={()=>setFbOpen(true)}
                style={{ background:"linear-gradient(135deg,rgba(184,164,216,0.12),rgba(184,164,216,0.04))",border:"1px solid rgba(184,164,216,0.2)",borderRadius:16,padding:"14px 28px",cursor:"pointer",color:"#b8a4d8",fontSize:14,letterSpacing:2,fontFamily:"'Jost',sans-serif",minHeight:44 }}>
                {t("about_send_feedback")}
              </button>
            </div>
          ) : (
            <div style={{ background:"linear-gradient(145deg,rgba(184,164,216,0.08),rgba(184,164,216,0.02))",border:"1px solid rgba(184,164,216,0.15)",borderRadius:18,padding:"20px 18px",marginBottom:24 }}>
              <div style={{ fontSize:13,letterSpacing:2.5,color:"#b8a4d8",marginBottom:14,textAlign:"center",fontFamily:"'Jost',sans-serif" }}>
                {t("about_feedback_header")}
              </div>
              {fbDone ? (
                <div style={{ textAlign:"center",padding:"20px 0" }}>
                  <div style={{ fontSize:28,marginBottom:8 }}>✓</div>
                  <div style={{ fontSize:14,color:"#50c878",letterSpacing:1.5 }}>
                    {t("about_feedback_thanks")}
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",justifyContent:"center" }}>
                    {[
                      ["oneri", t("about_feedback_cat_oneri")],
                      ["hata", t("about_feedback_cat_hata")],
                      ["icerik", t("about_feedback_cat_icerik")],
                      ["genel", t("about_feedback_cat_genel")],
                    ].map(([k,v])=>(
                      <button key={k} onClick={()=>setFbCat(k)}
                        style={{ padding:"6px 14px",borderRadius:20,border:`1px solid ${fbCat===k?"rgba(184,164,216,0.5)":"rgba(255,255,255,0.1)"}`,background:fbCat===k?"rgba(184,164,216,0.15)":"transparent",color:fbCat===k?"#b8a4d8":"#888",fontSize:12,letterSpacing:1.5,cursor:"pointer",transition:"all 0.2s" }}>
                        {v}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={fbMsg}
                    onChange={e=>setFbMsg(e.target.value)}
                    placeholder={t("about_feedback_ph")}
                    rows={3}
                    maxLength={1000}
                    style={{ width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(184,164,216,0.15)",borderRadius:12,padding:"12px 14px",color:"#d0c8e8",fontSize:15,fontFamily:"'Inter',sans-serif",outline:"none",marginBottom:12,resize:"none",lineHeight:1.7,letterSpacing:0.3 }}
                  />
                  <div style={{ display:"flex",gap:10,justifyContent:"flex-end" }}>
                    <button onClick={()=>{ setFbOpen(false); setFbMsg(""); setFbCat(""); }}
                      style={{ padding:"10px 20px",borderRadius:12,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#888",fontSize:13,cursor:"pointer",letterSpacing:1,minHeight:44 }}>
                      {t("about_feedback_cancel")}
                    </button>
                    <button onClick={sendFeedback} disabled={!fbMsg.trim() || fbSending}
                      style={{ padding:"10px 24px",borderRadius:12,border:"none",background:fbMsg.trim()?"linear-gradient(135deg,rgba(184,164,216,0.7),rgba(122,80,150,0.6))":"rgba(255,255,255,0.05)",color:fbMsg.trim()?"#fff":"#555",fontSize:13,cursor:fbMsg.trim()?"pointer":"default",letterSpacing:1.5,fontFamily:"'Jost',sans-serif",minHeight:44,opacity:fbSending?0.6:1 }}>
                      {fbSending ? "..." : t("about_feedback_send")}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          </>
          )}

          <p style={{ fontSize:14, color:"#777777", letterSpacing:1, textAlign:"center", lineHeight:2, marginTop:32 }}>
            {t("about_footer")}
            <br/>
            <span style={{ fontSize:12, color:"#555555", letterSpacing:1.5 }}>Arda Çetin</span>
          </p>
        </div>
      )}

      {/* FİYATLANDIRMA */}
      {screen==="fiyat" && (
        <div className="policy-screen">
          <button onClick={()=>goBack("sabah")}
            style={{ position:"absolute",top:14,left:14,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"50%",width:40,height:40,cursor:"pointer",color:"#ddd",fontSize:18,fontWeight:700,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center",paddingRight:2,zIndex:10 }}>
            ←
          </button>
          {/* paddingTop: sol üstteki dairesel geri butonu (top:14 + 40px) başlığın
              üstüne binmesin — buton bandı ~54px'te bitiyor. */}
          <h1 style={{ paddingTop:40 }}>{t("pricing_title")}</h1>
          <div className="subtitle">{t("pricing_sub")}</div>

          {isPremium ? (
            <div style={{ textAlign:"center",padding:"32px 0" }}>
              <div style={{ width:64,height:64,borderRadius:"50%",background:"rgba(80,200,120,0.15)",border:"1px solid rgba(80,200,120,0.3)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#50c878" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div style={{ fontSize:18,fontWeight:300,letterSpacing:2,color:"#50c878",marginBottom:8,fontFamily:"'Jost',sans-serif" }}>
                {t("premium_active")}
              </div>
              <div style={{ fontSize:14,color:"#888",letterSpacing:1 }}>
                {t("premium_active_desc")}
              </div>
              {/* F1: Yıllık abone → ömür boyu geçiş. Ömür boyu sahibi değilse upgrade butonu. */}
              {isNative && !((getProductInfo(LIFETIME_PRODUCT_ID)||{}).owned) && (
                <div style={{ marginTop:30,paddingTop:24,borderTop:"1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontSize:13.5,color:"#b0a8c8",lineHeight:1.65,marginBottom:16 }}>{t("premium_upgrade_lifetime_desc")}</div>
                  <button onClick={() => handlePurchase(purchaseLifetime, "lifetime")} disabled={!!purchaseLoading || !productsReady}
                    style={{ display:"block",width:"100%",fontSize:15,letterSpacing:2,padding:"15px 0",textAlign:"center",boxSizing:"border-box",fontFamily:"'Jost',sans-serif",fontWeight:400,background:"linear-gradient(135deg,rgba(184,164,216,0.5),rgba(122,80,150,0.45))",border:"1px solid rgba(184,164,216,0.5)",borderRadius:28,color:"#fff",cursor:(purchaseLoading||!productsReady)?"default":"pointer",opacity:(purchaseLoading||!productsReady)?0.5:1 }}>
                    {purchaseLoading==="lifetime" ? "..." : !productsReady ? t("premium_loading") : <>{t("premium_buy_lifetime")}<span style={{ marginLeft:8,opacity:0.85,fontWeight:300 }}>· $19.99</span></>}
                  </button>
                </div>
              )}
            </div>
          ) : isNative ? (
            <>
              <div className="pricing-card" style={{ background:"linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))",border:"1px solid rgba(255,255,255,0.3)" }}>
                <div style={{ position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#b8a4d8,#7a5096,#b8a4d8)",opacity:0.7,borderRadius:"3px 3px 0 0" }}/>
                <div className="pricing-badge" style={{ background:"rgba(184,164,216,0.15)",border:"1px solid rgba(184,164,216,0.35)",color:"#b8a4d8" }}>✦ {t("paid_app_badge")}</div>
                <div style={{ fontSize:17,fontWeight:300,letterSpacing:0.3,lineHeight:1.45,marginBottom:10,color:"#ffffff" }}>{t("paid_app_plan")}</div>
                <ul>{t("paid_app_features").map(f=>(<li key={f}>{f}</li>))}</ul>

                <div style={{ marginTop:14,marginBottom:6,paddingTop:14,borderTop:"1px solid rgba(240,200,120,0.18)" }}>
                  <div style={{ fontSize:11,letterSpacing:3,color:"#c8a868",textTransform:"uppercase",fontFamily:"'Jost',sans-serif",marginBottom:10,textAlign:"center" }}>
                    ✦ {t("ailesi_family_bonus")}
                  </div>
                  <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
                    <div style={{ fontSize:13,color:"#cccccc",lineHeight:1.55 }}>
                      <strong style={{ color:"#a0d8b4",fontWeight:500 }}>◈ {t("ailesi_hayvan_name")}</strong> — {t("ailesi_hayvan_short")}
                    </div>
                    <div style={{ fontSize:13,color:"#cccccc",lineHeight:1.55 }}>
                      <strong style={{ color:"#d8b4a0",fontWeight:500 }}>🏛 {t("ailesi_mitler_name")}</strong> — {t("ailesi_mitler_short")}
                    </div>
                    <div style={{ fontSize:13,color:"#cccccc",lineHeight:1.55 }}>
                      <strong style={{ color:"#b4a0d8",fontWeight:500 }}>⌖ {t("ailesi_tasarim_name")}</strong> — {t("ailesi_tasarim_short")}
                    </div>
                    <div style={{ fontSize:13,color:"#cccccc",lineHeight:1.55 }}>
                      <strong style={{ color:"#c8b4d8",fontWeight:500 }}>◇ {t("ailesi_taslar_name")}</strong> — {t("ailesi_taslar_short")}
                    </div>
                    <div style={{ fontSize:13,color:"#cccccc",lineHeight:1.55 }}>
                      <strong style={{ color:"#a8d8a0",fontWeight:500 }}>✿ {t("ailesi_bitkiler_name")}</strong> — {t("ailesi_bitkiler_short")}
                    </div>
                  </div>
                </div>

                <button onClick={() => handlePurchase(purchaseYearly, "yearly")} disabled={!!purchaseLoading || !productsReady}
                  style={{ display:"block",width:"100%",marginTop:20,marginBottom:12,fontSize:15,letterSpacing:2.5,padding:"16px 0",textAlign:"center",boxSizing:"border-box",fontFamily:"'Jost',sans-serif",fontWeight:400,background:"linear-gradient(135deg,rgba(184,164,216,0.8),rgba(122,80,150,0.7))",border:"1px solid rgba(184,164,216,0.5)",borderRadius:28,color:"#fff",boxShadow:"0 4px 24px rgba(122,80,150,0.35)",cursor:(purchaseLoading || !productsReady) ? "default" : "pointer",opacity:(purchaseLoading || !productsReady) ? 0.5 : 1 }}>
                  {purchaseLoading === "yearly"
                    ? "..."
                    : !productsReady
                    ? t("premium_loading")
                    : <>{t("premium_subscribe_yearly")}<span style={{ marginLeft:8,opacity:0.85,fontWeight:300 }}>· $9.99</span></>}
                </button>
                <button onClick={() => handlePurchase(purchaseLifetime, "lifetime")} disabled={!!purchaseLoading || !productsReady}
                  style={{ display:"block",width:"100%",marginBottom:0,fontSize:15,letterSpacing:2.5,padding:"16px 0",textAlign:"center",boxSizing:"border-box",fontFamily:"'Jost',sans-serif",fontWeight:400,background:"linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.06))",border:"1px solid rgba(184,164,216,0.4)",borderRadius:28,color:"#fff",cursor:(purchaseLoading || !productsReady) ? "default" : "pointer",opacity:(purchaseLoading || !productsReady) ? 0.5 : 1 }}>
                  {purchaseLoading === "lifetime"
                    ? "..."
                    : !productsReady
                    ? t("premium_loading")
                    : <>{t("premium_buy_lifetime")}<span style={{ marginLeft:8,opacity:0.85,fontWeight:300 }}>· $19.99</span></>}
                </button>

                {/* Auto-renewable subscription disclosure — Apple Guideline 3.1.2(c) gerekliliği */}
                <div style={{ marginTop:16,paddingTop:14,borderTop:"1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontWeight:500,color:"#aaa",marginBottom:8,fontSize:12,letterSpacing:1.5,textTransform:"uppercase",fontFamily:"'Jost',sans-serif" }}>
                    {t("premium_subscription_info")}
                  </div>
                  <div style={{ fontSize:12.5,color:"#999",lineHeight:1.7,marginBottom:5 }}>
                    <strong style={{ color:"#ccc" }}>{t("premium_yearly_name")}</strong> — {t("premium_yearly_terms")}
                  </div>
                  <div style={{ fontSize:12.5,color:"#999",lineHeight:1.7,marginBottom:8 }}>
                    <strong style={{ color:"#ccc" }}>{t("premium_lifetime_name")}</strong> — {t("premium_lifetime_terms")}
                  </div>
                  <div style={{ fontSize:11,color:"#777",lineHeight:1.65,marginBottom:14 }}>
                    {t("premium_renewal_text")}
                  </div>
                  {/* GERÇEK functional URL linkleri (Apple 3.1.2c) — Safari'de açılır, in-app setScreen değil */}
                  <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                    <a href="https://sakin.life/terms/" target="_blank" rel="noopener noreferrer"
                      style={{ display:"block",textAlign:"center",padding:"13px 12px",borderRadius:14,border:"1px solid rgba(184,164,216,0.45)",background:"rgba(184,164,216,0.10)",color:"#d8c8f0",fontSize:13.5,letterSpacing:0.5,textDecoration:"underline",textUnderlineOffset:3,fontFamily:"'Inter',sans-serif",fontWeight:400 }}>
                      {t("premium_eula")}
                    </a>
                    <a href="https://sakin.life/privacy/" target="_blank" rel="noopener noreferrer"
                      style={{ display:"block",textAlign:"center",padding:"13px 12px",borderRadius:14,border:"1px solid rgba(184,164,216,0.45)",background:"rgba(184,164,216,0.10)",color:"#d8c8f0",fontSize:13.5,letterSpacing:0.5,textDecoration:"underline",textUnderlineOffset:3,fontFamily:"'Inter',sans-serif",fontWeight:400 }}>
                      {t("premium_privacy")}
                    </a>
                  </div>
                </div>
              </div>

              {!productsReady && !purchaseError && (
                <div style={{ textAlign:"center",marginTop:16,fontSize:12,color:"#888",letterSpacing:1.5,fontFamily:"'Jost',sans-serif" }}>
                  {t("premium_app_store_loading")}
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
                  {purchaseLoading === "restore" ? "..." : t("premium_restore")}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="pricing-card" style={{ background:"linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))",border:"1px solid rgba(255,255,255,0.3)" }}>
                <div style={{ position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#b8a4d8,#7a5096,#b8a4d8)",opacity:0.7,borderRadius:"3px 3px 0 0" }}/>
                <div className="pricing-badge" style={{ background:"rgba(184,164,216,0.15)",border:"1px solid rgba(184,164,216,0.35)",color:"#b8a4d8" }}>✦ {t("paid_app_badge")}</div>
                <div style={{ fontSize:17,fontWeight:300,letterSpacing:0.3,lineHeight:1.45,marginBottom:14,color:"#ffffff" }}>{t("paid_app_plan")}</div>
                {/* İki katman — gerçek modeli yansıtır (web bilgi amaçlı; satın alma App Store'da) */}
                <div style={{ display:"flex",justifyContent:"center",gap:28,marginBottom:18 }}>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:28,color:"#ffffff",fontWeight:200,letterSpacing:0.5 }}>$9.99<span style={{ fontSize:13,color:"#b8a4d8" }}>{pickLang({tr:" /yıl",en:" /yr",de:" /Jahr",es:" /año",pt:" /ano",fr:" /an",ja:" /年"}, lang)}</span></div>
                    <div style={{ fontSize:11,color:"#9a90b5",letterSpacing:1,marginTop:3 }}>{t("premium_yearly_name")}</div>
                  </div>
                  <div style={{ width:1,background:"rgba(184,164,216,0.2)" }} />
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:28,color:"#ffffff",fontWeight:200,letterSpacing:0.5 }}>$19.99</div>
                    <div style={{ fontSize:11,color:"#9a90b5",letterSpacing:1,marginTop:3 }}>{t("premium_lifetime_name")}</div>
                  </div>
                </div>
                <ul>{t("paid_app_features").map(f=>(<li key={f}>{f}</li>))}</ul>

                <div style={{ marginTop:14,marginBottom:6,paddingTop:14,borderTop:"1px solid rgba(240,200,120,0.18)" }}>
                  <div style={{ fontSize:11,letterSpacing:3,color:"#c8a868",textTransform:"uppercase",fontFamily:"'Jost',sans-serif",marginBottom:10,textAlign:"center" }}>
                    ✦ {t("ailesi_family_bonus")}
                  </div>
                  <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
                    <div style={{ fontSize:13,color:"#cccccc",lineHeight:1.55 }}>
                      <strong style={{ color:"#a0d8b4",fontWeight:500 }}>◈ {t("ailesi_hayvan_name")}</strong> — {t("ailesi_hayvan_short")}
                    </div>
                    <div style={{ fontSize:13,color:"#cccccc",lineHeight:1.55 }}>
                      <strong style={{ color:"#d8b4a0",fontWeight:500 }}>🏛 {t("ailesi_mitler_name")}</strong> — {t("ailesi_mitler_short")}
                    </div>
                    <div style={{ fontSize:13,color:"#cccccc",lineHeight:1.55 }}>
                      <strong style={{ color:"#b4a0d8",fontWeight:500 }}>⌖ {t("ailesi_tasarim_name")}</strong> — {t("ailesi_tasarim_short")}
                    </div>
                    <div style={{ fontSize:13,color:"#cccccc",lineHeight:1.55 }}>
                      <strong style={{ color:"#c8b4d8",fontWeight:500 }}>◇ {t("ailesi_taslar_name")}</strong> — {t("ailesi_taslar_short")}
                    </div>
                    <div style={{ fontSize:13,color:"#cccccc",lineHeight:1.55 }}>
                      <strong style={{ color:"#a8d8a0",fontWeight:500 }}>✿ {t("ailesi_bitkiler_name")}</strong> — {t("ailesi_bitkiler_short")}
                    </div>
                  </div>
                </div>

                {/* Web satın alma henüz aktif değil — pasif "Yakında" yerine görünür
                    ilgi sayacı: her katılımda artar, toplam herkese gösterilir. */}
                <button onClick={joinWaitlist} disabled={waitlistJoined}
                  style={{ display:"block",width:"100%",marginTop:20,marginBottom:0,fontSize:16,letterSpacing:2.5,padding:"16px 0",textAlign:"center",boxSizing:"border-box",fontFamily:"'Jost',sans-serif",fontWeight:400,background:waitlistJoined?"rgba(122,80,150,0.18)":"linear-gradient(135deg,rgba(184,164,216,0.9),rgba(122,80,150,0.85))",border:"1px solid rgba(184,164,216,0.6)",borderRadius:28,color:"#fff",boxShadow:waitlistJoined?"none":"0 4px 24px rgba(122,80,150,0.4)",cursor:waitlistJoined?"default":"pointer" }}>
                  {waitlistJoined ? t("waitlist_joined") : t("waitlist_cta")}
                </button>
                {typeof waitlistCount === "number" && waitlistCount > 0 && (
                  <div style={{ marginTop:12,textAlign:"center",fontSize:13.5,color:"#b0a2d0",letterSpacing:0.4 }}>
                    <span style={{ fontWeight:600,color:"#e8ddff",fontSize:16 }}>{waitlistCount.toLocaleString()}</span> {t("waitlist_joined_sub")}
                  </div>
                )}
                <div style={{ marginTop:13,textAlign:"center",fontSize:13,color:"#9a8ac0",letterSpacing:0.4,lineHeight:1.6 }}>
                  {t("web_purchase_appstore_note")}
                </div>
                <div style={{ marginTop:14,display:"flex",justifyContent:"center" }}>
                  <AppStoreBadge lang={lang} size="lg" />
                </div>
              </div>

              <div style={{ textAlign:"center",marginTop:20,marginBottom:20 }}>
                <div style={{ fontSize:13,color:"#666",letterSpacing:1,marginBottom:10 }}>
                  {t("premium_already_bought")}
                </div>
                <button onClick={() => setShowLicenseModal(true)}
                  style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:22,padding:"10px 24px",cursor:"pointer",color:"#aaa",fontSize:14,letterSpacing:1.5,fontFamily:"'Jost',sans-serif" }}>
                  {t("premium_enter_license")}
                </button>
              </div>

              <div style={{ textAlign:"center",marginTop:8,marginBottom:24,padding:"18px 20px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16 }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:10 }}>
                  <span style={{ fontSize:16 }}>🔒</span>
                  <span style={{ fontSize:13,letterSpacing:2,color:"#888",fontFamily:"'Jost',sans-serif",textTransform:"uppercase" }}>
                    {t("premium_secure_payment")}
                  </span>
                </div>
                <div style={{ fontSize:13,color:"#666",lineHeight:1.8,letterSpacing:0.3 }}>
                  {t("premium_secure_desc")}
                </div>
                <a href="https://www.lemonsqueezy.com" target="_blank" rel="noopener noreferrer"
                  style={{ display:"inline-block",marginTop:10,fontSize:12,letterSpacing:1.5,color:"#b8a4d8",textDecoration:"none",borderBottom:"1px solid rgba(184,164,216,0.3)",paddingBottom:2 }}>
                  lemonsqueezy.com →
                </a>
              </div>
            </>
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

          {/* KVKK AYDINLATMA METNİ — Apple'ın gizlilik şartları ile KVKK AYRI
              rejimlerdir; Apple'ı karşılamak KVKK'yı karşılamaz. Metin
              uygulamanın GERÇEK davranışına göre yazıldı: veriler cihazda kalır,
              AI'ya yalnızca kimlikle ilişkilendirilemeyen özet iletilir. */}
          <h2>{t("privacy_kvkk")}</h2>
          <p>{t("privacy_kvkk_intro")}</p>
          <h3 style={{ fontSize:15,color:"#a898c8",marginTop:18,marginBottom:4,fontWeight:400 }}>{t("privacy_kvkk_h1")}</h3>
          <p>{t("privacy_kvkk_p1")}</p>
          <h3 style={{ fontSize:15,color:"#a898c8",marginTop:18,marginBottom:4,fontWeight:400 }}>{t("privacy_kvkk_h2")}</h3>
          <p>{t("privacy_kvkk_p2")}</p>
          <h3 style={{ fontSize:15,color:"#a898c8",marginTop:18,marginBottom:4,fontWeight:400 }}>{t("privacy_kvkk_h3")}</h3>
          <p>{t("privacy_kvkk_p3")}</p>
          <h3 style={{ fontSize:15,color:"#a898c8",marginTop:18,marginBottom:4,fontWeight:400 }}>{t("privacy_kvkk_h4")}</h3>
          <p>{t("privacy_kvkk_p4")}</p>
          <h3 style={{ fontSize:15,color:"#a898c8",marginTop:18,marginBottom:4,fontWeight:400 }}>{t("privacy_kvkk_h5")}</h3>
          <p>{t("privacy_kvkk_p5")}</p>
          <h3 style={{ fontSize:15,color:"#a898c8",marginTop:18,marginBottom:4,fontWeight:400 }}>{t("privacy_kvkk_h6")}</h3>
          <ul>{(t("privacy_kvkk_l6") || []).map((x,i)=><li key={i}>{x}</li>)}</ul>
          <p>{t("privacy_kvkk_p7")}</p>

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

      {/* PROGRESS STRIP — 9 adım (sabah…keşfet). mandala/harita ekranlarında da görünür. */}
      {/* Adım noktaları + alt gezinme: yalnızca KAYDIRMA ZİNCİRİNDEKİ ekranlarda.
          "mandala" (bağlan) zincirden çıkarıldığı için buradan da çıkarıldı —
          yoksa zincir dışı bir ekranda "N · ADIM" göstergesi kafa karıştırırdı. */}
      {["sabah","nefes","ses","chakra","gun","aksam","harita"].includes(screen) && (
        <div style={{ position:"fixed",bottom:"calc(76px + var(--sab))",left:"50%",transform:"translateX(-50%)",zIndex:9998,display:"flex",alignItems:"center",gap:5,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(16px)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:20,padding:"5px 14px" }}>
          {NAV_STEPS.map((s,i) => {
            // Geçilen adımlar dolu, bulunulan adım geniş — navigasyon ilerlemesine göre.
            const done = i < (currentStepIndex - 1);
            const isCurrent = i === (currentStepIndex - 1);
            const stepColors = { sabah:"#f0a060",nefes:"#60b8e8",ses:"#a07ae0",chakra:"#b87adc",gun:"#e8d060",aksam:"#7ab0e0",mandala:"#b87adc",harita:"#82d9a3",ailesi:"#f0c060" };
            const c = stepColors[s] || "#888";
            return <div key={s} style={{ width:isCurrent?18:7,height:7,borderRadius:4,background:done?c:isCurrent?`${c}88`:"rgba(255,255,255,0.08)",transition:"all 0.3s",border:isCurrent?`1px solid ${c}66`:"none" }} />;
          })}
          <span style={{ fontFamily:"'Jost',sans-serif",fontSize:11,letterSpacing:2,color:"rgba(255,255,255,0.35)",marginLeft:4,whiteSpace:"nowrap" }}>{currentStepIndex} · {(STEP_NAMES[currentStepIndex]||"").toLocaleUpperCase(t("locale_code"))}</span>
        </div>
      )}

      {/* BOTTOM NAV */}
      {!["giris","mandala","terapi","hakkinda","fiyat","sartlar","gizlilik","iade"].includes(screen) && (
        <div style={{ position:"fixed",bottom:"calc(var(--nav-gap) + var(--android-sab))",left:"50%",transform:"translateX(-50%)",display:"flex",gap:2,alignItems:"center",zIndex:9999,background:"rgba(0,0,0,0.92)",backdropFilter:"blur(32px)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:100,padding:"6px 8px",maxWidth:"calc(100vw - 24px)" }}>
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
                <span style={{ fontFamily:"'Jost',sans-serif",fontWeight:500,fontSize:11,letterSpacing:0.8,color:active?n.color:sabahHint?n.color:`${n.color}55`,transition:"color 0.5s ease",lineHeight:1,whiteSpace:"nowrap" }}>{(n.label||"").toLocaleUpperCase(t("locale_code"))}</span>
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
            position:"fixed", bottom: !["terapi","hakkinda","fiyat","sartlar","gizlilik","iade"].includes(screen) ? "calc(90px + var(--android-sab))" : "calc(28px + var(--android-sab))",
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
        // Arama: terim VE açıklama içinde geçer; Türkçe İ/ı sorunları için
        // toLocaleLowerCase("tr") kullanılır (standart lowercase İ↔i eşlemez).
        const _n = (x) => String(x || "").toLocaleLowerCase("tr");
        const q = _n(kilavuzQ).trim();
        const all = getGlossary(lang).map(c => ({ ...c, cat: t(c.cat) }));
        const glossary = q
          ? all.map(c => ({ ...c, items: c.items.filter(it => _n(it.term).includes(q) || _n(it.desc).includes(q)) }))
               .filter(c => c.items.length)
          : all;
        const hitCount = glossary.reduce((a, c) => a + c.items.length, 0);
        const totalCount = all.reduce((a, c) => a + c.items.length, 0);

        return (
          <div style={{ position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:99999,background:"rgba(0,0,0,0.97)",backdropFilter:"blur(30px)",overflowY:"auto",animation:"fadeIn 0.3s ease" }}>
            <div style={{ maxWidth:540,margin:"0 auto",padding:"24px 20px 60px" }}>
              {/* Header */}
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
                <div>
                  <div style={{ fontFamily:"'Jost',sans-serif",fontSize:13,fontWeight:300,letterSpacing:4,color:"#777777",textTransform:"uppercase",marginBottom:4 }}>{t("guide_help_sub")}</div>
                  <div style={{ fontFamily:"'Inter',sans-serif",fontSize:22,fontWeight:300,color:"#ffffff",letterSpacing:2 }}>{t("guide_help_title")}</div>
                </div>
                <button onClick={() => { setShowKilavuz(false); setKilavuzQ(""); }} style={{ background:"rgba(192,57,43,0.15)",border:"1px solid rgba(192,57,43,0.3)",borderRadius:100,padding:"8px 20px",cursor:"pointer",color:"#e8a0a0",fontFamily:"'Jost',sans-serif",fontSize:13,letterSpacing:2,textTransform:"uppercase",transition:"all 0.2s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.background="rgba(192,57,43,0.3)"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background="rgba(192,57,43,0.15)"; }}
                >{t("guide_close")}</button>
              </div>
              <div style={{ height:1,background:"linear-gradient(90deg,transparent,rgba(192,57,43,0.3),transparent)",margin:"18px 0 18px" }} />

              {/* ARAMA — listenin EN ÜSTÜNDE (kullanıcı isteği) */}
              <div style={{ position:"relative", marginBottom:10 }}>
                <input
                  value={kilavuzQ}
                  onChange={e => setKilavuzQ(e.target.value)}
                  placeholder={lang === "tr" ? "Terim ara…" : "Search terms…"}
                  aria-label={lang === "tr" ? "Terim ara" : "Search terms"}
                  style={{ width:"100%", boxSizing:"border-box", padding:"12px 38px 12px 16px",
                    background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.14)",
                    borderRadius:14, color:"#eee", fontSize:15, fontFamily:"'Inter',sans-serif",
                    outline:"none" }} />
                {kilavuzQ && (
                  <button onClick={() => setKilavuzQ("")} aria-label={lang === "tr" ? "Temizle" : "Clear"}
                    style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)",
                      background:"none", border:"none", color:"#888", fontSize:18, cursor:"pointer",
                      padding:"4px 8px", lineHeight:1 }}>✕</button>
                )}
              </div>
              <div style={{ fontSize:12, color:"#777", letterSpacing:1, marginBottom:22, fontFamily:"'Jost',sans-serif" }}>
                {q ? `${hitCount} / ${totalCount}` : `${totalCount} ${lang === "tr" ? "terim" : "terms"}`}
              </div>

              {/* Sonuç yoksa */}
              {q && hitCount === 0 && (
                <div style={{ textAlign:"center", color:"#888", fontSize:14, padding:"30px 0", lineHeight:1.8 }}>
                  {lang === "tr" ? "Bu terim bulunamadı." : "No matching term."}
                </div>
              )}

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
                <button onClick={() => { setShowKilavuz(false); setKilavuzQ(""); }} style={{ background:"linear-gradient(135deg,rgba(192,57,43,0.4),rgba(192,57,43,0.25))",border:"1px solid rgba(192,57,43,0.35)",borderRadius:100,padding:"12px 36px",cursor:"pointer",color:"#cccccc",fontFamily:"'Jost',sans-serif",fontSize:14,letterSpacing:2.5,textTransform:"uppercase",transition:"all 0.2s" }}
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
                {t("license_title")}
              </h3>
            </div>
            <p style={{ fontFamily:"'Inter',sans-serif",fontSize:14,color:"#999999",lineHeight:1.8,textAlign:"center",margin:"0 0 20px" }}>
              {t("license_desc")}
            </p>
            <input
              type="text"
              className="sakin-input"
              placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
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
              {licenseLoading ? t("license_validating") : t("license_activate")}
            </button>
            <button onClick={() => setShowLicenseModal(false)}
              style={{ width:"100%",marginTop:8,padding:"10px 0",background:"transparent",border:"none",color:"#666",fontSize:13,letterSpacing:1.5,cursor:"pointer",fontFamily:"'Jost',sans-serif" }}>
              {t("common_cancel")}
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
