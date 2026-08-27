import type { Chart, PlanetName } from '@/lib/types';
import { SIGN_GLYPHS } from '@/lib/content/astrology-content';

const PLANET_GLYPHS: Record<PlanetName, string> = {
  Sun: '☉',
  Moon: '☾',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  NorthNode: '☊',
  SouthNode: '☋',
  Chiron: '⚷',
  Ascendant: 'AC',
  MC: 'MC',
  Vertex: 'Vx',
};

const PLANET_COLORS: Record<PlanetName, string> = {
  Sun: '#f5d061',
  Moon: '#dadcff',
  Mercury: '#9dd9ff',
  Venus: '#ff7ad9',
  Mars: '#ff6b6b',
  Jupiter: '#f5a261',
  Saturn: '#c0a070',
  Uranus: '#7fffd4',
  Neptune: '#5b8def',
  Pluto: '#9c6bff',
  NorthNode: '#5bd9a0',
  SouthNode: '#c79dff',
  Chiron: '#ff9d7a',
  Ascendant: '#ffffff',
  MC: '#ffffff',
  Vertex: '#C7B8E8',
};

const SIZE = 720;
const C = SIZE / 2;
const R_OUTER = SIZE * 0.46;
const R_SIGNS = SIZE * 0.42;
const R_HOUSES = SIZE * 0.32;
const R_PLANETS = SIZE * 0.27;
const R_CENTER = SIZE * 0.06;

// Astrolojide ASC sol uçtadır (saat 9 yönü = 180°). Boylamı görsel açıya çevir.
function lonToAngle(longitude: number, ascLongitude: number): number {
  // Yıldız ekliptiği ters yönde dönüyor (saat yönünde) çizimde — ASC'yi 180°'ye sabitle.
  return ((180 - (longitude - ascLongitude)) * Math.PI) / 180;
}

function polar(angle: number, r: number) {
  return { x: C + Math.cos(angle) * r, y: C + Math.sin(angle) * r };
}

type Props = { chart: Chart; size?: number };

