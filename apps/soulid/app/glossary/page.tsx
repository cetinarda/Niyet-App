'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { PageLayout } from '@/components/PageLayout';
import { GLOSSARY, type GlossaryEntry } from '@/lib/content/glossary';

const FILTERS: Array<{ key: GlossaryEntry['category'] | 'all'; label: string }> = [
  { key: 'all', label: 'Tümü' },
  { key: 'astrology', label: 'Astroloji' },
  { key: 'humandesign', label: 'Human Design' },
  { key: 'numerology', label: 'Numeroloji' },
  { key: 'systems', label: 'Sistemler' },
  { key: 'starseed', label: 'Yıldız Irkı' },
  { key: 'chakra', label: 'Çakra' },
  { key: 'biorhythm', label: 'Biyoritm' },
];

export default function Glossary() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('all');
  const items = useMemo(
    () => (filter === 'all' ? GLOSSARY : GLOSSARY.filter((g) => g.category === filter)),
    [filter],
  );

  return (
    <PageLayout
      kicker="KAVRAMLAR"
      title="Kozmik sözlüğün"
      intro="Karnende karşına çıkan tüm kavramların açıklamaları. Yaşam Yolu Sayısından çakralara, Kuzey Düğümden biyoritme."
    >
      <div className="flex flex-wrap gap-2.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={clsx(
              'rounded-full border px-5 py-2.5 text-[13px]',
              filter === f.key
                ? 'border-gold/60 bg-gold text-[#1a0a40] font-bold shadow-[0_8px_24px_-10px_rgba(245,208,97,0.45)]'
                : 'border-panelBorder bg-panel/30 text-muted hover:border-gold/40 hover:bg-white/[0.03] hover:text-ink',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {items.map((entry) => (
          <article
            key={entry.id}
            className="card-surface rounded-3xl border border-panelBorder p-7 md:p-8"
          >
            <h3 className="font-display text-xl text-ink">{entry.term}</h3>
            <p className="mt-4 text-[14px] leading-[1.85] text-muted">{entry.description}</p>
          </article>
        ))}
      </div>
    </PageLayout>
  );
}
