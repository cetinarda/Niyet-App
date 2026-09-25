# Sakin / Niyet-App: Çalışma Kuralları (Claude için)

Bu dosya HER yeni Claude oturumunda otomatik okunur. Bu projenin kendine has kuralları:

## ⚠️ ALTIN KURALLAR

0. **Meta SDK (FacebookCore) ARTIK REPODA, Xcode'da elle ekleme YAPMA.**
   Paket referansı `ios/App/App.xcodeproj/project.pbxproj`'a kalıcı işlendi
   (XCRemoteSwiftPackageReference + product dependency + Frameworks fazı).
   **Neden gerekti:** kullanıcı Xcode'dan elle ekliyordu ama build komutundaki
   `git checkout -- project.pbxproj` satırı (Xcode'un imzalama kirliliğini
   temizlemek için ŞART) o referansı her seferinde siliyordu → her build'de
   `Unable to resolve module dependency: 'FacebookCore'` hatası dönüyordu.
   Ayrıca `AppDelegate.swift` `#if canImport(FacebookCore)` ile sarıldı: SDK
   bir şekilde bağlı değilse build KIRILMAZ, Meta olayları sessizce kapanır.
   `npx cap sync ios` pbxproj'a dokunmuyor (yalnızca CapApp-SPM/Package.swift'i
   üretiyor), o yüzden referans kalıcı.

