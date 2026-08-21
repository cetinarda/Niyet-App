'use client';

// Bağlanma Stili — soru seti + sonuç + öneriler.
// Stil YALNIZCA yanıtlardan çıkar; doğum haritası sadece önerileri
// kişiselleştirir (bkz. lib/attachment/chart-lens.ts başındaki not).

import { useEffect, useMemo, useState } from 'react';
import { CosmicBackground } from '@/components/CosmicBackground';
import { AttachmentMap } from '@/components/AttachmentMap';
import { useSoulStore } from '@/lib/store';
import { listReports } from '@/lib/supabase/reports';
import { readActiveReportId } from '@/lib/active-report';
import { useT } from '@/lib/i18n';
import { tap } from '@/lib/haptics';
import { IS_CAPACITOR } from '@/lib/nav';
import { WEB_APP_OPEN } from '@/lib/feature-flags';
import { AppOnlyGate } from '@/components/AppOnlyGate';
import {
  QUESTIONS,
  SCALE,
  STYLES,
  STRATEGIES,
  DEPENDENCY_PARADOX,
  COMMUNICATION_RULES,
  PREVALENCE,
  scoreAttachment,
  strategyFor,
  pick,
  type Answers,
  type AttachmentStyle,
  type AttachmentResult,
} from '@/lib/attachment';
import { buildChartLens } from '@/lib/attachment/chart-lens';
import { saveAttachment, readAttachment, readAnswers, clearAttachment } from '@/lib/attachment/storage';

type Phase = 'intro' | 'quiz' | 'result';

