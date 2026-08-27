# Sakin Mitler — App Store Submission Guide (Xcode yolu)

Niyet-App ile **aynı manuel Xcode iş akışı**: `expo prebuild` → Xcode Archive → App Store Connect Upload.
EAS, fastlane veya CI workflow kullanılmaz.

## 0. Ön koşullar (sadece ilk seferde)

- Apple Developer Program aktif üyelik ($99/yıl).
- macOS + Xcode 16+ (newArchEnabled: true için).
- CocoaPods (`brew install cocoapods` veya `sudo gem install cocoapods`).
- App Store Connect'te uygulama kaydı:
  - **My Apps → +** → New App
  - Platform: iOS
  - Name: **Sakin: Jung Arketip & Rüya** (Title 30 karakterden uzun olmazsa)
  - Primary Language: Turkish (Turkey)
  - Bundle ID: **`life.sakin.mitler`** (Apple Developer → Identifiers'tan önce kayıt et)
  - SKU: `sakinmitler-ios-001`
  - User Access: Full

## 1. Repo'yu temizle ve dependency'leri kur

```bash
git pull
rm -rf node_modules ios/Pods ios/build
npm install
```

## 2. iOS native projesini üret

`app.json`'da bir değişiklik yaptıysan veya yeni native modül eklediyysen:

```bash
npm run prebuild        # = expo prebuild --platform ios --clean
cd ios && pod install && cd ..
```

`ios/SakinMitler.xcworkspace` oluşur. **`ios/` klasörü repo'da commit'lidir** (Niyet-App pattern'i) — manuel düzenleme yapma, hep `prebuild`'ten regenerate et.

## 3. Xcode'da aç ve archive et

```bash
npm run xcode        # = open ios/SakinMitler.xcworkspace
```

Xcode'da:

1. **Signing & Capabilities** sekmesi → Team seç (Apple Developer Team), "Automatically manage signing" işaretli olsun.
2. Üst bardan target device olarak **"Any iOS Device (arm64)"** seç (Simulator değil!).
3. **Product → Scheme → Edit Scheme → Run → Build Configuration: Release** olduğundan emin ol.
4. **Product → Archive** → bekle (~5-10 dk).
5. Organizer otomatik açılır → archive'ı seç → **Distribute App** → **App Store Connect** → **Upload**.
6. Otomatik sign et, yükle (~3-5 dk).

## 4. TestFlight + Review

1. App Store Connect → TestFlight: build görünür (10-30 dk processing).
2. Build'i "Internal Testing"e ekle, kendi cihazında dene.
3. App Store sekmesi → **Build seç** → Tüm gerekli metadata + screenshot + privacy answers tamamla (bkz. `app-store-metadata.md`).
4. **Submit for Review**.

## 5. Build number bump (her yeni upload için)

App Store Connect aynı `buildNumber` ile ikinci kez yüklemene izin vermez. Her seferinde `app.json`'da `ios.buildNumber` artır (1 → 2 → 3...), sonra `npm run prebuild && cd ios && pod install && cd ..` yeniden çalıştır, sonra Archive.

## 6. Submission Öncesi Kontrol Listesi

**Sıralı, her madde işaretlenmeden bir sonrakine geçme:**

- [ ] `app.json` → `version` ve `ios.buildNumber` doğru (her upload için buildNumber +1)
- [ ] `npm run prebuild` çalıştırıldı, `ios/` regenerated
- [ ] `cd ios && pod install` başarılı, `ios/SakinMitler.xcworkspace` üretildi
- [ ] Xcode → Signing & Capabilities → Team seçili, "Automatically manage signing" işaretli
- [ ] Target device: "Any iOS Device (arm64)" (Simulator DEĞİL)
- [ ] Build Configuration: Release (Debug değil)
- [ ] App Store Connect → My Apps → uygulama oluşturuldu, Bundle ID `life.sakin.mitler` eşleşti
- [ ] App Information → Primary Category: **Lifestyle**, Secondary: **Entertainment** (Health & Fitness ASLA)
- [ ] App Information → Review Notes: `app-review-notes.md`'den ilgili metin yapıştırıldı
- [ ] Age Rating: **12+** (Horoscopes/Fortune Telling: Infrequent)
- [ ] Pricing: **Free** — **In-App Purchases: NONE — No Subscription Group** (Sakin Mitler IAP içermez, bunu açıkça not düş)
- [ ] App Privacy: "Data Not Collected" işaretli (gerçekten local-only)
- [ ] Privacy Policy URL: `https://sakin.life/privacy` **yayında ve erişilebilir**
- [ ] Support URL + Marketing URL: `https://sakin.life`
- [ ] Trader Status (AB) doldurulmuş
- [ ] 10 adet screenshot yüklü (6.7" × 5 + 6.1" × 5)
- [ ] Description TR + EN yapıştırıldı (`app-store-description-*.md`)
- [ ] Keywords TR + EN yapıştırıldı (sağlık iddiası içeren kelime YOK)
- [ ] Encryption: `Does your app use encryption?` → **No**
- [ ] Xcode Archive başarılı, Distribute → App Store Connect → Upload tamam
- [ ] TestFlight'ta build göründü, kendi cihazında en az 1 kez çalıştırıldı
- [ ] Submit for Review

## 7. Sık Yapılan Hatalar — Önceden Kaç

| Hata | Sebep | Çözüm |
|---|---|---|
| `No bundle URL present` simulator'da | Metro çalışmıyor | `npm start` ardından Xcode Run |
| `pod install` Reanimated/RN-screens hatası | Pod cache eski | `cd ios && pod repo update && pod install` |
| Archive opsiyonu gri | Simulator target seçili | Target → "Any iOS Device (arm64)" + Release config |
| `Missing privacy manifest` | `PrivacyInfo.xcprivacy` bundle'a eklenmemiş | Prebuild bunu hallediyor; manuel için Xcode File Inspector → Target Membership tikle |
| `Invalid Bundle. The bundle does not support the minimum OS Version` | iOS deployment target uyumsuz | `app.json` `expo-build-properties.ios.deploymentTarget: "15.1"` doğrula |
| ITMS-90683 / Missing usage descriptions | `NSCameraUsageDescription` vb. eksik | Sakinmitler hiçbir hassas API'yi kullanmaz; eksiklik gelirse `Info.plist`'i boşalt |
| Build aynı buildNumber ile reddedildi | Daha önce yüklendi | `app.json` `ios.buildNumber` artır, `npm run prebuild`, yeniden archive |
| Apple Pay merchant ID eksik uyarısı | Şablon kalıntısı | `ios/SakinMitler/SakinMitler.entitlements` boş kalmalı (`<dict/>` — sakinmitler IAP yok) |
| 4.3 spam reddi (saturated category) | Tarot/Rune kategorileri Health & Fitness ile sunulmuş | Lifestyle + Entertainment seç, açıklamada "Jungian / journaling" çerçevesi, IAP yok notu, `app-review-notes.md`'deki 4.3 cevap şablonu hazır |
| 2.3.8 metadata reddi | Açıklamada / keyword'lerde "healing/reiki/cure/wellness" | Bu kelimeleri arat, `app-store-description-*.md` ve metadata zaten temiz; tekrar kontrol et |
| 5.1.1(v) account deletion reddi | Silme butonu görünmüyor | Profile → "Veri ve Gizlilik" section'ı doğrula, 3 saniyelik screen recording reviewer'a ilet |

## 8. Reddedilirsen

`app-review-notes.md` dosyasında **5 ayrı senaryo için hazır resolution center cevap şablonu** var (4.3, 4.2, 5.1.1, 1.4.1, 2.3.8). Reviewer'a cevap verirken o şablonu kopyala, gerekirse screen recording iliştir. Aynı bundle ile **3 büyük değişiklik** yapmadan re-submit etme — Apple "minor change" sayar, otomatik tekrar reddeder.
