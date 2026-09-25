# Gizlilik Politikası: Sakin Uygulaması

**Son güncelleme:** Eylül 2026

> Bu dosya https://sakin.life/privacy sayfasının Türkçe kaynağıdır; sayfa değişince bunu da güncelle.

## 1. Genel Bakış

Sakin uygulaması ("Uygulama"), kullanıcıların kişisel gelişimini ve günlük farkındalık pratiklerini desteklemeyi amaçlar. Sakin'de kullanıcı hesabı yoktur; verilerinizin büyük kısmı yalnızca kendi cihazınızda durur. Bu politika hangi verilerin nerede işlendiğini ve haklarınızı açıklar.

## 2. Toplanan Veriler

### 2.1 Yalnızca Cihazda Saklanan Veriler

Aşağıdakiler yalnızca cihazınızda saklanır ve sunucularımıza gönderilmez:

- **Günlük niyet ve kelimeler**, akşam kapanış ve şükür notları
- **Niyet Mektubu**: 21 gün mühürlü mektubunuz ve önceki mektuplarınız
- **İçsel Ayna soru geçmişi** ve **bağlanma stili testi sonucu**
- **Nefes, ses ve çakra kayıtları**, gün serisi, haftalık istatistikler
- **Doğum tarihi, saati ve şehri** (isteğe bağlı)
- **Günün kartları ve tarot çekimleri**

### 2.2 Yapay Zeka Destekli Özellikler

İçsel Ayna, Günün Yorumu, haftalık rapor, tarot açılımı ve günlük yansıma gibi özellikler, **yalnızca onay vermeniz halinde**, yazdığınız metni ve gereken bağlamı (ör. doğum bilginizden türetilen burç ve sayılar) Groq altyapısı üzerinden Meta Llama modeline gönderir.

**Gönderilmeyen:** ad, e-posta, telefon, cihaz kimliği, konum. Groq gönderilen verileri model eğitimi için kullanmaz.

**Fotoğrafla tanıma:** Taş ve bitki tanımada seçtiğiniz fotoğraf, tanıma için Pl@ntNet'e (bitki) ya da Groq'a (taş) gönderilir ve saklanmaz. Kameraya yalnızca bu sırada, sizin eyleminizle erişilir.

### 2.3 Anlık Mesajlar (Push Bildirimleri)

Günlük hatırlatıcılar cihazınızda yerel olarak kurulur, içerikleri sunucuya gitmez. "Sakin'den anlık mesajlar" açıkken (bildirim izni verdiyseniz varsayılan olarak açıktır) şunlar sunucumuzda saklanır: **cihazın bildirim adresi (APNs/FCM token), platform, dil, saat dilimi, uygulama sürümü**. Mesajlar Apple veya Google üzerinden iletilir, yalnızca içerik taşır ve reklam içermez. Ayarlar > Bildirimler'den kapattığınızda kayıt sunucudan silinir.

### 2.4 Çember (Canlı Oda)

Çember'e yazdığınız mesajlar odadaki herkese açıktır. Saklananlar: **mesaj metni (en çok 140 karakter), cihazınızdan türetilen takma ad, cihaz kimliğinizin geri çevrilemeyen özeti, zaman ve bildirim sayısı**. Mesajlar yayınlanmadan önce otomatik olarak denetlenir (bağlantı, küfür ve yapay zeka moderasyonu, Groq). Kendine zarar verme içeren mesajlar odaya düşmez ve saklanmaz. Mesajlar 24 saat görünür ve 48 saat içinde silinir; yasaklanan cihazların özeti, yasak kaldırılana kadar tutulur. Çember verileri Supabase üzerinde Avrupa Birliği (Frankfurt) sunucusunda saklanır.

### 2.5 Anonim Kullanım Ölçümü

Uygulamayı iyileştirmek için kendi anonim ölçümümüzü kullanırız: rastgele bir kurulum kimliği ile hangi ekranların ne kadar kullanıldığı ve hangi adımların tamamlandığı sayılır. Ad, doğum bilgisi, yazdığınız metin veya reklam kimliği **gönderilmez**. Ayarlar'daki "Anonim kullanım verisi paylaş" seçeneğiyle kapatabilirsiniz.

Ayrıca Meta (Facebook) App Events SDK'sı kurulum, açılış ve oturum gibi temel etkinlikleri ölçer; reklam kimliği (IDFA/GAID) **toplamaz** ve uygulamalar arası izleme yapmaz.

### 2.6 Geri Bildirim ve Satın Alma

