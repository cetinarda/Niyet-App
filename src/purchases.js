import { Capacitor } from "@capacitor/core";
import { Purchases, LOG_LEVEL } from "@revenuecat/purchases-capacitor";

const YEARLY_ID = "app.sakin.life.yearly";
const LIFETIME_ID = "app.sakin.life.lifetime";
const ENTITLEMENT_ID = "premium";
const isNative = Capacitor.isNativePlatform();

const RC_API_KEY_IOS = "REPLACE_WITH_REVENUECAT_IOS_API_KEY";

let purchaseUpdateCallback = null;
let storeReady = false;

export function onPurchaseUpdate(callback) {
  purchaseUpdateCallback = callback;
}

export async function initStore() {
  if (!isNative) return false;
  if (RC_API_KEY_IOS === "REPLACE_WITH_REVENUECAT_IOS_API_KEY") {
    console.warn("RevenueCat API key not configured");
    return false;
  }
  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
    await Purchases.configure({ apiKey: RC_API_KEY_IOS });
    storeReady = true;
    const subbed = await checkEntitlement();
    if (subbed && purchaseUpdateCallback) purchaseUpdateCallback(true);
    return true;
  } catch (e) {
    console.warn("RevenueCat init failed:", e);
    return false;
  }
}

async function checkEntitlement() {
  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    const active = customerInfo.entitlements.active[ENTITLEMENT_ID];
    if (active) {
      localStorage.setItem("sakin_premium", "1");
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function isSubscribed() {
  return localStorage.getItem("sakin_premium") === "1";
}

export async function checkSubscriptionStatus() {
  if (!isNative || !storeReady) return isSubscribed();
  const result = await checkEntitlement();
  if (result) return true;
  return localStorage.getItem("sakin_premium") === "1";
}

async function findPackage(productId) {
  const { offerings } = await Purchases.getOfferings();
  if (!offerings.current) return null;
  const packages = offerings.current.availablePackages;
  return packages.find(p => p.product.identifier === productId) || null;
}

export async function purchaseProduct(productId) {
  if (!isNative || !storeReady) return { success: false, error: "not_available" };
  try {
    const pkg = await findPackage(productId);
    if (!pkg) return { success: false, error: "product_not_found" };
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    const active = customerInfo.entitlements.active[ENTITLEMENT_ID];
    if (active) {
      localStorage.setItem("sakin_premium", "1");
      if (purchaseUpdateCallback) purchaseUpdateCallback(true);
      return { success: true };
    }
    return { success: false, error: "not_entitled" };
  } catch (err) {
    if (err.code === "1" || err.userCancelled) {
      return { success: false, error: "user_cancelled" };
    }
    return { success: false, error: err.message || "purchase_failed" };
  }
}

export const purchaseYearly = () => purchaseProduct(YEARLY_ID);
export const purchaseLifetime = () => purchaseProduct(LIFETIME_ID);

export async function restorePurchases() {
  if (!isNative || !storeReady) return { success: false, error: "not_available" };
  try {
    const { customerInfo } = await Purchases.restorePurchases();
    const active = customerInfo.entitlements.active[ENTITLEMENT_ID];
    if (active) {
      localStorage.setItem("sakin_premium", "1");
      if (purchaseUpdateCallback) purchaseUpdateCallback(true);
      return { success: true };
    }
    return { success: false, error: "no_purchase" };
  } catch (err) {
    return { success: false, error: err.message || "restore_failed" };
  }
}
