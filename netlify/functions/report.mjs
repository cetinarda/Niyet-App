// Kullanim raporu - funnel / drop-off / retention (TOKEN korumali).
// ------------------------------------------------------------------------
// Erisim: ?token=... veya x-report-token header, REPORT_TOKEN env'i ile eslesmeli.
// REPORT_TOKEN tanimli degilse rapor KAPALI (veri hicbir sekilde ifsa olmaz).
//   GET ?token=XXX          -> JSON rapor
//   GET ?token=XXX&html=1   -> HTML gosterge paneli (tarayicida ac)
// Kaynak: netlify/functions/track.mjs'in yazdigi u/<anonId> kayitlari.
//
// ⚠️ FUNCTIONS V2 API — bkz. track.mjs başındaki not. Kullanıcı canlıda
// "MissingBlobsEnvironmentError: siteID, token" alıyordu; Netlify personeli
// forumda doğruladı: siteID/token'ı otomatik bulma SADECE v2'de çalışıyor,
// v1'de (export const handler) hiç çalışmıyor. Hesap/Netlify tarafında
// düzeltilecek bir şey değildi, kod tarafımızdaki API seçimiydi.
import { getStore } from "@netlify/blobs";

const MAX_USERS = 20000; // guvenlik siniri; asilirsa raporda not dusulur

// Funnel sirasi: her adim ONCEKININ alt kumesi olmasi beklenir.
// Etiketler EKRANA basiliyor: duzgun Turkce yazilir (kod yorumlari ASCII olabilir,
// kullaniciya gorunen metin olamaz).
// ⚠️ Eyl 2026 düzeltmesi: eski sırada "Doğum formuna ulaştı" (yalnızca giriş
// ekranındaki formu sayan dar bir olay) "HAZIRIM"ın ÖNÜNDEYDİ ve geçiş oranı
// %254 çıkıyordu. "Profili tamamladı" da yanlış addı, olay yalnızca HAZIRIM'a
// basmak. Doğum yerine her yoldan kaydı sayan "birth_saved" kullanılıyor.
// Adımlar kesin alt küme DEĞİL (ör. web'de giriş atlanabilir); oran 100'ü
// aşarsa rapor "öncekinden" yüzdesini göstermez.
const FUNNEL = [
  { key: "app_open",         label: "Uygulamayı açtı" },
  { key: "profile_complete", label: "Girişte HAZIRIM'a bastı" },
  { key: "mandala_view",     label: "Bağlan ekranını gördü" },
  { key: "feature_any",      label: "Bir özelliği kullandı" },
  { key: "birth_saved",      label: "Doğum bilgisini kaydetti" },
  { key: "nefes_complete",   label: "Nefes tamamladı" },
];
// Süre kovaları (track.mjs ile aynı sıra).
const BUCKETS = ["10 sn altı", "10-30 sn", "30 sn-1 dk", "1-3 dk", "3-10 dk", "10 dk+"];

function pct(n, d) { return d > 0 ? Math.round((n / d) * 1000) / 10 : 0; }

