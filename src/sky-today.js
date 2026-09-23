// "YILDIZLAR BUGÜN SANA NE DİYOR?" (Bugün ekranı)
// ---------------------------------------------------------------------------
// Bugünkü gezegen konumlarını kişinin NATAL haritasıyla kıyaslayan
// deterministik transit motoru. AI YOK: klasik açı geometrisi + ev temaları.
// Her gün değişir, yani her gün geri gelmek için bir sebep.
//
// KAYNAK: apps/soulid/lib/astrology/transits.ts + index.ts (Ruh Profili'ndeki
// "Bugünün Gökyüzü" kartları). Hesap BİREBİR aynı tutuldu: yükselen formülü
// (flatlib/Swiss), eşit ev + 10. ev MC, aynı açı/orb tablosu, aynı sıralama.
// Böylece kullanıcı Ruh Profili'nde ve Bugün'de aynı "Ay 4. evinde" cümlesini
// görür. Türkçe metinler SoulID ile aynı; SoulID yalnızca tr/en olduğu için
// de/es/pt/fr/ja burada yazıldı.
//
// ⚠️ DİĞER DİLLERDE KALIP: "Gökyüzü bugün: <hedef> için destek, <tema> ile."
// Fiil uyumu (tekil/çoğul, cinsiyet, de/fr/pt edat birleşmeleri: du, pelo, al)
// yerleştirilen isim öbeğine göre bozulmasın diye cümleler bilerek iki noktalı,
// çekimsiz yapıda. Bir öbek eklerken edatın önüne gelen kelimeyi kontrol et.
//
// astronomy-engine DİNAMİK import (hd-transit.js ile aynı chunk), ana bundle
// büyümez.

let _engine = null;
async function engine() {
  if (!_engine) _engine = await import("astronomy-engine");
  return _engine;
}

const norm = (d) => { let x = d % 360; if (x < 0) x += 360; return x; };

