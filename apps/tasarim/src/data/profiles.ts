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
      'Üç evreli yaşam: 0–30 deneme, 30–50 çatıdan izleme, 50+ rol modelliği. Otantik örnek olur.',
    shortDescEn:
      'A life in three phases: 0–30 experimenting, 30–50 observing from the roof, 50+ being a role model. Becomes an authentic example.',
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
    theme: 'Hayatı denemek için derin temeller arar',
    shortDesc:
      'Önce sağlam zemin kurar, sonra deneyerek öğrenir. Hatalar onun verisidir; bilgelik buradan doğar.',
    longDesc:
      'Bu profil, içsel olarak yaşar (kişisel sürecine yönelir). Önce her şeyi araştırma içgüdüsü taşır; ardından deneme-yanılma yoluyla bilgisini doğrular. Sürtüşmesiz bir hayat onun için durağan bir hayattır; çarpışmadan büyümez. İlişkiler ve projeler kurulur, çözülür, yeniden kurulur. Sağlam temel ile cesur deneme arasında salınır.',
  },
  '1/4': {
    key: '1/4',
    name: 'Araştırmacı / Fırsatçı',
    theme: 'Sağlam temeli yakın çevresine taşıyan araştırmacı',
    shortDesc:
      'Bilgiyi güvendiği insan ağı üzerinden paylaşır. İçsel kapı dışsal ağ aracılığıyla açılır.',
    longDesc:
      'Bu profil, içsel olarak yaşar. Önce sağlam bilgi temelini kurar, sonra bunu yakın çevresinde paylaşır. Hayat değişimleri çoğunlukla "tanıdığın bir tanıdık" üzerinden gelir. Bağlantılar yaşamsaldır; ağ sağlamsa kapılar tıkırdar.',
  },
  '2/4': {
    key: '2/4',
    name: 'Münzevi / Fırsatçı',
    theme: 'Doğal yeteneğini yakın çevresi keşfeder',
    shortDesc:
      'Yalnızlığında hediyesini taşır; çevresi onu görür ve çağırır. Çağrı geldiğinde sahneye çıkar.',
    longDesc:
      'Bu profil, içsel olarak yaşar. Doğasında bir hediye taşır ama bunu öğrenmiş değildir; yalnız zamanlarında ortaya çıkar. Yakın dostlar, akrabalar, eski tanıdıklar onu fark eder ve çağırır. Çağrılmadan kendini göstermek bu profili yorar; çağrıyla harekete geçtiğinde parlar.',
  },
  '2/5': {
    key: '2/5',
    name: 'Münzevi / Yansıtıcı',
    theme: 'Yalnız hediyesi pratik bir kurtarıcıya dönüşür',
    shortDesc:
      'Doğal yeteneğini, üzerine yansıtılan beklentilerle dış dünyaya çıkarır. Hem mahrem hem misyon insanı.',
    longDesc:
      'Bu profil, hem içsel hem dışsal yaşam taşır. Yalnız doğasında hediyesi vardır; ama dış dünyada bir "kurtarıcı" gibi çağırılır. İçeride mahrem kalmak ister, dışarıda görünür olmak gerekir. Bu gerilimi yaşamak öğretmenidir.',
  },
  '3/5': {
    key: '3/5',
    name: 'Şehit / Yansıtıcı',
    theme: 'Deneyerek öğrendiklerini topluma sunar',
    shortDesc:
      'Hayatı bizzat deneyimleyerek öğrenir; sonra bu pratik bilgeliği başkalarının krizine çözüm olarak sunar.',
    longDesc:
      'Bu profil, dışsal olarak yaşar. Deneme-yanılma yoluyla bilgi toplar; bu bilgi başkalarının kullanması içindir. Yansıtmaların yükünü taşır; insanlar ondan beklenti yükler. Pratik, problem çözücü ve mistik bir çekiciliği vardır.',
  },
  '3/6': {
    key: '3/6',
    name: 'Şehit / Rol Modeli',
    theme: 'Genç hatalar bilge bir rol modeline dönüşür',
    shortDesc:
      'Üç evreli bir yaşam: ilk 30 yıl deneyim, sonra çatıdan gözleme, sonunda rol modeli olma.',
    longDesc:
      'Bu profil, dışsal olarak yaşar. İlk yarısı denemelerle, ilişki başlangıçları ve bitişleriyle, kendini deniyerek geçer. 30 sonrası çatıdan izlemeye geçer; mesafe alır. 50 sonrası bilgeliği rol modeli olarak hayatın merkezine geri döner.',
  },
  '4/6': {
    key: '4/6',
    name: 'Fırsatçı / Rol Modeli',
    theme: 'Ağ insanı, zamanla bilge bir rol modeline dönüşür',
    shortDesc:
      'Hayatı yakın çevresi üzerinden ilerletirken, üç evreli rol modeli yolculuğu yaşar.',
    longDesc:
      'Bu profil, dışsal olarak yaşar. Bağlantıları bağışlanmış gibidir; doğru ilişkiler hayatını taşır. 30 sonrası çatıya çekilir, izler; 50 sonrası otantik bir rol modeli olarak topluma örnek olur.',
  },
  '4/1': {
    key: '4/1',
    name: 'Fırsatçı / Araştırmacı',
    theme: 'Ağı sağlam, temelleri sabit',
    shortDesc:
      'Sabit temeller üzerine yakın bağlar. Daha az değişen, daha kararlı ve odaklı bir yapı.',
    longDesc:
      'Bu nadir bir "kalıcı" profilidir. Hem içsel hem dışsal yaşar; ama her iki çizgi de "sabit" niteliklidir. Kolayca dönüşmez; köklendiği zemin ve ağ üzerinden sağlam, uzun vadeli işler kurar.',
  },
  '5/1': {
    key: '5/1',
    name: 'Yansıtıcı / Araştırmacı',
    theme: 'Sağlam temele sahip pratik çözücü',
    shortDesc:
      'Önce derinlemesine araştırır, sonra dışarıya pratik bir uzman olarak çıkar. Krizlerin adamıdır.',
    longDesc:
      'Bu profil, dışsal olarak yaşar. Üzerine yansıtmalar düşer; insanlar ondan çözüm bekler. Bunu karşılayabilmek için sağlam bir bilgi temeline ihtiyaç duyar. Beklenti baskısı zaman zaman ağırdır; doğru zamanlama hayatidir.',
  },
  '5/2': {
    key: '5/2',
    name: 'Yansıtıcı / Münzevi',
    theme: 'Misyonu çağırır, münzevisi geri çeker',
    shortDesc:
      'Dışarıda kurtarıcı, içeride yalnızlığa ihtiyacı olan biri. Çağrıldığında çıkar, çağrılmadığında görünmez.',
    longDesc:
      'Bu profil, dışsal olarak yaşar ama yalnız doğal yeteneği vardır. Kalabalığa çıkmak yorar; ama çağrıldığında pratik çözüm sunar. Yalnız kalmaya hakkı kendi enerjisinin temelidir.',
  },
  '6/2': {
    key: '6/2',
    name: 'Rol Modeli / Münzevi',
    theme: 'Çatıdan izleyen, yalnız doğal hediyeli',
    shortDesc:
      'Yaşamın üç evresinde de yalnız zamanlarına ihtiyaç duyar. Bilgeliği sessizce taşır.',
    longDesc:
      'Bu profil, hem içsel hem dışsal yaşar. Üç evreli rol modeli yolculuğunu, yalnız doğasıyla birlikte yürür. Geri çekildiği yıllarda kendini biriktirir; sahnede otantik olarak görünür.',
  },
  '6/3': {
    key: '6/3',
    name: 'Rol Modeli / Şehit',
    theme: 'Deneyimden geçen otantik rol modeli',
    shortDesc:
      'Hayatın üç evresinde de denemeye devam eder. Otantikliği "her şeyi gördüm" temeline dayanır.',
    longDesc:
      'Bu profil, dışsal olarak yaşar. İlk yarısı çarpışmalarla geçer; çatıdan izlerken bile denemeye devam eder. Rol modeli olduğunda, bu otantiklik onun en büyük gücüdür: sadece konuşmaz, yaşamıştır.',
  },
};
