# Google Play Store Yükleme Kılavuzu — Sakin

> Bu kılavuz Sakin uygulamasının Google Play Store'a yüklenmesi için tüm adımları içerir.

---

## BÖLÜM 1: Ön Hazırlık

### 1.1 — Google Play Developer Hesabı

| Alan | Detay |
|---|---|
| **URL** | https://play.google.com/console |
| **Kayıt Ücreti** | $25 (tek seferlik) |
| **Gerekli** | Google hesabı, kimlik doğrulama, ödeme bilgisi |
| **Süre** | Hesap onayı 2-7 gün sürebilir |

### 1.2 — Gerekli Araçlar

| Araç | Minimum Versiyon |
|---|---|
| **Android Studio** | Hedgehog (2023.1) veya üzeri |
| **JDK** | 17+ |
| **Node.js** | 18+ |
| **Capacitor** | 8.x (projede mevcut) |
| **Gradle** | Android Studio ile gelir |

---

## BÖLÜM 2: Android Platform Kurulumu

### 2.1 — Capacitor Android Ekleme

```bash
# 1. Proje klasörüne git
cd /path/to/Niyet-App

# 2. Android platform paketini kur
npm install @capacitor/android

# 3. Android platformunu ekle
npx cap add android

# 4. Production build oluştur
npm run build

# 5. Android'e sync et
npx cap sync android

# 6. Android Studio'da aç
npx cap open android
```

### 2.2 — capacitor.config.json — Android Eklentisi

Mevcut config'e Android ayarları ekle:

```json
{
  "appId": "app.sakin.life",
  "appName": "Sakin",
  "webDir": "dist",
  "android": {
    "backgroundColor": "#000000",
    "allowMixedContent": false
  }
}
```

### 2.3 — Android Minimum Ayarlar

`android/app/build.gradle` dosyasında kontrol et:

```gradle
android {
    compileSdk 34
    defaultConfig {
        applicationId "app.sakin.life"
        minSdk 24          // Android 7.0+
        targetSdk 34       // Android 14
        versionCode 1
        versionName "1.2"
    }
}
```

---

## BÖLÜM 3: Uygulama İmzalama (Signing)

### 3.1 — Upload Key Oluşturma

```bash
keytool -genkey -v -keystore sakin-upload-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias sakin-key
```

Sorulacak bilgiler:
- **Keystore password:** Güçlü bir şifre belirle (KAYDET!)
- **First and Last Name:** Arda Cetin
- **Organization:** Sakin
- **City / State / Country:** TR

### 3.2 — Signing Config (build.gradle)

`android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file('sakin-upload-key.jks')
            storePassword 'KEYSTORE_SIFRESI'
            keyAlias 'sakin-key'
            keyPassword 'KEY_SIFRESI'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

> **KRİTİK:** `sakin-upload-key.jks` dosyasını ve şifreyi güvenli bir yerde sakla. Kaybedersen uygulamayı güncelleyemezsin! Google Play App Signing kullan (önerilir).

### 3.3 — Google Play App Signing (Önerilen)

Play Console'da "App Signing" etkinleştir. Google kendi imza anahtarını yönetir, sen sadece upload key kullanırsın. Daha güvenli.

---

## BÖLÜM 4: AAB (Android App Bundle) Oluşturma

### 4.1 — Build Adımları

```bash
# 1. Güncel kodu çek
git pull origin claude/check-sakin-life-update-CIpM8

# 2. Web build oluştur
npm run build

# 3. Android'e sync et
npx cap sync android

