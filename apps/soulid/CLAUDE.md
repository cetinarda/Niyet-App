# SoulProfile — Çalışma Notları

> Bu dosya bu repoda gelecek tüm Claude oturumları için referanstır.
> Önce buraya bak.

## Vizyon

**"Doğduğunda yıldızlar sana ne söylüyordu?"** — 9 farklı sistemin sentezinden
çıkan tek bir kozmik kimlik. Web ve iOS (Capacitor wrap).

## Yığın (mevcut, çalışıyor)

- **Next.js 14.2.35** App Router (Netlify ile `@netlify/plugin-nextjs`)
- **React 18.3 + TypeScript**
- **Tailwind CSS v3** + özel galaxy/cosmic/aurora gradyanları + starfield CSS
- **astronomy-engine** (saf JS, native binding YOK)
- **three.js + @react-three/fiber + @react-three/drei** (3D solar sistem)
- **html-to-image** (karne PNG export)
- **Supabase** (auth + Postgres + RLS — opsiyonel, localStorage'a fallback var)
- **Groq** (ÜCRETSİZ) `llama-3.3-70b-versatile` — anlatım metinlerinde birincil sağlayıcı
- **Anthropic Claude API** model: `claude-sonnet-4-6` — yedek + premium derin analiz
- **Stripe Checkout** (web ödeme, Edge runtime API route)
- **Capacitor 6** (iOS wrap için yapılandırma hazır, paketler henüz yüklenmedi)
- **Zustand** state

## Yapı

```
app/                  Next.js App Router sayfaları
  layout.tsx          TopBar + PromoBanner + Footer
  page.tsx            Welcome ("Doğduğunda yıldızlar sana ne söylüyordu?")
  birth/page.tsx      Doğum formu + CosmicLoader
  report/page.tsx     3D Solar Sistem + Yıldız Yaşam Ağacı + Karakter Stat +
                      Karne (paylaşılabilir) + AI Anlatın (7 bölüm) +
                      Tıklanabilir kavram kartları + Premium teaser
  history/page.tsx    Geçmiş karneler (localStorage / Supabase)
  settings/page.tsx   JSON export + verimi sil + abonelik
  premium/page.tsx    SKU kartları + Stripe Checkout (iOS'ta RC IAP'a yönlendirir)
  api/checkout/       Stripe Checkout Session create (Edge runtime)
  privacy / terms / cookie / data / support / contact / about / glossary

components/
  TopBar.tsx, Footer.tsx, PromoBanner.tsx
  CosmicBackground.tsx (starfield CSS + gradyan)
  CosmicLoader.tsx (20-sistem reveal yükleme ekranı)
  PageLayout.tsx (yasal/info sayfaları ortak)
  ReportCard.tsx (paylaşılabilir 9:16, 5 ek sistem dahil)
  BirthChartWheel.tsx (2D zodyak çarkı, gezegen pozisyonları)
  StarTreeOfLife.tsx (doğum→bugün animasyon, replay butonlu, 14sn ease)
  CharacterStats.tsx (10 stat, Sun/Moon/Asc/HD/Life Path tabanlı)
  ConceptCard.tsx (tıklayınca modal açan kavram kartı)
  SolarSystem3D/ (Scene + planetMeta + index, three.js + r3f)

lib/
  astrology/          gezegenler + ASC (Swiss formülü ile fix) + MC + Nodes
  astrology/timeline.ts  Yıldız Ağacı için yaşam boyu snapshots
  human-design/       64 kapı, 36 kanal, 9 merkez, tip/strateji/otorite/profil
  numerology/         master sayılarla life path + personal year + expression
  galactic/           10 yıldız ırkı arketipi
  systems/            maya, vedic, chinese, norse, tarot (5 sistem)
  missions/           3 görev sentezi
  narrative/          Claude prompt + parse + fallback (7 bölüm)
  biorhythm/          23/28/33 günlük döngüler
  geocoding/          Open-Meteo (anahtarsız)
  share/              html-to-image + Web Share API
  supabase/           client + reports (kayıt/listele/sil)
  payments/           SKU tanımları + Stripe checkout helper
  content/            numeroloji, astroloji, çakra, glossary, signs
  report/             tüm modülleri orkestre eden builder
  stats/              karakter stat hesabı + meta
  concepts.ts         11 kavram için kart içeriği
  feature-flags.ts    isLaunchPromoActive (LAUNCH_PROMO_END = 2026-09-01)
  platform.ts         iOS Capacitor tespiti (Apple guideline 3.1.1 koruması)
  store.ts            zustand
  theme.ts, types.ts

supabase/migrations/  0001_init.sql (profiles/reports/subscriptions)
                      0002_payments.sql (stripe_customers + entitlements + RLS)

public/
  manifest.json       PWA manifest (Apple Web App standalone)
  icon.svg            1024 brand mark
  og-image.svg        1200x630 sosyal kart

capacitor.config.ts   Bundle ID life.soulprofile.app, iOS yapılandırma

marketing/
  GO_TO_MARKET.md, BRAND_BIBLE.md, ASO_AND_PAID.md,
  INFLUENCER_OUTREACH.md, CONTENT_CALENDAR.md

docs/
  SETUP.md, PREMIUM_ROADMAP.md, PRODUCT_ROADMAP.md (12 ay),
  MULTI_SYSTEM_IDENTITY.md (20 sistem teknik spec),
  IOS_WRAPPER.md (Capacitor kurulum + 10 iOS bug çözümü),
  PAYMENT_INTEGRATION.md (RevenueCat + Stripe full spec, kopya-yapıştır kod),
  APP_STORE_SUBMISSION.md (1194 satır submission paketi)
```

## Bilinen kritik bug çözümleri

### ASC (Yükselen) 180° flip bug — DÜZELTİLDİ
`atan2(-cos, sin*cos+tan*sin)` formülü tutarlı şekilde DSC veriyordu.
Doğru formül (flatlib/Swiss Ephemeris):
```ts
atan2(cos(ramc), -(sin(ramc) * cos(eps) + tan(phi) * sin(eps)))
```
Doğrulama: 07.04.1988 23:05 Kayseri → Yay ✓ (eski: İkizler, 180° off).
Test: `node scripts/debug-asc.mjs` — 3 reference case (Kayseri/İstanbul/NYC).

## Yeni bir uygulama açtığımızda KAÇIRMA

### 1. Yığın seçimi
- **Web-first deploy hedefliyorsan:** Next.js + Tailwind + React → Netlify auto-detect
- **iOS + Web isteğin varsa ve Netlify deploy şartsa:** Next.js (web) + Capacitor wrap. RN ya da Expo Web YAPMA.
- **Expo Web + Netlify YAPMA:** Transitive dep çatışmaları her seferinde patlar.

### 2. Netlify deploy gereksinimleri
- `netlify.toml`: NODE_VERSION 20, `@netlify/plugin-nextjs`
- `.nvmrc` ile Node 20 sabitle
- `package-lock.json` HER ZAMAN `npm install` ile üret, `--package-lock-only` KULLANMA
- API route varsa Edge runtime tercih et (`export const runtime = 'edge'`)

### 3. Web navigation + zorunlu sayfalar (App Store + Play Store + GDPR)
Her tüketici uygulaması için BAŞTAN kur:
- TopBar (sticky, backdrop-blur, mobil hamburger)
- Footer (3 sütun: Ürün/Kurum/Yasal + brand col + disclaimer)
- Sayfalar: privacy, terms, support, contact, about, cookie, data, glossary

### 4. Yasal disclaimer
Spiritüel/sağlık/finans: MUTLAKA
> "Eğlence ve farkındalık amaçlıdır. Tıbbi/psikolojik/finansal tavsiye yerine geçmez."

Footer + karne alt köşesi + ToS — 3 yerde tekrar.

### 5. Hassas veri ele alımı
- Doğum tarihi/saati/yeri = hassas
- 16 yaş altı yasak
- Hesap silme akışı MUST HAVE → `/settings`
- JSON export (data portability) MUST HAVE

### 6. AI / Claude entegrasyonu
- Anthropic SDK SADECE server-side: `/api/ai/*` Edge route'lar arkasında.
- Client `lib/narrative/index.ts`, `lib/compatibility/narrative.ts`,
  `lib/compatibility/deep-analysis.ts` `fetch` ile route çağırır.
- Env: `ANTHROPIC_API_KEY` (server-only, NEXT_PUBLIC_ önekisiz).
- Rate limit token bucket Edge isolate'inde + premium gate (deep-analysis).
- Capacitor iOS: `lib/api-base.ts` absolute URL `https://soulprofile.life`.
- Fallback narrative her zaman olsun (yapılandırılmış 7 bölüm şeması).
- **Sağlayıcı zinciri** `app/api/ai/_shared.ts` → `generateText()`:
  varsayılan **Groq (ücretsiz) → Anthropic (ücretli) → statik fallback**.
  `preferQuality: true` sırayı ters çevirir (premium `deep-analysis` bunu kullanır —
  parası ödenmiş özellikte kalite önce).
  `validate` callback'i çıktıyı doğrular; Llama katı bölüm formatına uymazsa
  o çıktı REDDEDİLİR ve sıradaki sağlayıcı denenir (sessiz bozuk metin yerine).
- Env: `GROQ_API_KEY` (ücretsiz, kredi kartsız), opsiyonel `GROQ_MODEL` ile model ez.
- **Groq görsel ÜRETMEZ** — sadece metin/vision-input/STT/TTS. Portre için ayrı
  görsel modeli gerekir (`OPENAI_API_KEY` → gpt-image-1, `/api/ai/portrait`).
- Route'larda prompt üretimi de `try` İÇİNDE olmalı — dışarıda kalırsa bozuk veri
  502+`useFallback` yerine 500 HTML döndürür ve istemci fallback sinyalini kaybeder.
- Model: `claude-sonnet-4-6`. Ucuz için `claude-haiku-4-5-20251001`.

### 7. Paylaşılabilir görsel (viral mekanik)
- 9:16 storyformat (1080×1920 hedef)
- Web: `html-to-image` `toPng()` + Web Share API + fallback download
- iOS: `@capacitor/share` + capture node
- Karnenin alt köşesine her zaman URL koy

### 8. Apple App Store
- Bundle ID: `life.soulprofile.app`
- Capacitor wrap için `docs/IOS_WRAPPER.md` adımlarını izle
- IAP için `docs/PAYMENT_INTEGRATION.md` + RevenueCat
- Submission için `docs/APP_STORE_SUBMISSION.md` checklist (30 madde)
- iOS'ta Stripe BUTONUNU GİZLE — `lib/platform.ts` ile (`isCapacitorNative()`)

### 9. Marketing dokümanları
Her tüketici uygulaması için `marketing/` altına:
- GO_TO_MARKET, BRAND_BIBLE, ASO_AND_PAID, INFLUENCER_OUTREACH, CONTENT_CALENDAR

### 10. Test edilecek minimum senaryolar
- Doğum saati bilinmeyen kullanıcı
- Yurt dışı doğum (timezone otomatik gelmeli)
- Master numara (11/22/33) düşmemeli
- ASC: 07.04.1988 23:05 Kayseri → Yay (regresyon testi)
- Karne PNG export (html-to-image quirk: external image CORS dikkat)
- Mobile responsive (özellikle TopBar hamburger, 3D sahne)
- Hesap silme akışı
- Stripe Checkout (env değişkenleri lokal'de bile çağrılabilmeli)

## Hatalar ve Çözümler

| Hata | Çözüm |
|---|---|
| `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` | Node 20'ye düş (`.nvmrc` + `netlify.toml`) |
| `--no-experimental-strip-types is not allowed` | Node 20'de yok, NODE_OPTIONS'tan kaldır |
| `npm ci` lockfile mismatch | Tam `npm install` ile lockfile üret, `--package-lock-only` KULLANMA |
| Expo peer dep çakışması | Next.js'e geç |
| `sweph` native binding web'de patlıyor | `astronomy-engine` (saf JS) |
| Anthropic key tarayıcıya sızar | Sadece server-side: `/api/ai/*` Edge route + `ANTHROPIC_API_KEY` |
| Tailwind class'lar build'de uçuyor | `tailwind.config.ts` content array'inde `lib/**/*.tsx` de olmalı |
| ASC 180° yanlış (DSC veriyor) | flatlib formülü: `atan2(cos, -(sin*cos+tan*sin))` |
| Capacitor config tsc hatası | tsconfig.json `exclude`'a ekle |
| three.js Suspense crash | Her gezegeni ayrı `<Suspense>` ile sar |
| iOS "Take Photo → crash" (App Store 2.1a) | `Info.plist`'te `NSCameraUsageDescription` eksik. `npm run ios:plist` (cap:sync/cap:ios otomatik çağırır) — `scripts/ios-plist-patch.mjs` zorunlu usage string'leri idempotent ekler |
| IAP "not submitted for review" (2.1b) | App Store Connect'te her IAP'ye **App Review Screenshot** yükle + ürünü version'a bağla → binary ile birlikte submit. Detay: `docs/APP_STORE_UPLOAD.md` "RED DÜZELTMELERİ" |
| IAP akışında hata mesajı (2.1b red) | `NEXT_PUBLIC_*` BUILD ANINDA gömülür. `NEXT_PUBLIC_REVENUECAT_IOS_KEY` build'de yoksa `initIAP()` sessizce çıkar → `buyOnNative()` `IAP_NOT_READY` → reviewer ekranda hata görür. `scripts/build-capacitor.mjs` artık anahtar yoksa build'i DURDURUR (`ALLOW_MISSING_IAP=1` ile bypass, o binary submit EDİLEMEZ) |
| İzin diyalogları uygulama diliyle aynı değil (Guideline 4 red) | Uygulama tr+en lokalize ama `Info.plist` taban metinleri Türkçe'ydi → İngilizce cihazda İngilizce UI + Türkçe izin diyaloğu. `npm run ios:plist` artık taban metni **İngilizce**'ye sabitler + `en.lproj`/`tr.lproj/InfoPlist.strings` üretir + `CFBundleLocalizations` ekler. **Xcode'da .lproj klasörlerini proje ağacına eklemeyi UNUTMA** (Target Membership → App), yoksa binary'ye girmez |
| Ham hata kodu kullanıcıya gösteriliyor | `IAP_NOT_READY` gibi geliştirici string'leri ekrana basılmamalı. `app/premium/page.tsx` → `iapErrorText()` ile lokalize, anlaşılır metne çevir; ham kodu `console.warn`'a bırak |
| iOS'ta default Capacitor logosu çıkıyor | `cap add ios` taze default ikon koyar; marka ikonu ayrı üretilir. `npm run icons:generate` (`assets/icon.png` 1024² → AppIcon). cap:sync/cap:ios/cap:add:ios artık otomatik çağırır |
| Capacitor build `/api/verify-session` static export patlatıyor | `build:ios` → `scripts/build-capacitor.mjs` orkestratörü kullanılmalı (app/api'yı build sırasında geçici taşır). Naif `BUILD_TARGET=capacitor next build` KULLANMA |
| Profil oluşturulamıyor → "Create Profile" ekranına geri dönüyor (App Store 2.1a) | Doğum yeri çözümü tek dış servise (Open-Meteo) bağlıydı; review ağında yavaş/engelli olunca lat/lng boş → submit takılı kalıyordu. `lib/geocoding/cities.ts` offline gazetteer + timeout eklendi; ağ boş dönerse yerel şehir listesinden çözülür (`geocodePlace` fallback) |
| IAP satın alma `error 8` / INVALID_RECEIPT (2.1b) | Kod değil, config. En olası: Xcode scheme'i `resources/Products.storekit`'i kullanıyor (sahte receipt). Ayrıca abonelik için App-Specific Shared Secret eksik olabilir. Tam runbook: `docs/APP_STORE_UPLOAD.md` "receipt error 8" bölümü |

## Branş kuralı

Bu repoda geliştirme branch'i: `claude/cosmic-birth-chart-app-DW89I`.
Tüm commit ve push'lar bu branş'a.
