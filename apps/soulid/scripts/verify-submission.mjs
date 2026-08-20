#!/usr/bin/env node
// Pre-submission verifikasyon — TestFlight upload öncesi çalıştır:
//   node scripts/verify-submission.mjs
// Hatalı olan her satır exit code 1 ile gelir.

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const errors = [];
const warnings = [];

function read(p) {
  try { return readFileSync(join(root, p), 'utf8'); }
  catch { return null; }
}

// 1. Bundle ID + IAP product ID tutarlılığı
const cap = read('capacitor.config.ts') ?? '';
const skus = read('lib/payments/skus.ts') ?? '';
const iap = read('lib/payments/iap.ts') ?? '';

const BUNDLE_ID = 'life.soulprofile.app';
const PRODUCT_ID = 'life.soulprofile.app.unlock';

if (!cap.includes(`appId: '${BUNDLE_ID}'`)) {
  errors.push(`Bundle ID capacitor.config.ts'de '${BUNDLE_ID}' değil.`);
}
if (!iap.includes(PRODUCT_ID)) {
  errors.push(`APPLE_PRODUCT_ID lib/payments/iap.ts'de '${PRODUCT_ID}' bulunamadı.`);
}
// skus.ts artık paid-app modeli için Apple ID içermez; bu OK.

// 2. DevToggle production safety
const devToggle = read('components/DevToggle.tsx') ?? '';
if (!devToggle.includes('NEXT_PUBLIC_SHOW_DEV_TOGGLE') || !devToggle.includes('NODE_ENV')) {
  errors.push("DevToggle env-gate kayıp — production'da gizlenemeyebilir.");
}

// 3. Privacy manifest
if (!existsSync(join(root, 'resources/PrivacyInfo.xcprivacy'))) {
  errors.push('resources/PrivacyInfo.xcprivacy yok — submission engellenir.');
}

// 4. Restore Purchases butonu
const premiumPage = read('app/premium/page.tsx') ?? '';
if (!premiumPage.includes('restorePurchases') || !/restore previous purchase|önceki satın alımı geri yükle/i.test(premiumPage)) {
  errors.push('Premium sayfasında Restore Purchases yok — Apple 3.1.1 reddine sebep olur.');
}

// 5. Disclaimer 3 yerde
const footer = read('components/Footer.tsx') ?? '';
const i18nMsgs = read('lib/i18n/messages.ts') ?? '';
const reportCard = read('components/ReportCard.tsx') ?? '';

if (!footer.includes('footer.disclaimer') || !i18nMsgs.includes("'footer.disclaimer'")) {
  errors.push('Footer disclaimer bulunamadı.');
}
if (!/Sembolik gözlem|symbolic observation/i.test(reportCard)) {
  errors.push("ReportCard'da disclaimer bulunamadı (paylaşılabilir kartın alt köşesinde gerekli).");
}

// 6. 4.3 spam yasak kelimeler (i18n mesajlarda)
const FORBIDDEN = ['horoscope', 'fortune teller', 'psychic', 'twin flame', 'prophecy'];
for (const w of FORBIDDEN) {
  const matches = i18nMsgs.match(new RegExp(`\\b${w}\\b`, 'i'));
  if (matches) {
    warnings.push(`i18n mesajlarda yasak kelime: "${w}" — App Store metinleri ile karıştırma.`);
  }
}

// 6b. NEXT_PUBLIC_ANTHROPIC_API_KEY hâlâ kullanılıyor mu? (regression)
const grepDir = (dir) => {
  const lib = read(`${dir}`) ?? '';
  if (/NEXT_PUBLIC_ANTHROPIC_API_KEY/.test(lib)) {
    errors.push(`${dir}: NEXT_PUBLIC_ANTHROPIC_API_KEY tarayıcıya inlinelanır. Server-only ANTHROPIC_API_KEY kullan.`);
  }
};
[
  'lib/narrative/index.ts',
  'lib/compatibility/narrative.ts',
  'lib/compatibility/deep-analysis.ts',
].forEach(grepDir);

// 6c. dangerouslyAllowBrowser kullanımı (client-side Anthropic SDK regression)
const envExample = read('.env.example') ?? '';
if (/^NEXT_PUBLIC_ANTHROPIC_API_KEY/m.test(envExample)) {
  errors.push('.env.example NEXT_PUBLIC_ANTHROPIC_API_KEY içeriyor — server-only ANTHROPIC_API_KEY olmalı.');
}

// 7. ITS encryption flag bahsi (info.plist doc'unda)
const uploadDoc = read('docs/APP_STORE_UPLOAD.md') ?? '';
if (!uploadDoc.includes('ITSAppUsesNonExemptEncryption')) {
  warnings.push('APP_STORE_UPLOAD.md ITSAppUsesNonExemptEncryption bahsetmiyor.');
}

// 8. @capacitor/haptics optional dep var mı
const pkg = JSON.parse(read('package.json') ?? '{}');
const haptics = pkg.optionalDependencies?.['@capacitor/haptics'];
if (!haptics) {
  warnings.push('@capacitor/haptics optionalDependencies\'de yok — iOS\'ta sessiz fallback olur ama önerilir.');
}

// Çıktı
console.log('\n=== SoulProfile Submission Verification ===\n');

if (errors.length === 0) {
  console.log('✓ Kritik kontrolleri geçti.');
} else {
  console.log(`✗ ${errors.length} kritik hata:`);
  errors.forEach((e) => console.log('  • ' + e));
}

if (warnings.length > 0) {
  console.log(`\n⚠  ${warnings.length} uyarı:`);
  warnings.forEach((w) => console.log('  • ' + w));
}

console.log('\nManuel kontrol gerektiren:');
console.log('  • Xcode Info.plist → NSCameraUsageDescription, NSPhotoLibraryUsageDescription');
console.log('  • Xcode Info.plist → ITSAppUsesNonExemptEncryption=NO (Boolean)');
console.log('  • CFBundleVersion her TestFlight upload için +1');
console.log('  • Sandbox tester ile satın alma + restore testi');
console.log('  • Apple Reviewer Notes: docs/APP_STORE_LESSONS.md');
console.log('');

process.exit(errors.length > 0 ? 1 : 0);
