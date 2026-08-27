'use client';

import { useEffect } from 'react';
import { isCacheStale, refreshEntitlement } from '@/lib/entitlements';
import { initDeepLink } from '@/lib/native/deep-link';
import { initIAP } from '@/lib/payments/iap';
import { isCapacitorNative } from '@/lib/platform';

/**
 * App boot — entitlement Supabase'ten senkron + iOS deep link handler.
 * Görsel render'a engel olmamak için fire-and-forget.
 */
export function BootSync() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isCapacitorNative()) {
      // iOS: RevenueCat configure + entitlement senkronu (satın alım/restore
      // sonrası premium'u localStorage'a yansıtır).
      initIAP().catch(() => {
        /* RevenueCat yoksa / key yoksa sessiz */
      });
    } else if (isCacheStale()) {
      // Web: Supabase entitlements tablosundan senkron.
      refreshEntitlement().catch(() => {
        /* offline veya supabase yok → mevcut cache devam */
      });
    }
    initDeepLink().catch(() => {
      /* web ortamı veya Capacitor yok */
    });
  }, []);
  return null;
}
