/**
 * Supabase-backed cross-platform entitlement.
 *
 * Priority order in premium.ts:
 *   1. RevenueCat / StoreKit (native IAP)
 *   2. This module: active Supabase row (Stripe web purchase)
 *   3. This module: redeemed license key
 *
 * Apple compliance note: we never link to an external purchase page
 * from within the app. The license-key field is neutral — it just
 * accepts a code the user may have obtained anywhere.
 */

import { supabase, isSupabaseConfigured } from './supabase';

export interface EntitlementResult {
  active: boolean;
  product?: string;
  expiresAt?: string;
  source?: string;
}

/** Check if the logged-in user has any active Supabase entitlement. */
export async function checkSupabaseEntitlement(): Promise<EntitlementResult> {
  if (!isSupabaseConfigured) return { active: false };
  try {
    const { data, error } = await supabase.rpc('check_sakin_entitlement');
    if (error) return { active: false };
    if (!data) return { active: false };

    // Fetch details for product / expiry display
    const { data: rows } = await supabase
      .from('sakin_entitlements')
      .select('product, expires_at, source')
      .or(`user_id.eq.${(await supabase.auth.getUser()).data.user?.id},redeemed_by.eq.${(await supabase.auth.getUser()).data.user?.id}`)
      .order('created_at', { ascending: false })
      .limit(1);

    const row = rows?.[0];
    return {
      active: true,
      product: row?.product,
      expiresAt: row?.expires_at ?? undefined,
      source: row?.source,
    };
  } catch {
    return { active: false };
  }
}

export type RedeemResult =
  | { success: true; alreadyActive?: boolean; product: string; expiresAt?: string }
  | { success: false; error: 'invalid-or-used-key' | 'not-authenticated' | 'network' };

/** Redeem a license key. Requires the user to be signed in. */
export async function redeemLicenseKey(key: string): Promise<RedeemResult> {
  if (!isSupabaseConfigured) return { success: false, error: 'network' };
  try {
    const { data, error } = await supabase.rpc('redeem_license_key', { p_key: key.trim().toLowerCase() });
    if (error) return { success: false, error: 'network' };
    if (!data.success) return { success: false, error: data.error ?? 'invalid-or-used-key' };
    return {
      success: true,
      alreadyActive: data.already_active ?? false,
      product: data.product ?? 'premium',
      expiresAt: data.expires_at ?? undefined,
    };
  } catch {
    return { success: false, error: 'network' };
  }
}
