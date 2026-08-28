'use client';

import { useEffect, useState } from 'react';

/**
 * İKİ YILDIZIN ÇARPIŞIP SÜPERNOVAYA DÖNÜŞMESİ.
 * Uyum hesabı biterken oynar, sonra `onDone` ile sonuç ekranına geçer.
 *
 * Üç evre (toplam ~2.9 sn):
 *   yaklasma  iki ışık noktası kenarlardan merkeze süzülür
 *   carpisma  merkezde birleşir, kısa bir parlama
 *   nova      halka dışa açılır, sönerken sonuç görünür
 *
 * SAF CSS: kütüphane yok, canvas yok. Sebep: embed WKWebView'da her ek
 * çalışma-anı maliyeti hissediliyor, ayrıca `prefers-reduced-motion` açık
 * kullanıcıda animasyonu tamamen atlayıp doğrudan sonuca geçebiliyoruz.
 */

type Phase = 'yaklasma' | 'carpisma' | 'nova';

export function SupernovaTransition({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>('yaklasma');

  useEffect(() => {
    // Hareket azaltma tercihi: animasyonu hiç oynatma, hemen geç.
    let reduced = false;
    try {
      reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch { /* eski webview: normal akış */ }
    if (reduced) { onDone(); return; }

    const t1 = window.setTimeout(() => setPhase('carpisma'), 1250);
    const t2 = window.setTimeout(() => setPhase('nova'), 1650);
    const t3 = window.setTimeout(onDone, 2900);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); window.clearTimeout(t3); };
  }, [onDone]);

  const merged = phase !== 'yaklasma';

  return (
    <div
      className="relative flex items-center justify-center overflow-hidden"
      style={{ minHeight: 320 }}
      role="status"
      aria-live="polite"
    >
      {/* iki yildiz */}
      {[-1, 1].map((dir) => (
        <span
          key={dir}
          aria-hidden
          className="absolute rounded-full"
          style={{
            width: merged ? 10 : 16,
            height: merged ? 10 : 16,
            background: dir < 0 ? 'var(--gold)' : 'var(--cosmic)',
            boxShadow: `0 0 26px 6px ${dir < 0 ? 'var(--gold)' : 'var(--cosmic)'}`,
            transform: `translateX(${merged ? 0 : dir * 110}px)`,
            opacity: phase === 'nova' ? 0 : 1,
            transition: 'transform 1.25s cubic-bezier(.6,0,.35,1), opacity .35s ease, width .3s, height .3s',
          }}
        />
      ))}

      {/* carpisma parlamasi */}
      <span
        aria-hidden
        className="absolute rounded-full"
        style={{
          width: 18,
          height: 18,
          background: 'var(--starlight, #fff)',
          boxShadow: '0 0 60px 24px rgba(255,255,255,0.85)',
          opacity: phase === 'carpisma' ? 1 : 0,
          transform: `scale(${phase === 'carpisma' ? 1.6 : 0.2})`,
          transition: 'opacity .25s ease, transform .35s ease',
        }}
      />

      {/* nova halkalari */}
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden
          className="absolute rounded-full"
          style={{
            width: 40,
            height: 40,
            border: '1px solid var(--gold)',
            opacity: phase === 'nova' ? 0 : 0,
            animation: phase === 'nova' ? `sp-ring 1.2s ${i * 0.16}s ease-out forwards` : 'none',
          }}
        />
      ))}

      {/* cekirdek: nova aninda buyuyup soner */}
      <span
        aria-hidden
        className="absolute rounded-full"
        style={{
          width: 30,
          height: 30,
          background: 'radial-gradient(circle, #fff 0%, var(--gold) 45%, transparent 72%)',
          opacity: phase === 'nova' ? 0 : 0,
          animation: phase === 'nova' ? 'sp-core 1.25s ease-out forwards' : 'none',
        }}
      />

      <style jsx global>{`
        @keyframes sp-ring {
          0%   { opacity: .85; transform: scale(.3); }
          100% { opacity: 0;   transform: scale(7); }
        }
        @keyframes sp-core {
          0%   { opacity: 1; transform: scale(.6); }
          55%  { opacity: .9; transform: scale(3.2); }
          100% { opacity: 0; transform: scale(4.4); }
        }
      `}</style>
    </div>
  );
}
