'use client';

import { CosmicBackground } from './CosmicBackground';
import { useT } from '@/lib/i18n';

// SoulID kendi odeme altyapisini KULLANMIYOR (RevenueCat/Stripe kaldirildi).
// Premium = Sakin (host) premium. Ikili uyum kilidine takilan kullanici burada
// "Premium ac" derse embed host'a "sakin-premium-cta" postMessage'i gonderir;
// host (App.jsx onMsg) embed'i kapatip Sakin'in kendi fiyat/paywall ekranini
// acar. Boylece calisan tek satin alma yolu (cc.fovea IAP) kullanilir, embed
// icinde olu bir odeme duvari kalmaz.
export function PremiumGate({
  kind,
  onBack,
}: {
  kind: 'report' | 'compat';
  onBack?: () => void;
  onUnlocked?: () => void;
}) {
  const { locale } = useT();
  const tr = locale === 'tr';

  function openSakinPaywall() {
    try {
      // Embed bir iframe icinde; parent = host. Standalone acilirsa parent
      // kendisidir, o durumda da zarar yok (host dinleyicisi yalnizca embed'de).
      const target = typeof window !== 'undefined' && window.parent && window.parent !== window
        ? window.parent : (typeof window !== 'undefined' ? window : null);
      target?.postMessage({ type: 'sakin-premium-cta' }, typeof window !== 'undefined' ? window.location.origin : '*');
    } catch { /* sessiz */ }
  }

  return (
    <div className="relative min-h-[70vh]">
      <CosmicBackground variant="aurora" />
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gold/15 text-5xl">
          ✦
        </div>
        <h1 className="font-display text-4xl text-ink">
          {tr ? 'Sınırsız ikili uyum' : 'Unlimited compatibility'}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          {tr
            ? 'İlk ikili uyumun ücretsizdi. Farklı kişilerle sınırsız uyuma bakmak Sakin Premium ile açılır.'
            : 'Your first compatibility was free. Unlimited compatibility with different people is unlocked with Sakin Premium.'}
        </p>
        <button
          onClick={openSakinPaywall}
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-7 py-4 text-[16px] font-bold text-[#1a0a40]"
        >
          <span>✦</span> {tr ? 'Sakin Premium' : 'Sakin Premium'}
        </button>
        {onBack ? (
          <div className="mt-5">
            <button onClick={onBack} className="text-sm text-muted underline underline-offset-4">
              {tr ? 'Geri dön' : 'Go back'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
