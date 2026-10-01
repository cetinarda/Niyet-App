// ── SAKİN PONG (1.4.3, kullanıcı: "bir pong oyunu yap; iki kullanıcı karşılıklı
// oynayabilsin: biri oda açar, diğeri odalarda boş tarafa geçer; ya da tek oyuncu.
// Bugün ekranına, ikili uyumun altına; tıklanınca tam ekran") ──────────────────
// Sakin'in ruhuna uygun: yavaş başlayan top, yumuşak ışık izi, 7 sayı, sayaç yok.
//
// TEK OYUNCU: tamamen cihazda, rakip yavaş ve yenilebilir bir yapay rakip.
// İKİ KİŞİ: Supabase Realtime (Çember'le aynı proje, AYRI istemci). Kanallar PRIVATE:
//   - `pong:lobby`: yalnızca PRESENCE. Oda açan kendini {rid, nick} ile duyurur,
//     lobidekiler listeyi görür. Oyun başlayınca oda lobiden çekilir.
//   - `pong:r:<rid>`: oyun kanalı. Presence ile kim burada (host/guest), broadcast ile
//     oyun: "p" raket x'i (her iki taraf, ~15/sn, yalnızca değişince), "b" top anlık
//     görüntüsü (yalnızca oda sahibi: servis/raket vuruşu + 0,8 sn'de bir), "s" skor,
//     "end", "again", "start"/"full".
//   ODA SAHİBİ YETKİLİ: fiziği o çalıştırır, vuruş/sayı kararını o verir. Konuk topu
//   son anlık görüntüden kendi ekranında sürer (duvarlar belirli), karar vermez.
//   Koordinatlar oda sahibinin gözünden: sahibi ALTTA. Konuk ekranı çevrilir, böylece
//   HERKES kendini altta görür.
// ⚠️ Supabase'de `pong:%` kanalları için realtime.messages politikaları gerekir
//   (supabase/cember.sql sonu). Yoksa kanal CHANNEL_ERROR verir, ekran "iki kişilik
//   oyun şu an kapalı" der, tek oyuncu çalışır. Mesaj trafiği az tutuldu (ücretsiz
//   katmanın saniyelik mesaj sınırı).
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import BackButton from "./back-button.jsx";

