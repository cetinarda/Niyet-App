# SoulProfile — UX Awards Playbook

> Hazırlanma: 2026-06-07
> Hedef: SoulProfile'ı **Apple Design Award seviyesine** taşıyacak somut, kod-implementasyona hazır UX/UI plan.
> Kapsam: Light Mode tasarım sistemi + 7 ekran revizyonu + mikro-etkileşim katmanı + 14 günlük sprint.
> Bu doküman `MARKET_FIT.md` (büyüme) ve `COUPLE_PIVOT.md` (tema) ile uyumlu çalışır; o iki dokümanın "ürün ne anlatmalı" cevabını **görsel/etkileşim diline** çevirir.

---

## 1. Tek cümlelik teşhis

**SoulProfile'ı Apple Design Award seviyesine taşımak için ŞU bir şeyi değiştirmeliyiz: tek-mode'lu (sadece koyu galaksi) klişesinden çıkıp, sembolik koyu/aydınlık geçişin kendisini "kozmik nefes" jest dili haline getirmeli — Co-Star'ın minimal monokrom dilini referans alıp, Headspace'in sıcak yumuşak duygusal palet katmanını üzerine koyarak; mevcut "kart üstü kart üstü kart" tek-scroll yığını ise tek bir "Liquid Glass nav + breathing content layer" hiyerarşisine taşınmalı.**

Yani üç hareket:
1. **Light Mode'u eşit prestijli ikinci tema** olarak doğur (Twilight Vellum paletini light'a evir).
2. **İçerik katmanı** ile **navigasyon katmanını** ayır — Apple HIG 2025 "Liquid Glass" prensibi: glass yalnız nav'da, content saf.
3. **Halka, glyph, kart ve transit jestlerini** Framer Motion `layoutId` ile shared element koreografisine taşı.

---

## 2. 5 referans uygulama × 1 paten

