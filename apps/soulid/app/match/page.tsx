'use client';

import { Link } from '@/components/Link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CosmicBackground } from '@/components/CosmicBackground';
import { CompatibilityView } from '@/components/CompatibilityView';
import { DeepAnalysisBox } from '@/components/DeepAnalysisBox';
import { CompatShare } from '@/components/CompatCard';
import { CosmicLoader } from '@/components/CosmicLoader';
import { geocodePlace, type GeocodeResult } from '@/lib/geocoding';
import { buildGalacticReport } from '@/lib/report';
import { compareReports, type CompatibilityResult } from '@/lib/compatibility';
import { generateCompatNarrative, type CompatNarrative } from '@/lib/compatibility/narrative';
import { decodeInvite } from '@/lib/compatibility/invite';
import type { BirthInput, GalacticReport } from '@/lib/types';
import { useT } from '@/lib/i18n';
import { FORM_INPUT, BTN_PRIMARY } from '@/lib/ui';
import { IS_CAPACITOR } from '@/lib/nav';
import { WEB_APP_OPEN } from '@/lib/feature-flags';
import { AppOnlyGate } from '@/components/AppOnlyGate';
import { LabeledField, DateField, TimeKnownField } from '@/components/LabeledField';

const inputClass = FORM_INPUT;

export default function MatchPageWrapper() {
  return (
    <Suspense fallback={
      <div className="relative min-h-[70vh]">
        <CosmicBackground variant="aurora" />
      </div>
    }>
      <MatchPage />
    </Suspense>
  );
}

