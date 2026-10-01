// English content for the concept decks (lib/concepts.ts), the share card
// (components/ReportCard.tsx) and the 3D sky (components/SolarSystem3D).
//
// Why a separate file: the Turkish tables (astrology-content.ts,
// numerology-content.ts, lib/systems/*.ts, human-design, galactic) are also
// written INTO stored reports and read by other code, so they must stay as
// they are. These English tables are looked up by STABLE identifiers
// (ZodiacSign, numbers, Maya index, tarot num, rune and nakshatra names, the
// origin race key) only when the locale is 'en'. A missing entry falls back
// to the Turkish string, never to an empty value.
//
// SoulID supports only tr + en (user decision). Do not add other languages.
// Tone: warm and plain, astrology and starseed content told as tradition and
// belief, never as scientific fact.

import type { GalacticReport, HumanDesign, ZodiacSign } from '../types';
import type { StatKey } from '../stats';

export type Locale = 'tr' | 'en';

export const SIGN_NAMES_EN: Record<ZodiacSign, string> = {
  Aries: 'Aries',
  Taurus: 'Taurus',
  Gemini: 'Gemini',
  Cancer: 'Cancer',
  Leo: 'Leo',
  Virgo: 'Virgo',
  Libra: 'Libra',
  Scorpio: 'Scorpio',
  Sagittarius: 'Sagittarius',
  Capricorn: 'Capricorn',
  Aquarius: 'Aquarius',
  Pisces: 'Pisces',
};

export const SIGN_KEYWORDS_EN: Record<ZodiacSign, string> = {
  Aries: 'Courage, new beginnings, a warrior spirit',
  Taurus: 'Abundance, the body, steadiness',
  Gemini: 'Curiosity, conversation, many sides at once',
  Cancer: 'Home, memory, protective love',
  Leo: 'Creativity, the heart, shining on the stage',
  Virgo: 'Service, sensitivity, the inner engineer',
  Libra: 'Balance, beauty, the art of relating',
  Scorpio: 'Transformation, depth, rebirth',
  Sagittarius: 'The search for meaning, wide horizons, higher knowledge',
  Capricorn: 'Structure, authority, the long climb up the mountain',
  Aquarius: 'Originality, the collective, a vision of the future',
  Pisces: 'Dreams, compassion, the place where boundaries dissolve',
};

export const PLANET_NAMES_EN: Record<string, string> = {
  Sun: 'Sun',
  Moon: 'Moon',
  Mercury: 'Mercury',
  Venus: 'Venus',
  Mars: 'Mars',
  Jupiter: 'Jupiter',
  Saturn: 'Saturn',
  Uranus: 'Uranus',
  Neptune: 'Neptune',
  Pluto: 'Pluto',
  NorthNode: 'North Node',
  SouthNode: 'South Node',
  Chiron: 'Chiron',
  Ascendant: 'Ascendant',
  MC: 'MC (Midheaven)',
};

export const PLANET_DOMAINS_EN: Record<string, string> = {
  Sun: 'Selfhood, core identity, life force.',
  Moon: 'Feelings, the inner world, the memory of the soul.',
  Mercury: 'Communication, the mind, the way you learn.',
  Venus: 'Love, values, beauty.',
  Mars: 'Action, desire, fighting spirit.',
  Jupiter: 'Expansion, meaning, abundance.',
  Saturn: 'Discipline, structure, maturity.',
  Uranus: 'Originality, sudden change, awakening.',
  Neptune: 'Imagination, inspiration, dissolving.',
  Pluto: 'Transformation, rebirth, the shadow.',
  NorthNode: 'The soul task for this life (Rahu).',
  SouthNode: 'What past lives left behind, the comfort to let go of (Ketu).',
  Chiron: 'The wounded healer archetype.',
  Ascendant: 'The doorway to the world, the first impression.',
  MC: 'Calling, the mark you leave on the world.',
};

