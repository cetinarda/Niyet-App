// BÜYÜK GİZLİ ANAHTARLAR: ortam değişkeni YERİNE Netlify Blobs (Eyl 2026).
// Neden: Netlify fonksiyonları AWS Lambda'da çalışır; fonksiyon kapsamındaki
// TÜM ortam değişkenlerinin toplamı 4 KB'ı geçemez. FCM servis hesabı JSON'u
// tek başına ~2,3 KB; Apple abonelik anahtarı eklenince yayın "Your environment
// variables exceed the 4KB limit" hatasıyla durdu. Büyük anahtarlar artık
// site içi "sakin-secrets" deposunda, `secrets-admin` panelinden girilir.
// Ortam değişkeni hâlâ tanımlıysa ÖNCELİK onda (geçiş sırasında kesinti olmasın).
// Küçük kimlikler (APNS_KEY_ID, APPLE_ISSUER_ID vb.) ortam değişkeninde kalır.
import { getStore } from "@netlify/blobs";

export const SECRET_NAMES = ["FCM_SA_JSON", "APNS_PRIVATE_KEY", "APPLE_PRIVATE_KEY", "GOOGLE_SA_KEY"];
const cache = new Map();
const TTL = 5 * 60 * 1000;

export function secretStore() { return getStore("sakin-secrets"); }

export async function secret(name) {
  const env = process.env[name];
  if (env) return env;
  const c = cache.get(name);
  if (c && Date.now() - c.t < TTL) return c.v;
  let v = "", ok = true;
  try { v = (await secretStore().get(name)) || ""; } catch { v = ""; ok = false; }
  // Okuma HATASI önbelleğe alınmaz; boş değer yalnızca kısa süre (yeni kaydedilen
  // anahtar diğer fonksiyon örneklerinde de hemen görünsün).
  if (ok) cache.set(name, { v, t: v ? Date.now() : Date.now() - TTL + 30000 });
  return v;
}
export function clearSecretCache() { cache.clear(); }
