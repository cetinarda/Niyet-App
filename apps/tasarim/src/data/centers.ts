export type CenterKey =
  | 'head'
  | 'ajna'
  | 'throat'
  | 'g'
  | 'heart'
  | 'solarPlexus'
  | 'sacral'
  | 'spleen'
  | 'root';

export interface CenterInfo {
  key: CenterKey;
  name: string;
  emoji: string;
  color: string;
  bio: string;          // biyolojik karşılık
  function: string;     // işlev
  isMotor: boolean;
  isPressure: boolean;
  isAwareness: boolean;
  gates: number[];      // bu merkezin kapıları
  defined: {
    title: string;
    desc: string;
    gifts: string[];
  };
  undefined: {
    title: string;
    desc: string;
    notSelfQuestion: string;     // tanımsız merkezdeki "yanlış benlik" sorusu
    wisdom: string;              // kazanılan bilgelik
  };
}

export const CENTERS: Record<CenterKey, CenterInfo> = {
  head: {
    key: 'head',
    name: 'Kafa Merkezi',
    emoji: '💡',
    color: '#F5D547',
    bio: 'Epifiz bezi',
    function: 'İlham basıncı; sorulara, merak ve esin akışına yer açar.',
    isMotor: false,
    isPressure: true,
    isAwareness: false,
    gates: [64, 61, 63],
    defined: {
      title: 'Tanımlı Kafa: Sürekli Sorulara Sahip Zihin',
      desc:
        'İçinden sürekli yeni sorular ve ilhamlar yükselir. Düşünme baskısı senin doğal frekansındır; başkalarını da düşünmeye yönlendirirsin. Hangi sorularla yaşaman gerektiğini seçmen önemlidir.',
      gifts: [
        'İlhamı başlatma kapasitesi',
        'Soruları açık tutma cesareti',
        'Başkalarını düşünmeye yönlendirme',
      ],
    },
    undefined: {
      title: 'Tanımsız Kafa: Başkalarının Sorularını Yüklenir',
      desc:
        'Çevreden gelen sorulara hızlıca kapılırsın; kendine ait olmayan meseleleri çözmeye çalışmak yorucudur. Kendi soruna değer hangisinin senin olmadığını ayırt etmektir.',
      notSelfQuestion:
        '"Cevaplaman gerekmeyen soruları cevaplamak için baskı hissediyor musun?"',
      wisdom:
        'Hangi sorunun gerçekten cevaplanmaya değer olduğunu bilmek; gereksiz zihinsel baskıyı bırakmak.',
    },
  },
  ajna: {
    key: 'ajna',
    name: 'Ajna (Akıl)',
    emoji: '🧠',
    color: '#7CC576',
    bio: 'Hipofiz, ön beyin korteksi',
    function: 'Kavramsallaştırma; bilgiyi işleme, anlam üretme ve düşünme.',
    isMotor: false,
    isPressure: false,
    isAwareness: true,
    gates: [47, 24, 4, 17, 43, 11],
    defined: {
      title: 'Tanımlı Ajna: Sabit Düşünme Biçimi',
      desc:
        'Bilgiyi işleme şeklin sabittir; nasıl düşündüğün belli bir kalıba sahiptir. Bu sayede güvenilir bir akıl yürütme sunarsın ama tek doğru bakış senin değildir.',
      gifts: [
        'Sabit, güvenilir kavramsallaştırma',
        'Bir konu hakkında derin sertifika',
        'Düşüncenin sürekliliği',
      ],
    },
    undefined: {
      title: 'Tanımsız Ajna: Esnek Akıl, Kararsızlık Yanılgısı',
      desc:
        'Düşünme biçimin sürekli değişebilir; her duruma yeni bir bakış getirebilirsin. Yanlış benlik tarafında "kararsızım" duygusu üretir; aslında akıllı bir esnekliğe sahipsin.',
      notSelfQuestion:
        '"Aslında emin olmadığın halde emin görünmek zorunda hissediyor musun?"',
      wisdom:
        'Bir şey hakkında "emin olmak" zorunda olmadığını bilmek; çoklu bakışı bilgelikle taşımak.',
    },
  },
  throat: {
    key: 'throat',
    name: 'Boğaz Merkezi',
    emoji: '🗣️',
    color: '#8B6F47',
    bio: 'Tiroid & paratiroid',
    function: 'İfade ve manifestasyon; sözden eyleme geçiş kapısı.',
    isMotor: false,
    isPressure: false,
    isAwareness: false,
    gates: [62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16],
    defined: {
      title: 'Tanımlı Boğaz: Tutarlı İfade ve Manifestasyon',
      desc:
        'Konuştuğun şey tutarlıdır; nasıl ifade ettiğin belli bir kalıba sahiptir. Boğaz tanımının yönü, hangi merkeze bağlı olduğuna göre değişir.',
      gifts: [
        'Sözü manifestasyona dönüştürmek',
        'Tutarlı bir iletişim sesi',
        'Doğru bağlantıda eylem yaratma',
      ],
    },
    undefined: {
      title: 'Tanımsız Boğaz: Dikkat Çekmeye Baskı',
      desc:
        'Söz alma anı uygun olmadığında konuşmak zorunda hissedersin. Doğru sıra ve doğru zamanı bekleme öğrenildiğinde derin bilgi açılır.',
      notSelfQuestion:
        '"Dikkat çekmek için lafı uzatıyor ya da uygun olmayan anda konuşuyor musun?"',
      wisdom:
        'Doğru anın gelmesini bekleme bilgeliği; "söz çağırılır, alınmaz" prensibi.',
    },
  },
  g: {
    key: 'g',
    name: 'G Merkezi (Self)',
    emoji: '✦',
    color: '#E8B547',
    bio: 'Karaciğer & kan',
    function: 'Kimlik, sevgi ve yön. Hayatın geometrisi.',
    isMotor: false,
    isPressure: false,
    isAwareness: false,
    gates: [1, 13, 25, 46, 2, 15, 10, 7],
    defined: {
      title: 'Tanımlı G: Sabit Kimlik ve Yön',
      desc:
        'Kim olduğun ve nereye gittiğin sende sabit bir frekans olarak yaşar. Sevgi ve yön içsel bir pusulayla ilerler.',
      gifts: [
        'Sabit kimlik duygusu',
        'Net bir yaşam yönü',
        'Sevgide kararlılık',
      ],
    },
    undefined: {
      title: 'Tanımsız G: Doğru Mekan ve Doğru İnsan',
      desc:
        'Kimliğin ortama göre değişebilir; doğru mekan ve doğru insanlar yanında olduğunda kim olduğunu hissedersin. Kimliğini sabitlemek yerine yer ve insanı seçmeyi öğrenmek anahtardır.',
      notSelfQuestion:
        '"Kim olduğunu, nereye ait olduğunu sürekli arıyor musun?"',
      wisdom:
        'Doğru mekanın sevgiyi açtığını bilmek; sabit kimliğe ihtiyacın olmadığını öğrenmek.',
    },
  },
  heart: {
    key: 'heart',
    name: 'Kalp / Ego Merkezi',
    emoji: '👑',
    color: '#D9534F',
    bio: 'Kalp, mide, safra kesesi, timüs',
    function: 'İrade, ego, kendini ortaya koyma; "söz verme" gücü.',
    isMotor: true,
    isPressure: false,
    isAwareness: false,
    gates: [21, 40, 26, 51],
    defined: {
      title: 'Tanımlı Kalp: Sabit İrade ve Söz',
      desc:
        'Kendine söz verebilir, sözünün arkasında durabilirsin. İrade gücün sabittir; ama dinlenmeyi de hak eden bir kasdır.',
      gifts: [
        'Söz verip tutma kapasitesi',
        'Materyal dünyada netlik',
        'Kendine güven',
      ],
    },
    undefined: {
      title: 'Tanımsız Kalp: Kendini Kanıtlama Baskısı',
      desc:
        'Sahip olmadığın iradeyi sürekli kanıtlamaya çalışırsın. Söz verme acelesi ve kendini ispatlama yorgunluğu yanlış benliğin tuzağıdır.',
      notSelfQuestion:
        '"Aslında istemediğin halde söz verip yorgun düşüyor musun?"',
      wisdom:
        'Kendini kanıtlamak zorunda olmadığını bilmek; kalbin gerçekten istediği şeyi anlamak.',
    },
  },
  solarPlexus: {
    key: 'solarPlexus',
    name: 'Güneş Sinir Ağı (Duygusal)',
    emoji: '🌊',
    color: '#D88B47',
    bio: 'Sinir sistemi, böbrek, pankreas',
    function: 'Duygusal dalga ve farkındalık; ruhsallık potansiyeli.',
    isMotor: true,
    isPressure: false,
    isAwareness: true,
    gates: [36, 22, 37, 6, 49, 55, 30],
    defined: {
      title: 'Tanımlı Solar Plexus: Duygusal Dalga',
      desc:
        'Duygusal bir dalganın içinden hayatı yaşarsın. Net karar yoktur; netlik dalganın durulmasıyla gelir. Duygusal yetkin vardır.',
      gifts: [
        'Derin duygusal sezgi',
        'Empati ve duygusal müzik',
        'Zaman içinde gelen netlik',
      ],
    },
    undefined: {
      title: 'Tanımsız Solar Plexus: Çatışmadan Kaçınma',
      desc:
        'Çatışma ve gerilime karşı çok hassassın; duygu çatışmasından kaçınmak için gerçeği söylememek yanlış benliğin tuzağıdır.',
      notSelfQuestion:
        '"Çatışmadan kaçınmak için gerçeği söylemekten vazgeçiyor musun?"',
      wisdom:
        'Duygusal gerçeği saklamadan tutma; başkasının duygusunu kendi duygusu sanmama.',
    },
  },
  sacral: {
    key: 'sacral',
    name: 'Sakral Merkez',
    emoji: '🌱',
    color: '#D9534F',
    bio: 'Üreme organları, gonadlar',
    function: 'Yaşam gücü ve iş enerjisi; cinsel ve yaratıcı kuvvet.',
    isMotor: true,
    isPressure: false,
    isAwareness: false,
    gates: [34, 5, 14, 29, 59, 9, 3, 42, 27],
    defined: {
      title: 'Tanımlı Sakral: Sürdürülebilir Yaşam Enerjisi',
      desc:
        'İş ve üreme için sürdürülebilir bir enerjiye sahipsin. Anlık beden yanıtın (uh-huh / un-uh) yetkin olabilir. Sevdiğin işe verdiğinde yorulmazsın.',
      gifts: [
        'Tükenmez iş enerjisi',
        'Beden bilgeliği ve yanıt netliği',
        'Yaratıcılık ve üretkenlik',
      ],
    },
    undefined: {
      title: 'Tanımsız Sakral: Bilmeden Aşırıya Kaçma',
      desc:
        'Yeterince enerjin olmadığını fark etmek zor olabilir; sürekli "biraz daha" derken tükenirsin. Ne zaman duracağını bilmemek yanlış benliğin tuzağıdır.',
      notSelfQuestion:
        '"Ne zaman duracağını bilmiyor, yorgunken bile devam ediyor musun?"',
      wisdom:
        'Ne zaman yeterli olduğunu bilmek; başkalarının enerjisinden örnekleyip onları tanımak.',
    },
  },
  spleen: {
    key: 'spleen',
    name: 'Dalak Merkezi',
    emoji: '🪶',
    color: '#5BC0DE',
    bio: 'Bağışıklık, dalak, lenf',
    function: 'Sezgi, sağlık, korku ve mevcut anın güvenliği.',
    isMotor: false,
    isPressure: false,
    isAwareness: true,
    gates: [48, 57, 44, 50, 32, 28, 18],
    defined: {
      title: 'Tanımlı Dalak: Sürekli Sezgi ve Sağlam Bağışıklık',
      desc:
        'Sezgin sürekli açıktır; bedenin "şu an iyi" ya da "değil" sinyalini sessizce verir. Splenik yetkide bu sezgi kararı oluşturur.',
      gifts: [
        'Anlık içgüdü ve sezgi',
        'Mevcut anda sağlık ve güvenlik bilgisi',
        'Doğal koruma duygusu',
      ],
    },
    undefined: {
      title: 'Tanımsız Dalak: Sağlıksız Bağlara Tutunma',
      desc:
        'İyi olmayan ilişki ya da işlere "korkudan" tutunabilirsin; bırakırsam kötü olur kaygısı yanlış benliğin tuzağıdır.',
      notSelfQuestion:
        '"Aslında sana iyi gelmeyen şeylere bırakamıyor olmaktan tutunuyor musun?"',
      wisdom:
        'Neyin sağlıklı olduğunu bilmek; bırakmanın korkusunu sezgisel netliğe çevirmek.',
    },
  },
  root: {
    key: 'root',
    name: 'Kök Merkez',
    emoji: '🌑',
    color: '#8B6F47',
    bio: 'Adrenal bezler',
    function: 'Yaşam adrenali, baskı, hareket etme dürtüsü.',
    isMotor: true,
    isPressure: true,
    isAwareness: false,
    gates: [58, 38, 54, 53, 60, 52, 19, 39, 41],
    defined: {
      title: 'Tanımlı Kök: Baskıya Hakim, Sabit Tempo',
      desc:
        'Adrenal baskı sende sabittir; başkalarını da harekete iten bir tempon vardır. Baskıyı doğru yöne kanalize etme bilgeliğin gelişir.',
      gifts: [
        'Baskı altında çalışma kapasitesi',
        'Hayatı harekete geçiren itici güç',
        'Sabit bir hayat ritmi',
      ],
    },
    undefined: {
      title: 'Tanımsız Kök: Baskı Altında Yanlış Acele',
      desc:
        'Çevredeki baskıyı yükselterek alır ve "hızlı bitirip kurtulmaya" çalışırsın. Aceleci bitirme dürtüsü yanlış benliğin tuzağıdır.',
      notSelfQuestion:
        '"Baskıyı bitirmek için aceleyle iş yapıyor, sonra pişman oluyor musun?"',
      wisdom:
        'Baskı altında bile sakin kalmayı öğrenmek; baskının kendi adrenalin değil, çevreden geldiğini görmek.',
    },
  },
};

export const CENTER_ORDER: CenterKey[] = [
  'head', 'ajna', 'throat', 'g', 'heart',
  'solarPlexus', 'sacral', 'spleen', 'root',
];
