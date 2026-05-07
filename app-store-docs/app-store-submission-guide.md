# App Store Yeniden Yükleme Kılavuzu — Sakin v1.1

> Bu kılavuz, Apple'ın 1.4.1 (Safety: Physical Harm) ve 2.3.8 (Accurate Metadata) ret gerekçelerini çözmek için hazırlanmıştır.

---

## BÖLÜM 1: Apple Ret Gerekçeleri ve Çözümler

### 1.4.1 — Safety: Physical Harm (ÇÖZÜLDÜ)
**Sorun:** Uygulama içinde tıbbi teşhis, tedavi ve şifa iddiaları vardı.

**Yapılan düzeltmeler:**
- ✅ Tüm organ bağlantıları kaldırıldı (böbrek üstü bezleri, timus, tiroid, epifiz vb.)
- ✅ "DNA onarımı", "Hücresel uyum", "Travma temizliği" ifadeleri kaldırıldı
- ✅ Louise Hay hastalık-duygu eşleştirmesi kaldırıldı → "Duygusal Farkındalık Rehberi" olarak değiştirildi
- ✅ Reiki tedavi protokolleri kaldırıldı → "Enerji Farkındalık Rehberi" olarak değiştirildi
- ✅ Şifalı bitki tavsiyeleri kaldırıldı
- ✅ AI promptlarına "Asla tıbbi teşhis koyma" uyarısı eklendi
- ✅ Frekans açıklamalarında "Mucize Tonu", "aktive eder" ifadeleri kaldırıldı
- ✅ "aktive olduğunda" → "deneyimlendiğinde" olarak değiştirildi
- ✅ Sözlükte "enerji şifa yöntemi" → "farkındalık pratiği" olarak değiştirildi
- ✅ Nefes açıklamalarında "parasempatik sistemi aktive eder" kaldırıldı
- ✅ Tıbbi uyarı metni tüm AI yanıtlarına eklendi

### 2.3.8 — Accurate Metadata (ÇÖZÜLDÜ)
**Sorun:** Metadata uygulama içeriğiyle uyuşmuyordu, harici ödeme mekanizması vardı.

