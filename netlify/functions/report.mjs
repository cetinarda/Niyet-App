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
import { timingSafeEqual } from "node:crypto";

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

// ── BAĞLANMA TESTİ ÖLÇÜM SAĞLIĞI (1.4.3, Eki 2026) ─────────────────────────
// track.mjs rec.att = { r: "16 rakam", t } (a1..a8 kaygı, v1..v8 kaçınma; 1-5,
// cevapsız 0) ve test-tekrar test için rec.att0. Ters maddeler SoulID
// lib/attachment/index.ts ile AYNI (a7 a8 v7 v8). Orada madde sırası ya da ters
// madde değişirse BURAYI da değiştir. Saf fonksiyon, test edilebilir.
const ATT_REV = new Set([6, 7, 14, 15]);
const r3 = (x) => (x == null || !isFinite(x) ? null : Math.round(x * 1000) / 1000);
function attItems(s) {
  const raw = String(s).split("").map(Number);
  if (raw.length !== 16 || raw.some((x) => !(x >= 0 && x <= 5))) return null;
  return raw.map((x, i) => (x === 0 ? null : ATT_REV.has(i) ? 6 - x : x));
}
// Eksen puanı: SoulID axisScore ile aynı (1-5 ortalama -> 0-100).
function attAxis(items, off) {
  const v = items.slice(off, off + 8).filter((x) => x != null);
  return v.length ? ((v.reduce((a, x) => a + x, 0) / v.length - 1) / 4) * 100 : null;
}
function mean(a) { return a.reduce((s, x) => s + x, 0) / a.length; }
function sd(a) { if (a.length < 2) return null; const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); }
function pearson(x, y) {
  if (x.length < 3) return null;
  const mx = mean(x), my = mean(y);
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < x.length; i++) { const dx = x[i] - mx, dy = y[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
  return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : null;
}
// Cronbach alfa + düzeltilmiş madde-toplam korelasyonu + "madde silinirse alfa".
function alphaOf(rows) {
  const k = rows[0] ? rows[0].length : 0;
  if (rows.length < 3 || k < 2) return { alpha: null, items: [] };
  const variance = (a) => { const s = sd(a); return s == null ? 0 : s * s; };
  const calc = (cols) => {
    const tot = rows.map((r) => cols.reduce((s, j) => s + r[j], 0));
    const vt = variance(tot);
    const vi = cols.reduce((s, j) => s + variance(rows.map((r) => r[j])), 0);
    return vt > 0 ? (cols.length / (cols.length - 1)) * (1 - vi / vt) : null;
  };
  const all = [...Array(k).keys()];
  const items = all.map((j) => {
    const rest = all.filter((x) => x !== j);
    const col = rows.map((r) => r[j]);
    return {
      mean: r3(mean(col)), itemTotal: r3(pearson(col, rows.map((r) => rest.reduce((s, x) => s + r[x], 0)))),
      alphaIfDeleted: r3(calc(rest)),
    };
  });
  return { alpha: r3(calc(all)), items };
}
export function attachStats(users) {
  const full = [], axes = [], retest = [];
  const quad = { secure: 0, anxious: 0, avoidant: 0, disorganized: 0 };
  let partial = 0;
  for (const u of users) {
    const it = u.att && attItems(u.att.r);
    if (!it) continue;
    const anx = attAxis(it, 0), avo = attAxis(it, 8);
    if (anx == null || avo == null) continue;
    if (it.every((x) => x != null)) full.push(it); else partial++;
    axes.push([anx, avo]);
    quad[anx > 50 ? (avo > 50 ? "disorganized" : "anxious") : (avo > 50 ? "avoidant" : "secure")]++;
    const it0 = u.att0 && attItems(u.att0.r);
    if (it0) {
      const a0 = attAxis(it0, 0), v0 = attAxis(it0, 8);
      if (a0 != null && v0 != null) retest.push({ a0, v0, a1: anx, v1: avo, days: (u.att.t - u.att0.t) / 864e5 });
    }
  }
  const n = axes.length;
  const anxS = axes.map((x) => x[0]), avoS = axes.map((x) => x[1]);
  return {
    n, complete: full.length, partial,
    anxiety: alphaOf(full.map((r) => r.slice(0, 8))),
    avoidance: alphaOf(full.map((r) => r.slice(8))),
    norm: n ? { anxMean: r3(mean(anxS)), anxSd: r3(sd(anxS)), avoMean: r3(mean(avoS)), avoSd: r3(sd(avoS)) } : null,
    axisCorr: r3(pearson(anxS, avoS)),
    quad,
    retest: {
      n: retest.length,
      days: retest.length ? Math.round(mean(retest.map((x) => x.days))) : null,
      anx: r3(pearson(retest.map((x) => x.a0), retest.map((x) => x.a1))),
      avo: r3(pearson(retest.map((x) => x.v0), retest.map((x) => x.v1))),
      sameStyle: retest.length ? pct(retest.filter((x) => (x.a0 > 50) === (x.a1 > 50) && (x.v0 > 50) === (x.v1 > 50)).length, retest.length) : null,
    },
  };
}

export function aggregate(users) {
  const N = users.length;
  const reach = {}; FUNNEL.forEach((f) => (reach[f.key] = 0));
  // Object.create(null): istemciden gelen ekran adları ("__proto__" gibi) prototipe
  // yazamasın; bir kez yazılınca rapor kalıcı olarak çöküyordu (hata avı, Eyl 2026).
  const featTotals = Object.create(null), featUsers = Object.create(null);
  // SURE + GECIS (kullanici istegi: "ne kadar sure kaldilar, nereye
  // gectiler"). featSec/featExits ortalama sureyi hesaplar (bkz. asagida
  // avgSec = featSec/featExits); transTotals her "kaynak>hedef" ciftinin
  // TOPLAM kullanici sayisinda kac kez gorduldugunu tutar.
  const featSec = Object.create(null), featExits = Object.create(null);
  // Seçim sayaçları (track.mjs beyaz listesi): yol seçimi, Bugün kapısı, Ayna oyu.
  const ch = Object.create(null);
  const aynaTip = Object.create(null);
  const hist = Object.create(null);   // ekran -> [6 kova]
  const onbDone = { baglan: 0, kesfet: 0 };
  const np = { users: 0, count: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, off: {} };
  let notifUsers = 0;
  const transTotals = Object.create(null);
  const platform = Object.create(null), lang = Object.create(null), version = Object.create(null);
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
      // ⚠️ cember_/letter_/deeplink_/push_optin_/jserr_ bu süzgeçte YOKTU: track.mjs
      // onları sayıyordu ama rapor hep 0 gösteriyordu (Eyl 2026 düzeltmesi).
      } else if (/^(fork_|bgate_|ayna_|notif_|cember_|letter_|deeplink_|push_optin_|jserr_|inbox_|pong_|rooms_|tour_|selflove_)/.test(k)) {
        ch[k] = (ch[k] || 0) + c[k];
      }
    }
    const tr = u.tr || {};
    for (const key in tr) transTotals[key] = (transTotals[key] || 0) + tr[key];
  }

  // Her kaynak ekran icin en cok gidilen hedefleri cikar (yuzdesiyle).
  const transByOrigin = Object.create(null);
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
      byKind: ["genel", "kisisel", "koc", "tarot", "geridon", "mektup", "anlik", "diger"].map((k) => ({ k, n: ch["notif_" + k] || 0 })),
      deeplink: ["mandala", "bugun", "nefes", "ses", "chakra", "soulid"].map((k) => ({ k, n: ch["deeplink_" + k] || 0 })),
    },
    choices: {
      forkShown: ch.fork_shown || 0,
      forkBaglan: ch.fork_baglan || 0, forkKesfet: ch.fork_kesfet || 0,
      forkUntriedBaglan: ch.fork_untried_baglan || 0, forkUntriedKesfet: ch.fork_untried_kesfet || 0,
      pushYes: ch.push_optin_1 || 0, pushNo: ch.push_optin_0 || 0,
      inboxOpen: ch.inbox_open || 0, inboxUpdate: ch.inbox_update || 0,
      tour: ["offer", "start", "later", "skip", "done"].reduce((o, k) => (o[k] = ch["tour_" + k] || 0, o), {}),
      selflove: ["start", "done", "w_kind", "w_bond", "w_calm", "w_see"].reduce((o, k) => (o[k] = ch["selflove_" + k] || 0, o), {}),
      rooms: ["open", "room", "event", "practice"].reduce((o, k) => (o[k] = ch["rooms_" + k] || 0, o), {}),
      pong: ["open", "single", "host", "join", "end", "invite"].reduce((o, k) => (o[k] = ch["pong_" + k] || 0, o), {}),
      cember: ["open", "rules", "send", "report", "block", "crisis", "badges", "badgeof", "pong_invite", "pong_accept"].reduce((o, k) => (o[k] = ch["cember_" + k] || 0, o), {}),
      jsErr: Object.keys(ch).filter((k) => k.indexOf("jserr_") === 0).reduce((n, k) => n + ch[k], 0),
      letterSeal: ch.letter_seal || 0, letterOpen: ch.letter_open || 0,
      letterR: { oldu: ch.letter_r_oldu || 0, yolda: ch.letter_r_yolda || 0, donustu: ch.letter_r_donustu || 0 },
      gateShown: ch.bgate_shown || 0, gateEnter: ch.bgate_enter || 0, gateSkip: ch.bgate_skip || 0,
      gateEnterPct: pct(ch.bgate_enter || 0, ch.bgate_shown || 0),
      aynaUp: ch.ayna_up || 0, aynaDown: ch.ayna_down || 0,
      aynaUpPct: pct(ch.ayna_up || 0, (ch.ayna_up || 0) + (ch.ayna_down || 0)),
      aynaByTip: Object.keys(aynaTip).map((t) => ({ tip: t, up: aynaTip[t].up, down: aynaTip[t].down,
        upPct: pct(aynaTip[t].up, aynaTip[t].up + aynaTip[t].down) })).sort((a, b) => (b.up + b.down) - (a.up + a.down)),
    },
    attach: attachStats(users),
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

