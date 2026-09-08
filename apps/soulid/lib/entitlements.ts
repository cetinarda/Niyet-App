'use client';

// PREMIUM KAYNAGI = SAKIN (host). SoulID kendi odeme altyapisini (RevenueCat
// IAP + Stripe) ARTIK KULLANMIYOR (kullanici karari: "soul profile revenuecat
// odeme altyapisini tamamen kaldir"). SoulID embed'i Sakin ile AYNI origin'de
// servis edildigi icin host'un premium bayragini (sakin_premium) dogrudan
// localStorage'dan okur. Premium satin alma Sakin'in kendi paywall'inda
// (cc.fovea IAP, calisiyor) yapilir; ikili uyum kilidine takilan kullanici
// PremiumGate uzerinden host'a "sakin-premium-cta" postMessage'i gonderilir,
// host embed'i kapatip fiyat ekranini acar.
//
// FREEMIUM (kullanici karari):
//  - Kendi karne (metin/analiz/AI/gorseller): HER ZAMAN ucretsiz (FREE_MODE).
//  - Ikili uyum: 1 CIFT ucretsiz, 2. cift Sakin premium ister. Bu kural
//    FREE_MODE'dan BAGIMSIZ isler (yoksa gate hic tetiklenmezdi).

import { FREE_MODE } from './feature-flags';

// Sakin host premium bayragi (App.jsx localStorage'a yazar, ayni origin).
function sakinPremium(): boolean {
  if (typeof localStorage === 'undefined') return false;
  try { return localStorage.getItem('sakin_premium') === '1'; } catch { return false; }
}

// "Tam erisim" (karne gorselleri vb. icin). Lansmanda FREE_MODE herkese acar;
// ayrica Sakin premium da acar. Ikili uyum kilidi bunu KULLANMAZ (asagi bak).
export function hasPremium(): boolean {
  if (FREE_MODE) return true;
  return sakinPremium();
}

// DevToggle (yalnizca gelistirme) icin: Sakin premium bayragini elle cevir.
export function togglePremium(): boolean {
  if (typeof localStorage === 'undefined') return false;
  const now = !sakinPremium();
  try {
    if (now) localStorage.setItem('sakin_premium', '1');
    else localStorage.removeItem('sakin_premium');
  } catch { /* sessiz */ }
  return now;
}

// ─────────────────────────────────────────────────────────────
// Gate API'si: id-tabanlı (deterministik karne/uyum kimligi):
//  - Aynı kişiyi/çifti tekrar görmek yeni sayilmaz (id eslesir).
//  - Karne: FREE_MODE'da sinirsiz ucretsiz.
//  - Uyum: 1 cift ucretsiz, sonrasi Sakin premium.

const KEY_REPORT_IDS = 'soulprofile.used.reports';
const KEY_COMPAT_IDS = 'soulprofile.used.compat';

export const FREE_REPORT_LIMIT = 1;
export const FREE_COMPAT_LIMIT = 1;

function readSet(key: string): Set<string> {
  if (typeof localStorage === 'undefined') return new Set();
  try {
    const arr = JSON.parse(localStorage.getItem(key) ?? '[]');
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}
function addToSet(key: string, id: string) {
  if (typeof localStorage === 'undefined') return;
  const s = readSet(key);
  s.add(id);
  localStorage.setItem(key, JSON.stringify([...s]));
}

/** Bu karne (id) gorulebilir mi? Karne ucretsiz kaliyor (FREE_MODE/premium). */
export function canViewReport(reportId: string): boolean {
  if (hasPremium()) return true;
  const used = readSet(KEY_REPORT_IDS);
  return used.has(reportId) || used.size < FREE_REPORT_LIMIT;
}
export function recordReportView(reportId: string): void {
  if (hasPremium()) return;
  addToSet(KEY_REPORT_IDS, reportId);
}

/**
 * Bu uyum (cift id) gorulebilir mi?
 * FREE_MODE'a BAKMAZ (karneden farkli): yalnizca Sakin premium sinirsiz acar.
 * Boylece 1 cift ucretsiz, 2. cift premium kurali lansmanda da isler.
 */
export function canViewCompat(compatId: string): boolean {
  if (sakinPremium()) return true;
  const used = readSet(KEY_COMPAT_IDS);
  return used.has(compatId) || used.size < FREE_COMPAT_LIMIT;
}
export function recordCompatView(compatId: string): void {
  if (sakinPremium()) return;
  addToSet(KEY_COMPAT_IDS, compatId);
}

/** İki dogum-anahtarindan sirali, deterministik cift kimligi. */
export function compatId(keyA: string, keyB: string): string {
  return [keyA, keyB].sort().join('~');
}

export function reportCount(): number { return readSet(KEY_REPORT_IDS).size; }
export function compatCount(): number { return readSet(KEY_COMPAT_IDS).size; }
export function resetUsage(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(KEY_REPORT_IDS);
  localStorage.removeItem(KEY_COMPAT_IDS);
}
