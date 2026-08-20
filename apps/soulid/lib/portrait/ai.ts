// AI kahraman portresi — istemci tarafı.
// Fotoğrafı /api/ai/portrait Edge route'una gönderir (anahtar server-side).
// Sonuç ÖNBELLEĞE alınır: her görüntülemede yeniden üretmek pahalıdır ve
// karakterin her seferinde değişmesi "otantik" hissi bozar.

import type { GalacticReport } from '../types';
import { getApiBase } from '../api-base';
import { secureGet, secureSet } from '../secure-storage';

const CACHE_PREFIX = 'soulprofile.heroPortrait.v1.';

export type AiPortraitResult =
  | { ok: true; dataUrl: string }
  | { ok: false; fallback: boolean; error: string };

/** Üretilmiş portre önbellekten (karne id'sine bağlı). */
export async function getCachedPortrait(reportId: string): Promise<string | null> {
  try {
    return (await secureGet<string>(CACHE_PREFIX + reportId)) ?? null;
  } catch {
    return null;
  }
}

async function cachePortrait(reportId: string, dataUrl: string): Promise<void> {
  try {
    await secureSet(CACHE_PREFIX + reportId, dataUrl);
  } catch {
    /* kota dolu / private mode — önbelleksiz devam */
  }
}

/**
 * Fotoğrafı AI ile RPG karakter portresine çevirir.
 * ÖNEMLİ: Bu çağrı kullanıcının fotoğrafını üçüncü taraf görsel sağlayıcısına
 * gönderir — yalnız kullanıcının açık eylemiyle (butona basma) çağrılmalıdır.
 */
export async function generateAiPortrait(report: GalacticReport): Promise<AiPortraitResult> {
  const photo = report.birth.photoUri;
  if (!photo) return { ok: false, fallback: true, error: 'Fotoğraf yok' };

  const sun = report.chart.planets.find((p) => p.name === 'Sun');

  try {
    const res = await fetch(`${getApiBase()}/api/ai/portrait`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: photo,
        race: report.origin.race,
        hdType: report.humanDesign.type,
        sunSign: sun?.sign,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      dataUrl?: string;
      error?: string;
      fallback?: boolean;
    };

    if (!res.ok || !data.dataUrl) {
      return {
        ok: false,
        fallback: data.fallback === true,
        error: data.error ?? 'Portre üretilemedi',
      };
    }

    await cachePortrait(report.id, data.dataUrl);
    return { ok: true, dataUrl: data.dataUrl };
  } catch {
    return { ok: false, fallback: true, error: 'Bağlantı hatası' };
  }
}
