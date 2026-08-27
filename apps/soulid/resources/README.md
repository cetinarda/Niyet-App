# SoulProfile iOS Asset Pipeline

Kaynak SVG'ler `assets/` dizininde — `@capacitor/assets` doğrudan SVG okur,
PNG'e çevirmen gerekmez.

## Kaynak dosyalar

`@capacitor/assets` v3 dosya adlarına bağlı — bu isimlerden sapma:

- `assets/icon-only.svg` — 1024×1024 ana ikon (kare çerçeve + 2 nokta marka)
- `assets/icon-foreground.svg` — Android adaptive foreground
- `assets/icon-background.svg` — Android adaptive background
- `assets/splash.svg` — 2732×2732 splash (logo ortada)

Apple guideline 9.3: kaynağa yuvarlak köşe çizmeyin — iOS mask uygular.

## Üretim

```bash
npx @capacitor/assets generate --ios \
  --iconBackgroundColor '#07091a' \
  --iconBackgroundColorDark '#07091a' \
  --splashBackgroundColor '#07091a' \
  --splashBackgroundColorDark '#07091a'
```

Çıktı `ios/App/App/Assets.xcassets/AppIcon.appiconset/` ve
`Splash.imageset/` altına yazılır.

Cap sync sırasında bunlar Xcode'a otomatik yansır.