const TXT = {
  title:     { tr:"Pong", en:"Pong", de:"Pong", es:"Pong", pt:"Pong", fr:"Pong", ja:"ポン" },
  sub:       { tr:"Tek başına ya da biriyle, sakin bir oyun", en:"On your own or with someone, a calm game", de:"Allein oder zu zweit, ein ruhiges Spiel", es:"Solo o con alguien, un juego tranquilo", pt:"Sozinho ou com alguém, um jogo calmo", fr:"Seul ou à deux, un jeu paisible", ja:"ひとりでも、だれかとでも。静かなゲーム" },
  single:    { tr:"Tek oyuncu", en:"Single player", de:"Allein spielen", es:"Un jugador", pt:"Um jogador", fr:"Un joueur", ja:"ひとりで" },
  singleSub: { tr:"Yavaş bir rakibe karşı", en:"Against a gentle opponent", de:"Gegen einen sanften Gegner", es:"Contra un rival tranquilo", pt:"Contra um adversário calmo", fr:"Contre un adversaire tranquille", ja:"やさしい相手と" },
  duo:       { tr:"İki kişi", en:"Two players", de:"Zu zweit", es:"Dos jugadores", pt:"Dois jogadores", fr:"À deux", ja:"ふたりで" },
  duoSub:    { tr:"Oda aç ya da boş bir odaya katıl", en:"Open a room or join an open one", de:"Öffne einen Raum oder tritt einem bei", es:"Abre una sala o únete a una libre", pt:"Abre uma sala ou entra numa livre", fr:"Ouvre un salon ou rejoins-en un", ja:"部屋を開くか、空いている部屋に入る" },
  openRoom:  { tr:"Oda aç", en:"Open a room", de:"Raum öffnen", es:"Abrir sala", pt:"Abrir sala", fr:"Ouvrir un salon", ja:"部屋を開く" },
  rooms:     { tr:"Açık odalar", en:"Open rooms", de:"Offene Räume", es:"Salas abiertas", pt:"Salas abertas", fr:"Salons ouverts", ja:"空いている部屋" },
  noRooms:   { tr:"Şu an açık oda yok. Bir oda aç, biri katılsın.", en:"No open rooms right now. Open one and someone can join.", de:"Gerade kein offener Raum. Öffne einen, jemand kann beitreten.", es:"No hay salas abiertas. Abre una y alguien podrá unirse.", pt:"Não há salas abertas. Abre uma e alguém pode entrar.", fr:"Aucun salon ouvert. Ouvre-en un, quelqu'un pourra te rejoindre.", ja:"いま空いている部屋はありません。部屋を開くと、だれかが入れます。" },
  waitingFor:{ tr:"bekliyor", en:"is waiting", de:"wartet", es:"espera", pt:"está à espera", fr:"attend", ja:"待っています" },
  join:      { tr:"Katıl", en:"Join", de:"Beitreten", es:"Unirse", pt:"Entrar", fr:"Rejoindre", ja:"入る" },
  waiting:   { tr:"Biri katılana kadar burada bekle. Oda açık.", en:"Wait here until someone joins. Your room is open.", de:"Warte hier, bis jemand beitritt. Dein Raum ist offen.", es:"Espera aquí hasta que alguien se una. Tu sala está abierta.", pt:"Espera aqui até alguém entrar. A tua sala está aberta.", fr:"Attends ici que quelqu'un te rejoigne. Ton salon est ouvert.", ja:"だれかが入るまで、ここで待ってね。部屋は開いています。" },
  cancel:    { tr:"Vazgeç", en:"Cancel", de:"Abbrechen", es:"Cancelar", pt:"Cancelar", fr:"Annuler", ja:"やめる" },
  back:      { tr:"Geri", en:"Back", de:"Zurück", es:"Atrás", pt:"Voltar", fr:"Retour", ja:"戻る" },
  full:      { tr:"Bu oda doldu. Başka bir odaya bak.", en:"This room is full. Try another one.", de:"Dieser Raum ist voll. Schau nach einem anderen.", es:"Esta sala está llena. Prueba otra.", pt:"Esta sala está cheia. Experimenta outra.", fr:"Ce salon est complet. Essaie-en un autre.", ja:"この部屋はいっぱいです。ほかの部屋を見てね。" },
  left:      { tr:"Rakibin ayrıldı.", en:"Your opponent left.", de:"Dein Gegner ist gegangen.", es:"Tu rival se fue.", pt:"O teu adversário saiu.", fr:"Ton adversaire est parti.", ja:"相手が退出しました。" },
  closed:    { tr:"İki kişilik oyun şu an kapalı. Tek oyuncu oynayabilirsin.", en:"Two-player mode is closed right now. You can play single player.", de:"Der Zwei-Spieler-Modus ist gerade geschlossen. Du kannst allein spielen.", es:"El modo de dos jugadores está cerrado ahora. Puedes jugar solo.", pt:"O modo de dois jogadores está fechado agora. Podes jogar sozinho.", fr:"Le mode à deux est fermé pour l'instant. Tu peux jouer seul.", ja:"ふたりモードはいま閉じています。ひとりで遊べます。" },
  connecting:{ tr:"Bağlanıyor...", en:"Connecting...", de:"Verbinde...", es:"Conectando...", pt:"A ligar...", fr:"Connexion...", ja:"接続中..." },
  you:       { tr:"Sen", en:"You", de:"Du", es:"Tú", pt:"Tu", fr:"Toi", ja:"あなた" },
  ai:        { tr:"Sakin", en:"Sakin", de:"Sakin", es:"Sakin", pt:"Sakin", fr:"Sakin", ja:"Sakin" },
  win:       { tr:"Kazandın", en:"You won", de:"Du hast gewonnen", es:"Ganaste", pt:"Ganhaste", fr:"Tu as gagné", ja:"あなたの勝ち" },
  lose:      { tr:"Bu sefer o kazandı", en:"This time they won", de:"Diesmal hat der andere gewonnen", es:"Esta vez ganó el otro", pt:"Desta vez ganhou o outro", fr:"Cette fois, l'autre a gagné", ja:"今回は相手の勝ち" },
  again:     { tr:"Tekrar", en:"Again", de:"Nochmal", es:"Otra vez", pt:"Outra vez", fr:"Encore", ja:"もう一度" },
  hint:      { tr:"Parmağını kaydır, raketin takip etsin. 7 sayıya ilk ulaşan kazanır.", en:"Slide your finger and your paddle follows. First to 7 wins.", de:"Wisch mit dem Finger, dein Schläger folgt. Wer zuerst 7 hat, gewinnt.", es:"Desliza el dedo y tu pala te sigue. Gana quien llegue antes a 7.", pt:"Desliza o dedo e a raquete segue-te. Ganha quem chegar primeiro a 7.", fr:"Fais glisser ton doigt, ta raquette suit. Le premier à 7 gagne.", ja:"指をすべらせるとラケットがついてきます。先に7点で勝ち。" },
  invited:   { tr:"Davetin gitti. Kabul etmesini bekle.", en:"Your invite is on its way. Wait for them to accept.", de:"Deine Einladung ist unterwegs. Warte, bis sie angenommen wird.", es:"Tu invitación está en camino. Espera a que la acepte.", pt:"O teu convite foi enviado. Espera que o aceite.", fr:"Ton invitation est partie. Attends qu'elle soit acceptée.", ja:"招待を送りました。受けてくれるのを待ってね。" },
  declined:  { tr:"Şimdi değil dedi. Belki başka zaman.", en:"They said not now. Maybe another time.", de:"Gerade nicht, hieß es. Vielleicht ein andermal.", es:"Dijo que ahora no. Quizá en otro momento.", pt:"Disse que agora não. Talvez noutra altura.", fr:"Pas maintenant, a-t-on répondu. Une autre fois peut-être.", ja:"いまは遊べないそうです。また今度。" },
  expired:   { tr:"Bu davet artık geçerli değil.", en:"This invite is no longer active.", de:"Diese Einladung ist nicht mehr gültig.", es:"Esta invitación ya no está activa.", pt:"Este convite já não está ativo.", fr:"Cette invitation n'est plus active.", ja:"この招待はもう有効ではありません。" },
  close:     { tr:"Kapat", en:"Close", de:"Schließen", es:"Cerrar", pt:"Fechar", fr:"Fermer", ja:"閉じる" },
};

