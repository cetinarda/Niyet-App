# App Review Notes — Apple İnceleme Ekibine Notlar

## Uygulamayı Açıklamak İçin Özet

**Niyet**, kullanıcılara sabahtan akşama günlük bir farkındalık rutini sunan bir **Lifestyle / Productivity** uygulamasıdır. Uygulama herhangi bir tıbbi iddiada bulunmamakta; "hatırlatıcı", "alışkanlık oluşturma" ve "kişisel farkındalık" odaklı içerik sunmaktadır.

---

## İnceleme Ekibi İçin Teknik Notlar

### Hesap / Demo Gereksinimi
- Uygulama hesap kaydı **gerektirmez**.
- Herhangi bir demo hesabına gerek yoktur.
- Uygulama açıldığında doğrudan çalışmaya başlar.

### Ana Akış
1. Giriş ekranı → "HAZİRIM" butonuna bas
2. Sabah niyetini yaz (herhangi bir metin girebilirsiniz)
3. 3 motivasyon kelimesi seç
4. Nefes egzersizi ekranına geç
5. Çakra ekranını görüntüle
6. Gün içi hatırlatıcılar listesini kontrol et
7. Akşam kapanış notunu yaz
8. Haftalık istatistik haritasını görüntüle

---

## Kategori ve İçerik Uyumu

| Konu | Açıklama |
|---|---|
| **Kategori** | Lifestyle — tıbbi/sağlık iddiası yoktur |
| **HealthKit** | Kullanılmamaktadır |
| **Tıbbi iddia** | Yoktur — "farkındalık" ve "hatırlatıcı" dili kullanılmıştır |
| **Manevi içerik** | Reiki ve çakra terimleri kültürel/geleneksel bağlamda kullanılmıştır; belirli bir dini inancı temsil etmemektedir |
| **Kullanıcı verisi** | Yalnızca cihazda yerel olarak saklanır, sunucuya iletilmez |
| **Bildirimler** | Yalnızca kullanıcı izin verirse, local notification ile çalışır |
| **Üçüncü taraf SDK** | Yoktur |
| **Reklam** | Yoktur |
| **Satın alma** | Bu sürümde uygulama içi satın alma yoktur |

---

## Özel Dikkat Gerektiren Alanlar

### Reiki ve Çakra İçeriği (Guideline 1.1)
Uygulamada yer alan Reiki ve çakra içerikleri:
- Belirli bir dini inancı temsil etmemektedir
- Terapötik veya tıbbi bir tedavi olarak sunulmamaktadır
- "Enerji farkındalığı" ve "bedensel farkındalık" bağlamında, kültürel bir uygulama olarak ele alınmaktadır
- Hiçbir sağlık iddiası içermemektedir

### Orkestra Modu (Hayali Topluluk Sayısı)
Haftalık harita ekranında görünen "Bugün 312 kişi seninle nefes aldı" ifadesi, motivasyonel amaçlı kullanılan bir **sabit/örnek değerdir**. Gerçek zamanlı bir veri bağlantısı temsil etmemektedir. Eğer bu ifade yanıltıcı bulunursa, içerik güncellemeye hazırız.

### Bildirim Kullanımı
- Local Notification API kullanılmaktadır.
- Push Notification (APNs) kullanılmamaktadır.
- Bildirimler, kullanıcının seçtiği hatırlatıcılar için tetiklenir.
- Kullanıcı sistemi ayarlardan bildirimleri istediği zaman kapatabilir.

---

## İletişim

İnceleme sürecinde soru veya sorun oluşursa:

**Geliştirici:** [Ad Soyad]
**E-posta:** [e-posta adresi]
**Telefon:** [telefon numarası — opsiyonel]
