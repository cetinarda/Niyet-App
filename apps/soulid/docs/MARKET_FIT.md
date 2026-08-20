# SoulProfile — Market Fit Raporu (Sadeleştir / Ekle / Büyü)

> Hazırlanma tarihi: 2026-05-31
> Kapsam: Pazarda traction için ne kesilmeli, ne eklenmeli, nasıl büyür, nasıl
> para kazanır. Web araştırması (2025-2026 astroloji/spiritüel app pazarı) +
> mevcut repo kodunun gerçek durumu üzerine kuruludur.
> Bu doküman `PRODUCT_ROADMAP.md` ile çelişirse: roadmap 3M MAU hayalini anlatır,
> bu doküman **ilk 90 günde nasıl hayatta kalınır** sorusuna cevap verir.

---

## 0. Mevcut gerçek durum (kod okumasından)

Roadmap'in vaat ettiği değil, repoda **şu an** olan:

- **Onboarding:** `/birth` tek ekran. İlk gördüğün şey büyük bir **fotoğraf yükle**
  dairesi, sonra ad + tarih + saat + yer. Fotoğraf görsel olarak en baskın eleman.
- **Hesap yok.** `lib/entitlements.ts` saf `localStorage` sayaç. Cihaz değişince
  her şey gider. Supabase "opsiyonel". Cross-device kimlik yok.
- **Rapor (`/report`):** Tek sayfada üst üste: 3D solar sistem (three.js/r3f) →
  2D zodyak çarkı → Yıldız Yaşam Ağacı 14sn animasyon → 10'lu Karakter Stat →
  paylaşılabilir karne → AI anlatım (opening/astrology/HD/soulStory/wisdoms/
  shadows/CTA) → tıklanabilir 11 kavram kartı → uyum CTA → premium showcase.
  **Tek scroll'da 9+ ağır blok.**
- **Günlük geri dönüş kancası YOK.** Transit yok, push yok, horoscope yok.
  Karne tek seferlik üretilir, kullanıcının ertesi gün dönmesi için sebep yok.
- **Viral döngü zayıf:** Karne PNG paylaşılabiliyor ama davet/arkadaş eşleştirme
  loop'u yok. Compatibility ikinci kişinin verisini **kullanıcı kendi giriyor** —
  davet linki yok, yani yeni kullanıcı acquisition kanalı değil.
- **Monetizasyon:** Tek seferlik $4.99. Free limit = 1 karne + 1 uyum. iOS'ta
  peşin paid app (IAP yok).
- **9 sistem** ana sayfada da, karnede de tam liste olarak sunuluyor.

Bu, "demo olarak etkileyici, retention/growth motoru olarak boş" bir üründür.

---

## 1. Tek cümlelik teşhis

**SoulProfile bir "tek seferlik kimlik raporu"ndan bir "her gün dönülen kozmik
alışkanlık"a dönüşmeli — yani kesilmesi gereken tek şey "tek seferlik" zihniyeti:
hesap + günlük kanca + arkadaş daveti olmadan bu kategoride hiçbir uygulama
hayatta kalmaz, çünkü kategorinin tüm parası retention ve sosyal döngüden gelir.**

