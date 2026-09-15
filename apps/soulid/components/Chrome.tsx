'use client';

import { usePathname } from 'next/navigation';
import { TopBar } from '@/components/TopBar';
import { Footer } from '@/components/Footer';

/**
 * EŞLEŞME AKIŞINDA TEK PARÇA HİSSİ (kullanıcı: "kişi farklı bir appe gittiğini
 * düşünmesin", "bilgileri girerken tam ekran her zaman, ana sayfaya tıklayana
 * kadar üst bar hiç görünmesin").
 *
 * SoulProfile logolu TopBar, ve Footer AKIŞ ve
 * BİLGİ GİRİŞİ boyunca gizlenir: /pair altındaki HER SAYFA (eşleşme, partner
 * formu /pair/add, tam uyum detayı /pair/result), bölüm listesi (/menu) ve
 * kendi doğum formu (/birth). Bu ekranlar Sakin'in bir sekmesi gibi tam ekran
 * açılır ve kendi geri/kapat kontrollerini taşır. Üst bar İLK KEZ kullanıcı
 * "Ana Sayfa"yı (/) veya bir içerik sayfasını (karne, profil, Geçmişin listesi)
 * açtığında görünür; oralarda kendi navigasyonu gerekir.
 */
// DİKKAT: Capacitor/embed statik export'ta usePathname() ham dosya yolunu
// döndürür (örn. "/embedded/soulid/pair/index.html"), Next'in temiz route'unu
// değil. Bu yüzden basit startsWith('/pair') EŞLEŞMEZ. Segment olarak eşleştir:
// yol içinde "pair", "menu" ya da "birth" bir dizin adı olarak geçiyor mu.
// birth = kullanıcı kendi doğum bilgisini girerken de tam ekran (kullanıcı isteği).
const BARE_SEGMENTS = ['pair', 'menu', 'birth'];
const bareRe = new RegExp(`(^|/)(${BARE_SEGMENTS.join('|')})(/|\\.html|$)`);

export function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const bare = bareRe.test(pathname);

  if (bare) {
    return <main className="flex-1">{children}</main>;
  }
  return (
    <>
      <TopBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
