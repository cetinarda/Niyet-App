# Sakin Hayvan — embed source (monorepo)

Bu, **Sakin Hayvan Rehberi** uygulamasının kaynağıdır. Niyet-App monorepo'sunun
parçası: `apps/hayvan/`. Buradan derlenen web bundle `public/embedded/sakinhayvan/`
altına gider ve Sakin host'u (sakin.life / iOS) tarafından iframe ile gömülür.

## Derleme

Repo kökünden:
```
npm run build:hayvan          # expo export → public/embedded/sakinhayvan (byte-identical değilse YAZMAZ)
npm run build:hayvan -- --force   # yeni bundle'ı bilerek gönder
```
`scripts/build-embed.mjs` + kökteki `build-embed` pipeline'ı kullanılır.

## Önemli notlar

- **`metro.config.js`** web'de `react-native-purchases` (iOS-only IAP) modülünü
  stub'lar → web tek bundle olur (host IAP'yi kendi yönetir). Bunu silme.
- **Köprü:** Embed, host ile aynı origin'de çalışır. `readSakinBridge()`
  (`src/store/useStore.ts`) host'un yazdığı `sakin_name` / `sakin_birth_date` /
  `sakin_birth_time` / `sakin_birth_city` anahtarlarını **senkron** okur ve
  onboarding'i atlar. Eski `@tura_profile` preemptive-write hack'ine ihtiyaç yok.
- **Storage anahtarları** `@sakinhayvan_*` (eski `@tura_*`'tan yeniden adlandırıldı).
- **Marka:** "Tura" eski iç isimdi; kod artık `useSakinHayvanStore` + Sakin Hayvan
  metinleri kullanır. Kullanıcıya görünen ad app.json'da "Sakin Hayvan Rehberi".

## İçerik

- `src/data/animals.json` — hayvan rehberlikleri (TR+EN)
- `src/data/stones.json`, `naguals.json`, `quotes.json` — taş/nagual/söz içerikleri
- Ekranlar: Home (Bugün), AnimalsHub, Nagual, Archive, Myths, Profile, Paywall, Auth
- `src/utils/` — numerology, humanDesign, weeklyReading