# 4. Android Studio'da aç
npx cap open android
```

### 4.2 — Android Studio'da AAB Oluşturma

1. **Build > Generate Signed Bundle / APK**
2. **Android App Bundle** seç → Next
3. Key store path: `sakin-upload-key.jks` seç
4. Şifreleri gir → Next
5. **release** seç → Create
6. AAB dosyası: `android/app/build/outputs/bundle/release/app-release.aab`

### 4.3 — Terminal ile AAB Oluşturma (Alternatif)

```bash
cd android
./gradlew bundleRelease
```

Çıktı: `android/app/build/outputs/bundle/release/app-release.aab`

---

## BÖLÜM 5: Google Play Console — Uygulama Oluşturma

### 5.1 — Yeni Uygulama

1. https://play.google.com/console → **Create app**
2. Bilgileri gir:

| Alan | Değer |
|---|---|
| **App name** | Sakin |
| **Default language** | Turkish — tr |
| **App or Game** | App |
| **Free or Paid** | Free |

3. Declarations'ları kabul et → **Create app**

### 5.2 — Store Listing (Ana Sayfa Bilgileri)

**Play Console > Store Presence > Main store listing**

#### Türkçe (Varsayılan Dil)

| Alan | Değer |
|---|---|
| **App name** | Sakin |
| **Short description** (max 80) | Kuş sesleri eşliğinde frekanslarla hizalan. Sabah niyetinden akşam kapanışına. |
| **Full description** (max 4000) | *Aşağıda Bölüm 6'da tam metin* |

#### English (Dil Ekle)

| Alan | Değer |
|---|---|
| **App name** | Sakin |
| **Short description** (max 80) | Align with frequencies and bird sounds. From morning intention to evening closing. |
| **Full description** (max 4000) | *Aşağıda Bölüm 6'da tam metin* |

---

## BÖLÜM 6: Açıklamalar — Tam Metin

### 6.1 — Türkçe Full Description

```
Sakin, sana bir şey öğretmez.
Sadece hatırlatır.

Günün koşusunda kendini unuttuğun anlarda, Sakin seni nazikçe içe çeker. Karmaşık programlar yok, görev listeleri yok, baskı yok. Sadece sen ve bugünkü niyetin.

☀️ Sabah Rutini
Günün başında bir niyet belirle. Seni en çok ifade eden 3 kelimeyi seç: huzur, cesaret, akış, sevgi... Gün boyu bu kelimeler sana yol gösterir.

🫧 Nefes Egzersizi
6 farklı nefes moduyla bedenine dön. Standart, diyafram, akciğer, 4-7-8, kutu ve sakinleştirici — hangisi sana iyi geliyorsa.

🎵 Ses Dalgaları & Kuş Sesleri
10 solfeggio frekansını kuş sesleri eşliğinde dinle. Guguk kuşundan kartala, bülbülden baykuşa — her frekansın kendine ait bir doğa sesi var. Rahatlama ve farkındalık deneyimi sunar.

💜 22 Çakra Farkındalığı
Fiziksel, ruhsal ve ilahi boyutta 22 enerji merkeziyle tanış. 60 saniyede farkındalık pratiği yap. Elini bölgende hisset, gözlerini kapat, nefesine odaklan.

🪞 İçsel Ayna — AI Destekli Yansıtma
Aklındaki soruyu yaz, yapay zeka sana kişisel bir farkındalık yansıtması sunsun. Duygusal farkındalık perspektifinden kişiselleştirilmiş içgörüler.

🔔 Gün İçi Hatırlatıcılar
Aynada kendine bak. Su iç. Güneşi hisset. Toprağa dokun. Bunlar görev değil — seni bedene ve ana bağlayan dokunuşlar.

🌙 Akşam Kapanışı
Bugün ne öğrendin? Neye şükrediyorsun? Birkaç cümle yeter. Gün kapanır, sen bütün hissedersin.

📊 Bağlantı & İlerleme
Gün serisi, frekans dinleme süresi ve tamamlanan adımlarla kendini takip et.

📋 Haftalık İçsel Rapor
Haftanın sonunda AI destekli kişisel rapor: frekans dinleme süren, ruh halin ve kişisel farkındalık yansıtması.

---

Sakin, karmaşık değil. Derin.
Sade tasarımı, yumuşak renkleri ve sessiz ritmiyle her gün yanında olmak için yapıldı.

Bu uygulama tıbbi teşhis veya tedavi amacı taşımaz. Kişisel farkındalık ve rahatlama deneyimi sunar. Sağlık sorunları için mutlaka bir uzmana danışınız.

Kendine dönmek için bir dakikan var.
```

### 6.2 — English Full Description

```
Sakin doesn't teach you anything.
It just reminds you.

When you lose yourself in the rush of the day, Sakin gently brings you back inward. No complex programs, no to-do lists, no pressure. Just you and today's intention.

☀️ Morning Ritual
Start your day by setting an intention. Choose 3 words that resonate with you most: peace, courage, flow, love... These words will guide you throughout the day.

