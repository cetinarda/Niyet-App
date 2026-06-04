import { HumanDesignChart } from './humanDesign';
import { CENTERS, CenterKey } from '../data/centers';
import { GATES } from '../data/gates';
import { TYPES, HDType } from '../data/types';
import { AUTHORITIES, AuthorityKey } from '../data/authorities';
import { LINES, PROFILES } from '../data/profiles';

// =============================================================
// ISO hafta — haftalık deterministik rotasyon
// =============================================================
export function isoWeek(d: Date): { year: number; week: number; index: number } {
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  const year = target.getUTCFullYear();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay()) + 7) % 7);
  }
  const week = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  const index = year * 53 + week;
  return { year, week, index };
}

function pick<T>(arr: T[], idx: number): T {
  if (arr.length === 0) throw new Error('pick from empty');
  return arr[((idx % arr.length) + arr.length) % arr.length];
}

// =============================================================
// Tip aura uyumluluğu
// =============================================================
const AURA_COMPATIBILITY: Record<HDType, { gets: string[]; tension: string[]; note: string }> = {
  'Manifestor': {
    gets: [
      'Jeneratör ve Manifesting Jeneratörler — sarmalayıcı aura senin başlatma kıvılcımına yer açar',
      'Projektör — derin görüsüyle yönünü onaylar (eğer onu davet ediyorsan)',
      'Sınırına saygı duyan, "neden?" demeden bildirim alabilen yetişkin tipler',
    ],
    tension: [
      'Başka bir Manifestor — iki itici aura, alan kavgası kaçınılmaz',
      'Seni kontrol etmeye çalışan ya da izin isteten çevre',
      'Sınırlanmaktan çok hızlı tetiklenen Reflektör — aurasındaki itme yansır',
    ],
    note: 'Aurası karşıdakini iter; bilgilendirme aurayı yumuşatır.',
  },
  'Jeneratör': {
    gets: [
      'Diğer Jeneratör/MG — paralel motorlar; iki sakral aynı işe verirse muazzam üretim çıkar',
      'Projektör — sakral yanıtını okur ve doğru soruyu sorar',
      'Sözünü tutan, "asıl ne istiyorsun?" diye sorabilen insanlar',
    ],
    tension: [
      'Sana açık uçlu sorular soran ve evet/hayır verme alanı bırakmayan kişiler',
      'Sevmediğin işe seni iten zayıf sınırlı arkadaşlar',
      'Hayal kırıklığını tetikleyen "fikirlerine kapılan" kişiler — sakral değil, kafa bağlantısı kurar',
    ],
    note: 'Aurası sarmalayıcı; insanları içine alır, doyurmak için değil yanıtlamak için.',
  },
  'Manifesting Jeneratör': {
    gets: [
      'Jeneratörler — paralel ritim',
      'Hızını kabul eden Projektör — sana doğru çağrıyı yapar',
      'Çok yönlülüğünü hafiflik olarak gören insanlar',
    ],
    tension: [
      'Tek odaklı, "şunu bitir önce" diyenler — atlama hediyesini görmeyenler',
      'Bilgilendirilmediği için "neden bana sormadın?" diyen yakınlar — bildirme stratejini atlama',
      'Sana yavaşlaman gerektiğini söyleyen kişiler',
    ],
    note: 'Sarmalayıcı aura + manifestasyon enerjisi; bildirim aurayı yumuşatır.',
  },
  'Projektör': {
    gets: [
      'Jeneratör ve Manifesting Jeneratör — aurasından doğal olarak beslenirsin; yakınında dolarsın',
      'Senin görüşünü davet eden, ne yapacağını sormayan kişiler',
      'Senin enerjisel sınırlarına saygı duyan yetişkinler — kalabalıktan korumak isteyenler',
    ],
    tension: [
      'Başka bir Projektör — iki yönlendirici, "kim kimi davet edecek?" gerilimi',
      'Manifestor — itici aurası seni "şimdi mi sormalıyım?" gerilimine sokar',
      'Davet etmediği halde tavsiye almaya gelen tipler — acılık tetikleyici',
    ],
    note: 'Aurası odaklı ve nüfuz edici; karşındakini derinlemesine okur. Bu görü ancak davet edildiğinde değer kazanır.',
  },
  'Reflektör': {
    gets: [
      'Sağlıklı, kendi merkezinde duran insanlar — onlar sende parlar',
      'Seni karar için sıkıştırmayan, 28 günü beklemene izin veren sevdikler',
      'Çeşitli aurelara sahip dengeli topluluklar — tek bir enerjiye yapışıp kalmayan',
    ],
    tension: [
      'Yoğun, baskıcı aurada olan bir tek kişiyle uzun temas — örnekler ve aşar',
      'Kararını hızlandırmaya çalışan, "şimdi söyle" diyen insanlar',
      'Sağlıksız ortam (mekan, oda, ev) — her şeyden önce mekan',
    ],
    note: 'Aurası örnekleyici ve geçirgen; çevresinin enerjisini içine alır ve aynalar.',
  },
};

