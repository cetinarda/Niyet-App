# App Store Connect — Final Metadata Paketi (Kopyala-Yapıştır Hazır)

> Bu doküman doğrudan App Store Connect formlarına yapıştırabileceğin
> üretime hazır metinleri içerir. Hiçbir alanı boş bırakma, karakter
> limitlerine sığacak şekilde optimize edildi.

---

## 1. App Information

### Name (30 char limit)
```
SoulProfile
```

### Subtitle (30 char limit)
**TR:**
```
Doğum verisi · uyum analizi
```
**EN:**
```
Birth-data · couple analysis
```

### Privacy Policy URL
```
https://soulprofile.life/privacy
```

### Category
- **Primary:** `Lifestyle`
- **Secondary:** `Education`

> ⚠️ Sakın `Reference` veya `Entertainment` seçme — 4.3 spam riskini artırır.

### Content Rights
- ⬛ This app contains, shows, or accesses third-party content → **No**

---

## 2. Pricing and Availability

- **Price:** `Free` (premium erişim IAP üzerinden)
- **Availability:** `All countries` (TR + worldwide) veya **TR + EU + US + UK** ile başla
- **Pre-Order:** Hayır
- **Volume Purchase Program:** Hayır

**Ücretsiz olan:** Doğum karnesi (9 sistem sentezi + AI Kozmik Anlatın) ve
ikili uyum (derin analiz dahil) — tamamen ücretsiz.
**Premium olan:** SADECE kendi haritadaki yıldız/gezegen konumu + hareketi
(3D Güneş Sistemi, Yıldız Yaşam Ağacı, zodyak çemberi).

---

## 3. In-App Purchase Setup

### İKİ ürün (her ikisi de `premium` entitlement'ı açar)

**A) Tek Seferlik (Non-Consumable)**
| Field | Value |
|---|---|
| **Type** | Non-Consumable |
| **Reference Name** | Premium Lifetime |
| **Product ID** | `life.soulprofile.app.unlock` |
| **Price** | ~$19.99 |
| **Availability** | All territories |
| RevenueCat package | `$rc_lifetime` |

**B) Aylık Abonelik (Auto-Renewable Subscription)**
| Field | Value |
|---|---|
| **Type** | Auto-Renewable Subscription |
| **Subscription Group** | SoulProfile Premium (yeni grup oluştur) |
| **Reference Name** | Premium Monthly |
| **Product ID** | `life.soulprofile.app.monthly` |
| **Duration** | 1 Month |
| **Price** | ~$4.99/ay |
| RevenueCat package | `$rc_monthly` |

> RevenueCat: iki ürünü de **`premium`** entitlement'a bağla; `default`
> offering içine iki package (`$rc_lifetime`, `$rc_monthly`) ekle. Kod bu
> paket kimliklerini arıyor (`lib/payments/skus.ts`).

### Localization

**Tek Seferlik — TR:** `Premium — Ömür Boyu` · `Yıldız ve gezegen konumları + hareketi, ömür boyu`
**Tek Seferlik — EN:** `Premium — Lifetime` · `Star & planet positions and movement, forever`
**Aylık — TR:** `Premium — Aylık` · `Yıldız ve gezegen konumları + hareketi, aylık`
**Aylık — EN:** `Premium — Monthly` · `Star & planet positions and movement, monthly`

### Review Screenshot
`/premium` sayfasının (iki plan görünür) iPhone ekran görüntüsü.

---

## 4. App Privacy

### Data Collected

| Data Type | Linked to User? | Used for Tracking? | Purpose |
|---|---|---|---|
| Name | Linked | No | App Functionality |
| Other User Content — Birth Data (date, time, place) | Linked | No | App Functionality |
| Photos | Linked | No | App Functionality (optional) |

### Tracking
- **Do you or your third-party partners use tracking technologies?** → **No**

### Third-Party Partners (Linked)
- **Anthropic Claude API** — AI narrative generation (yalnızca karne özetini gönderir, eğitime kullanılmaz)
- **RevenueCat** — IAP analytics (sadece satın alma durumu)
- **Open-Meteo Geocoding** — yer adından koordinat (anonim)

---

## 5. Version Information (1.0.0)

### What's New in This Version

