# Sakin Tasarım — Xcode Lokal Build & TestFlight Akışı

Bu doküman, **Sakin Tasarım**'ı kendi Mac'inde Xcode ile derleyip App Store
Connect'e (TestFlight + App Store) yükleme adımlarını içerir. Akış,
sakin.life ekosistemindeki **Niyet (Sakin)** uygulamasının yayın yöntemiyle
hizalı: lokal Xcode → Archive → Distribute App → Upload.

> Bundle ID: **`life.sakin.tasarim`**
> Marketing Name: **Sakin Tasarım**
> Slug: `sakin-tasarim` → Xcode projesi `SakinTasarim`

---

## 0. Önkoşullar

| Gereksinim | Notu |
| --- | --- |
| **macOS 14+ (Sonoma veya üstü)** | Xcode 16'nın gerektirdiği minimum sürüm |
| **Xcode 16+** | App Store'dan ücretsiz |
| **CocoaPods 1.15+** | `sudo gem install cocoapods` ya da `brew install cocoapods` |
| **Node 20+** ve **npm 10+** | `nvm install 20` önerilir |
| **Apple Developer Program** ($99/yıl) | https://developer.apple.com/programs/ |
| **App Store Connect uygulaması** | https://appstoreconnect.apple.com — App ID ve uygulama kaydı için |
| **Watchman** (opsiyonel, hız için) | `brew install watchman` |

İlk kurulum doğrulama:

```sh
xcode-select --install
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
xcodebuild -version
pod --version
node -v && npm -v
```

---

## 1. Apple Developer Connect Tarafı (tek seferlik)

App Store Connect'te (https://appstoreconnect.apple.com) yapılacaklar:

