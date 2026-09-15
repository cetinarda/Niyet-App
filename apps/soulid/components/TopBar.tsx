'use client';

import { Link } from '@/components/Link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useT } from '@/lib/i18n';
import { LanguageToggle } from './LanguageToggle';
import { BrandMark } from './BrandMark';

export function TopBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t, locale } = useT();
  const tr = locale === 'tr';

  // iframe içinde miyiz? Cross-origin durumunda erişim hata fırlatır; o hâlde
  // gömülü kabul edip şeridi göstermeyiz (güvenli varsayılan).
  const [standalone, setStandalone] = useState(false);
  useEffect(() => {
    try {
      setStandalone(window.self === window.top);
    } catch {
      setStandalone(false);
    }
  }, []);

  // Tek menü (üç çizgi), 5 net bölüm, birbirine karışmaz.
  const menu = [
    { href: '/profil', label: tr ? 'Profilin' : 'Your Profile' },
    { href: '/report', label: tr ? 'Detaylı Karnen' : 'Your Full Report' },
    { href: '/compatibility', label: tr ? 'İkili Uyum' : 'Compatibility' },
    { href: '/attachment', label: tr ? 'Bağlanma Stilin' : 'Your Attachment Style' },
    { href: '/history', label: tr ? 'Geçmişin' : 'Your History' },
    // Ana sayfa artık açılış ekranı değil (oraya eşleşme geldi), o yüzden
    // menüde kendi maddesi var: SoulID'nin ne olduğunu merak eden oradan bakar.
    { href: '/', label: tr ? 'Ana Sayfa' : 'Home' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-panelBorder/60 bg-bg/55 backdrop-blur-xl">
      {/* SAKİN BAĞI: yalnızca SoulID doğrudan açıldığında (sakin.life/baglanma
          gibi) görünür. Sakin uygulamasının içinde iframe olarak açıldığında
          host'un kendi "← Keşfet" butonu zaten var, ikinci bir geri yolu
          koymak kafa karıştırır. Ayrım runtime'da: iframe içinde miyiz?
          Bu şerit iki işi birden yapıyor: (1) SoulID'nin Sakin'den kopuk
          durmasını engelliyor, (2) geri dönüş yolu veriyor (kullanıcı:
          "sakin.life/baglanma girince keşfete dönüş yok"). */}
      {standalone && (
        <div className="border-b border-panelBorder/40 bg-gold/[0.05]">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-2">
            <span className="min-w-0 truncate text-[11px] tracking-wide text-muted">
              <span className="text-gold">✦</span> {t('topbar.family')}
            </span>
            <a
              href="https://sakin.life"
              className="shrink-0 whitespace-nowrap text-[11px] font-bold text-gold transition-opacity hover:opacity-80"
            >
              {t('topbar.backToSakin')} →
            </a>
          </div>
        </div>
      )}
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <BrandMark size={20} className="text-gold" />
          <span className="text-[13px] font-bold tracking-[0.3em] text-ink">SOULPROFILE</span>
        </Link>

        <div className="flex items-center gap-2">
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
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
