import UIKit
import Capacitor

// Tek amaç: WKWebView'in NATIVE pinch-zoom gesture recognizer'ını tamamen
// devre dışı bırakmak.
//
// KÖK SEBEP (araştırıldı): Meta viewport'taki user-scalable=no + maximum-scale=1.0
// ve JS tarafındaki (resetViewportZoom, visualViewport watchdog, gesture event
// preventDefault) önlemler zoom'u SADECE JS/CSS seviyesinde engelliyor. Ama
// WKWebView'in zoom'u aslında UIScrollView'in kendi native pinchGestureRecognizer'ı
// üzerinden yönetiliyor — bu, meta viewport direktifine HER ZAMAN %100 uymuyor
// (bilinen WebKit tuhaflığı). Paylaşım sayfası (UIActivityViewController) gibi
// sistem overlay'leri WKWebView'e dokunuşları kesintiye uğratınca bu native
// recognizer "etkin"/"stuck" durumda kalabiliyor — kullanıcı geri dönünce
// sayfa zoom'lu görünüyor ve JS tarafından düzeltilemiyor çünkü sorun DOM/CSS
// seviyesinde değil, native gesture recognizer seviyesinde.
//
// Çözüm: recognizer'ı en baştan devre dışı bırak. Uygulamada zaten istenen bir
// pinch-zoom özelliği yok (tüm ekranlar sabit ölçekli tasarlandı) — bu devre
// dışı bırakma hiçbir işlevi kaybettirmiyor, sadece hatanın kaynağını yok ediyor.
class SakinViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        self.webView?.scrollView.pinchGestureRecognizer?.isEnabled = false
    }
}
