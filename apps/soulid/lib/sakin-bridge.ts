// Sakin köprüsü: Sakin ana uygulamasında doğum bilgisi girilmişse, SoulID
// açılışta AYNI localStorage'ı (aynı origin, embed statik bundle olarak
// /embedded/soulid/ altından servis edilir) senkron okuyup karneyi otomatik
// üretir. Kullanıcı SoulID içinde doğum formunu TEKRAR doldurmaz.
//
// Yalnızca Sakin'den açılan embed'de anlamlıdır: bağımsız soulprofile.life
// sitesinde bu anahtarlar hiç yazılmaz (farklı origin), fonksiyon sessizce
// no-op döner: ekstra bir "Sakin embed mi?" bayrağına gerek yok.
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
 * `{ok:true}` döner: çağıran taraf /report'a yönlendirmeli.
 * Sakin verisi eksik/geocoding başarısızsa `{ok:false}` döner: normal
 * karşılama/doğum formu akışına devam edilmeli.
 */
export async function tryAutoConnectFromSakin(): Promise<BridgeResult> {
  const fullName = readSakinField('sakin_name');
  const birthDate = readSakinField('sakin_birth_date');
  const birthTime = readSakinField('sakin_birth_time');
  const birthCityRaw = readSakinField('sakin_birth_city');
  const locale = sakinLangToLocale(readSakinField('sakin_lang'));

  if (!fullName || !birthDate || !birthCityRaw) return { ok: false };

  // SERT ZAMAN AŞIMI: köprü ne olursa olsun kullanıcıyı yükleme ekranında
  // asılı bırakmamalı. Geocoding ağı yavaş/engelliyse (uçak modu, review ağı,
  // WKWebView içinde takılan istek) 8 saniyede pes edip normal karşılama
  // ekranına düşeriz. Kullanıcı formu elle doldurabilir; kilitlenme YOK.
  return Promise.race([
    runBridge(fullName, birthDate, birthTime, birthCityRaw, locale),
    new Promise<BridgeResult>((resolve) => setTimeout(() => resolve({ ok: false }), 8000)),
  ]);
}

/**
 * Sakin'in ÇÖZDÜĞÜ koordinat. Host, doğum şehrini kendi 36 bin şehirlik yerel
 * veri tabanında çözüp `sakin_birth_lat/lon/tz` anahtarlarına yazıyor.
 *
 * NEDEN ÖNEMLİ: eskiden köprü şehir ADINI alıp `geocodePlace()` ile yeniden
 * çözmeye çalışıyordu. SoulID'nin kendi listesi 158 şehir + ağ çağrısı olduğu
 * için birçok şehir bulunamıyor, köprü `{ok:false}` dönüyor ve kullanıcı
 * SoulID'nin KENDİ doğum formuna düşüyordu. Kullanıcının gördüğü iki şikayet
 * ("şehir bulunamıyor" ve "doğum bilgisini tekrar soruyor") aslında bu tek
 * hatanın sonucuydu. Koordinat hazır geldiğinde geocode adımı tamamen atlanır.
 */
function readSakinCoords(): { lat: number; lon: number; tz: number } | null {
  const lat = parseFloat(readSakinField('sakin_birth_lat'));
  const lon = parseFloat(readSakinField('sakin_birth_lon'));
  // `sakin_birth_tz_eff` = doğum tarihine göre ETKİN ofset (Sakin, Türkiye'nin
  // tarihsel yaz saati kurallarını tz-db ile birebir uygulayarak hesaplıyor).
  // `sakin_birth_tz` ise STANDART (kış) ofseti; eski host sürümlerinde yalnızca
  // o var, yedek olarak kullanılır.
  const tzEff = parseFloat(readSakinField('sakin_birth_tz_eff'));
  const tzStd = parseFloat(readSakinField('sakin_birth_tz'));
  const tz = Number.isFinite(tzEff) ? tzEff : tzStd;
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || !Number.isFinite(tz)) return null;
  return { lat, lon, tz };
}

