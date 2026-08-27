# SoulProfile — Çift Pivotu (Couple Pivot Spec)

> Hazırlanma: 2026-06-06
> Pivot tezi: SoulProfile bireysel "kozmik kimlik karnesi"nden, **iki ruhun birbirine ne yansıttığını sakin bir dille gösteren bir derin uyum aracı**na evrilir.
> Bu doküman somut tasarım, metodoloji ve 30 günlük uygulama planıdır. `MARKET_FIT.md` ile `PRODUCT_ROADMAP.md` arasındaki gerilimi şu lehte çözer: **çift = birey-merkezliden iki kat daha viral, iki kat daha duygusal, iki kat daha sonuç-bağımlı.**

---

## 1. Tek cümlelik pivot tezi

**SoulProfile'ı şuna evirelim:** "İki insanın gökyüzü, bedeni ve sayıları yan yana getirildiğinde birbirine ne öğretmeye geldiklerini sakin ve sembolik bir dille gösteren — soulmate / mirror / sacred-union sembolizmini yargılamadan açıklayan — bir ilişki aynası."

Pozisyonlama: **"Bir astroloji uyum hesaplayıcı değil. İki ruhun aynası."**

Karşıt konum: Co-Star "snarky daily AI"dır; The Pattern "Bond level sınıflandırıcısı"dır; Stellar "data-rich nerd chart"tır. SoulProfile **"sakin, sembolik, içe çekici"** olur — duygusal değer (gözyaşı / şaka değil), data dump değil, bir 9 dakikalık seans hissi.

Yeni one-liner (hero):

> "Doğduğunuzda iki ayrı gökyüzü vardı. Şimdi tek bir aynada görelim."
> tek CTA: **"İki yıldız haritasını yan yana koy."**

---

## 2. Mevcut `/compatibility` ekranındaki SOMUT problemler

(Reponun gerçek durumu üzerinden — `app/compatibility/page.tsx` + `components/CompatibilityView.tsx` + `lib/compatibility/index.ts` okuması.)

### 2.1 Sayfa "data dump" — sakin değil
`CompatibilityView` tek scroll'da **9 ayrı blok** üst üste render ediyor:
1. 4'lü skor halkası (Overall + HD + Astro + Numerology)
2. Genel paragraf + HD Dansı kutusu
3. Güçlü/Sürtünme yan yana
4. **9 HD merkezi** ayrı kart (her biri başlık + statü + 2 cümle)
5. Tüm electromagnetic + companionship + dominance kanalları listesi (potansiyel 10-20 kart)
6. Tüm astroloji açıları (potansiyel 8-12 satır)
7. Numeroloji paragrafı
8. Tavsiye
9. Disclaimer

**Problem:** Kullanıcının "biz nasılız?" sorusuna saniye 5'te cevap verecek bir şey yok. Aha anı 5. ekranın altında. 9 merkez kartı = aşırı bilişsel yük. "Saturn Sun trine" satırı sıradan kullanıcıya hiçbir şey ifade etmiyor.

### 2.2 Skorlamada "5. büyük halka" konsept boşluğu
Şu an 3 sistem skoru var (HD/Astro/Num). Bu **"toplam karne"den çıkmış 3 alt-skor** gibi geliyor; "uyum" sorusunun farklı boyutlarını anlatmıyor. **İlişki için anlamlı 5 boyut** (kimya / ders / iletişim / kader / kutsal birleşim potansiyeli) hesap motoru tarafından *üretilmiyor*.

### 2.3 "Birbirine ne yansıttıkları" sorusu cevapsız
Mevcut kod HD electromagnetic/dominance/companionship hesaplıyor — bu **mekanik**. Kullanıcının asıl sorusu: "Bu kişi bana ne öğretiyor? Onda kendimden hangi yarayı görüyorum?" Bu, **gölge / ayna / nodal** semantiğiyle gelir; kodda yok.

### 2.4 "Bu kişi benim için ne anlama geliyor?" arketipi yok
Bugün cevap **"manyetik / akan / dengeli / zıtların dansı"** (4 başlık) — bu **uyum derecesi** anlatır, **ilişkinin türünü** değil. Kullanıcı şunu öğrenmek istiyor: "ders ortağı mı, ayna eşi mi, kutsal birleşim adayı mı?" 3 sembolik arketip yok.

### 2.5 Karanlık galaxy palette ilişki temasıyla uyumsuz
`bg-galaxy` + `gold` + `cosmic` (mor) + `nebula` (pembe) tema **kimlik karnesi** için doğru ama **çift uyumu** için "klüpvari" hissi veriyor. İlişki teması için **sıcak / dingin / aşkın bedeni saran** bir alt palet lazım (sıcak nötr + sage + dusty rose + soft lavender). Şu an her şey #1a0a40 üzerinde.

### 2.6 İkinci kişiyi sadece kullanıcı giriyor — viral döngü kapanmıyor
Form 2. kişinin doğum verisini KULLANICIDAN alıyor. Yani 2. kişi:
- Uygulamayı açmıyor
- Hesap açmıyor
- Acquisition kanalı **değil**

