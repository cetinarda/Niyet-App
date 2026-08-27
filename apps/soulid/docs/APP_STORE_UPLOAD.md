# App Store Connect Upload — Adım Adım

> Bu doküman SoulProfile'ı App Store Connect'e yükleyene kadar takip etmen
> gereken **tüm terminal komutlarını ve UI adımlarını sırayla** içerir.
> Mac + Xcode 15+ + Apple Developer Program üyeliği ($99/yıl) gereklidir.

İlgili referans dokümanlar (önce oku):
- `docs/APP_STORE_LESSONS.md` — 4.3 spam reddinden kaçınmak için zorunlu
- `docs/APP_STORE_SUBMISSION.md` — metadata + screenshot + age rating
- `docs/PAYMENT_INTEGRATION.md` — Stripe + RevenueCat tam mimarisi
- `docs/IOS_WRAPPER.md` — Capacitor iOS gotcha'ları

---

## FAZ 0 — Apple Developer + RevenueCat hesapları (1 günlük süreç)

### 0.1 Apple Developer Program

1. https://developer.apple.com/programs/enroll/ → Enroll
2. Türkiye'de bireysel ($99) veya şirket ($99 + DUNS) seç
3. Onay 24-48 saat sürer

### 0.2 RevenueCat hesabı

1. https://app.revenuecat.com → Sign up (free tier sınırsız MTR < $10K)
2. **Project oluştur:** "SoulProfile"
3. **App ekle:** iOS → Bundle ID `life.soulprofile.app`
4. Dashboard → API Keys → **public API key** kopyala
5. `.env.local` ve Netlify env'e ekle:
   ```
   NEXT_PUBLIC_REVENUECAT_IOS_KEY=appl_XXXX
   ```

---

## FAZ 1 — Lokal hazırlık (Mac, 30 dk)

```bash
# 1.1 Repo'yu klonla ve branş'a geç
git clone <repo-url> SoulProfile
cd SoulProfile
git checkout claude/cosmic-birth-chart-app-DW89I

# 1.2 Node 20 + bağımlılıklar
nvm use 20 || (brew install node@20 && nvm install 20)
npm install --legacy-peer-deps

# 1.3 Env dosyası
cp .env.example .env.local
# .env.local'ı düzenle: Stripe + Anthropic + RevenueCat anahtarlarını yapıştır

# 1.4 Statik export üret (Capacitor için zorunlu)
BUILD_TARGET=capacitor npm run build
# → out/ dizini oluşur (14 sayfa + assets)
```

---

## FAZ 2 — Capacitor iOS projesi (10 dk)

```bash
# 2.1 İlk seferse iOS projesi ekle
npx cap add ios
# → ios/ dizini oluşur, App.xcworkspace içerir

# 2.2 Resources hazırla
mkdir -p resources
# - resources/icon.png  (1024×1024, saydam veya gradient bg)
# - resources/splash.png (2732×2732, logo merkezi)
# (kaynak SVG var: public/icon.svg)

# Hızlı SVG → PNG (rsvg-convert yüklüyse):
brew install librsvg
rsvg-convert -w 1024 -h 1024 public/icon.svg -o resources/icon.png
rsvg-convert -w 2732 -h 2732 public/icon.svg -o resources/splash.png

# 2.3 Tüm iOS asset boyutlarını üret
npx capacitor-assets generate --ios \
  --iconBackgroundColor '#05060f' \
  --splashBackgroundColor '#05060f'
# → ios/App/App/Assets.xcassets içine yazar

# 2.4 RevenueCat plugin'ini iOS'a kur (Mac'te)
npm install @revenuecat/purchases-capacitor
npx cap sync ios

# 2.5 Privacy Manifest dosyasını projeye kopyala
cp resources/PrivacyInfo.xcprivacy ios/App/App/PrivacyInfo.xcprivacy
```

---

## FAZ 3 — Xcode konfigürasyonu (15 dk)

```bash
# 3.1 Xcode'da aç
npx cap open ios
```

Xcode UI'da yapılacaklar:

