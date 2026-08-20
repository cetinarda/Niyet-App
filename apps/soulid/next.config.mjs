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

const nextConfig = {
  reactStrictMode: true,
  // Client koduna build hedefini + build damgasını sızdır.
  env: {
    NEXT_PUBLIC_BUILD_TARGET: buildTarget,
    NEXT_PUBLIC_BUILD_ID: buildId,
  },
  // Capacitor iOS için statik export — Apple guideline 4.0 wrapper rejection riskini
  // azaltmak için tüm sayfalar gemiyle birlikte gelir; runtime fetch yok.
  ...(isCapacitor && {
    output: 'export',
    trailingSlash: true,
    images: { unoptimized: true },
    skipTrailingSlashRedirect: true,
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
