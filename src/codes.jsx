// KOD GÜNCELLEME (1.4.3, Eki 2026). Kullanıcı: "Kendini sevme yansıması kod güncelleme olarak
// değişsin; bu bölümde sırayla testler çözdürülsün, appin mantığına uyumlu başka başarılı
// testler bul, bir testi çözen diğerine geçer; sonuçlara sürekli ulaşılan bir sayfa olsun;
// veriler haftalık rapora ve bir yerde karneleştirilsin; ilkinin adı kendini sevme yansıması."
//
// YEDİ KOD, KALPTEN TACA: 1. kendini sevme (kalp), sonra kök, sakral, solar, boğaz, üçüncü göz,
// taç. Her biri 8 özgün cümle, 4 alan; bilinen ölçeklerin KAVRAMLARINDAN esinlenildi, madde
// KOPYALANMADI (bkz. codes-data.js başı). Adları "yansıma": PUAN YOK, tanı iddiası yok
// (Apple 1.4.1). Bir kod bitince sıradaki açılır (aynı anda, gün bekletmeden).
// Veri YALNIZCA cihazda: `sakin_codes` = { <kodId>: [ {at, sc, strong, weak, a}, ... ] }
// (en yeni sonda, kod başına son 8). Eski `sakin_selflove` ilk okumada 1. koda taşınır.
// Köprüler: Ben'deki kart (sıradaki kod) + KOD KARNEM tam ekran sayfa (tüm sonuçlar, geçmiş,
// yeniden bakma) + haftalık rapor (`codesReportText`, yalnızca alan adları + yeni kod, cevap
// GİTMEZ) + akşam hatırlatması (`codesEveningLine`, en son güncellenen kodun 2./5./9. akşamı,
// günlük sınırın İÇİNDE).
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import BackButton from "./back-button.jsx";
import { SELFLOVE_KEY, SL_SCALE, SL_TXT } from "./selflove-data.js";
import { CODES, CODE_UI, CHAKRA_NAMES, PRACTICE_LABELS } from "./codes-data.js";

export const CODES_KEY = "sakin_codes";
const P = (o, lang) => (o && (o[lang] || o.en || o.tr)) || "";
const HIST_MAX = 8;
const AGAIN_DAYS = 21;

export function readCodes() {
  let m = {};
  try { m = JSON.parse(localStorage.getItem(CODES_KEY) || "null") || {}; } catch (_) { m = {}; }
  if (!m || typeof m !== "object") m = {};
  // Göç: 1.4.3 öncesi tek yansıma (kendini sevme) ayrı anahtardaydı.
  if (!Array.isArray(m.selflove) || !m.selflove.length) {
    try {
      const old = JSON.parse(localStorage.getItem(SELFLOVE_KEY) || "null");
      if (old && old.at) { m.selflove = [old]; localStorage.setItem(CODES_KEY, JSON.stringify(m)); }
    } catch (_) {}
  }
  return m;
}
const latest = (m, id) => (Array.isArray(m[id]) && m[id].length ? m[id][m[id].length - 1] : null);
export const codesDone = (m) => CODES.filter((c) => latest(m, c.id)).length;
const isUnlocked = (m, i) => i === 0 || !!latest(m, CODES[i - 1].id);
const nextIndex = (m) => CODES.findIndex((c) => !latest(m, c.id));

// Alan puanı 0..1 (yüksek = güçlü), ters maddeler çevrilir; eşitlikte sabit sıra.
// Puan EKRANA YAZILMAZ, yalnızca en güçlü ve şefkat isteyen alanı seçmek için.
export function scoreCode(code, ans) {
  const order = Object.keys(code.areas);
  const sums = {}, cnt = {};
  code.items.forEach((it, i) => {
    const a = ans[i]; if (typeof a !== "number") return;
    const v = it.r ? 3 - a : a;
    sums[it.k] = (sums[it.k] || 0) + v; cnt[it.k] = (cnt[it.k] || 0) + 1;
  });
  const sc = {}; order.forEach((k) => { sc[k] = cnt[k] ? Math.round((sums[k] / (cnt[k] * 3)) * 100) / 100 : 0.5; });
  const strong = order.slice().sort((a, b) => sc[b] - sc[a])[0];
  let weak = order.slice().sort((a, b) => sc[a] - sc[b])[0];
  if (weak === strong) weak = order.find((k) => k !== strong);
  return { sc, strong, weak };
}

