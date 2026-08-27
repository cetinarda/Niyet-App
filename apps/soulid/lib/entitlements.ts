'use client';

// Freemium modeli:
//  - ÜCRETSİZ: kendi karne (metin/analiz/AI) + ikili uyum (derin analiz dahil).
//  - PREMIUM: SADECE kendi haritada yıldız/gezegen konumu + hareketi
//    (3D Güneş Sistemi, Yaşam Ağacı, zodyak çemberi). $19.99 tek seferlik
//    ya da $4.99/ay. Web'de Stripe, iOS'ta RevenueCat IAP.
//
// CANONICAL SOURCE: Supabase 'entitlements' tablosu (web) + RevenueCat
// entitlement (iOS). localStorage UI cache; grantPremium() satın alım/restore/
// webhook sonrası yazar. hasPremium() her iki platformda localStorage okur.

import { getSupabase } from './supabase';
import { FREE_MODE } from './feature-flags';

const KEY_PREMIUM = 'soulprofile.premium';
const KEY_PREMIUM_TS = 'soulprofile.premium.checkedAt';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export function hasPremium(): boolean {
  // Lansman: mağazalarda yayınlanana kadar her şey ücretsiz → herkes premium.
  if (FREE_MODE) return true;
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(KEY_PREMIUM) === '1';
}

export function grantPremium() {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(KEY_PREMIUM, '1');
    localStorage.setItem(KEY_PREMIUM_TS, String(Date.now()));
  }
}

export function revokePremium() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(KEY_PREMIUM);
    localStorage.removeItem(KEY_PREMIUM_TS);
  }
}

/**
 * Canonical entitlement check — Supabase'ten okur, localStorage'ı senkronlar.
 * Boot'ta + premium-gated aksiyon öncesi çağrılmalı.
 */
export async function refreshEntitlement(): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return hasPremium();
  try {
    const { data: userResult } = await sb.auth.getUser();
    const user = userResult?.user;
    if (!user) return hasPremium();

    const { data, error } = await sb
      .from('entitlements')
      .select('active, expires_at')
      .eq('user_id', user.id)
      .eq('entitlement', 'premium')
      .eq('active', true)
      .limit(1);

    if (error) return hasPremium();

    const row = data?.[0] as { active?: boolean; expires_at?: string | null } | undefined;
    const valid = !!row?.active && (!row.expires_at || new Date(row.expires_at).getTime() > Date.now());

    if (valid) grantPremium();
    else revokePremium();
    return valid;
  } catch {
    return hasPremium();
  }
}

/** localStorage cache 24 saatten eski mi? */
export function isCacheStale(): boolean {
  if (typeof localStorage === 'undefined') return true;
  const ts = Number(localStorage.getItem(KEY_PREMIUM_TS) ?? '0');
  return Date.now() - ts > CACHE_TTL_MS;
}

export function togglePremium(): boolean {
  if (hasPremium()) {
    revokePremium();
    return false;
  }
  grantPremium();
  return true;
}

// ─────────────────────────────────────────────────────────────
// Gate API'si — id-tabanlı (deterministik karne/uyum kimliği):
//  - ÜCRETSİZ: 1 karne (kişi) + 1 uyum (çift), TAM özellikli.
//  - Aynı kişiyi/çifti tekrar görmek yeni sayılmaz (id eşleşir).
//  - Farklı kişi/çift → premium ($19.99 tek seferlik / $4.99 ay) = sınırsız.
// Böylece aynı cihazdan bedavaya farklı kişilere bakmanın önü kesilir.

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

/** Bu karne (id) görülebilir mi? Premium ya da ilk/aynı kişi ise evet. */
export function canViewReport(reportId: string): boolean {
  if (hasPremium()) return true;
  const used = readSet(KEY_REPORT_IDS);
  return used.has(reportId) || used.size < FREE_REPORT_LIMIT;
}
export function recordReportView(reportId: string): void {
  if (hasPremium()) return;
  addToSet(KEY_REPORT_IDS, reportId);
}

/** Bu uyum (çift id) görülebilir mi? */
export function canViewCompat(compatId: string): boolean {
  if (hasPremium()) return true;
  const used = readSet(KEY_COMPAT_IDS);
  return used.has(compatId) || used.size < FREE_COMPAT_LIMIT;
}
export function recordCompatView(compatId: string): void {
  if (hasPremium()) return;
  addToSet(KEY_COMPAT_IDS, compatId);
}

/** İki doğum-anahtarından sıralı, deterministik çift kimliği. */
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