// Saha: genişlik 1, yükseklik H (dikey telefon). Tüm fizik bu birimlerde.
const H = 1.6, PW = 0.24, PH = 0.022, BR = 0.02, PY = 0.075;
const S0 = 0.62, SMAX = 1.45, WIN = 7;
// KADEMELİ HIZ (Eki 2026, kullanıcı: "kademe kademe hızlansın; skordan sonra her yeni oyunda
// en yavaştan başlasın"). Eskiden HER SAYIDAN sonra servis S0'a dönüyordu, maç hiç
// ısınmıyordu. Artık servis hızı maçta atılan sayıyla kademe kademe artar (sayı başına
// %7, servis tavanı SERVE_MAX); ralli içinde her vuruş %5 ekler (tavan maç ilerledikçe
// SMAX'tan biraz yukarı açılır). Yeni maç (rövanş dahil) skor 0-0 olduğu için en yavaştan.
const SERVE_STEP = 0.07, SERVE_MAX = 1.12, CAP_STEP = 0.02, CAP_MAX = 1.7;
const serveSpeed = (pts) => Math.min(SERVE_MAX, S0 * (1 + SERVE_STEP * pts));
const rallyCap = (pts) => Math.min(CAP_MAX, SMAX + CAP_STEP * pts);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

let __pongClient = null;
async function pongClient(getCember) {
  // Test kancası: iki sekmeyi sahte bir Realtime ile bağlamak için (Puppeteer testi).
  // Üretimde tanımlı değil, etkisiz.
  if (typeof window !== "undefined" && window.__pongFakeClient) return window.__pongFakeClient;
  if (__pongClient) return __pongClient;
  const c = await getCember();
  if (!c || !c.ok) return null;
  const { createClient } = await import("@supabase/supabase-js");
  // Çember istemcisinden AYRI: oyun saniyede daha çok olay gönderir.
  __pongClient = { sb: createClient(c.cfg.url, c.cfg.anon, { auth: { persistSession: false, autoRefreshToken: false }, realtime: { params: { eventsPerSecond: 25 } } }),
    nick: (c.cfg.nick && (c.cfg.nick.tr || c.cfg.nick.global)) || "Sakin" };
  return __pongClient;
}

