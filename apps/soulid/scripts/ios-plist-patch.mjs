#!/usr/bin/env node
/**
 * iOS Info.plist yamacı — `npx cap sync` SONRASI çalışır (npm scriptlerine bağlı).
 *
 * NEDEN VAR:
 *   `npx cap add ios` temiz bir Info.plist üretir; Apple'ın zorunlu privacy
 *   "usage description" anahtarları OTOMATİK gelmez. `NSCameraUsageDescription`
 *   eksikken kullanıcı "Take Photo" dediğinde iOS uygulamayı ANINDA öldürür
 *   (error değil, native crash). App Store reddi: Guideline 2.1(a).
 *   Bu script eksik anahtarları idempotent şekilde ekleyerek crash'i kökten keser.
 *
 * KULLANIM:
 *   node scripts/ios-plist-patch.mjs        (npm run cap:sync / cap:ios otomatik çağırır)
 *
 * GÜVENLİ: sadece EKSİK anahtarları ekler; var olanlara dokunmaz. Tekrar tekrar
 * çalıştırılabilir (ikinci çalıştırmada "değişiklik yok" der).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const APP_DIR = 'ios/App/App';
const PLIST = `${APP_DIR}/Info.plist`;

// Uygulama tr + en olarak lokalize. Info.plist'teki TABAN metinler geliştirme
// dili (en) olmalı; her dilin karşılığı .lproj/InfoPlist.strings'ten gelir.
//
// NEDEN: Guideline 4 reddi — "permissions requests are not written in the same
// language as the app's localization". İngilizce cihazda uygulama İngilizce
// açılıyor ama izin diyalogları Türkçe çıkıyordu. İzin metinleri de UI ile
// AYNI dilde olmak zorunda.
const USAGE_KEYS = ['NSCameraUsageDescription', 'NSPhotoLibraryUsageDescription', 'NSPhotoLibraryAddUsageDescription'];

const USAGE_TEXT = {
  en: {
    NSCameraUsageDescription:
      'SoulProfile needs your camera only if you choose to take a profile photo for your cosmic report. You can skip this step.',
    NSPhotoLibraryUsageDescription:
      'SoulProfile needs your photo library to place a profile photo on your cosmic report. The photo stays on your device.',
    NSPhotoLibraryAddUsageDescription:
      'SoulProfile needs permission to save your shareable report to your photo library as a PNG.',
  },
  tr: {
    NSCameraUsageDescription:
      'Karnen için anlık bir profil fotoğrafı çekmek istersen kameran gerekiyor. İstemezsen bu adımı atlayabilirsin.',
    NSPhotoLibraryUsageDescription:
      'Profil fotoğrafını galaktik karnenin üzerine basmak için galerin gerekiyor. Fotoğraf cihazında kalır, hiçbir sunucuya yüklenmez.',
    NSPhotoLibraryAddUsageDescription:
      'Hazırladığın paylaşılabilir karneyi cihazına PNG olarak kaydetmek için galeri yazma izni gerekiyor.',
  },
};

// Taban (fallback) dil = en. Cihaz dili tr ise tr.lproj devreye girer.
const STRING_KEYS = USAGE_KEYS.map((k) => [k, USAGE_TEXT.en[k]]);

// Export compliance — her build'de manuel "encryption var mı" sorusunu keser
const BOOL_KEYS = [['ITSAppUsesNonExemptEncryption', false]];

// Apple'a hangi dilleri desteklediğimizi bildir — App Store dil listesi + izin
// diyaloglarının doğru .lproj'den okunması için gerekli.
const ARRAY_KEYS = [['CFBundleLocalizations', ['en', 'tr']]];

function hasKey(xml, name) {
  return new RegExp(`<key>\\s*${name}\\s*</key>`).test(xml);
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function insertBeforeRootDictClose(xml, block) {
  // Kök <dict>'in kapanışı dosyadaki SON </dict>'tir (iç içe dict'ler daha önce kapanır).
  const idx = xml.lastIndexOf('</dict>');
  if (idx === -1) throw new Error('Geçersiz Info.plist: </dict> bulunamadı.');
  return xml.slice(0, idx) + block + xml.slice(idx);
}

/**
 * Var olan bir <key>/<string> çiftinin DEĞERİNİ değiştirir.
 * Sadece eklemek yetmez: daha önce üretilmiş ios/ klasörlerinde taban metinler
 * Türkçe kalmıştı ve "yalnız eksikse ekle" mantığı düzeltmeyi sessizce atlıyordu.
 */
