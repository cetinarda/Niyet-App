// Sakin köprüsü — Sakin ana uygulamasında doğum bilgisi girilmişse, SoulID
// açılışta AYNI localStorage'ı (aynı origin, embed statik bundle olarak
// /embedded/soulid/ altından servis edilir) senkron okuyup karneyi otomatik
// üretir. Kullanıcı SoulID içinde doğum formunu TEKRAR doldurmaz.
//
// Yalnızca Sakin'den açılan embed'de anlamlıdır: bağımsız soulprofile.life
// sitesinde bu anahtarlar hiç yazılmaz (farklı origin), fonksiyon sessizce
// no-op döner — ekstra bir "Sakin embed mi?" bayrağına gerek yok.
//
// KİŞİSEL VERİ: isim/doğum tarihi-saati/şehir zaten Sakin tarafında var;
// burada başka hiçbir yere gönderilmez, yalnızca yerel karne hesaplanır.

import { geocodePlace } from './geocoding';
import { buildGalacticReport } from './report';
import { canViewReport, recordReportView } from './entitlements';
import { saveReport } from './supabase/reports';
import { setActiveReportId } from './active-report';
import type { Locale } from './i18n/store';

const DONE_KEY = 'soulprofile.sakinBridgeDone';

function readSakinField(key: string): string {
  try {
    return (localStorage.getItem(key) || '').trim();
  } catch {
    return '';
  }
}

function sakinLangToLocale(raw: string): Locale {
  return raw === 'en' ? 'en' : 'tr';
}

export type BridgeResult = { ok: true; reportId: string } | { ok: false };

/**
 * Sakin'in doğum verisini okuyup tam bir SoulID karnesi üretir + kaydeder.
 * Başarılıysa aktif karne ID'si yazılır (report sayfası bunu okur) ve
 * `{ok:true}` döner — çağıran taraf /report'a yönlendirmeli.
 * Sakin verisi eksik/geocoding başarısızsa `{ok:false}` döner — normal
 * karşılama/doğum formu akışına devam edilmeli.
 */
export async function tryAutoConnectFromSakin(): Promise<BridgeResult> {
  const fullName = readSakinField('sakin_name');
  const birthDate = readSakinField('sakin_birth_date');
  const birthTime = readSakinField('sakin_birth_time');
  const birthCityRaw = readSakinField('sakin_birth_city');
  const locale = sakinLangToLocale(readSakinField('sakin_lang'));

  if (!fullName || !birthDate || !birthCityRaw) return { ok: false };

  try {
    const hits = await geocodePlace(birthCityRaw, locale);
    const hit = hits[0];
    if (!hit) return { ok: false };

    const report = await buildGalacticReport(
      {
        fullName,
        birthDate,
        birthTime: birthTime || '12:00',
        birthTimeKnown: !!birthTime,
        birthPlace: `${hit.name}, ${hit.country}`,
        latitude: hit.latitude,
        longitude: hit.longitude,
        timezone: hit.timezone,
      },
      locale,
    );

    // FREE_MODE (Sakin embed'inde hep açık) altında bu daima true döner;
    // yine de gerçek entitlements akışıyla tutarlı kalması için çağrılıyor.
    if (!canViewReport(report.id)) return { ok: false };

    await saveReport(report).catch(() => {});
    recordReportView(report.id);
    setActiveReportId(report.id);
    try { sessionStorage.setItem(DONE_KEY, '1'); } catch { /* ignore */ }
    return { ok: true, reportId: report.id };
  } catch {
    return { ok: false };
  }
}

/** Bu oturumda köprü zaten denendi mi? (Welcome'a geri dönüşte tekrar tetiklenmesin.) */
export function sakinBridgeAttempted(): boolean {
  try {
    return sessionStorage.getItem(DONE_KEY) === '1';
  } catch {
    return false;
  }
}

/** Denendi ama veri yoktu/başarısızdı — bir daha denemesin (formu boşuna bloklama). */
export function markSakinBridgeSkipped(): void {
  try { sessionStorage.setItem(DONE_KEY, '1'); } catch { /* ignore */ }
}
