'use client';

import { useNav } from '@/lib/nav';
import { Link } from '@/components/Link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CosmicBackground } from '@/components/CosmicBackground';
import { ReportCard } from '@/components/ReportCard';
import { StarTreeOfLife } from '@/components/StarTreeOfLife';
import { BirthChartWheel } from '@/components/BirthChartWheel';
import { SolarSystem3D } from '@/components/SolarSystem3D';
import { CharacterStats } from '@/components/CharacterStats';
import { HeroCardShare } from '@/components/HeroCard';
import { ConceptCard } from '@/components/ConceptCard';
import { EngineMechanics } from '@/components/EngineMechanics';
import { InviteShare } from '@/components/InviteShare';
import { CompatibilityOutlook } from '@/components/CompatibilityOutlook';
import { TodaySky } from '@/components/TodaySky';
import { useSoulStore } from '@/lib/store';
import { listReports } from '@/lib/supabase/reports';
import { readActiveReportId } from '@/lib/active-report';
import { captureNode, downloadDataUrl, shareDataUrl } from '@/lib/share';
import { premiumOpen } from '@/lib/feature-flags';
import { buildConceptDecks } from '@/lib/concepts';
import { useT } from '@/lib/i18n';
import { tap } from '@/lib/haptics';

export default function ReportPage() {
  const nav = useNav();
  const { t, locale } = useT();
  const report = useSoulStore((s) => s.report);
  const setReport = useSoulStore((s) => s.setReport);
  const cardRef = useRef<HTMLDivElement>(null);
  const [working, setWorking] = useState<'share' | 'download' | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [showDeeper, setShowDeeper] = useState(false);

  // iOS Capacitor'da sayfa geçişi tam-sayfa reload → zustand sıfırlanıyor.
  // birth/ ve history/ sayfaları nav.push'tan önce activeReportId'yi yazıyor;
  // burada onu okuyup şifreli karne listesinden ilgili karneyi yüklüyoruz.
  useEffect(() => {
    if (report) {
      setHydrated(true);
      return;
    }
    // Kendi karnesi HER ZAMAN açılabilir: activeReportId varsa onu,
    // yoksa EN SON kaydedilen karneyi yükle. (id artık temizlenmiyor —
    // menüden /report'a her girişte son karne gelir.)
    const id = readActiveReportId();
    let cancelled = false;
    listReports()
      .then((list) => {
        if (cancelled) return;
        const found = (id ? list.find((r) => r.id === id) : undefined) ?? list[0];
        if (found) setReport(found);
      })
      .catch(() => {
        /* lokal cache yok / şifre çözülemedi */
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, [report, setReport]);

  const concepts = useMemo(() => (report ? buildConceptDecks(report) : []), [report]);

  if (hydrated && !report) {
    return (
      <div className="relative flex min-h-[70vh] items-center justify-center px-6">
        <CosmicBackground variant="cosmic" />
        <div className="rounded-2xl border border-panelBorder bg-panel p-8 text-center">
          <p className="text-base text-ink">{t('report.empty')}</p>
          <button
            type="button"
            onClick={() => nav.replace('/birth')}
            className="mt-4 rounded-full bg-gold px-6 py-3 text-sm font-bold text-[#1a0a40]"
          >
            {t('report.createCard')}
          </button>
        </div>
      </div>
    );
  }

  if (!report) return null;

  async function onShare() {
    if (!cardRef.current) return;
    setWorking('share');
    try {
      const dataUrl = await captureNode(cardRef.current);
      await shareDataUrl(dataUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setWorking(null);
    }
  }

  async function onDownload() {
    if (!cardRef.current) return;
    setWorking('download');
    try {
      const dataUrl = await captureNode(cardRef.current);
      downloadDataUrl(dataUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setWorking(null);
    }
  }

  const isPremium = premiumOpen();
  const birthISO =
    report.birth.birthDate
      ? `${report.birth.birthDate}T${report.birth.birthTime || '12:00'}:00Z`
      : new Date().toISOString();

  return (
    <div className="relative py-20 md:py-28">
      <CosmicBackground variant="cosmic" />
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <p className="text-center text-xs tracking-[0.3em] text-gold">{report.summary}</p>

        {/* AHA — paylaşılabilir kimlik kartı en üstte */}
        <div className="mt-6 flex justify-center">
          <ReportCard ref={cardRef} report={report} />
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onShare}
            disabled={working !== null}
            className="rounded-full bg-gold px-6 py-3 text-sm font-bold text-[#1a0a40] disabled:opacity-60"
          >
            {working === 'share' ? t('report.preparing') : t('report.share')}
          </button>
          <button
            type="button"
            onClick={onDownload}
            disabled={working !== null}
            className="rounded-full border border-panelBorder bg-panel px-6 py-3 text-sm font-bold text-ink hover:border-gold"
          >
            {working === 'download' ? t('report.preparing') : t('report.download')}
          </button>
        </div>

        {/* Uyum Ufku — ayna eş / kutsal birleşim / ders ortağı (en üstte, vurgulu) */}
        <CompatibilityOutlook report={report} />

        {/* Bugünün Gökyüzü — günlük transit motoru (geri gelme sebebi) */}
        <TodaySky report={report} />

        {/* Birini davet et — viral motor (Aha tabakası) */}
        <section className="mt-14">
          <InviteShare birth={report.birth} />
        </section>

        {/* ───────── KEŞFET tabakası ───────── */}
        <LayerDivider label={t('report.layerExplore')} />

        {/* Duygusal başlangıç — opening + soulStory (en sıcak iki paragraf) */}
        {(report.sections.opening || report.sections.soulStory) ? (
          <article className="card-surface mt-8 rounded-3xl border border-panelBorder p-6 md:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold">{t('report.discoverKicker')}</p>
            <h2 className="mt-2 font-display text-3xl text-ink">{report.birth.fullName}</h2>

            {report.sections.opening ? (
              <p className="mt-6 text-[15px] leading-relaxed text-ink">{report.sections.opening}</p>
            ) : null}

            {report.sections.soulStory ? (
              <section className="mt-6 rounded-2xl border border-gold/30 bg-gold/[0.04] p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold">{t('report.soulStory')}</p>
                <p className="mt-3 text-[15px] leading-relaxed text-ink">{report.sections.soulStory}</p>
              </section>
            ) : null}
          </article>
        ) : null}

        {/* Kahraman Kartı — indirilebilir RPG kartı (stat'lar oyun gibi) */}
        <HeroCardShare report={report} />

        {/* Karakter Stat Kartı — stat açıklamaları (detay) */}
        <section className="mt-10">
          <CharacterStats
            chart={report.chart}
            numerology={report.numerology}
            humanDesign={report.humanDesign}
          />
        </section>

        {/* Detaylı sistem kartları — tıklanabilir */}
        <section className="mt-12">
          <h2 className="mb-4 text-center font-display text-2xl text-ink">
            {t('report.concepts')}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {concepts.map((c) => (
              <ConceptCard
                key={c.kicker + c.title}
                kicker={c.kicker}
                title={c.title}
                highlight={c.highlight}
                short={c.short}
                details={c.details}
                accent={c.accent}
              />
            ))}
          </div>
        </section>

        {/* ───────── DERİNLEŞ tabakası — tek toggle ───────── */}
        <LayerDivider label={t('report.layerDeeper')} />

        <section className="mt-8">
          <button
            type="button"
            onClick={() => {
              tap('medium');
              setShowDeeper((v) => !v);
            }}
            aria-expanded={showDeeper}
            className="card-surface flex w-full items-center justify-between rounded-2xl border border-gold/30 px-5 py-4 text-left transition-colors hover:border-gold/60"
          >
            <span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.4em] text-gold">
                {report.birth.birthDate} · {report.birth.birthTime} · {report.birth.birthPlace}
              </span>
              <span className="mt-1 block font-display text-xl text-ink">{t('report.deeperHint')}</span>
            </span>
            <span className="shrink-0 rounded-full border border-gold/40 px-4 py-2 text-xs font-bold text-gold">
              {showDeeper ? t('report.deeperHide') : `${t('report.deeperBtn')} ↓`}
            </span>
          </button>

          {showDeeper ? (
            <div className="mt-6 space-y-6">
              {/* AI'nın derin parçaları — PREMIUM (sis altında) */}
              {(report.sections.astrology || report.sections.humanDesign || report.sections.callToAction) ? (
                  <article className="card-surface rounded-3xl border border-panelBorder p-6 md:p-8">
                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold">{t('report.narrative')}</p>
                    <div className="mt-4 space-y-4">
                      {report.sections.astrology ? (
                        <p className="text-[15px] leading-relaxed text-ink">{report.sections.astrology}</p>
                      ) : null}
                      {report.sections.humanDesign ? (
                        <p className="text-[15px] leading-relaxed text-ink">{report.sections.humanDesign}</p>
                      ) : null}
                      {report.sections.callToAction ? (
                        <p className="text-[15px] leading-relaxed text-ink">{report.sections.callToAction}</p>
                      ) : null}
                    </div>
                  </article>
              ) : null}

              {/* Bilgelik + Gölge — ücretsiz (kendi karne) */}
              {(report.sections.wisdoms.length > 0 || report.sections.shadows.length > 0) ? (
                  <div className="space-y-6">
                    {report.sections.wisdoms.length > 0 ? (
                      <section className="card-surface rounded-2xl border border-success/30 bg-success/[0.04] p-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-success">{t('report.wisdoms')}</p>
                        <ul className="mt-3 space-y-2">
                          {report.sections.wisdoms.map((w, i) => (
                            <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-ink">
                              <span className="text-success">✦</span>
                              <span className="flex-1">{w}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ) : null}

                    {report.sections.shadows.length > 0 ? (
                      <section className="card-surface rounded-2xl border border-cosmic/40 bg-cosmic/[0.06] p-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-cosmic">{t('report.shadows')}</p>
                        <ul className="mt-3 space-y-2">
                          {report.sections.shadows.map((s, i) => (
                            <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-ink">
                              <span className="text-cosmic">◐</span>
                              <span className="flex-1">{s}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ) : null}
                  </div>
              ) : null}

              {/* İnteraktif gökyüzü — ilk karnede ücretsiz (tam) */}
              <div className="space-y-6">
                  <div className="card-surface rounded-3xl border border-gold/30 p-4 md:p-6">
                    <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.4em] text-gold">
                      {t('report.sky3d')}
                    </p>
                    <SolarSystem3D chart={report.chart} />
                  </div>
                  <div className="card-surface rounded-3xl border border-panelBorder p-4 md:p-6">
                    <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.4em] text-gold">
                      {t('report.tree')}
                    </p>
                    <StarTreeOfLife birthISO={birthISO} />
                  </div>
                  <div className="card-surface rounded-3xl border border-panelBorder p-4 md:p-6">
                    <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.4em] text-gold">
                      {t('report.wheel')}
                    </p>
                    <div className="mx-auto max-w-xl">
                      <BirthChartWheel chart={report.chart} />
                    </div>
                  </div>
                  <EngineMechanics report={report} />
                </div>
            </div>
          ) : null}
        </section>

        {/* İkili uyum CTA — büyük, görsel */}
        <section className="mt-14 overflow-hidden rounded-3xl border border-cosmic/50 bg-gradient-to-br from-[#0b0524] via-[#1e1a6e] to-[#9d3cb1]/40 p-7 md:p-9">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-cosmic">
                {t('home.path2.title')}
              </p>
              <h2 className="mt-3 font-display text-3xl leading-tight text-ink md:text-4xl">
                {t('report.compatCta')}
              </h2>
              <div className="mt-5 flex flex-wrap gap-3 text-[12px] text-ink">
                <span className="rounded-full border border-cosmic/40 bg-cosmic/[0.08] px-3 py-1">⚡ {locale === 'tr' ? 'Çekim' : 'Attraction'}</span>
                <span className="rounded-full border border-cosmic/40 bg-cosmic/[0.08] px-3 py-1">◐ {locale === 'tr' ? 'Hâkimiyet' : 'Dominance'}</span>
                <span className="rounded-full border border-cosmic/40 bg-cosmic/[0.08] px-3 py-1">📊 {locale === 'tr' ? 'Uyum skoru' : 'Score'}</span>
                <span className="rounded-full border border-cosmic/40 bg-cosmic/[0.08] px-3 py-1">📜 {locale === 'tr' ? 'AI yorum' : 'AI reading'}</span>
              </div>
            </div>
            <Link
              href="/compatibility"
              className="group inline-flex shrink-0 items-center gap-3 rounded-full bg-cosmic px-8 py-5 text-base font-bold tracking-wide text-white shadow-glow transition-transform hover:scale-105"
            >
              <span className="text-xl">⚯</span>
              {t('report.compatBtn')}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </section>

        {/* Premium showcase — yıldız konum/hareketi (sadece premium yoksa) */}
        {!isPremium ? (
          <section className="mt-14 rounded-2xl border border-gold/40 bg-gold/[0.06] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">
              {locale === 'tr' ? 'SINIRSIZ ERİŞİM' : 'UNLIMITED ACCESS'}
            </p>
            <h3 className="mt-2 font-display text-3xl text-ink">
              {locale === 'tr' ? 'Farklı kişilere bak, sınırsız' : 'More people, unlimited'}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {locale === 'tr'
                ? 'İlk karnen ve ilk uyumun ücretsiz. Farklı kişilere bakmak ve tüm özelliklere sınırsız erişim için premium — tek seferlik $19.99 ya da aylık $4.99.'
                : 'Your first profile and compatibility are free. For other people and unlimited access to all features, go premium — $19.99 one-time or $4.99/mo.'}
            </p>
            <Link
              href="/premium"
              className="mt-4 inline-block rounded-full bg-gold px-6 py-3 text-sm font-bold text-[#1a0a40] shadow-glow"
            >
              {locale === 'tr' ? 'Sınırsız Erişimi Aç' : 'Unlock Unlimited'}
            </Link>
          </section>
        ) : null}

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-muted hover:text-gold">
            {t('report.newCard')}
          </Link>
        </div>
      </div>
    </div>
  );
}

function LayerDivider({ label }: { label: string }) {
  return (
    <div className="mt-16 flex items-center gap-4">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-panelBorderStrong to-transparent" />
      <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-faint">{label}</span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-panelBorderStrong to-transparent" />
    </div>
  );
}
