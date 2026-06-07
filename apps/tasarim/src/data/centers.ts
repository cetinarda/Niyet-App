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
  nameEn?: string;
  emoji: string;
  color: string;
  bio: string;          // biyolojik karşılık
  bioEn?: string;
  function: string;     // işlev
  functionEn?: string;
  isMotor: boolean;
  isPressure: boolean;
  isAwareness: boolean;
  gates: number[];      // bu merkezin kapıları
  defined: {
    title: string;
    titleEn?: string;
    desc: string;
    descEn?: string;
    gifts: string[];
    giftsEn?: string[];
  };
  undefined: {
    title: string;
    titleEn?: string;
    desc: string;
    descEn?: string;
    notSelfQuestion: string;     // tanımsız merkezdeki "yanlış benlik" sorusu
    notSelfQuestionEn?: string;
    wisdom: string;              // kazanılan bilgelik
    wisdomEn?: string;
  };
}

export const CENTERS: Record<CenterKey, CenterInfo> = {
  head: {
    key: 'head',
    name: 'Kafa Merkezi',
    nameEn: 'Head Center',
    emoji: '💡',
    color: '#F5D547',
    bio: 'Epifiz bezi',
    bioEn: 'Pineal gland',
    function: 'İlham basıncı; sorulara, merak ve esin akışına yer açar.',
    functionEn: 'The pressure of inspiration; makes room for questions, curiosity and the flow of inspiration.',
    isMotor: false,
    isPressure: true,
    isAwareness: false,
    gates: [64, 61, 63],
    defined: {
      title: 'Tanımlı Kafa: Sürekli Sorulara Sahip Zihin',
      titleEn: 'Defined Head: A Mind With Constant Questions',
      desc:
        'İçinden sürekli yeni sorular ve ilhamlar yükselir. Düşünme baskısı senin doğal frekansındır; başkalarını da düşünmeye yönlendirirsin. Hangi sorularla yaşaman gerektiğini seçmen önemlidir.',
      descEn:
        'New questions and inspirations rise within you constantly. The pressure to think is your natural frequency; you also prompt others to think. It matters which questions you choose to live with.',
      gifts: [
        'İlhamı başlatma kapasitesi',
        'Soruları açık tutma cesareti',
        'Başkalarını düşünmeye yönlendirme',
      ],
      giftsEn: [
        'The capacity to initiate inspiration',
        'The courage to keep questions open',
        'Prompting others to think',
      ],
    },
    undefined: {
      title: 'Tanımsız Kafa: Başkalarının Sorularını Yüklenir',
      titleEn: 'Undefined Head: Takes On Others\' Questions',
      desc:
        'Çevreden gelen sorulara hızlıca kapılırsın; kendine ait olmayan meseleleri çözmeye çalışmak yorucudur. Kendi soruna değer hangisinin senin olmadığını ayırt etmektir.',
      descEn:
        'You are quickly swept up by questions coming from around you; trying to solve matters that aren\'t yours is tiring. Your own work is to discern which questions are not yours.',
      notSelfQuestion:
        '"Cevaplaman gerekmeyen soruları cevaplamak için baskı hissediyor musun?"',
      notSelfQuestionEn:
        '\'Do you feel pressure to answer questions you don\'t need to answer?\'',
      wisdom:
        'Hangi sorunun gerçekten cevaplanmaya değer olduğunu bilmek; gereksiz zihinsel baskıyı bırakmak.',
      wisdomEn:
        'Knowing which question is truly worth answering; releasing unnecessary mental pressure.',
    },
  },
  ajna: {
    key: 'ajna',
    name: 'Ajna (Akıl)',
    nameEn: 'Ajna (Mind)',
    emoji: '🧠',
    color: '#7CC576',
    bio: 'Hipofiz, ön beyin korteksi',
    bioEn: 'Pituitary, anterior brain cortex',
    function: 'Kavramsallaştırma; bilgiyi işleme, anlam üretme ve düşünme.',
    functionEn: 'Conceptualization; processing information, producing meaning and thinking.',
    isMotor: false,
    isPressure: false,
    isAwareness: true,
    gates: [47, 24, 4, 17, 43, 11],
    defined: {
      title: 'Tanımlı Ajna: Sabit Düşünme Biçimi',
      titleEn: 'Defined Ajna: A Fixed Way of Thinking',
      desc:
        'Bilgiyi işleme şeklin sabittir; nasıl düşündüğün belli bir kalıba sahiptir. Bu sayede güvenilir bir akıl yürütme sunarsın ama tek doğru bakış senin değildir.',
      descEn:
        'The way you process information is fixed; how you think follows a certain pattern. This lets you offer reliable reasoning, but yours is not the only correct viewpoint.',
      gifts: [
        'Sabit, güvenilir kavramsallaştırma',
        'Bir konu hakkında derin sertifika',
        'Düşüncenin sürekliliği',
      ],
      giftsEn: [
        'Fixed, reliable conceptualization',
        'Deep expertise on a subject',
        'Continuity of thought',
      ],
    },
    undefined: {
      title: 'Tanımsız Ajna: Esnek Akıl, Kararsızlık Yanılgısı',
      titleEn: 'Undefined Ajna: A Flexible Mind, the Illusion of Indecision',
      desc:
        'Düşünme biçimin sürekli değişebilir; her duruma yeni bir bakış getirebilirsin. Yanlış benlik tarafında "kararsızım" duygusu üretir; aslında akıllı bir esnekliğe sahipsin.',
      descEn:
        'Your way of thinking can change constantly; you can bring a fresh perspective to every situation. On the not-self side it produces a feeling of \'I\'m indecisive\'; in truth you have an intelligent flexibility.',
      notSelfQuestion:
        '"Aslında emin olmadığın halde emin görünmek zorunda hissediyor musun?"',
      notSelfQuestionEn:
        '\'Do you feel you must appear certain even when you really aren\'t?\'',
      wisdom:
        'Bir şey hakkında "emin olmak" zorunda olmadığını bilmek; çoklu bakışı bilgelikle taşımak.',
      wisdomEn:
        'Knowing you don\'t have to \'be certain\' about something; carrying multiple perspectives with wisdom.',
    },
  },
  throat: {
    key: 'throat',
    name: 'Boğaz Merkezi',
    nameEn: 'Throat Center',
    emoji: '🗣️',
    color: '#8B6F47',
    bio: 'Tiroid & paratiroid',
    bioEn: 'Thyroid & parathyroid',
    function: 'İfade ve manifestasyon; sözden eyleme geçiş kapısı.',
    functionEn: 'Expression and manifestation; the gateway from word to action.',
    isMotor: false,
    isPressure: false,
    isAwareness: false,
    gates: [62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16],
    defined: {
      title: 'Tanımlı Boğaz: Tutarlı İfade ve Manifestasyon',
      titleEn: 'Defined Throat: Consistent Expression and Manifestation',
      desc:
        'Konuştuğun şey tutarlıdır; nasıl ifade ettiğin belli bir kalıba sahiptir. Boğaz tanımının yönü, hangi merkeze bağlı olduğuna göre değişir.',
      descEn:
        'What you say is consistent; how you express it follows a certain pattern. The orientation of a defined Throat depends on which center it is connected to.',
      gifts: [
        'Sözü manifestasyona dönüştürmek',
        'Tutarlı bir iletişim sesi',
        'Doğru bağlantıda eylem yaratma',
      ],
      giftsEn: [
        'Turning word into manifestation',
        'A consistent voice of communication',
        'Creating action through the right connection',
      ],
    },
    undefined: {
      title: 'Tanımsız Boğaz: Dikkat Çekmeye Baskı',
      titleEn: 'Undefined Throat: Pressure to Get Attention',
      desc:
        'Söz alma anı uygun olmadığında konuşmak zorunda hissedersin. Doğru sıra ve doğru zamanı bekleme öğrenildiğinde derin bilgi açılır.',
      descEn:
        'You feel compelled to speak even when the moment isn\'t right. When you learn to wait for the right turn and the right time, deep knowing opens up.',
      notSelfQuestion:
        '"Dikkat çekmek için lafı uzatıyor ya da uygun olmayan anda konuşuyor musun?"',
      notSelfQuestionEn:
        '\'Do you go on talking to get attention, or speak at the wrong moment?\'',
      wisdom:
        'Doğru anın gelmesini bekleme bilgeliği; "söz çağırılır, alınmaz" prensibi.',
      wisdomEn:
        'The wisdom of waiting for the right moment; the principle that \'the word is invited, not seized\'.',
    },
  },
  g: {
    key: 'g',
    name: 'G Merkezi (Self)',
    nameEn: 'G Center (Self)',
    emoji: '✦',
    color: '#E8B547',
    bio: 'Karaciğer & kan',
    bioEn: 'Liver & blood',
    function: 'Kimlik, sevgi ve yön. Hayatın geometrisi.',
    functionEn: 'Identity, love and direction. The geometry of life.',
    isMotor: false,
    isPressure: false,
    isAwareness: false,
    gates: [1, 13, 25, 46, 2, 15, 10, 7],
    defined: {
      title: 'Tanımlı G: Sabit Kimlik ve Yön',
      titleEn: 'Defined G: Fixed Identity and Direction',
      desc:
        'Kim olduğun ve nereye gittiğin sende sabit bir frekans olarak yaşar. Sevgi ve yön içsel bir pusulayla ilerler.',
      descEn:
        'Who you are and where you are going live in you as a fixed frequency. Love and direction move by way of an inner compass.',
      gifts: [
        'Sabit kimlik duygusu',
        'Net bir yaşam yönü',
        'Sevgide kararlılık',
      ],
      giftsEn: [
        'A stable sense of identity',
        'A clear direction in life',
        'Steadfastness in love',
      ],
    },
    undefined: {
      title: 'Tanımsız G: Doğru Mekan ve Doğru İnsan',
      titleEn: 'Undefined G: The Right Place and the Right People',
      desc:
        'Kimliğin ortama göre değişebilir; doğru mekan ve doğru insanlar yanında olduğunda kim olduğunu hissedersin. Kimliğini sabitlemek yerine yer ve insanı seçmeyi öğrenmek anahtardır.',
      descEn:
        'Your identity can change with the environment; you feel who you are when the right place and the right people are around you. The key is learning to choose place and people rather than fixing your identity.',
      notSelfQuestion:
        '"Kim olduğunu, nereye ait olduğunu sürekli arıyor musun?"',
      notSelfQuestionEn:
        '\'Are you constantly searching for who you are and where you belong?\'',
      wisdom:
        'Doğru mekanın sevgiyi açtığını bilmek; sabit kimliğe ihtiyacın olmadığını öğrenmek.',
      wisdomEn:
        'Knowing that the right place opens love; learning that you don\'t need a fixed identity.',
    },
  },
  heart: {
    key: 'heart',
    name: 'Kalp / Ego Merkezi',
    nameEn: 'Heart / Ego Center',
    emoji: '👑',
    color: '#D9534F',
    bio: 'Kalp, mide, safra kesesi, timüs',
    bioEn: 'Heart, stomach, gallbladder, thymus',
    function: 'İrade, ego, kendini ortaya koyma; "söz verme" gücü.',
    functionEn: 'Willpower, ego, self-assertion; the power to \'make a promise\'.',
    isMotor: true,
    isPressure: false,
    isAwareness: false,
    gates: [21, 40, 26, 51],
    defined: {
      title: 'Tanımlı Kalp: Sabit İrade ve Söz',
      titleEn: 'Defined Heart: Fixed Willpower and Promise',
      desc:
        'Kendine söz verebilir, sözünün arkasında durabilirsin. İrade gücün sabittir; ama dinlenmeyi de hak eden bir kasdır.',
      descEn:
        'You can make promises to yourself and stand behind your word. Your willpower is fixed; but it is a muscle that also deserves rest.',
      gifts: [
        'Söz verip tutma kapasitesi',
        'Materyal dünyada netlik',
        'Kendine güven',
      ],
      giftsEn: [
        'The capacity to make and keep promises',
        'Clarity in the material world',
        'Self-confidence',
      ],
    },
    undefined: {
      title: 'Tanımsız Kalp: Kendini Kanıtlama Baskısı',
      titleEn: 'Undefined Heart: The Pressure to Prove Oneself',
      desc:
        'Sahip olmadığın iradeyi sürekli kanıtlamaya çalışırsın. Söz verme acelesi ve kendini ispatlama yorgunluğu yanlış benliğin tuzağıdır.',
      descEn:
        'You keep trying to prove a willpower you don\'t have. The rush to make promises and the fatigue of proving yourself are the trap of the not-self.',
      notSelfQuestion:
        '"Aslında istemediğin halde söz verip yorgun düşüyor musun?"',
      notSelfQuestionEn:
        '\'Do you make promises you don\'t really want to and end up exhausted?\'',
      wisdom:
        'Kendini kanıtlamak zorunda olmadığını bilmek; kalbin gerçekten istediği şeyi anlamak.',
      wisdomEn:
        'Knowing you don\'t have to prove yourself; understanding what your heart truly wants.',
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
