'use client';

import { useEffect, useMemo, useState } from 'react';
import { CosmicBackground } from '@/components/CosmicBackground';
import { PairAvatars } from '@/components/PairAvatars';
import { SupernovaTransition } from '@/components/SupernovaTransition';
import { PremiumGate } from '@/components/PremiumGate';
import { useSoulStore } from '@/lib/store';
import { listReports, saveCompat } from '@/lib/supabase/reports';
import { geocodePlace, type GeocodeResult } from '@/lib/geocoding';
import { buildGalacticReport, birthKey } from '@/lib/report';
import { compareReports, type CompatibilityResult } from '@/lib/compatibility';
import { canViewCompat, recordCompatView, compatId, hasPremium } from '@/lib/entitlements';
import { readSakinAvatar } from '@/lib/sakin-bridge';
import { setActiveCompatId } from '@/lib/active-compat';
import type { GalacticReport } from '@/lib/types';
import { useNav } from '@/lib/nav';
import { useT } from '@/lib/i18n';

/**
 * PARTNER BİLGİSİ: HER EKRANDA TEK SORU.
 *
 * Eski /compatibility sayfası tüm alanları tek uzun formda soruyordu; kullanıcı
 * "kolaylık ve sadelikle girsin" dedi. Burada ad, tarih, saat ve yer ayrı
 * adımlarda; üstte ilerleme çubuğu, altta tek "İleri". Bittiğinde süpernova
 * animasyonu oynar ve kısa bir sonuç çıkar.
 *
 * GÖRÜNÜM Sakin'in dili (Jost, uppercase, ince hat, altın/kozmik). Referans
 * görselleri yalnızca AKIŞ örneğiydi.
 */

type Step = 'ad' | 'tarih' | 'saat' | 'yer';
const STEPS: Step[] = ['ad', 'tarih', 'saat', 'yer'];

const YEARS = Array.from({ length: 96 }, (_, i) => new Date().getFullYear() - 5 - i);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const pad = (n: number) => String(n).padStart(2, '0');

/** Dokunarak kaydırılan sütun. Native <select> iOS'ta kendi tekerini açar,
 *  görsel bütünlüğü bozardı; bu yüzden kendi listemiz. */