export function aggregate(users) {
  const N = users.length;
  const reach = {}; FUNNEL.forEach((f) => (reach[f.key] = 0));
  const featTotals = {}, featUsers = {};
  // SURE + GECIS (kullanici istegi: "ne kadar sure kaldilar, nereye
  // gectiler"). featSec/featExits ortalama sureyi hesaplar (bkz. asagida
  // avgSec = featSec/featExits); transTotals her "kaynak>hedef" ciftinin
  // TOPLAM kullanici sayisinda kac kez gorduldugunu tutar.
  const featSec = {}, featExits = {};
  // Seçim sayaçları (track.mjs beyaz listesi): yol seçimi, Bugün kapısı, Ayna oyu.
  const ch = {};
  const aynaTip = {};
  const hist = {};   // ekran -> [6 kova]
  const onbDone = { baglan: 0, kesfet: 0 };
  const np = { users: 0, count: { 1: 0, 2: 0, 3: 0 }, off: {} };
  let notifUsers = 0;
  const transTotals = {};
  const platform = {}, lang = {}, version = {};
  let nefesTotal = 0, nefesUsers = 0, sessionsTotal = 0;
  let paywallUsers = 0, purchaseUsers = 0, premUsers = 0;
  let ret2 = 0, ret7 = 0;
  let newLast7 = 0;
  const now = Date.now(), WEEK = 7 * 864e5;

  for (const u of users) {
    const m = u.m || {}, c = u.c || {}, days = u.days || [];
    if (m.app_open) reach.app_open++;
    if (m.birth_view) reach.birth_view++;
    if (m.profile_complete) reach.profile_complete++;
    if (m.mandala_view) reach.mandala_view++;
    if (m.feature_any) reach.feature_any++;
    if (m.nefes_complete) reach.nefes_complete++;
    if (m.birth_saved) reach.birth_saved++;
    if (m.onb_baglan_done) onbDone.baglan++;
    if (m.onb_kesfet_done) onbDone.kesfet++;
    if (m.notif_open) notifUsers++;
    if (u.np && u.np.c) {
      np.users++; np.count[u.np.c] = (np.count[u.np.c] || 0) + 1;
      for (const k of u.np.off || []) np.off[k] = (np.off[k] || 0) + 1;
    }
    if (days.length >= 2) ret2++;
    if (days.length >= 7) ret7++;

    platform[u.p || "?"] = (platform[u.p || "?"] || 0) + 1;
    lang[u.lang || "?"] = (lang[u.lang || "?"] || 0) + 1;
    version[u.v || "?"] = (version[u.v || "?"] || 0) + 1;

    if (c.nefes) { nefesTotal += c.nefes; nefesUsers++; }
    if (c.sessions) sessionsTotal += c.sessions;
    if (m.paywall_view) paywallUsers++;
    if (m.purchase) purchaseUsers++;
    if (u.prem) premUsers++;
    if (u.first && now - u.first < WEEK) newLast7++;

    for (const k in c) {
      if (k.indexOf("scr_") === 0) {
        const s = k.slice(4);
        featTotals[s] = (featTotals[s] || 0) + c[k];
        featUsers[s] = (featUsers[s] || 0) + 1;
      } else if (k.indexOf("t_") === 0) {
        featSec[k.slice(2)] = (featSec[k.slice(2)] || 0) + c[k];
      } else if (k.indexOf("tn_") === 0) {
        featExits[k.slice(3)] = (featExits[k.slice(3)] || 0) + c[k];
      } else if (k.indexOf("aynat_") === 0) {
        const rest = k.slice(6), sep = rest.lastIndexOf("_");
        if (sep > 0) {
          const tip = rest.slice(0, sep), v = rest.slice(sep + 1);
          const o = aynaTip[tip] || (aynaTip[tip] = { up: 0, down: 0 });
          if (v === "up" || v === "down") o[v] += c[k];
        }
      } else if (k.indexOf("h_") === 0) {
        const rest = k.slice(2), sep = rest.lastIndexOf("_");
        const b = Number(rest.slice(sep + 1));
        if (sep > 0 && b >= 0 && b < 6) {
          const h = hist[rest.slice(0, sep)] || (hist[rest.slice(0, sep)] = [0, 0, 0, 0, 0, 0]);
          h[b] += c[k];
        }
      } else if (/^(fork_|bgate_|ayna_|notif_)/.test(k)) {
        ch[k] = (ch[k] || 0) + c[k];
      }
    }
    const tr = u.tr || {};
    for (const key in tr) transTotals[key] = (transTotals[key] || 0) + tr[key];
  }

  // Her kaynak ekran icin en cok gidilen hedefleri cikar (yuzdesiyle).
  const transByOrigin = {};
  for (const key in transTotals) {
    const sep = key.indexOf(">");
    if (sep < 0) continue;
    const from = key.slice(0, sep), to = key.slice(sep + 1);
    (transByOrigin[from] || (transByOrigin[from] = [])).push({ to, count: transTotals[key] });
  }
  for (const from in transByOrigin) {
    const rows = transByOrigin[from];
    const tot = rows.reduce((a, r) => a + r.count, 0);
    rows.sort((a, b) => b.count - a.count);
    transByOrigin[from] = rows.slice(0, 3).map((r) => ({ ...r, pct: pct(r.count, tot) }));
  }

  // Funnel: her adim + toplam yuzdesi + bir onceki adima gore donusum + drop-off.
  const funnel = FUNNEL.map((f, i) => {
    const count = reach[f.key];
    const prev = i > 0 ? reach[FUNNEL[i - 1].key] : count;
    return {
      key: f.key, label: f.label, count,
      ofTotal: pct(count, N),
      fromPrev: i > 0 ? pct(count, prev) : 100,
      dropFromPrev: i > 0 ? Math.max(0, prev - count) : 0,
      dropPct: i > 0 ? pct(prev - count, prev) : 0,
    };
  });

  const features = Object.keys(featTotals).map((s) => ({
    screen: s, opens: featTotals[s], users: featUsers[s],
    // avgSec: bu ekrandan cikarken olculen surelerin ortalamasi (tn_ sayaci
    // "kac kez cikildi"yi tutar, acilis sayisiyla AYNI SEY DEGIL: bir kere
    // acilip hic cikilmadan sekme kapatilirsa exits opens'tan az kalabilir).
    avgSec: featExits[s] ? Math.round(featSec[s] / featExits[s]) : null,
    // Ortanca: dağılımın ortasına düşen kova (yalnızca yeni istemcilerden gelir;
    // eski kayıtlarda yok, o zaman null).
    medianBucket: (() => {
      const h = hist[s]; if (!h) return null;
      const tot = h.reduce((a, x) => a + x, 0); if (!tot) return null;
      let acc = 0;
      for (let i = 0; i < 6; i++) { acc += h[i]; if (acc >= tot / 2) return BUCKETS[i]; }
      return null;
    })(),
    topNext: transByOrigin[s] || [],
  })).sort((a, b) => b.users - a.users);

  const sortMap = (o) => Object.keys(o).map((k) => ({ k, n: o[k] })).sort((a, b) => b.n - a.n);

  return {
    users: N,
    newLast7,
    funnel,
    monetization: {
      paywallUsers, ofTotal: pct(paywallUsers, N),
      purchaseUsers, purchaseOfPaywall: pct(purchaseUsers, paywallUsers),
      premiumUsers: premUsers, premiumPct: pct(premUsers, N),
    },
    retention: {
      day2Users: ret2, day2Pct: pct(ret2, N),
      day7Users: ret7, day7Pct: pct(ret7, N),
    },
    engagement: {
      sessionsTotal,
      avgSessionsPerUser: N ? Math.round((sessionsTotal / N) * 10) / 10 : 0,
      nefesTotal, nefesUsers,
      avgNefesPerNefesUser: nefesUsers ? Math.round((nefesTotal / nefesUsers) * 10) / 10 : 0,
    },
    features,
    onboarding: {
      baglanStarted: featUsers.onb_baglan || 0, baglanDone: onbDone.baglan,
      kesfetStarted: featUsers.onb_kesfet || 0, kesfetDone: onbDone.kesfet,
    },
    notifPrefs: np,
    notif: {
      users: notifUsers,
      byKind: ["genel", "kisisel", "tarot", "geridon", "mektup", "diger"].map((k) => ({ k, n: ch["notif_" + k] || 0 })),
      deeplink: ["mandala", "bugun", "nefes", "ses", "chakra"].map((k) => ({ k, n: ch["deeplink_" + k] || 0 })),
    },
    choices: {
      forkShown: ch.fork_shown || 0,
      forkBaglan: ch.fork_baglan || 0, forkKesfet: ch.fork_kesfet || 0,
      forkUntriedBaglan: ch.fork_untried_baglan || 0, forkUntriedKesfet: ch.fork_untried_kesfet || 0,
      letterSeal: ch.letter_seal || 0, letterOpen: ch.letter_open || 0,
      letterR: { oldu: ch.letter_r_oldu || 0, yolda: ch.letter_r_yolda || 0, donustu: ch.letter_r_donustu || 0 },
      gateShown: ch.bgate_shown || 0, gateEnter: ch.bgate_enter || 0, gateSkip: ch.bgate_skip || 0,
      gateEnterPct: pct(ch.bgate_enter || 0, ch.bgate_shown || 0),
      aynaUp: ch.ayna_up || 0, aynaDown: ch.ayna_down || 0,
      aynaUpPct: pct(ch.ayna_up || 0, (ch.ayna_up || 0) + (ch.ayna_down || 0)),
      aynaByTip: Object.keys(aynaTip).map((t) => ({ tip: t, up: aynaTip[t].up, down: aynaTip[t].down,
        upPct: pct(aynaTip[t].up, aynaTip[t].up + aynaTip[t].down) })).sort((a, b) => (b.up + b.down) - (a.up + a.down)),
    },
    platform: sortMap(platform),
    lang: sortMap(lang),
    version: sortMap(version),
  };
}

