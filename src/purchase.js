import { Capacitor } from "@capacitor/core";

const PRODUCT_ID = "sakin_lifetime_premium";
const isNative = Capacitor.isNativePlatform();

let storeReady = false;
let storeProduct = null;

export async function initStore() {
  if (!isNative || storeReady) return;
  if (!window.CdvPurchase) return;

  const { store, ProductType, Platform } = window.CdvPurchase;

  store.register([{
    id: PRODUCT_ID,
    type: ProductType.NON_CONSUMABLE,
    platform: Platform.APPLE_APPSTORE,
  }]);

  store.when()
    .productUpdated((p) => { if (p.id === PRODUCT_ID) storeProduct = p; })
    .approved((t) => t.verify())
    .verified((t) => t.finish());

  await store.initialize([Platform.APPLE_APPSTORE]);
  storeReady = true;
}

export function getProduct() {
  return storeProduct;
}

export function getPrice() {
  if (storeProduct?.pricing?.price) return storeProduct.pricing.price;
  return "$9.99";
}

export async function purchaseLifetime() {
  if (!isNative || !storeReady) {
    return { ok: false, reason: "not_native" };
  }
  if (!storeProduct) {
    return { ok: false, reason: "product_not_found" };
  }
  const offer = storeProduct.getOffer();
  if (!offer) return { ok: false, reason: "no_offer" };

  try {
    await offer.order();
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e.message || "purchase_failed" };
  }
}

export async function restorePurchases() {
  if (!isNative || !window.CdvPurchase) {
    return { ok: false, reason: "not_native" };
  }
  try {
    await window.CdvPurchase.store.restorePurchases();
    const p = window.CdvPurchase.store.get(PRODUCT_ID);
    if (p?.owned) return { ok: true };
    return { ok: false, reason: "not_found" };
  } catch (e) {
    return { ok: false, reason: e.message || "restore_failed" };
  }
}

export function isProductOwned() {
  if (!storeProduct) return false;
  return storeProduct.owned === true;
}
