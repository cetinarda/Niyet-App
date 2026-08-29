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
2. **Web Netlify branch = `claude/fix-text-overlap-spacing-gdkpd`** (apartılmış: apps/ kaynak YOK, sadece `src/` + `public/embedded/` bundle + `netlify/`). Web'i etkileyen değişiklikleri buraya **main'den getirerek** işle (asla doğrudan özellik ekleme): `git checkout origin/main -- src/ public/embedded/...` (netlify/ + embed-patches/ KORUNUR), build-gate, push.
   - **BİRLEŞTİRME PLANI (önerilen, kullanıcı onayladı):** `main` zaten web-deploy-able (src + bundle + netlify backend + toml hepsi var). Kullanıcı Netlify production branch'ini `main` yaparsa gdkpd emekliye ayrılır → manuel main→gdkpd deploy (asıl drift kaynağı) biter. Web/iOS karışmaz: tek `src/App.jsx`, `isNative` ile runtime ayrışır; `ios/` (iOS-only) ve `netlify/` (web-only) ayrı klasör. Netlify değişene kadar gdkpd canlı kalır.
   - **ALTIN DİSİPLİN (bu oturumun acı dersi):** git proxy bazen bayat ref + sahte "pushed" döndürür; container reset yerel ağacı eski tabana düşürür. **Her push'u SHA değil İÇERİKLE doğrula** (re-fetch + `grep -c marker`). Branch+HEAD'i edit ÖNCESİ doğrula. Her milestone'da commit+push.
   - Portekizce dil kodu = **`pt`** (eski `pt-BR` değil; `sakin_lang` "pt" yazılır, embed'ler "pt" bekler). Legacy pt-BR i18n bloğu kaldırıldı.
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
  Kod tarafı hazır: `main` web-deploy-able ve gdkpd artık main'in aynısı.
  Kalan adım KULLANICIDA: Netlify production branch'ini `main` yapmak.