**Türkçe:**
```
SoulProfile'ın ilk sürümü 🌌

· Doğum tarih · saat · yerinden 9 sistemin sentezi (Batı astrolojisi, Vedik nakshatra, Çin zodyak, Maya Tzolkin, Norse rune, Tarot, Human Design, numeroloji, yıldız ırkı)
· İkili Kozmik Uyum: Kimya · Ders · Ritim · Kader 4 katman skoru
· Vedik Ashtakuta uyum dokusu
· 3-kart deterministik tarot Pusulası
· Tam Derinlik Analizi: 10 bölümlük indirilebilir çift okuması
· Davet linki ile iki kişi tek bağdan uyum hesaplama

Karnen ve ikili uyum ücretsiz. Yıldız/gezegen konumu + hareketi için premium: tek seferlik $19.99 ya da aylık $4.99.
```

**English:**
```
SoulProfile v1.0 🌌

· From birth date · time · place, a synthesis of 9 systems (Western astrology, Vedic nakshatra, Chinese zodiac, Mayan Tzolkin, Norse rune, Tarot, Human Design, numerology, starseed)
· Dual Cosmic Compatibility: Chemistry · Lesson · Rhythm · Fate — a 4-layer score
· Vedic Ashtakuta fate weave
· 3-card deterministic Tarot Compass
· Full Depth Analysis: a 10-section downloadable couple reading
· Invite link — two people open their match from one tap

Your profile and compatibility are free. Star/planet positions & movement are premium: $19.99 one-time or $4.99/mo.
```

### Promotional Text (170 char) — istediğin zaman güncellenebilir, build gerektirmez

**TR:**
```
Doğum verinden 5 katmanlı uyum analizi. Astroloji synastry, Human Design tanımlı-açık merkez dansı, numeroloji, Vedik Ashtakuta ve tarot pusulası — bir karnede.
```

**EN:**
```
A 5-layer compatibility reading from birth data. Astrology synastry, Human Design defined-open dance, numerology, Vedic Ashtakuta and the tarot compass — in one report.
```

### Description (4000 char) — TR ana sürüm

```
Doğduğunda yıldızlar sana ne söylüyordu — ve şimdi başka biriyle birlikte neyi yansıtıyorsunuz?

SoulProfile, doğum tarih · saat · yerinden 9 analitik sistemi tek bir sentezde bir araya getirir. Bu bir falcılık uygulaması değildir; sembolik bir iç gözlem aracıdır. Karnen ve ikili uyum tamamen ücretsizdir. Yalnızca haritandaki yıldız ve gezegenlerin konumu ile hareketini görmek için premium: tek seferlik ya da aylık.

NE HESAPLANIR

• Batı astrolojisi — Güneş, Ay, Yükselen, 10 gezegen, Kuzey ve Güney Ay Düğümü, 12 ev, Vertex
• Vedik nakshatra — Ay'ın 27 yıldız evinden hangisi + pada
• Çin zodyak — 12 hayvan × 5 element × Yin/Yang
• Maya Tzolkin — Kin numarası, 20 gün mührü × 13 galaktik ton
• Norse Elder Futhark — doğum runun
• Tarot Major Arcana — kişilik + ruh kartın
• Human Design — tip, otorite, profil, strateji, beden grafiği
• Pythagorean numeroloji — Yaşam Yolu, İfade, Ruh Arzusu, Kişisel Yıl
• Yıldız ırkı arketipi — 10 galaktik hattan dominant olanı

KARNEDE NE GÖRÜRSÜN

• Kozmik kimliğin — paylaşılabilir 9:16 görsel kart
• 3D döndürülebilir doğum gökyüzü (gerçek gezegen dokuları)
• Yıldız Yaşam Ağacı — doğumdan bugüne gezegenlerin animasyonlu izi
• Karakter Stat kartı — 10 yetenek puanı (Güç, Sezgi, Dayanıklılık, Bilgelik...)
• 11 kavram için tıklanabilir derin detay
• AI üretimli "Ruhun Hikâyesi · Bilgelikleri · Gölgeleri"

İKİLİ KOZMİK UYUM

Senin doğum verin ile başka birinin verisi karşılaştırılır. Astroloji synastry, Human Design defined-open merkez dansı (elektromanyetik çekim, hâkimiyet ve arkadaşlık kanalları), numeroloji uyumu ve Vedik Ashtakuta 4-boyut hesabı bir araya gelir.

4 ekrana dağılmış sade akış:
1. İki Yıldız — iki kişinin temel kimliği
2. Beş Pencere — Kimya · Ders · Ritim · Kader skor halkaları
3. Aynalar — birbirinize ne yansıttığınız
4. Pusula — birlikte ne yapmalısınız + 3-kart deterministik tarot

DAVET LİNKİ

Karneni biriyle paylaş — link içine doğum verin şifreli gider, sunucuya hiçbir şey kaydedilmez. Karşı taraf kendi verisini girer ve ikili uyumunuzu görür.

TAM DERİNLİK ANALİZİ

İkili uyumla birlikte açılan 10 bölümlük uzun okuma:
• Ruhsal Kontrat — bu iki ruh hangi müfredata kayıt oldu
• Niye Bu Yaşamda Buluştular
• Karşılıklı Öğretim — A→B ve B→A
• Çatışma Deseni
• Ayrılık Dinamiği — ayrılırlarsa ne yaşanır
• Barışma Alanı
• Uzun Vadeli Rezonans
• Karmik Tema
• Çift İçin Pratikler
• Kapanış Mührü

Markdown olarak indirilebilir, paylaşılabilir.

ÜÇ SEMBOLİK ARKETİP

SoulProfile "twin flame", "kesin ruh eşi" gibi yargı içeren etiketler kullanmaz. Yerine üç sembolik gözlem sunar: Ders Ortağı · Ayna Eşi · Kutsal Birleşim Adayı. Hiçbiri kehanet değil, alan açan bir aynadır.

GİZLİLİK

Doğum verin yalnızca cihazında işlenir. Hesap zorunluluğu yoktur. İstediğin zaman tüm verini silebilir, JSON olarak indirebilirsin. KVKK + GDPR uyumlu.

16 yaş ve üzeri için tasarlanmıştır. Eğlence ve farkındalık amaçlıdır; tıbbi, psikolojik veya finansal tavsiye yerine geçmez.

Karnen ve uyum ücretsiz. Yıldız/gezegen konumu + hareketi için premium: $19.99 tek seferlik ya da $4.99/ay.
```