export const NORTH_NODE_GUIDE_EN: Record<ZodiacSign, string> = {
  Aries: 'To come back to yourself with courage, move on your own and step into leadership.',
  Taurus: 'To simplify, root yourself in your body and measure your worth from the inside.',
  Gemini: 'To turn curiosity into wisdom, embrace many voices and become a storyteller.',
  Cancer: 'To trust your feelings, build a home and care for yourself and others with tenderness.',
  Leo: 'To create from the heart, step to the front of the stage and stop hiding your light.',
  Virgo: 'To find the sacred in the details, find meaning through service and build a steady practice for body and soul.',
  Libra: 'To build healthy relationships, practice the art of balance and make room for the other person too.',
  Scorpio: 'To dive deep and be transformed, stop hiding your power and make peace with the shadow.',
  Sagittarius: 'To see the bigger picture, seek meaning and share your vision.',
  Capricorn: 'To step into maturity, take responsibility and keep climbing the mountain.',
  Aquarius: 'To serve the collective, design the future and dare to be unusual.',
  Pisces: 'To surrender to intuition, loosen the edges of the ego and remember unconditional compassion.',
};

export const SOUTH_NODE_RELEASE_EN: Record<ZodiacSign, string> = {
  Aries: 'Letting go of self-centerdness, the impulsive warrior and the habit of always going it alone.',
  Taurus: 'Letting go of comfort addiction, the fear of losing what you own and resistance to change.',
  Gemini: 'Letting go of staying on the surface, scattered attention and needless arguments.',
  Cancer: 'Letting go of clinging, being stuck in the past and the feeling of being the victim.',
  Leo: 'Letting go of seeking approval, drama and the stage that revolves around the ego.',
  Virgo: 'Letting go of perfectionism, constant criticism and excessive worry.',
  Libra: 'Letting go of giving in too easily, erasing yourself for others and putting decisions off.',
  Scorpio: 'Letting go of the need to control, jealousy and obsessive intensity.',
  Sagittarius: 'Letting go of constant escape, preaching and hiding behind big words.',
  Capricorn: 'Letting go of over-control, cold authority and discipline without love.',
  Aquarius: 'Letting go of emotional distance, seeing everyone as the same and aloof superiority.',
  Pisces: 'Letting go of escape, the victim role and losing yourself in having no edges.',
};

export const LIFE_PATH_MEANINGS_EN: Record<number, { title: string; summary: string; energy: string }> = {
  1: {
    title: 'The Leader Soul',
    summary:
      'A leader, independent and pioneering. A brave, determined energy that draws its own path. The number of new ideas and beginnings.',
    energy: 'Initiation · Courage · Originality',
  },
  2: {
    title: 'The Bridge Soul',
    summary:
      'A diplomat, harmonious and sensitive. An intuitive, gentle energy that looks for cooperation and balance. The number of partnership and relationship.',
    energy: 'Harmony · Intuition · Connection',
  },
  3: {
    title: 'The Creative Soul',
    summary:
      'Creative, expressive and joyful. The energy of art, communication and social connection. The number of self-expression and inspiration.',
    energy: 'Expression · Inspiration · Joy',
  },
  4: {
    title: 'The Builder Soul',
    summary:
      'A builder, disciplined and reliable. The energy of order, stability and solid foundations. The number of hard work and endurance.',
    energy: 'Order · Stability · Perseverance',
  },
  5: {
    title: 'The Free Soul',
    summary:
      'A free spirit, adventurous and ever changing. The energy of freedom, travel and experience. The number of change and flexibility.',
    energy: 'Freedom · Adventure · Experience',
  },
  6: {
    title: 'The Healer Soul',
    summary:
      'A caretaker, responsible and harmonious. The energy of family, home and community. The number of love, healing and responsibility.',
    energy: 'Love · Healing · Responsibility',
  },
  7: {
    title: 'The Wise Soul',
    summary:
      'A seeker, mystical and inward looking. The energy of spirituality, analysis and deep thought. The number of wisdom and discovery.',
    energy: 'Wisdom · Spirituality · Turning Inward',
  },
  8: {
    title: 'The Power Soul',
    summary:
      'Powerful, ambitious and accomplished. The energy of material abundance, authority and success. The number of balance and karma.',
    energy: 'Abundance · Authority · Karma',
  },
  9: {
    title: 'The Servant Soul',
    summary:
      'Humanitarian, wise and completing. The energy of universal love, compassion and letting go. The number of service and transformation.',
    energy: 'Compassion · Service · Transformation',
  },
  11: {
    title: 'The Illuminator (Master Number)',
    summary:
      'An intuitive illuminator. The energy of heightened awareness, inspiration and spiritual teaching.',
    energy: 'Vision · Inspiration · Awakening',
  },
  22: {
    title: 'The Master Builder (Master Number)',
    summary:
      'The power to turn great visions into reality. The energy of practical idealism.',
    energy: 'Vision · Structure · Manifestation',
  },
  33: {
    title: 'The Master Teacher (Master Number)',
    summary:
      'The energy of unconditional love, healing and service to all.',
    energy: 'Love · Healing · Service',
  },
};

