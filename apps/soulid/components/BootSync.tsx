'use client';

import { useEffect } from 'react';
import { initDeepLink } from '@/lib/native/deep-link';

/**
 * App boot: iOS deep link handler. Odeme/entitlement senkronu KALDIRILDI
 * (SoulID kendi odeme altyapisini kullanmiyor; premium = Sakin host premium,
 * lib/entitlements.ts localStorage'dan okur). Gorsel render'a engel olmasin
 * diye fire-and-forget.
 */
export function BootSync() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    initDeepLink().catch(() => {
      /* web ortami veya Capacitor yok */
    });
  }, []);
  return null;
}
