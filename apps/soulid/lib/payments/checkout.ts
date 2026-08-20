import { getSupabase } from '../supabase';
import type { PlanKey } from './skus';

export async function startCheckout(planKey: PlanKey = 'lifetime', email?: string): Promise<void> {
  // Auth'lu kullanıcı varsa user_id metadata'sına ekle —
  // webhook bu ID'ye entitlement yazabilsin.
  let userId: string | undefined;
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb.auth.getUser();
    userId = data.user?.id;
  }

  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planKey, userEmail: email, userId }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? 'Ödeme oturumu açılamadı');
  }
  const data = (await res.json()) as { url?: string };
  if (data.url) {
    window.location.href = data.url;
  }
}