export function BirthChartWheel({ chart, size = SIZE }: Props) {
  const asc = chart.ascendant;
  const planets = chart.planets.filter(
    (p) => p.name !== 'Ascendant' && p.name !== 'MC',
  );

  // Aynı yere düşen gezegenleri görsel olarak dağıt
  const spread: typeof planets = [];
  const SORTED = [...planets].sort((a, b) => a.longitude - b.longitude);
  let lastAngle = -Infinity;
  for (const p of SORTED) {
    const ang = ((180 - (p.longitude - asc) + 360) % 360);
    let adjusted = ang;
    if (Math.abs(ang - lastAngle) < 8) adjusted = lastAngle + 8;
    lastAngle = adjusted;
    spread.push({ ...p, longitude: asc + (180 - adjusted) });
  }

  // 12 zodyak bölmesi (her 30°)
  const signWedges = Array.from({ length: 12 }).map((_, i) => {
    // sign i (Aries=0) spans longitude i*30 to (i+1)*30
    const startAng = lonToAngle(i * 30, asc);
    const midAng = lonToAngle(i * 30 + 15, asc);
    const endAng = lonToAngle((i + 1) * 30, asc);
    const start = polar(startAng, R_SIGNS);
    const mid = polar(midAng, R_SIGNS * 1.09);
    const end = polar(endAng, R_SIGNS);
    return { i, startAng, endAng, mid, glyph: Object.values(SIGN_GLYPHS)[i]! };
  });

  // 12 ev çizgisi (equal house — ASC = ev 1 başı)
  const houseLines = Array.from({ length: 12 }).map((_, i) => {
    const a = lonToAngle(i * 30 + 0, asc); // her ev 30° (equal)
    const outer = polar(a, R_HOUSES);
    const inner = polar(a, R_CENTER);
    return { i: i + 1, outer, inner, midAngle: lonToAngle(i * 30 + 15, asc) };
  });

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-auto w-full" width={size}>
      <defs>
        <radialGradient id="wheel-bg" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#1a0a40" stopOpacity="0.5" />
          <stop offset="80%" stopColor="#05060f" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#05060f" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx={C} cy={C} r={R_OUTER} fill="url(#wheel-bg)" />

      {/* Zodyak yüzükleri */}
      <circle cx={C} cy={C} r={R_OUTER} fill="none" stroke="rgba(245,208,97,0.35)" strokeWidth="1" />
      <circle cx={C} cy={C} r={R_SIGNS} fill="none" stroke="rgba(245,208,97,0.2)" strokeWidth="0.6" />
      <circle cx={C} cy={C} r={R_HOUSES} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />

      {/* Sign bölme çizgileri */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = lonToAngle(i * 30, asc);
        const inner = polar(a, R_SIGNS);
        const outer = polar(a, R_OUTER);
        return (
          <line
            key={`sl-${i}`}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke="rgba(245,208,97,0.35)"
            strokeWidth="0.6"
          />
        );
      })}

      {/* Sign glifleri */}
      {signWedges.map((w) => (
        <text
          key={`s-${w.i}`}
          x={w.mid.x}
          y={w.mid.y}
          fill="#f5d061"
          fontSize="20"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {w.glyph}
        </text>
      ))}

      {/* Ev çizgileri */}
      {houseLines.map((h) => (
        <line
          key={`h-${h.i}`}
          x1={h.inner.x}
          y1={h.inner.y}
          x2={h.outer.x}
          y2={h.outer.y}
          stroke={h.i === 1 || h.i === 10 ? 'rgba(245,208,97,0.7)' : 'rgba(255,255,255,0.15)'}
          strokeWidth={h.i === 1 || h.i === 10 ? 1.2 : 0.5}
        />
      ))}

      {/* Ev numaraları */}
      {houseLines.map((h) => {
        const labelAt = polar(h.midAngle, R_HOUSES - 18);
        return (
          <text
            key={`hl-${h.i}`}
            x={labelAt.x}
            y={labelAt.y}
            fill="rgba(244,241,255,0.4)"
            fontSize="10"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {h.i}
          </text>
        );
      })}

      {/* ASC + MC etiketleri */}
      {(() => {
        const ascAng = lonToAngle(asc, asc);
        const mcAng = lonToAngle(chart.midheaven, asc);
        const ascPos = polar(ascAng, R_OUTER + 14);
        const mcPos = polar(mcAng, R_OUTER + 14);
        return (
          <>
            <text x={ascPos.x} y={ascPos.y} fill="#f5d061" fontSize="11" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">AC</text>
            <text x={mcPos.x} y={mcPos.y} fill="#f5d061" fontSize="11" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">MC</text>
          </>
        );
      })()}

      {/* Gezegenler */}
      {spread.map((p) => {
        const a = lonToAngle(p.longitude, asc);
        const dot = polar(a, R_PLANETS);
        const labelDot = polar(a, R_PLANETS + 14);
        const color = PLANET_COLORS[p.name];
        const glyph = PLANET_GLYPHS[p.name];
        return (
          <g key={p.name}>
            <line
              x1={polar(a, R_HOUSES).x}
              y1={polar(a, R_HOUSES).y}
              x2={dot.x}
              y2={dot.y}
              stroke={color}
              strokeOpacity="0.35"
              strokeWidth="0.6"
            />
            <circle cx={dot.x} cy={dot.y} r="3" fill={color} />
            <text
              x={labelDot.x}
              y={labelDot.y}
              fill={color}
              fontSize="13"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {glyph}
            </text>
          </g>
        );
      })}

      {/* Merkez doğum noktası */}
      <circle cx={C} cy={C} r={R_CENTER} fill="none" stroke="rgba(245,208,97,0.4)" strokeWidth="0.6" />
      <circle cx={C} cy={C} r="3" fill="#f5d061" />
    </svg>
  );
}
