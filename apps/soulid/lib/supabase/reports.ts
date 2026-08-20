// Supabase yapılandırıldığında karneleri saklar/listeler.
// Yapılandırılmamışsa şifreli localStorage'a düşer — PII koruması.

import { getSupabase } from './index';
import type { GalacticReport, BirthInput } from '../types';
import { secureGet, secureSet, secureRemove } from '../secure-storage';
import { getApiBase } from '../api-base';

const LS_KEY = 'soulprofile.reports.v1';
const LS_COMPAT_KEY = 'soulprofile.compat.v1';

type StoredReport = GalacticReport & { savedAt: string };

// İkili uyum arşivi — bakılan uyum haritaları (şifreli localStorage).
export type StoredCompat = {
  id: string;               // deterministik çift kimliği
  nameA: string;
  nameB: string;
  birthA: BirthInput;       // yeniden açmak için
  birthB: BirthInput;
  scoreOverall: number;
  savedAt: string;
};

export async function saveCompat(entry: Omit<StoredCompat, 'savedAt'>): Promise<void> {
  try {
    const list = (await secureGet<StoredCompat[]>(LS_COMPAT_KEY)) ?? [];
    const dedupe = list.filter((c) => c.id !== entry.id);
    const stored: StoredCompat = { ...entry, savedAt: new Date().toISOString() };
    await secureSet(LS_COMPAT_KEY, [stored, ...dedupe].slice(0, 50));
  } catch {
    /* quota / private mode */
  }
}

export async function listCompat(): Promise<StoredCompat[]> {
  return (await secureGet<StoredCompat[]>(LS_COMPAT_KEY)) ?? [];
}

// Eski/bozuk şemadaki karneler render sırasında .find()! / property erişiminde
// çökebilir. Yüklerken minimum şema doğrulaması yap, bozuk kayıtları sessizce at.
function isValidReport(r: unknown): r is StoredReport {
  if (!r || typeof r !== 'object') return false;
  const x = r as Partial<GalacticReport>;
  return (
    Array.isArray(x.chart?.planets) &&
    x.chart!.planets.length > 0 &&
    !!x.systems?.vedic?.nakshatra &&
    !!x.numerology &&
    !!x.humanDesign &&
    !!x.sections
  );
}

async function loadLocal(): Promise<StoredReport[]> {
  const data = await secureGet<StoredReport[]>(LS_KEY);
  if (!Array.isArray(data)) return [];
  return data.filter(isValidReport);
}

async function saveLocal(reports: StoredReport[]) {
  try {
    await secureSet(LS_KEY, reports);
  } catch {
    /* quota or private mode */
  }
}

export async function saveReport(report: GalacticReport): Promise<StoredReport> {
  const stored: StoredReport = { ...report, savedAt: new Date().toISOString() };

  // 1. LOKAL ÖNCE — şifreli localStorage. iOS native'de hard-reload sonrası
  // /report sayfası activeReportId üzerinden bunu okur. Supabase bekleyemeyiz.
  const list = await loadLocal();
  const dedupe = list.filter((r) => r.id !== stored.id);
  await saveLocal([stored, ...dedupe].slice(0, 30));

  // 2. Supabase fire-and-forget — caller'ı bekletme.
  const sb = getSupabase();
  if (sb) {
    sb.auth.getUser().then(({ data: userResult }) => {
      const user = userResult?.user;
      if (!user) return;
      sb.from('reports')
        .insert({
          user_id: user.id,
          kind: 'galactic',
          payload: report,
          is_premium: false,
        })
        .then(() => {}, () => {});
    }, () => {});
  }

  return stored;
}

export async function listReports(): Promise<StoredReport[]> {
  const sb = getSupabase();
  if (sb) {
    const { data: user } = await sb.auth.getUser();
    if (user?.user) {
      const { data } = await sb
        .from('reports')
        .select('payload, created_at')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(30);
      if (data) {
        return data.map((row) => ({
          ...(row.payload as GalacticReport),
          savedAt: row.created_at as string,
        }));
      }
    }
  }
  return await loadLocal();
}

export async function clearAllReports(): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    const { data: user } = await sb.auth.getUser();
    if (user?.user) {
      await sb.from('reports').delete().eq('user_id', user.user.id);
    }
  }
  secureRemove(LS_KEY);
}

/**
 * Hesap silme — Apple guideline 5.1.1(v) + GDPR Art.17.
 * 1. Auth'lu kullanıcının profil + reports + entitlements satırlarını siler
 * 2. Storage'daki fotoğraf blob'larını temizler
 * 3. localStorage'ı sıfırlar
 * 4. Session'dan çıkış yapar
 *
 * Auth.users tablosunun kendisi service_role gerektirdiği için Supabase
 * Edge Function'a delegate edilebilir; bu fonksiyon o noktayı çağırır.
 */
export async function purgeAccount(): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) {
    if (typeof localStorage !== 'undefined') localStorage.clear();
    return { ok: true };
  }
  try {
    const { data: userResult } = await sb.auth.getUser();
    const user = userResult?.user;
    if (!user) {
      if (typeof localStorage !== 'undefined') localStorage.clear();
      return { ok: true };
    }

    // 1. Storage fotoğrafları (varsa)
    const { data: profileRow } = await sb
      .from('profiles')
      .select('photo_path')
      .eq('user_id', user.id)
      .maybeSingle();
    const photoPath = (profileRow as { photo_path?: string } | null)?.photo_path;
    if (photoPath) {
      await sb.storage.from('photos').remove([photoPath]).catch(() => null);
    }

    // 2. PII içeren DB satırları — reports + entitlements + profiles cascade
    await Promise.allSettled([
      sb.from('reports').delete().eq('user_id', user.id),
      sb.from('entitlements').delete().eq('user_id', user.id),
      sb.from('subscriptions').delete().eq('user_id', user.id),
      sb.from('stripe_customers').delete().eq('user_id', user.id),
      sb.from('profiles').delete().eq('user_id', user.id),
    ]);

    // 3. Auth user'ın kendisini Edge Function ile sil (service_role gerektirir).
    try {
      const { data: sessionData } = await sb.auth.getSession();
      const token = sessionData.session?.access_token;
      if (token) {
        // iOS Capacitor: capacitor:// origin'de relative /api yok; api-base
        // production host'a yönlendiriyor.
        await fetch(`${getApiBase()}/api/account/delete`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      /* Edge Function yoksa geç — DB satırları zaten silindi */
    }

    await sb.auth.signOut();
    if (typeof localStorage !== 'undefined') localStorage.clear();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Silme başarısız' };
  }
}