export const PERSONAL_YEAR_MEANINGS_EN: Record<number, { title: string; theme: string }> = {
  1: { title: 'Year 1', theme: 'A time of new beginnings, of planting seeds.' },
  2: { title: 'Year 2', theme: 'A time of patience, cooperation and waiting.' },
  3: { title: 'Year 3', theme: 'A time of creativity, expression and good company.' },
  4: { title: 'Year 4', theme: 'A time to lay foundations and build order.' },
  5: { title: 'Year 5', theme: 'A time of change, freedom and adventure.' },
  6: { title: 'Year 6', theme: 'A time of responsibility, family and healing.' },
  7: { title: 'Year 7', theme: 'A time of turning inward, study and spirituality.' },
  8: { title: 'Year 8', theme: 'A time of power, achievement and material abundance.' },
  9: { title: 'Year 9', theme: 'A time of completion, release and transformation.' },
};

// Maya Tzolkin: keyed by daySign.index (0..19) and tone.num (1..13).
// Tone names follow the widely used English (Dreamspell) names, the same
// list lib/narrative/index.ts toneEn() uses.
export const MAYA_DAY_SIGNS_EN: Record<number, { name: string; element: string; power: string }> = {
  0: { name: 'Imix (Water Dragon)', element: 'Water', power: 'Birth, the primal waters, creative chaos' },
  1: { name: 'Ik (Wind)', element: 'Air', power: 'Breath, spirit, communication' },
  2: { name: 'Akbal (Night)', element: 'Darkness', power: 'Dreams, the cave, the inner light' },
  3: { name: 'Kan (Seed)', element: 'Earth', power: 'Potential, purpose, the corn' },
  4: { name: 'Chicchan (Serpent)', element: 'Fire', power: 'Life force, kundalini, transformation' },
  5: { name: 'Cimi (World-Bridger)', element: 'Passage', power: 'The threshold of death and birth, a bridge to the ancestors' },
  6: { name: 'Manik (Deer)', element: 'Healing', power: 'The healing hand, shamanic work' },
  7: { name: 'Lamat (Star/Rabbit)', element: 'Venus', power: 'Abundance, art, multiplication' },
  8: { name: 'Muluc (Water)', element: 'Water', power: 'Flow, purification, offering' },
  9: { name: 'Oc (Dog)', element: 'Loyalty', power: 'Love, the faithful companion, the guide' },
  10: { name: 'Chuen (Monkey)', element: 'Art', power: 'Creativity, play, weaving' },
  11: { name: 'Eb (Grass)', element: 'Path', power: 'The human road, destiny' },
  12: { name: 'Ben (Reed)', element: 'Authority', power: 'The bridge builder, universal support' },
  13: { name: 'Ix (Jaguar)', element: 'Magician', power: 'Shamanic power, feminine wisdom' },
  14: { name: 'Men (Eagle)', element: 'Sight', power: 'Vision, a higher perspective' },
  15: { name: 'Cib (Owl/Vulture)', element: 'Wisdom', power: 'The voice of the ancestors' },
  16: { name: 'Caban (Earthquake)', element: 'Synchronicity', power: 'Gaia, navigation, the shaking of the earth' },
  17: { name: 'Etznab (Mirror/Flint)', element: 'Truth', power: 'Endless reflection, the blade' },
  18: { name: 'Cauac (Storm)', element: 'Catalyst', power: 'Cleansing by lightning' },
  19: { name: 'Ahau (Sun/Flower)', element: 'Enlightenment', power: 'Universal fire, unconditional love' },
};

