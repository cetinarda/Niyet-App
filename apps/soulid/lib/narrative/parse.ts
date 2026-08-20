import type { NarrativeSections } from '../types';

const HEADINGS = {
  opening: ['Açılış'],
  astrology: ['Astroloji', 'Astroloji & Düğümler'],
  humanDesign: ['Human Design', 'Human Design Pusulası'],
  callToAction: ['Görev', 'Görev Çağrısı', 'Çağrı'],
  soulStory: ['Ruhun Hikâyesi', 'Ruh Hikâyesi', 'Soul Story'],
  wisdoms: ['Bilgelik', 'Bilgelikleri', 'Bilgelikler'],
  shadows: ['Gölge', 'Gölgeleri', 'Gölgeler'],
};

type Key = keyof typeof HEADINGS;

function matchKey(line: string): Key | null {
  const clean = line.replace(/^#+\s*/, '').replace(/\*+/g, '').trim().toLowerCase();
  for (const [key, names] of Object.entries(HEADINGS)) {
    if (names.some((n) => clean.startsWith(n.toLowerCase()))) return key as Key;
  }
  return null;
}

function splitBullets(block: string): string[] {
  return block
    .split('\n')
    .map((l) => l.trim().replace(/^[-•*]\s*/, '').trim())
    .filter((l) => l.length > 2 && !l.startsWith('#'));
}

export function parseNarrative(text: string): NarrativeSections {
  const lines = text.split('\n');
  const buckets: Partial<Record<Key, string[]>> = {};
  let current: Key | null = null;

  for (const line of lines) {
    if (line.trim().startsWith('#') || /^\*\*[A-ZÇĞİÖŞÜ]/.test(line.trim())) {
      const k = matchKey(line);
      if (k) {
        current = k;
        if (!buckets[current]) buckets[current] = [];
        continue;
      }
    }
    if (current) {
      if (!buckets[current]) buckets[current] = [];
      buckets[current]!.push(line);
    }
  }

  const get = (k: Key): string => (buckets[k] ?? []).join('\n').trim();

  return {
    opening: get('opening'),
    astrology: get('astrology'),
    humanDesign: get('humanDesign'),
    callToAction: get('callToAction'),
    soulStory: get('soulStory'),
    wisdoms: splitBullets(get('wisdoms')).slice(0, 8),
    shadows: splitBullets(get('shadows')).slice(0, 8),
  };
}

export function isStructured(sections: NarrativeSections): boolean {
  return Boolean(
    sections.opening.length > 20 &&
      sections.soulStory.length > 20 &&
      sections.wisdoms.length >= 3,
  );
}
