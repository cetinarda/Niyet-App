'use client';

import { useEffect, useState } from 'react';
import { hasPremium, togglePremium, reportCount, compatCount, resetUsage } from '@/lib/entitlements';
import { IS_CAPACITOR } from '@/lib/nav';

// iOS/Capacitor build'inde ASLA gösterilmez (yanlışlıkla premium açıp
// stale localStorage bırakmasın). Sadece web dev / açık env flag'inde görünür.
const SHOW =
  !IS_CAPACITOR &&
  (process.env.NEXT_PUBLIC_SHOW_DEV_TOGGLE === '1' || process.env.NODE_ENV !== 'production');

export function DevToggle() {
  const [mounted, setMounted] = useState(false);
  const [premium, setPremium] = useState(false);
  const [reports, setReports] = useState(0);
  const [compats, setCompats] = useState(0);

  useEffect(() => {
    setMounted(true);
    setPremium(hasPremium());
    setReports(reportCount());
    setCompats(compatCount());
  }, []);

  if (!SHOW || !mounted) return null;

  function flip() {
    const next = togglePremium();
    setPremium(next);
  }

  function reset() {
    resetUsage();
    setReports(0);
    setCompats(0);
  }

  return (
    <div className="mt-6 rounded-xl border border-dashed border-white/10 bg-bg/40 px-4 py-3 text-[11px] text-faint">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="font-bold uppercase tracking-[0.3em] text-gold/70">DEV</span>
        <span>
          Premium:{' '}
          <span className={premium ? 'font-bold text-success' : 'font-bold text-danger'}>
            {premium ? 'AÇIK' : 'KAPALI'}
          </span>
        </span>
        <span>·</span>
        <span>Karne: {reports}</span>
        <span>·</span>
        <span>Uyum: {compats}</span>
        <button
          type="button"
          onClick={flip}
          className="ml-auto rounded-full border border-gold/50 px-3 py-1 font-bold uppercase tracking-wide text-gold hover:bg-gold/10"
        >
          {premium ? 'Premium\'u Kapat' : 'Premium\'u Aç'}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-white/20 px-3 py-1 font-bold uppercase tracking-wide text-muted hover:text-ink"
        >
          Sayaçları sıfırla
        </button>
      </div>
    </div>
  );
}
