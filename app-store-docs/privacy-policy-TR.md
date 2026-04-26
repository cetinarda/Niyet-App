# Gizlilik Politikası — Sakin Uygulaması

**Son güncelleme:** Nisan 2026

## 1. Genel Bakış

Sakin uygulaması ("Uygulama"), kullanıcıların kişisel gelişimini ve günlük farkındalık pratiklerini desteklemeyi amaçlamaktadır. Bu gizlilik politikası, Uygulamanın hangi verileri topladığını, bu verileri nasıl kullandığını ve kullanıcıların haklarını açıklamaktadır.

## 2. Toplanan Veriler

### 2.1 Uygulama İçinde Yalnızca Cihazda Saklanan Veriler
Aşağıdaki veriler yalnızca kullanıcının kendi cihazında (yerel depolamada) saklanır ve hiçbir sunucuya iletilmez:

- **Günlük niyet metni:** Kullanıcının o gün için yazdığı niyet/hedef
- **Seçilen motivasyon kelimeleri:** Sabah seçilen 3 kelime
- **Akşam kapanış notları:** "Bugün ne öğrendim?" ve şükür notları
- **Nefes sayısı:** Tamamlanan nefes egzersizi sayısı
- **Hatırlatıcı tamamlanma durumu:** Günlük görevlerin işaretlenme durumu
- **Haftalık istatistikler:** Çakra, kelime ve nefes verileri (cihazda özet olarak tutulur)
- **Doğum tarihi ve saati:** Kişiselleştirilmiş içerik için (isteğe bağlı, yalnızca cihazda)

### 2.2 AI Destekli Özellikler — Üçüncü Taraf Veri Paylaşımı

Uygulama, "İçsel Ayna" ve "Haftalık Rapor" gibi AI destekli özelliklerde kullanıcının yazdığı metinleri kişiselleştirilmiş yanıt üretmek amacıyla üçüncü taraf yapay zeka hizmetlerine gönderir.

**AI sağlayıcısı:** Meta Llama (Groq altyapısı üzerinden)

**Gönderilen veri tipleri:**
- Kullanıcının yazdığı soru veya şikayet metni
- Günlük niyet ve motivasyon kelimeleri (yalnızca haftalık rapor için)
- Doğum tarihi bilgisi (varsa, kişiselleştirme amacıyla)

**Gönderilmeyen veriler:**
- Kişisel kimlik bilgileri (ad, soyad, e-posta, telefon)
- Cihaz tanımlayıcıları
- Konum bilgisi

**Önemli bilgiler:**
- AI özelliklerini kullanmak tamamen isteğe bağlıdır.
- İlk kullanımda açık rıza istenir; rıza verilmeden veri gönderilmez.
- Gönderilen metinler anonim olarak işlenir ve kimliğe bağlanmaz.
- Groq, gönderilen verileri model eğitimi için kullanmamaktadır.

### 2.3 Toplamadığımız Veriler
Uygulama aşağıdaki verileri **kesinlikle toplamaz**:

- Kişisel kimlik bilgileri (ad, soyad, e-posta, telefon numarası)
- Konum bilgisi
- Sağlık veya tıbbi veriler
- Biyometrik veriler
- Cihaz kamerası veya mikrofon erişimi
- Üçüncü taraf hesap bilgileri
- Reklam veya takip amaçlı tanımlayıcılar

### 2.4 Analitik Veriler
Uygulama herhangi bir analitik veya izleme SDK'sı kullanmamaktadır.

## 3. Bildirimler

Kullanıcı günlük hatırlatıcı bildirimleri için izin verirse:
- Bildirimler yalnızca kullanıcının kendi cihazında tetiklenir (yerel bildirim).
- Bildirim içerikleri sunucuya gönderilmez.
- Bildirim izni cihaz ayarlarından her zaman iptal edilebilir.

## 4. Üçüncü Taraf Hizmetleri

| Hizmet | Amaç | Paylaşılan Veri |
|---|---|---|
| Groq API (Meta Llama) | AI destekli kişisel yansıtma | Kullanıcının yazdığı metin (anonim) |

Uygulama herhangi bir reklam ağı, analitik servisi veya sosyal medya entegrasyonu içermemektedir.

## 5. Veri Güvenliği

- Yerel veriler kullanıcının cihazında saklanır.
- AI istekleri HTTPS şifreli bağlantı üzerinden iletilir.
- Kimlik doğrulama bilgileri (API anahtarları) sunucu tarafında saklanır, istemcide bulunmaz.

## 6. Çocukların Gizliliği

Uygulama 4 yaş ve üzeri kullanıcılara yöneliktir. 13 yaşın altındaki çocuklardan bilerek herhangi bir veri toplanmamaktadır.

## 7. Verilerinizi Silme

Uygulamayı cihazınızdan kaldırdığınızda tüm yerel veriler otomatik olarak silinir. Kullanıcı hesabı bulunmadığından ayrıca bir hesap silme işlemi gerekmemektedir.

## 8. Bu Politikanın Güncellenmesi

Bu gizlilik politikası zaman zaman güncellenebilir. Önemli değişiklikler uygulama güncellemesi notlarında belirtilecektir.

## 9. İletişim

Gizlilik politikasına ilişkin sorularınız için:

**E-posta:** destek@sakin.app
**Uygulama Adı:** Sakin
