import { Body, GeoVector, Ecliptic, EclipticGeoMoon, SunPosition, SearchGlobalSolarEclipse, SearchLunarEclipse, Seasons } from "astronomy-engine";

const ALLOWED_ORIGINS = ["https://sakin.life", "https://www.sakin.life", "capacitor://localhost", "ionic://localhost", "https://localhost", "http://localhost"];

// Güvenlik notu: bu fonksiyon hiç origin reddi ve rate-limit YAPMIYORDU — sadece
// CDN cache'ine güveniyordu ("Cache-Control: public, max-age=21600"), ama cache
// anahtarı tam URL olduğu için query-string'e rastgele bir parametre eklemek
// (ör. ?lang=en&x=rastgele) her seferinde cache miss yaratıp alttaki ücretli Groq
// LLM çağrısını + 4 NOAA isteğini sınırsızca tetikleyebiliyordu. Şimdi diğer
// fonksiyonlarla aynı desen: gerçek origin reddi + IP başına rate-limit (IP,
// Netlify'ın sahtelenemez `x-nf-client-connection-ip` header'ından okunuyor).
// SAME-ORIGIN GET DÜZELTMESİ (canlıda 403 hatası):
// Tarayıcılar `Origin` başlığını YALNIZCA cross-origin isteklerde ve same-origin
// POST/PUT/DELETE'te gönderir; SAME-ORIGIN GET'te GÖNDERMEZ. Bu fonksiyon web'den
// (sakin.life) same-origin GET ile çağrıldığı için origin boş geliyor ve önceki
// katı kontrol kendi sitemizi 403'lüyordu ("Güneş verisi şu an alınamadı").
// Native'de sorun yoktu: Capacitor `capacitor://localhost` origin'i gönderir.
// Yeni kural: Origin VARSA beyaz listede olmak zorunda (katılık korunur). Origin
// YOKSA istek kabul edilir — çünkü tarayıcı cross-site isteğinde Origin'i her
// zaman gönderir, yani boş origin cross-site bir tarayıcı isteği OLAMAZ.
// Kötüye kullanım koruması zaten IP başına rate-limit + CDN cache ile sağlanıyor.
function isAllowedOrigin(origin) {
  if (!origin) return true;                      // same-origin GET → Origin yok
  return ALLOWED_ORIGINS.includes(origin);
}
const _rateMap = new Map();
const _RATE_WINDOW_MS = 10 * 60 * 1000;
const _RATE_MAX = 15;
function _isRateLimited(ip) {
  const now = Date.now();
  const fresh = (_rateMap.get(ip) || []).filter((t) => now - t < _RATE_WINDOW_MS);
  if (fresh.length >= _RATE_MAX) { _rateMap.set(ip, fresh); return true; }
  fresh.push(now); _rateMap.set(ip, fresh);
  if (_rateMap.size > 3000 && Math.random() < 0.02) {
    for (const [k, v] of _rateMap) if (!v.length || now - v[v.length - 1] > _RATE_WINDOW_MS) _rateMap.delete(k);
  }
  return false;
}
function _getClientIP(event) {
  return (event.headers?.["x-nf-client-connection-ip"] || event.headers?.["client-ip"] || "0").toString();
}

// ── GEZEGEN DİZİLİŞİ (efemeris — astronomy-engine) ──
const ZODIAC = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
function _eclLon(body, date) {
  if (body === "Sun") return ((SunPosition(date).elon % 360) + 360) % 360;
  if (body === "Moon") return ((EclipticGeoMoon(date).lon % 360) + 360) % 360;
  const ecl = Ecliptic(GeoVector(Body[body], date, true));
  return ((ecl.elon % 360) + 360) % 360;
}
function planetSky(date = new Date()) {
  const bodies = ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];
  const out = [];
  for (const b of bodies) {
    let lon, retro = false;
    try {
      lon = _eclLon(b, date);
      if (b !== "Sun" && b !== "Moon") {
        const lon2 = _eclLon(b, new Date(date.getTime() + 2 * 86400000));
        let d = lon2 - lon; if (d > 180) d -= 360; if (d < -180) d += 360;
        retro = d < 0;
      }
    } catch { continue; }
    // lon: açı hesabı için ham ekliptik boylam (transitNote kullanır).
    out.push({ body: b, sign: ZODIAC[Math.floor(lon / 30)], deg: Math.round(lon % 30), retrograde: retro, lon: Math.round(lon * 100) / 100 });
  }
  return out;
}

// ── GEZEGEN DİZİLİŞİ / PARADE TESPİTİ ──────────────────────────────────────
// Çıplak gözle görülebilen 5 gezegen (Merkür–Satürn) aynı gök bölgesinde mi?
// 3+ gezegen ≤30°: dikkat çekici conjunction parade (alignment).
// 4+ gezegen ≤50°: gezegen geçidi (planet parade).
// Min-kuşatan yay = 360° − ardışık ekliptik boylam boşluklarının en büyüğü.
function notablePlanetGrouping(planets) {
  const NAKED_EYE = ["Mercury","Venus","Mars","Jupiter","Saturn"];
  const vis = planets.filter(p => NAKED_EYE.includes(p.body) && p.lon != null);
  if (vis.length < 3) return null;
  const arcOf = (grp) => {
    if (grp.length < 2) return 0;
    const s = grp.slice().sort((a,b) => a.lon - b.lon);
    let maxGap = (s[0].lon + 360) - s[s.length-1].lon;
    for (let i = 0; i < s.length-1; i++) maxGap = Math.max(maxGap, s[i+1].lon - s[i].lon);
    return Math.round(360 - maxGap);
  };
  // Tüm 3+ boyutlu kombinasyonları dene, en sıkı grubu bul
  let best = null;
  const tryCombo = (start, cur, minSz) => {
    if (cur.length >= minSz) {
      const arc = arcOf(cur);
      const thr = cur.length >= 4 ? 50 : 30;
      if (arc <= thr && (!best || cur.length > best.bodies.length || (cur.length === best.bodies.length && arc < best.arcDeg))) {
        best = { type: cur.length >= 4 ? "parade" : "alignment", bodies: cur.map(p=>p.body), arcDeg: arc };
      }
    }
    if (cur.length < vis.length) for (let i = start; i < vis.length; i++) tryCombo(i+1, [...cur, vis[i]], minSz);
  };
  tryCombo(0, [], 3);
  return best;
}

// ── KOLEKTİF GEÇİŞ NOTU (gökyüzü raporunun alt başlığı) ────────────────────
// Kullanıcı: "gökyüzü raporuna alt başlık şeklinde hangi geçişte olduğumuzu yaz
// ... ya da şu an retrodayız şunlara dikkat et gibi." + "sadece genel kolektif
// bilgiler vermen yeterli" → KİŞİYE ÖZEL DEĞİL, herkes için aynı gökyüzü.
// İki bileşen: (1) o an retro olan gezegenler, (2) dar orb'lu tek bir dikkat
// çekici açı. İkisi de yoksa Güneş/Ay burcu ile sade bir bağlam cümlesi verilir.
const _PL_I18N = {
  Sun:{tr:"Güneş",en:"Sun",de:"Sonne",es:"Sol",pt:"Sol",fr:"Soleil",ja:"太陽"},
  Moon:{tr:"Ay",en:"Moon",de:"Mond",es:"Luna",pt:"Lua",fr:"Lune",ja:"月"},
  Mercury:{tr:"Merkür",en:"Mercury",de:"Merkur",es:"Mercurio",pt:"Mercúrio",fr:"Mercure",ja:"水星"},
  Venus:{tr:"Venüs",en:"Venus",de:"Venus",es:"Venus",pt:"Vênus",fr:"Vénus",ja:"金星"},
  Mars:{tr:"Mars",en:"Mars",de:"Mars",es:"Marte",pt:"Marte",fr:"Mars",ja:"火星"},
  Jupiter:{tr:"Jüpiter",en:"Jupiter",de:"Jupiter",es:"Júpiter",pt:"Júpiter",fr:"Jupiter",ja:"木星"},
  Saturn:{tr:"Satürn",en:"Saturn",de:"Saturn",es:"Saturno",pt:"Saturno",fr:"Saturne",ja:"土星"},
  Uranus:{tr:"Uranüs",en:"Uranus",de:"Uranus",es:"Urano",pt:"Urano",fr:"Uranus",ja:"天王星"},
  Neptune:{tr:"Neptün",en:"Neptune",de:"Neptun",es:"Neptuno",pt:"Netuno",fr:"Neptune",ja:"海王星"},
  Pluto:{tr:"Plüton",en:"Pluto",de:"Pluto",es:"Plutón",pt:"Plutão",fr:"Pluton",ja:"冥王星"},
};
const _SIGN_I18N = {
  Aries:{tr:"Koç",en:"Aries",de:"Widder",es:"Aries",pt:"Áries",fr:"Bélier",ja:"牡羊座"},
  Taurus:{tr:"Boğa",en:"Taurus",de:"Stier",es:"Tauro",pt:"Touro",fr:"Taureau",ja:"牡牛座"},
  Gemini:{tr:"İkizler",en:"Gemini",de:"Zwillinge",es:"Géminis",pt:"Gêmeos",fr:"Gémeaux",ja:"双子座"},
  Cancer:{tr:"Yengeç",en:"Cancer",de:"Krebs",es:"Cáncer",pt:"Câncer",fr:"Cancer",ja:"蟹座"},
  Leo:{tr:"Aslan",en:"Leo",de:"Löwe",es:"Leo",pt:"Leão",fr:"Lion",ja:"獅子座"},
  Virgo:{tr:"Başak",en:"Virgo",de:"Jungfrau",es:"Virgo",pt:"Virgem",fr:"Vierge",ja:"乙女座"},
  Libra:{tr:"Terazi",en:"Libra",de:"Waage",es:"Libra",pt:"Libra",fr:"Balance",ja:"天秤座"},
  Scorpio:{tr:"Akrep",en:"Scorpio",de:"Skorpion",es:"Escorpio",pt:"Escorpião",fr:"Scorpion",ja:"蠍座"},
  Sagittarius:{tr:"Yay",en:"Sagittarius",de:"Schütze",es:"Sagitario",pt:"Sagitário",fr:"Sagittaire",ja:"射手座"},
  Capricorn:{tr:"Oğlak",en:"Capricorn",de:"Steinbock",es:"Capricornio",pt:"Capricórnio",fr:"Capricorne",ja:"山羊座"},
  Aquarius:{tr:"Kova",en:"Aquarius",de:"Wassermann",es:"Acuario",pt:"Aquário",fr:"Verseau",ja:"水瓶座"},
  Pisces:{tr:"Balık",en:"Pisces",de:"Fische",es:"Peixes",pt:"Peixes",fr:"Poissons",ja:"魚座"},
};
// Açı adı + kolektif etkisinin TEK cümlelik karşılığı.
const _ASPECTS = [
  { angle:0,   key:"conj", name:{tr:"kavuşumu",en:"conjunction",de:"Konjunktion",es:"conjunción",pt:"conjunção",fr:"conjonction",ja:"合"},
    hint:{tr:"iki enerji tek noktada birleşiyor; başlangıçlar keskin hissedilir.",en:"two forces merge at one point; beginnings feel sharp.",de:"zwei Kräfte verschmelzen; Anfänge fühlen sich scharf an.",es:"dos fuerzas se funden; los comienzos se sienten intensos.",pt:"duas forças se fundem; os começos são intensos.",fr:"deux forces fusionnent ; les débuts sont vifs.",ja:"二つの力がひとつに重なり、始まりが際立つ。"} },
  { angle:180, key:"opp",  name:{tr:"karşıtlığı",en:"opposition",de:"Opposition",es:"oposición",pt:"oposição",fr:"opposition",ja:"衝"},
    hint:{tr:"iki uç arasında denge aranıyor; acele karar verme.",en:"a balance is sought between two poles; avoid rushed choices.",de:"zwischen zwei Polen wird Balance gesucht; keine eiligen Entscheidungen.",es:"se busca equilibrio entre dos polos; evita decidir con prisa.",pt:"busca-se equilíbrio entre dois polos; evita decidir às pressas.",fr:"un équilibre se cherche entre deux pôles ; évite les décisions hâtives.",ja:"二極のあいだで均衡が探られる。急いで決めないこと。"} },
  { angle:90,  key:"sq",   name:{tr:"karesi",en:"square",de:"Quadrat",es:"cuadratura",pt:"quadratura",fr:"carré",ja:"スクエア"},
    hint:{tr:"sürtünme var ama hareket getirir; gerilimi yakıt yap.",en:"there is friction, but it moves things; use the tension as fuel.",de:"es gibt Reibung, doch sie bewegt; nutze die Spannung als Treibstoff.",es:"hay fricción, pero mueve; usa la tensión como combustible.",pt:"há atrito, mas move; usa a tensão como combustível.",fr:"il y a des frictions, mais elles font avancer ; fais de la tension un carburant.",ja:"摩擦はあるが物事を動かす。緊張を燃料に。"} },
  { angle:120, key:"tri",  name:{tr:"üçgeni",en:"trine",de:"Trigon",es:"trígono",pt:"trígono",fr:"trigone",ja:"トライン"},
    hint:{tr:"akış kolay; başlamak için iyi bir aralık.",en:"the flow is easy; a good window to begin.",de:"der Fluss ist leicht; ein gutes Fenster zum Beginnen.",es:"el flujo es fácil; buena ventana para empezar.",pt:"o fluxo é fácil; boa janela para começar.",fr:"le flux est fluide ; une bonne fenêtre pour commencer.",ja:"流れは軽やか。始めるのに良い時。"} },
];
const _RETRO_TXT = {
  tr:(l)=>`Şu an ${l} retroda — geri dönüp gözden geçirme, tamamlama ve yeniden karar zamanı; yeni sözleşmelerde acele etme.`,
  en:(l)=>`${l} ${l.includes(" ") ? "are" : "is"} retrograde right now — a time to revisit, finish and rethink; don't rush new commitments.`,
  de:(l)=>`Aktuell ist ${l} rückläufig — Zeit zum Überprüfen, Abschließen und Neuentscheiden; überstürze keine neuen Zusagen.`,
  es:(l)=>`Ahora ${l} está retrógrado — tiempo de revisar, cerrar y repensar; no te apresures con nuevos compromisos.`,
  pt:(l)=>`Agora ${l} está retrógrado — tempo de rever, concluir e repensar; não te apresses em novos compromissos.`,
  fr:(l)=>`En ce moment ${l} est rétrograde — un temps pour revoir, terminer et repenser ; ne précipite pas de nouveaux engagements.`,
  ja:(l)=>`いま${l}が逆行中——見直し、やり残しを終え、考え直す時期。新しい約束を急がないこと。`,
};
const _CTX_TXT = {
  tr:(sun,moon)=>`Güneş ${sun} burcunda, Ay ${moon} burcunda — gökyüzü bugün sakin, akışa güvenebilirsin.`,
  en:(sun,moon)=>`The Sun is in ${sun} and the Moon in ${moon} — the sky is quiet today; you can trust the flow.`,
  de:(sun,moon)=>`Die Sonne steht in ${sun}, der Mond in ${moon} — der Himmel ist heute ruhig; vertraue dem Fluss.`,
  es:(sun,moon)=>`El Sol está en ${sun} y la Luna en ${moon} — el cielo está tranquilo hoy; puedes confiar en el flujo.`,
  pt:(sun,moon)=>`O Sol está em ${sun} e a Lua em ${moon} — o céu está calmo hoje; podes confiar no fluxo.`,
  fr:(sun,moon)=>`Le Soleil est en ${sun} et la Lune en ${moon} — le ciel est calme aujourd'hui ; fais confiance au flux.`,
  ja:(sun,moon)=>`太陽は${sun}、月は${moon}に——今日の空は静か。流れに委ねて。`,
};
const _AND = { tr:"ve", en:"and", de:"und", es:"y", pt:"e", fr:"et", ja:"と" };

