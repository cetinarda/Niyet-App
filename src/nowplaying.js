// Sakin Now Playing: thin JS wrapper around the native SakinNowPlaying Capacitor plugin.
//
// Purpose: keep `src/App.jsx` blissfully ignorant of native specifics. On non-iOS
// (web preview, Android, simulator-without-plugin), every function silently no-ops
// so the same call sites work everywhere.
//
// Native bridge lives in `ios/App/App/SakinNowPlaying.swift`.

import { Capacitor } from "@capacitor/core";

const isNative = Capacitor.isNativePlatform();

function plugin() {
  try {
    if (!isNative) return null;
    const p = Capacitor.Plugins?.SakinNowPlaying;
    return p || null;
  } catch (_) {
    return null;
  }
}

/**
 * Begin a Now Playing session. Lock-screen / Control Center / Dynamic Island
 * will display title + artist + app-icon artwork while the audio is alive.
 *
 * @param {Object} opts
 * @param {string} [opts.title]  e.g. "528 Hz · Sevgi Frekansı"
 * @param {string} [opts.artist] defaults to "Sakin"
 */
export function showNowPlaying({ title, artist } = {}) {
  const p = plugin();
  if (!p) return;
  try { p.show({ title: title || "Sakin Frekans", artist: artist || "Sakin" }); } catch (_) {}
}

/**
 * Update only the playback indicator without re-publishing metadata.
 * Use after a remote-control pause/play so the lock-screen UI matches reality.
 */
export function updateNowPlayingState(playing) {
  const p = plugin();
  if (!p) return;
  try { p.updateState({ playing: !!playing }); } catch (_) {}
}

/**
 * Tear down the Now Playing entry. Call when audio fully stops.
 */
export function clearNowPlaying() {
  const p = plugin();
  if (!p) return;
  try { p.clear(); } catch (_) {}
}

/**
 * Subscribe to lock-screen remote-control events.
 * Returns an unsubscribe function.
 *
 * Events fired by the native side:
 *   "sakin-nowplaying-play": user tapped play on the lock screen
 *   "sakin-nowplaying-pause": user tapped pause
 *   "sakin-nowplaying-stop": user tapped stop
 *   "sakin-nowplaying-toggle": user tapped play/pause toggle (e.g. AirPods)
 */
export function onRemoteCommand(handlers = {}) {
  const map = [
    ["sakin-nowplaying-play",   handlers.onPlay],
    ["sakin-nowplaying-pause",  handlers.onPause],
    ["sakin-nowplaying-stop",   handlers.onStop],
    ["sakin-nowplaying-toggle", handlers.onToggle],
  ];
  const wired = [];
  map.forEach(([ev, fn]) => {
    if (typeof fn !== "function") return;
    const h = () => { try { fn(); } catch (_) {} };
    window.addEventListener(ev, h);
    wired.push([ev, h]);
  });
  return () => wired.forEach(([ev, h]) => window.removeEventListener(ev, h));
}
