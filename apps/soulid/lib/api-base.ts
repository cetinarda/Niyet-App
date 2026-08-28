// Capacitor iOS statik export'unda /api/* route'ları yok: uzaktan host'a
// fetch atılır. Web'de relative URL aynı origin'e gider.

import { isCapacitorNative } from './platform';

const PROD_HOST = 'https://soulprofile.life';

// Sakin embed'i (/embedded/soulid/): iframe'in KENDİ window'u var ve orada
// `window.Capacitor` TANIMLI DEĞİL → isCapacitorNative() false döner. Eski kod
// bu yüzden göreli "/api/ai/..." isterdi, sakin.life'ta böyle bir route
// olmadığı için 404 alır ve anlatı metinleri hiç gelmezdi (test ile yakalandı).
// Embed bundle'ı statiktir, yanında sunucu yoktur: API daima uzak host'a gider.
const IS_EMBED = Boolean(process.env.NEXT_PUBLIC_EMBED_BASE);

export function getApiBase(): string {
  if (typeof window === 'undefined') return '';
  if (IS_EMBED) return PROD_HOST;
  if (isCapacitorNative()) return PROD_HOST;
  return '';
}
