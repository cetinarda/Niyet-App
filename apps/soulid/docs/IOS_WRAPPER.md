# SoulProfile — iOS Native App Stratejisi

> **Hedef:** SoulProfile Next.js 14 web app'i App Store'a yayınlamak.
> **Bundle ID:** `life.soulprofile.app`
> **Strateji:** Capacitor wrapper + Next.js static export, mevcut `lib/` paylaşımı korunur, native özellikler plugin'ler üzerinden.

---

## 1. Karar: Capacitor vs Tauri vs PWA vs React Native Rewrite

### Tavsiye: **Capacitor 6**

| Yaklaşım | Avantaj | Dezavantaj | Verdict |
|---|---|---|---|
| **Capacitor 6** | Next.js static export'u doğrudan WebView'da koşturur. `lib/` 1:1 paylaşılır. Plugin ekosistemi olgun (Camera, Push, IAP, Browser). Apple Connect upload normal `.ipa`. RevenueCat resmi SDK. | WebView performansı native değil — three.js + WebGL iOS Safari'de %85-90 native FPS. App boyutu ~30MB. | **SEÇ** |
| **Tauri 2 (Mobile)** | Rust backend, daha hafif (~10MB). | iOS desteği hala olgunlaşıyor (1.0 → 2.0 Mobile beta). Plugin ekosistemi yetersiz. APNS + StoreKit için custom Swift gerek. Topluluk küçük. | **HAYIR** — production-ready değil 2026 Q2'de. |
| **PWA only** | Sıfır wrapper kodu. | App Store'a koyamazsın. Push notifications iOS Safari'de 16.4+ ama Add-to-Home-Screen şart. IAP yok → ödeme sadece Stripe (Apple %30 yerine %2.9 ama App Store reach kayıp). | **HAYIR** — premium tier App Store IAP gerektirir. |
| **React Native rewrite** | Native UI, en iyi performance. | `react-three-fiber` (Three.js) → `react-three-fiber/native` (expo-gl) port = riskli. `html-to-image` → `react-native-view-shot` (rewrite). Anthropic SDK fetch shim. Tüm component'ler yeniden. Tahmini effort: 6-8 hafta. | **HAYIR** — ROI yok, MVP'yi geciktirir. |

### Neden Capacitor?
1. **Zero refactor:** Mevcut `app/`, `components/`, `lib/` aynen koşar.
2. **Three.js + WebGL** iOS WKWebView'da `Metal` backend ile çalışır — `react-three-fiber` web kodu değişmez.
3. **html-to-image** WKWebView'da Canvas API ile çalışır (CORS dikkat — Supabase storage CORS header'ları).
4. **Supabase auth** OAuth redirect için `@capacitor/browser` ile in-app Safari View Controller.
5. **App Store IAP** için **RevenueCat Capacitor SDK** plug-and-play.
6. **Apple Review** WebView wrapper'ları **artık reddetmiyor** (Guideline 4.2 — eski "minimum functionality" iyileştirildi; native plugin entegrasyonu + push + IAP varsa geçer).

---

## 2. Capacitor Kurulumu (Next.js Static Export → iOS Xcode Project)

### 2.1. Static export'a geçiş

`next.config.mjs` güncelle:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',           // Static HTML export
  distDir: 'out',             // Capacitor `webDir`
  images: {
    unoptimized: true,        // next/image SSR yok → unoptimized
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  trailingSlash: true,        // iOS file:// URL routing için şart
};

