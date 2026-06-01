import Foundation
import Capacitor
import MediaPlayer
import AVFoundation
import UIKit

/// Sakin Now Playing — Lock-screen / Control Center / Dynamic Island bridge.
///
/// Why this exists: Sakin declares `UIBackgroundModes=audio` so Web Audio frequency
/// tones can keep playing after the user locks the screen. Apple guideline 2.5.4
/// requires apps that declare background audio to expose Now Playing controls;
/// otherwise the app risks App Store rejection. This plugin wires the JS audio
/// state into `MPNowPlayingInfoCenter` and registers `MPRemoteCommandCenter`
/// handlers so Play / Pause / Stop work from the lock screen.
///
/// JS surface (called via Capacitor.Plugins.SakinNowPlaying):
///   show({ title, artist }) — start Now Playing session (artwork = app icon).
///   updateState({ playing })  — flip the UI between play/pause without resetting metadata.
///   clear()                   — tear down the Now Playing entry.
///
/// JS receives back via window events:
///   "sakin-nowplaying-play"  (user tapped play on lock screen)
///   "sakin-nowplaying-pause" (user tapped pause)
///   "sakin-nowplaying-stop"  (user tapped stop)
///
/// Notes:
/// - We don't manage AVAudioSession here; AppDelegate already activates .playback at
///   launch. Re-activating here would risk interrupting other apps' audio.
/// - Artwork uses the bundled AppIcon (the largest one Apple keeps in the catalog).
///   On real devices the lock screen shows the icon; on simulator it sometimes
///   falls back to a generic glyph — a known iOS simulator limitation.
@objc(SakinNowPlaying)
public class SakinNowPlaying: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SakinNowPlayingPlugin"
    public let jsName = "SakinNowPlaying"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "show",        returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "updateState", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clear",       returnType: CAPPluginReturnPromise)
    ]

    private var commandsRegistered = false

    @objc func show(_ call: CAPPluginCall) {
        let title  = call.getString("title")  ?? "Sakin Frekans"
        let artist = call.getString("artist") ?? "Sakin"
        DispatchQueue.main.async {
            self.registerCommandsIfNeeded()
            self.publishNowPlaying(title: title, artist: artist, playing: true)
            call.resolve()
        }
    }

    @objc func updateState(_ call: CAPPluginCall) {
        let playing = call.getBool("playing") ?? true
        DispatchQueue.main.async {
            var info = MPNowPlayingInfoCenter.default().nowPlayingInfo ?? [:]
            info[MPNowPlayingInfoPropertyPlaybackRate] = playing ? 1.0 : 0.0
            info[MPNowPlayingInfoPropertyElapsedPlaybackTime] = 0
            MPNowPlayingInfoCenter.default().nowPlayingInfo = info
            call.resolve()
        }
    }

    @objc func clear(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
            call.resolve()
        }
    }

    // MARK: - Internals

    private func publishNowPlaying(title: String, artist: String, playing: Bool) {
        var info: [String: Any] = [:]
        info[MPMediaItemPropertyTitle]  = title
        info[MPMediaItemPropertyArtist] = artist
        info[MPMediaItemPropertyAlbumTitle] = "Sakin"
        info[MPNowPlayingInfoPropertyPlaybackRate] = playing ? 1.0 : 0.0
        info[MPNowPlayingInfoPropertyElapsedPlaybackTime] = 0
        // Tones are continuous; no fixed duration. Leave duration out so the UI
        // doesn't render a progress bar.

        if let art = loadArtwork() {
            let artwork = MPMediaItemArtwork(boundsSize: art.size) { _ in art }
            info[MPMediaItemPropertyArtwork] = artwork
        }
        MPNowPlayingInfoCenter.default().nowPlayingInfo = info
    }

    private func loadArtwork() -> UIImage? {
        // AppIcon name resolves at runtime to the largest icon in the asset catalog.
        if let img = UIImage(named: "AppIcon") { return img }
        // Fallback: try the explicit 1024 marketing icon shipped in /public.
        if let url = Bundle.main.url(forResource: "sakin-app-icon-1024", withExtension: "png", subdirectory: "public"),
           let data = try? Data(contentsOf: url),
           let img = UIImage(data: data) {
            return img
        }
        return nil
    }

    private func registerCommandsIfNeeded() {
        guard !commandsRegistered else { return }
        commandsRegistered = true

        let cc = MPRemoteCommandCenter.shared()

        cc.playCommand.isEnabled = true
        cc.playCommand.addTarget { [weak self] _ in
            self?.notifyJS(eventName: "sakin-nowplaying-play")
            return .success
        }

        cc.pauseCommand.isEnabled = true
        cc.pauseCommand.addTarget { [weak self] _ in
            self?.notifyJS(eventName: "sakin-nowplaying-pause")
            return .success
        }

        cc.togglePlayPauseCommand.isEnabled = true
        cc.togglePlayPauseCommand.addTarget { [weak self] _ in
            // We don't know current state authoritatively here; let JS decide.
            self?.notifyJS(eventName: "sakin-nowplaying-toggle")
            return .success
        }

        cc.stopCommand.isEnabled = true
        cc.stopCommand.addTarget { [weak self] _ in
            self?.notifyJS(eventName: "sakin-nowplaying-stop")
            return .success
        }

        // Disable seek/next/previous — single continuous tone, not a track list.
        cc.nextTrackCommand.isEnabled = false
        cc.previousTrackCommand.isEnabled = false
        cc.changePlaybackPositionCommand.isEnabled = false
        cc.seekForwardCommand.isEnabled = false
        cc.seekBackwardCommand.isEnabled = false
        cc.skipForwardCommand.isEnabled = false
        cc.skipBackwardCommand.isEnabled = false
    }

    private func notifyJS(eventName: String) {
        // Dispatch on the bridge's webview, on the main thread.
        DispatchQueue.main.async {
            guard let webView = self.bridge?.webView else { return }
            let js = "window.dispatchEvent(new CustomEvent('\(eventName)'))"
            webView.evaluateJavaScript(js, completionHandler: nil)
        }
    }
}
