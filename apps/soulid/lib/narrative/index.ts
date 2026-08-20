import type { GalacticReport, Mission, NarrativeSections } from '../types';
import { SIGN_NAMES_TR } from '../content/astrology-content';
import { LIFE_PATH_MEANINGS, PERSONAL_YEAR_MEANINGS } from '../content/numerology-content';
import { NORTH_NODE_GUIDE, SOUTH_NODE_RELEASE } from '../content/astrology-content';
import { getApiBase } from '../api-base';
import { fetchWithTimeout } from '../fetch-timeout';

function fallbackSections(
  report: Omit<GalacticReport, 'narrative' | 'summary' | 'sections'>,
  locale: 'tr' | 'en' = 'tr',
): NarrativeSections {
  const sun = report.chart.planets.find((p) => p.name === 'Sun')!;
  const moon = report.chart.planets.find((p) => p.name === 'Moon')!;
  const nn = report.chart.planets.find((p) => p.name === 'NorthNode')!;
  const sn = report.chart.planets.find((p) => p.name === 'SouthNode')!;
  const lp = LIFE_PATH_MEANINGS[report.numerology.lifePath];
  const py = PERSONAL_YEAR_MEANINGS[report.numerology.personalYear];
  const s = report.systems;

  const incarnations = 7 + ((report.numerology.lifePath + report.numerology.expression) % 6);

  if (locale === 'en') {
    const sunSign = sun.sign;
    const moonSign = moon.sign;
    const ascSign = report.chart.ascendantSign;
    return {
      opening: `${report.birth.fullName}, you are a star child from the ${report.origin.race} lineage. The ${report.origin.starSystem} gate carries your soul seal; you came to this Earth as ${report.origin.archetype.toLowerCase()}. On the Mayan line you are Kin ${s.maya.kin} — your cosmic tone is the ${toneEn(s.maya.tone.num)}.`,
      astrology: `You carry the light of your ${sunSign} Sun together with the deep intuition of your ${moonSign} Moon and the outer door of your ${ascSign} Rising. On the Vedic line your Moon rests in the ${s.vedic.nakshatra.name} nakshatra — its power is to nurture and protect. Your North Node soul mission unfolds through your ${nn.sign} ${nn.house}th house, and your South Node ${sn.sign} ${sn.house}th house is the comfort to gently release.`,
      humanDesign: `Your Human Design compass tells you that you are a ${report.humanDesign.type}. Your strategy is "${report.humanDesign.strategy}", your authority is ${report.humanDesign.authority}. The ${report.humanDesign.profile} profile is the map of the rhythm you live life in. When you stay true to this trio, the right decisions arise from within.`,
      callToAction: `Life Path ${report.numerology.lifePath} — ${lp?.title}. ${lp?.summary} You are currently in ${py?.title} — a year of: ${py?.theme} Your missions: ${report.missions.map((m: Mission) => m.title).join(' · ')}.`,
      soulStory: `A symbolic reading — this soul has incarnated roughly ${incarnations} times. In previous lives you left a trace through the ${s.tarot.soul.name.toLowerCase()} archetype. You returned to this life with ${s.chinese.element.en.toLowerCase()} element energy and the ${s.chinese.animal.en.toLowerCase()} totem. The reason you came is what your North Node points to: a path of growth in ${nn.sign}. The gift you brought is the medicine of ${s.tarot.personality.name.toLowerCase()}; what you came to experience is the theme of ${lp?.energy?.toLowerCase() ?? lp?.summary?.toLowerCase()}.`,
      wisdoms: [
        `The inner light of your ${sunSign} Sun: you are fed by courage when you express yourself.`,
        `The gift of the ${s.vedic.nakshatra.name} nakshatra: the power to nourish and to protect.`,
        `Your strongest side as a ${report.humanDesign.type}: when you trust your strategy, the universe opens doors for you.`,
        `Your Mayan tone gives you the energy of conscious intent and creative spark.`,
        `Your ${s.tarot.soul.name} soul card is your inner compass.`,
      ],
      shadows: [
        `South Node shadow in ${sn.sign}: a comfort zone that, when overused, pulls you backwards.`,
        `The closing tendency of the ${moonSign} Moon — the risk of suppressing emotions.`,
        `The most common trap for the ${report.humanDesign.type} type: skipping the strategy, getting caught in the "start now" inner voice.`,
        `Life Path ${report.numerology.lifePath} shadow: belittling your talents or pushing them too hard.`,
        `The shadow side of the ${s.tarot.personality.name} card: the inner voice that blocks its medicine.`,
      ],
    };
  }

  return {
    opening: `${report.birth.fullName}, ${report.origin.race} hattından gelen bir yıldız çocuksun. ${report.origin.starSystem} kapısı senin ruhsal mührünü taşıyor; bu Dünya'ya ${report.origin.archetype.toLowerCase()} olarak indin. Maya hattında Kin ${s.maya.kin} — ${s.maya.daySign.tr} — kozmik tonun ${s.maya.tone.tr}.`,
    astrology: `${SIGN_NAMES_TR[sun.sign]} Güneş'in ışığını ${SIGN_NAMES_TR[moon.sign]} Ay'ın derin sezgisi ve ${SIGN_NAMES_TR[report.chart.ascendantSign]} yükselenin dış kapısıyla birlikte taşıyorsun. Vedik hatta Ay'ın ${s.vedic.nakshatra.name} nakshatrasında — ${s.vedic.nakshatra.power}. Kuzey Düğüm ${SIGN_NAMES_TR[nn.sign]} burcunda: ${NORTH_NODE_GUIDE[nn.sign].toLowerCase()} Güney Düğüm ${SIGN_NAMES_TR[sn.sign]}: ${SOUTH_NODE_RELEASE[sn.sign].toLowerCase()}`,
    humanDesign: `Human Design pusulan ${report.humanDesign.type} olduğunu söylüyor. Stratejin "${report.humanDesign.strategy}", otoriten ${report.humanDesign.authority}. ${report.humanDesign.profile} profilin hayatı hangi ritimle yaşayacağının haritasıdır. Bu üçlüye sadık kaldığında doğru kararlar zaten içeriden gelir.`,
    callToAction: `Yaşam Yolu ${report.numerology.lifePath} — ${lp?.title}. ${lp?.summary} Şu an ${py?.title} içindesin: ${py?.theme} Görevlerin: ${report.missions.map((m: Mission) => m.title).join(' · ')}.`,
    soulStory: `Sembolik bir okuma — bu ruh yaklaşık ${incarnations} kez bedenlendi. Önceki yaşamlarda ${s.tarot.soul.name.toLowerCase()} arketipiyle iz bıraktın; ${s.norse.rune.power.toLowerCase()} Bu yaşama ${s.chinese.element.tr.toLowerCase()} enerjisi ve ${s.chinese.animal.tr.toLowerCase()} totemiyle döndün. Geliş sebebin Kuzey Düğümünün gösterdiği şey: ${report.northNodeMessage.toLowerCase()} Armağan olarak ${s.tarot.personality.power.toLowerCase()} getirdin, deneyimlemek için seçtiğin tema ise ${lp?.energy?.toLowerCase() ?? lp?.summary?.toLowerCase()}`,
    wisdoms: [
      `${SIGN_NAMES_TR[sun.sign]} Güneş'inden gelen iç ışık: kendini ifade ederken cesaretten besleniyorsun.`,
      `${s.vedic.nakshatra.name} nakshatrasının armağanı: ${s.vedic.nakshatra.power.toLowerCase()}`,
      `${report.humanDesign.type} olarak en güçlü tarafın: stratejine güvendiğinde evren senin için kapı açar.`,
      `${s.maya.tone.tr} tonu sana ${s.maya.tone.power.toLowerCase()} verir.`,
      `${s.tarot.soul.name} ruh kartın senin öz pusulan: ${s.tarot.soul.power.toLowerCase()}`,
    ],
    shadows: [
      `Güney Düğüm gölgesi: ${SOUTH_NODE_RELEASE[sn.sign].toLowerCase()}`,
      `${SIGN_NAMES_TR[moon.sign]} Ay'ının kapanma eğilimi — duyguları bastırma riski.`,
      `${report.humanDesign.type} tipi için en sık tuzak: stratejiyi atlama, "şimdi başlamak" iç sesine kapılma.`,
      `Yaşam Yolu ${report.numerology.lifePath} gölgesi: yeteneklerini küçümseme ya da fazla zorlama.`,
      `${s.tarot.personality.name} kartının gölge yüzü: ${s.tarot.personality.power.toLowerCase()} gücünü tıkayan iç ses.`,
    ],
  };
}