🫧 Breathing Exercise
Return to your body with 6 breathing modes. Standard, diaphragm, lung expansion, 4-7-8, box breathing, and calming — whichever feels right for you.

🎵 Sound Waves & Bird Sounds
Listen to 10 solfeggio frequencies accompanied by bird sounds. From cuckoo to eagle, nightingale to owl — each frequency has its own nature sound. A relaxation and awareness experience.

💜 22 Chakra Awareness
Explore 22 energy centers across physical, spiritual, and divine dimensions. Practice a 60-second awareness exercise. Place your hand on the area, close your eyes, and focus on your breath.

🪞 Inner Mirror — AI-Powered Reflection
Write your question, and AI offers a personalized awareness reflection. Emotional awareness insights from a personal growth perspective.

🔔 Daily Reminders
Look at yourself in the mirror. Drink water. Feel the sun. Touch the earth. These are not tasks — they are gentle touches that connect you to your body and the present moment.

🌙 Evening Closing
What did you learn today? What are you grateful for? A few sentences are enough. The day closes, and you feel whole.

📊 Connection & Progress
Track your day streak, frequency listening time, and completed steps.

📋 Weekly Inner Report
At the end of the week, an AI-powered personal report: frequency listening duration, mood, and personal awareness reflection.

---

Sakin is not complex. It is deep.
With its minimal design, soft colors, and quiet rhythm — it is built to be by your side every day.

This app does not provide medical diagnosis or treatment. It offers a personal awareness and relaxation experience. Always consult a healthcare professional for health concerns.

You have one minute to return to yourself.
```

---

## BÖLÜM 7: Fiyatlandırma & Ödeme (Google Play Billing)

### 7.1 — Fiyat Modeli

| Alan | Değer |
|---|---|
| **App Price** | Free (Ücretsiz) |
| **In-App Purchases** | Evet |

### 7.2 — Google Play Billing Entegrasyonu

`cordova-plugin-purchase` zaten Google Play Billing'i destekler. `purchases.js`'e Android platformu eklenecek:

```javascript
// purchases.js'e eklenecek
store.register([
  { id: YEARLY_ID, type: ProductType.PAID_SUBSCRIPTION, platform: Platform.GOOGLE_PLAY },
  { id: LIFETIME_ID, type: ProductType.NON_CONSUMABLE, platform: Platform.GOOGLE_PLAY },
]);

// initialize'a ekle
await store.initialize([Platform.GOOGLE_PLAY]);
```

### 7.3 — Play Console'da Ürün Tanımlama

**Play Console > Monetize > Products > Subscriptions**

#### Yıllık Abonelik

| Alan | Değer |
|---|---|
| **Product ID** | `app.sakin.life.yearly` |
| **Name** | Yearly Premium / Yıllık Premium |
| **Description** | Tüm premium özelliklere erişim / Access to all premium features |
| **Billing period** | 1 Year |
| **Default price** | $4.99 |

**Play Console > Monetize > Products > In-app products**

#### Ömür Boyu Lisans

| Alan | Değer |
|---|---|
| **Product ID** | `app.sakin.life.lifetime` |
| **Name** | Lifetime License / Ömür Boyu Lisans |
| **Description** | Tek seferlik, tüm özellikler / One-time, all features |
| **Default price** | $19.99 |

---

## BÖLÜM 8: Görseller (Graphics Assets)

### 8.1 — Zorunlu Görseller

| Görsel | Boyut | Format | Not |
|---|---|---|---|
| **App icon** | 512 x 512 px | PNG (32-bit, alfa destekli) | Köşe yuvarlama Google otomatik yapar |
| **Feature graphic** | 1024 x 500 px | PNG veya JPG | Play Store üst banner |
| **Screenshots (Phone)** | Min 320px, Max 3840px | PNG veya JPG | Min 2 adet, max 8 adet |
| **Screenshots (Tablet)** | Min 320px, Max 3840px | PNG veya JPG | 7" ve 10" tablet (opsiyonel ama önerilir) |

### 8.2 — App Icon (512x512)

Mevcut 1024x1024 ikonu 512x512'ye küçült:

```bash
# macOS
sips -z 512 512 AppIcon-512@2x.png --out play-store-icon-512.png

