export type GlossaryEntry = {
  id: string;
  category: 'numerology' | 'astrology' | 'humandesign' | 'chakra' | 'biorhythm' | 'systems' | 'starseed';
  term: string;
  description: string;
};

export const GLOSSARY: GlossaryEntry[] = [
  // NUMEROLOJİ
  {
    id: 'life-path',
    category: 'numerology',
    term: 'Yaşam Yolu Sayısı (Life Path Number)',
    description:
      'Doğum tarihindeki tüm rakamların tek haneli bir sayıya (veya 11, 22, 33 usta sayılarına) indirgenmesiyle bulunan kişisel sayıdır. Hayat amacını, doğal yeteneklerini ve yaşam yolculuğunun temel enerjisini temsil eder.',
  },
  {
    id: 'personal-year',
    category: 'numerology',
    term: 'Kişisel Yıl Sayısı',
    description:
      'Doğum gününüz ve ayınız ile içinde bulunduğunuz yılın rakamlarının toplanmasıyla hesaplanır. 1-9 arasında döngüsel bir enerji haritası sunar. Her yıl farklı bir tema ve enerji getirir.',
  },
  {
    id: 'expression',
    category: 'numerology',
    term: 'İfade Sayısı',
    description:
      'Tam adınızdaki harflerin Pythagorean değerlerinin toplamından çıkarılır. Dünyaya nasıl ifade ettiğin, doğal yeteneklerin ve sosyal kimliğinin sayısal portresi.',
  },
  {
    id: 'soul-urge',
    category: 'numerology',
    term: 'Ruh Arzusu Sayısı',
    description:
      'Adının sadece sesli harflerinden hesaplanır. Derinde ne istediğin, hangi koşulda gerçekten doyduğun — ruhsal motivasyonun parmak izi.',
  },
  {
    id: 'reduce',
    category: 'numerology',
    term: 'İndirgeme (Reduce)',
    description:
      'Numerolojide çok haneli sayıları tek haneye düşürme işlemidir. Tüm rakamlar toplanır, sonuç 9\'dan büyükse tekrar toplanır. 11, 22 ve 33 "Usta Sayılar" olarak indirgenmez, özel anlamları korunur.',
  },

  // ASTROLOJİ
  {
    id: 'sun-sign',
    category: 'astrology',
    term: 'Burç (Güneş Burcu)',
    description:
      'Doğduğunuz tarihte Güneş\'in bulunduğu burçtur. Temel kişiliğinizi, egonuzu ve yaşam enerjinizi temsil eder.',
  },
  {
    id: 'moon-sign',
    category: 'astrology',
    term: 'Ay Burcu',
    description:
      'Doğum anında Ay\'ın bulunduğu burç. Duygusal iç dünyanı, çocukluk ihtiyaçlarını ve sezgisel zekânı yansıtır. Ay her ~2.5 günde bir burç değiştirir.',
  },
  {
    id: 'ascendant',
    category: 'astrology',
    term: 'Yükselen Burç (Ascendant)',
    description:
      'Doğum anında ufuk çizgisinde yükselen burçtur. Dış dünyanın sizi nasıl gördüğünü, fiziksel görünümünüzü ve ilk izleniminizi belirler. Hesaplamak için doğum saati gereklidir.',
  },
  {
    id: 'midheaven',
    category: 'astrology',
    term: 'MC (Tepe Noktası / Midheaven)',
    description:
      'Doğum anında gökyüzünün en tepesindeki noktadır. Kamuya açık imajını, mesleki yönünü ve dünyaya bırakacağın izi gösterir.',
  },
  {
    id: 'twelfth-house',
    category: 'astrology',
    term: '12. Ev & Yönetici Gezegen',
    description:
      'Astrolojide 12. ev bilinçaltını, gizli güçleri, spiritüel potansiyeli ve içsel dünyayı temsil eder. Her evin bir yönetici gezegeni vardır ve bu gezegen o evin temalarını nasıl deneyimlediğinizi belirler.',
  },
  {
    id: 'planet-powers',
    category: 'astrology',
    term: 'Gezegen Güçleri',
    description:
      'Her gezegen farklı bir yaşam alanını ve enerjiyi yönetir: Güneş (benlik), Ay (duygular), Merkür (iletişim), Venüs (sevgi), Mars (aksiyon), Jüpiter (genişleme), Satürn (disiplin), Uranüs (özgünlük), Neptün (hayal gücü), Pluto (dönüşüm).',
  },
  {
    id: 'north-node',
    category: 'astrology',
    term: 'Kuzey Ay Düğümü (Rahu)',
    description:
      'Bu hayattaki ruhsal görev, gelişim yönü ve büyüme istikametidir. Konfor alanının ötesinde, ruhun ulaşmayı seçtiği zirvenin pusulasıdır.',
  },
  {
    id: 'south-node',
    category: 'astrology',
    term: 'Güney Ay Düğümü (Ketu)',
    description:
      'Geçmiş yaşamlardan getirilen alışkanlıklar ve içgüdüsel beceriler. Aşırı kullanıldığında bizi geriye çeken konfor alanıdır.',
  },

  // HUMAN DESIGN
  {
    id: 'hd-type',
    category: 'humandesign',
    term: 'Human Design Tipi',
    description:
      'Beş ana tip vardır: Manifestor (başlatan), Generator (yanıt veren), Manifesting Generator (çoklu izli), Projector (gören), Reflector (yansıtan). Tip; doğru karar verme ritmini ve evrenle etkileşim mekaniğini belirler.',
  },
  {
    id: 'hd-strategy',
    category: 'humandesign',
    term: 'Strateji',
    description:
      'Her tipin dünyayla doğru etkileşim kurma yöntemi. Manifestor: bilgilendir & başlat. Generator: yanıt ver. Projector: davet bekle. Reflector: ay döngüsüyle ol.',
  },
  {
    id: 'hd-authority',
    category: 'humandesign',
    term: 'Otorite',
    description:
      'Karar verme yetkisinin bedeninde nereden geldiği: Solar Plexus (duygusal), Sakral (içgüdüsel evet/hayır), Spleen (anlık sezgi), Heart/Ego (irade), G (kendini yansıtan), Lunar (ay döngüsü). Zihin değil, beden karar verir.',
  },
  {
    id: 'hd-profile',
    category: 'humandesign',
    term: 'Profil',
    description:
      'Hayatı hangi ikili rolle yaşıyorsun: 1/3 (Araştırmacı-Şehit), 2/4 (Münzevi-Arkadaş), 5/1 (Heretik-Araştırmacı) gibi. İlk rakam bilinçli, ikincisi bilinçaltı tarafı temsil eder.',
  },
  {
    id: 'hd-incarnation',
    category: 'humandesign',
    term: 'Enkarnasyon Kapısı',
    description:
      'Doğum anındaki kişilik Güneş\'i ile tasarım Güneş\'inden çıkan kart. Bu yaşamın temel kozmik tematiğini ve ruhsal mührünü taşır.',
  },

  // ÇOK-SİSTEM
  {
    id: 'maya-tzolkin',
    category: 'systems',
    term: 'Maya Tzolkin · Kin',
    description:
      '260 günlük Maya kutsal takvimi. 20 gün mührü × 13 galaktik ton kombinasyonu ile Kin numaran çıkar. Her Kin benzersiz bir kozmik koordinattır.',
  },
  {
    id: 'vedic-nakshatra',
    category: 'systems',
    term: 'Vedik Nakshatra',
    description:
      'Ay\'ın bulunduğu 27 yıldız evinden biri. Lahiri ayanamsa ile sidereal hesap yapılır. Pada (1-4) kişiliğin alt katmanını detaylandırır. Her nakshatranın yöneten tanrısı ve sembolü vardır.',
  },
  {
    id: 'chinese-zodiac',
    category: 'systems',
    term: 'Çin Zodyak',
    description:
      '12 hayvan × 5 element × Yin/Yang ile 60 yıllık döngü. Doğum yılına göre hayvanın, elementin (Tahta/Ateş/Toprak/Metal/Su) ve polariten belirlenir. Çin Yeni Yılı bazlı.',
  },
  {
    id: 'norse-rune',
    category: 'systems',
    term: 'Norse Doğum Runu',
    description:
      'Elder Futhark\'ın 24 runundan doğum tarihine düşeni. Her rune bir tohum mührüdür; ham potansiyelini ve kuzey bilgeliği armağanını taşır.',
  },
  {
    id: 'tarot-birth',
    category: 'systems',
    term: 'Tarot Doğum Kartı',
    description:
      'Mary K. Greer formülüyle doğum tarihinden iki Major Arcana kartı çıkarılır: Kişilik (dış maske) + Ruh (öz mühür). Bu yaşamın arketipik tematiğini taşırlar.',
  },

  // YILDIZ IRKI
  {
    id: 'starseed',
    category: 'starseed',
    term: 'Yıldız Çocuk / Starseed',
    description:
      'Ruhsal kökeninin Dünya dışı bir yıldız sisteminden geldiğine inanan sembolik bir okuma. SoulProfile astrolojik + numerolojik desenlerden hangi galaktik arketiple en çok rezonansta olduğunu gösterir.',
  },
  {
    id: 'pleiadian',
    category: 'starseed',
    term: 'Pleiadyalı',
    description:
      'Ülker (Pleiades) takımyıldızı hattı. Kalp-merkezli, empatik, şifacı ruh. Sıklıkla 6 ve 33 Yaşam Yolu, Yengeç Ay veya Balık Venüs ile rezonans verir.',
  },
  {
    id: 'sirian',
    category: 'starseed',
    term: 'Siryan',
    description:
      'Sirius/Akyıldız hattı. Kadim bilge öğretmen, sırların taşıyıcısı. Oğlak veya Akrep yükselen, Satürn vurgulu haritalar, Yaşam Yolu 7 ve 22 ile çakışır.',
  },
  {
    id: 'arcturian',
    category: 'starseed',
    term: 'Arkturian',
    description:
      'Arcturus/Boğa Çobanı hattı. İleri teknoloji mühendisi, geometri ustası. Kova yükselen, Merkür Başak, Uranüs vurgulu desenlerde belirir.',
  },
  {
    id: 'andromedan',
    category: 'starseed',
    term: 'Andromedan',
    description:
      'Andromeda galaksisi hattı. Özgür kâşif, sınır ötesi gezgin. Yay yükselen, Jüpiter güçlü, Yaşam Yolu 5 desenleriyle eşleşir.',
  },

  // ÇAKRA
  {
    id: 'chakra-system',
    category: 'chakra',
    term: 'Çakra Nedir?',
    description:
      'Sanskrit dilinde "tekerlek" anlamına gelir. Vücuttaki enerji merkezleridir. 7 ana çakra omurga boyunca sıralanır. Her biri farklı fiziksel, duygusal ve spiritüel alanları yönetir.',
  },
  {
    id: 'chakra-22',
    category: 'chakra',
    term: '22 Çakra Sistemi',
    description:
      '7 ana çakranın ötesinde 15 ek enerji merkezi daha bulunur. Bunlar arasında Yeryüzü Yıldızı, Ruh, Thymus, Orion, Soul Star gibi daha ileri düzey enerji merkezleri yer alır.',
  },

  // BİYORİTM
  {
    id: 'biorhythm-intro',
    category: 'biorhythm',
    term: 'Biyoritm Nedir?',
    description:
      'Doğum tarihinden itibaren başlayan üç döngüsel biyolojik ritimdir. Her döngü sinüs dalgası şeklinde pozitif ve negatif arasında salınır. Değerler -100 ile +100 arasında değişir.',
  },
  {
    id: 'biorhythm-physical',
    category: 'biorhythm',
    term: 'Fiziksel Biyoritm (23 gün)',
    description:
      'Fiziksel enerji, güç, dayanıklılık ve koordinasyonu yansıtır. Pozitif dönemde enerjin yüksek, negatif dönemde dinlenme ihtiyacın artar.',
  },
  {
    id: 'biorhythm-emotional',
    category: 'biorhythm',
    term: 'Duygusal Biyoritm (28 gün)',
    description:
      'Duygusal denge, ruh hali, yaratıcılık ve sezgiyi yansıtır. Pozitif dönemde iyimser ve empatiğin, negatif dönemde hassas ve içe dönüksün.',
  },
  {
    id: 'biorhythm-mental',
    category: 'biorhythm',
    term: 'Zihinsel Biyoritm (33 gün)',
    description:
      'Zihinsel keskinlik, konsantrasyon, hafıza ve analitik düşünme kapasitesini yansıtır.',
  },
];
