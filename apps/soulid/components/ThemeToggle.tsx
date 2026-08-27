'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { initTheme, useThemeStore, type Theme } from '@/lib/theme/store';
import { useT } from '@/lib/i18n';

const OPTIONS: { value: Theme; tr: string; en: string; glyph: string }[] = [
  { value: 'dark',  tr: 'Karanlık', en: 'Dark',  glyph: '☾' },
  { value: 'light', tr: 'Aydınlık', en: 'Light', glyph: '☀' },
];

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { locale } = useT();
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initTheme();
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      role="radiogroup"
      aria-label={locale === 'tr' ? 'Tema seçimi' : 'Theme selection'}
      className={clsx(
        'flex items-center rounded-full border border-panelBorder bg-panel/60 p-0.5',
        compact ? 'text-[10px]' : 'text-[11px]',
      )}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={theme === o.value}
          aria-label={locale === 'tr' ? o.tr : o.en}
          title={locale === 'tr' ? o.tr : o.en}
          onClick={() => setTheme(o.value)}
          className={clsx(
            'rounded-full px-2.5 py-1 font-bold transition-colors',
            theme === o.value
              ? 'bg-gold text-[#1a0a40] shadow-[0_4px_12px_-4px_rgba(245,208,97,0.4)]'
              : 'text-muted hover:text-ink',
          )}
        >
          {o.glyph}
        </button>
      ))}
    </div>
  );
}
