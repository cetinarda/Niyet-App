'use client';

import { Link } from '@/components/Link';
import { useEffect, useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { PLANS, premiumFeatures, iapErrorText, type Plan } from '@/lib/payments/skus';
import { startCheckout } from '@/lib/payments/checkout';
import { isCapacitorNative } from '@/lib/platform';
import { grantPremium, hasPremium } from '@/lib/entitlements';
import { initIAP, buyOnNative, restorePurchases, syncEntitlement } from '@/lib/payments/iap';
import { useT } from '@/lib/i18n';

export default function PremiumPage() {
  const { locale } = useT();
  const [working, setWorking] = useState<Plan['key'] | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [owned, setOwned] = useState(false);

  useEffect(() => {
    // Stripe başarı dönüşü → server-side session doğrulaması, sonra premium
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (sessionId && /^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
      fetch(`/api/verify-session?session_id=${encodeURIComponent(sessionId)}`)
        .then((r) => r.json())
        .then((data: { ok?: boolean }) => {
          if (data.ok) {
            grantPremium();
            setOwned(true);
            setInfo(
              locale === 'tr'
                ? 'Ödemen onaylandı. Tam erişim açık.'
                : 'Payment confirmed. Full access unlocked.',
            );
            window.history.replaceState({}, '', '/premium');
          }
        })
        .catch(() => {
          /* sessiz */
        });
    }
    setOwned(hasPremium());
    // iOS: RevenueCat configure + entitlement senkronu — bitince premium'u
    // yeniden oku (satın alım sonrası "yeniden satın al" sormasın).
    initIAP()
      .then(() => syncEntitlement())
      .then(() => setOwned(hasPremium()))
      .catch(() => {});
  }, [locale]);

  async function buy(plan: Plan) {
    setError(null);
    setInfo(null);
    setWorking(plan.key);
    try {
      if (isCapacitorNative()) {
        const res = await buyOnNative(plan.rcPackageId);
        if (res.ok) {
          setOwned(true);
          setInfo(locale === 'tr' ? 'Tam erişim açıldı.' : 'Full access unlocked.');
        } else if (res.error === 'cancelled') {
          // sessiz iptal
        } else {
          console.warn('[premium] purchase failed', res.error);
          setError(iapErrorText(res.error, locale));
        }
      } else {
        await startCheckout(plan.key);
      }
    } catch (e) {
      console.warn('[premium] purchase threw', e);
      setError(iapErrorText(undefined, locale));
    } finally {
      setWorking(null);
    }
  }

  async function onRestore() {
    setError(null);
    setInfo(null);
    setRestoring(true);
    try {
      const res = await restorePurchases();
      if (res.ok) {
        setOwned(true);
        setInfo(locale === 'tr' ? 'Önceki satın alımın geri yüklendi.' : 'Your previous purchase was restored.');
      } else {
        console.warn('[premium] restore failed', res.error);
        setError(iapErrorText(res.error, locale));
      }
    } finally {
      setRestoring(false);
    }
  }

  return (
    <PageLayout
      kicker={owned ? (locale === 'tr' ? 'TAM ERİŞİM AÇIK' : 'FULL ACCESS UNLOCKED') : (locale === 'tr' ? 'TAM ERİŞİM' : 'FULL ACCESS')}
      title={locale === 'tr' ? 'Sınırsız erişim' : 'Unlimited access'}
      intro={
        owned
          ? (locale === 'tr' ? 'Tam erişimin açık. Yıldızlar artık hiçbir şey saklamıyor.' : 'Your full access is unlocked. The stars hold nothing back now.')
          : (locale === 'tr'
              ? 'İlk karnen ve ilk uyumun ücretsiz — tam özellikli. Farklı kişilere bakmak ve tüm özelliklere sınırsız erişim için premium.'
              : 'Your first profile and first compatibility are free — fully featured. Go premium for other people and unlimited access to all features.')
      }
    >
      {error ? (
        <div className="rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <div className="rounded-3xl border border-gold/40 bg-gold/[0.05] p-8 md:p-10">
        <h2 className="font-display text-3xl text-ink">
          {locale === 'tr' ? 'Sınırsız erişim' : 'Unlimited access'}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {locale === 'tr'
            ? 'İlk karnen ve uyumun ücretsiz. Daha fazlası için tek fiyat.'
            : 'Your first profile and compatibility are free. One price for everything more.'}
        </p>

        <ul className="mt-5 grid gap-2">
          {premiumFeatures(locale).map((f) => (
            <li key={f} className="flex gap-2 text-sm text-ink">
              <span className="text-gold">✦</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {/* İki plan */}
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => buy(PLANS.lifetime)}
            disabled={working !== null || owned}
            className="flex w-full items-center justify-between gap-3 rounded-2xl bg-gold px-6 py-4 text-left font-bold text-[#1a0a40] shadow-glow transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            <span>
              <span className="block text-base">{locale === 'tr' ? 'Tek Seferlik' : 'One-time'}</span>
              <span className="block text-[11px] font-semibold opacity-70">{locale === 'tr' ? 'ömür boyu erişim' : 'lifetime access'}</span>
            </span>
            <span className="text-xl">{working === 'lifetime' ? '…' : PLANS.lifetime.price}</span>
          </button>

          <button
            type="button"
            onClick={() => buy(PLANS.monthly)}
            disabled={working !== null || owned}
            className="flex w-full items-center justify-between gap-3 rounded-2xl border border-gold/40 bg-transparent px-6 py-4 text-left font-bold text-ink transition-colors hover:border-gold/70 disabled:opacity-60"
          >
            <span>
              <span className="block text-base">{locale === 'tr' ? 'Aylık' : 'Monthly'}</span>
              <span className="block text-[11px] font-semibold text-muted">{locale === 'tr' ? 'istediğin zaman iptal' : 'cancel anytime'}</span>
            </span>
            <span className="text-lg text-gold">{working === 'monthly' ? '…' : `${PLANS.monthly.price} ${locale === 'tr' ? '/ ay' : '/ mo'}`}</span>
          </button>
        </div>

        {owned ? (
          <p className="mt-4 rounded-lg border border-success/40 bg-success/10 p-2.5 text-center text-[12px] text-success">
            {locale === 'tr' ? '✓ Tam erişim açık' : '✓ Full access unlocked'}
          </p>
        ) : null}

        {/* Restore Purchases — Apple guideline 3.1.1 zorunluluğu */}
        <button
          type="button"
          onClick={onRestore}
          disabled={restoring || owned}
          className="mt-3 w-full rounded-full border border-panelBorder bg-transparent py-3 text-[12px] font-bold text-muted transition-colors hover:text-ink disabled:opacity-60"
        >
          {restoring
            ? (locale === 'tr' ? 'Geri yükleniyor...' : 'Restoring...')
            : (locale === 'tr' ? 'Önceki satın alımı geri yükle' : 'Restore previous purchase')}
        </button>

        {info ? (
          <p className="mt-3 rounded-lg border border-success/40 bg-success/10 p-2.5 text-center text-[12px] text-success">
            {info}
          </p>
        ) : null}

        <p className="mt-3 text-center text-[11px] text-faint">
          {locale === 'tr'
            ? 'iOS: Apple (App Store). Aylık abonelik istediğin zaman iptal edilebilir.'
            : 'iOS: Apple (App Store). Monthly subscription can be cancelled anytime.'}
        </p>
      </div>

      <p className="text-xs text-faint">
        {locale === 'tr'
          ? 'İki seçenek: tek seferlik $19.99 (ömür boyu) ya da aylık $4.99 abonelik (istediğin zaman iptal). Aylık abonelik iptal edilene dek her ay otomatik yenilenir; App Store hesabından yönetebilirsin. AB ve Türkiye’de 14 gün cayma hakkın saklıdır. '
          : 'Two options: $19.99 one-time (lifetime) or a $4.99 monthly subscription (cancel anytime). The monthly plan auto-renews each month until cancelled; manage it in your App Store account. 14-day right of withdrawal applies in the EU and Türkiye. '}
        <Link href="/terms" className="text-gold underline">
          {locale === 'tr' ? 'Kullanım Koşulları (EULA)' : 'Terms of Use (EULA)'}
        </Link>
        {' · '}
        <Link href="/privacy" className="text-gold underline">
          {locale === 'tr' ? 'Gizlilik Politikası' : 'Privacy Policy'}
        </Link>
      </p>
    </PageLayout>
  );
}