// =============================================================
// Yetki bazında "bedeni dinleme" rehberi
// =============================================================
const BODY_LISTENING: Record<AuthorityKey, { howToFeel: string; whereInBody: string; redFlag: string; reset: string }> = {
  emotional: {
    howToFeel: 'Karar karşısında anında "evet" / "hayır" deme; bir kaç gün boyunca aynı kararı farklı duygu durumlarında hisset.',
    whereInBody: 'Karın boşluğu, göğüs ortası — duygu dalgasının yükseldiği ve indiği yerler. Solar plexus bölgesinde ağırlık ya da hafifleme.',
    redFlag: 'Heyecanın doruğunda "evet" dediğin ya da çöküntünün dibinde "asla" dediğin anlar.',
    reset: 'Yatakta uyu, dalga durulur. Sabah aynı karara bak — duygun aynıysa o doğru karardır.',
  },
  sacral: {
    howToFeel: 'Karşına çıkan şeye anlık beden tepkin: göğüsten "uh-huh" (yukarı/açılan) ya da "un-uh" (aşağı/kapanan) sesi.',
    whereInBody: 'Karın derinleri ve göğüs alt bölgesi — sakral seste duyulur, hatta sesli çıkar.',
    redFlag: 'Beynin gerekçeleri sakral yanıtın yerini aldıysa, yorgunluk gelir.',
    reset: 'Bedenini gerçek anlamda yor; akşam yatmadan önce sakral boşalsın. Yanıtın gelmediğinde "şu an karar yok" demek meşrudur.',
  },
  splenic: {
    howToFeel: 'Anlık, sessiz, tekrar etmez sezgi. İlk fısıltıyı yakala; ikinciye gelmez.',
    whereInBody: 'Dalakta (sol kaburga altı) hafif gerilim ya da gevşeme, koltuk altı/lenf bölgesinde ürperti, kulakta hafif çınlama, burunda ani bir koku şüphesi — sezginin somut bedensel sinyalleri.',
    redFlag: 'Gürültü, kalabalık, çok kararı bir araya getirmek splenik sesi bastırır. Geç fark ettiğin "ben aslında biliyordum" pişmanlıkları.',
    reset: 'Sessiz mekana çık. Tek bir karara odaklan. İlk içsel sinyal geldiğinde derhal harekete geç — ertelersen kaybolur.',
  },
  ego: {
    howToFeel: 'Kararı duyarken kalbinden ne çıkıyor: "ben istiyorum mu?" sorusuna sesli yanıt ver, ağzından çıkana kulak ver.',
    whereInBody: 'Göğüs orta — kalp ve timus bölgesi. İstemediğinde göğüste daralma; istediğinde genişleme.',
    redFlag: 'Başkasını mutlu etmek için söz vermek; sonra kalbinde "ah keşke" yorgunluğu.',
    reset: 'Sözünü tutmamayı bir kez göze al. Kalp kası dinlenmek de ister.',
  },
  'self-projected': {
    howToFeel: 'Güvendiğin bir dostla yüksek sesle konuş. Konuşurken sesinin tonu, hızı ve nefes ritmindeki değişimi gözle.',
    whereInBody: 'Boğaz ve ses telleri — yanlış yönde konuşurken sıkışma; doğru yönde rahatlama ve genişleme.',
    redFlag: 'İçinden konuşmakla yetinmek; ses çıkmadan karar vermek.',
    reset: 'Bir dostuna telefon aç. Karşının tavsiye vermesini değil, dinlemesini iste. Senin sesin yetkidir.',
  },
  mental: {
    howToFeel: 'Tek başına karar verme; doğru insan + doğru mekan kombinasyonunda netliğin açılır.',
    whereInBody: 'Sabit bedensel sinyal yok — bu yüzden bedensel değil, çevresel okumayı öğreneceksin.',
    redFlag: 'Tek başına oturup zihnin saatlerce dönüyorsa karar oradan çıkmaz.',
    reset: 'Birden fazla güvendiğin sesle aynı konuyu tekrar tekrar konuş. Mekanı değiştir — banka, parka, sahile götür kararı.',
  },
  lunar: {
    howToFeel: '28 günlük tam ay döngüsü boyunca kararı farklı insanlarla, farklı günlerde, farklı ruh hallerinde gözden geçir.',
    whereInBody: 'Tüm beden bir gün bir merkeze daha duyarlı olur. Ay döngüsünün her gününü ayrı bir merkezin laboratuvarı olarak gör.',
    redFlag: 'Aceleci karar — döngüden önce verilen "evet" derin yorgunluk yaratır.',
    reset: 'Doğru insanlarla, doğru mekanda 28 gün bekle. Sürpriz ve hayret hissi doğru yöne işarettir.',
  },
  none: {
    howToFeel: '', whereInBody: '', redFlag: '', reset: '',
  },
};

