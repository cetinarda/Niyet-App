#!/usr/bin/env node
// Telefon paketinden (iOS / Android) web'e özgü dosyaları çıkarır.
//
// Neden: Vite `public/` klasörünün tamamını `dist/`e kopyalıyor, Capacitor da
// `dist/`in tamamını uygulamanın içine koyuyor. Böylece yalnızca sakin.life web
// sitesinde kullanılan blog, tanıtım sayfaları, gizlilik/şartlar sayfaları ve site
// dosyaları (~8 MB) her iOS/Android paketine de giriyordu. Uygulama bunlara zaten
// https://sakin.life adresinden (dış tarayıcıyla) gidiyor, içerideki kopyayı hiç açmıyor.
//
// Nasıl: package.json'daki "capacitor:copy:after" kancası (Capacitor CLI, her
// `npx cap sync` / `npx cap copy` sonunda çalıştırır). YALNIZCA native kopyadan
// siler: `dist/` ve web (Netlify) yayını HİÇ etkilenmez.
//
// ⚠️ ASLA HATA VERMEZ (her durumda exit 0): bir sorun olursa silmeden geçer,
// derleme durmaz. Uygulama içinden bu yollardan birine bağlantı eklenirse
// (ör. "/blog/..."), onu aşağıdaki listeden ÇIKAR.
import fs from "node:fs";
import path from "node:path";

const WEB_ONLY = [
  // "audio": meditasyon sesleri SUNUCUDAN çalınır (sakin.life/audio/...), telefona
  // gömülmez (her dosya ~8 MB). Kullanıcı kararı, Eyl 2026.
  "audio",
  "blog", "home", "tanitim", "privacy", "terms", "ios",
  "privacy.html", "terms.html", "site.js", "site.css", "site-i18n.js",
  "og-sakin.png", "sakin-app-icon-2048.png",
];

function sizeOf(p) {
  try {
    const st = fs.statSync(p);
    if (!st.isDirectory()) return st.size;
    return fs.readdirSync(p).reduce((a, f) => a + sizeOf(path.join(p, f)), 0);
  } catch { return 0; }
}

try {
  const root = process.env.CAPACITOR_ROOT_DIR || process.cwd();
  const platform = process.env.CAPACITOR_PLATFORM_NAME;
  const target = platform === "ios" ? path.join(root, "ios", "App", "App", "public")
    : platform === "android" ? path.join(root, "android", "app", "src", "main", "assets", "public")
    : null;
  if (!target || !fs.existsSync(path.join(target, "index.html"))) process.exit(0);
  let freed = 0;
  for (const name of WEB_ONLY) {
    const p = path.join(target, name);
    if (!fs.existsSync(p)) continue;
    freed += sizeOf(p);
    fs.rmSync(p, { recursive: true, force: true });
  }
  console.log(`[prune-native-web] ${platform}: web'e özgü dosyalar çıkarıldı (${(freed / 1048576).toFixed(1)} MB)`);
} catch (e) {
  console.warn("[prune-native-web] atlandı:", e && e.message);
}
process.exit(0);
