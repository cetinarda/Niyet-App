// TANITIM TURU (1.4.3, Eki 2026). Kullanıcı: "ilk açılışta yol seçildikten ya da
// kapatıldıktan sonra 'Sakin'i tanımak ister misin?'; Bugün'den başlar, alt menüleri,
// Bağlan'ın üst menülerini, en son Ben'de ayarları gösterir, başladığı yere döner."
// Karar: 3-4 ANA ADIM (kullanıcı onayı; araştırma: 7 adımlı turu %16, 3-4 adımlıyı
// %72 bitiriyor). Kullanıcı başlatır, her adımda atlanabilir, Ayarlar'dan yeniden izlenir.
//
// Hedefler `data-tour="..."` işaretli elemanlar; bir adımın birden çok hedefi olabilir
// (birleşik kutu vurgulanır). Konum ölçümle bulunur ama ÖLÇÜM YALNIZCA VURGU HALKASI
// için: kart her zaman ekranın altında/üstünde sabit durur (iOS'ta ölçüme bağlı yerleşim
// kayabiliyor, bkz. yol seçimi ekranı dersi).
import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

export const TOUR_TXT = {
  offerTitle: { tr:"Sakin'i tanımak ister misin?", en:"Would you like a quick tour of Sakin?", de:"Möchtest du Sakin kurz kennenlernen?", es:"¿Quieres conocer Sakin en un momento?", pt:"Queres conhecer o Sakin num instante?", fr:"Veux-tu découvrir Sakin en un instant ?", ja:"Sakinを少し案内しましょうか？" },
  offerSub:   { tr:"4 kısa adım, yarım dakika.", en:"4 short steps, half a minute.", de:"4 kurze Schritte, eine halbe Minute.", es:"4 pasos cortos, medio minuto.", pt:"4 passos curtos, meio minuto.", fr:"4 petites étapes, une demi-minute.", ja:"4つの短いステップ、30秒ほど。" },
  start:      { tr:"Tura başla", en:"Start the tour", de:"Tour starten", es:"Empezar", pt:"Começar", fr:"Commencer", ja:"はじめる" },
  later:      { tr:"Şimdi değil", en:"Not now", de:"Nicht jetzt", es:"Ahora no", pt:"Agora não", fr:"Pas maintenant", ja:"今はいい" },
  next:       { tr:"İleri", en:"Next", de:"Weiter", es:"Siguiente", pt:"Seguinte", fr:"Suivant", ja:"次へ" },
  done:       { tr:"Bitti", en:"Done", de:"Fertig", es:"Listo", pt:"Concluído", fr:"Terminé", ja:"完了" },
  skip:       { tr:"Atla", en:"Skip", de:"Überspringen", es:"Saltar", pt:"Saltar", fr:"Passer", ja:"スキップ" },
  replay:     { tr:"Tanıtım turunu yeniden izle", en:"Replay the tour", de:"Tour noch einmal ansehen", es:"Ver el recorrido de nuevo", pt:"Rever a visita guiada", fr:"Revoir la visite", ja:"案内をもう一度見る" },
  s1t: { tr:"Bugün", en:"Today", de:"Heute", es:"Hoy", pt:"Hoje", fr:"Aujourd'hui", ja:"今日" },
  s1b: { tr:"Her sabah burada: günün kartı, pusulan ve sana ait sayı. Gün içinde dönüp bakabilirsin.", en:"Every morning, here: your card for the day, your compass and your own number. Come back to it anytime.", de:"Jeden Morgen hier: deine Tageskarte, dein Kompass und deine eigene Zahl. Schau jederzeit wieder vorbei.", es:"Cada mañana, aquí: tu carta del día, tu brújula y tu propio número. Vuelve cuando quieras.", pt:"Todas as manhãs, aqui: a tua carta do dia, a tua bússola e o teu número. Volta quando quiseres.", fr:"Chaque matin, ici : ta carte du jour, ta boussole et ton propre nombre. Reviens quand tu veux.", ja:"毎朝ここに：今日のカード、羅針盤、あなたの数字。いつでも見に戻れます。" },
  s2t: { tr:"Bağlan", en:"Connect", de:"Verbinden", es:"Conectar", pt:"Ligar", fr:"Se relier", ja:"つながる" },
  s2b: { tr:"Günün üç küçük adımı: sabah niyeti, nefes ve Ayna'ya bir soru. Üstteki şeritten ses, çakra ve diğer pratiklere geçersin.", en:"Three small steps a day: a morning intention, a breath and one question to the Mirror. The strip at the top takes you to sound, chakras and more.", de:"Drei kleine Schritte am Tag: eine Morgenabsicht, ein Atemzug und eine Frage an den Spiegel. Die Leiste oben führt zu Klang, Chakren und mehr.", es:"Tres pequeños pasos al día: una intención matinal, una respiración y una pregunta al Espejo. La franja de arriba te lleva al sonido, los chakras y más.", pt:"Três pequenos passos por dia: uma intenção matinal, uma respiração e uma pergunta ao Espelho. A faixa no topo leva-te ao som, aos chakras e mais.", fr:"Trois petits pas par jour : une intention du matin, une respiration et une question au Miroir. La bande du haut mène au son, aux chakras et plus.", ja:"1日3つの小さなステップ：朝の意図、呼吸、そして鏡への問い。上の帯から音やチャクラへ進めます。" },
  s3t: { tr:"Keşfet ve Ayna", en:"Explore and the Mirror", de:"Entdecken und Spiegel", es:"Explorar y el Espejo", pt:"Explorar e o Espelho", fr:"Explorer et le Miroir", ja:"探索と鏡" },
  s3b: { tr:"Keşfet'te Sakin Ailesi seni bekliyor: Hayvan, Mitler, SoulID ve fazlası. Ayna'ya aklındaki her şeyi sorabilirsin.", en:"Explore holds the Sakin family: Animal, Myths, SoulID and more. Ask the Mirror anything on your mind.", de:"In Entdecken wartet die Sakin-Familie: Tier, Mythen, SoulID und mehr. Frag den Spiegel alles, was dich beschäftigt.", es:"En Explorar te espera la familia Sakin: Animal, Mitos, SoulID y más. Pregúntale al Espejo lo que tengas en mente.", pt:"Em Explorar espera-te a família Sakin: Animal, Mitos, SoulID e mais. Pergunta ao Espelho o que tiveres em mente.", fr:"Explorer abrite la famille Sakin : Animal, Mythes, SoulID et plus. Demande au Miroir tout ce qui te traverse l'esprit.", ja:"探索ではSakinファミリー（動物、神話、SoulIDなど）が待っています。鏡には心にあることを何でも聞けます。" },
  s4t: { tr:"Ben", en:"Me", de:"Ich", es:"Yo", pt:"Eu", fr:"Moi", ja:"わたし" },
  s4b: { tr:"Haritan, niyet mektubun ve büyüyen bitkin burada. Sağ üstte zil ve ayarlar: turu oradan yeniden izleyebilirsin.", en:"Your chart, your intention letter and your growing plant live here. Top right: the bell and settings, where you can replay this tour.", de:"Hier wohnen dein Horoskop, dein Absichtsbrief und deine wachsende Pflanze. Oben rechts: Glocke und Einstellungen, dort kannst du die Tour wiederholen.", es:"Aquí están tu carta, tu carta de intención y tu planta que crece. Arriba a la derecha: la campana y los ajustes, desde donde puedes repetir el recorrido.", pt:"Aqui estão o teu mapa, a tua carta de intenção e a tua planta a crescer. Em cima à direita: o sino e as definições, onde podes rever a visita.", fr:"Ici vivent ta carte, ta lettre d'intention et ta plante qui grandit. En haut à droite : la cloche et les réglages, d'où tu peux revoir la visite.", ja:"あなたのチャート、意図の手紙、育つ植物はここに。右上はベルと設定。この案内はそこからもう一度見られます。" },
};