1. **iOS build branch = `main`.** `claude/check-sakin-life-update-CIpM8` build branch'in eski adı; main ile birebir eşit tutuluyor (fast-forward). Kullanıcının Mac komutu hâlâ CIpM8'i çekiyor olabilir: değişiklik push'larken her iki branch'i de aynı SHA'da tut.
2. ✅ **Web Netlify production branch = `main` (Eyl 2026'da değiştirildi, kullanıcı onayladı).** Yani web değişikliğini main'e işlemek YETERLİ, ayrıca bir yere taşımana gerek yok. Aşağıdaki gdkpd anlatımı TARİHSEL, o dal artık canlı değil.
   ~~Eski: Web Netlify branch = `claude/fix-text-overlap-spacing-gdkpd`~~ (apartılmış: apps/ kaynak YOK, sadece `src/` + `public/embedded/` bundle + `netlify/`). Web'i etkileyen değişiklikleri buraya **main'den getirerek** işle (asla doğrudan özellik ekleme): `git checkout origin/main -- src/ public/embedded/...` (netlify/ + embed-patches/ KORUNUR), build-gate, push.
   - **BİRLEŞTİRME PLANI (TAMAMLANDI):** `main` zaten web-deploy-able (src + bundle + netlify backend + toml hepsi var). Kullanıcı Netlify production branch'ini `main` yaparsa gdkpd emekliye ayrılır → manuel main→gdkpd deploy (asıl drift kaynağı) biter. Web/iOS karışmaz: tek `src/App.jsx`, `isNative` ile runtime ayrışır; `ios/` (iOS-only) ve `netlify/` (web-only) ayrı klasör. Netlify değişene kadar gdkpd canlı kalır.
   - **ALTIN DİSİPLİN (bu oturumun acı dersi):** git proxy bazen bayat ref + sahte "pushed" döndürür; container reset yerel ağacı eski tabana düşürür. **Her push'u SHA değil İÇERİKLE doğrula** (re-fetch + `grep -c marker`). Branch+HEAD'i edit ÖNCESİ doğrula. Her milestone'da commit+push.
   - Portekizce dil kodu = **`pt`** (eski `pt-BR` değil; `sakin_lang` "pt" yazılır, embed'ler "pt" bekler). Legacy pt-BR i18n bloğu kaldırıldı.
2b. **🚨 ANDROID YAYIN KAPISI: R8 TESTİ GEÇMEDEN PLAY'E HİÇBİR ŞEY YÜKLENMEZ.**
   Kullanıcı Android sürümü göndermek istediğinde, mağaza komutundan ÖNCE bunu ver:
   ```
   cd ~/Desktop/Niyet-App && \
   git fetch origin claude/check-sakin-life-update-CIpM8 && \
   git reset --hard FETCH_HEAD && \
   bash scripts/android-release-test.sh
   ```
   Script: web bundle + `cap sync` + `assembleRelease` (R8 AÇIK) + cihaza kurulum +
   kurulanın DEBUGGABLE olmadığını doğrulama + uygulamayı başlatıp 15 sn izleme +
   crash tamponu kontrolü. PASS derse mağazaya gidilir, FAIL derse crash yığınını
   basar. Telefon USB'de ve USB hata ayıklama açık olmalı.
   - **NEDEN VAR (acı ders, Eyl 2026):** 1.4.0 versionCode **14 ve 15** test
     edilmeden Play'e gönderildi, İKİSİ DE açılışta çöktü, iki kez rollback
     gerekti. Kök sebep: R8 Capacitor çekirdeğini yeniden adlandırınca
     `@CapacitorPlugin` anotasyon zinciri kopuyor, `LocalNotificationsPlugin
     .requestPermissions` NPE atıyordu (bkz. `android/app/proguard-rules.pro`
     Capacitor bölümü). versionCode 16 ile düzeldi.
   - **"Android Studio'da çalışıyordu" HİÇBİR ŞEY KANITLAMAZ:** Run tuşu DEBUG
     derler, R8 debug'da HİÇ çalışmaz. Kullanıcı "test ettim" derse önce
     `adb shell dumpsys package com.sakin.app | grep pkgFlags` ile sor:
     `DEBUGGABLE` görünüyorsa yanlış sürüm test edilmiş demektir.
   - Script'in ürettiği APK debug anahtarıyla imzalıdır (keystore.properties
     yoksa, bkz. build.gradle), yani mağazaya YÜKLENEMEZ. Kasıtlı: test
     artefaktı kazara yayınlanamaz. Mağaza yüklemesi Android Studio >
     Generate Signed Bundle/APK ile yapılır.
   - **Sıra ŞU: script PASS → elle gezme → Generate Signed Bundle (AAB) →
     Play Console INTERNAL TESTING → oradan kur/dene → production'a terfi.**
     Doğrudan production'a çıkma; üç kez patladı, internal testing bedava sigorta.
   - Yüklenen her versionCode kalıcı yanar (bkz. kural #5): reddedilse de,
     çökse de, aynı numara bir daha kabul edilmez.

3. **Mac yol:** `~/Desktop/Niyet-App`. Build komutu (kullanıcı "terminal komutu ver"
   dediğinde SORMADAN bunu ver, iOS + Android birlikte):
   ```
   # iOS
   cd ~/Desktop/Niyet-App && \
   git fetch origin claude/check-sakin-life-update-CIpM8 && \
   git reset --hard FETCH_HEAD && \
   npm run build && npx cap sync ios && open ios/App/App.xcodeproj

   # Android (yalnızca son iki adım farklı)
   cd ~/Desktop/Niyet-App && \
   git fetch origin claude/check-sakin-life-update-CIpM8 && \
   git reset --hard FETCH_HEAD && \
   npm run build && npx cap sync android && npx cap open android
   ```
   **`fetch` + `reset --hard` NEDEN (İKİ ayrı hata, ikisi de yaşandı):**
   - **(1) "local changes would be overwritten":** Xcode `project.pbxproj`'u yerel
     imzalama ayarlarıyla (signing team vb.), `Info.plist`'i de kendi plist
     editörüyle (sıra değişir, elle yazılan `<!-- ... -->` yorumları silinir)
     kirletiyor. Commit edilmemiş bu değişiklikler `git pull`'u durduruyordu.
     Eski çözüm `git checkout -- <dosya>` idi ama **Xcode'da açılabilen HER dosya
     için tek tek keşfetmek gerekiyordu** (2 kez tekrarlandı: önce pbxproj, sonra
     Info.plist). `reset --hard` hepsini birden halleder, liste tutmaya gerek yok.
   - **(2) "Iraksak dallarınız var / divergent branches" (Ağu 2026):** Mac'teki
     yerel branch'te origin'de olmayan commit kalınca `git pull` hangi stratejiyle
     (merge/rebase/ff-only) birleştireceğini bilemeyip DURUYOR. `git checkout --`
     bu hatayı ÇÖZMEZ, farklı bir hata. `reset --hard` iraksamayı da bitirir.
   - **Güvenli:** Mac bir DERLEME makinesi, kaynak GitHub'da. `reset --hard`
     untracked dosyalara dokunmaz (`node_modules`, `dist` durur). Yine de kullanıcı
     Mac'te elle bir şey yazdıysa önce şunu çalıştırsın, boş çıkmalı:
     `git fetch origin <branch> && git log --oneline HEAD ^FETCH_HEAD`
   - **`git pull` KULLANMA**, `fetch` + `reset --hard FETCH_HEAD` kullan: pull
     yukarıdaki iki hatanın ikisine de açık.
4. **`public/latest-ios-version.json` ARTIK OTOMATİK: elle bump etme.**
   Bu dosya "mağazalarda CANLI olan sürüm"ü bildirir, repodaki sürümü değil.
   Uygulama açılışta okur; kendi `APP_VERSION`'ından büyükse "yeni sürüm var"
   banner'ı gösterir. **Elle bump edilmesi gerekiyordu ve UNUTULDU: 1.3.5 ve
   1.3.6 yayınlandığı hâlde dosya 1.3.4'te kaldı, kullanıcıların güncellemeden
   haberi olmadı.** Bu yüzden otomatikleştirildi:
   - `scripts/check-store-versions.mjs`: App Store + Play Store'u sorgular,
     sadece MAĞAZADA GÖRÜNEN sürümü yazar (repodaki sürümü asla referans almaz).
   - `.github/workflows/store-version-watch.yml`: her gün 09:00 UTC çalışır,
     değişiklik varsa main'e commit'ler ve **gdkpd'ye taşır** (banner sakin.life'tan
     okunduğu için web dalına gitmezse canlıya çıkmaz).
   - Elle çalıştırma: `node scripts/check-store-versions.mjs` · sadece rapor: `--check`
   - **Platform bazlı:** `ios` / `android` alanları ayrı (mağazalar farklı sürümde
     olabilir). Üst seviyedeki `version` = ikisinin KÜÇÜĞÜ, 1.3.6 ve öncesi
     istemciler için geriye uyumluluk: silme.
   - Elle SADECE sürüm notu yazmak için dokun (otomatik bump notları boşaltır,
     uygulama genel metne düşer).

5. **Sürüm 3 yerde aynı olmalı (bump anında):**
   - `ios/App/App.xcodeproj/project.pbxproj`: `MARKETING_VERSION` ve `CURRENT_PROJECT_VERSION` (her biri 2 occurrence)
   - `src/App.jsx`: `APP_VERSION` (~satır 14)
   - `android/app/build.gradle`: `versionCode` (artan tamsayı) ve `versionName`
   - **CANLI (Eyl 2026): App Store `1.4.0` · Play Store `1.4.0` (`public/latest-ios-version.json`).** 1.4.1 App Store incelemesinde (Eyl 2026). Repoda hazırlanan: `1.4.2 / build 1`, Android `versionCode 19` (deep link için; 1.4.2 görünür özellik eklemediğinden `WHATS_NEW.since = "1.4.1"`: 1.4.1 kartını görmüş olana tekrar çıkmaz). `latest-ios-version.json` otomatik, ELLE bump etme.
   - ⚠️ **Sürüm bump'ında `WHATS_NEW.version` (src/App.jsx) da AYNI değere çekilmeli**, eşleşmezse "Ne yeni" kartı hiç görünmez (bayat not koruması).
   - ⚠️ **Play Console'a bir kez yüklenen `versionCode` KALICI OLARAK yanar**: reddedilse,
     silinse, taslak olarak kalsa bile o sayı bir daha ASLA kullanılamaz ("sürüm X kullanıldı"
     hatası, 1.3.8'de yaşandı: versionCode 10 Play Console'a yüklendi, exact-alarm izni
     yüzünden hata aldı, manifest düzeltildi ama versionCode ARTIRILMADI → tekrar 10 ile
     yüklenmeye çalışıldı, reddedildi). **Kural: kullanıcı "Play Console'a yükledim/hata
     aldım" derse, bir sonraki düzeltmede versionCode'u SOR-MADAN otomatik +1 artır**
     (versionName aynı kalabilir, henüz yayınlanmadıysa, versionCode dahili sayaç,
     kullanıcı görmüyor). Bedelsiz bir önlem; artırmamanın bedeli tekrar red.
   - Canlı sürümü sorgulamak için: `node scripts/check-store-versions.mjs --check` (iki mağazayı da okur).
6. **`src/purchases.js`'e DOKUNMA.** IAP/para mantığı, Apple receipt validation. `992ab50` fix'inden sonra çok hassas. Bug bulursan _öner_, _push etme_.
   - **PREMIUM KARARI SUNUCUDA (istemci tahmin yürütmez).** İstemcinin
     `store.owned` ile iptal etmesi kaldırıldı: ödeme yapan kullanıcıyı
     düşürüyordu ("üyeliğim olduğu halde deneme sürümü açılıyor"). Kök sebep:
     `isEntitlementKnown()` yalnızca ürün META VERİSİNE bakıyor, `owned`'ı set
     eden makbuz zinciri AYRI ve daha yavaş.
     Artık: `netlify/functions/verify-entitlement.mjs` Apple App Store Server API
     + Google Play Developer API'ye sorar, kesin cevabı döner.
     `entitled` → dokunma · `not_entitled` → iptal · `unknown` → HİÇBİR ŞEY YAPMA.
     **Fonksiyon FAIL-SAFE:** kimlik yok / ağ hatası / env eksik / beklenmeyen
     yanıt → hepsi `unknown`. Asla `not_entitled` uydurmaz. İstemci de yalnızca
     `not_entitled`'da `revokeLocalPremium()` çağırır (App.jsx, 6 saat throttle).
     Env yoksa sistem sessizce devre dışı kalır → mevcut davranış (hiç iptal yok).
   - **Gerekli env (Netlify → Environment variables):**
     `APPLE_KEY_ID` `APPLE_ISSUER_ID` `APPLE_PRIVATE_KEY` (.p8 içeriği) `APPLE_BUNDLE_ID`
     `GOOGLE_SA_EMAIL` `GOOGLE_SA_KEY` `ANDROID_PACKAGE`
7. **App Store onayını riske atan değişiklikler için onay al:**
   - `ios/App/App/Info.plist` (özellikle `UIBackgroundModes`)
   - `ios/App/App/AppDelegate.swift` (AVAudioSession vb.)

8. **UZUN ÇİZGİ (em dash) ASLA KULLANMA. Her yerde: sohbet, kod, commit,
   mağaza notları, kullanıcıya hazırlanan metinler (WhatsApp, sosyal medya,
   e-posta), dosyalar.** Yasak karakterler: `—` (em dash U+2014), `–` (en dash
   U+2013), `―` (yatay çizgi U+2015). Sebep: kullanıcı isteği, metnin AI
   ürünü olduğu belli olmasın. Yerine düz kısa çizgi `-`, iki nokta, virgül,
   parantez veya ayrı cümle kullan. Bu kural mevcut kod tabanındaki temizlikten
   (bkz. Tasks #1-12) DAHA GENEL: sadece i18n değil, ürettiğin HER metin.

1. **Ek istek/soru geldiğinde işi BIRAKMA, sıraya al.** Önce o an üzerinde çalıştığın işlemi bitir, sonra yeni isteği/soruyu ele al. İş ortasında dosya/branch yarım bırakma.
2. **Soru sormak ≠ "dur".** Kullanıcı iş ortasında soru sorarsa: soruyu sıraya al, mevcut işi tamamla, **sonra** yanıtla. Sadece kullanıcı açıkça **"dur"** derse durdur.
3. **Sürüm notları KISA olsun: 1-2 cümle, sadece en öne çıkanlar.** Hem mağaza
   notları hem uygulama içi "Ne yeni" kartı. Madde madde uzun liste İSTEMİYOR;
   kullanıcı okumadan geçiyor. Değişen her şeyi saymak yerine o sürümün
   "başlığı" ne ise onu söyle.
4. **Bariz kapsam kararlarını sorma, ver.** (ör. "taşlar uygulamasında tabii ki taş olacak.") Gerçekten belirsizse veya geri-dönüşü zorsa sor; aksi halde mantıklı varsayımla ilerle ve ne yaptığını kısaca söyle.
4b. **Mantıksız/hatalı bulduğun bir istek gelirse sessizce uygulama, itiraz et.** Kullanıcı bir değişiklik isterse ve bu teknik olarak yanlış, riskli (App Store reddi, veri kaybı, güvenlik) ya da ürün açısından anlamsız görünüyorsa, önce neden sorun gördüğünü kısaca söyle ve alternatif öner. Kullanıcı ısrar ederse (açıkça "yine de yap" derse) uygula. Körü körüne "tamam" deyip yapmak yanlış davranış.
5. **Hassas alanlar (IAP/`purchases.js`, Info.plist, AppDelegate): önce öner + diff göster, onay ve sandbox testi olmadan deploy etme.** (Altın kural #5-#6 ile aynı çizgi.)
6. **SÜRÜM YAYINI OTOMASYONU (kullanıcı isteği).** Kullanıcı yeni sürüm istediğinde
   (bump yapıldıktan sonra) OTOMATİK olarak şu üçünü ver, sormadan:
   a) **App Store Connect notu** (İngilizce, "What's New" alanına, kısa).
   b) **Kullanıcı için en kısa/basit yenilikler notu, 7 dilde** (tr/en/de/es/pt/fr/ja),
      genelde `WHATS_NEW` içeriğinin özü. Mağaza notu bu, uzun liste değil.
   c) **iOS + Android terminal build/indirme komutları** (Mac yol: `~/Desktop/Niyet-App`;
      iOS için CLAUDE.md altın kural #3'teki komut, Android için `npx cap sync android`).
   Kural #3 (kısa tut) burada da geçerli.
7. **BUTON/KART BOYUT + HİZALAMA (kullanıcı isteği: "her zaman dikkat et").**
   Butonlarda ve kartlarda HER ZAMAN kontrol et: boyut abartılı büyük olmasın,
   içindeki ikon + yazı hem yatay hem dikey ORTALI ve birbiriyle hizalı olsun.
   - **iOS WKWebView tuzağı:** `<button>` elemanı `appearance:none` +
     `WebkitAppearance:none` OLMADAN native buton görünümü çizer → şişer,
     içerik kayar. Chromium'da düzgün görünür ama iOS'ta bozuk. Tıklanabilir
     kart/buton yapıyorsan bu ikisini MUTLAKA ekle.
   - **Hizalama:** çok elemanlı kart için `display:flex; flex-direction:column;
     align-items:center; justify-content:center; gap:...` kullan (tek tek
     `marginBottom` yerine). Yan yana kartlarda satıra `align-items:stretch`
     (varsayılan) + kartlara flex-column-center → eşit yükseklik + dikey ortalı.
   - **Boyut:** açıklama metinleri kısa ve iki kartta DENGELİ (eşit satır) olsun;
     uzun/asimetrik metin kartları büyütüp hizayı bozar.
   - **Doğrulama:** yeni buton/kart eklediğinde gerçek boyutta (390x844 ve dar
     bir ekran) Puppeteer screenshot ile GÖRSEL kontrol et, sadece build yeşil
     yeterli değil.

## Mimari

- **Tek React kod tabanı.** `src/App.jsx` ~6300 satır. `const isNative = Capacitor.isNativePlatform()` (App.jsx:10) iOS vs web'i ayırır.
- **iOS = Capacitor + Swift Package Manager.** Podfile YOK, `pod install` ÇALIŞTIRMA. Çıktı `ios/App/App.xcodeproj/`.
- **Web = Vite → Netlify.** `npm run build` → `dist/`. Netlify deploy branch ayrı (yukarı bak).
- **Embedded apps:** `public/embedded/{humandesign, sakinhayvan, sakinmitler, soulprofile}/`. Hepsi **DERLENMIŞ Expo bundle'ları** (`_expo/static/js/...`): bunlar ÜRETİLEN çıktı, elle düzenleme.
  - **`sakinmitler` ARTIK MONOREPO'DA.** Kaynak: `apps/mitler/` (tam Expo + RN projesi). Değişiklik orada yapılır, sonra `npm run build:mitler` (= `node scripts/build-embed.mjs mitler`) bundle'ı yeniden üretip `public/embedded/sakinmitler/`'a senkron eder. Pipeline: `expo export` → index.html'e scroll-override `<style>` enjekte → mirror. `npm run build:mitler -- --check` byte-identical doğrular. Eski `cetinarda/sakinmitler` GitHub reposu artık ÖLÜ (kaynak buraya taşındı, patch dosyası silindi, git geçmişinde).
  - **`humandesign` (Tasarım) MONOREPO'DA: davranışsal özdeş reconstruction.** Kaynak: `apps/tasarim/`. GitHub'daki `cetinarda/humandesign` (`claude/human-design-app-i8Hh9` branch) + `embed-patches/humandesign-host-bridge.patch` canlı bundle'ı TAM üretmiyordu: canlıda `initialTab` (host'un belirli sekme açması) + ProfileScreen `bridgePrefill` (doğum bilgisi prefill) özellikleri vardı ama hiç commit edilmemişti. Canlı bundle referans alınarak `TabNavigator.tsx` (byte-identical) + `ProfileScreen.tsx` (yapısal/davranışsal özdeş) yeniden yazıldı. `npm run build:tasarim` minifier iç değişken harfleri yüzünden byte-identical DEĞİL → script canlıya yazmayı reddeder (kırmızı çizgi). Canlı bundle olduğu gibi korunur; `apps/tasarim` düzenlenebilir kaynaktır.
  - **`sakinhayvan` (Hayvan) MONOREPO'DA: kullanıcının Mac kaynağı + temiz köprü.** Kaynak: `apps/hayvan/` (gerçek Sakin Hayvan uygulaması: 37 ts/tsx, ~11k satır: animals/stones/naguals içerikleri, tüm ekranlar, Supabase auth, IAP). GitHub'daki `cetinarda/sakinhayvan` canlı bundle'ı üretemiyordu (fazla sapmış); kullanıcı Mac'teki gerçek kaynağı verdi. Yapılanlar: (1) `metro.config.js` web'de `react-native-purchases`'i stub'lar → tek bundle (canlı yapı); (2) `react-dom` 19.1.0'a sabitlendi (19.2.6 ile React #527 uyumsuzluğu vardı); (3) `app.json`'a `experiments.baseUrl=/embedded/sakinhayvan` eklendi; (4) "tura"→"sakinHayvan" rename (`useSakinHayvanStore`, `@sakinhayvan_*` anahtarlar, "Sakin Hayvan" metinleri); (5) **temiz köprü:** `readSakinBridge()` (`src/store/useStore.ts`) `sakin_*` anahtarlarını SENKRON okur → onboarding element adımına atlar, eski `@tura_profile` preemptive-write hack'ine gerek yok. **Puppeteer ile doğrulandı:** köprü çalışıyor (bridged→element, plain→ad), runtime hatası yok. Yeni bundle canlıya gönderildi (`npm run build:hayvan -- --force`). Düzenleme: `apps/hayvan` → `npm run build:hayvan -- --force` (yeni bundle bilerek gönderilir; eski bundle git geçmişinde).
  - **`soulid` (SoulID) MONOREPO'DA: Next.js, diğerlerinden FARKLI.** Kaynak: `apps/soulid/` (Next.js 14 + Capacitor; Expo DEĞİL). `build-embed.mjs` bu app'i BİLMİYOR (Expo'ya özel). `npm install` gerekir (node_modules repoda yok).
    - ⚠️ **EMBED BUILD KOMUTU (3 env de ŞART, eksiği sessizce bozuk bundle üretir):**
      ```
      cd apps/soulid && ALLOW_MISSING_IAP=1 NEXT_PUBLIC_FREE_MODE=1 \
        NEXT_PUBLIC_EMBED_BASE=/embedded/soulid npm run build:ios
      cp -R out/. ../../public/embedded/soulid/     # once rm -rf ile temizle
      ```
      **`NEXT_PUBLIC_EMBED_BASE` UNUTULURSA:** varlıklar `/_next/...` diye KÖKTEN istenir, Sakin'de 404 → sayfa CSS'siz çıplak HTML açılır, gezinme kök dizine gider (yaşandı, kullanıcı bildirdi). Bu env `basePath`+`assetPrefix`i, `lib/nav.ts` link önekini, layout ikon/manifest yollarını ve `lib/api-base.ts`in uzak-host kararını birden ayarlar.
    - **Statik export API route içeremez:** `scripts/build-capacitor.mjs` build sırasında `app/api`'yi geçici taşır. Naif `next build` KULLANMA.
    - **AI çağrıları uzak backend'e gider** (`lib/api-base.ts` → `https://soulprofile.life`), anahtarlar istemciye sızmaz.
    - ⚠️ **DİL: SoulID yalnızca `tr` + `en` (kullanıcı kararı, "şimdilik 2 dil kalsın").** `lib/i18n/store.ts` → `Locale = 'tr' | 'en'`. Sakin'in 7 dil kuralı BURAYA UYGULANMAZ, eksik çeviri sanıp 7'ye çıkarma. Sakin tarafındaki SoulID KART metinleri (`ailesi_soulid_*`, `badge_new`) 7 dilde, o ayrı.
    - **Bağlanma Stili** (`lib/attachment/`): 16 soru → kaygı × kaçınma → 4 stil. **KIRMIZI ÇİZGİ:** stil yalnızca yanıtlardan çıkar; doğum haritası stili BELİRLEMEZ, sadece önerileri kişiselleştirir (`chart-lens.ts` başındaki nota bak).
    - ⚠️ **SAYI AİLESİ = TEK KAYNAK `apps/soulid/lib/numerology/families.ts`** (1-5-7 Arayanlar · 2-4-8 Kurucular · 3-6-9 Işıklar). Kullanıcı bildirdi: karne "5-7", Galaktik Kimlik "Kurucular 1-4-7" diyordu; `sakin-summary.ts` mod-3 düzlemlerini (1-4-7/2-5-8/3-6-9) ayrıca uydurmuştu. Artık karne (`outlook.ts`) + özet aynı dosyadan okur. Host (`src/App.jsx` `numberFamilyLabel`) etiketi özetten değil SAYIDAN 7 dilde hesaplar (özet yalnızca karne açılınca yenilendiği için telefonda eski etiket saklı kalabiliyordu). Üçlüyü değiştirirsen İKİ yeri de değiştir.
    - ⚠️ **RUH PROFİLİ ÖZETİ (`sakin_soul_summary`) = Galaktik Kimlik kartının
      "güzel hali" (ırk satırı + sayı ailesi/arketip/geliş sebebi/güçlü yön).**
      Eyl 2026 regresyonu: özet yalnızca karne (/report) açılınca yazılıyordu,
      15 Eyl'de SoulID'nin ilk açılışı profil sayfasına alınınca karneye girmeyen
      kullanıcıda özet HİÇ oluşmadı, kart eski düzene düştü. Artık özet
      `lib/store.ts` `setReport` içinde (her yükleme yolu) + köprü (`sakin-bridge`)
      rapor kurunca yazılıyor. Host tarafında: kart açılıp özet yoksa SoulID
      görünmez bir iframe'de bir kez yüklenir (`soulWarm`, 25 sn tavan), köprü
      özeti yazar, kart ~1 sn'de dolar. Özeti yazan yeri değiştirirsen bu zinciri
      bozma.
    - **Yıldız ırkı tıklanır → sözlük:** karttaki ırk satırı `setKilavuzQ(race)` ile
      sözlüğü açar; `src/glossary-starseed.js` maddeleri `key` = SoulID'nin Türkçe
      ırk adı (her dilde aynı), sözlük tam `key` eşleşmesinde yalnızca o maddeyi
      gösterir. Irk adı `apps/soulid/lib/galactic/index.ts`'te değişirse key'leri de
      değiştir. İçerik starseed geleneğinin İNANÇ anlatısı ("inanılır/anlatılır"),
      giriş maddesi bunu açıkça söylüyor; bilimsel iddia gibi yazma.
    - ⚠️ **`main` animasyonu `backwards` OLMALI (`app/globals.css`), `both` DEĞİL:**
      `both` bittikten sonra main'de transform bırakıyor, içindeki TÜM
      `position:fixed` modalları (kavram kartları, 3B gezegen) sayfaya göre
      yerleştirip ekran dışına atıyordu ("detaylar için tıkla boş kalıyor").
    - **Yıldız Kökeni detayı** `lib/galactic/lore.ts` (Sakin sözlüğü
      `src/glossary-starseed.js` tr/en kopyası; biri değişirse diğeri de).
    - **Kahraman kartında Human Design rozeti YOK** (kullanıcı: "burada HD bilgisi
      vermeyeceğiz, burası SoulID"). Karnedeki "Enerji Profili" kartı duruyor.
    - `?go=attachment` hem `target()`'ta hem doğrudan yönlendirmede olmalı:
      telefonda köprü/karne hidrasyonu da `target()`'a gidiyor, yoksa /profil'e düşer.
    - **Keşfet giriş kapısı:** `SOULID_PREMIUM_GATE` (App.jsx başı) şu an `false` = herkese ücretsiz + "Yeni" rozeti. `true` yapmak kilidi ve Premium rozetini geri getirir (tek satır).
    - ⚠️ **TEK MERKEZ = Niyet-App (kullanıcı kararı: "soulid reposunu unut").** `cetinarda/SoulProfile` reposu ve soulprofile.life sitesi ARTIK TAKİP EDİLMİYOR. Tüm SoulID geliştirmesi `apps/soulid` içinde yapılır, `public/embedded/soulid/`'e derlenir, sakin.life'tan yayınlanır. Sebep: iki yeri elle senkron tutmak main↔gdkpd ayrışmasının aynısını doğuruyordu; ayrıca bu oturumun git erişimi yalnızca niyet-app'e yetkili (SoulProfile'a push proxy tarafından reddediliyor).
    - **Bağlanma testinin paylaşılabilir adresi:** `sakin.life/baglanma` (EN girişi `/attachment`). `netlify.toml` bunu `/embedded/soulid/attachment/`'a **301** ile yollar. **200 rewrite KULLANMA:** embed `basePath=/embedded/soulid` ile derlendiği için farklı bir yolda Next istemci router'ı yolu eşleştiremez, hydration/gezinme bozulur. Adres uygulama içinde `TEST_URL` (app/attachment/page.tsx) + hikâye görselinde yazılı; değiştirirsen ikisini de güncelle.
  - **GÜNÜN SÖZÜ = HER KAYNAK EŞİT ŞANS (Eyl 2026, kullanıcı: "Yunus Emre, Aşık
    Veysel çok çıkıyor; Schopenhauer, Jung... eşit ağırlıkta olsun").** Kaynak havuz
    (`apps/*/src/data/quotes.json`, 156 söz) çok dengesiz: 64'ü Mevlana. Eski
    `buildQuotePool` kaynak başına 8 söz + Yunus'u bilerek %25 yapıyordu. Artık
    `apps/{bitkiler,taslar,hayvan}/src/utils/quotePool.ts` (üçü BİREBİR aynı) her
    grubu havuzda eşit yer kaplatır (12 grup, ~%8,3). Küçük gelenekler ailesine
    katılır: Dhammapada/Zen → Buddha, Zhuangzi → Laozi, Seneca/Marcus → Epiktetos.
    Host İçsel Harita aynı kuralı `src/quotes-data.js` `pickBalancedQuote` ile
    uygular. Mitler'de kişi kaynaklı söz havuzu YOK (kartın kendi dersi/olumlaması).
    O gün zaten çekilmiş okuma değişmez, yeni denge ertesi günden görünür.
  - **Bitkiler / Taşlar / Hayvan kaynağı canlı paketi BİREBİR üretir** (Eyl 2026,
    `diff -rq apps/<app>/dist public/embedded/<dir>` boş çıktı). ⚠️ `build-embed.mjs`
    "byte-identical" mesajı YALNIZCA dizindeki İLK .js dosyasına (çoğu zaman
    `empty-module-*.js`) bakıyor, asıl `index-*.js` farkını görmez. Doğrulamayı
    `diff -rq` ile yap. Derlemek için önce `npm ci` (node_modules repoda yok).
  - **`build-embed.mjs` kırmızı-çizgi-güvenli:** default mod byte-identical değilse `public/`'e YAZMAZ. Bilerek yeni bundle göndermek için `--force`. `--check` sadece doğrular.
  - Stil davranışı için (taşınmamışlarda) host'tan CSS injection ile müdahale: App.jsx'deki iframe `onLoad` içine bak.
- **Embedded ↔ host köprüsü:** `postMessage` ile (`sakin-premium-cta` mesajı vs). `storage` event köprüsü web-only, iOS'ta çalışmaz.
- **Şehir veritabanı:** `CITY_DB` + `SmartCityInput` bileşeni. `<datalist>` iOS WKWebView'da çalışmaz: özel dropdown kullanılıyor.
- **Astroloji:** `preciseAscendant` lat/lon + `effectiveUtcOffset()` kullanır. Doğum şehri zorunlu yükselen burç için.
  - **`effectiveUtcOffset` = Türkiye'nin TARİHSEL saat dilimi** (tz database Europe/Istanbul ile birebir). `CITY_DB` tüm TR illerini +3 saklar ama Türkiye 8 Eyl 2016'ya kadar kışın +2'ydi. Dönemler: 2016+ kalıcı +3 · 1996-2016 DST Mart→**Ekim** son Pazar · 1986-1995 DST Mart→**EYLÜL** son Pazar (1994 başlangıcı 20 Mart) · 29 Haz 1978 - 1 Kas 1984 **standart +3** (1983'te DST ile +4) · 1973-1978 düzensiz tarihler tabloda.
  - ⚠️ **1 saatlik offset hatası yükseleni 1 burç kaydırır.** Eski kod DST bitişini her yıl "Ekim son Pazar" sanıyordu → 1986-1995 Ekim başı doğumları yanlış çıkıyordu (19.10.1992 19:45 İstanbul → Boğa 29° yerine doğrusu İkizler 16°). Bu fonksiyona dokunurken tz-db'ye karşı doğrula.
  - Geçişler gün hassasiyetinde: geçiş **gününde** 00:00-04:00 doğumlar 1 saat şaşabilir (yılda 2 gün, bilinen sınır).

## 📱 WEB → NATIVE TAŞIMA LİSTESİ — ✅ TAMAMLANDI (kullanıcı: "1- yap")

UX yeniden yapılandırması eskiden SADECE WEB'deydi (`!isNative` ile kapılı),
native (iOS/Android) mağazadaki eski düzeni koruyordu. Kullanıcı "1- yap" dedi,
8 madde de `src/App.jsx`'te uygulandı: `isNative` koşulları kaldırıldı/çevrildi,
her platformda TEK bir davranış kaldı.

**⚠️ BU OTURUMUN SINIRI: GERÇEK CİHAZDA TEST EDİLEMEDİ.** Uzaktan/headless
ortamda çalışıldığı için doğrulama `window.webkit.messageHandlers.bridge`
enjekte edip `Capacitor.getPlatform()`'u "ios" döndürmeye zorlayan bir
Puppeteer sahte-native testiyle yapıldı (8 maddenin 7'si doğrudan gözlendi,
madde 7 zaten koşulsuzdu). Sonuç hepsinde doğruydu ama bu GERÇEK CİHAZ TESTİNİN
YERİNE GEÇMEZ: dokunma/haptic hissi, gerçek çentik/safe-area ölçüleri,
gerçek Capacitor plugin davranışı (StatusBar/SplashScreen/Haptics burada
"plugin not implemented" uyarısı verdi, sahte köprüde gerçek native yok)
denenmedi. **Bir sonraki iOS/Android build'inde bu 8 maddeyi cihazda gözden
geçir**, özellikle: alt bar dokunma hedefleri, üst adım şeridinin parmakla
kaydırılması, Keşfet'in tam ekran hissi.

1. ✅ **Giriş ekranı:** dil seçici sağ üst · HAZIRIM tam genişlik · panik
   butonu HAZIRIM altında "Nefes al" olarak. Eski sağ-alt rozet silindi.
2. ✅ **Alt bar:** Bağlan · Keşfet · Bugün · Ayna · Ben (5 sekme, her ekranda
   sabit). Eski 6'lı adım barı (`NAV`/`NAV_STEPS` ile beslenen blok) silindi.
3. ✅ **Üst adım şeridi:** her platformda `stepStripVisible`. Eski nokta
   göstergesi (progress-strip) silindi, onu besleyen `NAV_STEPS`/
   `currentStepIndex` de öksüz kaldığı için kaldırıldı.
4. ✅ **Üst bar:** `topControlsVisible = activeTab === "ben"`, koşulsuz.
5. ✅ **Keşfet:** her platformda tam ekran (zIndex 9990, düz #000 zemin,
   dışına tıklayınca kapanmaz), alt bar üstte kalır.
6. ✅ **Ayarlar sayfası:** ☰/⚙ butonu artık HER PLATFORMDA doğrudan
   `setScreen("ayarlar")`. Eski native-only açılır menü (`showTopMenu` state'i
   + `createPortal` bloğu + `menuItems`) TAMAMEN SİLİNDİ: Ayarlar sayfası zaten
   Restore/Manage Subscription/tema/Terimler/Yolculuk hepsini içeriyordu.
7. ✅ Zaten koşulsuzdu, değişiklik gerekmedi.
8. ✅ **Keşfet/Bağlan geri okları** her platformda kaldırıldı.

**BİLEREK DOKUNULMAYAN, taşıma listesinde OLMAYAN `isNative` dallar** (yanlışlıkla
atlanmadı, açıkça kapsam dışı):
- Keşfet panelinin altındaki politika linkleri + analitik + hesap silme bloğu
  (App Store 5.1.1(v)). Artık Ayarlar'da BİREBİR aynısı var (GENEL/GİZLİLİK/
  YASAL/HESAP grupları, doğrulandı) ve teknik olarak fazlalık, ama yasal açıdan
  hassas kodu cihaz testi olmadan tek geçişte silmek riskliydi. Kaldırmak
  istenirse: `showAilesi` panelinin altındaki `{isNative && (<>...` bloğu.
- `topNavVisible` (marka "← Sakin" + dil + politika linkleri üst şeridi):
  web'de HER ekranda görünür, native'de hâlâ yalnızca policy/giriş ekranlarında.
  8 maddenin hiçbiri bunu istemedi, dokunulmadı.
- Floating kırmızı "?" yardım balonu: hâlâ SADECE NATIVE (ayrı, önceki bir
  karardı — web'de Terimler ☰'e taşınmıştı). 8 maddede yoktu, dokunulmadı.
- IAP/pricing ekranındaki native-web ayrımları, `AVAudioSession`/silence-loop,
  StatusBar/SplashScreen/Haptics/TTS, analytics platform etiketi, "Telefonunda
  yanında taşı" App/Play Store rozetleri (native'de zaten kurulu, anlamsız
  olurdu): hepsi platform YETENEĞİ, UX tercihi değil, dokunulmadı.

