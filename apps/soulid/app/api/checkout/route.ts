// Web ödeme (ikincil) — Stripe Checkout. iOS ana kanal App Store IAP.
// iOS Capacitor build'inde bu rota mevcut değil (statik export); orada Apple paid app modeli geçerli.

import { NextResponse } from 'next/server';
import { PLANS } from '@/lib/payments/skus';
import { rateLimit, rateKey } from '../ai/_shared';

export const runtime = 'edge';

export async function POST(request: Request) {
  // Rate limit — IP-bazlı, 5 checkout/dakika. Anonim session açma DoS koruması.
  const limit = rateLimit(rateKey(request, 'checkout'), 5);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Çok hızlı deneme. Birkaç saniye bekle.', retryAfter: limit.retryAfter },
      { status: 429 },
    );
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe henüz yapılandırılmadı.' }, { status: 503 });
  }

  let body: { userEmail?: string; userId?: string; planKey?: string } | null = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }

  // Seçilen plan → doğru Stripe price + billing mode. Monthly = subscription,
  // lifetime = tek seferlik payment. (Önceden ikisi de lifetime'a düşüyordu →
  // aylık butonu $19.99 tek seferlik çekiyordu; money bug.)
  const planKey: 'lifetime' | 'monthly' = body?.planKey === 'monthly' ? 'monthly' : 'lifetime';
  const envKey = PLANS[planKey].stripePriceEnvKey;
  const priceId = process.env[envKey];
  if (!priceId) {
    return NextResponse.json(
      { error: `Stripe price ID eksik: ${envKey}` },
      { status: 503 },
    );
  }

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://soulprofile.life';
  const origin = (() => {
    const reqOrigin = request.headers.get('origin');
    if (!reqOrigin) return APP_URL;
    try {
      const u = new URL(reqOrigin);
      const allowed = [APP_URL, 'http://localhost:3000', 'http://localhost:8888'];
      const allowedHosts = allowed.map((a) => new URL(a).host);
      if (allowedHosts.includes(u.host) || u.host.endsWith('.netlify.app')) {
        return reqOrigin;
      }
    } catch {
      /* ignore */
    }
    return APP_URL;
  })();

  const params = new URLSearchParams();
  params.set('mode', planKey === 'monthly' ? 'subscription' : 'payment');
  params.set('success_url', `${origin}/premium?session_id={CHECKOUT_SESSION_ID}`);
  params.set('cancel_url', `${origin}/premium?canceled=1`);
  params.append('line_items[0][price]', priceId);
  params.append('line_items[0][quantity]', '1');
  if (body?.userEmail) params.set('customer_email', body.userEmail);
  // user_id metadata — webhook entitlement insert için zorunlu
  if (body?.userId && /^[a-zA-Z0-9-]{8,}$/.test(body.userId)) {
    params.set('client_reference_id', body.userId);
    params.set('metadata[user_id]', body.userId);
  }
  params.set('allow_promotion_codes', 'true');
  params.set('billing_address_collection', 'auto');

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('[checkout] stripe error', errText);
    return NextResponse.json({ error: 'Ödeme oturumu açılamadı' }, { status: 500 });
  }

  const data = (await res.json()) as { url?: string; id?: string };
  if (!data.url) return NextResponse.json({ error: 'Ödeme URL\'i alınamadı' }, { status: 500 });

  return NextResponse.json({ url: data.url, sessionId: data.id });
}
