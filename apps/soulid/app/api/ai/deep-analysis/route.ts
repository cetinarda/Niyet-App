// Premium derin analiz — server-side Anthropic + entitlement gate.
// Bearer JWT'den user_id okunur, entitlements tablosunda 'premium' kontrol edilir.

import type { GalacticReport } from '@/lib/types';
import type { CompatibilityResult } from '@/lib/compatibility';
import {
  deepBuildSystem,
  deepBuildUser,
  deepParseSections,
  deepFallback,
  type DeepAnalysis,
} from '@/lib/compatibility/deep-analysis';
import {
  corsResponse,
  corsPreflight,
  generateText,
  hasTextProvider,
  hasPremium,
  readCaller,
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
  // Rate limit önce — entitlement sorgusunu beleş yememek için
  const limit = rateLimit(rateKey(request, 'deep-analysis'), 3);
  if (!limit.ok) {
    return corsResponse(
      { error: 'Rate limit aşıldı', retryAfter: limit.retryAfter },
      { status: 429 },
    );
  }

  // Entitlement gate — auth + premium zorunlu. ANCAK lansman FREE_MODE'unda
  // (mağazalara girene kadar her şey ücretsiz) bu gate atlanır; kötüye kullanımı
  // yukarıdaki rate limit sınırlar. NEXT_PUBLIC_FREE_MODE=0 ile eski gate döner.
  const FREE_MODE = process.env.NEXT_PUBLIC_FREE_MODE !== '0';
  if (!FREE_MODE) {
    const caller = readCaller(request);
    if (!caller.userId) {
      return corsResponse({ error: 'Giriş gerekli' }, { status: 401 });
    }
    const isPremium = await hasPremium(caller.userId);
    if (!isPremium) {
      return corsResponse({ error: 'Premium gerekli' }, { status: 403 });
    }
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
  const fb = deepFallback(body.a, body.b, body.r, locale);

  // Premium akış: parası ödenmiş özellik, kalite önce → Anthropic öncelikli,
  // Groq yalnız Claude düşerse devreye girer.
  try {
    const out = await generateText({
      system: deepBuildSystem(locale),
      user: deepBuildUser(body.a, body.b, body.r),
      maxTokens: 4000,
      preferQuality: true,
    });

    if (!out) {
      return corsResponse({ error: 'AI hatası', useFallback: true }, { status: 502 });
    }

    const parsed = deepParseSections(out.text);

    const merged: DeepAnalysis = {
      generatedAt: new Date().toISOString(),
      soulContract: parsed.soulContract || fb.soulContract,
      whyMet: parsed.whyMet || fb.whyMet,
      whatEachTeaches: {
        aTeachesB: parsed.whatEachTeaches?.aTeachesB || fb.whatEachTeaches.aTeachesB,
        bTeachesA: parsed.whatEachTeaches?.bTeachesA || fb.whatEachTeaches.bTeachesA,
      },
      conflictPattern: parsed.conflictPattern || fb.conflictPattern,
      separationDynamic: parsed.separationDynamic || fb.separationDynamic,
      reunionField: parsed.reunionField || fb.reunionField,
      longTermResonance: parsed.longTermResonance || fb.longTermResonance,
      karmicTheme: parsed.karmicTheme || fb.karmicTheme,
      practiceForCouple:
        parsed.practiceForCouple && parsed.practiceForCouple.length >= 3
          ? parsed.practiceForCouple
          : fb.practiceForCouple,
      closingBlessing: parsed.closingBlessing || fb.closingBlessing,
    };

    return corsResponse({ analysis: merged, provider: out.provider });
  } catch (err) {
    console.warn('[api/ai/deep-analysis] hata', err);
    return corsResponse({ error: 'AI hatası', useFallback: true }, { status: 502 });
  }
}