// `invite` (Çember'den davet, 1.4.3): { role: "host"|"guest", rid, nick }. Oda LOBİYE
// DÜŞMEZ (özel oda); host davet edene, guest daveti kabul edene açılır.
// `onResult` (1.4.3): iki kişilik maç bitince HER İKİ taraf { rid, mn, me, op } bildirir;
// sunucu (pong-result.mjs) iki rapor eşleşirse galibiyeti sayar (Çember profil rozeti).
export default function PongOverlay({ lang, onClose, getCember, haptic, track, invite, onResult }) {
  const L = (o) => (o && (o[lang] || o.en)) || "";
  const JOST = "'Jost',sans-serif", INTER = "'Inter',sans-serif", SERIF = "'Cormorant Garamond',Georgia,serif";
  const INK = "#f1ecf9", MUTE = "#8f88a3", GOLD = "#e8c07a", LAV = "#b8a4d8";
  // view: menu | lobby | hosting | game | end | msg
  const [view, setView] = useState("menu");
  const [mode, setMode] = useState("single");        // single | host | guest
  const [rooms, setRooms] = useState([]);
  const [lobbyState, setLobbyState] = useState("idle"); // idle | connecting | ready | closed
  const [msg, setMsg] = useState("");
  const [score, setScore] = useState({ me: 0, op: 0 });
  const [names, setNames] = useState({ me: "", op: "" });
  const [ended, setEnded] = useState(null);           // { won, me, op }
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const G = useRef(null);                              // oyun durumu (render dışı)
  const chans = useRef({ lobby: null, game: null });
  const client = useRef(null);
  const ridRef = useRef(null);                         // iki kişilik odanın kimliği
  const mnRef = useRef(0);                             // odadaki maç numarası (rövanşta artar)
  const report = (me, op, mn) => { if (!ridRef.current || !onResult) return; try { onResult({ rid: ridRef.current, mn, me, op }); } catch (_) {} };
  const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const buzz = () => { try { haptic && haptic(); } catch (_) {} };
  const tr = (a, extra) => { try { track && track("pong", { a, ...(extra || {}) }); } catch (_) {} };

  useEffect(() => { tr(invite ? "invite" : "open"); }, []);
  // Davetle açıldıysa menüyü atla: doğrudan özel odayı aç ya da ona katıl.
  useEffect(() => {
    if (!invite || !invite.rid) return;
    let alive = true;
    setView("hosting"); setMode(invite.role === "host" ? "host" : "guest");
    pongClient(getCember).catch(() => null).then((cl) => {
      if (!alive) return;
      if (!cl) { setMsg(L(TXT.closed)); setView("msg"); return; }
      client.current = cl;
      if (invite.role === "host") hostRoom(invite.rid); else joinRoom({ rid: invite.rid, nick: invite.nick || "Sakin" }, true);
    });
    // Davet edilen "şimdi değil" derse (App, Çember davet kanalından iletir).
    const onDecline = (e) => { if (e && e.detail && e.detail.rid === invite.rid && !(G.current)) { removeChan("game"); setMsg(L(TXT.declined)); setView("msg"); } };
    window.addEventListener("sakin-pong-decline", onDecline);
    return () => { alive = false; window.removeEventListener("sakin-pong-decline", onDecline); };
  }, []);
  // Android geri tuşu: oyun/lobi içindeyse bir adım geri, menüdeyse kapat.
  useEffect(() => {
    const back = () => { if (view === "menu") onClose(); else leaveAll(true); };
    window.__sakinOverlayBack = back;
    return () => { if (window.__sakinOverlayBack === back) window.__sakinOverlayBack = null; };
  });
  useEffect(() => () => leaveAll(false), []);

  function removeChan(k) {
    const ch = chans.current[k]; chans.current[k] = null;
    if (ch && client.current) { try { client.current.sb.removeChannel(ch); } catch (_) {} }
  }
  function leaveAll(toMenu) {
    const g = chans.current.game;
    if (g) { try { g.send({ type: "broadcast", event: "bye", payload: {} }); } catch (_) {} }
    removeChan("game"); removeChan("lobby");
    if (G.current) G.current.stop = true;
    G.current = null;
    if (toMenu) { setView("menu"); setEnded(null); setMsg(""); }
  }

  // ── LOBİ ──
  async function openLobby() {
    setView("lobby"); setLobbyState("connecting"); setRooms([]);
    const cl = await pongClient(getCember).catch(() => null);
    if (!cl) { setLobbyState("closed"); return; }
    client.current = cl;
    const ch = cl.sb.channel("pong:lobby", { config: { private: true, presence: { key: "l" + Math.random().toString(36).slice(2, 10) } } });
    ch.on("presence", { event: "sync" }, () => {
      const st = ch.presenceState();
      const list = [];
      for (const k of Object.keys(st)) for (const m of st[k] || []) if (m && m.rid) list.push({ rid: m.rid, nick: m.nick || "Sakin", t: m.t || 0 });
      list.sort((a, b) => a.t - b.t);
      setRooms(list);
    });
    ch.subscribe((status) => {
      if (status === "SUBSCRIBED") setLobbyState("ready");
      else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setLobbyState("closed");
    });
    chans.current.lobby = ch;
  }

  // ── ODA AÇ (host) ──
  async function hostRoom(inviteRid) {
    const cl = client.current; if (!cl) return;
    const rid = inviteRid || Math.random().toString(36).slice(2, 12);
    ridRef.current = rid; mnRef.current = 0;
    setMode("host"); setView("hosting"); if (!inviteRid) tr("host");
    // Davet odası lobiye yazılmaz (yalnızca davet edilen katılabilir).
    if (!inviteRid) { try { await chans.current.lobby.track({ rid, nick: cl.nick, t: Date.now() }); } catch (_) {} }
    const ch = cl.sb.channel("pong:r:" + rid, { config: { private: true, broadcast: { self: false }, presence: { key: "host" } } });
    let guestKey = null;
    ch.on("presence", { event: "sync" }, () => {
      const st = ch.presenceState();
      const guests = Object.keys(st).filter((k) => k !== "host");
      if (!guestKey && guests.length) {
        guestKey = guests[0];
        const gm = (st[guestKey] || [])[0] || {};
        ch.send({ type: "broadcast", event: "start", payload: { key: guestKey, hostNick: cl.nick } });
        // Oda lobiden çekilir, oyun başlar.
        try { chans.current.lobby && chans.current.lobby.untrack(); } catch (_) {}
        removeChan("lobby");
        setNames({ me: L(TXT.you), op: gm.nick || "Sakin" });
        startGame("host");
      } else if (guestKey && !guests.includes(guestKey) && G.current && !G.current.over) {
        opponentLeft();
      }
      for (const k of guests) if (k !== guestKey) ch.send({ type: "broadcast", event: "full", payload: { key: k } });
    });
    bindGame(ch, "host");
    ch.subscribe(async (status) => {
      if (status === "SUBSCRIBED") { try { await ch.track({ role: "host", nick: cl.nick }); } catch (_) {} }
      else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") { setMsg(L(TXT.closed)); setView("msg"); }
    });
    chans.current.game = ch;
  }

  // ── ODAYA KATIL (guest) ──
  function joinRoom(room, viaInvite) {
    const cl = client.current; if (!cl) return;
    setMode("guest"); setView("hosting"); if (!viaInvite) tr("join");
    // Davet odasında oda sahibi 12 sn içinde yoksa davet artık geçerli değil.
    if (viaInvite) setTimeout(() => {
      const ch = chans.current.game;
      if (ch && !G.current) { try { if (!ch.presenceState().host) { removeChan("game"); setMsg(L(TXT.expired)); setView("msg"); } } catch (_) {} }
    }, 12000);
    const myKey = "g" + Math.random().toString(36).slice(2, 10);
    ridRef.current = room.rid;
    const ch = cl.sb.channel("pong:r:" + room.rid, { config: { private: true, broadcast: { self: false }, presence: { key: myKey } } });
    let started = false;
    ch.on("broadcast", { event: "start" }, ({ payload }) => {
      if (!payload || payload.key !== myKey || started) return;
      started = true;
      removeChan("lobby");
      setNames({ me: L(TXT.you), op: payload.hostNick || room.nick });
      startGame("guest");
    });
    ch.on("broadcast", { event: "full" }, ({ payload }) => {
      if (payload && payload.key === myKey && !started) { removeChan("game"); setMsg(L(TXT.full)); setView("msg"); }
    });
    ch.on("presence", { event: "sync" }, () => {
      const st = ch.presenceState();
      if (started && !st.host && G.current && !G.current.over) opponentLeft();
    });
    bindGame(ch, "guest");
    ch.subscribe(async (status) => {
      if (status === "SUBSCRIBED") { try { await ch.track({ role: "guest", nick: cl.nick }); } catch (_) {} }
      else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") { setMsg(L(TXT.closed)); setView("msg"); }
    });
    chans.current.game = ch;
  }

  function opponentLeft() {
    if (G.current) { G.current.stop = true; G.current.over = true; }
    removeChan("game");
    setMsg(L(TXT.left)); setView("msg");
  }

  // Oyun kanalı olayları (her iki rol).
  function bindGame(ch, role) {
    ch.on("broadcast", { event: "p" }, ({ payload }) => {
      const g = G.current; if (!g || !payload) return;
      g.opTarget = payload.x;   // her iki taraf da host koordinatında yollar
    });
    ch.on("broadcast", { event: "b" }, ({ payload }) => {
      const g = G.current; if (!g || role !== "guest" || !payload) return;
      g.ball = { x: payload.x, y: payload.y, vx: payload.vx, vy: payload.vy };
      g.waitUntil = payload.d ? performance.now() + payload.d : 0;
      if (payload.d) g.trail = [];
      if (payload.hit) buzz();
    });
    ch.on("broadcast", { event: "s" }, ({ payload }) => {
      if (role !== "guest" || !payload) return;
      setScore({ me: payload.g, op: payload.h });
    });
    ch.on("broadcast", { event: "end" }, ({ payload }) => {
      if (role !== "guest" || !payload) return;
      const g = G.current; if (g) { g.over = true; }
      setEnded({ won: payload.g > payload.h, me: payload.g, op: payload.h }); setView("end");
      report(payload.g, payload.h, Number.isInteger(payload.mn) ? payload.mn : 0);
    });
    ch.on("broadcast", { event: "again" }, () => {
      if (role === "host") restartMatch(); else { setEnded(null); setScore({ me: 0, op: 0 }); setView("game"); if (G.current) G.current.over = false; }
    });
    ch.on("broadcast", { event: "bye" }, () => { if (G.current && !G.current.over) opponentLeft(); });
  }

  // ── OYUN ──
  function startGame(role) {
    setScore({ me: 0, op: 0 }); setEnded(null); setView("game");
    G.current = {
      role, stop: false, over: false,
      me: 0.5, op: 0.5, opTarget: 0.5,
      ball: { x: 0.5, y: H / 2, vx: 0, vy: 0 }, speed: S0,
      waitUntil: performance.now() + 900, sc: { h: 0, g: 0 },
      lastP: 0, lastSentX: -1, lastB: 0, keys: { l: false, r: false },
    };
    if (role !== "guest") serve(1);
  }
  function restartMatch() {
    const g = G.current; if (!g) return;
    g.sc = { h: 0, g: 0 }; g.over = false; g.speed = S0;
    mnRef.current += 1;
    setScore({ me: 0, op: 0 }); setEnded(null); setView("game");
    if (g.role === "host") sendG("s", { h: 0, g: 0 });
    serve(1);
  }
  function sendG(event, payload) { const ch = chans.current.game; if (ch) { try { ch.send({ type: "broadcast", event, payload }); } catch (_) {} } }
  // Servis: `dir` +1 = alttakine (host/ben) doğru, -1 = üsttekine.
  function serve(dir) {
    const g = G.current; if (!g) return;
    const pts = (g.sc ? g.sc.h + g.sc.g : 0);
    g.speed = serveSpeed(pts);
    const ang = (Math.random() * 0.8 - 0.4);
    g.ball = { x: 0.5, y: H / 2, vx: Math.sin(ang) * g.speed, vy: Math.cos(ang) * g.speed * dir };
    g.waitUntil = performance.now() + 900; g.trail = [];
    if (g.role === "host") sendG("b", { ...g.ball, d: 900 });
  }
  function scored(bottomLost) {
    const g = G.current; if (!g) return;
    if (bottomLost) g.sc.g++; else g.sc.h++;
    const me = g.role === "guest" ? g.sc.g : g.sc.h, op = g.role === "guest" ? g.sc.h : g.sc.g;
    setScore({ me, op });
    if (g.role === "host") sendG("s", g.sc);
    if (g.sc.h >= WIN || g.sc.g >= WIN) {
      g.over = true;
      const won = g.sc.h > g.sc.g;
      setEnded({ won, me: g.sc.h, op: g.sc.g }); setView("end");
      if (g.role === "host") { sendG("end", { ...g.sc, mn: mnRef.current }); report(g.sc.h, g.sc.g, mnRef.current); }
      tr("end", { m: g.role === "single" ? "s" : "d" });
      return;
    }
    serve(bottomLost ? -1 : 1);
  }

  // Çizim + fizik döngüsü: yalnızca oyun ekranındayken.
  useEffect(() => {
    if (view !== "game" && view !== "end") return;
    const cv = canvasRef.current, wrap = wrapRef.current; if (!cv || !wrap) return;
    const ctx = cv.getContext("2d");
    let raf = 0, last = performance.now(), scale = 1, ox = 0, oy = 0;
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      const r = wrap.getBoundingClientRect();
      scale = Math.min(r.width / 1, r.height / H);
      ox = (r.width - scale) / 2; oy = (r.height - scale * H) / 2;
      cv.width = Math.round(r.width * DPR); cv.height = Math.round(r.height * DPR);
      cv.style.width = r.width + "px"; cv.style.height = r.height + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const setFromPointer = (clientX) => {
      const g = G.current; if (!g) return;
      const r = cv.getBoundingClientRect();
      g.me = clamp((clientX - r.left - ox) / scale, PW / 2, 1 - PW / 2);
    };
    const onPtr = (e) => { if (e.cancelable) e.preventDefault(); setFromPointer(e.clientX); };
    cv.addEventListener("pointerdown", onPtr); cv.addEventListener("pointermove", onPtr);
    const onKey = (e, v) => { const g = G.current; if (!g) return; if (e.key === "ArrowLeft") g.keys.l = v; if (e.key === "ArrowRight") g.keys.r = v; };
    const kd = (e) => onKey(e, true), ku = (e) => onKey(e, false);
    window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);

    const step = (now) => {
      const g = G.current;
      const dt = Math.min(0.033, (now - last) / 1000); last = now;
      if (g && !g.stop) {
        if (g.keys.l) g.me = clamp(g.me - 1.3 * dt, PW / 2, 1 - PW / 2);
        if (g.keys.r) g.me = clamp(g.me + 1.3 * dt, PW / 2, 1 - PW / 2);
        // Kendi raketini karşıya bildir (host koordinatında), ~15/sn, yalnızca değişince.
        if (g.role !== "single" && now - g.lastP > 66) {
          const hx = g.role === "guest" ? 1 - g.me : g.me;
          if (Math.abs(hx - g.lastSentX) > 0.003) { sendG("p", { x: hx }); g.lastSentX = hx; }
          g.lastP = now;
        }
        // Rakip raket: tek oyuncuda yapay rakip, çok oyunculuda gelen hedefe yumuşak yaklaşma.
        if (g.role === "single") {
          const b = g.ball;
          const target = b.vy < 0 ? b.x + Math.sin(now / 900) * 0.06 : 0.5;
          const maxV = 0.55 + g.sc.h * 0.04;
          g.op = clamp(g.op + clamp(target - g.op, -maxV * dt, maxV * dt), PW / 2, 1 - PW / 2);
        } else {
          const tgt = g.role === "guest" ? 1 - g.opTarget : g.opTarget;   // konuk ekranında çevrilir
          g.op += (tgt - g.op) * Math.min(1, dt * 14);
        }
        if (!g.over && now >= g.waitUntil) {
          const b = g.ball;
          const py = b.y;
          b.x += b.vx * dt; b.y += b.vy * dt;
          if (b.x < BR) { b.x = BR; b.vx = Math.abs(b.vx); }
          if (b.x > 1 - BR) { b.x = 1 - BR; b.vx = -Math.abs(b.vx); }
          if (g.role !== "guest") {
            // Yetkili taraf: vuruş + sayı. host/single'da ben ALTTA, rakip ÜSTTE.
            const yb = H - PY, yt = PY;
            if (b.vy > 0 && py + BR <= yb - PH / 2 + 0.001 && b.y + BR >= yb - PH / 2 && Math.abs(b.x - g.me) <= PW / 2 + BR) {
              hit(g, g.me, -1); b.y = yb - PH / 2 - BR; buzz();
            } else if (b.vy < 0 && py - BR >= yt + PH / 2 - 0.001 && b.y - BR <= yt + PH / 2 && Math.abs(b.x - (g.role === "host" ? g.opTarget : g.op)) <= PW / 2 + BR) {
              hit(g, g.role === "host" ? g.opTarget : g.op, 1); b.y = yt + PH / 2 + BR;
            } else if (b.y > H + BR * 2) { scored(true); }
            else if (b.y < -BR * 2) { scored(false); }
            if (g.role === "host" && now - g.lastB > 800) { sendG("b", { ...g.ball }); g.lastB = now; }
          } else {
            b.y = clamp(b.y, -0.2, H + 0.2);   // konuk: karar oda sahibinde, yalnızca çiz
          }
        }
      }
      draw(g);
      raf = requestAnimationFrame(step);
    };
    function hit(g, px, dirY) {
      const off = clamp((g.ball.x - px) / (PW / 2), -1, 1);
      g.speed = Math.min(rallyCap(g.sc.h + g.sc.g), g.speed * 1.05);
      const ang = off * 1.0;
      g.ball.vx = Math.sin(ang) * g.speed;
      g.ball.vy = Math.cos(ang) * g.speed * dirY;
      if (g.role === "host") { sendG("b", { ...g.ball, hit: 1 }); g.lastB = performance.now(); }
    }
    function draw(g) {
      const r = wrap.getBoundingClientRect();
      // Her kare TAM temizlenir. (Yarı saydam boyayla iz yapmak 8 bit yuvarlama
      // yüzünden hiç silinmeyen soluk "hayalet" çizgiler bırakıyordu.) İz = topun son
      // konumları, sönerek çizilir.
      ctx.clearRect(0, 0, r.width, r.height);
      const X = (x) => ox + x * scale, Y = (y) => oy + y * scale;
      // Saha çerçevesi + orta çizgi
      ctx.strokeStyle = "rgba(184,164,216,0.14)"; ctx.lineWidth = 1;
      ctx.strokeRect(X(0) + 0.5, Y(0) + 0.5, scale - 1, scale * H - 1);
      ctx.setLineDash([4, 8]); ctx.beginPath(); ctx.moveTo(X(0.04), Y(H / 2)); ctx.lineTo(X(0.96), Y(H / 2)); ctx.stroke(); ctx.setLineDash([]);
      if (!g) return;
      // Hız kademesi: orta çizginin sağında 7 küçük nokta (yazısız, her dilde aynı). Topun
      // anlık hızından hesaplanır, konukta da doğru (konuk hız sayacını değil topu bilir).
      {
        const sp = Math.hypot(g.ball.vx, g.ball.vy) || S0;
        const lit = Math.max(1, Math.min(7, 1 + Math.round(((sp - S0) / (CAP_MAX - S0)) * 6)));
        for (let i = 0; i < 7; i++) {
          ctx.fillStyle = i < lit ? `rgba(232,192,122,${0.45 + 0.08 * i})` : "rgba(184,164,216,0.16)";
          ctx.beginPath(); ctx.arc(X(0.955) - (6 - i) * 7, Y(H / 2) - 8, 2, 0, Math.PI * 2); ctx.fill();
        }
      }
      // Konukta top görüntüsü çevrilir (kendi raketi altta).
      const bx = g.role === "guest" ? 1 - g.ball.x : g.ball.x;
      const by = g.role === "guest" ? H - g.ball.y : g.ball.y;
      const paddle = (x, y, col) => {
        ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 12;
        const w = PW * scale, h = Math.max(4, PH * scale), rx = X(x) - w / 2, ry = Y(y) - h / 2, rr = h / 2;
        ctx.beginPath(); ctx.moveTo(rx + rr, ry); ctx.arcTo(rx + w, ry, rx + w, ry + h, rr); ctx.arcTo(rx + w, ry + h, rx, ry + h, rr);
        ctx.arcTo(rx, ry + h, rx, ry, rr); ctx.arcTo(rx, ry, rx + w, ry, rr); ctx.closePath(); ctx.fill();
        ctx.shadowBlur = 0;
      };
      paddle(g.op, PY, LAV);
      paddle(g.me, H - PY, GOLD);
      if (!reduce) {
        const tr = g.trail || (g.trail = []);
        tr.push([bx, by]); if (tr.length > 9) tr.shift();
        for (let i = 0; i < tr.length - 1; i++) {
          const a = (i + 1) / tr.length;
          ctx.fillStyle = `rgba(232,192,122,${0.22 * a})`;
          ctx.beginPath(); ctx.arc(X(tr[i][0]), Y(tr[i][1]), Math.max(2, BR * scale * (0.45 + 0.5 * a)), 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.fillStyle = "#fff4d6"; ctx.shadowColor = GOLD; ctx.shadowBlur = 18;
      ctx.beginPath(); ctx.arc(X(bx), Y(by), Math.max(4, BR * scale), 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    }
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku);
      cv.removeEventListener("pointerdown", onPtr); cv.removeEventListener("pointermove", onPtr);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view === "game" || view === "end"]);

  function startSingle() {
    setMode("single"); tr("single");
    setNames({ me: L(TXT.you), op: L(TXT.ai) });
    startGame("single");
  }
  function playAgain() {
    if (mode === "single") { startGame("single"); return; }
    if (mode === "host") { sendG("again", {}); restartMatch(); }
    else {
      // Konuk: kendi ekranını hemen oyuna döndürür, oda sahibi skoru sıfırlayıp servis atar.
      sendG("again", {});
      setEnded(null); setScore({ me: 0, op: 0 }); setView("game");
      if (G.current) G.current.over = false;
    }
  }

  const BTN = { WebkitAppearance:"none", appearance:"none", font:"inherit", cursor:"pointer", background:"transparent", border:"none", color:"inherit" };
  const bigBtn = (label, sub, onClick, accent) => (
    <button onClick={onClick} style={{ ...BTN, width:"100%", padding:"16px 18px", borderRadius:18, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4,
      background: accent ? "rgba(232,192,122,0.1)" : "rgba(255,255,255,0.035)", border:`1px solid ${accent ? "rgba(232,192,122,0.45)" : "rgba(184,164,216,0.2)"}` }}>
      <span style={{ fontFamily:JOST, fontSize:15, letterSpacing:1.2, color: accent ? "#f6dfb0" : INK }}>{label}</span>
      {sub && <span style={{ fontFamily:INTER, fontSize:12.5, color:MUTE }}>{sub}</span>}
    </button>
  );
  const pill = (label, onClick, primary) => (
    <button onClick={onClick} style={{ ...BTN, padding:"11px 20px", borderRadius:100, fontFamily:JOST, fontSize:12.5, letterSpacing:1.5, textTransform:"uppercase",
      display:"inline-flex", alignItems:"center", justifyContent:"center",
      color: primary ? "#1a1030" : "#cfc7e0", background: primary ? GOLD : "transparent", border: primary ? `1px solid ${GOLD}` : "1px solid rgba(255,255,255,0.14)" }}>{label}</button>
  );
  const center = (children) => (
    <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px 20px calc(24px + var(--sab))", overflowY:"auto" }}>
      <div style={{ width:"100%", maxWidth:380, display:"flex", flexDirection:"column", alignItems:"stretch", gap:12 }}>{children}</div>
    </div>
  );
  const inGame = view === "game" || view === "end";

  return createPortal(
    <div style={{ position:"fixed", inset:0, zIndex:100010, background:"radial-gradient(ellipse 90% 55% at 50% 0%, rgba(90,60,150,0.2), transparent 70%), #07060d",
      display:"flex", flexDirection:"column", fontFamily:"'Inter',sans-serif", animation:"fadeIn 0.35s ease", touchAction: inGame ? "none" : "auto", userSelect:"none", WebkitUserSelect:"none" }}>
      {/* Üst: geri + başlık / skor */}
      <div style={{ padding:"calc(10px + var(--sat)) 14px 8px", display:"flex", alignItems:"center", gap:12 }}>
        <BackButton onClick={() => { if (view === "menu") onClose(); else leaveAll(true); }} label={L(TXT.back)} />
        {inGame ? (
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:14, fontFamily:JOST }}>
            <span style={{ fontSize:12, letterSpacing:1.2, color:LAV, maxWidth:"34%", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{names.op}</span>
            <span style={{ fontSize:22, fontWeight:300, color:INK, letterSpacing:2 }}>{score.op} <span style={{ color:MUTE }}>·</span> {score.me}</span>
            <span style={{ fontSize:12, letterSpacing:1.2, color:GOLD }}>{names.me}</span>
          </div>
        ) : (
          <div style={{ flex:1, fontFamily:SERIF, fontSize:24, color:INK }}>{L(TXT.title)}</div>
        )}
        <div style={{ width:36, flexShrink:0 }} />
      </div>

      {view === "menu" && center(<>
        <div style={{ textAlign:"center", fontFamily:INTER, fontSize:13.5, color:"#b8aed0", lineHeight:1.55, marginBottom:6 }}>{L(TXT.sub)}</div>
        {bigBtn(L(TXT.single), L(TXT.singleSub), startSingle, true)}
        {bigBtn(L(TXT.duo), L(TXT.duoSub), openLobby, false)}
        <div style={{ textAlign:"center", fontFamily:INTER, fontSize:12, color:MUTE, lineHeight:1.55, marginTop:6 }}>{L(TXT.hint)}</div>
      </>)}

      {view === "lobby" && center(<>
        {lobbyState === "connecting" && <div style={{ textAlign:"center", color:MUTE, fontFamily:JOST, letterSpacing:1.5 }}>{L(TXT.connecting)}</div>}
        {lobbyState === "closed" && <>
          <div style={{ textAlign:"center", fontFamily:INTER, fontSize:14, color:"#d6cfe6", lineHeight:1.6 }}>{L(TXT.closed)}</div>
          {bigBtn(L(TXT.single), L(TXT.singleSub), () => { leaveAll(false); startSingle(); }, true)}
        </>}
        {lobbyState === "ready" && <>
          {bigBtn(L(TXT.openRoom), null, hostRoom, true)}
          <div style={{ fontFamily:JOST, fontSize:10.5, letterSpacing:2.5, textTransform:"uppercase", color:MUTE, margin:"12px 0 2px" }}>{L(TXT.rooms)}</div>
          {rooms.length === 0 ? (
            <div style={{ fontFamily:SERIF, fontSize:18, lineHeight:1.45, color:"#b8aed0", textAlign:"center", padding:"10px 6px" }}>{L(TXT.noRooms)}</div>
          ) : rooms.map((r) => (
            <div key={r.rid} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:16, background:"rgba(255,255,255,0.035)", border:"1px solid rgba(184,164,216,0.16)" }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:"#82d9a3", boxShadow:"0 0 6px #82d9a3", flexShrink:0 }} />
              <span style={{ flex:1, minWidth:0, fontFamily:JOST, fontSize:13.5, color:INK, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.nick} <span style={{ color:MUTE, fontSize:12 }}>{L(TXT.waitingFor)}</span></span>
              {pill(L(TXT.join), () => joinRoom(r), true)}
            </div>
          ))}
        </>}
      </>)}

      {view === "hosting" && center(<>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:4 }}>
          <span className="pong-wait" style={{ width:14, height:14, borderRadius:"50%", background:"#fff4d6", boxShadow:`0 0 18px ${GOLD}` }} />
        </div>
        <div style={{ textAlign:"center", fontFamily:SERIF, fontSize:20, color:INK, lineHeight:1.4 }}>{mode === "host" ? L(invite ? TXT.invited : TXT.waiting) : L(TXT.connecting)}</div>
        <div style={{ display:"flex", justifyContent:"center", marginTop:8 }}>{pill(L(TXT.cancel), () => leaveAll(true))}</div>
      </>)}

      {view === "msg" && center(<>
        <div style={{ textAlign:"center", fontFamily:SERIF, fontSize:20, color:INK, lineHeight:1.45 }}>{msg}</div>
        <div style={{ display:"flex", justifyContent:"center", marginTop:8 }}>{pill(L(TXT.back), () => leaveAll(true), true)}</div>
      </>)}

      {inGame && (
        <div ref={wrapRef} style={{ flex:1, position:"relative", margin:"0 12px calc(12px + var(--sab))", minHeight:0 }}>
          <canvas ref={canvasRef} style={{ position:"absolute", inset:0, display:"block", touchAction:"none" }} />
          {view === "end" && ended && (
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(7,6,13,0.55)", animation:"fadeIn 0.4s ease" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, padding:"22px 24px", borderRadius:20, background:"#110d1f", border:"1px solid rgba(232,192,122,0.3)" }}>
                <div style={{ fontFamily:SERIF, fontSize:26, color: ended.won ? "#f6dfb0" : INK }}>{ended.won ? L(TXT.win) : L(TXT.lose)}</div>
                <div style={{ fontFamily:JOST, fontSize:18, letterSpacing:2, color:MUTE }}>{ended.me} · {ended.op}</div>
                <div style={{ display:"flex", gap:8, marginTop:6 }}>
                  {pill(L(TXT.again), playAgain, true)}
                  {pill(L(TXT.close), () => leaveAll(true))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>,
    document.body
  );
}