**Yapılan düzeltmeler:**
- ✅ LemonSqueezy ödeme entegrasyonu iOS sürümünden kaldırıldı (sadece web'de kalacak)
- ✅ Kategori: Health & Fitness → Entertainment olarak değiştirildi
- ✅ Anahtar kelimelerden "reiki" ve "wellness" kaldırıldı
- ✅ "Çakra Yükselişi" → "Çakra Farkındalığı" olarak değiştirildi
- ✅ Fiyat modeli: Ücretli uygulama → Ücretsiz + $4.99/yıl abonelik olarak değiştirildi
- ✅ Açıklamalara abonelik bilgisi ve yasal metinler eklendi

---

## BÖLÜM 2: App Store Connect'e Girilecek Bilgiler

### 2.1 — App Information

| Alan | Değer |
|---|---|
| **Name** | Sakin |
| **Subtitle (TR)** | Kendini hep hatırla. |
| **Subtitle (EN)** | Always remember yourself. |
| **Primary Category** | Lifestyle |
| **Secondary Category** | Entertainment |
| **Content Rights** | Does not contain third-party content |
| **Age Rating** | 4+ (no objectionable content) |

### 2.2 — Pricing and Availability

| Alan | Değer |
|---|---|
| **App Price** | Free (Ücretsiz) |
| **Availability** | All territories |
| **Pre-Order** | Hayır |

### 2.3 — In-App Purchases (Subscriptions)

**App Store Connect > Monetization > Subscriptions** bölümünden:

1. **Subscription Group** oluştur: `Sakin Premium`
2. **Ürün ekle:**

| Alan | Değer |
|---|---|
| **Reference Name** | Sakin Yearly Access |
| **Product ID** | `app.sakin.life.yearly` |
| **Type** | Auto-Renewable Subscription |
| **Duration** | 1 Year |
| **Price** | $4.99 (Tier 5) |
| **Display Name (TR)** | Sakin Yıllık Erişim |
| **Display Name (EN)** | Sakin Yearly Access |
| **Description (TR)** | Tüm özelliklere sınırsız erişim. Yıllık olarak otomatik yenilenir. |
| **Description (EN)** | Unlimited access to all features. Renews automatically every year. |

3. **Subscription Group Localization:**

| Alan (TR) | Değer |
|---|---|
| **Subscription Group Display Name** | Sakin Premium |
| **App-Specific Shared Secret** | Otomatik oluşturulur |

### 2.4 — Version Information (TR)

| Alan | Değer |
|---|---|
| **Promotional Text** | Kuş sesleri eşliğinde frekanslarla hizalan. Sabah niyetinden akşam kapanışına, gün boyu kendine dönmeni sağlayan sade bir yol arkadaşı. |
| **Description** | `app-store-description-TR.md` dosyasındaki tam metin + abonelik bilgisi |
| **Keywords** | `sakin,farkındalık,meditasyon,nefes,çakra,frekans,kuş sesi,günlük,niyet,rahatlama` |
| **Support URL** | https://sakin.app |
| **Marketing URL** | https://sakin.app |
| **Privacy Policy URL** | https://sakin.app/privacy |

### 2.5 — Version Information (EN)

| Alan | Değer |
|---|---|
| **Promotional Text** | Align with frequencies accompanied by bird sounds. A calm daily companion that brings you back to yourself, from morning intention to evening closing. |
| **Description** | `app-store-description-EN.md` dosyasındaki tam metin + subscription info |
| **Keywords** | `calm,mindfulness,meditation,breathing,chakra,frequency,bird sounds,intention,daily,relaxation` |
| **Support URL** | https://sakin.app |
| **Marketing URL** | https://sakin.app |
| **Privacy Policy URL** | https://sakin.app/privacy |

### 2.6 — What's New (v1.1)

**Türkçe:**
```
• Tüm içerikler güncellendi ve iyileştirildi
• Farkındalık odaklı yeni deneyim
• Kuş sesleri eşliğinde frekans dinleme
• Performans iyileştirmeleri
```

**English:**
```
• All content updated and improved
• New awareness-focused experience
• Frequency listening with bird sounds
• Performance improvements
```

### 2.7 — App Review Information

| Alan | Değer |
|---|---|
| **Contact First Name** | Arda |
| **Contact Last Name** | Cetin |
| **Contact Email** | destek@sakin.app |
| **Contact Phone** | (telefon numaranı gir) |
| **Demo Account** | Not required |
| **Notes** | `app-review-notes.md` dosyasındaki tam metni yapıştır |

### 2.8 — App Privacy (Data Types)

**App Store Connect > App Privacy** bölümünden:

**"Does your app collect any data?"** → **Yes**

Seçilecek kategori:
1. **Other Data > Other Data Types**
   - Data Type: User Content
   - Collected: Yes
   - Linked to User: No
   - Used for Tracking: No
   - Purpose: App Functionality

2. **Purchases > Purchase History**
   - Data Type: Purchase History (StoreKit)
   - Collected: Yes
   - Linked to User: No
   - Used for Tracking: No
   - Purpose: App Functionality

---

## BÖLÜM 3: Screenshot Planı

### 3.1 — Gerekli Boyutlar

| Cihaz | Boyut | Zorunlu |
|---|---|---|
| iPhone 6.7" (15 Pro Max, 16 Pro Max) | 1290 x 2796 px | ✅ Evet |
| iPhone 6.5" (11 Pro Max, XS Max) | 1242 x 2688 px | ✅ Evet |
| iPhone 5.5" (8 Plus, SE) | 1242 x 2208 px | ✅ Evet |
| iPad Pro 12.9" (6th gen) | 2048 x 2732 px | ✅ iPad desteği varsa |

> **Not:** 6.7" ve 6.5" için aynı görseli kullanabilirsin — Apple otomatik ölçekler. Minimum 3, maksimum 10 screenshot.

### 3.2 — Screenshot Sırası ve İçerik (7 Screenshot)

Her screenshot'ta üstte kısa bir başlık metni, altta uygulama ekranı gösterilecek.

#### Screenshot 1: Karşılama
- **Ekran:** Giriş sayfası — "Sakin" logosu, arka plan görseli
- **Başlık (TR):** "Kendini hep hatırla"
- **Başlık (EN):** "Always remember yourself"
- **Tasarım notu:** Koyu mor/lacivert arka plan, minimal tasarım. Logo ve tagline ortada.

#### Screenshot 2: Sabah Niyeti
- **Ekran:** Niyet yazma + kelime seçimi ekranı (3 kelime seçili)
- **Başlık (TR):** "Günün niyetini belirle"
- **Başlık (EN):** "Set your daily intention"
- **Tasarım notu:** Kelime seçim kutucukları parlak/seçili görünsün

#### Screenshot 3: Nefes Egzersizi
- **Ekran:** Nefes animasyonu çalışırken (daire genişleme anında)
- **Başlık (TR):** "Nefesinle bedenine dön"
- **Başlık (EN):** "Return to your body"
- **Tasarım notu:** Nefes dairesi en geniş halinde, "Nefes Al" görünsün

#### Screenshot 4: Ses Dalgaları
- **Ekran:** Solfeggio frekansları listesi + bir frekans çalıyor, dalga animasyonu aktif
- **Başlık (TR):** "Kuş sesleri eşliğinde frekanslar"
- **Başlık (EN):** "Frequencies with bird sounds"
- **Tasarım notu:** Dalga animasyonu ve kuş ikonu aktif görünsün

#### Screenshot 5: Çakra Farkındalığı
- **Ekran:** İnsan bedeni üzerinde çakra noktaları, bağlantı pratiği ekranı
- **Başlık (TR):** "22 enerji merkezi farkındalığı"
- **Başlık (EN):** "22 energy center awareness"
- **Tasarım notu:** İnsan silueti üzerinde renkli çakra noktaları

#### Screenshot 6: İçsel Ayna (AI)
- **Ekran:** AI farkındalık yansıtması sonuç ekranı
- **Başlık (TR):** "AI destekli kişisel yansıtma"
- **Başlık (EN):** "AI-powered personal reflection"
- **Tasarım notu:** Yansıtma metninin bir kısmı okunabilir görünsün

#### Screenshot 7: İlerleme & Bağlantı
- **Ekran:** Gün serisi, tamamlanan adımlar, mandala ilerleme göstergesi
- **Başlık (TR):** "Günlük ilerlemeyi takip et"
- **Başlık (EN):** "Track your daily progress"
- **Tasarım notu:** Streak sayısı ve tamamlanmış adımlar görünsün

### 3.3 — Screenshot Tasarım Kuralları

1. **Arka plan:** Koyu gradient (#0a0e1a → #1a1040) — uygulamanın temasıyla uyumlu
2. **Başlık fontu:** SF Pro Display Bold veya benzeri, beyaz renk, üst 1/4'te
3. **Cihaz çerçevesi:** Opsiyonel — Apple artık çerçevesiz screenshot'ları tercih ediyor
4. **Metin dili:** TR ve EN ayrı lokalizasyon olarak yüklenir
5. **Yasak içerik:** Screenshot'larda "şifa", "tedavi", "onarım" kelimeleri OLMAMALI

### 3.4 — Screenshot Üretim Araçları

| Araç | Kullanım | Fiyat |
|---|---|---|
| **Xcode Simulator** | Screenshot alma | Ücretsiz |
| **Figma** | Çerçeve + metin ekleme | Ücretsiz plan yeterli |
| **Screenshots Pro** | Otomatik App Store formatı | Ücretli |
| **LaunchMatic** | AI destekli screenshot üretimi | Ücretli |

### 3.5 — Screenshot Alma Adımları

1. Xcode'da simulator aç (iPhone 15 Pro Max)
2. Uygulamayı çalıştır
3. Her ekranı uygun duruma getir
4. `Cmd + S` ile simulator screenshot al
5. Figma'da 1290x2796 frame oluştur
6. Üste başlık metni ekle
7. Alta screenshot'ı yerleştir
8. PNG olarak export et
9. Aynısını 6.5" ve 5.5" boyutlarında tekrarla

---

## BÖLÜM 4: App Icon

| Alan | Değer |
|---|---|
| **Boyut** | 1024 x 1024 px |
| **Format** | PNG, şeffaf arka plan YOK |
| **Köşe yuvarlama** | Apple otomatik uygular — kare olarak yükle |
| **Tasarım** | Mevcut Sakin ikonu |

---

## BÖLÜM 5: Build Yükleme Adımları

### 5.1 — Kod Hazırlığı

```bash
# 1. Son kodu çek
git pull origin claude/check-sakin-life-update-CIpM8

# 2. Production build oluştur
npm run build

# 3. Capacitor sync
npx cap sync ios

# 4. Xcode'da aç
npx cap open ios
```

### 5.2 — Xcode Ayarları

| Alan | Değer |
|---|---|
| **Bundle Identifier** | app.sakin.life |
| **Version** | 1.1 |
| **Build** | 2 |
| **Deployment Target** | iOS 16.0 |
| **Signing** | Automatic (Apple Developer Account) |
| **Capabilities** | Push Notifications (local only) |

### 5.3 — StoreKit Yapılandırması

Xcode'da StoreKit entegrasyonu:

1. **Capacitor Plugin ekle** (opsiyonel — native veya plugin):
   ```bash
   npm install @capawesome/capacitor-in-app-purchases
   npx cap sync ios
   ```

2. **StoreKit Configuration File** oluştur (test için):
   - Xcode > File > New > StoreKit Configuration File
   - Auto-Renewable Subscription ekle: `app.sakin.life.yearly`
   - Price: $4.99
   - Duration: 1 Year

3. **App Store Connect'te ürün oluştur** (production):
   - Monetization > Subscriptions
   - Subscription Group: "Sakin Premium"
   - Product: `app.sakin.life.yearly` — $4.99/year

### 5.4 — Archive ve Yükleme

```
1. Xcode > Product > Archive
2. Archive tamamlanınca "Distribute App" tıkla
3. "App Store Connect" seç
4. "Upload" seç
5. Tüm seçenekleri varsayılan bırak
6. "Upload" ile yükle
7. App Store Connect'te build'in işlenmesini bekle (5-15 dk)
```

### 5.5 — Yükleme Sonrası Kontrol

- [ ] Build, App Store Connect'te "Ready to Submit" olarak görünüyor
- [ ] Version bilgisi doğru (1.1, Build 2)
- [ ] Tüm screenshot'lar yüklendi (TR + EN)
- [ ] Açıklamalar girildi (TR + EN)
- [ ] Keywords girildi
- [ ] Abonelik ürünü oluşturuldu ve "Ready to Submit" durumunda
- [ ] Privacy Policy URL çalışıyor
- [ ] Terms of Use URL çalışıyor
- [ ] Review Notes girildi
- [ ] App Privacy tamamlandı

---

## BÖLÜM 6: Submission Öncesi Kontrol Listesi

### Kod Kontrolleri
- [ ] LemonSqueezy kodu iOS sürümünde devre dışı/kaldırıldı
- [ ] Apple IAP (StoreKit) entegrasyonu çalışıyor
- [ ] Tüm tıbbi/şifa ifadeleri temizlendi (1.4.1)
- [ ] AI promptlarında tıbbi uyarı var
- [ ] Frekans açıklamalarında "deneyimsel dil" kullanılıyor
- [ ] Privacy consent modal'ı AI kullanımından önce gösteriliyor
- [ ] Abonelik paywall'ı düzgün çalışıyor
- [ ] Abonelik yönetim linki çalışıyor

### Metadata Kontrolleri
- [ ] Kategori: Lifestyle + Entertainment (Health & Fitness DEĞİL)
- [ ] Keywords'te "reiki", "wellness", "healing" YOK
- [ ] Açıklamalarda "şifa", "tedavi", "onarım" YOK
- [ ] Abonelik bilgisi açıklamanın sonunda var
- [ ] Privacy Policy ve Terms of Use linkleri çalışıyor
- [ ] Screenshot'larda tıbbi/şifa içerik YOK

### Yasal Kontroller
- [ ] Privacy Policy web'de yayında
- [ ] Terms of Use web'de yayında (abonelik için zorunlu)
- [ ] Abonelik auto-renew bilgisi açıklamada var
- [ ] İptal talimatı açıklamada var

---

## BÖLÜM 7: Sık Yapılan Hatalar ve Kaçınılması Gerekenler

| Hata | Sonuç | Çözüm |
|---|---|---|
| "DNA onarımı" gibi ifadeler | 1.4.1 ret | Deneyimsel dil kullan |
| Health & Fitness kategorisi | 2.3.8 ret | Lifestyle + Entertainment |
| LemonSqueezy iOS'ta | 3.1.1 ret (harici ödeme) | Sadece Apple IAP |
| Privacy Policy eksik | 5.1.1 ret | sakin.app/privacy yayında olmalı |
| Terms of Use eksik | 3.1.2 ret (abonelik) | sakin.app/terms yayında olmalı |
| AI consent modal yok | 5.1.2 ret | İlk kullanımda onay modal'ı |
| "Reiki" keyword'de | 1.4.1 / 2.3.8 risk | Keywords'ten kaldırıldı |
| Abonelik bilgisi açıklamada yok | 3.1.2 ret | Açıklama sonuna eklendi |
| Screenshot'ta "şifa" yazıyor | 2.3.8 ret | Temiz screenshot'lar |

---

## BÖLÜM 8: Yapılması Gereken Web Sayfaları

Aşağıdaki sayfaların `sakin.app` domain'inde yayında olması gerekir:

### 8.1 — Privacy Policy (sakin.app/privacy)
`privacy-policy-TR.md` dosyasını web sayfası olarak yayınla. İngilizce versiyonu da olmalı.

### 8.2 — Terms of Use (sakin.app/terms)
Apple abonelik gereksinimleri gereği aşağıdakileri içermeli:
- Abonelik fiyatı ve süresi
- Otomatik yenileme bilgisi
- İptal talimatları
- Para iade politikası (Apple'ın standart politikasına yönlendirme)
- İletişim bilgisi

### 8.3 — Support (sakin.app)
- SSS bölümü
- İletişim e-postası: destek@sakin.app

---

**Son güncelleme:** Mayıs 2026
**Hazırlayan:** Geliştirici ekip