// Akşam hatırlatması: EN SON güncellenen kodun yeni kodu, 2. ve 9. akşam; 5. akşam taşınacak cümle.
export function codesEveningLine(lang, day) {
  const m = readCodes();
  let best = null, code = null;
  for (const c of CODES) { const r = latest(m, c.id); if (r && (!best || r.at > best.at)) { best = r; code = c; } }
  if (!best || !code || !code.areas[best.weak]) return null;
  const d0 = new Date(best.at); d0.setHours(0, 0, 0, 0);
  const d1 = new Date(day); d1.setHours(0, 0, 0, 0);
  const diff = Math.round((d1 - d0) / 86400000);
  if (![2, 5, 9].includes(diff)) return null;
  const a = code.areas[best.weak];
  return diff === 5 ? P(a.carry, lang) : P(a.neu, lang);
}

// Haftalık rapor köprüsü (App.jsx generateRapor). Türkçe yazılır (prompt dili), model
// raporu kullanıcının dilinde üretir. Cevaplar ve puanlar GİTMEZ: kod adı, güçlü alan,
// şefkat isteyen alan, yeni kod ve (varsa) önceki bakışa göre değişim.
export function codesReportText() {
  const m = readCodes();
  const lines = [];
  for (const c of CODES) {
    const h = Array.isArray(m[c.id]) ? m[c.id] : [];
    const r = h[h.length - 1]; if (!r || !c.areas[r.weak] || !c.areas[r.strong]) continue;
    const prev = h.length > 1 ? h[h.length - 2] : null;
    const days = Math.max(0, Math.round((Date.now() - r.at) / 86400000));
    let ln = `- ${c.name.tr} (${days} gün önce): güçlü alan "${c.areas[r.strong].name.tr}", şefkat isteyen alan "${c.areas[r.weak].name.tr}", yeni kodu: "${c.areas[r.weak].neu.tr}"`;
    if (prev && prev.weak && prev.weak !== r.weak && c.areas[prev.weak]) ln += ` (önceki bakışında şefkat isteyen alan "${c.areas[prev.weak].name.tr}" idi)`;
    lines.push(ln);
  }
  if (!lines.length) return "";
  return `\nKOD GÜNCELLEME (kullanıcının Ben ekranındaki öz-yansımaları; puan yok, tanı değil):\n${lines.join("\n")}\nRaporun uygun bir yerinde (Öne Çıkan Temalar ya da kapanış) bu yeni kodlardan en ilgili bir ya da ikisine bu haftanın izleriyle şefkatle bağ kur. Teşhis koyma, eksik ya da zayıf deme, görev verme; yeni kodu kendi cümlenle hatırlat.\n`;
}

// ── görsel yardımcılar ──
const JOST = "'Jost',sans-serif", INTER = "'Inter',sans-serif", SERIF = "'Cormorant Garamond',Georgia,serif";
const GOLD = "#e8c07a", LAV = "#b8a4d8", INK = "#ece6f6", BODY = "#c9c1dc", MUTE = "#8e8e99";
const BTN = { WebkitAppearance:"none", appearance:"none", font:"inherit", cursor:"pointer", margin:0, display:"inline-flex", alignItems:"center", justifyContent:"center" };
function rgba(hex, a) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((x) => x + x).join("") : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
const lbl = (t, c) => <div style={{ fontFamily:JOST, fontSize:10, letterSpacing:2.2, textTransform:"uppercase", color:c, marginBottom:4 }}>{t}</div>;
const dateOf = (ts, lang, opt) => { try { return new Date(ts).toLocaleDateString(lang === "pt" ? "pt-PT" : lang, opt || { day:"numeric", month:"long" }); } catch (_) { return ""; } };

