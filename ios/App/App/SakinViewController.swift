import UIKit
import Capacitor
import WebKit
import AVFoundation

// AMAÇ: Paylaşım sayfası (share sheet) kapandıktan sonra uygulamanın ZOOM'LU/
// BÜYÜMÜŞ TAKILI kalması hatasını kökten çözmek.
//
// KÖK SEBEP (kaynak-doğrulamalı araştırma):
// - Bu, belgelenmiş ama framework'te hiç düzeltilmemiş bir Capacitor/WKWebView
//   hatası: capacitor#2955 + #2979. ÜÇÜNCÜ PARTİ bir paylaşım hedefi (WhatsApp
//   vb. extension) seçilince iOS uygulamayı arkada ölçekliyor; sheet kapanınca
//   bu ölçek/transform GERİ ALINMIYOR. Jest (pinch) zoom'u DEĞİL — kalıntı
//   native ölçek durumu. JS'in bunu görmesi/düzeltmesi imkânsız (UIKit
//   transform'u visualViewport'a yansımaz, JS'te sayfa ölçeği API'si yok).
// - WebKit, HER layer-tree commit'inde min/max zoomScale + zoom-enabled
//   bayraklarını yeniden yazar (WKWebViewIOS.mm: _updateScrollViewForTransaction).
//   Yani bu değerleri bir kez set etmek KALICI DEĞİL. Pinch'i kapatmanın doğru
//   yolu scrollViewWillBeginZooming içinde her seferinde kapatmak — Capacitor
//   zaten bunu yapıyor; biz scrollView.delegate'ini devralınca aynı davranışı
//   birebir taşıyoruz (aşağıda), yoksa sessizce kaybolur.
//
// ÇÖZÜM: Kendi kendini onaran "heal" mekanizması — olası ÜÇ kalıntıyı da kapsar:
//   (A) scrollView.zoomScale != 1 → animasyonsuz 1.0'a çek (public API reset)
//   (B) webView/window/rootView'da kalıntı UIKit transform'u → identity'ye döndür
//       (capacitor#2979'un asıl mekanizması; scroll-view API'sinin ulaşamadığı katman)
//   (C) bir şey onarıldıysa frame'i 0.5pt oynatıp geri al → WebKit'in dinamik
//       viewport yeniden hesaplamasını tetikler (yerleşim/ölçek yeniden kurulur)
// TETİKLEYİCİLER (hiçbir tek sinyal garantili değil, üçü birden):
//   - UIApplication.didBecomeActiveNotification + kademeli (0/0.3/1sn) heal
//     (üçüncü-parti extension kapanışında uygulama yeniden aktif olur)
//   - 0.5 sn'lik hafif watchdog (tolerance'lı; maliyeti ihmal edilebilir)
//   - scrollViewDidZoom delegate'i (ölçek sapması anında yakalanır)
// KORUMA: presentedViewController != nil iken (sheet hâlâ açık/animasyonda)
// ASLA müdahale etme — yoksa sheet'in kart animasyonuyla görünür şekilde kavga eder.
//
// NSLog satırı bilinçli: cihaz logunda hangi kalıntının (A mı B mi) ateşlediğini
// gösterir; hiç ateşlemiyorsa ama görüntü hâlâ "zoom'lu" ise sorun native ölçek
// değil web-içi yerleşimdir (o zaman yanlış ağaçtayız demektir).
class SakinViewController: CAPBridgeViewController, UIScrollViewDelegate {
    private var watchdog: Timer?
    private var volumeObs: NSKeyValueObservation?

    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        // Capacitor'ın dış scroll delegate'ini, davranışının bir üst kümesiyle değiştir.
        // (WKScrollView tek bir dış delegate destekler; Capacitor'ınki yalnızca
        // scrollViewWillBeginZooming yapıyordu — aşağıda birebir kopyalandı.)
        webView?.scrollView.delegate = self

