'use client';

import { Link } from '@/components/Link';
import { useEffect, useState } from 'react';
import { CosmicBackground } from '@/components/CosmicBackground';
import { CompatibilityView } from '@/components/CompatibilityView';
import { DeepAnalysisBox } from '@/components/DeepAnalysisBox';
import { CompatShare } from '@/components/CompatCard';
import { useSoulStore } from '@/lib/store';
import { listReports, saveCompat } from '@/lib/supabase/reports';
import { geocodePlace, type GeocodeResult } from '@/lib/geocoding';
import { buildGalacticReport, birthKey } from '@/lib/report';
import { compareReports, type CompatibilityResult } from '@/lib/compatibility';
import { generateCompatNarrative, type CompatNarrative } from '@/lib/compatibility/narrative';
import type { GalacticReport } from '@/lib/types';
import { SIGN_NAMES_TR } from '@/lib/content/astrology-content';
import { useT } from '@/lib/i18n';
import { canViewCompat, recordCompatView, compatId, hasPremium } from '@/lib/entitlements';
import { PremiumGate } from '@/components/PremiumGate';
import { FORM_INPUT, BTN_COSMIC } from '@/lib/ui';
import { IS_CAPACITOR } from '@/lib/nav';
import { WEB_APP_OPEN } from '@/lib/feature-flags';
import { AppOnlyGate } from '@/components/AppOnlyGate';
import { LabeledField, DateField, TimeKnownField } from '@/components/LabeledField';

const inputClass = FORM_INPUT;