export default function AttachmentPage() {
  const { locale } = useT();
  const tr = locale === 'tr';
  const report = useSoulStore((s) => s.report);
  const setReport = useSoulStore((s) => s.setReport);

  const [phase, setPhase] = useState<Phase>('intro');
  const [answers, setAnswers] = useState<Answers>({});
  const [idx, setIdx] = useState(0);
  const [result, setResult] = useState<AttachmentResult | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Kayıtlı sonuç varsa doğrudan onu göster; karneyi de arka planda yükle
  // (harita merceği için gerekli ama zorunlu değil).
  useEffect(() => {
    const stored = readAttachment();
    if (stored) {
      setResult(stored);
      setAnswers(readAnswers());
      setPhase('result');
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (report) return;
    const id = readActiveReportId();
    let cancelled = false;
    listReports()
      .then((list) => {
        if (cancelled) return;
        const found = (id ? list.find((r) => r.id === id) : undefined) ?? list[0];
        if (found) setReport(found);
      })
      .catch(() => {
        /* karne yoksa özellik yine çalışır */
      });
    return () => {
      cancelled = true;
    };
  }, [report, setReport]);

  const q = QUESTIONS[idx];
  const answeredCount = Object.keys(answers).length;

  function answer(value: number) {
    if (!q) return;
    tap();
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (idx < QUESTIONS.length - 1) {
      setIdx(idx + 1);
      return;
    }
    const r = scoreAttachment(next);
    setResult(r);
    saveAttachment(r, next);
    setPhase('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function restart() {
    tap();
    clearAttachment();
    setAnswers({});
    setIdx(0);
    setResult(null);
    setPhase('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const lens = useMemo(
    () => (result ? buildChartLens(report, result.style) : []),
    [report, result],
  );

  if (!IS_CAPACITOR && !WEB_APP_OPEN) return <AppOnlyGate />;
  if (!hydrated) return null;

  const labels: Record<AttachmentStyle, string> = {
    secure: pick(STYLES.secure.name, locale),
    anxious: pick(STYLES.anxious.name, locale),
    avoidant: pick(STYLES.avoidant.name, locale),
    disorganized: pick(STYLES.disorganized.name, locale),
  };

  // ── GİRİŞ ───────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="relative py-20 md:py-28">
        <CosmicBackground variant="aurora" />
        <div className="mx-auto max-w-2xl px-5 md:px-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.5em] text-gold">
            {tr ? 'BAĞLANMA STİLİ' : 'ATTACHMENT STYLE'}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-ink md:text-5xl">
            {tr ? 'İlişkilerinde dejavu mu yaşıyorsun?' : 'Do your relationships keep rhyming?'}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted">
            {tr
              ? 'Aynı kırılma, farklı kişiyle tekrar ediyorsa mesele şanssızlık olmayabilir. Yakınlık karşısında sinir sisteminin öğrendiği bir varsayılan hamle vardır. 16 soruda o hamleyi görünür kılıyoruz.'
              : 'If the same rupture repeats with a different person, it may not be bad luck. Your nervous system has a default move around closeness. Sixteen questions make that move visible.'}
          </p>

          <div className="mt-8 rounded-3xl border border-panelBorder bg-panel p-6">
            <p className="text-sm font-bold text-ink">{tr ? 'Nasıl çalışır' : 'How it works'}</p>
            <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-muted">
              <li>{tr ? '· 16 soru, yaklaşık 3 dakika. Doğru cevap yok.' : '· 16 questions, about 3 minutes. There is no right answer.'}</li>
              <li>{tr ? '· Sonuç iki eksende ölçülür: kaygı ve kaçınma.' : '· The result is measured on two axes: anxiety and avoidance.'}</li>
              <li>
                {tr
                  ? '· Stilin yalnızca yanıtlarından çıkar. Doğum haritan stili belirlemez, sadece sana uygun pratikleri seçmekte kullanılır.'
                  : '· Your style comes only from your answers. Your birth chart does not decide it; it only tailors which practices suit you.'}
              </li>
              <li>{tr ? '· Yanıtların cihazında kalır.' : '· Your answers stay on your device.'}</li>
            </ul>
          </div>

          <p className="mt-5 text-[12px] leading-relaxed text-faint">
            {tr
              ? 'Bu bir tanı aracı değildir. Bağlanma stili sabit bir etiket de değildir; ilişkiler ve farkındalıkla zamanla değişir.'
              : 'This is not a diagnostic tool. Attachment style is not a fixed label either; it shifts over time with relationships and awareness.'}
          </p>

          <button
            type="button"
            onClick={() => {
              tap();
              setPhase('quiz');
            }}
            className="mt-8 w-full rounded-full bg-gold py-4 text-[15px] font-bold tracking-wide text-[#1a0a40] shadow-glow transition-transform hover:scale-[1.01]"
          >
            {tr ? 'Başla' : 'Begin'} →
          </button>
        </div>
      </div>
    );
  }

  // ── SORULAR ─────────────────────────────────────────────────────────────
  if (phase === 'quiz' && q) {
    const progress = ((idx + (answers[q.id] ? 1 : 0)) / QUESTIONS.length) * 100;
    return (
      <div className="relative py-20 md:py-28">
        <CosmicBackground variant="aurora" />
        <div className="mx-auto max-w-2xl px-5 md:px-6">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-faint">
            <span>{tr ? 'BAĞLANMA STİLİ' : 'ATTACHMENT STYLE'}</span>
            <span>
              {idx + 1} / {QUESTIONS.length}
            </span>
          </div>
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold via-nebula to-cosmic transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <h2 className="mt-10 min-h-[104px] font-display text-2xl leading-snug text-ink md:text-3xl">
            {pick(q.text, locale)}
          </h2>

          <div className="mt-8 space-y-2.5">
            {SCALE.map((s) => {
              const selected = answers[q.id] === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => answer(s.value)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left text-[15px] transition-colors ${
                    selected
                      ? 'border-gold/70 bg-gold/10 text-ink'
                      : 'border-panelBorder bg-panel text-muted hover:border-gold/40 hover:text-ink'
                  }`}
                >
                  <span>{pick(s.label, locale)}</span>
                  <span className="text-faint">{s.value}</span>
                </button>
              );
            })}
          </div>

          {idx > 0 && (
            <button
              type="button"
              onClick={() => {
                tap();
                setIdx(idx - 1);
              }}
              className="mt-6 text-sm text-faint underline-offset-4 hover:text-muted hover:underline"
            >
              ← {tr ? 'Önceki soru' : 'Previous question'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── SONUÇ ───────────────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    const s = STYLES[result.style];
    const kind = strategyFor(result.style);
    const strat = kind ? STRATEGIES[kind] : null;
    const secondary = result.secondary ? STYLES[result.secondary] : null;

    return (
      <div className="relative py-20 md:py-28">
        <CosmicBackground variant="aurora" />
        <div className="mx-auto max-w-2xl px-5 md:px-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.5em] text-gold">
            {tr ? 'SONUCUN' : 'YOUR RESULT'}
          </p>
          <h1 className="mt-3 flex items-center gap-3 font-display text-4xl leading-tight text-ink md:text-5xl">
            <span>{s.emoji}</span>
            <span style={{ color: s.color }}>{pick(s.name, locale)}</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted">{pick(s.essence, locale)}</p>

          <p className="mt-3 text-[13px] text-faint">
            {tr
              ? `Bu stil yetişkinlerin yaklaşık %${PREVALENCE[result.style]}'inde baskın. Yalnız değilsin.`
              : `Roughly ${PREVALENCE[result.style]}% of adults lean this way. You are not alone.`}
          </p>

          {/* harita */}
          <div className="mt-8 rounded-3xl border border-panelBorder bg-panel p-6">
            <AttachmentMap
              anxiety={result.anxiety}
              avoidance={result.avoidance}
              style={result.style}
              labels={labels}
              axisLabels={{
                anxiety: tr ? 'Kaygı' : 'Anxiety',
                avoidance: tr ? 'Kaçınma' : 'Avoidance',
                low: tr ? 'Düşük' : 'Low',
                high: tr ? 'Yüksek' : 'High',
              }}
            />
            {secondary && result.blend >= 0.5 && (
              <p className="mt-4 border-t border-panelBorder pt-4 text-[13px] leading-relaxed text-muted">
                {tr
                  ? `Sınıra yakınsın: ${pick(secondary.name, locale)} tarafında da belirgin bir payın var. Örüntün duruma göre iki taraf arasında gidip geliyor olabilir.`
                  : `You sit close to the border: there is a clear share of ${pick(secondary.name, locale)} in you too. Your pattern may shift between the two depending on the situation.`}
              </p>
            )}
          </div>

          {/* tanıma anı */}
          <Section title={tr ? 'Nasıl hissettirir' : 'How it feels'}>
            <p className="text-[15px] leading-relaxed text-muted">{pick(s.feels, locale)}</p>
          </Section>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Card title={tr ? 'Güçlü yanların' : 'Your strengths'} color={s.color}>
              <List items={s.strengths.map((x) => pick(x, locale))} />
            </Card>
            <Card title={tr ? 'Seni tetikleyenler' : 'What triggers you'} color={s.color}>
              <List items={s.triggers.map((x) => pick(x, locale))} />
            </Card>
          </div>

          <Section title={tr ? 'İhtiyacın olan ama istemekte zorlandığın' : 'What you need but find hard to ask for'}>
            <List items={s.needs.map((x) => pick(x, locale))} />
          </Section>

          <Section title={tr ? 'Çatışma anında' : 'In conflict'}>
            <p className="text-[15px] leading-relaxed text-muted">{pick(s.inConflict, locale)}</p>
          </Section>

          {/* otomatik hamleler */}
          {strat && (
            <Section title={pick(strat.title, locale)}>
              <p className="text-[15px] leading-relaxed text-muted">{pick(strat.intro, locale)}</p>
              <div className="mt-4">
                <List items={strat.signs.map((x) => pick(x, locale))} />
              </div>
              <p className="mt-4 rounded-2xl bg-gold/10 p-4 text-[14px] leading-relaxed text-ink">
                {pick(strat.antidote, locale)}
              </p>
            </Section>
          )}

          {/* doğum haritası merceği */}
          {lens.length > 0 && (
            <Section title={tr ? 'Haritana göre' : 'Through your chart'}>
              <p className="mb-4 text-[13px] leading-relaxed text-faint">
                {tr
                  ? 'Stilini yukarıdaki yanıtların belirledi. Bu bölüm onu değiştirmez; sadece senin haritanda hangi pratiğin daha kolay tutacağını söyler.'
                  : 'Your answers determined the style above. This section does not change it; it only points to which practice is likely to stick for your chart.'}
              </p>
              <div className="space-y-4">
                {lens.map((row) => (
                  <div key={pick(row.label, locale)} className="rounded-2xl border border-panelBorder bg-bg/40 p-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[13px] font-bold text-ink">{pick(row.label, locale)}</span>
                      <span className="shrink-0 text-[11px] uppercase tracking-wider text-gold">
                        {pick(row.source, locale)}
                      </span>
                    </div>
                    <p className="mt-2 text-[14px] leading-relaxed text-muted">{pick(row.body, locale)}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* pratikler */}
          <Section title={tr ? 'Ne yapabilirsin' : 'What you can do'}>
            <div className="space-y-3">
              {s.practices.map((p, i) => (
                <div key={i} className="flex gap-3 rounded-2xl border border-panelBorder bg-bg/40 p-4">
                  <span className="shrink-0 font-display text-lg" style={{ color: s.color }}>
                    {i + 1}
                  </span>
                  <p className="text-[14px] leading-relaxed text-muted">{pick(p, locale)}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* söyleyebileceğin cümle */}
          <Section title={tr ? 'Söyleyebileceğin cümle' : 'A sentence you can say'}>
            <p
              className="rounded-2xl border p-5 font-display text-lg leading-relaxed text-ink"
              style={{ borderColor: `${s.color}55`, background: `${s.color}12` }}
            >
              {pick(s.script, locale)}
            </p>
          </Section>

          {/* iletişim kuralları */}
          <Section title={tr ? 'Etkili iletişimin üç kuralı' : 'Three rules of effective communication'}>
            <div className="space-y-3">
              {COMMUNICATION_RULES.map((r) => (
                <div key={pick(r.title, locale)} className="rounded-2xl border border-panelBorder bg-bg/40 p-4">
                  <p className="text-[13px] font-bold text-ink">{pick(r.title, locale)}</p>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{pick(r.body, locale)}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* bağımlılık paradoksu */}
          <Section title={pick(DEPENDENCY_PARADOX.title, locale)}>
            <p className="text-[15px] leading-relaxed text-muted">{pick(DEPENDENCY_PARADOX.body, locale)}</p>
          </Section>

          <p className="mt-10 text-[12px] leading-relaxed text-faint">
            {tr
              ? 'Bu sonuç bir tanı değil, bir aynadır. Bağlanma stili sabit değildir: güvenli bir ilişki, farkındalık ve gerektiğinde profesyonel destek zamanla örüntüyü güvenliye doğru taşır.'
              : 'This result is a mirror, not a diagnosis. Attachment style is not fixed: a safe relationship, awareness and professional support when needed move the pattern toward security over time.'}
          </p>

          <button
            type="button"
            onClick={restart}
            className="mt-6 w-full rounded-full border border-panelBorder py-4 text-[15px] font-bold text-muted transition-colors hover:border-gold/50 hover:text-ink"
          >
            {tr ? 'Testi yeniden çöz' : 'Retake the test'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.35em] text-gold">{title}</h2>
      {children}
    </div>
  );
}

function Card({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-panelBorder bg-panel p-5">
      <p className="mb-3 text-[12px] font-bold uppercase tracking-wider" style={{ color }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((x) => (
        <li key={x} className="flex gap-2.5 text-[14px] leading-relaxed text-muted">
          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-gold" />
          <span>{x}</span>
        </li>
      ))}
    </ul>
  );
}