function MatchPage() {
  const { t, locale } = useT();
  const params = useSearchParams();
  const [inviter, setInviter] = useState<GalacticReport | null>(null);
  const [inviterBirth, setInviterBirth] = useState<BirthInput | null>(null);
  const [inviteValid, setInviteValid] = useState<boolean | null>(null);

  // 2. kişi (sen) — formu
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
  const [meReport, setMeReport] = useState<GalacticReport | null>(null);

  useEffect(() => {
    const token = params.get('i');
    if (!token) {
      setInviteValid(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const decoded = await decodeInvite(token);
      if (cancelled) return;
      if (!decoded) {
        setInviteValid(false);
        return;
      }
      setInviterBirth(decoded);
      try {
        const r = await buildGalacticReport(decoded, locale);
        if (cancelled) return;
        setInviter(r);
        setInviteValid(true);
      } catch (e) {
        console.error(e);
        if (!cancelled) setInviteValid(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params, locale]);

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
    if (!inviter) return;
    if (!name || !date) {
      setError(t('compat.error'));
      return;
    }

    // Yer çözümü — kullanıcı öneriden seçtiyse hazır. Seçmeden yazıp direkt
    // gönderdiyse burada bir kez daha geocode dene (ağ boşsa offline gazetteer
    // devreye girer). Böylece "listeden seçmedim → buton çalışmıyor" kırılır.
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
      const me = await buildGalacticReport(
        {
          fullName: name,
          birthDate: date,
          birthTime: timeKnown ? time : '12:00',
          birthTimeKnown: timeKnown,
          birthPlace: `${resolved.name}, ${resolved.country}`,
          latitude: resolved.latitude,
          longitude: resolved.longitude,
          timezone: resolved.timezone,
        },
        locale,
      );
      const res = compareReports(inviter, me, locale);
      const narr = await generateCompatNarrative(inviter, me, res, locale);
      setMeReport(me);
      setResult(res);
      setNarrative(narr);
      setTimeout(() => {
        document.getElementById('match-result')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (e) {
      console.error(e);
      setError(locale === 'tr' ? 'Karşılaştırma yapılamadı.' : 'Comparison failed.');
    } finally {
      setLoading(false);
    }
  }

  if (!IS_CAPACITOR && !WEB_APP_OPEN) return <AppOnlyGate />;

  // Geçersiz davet
  if (inviteValid === false) {
    return (
      <div className="relative min-h-[70vh]">
        <CosmicBackground variant="aurora" />
        <div className="mx-auto max-w-lg px-6 py-20 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.5em] text-gold">
            {locale === 'tr' ? 'GEÇERSİZ DAVET' : 'INVALID INVITE'}
          </p>
          <h1 className="mt-3 font-display text-3xl text-ink">
            {locale === 'tr' ? 'Bu davet bağlantısı çalışmıyor' : 'This invite link does not work'}
          </h1>
          <p className="mt-3 text-sm text-muted">
            {locale === 'tr'
              ? 'Linkin bozulmuş veya süresi geçmiş olabilir. Kendi uyumunu hesaplamak için doğrudan ikili uyumu açabilirsin.'
              : 'The link may be broken or expired. You can open compatibility directly to compare with someone you know.'}
          </p>
          <Link
            href="/compatibility"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-7 py-4 text-sm font-bold text-[#1a0a40] shadow-glow"
          >
            <span>⚯</span>
            {locale === 'tr' ? 'İkili Uyumu Aç' : 'Open Compatibility'}
          </Link>
        </div>
      </div>
    );
  }

  // Yükleniyor — davet doğrulanıyor
  if (inviteValid === null) {
    return (
      <div className="relative min-h-[70vh]">
        <CosmicBackground variant="aurora" />
        <div className="mx-auto max-w-lg px-6 py-20 text-center">
          <p className="text-sm text-muted">
            {locale === 'tr' ? 'Davet açılıyor...' : 'Opening invite...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative py-20 md:py-28">
      {loading ? <CosmicLoader /> : null}
      <CosmicBackground variant="aurora" />
      <div className="mx-auto max-w-2xl px-5 md:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.5em] text-gold">
          {locale === 'tr' ? 'BİR DAVET ALDIN' : 'YOU HAVE AN INVITE'}
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-ink md:text-5xl">
          {locale === 'tr'
            ? `${inviterBirth?.fullName.split(' ')[0]} senin ile uyumunu görmek istiyor`
            : `${inviterBirth?.fullName.split(' ')[0]} wants to see your compatibility`}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          {locale === 'tr'
            ? 'Doğum bilgini gir, iki ruhun nasıl birbirini yansıttığını birlikte görelim. Verin sende kalır.'
            : 'Enter your birth info — let\'s see how two souls mirror each other. Your data stays with you.'}
        </p>

        {/* Davet eden */}
        <div className="mt-12 rounded-3xl border border-gold/30 bg-gold/[0.04] p-6 md:p-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-gold">
            {locale === 'tr' ? 'SENİ DAVET EDEN' : 'WHO INVITED YOU'}
          </p>
          <p className="mt-3 font-display text-2xl text-ink">{inviterBirth?.fullName}</p>
          <p className="mt-3 text-[13px] leading-[1.75] text-muted">
            {inviterBirth?.birthDate} · {inviterBirth?.birthPlace}
          </p>
        </div>

        {/* Sen */}
        <div className="mt-4 rounded-3xl border border-panelBorder bg-panel p-6 md:p-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cosmic">
            {locale === 'tr' ? 'SEN' : 'YOU'}
          </p>
          <div className="mt-4 space-y-5">
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

        {error ? (
          <p className="mt-4 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={compare}
          disabled={loading}
          className={`group mt-5 ${BTN_PRIMARY}`}
        >
          <span className="text-xl">⚯</span>
          {loading ? t('compat.loading') : t('compat.submit')}
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </button>

        {result && narrative ? (
          <div id="match-result" className="mt-12 space-y-10">
            {inviter && meReport ? (
              <CompatShare a={inviter} b={meReport} result={result} />
            ) : null}
            <CompatibilityView result={result} narrative={narrative} />
            {inviter && meReport ? (
              <DeepAnalysisBox a={inviter} b={meReport} result={result} />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