// ⚠️ Bu sayfadaki ekran adi / dil / surum degerleri İSTEMCİDEN geliyor, yani
// disaridan yazilabilir. Sayfaya basilan HER dis deger esc()'ten gecmeli.
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// Ekran anahtarlarini okunakli Turkce isme cevir. Bilinmeyen anahtar oldugu
// gibi (kacisli) gosterilir: yeni bir ekran eklendiginde rapor bozulmasin.
const SCREEN_TR = {
  sabah: "Sabah niyeti", gun: "Gün görevleri", nefes: "Nefes", ses: "Ses dalgaları",
  chakra: "Çakra", aksam: "Akşam kapanışı", rehber: "İçsel Ayna", harita: "Ben / harita",
  mandala: "Bağlantı ekranı", bugun: "Bugün", ayarlar: "Ayarlar", terapi: "Çakra terapisi",
  fiyat: "Fiyatlandırma", hakkinda: "Sakin nedir", kesfet: "Keşfet (alt bar)", giris: "Giriş",
  // "ailesi": Keşfet'in İKİNCİ giriş butonu (üst/kenar çubuğundaki ✦ simgesi,
  // showAilesi state'inin eski dahili adı). Aynı panel ama FARKLI bir tıklama
  // noktası; kullanıcı istegi uzerine "kesfet"ten ayrı satırda gösteriliyor.
  ailesi: "Keşfet (✦ simge)",
  // "onb_kesfet"/"onb_baglan": "Sakin nedir?" sayfasindaki iki karttan biri
  // (Bağlan 1., Keşfet 2. sırada) tıklanınca onboarding TANITIMI yeniden
  // oynatılır; asıl Keşfet/Bağlan panelinden TAMAMEN farklı bir deneyimdir.
  onb_kesfet: "Tanışma: Kendimi tanımak",
  onb_baglan: "Tanışma: Sakinleşmek",
  // Gömülü uygulamalar (Eyl 2026'dan itibaren ayrı sayılıyor).
  emb_humandesign: "Tasarım (gömülü)", emb_sakinhayvan: "Hayvan (gömülü)",
  emb_sakinmitler: "Mitler (gömülü)", emb_soulid: "Ruh Profili / SoulID (gömülü)",
  emb_sakintaslar: "Taşlar (gömülü)", emb_sakinbitkiler: "Bitkiler (gömülü)",
};
const scr = (k) => SCREEN_TR[k] || k;

