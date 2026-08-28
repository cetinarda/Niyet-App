'use client';

import { CosmicBackground } from '@/components/CosmicBackground';
import { useNav } from '@/lib/nav';
import { useT } from '@/lib/i18n';

/**
 * BÖLÜM LİSTESİ. İki yerden gelinir:
 *   · eşleşme ekranında "Atla",
 *   · uyum sonucunu kapatınca.
 * Kullanıcı kararı: buraya SoulID'nin ANA SAYFASI değil, doğrudan bölümleri
 * gelir; ana sayfa listenin bir maddesi olarak durur.
 *
 * Aynı beş bölüm ☰ menüsünde de var; burası onların tam ekran, tek dokunuşluk
 * hali. Sakin'in dili korunuyor (Jost, uppercase, ince ayraç, altın ✦).
 */
export default function MenuPage() {
  const { t, locale } = useT();
  const nav = useNav();
  const tr = locale === 'tr';

  const items: { href: string; label: string; note: string }[] = [
    { href: '/pair', label: tr ? 'İkili Uyum' : 'Compatibility',
      note: tr ? 'Birinin doğum bilgisiyle karşılaştır' : 'Compare with someone else' },
    { href: '/profil', label: tr ? 'Profilin' : 'Your Profile',
      note: tr ? 'Doğum bilgilerin ve özetin' : 'Your birth details and summary' },
    { href: '/report', label: tr ? 'Detaylı Karnen' : 'Your Full Report',
      note: tr ? 'Dokuz sistemin tam sentezi' : 'The full synthesis of nine systems' },
    { href: '/attachment', label: tr ? 'Bağlanma Stilin' : 'Your Attachment Style',
      note: tr ? 'On altı soru, dört stil' : 'Sixteen questions, four styles' },
    { href: '/history', label: tr ? 'Geçmişin' : 'Your History',
      note: tr ? 'Önceki karneler ve uyumlar' : 'Past reports and matches' },
    { href: '/', label: tr ? 'Ana Sayfa' : 'Home',
      note: tr ? 'SoulID nedir, hangi sistemleri okur' : 'What SoulID is and which systems it reads' },
  ];

  return (
    <div className="relative min-h-[86vh]">
      <CosmicBackground variant="aurora" />
      <div className="mx-auto max-w-xl px-6 pb-14 pt-14 font-brand">
        <p className="text-[10px] uppercase tracking-[0.45em] text-gold">{t('menu.kicker')}</p>
        <h1 className="mt-4 text-[26px] font-medium leading-tight text-ink">{t('menu.title')}</h1>

        <div className="mt-10">
          {items.map((it, i) => (
            <button
              key={it.href}
              type="button"
              onClick={() => nav.push(it.href)}
              className="block w-full text-left"
              style={{
                WebkitAppearance: 'none', appearance: 'none', background: 'none',
                border: 0, borderTop: i === 0 ? '1px solid var(--panel-border)' : 0,
                borderBottom: '1px solid var(--panel-border)', padding: '20px 2px',
              }}
            >
              <span className="flex items-baseline gap-3">
                <span className="text-[17px] text-ink">{it.label}</span>
                <span className="ml-auto text-[15px] text-faint">›</span>
              </span>
              <span className="mt-1 block text-[12px] leading-relaxed text-faint">{it.note}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
