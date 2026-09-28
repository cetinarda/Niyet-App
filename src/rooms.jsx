// ── SAKİN ODALAR: tam ekran görünüm (1.4.3) ─────────────────────────────────────
// Orkestra kartından açılır (Çember ile Pong arasında). Üç görünüm: odalar (ızgara +
// yaklaşan buluşmalar), tek oda (hero, öğretiler, Sakin'de pratik, rehberler, odanın
// buluşmaları) ve tüm buluşmalar (odaya göre süzgeç). İçerik src/rooms-data.js,
// rehber + buluşmalar sunucudan (netlify/functions/rooms.mjs, panel: rooms-admin).
// Tek görsel dil: koyu yüzey, oda rengi yalnızca köşe ışığında ve küçük vurgularda.
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ROOMS, ROOMS_TXT, ROOMS_MOTTO, SEED_EVENTS } from "./rooms-data.js";

const CACHE_KEY = "sakin_rooms_cache";
function ageOf(bd) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(bd || ""));
  if (!m) return null;
  const n = new Date(); let a = n.getFullYear() - +m[1];
  if (n.getMonth() + 1 < +m[2] || (n.getMonth() + 1 === +m[2] && n.getDate() < +m[3])) a--;
  return a;
}

export default function RoomsOverlay({ lang, onClose, apiBase, birthDate, onPractice, onCember, track, locale }) {
  const L = (o) => (o && typeof o === "object" ? (o[lang] || o.en || o.tr || "") : (o || ""));
  const JOST = "'Jost',sans-serif", INTER = "'Inter',sans-serif", SERIF = "'Cormorant Garamond',Georgia,serif";
  const INK = "#f1ecf9", MUTE = "#8f88a3", BODY = "#cfc7e0", GOLD = "#e8c07a";
  const [view, setView] = useState({ v: "home" });       // home | room {id} | events {filter}
  const [remote, setRemote] = useState(() => { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "null") || { events: [], guides: [] }; } catch (_) { return { events: [], guides: [] }; } });
  const age = ageOf(birthDate);
  const rooms = useMemo(() => ROOMS.filter((r) => !r.minAge || (age != null && age >= r.minAge)), [age]);
  const roomIds = new Set(rooms.map((r) => r.id));

  useEffect(() => { try { track && track("rooms", { a: "open" }); } catch (_) {} }, []);
  useEffect(() => {
    fetch((apiBase || "") + "/.netlify/functions/rooms?lang=" + encodeURIComponent(lang))
      .then((r) => r.json())
      .then((j) => { if (j && j.ok) { setRemote({ events: j.events || [], guides: j.guides || [] }); try { localStorage.setItem(CACHE_KEY, JSON.stringify({ events: j.events || [], guides: j.guides || [] })); } catch (_) {} } })
      .catch(() => {});
  }, [lang]);
  // Android geri tuşu: odadan/listeden bir adım geri, ana görünümde kapat.
  useEffect(() => {
    const back = () => { if (view.v === "home") onClose(); else setView({ v: "home" }); };
    window.__sakinOverlayBack = back;
    return () => { if (window.__sakinOverlayBack === back) window.__sakinOverlayBack = null; };
  });

  // Buluşmalar: sabit başlangıç + sunucu, gelecektekiler, tarih sırası, gizli odanınkiler hariç.
  const now = Date.now() - 2 * 3600e3;
  const events = [...SEED_EVENTS, ...(remote.events || [])]
    .filter((e) => e && new Date(e.date).getTime() >= now && (e.room === "cember" || roomIds.has(e.room)))
    .filter((e, i, a) => a.findIndex((x) => x.id === e.id) === i)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const roomById = (id) => ROOMS.find((r) => r.id === id);
  const hueOf = (id) => (id === "cember" ? ["#82d9a3", "#b8a4d8"] : (roomById(id) || { hue: [GOLD, "#b8a4d8"] }).hue);
  const roomLabel = (id) => (id === "cember" ? L({ tr:"Çember", en:"Circle", de:"Kreis", es:"Círculo", pt:"Círculo", fr:"Cercle", ja:"サークル" }) : L((roomById(id) || {}).title));

  const BTN = { WebkitAppearance:"none", appearance:"none", font:"inherit", cursor:"pointer", background:"transparent", border:"none", color:"inherit", textAlign:"left" };
  const loc = locale || lang;
  const dayNum = (iso) => { try { return new Date(iso).toLocaleDateString(loc, { day:"numeric" }); } catch (_) { return ""; } };
  const monShort = (iso) => { try { return new Date(iso).toLocaleDateString(loc, { month:"short" }); } catch (_) { return ""; } };
  const timeStr = (iso) => { try { return new Date(iso).toLocaleString(loc, { weekday:"short", hour:"2-digit", minute:"2-digit" }); } catch (_) { return ""; } };
  const eyebrow = (t, right) => (
    <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:10, margin:"26px 2px 12px" }}>
      <span style={{ fontFamily:JOST, fontSize:11, letterSpacing:3.5, textTransform:"uppercase", color:"#b8a4d8" }}>{t}</span>
      {right || null}
    </div>
  );

  const openEvent = (e) => {
    try { track && track("rooms", { a: "event" }); } catch (_) {}
    if (e.room === "cember") { onCember && onCember(); return; }
    if (e.link) { try { window.open(e.link, "_blank", "noopener"); } catch (_) {} return; }
    if (roomIds.has(e.room)) setView({ v: "room", id: e.room });
  };
  const eventRow = (e) => {
    const [c1] = hueOf(e.room);
    return (
      <button key={e.id} onClick={() => openEvent(e)} style={{ ...BTN, width:"100%", display:"flex", alignItems:"center", gap:14, padding:"12px 14px", borderRadius:16,
        background:"rgba(255,255,255,0.03)", border:"1px solid rgba(184,164,216,0.14)" }}>
        <span style={{ width:48, flexShrink:0, textAlign:"center", padding:"6px 0", borderRadius:12, background:`${c1}14`, border:`1px solid ${c1}40` }}>
          <span style={{ display:"block", fontFamily:SERIF, fontSize:22, lineHeight:1, color:INK }}>{dayNum(e.date)}</span>
          <span style={{ display:"block", fontFamily:JOST, fontSize:10, letterSpacing:1.5, textTransform:"uppercase", color:MUTE, marginTop:3 }}>{monShort(e.date)}</span>
        </span>
        <span style={{ flex:1, minWidth:0 }}>
          <span style={{ display:"block", fontFamily:JOST, fontSize:14.5, color:INK, lineHeight:1.35 }}>{L(e.title)}</span>
          <span style={{ display:"block", fontFamily:INTER, fontSize:12, color:MUTE, marginTop:3, lineHeight:1.45 }}>
            {timeStr(e.date)}{L(e.where) ? " · " + L(e.where) : ""}{e.teacher ? " · " + e.teacher : ""}
          </span>
          <span style={{ display:"inline-block", marginTop:6, padding:"2px 9px", borderRadius:100, fontFamily:JOST, fontSize:10.5, letterSpacing:1, color:c1, border:`1px solid ${c1}55` }}>{roomLabel(e.room)}</span>
        </span>
        <span aria-hidden="true" style={{ color:"#6f6a80", fontSize:18 }}>›</span>
      </button>
    );
  };
  const roomCard = (r) => (
    <button key={r.id} onClick={() => { setView({ v: "room", id: r.id }); try { track && track("rooms", { a: "room" }); } catch (_) {} }}
      style={{ ...BTN, position:"relative", overflow:"hidden", minHeight:132, padding:"14px 14px 16px", borderRadius:18, display:"flex", flexDirection:"column", justifyContent:"flex-end", gap:4,
        background:`radial-gradient(ellipse 90% 80% at 85% 0%, ${r.hue[0]}38, transparent 65%), radial-gradient(ellipse 70% 70% at 100% 30%, ${r.hue[1]}26, transparent 70%), rgba(255,255,255,0.03)`,
        border:"1px solid rgba(184,164,216,0.16)" }}>
      <span style={{ position:"absolute", top:11, right:12, fontFamily:JOST, fontSize:9, letterSpacing:1.8, textTransform:"uppercase", color:"rgba(241,236,249,0.4)", maxWidth:"70%", textAlign:"right" }}>{r.freq}</span>
      <span style={{ fontSize:22, lineHeight:1, marginBottom:6 }}>{r.ico}</span>
      <span style={{ fontFamily:SERIF, fontSize:19, lineHeight:1.15, color:INK }}>{L(r.title)}</span>
      <span style={{ fontFamily:INTER, fontSize:12, lineHeight:1.45, color:"#b8aed0" }}>{L(r.tagline)}</span>
    </button>
  );

  let body = null;
  if (view.v === "home") {
    body = (<>
      <div style={{ textAlign:"center", padding:"4px 8px 0" }}>
        <div style={{ fontFamily:SERIF, fontSize:19, lineHeight:1.5, color:"#d6cfe6" }}>{L(ROOMS_TXT.lead)}</div>
      </div>
      {eyebrow(L(ROOMS_TXT.rooms))}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2, minmax(0, 1fr))", gap:10 }}>{rooms.map(roomCard)}</div>
      {eyebrow(L(ROOMS_TXT.events), events.length > 3 ? (
        <button onClick={() => setView({ v: "events", filter: "all" })} style={{ ...BTN, fontFamily:JOST, fontSize:12, letterSpacing:1.2, color:GOLD }}>{L(ROOMS_TXT.all)} →</button>
      ) : null)}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {events.length ? events.slice(0, 3).map(eventRow) : <div style={{ fontFamily:INTER, fontSize:13, color:MUTE, lineHeight:1.55, padding:"4px 2px" }}>{L(ROOMS_TXT.noEvents)}</div>}
      </div>
    </>);
  } else if (view.v === "room") {
    const r = roomById(view.id);
    const guides = (remote.guides || []).filter((g) => g.room === r.id);
    const rEvents = events.filter((e) => e.room === r.id);
    const pName = ROOMS_TXT.practiceName[r.practice];
    body = (<>
      <div style={{ position:"relative", overflow:"hidden", borderRadius:22, padding:"22px 18px 20px",
        background:`radial-gradient(ellipse 90% 90% at 90% 0%, ${r.hue[0]}44, transparent 65%), radial-gradient(ellipse 80% 80% at 0% 100%, ${r.hue[1]}22, transparent 70%), rgba(255,255,255,0.03)`,
        border:"1px solid rgba(184,164,216,0.18)" }}>
        <div style={{ fontFamily:JOST, fontSize:10, letterSpacing:2.5, textTransform:"uppercase", color:"rgba(241,236,249,0.5)" }}>{r.freq}</div>
        <div style={{ fontSize:30, margin:"10px 0 6px" }}>{r.ico}</div>
        <div style={{ fontFamily:SERIF, fontSize:30, lineHeight:1.1, color:INK }}>{L(r.title)}</div>
        <div style={{ fontFamily:SERIF, fontStyle:"italic", fontSize:18, color:"#e6dcf5", marginTop:6, lineHeight:1.4 }}>{L(r.tagline)}</div>
      </div>
      <div style={{ fontFamily:INTER, fontSize:14.5, lineHeight:1.75, color:BODY, margin:"18px 2px 0" }}>{L(r.hero)}</div>
      {r.practice && r.practice !== "events" && pName && (
        <button onClick={() => { try { track && track("rooms", { a: "practice" }); } catch (_) {} onPractice && onPractice(r.practice); }}
          style={{ ...BTN, width:"100%", marginTop:16, padding:"13px 16px", borderRadius:100, display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            background:`${r.hue[0]}1c`, border:`1px solid ${r.hue[0]}66`, color:INK, fontFamily:JOST, fontSize:13.5, letterSpacing:0.8 }}>
          <span>{L(ROOMS_TXT.practice)}</span><span style={{ color:MUTE }}>·</span><span style={{ color:r.hue[0] }}>{L(pName)}</span>
        </button>
      )}
      <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:18 }}>
        {r.teachings.map((t, i) => (
          <div key={i} style={{ padding:"14px 16px", borderRadius:16, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(184,164,216,0.12)" }}>
            <div style={{ fontFamily:JOST, fontSize:11.5, letterSpacing:2, textTransform:"uppercase", color:r.hue[0] }}>{L(t.h)}</div>
            {L(t.p) && <div style={{ fontFamily:INTER, fontSize:14, lineHeight:1.65, color:BODY, marginTop:6 }}>{L(t.p)}</div>}
            {t.list && (
              <ul style={{ margin:"8px 0 0", paddingLeft:18, fontFamily:INTER, fontSize:14, lineHeight:1.65, color:BODY }}>
                {(L(t.list) || []).map((li, j) => <li key={j}>{li}</li>)}
              </ul>
            )}
          </div>
        ))}
      </div>
      {eyebrow(L(ROOMS_TXT.events))}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {rEvents.length ? rEvents.map(eventRow) : <div style={{ fontFamily:INTER, fontSize:13, color:MUTE, lineHeight:1.55 }}>{L(ROOMS_TXT.noEvents)}</div>}
      </div>
      {eyebrow(L(ROOMS_TXT.guides))}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {guides.length ? guides.map((g) => (
          <div key={g.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:16, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(184,164,216,0.14)" }}>
            <span style={{ width:38, height:38, flexShrink:0, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:SERIF, fontSize:18, color:INK,
              background:`${r.hue[0]}22`, border:`1px solid ${r.hue[0]}55` }}>{(g.name || "?").trim().charAt(0).toLocaleUpperCase(loc)}</span>
            <span style={{ flex:1, minWidth:0 }}>
              <span style={{ display:"block", fontFamily:JOST, fontSize:14.5, color:INK }}>{g.name}</span>
              <span style={{ display:"block", fontFamily:INTER, fontSize:12, color:MUTE, lineHeight:1.45 }}>{[g.role, g.city].filter(Boolean).join(" · ")}</span>
            </span>
            {g.contact && <a href={"tel:" + g.contact.replace(/[^\d+]/g, "")} style={{ fontFamily:JOST, fontSize:12, letterSpacing:1, color:GOLD, textDecoration:"none", padding:"6px 12px", borderRadius:100, border:"1px solid rgba(232,192,122,0.4)" }}>{L(ROOMS_TXT.call)}</a>}
            {g.link && <a href={g.link} target="_blank" rel="noopener noreferrer" style={{ fontFamily:JOST, fontSize:12, letterSpacing:1, color:BODY, textDecoration:"none", padding:"6px 12px", borderRadius:100, border:"1px solid rgba(255,255,255,0.14)" }}>{L(ROOMS_TXT.open)}</a>}
          </div>
        )) : <div style={{ fontFamily:INTER, fontSize:13, color:MUTE, lineHeight:1.55 }}>{L(ROOMS_TXT.noGuides)}</div>}
      </div>
    </>);
  } else {
    const f = view.filter || "all";
    const chips = [["all", L(ROOMS_TXT.all)], ["cember", roomLabel("cember")], ...rooms.map((r) => [r.id, L(r.title)])]
      .filter(([id]) => id === "all" || events.some((e) => e.room === id));
    const list = f === "all" ? events : events.filter((e) => e.room === f);
    body = (<>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
        {chips.map(([id, label]) => (
          <button key={id} onClick={() => setView({ v: "events", filter: id })} style={{ ...BTN, padding:"6px 13px", borderRadius:100, fontFamily:JOST, fontSize:12, letterSpacing:0.8,
            border:`1px solid ${f === id ? "rgba(232,192,122,0.55)" : "rgba(255,255,255,0.12)"}`, background: f === id ? "rgba(232,192,122,0.12)" : "transparent", color: f === id ? "#f6dfb0" : MUTE }}>{label}</button>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>{list.length ? list.map(eventRow) : <div style={{ fontFamily:INTER, fontSize:13, color:MUTE }}>{L(ROOMS_TXT.noEvents)}</div>}</div>
    </>);
  }

  const headTitle = view.v === "room" ? "" : view.v === "events" ? L(ROOMS_TXT.events) : L(ROOMS_TXT.title);
  return createPortal(
    <div style={{ position:"fixed", inset:0, zIndex:100010, display:"flex", flexDirection:"column", animation:"fadeIn 0.35s ease",
      background:"radial-gradient(ellipse 90% 50% at 50% 0%, rgba(90,60,150,0.22), transparent 70%), #07060d" }}>
      <div style={{ padding:"calc(10px + var(--sat)) 14px 8px", display:"flex", alignItems:"center", gap:12, borderBottom:"1px solid rgba(184,164,216,0.1)" }}>
        <button onClick={() => { if (view.v === "home") onClose(); else setView({ v: "home" }); }} aria-label={L(ROOMS_TXT.back)}
          style={{ ...BTN, width:36, height:36, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid rgba(255,255,255,0.12)", color:"#cfc7e0", fontSize:16, flexShrink:0, textAlign:"center" }}>←</button>
        <div style={{ flex:1, minWidth:0, fontFamily:SERIF, fontSize:23, color:INK, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{headTitle}</div>
      </div>
      <div style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch" }}>
        <div style={{ maxWidth:560, margin:"0 auto", padding:"18px 16px calc(28px + var(--sab))" }}>
          {body}
          <div style={{ textAlign:"center", fontFamily:SERIF, fontStyle:"italic", fontSize:17, lineHeight:1.5, color:"#b8aed0", margin:"34px 10px 6px" }}>“{L(ROOMS_MOTTO)}”</div>
        </div>
      </div>
    </div>,
    document.body
  );
}