export default nextConfig;
```

**Uyarı:** `app/api/*` route handler'lar static export'ta çalışmaz. Şu an repo'da API route YOK (Anthropic SDK doğrudan browser'dan). Production'da Supabase Edge Function'a taşı (zaten CLAUDE.md'de plan var).

### 2.2. Capacitor install

```bash
cd /home/user/SoulProfile

# Core
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios

# Plugins (hepsi tek seferde)
npm install @capacitor/app @capacitor/browser @capacitor/camera \
  @capacitor/filesystem @capacitor/share @capacitor/status-bar \
  @capacitor/splash-screen @capacitor/network @capacitor/preferences \
  @capacitor/push-notifications @capacitor/keyboard @capacitor/haptics \
  @capacitor/device @capacitor/clipboard

# Dev tools
npm install -D @capacitor/assets

# Init
npx cap init "SoulProfile" "life.soulprofile.app" --web-dir=out
```

### 2.3. `capacitor.config.ts` (root'a)

```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'life.soulprofile.app',
  appName: 'SoulProfile',
  webDir: 'out',
  ios: {
    contentInset: 'always',
    scrollEnabled: true,
    backgroundColor: '#0a0118',          // galaxy gradient base
    limitsNavigationsToAppBoundDomains: false,
    preferredContentMode: 'mobile',
  },
  server: {
    iosScheme: 'capacitor',              // capacitor://localhost
    // Dev'de live reload için:
    // url: 'http://192.168.1.X:3000',
    // cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0a0118',
      androidSplashResourceName: 'splash',
      iosSpinnerStyle: 'small',
      spinnerColor: '#a78bfa',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0118',
      overlaysWebView: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Keyboard: {
      resize: 'native',
      style: 'DARK',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
```

### 2.4. iOS platform ekle

```bash
# Build önce!
npm run build

# iOS platform
npx cap add ios

# Web → native sync
npx cap sync ios

# Xcode aç
npx cap open ios
```

### 2.5. `package.json` script ekle

```json
{
  "scripts": {
    "ios:build": "next build && npx cap sync ios",
    "ios:open": "npx cap open ios",
    "ios:run": "npm run ios:build && npx cap run ios",
    "ios:assets": "npx capacitor-assets generate --ios"
  }
}
```

---

## 3. Native Plugin Gereksinimleri

### 3.1. `@capacitor/camera` (fotoğraf seçimi / DOB sertifikası vs.)

```ts
// lib/native/camera.ts
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export async function pickPhoto() {
  const photo = await Camera.getPhoto({
    quality: 85,
    allowEditing: false,
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Prompt,        // user → camera vs library
  });
  return photo.dataUrl;                  // base64 → <img src>
}
```

`Info.plist` (Xcode → Info → Custom iOS Target Properties):

```xml
<key>NSCameraUsageDescription</key>
<string>Profil fotoğrafınızı çekmek için kameraya erişim gerekiyor.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Karne görselinizi galeriden seçmek için izin gerekiyor.</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>Karne PNG'sini galerinize kaydetmek için izin gerekiyor.</string>
```

### 3.2. `@capacitor/filesystem` (karne PNG kaydet)

```ts
import { Filesystem, Directory } from '@capacitor/filesystem';

export async function savePng(base64: string, filename = 'soulprofile-karne.png') {
  const result = await Filesystem.writeFile({
    path: filename,
    data: base64,
    directory: Directory.Documents,
    recursive: true,
  });
  return result.uri;                     // file:// URI
}
```

### 3.3. `@capacitor/share` (Web Share API yerine native)

```ts
import { Share } from '@capacitor/share';

export async function shareKarne(fileUri: string) {
  await Share.share({
    title: 'SoulProfile Karnem',
    text: 'Kozmik karnemi gör 🌌',
    url: fileUri,
    dialogTitle: 'Paylaş',
  });
}
```

> **html-to-image akışı:** `toPng()` → `dataUrl` → `Filesystem.writeFile` → `Share.share({ url })`.
> Web Share API'yi `Capacitor.isNativePlatform()` ile fork et.

### 3.4. `@capacitor/browser` (Supabase OAuth + dış linkler)

```ts
import { Browser } from '@capacitor/browser';

await Browser.open({
  url: oauthUrl,
  presentationStyle: 'popover',
  toolbarColor: '#0a0118',
});
```

Supabase OAuth callback için `capacitor://localhost` veya custom scheme `life.soulprofile.app://auth/callback` (URL Schemes → Info.plist'e ekle).

### 3.5. `@capacitor/app` (deep link + lifecycle)

```ts
import { App } from '@capacitor/app';

App.addListener('appUrlOpen', (event) => {
  // event.url: life.soulprofile.app://share/abc123
  const slug = new URL(event.url).pathname;
  router.push(slug);
});

App.addListener('appStateChange', ({ isActive }) => {
  if (isActive) refreshNarrative();
});
```

### 3.6. `@capacitor/network` (offline banner)

```ts
import { Network } from '@capacitor/network';

const status = await Network.getStatus();
Network.addListener('networkStatusChange', (s) => {
  setOnline(s.connected);
});
```

### 3.7. `@capacitor/status-bar` (galaxy gradient ile uyum)

```ts
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

if (Capacitor.isNativePlatform()) {
  await StatusBar.setStyle({ style: Style.Dark });
  await StatusBar.setBackgroundColor({ color: '#0a0118' });
  await StatusBar.setOverlaysWebView({ overlay: false });
}
```

---

## 4. Push Notifications (APNS)

### 4.1. Apple Developer Portal — APNS Key

1. https://developer.apple.com/account/resources/authkeys/list → **+**
2. Name: `SoulProfile APNS`
3. Tick **Apple Push Notifications service (APNs)**
4. **Download** `.p8` (BİR KEZ indirebilirsin — kaybedersen yenisini yaratman gerek).
5. Not: Key ID + Team ID (sağ üst köşede).

### 4.2. Xcode'da capability ekle

Xcode → Target `App` → Signing & Capabilities → **+ Capability**:
- **Push Notifications**
- **Background Modes** → Remote notifications

### 4.3. Capacitor PushNotifications kodu

```ts
// lib/native/push.ts
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export async function initPush() {
  if (!Capacitor.isNativePlatform()) return;

  let perm = await PushNotifications.checkPermissions();
  if (perm.receive === 'prompt') {
    perm = await PushNotifications.requestPermissions();
  }
  if (perm.receive !== 'granted') return;

  await PushNotifications.register();

  PushNotifications.addListener('registration', async (token) => {
    // token.value = APNS device token
    await supabase.from('device_tokens').upsert({
      user_id: userId,
      token: token.value,
      platform: 'ios',
    });
  });

  PushNotifications.addListener('pushNotificationReceived', (n) => {
    // foreground notification
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (a) => {
    // user tapped → deep link
    const url = a.notification.data?.url;
    if (url) router.push(url);
  });
}
```

### 4.4. Backend (Supabase Edge Function) — APNS push gönderimi

```bash
# supabase/functions/send-push/index.ts
# apns2 lib veya OneSignal/RevenueCat/Firebase'a delege et
```

**Tavsiye:** APNS'i kendin yönetme — **OneSignal** (ücretsiz tier 10K MAU'ya kadar) veya **RevenueCat Targeting** kullan. .p8 yükle, bitti.

---

## 5. Apple IAP — RevenueCat Capacitor SDK

> StoreKit 2'yi doğrudan kullanma. RevenueCat = receipt validation + grace period + analytics + cross-platform sync, hepsi ücretsiz <$2.5K MTR.

### 5.1. Install

```bash
npm install @revenuecat/purchases-capacitor
npx cap sync ios
```

### 5.2. App Store Connect kurulumu

1. App Store Connect → My Apps → **+ App** (`life.soulprofile.app`)
2. **In-App Purchases** → **+** → Auto-Renewable Subscription
3. Product IDs:
   - `life.soulprofile.premium.monthly` — $4.99/ay
   - `life.soulprofile.premium.yearly` — $39.99/yıl
4. Subscription Group: `SoulProfile Premium`
5. RevenueCat dashboard → Project → **iOS App** → Bundle ID + App-Specific Shared Secret (App Store Connect → Users → Keys → In-App Purchase).

### 5.3. Kod

```ts
// lib/native/iap.ts
import { Purchases, PURCHASES_ERROR_CODE } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

export async function initIAP(userId: string) {
  if (!Capacitor.isNativePlatform()) return;

  await Purchases.configure({
    apiKey: process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY!,
    appUserID: userId,
  });
}

export async function getOfferings() {
  const { current } = await Purchases.getOfferings();
  return current?.availablePackages ?? [];
}

export async function purchase(packageId: string) {
  try {
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    return customerInfo.entitlements.active['premium'] !== undefined;
  } catch (e: any) {
    if (e.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return false;
    throw e;
  }
}

export async function restore() {
  const { customerInfo } = await Purchases.restorePurchases();
  return customerInfo.entitlements.active['premium'] !== undefined;
}
```

> **Apple Review zorunlu:** Subscription page'de **"Restore Purchases"** butonu olmalı, yoksa reject.

---

## 6. Offline Support (Service Worker + Workbox)

### 6.1. next-pwa kur (Next.js 14 App Router için fork)

```bash
npm install -D @ducanh2912/next-pwa
```

`next.config.mjs`:

```js
import withPWA from '@ducanh2912/next-pwa';

const pwaConfig = withPWA({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/,
        handler: 'NetworkFirst',
        options: { cacheName: 'supabase', networkTimeoutSeconds: 5 },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|webp|gif)$/,
        handler: 'CacheFirst',
        options: { cacheName: 'images', expiration: { maxEntries: 100 } },
      },
      {
        urlPattern: /\/_next\/static\/.*/,
        handler: 'CacheFirst',
        options: { cacheName: 'next-static' },
      },
    ],
  },
});

