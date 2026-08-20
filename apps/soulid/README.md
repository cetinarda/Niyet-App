# SoulProfile

> Doğduğunda yıldızlar sana ne söylüyordu?

Doğum verisinden 9 sistemi sentezleyen kişisel iç gözlem aracı. Tek seferlik
**$4.99** (web ve iOS). Web Next.js + iOS Capacitor wrapper. 3D solar sistem,
ikili uyum karşılaştırması, AI üretimli derin anlatım dahil.

## iOS Build (Apple Store)

```bash
# Mac'te:
chmod +x scripts/prepare-ios.sh
./scripts/prepare-ios.sh
```

Detay: [docs/APP_STORE_LESSONS.md](docs/APP_STORE_LESSONS.md) (KRITIK — 4.3 spam
reddedilmesinden nasıl kaçılır) + [docs/APP_STORE_SUBMISSION.md](docs/APP_STORE_SUBMISSION.md).

## Özellikler

- ✦ **Yıldız Kökeni:** Pleiadyalı, Siryan, Arkturian, Andromedan, Lyran, Orion,
  Venüsyen, Hadarian, Mintakan, Galaktik Federasyon Elçisi.
- 🌙 **Astroloji:** Güneş, Ay, Yükselen, 10 gezegen, Kuzey/Güney Ay Düğümü, 12 ev.
- ◇ **Human Design:** Tip, Strateji, Otorite, Profil, Enkarnasyon Kapısı.
- ⌖ **Numeroloji:** Yaşam Yolu (master 11/22/33), İfade, Ruh Arzusu, Kişisel Yıl.
- ☼ **3 Görev:** Kuzey Düğüm + Yaşam Yolu + Human Design sentezi.
- 📸 **Paylaşılabilir karne:** 9:16 storyformat PNG, indir + paylaş.

## Yığın

- **Next.js 14** App Router (static export'lu — Netlify dostu)
- **React 18 + TypeScript**
- **Tailwind CSS v3** (özel galaktik renk paleti + starfield CSS)
- **astronomy-engine** (saf JS, gezegen efemerisi)
- **Custom Human Design engine** (64 kapı, 36 kanal, 9 merkez)
- **html-to-image** (karne PNG export)
- **Supabase** (auth + Postgres + RLS)
- **Anthropic Claude API** (anlatım üretimi, fallback'li)
- **Zustand** (state)

## Hızlı başlangıç

```bash
npm install
cp .env.example .env.local
# .env.local'a Supabase + Anthropic key'leri ekle
npm run dev          # http://localhost:3000
npm run build        # production build
npm start            # production server
```

## Proje yapısı

```
app/                  Next.js App Router sayfaları
  layout.tsx          Root layout (TopBar + Footer)
  page.tsx            Welcome
  birth/page.tsx      Doğum formu (fotoğraf + geocoding)
  report/page.tsx     Karne + paylaş/indir
  privacy/, terms/, cookie/, data/, support/, contact/, about/, glossary/, premium/
components/
  TopBar.tsx          Sticky web header
  Footer.tsx          3 sütunlu footer + disclaimer
  CosmicBackground.tsx
  ReportCard.tsx      9:16 paylaşılabilir karne (html-to-image ile capture)
  PageLayout.tsx      Yasal/info sayfaları için ortak şablon
lib/
  astrology/          Gezegenler + ASC/MC + Kuzey/Güney Düğüm
  human-design/       64 kapı + kanal + merkez
  numerology/         Yaşam Yolu (master sayılarla) + Kişisel Yıl + İfade
  galactic/           Yıldız ırkı arketipleri
  missions/           3 görev sentezi
  narrative/          Claude prompt + fallback
  biorhythm/          23/28/33 günlük döngüler
  geocoding/          Open-Meteo (anahtar gerektirmez)
  share/              html-to-image + Web Share API
  supabase/           İstemci
  content/            Sözlük + numeroloji/astroloji metinleri
  report/             Orchestrator
  store.ts            Zustand
  theme.ts, types.ts
supabase/migrations/  RLS'li profiles + reports + subscriptions
marketing/            GTM + Brand Bible + ASO+Paid + Influencer Outreach
docs/                 SETUP + PREMIUM_ROADMAP
```

## Deploy (Netlify)

`netlify.toml` ile pre-konfigüre. Push'ta otomatik build:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

Environment variables (Netlify Site settings → Environment):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, webhook'lar için)
- `ANTHROPIC_API_KEY` (server-only, /api/ai Edge routes)
- `STRIPE_SECRET_KEY` (server-only)
- `STRIPE_WEBHOOK_SECRET` (server-only)
- `REVENUECAT_WEBHOOK_SECRET` (server-only)
- `NEXT_PUBLIC_REVENUECAT_IOS_KEY`, `NEXT_PUBLIC_REVENUECAT_ANDROID_KEY` (public-by-design)
- `NEXT_PUBLIC_STRIPE_PRICE_UNLOCK` (public-by-design)
- `NEXT_PUBLIC_APP_URL`

## iOS App (yol haritası)

Bu repo şu an web odaklı. iOS uygulaması için:
1. `mobile/` dizini olarak ayrı Expo workspace ekle
2. `lib/` (pure JS) dosyalarını mobile/lib'e symlink veya monorepo paket olarak paylaş
3. ReportCard'ı `react-native` + `react-native-view-shot` ile yeniden yaz
4. Web Share yerine `expo-sharing`, `expo-image-picker`, `expo-media-library`

## Lisans

Tüm hakları saklıdır. © SoulProfile.
