# SoulProfile — Payment Integration Spec

> Tek bir entitlement modeli üzerinden cross-platform monetization.
> Backbone: **RevenueCat**. Web rail: **Stripe**. iOS rail: **Apple StoreKit 2**.
> Source of truth: Supabase `subscriptions` tablosu + RevenueCat customer attributes.

---

## 0. Karar Özeti

| Konu | Karar | Gerekçe |
|---|---|---|
| Cross-platform entitlement broker | RevenueCat | Tek SDK, tek webhook, tek dashboard. Apple/Google/Stripe receipt validation built-in. |
| Web ödeme | Stripe Checkout (hosted) | SCA/3DS2 built-in, customer portal hazır, RevenueCat REST entegrasyonu official. |
| iOS ödeme | StoreKit 2 (via `@revenuecat/purchases-capacitor`) | Apple guideline 3.1.1 zorunlu; RevenueCat sandbox + family sharing destekler. |
| Trial | 7 gün, kart gerektirir (her iki tarafta) | Conversion data: kartlı trial intent kalitesi 3-4x daha yüksek. |
| Webhook → Supabase | RevenueCat tek kaynak | Stripe webhook'larını RevenueCat'a forward et, Supabase'i RevenueCat webhook'u günceller. |
| Premium gate kontrolü | `usePremium()` hook | `feature-flags.ts` ile birlikte; lansman promosu süresince override. |

---

## 1. Mimari Diyagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Web)                                │
│  Next.js + React                                                         │
│  ┌──────────────────┐    ┌────────────────────┐                          │
│  │ PaywallModal.tsx │───▶│ lib/payments/      │                          │
│  └──────────────────┘    │   stripe.ts        │                          │
│                          │   revenuecat.ts    │                          │
│                          └─────────┬──────────┘                          │
│                                    │                                     │
│  ┌──────────────────────┐          │                                     │
│  │ hooks/usePremium.ts  │◀─────────┼───── entitlement check              │
│  └──────────────────────┘          │                                     │
└─────────────────────────────────────┼─────────────────────────────────────┘
                                      │
                                      ▼
                ┌─────────────────────────────────────┐
                │      app/api/checkout/route.ts      │  (Next.js API)
                │      app/api/portal/route.ts        │
                └────────────────────┬────────────────┘
                                     │ Stripe Checkout Session create
                                     ▼
              ┌──────────────────────────────────────────┐
              │            STRIPE                         │
              │  - Checkout (hosted, 3DS2)                │
              │  - Customer Portal                        │
              │  - Subscription lifecycle events          │
              └────────────────┬─────────────────────────┘
                               │ webhook (checkout.session.completed,
                               │   invoice.paid, subscription.updated)
                               ▼
              ┌──────────────────────────────────────────┐
              │           REVENUECAT                      │
              │  - Receipt validation                     │
              │  - Cross-platform entitlement aggregator  │
              │  - Subscriber attributes (app_user_id)    │
              └────────────────┬─────────────────────────┘
                               │ webhook (INITIAL_PURCHASE, RENEWAL,
                               │   CANCELLATION, EXPIRATION, REFUND)
                               ▼
              ┌──────────────────────────────────────────┐
              │  app/api/webhook/revenuecat/route.ts      │
              │  HMAC-SHA256 verify → upsert              │
              └────────────────┬─────────────────────────┘
                               │
                               ▼
              ┌──────────────────────────────────────────┐
              │           SUPABASE                        │
              │  subscriptions (user_id, product_id,      │
              │    status, current_period_end, raw)       │
              │  + entitlements (denormalized cache)      │
              └──────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (iOS)                                │
│  Capacitor shell + Next.js export                                        │
│  ┌──────────────────────────────────┐                                    │
│  │ @revenuecat/purchases-capacitor  │──▶ StoreKit 2 ──▶ Apple Servers   │
│  └──────────────────────────────────┘                                    │
│                                    │                                     │
│                                    ▼                                     │
│                          (Apple validates, RevenueCat polls receipts)    │
└─────────────────────────────────────────────────────────────────────────┘
```

**Akış kuralı:** Client hiçbir zaman premium state'i kendisi karar vermez. Her zaman
RevenueCat `CustomerInfo.entitlements.active["premium"]` veya Supabase cache okunur.
Supabase cache = offline-friendly, RevenueCat = source of truth.

---

## 2. RevenueCat Kurulumu

### 2.1 Hesap ve project

1. https://app.revenuecat.com → **Sign up**.
2. **Create project** → "SoulProfile".
3. Üç **App** oluştur:
   - **SoulProfile iOS** (Apple App Store)
   - **SoulProfile Web** (Stripe)
   - (gelecek) **SoulProfile Android** (Google Play Billing)
4. Her app için API keys:
   - iOS → `appl_xxx` (Public SDK key)
   - Web → `strp_xxx` (Public SDK key)
   - Secret API key (REST) → backend için

### 2.2 Products

| RevenueCat Product ID | Apple Product ID | Stripe Price ID (env) | Type | Period |
|---|---|---|---|---|
| `cosmic_weekly` | `life.soulprofile.app.weekly` | `STRIPE_PRICE_WEEKLY` | subscription | P1W |
| `monthly_galactic` | `life.soulprofile.app.monthly` | `STRIPE_PRICE_MONTHLY` | subscription | P1M |
| `solar_return_yearly` | `life.soulprofile.app.solar` | `STRIPE_PRICE_SOLAR` | subscription | P1Y |
| `relationship_sync` | `life.soulprofile.app.relsync` | `STRIPE_PRICE_RELSYNC` | non_subscription | — |
| `premium_bundle_yearly` | `life.soulprofile.app.bundle` | `STRIPE_PRICE_BUNDLE` | subscription | P1Y |

> **Naming convention:** Apple product ID = bundle reverse-DNS + `.` + slug. RevenueCat
> product ID = snake_case, app-agnostic. Stripe Price ID dinamik, env var ile inject.

### 2.3 Entitlements

Tek entitlement: **`premium`**.

- Tüm subscription product'ları **`premium`** entitlement'ına bağlanır.
- `relationship_sync` non-consumable: ayrı entitlement **`relationship`** (lifetime).
- `usePremium()` hook **`premium` || `relationship`** kontrolünü yapar (relationship-only kullanıcılar paywall görmez sadece o feature için).

```
entitlements:
  premium:
    products:
      - cosmic_weekly
      - monthly_galactic
      - solar_return_yearly
      - premium_bundle_yearly
  relationship:
    products:
      - relationship_sync
      - premium_bundle_yearly   # bundle her şeyi açar
```

### 2.4 Offerings

Tek default offering: **`default`**.

```
offerings:
  default:
    packages:
      - identifier: $rc_weekly         → cosmic_weekly
      - identifier: $rc_monthly        → monthly_galactic
      - identifier: $rc_annual         → solar_return_yearly
      - identifier: relationship_oneoff → relationship_sync
      - identifier: bundle             → premium_bundle_yearly