// Adımlar: hedef(ler) + gidilecek sekme. Sıra kullanıcının istediği gezinti.
export const TOUR_STEPS = [
  { tab: "bugun",  targets: ["tab-bugun"],              t: "s1t", b: "s1b" },
  { tab: "baglan", targets: ["tab-baglan", "steps"],    t: "s2t", b: "s2b" },
  // Keşfet adımı Keşfet panelini AÇAR (kullanıcı: "Ailesi seni bekliyor yazısı çıkınca Bağlan'da
  // kalıyor"). Panel tam ekran ama alt bar üstte kaldığı için sekme pencereleri görünür.
  { tab: "kesfet", targets: ["tab-kesfet", "tab-ayna"], t: "s3t", b: "s3b" },
  { tab: "ben",    targets: ["settings", "tab-ben"],    t: "s4t", b: "s4b" },
];

const GOLD = "#e8c07a", INK = "#f1ecf9", BODY = "#c9c1dc", MUTE = "#8f88a3";
const JOST = "'Jost',sans-serif", INTER = "'Inter',sans-serif", SERIF = "'Cormorant Garamond',Georgia,serif";
const pick = (o, lang) => (o && (o[lang] || o.en || o.tr)) || "";
const BTN = { WebkitAppearance: "none", appearance: "none", font: "inherit", cursor: "pointer", margin: 0,
  display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: 1 };