const CSS = `
:root{--bg:#0b0813;--panel:#15112a;--panel2:#1b1636;--line:#2b2246;--ink:#ece8f5;
--muted:#9a93b0;--dim:#6f6885;--acc:#b8a4d8;--gold:#e8c07a;--good:#82d9a3;--bad:#e0687f}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);
font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
padding:22px 16px 60px;-webkit-font-smoothing:antialiased}
.wrap{max-width:820px;margin:0 auto}
h1{font-size:21px;font-weight:600;letter-spacing:.3px;margin:0}
.sub{color:var(--dim);font-size:12.5px;margin-top:5px}
h2{font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;
color:var(--acc);margin:34px 0 12px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px}
.kpi{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:16px}
.kpi div{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px 15px}
.kpi b{display:block;font-size:26px;font-weight:600;line-height:1.15;letter-spacing:-.5px}
.kpi span{display:block;color:var(--muted);font-size:11.5px;margin-top:4px}
.step{margin-bottom:16px}
.step:last-child{margin-bottom:0}
.steptop{display:flex;justify-content:space-between;align-items:baseline;gap:12px;
font-size:13.5px;margin-bottom:6px}
.steptop b{font-weight:500}
.steptop span{color:var(--muted);font-size:12px;white-space:nowrap}
.bar{height:9px;border-radius:6px;background:rgba(255,255,255,.06);overflow:hidden}
.bar i{display:block;height:100%;border-radius:6px;
background:linear-gradient(90deg,#7c5cc4,#b8a4d8)}
.drop{font-size:11.5px;color:var(--bad);margin-top:5px}
table{width:100%;border-collapse:collapse;font-size:13.5px}
td,th{padding:8px 6px;border-bottom:1px solid #241c38;text-align:left}
tr:last-child td{border-bottom:0}
th{color:var(--muted);font-weight:500;font-size:11.5px;letter-spacing:.6px;text-transform:uppercase}
.num{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.row2{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}
.mini{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px 15px}
.mini h3{margin:0 0 8px;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;
color:var(--muted);font-weight:600}
.mbar{height:6px;border-radius:4px;background:rgba(255,255,255,.06);overflow:hidden;margin-top:5px}
.mbar i{display:block;height:100%;background:var(--acc);border-radius:4px}
.empty{text-align:center;padding:34px 20px}
.empty .big{font-size:34px;line-height:1}
.empty p{color:var(--muted);font-size:14px;margin:12px auto 0;max-width:44ch}
.warn{border-color:rgba(224,104,127,.4);background:rgba(224,104,127,.07)}
.warn h3{color:var(--bad)}
code{background:rgba(255,255,255,.07);border-radius:5px;padding:1px 6px;font-size:12.5px}
.foot{color:var(--dim);font-size:11.5px;margin-top:34px;line-height:1.7}
@media(max-width:520px){.kpi b{font-size:22px}h1{font-size:18px}}
`;

