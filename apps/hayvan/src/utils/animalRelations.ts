// Animal ↔ Myth bridging + element-based weekly practice.
// Used by AnimalDetailScreen to deepen the spiritual journey.

import nagualsData from '../data/naguals.json';

type Myth = typeof nagualsData[0];

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const ELEMENT_TO_TR: Record<string, string> = {
  fire: 'ateş', water: 'su', earth: 'toprak', air: 'hava', darkness: 'karanlık',
  feuer: 'ateş', wasser: 'su', erde: 'toprak', luft: 'hava', dunkelheit: 'karanlık',
  fuego: 'ateş', agua: 'su', tierra: 'toprak', aire: 'hava', oscuridad: 'karanlık',
  feu: 'ateş', eau: 'su', terre: 'toprak', ténèbres: 'karanlık',
  fogo: 'ateş', água: 'su', 'terra': 'toprak', ar: 'hava', escuridão: 'karanlık',
  ateş: 'ateş', su: 'su', toprak: 'toprak', hava: 'hava', karanlık: 'karanlık',
};

function resolveElement(element: string): string {
  return ELEMENT_TO_TR[element.toLowerCase()] || element;
}

export function getRelatedMyth(animalId: string, animalElement: string): Myth | null {
  const trElement = resolveElement(animalElement);
  const sameElement = (nagualsData as Myth[]).filter(m => m.element === trElement);
  const pool = sameElement.length > 0 ? sameElement : (nagualsData as Myth[]);
  if (pool.length === 0) return null;
  return pool[hashId(animalId) % pool.length];
}

const ELEMENT_PRACTICES: Record<string, Record<string, string>> = {
  ateş: {
    tr: 'Bu hafta bir mum yak ve niyetini söyle. Ateşin önünde 3 dakika otur — kararlılığını hisset.',
    en: 'This week, light a candle and speak your intention. Sit before the flame for 3 minutes — feel your resolve.',
    de: 'Zünde diese Woche eine Kerze an und sprich deine Absicht aus. Sitze 3 Minuten vor der Flamme — spüre deine Entschlossenheit.',
    es: 'Esta semana, enciende una vela y di tu intención. Siéntate 3 minutos frente a la llama — siente tu determinación.',
    pt: 'Esta semana, acende uma vela e diz a tua intenção. Senta-te 3 minutos diante da chama — sente a tua determinação.',
    fr: 'Cette semaine, allume une bougie et énonce ton intention. Assieds-toi 3 minutes devant la flamme — ressens ta détermination.',
    ja: '今週、ろうそくを灯して意図を声にしなさい。炎の前に3分間座り、決意を感じなさい。',
  },
  su: {
    tr: 'Bu hafta sabah duşunda gözünü kapat. Suyun sesini dinle — bırakman gerekeni akıt.',
    en: 'This week, close your eyes during your morning shower. Listen to the water — let go of what you need to release.',
    de: 'Schließe diese Woche unter der Morgendusche die Augen. Höre dem Wasser zu — lass los, was du loslassen musst.',
    es: 'Esta semana, cierra los ojos en la ducha matutina. Escucha el agua — deja fluir lo que necesitas soltar.',
    pt: 'Esta semana, fecha os olhos durante o duche matinal. Ouve a água — deixa fluir o que precisas de largar.',
    fr: 'Cette semaine, ferme les yeux sous la douche matinale. Écoute l\'eau — laisse couler ce que tu dois relâcher.',
    ja: '今週、朝のシャワーで目を閉じなさい。水の音を聴き、手放すべきものを流しなさい。',
  },
  toprak: {
    tr: 'Bu hafta yalın ayak toprağa bas. 5 dakika dur — köklerini hisset, taşıyanı an.',
    en: 'This week, stand barefoot on the earth. Stay for 5 minutes — feel your roots, remember what carries you.',
    de: 'Stell dich diese Woche barfuß auf die Erde. Bleib 5 Minuten — spüre deine Wurzeln, erinnere dich an das, was dich trägt.',
    es: 'Esta semana, pisa la tierra descalzo. Quédate 5 minutos — siente tus raíces, recuerda lo que te sostiene.',
    pt: 'Esta semana, pisa a terra descalço. Fica 5 minutos — sente as tuas raízes, lembra o que te sustenta.',
    fr: 'Cette semaine, pose tes pieds nus sur la terre. Reste 5 minutes — sens tes racines, rappelle-toi ce qui te porte.',
    ja: '今週、裸足で大地に立ちなさい。5分間そこにいて、根を感じ、自分を支えるものを思い出しなさい。',
  },
  hava: {
    tr: 'Bu hafta açık bir pencere bul. Üç derin nefes al — vermek istediğin şeyi nefes ver, almak istediğini nefes al.',
    en: 'This week, find an open window. Take three deep breaths — exhale what you wish to release, inhale what you wish to receive.',
    de: 'Finde diese Woche ein offenes Fenster. Atme dreimal tief — atme aus, was du loslassen willst, atme ein, was du empfangen willst.',
    es: 'Esta semana, encuentra una ventana abierta. Toma tres respiraciones profundas — exhala lo que deseas soltar, inhala lo que deseas recibir.',
    pt: 'Esta semana, encontra uma janela aberta. Faz três respirações profundas — expira o que desejas largar, inspira o que desejas receber.',
    fr: 'Cette semaine, trouve une fenêtre ouverte. Prends trois profondes respirations — expire ce que tu veux relâcher, inspire ce que tu veux recevoir.',
    ja: '今週、開いた窓を見つけなさい。深呼吸を三回——手放したいものを吐き出し、受け取りたいものを吸い込みなさい。',
  },
  karanlık: {
    tr: 'Bu hafta gün batımında 10 dakika ışık yakmadan otur. Karanlığa alış — gölgenle tanış.',
    en: 'This week, sit for 10 minutes at sunset without turning on a light. Get used to the dark — meet your shadow.',
    de: 'Sitze diese Woche 10 Minuten bei Sonnenuntergang, ohne Licht einzuschalten. Gewöhne dich an die Dunkelheit — begegne deinem Schatten.',
    es: 'Esta semana, siéntate 10 minutos al atardecer sin encender la luz. Acostúmbrate a la oscuridad — conoce tu sombra.',
    pt: 'Esta semana, senta-te 10 minutos ao pôr do sol sem acender a luz. Habitua-te à escuridão — conhece a tua sombra.',
    fr: 'Cette semaine, assieds-toi 10 minutes au coucher du soleil sans allumer de lumière. Habitue-toi à l\'obscurité — rencontre ton ombre.',
    ja: '今週、日没に10分間、明かりをつけずに座りなさい。暗闇に慣れ、自分の影と出会いなさい。',
  },
};

export function getElementPractice(element: string, lang: string = 'tr'): string {
  const trElement = resolveElement(element);
  const texts = ELEMENT_PRACTICES[trElement] || ELEMENT_PRACTICES.toprak;
  return texts[lang] || texts.en || texts.tr;
}
