'use client';

import { useEffect, useState } from 'react';
import { CosmicBackground } from '@/components/CosmicBackground';
import { CompatibilityView } from '@/components/CompatibilityView';
import { DeepAnalysisBox } from '@/components/DeepAnalysisBox';
import { CompatShare } from '@/components/CompatCard';
import { PairAvatars } from '@/components/PairAvatars';
import { listCompat } from '@/lib/supabase/reports';
import { buildGalacticReport } from '@/lib/report';
import { compareReports, type CompatibilityResult } from '@/lib/compatibility';
import { generateCompatNarrative, type CompatNarrative } from '@/lib/compatibility/narrative';
import { readActiveCompatId, clearActiveCompatId } from '@/lib/active-compat';
import { readSakinAvatar } from '@/lib/sakin-bridge';
import type { GalacticReport } from '@/lib/types';
import { useNav } from '@/lib/nav';
import { useT } from '@/lib/i18n';

/**
 * TAM UYUM DETAYI. "Detaylara git" (kısa sonuç ekranından) ve Geçmiş'teki
 * kayıtlı uyum kartlarından buraya gelinir.
 *
 * Kendi hesap etmez: `active-compat` handoff'undan compat ID'sini okur,
 * `listCompat()`'tan o kaydın birthA/birthB'sini bulur ve İKİ KARNEYİ +
 * SONUCU YENİDEN HESAPLAR. Astro/HD/numeroloji hesaplaması deterministik ve
 * anlık (ağ yok); yalnızca anlatı (narrative) AI'a gidiyor. Bu tek kod yolu
 * hem yeni hesaplanan hem geçmişten açılan uyum için aynı ekranı üretir.
 */
export default function PairResultPage() {
  const { t, locale } = useT();
  const nav = useNav();
  const [state, setState] = useState<
    | { phase: 'loading' }
    | { phase: 'error' }
    | { phase: 'ready'; a: GalacticReport; b: GalacticReport; result: CompatibilityResult; narrative: CompatNarrative }
  >({ phase: 'loading' });
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    setPhoto(readSakinAvatar());
    let cancelled = false;

    (async () => {
      const id = readActiveCompatId();
      if (!id) { if (!cancelled) setState({ phase: 'error' }); return; }
      const all = await listCompat();
      const entry = all.find((c) => c.id === id);
      if (!entry) { if (!cancelled) setState({ phase: 'error' }); return; }
      try {
        const [a, b] = await Promise.all([
          buildGalacticReport(entry.birthA, locale),
          buildGalacticReport(entry.birthB, locale),
        ]);
        const result = compareReports(a, b, locale);
        const narrative = await generateCompatNarrative(a, b, result, locale);
        if (!cancelled) setState({ phase: 'ready', a, b, result, narrative });
      } catch (e) {
        console.error(e);
        if (!cancelled) setState({ phase: 'error' });
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state.phase === 'error') {
    return (
      <div className="relative min-h-[100dvh]">
        <CosmicBackground variant="aurora" />
        <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col items-center justify-center px-6 text-center font-brand">
          <p className="text-[13px] leading-relaxed text-muted">{t('pair.result.notFound')}</p>
          <button
            type="button"
            onClick={() => { clearActiveCompatId(); nav.push('/pair'); }}
            className="mt-6 rounded-full border border-gold/50 bg-gold/[0.07] px-7 py-3 text-[12px] uppercase tracking-[0.3em] text-gold"
            style={{ WebkitAppearance: 'none', appearance: 'none' }}
          >
            {t('pair.add')}
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === 'loading') {
    return (
      <div className="relative min-h-[100dvh]">
        <CosmicBackground variant="galaxy" />
        <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col items-center justify-center px-6 font-brand">
          <span
            className="h-8 w-8 animate-spin rounded-full border-2 border-gold/25 border-t-gold"
            aria-hidden
          />
          <p className="mt-5 text-[11px] uppercase tracking-[0.35em] text-faint">{t('compat.loading')}</p>
        </div>
      </div>
    );
  }

  const { a, b, result, narrative } = state;
  const aSun = a.chart.planets.find((p) => p.name === 'Sun')?.sign ?? null;
  const bSun = b.chart.planets.find((p) => p.name === 'Sun')?.sign ?? null;

  return (
    <div className="relative min-h-[100dvh] pb-16">
      <CosmicBackground variant="aurora" />
      <div className="mx-auto max-w-3xl px-5 pt-8 md:px-6">
        <button
          type="button"
          onClick={() => nav.push('/menu')}
          aria-label={t('common.back')}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-panelBorder text-lg text-muted"
          style={{ WebkitAppearance: 'none', appearance: 'none', background: 'none' }}
        >
          ‹
        </button>

        <div className="mt-8 flex justify-center font-brand">
          <PairAvatars
            meLabel={(a.birth.fullName || '').trim().split(/\s+/)[0] || t('pair.you')}
            meSign={aSun}
            mePhoto={photo}
            otherLabel={(b.birth.fullName || '').trim().split(/\s+/)[0] || t('pair.partner')}
            otherSign={bSun}
          />
        </div>

        <div className="mt-12 space-y-10">
          <CompatShare a={a} b={b} result={result} />
          <CompatibilityView result={result} narrative={narrative} />
          <DeepAnalysisBox a={a} b={b} result={result} />
        </div>

        <button
          type="button"
          onClick={() => nav.push('/menu')}
          className="mx-auto mt-10 block px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-faint"
          style={{ WebkitAppearance: 'none', appearance: 'none', background: 'none', border: 0 }}
        >
          {t('pair.result.close')}
        </button>
      </div>
    </div>
  );
}
