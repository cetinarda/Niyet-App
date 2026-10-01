import { STAR_LORE, STAR_LORE_INTRO } from './galactic/lore';
import type { GalacticReport, ZodiacSign } from './types';
import { LIFE_PATH_MEANINGS, PERSONAL_YEAR_MEANINGS } from './content/numerology-content';
import {
  NORTH_NODE_GUIDE,
  PLANET_DOMAINS,
  SIGN_KEYWORDS,
  SIGN_NAMES_TR,
  SOUTH_NODE_RELEASE,
} from './content/astrology-content';
import {
  CHINESE_ANIMAL_TRAITS_EN,
  CHINESE_ELEMENT_POWER_EN,
  LIFE_PATH_MEANINGS_EN,
  MAYA_DAY_SIGNS_EN,
  MAYA_TONES_EN,
  NAKSHATRAS_EN,
  NORTH_NODE_GUIDE_EN,
  PERSONAL_YEAR_MEANINGS_EN,
  PLANET_DOMAINS_EN,
  RUNES_EN,
  SIGN_KEYWORDS_EN,
  SIGN_NAMES_EN,
  SOUTH_NODE_RELEASE_EN,
  STAR_ORIGIN_EN,
  TAROT_EN,
  hdAuthorityEn,
  hdCrossEn,
  hdProfileEn,
  hdStrategyEn,
  hdTypeEn,
  ordinalEn,
  zodiacRangeEn,
} from './content/concepts-en';

export type ConceptDeck = {
  kicker: string;
  title: string;
  highlight: string;
  short: string;
  details: { heading: string; body: string }[];
  accent: string;
};

/**
 * Concept decks for the report page. `tr` output is the original Turkish
 * text (unchanged); `en` uses the English tables in content/concepts-en.ts,
 * looked up by stable ids, with a Turkish fallback for any missing entry.
 * SoulID supports only tr + en.
 */
export function buildConceptDecks(report: GalacticReport, locale: 'tr' | 'en' = 'tr'): ConceptDeck[] {
  return locale === 'en' ? buildConceptDecksEn(report) : buildConceptDecksTr(report);
}

