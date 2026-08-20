'use client';

import { useNav } from '@/lib/nav';
import { setActiveReportId } from '@/lib/active-report';
import { FORM_INPUT, BTN_PRIMARY } from '@/lib/ui';
import { IS_CAPACITOR } from '@/lib/nav';
import { WEB_APP_OPEN } from '@/lib/feature-flags';
import { AppOnlyGate } from '@/components/AppOnlyGate';
import { LabeledField, DateField, TimeKnownField } from '@/components/LabeledField';
import Image from 'next/image';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { CosmicBackground } from '@/components/CosmicBackground';
import { CosmicLoader } from '@/components/CosmicLoader';
import { useSoulStore } from '@/lib/store';
import { geocodePlace, type GeocodeResult } from '@/lib/geocoding';
import { buildGalacticReport } from '@/lib/report';
import { saveReport, listReports } from '@/lib/supabase/reports';
import { useT } from '@/lib/i18n';
import { canViewReport, recordReportView } from '@/lib/entitlements';
import { PremiumGate } from '@/components/PremiumGate';

export default function BirthPage() {
  const nav = useNav();
  const { t, locale } = useT();
  const [gated, setGated] = useState(false);
  const birth = useSoulStore((s) => s.birth);
  const setBirth = useSoulStore((s) => s.setBirth);
  const setReport = useSoulStore((s) => s.setReport);
  const setLoading = useSoulStore((s) => s.setLoading);
  const setError = useSoulStore((s) => s.setError);
  const loading = useSoulStore((s) => s.loading);
  const error = useSoulStore((s) => s.error);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [placeQuery, setPlaceQuery] = useState(birth.birthPlace ?? '');
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);

  // Formu son kayıtlı karnenin doğum verisiyle önceden doldur — kullanıcı
  // doğum tarihini/verisini görüp DEĞİŞTİREBİLSİN (native reload'da zustand
  // boşalıyordu; menüden gelince tekrar baştan sormasın).
  useEffect(() => {
    if (birth.fullName || birth.birthDate) return; // zaten dolu
    let cancelled = false;
    listReports().then((list) => {
      if (cancelled || !list[0]) return;
      // Async çözülene kadar kullanıcı yazmaya başladıysa girdisini ezme (race).
      const cur = useSoulStore.getState().birth;
      if (cur.fullName || cur.birthDate) return;
      const b = list[0].birth;
      setBirth({
        fullName: b.fullName,
        birthDate: b.birthDate,
        birthTime: b.birthTime,
        birthTimeKnown: b.birthTimeKnown,
        birthPlace: b.birthPlace,
        latitude: b.latitude,
        longitude: b.longitude,
        timezone: b.timezone,
        photoUri: b.photoUri,
      });
      setPlaceQuery(b.birthPlace ?? '');
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onPhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_BYTES = 25 * 1024 * 1024; // iPhone HEIC/JPEG fotoları için bol
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (file.size > MAX_BYTES) {
      setError(locale === 'tr' ? 'Fotoğraf 25 MB sınırını aşıyor.' : 'Photo exceeds 25 MB limit.');
      return;
    }
    if (!ALLOWED.includes(file.type)) {
      setError(locale === 'tr' ? 'Sadece JPEG, PNG veya WebP destekleniyor.' : 'Only JPEG, PNG, or WebP supported.');
      return;
    }

    // Re-encode via canvas — yüklenen dosyayı temizle, embedded script veya
    // metadata varsa düşür. Çıktı her zaman JPEG.
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (evt) => resolve(evt.target?.result as string);
        reader.onerror = () => reject(new Error('read failed'));
        reader.readAsDataURL(file);
      });

      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const im = document.createElement('img');
        im.onload = () => resolve(im);
        im.onerror = () => reject(new Error('decode failed'));
        im.src = dataUrl;
      });

      const MAX_DIM = 1024;
      const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('canvas');
      ctx.drawImage(img, 0, 0, w, h);
      const clean = canvas.toDataURL('image/jpeg', 0.85);
      setBirth({ photoUri: clean });
      setError(null);
    } catch {
      setError(locale === 'tr' ? 'Fotoğraf işlenemedi.' : 'Could not process photo.');
    }
  }

  async function searchPlace(value: string) {
    setPlaceQuery(value);
    setBirth({ birthPlace: value });
    setError(null);
    if (value.length < 2) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    try {
      const r = await geocodePlace(value, locale);
      setSuggestions(r);
      if (r.length === 0 && value.length >= 3) {
        // Sessiz başarısızlık yerine kullanıcıya geri bildir — iOS CORS / ağ sorunu.
        setError(
          locale === 'tr'
            ? 'Yer bulunamadı. İnternet bağlantını kontrol et veya farklı bir yazım dene.'
            : 'No place found. Check your connection or try a different spelling.',
        );
      }
    } catch {
      setError(
        locale === 'tr'
          ? 'Yer araması başarısız. İnternet bağlantını kontrol et.'
          : 'Place search failed. Check your connection.',
      );
    } finally {
      setSearching(false);
    }
  }

  function pickSuggestion(s: GeocodeResult) {
    setPlaceQuery(`${s.name}, ${s.country}`);
    setBirth({
      birthPlace: `${s.name}, ${s.country}`,
      latitude: s.latitude,
      longitude: s.longitude,
      timezone: s.timezone,
    });
    setSuggestions([]);
  }

  async function submit() {
    if (!birth.fullName || !birth.birthDate) {
      setError(t('birth.error'));
      return;
    }

    // Yer çözümü — kullanıcı öneriden seçtiyse lat/lng hazır. Seçmeden yazıp
    // direkt submit'e bastıysa, burada bir kez daha geocode dene (öneri açılmamış
    // olabilir). Böylece "yer giremiyorum → buton açmıyor" zinciri kırılır.
    let lat = birth.latitude ?? null;
    let lng = birth.longitude ?? null;
    let tz = birth.timezone ?? 'UTC';
    let placeName = birth.birthPlace ?? placeQuery;

    if (lat == null && placeQuery.trim().length >= 2) {
      setSearching(true);
      try {
        const hits = await geocodePlace(placeQuery, locale);
        if (hits[0]) {
          lat = hits[0].latitude;
          lng = hits[0].longitude;
          tz = hits[0].timezone;
          placeName = `${hits[0].name}, ${hits[0].country}`;
          setBirth({ birthPlace: placeName, latitude: lat, longitude: lng, timezone: tz });
        }
      } catch {
        /* aşağıda hata mesajı verilir */
      } finally {
        setSearching(false);
      }
    }

    if (lat == null || lng == null) {
      setError(
        locale === 'tr'
          ? 'Doğum yerini bulamadık. Yer kutusuna şehir adını yazıp listeden seç (örn. "İstanbul").'
          : 'We could not find the birthplace. Type a city in the place box and pick from the list.',
      );
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const report = await buildGalacticReport({
        fullName: birth.fullName,
        birthDate: birth.birthDate,
        birthTime: birth.birthTime ?? '12:00',
        birthTimeKnown: birth.birthTimeKnown ?? true,
        birthPlace: placeName,
        latitude: lat,
        longitude: lng,
        timezone: tz,
        photoUri: birth.photoUri,
      }, locale);

      // İlk karne (kişi) ücretsiz. Aynı kişi tekrar → serbest. Farklı kişi +
      // ücretsiz hak dolmuşsa → premium. (report.id doğum verisinden deterministik)
      if (!canViewReport(report.id)) {
        setGated(true);
        setLoading(false);
        return;
      }

      setReport(report);
      // Lokal kayıt awaited — iOS hard-reload öncesi karne diske düşmüş olmalı.
      await saveReport(report).catch((e) => console.warn('[birth] save failed', e));
      recordReportView(report.id);
      setActiveReportId(report.id);
      nav.push('/report');
    } catch (e) {
      console.error(e);
      setError(locale === 'tr' ? 'Karne üretilemedi. Lütfen tekrar dene.' : 'Could not generate profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!IS_CAPACITOR && !WEB_APP_OPEN) return <AppOnlyGate />;

  if (gated) {
    return <PremiumGate kind="report" onBack={() => setGated(false)} />;
  }

  return (
    <div className="relative min-h-[80vh] py-20 md:py-28">
      {loading ? <CosmicLoader /> : null}
      <CosmicBackground variant="aurora" />
      <div className="mx-auto max-w-xl px-6">
        <p className="text-xs font-bold uppercase tracking-[0.5em] text-gold">{t('birth.kicker')}</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-ink md:text-5xl">
          {t('birth.title')}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted">{t('birth.subtitle')}</p>

        <div className="mt-8 space-y-5">
          <LabeledField label={t('birth.name')}>
            <input
              type="text"
              value={birth.fullName ?? ''}
              onChange={(e) => setBirth({ fullName: e.target.value })}
              placeholder={locale === 'tr' ? 'Ada Yıldız' : 'Alex Rivers'}
              autoComplete="name"
              className={inputClass}
            />
          </LabeledField>

          <DateField
            label={t('birth.date')}
            value={birth.birthDate ?? ''}
            onChange={(v) => setBirth({ birthDate: v })}
          />

          <TimeKnownField
            label={t('birth.time')}
            value={birth.birthTime ?? ''}
            onChange={(v) => setBirth({ birthTime: v })}
            known={birth.birthTimeKnown !== false}
            onKnownChange={(b) => setBirth({ birthTimeKnown: b })}
            knownLabel={t('birth.timeKnown')}
          />

          <LabeledField label={t('birth.place')}>
            <div className="relative">
              <input
                type="text"
                value={placeQuery}
                onChange={(e) => searchPlace(e.target.value)}
                placeholder={locale === 'tr' ? 'İstanbul, Türkiye' : 'London, UK'}
                className={inputClass}
              />
              {searching ? <p className="mt-2 text-xs text-muted">{locale === 'tr' ? 'Aranıyor...' : 'Searching...'}</p> : null}
              {suggestions.length > 0 ? (
                <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-panelBorder bg-bgElevated">
                  {suggestions.map((s, i) => (
                    <button
                      key={`${s.name}-${i}`}
                      type="button"
                      onClick={() => pickSuggestion(s)}
                      className="block w-full border-b border-panelBorder px-4 py-3 text-left text-sm last:border-b-0 hover:bg-panel"
                    >
                      <div className="text-ink">
                        {s.name}, {s.country}
                      </div>
                      <div className="text-[11px] text-faint">
                        {s.latitude.toFixed(2)}, {s.longitude.toFixed(2)} · {s.timezone}
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </LabeledField>

          {/* Opsiyonel profil fotoğrafı — kompakt, en sonda */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-xl border border-dashed border-panelBorder bg-panel px-4 py-3 text-left transition-colors hover:border-gold/50"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/40 bg-bg">
              {birth.photoUri ? (
                <Image src={birth.photoUri} alt="" width={48} height={48} className="h-full w-full object-cover" unoptimized />
              ) : (
                <span className="text-lg text-gold">✦</span>
              )}
            </span>
            <span className="flex-1">
              <span className="block text-sm font-bold text-ink">
                {t('birth.photo')} <span className="text-[11px] font-normal text-faint">({locale === 'tr' ? 'opsiyonel' : 'optional'})</span>
              </span>
              <span className="block text-[11px] text-faint">{t('birth.photoHint')}</span>
            </span>
            <span className="shrink-0 text-xs text-gold">{birth.photoUri ? (locale === 'tr' ? 'Değiştir' : 'Change') : (locale === 'tr' ? 'Ekle' : 'Add')}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onPhotoChange}
            className="hidden"
          />

          {error ? (
            <p className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className={`group mt-3 ${BTN_PRIMARY}`}
          >
            {loading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#1a0a40]/30 border-t-[#1a0a40]" />
                {t('birth.loading')}
              </>
            ) : (
              <>
                <span className="text-xl">✦</span>
                {t('birth.submit')}
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </>
            )}
          </button>

          <p className="text-center text-xs text-faint">
            {t('birth.privacyNote')}{' '}
            <a href="/privacy" className="text-muted hover:text-gold underline">
              {t('nav.privacy')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

const inputClass = FORM_INPUT;
