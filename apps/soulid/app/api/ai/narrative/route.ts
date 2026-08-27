// Tek-kişi karne AI anlatımı — server-side Anthropic.
// Client ham GalacticReport gönderir, parse edilmiş sections döner.

import type { GalacticReport, NarrativeSections } from '@/lib/types';
import { buildSystemPrompt, buildUserPrompt } from '@/lib/narrative/prompt';
import { isStructured, parseNarrative } from '@/lib/narrative/parse';
import {
  corsResponse,
  corsPreflight,
  generateText,
  hasTextProvider,
  rateLimit,
  rateKey,
} from '../_shared';

export const runtime = 'edge';

export function OPTIONS() {
  return corsPreflight();
}

type Body = {
  report: Omit<GalacticReport, 'narrative' | 'summary' | 'sections'>;
  locale?: 'tr' | 'en';
};

export async function POST(request: Request) {
  const limit = rateLimit(rateKey(request, 'narrative'), 5);
  if (!limit.ok) {
    return corsResponse(
      { error: 'Rate limit aşıldı', retryAfter: limit.retryAfter },
      { status: 429 },
    );
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return corsResponse({ error: 'Geçersiz istek' }, { status: 400 });
  }
  if (!body?.report?.chart || !body?.report?.humanDesign || !body?.report?.numerology) {
    return corsResponse({ error: 'Eksik veri' }, { status: 400 });
  }

  if (!hasTextProvider()) {
    return corsResponse({ error: 'AI yapılandırılmadı', useFallback: true }, { status: 503 });
  }

  const locale = body.locale === 'en' ? 'en' : 'tr';

  // Groq (ücretsiz) → Anthropic (ücretli). Bölüm formatına uymayan çıktı
  // reddedilir ve sıradaki sağlayıcı denenir.
  // Prompt üretimi de try içinde: eksik/bozuk alan gelirse istemci statik
  // fallback'e düşebilsin (500 HTML değil, 502 + useFallback).
  try {
    const out = await generateText({
      system: buildSystemPrompt(locale),
      user: buildUserPrompt(body.report),
      maxTokens: 2400,
      validate: (text) => isStructured(parseNarrative(text)),
    });

    if (!out) {
      return corsResponse({ error: 'AI hatası', useFallback: true }, { status: 502 });
    }

    const parsed = parseNarrative(out.text);
    return corsResponse({
      sections: parsed satisfies NarrativeSections,
      provider: out.provider,
    });
  } catch (err) {
    console.warn('[api/ai/narrative] hata', err);
    return corsResponse({ error: 'AI hatası', useFallback: true }, { status: 502 });
  }
}
