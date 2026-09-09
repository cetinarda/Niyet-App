# Sakin: R8 (kod karartma + küçültme) kuralları
# ─────────────────────────────────────────────────────────────────────────────
# NEDEN AÇILDI: Google Play "Uygulama optimizasyonu" uyarısı, kod karartma
# yüzdesini %2 ölçtü (eşik %25). Eşiğin altında kalmak Play'deki görünürlüğü ve
# yayınlama olanaklarını etkiliyor. `minifyEnabled` release'de kapalıydı.
#
# ⚠️ BU DOSYA PARA YOLUNU KORUYOR. Aşağıdaki sınıflar İSİMLE (yansımayla)
# bulunuyor; R8 yeniden adlandırırsa çalışma anında sessizce kaybolurlar:
# eklenti "not implemented" der, satın alma hiç başlamaz. Bir keep kuralını
# silmeden önce gerçek cihazda satın alma + geri yükleme testi yap.

# ── Yığın izleri okunabilir kalsın (Play Console crash raporları) ────────────
# R8 satır numaralarını silerse gelen çökme raporu deşifre edilemez hale gelir.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# ── Yansıma için gereken üstveri ─────────────────────────────────────────────
-keepattributes *Annotation*, Signature, InnerClasses, EnclosingMethod, Exceptions

# ── Sınıfları tek pakete topla (karartma yüzdesini yükseltir) ────────────────
# Play Console "Sınıfları Yeniden Paketleme" maddesini karşılar. Zaten karartılan
# (yani -keep ile korunmayan) sınıfların PAKET YOLUNU da düzleştirir, dolayısıyla
# koruma altındaki hiçbir sınıfa dokunmaz: Capacitor, Cordova, billing, Facebook
# yukarıdaki kurallarla adlarını aynen korur.
# RİSK: paket yapısına yansımayla bel bağlayan kod bozulabilir; ama öyle bir kod
# zaten karartmanın kendisinden bozulurdu, dolayısıyla ek risk pratikte yok.
-repackageclasses ''

# ── Capacitor: TAMAMI korunuyor ─────────────────────────────────────────────
# ÖNCEDEN yalnızca eklenti sınıfları + @PluginMethod üyeleri tutuluyordu
# ("çekirdeğin tamamını tutmayalım, karartma yüzdesi düşer" diye). BU YETMEDİ:
# 1.4.0/versionCode 14-15 Play Store'da açılışta çöktü, gerçek cihazda alınan
# logcat kesin sebebi gösterdi:
#
#   FATAL EXCEPTION: CapacitorPlugins
#   Caused by: java.lang.NullPointerException
#     at com.getcapacitor.d0.getPermissionStates(SourceFile:18)
#     at com.getcapacitor.d0.getPermissionState(SourceFile:1)
#     at com.capacitorjs.plugins.localnotifications.LocalNotificationsPlugin
#         .requestPermissions(SourceFile:9)
#
# Capacitor, bir eklentinin izinlerini ÇALIŞMA ANINDA @CapacitorPlugin
# anotasyonunu (ve içindeki @Permission değerlerini) yansımayla okuyarak
# çözüyor. R8 çekirdeği yeniden adlandırınca (yığındaki `d0`, `g0` bunlar)
# anotasyon zinciri kopuyor, anotasyon null dönüyor ve izin sorgusu NPE
# atıyor. Eklenti sınıfını tutmak yetmiyor, ONU OKUYAN ÇEKİRDEK de aynen
# durmalı. Karartma yüzdesinden feragat ediliyor: çöken uygulamanın
# yüzdesi anlamsız.
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }
-keep @interface com.getcapacitor.** { *; }
-keep class com.capacitorjs.** { *; }
-keep interface com.capacitorjs.** { *; }
-keep public class * extends com.getcapacitor.Plugin { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin public class * { *; }
-dontwarn com.getcapacitor.**
-dontwarn com.capacitorjs.**
# Anotasyonlar çalışma anında OKUNABİLİR kalmalı (yukarıdaki NPE'nin özü).
-keepattributes RuntimeVisibleAnnotations,RuntimeVisibleParameterAnnotations,RuntimeVisibleTypeAnnotations,AnnotationDefault

# ── WebView'a açılan JS arayüzleri ──────────────────────────────────────────
# JS tarafı bu metotları ADIYLA çağırıyor, imza değişirse köprü kopar.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ── Cordova köprüsü ─────────────────────────────────────────────────────────
-keep class org.apache.cordova.** { *; }
-keep public class * extends org.apache.cordova.CordovaPlugin
-dontwarn org.apache.cordova.**

# ── IAP: cordova-plugin-purchase (cc.fovea) + Google Play Billing ────────────
# EN HASSAS BÖLÜM. `src/purchases.js` window.CdvPurchase üzerinden konuşuyor;
# native taraf cc.fovea.PurchasePlugin. Billing kütüphanesi de yanıtları
# yansımayla modelliyor. İkisi de TAM korunuyor: burada tasarruf etmenin
# bedeli bozuk satın alma akışı (App Store/Play red sebebi).
-keep class cc.fovea.** { *; }
-keep class com.android.billingclient.** { *; }
-dontwarn com.android.billingclient.**

# ── Meta / Facebook SDK (App Events) ────────────────────────────────────────
# TARİHÇE (üç aşama, hangisinin neden olduğunu karıştırma):
#   1. Başta yalnızca -dontwarn vardı.
#   2. versionCode 14/15 açılışta çökünce Facebook baş şüpheliydi ve SDK'nın
#      TAMAMI koruma altına alındı (-keep class com.facebook.** { *; }).
#   3. Gerçek cihazdan alınan logcat sebebi KESİN olarak gösterdi: suçlu
#      Facebook değil, R8'in Capacitor anotasyon zincirini kırmasıydı
#      (yukarıdaki Capacitor bölümüne bak). versionCode 16 üretimde sorunsuz.
# Yani 2. adımdaki tam koruma, İŞLENMEMİŞ bir suça karşı alınmış önlemdi ve
# Play Console'un ölçtüğü karartma oranını (%33) aşağı çeken başlıca yüktü.
# Facebook SDK kendi consumer-proguard kurallarını AAR içinde getiriyor; bu
# standart mekanizma ve SDK'yı R8 ile kullanan milyonlarca uygulama buna
# dayanıyor. Blanket keep kaldırıldı, yalnızca uyarılar susturuluyor.
#
# ⚠️ KALAN RİSK VE NASIL YAKALANIR: FacebookInitProvider bir ContentProvider
# ve Application.onCreate()'ten ÖNCE, süreç başlarken çalışıyor. Orada bir
# kırılma olursa belirti yine "uygulama hiç açılmıyor" olur. Bu yüzden bu
# değişiklik scripts/android-release-test.sh kapısından GEÇMEDEN yüklenmez;
# kapı bu senaryoyu yerelde iki dakikada yakalar. Kapı FAIL verirse ilk iş
# bu bölümü 2. adımdaki haline geri almak.
-dontwarn com.facebook.**

# ── AndroidX / Kotlin gürültüsü ─────────────────────────────────────────────
-dontwarn kotlin.**
-dontwarn kotlinx.**
