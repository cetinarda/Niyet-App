# Sakin: Sonra Yapılacaklar Listesi

Kullanıcının ertelediği ya da "sonra" dediği işler burada birikir. Kullanıcı
"sonra yapılacakları ver / listeyi göster" deyince bu dosyayı özetle sun.
Bir madde yapılınca buradan sil ve CLAUDE.md'ye işle. Yeni erteleme gelince
gerekçesiyle buraya ekle (tarih + kullanıcının sözü).

---

## A) ERTELENENLER (kullanıcı onayıyla, 1 Eki 2026)

### 1. Niyet Mektubu: e-posta (ve sunucu push'u)
- İstek: sandık 21 gün dolunca push + e-posta ("üyelik sistemi gelince e-mail").
- Karar: sunucu push'u YAPILMADI. Yerel bildirim 9500 zaten tam bu işi yapıyor;
  sunucu push'u mühür tarihini sunucuya taşır ("yalnızca bu cihazda" sözü bozulur,
  gizlilik metni 3 yer x 7 dil değişir) ve çift bildirim doğurur.
- E-posta: ÜYELİK/HESAP SİSTEMİ gelince. Gerekenler: hesap + e-posta doğrulama,
  KVKK aydınlatma + açık rıza, Resend şablonu; tanıtım içerirse 6563 sayılı yasa /
  İYS kaydı. Mektup METNİ e-postada GÖNDERİLMEZ, yalnızca "mührün açıldı" daveti.
- Ön koşul: üyelik sistemi.

### 2. Döngü (adet) takibi: "Döngü Pusulası" (1.4.4 ya da sonrası, ayrı proje)
- İstek: Ben'de kadın döngüsü; Bugün'de veriyi kullanmak; erkeklerin partner takibi.
- Risk (yüksek): KVKK m.6 özel nitelikli sağlık verisi; uygulamada Meta SDK var
  (Flo davası emsali); partner verisini izinsiz girmek üçüncü kişi verisi.
- Onaylanan plan:
  - **v1:** yalnızca kişinin KENDİ döngüsü, veri YALNIZCA cihazda (`sakin_cycle`),
    AI'a / analitiğe / Meta'ya HİÇBİR ŞEY gitmez, doğurganlık/korunma tahmini YOK.
    Bugün'de "Kişisel gün"ün altında evreye göre yumuşak not; Ben'de Niyet
    Mektubu'nun altında kart. Bildirim türü "döngü" (kural 9). Ay ile bağ yalnızca
    "gelenek der ki" tonunda, bilimsel iddia yok (Apple 1.4.1).
  - **v2 partner modu:** erkeğin elle veri girmesi YOK. Kadının KENDİ başlattığı,
    yalnızca EVRE paylaşan, tek dokunuşla kesilebilen bağlantı (Flo/Clue modeli).
  - Gerekenler: gizlilik metni 3 yer x 7 dil, App Store gizlilik etiketi "Health",
    Play Health apps beyanı + Data safety, ~40 metin x 7 dil.

### 3. Bağlanma testi: bilimsel doğrulama
- Acil düzeltmeler 1.4.3'te yapıldı (A5). Kalan: lisansı uygunsa ECR-S (12 madde)
  ya da ECR-R'nin Türkçe uyarlamasına (Selçuk ve ark. 2005) geçiş, norm tabanlı
  kesim noktası, pilot veri (Cronbach alfa + test-tekrar test).

### 4. Konuma göre bildirim: İPTAL (kullanıcı, 1 Eki 2026)
- Yerine: AI bildirim süzgeci ortam varsayan metinleri (pencere, havalandır...)
  eliyor (B1). Konum izni ekleme. Kayıt için burada.

---

## B) ONAYLI 1.4.3 İŞ AKIŞI (1 Eki 2026, kullanıcı: "hepsine onay veriyorum, A'dan başlayalım")

