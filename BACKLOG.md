# Sakin — Test Backlog (canlı takip)

Bu dosya, test turlarında çıkan bug/istekleri takip eder. Oturumlar arası kaybolmasın diye repoda.

## ✅ Çözüldü & deploy edildi
- **Astroloji TZ düzeltmesi** (Türkiye tarihsel offset) → yükselen/ev doğru (1.2.7). Betül ile canlı doğrulandı.
- **Doğum şehri doğrulama** + "şehir gerekli" notu.
- **18 yeni hayvan + derin lore** (a101–a118).
- **Sakin Taşlar iOS'a eklendi** (1.2.7, Aile menüsü).
- **Sakin Ailesi modal donma/scroll** — kaydırılabilir oldu.
- **B4: Doğum formu save** — tarih zorunlu + görünür uyarı (sessiz başarısızlık yok), 7 dil. *(şehir-bloke değil, gerçek sebep: geçersiz tarih sessizce boşa düşüyordu)*

## ✅ Test branch'te (sandbox doğrulandı, production onayı bekliyor)
- **IAP premium kalıcılığı (kapat-aç)** — `claude/iap-premium-persist`. Sandbox T2 PASS. → main/CIpM8'e (1.2.7) merge onayı bekleniyor.

## 🔧 Açık buglar
- **B2** — Yeniden kurulumda (delete+reinstall) premium otomatik gelmiyor; "Restore Purchases" gerekiyor. Minor. (İyileştirme: `already_owned` → otomatik grant, veya açılışta auto-restore.)

## ✅ F1 — tamamlandı
- **F1 (#4)** — Fiyat ekranı premium'ken satın-alma butonlarını gizliyordu → yıllık abone ömür boyu butonunu göremiyordu. Artık: premium ama ömür boyu sahibi DEĞİLSE "Ömür Boyu'na Geç" butonu + açıklama gösterilir (`premium_upgrade_lifetime_desc`, 7 dil). Ömür boyu sahibinde gizli.

## ✅ F2 — tamamlandı
- **F2 (#5+#6)** — "Sakin'i tanı" tanıtım popup'ı eklendi: ilk 3 açılışta (splash sonrası, onboarding dışında) gösterilir; "Sakin Nedir?" → about/nedir sekmesini açar, "Atla" kapatır. Sayaç: localStorage `sakin_intro_opens`. 7 dil.

## 🧹 Son adım
- Her şey bitince: bir ajan **ölü kod temizliği + mimari inceleme + bug taraması** yapacak.

---
Sıra: B4 ✅ → F2 → F1 → B2 → hata kontrolü → temizlik ajanı.
