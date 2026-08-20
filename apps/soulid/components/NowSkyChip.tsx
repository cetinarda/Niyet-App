'use client';

import { useEffect, useState } from 'react';
import { nowSky, type NowSky } from '@/lib/astrology/now-sky';
import { SIGN_GLYPHS, SIGN_NAMES_TR } from '@/lib/content/astrology-content';
import { useT } from '@/lib/i18n';

const SIGN_NAMES_EN: Record<string, string> = {
  Aries: 'Aries', Taurus: 'Taurus', Gemini: 'Gemini', Cancer: 'Cancer',
  Leo: 'Leo', Virgo: 'Virgo', Libra: 'Libra', Scorpio: 'Scorpio',
  Sagittarius: 'Sagittarius', Capricorn: 'Capricorn', Aquarius: 'Aquarius', Pisces: 'Pisces',
};

export function NowSkyChip() {
  const { locale } = useT();
  const [sky, setSky] = useState<NowSky | null>(null);

  useEffect(() => {
    setSky(nowSky());
    const id = window.setInterval(() => setSky(nowSky()), 5 * 60 * 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!sky) return null;

  const sunName = locale === 'tr' ? SIGN_NAMES_TR[sky.sunSign] : SIGN_NAMES_EN[sky.sunSign];
  const phaseName = locale === 'tr' ? sky.phaseTr : sky.phaseEn;

  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-panelBorder bg-panel/40 px-4 py-2 text-[11px] tracking-wide text-muted backdrop-blur-md">
      <span className="flex items-center gap-1.5" title={locale === 'tr' ? 'Şu anki Güneş' : 'Sun now'}>
        <span className="text-gold">☉</span>
        <span className="text-ink">{SIGN_GLYPHS[sky.sunSign]} {sunName}</span>
      </span>
      <span className="text-faint">·</span>
      <span className="flex items-center gap-1.5" title={locale === 'tr' ? 'Ay evresi' : 'Moon phase'}>
        <span>{sky.phaseGlyph}</span>
        <span className="text-ink">{phaseName}</span>
      </span>
      <span className="text-faint">·</span>
      <span className="uppercase tracking-[0.3em] text-faint">{locale === 'tr' ? 'şu an' : 'now'}</span>
    </div>
  );
}
