import UIKit
import Capacitor

// Tek amaç: WKWebView'de paylaşım sayfası (UIActivityViewController) sonrası
// sayfanın ZOOM'LU TAKILI kalması hatasını kökten ve kalıcı olarak çözmek.
//
// KÖK SEBEP: Meta viewport'taki user-scalable=no + maximum-scale=1.0 ve JS
// tarafındaki önlemler (resetViewportZoom, visualViewport watchdog) zoom'u
// SADECE JS/CSS seviyesinde engelliyor. Ama WKWebView'in zoom'u aslında
// UIScrollView'in kendi native pinchGestureRecognizer'ı + zoomScale'i
// üzerinden yönetiliyor ve bu, viewport direktifine her zaman %100 uymuyor
// (bilinen WebKit tuhaflığı — bkz. WebKit Bug 234584). Paylaşım sayfası gibi
// sistem overlay'leri dokunuş akışını kesince native taraf zoom'lu durumda
// takılı kalabiliyor ve JS bunu düzeltemiyor.
//
// ÇOK KATMANLI SAVUNMA (hepsi birden):
// 1. pinchGestureRecognizer'ı devre dışı bırak (kullanıcı pinch'i imkânsız).
// 2. min/max zoomScale'i 1.0'a sabitle (programatik zoom'a da kapı kapalı).
// 3. WebKit bu ayarları navigasyon/olay sonrası SIFIRLAYABİLDİĞİ için hafif
//    bir zamanlayıcı (1.5 sn'de bir) ayarları yeniden uygular ve zoomScale
//    1.0'dan sapmışsa anında geri çeker → zoom NE OLURSA OLSUN en geç ~1.5
//    saniye içinde kendini onarır.
// 4. Uygulama öne dönüşlerinde (didBecomeActive) anında sıfırla.
//
// Uygulamada istenen bir pinch-zoom özelliği yok (tüm ekranlar sabit ölçekli
// tasarlandı) — bu sertleştirme hiçbir işlevi kaybettirmez.
class SakinViewController: CAPBridgeViewController {
    private var zoomGuardTimer: Timer?

    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        hardenScrollView()

        // Uygulama öne her dönüşte anında sıfırla (paylaşım/arka plan sonrası).
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appDidBecomeActive),
            name: UIApplication.didBecomeActiveNotification,
            object: nil
        )

        // Kendi kendini onaran bekçi: WebKit pinch recognizer'ı / zoom sınırlarını
        // yeniden etkinleştirse bile 1.5 sn içinde geri alınır. Maliyeti ihmal
        // edilebilir (saniyede ~0.7 kez birkaç float karşılaştırması).
        zoomGuardTimer = Timer.scheduledTimer(withTimeInterval: 1.5, repeats: true) { [weak self] _ in
            self?.hardenScrollView()
        }
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        hardenScrollView()
    }

    @objc private func appDidBecomeActive() {
        hardenScrollView()
    }

    private func hardenScrollView() {
        guard let scrollView = self.webView?.scrollView else { return }
        if let pinch = scrollView.pinchGestureRecognizer, pinch.isEnabled {
            pinch.isEnabled = false
        }
        scrollView.bouncesZoom = false
        if scrollView.minimumZoomScale != 1.0 { scrollView.minimumZoomScale = 1.0 }
        if scrollView.maximumZoomScale != 1.0 { scrollView.maximumZoomScale = 1.0 }
        // Zoom bir şekilde 1.0'dan sapmışsa (takılı kalmış paylaşım-sonrası durum)
        // animasyonsuz anında geri çek.
        if abs(scrollView.zoomScale - 1.0) > 0.001 {
            scrollView.setZoomScale(1.0, animated: false)
        }
    }

    deinit {
        zoomGuardTimer?.invalidate()
        NotificationCenter.default.removeObserver(self)
    }
}
