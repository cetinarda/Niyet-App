# SoulProfile — Uluslararası Pazar Giriş Stratejisi

## Konum

> **The Pattern** astrolojiyi günlük insanın eline verdi.
> **Co–Star** sosyal/comedy tonuyla viral oldu.
>
> **SoulProfile** = Yıldız kökenin + astrolojin + Human Design'in + numerolojin
> + Vedik nakshatran + Maya Kin'in + Norse runun + Tarot doğum kartların +
> bu yaşamdaki görevlerin TEK bir **paylaşılabilir karne**de buluştuğu uygulama.
> "Sen sadece insan değilsin — galaktik bir karnen var."

## Hedef pazarlar (faz faz)

| Faz | Süre | Pazar | Dil | Strateji |
|---|---|---|---|---|
| **0** | 0-1 ay | TR | tr | Kapalı beta, 500 kullanıcı, soft launch |
| **1** | 1-3 ay | TR + diaspora | tr/en | App Store TR'de sıralama, TikTok TR + Instagram TR |
| **2** | 3-6 ay | US/UK/CA/AU | en | The Pattern + Co-Star kullanıcılarına paid + influencer |
| **3** | 6-9 ay | ES/MX/AR + BR | es/pt | Latam astroloji pazarı çok hareketli |
| **4** | 9-12 ay | DE/FR + Skandinav | de/fr | Premium AOV en yüksek pazarlar |

## Differentiator (rekabet farkı)

- **Galaktik Kimlik:** Hangi yıldız ırkındansın? (Pleiadyalı, Siryan, Arkturian, Andromedan, Lyran...) Bu tek başına **ultra paylaşılabilir** — Co-Star bunu yapmıyor.
- **Tek Bir Karne Görseli:** Doğum verisi + fotoğraf üzerine basılı, Instagram story formatında, **paylaşılınca uygulamaya organik geri akış**.
- **Human Design + Astroloji + Numeroloji Aynı Anda:** Rakipler tek dikeyde çalışıyor; biz birleştiriyoruz.
- **Kuzey/Güney Düğüm Vurgusu:** "Bu yaşamdaki görevin" → ruhsal arama yapan kullanıcılar için yüksek anlam yoğunluğu.

## Viral mekanik

Karne paylaşımı = built-in büyüme motoru.
1. Kullanıcı karnesini Instagram story'sine bırakır.
2. Görselde QR kod + soulprofile.life linki vardır.
3. Yeni kullanıcı linke tıklar → web'de free karne → mobile app deep-link.
4. K-factor hedefi: **0.45** (her 100 kullanıcı 45 yeni kullanıcı getirir).

## Channel mix (ilk 6 ay)

| Kanal | Bütçe payı | Hedef CAC | Format |
|---|---|---|---|
| TikTok organik (TR + US) | %25 | $0 | "Bu yıldız ırkı testi seni anlatıyor" |
| Instagram Reels (US/UK) | %20 | $3-5 | Karne paylaşımı, before/after |
| TikTok Ads Spark | %20 | $2.5 | UGC creator partnership |
| Influencer (mid-tier 50K-300K) | %20 | $4-7 | Astroloji/spirituality nişi |
| ASO + Apple Search Ads | %10 | $1-2 | "human design", "astroloji karne", "the pattern" |
| Google UAC | %5 | $2-4 | Geniş prospecting |

## Influencer hedef listesi (US/UK)

- @astrologybay — IG 1.2M
- @cosmiccare — TikTok 800K
- @humandesignhq — IG 400K
- @numerologywithjane — TikTok 500K
- Aliza Kelly — YouTube 200K + IG 350K
- Jessica Lanyadoo — Podcast Ghost of a Podcast

Türkiye:
- Dincer Güner, Hande Kazanova fanbase
- Astrolog Filiz, Mona Astroloji
- Human Design TR Instagram hesapları

## Pricing & monetization

Bkz. [PREMIUM_ROADMAP.md](../docs/PREMIUM_ROADMAP.md)

- ARPU hedefi: ay başı **$3.20** (US), **$1.10** (TR)
- Trial: 7 gün ücretsiz, sonra haftalık $2.99
- Yıllık plan dönüşüm hedefi: %18

## KPI panosu (haftalık)

- DAU / MAU oranı (hedef ≥ 0.25)
- D1, D7, D30 retention (hedef: 45 / 22 / 11)
- Karne paylaşım oranı (oluşturulan karneler / paylaşılanlar)
- K-factor
- ARPU, ARPPU, MRR
- App store ranking (TR Lifestyle, US Lifestyle/Health & Fitness)

## Uluslararası lokalizasyon planı

1. Sprint 1: TR + EN baz çeviri (UI + içerik tabanı)
2. Sprint 2: ES + PT-BR (Latam)
3. Sprint 3: DE + FR
4. AI-assisted çeviri + uzman astrolog editör review

## Yasal/UX uyumluluk

- App Store guideline 5.1.1 (data privacy): doğum verisi hassas, açık consent al.
- "Eğlence amaçlıdır, tıbbi/finansal tavsiye değildir" disclaimer karne altına basılı olarak gelmeli.
- GDPR + KVKK: doğum verisi silme + indirme talebi hazır olmalı (Supabase user delete flow).
- ITS encryption flag = false (sadece HTTPS kullanıyoruz).
