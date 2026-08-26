// Ortak Edge helper — Anthropic istemcisi, CORS, basit auth gate.
// Tüm /api/ai/* route'ları buradan tüketir.

import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

export const CORS_HEADERS: Record<string, string> = {
  // Capacitor iOS app origin'i (soulprofile:// + capacitor://) ve web origin'i için.
  // CSP zaten frame-ancestors none ile clickjacking'i kapatıyor.
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export function corsResponse(body: unknown, init: ResponseInit = {}): Response {
  const res = NextResponse.json(body, init);
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}

export function corsPreflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function getAnthropic(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  // Edge runtime'da çalışır — dangerouslyAllowBrowser yok, gerek yok.
  return new Anthropic({ apiKey: key });
}

/**
 * Çağrı kaynağını teşhis et — entitlement kontrolü için kullanılır.
 * Authorization: Bearer <jwt> formatında supabase access token bekler.
 */
export type CallerIdentity = {
  userId: string | null;
  jwt: string | null;
};

export function readCaller(request: Request): CallerIdentity {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return { userId: null, jwt: null };
  const jwt = auth.slice(7);
  // JWT payload (middle segment) base64url decode — supabase ID
  try {
    const parts = jwt.split('.');
    if (parts.length !== 3) return { userId: null, jwt };
    const payload = JSON.parse(atob(parts[1]!.replace(/-/g, '+').replace(/_/g, '/'))) as {
      sub?: string;
      exp?: number;
    };
    if (!payload.sub) return { userId: null, jwt };
    if (payload.exp && payload.exp * 1000 < Date.now()) return { userId: null, jwt };
    return { userId: payload.sub, jwt };
  } catch {
    return { userId: null, jwt };
  }
}

/**
 * Verilen Supabase user_id için aktif 'premium' entitlement var mı?
 * Webhook'lar bu satırı yazar; deep-analysis route'u burayı sorar.
 */
export async function hasPremium(userId: string): Promise<boolean> {
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supaUrl || !supaServiceKey) return false;

  const url = `${supaUrl}/rest/v1/entitlements?user_id=eq.${encodeURIComponent(userId)}&entitlement=eq.premium&active=eq.true&select=expires_at&limit=1`;
  const res = await fetch(url, {
    headers: {
      apikey: supaServiceKey,
      Authorization: `Bearer ${supaServiceKey}`,
    },
  });
  if (!res.ok) return false;
  const rows = (await res.json()) as Array<{ expires_at?: string | null }>;
  if (rows.length === 0) return false;
  const row = rows[0]!;
  if (!row.expires_at) return true;
  return new Date(row.expires_at).getTime() > Date.now();
}

// ─── Metin üretimi: Groq (ücretsiz) → Anthropic (ücretli) zinciri ──────────
// Groq ücretsiz katmanı anlatım metinlerinin ana maliyetini sıfırlar. Groq
// OpenAI-uyumlu bir endpoint sunar. Llama, Claude kadar katı bölüm formatına
// uymayabildiği için çağıran route bir `validate` verir; doğrulama düşerse
// zincir bir sonraki sağlayıcıya geçer (sessiz bozuk çıktı yerine).

export type TextProvider = 'groq' | 'anthropic';

const GROQ_BASE = 'https://api.groq.com/openai/v1';
const GROQ_ENDPOINT = `${GROQ_BASE}/chat/completions`;
const ANTHROPIC_MODEL = 'claude-sonnet-4-6';

// GROQ MODEL SECIMI + OTOMATIK FALLBACK.
// Sakin tarafindaki netlify/functions/_groq.mjs ile ayni desen. Amac: bir model
// Groq tarafindan emekli edilince (or. llama-3.3-70b-versatile 16 Agu 2026'da
// kapandi, Compound Mini 21 Eyl 2026'da kapaniyor) uygulama COKMESIN; kod
// push'suz kendisi siradaki mevcut modele gecsin.
// Yeni/daha iyi model cikinca: asagidaki listenin BASINA gercek Groq ID'sini
// yaz, ya da push'suz cozum icin GROQ_MODEL env degiskenini ayarla.
const GROQ_PREF = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.6-27b'];

// Yayindaki model ID'leri (in-memory cache, cold-start basina 10 dk).
let _modelCache: { at: number; ids: Set<string> | null } = { at: 0, ids: null };
const MODEL_TTL_MS = 10 * 60 * 1000;

async function availableGroqIds(key: string): Promise<Set<string> | null> {
  const now = Date.now();
  if (_modelCache.ids && now - _modelCache.at < MODEL_TTL_MS) return _modelCache.ids;
  try {
    const r = await fetch(`${GROQ_BASE}/models`, { headers: { Authorization: `Bearer ${key}` } });
    if (r.ok) {
      const j = (await r.json()) as { data?: Array<{ id?: string }> };
      const ids = new Set((j?.data || []).map((m) => m && m.id).filter(Boolean) as string[]);
      if (ids.size) { _modelCache = { at: now, ids }; return ids; }
    }
  } catch { /* ag hatasi -> statik listeye guven */ }
  return null;
}