**✅ ÇÖZÜLDÜ (1.3.9, madde 6'dan önce eklenmişti): mağaza için eksik olan iki
madde.** "Satın Alımları Geri Yükle" (3.1.1) ve "Aboneliği yönet" (3.1.2)
önce ☰ açılır menüsüne kondu, madde 6 ile o menü tamamen kalktığı için artık
YALNIZCA Ayarlar'ın GENEL > ÖDEME grubunda duruyorlar (tekrar yok).

## 🌱 YENİ KULLANICI MODU (ilk 3 tünel) - kullanıcı kararı, Eyl 2026

Dış UX raporunun önerileri **herkese değil, YALNIZCA yeni kullanıcıya** uygulandı
("test gibi olsun"). Kapı tek bir bayrak: `isEarlyTunnel` (src/App.jsx).

**Kapının tanımı ÖNEMLİ:** `tunnelsBeforeToday < 3`, yani BUGÜN tamamlanan tünel
SAYILMAZ (`streakData.lastDate === todayKey` ise 1 düşülür).
⚠️ Neden: eskiden düz `totalTunnels < 3` idi. 3. tünel tamamlandığı ANDA sayaç
3'e çıkıp deneme o saniye bitiyordu; kullanıcı bağlantıyı bitirdiği anda adımlar
3'ten 7'ye fırlıyor, yüzde geri düşüyor, jenerik içerik kilitleniyordu. Yani
"az önce yaptığım şey geri alındı" hissi. Artık geçiş GÜN SINIRINDA olur.

İlk 3 tünelde geçerli olan dört şey:
1. **Günlük yük 3 adım** (`EARLY_MANDALA_STEPS = ["sabah","nefes","rehber"]`),
   normalde 7 (`ALL_MANDALA_STEPS`). Kalan 4 adım SİLİNMEZ, Bağlan ekranının
   katlanır bölümünde "Dilersen devam et" başlığı altında durur ve yapılabilir,
   sadece bağlantının ŞARTI değildir. Omurga görselinde de 3 düğüm çizilir
   (7 düğüm + "/3" sayacı çelişkisi olmasın diye).
   - ⚠️ **AYNA ADIMI GÜNCEL (Eyl 2026, kullanıcı kararı):** `rehber` adımı artık
     Ayna'ya SORU SORUP CEVAP ALINCA tamamlanır (`generateSikayetAnaliz` başarı
     yolunda `markStep("rehber")`). Eskiden ekrana girmek yetiyordu; Android
     kullanıcısı "yanlışlıkla dokununca Ayna tiklendi" dedi. Bilinen bedel
     (kullanıcıya söylendi, kabul etti): Ayna sorusu doğum bilgisi ister, doğum
     girmemiş yeni kullanıcı ilk 3 adımlık bağlantıyı tamamlayamaz.
     **Kullanıcı anlasın diye (`AYNA_STEP_TXT`, 7 dil):** Bağlan'daki çip
     tamamlanmamışken "Ayna'ya bir soru" der (tamamlanınca "* İçsel Ayna"); Ayna
     ekranında başlığın altında "Bugün Ayna'ya bir soru sor, Bağlan ekranındaki
     Ayna adımın tamamlansın", cevaptan sonra "✓ Bugünkü Ayna adımın tamamlandı".
   - **Bu üçü neden:** üçü de günün her saatinde bitirilebiliyor. Dışarıda
     bırakılanlar: `aksam` (22:00'den önce açılmıyor, sabah kurulan kullanıcı
     ilk günü kapatamazdı), `gun` (görev AI'dan geliyor, ağ/limit hatası adımı
     tıkayabilir), `ses`/`chakra` (süre şartı var).