function buildConceptDecksTr(report: GalacticReport): ConceptDeck[] {
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
          heading: 'GÜNEŞ: Öz benlik',
          body: `${PLANET_DOMAINS.Sun} ${SIGN_NAMES_TR[sun.sign]}: ${SIGN_KEYWORDS[sun.sign]}. ${sun.house}. ev bu enerjinin hangi yaşam alanında parladığını gösterir.`,
        },
        {
          heading: 'AY: İçsel iklim',
          body: `${PLANET_DOMAINS.Moon} ${SIGN_NAMES_TR[moon.sign]} Ay'ı duygularını ${SIGN_KEYWORDS[moon.sign].toLowerCase()} renginde yaşar; ${moon.house}. evde beslenir.`,
        },
        {
          heading: 'YÜKSELEN: Dış kapı',
          body: `${SIGN_NAMES_TR[report.chart.ascendantSign]} yükselen, dünyaya açılan ilk maskendir. Karşılaştığın insanlar önce bu yüzü görür: ${SIGN_KEYWORDS[report.chart.ascendantSign]}.`,
        },
      ],
      accent: '#f5d061',
    },
    {
      kicker: 'KUZEY AY DÜĞÜMÜ',
      title: `${SIGN_NAMES_TR[nn.sign]}: Bu Yaşamın Görevi`,
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
          body: 'Vedik gelenekte Kuzey Düğüm "Rahu": açlık dolu kâşif, ruhun bu yaşamda ulaşmayı seçtiği zirvedir. Zorlukla beraber gelir ama gerçek dönüşüm hep bu yönden çıkar.',
        },
      ],
      accent: '#5bd9a0',
    },
    {
      kicker: 'GÜNEY AY DÜĞÜMÜ',
      title: `${SIGN_NAMES_TR[sn.sign]}: Bırakılacak Konfor`,
      highlight: `${sn.house}. ev · Ketu`,
      short: `Güney Düğüm, geçmiş yaşamlardan getirilen alışkanlıkların yatağıdır. Aşırı kullanıldığında konfor bölgesi, yetersiz kaldığında düşülecek tek nokta.`,
      details: [
        {
          heading: 'BIRAK',
          body: SOUTH_NODE_RELEASE[sn.sign],
        },
        {
          heading: 'KÜLTÜREL ARKAPLAN',
          body: 'Vedik gelenekte Güney Düğüm "Ketu": ego sınırlarını eritir. Buradaki yeteneklere güvenebilirsin, ama büyüme buradan değil ileriden gelir.',
        },
      ],
      accent: '#c79dff',
    },
    {
      kicker: 'ENERJİ PROFİLİ',
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
      title: `Yaşam Yolu ${report.numerology.lifePath}: ${lp?.title ?? ''}`,
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
      short: `Maya kutsal takviminde ${s.maya.tone.tr} ${s.maya.daySign.tr}: Kin numaran ${s.maya.kin}.`,
      details: [
        {
          heading: 'GÜN MÜHRÜ',
          body: `${s.maya.daySign.tr}: ${s.maya.daySign.power}. Element: ${s.maya.daySign.element}.`,
        },
        {
          heading: 'GALAKTİK TON',
          body: `${s.maya.tone.tr}: ${s.maya.tone.power}.`,
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
          body: `${s.vedic.nakshatra.deity}: bu nakshatranın koruyucu enerjisi. Pada ${s.vedic.pada} kişiliğin alt yapısını detaylandırır.`,
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
          body: `${report.origin.starSystem}: galaktik haritada referans noktası.`,
        },
        // "Andromedan ne demek?" sorusunun cevabı (kullanıcı isteği): Sakin
        // sözlüğündeki anlatının aynısı + geleneğin inanç olduğunu söyleyen not.
        ...(STAR_LORE[report.origin.race]
          ? [
              { heading: 'ANLATILARA GÖRE', body: STAR_LORE[report.origin.race].tr },
              { heading: 'BU BİLGİ NEDİR?', body: STAR_LORE_INTRO.tr },
            ]
          : []),
      ],
      accent: '#f5d061',
    },
  ];
}

