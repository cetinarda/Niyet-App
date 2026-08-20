'use client';

import { useMemo } from 'react';
import type { GalacticReport } from '@/lib/types';
import { todayTransits, moonPhase } from '@/lib/astrology/transits';
import { MoonDisc } from '@/components/MoonDisc';
import { useT } from '@/lib/i18n';

const TONE_COLOR: Record<string, string> = {
  flow: '#5bd9a0',
  tension: '#ff7ad9',
  blend: '#f5d061',
};

/**
 * "Bugünün Gökyüzü" — kişinin natal haritasına göre bugünkü transitler.
 * Her gün değişir; günlük geri gelme motoru. Deterministik, AI yok.
 * NOT: Date.now new Date() client'ta çalışır (SSR'da render edilmez — 'use client').
 */
export function TodaySky({ report }: { report: GalacticReport }) {
  const { locale } = useT();
  const tr = locale === 'tr';
  // build sırasında (SSG) Date kullanımı yok; sadece client render'da hesaplanır.
  const insights = useMemo(() => {
    if (typeof window === 'undefined') return [];
    return todayTransits(report, new Date());
  }, [report]);

  const moon = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return moonPhase(new Date());
  }, []);

  if (insights.length === 0) return null;

  const today = new Date().toLocaleDateString(tr ? 'tr-TR' : 'en-US', {
    day: 'numeric',
    month: 'long',
  });

  return (
    <section className="mt-12 overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-[#0f1230] via-[#161a3d] to-[#0b0524] p-6 md:p-8">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-gold">
            {tr ? 'BUGÜNÜN GÖKYÜZÜ' : "TODAY'S SKY"}
          </p>
          <h2 className="mt-2 font-display text-3xl text-ink">
            {tr ? 'Yıldızlar bugün sana ne diyor?' : 'What do the stars say today?'}
          </h2>
        </div>
        {moon ? (
          <div className="flex shrink-0 flex-col items-center gap-1.5">
            <MoonDisc fraction={moon.fraction} waxing={moon.waxing} />
            <span className="text-[10px] font-semibold tracking-wide text-gold/90">
              {tr ? moon.name.tr : moon.name.en}
            </span>
            <span className="text-[10px] text-faint">{today}</span>
          </div>
        ) : (
          <span className="shrink-0 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-bold text-gold">
            {today}
          </span>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {insights.map((it) => (
          <div key={it.id} className="flex gap-4 rounded-2xl border border-panelBorder bg-bg/40 p-4">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl"
              style={{ backgroundColor: `${TONE_COLOR[it.tone]}1a`, color: TONE_COLOR[it.tone] }}
            >
              {it.glyph}
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: TONE_COLOR[it.tone] }}>
                {tr ? it.title.tr : it.title.en}
              </p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink">
                {tr ? it.body.tr : it.body.en}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-[11px] text-faint">
        {tr
          ? 'Bugünkü gökyüzü × senin doğum haritan. Her gün yenilenir.'
          : "Today's sky × your natal chart. Refreshed daily."}
      </p>
    </section>
  );
}
