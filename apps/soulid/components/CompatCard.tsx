'use client';

import { forwardRef, useRef, useState } from 'react';
import type { GalacticReport } from '@/lib/types';
import type { CompatibilityResult } from '@/lib/compatibility';
import { SIGN_GLYPHS, SIGN_NAMES_TR } from '@/lib/content/astrology-content';
import { captureNode, downloadDataUrl, shareDataUrl } from '@/lib/share';
import { BrandMark } from '@/components/BrandMark';
import { useT } from '@/lib/i18n';

/* ── 4 eksenli radar (Kimya · Ders · Ritim · Kader) — saf SVG, capture-safe ── */
function CompatRadar({
  scores,
  labels,
  size = 210,
}: {
  scores: [number, number, number, number];
  labels: [string, string, string, string];
  size?: number;
}) {
  const c = size / 2;
  const r = c - 34; // etiketlere yer bırak
  // Eksenler: üst, sağ, alt, sol
  const angles = [-90, 0, 90, 180].map((d) => (d * Math.PI) / 180);
  const pt = (angle: number, radius: number) =>
    `${(c + radius * Math.cos(angle)).toFixed(1)},${(c + radius * Math.sin(angle)).toFixed(1)}`;
  const poly = (scale: number) => angles.map((a) => pt(a, r * scale)).join(' ');
  const dataPoly = angles
    .map((a, i) => pt(a, r * Math.max(0.08, (scores[i] ?? 0) / 100)))
    .join(' ');
  const labelPos = [
    { x: c, y: c - r - 14, anchor: 'middle' },
    { x: c + r + 12, y: c + 4, anchor: 'start' },
    { x: c, y: c + r + 22, anchor: 'middle' },
    { x: c - r - 12, y: c + 4, anchor: 'end' },
  ] as const;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      {[0.33, 0.66, 1].map((s) => (
        <polygon key={s} points={poly(s)} fill="none" stroke="rgba(244,241,255,0.14)" strokeWidth="1" />
      ))}
      {angles.map((a, i) => (
        <line
          key={i}
          x1={c} y1={c}
          x2={c + r * Math.cos(a)} y2={c + r * Math.sin(a)}
          stroke="rgba(244,241,255,0.12)" strokeWidth="1"
        />
      ))}
      <polygon points={dataPoly} fill="rgba(245,208,97,0.28)" stroke="#f5d061" strokeWidth="2" />
      {angles.map((a, i) => (
        <circle
          key={i}
          cx={c + r * ((scores[i] ?? 0) / 100) * Math.cos(a)}
          cy={c + r * ((scores[i] ?? 0) / 100) * Math.sin(a)}
          r="3.5" fill="#f5d061"
        />
      ))}
      {labels.map((l, i) => (
        <text
          key={l}
          x={labelPos[i]!.x} y={labelPos[i]!.y}
          textAnchor={labelPos[i]!.anchor}
          fill="rgba(244,241,255,0.75)"
          fontSize="10" fontWeight="700" letterSpacing="0.12em"
        >
          {l.toUpperCase()} {Math.round(scores[i] ?? 0)}
        </text>
      ))}
    </svg>
  );
}

/* ── Paylaşılabilir uyum kartı ── */
export const CompatCard = forwardRef<
  HTMLDivElement,
  { a: GalacticReport; b: GalacticReport; result: CompatibilityResult }
