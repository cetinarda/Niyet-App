// Kullanim raporu - funnel / drop-off / retention (TOKEN korumali).
// ------------------------------------------------------------------------
// Erisim: ?token=... veya x-report-token header, REPORT_TOKEN env'i ile eslesmeli.
// REPORT_TOKEN tanimli degilse rapor KAPALI (veri hicbir sekilde ifsa olmaz).
//   GET ?token=XXX          -> JSON rapor
//   GET ?token=XXX&html=1   -> HTML gosterge paneli (tarayicida ac)
// Kaynak: netlify/functions/track.mjs'in yazdigi u/<anonId> kayitlari.
import { getStore } from "@netlify/blobs";

const MAX_USERS = 20000; // guvenlik siniri; asilirsa raporda not dusulur

// Funnel sirasi: her adim ONCEKININ alt kumesi olmasi beklenir.
const FUNNEL = [
  { key: "app_open",         label: "Uygulamayi acti" },
  { key: "birth_view",       label: "Dogum formuna ulasti" },
  { key: "profile_complete", label: "Profili tamamladi (HAZIRIM)" },
  { key: "mandala_view",     label: "Ana ekrana ulasti" },
  { key: "feature_any",      label: "Bir ozelligi kullandi" },
  { key: "nefes_complete",   label: "Nefes tamamladi" },
];

function pct(n, d) { return d > 0 ? Math.round((n / d) * 1000) / 10 : 0; }

export function aggregate(users) {
  const N = users.length;
  const reach = {}; FUNNEL.forEach((f) => (reach[f.key] = 0));
  const featTotals = {}, featUsers = {};
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
      }
    }
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
    platform: sortMap(platform),
    lang: sortMap(lang),
    version: sortMap(version),
  };
}

function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

