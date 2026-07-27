import { Body, GeoVector, Ecliptic, EclipticGeoMoon, SunPosition } from "astronomy-engine";

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

// ── KUYRUKLU YILDIZLAR (notable — perihelion/görünürlük penceresi, en iyi çaba) ──
// Sporadik olduğu için statik; pencere dışındaysa rapora girmez. Güncellenebilir.
const COMETS = [
  { name:"12P/Pons-Brooks",        start:[2024,3,1],  end:[2024,5,10] },
  { name:"C/2023 A3 (Tsuchinshan-ATLAS)", start:[2024,9,27], end:[2024,10,25] },
  { name:"C/2024 G3 (ATLAS)",      start:[2025,1,10], end:[2025,1,25] },
];
function activeComet(date = new Date()) {
  const t = date.getTime();
  for (const c of COMETS) {
    const s = Date.UTC(c.start[0], c.start[1]-1, c.start[2]);
    const e = Date.UTC(c.end[0], c.end[1]-1, c.end[2]);
    if (t >= s && t <= e) return { active: true, name: c.name };
  }
  return { active: false };
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
    // LATİN HARFLİ YABANCI KELİME SIZINTISI. Canlıda görüldü:
    // "...sanki world'in enerji alanını..." — Latin-dışı süzgeç bunu yakalamaz.
    // KESİN KURAL: Türk alfabesinde q, w, x HARFLERİ YOKTUR. Küçük harfle
    // başlayan bir kelimede bunlardan biri geçiyorsa kelime Türkçe DEĞİLDİR.
    // Büyük harfle başlayanlar muaf — özel adlar meşru olabilir (ör. ocak
    // ayında prompt'a giren "Quadrantid" göktaşı yağmuru).
    const foreign = t.match(/\b\p{Ll}[\p{L}'’]*\b/gu) || [];
    const bad = foreign.find(w => /[qwx]/i.test(w));
    if (bad) {
      console.warn("[sky] latin-harfli yabanci kelime, rapor reddedildi:", bad, "|", t.slice(0, 100));
      return null;   // → şablon metne düş
    }
    // SADECE Türkçe: fr/pt'de à/è/ù meşru harflerdir, onlara dokunma.
    t = t.replace(/à/g, "a").replace(/è/g, "e").replace(/ì/g, "i").replace(/ò/g, "o").replace(/ù/g, "u");
    t = t.replace(/\bprocent\b/gi, "yüzde").replace(/\bpercent\b/gi, "yüzde").replace(/\bprozent\b/gi, "yüzde");
  }
  return t;
}
async function generateSkyReport(data, lang) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  const name = _SKY_LANG_NAMES[lang] || "English";
  const kpLevel = data.interpretation?.current?.en || "calm";
  const dayOfYear = Math.floor((Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 0)) / 86400000);
  const angle = _SKY_ANGLES[dayOfYear % _SKY_ANGLES.length];
  const sys = `You are Sakin's sky-weather voice — warm, sincere, lightly poetic, never clichéd. Write a COLLECTIVE daily reading of the shared sky and, above all, the ENERGY FIELD the whole Earth is moving through right now. This is NOT personal astrology and NOT about any single person. NEVER mention zodiac signs, houses, or which planet sits in which sign — ordinary people don't relate to that and it bores them; leave all of it out completely.

Your job: from the REAL space-weather data below, let the reader roughly FEEL which energy the world is under today — is the field calm and clear, lightly charged, or stormy and intense? Then weave in only the sky developments that genuinely stand out today (a strong solar flare, a geomagnetic storm, fast solar wind, the Moon's phase, an active meteor shower, a visible comet) — and skip the quiet ones. Speak to "we" / "the world" like someone who looked up and is sincerely telling a friend what the sky feels like and how its energy might be touching us all.

LANGUAGE PURITY — ABSOLUTE RULE: write ENTIRELY in ${name}, using ONLY ${name} vocabulary and orthography. Never mix in words or spellings from ANY other language — no English, Dutch, Romanian, French leaks (words like "procent", "dàn", "percent" are FORBIDDEN${lang === "tr" ? '; in Turkish say "yüzde", and the only accented vowels that exist are â, î, û' : ""}). If you are unsure of a word, choose a simpler native one.

NO FORMULAS: never open with stock phrases ("Dünyamız bugün", "Bugün gökyüzü", "Today the world", or their equivalents). Each day's reading must have a genuinely different first sentence and rhythm — nothing memorized-sounding. 3 to 5 flowing sentences, prose only — no bullet points, no headings, no listing of raw numbers. Never give medical or financial advice. The proper noun "Sakin" stays untranslated.`;
  const usr = `Real space-weather data for today (interpret the collective MOOD, don't recite numbers):
- Overall geomagnetic field: currently ${kpLevel} (Kp ${data.past_7_days?.current_kp}); this week's peak Kp ${data.past_7_days?.max_kp}; next 3 days expected peak Kp ${data.next_3_days?.forecast_max_kp ?? "unknown"}
- Sun: ${data.solar_flares_24h?.count || 0} flares in 24h (strongest ${data.solar_flares_24h?.max_class || "quiet"})
- Solar wind: ${data.solar_wind?.speed || "?"} km/s
- Moon: ${data.moon?.label?.en || "?"} phase, ${data.moon?.illumination}% lit
- Meteor shower: ${data.meteor?.active ? data.meteor.name + (data.meteor.isPeak ? " peaking now" : " active") : "none active now"}
- Comet: ${data.comet?.active ? data.comet.name + " visible" : "none notable now"}

Today's opening perspective (use it in YOUR OWN words, do not translate it literally): ${angle}

Now write the collective sky-energy reading: let us sense which energy the Earth is under today, then mention only what truly stands out.`;
  try {
    const r = await fetchWithTimeout("https://api.groq.com/openai/v1/chat/completions", 9000, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 500,
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
    // Past 7 days Kp index (3-hourly values) — bu ana veri, fail olursa 502
    if (kpResult.status !== "fulfilled") {
      throw new Error("Kp data unavailable: " + (kpResult.reason?.message || "unknown"));
    }
    const kpRaw = kpResult.value;
    const rows = kpRaw.slice(1);
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

    // ── AY EVRESİ + GÖKTAŞI + GEZEGEN DİZİLİŞİ + KUYRUKLU YILDIZ ──
    const moon = moonPhase();
    const meteor = activeMeteorShower();
    let planets = [];
    try { planets = planetSky(); } catch { /* efemeris hatası — sessiz */ }
    // Kolektif geçiş notu (gökyüzü raporunun alt başlığı). Efemeris yoksa null.
    let transit = null;
    try { transit = transitNote(planets); } catch { /* sessiz */ }
    const comet = activeComet();

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
    const aiReport = await generateSkyReport(summary, lang);
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
