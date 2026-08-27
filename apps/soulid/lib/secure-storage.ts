'use client';

// localStorage encrypted wrapper — AES-GCM 256-bit, WebCrypto.
//
// Threat model: tarayıcı DevTools'da plain PII görünmesin, dosya
// sistemine kazınan store'da plaintext kalmasın. Aynı origin'de XSS
// veya açık DevTools'lu motivated attacker'a karşı koruma vermez —
// key client bundle'da. "Defense in depth" katmanı.
//
// Key derivation: app salt + tarayıcı-spesifik random salt (ilk seferde
// üretilir, localStorage'da saklanır). Aynı tarayıcı → aynı key.
// Yeni tarayıcı → yeni key (ciphertext taşınamaz).

const APP_SALT = 'soulprofile.secure-storage.v1';
const SALT_KEY = '__sp.s';

type Cached = { key: CryptoKey | null };
const cache: Cached = { key: null };

function getBrowserSalt(): string {
  if (typeof localStorage === 'undefined') return APP_SALT;
  let s = localStorage.getItem(SALT_KEY);
  if (s) return s;
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  s = btoa(String.fromCharCode(...arr));
  localStorage.setItem(SALT_KEY, s);
  return s;
}

async function getKey(): Promise<CryptoKey | null> {
  if (cache.key) return cache.key;
  if (typeof crypto === 'undefined' || !crypto.subtle) return null;
  try {
    const seed = `${APP_SALT}:${getBrowserSalt()}`;
    const seedBytes = new TextEncoder().encode(seed);
    const hash = await crypto.subtle.digest('SHA-256', seedBytes);
    cache.key = await crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, [
      'encrypt',
      'decrypt',
    ]);
    return cache.key;
  } catch {
    return null;
  }
}

function toB64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]!);
  return btoa(s);
}

function fromB64(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const ENC_PREFIX = 'v1:';

/** plain JSON → encrypted base64 string (kaydet) */
export async function secureSet(key: string, value: unknown): Promise<void> {
  if (typeof localStorage === 'undefined') return;
  const k = await getKey();
  const json = JSON.stringify(value);
  if (!k) {
    // crypto yoksa plaintext yaz (graceful degrade)
    localStorage.setItem(key, json);
    return;
  }
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, new TextEncoder().encode(json));
  const combined = new Uint8Array(iv.length + ct.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ct), iv.length);
  localStorage.setItem(key, ENC_PREFIX + toB64(combined));
}

/** encrypted base64 → plain JSON (oku) */
export async function secureGet<T>(key: string): Promise<T | null> {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(key);
  if (raw == null) return null;
  // Legacy plaintext data — geriye dönük uyumluluk
  if (!raw.startsWith(ENC_PREFIX)) {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }
  const k = await getKey();
  if (!k) return null;
  try {
    const combined = fromB64(raw.slice(ENC_PREFIX.length));
    const iv = combined.slice(0, 12);
    const ct = combined.slice(12);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, k, ct);
    return JSON.parse(new TextDecoder().decode(pt)) as T;
  } catch {
    // Key değişmişse veya bozulmuşsa — sessiz null dön
    return null;
  }
}

export function secureRemove(key: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(key);
}
