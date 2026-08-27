# Multi-System Cosmic Identity — Ürün & Teknik Spec

> **Tagline:** "Doğduğunda yıldızlar sana ne söylüyordu?"
> **Internal name:** `multi-system-identity` (MSI)
> **Sahip:** Product + Engineering
> **Hedef sürüm:** v0.4 (MVP+) — sonraki iki sprint

---

## 1. Ürün Vizyonu

Astroloji uygulamalarının %95'i tek sistem üzerinden (genellikle batı tropikal) yorum yapıyor; geri kalanı Vedik **veya** Çin **veya** Maya — ama hiçbiri kullanıcıya **kim olduğunu 20 farklı kültürün penceresinden aynı anda** göstermiyor. SoulProfile'ın kazanma tezi tam burada: doğum verisi (tarih + saat + yer) bir kez alındıktan sonra, kullanıcı **tek bir "Kozmik Kimlik" kartı** görüyor — bu kart 20 sistemin kesişiminden damıtılmış 5 satırlık bir "Soul Signature", 1 görsel sembol, 1 mantra ve 1 sayı. Aşağı kaydırınca her sistem ayrı bölüm olarak açılıyor. Bu yaklaşım üç şey yapar: (1) **viralite** — her sistem ayrı bir TikTok hook'u ("Hangi Maya Kin'isin?" tek başına 100M+ view potansiyeli olan bir format), (2) **derinlik algısı** — kullanıcı "bu uygulama beni gerçekten görüyor" hissi yaşıyor çünkü 20 farklı kültür aynı sonuca işaret ediyor, (3) **premium opsiyonelliği** — 20 sistemin 8'i ücretsiz, 12'si premium teaser ile kilitli; kullanıcı kendi içinden hangisinin merakını uyandırdığını seçiyor. Rakipler (Co-Star, The Pattern, Sanctuary) tek sistemde kilitli; bizim moat'umuz **sentez algoritması** + **çok kültürlü kapsayıcılık** (Hindistan, Çin, LATAM, Kuzey Avrupa pazarlarında lokal-relevant).

---

## 2. 20 Sistem — Tek Tek

> **Gösterim formatı her sistem için:** TR + EN ad → çıktı → karneye katkı (Cetin örneği) → karmaşıklık + kaynak → faz.
> **Cetin örnek doğum verisi (varsayım):** 12 Mart 1990, 14:30, İstanbul (41.0082°N, 28.9784°E).

### 2.1 Batı Astrolojisi — Western Tropical Astrology
- **Çıktı:** Sun, Moon, ASC, MC + 10 gezegen + 12 ev konumu + aspekt grid.
- **Karneye katkı:** "Cetin → Sun Pisces 21°, Moon Capricorn 8°, Ascendant Leo 14°."
- **Karmaşıklık:** Orta. **Kaynak:** `astronomy-engine` (saf JS) — VAR.
- **Faz:** 1 (mevcut).

### 2.2 Vedik / Jyotish — Vedic Astrology
- **Çıktı:** Sidereal Sun/Moon (Lahiri ayanamsa ~24°), Nakshatra + Pada, Rashi (Moon sign), Dasha cycle (Vimshottari).
- **Karneye katkı:** "Vedik Ay nakshatrası: **Pushya** — beslenen koruyucu. Dasha: Shukra (Venüs) periyodu 2031'e kadar."
- **Karmaşıklık:** Orta. **Kaynak:** `astronomy-engine` + Lahiri ayanamsa offset (sabit formül) + nakshatra lookup (27 segment × 13°20').
- **Faz:** 1 (MVP+).

### 2.3 Çin Astrolojisi — Chinese Astrology / Bazi
- **Çıktı:** Year/Month/Day/Hour pillars (4 pillar = 8 character), zodiac animal (12), element (5), Kua number (Feng Shui).
- **Karneye katkı:** "**Metal At** — yıl piları Geng Wu, gün piları Yang Toprak. Kua: 7."
- **Karmaşıklık:** Orta. **Kaynak:** Çin lunisolar takvim dönüşümü (saf JS — `chinese-lunar-calendar` paketi veya kendi tablo) + 60-year sexagenary cycle lookup.
- **Faz:** 1 (MVP+).

### 2.4 Maya / Tzolkin — Mayan Tzolkin Calendar
- **Çıktı:** Day Sign (20), Galactic Tone (13), Kin Number (1-260), Wavespell, Color (Red/White/Blue/Yellow).
- **Karneye katkı:** "**Kin 89: Red Magnetic Moon** — akışı başlatan arındırıcı."
- **Karmaşıklık:** Basit. **Kaynak:** Sabit hesap (Gregoryen → JDN → mod 260) — saf JS lookup table.
- **Faz:** 1 (MVP+, viral hook olarak en yüksek ROI).

### 2.5 Kelt Ağaç Astrolojisi — Celtic Tree Astrology
- **Çıktı:** 13 ay-ağacı burcu (Birch, Rowan, Ash, Alder, Willow, Hawthorn, Oak, Holly, Hazel, Vine, Ivy, Reed, Elder), Ogham harfi.
- **Karneye katkı:** "**Willow (Saille)** — sezgisel rüya gören, ay yansıtıcısı."
- **Karmaşıklık:** Basit. **Kaynak:** Manual lookup table (tarih aralığı → ağaç).
- **Faz:** 2.

### 2.6 Native American Earth/Medicine Wheel
- **Çıktı:** Birth totem hayvanı (12), Clan (Turtle/Frog/Thunderbird/Butterfly), Element, Plant, Mineral, Direction.
- **Karneye katkı:** "**Wolf** totem, Thunderbird klanı, Doğu yönü."
- **Karmaşıklık:** Basit. **Kaynak:** Manual lookup table (doğum ayına göre).
- **Faz:** 2. **Etik not:** Kapsayıcı yazım, "First Nations'a saygı" disclaimer'ı zorunlu.

### 2.7 Mısır Decan Astrolojisi — Egyptian Decan / Sothic
- **Çıktı:** 36 decan'dan biri (her 10°'lik zodyak dilimi), bağlı Neter (tanrı/ruh), Sothic mevsim (Akhet/Peret/Shemu).
- **Karneye katkı:** "**Decan 33: Sopdu** — sınır bekçisi, Shemu mevsimi."
- **Karmaşıklık:** Orta. **Kaynak:** Sun longitude'dan 10°'lik dilim hesabı (astronomy-engine) + decan lookup.
- **Faz:** 2.

