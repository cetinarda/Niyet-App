export type LineNumber = 1 | 2 | 3 | 4 | 5 | 6;
export type ProfileKey =
  | '1/3' | '1/4'
  | '2/4' | '2/5'
  | '3/5' | '3/6'
  | '4/6' | '4/1'
  | '5/1' | '5/2'
  | '6/2' | '6/3';

export interface LineInfo {
  number: LineNumber;
  name: string;
  nameEn?: string;
  shortDesc: string;
  shortDescEn?: string;
  shadow: string;
  shadowEn?: string;
}

export const LINES: Record<LineNumber, LineInfo> = {
  1: {
    number: 1,
    name: 'Araştırmacı',
    nameEn: 'The Investigator',
    shortDesc:
      'Sağlam temeller arar; emin olmak için araştırır, okur, derinleşir. Bilgi güvenliğin temelidir.',
    shortDescEn:
      'Seeks solid foundations; investigates, reads and goes deep in order to feel secure. Knowledge is the basis of safety.',
    shadow: 'Yetersizlik korkusu, hiç bitmeyen hazırlık dönemi.',
    shadowEn: 'Fear of inadequacy, a never-ending preparation phase.',
  },
  2: {
    number: 2,
    name: 'Münzevi / Doğal Yetenek',
    nameEn: 'The Hermit / Natural Talent',
    shortDesc:
      'Yalnızlığa ihtiyacı vardır; kendi alanında hediyesini doğal olarak taşır. Davet edilmeyi bekler.',
    shortDescEn:
      'Needs solitude; naturally carries a gift in their own field. Waits to be called out.',
    shadow: 'Çağırılmadan görünmek, kendi sürecini yorumlamak.',
    shadowEn: 'Showing up before being called, over-interpreting one\'s own process.',
  },
  3: {
    number: 3,
    name: 'Deneyimci / Şehit',
    nameEn: 'The Experimenter / Martyr',
    shortDesc:
      'Hayatı çarpışarak öğrenir; deneme-yanılma onun bilgeliğidir. Hatalar veridir, suç değil.',
    shortDescEn:
      'Learns life by bumping into it; trial and error is their wisdom. Mistakes are data, not faults.',
    shadow: 'Suçluluk, kaçınma, "yine olmadı" duygusu.',
    shadowEn: 'Guilt, avoidance, the feeling of \'it failed again\'.',
  },
  4: {
    number: 4,
    name: 'Fırsatçı / Ağ İnsanı',
    nameEn: 'The Opportunist / Networker',
    shortDesc:
      'Hayatı yakın çevresi ve dostlukları üzerinden ilerletir. Bir sonraki adıma elindekini bırakmadan geçer.',
    shortDescEn:
      'Advances life through their close circle and friendships. Moves to the next step without first letting go of what they hold.',
    shadow: 'Dostluğa bağımlılık, yenisini hazırlamadan eskiyi bırakma korkusu.',
    shadowEn: 'Dependence on friendship, fear of letting go of the old before securing the new.',
  },
  5: {
    number: 5,
    name: 'Yansıtıcı / Pratik Çözücü',
    nameEn: 'The Heretic / Practical Problem-Solver',
    shortDesc:
      'Üzerine yansıyanlarla çağırılır. Pratik çözümler sunar; krizde aranan kişidir. Karizması fonksiyoneldir.',
    shortDescEn:
      'Is called out by the projections placed upon them. Offers practical solutions; the person sought in a crisis. Their charisma is functional.',
    shadow: 'Yansıtılan beklentilerin yükü, yanlış anlaşılma korkusu.',
    shadowEn: 'The burden of projected expectations, fear of being misunderstood.',
  },
  6: {
    number: 6,
    name: 'Rol Modeli / Bilge',
    nameEn: 'The Role Model / Sage',
    shortDesc:
      'Üç evreli yaşam: 0-30 deneme, 30-50 çatıdan izleme, 50+ rol modelliği. Otantik örnek olur.',
    shortDescEn:
      'A life in three phases: 0-30 experimenting, 30-50 observing from the roof, 50+ being a role model. Becomes an authentic example.',
    shadow: 'Çatıdan kopuk hissetme, mükemmellik baskısı.',
    shadowEn: 'Feeling cut off on the roof, the pressure of perfectionism.',
  },
};

export interface ProfileInfo {
  key: ProfileKey;
  name: string;
  nameEn?: string;
  shortDesc: string;
  shortDescEn?: string;
  longDesc: string;
  longDescEn?: string;
  theme: string;          // ana yaşam teması
  themeEn?: string;
}