function toneEn(n: number): string {
  const names = ['', 'Magnetic', 'Lunar', 'Electric', 'Self-Existing', 'Overtone', 'Rhythmic', 'Resonant', 'Galactic', 'Solar', 'Planetary', 'Spectral', 'Crystal', 'Cosmic'];
  return names[n] ?? `Tone ${n}`;
}

function sectionsToNarrative(s: NarrativeSections): string {
  return [
    s.opening,
    s.astrology,
    s.humanDesign,
    s.callToAction,
    s.soulStory,
  ]
    .filter(Boolean)
    .join('\n\n');
}

function buildSummary(report: Omit<GalacticReport, 'narrative' | 'summary' | 'sections'>): string {
  const sun = report.chart.planets.find((p) => p.name === 'Sun')!;
  return `${report.origin.race} · ${SIGN_NAMES_TR[sun.sign]} Güneş · ${SIGN_NAMES_TR[report.chart.ascendantSign]} Yükselen · ${report.humanDesign.type} · Yaşam Yolu ${report.numerology.lifePath}`;
}

export async function generateNarrative(
  report: Omit<GalacticReport, 'narrative' | 'summary' | 'sections'>,
  locale: 'tr' | 'en' = 'tr',
): Promise<{ narrative: string; summary: string; sections: NarrativeSections }> {
  const summary = buildSummary(report);

  try {
    const res = await fetchWithTimeout(`${getApiBase()}/api/ai/narrative`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report, locale }),
    });
    if (!res.ok) {
      const sections = fallbackSections(report, locale);
      return { narrative: sectionsToNarrative(sections), summary, sections };
    }
    const data = (await res.json()) as { sections?: NarrativeSections; useFallback?: boolean };
    if (data.useFallback || !data.sections) {
      const sections = fallbackSections(report, locale);
      return { narrative: sectionsToNarrative(sections), summary, sections };
    }
    return {
      narrative: sectionsToNarrative(data.sections),
      summary,
      sections: data.sections,
    };
  } catch (err) {
    console.warn('[narrative] API failed, using fallback', err);
    const sections = fallbackSections(report, locale);
    return { narrative: sectionsToNarrative(sections), summary, sections };
  }
}