Geri bildirim formuna yazdığınız mesaj, kategori ve dil bilgisiyle birlikte e-posta olarak (Resend) destek adresimize iletilir. Satın almalar Apple App Store ya da Google Play üzerinden yapılır; abonelik durumunuzu doğrulamak için sunucumuz yalnızca satın alma işlem kimliğini Apple veya Google'a sorar. Ödeme bilgilerinizi görmeyiz.

### 2.7 Toplamadığımız Veriler

Ad-soyad, e-posta, telefon gibi kimlik bilgileri (hesap yoktur), konum, sağlık ve biyometrik veriler, mikrofon, reklam kimliği ve uygulamalar arası izleme verisi **toplanmaz**.

## 3. Üçüncü Taraf Hizmetleri

| Hizmet | Amaç | Paylaşılan veri |
|---|---|---|
| Groq (Meta Llama), ABD | Yapay zeka yanıtları, taş tanıma, Çember moderasyonu | Yazdığınız metin ve gereken bağlam, fotoğraf (saklanmaz), Çember mesajı |
| Pl@ntNet, Fransa | Bitki tanıma | Seçtiğiniz fotoğraf (saklanmaz) |
| Apple, Google | Satın alma ve abonelik doğrulama, bildirim iletimi | İşlem kimliği, bildirim adresi ve mesaj |
| Supabase, AB (Frankfurt) | Çember altyapısı | Çember mesajları, takma ad, cihaz özeti |
| Netlify, ABD | Sunucu ve web barındırma | Sunucuya giden istekler (bildirim kaydı, anonim ölçüm) |
| Resend | Geri bildirim e-postası | Geri bildirim metni |
| Meta App Events | Kurulum/oturum ölçümü | Anonim etkinlik sinyalleri (reklam kimliği yok) |

Reklam ağı veya sosyal medya ile giriş yoktur.

## 4. Veri Güvenliği ve Saklama

Tüm iletişim HTTPS ile şifrelenir; API anahtarları sunucu tarafındadır. Sunucuda tutulan veriler: bildirim kaydı (siz kapatana ya da verilerinizi silene kadar), Çember mesajları (en çok 48 saat), yasaklanan cihaz özetleri (yasak kalkana kadar) ve anonim kullanım sayaçları (kişiyi tanımlamaz).

## 5. Çocukların Gizliliği

Uygulamanın içeriği genel olarak her yaşa uygundur. Çember herkese açık bir canlı sohbet alanıdır ve 13 yaşından küçükler için tasarlanmamıştır. 13 yaşın altındaki çocuklardan bilerek veri toplanmaz.

## 6. Verilerinizi Silme

- **Uygulama içinden:** Ayarlar'daki "Hesabımı ve verilerimi sil" ile cihazdaki tüm verileriniz anında silinir; bu işlem anlık bildirim kaydınızı da sunucudan kaldırır.
- **Anlık mesajlar:** Ayarlar > Bildirimler'den kapattığınızda kayıt silinir.
- **Çember:** mesajlar 48 saat içinde kendiliğinden silinir.
- **Uygulamayı kaldırarak:** cihazdaki tüm veriler silinir.

Apple/Google üzerinden aldığınız abonelik mağaza hesabınıza bağlıdır; iptal için mağaza ayarlarınızı kullanın.

## 7. KVKK Aydınlatma Metni

6698 sayılı Kişisel Verilerin Korunması Kanunu m.10 kapsamında: **Veri sorumlusu** Sakin uygulamasının sahibi ve işletmecisidir (destek@sakin.life). Doğum bilgisi astrolojik profil ve kişisel içerik için; niyet, not ve pratik kayıtları ilerlemenizi göstermek için; bildirim kaydı bildirim iletmek için; Çember verileri canlı sohbeti sunmak ve güvenli tutmak için işlenir. Hukuki sebep m.5/1 uyarınca açık rızanızdır (yapay zeka onayı, bildirim izni, Çember kurallarını kabul); Çember güvenliği için yapılan moderasyonda m.5/2-f meşru menfaat de esas alınır. Yapay zeka, fotoğraf tanıma, barındırma, bildirim iletimi ve Çember için gerekli veriler yukarıdaki tablodaki sağlayıcılara aktarılır; yurt dışına aktarım m.9 kapsamında açık rızanıza dayanır. m.11 kapsamındaki haklarınız (bilgi talep etme, düzeltme, silme, itiraz vb.) için destek@sakin.life adresine yazabilirsiniz.

## 8. Bu Politikanın Güncellenmesi

Bu politika zaman zaman güncellenebilir. Önemli değişiklikler uygulama güncelleme notlarında belirtilir.

## 9. İletişim

**E-posta:** [destek@sakin.life](mailto:destek@sakin.life)
