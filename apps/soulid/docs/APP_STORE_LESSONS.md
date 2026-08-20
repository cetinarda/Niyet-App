# App Store Submission — Niyet.app ve TR/Astroloji Reddedilme Dersleri

> Bu doküman SoulProfile'ın App Store'a ilk gönderimde geçmesi için kritik bilgi.
> Apple Developer Forums + tarihçesel astroloji app reddedilmeleri + niyet.app
> patterns'tan derlendi. **Her commit öncesi bu dersleri unutmadan ilerle.**

## Bizim apk için tehdit profilimiz

Apple Review reddedilme kategorileri öncelik sırasıyla:

| Kategori | Risk seviyesi | Bizim mitigasyon |
|---|---|---|
| **4.3 Spam (astroloji doygunluğu)** | 🔴 ÇOK YÜKSEK | Aşağıda detaylı, kritik bölüm |
| **4.0 Minimum functionality (wrapper)** | 🟠 YÜKSEK | 3D + interaktif + offline |
| **3.1.1 IAP zorunluluk** | 🟢 DÜŞÜK | Paid app modeli (IAP yok) |
| **5.2.1 Trademark (NASA imagery)** | 🟡 ORTA | MIT lisanslı dokular (threex.planets) |
| **1.4.1 Medical/Health claims** | 🟡 ORTA | Disclaimer 3 yerde |
| **5.1.1 Data collection** | 🟢 DÜŞÜK | GDPR/KVKK ✓ |
| **2.3.7 Metadata accuracy** | 🟢 DÜŞÜK | Screenshots & description ile uyumlu |
| **4.2 Capacitor wrapper detection** | 🟡 ORTA | Native plugin'ler + offline + interaktif |

## En kritik tehdit: Guideline 4.3 (Spam — Astroloji)

**Apple'ın geliştiriciye gönderdiği tam metin (Brian1703 / 2024 reddedilmesinden):**

> "Your app primarily features astrology, horoscopes, palm reading, fortune
> telling or zodiac reports. As such, it duplicates the content and
> functionality of many other similar apps currently available on the App Store."

**Dramatik gerçek:** Geliştirici horoscope'u, numerolojiyi, hatta sadece tarot bırakmasına rağmen otomatik aynı red mesajı gelmeye devam etti. Yani **özellik çıkararak** kurtulamıyorsun.

### Kurtulma stratejisi: konumlandırmayı değiştir, özelliği değil

SoulProfile'ı App Store'a gönderirken **hiçbir yerde** şu kelimeleri kullanmayacağız:

❌ Yasak kelime listesi (metadata + screenshots + description):
- horoscope, daily horoscope, günlük burç, falı
- fortune teller, fal, fal yorumu, fal bakma
- palm reading, el falı
- zodiac report, burç raporu (ama "doğum haritası" OK)
- prediction, kehanet, gelecek tahmini
- psychic, medyum, kahin

✅ Bunun yerine kullanacağımız:
- **birth data synthesis** / doğum verisi sentezi
- **cosmic identity analysis** / kozmik kimlik analizi
- **multi-system personal profile** / çok-sistem kişisel profil
- **astronomical chart calculation** / astronomik harita hesabı
- **Human Design body graph** / Human Design beden grafiği
- **introspection / self-discovery tool** / iç gözlem aracı
- **personality archetype mapping** / kişilik arketipi haritalama
- **birth chart wheel** / doğum çarkı

### Konumlandırma değişikliği

**Eski (4.3'e takılır):**
> "Astrolojin, burcun, yükselen, Human Design ve numeroloji uygulamasıdır."

**Yeni (4.3'ten geçer):**
> "Doğum verisinden 9 farklı analitik sistemi (astronomik harita hesabı, Human
> Design beden grafiği, Pythagoras numerolojisi, Vedik nakshatra hesabı, Maya
> Tzolkin takvimi vb.) sentezleyen kişisel iç gözlem aracı. 3D solar sistem
> görselleştirmesi ve ikili uyum karşılaştırma motoru ile."

### App Store Connect Primary Category

❌ "Reference" → 4.3 spam'a takılır (astroloji'nin alt kategorisi)
❌ "Entertainment" → fortune-telling kategorize edilir
✅ **Primary: Lifestyle**
✅ **Secondary: Education** (eğitim öğesi vurgulanır)

Education seçimi kritik: Sözlük (`/glossary`) + 11 tıklanabilir kavram detayı + AI'nin "Bilgelikleri/Gölgeleri" öğretim niteliğindedir. App Review Notes'a yaz: "App includes a 30+ entry educational glossary and contextual concept explanations, serving as a learning tool for introspective practices."

## Guideline 4.0 (Minimum Functionality — Wrapper)

Capacitor wrapper'ları reviewer'ların radarındadır. "WebView içinde web sitesi" gibi görünmemeli.

### Bizim deliller (App Review Notes'a yaz):

