'use client';

import { useState } from 'react';
import { useT } from '@/lib/i18n';
import {
  deepAnalysisToMarkdown,
  generateDeepAnalysis,
  type DeepAnalysis,
} from '@/lib/compatibility/deep-analysis';
import type { CompatibilityResult } from '@/lib/compatibility';
import type { GalacticReport } from '@/lib/types';

type Props = {
  a: GalacticReport;
  b: GalacticReport;
  result: CompatibilityResult;
};

function Section({ title, children, accent }: { title: string; children: React.ReactNode; accent: string }) {
  return (
    <section className="card-surface rounded-2xl border p-5" style={{ borderColor: `${accent}40` }}>
      <h4 className="font-display text-xl text-ink" style={{ borderLeft: `3px solid ${accent}`, paddingLeft: '0.6rem' }}>
        {title}
      </h4>
      <div className="mt-3 space-y-3 text-[14px] leading-relaxed text-ink">{children}</div>
    </section>
  );
}

export function DeepAnalysisBox({ a, b, result }: Props) {
  const { t, locale } = useT();
  // Derin uyum analizi ÜCRETSİZ (ikili uyum tamamen açık).
  const premium = true;
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<DeepAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const a_ = await generateDeepAnalysis(a, b, result, locale);
      setAnalysis(a_);
    } catch (e) {
      // Ham hata mesajı (fetch/parse detayı) kullanıcıya gösterilmez.
      console.warn('[deep-analysis] generate failed', e);
      setError(
        locale === 'tr'
          ? 'Derin analiz şu anda oluşturulamadı. Lütfen tekrar dene.'
          : 'The deep analysis could not be generated right now. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  function download() {
    if (!analysis) return;
    const md = deepAnalysisToMarkdown(analysis, result.nameA, result.nameB, locale);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a_ = document.createElement('a');
    a_.href = url;
    const safe = `${result.nameA}-${result.nameB}`.replace(/\s+/g, '-').toLowerCase();
    a_.download = `soulprofile-deep-${safe}.md`;
    document.body.appendChild(a_);
    a_.click();
    document.body.removeChild(a_);
    URL.revokeObjectURL(url);
  }

  // Premium açık ama henüz üretilmedi
  if (!analysis) {
    return (
      <section className="rounded-3xl border border-gold/40 bg-gold/[0.06] p-6 md:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">
          {locale === 'tr' ? 'PREMIUM · TAM DERİNLİK ANALİZİ' : 'PREMIUM · FULL DEPTH ANALYSIS'}
        </p>
        <h3 className="mt-2 font-display text-2xl text-ink">
          {locale === 'tr' ? 'Hazırsın. 10 bölümlük derin okumayı üret.' : 'You\'re ready. Generate the 10-section deep reading.'}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {locale === 'tr'
            ? 'Üretim 20-40 saniye sürebilir. Üretildikten sonra markdown olarak indirebilirsin.'
            : 'Generation can take 20-40 seconds. Once produced, you can download it as markdown.'}
        </p>
        {error ? (
          <p className="mt-4 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</p>
        ) : null}
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="mt-5 inline-flex items-center gap-3 rounded-full bg-gold px-7 py-4 text-sm font-bold tracking-wide text-[#1a0a40] shadow-glow transition-transform hover:scale-105 disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1a0a40]/30 border-t-[#1a0a40]" />
              {locale === 'tr' ? 'Derin okuma yazılıyor...' : 'Writing deep reading...'}
            </>
          ) : (
            <>
              <span>✦</span>
              {locale === 'tr' ? 'Tam Derinlik Analizini Aç' : 'Open Full Depth Analysis'}
            </>
          )}
        </button>
      </section>
    );
  }

  // Üretildi — göster + indir
  const L = locale;
  return (
    <article className="space-y-5 rounded-3xl border border-gold/40 bg-gold/[0.04] p-6 md:p-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">
            {L === 'tr' ? 'PREMIUM · TAM DERİNLİK ANALİZİ' : 'PREMIUM · FULL DEPTH ANALYSIS'}
          </p>
          <h3 className="mt-2 font-display text-3xl text-ink">
            {result.nameA} ↔ {result.nameB}
          </h3>
          <p className="mt-1 text-[12px] text-muted">
            {L === 'tr' ? 'Üretildi' : 'Generated'}:{' '}
            {new Date(analysis.generatedAt).toLocaleString(L === 'tr' ? 'tr-TR' : 'en-US')}
          </p>
        </div>
        <button
          type="button"
          onClick={download}
          className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold text-[#1a0a40] shadow-glow"
        >
          <span>⬇</span>
          {L === 'tr' ? 'Markdown olarak indir' : 'Download as markdown'}
        </button>
      </header>

      <Section title={L === 'tr' ? 'Ruhsal Kontrat' : 'Soul Contract'} accent="#E8C28A">
        {analysis.soulContract.split('\n\n').map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </Section>

      <Section title={L === 'tr' ? 'Niye Bu Yaşamda Buluştular' : 'Why They Met in This Lifetime'} accent="#9CAF88">
        {analysis.whyMet.split('\n\n').map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </Section>

      <Section title={L === 'tr' ? 'Karşılıklı Öğretim' : 'Reciprocal Teaching'} accent="#C9A0A6">
        <div className="card-surface-elev rounded-xl border border-panelBorder p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold">
            {result.nameA} → {result.nameB}
          </p>
          <p className="mt-2">{analysis.whatEachTeaches.aTeachesB}</p>
        </div>
        <div className="card-surface-elev rounded-xl border border-panelBorder p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold">
            {result.nameB} → {result.nameA}
          </p>
          <p className="mt-2">{analysis.whatEachTeaches.bTeachesA}</p>
        </div>
      </Section>

      <Section title={L === 'tr' ? 'Çatışma Deseni' : 'Conflict Pattern'} accent="#ff7ad9">
        {analysis.conflictPattern.split('\n\n').map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </Section>

      <Section title={L === 'tr' ? 'Ayrılık Dinamiği' : 'Separation Dynamic'} accent="#8FA3C2">
        {analysis.separationDynamic.split('\n\n').map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </Section>

      <Section title={L === 'tr' ? 'Barışma Alanı' : 'Reunion Field'} accent="#9CAF88">
        {analysis.reunionField.split('\n\n').map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </Section>

      <Section title={L === 'tr' ? 'Uzun Vadeli Rezonans' : 'Long-Term Resonance'} accent="#E8C28A">
        {analysis.longTermResonance.split('\n\n').map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </Section>

      <Section title={L === 'tr' ? 'Karmik Tema' : 'Karmic Theme'} accent="#C7B8E8">
        {analysis.karmicTheme.split('\n\n').map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </Section>

      <Section title={L === 'tr' ? 'Çift İçin Pratikler' : 'Practices for the Couple'} accent="#5bd9a0">
        <ul className="space-y-2">
          {analysis.practiceForCouple.map((p, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-success">✦</span>
              <span className="flex-1">{p}</span>
            </li>
          ))}
        </ul>
      </Section>

      <blockquote className="rounded-2xl border border-gold/40 bg-gold/[0.06] p-5 text-center font-display text-lg italic text-ink">
        {analysis.closingBlessing}
      </blockquote>

      <p className="text-center text-[11px] text-faint">
        {L === 'tr'
          ? 'Bu rapor sembolik bir okumadır. Tıbbi, psikolojik veya ilişki danışmanlığı yerine geçmez.'
          : 'This report is a symbolic reading. It does not replace medical, psychological or relationship counseling.'}
      </p>
    </article>
  );
}
