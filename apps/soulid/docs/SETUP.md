# SoulProfile — Kurulum & Çalıştırma

## Hızlı başlangıç (Mac, lokalde)

```bash
git clone <repo>
cd SoulProfile
npm install
cp .env.example .env
# .env'ye Supabase URL, Anon Key ve Anthropic API key ekle
npm run web        # tarayıcıda aç
npm run ios        # Xcode + iOS Simulator
```

## Asset hazırlığı

`assets/README.md` içindeki dosyaları yerleştir:
- `icon.png`, `splash.png`, `adaptive-icon.png`, `favicon.png`
- `fonts/Inter-Regular.ttf`, `fonts/Inter-Bold.ttf`, `fonts/CormorantGaramond-SemiBold.ttf`

## iOS — Xcode'da test

```bash
npm install
npx expo prebuild --platform ios
open ios/SoulProfile.xcworkspace
```

Xcode'da:
1. Signing & Capabilities → kendi Apple ID'ni seç (free dev cert yeter)
2. Bundle ID'yi `life.soulprofile.app` olarak bırak veya kendi ID'ne çevir
3. Top bar'dan iPhone 15 Simulator seç → ▶ Run

TestFlight için:
1. App Store Connect'te uygulamayı oluştur
2. EAS Build kullan: `npx eas build --platform ios --profile production`
3. `eas submit --platform ios`

## Web — statik dağıtım

```bash
npm run build:web
# dist/ dizinini Vercel/Netlify/Cloudflare Pages'a deploy et
npx vercel deploy dist --prod
```

## Supabase backend

1. https://supabase.com → yeni proje (free tier yeterli)
2. Project URL ve Anon Key'i `.env`ye koy
3. SQL Editor'de `supabase/migrations/0001_init.sql` içeriğini çalıştır
4. Storage → `avatars` bucket'ı oluştur (public read, authenticated write)

## Claude API

1. https://console.anthropic.com → API key al
2. `.env`ye `EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-...` koy
3. **PRODÜKSİYON UYARISI:** Anahtar istemcide expose edilir. Canlıya çıkmadan önce
   bir Supabase Edge Function (Deno) arkasına taşı ve istemci sadece function'ı
   çağırsın. `lib/narrative/index.ts` içindeki Claude çağrısı kolayca proxy'ye geçirilir.

## RevenueCat (premium için)

1. https://www.revenuecat.com → projeyi bağla
2. App Store Connect'te abonelik ürünleri oluştur (haftalık/aylık/yıllık)
3. `npx expo install react-native-purchases`
4. `lib/iap/` modülü oluştur ve paywall ekranı bağla.

## Doğum hesaplamaları hakkında

- **Ascendant / MC:** Standart Meeus formülleri ile hesaplanır (`lib/astrology/index.ts`).
- **Ev sistemi:** MVP'de Equal House. Placidus için ileride yerel hesap eklenecek.
- **Kuzey/Güney Düğüm:** Mean Node (ortalama düğüm) — Meeus tablo formülü.
- **Human Design:** 64 kapı + 36 kanal + 9 merkez. Tasarım Güneş'i ortalama 88° geriden
  hesaplanır. Tam Swiss Ephemeris doğruluğu için ileride backend hesabına taşınabilir.

## Geliştirme akışı

```bash
npm run typecheck    # TS kontrolleri
npm run lint         # Expo lint
npm run test         # jest (henüz testler yok)
```

## Test edilecek senaryolar

- [ ] Doğum saati bilinmeyen kullanıcı (Yükselen hesabı zarif fallback yapmalı)
- [ ] Yurt dışı doğum (timezone autocomplete'in yakaladığını doğrula)
- [ ] Master numara (11, 22, 33) düşmüyor mu kontrol et
- [ ] iOS / web aynı kullanıcı için aynı sonuç vermeli
- [ ] Karne görselini paylaş (iOS share sheet açılmalı)
- [ ] Karne görselini galeriye kaydet (iOS izin akışı)