export default function CompatibilityPage() {
  const { t, locale } = useT();
  const storeReport = useSoulStore((s) => s.report);
  const [me, setMe] = useState<GalacticReport | null>(storeReport);
  const [hydrated, setHydrated] = useState(false);
  const [gated, setGated] = useState(false);
  const [premium, setPremium] = useState(false);

  // İkinci kişi formu
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');
  const [timeKnown, setTimeKnown] = useState(true);
  const [placeQuery, setPlaceQuery] = useState('');
  const [place, setPlace] = useState<GeocodeResult | null>(null);
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [narrative, setNarrative] = useState<CompatNarrative | null>(null);
  const [otherReport, setOtherReport] = useState<GalacticReport | null>(null);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setPremium(hasPremium());
    if (!storeReport) {
      listReports().then((r) => {
        if (r[0]) setMe(r[0]);
      });
    }
  }, [storeReport]);

  async function searchPlace(v: string) {
    setPlaceQuery(v);
    setPlace(null);
    if (v.length < 2) {
      setSuggestions([]);
      return;
    }
    const r = await geocodePlace(v, locale);
    setSuggestions(r);
  }

  function pickSuggestion(s: GeocodeResult) {
    setPlace(s);
    setPlaceQuery(`${s.name}, ${s.country}`);
    setSuggestions([]);
  }

  async function compare() {
    if (!me) return;
    if (!name || !date) {
      setError(t('compat.error'));
      return;
    }
    if (!consent) {
      setError(t('compat.consentError'));
      return;
    }

    // Yer çözümü — öneriden seçilmediyse submit'te bir kez daha dene
    // (ağ boşsa offline gazetteer devreye girer). Birth sayfasıyla tutarlı.
    let resolved = place;
    if (!resolved && placeQuery.trim().length >= 2) {
      const hits = await geocodePlace(placeQuery, locale);
      if (hits[0]) {
        resolved = hits[0];
        setPlace(hits[0]);
        setPlaceQuery(`${hits[0].name}, ${hits[0].country}`);
      }
    }
    if (!resolved) {
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
      const other = await buildGalacticReport({
        fullName: name,
        birthDate: date,
        birthTime: timeKnown ? time : '12:00',
        birthTimeKnown: timeKnown,
        birthPlace: `${resolved.name}, ${resolved.country}`,
        latitude: resolved.latitude,
        longitude: resolved.longitude,
        timezone: resolved.timezone,
      }, locale);

      // İlk uyum (çift) ücretsiz; aynı çift tekrar → serbest; farklı çift +
      // hak dolmuşsa → premium.
      const cid = compatId(birthKey(me.birth), birthKey(other.birth));
      if (!canViewCompat(cid)) {
        setGated(true);
        setLoading(false);
        return;
      }

      const res = compareReports(me, other, locale);
      // Ücretsiz uyum hakkını AI çağrısından ÖNCE tüket (hak zaten canViewCompat'tan
      // geçti); çağrı hata verirse tekrar bedava çalıştırılamasın.
      recordCompatView(cid);
      const narr = await generateCompatNarrative(me, other, res, locale);
      saveCompat({
        id: cid,
        nameA: res.nameA,
        nameB: res.nameB,
        birthA: me.birth,
        birthB: other.birth,
        scoreOverall: res.scoreOverall,
      }).catch(() => {});
      setOtherReport(other);
      setResult(res);
      setNarrative(narr);
      setTimeout(() => {
        document.getElementById('compat-result')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (e) {
      console.error(e);
      setError(locale === 'tr' ? 'Karşılaştırma yapılamadı. Lütfen tekrar dene.' : 'Comparison failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!IS_CAPACITOR && !WEB_APP_OPEN) return <AppOnlyGate />;

  // İlk uyum ücretsiz. Hak dolduysa (canRunCompat=false) submit'te setGated → satın al.
  if (gated) {
    return <PremiumGate kind="compat" onBack={() => setGated(false)} onUnlocked={() => { setPremium(true); setGated(false); }} />;
  }

  // Kendi karnesi yoksa
  if (hydrated && !me) {
    return (
      <div className="relative min-h-[70vh]">
        <CosmicBackground variant="aurora" />
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.5em] text-gold">{t('compat.needSelf.kicker')}</p>
          <h1 className="mt-3 font-display text-4xl text-ink">{t('compat.needSelf.title')}</h1>
          <p className="mt-3 text-muted">{t('compat.needSelf.desc')}</p>
          <Link
            href="/birth"
            className="mt-6 inline-block rounded-full bg-gold px-7 py-4 text-sm font-bold text-[#1a0a40] shadow-glow"
          >
            {t('compat.needSelf.cta')} →
          </Link>
        </div>
      </div>
    );
  }

  if (!me) return null;

  const mySun = me.chart.planets.find((p) => p.name === 'Sun');

  return (
    <div className="relative py-20 md:py-28">
      <CosmicBackground variant="aurora" />
      <div className="mx-auto max-w-3xl px-5 md:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.5em] text-gold">{t('compat.kicker')}</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-ink md:text-5xl">
          {t('compat.title')}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted">{t('compat.subtitle')}</p>

        {/* Kişi 1 — sen */}
        <div className="mt-12 rounded-3xl border border-gold/30 bg-gold/[0.04] p-6 md:p-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-gold">{t('compat.person1')}</p>
          <p className="mt-3 font-display text-2xl text-ink">{me.birth.fullName}</p>
          <p className="mt-3 text-[13px] leading-[1.75] text-muted">
            {mySun ? (locale === 'tr' ? SIGN_NAMES_TR[mySun.sign] : mySun.sign) : ''} {locale === 'tr' ? 'Güneş' : 'Sun'} ·{' '}
            {locale === 'tr' ? SIGN_NAMES_TR[me.chart.ascendantSign] : me.chart.ascendantSign} {locale === 'tr' ? 'Yükselen' : 'Rising'} ·{' '}
            {me.humanDesign.type} · {locale === 'tr' ? 'Yaşam Yolu' : 'Life Path'}{' '}
            {me.numerology.lifePath}
          </p>
        </div>

        {/* Kişi 2 — form */}
        <div className="card-surface mt-5 rounded-3xl border border-panelBorder p-6 md:p-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-cosmic">{t('compat.person2')}</p>

          <div className="mt-6 space-y-5">
            <LabeledField label={locale === 'tr' ? 'Adı' : 'Name'}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('compat.name')}
                className={inputClass}
              />
            </LabeledField>
            <DateField
              label={locale === 'tr' ? 'Doğum tarihi' : 'Birth date'}
              value={date}
              onChange={setDate}
            />
            <TimeKnownField
              label={locale === 'tr' ? 'Doğum saati' : 'Birth time'}
              value={time}
              onChange={setTime}
              known={timeKnown}
              onKnownChange={setTimeKnown}
              knownLabel={t('compat.timeKnown')}
            />
            <LabeledField label={locale === 'tr' ? 'Doğum yeri' : 'Birthplace'}>
              <div className="relative">
                <input
                  type="text"
                  value={placeQuery}
                  onChange={(e) => searchPlace(e.target.value)}
                  placeholder={t('compat.place')}
                  className={inputClass}
                />
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
          </div>
        </div>

        {/* Consent — GDPR Art.6 + Apple 5.1.1(ii). Üçüncü kişinin doğum
            verisini sisteme girmeden önce onayı şart. */}
        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-panelBorder bg-panel/20 p-4">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-cosmic"
          />
          <span className="text-[13px] leading-relaxed text-muted">
            {t('compat.consent')}
          </span>
        </label>

        {error ? (
          <p className="mt-4 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={compare}
          disabled={loading || !consent}
          className={`group mt-5 ${BTN_COSMIC}`}
        >
          {loading ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              {t('compat.loading')}
            </>
          ) : (
            <>
              <span className="text-xl">⚯</span>
              {t('compat.submit')}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </>
          )}
        </button>

        {result && narrative ? (
          <div id="compat-result" className="mt-12 space-y-10">
            {/* Paylaşılabilir uyum kartı — radar + rezonans */}
            {me && otherReport ? (
              <CompatShare a={me} b={otherReport} result={result} />
            ) : null}
            <CompatibilityView result={result} narrative={narrative} />
            {me && otherReport ? (
              <DeepAnalysisBox a={me} b={otherReport} result={result} />
            ) : null}
            {/* Başka birine bak — banner */}
            <div className="mt-4 overflow-hidden rounded-3xl border border-cosmic/50 bg-gradient-to-br from-[#0b0524] via-[#1e1a6e] to-[#9d3cb1]/30 p-6 text-center md:p-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-cosmic">
                {locale === 'tr' ? 'DEVAM ET' : 'KEEP GOING'}
              </p>
              <h3 className="mt-2 font-display text-2xl text-ink md:text-3xl">
                {locale === 'tr' ? 'Başka biriyle uyumuna bak' : 'See your match with someone else'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setNarrative(null);
                  setName('');
                  setDate('');
                  setPlaceQuery('');
                  setPlace(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-cosmic px-7 py-3 text-sm font-bold text-white shadow-glow transition-transform hover:scale-[1.02]"
              >
                <span>⚯</span> {t('compat.again')}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