        // SES TUŞU → SESİ DİRİLT (kullanıcı: "ses kapalıysa ses yükseltme tuşuna
        // basınca da ses açılsın; bazen ses kapalıysa çalmıyor, el refleks olarak
        // ses tuşuna gidiyor"). Ses tuşları web'den yakalanamaz; native tarafta
        // AVAudioSession.outputVolume KVO ile izlenir. Değişince: oturumu yeniden
        // etkinleştir + web tarafındaki askıda (suspended/interrupted) AudioContext'leri
        // dirilt. Kategori zaten .playback (AppDelegate) — sessiz anahtarı yok sayılır.
        let session = AVAudioSession.sharedInstance()
        try? session.setActive(true)
        volumeObs = session.observe(\.outputVolume, options: [.new]) { [weak self] _, _ in
            DispatchQueue.main.async {
                try? AVAudioSession.sharedInstance().setActive(true)
                self?.webView?.evaluateJavaScript(
                    "window.__sakinResumeAudio && window.__sakinResumeAudio();", completionHandler: nil)
            }
        }

        NotificationCenter.default.addObserver(
            self, selector: #selector(scheduleHeal),
            name: UIApplication.didBecomeActiveNotification, object: nil)

        let t = Timer(timeInterval: 0.5, repeats: true) { [weak self] _ in self?.healIfNeeded() }
        t.tolerance = 0.25
        RunLoop.main.add(t, forMode: .common)
        watchdog = t
    }

    // Capacitor'ın zoomEnabled=false stok davranışı, birebir korunur:
    // WebKit pinch recognizer'ı her layer-tree commit'inde yeniden etkinleştirir,
    // o yüzden açılışta bir kez değil, BURADA her seferinde kapatılmalı.
    func scrollViewWillBeginZooming(_ scrollView: UIScrollView, with view: UIView?) {
        scrollView.pinchGestureRecognizer?.isEnabled = false
    }

    // Ölçek scroll-view yolundan saparsa anında düzelt.
    func scrollViewDidZoom(_ scrollView: UIScrollView) { healIfNeeded() }

    @objc private func scheduleHeal() {
        // Sheet sökümü didBecomeActive'den SONRA biter; birkaç kez dene.
        for delay: TimeInterval in [0, 0.3, 1.0] {
            DispatchQueue.main.asyncAfter(deadline: .now() + delay) { [weak self] in self?.healIfNeeded() }
        }
    }

    private func healIfNeeded() {
        // Aktif bir sunumla (paylaşım sayfası açıkken) asla kavga etme.
        guard presentedViewController == nil, let webView = self.webView else { return }
        var healed = false

        // (A) WebKit sayfa-ölçeği kalıntısı
        let sv = webView.scrollView
        if abs(sv.zoomScale - 1.0) > 0.001 {
            sv.setZoomScale(1.0, animated: false)
            sv.setContentOffset(.zero, animated: false)
            healed = true
        }

        // (B) Paylaşım-extension "kart" sunumundan kalan UIKit transform kalıntısı
        if webView.transform != .identity { webView.transform = .identity; healed = true }
        if let window = view.window {
            if window.transform != .identity {
                window.transform = .identity
                window.frame = window.screen.bounds
                healed = true
            }
            if let root = window.rootViewController?.view, root.transform != .identity {
                root.transform = .identity
                root.frame = window.bounds
                healed = true
            }
        }

        // (C) Onarım olduysa WebKit'e viewport'u yeniden hesaplat (frame dürtmesi).
        //     Yalnızca gerçekten onarım olunca — yoksa periyodik reflow/titreme olur.
        if healed {
            let frame = webView.frame
            webView.frame = frame.insetBy(dx: 0, dy: 0.5)
            DispatchQueue.main.async { webView.frame = frame }
            NSLog("[SakinZoom] healed zoom/transform state")
        }
    }

    deinit {
        watchdog?.invalidate()
        volumeObs?.invalidate()
        NotificationCenter.default.removeObserver(self)
    }
}
