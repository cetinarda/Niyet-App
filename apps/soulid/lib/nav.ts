'use client';

import { useRouter } from 'next/navigation';

/**
 * Capacitor iOS statik export navigasyon çözümü.
 *
 * KÖK NEDEN: Capacitor'ın CapacitorRouter.route(for:) — uzantısız HER path'i
 * (örn. "/compatibility/") ROOT "/index.html" olarak servis eder (SPA varsayımı).
 * Next.js static export ise her route için ayrı "compatibility/index.html"
 * üretir. Bu yüzden uzantısız link → hep ana sayfa açılıyordu.
 *
 * ÇÖZÜM: Capacitor build'inde navigasyon GERÇEK .html dosyasına gider
 * ("/compatibility/index.html"). Uzantılı path → router `basePath + path`
 * döner → doğru dosya servis edilir.
 *
 * Build-time flag (NEXT_PUBLIC_BUILD_TARGET) — runtime detection değil, böylece
 * statik HTML'deki href baştan doğru, hydration mismatch yok.
 */

export const IS_CAPACITOR = process.env.NEXT_PUBLIC_BUILD_TARGET === 'capacitor';

/** İç path'i Capacitor'ın doğru servis edeceği .html URL'ine çevirir. */
export function capacitorHref(path: string): string {
  if (!path.startsWith('/')) return path; // dış link / scheme
  const hashIdx = path.indexOf('#');
  const hash = hashIdx >= 0 ? path.slice(hashIdx) : '';
  const noHash = hashIdx >= 0 ? path.slice(0, hashIdx) : path;
  const qIdx = noHash.indexOf('?');
  const query = qIdx >= 0 ? noHash.slice(qIdx) : '';
  let p = qIdx >= 0 ? noHash.slice(0, qIdx) : noHash;

  if (p === '/' || p === '') return `/index.html${query}${hash}`;
  p = p.replace(/\/+$/, ''); // trailing slash temizle
  if (/\.[a-z0-9]+$/i.test(p)) return `${p}${query}${hash}`; // zaten dosya
  return `${p}/index.html${query}${hash}`;
}

/** Web'de ise relative path; Capacitor'da .html (gerektiğinde). */
export function resolveHref(path: string): string {
  return IS_CAPACITOR ? capacitorHref(path) : path;
}

export function useNav() {
  const router = useRouter();
  return {
    push(path: string) {
      if (IS_CAPACITOR) window.location.assign(capacitorHref(path));
      else router.push(path);
    },
    replace(path: string) {
      if (IS_CAPACITOR) window.location.replace(capacitorHref(path));
      else router.replace(path);
    },
  };
}