export default pwaConfig({
  output: 'export',
  // ...
});
```

### 6.2. Capacitor + Service Worker

Capacitor `WKWebView` SW'yi destekler ama `capacitor://localhost` scheme'inde scope sorunları olabilir. **Alternatif:** Önemli verileri (doğum profili, hesaplanmış chart, AI narrative) `@capacitor/preferences` ile diske yaz:

```ts
import { Preferences } from '@capacitor/preferences';
await Preferences.set({ key: 'profile', value: JSON.stringify(profile) });
```

> Zustand `persist` middleware'i Capacitor adapter ile kullan:
> ```ts
> import { createJSONStorage } from 'zustand/middleware';
> const storage = Capacitor.isNativePlatform()
>   ? capacitorPreferencesStorage
>   : createJSONStorage(() => localStorage);
> ```

---

## 7. App Icon + Splash Screen Pipeline

### 7.1. Kaynak dosyalar

`resources/` klasörü oluştur (root'ta):

```
resources/
  icon.png          # 1024×1024 (PNG, alpha YOK — App Store reddeder)
  icon-foreground.png  # 1024×1024 (Android adaptive için, alpha OK)
  icon-background.png  # 1024×1024 düz arka plan
  splash.png        # 2732×2732 (kare, merkezde logo, %30 margin)
  splash-dark.png   # 2732×2732 koyu varyant
```

### 7.2. Tek komutla tüm boyutlar

```bash
npx capacitor-assets generate --ios
```

Bu komut otomatik:
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/` → 20pt, 29pt, 40pt, 60pt, 76pt, 83.5pt, 1024pt (her biri @1x/@2x/@3x)
- `ios/App/App/Assets.xcassets/Splash.imageset/` → Universal splash
- `LaunchScreen.storyboard` referansı

### 7.3. SVG kaynak → PNG (kaynak SVG varsa)

```bash
# rsvg-convert veya inkscape
npm install -D sharp-cli
npx sharp -i logo.svg -o resources/icon.png resize 1024 1024
npx sharp -i splash.svg -o resources/splash.png resize 2732 2732
```

---

## 8. Dark Mode + Status Bar Styling

### 8.1. Tailwind dark mode

`tailwind.config.ts`:

```ts
export default {
  darkMode: 'class',          // veya 'media' (iOS sistem ayarı)
  // ...
};
```

### 8.2. iOS sistem theme'i takip et

```ts
// app/providers.tsx
import { useEffect } from 'react';

useEffect(() => {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const apply = () => {
    document.documentElement.classList.toggle('dark', mq.matches);
    StatusBar.setStyle({ style: mq.matches ? Style.Dark : Style.Light });
  };
  apply();
  mq.addEventListener('change', apply);
  return () => mq.removeEventListener('change', apply);
}, []);
```

### 8.3. Notch / Dynamic Island için safe area

`app/globals.css`:

```css
:root {
  --safe-top: env(safe-area-inset-top);
  --safe-bottom: env(safe-area-inset-bottom);
  --safe-left: env(safe-area-inset-left);
  --safe-right: env(safe-area-inset-right);
}

body {
  padding-top: var(--safe-top);
  padding-bottom: var(--safe-bottom);
}
```

`Info.plist`:

```xml
<key>UIViewControllerBasedStatusBarAppearance</key>
<false/>
<key>UIStatusBarStyle</key>
<string>UIStatusBarStyleLightContent</string>
```

---

## 9. Deep Links / Universal Links

### 9.1. Custom URL Scheme (kolay yol)

Xcode → Target App → Info → URL Types → **+**:
- Identifier: `life.soulprofile.app`
- URL Schemes: `soulprofile`
- Role: Editor

Test:

```bash
xcrun simctl openurl booted "soulprofile://share/abc123"
```

### 9.2. Universal Links (önerilen — App Store puanı)

1. **Associated Domains** capability ekle (Xcode → Signing & Capabilities)
2. Domain: `applinks:soulprofile.life`
3. Apex domain'de host et: `https://soulprofile.life/.well-known/apple-app-site-association`

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.life.soulprofile.app",
        "paths": ["/share/*", "/report/*", "/r/*"]
      }
    ]
  }
}
```

> **Netlify config:** `netlify.toml` → `[[headers]]` ile `Content-Type: application/json` ver, `.well-known/` path public olsun.

```toml
[[headers]]
  for = "/.well-known/apple-app-site-association"
  [headers.values]
    Content-Type = "application/json"
