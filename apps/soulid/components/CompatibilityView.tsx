'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import type { CompatibilityResult } from '@/lib/compatibility';
import type { CompatNarrative } from '@/lib/compatibility/narrative';
import { drawCoupleCompass } from '@/lib/compatibility/compass';
import { useT } from '@/lib/i18n';
import { tap } from '@/lib/haptics';

// "Twilight Vellum" 5-katman pastel paleti
const LAYER = [
  { key: 'kimya', tr: 'Kimya', en: 'Chemistry', color: '#E8C28A', hint: { tr: 'Astroloji synastry — neden çekiyorsunuz', en: 'Astrology synastry — why you attract' } },
  { key: 'ders',  tr: 'Ders',  en: 'Lesson',    color: '#9CAF88', hint: { tr: 'Human Design — birbirinize ne öğretiyorsunuz', en: 'Human Design — what you teach each other' } },
  { key: 'ritim', tr: 'Ritim', en: 'Rhythm',    color: '#C9A0A6', hint: { tr: 'Numeroloji — hangi tempo ile akıyorsunuz', en: 'Numerology — what tempo you flow with' } },
  { key: 'kader', tr: 'Kader', en: 'Fate',      color: '#8FA3C2', hint: { tr: 'Vedik Ashtakuta — kozmik eşleşme dokusu', en: 'Vedic Ashtakuta — cosmic match weave' } },
] as const;

