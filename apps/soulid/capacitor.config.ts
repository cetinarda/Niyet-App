import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'life.soulprofile.app',
  appName: 'SoulProfile',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // iOS local content scheme — Capacitor default 'capacitor://localhost'.
    // Custom scheme (soulprofile) secure-context DEĞİL → crypto.subtle +
    // clipboard kapanır + directory-index routing (/birth/ → index.html)
    // kırılır → butonlar/Link çalışmaz. Default scheme en uyumlu.
    // Deep link 'soulprofile://' ayrıca Info.plist CFBundleURLSchemes ile
    // kaydedilir; local içerik scheme'inden bağımsız.
    iosScheme: 'capacitor',
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#07091a',
    // App-Bound Domains'i kapatıyoruz — Info.plist'te WKAppBoundDomains
    // tam yapılandırıldıktan sonra true'ya çekilir. Yanlış kombinasyon
    // WebView navigation'ı tamamen bloke ediyor (Link/onClick çalışmaz).
    limitsNavigationsToAppBoundDomains: false,
    scheme: 'SoulProfile',
    preferredContentMode: 'mobile',
    scrollEnabled: true,
    handleApplicationNotifications: true,
    overrideUserAgent: undefined,
  },
  plugins: {
    // CapacitorHttp = native HTTP, WKWebView CORS preflight'ı bypass eder.
    // Open-Meteo geocoding gibi capacitor:// origin'i reddeden public API'ler
    // için kritik. fetch yerine CapacitorHttp.get() çağırırız (kod tarafında
    // isCapacitorNative() ile gating var). enabled:true sadece izin verir.
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      launchShowDuration: 700,
      launchAutoHide: true,
      backgroundColor: '#07091a',
      showSpinner: false,
      iosSpinnerStyle: 'small',
      spinnerColor: '#f5d061',
      splashImmersive: false,
      splashFullScreen: false,
    },
    StatusBar: {
      // Default tema koyu → light ikonlar. Tema değişiminde lib/native/status-bar.ts
      // runtime'da setStyle ile günceller.
      style: 'light',
      backgroundColor: '#07091a',
      overlaysWebView: true,
    },
    Keyboard: {
      resize: 'native',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    Preferences: {
      group: 'life.soulprofile.app',
    },
  },
};

export default config;
