'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/components/Link';
import { hasPremium } from '@/lib/entitlements';
import { FREE_MODE } from '@/lib/feature-flags';
import { useT } from '@/lib/i18n';

export function PromoBanner() {
  const { t } = useT();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // FREE_MODE: mağazalarda yayınlanana kadar "her şey ücretsiz" notunu her
    // zaman göster. Aksi halde eski premium promo (premium yoksa) davranışı.
    setShow(FREE_MODE || !hasPremium());
  }, []);

  if (!show) return null;

  // SoulID kendi odeme sayfasi kaldirildi (premium = Sakin). Banner her zaman
  // kullaniciyi baslamaya (dogum formu) goturur.
  const href = '/birth';

  return (
    <Link
      href={href}
      data-promo
      className="block bg-gradient-to-r from-cosmicDeep via-cosmic to-nebula text-center text-[12px] font-bold tracking-wide text-white transition-opacity hover:opacity-90"
    >
      <div className="mx-auto max-w-6xl px-4 py-2">{t('free.banner')}</div>
    </Link>
  );
}
