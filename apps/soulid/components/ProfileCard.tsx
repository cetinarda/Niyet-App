'use client';

import { useMemo } from 'react';
import { Link } from '@/components/Link';
import type { GalacticReport, ZodiacSign } from '@/lib/types';
import { buildProfileDaily } from '@/lib/profile/daily';
import { MoonDisc } from '@/components/MoonDisc';
import { SIGN_GLYPHS, SIGN_NAMES_TR } from '@/lib/content/astrology-content';
import { useT } from '@/lib/i18n';

const HD_TR: Record<string, string> = {
  Generator: 'Generator',
  ManifestingGenerator: 'Manifesting Generator',
  Manifestor: 'Manifestör',
  Projector: 'Projektör',
  Reflector: 'Reflektör',
};

function fmtDate(iso: string, tr: boolean): string {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return tr ? `${d}.${m}.${y}` : `${m}/${d}/${y}`;
}

function SignPill({ label, sign, tr }: { label: string; sign: ZodiacSign; tr: boolean }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-panelBorder bg-bg/30 px-3.5 py-2.5">
      <span className="text-2xl text-gold">{SIGN_GLYPHS[sign]}</span>
      <div className="leading-tight">
        <span className="block text-[10px] uppercase tracking-[0.2em] text-faint">{label}</span>
        <span className="block text-sm font-bold text-ink">{tr ? SIGN_NAMES_TR[sign] : sign}</span>
      </div>
    </div>
  );
}

/**
 * "Profilim" — karnenin en üstündeki kişisel merkez:
 *  1) Doğum bilgilerin (düzenlenebilir — yanlış tarih burada görünür/düzeltilir)
 *  2) Temel bilgiler (Güneş / Ay / Yükselen / HD / Yaşam Yolu — ayrı blok)
 *  3) Günün Pusulası (Ay evresi + HD günlük transiti + söz + odak + haftaya bakış)
 */
