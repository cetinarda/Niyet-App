// Davet token'ı — HMAC-SHA256 imza + 30 gün expiry.
// PII (ad/koordinat) hâlâ URL'de ama tamper edilemez ve süresi dolar.
// Sürekli tek-kişi paylaşımı için en uygun trade-off; bir sonraki adım
// opaque ID + sunucu-side storage olur.

import type { BirthInput } from '../types';

type InvitePayload = {
  n: string;       // name (full)
  d: string;       // YYYY-MM-DD
  t: string;       // HH:MM
  tk: 0 | 1;       // birthTimeKnown
  p: string;       // place display
  lat: number;
  lon: number;
  tz: string;
  e: number;       // expiry epoch (ms)
  v: 2;            // schema version
};

const SCHEMA = 2;
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 gün
// App-level integrity salt — secret değil; clientside bundle'da. Amacı:
// rastgele tampering'i durdurmak ve API uyumluluğu sağlamak. Hassas
// confidentiality için server-side opaque-ID gerekir (sonraki sprint).
const SALT = 'soulprofile.invite.v2';

function toPayload(b: BirthInput): InvitePayload {
  return {
    n: b.fullName.slice(0, 80),
    d: b.birthDate,
    t: b.birthTime,
    tk: b.birthTimeKnown ? 1 : 0,
    p: b.birthPlace.slice(0, 120),
    lat: b.latitude,
    lon: b.longitude,
    tz: b.timezone,
    e: Date.now() + TTL_MS,
    v: SCHEMA,
  };
}

function fromPayload(p: InvitePayload): BirthInput {
  return {
    fullName: p.n,
    birthDate: p.d,
    birthTime: p.t,
    birthTimeKnown: p.tk === 1,
    birthPlace: p.p,
    latitude: p.lat,
    longitude: p.lon,
    timezone: p.tz,
  };
}

function bytesToB64Url(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]!);
  return (typeof btoa !== 'undefined' ? btoa(s) : Buffer.from(s, 'binary').toString('base64'))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function b64UrlToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const std = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = typeof atob !== 'undefined' ? atob(std) : Buffer.from(std, 'base64').toString('binary');
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function b64UrlEncode(s: string): string {
  return bytesToB64Url(new TextEncoder().encode(s));
}

function b64UrlDecode(s: string): string {
  return new TextDecoder().decode(b64UrlToBytes(s));
}

async function hmac(data: string): Promise<string> {
  const c =
    typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle
      ? globalThis.crypto
      : null;
  if (!c) {
    // Node fallback yok — synchronous bağlamda kullanma; runtime'da window var
    return '';
  }
  const key = await c.subtle.importKey(
    'raw',
    new TextEncoder().encode(SALT),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
  const sig = await c.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return bytesToB64Url(new Uint8Array(sig));
}

export async function encodeInvite(birth: BirthInput): Promise<string> {
  const payload = toPayload(birth);
  const body = b64UrlEncode(JSON.stringify(payload));
  const sig = await hmac(body);
  return `${body}.${sig}`;
}

export async function decodeInvite(token: string): Promise<BirthInput | null> {
  try {
    const [body, sig] = token.split('.');
    if (!body || !sig) return null;
    const expected = await hmac(body);
    if (expected !== sig) return null;
    const json = b64UrlDecode(body);
    const payload = JSON.parse(json) as InvitePayload;
    if (payload.v !== SCHEMA) return null;
    if (!payload.d || !payload.lat || !payload.lon) return null;
    if (typeof payload.e !== 'number' || payload.e < Date.now()) return null;
    return fromPayload(payload);
  } catch {
    return null;
  }
}

export async function inviteUrl(birth: BirthInput, origin?: string): Promise<string> {
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : 'https://soulprofile.life');
  const token = await encodeInvite(birth);
  // URL fragment'a koymak server log'larda PII bırakmaz — fakat sosyal medya
  // paylaşımlarında fragment bazı platformlarda korunmuyor. Compromise: query.
  return `${base}/match?i=${encodeURIComponent(token)}`;
}
