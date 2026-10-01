'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { Chart, PlanetName, ZodiacSign } from '@/lib/types';
import { PLANETS } from './planetMeta';
import { SIGN_GLYPHS, SIGN_NAMES_TR } from '@/lib/content/astrology-content';
import { SIGN_NAMES_EN, ordinalEn } from '@/lib/content/concepts-en';
import { Sheet } from '@/components/Sheet';
import { useT, useLocaleStore } from '@/lib/i18n';

const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => <SceneLoading />,
});

function SceneLoading() {
  const locale = useLocaleStore((s) => s.locale);
  return (
    <div className="flex h-[480px] items-center justify-center">
      <p className="text-sm text-muted">{locale === 'en' ? 'Loading the star system...' : 'Yıldız sistemi yükleniyor...'}</p>
    </div>
  );
}

type Props = { chart: Chart };

export function SolarSystem3D({ chart }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const { locale } = useT();
  const en = locale === 'en';
  const signName = (z: ZodiacSign) => (en ? SIGN_NAMES_EN[z] ?? SIGN_NAMES_TR[z] : SIGN_NAMES_TR[z]);
  const houseLabel = (h: number) => (en ? `${ordinalEn(h)} house` : `${h}. ev`);
  const selectedPlanet = PLANETS.find((p) => p.key === selected);
  const selectedChartData = selectedPlanet
    ? chart.planets.find((p) => p.name === (selectedPlanet.key as PlanetName))
    : null;

  return (
    <div className="relative">
      <div className="h-[440px] w-full overflow-hidden rounded-2xl border border-panelBorder bg-black/40 md:h-[560px]">
        <Scene chart={chart} onSelect={setSelected} selected={selected} locale={locale} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-faint">
        <span>
          {en
            ? '👆 Touch and rotate · 🔍 Pinch to zoom · ⊕ tap a planet → details'
            : '👆 Dokun ve döndür · 🔍 İki parmak yakınlaştır · ⊕ gezegen tıkla → detay'}
        </span>
        <span>
          {en
            ? `${PLANETS.length} planets, in their real positions at the moment of your birth`
            : `${PLANETS.length} gezegen, doğum anındaki gerçek konumlarda`}
        </span>
      </div>

      {selectedPlanet && selectedChartData ? (
        <Sheet
          onClose={() => setSelected(null)}
          overlayClassName="p-0 md:items-center md:p-6"
          panelClassName="max-w-lg rounded-t-3xl border border-gold/30 p-6 md:rounded-3xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
                {en ? 'PLANET' : 'GEZEGEN'}
              </p>
              <h2 className="mt-1 font-display text-3xl text-ink">
                {selectedPlanet.glyph} {en ? selectedPlanet.en : selectedPlanet.tr}
              </h2>
              <p className="mt-1 text-sm text-gold">
                {SIGN_GLYPHS[selectedChartData.sign as ZodiacSign]}{' '}
                {signName(selectedChartData.sign as ZodiacSign)}{' '}
                {selectedChartData.degreeInSign.toFixed(1)}°{' '}
                {selectedChartData.house ? `· ${houseLabel(selectedChartData.house)}` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-full border border-panelBorder px-3 py-1 text-lg leading-none text-muted hover:text-ink"
              aria-label={en ? 'Close' : 'Kapat'}
            >
              ×
            </button>
          </div>

          <p className="mt-5 text-[15px] leading-relaxed text-ink">
            {en ? selectedPlanet.domainEn : selectedPlanet.domain}
          </p>

          <div className="mt-5 grid gap-3 text-[13px]">
            <div className="rounded-xl border border-panelBorder bg-panel p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                {en ? 'ECLIPTIC POSITION' : 'EKLİPTİK KONUM'}
              </p>
              <p className="mt-1 text-ink">
                {selectedChartData.longitude.toFixed(2)}° · {signName(selectedChartData.sign as ZodiacSign)}{' '}
                {selectedChartData.degreeInSign.toFixed(1)}°
              </p>
            </div>
            <div className="rounded-xl border border-panelBorder bg-panel p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                {en ? 'HOUSE' : 'GÖKSEL EV'}
              </p>
              <p className="mt-1 text-ink">
                {en
                  ? `${selectedChartData.house ? `${ordinalEn(selectedChartData.house)} house` : 'House'}: the area of life where this energy lives`
                  : `${selectedChartData.house ?? '-'}. ev: bu enerjinin yaşam alanı`}
              </p>
            </div>
            <div className="rounded-xl border border-panelBorder bg-panel p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                {en ? 'ARCHETYPE' : 'ARKETİP'}
              </p>
              <p className="mt-1 text-ink">{en ? selectedPlanet.domainEn : selectedPlanet.domain}</p>
            </div>
          </div>

          <p className="mt-5 text-[11px] text-faint">
            {en
              ? 'In this view the Earth sits at the center with you, and the planets are placed at their ecliptic longitudes at the moment of your birth.'
              : 'Görselde Dünya seninle merkezde, gezegenler doğum anındaki ekliptik boylamlarında.'}
          </p>
        </Sheet>
      ) : null}
    </div>
  );
}
