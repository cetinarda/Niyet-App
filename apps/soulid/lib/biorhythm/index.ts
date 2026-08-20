const TWO_PI = Math.PI * 2;

const CYCLES = {
  physical: 23,
  emotional: 28,
  mental: 33,
} as const;

export type BiorhythmDay = {
  date: string;
  physical: number;
  emotional: number;
  mental: number;
};

function daysBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return ms / (1000 * 60 * 60 * 24);
}

export function biorhythmForDate(birthISO: string, target: Date): {
  physical: number;
  emotional: number;
  mental: number;
} {
  const birth = new Date(birthISO);
  const days = daysBetween(birth, target);
  return {
    physical: Math.sin((TWO_PI * days) / CYCLES.physical) * 100,
    emotional: Math.sin((TWO_PI * days) / CYCLES.emotional) * 100,
    mental: Math.sin((TWO_PI * days) / CYCLES.mental) * 100,
  };
}

export function biorhythmRange(birthISO: string, startDate: Date, days = 14): BiorhythmDay[] {
  const result: BiorhythmDay[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate.getTime() + i * 24 * 3600 * 1000);
    const b = biorhythmForDate(birthISO, d);
    result.push({ date: d.toISOString().slice(0, 10), ...b });
  }
  return result;
}
