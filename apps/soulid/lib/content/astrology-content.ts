import type { ZodiacSign } from '../types';

export const SIGN_NAMES_TR: Record<ZodiacSign, string> = {
  Aries: 'Koç',
  Taurus: 'Boğa',
  Gemini: 'İkizler',
  Cancer: 'Yengeç',
  Leo: 'Aslan',
  Virgo: 'Başak',
  Libra: 'Terazi',
  Scorpio: 'Akrep',
  Sagittarius: 'Yay',
  Capricorn: 'Oğlak',
  Aquarius: 'Kova',
  Pisces: 'Balık',
};

export const SIGN_GLYPHS: Record<ZodiacSign, string> = {
  Aries: '♈',
  Taurus: '♉',
  Gemini: '♊',
  Cancer: '♋',
  Leo: '♌',
  Virgo: '♍',
  Libra: '♎',
  Scorpio: '♏',
  Sagittarius: '♐',
  Capricorn: '♑',
  Aquarius: '♒',
  Pisces: '♓',
};

export const SIGN_ELEMENTS: Record<ZodiacSign, 'Ateş' | 'Toprak' | 'Hava' | 'Su'> = {
  Aries: 'Ateş',
  Leo: 'Ateş',
  Sagittarius: 'Ateş',
  Taurus: 'Toprak',
  Virgo: 'Toprak',
  Capricorn: 'Toprak',
  Gemini: 'Hava',
  Libra: 'Hava',
  Aquarius: 'Hava',
  Cancer: 'Su',
  Scorpio: 'Su',
  Pisces: 'Su',
};

export const SIGN_KEYWORDS: Record<ZodiacSign, string> = {
  Aries: 'Cesaret, başlangıç, savaşçı ruh',
  Taurus: 'Bolluk, beden, sebat',
  Gemini: 'Merak, iletişim, çoğullaşma',
  Cancer: 'Yuva, hafıza, koruyucu sevgi',
  Leo: 'Yaratıcılık, kalp, sahnede parlamak',
  Virgo: 'Hizmet, hassasiyet, içsel mühendis',
  Libra: 'Denge, estetik, ilişki sanatı',
  Scorpio: 'Dönüşüm, derinlik, yeniden doğuş',
  Sagittarius: 'Anlam arayışı, ufuk, yüksek bilgi',
  Capricorn: 'Yapı, otorite, dağa tırmanış',
  Aquarius: 'Özgünlük, kolektif, gelecek vizyonu',
  Pisces: 'Rüya, şefkat, sınırların eridiği yer',
};

export const PLANET_NAMES_TR: Record<string, string> = {
  Sun: 'Güneş',
  Moon: 'Ay',
  Mercury: 'Merkür',
  Venus: 'Venüs',
  Mars: 'Mars',
  Jupiter: 'Jüpiter',
  Saturn: 'Satürn',
  Uranus: 'Uranüs',
  Neptune: 'Neptün',
  Pluto: 'Pluto',
  NorthNode: 'Kuzey Ay Düğümü',
  SouthNode: 'Güney Ay Düğümü',
  Chiron: 'Şiron',
  Ascendant: 'Yükselen',
  MC: 'MC (Tepe Noktası)',
};

export const PLANET_DOMAINS: Record<string, string> = {
  Sun: 'Benlik, öz kimlik, yaşam enerjisi',
  Moon: 'Duygular, iç dünya, ruhsal bellek',
  Mercury: 'İletişim, zihin, öğrenme stili',
  Venus: 'Sevgi, değer, estetik',
  Mars: 'Aksiyon, arzu, savaş gücü',
  Jupiter: 'Genişleme, anlam, bolluk',
  Saturn: 'Disiplin, yapı, olgunluk',
  Uranus: 'Özgünlük, ani değişim, uyanış',
  Neptune: 'Hayal gücü, ilham, çözülme',
  Pluto: 'Dönüşüm, yeniden doğuş, gölge',
  NorthNode: 'Bu yaşam için ruhsal görev (Rahu)',
  SouthNode: 'Geçmiş yaşam tortusu, terk edilmesi gereken konfor (Ketu)',
  Chiron: 'Yaralı şifacı arketipi',
  Ascendant: 'Dünyaya açılan kapı, ilk izlenim',
  MC: 'Mesleki kader, dünyaya bırakılan iz',
};

export const NORTH_NODE_GUIDE: Record<ZodiacSign, string> = {
  Aries: 'Cesaretle kendine dönmek, bağımsız hareket etmek ve liderliği üstlenmek.',
  Taurus: 'Sadeleşmek, bedeninde köklenmek, kendi değerini içeriden ölçmek.',
  Gemini: 'Merakı bilgeliğe çevirmek, çoğulluğu kucaklamak, anlatıcı olmak.',
  Cancer: 'Duygulara güvenmek, yuva kurmak, kendine ve başkalarına şefkatle bakım sunmak.',
  Leo: 'Kalbinden yaratmak, sahnenin önüne çıkmak, ışığını saklamamak.',
  Virgo: 'Detayda kutsalı görmek, hizmetle anlam bulmak, beden-ruh disiplinini kurmak.',
  Libra: 'Sağlıklı ilişkiler kurmak, denge sanatı, başkasının da yerini görmek.',
  Scorpio: 'Derine dalıp dönüşmek, gücünü gizlememek, gölgeyle uzlaşmak.',
  Sagittarius: 'Büyük resmi görmek, anlam aramak, vizyonunu yaymak.',
  Capricorn: 'Olgunluğa adım atmak, sorumluluk almak, dağa tırmanmak.',
  Aquarius: 'Kolektife hizmet etmek, geleceği tasarlamak, sıra dışı olmaya cesaret etmek.',
  Pisces: 'Sezgiye teslim olmak, ego sınırlarını gevşetmek, koşulsuz şefkati hatırlamak.',
};

export const SOUTH_NODE_RELEASE: Record<ZodiacSign, string> = {
  Aries: 'Bencillik, dürtüsel savaşçılık ve sürekli yalnız ilerleme alışkanlığını bırakmak.',
  Taurus: 'Konfor bağımlılığı, sahiplenme korkusu ve değişime direnci bırakmak.',
  Gemini: 'Yüzeysel kalmak, sürekli dağılan dikkat ve gereksiz tartışmaları bırakmak.',
  Cancer: 'Aşırı bağlanma, geçmişe takılma ve kendini kurban hissi bırakmak.',
  Leo: 'Onay aramak, drama ve ego merkezli sahneyi bırakmak.',
  Virgo: 'Mükemmeliyetçilik, sürekli eleştiri ve aşırı kaygıyı bırakmak.',
  Libra: 'Hoşgörüden taviz, kendini başkası için silmek ve karar erteleme alışkanlığını bırakmak.',
  Scorpio: 'Kontrol manyaklığı, kıskançlık ve takıntılı yoğunluğu bırakmak.',
  Sagittarius: 'Sürekli kaçış, vaaz vermek ve büyük laflar ardına sığınmayı bırakmak.',
  Capricorn: 'Aşırı kontrol, soğuk otorite ve sevgisiz disiplini bırakmak.',
  Aquarius: 'Duygusal kopukluk, herkesi aynı görme ve kibirli mesafeyi bırakmak.',
  Pisces: 'Kaçış, kurban rolü ve sınırsızlığa kaybolmayı bırakmak.',
};
