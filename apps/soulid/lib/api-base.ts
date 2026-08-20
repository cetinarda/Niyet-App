// Capacitor iOS statik export'unda /api/* route'ları yok — uzaktan host'a
// fetch atılır. Web'de relative URL aynı origin'e gider.

import { isCapacitorNative } from './platform';

const PROD_HOST = 'https://soulprofile.life';

export function getApiBase(): string {
  if (typeof window === 'undefined') return '';
  if (isCapacitorNative()) return PROD_HOST;
  return '';
}
