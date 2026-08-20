'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/components/Link';
import { useT } from '@/lib/i18n';
import { DevToggle } from './DevToggle';

export function Footer() {
  const { t } = useT();
  // Statik export'ta new Date() build zamanında donar → yılı client'ta hesapla.
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => setYear(new Date().getFullYear()), []);
  const links = [
    { href: '/premium', label: t('nav.premium') },
    { href: '/glossary', label: t('nav.glossary') },
    { href: '/about', label: t('nav.about') },
    { href: '/support', label: t('nav.support') },
    { href: '/privacy', label: t('nav.privacy') },
    { href: '/terms', label: t('nav.terms') },
    { href: '/settings', label: t('nav.settings') },
  ];

  return (
    <footer className="border-t border-panelBorder px-5 py-12 mt-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-gold">
            <span>✦</span>
            <span className="text-xs font-bold tracking-[0.3em]">SOULPROFILE</span>
          </Link>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-xs text-muted hover:text-ink">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-5 text-[11px] leading-relaxed text-faint">
          {t('footer.disclaimer')} © {year ?? ''} SoulProfile.
        </p>
        <DevToggle />
      </div>
    </footer>
  );
}