// Kolektif geçiş notunu 7 dilde üretir. `planets` = planetSky() çıktısı.
function transitNote(planets, date = new Date()) {
  if (!planets || !planets.length) return null;
  const LANGS = ["tr","en","de","es","pt","fr","ja"];
  const byBody = Object.fromEntries(planets.map(p => [p.body, p]));

  // (1) Retro gezegenler. Uranüs/Neptün/Plüton yılın yarısı retro olduğu için
  //     kolektif "dikkat" mesajı taşımaz — sadece kişisel/sosyal gezegenler.
  const retro = ["Mercury","Venus","Mars","Jupiter","Saturn"].filter(b => byBody[b]?.retrograde);

  // (2) En dar orb'lu tek açı. Ay hariç (2.5 günde burç değiştirir, gürültü yapar).
  let best = null;
  const BODIES = ["Sun","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];
  for (let i = 0; i < BODIES.length; i++) {
    for (let j = i + 1; j < BODIES.length; j++) {
      const a = byBody[BODIES[i]], b = byBody[BODIES[j]];
      if (!a || !b) continue;
      const la = a.lon, lb = b.lon;
      if (la == null || lb == null) continue;
      let diff = Math.abs(la - lb); if (diff > 180) diff = 360 - diff;
      for (const asp of _ASPECTS) {
        const orb = Math.abs(diff - asp.angle);
        if (orb <= 2.5 && (!best || orb < best.orb)) best = { orb, asp, a: BODIES[i], b: BODIES[j] };
      }
    }
  }

  const out = {};
  for (const lang of LANGS) {
    const parts = [];
    if (retro.length) {
      const names = retro.map(b => _PL_I18N[b][lang]);
      const list = names.length === 1 ? names[0]
        : names.slice(0, -1).join(", ") + " " + _AND[lang] + " " + names[names.length - 1];
      parts.push(_RETRO_TXT[lang](list));
    }
    if (best) {
      const an = _PL_I18N[best.a][lang], bn = _PL_I18N[best.b][lang];
      parts.push(`${an}–${bn} ${best.asp.name[lang]}: ${best.asp.hint[lang]}`);
    }
    if (!parts.length) {
      const sun = byBody.Sun && _SIGN_I18N[byBody.Sun.sign]?.[lang];
      const moon = byBody.Moon && _SIGN_I18N[byBody.Moon.sign]?.[lang];
      if (sun && moon) parts.push(_CTX_TXT[lang](sun, moon));
    }
    out[lang] = parts.join(" ");
  }
  return out.tr ? out : null;
}

// ── KUYRUKLU YILDIZLAR (statik — keşif gerektirdiği için elle güncellenir) ──
// Tutulmalar buraya GİRMEZ — astronomy-engine ile dinamik hesaplanıyor (tüm yıllar otomatik).
// Yeni kuyruklu yıldız: { start, peak, end:[yıl,ay,gün], name:{tr,en,...}, desc:{tr,en,...} }
const STATIC_COMETS = [
  { start:[2026,7,1], peak:[2026,8,2], end:[2026,9,30],
    name:{ tr:"10P/Tempel 2 Kuyruklu Yıldızı", en:"Comet 10P/Tempel 2", de:"Komet 10P/Tempel 2",
           es:"Cometa 10P/Tempel 2", pt:"Cometa 10P/Tempel 2", fr:"Comète 10P/Tempel 2", ja:"テンペル第2彗星 10P" },
    desc:{ tr:"Periyodik Tempel 2 perihelionuna yaklaşıyor — binoküler ya da çıplak gözle görülebilir parlaklık bekleniyor.",
           en:"Periodic comet Tempel 2 near perihelion — binoculars or possibly naked-eye brightness expected.",
           de:"Periodischer Komet Tempel 2 nahe Perihel — mit Fernglas, ggf. bloßem Auge sichtbar.",
           es:"Cometa periódico Tempel 2 cerca del perihelio — visible con binoculares, quizás a simple vista.",
           pt:"Cometa periódico Tempel 2 perto do periélio — visível com binóculos, possivelmente a olho nu.",
           fr:"La comète périodique Tempel 2 proche du périhélie — visible aux jumelles, peut-être à l'œil nu.",
           ja:"周期彗星テンペル第2が近日点に接近中。双眼鏡、あるいは肉眼でも見える明るさが期待される。" } },
];

function activeComets(date = new Date()) {
  const t = date.getTime();
  return STATIC_COMETS.filter(c => {
    const s = Date.UTC(c.start[0], c.start[1]-1, c.start[2]);
    const e = Date.UTC(c.end[0],   c.end[1]-1,   c.end[2]);
    return t >= s && t <= e;
  }).map(c => {
    const p   = Date.UTC(c.peak[0], c.peak[1]-1, c.peak[2]);
    const dFP = Math.round((t - p) / 86400000);
    return { type:"comet", name:c.name, desc:c.desc, isPeak: Math.abs(dFP)<=1, daysFromPeak:dFP };
  });
}

// ── TUTULMALAR — DİNAMİK HESAP (astronomy-engine) — tüm yıllar otomatik ──────
// Güneş: total + annular (kısmi atlanır). Ay: total + obscuration≥0.5 partial (penumbral atlanır).
// ±7 günlük pencere: yaklaşan ve yeni geçen tutulmalar dahil edilir.
const _EN = {
  solar_total:   { tr:"Tam Güneş Tutulması",    en:"Total Solar Eclipse",   de:"Totale Sonnenfinsternis",      es:"Eclipse Solar Total",   pt:"Eclipse Solar Total",   fr:"Éclipse Solaire Totale",   ja:"皆既日食"  },
  solar_annular: { tr:"Halkalı Güneş Tutulması", en:"Annular Solar Eclipse", de:"Ringförmige Sonnenfinsternis", es:"Eclipse Solar Anular",  pt:"Eclipse Solar Anular",  fr:"Éclipse Solaire Annulaire",ja:"金環日食"  },
  lunar_total:   { tr:"Tam Ay Tutulması",        en:"Total Lunar Eclipse",   de:"Totale Mondfinsternis",        es:"Eclipse Lunar Total",   pt:"Eclipse Lunar Total",   fr:"Éclipse Lunaire Totale",   ja:"皆既月食"  },
  lunar_partial: { tr:"Kısmi Ay Tutulması",      en:"Partial Lunar Eclipse", de:"Partielle Mondfinsternis",     es:"Eclipse Lunar Parcial", pt:"Eclipse Lunar Parcial", fr:"Éclipse Lunaire Partielle",ja:"部分月食"  },
};
const _ED = {
  solar_total:   { tr:"Ay, Güneş'i tam olarak örtüyor — gün ortasında kısa bir gece iniyor. Bu geçiş zamanı durdurur.", en:"The Moon fully covers the Sun — a brief night descends at midday. This crossing stops time.", de:"Der Mond bedeckt die Sonne vollständig — kurze Nacht mitten am Tag. Dieser Moment hält die Zeit an.", es:"La Luna cubre el Sol por completo — una breve noche desciende al mediodía. Este cruce detiene el tiempo.", pt:"A Lua cobre completamente o Sol — uma breve noite ao meio-dia. Esta travessia detém o tempo.", fr:"La Lune couvre entièrement le Soleil — une brève nuit au milieu du jour. Ce passage arrête le temps.", ja:"月が太陽を完全に覆う——真昼に短い夜が訪れる。この瞬間は時を止める。" },
  solar_annular: { tr:"Ay, Güneş'in tam karşısında ama biraz uzakta — güneş 'ateş çemberi' olarak çerçeveleniyor. Dramatik ve güçlü.", en:"The Moon aligns before the Sun but sits a touch too far — sunlight frames it as a ring of fire. Dramatic and powerful.", de:"Der Mond vor der Sonne, etwas zu fern — Sonnenlicht als Feuerring. Dramatisch und kraftvoll.", es:"La Luna ante el Sol pero algo lejos — anillo de fuego. Dramático y poderoso.", pt:"A Lua ante o Sol mas um pouco longe — anel de fogo. Dramático e poderoso.", fr:"La Lune devant le Soleil, un peu trop loin — anneau de feu. Dramatique et puissant.", ja:"月が太陽の正面に来るが少し遠い——「火の輪」が浮かぶ。劇的で強いエネルギー。" },
  lunar_total:   { tr:"Ay, Dünya'nın tam gölgesine giriyor — tüm gün batımlarının kızıl ışığı Ay'ı boyuyor. 'Kan ayı' tüm dünyadan görünür.", en:"The Moon enters Earth's full shadow — the crimson of every sunset paints the Moon. The 'blood moon' is visible worldwide.", de:"Der Mond im Kernschatten — alle Sonnenuntergänge der Erde färben ihn rot. Blutmond weltweit sichtbar.", es:"La Luna en la sombra total — el rojo de cada atardecer tiñe la Luna. Luna de sangre visible mundialmente.", pt:"A Lua na sombra total — o carmesim de cada pôr do sol pinta a Lua. Visível em todo o mundo.", fr:"La Lune dans l'ombre totale — le cramoisi de chaque coucher de soleil peint la Lune. Visible partout.", ja:"月が地球の完全な影に入る——すべての夕日の深紅が月を染める。世界中から見える。" },
  lunar_partial: { tr:"Ay, Dünya'nın gölgesine kısmen giriyor — Ay'ın bir bölümü kararırken öbürü parlamaya devam ediyor.", en:"The Moon partially enters Earth's shadow — part darkens while the rest continues to shine.", de:"Teilweise im Erdschatten — ein Teil verdunkelt sich, der andere bleibt hell.", es:"La Luna entra parcialmente en la sombra — parte se oscurece mientras el resto brilla.", pt:"A Lua entra parcialmente na sombra — parte escurece, o resto brilha.", fr:"La Lune entre partiellement dans l'ombre — une partie s'assombrit, l'autre brille encore.", ja:"月が地球の影に部分的に入る——一部は暗くなり、残りは輝き続ける。" },
};

function dynamicEclipseEvents(date = new Date()) {
  const WINDOW = 7;
  const events = [];
  const searchFrom = new Date(date.getTime() - 10 * 86400000);

  try {
    let se = SearchGlobalSolarEclipse(searchFrom);
    for (let i = 0; i < 5; i++) {
      const dFP = Math.round((date.getTime() - se.peak.date.getTime()) / 86400000);
      if (dFP < -WINDOW) break;
      if (Math.abs(dFP) <= WINDOW && (se.kind === "total" || se.kind === "annular")) {
        const k = "solar_" + se.kind;
        events.push({ type:"solar_eclipse", name:_EN[k], desc:_ED[k], isPeak:Math.abs(dFP)<=1, daysFromPeak:dFP });
      }
      se = SearchGlobalSolarEclipse(new Date(se.peak.date.getTime() + 10 * 86400000));
    }
  } catch { /* sessiz */ }

  try {
    let le = SearchLunarEclipse(searchFrom);
    for (let i = 0; i < 5; i++) {
      const dFP = Math.round((date.getTime() - le.peak.date.getTime()) / 86400000);
      if (dFP < -WINDOW) break;
      if (Math.abs(dFP) <= WINDOW && le.kind !== "penumbral" && (le.kind === "total" || (le.obscuration||0) >= 0.5)) {
        const k = "lunar_" + (le.kind === "total" ? "total" : "partial");
        events.push({ type:"lunar_eclipse", name:_EN[k], desc:_ED[k], isPeak:Math.abs(dFP)<=1, daysFromPeak:dFP });
      }
      le = SearchLunarEclipse(new Date(le.peak.date.getTime() + 10 * 86400000));
    }
  } catch { /* sessiz */ }

  return events;
}

// ── ENERJİ PORTALLARI / KORİDORLARI ──────────────────────────────────────────
// Numerolojik + mevsimsel enerji geçitleri. Tutulmalar buraya GİRMEZ.
// Numerolojik: yıl-bağımsız ay/gün çifti. Mevsimsel: astronomy-engine Seasons().
// { peakMD:[ay,gün], window:gün }   |  window = ±N gün "aktif pencere"

const _PORTALS = {
  // ── ASLAN KAPISI — en önemli portal, uzun koridor ──
  lion_gate: {
    peakMD:[8,8], window:7,
    name:{ tr:"Aslan Kapısı Koridoru", en:"Lion's Gate Corridor", de:"Löwentor-Korridor", es:"Corredor de la Puerta del León", pt:"Corredor do Portal do Leão", fr:"Couloir de la Porte du Lion", ja:"ライオンズゲート・コリドー" },
    desc:{ tr:"Sirius Güneş ile hizalanırken Güneş Aslan burcunda ilerliyor — galaktik bir ışık koridoru açılıyor. Eski Mısır'da bu dönem yeni döngülerin başlangıcı sayılırdı: Sirius'un doğuşu Nil'in taşkınını ve bolluğu müjdelerdi. 8/8 ise bu koridorun zirve noktası, sonsuzluk sembolünün birbiriyle kesiştiği an.", en:"As Sirius aligns with the Sun moving through Leo, a galactic light corridor opens. In ancient Egypt this period marked the start of new cycles — the heliacal rising of Sirius heralded the Nile flood and abundance. 8/8 is the corridor's peak, the moment the infinity symbol crosses itself.", de:"Während Sirius sich mit der Sonne im Löwen ausrichtet, öffnet sich ein galaktischer Lichtkorridor. Im alten Ägypten begann hier ein neuer Zyklus — der Aufgang von Sirius kündete die Nilflut an. 8/8 ist der Höhepunkt, der Augenblick, wo das Unendlichkeitssymbol sich selbst kreuzt.", es:"Mientras Sirius se alinea con el Sol en Leo, se abre un corredor de luz galáctica. En el antiguo Egipto, este período marcaba el inicio de nuevos ciclos — la salida heliaca de Sirius anunciaba la inundación del Nilo. El 8/8 es el cenit del corredor.", pt:"Enquanto Sírius se alinha com o Sol em Leão, um corredor de luz galáctica se abre. No Egito antigo, este período marcava o início de novos ciclos — a ascensão heliaca de Sírius anunciava a cheia do Nilo. 8/8 é o auge do corredor.", fr:"Tandis que Sirius s'aligne avec le Soleil en Lion, un couloir de lumière galactique s'ouvre. Dans l'Égypte ancienne, cette période marquait le début de nouveaux cycles. Le 8/8 est l'apogée du couloir.", ja:"Sirius が獅子座を進む太陽と整列する——銀河の光の回廊が開く。古代エジプトではこの時期が新しいサイクルの始まりとされ、Siriusの出現がナイルの氾濫と豊穣を告げた。8/8はその頂点。" }
  },
  // ── 11:11 PORTALI — usta sayısı ──
  mirror_11_11: {
    peakMD:[11,11], window:3,
    name:{ tr:"11:11 Portalı", en:"11:11 Portal", de:"11:11-Portal", es:"Portal 11:11", pt:"Portal 11:11", fr:"Portail 11:11", ja:"11:11 ポータル" },
    desc:{ tr:"Usta sayısı 11'in iç içe geçmesi — sezgi, uyanış ve evrensel bağlantı için güçlü bir pencere açılıyor. Bu tarih kolektif bilincin kendini hatırlattığı, ince perde arasındaki mesafenin en ince olduğu an olarak görülüyor.", en:"The master number 11 doubled — a powerful window for intuition, awakening, and universal connection. This date is seen as a moment when the collective consciousness reminds itself, when the veil between worlds is at its thinnest.", de:"Die Meisterzahl 11 verdoppelt — ein kraftvolles Fenster für Intuition, Erwachen und universelle Verbindung. An diesem Datum erinnert sich das kollektive Bewusstsein an sich selbst.", es:"El número maestro 11 duplicado — una ventana poderosa para la intuición, el despertar y la conexión universal. Esta fecha se ve como el momento en que la conciencia colectiva se recuerda a sí misma.", pt:"O número mestre 11 duplicado — uma janela poderosa para intuição, despertar e conexão universal. Esta data é vista como o momento em que a consciência coletiva se recorda de si mesma.", fr:"Le nombre maître 11 doublé — une fenêtre puissante pour l'intuition, l'éveil et la connexion universelle. Ce portail marque le moment où la conscience collective se rappelle à elle-même.", ja:"マスターナンバー11が重なる——直感、覚醒、普遍的なつながりのための強力な窓が開く。この日付は集合意識が自らを思い出す瞬間とされる。" }
  },
  // ── 1:1 YENİ YIL PORTALI ──
  mirror_1_1: {
    peakMD:[1,1], window:3,
    name:{ tr:"1:1 Yeni Yıl Portalı", en:"1:1 New Year Portal", de:"1:1 Neujahrs-Portal", es:"Portal 1:1 Año Nuevo", pt:"Portal 1:1 Ano Novo", fr:"Portail 1:1 Nouvel An", ja:"1:1 新年ポータル" },
    desc:{ tr:"Yeni bir döngünün sıfır noktası — kolektif niyet en güçlü. Bu geçişte atılan adımlar ve beslenen niyetler yılın enerji tohumunu oluşturuyor.", en:"The zero-point of a new cycle — collective intention is at its strongest. Steps taken and intentions held at this threshold become the energy seeds of the entire year.", de:"Der Nullpunkt eines neuen Zyklus — kollektive Absicht ist am stärksten. Schritte und Absichten an diesem Übergang legen den Energiesamen für das gesamte Jahr.", es:"El punto cero de un nuevo ciclo — la intención colectiva es más poderosa. Los pasos e intenciones en este umbral se convierten en las semillas de energía del año.", pt:"O ponto zero de um novo ciclo — a intenção coletiva é mais forte. Os passos e intenções neste limiar tornam-se as sementes de energia do ano inteiro.", fr:"Le point zéro d'un nouveau cycle — l'intention collective est à son plus fort. Les pas et intentions à ce seuil deviennent les graines d'énergie de toute l'année.", ja:"新しいサイクルのゼロ点——集合的な意図が最も強まる。この閾値での一歩と意図が、一年全体のエネルギーの種となる。" }
  },
  // ── AYNASAL PORTALLAR (2/2 – 12/12, aslan kapısı ve 11/11 hariç) ──
  mirror_2_2:  { peakMD:[2,2],   window:2, name:{ tr:"2:2 Portalı",   en:"2:2 Portal",   de:"2:2-Portal",   es:"Portal 2:2",   pt:"Portal 2:2",   fr:"Portail 2:2",   ja:"2:2 ポータル"  }, desc:{ tr:"Denge ve ortaklık enerjisi — iki zıt kutbun uyum içinde birleştiği, dinleme ve alıcılık için güçlü gün.", en:"Energy of balance and partnership — the day two opposing poles harmonise, powerful for listening and receptivity.", de:"Energie von Gleichgewicht und Partnerschaft — die zwei entgegengesetzten Pole in Einklang kommen.", es:"Energía de equilibrio y asociación — los dos polos opuestos se armonizan.", pt:"Energia de equilíbrio e parceria — os dois polos opostos se harmonizam.", fr:"Énergie d'équilibre et de partenariat — les deux pôles opposés s'harmonisent.", ja:"バランスとパートナーシップのエネルギー——二つの対極が調和する日。" } },
  mirror_3_3:  { peakMD:[3,3],   window:2, name:{ tr:"3:3 Portalı",   en:"3:3 Portal",   de:"3:3-Portal",   es:"Portal 3:3",   pt:"Portal 3:3",   fr:"Portail 3:3",   ja:"3:3 ポータル"  }, desc:{ tr:"Yaratıcılık ve ifade enerjisi — üçlü titreşim, sanatsal akışın ve özgün sözün güçlendiği an.", en:"Creativity and expression energy — the triple vibration amplifies artistic flow and authentic voice.", de:"Kreativität und Ausdrucksenergie — die Dreifachschwingung verstärkt künstlerischen Fluss.", es:"Energía de creatividad y expresión — la vibración triple amplifica el flujo artístico.", pt:"Energia de criatividade e expressão — a vibração tripla amplifica o fluxo artístico.", fr:"Énergie de créativité et d'expression — la triple vibration amplifie le flux artistique.", ja:"創造性と表現のエネルギー——三重振動が芸術的流れを増幅させる。" } },
  mirror_4_4:  { peakMD:[4,4],   window:2, name:{ tr:"4:4 Portalı",   en:"4:4 Portal",   de:"4:4-Portal",   es:"Portal 4:4",   pt:"Portal 4:4",   fr:"Portail 4:4",   ja:"4:4 ポータル"  }, desc:{ tr:"Temel ve yapı enerjisi — dördün sağlamlığı, zor kararları sabitleme ve köklere dönme için uygun an.", en:"Foundation and structure energy — the solidity of four, an apt moment to anchor decisions and return to roots.", de:"Fundament und Struktur — die Festigkeit der Vier, ein passender Moment, Entscheidungen zu verankern.", es:"Energía de fundamento y estructura — la solidez del cuatro, momento para anclar decisiones.", pt:"Energia de fundamento e estrutura — a solidez do quatro, momento para ancorar decisões.", fr:"Énergie de fondation et de structure — la solidité du quatre, moment pour ancrer les décisions.", ja:"基盤と構造のエネルギー——四の堅固さ、決断を固め、根源に戻るのに適した瞬間。" } },
  mirror_5_5:  { peakMD:[5,5],   window:2, name:{ tr:"5:5 Portalı",   en:"5:5 Portal",   de:"5:5-Portal",   es:"Portal 5:5",   pt:"Portal 5:5",   fr:"Portail 5:5",   ja:"5:5 ポータル"  }, desc:{ tr:"Değişim ve özgürlük enerjisi — beşin çift yankısı, eski kalıpları bırakmak ve cesur adımlar atmak için pencere.", en:"Change and freedom energy — the double echo of five opens a window for releasing old patterns and taking bold steps.", de:"Veränderungs- und Freiheitsenergie — das doppelte Echo der Fünf, ein Fenster zum Loslassen alter Muster.", es:"Energía de cambio y libertad — el doble eco del cinco abre una ventana para liberar patrones antiguos.", pt:"Energia de mudança e liberdade — o eco duplo do cinco abre janela para libertar padrões antigos.", fr:"Énergie de changement et de liberté — le double écho du cinq ouvre une fenêtre pour libérer les anciens schémas.", ja:"変化と自由のエネルギー——五の二重のこだまが、古いパターンを手放し大胆な一歩を踏み出す窓を開く。" } },
  mirror_6_6:  { peakMD:[6,6],   window:2, name:{ tr:"6:6 Portalı",   en:"6:6 Portal",   de:"6:6-Portal",   es:"Portal 6:6",   pt:"Portal 6:6",   fr:"Portail 6:6",   ja:"6:6 ポータル"  }, desc:{ tr:"Sevgi ve şifa enerjisi — altının nurlu rezonansı, ilişkileri iyileştirme ve kalbi açma için nazik bir davet.", en:"Love and healing energy — the luminous resonance of six, a gentle invitation to heal relationships and open the heart.", de:"Liebes- und Heilungsenergie — die leuchtende Resonanz der Sechs, sanfte Einladung, Herz und Beziehungen zu heilen.", es:"Energía de amor y curación — la resonancia luminosa del seis, invitación suave a sanar relaciones y abrir el corazón.", pt:"Energia de amor e cura — a ressonância luminosa do seis, convite gentil para curar relações e abrir o coração.", fr:"Énergie d'amour et de guérison — la résonance lumineuse du six, invitation douce à guérir les relations et ouvrir le cœur.", ja:"愛と癒しのエネルギー——六の輝く共鳴が、関係を癒し心を開くための優しい招待をする。" } },
  mirror_7_7:  { peakMD:[7,7],   window:2, name:{ tr:"7:7 Portalı",   en:"7:7 Portal",   de:"7:7-Portal",   es:"Portal 7:7",   pt:"Portal 7:7",   fr:"Portail 7:7",   ja:"7:7 ポータル"  }, desc:{ tr:"Mistik bilgelik enerjisi — yedinin gizemli katmanları, derin içgörü ve manevi araştırma için çarpıcı bir eşik.", en:"Mystical wisdom energy — the mysterious layers of seven, a striking threshold for deep insight and spiritual inquiry.", de:"Mystische Weisheitsenergie — die rätselhaften Schichten der Sieben, eine markante Schwelle für tiefe Einsicht.", es:"Energía de sabiduría mística — las misteriosas capas del siete, umbral sorprendente para la profunda visión.", pt:"Energia de sabedoria mística — as camadas misteriosas do sete, limiar notável para visão profunda e investigação espiritual.", fr:"Énergie de sagesse mystique — les couches mystérieuses du sept, seuil frappant pour l'intuition profonde.", ja:"神秘的な知恵のエネルギー——七の謎めいた層が、深い洞察と霊的探求のための際立った閾値となる。" } },
  mirror_9_9:  { peakMD:[9,9],   window:2, name:{ tr:"9:9 Portalı",   en:"9:9 Portal",   de:"9:9-Portal",   es:"Portal 9:9",   pt:"Portal 9:9",   fr:"Portail 9:9",   ja:"9:9 ポータル"  }, desc:{ tr:"Tamamlanma ve insani sevgi enerjisi — dokuzun kapanış gücü, bir döngüyü kapatmak ve evrensel sevgiye uzanmak için alan.", en:"Completion and universal love energy — the closing power of nine, space to end a cycle and reach toward universal love.", de:"Vollendungs- und Allliebe-Energie — die abschließende Kraft der Neun, Raum, einen Zyklus zu beenden.", es:"Energía de completitud y amor universal — el poder de cierre del nueve, espacio para cerrar un ciclo.", pt:"Energia de conclusão e amor universal — o poder de encerramento do nove, espaço para fechar um ciclo.", fr:"Énergie d'accomplissement et d'amour universel — le pouvoir de clôture du neuf, espace pour clore un cycle.", ja:"完結と普遍的な愛のエネルギー——九の閉幕の力が、サイクルを終えて普遍的な愛へと手を伸ばす空間を開く。" } },
  mirror_10_10:{ peakMD:[10,10], window:2, name:{ tr:"10:10 Portalı", en:"10:10 Portal", de:"10:10-Portal", es:"Portal 10:10", pt:"Portal 10:10", fr:"Portail 10:10", ja:"10:10 ポータル" }, desc:{ tr:"Yeni başlangıç ve sıfırlama enerjisi — 10'un döngüsel mükemmelliği, eski versiyonu bırakıp sıfırdan başlamak için güçlü bir davet.", en:"New beginning and reset energy — the cyclical perfection of 10, a powerful invitation to release the old self and start anew.", de:"Neuanfangs- und Reset-Energie — die zyklische Vollkommenheit der 10, ein kraftvoller Ruf, das Alte loszulassen.", es:"Energía de nuevo comienzo y reset — la perfección cíclica del 10, poderosa invitación para liberar lo viejo.", pt:"Energia de novo começo e reinício — a perfeição cíclica do 10, poderoso convite para libertar o antigo e começar de novo.", fr:"Énergie de nouveau départ et de réinitialisation — la perfection cyclique du 10, invitation puissante à lâcher l'ancien.", ja:"新たな始まりとリセットのエネルギー——10の循環的な完全性が、古い自己を手放し新たに始める強力な招待をする。" } },
  mirror_12_12:{ peakMD:[12,12], window:2, name:{ tr:"12:12 Portalı", en:"12:12 Portal", de:"12:12-Portal", es:"Portal 12:12", pt:"Portal 12:12", fr:"Portail 12:12", ja:"12:12 ポータル" }, desc:{ tr:"Yılın son büyük aynası — 12'nin döngüsel dolgunluğu, yıl içinde öğrenilenleri kalbinde entegre et, kapanışa hazırlan.", en:"The year's last great mirror — the cyclical fullness of 12; integrate what the year has taught your heart and prepare for the closing.", de:"Der letzte große Spiegel des Jahres — integriere, was das Jahr dein Herz gelehrt hat, bereite den Abschluss vor.", es:"El último gran espejo del año — integra lo que el año ha enseñado a tu corazón, prepárate para el cierre.", pt:"O último grande espelho do ano — integra o que o ano ensinou ao teu coração, prepara-te para o encerramento.", fr:"Le dernier grand miroir de l'année — intègre ce que l'année a enseigné à ton cœur, prépare la clôture.", ja:"一年最後の大いなる鏡——12の循環的な充実、年が心に教えたことを統合し、閉幕の準備をする。" } },
};

// Mevsimsel kapı isimleri + açıklamaları
const _SN = {
  spring_equinox: { tr:"Bahar Ekinoksu Portalı", en:"Spring Equinox Portal", de:"Frühlingsäquinoktium-Portal", es:"Portal del Equinoccio de Primavera", pt:"Portal do Equinócio de Primavera", fr:"Portail de l'Équinoxe de Printemps", ja:"春分ポータル" },
  summer_solstice: { tr:"Yaz Gündönümü Portalı", en:"Summer Solstice Portal", de:"Sommersonnenwende-Portal", es:"Portal del Solsticio de Verano", pt:"Portal do Solstício de Verão", fr:"Portail du Solstice d'Été", ja:"夏至ポータル" },
  autumn_equinox: { tr:"Sonbahar Ekinoksu Portalı", en:"Autumn Equinox Portal", de:"Herbstäquinoktium-Portal", es:"Portal del Equinoccio de Otoño", pt:"Portal do Equinócio de Outono", fr:"Portail de l'Équinoxe d'Automne", ja:"秋分ポータル" },
  winter_solstice: { tr:"Kış Gündönümü Portalı", en:"Winter Solstice Portal", de:"Wintersonnenwende-Portal", es:"Portal del Solsticio de Invierno", pt:"Portal do Solstício de Inverno", fr:"Portail du Solstice d'Hiver", ja:"冬至ポータル" },
};
const _SD = {
  spring_equinox: { tr:"Gece ve gündüz eşit — Dünya, karanlıktan ışığa geçiyor. Bahar ekinoksu yeniden doğuşun, yeni tohumların ve umudun kolektif kapısı; doğa ve bilinç aynı anda sıfırlanıyor.", en:"Night and day equal — the Earth pivots from dark to light. The spring equinox is the collective gateway of rebirth, new seeds, and hope; nature and consciousness reset simultaneously.", de:"Nacht und Tag gleich — die Erde wendet sich vom Dunkel zum Licht. Das Frühlingsäquinoktium ist das kollektive Tor der Wiedergeburt; Natur und Bewusstsein setzen sich gleichzeitig zurück.", es:"Noche y día iguales — la Tierra pivota de la oscuridad a la luz. El equinoccio de primavera es la puerta colectiva del renacimiento; la naturaleza y la conciencia se reinician simultáneamente.", pt:"Noite e dia iguais — a Terra pivota da escuridão para a luz. O equinócio de primavera é o portal coletivo do renascimento; natureza e consciência reiniciam simultaneamente.", fr:"Nuit et jour égaux — la Terre pivote de l'obscurité vers la lumière. L'équinoxe de printemps est le portail collectif de la renaissance ; nature et conscience se réinitialisent simultanément.", ja:"夜と昼が等しくなる——地球が暗闇から光へと転換する。春分は再生、新たな種、そして希望の集合的な門。自然と意識が同時にリセットされる。" },
  summer_solstice: { tr:"Yılın en uzun günü — Güneş zirvede. Işık doluyken içinde neyi büyütmek istediğini sor; yaz gündönümü en yüksek potansiyelin kristalize olduğu, enerjinin doruk noktasına ulaştığı eşiktir.", en:"The longest day of the year — the Sun at its zenith. Ask what you want to grow while the light is full; the summer solstice is the threshold where your highest potential crystallises and energy reaches its peak.", de:"Der längste Tag des Jahres — die Sonne im Zenit. Frage, was du wachsen lassen willst, solange das Licht voll ist; die Sonnenwende kristallisiert dein höchstes Potenzial.", es:"El día más largo — el Sol en su cénit. Pregunta qué quieres cultivar mientras la luz es plena; el solsticio de verano cristaliza tu mayor potencial.", pt:"O dia mais longo — o Sol no zénite. Pergunta o que queres crescer enquanto a luz é plena; o solstício de verão cristaliza o teu maior potencial.", fr:"Le jour le plus long — le Soleil au zénith. Demande ce que tu veux faire grandir pendant que la lumière est pleine ; le solstice cristallise ton plus haut potentiel.", ja:"一年で最も長い日——太陽が天頂に。光が満ちている間に何を育てたいかを問う。夏至は最高の潜在能力が結晶化し、エネルギーが頂点に達する閾値。" },
  autumn_equinox: { tr:"Gece ve gündüz yeniden eşit — ışıktan karanlığa geçiş. Sonbahar ekinoksu hasatın, şükranın ve bırakmanın kolektif kapısı; içinde neyi olgunlaştırıp neyi bırakacağını görme zamanı.", en:"Night and day equal again — the transition from light to dark. The autumn equinox is the collective gateway of harvest, gratitude, and release; a time to see what within you has ripened and what must be let go.", de:"Nacht und Tag wieder gleich — Übergang vom Licht zur Dunkelheit. Das Herbstäquinoktium ist das kollektive Tor der Ernte, der Dankbarkeit und des Loslassens.", es:"Noche y día de nuevo iguales — transición de la luz a la oscuridad. El equinoccio de otoño es el portal colectivo de la cosecha, la gratitud y la liberación.", pt:"Noite e dia iguais novamente — transição da luz para a escuridão. O equinócio de outono é o portal coletivo da colheita, gratidão e libertação.", fr:"Nuit et jour de nouveau égaux — transition de la lumière à l'obscurité. L'équinoxe d'automne est le portail collectif de la récolte, de la gratitude et du lâcher-prise.", ja:"夜と昼が再び等しくなる——光から暗闇への移行。秋分は収穫、感謝、そして手放しの集合的な門。内なるものが熟したかどうかを見る時。" },
  winter_solstice: { tr:"Yılın en uzun gecesi — ama bu andan itibaren ışık geri dönüyor. Kış gündönümü karanlığın zirvesi ve yeniden doğuşun başlangıcı; içteki sessizliğe teslim olan, yeni güneşi ilk hisseden olur.", en:"The longest night of the year — yet from this moment the light returns. The winter solstice is the peak of darkness and the beginning of rebirth; those who surrender to the inner stillness are first to feel the new sun.", de:"Die längste Nacht — doch von diesem Moment an kehrt das Licht zurück. Die Wintersonnenwende ist der Höhepunkt der Dunkelheit und der Beginn der Wiedergeburt.", es:"La noche más larga — pero desde este momento la luz regresa. El solsticio de invierno es el pico de la oscuridad y el comienzo del renacimiento.", pt:"A noite mais longa — mas a partir deste momento a luz regressa. O solstício de inverno é o auge da escuridão e o início do renascimento.", fr:"La nuit la plus longue — mais dès cet instant la lumière revient. Le solstice d'hiver est le pic de l'obscurité et le début de la renaissance.", ja:"一年で最も長い夜——しかしこの瞬間から光は戻り始める。冬至は暗闇の頂点であり再生の始まり。内なる静寂に身を委ねる者が、最初に新しい太陽を感じる。" },
};

function activeEnergyPortals(date = new Date()) {
  const y = date.getUTCFullYear();
  const events = [];

  // Numerolojik portallar
  for (const [key, p] of Object.entries(_PORTALS)) {
    let peakTs = Date.UTC(y, p.peakMD[0]-1, p.peakMD[1]);
    let dFP = Math.round((date.getTime() - peakTs) / 86400000);
    // Yıl sınırı: 1/1 koridoru Aralık sonunda başlar
    if (dFP > 180) {
      peakTs = Date.UTC(y+1, p.peakMD[0]-1, p.peakMD[1]);
      dFP = Math.round((date.getTime() - peakTs) / 86400000);
    } else if (dFP < -180) {
      peakTs = Date.UTC(y-1, p.peakMD[0]-1, p.peakMD[1]);
      dFP = Math.round((date.getTime() - peakTs) / 86400000);
    }
    if (Math.abs(dFP) <= p.window) {
      events.push({ type:"portal", subtype:key, name:p.name, desc:p.desc, isPeak:Math.abs(dFP)<=1, daysFromPeak:dFP });
    }
  }

  // Mevsimsel kapılar (ekinoks + gündönümü) — dinamik, astronomy-engine
  try {
    const S = Seasons(y);
    const seasonal = [
      { key:"spring_equinox", t:S.mar_equinox.date },
      { key:"summer_solstice", t:S.jun_solstice.date },
      { key:"autumn_equinox", t:S.sep_equinox.date },
      { key:"winter_solstice", t:S.dec_solstice.date },
    ];
    for (const { key, t } of seasonal) {
      const dFP = Math.round((date.getTime() - t.getTime()) / 86400000);
      if (Math.abs(dFP) <= 4) {
        events.push({ type:"portal", subtype:key, name:_SN[key], desc:_SD[key], isPeak:Math.abs(dFP)<=1, daysFromPeak:dFP });
      }
    }
  } catch { /* sessiz */ }

  return events;
}

function getCorsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// 7-lang sözlük: tr / en / de / es / pt / fr / ja
// Ton: Sakin'in sesi — düşük perdeden, sade, küçük harf tercihli.
function kpDescription(kp) {
  if (kp < 3)   return { tr:"sakin",            en:"calm",           de:"ruhig",            es:"calmo",            pt:"calmo",            fr:"calme",            ja:"穏やか",       level:"low" };
  if (kp < 5)   return { tr:"hafif aktif",      en:"unsettled",      de:"leicht unruhig",   es:"levemente activo", pt:"levemente ativo",  fr:"légèrement agité", ja:"少し活発",     level:"moderate" };
  if (kp === 5) return { tr:"küçük fırtına",    en:"minor storm",    de:"kleiner Sturm",    es:"tormenta menor",   pt:"tempestade leve",  fr:"orage mineur",     ja:"小さな嵐",     level:"G1" };
  if (kp === 6) return { tr:"orta fırtına",     en:"moderate storm", de:"mäßiger Sturm",    es:"tormenta moderada",pt:"tempestade moderada",fr:"orage modéré",   ja:"中程度の嵐",   level:"G2" };
  if (kp === 7) return { tr:"güçlü fırtına",    en:"strong storm",   de:"starker Sturm",    es:"tormenta fuerte",  pt:"tempestade forte", fr:"orage fort",       ja:"強い嵐",       level:"G3" };
  if (kp === 8) return { tr:"şiddetli fırtına", en:"severe storm",   de:"heftiger Sturm",   es:"tormenta severa",  pt:"tempestade severa",fr:"orage sévère",     ja:"激しい嵐",     level:"G4" };
  return        { tr:"aşırı fırtına",           en:"extreme storm",  de:"extremer Sturm",   es:"tormenta extrema", pt:"tempestade extrema",fr:"orage extrême",   ja:"極端な嵐",     level:"G5" };
}

function flareDescription(maxClass) {
  // M ve X sınıfları "önemli"; B/C sakin
  if (!maxClass) return { tr:"sakin", en:"quiet", de:"ruhig", es:"tranquilo", pt:"tranquilo", fr:"calme", ja:"静か" };
  const c = maxClass[0]?.toUpperCase();
  if (c === "X") return { tr:"büyük patlama",  en:"major flare",    de:"große Eruption",     es:"erupción mayor",    pt:"erupção maior",    fr:"éruption majeure",  ja:"大規模フレア" };
  if (c === "M") return { tr:"orta patlama",   en:"moderate flare", de:"mittlere Eruption",  es:"erupción moderada", pt:"erupção moderada", fr:"éruption modérée",  ja:"中規模フレア" };
  if (c === "C") return { tr:"küçük patlama",  en:"minor flare",    de:"kleine Eruption",    es:"erupción menor",    pt:"erupção menor",    fr:"éruption mineure",  ja:"小規模フレア" };
  return           { tr:"sakin",             en:"quiet",          de:"ruhig",              es:"tranquilo",         pt:"tranquilo",        fr:"calme",             ja:"静か" };
}

function windDescription(speed) {
  if (speed == null) return null;
  if (speed < 400) return { tr:"yavaş",          en:"slow",       de:"langsam",     es:"lento",          pt:"lento",          fr:"lent",         ja:"ゆるやか" };
  if (speed < 500) return { tr:"normal",         en:"normal",     de:"normal",      es:"normal",         pt:"normal",         fr:"normal",       ja:"通常" };
  if (speed < 600) return { tr:"hızlı",          en:"fast",       de:"schnell",     es:"rápido",         pt:"rápido",         fr:"rapide",       ja:"速い" };
  if (speed < 700) return { tr:"çok hızlı",      en:"very fast",  de:"sehr schnell",es:"muy rápido",     pt:"muito rápido",   fr:"très rapide",  ja:"とても速い" };
  return            { tr:"fırtına seviyesi",   en:"storm-level",de:"Sturmstärke", es:"nivel tormenta", pt:"nível tempestade",fr:"niveau orageux",ja:"嵐レベル" };
}

// ── HAVA DURUMU TARZI ANLATILAR (7 dil) — her kategori için seviyeye göre ──
// Ton: Sakin'in sesi; hava-durumu sunucusu gibi, merak uyandıran, manevi.
const NARRATIVES = {
  geo_calm: { tr:"Manyetik alan sakin — zihin berrak, sezgiler net. İçine dönmek için güzel bir zaman.", en:"The magnetic field is calm — the mind clear, intuition sharp. A lovely time to turn inward.", de:"Das Magnetfeld ist ruhig — der Geist klar, die Intuition wach. Eine schöne Zeit, nach innen zu kehren.", es:"El campo magnético está en calma — la mente clara, la intuición nítida. Un buen momento para mirar hacia dentro.", pt:"O campo magnético está calmo — a mente clara, a intuição afiada. Um belo momento para olhar para dentro.", fr:"Le champ magnétique est calme — l'esprit clair, l'intuition limpide. Un beau moment pour se tourner vers l'intérieur.", ja:"磁場は穏やか——心は澄み、直感は冴えている。内側へと向かうのにふさわしいとき。" },
  geo_unsettled: { tr:"Alan hafif dalgalı — uykun bölünebilir, duygular yüzeye çıkabilir. Kendine nazik ol.", en:"The field is lightly stirred — sleep may break, emotions may rise to the surface. Be gentle with yourself.", de:"Das Feld ist leicht aufgewühlt — der Schlaf kann brechen, Gefühle an die Oberfläche steigen. Sei sanft zu dir.", es:"El campo está algo agitado — el sueño puede interrumpirse, las emociones aflorar. Sé amable contigo.", pt:"O campo está levemente agitado — o sono pode quebrar, as emoções vir à tona. Seja gentil consigo.", fr:"Le champ est légèrement agité — le sommeil peut se rompre, les émotions remonter. Sois doux avec toi-même.", ja:"場はわずかに揺らいでいる——眠りが乱れ、感情が表に浮かぶかもしれない。自分にやさしく。" },
  geo_storm: { tr:"Jeomanyetik fırtına — bedenin ve sezgilerin tetikte. Bastırdığın şeyler açığa çıkabilir; nefesine tutun.", en:"A geomagnetic storm — your body and intuition are on alert. What you've buried may surface; hold to your breath.", de:"Ein geomagnetischer Sturm — Körper und Intuition sind in Alarmbereitschaft. Verdrängtes kann hochkommen; halte dich an deinen Atem.", es:"Tormenta geomagnética — tu cuerpo y tu intuición están alerta. Lo reprimido puede salir; aférrate a tu respiración.", pt:"Tempestade geomagnética — teu corpo e tua intuição estão em alerta. O que reprimiste pode vir à tona; agarra-te à tua respiração.", fr:"Tempête géomagnétique — ton corps et ton intuition sont en alerte. Ce que tu as enfoui peut remonter ; accroche-toi à ton souffle.", ja:"地磁気の嵐——身体も直感も張りつめている。抑えてきたものが表れるかもしれない。呼吸に身を委ねて。" },
  flare_quiet: { tr:"Güneş sakin — istikrarlı, dengeli bir akış. Planlarına güven.", en:"The Sun is quiet — a steady, balanced flow. Trust your plans.", de:"Die Sonne ist still — ein stetiger, ausgewogener Fluss. Vertraue deinen Plänen.", es:"El Sol está tranquilo — un flujo estable y equilibrado. Confía en tus planes.", pt:"O Sol está tranquilo — um fluxo estável e equilibrado. Confia nos teus planos.", fr:"Le Soleil est paisible — un flux stable et équilibré. Aie confiance en tes projets.", ja:"太陽は静か——安定し、調和のとれた流れ。あなたの計画を信じて。" },
  flare_c: { tr:"Küçük parlamalar — enerjide hafif kıpırtı, yaratıcılığın uyanabilir.", en:"Small flares — a slight stir in the energy, your creativity may awaken.", de:"Kleine Eruptionen — ein leichtes Beben in der Energie, deine Kreativität kann erwachen.", es:"Pequeñas llamaradas — un leve cosquilleo en la energía, tu creatividad puede despertar.", pt:"Pequenas erupções — um leve frisson na energia, tua criatividade pode despertar.", fr:"De petites éruptions — un léger frémissement dans l'énergie, ta créativité peut s'éveiller.", ja:"小さなフレア——エネルギーがかすかに揺れ、創造性が目覚めるかもしれない。" },
  flare_m: { tr:"Orta patlama — elektromanyetik dalgalar artıyor; huzursuzluk ya da ani fikirler gelebilir.", en:"A medium flare — electromagnetic waves are rising; restlessness or sudden ideas may come.", de:"Eine mittlere Eruption — elektromagnetische Wellen nehmen zu; Unruhe oder plötzliche Einfälle können kommen.", es:"Llamarada media — las ondas electromagnéticas aumentan; pueden llegar inquietud o ideas repentinas.", pt:"Erupção média — as ondas eletromagnéticas aumentam; podem surgir inquietação ou ideias repentinas.", fr:"Éruption moyenne — les ondes électromagnétiques montent ; agitation ou idées soudaines peuvent surgir.", ja:"中規模のフレア——電磁波が高まっている。落ち着かなさや、ふいの閃きが訪れるかも。" },
  flare_x: { tr:"Güneşte büyük bir patlama oldu — elektromanyetik fırtına insanları etkileyebilir ve bastırılmış şeyleri açığa çıkarabilir.", en:"A great flare has erupted on the Sun — the electromagnetic storm can touch people and bring buried things to the surface.", de:"Eine gewaltige Eruption auf der Sonne — der elektromagnetische Sturm kann Menschen berühren und Verdrängtes ans Licht bringen.", es:"Una gran llamarada estalló en el Sol — la tormenta electromagnética puede afectar a las personas y sacar a la luz lo reprimido.", pt:"Uma grande erupção surgiu no Sol — a tempestade eletromagnética pode tocar as pessoas e trazer à tona o que estava reprimido.", fr:"Une éruption majeure a jailli du Soleil — la tempête électromagnétique peut toucher les êtres et faire remonter ce qui était enfoui.", ja:"太陽で大規模な爆発が起きた——電磁の嵐は人々に触れ、抑え込まれていたものを浮かび上がらせるかもしれない。" },
  wind_calm: { tr:"Güneş rüzgârı yumuşak — akış dengeli, kendinle barışık hissedebilirsin.", en:"The solar wind is gentle — the flow is balanced, you may feel at peace with yourself.", de:"Der Sonnenwind ist sanft — der Fluss ist ausgewogen, du magst mit dir im Reinen sein.", es:"El viento solar es suave — el flujo es equilibrado, puedes sentirte en paz contigo.", pt:"O vento solar está suave — o fluxo é equilibrado, podes sentir-te em paz contigo.", fr:"Le vent solaire est doux — le flux est équilibré, tu peux te sentir en paix avec toi-même.", ja:"太陽風はやわらか——流れは穏やかで、自分と和解しているように感じられるかも。" },
  wind_fast: { tr:"Güneş rüzgârları hızlanıyor — benliğinde huzursuzluk yaratabilir, ama her şey ilahi planın bir parçası.", en:"The solar winds are quickening — they may stir restlessness within you, yet all is part of the divine plan.", de:"Die Sonnenwinde beschleunigen sich — sie können Unruhe in dir wecken, doch alles ist Teil des göttlichen Plans.", es:"Los vientos solares se aceleran — pueden despertar inquietud en ti, pero todo es parte del plan divino.", pt:"Os ventos solares aceleram — podem despertar inquietação em ti, mas tudo faz parte do plano divino.", fr:"Les vents solaires s'accélèrent — ils peuvent éveiller en toi de l'agitation, mais tout fait partie du plan divin.", ja:"太陽風が速まっている——内なる落ち着かなさを呼び起こすかもしれないが、すべては神聖な計画の一部。" },
  wind_storm: { tr:"Güneş rüzgârı fırtına seviyesinde — sinirler gergin, sezgiler yüksek. Toprağa bas, sakinleş.", en:"The solar wind has reached storm levels — nerves are taut, intuition heightened. Ground yourself, grow calm.", de:"Der Sonnenwind hat Sturmstärke erreicht — die Nerven sind angespannt, die Intuition hellwach. Erde dich, werde ruhig.", es:"El viento solar alcanza niveles de tormenta — los nervios tensos, la intuición elevada. Echa raíces, serénate.", pt:"O vento solar atingiu níveis de tempestade — nervos tensos, intuição aguçada. Enraíza-te, acalma-te.", fr:"Le vent solaire atteint le niveau de la tempête — les nerfs sont tendus, l'intuition exacerbée. Ancre-toi, apaise-toi.", ja:"太陽風は嵐の域に達した——神経は張りつめ、直感は研ぎ澄まされる。大地に根を下ろし、静まって。" },
  moon_new: { tr:"Yeni Ay — niyetini tohumla. Karanlık, başlangıçların rahmidir.", en:"New Moon — plant the seed of your intention. The dark is the womb of all beginnings.", de:"Neumond — säe deine Absicht. Die Dunkelheit ist der Schoß aller Anfänge.", es:"Luna Nueva — siembra tu intención. La oscuridad es el vientre de todo comienzo.", pt:"Lua Nova — semeia a tua intenção. A escuridão é o ventre de todos os começos.", fr:"Nouvelle Lune — sème ton intention. L'obscurité est le ventre de tous les commencements.", ja:"新月——意図の種をまくとき。闇は、すべての始まりが宿る母胎。" },
  moon_waxing_crescent: { tr:"Büyüyen hilal — niyetlerin filizleniyor, küçük ama kararlı adımlar at.", en:"Waxing crescent — your intentions are sprouting; take small but steadfast steps.", de:"Zunehmende Sichel — deine Absichten keimen; gehe kleine, aber entschlossene Schritte.", es:"Luna creciente — tus intenciones brotan; da pasos pequeños pero firmes.", pt:"Lua crescente — as tuas intenções brotam; dá passos pequenos mas firmes.", fr:"Croissant ascendant — tes intentions germent ; avance par petits pas résolus.", ja:"上弦に向かう三日月——意図が芽吹いている。小さくとも確かな一歩を。" },
  moon_first_quarter: { tr:"İlk dördün — engeller seni sınar; kararlılığını göster.", en:"First quarter — obstacles test you; show your resolve.", de:"Erstes Viertel — Hindernisse stellen dich auf die Probe; zeige deine Entschlossenheit.", es:"Cuarto creciente — los obstáculos te ponen a prueba; muestra tu determinación.", pt:"Quarto crescente — os obstáculos põem-te à prova; mostra a tua determinação.", fr:"Premier quartier — les obstacles te mettent à l'épreuve ; montre ta détermination.", ja:"上弦の月——障害があなたを試す。決意を示すとき。" },
  moon_waxing_gibbous: { tr:"Şişkinleşen ay — doruğa yaklaşıyorsun, ince ayar zamanı.", en:"Waxing gibbous — you're nearing the peak; it's time for fine-tuning.", de:"Zunehmender Mond — du näherst dich dem Höhepunkt; Zeit für die Feinabstimmung.", es:"Luna gibosa creciente — te acercas a la cima; es hora de los últimos ajustes.", pt:"Lua gibosa crescente — aproximas-te do auge; é hora de afinar os detalhes.", fr:"Lune gibbeuse croissante — tu approches du sommet ; le temps des derniers réglages.", ja:"満ちゆく月——頂へと近づいている。細やかに整えるとき。" },
  moon_full: { tr:"Dolunay — duygular doruğda, her şey aydınlanır. Bırakmayı öğren.", en:"Full Moon — emotions are at their peak, everything is illuminated. Learn to let go.", de:"Vollmond — die Gefühle auf dem Höhepunkt, alles wird erhellt. Lerne loszulassen.", es:"Luna Llena — las emociones en su cima, todo se ilumina. Aprende a soltar.", pt:"Lua Cheia — as emoções no auge, tudo se ilumina. Aprende a deixar ir.", fr:"Pleine Lune — les émotions à leur apogée, tout s'illumine. Apprends à lâcher prise.", ja:"満月——感情は極まり、すべてが照らされる。手放すことを学んで。" },
  moon_waning_gibbous: { tr:"Küçülen ay — şükret, öğrendiklerini paylaş.", en:"Waning gibbous — give thanks, share what you've learned.", de:"Abnehmender Mond — sei dankbar, teile, was du gelernt hast.", es:"Luna gibosa menguante — agradece, comparte lo que has aprendido.", pt:"Lua gibosa minguante — agradece, partilha o que aprendeste.", fr:"Lune gibbeuse décroissante — rends grâce, partage ce que tu as appris.", ja:"欠けゆく月——感謝を捧げ、学んだことを分かち合って。" },
  moon_last_quarter: { tr:"Ay son dördünde — enerjiler durulmaya başlayabilir, sıkışıklıkların altında yatan nedenler görünür olabilir.", en:"Last quarter — the energies may begin to settle, and the roots beneath your blocks may come into view.", de:"Letztes Viertel — die Energien können sich zu beruhigen beginnen, und die Wurzeln unter deinen Blockaden werden sichtbar.", es:"Cuarto menguante — las energías pueden empezar a aquietarse, y las raíces bajo tus bloqueos se vuelven visibles.", pt:"Quarto minguante — as energias podem começar a serenar, e as raízes sob os teus bloqueios tornam-se visíveis.", fr:"Dernier quartier — les énergies peuvent commencer à s'apaiser, et les racines sous tes blocages se révéler.", ja:"下弦の月——エネルギーは静まりはじめ、行き詰まりの奥にある原因が見えてくるかもしれない。" },
  moon_waning_crescent: { tr:"Balzamik ay — dinlen, bırak, boşluğa güven. Yeni döngü yaklaşıyor.", en:"Balsamic moon — rest, release, trust the emptiness. A new cycle draws near.", de:"Balsamischer Mond — ruhe, lass los, vertraue der Leere. Ein neuer Zyklus naht.", es:"Luna balsámica — descansa, suelta, confía en el vacío. Un nuevo ciclo se acerca.", pt:"Lua balsâmica — descansa, solta, confia no vazio. Um novo ciclo se aproxima.", fr:"Lune balsamique — repose-toi, lâche prise, fais confiance au vide. Un nouveau cycle approche.", ja:"鎮静の月——休み、手放し、空白に身を委ねて。新たな巡りが近づいている。" },
  meteor_active: { tr:"{name} göktaşı yağmuru aktif — gökten yeni bilgiler iniyor. Radarına dikkat et, antenlerini çalıştır.", en:"The {name} meteor shower is active — new knowledge is descending from the sky. Watch your radar, raise your antennae.", de:"Der {name}-Meteorschauer ist aktiv — neues Wissen steigt vom Himmel herab. Achte auf deinen Radar, richte deine Antennen aus.", es:"La lluvia de meteoros {name} está activa — nuevo conocimiento desciende del cielo. Atiende tu radar, despliega tus antenas.", pt:"A chuva de meteoros {name} está ativa — novos saberes descem do céu. Atenta ao teu radar, ergue as tuas antenas.", fr:"La pluie d'étoiles filantes {name} est active — un savoir nouveau descend du ciel. Veille sur ton radar, déploie tes antennes.", ja:"{name}流星群が活発——空から新たな知らせが降りてくる。レーダーに気を配り、アンテナを立てて。" },
  meteor_quiet: { tr:"Gökyüzü sakin — bir sonraki yağmur yaklaşıyor. Dileğini şimdiden hazırla.", en:"The sky is quiet — the next shower draws near. Ready your wish even now.", de:"Der Himmel ist still — der nächste Schauer naht. Halte deinen Wunsch schon jetzt bereit.", es:"El cielo está tranquilo — la próxima lluvia se acerca. Prepara tu deseo desde ahora.", pt:"O céu está tranquilo — a próxima chuva se aproxima. Prepara já o teu desejo.", fr:"Le ciel est paisible — la prochaine pluie approche. Prépare ton vœu dès maintenant.", ja:"空は静か——次の流星群が近づいている。今から願いを用意して。" },
};

// ── AY EVRESİ (hesaplama — API gerekmez) ──
const MOON_EMOJI = { new:"🌑", waxing_crescent:"🌒", first_quarter:"🌓", waxing_gibbous:"🌔", full:"🌕", waning_gibbous:"🌖", last_quarter:"🌗", waning_crescent:"🌘" };
const MOON_LABELS = {
  new:             { tr:"Yeni Ay",        en:"New Moon",        de:"Neumond",            es:"Luna Nueva",        pt:"Lua Nova",          fr:"Nouvelle Lune",     ja:"新月" },
  waxing_crescent: { tr:"Büyüyen Hilal",  en:"Waxing Crescent", de:"Zunehmende Sichel",  es:"Creciente",         pt:"Crescente",         fr:"Premier Croissant", ja:"三日月" },
  first_quarter:   { tr:"İlk Dördün",     en:"First Quarter",   de:"Erstes Viertel",     es:"Cuarto Creciente",  pt:"Quarto Crescente",  fr:"Premier Quartier",  ja:"上弦の月" },
  waxing_gibbous:  { tr:"Büyüyen Ay",     en:"Waxing Gibbous",  de:"Zunehmender Mond",   es:"Gibosa Creciente",  pt:"Gibosa Crescente",  fr:"Gibbeuse Croissante",ja:"十三夜" },
  full:            { tr:"Dolunay",        en:"Full Moon",       de:"Vollmond",           es:"Luna Llena",        pt:"Lua Cheia",         fr:"Pleine Lune",       ja:"満月" },
  waning_gibbous:  { tr:"Küçülen Ay",     en:"Waning Gibbous",  de:"Abnehmender Mond",   es:"Gibosa Menguante",  pt:"Gibosa Minguante",  fr:"Gibbeuse Décroissante",ja:"寝待月" },
  last_quarter:    { tr:"Son Dördün",     en:"Last Quarter",    de:"Letztes Viertel",    es:"Cuarto Menguante",  pt:"Quarto Minguante",  fr:"Dernier Quartier",  ja:"下弦の月" },
  waning_crescent: { tr:"Balzamik Ay",    en:"Waning Crescent", de:"Abnehmende Sichel",  es:"Menguante",         pt:"Minguante",         fr:"Dernier Croissant", ja:"有明月" },
};

function moonPhase(date = new Date()) {
  const synodic = 29.530588853;
  const knownNew = Date.UTC(2000, 0, 6, 18, 14) / 86400000; // bilinen yeni ay (gün)
  const now = date.getTime() / 86400000;
  const age = (((now - knownNew) % synodic) + synodic) % synodic;
  const illumination = Math.round(((1 - Math.cos((2 * Math.PI * age) / synodic)) / 2) * 100);
  let phase;
  if      (age < 1.84566)  phase = "new";
  else if (age < 5.53699)  phase = "waxing_crescent";
  else if (age < 9.22831)  phase = "first_quarter";
  else if (age < 12.91963) phase = "waxing_gibbous";
  else if (age < 16.61096) phase = "full";
  else if (age < 20.30228) phase = "waning_gibbous";
  else if (age < 23.99361) phase = "last_quarter";
  else if (age < 27.68493) phase = "waning_crescent";
  else                     phase = "new";
  return { phase, age: Math.round(age * 10) / 10, illumination, emoji: MOON_EMOJI[phase], label: MOON_LABELS[phase] };
}

// ── GÖKTAŞI YAĞMURLARI (yıllık takvim — büyük yağmurlar) ──
const METEOR_SHOWERS = [
  { name:"Quadrantids",   nameTr:"Kuadrantidler",    start:[12,28], peak:[1,3],   end:[1,12]  },
  { name:"Lyrids",        nameTr:"Liridler",         start:[4,16],  peak:[4,22],  end:[4,25]  },
  { name:"Eta Aquariids", nameTr:"Eta Akvariidler",  start:[4,19],  peak:[5,6],   end:[5,28]  },
  { name:"Perseids",      nameTr:"Perseidler",       start:[7,17],  peak:[8,12],  end:[8,24]  },
  { name:"Orionids",      nameTr:"Orionidler",       start:[10,2],  peak:[10,21], end:[11,7]  },
  { name:"Leonids",       nameTr:"Leonidler",        start:[11,6],  peak:[11,17], end:[11,30] },
  { name:"Geminids",      nameTr:"Geminidler",       start:[12,4],  peak:[12,14], end:[12,17] },
  { name:"Ursids",        nameTr:"Ursidler",         start:[12,17], peak:[12,22], end:[12,26] },
];

function activeMeteorShower(date = new Date()) {
  const cur = (date.getUTCMonth() + 1) * 100 + date.getUTCDate();
  for (const s of METEOR_SHOWERS) {
    const start = s.start[0] * 100 + s.start[1];
    const end = s.end[0] * 100 + s.end[1];
    const inWindow = start <= end ? (cur >= start && cur <= end) : (cur >= start || cur <= end); // yıl-dönümü sarması (Quadrantids)
    if (inWindow) {
      const peak = s.peak[0] * 100 + s.peak[1];
      return { active: true, name: s.name, nameTr: s.nameTr, peak: s.peak, isPeak: Math.abs(cur - peak) <= 1 };
    }
  }
  return { active: false };
}

// {name} yer tutucusunu dile göre yağmur adıyla doldur (tr → Türkçe ad)
function fillMeteorName(tpl, shower) {
  const out = {};
  for (const lang of Object.keys(tpl)) {
    const nm = lang === "tr" ? shower.nameTr : shower.name;
    out[lang] = tpl[lang].replace("{name}", nm);
  }
  return out;
}

// fetch + timeout — Netlify function sınırına takılmasın
async function fetchWithTimeout(url, ms = 4500, options = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { ...options, signal: ctrl.signal });
    return r;
  } finally {
    clearTimeout(timer);
  }
}

