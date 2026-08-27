'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { buildLifeTimeline, PLANET_COLORS } from '@/lib/astrology/timeline';
import { useT } from '@/lib/i18n';

type Props = {
  birthISO: string;
  size?: number;
};

type Point = { x: number; y: number; planet: string; age: number; date: string };

const SIZE = 720;
const CENTER = SIZE / 2;
const OUTER_RADIUS = SIZE * 0.42;
const ZODIAC_GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

// Kaydırıcı okunurluğu için gezegen glifleri + burç adları (lokalize).
const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
};
const PLANET_ORDER = ['Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const SIGN_NAMES: Record<'tr' | 'en', string[]> = {
  tr: ['Koç', 'Boğa', 'İkizler', 'Yengeç', 'Aslan', 'Başak', 'Terazi', 'Akrep', 'Yay', 'Oğlak', 'Kova', 'Balık'],
  en: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
};

function signIndex(longitude: number): number {
  const v = ((longitude % 360) + 360) % 360;
  return Math.floor(v / 30) % 12;
}

function longitudeToXY(longitude: number, age: number, totalYears: number): { x: number; y: number } {
  // Spiral: yaş arttıkça merkeze yaklaşır. Açı = ekliptik boylam.
  const angle = ((longitude - 90) * Math.PI) / 180;
  const t = totalYears > 0 ? age / totalYears : 0;
  const r = OUTER_RADIUS * (1 - 0.55 * t);
  return {
    x: CENTER + Math.cos(angle) * r,
    y: CENTER + Math.sin(angle) * r,
  };
}