```

### 9.3. Yönlendirme

`appUrlOpen` listener (Bölüm 3.5) Next.js `router.push()` ile routelar.

---

## 10. Web ↔ iOS Parite Tablosu

| Feature | Web (Browser) | iOS (Capacitor) | Ekstra İzin |
|---|---|---|---|
| Doğum chart hesabı (astronomy-engine) | Çalışır | Çalışır | — |
| Three.js / WebGL 3D | Çalışır | Çalışır (Metal backend) | — |
| html-to-image PNG | Canvas API | Canvas API | — |
| Web Share API | Modern browser | `@capacitor/share` | — |
| Save to Gallery | İndir | `Filesystem` + Share | `NSPhotoLibraryAddUsageDescription` |
| Camera | `<input type="file" capture>` | `@capacitor/camera` | `NSCameraUsageDescription` |
| File picker | `<input type="file">` | Native picker | `NSPhotoLibraryUsageDescription` |
| localStorage (Zustand persist) | Çalışır | `@capacitor/preferences` | — |
| Geolocation (geocoding) | Browser API + prompt | `@capacitor/geolocation` | `NSLocationWhenInUseUsageDescription` |
| Push Notifications | Web Push (16.4+ PWA only) | APNS + plugin | Permission prompt |
| OAuth (Supabase) | Redirect | `@capacitor/browser` (SFSafariViewController) | URL Scheme |
| IAP / Subscription | Stripe | RevenueCat + StoreKit | App Store Connect setup |
| Anthropic SDK direct | `dangerouslyAllowBrowser` çalışır ama API key expose | **YASAK** — Supabase Edge Function arkasına taşı | — |
| Haptic feedback | YOK | `@capacitor/haptics` | — |
| Status bar | YOK | `@capacitor/status-bar` | — |
| Background fetch | YOK | Background Modes capability | Xcode |

---

## 11. Build & Sign Komutları

### 11.1. Development (simülatörde koş)

```bash
# 1. Web build
npm run build

