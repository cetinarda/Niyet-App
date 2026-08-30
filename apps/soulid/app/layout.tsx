import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Cormorant_Garamond, Jost } from 'next/font/google';
import { Chrome } from '@/components/Chrome';
import { BootSync } from '@/components/BootSync';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
});

// SAKİN İMZA FONTU. SoulID Sakin'in içinde bir sekme gibi açılıyor; eşleşme
// akışının "başka bir uygulamaya geçtim" hissi vermemesi için Sakin'in kendi
// tipografisini (Jost, uppercase, geniş harf aralığı) kullanıyoruz.
// SADECE yeni eşleşme ekranlarında (font-brand sınıfı); mevcut sayfalar
// Inter/Cormorant ile aynı kalıyor. next/font derleme anında kendi kendine
// barındırır: çalışma anında Google'a istek YOK, çevrimdışı da çalışır.
const jost = Jost({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-brand',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

// Next, `basePath`i metadata ikonlarına ve manifest yoluna OTOMATİK eklemez;
// embed alt klasörden servis edildiğinde /icon.svg kökten istenip 404 olur.
// Öneki burada elle veriyoruz (kendi başına çalışan build'de boş string).
const A = process.env.NEXT_PUBLIC_EMBED_BASE || '';

export const metadata: Metadata = {
  metadataBase: new URL('https://soulprofile.life'),
  title: {
    default: 'SoulProfile: Doğum Verisi · Kimlik Analizi',
    template: '%s · SoulProfile',
  },
  description:
    'Horoscope değil: doğum verinden kozmik kimliğini hesaplayan bir iç gözlem motoru. Astronomik harita, enerji profili, numeroloji ve Vedik nakshatra cihazında hesaplanır; gezegenlerinin ömür boyu hareketini interaktif izle, iki kişinin ilişkisini çok katmanlı yazılı bir ayna olarak gör.',
  keywords: [
    'doğum haritası', 'enerji profili', 'numeroloji',
    'astronomik harita', 'kozmik kimlik analizi', 'doğum verisi',
    'kişilik arketipi', 'iç gözlem aracı', 'starseed', 'kuzey ay düğümü',
    'nakshatra', 'tzolkin', 'doğum runu', 'tarot doğum kartı',
  ],
  applicationName: 'SoulProfile',
  manifest: `${A}/manifest.json`,
  appleWebApp: {
    capable: true,
    title: 'SoulProfile',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: `${A}/icon.svg`, type: 'image/svg+xml' },
      { url: `${A}/favicon.ico` },
    ],
    apple: `${A}/apple-touch-icon.png`,
    shortcut: `${A}/icon.svg`,
  },
  openGraph: {
    title: 'Doğduğunda yıldızlar sana ne söylüyordu?',
    description:
      'Horoscope değil, bir motor: doğum verinden hesaplanan kozmik kimliğin, gezegenlerinin ömür boyu hareketi ve iki kişinin ilişkisinin çok katmanlı yazılı aynası.',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'SoulProfile',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'SoulProfile: Galaktik Karnen',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Doğduğunda yıldızlar sana ne söylüyordu?',
    description: 'Horoscope değil: doğum verinden hesaplanan kozmik kimlik motoru.',
    images: ['/og-image.svg'],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)',  color: '#07091a' },
    { media: '(prefers-color-scheme: light)', color: '#faf6ee' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

// FOUC önleyici: HTML render olmadan önce data-theme + data-motion set edilir.
// Default: dark. Kullanıcı /settings'te açıkça 'light' seçerse override.
const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('soulprofile.theme');
    if (t !== 'light' && t !== 'dark') t = 'dark';
    document.documentElement.dataset.theme = t;
    document.documentElement.style.colorScheme = t;
  } catch(e) {
    document.documentElement.dataset.theme = 'dark';
  }
  try {
    var m = localStorage.getItem('soulprofile.motion');
    var r;
    if (m === 'reduced') r = 'reduced';
    else if (m === 'full') r = 'full';
    else r = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full';
    document.documentElement.dataset.motion = r;
  } catch(e) {
    document.documentElement.dataset.motion = 'full';
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" data-theme="dark" className={`${inter.variable} ${cormorant.variable} ${jost.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* İLK PAINT'TE ÜST BAR GİZLE (kullanıcı: "ana sayfaya tıklayana kadar
            üst bar hiç görünmesin"). Chrome bileşeni hydration'da TopBar'ı zaten
            kaldırıyor ama statik export prerender'ında TopBar HTML'e gömülü;
            JS yavaş yüklenirse bir an görünürdü. Bu script React'ten önce çalışıp
            eşleşme/menü yolunda html'e data-bare koyar, aşağıdaki stil gizler. */}
        {/* DİKKAT: bu template literal TS KAYNAK KODUNDA yazılıyor, yani
            dış derleyici `\/` ve `\.` kaçışlarını ÇÖZER (backslash düşer,
            regex bozulur: "/(^|/)..." gibi). Regex'in içine gerçek backslash
            koymak için burada ÇİFT kaçış (\\/ ve \\.) şart. */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var p=location.pathname||'';if(/(^|\\/)(pair|menu|birth)(\\/|\\.html|$)/.test(p))document.documentElement.setAttribute('data-bare','1');}catch(e){}})();` }} />
        <style dangerouslySetInnerHTML={{ __html: `html[data-bare] header,html[data-bare] [data-promo]{display:none!important}` }} />
      </head>
      <body className="bg-bg text-ink min-h-screen flex flex-col">
        <BootSync />
        <Chrome>{children}</Chrome>
      </body>
    </html>
  );
}
