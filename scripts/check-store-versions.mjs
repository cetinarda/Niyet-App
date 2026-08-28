#!/usr/bin/env node
/**
 * MAĞAZA SÜRÜM BEKÇİSİ
 *
 * App Store ve Google Play'de CANLI olan sürümleri sorgular ve
 * public/latest-ios-version.json'u günceller. Bu dosya uygulama içi
 * "yeni sürüm var" banner'ını besler (bkz. src/App.jsx → updateInfo).
 *
 * NEDEN VAR: bu bump elle yapılıyordu ve UNUTULUYORDU, 1.3.5 ve 1.3.6
 * yayınlandığı hâlde dosya 1.3.4'te kaldığı için kullanıcıların aylarca
 * güncellemeden haberi olmadı. Artık günlük cron ile kendiliğinden işler.
 *
 * KIRMIZI ÇİZGİ: bir sürüm ancak MAĞAZADA GERÇEKTEN GÖRÜNDÜĞÜNDE yazılır.
 * Repodaki sürüm asla referans alınmaz, aksi hâlde mağazada olmayan bir
 * sürüm için herkese sahte bildirim gider (1.3.4'te yaşandı, Altın Kural #4).
 *
 * Kullanım:
 *   node scripts/check-store-versions.mjs          # gerekiyorsa dosyayı güncelle
 *   node scripts/check-store-versions.mjs --check  # sadece raporla, YAZMA
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const JSON_PATH = resolve(__dirname, "../public/latest-ios-version.json");

const APPLE_ID = "6765619382";
const ANDROID_PKG = "com.sakin.app";
const CHECK_ONLY = process.argv.includes("--check");

const VER_RE = /^\d+\.\d+(\.\d+)?$/;

function cmpVer(a, b) {
  const pa = String(a || "").split(".").map(n => parseInt(n) || 0);
  const pb = String(b || "").split(".").map(n => parseInt(n) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0, y = pb[i] || 0;
    if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
}

async function fetchText(url) {
  const r = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
    signal: AbortSignal.timeout(20000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.text();
}

async function liveIOS() {
  const txt = await fetchText(`https://itunes.apple.com/lookup?id=${APPLE_ID}`);
  const d = JSON.parse(txt);
  if (!d.resultCount) throw new Error("App Store kaydı bulunamadı");
  const v = d.results[0].version;
  if (!VER_RE.test(v)) throw new Error(`beklenmeyen sürüm biçimi: ${v}`);
  return v;
}

async function liveAndroid() {
  // Play Store'un resmî public API'si yok; ürün sayfasındaki gömülü veriden okunur.
  // Biçim değişirse burası throw eder ve o platform ATLANIR (dosya bozulmaz).
  const html = await fetchText(
    `https://play.google.com/store/apps/details?id=${ANDROID_PKG}&hl=en`
  );
  const cands = [...html.matchAll(/\[\[\["(\d+\.\d+(?:\.\d+)?)"\]\]/g)].map(m => m[1]);
  if (!cands.length) throw new Error("Play Store sürümü sayfadan okunamadı");
  // Birden fazla eşleşirse en büyüğünü al (sayfada başka sürüm dizeleri olabilir).
  return cands.sort(cmpVer)[cands.length - 1];
}

const settle = async (label, fn) => {
  try { return { ok: true, v: await fn() }; }
  catch (e) { console.warn(`⚠️  ${label} okunamadı: ${e.message}`); return { ok: false }; }
};

const [ios, android] = await Promise.all([
  settle("App Store", liveIOS),
  settle("Play Store", liveAndroid),
]);

if (!ios.ok && !android.ok) {
  console.error("✖ İki mağaza da okunamadı, dosyaya DOKUNULMADI.");
  process.exit(1);
}

const data = JSON.parse(readFileSync(JSON_PATH, "utf8"));
data.ios = data.ios || { version: data.version };
data.android = data.android || { version: data.version };

const before = JSON.stringify(data);
let changed = false;

for (const [key, res] of [["ios", ios], ["android", android]]) {
  if (!res.ok) continue;
  const cur = data[key].version;
  const cmp = cmpVer(cur, res.v);
  if (cmp < 0) {
    console.log(`↑ ${key}: ${cur} → ${res.v} (mağazada canlı)`);
    data[key].version = res.v;
    // Notları TEMİZLE: otomatik bump'ta doğru notu bilemeyiz ve eski sürümün
    // notunu göstermek yanlış olur. Uygulama boş notta genel metne düşer
    // ("Hazır olduğunda göz atabilirsin": i18n update_default_notes).
    data[key].release_notes_tr = "";
    data[key].release_notes_en = "";
    changed = true;
  } else if (cmp > 0) {
    // Dosya mağazadan İLERİDE: sahte bildirim riski. Geri çekiyoruz.
    console.log(`↓ ${key}: ${cur} → ${res.v} (dosya mağazadan ileriydi, düzeltildi)`);
    data[key].version = res.v;
    changed = true;
  } else {
    console.log(`= ${key}: ${cur} (değişiklik yok)`);
  }
}

// Üst seviye `version`: 1.3.6 ve ÖNCESİ istemciler platform alanlarını okumuyor.
// İkisinin KÜÇÜĞÜ yazılır ki eski istemci hiçbir platformda olmayan bir sürüme
// yönlendirilmesin.
const legacy = cmpVer(data.ios.version, data.android.version) <= 0
  ? data.ios.version : data.android.version;
if (data.version !== legacy) {
  console.log(`≈ geriye uyumlu 'version': ${data.version} → ${legacy}`);
  data.version = legacy;
  data.release_notes_tr = "";
  data.release_notes_en = "";
  changed = true;
}

if (!changed) { console.log("✓ Güncel: yazmaya gerek yok."); process.exit(0); }
if (CHECK_ONLY) { console.log("--check: değişiklik GEREKİYOR ama yazılmadı."); process.exit(2); }
if (JSON.stringify(data) === before) process.exit(0);

writeFileSync(JSON_PATH, JSON.stringify(data, null, 2) + "\n");
console.log("✓ public/latest-ios-version.json güncellendi.");