>(function CompatCard({ a, b, result }, ref) {
  const { locale } = useT();
  const tr = locale === 'tr';
  const sunA = a.chart.planets.find((p) => p.name === 'Sun')!.sign;
  const sunB = b.chart.planets.find((p) => p.name === 'Sun')!.sign;
  const radarScores: [number, number, number, number] = [
    result.scoreAstro, result.scoreHD, result.scoreNumerology, result.scoreFate,
  ];
  const radarLabels: [string, string, string, string] = tr
    ? ['Kimya', 'Ders', 'Ritim', 'Kader']
    : ['Chemistry', 'Lesson', 'Rhythm', 'Fate'];

  return (
    <div
      ref={ref}
      data-theme="dark"
      className="relative w-full max-w-md overflow-hidden rounded-[28px] bg-galaxy p-6 text-ink card-glow"
      style={{ fontFamily: 'var(--font-sans), Inter, sans-serif' }}
    >
      <div className="starfield" />
      <div className="absolute inset-x-0 top-0 h-1/3 bg-[radial-gradient(40%_60%_at_50%_0%,rgba(124,92,255,0.45),transparent_70%)]" />

      <div className="relative flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2">
          <BrandMark size={16} className="text-gold" />
          <p className="text-[10px] font-bold tracking-[0.5em] text-gold">SOULPROFILE</p>
        </div>
        <p className="-mt-2 text-[10px] font-bold uppercase tracking-[0.4em] text-cosmic">
          {tr ? 'İKİ RUH · KOZMİK UYUM' : 'TWO SOULS · COSMIC MATCH'}
        </p>

        {/* İki taraf + merkez rezonans */}
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex-1 text-center">
            <div className="text-4xl" style={{ color: '#9dd9ff' }}>{SIGN_GLYPHS[sunA]}</div>
            <p className="mt-1 truncate font-display text-lg leading-tight">{result.nameA}</p>
            <p className="text-[10px] text-muted">{tr ? SIGN_NAMES_TR[sunA] : sunA}</p>
          </div>
          <div className="shrink-0 px-1">
            <p className="font-display text-5xl leading-none text-gold">
              {Math.round(result.scoreOverall)}
              <span className="text-2xl">%</span>
            </p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.3em] text-gold/80">
              {tr ? 'REZONANS' : 'RESONANCE'}
            </p>
          </div>
          <div className="flex-1 text-center">
            <div className="text-4xl" style={{ color: '#ff7ad9' }}>{SIGN_GLYPHS[sunB]}</div>
            <p className="mt-1 truncate font-display text-lg leading-tight">{result.nameB}</p>
            <p className="text-[10px] text-muted">{tr ? SIGN_NAMES_TR[sunB] : sunB}</p>
          </div>
        </div>

        <CompatRadar scores={radarScores} labels={radarLabels} />

        <p className="max-w-xs text-[12px] italic leading-relaxed text-muted">“{result.headline}”</p>

        <p className="text-[9px] tracking-[0.25em] text-faint">soulprofile.life</p>
      </div>
    </div>
  );
});

/* ── Kart + paylaş/indir butonları ── */
export function CompatShare({
  a, b, result,
}: {
  a: GalacticReport; b: GalacticReport; result: CompatibilityResult;
}) {
  const { locale } = useT();
  const tr = locale === 'tr';
  const cardRef = useRef<HTMLDivElement>(null);
  const [working, setWorking] = useState<'share' | 'download' | null>(null);

  async function run(kind: 'share' | 'download') {
    if (!cardRef.current) return;
    setWorking(kind);
    try {
      const dataUrl = await captureNode(cardRef.current);
      if (kind === 'share') await shareDataUrl(dataUrl, 'soulprofile-uyum.png');
      else downloadDataUrl(dataUrl, 'soulprofile-uyum.png');
    } catch (e) {
      console.error(e);
    } finally {
      setWorking(null);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <CompatCard ref={cardRef} a={a} b={b} result={result} />
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => run('share')}
          disabled={working !== null}
          className="rounded-full bg-gold px-6 py-3 text-sm font-bold text-[#1a0a40] disabled:opacity-60"
        >
          {working === 'share' ? (tr ? 'Hazırlanıyor...' : 'Preparing...') : (tr ? 'Kartı Paylaş' : 'Share Card')}
        </button>
        <button
          type="button"
          onClick={() => run('download')}
          disabled={working !== null}
          className="rounded-full border border-panelBorder bg-panel px-6 py-3 text-sm font-bold text-ink hover:border-gold disabled:opacity-60"
        >
          {working === 'download' ? (tr ? 'Hazırlanıyor...' : 'Preparing...') : (tr ? 'PNG İndir' : 'Download PNG')}
        </button>
      </div>
    </div>
  );
}
