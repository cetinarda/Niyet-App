import { calculateStats, STAT_META, type CharacterStats as Stats } from '@/lib/stats';
import type { Chart, HumanDesign, Numerology } from '@/lib/types';

type Props = {
  chart: Chart;
  numerology: Numerology;
  humanDesign: HumanDesign;
};

export function CharacterStats({ chart, numerology, humanDesign }: Props) {
  const stats: Stats = calculateStats(chart, numerology, humanDesign);
  const entries = Object.entries(stats) as Array<[keyof Stats, number]>;
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const top3 = sorted.slice(0, 3).map(([k]) => k);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-[#0a0524] via-[#1a0a40] to-[#2a0a5a] p-6 shadow-glow">
      <div className="starfield opacity-30" />
      <div className="relative">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">KARAKTER KARTI</p>
            <p className="font-display text-2xl text-ink">Yıldız çocuğun güç haritası</p>
          </div>
          <div className="hidden text-right md:block">
            <p className="text-[10px] text-faint">Üstün yetenekler</p>
            <p className="text-[11px] text-gold">{top3.join(' · ')}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {entries.map(([key, value]) => {
            const meta = STAT_META[key];
            const isTop = top3.includes(key);
            return (
              <div
                key={key}
                className={`rounded-xl border p-3 ${
                  isTop ? 'border-gold/40 bg-gold/[0.06]' : 'border-white/10 bg-white/[0.04]'
                }`}
                title={meta.desc}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg" style={{ color: meta.color }}>
                      {meta.glyph}
                    </span>
                    <span className="text-[13px] font-bold text-ink">{key}</span>
                  </div>
                  <span className="font-display text-lg text-gold">{value}</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${value}%`, backgroundColor: meta.color }}
                  />
                </div>
                <p className="mt-1.5 text-[10px] leading-snug text-faint">{meta.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
