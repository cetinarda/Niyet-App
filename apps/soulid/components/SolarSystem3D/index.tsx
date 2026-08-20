'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { Chart, PlanetName, ZodiacSign } from '@/lib/types';
import { PLANETS } from './planetMeta';
import { SIGN_GLYPHS, SIGN_NAMES_TR } from '@/lib/content/astrology-content';

const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[480px] items-center justify-center">
      <p className="text-sm text-muted">Yıldız sistemi yükleniyor...</p>
    </div>
  ),
});

type Props = { chart: Chart };

export function SolarSystem3D({ chart }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedPlanet = PLANETS.find((p) => p.key === selected);
  const selectedChartData = selectedPlanet
    ? chart.planets.find((p) => p.name === (selectedPlanet.key as PlanetName))
    : null;

  return (
    <div className="relative">
      <div className="h-[440px] w-full overflow-hidden rounded-2xl border border-panelBorder bg-black/40 md:h-[560px]">
        <Scene chart={chart} onSelect={setSelected} selected={selected} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-faint">
        <span>👆 Dokun ve döndür · 🔍 İki parmak yakınlaştır · ⊕ gezegen tıkla → detay</span>
        <span>{PLANETS.length} gezegen, doğum anındaki gerçek konumlarda</span>
      </div>

      {selectedPlanet && selectedChartData ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 p-0 md:items-center md:p-6"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-gold/30 bg-bgElevated p-6 md:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
                  GEZEGEN
                </p>
                <h2 className="mt-1 font-display text-3xl text-ink">
                  {selectedPlanet.glyph} {selectedPlanet.tr}
                </h2>
                <p className="mt-1 text-sm text-gold">
                  {SIGN_GLYPHS[selectedChartData.sign as ZodiacSign]}{' '}
                  {SIGN_NAMES_TR[selectedChartData.sign as ZodiacSign]}{' '}
                  {selectedChartData.degreeInSign.toFixed(1)}°{' '}
                  {selectedChartData.house ? `· ${selectedChartData.house}. ev` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full border border-panelBorder px-3 py-1 text-lg leading-none text-muted hover:text-ink"
                aria-label="Kapat"
              >
                ×
              </button>
            </div>

            <p className="mt-5 text-[15px] leading-relaxed text-ink">
              {selectedPlanet.domain}
            </p>

            <div className="mt-5 grid gap-3 text-[13px]">
              <div className="rounded-xl border border-panelBorder bg-panel p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                  EKLİPTİK KONUM
                </p>
                <p className="mt-1 text-ink">
                  {selectedChartData.longitude.toFixed(2)}° · {SIGN_NAMES_TR[selectedChartData.sign as ZodiacSign]}{' '}
                  {selectedChartData.degreeInSign.toFixed(1)}°
                </p>
              </div>
              <div className="rounded-xl border border-panelBorder bg-panel p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                  GÖKSEL EV
                </p>
                <p className="mt-1 text-ink">
                  {selectedChartData.house ?? '—'}. ev — bu enerjinin yaşam alanı
                </p>
              </div>
              <div className="rounded-xl border border-panelBorder bg-panel p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                  ARKETİP
                </p>
                <p className="mt-1 text-ink">{selectedPlanet.domain}</p>
              </div>
            </div>

            <p className="mt-5 text-[11px] text-faint">
              Görselde Dünya seninle merkezde, gezegenler doğum anındaki ekliptik
              boylamlarında.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
