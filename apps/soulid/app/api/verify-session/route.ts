// Stripe Checkout session doğrulama — premium grant öncesi server-side teyit.
// Client'ın gönderdiği session_id Stripe'a sorulur; payment_status === 'paid' ise OK.
// Bu olmadan /premium?success=1 URL yazılarak premium açılabiliyordu.

import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ ok: false, error: 'Stripe yapılandırılmadı' }, { status: 503 });
  }

  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');
  if (!sessionId || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    return NextResponse.json({ ok: false, error: 'Geçersiz session_id' }, { status: 400 });
  }

  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${stripeKey}` },
  });

  if (!res.ok) {
    return NextResponse.json({ ok: false, error: 'Stripe doğrulama hatası' }, { status: 502 });
  }

  const data = (await res.json()) as {
    payment_status?: string;
    status?: string;
    customer_email?: string;
  };

  const paid = data.payment_status === 'paid' && data.status === 'complete';

  return NextResponse.json({
    ok: paid,
    paymentStatus: data.payment_status,
    sessionStatus: data.status,
    customerEmail: data.customer_email,
  });
}
