# Sakin Mitler

Jung'un izinde günlük arketip, mit ve imge okuması.

Her gün üç deste açılır:

- **Arketipler**: Jung, Pearson, Moore-Gillette ve mitolojik kökenleri ile evrensel insan desenleri (Persona, Gölge, Anima/Animus, Self, Kahraman, Trickster, İç Çocuk, Anne, Baba, Aşık, Şifacı, Büyücü, Soytarı, Cadı, Şaman ve daha fazlası).
- **Mitler**: Yunan, Mısır, Sümer, Türk, İskandinav, Hindu, Budist, Aztek, Kelt, Japon, And, Afrika, Lakota ve Sufi geleneklerinden derin hikayeler (Prometheus, İnanna, Gılgamış, Osiris, Pandora, Theseus, Orpheus, Türeyiş, Hızır, Mesnevi, Quetzalcoatl, Pachamama, Lilith ve daha fazlası).
- **İmgeler**: Mandala, Yılan (Ouroboros), Ağaç, Su, Ay, Güneş, Dağ, Mağara, Köprü, Kapı, Yıldız, Yumurta, Kalp, Üçüncü Göz, Spiral, Haç, Anahtar, Kuş, Ateş, Pota, Labirent, Saat, Kitap, Lotus, Kelebek...

Her kart iki ayrı yorumla gelir:

- **🌙 Rüyada Görülürse**: Sembol rüyanda göründüğünde bilinçaltının ne demek istediği.
- **☀ Gerçek Hayatta Yaşanırsa**, Aynı sembol uyanık hayatta karşına çıktığında nasıl yorumlanabilir.

## Geliştirme

```bash
npm install
npm start
```

## App Store (iOS) submission

Niyet-App ile aynı manuel Xcode iş akışı, `expo prebuild` → Xcode Archive → App Store Connect Upload. Detay: `app-store-docs/app-store-submission-guide.md`.

```bash
# 1. iOS native projeyi üret (ios/ klasörü repo'da committed)
npm run prebuild
cd ios && pod install && cd ..

# 2. Xcode'da aç ve archive et
npm run xcode
# Xcode → "Any iOS Device (arm64)" → Product → Archive → Distribute → App Store Connect
```

Submission metadata, açıklama, review notes, gizlilik politikası taslakları **`app-store-docs/`** klasöründe:

- `app-store-submission-guide.md`: adım adım Xcode iş akışı
- `app-store-metadata.md`: başlık, keyword, kategori, age rating
- `app-review-notes.md`: Apple'a sunulacak review notes + reddedilirse hazır cevap şablonları
- `app-store-description-TR.md` / `app-store-description-EN.md`
- `privacy-policy-TR.md`: `sakin.life/privacy`'ye yayınlanacak metin

