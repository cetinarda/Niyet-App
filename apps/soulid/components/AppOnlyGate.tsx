'use client';

import { CosmicBackground } from '@/components/CosmicBackground';
import { BrandMark } from '@/components/BrandMark';
import { StoreBadges } from '@/components/StoreBadges';
import { useT } from '@/lib/i18n';

/**
 * Web'de interaktif özellikler (karne/uyum) yerine gösterilir.
 * Web = bilgilendirme + mağaza yönlendirmesi. Gerçek deneyim uygulamada.
 * IS_CAPACITOR true ise bu HİÇ render olmaz (sayfalar tam çalışır).
 */
export function AppOnlyGate() {
  const { locale } = useT();

  return (
    <div className="relative flex min-h-[75vh] items-center justify-center px-6 py-20">
      <CosmicBackground variant="aurora" />
      <div className="card-surface relative w-full max-w-lg rounded-3xl border border-panelBorder p-8 text-center md:p-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/30 bg-gold/[0.06]">
          <BrandMark size={34} className="text-gold" />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-gold">
          {locale === 'tr' ? 'UYGULAMADA' : 'IN THE APP'}
        </p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-ink md:text-4xl">
          {locale === 'tr'
            ? 'Bu deneyim SoulProfile uygulamasında'
            : 'This experience lives in the SoulProfile app'}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted">
          {locale === 'tr'
            ? 'Doğum haritan, ikili uyum ve 3D gökyüzü şimdilik yalnızca mobil uygulamada. Web sürümü çok yakında.'
            : 'Your birth chart, dual compatibility and 3D sky are, for now, in the mobile app only. The web version is coming very soon.'}
        </p>
        <div className="mt-8">
          <StoreBadges />
        </div>
        <p className="mt-6 text-[11px] text-faint">
          {locale === 'tr'
            ? 'Eğlence ve farkındalık amaçlıdır. Tıbbi/psikolojik/finansal tavsiye yerine geçmez.'
            : 'For entertainment and self-awareness. Not a substitute for medical, psychological or financial advice.'}
        </p>
      </div>
    </div>
  );
}
