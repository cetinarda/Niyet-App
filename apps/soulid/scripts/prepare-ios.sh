#!/bin/bash
# SoulProfile iOS Build Prep — Mac'te çalıştır
# Kullanım: chmod +x scripts/prepare-ios.sh && ./scripts/prepare-ios.sh
set -e

echo "✦ SoulProfile iOS build hazırlık scripti"
echo ""

# 1. Node sürümü kontrolü
NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "⚠️  Node 20+ gerekiyor. Mevcut: $(node -v)"
  echo "    nvm use 20 veya brew install node@20"
  exit 1
fi
echo "✓ Node $(node -v) uygun"

# 2. Paketler
echo ""
echo "→ Bağımlılıklar kuruluyor (eğer kurulu değilse)..."
if [ ! -d "node_modules" ]; then
  npm install --legacy-peer-deps --no-audit --no-fund
fi
echo "✓ Bağımlılıklar tamam"

# 3. Statik web build (Capacitor için)
echo ""
echo "→ Next.js statik export (out/ dizinine)..."
BUILD_TARGET=capacitor npm run build
echo "✓ out/ üretildi"

# 4. iOS projesi yoksa ekle
if [ ! -d "ios" ]; then
  echo ""
  echo "→ iOS projesi ilk kez ekleniyor (npx cap add ios)..."
  npx cap add ios
  echo "✓ ios/ dizini hazır"
fi

# 5. iOS asset'leri üret (icon + splash)
if [ ! -d "resources" ]; then
  mkdir -p resources
fi
if [ ! -f "resources/icon.png" ] || [ ! -f "resources/splash.png" ]; then
  echo ""
  echo "⚠️  resources/icon.png ve resources/splash.png eksik."
  echo "    icon.png: 1024×1024 (saydam veya renkli arka plan)"
  echo "    splash.png: 2732×2732 (logo ortada, fazla kenar boşluğuyla)"
  echo "    Bunları yerleştir, sonra: npx capacitor-assets generate --ios"
else
  echo ""
  echo "→ App icon ve splash üretiliyor..."
  npx capacitor-assets generate --ios --iconBackgroundColor '#05060f' --splashBackgroundColor '#05060f'
  echo "✓ iOS asset'leri üretildi"
fi

# 6. Capacitor sync
echo ""
echo "→ Capacitor sync (out/ → ios/App/App/public/)..."
npx cap sync ios
echo "✓ Sync tamam"

# 7. Xcode'da aç
echo ""
echo "✦ HAZIR. Şimdi yapılacaklar:"
echo ""
echo "  1. Xcode'da: npx cap open ios"
echo "  2. Xcode → Signing & Capabilities → Team seç + Bundle ID: life.soulprofile.app"
echo "  3. Üst bardan iPhone simulator seç → ▶ Run (test)"
echo ""
echo "  TestFlight için:"
echo "    a. Xcode → Product → Archive"
echo "    b. Organizer açılır → Distribute App → App Store Connect → Upload"
echo "    c. veya: brew install fastlane && fastlane init"
echo ""
echo "  App Store submission öncesi mutlaka oku:"
echo "    docs/APP_STORE_LESSONS.md — 4.3 spam reddedilmesi nasıl atlanır"
echo "    docs/APP_STORE_SUBMISSION.md — tam submission paketi"
echo ""