# 2. Native sync
npx cap sync ios

# 3. Xcode aç
npx cap open ios

# Veya CLI:
npx cap run ios --target="iPhone 15 Pro"
```

### 11.2. Development build (gerçek cihaz)

1. Xcode → Window → Devices and Simulators → iPhone bağlı
2. Target App → Signing & Capabilities:
   - Team: `<your-team>`
   - Bundle Identifier: `life.soulprofile.app`
   - Signing Certificate: Apple Development
3. Top bar → Device seç → ▶ Run

### 11.3. Production build (App Store)

```bash
# 1. Production env vars
echo "NEXT_PUBLIC_REVENUECAT_IOS_KEY=appl_xxx" >> .env.production

# 2. Web build (production mode)
NODE_ENV=production npm run build
npx cap sync ios --prod

# 3. Version bump
# Xcode → Target App → General → Identity:
#   Version: 1.0.0 (CFBundleShortVersionString)
#   Build:   1     (CFBundleVersion) — her yüklemede +1

# 4. Archive
# Xcode → Product → Destination → "Any iOS Device (arm64)"
# Xcode → Product → Archive
# Bekle ~5-10 dk

# 5. Organizer açılır → Distribute App → App Store Connect → Upload
```

### 11.4. CLI (fastlane ile otomatik)

Bölüm 12'de detay.

---

## 12. Apple Connect Upload — Karşılaştırma

| Yöntem | Hız | Otomasyon | Öğrenme | Ne zaman? |
|---|---|---|---|---|
| **Xcode Organizer** | Yavaş (manuel) | Sıfır | Düşük | İlk binary, debug |
| **Transporter.app** | Orta | Sıfır | Çok düşük | Xcode'suz upload, CI çıktısı |
| **fastlane** | Hızlı | Tam | Orta | CI/CD, sık release |

### Tavsiye: **fastlane** (CI/CD'ye hazır), ilk binary için **Xcode**.

### 12.1. fastlane setup

```bash
sudo gem install fastlane

