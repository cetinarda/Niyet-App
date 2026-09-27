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
  // WEB GİRİŞİ (1.4.3, kullanıcı: "webde üst tasarım, geri tuşu farklı yerde ve ana
  // sayfaya dönüyor; link gelen arkadaşın uygulaması yoksa ne oluyor?"):
  //  - backUrl: SoulID'ye Sakin web uygulamasından (sakin.life/app, Keşfet) gelindiyse
  //    oraya döner; paylaşılan linkten gelindiyse tanıtım sayfasına (sakin.life).
  //    İlk girişte sessionStorage'a yazılır: SoulID içi gezinme referrer'ı bozmasın.
  //  - plat: telefondan paylaşılan linkle gelene mağaza şeridi (kendi platformu).
  //    Mağazaya OTOMATİK atlanmaz: Apple/Google kurulum sırasında linki taşımaz,
  //    davet kaybolurdu. Uyum web'de hemen hesaplanır, mağaza düğmesi hep üstte.
  const [backUrl, setBackUrl] = useState('https://sakin.life');
  const [fromLink, setFromLink] = useState(false);
  const [plat, setPlat] = useState<'ios' | 'android' | 'other'>('other');
  useEffect(() => {
    let sa = false;
    try { sa = window.self === window.top; } catch { sa = false; }
    setStandalone(sa);
    if (!sa) return;
    const ua = navigator.userAgent || '';
    setPlat(/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? 'ios' : /Android/i.test(ua) ? 'android' : 'other');
    try {
      let back = sessionStorage.getItem('soulid_back');
      if (!back) {
        const ref = document.referrer || '';
        const sameOrigin = ref.startsWith(window.location.origin + '/');
        const refPath = sameOrigin ? ref.slice(window.location.origin.length) : '';
        back = sameOrigin && !refPath.startsWith('/embedded/soulid') && !refPath.startsWith('/home') && refPath !== '/'
          ? ref : 'link';
        sessionStorage.setItem('soulid_back', back);
      }
      if (back === 'link') setFromLink(true); else setBackUrl(back);
    } catch { setFromLink(true); }
  }, []);
  const storeUrl = plat === 'ios'
    ? 'https://apps.apple.com/tr/app/sakin-breathing-awareness/id6765619382'
    : 'https://play.google.com/store/apps/details?id=com.sakin.app';
  // Uygulamada aç: Sakin 1.4.3+ `sakin://soulid/<yol>?<sorgu>` derin bağlantısını
  // SoulID gömülüsünde aynı sayfaya çevirir (src/App.jsx DEEP_LINK).
  const appPath = (pathname || '/').replace(/^\/embedded\/soulid/, '').replace(/^\/+|\/+$/g, '');
  const openAppUrl = typeof window !== 'undefined'
    ? `sakin://soulid/${appPath}${window.location.search || ''}` : 'sakin://soulid';

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
      {/* Mobilde paylaşılan linkle gelene: mağaza şeridi (ince, kapatılmaz; tek satır). */}
      {standalone && fromLink && plat !== 'other' && (
        <div className="border-b border-panelBorder/40 bg-gold/[0.06]">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">✦</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12.5px] font-bold text-ink">{t('topbar.getApp')}</div>
              <a href={openAppUrl} className="block truncate text-[11px] text-muted underline-offset-2 hover:underline">{t('topbar.openApp')}</a>
            </div>
            <a
              href={storeUrl}
              style={{ WebkitAppearance: 'none', appearance: 'none' }}
              className="shrink-0 rounded-full bg-gold px-4 py-2 text-[12px] font-bold text-[#1a0a40]"
            >
              {t('topbar.store')}
            </a>
          </div>
        </div>
      )}
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
        {/* Sakin web uygulamasıyla aynı yerleşim: geri SOLDA ("← Sakin"), marka yanında. */}
        <div className="flex min-w-0 items-center gap-3">
          {standalone && (
            <a
              href={backUrl}
              aria-label={t('topbar.backToSakin')}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-panelBorder px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] text-muted transition-colors hover:border-gold/50 hover:text-gold"
            >
              ← {t('topbar.back').toLocaleUpperCase(tr ? 'tr' : 'en')}
            </a>
          )}
          <Link href="/" className="flex min-w-0 items-center gap-2" onClick={() => setOpen(false)}>
            <BrandMark size={18} className="shrink-0 text-gold" />
            <span className={clsx('truncate text-[13px] font-bold tracking-[0.3em] text-ink', standalone && 'hidden min-[360px]:inline')}>SOULID</span>
          </Link>
        </div>

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
