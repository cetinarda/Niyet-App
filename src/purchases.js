import { Capacitor } from "@capacitor/core";

const YEARLY_ID = "app.sakin.life.yearly";
const LIFETIME_ID = "app.sakin.life.lifetime";
const isNative = Capacitor.isNativePlatform();

let purchaseUpdateCallback = null;

export function onPurchaseUpdate(callback) {
  purchaseUpdateCallback = callback;
}

export async function initStore() {
  if (!isNative || !window.CdvPurchase) return false;

  const { store, ProductType, Platform } = window.CdvPurchase;

  store.register([
    { id: YEARLY_ID, type: ProductType.PAID_SUBSCRIPTION, platform: Platform.APPLE_APPSTORE },
    { id: LIFETIME_ID, type: ProductType.NON_CONSUMABLE, platform: Platform.APPLE_APPSTORE },
  ]);

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

export function isSubscribed() {
  if (!isNative || !window.CdvPurchase) {
    return localStorage.getItem("sakin_premium") === "1";
  }
  const { store } = window.CdvPurchase;
  const yearly = store.get(YEARLY_ID);
  const lifetime = store.get(LIFETIME_ID);
  if ((yearly && yearly.owned) || (lifetime && lifetime.owned)) {
    localStorage.setItem("sakin_premium", "1");
    return true;
  }
  return localStorage.getItem("sakin_premium") === "1";
}

export async function purchaseProduct(productId) {
  if (!isNative || !window.CdvPurchase) return { success: false, error: "not_available" };
  const product = window.CdvPurchase.store.get(productId);
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

export const purchaseYearly = () => purchaseProduct(YEARLY_ID);
export const purchaseLifetime = () => purchaseProduct(LIFETIME_ID);

export async function restorePurchases() {
  if (!isNative || !window.CdvPurchase) return { success: false, error: "not_available" };
  try {
    await window.CdvPurchase.store.restorePurchases();
    if (isSubscribed()) return { success: true };
    return { success: false, error: "no_purchase" };
  } catch (err) {
    return { success: false, error: err.message || "restore_failed" };
  }
}
