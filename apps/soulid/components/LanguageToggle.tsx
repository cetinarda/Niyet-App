'use client';

import { useEffect } from 'react';
import clsx from 'clsx';
import { initLocale, useLocaleStore } from '@/lib/i18n/store';

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  useEffect(() => {
    initLocale();
  }, []);

  return (
    <div
      className={clsx(
        'flex items-center rounded-full border border-panelBorder bg-panel/60 p-0.5',
        compact ? 'text-[10px]' : 'text-[11px]',
      )}
    >
      {(['tr', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          className={clsx(
            'rounded-full px-2.5 py-1 font-bold uppercase tracking-wide transition-colors',
            locale === l ? 'bg-gold text-[#1a0a40]' : 'text-muted hover:text-ink',
          )}
          aria-pressed={locale === l}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
