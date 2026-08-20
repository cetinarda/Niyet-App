'use client';

import { Link } from '@/components/Link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useT } from '@/lib/i18n';
import { hasPremium } from '@/lib/entitlements';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';
import { BrandMark } from './BrandMark';

export function TopBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [premium, setPremium] = useState(true); // SSR'da gizle, mount'ta karar ver
  const { locale } = useT();
  const tr = locale === 'tr';

  useEffect(() => {
    setPremium(hasPremium());
    // Boot senkronundan (RevenueCat/Supabase) sonra da güncelle
    const id = window.setInterval(() => setPremium(hasPremium()), 2000);
    return () => window.clearInterval(id);
  }, []);

  // Tek menü (üç çizgi) — 5 net bölüm, birbirine karışmaz.
  const menu = [
    { href: '/profil', label: tr ? 'Profilin' : 'Your Profile' },
    { href: '/report', label: tr ? 'Detaylı Karnen' : 'Your Full Report' },
    { href: '/compatibility', label: tr ? 'İkili Uyum' : 'Compatibility' },
    { href: '/history', label: tr ? 'Geçmişin' : 'Your History' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-panelBorder/60 bg-bg/55 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <BrandMark size={20} className="text-gold" />
          <span className="text-[13px] font-bold tracking-[0.3em] text-ink">SOULPROFILE</span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-panelBorder text-xl text-ink transition-colors hover:border-gold/50"
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? '×' : '☰'}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-panelBorder bg-bg/95 backdrop-blur-xl">
          <ul className="mx-auto flex max-w-5xl flex-col gap-1 px-5 py-3">
            {menu.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={clsx(
                    'block rounded-xl px-4 py-3 text-[15px] transition-colors',
                    pathname === l.href
                      ? 'bg-gold/10 font-bold text-gold'
                      : 'text-ink hover:bg-white/[0.04]',
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            {!premium ? (
              <li>
                <Link
                  href="/premium"
                  onClick={() => setOpen(false)}
                  className="mt-1 flex items-center gap-2 rounded-xl bg-gold px-4 py-3 text-[15px] font-bold text-[#1a0a40]"
                >
                  <span>✦</span> {tr ? 'Satın Al' : 'Buy'}
                </Link>
              </li>
            ) : null}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
