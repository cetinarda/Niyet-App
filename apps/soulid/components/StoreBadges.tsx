'use client';

import { useT } from '@/lib/i18n';

/**
 * App Store + Google Play rozetleri. Yayın öncesi "Yakında" durumunda —
 * tıklanamaz, sadece bilgilendirme. Yayınlanınca href eklenip aktif olur.
 */

function AppleGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
      <path d="M16.365 1.43c0 1.14-.42 2.2-1.12 2.98-.77.85-2.02 1.5-3.06 1.42-.13-1.09.44-2.24 1.1-2.95.76-.83 2.09-1.44 3.08-1.45zM20.9 17.1c-.55 1.27-.82 1.84-1.53 2.96-.99 1.57-2.39 3.53-4.12 3.54-1.54.02-1.94-1-4.03-.99-2.09.01-2.52 1.01-4.06.99-1.73-.02-3.05-1.78-4.04-3.35C.29 15.4-.02 10.3 1.72 7.61c1.24-1.94 3.2-3.07 5.04-3.07 1.87 0 3.05 1.03 4.6 1.03 1.5 0 2.42-1.03 4.59-1.03 1.64 0 3.38.9 4.62 2.44-4.06 2.22-3.4 8.02.33 10.12z"/>
    </svg>
  );
}

function PlayGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path d="M3.6 2.3 13.4 12 3.6 21.7c-.35-.2-.6-.6-.6-1.05V3.35c0-.45.25-.85.6-1.05z" fill="#00d0ff"/>
      <path d="M16.6 8.8 13.4 12l3.2 3.2 3.3-1.9c.7-.4.7-1.4 0-1.8l-3.3-1.9z" fill="#ffce00"/>
      <path d="M3.6 2.3c.28-.16.62-.18.94 0L17.1 9.5l-3.7 2.5L3.6 2.3z" fill="#00f076"/>
      <path d="M3.6 21.7 13.4 12l3.7 2.5L4.54 21.7c-.32.18-.66.16-.94 0z" fill="#ff3a44"/>
    </svg>
  );
}

export function StoreBadges({ className = '' }: { className?: string }) {
  const { locale } = useT();
  const soon = locale === 'tr' ? 'Yakında' : 'Coming soon';
  const getIt = locale === 'tr' ? 'İndir' : 'Get it on';

  return (
    <div className={`flex flex-col items-center gap-3 sm:flex-row ${className}`}>
      <div
        role="button"
        aria-disabled
        className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-panelBorder bg-bgElevated px-5 py-3 text-ink opacity-90 sm:w-auto"
      >
        <AppleGlyph />
        <span className="text-left leading-tight">
          <span className="block text-[10px] uppercase tracking-widest text-faint">{getIt}</span>
          <span className="block text-sm font-bold">App Store · {soon}</span>
        </span>
      </div>
      <div
        role="button"
        aria-disabled
        className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-panelBorder bg-bgElevated px-5 py-3 text-ink opacity-90 sm:w-auto"
      >
        <PlayGlyph />
        <span className="text-left leading-tight">
          <span className="block text-[10px] uppercase tracking-widest text-faint">{getIt}</span>
          <span className="block text-sm font-bold">Google Play · {soon}</span>
        </span>
      </div>
    </div>
  );
}
