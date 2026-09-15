'use client';

// ── 7'LER MECLİSİ butonu + sonuç paneli ─────────────────────────────────────
// Büyük buton; içinde "AI motoru gibi" sağa sola süzülen partiküller (canvas).
// Tıklayınca doğum tarihine dayalı 7 kısa nesil analizi üretilir (lib/council).
// Bitince "Detaylı Karnene Git" ile /report'a yönlendirir.
// Kopya iki dilli (SoulID tr+en); uzun çizgi kullanılmaz.

import { useEffect, useRef, useState } from 'react';
import { useNav } from '@/lib/nav';
import { useT } from '@/lib/i18n';
import { runCouncil, type CouncilSection } from '@/lib/council';

const COPY = {
  tr: {
    title: "7'LER MECLİSİ",
    sub: 'Doğduğun neslin yedi çözümleyicisi seni okusun',
    tap: 'Meclisi Topla',
    loading: 'Meclis toplanıyor...',
    error: 'Meclis şu an toplanamadı. Bir an sonra tekrar dene.',
    retry: 'Tekrar dene',
    toReport: 'Detaylı Karnene Git',
    note: 'Bu okuma doğum tarihine ve nesil psikolojisine dayanır, astrolojiye değil.',
  },
  en: {
    title: 'COUNCIL OF SEVENS',
    sub: 'Let the seven analysts of your generation read you',
    tap: 'Convene the Council',
    loading: 'The council is gathering...',
    error: 'The council could not gather right now. Try again in a moment.',
    retry: 'Try again',
    toReport: 'Go to Your Detailed Card',
    note: 'This reading is based on your birth date and generational psychology, not astrology.',
  },
} as const;

// Partikül alanı: yatay süzülen noktalar. reduced-motion'da sabit durur.
function ParticleField({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx0 = canvas.getContext('2d');
    if (!ctx0) return;
    // Non-null tipli sabitler: TS, iç fonksiyonlarda daralmayı korusun diye.
    const cv: HTMLCanvasElement = canvas;
    const ctx: CanvasRenderingContext2D = ctx0;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let raf = 0;
    let w = 0;
    let h = 0;
    const DPR = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
    const N = 26;
    type P = { x: number; y: number; vx: number; r: number; a: number; ph: number };
    let dots: P[] = [];

    function resize() {
      const rect = cv.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      cv.width = Math.round(w * DPR);
      cv.height = Math.round(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      dots = Array.from({ length: N }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (0.15 + Math.random() * 0.5) * (Math.random() < 0.5 ? -1 : 1),
        r: 0.8 + Math.random() * 1.8,
        a: 0.2 + Math.random() * 0.5,
        ph: Math.random() * Math.PI * 2,
      }));
    }
    resize();

    let t = 0;
    function frame() {
      t += 1;
      ctx.clearRect(0, 0, w, h);
      const speed = active ? 2.1 : 1;
      for (const d of dots) {
        d.x += d.vx * speed;
        if (d.x < -4) d.x = w + 4;
        if (d.x > w + 4) d.x = -4;
        const yy = d.y + Math.sin(t * 0.02 + d.ph) * 2.2;
        ctx.beginPath();
        ctx.arc(d.x, yy, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240,205,120,${d.a * (active ? 1 : 0.75)})`;
        ctx.fill();
      }
      if (!reduce) raf = requestAnimationFrame(frame);
    }
    if (reduce) {
      // Tek kare çiz, animasyon yok.
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240,205,120,${d.a})`;
        ctx.fill();
      }
    } else {
      raf = requestAnimationFrame(frame);
    }

    const onResize = () => resize();
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [active]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

export function CouncilButton({ birthDate }: { birthDate: string }) {
  const nav = useNav();
  const { locale } = useT();
  const c = COPY[locale === 'en' ? 'en' : 'tr'];
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [sections, setSections] = useState<CouncilSection[]>([]);

  async function convene() {
    if (state === 'loading') return;
    setState('loading');
    try {
      const res = await runCouncil(birthDate, locale === 'en' ? 'en' : 'tr');
      setSections(res.sections);
      setState('done');
    } catch {
      setState('error');
    }
  }

  return (
    <section className="mx-auto mt-6 max-w-4xl px-4 md:px-6">
      {/* Büyük buton */}
      <button
        type="button"
        onClick={convene}
        disabled={state === 'loading'}
        style={{ WebkitAppearance: 'none', appearance: 'none' }}
        className="relative w-full overflow-hidden rounded-3xl border border-gold/40 bg-gradient-to-br from-[#241436] to-[#140a26] px-6 py-7 text-center transition active:scale-[0.99] disabled:cursor-default"
      >
        <ParticleField active={state === 'loading'} />
        <div className="relative">
          <div className="font-display text-xl font-bold tracking-[0.18em] text-gold md:text-2xl">
            {c.title}
          </div>
          <div className="mt-2 text-xs text-faint md:text-sm">{c.sub}</div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-5 py-2 text-sm font-bold text-gold">
            {state === 'loading' ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-gold/40 border-t-gold" />
                {c.loading}
              </>
            ) : (
              <>✦ {c.tap}</>
            )}
          </div>
        </div>
      </button>

      {state === 'error' && (
        <div className="mt-4 rounded-2xl border border-panelBorder bg-panel p-5 text-center">
          <p className="text-sm text-ink">{c.error}</p>
          <button
            type="button"
            onClick={convene}
            className="mt-3 rounded-full border border-gold/50 bg-gold/10 px-5 py-2 text-sm font-bold text-gold"
          >
            {c.retry}
          </button>
        </div>
      )}

      {state === 'done' && sections.length > 0 && (
        <div className="mt-5">
          <div className="flex flex-col gap-3">
            {sections.map((s) => (
              <article
                key={s.n}
                className="rounded-2xl border border-panelBorder bg-panel p-4 md:p-5"
              >
                <div className="flex items-baseline gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xs font-bold text-gold">
                    {s.n}
                  </span>
                  <h3 className="font-display text-sm font-bold tracking-wide text-gold md:text-base">
                    {s.title}
                  </h3>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/90">
                  {s.body}
                </p>
              </article>
            ))}
          </div>

          <p className="mt-4 text-center text-[11px] leading-relaxed text-faint">{c.note}</p>

          {/* Sayfa bittiğinde detaylı karneye yönlendirme */}
          <button
            type="button"
            onClick={() => nav.push('/report')}
            style={{ WebkitAppearance: 'none', appearance: 'none' }}
            className="mt-4 w-full rounded-full bg-gold px-6 py-3.5 text-sm font-bold text-[#1a0a40] transition active:scale-[0.99]"
          >
            {c.toReport} →
          </button>
        </div>
      )}
    </section>
  );
}