| Uygulama | Ödül / Kategori | Öne çıkardığı prensip | SoulProfile'a spesifik adaptasyon |
|---|---|---|---|
| [**Lumy**](https://developer.apple.com/design/awards/2025/) (ADA 2025 finalist, Delight & Fun) | Sun/moon tracker — "celestial info, simple palette + Live Activity" | Tek-amaçlı kozmik veri ekranı: rakam değil, **ışığın o anki rengi** mesaj. Curated palette + Apple Watch widgets. | **Welcome hero**'da statik gradient yerine **Lumy stili "şu anki gökyüzü"** widget şeridi (Güneş yükseliş/batış + ay fazı, kullanıcının lokasyonuna göre). Tek glyph + 2 satır + 1 ışık. |
| [**Crouton**](https://developer.apple.com/design/awards/2024/) (ADA 2024 winner, Interaction) | Recipe app — gesture-first, "cooking mode" tek-task focus | Aynı arayüz, bağlama göre **dim/highlight ile odak değiştirme** (cooking mode). | **Compatibility "Beş Pencere" tab**'inde tıklanan halka diğerlerini dim'ler (`opacity 0.35`), seçili olan kart genişler + alt metin akar. "Tek pencere odaklı okuma modu". |
| [**Headspace**](https://www.metalab.com/work/headspace) (referans, mindfulness gold standard) | Onboarding = "breathe in–out" jesti; soft pastel + Lottie | Form değil **karşılama jesti**. Veri girmeden önce duygusal hazırlık. | **Birth form**'a girmeden 2 saniyelik "Bir nefes al, doğum anına dön" mikro-jeneriği (`SpaceIntro` zaten var ama global; ona benzer **birth-specific intro**). Reduce Motion ON ise atla. |
| [**Co-Star**](https://medium.com/demagsign/how-the-design-of-the-astrology-app-co-star-is-conquering-the-masses-d6b6d235c806) (kategori gold standard, ADA değil ama tasarım kanonu) | Monokrom, serif başlık, **veri = tipografi**, illüstrasyonsuz | Spiritüel kategoride "minimum, mistik, kitap gibi" hissi. | **Report karne**'sinin print/share görseline alternatif **"Co-Star modu"**: tek beyaz/krem zemin, siyah serif başlık, glyph dışında hiç renk. Light mode'un *gerçek* meyvesi. |
| [**Mela Recipe Manager**](https://developer.apple.com/design/awards/2025/) (ADA 2025 finalist, Interaction) | Cooking mode: Dynamic Island timer, Vision OCR, Reminders entegre | Tek özelliği değil, **Apple ekosistem yüzeylerini sırayla geçirmek**. | **Match invite akışı**: davet linki açıldığında → Live Activity'de "Sevgilin uyumu hesaplıyor" + tamamlandığında Lock Screen widget'ı. Web'de fallback: tarayıcı tab title + favicon spinner. |

---

## 3. Light Mode tasarım sistemi

Mevcut karanlık galaksi paleti `bg: #07091a` + `gold: #f5d061` + `cosmic: #7c5cff` **gece modu** olarak kalır — kimlik korunur. Light mode aynı kategorinin **alternatif okuma alanı**: sıcak, dingin, kâğıt gibi, ışıklı.

### 3.1 Felsefe

- **Karanlık mod** = "kozmosa bakıyorsun" → derinlik, mistik, gece okumaları, paylaşılabilir karne için ideal.
- **Aydınlık mod** = "ışığa not ediyorsun" → günlük açış, journaling, çift okumasını birlikte oturup görme, gündüz erişilebilirlik.
- Twilight Vellum 5-katman pastel (`chemistry/lesson/rhythm/fate/compass`) **iki modda da aynı** kalır — bu, kompozisyonun çapasıdır.

### 3.2 Sebep: spiritüel kategoride başarılı light örnekler

- **Insight Timer light mode**: less colors, less info, "fresh air" hissi ([kaynak](https://herhealthwatch.com/insight-timer-vs-calm/)).
- **Headspace**: pastel + soft + rounded — sharp edge yok ([kaynak](https://www.neointeraction.com/blogs/headspace-a-case-study-on-successful-emotion-driven-ui-ux-design.php)).
- **Calm 2025**: sade orta-saturation, doğal taşlar (sand/sage/stone) ([kaynak](https://www.bighuman.com/blog/trends-in-mindfulness-app-design)).
- **Apple HIG 2025**: "semantic colors are dynamic — bg can be black in dark / white in light" — system-defined colors otomatik adapt ([kaynak](https://developer.apple.com/design/human-interface-guidelines/color)).

### 3.3 Light Mode Palette — tam hex değerleri

```ts
// tailwind.config.ts — yeni light tokens
// Karanlık mevcut kalır, light bunlarla katmanlanır.

const light = {
  // Background elevation (3 katman)
  bg:           '#FAF7F0',   // warm vellum white (paper-like)
  bgElevated:   '#F2EDE0',   // dawn cream (modal/sheet zemini)
  bgDeep:       '#E9E2CF',   // toast deep (en altta vignette)

  // Surface (kart sistemi)
  panel:        'rgba(26, 20, 14, 0.04)',   // cards over bg
  panelBorder:  'rgba(26, 20, 14, 0.08)',   // hairline
  panelStrong:  'rgba(26, 20, 14, 0.06)',   // hover/active

  // İçerik renkleri
  ink:          '#1A140E',   // espresso brown (saf siyah DEĞİL — sıcak)
  inkSoft:      '#3C342A',   // body text
  muted:        'rgba(26, 20, 14, 0.62)',
  faint:        'rgba(26, 20, 14, 0.4)',

  // Brand accents (aynı semantic, ışığa adapt edilmiş)
  gold:         '#B8861F',   // antique gold (kontrast için koyulaştı)
  goldSoft:     '#D4A94A',   // pastel gold (highlight band)
  goldOnLight:  '#9C6D0E',   // small text üzerinde okunur kalır
  cosmic:       '#5B3FD3',   // deep cosmic (saturated mor)
  cosmicSoft:   '#7C5CFF',   // bg-cosmic on light buton kalabilir
  nebula:       '#D8508E',   // dusty fuchsia
  starlight:    '#4A86A8',   // muted teal

  // Twilight Vellum — iki modda da AYNI (bu çapadır)
  vellum: {
    chemistry:  '#E8C28A',   // amber — Kimya
    lesson:     '#9CAF88',   // sage — Ders
    rhythm:     '#C9A0A6',   // dusty rose — Ritim
    fate:       '#8FA3C2',   // indigo dusk — Kader
    compass:    '#C7B8E8',   // soft lavender — Pusula
  },

  // System (success/danger)
  success:      '#3E9A6C',   // forest green
  danger:       '#C24545',
};
```

### 3.4 Liquid Glass / vibrancy material hiyerarşisi

Apple HIG 2025: *"Liquid Glass is best reserved for the navigation layer. Avoid putting glass in the content layer."* ([kaynak](https://developer.apple.com/design/human-interface-guidelines/materials)).

SoulProfile'da uygulanışı:

| Katman | Karanlık mod | Aydınlık mod | Glass? |
|---|---|---|---|
| **Sayfa zemini** (body) | `#07091a` + nebula vignette + starDrift | `#FAF7F0` + dawn vignette + dust mote drift | Hayır — saf renk |
| **Content kart** (article/section) | `bg-panel/30` solid | `bg-white/40` solid | Hayır — opak, blur yok |
| **Navigation bar** (TopBar) | `bg-bg/55 backdrop-blur-xl` | `bg-bg/65 backdrop-blur-xl` | **Evet** — Liquid Glass |
| **Floating action** (theme toggle, locale) | aynı bar üzerinde glass pill | aynı bar üzerinde glass pill | **Evet** |
| **Modal / Sheet** | `bg-bgElevated solid` | `bg-bgElevated solid` | Hayır — okunabilirlik öncelikli |
| **Tooltip / Toast** | `bg-bg/80 blur-md` | `bg-bg/80 blur-md` | Evet — geçici element |

Kural: **content okunurken arkasında bulanıklık olamaz** — sadece nav layer'da glass. Halka skorlar, kavram kartları, AI anlatım paragrafları **opak**.

### 3.5 Altın rengi: koru ya da değiştir?

| Durum | Karar | Sebep |
|---|---|---|
| Karanlık zeminde gold buton (`bg-gold`) | **Koru** `#f5d061` | Kontrast 9.2:1 — AAA |
| Aydınlık zeminde gold buton | **Değiştir** → `#B8861F` (antique) + `text-white` | `#f5d061` üzerinde beyaz okumuyor; içerik koyu → kontrast 4.8:1 (AA) |
| Karanlık zeminde gold metin | **Koru** | Marka eşit |
| Aydınlık zeminde gold metin | **Değiştir** → `#9C6D0E` | `#f5d061` üzerine beyaz ya da koyu kâğıt çekmiyor (3.1:1) |
| Karne PNG export'u | **Hep karanlık** zorunlu | Paylaşımda viral, marka bütünlüğü, Co-Star/Lumy paterni |

Implementation: Tailwind `dark:` variant + CSS custom properties.

```css
:root {
  --color-gold: #B8861F;
  --color-gold-text: #9C6D0E;
}
.dark {
  --color-gold: #f5d061;
  --color-gold-text: #f5d061;
}
.bg-gold { background-color: var(--color-gold); }
.text-gold { color: var(--color-gold-text); }
```

---

## 4. Theme toggle UX

### 4.1 Konum

- **Birincil**: TopBar sağında, `LanguageToggle` sol komşusu olarak. Sun/Moon ikonu, glass pill içinde.
- **İkincil**: `/settings` "Görsel tercih" section'ı — Light / Dark / Auto üçlü segmented control.
- **Onboarding'de YOK** — kullanıcının ilk vurgusu form'a, tema seçimine değil. (Bu kuralı [Eleken toggle UX](https://www.eleken.co/blog-posts/toggle-ux) çalışması destekliyor.)

### 4.2 Default davranış

`prefers-color-scheme` system değerini ilk açılışta uygula. Kullanıcı manuel seçtiğinde `localStorage.theme = 'light' | 'dark' | 'auto'` kaydedilir. Sonraki ziyaretlerde:
- `auto` → system'i takip et, system değişince live update (no reload).
- `light` / `dark` → sabit kal.

Bu paten Apple HIG 2025 yaklaşımıyla uyumlu: "respect system, allow override" ([kaynak](https://www.influencers-time.com/dark-mode-ux-in-2025-design-tips-for-comfort-and-control/)).

### 4.3 Geçiş animasyonu

- **CSS transition** ile değil — **`view-transition-name` API** ile (modern Safari 18 + Chrome 111+). Fallback: 250ms `cubic-bezier(0.4, 0, 0.6, 1)` opacity.
- Spring DEĞİL — tema geçişi "ışık atışı" gibi olmalı, zıplama değil. 250ms ease-out doğru hissettiriyor.
- Kod (Next.js App Router):

```ts
function toggleTheme() {
  if (!document.startViewTransition) {
    setMode(next); return;
  }
  document.startViewTransition(() => setMode(next));
}
```

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 250ms;
  animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
}
```

### 4.4 Yıldız zemini davranışı

| Mod | `body::after` starDrift | `.starfield` overlay | `body::before` vignette |
|---|---|---|---|
| Dark | `opacity: 0.55`, gümüş yıldızlar | `opacity: 0.32` | mor/mavi nebula |
| Light | `opacity: 0.12`, **toz zerreleri** (radial-gradient sand color) | `opacity: 0.08` | toast/dawn vignette |
| Auto + system dark | dark gibi | dark gibi | dark gibi |
| `prefers-reduced-motion` | drift kapalı, opacity 0 | sabit | sabit |

Light'ta yıldızlar **görünmez değil**, sadece "toz parçacığı dalgalanması" hissinde — UI'ı bozmaz, ama paylaşılan dilin DNA'sı kaybolmaz.

### 4.5 Toggle ikonu

Üçlü segmented control (settings sayfasında):
- `☀` Light · `◐` Auto · `☽` Dark
- TopBar pill (default mode visible):
  - Auto mode: küçük circle, içinde `◐` glyph + tooltip "System"
  - Light mode: `☀` + label gizli (icon-only, 44px tap target)
  - Dark mode: `☽` + label gizli

ARIA: `role="switch" aria-checked` üçlü için `role="radiogroup"`. Tap target ≥ 44×44.

---

## 5. UX çerçeve revizyonu (ekran ekran)

### 5.1 Welcome (`/`)

Mevcut: 6 section, her birinde başlık + grid → tek scroll'da gold yığını.

**Öneri 1 — Hero'yu "şu anki gökyüzü" widget'ına çevir** ([Lumy ADA 2025](https://developer.apple.com/design/awards/2025/) referans).
- NEDEN: Sayfa açılışta sabit gradient bir "PNG poster" gibi. Lumy'nin başarısı kullanıcının lokasyonuna göre **dinamik bir tek-değer** göstermesi.
- NASIL: Hero'nun altına 3-cell strip (max-width 480, glass pill): `🌅 06:42 doğdu` · `🌑 %23 dolunay yolda` · `♋ Yengeç burcunda Güneş`. Veriler: `lib/astronomy-engine` mevcut, `lib/geocoding` ile IP konumu çek (kullanıcı onayı yok — sadece kaba günlük gökyüzü).
- KOD: `<NowSky />` component, `Tailwind: rounded-full border border-panelBorder bg-panel/40 backdrop-blur-md px-3 py-1.5 text-[11px]`
- EFFORT: M (5–7 saat)

**Öneri 2 — "İki Ana Yol" kartlarını shared-element olarak büyült**.
- NEDEN: Şu an iki kart sabit grid. Tıklayınca direkt route. ADA 2024 Crouton "mode-switch" mantığı: kart üstüne hover/tap → kartın kendisi büyür, içerik akar, sonra route'a düşer.
- NASIL: Framer Motion `layoutId="path-self" / "path-couple"`. Tıklayınca kart fullscreen sheet'e morphlanır (300ms spring `stiffness: 380, damping: 30` — [Motion.dev iOS spring](https://motion.dev/tutorials/react-smooth-tabs)). Route push'u sheet açıldıktan sonra.
- EFFORT: M

**Öneri 3 — 9 sistem listesini "kelime bulutu" jestine çevir**.
- NEDEN: 9 emoji + 9 başlık + 9 açıklama = bilişsel yük. Co-Star paterni: kategorinin DNA'sı **tipografi** olmalı, ikon listesi değil.
- NASIL: Liste yerine display font'la (`Cormorant Garamond`) blok metin: *"Batı astrolojisi · Human Design · Numeroloji · Vedik Nakshatra · Maya Tzolkin · Çin Zodyak · Norse Rune · Tarot · Yıldız Irkı."* Her terim hover/tap'te aynı `<ConceptCard>` modal'ını açar (zaten var — sadece liste yerine inline link). Emoji yok.
- EFFORT: S (2 saat)

---

### 5.2 Birth form (`/birth`)

Mevcut: 5 input alt alta + photo upload + submit. Kicker + title + subtitle. Çalışıyor ama "form" hissi.

**Öneri 1 — "Bir nefes" jesti'ni form'dan ÖNCE göster**.
- NEDEN: Headspace onboarding: form'dan önce duygusal hazırlık. "Tıbbi/spiritüel veri verme" anı bir cooldown ister.
- NASIL: `/birth` ilk açıldığında, üst kart yerine 1.5sn `<BreathPrompt />`: ortada büyük `✦`, "Doğduğun ana dön. Hazır olduğunda devam et." + tek buton "Başla". Reduce Motion ON ise atla, direkt form. Tek seferlik — `localStorage` flag.
- KOD: `SpaceIntro.tsx` paterni — sadece bu sayfada, daha uzun ve copy'li.
- EFFORT: S (3 saat)

**Öneri 2 — Form'u 4 mini-ekrana böl, progress dot ile**.
- NEDEN: Tek dev form = "iş yapıyor gibi". Crouton'un cooking mode'u: tek-task tek-ekran. ADA Speechify ödülü "cognitive load minimization" prensibi.
- NASIL: Adım 1: Ad. Adım 2: Tarih + saat. Adım 3: Yer (auto-suggest). Adım 4: Fotoğraf (opsiyonel) + onay. Üstte 4 nokta progress (current solid gold, rest hairline). "İleri" butonu, son adımda "Karneyi Aç". State store'da kal. Geri butonuyla geri.
- EFFORT: M (5 saat)

**Öneri 3 — Input focus state'i Liquid Glass yap**.
- NEDEN: Şu an input `border-gold/70` ile vurgulanıyor — flat neon glow. ADA Denim "haptic + custom" referans: focus aynı zamanda haptic + ince ışıma.
- NASIL: Focus'ta border'a ek `box-shadow: 0 0 0 4px rgba(245, 208, 97, 0.12)` + `backdrop-blur-sm` zaten var. Web'de `navigator.vibrate(8)` (Android), iOS Capacitor'da `@capacitor/haptics` `Impact.Light`.
- KOD:
  ```tsx
  onFocus={() => { window.navigator.vibrate?.(8); }}
  className="focus:shadow-[0_0_0_4px_rgba(245,208,97,0.12)] focus:border-gold/70"
  ```
- EFFORT: S (2 saat)

---

### 5.3 Report (`/report`)

Mevcut: 9 blok tek scroll'da. `MARKET_FIT.md`'in zaten yakaladığı en büyük problem.

**Öneri 1 — "Aha → keşfet → derinleş" 3 katmanına böl**.
- NEDEN: 3-step onboarding %72 tamamlanır, 7-step %16 ([Eleken](https://www.eleken.co/blog-posts/mobile-ux-design-examples)). Aynı içerik kanunu.
- NASIL: 
  - **Katman 1 (Aha — fold üstü)**: ReportCard + Share/Download + 1 satır AI özet (`summary` zaten var). Bu kadar.
  - **Katman 2 (Keşfet — fold altı)**: CharacterStats + ConceptCard grid (eve sembolleri). 
  - **Katman 3 (Derinleş — expandable)**: 3D solar sistem + StarTree + BirthChartWheel + tam AI 7 bölüm. Default `collapsed`, kullanıcı "Gökyüzünü açıyorum" der.
- KOD: `<details>` HTML5 + `<motion.section layoutId="explore">`.
- EFFORT: M (1 gün)

**Öneri 2 — ReportCard'ın "Co-Star modu" alternatifi**.
- NEDEN: Mevcut karne karanlık galaksi — paylaşımda etkili ama "Insta story sticker" hissinde. Bazı kullanıcılar minimal, kitap-sayfa hissi ister.
- NASIL: ReportCard'a `variant: 'galaxy' | 'paper'` prop ekle. Paper variant: `bg-[#FAF7F0]`, espresso ink, Cormorant serif başlık, glyph dışında hiç renk. Share/Download butonlarının yanında segmented switch: "Galaksi / Kâğıt".
- EFFORT: M (4 saat)

**Öneri 3 — AI anlatımı 7 bölümünü "kart deste" jesti yap**.
- NEDEN: 7 paragraf alt alta okuyamaz kullanıcı. Headspace meditation flow: tek tek pacing.
- NASIL: AI bölümleri (`opening, astrology, humanDesign, soulStory, wisdoms, shadows, callToAction`) — sağa sola swipe edilen 7 kart. Üstte 7 nokta. Reduce Motion ON ise dikey liste (mevcut).
- KOD: Framer Motion `<motion.div drag="x" dragConstraints={{left: -360, right: 0}}>`.
- EFFORT: L (1.5 gün)

---

### 5.4 Compatibility (4 tab — İki Yıldız / Beş Pencere / Aynalar / Pusula)

Mevcut: `CompatibilityView` tabsız zaten 4 tab kurmuş — temel iskelet doğru.

**Tab 0 — İki Yıldız**
- Öneri: İki PersonCard arasında **canlı çarpan glyph** ekle (`◇` SoulProfile mührü). 
  - NEDEN: Şu an iki kart yan yana grid. "Bir ilişki" hissini "iki ayrı varlık + araya bir bağ" çarpanı yansıtır.
  - NASIL: Mobile'da dikey, ortada `<motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity }}>◇</motion.div>`. Desktop'ta yatay grid.
  - EFFORT: S

**Tab 1 — Beş Pencere**
- Öneri: 4 halkanın hover'da gizli hint'i, varsayılan görünür yap; ama "büyük halka" ekle (toplam).
  - NEDEN: Şu an 4 küçük halka eşit boyut. ADA ödüllü Gentler Streak prensibi: "individual progression, not comparison". Toplam halkanın yokluğu doğru karar — ama içinden seçince **dim/highlight** lazım (Crouton).
  - NASIL: Tıklanan halka `scale-110 ring-2 ring-current`, diğerleri `opacity-40 saturate-50`. Tab'i 2'ye geçirme (mevcut davranış) opsiyonel — "tek halka okuma modu" yeni davranış.
  - EFFORT: M

**Tab 2 — Aynalar**
- Öneri: HD merkezleri "ayna" metaforu için **çift-kart** (A↔B yan yana, ortada split-line).
  - NEDEN: Şu an her merkez tek kart. "Ayna" metaforu görsel olarak yansımıyor.
  - NASIL: Her merkez kartı 2 sütun: solda A'nın enerjisi (`bg-[#E8C28A]/8`), sağda B'nin (`bg-[#C9A0A6]/8`), ortada 1px dikey `border-faint`. Üstte merkez adı, altta tek cümle "X seni Y'de sınar." 
  - EFFORT: M

**Tab 3 — Pusula**
- Öneri: 3 tarot kartına **flip-on-tap** mikro-etkileşim ekle.
  - NEDEN: Tarot deneyimi *çekim anı* + *kart açma* anı. Şu an her şey önden görünüyor; gizemi alır.
  - NASIL: Default sırt (sigil + altın hairline), tap → 600ms `rotateY 0→180`, ön yüz açılır. Reduce Motion ON ise crossfade. İlk açılışta hepsi sırtı, kullanıcı tek tek açar.
  - KOD: Framer Motion `<motion.div animate={{ rotateY: open ? 180 : 0 }} style={{ transformStyle: 'preserve-3d' }}>`.
  - EFFORT: M (3 saat)

---

### 5.5 Match (davet alındı) (`/match`)

Mevcut: Davet eden bilgisi + form. Çalışıyor ama "ben de form dolduruyorum" hissi.

**Öneri 1 — Davet edenin küçük yıldız haritasını üstte göster**.
- NEDEN: Davet alan kullanıcı "kim bu kişi?" merakında. Sun/Moon/Rising 3 glyph + isim = yatay küçük portre. Yapışkanlık katlanır.
- NASIL: `<InviterMiniChart birth={inviterBirth} report={inviter}>` — 3 glyph + isim + doğum yeri tek satır. ~50px yükseklik, header üstünde sticky.
- EFFORT: S (2 saat)

**Öneri 2 — Submit anında "iki yıldız buluşuyor" mikro-jenerik**.
- NEDEN: Headspace breath onboarding patternı + Lumy live activity. Compute ~2sn, bu boş zamanı duygusal payoff'a çevir.
- NASIL: Submit'ten sonra `<CosmicLoader>` yerine `<TwoStarsMeet>` — solda A'nın sigil (gold), sağda B'nin (cosmic), 1.5sn ortada buluşma + scale + parıltı. Result hazır olunca scroll.
- KOD: `CosmicLoader.tsx` paternini referans al, 2 sigil + ortada `<motion.div animate={{ scale: [0, 1.2, 1] }}>◇</motion.div>`.
- EFFORT: M

---

### 5.6 Premium / Deep Analysis (`/premium` + `DeepAnalysisBox`)

Mevcut: Tek SKU kartı + feature list + buy + restore. Doğru iskelet (Apple guideline 3.1.1 uyumlu).

**Öneri 1 — "Önce blur, sonra unlock" jesti yerine "açılan kitap" metaforu**.
- NEDEN: Şu an `DeepAnalysisBox` premium yokken bullet list gösteriyor. Klasik blur paywall'ı, doğru ama heyecansız. Mela'nın "cooking mode" prensibi: aynı UI, farklı mod.
- NASIL: 10 bölüm başlığı altında **kapalı kitap** ikonu (`📕`) ve hairline. Tıklayınca açılma animasyonu (1.2sn flip), arkasından paywall sheet. Açılan kitap "okumaya hazır" olduğunu somutlaştırır.
- EFFORT: M

**Öneri 2 — Premium showcase'inde Live Activity preview**.
- NEDEN: ADA paterni: Apple ekosistem yüzeylerini sıralı geçir. Premium'ın "tek kerelik ama derin" hissini Lock Screen widget mockup'ıyla göster.
- NASIL: `/premium`'a static image (web SVG mockup yeterli): iPhone Lock Screen, üstte `Soul · Ada ↔ Cem · 87% Compass aligned`. "İşte iOS app açtığında karşına çıkacak." Sadece görsel — gerçek Live Activity Capacitor'da production sonrası.
- EFFORT: S (3 saat — SVG mockup)

---

### 5.7 Glossary (`/glossary`)

Mevcut: Filter chip + uzun kart listesi. Çalışıyor.

**Öneri 1 — Arama + alphabetik index sticky strip**.
- NEDEN: 50+ terim olduğunda filter chip yetmez. iA Writer'ın gesture-first prensibi: "swipe right for library access".
- NASIL: Üstte `<input type="search">` + altında alphabetic sticky strip (`A B C D ... Z`). Strip'te terim olan harf gold, olmayan faint. Tıklayınca o harfin ilk terimine `scrollIntoView`.
- KOD: 
  ```tsx
  const letters = useMemo(() => new Set(items.map(i => i.term[0].toUpperCase())), [items]);
  ```
- EFFORT: M (4 saat)

---

## 6. Mikro-etkileşim katmanı

### 6.1 Buton tıklamada haptic + tactile

Web fallback (CSS-only): `:active` durumunda `scale-[0.97] transition-transform duration-100`. iOS Capacitor:

```ts
// lib/haptics.ts (yeni)
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { isCapacitorNative } from './platform';

export function tap(strength: 'light' | 'medium' | 'heavy' = 'light') {
  if (isCapacitorNative()) {
    Haptics.impact({ style: { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy }[strength] });
  } else {
    navigator.vibrate?.(strength === 'light' ? 8 : strength === 'medium' ? 16 : 24);
  }
}
```

Kullanım: tüm `onClick` callback'lerinin başında `tap('light')`. Premium unlock'ta `tap('heavy')`. Tarot kartı flip'inde `tap('medium')`.

### 6.2 Tab geçişlerinde shared element

`CompatibilityView` tab'lerinde aktif tab pill için `layoutId`:

```tsx
{TAB_LABEL[locale].map((label, i) => (
  <button key={label} onClick={() => setTab(i)} className="relative px-4 py-2.5">
    {tab === i && (
      <motion.span
        layoutId="active-tab-pill"
        className="absolute inset-0 -z-10 rounded-full bg-gold"
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      />
    )}
    <span className={tab === i ? 'text-[#1a0a40]' : 'text-muted'}>{label}</span>
  </button>
))}
```

Sonuç: tab değiştirince gold pill sürünerek geçer ([motion.dev pattern](https://motion.dev/tutorials/react-smooth-tabs)).

### 6.3 Kart açma/kapama spring

`ConceptCard` modal'ı şu an opacity transition. Spring + scale + slide up:

```tsx
<motion.div
  initial={{ opacity: 0, y: 30, scale: 0.96 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  exit={{ opacity: 0, y: 30, scale: 0.96 }}
  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
>
```

Reduce Motion ON: `transition={{ duration: 0 }}` veya `initial/animate` aynı değerler.

### 6.4 Skor halkaları enter animation

`ScoreRing` şu an `strokeDasharray transition: 800ms ease-out` — temel doğru. Eksik: **staggered enter**. Tüm halkalar aynı anda çiziliyor.

```tsx
{LAYER.map((layer, i) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: i * 0.12, type: 'spring', stiffness: 300, damping: 26 }}
  >
    <ScoreRing ... />
  </motion.div>
))}
```

Bir halka tamamlanırken sıradaki başlıyor — *sequential build-up*. Tarot kartı pull sırasına benzer ritim.

### 6.5 Form input focus state

Hairline + ışıma + bg vibrancy lift:

```tsx
className="
  border border-panelBorder bg-panel/30 backdrop-blur-sm
  focus:border-gold/70 focus:bg-panel/50 
  focus:shadow-[0_0_0_4px_rgba(245,208,97,0.10)]
  focus:outline-none
  transition-all duration-200
"
```

Liquid Glass referansı — focus DEĞİL bir nav element, hairline + soft glow yeterli. Neon glow kategori dışı.

### 6.6 Loading state'ler

Şu anki: `CosmicLoader` (full screen, 20-sistem reveal) + buton içi spinner.

Üçüncü tip ekle: **skeleton dim** (kart yüksekliği biliniyorsa):

```tsx
function Skeleton() {
  return (
    <div className="rounded-2xl border border-panelBorder bg-panel/30 p-5">
      <div className="h-3 w-24 rounded bg-white/8 animate-pulse" />
      <div className="mt-3 h-5 w-48 rounded bg-white/10 animate-pulse" />
      <div className="mt-2 h-3 w-full rounded bg-white/6 animate-pulse" />
    </div>
  );
}
```

`@keyframes pulse` mevcut Tailwind. Karne yüklenirken kart yerleri tutulur, içerik akar — *cumulative layout shift sıfır*.

---

## 7. Erişilebilirlik

### 7.1 Dynamic Type / responsive font scale

Mevcut: `@media (max-width: 640px) { body { font-size: 15.5px; } }`. **Eksik**: kullanıcı sistem font scale'ini büyüttüğünde yansımıyor.

Çözüm: tüm font-size'ları `rem` cinsinden ver. Tailwind default zaten rem.
- `text-base = 1rem = 16px` (kullanıcı 200% yapsa 32px olur).
- **Kontrol et**: Tüm `text-[10px]` / `text-[11px]` (37 yerde kicker'larda) gerçekten 10/11 px sabit. Bunları `text-[0.6875rem]` (=11px @ default) yap, sistem ölçeklenmesine uyum.

Hızlı sed:
```ts
// lib/style/tokens.ts
export const kicker = 'text-[0.6875rem] font-bold uppercase tracking-[0.4em]';
```

### 7.2 Reduce Motion respect

Mevcut: `globals.css`'te `body::after { animation: none }`, `main { animation: none }`. SpaceIntro'da `if (matches('(prefers-reduced-motion: reduce)')) return`. ✓

**Yayılması gereken alanlar**:
- StarTreeOfLife (14sn animasyon) — `useReducedMotion()` hook ile statik tablo göster.
- SolarSystem3D — gezegen rotasyonu durdur (`useFrame` içinde dt = 0).
- CompatibilityView tab geçiş layoutId — `prefers-reduced-motion` ise `transition={{ duration: 0 }}`.
- Tarot flip — crossfade'e düş.
- Yeni eklenecek `<TwoStarsMeet>` ve `<BreathPrompt>` — direkt atla.

Tek hook:

```tsx
// lib/a11y.ts
import { useEffect, useState } from 'react';
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}
```

### 7.3 Color contrast WCAG 2.2

Light mode için audit:
- `text-muted` (`rgba(26,20,14,0.62)`) over `bg: #FAF7F0` → **4.6:1** ✓ AA
- `text-faint` (`rgba(26,20,14,0.4)`) over `bg` → **2.9:1** ✗ — kullanım yeri "tarih, footnote" — küçük metin için AA 4.5 gerek. Çözüm: `text-faint` light'ta `rgba(26,20,14,0.55)` (3.8:1, large text AA) — sadece 14px+ alanlarda kullan.
- `text-gold` light'ta `#9C6D0E` over `#FAF7F0` → **5.1:1** ✓
- Dark mode'da mevcut `text-ink: #f4f1ff` over `#07091a` → 18:1 ✓ AAA

Storybook ya da basic test:
```ts
// scripts/contrast-check.mjs
import { parse, contrast } from 'wcag-contrast';
// her token çifti için min 4.5 (AA) raporu
```

### 7.4 Focus order & trap

- Modallar (`ConceptCard`, `SolarSystem3D` planet detail): `focus-trap-react` ya da custom hook ile Tab key tutulsun.
- Mevcut focus-visible: `outline: 2px solid rgba(245, 208, 97, 0.7)` — light mode için contrast düşük; semantic `outline-color: var(--color-gold)` yap.
- Modal açıldığında `inert` attribute body üzerine, kapandığında kaldır.

### 7.5 VoiceOver / screen reader

Eksikler:
- `ScoreRing` SVG'sinde `<title>` ve `aria-label` yok. Ekle:
  ```tsx
  <svg role="img" aria-label={`${label}: ${score} out of 100`}>
    <title>{label}: {score}/100</title>
    ...
  </svg>
  ```
- `BirthChartWheel` SVG → tablomsu özet için `<desc>` ekle.
- Tarot kart flip'inde `aria-expanded={open}` ve `aria-controls`.
- Emoji'li `aria-hidden="true"` (yıldız glyph'leri dekoratif).

---

## 8. Hangi 5 şeyi YAPMAYALIM

1. **"Cosmic gradient bombası" — sayfa başına 3 farklı nebula**. Karanlık mod'da bile aşırı doygun mor/pembe gradient (`bg-galaxy` + `bg-cosmic` + `bg-aurora` aynı sayfada kullanılmamalı). ADA paterni: tek atmosphere/sahne. Lumy tek palet, Crouton tek mood. Mevcut `CosmicBackground variant` props'u: ekran başına TEK variant, asla overlay üst üste.

2. **Emoji dağı** (🌞 ◇ ⌖ 🪷 🦋 🐉 ᛒ 🃏 ✦ ⚯ 🤝 ⏳ ↔ ⚡ 🚪 🌿 📈 ♾ 🕯 💫 — sayfa başına 9-15 emoji). Co-Star DNA'sı: tipografi öne, ikon arkaya. Çözüm: SF Symbols / custom glyph SVG seti (`◇ ✦ ⚯ ◐ ✶ ⟁` — 6 öğe, hepsi soğuk renksiz). Emoji'leri kalıcı olarak değiştirme yerine, ana yüzeyde gizle; modallarda kalabilir.

3. **"Parlaklık patlaması" — `shadow-glow` + `card-glow` + `nebula-glow` üst üste**. ADA winner'lar (Speechify, Watch Duty, Crouton) "trust through clarity". Light mode'da bunlar tamamen kapansın; dark mode'da sayfa başına max 1 glow odağı (ana CTA).

4. **"Tüm zamanlar autoplay" — StarTree 14sn + 3D planet rotation + starDrift 120sn + nebula breath + 7-sistem reveal**. Sayfa açıldığında 5 paralel animasyon = pil, GPU, CLS. Kural: sayfa zemini (drift) hep çalışır + max 1 manuel-trigger animasyon. Otomatik animasyonlar Reduce Motion'a hassas; manuel olanlar sadece kullanıcı tetikleyince.

5. **"Çok ağır lottie / 3D her ekran"**. ADA winner Feather (3D draw) bile 3D'yi *araç olarak* sunuyor, *dekor* olarak değil. SolarSystem3D `/report` sayfasında **default kapalı** olmalı, "Gökyüzünü aç" butonu arkasında (zaten `showExplore` paterni var — gerçek default'u TRUE'dan FALSE'a çek). Premium showcase'inde 3D YOK.

---

## 9. 14 günlük tasarım sprint planı

### Hafta 1 — Foundation (light mode + tokens + a11y)

| Gün | Görev | Effort | Çıktı |
|---|---|---|---|
| 1 | Light mode palette + Tailwind tokens (`tailwind.config.ts`) | S | 8 yeni token + `dark:` variant Tailwind v3 class strategy aktif |
| 2 | Theme toggle component + `localStorage` + `prefers-color-scheme` listener | S | `<ThemeToggle />` TopBar'a |
| 3 | `globals.css` light-mode yeniden yaz (vignette, starDrift, focus-visible) | M | `:root` vs `.dark` selector ayrımı |
| 4 | `useReducedMotion()` hook + StarTree/SolarSystem'e yay | S | Reduce Motion path test |
| 5 | Contrast audit + `text-faint` `kicker` token'ı rem'e çevir | M | A11y raporu |

### Hafta 2 — Interaction polish (mikro-etkileşim + ekran revizyonları)

| Gün | Görev | Effort | Çıktı |
|---|---|---|---|
| 6 | `lib/haptics.ts` + tüm `onClick`'lere `tap()` ekle | S | Capacitor + web fallback |
| 7 | Compatibility tab `layoutId` pill + skor halkaları staggered enter | M | Framer Motion install |
| 8 | Birth form 4-step adımlama + progress dot | M | `<BirthStepper />` |
| 9 | Report sayfası 3-katman böl (Aha/Keşfet/Derinleş) + 3D default-collapsed | M | scroll yeniden ölç |
| 10 | Tarot 3-kart flip (Pusula tab) + ConceptCard spring | M | Reduce Motion path |
| 11 | ReportCard "paper variant" (Co-Star modu) | M | Share switch UI |
| 12 | Welcome hero `<NowSky />` + 2 ana yol shared-element | M | Lumy referans |
| 13 | Match sayfası `<InviterMiniChart />` + `<TwoStarsMeet>` loader | M | Davet polish |
| 14 | Cross-cutting: VoiceOver/aria pass + manuel test 7 ekran light+dark | M | Audit raporu |

### Daha sonra (sprint 3, opsiyonel)

- Glossary search + alphabetic strip.
- AI 7 bölüm "kart deste" swipe (Reduce Motion için liste fallback).
- Live Activity SVG mockup `/premium`.
- Deep Analysis "açılan kitap" jesti.

---

## 10. Risk + kabul kriterleri

### 10.1 Riskler

| Risk | Olasılık | Etki | Azaltma |
|---|---|---|---|
| **ReportCard PNG export bozulur** (`html-to-image` light mode'da color CSS variable'lar yakalayamayabilir) | Yüksek | Yüksek (paylaşılan görsel = viral motor) | ReportCard hep galaxy variant fallback. CSS variable yerine inline `style={}` ile renkleri yaz. Test: `scripts/test-png-export.mjs` ile 4 senaryo. |
| **Mevcut karneler bozulur** (localStorage formatı değişmez, ama görsel render bozulabilir) | Düşük | Orta | Format değişmez — sadece görsel tema. Eski `report.savedAt` her zaman çalışmalı, yeni alanlar opsiyonel. |
| **3D SolarSystem3D Suspense crash** (3D dependency'ler ağır, lazy load + Suspense katmanı) | Orta | Orta | Default collapsed yaptığımız için crash anında degrade. Her gezegen kendi Suspense. CLAUDE.md'de yazılı. |
| **Capacitor `@capacitor/haptics` paket eklendiğinde build bozulur** | Düşük | Düşük | Web'de dynamic import. iOS native build production'da test edilir. |
| **Framer Motion bundle boyut** (+30 kB gzipped) | Orta | Düşük | Zaten 3D var; +30kB toplam +%4. `motion/react` (slim) variant kullan. |
| **WCAG light mode contrast düşük → yeniden iterasyon** | Orta | Düşük | Pre-flight: `axe-core` headless check sprint sonunda. |
| **Reduce Motion path'i unutulan animasyon** (StarTree, 3D, Tarot flip, TwoStarsMeet) | Yüksek | Yüksek (a11y şikayeti) | Her PR'da reviewer checklist: "Reduce Motion test edildi mi?" |
| **Light mode'da paylaşılan karne "marka dışı" görünür** | Yüksek | Orta | ReportCard share için her zaman galaxy zorunlu. Paper variant sadece kullanıcı kendi görmek için. |

### 10.2 Kabul kriterleri (her ekran için)

Bu plan tamamlandığında kabul edilebilir sayılır:

- [ ] **Light mode** tüm 7 ekran için çalışır (Welcome, Birth, Report, Compatibility, Match, Premium, Glossary).
- [ ] **Theme toggle** sun/moon/auto, 3 modu var; geçiş 250ms ease-out; `prefers-color-scheme` initial value.
- [ ] **Reduce Motion** ON'da: StarTree static, 3D rotation off, Tarot flip crossfade, TwoStarsMeet skip, tab pill duration 0.
- [ ] **A11y**: Tüm metin WCAG AA (4.5:1 normal, 3:1 large). Tüm interaktif element ≥ 44×44. Focus visible her yerde.
- [ ] **ReportCard PNG export** her iki tema için çalışır (galaxy fallback default).
- [ ] **VoiceOver pass** ScoreRing/BirthChartWheel/Tarot kart açma için aria-label var.
- [ ] **Mevcut karneler** açılıyor, render bozulmuyor, share çalışıyor.
- [ ] **Performans**: LCP < 2.5sn (mobile, throttled 3G), CLS < 0.1, total blocking time < 200ms.
- [ ] **Bundle size delta**: +< 80 kB gzipped (Framer Motion 30 + haptics fallback 2 + theme system 4 + diğer).
- [ ] **Visual regression**: 7 ekran × 2 tema × 2 viewport (mobile, desktop) = 28 screenshot kayıt + delta < 5%.
- [ ] **Apple Design Award**: jüri perspektifi check — "memorable, intentional, accessible, inclusive" 4 boyutta net iyileşme var mı? Lumy/Crouton paternleri uygulandı mı?

---

## Ekler

### A. Kaynak özeti

- [Apple Design Awards 2025 winners](https://developer.apple.com/design/awards/2025/) — kategoriler ve referans uygulamalar
- [Apple Design Awards 2024 winners](https://developer.apple.com/design/awards/2024/) — Procreate Dreams, Crouton, Gentler Streak, Rooms
- [Apple HIG — Materials & Liquid Glass](https://developer.apple.com/design/human-interface-guidelines/materials) — nav vs content katmanlama
- [Liquid Glass redefining hierarchy](https://www.createwithswift.com/liquid-glass-redefining-design-through-hierarchy-harmony-and-consistency/) — pratik uygulama
- [Apple HIG — Color & semantic colors](https://developer.apple.com/design/human-interface-guidelines/color) — light/dark adaptasyon
- [Apple HIG — SF Symbols](https://developers.apple.com/design/human-interface-guidelines/foundations/sf-symbols) — sembolik dil
- [iOS Accessibility 2025](https://medium.com/@david-auerbach/ios-accessibility-guidelines-best-practices-for-2025-6ed0d256200e) — Dynamic Type, Reduce Motion
- [Inclusive Dark Mode (Smashing 2025)](https://www.smashingmagazine.com/2025/04/inclusive-dark-mode-designing-accessible-dark-themes/) — halation, near-black surfaces
- [Headspace case study (MetaLab)](https://www.metalab.com/work/headspace) — emotional onboarding, soft palette
- [Co-Star design analysis (DeMagSign)](https://medium.com/demagsign/how-the-design-of-the-astrology-app-co-star-is-conquering-the-masses-d6b6d235c806) — monokrom + serif tipografi
- [Motion.dev smooth tabs](https://motion.dev/tutorials/react-smooth-tabs) — shared element layoutId pattern
- [iOS 2025 UX trends](https://medium.com/@bhumibhuva18/hot-ios-2025-ux-trends-micro-interactions-fluid-animations-and-design-principles-developers-b52673769cd6) — haptic + physics + intentional motion
- [Mindfulness app design trends 2026](https://www.bighuman.com/blog/trends-in-mindfulness-app-design) — sage/sand/stone natural palette
- [Tailwind v4 theming + semantic tokens](https://medium.com/@sir.raminyavari/theming-in-tailwind-css-v4-support-multiple-color-schemes-and-dark-mode-ba97aead5c14) — semantic token strategy

### B. Component'lere göre özetlenmiş değişim listesi

| Component | Değişim | Effort |
|---|---|---|
| `app/layout.tsx` | `<ThemeProvider>` wrapper + `<html className={theme}>` | S |
| `app/globals.css` | Light mode vignette + drift + scrollbar; `:root` vs `.dark` ayrımı | M |
| `tailwind.config.ts` | 8 light token, `darkMode: 'class'` | S |
| `components/TopBar.tsx` | `<ThemeToggle />` ekle, `bg-bg/65` light variant | S |
| `components/CosmicBackground.tsx` | Light variants (dawn, paper, vellum) | M |
| `components/SpaceIntro.tsx` | Light mode için renk uyumu | S |
| `components/ReportCard.tsx` | `variant: 'galaxy' | 'paper'` prop | M |
| `components/CompatibilityView.tsx` | `layoutId` tab pill + staggered ring enter + Tarot flip | L |
| `components/CharacterStats.tsx` | Light mode renk uyumu (gradient'i kâğıt versiyonu) | M |
| `components/ConceptCard.tsx` | Spring animation + dark/light renkler | S |
| `components/StarTreeOfLife.tsx` | `useReducedMotion()` fallback statik | M |
| `components/SolarSystem3D/Scene.tsx` | RM ON ise rotation 0, default lazy | M |
| `components/BirthChartWheel.tsx` | Light mode renk varyantı | M |
| `components/CosmicLoader.tsx` | Theme-aware renkler | S |
| `app/birth/page.tsx` | 4-step stepper + BreathPrompt | L |
| `app/report/page.tsx` | 3 katman böl, 3D default collapsed | M |
| `app/compatibility/page.tsx` | Hafif düzenleme, body değişmedi | S |
| `app/match/page.tsx` | InviterMiniChart + TwoStarsMeet | M |
| `app/premium/page.tsx` | Live Activity SVG mockup | S |
| `app/glossary/page.tsx` | Search + alphabetic strip | M |
| **Yeni** `lib/haptics.ts` | tap('light'/'medium'/'heavy') | S |
| **Yeni** `lib/a11y.ts` | useReducedMotion hook | S |
| **Yeni** `lib/theme.ts` | ThemeContext + provider + toggle | S |
| **Yeni** `components/ThemeToggle.tsx` | TopBar pill + settings segmented | S |
| **Yeni** `components/NowSky.tsx` | Hero altı 3-cell live data strip | M |
| **Yeni** `components/BirthStepper.tsx` | 4-step form | M |
| **Yeni** `components/TwoStarsMeet.tsx` | Match loader | M |
| **Yeni** `components/Skeleton.tsx` | Loading state | S |

---

## Notlar

- Bu plan **mevcut yapıyı korur** — store, types, lib/, supabase, payments hiçbir değişiklik gerektirmez.
- **Galaktik karanlık tema marka DNA'sı kalır**; light mode ikinci dil.
- ReportCard share görseli her zaman karanlık variant — viral motor bozulmaz.
- Capacitor iOS build 14 günlük sprint sonunda smoke test edilebilir; production submission Apple sırasında.
- Sprint planı tek geliştirici (frontend + design) için. İki kişi varsa sprint 7 güne sıkışır.
