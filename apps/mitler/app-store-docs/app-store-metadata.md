# Sakin Mitler — App Store Connect Metadata

App Store Connect dashboard'ında "App Information" + "Pricing and Availability" + "Version Information" alanlarına aşağıdaki değerleri gir.

## App Information

| Alan | Değer |
|---|---|
| Bundle ID | `life.sakin.mitler` |
| SKU | `sakinmitler-ios-001` |
| Primary Language | Turkish (Turkey) |
| Category — Primary | **Lifestyle** |
| Category — Secondary | **Entertainment** ⚠️ *Health & Fitness SEÇME — Niyet-App bu kategori yüzünden 1.4.1+2.3.8 reddi aldı* |
| Content Rights | "Does not contain, show, or access third-party content" |
| Age Rating | **12+** (Horoscopes/Fortune Telling: Infrequent/Mild, Mature/Suggestive Themes: Infrequent/Mild) |

## Pricing & Availability

- Price: **Free** (in-app purchase yok)
- Availability: Tüm ülkeler (Türkiye + AB öncelik)
- App Distribution Method: Public on the App Store

## Trader Status (AB Zorunlu — DSA)

- Type: Trader veya Non-Trader (kişisel mi şirket mi)
- Address, Phone, Email zorunlu
- Bu adres EU App Store sayfasında **görünür** olacak

## Version 1.0.0 — Localization

### Türkçe (Turkey) — Primary

- **Promotional Text** (170 char):
  > Her gün üç sembol, içsel bir ayna. Jung'un izinde arketip, mit ve imgelerle kendine bak. Rüyalarına ve gündelik hayatına anlam katan kart destesi.

- **Description** (4000 char): bkz. `app-store-description-TR.md`

- **Keywords** (100 char, virgüllü) — sağlık iddiası içeren kelimeler yok:
  ```
  arketip,bilinçaltı,rüya,mitoloji,sembol,gölge,jung,içsel,niyet,günlük,refleks,kart
  ```

- **Support URL**: `https://sakin.life`
- **Marketing URL**: `https://sakin.life`
- **Privacy Policy URL**: `https://sakin.life/privacy`

### English — Secondary

- **Promotional Text**:
  > Three symbols a day, an inner mirror. In the footsteps of Jung, look at yourself through archetypes, myths and images. A deck that gives meaning to your dreams and daily life.

- **Description**: bkz. `app-store-description-EN.md`

- **Keywords** — no health-claim terms (no "wellness", "healing", "reiki"):
  ```
  archetype,shadow,dream,mythology,symbol,jungian,journal,reflection,depth,card,myth
  ```

## App Title & Subtitle

| Localization | Title (30) | Subtitle (30) |
|---|---|---|
| TR | `Sakin: Jung Arketip & Rüya` | `Mitler, semboller, günlük` |
| EN | `Sakin: Jungian Myths & Dream` | `Archetypes, symbols, journal` |

## Screenshots — Gerekli Boyutlar

iPhone — **6.7" (1290×2796)** + **6.1" (1170×2532)** zorunlu. (iPad supportsTablet:false olduğu için iPad gerek yok.)

5 frame stratejisi (her boyut için):

1. **Üç deste açılış** — Arketipler / Mitler / İmgeler — alt başlık: "Her gün üç sembol, içsel ayna"
2. **Detay kartı** — "Rüyada / Gerçek Hayatta" iki yorumla — Jung çerçevesini vurgula
3. **Kişisel Harita** (Numeroloji + HD) — **disclaimer overlay görünür şekilde**
4. **Arşiv / Mit Haritası** — "değişimini izle"
5. **Mitler Kütüphanesi** — "200+ arketip, mit ve sembol"

Hazırlık: `app-store-docs/screenshots/` klasörüne `6.7-01.png`, `6.7-02.png`, ..., `6.1-01.png`, ... olarak koy.

## App Privacy ("Nutrition Label")

App Store Connect → App Privacy → **"Data Not Collected"** işaretle. Gerekçe: uygulama tamamen local (AsyncStorage), network çağrısı yapmıyor, analytics yok, IAP yok, login yok.

## Encryption

- `Does your app use encryption?` → **No** (sadece HTTPS standart sistem encryption — yarıştan muaf).
- `ITSAppUsesNonExemptEncryption: false` zaten `Info.plist`'te.

## Apple Developer Account Hardening

- **Two-factor authentication** zorunlu (zaten varsa OK).
- App-specific password değil, **App Store Connect API Key** tercih edilir (gelecekteki EAS submit veya fastlane için).
