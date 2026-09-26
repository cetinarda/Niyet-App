package app.sakin.life;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Ayarlar > "Bildirim izni kapalı" satırına dokununca telefonun BU UYGULAMAYA ait
 * bildirim ayarları sayfasını açar (kullanıcı isteği, Eyl 2026). Web'den Android
 * ayar ekranına gidilemiyor (Capacitor dış adresi yalnızca ACTION_VIEW ile açar),
 * o yüzden küçük bir yerel eklenti. iOS'ta gerekmez: "app-settings:" adresi yeter.
 * ⚠️ R8: proguard-rules.pro'da app.sakin.life.** keep kuralı ŞART (Capacitor
 * eklentiyi @CapacitorPlugin anotasyonundan bulur, yeniden adlandırılırsa kopar).
 */
@CapacitorPlugin(name = "SakinSettings")
public class SakinSettingsPlugin extends Plugin {

    @PluginMethod
    public void openNotificationSettings(PluginCall call) {
        String pkg = getContext().getPackageName();
        try {
            Intent i;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                i = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
                i.putExtra(Settings.EXTRA_APP_PACKAGE, pkg);
            } else {
                i = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + pkg));
            }
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
            call.resolve();
        } catch (Exception e) {
            // Bazı üretici ROM'larında bildirim sayfası yok: uygulama bilgisi sayfasına düş.
            try {
                Intent j = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + pkg));
                j.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(j);
                call.resolve();
            } catch (Exception e2) {
                call.reject("settings_unavailable");
            }
        }
    }
}