### 3.1 Signing & Capabilities
- Sol panelde **App** target'ını seç
- **Signing & Capabilities** sekmesi:
  - **Team:** Apple Developer hesabını seç
  - **Bundle Identifier:** `life.soulprofile.app` (zaten ayarlı)
  - **Automatically manage signing:** ✓
- **+ Capability** ile ekle:
  - **In-App Purchase**
  - **Sign in with Apple** (önerilen)
  - **Associated Domains** (deep link için, opsiyonel)

### 3.2 Info.plist kontrolü
Aşağıdaki anahtarların varlığını doğrula (`ios/App/App/Info.plist`):
- `NSCameraUsageDescription` — "Profil fotoğrafı çekmek için"
- `NSPhotoLibraryUsageDescription` — "Profil fotoğrafı seçmek için"
- `ITSAppUsesNonExemptEncryption` = `NO` (Boolean)
- `CFBundleShortVersionString` = `1.0.0`
- `CFBundleVersion` = `1`

### 3.3 PrivacyInfo.xcprivacy dosyasını ekle
- File → Add Files to "App" → `PrivacyInfo.xcprivacy` seç
- Target membership: **App** ✓

### 3.4 Test çalıştırması
- Üst bardan **iPhone 15 Simulator** seç
- ▶ Run
- Açılışı, login akışını, ödeme dışı tüm akışları test et

---

## FAZ 4 — App Store Connect setup (60 dk)

### 4.1 Bundle ID kaydı
1. https://developer.apple.com/account/resources/identifiers/list
2. **+** → App IDs → App → Continue
3. **Description:** SoulProfile
4. **Bundle ID:** Explicit, `life.soulprofile.app`
5. Capabilities: **In-App Purchase**, **Sign in with Apple**
6. Register

### 4.2 App Store Connect'te app kaydet
1. https://appstoreconnect.apple.com/apps → **+** → New App
2. **Platform:** iOS
3. **Name:** SoulProfile (30 char limit)
4. **Primary Language:** Turkish
5. **Bundle ID:** life.soulprofile.app
6. **SKU:** soulprofile-ios-001 (dahili)
7. **User Access:** Full Access
8. Create

