// Hesap silme — Apple 5.1.1(v) + GDPR Art.17.
// 1. Auth Bearer JWT → user_id
// 2. JWT'yi Supabase'e verify ettir (anon key ile getUser)
// 3. service_role ile auth.users delete (RLS cascade tüm tabloları siler)

import { NextResponse } from 'next/server';
import { readCaller } from '../../ai/_shared';

export const runtime = 'edge';

export async function POST(request: Request) {
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supaService = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supaUrl || !supaAnon || !supaService) {
    return NextResponse.json({ error: 'Supabase yapılandırılmadı' }, { status: 503 });
  }

  const caller = readCaller(request);
  if (!caller.jwt || !caller.userId) {
    return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 });
  }

  // JWT'yi Supabase'e doğrula — sub bizim okuduğumuzla eşleşmeli
  const verifyRes = await fetch(`${supaUrl}/auth/v1/user`, {
    headers: {
      apikey: supaAnon,
      Authorization: `Bearer ${caller.jwt}`,
    },
  });

  if (!verifyRes.ok) {
    return NextResponse.json({ error: 'Token geçersiz' }, { status: 401 });
  }

  const verified = (await verifyRes.json()) as { id?: string };
  if (verified.id !== caller.userId) {
    return NextResponse.json({ error: 'Token uyuşmuyor' }, { status: 401 });
  }

  // Storage fotoğraflarını temizle (varsa)
  const profileRes = await fetch(
    `${supaUrl}/rest/v1/profiles?user_id=eq.${encodeURIComponent(caller.userId)}&select=photo_path`,
    {
      headers: {
        apikey: supaService,
        Authorization: `Bearer ${supaService}`,
      },
    },
  );
  if (profileRes.ok) {
    const rows = (await profileRes.json()) as Array<{ photo_path?: string }>;
    const photos = rows.map((r) => r.photo_path).filter((p): p is string => !!p);
    if (photos.length > 0) {
      await fetch(`${supaUrl}/storage/v1/object/photos`, {
        method: 'DELETE',
        headers: {
          apikey: supaService,
          Authorization: `Bearer ${supaService}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prefixes: photos }),
      }).catch(() => null);
    }
  }

  // auth.users delete — cascade: profiles, reports, entitlements,
  // subscriptions, stripe_customers (FK on delete cascade).
  const delRes = await fetch(`${supaUrl}/auth/v1/admin/users/${caller.userId}`, {
    method: 'DELETE',
    headers: {
      apikey: supaService,
      Authorization: `Bearer ${supaService}`,
    },
  });

  if (!delRes.ok) {
    const txt = await delRes.text();
    console.error('[account/delete] supabase delete failed', txt);
    return NextResponse.json({ error: 'Silme başarısız' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