export const MAYA_TONES_EN: Record<number, { name: string; power: string }> = {
  1: { name: 'One · Magnetic', power: 'Intention, the creative spark' },
  2: { name: 'Two · Lunar', power: 'Stabilizing, balance, the dilemma' },
  3: { name: 'Three · Electric', power: 'Activation, service' },
  4: { name: 'Four · Self-Existing', power: 'Form, definition' },
  5: { name: 'Five · Overtone', power: 'Command, the center' },
  6: { name: 'Six · Rhythmic', power: 'Organization, balance' },
  7: { name: 'Seven · Resonant', power: 'Attunement, drawing inward' },
  8: { name: 'Eight · Galactic', power: 'Wholeness, living as an example' },
  9: { name: 'Nine · Solar', power: 'Intention coming true' },
  10: { name: 'Ten · Planetary', power: 'Manifestation' },
  11: { name: 'Eleven · Spectral', power: 'Dissolving, letting go' },
  12: { name: 'Twelve · Crystal', power: 'Cooperation, universality' },
  13: { name: 'Thirteen · Cosmic', power: 'Transcendence, presence' },
};

// Vedic nakshatras: keyed by the (Sanskrit) name stored in the report.
export const NAKSHATRAS_EN: Record<string, { symbol: string; power: string }> = {
  Ashwini: { symbol: "A horse's head", power: 'Swift healing, fresh starts' },
  Bharani: { symbol: 'The yoni, the womb', power: 'Transformation, the threshold of birth and death' },
  Krittika: { symbol: 'A blade or a flame', power: 'The purifying fire, clear sight' },
  Rohini: { symbol: 'A chariot', power: 'Magnetism, abundance, art' },
  Mrigashira: { symbol: "A deer's head", power: 'Searching, curiosity, wandering' },
  Ardra: { symbol: 'A teardrop', power: 'Renewal after the storm, transformation' },
  Punarvasu: { symbol: 'A quiver of arrows', power: 'Return, shining again' },
  Pushya: { symbol: "A cow's udder", power: 'The nourishing protector, spiritual milk' },
  Ashlesha: { symbol: 'A coiled serpent', power: 'Mystical knowledge, hypnosis, depth' },
  Magha: { symbol: 'A throne', power: 'The power of the ancestors, a royal line' },
  'Purva Phalguni': { symbol: 'The front legs of a bed', power: 'Pleasure, creativity, romance' },
  'Uttara Phalguni': { symbol: 'The back legs of a bed', power: 'Bonding, marriage, promises kept' },
  Hasta: { symbol: 'A hand', power: 'Skill, manifestation, craft' },
  Chitra: { symbol: 'A shining jewel', power: 'Beauty, magic, illusion' },
  Swati: { symbol: 'A young shoot swaying in the wind', power: 'Independence, flexibility' },
  Vishakha: { symbol: 'A triumphal arch', power: 'Focus on two goals, rising success' },
  Anuradha: { symbol: 'A lotus', power: 'Friendship, devotion, deep connection' },
  Jyeshtha: { symbol: 'An earring', power: 'The eldest sage, responsibility' },
  Mula: { symbol: 'A bundle of roots', power: 'Pulling up the roots, the search for truth' },
  'Purva Ashadha': { symbol: 'A fan', power: 'An unconquerable spirit, inner fire' },
  'Uttara Ashadha': { symbol: "An elephant's tusk", power: 'Universal principles, the final victory' },
  Shravana: { symbol: 'An ear', power: 'The wisdom of listening, sacred words' },
  Dhanishta: { symbol: 'A drum', power: 'Rhythm, abundance, music' },
  Shatabhisha: { symbol: 'A hundred healers', power: 'Mystery, the secrets of healing, the cosmic waters' },
  'Purva Bhadrapada': { symbol: 'A sword', power: 'A burning vision, spiritual fire' },
  'Uttara Bhadrapada': { symbol: 'The deep seat of the serpent', power: 'Deep stillness, esoteric knowledge' },
  Revati: { symbol: 'A fish', power: 'A gentle farewell, the protective guide' },
};

