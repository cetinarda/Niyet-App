# SoulProfile — Apple App Store Submission Package

> Versiyon: 1.0 — Tarih: 2026-05-26
> Owner: Founder + Growth
> Hedef: iOS 17.0+ (Capacitor wrapper over Next.js 14)
> Bundle ID: `life.soulprofile.app`
> SKU: `SOULPROFILE-IOS-001`
> Apple Developer Team: (kuruluştan sonra doldurulacak)

Bu doküman App Store Connect'e gönderim için TAM operasyonel pakettir. Her bölüm copy-paste edilecek kalitede; özellikle metadata, IAP ürün ID'leri ve App Review notları doğrudan formlara yapıştırılabilir.

---

## 1. Apple Developer Hesap Kurulumu

### 1.1 Hesap Tipi Seçimi

**Karar: Organization (Şirket) hesabı aç.** Bireysel (Individual) hesap, ileride şirketleşme veya Family Sharing IAP için sorun yaratır. SoulProfile bir tüketici uygulaması; brand olarak görünmek istiyoruz.

| Madde | Individual | Organization (önerilen) |
|---|---|---|
| Yıllık ücret | $99 | $99 |
| Geliştirici adı | Kişi adı görünür | Şirket adı görünür ("SoulProfile Teknoloji A.Ş.") |
| DUNS gereksinimi | Yok | VAR — ücretsiz başvuru |
| Onay süresi | 24-48 saat | 7-21 gün |
| Sign in with Apple | Çalışır | Çalışır |
| StoreKit 2 / IAP | Çalışır | Çalışır |

### 1.2 Adım Adım Kurulum (Organization)

1. **DUNS numarası al** (gerekli)
   - URL: https://developer.apple.com/enroll/duns-lookup/
   - Şirket adı, adres, vergi numarası, telefon hazır olsun
   - Ücretsiz; 3-5 iş günü
   - Kişisel şahıs şirketi (Şahıs Şirketi) için de DUNS verilir — vergi levhasındaki "ticari unvan"ı kullan

2. **Apple ID hazırla**
   - Şirket maili kullan: `dev@soulprofile.app` (alias değil, gerçek inbox)
   - 2FA zorunlu — şirket telefonu bağla
   - **ASLA** kişisel iCloud Apple ID'sini kullanma; ileride hesap transferi 90 gün sürer

3. **Apple Developer Program enrollment**
   - URL: https://developer.apple.com/programs/enroll/
   - "Company / Organization" seç
   - DUNS numarası, yasal şirket adı (vergi levhasındakiyle BİREBİR aynı), website
   - "Legal Entity Authorization" — şirketi temsil yetkin var mı? Limited / A.Ş. için imza sirküleri sorulabilir
   - Apple çağrı yapabilir (İngilizce, EN-only) — yetkili kişiyi bilgilendir
   - $99 ödeme (kredi kartı, USD)