2. ~~Jenerik içerik yalnızca denemede açık~~ **ARTIK KALICI ÜCRETSİZ, HERKESE**
   (kullanıcı kararı, Eyl 2026: "Bağlan'da kelimeler, gün içi yapılacaklar,
   nefes, ses, çakra temel 7 tamamen ücretsiz olsun"). `genericUnlocked = true`,
   `genericTrial = false` (deneme şeridi `TRIAL_TXT` artık görünmez), kelime
   ekranındaki "kilidini aç" butonu kaldırıldı. Çakrada YALNIZCA 7 temel çakra
   (level 1) ücretsiz, 2-3. seviyedeki 15 çakra premium KALIR. Gün görevlerinde
   zaten kilit yoktu. Kilidi geri getirmek istenirse tek satır: `genericUnlocked`.
3. **Yol seçimi ekranı** ("Hangi yoldan gidelim?": sakinleşmek / kendimi tanımak)
   yalnızca burada çıkar. ⚠️ ÖNCEDEN HER GÜN, SONSUZA KADAR çıkıyordu
   ("bir daha gösterme" seçeneği de kaldırılmıştı, kimse kapatamıyordu).
   **İLK 3 AÇILIŞ (Eyl 2026, kullanıcı: "bir yolu seçen diğerini merak eder"):**
   `sakin_open_count` açılışları sayar (soğuk açılış + 30 dk'dan uzun arka
   plandan dönüş). Yol seçimi ilk 3 açılışta çıkar: girişte HAZIRIM'dan, aynı
   gün tekrar açılışta doğrudan ana sekmede (`nedirEligible`). İki yol da
   denenmişse çıkmaz; biri denenmişse diğer kartta "Henüz denemedin" işareti.
   **EKRAN YENİDEN TASARLANDI (Eyl 2026):** eski tasarım çizgileri ÖLÇÜLEN
   ekran boyutundan piksel hesabıyla bağlıyordu, iOS'ta çizgiler kartların
   içinden geçti. Artık SURF kartlar + KURUMSAL FONT Jost (başlık Jost 300 geniş aralık, kart adları Jost 500; kullanıcı: "Keşfet'teki kurumsal font, bizim fontumuz o", serif Cormorant kaldırıldı) ve
   ölçüme bağlı HİÇBİR şey yok: süs çizgisi kartların üstünde normal akışta
   duran SVG (uçlar yüzde ile iki sütunun ortasına iner). Mutlak konum ekleme.
4. `STEP_MIN` zaten yarıya iniyordu (5 nefes / 30 sn / 60 sn / 1 görev).

**⚠️ DENEYİMLİ KULLANICIYA HİÇBİR ŞEY DEĞİŞMEDİ.** `steps` dizisi, omurga
düğümlerinin sırası, 7. düğümün `harita` olması dahil her şey aynı bırakıldı.
Bir şeyi bozup bozmadığını anlamak için önce `isEarlyTunnel` false ile dene.

**Herkes için değişen iki şey (deneme kapsamı dışı, kalite düzeltmesi):**
- İnsan silueti opaklığı 0.08-0.20 → 0.26-0.42. Ana metafor görünmüyordu,
  mağaza ekran görüntüsü boş siyah kare gibiydi.
- Okunması gereken gövde metinlerinde kontrast (`#555/#666` → `#8e8e99`,
  omurga adım etiketi 0.15 → 0.40). Dekoratif eyebrow/etiketler BİLEREK
  dokunulmadı: karanlık ve sönük dil bilinçli bir tercih, kural "okunacak
  metin okunur olsun", "her şey parlasın" değil.

**ZATEN VARDI, YENİDEN YAPMA:** yol seçimi ekranı (çatallı onboarding,
`onbPath` "baglan"/"kesfet"), evrim rozetleri açıklaması (Tohum/Fide/Ağaç
altında "3 gün / 7 gün / 21 gün" yazıyor + Yolculuk sekmesinde anlatılıyor),
kırmızı "?" balonu (kaldırılmış), 6'lı adım barı (kaldırılmış).

## 🌿 EVRİM + ORKESTRA - kullanıcı isteği: "zeki ve eğlenceli olsun"

⚠️ **Evrim bitkisi Ben ekranında, ORKESTRA kartı artık BUGÜN ekranında** (Eyl 2026 taşındı, bkz. Bugün bölümü). Aşağıdaki orkestra notları mantık olarak geçerli.

**AŞAMALAR DÖRT: TOHUM → FİDAN → AĞAÇ → ORMAN** (kullanıcı kararı).
Eşikler aşamanın BAŞLADIĞI gün: 0 / 3 / 7 / 21. ⚠️ İlk halinde eşikler
"ulaşılan gün" diye yazılmıştı (Tohum=3) ve 3 günden önce hiçbir aşamada
sayılmıyordun; 1. günde ekran "TOHUM 1 gün" derken altında "Sıradaki: Tohum"
yazıyordu, yani zaten olduğun şey sıradaki gibi gösteriliyordu. Şimdi herkes
0. günde TOHUM olur ve "sıradaki" her zaman gerçekten bir SONRAKİ aşama.
Türkçe "Fide" → "Fidan" (kullanıcı tercihi, `evo_sapling`). "Orman" 7 dilde
`EVO2_TXT.forest` içinde. Orman aşamasında ana ağacın yanına iki küçük ağaç
çizilir, yoksa "orman" adıyla tek ağaç görmek tutarsız kalıyordu.
⚠️ **Yolculuk sekmesindeki SEVİYE satırları artık bitki adı KULLANMIYOR**
(sadece 1/2/3 numarası): seviye/çarpan sistemi (x1/x2/x4, 7 ve 21 gün) büyüme
aşamasından AYRI bir eksen ve dört aşamaya geçince "Ağaç = 3. Seviye, 21 gün"
diye çelişiyordu.

**Evrim göstergesi artık ÜÇ KUTU DEĞİL, TEK BİR BİTKİ.** `plantSVG(p, hue, size)`
parametrik çizim: `p` (0..1, `min(1, gunSerisi/21)`) büyüdükçe gövde uzuyor,
yaprak çiftleri sırayla AÇILIYOR (belirmiyor, yavaşça büyüyor) ve son üçte birde
taç çıkıyor. `.sakin-plant` sınıfı nefes gibi salındırıyor (6 sn, dibinden).
- ⚠️ **Neden değişti:** eski üç kutu "ulaşıldı / ulaşılmadı" ikilisiydi. 4.
  gününde olan kullanıcı HİÇBİR değişiklik görmüyordu, bir sonraki sıçrama 7.
  gündeydi. Artık her gün gözle görülür bir fark var; altındaki ince çubuk da
  aşama içi ilerlemeyi gösteriyor.
- **Renk kişiye özel:** `sakin_element_dist`teki BASKIN elementten geliyor
  (`PLANT_HUES`: ates/toprak/hava/su). Herkeste aynı yeşil değil.
- ⚠️ **`streakLevel` matematiği DEĞİŞMEDİ** (x1/x2/x4, 7 ve 21 gün eşikli).
  Yalnızca GÖSTERİM değişti. `badges` dizisindeki 40 hâlâ görsel karşılığı
  olmayan ölü veri; 4. aşama ("Orman") eklenirse seviye/çarpan matematiğine de
  karar vermek gerekir, o yüzden şimdilik eklenmedi.
- **Kutu genişliği sayfadaki diğer kartlarla AYNI (tam genişlik).**
  ⚠️ Bir ara `maxWidth:300` ile daraltılmıştı, YANLIŞ ANLAMAYDI: kullanıcının
  "çok geniş" dediği şey YÜKSEKLİKTİ (kutunun üçte ikisi boştu), genişlik değil.
  Daraltınca üstündeki Orkestra kartıyla hizası bozuldu, geri alındı.
  Asıl çözüm bitkinin ÇERÇEVESİNİN büyümeye göre kırpılması (`plantSVG`
  viewBox'ın üstünü bitkinin tepesine göre kesiyor): kutu bitkiyle birlikte
  uzuyor, hiçbir aşamada boş alan kalmıyor. Dolgular kompakt (13/14, gap 7).
- **Orkestra'da sönük nokta "bozuk" görünmesin:** tamamlanmayan adım nötr beyaz
  %10 ile çiziliyordu ve ölü piksel gibi duruyordu (kullanıcı "bazıları
  yanmıyor" diye bildirdi, oysa davranış doğruydu). Artık bekleyen nokta da
  kendi çakra rengini soluk dolgu + ince halka olarak taşıyor.
- **Metin kalıpları EK-SONU İÇERMEZ** ("Sıradaki: Fide · 3 gün"), çünkü Türkçe'de
  "Fide'ye / Ağaç'a" ekleri isme göre değişiyor ve şablonla üretilince bozuluyor.
  Aynı sebeple sayı eki de yok ("8'i senden" değil "Senin payın: 8 nefes").

**Orkestra kartındaki yedi nokta artık SÜS DEĞİL.** Her nokta bir adım
(`ALL_MANDALA_STEPS`); bugün tamamlanan kendi çakra rengiyle yanıyor, altında
"Bugünkü akordun · 3/7" yazıyor. Orkestra metaforunun karşılığı bu: her adım bir
enstrüman. Yeni kullanıcıda bağlantı şartı 3 adım olsa bile bu dizi YEDİ kalır,
çakra sütunu görsel dili bozulmasın.

**"Senin payın" satırı:** kolektif sayıların (13 kişi, 36 nefes) altında
kullanıcının SON 7 GÜNLÜK kendi toplamı. Tamamen YEREL hesaplanıyor (günlük
`sakin_breath_/sakin_freq_sec_/sakin_terapi_sec_` anahtarları toplanıyor),
sunucuya hiçbir şey sorulmuyor. Katkı sıfırsa satır HİÇ çıkmaz ("0 nefes"
demek soğutur).

## 📊 KULLANIM RAPORU DERSLERİ (Eyl 2026, 315 kurulum analizi)

- **Geri dönüş bildirimleri** (`scheduleWinBack`, ID 9400-9403): genel/kişisel
  havuzlar yalnızca 7 gün ileriye kuruluyor, bir hafta açmayana bir daha HİÇ
  bildirim gitmiyordu (raporda 73 kullanıcı 1.3.9'da donmuştu). Artık son
  açılıştan 10/14/21/30 gün sonrasına 19:30'da birer seyrek bildirim; her açılışta
  ve arka plandan her dönüşte yeniden kurulur, düzenli kullanan hiç görmez.
- **Sessizce düşen olaylar düzeltildi:** `onb_baglan_done`, `onb_kesfet_done`,
  `ayna_feedback` istemciden gidiyordu ama `track.mjs` tanımıyordu. ⚠️ Yeni bir
  `track()` olayı eklerken track.mjs'e BEYAZ LİSTE satırı eklemek ŞART.
- **Yeni ölçümler:** `birth_saved` (doğum kayıtlı, her yoldan; eski
  `birth_view` yalnızca giriş formunu sayıyordu), `notif_open` {k: genel/
  kisisel/tarot/geridon} (bildirim ID aralığından `notifKind`), gömülü
  uygulamalar `emb_<klasör>` ekranı olarak (süre artık altta kalan ekrana
  yazılmıyor).
- **Arka plan süresi sayılmıyor:** dönüşte sayaç sıfırdan başlar. Eski
  ortalamalar (Ayna 11 dk, ödeme 6,6 dk) bu yüzden şişikti. Rapor artık
  kova dağılımından ORTANCA ("Tipik süre") gösterir; ortalama yanında soluk.
- **Huni sırası düzeltildi:** HAZIRIM → Bağlan → özellik → doğum kaydı → nefes.
- Rapor bölümleri: Tanışma (başladı/bitirdi), Bildirimler, Seçimler.
- ⚠️ Test ortamında `pkill -f "vite preview"` komutunu BAŞKA komutlarla aynı
  satıra yazma: kabuk kendi komut satırını da eşleştirip kendini öldürüyor.

## 🔔 BİLDİRİMLER: TEK PLANLAYICI + GÜNLÜK SINIR (Eyl 2026, GÜNCEL)

⚠️ **Aşağıdaki eski "kişiye özel havuz" anlatımındaki "günde +2" ARTIK GEÇERSİZ.**
Genel, kişisel ve tarot havuzları birbirinden habersiz kuruluyordu: kıdem kuralı
yalnızca genel havuza uygulanıyor, doğum bilgisi olan 30+ günlük kullanıcıya
günde 4, yeni kullanıcıya 5 bildirim gidiyordu. Artık TEK fonksiyon:
`scheduleAllNotifications(lang, birthDate, {ask, force})`, damga `sakin_notif_plan`.
- ⚠️ **GÜNCEL (Eyl 2026, kullanıcı: "kullanıcılar bildirimleri seviyor, normal
  günde 3; kişiye özel seçme menüsü"):** kıdeme göre 3/2/1 sınırı KALDIRILDI.
  Varsayılan HERKESE günde 3. Ayarlar > Bildirimler (yalnızca native; web'de
  test için `localStorage.sakin_dev_notif="1"`): günlük sayı 1/2/3 + 7 tür
  (kozmik, kişisel, akşam, tarot, hatırlatıcı, gün ortası, geri dönüş) tek tek
  aç/kapa, `sakin_notif_prefs` {count, off}. Satır sırası = öncelik sırası.
  **AÇILIR KUTU (Eyl 2026, kullanıcı: "çok uzun oldu"):** Ayarlar'da KAPALI
  başlar (`notifSetOpen`); kapalıyken tek satır özet "Günde 3 bildirim / 7/7 tür
  açık · Anlık mesajlar açık". Açınca günlük sayı + 7 tür + "Sakin'den anlık
  mesajlar" (push) AYNI kartta, cihaz kodu kartın altında.
  Değişince plan `force` ile hemen yeniden kurulur. `readNotifPrefs` +
  `_notifDayPlan(dn, day, hasBirth, hasEm, prefs)`. Analitik `notif_pref`
  (track.mjs beyaz listede, raporda "Bildirimler" altında).
  Varsayılanla doğum var: 08:30 tarot + 10:00 kişisel + 18:00 akşam; doğum yok:
  13:00 (Salı/Cuma 08:00) + 18:00 = 2.
- ~~Günlük üst sınır: yeni 3 · orta 2 · eski 1~~ (tarihsel, yukarıya bak)
- **Doğum VARSA öncelik:** jeomanyetik 12:00 (yalnızca Kp>=4) > kişisel 10:00
  (→Bugün) > akşam 18:00 > tarot 08:30 > hatırlatıcı 16:00 > gün ortası.
- **Doğum YOKSA:** yalnızca genel havuz (18:00 + kıdeme göre 13:00/08:00).
  Tarot ve gömülü uygulamaya (Tasarım/Hayvan/Mitler) giden mesajlar GİTMEZ:
  hepsi doğum kapısına açılıyordu. Geri dönüşün Bugün'e giden metinleri Bağlan'a.
- **Hedefler düzeltildi:** jeomanyetik bildirimi `"ben"` diye OLMAYAN bir ekranı
  açıyordu (Ben'in ekranı `harita`). 12 özellik davetinin hepsi Bağlan'ı
  açıyordu; artık `PROMO_TARGETS` ile metne uygun ekran (ses/nefes/çakra/gün/
  harita/Hayvan/Mitler). Bildirim hedefi eklerken ekran adının GERÇEKTEN
  render edildiğini kontrol et (`screen==="..."`).
- **İzin zamanı:** artık ilk açılışta SORULMUYOR. `askNotifPermissionOnce`: ilk
  nefes bitince, tanışma bitince ya da en geç ikinci açılışta, bir kez
  (`sakin_notif_asked`).
- Kolaylaştırıcı şablon yedeği artık 7 dilde (`PNOTIF_FACIL`).
- **Sabah tarot bildirimi (`TAROT_NOTIF`) "tek bir kart ayrıldı" DEMEZ** (kullanıcı
  bildirdi: gün içinde birden fazla kart açılıyor). Kalıp: "Günün rehber kartlarını
  çek, tarot kartını aç ve mesajını al" (3 varyant, 7 dil).
- **SÖZ HAVUZU (`NOTIF_SOZ`, 32 söz, 7 dil; Türkçe asıl metin kullanıcının):**
  akşam 18:00 / gün ortası 13:00 havuzuna diğer mesajlarla ARALIKLI dizilir (sona
  eklenirse `pick()` 32 gün üst üste söz verirdi). Dokununca Bağlan.
- Doğrulama: gerçek kod Node'da sahte LocalNotifications ile çalıştırıldı
  (tier × doğum × Kp), gün başı sayılar 3/2/1 ve 2/1-2/1 çıktı. Cihazda test EDİLMEDİ.

## 🔔 KİŞİYE ÖZEL BİLDİRİM HAVUZU (TARİHSEL, üstteki tek planlayıcıya bak)

Mevcut GENEL bildirim havuzu (9000-9099, `scheduleDailyReminders`) aynen devam
eder. Buna EK, AYRI bir kişiye özel havuz eklendi (`schedulePersonalNotifications`,
ID 9200-9299), doğum bilgisine göre.

**Günde +2 (kullanıcı kararı):** (1) günün KOLAYLAŞTIRICI mesajı 10:00,
(2) ona özel kısa HATIRLATICI 16:00. Ayrıca (3) ELEKTROMANYETİK durum mesajı
12:00 ama YALNIZCA jeomanyetik alan hareketliyken (Kp>=4, aktif/fırtına);
sakin günlerde çıkmaz.

**İçerik motoru = AI (haftalık) + ŞABLON YEDEĞİ (kullanıcı kararı).** Yerel
bildirim çevrimdışı da düşmeli, o yüzden içerik uygulama açıkken ÖNCEDEN üretilip
cihaza planlanır (fire anında AI çağrılamaz).
- `_genPersonalNotifAI`: tek ai-call, doğum burcu + yaşam yolu + kişisel yıl +
  7 günün ay evresini verir, `[1F][1R]..[7F][7R]` formatında 14 satır ister,
  parse eder. 5+ gün dolu değilse şablona düşer. HAM astro sayısı YASAK (Ayna
  dersi). max_tokens 1400.
- `_genPersonalNotifTemplate`: doğum + gün numarasıyla tohumlanmış deterministik
  yedek (`PNOTIF_FACIL`/`PNOTIF_REMIND`, TR+EN tam, diğer diller EN'e düşer;
  nadir yol, AI birincil).
- İçerik `sakin_pnotif_content`'te ISO hafta + dil + doğum damgasıyla cache'lenir
  (haftada bir yenilenir); planlama `sakin_pnotif_sched` ile günde bir.

**EM = gerçek NOAA verisi, AI değil.** `_emMessageForDay` cosmic-energy'nin
`next_3_days.slots` Kp tahmininden günlük max Kp'yi çıkarır, `PNOTIF_EM`
(active/storm, 7 dilde) banttan mesaj seçer. Forecast yalnızca 0..2. günü kapsar.

⚠️ **Doğum bilgisi yoksa bu havuz HİÇ kurulmaz** (kişiselleştirme şart); genel
havuz yine çalışır. Native-only (isNative guard), web'de erken çıkar.
Doğrulama: gerçek ai-call ile prompt+parse (7/7 gün, em dash yok), web smoke
(pageerror yok), build temiz. Cihaz testi yapılmadı (LocalNotifications native).

## 🧭 GİRİŞ EKRANI = BUGÜN + ALT BAR SIRASI (kullanıcı isteği, Eyl 2026)

- **Alt bar sırası:** Bağlan ile Bugün'ün yeri değişti. Yeni sıra:
  **BUGÜN · KEŞFET · BAĞLAN · AYNA · BEN** (`MAIN_TABS`). Bugün artık ilk (sol)
  sekme, Bağlan onun eski orta yerinde. `center` bayrağı kaldırıldı (zaten
  render'da kullanılmıyordu, orta sekme ayrıcalığı çoktan iptaldi).
- ⚠️ **GÜNCEL (Eyl 2026, kullanıcı: "yeni olmayan kullanıcılar için her zaman
  app açılırken elmas döner ve Bugün açılır"):** giriş/HAZIRIM ekranı artık
  YALNIZCA hiç HAZIRIM'a basmamış kullanıcıya çıkar. `sakin_hazirim_today`
  HERHANGİ bir değer taşıyorsa `_initialScreen` her zaman "bugun" döner (elmas =
  `showIntro` splash'i, her soğuk açılışta zaten oynuyor). Doğum yoksa Bugün
  kapısı sorar. Yol seçimi sonu: "Sakinleşmek" → onboarding → Bağlan;
  "Kendimi tanımak" → onboarding → BUGÜN (eskiden Ben/harita), doğum varsa
  "hazırlanıyor" geçişiyle. "Ne yeni" kartı Bugün'de de çıkar.
- **Varsayılan karşılama = BUGÜN.** `_initialScreen()` tekrar giren kullanıcıda
  (bugün HAZIRIM'a basmış) "mandala" yerine "bugun" döner. HAZIRIM da
  `setScreen("bugun")` yapıyor (eskiden mandala). İlk kez giren kullanıcı akışı
  (giriş → HAZIRIM → yol seçimi forku → onboarding) değişmedi; kural "ilk
  kullanıcıdan SONRA, tekrar girenler Bugün görsün".
- **Bugün ekranının altında "GÜNE BAŞLA" butonu** (`mandala_start_today`, 7 dil)
  → Bağlan'a (mandala) yönlendirir. Bugün karşılama olduğu için asıl günlük
  pratik (nefes/ses/çakra/bağlantı) oraya bu butonla geçiliyor. I Ching
  butonundan hemen sonra, `sakin-btn-primary` ile.
- Doğrulama: alt bar sırası, HAZIRIM→Bugün, Güne Başla→Bağlan, tekrar açılış
  Bugün (aktif sekme BUGÜN, giriş yok) Puppeteer ile doğrulandı, hata yok.

## ☀️ BUGÜN EKRANI YAPISI (kullanıcı isteği, Eyl 2026)

**⚠️ BUGÜN DOĞUM BİLGİSİ İSTER (kullanıcı, Eyl 2026: "doğum bilgisi olmadan
pusula, geçiş verilmesi inandırıcılığı kaybettirir").** Doğum yoksa Bugün
içeriği HİÇ çizilmez; sekmeye dokununca kapı kartı çıkar (Keşfet kapısıyla
aynı dil): "Doğum bilgilerini gir" → form → kayıtta ~3 sn "Bugün ekranın
hazırlanıyor" geçişi (`bugunPrep`, adımlar yalnızca gerçekten yapılan
hesaplar) → Bugün. "Şimdilik atla" / dışarı dokunma → Bağlan. Doğumsuz
kullanıcı açılışta ve HAZIRIM'da Bugün yerine Bağlan'a düşer (her gün kapı
çıkıp dürtmesin diye).

Bugün = tekrar giren kullanıcının İLK ekranı, amaç "bugüne dair çekici, uygulamayı
kullanmaya teşvik eden bilgi". Sıra (yukarıdan aşağı), değiştirmeden önce sor:
0. **Başlık:** tarih etiketi + serif selam ("Günaydın, Arda"; saate göre, 7 dil).
1. **Güncel geçiş** (kullanıcı: "en üstte"). Hemen altında **Günün Pusulası**
   (kullanıcı isteğiyle 5. sıradan buraya taşındı, ayrıntısı madde 5'te). HD Güneş/Ay kapısı. Eski adı
   "Günün geçişi" YANLIŞTI (Güneş kapısı ~5-6 gün, Ay gün içinde değişir);
   aynı sebeple "Günün vurgusu" da "Vurgu" oldu. Süre iddia eden etiket koyma.
2. **Günün sayısı:** doğum varsa kişisel gün (`personalDayNumber`), yoksa
   `universalDayNumber`, `DAY_NUMBER_TXT` 9 × 7 dil.
3. **Pazar: Haftanın özeti** (`WEEK_TXT`): yalnızca Pazar + en az 1 aktif gün
   (0 gün demek soğutur). 7 gün noktası + nefes/ses/çakra, tamamen YEREL veri.
4. **Orkestra modu** (Ben'den TAŞINDI, kullanıcı: "karşılamaya al"). pulse
   verisi artık `screen==="bugun"`de çekiliyor. "13 kişi bu hafta" = haftalık
   gerçek veri, "bugün" diye yazma (sahte olur). Akort noktaları + Senin payın.
5. **Günün Pusulası** (ARTIK 1'in hemen altında; kullanıcı isteği, "Yıldızlar bugün sana ne diyor?"
   kartlarının YERİNE; o kartlar "ilk ekranda uzun" bulundu). Ruh Profili
   profil sayfasından TAŞINDI (SoulID ProfileCard'dan kaldırıldı, tekrar yok).
   `dailyCompass()` + `COMPASS_TXT` (7 dil) = `apps/soulid/lib/profile/daily.ts`
   ile BİREBİR: söz ay evresi diliminden (`moonNow.index`), "Bakman gereken yer"
   Güneş kapısının HD merkezinden (`transit.sun.center`, 64/64 SoulID ile aynı),
   "Haftaya bakış" ay büyüyor/küçülüyor. Ay evresi adı ve "Geliş sebebin"
   BİLEREK YOK. Doğum gerekmez. Altında "Yıldızlar bugün sana ne söylüyor?
   Öğrenmek için tıkla" → SoulID `index.html?go=sky` → karne `/report?to=sky`
   → "Bugünün Gökyüzü" bölümüne (`#today-sky`) kaydırır.
   `src/sky-today.js` ekranda değil ama HÂLÂ hesaplanıyor: Günün Yorumu
   prompt'u bu kartları omurga alır.
5b. **Günün Yorumu** (etiket üstte, kutuda yalnızca tarih, açılır-kapanır,
   `dailyHoroOpen`): ilk açılışta `generateDailyHoroscope` (AI, consent +
   günlük hak, gün+burç+dil cache), sonra AI harcamadan aç/kapa. Doğum yoksa
   burçsuz genel okuma.
6. **Gökyüzü raporu** (kolektif, açılır). Bir ara Ben'e taşındı, geri geldi.
   İçindeki "Şu an Satürn retroda..." geçiş notu küçük MOR italik ✦ açıklama
   olarak kalır (kullanıcı, tek görsel dil geçişinde kaybolan eski görünümü geri
   istedi). PAYLAŞIM kartında bu not YOK, yalnızca rapor gövdesi.
7. Günün rehberleri → I Ching → İkili uyum (Ben'den taşındı; I Ching ile yeri
   kullanıcı isteğiyle değişti) → **Tarot**.
   ⚠️ **Rehberlerdeki 4. kart = GÜNÜN MİT KARTI, RASTGELE + GÜN BOYU SABİT**
   (Eyl 2026, `mythOfDayPinned`, src/daily-cards.js). 5 sistemden biri
   (arketip/mit/imge/rün/I Ching; tarot YOK, kendi bölümü var) gün + doğum
   damgasından seçilir ve `sakin_bugun_myth`e sabitlenir. Mitler'in kendi
   çekilişine (`@mitler_daily`) BİLEREK BAKILMAZ: eski kod oraya geçiyordu,
   Mitler'de kart açınca Bugün değişiyordu (kullanıcı şikâyeti). Mitler kendi 3
   destesini ayrıca rastgele çeker; ikisi bağımsız. ⚠️ Bir ara "Mitler'de ilk
   açılan deste" yapıldı, YANLIŞTI (rün/I Ching hiç çıkmıyordu), geri alındı.
8. **EN ALTTA "Bugünün ilk adımını at"** (kullanıcı: "mantık olarak devam
   etsin"): seri bilgili çağrı → Bağlan. **"Güne Başla" butonu KALDIRILDI.**

**Eyl 2026 eklemeleri (kullanıcı: "önerilerinin hepsini yap"):**
- **İlk açılış ipucu** (`bugunHint`, `sakin_bugun_hint`, bir kez): alt barın
  üstünde "Her sabah burada seni bekleyen bir tarot kartı ve günün pusulası
  var." 9 sn ya da dokununca kapanır; tam ekran katmanlar açıkken bekler.
- **Doğum kapısında önizleme:** bulanık "Kişisel günün" kartı (içerik bilerek
  okunamaz, gerçek sayı doğumsuz hesaplanamaz) + "Doğum bilgilerinle netleşir".
- **Keşfet onboarding'inde tarih + saat TEK adım** (adımlar artık 0-5, LAST=5).
- **Analitik** (anonim, track.mjs beyaz listesi): `fork_shown`, `fork_pick`
  {path, untried}, `bugun_gate` {shown/enter/skip}. Rapor: "Seçimler" bölümü.

**TEK GÖRSEL DİL (kullanıcı: "klas, zarif, tek görsel dil"):** Bugün bloğunun
başındaki `SURF` (tek kart yüzeyi), `eyebrow()`, `label()`, `icon()`,
`chevron()`, `pill()`, `smallBtn()`. Kart zeminine RENKLİ DOLGU KOYMA, renk
yalnızca ikon dairesi/etiket/küçük vurguda. Başlık/değer Cormorant (serif),
gövde Inter, etiket Jost. Yeni bölüm eklerken bu yardımcıları kullan.
- ⚠️ **Yardımcılar BİLEŞEN DEĞİL, FONKSİYON:** uygulama saat yüzünden
  SANİYEDE BİR yeniden çiziliyor; render içinde tanımlı bileşenler her saniye
  baştan kurulur, animasyonlar (kart açılışı) tekrar tekrar oynar.
- ⚠️ **`BTN` içinde `background:transparent; border:none` ŞART:**
  `appearance:none` tarayıcının gri buton zeminini KALDIRMAZ; kart içindeki
  aç/kapa satırları gri görünüyordu (yakalandı, düzeltildi).

**TAROT:**
- Görseller `public/tarot/<id>.webp` (78) + `back.webp`, üreten
  `scripts/build-tarot-art.py`. Kaynak: 1909 orijinal deste taramaları (Wikimedia,
  kamu malı). ⚠️ "Rider-Waite" adı MARKA, arayüzde KULLANMA.
- ⚠️ **"Kartlar flu" (kullanıcı bildirdi, düzeltildi):** ilk sürüm 90 px
  görseli CSS `image-rendering:pixelated` ile büyütüyordu; iOS WKWebView buna
  güvenilir uymuyor, yumuşatıp bulanıklaştırıyordu. Artık 180x280 piksel
  sanat görselin İÇİNE 2x gömülü (360x560), tarayıcıya büyütme bırakılmıyor.
  WebP kayıpsız, toplam ~2.8 MB (PNG'de 6.7 MB olurdu; iOS 16+/Android 7+ destekli).
- Kart **AÇILIR-KAPANIR** (kullanıcı: "tüm ekranı kaplamasın"): çekim anında
  açık, sonraki girişlerde tek satır özet (`tarotExpanded`). Açıkken kompakt
  düzen: kart solda 124 px, anlam sağda, öneri altta.
- **Paylaş:** `buildTarotStoryCard` (1080x1920, Ayna hikâye kartıyla aynı dil,
  gerçek kart görseli + anlam + "Bugün için"). Altta büyük "SAKIN" YOK
  (kullanıcı kaldırttı): yerine davet "Kendi kartını açmak için" + sakin.life
  (`TAROT_UI_TXT.storyInvite`, 7 dil).
- **"Daha geniş açılım" = PREMIUM** (`isPremium`): üç kart (Kök · Şimdi · Yön),
  ortadaki günün kartının kendisi (`pickTarotSpread`, gün boyu sabit) + AI
  birleşik yorum (`generateTarotSpread`, cache). Premium değilse NAZİK kilit
  paneli (ne olduğunu anlatır), doğrudan fiyat ekranına ATMAZ.
- **Sabah bildirimi "Kartın seni bekliyor"** (`scheduleTarotMorning`): 08:30,
  ID 9301-9331 (ayın gününe göre). ⚠️ Bildirim yorgunluğu: genel havuzun SABAH
  bildirimi olan günlerde ATLANIR, kart o gün çekilince bugünkü iptal
  (`cancelTodayTarotNotif`). İzin istemez (checkPermissions), kartın adını
  söylemez (merak). Cihazda test EDİLMEDİ.

## 🪷 İÇSEL HARİTA: GÜNLÜK YANSIMA (Ben ekranı, kullanıcı isteği, Eyl 2026)

İçsel Harita açılınca, KULLANICI VERİSİ VARSA en üstte blok (yoksa hiç çıkmaz,
altındaki halka + 4 istatistik aynen durur). Sıra:
1. **Bıraktığın niyet** (`sakin_niyet_<gün>` + kelimeler; bugün yoksa DÜN).
2. **Günün sözü**: `src/quotes-data.js` (Bitkiler/Taşlar ile AYNI havuz,
   `apps/bitkiler/src/data/quotes.json`; akide/vaaz engel listesi uygulandı,
   yalnızca kısa sözler, 150 adet, 7 dil, DİNAMİK import). Gün + doğumla sabit.
   Genel kaynak adları `QUOTE_SOURCE_I18N` ile çevrilir, özel isimler olduğu gibi.
3. **Yansıma (2-3 cümle)**: niyet + söz + akşam notu + DÜNÜN gökyüzü (dün öğlen
   ay evresi + Güneş'in HD kapısı, `computeTransit`). AI YALNIZCA `aiConsent`
   varsa ve günlük hak kalmışsa (onay penceresi AÇILMAZ, kendiliğinden okuma);
   yoksa `innerReflectTemplate` (7 dil). Cache anahtarı GİRDİLERİ içerir
   (`sakin_inner_reflect`): niyet/not değişirse yeniden yazılır, aç-kapa AI
   harcamaz. ⚠️ Transit bitmeden yansıma başlamaz (yoksa anahtar değişip AI iki
   kez çağrılıyordu).
4. **Akşam kapanışında yazdıkların** (`sakin_aksamnote_` + `sakin_sukur_`; bugün yoksa dün).
5. **Tek eylem: "Bugün için 4-6 nefes al"** → Nefes ekranı, `pendingBreathRef =
   "diyafram"` (4·6 ritmi) seçili açılır.

## 💞 BEN > BAĞLANMA PROFİLİ KUTUSU (kullanıcı isteği, Eyl 2026)

Kimlik kartının hemen altında. Veri: SoulID bağlanma testinin sonucu
(`soulprofile.attachment.result`, aynı origin localStorage, embed her kapanınca
`soulReloadKey` ile yeniden okunur). Test yoksa davet ("Yakınlıkta nasıl
davranıyorsun?" + Teste başla), varsa stil + öz + Kaygı/Kaçınma çubukları +
karma eğilim. Dokununca `/embedded/soulid/index.html?go=attachment` açılır
(SoulID `app/page.tsx` bu parametrede karne beklemeden `/attachment`'a gider;
alt klasörü doğrudan açmak iOS'ta güvenilir değil). Stil adları/özleri
`ATTACH_TXT` (7 dil), SoulID `lib/attachment/index.ts` STYLES ile BİREBİR:
orada değişirse burayı da değiştir. Test ekranının kendisi yalnızca tr/en.

## ✉ BEN > NİYET MEKTUBU (kullanıcı isteği, Eyl 2026: "21 gün sonra açılsın, geri sayım olsun" + "fikri geliştir")

Bağlanma Profili kutusunun altında, `NiyetMektubu` bileşeni (MODÜL seviyesinde,
render içinde tanımlama). Akış: davet → yaz (ipuçları: "kalpten, içten yazmaktan
çekinme", "olmuş gibi şimdiki zamanda") → MÜHÜRLE (21 gün açılamaz/değişmez) →
MÜHÜRLÜ SANDIK (`letterChest`, tarot kart arkasıyla aynı dil: çivit zemin, altın
çift çerçeve, lavanta halka, yıldızlar; kilidin üstünde altın mühür) + 21 noktalık
yol. ⚠️ Sayısal gün/saat/dakika sayacı KULLANICI İSTEĞİYLE KALDIRILDI ("noktalar
daha iyi iş görüyor"), geri koyma. Süre dolunca sandığın mührü parlar + "Mektubu aç" ritüeli → mektup + "Bu niyet sende neye dönüştü?"
(gerçekleşti/yolda/dönüştü) → yeni mektup, eskisi arşive ("Önceki mektupların").
- Veri YALNIZCA cihazda: `sakin_niyet_letter` (etkin) + `sakin_niyet_letters`
  (arşiv, son 30). Metin sunucuya GİTMEZ; ekranda da "yalnızca bu cihazda" yazıyor,
  bunu bozacak bir senkron eklersen o metni de değiştir.
- Açılış bildirimi (native, tek sefer): ID 9500, `scheduleLetterNotif`, 10:00-21:00
  arasına çekilir, İZİN İSTEMEZ (varsa kurar), hedef `harita`. Günlük 3 sınırının
  DIŞINDA (21 günde bir). `notifKind` → "mektup".
- Analitik `letter` {a: seal/open/reflect, r} (track.mjs beyaz listede, rapor
  "Seçimler"de). Metin 7 dilde `LETTER_TXT`.

## ⏰ 1.3.9 BUILD ÖNCESİ HATIRLAT (kullanıcı isteği)

Kullanım ölçümü (anonim funnel) eklendi. 1.3.9 build/gönderiminde bu ikisini kullanıcıya HATIRLAT:
1. **Netlify env `REPORT_TOKEN`** ekli mi? Yoksa rapor kapalı. Ekli ise rapor: `https://sakin.life/.netlify/functions/report?token=...&html=1`
2. **App Store gizlilik etiketi:** bir sonraki iOS gönderiminde "Kullanım Verileri (kimliğe bağlı değil)" olarak işaretlenmeli. Görünür opt-out toggle Ailesi panelinde mevcut (analytics_toggle_label).

## ⚡ R8 / OPTİMİZASYON + EMBED BELLEK (kullanıcı isteği: Play uyarısı, Eyl 2026)

**Play uyarısı (versionCode 16'yı ölçtü) özeti:** düşük optimizasyon/karartma/
küçültme (~%32-33), kullanılmayan kaynak kaldırma kapalı, AGP 9 önerisi.
- ⚠️ **Karartma artık %2 DEĞİL %33: eşiğin (%25) ÜSTÜNDE.** Bu uyarı bir ENGEL
  değil, öneri. Düşük oran BİLİNÇLİ: Capacitor çekirdek keep'i (çökme fix'i,
  bkz. proguard-rules.pro) sınıfları rename ettirmiyor. Daraltmak = çökme riski.
- ✅ **"Kullanılmayan kaynak kaldırma kapalı" ZATEN ÇÖZÜLÜ:** versionCode 16'da
  shrinkResources KAPALIYDI, versionCode 17 (repoda) AÇIK. 17'yi R8 test
  kapısından geçirip göndermek yeterli (kod hazır, bump gerekmez).
- **Cihazı asıl yoran R8 değil, embed'ler.** public/embedded 29 MB (APK içinde),
  runtime'da açık olan embed + mitler (sticky).

**EMBED BELLEK (yapıldı, düşük risk):** standart embed kapanırken
`releaseStandardEmbedFrame()` iframe'e `about:blank` navigasyonu verir; WKWebView
ağır sayfayı hemen bıraksın (element'i sadece unmount etmek WebKit'te yavaş
boşalabiliyor). Escape + geri butonu + closeEmbedNow yollarında. ⚠️ mitler'e
DOKUNMAZ (embedIframeRef mitler'de null; mitler her mount'ta rastgele 4 mit
seçtiği için sticky kalmalı). Zaten var olan MutationObserver-disconnect
temizliği (App.jsx ~5594, geçmiş iOS OOM fix'i) korunuyor.

## ⚡ PERFORMANS / PİL / BOYUT (Eyl 2026, kullanıcı: "daha hızlı, az RAM ve şarj")

- **Saat artık DAKİKADA bir:** `setTime` eskiden her saniye çağrılıp TÜM
  uygulamayı yeniden çiziyordu. `time` yalnızca saat:dakika ve gün yüzdesi için
  okunuyor. ⚠️ "Saat yüzünden saniyede bir yeniden çiziliyor" notları (Bugün
  yardımcıları vb.) artık "dakikada bir" demek; kural aynı: render içinde
  bileşen tanımlama. Saniye gösteren yeni şey KENDİ zamanlayıcısıyla yazılır.
- **Fare takipli ışık:** telefonda kapalı, web'de kare başına en fazla bir güncelleme.
- **Arka plan yıldızları:** 46 yıldızın yalnızca 16'sı parlıyor, "Hareketi Azalt"
  açıksa hiçbiri.
- Ölçüm (masaüstü Chrome, Bugün ekranı, 15 sn boşta): JS 35→4 ms, toplam iş
  405→138 ms, stil hesaplama 478→262, JS bellek 8,9→6,7 MB.
- **Telefon paketi 7,6 MB küçüldü:** `scripts/prune-native-web.mjs`
  (`package.json` "capacitor:copy:after" kancası) her `cap sync/copy` sonunda
  YALNIZCA native kopyadan web'e özgü dosyaları siler (blog, home, tanitim,
  privacy, terms, site.*, og görseli, 2048 ikon). `dist/` ve Netlify etkilenmez.
  ⚠️ Uygulama içinden bu yollardan birine bağlantı eklersen listeden çıkar.
- **Ölü kod silindi:** `generateChakraAnaliz` (tanımsız `chakraEsle`/
  `CHAKRA_ZIHINSEL` çağırıyordu, çalışsa hata verirdi) + ona bağlı iki durum,
  `sendNotif`, `SKYTODAY_TXT`, `STEP_NAMES`, `__appStartMs`, `heartAnim`, ve
  bildirim planlayıcısından kalan `_notifTier`/`_notifSecondSlot`.
- Zaten iyi olanlar (dokunma): tüm zamanlayıcılar ekran/seans kapılı, sessiz
  ses döngüsü yalnızca seans sırasında, embed'ler kapanınca `about:blank`.

## 💬 SATIN ALMA EKRANI DİLİ (kullanıcı, Eyl 2026: "kapital marketing dilinden uzaklaşalım")

- `fiyat` ekranında başlığın altında İMZALI İÇTEN NOT (`PRICING_NOTE_TXT`, 7 dil,
  "Arda Çetin"): satın almak = ışığın yayılması için verilen emeğe ortak olmak,
  geliştirmeye ve yeni uygulamalara güç vermek; açıkça "satılmaya ihtiyacı var".
  Premium kullanıcıya yalnızca teşekkür (`owned`). Alt başlık "ŞEFFAF FİYATLANDIRMA"
  yerine "İÇTEN BİR NOT", "Bonus · Sakin Ailesi" yerine "Sakin Ailesi de içinde".
- ⚠️ BAĞIŞ GİBİ SUNMA: Apple IAP ile bağış toplanmasına izin vermez. Not ürünün
  YERİNE geçmez; özellik listesi, fiyatlar, abonelik koşulları (3.1.2) aynen durur.
  Doğrulanamayan iddia ("reklamsız", "veri satmıyoruz") EKLEME.

## 📣 ANLIK BİLDİRİM / PUSH (kullanıcı isteği, Eyl 2026: "istediğim zaman spontane bildirim")

Planlı YEREL bildirimlerden AYRI bir hat. Gönderim paneli:
`https://sakin.life/.netlify/functions/push-admin?token=PUSH_ADMIN_TOKEN`
(metin tek ya da dil dil, dil/platform filtresi, açılacak ekran, "yalnız test
cihazına" = Ayarlar > Bildirimler altındaki 6 haneli CİHAZ KODU, son gönderimler).
- Sunucu: `netlify/functions/_push.mjs` (APNs HTTP/2 + ES256 JWT, FCM HTTP v1 +
  servis hesabı; Xcode sandbox token'ına otomatik ikinci deneme; 410/UNREGISTERED
  cihazlar silinir), `push-register.mjs` (Blobs `sakin-push`, anahtar token özeti;
  yalnızca token/platform/dil/tz/sürüm, KİŞİSEL VERİ YOK), `push-admin.mjs`.
  Env: APNS_KEY_ID, APNS_TEAM_ID, APNS_PRIVATE_KEY, (APNS_BUNDLE_ID), FCM_SA_JSON,
  PUSH_ADMIN_TOKEN. Eksik platform panelde "kapalı" yazar, gönderim atlanır.
- İstemci: `@capacitor/push-notifications`. **VARSAYILAN AÇIK (kullanıcı kararı,
  Eyl 2026):** `pushWanted()` = `sakin_push_optin` "0" değilse açık. Bildirim izni
  ZATEN verilmişse `ensurePushRegistered()` sessizce kaydeder (izin istemez;
  açılışta + `askNotifPermissionOnce` sonrası + Ayarlar'daki "İzin ver" sonrası).
  Kapatma Ayarlar > Bildirimler (açılır kutu) > "Sakin'den anlık mesajlar";
  kapatınca sunucu kaydı silinir. Bugün'deki tek seferlik davet kartı KALDIRILDI.
  ⚠️ **Apple 4.5.4:** varsayılan açık olduğu için anlık mesajlar YALNIZCA İÇERİK
  (söz, özel gökyüzü günü, içten not). "Yeni özellik", indirim, satın al çağrısı
  GÖNDERME; açıklama metninden de "yeni özellikler" çıkarıldı. Tanıtım gerekirse
  önce açık onaya (opt-in) dön. Dokunma →
  `PUSH_SCREENS` beyaz listesindeki ekran, soğuk açılış tamponlu. Analitik
  `push_optin` {v} + `notif_open` k="anlik" (track.mjs beyaz listede).
- ✅ ANDROID AÇIK (Eyl 2026): `android/app/google-services.json` (Firebase projesi
  `sakin-fd9b7`, paket com.sakin.app) repoda, `PUSH_ANDROID_READY = true`.
  ⚠️ Dosya silinirse bayrağı false yap (Firebase'siz register() native hata verir).
  Sunucu anahtarı Netlify `FCM_SA_JSON` (servis hesabı JSON'u, GİZLİ, repoda YOK).
  Bildirim çubuğu simgesi `res/drawable/ic_stat_sakin.xml` (✦, tek renk) +
  `@color/sakin_notif`, manifestte FCM varsayılanı. google-services.json
  `SECRETS_SCAN_OMIT_PATHS` ile taramadan muaf (istemci yapılandırması, sır değil).
  ⚠️ Firebase yeni native kod getirdi: Play'e göndermeden R8 test kapısı ŞART.
- ✅ iOS native parçası EKLENDİ (kullanıcı onayladı, Eyl 2026): AppDelegate'te
  didRegister/didFailToRegisterForRemoteNotifications → Capacitor iletimi +
  App.entitlements'ta `aps-environment` (development; App Store arşivinde Xcode
  production'a çevirir). Apple Developer'da app.sakin.life için Push Notifications
  AÇIK, APNs .p8 anahtarı Netlify env'de, panel "APNs hazır" gösteriyor.
- **İmzalama ekibi repoda sabit:** `ios/App/App.xcodeproj/project.pbxproj`
  `DEVELOPMENT_TEAM = C8AM95FY4T` (Hayvan projesiyle ve APNs anahtarıyla aynı
  ekip). Eskiden `""` idi; build komutundaki `git reset --hard` Xcode'da seçilen
  Team'i her seferinde siliyor, "Signing for App requires a development team"
  hatası çıkıyordu. BOŞALTMA.
- Netlify gizli tarama: `APNS_TEAM_ID`/`APNS_KEY_ID` `netlify.toml`'da
  `SECRETS_SCAN_OMIT_KEYS` ile muaf (Team ID Xcode pbxproj'larda açıkça duruyor,
  deploy'u durdurmuştu). APNS_PRIVATE_KEY taranmaya devam eder.
- Test: sahte APNs HTTP/2 + sahte FCM + sahte Blobs ile uçtan uca doğrulandı
  (kayıt, 401, test kodu, dile özel metin, sandbox yedeği, ölü cihaz temizliği).
  ✅ **GERÇEK CİHAZDA DOĞRULANDI (Eyl 2026, kullanıcı):** iPhone (APNs) ve
  Android (FCM) panelden test bildirimi aldı; Android R8 test kapısı PASS.
- **APNs anahtarı:** "Sandbox & Production" ortamlı anahtar kullanılıyor (ilk
  anahtar yalnızca Sandbox'tı, `403 BadEnvironmentKeyInToken` verdi, REVOKE edildi).
  Anahtar ortamı SONRADAN DEĞİŞTİRİLEMEZ; yeni anahtar gerekirse oluştururken
  Configure'da "Sandbox & Production" seç. .p8 Netlify'a nasıl yapıştırılırsa
  yapıştırılsın `_push.mjs` `pem()` düzeltir (satır sonu boşluğa dönmüş vb.).

## ◌ ÇEMBER: CANLI SOHBET ODASI (kullanıcı isteği, Eyl 2026)

Kararlar (kullanıcı): **her an açık canlı oda · Supabase Realtime · Türkçe + Global.**
Giriş: Bugün > Orkestra kartının altındaki "Çember · Canlı oda" satırı (anlık kişi
sayısı). YALNIZCA bugünkü bağlantısını tamamlayan (`allStepsComplete`) girer;
tamamlamayana kilit ekranı + "Bağlan'a git". İstemci kapısı (aşılabilir), asıl
koruma sunucuda.
- **Mimari:** mesaj DOĞRUDAN veritabanına yazılmaz. `chat-send` sırayla denetler:
  env, girdi (1-140 kr), ban, bağlantı/telefon/@hesap yasağı, KRİZ ifadesi, yavaş
  mod (15 sn), yerel küfür filtresi (TAM KELİME, `\p{L}` sınırı: "götürmek" masum),
  AI moderasyonu (`aiModerate`, Groq). Geçerse Supabase'e yazar + Realtime
  broadcast `room:<oda>` event `msg`. Kim odada: presence (aynı kanal).
  Dosyalar: `netlify/functions/_chat.mjs`, `chat-config` (url+anon+takma ad),
  `chat-history` (son 24 saat, cihaz özeti DIŞARI VERİLMEZ), `chat-send`,
  `chat-report`, `chat-admin`. Şema: `supabase/cember.sql` (RLS AÇIK, POLİTİKA
  YOK: anon anahtar tabloları okuyamaz/yazamaz; her şey servis anahtarıyla
  fonksiyonlardan).
- ⚠️ **AI moderasyonu `VERDICT: <KELİME>` biçiminde cevap ister:** groqChat'in
  kalite kapısı 8 karakterden kısa cevabı atıyor; tek kelime "OK" hep reddedilir,
  moderasyon SESSİZCE kapanırdı (yazarken yakalandı). Biçimi kısaltma.
- **Takma ad sunucuda** (`nickFor`: element · canlı + sayı, TR/EN), cihaz kimliğinin
  (`sakin_anon_id`) özetinden; istemci seçemez. Renk = element dilimi (`el`).
- **KRİZ:** kendine zarar ifadesi (yerel regex + AI CRISIS) → mesaj odaya DÜŞMEZ,
  yazana özel "Yanındayız" kartı (TR 112, diğer diller yerel acil numara) +
  "Birlikte nefes al" → Nefes. Bilerek geniş tutuldu (yanlış pozitif kabul).
- **Apple 1.2 / Play UGC:** kurallar ekranı (ilk giriş, `sakin_cember_rules`),
  mesaja dokun → Bildir / Engelle (engel YEREL, `sakin_cember_blocked` nick listesi),
  2 farklı cihaz bildirince otomatik gizle + herkesten kaldır (event `hide`),
  moderasyon paneli `chat-admin?token=PUSH_ADMIN_TOKEN` (gizle/göster/cihazı banla,
  ban listesi). Mesajlar 24 saat görünür, 48 saatten eskiler ara sıra silinir.
- **İstemci:** `CemberScreen` (MODÜL seviyesi bileşen), zIndex 100010 + OPAK zemin
  (yarı saydam gradyan altta Bugün'ü gösteriyordu). supabase-js DİNAMİK import
  (ayrı ~228 KB parça, açılışı büyütmez). Bugün sayacı `watchCemberCount` yalnızca
  Bugün'deyken + bağlantı tamamken iki odayı İZLER (katılmadan). Android geri tuşu
  Çember'i kapatır. Analitik `cember` {a: open/rules/send/report/block/crisis}.
- **Env (Netlify):** SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY (+ mevcut
  GROQ_API_KEY, PUSH_ADMIN_TOKEN). Eksikse Çember "kapalı" gösterir.
- ⏳ **MAĞAZA ÖNCESİ YAPILACAKLAR:** gizlilik politikası (kullanıcı içeriği, 24 saat
  saklama), App Store gizlilik etiketi "User Content", Apple yaş anketi (kullanıcılar
  arası iletişim), Play Data safety, App Review notuna moderasyon açıklaması.
- Test: sahte Supabase + sahte Groq ile sunucu uçtan uca (yavaş mod, link, kriz,
  küfür, AI abuse/spam/crisis, bildir→gizle, ban); tarayıcıda arayüz akışı
  (kilit, kurallar, geçmiş, gönder, bildir, engelle, link uyarısı, kriz kartı).
  ✅ Canlı proje (Frankfurt, `sakin-cember`) kuruldu, env girildi, chat-config/history
  `ok:true`. Canlı Realtime testi presence'ı doğruladı AMA bir AÇIK yakaladı:
- ⚠️ **KANALLAR PRIVATE OLMALI (güvenlik):** public kanalda genel (anon) anahtarla
  herkes `room:tr`'ye sahte `msg`/`hide` basıp moderasyonu atlayabiliyordu (anon
  anahtar uygulamada açık). Artık istemci `channel(..., {config:{private:true}})`,
  sunucu broadcast'i `private:true`, `cember.sql` sonunda `realtime.messages`
  politikaları: anon yalnızca DİNLER + presence yazar, broadcast yazma politikası
  BİLEREK YOK. Supabase > Realtime > Settings > "Allow public access" KAPALI.
  Bu üçünden biri bozulursa ya mesajlar gelmez ya açık geri döner.

## 🔗 DEEP LINK (App Store etkinliği için, Eyl 2026)

- Şema: `sakin://<yol>`. Yollar `DEEP_LINK_SCREENS` (src/App.jsx): `baglan`→mandala,
  `bugun`, `nefes`, `ses`, `cakra`→chakra. Bilinmeyen yol = normal açılış.
- Dinleyici bildirimdeki gibi MODÜL seviyesinde (`appUrlOpen` + `getLaunchUrl`,
  soğuk açılış tamponu, 3 sn tekrar filtresi), açılış katmanlarını kapatıp ekrana gider.
- Analitik `deeplink_open` {s} (track.mjs beyaz listede, raporda Bildirimler altında).
- Android: MainActivity'de `sakin` şemalı VIEW intent-filter.
- iOS: `Info.plist` CFBundleURLTypes'ta `sakin` şeması (kullanıcı onayladı, 1.4.2 ile
  gelir; 1.4.1 incelemedeydi). AppDelegate URL'yi zaten Capacitor'a iletiyor.
- Universal link (https://sakin.life/...) YOK: associated domains + AASA ister.

## Sıkça karşılaşılan tuzaklar (acı çekerek öğrenildi)

- **App.jsx'te betikle blok silerken desen İLK eşleşmeyi bulur.** Aynı başlık yorumu bileşen içinde de geçebiliyor (Orkestra state yorumu gibi): bir kez ~4800 satır yanlışlıkla silindi, HEAD'den geri yüklendi. Blok silmeden önce hem sınırları hem BEKLENEN UZUNLUĞU assert et.

- **"Build çalışmıyor / hata yine var"** → Önce kullanıcının çektiği branch'i SOR. Yanlış branch'ten derliyor olabilir. (Bir kere main fix'lerim CIpM8'e gitmedi, ortalık karıştı.)
- **iOS'ta `<datalist>` öneri göstermez.** Bunun için `SmartCityInput` özel bileşeni var.
- **iOS'ta dropdown seçimi `onMouseDown` ile sallantılı.** `onPointerDown` daha güvenli.
- **iOS embed iframe'i üstte safe-area boşluğu bırakır + scroll bounce yapar.** Çözüm: iframe `onLoad` içinde body'ye `padding-top:0` + `overscroll-behavior-y:none` inject.
- **`onClick` ile premium ekranına atan UX'ler kullanıcıyı soğutur.** Gerekmiyorsa engelle/yumuşat: onay al.
- **`store.owned` (purchases.js'de) eski/iptal makbuzları döner.** Premium'u sadece kullanıcı eylemi ile (subscribe/restore) ver. (H2 bulgusu: çözülmemiş, IAP)

## Önemli değişiklikten sonra DOĞRULA

- `npm run build`: temiz mi? Hata varsa pushla.
- Önemli refactor / IAP-yakını / iframe / sürüm değişikliği → bir `Agent` (general-purpose) görevlendirip PASS/FAIL al.
- Push öncesi kullanıcıya kısaca söyle: hangi branch, neyi değiştirdin, hangi commit SHA.

## Hata anında ilk üç soru

1. iOS'ta mı web'de mi?
2. Hangi sürümde son çalışıyordu?
3. Hangi branch'ten derliyor? (Mac'te `git branch --show-current`)

## 🪞 İÇSEL AYNA: SÜREKLİ ZEKÂ GELİŞTİRME (daimî iş, kullanıcı isteği)

**Ayna asla "bitti" sayılmaz.** Kullanıcı: "içsel aynayı sürekli daha zeki olması
için öneriler ver, her zaman geliştireceğiz". Yani Ayna'yla ilgili bir iş
yapıldığında, isteneni yapıp durma: gözlemlediğin zayıflığı da söyle ve somut
bir iyileştirme öner. Kullanıcı kötü bir cevap örneği paylaşırsa önce KÖK
SEBEBİ (hangi prompt satırı, hangi eksik veri) bul, kozmetik yama yapma.

**Nerede yaşıyor:** sistem prompt'u İSTEMCİDE (`src/App.jsx`
`buildMirrorSystemPrompt` + `aynaReasoningDirective`), backend (`netlify/
functions/ai-call.mjs`) yalnızca dil kilidi ve kitap RAG pasajlarını ekliyor.
Yani prompt değişikliği = App.jsx değişikliği = 4 branch'a sync.

**Şimdiye kadar yakalanan hatalar (tekrarlarsa buraya ekle):**
- **Soru yönünü ters okuma (Eyl 2026):** "az uyudum ama dinlenmiş hissediyorum"
  sorusuna model yakınma muamelesi yapıp olmayan bir soruna telkin yazdı. Kök
  sebep prompt'un kapanışıydı: "sorunun kaynağına işaret et, sevgi sunmayı
  hatırlat" her soruyu zorlanma varsayıyordu. Çözüm: zorlanma / olumlu deneyim /
  merak ayrımı, düşünme adımı 1b.
- **Ham veri sızıntısı (Eyl 2026):** "Güneş 64.6" gibi yorumlanmamış derece
  değeri metne girdi. Çözüm: ham sayı yasağı, veri ancak anlamına çevrilerek
  kullanılabilir.

**YAPILDI (Eyl 2026):**
1. ✅ **Geri bildirim döngüsü.** ⚠️ **Eyl 2026'ya kadar OYLAR KAYBOLUYORDU:**
   istemci `ayna_feedback` gönderiyordu ama `netlify/functions/track.mjs` bu olayı
   hiç işlemiyordu. Artık `ayna_up/down` + tip başına `aynat_<tip>_<v>` sayılıyor,
   rapordaki "Seçimler" bölümünde tip tip oran görünüyor. Yeni bir olay eklerken
   track.mjs'e de BEYAZ LİSTE satırı eklemeyi unutma, yoksa sessizce düşer.
   Ayna cevabının altında "Bu yanıt sana iyi geldi
   mi? Evet / Hayır". Mevcut ANONİM analitik hattını kullanır (`analytics.js`
   `track("ayna_feedback", {v:"up"|"down", ruya:0|1})`), soru ve cevap METNİ
   GİTMEZ. Kullanıcı analitiği kapattıysa hiçbir şey gönderilmez.
   **Raporu okumak:** `https://sakin.life/.netlify/functions/report?token=...&html=1`
   (REPORT_TOKEN env gerekiyor). Oran düşerse prompt'ta bir şey bozulmuş demektir.
2. ✅ **Regresyon seti.** `scripts/ayna-cases.json` (gerçek kötü vakalar) +
   `node scripts/ayna-eval.mjs` (canlı fonksiyona sorar, cevapları basar,
   bilinen kırmızı bayrakları işaretler). **Prompt'a her dokunuşta çalıştır.**
   Yeni bir kötü cevap görülürse vakayı dosyaya EKLE, yoksa aynı hata geri gelir.
3. ✅ **Süreklilik/örüntü.** `aynaSureklilikBaglami()` arşivden iki ucuz sinyal
   çıkarır: son 30 gündeki soru sayısı ve tekrar eden anahtar kelimeler. Cevap
   metinleri gönderilmez. Model, bugünkü soru geçmiş temayla gerçekten ilgiliyse
   örüntüyü adıyla söyler, değilse geçmişe hiç değinmez.
5. ✅ **Belirsizlikte netleştirme sorusu.** Yön gerçekten belirsizse model tahmin
   etmek yerine tek bir kısa soru sorar (hem sistem prompt'unda hem mesaj
   şablonunda).

4. ⏳ **Soru tipi yönlendiricisi: ÖLÇÜM PARÇASI YAPILDI, tam ayrım bekliyor.**
   `aynaSoruTipi(metin, ruyaModu)` yerel ve kaba bir sınıflandırıcı (ek AI
   çağrısı YOK, gecikme eklemez): beden / varolussal / zamanlama / iliski /
   karar / ruya / genel. Şu an iki işe yarıyor:
   - Prompt'a YUMUŞAK ipucu olarak geçiyor ("kaba tahmin, katılmıyorsan kendi
     okuduğunu esas al"), yani yanlış tahmin cevabı bozmaz.
   - Geri bildirim olayına etiket olarak gidiyor: `track("ayna_feedback",
     {v, tip})`. Artık "hangi tipte kötü cevap veriyoruz" VERİYLE cevaplanabilir.
   **Kalan iş:** yeterli oy birikince, kötü skorlu tiplere özel şablon yaz.
   Hepsini birden bölme, yalnızca veri kötü diyen tipi böl.
6. ⏳ **Kullanılmayan veriyi budama: İLK BUDAMA YAPILDI.**
   `LOUISE_HAY_REHBER` (~3100 karakter) HER soruya gidiyordu. Artık
   `LOUISE_HAY_KAPALI` KARA LİSTESİYLE yönetiliyor: varolussal, zamanlama,
   karar ve ruya tiplerinde gönderilmiyor, geri kalan her tipte gönderiliyor.
   ⚠️ **İlk denemede "yalnızca beden" diye BEYAZ liste kurmuştum, kullanıcı
   düzeltti ve haklıydı:** rehberin içeriği saf fizik değil, beden ile ZİHİN
   arasındaki eşleşmeler (depresyon, anksiyete, öfke, uyku, yorgunluk,
   kırgınlık maddeleri var) ve şifa yaklaşımı olumlama/affetme, yani duygusal
   çalışma. Duygusal ve ilişkisel sorularda da işe yarıyor. Bu yüzden
   sınıflandırıcıya `duygu` tipi eklendi ve kapı kara listeye çevrildi.
   **Ders: bir bağlam bloğunu budarken içeriğini OKU, adına bakarak karar verme.**
   **Kalan iş:** astro/HD/numeroloji bloklarının hangi tipte gerçekten
   katkı verdiğini ölçüp benzer şekilde budamak. Bu, 4'ün verisini bekliyor.

## Bağımlılık komutları (referans)

- `npm run build`: Vite ile web bundle
- `npx cap sync ios`: dist + Capacitor plugin'leri iOS'a kopyala
- `npx cap open ios`: Xcode aç

## Bilinen, çözülmemiş öğeler (Layer-2 TODOs)

- ~~IAP server-side receipt validation~~ **ÇÖZÜLDÜ:** `netlify/functions/verify-entitlement.mjs`
  Apple App Store Server API + Google Play Developer API'ye soruyor (altın kural #6'ya bak).
- ~~`H2`: foreground premium recheck `store.owned`'dan grant yapıyor~~ **ÇÖZÜLDÜ:**
  `initStore()` artık `isSubscribed()` ÇAĞIRMIYOR (otomatik grant yok, App.jsx ~5169);
  foreground doğrulaması sunucuya soruyor ve YALNIZCA `not_entitled`'da
  `revokeLocalPremium()` çağırıyor, yani revoke-only (App.jsx ~5262).
  Premium sadece iki yoldan verilir: kullanıcının Satın Al'ı veya Geri Yükle'si.
- ~~`H3`: `UIBackgroundModes=audio`~~ **KAPANDI, KULLANICI KARARI.**
  `AppDelegate.swift` açılışta `AVAudioSession.setCategory(.playback)` + `setActive(true)`
  yapıyor; `.playback` karışmayan bir kategori olduğu için Sakin açılınca kullanıcının
  müziği susuyor. Bu bir hata DEĞİL, TASARIM: "sakinleşmek için diğer seslerin
  kapanması iyi" (kullanıcı, Ağu 2026). Apple da sorun etmiyor. Değiştirme.
  Arka plan modu solfej/çakra seansları ekran kapalıyken sürsün diye gerekli;
  `silence.wav` keep-alive'ı da bu zincirin parçası (App.jsx `startSilenceKeepAlive`).
- Web/iOS branch tek noktada birleştirme (deploy branch'i main'e migrate).
  **DOĞRULANDI (Eyl 2026), switch GÜVENLİ:** gdkpd'de olup main'de OLMAYAN
  hiçbir web dosyası yok (`src/`, `public/`, `netlify/`, `netlify.toml`
  karşılaştırıldı); `netlify.toml` birebir aynı, fonksiyon sayısı 14/14,
  `public/embedded` 156/156.
  **Üstelik main DAHA GÜNCEL:** `netlify/functions/waitlist.mjs` ve
  `cosmic-energy.mjs` gdkpd'de hâlâ ESKİ v1 API'siyle duruyor (`export const
  handler`, `event.httpMethod`), main'de v2'ye taşınmış hâli var. Yani CANLI
  SİTE bu iki fonksiyonda bayat kod çalıştırıyor; switch bunu da düzeltir.
  İki küçük fark daha (zararsız): `public/daily-index/*.json` farklı zamanlarda
  üretilmiş, `public/embedded/sakintaslar/` iki dalda FARKLI derlenmiş bundle
  taşıyor ama her dal kendi içinde tutarlı (index.html kendi hash'ini
  gösteriyor), 404 riski yok. Switch sonrası taşlar embed'ini bir kez gözle.
  ✅ **YAPILDI (kullanıcı, Eyl 2026): Netlify production branch artık `main`.**
  Yani gdkpd ARTIK CANLI DEĞİL. Web değişikliklerini main'e işlemek yeterli;
  gdkpd'ye senkron ZORUNLU DEĞİL (yapılırsa da zarar vermez, sadece boş emek).
  Bir sonraki temizlikte gdkpd tamamen emekliye ayrılabilir.
