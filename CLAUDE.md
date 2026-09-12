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
   - **CANLI (Ağu 2026): App Store `1.3.8` · Play Store `1.3.8` (`node scripts/check-store-versions.mjs --check` ile doğrulandı).** Repoda hazırlanan: `1.3.9 / build 1`, Android `versionCode 12`. `latest-ios-version.json` `1.3.8` (otomatik, mağazayı yansıtıyor: 1.3.9 yayınlanınca kendi güncellenecek, ELLE bump etme).
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
    - **Keşfet giriş kapısı:** `SOULID_PREMIUM_GATE` (App.jsx başı) şu an `false` = herkese ücretsiz + "Yeni" rozeti. `true` yapmak kilidi ve Premium rozetini geri getirir (tek satır).
    - ⚠️ **TEK MERKEZ = Niyet-App (kullanıcı kararı: "soulid reposunu unut").** `cetinarda/SoulProfile` reposu ve soulprofile.life sitesi ARTIK TAKİP EDİLMİYOR. Tüm SoulID geliştirmesi `apps/soulid` içinde yapılır, `public/embedded/soulid/`'e derlenir, sakin.life'tan yayınlanır. Sebep: iki yeri elle senkron tutmak main↔gdkpd ayrışmasının aynısını doğuruyordu; ayrıca bu oturumun git erişimi yalnızca niyet-app'e yetkili (SoulProfile'a push proxy tarafından reddediliyor).
    - **Bağlanma testinin paylaşılabilir adresi:** `sakin.life/baglanma` (EN girişi `/attachment`). `netlify.toml` bunu `/embedded/soulid/attachment/`'a **301** ile yollar. **200 rewrite KULLANMA:** embed `basePath=/embedded/soulid` ile derlendiği için farklı bir yolda Next istemci router'ı yolu eşleştiremez, hydration/gezinme bozulur. Adres uygulama içinde `TEST_URL` (app/attachment/page.tsx) + hikâye görselinde yazılı; değiştirirsen ikisini de güncelle.
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
   - **Bu üçü neden:** üçü de günün her saatinde bitirilebiliyor. Dışarıda
     bırakılanlar: `aksam` (22:00'den önce açılmıyor, sabah kurulan kullanıcı
     ilk günü kapatamazdı), `gun` (görev AI'dan geliyor, ağ/limit hatası adımı
     tıkayabilir), `ses`/`chakra` (süre şartı var).
2. **Jenerik içerik açık** (`genericUnlocked`): nefes modları, solfeggio
   frekansları, niyet kelimeleri. 3. tünelden sonra kilit GERİ GELİR (kullanıcı
   kararı: kaybetme anı dönüşümü tetikler). Sürpriz olmasın diye deneme boyunca
   `TRIAL_TXT` bilgilendirmesi ekranlarda görünür.
3. **Yol seçimi ekranı** ("Hangi yoldan gidelim?": sakinleşmek / kendimi tanımak)
   yalnızca burada çıkar. ⚠️ ÖNCEDEN HER GÜN, SONSUZA KADAR çıkıyordu
   ("bir daha gösterme" seçeneği de kaldırılmıştı, kimse kapatamıyordu).
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

## 🌿 EVRİM + ORKESTRA (Ben ekranı) - kullanıcı isteği: "zeki ve eğlenceli olsun"

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

## ⏰ 1.3.9 BUILD ÖNCESİ HATIRLAT (kullanıcı isteği)

Kullanım ölçümü (anonim funnel) eklendi. 1.3.9 build/gönderiminde bu ikisini kullanıcıya HATIRLAT:
1. **Netlify env `REPORT_TOKEN`** ekli mi? Yoksa rapor kapalı. Ekli ise rapor: `https://sakin.life/.netlify/functions/report?token=...&html=1`
2. **App Store gizlilik etiketi:** bir sonraki iOS gönderiminde "Kullanım Verileri (kimliğe bağlı değil)" olarak işaretlenmeli. Görünür opt-out toggle Ailesi panelinde mevcut (analytics_toggle_label).

## Sıkça karşılaşılan tuzaklar (acı çekerek öğrenildi)

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
1. ✅ **Geri bildirim döngüsü.** Ayna cevabının altında "Bu yanıt sana iyi geldi
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