function eclLon(A, key, date) {
  const t = A.MakeTime(date);
  if (key === "Moon") return norm(A.EclipticGeoMoon(t).lon);
  return norm(A.Ecliptic(A.GeoVector(A.Body[key], t, true)).elon);
}
function obliquity(A, date) {
  const JD = A.MakeTime(date).tt + 2451545.0;
  const T = (JD - 2451545.0) / 36525;
  const eps = 23.43929111 - (46.8150 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600;
  return (eps * Math.PI) / 180;
}
function ramcDeg(A, date, lon) {
  const lst = (A.SiderealTime(A.MakeTime(date)) + lon / 15) * 15;
  return ((lst % 360) + 360) % 360;
}
function ascendant(A, date, lat, lon) {
  const r = (ramcDeg(A, date, lon) * Math.PI) / 180, e = obliquity(A, date), phi = (lat * Math.PI) / 180;
  return norm((Math.atan2(Math.cos(r), -(Math.sin(r) * Math.cos(e) + Math.tan(phi) * Math.sin(e))) * 180) / Math.PI);
}
function midheaven(A, date, lon) {
  const r = (ramcDeg(A, date, lon) * Math.PI) / 180, e = obliquity(A, date);
  return norm((Math.atan2(Math.sin(r), Math.cos(r) * Math.cos(e)) * 180) / Math.PI);
}
function houses(asc, mc) {
  const h = [];
  for (let i = 0; i < 12; i++) h.push(norm(asc + i * 30));
  h[9] = mc;
  return h;
}
function moonHouse(moonLon, hs) {
  for (let i = 0; i < 12; i++) {
    const s = norm(hs[i]), e = norm(hs[(i + 1) % 12]);
    const inside = s < e ? moonLon >= s && moonLon < e : moonLon >= s || moonLon < e;
    if (inside) return i + 1;
  }
  return 1;
}

const ASPECTS = [
  { name: "conj", angle: 0, orb: 6, tone: "blend" },
  { name: "sextile", angle: 60, orb: 4, tone: "flow" },
  { name: "square", angle: 90, orb: 5, tone: "tension" },
  { name: "trine", angle: 120, orb: 5, tone: "flow" },
  { name: "opposition", angle: 180, orb: 6, tone: "tension" },
];
function aspectBetween(a, b) {
  let diff = Math.abs(norm(a) - norm(b));
  if (diff > 180) diff = 360 - diff;
  for (const asp of ASPECTS) if (Math.abs(diff - asp.angle) <= asp.orb) return { ...asp, exact: Math.abs(diff - asp.angle) };
  return null;
}

const TRANSIT_KEYS = ["Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
const GLYPH = { Moon: "☽", Sun: "☉", Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄" };

// ── METİNLER ────────────────────────────────────────────────────────────────
// theme: transit gezegenin teması (cümle içi), label: başlık biçimi.
const THEME = {
  tr: { Moon:"duyguların", Sun:"öz kimliğin", Mercury:"zihnin ve iletişimin", Venus:"sevgi ve değerlerin", Mars:"enerjin ve arzun", Jupiter:"şansın ve genişlemen", Saturn:"disiplinin ve sınavların" },
  en: { Moon:"your emotions", Sun:"your core self", Mercury:"your mind and words", Venus:"love and your values", Mars:"your drive and desire", Jupiter:"luck and growth", Saturn:"discipline and lessons" },
  de: { Moon:"deinen Gefühlen", Sun:"deinem innersten Selbst", Mercury:"deinem Denken und deinen Worten", Venus:"der Liebe und deinen Werten", Mars:"deinem Antrieb und deinem Verlangen", Jupiter:"Glück und Wachstum", Saturn:"Disziplin und Lektionen" },
  es: { Moon:"tus emociones", Sun:"tu yo esencial", Mercury:"tu mente y tus palabras", Venus:"el amor y tus valores", Mars:"tu impulso y tu deseo", Jupiter:"la suerte y el crecimiento", Saturn:"la disciplina y las lecciones" },
  pt: { Moon:"as tuas emoções", Sun:"o teu eu essencial", Mercury:"a tua mente e as tuas palavras", Venus:"o amor e os teus valores", Mars:"o teu impulso e o teu desejo", Jupiter:"a sorte e o crescimento", Saturn:"a disciplina e as lições" },
  fr: { Moon:"tes émotions", Sun:"ton moi profond", Mercury:"ton esprit et tes mots", Venus:"l'amour et tes valeurs", Mars:"ton élan et ton désir", Jupiter:"la chance et la croissance", Saturn:"la discipline et les leçons" },
  ja: { Moon:"感情", Sun:"本来の自分", Mercury:"思考と言葉", Venus:"愛と価値観", Mars:"意欲と欲求", Jupiter:"幸運と成長", Saturn:"規律と学び" },
};
const LABEL = {
  en: { Moon:"Emotions", Sun:"Core self", Mercury:"Mind & words", Venus:"Love & values", Mars:"Drive & desire", Jupiter:"Luck & growth", Saturn:"Discipline & lessons" },
  de: { Moon:"Gefühle", Sun:"Inneres Selbst", Mercury:"Denken & Worte", Venus:"Liebe & Werte", Mars:"Antrieb & Verlangen", Jupiter:"Glück & Wachstum", Saturn:"Disziplin & Lektionen" },
  es: { Moon:"Emociones", Sun:"Yo esencial", Mercury:"Mente y palabras", Venus:"Amor y valores", Mars:"Impulso y deseo", Jupiter:"Suerte y crecimiento", Saturn:"Disciplina y lecciones" },
  pt: { Moon:"Emoções", Sun:"Eu essencial", Mercury:"Mente e palavras", Venus:"Amor e valores", Mars:"Impulso e desejo", Jupiter:"Sorte e crescimento", Saturn:"Disciplina e lições" },
  fr: { Moon:"Émotions", Sun:"Moi profond", Mercury:"Esprit et mots", Venus:"Amour et valeurs", Mars:"Élan et désir", Jupiter:"Chance et croissance", Saturn:"Discipline et leçons" },
  ja: { Moon:"感情", Sun:"本来の自分", Mercury:"思考と言葉", Venus:"愛と価値観", Mars:"意欲と欲求", Jupiter:"幸運と成長", Saturn:"規律と学び" },
};
const TONE_WORD = {
  en: { up:"supported", down:"tested" },
  de: { up:"gestärkt", down:"geprüft" },
  es: { up:"con apoyo", down:"a prueba" },
  pt: { up:"com apoio", down:"em teste" },
  fr: { up:"en soutien", down:"à l'épreuve" },
  ja: { up:"追い風", down:"試練" },
};
const TARGET = {
  tr: { Sun:"kimliğine", Moon:"iç dünyana", Venus:"ilişkilerine", Mars:"hedeflerine", Ascendant:"dışa yansıttığın yüzüne" },
  en: { Sun:"your identity", Moon:"your inner world", Venus:"your relationships", Mars:"your goals", Ascendant:"the face you show the world" },
  de: { Sun:"deine Identität", Moon:"deine innere Welt", Venus:"deine Beziehungen", Mars:"deine Ziele", Ascendant:"das Gesicht, das du der Welt zeigst" },
  es: { Sun:"tu identidad", Moon:"tu mundo interior", Venus:"tus relaciones", Mars:"tus metas", Ascendant:"la cara que muestras al mundo" },
  pt: { Sun:"a tua identidade", Moon:"o teu mundo interior", Venus:"as tuas relações", Mars:"os teus objetivos", Ascendant:"o rosto que mostras ao mundo" },
  fr: { Sun:"ton identité", Moon:"ton monde intérieur", Venus:"tes relations", Mars:"tes objectifs", Ascendant:"le visage que tu montres au monde" },
  ja: { Sun:"アイデンティティ", Moon:"内面の世界", Venus:"人間関係", Mars:"目標", Ascendant:"周りに見せる顔" },
};
function aspectBody(lang, th, tg, tone) {
  switch (lang) {
    case "tr": {
      const f = tone === "flow" ? `${tg} akışkan bir destek veriyor, kapıyı zorlamadan aç.`
        : tone === "tension" ? `${tg} bir gerilim taşıyor: sürtünme büyütür, kaçma.`
        : `${tg} dolaysız değiyor: netlik ânı.`;
      return `Gökyüzünde ${th} ${f}`;
    }
    case "de": return tone === "flow" ? `Himmel heute: Rückenwind für ${tg}, getragen von ${th}. Öffne die Tür, ohne zu drängen.`
      : tone === "tension" ? `Himmel heute: Reibung rund um ${tg}, ausgelöst von ${th}. Die Spannung lässt dich wachsen, weich ihr nicht aus.`
      : `Himmel heute: ein direkter Impuls für ${tg}, von ${th}. Ein Moment der Klarheit.`;
    case "es": return tone === "flow" ? `Cielo de hoy: un impulso a favor de ${tg}, llevado por ${th}. Abre la puerta sin forzarla.`
      : tone === "tension" ? `Cielo de hoy: fricción sobre ${tg}, avivada por ${th}. La tensión te hace crecer, no la evites.`
      : `Cielo de hoy: un toque directo sobre ${tg}, desde ${th}. Un momento de claridad.`;
    case "pt": return tone === "flow" ? `Céu de hoje: vento a favor para ${tg}, com ${th} a ajudar. Abre a porta sem forçar.`
      : tone === "tension" ? `Céu de hoje: fricção sobre ${tg}, com ${th} em jogo. A tensão faz-te crescer, não fujas dela.`
      : `Céu de hoje: um toque direto para ${tg}, com ${th}. Um momento de clareza.`;
    case "fr": return tone === "flow" ? `Ciel du jour : un vent porteur pour ${tg}, grâce à ${th}. Ouvre la porte sans forcer.`
      : tone === "tension" ? `Ciel du jour : une friction pour ${tg}, attisée par ${th}. La tension te fait grandir, ne l'évite pas.`
      : `Ciel du jour : un contact direct pour ${tg}, venu de ${th}. Un moment de clarté.`;
    case "ja": return tone === "flow" ? `今日の空：${th}が${tg}を後押し。無理せず扉を開こう。`
      : tone === "tension" ? `今日の空：${th}と${tg}の間に摩擦。緊張はあなたを成長させる、避けないで。`
      : `今日の空：${th}が${tg}に直接触れる。明晰さの瞬間。`;
    default: return tone === "flow" ? `Sky today: a tailwind for ${tg}, carried by ${th}. Open the door without forcing it.`
      : tone === "tension" ? `Sky today: friction around ${tg}, stirred by ${th}. The tension grows you, so don't avoid it.`
      : `Sky today: a direct touch on ${tg} from ${th}. A moment of clarity.`;
  }
}
function aspectTitle(lang, key, tone) {
  const up = tone !== "tension";
  if (lang === "tr") { const s = THEME.tr[key]; return `${s.charAt(0).toLocaleUpperCase("tr")}${s.slice(1)} ${up ? "destekleniyor" : "sınanıyor"}`; }
  const L = LABEL[lang] || LABEL.en, W = TONE_WORD[lang] || TONE_WORD.en;
  return `${L[key]}${lang === "ja" ? "：" : lang === "fr" ? " : " : ": "}${up ? W.up : W.down}`;
}

const FOCUS_TITLE = { tr:"Günün Odağı", en:"Today's Focus", de:"Fokus des Tages", es:"Foco del día", pt:"Foco do dia", fr:"Focus du jour", ja:"今日の焦点" };
const HOUSE_FOCUS = {
  tr: ["kendine ve görünüşüne","para, değer ve güvenliğe","iletişim, kardeşler ve kısa yolculuklara","ev, aile ve köklere","yaratıcılık, aşk ve oyuna","iş, sağlık ve rutinlere","ilişkiler ve ortaklıklara","derin bağ, dönüşüm ve paylaşıma","anlam, öğrenme ve uzak ufuklara","kariyer ve topluma","arkadaşlar, gruplar ve umutlara","dinlenme, rüya ve içe dönüşe"],
  en: ["yourself and how you appear","money, worth and security","communication and short trips","home, family and roots","creativity, romance and play","work, health and routines","relationships and partnerships","deep bonds and transformation","meaning, learning and horizons","career and public life","friends, groups and hopes","rest, dreams and retreat"],
  de: ["dich selbst und deine Wirkung","Geld, Wert und Sicherheit","Kommunikation und kurze Wege","Zuhause, Familie und Wurzeln","Kreativität, Liebe und Spiel","Arbeit, Gesundheit und Routinen","Beziehungen und Partnerschaften","tiefe Bindungen und Wandlung","Sinn, Lernen und Horizonte","Beruf und Öffentlichkeit","Freunde, Gruppen und Hoffnungen","Ruhe, Träume und Rückzug"],
  es: ["ti y tu imagen","dinero, valor y seguridad","comunicación y viajes cortos","hogar, familia y raíces","creatividad, amor y juego","trabajo, salud y rutinas","relaciones y alianzas","vínculos profundos y transformación","sentido, aprendizaje y horizontes","carrera y vida pública","amigos, grupos y esperanzas","descanso, sueños y recogimiento"],
  pt: ["ti e a tua imagem","dinheiro, valor e segurança","comunicação e viagens curtas","casa, família e raízes","criatividade, amor e diversão","trabalho, saúde e rotinas","relações e parcerias","laços profundos e transformação","sentido, aprendizagem e horizontes","carreira e vida pública","amigos, grupos e esperanças","descanso, sonhos e recolhimento"],
  fr: ["toi-même et ton image","l'argent, la valeur et la sécurité","la communication et les courts trajets","la maison, la famille et les racines","la créativité, l'amour et le jeu","le travail, la santé et les routines","les relations et les partenariats","les liens profonds et la transformation","le sens, l'apprentissage et les horizons","la carrière et la vie publique","les amis, les groupes et les espoirs","le repos, les rêves et le retrait"],
  ja: ["自分自身と見た目","お金・価値・安心","コミュニケーションと近場の移動","家・家族・ルーツ","創造性・恋・遊び","仕事・健康・日課","人間関係とパートナーシップ","深い絆と変容","意味・学び・遠い地平","キャリアと社会","友人・仲間・希望","休息・夢・内省"],
};
function focusBody(lang, n, f) {
  switch (lang) {
    case "tr": return `Bugün Ay senin ${n}. evinde: dikkatin ${f} çekiliyor. Bu alanda küçük bir jest bugün büyük hissettirir.`;
    case "de": return `Heute steht der Mond in deinem ${n}. Haus: deine Aufmerksamkeit richtet sich auf ${f}. Eine kleine Geste wirkt hier heute groß.`;
    case "es": return `Hoy la Luna está en tu casa ${n}: tu atención se dirige hacia ${f}. Un pequeño gesto aquí se siente grande hoy.`;
    case "pt": return `Hoje a Lua está na tua casa ${n}: a tua atenção vira-se para ${f}. Um pequeno gesto aqui pesa muito hoje.`;
    case "fr": return `Aujourd'hui, la Lune est dans ta maison ${n} : ton attention se tourne vers ${f}. Un petit geste ici compte beaucoup aujourd'hui.`;
    case "ja": return `今日、月はあなたの第${n}ハウスに。意識が${f}へ向かう。ここでの小さな行動が今日は大きく響く。`;
    default: { const o = n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
      return `The Moon is in your ${n}${o} house today: your attention turns to ${f}. A small gesture here lands big.`; }
  }
}

/**
 * @param {{ birthUtcMs:number, lat:number|null, lon:number|null, timeKnown:boolean }} natal
 *   timeKnown=false: saat ya da şehir bilinmiyor. Yükselen/ev hesabı güvenilmez,
 *   "Günün Odağı" (ev) ve Yükselen açıları atlanır, yerine 3 açı gösterilir.
 * @returns {Promise<Array<{id,glyph,title,body,tone}>>}
 */
export async function computeSkyToday(natal, date = new Date(), lang = "tr") {
  const A = await engine();
  const L = THEME[lang] ? lang : "en";
  const birth = new Date(natal.birthUtcMs);
  const trans = TRANSIT_KEYS.map((key) => ({ key, lon: eclLon(A, key, date) }));
  const natalLon = (k) => eclLon(A, k, birth);
  const useHouses = natal.timeKnown && natal.lat != null && natal.lon != null;
  const asc = useHouses ? ascendant(A, birth, natal.lat, natal.lon) : null;

  const targets = [
    { key: "Sun", lon: natalLon("Sun") },
    { key: "Moon", lon: natalLon("Moon") },
    { key: "Venus", lon: natalLon("Venus") },
    { key: "Mars", lon: natalLon("Mars") },
    ...(useHouses ? [{ key: "Ascendant", lon: asc }] : []),
  ];
  const out = [];
  if (useHouses) {
    const hs = houses(asc, midheaven(A, birth, natal.lon));
    const mh = moonHouse(trans[0].lon, hs);
    out.push({ id: `moon-h${mh}`, glyph: "☽", title: FOCUS_TITLE[L], body: focusBody(L, mh, HOUSE_FOCUS[L][mh - 1]), tone: "blend" });
  }
  const found = [];
  for (const tr of trans) {
    if (tr.key === "Moon") continue;
    for (const tg of targets) {
      const asp = aspectBetween(tr.lon, tg.lon);
      if (!asp) continue;
      found.push({
        id: `${tr.key}-${asp.name}-${tg.key}`,
        glyph: GLYPH[tr.key],
        title: aspectTitle(L, tr.key, asp.tone),
        body: aspectBody(L, THEME[L][tr.key], TARGET[L][tg.key], asp.tone),
        tone: asp.tone,
        exact: asp.exact,
      });
    }
  }
  found.sort((a, b) => a.exact - b.exact);
  // HER TRANSİT GEZEGENDEN EN FAZLA BİR KART. SoulID'de bu filtre yok ve aynı
  // gezegen iki hedefe açı yapınca aynı başlıklı iki kart üst üste çıkıyordu
  // ("Zihnin ve iletişimin sınanıyor" x2), tekrar gibi duruyordu. Bilinçli
  // küçük sapma: hesap aynı, yalnızca gösterilen kart seçimi çeşitlendi.
  const seen = new Set(), picked = [];
  for (const f of found) {
    const body = f.id.split("-")[0];
    if (seen.has(body)) continue;
    seen.add(body); picked.push(f);
    if (picked.length >= (useHouses ? 2 : 3)) break;
  }
  for (const f of picked) { const { exact, ...rest } = f; out.push(rest); }
  return out;
}
