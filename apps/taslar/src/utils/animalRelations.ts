// Animal ↔ Myth bridging + element-based weekly practice.
// Used by AnimalDetailScreen to deepen the spiritual journey.

import nagualsData from '../data/naguals.json';

type Myth = typeof nagualsData[0];

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function getRelatedMyth(animalId: string, animalElement: string): Myth | null {
  const sameElement = (nagualsData as Myth[]).filter(m => m.element === animalElement);
  const pool = sameElement.length > 0 ? sameElement : (nagualsData as Myth[]);
  if (pool.length === 0) return null;
  return pool[hashId(animalId) % pool.length];
}

const ELEMENT_PRACTICES: Record<string, string> = {
  ateş: 'Bu hafta bir mum yak ve niyetini söyle. Ateşin önünde 3 dakika otur — kararlılığını hisset.',
  su:   'Bu hafta sabah duşunda gözünü kapat. Suyun sesini dinle — bırakman gerekeni akıt.',
  toprak: 'Bu hafta yalın ayak toprağa bas. 5 dakika dur — köklerini hisset, taşıyanı an.',
  hava: 'Bu hafta açık bir pencere bul. Üç derin nefes al — vermek istediğin şeyi nefes ver, almak istediğini nefes al.',
  karanlık: 'Bu hafta gün batımında 10 dakika ışık yakmadan otur. Karanlığa alış — gölgenle tanış.',
};

export function getElementPractice(element: string): string {
  return ELEMENT_PRACTICES[element] || ELEMENT_PRACTICES.toprak;
}