/** Lowercase the first letter, except for names (Gaia, Odin...). */
function lowerFirst(text: string): string {
  if (!text || /^(Gaia|Odin|Tyr|Venus)\b/.test(text)) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function buildConceptDecksEn(report: GalacticReport): ConceptDeck[] {
  const s = report.systems;
  const sun = report.chart.planets.find((p) => p.name === 'Sun')!;
  const moon = report.chart.planets.find((p) => p.name === 'Moon')!;
  const nn = report.chart.planets.find((p) => p.name === 'NorthNode')!;
  const sn = report.chart.planets.find((p) => p.name === 'SouthNode')!;
  const asc = report.chart.ascendantSign;

  // Every lookup falls back to the Turkish source when an entry is missing.
  const sign = (z: ZodiacSign) => SIGN_NAMES_EN[z] ?? SIGN_NAMES_TR[z] ?? z;
  const keywords = (z: ZodiacSign) => SIGN_KEYWORDS_EN[z] ?? SIGN_KEYWORDS[z] ?? '';
  const house = (h?: number) => (h ? `${ordinalEn(h)} house` : '');

  const lp = LIFE_PATH_MEANINGS_EN[report.numerology.lifePath] ?? LIFE_PATH_MEANINGS[report.numerology.lifePath];
  const py = PERSONAL_YEAR_MEANINGS_EN[report.numerology.personalYear] ?? PERSONAL_YEAR_MEANINGS[report.numerology.personalYear];

  const hd = report.humanDesign;
  const hdType = hdTypeEn(hd.type);
  const strategy = hdStrategyEn(hd.type, hd.strategy);
  const authority = hdAuthorityEn(hd.authority);
  const profile = hdProfileEn(hd.profile);
  const cross = hdCrossEn(hd.incarnationCross);

  const daySignEn = MAYA_DAY_SIGNS_EN[s.maya.daySign.index];
  const daySign = daySignEn?.name ?? s.maya.daySign.tr;
  const daySignPower = daySignEn?.power ?? s.maya.daySign.power;
  const daySignElement = daySignEn?.element ?? s.maya.daySign.element;
  const toneEn = MAYA_TONES_EN[s.maya.tone.num];
  const tone = toneEn?.name ?? s.maya.tone.tr;
  const tonePower = toneEn?.power ?? s.maya.tone.power;

  const nak = s.vedic.nakshatra;
  const nakEn = NAKSHATRAS_EN[nak.name];

  const animal = s.chinese.animal.en || s.chinese.animal.tr;
  const element = s.chinese.element.en || s.chinese.element.tr;
  const chineseSignature = `${s.chinese.yinYang} ${element} ${animal}`;

  const runeEn = RUNES_EN[s.norse.rune.name];
  const runeMeaning = runeEn?.meaning ?? s.norse.rune.meaning;

  const pCard = s.tarot.personality;
  const sCard = s.tarot.soul;
  const pEn = TAROT_EN[pCard.num];
  const sEn = TAROT_EN[sCard.num];

  const originEn = STAR_ORIGIN_EN[report.origin.race];
  const race = originEn?.race ?? report.origin.race;
  const starSystem = originEn?.starSystem ?? report.origin.starSystem;
  const archetype = originEn?.archetype ?? report.origin.archetype;

  const withHouse = (text: string, h?: number) => (h ? text : '');

  return [
    {
      kicker: 'WESTERN ASTROLOGY',
      title: `${sign(sun.sign)} Sun · ${sign(moon.sign)} Moon`,
      highlight: `Rising: ${sign(asc)}`,
      short: `At the moment you were born, the Sun stood at ${sun.degreeInSign.toFixed(1)}° ${sign(sun.sign)} and the Moon at ${moon.degreeInSign.toFixed(1)}° ${sign(moon.sign)}. Your rising sign is ${sign(asc)}.`,
      details: [
        {
          heading: 'SUN: The core self',
          body: `${PLANET_DOMAINS_EN.Sun ?? ''} In ${sign(sun.sign)}: ${keywords(sun.sign).toLowerCase()}.${withHouse(` Your ${house(sun.house)} shows the area of life where this energy shines.`, sun.house)}`.trim(),
        },
        {
          heading: 'MOON: Your inner climate',
          body: `${PLANET_DOMAINS_EN.Moon ?? ''} A ${sign(moon.sign)} Moon feels everything in the colors of ${sign(moon.sign)}: ${keywords(moon.sign).toLowerCase()}.${withHouse(` It finds its nourishment in your ${house(moon.house)}.`, moon.house)}`.trim(),
        },
        {
          heading: 'RISING: The front door',
          body: `${sign(asc)} rising is the first face you show the world. It is what people meet before they meet the rest of you: ${keywords(asc).toLowerCase()}.`,
        },
      ],
      accent: '#f5d061',
    },
    {
      kicker: 'NORTH NODE',
      title: `${sign(nn.sign)}: This Life's Task`,
      highlight: nn.house ? `${house(nn.house)} · Rahu` : 'Rahu',
      short: `The North Node points the way your soul is growing. In ${sign(nn.sign)}${withHouse(` and your ${house(nn.house)}`, nn.house)}, it speaks of the themes you came to embrace in this life.`,
      details: [
        {
          heading: 'THE TASK',
          body: NORTH_NODE_GUIDE_EN[nn.sign] ?? NORTH_NODE_GUIDE[nn.sign],
        },
        {
          heading: 'HOUSE THEME',
          body: `${nn.house ? `Your ${house(nn.house)}` : 'The house of your North Node'} shows where this growth unfolds in everyday life. In this area, look for growth rather than comfort.`,
        },
        {
          heading: 'CULTURAL BACKGROUND',
          body: 'In the Vedic tradition the North Node is called "Rahu": the hungry explorer, the summit the soul chose to reach in this life. It brings challenges with it, yet real transformation always comes from this direction.',
        },
      ],
      accent: '#5bd9a0',
    },
    {
      kicker: 'SOUTH NODE',
      title: `${sign(sn.sign)}: The Comfort to Release`,
      highlight: sn.house ? `${house(sn.house)} · Ketu` : 'Ketu',
      short: 'The South Node is where the habits you carried over from past lives rest. Leaned on too much, it becomes a comfort zone; when you run short of strength, it is the familiar place you fall back to.',
      details: [
        {
          heading: 'LET GO',
          body: SOUTH_NODE_RELEASE_EN[sn.sign] ?? SOUTH_NODE_RELEASE[sn.sign],
        },
        {
          heading: 'CULTURAL BACKGROUND',
          body: 'In the Vedic tradition the South Node is called "Ketu": it softens the edges of the ego. You can trust the gifts you find here, but your growth comes from what lies ahead, not from here.',
        },
      ],
      accent: '#c79dff',
    },
    {
      kicker: 'ENERGY PROFILE',
      title: hdType,
      highlight: profile,
      short: `As a ${hdType}, you move through life with a design all your own. Your strategy is "${strategy}", and you decide through ${authority}.`,
      details: [
        {
          heading: 'STRATEGY',
          body: `${strategy}. This is how you meet the world so that things flow. When you step away from your strategy, you tend to feel "resistance".`,
        },
        {
          heading: 'AUTHORITY',
          body: `${authority}. Your right decisions come from this authority, not from your mind. It is your way of listening to your body.`,
        },
        {
          heading: 'PROFILE',
          body: `The ${profile} profile describes the role through which you live your life. The two numbers stand for the Conscious (Personality) and the Unconscious (Design).`,
        },
        {
          heading: 'INCARNATION CROSS',
          body: cross ? `${cross}. This is the central axis of your soul's purpose.` : "The incarnation cross is the central axis of your soul's purpose.",
        },
      ],
      accent: '#9c6bff',
    },
    {
      kicker: 'NUMEROLOGY',
      title: `Life Path ${report.numerology.lifePath}: ${lp?.title ?? ''}`,
      highlight: `Personal Year ${report.numerology.personalYear}`,
      short: lp?.summary ?? '',
      details: [
        {
          heading: 'LIFE PATH',
          body: `${lp?.summary ?? ''} Energy: ${lp?.energy ?? ''}.`,
        },
        {
          heading: 'EXPRESSION NUMBER',
          body: `Expression ${report.numerology.expression}: how the world understands you, and the direction your natural talents take.`,
        },
        {
          heading: 'SOUL URGE',
          body: `Soul Urge ${report.numerology.soulUrge}: what you long for deep down, and what leaves you truly fulfilled.`,
        },
        {
          heading: 'PERSONAL YEAR',
          body: `${py?.title ?? ''}: ${lowerFirst(py?.theme ?? '')}`,
        },
      ],
      accent: '#f5a261',
    },
    {
      kicker: 'MAYA TZOLKIN',
      title: `Kin ${s.maya.kin} · ${daySign}`,
      highlight: tone,
      short: `In the sacred Maya calendar your day sign is ${daySign} and your tone is ${tone}. Your Kin number is ${s.maya.kin}.`,
      details: [
        {
          heading: 'DAY SIGN',
          body: `${daySign}: ${lowerFirst(daySignPower)}. Element: ${daySignElement}.`,
        },
        {
          heading: 'GALACTIC TONE',
          body: `${tone}: ${lowerFirst(tonePower)}.`,
        },
        {
          heading: 'KIN',
          body: `Kin ${s.maya.kin} in the 260-day Tzolkin cycle. This number is the unique coordinate of your galactic signature.`,
        },
      ],
      accent: '#ff7ad9',
    },
    {
      kicker: 'VEDIC NAKSHATRA',
      title: nak.name,
      highlight: `Pada ${s.vedic.pada} · ${nak.deity}`,
      short: `In Vedic astrology the Moon at your birth rests in one of 27 nakshatras, the lunar mansions. Your soul vibrates under ${nak.name}.`,
      details: [
        {
          heading: 'SYMBOL',
          body: `${nakEn?.symbol ?? nak.symbol}.`,
        },
        {
          heading: 'POWER',
          body: `${nakEn?.power ?? nak.power}.`,
        },
        {
          heading: 'RULING DEITY',
          body: `${nak.deity}: the guardian energy of this nakshatra. Pada ${s.vedic.pada} adds finer detail to the layers beneath your personality.`,
        },
        {
          heading: 'ECLIPTIC RANGE',
          body: zodiacRangeEn(nak.range),
        },
      ],
      accent: '#7fffd4',
    },
    {
      kicker: 'CHINESE ZODIAC',
      title: chineseSignature,
      highlight: `${s.chinese.element.glyph} ${element} · ${s.chinese.animal.glyph} ${animal}`,
      short: `The Chinese tradition weaves 12 animals, 5 elements and Yin/Yang into a 60-year cycle. You are a ${chineseSignature}.`,
      details: [
        {
          heading: 'ANIMAL',
          body: `${animal}: ${lowerFirst(CHINESE_ANIMAL_TRAITS_EN[s.chinese.animal.en] ?? s.chinese.animal.traits)}.`,
        },
        {
          heading: 'ELEMENT',
          body: `${element}: ${lowerFirst(CHINESE_ELEMENT_POWER_EN[s.chinese.element.en] ?? s.chinese.element.power)}.`,
        },
        {
          heading: 'YIN / YANG',
          body: `${s.chinese.yinYang} polarity. Yang is active and turned outward, Yin is receptive and turned inward.`,
        },
      ],
      accent: '#ff6b6b',
    },
    {
      kicker: 'NORSE RUNE',
      title: `${s.norse.rune.glyph} ${s.norse.rune.name}`,
      highlight: runeMeaning,
      short: `Of the 24 runes of the Elder Futhark, your birth rune is ${s.norse.rune.name} (${runeMeaning}).`,
      details: [
        {
          heading: 'POWER',
          body: `${runeEn?.power ?? s.norse.rune.power}.`,
        },
        {
          heading: 'CULTURAL BACKGROUND',
          body: 'In the Norse shamanic tradition every rune is a seed, a seal. Your birth rune holds your raw potential.',
        },
      ],
      accent: '#9dd9ff',
    },
    {
      kicker: 'TAROT BIRTH CARDS',
      title: `${pCard.glyph} ${pEn?.name ?? pCard.name}`,
      highlight: `Soul: ${sCard.glyph} ${sEn?.name ?? sCard.name}`,
      short: 'Major Arcana cards drawn from your date of birth. Personality is the outer mask, Soul is the inner seal.',
      details: [
        {
          heading: 'PERSONALITY CARD',
          body: `${pEn?.name ?? pCard.name} (#${pCard.num}): ${lowerFirst(pEn?.power ?? pCard.power)}.`,
        },
        {
          heading: 'SOUL CARD',
          body: `${sEn?.name ?? sCard.name} (#${sCard.num}): ${lowerFirst(sEn?.power ?? sCard.power)}.`,
        },
        {
          heading: 'METHOD',
          body: "Following Mary K. Greer's method, the digits of your birth date are added together. Reduced to 21 or below, the total gives your Personality card; reduced to a single digit, it gives your Soul card.",
        },
      ],
      accent: '#c79dff',
    },
    {
      kicker: 'STAR ORIGIN',
      title: `${report.origin.emoji} ${race}`,
      highlight: starSystem,
      short: `${archetype}.`,
      details: [
        {
          heading: 'ARCHETYPE',
          body: `In starseed lore, the ${race} archetype is the ${archetype.toLowerCase()}. You are said to have come to Earth to help others remember this vibration.`,
        },
        {
          heading: 'ORIGIN SYSTEM',
          body: `${starSystem}: your point of reference on the galactic map.`,
        },
        ...(STAR_LORE[report.origin.race]
          ? [
              { heading: 'WHAT THE STORIES SAY', body: STAR_LORE[report.origin.race].en },
              { heading: 'WHAT IS THIS?', body: STAR_LORE_INTRO.en },
            ]
          : []),
      ],
      accent: '#f5d061',
    },
  ];
}