function replaceStringValue(xml, name, value) {
  const re = new RegExp(`(<key>\\s*${name}\\s*</key>\\s*<string>)([\\s\\S]*?)(</string>)`);
  if (!re.test(xml)) return { xml, changed: false };
  let changed = false;
  const next = xml.replace(re, (_m, open, current, close) => {
    if (current === escapeXml(value)) return `${open}${current}${close}`;
    changed = true;
    return `${open}${escapeXml(value)}${close}`;
  });
  return { xml: next, changed };
}

/** .lproj/InfoPlist.strings — dil başına izin metinleri. */
function writeLprojStrings() {
  const written = [];
  for (const [lang, map] of Object.entries(USAGE_TEXT)) {
    const dir = join(APP_DIR, `${lang}.lproj`);
    mkdirSync(dir, { recursive: true });
    const body =
      `/* SoulProfile — izin metinleri (${lang}). scripts/ios-plist-patch.mjs üretir. */\n` +
      USAGE_KEYS.map((k) => `"${k}" = "${map[k].replace(/"/g, '\\"')}";`).join('\n') +
      '\n';
    const file = join(dir, 'InfoPlist.strings');
    const prev = existsSync(file) ? readFileSync(file, 'utf8') : null;
    if (prev !== body) {
      writeFileSync(file, body, 'utf8');
      written.push(`${lang}.lproj/InfoPlist.strings`);
    }
  }
  return written;
}

function main() {
  if (!existsSync(PLIST)) {
    console.error(`✗ ${PLIST} yok. Önce native projeyi üret:  npm run cap:add:ios`);
    process.exit(1);
  }

  let xml = readFileSync(PLIST, 'utf8');
  const added = [];

  for (const [name, value] of STRING_KEYS) {
    if (hasKey(xml, name)) continue;
    xml = insertBeforeRootDictClose(xml, `\t<key>${name}</key>\n\t<string>${escapeXml(value)}</string>\n`);
    added.push(name);
  }

  for (const [name, value] of BOOL_KEYS) {
    if (hasKey(xml, name)) continue;
    xml = insertBeforeRootDictClose(xml, `\t<key>${name}</key>\n\t<${value}/>\n`);
    added.push(name);
  }

  for (const [name, values] of ARRAY_KEYS) {
    if (hasKey(xml, name)) continue;
    const items = values.map((v) => `\t\t<string>${escapeXml(v)}</string>`).join('\n');
    xml = insertBeforeRootDictClose(xml, `\t<key>${name}</key>\n\t<array>\n${items}\n\t</array>\n`);
    added.push(name);
  }

  // Taban metinleri İngilizce'ye SABİTLE — eski Türkçe taban metinler burada
  // düzeltilir (Guideline 4 reddinin kaynağı).
  const updated = [];
  for (const [name, value] of STRING_KEYS) {
    const r = replaceStringValue(xml, name, value);
    xml = r.xml;
    if (r.changed) updated.push(name);
  }

  const localized = writeLprojStrings();

  if (added.length === 0 && updated.length === 0 && localized.length === 0) {
    console.log('✓ Info.plist + lokalizasyonlar güncel — değişiklik yok.');
    return;
  }

  writeFileSync(PLIST, xml, 'utf8');
  if (added.length) {
    console.log('✓ Info.plist — eklenen anahtarlar:');
    for (const k of added) console.log(`    • ${k}`);
  }
  if (updated.length) {
    console.log('✓ Info.plist — taban metin İngilizce\'ye çekildi (Guideline 4):');
    for (const k of updated) console.log(`    • ${k}`);
  }
  if (localized.length) {
    console.log('✓ Lokalize izin metinleri yazıldı:');
    for (const f of localized) console.log(`    • ${f}`);
    console.log('\n  ⚠️  Xcode: en.lproj ve tr.lproj klasörlerini proje ağacına EKLE');
    console.log('     (Add Files to "App"… → Create folder references DEĞİL, groups).');
    console.log('     Target Membership → App işaretli olmalı, yoksa binary\'ye girmez.');
  }
  console.log('\n  Sonraki adım: Xcode → build numarasını artır → Archive → Upload.');
}

main();
