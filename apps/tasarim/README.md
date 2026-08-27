# Sakin Tasarım

Sakin.life ekosisteminin Human Design üyesi. Doğum gün, saat ve şehrini girerek
kendine özel bir tasarım haritası (bodygraph) oluşturur; tip, içsel yetki, profil,
tanımlı/tanımsız merkezler, kanallar ve 64 kapı üzerinden detaylı bir rapor sunar.

## Çalıştırma

```sh
npm install
npm run web        # tarayıcıda
npm run ios        # iOS simulator
npm run android    # Android emulator
```

## Yayın / Build

iOS'u App Store / TestFlight'a yüklemek için iki yol var; ikisi de hazır:

- **Lokal Xcode** (önerilen, Niyet-App ile aynı akış) → [`XCODE.md`](./XCODE.md)
- **Bulut EAS Build** (Mac yoksa) → `npm run build:ios` (bkz. [`eas.json`](./eas.json))

Sürüm çıkarma kontrol listesi: [`RELEASE.md`](./RELEASE.md)

## Yapı

- **Expo + React Native + Web** (TypeScript)
- **AsyncStorage** ile lokal saklama; doğum bilgileri sunucuya gönderilmez
- **Lokal efemerit** (Meeus tabanlı): tüm gezegen pozisyonları cihazda hesaplanır
- **react-native-svg** ile bodygraph çizimi
- Netlify üzerinden statik web build

## Özellikler

- 5 tip · 7 içsel yetki · 12 profil · 9 merkez · 36 kanal · 64 kapı detayı
- Bilinçli (Personality) ve bilinçsiz (Design) gezegen aktivasyonları
- Tanımlı / tanımsız merkez ayrımı, yanlış benlik soruları ve kazanılan bilgelik
- Inkarnasyon Haçı, Tanım türü (Single/Split/Triple/Quadruple)
- Çoklu profil desteği — sevdiklerini de ekleyebilirsin
- Günlük transit: bugünün Güneş ve Ay kapısı

## Veri & Hesaplama

- Gezegen ekliptik boylamları için düşük-orta hassasiyetli VSOP/Meeus formülleri
- Design zamanı: Personality Sun pozisyonundan 88° geride iteratif çözüm
- Gate çark sırası ekliptik 302° (Aquarius 2°) noktasından başlar

## Submission

`store/` klasörü App Store / Google Play / web yayını için hazır metinleri içerir.
Hepsi tek başına kullanılabilecek şekilde yazıldı — düzenlemeden kopyala-yapıştır
yapabilirsin.

### Dosya haritası

| Dosya | Nereye gider |
| --- | --- |
| `store/privacy-policy-tr.md` | `sakin.life/tasarim/gizlilik` sayfasına yapıştır. KVKK + KVK çerçevesi. |
| `store/privacy-policy-en.md` | `sakin.life/tasarim/privacy` sayfası (EN). GDPR + CCPA dili. |
| `store/terms-of-use-tr.md` | `sakin.life/tasarim/kosullar` sayfasına yapıştır. |
| `store/terms-of-use-en.md` | `sakin.life/tasarim/terms` sayfası (EN). |
| `store/app-store-listing-tr.md` | App Store Connect → tr-TR yerel ayarı → her alanı tek tek yapıştır. |
| `store/app-store-listing-en.md` | App Store Connect → en-US yerel ayarı. |
| `store/app-review-notes.md` | App Store Connect → App Review Information → **Notes** alanı. İngilizce. |
| `store/age-rating-questionnaire.md` | App Information → Age Rating → Edit. Cevapları soru başına eşle. |
| `store/privacy-nutrition-label.md` | App Information → App Privacy. Sonuç: **Data Not Collected**. |

### Yayın akışı

1. **Site:** `privacy-policy-*.md` ve `terms-of-use-*.md` dosyalarını sakin.life'a
   yayınla. URL'ler `https://sakin.life/tasarim/gizlilik` ve
   `https://sakin.life/tasarim/kosullar`.
2. **Apple App Store Connect:**
   - App Information → Localizable bilgiler → tr-TR ve en-US dolduruluyor
     (`app-store-listing-*.md`'den).
   - Pricing & Availability → ücretsiz, IAP yok.
   - App Privacy → `privacy-nutrition-label.md`'deki seçimleri yap, **Data Not
     Collected** yayınla.
   - App Information → Age Rating → `age-rating-questionnaire.md`'deki cevapları
     gir, 17+ çıkması beklenir.
   - App Review Information → Notes alanına `app-review-notes.md` içeriğini
     yapıştır. Sign-in gerekmez; test doğum verisini not içinde verdik.
3. **Google Play Console:** aynı metinler, Data Safety formuna
   `privacy-nutrition-label.md` mantığıyla "no data collected" işaretle, IARC
   sorularına aynı cevaplar.

### Bayrak (yapmadan submit etme)

- [ ] `info@sakin.life` ve `privacy@sakin.life` adresleri yanıt veriyor
- [ ] `sakin.life/tasarim/gizlilik` ve `sakin.life/destek` URL'leri canlı
- [ ] Uygulama içinde görünür disclaimer var ("eğitim ve kişisel keşif amaçlıdır,
      tıbbi/psikolojik tavsiye değildir")
- [ ] Ekran görüntüleri ve listing copy'sinde **fal / kehanet / horoscope /
      fortune / predict / future / destiny** kelimeleri **yok**
- [ ] Bundle id: `life.sakin.tasarim`
- [ ] Privacy Nutrition Label "Data Not Collected" işaretli
- [ ] Age Rating 17+ olarak çıkıyor

## Lisans

Özel/araştırma kullanımı.