### Description (4000 char) — EN ana sürüm

```
When you were born, what did the stars say — and now, with someone else, what do you reflect in each other?

SoulProfile brings 9 analytical systems together into one synthesis, from your birth date · time · place. This is not a fortune-telling app; it is a symbolic introspection tool. Your profile and compatibility are entirely free. Only the position and movement of the stars and planets in your chart are premium: one-time or monthly.

WHAT IS COMPUTED

• Western astrology — Sun, Moon, Rising, 10 planets, North and South Nodes, 12 houses, Vertex
• Vedic nakshatra — which of the Moon's 27 lunar mansions + pada
• Chinese zodiac — 12 animals × 5 elements × Yin/Yang
• Mayan Tzolkin — Kin number, 20 day signs × 13 galactic tones
• Norse Elder Futhark — your birth rune
• Tarot Major Arcana — personality + soul card
• Human Design — type, authority, profile, strategy, body graph
• Pythagorean numerology — Life Path, Expression, Soul Urge, Personal Year
• Starseed origin archetype — the dominant of 10 galactic lineages

WHAT YOU SEE IN YOUR PROFILE

• Your cosmic identity — shareable 9:16 visual card
• 3D rotatable birth sky (real planet textures)
• Star Tree of Life — animated trace of planets from birth to now
• Character Stat card — 10 attribute scores
• 11 clickable concept deep-dives
• AI-generated "Soul Story · Wisdoms · Shadows"

DUAL COSMIC COMPATIBILITY

Your birth data is compared with someone else's. Astrology synastry, the Human Design defined-open center dance (electromagnetic attraction, dominance and companionship channels), numerology harmony and Vedic Ashtakuta 4-dimension calculation come together.

4 calm screens:
1. Two Stars — each person's core identity
2. Five Windows — Chemistry · Lesson · Rhythm · Fate score rings
3. Mirrors — what you reflect in each other
4. Compass — what to do together + 3-card deterministic tarot pull

INVITE LINK

Share your profile with someone — the link encodes your birth data; nothing is saved on our servers. They enter their own data and unlock your compatibility together.

FULL DEPTH ANALYSIS (Premium)

A 10-section long reading unlocked with one-time purchase:
• Soul Contract — what curriculum these two souls signed up for
• Why They Met in This Lifetime
• Reciprocal Teaching — A→B and B→A
• Conflict Pattern
• Separation Dynamic — what unfolds if you part
• Reunion Field
• Long-Term Resonance
• Karmic Theme
• Practices for the Couple
• Closing Seal

Downloadable as markdown, shareable.

THREE SYMBOLIC ARCHETYPES

SoulProfile never uses verdicts like "twin flame" or "guaranteed soulmate". Instead, three symbolic observations: Lesson Partner · Mirror Match · Sacred Union Candidate. None are predictions — each is a mirror that opens space.

PRIVACY

Birth data is processed on your device. No account required. Delete all data anytime, export as JSON. GDPR + KVKK compliant.

For ages 16+. For entertainment and self-awareness only; not a substitute for medical, psychological or financial advice.

Profile & compatibility free. Star/planet positions & movement premium: $19.99 one-time or $4.99/mo.
```