// ── ÖZGÜN KOLEKTİF GÖKYÜZÜ RAPORU (Groq sentezi — tüm gerçek veriyi yorumlar) ──
const _SKY_LANG_NAMES = { tr:"Turkish", en:"English", de:"German", es:"Spanish", pt:"Portuguese", fr:"French", ja:"Japanese" };
// Her gün farklı bir açılış perspektifi — "Dünyamız bugün..." kalıbı her açılışta
// tekrar edip kullanıcıyı soğutuyordu. Gün-of-year ile deterministik döner;
// model bu perspektifi KENDİ kelimeleriyle işler (kopyalamaz).
const _SKY_ANGLES = [
  "start from the body: how this field might feel in the chest, the breath, the pace of thought",
  "start from the night sky itself: what someone looking up right now would actually see",
  "start from silence and stillness — describe the quiet before describing anything else",
  "start from motion: winds, currents, particles travelling from the Sun toward us",
  "start from the Moon — let its phase set the emotional key of the whole reading",
  "start with a single short striking sentence (max 6 words), then unfold it",
  "start from the feeling of a shared morning: everyone waking under the same field",
  "start from contrast: what is loud in the sky versus what is calm in it",
  "start from time: what today carries over from yesterday's sky, what it releases",
  "start from the Earth's perspective, as if the planet itself sensed the field",
];
// TR çıktısında model bazen yabancı sızıntı bırakıyor ("procent", "dàn" gibi).
// Aksan temizliği: Türkçede aksanlı harf yalnız â/î/û'dur; à è ì ò ù asla olmaz.
//
// CJK/KİRİL SIZINTISI (kullanıcı raporu): TR raporunda "Herkes aynı anda uyanırken,
// 世界 aynı enerji alanında birleşiyor." çıktı. Model, çok dilli ağırlıklarından
// rastgele bir Çince/Japonca/Kiril parçası bırakabiliyor. Prompt'taki "LANGUAGE
// PURITY" kuralı bunu AZALTIYOR ama GARANTİ ETMİYOR — o yüzden çıktı tarafında
// sert bir süzgeç: Latin-dışı yazı sistemi karakteri görülürse (ja hariç) o rapor
// KULLANILMAZ, null döner ve çağıran taraf hazır şablon metne düşer. Kısmi silme
// yapmıyoruz; cümlenin ortasından kelime çıkarmak daha bozuk bir metin üretir.
const _NON_LATIN_RE = /[\u3000-\u303F\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uAC00-\uD7AF\u0400-\u04FF\u0600-\u06FF\u0590-\u05FF]/;
function _sanitizeSky(text, lang) {
  let t = String(text || "").trim();
  if (!t) return t;
  // Japonca zaten CJK kullanır — onu bu süzgeçten muaf tut.
  if (lang !== "ja" && _NON_LATIN_RE.test(t)) {
    console.warn("[sky] latin-disi karakter sizintisi, rapor reddedildi:", lang, t.slice(0, 120));
    return null;   // → şablon metne düş
  }
  if (lang === "tr") {
    // LATİN HARFLİ YABANCI KELİME SIZINTISI. Canlıda görüldü: "world'in", "Woche",
    // "transformationsımızda", "gibous", "arrivalini", "oportunite", "Lion's Gate"...
    // İki katmanlı süzgeç:
    // (1) Türk alfabesinde q/w/x YOK — geçen kelime kesinlikle yabancı.
    //     Küçük harfli VE büyük harflilerin ikisini de yakala (Almanca "Woche"
    //     büyük W ile başlar, önceden kaçıyordu).
    // (2) Yaygın İngilizce/Almanca/Fransızca kök karalistesi — q/w/x içermeyen
    //     sızıntılar için (transformation, gibbous, arrival, opportunity/oportunite,
    //     corridor, comet, welt, tag, morgen...). AI bu kelimelerin Türkçe
    //     karşılıklarını bilmiyorsa şablon metne düşmek daha temiz.
    // Muaf: yalnızca özellikle işaretli özel adlar (Sirius, Sakin, gezegen adları).
    const words = t.match(/\b[\p{L}][\p{L}'’]*\b/gu) || [];
    // Meşru özel adlar/kelimeler — bunlar q/w/x taşımıyor zaten ama karaliste
    // eşleşmelerinden muaf tutmak istediklerimiz burada.
    const allow = new Set(["Sakin","Sirius"]);
    const badQWX = words.find(w => !allow.has(w) && /[qwxQWX]/.test(w));
    if (badQWX) {
      console.warn("[sky] TR: q/w/x içeren yabancı kelime, rapor reddedildi:", badQWX, "|", t.slice(0, 100));
      return null;   // → şablon metne düş
    }
    // Karaliste: q/w/x içermeyen ama Türkçe olmadığı KESİN köklü kelimeler.
    // Türkçe morfemleri de kapsar: "transformation" + "ımızda", "arrival" + "ini" vs.
    // Not: "portal" burada YOK — TR'de meşru kelime ("Portalı", "portalları"). "corridor"
    // da benzer ama TR karşılığı "koridor" ile başlar (regex "corr..." → eşleşmez).
    // ⚠️ KELİME SINIRI (\b) ŞART — yoksa ALT-DİZE eşleşiyordu ve meşru Türkçe
    // kelimeler yüzünden raporun TAMAMI reddedilip kısa şablon metne düşülüyordu.
    // Canlıda ölçüldü: "y-ERDE" ("ayaklarını yerde hisset"), "p-ERDE", "s-ERDE"
    // hepsi Almanca "erde" sanılıyordu — "yerde" gündelik Türkçenin en sık
    // kelimelerinden, bu yüzden raporların ÇOĞU düşüyordu ("neden hep kısa mesaj
    // geliyor?" şikayetinin kök sebebi buydu).
    // Ayrıca Türkçede MEŞRU olan girdiler listeden çıkarıldı:
    //   zenit (TR'de zenit), stern/erde/welt/licht/geist (TR kelimelerin içinde
    //   alt-dize olarak geçiyordu), gate/lions ("Aslan Kapısı" TR'ye çevrilmiş
    //   hâliyle zaten geliyor; alt-dize riski faydasından büyük).
    const _TR_BLOCKLIST = /\b(?:transformation|transformations|gibbous|gibous|arrival|opportunit|oportunit|corridor|couloir|puerta|löwentor|comet|comète|cometa|corredor|portail|zenith|morgen|nacht|gestern|heute|jetzt|sonne|dunkelheit|solstice|equinox|equinocc|äquinok|solstic|depth|surface|journey|shadow|wisdom|healing|awareness|silence|feeling|inner|deep|breath|soul|heart|mind)\p{L}*/giu;
    const badKW = t.match(_TR_BLOCKLIST);
    if (badKW && badKW.length) {
      console.warn("[sky] TR: yabancı kök sızıntısı, rapor reddedildi:", badKW.join(","), "|", t.slice(0, 100));
      return null;   // → şablon metne düş
    }
    // SADECE Türkçe: fr/pt'de à/è/ù meşru harflerdir, onlara dokunma.
    t = t.replace(/à/g, "a").replace(/è/g, "e").replace(/ì/g, "i").replace(/ò/g, "o").replace(/ù/g, "u");
    t = t.replace(/\bprocent\b/gi, "yüzde").replace(/\bpercent\b/gi, "yüzde").replace(/\bprozent\b/gi, "yüzde");
  }
  return t;
}
// Gezegen + zodyak lokalize sözlükler — TR raporunda İngilizce sızıntısını (Comet, Saturn in Pisces vb.)
// önlemek için AI'ya doğrudan hedef dildeki isimleri ver.
const _PLANET_L = {
  Sun:{tr:"Güneş",en:"Sun",de:"Sonne",es:"Sol",pt:"Sol",fr:"Soleil",ja:"太陽"},
  Moon:{tr:"Ay",en:"Moon",de:"Mond",es:"Luna",pt:"Lua",fr:"Lune",ja:"月"},
  Mercury:{tr:"Merkür",en:"Mercury",de:"Merkur",es:"Mercurio",pt:"Mercúrio",fr:"Mercure",ja:"水星"},
  Venus:{tr:"Venüs",en:"Venus",de:"Venus",es:"Venus",pt:"Vénus",fr:"Vénus",ja:"金星"},
  Mars:{tr:"Mars",en:"Mars",de:"Mars",es:"Marte",pt:"Marte",fr:"Mars",ja:"火星"},
  Jupiter:{tr:"Jüpiter",en:"Jupiter",de:"Jupiter",es:"Júpiter",pt:"Júpiter",fr:"Jupiter",ja:"木星"},
  Saturn:{tr:"Satürn",en:"Saturn",de:"Saturn",es:"Saturno",pt:"Saturno",fr:"Saturne",ja:"土星"},
  Uranus:{tr:"Uranüs",en:"Uranus",de:"Uranus",es:"Urano",pt:"Urano",fr:"Uranus",ja:"天王星"},
  Neptune:{tr:"Neptün",en:"Neptune",de:"Neptun",es:"Neptuno",pt:"Netuno",fr:"Neptune",ja:"海王星"},
  Pluto:{tr:"Plüton",en:"Pluto",de:"Pluto",es:"Plutón",pt:"Plutão",fr:"Pluton",ja:"冥王星"},
};
const _ZODIAC_L = {
  Aries:{tr:"Koç",en:"Aries",de:"Widder",es:"Aries",pt:"Carneiro",fr:"Bélier",ja:"牡羊座"},
  Taurus:{tr:"Boğa",en:"Taurus",de:"Stier",es:"Tauro",pt:"Touro",fr:"Taureau",ja:"牡牛座"},
  Gemini:{tr:"İkizler",en:"Gemini",de:"Zwillinge",es:"Géminis",pt:"Gémeos",fr:"Gémeaux",ja:"双子座"},
  Cancer:{tr:"Yengeç",en:"Cancer",de:"Krebs",es:"Cáncer",pt:"Caranguejo",fr:"Cancer",ja:"蟹座"},
  Leo:{tr:"Aslan",en:"Leo",de:"Löwe",es:"Leo",pt:"Leão",fr:"Lion",ja:"獅子座"},
  Virgo:{tr:"Başak",en:"Virgo",de:"Jungfrau",es:"Virgo",pt:"Virgem",fr:"Vierge",ja:"乙女座"},
  Libra:{tr:"Terazi",en:"Libra",de:"Waage",es:"Libra",pt:"Balança",fr:"Balance",ja:"天秤座"},
  Scorpio:{tr:"Akrep",en:"Scorpio",de:"Skorpion",es:"Escorpio",pt:"Escorpião",fr:"Scorpion",ja:"蠍座"},
  Sagittarius:{tr:"Yay",en:"Sagittarius",de:"Schütze",es:"Sagitario",pt:"Sagitário",fr:"Sagittaire",ja:"射手座"},
  Capricorn:{tr:"Oğlak",en:"Capricorn",de:"Steinbock",es:"Capricornio",pt:"Capricórnio",fr:"Capricorne",ja:"山羊座"},
  Aquarius:{tr:"Kova",en:"Aquarius",de:"Wassermann",es:"Acuario",pt:"Aquário",fr:"Verseau",ja:"水瓶座"},
  Pisces:{tr:"Balık",en:"Pisces",de:"Fische",es:"Piscis",pt:"Peixes",fr:"Poissons",ja:"魚座"},
};
const _RETRO_L = { tr:"retro", en:"retrograde", de:"rückläufig", es:"retrógrado", pt:"retrógrado", fr:"rétrograde", ja:"逆行" };

async function generateSkyReport(data, lang) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  const name = _SKY_LANG_NAMES[lang] || "English";
  const kpLevel = data.interpretation?.current?.en || "calm";
  const dayOfYear = Math.floor((Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 0)) / 86400000);
  const angle = _SKY_ANGLES[dayOfYear % _SKY_ANGLES.length];
  const planets = data.planets || [];
  const _pn = (b) => _PLANET_L[b]?.[lang] || b;
  const _zn = (s) => _ZODIAC_L[s]?.[lang] || s;
  const _rn = _RETRO_L[lang] || "retrograde";
  const retroPlanets = planets.filter(p => p.retrograde).map(p => `${_pn(p.body)} (${_zn(p.sign)})`);
  const planetSummary = planets.map(p => `${_pn(p.body)}: ${_zn(p.sign)} ${p.deg}°${p.retrograde ? ` (${_rn})` : ""}`).join(", ");
  const sys = `You are Sakin's sky-weather voice — warm, sincere, deeply heartfelt, lightly poetic, never clichéd. Write a COLLECTIVE daily reading of the shared sky and the ENERGY FIELD the whole Earth is moving through right now. This is NOT personal astrology and NOT about any single person.

PLANET ENERGY: You receive planetary positions below. You MAY mention which planets are retrograde and what collective energy they carry (e.g. "Mercury retrograde invites us to slow down and revisit"), and you may reference the Moon's zodiac position for collective mood. But NEVER write horoscope-style predictions, never mention houses, never say "if you're a Leo/Aries/etc." Keep it universal and collective.

HEARTFELT INTERPRETATION: Your most important job is to help people FEEL the sky's energy in their hearts. When there's a strong solar flare, describe how its waves reach Earth and stir deep emotions, bring buried feelings to the surface, or trigger sudden shifts in consciousness. When geomagnetic storms hit, explain how they might cause restlessness, vivid dreams, or sudden clarity. Make the reader feel connected to the cosmos — not through cold data, but through warm, sincere language about how these energies touch our inner world. Example tone: "The echoes of this solar eruption will ripple through our atmosphere over the coming days, and with them, waves of emotion we thought we'd buried may rise to the surface to be seen and released."

LANGUAGE PURITY — ABSOLUTE RULE: write ENTIRELY in ${name}, using ONLY ${name} vocabulary and orthography. Never mix in words or spellings from ANY other language — no English, Dutch, Romanian, French leaks (words like "procent", "dàn", "percent" are FORBIDDEN${lang === "tr" ? '; in Turkish say "yüzde", and the only accented vowels that exist are â, î, û' : ""}). If you are unsure of a word, choose a simpler native one.

NOTABLE SKY EVENTS — HIGHEST PRIORITY: If the data lists any notable sky events (solar eclipse, lunar eclipse, comet, planet parade or alignment, energy portal or corridor), you MUST weave them in naturally and prominently — at least 1–2 heartfelt sentences. A solar or lunar eclipse is a rare, powerful cosmic crossing; treat it with reverence. A bright comet is a cosmic messenger from the outer reaches; acknowledge what it stirs collectively. A planet parade or tight alignment means energies are gathering in one direction; name the key planets. An energy portal or corridor (like the Lion's Gate, 11:11, solstices, equinoxes) marks a collective threshold where the subtle field is especially receptive — describe how this opening feels in the body and in collective consciousness, what it invites or releases. Never omit these if they appear. When any such event is only days away, convey the sense of anticipation.

NO FORMULAS: never open with stock phrases ("Dünyamız bugün", "Bugün gökyüzü", "Today the world", or their equivalents). Each day's reading must have a genuinely different first sentence and rhythm — nothing memorized-sounding. 4 to 7 flowing sentences, prose only — no bullet points, no headings, no listing of raw numbers. Never give medical or financial advice. The proper noun "Sakin" stays untranslated.`;
  const usr = `Real space-weather data for today (interpret the collective MOOD and EMOTIONAL IMPACT, don't recite numbers):
- Overall geomagnetic field: currently ${kpLevel} (Kp ${data.past_7_days?.current_kp}); this week's peak Kp ${data.past_7_days?.max_kp}; next 3 days expected peak Kp ${data.next_3_days?.forecast_max_kp ?? "unknown"}
- Sun: ${data.solar_flares_24h?.count || 0} flares in 24h (strongest ${data.solar_flares_24h?.max_class || "quiet"})
- Solar wind: ${data.solar_wind?.speed || "?"} km/s
- Moon: ${data.moon?.label?.[lang] || data.moon?.label?.en || "?"} phase, ${data.moon?.illumination}% lit
- Meteor shower: ${data.meteor?.active ? (lang === "tr" && data.meteor.nameTr ? data.meteor.nameTr : data.meteor.name) + (data.meteor.isPeak ? " peaking now" : " active") : "none active now"}
- Notable sky events & energy portals (HIGHEST PRIORITY — must mention if any, and MUST use the EXACT ${name} names/descriptions given here — do NOT translate them yourself and do NOT keep English names): ${data.notableEvents?.length ? data.notableEvents.map(ev => `[${ev.type}${ev.subtype ? "/"+ev.subtype : ""}] "${ev.name[lang] || ev.name.en}"${ev.isPeak ? " — TODAY IS PEAK" : ev.daysFromPeak < 0 ? ` (${-ev.daysFromPeak} days until peak)` : ` (${ev.daysFromPeak} days past peak)`}: ${ev.desc[lang] || ev.desc.en}`).join(" | ") : "none today"}
- Planet alignment/parade: ${data.planetGrouping ? `${data.planetGrouping.bodies.map(_pn).join(", ")} clustered within ${data.planetGrouping.arcDeg}° — ${data.planetGrouping.type}` : "no notable grouping today"}
- Planetary positions: ${planetSummary || "unavailable"}${retroPlanets.length ? "\n- Currently retrograde: " + retroPlanets.join(", ") : ""}

Today's opening perspective (use it in YOUR OWN words, do not translate it literally): ${angle}

Now write the collective sky-energy reading. Let us FEEL which energy the Earth is under today. For strong events (solar flares, geomagnetic storms), describe their emotional and spiritual impact — how they affect our dreams, emotions, sudden insights, and inner transformations. Make it heartfelt and touching.`;
  try {
    const r = await fetchWithTimeout("https://api.groq.com/openai/v1/chat/completions", 9000, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 700,
        temperature: 0.85,
        top_p: 0.92,
        messages: [{ role: "system", content: sys }, { role: "user", content: usr }],
      }),
    });
    const j = await r.json();
    const txt = _sanitizeSky(j?.choices?.[0]?.message?.content, lang);
    return txt || null;
  } catch { return null; }
}

