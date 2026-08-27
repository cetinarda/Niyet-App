// Stripe webhook — checkout.session.completed event'ini doğrular ve
// entitlements tablosuna kanonik kayıt yazar.
// STRIPE_WEBHOOK_SECRET ile signature verify zorunlu (Stripe Best Practice).
// Service role gerekir: SUPABASE_SERVICE_ROLE_KEY env'de.

import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Stripe-Signature header format: t=<timestamp>,v1=<sig1>,v0=<sig0>
async function verifySignature(
  payload: string,
  header: string,
  secret: string,
  toleranceSec = 300,
): Promise<boolean> {
  const parts = header.split(',').reduce((acc, p) => {
    const [k, v] = p.split('=');
    if (k && v) acc[k] = v;
    return acc;
  }, {} as Record<string, string>);

  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;

  const timestamp = parseInt(t, 10);
  if (!Number.isFinite(timestamp)) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > toleranceSec) return false;

  const signedPayload = `${t}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Constant-time compare
  if (expected.length !== v1.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ v1.charCodeAt(i);
  return diff === 0;
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret || !supaUrl || !supaServiceKey) {
    return NextResponse.json({ error: 'Webhook yapılandırılmadı' }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  const payload = await request.text();
  const valid = await verifySignature(payload, signature, secret);
  if (!valid) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });

  let event: { type?: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = event.data?.object as
    | {
        customer_email?: string;
        customer?: string;
        client_reference_id?: string;
        payment_status?: string;
        metadata?: { user_id?: string };
      }
    | undefined;

  if (!session || session.payment_status !== 'paid') {
    return NextResponse.json({ received: true, skipped: 'not paid' });
  }

  const userId = session.metadata?.user_id ?? session.client_reference_id;
  if (!userId) {
    // Auth'suz checkout — entitlement yazılamaz, fakat e-posta loglanır.
    return NextResponse.json({ received: true, skipped: 'no user_id' });
  }

  // Service role ile entitlements upsert
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
      product_id: 'life.soulprofile.app.unlock',
      entitlement: 'premium',
      source: 'stripe',
      active: true,
      raw: session,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error('[stripe-webhook] supabase insert failed', txt);
    return NextResponse.json({ error: 'DB write failed' }, { status: 502 });
  }

  return NextResponse.json({ received: true, granted: true });
}