1. **Apps → "+" → New App**
   - Platform: iOS
   - Name: `Sakin Tasarım`
   - Primary Language: `Turkish (Turkey)`
   - Bundle ID: **`life.sakin.tasarim`**  
     (önce **Certificates, Identifiers & Profiles** sayfasından bu Bundle ID'yi App ID olarak kaydet)
   - SKU: `sakin-tasarim-001` (serbest)
   - User Access: Full Access
2. **Users and Access → Integrations → App Store Connect API**
   - "Generate API Key" → Issuer ID + Key ID + .p8 dosyasını indir
   - Bu üçü `eas.json` submit profilinde veya `xcrun altool`/`notarytool` için kullanılır
   - .p8 dosyası **bir kere** indirilebilir — güvenli sakla
3. **App ID kapasiteleri (Identifiers)**
   - Bizim app için gerekli: yok (push notification yok, in-app purchase yok). Sadece varsayılan.
4. **Pricing and Availability** → Free, tüm bölgeler.

---

## 2. Repo Hazırlığı (tek seferlik / her major sürümde)

```sh
# 1) Repoyu çek
git clone git@github.com:cetinarda/humandesign.git
cd humandesign

# 2) Bağımlılıkları kur
npm install

# 3) Native ios/ klasörünü üret (Expo prebuild)
#    Bu, app.json'daki bilgilere göre tam bir Xcode projesi üretir.
npx expo prebuild --platform ios --clean
```

`prebuild --clean` flag'i her seferinde `ios/` klasörünü siler ve yeniden
üretir. Bu, Niyet-App'teki `npx cap sync ios` adımının Expo karşılığıdır —
JS tarafındaki değişiklikleri native projeye yansıtır.

> **Not:** `ios/` klasörünü repo'ya commit etmeyebilirsin (yönetilen akış)
> ya da edersin (bare-managed hybrid). Bizim tercih: **commit etme** —
> sürüm öncesi temiz prebuild çalıştır. Bunun için `.gitignore`'da `ios/`
> satırı bulunmalı. (Var olan `.gitignore` zaten `ios/Pods/`'u yok sayıyor;
> tam dışlama istersen `ios/` satırını ekle.)

### 2.1 CocoaPods kur

`expo prebuild` çoğu zaman pod install'ı otomatik yapar. Yapmadıysa:

```sh
cd ios
pod install --repo-update
cd ..
```

---

## 3. Xcode'da Aç

```sh
open ios/SakinTasarim.xcworkspace
```

> Daima **`.xcworkspace`** açılır, **`.xcodeproj`** değil. Workspace
> CocoaPods'un eklediği Pods projesini içerir.

---

## 4. Signing & Capabilities

1. Sol panel → en üstte **SakinTasarim** projesi → **Targets → SakinTasarim**
2. Üst sekmelerden **Signing & Capabilities**
3. **Automatically manage signing** işaretli
4. **Team:** Apple Developer hesabını seç (önce Xcode → Settings → Accounts → "+"
   ile Apple ID'ni ekle)
5. **Bundle Identifier** kontrol: `life.sakin.tasarim`
6. Provisioning Profile otomatik üretilir; "Status" alanı yeşil ✓ olmalı

Eğer kırmızı uyarı çıkarsa:
- Apple Developer Portal'da App ID kayıtlı mı?
- Hesabın "Account Holder" veya "Admin" rolünde mi?
- Bundle ID benzersiz mi?

---

## 5. Sürüm ve Build Numarasını Ayarla

**Tek doğruluk kaynağı: `app.json`**. Xcode'daki değerleri elle düzenleme —
sonraki prebuild silinir. Bunun yerine `app.json`'u güncelle:

```jsonc
{
  "expo": {
    "version": "1.0.1",          // App Store görünür sürüm (kısa, semver)
    "ios": {
      "buildNumber": "2"          // Her upload için artır
    }
  }
}
```

Sonra:

```sh
npx expo prebuild --platform ios --clean
```

> **Kural:** Aynı `version` + farklı `buildNumber` → TestFlight'a yeni
> build gönderilebilir. App Store sürümünü değiştirmek için `version`'ı
> artır.

---

## 6. Hedef Cihazı "Any iOS Device (arm64)" Yap

Xcode toolbar'da scheme seçici (üst orta) → **Any iOS Device (arm64)**
seç. Simulator seçili olursa Archive butonu pasif kalır.

---

## 7. Archive

1. Menü: **Product → Archive**
2. Build 3-10 dakika sürer (ilk seferde daha uzun)
3. Bittiğinde **Organizer** penceresi otomatik açılır

Hata alırsan en sık nedenler **Bölüm 11**'de.

---

## 8. Distribute App → App Store Connect

Organizer'da yeni archive seçili:

1. Sağ üstten **Distribute App** tıkla
2. **App Store Connect** seç → Next
3. **Upload** seç → Next  
   (Export = .ipa dosyasını diske kaydeder, sonra Transporter ile yükleyebilirsin)
4. **Signing:** "Automatically manage signing" → Next
5. Özet ekranı → **Upload**
6. 5-15 dakika sonra App Store Connect → TestFlight'ta build görünür  
   ("Processing" durumundan çıkması ekstra 10-30 dk sürer)

---

## 9. TestFlight'ta Yayına Ver

App Store Connect → **TestFlight** sekmesi:

1. Build → **Manage Compliance** → "Encryption: No" (zaten app.json'da
   `usesNonExemptEncryption: false`)
2. **Test Information** → tanıtım metni, geri bildirim e-postası
3. **Internal Testing** grubu → tester e-postaları ekle
4. Build'i grup ile paylaş → tester'lara TestFlight invitation gider

---

## 10. App Store Submission

1. **App Store** sekmesi → **iOS App** → versiyon ekle (1.0.1)
2. `store/app-store-listing-tr.md` ve `store/app-store-listing-en.md`'den
   metinleri yapıştır
3. Screenshot'lar (6.7" + 6.5") yükle
4. **App Privacy** → `store/privacy-nutrition-label.md` (Data Not Collected)
5. **Age Rating** → `store/age-rating-questionnaire.md`
6. **App Review Information** → Notes alanına `store/app-review-notes.md` içeriğini yapıştır
7. **Build** seç → az önce upload ettiğin build
8. **Add for Review → Submit**

İnceleme süresi: ortalama 24-48 saat.

---

## 11. Sık Karşılaşılan Hatalar

| Hata | Çözüm |
| --- | --- |
| `No such module 'ExpoModulesCore'` | `cd ios && pod install --repo-update` |
| `Signing requires a development team` | Xcode → Settings → Accounts → Apple ID ekle, Team seç |
| `Bundle identifier ... is not available` | Apple Developer Portal'da App ID olarak kaydedilmemiş |
| `App Store Connect Operation Error: Invalid version` | `version` artırılmamış veya `buildNumber` aynı |
| `Multiple commands produce ... .app/Info.plist` | `ios/` klasörünü sil, `npx expo prebuild --clean` |
| `CocoaPods could not find compatible versions` | `cd ios && pod repo update && pod install` |
| `Deployment target ... is lower than ...` | `app.json` → `expo.ios.deploymentTarget: "15.1"` ekle, prebuild |
| `xcrun: error: SDK "iphoneos" cannot be located` | `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer` |
| `ITMS-90713 Missing Info.plist value` | app.json infoPlist'e eksik anahtarı ekle, prebuild |
| `ITMS-90683 Missing Purpose String` | Hiçbir izin (kamera, mikrofon vb.) istemiyoruz — istiyorsak `infoPlist`'e NSXxxxUsageDescription ekle |

### 11.1 Temiz Sıfırlama

Bir şey bozulduysa nükleer reset:

```sh
rm -rf ios android node_modules package-lock.json
npm install
npx expo prebuild --platform ios --clean
cd ios && pod install --repo-update && cd ..
open ios/SakinTasarim.xcworkspace
```

---

## 12. Alternatif: EAS Build (bulut)

Mac'in yoksa veya CI istiyorsan `eas.json` hazır:

```sh
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios --profile production
eas submit --platform ios --latest
```

Bu yol, sertifika ve provisioning profile'ı Expo'nun kendi sunucularında
saklar — manuel signing'e gerek kalmaz. Niyet-App lokal Xcode kullanıyor;
biz de varsayılan olarak onu öneriyoruz. EAS sadece yedek.

---

## Kontrol Listesi (her sürümden önce)

- [ ] `app.json` → `version` ve `ios.buildNumber` artırıldı
- [ ] `npx expo prebuild --platform ios --clean` çalıştırıldı
- [ ] `pod install` başarılı
- [ ] Xcode → Signing & Capabilities yeşil ✓
- [ ] "Any iOS Device (arm64)" hedefi seçili
- [ ] Product → Archive temiz tamamlandı
- [ ] App Store Connect'te build "Processed" durumuna geçti
- [ ] TestFlight Compliance "No" işaretli
- [ ] Listing metinleri ve screenshot'lar güncel

---

**Son güncelleme:** Mayıs 2026  
**Stack referansı:** [Niyet-App](https://github.com/cetinarda/Niyet-App) — sakin.life ekosistemindeki kardeş uygulama
