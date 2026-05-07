# App Store Metadata — Sakin

## Temel Bilgiler

| Alan | Değer |
|---|---|
| **Uygulama Adı** | Sakin |
| **Altyazı (Subtitle — TR)** | Kendini hep hatırla. |
| **Altyazı (Subtitle — EN)** | Always remember yourself. |
| **Kategori (Birincil)** | Lifestyle (Yaşam Tarzı) |
| **Kategori (İkincil)** | Entertainment (Eğlence) |
| **Yaş Sınıfı** | 4+ |
| **Dil** | Türkçe (birincil), İngilizce |
| **Ülkeler** | Türkiye (birincil), tüm bölgeler |

---

## Anahtar Kelimeler (Keywords — max 100 karakter)

### Türkçe Keywords (80 karakter)
```
sakin,farkındalık,meditasyon,nefes,çakra,frekans,kuş sesi,günlük,niyet,rahatlama
```

### İngilizce Keywords (93 karakter)
```
calm,mindfulness,meditation,breathing,chakra,frequency,bird sounds,intention,daily,relaxation
```

> **Kaldırılanlar:** `reiki`, `wellness` — Apple 1.4.1 uyumluluğu için sağlık/şifa çağrışımlı kelimeler çıkarıldı.

---

## Fiyatlandırma

| Alan | Değer |
|---|---|
| **Model** | Ücretsiz İndirme + Uygulama İçi Abonelik |
| **İndirme Fiyatı** | Ücretsiz ($0.00) |
| **Abonelik** | $4.99/yıl — Otomatik Yenilenen Abonelik |
| **Abonelik Adı (TR)** | Sakin Yıllık Erişim |
| **Abonelik Adı (EN)** | Sakin Yearly Access |
| **Abonelik Açıklama (TR)** | Tüm özelliklere sınırsız erişim. Yıllık olarak otomatik yenilenir. |
| **Abonelik Açıklama (EN)** | Unlimited access to all features. Renews automatically every year. |
| **Deneme Süresi** | Yok |
| **Ücretsiz İçerik** | Yok — abonelik olmadan uygulama kullanılamaz |

### App Store Connect — Subscription Group
- **Grup Adı:** Sakin Premium
- **Ürün ID:** `app.sakin.life.yearly`
- **Süre:** 1 Yıl (Auto-Renewable)
- **Fiyat Tier:** $4.99

---

## App Store Connect — İnceleme Bilgileri

### Demo Hesabı
Gerekmez — uygulama hesap kaydı olmadan kullanılabilir.

### İnceleme Notu
Bkz. `app-review-notes.md`

---

## Desteklenen Cihazlar ve iOS Sürümleri

| Platform | Minimum Sürüm |
|---|---|
| iPhone | iOS 16.0+ |
| iPad | iPadOS 16.0+ |
| Apple Watch | Desteklenmiyor |
| Mac (Catalyst) | Hayır |

---

## Desteklenen Ekran Yönleri

- Portrait (Dikey) — tek yön

---

## App Store Screenshot Gereksinimleri

| Cihaz | Boyut |
|---|---|
| iPhone 6.7" (15 Pro Max) | 1290 x 2796 px |
| iPhone 6.5" (11 Pro Max) | 1242 x 2688 px |
| iPhone 5.5" (SE) | 1242 x 2208 px |
| iPad Pro 12.9" | 2048 x 2732 px |

### Önerilen Screenshot Sırası
1. Giriş ekranı — "Kendini hep hatırla" tagline
2. Sabah niyeti — kelime seçimi ekranı
3. Nefes egzersizi — animasyon ekranı
4. Ses Dalgaları — solfeggio frekansları + kuş sesleri
5. 22 Çakra Farkındalığı — çakra bağlantı ekranı
6. İçsel Ayna — AI farkındalık yansıtma ekranı
7. Bağlantı ekranı — ilerleme ve gün serisi takibi

---

## App Privacy — Data Types (App Store Connect)

### Seçilecek Veri Türleri

| Veri Türü | Durum | Detay |
|---|---|---|
| User Content | Evet | AI özellikleri için kullanıcının yazdığı metin Groq API'ye gönderilir |
| Purchase History | Evet | Abonelik durumu (StoreKit tarafından yönetilir) |

### User Content Detay
- **Linked to Identity:** Hayır
- **Used for Tracking:** Hayır
- **Purpose:** App Functionality
- **Açıklama:** Kullanıcı metni anonim olarak AI hizmetine gönderilir, kişisel kimlik bilgisi içermez

### Purchase History Detay
- **Linked to Identity:** Hayır
- **Used for Tracking:** Hayır
- **Purpose:** App Functionality
- **Açıklama:** Abonelik durumu Apple StoreKit tarafından yönetilir, üçüncü tarafa iletilmez

### Toplanmayan Veriler
Contact Info, Health & Fitness, Financial Info, Location, Sensitive Info,
Contacts, Browsing History, Search History, Identifiers, Usage Data, Diagnostics

---

## Capacitor Build Bilgileri

| Alan | Değer |
|---|---|
| **App ID** | app.sakin.life |
| **Capacitor** | 6.x |
| **Web Dir** | dist |
| **Xcode Min** | 15.0 |
| **Swift** | 5.0 |
| **Marketing Version** | 1.1 |
| **Build Number** | 2 |
