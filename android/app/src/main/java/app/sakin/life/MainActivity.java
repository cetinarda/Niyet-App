package app.sakin.life;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import com.facebook.appevents.AppEventsLogger;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Yerel eklentiler super.onCreate'ten ÖNCE kaydedilmeli (Capacitor kuralı).
        registerPlugin(SakinSettingsPlugin.class);
        super.onCreate(savedInstanceState);
        // Koyu zeminde AÇIK renk sistem simgeleri (Samsung/One UI'da gezinme çubuğu
        // simgeleri koyu kalıyordu). Çubuk RENGİ temadan gelir (styles.xml
        // navigationBarColor, Android 14 ve öncesi); Android 15+ zaten uçtan uca.
        // ⚠️ Eskiden getWindow().setNavigationBarColor + setSystemUiVisibility
        // çağrılıyordu: Android 15'te desteği bitti, Play uyarı verdi (1.4.3).
        try {
            WindowInsetsControllerCompat c = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
            c.setAppearanceLightNavigationBars(false);
            c.setAppearanceLightStatusBars(false);
        } catch (Exception e) {
            // sessiz: simge rengi kritik değil, uygulama açılışını engelleme
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        // Meta App Events: app install/launch/session tracking (Meta Ads Manager).
        try { AppEventsLogger.activateApp(getApplication()); } catch (Exception e) {
            // sessiz — SDK init sorunlu olsa da uygulama akışı bozulmasın
        }
    }
}