# veya ImageMagick
convert AppIcon-512@2x.png -resize 512x512 play-store-icon-512.png
```

### 8.3 — Feature Graphic (1024x500)

Üst banner tasarımı:
- Koyu gradient arka plan (#0a0e1a → #1a1040)
- Ortada "Sakin" logosu
- Altında "Kendini hep hatırla" tagline
- Minimal, temiz tasarım

### 8.4 — Screenshot Boyutları (Önerilen)

| Cihaz | Boyut | Not |
|---|---|---|
| **Phone** | 1080 x 1920 px (veya 1284 x 2778) | 16:9 veya 19.5:9 oran |
| **Tablet 7"** | 1200 x 1920 px | Opsiyonel |
| **Tablet 10"** | 1600 x 2560 px | Opsiyonel |

> **Not:** Apple için hazırlanan screenshot'ları boyut ayarlayarak kullanabilirsin.

### 8.5 — Screenshot Planı (Aynı 7 ekran)

| # | Ekran | Başlık (TR) | Başlık (EN) |
|---|---|---|---|
| 1 | Karşılama | Kendini hep hatırla | Always remember yourself |
| 2 | Sabah Niyeti | Günün niyetini belirle | Set your daily intention |
| 3 | Nefes Egzersizi | Nefesinle bedenine dön | Return to your body |
| 4 | Ses Dalgaları | Kuş sesleri eşliğinde frekanslar | Frequencies with bird sounds |
| 5 | Çakra Farkındalığı | 22 enerji merkezi farkındalığı | 22 energy center awareness |
| 6 | İçsel Ayna (AI) | AI destekli kişisel yansıtma | AI-powered personal reflection |
| 7 | İlerleme | Günlük ilerlemeyi takip et | Track your daily progress |

---

## BÖLÜM 9: Content Rating (İçerik Derecelendirmesi)

**Play Console > Policy and programs > App content > Content rating**

IARC anketini doldur:

| Soru | Yanıt |
|---|---|
| Violence | No |
| Sexual Content | No |
| Language | No |
| Controlled Substances | No |
| User Interaction | No (AI özelliği isteğe bağlı, kullanıcılar birbirleriyle etkileşmez) |
| Shares Location | No |
| Contains Ads | No |
| Gambling | No |

**Beklenen Sonuç:** PEGI 3 / Everyone

---

## BÖLÜM 10: Data Safety (Veri Güvenliği)

**Play Console > Policy and programs > App content > Data safety**

### 10.1 — Toplanan Veriler

| Soru | Yanıt |
|---|---|
| **Does your app collect or share data?** | Yes |
| **Is all collected data encrypted in transit?** | Yes (HTTPS) |
| **Do you provide a way for users to request data deletion?** | Yes (uygulama verisi cihazda, sıfırla ile silinir) |

### 10.2 — Veri Türleri

| Veri Türü | Collected | Shared | Purpose |
|---|---|---|---|
| **Other User Content** | Yes | No | App Functionality (AI analizi için) |

### 10.3 — Toplanmayan Veriler

Location, Personal Info, Financial Info, Health & Fitness, Messages,
Photos/Videos, Audio, Files, Calendar, Contacts, App Activity,
Web Browsing, Device/IDs

---

## BÖLÜM 11: Play Console — Diğer Gerekli Bilgiler

### 11.1 — App Access

| Alan | Değer |
|---|---|
| **All functionality available without special access** | Yes |
| **Login required** | No |

### 11.2 — Ads

| Alan | Değer |
|---|---|
| **Contains ads** | No |

### 11.3 — Target Audience

| Alan | Değer |
|---|---|
| **Target age group** | 18+ (çocuklara yönelik değil) |
| **Appeals to children** | No |

> **ÖNEMLİ:** Google Play'de yaş hedefi Apple'dan farklı. "4+" yerine "18+" veya "Everyone" seç. Çocuklara yönelik olmadığını belirt — COPPA riski önlenir.

### 11.4 — Category & Tags

| Alan | Değer |
|---|---|
| **App Category** | Lifestyle |
| **Tags** | Meditation, Relaxation, Mindfulness, Breathing |

### 11.5 — Contact Details

| Alan | Değer |
|---|---|
| **Email** | destek@sakin.app |
| **Website** | https://sakin.app |
| **Privacy Policy URL** | https://sakin.app/privacy |

---

## BÖLÜM 12: AAB Yükleme ve Yayınlama

### 12.1 — Internal Testing (İlk Adım — Önerilir)

1. **Play Console > Testing > Internal testing > Create new release**
2. AAB dosyasını sürükle/yükle (`app-release.aab`)
3. Release name: `1.2 (1)`
4. Release notes gir (TR + EN)
5. **Save** → **Review release** → **Start rollout**

### 12.2 — Closed Testing (Beta)

1. **Play Console > Testing > Closed testing > Create track**
2. Tester email listesi ekle
3. AAB yükle → Release notes gir → Start rollout

### 12.3 — Production Release

1. **Play Console > Production > Create new release**
2. AAB dosyasını yükle
3. Release notes gir:

**Türkçe:**
```
• Kuş sesleri eşliğinde 10 solfeggio frekansı
• 22 çakra farkındalığı pratiği
• AI destekli kişisel yansıtma
• 6 farklı nefes egzersizi modu
• Sabah niyeti ve akşam kapanış ritüeli
• Haftalık AI içsel rapor
```

**English:**
```
• 10 solfeggio frequencies with bird sounds
• 22 chakra awareness practice
• AI-powered personal reflection
• 6 different breathing exercise modes
• Morning intention and evening closing ritual
• Weekly AI inner report
```

4. **Review release** → **Start rollout to Production**

### 12.4 — İnceleme Süresi

| Platform | Süre |
|---|---|
| **Internal Testing** | Anında (inceleme yok) |
| **Closed Testing** | Birkaç saat |
| **Production (ilk yükleme)** | 3-7 gün |
| **Production (güncelleme)** | 1-3 gün |

---

## BÖLÜM 13: Android'e Özel Kod Değişiklikleri

### 13.1 — purchases.js Güncelleme

```javascript
import { Capacitor } from "@capacitor/core";