/** Denenecek modeller, en iyi -> yedek sirasiyla. Asla bos donmez. */
async function groqCandidates(key: string): Promise<string[]> {
  const override = (process.env.GROQ_MODEL || '').trim();
  const wanted = override ? [override, ...GROQ_PREF.filter((m) => m !== override)] : GROQ_PREF.slice();
  const ids = await availableGroqIds(key);
  if (!ids) return wanted;                       // liste alinamadi -> hepsini dene
  const avail = wanted.filter((m) => ids.has(m));
  return avail.length ? avail : wanted;          // liste bayat olabilir -> yine dene
}

// gpt-oss reasoning modeli: dar token butcesinde reasoning yaniti kirpmasin diye
// reasoning_effort:low. Diger modellerde gonderilmez (uyumsuzluk 400 vermesin).
function groqExtraFor(model: string): Record<string, unknown> {
  return model.startsWith('openai/gpt-oss') ? { reasoning_effort: 'low' } : {};
}

/** Qwen "thinking" modu <think>...</think> sizabilir; temizle. */
function stripThink(s: string): string {
  return s.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

async function callGroq(system: string, user: string, maxTokens: number): Promise<string | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  const candidates = await groqCandidates(key);
  for (const model of candidates) {
    try {
      const res = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model,
          ...groqExtraFor(model),
          // Groq'ta max_tokens deprecated — max_completion_tokens kullanılır.
          max_completion_tokens: maxTokens,
          temperature: 0.8,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
      });
      if (!res.ok) {
        console.warn('[ai] groq error', model, res.status, (await res.text()).slice(0, 300));
        // 400/404 = gecersiz/emekli model -> siradakini dene.
        // 429/500 = gecici hata -> modelleri bosa yakma, cik.
        if (res.status === 400 || res.status === 404) continue;
        return null;
      }
      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return stripThink(text) || null;
      return null;
    } catch (e) {
      console.warn('[ai] groq fetch failed', model, e);
      continue; // ag/timeout -> siradaki modeli dene
    }
  }
  return null;
}

async function callAnthropic(
  system: string,
  user: string,
  maxTokens: number,
): Promise<string | null> {
  const client = getAnthropic();
  if (!client) return null;
  try {
    const msg = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    });
    return (
      msg.content
        .map((b) => (b.type === 'text' ? b.text : ''))
        .join('\n')
        .trim() || null
    );
  } catch (e) {
    console.warn('[ai] anthropic error', e);
    return null;
  }
}

/**
 * Metni üret. Varsayılan sıra Groq (ücretsiz) → Anthropic (ücretli).
 * `preferQuality` ile sıra ters çevrilir — premium akışlar için.
 * `validate` verilirse, doğrulamayı geçmeyen çıktı reddedilip sıradaki
 * sağlayıcı denenir. Hepsi düşerse null döner (route statik fallback'e geçer).
 */
export async function generateText(opts: {
  system: string;
  user: string;
  maxTokens: number;
  preferQuality?: boolean;
  validate?: (text: string) => boolean;
}): Promise<{ text: string; provider: TextProvider } | null> {
  const order: TextProvider[] = opts.preferQuality
    ? ['anthropic', 'groq']
    : ['groq', 'anthropic'];

  for (const provider of order) {
    const text =
      provider === 'groq'
        ? await callGroq(opts.system, opts.user, opts.maxTokens)
        : await callAnthropic(opts.system, opts.user, opts.maxTokens);
    if (!text) continue;
    if (opts.validate && !opts.validate(text)) {
      console.warn(`[ai] ${provider} çıktısı doğrulamayı geçemedi — sıradaki sağlayıcı`);
      continue;
    }
    return { text, provider };
  }
  return null;
}

/** En az bir metin sağlayıcısı yapılandırılmış mı? */
export function hasTextProvider(): boolean {
  return Boolean(process.env.GROQ_API_KEY || process.env.ANTHROPIC_API_KEY);
}

/** Sade in-memory token-bucket: Edge isolate-bound, garanti vermez. */
const bucket = new Map<string, { tokens: number; refilledAt: number }>();

export function rateLimit(key: string, perMin = 10): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const refillRate = perMin / 60_000; // tokens per ms
  const entry = bucket.get(key) ?? { tokens: perMin, refilledAt: now };
  const refilled = Math.min(perMin, entry.tokens + (now - entry.refilledAt) * refillRate);
  if (refilled < 1) {
    const retryAfter = Math.ceil((1 - refilled) / refillRate / 1000);
    bucket.set(key, { tokens: refilled, refilledAt: now });
    return { ok: false, retryAfter };
  }
  bucket.set(key, { tokens: refilled - 1, refilledAt: now });
  return { ok: true };
}

export function rateKey(request: Request, prefix: string): string {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anon';
  return `${prefix}:${ip}`;
}
