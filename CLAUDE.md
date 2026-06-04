# Sakin / Niyet-App — Çalışma Kuralları (Claude için)

Bu dosya HER yeni Claude oturumunda otomatik okunur. Bu projenin kendine has kuralları:

## ⚠️ ALTIN KURALLAR

1. **iOS build branch = `main`.** `claude/check-sakin-life-update-CIpM8` build branch'in eski adı; main ile birebir eşit tutuluyor (fast-forward). Kullanıcının Mac komutu hâlâ CIpM8'i çekiyor olabilir — değişiklik push'larken her iki branch'i de aynı SHA'da tut.
2. **Web Netlify branch = `claude/fix-text-overlap-spacing-gdkpd`** (apartılmış, kendi geçmişi var). Web'i etkileyen değişiklikleri ayrıca buraya da işle. iOS-only değişiklikleri buraya gönderme.
3. **Mac yol:** `~/Desktop/Niyet-App`. Build komutu:
   ```
   cd ~/Desktop/Niyet-App && git pull origin claude/check-sakin-life-update-CIpM8 && \
   npm run build && npx cap sync ios && open ios/App/App.xcodeproj
   ```
4. **Sürüm 4 yerde aynı olmalı:**
   - `ios/App/App.xcodeproj/project.pbxproj` — `MARKETING_VERSION` ve `CURRENT_PROJECT_VERSION` (her biri 2 occurrence)
   - `src/App.jsx` — `APP_VERSION` (~satır 14)
   - `public/latest-ios-version.json` — `version` ve `build`
   - Şu an: `1.2.5 / build 1`
5. **`src/purchases.js`'e DOKUNMA.** IAP/para mantığı, Apple receipt validation. `992ab50` fix'inden sonra çok hassas. Bug bulursan _öner_, _push etme_.
6. **App Store onayını riske atan değişiklikler için onay al:**
   - `ios/App/App/Info.plist` (özellikle `UIBackgroundModes`)
   - `ios/App/App/AppDelegate.swift` (AVAudioSession vb.)

## Mimari

- **Tek React kod tabanı.** `src/App.jsx` ~6300 satır. `const isNative = Capacitor.isNativePlatform()` (App.jsx:10) iOS vs web'i ayırır.
- **iOS = Capacitor + Swift Package Manager.** Podfile YOK, `pod install` ÇALIŞTIRMA. Çıktı `ios/App/App.xcodeproj/`.
- **Web = Vite → Netlify.** `npm run build` → `dist/`. Netlify deploy branch ayrı (yukarı bak).
- **Embedded apps:** `public/embedded/{humandesign, sakinhayvan, sakinmitler, soulprofile}/`. Hepsi **DERLENMIŞ Expo bundle'ları** (`_expo/static/js/...`) — bunlar ÜRETİLEN çıktı, elle düzenleme.
  - **`sakinmitler` ARTIK MONOREPO'DA.** Kaynak: `apps/mitler/` (tam Expo + RN projesi). Değişiklik orada yapılır, sonra `npm run build:mitler` (= `node scripts/build-embed.mjs mitler`) bundle'ı yeniden üretip `public/embedded/sakinmitler/`'a senkron eder. Pipeline: `expo export` → index.html'e scroll-override `<style>` enjekte → mirror. `npm run build:mitler -- --check` byte-identical doğrular. Eski `cetinarda/sakinmitler` GitHub reposu artık ÖLÜ (kaynak buraya taşındı, patch dosyası silindi — git geçmişinde).
  - **`humandesign` (Tasarım) MONOREPO'DA — davranışsal özdeş reconstruction.** Kaynak: `apps/tasarim/`. GitHub'daki `cetinarda/humandesign` (`claude/human-design-app-i8Hh9` branch) + `embed-patches/humandesign-host-bridge.patch` canlı bundle'ı TAM üretmiyordu: canlıda `initialTab` (host'un belirli sekme açması) + ProfileScreen `bridgePrefill` (doğum bilgisi prefill) özellikleri vardı ama hiç commit edilmemişti. Canlı bundle referans alınarak `TabNavigator.tsx` (byte-identical) + `ProfileScreen.tsx` (yapısal/davranışsal özdeş) yeniden yazıldı. `npm run build:tasarim` minifier iç değişken harfleri yüzünden byte-identical DEĞİL → script canlıya yazmayı reddeder (kırmızı çizgi). Canlı bundle olduğu gibi korunur; `apps/tasarim` düzenlenebilir kaynaktır.
  - **`sakinhayvan` HENÜZ MONOREPO'DA DEĞİL — kaynak fazla sapmış.** Canlı hayvan bundle'ı (1013 modül, tek bundle) GitHub `cetinarda/sakinhayvan` (`claude/tura-quotes-app-iiv48` branch, 1069 modül, code-split) ile uyuşmuyor: 05-19 ile 06-02 arası lazy bir özellik çıkarılmış + bridge eklenmiş, hiçbiri commit edilmemiş. Sadık reconstruction tahmin gerektirir. ŞU AN: canlı bundle (`public/embedded/sakinhayvan/`) tek doğru kaynak, dokunma. Tam kaynak için Mac'teki yerel kopya gerekebilir.
  - **`build-embed.mjs` kırmızı-çizgi-güvenli:** default mod byte-identical değilse `public/`'e YAZMAZ. Bilerek yeni bundle göndermek için `--force`. `--check` sadece doğrular.
  - Stil davranışı için (taşınmamışlarda) host'tan CSS injection ile müdahale: App.jsx'deki iframe `onLoad` içine bak.