function ScoreRing({
  score,
  color,
  label,
  big = false,
  index = 0,
}: {
  score: number;
  color: string;
  label: string;
  big?: boolean;
  index?: number;
}) {
  const size = big ? 120 : 86;
  const r = big ? 50 : 34;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="select-none">
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={big ? 8 : 6} />
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={big ? 8 : 6}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cx})`}
          className="ring-draw"
          style={
            {
              '--ring-dash': dash,
              '--ring-circ': circ,
              animationDelay: `${index * 120}ms`,
            } as React.CSSProperties
          }
        />
        <text
          x={cx}
          y={cx + (big ? 6 : 4)}
          textAnchor="middle"
          fontSize={big ? 28 : 20}
          fill="currentColor"
          fontWeight="600"
          style={{ fontFamily: 'var(--font-display), serif' }}
          className="text-ink"
        >
          {score}
        </text>
      </svg>
      <span className="text-[11px] uppercase tracking-[0.25em] text-muted">{label}</span>
    </div>
  );
}

type Tab = 0 | 1 | 2 | 3;

const TAB_LABEL = {
  tr: ['İki Yıldız', 'Beş Pencere', 'Aynalar', 'Pusula'],
  en: ['Two Stars', 'Five Windows', 'Mirrors', 'Compass'],
} as const;

export function CompatibilityView({
  result,
  narrative,
}: {
  result: CompatibilityResult;
  narrative: CompatNarrative;
}) {
  const { t, locale } = useT();
  const [tab, setTab] = useState<Tab>(0);
  const navRef = useRef<HTMLElement>(null);
  const tabBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pill, setPill] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  useLayoutEffect(() => {
    function measure() {
      const navEl = navRef.current;
      const btn = tabBtnRefs.current[tab];
      if (!navEl || !btn) return;
      const navRect = navEl.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      setPill({
        x: btnRect.left - navRect.left,
        y: btnRect.top - navRect.top,
        w: btnRect.width,
        h: btnRect.height,
      });
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [tab, locale]);

  function selectTab(i: Tab) {
    if (i === tab) return;
    tap('light');
    setTab(i);
    const btn = tabBtnRefs.current[i];
    if (btn && 'scrollIntoView' in btn) {
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  const layerScores = useMemo(
    () => [result.scoreAstro, result.scoreHD, result.scoreNumerology, result.scoreFate],
    [result],
  );

  const scoresHeadline = useMemo(() => {
    const max = Math.max(...layerScores);
    const min = Math.min(...layerScores);
    const idxMax = layerScores.indexOf(max);
    const idxMin = layerScores.indexOf(min);
    return {
      strongest: LAYER[idxMax],
      weakest: LAYER[idxMin],
      diff: max - min,
    };
  }, [layerScores]);

  // 3-kart deterministik Pusula çekimi
  const compass = useMemo(
    () =>
      drawCoupleCompass(
        result.nameA,
        result.nameB,
        result.numerology.aLifePath,
        result.numerology.bLifePath,
      ),
    [result.nameA, result.nameB, result.numerology.aLifePath, result.numerology.bLifePath],
  );

  // "Aynalar" — defined→open merkezlerinden öz cümleler
  const mirrors = useMemo(() => {
    const aConditions = result.hdCenters.filter((c) => c.status === 'a-conditions-b').slice(0, 2);
    const bConditions = result.hdCenters.filter((c) => c.status === 'b-conditions-a').slice(0, 2);
    const shared = result.hdCenters.filter((c) => c.status === 'shared-openness').slice(0, 1);
    return [...aConditions, ...bConditions, ...shared].slice(0, 5);
  }, [result.hdCenters]);

  return (
    <div className="space-y-6">
      {/* Sade üst başlık — toplam skor halkası YOK */}
      <header className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">{t('cv.kicker')}</p>
        <h2 className="mt-2 font-display text-3xl text-ink md:text-4xl">{result.headline}</h2>
        <p className="mt-3 text-[13px] text-muted">
          {locale === 'tr'
            ? `${result.nameA} ↔ ${result.nameB} · ${scoresHeadline.strongest[locale]} en güçlü pencere`
            : `${result.nameA} ↔ ${result.nameB} · ${scoresHeadline.strongest[locale]} is your strongest window`}
        </p>
      </header>

      {/* Tab navigasyonu — shared-element pill (Crouton pattern), mobile yatay scroll */}
      <nav
        ref={navRef}
        role="tablist"
        className="scrollbar-hide relative mx-auto flex max-w-2xl flex-nowrap items-center justify-start gap-1 overflow-x-auto rounded-full border border-panelBorder bg-panel/30 p-1.5 backdrop-blur-md md:justify-center"
      >
        {pill ? (
          <span
            aria-hidden
            className="pointer-events-none absolute rounded-full bg-gold shadow-[0_8px_24px_-8px_rgba(245,208,97,0.4)]"
            style={{
              left: pill.x,
              top: pill.y,
              width: pill.w,
              height: pill.h,
              transition: 'left 480ms cubic-bezier(0.16, 1, 0.3, 1), top 480ms cubic-bezier(0.16, 1, 0.3, 1), width 480ms cubic-bezier(0.16, 1, 0.3, 1), height 480ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        ) : null}
        {TAB_LABEL[locale].map((label, i) => (
          <button
            key={label}
            ref={(el) => { tabBtnRefs.current[i] = el; }}
            type="button"
            role="tab"
            onClick={() => selectTab(i as Tab)}
            className={clsx(
              'relative z-10 rounded-full px-4 py-2.5 text-[12px] font-bold tracking-wide transition-colors duration-200',
              tab === i
                ? 'text-[#1a0a40]'
                : 'text-muted hover:text-ink',
            )}
            aria-pressed={tab === i}
            aria-selected={tab === i}
          >
            <span className="opacity-50">{(i + 1).toString().padStart(2, '0')}</span>
            <span className="ml-1.5">{label}</span>
          </button>
        ))}
      </nav>

      {/* TAB 0 — İki Yıldız: kim kim, hızlı tanışma */}
      {tab === 0 ? (
        <section className="grid gap-4 md:grid-cols-2">
          <PersonCard
            name={result.nameA}
            lifePath={result.numerology.aLifePath}
            label={locale === 'tr' ? '1. Yıldız' : 'Star 1'}
            accent="#E8C28A"
            nakshatra={result.ashtakuta.pair.aNakshatra}
          />
          <PersonCard
            name={result.nameB}
            lifePath={result.numerology.bLifePath}
            label={locale === 'tr' ? '2. Yıldız' : 'Star 2'}
            accent="#C9A0A6"
            nakshatra={result.ashtakuta.pair.bNakshatra}
          />
        </section>
      ) : null}

      {/* TAB 1 — Beş Pencere: 4 katman skoru + tek pusula */}
      {tab === 1 ? (
        <section className="space-y-5">
          <div className="card-surface grid grid-cols-2 gap-y-8 gap-x-4 rounded-3xl border border-panelBorder p-8 md:grid-cols-4 md:p-10">
            {LAYER.map((layer, i) => (
              <button
                key={layer.key}
                type="button"
                onClick={() => setTab(2)}
                className="group flex flex-col items-center gap-2"
              >
                <ScoreRing score={layerScores[i]!} color={layer.color} label={layer[locale]} index={i} />
                <span className="text-center text-[11px] leading-snug text-muted opacity-0 transition-opacity group-hover:opacity-100">
                  {layer.hint[locale]}
                </span>
              </button>
            ))}
          </div>

          <article className="card-surface rounded-2xl border border-panelBorder p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold">
              {locale === 'tr' ? 'BİRLİKTE' : 'TOGETHER'}
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink">{narrative.overview}</p>
          </article>

          {/* Ashtakuta tek satır özet */}
          <article className="rounded-2xl border border-[#8FA3C2]/40 bg-[#8FA3C2]/[0.06] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: '#8FA3C2' }}>
              {locale === 'tr' ? 'VEDİK KADER DOKUSU' : 'VEDIC FATE WEAVE'}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-ink">
              {result.ashtakuta.notes.summary[locale]}
            </p>
          </article>
        </section>
      ) : null}

      {/* TAB 2 — Aynalar: birbirine ne yansıttıklarınız */}
      {tab === 2 ? (
        <section className="space-y-6">
          <div className="card-surface rounded-3xl border border-panelBorder p-6 md:p-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold">
              {locale === 'tr' ? 'BİRBİRİNİZE NE YANSITIYORSUNUZ' : 'WHAT YOU REFLECT IN EACH OTHER'}
            </p>
            <p className="mt-3 text-[13px] leading-[1.75] text-muted">
              {locale === 'tr'
                ? 'Tanımlı taraf, açık tarafa o alanda kendi enerjisini gösterir. Birbirinizin gölgesini ve potansiyelini ayna gibi yansıtırsınız.'
                : "The defined side shows its energy to the open side in that area. You mirror each other's shadow and potential."}
            </p>
          </div>

          <div className="space-y-4">
            {mirrors.length === 0 ? (
              <p className="card-surface rounded-2xl border border-panelBorder p-6 text-sm leading-[1.75] text-muted">
                {locale === 'tr'
                  ? 'Belirgin bir koşullama yok — ikiniz de bağımsız enerji alanlarında dans ediyorsunuz.'
                  : 'No prominent conditioning — you both dance in independent energy fields.'}
              </p>
            ) : (
              mirrors.map((m, i) => (
                <div key={i} className="card-surface rounded-2xl border border-panelBorder p-5 md:p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">{m.centerTr}</p>
                  <p className="mt-2 text-[12px] text-muted">{m.statusLabel}</p>
                  <p className="mt-4 text-[14px] leading-[1.75] text-ink">{m.meaning}</p>
                </div>
              ))
            )}
          </div>

          {narrative.hdDynamic ? (
            <div className="rounded-3xl border border-[#9CAF88]/40 bg-[#9CAF88]/[0.05] p-6 md:p-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: '#9CAF88' }}>
                {t('cv.hdDance')}
              </p>
              <p className="mt-3 text-[14px] leading-[1.75] text-ink">{narrative.hdDynamic}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* TAB 3 — Pusula: birlikte ne yapmalılar */}
      {tab === 3 ? (
        <section className="space-y-6">
          {/* 3-kart deterministik tarot çekimi */}
          <div className="rounded-3xl border border-[#C7B8E8]/40 bg-[#C7B8E8]/[0.04] p-6 md:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: '#C7B8E8' }}>
              {locale === 'tr' ? 'ÜÇ KART · ORTAK ÇEKİM' : 'THREE CARDS · COUPLE PULL'}
            </p>
            <p className="mt-3 text-[13px] leading-[1.75] text-muted">
              {locale === 'tr'
                ? 'İsimlerinizden ve sayılarınızdan üretilmiş sabit bir çekim — her seferinde aynı kartları görürsünüz.'
                : 'A fixed pull generated from your names and numbers — the same cards every time.'}
            </p>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {compass.cards.map((c) => (
                <div key={c.position} className="card-surface-elev rounded-2xl border border-panelBorder p-6 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: '#C7B8E8' }}>
                    {locale === 'tr' ? c.positionTr : c.positionEn}
                  </p>
                  <div className="mt-5 text-5xl">{c.glyph}</div>
                  <p className="mt-4 font-display text-xl text-ink">{locale === 'tr' ? c.name : c.nameEn}</p>
                  <p className="mt-3 text-[12px] leading-[1.75] text-muted">
                    {c.reading[locale]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gold/40 bg-gold/[0.04] p-7 md:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold">
              {locale === 'tr' ? 'PUSULA' : 'COMPASS'}
            </p>
            <p className="mt-4 text-[15px] leading-[1.85] text-ink">{narrative.advice}</p>
          </div>

          {narrative.strengths.length > 0 ? (
            <section className="rounded-3xl border border-[#9CAF88]/40 bg-[#9CAF88]/[0.05] p-6 md:p-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: '#9CAF88' }}>
                {t('cv.strengths')}
              </p>
              <ul className="mt-5 space-y-3">
                {narrative.strengths.slice(0, 4).map((s, i) => (
                  <li key={i} className="flex gap-3 text-[14px] leading-[1.75] text-ink">
                    <span style={{ color: '#9CAF88' }}>✦</span>
                    <span className="flex-1">{s}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {narrative.frictions.length > 0 ? (
            <section className="rounded-3xl border border-[#C9A0A6]/40 bg-[#C9A0A6]/[0.05] p-6 md:p-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: '#C9A0A6' }}>
                {t('cv.frictions')}
              </p>
              <ul className="mt-5 space-y-3">
                {narrative.frictions.slice(0, 4).map((s, i) => (
                  <li key={i} className="flex gap-3 text-[14px] leading-[1.75] text-ink">
                    <span style={{ color: '#C9A0A6' }}>◐</span>
                    <span className="flex-1">{s}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <p className="pt-2 text-center text-[11px] leading-[1.85] text-faint">
            {locale === 'tr'
              ? 'Bu bir sembolik gözlemdir. İki kişinin gidişatını tayin etmez; alan açar.'
              : 'This is a symbolic observation. It does not determine the course of two people; it opens space.'}
          </p>
        </section>
      ) : null}

      {/* Derinleş — opsiyonel detay */}
      <details className="card-surface rounded-2xl border border-panelBorder px-4 py-3 [&_summary::-webkit-details-marker]:hidden">
        <summary className="flex cursor-pointer items-center justify-between text-[12px] font-bold text-muted">
          <span>{locale === 'tr' ? 'Derinleş — tam motor çıktısı' : 'Go deeper — full engine output'}</span>
          <span className="text-gold">↓</span>
        </summary>
        <div className="mt-4 space-y-4 text-[13px]">
          {result.hdConnections.length > 0 ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">{t('cv.channels')}</p>
              <ul className="mt-2 space-y-1.5">
                {result.hdConnections.slice(0, 6).map((c, i) => (
                  <li key={i} className="text-muted">
                    <span className="text-ink">{t('cv.channel')} {c.channel}</span> · {c.theme}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {result.astroAspects.length > 0 ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">{t('cv.aspects')}</p>
              <ul className="mt-2 space-y-1.5">
                {result.astroAspects.slice(0, 6).map((x, i) => (
                  <li key={i} className="text-muted">
                    <span className="text-ink">{x.a} — {x.b}</span> · {x.aspect}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">
              {locale === 'tr' ? 'Vedik Ashtakuta detayı' : 'Vedic Ashtakuta detail'}
            </p>
            <ul className="mt-2 space-y-1.5 text-muted">
              <li>Nadi · {result.ashtakuta.raw.nadi}/8 — {result.ashtakuta.notes.nadi[locale]}</li>
              <li>Bhakuta · {result.ashtakuta.raw.bhakuta}/7 — {result.ashtakuta.notes.bhakuta[locale]}</li>
              <li>Gana · {result.ashtakuta.raw.gana}/6 — {result.ashtakuta.notes.gana[locale]}</li>
              <li>Yoni · {result.ashtakuta.raw.yoni}/4 — {result.ashtakuta.notes.yoni[locale]}</li>
            </ul>
          </div>
        </div>
      </details>
    </div>
  );
}

function PersonCard({
  name,
  lifePath,
  label,
  accent,
  nakshatra,
}: {
  name: string;
  lifePath: number;
  label: string;
  accent: string;
  nakshatra: string;
}) {
  return (
    <div
      className="card-surface rounded-3xl border p-6 text-center"
      style={{ borderColor: `${accent}40` }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.4em]" style={{ color: accent }}>
        {label}
      </p>
      <h3 className="mt-3 font-display text-3xl text-ink">{name}</h3>
      <div className="mt-4 inline-flex flex-col items-center gap-1 rounded-2xl border border-white/10 px-5 py-3">
        <span className="text-[10px] uppercase tracking-widest text-muted">Life Path · Nakshatra</span>
        <span className="text-base font-bold text-ink">
          {lifePath} · {nakshatra}
        </span>
      </div>
    </div>
  );
}