// Chinese zodiac: keyed by the `en` names already stored in the report.
export const CHINESE_ANIMAL_TRAITS_EN: Record<string, string> = {
  Rat: 'Intelligence, quick understanding, resilience',
  Ox: 'Perseverance, loyalty, quiet strength',
  Tiger: 'Courage, rebellion, protective fire',
  Rabbit: 'Grace, diplomacy, intuition',
  Dragon: 'Charisma, vision, cosmic fire',
  Snake: 'Wisdom, intuitive intelligence, transformation',
  Horse: 'Freedom, movement, passion',
  Goat: 'Art, compassion, imagination',
  Monkey: 'Creative intelligence, flexibility, play',
  Rooster: 'Courage, honesty, keen observation',
  Dog: 'Loyalty, fairness, protection',
  Pig: 'Abundance, sincerity, generosity',
};

export const CHINESE_ELEMENT_POWER_EN: Record<string, string> = {
  Wood: 'Growth, flexible strength, vision',
  Fire: 'Passion, intuition, transforming warmth',
  Earth: 'Stability, nourishment, the center',
  Metal: 'Discipline, precision, clarity',
  Water: 'Wisdom, flow, depth',
};

// Elder Futhark: keyed by rune name.
export const RUNES_EN: Record<string, { meaning: string; power: string }> = {
  Berkano: { meaning: 'Birch', power: 'Birth, growth, feminine protection' },
  Ehwaz: { meaning: 'Horse', power: 'Partnership, movement, loyalty' },
  Mannaz: { meaning: 'Humankind', power: 'Community, the equal bond between you and me' },
  Laguz: { meaning: 'Water', power: 'Intuition, flow, the unconscious' },
  Inguz: { meaning: 'Ing/Fertility', power: 'The seed, the process of manifestation' },
  Dagaz: { meaning: 'Day', power: 'Breakthrough, the dawn of awareness' },
  Othala: { meaning: 'Inheritance', power: 'The ancestral home, roots' },
  Fehu: { meaning: 'Cattle/Wealth', power: 'Abundance, wealth that flows' },
  Uruz: { meaning: 'Wild ox', power: 'Raw strength, untamed health' },
  Thurisaz: { meaning: 'Giant/Thorn', power: 'Protection, a firm boundary' },
  Ansuz: { meaning: 'Odin/Voice', power: 'The sacred word, communication, inspiration' },
  Raidho: { meaning: 'Journey', power: 'Rhythm, the road itself' },
  Kenaz: { meaning: 'Torch', power: 'Inner fire, bringing to light' },
  Gebo: { meaning: 'Gift', power: 'Mutual bond, sacred exchange' },
  Wunjo: { meaning: 'Joy', power: 'Harmony, contentment, delight' },
  Hagalaz: { meaning: 'Hail', power: 'Cleansing through upheaval, cosmic crisis' },
  Nauthiz: { meaning: 'Need', power: 'Turning resistance around, perseverance' },
  Isa: { meaning: 'Ice', power: 'Stillness, reflection, settling' },
  Jera: { meaning: 'Harvest', power: 'Cycles, the right time, patience' },
  Eihwaz: { meaning: 'Yew tree', power: 'The axis of life and death, endurance' },
  Perthro: { meaning: 'Cup/Mystery', power: "Fate, women's wisdom, play" },
  Algiz: { meaning: 'Elk', power: 'Higher protection, a sacred bond' },
  Sowilo: { meaning: 'Sun', power: 'Victory, health, vital light' },
  Tiwaz: { meaning: 'Tyr/Justice', power: 'Honorable struggle, truth' },
};