cd ios/App
fastlane init
# 2) Automate beta distribution to TestFlight seç
```

`ios/App/fastlane/Fastfile`:

```ruby
default_platform(:ios)

platform :ios do
  desc "Push beta to TestFlight"
  lane :beta do
    increment_build_number(xcodeproj: "App.xcodeproj")
    build_app(
      workspace: "App.xcworkspace",
      scheme: "App",
      export_method: "app-store"
    )
    upload_to_testflight(
      skip_waiting_for_build_processing: true,
      apple_id: ENV["APPLE_ID"],
      app_identifier: "life.soulprofile.app"
    )
  end

  desc "Production release"
  lane :release do
    capture_screenshots                  # opsiyonel
    build_app(scheme: "App")
    upload_to_app_store(
      submit_for_review: false,          # ilk önce manuel review et
      automatic_release: false,
      force: true
    )
  end
end
```

### 12.2. App Store Connect API Key (CI için)

1. App Store Connect → Users and Access → **Keys** (Integrations tab) → **+**
2. Name: `SoulProfile CI`, Access: **App Manager**
3. `.p8` indir → Key ID + Issuer ID not al
4. `fastlane/Appfile`:
   ```ruby
   app_identifier("life.soulprofile.app")
   apple_id("cetinarda@gmail.com")
   itc_team_id("XXXXXX")
   team_id("XXXXXXXXXX")
   ```

### 12.3. Release komutu

```bash
cd ios/App
fastlane beta              # TestFlight
fastlane release           # App Store (manual submit)
```

---

## 13. iOS-Specific Bugs ve Çözümleri

### 13.1. Safe area — content notch altında

**Bug:** TopBar Dynamic Island altında kaldı.

**Fix:**

```css
/* app/globals.css */
.topbar {
  padding-top: max(env(safe-area-inset-top), 0.5rem);
}
.footer-fixed {
  padding-bottom: max(env(safe-area-inset-bottom), 0.5rem);
}
```

`capacitor.config.ts` → `ios.contentInset: 'always'` veya `'never'` ile dene.

### 13.2. Keyboard input field'ı örtüyor

**Bug:** Doğum formu input'a tıklayınca keyboard formu kapatıyor.

**Fix:**

```bash
npm install @capacitor/keyboard
npx cap sync ios
```

```ts
import { Keyboard } from '@capacitor/keyboard';