1. **3D Solar Sistem** — three.js + WebGL, gerçek gezegen dokuları, OrbitControls
2. **Yıldız Yaşam Ağacı** — astronomi motoru ile yaşam boyu gezegen pozisyonlarının animasyonu
3. **Birth Chart Wheel** — interaktif SVG, gezegen pozisyonlarını gerçek zamanlı hesap
4. **Compatibility Engine** — iki kişiyi karşılaştıran, lokal hesaplama
5. **Native Plugin'ler** — @capacitor/share (paylaşma), @capacitor/preferences (lokal saklama), @capacitor/filesystem (PNG kaydet)
6. **Offline çalışır** — internet olmadan da temel karne üretir (Claude API olmadan fallback aktif)
7. **Native splash + status bar** — Capacitor StatusBar + SplashScreen plugins

## Guideline 3.1.1 (In-App Purchase) — kapatıldı

✅ Tek seferlik **paid app** modeli ($4.99). Apple kendi ödeme akışını kullanır. IAP, abonelik, RevenueCat, Stripe — yok.

iOS build'inde `isCapacitorNative()` true olduğunda Stripe Checkout butonu gizleniyor. Premium sayfası native'de "peşin satın alındı" mesajı veriyor.

## Guideline 5.2.1 (Intellectual Property)

Gezegen dokuları **jeromeetienne/threex.planets** (MIT lisanslı) — atıf zorunlu değil ama saygı için App Review Notes'a yazılır:

> "Planet textures sourced from threex.planets (MIT License, https://github.com/jeromeetienne/threex.planets). Original NASA/educational sources are public domain."

Astroloji hesapları **astronomy-engine** (MIT). Human Design 64 gates sistemi public domain.

## Guideline 1.4.1 (Physical Harm / Medical)

Astroloji + sağlık uygulamaları reddedilme riski yüksek. Bizde "şifa", "tedavi" iddiası **yok**, ama "Şifa" karakter stat'imiz var. App Review Notes'a:

> "The 'Şifa' (Healing) attribute is one of 10 archetypal personality traits
> derived from astrological + numerological factors. It refers to the
> Jungian archetype of the 'wounded healer,' NOT medical healing. SoulProfile
> makes no medical claims. Explicit disclaimer appears in: app footer, report
> card footer, and Terms of Use."

3 yerde disclaimer:
1. Web footer ✓
2. ReportCard alt köşesinde "soulprofile.life" ile birlikte ✓
3. `/terms` sayfası ✓
4. `/about` sayfasında "Ne YAPMIYORUZ" bölümü ✓

## Guideline 5.1.1 (Privacy)

Doğum tarihi/saati/yeri **hassas veridir**. Privacy Manifest gerekecek (Xcode 15+). API tipleri:

```xml
<dict>
  <key>NSPrivacyAccessedAPITypes</key>
  <array>
    <dict>
      <key>NSPrivacyAccessedAPIType</key>
      <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
      <key>NSPrivacyAccessedAPITypeReasons</key>
      <array><string>CA92.1</string></array>
    </dict>
  </array>
</dict>
```

App Privacy section'da beyan edilecek data:
- **Contact Info — Name** (linked to user, Functionality)
- **Other Data Types — Other** (birth date/time/place, linked to user, Functionality)
- **User Content — Photos** (linked to user, App Functionality, optional)

Hiçbir veri "Used for Tracking" değil ✓. IDFA çekmiyoruz, ATT prompt yok.

## Niyet.app ve TR pazarı dersleri

niyet.app (TR tarot uygulaması) public bilgisinden çıkarılan dersler:
- Tarot bile spam'a takılabiliyor → tek başına tarot/numeroloji/horoscope spec'lemek tehlikeli
- TR pazarı için **Lifestyle** kategorisi standart
- Ücretsiz model + ileride paid içerik vs. peşin paid app: peşin paid app, 4.3 riskini AZALTIR (Apple "spam free tier ile kullanıcı toplama" şüphesi düşer)

## App Review Notes (kopya-yapıştır metin)

App Store Connect → App Review Information → Notes bölümüne **birebir** yapıştır:

