// ANLIK BİLDİRİM GÖNDERİM PANELİ (kullanıcı isteği, Eyl 2026: "istediğim zaman
// spontane bildirim gönderebileceğim bir modül")
// ---------------------------------------------------------------------------
// Aç:  https://sakin.life/.netlify/functions/push-admin?token=PUSH_ADMIN_TOKEN
// Form: metin (tüm diller için tek, ya da dil dil ayrı), hedef dil/platform,
// dokununca açılacak ekran, "yalnız test cihazına" (Ayarlar'daki cihaz kodu) ya da
// "herkese". Anlık mesajlar VARSAYILAN AÇIK: bildirim izni olan ve anahtarı
// kapatmamış cihazlar kayıtlı. ⚠️ Bu yüzden TANITIM gönderme (Apple 4.5.4).
//
// PUSH_ADMIN_TOKEN tanımlı değilse panel KAPALI. Ortak kod + env listesi: _push.mjs.
// ⚠️ Senkron fonksiyon (~10 sn tavan). Birkaç bin cihaza kadar yeter (APNs tek
// HTTP/2 bağlantıda çoklanıyor). Çok büyürse gönderimi "-background" fonksiyona taşı.
import { getStore } from "@netlify/blobs";
import { timingSafeEqual } from "node:crypto";
import { deviceCode, pushConfig, sendApnsBatch, sendFcmBatch, apnsPayload, fcmPayload } from "./_push.mjs";

const LANGS = ["tr", "en", "de", "es", "pt", "fr", "ja"];
const LANG_NAMES = { tr: "Türkçe", en: "English", de: "Deutsch", es: "Español", pt: "Português", fr: "Français", ja: "日本語" };
// Uygulamada GERÇEKTEN çizilen ekranlar (bildirim hedefi olarak doğrulanmış olanlar).
const SCREENS = [["", "Uygulama açılsın (hedef yok)"], ["bugun", "Bugün"], ["mandala", "Bağlan"], ["nefes", "Nefes"], ["ses", "Ses"], ["chakra", "Çakra"], ["harita", "Ben"], ["gun", "Gün görevleri"]];

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function tokenOk(given) {
  const want = process.env.PUSH_ADMIN_TOKEN || "";
  if (!want || !given) return false;
  const a = Buffer.from(String(given)), b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}
const html = (body, code = 200) => new Response(`<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Sakin · Anlık bildirim</title>
<style>
:root{color-scheme:dark}body{margin:0;background:#0b0918;color:#e8e2f5;font:15px/1.55 -apple-system,system-ui,Segoe UI,Roboto,sans-serif}
main{max-width:720px;margin:0 auto;padding:28px 16px 60px}h1{font-weight:300;letter-spacing:2px;font-size:22px;margin:0 0 4px}h2{font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#b8a4d8;margin:28px 0 10px;font-weight:500}
.card{background:rgba(255,255,255,.035);border:1px solid rgba(184,164,216,.18);border-radius:14px;padding:16px}.muted{color:#9a90b5;font-size:13px}
label{display:block;font-size:13px;color:#b8aed0;margin:12px 0 6px}input,select,textarea{width:100%;box-sizing:border-box;background:#150f2c;color:#f1ecf9;border:1px solid rgba(184,164,216,.3);border-radius:10px;padding:10px 12px;font:inherit}
textarea{min-height:84px;resize:vertical}.row{display:flex;gap:12px}.row>div{flex:1;min-width:0}details{margin-top:12px}summary{cursor:pointer;color:#e8c07a}
.btns{display:flex;gap:10px;margin-top:18px;flex-wrap:wrap}button{appearance:none;border-radius:100px;padding:11px 20px;font:inherit;letter-spacing:1px;cursor:pointer;border:1px solid rgba(232,192,122,.5);background:rgba(232,192,122,.12);color:#f6dfb0}
button.all{background:#e8c07a;color:#1a1030;border-color:#e8c07a;font-weight:600}table{width:100%;border-collapse:collapse;font-size:14px}td{padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)}td.n{text-align:right;color:#f1ecf9}
.ok{color:#8fd9a8}.bad{color:#ff8f8f}a{color:#e8c07a}
</style></head><body><main>${body}</main></body></html>`, { status: code, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });

