export type HDType =
  | 'Manifestor'
  | 'Jeneratör'
  | 'Manifesting Jeneratör'
  | 'Projektör'
  | 'Reflektör';

export interface TypeInfo {
  type: HDType;
  emoji: string;
  oran: string;
  aura: string;
  signature: string;       // doğru frekans
  notSelf: string;         // yanlış frekans
  strategy: string;
  rolePrimary: string;
  shortDesc: string;
  longDesc: string;
  pracicalTips: string[];
  keywords: string[];
  // İngilizce kardeş alanlar (opsiyonel) — L() bunları EN modunda döndürür.
  nameEn?: string;
  oranEn?: string;
  auraEn?: string;
  signatureEn?: string;
  notSelfEn?: string;
  strategyEn?: string;
  rolePrimaryEn?: string;
  shortDescEn?: string;
  longDescEn?: string;
  pracicalTipsEn?: string[];
}

export const TYPES: Record<HDType, TypeInfo> = {
  'Manifestor': {
    type: 'Manifestor',
    emoji: '🔥',
    oran: '~%9',
    aura: 'İtici, kapalı',
    signature: 'Huzur',
    notSelf: 'Öfke',
    strategy: 'Bildir (informing)',
    rolePrimary: 'Başlatıcı',
    shortDesc:
      'Yeni döngüleri başlatmak için tasarlanmış bağımsız bir başlatıcı. Aurası karşıdakini iter; bu sayede etkisini geniş bir alana taşır.',
    longDesc:
      'Manifestorlar, kimsenin izni olmadan başlatma gücüne sahip nadir tiplerdir. Sakral merkezleri tanımsızdır; sürdürülebilir iş enerjisine sahip değildirler ama harekete geçirme, başlatma ve etki bırakma kapasiteleri yüksektir. Çevrelerini öfkelendirmemek için stratejileri "bildirmek"tir; bir şey yapmadan önce bundan etkilenecek olan kişilere kısaca haber vermek aurayı yumuşatır ve dirençle karşılaşmalarını engeller. Doğru yaşadıklarında huzur (peace) hissederler; yanlış yaşadıklarında ise öfke (anger) ve yalnızlık ortaya çıkar.',
    pracicalTips: [
      'Bir şey yapmadan önce çevreni bilgilendir; izin değil, haber.',
      'Çocuklukta kontrol altına alınmaya karşı korumacı bir kabuk geliştirmiş olabilirsin; bunu fark et.',
      'Enerjini koruman için tek başına çalışma alanların olsun.',
      'Dinlenme döngülerine alan aç; sürekli üretim için tasarlanmadın.',
    ],
    keywords: ['Başlatma', 'Etki', 'Bağımsızlık', 'İmpakt'],
    nameEn: 'Manifestor',
    oranEn: '~9%',
    auraEn: 'Repelling, closed',
    signatureEn: 'Peace',
    notSelfEn: 'Anger',
    strategyEn: 'Inform',
    rolePrimaryEn: 'Initiator',
    shortDescEn:
      'An independent initiator designed to start new cycles. Their aura repels others, which lets their impact carry across a wide field.',
    longDescEn:
      'Manifestors are the rare type with the power to initiate without anyone’s permission. Their Sacral center is undefined; they don’t carry sustainable work energy, but their capacity to set things in motion, to begin, and to leave an impact is high. To avoid angering those around them, their strategy is to inform: briefly letting the people who will be affected know before they act softens the aura and keeps them from meeting resistance. When living correctly, they feel peace; when living out of alignment, anger and isolation arise.',
    pracicalTipsEn: [
      'Inform those around you before you act — it’s a heads-up, not a request for permission.',
      'You may have built a protective shell against being controlled in childhood; notice it.',
      'Keep spaces where you can work alone to protect your energy.',
      'Make room for rest cycles; you weren’t designed for constant output.',
    ],
  },
  'Jeneratör': {
    type: 'Jeneratör',
    emoji: '🌱',
    oran: '~%37',
    aura: 'Açık, sarmalayıcı',
    signature: 'Tatmin',
    notSelf: 'Hayal kırıklığı',
    strategy: 'Yanıt vermeyi bekle',
    rolePrimary: 'Yaşam ustası',
    shortDesc:
      'Sakralin saf gücü. Sevdiği işe verdiğinde tükenmez bir enerji kaynağı; yanıt verdiğinde doğru hayatı bulur.',
    longDesc:
      'Jeneratörler, dünyanın yapı taşıdır. Tanımlı sakral merkez sayesinde sürdürülebilir bir iş ve yaşam enerjisine sahiptirler. Aurası açık ve sarmalayıcıdır; karşılaştığı her şeye sakralinden bir "uh-huh / un-uh" sesiyle yanıt verir. Beynin "iyi fikir" demesi yetmez; bedeninin yanıt verdiğine bakmalıdır. Doğru hayatı yaşadığında derin bir tatmin (satisfaction) hissi vardır; aksi halde sürekli hayal kırıklığı (frustration) yaşar. Mastery (ustalık) yolu, sevdikleri şeyleri tekrarlaya tekrarlaya derinleşmektir.',
    pracicalTips: [
      'Beden yanıtını dinle: göğsünden gelen "evet" ya da "hayır" hissini takip et.',
      'Çevrendekilerden evet/hayırlı sorular sormalarını iste.',
      'Sevmediğin işe enerji koyma; aksi halde hayal kırıklığı kronikleşir.',
      'Akşam yatağa girmeden önce bedenini gerçek anlamda yor.',
    ],
    keywords: ['Yanıt', 'Sakral', 'Ustalık', 'Tatmin'],
    nameEn: 'Generator',
    oranEn: '~37%',
    auraEn: 'Open, enveloping',
    signatureEn: 'Satisfaction',
    notSelfEn: 'Frustration',
    strategyEn: 'Wait to respond',
    rolePrimaryEn: 'Master of life',
    shortDescEn:
      'The pure power of the Sacral. An inexhaustible source of energy when devoted to work they love; they find their true life by responding.',
    longDescEn:
      'Generators are the building blocks of the world. Thanks to a defined Sacral center, they hold sustainable work and life energy. Their aura is open and enveloping; they respond to everything they meet with an “uh-huh / un-uh” sound from the Sacral. It’s not enough for the mind to say “good idea” — they must check whether the body responds. When living their correct life there is a deep sense of satisfaction; otherwise they experience constant frustration. The path of mastery is to deepen by repeating, again and again, the things they love.',
    pracicalTipsEn: [
      'Listen to your body’s response: follow the gut-level “yes” or “no” rising from your chest.',
      'Ask the people around you to phrase things as yes/no questions.',
      'Don’t pour energy into work you don’t love; otherwise frustration becomes chronic.',
      'Truly tire your body out before getting into bed at night.',
    ],
  },
  'Manifesting Jeneratör': {
    type: 'Manifesting Jeneratör',
    emoji: '⚡',
    oran: '~%33',
    aura: 'Açık, sarmalayıcı',
    signature: 'Tatmin',
    notSelf: 'Hayal kırıklığı & öfke',
    strategy: 'Yanıt ver, sonra bildir',
    rolePrimary: 'Çok katmanlı yaratıcı',
    shortDesc:
      'Hızlı, çok yönlü ve atlamalı bir Jeneratör türü. Aynı anda birden fazla şeyi yapabilir; süreci atlama hediyesine sahiptir.',
    longDesc:
      'Manifesting Jeneratörler, tanımlı sakralleri ile bir motorun (Sakral, Heart, Solar Plexus ya da Root) boğaza bağlandığı melez tiplerdir. Bu sayede hem yanıt verirler hem de manifest ederler. Tek bir şeye sıkışıp kalmaktansa birden fazla ilgi alanını paralel yürütmek için yaratılmışlardır. Adımları atlayarak ilerlemek doğal hediyeleridir; bu yüzden sıklıkla "biraz da geri dönüp şu adımı yapmam gerekiyor" dedikleri olur. Stratejileri önce yanıt vermek (sakralden), ardından harekete geçmeden önce ilgili kişileri bilgilendirmektir.',
    pracicalTips: [
      'Birden fazla projeyi paralel yürütmek hatan değil, hediyendir.',
      'Sakral yanıtın olmayan bir şeye atlama; içsel sıkışıklığa neden olur.',
      'Hızını yavaşlatanlara karşı sabırla değil, bilgilendirerek hareket et.',
      'Adımları atladığında geri dönüp dolduracağın yerleri not et.',
    ],
    keywords: ['Çoklu yön', 'Hız', 'Atlama', 'Manifestasyon'],
    nameEn: 'Manifesting Generator',
    oranEn: '~33%',
    auraEn: 'Open, enveloping',
    signatureEn: 'Satisfaction',
    notSelfEn: 'Frustration & anger',
    strategyEn: 'Respond, then inform',
    rolePrimaryEn: 'Multi-layered creator',
    shortDescEn:
      'A fast, multi-faceted Generator who skips steps. They can do several things at once and carry the gift of shortcutting the process.',
    longDescEn:
      'Manifesting Generators are hybrid types whose defined Sacral connects through a motor (Sacral, Heart, Solar Plexus or Root) to the Throat. This lets them both respond and manifest. They are made to run several interests in parallel rather than being stuck on a single thing. Moving forward by skipping steps is their natural gift; this is why they often say, “I need to go back and do that one step.” Their strategy is to respond first (from the Sacral), then inform the relevant people before they take action.',
    pracicalTipsEn: [
      'Running multiple projects in parallel isn’t your mistake — it’s your gift.',
      'Don’t leap into something you have no Sacral response to; it causes inner tightness.',
      'Move past those who slow you down by informing them, not by being patient.',
      'When you skip steps, note the places you’ll need to come back and fill in.',
    ],
  },
  'Projektör': {
    type: 'Projektör',
    emoji: '🔮',
    oran: '~%21',
    aura: 'Odaklı, derin',
    signature: 'Başarı',
    notSelf: 'Acılık',
    strategy: 'Davet bekle (yaşam, sevgi, kariyer)',
    rolePrimary: 'Rehber & yönetici',
    shortDesc:
      'İnsanları ve sistemleri okuma uzmanı. Davet edildiğinde derin görüleriyle başkalarının enerjisini doğru yöne yönlendirir.',
    longDesc:
      'Projektörler, sakral merkezi tanımsız olan ve yaşam enerjisini Jeneratörlerin aurasından örnekleyerek hareket eden tiplerdir. Aurası odaklı ve nüfuz edicidir; karşılarındaki kişiyi derinlemesine okurlar. Yenilikçi sistemleri ve başkalarının enerjisini nasıl yönlendireceklerini görme yetenekleri yüksektir. Ama bu görüleri ancak davet edildiklerinde değer kazanır. Davet edilmeden enerjilerini öne sürmeleri acılık (bitterness) yaratır. Doğru yaşandığında başarı (success) ve tanınma gelir. Daha az çalışıp daha çok dinlenmek için tasarlanmışlardır.',
    pracicalTips: [
      'Hayatın büyük alanlarında (sevgi, iş, taşınma) davet bekle.',
      'Aurayı tanı: insanlar seni sorduğunda gözlerini kıs ve görmeye izin ver.',
      'Günlük dinlenme zamanı ayır; sakral değil, projektör enerjisiyle yaşıyorsun.',
      'Tanınmak istiyorsan önce kendini tanı; içsel yetkinliğin değer kazandıkça davet artar.',
    ],
    keywords: ['Görü', 'Rehberlik', 'Davet', 'Tanınma'],
    nameEn: 'Projector',
    oranEn: '~21%',
    auraEn: 'Focused, penetrating',
    signatureEn: 'Success',
    notSelfEn: 'Bitterness',
    strategyEn: 'Wait for the invitation (life, love, career)',
    rolePrimaryEn: 'Guide & director',
    shortDescEn:
      'A master at reading people and systems. When invited, their deep insight steers others’ energy in the right direction.',
    longDescEn:
      'Projectors are the type whose Sacral center is undefined, moving through life by sampling life-force energy from the auras of Generators. Their aura is focused and penetrating; they read the other person deeply. They have a high ability to see innovative systems and how to direct other people’s energy. But these insights only gain value when they are invited. Asserting their energy without an invitation creates bitterness. Lived correctly, it brings success and recognition. They are designed to work less and rest more.',
    pracicalTipsEn: [
      'Wait for the invitation in life’s major areas (love, work, relocation).',
      'Know your aura: when people ask about you, soften your gaze and let yourself see.',
      'Set aside daily rest; you live on Projector energy, not Sacral energy.',
      'If you want recognition, first know yourself; as your inner mastery is valued, invitations increase.',
    ],
  },
  'Reflektör': {
    type: 'Reflektör',
    emoji: '🌕',
    oran: '~%1',
    aura: 'Örnekleyici, akıcı',
    signature: 'Sürpriz / şaşkınlık',
    notSelf: 'Hayal kırıklığı',
    strategy: '28 günlük ay döngüsünü bekle',
    rolePrimary: 'Topluluk aynası',
    shortDesc:
      'Hiçbir merkezi tanımlı değil. Çevresinin enerjisini örnekler ve topluma ayna tutar; doğru toplulukta parıldar.',
    longDesc:
      'Reflektörler, dokuz merkezin hiçbiri tanımlı olmayan ve dünyanın yalnızca yüzde birini oluşturan en nadir tiptir. Aurası örnekleyici ve geçirgendir; başkalarının enerjisini ve çevreyi içine alır, yansıtır. Bu yüzden bulundukları topluluk ve mekan onlar için her şeyden önemlidir. Büyük kararlarda hızlı karar vermek yerine bir tam ay döngüsünü (yaklaşık 28 gün) beklemeleri ve bu sürede farklı insanlarla konuşarak kararı içsel olarak süzmeleri tavsiye edilir. Doğru yaşadıklarında hayat onları sürpriz ve hayretle (surprise) doldurur.',
    pracicalTips: [
      'Hayatındaki insanları ve mekanı dikkatle seç; her şey budur.',
      'Büyük kararlarda 28 gün bekle; bu süreyi farklı dostlarla konuşarak geçir.',
      'Ay haritanı takip et; her gün farklı bir merkezini deneyimleyebilirsin.',
      'Yorgun ya da boş hissettiğinde yalnız kal; örneklediğin enerjiden arın.',
    ],
    keywords: ['Ayna', 'Örnekleme', 'Ay', 'Topluluk'],
    nameEn: 'Reflector',
    oranEn: '~1%',
    auraEn: 'Sampling, fluid',
    signatureEn: 'Surprise / wonder',
    notSelfEn: 'Disappointment',
    strategyEn: 'Wait a 28-day lunar cycle',
    rolePrimaryEn: 'Mirror of the community',
    shortDescEn:
      'None of the centers are defined. They sample the energy around them and hold up a mirror to the community; they shine in the right one.',
    longDescEn:
      'Reflectors are the rarest type, with none of the nine centers defined, making up just one percent of the world. Their aura is sampling and permeable; they take in and reflect the energy of others and their surroundings. This is why the community and place they’re in matter more than anything for them. For big decisions, rather than deciding quickly they are advised to wait a full lunar cycle (about 28 days) and, during that time, to filter the decision inwardly by talking with different people. When living correctly, life fills them with surprise and wonder.',
    pracicalTipsEn: [
      'Choose the people and the place in your life carefully; that is everything.',
      'Wait 28 days for big decisions; spend that time talking it through with different friends.',
      'Follow the lunar chart; each day you may experience a different center.',
      'When you feel tired or empty, be alone; clear out the energy you’ve been sampling.',
    ],
  },
};
