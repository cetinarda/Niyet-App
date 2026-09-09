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

# ── Capacitor: eklentiler isimle/anotasyonla bulunuyor ───────────────────────
# Capacitor çekirdeğinin TAMAMI tutulmuyor (karartma yüzdesi düşerdi); yalnızca
# köprünün adıyla aradığı eklenti sınıfları ve @PluginMethod üyeleri korunuyor.
-keep public class * extends com.getcapacitor.Plugin
-keep @com.getcapacitor.annotation.CapacitorPlugin public class *
-keepclassmembers class * extends com.getcapacitor.Plugin {
    @com.getcapacitor.PluginMethod public <methods>;
}

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
# ÖNCEDEN yalnızca -dontwarn vardı ("SDK kendi consumer-proguard kurallarını
# AAR içinde getiriyor" varsayımıyla). 1.4.0/versionCode 14 Play Store'da
# AÇILIŞTA ÇÖKTÜ: Facebook SDK'nın FacebookInitProvider'ı (ContentProvider)
# Application.onCreate()'TEN ÖNCE, süreç başlarken çalışıyor; bu zincirdeki
# bir sınıf R8 tarafından yansımaya uygun olmayacak şekilde yeniden
# adlandırılırsa/silinirse MainActivity'e hiç ulaşılamadan çöker (bildirilen
# belirtiyle birebir örtüşüyor). Varsayım doğrulanamadığı için artık AÇIKÇA
# tam koruma altına alındı. Karartma yüzdesini bir miktar düşürür ama
# "uygulama hiç açılmıyor" riskinden daha ucuz.
-keep class com.facebook.** { *; }
-keep interface com.facebook.** { *; }
-dontwarn com.facebook.**

# ── AndroidX / Kotlin gürültüsü ─────────────────────────────────────────────
-dontwarn kotlin.**
-dontwarn kotlinx.**
