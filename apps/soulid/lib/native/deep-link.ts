'use client';

/**
 * iOS deep link / custom scheme handler.
 * soulprofile://match?i=<token> formatındaki URL'leri kabul eder.
 * Bilinmeyen path/host → reddedilir (open-redirect koruması).
 */

import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

const ALLOWED_HOSTS = new Set(['match', 'report', 'compatibility', 'premium', 'settings']);
const ALLOWED_PARAM_KEYS = new Set(['i', 'ref', 'session_id', 'canceled', 'tab']);

let initialized = false;

function safeRoute(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.host || parsed.hostname;
    if (!ALLOWED_HOSTS.has(host)) return null;

    const params: string[] = [];
    parsed.searchParams.forEach((value, key) => {
      if (!ALLOWED_PARAM_KEYS.has(key)) return;
      if (value.length > 4096) return;
      params.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    });

    const query = params.length ? `?${params.join('&')}` : '';
    return `/${host}${query}`;
  } catch {
    return null;
  }
}

export async function initDeepLink(): Promise<void> {
  if (initialized) return;
  if (typeof window === 'undefined') return;
  if (!Capacitor.isNativePlatform()) return;
  initialized = true;
  try {
    await App.addListener('appUrlOpen', (event) => {
      const route = safeRoute(event.url);
      if (!route) {
        console.warn('[deep-link] rejected', event.url);
        return;
      }
      window.history.pushState({}, '', route);
      window.dispatchEvent(new Event('popstate'));
    });
  } catch {
    /* web fallback */
  }
}
