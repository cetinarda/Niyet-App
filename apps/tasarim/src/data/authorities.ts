export type AuthorityKey =
  | 'emotional'
  | 'sacral'
  | 'splenic'
  | 'ego'
  | 'self-projected'
  | 'mental'
  | 'lunar'
  | 'none';

export interface AuthorityInfo {
  key: AuthorityKey;
  name: string;
  emoji: string;
  shortDesc: string;
  howToDecide: string[];
  caution: string;
}

export const AUTHORITIES: Record<AuthorityKey, AuthorityInfo> = {
  emotional: {
    key: 'emotional',
    name: 'Duygusal Yetki',
    emoji: '🌊',
    shortDesc:
      'Solar Plexus tanımlı. Net karar yoktur; bir duygu dalgasından geçerek netliğe ulaşılır. Karar ancak dalga durulduğunda doğrudur.',
    howToDecide: [
      'Bir karar karşısında anında "evet" deme; üzerinde uyu.',
      'Yüksek noktada heyecanla ya da düşük noktada üzüntüyle karar verme.',
      'Birkaç gün boyunca karara farklı duygu durumlarında bak; aynı kalıyor mu?',
      'Netlik ancak duygusal salınımın sönümlenmesiyle gelir.',
    ],
    caution: 'Aceleci kararlar duygusal yetkiyi atlatır; pişmanlık yaratır.',
  },
  sacral: {
    key: 'sacral',
    name: 'Sakral Yetki',
    emoji: '🌱',
    shortDesc:
      'Sakral tanımlı, Solar Plexus tanımsız. Anlık beden yanıtıyla karar verilir: göğüsten gelen "uh-huh" / "un-uh".',
    howToDecide: [
      'Karşına çıkan şeye anlık beden tepkini dinle.',
      'Beynin değil, karnının/sakralinin sesini takip et.',
      'Sana evet/hayırlı sorular sordurarak yanıt çıkmasına izin ver.',
      'Yanıtın yoksa o anda doğru karar mevcut değildir.',
    ],
    caution: 'Beynin gerekçeleri sakral yanıtın yerine geçemez.',
  },
  splenic: {
    key: 'splenic',
    name: 'Splenik Yetki',
    emoji: '🪶',
    shortDesc:
      'Spleen tanımlı, Solar Plexus ve Sakral tanımsız. Anlık, sessiz, fısıltı gibi içgüdüsel bir farkındalık.',
    howToDecide: [
      'Şu an hissedilen sezgiyi takip et; tekrar etmez.',
      'İlk içsel sinyal genellikle doğrudur.',
      'Korkudan çok mevcut anın güvenliğine odaklı bir farkındalıktır.',
      'Hızlı, sessiz ve tekrar etmeyen bilgiyi yakala.',
    ],
    caution: 'Splenik yetki sessizdir; gürültü ve kalabalıkta kaçırılır.',
  },
  ego: {
    key: 'ego',
    name: 'Kalp / Ego Yetki',
    emoji: '👑',
    shortDesc:
      'Heart merkezi tanımlı, Solar Plexus, Sakral ve Spleen tanımsız. Kararı kalbin/iradenin sesi verir: "ben istiyorum mu?".',
    howToDecide: [
      'Kararı duyarken kalbinden ne çıkıyor: istek mi, yorgunluk mu?',
      'Konuşurken sesli düşün; ağzından çıkan kelimelere kulak ver.',
      'Kalbin "var mıyım?" sorusuna verdiği yanıtı dinle.',
      'İrade ve kişisel arzu burada otoritedir.',
    ],
    caution: 'Başkalarını memnun etmek için söz vermeye karşı dikkatli ol.',
  },
  'self-projected': {
    key: 'self-projected',
    name: 'Kendine Projekte Yetki',
    emoji: '🪞',
    shortDesc:
      'G-Center tanımlı ve boğaza bağlı; alt motorlar tanımsız. Karar konuşmaktan, kendi sesini duymaktan çıkar.',
    howToDecide: [
      'Güvendiğin bir dostla yüksek sesle konuş.',
      'Söylerken sesinin tonu yumuşadığında ya da güçlendiğinde dikkat et.',
      'Karşındaki tavsiye vermesin; sadece dinlesin.',
      'Doğru yön, kendi sesinden çıkan kimliğin gerçeğidir.',
    ],
    caution: 'İçinden konuşmak yetmez; sesli duymak gerekir.',
  },
  mental: {
    key: 'mental',
    name: 'Zihinsel / Çevresel Yetki',
    emoji: '🌬️',
    shortDesc:
      'Sadece bilinçli alan ve geçirgen merkezler. Karar tek başına değil, doğru çevre ve doğru ses tahtaları aracılığıyla çıkar.',
    howToDecide: [
      'Birden fazla güvendiğin kişiyle konuş.',
      'Doğru fiziksel mekan ve doğru insanlar netliğe götürür.',
      'Karara tek başına oturma; geçirgen merkezler aldatabilir.',
      'Sözcükler dökerken hangi ortamın seni desteklediğini fark et.',
    ],
    caution: 'Zihin karar veremez; ses tahtası gerekir.',
  },
  lunar: {
    key: 'lunar',
    name: 'Lunar / Ay Yetki (Reflektör)',
    emoji: '🌕',
    shortDesc:
      'Hiçbir merkez tanımlı değil. Büyük kararlar 28 günlük tam ay döngüsü beklenerek alınır.',
    howToDecide: [
      'Önemli bir karara karşı 28 gün bekle.',
      'Ay döngüsünün her gününde farklı bir merkez aktive olur; kararı bu süreçte süzersin.',
      'Bu süreçte farklı insanlarla konuş; aynı şeyi tekrar tekrar duy.',
      'Hayretle / sürprizle ilerlemek doğru yöne işarettir.',
    ],
    caution: 'Ay döngüsünü atlama; aceleci kararlar derin yorgunluk yaratır.',
  },
  none: {
    key: 'none',
    name: 'Belirsiz Yetki',
    emoji: '·',
    shortDesc: 'Yetki tespit edilemedi.',
    howToDecide: [],
    caution: '',
  },
};
