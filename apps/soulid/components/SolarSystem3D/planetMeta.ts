// Gerçek dokular jeromeetienne/threex.planets MIT lisanslı kütüphaneden
// jsdelivr CDN üzerinden: başarısız olursa procedural fallback devreye girer.

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images';

export type PlanetVisual = {
  key: string;          // Chart'taki PlanetName ile aynı
  tr: string;
  en: string;
  glyph: string;
  texture: string;
  bumpTexture?: string;
  size: number;         // Görsel boyut (gerçek değil)
  distance: number;     // Earth merkezden uzaklık (görsel)
  color: string;        // Procedural fallback
  hasRing?: boolean;
  domain: string;       // Detayda gösterilen güç alanı
  domainEn: string;     // Same, English (SoulID is tr + en only)
};

export const PLANETS: PlanetVisual[] = [
  {
    key: 'Sun',
    tr: 'Güneş',
    en: 'Sun',
    glyph: '☉',
    texture: `${CDN_BASE}/sunmap.jpg`,
    size: 2.4,
    distance: 0,
    color: '#fdb813',
    domain: 'Benlik, öz kimlik, yaşam enerjisi',
    domainEn: 'Selfhood, core identity, life force',
  },
  {
    key: 'Moon',
    tr: 'Ay',
    en: 'Moon',
    glyph: '☾',
    texture: `${CDN_BASE}/moonmap1k.jpg`,
    bumpTexture: `${CDN_BASE}/moonbump1k.jpg`,
    size: 0.45,
    distance: 2.4,
    color: '#cfcfcf',
    domain: 'Duygular, iç dünya, ruhsal bellek',
    domainEn: 'Feelings, the inner world, the memory of the soul',
  },
  {
    key: 'Mercury',
    tr: 'Merkür',
    en: 'Mercury',
    glyph: '☿',
    texture: `${CDN_BASE}/mercurymap.jpg`,
    bumpTexture: `${CDN_BASE}/mercurybump.jpg`,
    size: 0.55,
    distance: 3.4,
    color: '#9b9b9b',
    domain: 'İletişim, zihin, öğrenme',
    domainEn: 'Communication, the mind, learning',
  },
  {
    key: 'Venus',
    tr: 'Venüs',
    en: 'Venus',
    glyph: '♀',
    texture: `${CDN_BASE}/venusmap.jpg`,
    bumpTexture: `${CDN_BASE}/venusbump.jpg`,
    size: 0.75,
    distance: 4.6,
    color: '#e8c08a',
    domain: 'Sevgi, değer, estetik',
    domainEn: 'Love, values, beauty',
  },
  {
    key: 'Mars',
    tr: 'Mars',
    en: 'Mars',
    glyph: '♂',
    texture: `${CDN_BASE}/marsmap1k.jpg`,
    bumpTexture: `${CDN_BASE}/marsbump1k.jpg`,
    size: 0.65,
    distance: 5.8,
    color: '#d14a35',
    domain: 'Aksiyon, arzu, savaş gücü',
    domainEn: 'Action, desire, fighting spirit',
  },
  {
    key: 'Jupiter',
    tr: 'Jüpiter',
    en: 'Jupiter',
    glyph: '♃',
    texture: `${CDN_BASE}/jupitermap.jpg`,
    size: 1.6,
    distance: 7.4,
    color: '#d8b58a',
    domain: 'Genişleme, anlam, bolluk',
    domainEn: 'Expansion, meaning, abundance',
  },
  {
    key: 'Saturn',
    tr: 'Satürn',
    en: 'Saturn',
    glyph: '♄',
    texture: `${CDN_BASE}/saturnmap.jpg`,
    size: 1.4,
    distance: 9.2,
    color: '#e5d4a3',
    hasRing: true,
    domain: 'Disiplin, yapı, olgunluk',
    domainEn: 'Discipline, structure, maturity',
  },
  {
    key: 'Uranus',
    tr: 'Uranüs',
    en: 'Uranus',
    glyph: '♅',
    texture: `${CDN_BASE}/uranusmap.jpg`,
    size: 1.0,
    distance: 11.0,
    color: '#a3e0e7',
    hasRing: true,
    domain: 'Özgünlük, ani değişim, uyanış',
    domainEn: 'Originality, sudden change, awakening',
  },
  {
    key: 'Neptune',
    tr: 'Neptün',
    en: 'Neptune',
    glyph: '♆',
    texture: `${CDN_BASE}/neptunemap.jpg`,
    size: 1.0,
    distance: 12.6,
    color: '#3f76b8',
    domain: 'Hayal gücü, ilham, çözülme',
    domainEn: 'Imagination, inspiration, dissolving',
  },
  {
    key: 'Pluto',
    tr: 'Pluto',
    en: 'Pluto',
    glyph: '♇',
    texture: `${CDN_BASE}/plutomap1k.jpg`,
    bumpTexture: `${CDN_BASE}/plutobump1k.jpg`,
    size: 0.32,
    distance: 14.0,
    color: '#a07e6b',
    domain: 'Dönüşüm, yeniden doğuş, gölge',
    domainEn: 'Transformation, rebirth, the shadow',
  },
];

export const EARTH = {
  texture: `${CDN_BASE}/earthmap1k.jpg`,
  bump: `${CDN_BASE}/earthbump1k.jpg`,
  cloudTexture: `${CDN_BASE}/earthcloudmap.jpg`,
  size: 1.0,
};

export const SATURN_RING_TEXTURE = `${CDN_BASE}/saturnringcolor.jpg`;