Sıra: A -> B -> C -> build + R8 + cihaz testi. Bittikçe [x] işaretle.

**A. Hatalar**
- [ ] A1 HAZIRIM dönüşü + yol seçimi tekrarı + ana sayfa = Bugün (madde 14/15/16).
  Yol seçimi: doğum bilgisi varsa HİÇ çıkmaz, yoksa oturum başına en fazla 1 kez.
- [ ] A2 İkili uyum ilk dokunuşta SoulID ana sayfası (köprü 8 sn yarışı).
- [ ] A3 Ortak BackButton (SVG ok), Çember/Odalar/Pong/meditasyon.
- [ ] A4 SoulID İngilizce kavram kartları + detay penceresi portal.
- [ ] A5 Bağlanma testi: "korkulu-kaçıngan", eşitlikte güvenli taraf, "şu anki eğilimin".
- [ ] A6 Bildirim smallIcon `ic_stat_sakin`.

**B. Bildirimler**
- [ ] B1 AI 10:00 süzgeci 7 dil (birkaç dakika, meditasyon, pencere, havalandır,
  su iç, temiz hava, yürü) + prompt kuralı + `r3_` damgası.
- [ ] B3 Tema etiketi + AYNI TEMADAN GÜNDE EN FAZLA 1. ⚠️ Kullanıcı: "Gözlerini
  kapat", "1 dakikada sakinleş", "Ayaklarını yere bas" İYİ, her yerde yapılabilir,
  kullanıcı seviyor: SİLME/YENİDEN YAZMA, yalnızca günde 1'den fazla gelmesin.
  Kişisel + koç varsayılan sırada öne.

**C. Yeni özellikler**
- [ ] C1 İkili uyum -> Ben, Drakonik'in altı (A2'den sonra).
- [ ] C2 Orkestra: kendi + kolektif mühürlü sandık sayısı (küçükken gizli).
- [ ] C3 Yeni sürüm: push YOK; zilde "Güncelle" kaydı (`latest-ios-version.json`),
  güncelleyince kaybolur. store-version-watch'taki gdkpd adımı kaldırılır.
- [ ] C4 Tanıtım turu: 3-4 ANA ADIM (kullanıcı kararı), kullanıcı başlatır, atlanabilir,
  Ayarlar'da "Turu yeniden izle".
- [ ] C5 Kendini sevme YANSIMASI (test değil), özgün 8-10 soru, puan yok, 21 gün sonra
  hatırlatma, yalnızca cihazda, Ben > Bağlanma kutusunun altı.
- [ ] C6 Pong galibiyet rozeti: yalnızca iki kişilik, iki cihazın raporu eşleşirse,
  aynı rakipten günlük sınır, eşikler 5 / 15 / 30 / 50, profilde tek rozet, gizlilik 3 yer.
- [ ] C7 Sürüm 1.4.3 (iOS build 1, Android vc 22). ASC'de 1.4.2 (2) kararı beklenir.

**E. Büyüme (kullanıcı onayladı)**
- [ ] E1 Ana ekran widget'ı (bitki, günün kartı/sayısı, seri). Native: iOS WidgetKit +
  Android AppWidget; Info.plist/pbxproj dokunuşu için diff göster.
- [ ] E2 "Bağ" kartı: uyum sonucuna isim + seviye + hikâye görseli, davet edene ek hak.
- [x] E3 Aylık In-App Events: kullanıcı ZATEN yapıyor (1 ay "sakinleşme testi").
- [ ] E4 Özel ürün sayfaları (App Store CPP + Play custom listing), konu bazlı, derin bağlantı.
- [ ] E5 Bildirim sıklığı deneyi (yeni kullanıcı yarısına varsayılan 2, ölçüm).
- [ ] E6 Seri koruması: haftada 1 dinlenme günü + kopunca yumuşak dil.
- [ ] E7 Android esnek uygulama içi güncelleme (Capawesome app-update), R8 kapısı.