Bugünkü hâliyle SoulProfile, D1 retention'ı yapısal olarak %0'a yakın bir ürün:
kullanıcı karnesini üretir, belki paylaşır, ve dönmesi için hiçbir neden yoktur.
Co-Star 30M+ kullanıcıya bu yüzden ulaşmadı; günlük push + arkadaş grafiği
yüzünden ulaştı.
([auraeastrology.com](https://www.auraeastrology.com/blog/co-star-app-review-2026-an-astrologers-honest-opinion))

---

## 2. SADELEŞTİRİLECEKLER (kes / azalt)

### 2.1 Rapor sayfasını tek dev scroll olmaktan çıkar — "aha" anını öne al
**Ne:** `/report` şu an tek sayfada 3D + 2D wheel + Star Tree + Stats + karne +
AI anlatım + 11 kavram kartı + 2 CTA bloğu sırayla render ediyor.
**Neden:** Üç-adımlı onboarding tour'lar %72 tamamlanır, yedi-adımlılar %16.
Aynı mantık içerik yoğunluğu için de geçerli: ilk ekranda 9 ağır blok = bilişsel
yük + mobil performans çöküşü. Kullanıcının "vay be, bu benim" anı (paylaşılabilir
kart + tek cümlelik kimlik) sayfanın 6. bloğunda geliyor; çoğu kullanıcı oraya
ulaşmadan scroll'u bırakır.
**Etki (high):** İlk ekran = kimlik özeti + karne + tek CTA. Geri kalan (3D, wheel,
Star Tree, kavramlar) sekmelere/accordion'a gizlenir ("Derinleş" altında). Time-to-
aha < 10sn olur; 5 dakika içinde aha veren ürünler 30 günlük retention'da %40 daha iyi.
([appcues.com](https://www.appcues.com/blog/aha-moment-guide),
[guidejar.com](https://www.guidejar.com/blog/7-user-onboarding-best-practices-that-actually-work-in-2025))

### 2.2 Aynı anda 2D wheel + 3D solar sistemi tutma — birini seç
**Ne:** `BirthChartWheel` (2D) ve `SolarSystem3D` (three.js + r3f + drei) ikisi de
aynı veriyi gösteriyor.
**Neden:** 3D sahne mobilde en ağır yük (WebGL, texture, Suspense). İki ayrı
chart görseli bakım yükü ikiye katlar, anlam farkı kullanıcı için sıfır. Stellar
gibi data-viz appler bile tek bir kanonik görsel tutar.
**Etki (med):** 2D wheel'i varsayılan yap (hızlı, paylaşılabilir, statik export'a
uygun), 3D'yi "premium/wow" opsiyonel sekme yap. Mobil ilk-render süresi ve crash
oranı düşer. CLAUDE.md'deki "three.js Suspense crash" notu da bunu doğruluyor.

### 2.3 Yıldız Yaşam Ağacı 14sn animasyonunu kısalt veya opsiyonel yap
**Ne:** `StarTreeOfLife` 14 saniyelik ease animasyon, replay butonlu.
**Neden:** 14sn pasif bekleme, mobilde dikkat eşiğinin çok üstünde. Güzel ama
"aha" değil — kullanıcı ne gördüğünü çoğu zaman anlamıyor.
**Etki (med):** 3-4sn'ye indir, ya da rapor sayfasından çıkarıp ayrı bir "yolculuğun"
deneyimine taşı. Ana akışı yavaşlatmasın.

### 2.4 Onboarding'de fotoğrafı ilk ve baskın eleman olmaktan çıkar
**Ne:** `/birth` ilk gördüğün şey 144px fotoğraf-yükle dairesi.
**Neden:** Fotoğraf yüklemek = friction + gizlilik kaygısı + App Store 5.1.1 riski
(doğum verisi + foto kombinasyonu hassas). Roadmap risk haritası da bunu "Yüksek
impact" diye işaretlemiş. Kullanıcı "neden yüzümü istiyorsun?" diye düşünüp düşer.
**Etki (high):** Foto'yu **en sona, tamamen opsiyonel** yap (skip → galaksi avatarı).
Onboarding'in ilk adımı duygusal kanca olmalı (ad + tarih), foto değil.

### 2.5 Ana sayfada 9 sistemi tam liste olarak sıralama
**Ne:** `/` sayfası 9 sistemi tek tek kart olarak listeliyor (Vedik, Maya, Norse,
Çin, Tarot...).
**Neden:** 9 ezoterik sistem aynı anda gösterilince mesaj "karmaşık/şüpheli" olur,
"kişisel/merak uyandırıcı" değil. Co-Star'ın kazandığı yer **basitlik**:
Sun/Moon/Rising üçlüsü. 9 sistem bir **derinlik vaadi** olmalı, ön kapı değil.
**Etki (med):** Hero'da tek vaat: "Doğduğun an gökyüzü senin için ne diyordu?" +
3 ana çıktı (yıldız kökenin + bir kelimelik arketip + bugünkü enerjin). 9 sistem
"motor altında" — raporda derinleşme olarak açılır.

### 2.6 İki rakip CTA'yı (kendi karnem vs. uyum) ana sayfada eşit ağırlıkta sunma
**Ne:** Hero altında "Kendi karnen" ve "İkili uyum" yan yana iki büyük yol.
**Neden:** İlk açılışta kullanıcının kendi karnesi yok; "uyum" yolu boş bir
duvara çarpar (compatibility sayfası "önce kendi karneni oluştur" diye geri
yollar). İki eşit CTA = karar felci.
**Etki (med):** Tek birincil CTA: "Karneni oluştur." Uyum, karne **üretildikten
sonra** (en güçlü viral an) gösterilir.

### 2.7 "Tek seferlik, kimliğin sabittir" anlatısını gözden geçir
**Ne:** `/premium` ve README "Kimliğin sabittir — bir kez doğdun, bir kez
sentezlenir, tek fiyat" diyor.
**Neden:** Bu cümle ürünü **tek seferlik tüketim** olarak konumlandırıyor — yani
retention'ı kavramsal olarak öldürüyor. Pazarın tüm parası tekrar gelen değerden
(günlük transit, ay döngüleri) geliyor. (Bkz. Bölüm 6.)
**Etki (high):** Konumlandırmayı "kimliğin sabit ama **gökyüzü her gün değişiyor;
sen de değişiyorsun**" yönüne çevir.

### 2.8 PremiumGate'i sert duvar olmaktan yumuşat
**Ne:** 1 karne + 1 uyum sonrası tam blok (`PremiumGate`).
**Neden:** Sert paywall, kategorinin en çok şikayet edilen şeyi (faturalama +
"hiçbir şey göremiyorum") ile aynı algıyı yaratır. Co-Star'ın ölçeği cömert free
tier'dan geldi.
([auraeastrology.com](https://www.auraeastrology.com/blog/co-star-app-review-2026-an-astrologers-honest-opinion))
**Etki (med):** İkinci karneye kadar bloklamak yerine, ikinci karneyi göster ama
derin bölümleri (shadows, soulStory) kilitle (soft paywall).

---

## 3. EKLENECEKLER (öncelikli)

Öncelik: **P0 = ilk 30 gün (retention temeli), P1 = 30-60 gün (viral),
P2 = 60-90 gün (monetizasyon derinliği).**

| # | Pri | Özellik | Neden (mekanizma) | Effort | Etki | Rakip yapıyor mu |
|---|---|---|---|---|---|---|
| 1 | **P0** | **Hesap + cross-device sync** (Apple/Google/email; Supabase zaten kurulu) | Retention'ın ön koşulu. Hesap yoksa cihaz değişimi = %100 churn. Tüm aşağıdaki kancalar buna bağlı. | M | High | Hepsi (Co-Star, The Pattern, CHANI) |
| 2 | **P0** | **Günlük Cosmic Weather kartı + push** (Ay fazı + günün en güçlü kişisel transiti + 1 cümle) | Kategorinin #1 retention motoru. Co-Star'ın günlük push'u kültürel olay oldu, alışkanlık kurdu. Günlük dönüş sebebi = D7/D30'un tek kaynağı. `lib/astrology` + `lib/biorhythm` zaten var. | M | High | Co-Star ★, CHANI ★, Sanctuary, Nebula |
| 3 | **P0** | **Davetli arkadaş eşleştirme** (`/match/[invite]` linki; ikinci kişi KENDİ verisini girer, ikisi de sonuç + hesap alır) | Tek en güçlü viral loop. Mevcut compatibility "ben senin verini giriyorum" — yeni kullanıcı getirmiyor. Davet linki onu acquisition kanalına çevirir. The Pattern "Bond", Co-Star friend chart böyle büyüdü. | M | High | The Pattern (Bond) ★, Co-Star ★ |
| 4 | **P0** | **Tek cümlelik "soul headline" + paylaş-öncelikli kart** (karnenin en üstünde, scroll gerektirmeden) | Aha anını öne çeker, paylaşımı kolaylaştırır. "%72 Pleiadyalı Heart-Healer, Generator, Yaşam Yolu 7" gibi tek satır = ekran görüntüsü alınabilir kimlik. | S | High | Co-Star (Sun/Moon/Rising shorthand) |
| 5 | **P1** | **AI Soul Chat (yazılı)** — kendi haritasıyla sohbet (Claude, edge function arkasında) | 2025-26'nın en güçlü trendi: hyper-kişisel AI rehber. "Generic/cookie-cutter" şikayetinin panzehiri. Session süresi + premium dönüşüm sürücüsü. Anthropic SDK zaten var. | M | High | Nebula, Sanctuary, "AI astrologer" dalgası |
| 6 | **P1** | **Sesli karne / TTS özeti** (90sn günlük sesli okuma) | Voice, 2025 trend listesinin tepesinde. Ekransız tüketim = sabah rutini alışkanlığı + yüksek duygusal yoğunluk (paylaşılabilir reaction içeriği). | M | Med | CHANI (meditasyon/ses), Sanctuary |
| 7 | **P1** | **Referral programı** (3 davet → 1 ay premium / kalıcı indirim; karne PNG'sinde QR + ref kodu) | K-factor'ü doğrudan artırır; paylaşılan her kart ölçülebilir acquisition. Mevcut share var ama attribution/ödül yok. | S | Med | Çoğu büyüme-odaklı app |
| 8 | **P0** | **Streak / günlük check-in** (Duolingo mantığı: her gün açılış streak'i + ay fazına göre mikro içgörü) | Streak bozulma korkusu = en güçlü günlük açılış tetikleyicisi. Gamification astroloji applerinde retention'ı +%47 artırdı. | S | High | (Boşluk! Hiçbir büyük rakipte güçlü değil — fırsat) |
| 9 | **P2** | **Şeffaf, kolay yönetilen abonelik + tek-tık iptal** | Kategorinin #1 şikayeti faturalama/iptal/refund. Baştan dürüst paywall + görünür iptal = review puanı koruması. | S | Med | (Rakipler bunu kötü yapıyor — diferansiyel) |
| 10 | **P2** | **Aylık/yıllık döngü dashboard** (Personal Year + Solar Return temaları) | Tekrar eden değer = abonelik gerekçesi. Doğum günü/yeni yıl etrafında yüksek niyet anları. | M | Med | CHANI, Sanctuary |
| 11 | **P2** | **"Soul Year Wrapped"** (Spotify Wrapped tarzı yıllık özet, paylaşılabilir) | Yılda bir devasa organik paylaşım dalgası. Aralık/doğum günü etrafında patlama. | M | Med | (Astrolojide kimse iyi yapmıyor — fırsat) |
| 12 | **P1** | **App Store değerlendirme tetikleyici** (karne paylaşımı/streak milestone sonrası "5 yıldız ver") | ASO sıralaması review hacmine bağlı. Pozitif anda iste. | S | Med | Standart pratik |

**Not:** AI çağrılarını client'tan Supabase edge function'a taşımak (CLAUDE.md
"prod öncesi" notu) bu listenin altyapı önkoşuludur — P0 teknik borç.

---

## 4. VİRAL MEKANİK — organik büyüme tasarımı

SoulProfile'ın doğal viral varlığı **paylaşılabilir karne**. Ama bugün karne
paylaşılıyor, döngü kapanmıyor (link tıklayan kişiyi geri ölçemiyoruz, davet yok).

**Paylaşım döngüsünün optimizasyonu:**
1. Karne üretilir an = en yüksek duygusal yoğunluk → paylaş butonu o anda **birincil**
   CTA olmalı (download değil, share). Şu an indirme ile eşit ağırlıkta.
2. Her PNG'de: dinamik QR + `soulprofile.life/?ref=USER_ID` + tek satırlık merak
   cümlesi ("Ben %72 Pleiadyalı çıktım. Sen?"). Link → web'de anında free karne.
3. Web'de karne biten kişiye anında hesap + "arkadaşını eşleştir" CTA → döngü kapanır.

**K-factor'ü artıracak 3 somut mekanik:**

1. **Davetli Soul Match (P0):** Kullanıcı arkadaşına `/match/INVITE` linki yollar.
   Arkadaş kendi doğum verisini girer → ikisi de eşleşme kartı + hesap alır. Her
   match ≈ 0.8 marjinal yeni kullanıcı. (The Pattern Bond + Co-Star friend chart
   bu mekanikle büyüdü —
   [fashionweekdaily.com](https://fashionweekdaily.com/soulmates-or-challenging-scarily-accurate-astrology-app-the-pattern-now-has-a-dating-feature/))
2. **"Yıldız ırkını tahmin et" challenge (P1):** Uygulamadan otomatik 9:16 reveal
   görseli/15sn video export → Instagram poll / TikTok formatı. Arkadaşlar tahmin
   eder → app açılır. 9 sistemin tek gerçek viral kancası "starseed/yıldız ırkı" —
   Co-Star'da YOK, bizim sahip olduğumuz açık.
3. **Streak/milestone share-out (P1):** 7/30 günlük streak veya doğum günü Solar
   Return anında otomatik paylaşım önerisi (Strava modeli). Gurur + FOMO paylaşımı.

---

## 5. AKTİVASYON HUNİSİ

**Hedef:** İlk açılıştan ilk "aha"ya < 60 saniye, < 3 adım. (72% kullanıcı
onboarding'in 60sn altında olmasını bekliyor; 5dk içinde aha veren ürünler %40
daha yüksek 30-gün retention.
[reteno.com](https://reteno.com/blog/won-in-60-seconds-how-top-apps-nail-onboarding-to-drive-subscriptions),
[appcues.com](https://www.appcues.com/blog/aha-moment-guide))

**İdeal akış:**
1. **Açılış (0-5sn):** Tek ekran, tek vaat: "Doğduğun an gökyüzü ne diyordu?"
   Tek CTA: "Öğren." (9 sistem listesi YOK, ikili CTA YOK.)
2. **Adım 1 (5-20sn):** Ad + doğum tarihi. (Foto yok, yer yok henüz.)
3. **Adım 2 (20-40sn):** Doğum yeri (autocomplete) + saat. "Saati bilmiyorum"
   her zaman görünür, üretimi bloklamaz (12:00 fallback zaten var).
4. **Aha (40-55sn):** Anında **soul headline + paylaşılabilir kart** belirir:
   "%72 Pleiadyalı · Heart-Healer · Generator · Yaşam Yolu 7." Tek satır, ekran
   görüntüsü alınabilir. → Birincil CTA: **Paylaş**.
5. **İlk derinleşme + hesap (55-90sn):** "Derinine in" (3D/wheel/anlatım) +
   "Yarın için kişisel mesajını al → hesap aç." (D1 hook = hesap + ertesi gün push.)

**Mevcut akıştan farkı:** Bugün ilk gördüğün foto-yükle dairesi; aha (kart) 6.
bloğun ardında; hesap hiç yok; ertesi gün dönüş sebebi yok. Yeni akışta foto sona
kayar, aha öne gelir, hesap + D1 push girer.

---

## 6. MONETİZASYON KARARI

**Net tavsiye: Tek seferlik $4.99'u TERK ET. Freemium + abonelik (hibrit) kur.**

**Gerekçe (veriyle):**
- Bu kategoride **abonelik tek seferlikten kat kat fazla gelir getiriyor**;
  yüksek-gelir applerin %65'i çok kademeli (multi-tier) model kullanıyor, ödemeli
  etkileşimlerin %72'si mikro-işlem + abonelik.
  ([jploft.com](https://www.jploft.com/blog/how-astrology-apps-make-money),
  [marketgrowthreports.com](https://www.marketgrowthreports.com/market-reports/horoscope-and-astrology-apps-market-118691))
- ABD'nin **en çok kazanan** astroloji uygulaması CHANI; modeli **cömert free
  içerik + ~$11.99/ay veya ~$108/yıl abonelik** — tek seferlik değil.
  Co-Star da cömert free + premium. (
  [statista](https://www.statista.com/statistics/1451664/top-horoscope-apps-us-market-revenue/),
  [chaninicholas.zendesk.com](https://chaninicholas.zendesk.com/hc/en-us/articles/1500001732281-App-Pricing))
- **Tek seferlik $4.99'un yapısal sorunu:** LTV'yi $4.99'a sabitliyor; günlük
  transit/ay döngüsü gibi tekrar eden değerin parasını alamıyor. "Kimliğin sabittir,
  bir kez öde" mesajı retention'ı kavramsal olarak öldürüyor.

**Önerilen yapı:**
- **Free (cömert):** 1 tam karne + günlük Cosmic Weather + temel uyum + paylaşım.
  (Co-Star/CHANI'nin acquisition motoru bu cömertlik.)
- **SoulProfile Plus — abonelik:** ~$6.99/ay veya ~$39.99/yıl (yıllık %40+ tasarruf,
  bu kategoride yıllık tercih ediliyor). İçerik: AI Soul Chat + sesli karne +
  sınırsız uyum + aylık döngü dashboard + derin shadows/soulStory bölümleri.
- **Tek seferlik IAP (consumable) tut:** Hediye karnesi / Solar Return / arkadaşa
  reading — "send a reading" hem acquisition hem ek gelir.
- **7 gün ücretsiz trial** → yıllık plana yönlendir.

**Uyarı (tuzak):** Faturalama/iptal/refund kategorinin #1 şikayeti
([astrology.pissedconsumer.com](https://astrology.pissedconsumer.com/review.html),
Nebula
[medium](https://medium.com/@emeldawheary61/the-astrology-app-that-quietly-emptied-my-wallet-nebula-review-697ef2defb02)).
Abonelik şart ama **şeffaf fiyat + tek-tık iptal + agresif olmayan trial** ile
yapılmalı, yoksa 1-yıldız bombardımanı gelir. Roadmap'teki "$1.99 lifetime YASAK"
kararı doğru.

**iOS notu:** Apple 3.1.1 → web'de Stripe, iOS'ta RevenueCat + Apple IAP zorunlu.
Mevcut "peşin paid app" modeli iOS'ta abonelikle değişmeli.

---

## 7. 30-60-90 GÜN PLANI

**Gün 0-30 — Retention temeli (P0):** Bu olmadan reklam harcaması para yakar.
1. AI çağrılarını edge function arkasına taşı (güvenlik + ön koşul).
2. Hesap + cross-device sync (Apple/Google/email).
3. Onboarding'i 3 adıma indir, foto'yu sona/opsiyonele al, aha'yı (soul headline +
   kart) öne çek.
4. Rapor sayfasını sadeleştir: ilk ekran = kimlik + kart + tek CTA; gerisi accordion.
   2D wheel'i varsayılan, 3D'yi opsiyonel sekme yap; Star Tree'yi kısalt.
5. Günlük Cosmic Weather kartı + ilk push segmenti (`daily_weather`).
6. Streak / günlük check-in v1.
7. Analitik kur: D1/D7 retention, onboarding funnel drop-off, paylaşım oranı.

**Gün 30-60 — Viral döngü (P1):**
8. Davetli Soul Match (`/match/[invite]`) — döngüyü kapat.
9. Referral programı + karne QR/ref attribution.
10. "Yıldız ırkını tahmin et" otomatik reveal export.
11. AI Soul Chat (yazılı) beta.
12. App Store review tetikleyici.
13. TR soft launch + 3-5 mid-tier TR astroloji/HD influencer (mevcut
    `INFLUENCER_OUTREACH.md` listesi).

**Gün 60-90 — Monetizasyon + derinlik (P2):**
14. Freemium + abonelik geçişi (Plus $6.99/ay · $39.99/yıl + 7 gün trial).
    Tek seferlik $4.99'u kapat; consumable "hediye reading" tut.
15. Soft paywall + transit-triggered paywall.
16. Sesli karne / TTS.
17. Aylık döngü dashboard (Personal Year / Solar Return).
18. EN pazar testi (TR'de D7 > %20 doğrulanınca).
19. İlk fiyat A/B testi (aylık-önce vs. yıllık-önce vs. trial-önce).

---

## 8. KAÇINILACAK 5 TUZAK

1. **3M MAU roadmap'ini ilk 90 günde kovalamak.** Mevcut `PRODUCT_ROADMAP.md`
   astrolog marketplace, Apple Watch, API-for-creators, 6 dil içeriyor. Bunlar
   **retention temeli kurulmadan** yapılırsa kaynak israfı. Önce D7 > %20, sonra ölçek.

2. **Agresif/karanlık-pattern paywall ve karmaşık iptal.** Kategorinin #1 şikayeti:
   izinsiz yenileme, iptal edilemeyen abonelik, cevapsız destek
   ([astrology.pissedconsumer.com](https://astrology.pissedconsumer.com/review.html)).
   Nebula bu yüzden "cüzdanımı sessizce boşalttı" yorumları topladı
   ([medium](https://medium.com/@emeldawheary61/the-astrology-app-that-quietly-emptied-my-wallet-nebula-review-697ef2defb02)).
   Bu, App Store reddine ve 1-yıldız bombasına yol açar.

3. **"Cookie-cutter" generic içerik.** En sık içerik şikayeti: "herkese uyacak
   kadar genel"
   ([auraeastrology.com](https://www.auraeastrology.com/blog/co-star-app-review-2026-an-astrologers-honest-opinion)).
   9 sistem sentezi ancak gerçekten **kişiye özgü hissettirirse** değer; AI çıktısı
   anti-hallucination guard + kullanıcının gerçek verisine sıkı bağ olmadan jenerik
   üretirse fark yok. AI psikoz/etik kaygıları da yükseliyor — sorumlu ton şart.

4. **Çok fazla bildirim göndermek.** "Sürekli bildirim, insight'tan çok engagement'a
   öncelik veriyor" en sık UX şikayetlerinden. Co-Star kazandı çünkü cadence
   **kalibre**: alışkanlık kuracak kadar var, yorulma yaratmayacak kadar az
   (haftada ~3-4 hedef). Push'u kanca sanıp spam yapma.

5. **Onboarding'i ağırlaştırmak (foto + 9 sistem + uzun form).** 7-adım onboarding
   %16 tamamlanır. Foto talebi + 9 ezoterik sistem + uzun form, kategorinin en
   yüksek-niyetli kullanıcısını bile düşürür. Friction = ölüm.

---

## Kaynaklar

- Co-Star astrolog incelemesi (friend chart, push, free model): https://www.auraeastrology.com/blog/co-star-app-review-2026-an-astrologers-honest-opinion
- The Pattern Bond / dating compatibility viral mekanik: https://fashionweekdaily.com/soulmates-or-challenging-scarily-accurate-astrology-app-the-pattern-now-has-a-dating-feature/
- Astroloji app monetizasyon modelleri (abonelik > tek seferlik): https://www.jploft.com/blog/how-astrology-apps-make-money
- Pazar büyüklüğü + multi-tier %65 / mikro-işlem %72: https://www.marketgrowthreports.com/market-reports/horoscope-and-astrology-apps-market-118691
- ABD en çok kazanan astroloji appleri (CHANI #1, Co-Star #2): https://www.statista.com/statistics/1451664/top-horoscope-apps-us-market-revenue/
- CHANI fiyatlandırma (~$11.99/ay, ~$108/yıl): https://chaninicholas.zendesk.com/hc/en-us/articles/1500001732281-App-Pricing
- Onboarding 60sn / aha < 5dk → +%40 retention: https://reteno.com/blog/won-in-60-seconds-how-top-apps-nail-onboarding-to-drive-subscriptions
- Aha moment rehberi: https://www.appcues.com/blog/aha-moment-guide
- 2025 onboarding best practices (3-adım %72 vs 7-adım %16): https://www.guidejar.com/blog/7-user-onboarding-best-practices-that-actually-work-in-2025
- Astroloji app 2025 trendleri (AI chat, voice, personalization, gamification +%47): https://www.dzinsights.com/blog/the-future-of-astrology-apps-trends-shaping-2025-and-beyond
- Faturalama/refund/destek şikayetleri: https://astrology.pissedconsumer.com/review.html
- Nebula faturalama şikayeti örneği: https://medium.com/@emeldawheary61/the-astrology-app-that-quietly-emptied-my-wallet-nebula-review-697ef2defb02