export function StarTreeOfLife({ birthISO, size = SIZE }: Props) {
  const { locale } = useT();
  const tr = locale === 'tr';
  // progress ∈ [0,1] — hem otomatik reveal animasyonunu hem manuel kaydırıcıyı sürer.
  const [progress, setProgress] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const [playKey, setPlayKey] = useState(0);
  const rafRef = useRef<number | null>(null);

  const { points, lines, totalYears, lifePathPoints, snapshots } = useMemo(() => {
    const snapshots = buildLifeTimeline(birthISO, 2); // her 6 ayda bir nokta
    const totalYears = snapshots[snapshots.length - 1]?.age ?? 0;

    const points: Point[] = [];
    const lifePath: Record<string, Point[]> = {};

    for (const snap of snapshots) {
      for (const planet of Object.keys(snap.positions)) {
        const lon = snap.positions[planet]!;
        const { x, y } = longitudeToXY(lon, snap.age, totalYears);
        const p = { x, y, planet, age: snap.age, date: snap.date };
        points.push(p);
        if (!lifePath[planet]) lifePath[planet] = [];
        lifePath[planet]!.push(p);
      }
    }

    // Web bağlantıları: aynı snapshot'taki gezegenler arası (aspect web)
    const lines: Array<{ x1: number; y1: number; x2: number; y2: number; opacity: number; step: number }> = [];
    snapshots.forEach((snap, idx) => {
      const planets = Object.keys(snap.positions);
      const pts: Point[] = planets.map((p) => {
        const { x, y } = longitudeToXY(snap.positions[p]!, snap.age, totalYears);
        return { x, y, planet: p, age: snap.age, date: snap.date };
      });
      // Her gezegenden 2 en yakın komşusuna bağlan (Voronoi/Delaunay benzeri ucuz)
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i]!;
        const others = pts
          .map((b, j) => ({ b, d: Math.hypot(a.x - b.x, a.y - b.y), j }))
          .filter((o) => o.j !== i)
          .sort((u, v) => u.d - v.d)
          .slice(0, 2);
        for (const { b } of others) {
          lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, opacity: 0.18, step: idx });
        }
      }
    });

    return { points, lines, totalYears, lifePathPoints: lifePath, snapshots };
  }, [birthISO]);

  const snapCount = Math.max(snapshots.length, 1);
  // Aktif an — kaydırıcı/animasyon konumundaki snapshot indeksi.
  const activeIdx = Math.min(snapCount - 1, Math.max(0, Math.round(progress * (snapCount - 1))));
  const revealStep = activeIdx;
  const activeSnap = snapshots[activeIdx];

  // Otomatik reveal: kullanıcı kaydırıcıya dokunana kadar hayat web'i 14sn'de çizilir.
  useEffect(() => {
    setScrubbing(false);
    setProgress(0);
    const start = performance.now();
    const duration = 14000;
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      // ease-in-out cubic
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setProgress(eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // playKey değişince (Tekrar Oynat) yeniden başlar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playKey]);

  function stopAutoplay() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  function onScrub(v: number) {
    stopAutoplay();
    setScrubbing(true);
    setProgress(v);
  }

  const activeAge = activeSnap?.age ?? 0;
  const activeYear = activeSnap?.date?.slice(0, 4) ?? '';

  return (
    <div className="relative mx-auto" style={{ width: size, maxWidth: '100%' }}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-auto w-full">
        <defs>
          <radialGradient id="nebula-bg" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#1a0a40" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#05060f" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#05060f" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="star-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="60%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Arkaplan nebulası */}
        <circle cx={CENTER} cy={CENTER} r={OUTER_RADIUS * 1.1} fill="url(#nebula-bg)" />

        {/* Zodyak çember + glifler */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={OUTER_RADIUS * 1.05}
          fill="none"
          stroke="rgba(245,208,97,0.18)"
          strokeWidth="0.5"
        />
        {ZODIAC_GLYPHS.map((glyph, i) => {
          const a = ((i * 30 - 75) * Math.PI) / 180;
          const r = OUTER_RADIUS * 1.13;
          return (
            <text
              key={glyph}
              x={CENTER + Math.cos(a) * r}
              y={CENTER + Math.sin(a) * r}
              fontSize="14"
              fill="rgba(245,208,97,0.5)"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {glyph}
            </text>
          );
        })}

        {/* Web bağlantıları — sırayla beliriyor */}
        {lines.map((l, i) => {
          const visible = l.step <= revealStep;
          return (
            <line
              key={i}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="0.6"
              opacity={visible ? 0.6 : 0}
              style={{ transition: 'opacity 300ms ease-out' }}
            />
          );
        })}

        {/* Her gezegenin yaşam yolu çizgisi (spiral) */}
        {Object.entries(lifePathPoints).map(([planet, pts]) => {
          const d = pts
            .filter((_, idx) => idx <= revealStep)
            .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
            .join(' ');
          return (
            <path
              key={planet}
              d={d}
              fill="none"
              stroke={PLANET_COLORS[planet] ?? '#fff'}
              strokeWidth="1.2"
              strokeOpacity="0.55"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {/* Yıldız noktaları */}
        {points.map((p, i) => {
          const stepOfPoint = Math.floor(i / PLANET_ORDER.length);
          const visible = stepOfPoint <= revealStep;
          if (!visible) return null;
          const color = PLANET_COLORS[p.planet] ?? '#fff';
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={4} fill="url(#star-glow)" opacity={0.5} />
              <circle cx={p.x} cy={p.y} r={1.4} fill={color} opacity={0.95} />
            </g>
          );
        })}

        {/* AKTİF AN — kaydırıcının bulunduğu yaştaki gezegenler (vurgulu başlar) */}
        {activeSnap
          ? PLANET_ORDER.map((planet) => {
              const lon = activeSnap.positions[planet];
              if (lon == null) return null;
              const { x, y } = longitudeToXY(lon, activeSnap.age, totalYears);
              const color = PLANET_COLORS[planet] ?? '#fff';
              return (
                <g key={`active-${planet}`}>
                  <circle cx={x} cy={y} r={8} fill="url(#star-glow)" opacity={0.75} />
                  <circle cx={x} cy={y} r={3.4} fill={color} opacity={1} stroke="#05060f" strokeWidth="0.6" />
                  <text
                    x={x}
                    y={y - 9}
                    fontSize="9"
                    fill={color}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    opacity={0.9}
                  >
                    {PLANET_GLYPHS[planet]}
                  </text>
                </g>
              );
            })
          : null}

        {/* Doğum noktası — merkez */}
        <circle cx={CENTER} cy={CENTER} r={6} fill="#f5d061" opacity="0.95" />
        <circle cx={CENTER} cy={CENTER} r={10} fill="none" stroke="#f5d061" strokeOpacity="0.4" />
      </svg>

      {/* Zaman kaydırıcı — doğumdan bugüne gezegenlerini elle gez */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] text-faint">
          <span>{tr ? 'Doğum' : 'Birth'}</span>
          <span className="font-bold text-gold">
            {tr ? 'Yaş' : 'Age'} {activeAge.toFixed(1)}
            {activeYear ? ` · ${activeYear}` : ''}
          </span>
          <span>{tr ? `Bugün (${totalYears.toFixed(0)} yıl)` : `Today (${totalYears.toFixed(0)} yr)`}</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={progress}
          onChange={(e) => onScrub(parseFloat(e.target.value))}
          onPointerDown={() => onScrub(progress)}
          aria-label={tr ? 'Yaşam zaman çizelgesi kaydırıcısı' : 'Life timeline scrubber'}
          className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-gold [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:shadow-glow"
        />
      </div>

      {/* Aktif andaki gezegen burçları — efemeris verisini görünür kılar */}
      {activeSnap ? (
        <div className="mt-3 grid grid-cols-3 gap-1.5 sm:grid-cols-5">
          {PLANET_ORDER.map((planet) => {
            const lon = activeSnap.positions[planet];
            if (lon == null) return null;
            const si = signIndex(lon);
            const color = PLANET_COLORS[planet] ?? '#fff';
            return (
              <div
                key={`read-${planet}`}
                className="flex items-center gap-1.5 rounded-lg border border-panelBorder bg-panel/60 px-2 py-1"
              >
                <span style={{ color }} className="text-sm leading-none">
                  {PLANET_GLYPHS[planet]}
                </span>
                <span className="text-[10px] leading-none text-muted">
                  {ZODIAC_GLYPHS[si]} {SIGN_NAMES[tr ? 'tr' : 'en'][si]}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-faint">
        <span>
          {tr
            ? 'Kaydırıcıyı sürükle — gezegenlerin doğumundan bugüne nasıl hareket ettiğini gör'
            : 'Drag the scrubber — watch your planets move from birth to today'}
        </span>
        <button
          type="button"
          onClick={() => setPlayKey((k) => k + 1)}
          className="rounded-full border border-gold/40 bg-gold/[0.06] px-3 py-1 text-[10px] font-bold tracking-wide text-gold hover:bg-gold/[0.12]"
        >
          {scrubbing ? (tr ? '▶ Otomatik Oynat' : '▶ Auto Play') : tr ? '↺ Tekrar Oynat' : '↺ Replay'}
        </button>
      </div>
    </div>
  );
}
