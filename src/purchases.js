import { Capacitor } from "@capacitor/core";

const PRODUCT_ID = "app.sakin.life.yearly";
const isNative = Capacitor.isNativePlatform();

let purchaseUpdateCallback = null;

export function onPurchaseUpdate(callback) {
  purchaseUpdateCallback = callback;
}

export async function initStore() {
  if (!isNative || !window.CdvPurchase) return false;

  const { store, ProductType, Platform } = window.CdvPurchase;

  store.register([{
    id: PRODUCT_ID,
    type: ProductType.PAID_SUBSCRIPTION,
    platform: Platform.APPLE_APPSTORE,
  }]);

  store.when()
    .approved(transaction => transaction.verify())
    .verified(receipt => {
      receipt.finish();
      localStorage.setItem("sakin_premium", "1");
      if (purchaseUpdateCallback) purchaseUpdateCallback(true);
    });

  await store.initialize([Platform.APPLE_APPSTORE]);
  return true;
}

export function getProduct() {
  if (!isNative || !window.CdvPurchase) return null;
  return window.CdvPurchase.store.get(PRODUCT_ID);
}

export function isSubscribed() {
  if (!isNative || !window.CdvPurchase) {
    return localStorage.getItem("sakin_premium") === "1";
  }
  const product = window.CdvPurchase.store.get(PRODUCT_ID);
  if (product && product.owned) {
    localStorage.setItem("sakin_premium", "1");
    return true;
  }
  return localStorage.getItem("sakin_premium") === "1";
}

export async function purchaseYearly() {
  if (!isNative || !window.CdvPurchase) return { success: false, error: "not_available" };
  const product = window.CdvPurchase.store.get(PRODUCT_ID);
  if (!product) return { success: false, error: "product_not_found" };
  const offer = product.getOffer();
  if (!offer) return { success: false, error: "no_offer" };
  try {
    await window.CdvPurchase.store.order(offer);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message || "purchase_failed" };
  }
}

export async function restorePurchases() {
  if (!isNative || !window.CdvPurchase) return { success: false, error: "not_available" };
  try {
    await window.CdvPurchase.store.restorePurchases();
    const product = window.CdvPurchase.store.get(PRODUCT_ID);
    if (product && product.owned) {
      localStorage.setItem("sakin_premium", "1");
      if (purchaseUpdateCallback) purchaseUpdateCallback(true);
      return { success: true };
    }
    return { success: false, error: "no_subscription" };
  } catch (err) {
    return { success: false, error: err.message || "restore_failed" };
  }
}