// Yedi nokta: güncellenen kod kendi renginde dolu, sıradaki halkalı, kilitli soluk.
function CodeDots({ m, size = 9, gap = 7 }) {
  const ni = nextIndex(m);
  return (
    <div style={{ display:"flex", alignItems:"center", gap }}>
      {CODES.map((c, i) => {
        const done = !!latest(m, c.id), cur = i === ni;
        return <span key={c.id} style={{ width:size, height:size, borderRadius:"50%", flexShrink:0,
          background: done ? c.color : cur ? "transparent" : rgba(c.color, 0.14),
          border: `1px solid ${done ? c.color : cur ? c.color : rgba(c.color, 0.3)}`,
          boxShadow: done ? `0 0 8px ${rgba(c.color, 0.55)}` : "none" }} />;
      })}
    </div>
  );
}

// Sorular: 8 cümle, 4 seçenek. Bittiğinde onDone(cevaplar).
function ReflectionFlow({ code, lang, haptic, onDone, onCancel, framed = true }) {
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState([]);
  const L = (o) => P(o, lang);
  const c = code.color;
  const tap = () => { try { haptic && haptic(); } catch (_) {} };
  const answer = (v) => {
    tap();
    const next = ans.slice(); next[step] = v; setAns(next);
    if (step < code.items.length - 1) { setStep(step + 1); return; }
    onDone(next);
  };
  const it = code.items[step];
  return (
    <div style={framed ? { padding:"16px 16px 14px", borderRadius:14, background:rgba(c, 0.05), border:`1px solid ${rgba(c, 0.25)}` } : null}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
        <span style={{ flex:1, minWidth:0, fontFamily:JOST, fontSize:10.5, letterSpacing:2.6, textTransform:"uppercase", color:c }}>{L(code.name)}</span>
        <span style={{ fontFamily:JOST, fontSize:11, color:MUTE, letterSpacing:1 }}>{step + 1} / {code.items.length}</span>
      </div>
      <div style={{ height:3, borderRadius:3, background:"rgba(255,255,255,0.07)", marginBottom:16, overflow:"hidden" }}>
        <div style={{ width:`${(step / code.items.length) * 100}%`, height:"100%", background:c, transition:"width .3s" }} />
      </div>
      <div key={code.id + step} style={{ fontFamily:SERIF, fontSize:21, lineHeight:1.4, color:INK, minHeight:88, animation:"fadeIn .3s ease" }}>{L(it.t)}</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:14 }}>
        {SL_SCALE.map((s, v) => (
          <button key={v} onClick={() => answer(v)} style={{ ...BTN, padding:"12px 8px", borderRadius:12, background:"rgba(255,255,255,0.03)",
            border:`1px solid ${rgba(c, 0.3)}`, color:BODY, fontFamily:INTER, fontSize:13.5, textAlign:"center", lineHeight:1.25 }}>{L(s)}</button>
        ))}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
        <button onClick={() => { tap(); if (step > 0) setStep(step - 1); else onCancel && onCancel(); }} style={{ ...BTN, padding:"6px 2px", background:"transparent", border:"none",
          color:MUTE, fontFamily:JOST, fontSize:11.5, letterSpacing:1.4, textTransform:"uppercase" }}>{L(SL_TXT.back)}</button>
      </div>
    </div>
  );
}

