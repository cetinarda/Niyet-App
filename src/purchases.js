import { Capacitor } from "@capacitor/core";

const YEARLY_ID = "app.sakin.life.yearly";
const LIFETIME_ID = "app.sakin.life.lifetime";
const isNative = Capacitor.isNativePlatform();

let purchaseUpdateCallback = null;
let productsLoadedCallback = null;
let storeReady = false;
let productsLoaded = false;
let lastInitError = null;

export function onPurchaseUpdate(callback) {
  purchaseUpdateCallback = callback;
}

export function onProductsLoaded(callback) {
  productsLoadedCallback = callback;
  if (productsLoaded) callback(true);
}

export function getInitError() {
  return lastInitError;
}

export function areProductsLoaded() {
  return productsLoaded;
}

function waitForDeviceReady(timeoutMs = 10000) {
  return new Promise((resolve) => {
    if (!window.cordova && !window.Capacitor) {
      return resolve(true);
    }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve(true);
    };
    document.addEventListener("deviceready", finish, { once: true });
    setTimeout(finish, timeoutMs);
  });
}

async function waitForCdvPurchase(timeoutMs = 10000) {
  await waitForDeviceReady(timeoutMs);
  const start = Date.now();
  while (!window.CdvPurchase) {
    if (Date.now() - start > timeoutMs) {
      console.warn("[IAP] CdvPurchase global never appeared");
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
    return false;
  }

  try {
    const CdvPurchase = window.CdvPurchase;
    const store = CdvPurchase.store;
    const ProductType = CdvPurchase.ProductType;
    const Platform = CdvPurchase.Platform;
    const LogLevel = CdvPurchase.LogLevel;

    const isIOS = Capacitor.getPlatform() === "ios";
    const platform = isIOS ? Platform.APPLE_APPSTORE : Platform.GOOGLE_PLAY;

    if (LogLevel) store.verbosity = LogLevel.WARNING;

    store.register([
      { id: YEARLY_ID, type: ProductType.PAID_SUBSCRIPTION, platform },
      { id: LIFETIME_ID, type: ProductType.NON_CONSUMABLE, platform },
    ]);

    store.error((err) => {
      console.warn("[IAP] store error:", err?.code, err?.message);
      lastInitError = `store_error_${err?.code || "unknown"}`;
    });

    store.when()
      .productUpdated((product) => {
        const yearly = store.get(YEARLY_ID);
        const lifetime = store.get(LIFETIME_ID);
        const yearlyReady = yearly && yearly.canPurchase;
        const lifetimeReady = lifetime && lifetime.canPurchase;
        if ((yearlyReady || lifetimeReady) && !productsLoaded) {
          productsLoaded = true;
          console.log("[IAP] products loaded:",
            yearly?.id, yearly?.canPurchase,
            lifetime?.id, lifetime?.canPurchase);
          if (productsLoadedCallback) productsLoadedCallback(true);
        }
      })
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

    const waitStart = Date.now();
    while (!productsLoaded && Date.now() - waitStart < 8000) {
      await new Promise((r) => setTimeout(r, 150));
    }

    if (!productsLoaded) {
      console.warn("[IAP] products did not load within 8s after init");
      lastInitError = "products_not_loaded";
    }

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
  const store = window.CdvPurchase.store;
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

  if (!productsLoaded) {
    const waitStart = Date.now();
    while (!productsLoaded && Date.now() - waitStart < 5000) {
      await new Promise((r) => setTimeout(r, 150));
    }
    if (!productsLoaded) {
      return { success: false, error: "products_not_loaded" };
    }
  }

  const product = window.CdvPurchase.store.get(productId);
  if (!product) {
    console.warn("[IAP] product not found:", productId,
      "available:", window.CdvPurchase.store.products.map(p => p.id));
    return { success: false, error: "product_not_found" };
  }

  if (!product.canPurchase) {
    console.warn("[IAP] product cannot be purchased:", productId,
      "state:", product.state, "owned:", product.owned);
    if (product.owned) return { success: false, error: "already_owned" };
    return { success: false, error: "product_not_purchasable" };
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
      if (result.code === window.CdvPurchase.ErrorCode?.PAYMENT_CANCELLED) {
        return { success: false, error: "cancelled", cancelled: true };
      }
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

export function getProductInfo(productId) {
  if (!isNative || !window.CdvPurchase) return null;
  const product = window.CdvPurchase.store.get(productId);
  if (!product) return null;
  const offer = product.getOffer();
  return {
    id: product.id,
    title: product.title,
    description: product.description,
    price: offer?.pricingPhases?.[0]?.price || "",
    canPurchase: product.canPurchase,
    owned: product.owned,
  };
}

export const YEARLY_PRODUCT_ID = YEARLY_ID;
export const LIFETIME_PRODUCT_ID = LIFETIME_ID;
