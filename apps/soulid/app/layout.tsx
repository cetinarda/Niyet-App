import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import { TopBar } from '@/components/TopBar';
import { Footer } from '@/components/Footer';
import { PromoBanner } from '@/components/PromoBanner';
import { BootSync } from '@/components/BootSync';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://soulprofile.life'),
  title: {
    default: 'SoulProfile — Doğum Verisi · Kimlik Analizi',
    template: '%s · SoulProfile',
  },
  description:
    'Horoscope değil — doğum verinden kozmik kimliğini hesaplayan bir iç gözlem motoru. Astronomik harita, Human Design beden grafiği, numeroloji ve Vedik nakshatra cihazında hesaplanır; gezegenlerinin ömür boyu hareketini interaktif izle, iki kişinin ilişkisini çok katmanlı yazılı bir ayna olarak gör.',
  keywords: [
    'doğum haritası', 'human design', 'numeroloji',
    'astronomik harita', 'kozmik kimlik analizi', 'doğum verisi',
    'kişilik arketipi', 'iç gözlem aracı', 'starseed', 'kuzey ay düğümü',
    'nakshatra', 'tzolkin', 'doğum runu', 'tarot doğum kartı',
  ],
  applicationName: 'SoulProfile',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'SoulProfile',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/icon.svg',
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
        alt: 'SoulProfile — Galaktik Karnen',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Doğduğunda yıldızlar sana ne söylüyordu?',
    description: 'Horoscope değil — doğum verinden hesaplanan kozmik kimlik motoru.',
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

// FOUC önleyici — HTML render olmadan önce data-theme + data-motion set edilir.
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
    <html lang="tr" data-theme="dark" className={`${inter.variable} ${cormorant.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-bg text-ink min-h-screen flex flex-col">
        <BootSync />
        <PromoBanner />
        <TopBar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
