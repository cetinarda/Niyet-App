'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { initMotion, useMotionStore, type MotionPref } from '@/lib/a11y/store';
import { useT } from '@/lib/i18n';

const OPTIONS: { value: MotionPref; trLabel: string; enLabel: string; glyph: string }[] = [
  { value: 'auto',    trLabel: 'Sistem',    enLabel: 'System', glyph: '◐' },
  { value: 'full',    trLabel: 'Tam',       enLabel: 'Full',   glyph: '✦' },
  { value: 'reduced', trLabel: 'Azaltılmış', enLabel: 'Reduced', glyph: '◦' },
];

export function MotionToggle() {
  const { locale } = useT();
  const pref = useMotionStore((s) => s.pref);
  const setPref = useMotionStore((s) => s.setPref);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initMotion();
    setMounted(true);
  }, []);
  if (!mounted) return null;

  return (
    <div role="radiogroup" aria-label={locale === 'tr' ? 'Hareket tercihi' : 'Motion preference'} className="flex items-center rounded-full border border-panelBorder bg-panel/60 p-0.5">
      {OPTIONS.map((opt) => {
        const active = pref === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setPref(opt.value)}
            className={clsx(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors',
              active ? 'bg-gold text-[#1a0a40]' : 'text-muted hover:text-ink',
            )}
          >
            <span aria-hidden>{opt.glyph}</span>
            <span>{locale === 'tr' ? opt.trLabel : opt.enLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
