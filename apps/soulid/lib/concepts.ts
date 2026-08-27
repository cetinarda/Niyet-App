import type { GalacticReport } from './types';
import { LIFE_PATH_MEANINGS, PERSONAL_YEAR_MEANINGS } from './content/numerology-content';
import {
  NORTH_NODE_GUIDE,
  PLANET_DOMAINS,
  SIGN_KEYWORDS,
  SIGN_NAMES_TR,
  SOUTH_NODE_RELEASE,
} from './content/astrology-content';

export type ConceptDeck = {
  kicker: string;
  title: string;
  highlight: string;
  short: string;
  details: { heading: string; body: string }[];
  accent: string;
};

export function buildConceptDecks(report: GalacticReport): ConceptDeck[] {
  const s = report.systems;
  const sun = report.chart.planets.find((p) => p.name === 'Sun')!;
  const moon = report.chart.planets.find((p) => p.name === 'Moon')!;
  const nn = report.chart.planets.find((p) => p.name === 'NorthNode')!;
  const sn = report.chart.planets.find((p) => p.name === 'SouthNode')!;
  const lp = LIFE_PATH_MEANINGS[report.numerology.lifePath];
  const py = PERSONAL_YEAR_MEANINGS[report.numerology.personalYear];

  return [
    {
      kicker: 'BATI ASTROLOJİSİ',
      title: `${SIGN_NAMES_TR[sun.sign]} Güneş · ${SIGN_NAMES_TR[moon.sign]} Ay`,
      highlight: `Yükselen: ${SIGN_NAMES_TR[report.chart.ascendantSign]}`,
      short: `Doğum anında Güneş ${SIGN_NAMES_TR[sun.sign]} burcunda ${sun.degreeInSign.toFixed(1)}°, Ay ${SIGN_NAMES_TR[moon.sign]} burcunda ${moon.degreeInSign.toFixed(1)}°. Yükselen burcun ${SIGN_NAMES_TR[report.chart.ascendantSign]}.`,
      details: [
        {
          heading: 'GÜNEŞ — Öz benlik',
          body: `${PLANET_DOMAINS.Sun} ${SIGN_NAMES_TR[sun.sign]}: ${SIGN_KEYWORDS[sun.sign]}. ${sun.house}. ev bu enerjinin hangi yaşam alanında parladığını gösterir.`,
        },
        {
          heading: 'AY — İçsel iklim',
          body: `${PLANET_DOMAINS.Moon} ${SIGN_NAMES_TR[moon.sign]} Ay'ı duygularını ${SIGN_KEYWORDS[moon.sign].toLowerCase()} renginde yaşar; ${moon.house}. evde beslenir.`,
        },
        {
          heading: 'YÜKSELEN — Dış kapı',
          body: `${SIGN_NAMES_TR[report.chart.ascendantSign]} yükselen, dünyaya açılan ilk maskendir. Karşılaştığın insanlar önce bu yüzü görür: ${SIGN_KEYWORDS[report.chart.ascendantSign]}.`,
        },
      ],
      accent: '#f5d061',
    },
    {
      kicker: 'KUZEY AY DÜĞÜMÜ',
      title: `${SIGN_NAMES_TR[nn.sign]} — Bu Yaşamın Görevi`,
      highlight: `${nn.house}. ev · Rahu`,
      short: `Kuzey Düğüm, ruhsal evrimin yönüdür. ${SIGN_NAMES_TR[nn.sign]} burcunda ve ${nn.house}. evde bu yaşamda hangi temaları kucaklamaya geldiğini söyler.`,
      details: [
        {
          heading: 'GÖREV',
          body: NORTH_NODE_GUIDE[nn.sign],
        },
        {
          heading: 'EV TEMASI',
          body: `${nn.house}. ev, bu gelişimin gündelik hayatta nerede yaşanacağını gösterir. Bu alanda konfor değil büyüme arayacaksın.`,
        },
        {
          heading: 'KÜLTÜREL ARKAPLAN',
          body: 'Vedik gelenekte Kuzey Düğüm "Rahu" — açlık dolu kâşif, ruhun bu yaşamda ulaşmayı seçtiği zirvedir. Zorlukla beraber gelir ama gerçek dönüşüm hep bu yönden çıkar.',
        },
      ],
      accent: '#5bd9a0',
    },
    {
      kicker: 'GÜNEY AY DÜĞÜMÜ',
      title: `${SIGN_NAMES_TR[sn.sign]} — Bırakılacak Konfor`,
      highlight: `${sn.house}. ev · Ketu`,
      short: `Güney Düğüm, geçmiş yaşamlardan getirilen alışkanlıkların yatağıdır. Aşırı kullanıldığında konfor bölgesi, yetersiz kaldığında düşülecek tek nokta.`,
      details: [
        {
          heading: 'BIRAK',
          body: SOUTH_NODE_RELEASE[sn.sign],
        },
        {
          heading: 'KÜLTÜREL ARKAPLAN',
          body: 'Vedik gelenekte Güney Düğüm "Ketu" — ego sınırlarını eritir. Buradaki yeteneklere güvenebilirsin, ama büyüme buradan değil ileriden gelir.',
        },
      ],
      accent: '#c79dff',
    },
    {
      kicker: 'HUMAN DESIGN',
      title: report.humanDesign.type,
      highlight: report.humanDesign.profile,
      short: `${report.humanDesign.type} tipi olarak hayata özgün bir mekaniğin var. Stratejin "${report.humanDesign.strategy}", otoriten ${report.humanDesign.authority}.`,
      details: [
        {
          heading: 'STRATEJİ',
          body: `${report.humanDesign.strategy}. Bu, dünyayla doğru etkileşim kurma şeklin. Stratejinin dışına çıktığında "direnç" hissedersin.`,
        },
        {
          heading: 'OTORİTE',
          body: `${report.humanDesign.authority}. Doğru karar, zihninden değil bu otoriteden gelir. Bedeni dinleme yolun.`,
        },
        {
          heading: 'PROFİL',
          body: `${report.humanDesign.profile} profili, hayatı hangi rolle yaşadığını anlatır. İki rakam = Bilinç (Personality) + Bilinçaltı (Design).`,
        },
        {
          heading: 'ENKARNASYON',
          body: `${report.humanDesign.incarnationCross}. Bu, ruhsal misyonunun temel ekseni.`,
        },
      ],
      accent: '#9c6bff',
    },
    {
      kicker: 'NUMEROLOJİ',
      title: `Yaşam Yolu ${report.numerology.lifePath} — ${lp?.title ?? ''}`,
      highlight: `Kişisel Yıl ${report.numerology.personalYear}`,
      short: lp?.summary ?? '',
      details: [
        {
          heading: 'YAŞAM YOLU',
          body: `${lp?.summary ?? ''} Enerji: ${lp?.energy ?? ''}.`,
        },
        {
          heading: 'İFADE SAYISI',
          body: `İfade ${report.numerology.expression}: dünyayla nasıl anlaşıldığın, doğal yeteneklerinin yönü.`,
        },
        {
          heading: 'RUH ARZUSU',
          body: `Ruh Arzusu ${report.numerology.soulUrge}: derinde ne özlediğin, hangi koşulda gerçekten doyduğun.`,
        },
        {
          heading: 'KİŞİSEL YIL',
          body: `${py?.title ?? ''}: ${py?.theme ?? ''}`,
        },
      ],
      accent: '#f5a261',
    },
    {
      kicker: 'MAYA TZOLKİN',
      title: `Kin ${s.maya.kin} · ${s.maya.daySign.tr}`,
      highlight: s.maya.tone.tr,
      short: `Maya kutsal takviminde ${s.maya.tone.tr} ${s.maya.daySign.tr} — Kin numaran ${s.maya.kin}.`,
      details: [
        {
          heading: 'GÜN MÜHRÜ',
          body: `${s.maya.daySign.tr} — ${s.maya.daySign.power}. Element: ${s.maya.daySign.element}.`,
        },
        {
          heading: 'GALAKTİK TON',
          body: `${s.maya.tone.tr} — ${s.maya.tone.power}.`,
        },
        {
          heading: 'KİN',
          body: `260 günlük Tzolkin döngüsünde Kin ${s.maya.kin}. Bu sayı senin galaktik imzanın benzersiz koordinatı.`,
        },
      ],
      accent: '#ff7ad9',
    },
    {
      kicker: 'VEDİK NAKSHATRA',
      title: s.vedic.nakshatra.name,
      highlight: `Pada ${s.vedic.pada} · ${s.vedic.nakshatra.deity}`,
      short: `Vedik astrolojide Ay'ın bulunduğu 27 nakshatradan biri. Senin ruhun ${s.vedic.nakshatra.name} altında titreşiyor.`,
      details: [
        {
          heading: 'SEMBOL',
          body: s.vedic.nakshatra.symbol,
        },
        {
          heading: 'GÜÇ',
          body: s.vedic.nakshatra.power,
        },
        {
          heading: 'YÖNETEN TANRI',
          body: `${s.vedic.nakshatra.deity} — bu nakshatranın koruyucu enerjisi. Pada ${s.vedic.pada} kişiliğin alt yapısını detaylandırır.`,
        },
        {
          heading: 'EKLİPTİK ARALIK',
          body: s.vedic.nakshatra.range,
        },
      ],
      accent: '#7fffd4',
    },
    {
      kicker: 'ÇİN ZODYAK',
      title: s.chinese.signature,
      highlight: `${s.chinese.element.glyph} ${s.chinese.element.tr} · ${s.chinese.animal.glyph} ${s.chinese.animal.tr}`,
      short: `Çin geleneğinde 12 hayvan × 5 element × Yin/Yang ile 60 yıllık döngü kurar. Sen ${s.chinese.signature.toLowerCase()}sin.`,
      details: [
        {
          heading: 'HAYVAN',
          body: `${s.chinese.animal.tr}: ${s.chinese.animal.traits}.`,
        },
        {
          heading: 'ELEMENT',
          body: `${s.chinese.element.tr}: ${s.chinese.element.power}.`,
        },
        {
          heading: 'YİN / YANG',
          body: `${s.chinese.yinYang} polaritesi. Yang aktif/dışa, Yin alıcı/içe.`,
        },
      ],
      accent: '#ff6b6b',
    },
    {
      kicker: 'NORSE RUNE',
      title: `${s.norse.rune.glyph} ${s.norse.rune.name}`,
      highlight: s.norse.rune.meaning,
      short: `Elder Futhark'ın 24 runundan doğum runun ${s.norse.rune.name} (${s.norse.rune.meaning}).`,
      details: [
        {
          heading: 'GÜÇ',
          body: s.norse.rune.power,
        },
        {
          heading: 'KÜLTÜREL ARKAPLAN',
          body: 'Norse şamanik geleneğinde her rune bir tohum mühürdür. Doğum runu kişinin ham potansiyelini taşır.',
        },
      ],
      accent: '#9dd9ff',
    },
    {
      kicker: 'TAROT DOĞUM KARTI',
      title: `${s.tarot.personality.glyph} ${s.tarot.personality.name}`,
      highlight: `Ruh: ${s.tarot.soul.glyph} ${s.tarot.soul.name}`,
      short: `Doğum tarihinden türetilen Major Arcana kartları. Kişilik = dış maske, Ruh = öz mühür.`,
      details: [
        {
          heading: 'KİŞİLİK KARTI',
          body: `${s.tarot.personality.name} (#${s.tarot.personality.num}): ${s.tarot.personality.power}.`,
        },
        {
          heading: 'RUH KARTI',
          body: `${s.tarot.soul.name} (#${s.tarot.soul.num}): ${s.tarot.soul.power}.`,
        },
        {
          heading: 'YÖNTEM',
          body: 'Mary K. Greer formülü ile doğum tarihinin rakamları toplanır; 21\'in altında Personality, tek hane Soul.',
        },
      ],
      accent: '#c79dff',
    },
    {
      kicker: 'YILDIZ KÖKENİ',
      title: `${report.origin.emoji} ${report.origin.race}`,
      highlight: report.origin.starSystem,
      short: `${report.origin.archetype}.`,
      details: [
        {
          heading: 'ARKETİP',
          body: `${report.origin.race} ruhları ${report.origin.archetype.toLowerCase()} olarak tanınır. Bu Dünya'da bu titreşimi hatırlatmak için indin.`,
        },
        {
          heading: 'KÖKEN SİSTEMİ',
          body: `${report.origin.starSystem} — galaktik haritada referans noktası.`,
        },
      ],
      accent: '#f5d061',
    },
  ];
}