export function ProfileCard({ report }: { report: GalacticReport }) {
  const { locale } = useT();
  const tr = locale === 'tr';
  const b = report.birth;
  const sun = report.chart.planets.find((p) => p.name === 'Sun');
  const moon = report.chart.planets.find((p) => p.name === 'Moon');

  const daily = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return buildProfileDaily(report, new Date());
  }, [report]);

  const timeText = b.birthTimeKnown === false
    ? (tr ? 'saat bilinmiyor' : 'time unknown')
    : (b.birthTime || '12:00');

  return (
    <section className="mt-8">
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.5em] text-gold">
        {tr ? 'PROFİLİM' : 'MY PROFILE'}
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {/* 1) DOĞUM BİLGİLERİN — düzenlenebilir */}
        <div className="card-surface rounded-3xl border border-panelBorder p-6">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-faint">
              {tr ? 'Doğum bilgilerin' : 'Your birth data'}
            </p>
            <Link
              href="/birth"
              className="rounded-full border border-gold/40 px-3.5 py-1.5 text-[11px] font-bold text-gold transition-colors hover:bg-gold/10"
            >
              {tr ? 'Düzenle' : 'Edit'}
            </Link>
          </div>
          <h3 className="mt-3 font-display text-2xl text-ink">{b.fullName}</h3>
          <dl className="mt-3 space-y-1.5 text-[13px]">
            <Row k={tr ? 'Tarih' : 'Date'} v={fmtDate(b.birthDate, tr)} />
            <Row k={tr ? 'Saat' : 'Time'} v={timeText} />
            <Row k={tr ? 'Yer' : 'Place'} v={b.birthPlace || '—'} />
          </dl>
          <p className="mt-3 text-[11px] leading-relaxed text-faint">
            {tr
              ? 'Ay/Yükselen yanlışsa çoğunlukla tarih ya da saat hatalıdır — Düzenle ile elle düzelt.'
              : 'If your Moon/Rising looks wrong, the date or time is usually off — fix it manually via Edit.'}
          </p>
        </div>

        {/* 2) TEMEL BİLGİLER — ayrı blok */}
        <div className="card-surface rounded-3xl border border-panelBorder p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-faint">
            {tr ? 'Temel bilgiler' : 'Core essentials'}
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {sun ? <SignPill label={tr ? 'Güneş' : 'Sun'} sign={sun.sign} tr={tr} /> : null}
            {moon ? <SignPill label={tr ? 'Ay' : 'Moon'} sign={moon.sign} tr={tr} /> : null}
            <SignPill label={tr ? 'Yükselen' : 'Rising'} sign={report.chart.ascendantSign} tr={tr} />
            <div className="flex items-center gap-2.5 rounded-2xl border border-panelBorder bg-bg/30 px-3.5 py-2.5">
              <span className="text-2xl text-cosmic">◇</span>
              <div className="leading-tight">
                <span className="block text-[10px] uppercase tracking-[0.2em] text-faint">Human Design</span>
                <span className="block text-sm font-bold text-ink">
                  {HD_TR[report.humanDesign.type] ?? report.humanDesign.type}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl border border-panelBorder bg-bg/30 px-3.5 py-2.5 sm:col-span-2">
              <span className="text-2xl text-gold">⌖</span>
              <div className="leading-tight">
                <span className="block text-[10px] uppercase tracking-[0.2em] text-faint">
                  {tr ? 'Yaşam Yolu' : 'Life Path'}
                </span>
                <span className="block text-sm font-bold text-ink">{report.numerology.lifePath}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3) GÜNÜN PUSULASI — HD transit + söz + odak + hafta */}
      {daily ? (
        <div className="mt-4 overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-[#0f1230] via-[#161a3d] to-[#0b0524] p-6 md:p-7">
          <div className="flex items-start gap-4">
            <MoonDisc fraction={daily.moon.fraction} waxing={daily.moon.waxing} size={52} />
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-gold">
                {tr ? 'GÜNÜN PUSULASI' : "TODAY'S COMPASS"}
              </p>
              <p className="mt-1 text-[15px] leading-relaxed text-ink">
                “{tr ? daily.advice.tr : daily.advice.en}”
              </p>
              <p className="mt-1 text-[11px] text-faint">
                {tr ? daily.moon.name.tr : daily.moon.name.en}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {/* HD günlük transiti */}
            <div className="rounded-2xl border border-cosmic/30 bg-cosmic/[0.06] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cosmic">
                {tr ? 'HD GÜNLÜK TRANSİT' : 'HD DAILY TRANSIT'}
              </p>
              <p className="mt-1.5 text-[13px] leading-snug text-ink">
                {tr
                  ? `Güneş bugün Kapı ${daily.hd.gate}.${daily.hd.line} — ${daily.hd.theme.tr}.`
                  : `Sun in Gate ${daily.hd.gate}.${daily.hd.line} today — ${daily.hd.theme.en}.`}
              </p>
              {daily.hd.personal ? (
                <p className="mt-1.5 text-[11px] font-bold text-cosmic">
                  {tr ? '✦ Senin tanımlı kapına dokunuyor' : '✦ Touches one of your defined gates'}
                </p>
              ) : null}
            </div>

            {/* Bakılacak yer */}
            <div className="rounded-2xl border border-panelBorder bg-bg/40 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                {tr ? 'BAKMAN GEREKEN YER' : 'WHERE TO LOOK'}
              </p>
              <p className="mt-1.5 text-[13px] leading-snug text-ink">{tr ? daily.focus.tr : daily.focus.en}</p>
            </div>

            {/* Haftaya bakış */}
            <div className="rounded-2xl border border-panelBorder bg-bg/40 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                {tr ? 'HAFTAYA BAKIŞ' : 'THE WEEK AHEAD'}
              </p>
              <p className="mt-1.5 text-[13px] leading-snug text-ink">{tr ? daily.week.tr : daily.week.en}</p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-panelBorder/50 pb-1.5 last:border-0">
      <dt className="text-faint">{k}</dt>
      <dd className="font-semibold text-ink">{v}</dd>
    </div>
  );
}