// Tarot Major Arcana: keyed by card number.
export const TAROT_EN: Record<number, { name: string; power: string }> = {
  0: { name: 'The Fool', power: 'A brave leap, limitless potential' },
  1: { name: 'The Magician', power: 'Manifestation, will, being a channel' },
  2: { name: 'The High Priestess', power: 'Intuition, hidden knowledge, the inner voice' },
  3: { name: 'The Empress', power: 'Fertility, nurturing abundance, art' },
  4: { name: 'The Emperor', power: 'Structure, authority, the protective father' },
  5: { name: 'The Hierophant', power: 'Traditional wisdom, the teacher' },
  6: { name: 'The Lovers', power: 'Choosing with the heart, sacred union' },
  7: { name: 'The Chariot', power: 'Willpower, victory, control' },
  8: { name: 'Strength', power: 'Gentle strength, taming from within' },
  9: { name: 'The Hermit', power: 'Inner light, solitary wisdom' },
  10: { name: 'Wheel of Fortune', power: 'Cycles of change, fate' },
  11: { name: 'Justice', power: 'Balance, truth, cause and effect' },
  12: { name: 'The Hanged Man', power: 'A change of perspective, surrender' },
  13: { name: 'Death', power: 'Transformation, a new birth from an old ending' },
  14: { name: 'Temperance', power: 'Synthesis, alchemy, measure' },
  15: { name: 'The Devil', power: 'Seeing attachments, integrating the shadow' },
  16: { name: 'The Tower', power: 'The fall of false structures, awakening' },
  17: { name: 'The Star', power: 'Hope, cosmic healing, vision' },
  18: { name: 'The Moon', power: 'Illusion, the deep unconscious, dreams' },
  19: { name: 'The Sun', power: 'Pure joy, clear sight, vitality' },
  20: { name: 'Judgement', power: 'The call, remembering, rising up' },
  21: { name: 'The World', power: 'Integration, completion, celebration' },
};

// Human Design ("energy profile"). Strategy is a pure function of type, so
// it is looked up by type (stable), not by the stored Turkish string.
export const HD_TYPE_EN: Record<HumanDesign['type'], string> = {
  Manifestor: 'Manifestor',
  Generator: 'Generator',
  ManifestingGenerator: 'Manifesting Generator',
  Projector: 'Projector',
  Reflector: 'Reflector',
};

export const HD_STRATEGY_EN: Record<HumanDesign['type'], string> = {
  Manifestor: 'Inform, then initiate',
  Generator: 'Wait to respond',
  ManifestingGenerator: 'Respond, then inform quickly',
  Projector: 'Wait for the invitation and recognition',
  Reflector: 'Wait out a lunar cycle',
};

// Keyed by the exact Turkish string lib/human-design computeAuthority returns.
export const HD_AUTHORITY_EN: Record<string, string> = {
  'Ay Dongusu Otoritesi (Lunar)': 'Lunar Authority',
  'Duygusal Otorite (Solar Plexus)': 'Emotional Authority (Solar Plexus)',
  'Sakral Otorite': 'Sacral Authority',
  'Splenik Otorite (Sezgi)': 'Splenic Authority (Intuition)',
  'Ego Otoritesi': 'Ego Authority',
  'Kendini Yansitan Otorite': 'Self-Projected Authority',
  'Mental Yansitici (Cevre)': 'Mental Authority (Environment)',
};