// =============================================================
// Tip bazında ana uyarı işaretleri ve söndürme ritüelleri
// =============================================================
const TYPE_WARNINGS: Record<HDType, { signs: string[]; resets: string[] }> = {
  'Manifestor': {
    signs: [
      'Çevrenden sürekli direnç ya da sorgulama geliyorsa: bildirim atladın',
      'İçinde kontrol altına alındığında patlama hazır duruyorsa: çocukluk kabuğu açık',
      'Yalnızlık aşırı tatlı geliyorsa: insanlardan iyice koptun',
    ],
    resets: [
      'Bir karar almadan önce 3 kişiye kısaca bilgi ver — izin değil, haber',
      'Tek başına 30 dakika fiziksel hareket: koşu, dans, yürüyüş',
      'Manifestorlar dinlenmesini bilmez; günde 1 saat hiçbir şey yapmama',
    ],
  },
  'Jeneratör': {
    signs: [
      'Sabah yatağa girmek istemiyorsan: gün boyu yanlış evetler verdin',
      'Hayal kırıklığı kronikleşmişse: sevmediğin işe enerji veriyorsun',
      'Beden ağrıları artıyorsa: sakralin tüketici şekilde harcanıyor',
    ],
    resets: [
      'Akşam 30 dk fiziksel boşalma — yorgun ama dolu uyumak',
      'Yarın bir karar karşısında sözcüklerle değil, sesle yanıt ver: "uh-huh" / "un-uh"',
      'Sevmediğin bir görevi 1 hafta bırak; ne oluyor?',
    ],
  },
  'Manifesting Jeneratör': {
    signs: [
      'Hayal kırıklığı + öfke birlikte: çok sayıda yanlış evete bağlandın',
      'Bir projeyi bitirmeden bırakman seni rahatsız ediyorsa: aslında onu hiç istemiyordun',
      'Çevrenden "neden bana söylemedin?" şikayetleri: bildirim atladın',
    ],
    resets: [
      'Çok yönlülüğünü hatan değil, hediyem diye yeniden kabul et',
      'Atladığın adımlara şimdi geri dön ve hızlıca tamamla',
      'Bir projeyi bırakmanın "doğru bırakmak" olabileceğini hatırla',
    ],
  },
  'Projektör': {
    signs: [
      'Acılık hissi: davet edilmeden enerjini öne sürdün ya da çalıştın',
      'Tükenmişlik / yorgunluk: Jeneratör enerjisine fazla kapıldın, kendini onun gibi sandın',
      'Çağrılmadan tavsiye vermeye dürtü: aurana karşı görünmezlik hissi',
      'Tanınmama hissi: yanlış kalabalıkta bulunuyorsun',
    ],
    resets: [
      'Günde 30 dk yalnız dekompresyon — telefon yok, ses yok',
      'Erken yatağa git; gün biterken auranı boşalt',
      'Yarın çağrılmadığın bir konuya görüş bildirme — sadece izle',
      'Davetin geldiği yerlere yönel; gelmediği yerlerden kibarca çekil',
    ],
  },
  'Reflektör': {
    signs: [
      'Sürekli yorgunluk: bir yere/birine fazla yakın kaldın',
      'Hayal kırıklığı: yanlış toplulukta ya da yanlış mekanda örnekleme yapıyorsun',
      'Karar baskısı altında bunalma: 28 günü atlamak istiyorsun',
    ],
    resets: [
      'Tek başına, kendi mekanında 24 saat — örneklediğin enerjiden arın',
      'Doğa, su, açık alan; yerin sallandığında doğa sabitler',
      'Ay döngünü bir takvime düş; her gün hangi merkeze duyarlı olduğunu işaretle',
    ],
  },
};

