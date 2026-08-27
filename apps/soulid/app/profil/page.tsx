'use client';

import { useNav } from '@/lib/nav';
import { useEffect, useState } from 'react';
import { CosmicBackground } from '@/components/CosmicBackground';
import { ProfileCard } from '@/components/ProfileCard';
import { useSoulStore } from '@/lib/store';
import { listReports } from '@/lib/supabase/reports';
import { readActiveReportId } from '@/lib/active-report';
import { useT } from '@/lib/i18n';

/**
 * "Profilin" — menüden erişilen kişisel merkez. Karneden ayrı: doğum bilgileri
 * (düzenlenebilir) + temel bilgiler + Günün Pusulası (ProfileCard).
 * Karne (report) ile aynı hydration: aktif karne yoksa son kaydedileni yükler.
 */
export default function ProfilPage() {
  const nav = useNav();
  const { t } = useT();
  const report = useSoulStore((s) => s.report);
  const setReport = useSoulStore((s) => s.setReport);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (report) {
      setHydrated(true);
      return;
    }
    const id = readActiveReportId();
    let cancelled = false;
    listReports()
      .then((list) => {
        if (cancelled) return;
        const found = (id ? list.find((r) => r.id === id) : undefined) ?? list[0];
        if (found) setReport(found);
      })
      .catch(() => {
        /* lokal cache yok */
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, [report, setReport]);

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

  return (
    <div className="relative py-20 md:py-28">
      <CosmicBackground variant="cosmic" />
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <ProfileCard report={report} />
      </div>
    </div>
  );
}
