# App Store 4.3(b) Resubmit Paketi — Konumlandırma + Review Notes

> Guideline **4.3(b) (Design Spam)** reddi için. Apple'ın çıtası: geçen app'ler
> *"asla sadece bir astroloji app'i değildir; astroloji üründür değil, motordur."*
> Bu paket, argümanı **sistem sayısından** (rakiplerin de yaptığı, spam olarak
> okunan şey) **fonksiyona** kaydırır: hesaplayıcı motor + ilişki aynası +
> ömür-boyu gökyüzü.
>
> **Önemli:** Aşağıdaki iddiaların hepsi artık kodda LİTERAL doğru:
> - Ömür-boyu gezegen hareketi **interaktif** (zaman kaydırıcısı — `StarTreeOfLife`).
> - Motor çıktısı üründe **görünür** ("Hesaplanan Veri" paneli — `EngineMechanics`).
> - İki taraflı davet akışı **kapalı** (`InviteShare` → `/match`).
> Demo/screen recording'i bu üç şey etrafında çek; "9 sistem" deme.

---

## 1. Konumlandırma (tek cümle)

**SoulProfile bir horoscope app'i değil — bir kozmik kimlik motoru.** Doğum
gökyüzünü, Human Design beden grafiğini, Vedik ve numerolojik imzanı hesaplar;
sonra hiçbir horoscope app'inin yapmadığı iki şeyi verir: **gezegenlerinin tüm
yaşamın boyunca hareketi** ve **iki kişinin ilişkisinin çok katmanlı, yazılı
aynası** — indirgeyici bir yüzde değil, iki haritanın birbirine ne öğrettiği.

### Subtitle adayları (30 karakter civarı)
- `Astrology as an engine, not a horoscope`
- `Your life's sky & the mirror between two`
- `A cosmic-identity engine`

---

## 2. App Store Açıklaması

### EN
> **SoulProfile is a cosmic-identity engine — not a horoscope feed.**
>
> Enter your birth date, time and place, and SoulProfile *computes* — on your
> device — your full birth sky, your Human Design bodygraph, your Vedic
> nakshatra and your numerology. Same birth data always yields the same result:
> it's a calculator, not a content feed.
>
> **What no horoscope app does:**
> • **Your planets across your whole life.** Drag a time scrubber from birth to
>   today and watch your planets actually move — a real ephemeris, not a static
>   chart.
> • **A relationship mirror, not a percentage.** Compare any two people across
>   Human Design center-by-center dynamics, astrology synastry, numerology and
>   the Vedic Ashtakuta layer — with a written synthesis, not a single score.
> • **See the math.** Every reading exposes the raw computed values behind it —
>   nakshatra + pada, HD channels and gates, Tzolkin kin, ascendant degree.
>
> Your first profile and first compatibility are free. Your data stays on your
> device. For entertainment and self-reflection; not medical, psychological or
> financial advice.

### TR
> **SoulProfile bir horoscope akışı değil — bir kozmik kimlik motoru.**
>
> Doğum tarih, saat ve yerini gir; SoulProfile doğum gökyüzünü, Human Design
> beden grafiğini, Vedik nakshatranı ve numerolojini **cihazında hesaplar**.
> Aynı doğum verisi her zaman aynı sonucu verir — bir içerik akışı değil,
> bir hesaplayıcı.
>
> **Hiçbir horoscope app'inin yapmadığı:**
> • **Gezegenlerin tüm yaşamın boyunca.** Doğumdan bugüne bir zaman kaydırıcısını
>   sürükle, gezegenlerinin gerçekten hareket edişini izle — statik harita değil,
>   gerçek efemeris.
> • **Yüzde değil, bir ilişki aynası.** İki kişiyi Human Design merkez dinamikleri,
>   astroloji synastry, numeroloji ve Vedik Ashtakuta katmanında karşılaştır —
>   tek skor değil, yazılı bir sentez.
> • **Matematiği gör.** Her okuma, arkasındaki ham hesaplanan değerleri gösterir —
>   nakshatra + pada, HD kanalları ve kapıları, Tzolkin kin, yükselen derecesi.
>
> İlk karnen ve ilk uyumun ücretsiz. Verin cihazında kalır. Eğlence ve farkındalık
> amaçlıdır; tıbbi, psikolojik veya finansal tavsiye değildir.

---

## 3. App Review Information → Notes (kopyala-yapıştır)

```
SoulProfile is not a generic horoscope or daily-fortune app. It shows no
sun-sign horoscopes and no predictive fortune-telling. Its purpose and core
functionality are an original computational engine plus two features no
horoscope app offers. Please note the following, which are demonstrable in the
build:

1. ORIGINAL ON-DEVICE COMPUTATION, NOT AGGREGATED CONTENT.
   The app serves no pre-written horoscopes. It runs original deterministic
   astronomy and calendar math on-device: a full natal chart via an ephemeris
   engine with a Swiss-Ephemeris-derived Ascendant, a Human Design bodygraph
   (64 gates / 36 channels / 9 centers), a sidereal Vedic nakshatra (Lahiri
   ayanamsa), Mayan Tzolkin (Julian-Day correlation), and a Vedic Ashtakuta
   compatibility calculator. On the profile screen, open "The math behind it"
   to see the raw computed values. Same inputs always produce the same output —
   it is a calculator, not a content feed.

2. A UNIQUE INTERACTIVE ARTIFACT — YOUR PLANETS ACROSS YOUR WHOLE LIFE.
   Other apps show either a static natal chart or today's transits. SoulProfile
   computes a real ephemeris across the user's entire lifespan and lets the user
   drag a time scrubber from birth to today to watch their planets move. This is
   interactive functionality, not a reading.

3. A RELATIONSHIP-ANALYSIS TOOL NO NAMED COMPETITOR OFFERS.
   Instead of a single compatibility percentage (Co-Star, The Pattern, Nebula),
   SoulProfile produces a multi-dimensional written synthesis: Human-Design
   center-by-center relationship mechanics, astrology synastry with orbs,
   numerological harmony, and a Vedic Ashtakuta layer — reachable via a two-way
   invite where the second person enters their own birth data.

We would appreciate specific guidance on which functional aspects are considered
duplicative, so we can differentiate further. This app is a self-reflection and
relationship-insight tool, not a horoscope.
```

---

## 4. Süreç notları (Apple istatistikleri)

- 4.3 itirazlarının ~%85'i reddedilir; Apple **fix-and-resubmit**'i itiraza
  tercih eder. Bare appeal ATMA.
- Resubmit'te: (a) demo'yu **motor + ilişki aracı + ömür-boyu gökyüzü** etrafında
  çek, "9 sistem" deme; (b) yukarıdaki subtitle + açıklamayı kullan; (c) Notes'a
  yukarıdaki metni koy.
- Store screenshot'larına en az bir tanesi **zaman kaydırıcısı** (ömür-boyu
  hareket) ve bir tanesi **"Hesaplanan Veri" paneli** olsun — "içerik değil,
  araç" argümanını görselle kanıtla.
- İçerik-tarafı değişikliklerin (kod) push edildiği branch: `claude/cosmic-birth-chart-app-DW89I`.
