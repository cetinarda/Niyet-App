'use client';

// İki eksenli bağlanma haritası. Modelin kendisi iki boyutlu olduğu için
// (kaygı × kaçınma) görselleştirmesi de öyle: kullanıcı bir çeyreğe DÜŞMEZ,
// bir NOKTADA durur. Sınıra yakınsa bunu gözle görür, "ya o ya bu" değil.
//   X ekseni → kaçınma (sol: düşük, sağ: yüksek)
//   Y ekseni → kaygı   (alt: düşük, üst: yüksek)

import type { AttachmentStyle } from '@/lib/attachment';

type Props = {
  anxiety: number; // 0-100
  avoidance: number; // 0-100
  style: AttachmentStyle;
  labels: Record<AttachmentStyle, string>;
  axisLabels: { anxiety: string; avoidance: string; low: string; high: string };
};

const COLORS: Record<AttachmentStyle, string> = {
  secure: '#5bd9a0',
  anxious: '#f5b942',
  avoidant: '#c77dff',
  disorganized: '#7aa2f7',
};

export function AttachmentMap({ anxiety, avoidance, style, labels, axisLabels }: Props) {
  // 0-100 → 20..180 (kenarlarda pay bırak, nokta kenara yapışmasın)
  const cx = 20 + (avoidance / 100) * 160;
  const cy = 180 - (anxiety / 100) * 160;

  const quad = (
    x: number,
    y: number,
    s: AttachmentStyle,
  ) => (
    <rect
      x={x}
      y={y}
      width={80}
      height={80}
      rx={6}
      fill={COLORS[s]}
      opacity={style === s ? 0.34 : 0.09}
      stroke={style === s ? COLORS[s] : 'transparent'}
      strokeWidth={style === s ? 1.5 : 0}
    />
  );

  return (
    <div className="w-full">
      <svg viewBox="0 0 200 200" className="h-auto w-full max-w-sm mx-auto" role="img"
        aria-label={`${labels[style]}: ${axisLabels.anxiety} ${anxiety}, ${axisLabels.avoidance} ${avoidance}`}>
        {/* çeyrekler: sol-alt güvenli, sol-üst kaygılı, sağ-alt kaçıngan, sağ-üst düzensiz */}
        {quad(20, 100, 'secure')}
        {quad(20, 20, 'anxious')}
        {quad(100, 100, 'avoidant')}
        {quad(100, 20, 'disorganized')}

        {/* eksen çizgileri */}
        <line x1={100} y1={20} x2={100} y2={180} stroke="rgba(255,255,255,0.16)" strokeWidth={1} />
        <line x1={20} y1={100} x2={180} y2={100} stroke="rgba(255,255,255,0.16)" strokeWidth={1} />

        {/* çeyrek etiketleri */}
        <text x={24} y={34} fontSize={7} fill={COLORS.anxious} opacity={0.95}>{labels.anxious}</text>
        <text x={176} y={34} fontSize={7} fill={COLORS.disorganized} opacity={0.95} textAnchor="end">{labels.disorganized}</text>
        <text x={24} y={174} fontSize={7} fill={COLORS.secure} opacity={0.95}>{labels.secure}</text>
        <text x={176} y={174} fontSize={7} fill={COLORS.avoidant} opacity={0.95} textAnchor="end">{labels.avoidant}</text>

        {/* kullanıcının konumu */}
        <circle cx={cx} cy={cy} r={9} fill={COLORS[style]} opacity={0.25} />
        <circle cx={cx} cy={cy} r={4.5} fill={COLORS[style]} stroke="#fff" strokeWidth={1.5} />
      </svg>

      <div className="mt-3 flex justify-center gap-6 text-[11px] text-faint">
        <span>{axisLabels.avoidance}: <b className="text-ink">{avoidance}</b></span>
        <span>{axisLabels.anxiety}: <b className="text-ink">{anxiety}</b></span>
      </div>
    </div>
  );
}
