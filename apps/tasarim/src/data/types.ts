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
      'Projektörler, sakral merkezi tanımsız olan ve yaşam enerjisini Jeneratörlerin aurasından örnekleyerek hareket eden tiplerdir. Aurası odaklı ve nüfuz edicidir; karşılarındaki kişiyi derinlemesine okurlar. Yenilikçi sistemler, başkalarının enerjisini nasıl yönlendireceğini görme yetenekleri yüksektir. Ancak bu görüleri ancak davet edildiklerinde değer kazanır. Davet edilmeden enerjilerini öne sürmeleri acılık (bitterness) yaratır. Doğru yaşandığında başarı (success) ve tanınma gelir. Daha az çalışıp daha çok dinlenmek için tasarlanmışlardır.',
    pracicalTips: [
      'Hayatın büyük alanlarında (sevgi, iş, taşınma) davet bekle.',
      'Aurayı tanı: insanlar seni sorduğunda gözlerini kıs ve görmeye izin ver.',
      'Günlük dinlenme zamanı ayır; sakral değil, projektör enerjisiyle yaşıyorsun.',
      'Tanınmak istiyorsan önce kendini tanı; içsel yetkinliğin değer kazandıkça davet artar.',
    ],
    keywords: ['Görü', 'Rehberlik', 'Davet', 'Tanınma'],
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
  },
};