export function renderHTML(r, truncated) {
  const bar = (p, color) => `<div style="height:10px;border-radius:6px;background:rgba(255,255,255,.08);overflow:hidden"><div style="height:100%;width:${Math.min(100, p)}%;background:${color}"></div></div>`;
  const funnelRows = r.funnel.map((f, i) => `
    <div style="margin:0 0 16px">
      <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:5px">
        <span>${esc(f.label)}</span>
        <span style="color:#9aa">${f.count} kisi &middot; %${f.ofTotal}${i > 0 ? ` &middot; onceki adimdan %${f.fromPrev}` : ""}</span>
      </div>
      ${bar(f.ofTotal, "linear-gradient(90deg,#7c5cc4,#b8a4d8)")}
      ${i > 0 && f.dropFromPrev > 0 ? `<div style="font-size:12px;color:#e08;margin-top:4px">${f.dropFromPrev} kisi burada kayboldu (%${f.dropPct} dusus)</div>` : ""}
    </div>`).join("");

  const featRows = r.features.map((f) => `
    <tr><td>${esc(f.screen)}</td><td style="text-align:right">${f.users}</td><td style="text-align:right">${f.opens}</td></tr>`).join("");
  const splitRows = (arr) => arr.map((x) => `<tr><td>${esc(x.k)}</td><td style="text-align:right">${x.n}</td></tr>`).join("");

  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Sakin Kullanim Raporu</title>
<style>body{margin:0;background:#0e0a18;color:#eee;font:15px/1.5 -apple-system,system-ui,sans-serif;padding:24px} .wrap{max-width:760px;margin:0 auto} h1{font-size:22px} h2{font-size:16px;margin:32px 0 14px;color:#c9b8e8} .card{background:#181227;border:1px solid #2a2140;border-radius:14px;padding:20px;margin-bottom:16px} .kpi{display:flex;flex-wrap:wrap;gap:12px} .kpi>div{flex:1;min-width:120px;background:#181227;border:1px solid #2a2140;border-radius:12px;padding:14px} .kpi b{display:block;font-size:24px} .kpi span{color:#9aa;font-size:12px} table{width:100%;border-collapse:collapse;font-size:14px} td,th{padding:7px 6px;border-bottom:1px solid #241c38;text-align:left} th{color:#9aa;font-weight:500} .muted{color:#8a8;font-size:12px}</style></head>
<body><div class="wrap">
<h1>Sakin - Kullanim Raporu</h1>
<div class="muted">Anonim birinci-taraf olcum. Kisisel veri yok.${truncated ? ` (UYARI: ${MAX_USERS}+ kullanici, kismi rapor)` : ""}</div>
<div class="kpi" style="margin-top:16px">
  <div><b>${r.users}</b><span>Toplam anonim kullanici</span></div>
  <div><b>${r.newLast7}</b><span>Son 7 gun yeni</span></div>
  <div><b>%${r.retention.day2Pct}</b><span>2. gun geri donus</span></div>
  <div><b>%${r.monetization.premiumPct}</b><span>Premium</span></div>
</div>

<h2>Onboarding funnel (nerede kayboluyorlar)</h2>
<div class="card">${funnelRows}</div>

<h2>Para kazanma</h2>
<div class="card"><table>
  <tr><td>Paywall gordu</td><td style="text-align:right">${r.monetization.paywallUsers} kisi &middot; %${r.monetization.ofTotal}</td></tr>
  <tr><td>Satin aldi</td><td style="text-align:right">${r.monetization.purchaseUsers} kisi &middot; paywall gorenlerin %${r.monetization.purchaseOfPaywall}</td></tr>
  <tr><td>Su an premium</td><td style="text-align:right">${r.monetization.premiumUsers} kisi &middot; %${r.monetization.premiumPct}</td></tr>
</table></div>

<h2>Baglilik</h2>
<div class="card"><table>
  <tr><td>Toplam oturum</td><td style="text-align:right">${r.engagement.sessionsTotal}</td></tr>
  <tr><td>Kullanici basi ort. oturum</td><td style="text-align:right">${r.engagement.avgSessionsPerUser}</td></tr>
  <tr><td>Toplam nefes</td><td style="text-align:right">${r.engagement.nefesTotal}</td></tr>
  <tr><td>Nefes yapan kullanici</td><td style="text-align:right">${r.engagement.nefesUsers}</td></tr>
  <tr><td>Nefes yapan basi ort. nefes</td><td style="text-align:right">${r.engagement.avgNefesPerNefesUser}</td></tr>
</table></div>

<h2>Ozellik kullanimi</h2>
<div class="card"><table><tr><th>Ekran</th><th style="text-align:right">Kullanici</th><th style="text-align:right">Acilis</th></tr>${featRows || '<tr><td colspan="3" class="muted">Henuz veri yok</td></tr>'}</table></div>

<h2>Platform / Dil / Surum</h2>
<div class="card"><table><tr><th>Platform</th><th style="text-align:right">Kullanici</th></tr>${splitRows(r.platform)}</table>
<table style="margin-top:12px"><tr><th>Dil</th><th style="text-align:right">Kullanici</th></tr>${splitRows(r.lang)}</table>
<table style="margin-top:12px"><tr><th>Surum</th><th style="text-align:right">Kullanici</th></tr>${splitRows(r.version)}</table></div>

<div class="muted" style="margin:24px 0">Not: gun anahtarlari kurulum basina son 60 gunle sinirli. Rapor cagirildigi anda hesaplanir.</div>
</div></body></html>`;
}

export const handler = async (event) => {
  const token = (event.queryStringParameters?.token) || event.headers?.["x-report-token"] || "";
  const expected = process.env.REPORT_TOKEN || "";
  if (!expected) return { statusCode: 503, body: "REPORT_TOKEN tanimli degil (rapor kapali)." };
  if (token !== expected) return { statusCode: 401, body: "Yetkisiz." };

  let store;
  try { store = getStore("sakin-usage"); }
  catch (_) { return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ users: 0, note: "blobs yok" }) }; }

  const users = [];
  let truncated = false;
  try {
    const { blobs } = await store.list({ prefix: "u/" });
    const keys = (blobs || []).map((b) => b.key);
    for (const k of keys) {
      if (users.length >= MAX_USERS) { truncated = true; break; }
      try { const rec = await store.get(k, { type: "json" }); if (rec) users.push(rec); } catch (_) {}
    }
  } catch (_) {}

  const report = aggregate(users);
  const wantHtml = event.queryStringParameters?.html === "1";
  if (wantHtml) {
    return { statusCode: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }, body: renderHTML(report, truncated) };
  }
  return { statusCode: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify({ ...report, truncated }, null, 2) };
};