`MARKET_FIT.md` bunu zaten teşhis etti (P0 görev #3). Pivot bu fırsatı merkeze almalı.

### 2.7 Eksik nokta-nokta etkileşimler
Mevcut `SYNASTRY_PAIRS` listesi 12 çiftle sınırlı; **Juno, Vesta, Eros, Vertex** YOK. "Soul mate / sacred union" sembolizmi için bu noktalar kanonik. Mevcut `PlanetName` tipinde de tanımlı değil.

### 2.8 Composite yok
Şu an sadece **synastry** (haritaların yan yana açı kıyaslaması) var. **Composite** ("ilişkinin kendi karnesi" — midpoint chart) yok. Kullanıcı "biz birlikte kimiz?" sorusunu soramıyor.

### 2.9 Vedik / Tarot / Maya katmanı dahil değil
Repo'da `lib/systems/vedic.ts`, `tarot.ts`, `maya.ts` var ama `compareReports` bunları kullanmıyor. **Vedik Ashtakuta (36 puan)** kompakt bir "uyum skoru" verir ve ucuza eklenir; **Tarot 3 kart relationship pull** AI yorumu için zengin bir sembolik temel kurar; **Maya Kin Twin / opposite direction** "kader/ders" temasını berkitir.

### 2.10 Çıkış sonrası boşluk
Karne ürettikten sonra kullanıcı ne yapar? Paylaşamıyor (export yok), tekrar dönmesi için sebep yok, partner'i davet edemiyor. Bireysel raporda olan `html-to-image` + share flow burada yok.

---

## 3. Yeni uyum metodolojisi — 5 katman sentezi

> Tasarım kararı: Kullanıcıya gösterilen **5 büyük skor** her biri **1 katmana** tekabül eder. Toplam "compatibility skoru" başlığı YOK — onun yerine "5 boyutta sizi nasıl görüyoruz?" denir. Bu Apple 4.3'e karşı koruma (predictive değil, gözlemsel) ve aynı anda data-dump'tan kurtuluş.

### Layer 1 — Astroloji synastry (KIMYA)
**Hesap:** Mevcut açı motoruna ek olarak:
- Juno (Asteroid 3), Vesta (Asteroid 4), Eros (Asteroid 433) — `astronomy-engine` doğrudan vermiyor, Swiss Ephemeris değerlerinin **TLE/MPC tabanından önceden hesaplanmış tablo** kullanılabilir (10 yıllık veri ~80KB JSON, MVP için yeterli). Alternatif: client-side `juno-position` paketi.
- Vertex (geometrik açı, astronomy-engine'den `obliquity` + `RAMC` + enlem ile hesaplanır — ASC formülünün kuzeni; mevcut kodun yan yana eklenir).
- Mevcut SYNASTRY_PAIRS listesine ekle: `Venus-Juno`, `Juno-Juno`, `Mars-Eros`, `Sun-Vertex`, `Moon-Vertex`, `NorthNode-Sun`, `Saturn-Venus`.

**Skorlama:**
- "Sıcak" sinastri aspekti (sun-moon conj/trine, venus-mars conj/sextile, juno-venus conj) = +10
- Vertex ya da NN konjonksiyonu = +12 (eşsiz "kader" tetikleyici)
- Kare/karşıt klasik aspektler = +3 (gerilim "kötü" değil — sürtünme = öğrenme)
- Saturn-Sun/Venus = +5 (uzun vade)
- Açı puanlarının toplamı clamp(0-100).

**Kullanıcıya ne söyler (örnek tek cümle):** "Sizin Venüsünüz onun Juno'suna 1° kavuşumda — onun ideal eş arketipi sensin." 5 ekranda halkanın altında **1 cümle özet** olur; detay tek "Aspektler" satırı.

**Var mı?** Mevcut açı motoru %60 hazır. Juno/Vesta/Eros/Vertex EKLENECEK. Yorumlama sözlüğü (`pairTheme`) genişletilecek.

### Layer 2 — Human Design dinamiği (DERS)
**Hesap:** Mevcut `centerDynamics` + `channelConnections` korunur. Eklenir:
- **Composite definition:** İki haritanın gate'leri **birleştirildiğinde** hangi merkezler tanımlı oluyor + hangi yeni kanallar tamamlanıyor. (Kod: union of gates, sonra mevcut `CHANNELS` üzerinden yeniden tarama.)
- **Nodal axis cross:** Birinin Conscious-Sun gate'i diğerinin Conscious-Earth gate'i (karşı kapı 64 wheel) ise — "her birinizin yolu öbürünün gölgesinden geçiyor" işareti. Apple-uyumlu sembolik dilde.
- "Soul-level" kanal beyaz listesi (sözlük): 25-51 (initiation / şok = ruhsal uyanış), 1-8 (yaratıcı katkı), 10-20 (uyanmış bireysellik), 34-20 (charisma), 13-33 (witness / saklı sözcük), 29-46 (taahhüt aşkı), 30-41 (aşkın hayal kurulumu). Mevcut kodda kanal teması var ama **ruhsal ağırlık** etiketi yok — eklenecek.

**Skorlama:**
- Electromagnetic = +10
- "Soul-level" beyaz listede electromagnetic = +14
- Companionship = +6
- Dominance = +3 (ders var — kötü değil)
- Composite tanımlanan yeni motor merkezi (Sacral, SP, Heart, Root) = +4
- Otorite uyumsuzluğu (emotional vs sacral vs splenic) = -3 (zaman ritmi farklı; çok düşmesin, dengelemek için)

**Kullanıcıya ne söyler:** "İkinizin enerjisi yan yana geldiğinde, ayrı ayrı kapalı olan **Boğaz** açılıyor — birlikteyken sustuğunuz şeyleri söylüyorsunuz." 1 cümle, halka altı.

**Var mı?** %70 hazır. Composite definition + soul-level beyaz liste eklenecek.

### Layer 3 — Numeroloji rezonansı (RITİM)
**Hesap:** Mevcut `lifePath` karşılaştırması yeterli değil; eklenecek:
- **Soul Urge eşleşmesi:** İkisinin de kalp arzularının (vowel-derived) aynı olması — "aynı şeyi istiyorsunuz" işareti. Twin flame folklorunda en güçlü tetikleyici.
- **Birth Day senkronu:** Aynı day number ya da day = diğerinin LP'si.
- **Personal Year uyumu:** Bu yıl ikisi de aynı PY → "aynı kapıdan giriyorsunuz". 1-9, 9-1, 5-5 gibi paternler ayrı renklenir.
- **Expression-Expression:** İkisinin profesyonel/dünyaya açılan numarası — ortak iş/proje potansiyeli için.

**Skorlama:**
- Soul Urge aynı = +15
- LP harmonious tablosu (mevcut) = +12
- LP same = +10 (aynı kör nokta riski içerir)
- PY senkronu (aynı / komplementer) = +6
- Birth Day == diğer LP = +6
- Master numara çiftli geçişi (11-22, 22-33, 11-11) = +5
- Üst sınır 100.

**Kullanıcıya ne söyler:** "İkinizin de Soul Urge'i 7 — birlikte içe çekilmek istiyorsunuz, kalbinizin sesi aynı yöne bakıyor." Halka altı tek cümle.

**Var mı?** %40 hazır (lifePath compare). Soul Urge + BirthDay + PY compare eklenecek (kod ~40 satır).

### Layer 4 — Vedik Ashtakuta (KADER / ARMONİ)
**Hesap:** Klasik 8 boyut, **mevcut** `lib/systems/vedic.ts` Nakshatra hesabı **anchor** olarak kullanılır:
1. Varna (1 pt) — sosyal element uyumu (nakshatra sınıfı)
2. Vashya (2 pt) — birbirini "etkileyebilme" — moon sign tabanlı
3. Tara (3 pt) — şans / kader (nakshatra count fark)
4. Yoni (4 pt) — fiziksel kimya (her nakshatra'nın hayvan eşi)
5. Graha Maitri (5 pt) — moon sign rulers dostluğu
6. Gana (6 pt) — temperament (Deva / Manushya / Rakshasa)
7. Bhakuta (7 pt) — duygusal mesafe (moon sign aralığı)
8. Nadi (8 pt) — genetik / sağlık (kritik; aynı = sıfır puan veto)
- Toplam **36 üzerinden puan** (18+ kabul, 25+ iyi, 30+ harika).

**Skorlama:** Vedik toplam doğrudan / 36 * 100 ile clamp.

**Kullanıcıya ne söyler:** "Antik Vedik tablosunda 36 üzerinden **27 puanınız** var. Kalp seviyesinde uyum güçlü." 1 cümle, halka altı.

**Var mı?** Nakshatra %100 hazır. Ashtakuta tablosu (mapping) **eklenecek** — ~250 satır lookup. Hazır referans: Drikpanchang public data. MVP için **kompakt versiyon** (Nadi + Bhakuta + Gana + Yoni — 25 puan version) ile başlamak yeterli; "tam Ashtakuta" Plus özelliği olur.

### Layer 5 — Sembolik Tarot (REHBER MESAJ)
**Hesap:** Deterministik üç kart pull (rastgele DEĞİL — iki ismin numerolojik toplamından seed'lenir, böylece her aynı çift her zaman aynı kartları çeker; "iki kişiye özel" hisset).
- Kart 1: **"Aranızdaki kök enerji"** (LP_A + LP_B = N → Major Arcana[N mod 22])
- Kart 2: **"Görmeniz gereken ders"** (Soul Urge'lerden seed)
- Kart 3: **"Birlikte gidiş yönü"** (Birth Day'lerden seed)
- Eğer "Lovers" + "Two of Cups" + "Hierophant"tan en az ikisi düşerse → "Kutsal birleşim" arketipi badge'i (otomatik).
- "Tower" + "Death" + "Ten of Swords" gibi sert kartlar düşerse → "Dönüşüm / yıkıcı şifalanma" arketipi.

**Skorlama:** Skorlamaya katılmaz. **Sadece sembolik mesaj** üretir (zaten "5 büyük skor"un beşincisi olmasın; tarot **aşağıda ayrı bir küçük blok** olur — "Bugünün rehber mesajı"). **Düzeltme:** Layer 5'i skor olarak değil **"Pusula"** ekranının kalbi olarak konumla. (Aşağıda Ekran 4'e bakınız.)

**Var mı?** `lib/systems/tarot.ts` doğum kartlarını çıkarıyor, **çift pull mantığı YOK** — eklenecek, ~30 satır seed+pull.

### Skor mimarisi özet

| Layer | Skor | Ne ölçer | Halka rengi (öneri) |
|---|---|---|---|
| 1 Astro Synastry | 0-100 | **Kimya** (Venüs/Mars/Juno) | Soft amber #D4A574 |
| 2 HD Dynamics | 0-100 | **Ders** (defined/open + composite) | Sage #9CAF88 |
| 3 Numerology | 0-100 | **Ritim** (LP + Soul Urge + PY) | Dusty rose #C9A0A6 |
| 4 Vedik Kuta | 0-100 (=/36×100) | **Kader / Armoni** | Indigo dusk #6B7AA1 |
| 5 Tarot Pull | (skor değil) | **Pusula mesajı** | (kart resmi) |

**Toplam "ana skor"** = Layer 1-4'ün ortalaması (eşit ağırlık) — ama UI'da **küçük gösterilir** ya da sadece headline'a bağlanır ("Kavuşan İki Pusula" gibi). 5 ana halka kullanıcının dikkatini paylaşır.

---

## 4. "Birbirlerine ne yansıttıkları" sembolik framework

5 katmanın üzerinde, kullanıcı için **en duygusal blok** budur. "Aynalar" sayfası (Ekran 3).

### 4.1 HD üzerinden ayna mekaniği
- Açık merkez ⟷ Tanımlı merkez = **"sen onun yansıtıcısısın"**. Tanımlı taraf temayı bilinçli yaşamıyorsa, açık taraf bunu abartılı/saplantılı yaşayarak ayna olur.
- Her ayna için iki satır: "(A)'da görünmez olan, (B)'de büyütülüyor."
- Soul-Plexus özelinde: bu en güçlü ayna (duygusal dalga). Cümle: "Bilinçsiz sevincini de kederini de o sana yansıtıyor."
- G merkezi: "Onun yanında sen 'yön'ünü daha net hissediyorsun çünkü senin açık yönlerin onun pusulasına çarpıyor."

### 4.2 Nodal ayna
- Sen onun South Node konumunda yaşayanı kolaylaştırıyorsun (geçmiş hayat tanışıklığı) → onun North Node'una doğru itiyorsun. **"Senin doğal halin, onun büyüme yönü."**
- Eğer A'nın NN'si B'nin Sun ya da Moon'una konjonksiyonsa → klasik "kaderî öğretmen" işareti.

### 4.3 Astro gölge ayna
- Mars-Mars opposition → "Birbirinizin öfke alanını görüyorsunuz."
- Saturn-Moon aspect → "Onun yapısı sana 'çocuk kalbinin' duvarını gösteriyor."
- Pluto-Venus aspect → "Sevgi kavrayışınızın derin gölge maddesi birbirinizde tetikleniyor."

### 4.4 Çıktı formatı (kullanıcıya gösterilen)
**Maksimum 5 yansıma cümlesi.** Her biri:
> *"Onun [X kalitesi], sende [Y derslerini] uyandırıyor."*

Örnek:
- "Onun açık Solar Plexus'u, sendeki bastırılmış duygunun aynasıdır."
- "Senin tanımlı Heart'ın, ona kendi değerini sorgulatıyor — o seni öğretmen olarak buluyor."
- "Venüsün onun Juno'suna kavuşumda — sen onun çocukluk hayalindeki 'sevgili' arketipisin."
- "Mars-Mars karenizde, ayrı düştüğünüz hız ortak öfkeyi açığa çıkarıyor."
- "Senin Kuzey Düğümün onun Güneşi'nde — o sana, sen ona, ileri taşıyacak ittirici."

5 cümlenin üstüne **küçük disclaimer**: "Bu yansımalar yargılama değil; gözleme davet."

### 4.5 Üretim
- AI prompt'u 5 maddelik liste isteyecek.
- Fallback için: 9 merkez × 4 kombinasyon = 36 hazır cümle şablonu (`lib/compatibility/mirrors.ts` — yeni dosya).
- Cümle uzunluğu < 22 kelime sınırı.

---

## 5. "Kutsal evlilik / soul mate / twin flame" sembolik göstergeler

> **Apple 4.3 uyarısı:** "Twin flame" / "kutsal evlilik" gibi terimler doğrudan kullanılırsa **fortune-telling spam** riski büyür. **Çözüm:** Sembolik dilde **3 arketip** sun; predictive iddia kurma; her arketipin altına "bu bir gözlem, bir kehanet değil" disclaimer yerleştir.

### 5.1 3 arketip ve göstergeleri

#### Arketip A — **"Ders Ortağı"** (en yaygın, sembolik dilde nötr)
Saturn / nodal kontaklar baskın, electromagnetic kanal sayısı düşük (0-1), HD dominance çoğunlukta, LP zıt veya uzak.
- Cümle: "Birbirinize bir yapı ve sınır öğretmeye geldiniz."
- Bu hayatın *en yaygın* ilişki türü; düşük puana eşit değil.

#### Arketip B — **"Ayna Eşi"** (HD/dış gözden çoğunlukla "twin flame" denir, ama biz "ayna" deriz)
Soul Plexus / Heart / G merkezinin biri "şared open" + biri tanımlı, **soul-level** electromagnetic kanal (25-51 / 13-33 / 1-8) en az 1, Vertex kontağı VAR ya da NN-Sun konjonksiyonu, **aynı Soul Urge numarası**.
- Cümle: "Birbirinizde, daha çıplak hâlinizi görüyorsunuz."

#### Arketip C — **"Kutsal Birleşim Adayı"** (en nadir — hieros gamos sembolizmi)
Composite chart'ta Venus + Juno + Sun aynı işarette ya da konj, **Tarot pull'da Lovers veya Two of Cups VE Hierophant beraber**, 25-51 kanalı electromagnetic, Vedik Kuta 28+/36, ve Layer 2+3 her ikisi 75+.
- Cümle: "Sizdeki dişil ve eril, birlikte daha da bütünleşiyor — sembolik dilde 'kutsal birleşim' arketipi."

### 5.2 Sunum kuralları (Apple-safe)
- "Twin flame" sözcüğünü EN/TR metinlerinde **kullanma**. "İkiz alev" yerine "ayna eşi" / "mirror match".
- "Soulmate" yerine "soul-level match" / "ruh seviyesinde tanışıklık".
- "Sacred marriage" değil "**symbolic union**" / "kutsal birleşim arketipi" — her zaman "arketip" kelimesiyle.
- Her arketip kartının altına şu disclaimer: "Bu, sembolik bir gözlemdir; ilişkinizin gidişatını tayin etmez. Yargılamak için değil, görmek için."

### 5.3 UX yerleşim
- 5 büyük skorun **altında**, "Aynalar" ekranının **üstünde**, tek satır halinde gri kapsül:
> "Sembolik arketip: **Ayna Eşi.** Detay →"
- "Detay →" tıklanırsa modal: arketip + neden bu çıktı + 3 sembolik gösterge maddesi + disclaimer.

---

## 6. YENİ ekranlar — sakin, alan açan, basit

> **Strateji:** 4 ana ekran. Her ekranda **en fazla bir "ağır" görsel**. Scroll yerine **swipe / "İlerle" CTA** (story-vari) — kullanıcıyı meditasyonvari taşıma. Detay/HD merkez matrisi/açılar tablosu **bireysel rapora benzer "Derinleş" akordeon**a saklanır.

### Ekran 1 — **İki Yıldız** (giriş)
**Amaç:** İki haritayı sakince yerleştir.

```
┌─────────────────────────────┐
│   ✧                         │
│   "Kim, kimle bakıyor?"     │   ← üst başlık (Cormorant, 32px)
│                             │
│   ┌───────────────┐         │
│   │   ✦  SEN      │         │   ← sade kart, halihazırdaki karne
│   │   Ada · 7 Nis │         │
│   └───────────────┘         │
│                             │
│   ┌───────────────┐         │
│   │   ◌  PARTNER  │         │   ← boş / dolu hâl
│   │   + ekle      │         │
│   └───────────────┘         │
│                             │
│   [   Davet linki paylaş  ] │   ← ikincil
│   [ Ben dolduruyorum       ] │   ← primary, gümüş ton
│                             │
│   "Bir aynaya bakmak için   │
│    iki yüz gerek."          │   ← italic alt yazı
└─────────────────────────────┘
```
**Üst başlık:** "Kim, kimle bakıyor?" (yargılayıcı değil, davet eden)
**Ana görsel:** İki kart — biri dolu (sen), biri boş çember (partner). Boş çember soft pulse (3sn breath rhythm).
**Ana metin:** "İki yıldız haritası yan yana koy. Aynanın iki yüzü gerek."
**Navigasyon:** İki seçenek — "Davet linki paylaş" (öncelikli viral, MARKET_FIT.md P0) ve "Ben dolduruyorum" (klasik fallback).
**Tasarım:** Çok fazla form gösterme. Partner formu **modal**'da açılsın, sayfayı bozma.

### Ekran 2 — **Beş Pencere** (5 büyük skor)

**Amaç:** Tek bakışta "biz nasılız?" sorusuna 5 boyutlu cevap.

```
┌──────────────────────────────────┐
│  Ada & Mira                      │   ← çok sade headline
│  Sembolik arketip: Ayna Eşi →    │   ← tek satır, tıklanabilir
│                                  │
│       ◯       ◯       ◯       ◯  ◯
│      78      71      83      62  ✦
│    KİMYA   DERS   RİTİM  KADER  PUSULA
│                                  │
│   ─────────────────────────────  │
│                                  │
│   "Kalbinizin sesi aynı yöne     │
│    bakıyor — Soul Urge 7/7."     │   ← ekranda görünen tek cümle
│                                  │
│                                  │
│   [  Aynaları görelim  →  ]      │
└──────────────────────────────────┘
```

**Ana görsel:** **5 büyük halka** (110-120px çap), aralarında 32px boşluk, hafif glow. Her halka aynı stroke kalınlığı (6-8px), nötr ton + dolan kısım pastel (yukarıdaki palette). Halka **dolarken yumuşak fade** (1.2sn ease-out, başlangıçta DAİREL büyüme HAYIR — sadece arc, hipnotik).

**Skor altında:** sadece **1 cümle** — o boyutun tek özet cümlesi. Hangi cümle ana? **Layer 2 (Ders)** varsayılan açık. Diğer halkaya dokununca cümle değişir (single tap, no modal).

**5. halka (Pusula):** Skor yok. Yerine küçük tarot kart sembolü (✦) ile "Pusula" yazar. Tıklanırsa Ekran 4'e atlar.

**Headline:** "Ada & Mira" altında **tek satır** "Sembolik arketip: **Ayna Eşi**." — tıklanırsa açıklama modali.

**Anti-pattern:** Toplam skor halkası YOK (mevcutta ortada). 4 büyük + 1 sembolik halka eşit ağırlıkta. "Cv.overall" silinir.

### Ekran 3 — **Aynalar** (sembolik yansımalar)

**Amaç:** En duygusal blok. "Birbirinize ne öğretiyorsunuz?"

```
┌──────────────────────────────────┐
│                                  │
│   AYNALAR                        │   ← üst başlık küçük, lock-up
│                                  │
│   "Bu beş cümle, ilişkinin       │
│    en sessiz öğretisi."          │   ← italic intro
│                                  │
│   ─────────────────────────────  │
│                                  │
│   ◌  "Onun açık Solar Plexus'u,  │
│      sendeki bastırılmış         │
│      duygunun aynasıdır."        │
│                                  │
│   ◌  "Senin Kuzey Düğümün onun   │
│      Güneşi'nde — birbirinizi    │
│      ileri taşıyorsunuz."        │
│                                  │
│   ... (3 daha)                   │
│                                  │
│   ─────────────────────────────  │
│   "Yansıma yargı değildir;       │
│    görmenin başlangıcıdır."      │   ← disclaimer
│                                  │
│   [  Pusula  →  ]                │
└──────────────────────────────────┘
```

**Ana görsel:** Yok. Sadece **5 cümle** tek sütunda, her biri arası 24-32px. Yumuşak fade-in (cümleler sırayla 200ms gecikme ile belirir — hipnotik, breath rhythm).

**Her cümle başında:** çok zayıf bir ◌ (Unicode) — bullet değil, "aynanın halkası" hissi.

**Anti-pattern:** Konuşma balonları, ikonlar, renkli vurgular YOK. Sade tipografi. 18-19px font, line-height 1.7.

### Ekran 4 — **Pusula** (rehber mesaj + öneriler)

**Amaç:** "Şimdi ne yapalım?" sorusuna sembolik + pratik cevap.

```
┌──────────────────────────────────┐
│                                  │
│   PUSULA                         │
│                                  │
│   ┌────┐  ┌────┐  ┌────┐         │
│   │ ✦  │  │ ✦  │  │ ✦  │         │   ← 3 tarot kart, çok minimal
│   │KÖK │  │DERS│  │YÖN │         │
│   └────┘  └────┘  └────┘         │
│                                  │
│   "Aranızdaki kök enerji 'The    │
│    Lovers'. Görmeniz gereken     │
│    ders 'Two of Cups'.           │
│    Birlikte gidiş yönünüz        │
│    'The Star'."                  │
│                                  │
│   ─────────────────────────────  │
│                                  │
│   AI Rehber'in 3 önerisi:        │
│                                  │
│   ◐  Bu hafta birlikte sessiz    │
│      bir akşam geçirin. Konuşma  │
│      değil — yan yana oturuş.    │
│                                  │
│   ◐  Birinizin "asla" dediği bir │
│      şey diğerinizin "sürekli"   │
│      yaptığı şeydir — orada      │
│      ders saklı.                 │
│                                  │
│   ◐  Bir ay sonra geri dönün —   │
│      gökyüzü değişmiş olur.      │
│                                  │
│   [  Karneyi kaydet & paylaş ]   │
└──────────────────────────────────┘
```

**Ana görsel:** 3 tarot kart, çok minimal (renksiz outline + tek sembol içinde). 80×120px her biri. Sıralı belirir (sol→sağ, breath).
**3 öneri:** AI Rehber tonunda (Claude, fallback şablonu var). Her biri 1-2 cümle. Yargılayıcı değil, pratiktir.
**Son CTA:** "Karneyi kaydet & paylaş" — Ekran 5'in bireysel karne UX'iyle birleşir (`captureNode` + `shareDataUrl`).

### Opsiyonel Ekran 5 — **Derinleş** (akordeon)
Kullanıcı talep ederse açılır:
- HD 9 merkez matrisi (mevcut `result.hdCenters` — sade sadeleştirilir, ızgara değil tek sütun)
- Tüm synastry aspect listesi
- Composite chart özet
- Vedik Ashtakuta tablosu (8 kuta breakdown)
- Hesap detay açıklaması

> **Önemli:** Bu ekran varsayılan kapalı. Kullanıcı "Detay" CTA'sıyla açar. Free kullanıcı için 3 madde, Plus için tümü.

### Navigasyon
4 ekran arasında **tek yönlü swipe veya CTA**. Kullanıcı geri dönemiyor değil — geri butonu var ama "story-vari" akış. Ekran 2 → 3 → 4 sırası **breath rhythm**: her ekran açıldığında body 1.4sn fade-in, header'lar 200ms gecikmeli.

---

## 7. Tasarım dili — SoulProfile sakin

> Hedef: Kullanıcı bir "kozmik veri terminali"nde değil, **"akşam ışığında, ahşap masada açtığı bir mektubu okuyor"** hissetsin. Sakin.life Türk wellness markası dünyasında (sıcak nötr, doğal doku), Calm/Headspace'in soft-pastel disiplininde, ama mistik bir derinlik (deep indigo gece) eklenmiş.

### 7.1 Yeni renk paleti — "Twilight Vellum"

| Token | Hex | Rol | Kullanım |
|---|---|---|---|
| `bg.parchment` | `#F4EFE6` | Ana arka plan | Light mode / şefkat hissi |
| `bg.dusk` | `#1B1F2E` | Dark mode bg | Sakin gece, #0a0524'ün yumuşak hali |
| `bg.veil` | `#262B3A` | Panel / kart bg (dark) | Mevcut #1a0a40 yerine |
| `accent.amber` | `#D4A574` | Sıcak vurgu, Layer 1 (Kimya) | Mevcut altın yerine — daha terra |
| `accent.sage` | `#9CAF88` | Layer 2 (Ders), HD | Yepyeni — şifa rengi |
| `accent.rose` | `#C9A0A6` | Layer 3 (Ritim), kalp | Dusty rose, mevcut nebula yerine |
| `accent.indigo` | `#6B7AA1` | Layer 4 (Kader), Vedik | Indigo dusk |
| `accent.lavender` | `#B7A7D9` | Layer 5 (Pusula), Tarot | Soft lavender |
| `ink.deep` | `#2A2E3D` | Light mode metin | #0a0524 yerine |
| `ink.soft` | `#E8E3D7` | Dark mode metin | Mevcut #f4f1ff yerine sıcak |
| `muted` | `#8A8F9E` | İkincil metin | |
| `whisper` | rgba(255,255,255,0.04) | Çok ince border | |

**Mevcuttan ne korunmalı:**
- Gece arkaplanı (dark default) — ama #1a0a40'tan #1B1F2E'ye yumuşat. Mor başat ton **silinmeli**, indigo'ya kayar.
- `bg-galaxy` gradient ana sayfa için kalabilir; uyum sayfasında YOK.
- Gold tek aksan olmaktan çıkmalı — 5 katmanın 5 ayrı pastel'ine bölünmeli.

### 7.2 Tipografi

- **Cormorant Garamond korunsun** — sakin/saygılı/edebî bir display serif; "kimlik karnesi" markasıyla devamlılık.
- **Inter korunsun** body için.
- **Yeni ekleme:** Cormorant'ın **Italic** kesimini "italic intro/disclaimer" için kullan (mevcutta yok).
- Headline boyutları küçült: 5xl yerine 3xl-4xl (40-48px). "Kararlı küçük" sakin hisseder; büyük başlık = pazarlama.
- Body line-height: **1.7** (mevcut 1.5/1.6 — okunaklılık + soluk alma için).
- Maksimum satır genişliği: **62ch** (Tailwind: `max-w-prose`).
- Letter-spacing: kicker'larda `tracking-[0.4em]` mevcut iyi — koru.
- Body için **font-weight 400** (mevcutta yer yer 500/600 — sakin hissi için inceltilmeli).

### 7.3 Boşluk & ritim

- Padding standartları:
  - Page horizontal: 24px (mobil) / 40px (desktop)
  - Section vertical arası: **64px** (mevcut 32-48px çok sıkışık)
  - Card içi padding: 24-32px
  - Element arası: 16/24/32 (Tailwind 4/6/8) — **8'in katı disiplin**
- **Sectionlar arası "nefes alanı"**: her büyük bloğun üstünde min 80px boşluk
- "Her ekran tek odakta" prensibi: 1 ekranda en fazla **3 odak noktası**

### 7.4 Mikro-etkileşim — breath rhythm

- **Soft fade-in:** Her ekran açıldığında body 1.4sn, ease-out, opacity 0→1.
- **Sequential reveal:** Listelerde her madde 180-220ms gecikmeli görünür ("nefes ritmi"). Maksimum 5 madde — fazlası YORUCU.
- **Skor halkası dolumu:** Arc anim 1.6sn cubic-bezier(0.4, 0, 0.2, 1). Sayı sayma anim 1.2sn.
- **Buton hover:** scale yok. Yerine 200ms BG opacity 0.04→0.08 geçiş.
- **Empty partner kart breath pulse:** 3sn döngü, opacity 0.4↔0.7 — sakin nefes.
- **Sayfa geçişi:** Slide YOK. Sadece **crossfade** (cross-dissolve 400ms).

### 7.5 Animasyon süreleri — "yormayan" eşik
- Anlık geri bildirim (buton press): 100-150ms — kullanıcıya rahatsız etmez ama anında hissedilir
- Mikro reveal (kart dolumu): 400-600ms
- "Wow" anı (skor halka, tarot pull): 1.2-1.8sn — biraz uzun, ciddiyet hissi
- Sayfa transition: 400-500ms crossfade
- **Hiçbir animasyon 2sn'yi geçmemeli** — meditasyon değil, sakin akış. Mevcut StarTreeOfLife 14sn = YORUCU (zaten MARKET_FIT.md teşhis etti).

### 7.6 Anti-pattern listesi — uyum ekranında YAPILMAYACAK

- Stardust / particle background (mevcut starfield) → uyum sayfasında YOK. Sadece düz #1B1F2E.
- Birden fazla emoji (mevcut ✦ ✧ ⚯ ✶ ⌖ 🪷 🦋 🐉) → sade sembol seti: yalnızca ◯ ◌ ◐ ◑ ✦.
- "Shadow glow" cosmic blur gradient → silinir.
- Mor başat ton (`#1a0a40`) → silinir.
- Klasik "Card with border + label + title + 3 metric + button" pattern → "1 cümle + 1 görsel + 1 CTA" pattern'ine evrilir.
- **Yan yana iki rakip CTA** (örn. "Davet linki" + "Ben dolduruyorum" aynı ağırlıkta) → tek primary + bir küçük "veya" link.
- Modal popups arka arkaya → max 1 modal/ekran.
- Tablolar (mevcut HD merkez ızgara) → tek sütunlu listeye dönüştür.
- 14sn animasyon → max 2sn.
- Yellow alert / kırmızı error → palette dışı renk YOK; "whisper" ton kullanılır.

---

## 8. 8 maddelik görsel kompozisyon örnekleri

### 8.1 Ekran 2 — 5 halka düzeni (ASCII detay)

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│         A d a   &   M i r a                         │
│                                                     │
│       Sembolik arketip:  ⟨ Ayna Eşi ⟩  →            │
│                                                     │
│                                                     │
│      ╭───╮   ╭───╮   ╭───╮   ╭───╮   ╭───╮          │
│      │ 78│   │ 71│   │ 83│   │ 62│   │ ✦ │          │
│      ╰───╯   ╰───╯   ╰───╯   ╰───╯   ╰───╯          │
│      KİMYA   DERS    RİTİM   KADER   PUSULA         │
│      amber   sage    rose    indigo  lavender       │
│                                                     │
│   ┌────────────────────────────────────────────┐    │
│   │ "Kalbinizin sesi aynı yöne bakıyor.        │    │
│   │  Soul Urge 7/7 — içe çekilmeyi             │    │
│   │  ikiniz de seviyorsunuz."                  │    │
│   │                              ── RİTİM      │    │
│   └────────────────────────────────────────────┘    │
│                                                     │
│             [   Aynaları görelim   →   ]            │
│                                                     │
└─────────────────────────────────────────────────────┘
```
- 5 halka: 96px çap. Aralarında 24px. Her halka altında küçük caps label.
- Aktif halka highlight: çevresinde ince halo (4px blur, ilgili pastel).
- Tıklanan halkanın özet cümlesi alttaki kutuda görünür — kutu **sade kart**, çerçeve yok, sadece soft drop shadow.
- Mobile: 5 halka yatay scroll değil, **3+2 grid** (kapsül yumuşak). Veya tek sütun, çok dikkat çekmesin diye yumuşatma.

### 8.2 Ekran 3 — Aynalar listesi kart düzeni

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│             A Y N A L A R                           │
│                                                     │
│         Bu beş cümle, ilişkinin                     │
│         en sessiz öğretisi.                         │
│                                                     │
│   ─────────────────────────────────────────         │
│                                                     │
│    ◌   Onun açık Solar Plexus'u,                    │
│        sendeki bastırılmış duygunun                 │
│        aynasıdır.                                   │
│                                                     │
│    ◌   Senin Kuzey Düğümün onun                     │
│        Güneşi'nde — birbirinizi                     │
│        ileri taşıyacak ittirici.                    │
│                                                     │
│    ◌   Venüsün onun Juno'suna kavuşumda             │
│        — sen onun çocukluk hayalindeki              │
│        "sevgili" arketipisin.                       │
│                                                     │
│    ◌   Mars-Mars karenizde,                         │
│        ayrı düştüğünüz hız ortak                    │
│        öfkeyi açığa çıkarıyor.                      │
│                                                     │
│    ◌   Senin tanımlı Heart'ın,                      │
│        ona kendi değerini sorgulatıyor              │
│        — o seni öğretmen olarak buluyor.            │
│                                                     │
│   ─────────────────────────────────────────         │
│                                                     │
│   "Yansıma yargı değildir;                          │
│    görmenin başlangıcıdır."                         │
│                                                     │
│                  [  Pusula  →  ]                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```
- 5 cümle. Her cümle 18-19px, max 28 kelime. Cümleler arası 28px boşluk.
- Sol kısımda zayıf ◌ — bullet değil, kararsız bir nokta hissi.
- Sayfa boyutu **dikey scroll** ama her cümle viewport'un 1/3'üne yakın — kullanıcı kaymadan üçü görür.
- Arka plan tek ton (`bg.dusk`), ek görsel YOK.

### 8.3 Ekran 4 — Pusula kart düzeni

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│             P U S U L A                             │
│                                                     │
│                                                     │
│     ╭───────╮   ╭───────╮   ╭───────╮               │
│     │   ✦   │   │   ✦   │   │   ✦   │               │
│     │       │   │       │   │       │               │
│     │ LOVERS│   │ 2-CUPS│   │ STAR  │               │
│     ╰───────╯   ╰───────╯   ╰───────╯               │
│      KÖK         DERS         YÖN                   │
│                                                     │
│                                                     │
│   "Aranızdaki kök enerji 'The Lovers'.              │
│    Görmeniz gereken ders 'Two of Cups'.             │
│    Birlikte gidiş yönünüz 'The Star'."              │
│                                                     │
│   ─────────────────────────────────────────         │
│                                                     │
│   ◐  Bu hafta birlikte sessiz bir akşam             │
│      geçirin. Konuşma değil — yan yana              │
│      oturuş.                                        │
│                                                     │
│   ◐  Birinizin "asla" dediği şey,                   │
│      diğerinizin "sürekli" yaptığı şeydir           │
│      — orada ders saklı.                            │
│                                                     │
│   ◐  Bir ay sonra geri dönün —                      │
│      gökyüzü değişmiş olur.                         │
│                                                     │
│              [ Karneyi kaydet & paylaş ]            │
│                                                     │
└─────────────────────────────────────────────────────┘
```
- 3 kart: 80×120px, kontur stroke 1px `accent.lavender` 40% opacity, içleri saydam.
- Her kartta sadece bir sembol (✦) + alt etiket.
- Kart sıralı belirir: sol 0ms → orta 220ms → sağ 440ms.
- Altında 3 cümlelik tarot özeti (italic Cormorant).
- 3 öneri madde — yatık ◐ bullet (yarım hilal, "yarım görme" hissi).

### 8.4 Composite "ortak imza" mini-kart (Plus)

```
┌──────────────────────┐
│   ORTAK İMZA         │
│                      │
│        ✶             │
│   Yengeç Güneş       │
│     7 Yaşam Yolu     │
│   Composite Heart    │
│                      │
│   "İkinizin orta     │
│    haritası yufka    │
│    bir Yengeç..."    │
└──────────────────────┘
```
Ekran 2'nin altında küçük bir kart. Sade. Plus özelliği.

---

## 9. Pazarda differentiator

| Rakip | Konum | SoulProfile farkı |
|---|---|---|
| **Co-Star friend chart** | "snarky AI quote", Sun/Moon/Rising sığ uyum | SoulProfile: 5 katmanlı derinlik (HD + Numerology + Vedik), **sakin tonda**, snarky değil |
| **The Pattern Bond** | "Soulmate / Powerful / Challenging" 7 seviye etiket | SoulProfile: skor değil **sembolik arketip** (Ders / Ayna / Kutsal Birleşim), Apple-safe predictive değil |
| **Stellar synastry** | Aspektler tablosu data-rich | SoulProfile: tablo değil "**5 pencere + 5 ayna cümlesi**" — sadeleştirilmiş içgörü |
| **Sanctuary** | Canlı astrolog (insan) | SoulProfile: AI + deterministik, $4.99 reading değil — kalıcı ilişki **aynası** |
| **Birthdate Co. pairs** | Estetik 1 sayfa kart | SoulProfile: aynı estetik + **HD + Vedik derinlik + 4 ekranlı seans** |
| **Sakin.life / Calm** | Wellness, ilişki YOK | SoulProfile: ilk **wellness-tonda spiritüel ilişki aynası** |

**Tek satırlık konum:**
> **"SoulProfile, gözyaşı için değil, görmek için yapıldı."**

---

## 10. Effort tahmini

### Kodda hazır olan (%~)
- **%55 hazır:**
  - `lib/astrology/index.ts` — gezegen pozisyonları, açı motoru altyapı (Juno/Vesta/Eros HARİÇ)
  - `lib/human-design/*` — gates, channels, centers tam
  - `lib/numerology/index.ts` — LP, SU, BD, PY tam
  - `lib/compatibility/index.ts` — synastry temel hesap, center dynamics, channel connections
  - `lib/compatibility/hd-content.ts` — TR/EN HD merkez ilişki sözlüğü
  - `lib/compatibility/narrative.ts` — Claude prompt + fallback
  - `lib/systems/vedic.ts` — Nakshatra hesabı (Ashtakuta tablosu hariç)
  - `lib/systems/tarot.ts` — Major Arcana mapping
  - `lib/share/*` — `captureNode` + `shareDataUrl`

### Eklenecek (%~)
- **%30 yeni kod:**
  1. `lib/astrology/asteroids.ts` — **Juno/Vesta/Eros** ephemeris (precomputed JSON ~80KB, 1900-2050) + `getJunoLongitude(date)` fonksiyonları.
  2. `lib/astrology/vertex.ts` — Vertex hesabı (ASC formülünün +90° rotated kuzeni).
  3. `lib/compatibility/vedic-kuta.ts` — Ashtakuta 8-boyut hesap, MVP'de kompakt 4-boyut (Nadi+Bhakuta+Gana+Yoni).
  4. `lib/compatibility/composite.ts` — midpoint chart hesabı (her gezegen için (A+B)/2).
  5. `lib/compatibility/tarot-pull.ts` — deterministik 3-kart seed (LP/SU/BD'den).
  6. `lib/compatibility/mirrors.ts` — 36 fallback ayna cümlesi (9 merkez × 4 kombinasyon) + AI prompt v2.
  7. `lib/compatibility/archetype.ts` — 3 sembolik arketip (Ders / Ayna / Kutsal Birleşim) tetikleyici motor.
  8. `lib/compatibility/score-v2.ts` — 5-layer skor agregasyonu (eski 3-layer'ı genişletir).
  9. `lib/compatibility/invite.ts` — Davet linki token (UUID + Supabase row) + `/match/[token]` endpoint.
  10. `app/match/[token]/page.tsx` — 2. kişi giriş ekranı + sonuç (yepyeni dosya).
  11. **Yeni 4-ekran flow:** `app/compatibility/[id]/page.tsx` (sonuç sayfası — 4 step swipe/scroll).
  12. **Yeni komponent:** `components/compat/FiveRings.tsx` (5 halka)
  13. `components/compat/MirrorsList.tsx` (Ekran 3)
  14. `components/compat/CompassCard.tsx` (Ekran 4)
  15. `components/compat/PartnerInviteCard.tsx` (Ekran 1)
  16. Theme genişletme: `tailwind.config.ts`'ye `twilight` palette token'ları.

### Yeniden yazılacak (%~)
- **%10 dokunulup yeniden yazılır:**
  - `components/CompatibilityView.tsx` — **yeni 4-ekran**la değiştirilir; **eski 9 blok düzeni silinir** (sadece "Derinleş" akordeon olarak kalır).
  - `app/compatibility/page.tsx` — Ekran 1 olur (giriş + davet); form modal'a alınır.
  - `lib/compatibility/narrative.ts` — sistem prompt'u 5 ekrana göre yenilenir (5 cümle ayna; 3 öneri pusula formatı).
  - `app/page.tsx` (Welcome) — uyum CTA ana akışın ortağı yapılır (mevcut "ikili CTA" sorunu MARKET_FIT.md'de teşhis edildi).

### Dokunulmadan kalır
- `lib/astrology/index.ts` Sun-Pluto temel hesap motoru
- `lib/human-design/{gates,index}.ts`
- `lib/numerology/index.ts`
- `lib/systems/{maya,chinese,norse}.ts` (uyum motoruna girmez)
- Bireysel `/report` sayfası ve komponentleri — sadeleştirme `MARKET_FIT.md` P0'ı, ayrı iş

### Toplam effort
- **5 katmanlı motor:** ~3-4 gün (Juno/Vesta tablosu en uzun iş — public ephemeris CSV → JSON dönüşümü)
- **4-ekran UI:** ~3 gün (Tailwind + framer-motion crossfade)
- **Davet linki + Supabase:** ~2 gün (token, /match route, RLS)
- **Theme yeni palette:** ~0.5 gün
- **AI prompt v2 + fallback:** ~1 gün
- **i18n strings yeni:** ~0.5 gün
- **Test (regresyon + 5 senaryo):** ~1 gün

**Toplam: ~11 mühendis-gün** (solo geliştirici, hızlı tempo). 2 haftalık sprint mümkün.

---

## 11. Riskler

### 11.1 Apple App Store 4.3 "spam-fortune-telling"
**Risk:** "Twin flame", "kutsal evlilik", "kader", "soulmate kesin" gibi predictive iddialar 4.3 reject sebepleridir. Astroloji uygulamaları zaten "doymuş kategori".

**Azaltma:**
- Hiçbir UI string'de "twin flame" / "soulmate" doğrudan kullanma. **Sözcük seti onaylı:** "ayna eşi" (mirror match), "soul-level match", "sembolik birleşim arketipi", "ders ortağı".
- Her arketip kartının altında **kalıcı disclaimer**: "Bu, sembolik bir gözlem; ilişkinizin gidişatını tayin etmez."
- "Kutsal birleşim" terimi → "sembolik birleşim arketipi" (Layer 5'in adında bile düzelt).
- AI çıktısında "kesin", "kaçınılmaz", "olacak" → temizle (post-process filter).
- `lib/compatibility/narrative.ts` system prompt'una eklenmeli: "**Hiçbir tahmini ifade kullanma. Sembolik dilde kal.**"

### 11.2 Hassas veri (16 yaş + GDPR)
**Risk:** 2 kişinin doğum verisi 1 hesapta saklanıyor — 2. kişinin onayı?

**Azaltma:**
- Davet linkiyle gelen 2. kişi kendi onayını verir (TOS checkbox: "kendi doğum verimi paylaşmayı kabul ediyorum").
- Manuel girişte 1. kişi onay kutusu işaretler: "Bu kişinin verisini paylaşmak için onayı var."
- "Verilerimi sil" akışı her iki kişi için ayrı çalışmalı (Settings → "Bana ait uyum kayıtlarını sil").

### 11.3 AI hallucination (cookie-cutter şikayeti)
**Risk:** MARKET_FIT.md'de teşhis edilen "herkese uyacak kadar generic" şikayeti.

**Azaltma:**
- Ayna cümleleri AI'dan **anchor-bound** istenir: prompt'a *gerçek hesaplanmış* center status, kanal listesi, NN konumu enjekte edilir; AI sadece bunlardan beslenir. "Spesifik veri varsa kullan, yoksa o satırı atla" prensibi.
- Fallback (mirrors.ts) hazır 36 cümle — gerçek kombinasyondan deterministik seçim.
- Her cümlenin bir "kaynak" sözcüğü olur (örn. "Soul Urge 7", "Sacral defined") — kullanıcıya bilgi-temelli hisset.

### 11.4 İlişki sonrası psikolojik etki
**Risk:** Kullanıcı "düşük skor" gördükten sonra ayrılır / depresyona girer.

**Azaltma:**
- "Toplam skor" başlığı vurgulanmaz (UI'da küçük; 5 ayrı boyut öne çıkar — biri düşse diğeri yüksek). 0-100 değil 4 boyut.
- Hiçbir cümlede "uyumsuz", "yürümez" kullanılmaz (mevcut prompt zaten yasaklamış — koru ve genişlet).
- "Düşük skor = büyüten ilişki" konumu mevcut kodda var — onu derinleştir.
- En altta her zaman tek satır: "Hiçbir astroloji aracı, kalbinizin bildiğinden büyük değildir."

### 11.5 Composite/Davison terim karmaşası
**Risk:** İki ayrı teknik birbirine karıştırılırsa astroloji topluluğu eleştirir.

**Azaltma:**
- MVP'de **composite midpoint** kullan, Davison'u ekleme — basit ve standart.
- UI'da "composite" terimi YOK; **"ortak imza"** denir. Teknik terim sadece "Derinleş" sayfasında parantez içinde.

### 11.6 Vedik Ashtakuta kültürel hassasiyet
**Risk:** Türk/Batılı kullanıcı için Vedik terminoloji yabancı; yanlış sunulursa "kültür yağması" eleştirisi.

**Azaltma:**
- Skor halkasının altında **küçük italik**: "Antik Vedik tablosu — 8 boyutlu uyum."
- "Nadi" gibi terimleri kullanıcıya tanıt; her detayda 1 cümlelik açıklama.
- Marketing'de "Vedic" ezilmesin, 5 sistemden biri olarak konum al.

---

## 12. 30 günlük pivot uygulama planı

**Strateji:** Her haftanın sonunda **deploy edilebilir** çıktı. Free kullanıcının deneyimini bozma — `/compatibility` mevcut sürümü yan yana çalışsın, yeni `/compatibility/v2` flag'iyle.

### Hafta 1 — Motor genişletme (en az risk)
**Hedef:** Skor motoru 3 layer → 5 layer'a çıksın. UI değişmesin.
- D1-2: `lib/astrology/asteroids.ts` (Juno/Vesta/Eros precomputed JSON; 1900-2050)
- D3: `lib/astrology/vertex.ts` Vertex hesabı + regresyon testi
- D4: `lib/compatibility/vedic-kuta.ts` kompakt 4-boyut (Nadi/Bhakuta/Gana/Yoni)
- D5: `lib/compatibility/composite.ts` midpoint chart
- D5: `lib/compatibility/score-v2.ts` 5-layer agregasyon
- D5: Mevcut `CompatibilityView`'a feature flag arkasında ek 2 halka (vedik + composite preview); release: %0 traffic.

**Risk:** En düşük. Hiçbir kullanıcıya değmez. Solo dev paralel olarak Hafta 2 UI'ı tasarlar.

### Hafta 2 — Yeni 4-ekran UI (feature flag arkasında)
**Hedef:** `/compatibility/v2` route'ta yeni akış canlı.
- D1: `tailwind.config.ts` "twilight" palette; theme tokens.
- D2: `components/compat/FiveRings.tsx` + halka animasyon.
- D3: `components/compat/MirrorsList.tsx` + `lib/compatibility/mirrors.ts` (36 fallback).
- D4: `components/compat/CompassCard.tsx` + tarot pull.
- D5: 4-ekran swipe/crossfade akışı; `app/compatibility/v2/[id]/page.tsx`.
- D5: `lib/compatibility/archetype.ts` 3 sembolik arketip — sembolik dil filtresi.

**Risk:** Orta. Yeni route ayrı, mevcut bozulmaz. Feature flag: `NEXT_PUBLIC_COMPAT_V2=1` env.

### Hafta 3 — Davet linki + viral döngü
**Hedef:** 2. kişi acquisition kanalı olur.
- D1: Supabase schema migration: `compat_invites` table (token, owner_id, expires_at, status).
- D2: `app/api/compat/invite/route.ts` POST endpoint (token oluştur, email/share link).
- D3: `app/match/[token]/page.tsx` — 2. kişi giriş ekranı.
- D4: `app/compatibility/v2/[id]/page.tsx`'a "Davet linki paylaş" CTA — Ekran 1.
- D5: Karne PNG'sine QR + ref attribution (mevcut share flow'a ek).

**Risk:** Orta. Supabase row level security test edilmeli (token hijack senaryosu).

### Hafta 4 — Cilalama + AI v2 + soft launch
**Hedef:** %10 traffic v2; ölç; A/B karar.
- D1: `lib/compatibility/narrative.ts` AI prompt v2 (5 cümle ayna + 3 öneri pusula; predictive filter).
- D2: i18n TR/EN string yeni; disclaimer wording onayı.
- D3: 5 senaryo regression test (saat bilinmeyen, yurt dışı, Reflector, master numara, aynı LP).
- D4: PostHog event'leri ("v2_compat_view", "v2_invite_share", "v2_swipe_complete").
- D5: Feature flag %10 → A/B "v1 vs v2 D7 retention" 5 günlük ölçüm başlat.

**Risk:** Düşük. Ölç, karar ver.

### Sonrası (Hafta 5+)
- v2 → %100 cutover (eğer A/B kazanırsa)
- v1 silinir, `/compatibility/v2` → `/compatibility`
- Mevcut welcome (`app/page.tsx`) revize: ikili CTA → tek CTA + uyum CTA "karne sonrası" konumu
- Plus özelliği: full 8-Kuta Ashtakuta + Davison chart + AI sesli pusula

### En düşük risk sıra
Hafta 1 → motor (kullanıcı görmez)
Hafta 2 → UI (feature flag)
Hafta 3 → viral (yeni route, eski bozulmaz)
Hafta 4 → ölç + karar

**Hiçbir hafta mevcut paid kullanıcının deneyimini bozmaz.**

---

## Ek — Türkçe-İngilizce kelime onay listesi (Apple-safe)

| YASAK | ONAYLI alternatif |
|---|---|
| twin flame / ikiz alev | mirror match / ayna eşi |
| soulmate (kesin iddia) | soul-level match / ruh seviyesinde tanışıklık |
| sacred marriage | symbolic union archetype / sembolik birleşim arketipi |
| kader / fated | sembolik kavşak / symbolic crossing |
| "olacak", "kesindir" | "eğilim taşıyor", "sembolik olarak görünüyor" |
| "uyumsuz", "yürümez" | "büyüten ders", "sürtünmeli öğrenme" |
| psychic / fortune | sembolik gözlem / symbolic observation |
| reading | reflection / yansıma |
| destiny | symbolic momentum |

---

## Sonsöz

Mevcut SoulProfile, kullanıcının bireysel kozmik imzasını çıkarıyor — bu güçlü bir baz. Fakat pazar (ve duygusal değer) iki-kişiyle açılıyor. Bu pivot:

1. **Tekniği** zaten %55 hazır olan motorun üzerine 5 katmanlı yeni mantık inşa eder.
2. **Viralliği** davet linkiyle 2. kişiyi acquisition kanalına çevirir (MARKET_FIT.md P0).
3. **Tasarımı** karanlık-galaktik'ten sakin-twilight'a yumuşatır — wellness pazarına yaklaştırır.
4. **Dili** Apple 4.3 + 16+ kullanıcı güvenliği için sembolik tutar, predictive değil.
5. **Akışı** 9 bloklu data-dump'tan 4 ekranlı breath rhythm'e indirir.

Sıradaki adım: Bu spec'in onayı + Hafta 1 motor genişletmesinin başlatılması.