async function loadDevices(store) {
  const keys = [];
  let res;
  try { res = await store.list({ prefix: "d/" }); } catch { return []; }
  for (const b of res.blobs || []) keys.push(b.key);
  const out = [];
  let i = 0;
  const worker = async () => { while (i < keys.length) { const k = keys[i++]; try { const r = await store.get(k, { type: "json" }); if (r && r.t) out.push({ key: k, ...r }); } catch {} } };
  await Promise.all(Array.from({ length: Math.min(16, keys.length) }, worker));
  return out;
}

function panel(token, devices, cfg, log, notice = "") {
  const by = (f) => devices.reduce((m, d) => (m[f(d)] = (m[f(d)] || 0) + 1, m), {});
  const pl = by((d) => d.p), lg = by((d) => d.l);
  const status = (ok, name, env) => ok ? `<span class="ok">✓ ${name} hazır</span>` : `<span class="bad">✗ ${name} kapalı</span> <span class="muted">(${env} eksik)</span>`;
  return `<h1>Sakin · Anlık bildirim</h1><div class="muted">Bildirim izni vermiş ve "Sakin'den anlık mesajlar"ı kapatmamış cihazlara gider. Varsayılan açık olduğu için yalnızca İÇERİK gönder (söz, gökyüzü günü, içten not); tanıtım/indirim/"yeni özellik" gönderme (Apple 4.5.4).</div>
${notice}
<h2>Durum</h2><div class="card"><table>
<tr><td>Kayıtlı cihaz</td><td class="n">${devices.length}</td></tr>
<tr><td>iPhone / Android</td><td class="n">${pl.ios || 0} / ${pl.android || 0}</td></tr>
<tr><td>Dillere göre</td><td class="n">${LANGS.map((l) => `${l} ${lg[l] || 0}`).join(" · ")}</td></tr>
<tr><td>iOS gönderimi</td><td class="n">${cfg.apnsError ? `<span class="bad">✗ ${esc(cfg.apnsError)}</span>` : status(!!cfg.apns, "APNs", "APNS_KEY_ID / APNS_TEAM_ID / APNS_PRIVATE_KEY")}</td></tr>
<tr><td>Android gönderimi</td><td class="n">${status(!!cfg.fcm, "FCM", "FCM_SA_JSON")}</td></tr>
</table></div>
<h2>Yeni bildirim</h2><form class="card" method="post" onsubmit="return this.mode.value!=='all'||confirm('Seçilen kitleye şimdi gönderilsin mi?')">
<input type="hidden" name="token" value="${esc(token)}"><input type="hidden" name="mode" value="test">
<label>Başlık (boş bırakılırsa "Sakin")</label><input name="title" maxlength="60" placeholder="Sakin">
<label>Mesaj (tüm diller için; aşağıda bir dile ayrı metin yazarsan o dilde o kullanılır)</label><textarea name="body" maxlength="240" placeholder="Bugün kendine bir nefes ayır."></textarea>
<details><summary>Dillere göre ayrı metin (isteğe bağlı)</summary>${LANGS.map((l) => `<label>${LANG_NAMES[l]}</label><textarea name="body_${l}" maxlength="240"></textarea>`).join("")}
<label style="display:flex;gap:8px;align-items:center"><input type="checkbox" name="only_written" value="1" style="width:auto"> Genel mesaj boşsa: yalnızca metin yazdığım dillere gönder</label></details>
<div class="row"><div><label>Dil</label><select name="lang"><option value="">Hepsi</option>${LANGS.map((l) => `<option value="${l}">${LANG_NAMES[l]}</option>`).join("")}</select></div>
<div><label>Platform</label><select name="platform"><option value="">Hepsi</option><option value="ios">iPhone</option><option value="android">Android</option></select></div></div>
<label>Dokununca açılacak ekran</label><select name="screen">${SCREENS.map(([v, n]) => `<option value="${v}">${n}</option>`).join("")}</select>
<label>Test cihaz kodu (uygulamada Ayarlar > Bildirimler'in altında yazar)</label><input name="code" maxlength="6" placeholder="örn. 4F7A2C" style="text-transform:uppercase">
<div class="btns"><button type="submit" onclick="this.form.mode.value='test'">Yalnız test cihazına gönder</button>
<button type="submit" class="all" onclick="this.form.mode.value='all'">Seçilen kitleye gönder</button></div></form>
<h2>Son gönderimler</h2><div class="card"><table>${(log || []).slice(0, 15).map((e) => `<tr><td>${esc(new Date(e.ts).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" }))} · ${e.mode === "test" ? "test" : "kitle"}<br><span class="muted">${esc(e.text)}</span></td><td class="n">${e.ok} ✓ · ${e.fail} ✗${e.removed ? ` · ${e.removed} silindi` : ""}</td></tr>`).join("") || `<tr><td class="muted">Henüz yok.</td></tr>`}</table></div>`;
}

export default async (req) => {
  if (!process.env.PUSH_ADMIN_TOKEN) return html(`<h1>Panel kapalı</h1><p class="muted">Netlify'de PUSH_ADMIN_TOKEN ortam değişkeni tanımlı değil.</p>`, 503);
  const url = new URL(req.url);
  let form = null;
  if (req.method === "POST") { try { form = await req.formData(); } catch { form = null; } }
  const token = form ? form.get("token") : url.searchParams.get("token");
  if (!tokenOk(token)) return html(`<h1>Yetkisiz</h1>`, 401);

  let store, logStore;
  try { store = getStore("sakin-push"); logStore = getStore("sakin-push-log"); }
  catch { return html(`<h1>Depo açılamadı</h1><p class="muted">Netlify Blobs erişilemedi.</p>`, 500); }
  const cfg = await pushConfig();
  let log = [];
  try { log = (await logStore.get("log", { type: "json" })) || []; } catch {}
  const devices = await loadDevices(store);

  if (!form) return html(panel(token, devices, cfg, log));

  // ── GÖNDER ──
  const mode = form.get("mode") === "all" ? "all" : "test";
  const title = String(form.get("title") || "").trim().slice(0, 60) || "Sakin";
  const general = String(form.get("body") || "").trim().slice(0, 240);
  const per = Object.fromEntries(LANGS.map((l) => [l, String(form.get("body_" + l) || "").trim().slice(0, 240)]));
  const onlyWritten = form.get("only_written") === "1";
  const lang = LANGS.includes(form.get("lang")) ? form.get("lang") : "";
  const platform = ["ios", "android"].includes(form.get("platform")) ? form.get("platform") : "";
  const screen = SCREENS.some(([v]) => v && v === form.get("screen")) ? form.get("screen") : "";
  const code = String(form.get("code") || "").trim().toUpperCase();
  // Test gönderiminde cihazın dilinde metin yoksa yazılan İLK metin gider (boş bildirim gitmesin).
  const anyText = general || per[LANGS.find((l) => per[l])] || "";
  const textFor = (l) => per[l] || (mode === "test" ? anyText : (onlyWritten && !general ? "" : general));
  if (!general && !LANGS.some((l) => per[l])) return html(panel(token, devices, cfg, log, `<p class="bad">Mesaj boş.</p>`));

  let targets = devices.filter((d) => (!lang || d.l === lang) && (!platform || d.p === platform) && textFor(d.l));
  if (mode === "test") {
    if (!/^[0-9A-F]{6}$/.test(code)) return html(panel(token, devices, cfg, log, `<p class="bad">Test için cihaz kodunu gir (6 karakter).</p>`));
    targets = devices.filter((d) => deviceCode(d.t) === code);
    if (!targets.length) return html(panel(token, devices, cfg, log, `<p class="bad">Bu kodla kayıtlı cihaz yok. Uygulamada anlık mesajlar açık mı?</p>`));
  }
  const ios = targets.filter((d) => d.p === "ios"), android = targets.filter((d) => d.p === "android");
  const results = [];
  try {
  if (ios.length && cfg.apns) results.push(...await sendApnsBatch(cfg.apns, ios.map((d) => ({ key: d.key, token: d.t, payload: apnsPayload(title, textFor(d.l), screen) }))));
  if (android.length && cfg.fcm) results.push(...await sendFcmBatch(cfg.fcm, android.map((d) => ({ key: d.key, token: d.t, payload: fcmPayload(title, textFor(d.l), screen) }))));
  } catch (e) {
    return html(panel(token, devices, cfg, log, `<p class="bad">Gönderim hatası: ${esc(String(e && e.message || e))}</p>`));
  }
  const skipped = (cfg.apns ? 0 : ios.length) + (cfg.fcm ? 0 : android.length);

  // Uygulaması silinmiş / geçersiz cihazları temizle.
  const dead = results.filter((r) => r.dead);
  await Promise.all(dead.map((r) => store.delete(r.key).catch(() => {})));
  const ok = results.filter((r) => r.ok).length, fail = results.length - ok;
  const entry = { ts: Date.now(), mode, text: (general || per.tr || per.en || Object.values(per).find(Boolean) || "").slice(0, 80), ok, fail, removed: dead.length };
  try { await logStore.setJSON("log", [entry, ...log].slice(0, 30)); } catch {}
  const errs = [...new Set(results.filter((r) => !r.ok).map((r) => r.why))].slice(0, 5);
  // Sık görülen APNs hatalarına Türkçe açıklama.
  const allWhy = errs.join(" ");
  let hint = "";
  if (/BadEnvironmentKeyInToken/.test(allWhy)) hint = "APNs anahtarı bu cihazın ortamına izinli değil. Xcode'dan kurulan sürüm Sandbox, TestFlight ve App Store sürümü Production kullanır. Apple Developer > Keys'te anahtarı \"Sandbox & Production\" ortamıyla yeniden oluştur, yeni Key ID ve .p8 içeriğini Netlify'a gir. Ya da testi TestFlight sürümüyle yap.";
  else if (/InvalidProviderToken/.test(allWhy)) hint = "Apple anahtarı reddetti: APNS_KEY_ID, APNS_TEAM_ID ve .p8 aynı anahtara/ekibe ait olmalı.";
  else if (/DeviceTokenNotForTopic/.test(allWhy)) hint = "Cihaz başka bir uygulama kimliğine ait: APNS_BUNDLE_ID app.sakin.life olmalı.";
  else if (/TopicDisallowed/.test(allWhy)) hint = "Bu uygulama kimliği için push kapalı: Apple Developer > Identifiers > app.sakin.life > Push Notifications açık olmalı.";
  const notice = `<div class="card" style="margin-top:16px"><b class="${fail ? "bad" : "ok"}">${mode === "test" ? "Test" : "Gönderim"} tamamlandı:</b> ${ok} başarılı, ${fail} başarısız${dead.length ? `, ${dead.length} geçersiz cihaz silindi` : ""}${skipped ? `, ${skipped} cihaz atlandı (platform anahtarı eksik)` : ""}.${errs.length ? `<div class="muted">Hatalar: ${errs.map(esc).join(" · ")}</div>` : ""}${hint ? `<div style="margin-top:8px">${esc(hint)}</div>` : ""}</div>`;
  return html(panel(token, await loadDevices(store), cfg, [entry, ...log], notice));
};
