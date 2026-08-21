import { execSync } from 'child_process';

/** @type {import('next').NextConfig} */
const buildTarget = process.env.BUILD_TARGET ?? 'web';
const isCapacitor = buildTarget === 'capacitor';

// Build damgası — cihazda hangi kodun çalıştığını görsel doğrulamak için.
let buildId = 'dev';
try {
  buildId = execSync('git rev-parse --short HEAD').toString().trim();
} catch {
  /* git yoksa dev */
}

// ALT KLASÖRDEN SERVİS (Sakin embed'i). Kendi başına çalışan SoulID kökten
// (soulprofile.life/) servis edilir; Sakin içine gömülünce /embedded/soulid/
// altından. Bu ayarlanmazsa varlıklar /_next/... diye KÖKTEN istenir, Sakin'de
// 404 döner → sayfa CSS'siz, çıplak HTML olarak açılır (yaşandı).
// Expo embed'lerindeki `experiments.baseUrl`in Next.js karşılığı budur.
const embedBase = process.env.NEXT_PUBLIC_EMBED_BASE || '';

const nextConfig = {
  reactStrictMode: true,
  // Client koduna build hedefini + build damgasını sızdır.
  env: {
    NEXT_PUBLIC_BUILD_TARGET: buildTarget,
    NEXT_PUBLIC_BUILD_ID: buildId,
    NEXT_PUBLIC_EMBED_BASE: embedBase,
  },
  // Capacitor iOS için statik export — Apple guideline 4.0 wrapper rejection riskini
  // azaltmak için tüm sayfalar gemiyle birlikte gelir; runtime fetch yok.
  ...(isCapacitor && {
    output: 'export',
    trailingSlash: true,
    images: { unoptimized: true },
    skipTrailingSlashRedirect: true,
    ...(embedBase && { basePath: embedBase, assetPrefix: embedBase }),
  }),
  ...(!isCapacitor && {
    images: {
      remotePatterns: [
        { protocol: 'https', hostname: '**' },
      ],
    },
  }),
};

export default nextConfig;