### 2.8 Norse Rune — Norse Birth Rune
- **Çıktı:** Elder Futhark 24 runundan biri (15 günlük dilimler), runun anlamı + element + tanrı bağlantısı.
- **Karneye katkı:** "**Ehwaz ᛖ** — at, hareket, ortaklık. Frey/Freya ile bağlı."
- **Karmaşıklık:** Basit. **Kaynak:** Lookup table (tarih → run).
- **Faz:** 1 (viral hook).

### 2.9 Tarot Birth Card — Tarot Life & Personality Card
- **Çıktı:** Life Card + Personality Card (Major Arcana 1-22), tarih basamak toplamı algoritması.
- **Karneye katkı:** "Personality: **The Hanged Man (12)** / Life: **The Empress (3)**."
- **Karmaşıklık:** Basit. **Kaynak:** Saf JS (basamak toplamı + reduction).
- **Faz:** 1 (viral hook).

### 2.10 Tibet Mewa & Parkha — Tibetan Astrology
- **Çıktı:** 9 Mewa (1-9, element + renk), 8 Parkha (trigram, I-Ching benzeri).
- **Karneye katkı:** "**Mewa: 4 Yeşil** (ağaç, büyüme) / **Parkha: Khen** (gök, baba enerjisi)."
- **Karmaşıklık:** Orta. **Kaynak:** Sabit formül (yıl + cinsiyet bazlı) — manual lookup.
- **Faz:** 3 (niş ama derinlik sinyali).

### 2.11 Numeroloji — Numerology (Pythagorean + Chaldean)
- **Çıktı:** Life Path, Expression, Soul Urge, Personality, Birthday, Maturity, Pinnacles. **Master sayılar (11/22/33)** korunur. Chaldean alternatif sistem.
- **Karneye katkı:** "Life Path **7** (Pythagorean), Soul Urge **11**. Chaldean Name **5**."
- **Karmaşıklık:** Basit. **Kaynak:** Saf JS (VAR — Pythagorean). Chaldean için ek harf→sayı tablosu.
- **Faz:** 1 (mevcut, genişlet).

### 2.12 Human Design
- **Çıktı:** Type (Manifestor/Generator/Manifesting Generator/Projector/Reflector), Authority, Profile, Strategy, Definition, Centers, Channels, Gates, Variables (PHS/Determination/Cognition/Environment/Motivation/Perspective), Incarnation Cross.
- **Karneye katkı:** "**Manifesting Generator 3/5**, Sacral Authority, Right-Active Environment, Possibility motivation."
- **Karmaşıklık:** Zor. **Kaynak:** Swiss Ephemeris gerekli (88° sun arc öncesi design date) → Supabase Edge Function (Deno) + `swisseph` wasm.
- **Faz:** 1 (mevcut), Variables = Faz 2.