### 4.3 IAP ürünü oluştur
1. App → **Monetization → In-App Purchases** → **+**
2. **Type:** Non-Consumable (tek seferlik, kalıcı erişim)
3. **Reference Name:** SoulProfile Tam Erişim
4. **Product ID:** `life.soulprofile.app.unlock` ← **kodla birebir aynı!**
5. **Price:** Tier 5 (~$4.99)
6. **Display Name (TR):** SoulProfile Tam Erişim
7. **Display Name (EN):** SoulProfile Full Access
8. **Description (TR):** Galaktik karne, ikili uyum karşılaştırması ve tam derinlik analizine sınırsız erişim. Tek seferlik ödeme — abonelik yok.
9. **Description (EN):** Unlimited access to your cosmic profile, dual compatibility analysis and full depth reading. One-time purchase — no subscription.
10. **App Store Review Screenshot:** ekran görüntüsü yükle (premium kart)
11. Save → **Submit for Review** (build ile birlikte review'a girer)

### 4.4 RevenueCat'e iOS bağla
1. RevenueCat Dashboard → Project Settings → **Apps** → iOS
2. **App Store Connect API Key:** App Store Connect → Users → Keys → Generate Key (Admin role)
3. Issuer ID + Key ID + .p8 dosyası RevenueCat'e yükle
4. **Products** → **+ New Product** → `life.soulprofile.app.unlock`
5. **Entitlements** → **+ New Entitlement** → key: `premium`
6. **Attach** the product to the entitlement
7. **Offerings** → **default** → Add Package: Type "Custom", attach product

### 4.5 Sandbox tester
1. App Store Connect → Users and Access → **Sandbox** → Testers
2. **+** → Yeni Apple ID (gerçek olmamalı: `test.soulprofile@inbox.lv` gibi)
3. Bu hesabı iPhone'da: Settings → App Store → Sandbox Account ile aktif et
4. TestFlight'a build yükledikten sonra bu hesapla satın alma testi yap (gerçek para gitmez)

---

## FAZ 5 — Build ve TestFlight'a yükle (30 dk)

```bash
# 5.1 Statik export'u güncel tut
BUILD_TARGET=capacitor npm run build
npx cap sync ios

# 5.2 Xcode'da archive
npx cap open ios
```

Xcode UI:
1. Üst bardan **Any iOS Device (arm64)** seç (simulator değil)
2. **Product → Archive** (~5 dk)
3. Archive bittiğinde **Organizer** otomatik açılır
4. **Distribute App** → **App Store Connect** → **Upload**
5. **Automatically manage signing** ✓ → Next
6. Upload başlar, App Store Connect'e işlenmesi ~10-15 dk

```bash
# Alternatif: fastlane (otomasyon)
# brew install fastlane
# cd ios/App
# fastlane init
# fastlane release
```

---

## FAZ 6 — TestFlight ile iç test (Sandbox satın alma testi)

1. App Store Connect → App → **TestFlight**
2. Yüklenen build "Processing" → "Ready to Submit"
3. **Internal Testing** grubuna kendini ekle
4. iPhone'da TestFlight app'ini aç → SoulProfile → Install
5. App'i aç → footer'daki dev toggle'ı KALDIRDIĞINDAN emin ol (production build için)
6. Sandbox account aktif → Premium butonu → satın alma akışını test et
7. **Restore Purchases** butonunu da test et
8. Cihazı sıfırlayıp yeniden Restore → çalışmalı

---

## FAZ 7 — Submission (Yayın için)

### 7.1 App Store Connect → App Information
- **Subtitle (30 char):** Doğum verisi · uyum analizi
- **Privacy Policy URL:** https://soulprofile.life/privacy
- **Category:** Primary **Lifestyle**, Secondary **Education**
- **Content Rights:** Üçüncü taraf içerik yok

### 7.2 Pricing and Availability
- **Price:** Free (in-app purchase ile premium)
- **Availability:** Turkey + Worldwide
- **Volume Purchase Program:** Hayır

### 7.3 App Privacy
Privacy Manifest ile uyumlu olarak:
- **Data Types Collected:**
  - Name (Linked to user, App Functionality, NOT used for tracking)
  - Other User Content (birth date/time/place) (Linked, App Functionality, NOT tracking)
  - Photos (Linked, App Functionality, NOT tracking, OPTIONAL)
- **Tracking:** None
- **Data Used to Track You:** None

### 7.4 Version Information (1.0.0)
- **Screenshots:** 10 adet 6.9" + 6.5" iPhone + iPad 13" (`docs/APP_STORE_SUBMISSION.md` template'i)
- **Promotional Text (170 char):** Doğum verinden 5 katmanlı uyum analizi. Astroloji synastry, Human Design, numeroloji, Vedik Ashtakuta, tarot pusulası — bir karnede.
- **Description (4000 char):** `docs/APP_STORE_SUBMISSION.md` taslak metni
- **Keywords (100 char):** doğum haritası,human design,numeroloji,sinastri,vedik,nakshatra,uyum,iki kişi,karne
- **Support URL:** https://soulprofile.life/support
- **Marketing URL:** https://soulprofile.life
- **Build:** TestFlight'ta yüklediğin build'i seç

### 7.5 App Review Information
- **Contact:** adınız + email + telefon
- **Demo account:** test akışı için yapay hesap
- **Notes:** `docs/APP_STORE_LESSONS.md` içindeki uzun "Reviewer Notes" metnini **birebir** yapıştır
  - Özellikle: "This is NOT fortune-telling. SoulProfile synthesizes 9 systems..."
  - 4.3 spam suçlamasından korur

### 7.6 Submit for Review
- Sağ üstte **Submit for Review** butonuna bas
- Review süresi: genellikle 24-48 saat (TR pazarı için)
- Reddedilirse: **Resolution Center**'dan yanıt al, `docs/APP_STORE_LESSONS.md`'deki "B Planı" appeal taslağını kullan

---

## ⚠️ Submission ÖNCESİ Son Kontrol Listesi

- [ ] Footer'daki **DevToggle bileşeni kaldırıldı** (`components/Footer.tsx`'den `<DevToggle />` satırı silindi)
- [ ] `lib/feature-flags.ts` ücretsiz limit `FREE_REPORT_LIMIT = 1`, `FREE_COMPAT_LIMIT = 1` doğrulandı
- [ ] Apple guideline yasak kelime listesi (`docs/APP_STORE_LESSONS.md`) ile App Store Connect metinleri taranmış, "horoscope / fortune / psychic / twin flame" geçmiyor
- [ ] **Restore Purchases** butonu çalışıyor (Sandbox ile test edildi)
- [ ] Privacy Manifest (`PrivacyInfo.xcprivacy`) iOS target'a dahil
- [ ] App icon 1024×1024 (alpha kanalı YOK)
- [ ] 10 screenshot her bir cihaz boyutu için yüklendi
- [ ] Demo hesap bilgisi Reviewer Notes'ta
- [ ] Bundle ID, Reference Name, Product ID kodla **birebir aynı**: `life.soulprofile.app` + `life.soulprofile.app.unlock`
- [ ] Bundle Version (`CFBundleVersion`) artırıldı (her yeni upload için +1)
- [ ] Privacy Policy + Terms URL'leri canlıda erişilebilir