Keyboard.addListener('keyboardWillShow', (info) => {
  document.body.style.paddingBottom = `${info.keyboardHeight}px`;
});
Keyboard.addListener('keyboardWillHide', () => {
  document.body.style.paddingBottom = '0';
});
```

`capacitor.config.ts` → `plugins.Keyboard.resize: 'native'`.

### 13.3. Status bar transparan, içerik altta

**Bug:** Status bar saati WebView içeriğinin üstünde.

**Fix:**

```ts
await StatusBar.setOverlaysWebView({ overlay: false });
await StatusBar.setBackgroundColor({ color: '#0a0118' });
```

`Info.plist`:
```xml
<key>UIViewControllerBasedStatusBarAppearance</key>
<false/>
```

### 13.4. WebGL / Three.js performance düşüklüğü

**Bug:** Three.js sahnesi simülatörde 15 FPS.

**Fix:**
- Simülatörde GPU yavaş → gerçek cihazda test et.
- `gl: { antialias: false, powerPreference: 'high-performance' }` Canvas prop.
- `dpr={[1, 1.5]}` (devicePixelRatio cap) — iOS Retina display'de 3x render yer.

### 13.5. CORS — Supabase storage görüntüleri html-to-image'de boş

**Bug:** `toPng()` Supabase'den çektiği avatar görüntülerini render edemiyor.

**Fix:** Supabase Storage → Bucket → CORS:

```json
[{"origin": "*", "headers": ["*"], "methods": ["GET"]}]
```

Veya `crossOrigin="anonymous"` `<img>` prop + Supabase signed URL.

### 13.6. App Tracking Transparency (ATT) prompt

**Bug:** RevenueCat / analytics IDFA istiyor → App Store reject.

**Fix:** ATT istemeden çalış (RevenueCat anonymous ID kullanır). Eğer ileride Meta/TikTok pixel eklersen:

```bash
npm install @capacitor-community/app-tracking-transparency
```

`Info.plist`:
```xml
<key>NSUserTrackingUsageDescription</key>
<string>Kişiselleştirilmiş öneriler için kullanım datasına izin verir misiniz?</string>
```

### 13.7. Cold start beyaz ekran

**Bug:** Splash kapanıyor ama web bundle yüklenirken ekran beyaz.

**Fix:** `capacitor.config.ts` → `SplashScreen.launchAutoHide: false`, sonra Next.js `app/layout.tsx`'te:

```ts
useEffect(() => {
  import('@capacitor/splash-screen').then(({ SplashScreen }) => {
    SplashScreen.hide();
  });
}, []);
```

### 13.8. localStorage iOS Private mode'da çöküyor

**Bug:** WKWebView bazı durumlarda localStorage clear ediyor (low memory).

**Fix:** Zustand persist'i `@capacitor/preferences` adapter'ı ile değiştir (Bölüm 6.2).

### 13.9. Universal Link açılmıyor — Safari'de açılıyor

**Bug:** `https://soulprofile.life/share/abc` Safari'de açılıyor, app'te değil.

**Checklist:**
1. `apple-app-site-association` `Content-Type: application/json` (Bölüm 9.2)
2. Apex domain HTTPS olmalı, redirect YOK
3. App'i en az 1x açtın mı? (iOS AASA cache'liyor)
4. Settings → Developer → Universal Links → Diagnostics → domain test
5. Long-press link → "Open in SoulProfile" görünmeli

### 13.10. Apple Review reject — "minimum functionality"

**Bug:** Reviewer "this is just a website wrapper" diyor.

**Fix listesi (Apple Guideline 4.2):**
- Push notifications aktif olsun (kullanıcı izin verdiğinde)
- Haptic feedback button'larda
- Camera/Photo library entegrasyonu (en az 1 native plugin user-facing)
- IAP (Stripe değil!)
- Offline mode (en az ana ekran)
- Native splash + icon
- Safe area + status bar düzgün
- Pull-to-refresh native hissi

---

## Ek: İlk Hafta Checklist

- [ ] `next.config.mjs` static export ekle
- [ ] `npm install @capacitor/*` (Bölüm 2.2)
- [ ] `npx cap init` + `cap add ios`
- [ ] Apple Developer hesabı + Team ID
- [ ] Bundle ID `life.soulprofile.app` register (Certificates portal)
- [ ] App Store Connect app create
- [ ] APNS .p8 key indir
- [ ] RevenueCat hesap + iOS app config
- [ ] Icon 1024×1024 + Splash 2732×2732 hazırla
- [ ] `npx capacitor-assets generate --ios`
- [ ] İlk archive → TestFlight internal testing
- [ ] Universal Links AASA dosyasını `public/.well-known/`'e koy
- [ ] Privacy Manifest (`PrivacyInfo.xcprivacy`) — Xcode 15+ zorunlu

---

## Referanslar

- Capacitor docs: https://capacitorjs.com/docs/ios
- RevenueCat Capacitor: https://www.revenuecat.com/docs/capacitor
- Apple Universal Links: https://developer.apple.com/ios/universal-links/
- Apple Review Guidelines 4.2: https://developer.apple.com/app-store/review/guidelines/#minimum-functionality
- next-pwa: https://github.com/DuCanhGH/next-pwa
