// GİZLİ ANAHTAR PANELİ (Eyl 2026): büyük özel anahtarlar ortam değişkeni YERİNE
// Netlify Blobs'a ("sakin-secrets") buradan girilir. Sebep: fonksiyon ortam
// değişkenlerinin toplamı 4 KB'ı geçemiyor (AWS Lambda), yayın duruyordu.
// Aç:  https://sakin.life/.netlify/functions/secrets-admin?token=PUSH_ADMIN_TOKEN
// Değerler ASLA geri gösterilmez: panel yalnızca "var / doğrulandı" yazar.
// Kaydederken anahtar okunabiliyor mu diye denenir; bozuksa kaydedilmez.
import { timingSafeEqual } from "node:crypto";
import { SECRET_NAMES, secretStore, clearSecretCache } from "./_secrets.mjs";
import { pem, keyOk } from "./_push.mjs";

const INFO = {
  FCM_SA_JSON: ["Android bildirimleri (Firebase)", "Firebase > Proje ayarları > Hizmet hesapları > Yeni özel anahtar oluştur: inen JSON dosyasının TAMAMI. Android abonelik doğrulaması da bu hesabı kullanır."],
  APNS_PRIVATE_KEY: ["iPhone bildirimleri (APNs)", "Apple Developer > Keys > push anahtarının .p8 dosyasının TAMAMI (BEGIN ve END satırları dahil)."],
  APPLE_PRIVATE_KEY: ["iPhone abonelik doğrulaması", "App Store Connect > Users and Access > Integrations > In-App Purchase anahtarının .p8 dosyasının TAMAMI."],
  GOOGLE_SA_KEY: ["Android abonelik doğrulaması (isteğe bağlı)", "BOŞ bırakılabilir: boşsa Firebase hesabı kullanılır. Ayrı bir servis hesabı kullanacaksan JSON'daki private_key değeri + GOOGLE_SA_EMAIL ortam değişkeni."],
};

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function tokenOk(given) {
  const want = process.env.PUSH_ADMIN_TOKEN || "";
  if (!want || !given) return false;
  const a = Buffer.from(String(given)), b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Anahtar geçerli mi? { ok, note } döner; note panelde gösterilir (değer değil).
function check(name, value) {
  const v = String(value || "").trim();
  if (!v) return { ok: false, note: "boş" };
  if (name === "FCM_SA_JSON") {
    let j = null;
    try { j = JSON.parse(v); } catch { return { ok: false, note: "JSON okunamadı: dosyanın tamamını yapıştır" }; }
    if (!j || !j.client_email || !j.private_key || !j.project_id) return { ok: false, note: "JSON'da client_email / private_key / project_id yok" };
    if (!keyOk(pem(j.private_key))) return { ok: false, note: "JSON'daki private_key okunamadı" };
    return { ok: true, note: `hesap: ${j.client_email}` };
  }
  if (!keyOk(pem(v))) return { ok: false, note: "anahtar okunamadı: .p8 dosyasının tamamını yapıştır" };
  return { ok: true, note: "anahtar okunuyor" };
}

const page = (body, code = 200) => new Response(`<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Sakin · Gizli anahtarlar</title>
<style>
:root{color-scheme:dark}body{margin:0;background:#0b0918;color:#e8e2f5;font:15px/1.55 -apple-system,system-ui,Segoe UI,Roboto,sans-serif}
main{max-width:720px;margin:0 auto;padding:28px 16px 60px}h1{font-weight:300;letter-spacing:2px;font-size:22px;margin:0 0 4px}
h2{font-size:14px;margin:0 0 4px;font-weight:600}.card{background:rgba(255,255,255,.035);border:1px solid rgba(184,164,216,.18);border-radius:14px;padding:16px;margin-top:16px}
.muted{color:#9a90b5;font-size:13px}textarea{width:100%;box-sizing:border-box;background:#150f2c;color:#f1ecf9;border:1px solid rgba(184,164,216,.3);border-radius:10px;padding:10px 12px;font:13px/1.4 ui-monospace,Menlo,monospace;min-height:90px;resize:vertical;margin-top:10px}
.btns{display:flex;gap:10px;margin-top:10px;flex-wrap:wrap}button{appearance:none;-webkit-appearance:none;border-radius:100px;padding:9px 18px;font:inherit;cursor:pointer;border:1px solid rgba(232,192,122,.5);background:rgba(232,192,122,.12);color:#f6dfb0}
button.del{border-color:rgba(255,143,143,.4);background:transparent;color:#ff9f9f}.ok{color:#8fd9a8}.bad{color:#ff8f8f}.msg{margin-top:14px;padding:10px 14px;border-radius:10px;background:rgba(143,217,168,.1)}.msg.err{background:rgba(255,143,143,.1)}
code{background:rgba(255,255,255,.06);padding:1px 6px;border-radius:6px}
</style></head><body><main>${body}</main></body></html>`, { status: code, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });

async function render(token, msg, err) {
  let store = null;
  try { store = secretStore(); } catch { return page(`<h1>Depo açılamadı</h1><p class="muted">Netlify Blobs erişilemedi.</p>`, 500); }
  let cards = "";
  for (const name of SECRET_NAMES) {
    let stored = "";
    try { stored = (await store.get(name)) || ""; } catch {}
    const inEnv = !!process.env[name];
    const c = stored ? check(name, stored) : null;
    const status = stored
      ? `<span class="${c.ok ? "ok" : "bad"}">Depoda kayıtlı · ${esc(c.note)}</span>`
      : `<span class="muted">Depoda yok</span>`;
    const envNote = inEnv
      ? `<div class="muted" style="margin-top:4px">Ortam değişkeninde de tanımlı: ÖNCELİK onda. Depoya kaydettikten sonra Netlify'dan <code>${name}</code> değişkenini SİL (4 KB sınırı).</div>`
      : "";
    cards += `<div class="card"><h2>${esc(INFO[name][0])} <span class="muted">· ${name}</span></h2>
<div class="muted">${esc(INFO[name][1])}</div><div style="margin-top:8px">${status}</div>${envNote}
<form method="post"><input type="hidden" name="token" value="${esc(token)}"><input type="hidden" name="name" value="${name}">
<textarea name="value" placeholder="${stored ? "Değiştirmek için yenisini yapıştır" : "Buraya yapıştır"}" autocomplete="off" spellcheck="false"></textarea>
<div class="btns"><button name="action" value="save">Kaydet</button>${stored ? `<button class="del" name="action" value="delete" onclick="return confirm('${name} silinsin mi?')">Sil</button>` : ""}</div></form></div>`;
  }
  const ids = [["APPLE_KEY_ID", "Apple abonelik anahtarının Key ID'si"], ["APPLE_ISSUER_ID", "App Store Connect Issuer ID"], ["APNS_KEY_ID", "Push anahtarının Key ID'si"], ["APNS_TEAM_ID", "Apple Team ID"]]
    .map(([k, d]) => `<div>${process.env[k] ? '<span class="ok">✓</span>' : '<span class="bad">✗</span>'} <code>${k}</code> <span class="muted">${d}</span></div>`).join("");
  return page(`<h1>Gizli anahtarlar</h1>
<p class="muted">Büyük anahtarlar burada saklanır (Netlify'ın site içi deposu), ortam değişkeninde değil: fonksiyon ortam değişkenlerinin toplamı 4 KB'ı geçemiyor. Kaydedilen değer bir daha GÖSTERİLMEZ.</p>
${msg ? `<div class="msg${err ? " err" : ""}">${esc(msg)}</div>` : ""}
${cards}
<div class="card"><h2>Küçük kimlikler (ortam değişkeninde kalır)</h2>${ids}</div>`);
}

export default async (req) => {
  if (!process.env.PUSH_ADMIN_TOKEN) return page(`<h1>Panel kapalı</h1><p class="muted">PUSH_ADMIN_TOKEN tanımlı değil.</p>`, 503);
  const url = new URL(req.url);
  let form = null;
  if (req.method === "POST") { try { form = await req.formData(); } catch { form = null; } }
  const token = form ? form.get("token") : url.searchParams.get("token");
  if (!tokenOk(token)) return page(`<h1>Yetkisiz</h1>`, 401);
  if (!form) return render(token);

  const name = String(form.get("name") || "");
  if (!SECRET_NAMES.includes(name)) return render(token, "Bilinmeyen anahtar adı.", true);
  const store = secretStore();
  if (form.get("action") === "delete") {
    try { await store.delete(name); } catch { return render(token, "Silinemedi.", true); }
    clearSecretCache();
    return render(token, `${name} silindi.`);
  }
  const value = String(form.get("value") || "").trim();
  if (value.length > 10000) return render(token, "Değer çok uzun.", true);
  const c = check(name, value);
  if (!c.ok) return render(token, `${name} KAYDEDİLMEDİ: ${c.note}.`, true);
  try { await store.set(name, value); } catch { return render(token, "Kaydedilemedi (depo hatası).", true); }
  clearSecretCache();
  return render(token, `${name} kaydedildi (${c.note}).`);
};
