'use client';

import type { GalacticReport, ZodiacSign } from '@/lib/types';
import { buildOutlook, type HDType } from '@/lib/compatibility/outlook';
import { SIGN_GLYPHS, SIGN_NAMES_TR } from '@/lib/content/astrology-content';
import { useT } from '@/lib/i18n';

const HD_TR: Record<HDType, string> = {
  Generator: 'Generator',
  ManifestingGenerator: 'Manifesting Generator',
  Manifestor: 'Manifestör',
  Projector: 'Projektör',
  Reflector: 'Reflektör',
};

function SignChip({ sign, locale, accent }: { sign: ZodiacSign; locale: string; accent: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-bold text-ink"
      style={{ borderColor: `${accent}55`, backgroundColor: `${accent}14` }}
    >
      <span style={{ color: accent }}>{SIGN_GLYPHS[sign]}</span>
      {locale === 'tr' ? SIGN_NAMES_TR[sign] : sign}
    </span>
  );
}

/**
 * Karne "Uyum Ufku" — bu haritanın kimlerle rezonansa girdiğinin
 * deterministik önizlemesi. Ayna Eş / Kutsal Birleşim / Ders Ortağı
 * arketipleri ana sayfadaki üçlemeyle bire bir aynı dil.
 */
export function CompatibilityOutlook({ report }: { report: GalacticReport }) {
  const { locale } = useT();
  const o = buildOutlook(report);
  const tr = locale === 'tr';

  return (
    <section className="mt-12">
      <div className="mb-5 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-gold">
          {tr ? 'UYUM UFKUN' : 'YOUR COMPATIBILITY HORIZON'}
        </p>
        <h2 className="mt-2 font-display text-3xl text-ink">
          {tr ? 'Bu harita kimlerle rezonansa girer?' : 'Who does this chart resonate with?'}
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* AYNA EŞ — Descendant */}
        <div className="card-surface rounded-3xl border p-6" style={{ borderColor: '#C9A0A655' }}>
          <div className="text-3xl">🪞</div>
          <h3 className="mt-3 font-display text-2xl text-ink">{tr ? 'Ayna Eşin' : 'Your Mirror Match'}</h3>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-4xl" style={{ color: '#C9A0A6' }}>{SIGN_GLYPHS[o.mirror]}</span>
            <div>
              <p className="text-lg font-bold text-ink">{tr ? SIGN_NAMES_TR[o.mirror] : o.mirror}</p>
              <p className="text-[11px] text-faint">
                {o.mirrorSource === 'ascendant'
                  ? (tr ? '7. evinin girişi — partner noktan' : 'Your 7th-house cusp — the partner point')
                  : (tr ? 'Güneşinin tam karşısı' : 'Directly opposite your Sun')}
              </p>
            </div>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            {tr
              ? 'Sende eksik olanı taşır; yoğun ama berraklaştıran bir çekim.'
              : 'Carries what you lack; an intense but clarifying pull.'}
          </p>
        </div>

        {/* KUTSAL BİRLEŞİM — üçgenler */}
        <div className="card-surface rounded-3xl border p-6" style={{ borderColor: '#C7B8E855' }}>
          <div className="text-3xl">✦</div>
          <h3 className="mt-3 font-display text-2xl text-ink">
            {tr ? 'Kutsal Birleşim Adayları' : 'Sacred Union Candidates'}
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {o.sacred.map((s) => (
              <SignChip key={s} sign={s} locale={locale} accent="#C7B8E8" />
            ))}
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            {tr
              ? 'Güneş ve Ay üçgenlerin — aynı elementin zahmetsiz akışı.'
              : 'Your Sun and Moon trines — the effortless flow of shared element.'}
          </p>
        </div>

        {/* DERS ORTAĞI — kareler */}
        <div className="card-surface rounded-3xl border p-6" style={{ borderColor: '#9CAF8855' }}>
          <div className="text-3xl">🌿</div>
          <h3 className="mt-3 font-display text-2xl text-ink">{tr ? 'Ders Ortakların' : 'Your Lesson Partners'}</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {o.lesson.map((s) => (
              <SignChip key={s} sign={s} locale={locale} accent="#9CAF88" />
            ))}
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            {tr
              ? 'Güneş karelerin — sürtünmesi seni büyüten bağlar.'
              : 'Your Sun squares — friction that grows you.'}
          </p>
        </div>
      </div>

      {/* HD müttefikleri + numeroloji ailesi */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="card-surface rounded-3xl border border-panelBorder p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-gold">
            {tr ? 'ENERJİ MÜTTEFİKLERİN · HUMAN DESIGN' : 'ENERGY ALLIES · HUMAN DESIGN'}
          </p>
          <ul className="mt-3 space-y-2.5">
            {o.hdAllies.map((a) => (
              <li key={a.type} className="flex items-baseline gap-2 text-sm">
                <span className="font-bold text-ink">{tr ? HD_TR[a.type] : a.type}</span>
                <span className="text-[13px] text-muted">— {tr ? a.why.tr : a.why.en}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card-surface rounded-3xl border border-panelBorder p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-gold">
            {tr ? 'SAYI AİLEN · NUMEROLOJİ' : 'YOUR NUMBER FAMILY · NUMEROLOGY'}
          </p>
          <div className="mt-3 flex items-center gap-2">
            {o.lifePathAllies.map((n) => (
              <span
                key={n}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-gold/10 font-display text-xl text-gold"
              >
                {n}
              </span>
            ))}
            <p className="ml-2 flex-1 text-[13px] leading-snug text-muted">
              {tr
                ? `Yaşam Yolu ${report.numerology.lifePath} ile aynı ritim ailesinde titreşen yollar.`
                : `Paths vibrating in the same rhythm family as Life Path ${report.numerology.lifePath}.`}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-[11px] text-faint">
        {tr
          ? 'Sembolik gözlemlerdir; kişiyi etiketlemez, kader tayin etmez.'
          : 'Symbolic observations — they label no one and decide no fate.'}
      </p>
    </section>
  );
}
