// RevenueCat webhook — INITIAL_PURCHASE / RENEWAL / CANCELLATION event'lerini
// alır ve entitlements tablosuna kanonik kayıt yazar.
// Authorization header'ı sabit secret ile karşılaştırılır (RevenueCat dashboard'da
// "Authorization Header" alanına aynı secret yazılmalı).

import { NextResponse } from 'next/server';

export const runtime = 'edge';

type RCEvent = {
  type?: string;
  app_user_id?: string;
  product_id?: string;
  entitlement_ids?: string[];
  expiration_at_ms?: number;
  store?: 'APP_STORE' | 'PLAY_STORE' | 'PROMOTIONAL' | 'STRIPE';
};

const GRANT_TYPES = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'NON_RENEWING_PURCHASE',
  'PRODUCT_CHANGE',
  'UNCANCELLATION',
  'TRANSFER',
]);

const REVOKE_TYPES = new Set(['EXPIRATION', 'CANCELLATION', 'BILLING_ISSUE']);

function mapSource(store?: string): 'apple' | 'google' | 'stripe' | 'promo' {
  switch (store) {
    case 'APP_STORE':
      return 'apple';
    case 'PLAY_STORE':
      return 'google';
    case 'STRIPE':
      return 'stripe';
    default:
      return 'promo';
  }
}

export async function POST(request: Request) {
  const sharedSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!sharedSecret || !supaUrl || !supaServiceKey) {
    return NextResponse.json({ error: 'Webhook yapılandırılmadı' }, { status: 503 });
  }

  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${sharedSecret}` && auth !== sharedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: { event?: RCEvent };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const event = payload.event;
  if (!event || !event.type || !event.app_user_id) {
    return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
  }

  const userId = event.app_user_id;
  if (!/^[a-zA-Z0-9-]{8,}$/.test(userId)) {
    return NextResponse.json({ error: 'Invalid app_user_id' }, { status: 400 });
  }

  const isGrant = GRANT_TYPES.has(event.type);
  const isRevoke = REVOKE_TYPES.has(event.type);
  if (!isGrant && !isRevoke) {
    return NextResponse.json({ received: true, skipped: event.type });
  }

  const source = mapSource(event.store);
  const expiresAt = event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null;

  const res = await fetch(`${supaUrl}/rest/v1/entitlements`, {
    method: 'POST',
    headers: {
      apikey: supaServiceKey,
      Authorization: `Bearer ${supaServiceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      user_id: userId,
      product_id: event.product_id ?? 'life.soulprofile.app.unlock',
      entitlement: 'premium',
      source,
      active: isGrant,
      expires_at: expiresAt,
      raw: event,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error('[revenuecat-webhook] supabase upsert failed', txt);
    return NextResponse.json({ error: 'DB write failed' }, { status: 502 });
  }

  return NextResponse.json({ received: true, action: isGrant ? 'granted' : 'revoked' });
}