export const PROFILES: Record<ProfileKey, ProfileInfo> = {
  '1/3': {
    key: '1/3',
    name: 'Araştırmacı / Şehit',
    nameEn: 'Investigator / Martyr',
    theme: 'Hayatı denemek için derin temeller arar',
    themeEn: 'Seeks deep foundations in order to experiment with life',
    shortDesc:
      'Önce sağlam zemin kurar, sonra deneyerek öğrenir. Hatalar onun verisidir; bilgelik buradan doğar.',
    shortDescEn:
      'First builds solid ground, then learns by experimenting. Mistakes are their data; wisdom is born from them.',
    longDesc:
      'Bu profil, içsel olarak yaşar (kişisel sürecine yönelir). Önce her şeyi araştırma içgüdüsü taşır; ardından deneme-yanılma yoluyla bilgisini doğrular. Sürtüşmesiz bir hayat onun için durağan bir hayattır; çarpışmadan büyümez. İlişkiler ve projeler kurulur, çözülür, yeniden kurulur. Sağlam temel ile cesur deneme arasında salınır.',
    longDescEn:
      'This profile lives internally (oriented toward its own personal process). It first carries the instinct to investigate everything, then validates its knowledge through trial and error. A life without friction is a stagnant life for them; they do not grow without bumping into things. Relationships and projects are built, dissolved and rebuilt. They swing between solid foundation and bold experimentation.',
  },
  '1/4': {
    key: '1/4',
    name: 'Araştırmacı / Fırsatçı',
    nameEn: 'Investigator / Opportunist',
    theme: 'Sağlam temeli yakın çevresine taşıyan araştırmacı',
    themeEn: 'An investigator who carries a solid foundation out to their close circle',
    shortDesc:
      'Bilgiyi güvendiği insan ağı üzerinden paylaşır. İçsel kapı dışsal ağ aracılığıyla açılır.',
    shortDescEn:
      'Shares knowledge through a network of people they trust. The inner door opens by way of the outer network.',
    longDesc:
      'Bu profil, içsel olarak yaşar. Önce sağlam bilgi temelini kurar, sonra bunu yakın çevresinde paylaşır. Hayat değişimleri çoğunlukla "tanıdığın bir tanıdık" üzerinden gelir. Bağlantılar yaşamsaldır; ağ sağlamsa kapılar tıkırdar.',
    longDescEn:
      'This profile lives internally. It first builds a solid foundation of knowledge, then shares it within its close circle. Life changes usually come through \'a friend of a friend\'. Connections are vital; if the network is sound, the doors open.',
  },
  '2/4': {
    key: '2/4',
    name: 'Münzevi / Fırsatçı',
    nameEn: 'Hermit / Opportunist',
    theme: 'Doğal yeteneğini yakın çevresi keşfeder',
    themeEn: 'Their natural talent is discovered by their close circle',
    shortDesc:
      'Yalnızlığında hediyesini taşır; çevresi onu görür ve çağırır. Çağrı geldiğinde sahneye çıkar.',
    shortDescEn:
      'Carries their gift in their solitude; their circle sees them and calls them out. When the call comes, they step onto the stage.',
    longDesc:
      'Bu profil, içsel olarak yaşar. Doğasında bir hediye taşır ama bunu öğrenmiş değildir; yalnız zamanlarında ortaya çıkar. Yakın dostlar, akrabalar, eski tanıdıklar onu fark eder ve çağırır. Çağrılmadan kendini göstermek bu profili yorar; çağrıyla harekete geçtiğinde parlar.',
    longDescEn:
      'This profile lives internally. It carries a gift by nature, but did not learn it; it surfaces in their alone time. Close friends, relatives and old acquaintances notice them and call them out. Showing themselves before being called tires this profile; they shine when they move in response to the call.',
  },
  '2/5': {
    key: '2/5',
    name: 'Münzevi / Yansıtıcı',
    nameEn: 'Hermit / Heretic',
    theme: 'Yalnız hediyesi pratik bir kurtarıcıya dönüşür',
    themeEn: 'Their solitary gift turns into a practical rescuer',
    shortDesc:
      'Doğal yeteneğini, üzerine yansıtılan beklentilerle dış dünyaya çıkarır. Hem mahrem hem misyon insanı.',
    shortDescEn:
      'Brings their natural talent out into the world through the expectations projected onto them. Both a private person and a person of mission.',
    longDesc:
      'Bu profil, hem içsel hem dışsal yaşam taşır. Yalnız doğasında hediyesi vardır; ama dış dünyada bir "kurtarıcı" gibi çağırılır. İçeride mahrem kalmak ister, dışarıda görünür olmak gerekir. Bu gerilimi yaşamak öğretmenidir.',
    longDescEn:
      'This profile carries both an internal and an external life. It has a gift in its solitary nature, yet in the outer world it is called upon as a \'rescuer\'. Inwardly it wants to stay private, while outwardly it must be visible. Living this tension is its teacher.',
  },
  '3/5': {
    key: '3/5',
    name: 'Şehit / Yansıtıcı',
    nameEn: 'Martyr / Heretic',
    theme: 'Deneyerek öğrendiklerini topluma sunar',
    themeEn: 'Offers what they learned by experimenting to the collective',
    shortDesc:
      'Hayatı bizzat deneyimleyerek öğrenir; sonra bu pratik bilgeliği başkalarının krizine çözüm olarak sunar.',
    shortDescEn:
      'Learns life by experiencing it firsthand; then offers this practical wisdom as a solution to others\' crises.',
    longDesc:
      'Bu profil, dışsal olarak yaşar. Deneme-yanılma yoluyla bilgi toplar; bu bilgi başkalarının kullanması içindir. Yansıtmaların yükünü taşır; insanlar ondan beklenti yükler. Pratik, problem çözücü ve mistik bir çekiciliği vardır.',
    longDescEn:
      'This profile lives externally. It gathers knowledge through trial and error; this knowledge is for others to use. It carries the burden of projections; people load expectations onto it. It has a practical, problem-solving and mysterious allure.',
  },
  '3/6': {
    key: '3/6',
    name: 'Şehit / Rol Modeli',
    nameEn: 'Martyr / Role Model',
    theme: 'Genç hatalar bilge bir rol modeline dönüşür',
    themeEn: 'Youthful mistakes turn into a wise role model',
    shortDesc:
      'Üç evreli bir yaşam: ilk 30 yıl deneyim, sonra çatıdan gözleme, sonunda rol modeli olma.',
    shortDescEn:
      'A life in three phases: the first 30 years of experience, then observing from the roof, and finally becoming a role model.',
    longDesc:
      'Bu profil, dışsal olarak yaşar. İlk yarısı denemelerle, ilişki başlangıçları ve bitişleriyle, kendini deneyerek geçer. 30 sonrası çatıdan izlemeye geçer; mesafe alır. 50 sonrası bilgeliği rol modeli olarak hayatın merkezine geri döner.',
    longDescEn:
      'This profile lives externally. Its first half passes in experiments, in the beginnings and endings of relationships, testing itself. After 30 it shifts to observing from the roof; it takes distance. After 50 its wisdom returns to the center of life as a role model.',
  },
  '4/6': {
    key: '4/6',
    name: 'Fırsatçı / Rol Modeli',
    nameEn: 'Opportunist / Role Model',
    theme: 'Ağ insanı, zamanla bilge bir rol modeline dönüşür',
    themeEn: 'A networker who in time turns into a wise role model',
    shortDesc:
      'Hayatı yakın çevresi üzerinden ilerletirken, üç evreli rol modeli yolculuğu yaşar.',
    shortDescEn:
      'While advancing life through their close circle, they live the three-phase role-model journey.',
    longDesc:
      'Bu profil, dışsal olarak yaşar. Bağlantıları bağışlanmış gibidir; doğru ilişkiler hayatını taşır. 30 sonrası çatıya çekilir, izler; 50 sonrası otantik bir rol modeli olarak topluma örnek olur.',
    longDescEn:
      'This profile lives externally. Its connections feel like a gift; the right relationships carry its life. After 30 it withdraws to the roof and observes; after 50 it becomes an example to the collective as an authentic role model.',
  },
  '4/1': {
    key: '4/1',
    name: 'Fırsatçı / Araştırmacı',
    nameEn: 'Opportunist / Investigator',
    theme: 'Ağı sağlam, temelleri sabit',
    themeEn: 'A solid network, fixed foundations',
    shortDesc:
      'Sabit temeller üzerine yakın bağlar. Daha az değişen, daha kararlı ve odaklı bir yapı.',
    shortDescEn:
      'Close bonds built on fixed foundations. A more stable, more steadfast and focused structure that changes less.',
    longDesc:
      'Bu, nadir bir "kalıcı" profildir. Hem içsel hem dışsal yaşar; ama her iki çizgi de "sabit" niteliklidir. Kolayca dönüşmez; köklendiği zemin ve ağ üzerinden sağlam, uzun vadeli işler kurar.',
    longDescEn:
      'This is a rare \'fixed\' profile. It lives both internally and externally, yet both lines are \'fixed\' in nature. It does not transform easily; it builds solid, long-term ventures through the ground and network it is rooted in.',
  },
  '5/1': {
    key: '5/1',
    name: 'Yansıtıcı / Araştırmacı',
    nameEn: 'Heretic / Investigator',
    theme: 'Sağlam temele sahip pratik çözücü',
    themeEn: 'A practical problem-solver with a solid foundation',
    shortDesc:
      'Önce derinlemesine araştırır, sonra dışarıya pratik bir uzman olarak çıkar. Krizlerin adamıdır.',
    shortDescEn:
      'First investigates deeply, then steps out into the world as a practical expert. The person for a crisis.',
    longDesc:
      'Bu profil, dışsal olarak yaşar. Üzerine yansıtmalar düşer; insanlar ondan çözüm bekler. Bunu karşılayabilmek için sağlam bir bilgi temeline ihtiyaç duyar. Beklenti baskısı zaman zaman ağırdır; doğru zamanlama hayatidir.',
    longDescEn:
      'This profile lives externally. Projections fall on it; people expect solutions from it. To meet this it needs a solid foundation of knowledge. The pressure of expectation is at times heavy; right timing is vital.',
  },
  '5/2': {
    key: '5/2',
    name: 'Yansıtıcı / Münzevi',
    nameEn: 'Heretic / Hermit',
    theme: 'Misyonu çağırır, münzevisi geri çeker',
    themeEn: 'Their mission calls them out, their hermit pulls them back',
    shortDesc:
      'Dışarıda kurtarıcı, içeride yalnızlığa ihtiyacı olan biri. Çağrıldığında çıkar, çağrılmadığında görünmez.',
    shortDescEn:
      'A rescuer on the outside, someone who needs solitude on the inside. Comes out when called, invisible when not.',
    longDesc:
      'Bu profil, dışsal olarak yaşar ama yalnız doğal yeteneği vardır. Kalabalığa çıkmak yorar; ama çağrıldığında pratik çözüm sunar. Yalnız kalma hakkı kendi enerjisinin temelidir.',
    longDescEn:
      'This profile lives externally but has a solitary natural talent. Going out into crowds tires it, yet when called it offers practical solutions. Its right to be alone is the foundation of its own energy.',
  },
  '6/2': {
    key: '6/2',
    name: 'Rol Modeli / Münzevi',
    nameEn: 'Role Model / Hermit',
    theme: 'Çatıdan izleyen, yalnız doğal hediyeli',
    themeEn: 'Observes from the roof, gifted in solitude by nature',
    shortDesc:
      'Yaşamın üç evresinde de yalnız zamanlarına ihtiyaç duyar. Bilgeliği sessizce taşır.',
    shortDescEn:
      'Needs alone time in all three phases of life. Carries their wisdom quietly.',
    longDesc:
      'Bu profil, hem içsel hem dışsal yaşar. Üç evreli rol modeli yolculuğunu, yalnız doğasıyla birlikte yürür. Geri çekildiği yıllarda kendini biriktirir; sahnede otantik olarak görünür.',
    longDescEn:
      'This profile lives both internally and externally. It walks the three-phase role-model journey together with its solitary nature. In its years of withdrawal it gathers itself; on stage it appears authentically.',
  },
  '6/3': {
    key: '6/3',
    name: 'Rol Modeli / Şehit',
    nameEn: 'Role Model / Martyr',
    theme: 'Deneyimden geçen otantik rol modeli',
    themeEn: 'An authentic role model forged through experience',
    shortDesc:
      'Hayatın üç evresinde de denemeye devam eder. Otantikliği "her şeyi gördüm" temeline dayanır.',
    shortDescEn:
      'Keeps experimenting through all three phases of life. Their authenticity rests on the foundation of \'I have seen it all\'.',
    longDesc:
      'Bu profil, dışsal olarak yaşar. İlk yarısı çarpışmalarla geçer; çatıdan izlerken bile denemeye devam eder. Rol modeli olduğunda, bu otantiklik onun en büyük gücüdür: sadece konuşmaz, yaşamıştır.',
    longDescEn:
      'This profile lives externally. Its first half passes in collisions; it keeps experimenting even while observing from the roof. When it becomes a role model, this authenticity is its greatest strength: it does not merely talk, it has lived it.',
  },
};