async function runBridge(
  fullName: string,
  birthDate: string,
  birthTime: string,
  birthCityRaw: string,
  locale: Locale,
): Promise<BridgeResult> {
  try {
    // 1) Host koordinatı verdiyse geocode HİÇ çalışmaz: ağ yok, eksik şehir yok.
    // 2) Vermediyse (eski host sürümü) eski yola düşülür.
    const coords = readSakinCoords();
    let place: { name: string; latitude: number; longitude: number; timezone: string; utcOffset?: number };
    if (coords) {
      // IANA saat dilimi adı YOK, sayısal ofset var. Sahte bir "UTC+03:00"
      // dizesi UYDURMA: buildBirthISO onu Intl.DateTimeFormat'a veriyor,
      // geçersiz olduğu için sessizce UTC'ye düşer ve doğum saati 3 saat
      // kayardı (yükselen 1 burç şaşar). Onun yerine `utcOffset` alanı
      // doğrudan geçiliyor, buildBirthISO varsa onu kullanıyor.
      place = { name: birthCityRaw, latitude: coords.lat, longitude: coords.lon, timezone: '', utcOffset: coords.tz };
    } else {
      const hits = await geocodePlace(birthCityRaw, locale);
      const hit = hits[0];
      if (!hit) return { ok: false };
      place = { name: `${hit.name}, ${hit.country}`, latitude: hit.latitude, longitude: hit.longitude, timezone: hit.timezone };
    }

    const report = await buildGalacticReport(
      {
        fullName,
        birthDate,
        birthTime: birthTime || '12:00',
        birthTimeKnown: !!birthTime,
        birthPlace: place.name,
        latitude: place.latitude,
        longitude: place.longitude,
        timezone: place.timezone,
        utcOffset: place.utcOffset,
      },
      locale,
    );

    // FREE_MODE (Sakin embed'inde hep açık) altında bu daima true döner;
    // yine de gerçek entitlements akışıyla tutarlı kalması için çağrılıyor.
    if (!canViewReport(report.id)) return { ok: false };

    await saveReport(report).catch(() => {});
    recordReportView(report.id);
    setActiveReportId(report.id);
    // Başarı da parmak iziyle işaretlenir: kullanıcı Sakin'de doğum bilgisini
    // DEĞİŞTİRİRSE (düzeltme, farklı şehir) köprü yeniden çalışıp karneyi
    // güncel veriyle üretir; eski karneye saplanıp kalmaz.
    try { sessionStorage.setItem(DONE_KEY, sakinDataFingerprint()); } catch { /* ignore */ }
    return { ok: true, reportId: report.id };
  } catch {
    return { ok: false };
  }
}

/**
 * Sakin host'unda kullanılabilir doğum verisi var mı? (Köprünün çalışması için
 * gereken asgari alanlar.) Doğum formunu göstermeden önce buna bakılır:
 * host zaten biliyorsa kullanıcıya İKİNCİ KEZ sormak yanlış.
 */
export function hasSakinBirthData(): boolean {
  return !!readSakinField('sakin_name') && !!readSakinField('sakin_birth_date') && !!readSakinField('sakin_birth_city');
}

/**
 * Köprünün hangi VERİYLE denendiğinin parmak izi.
 *
 * NEDEN PARMAK İZİ, DÜZ BAYRAK DEĞİL (kullanıcı bildirdi): eskiden bu yalnızca
 * "denendi/denenmedi" bayrağıydı. Kullanıcı Ruh Profili'ni doğum bilgisi
 * GİRMEDEN açarsa köprü düşüyor ve bayrak yanıyordu; sonra Sakin'de (girişte ya
 * da Galaktik Kimlik oluştururken) doğum bilgisini girip Ruh Profili'ne geri
 * dönünce köprü BİR DAHA denenmiyor, form yine karşısına çıkıyordu.
 * Artık hangi veriyle denendiği yazılıyor: veri değiştiyse yeniden denenir.
 */
function sakinDataFingerprint(): string {
  return [
    readSakinField('sakin_name'),
    readSakinField('sakin_birth_date'),
    readSakinField('sakin_birth_time'),
    readSakinField('sakin_birth_city'),
    readSakinField('sakin_birth_lat'),
    readSakinField('sakin_birth_tz_eff'),
  ].join('|');
}

/** Köprü BU VERİYLE zaten denendi mi? (Aynı veriyle sonsuz döngüye girmesin.) */
export function sakinBridgeAttempted(): boolean {
  try {
    const marked = sessionStorage.getItem(DONE_KEY);
    if (!marked) return false;
    // Eski sürümden kalan düz '1' işareti: veri parmak izi bilinmiyor, güvenli
    // taraf yeniden denemek (kullanıcının şikayet ettiği durum tam da buydu).
    if (marked === '1') return false;
    return marked === sakinDataFingerprint();
  } catch {
    return false;
  }
}

/** Denendi ama veri yoktu/başarısızdı: AYNI veriyle bir daha denemesin. */
export function markSakinBridgeSkipped(): void {
  try { sessionStorage.setItem(DONE_KEY, sakinDataFingerprint()); } catch { /* ignore */ }
}

/**
 * Galaktik Kimlik fotoğrafı. Sakin, kullanıcının yüklediği fotoğrafı 256px
 * JPEG'e küçültüp `sakin_avatar` anahtarına yazar (aynı origin, embed okuyabilir).
 * Eşleşme ekranındaki "Siz" dairesi bunu gösterir; yoksa burç sembolüne düşer.
 */
export function readSakinAvatar(): string | null {
  const v = readSakinField('sakin_avatar');
  return v.startsWith('data:image/') ? v : null;
}
