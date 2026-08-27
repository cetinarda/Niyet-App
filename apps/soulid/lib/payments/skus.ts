// İki fiyat seçeneği:
//  - Lifetime (tek seferlik non-consumable): $19.99
//  - Monthly (aylık auto-renewable subscription): $4.99/ay
// Her ikisi de 'premium' entitlement'ını açar → kendi haritadaki
// yıldız/gezegen konumu + hareketi (3D/ağaç/çark) görünür olur.

export type PlanKey = 'lifetime' | 'monthly';

export type Plan = {
  key: PlanKey;
  appleProductId: string;      // App Store Connect product ID
  rcPackageId: string;         // RevenueCat package identifier (offering içinde)
  stripePriceEnvKey: string;   // Web Stripe price env
  price: string;               // gösterim
  period: 'once' | 'month';
};

export const PLANS: Record<PlanKey, Plan> = {
  lifetime: {
    key: 'lifetime',
    appleProductId: 'life.soulprofile.app.unlock',
    rcPackageId: '$rc_lifetime',
    stripePriceEnvKey: 'NEXT_PUBLIC_STRIPE_PRICE_LIFETIME',
    price: '$19.99',
    period: 'once',
  },
  monthly: {
    key: 'monthly',
    appleProductId: 'life.soulprofile.app.monthly',
    rcPackageId: '$rc_monthly',
    stripePriceEnvKey: 'NEXT_PUBLIC_STRIPE_PRICE_MONTHLY',
    price: '$4.99',
    period: 'month',
  },
};

// Premium'un açtığı özellikler (gate kartlarında gösterilir).
// LOKALİZE OLMAK ZORUNDA: sabit Türkçe liste İngilizce arayüzde de Türkçe
// çıkıyordu → App Store Guideline 4 reddi (karışık dilli arayüz).
const FEATURES: Record<'tr' | 'en', string[]> = {
  tr: [
    'Sınırsız karne — farklı kişilerin haritasına bak',
    'Sınırsız ikili uyum karşılaştırması',
    'Tüm özellikler + gelecek güncellemeler',
  ],
  en: [
    'Unlimited profiles — explore anyone’s chart',
    'Unlimited compatibility comparisons',
    'Every feature + future updates',
  ],
};

export function premiumFeatures(locale: string): string[] {
  return FEATURES[locale === 'tr' ? 'tr' : 'en'];
}

/**
 * Ham IAP hata kodlarını kullanıcıya gösterilebilir, lokalize metne çevirir.
 * App Review ekranda 'IAP_NOT_READY' gördü (Guideline 2.1(b)). Geliştirici
 * talimatı ("pod install + cap sync") kullanıcıya ASLA gösterilmez.
 */
export function iapErrorText(code: string | undefined, locale: string): string {
  const tr = locale === 'tr';
  switch (code) {
    case 'IAP_NOT_READY':
    case 'Native IAP unavailable':
      return tr
        ? 'Mağaza bağlantısı şu anda kurulamadı. Uygulamayı kapatıp yeniden açmayı dene; sorun sürerse App Store hesabının bu cihazda açık olduğundan emin ol.'
        : 'We could not reach the App Store right now. Please close and reopen the app; if it persists, make sure you are signed in to the App Store on this device.';
    case 'No offering configured':
      return tr
        ? 'Satın alma seçenekleri şu anda yüklenemedi. Lütfen birazdan tekrar dene.'
        : 'Purchase options could not be loaded right now. Please try again shortly.';
    case 'Purchase did not unlock entitlement':
      return tr
        ? 'Ödemen alındı ama erişim henüz açılmadı. "Satın alımları geri yükle"ye dokun; sorun sürerse destek ekibimize yaz.'
        : 'Your payment went through but access is not active yet. Tap “Restore purchases”; if it persists, contact our support.';
    case 'No active entitlement to restore':
      return tr
        ? 'Geri yüklenecek aktif bir satın alım bulunamadı.'
        : 'No active purchase to restore.';
    default:
      return tr
        ? 'Satın alma tamamlanamadı. Lütfen tekrar dene.'
        : 'The purchase could not be completed. Please try again.';
  }
}

// Geri uyumluluk için tek PRODUCT referansı (eski çağrı yerleri).
export const PRODUCT = {
  key: 'soulprofile_unlock' as const,
  name: 'SoulProfile Premium',
  price: PLANS.lifetime.price,
  description: 'Tüm özelliklere sınırsız erişim.',
  features: FEATURES.tr,
};
