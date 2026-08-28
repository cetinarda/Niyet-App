# Sakin: Test Backlog (canlı takip)

Bu dosya, test turlarında çıkan bug/istekleri takip eder. Oturumlar arası kaybolmasın diye repoda.

## ✅ Çözüldü & deploy edildi
- **Astroloji TZ düzeltmesi** (Türkiye tarihsel offset) → yükselen/ev doğru (1.2.7). Betül ile canlı doğrulandı.
- **Doğum şehri doğrulama** + "şehir gerekli" notu.
- **18 yeni hayvan + derin lore** (a101-a118).
- **Sakin Taşlar iOS'a eklendi** (1.2.7, Aile menüsü).
- **Sakin Ailesi modal donma/scroll**, kaydırılabilir oldu.
- **B4: Doğum formu save**: tarih zorunlu + görünür uyarı (sessiz başarısızlık yok), 7 dil. *(şehir-bloke değil, gerçek sebep: geçersiz tarih sessizce boşa düşüyordu)*

## ✅ Test branch'te (sandbox doğrulandı, production onayı bekliyor)
- **IAP premium kalıcılığı (kapat-aç)**, `claude/iap-premium-persist`. Sandbox T2 PASS. → main/CIpM8'e (1.2.7) merge onayı bekleniyor.

## 🔧 Açık buglar
- **B2**: Yeniden kurulumda (delete+reinstall) premium otomatik gelmiyor; "Restore Purchases" gerekiyor. Minor. (İyileştirme: `already_owned` → otomatik grant, veya açılışta auto-restore.)

## ✅ F1: tamamlandı
- **F1 (#4)**: Fiyat ekranı premium'ken satın-alma butonlarını gizliyordu → yıllık abone ömür boyu butonunu göremiyordu. Artık: premium ama ömür boyu sahibi DEĞİLSE "Ömür Boyu'na Geç" butonu + açıklama gösterilir (`premium_upgrade_lifetime_desc`, 7 dil). Ömür boyu sahibinde gizli.

## ✅ F2: tamamlandı
- **F2 (#5+#6)**: "Sakin'i tanı" tanıtım popup'ı eklendi: ilk 3 açılışta (splash sonrası, onboarding dışında) gösterilir; "Sakin Nedir?" → about/nedir sekmesini açar, "Atla" kapatır. Sayaç: localStorage `sakin_intro_opens`. 7 dil.

## ✅ Temizlik ajanı: çalıştı, güvenli bulgular uygulandı
Uygulandı (main/CIpM8/gdkpd/test, build exit 0):
- **Ölü kod:** `approxAscendant()` silindi (preciseAscendant ikame etmiş).
- **i18n bug:** `mandala_streak` yinelenen anahtarı 7 dilde temizlendi (de/es/pt/fr'de farklı değerler sessizce eziliyordu).
- **F2 sayaç bug'ı:** `sakin_intro_opens` artık popup gerçekten gösterilince artıyor (önceden splash/onboarding'de 3 hak boşa tükeniyordu → çoğu yeni kullanıcı popup'ı görmezdi).

## 🔜 Ajan raporu: ONAY BEKLEYEN (riskli/büyük, dokunulmadı)
- **Büyük ölü kod (~250 satır, App.jsx):** `generateChakraAnaliz` + `generateSemptomAnaliz` + `generateHastalikAnaliz` ve state'leri hiç çağrılmıyor (birleşik `generateSikayetAnaliz` ikame etmiş). İç içe geçmiş; tek commit'te elle çıkarılmalı. → onay?
- **apps/taslar 3 referanssız ekran:** `MythsScreen.tsx`, `NagualScreen.tsx`, `AuthScreen.tsx` (hayvandan kalıntı). Silmek build'i etkilemez. → onay?
- **CLAUDE.md güncel değil:** TODO `H2` aslında çözülmüş (foreground recheck revoke-only); `preciseAscendant` "DST yok" notu eski (effectiveUtcOffset DST hesaplıyor). → düzelteyim mi?
- **Mimari (opsiyonel refactor):** astro/numeroloji fonksiyonlarını `src/astro.js`'e, AI prompt builder'ları `src/prompts.js`'e ayır; IAP fiyatlarını `getProductInfo().price` ile dinamikleştir; i18n derin-merge.
- **Düşük:** 67 legal anahtarı 5 ek dilde EN'e düşüyor (bilinen boşluk).

## ⏳ Ayrıca bekleyen
- **IAP premium fix → production merge:** sandbox T2 PASS; test branch'inde. main/CIpM8'e (1.2.7) alma onayı bekliyor.
- **iOS 1.2.7 App Store gönderimi** (Mac'te build + submit).

---
Sıra: B4 ✅ → F2 ✅ → F1 ✅ → B2 ✅ → hata kontrolü ✅ → temizlik ajanı ✅ (güvenliler uygulandı, riskliler onayda).