- **Embedded ↔ host köprüsü:** `postMessage` ile (`sakin-premium-cta` mesajı vs). `storage` event köprüsü web-only, iOS'ta çalışmaz.
- **Şehir veritabanı:** `CITY_DB` + `SmartCityInput` bileşeni. `<datalist>` iOS WKWebView'da çalışmaz — özel dropdown kullanılıyor.
- **Astroloji:** `preciseAscendant` (App.jsx:441) lat/lon + standart UTC offset kullanır. DST uygulanmıyor (kasıtlı sadelik). Doğum şehri zorunlu yükselen burç için.

## Sıkça karşılaşılan tuzaklar (acı çekerek öğrenildi)

- **"Build çalışmıyor / hata yine var"** → Önce kullanıcının çektiği branch'i SOR. Yanlış branch'ten derliyor olabilir. (Bir kere main fix'lerim CIpM8'e gitmedi, ortalık karıştı.)
- **iOS'ta `<datalist>` öneri göstermez.** Bunun için `SmartCityInput` özel bileşeni var.
- **iOS'ta dropdown seçimi `onMouseDown` ile sallantılı.** `onPointerDown` daha güvenli.
- **iOS embed iframe'i üstte safe-area boşluğu bırakır + scroll bounce yapar.** Çözüm: iframe `onLoad` içinde body'ye `padding-top:0` + `overscroll-behavior-y:none` inject.
- **`onClick` ile premium ekranına atan UX'ler kullanıcıyı soğutur.** Gerekmiyorsa engelle/yumuşat — onay al.
- **`store.owned` (purchases.js'de) eski/iptal makbuzları döner.** Premium'u sadece kullanıcı eylemi ile (subscribe/restore) ver. (H2 bulgusu — çözülmemiş, IAP)

## Önemli değişiklikten sonra DOĞRULA

- `npm run build` — temiz mi? Hata varsa pushla.
- Önemli refactor / IAP-yakını / iframe / sürüm değişikliği → bir `Agent` (general-purpose) görevlendirip PASS/FAIL al.
- Push öncesi kullanıcıya kısaca söyle: hangi branch, neyi değiştirdin, hangi commit SHA.

## Hata anında ilk üç soru

1. iOS'ta mı web'de mi?
2. Hangi sürümde son çalışıyordu?
3. Hangi branch'ten derliyor? (Mac'te `git branch --show-current`)

## Bağımlılık komutları (referans)

- `npm run build` — Vite ile web bundle
- `npx cap sync ios` — dist + Capacitor plugin'leri iOS'a kopyala
- `npx cap open ios` — Xcode aç

## Bilinen, çözülmemiş öğeler (Layer-2 TODOs)

- IAP server-side receipt validation (`992ab50` commit mesajında söz verilmiş, kodda iz yok)
- `H2`: foreground premium recheck `store.owned`'dan grant yapıyor — revoke-only yapılmalı
- `H3`: `UIBackgroundModes=audio` review (App Store red riski)
- Web/iOS branch tek noktada birleştirme (deploy branch'i main'e migrate)
