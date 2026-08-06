package app.sakin.life;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import com.getcapacitor.BridgeActivity;
import com.facebook.appevents.AppEventsLogger;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Samsung/One UI'da sistem gezinme çubuğu varsayılan beyaz kalıyordu.
        // Uygulamanın koyu tonuna (#080C14) sabitle + koyu zeminde açık ikonlar.
        // Tema (styles.xml) yeni edge-to-edge cihazlarda; bu native kod eski
        // Android'de kesin uygular. iOS etkilenmez (yalnızca Android modülü).
        try {
            getWindow().setNavigationBarColor(0xFF080C14);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                View decor = getWindow().getDecorView();
                decor.setSystemUiVisibility(
                    decor.getSystemUiVisibility() & ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
                );
            }
        } catch (Exception e) {
            // sessiz — çubuk rengi kritik değil, uygulama açılışını engelleme
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
