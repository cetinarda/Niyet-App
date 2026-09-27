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

/**
 * SUNUCU KAPISI (1.4.3, kullanici: "ikili uyum her IP icin 1 kez olsun"): yerel kayit
 * uygulamayi silip kurunca / baska tarayicida sifirlaniyordu. Premium degilse ve
 * bu cift yerelde zaten gorulmemisse, netlify `compat-gate`e sorulur: IP basina
 * ilk ucretsiz cift saklanir, farkli cift "denied" alir. Sunucuya dogum bilgisi
 * DEGIL, cift kimliginin kisa ozeti gider. Ag hatasi / bilinmeyen = izin
 * (fail-open; yerel kural zaten calisiyor).
 */
function pairDigest(id: string): string {
  // cyrb53: yalnizca esitlik icin; ters cevrilmesi amaclanmayan kisa ozet.
  let h1 = 0xdeadbeef ^ 7, h2 = 0x41c6ce57 ^ 7;
  for (let i = 0; i < id.length; i++) {
    const c = id.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36).padStart(8, '0');
}
export async function serverAllowsCompat(compatId: string): Promise<boolean> {
  if (sakinPremium()) return true;
  if (readSet(KEY_COMPAT_IDS).has(compatId)) return true;
  try {
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), 6000) : null;
    const r = await fetch('https://sakin.life/.netlify/functions/compat-gate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pair: pairDigest(compatId) }), signal: ctrl ? ctrl.signal : undefined,
    });
    if (timer) clearTimeout(timer);
    const j = await r.json().catch(() => null);
    return !(j && j.verdict === 'denied');
  } catch { return true; }
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
