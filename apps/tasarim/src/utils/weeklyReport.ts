import { HumanDesignChart } from './humanDesign';
import { chartHash, hangingGates, personalResets } from './personalize';
import { getLang, L } from '../i18n';
import { CENTERS, CenterKey } from '../data/centers';
import { GATES } from '../data/gates';
import { TYPES, HDType } from '../data/types';
import { AUTHORITIES, AuthorityKey } from '../data/authorities';
import { LINES, PROFILES } from '../data/profiles';
import { circuitLabel } from '../data/channels';

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
      'Çeşitli auralara sahip dengeli topluluklar — tek bir enerjiye yapışıp kalmayan',
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
    howToFeel: 'Karar karşısında anında "evet" / "hayır" deme; birkaç gün boyunca aynı kararı farklı duygu durumlarında hisset.',
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
    howToFeel: 'Kararı duyarken kalbinden ne çıkıyor: "ben istiyor muyum?" sorusuna sesli yanıt ver, ağzından çıkana kulak ver.',
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
      'Çok yönlülüğünü hatan değil, hediyen diye yeniden kabul et',
      'Atladığın adımlara şimdi geri dön ve hızlıca tamamla',
      'Bir projeyi bırakmanın "doğru bırakmak" olabileceğini hatırla',
    ],
  },
  'Projektör': {
    signs: [
      'Acılık hissi: davet edilmeden enerjini öne sürdün ya da çalıştın',
      'Tükenmişlik / yorgunluk: Jeneratör enerjisine fazla kapıldın, kendini onun gibi sandın',
      'Çağrılmadan tavsiye verme dürtüsü: aurana karşı görünmezlik hissi',
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
// İNGİLİZCE KARŞILIKLAR
// Rapor sekmesinin GÖVDESİ İngilizce modda da Türkçe basıyordu: ekran
// etiketleri çevriliydi ama içerik generateWeeklyReport()'tan ham TR geliyordu.
// Tablolar aynı anahtarlarla paralel tutuluyor; T() seçici ile dile göre okunur.
// =============================================================
const AURA_COMPATIBILITY_EN: Record<HDType, { gets: string[]; tension: string[]; note: string }> = {
  'Manifestor': {
    gets: [
      'Generators and Manifesting Generators — their enveloping aura makes room for your spark of initiation',
      'Projectors — their deep seeing confirms your direction (if you invite them)',
      'Grown-ups who respect your boundary and can receive an announcement without asking "why?"',
    ],
    tension: [
      'Another Manifestor — two repelling auras; a fight over space is inevitable',
      'People who try to control you or make you ask permission',
      'A Reflector who gets triggered quickly by being confined — the push in your aura reflects back',
    ],
    note: 'Your aura repels; informing others softens it.',
  },
  'Jeneratör': {
    gets: [
      'Other Generators / MGs — parallel engines; two sacrals on one task produce enormous output',
      'Projectors — they read your sacral response and ask the right question',
      'People who keep their word and can ask "what do you actually want?"',
    ],
    tension: [
      'People who ask you open-ended questions and leave no room for a yes/no',
      'Friends with weak boundaries who push you into work you do not love',
      'People who "get swept up in your ideas" — they connect to your head, not your sacral, and trigger frustration',
    ],
    note: 'Your aura is enveloping; it draws people in — not to satisfy them, but to respond.',
  },
  'Manifesting Jeneratör': {
    gets: [
      'Generators — a parallel rhythm',
      'A Projector who accepts your speed — they make the right call to you',
      'People who see your many-sidedness as lightness',
    ],
    tension: [
      'Single-focus people who say "finish this first" — they do not see the gift of skipping',
      'People close to you asking "why didn\'t you tell me?" because they were not informed — do not skip informing',
      'People who tell you that you need to slow down',
    ],
    note: 'An enveloping aura plus manifesting energy; informing softens the aura.',
  },
  'Projektör': {
    gets: [
      'Generators and Manifesting Generators — you naturally feed on their aura; you fill up near them',
      'People who invite your insight instead of asking you what to do',
      'Grown-ups who respect your energetic limits and want to protect you from crowds',
    ],
    tension: [
      'Another Projector — two guides, and the tension of "who invites whom?"',
      'Manifestors — their repelling aura puts you in the tension of "should I ask now?"',
      'People who come for advice without inviting you — a bitterness trigger',
    ],
    note: 'Your aura is focused and penetrating; it reads the other person deeply. That seeing only gains value when invited.',
  },
  'Reflektör': {
    gets: [
      'Healthy people who stand in their own centre — they shine in you',
      'Loved ones who do not press you for a decision and let you wait the 28 days',
      'Balanced communities with varied auras — ones you do not get stuck to',
    ],
    tension: [
      'Long contact with a single person of intense, overbearing aura — you sample it and it takes over',
      'People who try to hurry your decision and say "tell me now"',
      'An unhealthy environment (place, room, home) — place comes before everything',
    ],
    note: 'Your aura is sampling and permeable; it takes in the energy around you and mirrors it back.',
  },
};

const BODY_LISTENING_EN: Record<AuthorityKey, { howToFeel: string; whereInBody: string; redFlag: string; reset: string }> = {
  emotional: {
    howToFeel: 'Do not say an instant "yes" or "no" to a decision; feel the same decision over several days in different emotional states.',
    whereInBody: 'The belly and the middle of the chest — where the emotional wave rises and falls. Heaviness or lightening around the solar plexus.',
    redFlag: 'The moments you say "yes" at the peak of excitement, or "never" at the bottom of a low.',
    reset: 'Sleep on it; the wave settles. Look at the same decision in the morning — if the feeling is the same, it is the right one.',
  },
  sacral: {
    howToFeel: 'Your immediate body response to what is in front of you: an "uh-huh" (rising, opening) or "un-uh" (falling, closing) sound from the chest.',
    whereInBody: 'Deep in the belly and the lower chest — it is heard in the sacral sound, and it even comes out loud.',
    redFlag: 'When your mind\'s reasoning replaces the sacral response, exhaustion follows.',
    reset: 'Truly tire your body; let the sacral empty before bed. When no response comes, "no decision right now" is a legitimate answer.',
  },
  splenic: {
    howToFeel: 'An instant, quiet intuition that does not repeat. Catch the first whisper; there is no second one.',
    whereInBody: 'A slight tension or release in the spleen (under the left ribs), a shiver in the armpit/lymph area, a faint ringing in the ear, a sudden hint of smell — the concrete bodily signals of intuition.',
    redFlag: 'Noise, crowds and stacking many decisions together drown out the splenic voice. The late regret of "I actually knew".',
    reset: 'Get to a quiet place. Focus on one decision. When the first inner signal comes, act at once — if you delay, it is gone.',
  },
  ego: {
    howToFeel: 'Listen to what comes from your heart as you hear the decision: answer "do I want this?" out loud and listen to what leaves your mouth.',
    whereInBody: 'Mid-chest — the heart and thymus area. Tightening in the chest when you do not want it; widening when you do.',
    redFlag: 'Promising in order to make someone else happy; then the "I wish I hadn\'t" fatigue in your heart.',
    reset: 'Risk breaking a promise once. The heart muscle also wants rest.',
  },
  'self-projected': {
    howToFeel: 'Speak out loud with a friend you trust. As you speak, watch the shifts in your tone, your pace and the rhythm of your breath.',
    whereInBody: 'The throat and vocal cords — tightening when you speak in the wrong direction; ease and widening in the right one.',
    redFlag: 'Settling for talking inside your head; deciding without a sound leaving you.',
    reset: 'Call a friend. Ask them to listen rather than advise. Your voice is the authority.',
  },
  mental: {
    howToFeel: 'Do not decide alone; your clarity opens in the right combination of the right people and the right place.',
    whereInBody: 'There is no fixed bodily signal — which is why you will learn to read the environment rather than the body.',
    redFlag: 'If you sit alone and your mind spins for hours, the decision will not come from there.',
    reset: 'Talk the same subject through, again and again, with more than one voice you trust. Change the place — take the decision to a bench, a park, the shore.',
  },
  lunar: {
    howToFeel: 'Review the decision across a full 28-day lunar cycle, with different people, on different days, in different moods.',
    whereInBody: 'Each day the whole body becomes more sensitive to one centre. See every day of the lunar cycle as the laboratory of a different centre.',
    redFlag: 'A hasty decision — a "yes" given before the cycle creates deep fatigue.',
    reset: 'Wait the 28 days with the right people, in the right place. A feeling of surprise and wonder points the right way.',
  },
  none: { howToFeel: '', whereInBody: '', redFlag: '', reset: '' },
};

const TYPE_WARNINGS_EN: Record<HDType, { signs: string[]; resets: string[] }> = {
  'Manifestor': {
    signs: [
      'If resistance or questioning keeps coming from those around you: you skipped informing',
      'If an explosion sits ready inside you whenever you are controlled: the childhood shell is open',
      'If solitude tastes far too sweet: you have cut away from people entirely',
    ],
    resets: [
      'Before making a decision, briefly inform three people — not permission, just news',
      '30 minutes of physical movement alone: running, dancing, walking',
      'Manifestors do not know how to rest; one hour a day of doing nothing',
    ],
  },
  'Jeneratör': {
    signs: [
      'If you do not want to go to bed in the morning: you gave wrong yeses all day',
      'If frustration has become chronic: you are giving energy to work you do not love',
      'If body aches are increasing: your sacral is being spent in a draining way',
    ],
    resets: [
      '30 minutes of physical release in the evening — sleep tired but full',
      'Tomorrow, answer a decision with sound rather than words: "uh-huh" / "un-uh"',
      'Drop a task you do not love for one week; what happens?',
    ],
  },
  'Manifesting Jeneratör': {
    signs: [
      'Frustration and anger together: you committed to too many wrong yeses',
      'If leaving a project unfinished bothers you: you never actually wanted it',
      'Complaints of "why didn\'t you tell me?" around you: you skipped informing',
    ],
    resets: [
      'Accept your many-sidedness again as your gift, not your fault',
      'Go back now to the steps you skipped and finish them quickly',
      'Remember that dropping a project can be the right kind of dropping',
    ],
  },
  'Projektör': {
    signs: [
      'A feeling of bitterness: you offered your energy or worked without being invited',
      'Burnout / fatigue: you got swept into Generator energy and mistook yourself for one',
      'The urge to advise without being called: a sense of invisibility toward your aura',
      'Feeling unrecognised: you are in the wrong crowd',
    ],
    resets: [
      '30 minutes of solo decompression a day — no phone, no sound',
      'Go to bed early; empty your aura as the day ends',
      'Tomorrow, do not give your view on something you were not called to — just watch',
      'Turn toward the places the invitation comes from; withdraw kindly from the ones it does not',
    ],
  },
  'Reflektör': {
    signs: [
      'Constant fatigue: you stayed too close to a place or a person',
      'Frustration: you are sampling in the wrong community or the wrong place',
      'Overwhelm under decision pressure: you want to skip the 28 days',
    ],
    resets: [
      '24 hours alone in your own place — clear the energy you have been sampling',
      'Nature, water, open space; when the ground shakes, nature steadies it',
      'Put your lunar cycle on a calendar; mark which centre you are sensitive to each day',
    ],
  },
};

// Dile göre tablo seçici.
const isEn = () => getLang() === 'en';
const T_AURA = () => (isEn() ? AURA_COMPATIBILITY_EN : AURA_COMPATIBILITY);
const T_BODY = () => (isEn() ? BODY_LISTENING_EN : BODY_LISTENING);
const T_WARN = () => (isEn() ? TYPE_WARNINGS_EN : TYPE_WARNINGS);
// Kısa iki dilli yardımcı — gövde içindeki serbest cümleler için.
const B = (tr: string, en: string) => (isEn() ? en : tr);

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
  const { year, week, index: weekIndex } = isoWeek(now);
  // KİŞİSELLEŞTİRME: rotasyon seed'ine harita parmak izi karışır — aynı hafta,
  // farklı haritalar FARKLI tema/dikkat/bırak/pratik görür (eskiden herkese aynıydı).
  const index = weekIndex + (chartHash(chart) % 997);

  const ref = new Date(now);
  const day = (ref.getDay() + 6) % 7;
  const mon = new Date(ref);
  mon.setDate(ref.getDate() - day);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  // Tarih biçimi 'tr-TR'ye sabitlenmişti → İngilizce modda "12 Oca – 18 Oca".
  const fmt = (d: Date) =>
    d.toLocaleDateString(isEn() ? 'en-GB' : 'tr-TR', { day: 'numeric', month: 'short' });
  const weekDates = `${fmt(mon)} – ${fmt(sun)}`;

  const t = TYPES[chart.type];
  const a = AUTHORITIES[chart.authority];
  // Veri tablolarındaki alanlar dile göre okunur (L = nameEn/descEn varsa onu verir).
  const tName = L(t, 'name'), tStrategy = L(t, 'strategy'), tSignature = L(t, 'signature'), tNotSelf = L(t, 'notSelf');
  const aName = L(a, 'name'), aShort = L(a, 'shortDesc'), aCaution = L(a, 'caution');
  const lcName = (x: string) => (isEn() ? String(x).toLowerCase() : String(x).toLocaleLowerCase('tr'));
  const personalitySun = chart.personality.find(p => p.planet === 'sun')!;
  const designSun = chart.design.find(p => p.planet === 'sun')!;
  const personalityLine = LINES[personalitySun.line];
  const designLine = LINES[designSun.line];

  // ----- TEMA -----
  const themes: Array<{ headline: string; desc: string }> = [
    {
      headline: B('Stratejine Dönüş', 'Back to Your Strategy'),
      desc: B(`Bu hafta "${tStrategy}" ilkesine dönmek için fırsat haftası. ${tSignature} hissini yakaladığın anlar doğru hatta olduğunu söyler.`,
              `This is a week to return to the principle of "${tStrategy}". The moments you catch the feeling of ${lcName(tSignature)} tell you that you are on the right line.`),
    },
    {
      headline: B('Yetkini Dinlemek', 'Listening to Your Authority'),
      desc: B(`${aName} bu hafta öne çıkacak. ${aShort}`, `${aName} comes to the fore this week. ${aShort}`),
    },
    {
      headline: B('Tanımsız Merkez Bilgeliği', 'The Wisdom of Undefined Centres'),
      desc: B('Tanımsız merkezlerin "yanlış benlik" tuzakları taşır ama aynı zamanda yaşam boyu kazanacağın bilgeliğin de evi burası. Bu hafta birinden ders al.',
              'Your undefined centres carry "not-self" traps, yet they are also the home of the wisdom you gather across a lifetime. Take a lesson from one of them this week.'),
    },
    {
      headline: B('Tanımlı Merkez Hediyeleri', 'The Gifts of Your Defined Centres'),
      desc: B('Sabit, güvenilir frekansların var. Bu hafta bir tanesini bilinçle dünyaya verme zamanı.',
              'You carry steady, reliable frequencies. This week it is time to give one of them to the world consciously.'),
    },
    {
      headline: B('Profil Çizgisi', 'Profile Line'),
      desc: B(`${chart.profile} — ${personalitySun.line}. ${L(personalityLine,'name')} + ${designSun.line}. ${L(designLine,'name')}. Bu hafta birinin doğal akışına yer aç.`,
              `${chart.profile} — line ${personalitySun.line} ${L(personalityLine,'name')} + line ${designSun.line} ${L(designLine,'name')}. Make room this week for the natural flow of one of them.`),
    },
    {
      headline: B('Aktif Kanal Spotlight', 'Active Channel Spotlight'),
      desc: B('Kanalların senin sabit yaşam frekansındır. Bu hafta birinin enerjisi belirgin olacak.',
              'Your channels are your fixed life frequency. This week the energy of one of them will stand out.'),
    },
  ];
  const theme = pick(themes, index);

  // ----- 🎯 DİKKAT ET -----
  const attentionPool: ReportItem[] = [
    {
      title: B('Yanlış frekans uyarısı', 'Wrong-frequency warning'),
      body: B(`${tNotSelf} hissi seni uyandırırsa, bil ki bir yerde stratejini atladın. ${tStrategy} — bu kadar basit.`,
              `If the feeling of ${lcName(tNotSelf)} wakes you, know that you skipped your strategy somewhere. ${tStrategy} — it is that simple.`),
      micro: B('Yarın sabah uyandığında bir dakika dur: dün hangi an doğru, hangi an yanlış hissettim?',
               'When you wake tomorrow, pause for a minute: which moment yesterday felt right, and which felt wrong?'),
    },
    {
      title: B(`${personalitySun.line}. çizgi gölgesi (bilinçli)`, `Shadow of line ${personalitySun.line} (conscious)`),
      body: B(`Personality ${personalitySun.line}. çizgi: ${L(personalityLine,'shadow')}. Bu çizgi açıkta yaşandığı için sende de fark edilmesi kolaydır.`,
              `Personality line ${personalitySun.line}: ${L(personalityLine,'shadow')}. Because this line is lived out in the open, it is easy to notice in you.`),
      micro: B('Bir karar verirken kendine sor: "yeterince hazır mıyım, yoksa kaçıyor muyum?"',
               'When making a decision, ask yourself: "am I ready enough, or am I running away?"'),
    },
    {
      title: B(`${designSun.line}. çizgi gölgesi (bilinçsiz)`, `Shadow of line ${designSun.line} (unconscious)`),
      body: B(`Design ${designSun.line}. çizgi: ${L(designLine,'shadow')}. Bu çizgi senin haberin olmadan oynar; yakınların gözler.`,
              `Design line ${designSun.line}: ${L(designLine,'shadow')}. This line plays out without your knowing; the people close to you see it.`),
      micro: B('Bu hafta sevdiğine "bende fark ettiğin bir şey var mı?" diye sor.',
               'This week ask someone you love: "is there something you notice in me?"'),
    },
    {
      title: B('Yetki dışına çıkma', 'Stepping outside your authority'),
      body: B(`${aCaution || 'Yetkin dışında karar verdiğinde pişmanlık kaçınılmazdır.'} Bir karar baskısı geldiğinde duracak ve ${lcName(aName)} sesini bekleyecek misin?`,
              `${aCaution || 'When you decide outside your authority, regret is inevitable.'} When decision pressure comes, will you stop and wait for the voice of your ${lcName(aName)}?`),
      micro: B('Telefonuna "yetkine sor" hatırlatması koy — günde bir kez.',
               'Set a reminder on your phone that says "ask your authority" — once a day.'),
    },
  ];
  const attention = pick(attentionPool, index);

  // ----- 🍃 SERBEST BIRAK -----
  const undefinedList: CenterKey[] = Array.from(chart.undefinedCenters);
  let release: ReportItem;
  if (undefinedList.length === 0) {
    release = {
      title: B('Bu hafta bırakman gereken: Hiçbir merkez tanımsız değil', 'To release this week: no centre is undefined'),
      body: B('Reflektör değilsen bu nadir. Tüm merkezlerin sabit olduğu için "ben her şeyi biliyorum" yanılsamasını bu hafta bırak.',
              'Unless you are a Reflector, this is rare. Because all your centres are fixed, release the illusion of "I know everything" this week.'),
    };
  } else {
    const c = CENTERS[pick(undefinedList, index)];
    release = {
      title: B(`Tanımsız ${c.name} tuzağı`, `The trap of an undefined ${L(c,'name')}`),
      body: L(c.undefined, 'notSelfQuestion') + ' ' + L(c.undefined, 'desc'),
      micro: B(`Bilgelik: ${c.undefined.wisdom}`, `Wisdom: ${L(c.undefined, 'wisdom')}`),
    };
  }

  // ----- 👑 SAHİPLEN -----
  const definedList: CenterKey[] = Array.from(chart.definedCenters);
  let ownership: ReportItem;
  if (chart.activeChannels.length > 0 && index % 2 === 0) {
    const ch = pick(chart.activeChannels, Math.floor(index / 2));
    ownership = {
      title: `${ch.id} ${L(ch,'name')}`,
      body: B(`${ch.shortDesc} ${CENTERS[ch.centers[0]].name} ile ${CENTERS[ch.centers[1]].name} arasındaki bu kanal senin sabit frekansın. Bu hafta enerjisini gizleme; ona alan aç.`,
              `${L(ch,'shortDesc')} This channel between ${L(CENTERS[ch.centers[0]],'name')} and ${L(CENTERS[ch.centers[1]],'name')} is your fixed frequency. Do not hide its energy this week; make room for it.`),
      micro: B(`Devre: ${ch.circuit}.`, `Circuit: ${circuitLabel(ch.circuit, 'en')}.`),
    };
  } else if (definedList.length > 0) {
    const c = CENTERS[pick(definedList, index)];
    ownership = {
      title: B(`Tanımlı ${c.name} hediyesi`, `The gift of a defined ${L(c,'name')}`),
      body: L(c.defined, 'desc'),
      micro: B(`Bu hafta sahiplen: ${pick(c.defined.gifts, index)}.`, `Own this week: ${pick(L(c.defined,'gifts') as string[], index)}.`),
    };
  } else {
    ownership = {
      title: B('Çevreni sahiplen', 'Own your environment'),
      body: B('Tanımlı merkezin yok; bu hafta "neredeyim, kimlerle birlikteyim" sorusu üstünde dur. Doğru mekan ve doğru insanlar tek sabit kaynağın.',
              'You have no defined centre; this week dwell on the question "where am I, and who am I with?" The right place and the right people are your only steady source.'),
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
  const practices = isEn() ? [
    'One night this week, sit quietly for five minutes before bed. Notice what your body is telling you.',
    'Tomorrow, wait 24 hours before saying "yes" to a decision.',
    'Walk for a whole day without holding your phone; watch yourself sampling the energy around you.',
    'Ask someone you love "how are you feeling right now?" and just listen.',
    'Say a truth this week that you have never said — kindly, but say it.',
    'Stand outside for three minutes each morning and look at the sky. Doing nothing else.',
    'For one day, test the question "do I want this?" in place of "I should".',
  ] : [
    'Bu hafta bir gece, yatmadan önce 5 dakika sessizce otur. Bedeninin sana ne söylediğini fark et.',
    'Yarın bir karar karşısında "evet" demeden önce 24 saat bekle.',
    'Bir gün boyunca cep telefonunu tutmadan yürü; çevrenin enerjisini örneklemeni gözle.',
    'Bir sevdiğine "şu an nasıl hissediyorsun?" diye sor ve sadece dinle.',
    'Bu hafta hiç söylemediğin bir gerçeği söyle — kibarca, ama söyle.',
    'Her sabah 3 dakika dışarıda durup gökyüzüne bak. Hiçbir şey yapmadan.',
    'Bir gün boyunca "yapmalıyım" yerine "istiyor muyum?" sorusunu test et.',
  ];
  const practice = pick(practices, index);

  const affirmations = isEn() ? [
    `${tSignature} means you are on the right path; ${lcName(tNotSelf)} means stop and "${lcName(tStrategy)}".`,
    `Your authority is ${lcName(aName)} — trust the nature of your decision, not its speed.`,
    'What is defined in you is fixed; what is undefined is open to the world. Both places are sacred.',
    `You are ${t.type === 'Reflektör' ? "the community's mirror" : t.type === 'Projektör' ? 'the one who shines when invited' : t.type === 'Manifestor' ? 'the power that initiates' : "life's engine"}.`,
    `Profile ${chart.profile}: there is no hurry — life is played across six lines.`,
    'You are not like everyone else; you were not designed to be.',
    `Your ${chart.activeChannels.length} channels bring you back to yourself; the rest are guests.`,
  ] : [
    `${t.signature} doğru yoldasın demektir; ${t.notSelf} dur, "${t.strategy.toLocaleLowerCase('tr')}" demektir.`,
    `Yetkin ${a.name.toLocaleLowerCase('tr')} — kararın hızına değil doğasına güven.`,
    'Tanımlı olan sende sabit, tanımsız olan dünyaya açık. İkisinin de yeri kutsal.',
    `Sen ${t.type === 'Reflektör' ? 'topluluğun aynasısın' : t.type === 'Projektör' ? 'davet edildiğinde parlarsın' : t.type === 'Manifestor' ? 'başlatma gücüsün' : 'yaşamın motorusun'}.`,
    `Profil ${chart.profile}: ne acelesi var, hayat 6 çizgide oynanır.`,
    'Herkes gibi değilsin; herkes gibi olmak için tasarlanmadın.',
    `${chart.activeChannels.length} kanalın seni sana getirir; gerisi misafir.`,
  ];
  const affirmation = pick(affirmations, index);

  // ----- UYUMLULUK -----
  const compat = T_AURA()[chart.type];
  const compatibility: CompatibilityBlock = {
    note: compat.note,
    getsAlong: compat.gets,
    tension: compat.tension,
  };

  // ----- BEDENİ DİNLEME -----
  const bl = T_BODY()[chart.authority];
  const bodyListening: BodyListeningBlock = {
    authorityName: aName,
    howToFeel: bl.howToFeel,
    whereInBody: bl.whereInBody,
    redFlag: bl.redFlag,
    reset: bl.reset,
  };

  // ----- UYARI İŞARETLERİ -----
  const tw = T_WARN()[chart.type];
  // KİŞİSELLEŞTİRME: gösterilecek 5 tanımsız merkez harita-hash'iyle döndürülür
  // (eskiden hep ilk 5) ve her işaret, o merkezdeki ASILI KAPI ile derinleşir.
  const rotatedUndef = undefinedList.length > 5
    ? Array.from({ length: 5 }, (_, i) => undefinedList[(index + i) % undefinedList.length])
    : undefinedList;
  const centerSigns: ReportItem[] = rotatedUndef.map(k => {
    const c = CENTERS[k];
    const hg = hangingGates(chart, k);
    let micro = B(`Söndür: ${c.undefined.wisdom}`, `Let it go: ${L(c.undefined,'wisdom')}`);
    if (hg.length > 0) {
      const g = hg[index % hg.length];
      const gi: any = (GATES as any)[g];
      if (gi) micro = B(`Söndür: ${c.undefined.wisdom} Senin anahtarın ${g}. kapı (${gi.name}): ${gi.gift}`,
                        `Let it go: ${L(c.undefined,'wisdom')} Your key is gate ${g} (${L(gi,'name')}): ${L(gi,'gift')}`);
    }
    return {
      title: B(`Tanımsız ${c.name}`, `Undefined ${L(c,'name')}`),
      body: L(c.undefined, 'notSelfQuestion'),
      micro,
    };
  });
  // Ritüeller: tip ritüellerinden hash'le seçilen 2 + haritaya özgü 3 (yetki/asılı kapı/kanal).
  const lang = getLang() === 'en' ? 'en' as const : 'tr' as const;
  const typeResets = tw.resets.length > 2
    ? Array.from({ length: 2 }, (_, i) => tw.resets[(index + i) % tw.resets.length])
    : tw.resets;
  const warnings: WarningsBlock = {
    typeSigns: tw.signs,
    centerSigns,
    resets: [...typeResets, ...personalResets(chart, lang)],
  };

  return {
    weekLabel: B(`${year} — Hafta ${week}`, `${year} — Week ${week}`),
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
