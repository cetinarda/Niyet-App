# Sakin Tasarım — Sürüm Çıkarma Akışı

Niyet-App ile aynı disiplin: **app.json'da version + buildNumber bump → git
tag → Xcode archive → App Store Connect upload**.

---

## 1. Sürüm Numaralandırma

| Tür | `version` | `buildNumber` |
| --- | --- | --- |
| Aynı sürümün yeni TestFlight build'i | aynı | +1 |
| Patch (hata düzeltme) | x.y.**Z+1** | +1 |
| Minor (yeni özellik) | x.**Y+1**.0 | +1 |
| Major (kırıcı değişiklik) | **X+1**.0.0 | +1 |

> `buildNumber` HER upload için artmak zorunda — App Store Connect aynı
> numarayı iki kez kabul etmez.

---

## 2. Sürüm Akışı

```sh
# 0) Çalışma dalı temiz mi?
git status

# 1) app.json'u düzenle: version + ios.buildNumber + android.versionCode
#    (örneğin: 1.0.0 → 1.0.1, buildNumber 1 → 2, versionCode 1 → 2)
$EDITOR app.json

# 2) package.json sürümünü de hizala (opsiyonel ama önerilir)
npm version 1.0.1 --no-git-tag-version

# 3) Değişiklikleri commit'le
git add app.json package.json package-lock.json
git commit -m "release: v1.0.1"

# 4) Tag at
git tag -a v1.0.1 -m "Sakin Tasarım v1.0.1"
git push origin main --tags

# 5) Native prebuild (her sürümde temiz)
npm install
npx expo prebuild --platform ios --clean

# 6) Pod install
cd ios && pod install --repo-update && cd ..

# 7) Xcode'da aç ve Archive
open ios/SakinTasarim.xcworkspace
#   Xcode'da: scheme = SakinTasarim, hedef = Any iOS Device (arm64)
#   Product → Archive → Distribute App → App Store Connect → Upload
```

Tüm detay: [`XCODE.md`](./XCODE.md).

---

## 3. Release Notes Şablonu

Her tag için `What's New (Türkçe + English)` metni hazırla. App Store
Connect → versiyon ekle → "What's New in This Version".

### v1.0.1 örneği

**Türkçe:**
```
• İlk genel sürüm
• Sıfır-veri yerel Human Design bodygraph
• Çoklu profil desteği
• Günlük transit (Güneş + Ay kapısı)
```

**English:**
```
• First public release
• Zero-data, on-device Human Design bodygraph
• Multi-profile support
• Daily transit (Sun + Moon gate)
```

---

## 4. Sürüm Sonrası

- [ ] TestFlight'ta build "Ready to Test" görünüyor
- [ ] Internal tester'lara dağıtıldı
- [ ] 24 saat dahili test geçti
- [ ] Review'e gönderildi → 24-48 saat
- [ ] Approve sonrası "Manual release" seçtiysen "Release This Version" bas
- [ ] App Store'da canlı; `sakin.life/tasarim` sayfasında "App Store'da" linki güncel
- [ ] Sonraki sürüm için `app.json`'da `buildNumber` bir sonraki rakama kuruldu

---

## 5. Geri Alma (Rollback)

App Store yayınlanan bir sürümü "geri çekemezsin" — onun yerine **Phased
Release**'i durdur veya hızlıca daha yüksek `version` ile düzeltme gönder.
TestFlight'ta build "Expire" edilebilir.

---

**İlgili dokümanlar:** [`XCODE.md`](./XCODE.md), [`README.md`](./README.md), [`store/`](./store/)
