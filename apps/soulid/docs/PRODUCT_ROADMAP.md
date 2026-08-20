# SoulProfile — 12 Aylık Ürün Yol Haritası

> Bu doküman ürün (product) boyutuna odaklanır. Pazarlama, ASO, influencer ve
> brand voice için `marketing/` altındaki dosyalara bakın. Premium SKU teknik
> detayları için `docs/PREMIUM_ROADMAP.md` kanonik kalır — bu doküman onun
> üzerine ürün, retention, viral ve platform stratejisini örer.

---

## 1. Strategic North Star

12 ay sonra SoulProfile, "kişinin galaktik kökeni + bu yaşamdaki görevi +
ilişki dinamikleri" üçlüsünü tek bir paylaşılabilir kimlik kartına oturtmuş,
**The Pattern'ın ilişki derinliğini Co-Star'ın viral sosyal mekaniğiyle birleştirip
Sanctuary'nin premium ARPU'sunu yakalayan**, TR+US+Latam'da en az 3M MAU,
$8 ARPU/ay ve 0.5+ K-factor üreten kategoriye özel "spiritual identity layer"
olmalıdır.

**Tek cümlelik kazanma tezi:** "Co-Star'ı paylaşırsın, The Pattern'ı okursun,
SoulProfile'ı **olursun** — çünkü o senin galaktik kimliğin, sadece bir uygulama değil."

---

## 2. Rakip Differential Matrix

Skala: ● tam var · ◐ kısmi/zayıf · ○ yok · ★ pazarda lider

| Özellik | SoulProfile (bugün) | The Pattern | Co-Star | Sanctuary | Stellar | Nebula | Chani | Sakin.life | HD America/MyBodyGraph |
|---|---|---|---|---|---|---|---|---|---|
| Natal chart core | ● | ● | ● | ● | ★ | ● | ● | ◐ | ○ |
| Human Design tam | ★ | ○ | ○ | ◐ | ○ | ○ | ○ | ○ | ★ |
| Numeroloji (Pisagor) | ● | ○ | ○ | ◐ | ○ | ◐ | ○ | ◐ | ○ |
| Yıldız ırkı / starseed | ★ | ○ | ○ | ○ | ○ | ◐ | ○ | ○ | ○ |
| Paylaşılabilir kart (9:16) | ● | ◐ | ★ | ○ | ○ | ○ | ○ | ○ | ○ |
| Friend sync / compat | ○ | ★ | ● | ● | ◐ | ○ | ● | ○ | ◐ |
| Günlük transit/horoscope | ○ | ● | ★ | ● | ★ | ● | ★ | ◐ | ○ |
| Push notification ritmi | ○ | ● | ★ | ● | ● | ● | ● | ◐ | ○ |
| Canlı astrolog / chat | ○ | ○ | ○ | ★ | ○ | ★ | ○ | ○ | ◐ |
| AI conversational guide | ◐ | ◐ | ○ | ○ | ○ | ◐ | ◐ | ○ | ○ |
| Voice / TTS karne | ○ | ○ | ○ | ◐ | ○ | ○ | ◐ | ◐ | ○ |
| Çoklu dil (en+es+pt+de+fr) | ○ | ● | ● | ● | ◐ | ● | ◐ | ○ | ◐ |