```

A/B test için ileride `paywall_v2`, `paywall_promo` gibi offering'ler eklenebilir;
client `Purchases.getOfferings()` çağırır, server tarafı offering değiştirmek yeterli.

### 2.5 Integrations

- **Stripe integration** → RevenueCat dashboard → Integrations → Stripe → Connect
  - Stripe webhook endpoint'i RevenueCat otomatik kurar.
  - **Önemli:** `Listen for events` ON.
- **Webhook out** → Project Settings → Integrations → Webhooks
  - URL: `https://soulprofile.life/api/webhook/revenuecat`
  - Auth header: `Authorization: Bearer ${REVENUECAT_WEBHOOK_SECRET}` (custom header)

---

## 3. Apple App Store Connect — IAP Setup

### 3.1 Ön gereksinim

- Apple Developer Program aktif ($99/yıl)
- Paid Apps Agreement imzalı (Agreements, Tax, and Banking)
- Bank/tax info onaylı (aksi halde IAP create butonu disabled)

### 3.2 Product oluşturma

App Store Connect → My Apps → SoulProfile → **In-App Purchases**.

| Ürün | Type | Reference Name | Product ID | Subscription Group |
|---|---|---|---|---|
| Cosmic Weekly | Auto-Renewable Sub | `cosmic_weekly` | `life.soulprofile.app.weekly` | `soulprofile_premium` |
| Monthly Galactic | Auto-Renewable Sub | `monthly_galactic` | `life.soulprofile.app.monthly` | `soulprofile_premium` |
| Solar Return | Auto-Renewable Sub | `solar_return_yearly` | `life.soulprofile.app.solar` | `soulprofile_premium` |
| Relationship Sync | Non-Consumable | `relationship_sync` | `life.soulprofile.app.relsync` | — |
| Premium Bundle | Auto-Renewable Sub | `premium_bundle_yearly` | `life.soulprofile.app.bundle` | `soulprofile_premium` |

> Tüm subscription'ları tek **subscription group** içine koy → kullanıcı upgrade/downgrade
> edebilir, Apple proration otomatik. Premium Bundle en yüksek **service level** (1).

### 3.3 Subscription level sırası

```
soulprofile_premium (group)
  Level 1: premium_bundle_yearly     ($79/yr — highest service)
  Level 2: solar_return_yearly       ($19.99/yr)
  Level 3: monthly_galactic          ($14.99/mo)
  Level 4: cosmic_weekly             ($2.99/wk — lowest service)
```

Upgrade → immediate. Downgrade → next renewal.

### 3.4 Localizations & metadata

Her ürün için minimum **EN** + **TR**:
- Display Name (max 30 char)
- Description (max 45 char)
- Promotional image (1024x1024 PNG)

### 3.5 Trial introductory offer

Her subscription için **Subscription Pricing → Introductory Offer**:
- Type: **Free Trial**
- Duration: **7 days**
- Eligibility: New subscribers
- Countries: All

### 3.6 Server-to-server notifications

Apple Server Notifications V2 → RevenueCat URL (RevenueCat dashboard kopyalat):
```
https://api.revenuecat.com/v1/incoming/apple/<APP_ID>
```
- Sandbox + Production URL ayrı ayrı set et.
- **Shared Secret** (App-Specific) generate et → RevenueCat dashboard'a yapıştır.

### 3.7 Sandbox testing

- App Store Connect → Users and Access → **Sandbox Testers**.
- En az 3 sandbox account: TR storefront, US storefront, expired-subscription account.
- TestFlight build'inde otomatik sandbox kullanılır.
- Sandbox renewal hızı: 1 hafta = 3 dk, 1 ay = 5 dk, 1 yıl = 1 saat. (Test hızlandırma)

### 3.8 App Review notları

Submission'a IAP'ler dahil. Review formuna ekle:
```
This app uses In-App Purchases for premium spiritual content (extended birth
chart analyses, weekly transits, relationship synastry). Free version offers
a complete Galactic Birth Chart. Sandbox account credentials provided in
App Review Information.
```

---

## 4. Stripe Setup

### 4.1 Account

1. https://dashboard.stripe.com → register.
2. **Activate account** → tax + bank.
3. EU-based (KVKK/GDPR uyumlu region). Türkiye için **Stripe Atlas** veya **Iyzico**
   alternatif olabilir; ancak RevenueCat şu an sadece Stripe destekliyor.
4. **Restricted API key** oluştur: write için RevenueCat, server için ayrı `sk_live_xxx`.

### 4.2 Products & Prices

Stripe Dashboard → **Products** → Add product.

```
Product: Cosmic Weekly
  Price: $2.99 USD / week, recurring
  → price_xxx → env: STRIPE_PRICE_WEEKLY

Product: Monthly Galactic
  Price: $14.99 USD / month, recurring
  → env: STRIPE_PRICE_MONTHLY

Product: Solar Return
  Price: $19.99 USD / year, recurring
  → env: STRIPE_PRICE_SOLAR

Product: Relationship Sync
  Price: $9.99 USD, one-time
  → env: STRIPE_PRICE_RELSYNC

Product: Premium Bundle
  Price: $79.00 USD / year, recurring
  → env: STRIPE_PRICE_BUNDLE
```

Her subscription price'ında **Free trial: 7 days** ayarla.

### 4.3 Checkout vs Embedded — Karar

**Hosted Checkout** kullan (`stripe.checkout.sessions.create`):

| Hosted Checkout | Embedded (Elements) |
|---|---|
| SCA/3DS2 otomatik | Manuel 3DS2 handling |
| Apple Pay/Google Pay otomatik | Manuel entegrasyon |
| Lokalizasyon (40+ dil) free | Manuel |
| PCI scope: SAQ A | Daha geniş SAQ |
| Branding sınırlı | Tam kontrol |

SoulProfile'da brand kontrolü kritik değil; conversion + güvenlik öncelik. **Hosted.**

### 4.4 Customer Portal