// Bir kodun sonucu: güçlü alan, şefkat isteyen alan, eski kod -> yeni kod, taşınacak cümle.
function ResultBlock({ code, res, prev, lang, compact }) {
  const L = (o) => P(o, lang);
  const S = code.areas[res.strong], W = code.areas[res.weak];
  if (!S || !W) return null;
  const c = code.color;
  return (
    <div>
      <div style={{ marginBottom:12 }}>
        {lbl(L(SL_TXT.strong), GOLD)}
        <div style={{ fontFamily:JOST, fontSize:15, color:INK, fontWeight:300, marginBottom:2 }}>{L(S.name)}</div>
        {!compact && <div style={{ fontFamily:INTER, fontSize:13, lineHeight:1.5, color:BODY }}>{L(S.strong)}</div>}
      </div>
      <div style={{ paddingTop:12, borderTop:`1px solid ${rgba(c, 0.15)}`, marginBottom:12 }}>
        {lbl(L(SL_TXT.tender), c)}
        <div style={{ fontFamily:JOST, fontSize:15, color:INK, fontWeight:300, marginBottom:8 }}>{L(W.name)}</div>
        {prev && prev.weak && prev.weak !== res.weak && code.areas[prev.weak] && (
          <div style={{ fontFamily:INTER, fontSize:12, color:MUTE, marginTop:-4, marginBottom:8 }}>{L(CODE_UI.prevTender).replace("{x}", L(code.areas[prev.weak].name))}</div>
        )}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ padding:"10px 12px", borderRadius:12, background:"rgba(255,255,255,0.025)", border:"1px dashed rgba(255,255,255,0.12)" }}>
            {lbl(L(SL_TXT.oldCode), MUTE)}
            <div style={{ fontFamily:INTER, fontSize:13, lineHeight:1.5, color:MUTE, textDecoration:"line-through", textDecorationColor:"rgba(255,255,255,0.25)" }}>{L(W.old)}</div>
          </div>
          <div style={{ padding:"10px 12px", borderRadius:12, background:rgba(c, 0.07), border:`1px solid ${rgba(c, 0.32)}` }}>
            {lbl(L(SL_TXT.newCode), c)}
            <div style={{ fontFamily:SERIF, fontSize:18, lineHeight:1.4, color:INK }}>{L(W.neu)}</div>
          </div>
        </div>
      </div>
      <div style={{ paddingTop:12, borderTop:`1px solid ${rgba(c, 0.15)}` }}>
        {lbl(L(SL_TXT.carry), LAV)}
        <div style={{ fontFamily:SERIF, fontStyle:"italic", fontSize:17, lineHeight:1.45, color:"#d9cdf0" }}>{L(W.carry)}</div>
      </div>
    </div>
  );
}

const practiceBtn = (code, lang, onPractice) => code.practice && onPractice ? (
  <button onClick={() => onPractice(code)} style={{ ...BTN, gap:8, padding:"9px 14px", borderRadius:100, background:"transparent",
    border:`1px solid ${rgba(code.color, 0.4)}`, color:BODY, fontFamily:JOST, fontSize:11.5, letterSpacing:1.2, textTransform:"uppercase" }}>
    <span style={{ color:MUTE }}>{P(CODE_UI.practice, lang)}:</span><span style={{ color:code.color }}>{P(PRACTICE_LABELS[code.practice], lang)}</span>
  </button>
) : null;

