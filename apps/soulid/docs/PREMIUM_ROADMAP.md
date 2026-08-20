# Premium Ürün Yol Haritası

MVP: Ücretsiz **Galaktik Karne**.
Premium: Tekrar eden döngüsel karneler + derinleştirme paketleri.

## Premium SKU önerisi

| Ürün | Periyot | Fiyat (intl.) | İçerik |
|---|---|---|---|
| **Cosmic Weekly** | Haftalık | $2.99/hafta veya $9.99/ay paket | 7 günlük transit, biyoritm, mantra, taşıma haftası |
| **Monthly Galactic** | Aylık | $14.99/ay | Yeni & dolunay rehberi, ilişki transitleri, kişisel ay grafiği |
| **Solar Return** | Yıllık (doğum günü) | $19.99 | 12 ay tema haritası, çeyrek odakları, kapı analizi |
| **Relationship Sync** | Tek seferlik | $9.99 | Synastry + Human Design ilişki haritası |
| **Premium Bundle** | Yıllık abonelik | $79/yıl | Tümü + sınırsız karne PDF + AI chat |

## Free → Premium akış

1. Free karne tamamlandı.
2. "Bu hafta sana özel transit pencereleri" teaser kart (3 maddenin 1'i açık).
3. Tap → paywall (3 plan: Haftalık, Aylık, Yıllık).
4. RevenueCat → satın alma → `subscriptions` tablosu güncelle.
5. Premium kullanıcıya pull-to-refresh ile haftalık karne otomatik üretilir.

## İçerik üretim hattı

Tek bir `lib/report/builders/` dizini altında:

```
galactic.ts        // MVP, ücretsiz
weekly.ts          // Haftalık transit + biyoritm tabanlı
monthly.ts         // Aylık ay döngüsü + ilerlemeli haftalık MC
solar-return.ts    // Yıllık dönüş haritası
relationship.ts    // İki insanı sentezleyen synastry
```

Her builder aynı `generateNarrative()` arayüzünü kullanır, sadece prompt + input
değişir. Prompt caching (Anthropic) ile kullanıcının doğum verisi system'e kaydedilir,
her hafta sadece tarih farkı user message'ta gider — maliyet düşük kalır.

## Notification stratejisi

- **Doğum Günü:** Solar Return CTA push.
- **Yeni Ay / Dolunay:** Ücretsiz mikro içgörü + premium üst kart.
- **Kişisel Yıl Geçişi:** Doğum gününde yeni Personal Year teaser.
- **Mercury retro:** Tüm kullanıcılara uyarı + premium derin analiz.

## Edge function tarafı

`supabase/functions/generate-report/`:
- Tek endpoint, kind paramı ('galactic'|'weekly'|...)
- Anthropic key burada, istemcide değil.
- Result `reports` tablosuna kaydedilir.
- Premium kontrolü subscriptions tablosundan yapılır.
