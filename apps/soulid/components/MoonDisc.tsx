/**
 * Ay evresi diski — sakin, gerçek geometri. Aydınlık yarım-daire + terminatör
 * elipsi (hilalde gölge oyar, şişkinde ışık ekler; dördünde düz). Tüm evrelerde
 * doğru: yeni → hilal → dördün → şişkin → dolunay. 8 evrede görsel doğrulandı.
 */
export function MoonDisc({
  fraction,
  waxing,
  size = 46,
}: {
  fraction: number;
  waxing: boolean;
  size?: number;
}) {
  const R = size / 2;
  const rxTerm = R * Math.abs(1 - 2 * fraction); // terminatör yarı-eni (dördünde 0)
  const gibbous = fraction > 0.5;
  const uid = `m${Math.round(fraction * 1000)}${waxing ? 'x' : 'n'}`;
  const litX = waxing ? R : 0; // aydınlık yarım: büyürken sağ, küçülürken sol
  const shadow = '#1a1b38';
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      style={{ filter: 'drop-shadow(0 0 8px rgba(245,208,97,0.25))' }}
    >
      <defs>
        <clipPath id={`${uid}c`}>
          <circle cx={R} cy={R} r={R - 1} />
        </clipPath>
        <radialGradient id={`${uid}g`} cx="38%" cy="34%" r="80%">
          <stop offset="0%" stopColor="#fffdf3" />
          <stop offset="100%" stopColor="#f2e3b0" />
        </radialGradient>
      </defs>
      <g clipPath={`url(#${uid}c)`}>
        <circle cx={R} cy={R} r={R} fill={shadow} />
        <rect x={litX} y={0} width={R} height={size} fill={`url(#${uid}g)`} />
        <ellipse cx={R} cy={R} rx={rxTerm} ry={R} fill={gibbous ? `url(#${uid}g)` : shadow} />
      </g>
      <circle cx={R} cy={R} r={R - 1} fill="none" stroke="rgba(245,208,97,0.4)" strokeWidth="1" />
    </svg>
  );
}
