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
  nameEn?: string;
  emoji: string;
  shortDesc: string;
  shortDescEn?: string;
  howToDecide: string[];
  howToDecideEn?: string[];
  caution: string;
  cautionEn?: string;
}

export const AUTHORITIES: Record<AuthorityKey, AuthorityInfo> = {
  emotional: {
    key: 'emotional',
    name: 'Duygusal Yetki',
    nameEn: 'Emotional Authority',
    emoji: '🌊',
    shortDesc:
      'Solar Plexus tanımlı. Net karar yoktur; bir duygu dalgasından geçerek netliğe ulaşılır. Karar ancak dalga durulduğunda doğrudur.',
    shortDescEn:
      'Solar Plexus defined. There is no clarity in the moment; clarity comes by riding through an emotional wave. A decision is only true once the wave has settled.',
    howToDecide: [
      'Bir karar karşısında anında "evet" deme; üzerinde uyu.',
      'Yüksek noktada heyecanla ya da düşük noktada üzüntüyle karar verme.',
      'Birkaç gün boyunca karara farklı duygu durumlarında bak; aynı kalıyor mu?',
      'Netlik ancak duygusal salınımın sönümlenmesiyle gelir.',
    ],
    howToDecideEn: [
      'Never say \'yes\' to a decision on the spot; sleep on it.',
      'Don\'t decide from excitement at the high or from sadness at the low.',
      'Look at the decision over several days in different moods; does it stay the same?',
      'Clarity comes only as the emotional swing dampens down.',
    ],
    caution: 'Aceleci kararlar duygusal yetkiyi atlatır; pişmanlık yaratır.',
    cautionEn: 'Hasty decisions bypass emotional authority and lead to regret.',
  },
  sacral: {
    key: 'sacral',
    name: 'Sakral Yetki',
    nameEn: 'Sacral Authority',
    emoji: '🌱',
    shortDesc:
      'Sakral tanımlı, Solar Plexus tanımsız. Anlık beden yanıtıyla karar verilir: göğüsten gelen "uh-huh" / "un-uh".',
    shortDescEn:
      'Sacral defined, Solar Plexus undefined. Decisions are made through the immediate response of the body: the gut\'s \'uh-huh\' / \'un-uh\'.',
    howToDecide: [
      'Karşına çıkan şeye anlık beden tepkini dinle.',
      'Beynin değil, karnının/sakralinin sesini takip et.',
      'Sana evet/hayırlı sorular sordurarak yanıt çıkmasına izin ver.',
      'Yanıtın yoksa o anda doğru karar mevcut değildir.',
    ],
    howToDecideEn: [
      'Listen to your immediate bodily response to whatever shows up.',
      'Follow the voice of your gut/sacral, not your head.',
      'Let others ask you yes/no questions so the response can surface.',
      'If there is no response, the right decision isn\'t available in that moment.',
    ],
    caution: 'Beynin gerekçeleri sakral yanıtın yerine geçemez.',
    cautionEn: 'The mind\'s reasons can never substitute for the sacral response.',
  },
  splenic: {
    key: 'splenic',
    name: 'Splenik Yetki',
    nameEn: 'Splenic Authority',
    emoji: '🪶',
    shortDesc:
      'Spleen tanımlı, Solar Plexus ve Sakral tanımsız. Anlık, sessiz, fısıltı gibi içgüdüsel bir farkındalık.',
    shortDescEn:
      'Spleen defined, Solar Plexus and Sacral undefined. An instinctive awareness that is instantaneous, quiet and whisper-like.',
    howToDecide: [
      'Şu an hissedilen sezgiyi takip et; tekrar etmez.',
      'İlk içsel sinyal genellikle doğrudur.',
      'Korkudan çok mevcut anın güvenliğine odaklı bir farkındalıktır.',
      'Hızlı, sessiz ve tekrar etmeyen bilgiyi yakala.',
    ],
    howToDecideEn: [
      'Follow the intuition felt right now; it doesn\'t repeat itself.',
      'The first inner signal is usually the right one.',
      'It is an awareness focused on the safety of the present moment rather than on fear.',
      'Catch the knowing that is fast, quiet and non-repeating.',
    ],
    caution: 'Splenik yetki sessizdir; gürültü ve kalabalıkta kaçırılır.',
    cautionEn: 'Splenic authority is quiet; it gets missed amid noise and crowds.',
  },
  ego: {
    key: 'ego',
    name: 'Kalp / Ego Yetki',
    nameEn: 'Heart / Ego Authority',
    emoji: '👑',
    shortDesc:
      'Heart merkezi tanımlı, Solar Plexus, Sakral ve Spleen tanımsız. Kararı kalbin/iradenin sesi verir: "ben istiyorum mu?".',
    shortDescEn:
      'Heart center defined, Solar Plexus, Sacral and Spleen undefined. The decision is given by the voice of the heart/willpower: \'do I want this?\'.',
    howToDecide: [
      'Kararı duyarken kalbinden ne çıkıyor: istek mi, yorgunluk mu?',
      'Konuşurken sesli düşün; ağzından çıkan kelimelere kulak ver.',
      'Kalbin "var mıyım?" sorusuna verdiği yanıtı dinle.',
      'İrade ve kişisel arzu burada otoritedir.',
    ],
    howToDecideEn: [
      'As you hear the decision, what comes from your heart: desire or fatigue?',
      'Think out loud as you speak; pay attention to the words that come out of your mouth.',
      'Listen to how your heart answers the question \'am I in?\'.',
      'Willpower and personal desire are the authority here.',
    ],
    caution: 'Başkalarını memnun etmek için söz vermeye karşı dikkatli ol.',
    cautionEn: 'Be careful about making promises just to please others.',
  },
  'self-projected': {
    key: 'self-projected',
    name: 'Kendine Projekte Yetki',
    nameEn: 'Self-Projected Authority',
    emoji: '🪞',
    shortDesc:
      'G-Center tanımlı ve boğaza bağlı; alt motorlar tanımsız. Karar konuşmaktan, kendi sesini duymaktan çıkar.',
    shortDescEn:
      'G-Center defined and connected to the Throat; the lower motors are undefined. The decision emerges from talking and from hearing your own voice.',
    howToDecide: [
      'Güvendiğin bir dostla yüksek sesle konuş.',
      'Söylerken sesinin tonu yumuşadığında ya da güçlendiğinde dikkat et.',
      'Karşındaki tavsiye vermesin; sadece dinlesin.',
      'Doğru yön, kendi sesinden çıkan kimliğin gerçeğidir.',
    ],
    howToDecideEn: [
      'Talk it through out loud with a friend you trust.',
      'Notice when the tone of your voice softens or strengthens as you speak.',
      'Have the other person simply listen, not give advice.',
      'The right direction is the truth of your identity that comes out in your own voice.',
    ],
    caution: 'İçinden konuşmak yetmez; sesli duymak gerekir.',
    cautionEn: 'Talking to yourself internally isn\'t enough; you need to hear it aloud.',
  },
  mental: {
    key: 'mental',
    name: 'Zihinsel / Çevresel Yetki',
    nameEn: 'Mental / Environmental Authority',
    emoji: '🌬️',
    shortDesc:
      'Sadece bilinçli alan ve geçirgen merkezler. Karar tek başına değil, doğru çevre ve doğru ses tahtaları aracılığıyla çıkar.',
    shortDescEn:
      'Only the conscious field and open centers. The decision emerges not alone, but through the right environment and the right sounding boards.',
    howToDecide: [
      'Birden fazla güvendiğin kişiyle konuş.',
      'Doğru fiziksel mekan ve doğru insanlar netliğe götürür.',
      'Karara tek başına oturma; geçirgen merkezler aldatabilir.',
      'Sözcükler dökerken hangi ortamın seni desteklediğini fark et.',
    ],
    howToDecideEn: [
      'Talk it through with more than one person you trust.',
      'The right physical place and the right people lead you to clarity.',
      'Don\'t sit with the decision alone; open centers can deceive you.',
      'As you put it into words, notice which environment supports you.',
    ],
    caution: 'Zihin karar veremez; ses tahtası gerekir.',
    cautionEn: 'The mind cannot decide; a sounding board is required.',
  },
  lunar: {
    key: 'lunar',
    name: 'Lunar / Ay Yetki (Reflektör)',
    nameEn: 'Lunar Authority (Reflector)',
    emoji: '🌕',
    shortDesc:
      'Hiçbir merkez tanımlı değil. Büyük kararlar 28 günlük tam ay döngüsü beklenerek alınır.',
    shortDescEn:
      'No center is defined. Major decisions are made by waiting out a full 28-day lunar cycle.',
    howToDecide: [
      'Önemli bir karara karşı 28 gün bekle.',
      'Ay döngüsünün her gününde farklı bir merkez aktive olur; kararı bu süreçte süzersin.',
      'Bu süreçte farklı insanlarla konuş; aynı şeyi tekrar tekrar duy.',
      'Hayretle / sürprizle ilerlemek doğru yöne işarettir.',
    ],
    howToDecideEn: [
      'Wait 28 days before an important decision.',
      'On each day of the lunar cycle a different center is activated; you filter the decision through this process.',
      'During this time talk with different people; hear the same thing again and again.',
      'Moving forward with wonder / surprise is a sign of the right direction.',
    ],
    caution: 'Ay döngüsünü atlama; aceleci kararlar derin yorgunluk yaratır.',
    cautionEn: 'Don\'t skip the lunar cycle; hasty decisions create deep exhaustion.',
  },
  none: {
    key: 'none',
    name: 'Belirsiz Yetki',
    nameEn: 'Undetermined Authority',
    emoji: '·',
    shortDesc: 'Yetki tespit edilemedi.',
    shortDescEn: 'Authority could not be determined.',
    howToDecide: [],
    howToDecideEn: [],
    caution: '',
    cautionEn: '',
  },
};