### Keywords (100 char) — Türkçe pazar
```
doğum haritası,human design,numeroloji,sinastri,vedik,nakshatra,uyum,iki kişi,karne,tarot
```

### Keywords (100 char) — English markets
```
birth chart,human design,numerology,synastry,vedic,nakshatra,compatibility,tarot,couple,soul
```

> ⚠️ Yasaklanan kelimeler (kullanma): `horoscope, fortune, psychic, twin flame, prediction, destiny, prophecy`

### Support URL
```
https://soulprofile.life/support
```

### Marketing URL
```
https://soulprofile.life
```

### Copyright
```
© 2026 SoulProfile
```

---

## 6. App Review Information

### Sign-In Information
- **Sign-in required:** Hayır (uygulama hesap zorunlu değil)
- Sadece sandbox satın alma testi için sandbox tester yarat (`docs/APP_STORE_UPLOAD.md` Adım 8)

### Contact Information
- **First Name:** [adın]
- **Last Name:** [soyadın]
- **Phone:** [telefon]
- **Email:** [iletişim emaili]

### Notes (REVIEWER NOTES — birebir yapıştır)

```
Dear App Review Team,

SoulProfile is NOT a fortune-telling, daily-horoscope, palmistry, or
psychic-chat application. It is a one-time-purchase introspective
analysis tool that synthesizes 9 distinct astronomical, mathematical,
and traditional symbolic systems into a single personal identity
report, generated from birth date / time / location:

1. Western astrological chart (planet positions, lunar nodes, 12 houses,
   Vertex) — calculated locally via astronomy-engine (MIT license)
2. Vedic / Jyotish nakshatra (lunar mansion) calculation
3. Chinese zodiac (12 animals × 5 elements × Yin/Yang)
4. Mayan Tzolkin (260-day sacred calendar)
5. Norse Elder Futhark birth rune (lookup)
6. Tarot birth cards (Major Arcana via Mary K. Greer formula)
7. Human Design body graph (64 gates × 36 channels × 9 centers)
8. Pythagorean numerology (Life Path, Expression, Personal Year)
9. Galactic origin archetype (10 starseed lineages based on chart factors)

The Dual Compatibility feature (the app's core flow) compares two
people's birth data through:
- Astrology synastry (Sun/Moon/Venus/Mars/Nodes/Vertex aspects)
- Human Design defined-open center dance (electromagnetic /
  dominance / companionship channel detection)
- Numerology Life Path harmony
- Vedic Ashtakuta 4-dimension calculation (Nadi/Bhakuta/Gana/Yoni)
- Deterministic 3-card tarot pull (seed = names + life paths)

Unique app-like functionality (NOT a website wrapper):
- Interactive 3D solar system (WebGL/three.js) with real NASA-derived
  textures, rotating Earth, clickable planets at their birth positions
- Animated Star Tree of Life — planetary trajectories from birth to now
- Interactive birth chart wheel with rendered SVG planet positions
- Dual Compatibility engine — 4-screen calm flow (Two Stars → Five
  Windows → Mirrors → Compass)
- 10-section Full Depth Analysis — downloadable as markdown
- Invite link with encoded birth data (NO server storage)
- Native plugins: @capacitor/share, @capacitor/preferences,
  @capacitor/filesystem
- Works offline (fallback narrative generator)

INTENTIONALLY EXCLUDED (to prevent any confusion with fortune-telling):
- No daily horoscope feed
- No predictions about future events
- No psychic chat or live readings
- No palm reading or face reading
- No prophecies, soulmate guarantees, or "twin flame" verdicts
- Three symbolic relationship archetypes are explicitly labeled as
  "symbolic observations, not future predictions"

Educational component (Lifestyle + Education):
- 30+ entry interactive glossary explaining concepts
- 11 clickable concept cards with contextual deep-dives
- AI-generated explanatory narratives (Claude Sonnet 4.6) framed as
  symbolic observations, never as predictions
- Long-form Full Depth Analysis with 10 sections including soul
  contract, conflict pattern, separation dynamic, reunion field —
  always framed as "a door opens / a possibility" rather than
  "will happen / certain"

Pricing model:
- Free tier: 1 cosmic profile + 1 compatibility check
- Premium: $19.99 one-time (non-consumable) OR $4.99/month (auto-renewable subscription)
  (life.soulprofile.app.unlock)
- No subscription. No recurring billing. Restore Purchases supported
  (Guideline 3.1.1).

Compliance & disclaimers:
- App footer (every screen): "For entertainment and self-awareness
  only. Not a substitute for medical, psychological or financial
  advice."
- /terms page: full legal disclaimer
- /about page "What we don't do" section explicitly states no medical,
  psychological, financial, or predictive claims
- Privacy Manifest included: NSPrivacyTracking=false, all data types
  marked App Functionality (not for tracking)
- 16+ age gate stated in Terms
- KVKK + GDPR data deletion and export available in /settings

Demo data for review:
Birth A: name "Ada Yıldız", 1994-04-28 14:30 İstanbul, Türkiye
Birth B: name "Mert Deniz", 1992-09-12 09:00 Ankara, Türkiye
(Use these to exercise the Dual Compatibility flow.)

Texture/library credits:
- Planet textures: threex.planets (MIT, github.com/jeromeetienne/threex.planets)
- Astronomy engine: astronomy-engine (MIT)
- 3D rendering: three.js + react-three-fiber (MIT)
- AI narrative: Anthropic Claude API
- IAP: RevenueCat Capacitor SDK

If you have any questions, we're happy to clarify any aspect of the
app. Thank you for your time.
```