// ── KOD KARNEM: tam ekran sayfa ──
function CodeKarne({ lang, m, onClose, onComplete, onPractice, haptic }) {
  const L = (o) => P(o, lang);
  const [flow, setFlow] = useState(null);   // yeniden bakılan / başlanan kod id
  const [justId, setJustId] = useState(null);
  useEffect(() => {
    const back = () => { if (flow) setFlow(null); else onClose(); };
    window.__sakinOverlayBack = back;
    return () => { if (window.__sakinOverlayBack === back) window.__sakinOverlayBack = null; };
  });
  const done = codesDone(m);
  const flowCode = flow && CODES.find((c) => c.id === flow);
  const startFlow = (id) => { setJustId(null); setFlow(id); try { document.getElementById("sakin-code-karne")?.scrollTo({ top: 0 }); } catch (_) {} };
  // Omurga: taç üstte, kök altta (çakra sırası), güncellenenler kendi renginde.
  const SPINE = ["crown", "thirdeye", "throat", "heart", "solar", "sacral", "root"];
  const spine = (
    <svg width="34" height="196" viewBox="0 0 34 196" aria-hidden="true" style={{ display:"block", flexShrink:0 }}>
      <line x1="17" y1="12" x2="17" y2="184" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      {SPINE.map((ch, i) => {
        const c = CODES.find((x) => x.chakra === ch); const y = 12 + i * 28.6;
        const ok = c && latest(m, c.id);
        return <g key={ch}>
          {ok && <circle cx="17" cy={y} r="11" fill={rgba(c.color, 0.16)} />}
          <circle cx="17" cy={y} r="6.5" fill={ok ? c.color : "transparent"} stroke={c ? (ok ? c.color : rgba(c.color, 0.45)) : "#555"} strokeWidth="1.2" />
        </g>;
      })}
    </svg>
  );
  return createPortal(
    <div style={{ position:"fixed", inset:0, zIndex:100010, display:"flex", flexDirection:"column", fontFamily:INTER, animation:"fadeIn 0.35s ease",
      background:"radial-gradient(ellipse 90% 50% at 50% 0%, rgba(224,169,189,0.12), transparent 70%), #07060d" }}>
      <div style={{ padding:"calc(10px + var(--sat, 0px)) 14px 8px", display:"flex", alignItems:"center", gap:12 }}>
        <BackButton onClick={() => { if (flow) setFlow(null); else onClose(); }} label={L(CODE_UI.back)} />
        <div style={{ flex:1, fontFamily:SERIF, fontSize:24, color:INK }}>{L(CODE_UI.karneTitle)}</div>
        <div style={{ width:36, flexShrink:0 }} />
      </div>
      <div id="sakin-code-karne" style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", padding:"4px 16px calc(40px + var(--sab, 0px))" }}>
        <div style={{ maxWidth:520, margin:"0 auto" }}>
          {flowCode ? (
            <div style={{ marginTop:8 }}>
              <ReflectionFlow code={flowCode} lang={lang} haptic={haptic} onCancel={() => setFlow(null)}
                onDone={(ans) => { onComplete(flowCode, ans); setFlow(null); setJustId(flowCode.id); }} />
            </div>
          ) : (<>
            <div style={{ fontFamily:INTER, fontSize:13, lineHeight:1.55, color:MUTE, margin:"2px 2px 16px" }}>{L(CODE_UI.karneSub)}</div>
            {/* Karne başı: omurga + sayı + taşınan yeni kodlar */}
            <div style={{ display:"flex", gap:16, padding:"16px 16px", borderRadius:16, background:"rgba(255,255,255,0.025)", border:"1px solid rgba(184,164,216,0.16)", marginBottom:18 }}>
              {spine}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:SERIF, fontSize:30, lineHeight:1, color:INK }}>{done}<span style={{ fontSize:18, color:MUTE }}> / 7</span></div>
                <div style={{ fontFamily:JOST, fontSize:10.5, letterSpacing:2.2, textTransform:"uppercase", color:LAV, margin:"6px 0 12px" }}>{L(CODE_UI.eyebrow)}</div>
                {done > 0 && lbl(L(CODE_UI.carryList), GOLD)}
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {CODES.map((c) => { const r = latest(m, c.id); if (!r || !c.areas[r.weak]) return null;
                    return <div key={c.id} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                      <span style={{ width:6, height:6, borderRadius:"50%", background:c.color, marginTop:8, flexShrink:0 }} />
                      <span style={{ fontFamily:SERIF, fontSize:15.5, lineHeight:1.35, color:"#e6def3" }}>{L(c.areas[r.weak].neu)}</span>
                    </div>; })}
                </div>
              </div>
            </div>
            {CODES.map((c, i) => {
              const h = Array.isArray(m[c.id]) ? m[c.id] : [];
              const r = h[h.length - 1], prev = h.length > 1 ? h[h.length - 2] : null;
              const open = isUnlocked(m, i);
              const ready = r && Date.now() >= r.at + AGAIN_DAYS * 86400000;
              return (
                <div key={c.id} style={{ marginBottom:12, padding:"14px 15px", borderRadius:16, background: r ? rgba(c.color, 0.045) : "rgba(255,255,255,0.02)",
                  border:`1px solid ${r ? rgba(c.color, 0.24) : "rgba(255,255,255,0.08)"}`, opacity: open ? 1 : 0.5 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom: r ? 12 : 0 }}>
                    <span style={{ width:10, height:10, borderRadius:"50%", flexShrink:0, background: r ? c.color : "transparent", border:`1px solid ${c.color}` }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:JOST, fontSize:14.5, color:INK, fontWeight:400 }}>{i + 1}. {L(c.name)}</div>
                      <div style={{ fontFamily:INTER, fontSize:11.5, color:MUTE, marginTop:1 }}>{L(CHAKRA_NAMES[c.chakra])} · {r ? L(CODE_UI.doneOn).replace("{d}", dateOf(r.at, lang)) : open ? L(CODE_UI.notYet) : L(CODE_UI.locked)}</div>
                    </div>
                    {open && !r && (
                      <button onClick={() => startFlow(c.id)} style={{ ...BTN, padding:"8px 14px", borderRadius:100, background:rgba(c.color, 0.12),
                        border:`1px solid ${rgba(c.color, 0.5)}`, color:INK, fontFamily:JOST, fontSize:11, letterSpacing:1.4, textTransform:"uppercase" }}>{L(SL_TXT.begin)}</button>
                    )}
                  </div>
                  {r && <>
                    {justId === c.id && <div style={{ fontFamily:JOST, fontSize:10.5, letterSpacing:2, textTransform:"uppercase", color:c.color, marginBottom:10 }}>✓ {L(CODE_UI.updated)}</div>}
                    <ResultBlock code={c} res={r} prev={prev} lang={lang} />
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:14, flexWrap:"wrap" }}>
                      {practiceBtn(c, lang, onPractice)}
                      <span style={{ flex:1 }} />
                      <button onClick={() => startFlow(c.id)} style={{ ...BTN, padding:"9px 14px", borderRadius:100, background: ready ? rgba(c.color, 0.12) : "transparent",
                        border:`1px solid ${ready ? rgba(c.color, 0.5) : "rgba(255,255,255,0.14)"}`, color: ready ? INK : BODY,
                        fontFamily:JOST, fontSize:11, letterSpacing:1.3, textTransform:"uppercase" }}>{L(SL_TXT.againNow)}</button>
                    </div>
                    <div style={{ fontFamily:INTER, fontSize:11.5, color:MUTE, marginTop:8 }}>
                      {ready ? L(SL_TXT.ready) : L(SL_TXT.again).replace("{d}", dateOf(r.at + AGAIN_DAYS * 86400000, lang))}
                    </div>
                  </>}
                </div>
              );
            })}
            <div style={{ fontFamily:INTER, fontSize:11, lineHeight:1.55, color:"#6f6a80", margin:"14px 4px 0" }}>{L(CODE_UI.note)}</div>
          </>)}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Ben'deki kart: sıradaki kod + az önce güncellenen kodun sonucu + Kod karnem ──
