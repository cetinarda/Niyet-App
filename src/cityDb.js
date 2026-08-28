// cityDb.js: lazy-loaded world city database.
//
// The data file (src/cities-data.json, ~1.4 MB raw / ~650 KB gzipped) is
// imported via dynamic import() so it ends up as a SEPARATE chunk in the
// Vite build. It only ships to the user when SmartCityInput needs it.
//
// Public API:
//   ensureCitiesLoaded()             → Promise<void>  (idempotent, cached)
//   lookupCityBig(normalizedQuery)   → [lat, lon, tz] | null   (sync, after load)
//   getCityNamesBig()                → string[] of normalized city names (sync)
//   findCityMatches(normalizedQuery) → array of normalized name keys (sync, after load)
//
// Data shape per row in cities-data.json:
//   [ name, lat, lon, tz, country, ascii? ]
//
// "Standard" UTC offsets (no DST): see scripts/build-cities.mjs for rationale.

let _loadingPromise = null;
let _loaded = false;
// Maps normalized-key → [lat, lon, tz]. Built once after JSON arrives.
const _byKey = new Map();
// Sorted array of normalized keys for autocomplete iteration.
let _keys = [];

// Same normalize as App.jsx: kept independent so this module is self-contained.
export function normalizeCityKey(s) {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/i̇/g, "i")
    .replace(/İ/g, "i");
}

function addRow(name, lat, lon, tz) {
  const k = normalizeCityKey(name);
  if (!k || _byKey.has(k)) return;
  _byKey.set(k, [lat, lon, tz]);
}

/** Idempotently fetches and indexes the big city JSON. */
export function ensureCitiesLoaded() {
  if (_loaded) return Promise.resolve();
  if (_loadingPromise) return _loadingPromise;
  _loadingPromise = import("./cities-data.json")
    .then(mod => {
      const rows = mod.default || mod;
      for (const r of rows) {
        // r = [name, lat, lon, tz, country, ascii?]
        const name = r[0];
        const lat = r[1];
        const lon = r[2];
        const tz = r[3];
        const ascii = r[5];
        addRow(name, lat, lon, tz);
        if (ascii && ascii !== name) addRow(ascii, lat, lon, tz);
      }
      _keys = Array.from(_byKey.keys()).sort();
      _loaded = true;
    })
    .catch(err => {
      // Keep failure non-fatal: small embedded DB still works.
      // eslint-disable-next-line no-console
      console.warn("[cityDb] failed to load cities-data.json:", err);
      _loadingPromise = null;
    });
  return _loadingPromise;
}

export function isCitiesLoaded() {
  return _loaded;
}

/** Direct exact-key lookup (returns null if not loaded or not found). */
export function lookupCityBig(normalizedQuery) {
  if (!normalizedQuery) return null;
  return _byKey.get(normalizedQuery) || null;
}

/** Sorted list of all normalized city keys (empty if not loaded). */
export function getCityNamesBig() {
  return _keys;
}

/**
 * Returns up to `limit` normalized keys matching the query.
 * Prefers prefix matches first, then substring matches.
 */
export function findCityMatches(normalizedQuery, limit = 8) {
  if (!normalizedQuery || _keys.length === 0) return [];
  const q = normalizedQuery;
  const prefix = [];
  const sub = [];
  for (const k of _keys) {
    if (k.startsWith(q)) {
      prefix.push(k);
      if (prefix.length >= limit) break;
    }
  }
  if (prefix.length < limit) {
    for (const k of _keys) {
      if (!k.startsWith(q) && k.includes(q)) {
        sub.push(k);
        if (prefix.length + sub.length >= limit) break;
      }
    }
  }
  return prefix.concat(sub).slice(0, limit);
}