function shell(title, inner) {
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>${esc(title)}</title>
<style>${CSS}</style></head><body><div class="wrap">${inner}</div></body></html>`;
}

function header(sub) {
  return `<h1>Sakin · Kullanım Raporu</h1><div class="sub">${sub}</div>`;
}

/** Veri yokken / ölçüm kapalıyken gösterilen sayfa. Sıfırlarla dolu bir pano
 *  yerine ne olduğunu ve ne yapılacağını söyleyen tek bir panel. */
export function renderEmpty(reason) {
  return shell("Sakin Kullanım Raporu",
    header("Anonim birinci taraf ölçüm. Kişisel veri yok.") +
    `<div class="card empty" style="margin-top:18px">
      <div class="big">🌱</div>
      <p><b>Henüz veri yok.</b></p>
      <p>${reason}</p>
    </div>`);
}

export function renderHTML(r, truncated) {
  if (!r.users) {
    return renderEmpty("Ölçüm açık ve çalışıyor, ama henüz hiçbir cihazdan kayıt gelmemiş. Uygulamayı açan ilk kullanıcılarla birlikte bu sayfa dolmaya başlar.");
  }

  const kpi = `<div class="kpi">
    <div><b>${r.users}</b><span>Toplam anonim kullanıcı</span></div>
    <div><b>${r.newLast7}</b><span>Son 7 günde yeni</span></div>
    <div><b style="color:var(--good)">%${r.retention.day2Pct}</b><span>Ertesi gün geri döndü</span></div>
    <div><b style="color:var(--gold)">%${r.monetization.premiumPct}</b><span>Premium</span></div>
  </div>`;

  const funnel = r.funnel.map((f, i) => `
    <div class="step">
      <div class="steptop">
        <b>${esc(f.label)}</b>
        <span>${f.count} kişi · %${f.ofTotal}${i > 0 && f.fromPrev <= 100 ? ` · öncekinden %${f.fromPrev}` : ""}</span>
      </div>
      <div class="bar"><i style="width:${Math.min(100, f.ofTotal)}%"></i></div>
      ${i > 0 && f.dropFromPrev > 0
        ? `<div class="drop">${f.dropFromPrev} kişi burada ayrıldı (%${f.dropPct} düşüş)</div>` : ""}
    </div>`).join("");

  // ne kadar sure kaldilar (avgSec) + nereye gectiler (topNext): kullanici
  // istegi "keşfeti ayrı görmek istiyorum, ne kadar süre kaldılar, nereye
  // geçtiler". Her ekran zaten kendi SATIRI (Keşfet dahil, diğerlerinden
  // ayrı), bu iki sutun o satira sure + sonraki-ekran bilgisini ekliyor.
  const fmtDur = (sec) => {
    if (sec == null) return "-";
    if (sec < 60) return `${sec} sn`;
    return `${Math.round(sec / 60)} dk`;
  };
  const fmtNext = (topNext) => topNext.length
    ? topNext.map((t) => `${esc(scr(t.to))} (%${t.pct})`).join(", ")
    : "-";

  const maxFeat = Math.max(1, ...r.features.map((f) => f.users));
  const feats = r.features.length
    ? `<table><tr><th>Bölüm</th><th class="num">Kullanıcı</th><th class="num">Açılış</th><th class="num">Tipik süre</th><th class="num">Ort.</th><th>Sonra en çok</th></tr>` +
      r.features.map((f) => `<tr>
        <td>${esc(scr(f.screen))}
          <div class="mbar"><i style="width:${Math.round((f.users / maxFeat) * 100)}%"></i></div></td>
        <td class="num">${f.users}</td><td class="num">${f.opens}</td>
        <td class="num">${f.medianBucket ? esc(f.medianBucket) : "-"}</td>
        <td class="num" style="color:var(--dim)">${fmtDur(f.avgSec)}</td><td style="color:var(--muted);font-size:12.5px">${fmtNext(f.topNext)}</td></tr>`).join("") +
      `</table>`
    : `<p style="color:var(--muted);font-size:13.5px;margin:0">Henüz bölüm açılışı kaydedilmedi.</p>`;

  const split = (title, arr) => {
    const tot = arr.reduce((a, x) => a + x.n, 0) || 1;
    return `<div class="mini"><h3>${title}</h3>` +
      (arr.length
        ? arr.map((x) => `<div style="display:flex;justify-content:space-between;font-size:13px;margin-top:6px">
             <span>${esc(x.k)}</span><span class="num">${x.n} · %${Math.round((x.n / tot) * 100)}</span></div>
             <div class="mbar"><i style="width:${Math.round((x.n / tot) * 100)}%"></i></div>`).join("")
        : `<div style="color:var(--muted);font-size:13px">veri yok</div>`) +
      `</div>`;
  };

  const mon = r.monetization;
  return shell("Sakin Kullanım Raporu",
    header(`Anonim birinci taraf ölçüm. Kişisel veri yok.${truncated ? ` <b style="color:var(--bad)">Uyarı: ${MAX_USERS}+ kullanıcı, kısmi rapor.</b>` : ""}`) +
    kpi +

    `<h2>Nerede kayboluyorlar</h2>
     <div class="card">${funnel}</div>` +

    `<h2>Para</h2>
     <div class="card"><table>
       <tr><td>Ödeme ekranını gördü</td><td class="num">${mon.paywallUsers} kişi · %${mon.ofTotal}</td></tr>
       <tr><td>Satın aldı</td><td class="num">${mon.purchaseUsers} kişi · görenlerin %${mon.purchaseOfPaywall}</td></tr>
       <tr><td>Şu an premium</td><td class="num">${mon.premiumUsers} kişi · %${mon.premiumPct}</td></tr>
     </table></div>` +

    `<h2>Bağlılık</h2>
     <div class="card"><table>
       <tr><td>Ertesi gün geri dönen</td><td class="num">${r.retention.day2Users} kişi · %${r.retention.day2Pct}</td></tr>
       <tr><td>7 gün kullanan</td><td class="num">${r.retention.day7Users} kişi · %${r.retention.day7Pct}</td></tr>
       <tr><td>Toplam oturum</td><td class="num">${r.engagement.sessionsTotal}</td></tr>
       <tr><td>Kullanıcı başına ortalama oturum</td><td class="num">${r.engagement.avgSessionsPerUser}</td></tr>
       <tr><td>Nefes yapan kullanıcı</td><td class="num">${r.engagement.nefesUsers} kişi</td></tr>
       <tr><td>Nefes yapan başına ortalama nefes</td><td class="num">${r.engagement.avgNefesPerNefesUser}</td></tr>
     </table></div>` +

    (() => {
      const c = r.choices || {};
      const tipRows = (c.aynaByTip || []).map((x) =>
        `<tr><td>Ayna · ${esc(x.tip)}</td><td class="num">${x.up} iyi · ${x.down} değil · %${x.upPct}</td></tr>`).join("");
      const o = r.onboarding || {}, nt = r.notif || { byKind: [] };
      const NK = { genel: "Genel hatırlatma", kisisel: "Kişiye özel", tarot: "Sabah tarot", geridon: "Geri dönüş (10-30 gün)", mektup: "Niyet mektubu açıldı", diger: "Diğer" };
      return `<h2>Tanışma</h2>
     <div class="card"><table>
       <tr><td>Sakinleşmek: başladı / bitirdi</td><td class="num">${o.baglanStarted || 0} / ${o.baglanDone || 0}</td></tr>
       <tr><td>Kendimi tanımak: başladı / bitirdi</td><td class="num">${o.kesfetStarted || 0} / ${o.kesfetDone || 0}</td></tr>
     </table></div>
     <h2>Bildirimler</h2>
     <div class="card"><table>
       <tr><td>Bildirime dokunarak açan kullanıcı</td><td class="num">${nt.users || 0}</td></tr>
       ${nt.byKind.map((x) => `<tr><td>${esc(NK[x.k] || x.k)}</td><td class="num">${x.n} dokunma</td></tr>`).join("")}
       ${(nt.deeplink || []).filter((x) => x.n).map((x) => `<tr><td>Deep link (etkinlik) → ${esc(x.k === "mandala" ? "Bağlan" : x.k)}</td><td class="num">${x.n} açılış</td></tr>`).join("")}
       ${(() => { const q = r.notifPrefs || { users: 0, count: {}, off: {} }; if (!q.users) return "";
         const OFF = { kisisel: "Kişisel mesaj", aksam: "Akşam pratiği", tarot: "Sabah tarotu", hatirlatici: "Kişisel hatırlatıcı", ogle: "Gün ortası", kozmik: "Gökyüzü uyarısı", geridon: "Uzun aradan sonra" };
         return `<tr><td>Ayarını değiştiren kullanıcı</td><td class="num">${q.users}</td></tr>
           <tr><td>Günlük sayı seçimi (1 / 2 / 3)</td><td class="num">${q.count[1] || 0} / ${q.count[2] || 0} / ${q.count[3] || 0}</td></tr>` +
           Object.keys(q.off).map((k) => `<tr><td>Kapatan: ${esc(OFF[k] || k)}</td><td class="num">${q.off[k]}</td></tr>`).join(""); })()}
     </table></div>
     <h2>Seçimler</h2>
     <div class="card"><table>
       <tr><td>Yol seçimi gösterildi</td><td class="num">${c.forkShown || 0}</td></tr>
       <tr><td>Sakinleşmek seçildi</td><td class="num">${c.forkBaglan || 0} (denenmemiş işaretliyken ${c.forkUntriedBaglan || 0})</td></tr>
       <tr><td>Kendimi tanımak seçildi</td><td class="num">${c.forkKesfet || 0} (denenmemiş işaretliyken ${c.forkUntriedKesfet || 0})</td></tr>
       <tr><td>Bugün doğum kapısı gösterildi</td><td class="num">${c.gateShown || 0}</td></tr>
       <tr><td>Niyet mektubu: mühürlendi / açıldı</td><td class="num">${c.letterSeal || 0} / ${c.letterOpen || 0}</td></tr>
       <tr><td>Mektup yansıması: gerçekleşti / yolda / dönüştü</td><td class="num">${(c.letterR || {}).oldu || 0} / ${(c.letterR || {}).yolda || 0} / ${(c.letterR || {}).donustu || 0}</td></tr>
       <tr><td>Kapıdan bilgi girmeye geçti</td><td class="num">${c.gateEnter || 0} · %${c.gateEnterPct || 0}</td></tr>
       <tr><td>Kapıyı atladı</td><td class="num">${c.gateSkip || 0}</td></tr>
       <tr><td>Ayna "iyi geldi" oranı</td><td class="num">${c.aynaUp || 0} iyi · ${c.aynaDown || 0} değil · %${c.aynaUpPct || 0}</td></tr>
       ${tipRows}
     </table></div>`;
    })() +

    `<h2>En çok açılan bölümler</h2>
     <div class="card">${feats}</div>` +

    `<h2>Kim kullanıyor</h2>
     <div class="row2">
       ${split("Platform", r.platform)}
       ${split("Dil", r.lang)}
       ${split("Sürüm", r.version)}
     </div>` +

    `<div class="foot">Gün anahtarları kurulum başına son 60 günle sınırlı.
     Rapor çağrıldığı anda hesaplanır, saklanmaz.<br>
     Oluşturma: ${esc(new Date().toISOString().replace("T", " ").slice(0, 16))} UTC</div>`);
}

/** Ölçüm altyapısı kurulu değilse: sıfır tablosu yerine sebebi söyle. */
function renderBlobsProblem(detail) {
  return shell("Sakin Kullanım Raporu",
    header("Anonim birinci taraf ölçüm. Kişisel veri yok.") +
    `<div class="card empty" style="margin-top:18px">
      <div class="big">⚙️</div>
      <p><b>Ölçüm deposu (Netlify Blobs) açılamadı.</b></p>
      <p>Rapor bu yüzden boş. Uygulama tarafı da yazamıyor, yani şu ana kadar
         hiç veri birikmemiş olabilir.</p>
    </div>
    <div class="mini warn" style="margin-top:12px">
      <h3>Teknik sebep</h3>
      <div style="font-size:13px;color:var(--ink);word-break:break-word">${esc(detail || "bilinmiyor")}</div>
    </div>
    <div class="card" style="margin-top:12px">
      <h3 style="margin:0 0 10px;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:var(--muted)">Ne yapmalı</h3>
      <div style="font-size:13.5px;line-height:1.8;color:var(--muted)">
        1. Netlify panelinde siteyi aç, <code>Blobs</code> bölümünün etkin olduğunu doğrula.<br>
        2. <code>Deploys → Trigger deploy → Clear cache and deploy site</code> ile yeniden yayınla.<br>
        3. Bu sayfayı yenile; sorun sürerse yukarıdaki teknik sebebi paylaş.
      </div>
    </div>`);
}

export default async (req) => {
  const url = new URL(req.url);
  const wantHtml = url.searchParams.get("html") === "1";
  const htmlHeaders = { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" };
  const jsonHeaders = { "Content-Type": "application/json", "Cache-Control": "no-store" };

  const token = url.searchParams.get("token") || req.headers.get("x-report-token") || "";
  const expected = process.env.REPORT_TOKEN || "";
  if (!expected) {
    // TEŞHİS (kullanıcı: env'i girdim ama "tanimli degil" hatasi aliyorum).
    // Değeri ASLA sızdırmadan, sorunun kaynağını ayırt et:
    //   · anahtar process.env'de VAR ama boş  → değer girilmemiş
    //   · anahtar process.env'de HİÇ YOK       → fonksiyona ulaşmıyor
    //     (en olası üç sebep: redeploy yok / Scope'ta Functions kapalı /
    //      yalnızca Deploy Previews context'ine eklenmiş)
    const defined = Object.prototype.hasOwnProperty.call(process.env, "REPORT_TOKEN");
    const hint = defined
      ? "REPORT_TOKEN env TANIMLI ama DEĞERİ BOŞ. Netlify'de değişkene gerçek bir değer gir, sonra Clear cache and deploy."
      : "REPORT_TOKEN fonksiyona ULAŞMIYOR (process.env'de yok). Sırayla dene: 1) Deploys > Trigger deploy > CLEAR CACHE AND DEPLOY. 2) Değişkenin SCOPE'unda 'Functions' işaretli mi. 3) Deploy context 'Production' (ya da 'all') mi, yalnızca Deploy Previews değil.";
    return wantHtml
      ? new Response(renderEmpty(esc(hint)), { status: 503, headers: htmlHeaders })
      : new Response(hint, { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  if (token !== expected) return new Response("Yetkisiz.", { status: 401 });

  // Blobs acilamazsa SEBEBI TASI. Eskiden yalnizca {users:0,note:"blobs yok"}
  // donuyordu; kullanici ekranda ham JSON goruyor ve neden bos oldugunu
  // anlayamiyordu (html=1 bile yok sayiliyordu, cunku bu dal erken donuyordu).
  let store, blobsErr = null;
  try { store = getStore("sakin-usage"); }
  catch (e) { blobsErr = `${e?.name || "Error"}: ${e?.message || String(e)}`; }
  if (!store) {
    return wantHtml
      ? new Response(renderBlobsProblem(blobsErr), { status: 200, headers: htmlHeaders })
      : new Response(JSON.stringify({ users: 0, note: "blobs acilamadi", detail: blobsErr }), { status: 200, headers: jsonHeaders });
  }

  const users = [];
  let truncated = false;
  let listErr = null;
  try {
    const { blobs } = await store.list({ prefix: "u/" });
    const keys = (blobs || []).map((b) => b.key);
    for (const k of keys) {
      if (users.length >= MAX_USERS) { truncated = true; break; }
      try { const rec = await store.get(k, { type: "json" }); if (rec) users.push(rec); } catch (_) {}
    }
  } catch (e) { listErr = `${e?.name || "Error"}: ${e?.message || String(e)}`; }

  // Liste cagrisi patladiysa bu da "veri yok" degil, bir ARIZA: oyle soyle.
  if (listErr && !users.length) {
    return wantHtml
      ? new Response(renderBlobsProblem(listErr), { status: 200, headers: htmlHeaders })
      : new Response(JSON.stringify({ users: 0, note: "blobs listelenemedi", detail: listErr }), { status: 200, headers: jsonHeaders });
  }

  const report = aggregate(users);
  if (wantHtml) {
    return new Response(renderHTML(report, truncated), { status: 200, headers: htmlHeaders });
  }
  return new Response(JSON.stringify({ ...report, truncated }, null, 2), { status: 200, headers: jsonHeaders });
};