4. **Onay sonrası ilk login**
   - https://appstoreconnect.apple.com → Users and Access
   - **Admin** rol: founder
   - **App Manager** rol: developer hesapları
   - **Marketing** rol: ASO/content kişisi
   - Her birine ayrı Apple ID (paylaşılan hesap App Store Connect'te BANLANIR)

### 1.3 Şirket Kurulu Değilse — Geçici Plan

Şahıs şirketi açılışı (Türkiye) 2-5 iş gününde tamamlanır:
- Vergi dairesine başvuru → vergi levhası
- E-imza
- Faturalandırma yazılımı (Logo, Paraşüt, Mikrogrup)
- IBAN tanımı App Store Connect'e gerek olacak (gelir transferi için)

Acilse: **Individual** hesapla başla, 6 ay içinde Organization'a TRANSFER ET. Transfer formu: https://developer.apple.com/contact/topic/select

---

## 2. App Store Connect — App Kaydı

### 2.1 Bundle ID Oluşturma

1. https://developer.apple.com/account → Certificates, Identifiers & Profiles → Identifiers → `+`
2. **App IDs** → App → Continue
3. Form:
   - **Description:** `SoulProfile iOS App`
   - **Bundle ID:** Explicit → `life.soulprofile.app`
   - **Capabilities** (aşağıdaki tüm kutuları işaretle):
     - [x] **Sign In with Apple** (zorunlu — bkz. §13)
     - [x] **In-App Purchase**
     - [x] **Push Notifications**
     - [x] **Associated Domains** (universal links için: `applinks:life.soulprofile.app`)
     - [x] **App Groups** (`group.life.soulprofile.shared` — widget'lar için ileride)
     - [ ] HealthKit — KULLANMA (privacy review uzar)
     - [ ] HomeKit — KULLANMA
4. Register

### 2.2 App Store Connect'te Yeni App

App Store Connect → My Apps → `+` → New App

| Alan | Değer |
|---|---|
| Platforms | iOS |
| Name | `SoulProfile` (gerçek görünür isim §6'da varyantlanacak — bu sadece kayıt için) |
| Primary Language | Turkish (Türkiye) |
| Bundle ID | `life.soulprofile.app` (seçilebilir listede çıkmalı) |
| SKU | `SOULPROFILE-IOS-001` |
| User Access | Full Access |

### 2.3 Capabilities Sırası (önemli)

Capacitor projesi içinde `ios/App/App.entitlements` dosyasına otomatik eklenir, ama App Store Connect tarafında **provisioning profile** yenilenmesi şart. Sırayla:

1. Sign in with Apple — `aps-environment`, `com.apple.developer.applesignin: [Default]`
2. In-App Purchase — entitlement otomatik
3. Push Notifications — APNs Auth Key oluştur (Certificates yerine Key kullan, expire olmuyor)
   - Keys → `+` → Apple Push Notifications service (APNs) → Continue → Register → Download `.p8` (BİR KEZ indirilir, kaybedersen yenisini al)
   - Key ID + Team ID + Bundle ID = backend'e (Supabase Edge Function) push payload için
4. Associated Domains: `apple-app-site-association` dosyasını `life.soulprofile.app/.well-known/` altına koy

---

## 3. App Icon Spec

### 3.1 Master Icon

- **Boyut:** 1024×1024 px
- **Format:** PNG, no alpha channel, sRGB or P3 color space
- **Max dosya:** 1 MB
- **No rounded corners** (Apple kendi mask'liyor)
- **No transparency**
- **No text** (küçük boyutlarda okunmaz, ASO için negatif)

**Brand spec:**
- Background: Gradient `#0B0F2A` → `#3D1F6E` → `#7B3FBF` (galaxy/cosmic)
- Foreground: Tek sembol — yıldız patlaması / starseed glyph (Andromeda 8-point star önerisi)
- Stil: soft glow, subtle nebula texture
- Light/dark mode için TEK varyant (Apple iOS 18'de hala 3 varyant destekliyor ama MVP'de tek yeter)

### 3.2 Asset Catalog Boyutları (Xcode Auto-generates from 1024)

Xcode 15+ "Single Size" asset catalog ile tek 1024×1024 yeterli. Manuel istersen:

| Cihaz / Konum | Boyut (pt @ scale) | Boyut (px) |
|---|---|---|
| iPhone Notification | 20pt @2x | 40×40 |
| iPhone Notification | 20pt @3x | 60×60 |
| iPhone Settings | 29pt @2x | 58×58 |
| iPhone Settings | 29pt @3x | 87×87 |
| iPhone Spotlight | 40pt @2x | 80×80 |
| iPhone Spotlight | 40pt @3x | 120×120 |
| iPhone App | 60pt @2x | 120×120 |
| iPhone App | 60pt @3x | 180×180 |
| iPad Notification | 20pt @1x | 20×20 |
| iPad Notification | 20pt @2x | 40×40 |
| iPad Settings | 29pt @1x | 29×29 |
| iPad Settings | 29pt @2x | 58×58 |
| iPad Spotlight | 40pt @1x | 40×40 |
| iPad Spotlight | 40pt @2x | 80×80 |
| iPad App | 76pt @2x | 152×152 |
| iPad Pro App | 83.5pt @2x | 167×167 |
| App Store | 1024pt @1x | 1024×1024 |
| Watch (yoksa atla) | — | — |

### 3.3 Icon Kontrol Listesi (kabul kriteri)

- [ ] 1024×1024 PNG, alpha YOK
- [ ] sRGB (P3 yoksa)
- [ ] < 1 MB
- [ ] Tüm scale'lerde okunabilir (16pt'a indirip kontrol et)
- [ ] No Apple logosu, no iOS UI elementi (rejection 2.3.6)
- [ ] No "Free", "New", "Sale" yazısı
- [ ] Brand palette galaxy/cosmic ile uyumlu
- [ ] Marketing assets ile aynı sembol (instagram, website favicon)

---

## 4. Screenshot Stratejisi

### 4.1 Zorunlu Boyutlar (App Store Connect 2026)

Apple "iPhone 6.9 inch" tek upload'u kabul ediyor ve kalanını auto-resize ediyor; **ama** 6.9 ile 5.5'ün crop davranışı farklı, manuel upload önerilir.

| Display | Cihaz | Boyut (px, portrait) | Zorunlu mu? |
|---|---|---|---|
| 6.9" | iPhone 16 Pro Max / 15 Pro Max | 1320×2868 | **EVET** |
| 6.5" | iPhone 11 Pro Max / XS Max | 1242×2688 | EVET (eski cihaz desteği) |
| 5.5" | iPhone 8 Plus | 1242×2208 | OPSİYONEL ama yoksa A/B test edilemez |
| iPad 13" | iPad Pro M4 | 2064×2752 | EVET (iPad destekli ise) |
| iPad 12.9" | iPad Pro 6. nesil | 2048×2732 | EVET |

**Karar:** Launch'ta 6.9" + 6.5" + iPad 13" yükle. 5.5" boşver (App Store 2025'ten sonra opsiyonel).

### 4.2 Screenshot Sayısı

- Min 3, max 10 (her boyut için)
- **Hedef: 10 screenshot** (tam slot kullanımı = conversion uplift)

### 4.3 İçerik Planı — 10 Screenshot (Hero-Driven)

> Stil: Her screenshot'ta üst 1/3 büyük tipografi başlık + alt 2/3 cihaz mockup (cihaz mockup'sız "full bleed" de OK ve daha yüksek CTR veriyor — A/B test edilecek).
> Font: Brand display (Tasa Orbiter veya Söhne) başlık, Inter altmetin
> Renk: galaxy gradient bg, beyaz tipografi, accent `#FFD86B` (altın)

#### TR — Türkiye App Store

| # | Başlık (≤6 kelime) | Altmetin (≤12 kelime) | Görsel İçerik |
|---|---|---|---|
| 1 | **Sen sadece insan değilsin.** | Doğum saatinden Galaktik Karne'n 60 saniyede hazır. | Hero karne kartı — kullanıcı adı + büyük "★ 9.2 / 10" rating |
| 2 | **4 sistem, tek karne.** | Astroloji + Human Design + Numeroloji + Yıldız Irkı. | 4 ikon row + karne thumbnail |
| 3 | **Bu hayattaki görevin.** | Kuzey Düğüm + ruh kontratın açıklamalı. | North Node detay sayfası |
| 4 | **Hangi yıldızdan geldin?** | Plejyen, Sirius, Arkturus, Lyra, Andromeda. | Starseed origin reveal screen |
| 5 | **Human Design tipini öğren.** | Manifestor, Generator, Projector, Reflector. | HD type card + body graph preview |
| 6 | **3D solar sistemini gör.** | Doğum anında gezegenlerin tam pozisyonu. | 3D solar system viewer screenshot |
| 7 | **AI ile sana özel anlatım.** | Tek tip yorum değil — senin profilin için yazılmış. | Narrative paragraph screen |
| 8 | **Story'ye atılır kalitede.** | Tek tıkla Instagram, WhatsApp, TikTok. | Share sheet açık + 9:16 karne preview |
| 9 | **Sevdiklerinin karnesi.** | Uyum analizi: partner, anne, arkadaş. | Compatibility split-screen (Premium badge) |
| 10 | **Ücretsiz başla.** | Premium ile sınırsız karne + günlük transit. | Paywall ekranı (fiyat görünür) |

#### EN — US / International App Store

| # | Headline | Subhead | Visual |
|---|---|---|---|
| 1 | **You're not just human.** | Get your Galactic Record in 60 seconds. | Hero record card |
| 2 | **4 systems, one card.** | Astrology + Human Design + Numerology + Starseed. | 4 icon row + card |
| 3 | **Your soul mission.** | North Node + soul contract decoded. | NN detail screen |
| 4 | **Which star did you come from?** | Pleiades, Sirius, Arcturus, Lyra, Andromeda. | Starseed reveal |
| 5 | **Discover your Human Design.** | Manifestor, Generator, Projector, Reflector. | HD body graph |
| 6 | **See your 3D solar system.** | Exact planetary positions at your birth. | 3D viewer |
| 7 | **AI-written, just for you.** | No generic horoscope — written for your chart. | Narrative page |
| 8 | **Share-worthy by design.** | One tap to Instagram, WhatsApp, TikTok. | Share sheet |
| 9 | **Read the people you love.** | Compatibility for partners, parents, friends. | Compatibility split |
| 10 | **Free to start.** | Premium unlocks unlimited cards + daily transits. | Paywall screen |

### 4.4 Lokalizasyon Notu

10 screenshot × 2 dil × 3 boyut = **60 görsel asset**. Figma'da master template + auto-layout şart. Tahmini süre: 2 tasarımcı × 3 gün.

### 4.5 Screenshot Kontrol Listesi

- [ ] Tüm screenshot'lar gerçek app screen'inden geliyor (mockup üstüne stock görsel = 2.3.3 rejection)
- [ ] Status bar gerçek görünüyor (saat 09:41 — Apple standart)
- [ ] Battery 100%, full signal
- [ ] Türkçe screenshot'ta TR app data
- [ ] İngilizce screenshot'ta EN app data
- [ ] Hiçbir screenshot'ta competitor adı (Co-Star, Pattern) geçmiyor
- [ ] AI üretimli içerik gerçek + disclaimer görseli en az 1 ekranda
- [ ] Premium ekranında fiyat varsa USD + TRY (region uygun)

---

## 5. App Preview Videoları

3 senaryo (15-30 sn). Apple max 30 sn, min 15 sn. Format: `.mov` veya `.mp4`, H.264, 30fps, portrait 1080×1920 (6.5") / 1080×2340 (6.7+). Ses opsiyonel ama background music ile %18 daha yüksek izlenme oranı.

### Video 1 — "60 Saniyede Karne" (22 sn) — Hero / Default

```
[0-2s]   Logo bumper + slogan "Sen sadece insan değilsin."
[2-5s]   Form ekranı — kullanıcı doğum tarihi giriyor (parmak animasyonu)
[5-8s]   Loading — galaktik animasyon (yıldızlar açılıyor)
[8-14s]  Karne reveal — 4 sistemli kart açılıyor, scroll
[14-17s] Detay sayfalar hızlı cut: HD type → Starseed → North Node
[17-20s] Share button → Story preview
[20-22s] End card: "Ücretsiz indir" + logo
```

**Müzik:** Ambient cosmic (Epidemic Sound — "Celestial Drift" veya benzeri lisanslı)
**Voiceover:** YOK (App Store mute autoplay → silent-friendly olmalı)

### Video 2 — "Hangi Yıldızdan Geldin?" (18 sn) — Starseed Hook (US için)

```
[0-3s]   Soru ekranı: "Plejyen? Sirius? Lyra? Andromeda?"
[3-6s]   Doğum formu hızlı fill
[6-10s]  Starseed reveal animation — yıldız ışını bg
[10-15s] Origin story paragrafı scroll (AI narrative)
[15-18s] End card + CTA
```

### Video 3 — "Karnesi Aşk Mı?" (15 sn) — Compatibility Premium Hook

```
[0-3s]   İki kullanıcı karnesi yan yana
[3-7s]   Compatibility skoru animasyonu (% bar)
[7-12s]  3 başlık: İletişim, Enerji, Karma → AI yorum snippet
[12-15s] Premium badge + "Sevdiklerini oku" CTA
```

### Video Üretim Notları

- Apple **app icon** veya **App Store rozetlerini** videoda KULLANMA (2.3.7)
- Sosyal medya logosu (Instagram, TikTok) videoda KULLANMA (trademark riski)
- Video poster frame (preview thumbnail) — App Store Connect ayrı yükletir, hero shot kullan
- Captions yok (kısa süre + min text)

---

## 6. App Metadata — TR + EN

### 6.1 TR — Türkiye App Store

**App Name (max 30 char)**
```
SoulProfile: Galaktik Karne
```
*(27 char)*

**Subtitle (max 30 char)**
```
Astroloji + Human Design + AI
```
*(29 char)*

**Promotional Text (max 170 char, anytime update, no review)**
```
Yeni: AI ile sana özel yorum, 3D solar sistem ve compatibility analizi. Doğum saatini gir, 60 saniyede Galaktik Karne'n hazır. Story'ye at, arkadaşına gönder.
```
*(169 char)*

**Keywords (max 100 char, virgülle ayrı, boşluk YOK)**
```
burç,astroloji,humandesign,numeroloji,yıldız,doğum,haritası,karne,starseed,enerji,ruh,kader
```
*(99 char)*

**Description (max 4000 char) — TAM TASLAK**

```
SoulProfile — Sen sadece insan değilsin, galaktik bir karnen var.

Doğum tarihin, saatin ve yerinden yola çıkarak sana özel bir "Galaktik Karne" üretiyoruz. Astroloji, Human Design, Numeroloji ve Yıldız Irkı (Starseed) analizini tek bir paylaşılabilir kartta birleştiren ilk Türk uygulaması.

⭐ NEDEN SOULPROFILE?

Co-Star sadece astrolojiyi anlatır. The Pattern ilişki dinamiklerine odaklanır. Sanctuary İngilizce-only. SoulProfile farklı: dört farklı ezoterik sistemi birleştirip sana okul karnesi formatında sunar. Hem ciddi, hem eğlenceli. Story'de paylaşılacak kadar görsel, sabah kahvende okuyacak kadar derin.

🌟 KARNENDE NE VAR?

• Güneş, Ay ve Yükselen burcun — klasik astrolojinin temeli
• Kuzey Düğüm (North Node) — bu hayattaki ruh görevin
• Human Design tipi (Manifestor, Generator, Projector, Reflector) ve otoritesi
• Yaşam Yolu Sayısı ve kader numerolojisi
• Yıldız Irkı kökenin: Plejyen, Sirius, Arkturus, Lyra, Andromeda...
• Bu enkarnasyondaki kontratın ve karmik yüklerin
• Süper güçlerin ve gölgelerin
• Notlar bölümü: 10 üzerinden değerlendirme, tıpkı bir karne gibi

🌌 EKSTRA SİSTEMLER

Premium ile 5 ek sistem açılır:
• Maya Burcu (Tzolkin Day Sign)
• Vedik Ay Mansiyonu (Nakshatra)
• Çin Burcu + element (Bagua)
• Norse Rünü (doğum gün rünü)
• Tarot Doğum Kartı

📸 PAYLAŞILABİLİR TASARIM

Karne'ni doğrudan Instagram Story, WhatsApp veya TikTok'a gönder. Estetik tipografi, premium kart tasarımı. Arkadaşlarınla karşılaştır, kim kimdir öğren. 9:16 story formatında, tek tıkla.

🪐 3D SOLAR SİSTEM

Doğum anındaki gezegenlerin tam pozisyonunu 3D olarak gör. Yörünge animasyonu, açılar (aspekt), evler — astrology meraklıları için tam ephemeris derinliği.

🤖 AI ÜRETİMLİ ANLATIM

Tek tip burç yorumu değil. Senin spesifik chart'ın için Claude AI tarafından yazılmış, tekrar etmeyen, derin anlatım. Her okumada yeni katman.

💎 ÜCRETSİZ VS PREMIUM

ÜCRETSİZ:
• Tam Galaktik Karne (tek seferlik)
• 4 temel sistem (astroloji, HD, numeroloji, starseed)
• Story formatında paylaşım
• 3D solar sistem viewer

PREMIUM (Haftalık / Aylık / Yıllık):
• Sınırsız karne üretimi (sevdiklerinin de)
• Uyum analizi (compatibility) — partner, arkadaş, anne, baba
• 5 ek sistem (Maya, Vedik, Çin, Norse, Tarot)
• Günlük transit yorumları + bildirimler
• Detaylı Human Design Body Graph
• Numeroloji yıllık tahmin
• Starseed kökenin için derinlemesine rapor
• Ay döngüsü ve önemli astrolojik geçişlerde bildirim
• Reklamsız deneyim
• Premium-only paylaşım frame'leri

🔮 KİME UYGUN?

• Burç yorumlarıyla başlayıp ezoterik dünyaya açılan herkese
• "Co-Star kullanıyorum ama Türkçe değil" diyenlere
• Spiritüel ama yargılayıcı olmayan bir dile değer verenlere
• Human Design'a yeni başlayanlara
• Starseed kavramına merak duyanlara
• Tek bir profile çoklu sistem isteyen ileri seviye kullanıcılara

🛡 GİZLİLİK

Doğum bilgilerin sadece karne üretimi için kullanılır, üçüncü taraflarla paylaşılmaz. Verilerin EU bölgesinde Supabase'de KVKK + GDPR uyumlu saklanır. Hesabını ve tüm verini istediğin zaman tek tıkla sil. JSON export hakkın saklıdır.

📲 NASIL ÇALIŞIR?

1. Doğum tarihini, saatini ve yerini gir
2. 60 saniyede karnen hazırlanır
3. 4 sistemli analiz + AI yorum oku
4. Story'ye paylaş, arkadaşına gönder
5. Sevdiklerinin karnesini de aç (Premium)

⚠️ YASAL DİSCLAIMER

SoulProfile eğlence ve kişisel farkındalık amacıyla geliştirilmiştir. Tıbbi, psikolojik veya finansal tavsiye yerine geçmez. Önemli yaşam kararlarınız için uzman desteği alınız. 16 yaş altı kullanıma uygun değildir.

Premium abonelik: Haftalık 39,99 ₺ / Aylık 99,99 ₺ / Yıllık 499,99 ₺
Otomatik yenilenir. Apple ID Ayarlar'dan iptal edilebilir. Süresi dolan periyot başlangıcından 24 saat öncesine kadar iptal etmezsen otomatik yenilenir.

Gizlilik: https://life.soulprofile.app/privacy
Şartlar: https://life.soulprofile.app/terms
Destek: support@soulprofile.app
```
*(yaklaşık 3960 char)*

**What's New (Release Notes — v1.0.0)**
```
SoulProfile resmî olarak App Store'da! İlk sürümde:

• 4 sistemli Galaktik Karne (Astroloji + Human Design + Numeroloji + Starseed)
• 3D doğum solar sistem viewer
• AI ile sana özel yazılmış anlatım
• Story'ye paylaşılabilir karne tasarımı
• Türkçe + İngilizce
• Premium ile 5 ek sistem ve compatibility

Geri bildirim için: support@soulprofile.app
```

### 6.2 EN — US / International

**App Name**
```
SoulProfile: Soul Birth Chart
```
*(29 char)*

**Subtitle**
```
Astrology + Human Design + AI
```
*(29 char)*

**Promotional Text**
```
New: AI-personalized readings, 3D solar system viewer, and compatibility analysis. Enter your birth time, get your Galactic Record in 60 seconds. Share to story or send to a friend.
```
*(170 char)*

**Keywords (100 char, comma-separated, no spaces)**
```
astrology,humandesign,birthchart,numerology,starseed,horoscope,zodiac,natal,soul,cosmic,spiritual
```
*(99 char)*

**Description (max 4000 char)**

```
SoulProfile — You are not just human. You carry a galactic record.

From your birth date, time, and place we generate a personal "Galactic Record" — a single shareable card that unites Astrology, Human Design, Numerology, and Starseed origin in one beautifully designed report.

⭐ WHY SOULPROFILE?

Co-Star tells you only astrology. The Pattern focuses on relationships. Sanctuary runs on chat. SoulProfile is different: four esoteric systems fused into a school-report format you can share. Serious enough to learn from, beautiful enough to post.

🌟 WHAT'S ON YOUR RECORD?

• Sun, Moon, and Rising sign — classical astrology foundation
• North Node — your soul mission in this lifetime
• Human Design type (Manifestor, Generator, Projector, Reflector) and authority
• Life Path number and destiny numerology
• Starseed origin: Pleiadian, Sirian, Arcturian, Lyran, Andromedan...
• Your soul contract and karmic load in this incarnation
• Your superpowers and shadow patterns
• Grade section: scores out of 10, like an actual report card

🌌 ADDITIONAL SYSTEMS (PREMIUM)

Unlock 5 more systems:
• Maya Day Sign (Tzolkin)
• Vedic Nakshatra (lunar mansion)
• Chinese Zodiac + element (Bagua)
• Norse Birth Rune
• Tarot Birth Card

📸 SHARE-WORTHY BY DESIGN

Send your card directly to Instagram Story, WhatsApp, or TikTok. Premium typography, refined card design. Compare with friends. 9:16 story-ready, one tap.

🪐 3D SOLAR SYSTEM

See the exact positions of planets at your birth moment in 3D. Orbital animation, aspects, houses — full ephemeris depth for astrology enthusiasts.

🤖 AI-WRITTEN NARRATIVE

No generic horoscope. Your reading is written by Claude AI specifically for your chart — no repetition, deep insight, fresh layer every time.

💎 FREE VS PREMIUM

FREE:
• Full Galactic Record (one-time)
• 4 core systems (astrology, HD, numerology, starseed)
• Story-format sharing
• 3D solar system viewer

PREMIUM (Weekly / Monthly / Yearly):
• Unlimited card generation (for your loved ones too)
• Compatibility analysis — partner, friend, parents
• 5 additional systems (Maya, Vedic, Chinese, Norse, Tarot)
• Daily transit readings + notifications
• Detailed Human Design Body Graph
• Numerology yearly forecast
• Deep starseed origin report
• Lunar cycle and major transit alerts
• Ad-free experience
• Premium-only share frames

🔮 WHO IT'S FOR

• Anyone evolving from daily horoscopes into deeper esoteric work
• Human Design beginners who want a clean entry point
• Starseed-curious souls
• Multi-system practitioners who want one place for everything
• People who want depth without the cringe

🛡 PRIVACY

Your birth data is used only for chart generation, never shared with third parties. Data stored in EU region (Supabase), GDPR + CCPA compliant. Delete your account and all data with one tap. Export your data as JSON anytime.

📲 HOW IT WORKS

1. Enter your birth date, time, and place
2. Your record is ready in 60 seconds
3. Read your 4-system analysis + AI narrative
4. Share to story, send to a friend
5. Unlock loved ones' records (Premium)

⚠️ LEGAL DISCLAIMER

SoulProfile is provided for entertainment and personal awareness. It is not a substitute for medical, psychological, or financial advice. Consult a professional for major life decisions. Not intended for users under 16.

Premium subscription: Weekly $4.99 / Monthly $11.99 / Yearly $59.99
Auto-renews. Cancel anytime in Apple ID settings. Subscription auto-renews unless canceled at least 24 hours before the current period ends.

Privacy: https://life.soulprofile.app/privacy
Terms: https://life.soulprofile.app/terms
Support: support@soulprofile.app
```

**What's New (EN — v1.0.0)**
```
SoulProfile is officially on the App Store! In this first release:

• 4-system Galactic Record (Astrology + Human Design + Numerology + Starseed)
• 3D natal solar system viewer
• AI-written, personal narrative
• Story-ready shareable card design
• English + Turkish
• Premium unlocks 5 more systems and compatibility

Feedback: support@soulprofile.app
```

### 6.3 URLs

| Alan | URL |
|---|---|
| Support URL | `https://life.soulprofile.app/support` |
| Marketing URL | `https://life.soulprofile.app` |
| Privacy Policy URL | `https://life.soulprofile.app/privacy` |
| Privacy Choices URL (CCPA) | `https://life.soulprofile.app/data` |

> Tüm URL'ler **HTTPS** olmalı, redirect kabul edilmez, 200 dönmeli, mobile-responsive olmalı. Submission'dan önce her birini test et.

---

## 7. App Review Information

App Store Connect → App Information → App Review Information

### 7.1 Contact

| Alan | Değer |
|---|---|
| First Name | (founder adı) |
| Last Name | (founder soyadı) |
| Phone Number | (+90 ile başlayan, 7/24 erişilebilir) |
| Email | `review@soulprofile.app` (gerçek inbox, push notification açık) |

### 7.2 Demo Account

App'in **sign in zorunlu mu?** SoulProfile MVP'de form-only akış sunabiliyor (anonymous chart oluşturma) → demo account opsiyonel ama **yine de ver**, reviewer takılırsa rejection geliyor.

| Alan | Değer |
|---|---|
| Demo Account Username | `apple.review@soulprofile.app` |
| Demo Account Password | (16-karakter, rotate edilmiş, doc'a yaz) |
| Sign-in required | YES (Premium ekranlarını görmeleri için) |

**Demo hesap kurulum:**
- Sign in with Apple yerine email/password ile kayıt
- Yapay birth data (1990-01-15, 12:00, İstanbul) önceden girilmiş
- Premium FLAG = TRUE (test ortamında, prod'da Sandbox StoreKit ile gerçek IAP akışı da çalışmalı)
- Hesap kalıcı, silinmemeli

### 7.3 Notes (App Review Notes — kritik)

```
Hello App Review team,

Thank you for reviewing SoulProfile.

PRODUCT OVERVIEW
SoulProfile generates a "Galactic Record" from a user's birth data (date, time, place) by combining astrology, Human Design, numerology, and starseed origin systems. Output is a shareable visual card and AI-generated narrative text.

DEMO ACCOUNT
Email: apple.review@soulprofile.app
Password: [will be provided in the credentials field]
This account has Premium enabled so you can review all paywalled features.

HOW TO TEST CORE FLOW
1. Open the app → Welcome screen
2. Tap "Karneni Oluştur" / "Get Your Record"
3. Birth form: prefilled birth data is acceptable, or enter any date
4. Wait ~5 seconds for chart generation
5. Scroll through the 4-system Galactic Record
6. Tap "Paylaş" / "Share" to test the Story export
7. Tap "Premium" to view subscription options (in Sandbox StoreKit)

AI-GENERATED CONTENT DISCLAIMER
The narrative text shown to users is generated by Claude AI (Anthropic). It is:
- Personalized per chart, not user-to-user free-form
- Constrained by our system prompt to spiritual/wellness topics only
- Not medical, psychological, or financial advice (disclaimer visible in footer of every screen and explicitly stated in the report)
- Moderated by Anthropic's safety layer + our own content filter

SUBSCRIPTION INFORMATION
Free tier: One Galactic Record + 4 core systems
Premium: Weekly $4.99 / Monthly $11.99 / Yearly $59.99
Auto-renewing. Restore Purchases available on settings screen. Terms and Privacy clearly linked from paywall.

SIGN IN WITH APPLE
Implemented as required by 4.8. Available on the auth screen alongside email/password.

LEGAL & PRIVACY
- Age gate: 16+ (enforced at registration with date-of-birth check)
- GDPR + KVKK compliant (data stored in EU region — Supabase Frankfurt)
- Account deletion: Settings → Account → Delete Account (immediate, with email confirmation)
- Data export (JSON): Settings → Privacy → Export My Data
- Entertainment disclaimer present in footer of every screen
- Privacy Policy: https://life.soulprofile.app/privacy

CONTENT NOTE
SoulProfile contains spiritual/esoteric content (astrology, Human Design, starseed concepts). All claims are framed as entertainment and personal reflection, not factual or scientific. No promises of supernatural outcomes are made. We do not market the app as fortune-telling.

CONTACT
If you have any questions during review, please reach out:
Email: review@soulprofile.app
Phone: [will be provided]

We respond within 4 business hours during weekdays (Istanbul time, UTC+3).

Thank you,
SoulProfile Team
```

### 7.4 Attachment

App Review accepts up to 5 attachments (PDF, MP4, JPG). Yükle:
- `flow_walkthrough.pdf` — 6 sayfa, anahtar ekranların annotated screenshot'ları
- `deletion_flow.mp4` — 30 sn, hesap silme akışı video kanıt

---

## 8. Privacy Nutrition Labels (App Privacy)

App Store Connect → App Privacy → Get Started

### 8.1 Toplama Matrix'i

| Data Type | Collected? | Linked to User? | Used to Track? | Purpose |
|---|---|---|---|---|
| **Contact Info — Email Address** | YES | YES | NO | App Functionality, Account Management |
| **Contact Info — Name** | YES (opsiyonel) | YES | NO | App Functionality, Personalization |
| **Contact Info — Phone** | NO | — | — | — |
| **Health & Fitness** | NO | — | — | — |
| **Financial Info** | NO (Apple IAP handles) | — | — | — |
| **Location — Precise** | NO | — | — | — |
| **Location — Coarse** | YES (birth city geocoding only) | YES | NO | App Functionality |
| **Sensitive Info — Birth Date** | YES | YES | NO | App Functionality (core to chart) |
| **Sensitive Info — Birth Time/Place** | YES | YES | NO | App Functionality |
| **Contacts** | NO | — | — | — |
| **User Content — Other (chart notes, custom text)** | YES | YES | NO | App Functionality |
| **Browsing History** | NO | — | — | — |
| **Search History** | NO | — | — | — |
| **Identifiers — User ID** | YES | YES | NO | App Functionality, Analytics |
| **Identifiers — Device ID (IDFV)** | YES | YES | NO | Analytics (anonymous events) |
| **Identifiers — IDFA** | NO | — | — | — (we do NOT request ATT) |
| **Purchases — Purchase History** | YES | YES | NO | App Functionality (entitlement check) |
| **Usage Data — Product Interaction** | YES | NO | NO | Analytics (Posthog, anonymized) |
| **Usage Data — Advertising Data** | NO | — | — | — |
| **Diagnostics — Crash Data** | YES | NO | NO | App Functionality (Sentry) |
| **Diagnostics — Performance Data** | YES | NO | NO | App Functionality |
| **Diagnostics — Other Data** | NO | — | — | — |
| **Other Data Types — AI Prompt Inputs** | YES (chart data → Claude API) | YES | NO | App Functionality |

### 8.2 Third-Party Services Disclosure

- **Supabase (EU/Frankfurt):** Data processor, auth + DB, GDPR DPA imzalı
- **Anthropic Claude API (US):** Data processor, chart data → narrative generation. Data Processing Addendum (DPA) signed. No training opt-in.
- **Stripe (web only):** Not used on iOS — Apple IAP only
- **PostHog (self-hosted EU):** Anonymized analytics
- **Sentry (EU):** Crash reporting, PII scrubbed

### 8.3 Tracking Tanımı

Apple "track" tanımı: 3rd party data ile birleştirip ad target etmek VEYA data broker'a satmak.

**Bizim cevap: NO TRACKING.** Bu hayati. Yanlış işaretlersen ATT prompt zorunlu olur ve install conversion düşer.

---

## 9. Age Rating

App Store Connect → App Information → Age Rating

### 9.1 Karar: **12+**

> Önemli: 17+ değil. Astroloji + Human Design + spiritüel içerik 12+ kategorisinde. 17+ sadece "frequent/intense mature themes" gerektirir. Bizim içeriğimiz mistik ama erotik/şiddet/profane DEĞİL.

### 9.2 Questionnaire Cevapları

| Soru | Cevap |
|---|---|
| Cartoon or Fantasy Violence | None |
| Realistic Violence | None |
| Prolonged Graphic or Sadistic Realistic Violence | None |
| Profanity or Crude Humor | None |
| Mature/Suggestive Themes | **Infrequent/Mild** (spiritüel referanslar) |
| Horror/Fear Themes | None |
| Medical/Treatment Information | **Infrequent/Mild** (wellness adjacent — DİSCLAİMER VAR) |
| Alcohol, Tobacco, or Drug Use or References | None |
| Sexual Content or Nudity | None |
| Graphic Sexual Content and Nudity | None |
| Simulated Gambling | None |
| Contests | None |
| Unrestricted Web Access | **NO** (in-app browser yok) |
| Gambling and Contests | None |
| Frequent/Intense Mature or Suggestive Themes | None |

**Çıkan rating: 12+** (mature/suggestive infrequent + medical info infrequent → 12+ trigger eder)

### 9.3 Made for Kids?

**HAYIR.** "Made for Kids" işaretlersen COPPA + KIDS Act + Google FAMILY policy uygulanır, AI narrative ban yer. SoulProfile 16+ targeted.

---

## 10. App Categories

| Tip | Kategori | Gerekçe |
|---|---|---|
| **Primary** | **Lifestyle** | Astroloji/spiritüel app'lerin kabul gören ana evi (Co-Star, Pattern, Sanctuary buradan ranking yapıyor). |
| **Secondary** | **Reference** | "Reference" altında Human Design + numeroloji "knowledge" tarafı; daha az rekabet, longtail keyword payı. |

**Alternatifler (test edilebilir):**
- Primary: `Entertainment` — keyword rekabeti çok yüksek, atla
- Secondary: `Education` — astrology "education" sayılır mı tartışmalı, riskli
- `Health & Fitness` — KESİNLİKLE HAYIR (medical claims rejection riski)

---

## 11. Pricing & Availability

### 11.1 App Fiyatı

**Free** (downloadable). Monetization sadece IAP.

### 11.2 Availability

- **All 175 territories** açık
- **Hariç:** Çin (içerik onayı + ICP lisansı gerekli, ileride ayrı SKU)
- **Hariç:** Kuzey Kore, İran, Suriye, Küba (Apple zaten kısıtlı)

### 11.3 IAP Fiyatlandırma — Region-Aware (PPP)

App Store Connect "Pricing" → Apple Price Tier kullan, manuel custom değil (her tier currency conversion + PPP otomatik).

#### Haftalık (`weekly_premium`)

| Region | Tier | Yerel fiyat (yaklaşık) |
|---|---|---|
| US | Tier 5 | $4.99 |
| UK | Tier 5 | £4.49 |
| EU | Tier 5 | €5.49 |
| TR | Custom (PPP) | **39,99 ₺** (US fiyatın ~%25'i, sub avg Türk gücüne göre) |
| BR | PPP | R$ 17,90 |
| IN | PPP | ₹ 199 |
| ID, NG, EG, PK | PPP | localize |

#### Aylık (`monthly_premium`)

| Region | Tier | Yerel fiyat |
|---|---|---|
| US | Tier 12 | $11.99 |
| UK | Tier 12 | £11.99 |
| EU | Tier 12 | €13.99 |
| TR | Custom | **99,99 ₺** |
| BR | PPP | R$ 39,90 |
| IN | PPP | ₹ 499 |

#### Yıllık (`yearly_premium`)

| Region | Tier | Yerel fiyat |
|---|---|---|
| US | Tier 60 | $59.99 (~%58 indirim aylığa kıyasla) |
| UK | Tier 60 | £54.99 |
| EU | Tier 60 | €69.99 |
| TR | Custom | **499,99 ₺** |
| BR | PPP | R$ 199 |
| IN | PPP | ₹ 2.499 |

### 11.4 Free Trial Stratejisi

- **Haftalık:** Trial YOK (zaten kısa)
- **Aylık:** 3 gün ücretsiz deneme (`introductory offer` — type: Free, duration: 3 days)
- **Yıllık:** 7 gün ücretsiz deneme + ilk yıl %20 indirim opsiyonu (introductory offer type: Pay As You Go veya Free)

> Apple guideline: Trial sırasında "Yenilenecek" tarihi paywall'da açıkça göster (3.1.2)

---

## 12. In-App Purchase Setup

### 12.1 Product ID Şeması

```
life.soulprofile.app.sub.weekly       — Haftalık premium
life.soulprofile.app.sub.monthly      — Aylık premium
life.soulprofile.app.sub.yearly       — Yıllık premium
```

### 12.2 Subscription Group

Tek grup: `SoulProfile Premium`
- Group reference name: `soulprofile_premium`
- Group display name (lokalize):
  - TR: `SoulProfile Premium`
  - EN: `SoulProfile Premium`

> Tek grup zorunlu çünkü kullanıcı tek anda tek tier'a abone olabilmeli. Apple upgrade/downgrade otomatik handle eder.

### 12.3 Ürün Detayları (her ürün için)

#### Weekly

| Alan | Değer |
|---|---|
| Reference Name | `Premium Weekly` |
| Product ID | `life.soulprofile.app.sub.weekly` |
| Duration | 1 Week |
| Family Sharing | **OFF** (haftalık için anlamsız, abuse riski) |
| Display Name (TR) | Premium Haftalık |
| Display Name (EN) | Premium Weekly |
| Description (TR) | SoulProfile Premium'a haftalık erişim. 5 ek sistem, compatibility, sınırsız karne, günlük transit. |
| Description (EN) | Weekly access to SoulProfile Premium. 5 extra systems, compatibility, unlimited cards, daily transits. |
| Review Screenshot | Paywall ekranı 1242×2208 PNG |
| Review Notes | "Subscription unlocks 5 additional esoteric systems and compatibility readings." |

#### Monthly

| Alan | Değer |
|---|---|
| Reference Name | `Premium Monthly` |
| Product ID | `life.soulprofile.app.sub.monthly` |
| Duration | 1 Month |
| Family Sharing | **ON** (aile aboneliği = retention) |
| Display Name (TR) | Premium Aylık |
| Display Name (EN) | Premium Monthly |
| Introductory Offer | 3-day Free Trial (first-time only) |

#### Yearly

| Alan | Değer |
|---|---|
| Reference Name | `Premium Yearly` |
| Product ID | `life.soulprofile.app.sub.yearly` |
| Duration | 1 Year |
| Family Sharing | **ON** |
| Display Name (TR) | Premium Yıllık |
| Display Name (EN) | Premium Yearly |
| Introductory Offer | 7-day Free Trial (first-time only) |

### 12.4 App Store Server Notifications

URL: `https://life.soulprofile.app/api/iap/webhook` (Supabase Edge Function)
Version: **Version 2** (JWS-signed)
Notification Types: hepsi aktif (SUBSCRIBED, DID_RENEW, EXPIRED, REFUND, REVOKE, GRACE_PERIOD_EXPIRED, etc.)

### 12.5 Sandbox Test Account

App Store Connect → Users and Access → Sandbox Testers → `+`
- Email: `sandbox.tr@soulprofile.app` (sahte ama unique)
- Region: Turkey (TR pricing testi için)
- 2. account: `sandbox.us@soulprofile.app` (US pricing testi için)

### 12.6 Restore Purchases

**Zorunlu** (3.1.1 rejection nedeni #1). Settings ekranında "Satın Alımları Geri Yükle" / "Restore Purchases" butonu olmalı, StoreKit `Transaction.currentEntitlements` API'sini çağırmalı.

### 12.7 Subscription Management Link

Premium ekranında ve hesap silme öncesinde:
```
"Aboneliğinizi yönetin: https://apps.apple.com/account/subscriptions"
```
(deep link iOS otomatik açar)

---

## 13. Sign in with Apple

### 13.1 Zorunlu Mu?

**EVET.** Apple guideline 4.8:
> "Apps that exclusively use a third-party or social login service [...] must offer Sign in with Apple as an equivalent option."

SoulProfile'da Google/Facebook login planlanıyorsa SIWA zorunlu. SADECE email/password kullanılıyorsa zorunlu DEĞİL, ama yine de ekle (rejection sürprizleri için).

### 13.2 Karar: **SIWA + Email/Password + Google (opsiyonel)**

### 13.3 Implementasyon (Capacitor)

```bash
npm install @capacitor-community/apple-sign-in
npx cap sync ios
```

`Info.plist`:
```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key><false/>
</dict>
```

`App.entitlements`:
```xml
<key>com.apple.developer.applesignin</key>
<array><string>Default</string></array>
```

Supabase Auth → Providers → Apple → enable + paste Service ID, Team ID, Key ID, .p8 contents.

### 13.4 Veri Politikası

SIWA'da kullanıcı "Hide My Email" seçerse `@privaterelay.appleid.com` adresi gelir → bu adresi kabul et, gerçek email isteme.

---

## 14. GDPR / KVKK / COPPA

### 14.1 Age Gating

Birth form'da yaş hesabı yapıldığı için **doğal age gate** mevcut. Ek olarak:

- Welcome ekranında: "16 yaş altı kullanıma uygun değildir" rozeti
- İlk kayıt formunda: "16+ olduğumu beyan ediyorum" checkbox (uncheckli)
- Birth date < 16 yaş → "Bu uygulama 16 yaş üstü kullanım içindir" + back

### 14.2 GDPR Hakları (EU + UK + TR/KVKK uyumlu)

| Hak | Nasıl Sunuluyor |
|---|---|
| Bilgilendirme (Art. 13) | Privacy Policy + ilk açılışta consent banner |
| Erişim (Art. 15) | Settings → Privacy → Export My Data (JSON) |
| Düzeltme (Art. 16) | Settings → Profile → Edit |
| Silme (Art. 17) | Settings → Account → Delete Account (immediate) |
| Taşınabilirlik (Art. 20) | JSON export ile |
| İtiraz (Art. 21) | dataprotection@soulprofile.app |
| Otomatik karar verme bilgisi (Art. 22) | AI narrative açıklaması Privacy Policy'de |

### 14.3 COPPA (US 13 yaş altı)

Made for Kids = NO işaretlendiği için COPPA bizim için trigger değil, **ama** 13 yaş altı kayıt önlenmeli (App Privacy false declaration rejection sebebi).

Form validation: birth date → age >= 16 hard block.

### 14.4 Cookie / Tracking Consent (web)

iOS app'te cookie yok. Capacitor in-app browser kullanılırsa (privacy policy view), `SFSafariViewController` kullanın, custom WebView değil.

### 14.5 Data Processing Locations

| Servis | Konum | Legal basis |
|---|---|---|
| Supabase (auth, DB) | Frankfurt, EU | Performance of contract |
| Anthropic Claude | US | Standard Contractual Clauses (SCCs) signed |
| Sentry | Frankfurt, EU | Legitimate interest |
| PostHog (self-hosted) | Frankfurt, EU | Legitimate interest |

---

## 15. App Tracking Transparency (ATT)

### 15.1 Karar: **ATT Prompt YOK**

SoulProfile IDFA çekmiyor, 3rd party ad attribution kullanmıyor. Posthog event'leri tamamen 1st party.

**Önemli:** App Privacy → "Identifiers → Advertising Data" = NO işaretle. Yanlış işaretlersen Apple ATT prompt zorunlu kılar, install conversion düşer.

### 15.2 İleride Reklam Verirsek

Meta/TikTok Install Ads çalıştırırsak SKAdNetwork (SKAN 4.0) kullanılacak — IDFA gerekmez, ATT prompt gerekmez. Conversion value mapping ileride ayrı doküman.

---

## 16. Common Rejection Reasons + Bizim Risk + Mitigation

### 16.1 Rejection 5.1.1 — Data Collection and Storage

**Apple kuralı:** Kullanıcı verisi toplamadan önce **purpose string** ile permission iste; gereksiz veri TOPLAMA.

**Bizim risk:**
- Birth time/place hassas veri kategorisi
- Email zorunlu mu sorgusu reviewer'dan gelebilir

**Mitigation:**
- Birth data form ekranında **inline disclosure**: "Doğum bilgileri sadece karne üretimi için kullanılır. Üçüncü taraflarla paylaşılmaz."
- Privacy policy'de "purpose limitation" açıkça yazılı
- Anonim chart mode opsiyon: kullanıcı kayıt olmadan da karne üretebilmeli (Premium hariç)
- App Privacy Nutrition Label %100 doğru (yanlış declaration = rejection + ban)

### 16.2 Rejection 3.1.1 — In-App Purchase

**Apple kuralı:** Dijital içerik = IAP zorunlu. Stripe / kart yok. Restore Purchases zorunlu. Auto-renewable disclosure zorunlu.

**Bizim risk:**
- Premium ekranında external payment link OLMAMALI
- Web sürümünde Stripe kullanıyoruz → iOS app'te bu butonu GÖSTERME
- "Manage Subscription" linki olmalı, terms açık olmalı

**Mitigation:**
- Capacitor platform check: `Capacitor.getPlatform() === 'ios'` ise Stripe paywall'u gizle
- Paywall ekranı zorunlu içerik:
  1. Subscription duration (1 hafta / 1 ay / 1 yıl)
  2. Subscription content/services (ne alıyor)
  3. Fiyat (yerel currency, IAP product'tan dinamik)
  4. Auto-renewal disclosure (italic bold)
  5. Privacy + Terms link
  6. Restore Purchases button
  7. Free trial varsa "trial'dan sonra ücretlendirilir" ifadesi

### 16.3 Rejection 4.0 — Design (Minimum Functionality)

**Apple kuralı:** Web wrapper rejection riski (4.2.1). Pure web view + minimal native = ret.

**Bizim risk (YÜKSEK):** Capacitor wrapper = web-app-in-shell. Apple bunu "limited utility" görebilir.

**Mitigation:**
- **Native özellikler entegre et:**
  - [x] Push notifications (APNs)
  - [x] Sign in with Apple
  - [x] Apple IAP (StoreKit 2)
  - [x] Native share sheet (`@capacitor/share`)
  - [x] Native haptics (`@capacitor/haptics`)
  - [x] Native splash (`@capacitor/splash-screen`)
  - [x] Status bar styling (`@capacitor/status-bar`)
  - [x] Offline first chart cache (IndexedDB → SQLite plugin)
- App Review Notes'a yaz: "Native modules: APNs, SIWA, IAP, Share, Haptics, SQLite"
- Build'de Safari View Controller kullanma — Capacitor in-app navigation
- Initial Welcome ekranı tasarımı premium, App Store screenshots ile birebir uyumlu (Apple "consistency" arıyor)

### 16.4 Rejection 2.3 — Accurate Metadata

**Apple kuralı:** Screenshots actual app screen olmalı, description abartı (#1 rating, best app) olmamalı, keyword spam yok.

**Bizim risk:**
- "İlk Türk uygulaması" claim'i — kanıtlanmazsa rejection
- Screenshot'lar prototype'tan üretilirse 2.3.3 rejection

**Mitigation:**
- "İlk" claim'ini "Türkçe'de ilk" ile sınırla, doğrulanabilir
- Screenshot'ları gerçek build'den al, Figma mockup değil
- Keywords'te competitor adı YOK (CoStar, Pattern, Sanctuary = trademark rejection)
- Promotional text güncellemesi metadata değişikliği değil → reviewer'a düşmez (faydalı kanal)

### 16.5 Rejection 5.0 — Legal

**Apple kuralı:** Yerel yasalara uyum, copyright/trademark ihlali yok, age-appropriate content.

**Bizim risk:**
- Astroloji + spiritüel = "objectionable content" çerçevesinde fortune-telling olarak yorumlanabilir
- AI üretimli içerik kontrolsüz çıkış riski
- Tıbbi/finansal tavsiye yorumu risk

**Mitigation:**
- Description ve in-app footer'da explicit disclaimer: "Eğlence amaçlıdır, tıbbi/psikolojik/finansal tavsiye değildir."
- AI prompt'una hard guardrails: "Asla tıbbi tanı, ilaç önerisi, intihar/zarar konusu, finansal tavsiye, hukuki tavsiye verme. Sadece spiritüel/farkındalık dilinde kal."
- Content filter (Anthropic safety + bizim regex post-processing)
- App Review Notes'ta AI moderation bölümü
- "Fortune telling" kelimesi description'da YOK; "reflection", "awareness", "self-discovery" kullan

### 16.6 Bonus — Rejection 4.5.4 (Push spam)

**Mitigation:**
- Push opt-in dialog (Apple system prompt) hemen açma; user 2. session'da ve "Günlük transit bildirimi ister misin?" context'inde sor
- Hiç pazarlama push'u yok (varsa ayrı opt-in)
- Notification settings ekranı: per-type granular toggles

---

## 17. Submission Checklist (30 madde)

Submission'dan 48 saat önce her madde tek tek kontrol edilmeli. Sorumlu kişi imzalar.

### Build & Technical
- [ ] **1.** Xcode latest stable (2026: Xcode 16.x)
- [ ] **2.** iOS deployment target 17.0+ (iOS 26 latest test edilmiş)
- [ ] **3.** Build TestFlight'a yüklendi, en az 5 internal tester onayladı
- [ ] **4.** App Store Connect "Distribution" signing OK, no provisioning warning
- [ ] **5.** App size < 100 MB (cellular download limit altı tercih)
- [ ] **6.** Privacy manifest (`PrivacyInfo.xcprivacy`) eklendi, required reasons API'lar deklare edildi

### Auth & IAP
- [ ] **7.** Sign in with Apple çalışıyor, "Hide my email" senaryosu test edildi
- [ ] **8.** Email/password kayıt + login + reset flow test edildi
- [ ] **9.** Sandbox StoreKit ile 3 IAP'nin satın alımı çalışıyor (TR + US account)
- [ ] **10.** Restore Purchases butonu çalışıyor
- [ ] **11.** App Store Server Notifications V2 webhook canlı (`/api/iap/webhook` 200 dönüyor)
- [ ] **12.** Subscription cancel → entitlement expired sonrası Premium ekranı kapanıyor

### Privacy & Legal
- [ ] **13.** App Privacy nutrition labels %100 dolduruldu ve gerçeklikle uyumlu
- [ ] **14.** Privacy Policy URL 200, mobile-responsive, KVKK + GDPR maddeleri var
- [ ] **15.** Terms URL 200, abonelik şartları + auto-renewal açık
- [ ] **16.** Account deletion akışı çalışıyor (24 saat içinde tam silme)
- [ ] **17.** Data export (JSON) çalışıyor
- [ ] **18.** 16+ age gate aktif
- [ ] **19.** Disclaimer 3 yerde görünür (footer, paywall, karne alt köşesi)

### Content & Metadata
- [ ] **20.** TR metadata (name + subtitle + keywords + description + promo) char limit içinde
- [ ] **21.** EN metadata aynı kontroller
- [ ] **22.** 10 screenshot × 2 dil × 3 device boyut yüklendi
- [ ] **23.** 3 app preview video yüklendi (her boyut ve dil için)
- [ ] **24.** App icon 1024×1024 yüklendi, alpha YOK, < 1 MB
- [ ] **25.** Age rating 12+ questionnaire dolduruldu

### App Review
- [ ] **26.** Demo account oluşturuldu (Premium enabled), credentials kaydedildi
- [ ] **27.** App Review Notes tam yazıldı, AI disclaimer bölümü var
- [ ] **28.** Flow walkthrough PDF + deletion video attachment yüklendi
- [ ] **29.** Contact email (review@) inbox aktif, push açık, 4 saat içinde response SLA

### Submission Final
- [ ] **30.** "Submit for Review" basıldı + Slack #launch kanalına notify

---

## Ek — Submission Sonrası

### Review Süresi
- Median: 24 saat (2026 verisi)
- p90: 48 saat
- İlk submission'da rejection ihtimali: ~%40 — hazırlıklı ol, 1 round reject = normal

### Rejection Geldi Mi?

1. App Store Connect → Resolution Center → review the issue
2. **AYNI BUILD'I expedite ile re-submit etme** — fix yap, yeni build, yükle
3. Reply mesajında kanıt göster (screenshot, screen recording)
4. Expedited Review hakkı yılda ~2 — kritik launch için sakla

### Onaylandı

- Manual release seç (auto-release değil)
- PR push: Product Hunt, Twitter, mailing list
- Day 1 ratings critical → in-app rating prompt SADECE happy-path sonrası (karne paylaşımı sonrası 3 saniye delay ile)
- Day 1-7 sentiment dashboard takibi (Sensor Tower veya Appfigures)

---

## Referanslar

- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/
- Subscriptions: https://developer.apple.com/app-store/subscriptions/
- Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/
- App Store Connect Help: https://developer.apple.com/help/app-store-connect/

---

**Doküman sonu.** Son güncelleme: 2026-05-26. Bir sonraki revize: ilk submission rejection feedback'i sonrası.
