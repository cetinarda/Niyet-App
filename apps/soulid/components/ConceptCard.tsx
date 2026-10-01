'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { Sheet } from '@/components/Sheet';
import { useT } from '@/lib/i18n';

type Props = {
  kicker: string;
  title: string;
  highlight: string;
  short: string;
  details: { heading: string; body: string }[];
  accent?: string;
};

export function ConceptCard({ kicker, title, highlight, short, details, accent = '#f5d061' }: Props) {
  const [open, setOpen] = useState(false);
  const { locale } = useT();
  const en = locale === 'en';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="card-surface group rounded-3xl border border-panelBorder p-6 md:p-7 text-left hover:border-gold/50 hover:bg-white/[0.03]"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.35em]" style={{ color: accent }}>
          {kicker}
        </p>
        <h3 className="mt-3 font-display text-2xl text-ink">{title}</h3>
        <p className="mt-2 text-[12px] font-bold tracking-wide" style={{ color: accent }}>
          {highlight}
        </p>
        <p className="mt-4 text-[14px] leading-[1.85] text-muted">{short}</p>
        {/* Dokunmatikte hover yok: ipucu eskiden telefonda HİÇ görünmüyordu. */}
        <p className="mt-4 text-[11px] text-gold opacity-70 transition-opacity group-hover:opacity-100">
          {en ? 'Tap for details →' : 'Detaylar için tıkla →'}
        </p>
      </button>

      {open ? (
        <Sheet
          onClose={() => setOpen(false)}
          overlayClassName="p-0 md:items-center md:p-8"
          panelClassName="max-w-2xl rounded-t-3xl border border-panelBorder p-7 md:rounded-3xl md:p-10"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.35em]" style={{ color: accent }}>
                {kicker}
              </p>
              <h2 className="mt-3 font-display text-3xl text-ink">{title}</h2>
              <p className="mt-2 text-sm font-bold tracking-wide" style={{ color: accent }}>
                {highlight}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-panelBorder px-3.5 py-1 text-xl leading-none text-muted hover:text-ink"
              aria-label={en ? 'Close' : 'Kapat'}
            >
              ×
            </button>
          </div>

          <div className="mt-8 space-y-6">
            <p className="text-[15px] leading-[1.85] text-ink">{short}</p>
            {details.map((d, i) => (
              <section key={i} className="card-surface-elev rounded-2xl border border-panelBorder p-5 md:p-6">
                <h3 className={clsx('text-[11px] font-bold uppercase tracking-[0.3em]')} style={{ color: accent }}>
                  {d.heading}
                </h3>
                <p className="mt-3 whitespace-pre-line text-[14px] leading-[1.85] text-muted">{d.body}</p>
              </section>
            ))}
          </div>
        </Sheet>
      ) : null}
    </>
  );
}