// Süzgeç bir raporu reddederse HEMEN kısa şablon metne düşme — bir kez daha sor.
// Sızıntı rastgele (modelin o seferki kelime seçimi); ikinci deneme genelde temiz
// geliyor. Böylece kullanıcı uzun raporu çok daha sık görür.
async function generateSkyReportWithRetry(data, lang) {
  const first = await generateSkyReport(data, lang);
  if (first) return first;
  return await generateSkyReport(data, lang);
}

export const handler = async (event) => {
  const origin = event.headers?.origin || "";
  const originOk = isAllowedOrigin(origin);
  const cors = (originOk && origin) ? getCorsHeaders(origin) : {};

  if (event.httpMethod === "OPTIONS") {
    if (!originOk) return { statusCode: 403, body: "" };
    return { statusCode: 204, headers: cors, body: "" };
  }
  if (!originOk) {
    return { statusCode: 403, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Origin not allowed" }) };
  }
  const _ip = _getClientIP(event);
  if (_isRateLimited(_ip)) {
    return { statusCode: 429, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Too many requests" }) };
  }

  // 4 endpoint paralel — biri çökerse diğerleri gelir
  const [kpResult, fcResult, flareResult, windResult] = await Promise.allSettled([
    fetchWithTimeout("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json").then(r => r.json()),
    fetchWithTimeout("https://services.swpc.noaa.gov/text/3-day-forecast.txt").then(r => r.text()),
    fetchWithTimeout("https://services.swpc.noaa.gov/json/goes/primary/xray-flares-7-day.json").then(r => r.json()),
    fetchWithTimeout("https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json").then(r => r.json()),
  ]);

  try {
    // Past 7 days Kp index (3-hourly values). NOAA Kp servisi down olsa bile
    // FONKSİYON 502 DÖNMEZ — ay evresi, gezegenler, portallar ve meteorlar NOAA'ya
    // DEĞİL astronomy-engine'e dayanır. Kp yoksa jeomanyetik kısım "sakin" (Kp 0)
    // varsayılır, rapor yine üretilir. (Eski davranış: Kp fail → throw → 502 →
    // client'ta "Güneş verisi alınamadı" ekranı. NOAA SWPC sık sık kısa süreli
    // kesintiye girdiği için bu, kullanıcıya gereksiz hata gösteriyordu.)
    const rows = (kpResult.status === "fulfilled" && Array.isArray(kpResult.value))
      ? kpResult.value.slice(1)
      : [];
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const kpRecent = rows
      .filter(r => new Date(r[0]).getTime() >= sevenDaysAgo)
      .map(r => ({ time: r[0], kp: parseFloat(r[1]) }));

    // Daily max Kp (most relevant for energy interpretation)
    const dailyMax = {};
    for (const e of kpRecent) {
      const day = e.time.slice(0, 10);
      if (!dailyMax[day] || e.kp > dailyMax[day]) dailyMax[day] = e.kp;
    }
    const weeklyDays = Object.entries(dailyMax)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, kp]) => ({ day, kp, ...kpDescription(kp) }));

    const avgKp = kpRecent.length ? kpRecent.reduce((s, e) => s + e.kp, 0) / kpRecent.length : 0;
    const maxKp = kpRecent.length ? Math.max(...kpRecent.map(e => e.kp)) : 0;
    const currentKp = kpRecent.length ? kpRecent[kpRecent.length - 1].kp : 0;

    // 3-day forecast (opsiyonel)
    const forecastText = fcResult.status === "fulfilled" ? fcResult.value : "";
    const forecastKp = [];
    const fcMatch = forecastText.match(/NOAA Kp index breakdown[\s\S]{0,2000}/);
    if (fcMatch) {
      const lines = fcMatch[0].split("\n");
      for (const line of lines) {
        const m = line.match(/(\d{2}-\d{2}UT)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
        if (m) forecastKp.push({ slot: m[1], day1: parseFloat(m[2]), day2: parseFloat(m[3]), day3: parseFloat(m[4]) });
      }
    }
    const forecastMaxKp = forecastKp.length
      ? Math.max(...forecastKp.flatMap(f => [f.day1, f.day2, f.day3]))
      : null;

    // GÜNEŞ PATLAMALARI (son 24 saat) — opsiyonel
    let flares24h = { count: 0, max_class: null };
    if (flareResult.status === "fulfilled") {
      try {
        const fJson = flareResult.value;
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const recentFlares = (fJson || []).filter(f => f.max_time && new Date(f.max_time).getTime() >= dayAgo);
        const rank = { A: 1, B: 2, C: 3, M: 4, X: 5 };
        const ranked = recentFlares
          .map(f => ({ cls: f.max_class || f.begin_class, t: f.max_time }))
          .filter(f => f.cls);
        let top = null;
        for (const f of ranked) {
          const rk = rank[f.cls[0]?.toUpperCase()] || 0;
          if (!top || rk > (rank[top.cls[0]?.toUpperCase()] || 0)) top = f;
        }
        flares24h = { count: ranked.length, max_class: top?.cls || null, max_time: top?.t || null };
      } catch { /* sessiz geç */ }
    }

    // GÜNEŞ RÜZGARI (en güncel) — opsiyonel
    let solarWind = { speed: null, density: null };
    if (windResult.status === "fulfilled") {
      try {
        const wRows = windResult.value;
        const windRecent = wRows.slice(1).slice(-30);
        const valid = windRecent
          .map(r => ({ density: parseFloat(r[1]), speed: parseFloat(r[2]) }))
          .filter(r => isFinite(r.speed) && r.speed > 0);
        if (valid.length) {
          const last = valid[valid.length - 1];
          solarWind = { speed: Math.round(last.speed), density: Math.round(last.density * 10) / 10 };
        }
      } catch { /* sessiz geç */ }
    }

    // ── AY EVRESİ + GÖKTAŞI + GEZEGEN DİZİLİŞİ + ÖNEMLİ GÖK OLAYLARI ──
    const moon = moonPhase();
    const meteor = activeMeteorShower();
    let planets = [];
    try { planets = planetSky(); } catch { /* efemeris hatası — sessiz */ }
    // Kolektif geçiş notu (gökyüzü raporunun alt başlığı). Efemeris yoksa null.
    let transit = null;
    try { transit = transitNote(planets); } catch { /* sessiz */ }
    const notableEvents  = [...dynamicEclipseEvents(), ...activeComets(), ...activeEnergyPortals()];
    const planetGrouping = notablePlanetGrouping(planets);
    // Geriye dönük uyumluluk: eski 'comet' alanı (App.jsx henüz bunu okumuyordu; korunur)
    const _legacyComet = notableEvents.find(ev => ev.type === "comet");
    const comet = _legacyComet ? { active: true, name: _legacyComet.name.en } : { active: false };

    // ── HAVA DURUMU TARZI ANLATILAR — seviyeye göre seç ──
    const geoLevel   = maxKp >= 5 ? "storm" : maxKp >= 3 ? "unsettled" : "calm";
    const flareCls   = flares24h.max_class?.[0]?.toUpperCase();
    const flareLevel = flareCls === "X" ? "x" : flareCls === "M" ? "m" : flareCls === "C" ? "c" : "quiet";
    const windSpeed  = solarWind.speed;
    const windLevel  = windSpeed == null ? null : windSpeed >= 700 ? "storm" : windSpeed >= 500 ? "fast" : "calm";

    const narratives = {
      geo:    NARRATIVES["geo_" + geoLevel],
      flare:  NARRATIVES["flare_" + flareLevel],
      wind:   windLevel ? NARRATIVES["wind_" + windLevel] : null,
      moon:   NARRATIVES["moon_" + moon.phase],
      meteor: meteor.active ? fillMeteorName(NARRATIVES.meteor_active, meteor) : NARRATIVES.meteor_quiet,
    };

    // ── TEK BİRLEŞİK HAVA DURUMU RAPORU (kategoriler değil, akıcı tek metin) ──
    // Önemli olayları öne al, sakin günlerde sade bir gök raporu ver.
    const LANGS = ["tr", "en", "de", "es", "pt", "fr", "ja"];
    const report = {};
    for (const lang of LANGS) {
      const parts = [];
      if (flareLevel !== "quiet") parts.push(narratives.flare[lang]);          // önemli güneş patlaması öne
      parts.push(narratives.moon[lang]);                                       // ay her zaman
      if (geoLevel !== "calm") parts.push(narratives.geo[lang]);               // jeomanyetik (sakin değilse)
      if (windLevel && windLevel !== "calm") parts.push(narratives.wind[lang]);// rüzgâr (sakin değilse)
      if (meteor.active) parts.push(narratives.meteor[lang]);                  // göktaşı (aktifse)
      // Hiç önemli olay yoksa (sadece ay): sakin güneş + sakin gök ile tamamla
      if (parts.length === 1) {
        parts.unshift(narratives.flare[lang]);   // "Güneş sakin…"
        parts.push(narratives.meteor[lang]);     // "Gökyüzü sakin… dileğini hazırla"
      }
      report[lang] = parts.join(" ");
      // Template fallback'te de önemli gök olayları öne çıkar
      if (notableEvents.length) {
        const evNames = notableEvents.map(ev => ev.name[lang] || ev.name.en).join(" · ");
        report[lang] = evNames + " — " + report[lang];
      }
    }

    const summary = {
      generated_at: new Date().toISOString(),
      past_7_days: {
        avg_kp: Math.round(avgKp * 10) / 10,
        max_kp: maxKp,
        current_kp: currentKp,
        daily: weeklyDays,
      },
      next_3_days: {
        forecast_max_kp: forecastMaxKp,
        slots: forecastKp,
      },
      solar_flares_24h: flares24h,
      solar_wind: solarWind,
      moon,
      meteor,
      planets,
      transit,
      notableEvents,
      planetGrouping,
      comet,
      narratives,
      report,
      interpretation: {
        current: kpDescription(currentKp),
        week_peak: kpDescription(maxKp),
        forecast_peak: forecastMaxKp !== null ? kpDescription(forecastMaxKp) : null,
        flares: flareDescription(flares24h.max_class),
        wind: windDescription(solarWind.speed),
      },
    };

    // ── ÖZGÜN AI GÖKYÜZÜ RAPORU (kolektif, seçili dilde) — başarısızsa template fallback ──
    const lang = (() => {
      const l = event.queryStringParameters?.lang;
      return _SKY_LANG_NAMES[l] ? l : "en";
    })();
    const aiReport = await generateSkyReportWithRetry(summary, lang);
    if (aiReport) summary.aiReport = aiReport;

    return {
      statusCode: 200,
      // AI raporu kolektif + günlük → 6 saat cache (Groq çağrısını seyrelt). Dil query'sine göre ayrı cache.
      headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "public, max-age=21600" },
      body: JSON.stringify(summary),
    };
  } catch (e) {
    return {
      statusCode: 502,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "NOAA verisine erişilemedi: " + e.message }),
    };
  }
};