Dashboard → Settings → Billing → **Customer Portal** → Activate.
- Cancel subscription: ON
- Update payment method: ON
- View invoice history: ON
- Switch plan: ON (allowed prices = tüm subscription'lar)

### 4.5 Webhooks

İki webhook gerekli:
- **RevenueCat → Stripe**: RevenueCat otomatik kurar (yukarıdaki Integration).
- **Bizim webhook**: Sadece edge-case'ler için (örn. fraud, chargeback alerting).
  Çoğu event'i RevenueCat işliyor; sadece `charge.dispute.created` için bizim endpoint.

---

## 5. Web Client Kodu

### 5.1 `lib/payments/types.ts`

```ts
export type Plan = 'weekly' | 'monthly' | 'solar' | 'relationship' | 'bundle';

export interface PlanMeta {
  id: Plan;
  rcProductId: string;
  appleProductId: string;
  stripePriceEnv: string;
  price: string;            // display
  period: string;           // display
  title: string;
  blurb: string;
  trialDays?: number;
}

export const PLANS: Record<Plan, PlanMeta> = {
  weekly: {
    id: 'weekly',
    rcProductId: 'cosmic_weekly',
    appleProductId: 'life.soulprofile.app.weekly',
    stripePriceEnv: 'STRIPE_PRICE_WEEKLY',
    price: '$2.99',
    period: 'hafta',
    title: 'Cosmic Weekly',
    blurb: 'Haftalık transit + biyoritm + mantra',
    trialDays: 7,
  },
  monthly: {
    id: 'monthly',
    rcProductId: 'monthly_galactic',
    appleProductId: 'life.soulprofile.app.monthly',
    stripePriceEnv: 'STRIPE_PRICE_MONTHLY',
    price: '$14.99',
    period: 'ay',
    title: 'Monthly Galactic',
    blurb: 'Yeni/dolunay rehberi + ilişki transitleri',
    trialDays: 7,
  },
  solar: {
    id: 'solar',
    rcProductId: 'solar_return_yearly',
    appleProductId: 'life.soulprofile.app.solar',
    stripePriceEnv: 'STRIPE_PRICE_SOLAR',
    price: '$19.99',
    period: 'yıl',
    title: 'Solar Return',
    blurb: '12 ay tema haritası + çeyrek odakları',
    trialDays: 7,
  },
  relationship: {
    id: 'relationship',
    rcProductId: 'relationship_sync',
    appleProductId: 'life.soulprofile.app.relsync',
    stripePriceEnv: 'STRIPE_PRICE_RELSYNC',
    price: '$9.99',
    period: 'tek seferlik',
    title: 'Relationship Sync',
    blurb: 'Synastry + Human Design ilişki haritası',
  },
  bundle: {
    id: 'bundle',
    rcProductId: 'premium_bundle_yearly',
    appleProductId: 'life.soulprofile.app.bundle',
    stripePriceEnv: 'STRIPE_PRICE_BUNDLE',
    price: '$79',
    period: 'yıl',
    title: 'Premium Bundle',
    blurb: 'Tümü + sınırsız PDF + AI chat',
    trialDays: 7,
  },
};
```

### 5.2 `lib/payments/stripe.ts` (client-side)

```ts
import type { Plan } from './types';

export interface CheckoutOptions {
  plan: Plan;
  userId: string;
  email: string;
  locale?: 'tr' | 'en';
}

/**
 * Kullanıcıyı Stripe Checkout'a yönlendirir.
 * Backend, RevenueCat'in `app_user_id` field'ı için Supabase user_id'yi
 * client_reference_id olarak ekler — webhook reconciliation için kritik.
 */
export async function startCheckout(opts: CheckoutOptions): Promise<void> {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opts),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Checkout failed' }));
    throw new Error(err.message ?? 'Checkout failed');
  }
  const { url } = await res.json();
  if (!url) throw new Error('No checkout URL returned');
  window.location.href = url;
}

/** Customer Portal — abonelik yönet, iptal et, fatura indir. */
export async function openCustomerPortal(): Promise<void> {
  const res = await fetch('/api/portal', { method: 'POST' });
  if (!res.ok) throw new Error('Portal session failed');
  const { url } = await res.json();
  window.location.href = url;
}
```

### 5.3 `app/api/checkout/route.ts`

**Karar: Next.js API route, Supabase Edge Function değil.**

Gerekçe:
1. Next.js API route Netlify Functions olarak otomatik deploy olur — ek build/deploy yok.
2. `STRIPE_SECRET_KEY` Netlify env vars'ta tek lokasyon.
3. Latency: edge runtime + Stripe SDK = ~150ms total.
4. Supabase Edge Function gereken yerler: cron job, scheduled task, Anthropic key.
   Sync ödeme akışı bu kategoride değil.

```ts
// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { PLANS, type Plan } from '@/lib/payments/types';

export const runtime = 'nodejs'; // Stripe SDK requires Node

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

interface Body {
  plan: Plan;
  userId: string;
  email: string;
  locale?: 'tr' | 'en';
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const { plan, userId, email, locale = 'tr' } = body;
  const meta = PLANS[plan];
  if (!meta) return NextResponse.json({ message: 'Unknown plan' }, { status: 400 });

  const priceId = process.env[meta.stripePriceEnv];
  if (!priceId) {
    return NextResponse.json(
      { message: `Missing price env: ${meta.stripePriceEnv}` },
      { status: 500 },
    );
  }

  // Existing Stripe customer var mı?
  const { data: existing } = await supabaseAdmin
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .maybeSingle();

  let customerId = existing?.stripe_customer_id as string | undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
      metadata: { supabase_user_id: userId },
    });
    customerId = customer.id;
    await supabaseAdmin
      .from('stripe_customers')
      .insert({ user_id: userId, stripe_customer_id: customerId });
  }

  const isSubscription = plan !== 'relationship';

  const session = await stripe.checkout.sessions.create({
    mode: isSubscription ? 'subscription' : 'payment',
    customer: customerId,
    client_reference_id: userId, // RevenueCat reconciliation
    line_items: [{ price: priceId, quantity: 1 }],
    locale: locale === 'tr' ? 'tr' : 'en',
    allow_promotion_codes: true,
    automatic_tax: { enabled: true },
    subscription_data: isSubscription
      ? {
          trial_period_days: meta.trialDays ?? undefined,
          metadata: { supabase_user_id: userId, plan },
        }
      : undefined,
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/premium?canceled=1`,
    metadata: { supabase_user_id: userId, plan },
  });

  return NextResponse.json({ url: session.url });
}
```

### 5.4 `app/api/portal/route.ts`

```ts
// app/api/portal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(_req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Bu route'u SSR session ile koru
  const accessToken = cookies().get('sb-access-token')?.value;
  if (!accessToken) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { data: user } = await supabase.auth.getUser(accessToken);
  if (!user.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { data: row } = await supabase
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('user_id', user.user.id)
    .maybeSingle();

  if (!row?.stripe_customer_id) {
    return NextResponse.json({ message: 'No customer' }, { status: 404 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: row.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/premium`,
  });

  return NextResponse.json({ url: session.url });
}
```

### 5.5 `app/api/webhook/revenuecat/route.ts`

> **Stripe webhook'u DEĞİL.** Stripe → RevenueCat → bizim webhook flow'u.
> RevenueCat tüm provider event'lerini normalize eder; tek webhook'tan tüm
> entitlement updates gelir.

```ts
// app/api/webhook/revenuecat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const runtime = 'nodejs';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

interface RCEvent {
  api_version: string;
  event: {
    type:
      | 'INITIAL_PURCHASE'
      | 'RENEWAL'
      | 'CANCELLATION'
      | 'UNCANCELLATION'
      | 'NON_RENEWING_PURCHASE'
      | 'EXPIRATION'
      | 'BILLING_ISSUE'
      | 'PRODUCT_CHANGE'
      | 'SUBSCRIBER_ALIAS'
      | 'REFUND'
      | 'SUBSCRIPTION_EXTENDED';
    app_user_id: string;
    product_id: string;
    period_type: 'TRIAL' | 'INTRO' | 'NORMAL' | 'PROMOTIONAL';
    purchased_at_ms: number;
    expiration_at_ms?: number;
    store: 'APP_STORE' | 'PLAY_STORE' | 'STRIPE' | 'PROMOTIONAL';
    environment: 'SANDBOX' | 'PRODUCTION';
    entitlement_ids?: string[];
    transaction_id: string;
    original_transaction_id: string;
  };
}

export async function POST(req: NextRequest) {
  // 1. Authorization header verify
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.REVENUECAT_WEBHOOK_SECRET}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json()) as RCEvent;
  const ev = body.event;

  // Sandbox event'leri prod tablosuna yazma
  if (ev.environment === 'SANDBOX' && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ignored: 'sandbox in prod' });
  }

  const status = mapStatus(ev.type);
  const provider = ev.store === 'STRIPE' ? 'stripe' : 'revenuecat';

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .upsert(
      {
        user_id: ev.app_user_id,
        provider,
        product_id: ev.product_id,
        status,
        current_period_end: ev.expiration_at_ms
          ? new Date(ev.expiration_at_ms).toISOString()
          : null,
        raw: body,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,product_id' },
    );

  if (error) {
    console.error('webhook upsert failed', error);
    return NextResponse.json({ message: 'DB error' }, { status: 500 });
  }

  // Entitlement cache tablosunu güncelle (hızlı read için)
  await refreshEntitlements(ev.app_user_id);

  return NextResponse.json({ ok: true });
}

function mapStatus(type: RCEvent['event']['type']): string {
  switch (type) {
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
    case 'UNCANCELLATION':
    case 'NON_RENEWING_PURCHASE':
    case 'PRODUCT_CHANGE':
    case 'SUBSCRIPTION_EXTENDED':
      return 'active';
    case 'CANCELLATION':
      return 'canceled'; // billed sonuna kadar aktif
    case 'EXPIRATION':
      return 'expired';
    case 'BILLING_ISSUE':
      return 'past_due';
    case 'REFUND':
      return 'refunded';
    default:
      return 'unknown';
  }
}

async function refreshEntitlements(userId: string) {
  // En son aktif sub'a göre entitlement satırı upsert
  const { data: subs } = await supabaseAdmin
    .from('subscriptions')
    .select('product_id, status, current_period_end')
    .eq('user_id', userId);

  const now = Date.now();
  const hasPremium = (subs ?? []).some(
    (s) =>
      ['active', 'canceled'].includes(s.status) &&
      s.current_period_end &&
      new Date(s.current_period_end).getTime() > now,
  );
  const hasRelationship =
    hasPremium ||
    (subs ?? []).some(
      (s) => s.product_id === 'relationship_sync' && s.status === 'active',
    );

  await supabaseAdmin.from('entitlements').upsert(
    {
      user_id: userId,
      premium: hasPremium,
      relationship: hasRelationship,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );
}
```

### 5.6 `lib/payments/revenuecat-web.ts` (web fetch fallback)

Web tarafında RevenueCat'in Web Billing SDK'sı (alpha) yerine REST API kullan:

```ts
// lib/payments/revenuecat-web.ts
const RC_BASE = 'https://api.revenuecat.com/v1';
const RC_PUBLIC_KEY = process.env.NEXT_PUBLIC_REVENUECAT_WEB_KEY!;

export interface RCSubscriber {
  entitlements: Record<
    string,
    { expires_date: string | null; product_identifier: string } | undefined
  >;
}

/** Kullanıcının entitlement durumunu RevenueCat'ten oku (cache-buster için). */
export async function fetchSubscriber(userId: string): Promise<RCSubscriber> {
  const res = await fetch(`${RC_BASE}/subscribers/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${RC_PUBLIC_KEY}` },
  });
  if (!res.ok) throw new Error(`RC fetch failed: ${res.status}`);
  const data = await res.json();
  return { entitlements: data.subscriber.entitlements };
}
```

> Web'de **Stripe Checkout** primary path. RevenueCat REST sadece read-side
> (entitlement doğrulama). Stripe ödeme tamamlandığında RevenueCat'in Stripe
> integration'ı arka planda kullanıcıyı oluşturur.

---

## 6. iOS Client Kodu (Capacitor + RevenueCat)

> **Capacitor Karar:** Next.js export → `npx cap add ios` → Xcode wrapper.
> Pure native değil; web view'da çalışır ama RevenueCat'in Capacitor plugin'i
> StoreKit 2'ye native köprü sağlar.

### 6.1 Kurulum

```bash
npm install @capacitor/core @capacitor/ios @capacitor/cli
npm install @revenuecat/purchases-capacitor
npx cap add ios
npx cap sync ios
```

`capacitor.config.ts`:
```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'life.soulprofile.app',
  appName: 'SoulProfile',
  webDir: 'out',
  ios: { contentInset: 'always' },
};
export default config;
```

`next.config.js` → `output: 'export'` (iOS bundle için).

### 6.2 `lib/payments/revenuecat.ts`

```ts
// lib/payments/revenuecat.ts
import {
  Purchases,
  LOG_LEVEL,
  type PurchasesOffering,
  type PurchasesPackage,
  type CustomerInfo,
} from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

let configured = false;

export async function configureRevenueCat(userId: string): Promise<void> {
  if (configured || !Capacitor.isNativePlatform()) return;

  await Purchases.setLogLevel({ level: LOG_LEVEL.WARN });
  await Purchases.configure({
    apiKey: process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY!,
    appUserID: userId, // Supabase user_id — cross-platform alias
  });
  configured = true;
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  const { current } = await Purchases.getOfferings();
  return current ?? null;
}

export async function purchasePackage(
  pkg: PurchasesPackage,
): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
  return customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.restorePurchases();
  return customerInfo;
}

export async function getCustomerInfo(): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.getCustomerInfo();
  return customerInfo;
}

export function isPremium(info: CustomerInfo): boolean {
  return Boolean(info.entitlements.active['premium']);
}

export function isRelationship(info: CustomerInfo): boolean {
  return Boolean(
    info.entitlements.active['premium'] ||
      info.entitlements.active['relationship'],
  );
}

/** Apple, kullanıcı identity değiştiğinde alias yapmamızı bekler. */
export async function aliasUser(newUserId: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await Purchases.logIn({ appUserID: newUserId });
}

export async function logOutUser(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await Purchases.logOut();
}
```

### 6.3 Restore Purchases Flow

iOS guideline 3.1.1: **Restore Purchases** butonu zorunlu, hem paywall'da hem settings'te.

```ts
// PaywallModal içinde
async function handleRestore() {
  try {
    setRestoring(true);
    const info = await restorePurchases();
    if (isPremium(info)) {
      toast.success('Premium restore edildi');
      onClose();
    } else {
      toast.info('Aktif satın alma bulunamadı');
    }
  } catch (e) {
    toast.error('Restore başarısız: ' + (e as Error).message);
  } finally {
    setRestoring(false);
  }
}
```

### 6.4 Receipt Validation

**RevenueCat otomatik yapar.** Client `purchasePackage` çağırdığında:
1. StoreKit 2 receipt üretir.
2. RevenueCat SDK receipt'i RevenueCat servers'a yollar.
3. RevenueCat Apple'ın `verifyReceipt` endpoint'ine doğrular.
4. Subscriber objesini günceller, webhook tetikler.

Bizim tarafta **ekstra validation YAPMA**; RevenueCat'in idempotency'sini boz.

### 6.5 App lifecycle hook

```ts
// app/_app-ios-bootstrap.tsx (Capacitor only)
import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { getCustomerInfo } from '@/lib/payments/revenuecat';
import { useEntitlementStore } from '@/lib/store';

export function IOSBootstrap() {
  const setInfo = useEntitlementStore((s) => s.setInfo);

  useEffect(() => {
    const sub = CapacitorApp.addListener('appStateChange', async ({ isActive }) => {
      if (isActive) {
        const info = await getCustomerInfo();
        setInfo(info);
      }
    });
    return () => { sub.then((h) => h.remove()); };
  }, [setInfo]);

  return null;
}
```

Foreground'a dönüşte entitlement re-fetch → expired sub anında reflect.

---

## 7. Premium Gate Hook

### 7.1 `hooks/usePremium.ts`

```ts
// hooks/usePremium.ts
import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { premiumOpen } from '@/lib/feature-flags';
import { getCustomerInfo, isPremium, isRelationship } from '@/lib/payments/revenuecat';
import { fetchSubscriber } from '@/lib/payments/revenuecat-web';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';

export interface PremiumState {
  loading: boolean;
  premium: boolean;
  relationship: boolean;
  /** Lansman promosu nedeniyle açıldıysa true */
  promoActive: boolean;
  refresh: () => Promise<void>;
}

export function usePremium(): PremiumState {
  const user = useSupabaseUser();
  const [state, setState] = useState<Omit<PremiumState, 'refresh'>>({
    loading: true,
    premium: false,
    relationship: false,
    promoActive: premiumOpen(),
  });

  async function refresh() {
    if (!user) {
      setState((s) => ({ ...s, loading: false, premium: false, relationship: false }));
      return;
    }

    // 1. Lansman promosu aktifse herkes premium
    if (premiumOpen()) {
      setState({ loading: false, premium: true, relationship: true, promoActive: true });
      return;
    }

    try {
      if (Capacitor.isNativePlatform()) {
        const info = await getCustomerInfo();
        setState({
          loading: false,
          premium: isPremium(info),
          relationship: isRelationship(info),
          promoActive: false,
        });
      } else {
        const sub = await fetchSubscriber(user.id);
        const now = Date.now();
        const ent = sub.entitlements;
        const isActive = (key: string) => {
          const e = ent[key];
          if (!e) return false;
          if (!e.expires_date) return true; // non-consumable
          return new Date(e.expires_date).getTime() > now;
        };
        setState({
          loading: false,
          premium: isActive('premium'),
          relationship: isActive('premium') || isActive('relationship'),
          promoActive: false,
        });
      }
    } catch (e) {
      console.warn('premium refresh failed, falling back to Supabase cache', e);
      // Fallback: Supabase entitlements tablosundan oku
      // (offline-tolerant)
    }
  }

  useEffect(() => { refresh(); }, [user?.id]);

  return { ...state, refresh };
}
```

### 7.2 Feature gate kullanımı

```tsx
// components/WeeklyReportCard.tsx
import { usePremium } from '@/hooks/usePremium';
import { PaywallModal } from './PaywallModal';
import { useState } from 'react';

export function WeeklyReportCard() {
  const { premium, loading } = usePremium();
  const [showPaywall, setShowPaywall] = useState(false);

  if (loading) return <Skeleton />;

  if (!premium) {
    return (
      <>
        <LockedTeaser onClick={() => setShowPaywall(true)} />
        <PaywallModal
          open={showPaywall}
          onClose={() => setShowPaywall(false)}
          trigger="weekly_card"
        />
      </>
    );
  }

  return <FullWeeklyReport />;
}
```

### 7.3 `lib/feature-flags.ts` güncellemesi

Mevcut dosya genişletilir:

```ts
// lib/feature-flags.ts
export const LAUNCH_PROMO_END = new Date('2026-09-01T00:00:00Z');

export function isLaunchPromoActive(now = new Date()): boolean {
  return now < LAUNCH_PROMO_END;
}

export function premiumOpen(): boolean {
  return isLaunchPromoActive();
}

export function daysUntilPromoEnd(now = new Date()): number {
  const ms = LAUNCH_PROMO_END.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

// --- Yeni: feature-level kilit ---
export type GatedFeature =
  | 'weekly_report'
  | 'monthly_report'
  | 'solar_return'
  | 'relationship_sync'
  | 'ai_chat'
  | 'pdf_export';

export interface FeatureAccess {
  requires: 'premium' | 'relationship' | 'free';
  paywallTrigger: GatedFeature;
}

export const FEATURE_MATRIX: Record<GatedFeature, FeatureAccess> = {
  weekly_report:      { requires: 'premium',      paywallTrigger: 'weekly_report' },
  monthly_report:     { requires: 'premium',      paywallTrigger: 'monthly_report' },
  solar_return:       { requires: 'premium',      paywallTrigger: 'solar_return' },
  relationship_sync:  { requires: 'relationship', paywallTrigger: 'relationship_sync' },
  ai_chat:            { requires: 'premium',      paywallTrigger: 'ai_chat' },
  pdf_export:         { requires: 'premium',      paywallTrigger: 'pdf_export' },
};

export function canAccess(
  feature: GatedFeature,
  state: { premium: boolean; relationship: boolean },
): boolean {
  if (premiumOpen()) return true;
  const cfg = FEATURE_MATRIX[feature];
  if (cfg.requires === 'free') return true;
  if (cfg.requires === 'premium') return state.premium;
  if (cfg.requires === 'relationship') return state.premium || state.relationship;
  return false;
}
```

---

## 8. Paywall UX

### 8.1 `components/PaywallModal.tsx` Spec

**Layout (mobile 360px → desktop 640px):**

```
┌────────────────────────────────────────┐
│  ✕                                      │
│                                         │
│       Galaktik haritanı derinleştir     │  ← Headline (24px, galaxy gradient)
│       7 gün ücretsiz dene               │  ← Subheadline (14px, muted)
│                                         │
│   ┌──────────┬──────────┬──────────┐    │
│   │  WEEKLY  │ MONTHLY  │  ANNUAL  │    │  ← 3 plan tab
│   │  $2.99   │ $14.99   │  $79     │    │
│   │  /hafta  │  /ay     │  /yıl    │    │
│   │          │  POPULAR │  BEST     │    │
│   └──────────┴──────────┴──────────┘    │
│                                         │
│   ✓ Haftalık transit penceresi          │  ← Bullet list (her plana göre dinamik)
│   ✓ Yeni & dolunay rehberi              │
│   ✓ Solar return haritası               │
│   ✓ AI cosmic chat (sınırsız)           │
│   ✓ PDF karne export                    │
│                                         │
│   ┌──────────────────────────────────┐  │
│   │  7 GÜN ÜCRETSİZ DENE             │  │  ← Primary CTA (cosmic gradient)
│   └──────────────────────────────────┘  │
│                                         │
│   [Restore Purchases]  [Manage Plan]    │  ← Secondary actions
│                                         │
│   Eğlence amaçlıdır. Tıbbi/finansal     │  ← Disclaimer
│   tavsiye yerine geçmez.                │
│                                         │
│   Terms · Privacy · Trial otomatik      │  ← Footer links
│   yenilenir, iptal: hesap ayarları      │
└────────────────────────────────────────┘
```

**Props:**
```ts
interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  trigger: GatedFeature | 'manual';
  defaultPlan?: Plan;       // 'monthly' default — sweet spot
  utm?: string;             // analytics
}
```

**Davranış:**
- ESC ile kapat.
- 3 plan tab; default `monthly` highlighted (POPULAR rozeti).
- Bullet list `trigger`'a göre yeniden sıralanır (örn. trigger=ai_chat → AI chat ilk).
- CTA: subscription seçildiyse "7 GÜN ÜCRETSİZ DENE", one-time seçildiyse "SATIN AL".
- Web → `startCheckout()`. iOS → `purchasePackage()`.
- Loading state'inde CTA disabled + spinner.
- Hata → inline error banner üstte.

### 8.2 Trigger noktaları

| Tetikleyici | Konum | Trigger ID |
|---|---|---|
| Free karne tamamlandı, scroll bottom | `app/report/page.tsx` footer | `weekly_card` |
| Weekly report card tıklandı | `components/WeeklyReportCard` | `weekly_report` |
| Monthly tab seçildi | `app/report/(tabs)/monthly` | `monthly_report` |
| Doğum günü push notification → app open | `app/page.tsx` mount | `solar_return` |
| Relationship Sync sayfası | `app/relationship/page.tsx` | `relationship_sync` |
| AI chat send button | `components/AIChatComposer` | `ai_chat` |
| PDF export butonu | `ReportCard.tsx` export menu | `pdf_export` |

**Sıklık limiti:** Aynı session içinde max 2 kez göster. `sessionStorage.paywall_shown_at`.

### 8.3 A/B test hook'u

```ts
// lib/payments/paywall-variant.ts
export type PaywallVariant = 'standard' | 'social_proof' | 'urgency';

export function pickVariant(userId: string): PaywallVariant {
  // Deterministic hash split — RevenueCat experiments'tan da gelebilir
  const hash = [...userId].reduce((a, c) => a + c.charCodeAt(0), 0) % 3;
  return (['standard', 'social_proof', 'urgency'] as const)[hash];
}
```

---

## 9. Trial Stratejisi

### 9.1 Karar Matrisi

| Süre | Kart gerekli mi | Conversion (industry avg) | Karar |
|---|---|---|---|
| 3 gün | Yes | ~22% | Çok kısa |
| 7 gün | **Yes** | **~35%** | **✓ Seçim** |
| 14 gün | Yes | ~28% | Trial fatigue başlar |
| 7 gün | No (CC-less) | ~12% | Conversion düşük, churn yüksek |

**Karar: 7 gün, kart zorunlu.**

**Gerekçe:**
- Apple StoreKit 2 trial = kart zorunlu (default davranış).
- Stripe `trial_period_days` ile kart zorunlu (`payment_method_collection: 'always'`).
- Kart koymak → intent kalitesi yüksek; CAC ROI 3-4x.
- 7 gün = "1 haftalık transit cycle" deneyimi yeterli — Cosmic Weekly'nin
  value prop'u tam karşılanır.
- Cancel akışı kolay (in-app Settings → Subscriptions, web → Customer Portal).

### 9.2 Trial reminder

Apple **3 gün önce otomatik** trial-ending notification yollar (iOS 13+).
Stripe için ekstra: webhook `customer.subscription.trial_will_end` → Resend ile email:
```
Konu: Trial'in 3 günde sona eriyor — devam etmek için bir şey yapmana gerek yok
```

### 9.3 Trial conversion guardrails

- Trial gün 1 → "Haftalık karnen hazır" push
- Trial gün 3 → "Bu hafta için 3 transit pencere açıldı" push
- Trial gün 6 → "Trial yarın bitiyor. Bu ay özellikleri kaybetme" push + in-app modal
- Trial bitişi sonrası 24 saat içinde iptal eden kullanıcılara win-back: %50 ilk ay

---

## 10. Family Sharing & Promo Codes

### 10.1 Apple Family Sharing

App Store Connect → her subscription → **Family Sharing: ON**.

- Tek aile üyesi satın alır, 5 kişiye kadar paylaşır.
- RevenueCat otomatik handle eder; her family member ayrı `app_user_id` ile login olur,
  hepsinin `entitlements.active['premium']` true gelir.
- **Önemli:** Family Sharing aboneliği için RevenueCat receipt'inde `is_family_share: true`
  field'ı gelir. Analytics'te ayrı bucket yap (revenue gerçek satın alıcıya atfedilir).

### 10.2 Apple Promo Codes

- App Store Connect → IAP → her ürün → **Promo Codes** (1500/aylık limit).
- Marketing kampanyaları, influencer hediyeleri, basın için.
- Yıllık subscription için 1 ay free promo code üretebilirsin (Offer Code).
- **Offer Code** (subscription only): kupon formatı, in-app redemption sheet.

### 10.3 Stripe Promo Codes

```ts
// Checkout session create
allow_promotion_codes: true,
```

Stripe Dashboard → **Products → Coupons**:
- `LAUNCH50` → first month 50% off, redemption limit 1000
- `INFLUENCER_XYZ` → first month free, tracking_id metadata
- `WIN_BACK_30` → 30% off 3 months, restricted to canceled customers

### 10.4 Affiliate / Influencer link flow

```
https://soulprofile.life/premium?promo=INFLUENCER_XYZ&utm_source=tiktok&utm_id=abc
```

Client side:
```ts
useEffect(() => {
  const promo = new URLSearchParams(location.search).get('promo');
  if (promo) sessionStorage.setItem('pending_promo', promo);
}, []);
```

Checkout API:
```ts
const promo = req.cookies.get('pending_promo')?.value;
if (promo) {
  // Stripe accepts promo via discounts param OR allow_promotion_codes (user types)
  session.discounts = [{ promotion_code: await resolvePromoId(promo) }];
}
```

---

## 11. Test Plan

### 11.1 Sandbox checklist

**Apple sandbox:**
- [ ] TR storefront sandbox account → Weekly satın al → entitlement aktif olmalı.
- [ ] US storefront sandbox → Annual satın al → currency conversion display TR locale'de doğru.
- [ ] Aynı sandbox account ile farklı device → restore çalışıyor.
- [ ] Trial bitiminden sonra (sandbox: 5dk) otomatik renewal → webhook geliyor.
- [ ] Cancel → `current_period_end`'e kadar premium kalıyor, sonra expired.
- [ ] Refund (Sandbox > Manage subscriptions > Refund) → webhook REFUND → DB güncel.
- [ ] Upgrade Weekly → Monthly → proration anında, entitlement kesintisiz.
- [ ] Downgrade Annual → Monthly → next renewal'da geçiyor.
- [ ] Family Sharing → 2. account → premium görüyor.
- [ ] Offline mod → cache'den premium okunuyor.

**Stripe sandbox:**
- [ ] Test card `4242 4242 4242 4242` → checkout → entitlement aktif.
- [ ] 3DS2 zorunlu kart `4000 0027 6000 3184` → SCA flow tamamlanıyor.
- [ ] Failed card `4000 0000 0000 0341` → past_due status, retry email.
- [ ] Customer Portal → cancel → webhook → status canceled.
- [ ] Customer Portal → plan switch → webhook PRODUCT_CHANGE → DB güncel.
- [ ] Promo code `LAUNCH50` apply → discount uygulanıyor.
- [ ] Webhook signature invalid → 401 dönüyor.
- [ ] Webhook duplicate event (same `event_id`) → idempotent (upsert).

### 11.2 Regression test list

```
- Free user yeni karne üretir → galactic gelir, weekly kilitli.
- Premium user yeni karne → galactic + weekly + monthly hepsi açık.
- Launch promo aktifken non-paying user → tüm feature'lar açık.
- Promo bitiş tarihinde server time → paywall aniden devreye giriyor.
- iOS app foreground → entitlement re-fetch.
- Sign out → entitlement state temizleniyor, paywall geri geliyor.
- Sign in (mevcut premium account) → RevenueCat.logIn alias → entitlement geri geliyor.
- iOS purchase → web'de login → entitlement görünür mü (RevenueCat cross-platform).
- Web Stripe purchase → iOS'ta login → entitlement görünür mü.
- Webhook gecikmesi (60sn) → optimistic UI premium gösteriyor ama refresh ile reconcile.
```

### 11.3 Load / chaos

- Webhook'a 1000 event/dk → Supabase upsert lock yok.
- Stripe webhook 5xx retry simülasyonu → RevenueCat re-deliver → idempotent.
- Network kesintisi sırasında purchase → restore ile geri yüklenir.

---

## 12. Compliance

### 12.1 SCA / 3DS2

- Stripe Checkout otomatik handle eder (PSD2 zorunlu).
- Test: `4000 0027 6000 3184` (3DS2 required) ve `4000 0025 0000 3155` (3DS2 challenge).
- TR kartları çoğunlukla challenge edilir; user flow'da iframe sorun çıkarmasın diye
  `redirect_on_completion: 'always'` set et.

### 12.2 Apple Guideline 3.1.1 (In-App Purchase)

**ZORUNLU:**
- iOS app içinde subscription satın alma sadece IAP. Stripe link YASAK.
- "Subscribe on web" linki YASAK (Reader app değiliz).
- Restore Purchases butonu görünür yerde.
- Privacy nutrition labels'da "Purchases" altında doğum verisi yok (analytics under Identifiers).
- ToS ve Privacy Policy linki paywall'da.
- Auto-renewable subscription disclosure text:
  ```
  Üyelik otomatik olarak yenilenir. İptal etmek için: Settings > Apple ID >
  Subscriptions. Yenileme döneminin bitiminden en az 24 saat önce iptal
  edilmezse aynı fiyattan otomatik yenilenir.
  ```

### 12.3 Refund Policy

- **Apple:** Apple kullanıcı refund'larını kendi yapar (reportaproblem.apple.com).
  RevenueCat REFUND event'i gelir → biz `subscriptions.status = 'refunded'` set ederiz,
  entitlement otomatik düşer. **Manuel refund verme.**
- **Stripe:** 14 gün AB cooling-off period (consumer right). Customer Portal'dan
  self-serve cancel + sınırlı self-serve refund. Pro-rated refund: `prorate=true`.
- ToS'a yaz: "Türkiye ve AB tüketicileri için 14 gün cayma hakkı. Yıllık abonelikler
  için kullanım oranı düşülerek iade."

### 12.4 KVKK / GDPR — Payment Data

- Stripe customer object → email, country, IP. **PCI scope kart bilgisi bize gelmez.**
- Supabase `stripe_customers` tablosu: sadece `user_id` ↔ `stripe_customer_id` mapping.
- RevenueCat subscriber attributes: app_user_id = Supabase UUID. PII yollama.
- Data export (`/data` page) → user'ın `subscriptions` + `stripe_customer_id` JSON'a dahil.
- Account deletion akışı:
  1. Supabase auth.users delete (cascade subscriptions).
  2. Stripe customer'ı **silme**, anonymize et (`email = deleted+UUID@soulprofile.life`,
     `name = null`). Fatura/muhasebe için 8 yıl saklama (TR Vergi Usul) — finansal record.
  3. RevenueCat: `DELETE /v1/subscribers/{app_user_id}` → soft delete (subscriber stays
     for receipt validation, attributes purged).
  4. Active subscription varsa user'a uyar: "Önce aboneliğini iptal et."

### 12.5 Tax & VAT

- Stripe Tax: **Enable**. AB/UK/TR VAT otomatik hesap.
- Apple: Apple satıcı sıfatıyla VAT'ı kendi toplar, biz `Tier 3` ($2.99) gibi
  customer-facing tier seçeriz; Apple gross'tan %30 (small business %15) keser.

### 12.6 Sözleşmelerde değiştirilecek metinler

`/terms` ve `/privacy` sayfalarına ekle:
- Ödeme sağlayıcıları: Stripe, Inc. (US/IE) ve Apple Inc.
- Veri işleyici listesi: RevenueCat, Inc. (US — Standard Contractual Clauses)
- Otomatik yenileme + iptal mekanizması
- Refund policy linki
- 16 yaş altı satın alma yasak (ek: ebeveyn onayı gerekirse Family Sharing zorunlu)

---

## 13. Supabase Şema Eklemeleri

Mevcut `0001_init.sql`'e ek migration: `supabase/migrations/0002_payments.sql`

```sql
-- Stripe customer mapping
create table if not exists stripe_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz default now()
);

-- Denormalized entitlement cache (hızlı read)
create table if not exists entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  premium boolean not null default false,
  relationship boolean not null default false,
  updated_at timestamptz default now()
);

-- subscriptions tablosuna unique constraint (webhook upsert için)
alter table subscriptions
  add constraint subscriptions_user_product_unique
  unique (user_id, product_id);

-- RLS
alter table stripe_customers enable row level security;
alter table entitlements enable row level security;

create policy "stripe_customers_read_own" on stripe_customers
  for select using (auth.uid() = user_id);

create policy "entitlements_read_own" on entitlements
  for select using (auth.uid() = user_id);

-- Service role bypasses RLS (webhook writes)
```

---

## 14. Environment Variables

`.env.local` (geliştirme) + Netlify env vars (prod):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_WEEKLY=price_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_SOLAR=price_...
STRIPE_PRICE_RELSYNC=price_...
STRIPE_PRICE_BUNDLE=price_...
STRIPE_WEBHOOK_SECRET=whsec_...   # opsiyonel: dispute alert için

# RevenueCat
NEXT_PUBLIC_REVENUECAT_IOS_KEY=appl_...
NEXT_PUBLIC_REVENUECAT_WEB_KEY=strp_...
REVENUECAT_SECRET_KEY=sk_...
REVENUECAT_WEBHOOK_SECRET=<rastgele 32 char>

# Site
NEXT_PUBLIC_SITE_URL=https://soulprofile.life
```

---

## 15. Deploy / Release Sırası

1. **Hafta 1**: Supabase migration `0002_payments.sql` deploy → tablolar hazır.
2. **Hafta 1**: Stripe products + prices oluştur, env var Netlify'a inject.
3. **Hafta 1**: RevenueCat project + offerings, Stripe integration aktif.
4. **Hafta 2**: `app/api/checkout`, `app/api/portal`, `app/api/webhook/revenuecat` deploy.
5. **Hafta 2**: PaywallModal + `usePremium` hook → web'de QA (test mode).
6. **Hafta 2-3**: Apple Developer + App Store Connect IAP products kurulumu.
7. **Hafta 3**: Capacitor wrap + RevenueCat iOS SDK entegrasyonu.
8. **Hafta 3**: TestFlight build → sandbox testing.
9. **Hafta 4**: App Store submission → review (gen. 1-3 gün).
10. **Hafta 4**: `LAUNCH_PROMO_END` tarihini son durum konfirme → ya uzat ya canlıya al.

---

## 16. Operations / Monitoring

- **RevenueCat Dashboard**: MRR, conversion, churn, refund rate — günlük bak.
- **Stripe Dashboard**: dispute rate %0.75'i geçerse Stripe early warning yollar.
- **Supabase Logs**: webhook 5xx alarm → Slack webhook (Resend transactional).
- **Sentry**: PaywallModal error rate, purchase fail rate. > %2 fail → alert.
- **Apple App Store Connect → Trends**: trial conversion, refund rate, cancellation reasons.

KPI hedefler (3. ay):
- Free → Trial start: %8
- Trial → Paid: %35
- Net MRR retention: %92
- Refund rate: <%2

---

## 17. Sık Karşılaşılan Tuzaklar

| Tuzak | Çözüm |
|---|---|
| `app_user_id` Supabase UUID değil random ID atanmış → cross-platform alias kopuyor | Login sonrası `Purchases.logIn(supabase.user.id)` çağır, anonymous ID alias et |
| Stripe webhook RevenueCat'i bypass eder, direkt Supabase yazar → state divergent | Sadece RevenueCat webhook'undan yaz; Stripe doğrudan dinleme |
| Apple `verifyReceipt` retired (iOS 18+) → StoreKit 2 zorunlu | `@revenuecat/purchases-capacitor` v8+ kullan |
| Trial sırasında user iptal eder → entitlement hemen düşer | Apple/Stripe `period_end`'e kadar aktif tutar; client `expires_date` kontrol etmeli |
| Family Sharing receipt'inde `original_app_user_id` farklı → kullanıcı eşleşmiyor | RevenueCat otomatik handle; bizim taraf sadece `app_user_id` event'inde upsert |
| Web'de Capacitor `isNativePlatform()` false → RC SDK init etmeye çalışıp crash | `Capacitor.isNativePlatform()` guard ile çağrıları sar |
| Webhook idempotency yok → duplicate event'te subscriptions row 2 kez yazılır | `upsert(..., onConflict: 'user_id,product_id')` zorunlu |
| `dangerouslyAllowBrowser: true` ile Anthropic key leak → premium content free olur | Premium narrative generation'ı Supabase Edge Function'a taşı, entitlement check ekle |

---

## 18. Hızlı Referans — Dosya Listesi

```
docs/
  PAYMENT_INTEGRATION.md          (bu dosya)
  PREMIUM_ROADMAP.md
lib/
  payments/
    types.ts                      # PLANS sabiti
    stripe.ts                     # web checkout client
    revenuecat.ts                 # iOS native bridge
    revenuecat-web.ts             # web REST fallback
    paywall-variant.ts            # A/B test
  feature-flags.ts                # genişletilmiş gating
hooks/
  usePremium.ts
  useSupabaseUser.ts
components/
  PaywallModal.tsx
  PromoBanner.tsx                 # mevcut, promo end countdown
app/
  api/
    checkout/route.ts
    portal/route.ts
    webhook/
      revenuecat/route.ts
  premium/
    page.tsx                      # standalone paywall page
    success/page.tsx              # post-checkout confirmation
supabase/
  migrations/
    0001_init.sql
    0002_payments.sql             # yeni
capacitor.config.ts               # iOS wrapper
ios/                              # Xcode workspace
```

Son söz: **Tek source of truth RevenueCat**, tek client gate `usePremium()`,
tek webhook endpoint. Bunu bozmadan korursak Stripe/Apple/Play her zaman ekleyebiliriz.