const YEARLY_ID = "app.sakin.life.yearly";
const LIFETIME_ID = "app.sakin.life.lifetime";
const isNative = Capacitor.isNativePlatform();
const platform = Capacitor.getPlatform(); // "ios" | "android" | "web"

export async function initStore() {
  if (!isNative || !window.CdvPurchase) return false;
  const { store, ProductType, Platform } = window.CdvPurchase;

  const storePlatform = platform === "ios"
    ? Platform.APPLE_APPSTORE
    : Platform.GOOGLE_PLAY;

  store.register([
    { id: YEARLY_ID, type: ProductType.PAID_SUBSCRIPTION, platform: storePlatform },
    { id: LIFETIME_ID, type: ProductType.NON_CONSUMABLE, platform: storePlatform },
  ]);

  store.when()
    .approved(transaction => transaction.verify())
    .verified(receipt => {
      receipt.finish();
      localStorage.setItem("sakin_premium", "1");
      if (purchaseUpdateCallback) purchaseUpdateCallback(true);
    });

  await store.initialize([storePlatform]);
  return true;
}
```

### 13.2 — StatusBar / NavigationBar

```javascript
// Android navigation bar rengini ayarla
if (platform === "android") {
  StatusBar.setBackgroundColor({ color: "#000000" });
  // NavigationBar eklentisi gerekebilir
}
```

### 13.3 — Back Button Handler (Android)

```javascript
import { App } from "@capacitor/app";

