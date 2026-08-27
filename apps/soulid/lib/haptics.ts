'use client';

/**
 * Hafif dokunsal geri bildirim. iOS Capacitor → Impact (light/medium/heavy),
 * web → navigator.vibrate fallback. SSR-safe.
 */

import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

type Intensity = 'light' | 'medium' | 'heavy';

const VIBE_MS: Record<Intensity, number> = {
  light: 8,
  medium: 14,
  heavy: 22,
};

const STYLE: Record<Intensity, ImpactStyle> = {
  light: ImpactStyle.Light,
  medium: ImpactStyle.Medium,
  heavy: ImpactStyle.Heavy,
};

export function tap(intensity: Intensity = 'light') {
  if (typeof window === 'undefined') return;
  if (Capacitor.isNativePlatform()) {
    Haptics.impact({ style: STYLE[intensity] }).catch(() => webVibrate(intensity));
    return;
  }
  webVibrate(intensity);
}

function webVibrate(intensity: Intensity) {
  if (typeof navigator === 'undefined') return;
  const nav = navigator as Navigator & { vibrate?: (p: number | number[]) => boolean };
  if (typeof nav.vibrate === 'function') {
    try {
      nav.vibrate(VIBE_MS[intensity]);
    } catch {
      /* ignore */
    }
  }
}
