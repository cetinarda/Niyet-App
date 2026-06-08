# Sakin / Niyet-App — Çalışma Kuralları (Claude için)

Bu dosya HER yeni Claude oturumunda otomatik okunur. Bu projenin kendine has kuralları:

## ⚠️ ALTIN KURALLAR

1. **iOS build branch = `main`.** `claude/check-sakin-life-update-CIpM8` build branch'in eski adı; main ile birebir eşit tutuluyor (fast-forward). Kullanıcının Mac komutu hâlâ CIpM8'i çekiyor olabilir — değişiklik push'larken her iki branch'i de aynı SHA'da tut.
2. **Web Netlify branch = `claude/fix-text-overlap-spacing-gdkpd`** (apartılmış: apps/ kaynak YOK, sadece `src/` + `public/embedded/` bundle + `netlify/`). Web'i etkileyen değişiklikleri buraya **main'den getirerek** işle (asla doğrudan özellik ekleme): `git checkout origin/main -- src/ public/embedded/...` (netlify/ + embed-patches/ KORUNUR), build-gate, push.
   - **BİRLEŞTİRME PLANI (önerilen, kullanıcı onayladı):** `main` zaten web-deploy-able (src + bundle + netlify backend + toml hepsi var). Kullanıcı Netlify production branch'ini `main` yaparsa gdkpd emekliye ayrılır → manuel main→gdkpd deploy (asıl drift kaynağı) biter. Web/iOS karışmaz: tek `src/App.jsx`, `isNative` ile runtime ayrışır; `ios/` (iOS-only) ve `netlify/` (web-only) ayrı klasör. Netlify değişene kadar gdkpd canlı kalır.
   - **ALTIN DİSİPLİN (bu oturumun acı dersi):** git proxy bazen bayat ref + sahte "pushed" döndürür; container reset yerel ağacı eski tabana düşürür. **Her push'u SHA değil İÇERİKLE doğrula** (re-fetch + `grep -c marker`). Branch+HEAD'i edit ÖNCESİ doğrula. Her milestone'da commit+push.
   - Portekizce dil kodu = **`pt`** (eski `pt-BR` değil; `sakin_lang` "pt" yazılır, embed'ler "pt" bekler). Legacy pt-BR i18n bloğu kaldırıldı.
3. **Mac yol:** `~/Desktop/Niyet-App`. Build komutu:
   ```
   cd ~/Desktop/Niyet-App && git pull origin claude/check-sakin-life-update-CIpM8 && \
   npm run build && npx cap sync ios && open ios/App/App.xcodeproj
   ```
4. **Sürüm 4 yerde aynı olmalı:**
   - `ios/App/App.xcodeproj/project.pbxproj` — `MARKETING_VERSION` ve `CURRENT_PROJECT_VERSION` (her biri 2 occurrence)
   - `src/App.jsx` — `APP_VERSION` (~satır 14)
   - `public/latest-ios-version.json` — `version` ve `build`
   - **App Store'da CANLI: `1.2.6`** (kullanıcılar bunu kullanıyor). Repodaki bir sonraki gönderim: `1.2.7 / build 1` (4 yerde de hazır). Yeni sürüm verirken 1.2.7'den ilerlet.
5. **`src/purchases.js`'e DOKUNMA.** IAP/para mantığı, Apple receipt validation. `992ab50` fix'inden sonra çok hassas. Bug bulursan _öner_, _push etme_.
6. **App Store onayını riske atan değişiklikler için onay al:**
   - `ios/App/App/Info.plist` (özellikle `UIBackgroundModes`)
   - `ios/App/App/AppDelegate.swift` (AVAudioSession vb.)

## 🧭 Çalışma tarzı (kullanıcı tercihleri — uy)

1. **Ek istek/soru geldiğinde işi BIRAKMA — sıraya al.** Önce o an üzerinde çalıştığın işlemi bitir, sonra yeni isteği/soruyu ele al. İş ortasında dosya/branch yarım bırakma.
2. **Soru sormak ≠ "dur".** Kullanıcı iş ortasında soru sorarsa: soruyu sıraya al, mevcut işi tamamla, **sonra** yanıtla. Sadece kullanıcı açıkça **"dur"** derse durdur.
3. **Bariz kapsam kararlarını sorma, ver.** (ör. "taşlar uygulamasında tabii ki taş olacak.") Gerçekten belirsizse veya geri-dönüşü zorsa sor; aksi halde mantıklı varsayımla ilerle ve ne yaptığını kısaca söyle.
4. **Hassas alanlar (IAP/`purchases.js`, Info.plist, AppDelegate): önce öner + diff göster, onay ve sandbox testi olmadan deploy etme.** (Altın kural #5–#6 ile aynı çizgi.)

## Mimari

- **Tek React kod tabanı.** `src/App.jsx` ~6300 satır. `const isNative = Capacitor.isNativePlatform()` (App.jsx:10) iOS vs web'i ayırır.
- **iOS = Capacitor + Swift Package Manager.** Podfile YOK, `pod install` ÇALIŞTIRMA. Çıktı `ios/App/App.xcodeproj/`.
- **Web = Vite → Netlify.** `npm run build` → `dist/`. Netlify deploy branch ayrı (yukarı bak).
- **Embedded apps:** `public/embedded/{humandesign, sakinhayvan, sakinmitler, soulprofile}/`. Hepsi **DERLENMIŞ Expo bundle'ları** (`_expo/static/js/...`) — bunlar ÜRETİLEN çıktı, elle düzenleme.
  - **`sakinmitler` ARTIK MONOREPO'DA.** Kaynak: `apps/mitler/` (tam Expo + RN projesi). Değişiklik orada yapılır, sonra `npm run build:mitler` (= `node scripts/build-embed.mjs mitler`) bundle'ı yeniden üretip `public/embedded/sakinmitler/`'a senkron eder. Pipeline: `expo export` → index.html'e scroll-override `<style>` enjekte → mirror. `npm run build:mitler -- --check` byte-identical doğrular. Eski `cetinarda/sakinmitler` GitHub reposu artık ÖLÜ (kaynak buraya taşındı, patch dosyası silindi — git geçmişinde).
  - **`humandesign` (Tasarım) MONOREPO'DA — davranışsal özdeş reconstruction.** Kaynak: `apps/tasarim/`. GitHub'daki `cetinarda/humandesign` (`claude/human-design-app-i8Hh9` branch) + `embed-patches/humandesign-host-bridge.patch` canlı bundle'ı TAM üretmiyordu: canlıda `initialTab` (host'un belirli sekme açması) + ProfileScreen `bridgePrefill` (doğum bilgisi prefill) özellikleri vardı ama hiç commit edilmemişti. Canlı bundle referans alınarak `TabNavigator.tsx` (byte-identical) + `ProfileScreen.tsx` (yapısal/davranışsal özdeş) yeniden yazıldı. `npm run build:tasarim` minifier iç değişken harfleri yüzünden byte-identical DEĞİL → script canlıya yazmayı reddeder (kırmızı çizgi). Canlı bundle olduğu gibi korunur; `apps/tasarim` düzenlenebilir kaynaktır.
  - **`sakinhayvan` (Hayvan) MONOREPO'DA — kullanıcının Mac kaynağı + temiz köprü.** Kaynak: `apps/hayvan/` (gerçek Sakin Hayvan uygulaması — 37 ts/tsx, ~11k satır: animals/stones/naguals içerikleri, tüm ekranlar, Supabase auth, IAP). GitHub'daki `cetinarda/sakinhayvan` canlı bundle'ı üretemiyordu (fazla sapmış); kullanıcı Mac'teki gerçek kaynağı verdi. Yapılanlar: (1) `metro.config.js` web'de `react-native-purchases`'i stub'lar → tek bundle (canlı yapı); (2) `react-dom` 19.1.0'a sabitlendi (19.2.6 ile React #527 uyumsuzluğu vardı); (3) `app.json`'a `experiments.baseUrl=/embedded/sakinhayvan` eklendi; (4) "tura"→"sakinHayvan" rename (`useSakinHayvanStore`, `@sakinhayvan_*` anahtarlar, "Sakin Hayvan" metinleri); (5) **temiz köprü:** `readSakinBridge()` (`src/store/useStore.ts`) `sakin_*` anahtarlarını SENKRON okur → onboarding element adımına atlar, eski `@tura_profile` preemptive-write hack'ine gerek yok. **Puppeteer ile doğrulandı:** köprü çalışıyor (bridged→element, plain→ad), runtime hatası yok. Yeni bundle canlıya gönderildi (`npm run build:hayvan -- --force`). Düzenleme: `apps/hayvan` → `npm run build:hayvan -- --force` (yeni bundle bilerek gönderilir; eski bundle git geçmişinde).
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