// Android geri tuşu yönetimi
App.addListener("backButton", ({ canGoBack }) => {
  if (screen !== "sabah") {
    // Önceki ekrana dön
    setScreen("sabah");
  } else {
    App.exitApp();
  }
});
```

---

## BÖLÜM 14: Apple vs Google Play Karşılaştırması

| Alan | Apple App Store | Google Play Store |
|---|---|---|
| **Hesap Ücreti** | $99/yıl | $25 (tek seferlik) |
| **Build Format** | IPA (Xcode Archive) | AAB (Android App Bundle) |
| **İmzalama** | Apple otomatik | Upload key + App Signing |
| **İnceleme Süresi** | 24-48 saat | 3-7 gün (ilk), 1-3 gün (güncelleme) |
| **Ödeme Sistemi** | StoreKit (IAP) | Google Play Billing |
| **Screenshot Boyutu** | 1290x2796, 1242x2688 | 1080x1920+ (esnek) |
| **Icon Boyutu** | 1024x1024 | 512x512 |
| **Feature Graphic** | Yok | 1024x500 (zorunlu) |
| **Kategori** | Lifestyle + Entertainment | Lifestyle |
| **Yaş Sınıfı** | 4+ | IARC (Everyone / 18+) |
| **Privacy** | App Privacy (labels) | Data Safety Form |
| **Komisyon** | %30 (ilk yıl %15) | %15 (ilk $1M), sonra %30 |

---

## BÖLÜM 15: Yayınlama Öncesi Kontrol Listesi

### Teknik Kontroller
- [ ] `@capacitor/android` kuruldu
- [ ] `npx cap add android` çalıştırıldı
- [ ] `npm run build && npx cap sync android` başarılı
- [ ] Upload key (JKS) oluşturuldu ve güvenli yerde saklandı
- [ ] AAB dosyası oluşturuldu (signed release build)
- [ ] `cordova-plugin-purchase` Android'de çalışıyor
- [ ] Android geri tuşu yönetimi eklendi
- [ ] Tüm ekranlar Android'de test edildi

### Play Console Kontrolleri
- [ ] Uygulama oluşturuldu (app.sakin.life)
- [ ] Store listing tamamlandı (TR + EN)
- [ ] App icon 512x512 yüklendi
- [ ] Feature graphic 1024x500 yüklendi
- [ ] Screenshots yüklendi (min 2 adet telefon)
- [ ] Content rating anketi tamamlandı
- [ ] Data safety formu dolduruldu
- [ ] Target audience ayarlandı (18+)
- [ ] Privacy Policy URL girildi
- [ ] Contact details girildi

### Ödeme Kontrolleri
- [ ] Subscription oluşturuldu: `app.sakin.life.yearly` — $4.99/yıl
- [ ] In-app product oluşturuldu: `app.sakin.life.lifetime` — $19.99
- [ ] purchases.js'te Google Play platformu eklendi
- [ ] Test satın almaları çalışıyor (internal testing)

### İçerik Kontrolleri
- [ ] Tıbbi/şifa ifadeleri temizlenmiş (Apple düzeltmeleri Android'de de geçerli)
- [ ] AI consent modal'ı çalışıyor
- [ ] LemonSqueezy kodu Android'de de devre dışı (sadece web)
- [ ] Açıklamalarda "şifa", "tedavi", "healing" YOK

---

## BÖLÜM 16: Yaygın Google Play Red Nedenleri

| Neden | Açıklama | Çözüm |
|---|---|---|
| **Metadata policy** | Açıklamada yanıltıcı bilgi | Doğru, net açıklamalar yaz |
| **Impersonation** | Başka uygulamayı taklit etme | Orijinal tasarım ve isim kullan |
| **Data Safety** | Form eksik/yanlış | Data safety formunu doğru doldur |
| **Target audience** | Çocuklara yönelik gibi görünme | 18+ hedef kitle belirt |
| **Payments** | Google Play dışı ödeme | Uygulama içinde sadece Google Billing kullan |
| **Health claims** | Tıbbi iddialar | Farkındalık dili kullan (Apple ile aynı) |
| **User data** | Veri toplama beyanı eksik | Privacy policy + data safety eksiksiz olmalı |
| **Functionality** | Uygulama çöküyor/açılmıyor | İyice test et, crash log'ları kontrol et |

---

## BÖLÜM 17: Adım Adım Özet

```
1. Google Play Developer hesabı aç ($25)
2. npm install @capacitor/android
3. npx cap add android
4. Upload key oluştur (keytool)
5. npm run build && npx cap sync android
6. Android Studio'da test et
7. Signed AAB oluştur
8. Play Console'da uygulama oluştur
9. Store listing doldur (TR + EN)
10. Görselleri yükle (icon, feature graphic, screenshots)
11. Content rating + Data safety doldur
12. In-app products oluştur ($4.99/yıl + $19.99)
13. Internal testing'e yükle → test et
14. Production'a yükle → incelemeye gönder
15. 3-7 gün bekle → yayında!
```

---

**Son güncelleme:** Mayıs 2026
**Bundle ID:** app.sakin.life
**Geliştirici:** Arda Cetin — destek@sakin.app