// Keyed by the "x/y" line pair at the start of the stored profile string.
export const HD_PROFILE_EN: Record<string, string> = {
  '1/3': '1/3 Investigator-Martyr',
  '1/4': '1/4 Investigator-Opportunist',
  '2/4': '2/4 Hermit-Opportunist',
  '2/5': '2/5 Hermit-Heretic',
  '3/5': '3/5 Martyr-Heretic',
  '3/6': '3/6 Martyr-Role Model',
  '4/6': '4/6 Opportunist-Role Model',
  '4/1': '4/1 Opportunist-Investigator',
  '5/1': '5/1 Heretic-Investigator',
  '5/2': '5/2 Heretic-Hermit',
  '6/2': '6/2 Role Model-Hermit',
  '6/3': '6/3 Role Model-Martyr',
};

const HD_CROSS_ANGLE_EN: Record<string, string> = {
  'Sag Aci': 'Right Angle Cross',
  'Sol Aci': 'Left Angle Cross',
  'Yan Yana (Juxtaposition)': 'Juxtaposition Cross',
};

// Star origin: keyed by origin.race (the Turkish race name, same key as
// lib/galactic/lore.ts STAR_LORE).
export const STAR_ORIGIN_EN: Record<string, { race: string; starSystem: string; archetype: string }> = {
  'Pleiadyalı': {
    race: 'Pleiadian',
    starSystem: 'The Pleiades star cluster',
    archetype: 'Heart healer, bringer of love',
  },
  Siryan: {
    race: 'Sirian',
    starSystem: 'The Sirius star system',
    archetype: 'Wise teacher, keeper of ancient secrets',
  },
  Arkturian: {
    race: 'Arcturian',
    starSystem: 'Arcturus, in the constellation Boötes',
    archetype: 'Advanced engineer, master of geometry',
  },
  Andromedan: {
    race: 'Andromedan',
    starSystem: 'The Andromeda Galaxy',
    archetype: 'Free explorer, traveler beyond borders',
  },
  Lyran: {
    race: 'Lyran',
    starSystem: 'The constellation Lyra',
    archetype: 'Lion soul, founding creator',
  },
  'Orion Pasaportlu': {
    race: 'Orion Starseed',
    starSystem: "Orion's Belt",
    archetype: 'Master of polarity, integrator of the shadow',
  },
  'Venüsyen': {
    race: 'Venusian',
    starSystem: 'Venus (a higher dimension)',
    archetype: 'Envoy of love and beauty',
  },
  Hadarian: {
    race: 'Hadarian',
    starSystem: 'Beta Centauri / Hadar',
    archetype: 'Carrier of unconditional love, a heart too big for this world',
  },
  Mintakan: {
    race: 'Mintakan',
    starSystem: 'Mintaka / Orion',
    archetype: 'Water soul who remembers a lost paradise',
  },
  'Galaktik Federasyon Elçisi': {
    race: 'Galactic Federation Envoy',
    starSystem: 'Many origins',
    archetype: 'Bridge soul, translator between kinds',
  },
};

/** English race / star system / archetype for a stored (Turkish) origin.race.
 *  Undefined when the race is unknown, so callers fall back to the stored text. */
export function starOriginEn(race: string): { race: string; starSystem: string; archetype: string } | undefined {
  return STAR_ORIGIN_EN[race];
}

/** Race name for display: Turkish as stored, English from the table (falls back to stored). */
export function raceLabel(race: string, locale: Locale): string {
  return locale === 'en' ? STAR_ORIGIN_EN[race]?.race ?? race : race;
}

