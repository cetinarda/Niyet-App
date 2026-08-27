// İki kişi uyum AI anlatımı — server-side Anthropic.
// Client iki GalacticReport + CompatibilityResult gönderir, parse edilmiş
// CompatNarrative döner.

import type { GalacticReport } from '@/lib/types';
import type { CompatibilityResult } from '@/lib/compatibility';
import {
  compatSystemPrompt,
  compatUserPrompt,
  parseCompatNarrative,
} from '@/lib/compatibility/narrative';
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
  a: GalacticReport;
  b: GalacticReport;
  r: CompatibilityResult;
  locale?: 'tr' | 'en';
};

export async function POST(request: Request) {
  const limit = rateLimit(rateKey(request, 'compat-narrative'), 10);
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
  if (!body?.a?.chart || !body?.b?.chart || !body?.r) {
    return corsResponse({ error: 'Eksik veri' }, { status: 400 });
  }

  if (!hasTextProvider()) {
    return corsResponse({ error: 'AI yapılandırılmadı', useFallback: true }, { status: 503 });
  }

  const locale = body.locale === 'en' ? 'en' : 'tr';

  try {
    const out = await generateText({
      system: compatSystemPrompt(locale),
      user: compatUserPrompt(body.a, body.b, body.r),
      maxTokens: 1800,
    });

    if (!out) {
      return corsResponse({ error: 'AI hatası', useFallback: true }, { status: 502 });
    }

    return corsResponse({ narrative: parseCompatNarrative(out.text), provider: out.provider });
  } catch (err) {
    console.warn('[api/ai/compat-narrative] hata', err);
    return corsResponse({ error: 'AI hatası', useFallback: true }, { status: 502 });
  }
}
