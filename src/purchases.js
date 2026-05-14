import { Capacitor } from "@capacitor/core";

const YEARLY_ID = "app.sakin.life.yearly";
const LIFETIME_ID = "app.sakin.life.lifetime";
const isNative = Capacitor.isNativePlatform();

let purchaseUpdateCallback = null;
let storeReady = false;
let lastInitError = null;

export function onPurchaseUpdate(callback) {
  purchaseUpdateCallback = callback;
}

export function getInitError() {
  return lastInitError;
}

function waitForDeviceReady(timeoutMs = 10000) {
  return new Promise((resolve) => {
    if (!window.cordova && !window.Capacitor) {
      console.log("[IAP] no cordova/capacitor env, skipping deviceready wait");
      return resolve(true);
    }
    let done = false;
    const finish = (reason) => {
      if (done) return;
      done = true;
      console.log("[IAP] deviceready resolved via:", reason);
      resolve(true);
    };
    document.addEventListener("deviceready", () => finish("event"), { once: true });
    setTimeout(() => finish("timeout"), timeoutMs);
  });
}

async function waitForCdvPurchase(timeoutMs = 10000) {
  await waitForDeviceReady(timeoutMs);
  const start = Date.now();
  while (!window.CdvPurchase) {
    if (Date.now() - start > timeoutMs) {
      console.warn("[IAP] CdvPurchase global never appeared after deviceready");
      return false;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  return true;
}

export async function initStore() {
  if (!isNative) {
    lastInitError = "not_native";
    return false;
  }

  const ready = await waitForCdvPurchase();
  if (!ready || !window.CdvPurchase) {
    lastInitError = "plugin_not_loaded";
    console.warn("[IAP] cordova-plugin-purchase not loaded after timeout");
    return false;
  }

  try {
    const { store, ProductType, Platform, LogLevel } = window.CdvPurchase;

    const isIOS = Capacitor.getPlatform() === "ios";
    const platform = isIOS ? Platform.APPLE_APPSTORE : Platform.GOOGLE_PLAY;

    if (LogLevel) store.verbosity = LogLevel.WARNING;

    store.register([
      { id: YEARLY_ID, type: ProductType.PAID_SUBSCRIPTION, platform },
      { id: LIFETIME_ID, type: ProductType.NON_CONSUMABLE, platform },
    ]);

    store.error((err) => {
      console.warn("[IAP] store error:", err?.code, err?.message);
    });

    store.when()
      .approved((transaction) => {
        console.log("[IAP] approved:", transaction.products?.map(p => p.id));
        return transaction.verify();
      })
      .verified((receipt) => {
        console.log("[IAP] verified");
        receipt.finish();
        localStorage.setItem("sakin_premium", "1");
        if (purchaseUpdateCallback) purchaseUpdateCallback(true);
      });

    await store.initialize([platform]);
    storeReady = true;
    lastInitError = null;
    console.log("[IAP] store initialized");
    return true;
  } catch (e) {
    lastInitError = e?.message || "init_failed";
    console.warn("[IAP] init exception:", e);
    return false;
  }
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
  if (!isNative) return { success: false, error: "not_native" };
  if (!window.CdvPurchase) return { success: false, error: "plugin_not_loaded" };
  if (!storeReady) {
    const ok = await initStore();
    if (!ok) return { success: false, error: lastInitError || "init_failed" };
  }
  const product = window.CdvPurchase.store.get(productId);
  if (!product) {
    console.warn("[IAP] product not found:", productId);
    return { success: false, error: "product_not_found" };
  }
  const offer = product.getOffer();
  if (!offer) {
    console.warn("[IAP] no offer for:", productId);
    return { success: false, error: "no_offer" };
  }
  try {
    const result = await window.CdvPurchase.store.order(offer);
    if (result && result.isError) {
      console.warn("[IAP] order error:", result.code, result.message);
      return { success: false, error: result.message || "order_failed" };
    }
    return { success: true };
  } catch (err) {
    console.warn("[IAP] order exception:", err);
    return { success: false, error: err?.message || "purchase_failed" };
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
    return { success: false, error: err?.message || "restore_failed" };
  }
}