// Character stats (lib/stats). Keyed by StatKey, the stable stat id that
// calculateStats returns (a Turkish word, never shown in English mode).
export const STAT_EN: Record<StatKey, { name: string; desc: string }> = {
  'Güç': { name: 'Power', desc: 'Leadership, willpower, the courage to act' },
  'Sezgi': { name: 'Intuition', desc: 'Inner guidance, reading symbols, sensing what lies beneath' },
  'Dayanıklılık': { name: 'Endurance', desc: 'Perseverance, putting down roots, building for the long run' },
  'Yaratıcılık': { name: 'Creativity', desc: 'Bringing new forms to life, art, self-expression' },
  'Şefkat': { name: 'Compassion', desc: 'Empathy, embracing love, nurturing others' },
  'Hız': { name: 'Speed', desc: 'Quick understanding, flexibility, many things at once' },
  'Şifa': { name: 'Healing', desc: "Mending, restoring balance, a healer's touch" },
  'Manifestasyon': { name: 'Manifestation', desc: 'Turning a thought into something real' },
  'Bilgelik': { name: 'Wisdom', desc: 'Finding meaning, seeing the bigger picture' },
  'Karizma': { name: 'Charisma', desc: 'Shining on the stage, drawing people in' },
};

export function statName(key: StatKey, locale: Locale): string {
  return locale === 'en' ? STAT_EN[key]?.name ?? key : key;
}

/** English version of report.summary (which is always stored in Turkish):
 *  "Pleiadian · Aries Sun · Leo Rising · Generator · Life Path 7". */
export function summaryLineEn(
  report: Pick<GalacticReport, 'origin' | 'chart' | 'humanDesign' | 'numerology'>,
  withRace = true,
): string {
  const sun = report.chart.planets.find((p) => p.name === 'Sun');
  const parts = [
    withRace ? raceLabel(report.origin.race, 'en') : '',
    sun ? `${SIGN_NAMES_EN[sun.sign]} Sun` : '',
    `${SIGN_NAMES_EN[report.chart.ascendantSign]} Rising`,
    hdTypeEn(report.humanDesign.type),
    `Life Path ${report.numerology.lifePath}`,
  ];
  return parts.filter(Boolean).join(' · ');
}

const TR_SIGN_TO_EN: Record<string, string> = {
  'Koç': 'Aries',
  'Boğa': 'Taurus',
  'İkizler': 'Gemini',
  'Yengeç': 'Cancer',
  'Aslan': 'Leo',
  'Başak': 'Virgo',
  'Terazi': 'Libra',
  'Akrep': 'Scorpio',
  'Yay': 'Sagittarius',
  'Oğlak': 'Capricorn',
  'Kova': 'Aquarius',
  'Balık': 'Pisces',
};

// ── Lookup helpers: always return something, falling back to Turkish ──

export function hdTypeEn(type: HumanDesign['type']): string {
  return HD_TYPE_EN[type] ?? type;
}

export function hdStrategyEn(type: HumanDesign['type'], trFallback: string): string {
  return HD_STRATEGY_EN[type] ?? trFallback;
}

export function hdAuthorityEn(tr: string): string {
  return HD_AUTHORITY_EN[tr] ?? tr;
}

export function hdProfileEn(tr: string): string {
  const m = /^(\d)\/(\d)/.exec(tr);
  if (!m) return tr;
  const key = `${m[1]}/${m[2]}`;
  return HD_PROFILE_EN[key] ?? `${key} Profile`;
}

/** "Sag Aci Hac: 13/7 | 1/2" -> "Right Angle Cross: 13/7 | 1/2" */
export function hdCrossEn(tr: string): string {
  const m = /^(.*?) Hac: (.*)$/.exec(tr);
  if (!m) return tr;
  const angle = HD_CROSS_ANGLE_EN[m[1]!];
  return angle ? `${angle}: ${m[2]}` : tr;
}

/** "Koç 26°40'-Boğa 10°" -> "Aries 26°40'-Taurus 10°" */
export function zodiacRangeEn(tr: string): string {
  return tr.replace(/Koç|Boğa|İkizler|Yengeç|Aslan|Başak|Terazi|Akrep|Yay|Oğlak|Kova|Balık/g, (s) => TR_SIGN_TO_EN[s] ?? s);
}

/** 1 -> "1st", 2 -> "2nd", 11 -> "11th" */
export function ordinalEn(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}
