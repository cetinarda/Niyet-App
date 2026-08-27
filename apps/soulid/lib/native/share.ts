'use client';

// iOS Capacitor + web Share API + clipboard fallback zinciri.
// 1) Capacitor native @capacitor/share
// 2) navigator.share (modern web)
// 3) navigator.clipboard.writeText (fallback)

import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';

export async function shareInvite(opts: {
  title: string;
  text: string;
  url: string;
}): Promise<'native' | 'web' | 'clipboard' | 'cancelled' | 'failed'> {
  // 1) Capacitor native share sheet
  if (Capacitor.isNativePlatform()) {
    try {
      await Share.share({
        title: opts.title,
        text: opts.text,
        url: opts.url,
        dialogTitle: opts.title,
      });
      return 'native';
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (/cancel/i.test(msg)) return 'cancelled';
    }
  }

  // 2) Modern web Share API
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: opts.title, text: opts.text, url: opts.url });
      return 'web';
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (/cancel|abort/i.test(msg)) return 'cancelled';
    }
  }

  // 3) Clipboard fallback
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(opts.url);
      return 'clipboard';
    } catch {
      /* fall through */
    }
  }
  return 'failed';
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* try exec command */
    }
  }
  // Legacy fallback — execCommand
  if (typeof document !== 'undefined') {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
  return false;
}
