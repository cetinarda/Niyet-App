'use client';

import { useRouter } from 'next/navigation';
import type { ComponentProps, MouseEvent, ReactNode } from 'react';
import NextLink from 'next/link';
import { IS_CAPACITOR, capacitorHref } from '@/lib/nav';

/**
 * NextLink drop-in — Capacitor iOS statik export uyumlu.
 *
 * Capacitor build'inde: düz <a>, href GERÇEK .html dosyasına
 * ("/compatibility/index.html"). Capacitor router uzantısız path'leri
 * ROOT index.html olarak servis ettiği için (SPA varsayımı), .html
 * uzantısı ŞART — yoksa her tık ana sayfayı açar.
 *
 * Web build'inde: düz <a> + onClick router.push → hızlı SPA, prefetch yok
 * (".txt RSC payload" hataları olmaz).
 */

type AnchorRest = Omit<
  ComponentProps<typeof NextLink>,
  'href' | 'prefetch' | 'as' | 'children' | 'onClick'
> & {
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  'aria-label'?: string;
  target?: string;
};

export function Link({
  href,
  children,
  onClick,
  ...rest
}: {
  href: string;
  children?: ReactNode;
} & AnchorRest) {
  const router = useRouter();
  const resolved = IS_CAPACITOR ? capacitorHref(href) : href;

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (rest.target === '_blank' || /^https?:|^mailto:|^tel:/.test(href)) return;
    // Capacitor: default <a> navigasyonu .html dosyasını yükler (router doğru çözer)
    if (IS_CAPACITOR) return;
    // Web: hızlı SPA
    e.preventDefault();
    router.push(href);
  }

  return (
    <a href={resolved} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