function Wheel({
  items,
  value,
  onChange,
  render,
  label,
}: {
  items: (string | number)[];
  value: string | number;
  onChange: (v: string | number) => void;
  render?: (v: string | number) => string;
  label: string;
}) {
  return (
    <div className="flex-1" role="group" aria-label={label}>
      <div
        className="h-[186px] overflow-y-auto rounded-2xl border border-panelBorder bg-panel/25 py-[74px]"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {items.map((it) => {
          const on = String(it) === String(value);
          return (
            <button
              key={String(it)}
              type="button"
              onClick={() => onChange(it)}
              className="block w-full py-2 text-center text-[17px] transition-colors"
              style={{
                WebkitAppearance: 'none',
                appearance: 'none',
                background: on ? 'var(--gold)11' : 'transparent',
                border: 0,
                color: on ? 'var(--gold)' : 'var(--faint)',
                fontWeight: on ? 500 : 300,
              }}
            >
              {render ? render(it) : it}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function PairAddPage() {
  const { t, locale } = useT();
  const nav = useNav();
  const storeReport = useSoulStore((s) => s.report);

  const [me, setMe] = useState<GalacticReport | null>(storeReport);
  const [photo, setPhoto] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('ad');

  const [name, setName] = useState('');
  const now = new Date();
  const [day, setDay] = useState<number>(1);
  const [month, setMonth] = useState<number>(1);
  const [year, setYear] = useState<number>(now.getFullYear() - 30);
  const [hour, setHour] = useState<number>(12);
  const [minute, setMinute] = useState<number>(0);
  const [timeKnown, setTimeKnown] = useState(true);
  const [placeQuery, setPlaceQuery] = useState('');
  const [place, setPlace] = useState<GeocodeResult | null>(null);
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [consent, setConsent] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nova, setNova] = useState(false);
  const [gated, setGated] = useState(false);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [other, setOther] = useState<GalacticReport | null>(null);
  const [compatIdVal, setCompatIdVal] = useState<string | null>(null);
  const [premium, setPremium] = useState(false);

  useEffect(() => {
    setPhoto(readSakinAvatar());
    setPremium(hasPremium());
    if (!storeReport) listReports().then((r) => { if (r[0]) setMe(r[0]); }).catch(() => {});
  }, [storeReport]);

  const MONTHS = useMemo(
    () =>
      locale === 'tr'
        ? ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
        : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    [locale],
  );

  const idx = STEPS.indexOf(step);
  const dateStr = `${year}-${pad(month)}-${pad(day)}`;

  const canNext =
    step === 'ad' ? name.trim().length >= 2
    : step === 'tarih' ? true
    : step === 'saat' ? true
    : placeQuery.trim().length >= 2 && consent;

  async function searchPlace(v: string) {
    setPlaceQuery(v);
    setPlace(null);
    if (v.length < 2) { setSuggestions([]); return; }
    setSuggestions(await geocodePlace(v, locale));
  }

  function back() {
    if (idx === 0) { nav.push('/pair'); return; }
    setStep(STEPS[idx - 1]);
  }

  async function next() {
    setError(null);
    if (idx < STEPS.length - 1) { setStep(STEPS[idx + 1]); return; }
    if (!me) { setError(t('pair.err.noSelf')); return; }

    let resolved = place;
    if (!resolved && placeQuery.trim().length >= 2) {
      const hits = await geocodePlace(placeQuery, locale);
      if (hits[0]) resolved = hits[0];
    }
    if (!resolved) { setError(t('pair.err.place')); return; }

    setBusy(true);
    setNova(true);
    try {
      const rep = await buildGalacticReport(
        {
          fullName: name.trim(),
          birthDate: dateStr,
          birthTime: timeKnown ? `${pad(hour)}:${pad(minute)}` : '12:00',
          birthTimeKnown: timeKnown,
          birthPlace: `${resolved.name}, ${resolved.country}`,
          latitude: resolved.latitude,
          longitude: resolved.longitude,
          timezone: resolved.timezone,
          // Büyük yerel şehir tablosundan gelen sonuçta IANA adı yok, sayısal
          // ofset var; buildBirthISO doluysa onu kullanıyor (bkz. GeocodeResult).
          utcOffset: resolved.utcOffset,
        },
        locale,
      );
      const cid = compatId(birthKey(me.birth), birthKey(rep.birth));
      if (!canViewCompat(cid)) { setNova(false); setGated(true); setBusy(false); return; }
      const res = compareReports(me, rep, locale);
      recordCompatView(cid);
      saveCompat({
        id: cid, nameA: res.nameA, nameB: res.nameB,
        birthA: me.birth, birthB: rep.birth, scoreOverall: res.scoreOverall,
      }).catch(() => {});
      setOther(rep);
      setResult(res);
      setCompatIdVal(cid);
    } catch (e) {
      console.error(e);
      setNova(false);
      setError(t('pair.err.generic'));
    } finally {
      setBusy(false);
    }
  }

  if (gated) {
    return <PremiumGate kind="compat" onBack={() => setGated(false)} onUnlocked={() => { setPremium(true); setGated(false); }} />;
  }

  // ── Süpernova → sonuç ───────────────────────────────────────────────────
  if (nova) {
    return (
      <div className="relative min-h-[100dvh]">
        <CosmicBackground variant="galaxy" />
        <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col justify-center px-6 font-brand">
          {result ? (
            <PairResult
              me={me!}
              other={other!}
              result={result}
              photo={photo}
              onDetails={() => {
                if (compatIdVal) setActiveCompatId(compatIdVal);
                nav.push('/pair/result');
              }}
              onClose={() => nav.push('/menu')}
            />
          ) : (
            <>
              <SupernovaTransition onDone={() => { /* sonuç hazır olunca kendiliğinden çizilir */ }} />
              <p className="mt-6 text-center text-[11px] uppercase tracking-[0.35em] text-faint">
                {t('pair.computing')}
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Adım adım form ──────────────────────────────────────────────────────
  return (
    <div className="relative min-h-[100dvh]">
      <CosmicBackground variant="aurora" />
      <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col px-6 pb-8 pt-6 font-brand">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={back}
            aria-label={t('common.back')}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-panelBorder text-lg text-muted"
            style={{ WebkitAppearance: 'none', appearance: 'none', background: 'none' }}
          >
            ‹
          </button>
          <p className="flex-1 text-center text-[11px] uppercase tracking-[0.35em] text-muted">
            {t(`pair.step.${step}`)}
          </p>
          <span className="w-10" />
        </div>

        {/* ilerleme */}
        <div className="mt-5 h-[2px] w-full overflow-hidden rounded-full bg-panelBorder">
          <div
            className="h-full bg-gold transition-all duration-300"
            style={{ width: `${((idx + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="mt-10 flex-1">
          {step === 'ad' && (
            <>
              <p className="text-[15px] leading-relaxed text-ink">{t('pair.ad.q')}</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('pair.ad.ph')}
                maxLength={32}
                autoFocus
                className="mt-6 w-full rounded-2xl border border-panelBorder bg-panel/25 px-5 py-4 text-base text-ink placeholder:text-faint focus:border-gold/70 focus:outline-none"
              />
            </>
          )}

          {step === 'tarih' && (
            <>
              <p className="text-[15px] leading-relaxed text-ink">{t('pair.tarih.q')}</p>
              <div className="mt-6 flex gap-3">
                <Wheel items={DAYS} value={day} onChange={(v) => setDay(Number(v))} label={t('pair.tarih.day')} />
                <Wheel
                  items={MONTHS.map((_, i) => i + 1)}
                  value={month}
                  onChange={(v) => setMonth(Number(v))}
                  render={(v) => MONTHS[Number(v) - 1]}
                  label={t('pair.tarih.month')}
                />
                <Wheel items={YEARS} value={year} onChange={(v) => setYear(Number(v))} label={t('pair.tarih.year')} />
              </div>
            </>
          )}

          {step === 'saat' && (
            <>
              <p className="text-[15px] leading-relaxed text-ink">{t('pair.saat.q')}</p>
              <div className="mt-6 flex gap-3">
                <Wheel items={HOURS} value={hour} onChange={(v) => setHour(Number(v))} render={(v) => pad(Number(v))} label={t('pair.saat.hour')} />
                <Wheel items={MINUTES} value={minute} onChange={(v) => setMinute(Number(v))} render={(v) => pad(Number(v))} label={t('pair.saat.minute')} />
              </div>
              <label className="mt-5 flex cursor-pointer items-center gap-3 text-[12px] text-muted">
                <input
                  type="checkbox"
                  checked={!timeKnown}
                  onChange={(e) => setTimeKnown(!e.target.checked)}
                  className="h-4 w-4 accent-cosmic"
                />
                {t('pair.saat.unknown')}
              </label>
            </>
          )}

          {step === 'yer' && (
            <>
              <p className="text-[15px] leading-relaxed text-ink">{t('pair.yer.q')}</p>
              <input
                type="text"
                value={placeQuery}
                onChange={(e) => searchPlace(e.target.value)}
                placeholder={t('pair.yer.ph')}
                autoFocus
                className="mt-6 w-full rounded-2xl border border-panelBorder bg-panel/25 px-5 py-4 text-base text-ink placeholder:text-faint focus:border-gold/70 focus:outline-none"
              />
              {suggestions.length > 0 && (
                <div className="mt-2 overflow-hidden rounded-2xl border border-panelBorder bg-bgElevated">
                  {suggestions.slice(0, 5).map((s, i) => (
                    <button
                      key={`${s.name}-${i}`}
                      type="button"
                      onClick={() => { setPlace(s); setPlaceQuery(`${s.name}, ${s.country}`); setSuggestions([]); }}
                      className="block w-full border-b border-panelBorder px-4 py-3 text-left text-sm text-ink last:border-b-0"
                      style={{ WebkitAppearance: 'none', appearance: 'none', background: 'none' }}
                    >
                      {s.name}, {s.country}
                    </button>
                  ))}
                </div>
              )}
              {/* GDPR Art.6 + Apple 5.1.1(ii): üçüncü kişinin doğum verisi
                  girilmeden önce onay şart. */}
              <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-panelBorder bg-panel/20 p-4 text-[12px] leading-relaxed text-muted">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-cosmic"
                />
                {t('pair.consent')}
              </label>
            </>
          )}

          {error && <p className="mt-5 text-[13px] leading-relaxed text-danger">{error}</p>}
        </div>

        <button
          type="button"
          onClick={next}
          disabled={!canNext || busy}
          className="mt-8 w-full rounded-full border border-gold/50 bg-gold/[0.07] py-4 text-[12px] uppercase tracking-[0.3em] text-gold disabled:opacity-40"
          style={{ WebkitAppearance: 'none', appearance: 'none' }}
        >
          {idx < STEPS.length - 1 ? t('pair.next') : t('pair.see')}
        </button>
      </div>
    </div>
  );
}

/** Kısa sonuç: birkaç net bilgi. Altta "Detaylara Git" (tam ikili uyum
 *  ekranına, /pair/result) ve "Kapat" (bölüm listesine). Derin uyum analizi
 *  premium'un ARKASINDA DEĞİL (bkz. lib/entitlements.ts: canViewCompat yalnızca
 *  YENİ bir çifti HESAPLAMAYI sınırlar; bir kez hesaplanan uyumun tam detayı
 *  her zaman açık), o yüzden burada ayrı bir kilit ekranı yok. */
function PairResult({
  me, other, result, photo, onDetails, onClose,
}: {
  me: GalacticReport;
  other: GalacticReport;
  result: CompatibilityResult;
  photo: string | null;
  onDetails: () => void;
  onClose: () => void;
}) {
  const { t } = useT();
  const mySun = me.chart.planets.find((p) => p.name === 'Sun')?.sign ?? null;
  const otherSun = other.chart.planets.find((p) => p.name === 'Sun')?.sign ?? null;
  const firstName = (me.birth.fullName || '').trim().split(/\s+/)[0];
  const otherName = (other.birth.fullName || '').trim().split(/\s+/)[0];

  return (
    <div className="py-6">
      <PairAvatars
        meLabel={firstName || t('pair.you')}
        meSign={mySun}
        mePhoto={photo}
        otherLabel={otherName || t('pair.partner')}
        otherSign={otherSun}
      />

      <div className="mt-10 rounded-3xl border border-panelBorder bg-panel/25 p-6">
        <p className="text-[10px] uppercase tracking-[0.35em] text-gold">{t('pair.result.kicker')}</p>
        <p className="mt-4 text-[44px] font-light leading-none text-ink">
          {result.scoreOverall}
          <span className="ml-1 text-[18px] text-muted">/100</span>
        </p>
        <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-panelBorder">
          <div className="h-full bg-gold" style={{ width: `${result.scoreOverall}%` }} />
        </div>

        {/* Kısa ve net: dört katman, tek satır başlık. Tam detay "Detaylara Git" ile. */}
        <div className="mt-7 space-y-3.5">
          {[
            [t('pair.dim.astro'), result.scoreAstro],
            [t('pair.dim.hd'), result.scoreHD],
            [t('pair.dim.num'), result.scoreNumerology],
            [t('pair.dim.fate'), result.scoreFate],
          ].map(([label, score]) => (
            <div key={String(label)} className="flex items-center gap-4">
              <span className="w-24 shrink-0 text-[12px] uppercase tracking-[0.15em] text-muted">{label}</span>
              <span className="h-[2px] flex-1 overflow-hidden rounded-full bg-panelBorder">
                <span className="block h-full bg-cosmic" style={{ width: `${score}%` }} />
              </span>
              <span className="w-8 text-right text-[12px] tabular-nums text-ink">{score}</span>
            </div>
          ))}
        </div>

        {result.headline && (
          <p className="mt-7 border-t border-panelBorder pt-6 text-[13px] leading-relaxed text-muted">
            {result.headline}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onDetails}
        className="mt-6 w-full rounded-full border border-gold/50 bg-gold/[0.07] py-4 text-[12px] uppercase tracking-[0.3em] text-gold"
        style={{ WebkitAppearance: 'none', appearance: 'none' }}
      >
        {t('pair.result.details')}
      </button>

      <button
        type="button"
        onClick={onClose}
        className="mx-auto mt-6 block px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-faint"
        style={{ WebkitAppearance: 'none', appearance: 'none', background: 'none', border: 0 }}
      >
        {t('pair.result.close')}
      </button>
    </div>
  );
}