// Bağlanma testi ölçüm sağlığı bölümü. Eşikler psikometride yaygın kabul gören
// kaba sınırlar (alfa >= .70 kabul, >= .80 iyi; düzeltilmiş madde-toplam < .30
// zayıf madde; test-tekrar r >= .70 kararlı). Örneklem küçükken sayılar oynak:
// n < 50 iken yalnızca "veri birikiyor" denir, sonuç YORUMLANMAZ.
function attachSection(a) {
  if (!a || !a.n) {
    return `<h2>Bağlanma testi ölçüm sağlığı</h2><div class="card"><p style="margin:0;color:var(--muted)">Henüz cevap gelmedi. Test çözüldükçe 16 cevap rakam dizisi olarak anonim gelir (metin yok).</p></div>`;
  }
  const f = (x) => (x == null ? "-" : x.toFixed(2));
  const tone = (x, ok, good) => (x == null ? "" : x >= good ? ' style="color:var(--good)"' : x >= ok ? "" : ' style="color:var(--bad)"');
  const itemRows = (label, s, pre) => s.items.map((it, i) =>
    `<tr><td>${pre}${i + 1}${[6, 7].includes(i) ? " (ters)" : ""}</td><td class="num">${f(it.mean)}</td><td class="num"${tone(it.itemTotal, 0.3, 0.5)}>${f(it.itemTotal)}</td><td class="num"${it.alphaIfDeleted != null && s.alpha != null && it.alphaIfDeleted > s.alpha + 0.01 ? ' style="color:var(--bad)"' : ""}>${f(it.alphaIfDeleted)}</td></tr>`).join("");
  const q = a.quad, qt = q.secure + q.anxious + q.avoidant + q.disorganized;
  const small = a.complete < 50;
  return `<h2>Bağlanma testi ölçüm sağlığı</h2>
  <div class="card"><table>
    <tr><td>Testi çözen (tam / eksik cevaplı)</td><td class="num">${a.n} (${a.complete} / ${a.partial})</td></tr>
    <tr><td>Kaygı ekseni iç tutarlılık (Cronbach alfa)</td><td class="num"${tone(a.anxiety.alpha, 0.7, 0.8)}>${f(a.anxiety.alpha)}</td></tr>
    <tr><td>Kaçınma ekseni iç tutarlılık (Cronbach alfa)</td><td class="num"${tone(a.avoidance.alpha, 0.7, 0.8)}>${f(a.avoidance.alpha)}</td></tr>
    <tr><td>İki eksen arası korelasyon (düşük olmalı, ~.20-.40)</td><td class="num">${f(a.axisCorr)}</td></tr>
    <tr><td>Norm: kaygı ort. ± ss / kaçınma ort. ± ss (0-100)</td><td class="num">${a.norm ? `${a.norm.anxMean.toFixed(1)} ± ${(a.norm.anxSd || 0).toFixed(1)} / ${a.norm.avoMean.toFixed(1)} ± ${(a.norm.avoSd || 0).toFixed(1)}` : "-"}</td></tr>
    <tr><td>Stil dağılımı: güvenli / kaygılı / kaçıngan / korkulu-kaçıngan</td><td class="num">${["secure", "anxious", "avoidant", "disorganized"].map((k) => `%${pct(q[k], qt)}`).join(" / ")}</td></tr>
    <tr><td>Test-tekrar test (7-120 gün arayla yeniden çözen)</td><td class="num">${a.retest.n ? `${a.retest.n} kişi, ort. ${a.retest.days} gün` : "henüz yok"}</td></tr>
    ${a.retest.n ? `<tr><td>Test-tekrar r: kaygı / kaçınma · aynı stil</td><td class="num"><span${tone(a.retest.anx, 0.6, 0.7)}>${f(a.retest.anx)}</span> / <span${tone(a.retest.avo, 0.6, 0.7)}>${f(a.retest.avo)}</span> · %${a.retest.sameStyle}</td></tr>` : ""}
  </table></div>
  ${a.complete >= 3 ? `<div class="row2" style="margin-top:10px">
    <div class="mini"><h3>Kaygı maddeleri</h3><table><tr><th>Madde</th><th class="num">Ort.</th><th class="num">M-T r</th><th class="num">Silinirse alfa</th></tr>${itemRows("Kaygı", a.anxiety, "a")}</table></div>
    <div class="mini"><h3>Kaçınma maddeleri</h3><table><tr><th>Madde</th><th class="num">Ort.</th><th class="num">M-T r</th><th class="num">Silinirse alfa</th></tr>${itemRows("Kaçınma", a.avoidance, "v")}</table></div>
  </div>` : ""}
  <div class="foot" style="margin-top:10px">${small ? "<b>Örneklem küçük (tam cevaplı &lt; 50):</b> sayılar oynak, henüz yorumlama. " : ""}Nasıl okunur: alfa .70 altı (kırmızı) = eksen maddeleri aynı şeyi ölçmüyor; .80 üstü (yeşil) iyi. M-T r = düzeltilmiş madde-toplam korelasyonu, .30 altı (kırmızı) madde ekseninden kopuk, yeniden yazılmalı. "Silinirse α" eksenin alfasından belirgin yüksekse (kırmızı) o madde ölçeği bozuyor. Stil dağılımı aşırı tek yöne yığılıyorsa (ör. %60 korkulu-kaçıngan) 50 kesim noktası bu kitleye uymuyor: n ≥ 200 olunca norm ortalamasına göre kesim düşünülür. Test-tekrar r .70 üstü = sonuç haftadan haftaya kararlı.</div>`;
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
      const NK = { genel: "Genel hatırlatma", kisisel: "Kişiye özel", koc: "Yaşam koçu", tarot: "Sabah tarot", geridon: "Geri dönüş (10-30 gün)", mektup: "Niyet mektubu açıldı", anlik: "Anlık mesaj (panelden)", diger: "Diğer" };
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
         const OFF = { kisisel: "Kişisel mesaj", koc: "Yaşam koçu", aksam: "Akşam pratiği", tarot: "Sabah tarotu", hatirlatici: "Kişisel hatırlatıcı", ogle: "Gün ortası", kozmik: "Gökyüzü uyarısı", geridon: "Uzun aradan sonra" };
         return `<tr><td>Ayarını değiştiren kullanıcı</td><td class="num">${q.users}</td></tr>
           <tr><td>Günlük sayı seçimi (1 / 2 / 3 / 4 / 5)</td><td class="num">${q.count[1] || 0} / ${q.count[2] || 0} / ${q.count[3] || 0} / ${q.count[4] || 0} / ${q.count[5] || 0}</td></tr>` +
           Object.keys(q.off).map((k) => `<tr><td>Kapatan: ${esc(OFF[k] || k)}</td><td class="num">${q.off[k]}</td></tr>`).join(""); })()}
     </table></div>
     <h2>Seçimler</h2>
     <div class="card"><table>
       <tr><td>Yol seçimi gösterildi</td><td class="num">${c.forkShown || 0}</td></tr>
       <tr><td>Sakinleşmek seçildi</td><td class="num">${c.forkBaglan || 0} (denenmemiş işaretliyken ${c.forkUntriedBaglan || 0})</td></tr>
       <tr><td>Kendimi tanımak seçildi</td><td class="num">${c.forkKesfet || 0} (denenmemiş işaretliyken ${c.forkUntriedKesfet || 0})</td></tr>
       <tr><td>Bugün doğum kapısı gösterildi</td><td class="num">${c.gateShown || 0}</td></tr>
       <tr><td>Çember: açılış / kural onayı / mesaj</td><td class="num">${(c.cember || {}).open || 0} / ${(c.cember || {}).rules || 0} / ${(c.cember || {}).send || 0}</td></tr>
       <tr><td>Çember: bildirim / engelleme / kriz kartı</td><td class="num">${(c.cember || {}).report || 0} / ${(c.cember || {}).block || 0} / ${(c.cember || {}).crisis || 0}</td></tr>
       <tr><td>Sakin Odalar: açılış / oda / buluşma / pratiğe geçiş</td><td class="num">${["open","room","event","practice"].map((k) => (c.rooms || {})[k] || 0).join(" / ")}</td></tr>
       <tr><td>Pong: açılış / tek oyuncu / oda açma / katılma / biten maç / davetle</td><td class="num">${["open","single","host","join","end","invite"].map((k) => (c.pong || {})[k] || 0).join(" / ")}</td></tr>
       <tr><td>Bildirim merkezi (zil) açılışı</td><td class="num">${c.inboxOpen || 0}</td></tr>
       <tr><td>Zilden "Güncelle"ye dokunma</td><td class="num">${c.inboxUpdate || 0}</td></tr>
       <tr><td>Kendini sevme yansıması: başladı / bitirdi (şefkat isteyen: nezaket · bağ · denge · görme)</td><td class="num">${c.selflove ? `${c.selflove.start} / ${c.selflove.done} (${c.selflove.w_kind} · ${c.selflove.w_bond} · ${c.selflove.w_calm} · ${c.selflove.w_see})` : "-"}</td></tr>
       <tr><td>Tanıtım turu: teklif / başladı / sonra / atladı / bitirdi</td><td class="num">${c.tour ? [c.tour.offer, c.tour.start, c.tour.later, c.tour.skip, c.tour.done].join(" / ") : "-"}</td></tr>
       <tr><td>Çember: rozet rehberi / takma ada dokunup rozet özeti</td><td class="num">${(c.cember || {}).badges || 0} / ${(c.cember || {}).badgeof || 0}</td></tr>
       <tr><td>Uygulama hatası (hata ekranına düşen)</td><td class="num">${c.jsErr || 0}</td></tr>
       <tr><td>Anlık mesajlar (varsayılan açık): elle açtı / kapattı</td><td class="num">${c.pushYes || 0} / ${c.pushNo || 0}</td></tr>
       <tr><td>Niyet mektubu: mühürlendi / açıldı</td><td class="num">${c.letterSeal || 0} / ${c.letterOpen || 0}</td></tr>
       <tr><td>Mektup yansıması: gerçekleşti / yolda / dönüştü</td><td class="num">${(c.letterR || {}).oldu || 0} / ${(c.letterR || {}).yolda || 0} / ${(c.letterR || {}).donustu || 0}</td></tr>
       <tr><td>Kapıdan bilgi girmeye geçti</td><td class="num">${c.gateEnter || 0} · %${c.gateEnterPct || 0}</td></tr>
       <tr><td>Kapıyı atladı</td><td class="num">${c.gateSkip || 0}</td></tr>
       <tr><td>Ayna "iyi geldi" oranı</td><td class="num">${c.aynaUp || 0} iyi · ${c.aynaDown || 0} değil · %${c.aynaUpPct || 0}</td></tr>
       ${tipRows}
     </table></div>`;
    })() +

    attachSection(r.attach) +

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
  const _a = Buffer.from(String(token || "")), _b = Buffer.from(expected);
  if (_a.length !== _b.length || !timingSafeEqual(_a, _b)) return new Response("Yetkisiz.", { status: 401 });

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
    // 16'şarlı PARALEL okuma: tek tek okuma kurulum sayısı büyüdükçe 10 sn tavanına
    // dayanıyordu (pulse canlıda 7 sn ölçüldü, hata avı Eyl 2026).
    const lim = keys.slice(0, MAX_USERS); truncated = keys.length > MAX_USERS;
    for (let i = 0; i < lim.length; i += 16) {
      const got = await Promise.all(lim.slice(i, i + 16).map((k) => store.get(k, { type: "json" }).catch(() => null)));
      for (const rec of got) if (rec) users.push(rec);
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