// =============================================================
// WeeklyReport tipi
// =============================================================
export interface ReportItem {
  title: string;
  body: string;
  micro?: string;
}

export interface CompatibilityBlock {
  note: string;
  getsAlong: string[];
  tension: string[];
}

export interface BodyListeningBlock {
  authorityName: string;
  howToFeel: string;
  whereInBody: string;
  redFlag: string;
  reset: string;
}

export interface WarningsBlock {
  typeSigns: string[];          // tipten gelen uyarı işaretleri
  centerSigns: ReportItem[];   // tanımsız merkezlerden gelen uyarı işaretleri
  resets: string[];             // söndürme / sıfırlama ritüelleri
}

export interface WeeklyReport {
  weekLabel: string;
  weekDates: string;
  theme: string;
  themeDesc: string;
  attention: ReportItem;
  release: ReportItem;
  ownership: ReportItem;
  spotlightGate: {
    number: number;
    line?: number;
    name: string;
    theme: string;
    gift: string;
    shadow: string;
    section: 'personality' | 'design';
  };
  practice: string;
  affirmation: string;

  // Senin haritana özel — her hafta gösterilir
  compatibility: CompatibilityBlock;
  bodyListening: BodyListeningBlock;
  warnings: WarningsBlock;
}

// =============================================================
// Üretici
// =============================================================
export function generateWeeklyReport(chart: HumanDesignChart, now: Date = new Date()): WeeklyReport {
  const { year, week, index } = isoWeek(now);

  const ref = new Date(now);
  const day = (ref.getDay() + 6) % 7;
  const mon = new Date(ref);
  mon.setDate(ref.getDate() - day);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  const weekDates = `${fmt(mon)} – ${fmt(sun)}`;

  const t = TYPES[chart.type];
  const a = AUTHORITIES[chart.authority];
  const personalitySun = chart.personality.find(p => p.planet === 'sun')!;
  const designSun = chart.design.find(p => p.planet === 'sun')!;
  const personalityLine = LINES[personalitySun.line];
  const designLine = LINES[designSun.line];

  // ----- TEMA -----
  const themes: Array<{ headline: string; desc: string }> = [
    {
      headline: 'Stratejine Dönüş',
      desc: `Bu hafta "${t.strategy}" ilkesine dönmek için fırsat haftası. ${t.signature} hissini yakaladığın anlar doğru hatta olduğunu söyler.`,
    },
    {
      headline: 'Yetkini Dinlemek',
      desc: `${a.name} bu hafta öne çıkacak. ${a.shortDesc}`,
    },
    {
      headline: 'Tanımsız Merkez Bilgeliği',
      desc: 'Tanımsız merkezlerin "yanlış benlik" tuzakları taşır ama aynı zamanda yaşam boyu kazanacağın bilgeliğin de evi burası. Bu hafta birinden ders al.',
    },
    {
      headline: 'Tanımlı Merkez Hediyeleri',
      desc: 'Sabit, güvenilir frekansların var. Bu hafta bir tanesini bilinçle dünyaya verme zamanı.',
    },
    {
      headline: 'Profil Çizgisi',
      desc: `${chart.profile} — ${personalitySun.line}. ${personalityLine.name} + ${designSun.line}. ${designLine.name}. Bu hafta birinin doğal akışına yer aç.`,
    },
    {
      headline: 'Aktif Kanal Spotlight',
      desc: 'Kanalların senin sabit yaşam frekansı. Bu hafta birinin enerjisi belirgin olacak.',
    },
  ];
  const theme = pick(themes, index);

  // ----- 🎯 DİKKAT ET -----
  const attentionPool: ReportItem[] = [
    {
      title: 'Yanlış frekans uyarısı',
      body: `${t.notSelf} hissi seni uyandırırsa, bil ki bir yerde stratejini atladın. ${t.strategy} — bu kadar basit.`,
      micro: 'Yarın sabah uyandığında bir dakika dur: dün hangi an doğru, hangi an yanlış hissettim?',
    },
    {
      title: `${personalitySun.line}. çizgi gölgesi (bilinçli)`,
      body: `Personality ${personalitySun.line}. çizgi: ${personalityLine.shadow}. Bu çizgi açıkta yaşandığı için seninde fark edilmesi kolaydır.`,
      micro: 'Bir karar verirken kendine sor: "yeterince hazır mıyım, yoksa kaçıyor muyum?"',
    },
    {
      title: `${designSun.line}. çizgi gölgesi (bilinçsiz)`,
      body: `Design ${designSun.line}. çizgi: ${designLine.shadow}. Bu çizgi senin haberin olmadan oynar; yakınların gözler.`,
      micro: 'Bu hafta sevdiğine "bende fark ettiğin bir şey var mı?" diye sor.',
    },
    {
      title: 'Yetki dışına çıkma',
      body: `${a.caution || 'Yetkin dışında karar verdiğinde pişmanlık kaçınılmazdır.'} Bir karar baskısı geldiğinde duracak ve ${a.name.toLocaleLowerCase('tr')} sesini bekleyecek misin?`,
      micro: 'Telefonuna "yetkine sor" hatırlatması koy — günde bir kez.',
    },
  ];
  const attention = pick(attentionPool, index);

  // ----- 🍃 SERBEST BIRAK -----
  const undefinedList: CenterKey[] = Array.from(chart.undefinedCenters);
  let release: ReportItem;
  if (undefinedList.length === 0) {
    release = {
      title: 'Bu hafta bırakman gereken: Hiçbir merkez tanımsız değil',
      body: 'Reflektör değilsen bu nadir. Tüm merkezlerin sabit olduğu için "ben her şeyi biliyorum" yanılsamasını bu hafta bırak.',
    };
  } else {
    const c = CENTERS[pick(undefinedList, index)];
    release = {
      title: `Tanımsız ${c.name}'in tuzağı`,
      body: c.undefined.notSelfQuestion + ' ' + c.undefined.desc,
      micro: `Bilgelik: ${c.undefined.wisdom}`,
    };
  }

  // ----- 👑 SAHİPLEN -----
  const definedList: CenterKey[] = Array.from(chart.definedCenters);
  let ownership: ReportItem;
  if (chart.activeChannels.length > 0 && index % 2 === 0) {
    const ch = pick(chart.activeChannels, Math.floor(index / 2));
    ownership = {
      title: `${ch.id} ${ch.name}`,
      body: `${ch.shortDesc} ${CENTERS[ch.centers[0]].name} ile ${CENTERS[ch.centers[1]].name} arasındaki bu kanal senin sabit frekansın. Bu hafta enerjisini gizleme; ona alan aç.`,
      micro: `Devre: ${ch.circuit}.`,
    };
  } else if (definedList.length > 0) {
    const c = CENTERS[pick(definedList, index)];
    ownership = {
      title: `Tanımlı ${c.name}'in hediyesi`,
      body: c.defined.desc,
      micro: `Bu hafta sahiplen: ${pick(c.defined.gifts, index)}.`,
    };
  } else {
    ownership = {
      title: 'Çevreni sahiplen',
      body: 'Tanımlı merkezin yok; bu hafta "neredeyim, kimlerle birlikteyim" sorusu üstüne dur. Doğru mekan ve doğru insanlar tek sabit kaynağın.',
    };
  }

  // ----- KAPI SPOTLIGHT -----
  const personalityGates = chart.personality.map(p => ({ ...p, section: 'personality' as const }));
  const designGates = chart.design.map(p => ({ ...p, section: 'design' as const }));
  const allActivations = [...personalityGates, ...designGates];
  const spotlightAct = pick(allActivations, index);
  const spotInfo = GATES[spotlightAct.gate];
  const spotlightGate = {
    number: spotlightAct.gate,
    line: spotlightAct.line,
    name: spotInfo.name,
    theme: spotInfo.theme,
    gift: spotInfo.gift,
    shadow: spotInfo.shadow,
    section: spotlightAct.section,
  };

  // ----- PRATİK & HATIRLATMA -----
  const practices = [
    'Bu hafta bir gece, yatmadan önce 5 dakika sessizce otur. Bedeninin sana ne söylediğini fark et.',
    'Yarın bir karar karşısında "evet" demeden önce 24 saat bekle.',
    'Bir gün boyunca cep telefonunu tutmadan yürü; çevrenin enerjisini örneklemeni gözle.',
    'Bir sevdiğine "şu an nasıl hissediyorsun?" diye sor ve sadece dinle.',
    'Bu hafta hiç söylemediğin bir gerçeği söyle — kibarca, ama söyle.',
    'Her sabah 3 dakika dışarıda durup gökyüzüne bak. Hiçbir şey yapmadan.',
    'Bir gün boyunca "yapmalıyım" yerine "istiyor muyum?" sorusunu test et.',
  ];
  const practice = pick(practices, index);

  const affirmations = [
    `${t.signature} doğru yoldasın demektir; ${t.notSelf} dur, "${t.strategy.toLocaleLowerCase('tr')}" demektir.`,
    `Yetkin ${a.name.toLocaleLowerCase('tr')} — kararın hızına değil doğasına güven.`,
    'Tanımlı olan sende sabit, tanımsız olan dünyaya açık. İkisinin de yeri kutsal.',
    `Sen ${t.type === 'Reflektör' ? 'topluluğun aynasısın' : t.type === 'Projektör' ? 'davet edildiğinde parlarsın' : t.type === 'Manifestor' ? 'başlatma gücüdür özün' : 'yaşamın motoru sensin'}.`,
    `Profil ${chart.profile}: ne acelesi var, hayat 6 çizgide oynanır.`,
    'Herkes gibi değilsin; herkes gibi olmak için tasarlanmadın.',
    `${chart.activeChannels.length} kanalın seni sana getirir; gerisi misafir.`,
  ];
  const affirmation = pick(affirmations, index);

  // ----- UYUMLULUK -----
  const compat = AURA_COMPATIBILITY[chart.type];
  const compatibility: CompatibilityBlock = {
    note: compat.note,
    getsAlong: compat.gets,
    tension: compat.tension,
  };

  // ----- BEDENİ DİNLEME -----
  const bl = BODY_LISTENING[chart.authority];
  const bodyListening: BodyListeningBlock = {
    authorityName: a.name,
    howToFeel: bl.howToFeel,
    whereInBody: bl.whereInBody,
    redFlag: bl.redFlag,
    reset: bl.reset,
  };

  // ----- UYARI İŞARETLERİ -----
  const tw = TYPE_WARNINGS[chart.type];
  const centerSigns: ReportItem[] = undefinedList.slice(0, 5).map(k => {
    const c = CENTERS[k];
    return {
      title: `Tanımsız ${c.name}`,
      body: c.undefined.notSelfQuestion,
      micro: `Söndür: ${c.undefined.wisdom}`,
    };
  });
  const warnings: WarningsBlock = {
    typeSigns: tw.signs,
    centerSigns,
    resets: tw.resets,
  };

  return {
    weekLabel: `${year} — Hafta ${week}`,
    weekDates,
    theme: theme.headline,
    themeDesc: theme.desc,
    attention,
    release,
    ownership,
    spotlightGate,
    practice,
    affirmation,
    compatibility,
    bodyListening,
    warnings,
  };
}
