#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ANDROID YAYIN KAPISI: R8'li release sürümünü GERÇEK CİHAZDA doğrular.
#
# NEDEN VAR: 1.4.0 (versionCode 14 ve 15) Play Store'a test edilmeden gönderildi
# ve İKİSİ DE açılışta çöktü, iki kez rollback gerekti. Kök sebep R8'in Capacitor
# anotasyon zincirini kırmasıydı ve YALNIZCA release derlemesinde ortaya çıkıyordu.
# Android Studio'daki "Run" tuşu DEBUG derler, R8 orada hiç çalışmaz, o yüzden
# "Android Studio'da çalışıyordu" demek hiçbir şey kanıtlamaz.
#
# KULLANIM (Mac, telefon USB'de ve USB hata ayıklama açık):
#   bash scripts/android-release-test.sh
#
# BU KOMUT GEÇMEDEN PLAY CONSOLE'A HİÇBİR ŞEY YÜKLEME.
#
# Ürettiği APK debug anahtarıyla imzalıdır (keystore.properties yoksa), yani
# mağazaya yüklenemez. Kasıtlı: test artefaktı yanlışlıkla yayınlanamaz.
# Mağaza yüklemesi için Android Studio > Generate Signed Bundle/APK kullan.
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail

PKG="com.sakin.app"
ACTIVITY="app.sakin.life.MainActivity"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APK="$ROOT/android/app/build/outputs/apk/release/app-release.apk"

# adb'yi bul: ANDROID_HOME, ANDROID_SDK_ROOT, PATH, sonra macOS varsayılanı.
ADB=""
for cand in "${ANDROID_HOME:-}/platform-tools/adb" "${ANDROID_SDK_ROOT:-}/platform-tools/adb" \
            "$(command -v adb 2>/dev/null || true)" "$HOME/Library/Android/sdk/platform-tools/adb"; do
  if [ -n "$cand" ] && [ -x "$cand" ]; then ADB="$cand"; break; fi
done
if [ -z "$ADB" ]; then
  echo "HATA: adb bulunamadi. Android SDK platform-tools kurulu mu?"
  echo "      Ornek yol: \$HOME/Library/Android/sdk/platform-tools/adb"
  exit 1
fi

echo "==> Cihaz kontrolu"
DEVICES="$("$ADB" devices | awk 'NR>1 && $2=="device" {print $1}')"
if [ -z "$DEVICES" ]; then
  echo "HATA: Bagli cihaz yok. Telefonu USB ile bagla, USB hata ayiklamayi ac,"
  echo "      telefondaki 'bu bilgisayara guven' uyarisini onayla."
  exit 1
fi
echo "    cihaz: $DEVICES"

echo "==> Web bundle + Capacitor senkron"
( cd "$ROOT" && npm run build ) || { echo "HATA: npm run build basarisiz"; exit 1; }
( cd "$ROOT" && npx cap sync android ) || { echo "HATA: cap sync basarisiz"; exit 1; }

echo "==> Release (R8) derlemesi"
( cd "$ROOT/android" && ./gradlew assembleRelease ) || { echo "HATA: assembleRelease basarisiz"; exit 1; }
[ -f "$APK" ] || { echo "HATA: APK uretilemedi: $APK"; exit 1; }

echo "==> Kurulum (eski surum siliniyor)"
"$ADB" uninstall "$PKG" >/dev/null 2>&1 || true
"$ADB" install "$APK" || { echo "HATA: kurulum basarisiz"; exit 1; }

echo "==> Kurulan surum dogrulaniyor"
INFO="$("$ADB" shell dumpsys package "$PKG" | grep -E "versionCode|pkgFlags" || true)"
echo "$INFO" | sed 's/^/    /'
if echo "$INFO" | grep -q "DEBUGGABLE"; then
  echo "HATA: Kurulu paket DEBUGGABLE. Bu DEBUG derlemesi, R8 test EDILMEZ."
  echo "      Android Studio'nun Run tusu bu APK'nin uzerine yazmis olabilir."
  exit 1
fi

echo "==> Loglar temizleniyor ve uygulama baslatiliyor"
"$ADB" shell am force-stop "$PKG" >/dev/null 2>&1 || true
"$ADB" logcat -b all -c >/dev/null 2>&1 || true
"$ADB" shell am start -n "$PKG/$ACTIVITY" >/dev/null 2>&1 \
  || "$ADB" shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1 \
  || { echo "HATA: uygulama baslatilamadi"; exit 1; }

echo "    15 saniye izleniyor..."
sleep 15

echo "==> Sonuc"
PID="$("$ADB" shell pidof "$PKG" 2>/dev/null | tr -d '\r')"
CRASH="$("$ADB" logcat -d -b crash 2>/dev/null | grep -c "FATAL EXCEPTION" || true)"

if [ -n "$PID" ] && [ "$CRASH" = "0" ]; then
  echo "    PASS: uygulama ayakta (pid $PID), crash yok."
  echo ""
  echo "    Simdi TELEFONDAN elle gez: Baglan / Bugun / Ayna / Ben / Kesfet,"
  echo "    bildirim iznini kabul et, paylas butonunu dene. Sorun yoksa"
  echo "    Android Studio > Generate Signed Bundle/APK ile AAB uretip"
  echo "    once INTERNAL TESTING kanalina yukle, production'a oradan terfi ettir."
  exit 0
fi

echo "    FAIL: uygulama calismiyor."
[ -z "$PID" ] && echo "      - surec olu (pidof bos)"
[ "$CRASH" != "0" ] && echo "      - crash tamponunda $CRASH adet FATAL EXCEPTION var"
echo ""
echo "    Crash ayrintisi:"
"$ADB" logcat -d -b crash | tail -40 | sed 's/^/      /'
echo ""
echo "    PLAY CONSOLE'A YUKLEME. Once bu hatayi cozdur."
exit 1
