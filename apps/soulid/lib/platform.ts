// iOS Capacitor wrap'inde Stripe Checkout Apple guideline 3.1.1 ihlali olur.
// Bu helper ile native ortamı tespit edip web ödemeyi gizleriz, RevenueCat
// IAP akışına yönlendiririz.

export function isCapacitorNative(): boolean {
  if (typeof window === 'undefined') return false;
  // @ts-expect-error global eklenir
  return Boolean(window.Capacitor?.isNativePlatform?.());
}

export function platform(): 'ios' | 'android' | 'web' {
  if (typeof window === 'undefined') return 'web';
  // @ts-expect-error global eklenir
  const p = window.Capacitor?.getPlatform?.();
  if (p === 'ios') return 'ios';
  if (p === 'android') return 'android';
  return 'web';
}