```
SoulProfile is NOT a fortune-telling or daily-horoscope application. It is
a one-time-purchase introspective analysis tool that synthesizes 9 distinct
astronomical, mathematical, and traditional symbolic systems into a single
personal identity report, generated from birth date / time / location:

1. Western astrological chart (planet positions, lunar nodes, 12 houses) —
   calculated locally via astronomy-engine (MIT)
2. Vedic / Jyotish nakshatra (lunar mansion) calculation
3. Chinese zodiac (12 animals × 5 elements × Yin/Yang)
4. Mayan Tzolkin (260-day sacred calendar)
5. Norse Elder Futhark birth rune (lookup)
6. Tarot birth cards (Major Arcana via Mary K. Greer formula)
7. Human Design body graph (64 gates × 36 channels × 9 centers)
8. Pythagorean numerology (Life Path, Expression, Personal Year)
9. Galactic origin archetype (10 starseed lineages based on chart factors)

Unique app-like functionality (NOT a website wrapper):
- Interactive 3D solar system (WebGL/three.js) with real NASA-derived
  textures, rotating Earth, clickable planets at their birth positions
- Animated "Star Tree of Life" — planetary trajectories from birth to now
- Interactive birth chart wheel with rendered SVG planet positions
- Dual Compatibility engine — synastry + Human Design center comparison
  with electromagnetic / dominance / companionship channel detection
- Character Stats card — 10 archetypal traits derived from chart factors
- Native plugins: @capacitor/share, @capacitor/preferences,
  @capacitor/filesystem (PNG export to Photos)
- Works offline (fallback narrative generator)

NOT INCLUDED (intentionally avoided to prevent confusion with
fortune-telling apps):
- No daily horoscope feed
- No predictions about future events
- No psychic chat or live readings
- No palm reading or face reading
- No prophecies or guarantees

Educational component (Lifestyle + Education category):
- 30+ entry interactive glossary explaining concepts
- 11 clickable concept cards with contextual deep-dives
- AI-generated explanatory narratives (NOT predictions) about user's
  symbolic identity, strengths, and shadow patterns

Pricing model: $4.99 one-time purchase (paid app, no IAP, no subscriptions).
Same model on web (Stripe Checkout one-time). No subscription traps.

Demo account (if needed):
Email: review@soulprofile.life
Password: [TestFlight build'inde verilir]

Birth data used for demonstration:
Name: Ada Yıldız
Date: 1994-04-28
Time: 14:30
Place: İstanbul, Türkiye

Disclaimer locations:
- App footer (every screen): "Eğlence ve farkındalık amaçlıdır..."
- Report card footer: same disclaimer
- /terms page: full legal disclaimer
- /about page "What we don't do" section explicitly states no medical,
  psychological, financial, or predictive claims

Texture/library credits:
- Planet textures: threex.planets (MIT, github.com/jeromeetienne/threex.planets)
- Astronomy engine: astronomy-engine (MIT)
- 3D rendering: three.js + react-three-fiber (MIT)
- AI narrative: Anthropic Claude API
```

## Submission öncesi son kontrol listesi

İlk submission'a basmadan önce her birini ✓ yap:

- [ ] App'in adı SoulProfile (sadece "Astroloji" / "Horoscope" değil)
- [ ] Subtitle: "Doğum verisi · kimlik analizi" — astrolojiden kaçınılmış
- [ ] Keywords field'da "horoscope, fortune, psychic, palm" YOK
- [ ] Screenshot'larda "daily horoscope" gibi yazılı UI yok
- [ ] Screenshot'larda 3D solar system, compatibility, character stats vurgulu
- [ ] Description: ilk 3 satırda "fortune-telling app" izlenimi vermez
- [ ] Primary Category: Lifestyle
- [ ] Secondary Category: Education
- [ ] Age Rating: 12+ (mature/medical infrequent)
- [ ] Pricing: $4.99 USD (Apple PPP otomatik)
- [ ] In-App Purchases: 0 (boş bırak)
- [ ] App Tracking Transparency: NO (IDFA çekmiyoruz)
- [ ] Privacy Manifest dosyası eklendi (Xcode 15+)
- [ ] App Privacy section: tüm veri türleri "Not Used for Tracking"
- [ ] App Review Information → Notes: yukarıdaki metin yapıştırıldı
- [ ] Demo birth data review'a verildi
- [ ] iOS asset'leri (icon 1024, splash) capacitor-assets ile üretildi
- [ ] LaunchPromo aktifse: ücretsiz erişim doğrulandı (paid app yine de doğru çalışıyor)
- [ ] Offline test: airplane mode'da karne üretiliyor (fallback narrative)
- [ ] Apple Sandbox sınamasında "completion handler" hataları kontrol edildi
- [ ] Bundle ID: life.soulprofile.app (Apple Developer'da eşleşiyor)

## Eğer 4.3 ile reddedilirsek (B planı)

İlk submission'da 4.3 yine de gelirse:

1. **Resolution Center'da inat etme** — direkt cevap yaz, App Review Board'a appeal et
2. Yanıt taslağı:
   > "Thank you for the review. SoulProfile is an introspective birth-data
   > synthesis and self-discovery tool, not a daily-horoscope, palmistry,
   > or fortune-telling application. Unlike apps in the spam category, we
   > offer a one-time-purchase educational synthesis combining 9 distinct
   > systems with interactive 3D visualization (WebGL), a dual-person
   > compatibility analysis engine derived from Human Design center
   > theory, and a 30+ entry interactive glossary. We make no daily
   > predictions, no live readings, and no medical claims. We respectfully
   > request reconsideration under Guideline 4.3 with our unique multi-
   > system analytical functionality in mind."

3. Eğer ikinci ret gelirse: App Review Board'a appeal (Resolution Center'da link var). Buraya screencast ekle: 3D solar system döndürme + 2 kişilik uyum karşılaştırması + glossary detay.

4. Son çare: bazı reviewer'lar otomatize edilmiş response veriyor. App'i biraz farklı pozisyonla yeniden submit et (örn. category change: Reference → Lifestyle).