// Her hedef AYRI pencere: birleşik kutu alt sekme + üst şeridi kapsayıp neredeyse tüm
// ekranı açıyordu (test, Eki 2026). Yan yana duran sekmeler (Keşfet + Ayna) tek kutu olur.
function targetRects(ids) {
  const out = [];
  for (const id of ids) {
    const el = document.querySelector(`[data-tour="${id}"]`);
    if (!el) continue;
    const b = el.getBoundingClientRect();
    if (!b.width && !b.height) continue;
    const r = { left: b.left, top: b.top, right: b.right, bottom: b.bottom };
    const near = out.find((o) => Math.abs(o.top - r.top) < 4 && Math.abs(o.bottom - r.bottom) < 4 && (Math.abs(o.right - r.left) < 12 || Math.abs(r.right - o.left) < 12));
    if (near) { near.left = Math.min(near.left, r.left); near.right = Math.max(near.right, r.right); }
    else out.push(r);
  }
  return out;
}

// Teklif kartı (alttan, yarım sayfa değil küçük kart).
export function TourOffer({ lang, onStart, onLater }) {
  return createPortal(
    <div onClick={onLater} style={{ position: "fixed", inset: 0, zIndex: 100012, background: "rgba(4,3,10,0.55)", display: "flex",
      alignItems: "flex-end", justifyContent: "center", padding: "0 14px calc(96px + var(--sab, 0px))", animation: "fadeIn 0.3s ease", fontFamily: INTER }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, boxSizing: "border-box", padding: "20px 20px 16px", borderRadius: 20,
        background: "linear-gradient(180deg,#171030 0%,#0e0a1c 100%)", border: "1px solid rgba(232,192,122,0.3)", boxShadow: "0 18px 50px rgba(0,0,0,0.55)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8, animation: "fadeUp 0.35s ease-out" }}>
        <div style={{ color: GOLD, fontSize: 18, lineHeight: 1 }}>✦</div>
        <div style={{ fontFamily: SERIF, fontSize: 22, color: INK, textAlign: "center", lineHeight: 1.25 }}>{pick(TOUR_TXT.offerTitle, lang)}</div>
        <div style={{ fontSize: 13, color: MUTE, textAlign: "center" }}>{pick(TOUR_TXT.offerSub, lang)}</div>
        <div style={{ display: "flex", gap: 10, width: "100%", marginTop: 8 }}>
          <button onClick={onLater} style={{ ...BTN, flex: 1, padding: "12px 10px", borderRadius: 100, background: "transparent",
            border: "1px solid rgba(255,255,255,0.14)", color: BODY, fontFamily: JOST, fontSize: 12.5, letterSpacing: 1.4, textTransform: "uppercase" }}>{pick(TOUR_TXT.later, lang)}</button>
          <button onClick={onStart} style={{ ...BTN, flex: 1, padding: "12px 10px", borderRadius: 100, background: "rgba(232,192,122,0.14)",
            border: "1px solid rgba(232,192,122,0.5)", color: "#f6dfb0", fontFamily: JOST, fontSize: 12.5, letterSpacing: 1.4, textTransform: "uppercase" }}>{pick(TOUR_TXT.start, lang)}</button>
        </div>
      </div>
    </div>, document.body);
}

// Tur: `onTab(tab)` sekmeyi değiştirir, `onDone()` başlangıca döner.
export function TourOverlay({ lang, onTab, onDone }) {
  const [i, setI] = useState(0);
  const [rects, setRects] = useState([]);
  const step = TOUR_STEPS[i];
  useEffect(() => { if (step.tab) onTab(step.tab); /* eslint-disable-next-line */ }, [i]);
  // Sekme değişince eleman yeniden çizilir: birkaç kez ölç (ilk kare boş olabilir).
  useLayoutEffect(() => {
    let alive = true;
    const measure = () => { if (alive) setRects(targetRects(step.targets)); };
    measure();
    const ts = [80, 250, 500].map((ms) => setTimeout(measure, ms));
    window.addEventListener("resize", measure);
    return () => { alive = false; ts.forEach(clearTimeout); window.removeEventListener("resize", measure); };
  }, [i]);
  // Android geri tuşu turu kapatır.
  useEffect(() => {
    const back = () => onDone("skip");
    window.__sakinOverlayBack = back;
    return () => { if (window.__sakinOverlayBack === back) window.__sakinOverlayBack = null; };
  }, [onDone]);
  const last = i === TOUR_STEPS.length - 1;
  const pad = 6;
  // Ekran kenarına kırpılır (kaydırılabilir üst şerit ekrandan geniş).
  const vwx = typeof window !== "undefined" ? window.innerWidth : 400;
  const hls = rects.map((r) => {
    const x = Math.max(4, r.left - pad), y = Math.max(4, r.top - pad);
    const x2 = Math.min(vwx - 4, r.right + pad), y2 = r.bottom + pad;
    return { x, y, w: x2 - x, h: y2 - y };
  });
  // Kart: hedeflerin hepsi alt yarıdaysa ÜSTTE, değilse ekranın ortasına yakın ALTTA durur.
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const vw = typeof window !== "undefined" ? window.innerWidth : 400;
  const allLow = hls.length > 0 && hls.every((h) => h.y + h.h / 2 > vh / 2);
  const cardTop = allLow;
  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 100012, fontFamily: INTER }}>
      {/* Karartma + vurgu: halkanın dev gölgesi dışarıyı karartır, içerisi açık kalır. */}
      <svg width={vw} height={vh} style={{ position: "fixed", inset: 0, pointerEvents: "none" }} aria-hidden="true">
        <defs>
          <mask id="sakin-tour-mask">
            <rect x="0" y="0" width={vw} height={vh} fill="#fff" />
            {hls.map((h, k) => <rect key={k} x={h.x} y={h.y} width={h.w} height={h.h} rx="18" fill="#000" />)}
          </mask>
        </defs>
        <rect x="0" y="0" width={vw} height={vh} fill="rgba(4,3,10,0.68)" mask="url(#sakin-tour-mask)" />
        {hls.map((h, k) => <rect key={k} x={h.x} y={h.y} width={h.w} height={h.h} rx="18" fill="none" stroke={GOLD} strokeWidth="1.5" />)}
      </svg>
      {/* Tur sırasında alttaki uygulamaya dokunulmaz (yanlışlıkla gezinme olmasın). */}
      <div style={{ position: "fixed", inset: 0 }} onClick={(e) => e.stopPropagation()} />
      <div style={{ position: "fixed", left: 14, right: 14, ...(cardTop ? { top: "calc(18px + var(--sat, 0px))" } : { bottom: "calc(104px + var(--sab, 0px))" }),
        display: "flex", justifyContent: "center", pointerEvents: "none" }}>
        <div key={i} style={{ pointerEvents: "auto", width: "100%", maxWidth: 420, boxSizing: "border-box", padding: "18px 18px 14px", borderRadius: 18,
          background: "linear-gradient(180deg,#171030 0%,#0e0a1c 100%)", border: "1px solid rgba(232,192,122,0.3)", boxShadow: "0 16px 44px rgba(0,0,0,0.55)",
          display: "flex", flexDirection: "column", gap: 8, animation: "fadeUp 0.3s ease-out" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ flex: 1, fontFamily: JOST, fontSize: 10.5, letterSpacing: 2.4, textTransform: "uppercase", color: GOLD }}>{pick(TOUR_TXT[step.t], lang)}</span>
            <span style={{ display: "flex", gap: 5 }}>
              {TOUR_STEPS.map((_, k) => (
                <span key={k} style={{ width: k === i ? 14 : 6, height: 6, borderRadius: 6, background: k === i ? GOLD : "rgba(255,255,255,0.18)", transition: "all 0.3s" }} />
              ))}
            </span>
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.4, color: INK }}>{pick(TOUR_TXT[step.b], lang)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
            {!last && (
              <button onClick={() => onDone("skip")} style={{ ...BTN, padding: "10px 6px", background: "transparent", border: "none", color: MUTE,
                fontFamily: JOST, fontSize: 12, letterSpacing: 1.4, textTransform: "uppercase" }}>{pick(TOUR_TXT.skip, lang)}</button>
            )}
            <span style={{ flex: 1 }} />
            <button onClick={() => (last ? onDone("done") : setI(i + 1))} style={{ ...BTN, padding: "11px 22px", borderRadius: 100, background: "rgba(232,192,122,0.14)",
              border: "1px solid rgba(232,192,122,0.5)", color: "#f6dfb0", fontFamily: JOST, fontSize: 12.5, letterSpacing: 1.6, textTransform: "uppercase" }}>
              {pick(last ? TOUR_TXT.done : TOUR_TXT.next, lang)}
            </button>
          </div>
        </div>
      </div>
    </div>, document.body);
}
