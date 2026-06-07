import { Platform } from 'react-native';

// RevenueCat product / entitlement identifiers.
// Configure these in App Store Connect, Google Play Console, and RevenueCat dashboard.
export const ENTITLEMENT_ID = 'premium';
export const PRODUCT_IDS = {
  mikro: 'life.sakin.animals.mikro.monthly',
  premium: 'life.sakin.animals.premium.yearly',
} as const;

export type PlanKey = keyof typeof PRODUCT_IDS;

const REVENUECAT_KEYS = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '',
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '',
};

export const isIapAvailable = (): boolean => {
  if (Platform.OS === 'web') return false;
  const key = Platform.OS === 'ios' ? REVENUECAT_KEYS.ios : REVENUECAT_KEYS.android;
  return !!key;
};

let initPromise: Promise<void> | null = null;

async function ensureInit(): Promise<void> {
  if (!isIapAvailable()) throw new Error('iap-unavailable');
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const Purchases = (await import('react-native-purchases')).default;
    const key = Platform.OS === 'ios' ? REVENUECAT_KEYS.ios : REVENUECAT_KEYS.android;
    Purchases.configure({ apiKey: key });
  })();
  return initPromise;
}

export interface OfferingProduct {
  identifier: string;
  priceString: string;
  title: string;
  plan: PlanKey;
}

export async function fetchOfferings(): Promise<OfferingProduct[]> {
  await ensureInit();
  const Purchases = (await import('react-native-purchases')).default;
  const offerings = await Purchases.getOfferings();
  const current = offerings.current;
  if (!current) return [];
  const out: OfferingProduct[] = [];
  for (const pkg of current.availablePackages) {
    const id = pkg.product.identifier;
    const plan: PlanKey | undefined =
      id === PRODUCT_IDS.mikro ? 'mikro' :
      id === PRODUCT_IDS.premium ? 'premium' :
      undefined;
    if (!plan) continue;
    out.push({
      identifier: id,
      priceString: pkg.product.priceString,
      title: pkg.product.title,
      plan,
    });
  }
  return out;
}

export interface PurchaseResult {
  active: boolean;
  productId?: string;
  expiresAt?: string;
  willRenew: boolean;
}

function customerInfoToResult(info: any): PurchaseResult {
  const ent = info?.entitlements?.active?.[ENTITLEMENT_ID];
  if (!ent) return { active: false, willRenew: false };
  return {
    active: true,
    productId: ent.productIdentifier,
    expiresAt: ent.expirationDate ?? undefined,
    willRenew: !ent.willRenew === false,
  };
}

export async function purchase(plan: PlanKey): Promise<PurchaseResult> {
  await ensureInit();
  const Purchases = (await import('react-native-purchases')).default;
  const offerings = await Purchases.getOfferings();
  const productId = PRODUCT_IDS[plan];
  const pkg = offerings.current?.availablePackages.find(p => p.product.identifier === productId);
  if (!pkg) throw new Error('package-not-found');
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfoToResult(customerInfo);
}

export async function restore(): Promise<PurchaseResult> {
  await ensureInit();
  const Purchases = (await import('react-native-purchases')).default;
  const customerInfo = await Purchases.restorePurchases();
  return customerInfoToResult(customerInfo);
}

export async function fetchEntitlement(): Promise<PurchaseResult> {
  if (!isIapAvailable()) return { active: false, willRenew: false };
  try {
    await ensureInit();
    const Purchases = (await import('react-native-purchases')).default;
    const info = await Purchases.getCustomerInfo();
    return customerInfoToResult(info);
  } catch {
    return { active: false, willRenew: false };
  }
}