**Bizim 3 büyük açığımız (Faz 1-2'de kapatılmalı):**

1. **İlişki / friend sync yok** — Co-Star ve The Pattern bu özellikle viral
   oldu. K-factor'ümüzü tek başına ikiye katlayabilir.
2. **Günlük geri dönüş kancası yok** — Transit/horoscope/biorhythm push'u
   olmayan bir uygulama D7 retention'da %5'in altına düşer.
3. **Hesap & senkronizasyon yok** — Tek seferlik karne üretip kapatan
   kullanıcı = D1 churn. Cross-device profil zorunluluk.

---

## 3. Üç Killer Differentiator (Build Et!)

### 3.1 "Galactic Origin Lineage" — Çoklu Yıldız Mirası Ağacı

**Konsept:** Şu an kullanıcıya tek bir starseed arketipi atıyoruz. Yeni model:
her kullanıcı **birincil (60-80%) + ikincil (15-25%) + dormant/uyuyan (5-15%)**
olmak üzere 3 katmanlı galaktik miras alır. Yeryüzünde "tam saf" yıldız ırkı
kalmamıştır — herkes hibrittir. Bu, hem astrolojik olarak daha defandable
(çünkü gerçek bir kombinasyon matematiği var: Güneş + Ay + Yükselen + HD
profil + Yaşam Yolu numerolojisi karışımı), hem de **paylaşma motivasyonu
yaratır**: kullanıcı "ben %72 Pleiadyalı + %19 Arkturian + %9 dormant Mintakan'mışım"
diye paylaşır.

**Neden viral olur:** Co-Star'ın Sun/Moon/Rising üçlüsünün spiritüel
versiyonu. Sosyal medyada "What's your lineage?" trendi başlatabiliriz.
9:16 karnenin üst kısmı = ana arketip, orta = blend percentage donut chart,
alt = "Find yours" CTA. Insta story'de poll özelliği ile arkadaşlar tahmin
etmeye çalışır → app açılır.

**Teknik uygulama:**
- Hafta 1-2: Lineage compute fonksiyonu (`lib/galactic/lineage.ts`) —
  mevcut 10 arketipe ağırlık vektörü ekle, Güneş takımyıldızı, Ay fazı,
  HD authority ve Yaşam Yolu'ndan weighted blend hesapla.
- Hafta 3: Yeni karne template'i (donut chart + 3 katman).
- Hafta 4: Lineage compatibility — iki kullanıcının lineage'ları
  birbirini ne kadar besler/zorlar (Faz 2 friend sync için temel).

**KPI:** Karne paylaşım oranı %32 → %48; lineage-spesifik hashtag'lerde
ay sonu 10K+ post.

---

### 3.2 "Soul Mission Tracker" — Kuzey Düğüm Görevini Oyunlaştır

**Konsept:** Şu an "3 görev sentezi" statik bir metin. Yeni model: kullanıcı
Kuzey Düğüm görevini **12 aylık spiritüel quest** olarak görür. Her ay
2-3 mikro mission gelir (örn. "Kuzey Düğümün Aslan'da → bu ay 3 kez tek
başına sahneye çık: bir karaoke, bir toplantıda ilk sözü al, bir public
post"). Kullanıcı tamamladığında **soul XP** kazanır, **mission streak**
oluşur, yıl sonunda "Soul Year Wrapped" Spotify-style retrospektif görsel
üretilir.

**Neden viral olur:** Spotify Wrapped + Duolingo streak + astroloji. Streak
bozulma korkusu = günlük açılış. Yıl sonu Wrapped = Aralık'ta 30 günlük
organik patlama. Hiçbir spiritüel uygulamada **gamified mission system**
yok — Sanctuary statik içerik, Co-Star pasif horoscope.

**Teknik uygulama:**
- Hafta 1-2: `lib/missions/` mevcut → quest engine'e dönüştür. Kuzey
  Düğüm × HD profil × Yaşam Yolu kombinasyonu için 144 mission template.
- Hafta 3: Streak/XP/badge tablosu (`supabase/migrations/0002_missions.sql`).
- Hafta 4: Push notification entegrasyonu (mission reminder, streak warning).
- Hafta 5-6: Soul Year Wrapped generator (yıllık özet karne, Aralık'ta
  drop edilecek viral asset).

**KPI:** D30 retention %11 → %22; haftalık aktif kullanıcı başına 4.2+
mission completion.

---

### 3.3 "Cosmic Mirror Sessions" — AI ile Sesli Soul Chat

**Konsept:** Premium kullanıcı haftada bir, "Cosmic Mirror" adında 5-10
dakikalık sesli bir seans alır. Claude API + ElevenLabs/Hume TTS ile
kullanıcının doğum haritası, son hafta transitleri, mission progress'i
ve **önceki seans hafızası** kullanılarak kişisel monolog üretilir.
Kullanıcı dinlerken sesli soru sorabilir (Whisper STT), AI cevaplar.
Bu, Sanctuary'nin canlı astrolog modelinin **AI ile 1/50 maliyetli
versiyonu** — ama statik horoscope'tan 100x daha kişisel.

**Neden viral olur:** Sosyal medyada "Bu yapay zeka beni nasıl bu kadar
iyi tanıyor" reaction video'ları. TikTok'ta `#CosmicMirror` formatı:
kullanıcı sessionı dinlerken kameraya bakıyor, altyazı geçiyor, gözleri
doluyor. Anthropic Claude'un derinliği + voice + spiritüel ton = yüksek
duygusal yoğunluk = paylaşma.

**Teknik uygulama:**
- Hafta 1-2: Edge function `supabase/functions/cosmic-mirror/` — Claude
  sonnet-4-6 + prompt caching (user system prompt = tüm doğum verisi +
  son 4 seans özeti).
- Hafta 3: ElevenLabs TTS entegrasyonu (Türkçe + İngilizce ses kütüphanesi,
  3 voice persona: "Pleiadyalı dişil", "Arkturian erkek", "Andromedan nötr").
- Hafta 4: Audio player UI + waveform visualizer + transcript.
- Hafta 5: Whisper STT ile sesli soru (premium tier 2).
- Hafta 6: Session memory tablosu (`mirror_sessions`) — Claude'a
  geçmiş sessionların özeti yedirilir.

**KPI:** Premium dönüşüm %3 → %9; premium D90 retention %38; her session
sonrası NPS 60+.

---

## 4. Faz 1 (Ay 1-3) — Foundation & Retention

| # | Özellik | Kullanıcı Problemi | Çözüm | Kabul Kriteri | Effort | Pri |
|---|---|---|---|---|---|---|
| 1 | **Supabase auth + cross-device profil** | Karne ürettim, telefonu değiştirdim, kayboldu | Email + Apple + Google sign-in; profil tüm cihazlarda sync | Login sonrası tüm geçmiş karneler yüklenir, ≤2sn | M | P0 |
| 2 | **Onboarding birth-time unknown akışı** | Saat bilmiyorum, uygulamayı bırakıyorum | "12:00 noon chart" fallback + sonradan rectification CTA | Saat boş bırakılırsa karne yine üretilir, "Saatini biliyor musun?" banner sürekli görünür | S | P0 |
| 3 | **Push notification altyapısı (OneSignal)** | Uygulamayı unutuyorum | Topic-based push: daily, transit, mission, mercury retro | Web Push API + iOS APNs (Faz 4) hazır; 4 segment | M | P0 |
| 4 | **Daily Cosmic Weather kartı** | Bugün neye dikkat etmeliyim | Anasayfa top-fold: Ay fazı + bugünkü en güçlü transit + 1 cümle | Kullanıcı her gün açtığında değişiyor; cache 6 saat | M | P0 |
| 5 | **Biorhythm widget (lib/biorhythm zaten var)** | Enerjim neden bugün düşük | Fiziksel/duygusal/zihinsel 23/28/33 günlük dalga grafiği | Anasayfada inline; tap → tam ekran 30 günlük forecast | S | P1 |
| 6 | **Karne history + favoriler** | Geçmiş karnelerimi göremiyorum | `/library` sayfası: tüm üretilen karneler timeline | Karne tıkla → tam görünüm + tekrar paylaş + delete | S | P0 |
| 7 | **Account deletion + data export (GDPR)** | Hesabımı silmek istiyorum | `/data` sayfası tamamen fonksiyonel hale getir | 30 gün soft delete + JSON export email | S | P0 |
| 8 | **Onboarding optimizasyonu (3 step)** | Uzun form, vazgeçiyorum | Step 1: ad+tarih · Step 2: saat+yer · Step 3: foto+izin | Funnel drop-off her step <%15 | S | P0 |
| 9 | **Karne PNG export QR + watermark** | Paylaşılan görsel kimden bilinmiyor | Sağ alt: dinamik QR (referral kod) + soulprofile.life | Her PNG'de QR scan → /?ref=USER_ID deep link | S | P0 |
| 10 | **i18n: TR + EN paralel** | İngilizce kullanıcı yapamıyor | next-intl + tüm UI string'leri JSON; karne metni Claude TR/EN | Dil seçici TopBar'da; user.locale Supabase'de tutulur | M | P0 |
| 11 | **Paywall A/B framework (Statsig veya kendi)** | Hangi fiyat tutuyor bilmiyoruz | 3 variant: weekly first vs annual first vs trial first | Conversion event tracked; 14 günde anlamlı sonuç | M | P1 |
| 12 | **Anthropic prompt caching + edge function geçişi** | API key client'ta = sızıntı riski | `dangerouslyAllowBrowser` kaldır; tüm Claude çağrıları edge | İstemcide ANTHROPIC_API_KEY yok; cache hit ratio >%60 | M | P0 |
| 13 | **Karne v2: Lineage donut + 3 katman** (Differentiator 3.1) | Tek arketip yüzeysel kalıyor | Birincil + ikincil + dormant blend | Render <800ms; paylaşılan kartta donut görünür | M | P0 |
| 14 | **Onboarding fotoğraf opsiyonel** | Fotoğrafımı yüklemek istemiyorum | Skip → default avatar (galaksi silüeti) | Skip rate ölçülür; karne foto olmadan da estetik | S | P1 |

---

## 5. Faz 2 (Ay 4-6) — Viral Loops & Social

### 5.1 Friend Sync / Compatibility ("Soul Match")

**The Pattern + Co-Star karşı atak.** Üç katmanlı eşleşme:
- **Astro Synastry:** klasik gezegen aspektleri, ev örtüşmeleri
- **HD Composite:** iki bodygraph'tan oluşan ortak harita (tanımlı/açık merkezler)
- **Galactic Lineage Resonance:** Differentiator 3.1'in ikinci kullanım alanı —
  iki kişinin lineage blend'i birbirini ne kadar besler

**Akış:**
1. Kullanıcı "Add a soul" → arkadaş linki paylaşılır (`/match/INVITE_CODE`)
2. Arkadaş kendi doğum verisini girer → ikisi de **Soul Match Card** alır
3. Kart 4 boyutta skor verir: Romantic / Friendship / Karmic / Creative
4. Premium feature: "Why?" detayı (her boyut için 3 paragraf Claude narrative)

**Kabul kriteri:** Davet kabul oranı >%40; oluşan match başına 1.8 yeni hesap.

### 5.2 UGC Mekanikleri

- **"Lineage of the Day" feed** — kullanıcılar opt-in ile lineage'larını
  anonim feed'e gönderir; her gün en yaratıcı paylaşımlar uygulamada öne çıkar.
- **Karne remix** — kullanıcı paylaştığı karneye AR filtre veya custom rengi
  ekleyebilir (Picsart-style mini editor).
- **Quote cards** — kullanıcının kendi narrative'inden seçtiği bir paragrafı
  9:16 stylized card olarak export.

### 5.3 Referral Program ("Cosmic Kin")

- 3 arkadaş davet → 1 ay Cosmic Weekly bedava
- 10 davet → ömür boyu %50 indirim + özel "Cosmic Ambassador" lineage rozeti
- Trackable: invite link Supabase `referrals` tablosunda; attribution 30 gün

### 5.4 K-factor 0.5+ Getirebilecek 3 Mekanik

1. **Soul Match çift davet** (5.1) — her match = 0.8 marjinal kullanıcı
2. **Yıldız Irkı Reveal Reels** — TikTok'ta "Don't tell me my lineage, guess
   it" challenge; uygulamadan otomatik 15sn reveal video export
3. **Mission Streak share-out** — 7/14/30 gün streak bozulduğunda VEYA milestone'da
   otomatik paylaşım önerisi (Strava-style)

---

## 6. Faz 3 (Ay 7-9) — Premium Depth

### 6.1 AI Soul Chat (Cosmic Mirror v2)

Differentiator 3.3'ün tam ürün versiyonu. Sesli + yazılı, sınırsız dialog,
**conversation memory** (kullanıcının son 90 günlük chat'leri Claude system
prompt'unda özet olarak). Premium Bundle dahili; ayrı SKU değil.

### 6.2 Voice Notes / Sesli Karne

Her karne üretildiğinde **otomatik 90 saniyelik sesli özet** üretilir.
Premium kullanıcı kendi sesini kaydedip "future self message" bırakabilir;
1 yıl sonra doğum gününde otomatik geri gelir.

### 6.3 Birth Time Rectification

Saatini bilmeyen kullanıcılar için. Premium feature ($14.99 tek seferlik):
- 7 hayat olayı (taşınma, ilişki, kayıp, atılım) tarihi alınır
- Claude + astronomy-engine ile 24 saatlik tarama yapılır, en yüksek
  eşleşme skoru veren saat önerilir
- Manuel onay → karne yeniden generate edilir

### 6.4 Synastry / Composite Haritalar (Premium SKU mevcut)

`PREMIUM_ROADMAP.md`'deki Relationship Sync genişletilir:
- Composite chart (iki haritanın ortası)
- Davison chart (ortak zaman/yer)
- HD Penta (3-5 kişilik grup dinamiği — Faz 4 hazırlığı)

### 6.5 Yıllık Döngü Dashboard

Solar Return SKU'sunun günlük UI'ı:
- 12 ay tema haritası (Q1: ilişki, Q2: kariyer vb. — Kişisel Yıl + Solar Return'den)
- Her ayın "büyük transit"i (Jupiter/Saturn/Uranus dış transitleri vurgulu)
- Aylık check-in: "Bu ay nasıl gitti?" — kullanıcı 1-5 oy verir, AI ayarlanır

---

## 7. Faz 4 (Ay 10-12) — Platform & Ecosystem

### 7.1 iOS Native App (Expo Workspace)

**Repo yapısı önerisi (monorepo dönüşüm):**

```
/
├── apps/
│   ├── web/              # Mevcut Next.js (root'tan taşınır)
│   └── mobile/           # Yeni Expo SDK 52+ workspace
├── packages/
│   ├── core/             # Mevcut lib/* (paylaşılan business logic)
│   ├── ui/               # Cross-platform component'ler (web + react-native)
│   └── astro-engine/     # astronomy-engine wrapper'ları
├── supabase/
├── docs/
└── marketing/
```

**Geçiş stratejisi:**
- Hafta 1-2: pnpm workspaces + Turborepo kurulum
- Hafta 3-4: `lib/` → `packages/core/` taşı; web import path'leri güncelle
- Hafta 5-8: Expo app shell — auth, birth form, karne render (react-native-svg)
- Hafta 9-10: Native paylaşım (`expo-sharing` + `react-native-view-shot`),
  push (`expo-notifications`)
- Hafta 11-12: App Store submission (TR + US ilk)

### 7.2 Apple Watch Komplikasyonu / Widget

- Komplikasyon: bugünkü Ay fazı + en güçlü transit ikon
- Watch app: Cosmic Weather + günlük mission tap'le complete
- iOS Home Screen Widget: 3 boyut (small: Ay fazı; medium: biyoritm grafiği;
  large: tam günlük kart)

### 7.3 Astrolog Marketplace ("Cosmic Counsel")

Sanctuary alternatifi. Önemli farklar:
- Astrologlar bizim üzerimizden kullanıcı karne PDF'ini görür (preconsult)
- 30dk session $39 (Sanctuary $59) — biz %25 alırız
- Astrolog onboarding: sertifika + 3 örnek reading + manual approval
- Hedef: 60 astrolog ay 10'da, 200 astrolog ay 12'de

### 7.4 API for Creators

Astrolog/HD analist/numerolog içerik üreticileri için:
- REST endpoint: doğum verisi → tam JSON (chart + HD + numeroloji + lineage)
- Webhook: takipçilerinin karnelerini Notion/Airtable'a stream
- Pricing: $49/ay 1000 chart, $199/ay 10K chart
- White-label: kendi domain'lerinden karne servis edebilirler (+%30 markup)

### 7.5 Multi-language Genişleme

Sıra: **es → pt-br → de → fr**. Her dil için:
- UI strings: AI ön çeviri + native reviewer (2 hafta)
- Karne narrative: Claude'a `locale=es` paramı (sonnet-4-6 ES kalitesi yüksek)
- Astrolojik terminoloji: yerel uzman editör (es: bir astrolog, de: bir HD analist)
- ASO metadata: dil başına 100 keyword araştırması

---

## 8. AI Stratejisi

### 8.1 Claude API Maliyet Modeli

**Mevcut tahmin (per user):**
- Free karne: 1 generation × ~4K input + 1.5K output token = ~$0.025
- Free user lifetime cost: $0.025 (tek seferlik)
- Premium Weekly: 4 × $0.025 = $0.10/ay
- Premium Bundle (chat dahil): ~50 turn/ay × $0.008 = $0.40/ay + $0.10 karne = $0.50/ay
- Premium Bundle revenue: $79/12 = $6.6/ay → **margin %92**

**Optimizasyonlar:**
- **Prompt caching:** Kullanıcının tüm doğum verisi + lineage system prompt'a
  konur, cache TTL 1 saat. Haftalık karne generation maliyeti %70 düşer.
- **Haiku 4.5 fallback:** Daily Cosmic Weather + push notification metni
  Haiku ile üretilir (free tier sürdürülebilir).
- **Sonnet 4.6:** Karne, Cosmic Mirror, premium narrative.
- **Batch API:** Soul Year Wrapped (Aralık) ve toplu push metinleri
  batch'le %50 indirim.

### 8.2 Prompt Engineering İyileştirmeleri

- **Structured output enforcement:** Tüm narrative üretimi `<sections>` XML
  şemasıyla; downstream parsing hata oranı %12 → <%1
- **Tone profilleri:** kullanıcı 3 ton seçer (mistik/pratik/şiirsel); prompt
  template otomatik adapte
- **Anti-hallucination guard:** Astrolojik claim'ler için "yalnızca verilen
  data'dan üret" instruction + post-generation regex check (gezegen-burç
  mismatch tespit edilirse regen)
- **Lineage tutarlılığı:** Kullanıcının lineage blend'i system prompt'ta
  pinli; tüm sonraki üretimler onunla tutarlı

### 8.3 Edge Function Geçişi (Faz 1, P0)

`supabase/functions/`:
- `generate-report/` — tüm karne tipleri (kind paramı)
- `cosmic-mirror/` — sesli soul chat
- `lineage-compute/` — lineage hesabı (cache + invalidation)
- `match-score/` — Soul Match
- `push-orchestrator/` — günlük cron, transit detect, push fan-out

Tüm istemci sadece Supabase JWT ile çağırır; Anthropic key sadece env'de.

### 8.4 Voice ve Image Gen Entegrasyonları

**Voice (Faz 3):**
- ElevenLabs Multilingual v2 ilk tercih (TR + EN + ES + PT desteği iyi)
- Alternatif: Hume EVI (empathic voice — spiritüel ton için ideal)
- 3 SoulProfile voice persona; kullanıcı seçer
- Maliyet hedefi: session başına <$0.08

**Image gen (Faz 4):**
- Karne arkaplan kişiselleştirme: Replicate üzerinden SDXL veya Flux
- Kullanıcının "soul portrait"i — yıldız ırkı + Yükselen burcu birleşimi
  ile abstract galaxy portrait (premium feature, $4.99 one-shot)
- Midjourney API resmi geldiğinde geçiş; şu an Flux Pro öneriliyor

### 8.5 Personalized Memory

`memory_entries` tablosu:
- Kullanıcının her karnesi, her Cosmic Mirror seansı, her mission completion
  özet olarak (max 200 token) kayıt
- Her yeni AI çağrısında son 10 entry system prompt'a inject
- Yıllık olarak Claude ile "compact" — eski entry'ler tek bir paragrafa indirgenir
- Privacy: kullanıcı `/data` sayfasından memory'sini görüp silebilir

---

## 9. Tasarım & Marka Stratejisi

### 9.1 Görsel Kazanma Noktaları

**Rakip pozisyonları:**
- Co-Star: brutalist beyaz/siyah, sans-serif, sarkastik — Gen Z'ye konuşur
- The Pattern: warm/yumuşak, kahve/krem — milenyal kadın
- Sanctuary: lüks koyu mor + altın — premium hissi
- Stellar: data-viz mavi/cyan — teknik kitle
- Chani: queer-friendly pastel, yumuşak — niş ama sadık

**SoulProfile'ın boş alanı:** "Cosmic awe + sıcak" — derin galaktik koyu zemin
(siyah değil, koyu indigo + deep violet gradients) + sıcak aurora vurguları
(coral, gold, soft cyan). **Brutalist değil**, **lüks değil**, **çocuksu değil**.
**"Gece gökyüzünde ev"** hissi.

### 9.2 3 Ekran Redesign Önceliği

1. **Welcome (`/`)** — Şu an statik. Hedef: full-bleed animated galaxy
   (Three.js veya Lottie), 3 saniyede tek bir CTA emergence. Hero text:
   "Sen sadece bir burç değilsin." Tek tap → birth.
2. **Karne (`/report`)** — Şu an tek görsel. Hedef: scroll-driven storytelling
   (her bölüm açıldıkça animate); paylaş butonu sticky bottom; "Cosmic Mirror"
   teaser sağ alt sticky.
3. **Paywall (`/premium`)** — Şu an statik teaser. Hedef: dynamic — kullanıcının
   lineage'ı ve eksik bölümleri merkezde ("Sen Pleiadyalı'sın — bu hafta
   Pleiades'ten 3 transit alıyorsun. Görmek için ↓"); 3 plan card; trial CTA üst.

### 9.3 Motion Design ve Haptik

- **Karne reveal:** her bölüm sequential fade + hafif particle (Lottie)
- **Mission complete:** confetti + iOS haptic medium impact
- **Streak milestone:** full-screen takeover + ses (kısa singing bowl)
- **Push tıklama → app open:** smooth deep link + matching ekranda glow pulse

### 9.4 5 Karne Görsel Template

1. **Instagram Story (9:16, 1080×1920):** Mevcut — lineage donut üstte, 3 ana
   bölüm orta, QR + URL altta
2. **Instagram Reel cover (9:16):** Video frame için statik — animasyonlu
   versiyon (3 saniye loop) hem cover hem in-feed
3. **Twitter/X card (1200×675):** Yatay — sol yarı kullanıcı fotoğrafı + lineage,
   sağ yarı 3 görev özeti
4. **LinkedIn post (1080×1080 square):** Daha "professional spiritual" — pastel
   palet, daha az emoji, "career mission" vurgulu (HD authority + Yaşam Yolu)
5. **Print/PDF (A4 portrait):** Premium feature — yüksek çözünürlüklü, fold-out
   poster formatında; doğum günü hediyesi olarak satılabilir

---

## 10. Monetization Derinleştirme

### 10.1 Dönüşüm Hunisi Optimizasyonu

Mevcut SKU'lar (PREMIUM_ROADMAP) sağlam. Ana sorun: paywall'a giden trafik
ve trial-to-paid conversion. Yapılacaklar:

- **Soft paywall (Faz 1):** Karne sonunda 3 "kilitli" kartın 1'i kısmen açık
  (3 cümlenin ilk cümlesi görünür). Kullanıcı tap'lerse → trial offer.
- **Triggered paywall:** Önemli transit (Jupiter house ingress vb.) gerçekleştiğinde
  push: "Jupiter bugün 7. evine geçti — ilişki haftan açıldı. Detaylı oku →"
- **Trial reminder triple:** Trial gün 5, 6, 7'de farklı mesaj (5: discovery,
  6: FOMO, 7: extension teklifi $1 ile 14 güne uzat)
- **Win-back:** Churn 7 gün sonrası %50 indirim email + push (3 ay sınırlı)

### 10.2 Gift / Send-a-Reading

**Sanctuary'de yok, Co-Star'da yok.** Tek tek satın al + bir başkasına
hediye et:
- "Bir arkadaşına 1 aylık Galactic Karne hediye et" $9.99
- Solar Return reading doğum günü hediyesi $19.99 (animated greeting card +
  açıldığında karne)
- Couple Bundle: 2 kişi Soul Match + 3 aylık Weekly $29.99

Akış: gönderen öder → alıcıya email/SMS link → alıcı doğum verisini girer →
karne unlock. **Yeni kullanıcı acquisition kanalı + monetization birleşik.**

### 10.3 Annual Upsell Mekanikleri

- Trial bitiş ekranında yıllık plan **ilk yıl %40 indirimli** ($79 → $47)
- 3 ay aktif weekly user'a "yıllık geç, 4 ay bedava" teklifi
- Doğum gününde özel offer: Premium Bundle $59 (lifetime fiyat-anchored)

### 10.4 LTV Hedefi

| Cohort | D30 | D90 | D365 | LTV hedef |
|---|---|---|---|---|
| Free user (US) | $0 | $0 | $0 | $0 (ama K-factor üretir) |
| Trial → Weekly | $2.99 | $8.97 | $35.88 | $42 |
| Trial → Monthly | $14.99 | $44.97 | $179.88 | $195 |
| Trial → Annual | $79 | $79 | $79 | $98 (renewal %62) |
| Gift sender | $9.99 | $9.99 | $19.98 | $24 (1.2 hediye/yıl) |
| **Blended ARPPU/ay** | — | — | — | **$8.20** |

Hesap mantığı: free → trial dönüşüm %12, trial → paid %48, paid 12 ay
renewal %62, churn ay başı %8.

### 10.5 Tier Geçişi Optimizasyonu

- Weekly → Monthly: "30 günde 4 kez weekly aldın — Monthly'e geç, %15
  tasarruf et" (otomatik in-app prompt)
- Monthly → Bundle: "Bu ay 12 chat + 4 karne ürettin — Bundle'da Cosmic
  Mirror ses dahil, $5 fazla, %200 değer"
- Bundle annual: Bundle aylık 6 ay olduktan sonra annual geçişe %30 indirim

---

## 11. Retention & Engagement Playbook

### 11.1 D1/D7/D30 Retention için 5 Özellik

1. **D1 — Onboarding completion reward:** Karne üretildikten sonra "Bunu
   yarın aç, sana özel bir mesaj olacak" (next-day push = D1 hook)
2. **D1-D7 — Daily Cosmic Weather:** Açtığında değişen anasayfa kartı
   (Faz 1 #4); push opsiyonel
3. **D7 — İlk Soul Mission complete:** 7 günlük ilk mission rozet + lineage
   evolution (lineage blend %1-2 hafif kayar — "you're becoming")
4. **D14 — Soul Match invite trigger:** "İlk haftanı tamamladın — bir arkadaşınla
   eşleş?" push + in-app modal
5. **D30 — Aylık karne refresh:** Free kullanıcıya bile "Bu ayki versiyon
   geldi — neyin değiştiğine bak" (regenerated narrative + Ay fazı kapağı)

### 11.2 Notification Stratejisi

**Topic-based segmentation:**
- `daily_weather` — opt-in, sabah 8:00 yerel saatte
- `lunar_cycle` — yeni ay + dolunay (29.5 günde 2)
- `personal_transit` — kullanıcının kişisel haritasında dış gezegen ingress (
  ayda ortalama 2-4)
- `mercury_retro` — 3 kez/yıl, başlangıç + bitiş
- `mission` — mission reminder + streak warning
- `match_activity` — arkadaş eşleşti / mesaj geldi
- `solar_return` — doğum gününde 7 gün öncesi
- `monthly_drop` — her ay başı yeni karne hazır

**Frekans:** kullanıcı başına ortalama haftada 3-4 push hedef; >5 = churn risk.

### 11.3 Haftalık Email: "Galactic Sunday"

Pazar 19:00 yerel:
- "Bu hafta gökyüzü" (3 ana transit)
- Kullanıcının lineage'ına özel mantra (lineage-spesifik 50 mantra kütüphanesi)
- Hafta sonu mission önerisi
- Bir kullanıcı story'si (UGC öne çıkarma)
- "Bu hafta Cosmic Mirror'da konuşulanlar" (premium teaser)

Açılış oranı hedef >%32; click >%8.

### 11.4 Cohort'a Göre Kişiselleştirme

| Cohort | Tetik | Özel akış |
|---|---|---|
| Yıldız ırkı: Pleiadyalı | Yumuşak, kalbe konuşan | Daily Weather'da kalp emoji ağırlığı; mantra "love-based" |
| Yıldız ırkı: Orion | Direkt, savaşçı | Kısa direktif mission; "mission" kelime sıklığı yüksek |
| HD Tipi: Projector | Davet bekleyen | "Bu hafta seni kim davet etmeli?" formatı |
| HD Tipi: Manifestor | Inisiyatif alan | "Bu hafta başlatacağın şey..." |
| Yaşam Yolu 11/22/33 | Master numara | "Master path" özel içerik kütüphanesi |
| Premium churn risk (3 gün açmamış) | Win-back | Lineage'a özel "we miss you" |
| Power user (D7 streak) | Ambassador | Referral CTA + bonus mission |

---

## 12. Risk Haritası

| # | Risk | Olasılık | Impact | Mitigation |
|---|---|---|---|---|
| 1 | **Apple App Store 5.1.1 / sensitive data reddi** — doğum verisi + foto kombinasyonu | Orta | Yüksek | Foto opsiyonel; onboarding'de ayrı consent screen; data minimization; pre-submission TestFlight review |
| 2 | **Apple Sign-in zorunluluğu (4.8)** — sosyal login varsa | Yüksek (kesin) | Düşük | Faz 4'te iOS submit öncesi Apple Sign-in eklenir; web'de opsiyonel |
| 3 | **In-app purchase zorunluluğu (3.1.1)** — Stripe web ödeme iOS'ta yasak | Yüksek | Yüksek | Mobile'da RevenueCat + Apple IAP zorunlu; web Stripe ayrı funnel |
| 4 | **Google Play "deceptive content" — astroloji/HD claim'leri** | Düşük | Orta | "Eğlence amaçlıdır" disclaimer her sayfa; tıbbi/finansal claim YASAK |
| 5 | **AI hallucination** — Claude yanlış burç/transit yazıyor | Orta | Yüksek | Structured output + post-gen astrological validator (gezegen-burç matrix check); kullanıcı flag butonu |
| 6 | **Sahte spiritüellik backlash** — TikTok/Reddit kritiği "starseed bilim değil" | Yüksek | Orta | Transparent disclaimer; "explore, don't believe" tone; bilimsel astronomi referansları (gerçek takımyıldız konumları); Chani-style açıklık |
| 7 | **Veri ihlali — doğum verisi + foto sızıntısı** | Düşük | Çok yüksek | Supabase RLS denetimi 3 ayda bir; HaveIBeenPwned monitor; SOC2 yol haritası Faz 4; foto encryption at-rest; pen-test Ay 9 |
| 8 | **Anthropic API outage / fiyat artışı** | Orta | Yüksek | Multi-provider fallback (OpenAI GPT-4o veya Mistral Large); cache TTL agresif; fallback static narrative templates |
| 9 | **The Pattern bizim lineage özelliğini kopyalar** | Orta | Orta | İlk pazara çıkış + brand association ("lineage = SoulProfile"); patent araştırması (US design patent friend matching görseli) |
| 10 | **Co-Star friend graph'a derin yatırım yapar** | Yüksek | Orta | Bizim differansiyel HD + lineage; pure social değil — "depth, not feed" pozisyonu |
| 11 | **Influencer reputation risk** — partner astrologu skandala karışır | Orta | Düşük | Sözleşme moral clause; kademe kademe spend; mid-tier dağıtım |
| 12 | **TR ekonomik volatilite — USD pricing dengeleyemez** | Yüksek | Düşük | TR pricing TL'de sabit + 3 ayda bir review; PPP adjusted Latam |
| 13 | **GDPR data subject request volume** | Düşük | Orta | `/data` sayfası self-serve; SLA 30 gün ama hedef 7 gün; automated export |
| 14 | **ElevenLabs/voice provider TOS — "deepfake" sınırlama** | Düşük | Orta | Kullanıcının kendi sesi ile training yapılmaz (sadece preset voice); compliance check Faz 3 başında |

---

## 13. Top 20 Feature Backlog (Önceliklendirilmiş)

| # | Feature | Özet | Faz | Effort | Impact | Bağımlılık |
|---|---|---|---|---|---|---|
| 1 | Supabase auth + cross-device sync | Email/Apple/Google login; profil sync | 1 | M | High | — |
| 2 | Edge function geçişi (Anthropic key güvenliği) | Tüm AI çağrıları Supabase functions üzerinden | 1 | M | High | Supabase setup |
| 3 | Lineage donut karne v2 | 3 katmanlı galaktik miras (Differentiator 3.1) | 1 | M | High | Galactic engine refactor |
| 4 | Daily Cosmic Weather kartı + push | Anasayfa günlük transit + Ay fazı | 1 | M | High | Push altyapı |
| 5 | Push notification altyapısı (OneSignal/Expo) | Topic-based segmentation | 1 | M | High | — |
| 6 | i18n TR + EN | next-intl + tüm UI + karne narrative dual | 1 | M | High | — |
| 7 | Karne history + favoriler | `/library` sayfası | 1 | S | Med | Auth |
| 8 | Account deletion + JSON export | GDPR self-serve | 1 | S | Med | Auth |
| 9 | Soul Mission tracker + streak | 144 mission, XP, badge (Differentiator 3.2) | 2 | L | High | Auth + push |
| 10 | Soul Match (friend sync 3 katmanlı) | Astro + HD + Lineage compatibility | 2 | L | High | Lineage v2 |
| 11 | Cosmic Mirror v1 (yazılı AI chat) | Claude + memory + dialog | 2 | L | High | Edge functions |
| 12 | Referral program (Cosmic Kin) | 3-invite reward, 10-invite ambassador | 2 | M | High | Auth |
| 13 | Soft paywall + triggered paywall | Karne sonu + transit-triggered | 2 | M | High | Paywall A/B |
| 14 | Cosmic Mirror v2 (sesli, TTS) | ElevenLabs + audio player (Diff 3.3 tam) | 3 | L | High | Mirror v1 |
| 15 | Birth Time Rectification | 7 olay tabanlı saat bulma | 3 | M | Med | Astro engine |
| 16 | Synastry/composite full UI | Premium SKU expansion | 3 | M | High | Match v1 |
| 17 | Yıllık Döngü Dashboard (Solar Return UI) | 12 ay tema haritası | 3 | M | Med | Premium SKU |
| 18 | iOS Expo app (monorepo dönüşüm) | apps/mobile workspace + native shell | 4 | L | High | Tüm Faz 1-3 |
| 19 | Astrolog Marketplace (Cosmic Counsel) | 30dk session $39, %25 komisyon | 4 | L | High | iOS app |
| 20 | Multi-language es + pt-br | Latam genişleme | 4 | M | High | i18n altyapı |

---

## 14. Hedef Metrikler — 12 Aylık North Star

### Genel Yıl Sonu Hedef

| Metrik | Hedef |
|---|---|
| MAU | 3.0M |
| Paid subscribers | 95K |
| ARPU (blended, $) | 1.20 |
| ARPPU (paid, $/ay) | 8.20 |
| D1 retention | 52% |
| D7 retention | 28% |
| D30 retention | 14% |
| K-factor | 0.55 |
| NPS | 58 |
| App Store ranking (US Lifestyle) | Top 50 |
| App Store ranking (TR Lifestyle) | Top 5 |
| CAC (blended) | $3.40 |
| LTV (paid) | $42 |
| LTV:CAC | 12.4 (yalnız paid); 3.6 (blended) |

### Faz Faz Hedefler

| Metrik | Faz 1 sonu (Ay 3) | Faz 2 sonu (Ay 6) | Faz 3 sonu (Ay 9) | Faz 4 sonu (Ay 12) |
|---|---|---|---|---|
| MAU | 80K | 450K | 1.4M | 3.0M |
| Paid subscribers | 1.2K | 12K | 42K | 95K |
| D7 retention | 18% | 23% | 26% | 28% |
| D30 retention | 8% | 11% | 13% | 14% |
| K-factor | 0.15 | 0.38 | 0.48 | 0.55 |
| ARPU ($) | 0.30 | 0.65 | 0.95 | 1.20 |
| App Store TR rank | Top 50 | Top 20 | Top 10 | Top 5 |
| App Store US rank | yok (web only) | yok | Top 200 (iOS launch) | Top 50 |
| Avg session length | 2:10 | 3:40 | 5:20 | 6:30 |
| Sessions per WAU | 3.2 | 4.8 | 6.1 | 7.4 |
| Karne paylaşım oranı | 28% | 42% | 48% | 52% |

---

## 15. Yapmayacağımız 5 Şey (Anti-Features)

1. **Kuru/sarkastik/komik ton (Co-Star modeli).** Co-Star "your Venus in
   Cancer means you'll cry at a Honda commercial" tonuyla viral oldu. Biz
   tam tersi pozisyondayız: **derin, sıcak, ciddi ama umutlu**. Komedi
   pazarına girersek hem brand tutarsızlığı hem de Co-Star ile direkt
   rekabette ezilme riski. Bir tek istisna: lineage karneleri için "fun
   facts" mikro-format — ama bu da merak/sevgi tonu, ironi değil.

2. **Canlı psişik/medyum chat (Nebula modeli).** Nebula bu kategoride
   $30/dk freelance medyum işletiyor. Bu hem etik gri alan (claim'ler
   doğrulanamaz), hem operasyonel ağır (medyum vetting, refund'lar,
   şikayetler), hem brand'imizi düşürür (data-driven spiritual identity
   pozisyonundan kayma). Cosmic Counsel (astrolog marketplace, Faz 4)
   farklı — gerçek sertifikalı astrologlar, "reading" yapıyorlar,
   "psişik mesaj" değil.

3. **Tarot kartı satışı / fiziksel ürün.** "Cosmic kit" kristal/saat/kart/
   parfüm satmak organik bir merchandising baskısı yaratacak, ama bu hem
   stok/lojistik/iade işi (ekibimize uygun değil), hem premium subscription
   ARPU'sundan dikkat dağıtır, hem de "wellness mall" tuzağına düşer
   (Goop sonrası bu pozisyon karbonlaştı). İstisna: print-on-demand birth
   chart poster Faz 4'te white-label partner ile test edilebilir.

4. **Social feed / DM / takip sistemi (Instagram-vari içeride).** Co-Star
   "friend graph"a yatırım yaptı ama içerikli feed'e gitmedi — doğru karar.
   Biz de sosyal mekaniği **dış platformlara** (Instagram, TikTok) iteceğiz.
   İçeride DM, feed, beğeni olmayacak. Sadece Soul Match karşılıklı görüşme
   (private 1:1). Sebep: içerik moderation devasa ağırlık, ana ürünü
   bozar, ve **Co-Star'ın 2 yıl içinde fail edeceği yer burası**.

5. **Tek-seferlik yıkıcı discount kampanyaları ($1.99 lifetime vb.).**
   Bazı spiritual app'ler büyüme tetiklemek için lifetime deal yapıyor
   (AppSumo vb.). Bu LTV'yi öldürür, brand'i ucuzlatır, ve renewal-based
   sustainable business kurmamızı engeller. Win-back %50 indirim ve
   referral ödülleri OK; ama "ömür boyu $9.99" YASAK. Bunun yerine 7
   günlük free trial + ilk yıl %40 indirimli annual ile growth tetikleriz.

---

## Uygulama Notları

- Bu doküman ürün stratejisinin canlı belgesidir; çeyrekte bir review,
  her milestone sonrası KPI tablosu update edilir.
- Her feature backlog satırı doğrudan Linear/Jira ticket'a dönüşmeli;
  acceptance criteria + effort kabaca buradan başlanır, refinement
  sprint planning'de.
- Pazarlama/influencer/ASO için `marketing/` referansı; finansal
  modelleme için ayrı bir `docs/FINANCIAL_MODEL.md` Faz 1'de yazılmalı.
- Branş: tüm değişiklikler `claude/cosmic-birth-chart-app-DW89I` üzerinden.