### 2.13 Gene Keys
- **Çıktı:** Activation Sequence (Life's Work / Evolution / Radiance / Purpose), Venus Sequence, Pearl Sequence — toplam 11 gen anahtarı (64 codon ring).
- **Karneye katkı:** "Life's Work: **Gene Key 25 — Innocence/Universal Love**, Line 4."
- **Karmaşıklık:** Zor (HD verisi üzerine kurulu). **Kaynak:** HD gates → Gene Keys mapping table (1-64 aynı).
- **Faz:** 3 (premium).

### 2.14 Astrokartografi — Astrocartography
- **Çıktı:** Dünya haritası üzerinde 10 gezegenin MC/IC/ASC/DSC hatları → "hangi şehirde hangi gezegen aktif".
- **Karneye katkı:** "**Bali → Venüs MC hattı** (aşk/sanat). **Berlin → Satürn ASC** (disiplin sınavları)."
- **Karmaşıklık:** Zor. **Kaynak:** Swiss Ephemeris + harita rendering (Leaflet/Mapbox). Edge Function.
- **Faz:** 3 (premium showpiece).

### 2.15 Yıldız Irkı / Starseed Origin
- **Çıktı:** Dominant starseed (Pleiadian/Sirian/Arcturian/Andromedan/Lyran/Orion vb.) — Sun + Moon + ASC kombinasyonu + sabit yıldız konjüksiyonu (Pleiades, Sirius, Arcturus).
- **Karneye katkı:** "**Pleiadian** dominant, Sirian sekonder."
- **Karmaşıklık:** Orta. **Kaynak:** astronomy-engine fixed star longitudes + algoritma — VAR.
- **Faz:** 1 (mevcut).

### 2.16 Çakra Tanı — Chakra Diagnosis from Birth
- **Çıktı:** 7 çakranın dominant + zayıf olanı; gezegen→çakra mapping (Sun→Solar Plexus, Moon→Sacral, Mars→Root, vb.) + ev konumu ağırlığı.
- **Karneye katkı:** "Dominant: **Üçüncü Göz (Ajna)**. Zayıf: **Kök (Muladhara)** — topraklama egzersizi öner."
- **Karmaşıklık:** Orta. **Kaynak:** Western chart üzerinden custom algoritma (saf JS).
- **Faz:** 2.

### 2.17 Hint Vargas — Divisional Charts (D9 Navamsa, D10 Dashamsa)
- **Çıktı:** Navamsa (evlilik/dharma), Dashamsa (kariyer), Saptamsa (çocuklar), Dwadasamsa (ata) — toplam 6+ divisional chart.
- **Karneye katkı:** "**D9 Navamsa Ay: Mithuna (İkizler)** — eşin iletişimci."
- **Karmaşıklık:** Zor. **Kaynak:** Vedic Rashi + matematik bölme — Edge Function (Swiss Ephemeris ile).
- **Faz:** 3 (deep premium).

### 2.18 Birth Star — Your Star (popüler western Nakshatra eşdeğeri)
- **Çıktı:** 27 nakshatra'dan biri ama "Western branding": isim, sembol, animal, deva, guna. (2.2 ile aynı veri, farklı sunum — popüler kitle için.)
- **Karneye katkı:** "Your Birth Star: **Pushya — The Nourisher**."
- **Karmaşıklık:** Basit (2.2 verisini yeniden sunum).
- **Faz:** 1.

### 2.19 Element / Tattva Profili — Five Element Balance
- **Çıktı:** 5 element (Fire/Earth/Air/Water/Ether) yüzdelik dağılımı — Western'da 4 element + Vedik'te 5. Gezegen + ev + nakshatra ağırlıklarıyla.
- **Karneye katkı:** "**Su %38, Toprak %27, Ateş %20, Hava %10, Eter %5** — duygusal/sabit kombinasyon."
- **Karmaşıklık:** Orta. **Kaynak:** Saf JS algoritma (gezegen → element ağırlık matrisi).
- **Faz:** 2.

### 2.20 Soul Mirror Tarot Spread
- **Çıktı:** 9 kart kişiselleştirilmiş açılım: Kök / Gölge / Hediye / Yol / Engel / Müttefik / Gizli güç / Çağrı / Sonuç. Doğum verisinden seed'lenmiş deterministik shuffle.
- **Karneye katkı:** "**Soul Mirror açılımı:** Kök = The Star, Gölge = 5 of Swords, Hediye = The Empress..."
- **Karmaşıklık:** Orta. **Kaynak:** Seeded RNG (doğum tarihi hash) + 78-kart deck JSON + Claude yorum.
- **Faz:** 2 (premium).

---

## 3. "Kozmik Kimlik" Sentez Algoritması

Hedef: 20+ veri noktasını **tek bir kart**a indirgemek. Algoritma katmanları:

### 3.1 Ana Arketip Seçimi (`primaryArchetype`)
Girdi vektörü:
```
[Starseed dominant, Western Sun sign, Vedic Moon Nakshatra, Tarot Life Card, Chinese animal+element]
```
Çıktı: 144 önceden yazılmış arketip pool'undan biri (12 × 12 grid: 12 spiritüel mod × 12 batı burcu).
**Örnek:** Pleiadian + Pisces Sun + Pushya + Empress + Metal Horse → **"Şifacı Vizyoner"** (The Healing Visionary).

Pseudocode:
```ts
function pickArchetype(profile: MultiSystemProfile): Archetype {
  const axis1 = profile.starseed.dominant;          // 8 olasılık
  const axis2 = profile.western.sun.sign;           // 12 olasılık
  const tieBreaker = profile.tarot.lifeCard.number; // 22 olasılık
  return ARCHETYPE_MATRIX[axis1][axis2][tieBreaker % 3];
}
```

### 3.2 Soul Signature (5 satır)
Claude API ile üretim. Sistem prompt'u:
> "Aşağıdaki 20 sistem verisinden 5 satırlık ikinci tekil şahıs bir 'soul signature' yaz. Her satır farklı bir sistemden esinlensin. Şiirsel ama somut, klişeden kaç."

Cache: kullanıcı başına 1 kez üret, Supabase `profiles.soul_signature` kolonuna yaz.

### 3.3 Görsel Sembol (`sigilGlyph`)
3 katmanlı SVG kompozit:
- **Outer ring:** Tzolkin glyph (20 day sign'dan biri)
- **Middle ring:** Norse rune (24'ten biri)
- **Center:** Western zodiac glyph + tarot suit suffix
Renkler 3.5'ten gelir. SVG runtime'da `<svg>` ile composed.

### 3.4 Renk Paleti (`palette`)
```
primary   = Vedic dominant tattva → renk (Fire=#FF6B35, Water=#3B82F6, ...)
secondary = Dominant çakra → renk (Ajna=#6366F1, ...)
accent    = Chinese element → metallic (Metal=#C0C0C0, Wood=#16A34A, ...)
```
Tailwind config'e `theme.extend.colors.identity.{primary,secondary,accent}` runtime CSS var olarak inject.

### 3.5 Soul Number
```
soulNumber = reduce(
  pythagoreanLifePath +
  chaldeanNameNumber +
  chineseKuaNumber +
  tibetanMewa
) // sonuç 1-9 + master 11/22/33 korunur
```
**Örnek:** 7 + 5 + 7 + 4 = 23 → 2+3 = **5**.

### 3.6 Birth Mantra (otomatik)
Şablon havuzu (her arketip için 5 varyant) × dominant element × çakra → Claude'a tek-cümle mantra ürettir. Türkçe + Sanskrit transliterasyon.
**Örnek:** *"Ben akan suyum, yıldız tohumum, Pushya'nın koruyucu nefesiyim. Om Hreem Shreem."*

### 3.7 Soul Animal
Çakışma çözümü:
- Aday 1: Çin zodyak (Horse)
- Aday 2: Native American totem (Wolf)
- Aday 3: Celtic ağaç ile bağlı hayvan (Willow → Hare)

Seçim: Western Sun element ile en uyumlu olan (Fire→Horse, Water→Hare, Earth→Wolf...). Tek bir hayvan seçilir + diğer ikisi "spirit companions" olarak yan kartta.

### 3.8 Sentez Veri Modeli
```ts
type CosmicIdentity = {
  archetype: { code: string; nameTR: string; nameEN: string; tagline: string };
  soulSignature: string[5];           // 5 satır
  sigilGlyph: { svg: string; layers: 3 };
  palette: { primary: string; secondary: string; accent: string };
  soulNumber: number;
  birthMantra: { tr: string; sanskrit: string };
  soulAnimal: { primary: string; companions: string[2] };
  systems: Record<SystemKey, SystemResult>; // 20 sistemin ham çıktısı
};
```

---

## 4. Karne Layout v2 — ASCII Mock (1080×1920, 9:16)

```
┌──────────────────────────────────────────┐  ← 1080px geniş
│  SOULPROFILE                       v0.4  │  60px header
├──────────────────────────────────────────┤
│                                          │
│         ✦ ◯ ✦                           │  220px hero sigil
│       [ SIGIL GLYPH ]                    │     (3-layer SVG)
│         ✦ ◯ ✦                           │
│                                          │
│      ŞİFACI VİZYONER                     │  archetype title
│      The Healing Visionary               │
│                                          │
├──────────────────────────────────────────┤
│  SOUL SIGNATURE                          │  280px
│  ─────────────────                       │
│  Sen Pisces güneşinin altında doğdun,    │
│  Pushya ay yıldızının beslediği bir      │
│  Metal At'sın. Kin 89 dalgasında akan    │
│  Pleiadian tohumu — Empress'in sessiz    │
│  bilgeliğini taşıyan bir Willow ağacı.   │
├──────────────────────────────────────────┤
│  SOUL NUMBER    SOUL ANIMAL    MANTRA    │  180px 3-col strip
│       5            Wolf       "Om Hreem" │
│   (master: -)   +Horse,Hare    Shreem    │
├──────────────────────────────────────────┤
│  PALETTE  ▓▓▓▓▓ ▒▒▒▒▒ ░░░░░             │  60px
├──────────────────────────────────────────┤
│  20 SISTEM ÖZETİ (mini grid 4×5)         │  600px
│                                          │
│  ☉ Pisces 21°      ☾ Pushya              │
│  🐴 Metal Horse    ✦ Kin 89              │
│  🌳 Willow         🦅 Wolf totem          │
│  𓂀 Decan 33       ᛖ Ehwaz               │
│  ⛧ Hanged Man      🕉 Mewa 4              │
│  ⓻ Life Path 7    MG 3/5 Sacral         │
│  GK 25.4          🌍 Bali=♀ MC           │
│  ★ Pleiadian      💜 Ajna dom.            │
│  D9 Mithuna ☾     ⭐ Pushya              │
│  💧38 🌍27 🔥20    🃏 Star/5Sw/Empress    │
├──────────────────────────────────────────┤
│  soulprofile.app/u/cetin-x7k             │  60px footer
│  "Eğlence amaçlıdır."                    │
└──────────────────────────────────────────┘
```

**Notlar:**
- Hero sigil ortalanmış, parallax CSS efekti web'de.
- 20-sistem grid'i tıklanabilir → her hücre detay accordion'a scroll.
- PNG export 1080×1920, web view responsive (scale-down).
- Footer URL **mutlaka** karnede; viral geri akış.

---

## 5. Hesaplama Mimarisi

| Sistem | Yer | Stack | Maliyet/user |
|---|---|---|---|
| Batı tropikal | Browser | astronomy-engine | $0 |
| Vedik nakshatra/dasha | Browser | astronomy-engine + Lahiri offset | $0 |
| Çin Bazi | Browser | lunar JS lib + lookup | $0 |
| Maya Tzolkin | Browser | JDN mod 260 | $0 |
| Kelt ağaç | Browser | date lookup | $0 |
| Native totem | Browser | date lookup | $0 |
| Mısır decan | Browser | astronomy-engine + lookup | $0 |
| Norse rune | Browser | date lookup | $0 |
| Tarot birth card | Browser | digit reduction | $0 |
| Tibet Mewa/Parkha | Browser | formula + lookup | $0 |
| Numeroloji (Pyth+Chald) | Browser | letter table | $0 |
| **Human Design** | **Edge Function** | swisseph wasm | ~50ms CPU |
| **Gene Keys** | **Edge Function** | HD output mapping | ~10ms CPU |
| **Astrokartografi** | **Edge Function** | swisseph + geodesy | ~200ms CPU |
| Starseed | Browser | astronomy-engine fixed stars | $0 |
| Çakra tanı | Browser | custom algoritma | $0 |
| **Vedik Vargas (D9/D10)** | **Edge Function** | swisseph + division math | ~80ms CPU |
| Birth Star | Browser | nakshatra alias | $0 |
| Element/Tattva | Browser | weighted sum | $0 |
| Soul Mirror Tarot | Browser (deck) + Claude (yorum) | seeded RNG + Claude | ~2K token |
| **Soul Signature** | **Claude API** | sonnet-4-6 | ~1.5K input + 500 output |
| **Birth Mantra** | **Claude API** | sonnet-4-6 | ~800 input + 150 output |

### 5.1 Maliyet Tahmini (kullanıcı başına, ilk üretim)
- Edge Function CPU: ~340ms toplam → Supabase Edge ~$0.0003
- Claude tokens: ~5K input + 1K output → sonnet-4-6 ≈ **$0.03**
- **Toplam ilk üretim:** ~$0.03/user
- Cache stratejisi: tüm sentez `profiles.cosmic_identity` JSON kolonuna yazılır, sadece kullanıcı doğum verisini değiştirirse regen.
- **Free tier ekonomisi:** 10K aktif user/ay × $0.03 = $300/ay Claude. Sürdürülebilir.

### 5.2 Klasör Yapısı (yeni)
```
lib/
  systems/
    western/       (var → astrology/'den taşı)
    vedic/         (yeni)
    chinese/       (yeni)
    mayan/         (yeni)
    celtic/        (yeni)
    native/        (yeni)
    egyptian/      (yeni)
    norse/         (yeni)
    tarot/         (yeni)
    tibetan/       (yeni)
    numerology/    (var → genişlet)
    humanDesign/   (var → genişlet)
    geneKeys/      (yeni)
    astrocarto/    (yeni)
    starseed/      (var)
    chakra/        (yeni)
    vargas/        (yeni)
    elements/      (yeni)
    soulMirror/    (yeni)
  identity/
    synthesize.ts        # 3. bölüm algoritması
    archetypeMatrix.ts   # 144 arketip pool
    sigilCompose.ts      # 3-layer SVG
    palette.ts
    soulNumber.ts
    mantra.ts
  edge/
    humanDesign.ts       # supabase edge function
    astrocarto.ts
    vargas.ts
```

---

## 6. Onboarding Akışı (Revised)

1. **Welcome → Birth form** (mevcut; tarih + saat opsiyonel + yer otomatik geocoding).
2. **Loading state — 8 saniye sahnesi:**
   ```
   [00.0s] "Batı yıldız haritası çiziliyor..."     ☉
   [00.4s] "Vedik nakshatra hesaplanıyor..."        ☾
   [00.8s] "Çin pillar'ları kuruluyor..."           🐴
   [01.2s] "Maya Tzolkin dalgası açılıyor..."       ✦
   ... (her sistem 400ms)
   [08.0s] "Kozmik kimliğin sentezleniyor..."       ◯
   ```
   Her sistem için mini ikon + Türkçe satır, sıralı fade in/out. Lottie veya saf CSS.
3. **Reveal — Cosmic Identity Card** (tam ekran, hero sigil animasyonlu açılır).
4. **Scroll down:**
   - **Soul Signature** bölümü (5 satır + "paylaş" butonu)
   - **20-sistem accordion** (free: 8 açık, premium: 12 kilitli teaser)
   - **Premium gate kartları** (Vedic Vargas, Gene Keys, Astrokartografi, Soul Mirror, D10 Career chart)
5. **CTA:**
   - "Karnemi indir" (PNG, 1080×1920)
   - "Soul Mirror oku" (premium)
   - "Hediye kart" (başka biri için aynı hesap)

### 6.1 Accordion Davranışı
- Default: ilk 3 sistem açık (Western, Vedic, Maya).
- Premium kilit ikonu (🔒) + "Premium'da aç" CTA.
- Her bölüm aşağı "share this section" butonu (sistem bazlı viral hook).

---

## 7. MVP+ Önceliği — Sonraki 2 Hafta

Mevcut Galaktik Karne'ye eklenecek **5 sistem**, en yüksek ROI:

| # | Sistem | Effort | Marka Etkisi |
|---|---|---|---|
| 1 | **Maya Tzolkin** | 1 gün | "Kin 89" tek başına TikTok'ta milyonluk format. Sıfır maliyet, sıfır risk, viral. |
| 2 | **Vedik Nakshatra + Moon Rashi** | 2 gün | TR'de yok ama Hindistan + diaspora (UK/US/CA) **büyük pazar**. SEO: "your nakshatra" ayda 50K arama. |
| 3 | **Chinese Zodiac + Element (basic Bazi)** | 1 gün | LATAM + East Asia + her yıl Yeni Yıl döneminde organik trafik patlaması. |
| 4 | **Norse Birth Rune** | 0.5 gün | Vikings/Norse content trend (Gen Z), "ᛖ Ehwaz" reveal'ı estetik. |
| 5 | **Tarot Birth Card (Life + Personality)** | 1 gün | Tarot zaten 8B$ pazar; "The Empress + Hanged Man" reveal sticky. |

**Toplam effort:** ~5.5 gün dev + 2 gün QA/copy + 1 gün marketing assets = **9 gün** → 2-haftalık sprint'e sığar.

**Karne layout etkisi:** Mevcut karneye **"Çok-Kültürlü Kimlik" satırı** eklenir (5 satır × ikon + değer). Sentez algoritması (bölüm 3) faz 2'de gelir; faz 1'de sadece **listeleme**.

---

## 8. Premium Gating

| Sistem | Free | Premium |
|---|---|---|
| Western Astrology | Sun+Moon+ASC | Tam grid + aspects + transits |
| Vedic | Nakshatra + Moon Rashi | Dasha cycle + Vargas |
| Chinese | Animal + Element | Tam Bazi 4 pillar + Kua |
| Mayan Tzolkin | Kin + Day Sign + Tone | Wavespell + Year Bearer |
| Celtic Tree | Ağaç | Ogham + tam mythology |
| Native Totem | Hayvan + Clan | Plant + Mineral + ceremony |
| Egyptian Decan | Decan + Neter | Sothic yıl pozisyonu + 36'lık takvim |
| Norse Rune | Birth rune | 3-rune spread + Norn yorumu |
| Tarot Birth Card | Life + Personality | + Year card + Shadow card |
| Tibetan Mewa/Parkha | — | Tüm sistem |
| Numerology | Pythagorean Life Path | + Chaldean + Pinnacles + Cycles |
| Human Design | Type + Strategy + Authority | + Variables + Profile lines + Incarnation Cross |
| Gene Keys | — | Activation Sequence (4 anahtar) |
| Astrocartography | — | Tam dünya haritası |
| Starseed | Dominant | + Secondary + activation date |
| Chakra | Dominant + zayıf | 7 çakra tam analiz + practice |
| Vedic Vargas | — | D9 + D10 |
| Birth Star | Açık | (Nakshatra ile aynı) |
| Element/Tattva | Yüzde | + denge önerileri |
| Soul Mirror Tarot | — | 9-kart açılım + Claude yorum |
| **Cosmic Identity sentezi** | Arketip + Sigil + Mantra | + Soul Signature + Soul Number + tam paylaşım kartı |

**Free karne** = 8 sistem listesi + sentez başlığı + indirilebilir mini PNG.
**Premium karne** = 20 sistem tam + sentez full + tam PNG + paylaşım varyantları + 1 yıl boyunca transit notifications.

---

## 9. Karne Paylaşım Hooks — 20 Reel/Post Fikri

| # | Sistem | TikTok Hook (TR) | Format |
|---|---|---|---|
| 1 | Western | "Yükselenini bilmiyorsan kim olduğunu bilmiyorsun" | Carousel reveal |
| 2 | Vedik | "Türkler nakshatra bilmiyor — seninki bu" | 27-card flip |
| 3 | Chinese | "Doğum saatin gerçek Çin burcunu söylüyor" | Calculator demo |
| 4 | Maya Tzolkin | "Kin numaran ne? 260 günlük takvimde sen kimsin?" | Color reveal |
| 5 | Celtic | "Druidlerin ağaç burcun bu — Willow musun?" | Forest aesthetic |
| 6 | Native | "Hangi hayvan totem'i ile doğdun?" | Animal reveal |
| 7 | Egyptian | "Firavunların 36 dekanından seninki" | Hieroglyph anim |
| 8 | Norse | "Doğum runun ne? Vikingler bilirdi" | Rune carving |
| 9 | Tarot | "Major Arcana'da senin hayat kartın" | Card pull |
| 10 | Tibet | "Tibetli rahiplerin doğum mewa'sı" | Mandala |
| 11 | Numerology | "İsim sayın Pythagorean vs Chaldean" | Split screen |
| 12 | Human Design | "MG/Projector/Manifestor — yanlış mı yaşıyorsun?" | Type explainer |
| 13 | Gene Keys | "64 codon ringinden doğduğun anahtar" | DNA anim |
| 14 | Astrocarto | "Hangi şehirde aşk bulursun? Haritan söylüyor" | Map zoom |
| 15 | Starseed | "Pleiadian mısın Sirian mı? Test et" | Quiz format |
| 16 | Chakra | "Doğduğun anda dominant çakran" | Chakra spin |
| 17 | Vargas | "Hint astrologlar evliliğe D9'a bakar — seninki ne?" | Chart reveal |
| 18 | Birth Star | "Senin yıldızın hangi tanrıya bağlı?" | Constellation |
| 19 | Elements | "%80 su mu %80 ateş mi? Element profilin" | Bar chart anim |
| 20 | Soul Mirror | "9-kart kişisel açılım — kim olduğunu söyler" | Reveal sequence |

**Format kuralı:** Her reel max 12 saniye, 0-2sn hook ("X olduğunu biliyor muydun?"), 2-10sn reveal, 10-12sn CTA ("soulprofile.app").

---

## 10. Veri Kaynakları & Lisanslar

| Veri | Lisans | Risk | Kullanım |
|---|---|---|---|
| **Swiss Ephemeris** | AGPL v3 (ücretsiz) veya ticari ($750) | AGPL'ye uyum: backend'de çağırırsan kullanıcıya kaynak açma yükümlülüğü yok (SaaS exception **YOK**, dikkat). | Edge Function arkasında çağır; eğer AGPL kabul etmiyorsak ticari lisans al — **karar:** ticari lisans ($750 once-off) tavsiye. |
| **astronomy-engine** | MIT | Yok | Tüm browser hesapları. |
| **Maya Tzolkin** | Kamu malı | Yok | Sabit algoritma. |
| **Tarot Birth Card formülü** | Kamu malı | Yok | Algoritma yaz. |
| **Elder Futhark rune** | Kamu malı | Yok | Lookup. |
| **Chinese Bazi** | Kamu malı | Yok | Lunisolar conversion. |
| **Tibet Mewa/Parkha** | Kamu malı (algoritma) | Yorum metinleri telif risk — kendi yaz | Lookup + Claude yorum. |
| **Native American Medicine Wheel** | Kamu malı ama **kültürel hassasiyet** | YÜKSEK — appropriation eleştirisi | Disclaimer: "Sun Bear/Medicine Wheel tradition'ından esinlenildi, First Nations'a saygıyla." Influencer/danışman onayı al. |
| **Human Design** | Ra Uru Hu IP — kavramlar serbest, "BodyGraph" tescilli isim | Orta | "BodyGraph" yerine "energy map" demek güvenli; logo kopyalama. |
| **Gene Keys** | Richard Rudd telifli | YÜKSEK | Sadece "key numarası + temel anahtar adı"nı sun, Rudd'ın metinlerini KOPYALAMA — kendi Claude yorumları üret. |
| **Tarot deck art** | Rider-Waite 1909 (kamu malı UK/US) | Düşük | Rider-Waite kullan veya kendi minimal SVG. |

### 10.1 Disclaimer Metni (her sistem altı küçük punto)
> "Bu yorum [SİSTEM ADI] geleneğinden esinlenmiştir. Eğlence ve farkındalık amaçlıdır; tıbbi, psikolojik veya finansal tavsiye yerine geçmez."

### 10.2 Kültürel Hassasiyet
- Native American + Tibet + Vedik bölümlerinde **"bu yorum bir özettir, gelenek çok daha derindir"** notu.
- Aboriginal/First Nations danışmanı 1 saatlik review al → marketing'de kullanılabilir trust signal.

---

## 11. Test Senaryoları

Tüm sistemleri aynı doğum verisi üzerinde tutarlı çalıştığını doğrulamak için 5 senaryo:

### Senaryo 1 — Klasik (saat var, TR doğum)
- Cetin: 12 Mart 1990, 14:30, İstanbul
- **Beklenti:** 20 sistemin hepsi sonuç döndürür, ASC hesaplanır, HD type belirlenir.

### Senaryo 2 — Saat bilinmiyor
- Ayşe: 5 Haziran 1995, **saat ?**, Ankara
- **Beklenti:** ASC + HD type + Mısır decan **fallback** ("yaklaşık öğlen kullanıldı, kesin değil" notu). Maya/Çin/Numeroloji/Tarot etkilenmemeli.

### Senaryo 3 — Yurt dışı + timezone
- Maria: 22 Kasım 1988, 03:15, Buenos Aires (-03:00)
- **Beklenti:** Timezone otomatik çekilir, Vedic Moon Rashi TR doğumlu birinden farklı çıkar, Chinese hour pillar doğru (Tiger hour değil, Buffalo).

### Senaryo 4 — Master sayı + sınır günü
- Ali: 11 Kasım 2002 (11.11.2002 — Life Path 11), 11:11, Konya
- **Beklenti:** Numeroloji master 11'i KORUR (düşürmez). Norse rune sınır gününde (Nov 11 = Hagalaz/Nauthiz sınırı) deterministik karar verir.

### Senaryo 5 — Kuzey kutbu / extreme latitude
- Demo: 1 Ocak 2000, 12:00, Tromsø, Norveç (69°N)
- **Beklenti:** Placidus ev sistemi extreme latitude'da patlamaz (fallback: Whole Sign), HD design date 88° öncesi doğru hesaplanır.

### 11.1 Otomatik Test Matrix
```ts
const FIXTURES = [cetin, ayse, maria, ali, demo];
const SYSTEMS = [western, vedic, chinese, mayan, celtic, native,
                 egyptian, norse, tarot, tibetan, numerology,
                 humanDesign, geneKeys, astrocarto, starseed,
                 chakra, vargas, birthStar, elements, soulMirror];

for (const fixture of FIXTURES) {
  for (const system of SYSTEMS) {
    test(`${system.name} works for ${fixture.name}`, async () => {
      const result = await system.compute(fixture);
      expect(result).toMatchSchema(system.outputSchema);
      expect(result).not.toBeNull();
    });
  }
  test(`synthesize for ${fixture.name}`, async () => {
    const profile = await computeAll(fixture);
    const identity = await synthesize(profile);
    expect(identity.archetype.code).toMatch(/^[A-Z]+_\d+$/);
    expect(identity.soulSignature).toHaveLength(5);
    expect(identity.soulNumber).toBeGreaterThan(0);
  });
}
```

Toplam: 5 × 20 = 100 sistem testi + 5 sentez testi = **105 test**, CI'da <2 dakika çalışmalı.

---

## EK A — Sprint Backlog Önerisi (2 hafta)

**Hafta 1**
- Mon: `lib/systems/mayan/` + viral hook copy
- Tue-Wed: `lib/systems/vedic/` nakshatra + moon rashi
- Thu: `lib/systems/chinese/` zodiac+element
- Fri: `lib/systems/norse/` + `lib/systems/tarot/` birth card

**Hafta 2**
- Mon-Tue: Karne layout v2 (yeni 5 sistem listesi entegre)
- Wed: Sentez algoritması v0 (sadece arketip + soul number)
- Thu: QA, 5 senaryo test, copy review
- Fri: Marketing assets (20 reel'in ilk 5'i prod)

**Definition of Done:**
- 5 sistem tarayıcıda <100ms hesaplanıyor
- Karne PNG export'unda 5 sistem görünür
- 5 senaryo test geçiyor
- Premium gate aktif (5 sistemden 0'ı kilitli, hepsi free MVP+)
- Footer disclaimer her sistem altında

---

## EK B — Açık Sorular (Karar bekleyen)

1. **Swiss Ephemeris lisansı:** AGPL mi ticari mi? → Ticari $750 öneri (long-term clean).
2. **Native American sistemi etik review:** danışman bul (1 saatlik konsültasyon, ~$200) veya bu sistemi v0.5'e ertele.
3. **Gene Keys IP:** Richard Rudd'un foundation'ı ile yazışma — affiliate program var mı?
4. **Cosmic Identity sentez TR/EN:** arketip isimleri ayrı yazılacak mı yoksa otomatik çeviri yeterli mi? (Öneri: 144 arketip için elle TR + EN yaz, kalite kontrolü.)
5. **Edge Function vendor:** Supabase Edge mi Netlify Functions mı Cloudflare Workers mı? (Öneri: Supabase Edge — auth ile aynı altyapı.)