export function CodeUpdateCard({ lang, haptic, onTrack, onPractice }) {
  const [m, setM] = useState(() => readCodes());
  const [flow, setFlow] = useState(null);
  const [justId, setJustId] = useState(null);
  const [karne, setKarne] = useState(false);
  const [open, setOpen] = useState(false);       // yedisi bittiyse kart açılır-kapanır menü
  const boxRef = useRef(null), anchorRef = useRef(false);
  const L = (o) => P(o, lang);
  const tap = () => { try { haptic && haptic(); } catch (_) {} };
  const tr = (d) => { try { onTrack && onTrack("codes", d); } catch (_) {} };
  const done = codesDone(m), ni = nextIndex(m);
  const next = ni >= 0 ? CODES[ni] : null;

  const complete = (code, ans) => {
    const sc = scoreCode(code, ans);
    const r = { at: Date.now(), ...sc, a: ans };
    const cur = readCodes();
    const h = Array.isArray(cur[code.id]) ? cur[code.id].slice() : [];
    h.push(r);
    cur[code.id] = h.slice(-HIST_MAX);
    try { localStorage.setItem(CODES_KEY, JSON.stringify(cur)); } catch (_) {}
    setM({ ...cur });
    tr({ a: "done", c: code.id, w: sc.weak });
    if (code.id === "selflove") { try { onTrack && onTrack("selflove", { a: "done", w: sc.weak }); } catch (_) {} }
  };
  const begin = (code) => {
    tap(); anchorRef.current = true; setJustId(null); setFlow(code.id);
    tr({ a: "start", c: code.id });
    if (code.id === "selflove") { try { onTrack && onTrack("selflove", { a: "start" }); } catch (_) {} }
  };
  const practice = (code) => { tap(); tr({ a: "practice", c: code.id }); setKarne(false); onPractice && onPractice(code.practice); };
  const openKarne = () => { tap(); setKarne(true); tr({ a: "karne" }); };

  // scrollMarginTop: kart başına kaydırırken üst çubuğun altında kalmasın.
  const box = { marginBottom:20, padding:"18px 18px 16px", borderRadius:16, background:"rgba(224,170,190,0.045)", border:"1px solid rgba(232,170,190,0.2)",
    scrollMarginTop:"calc(104px + var(--sat, 0px))" };
  const allDone = done === CODES.length;
  const collapsed = allDone && !open && !flow && !justId;
  // EKRAN ATLAMASI (kullanıcı, Eki 2026: "testler bitince ekran genişliyor, yeni teste başla
  // deyince ekranda atlama oluyor"): sorular -> sonuç -> yeni soru geçişinde kartın boyu çok
  // değişiyor, sayfa kartın ortasında kalıyordu. Kullanıcı eylemiyle olan her geçişte kartın
  // BAŞI ekranın üstüne sabitlenir.
  useEffect(() => {
    if (!anchorRef.current) return;
    anchorRef.current = false;
    const el = boxRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top >= 70 && r.top < window.innerHeight * 0.35) return;   // zaten yerinde
    let reduce = false; try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (_) {}
    try { el.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" }); } catch (_) {}
  }, [flow, justId, open]);
  const toggle = () => { tap(); anchorRef.current = true; if (open || justId) { setOpen(false); setJustId(null); } else setOpen(true); };
  const flowCode = flow && CODES.find((c) => c.id === flow);
  const just = justId && CODES.find((c) => c.id === justId);

  let body;
  if (flowCode) {
    body = <ReflectionFlow code={flowCode} lang={lang} haptic={haptic} onCancel={() => setFlow(null)}
      onDone={(ans) => { anchorRef.current = true; complete(flowCode, ans); setFlow(null); setJustId(flowCode.id); }} />;
  } else if (just && latest(m, just.id)) {
    body = (
      <div style={{ padding:"16px 16px 14px", borderRadius:14, background:rgba(just.color, 0.05), border:`1px solid ${rgba(just.color, 0.25)}` }}>
        <div style={{ fontFamily:JOST, fontSize:10.5, letterSpacing:2.4, textTransform:"uppercase", color:just.color, marginBottom:12 }}>✓ {L(CODE_UI.updated)} · {L(just.name)}</div>
        <ResultBlock code={just} res={latest(m, just.id)} lang={lang} />
        <div style={{ fontFamily:INTER, fontSize:12, lineHeight:1.5, color:MUTE, marginTop:10 }}>{L(SL_TXT.remind)}</div>
        <div style={{ display:"flex", gap:8, marginTop:14, flexWrap:"wrap" }}>{practiceBtn(just, lang, practice)}</div>
        {next && (
          <button onClick={() => begin(next)} style={{ ...BTN, width:"100%", marginTop:12, gap:8, padding:"12px 14px", borderRadius:100, background:rgba(next.color, 0.12),
            border:`1px solid ${rgba(next.color, 0.5)}`, color:INK, fontFamily:JOST, fontSize:12, letterSpacing:1.5, textTransform:"uppercase" }}>
            {L(CODE_UI.goNext)}: {L(next.name)}
          </button>
        )}
      </div>
    );
  } else if (next) {
    body = (
      <div style={{ padding:"16px 16px 14px", borderRadius:14, background:rgba(next.color, 0.05), border:`1px solid ${rgba(next.color, 0.25)}` }}>
        <div style={{ fontFamily:JOST, fontSize:10, letterSpacing:2.2, textTransform:"uppercase", color:MUTE, marginBottom:4 }}>
          {done > 0 ? L(CODE_UI.nextCode) : ""}{done > 0 ? " · " : ""}{L(CHAKRA_NAMES[next.chakra])}
        </div>
        <div style={{ fontFamily:JOST, fontSize:15, color:next.color, letterSpacing:0.4, marginBottom:6 }}>{ni + 1}. {L(next.name)}</div>
        <div style={{ fontFamily:SERIF, fontSize:22, lineHeight:1.3, color:INK, marginBottom:6 }}>{L(next.invite)}</div>
        <div style={{ fontFamily:INTER, fontSize:13, lineHeight:1.5, color:MUTE, marginBottom:14 }}>{L(CODE_UI.inviteSub)}</div>
        <button onClick={() => begin(next)} style={{ ...BTN, width:"100%", padding:"12px 14px", borderRadius:100, background:rgba(next.color, 0.12),
          border:`1px solid ${rgba(next.color, 0.5)}`, color:INK, fontFamily:JOST, fontSize:12.5, letterSpacing:1.6, textTransform:"uppercase" }}>{L(SL_TXT.begin)}</button>
      </div>
    );
  } else {
    body = <div style={{ fontFamily:SERIF, fontSize:19, lineHeight:1.4, color:INK }}>{L(CODE_UI.allDone)}</div>;
  }

  // BAŞLIK İKİ SATIR (kullanıcı): "Kod güncelleme" + "Yedi kod, kalpten taca". Açıklama
  // paragrafı kaldırıldı; ilerleme yedi noktada görünüyor. Yedisi bittiyse başlık
  // açılır-kapanır menünün düğmesi olur (varsayılan kapalı).
  const head = (
    <>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
        <span style={{ flex:1, fontFamily:JOST, fontSize:10.5, letterSpacing:3, textTransform:"uppercase", color:"#e0a9bd" }}>{L(CODE_UI.eyebrow)}</span>
        <CodeDots m={m} size={8} gap={5} />
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ flex:1, fontFamily:SERIF, fontSize:20, lineHeight:1.3, color:INK }}>{L(CODE_UI.title)}</span>
        {allDone && (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"
            style={{ display:"block", flexShrink:0, color:MUTE, transform: collapsed ? "none" : "rotate(180deg)", transition:"transform .25s" }}>
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </>
  );
  return (
    <div ref={boxRef} style={box}>
      {allDone ? (
        <button onClick={toggle} aria-expanded={!collapsed} style={{ ...BTN, display:"block", width:"100%", padding:0, background:"transparent", border:"none", textAlign:"left", color:"inherit" }}>{head}</button>
      ) : head}
      {!collapsed && <div style={{ marginTop:14 }}>{body}</div>}
      {!collapsed && done > 0 && !flowCode && (
        <button onClick={openKarne} style={{ ...BTN, width:"100%", marginTop:12, gap:10, padding:"11px 14px", borderRadius:100, background:"transparent",
          border:"1px solid rgba(232,192,122,0.4)", color:"#f0dcae", fontFamily:JOST, fontSize:12, letterSpacing:1.6, textTransform:"uppercase" }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ display:"block" }}>
            <rect x="3" y="2" width="10" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
            <path d="M5.5 6h5M5.5 8.5h5M5.5 11h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          {L(CODE_UI.karneBtn)}
        </button>
      )}
      {!collapsed && <div style={{ fontFamily:INTER, fontSize:11, lineHeight:1.5, color:"#6f6a80", marginTop:12 }}>{L(CODE_UI.note)}</div>}
      {karne && <CodeKarne lang={lang} m={m} haptic={haptic} onClose={() => setKarne(false)} onPractice={practice}
        onComplete={(code, ans) => { complete(code, ans); }} />}
    </div>
  );
}
