#!/usr/bin/env node
// Capacitor build — Next.js static export API route'ları içeremez.
// app/api'yı geçici olarak app/_api'ya taşır (underscore prefix = private folder,
// Next routing'e dahil değil), build sonrası geri alır.

import { renameSync, existsSync, readFileSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const apiDir = join(root, 'app/api');
const hiddenDir = join(root, 'app/_api');

// ─── .env yükleme ───────────────────────────────────────────────────────────
// Bu script `next build`'ten ÖNCE çalışıyor. Next.js kendi .env'ini doğru
// okur ama BU dosyadaki guard kontrolleri process.env'in zaten dolu olduğunu
// varsayıyordu — hiçbir yerde .env'i kendisi okumuyordu. Kabukta gerçek bir
// `export` yoksa (CI secret gibi), .env'deki anahtar burada hep "eksik"
// görünüyordu, build sebepsiz yere reddediliyordu.
function loadDotEnv(path) {
  if (!existsSync(path)) return;
  for (const rawLine of readFileSync(path, 'utf8').split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    // Gerçek kabuk/CI env değişkeni her zaman önceliklidir — .env sadece
    // eksik olanı doldurur.
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadDotEnv(join(root, '.env'));
loadDotEnv(join(root, '.env.local'));

// ─── Submit öncesi zorunlu env kontrolü ────────────────────────────────────
// NEXT_PUBLIC_* değişkenleri BUILD ANINDA bundle'a gömülür. RevenueCat anahtarı
// build sırasında yoksa initIAP() sessizce çıkar, buyOnNative() 'IAP_NOT_READY'
// döner ve kullanıcı satın alma akışında HATA MESAJI görür.
// Bu, Guideline 2.1(b) reddinin doğrudan sebebiydi — anahtarsız binary
// App Store'a gönderilemez, o yüzden build'i burada durduruyoruz.
const REQUIRED_ENV = [
  [
    'NEXT_PUBLIC_REVENUECAT_IOS_KEY',
    'RevenueCat iOS public SDK key (appl_…). Olmadan IAP akışı hata verir → App Store 2.1(b) reddi.',
  ],
];

const missing = REQUIRED_ENV.filter(([name]) => !process.env[name]);
if (missing.length > 0 && !process.env.ALLOW_MISSING_IAP) {
  console.error('\n✗ Capacitor build durduruldu — zorunlu env değişkenleri eksik:\n');
  for (const [name, why] of missing) console.error(`    • ${name}\n      ${why}\n`);
  console.error('  Çözüm: .env dosyana ekle (veya CI secret olarak tanımla), sonra tekrar çalıştır.');
  console.error('  Yalnızca IAP\'siz yerel deneme yapıyorsan: ALLOW_MISSING_IAP=1 npm run build:ios');
  console.error('  ⚠️  ALLOW_MISSING_IAP ile üretilen binary App Store\'a GÖNDERİLEMEZ.\n');
  process.exit(1);
}

// ─── Yanlış anahtar TÜRÜ kontrolü ───────────────────────────────────────────
// RevenueCat dashboard'da iki farklı anahtar var: Test Store key (test_...)
// ve gerçek iOS SDK key (appl_...). Test Store anahtarı satın almaları
// RevenueCat'in SAHTE mağazasına yönlendirir, gerçek StoreKit'e hiç değmez —
// bu yüzden production'da submit edilen build'de daha önce de aynı
// 'IAP_NOT_READY' / satın alma hatası tekrarlandı: env VARDI ama yanlış
// TÜRDEN bir anahtardı (test_...), üretim/App Review'da hiçbir zaman
// çalışmayacaktı. RevenueCat kendisi de bunu üretime göndermeyi yasaklıyor.
const iosKey = process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY;
if (iosKey && !iosKey.startsWith('appl_')) {
  const isTestStoreKey = iosKey.startsWith('test_');
  console.error(`\n✗ Capacitor build durduruldu — NEXT_PUBLIC_REVENUECAT_IOS_KEY yanlış türde bir anahtar:\n`);
  console.error(`    Verilen: ${iosKey.slice(0, 12)}…`);
  if (isTestStoreKey) {
    console.error('    Bu bir RevenueCat TEST STORE anahtarı (test_...) — App Store\'a ASLA gönderilemez.');
    console.error('    Satın almalar gerçek StoreKit\'e değil RevenueCat\'in sahte mağazasına gider.');
  } else {
    console.error('    Beklenen ön ek: appl_ (RevenueCat iOS SDK public key)');
  }
  console.error('\n  Doğru anahtarı al: RevenueCat Dashboard → Project Settings → Apps → (iOS uygulaman)');
  console.error('  → Public app-specific API key (appl_… ile başlar).');
  console.error('  iOS App yoksa: Apps → + New → App Store, Bundle ID gir (life.soulprofile.app).\n');
  process.exit(1);
}

if (process.env.ALLOW_MISSING_IAP && missing.length > 0) {
  console.warn('\n⚠️  ALLOW_MISSING_IAP aktif — IAP devre dışı bir binary üretiliyor.');
  console.warn('   Bu build App Store submit için KULLANILAMAZ.\n');
}

const movedApi = existsSync(apiDir);
if (movedApi) renameSync(apiDir, hiddenDir);

let exitCode = 0;
try {
  execSync('next build', {
    stdio: 'inherit',
    cwd: root,
    env: { ...process.env, BUILD_TARGET: 'capacitor', NEXT_PUBLIC_BUILD_TARGET: 'capacitor' },
  });
} catch (e) {
  exitCode = (e && typeof e === 'object' && 'status' in e ? Number(e.status) : 1) || 1;
} finally {
  if (movedApi && existsSync(hiddenDir)) {
    renameSync(hiddenDir, apiDir);
  }
}

process.exit(exitCode);