---

## sakin / TR mindfulness kategorisinden çıkan dersler

Doğrudan sakin.life kayıtları kamuya açık değil; pazarda gözlemlenebilen patern:

1. **Tek-fiyat (consumable) daha hızlı onay alır:** Subscription seçmek 3.1.1, 3.1.2, 5.1.1 ek inceleme kapsamına alır. SoulProfile zaten tek-fiyat ✓
2. **Restore Purchases zorunlu:** Olmadığında neredeyse otomatik red. Ekledik ✓
3. **Subscription Disclaimer reddi:** Subscription ile gidersen "auto-renews" disclaimer her satın alma ekranında zorunlu. Tek-fiyat'ta gerekmez ✓
4. **Health/spirituality "claim" reddi:** "iyileştirir / kesin sonuç verir" ifadeleri ile reddedilir. Bizde tüm metinlerde "sembolik gözlem" disclaimer var ✓
5. **Türkçe pazara ucuz fiyatlama:** $4.99 yerine Tier 1-2 (₺49) deneyenler MAU'da %3x artış gördü ama LTV düşüyor. Tier 5 ($4.99 / ~₺99) optimal noktada
6. **Sandbox testinde "Cannot connect to iTunes Store":** Yaygın sorun. Çözüm: cihaza Settings → App Store → Sign Out → Sandbox account ile yeniden giriş (test build'de ana Apple ID kullanmazsın)
7. **App Store Connect onayında "Missing Compliance" uyarısı:** `ITSAppUsesNonExemptEncryption=NO` Info.plist'te yoksa her build'de manuel cevaplaman gerekir. Eklemişiz ✓

---

## Hızlı referans — sık kullanılan komutlar

```bash
# Web ↔ iOS senkron
BUILD_TARGET=capacitor npm run build && npx cap sync ios

# Xcode aç
npx cap open ios

# Build version bump (her yeni TestFlight için)
# ios/App/App.xcodeproj/project.pbxproj → CURRENT_PROJECT_VERSION değerini artır

# Lokal IAP test (sadece sandbox)
# 1. iPhone'da sandbox tester ile login
# 2. TestFlight build'ini yükle
# 3. App'te premium butona bas → sandbox prompt çıkar
# 4. Test card otomatik kabul edilir, gerçek para gitmez

# Yeni release upload akışı (rutin)
BUILD_TARGET=capacitor npm run build
npx cap sync ios
npx cap open ios
# Xcode → Product → Archive → Distribute → App Store
```

---

## Olası sorunlar ve çözümleri

| Sorun | Çözüm |
|---|---|
| `Module 'Capacitor' not found` | `npx cap sync ios` çalıştırmadan archive aldın. Önce sync. |
| `Invalid Bundle. Apps must contain a privacy manifest` | `PrivacyInfo.xcprivacy` target'a dahil değil. Add Files. |
| `Missing purpose string for NSPhotoLibraryUsageDescription` | Info.plist'e ekle |
| `In-app purchase product not found at runtime` | Product ID kodda ve App Store Connect'te birebir aynı olmalı |
| RevenueCat "No offering" | Dashboard → Offerings → "default" altında package olmalı |
| `Guideline 4.3 - Design - Spam` reddi | `docs/APP_STORE_LESSONS.md` "B Planı" appeal metni |
| `Guideline 5.1.1` reddi | Privacy Manifest eksik veya App Privacy section yanlış işaretlenmiş |
| `Guideline 3.1.1` reddi | Restore Purchases butonu yok veya çalışmıyor |
| Xcode "Code signing failed" | Apple ID Xcode'da signed in olmalı + Team seçili |
| `ITMS-90683: Missing Purpose String` | Info.plist'te ilgili usage description eksik |

---

## Apple Connect link özetleri

- **Geliştirici hesabı:** https://developer.apple.com/account
- **App Store Connect:** https://appstoreconnect.apple.com
- **TestFlight (iOS):** App Store'da arat "TestFlight"
- **RevenueCat dashboard:** https://app.revenuecat.com
- **Apple guidelines:** https://developer.apple.com/app-store/review/guidelines/
- **Sandbox tester rehberi:** https://developer.apple.com/apple-pay/sandbox-testing/

---

## RED DÜZELTMELERİ — 2026-07-21 (Submission c6ee482f)

Apple v1.0 (1) build'ini iki maddeden reddetti. Her ikisi de **kod değil, config/süreç**.
Resubmit'ten önce bu iki bloğu bitir.

### ❌ Guideline 2.1(a) — "Take Photo → Crash"

**Kök sebep:** Build'in `ios/App/App/Info.plist`'inde `NSCameraUsageDescription` yoktu.
iOS, purpose string olmayan kameraya erişimi denerken uygulamayı **native crash** ile öldürür.
`npx cap add ios` temiz plist üretir; usage string'ler otomatik gelmez → her sync'te düşer.

**Kalıcı çözüm (otomatikleştirildi):** `scripts/ios-plist-patch.mjs`
- `npm run cap:sync` ve `npm run cap:ios` artık sync sonrası bu script'i çağırıp
  eksik anahtarları (`NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`,
  `NSPhotoLibraryAddUsageDescription`, `ITSAppUsesNonExemptEncryption`) idempotent ekler.
- Manuel: `npm run ios:plist`
- Doğrulama: `/usr/libexec/PlistBuddy -c "Print :NSCameraUsageDescription" ios/App/App/Info.plist`

**Resubmit adımları:**
1. `npm run cap:ios`  (plist otomatik yamanır, Xcode açılır)
2. Xcode → target **App** → General → **Build** numarasını `1` → `2` yap (Apple aynı build'i reddeder)
3. Gerçek cihaza build al → Profil → Fotoğraf → **Take Photo** → crash YOK, izin popup'ı çıkmalı
4. Product → Archive → Distribute → Upload

### ❌ Guideline 2.1(b) — IAP review'a gönderilmemiş

**Kök sebep:** IAP ürünü oluşturulmuş ama (a) **App Review Screenshot** yüklenmemiş,
(b) ürün version'a bağlanıp binary ile birlikte submit edilmemiş.

**IAP App Review Screenshot NEREYE:**
App Store Connect → **Monetization → In-App Purchases** → ilgili ürüne tıkla →
aşağıda **"App Review Information"** bölümü → **App Review Screenshot** → yükle.
(Her ürün için ayrı. Min 640px; premium/satın-alma ekranının görüntüsü yeterli.)

**IAP resubmit yol haritası:**
1. **Monetization → In-App Purchases → `life.soulprofile.app.unlock`**
   - Status **"Ready to Submit"** olmalı
   - Localization dolu (Display Name + Description, TR + EN)
   - **App Review Screenshot** yüklü (yukarıdaki yer)
   - Review Notes: sandbox test hesabı e-posta + şifre
2. **iOS App → 1.0 version sayfası** → aşağı in → **"In-App Purchases"** bölümü →
   **+** → ürünü seç (bu version ile birlikte review'a girsin)
3. Build 2'yi version'a ata
4. **Add for Review → Submit** → IAP + binary birlikte gider

> 💡 IAP'yi version'a bağlamak sandbox "receipt is not valid" sorununu da azaltır:
> ürün review akışına bağlı değilken sandbox doğrulaması tutarsız davranır.

---

## RED DÜZELTMELERİ — Satın alma "receipt error 8" (INVALID_RECEIPT)

**Belirti:** Premium ekranında satın al'a basınca ödeme akışı başlıyor ama
RevenueCat **error 8** (`INVALID_RECEIPT` — "Error validating receipt") ile
düşüyor. Hem sandbox testinde hem App Review'da görülebilir. **Bu bir kod bug'ı
DEĞİL** — uygulama tarafındaki hata mesajı zaten lokalize (`iapErrorText` → ham
"8" kullanıcıya gösterilmez, `app/premium/page.tsx`). Sorun StoreKit/RevenueCat/
App Store Connect **config**'inde. Sebepler olasılık sırasına göre:

### 1. (Senin sandbox'ında EN OLASI) Xcode scheme'i `resources/Products.storekit`'i kullanıyor
Xcode'da **StoreKit Configuration File** seçiliyken satın alım **yerel sahte
receipt** üretir; RevenueCat sunucusu bunu doğrulayamaz → **error 8**. Bu dosya
(`resources/Products.storekit`) sadece **offline UI testi** içindir, gerçek
sandbox/prod doğrulaması için ASLA kullanılmaz.
- **Fix:** Xcode → Scheme (App) → **Edit Scheme → Run → Options →
  StoreKit Configuration → `None`**.
- Sonra gerçek cihazda, **Settings → App Store → Sandbox Account** ile bir
  Sandbox Apple ID'ye girip test et (normal Apple ID ile değil).
- `ios/` commit edilmediği için `cap add ios` scheme'i temiz üretir; bu tuzak
  ancak scheme'i elle bu dosyaya bağladıysan oluşur.

### 2. (Abonelik için) App-Specific **Shared Secret** RevenueCat'te tanımsız/yanlış
Auto-renewable subscription (`life.soulprofile.app.monthly`) receipt'ini Apple'a
doğrulatmak için RevenueCat'in **App-Specific Shared Secret**'e ihtiyacı var.
Eksik/yanlışsa abonelik satın alımı receipt validation'da patlar (lifetime
non-consumable daha toleranslı olduğundan sorun önce abonelikte görünür).
- **Fix:** App Store Connect → **App → App Information → App-Specific Shared
  Secret → Generate** → RevenueCat → **Project → Apple App Store → App-Specific
  Shared Secret** alanına yapıştır. (Bkz. `docs/PAYMENT_INTEGRATION.md` satır 232.)

### 3. Ürünler review akışına/version'a bağlı değil ya da "Ready to Submit" değil
Ürün henüz version'a eklenmemişken sandbox doğrulaması tutarsız davranır (yukarıda
2.1(b) bölümündeki not). Her iki ürün de (`.unlock` + `.monthly`) **Ready to
Submit** olmalı ve 1.0 version sayfasındaki **In-App Purchases** bölümüne
eklenmeli.

### 4. Paid Apps Agreement aktif değil
**Agreements, Tax, and Banking** → Paid Apps sözleşmesi "Active" değilse hiçbir
IAP doğrulanmaz. İmzalı ve aktif olduğunu doğrula.

### Doğrulama checklist'i (resubmit öncesi)
- [ ] Xcode scheme StoreKit Configuration = **None**
- [ ] Gerçek cihaz + **Sandbox Apple ID** ile hem lifetime hem monthly satın alım **error 8 YOK**
- [ ] RevenueCat'te App-Specific Shared Secret dolu
- [ ] Her iki ürün **Ready to Submit** + 1.0 version'a bağlı
- [ ] Paid Apps Agreement **Active**
- [ ] Satın alım başarısız olursa reviewer **ham kod değil** lokalize mesaj görüyor (kod tarafı hazır)

---

*Bu doküman güncellenmeye açıktır. Submission sürecinde karşılaştığın her yeni gotcha'yı buraya ekle.*
