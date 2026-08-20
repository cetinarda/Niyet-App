'use client';

/**
 * iOS StatusBar tema senkronizasyonu. Capacitor değilse no-op.
 * Theme değiştiğinde light/dark icon state'i güncellenir.
 */

import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export function syncStatusBar(theme: 'light' | 'dark') {
  if (typeof window === 'undefined') return;
  if (!Capacitor.isNativePlatform()) return;
  // Capacitor v6: Style.Light = light text (dark bg), Style.Dark = dark text (light bg)
  StatusBar.setStyle({ style: theme === 'dark' ? Style.Light : Style.Dark }).catch(() => {
    /* unsupported */
  });
}