---

## 7. App Store Connect Build Section

- **Build:** TestFlight'a yüklediğin son build'i seç
- **Export Compliance:** Daha önce cevapladıysan otomatik dolar
  - "Does your app use encryption?" → **Yes** (HTTPS)
  - "Does it qualify for the exemptions?" → **Yes**
  - Bu cevap zaten Info.plist'teki `ITSAppUsesNonExemptEncryption=NO` ile sabitlendi

---

## 8. Screenshots — neyi göstermeli

iPhone 6.9" (iPhone 16 Pro Max) ve iPhone 6.5" (iPhone 11 Pro Max) için **her birinden 10 adet**, üstte kısa başlıkla:

| # | Ekran | Üst başlık (TR) | Üst başlık (EN) |
|---|---|---|---|
| 1 | Welcome hero | İki ruh nasıl birbirini yansıtır? | How do two souls mirror each other? |
| 2 | 3 sembolik arketip | Ders Ortağı · Ayna Eşi · Kutsal Birleşim | Lesson · Mirror · Sacred Union |
| 3 | Compatibility "Beş Pencere" | 4 katman skoru: Kimya · Ders · Ritim · Kader | 4-layer score |
| 4 | Compatibility "Aynalar" | Birbirinize ne yansıtıyorsunuz | What you reflect in each other |
| 5 | Compatibility "Pusula" + 3 kart | 3-kart Pusulası ve AI tavsiye | 3-card Compass + AI advice |
| 6 | Tam Derinlik Analizi (premium kart) | 10 bölümlük tam derinlik analizi | 10-section full depth analysis |
| 7 | Tam Derinlik Analizi (üretilmiş) | İndirilebilir Markdown rapor | Downloadable markdown report |
| 8 | Karne — kimlik kartı | Kozmik kimliğin bir karnede | Your cosmic identity in one card |
| 9 | 3D Doğum Gökyüzü | Doğum anındaki gerçek gezegen konumları | Real planet positions at your birth moment |
| 10 | Karakter Stat | 10 yetenek halinde sen | You in 10 attributes |

> Simulator'da ⌘+S ile yakalanır. Gerekirse Figma'da "device frame + başlık" overlay ekle.

---

## 9. Submission Sonrası Bekleme

- İnceleme süresi (TR/EU): genellikle **24-48 saat**, bazen 7 güne kadar
- Reddedilirse: Resolution Center'dan mesaj gelir
  - `docs/APP_STORE_LESSONS.md`'deki **"B Planı" appeal taslağı** birebir yapıştırılır
  - Appeal'in sonucu **48 saat** içinde gelir
- Onaylandığında: "Pending Developer Release" durumuna geçer (sen "Release" butonuna basana kadar kullanıcıya açılmaz)

---

## 10. Hızlı kopyala satırı — ŞU AN'A KADAR KAYDETTİĞİN

✅ TR + EN tam metadata yapıştırma hazır
✅ Reviewer Notes 4.3 spam reddine karşı koruyucu
✅ IAP product setup tek satır: `life.soulprofile.app.unlock`
✅ Privacy Manifest: tracking yok, sadece App Functionality
✅ İki plan: $19.99 tek seferlik (non-consumable) + $4.99/ay (auto-renewable)

**Bir sonraki adım:** `docs/APP_STORE_UPLOAD.md` Adım 9 — Archive ve TestFlight upload.
